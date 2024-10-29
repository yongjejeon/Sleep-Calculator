// content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.youtubePlaying) {
        console.log("Content Script: YouTube is playing in another tab.");
        
        // Send a message to the background script indicating that YouTube is playing
        chrome.runtime.sendMessage({ action: "youtubePlaying" });
    }
});
