////////////////////////////////////////////////////////////

//                        chat                         //

///////////////////////////////////////////////////////////

const secretPassphrase =
  "coasting glitzy tapering finished unmapped jot abide mop goldsmith protract shortly lash";
let currentTab = 0;
let chatIndex = 0;
const chatIds = {};

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

  // Generate a unique chatId for this tab
  chatIds[chatIndex] = generateChatId();

  switchTab(chatIndex);
  chatIndex++;
}

function generateChatId() {
  // Generate a unique chat ID (this can be more sophisticated if needed)
  return `chat-${Date.now()}`;
}

function switchTab(index) {
  currentTab = index;

  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab, idx) => tab.classList.toggle("active", idx === index));

  const containers = document.querySelectorAll(".chat-container");
  containers.forEach((container, idx) =>
    container.classList.toggle("active", idx === index)
  );
}

// Add the first chat by default
addNewChatTab();

document
  .getElementById("newChatButton")
  .addEventListener("click", addNewChatTab);

document
  .getElementById("downloadChatButton")
  .addEventListener("click", function () {
    const container = document.querySelector(".chat-container.active");
    if (!container) {
      alert("No active chat to download!");
      return;
    }

    let chatContent = "";
    const messages = container.querySelectorAll(".message");
    messages.forEach((msg) => (chatContent += msg.innerText + "\n"));

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(chatContent)
    );
    element.setAttribute("download", "chat.txt");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  });

document.getElementById("imageButton").addEventListener("click", function () {
  window.location.href = "/images";
});
