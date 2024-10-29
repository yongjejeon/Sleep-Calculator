// background.js
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && tab.url.includes("youtube.com") && changeInfo.audible) {
        console.log("YouTube is playing in another tab");

        // Set youtubePlaying to true in Chrome storage
        chrome.storage.local.set({ youtubePlaying: true }, () => {
            console.log("Background: YouTube playing status saved as true in storage.");
        });
    } else if (changeInfo.audible === false) {
        // Set youtubePlaying to false in Chrome storage when audio stops
        chrome.storage.local.set({ youtubePlaying: false }, () => {
            console.log("Background: YouTube playing status saved as false in storage.");
        });
    }
});
