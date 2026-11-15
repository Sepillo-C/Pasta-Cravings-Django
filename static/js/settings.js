function showTab(tabId, button) {
    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.classList.remove("active");
    });

    document.querySelectorAll(".tab-button").forEach(tab => {
        tab.classList.remove("active");
    });

    const selectedTab = document.getElementById(tabId);

    if (selectedTab) {
        selectedTab.classList.add("active");
        button.classList.add("active");
    }
}

function saveSecuritySettings() {
    alert("Security settings are not connected to the database yet.");
}

function showLoginActivity() {
    alert("Login Activity is not connected yet.");
}