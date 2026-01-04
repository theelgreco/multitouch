let started = false;
let port;

chrome.action.onClicked.addListener(() => {
    started = !started;

    if (started) {
        port = chrome.runtime.connectNative("com.stelios.trackpad");
        port.onMessage.addListener((msg) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: "trackpad", data: msg });
                }
            });
        });
    } else {
        port.disconnect();
    }
});
