const secretPassphrase =
  "coasting glitzy tapering finished unmapped jot abide mop goldsmith protract shortly lash";

// Ajoutez un événement sur le bouton pour télécharger une image
document
  .getElementById("uploadButton")
  .addEventListener("click", async function () {
    const apiKey = document.getElementById("apiKey").value;
    const imageInput = document.getElementById("imageInput").files[0];

    if (!apiKey || !imageInput) {
      alert("Veuillez entrer votre API Key et sélectionner une image.");
      return;
    }

    const formData = new FormData();
    formData.append("image", imageInput);

    document.getElementById("loading").style.display = "block";

    try {
      const response = await fetch("/extract-text", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        const extractedText = data.text;
        document.getElementById(
          "extractedText"
        ).innerText = `Texte extrait:\n${extractedText}`;
        await sendExtractedTextToOpenAI(apiKey, extractedText);
      } else {
        document.getElementById(
          "extractedText"
        ).innerText = `Erreur : ${data.error}`;
      }
    } catch (error) {
      console.error("Erreur:", error);
      document.getElementById(
        "extractedText"
      ).innerText = `Erreur de requête : ${error.message}`;
    } finally {
      document.getElementById("loading").style.display = "none";
    }
  });

// Ajoutez un événement sur le bouton pour capturer l'écran
// document
//   .getElementById("captureButton")
//   .addEventListener("click", async function () {
//     const apiKey = document.getElementById("apiKey").value;

//     if (!apiKey) {
//       alert("Veuillez entrer votre API Key.");
//       return;
//     }

//     // Capture de la capture d'écran et traitement
//     try {
//       const screenshot = await captureScreenshot();
//       const formData = new FormData();
//       formData.append("image", screenshot);

//       document.getElementById("loading").style.display = "block";

//       const response = await fetch("/extract-text", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();
//       if (response.ok) {
//         const extractedText = data.text;
//         document.getElementById(
//           "extractedText"
//         ).innerText = `Texte extrait:\n${extractedText}`;
//         await sendExtractedTextToOpenAI(apiKey, extractedText);
//       } else {
//         document.getElementById(
//           "extractedText"
//         ).innerText = `Erreur : ${data.error}`;
//       }
//     } catch (error) {
//       console.error("Erreur:", error);
//       document.getElementById(
//         "extractedText"
//       ).innerText = `Erreur de requête : ${error.message}`;
//     } finally {
//       document.getElementById("loading").style.display = "none";
//     }
//   });

async function captureScreenshot() {
  // Capture de l'écran de la page actuelle
  const canvas = await html2canvas(document.body);
  const imageBlob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );
  return imageBlob;
}

async function sendExtractedTextToOpenAI(apiKey, extractedText) {
  const model = "gpt-4";
  const chatId = "500"; // Chat ID fixe
  const encryptedApiKey = encryptData(apiKey);
  const encryptedModel = encryptData(model);
  const encryptedPrompt = encryptData(extractedText);
  const encryptedChatId = encryptData(chatId);

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
      document.getElementById(
        "openaiResponse"
      ).innerHTML = `Reponse openai: ${formatResponseText(decryptedResponse)}`;
    } else {
      document.getElementById(
        "openaiResponse"
      ).innerText = `Erreur : ${data.error}`;
    }
  } catch (error) {
    console.error("Erreur:", error);
    document.getElementById(
      "openaiResponse"
    ).innerText = `Erreur de requête : ${error.message}`;
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

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
      const uniqueId = `code-${index}-${Date.now()}`;
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

function copyToClipboard(text) {
  const tempTextArea = document.createElement("textarea");
  tempTextArea.value = text;
  document.body.appendChild(tempTextArea);
  tempTextArea.select();
  document.execCommand("copy");
  document.body.removeChild(tempTextArea);
}

document.getElementById("backButton").addEventListener("click", function () {
  window.location.href = "index.html";
});
