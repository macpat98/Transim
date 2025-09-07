// content.js

// Default target language
let targetLanguage = "pl";

// Variable to track extension state
let extensionActive = true;

// Function for safe message sending
async function safeSendMessage(message) {
  if (!extensionActive) return;

  try {
    return await chrome.runtime.sendMessage(message);
  } catch (error) {
    if (error.message.includes("Extension context invalidated")) {
      extensionActive = false;
      console.log("Extension has been deactivated");
    }
    throw error;
  }
}

// Listen for text selection
document.addEventListener("mouseup", async (event) => {
  // Short delay to wait for selection update
  setTimeout(async () => {
    const selectedText = window.getSelection().toString().trim();

    // Remove popup if no text is selected
    if (!selectedText) {
      const existingPopup = document.querySelector(".translation-popup");
      if (existingPopup) {
        existingPopup.remove();
      }
      return;
    }

    try {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      const response = await chrome.runtime.sendMessage({
        action: "translate",
        text: selectedText,
      });

      if (response && response.translatedText) {
        showTranslationPopup(
          response.translatedText,
          rect.left + window.scrollX,
          rect.top + window.scrollY - 30
        );
      }
    } catch (error) {
      console.error("Translation error:", error);
    }
  }, 10); // Minimal delay
});

// Listen for clicks on document
document.addEventListener("mousedown", () => {
  // Remove popup on every click if no text is selected
  setTimeout(() => {
    const selectedText = window.getSelection().toString().trim();
    if (!selectedText) {
      const existingPopup = document.querySelector(".translation-popup");
      if (existingPopup) {
        existingPopup.remove();
      }
    }
  }, 0);
});

// Listen for text deselection
document.addEventListener("selectionchange", () => {
  const selectedText = window.getSelection().toString().trim();
  if (!selectedText) {
    const existingPopup = document.querySelector(".translation-popup");
    if (existingPopup) {
      existingPopup.remove();
    }
  }
});

// Show translation popup
function showTranslationPopup(translation, x, y) {
  const existingPopup = document.querySelector(".translation-popup");
  if (existingPopup) {
    existingPopup.remove();
  }

  const popup = document.createElement("div");
  popup.className = "translation-popup";
  popup.textContent = translation;
  popup.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 5px 10px;
        border-radius: 3px;
        font-size: 14px;
        max-width: 300px;
        z-index: 999999;
        pointer-events: none;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        transform: translateY(-100%);
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;

  document.body.appendChild(popup);
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelectedText") {
    const selectedText = getSelectedText();
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    sendResponse({
      text: selectedText,
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY,
    });
  } else if (request.action === "showTranslation") {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    showTranslationPopup(
      request.translation,
      rect.left + window.scrollX,
      rect.bottom + window.scrollY
    );
  } else if (request.action === "updateTargetLanguage") {
    targetLanguage = request.language;
    sendResponse({ success: true });
  }
  return true;
});
