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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
