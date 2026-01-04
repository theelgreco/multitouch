chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "trackpad") {
        window.dispatchEvent(new CustomEvent("trackpad", { detail: message.data }));
    }
});
