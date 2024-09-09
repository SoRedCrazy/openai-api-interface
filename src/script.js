//////////////////////////////////////////////////////////
//                        chat                         //
//////////////////////////////////////////////////////////

const secretPassphrase =
  "coasting glitzy tapering finished unmapped jot abide mop goldsmith protract shortly lash";
let currentTab = 0;
let chatIndex = 0;
let chatIds = {};

// Charger les chats depuis le localStorage au démarrage
window.onload = function () {
  const savedChats = localStorage.getItem("chats");
  const savedChatIds = localStorage.getItem("chatIds");
  const savedChatIndex = localStorage.getItem("chatIndex");

  if (savedChats && savedChatIds && savedChatIndex) {
    document.getElementById("chat-containers").innerHTML = savedChats;
    chatIds = JSON.parse(savedChatIds);
    chatIndex = parseInt(savedChatIndex);

    // Recréer les onglets pour chaque chat sauvegardé
    updateChatTabs();
  }

  // Si aucune donnée n'est sauvegardée, ajouter un premier chat
  if (!savedChats) {
    addNewChatTab();
  }
};

// Sauvegarder les chats dans le localStorage
function saveChatsToLocalStorage() {
  const chats = document.getElementById("chat-containers").innerHTML;
  localStorage.setItem("chats", chats);
  localStorage.setItem("chatIds", JSON.stringify(chatIds));
  localStorage.setItem("chatIndex", chatIndex.toString());
}

// Ajouter une nouvelle conversation
function addNewChatTab() {
  const tab = document.createElement("div");
  tab.className = "tab";
  tab.innerText = `Chat ${chatIndex + 1}`;
  tab.setAttribute("data-index", chatIndex);
  const chatNum = chatIndex;
  tab.addEventListener("click", () => switchTab(chatNum));
  document.getElementById("tabs").appendChild(tab);

  const chatContainer = document.createElement("div");
  chatContainer.className = "chat-container";
  chatContainer.id = `chat-container-${chatIndex}`;
  document.getElementById("chat-containers").appendChild(chatContainer);

  chatIds[chatIndex] = generateChatId();

  switchTab(chatIndex);
  chatIndex++;

  saveChatsToLocalStorage(); // Sauvegarder après l'ajout d'un nouvel onglet
}

// Recréer les onglets à partir des données sauvegardées
function updateChatTabs() {
  Object.keys(chatIds).forEach((index) => {
    const tab = document.createElement("div");
    tab.className = "tab";
    tab.innerText = `Chat ${parseInt(index) + 1}`;
    tab.setAttribute("data-index", index);
    const chatNum = parseInt(index);
    tab.addEventListener("click", () => switchTab(chatNum));
    document.getElementById("tabs").appendChild(tab);
  });
  switchTab(0); // Afficher le premier chat par défaut
}

// Fonction pour changer d'onglet
function switchTab(index) {
  currentTab = index;

  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab, idx) => tab.classList.toggle("active", idx === index));

  const containers = document.querySelectorAll(".chat-container");
  containers.forEach((container, idx) =>
    container.classList.toggle("active", idx === index)
  );
}

document
  .getElementById("openai-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const apiKey = document.getElementById("apiKey").value;
    const model = document.getElementById("model").value;
    const prompt = document.getElementById("prompt").value;
    const chatId = chatIds[currentTab];

    if (!chatId) {
      console.error(`No chat ID found for tab ${currentTab}`);
      return;
    }

    const conversationDiv = document.getElementById(
      `chat-container-${currentTab}`
    );
    const encryptedApiKey = encryptData(apiKey);
    const encryptedModel = encryptData(model);
    const encryptedPrompt = encryptData(prompt);
    const encryptedChatId = encryptData(chatId.toString());

    // Afficher le message de l'utilisateur (en clair)
    const userMessage = document.createElement("div");
    userMessage.className = "message user";
    userMessage.innerText = `You: ${prompt}`;
    conversationDiv.appendChild(userMessage);

    document.getElementById("prompt").value = "";
    document.getElementById("loading").style.display = "flex";

    try {
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: encryptedApiKey,
          model: encryptedModel,
          prompt: encryptedPrompt,
          chatId: encryptedChatId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const decryptedResponse = decryptData(data.encryptedResponse);
        const formattedResponse = formatResponseText(decryptedResponse);

        const botMessage = document.createElement("div");
        botMessage.className = "message bot";
        botMessage.innerHTML = formattedResponse;
        conversationDiv.appendChild(botMessage);
      } else {
        const errorMessage = document.createElement("div");
        errorMessage.className = "message bot";
        errorMessage.innerText = `Error: ${data.error}`;
        conversationDiv.appendChild(errorMessage);
      }
    } catch (error) {
      const errorMessage = document.createElement("div");
      errorMessage.className = "message bot";
      errorMessage.innerText = `Request failed: ${error.message}`;
      conversationDiv.appendChild(errorMessage);
    } finally {
      document.getElementById("loading").style.display = "none";
      saveChatsToLocalStorage(); // Sauvegarder après la réponse
    }

    conversationDiv.scrollTop = conversationDiv.scrollHeight;
  });

function formatResponseText(text) {
  let formattedText = formatJsonBlocks(text);
  formattedText = formatCodeBlocks(formattedText);
  return formattedText;
}

function encryptData(data) {
  return CryptoJS.AES.encrypt(data, secretPassphrase).toString();
}

function decryptData(encryptedData) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretPassphrase);
  return bytes.toString(CryptoJS.enc.Utf8);
}

function formatCodeBlocks(text) {
  return text.replace(
    /```(\w+)\n([\s\S]*?)```/g,
    (match, lang, code, index) => {
      const uniqueId = `code-${index}-${Date.now()}`; // Unique ID for each code block
      return `
      <div class="code-block">
        <pre><code id="${uniqueId}" class="language-${lang}">${escapeHtml(
        code
      )}</code></pre>
        <button class="copy-button" data-target="${uniqueId}">Copy</button>
      </div>
    `;
    }
  );
}

function formatJsonBlocks(text) {
  const jsonPattern = /(?:^|\n)({[\s\S]*?})(?:$|\n)/g;
  return text.replace(jsonPattern, (match, json) => {
    let formattedJson;
    try {
      const parsedJson = JSON.parse(json);
      formattedJson = JSON.stringify(parsedJson, null, 2);
    } catch (e) {
      formattedJson = json;
    }
    return `
          <div class="json-block">
            <pre><code>${escapeHtml(formattedJson)}</code></pre>
            <button class="copy-button" onclick="copyToClipboard(\`${escapeHtml(
              formattedJson
            ).replace(/`/g, "\\`")}\`)">Copy</button>
          </div>
        `;
  });
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("copy-button")) {
    const targetId = event.target.getAttribute("data-target");
    const codeElement = document.getElementById(targetId);
    if (codeElement) {
      copyToClipboard(codeElement.innerText);
    }
  }
});

function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => alert("Code copied to clipboard!"))
    .catch((err) => alert("Failed to copy code."));
}

// UUID Generation function
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateChatId() {
  return generateUUID();
}

document
  .getElementById("newChatButton")
  .addEventListener("click", addNewChatTab);

document
  .getElementById("downloadChatButton")
  .addEventListener("click", function () {
    const chatContent = document.getElementById(
      `chat-container-${currentTab}`
    ).innerText;
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(chatContent)
    );
    element.setAttribute("download", `chat_${currentTab}.txt`);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  });
