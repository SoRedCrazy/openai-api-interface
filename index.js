require("dotenv").config();
const express = require("express");
const axios = require("axios");
const path = require("path");
const CryptoJS = require("crypto-js");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const fs = require("fs");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
const port = process.env.PORT || 3000; 
const upload = multer({ storage: multer.memoryStorage() });
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Add static middleware for serving Swagger UI assets
app.use('/api-docs/swagger-ui', express.static(
  path.join(__dirname, 'node_modules/swagger-ui-dist'),
  { maxAge: '30d' }
));

// Configuration Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API gpt interface',
      version: '1.0.0',
      description: 'api gateway gpt interface',
    },
    servers: [
      {
        url: `https://gpt.bdev.online`,
        description: "Serveur de développement"
      }
    ]
  },
  apis: ["./index.js"],
  swaggerOptions: {
    // Disable trying to validate against schema to avoid additional requests
    validatorUrl: null,
    // Use local assets to avoid HTTP/2 issues with CDN
    url: "/api-docs/swagger.json"
  }
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Route pour accéder à la documentation Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
  }
}));

// Add route to serve swagger.json separately to avoid HTTP2 issues
app.get('/api-docs/swagger.json', (req, res) => {
  res.json(swaggerDocs);
});

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

// Fonction pour générer un UUID unique
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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

/**
 * @swagger
 * /api/openai:
 *   post:
 *     summary: Envoyer une requête à l'API OpenAI
 *     description: Envoie un prompt chiffré à l'API OpenAI et retourne la réponse chiffrée
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - apiKey
 *               - model
 *               - prompt
 *               - chatId
 *             properties:
 *               apiKey:
 *                 type: string
 *                 description: Clé API OpenAI chiffrée
 *               model:
 *                 type: string
 *                 description: Modèle OpenAI chiffré (ex. gpt-4, gpt-3.5-turbo)
 *               prompt:
 *                 type: string
 *                 description: Prompt utilisateur chiffré
 *               chatId:
 *                 type: string
 *                 description: Identifiant unique de la conversation chiffré
 *     responses:
 *       200:
 *         description: Réponse de l'API OpenAI chiffrée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 encryptedResponse:
 *                   type: string
 *       500:
 *         description: Erreur lors de l'appel à l'API
 */
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

/**
 * @swagger
 * /api/claude:
 *   post:
 *     summary: Envoyer une requête à l'API Claude (Anthropic)
 *     description: Envoie un prompt chiffré à l'API Claude et retourne la réponse chiffrée
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - apiKey
 *               - model
 *               - prompt
 *               - chatId
 *             properties:
 *               apiKey:
 *                 type: string
 *                 description: Clé API Anthropic chiffrée
 *               model:
 *                 type: string
 *                 description: Modèle Claude chiffré (ex. claude-3-opus-20240229)
 *               prompt:
 *                 type: string
 *                 description: Prompt utilisateur chiffré
 *               chatId:
 *                 type: string
 *                 description: Identifiant unique de la conversation chiffré
 *     responses:
 *       200:
 *         description: Réponse de l'API Claude chiffrée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 encryptedResponse:
 *                   type: string
 *       500:
 *         description: Erreur lors de l'appel à l'API
 */
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

/**
 * @swagger
 * /api/claude-check:
 *   get:
 *     summary: Vérifier si l'API Claude est fonctionnelle
 *     description: Route de test pour vérifier que l'endpoint de l'API Claude est disponible
 *     responses:
 *       200:
 *         description: API Claude fonctionnelle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Claude API endpoint is working
 */
app.get("/api/claude-check", (req, res) => {
  res.json({ status: "Claude API endpoint is working" });
});

/**
 * @swagger
 * /api/create-chat:
 *   post:
 *     summary: Créer une nouvelle conversation
 *     description: Crée une nouvelle conversation et retourne son identifiant unique (UUID)
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Titre optionnel pour la conversation
 *     responses:
 *       201:
 *         description: Conversation créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 uuid:
 *                   type: string
 *                   description: Identifiant unique de la conversation créée
 *                   example: 123e4567-e89b-12d3-a456-426614174000
 *                 encryptedUuid:
 *                   type: string
 *                   description: Identifiant unique chiffré pour utilisation directe avec les API
 *       500:
 *         description: Erreur lors de la création de la conversation
 */
app.post("/api/create-chat", (req, res) => {
  try {
    const uuid = generateUUID();
    const { title } = req.body || {};
    
    // Initialiser le tableau de messages pour cette conversation
    conversations[uuid] = [];
    
    // Ajouter des métadonnées si un titre est fourni
    if (title) {
      conversations[uuid].metadata = { title, createdAt: new Date().toISOString() };
    }
    
    // Sauvegarder la conversation dans le fichier
    saveConversations();
    
    // Chiffrer l'UUID pour une utilisation directe avec les API
    const encryptedUuid = CryptoJS.AES.encrypt(uuid, secretPassphrase).toString();
    
    // Renvoyer l'UUID de la conversation et sa version chiffrée
    res.status(201).json({
      success: true,
      uuid: uuid,
      encryptedUuid: encryptedUuid
    });
  } catch (error) {
    console.error("Erreur lors de la création d'une conversation:", error);
    res.status(500).json({
      success: false,
      error: "Impossible de créer une nouvelle conversation"
    });
  }
});

// Middleware pour journaliser les routes disponibles
app.use((req, res, next) => {
  console.log("Available routes:", app._router.stack
    .filter(r => r.route)
    .map(r => ({ path: r.route.path, methods: Object.keys(r.route.methods) })));
  next();
});

/**
 * @swagger
 * /images:
 *   get:
 *     summary: Accéder à la page d'extraction de texte depuis des images
 *     description: Affiche l'interface permettant de télécharger des images pour extraire du texte
 *     responses:
 *       200:
 *         description: Page HTML d'extraction de texte depuis des images
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
app.get("/images", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "imageExtraction.html"));
});

/**
 * @swagger
 * /extract-text:
 *   post:
 *     summary: Extraire du texte d'une image
 *     description: Utilise Tesseract.js pour extraire du texte d'une image téléchargée
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *         description: Image contenant du texte à extraire
 *     responses:
 *       200:
 *         description: Texte extrait avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                   description: Texte extrait de l'image
 *       400:
 *         description: Aucune image n'a été téléchargée
 *       500:
 *         description: Erreur lors de l'extraction du texte
 */
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

/**
 * @swagger
 * /clear-chat/{chatId}:
 *   delete:
 *     summary: Effacer une conversation
 *     description: Efface le contenu d'une conversation spécifique identifiée par son ID
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         description: Identifiant unique de la conversation à effacer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation effacée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Conversation non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Chat not found
 */
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

/**
 * @swagger
 * /api/restoreChat/{uuid}:
 *   get:
 *     summary: Restaurer une conversation par UUID
 *     description: Récupère le contenu d'une conversation à partir de son identifiant unique (UUID)
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         description: Identifiant unique (UUID) de la conversation à restaurer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 conversation:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       role:
 *                         type: string
 *                         enum: [user, assistant]
 *                         description: Rôle du participant à la conversation
 *                       content:
 *                         type: string
 *                         description: Contenu du message
 *       404:
 *         description: Conversation non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Conversation not found
 */
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
