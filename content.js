const script = document.createElement("script");

script.src = chrome.runtime.getURL("injected.js");
script.onload = () => script.remove();

(document.head || document.documentElement).appendChild(script);

window.addEventListener("message", async (event) => {
    if (event.source !== window) return;
    if (!event.data || event.data.type !== "TIB_BEARER_FOUND") return;

    const token = event.data.token;

    if (!token || !token.startsWith("Bearer ")) return;

    await chrome.storage.local.set({
        tib_bearer: token,
        tib_updated_at: new Date().toISOString(),
        tib_last_url: event.data.url || ""
    });
});