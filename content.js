let timeout;
let targetLanguage = 'en'; // Default target language

chrome.storage.sync.get(['selectedLanguage'], (result) => {
    targetLanguage = result.selectedLanguage || 'en'; // Use saved language or default to English
    addCustomDiv(); // Initialize translation with saved language
});

function addCustomDiv() {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(async () => {
        const messageElements = document.querySelectorAll('.message-in, .message-out');

        for (const message of messageElements) {
            // Check for an existing custom div
            let existingDiv = message.querySelector('.custom-div');
            if (!existingDiv) {
                const customDiv = document.createElement('div');
                const messageText = message.querySelector('.selectable-text')?.innerText || "No text available";
                const translatedText = await translateText(messageText, targetLanguage);

                customDiv.innerText = translatedText;
                customDiv.classList.add('custom-div');
                customDiv.style.marginTop = "10px";

                // Style based on message type
                customDiv.style.textAlign = message.classList.contains('message-out') ? 'right' : 'left';
                customDiv.style.color = message.classList.contains('message-out') ? 'green' : ''; 

                message.appendChild(customDiv);
            } else {
                // Update existing div if it exists
                const messageText = message.querySelector('.selectable-text')?.innerText || "No text available";
                const translatedText = await translateText(messageText, targetLanguage);
                existingDiv.innerText = translatedText; // Update the text
            }
        }
    }, 300);
}


async function translateText(text, targetLang) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data[0][0][0]; // Extract the translated text
    } catch (error) {
        console.error('Error translating text:', error);
        return text; // Fallback to original text on error
    }
}

const observer = new MutationObserver(addCustomDiv);
observer.observe(document.body, { childList: true, subtree: true });

// Listen for language changes from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "changeLanguage") {
        targetLanguage = request.language;
        addCustomDiv(); // Re-translate existing messages
        sendResponse({ status: "success" }); // Send a response back to the popup
    }
});