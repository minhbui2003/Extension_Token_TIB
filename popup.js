const info = document.getElementById("info");
const copyBtn = document.getElementById("copyBtn");

function maskToken(token) {
    if (!token) return "";

    // bỏ chữ "Bearer "
    const pure = token.replace("Bearer ", "");

    return pure.slice(0, 10) + "..." + pure.slice(-8);
}

async function loadInfo() {
    const data = await chrome.storage.local.get(["tib_bearer"]);

    if (!data.tib_bearer) {
        info.textContent = "Chưa có token";
        return;
    }

    info.textContent = "Token: " + maskToken(data.tib_bearer);
}

copyBtn.addEventListener("click", async () => {
    const data = await chrome.storage.local.get(["tib_bearer"]);

    if (!data.tib_bearer) {
        info.textContent = "Chưa có token";
        return;
    }

    // copy full (có Bearer)
    await navigator.clipboard.writeText(data.tib_bearer);
});

loadInfo();