// ScanDesk Chrome Extension controller script
// It registers click triggers, queries the active viewport, and communicates with the backend api

// Retrieve stored URL config, defaulting to localhost
let BACKEND_URL = localStorage.getItem("scandesk_backend_url") || "http://localhost:3000";

document.getElementById("scan-btn").addEventListener("click", async () => {
  const scanBtn = document.getElementById("scan-btn");
  const resultBox = document.getElementById("result-box");
  const riskScore = document.getElementById("risk-score");
  const riskStatus = document.getElementById("risk-status");
  const riskDesc = document.getElementById("risk-desc");

  scanBtn.disabled = true;
  scanBtn.textContent = "Analyzing Threat Vector...";

  try {
    // 1. Query the active browser tab URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
      throw new Error("Unable to capture active browser tab URL");
    }

    // 2. Transmit url to ScanDesk main REST API
    const res = await fetch(`${BACKEND_URL}/api/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: tab.url,
        source: "Extension Pop"
      })
    });

    if (!res.ok) {
      throw new Error(`Server returned error: ${res.statusText}`);
    }

    const data = await res.json();

    // 3. Render analysis results inside Chromium popup
    resultBox.style.display = "block";
    riskScore.textContent = data.riskScore;
    riskStatus.textContent = data.status.toUpperCase();
    riskDesc.textContent = data.details;

    // Apply color classifications matching standard statuses
    riskStatus.className = "";
    if (data.status === "dangerous") {
      riskStatus.classList.add("danger");
    } else if (data.status === "suspicious") {
      riskStatus.classList.add("warning");
    } else {
      riskStatus.classList.add("safe");
    }

    // Update statistics
    const statsRes = await fetch(`${BACKEND_URL}/api/scans`);
    if (statsRes.ok) {
      const scansList = await statsRes.json();
      document.getElementById("scans-count").textContent = `${scansList.length} / 50 Scans`;
    }

  } catch (err) {
    resultBox.style.display = "block";
    riskStatus.textContent = "ERROR";
    riskStatus.className = "danger";
    riskDesc.textContent = err.message || "Failed to establish API connection to ScanDesk backend.";
  } finally {
    scanBtn.disabled = false;
    scanBtn.textContent = "Scan Active Tab Link";
  }
});

// Load original scan metrics count on startup
async function initStats() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/scans`);
    if (response.ok) {
      const data = await response.json();
      document.getElementById("scans-count").textContent = `${data.length} / 50 Scans`;
    }
  } catch (e) {
    console.warn("Unable to fetch initial stats on launch", e);
  }
}
initStats();

// Toggle Settings Drawer
document.getElementById("toggle-settings").addEventListener("click", () => {
  const settingsArea = document.getElementById("settings-area");
  settingsArea.style.display = settingsArea.style.display === "none" ? "block" : "none";
});

// Load saved settings on startup
document.getElementById("backend-url-input").value = BACKEND_URL;

// Save configuration updates
document.getElementById("save-settings-btn").addEventListener("click", () => {
  const saveBtn = document.getElementById("save-settings-btn");
  const customUrl = document.getElementById("backend-url-input").value.trim();
  if (customUrl) {
    BACKEND_URL = customUrl.replace(/\/$/, ""); // Strip trailing slash for consistency
    localStorage.setItem("scandesk_backend_url", BACKEND_URL);
    saveBtn.textContent = "Saved ✓";
    setTimeout(() => {
      saveBtn.textContent = "Save Connection";
      document.getElementById("settings-area").style.display = "none";
    }, 800);
    initStats();
  }
});
