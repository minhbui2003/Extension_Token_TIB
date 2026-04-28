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
    // show immediate feedback so the popup doesn't feel frozen
    copyBtn.disabled = true;
    const prevText = info.textContent;
    info.textContent = "Đang copy...";

    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(data.tib_bearer);
        } else {
            // fallback: use textarea + execCommand
            const ta = document.createElement("textarea");
            ta.value = data.tib_bearer;
            ta.style.position = "fixed";
            ta.style.left = "-9999px";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
        }

        info.textContent = "Đã copy token";
    } catch (err) {
        console.warn("Copy failed", err);
        info.textContent = "Copy thất bại";
    } finally {
        // restore button and masked info after short delay
        setTimeout(() => {
            copyBtn.disabled = false;
            loadInfo();
        }, 900);
    }
});

loadInfo();