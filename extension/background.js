let port;

chrome.action.onClicked.addListener(() => {
    if (port) return;
    port = chrome.runtime.connectNative("com.stelios.trackpad");
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
