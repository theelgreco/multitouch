let started = false;
let port = null;

function setActiveIcon(isActive) {
    chrome.action.setIcon({
        path: isActive
            ? {
                  16: "icons/16x16-active.png",
                  32: "icons/32x32-active.png",
                  48: "icons/48x48-active.png",
                  128: "icons/128x128-active.png",
              }
            : {
                  16: "icons/16x16.png",
                  32: "icons/32x32.png",
                  48: "icons/48x48.png",
                  128: "icons/128x128.png",
              },
    });
}

function startNativeHost() {
    if (port) return;

    port = chrome.runtime.connectNative("com.stelan.multitouch");
    port.onMessage.addListener((msg) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { type: "trackpad", data: msg });
            }
        });
    });
    port.onDisconnect.addListener(() => {
        port = null;
        started = false;
    });
    started = true;
}

function stopNativeHost() {
    if (port) {
        port.disconnect();
        port = null;
    }
    started = false;
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getState") {
        sendResponse({ started });
    } else if (message.type === "toggle") {
        if (started) {
            stopNativeHost();
        } else {
            startNativeHost();
        }
        setActiveIcon(started);
        sendResponse({ started });
    }
    return true;
});
