require("dotenv").config();
const express = require("express");
const axios = require("axios");
const path = require("path");
const CryptoJS = require("crypto-js");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000; 
const upload = multer({ storage: multer.memoryStorage() });
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Middleware pour journaliser les requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  if (req.method === "POST" || req.method === "PUT") {
    console.log("Body:", req.body);
  }
  next();
});

const secretPassphrase = process.env.SECRET_PASSPHRASE;

const conversationsFile = path.join(__dirname, "conversations.json");
const conversations = loadConversations();

function loadConversations() {
  if (fs.existsSync(conversationsFile)) {
    const fileContent = fs.readFileSync(conversationsFile, "utf8");
    try {
      return JSON.parse(fileContent);
    } catch (e) {
      console.error("Error parsing conversations file:", e);
      return {};
    }
  }
  return {};
}

function saveConversations() {
  fs.writeFile(conversationsFile, JSON.stringify(conversations), (err) => {
    if (err) {
      console.error("Error writing conversations file:", err);
    }
  });
}

app.post("/api/openai", async (req, res) => {
  try {
    const { apiKey, model, prompt, chatId } = req.body;

    // Déchiffrement du prompt
    const decryptedApiKey = CryptoJS.AES.decrypt(
      apiKey,
      secretPassphrase
    ).toString(CryptoJS.enc.Utf8);
    const decryptedModel = CryptoJS.AES.decrypt(
      model,
      secretPassphrase
    ).toString(CryptoJS.enc.Utf8);
    const decryptedPrompt = CryptoJS.AES.decrypt(
      prompt,
      secretPassphrase
    ).toString(CryptoJS.enc.Utf8);
    const decryptedChatId = CryptoJS.AES.decrypt(
      chatId,
      secretPassphrase
    ).toString(CryptoJS.enc.Utf8);
    // Initialize the conversation if not already present
    if (!conversations[decryptedChatId]) {
      conversations[decryptedChatId] = [];
    }
    // Add the user's prompt to the conversation
    conversations[decryptedChatId].push({
      role: "user",
      content: decryptedPrompt,
    });

    // Appel à l'API OpenAI avec le prompt déchiffré
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: decryptedModel,
        messages: conversations[decryptedChatId],
      },
      {
        headers: {
          Authorization: `Bearer ${decryptedApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Chiffrement de la réponse de l'API
    const encryptedResponse = CryptoJS.AES.encrypt(
      response.data.choices[0].message.content,
      secretPassphrase
    ).toString();

    // Add the bot's response to the conversation
    conversations[decryptedChatId].push({
      role: "assistant",
      content: response.data.choices[0].message.content,
    });

    saveConversations(); // Sauvegarder les changements dans le fichier

    // Envoyer la réponse chiffrée au frontend
    res.json({ encryptedResponse });
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API OpenAI : ", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/claude", async (req, res) => {
  try {
    const { apiKey, model, prompt, chatId } = req.body;

    // Decrypt the inputs
    const decryptedApiKey = CryptoJS.AES.decrypt(
      apiKey,
      secretPassphrase
    ).toString(CryptoJS.enc.Utf8);
    const decryptedModel = CryptoJS.AES.decrypt(
      model,
      secretPassphrase
    ).toString(CryptoJS.enc.Utf8);
    const decryptedPrompt = CryptoJS.AES.decrypt(
      prompt,
      secretPassphrase
    ).toString(CryptoJS.enc.Utf8);
    const decryptedChatId = CryptoJS.AES.decrypt(
      chatId,
      secretPassphrase
    ).toString(CryptoJS.enc.Utf8);

    // Initialize the conversation if not already present
    if (!conversations[decryptedChatId]) {
      conversations[decryptedChatId] = [];
    }
    // Add the user's prompt to the conversation
    conversations[decryptedChatId].push({
      role: "user",
      content: decryptedPrompt,
    });

    // Call the Claude API
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: decryptedModel,
        max_tokens: 1024,
        messages: conversations[decryptedChatId],
      },
      {
        headers: {
          "x-api-key": decryptedApiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
      }
    );

    console.log("Claude API raw response:", response.data);

    const claudeResponseText = response.data.content[0]?.text || "No response";

    const encryptedResponse = CryptoJS.AES.encrypt(
      claudeResponseText,
      secretPassphrase
    ).toString();

    conversations[decryptedChatId].push({
      role: "assistant",
      content: claudeResponseText,
    });

    saveConversations();

    res.json({ encryptedResponse });
  } catch (error) {
    console.error("Error calling the Claude API: ", error);
    
    let errorMessage = "Une erreur s'est produite lors de l'appel à l'API Claude.";
    
    // Extraire le message d'erreur des détails de la réponse, si disponible
    if (error.response && error.response.data && error.response.data.error) {
      const apiError = error.response.data.error;
      console.error("Claude API error details:", error.response.data);
      
      // Personnaliser le message d'erreur en fonction du type d'erreur
      if (apiError.type === "invalid_request_error" && apiError.message.includes("credit balance is too low")) {
        errorMessage = "Votre solde de crédits est trop faible pour accéder à l'API Claude. Veuillez recharger votre compte ou utiliser une autre clé API.";
      } else {
        errorMessage = apiError.message || errorMessage;
      }
    }
    
    // Envoyer le message d'erreur personnalisé au frontend
    res.status(500).json({ error: errorMessage });
  }
});

// Vérifier le chemin de l'API Claude
app.get("/api/claude-check", (req, res) => {
  res.json({ status: "Claude API endpoint is working" });
});

// Middleware pour journaliser les routes disponibles
app.use((req, res, next) => {
  console.log("Available routes:", app._router.stack
    .filter(r => r.route)
    .map(r => ({ path: r.route.path, methods: Object.keys(r.route.methods) })));
  next();
});

app.get("/images", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "imageExtraction.html"));
});

app.post("/extract-text", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucune image n'a été téléchargée." });
  }

  try {
    const {
      data: { text },
    } = await Tesseract.recognize(req.file.buffer, "eng");
    res.json({ text });
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.error("Rate limit exceeded. Retrying...");
      // Optionally, implement a retry mechanism with delay
      res
        .status(429)
        .json({ error: "Rate limit exceeded. Please try again later." });
    } else {
      console.error(
        "Erreur lors de l'appel à l'API OpenAI : ",
        error.response ? error.response.data : error.message
      );
      res.status(500).json({ error: error.message });
    }
  }
});

app.delete("/clear-chat/:chatId", (req, res) => {
  const chatId = req.params.chatId;
  if (conversations[chatId]) {
    conversations[chatId] = []; // Effacer le contenu de la conversation
    saveConversations(); // Sauvegarder les changements dans le fichier
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: "Chat not found" });
  }
});

app.get("/api/restoreChat/:uuid", (req, res) => {
  const { uuid } = req.params;
  const conversation = conversations[uuid];
  if (conversation) {
    res.json({ success: true, conversation });
  } else {
    res.status(404).json({ success: false, error: "Conversation not found" });
  }
});

// Middleware pour gérer les erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is in use. Trying another port...`);
    server.listen(0); // Utilise un port disponible automatiquement
  }
});
