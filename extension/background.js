// chrome.runtime.onStartup.addListener(init);
// chrome.runtime.onInstalled.addListener(init);

// let started = false;

// function init() {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         if (tabs[0] && !started) {
//             console.log(tabs);
//             chrome.scripting.executeScript({
//                 target: { tabId: tabs[0].id },
//                 files: ["content.js"],
//             });

//             started = true;
//         }
//     });
// }

const port = chrome.runtime.connectNative("com.stelios.trackpad");

chrome.action.onClicked.addListener(() => {
    // init();
    port.onMessage.addListener((msg) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { type: "trackpad", data: msg });
            }
        });
    });
    port.onDisconnect.addListener(() => console.log("Native disconnected"));
    console.log("Connected to native host");
});
