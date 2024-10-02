document.addEventListener('DOMContentLoaded', () => {
    // Load saved language from storage
    chrome.storage.sync.get(['selectedLanguage'], (result) => {
        const selectedLanguage = result.selectedLanguage || 'en'; // Default to English
        document.getElementById('language-select').value = selectedLanguage;
    });
});

document.getElementById('language-select').addEventListener('change', function() {
    const selectedLanguage = this.value;

    // Save the selected language to storage
    chrome.storage.sync.set({ selectedLanguage: selectedLanguage }, () => {
        // Send the selected language to content.js for real-time translation
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "changeLanguage", language: selectedLanguage }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Message failed to send: ", chrome.runtime.lastError);
                    } else {
                        console.log("Message sent successfully:", response);
                    }
                });
            } else {
                console.error("No active tab found.");
            }
        });
    });
});
