document.addEventListener("DOMContentLoaded", () => {
  const langSelect = document.getElementById("targetLang");

  // Load saved language
  chrome.storage.sync.get(["targetLanguage"], (result) => {
    if (result.targetLanguage) {
      langSelect.value = result.targetLanguage;
    }
  });

  // Listen for language changes
  langSelect.addEventListener("change", (e) => {
    const newLang = e.target.value;
    // Save to storage and notify background script
    chrome.storage.sync.set({ targetLanguage: newLang });
    chrome.runtime.sendMessage({
      action: "setTargetLanguage",
      language: newLang,
    });
  });
});
