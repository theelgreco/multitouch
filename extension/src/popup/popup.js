const toggleBtn = document.getElementById("toggle-btn");
const playIcon = document.getElementById("play-icon");
const pauseIcon = document.getElementById("pause-icon");
const statusText = document.getElementById("status-text");

function updateUI(isRunning) {
    if (isRunning) {
        toggleBtn.classList.remove("stopped");
        toggleBtn.classList.add("running");
        playIcon.classList.add("hidden");
        pauseIcon.classList.remove("hidden");
        statusText.textContent = "Running";
        statusText.classList.add("running");
    } else {
        toggleBtn.classList.remove("running");
        toggleBtn.classList.add("stopped");
        playIcon.classList.remove("hidden");
        pauseIcon.classList.add("hidden");
        statusText.textContent = "Stopped";
        statusText.classList.remove("running");
    }
}

// Get initial state from background
chrome.runtime.sendMessage({ type: "getState" }, (response) => {
    updateUI(response?.started || false);
});

// Toggle on button click
toggleBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "toggle" }, (response) => {
        updateUI(response?.started || false);
    });
});
