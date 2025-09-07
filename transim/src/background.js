let targetLanguage = "pl";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message:", request); // debug

  if (request.action === "translate") {
    translateText(request.text, targetLanguage)
      .then((translatedText) => {
        console.log("Translation successful:", translatedText); // debug
        sendResponse({ translatedText });
      })
      .catch((error) => {
        console.error("Translation error:", error);
        sendResponse({ error: error.message || "Translation failed" });
      });
    return true; // Keep the message channel open for the async response
  } else if (request.action === "setTargetLanguage") {
    targetLanguage = request.language;
    // Save the selected language
    chrome.storage.sync.set({ targetLanguage: request.language });
  }
});

// Load saved language on startup
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["targetLanguage"], (result) => {
    if (result.targetLanguage) {
      targetLanguage = result.targetLanguage;
    }
  });
});

async function translateText(text, targetLang) {
  if (!text || text.trim() === "") {
    throw new Error("No text to translate");
  }

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
        text
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data[0] || !data[0][0] || !data[0][0][0]) {
      throw new Error("Invalid response format from translation service");
    }

    return data[0][0][0];
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
}
