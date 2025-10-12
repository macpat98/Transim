// content.js

// Default target language
let targetLanguage = "pl";

// Variable to track extension state
let extensionActive = true;

// Add CSS file for translation popup
function addTranslationPopupStyles() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = chrome.runtime.getURL("src/popup/translation-popup.css");
  document.head.appendChild(link);
}

// Initialize styles
addTranslationPopupStyles();

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
      const center = rect.left + rect.width / 2;

      const response = await chrome.runtime.sendMessage({
        action: "translate",
        text: selectedText,
      });

      if (response && response.translatedText) {
        showTranslationPopup(response.translatedText, center, rect.top);
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

  // Get current selection info
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const selectionRect = range.getBoundingClientRect();

  const popup = document.createElement("div");
  popup.className = "translation-popup";
  popup.textContent = translation;

  // Initially hide the popup but keep it in the layout
  popup.style.visibility = "hidden";
  document.body.appendChild(popup);

  // Get the dimensions after adding to DOM
  const popupWidth = popup.offsetWidth;
  const popupHeight = popup.offsetHeight;

  // Calculate the center position of the selection
  const selectionCenter = selectionRect.left + selectionRect.width / 2;

  // Calculate initial position
  let finalX = selectionCenter - popupWidth / 2 + window.scrollX;
  let finalY = selectionRect.top + window.scrollY;

  // Ensure popup stays within viewport
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Adjust horizontal position if needed
  if (finalX < window.scrollX) {
    finalX = window.scrollX + 10;
  } else if (finalX + popupWidth > window.scrollX + viewportWidth) {
    finalX = window.scrollX + viewportWidth - popupWidth - 10;
  }

  // Adjust vertical position
  // First try to position above the selection
  if (selectionRect.top - popupHeight - 10 > 0) {
    // Enough space above
    finalY = selectionRect.top + window.scrollY - popupHeight - 10;
  } else if (selectionRect.bottom + popupHeight + 10 < viewportHeight) {
    // Try below if not enough space above
    finalY = selectionRect.bottom + window.scrollY + 10;
  } else {
    // If no good space above or below, prefer above if possible
    finalY = Math.max(
      window.scrollY + 10,
      selectionRect.top + window.scrollY - popupHeight - 10
    );
  }

  // Apply final position and show popup
  popup.style.left = `${finalX}px`;
  popup.style.top = `${finalY}px`;
  popup.style.visibility = "visible";

  // Add smooth fade-in effect
  popup.style.opacity = "0";
  popup.style.transition = "opacity 0.2s ease-in-out";
  requestAnimationFrame(() => {
    popup.style.opacity = "1";
  });
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
