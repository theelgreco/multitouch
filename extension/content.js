chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "trackpad") {
        window.postMessage({ type: "trackpad", data: message.data }, "*");
    }
});
