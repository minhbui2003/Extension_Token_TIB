(function () {
    function getHeaderValue(headers, key) {
        if (!headers) return null;

        const target = key.toLowerCase();

        if (headers instanceof Headers) {
            return headers.get(key) || headers.get(target);
        }

        if (Array.isArray(headers)) {
            const found = headers.find(([k]) => String(k).toLowerCase() === target);
            return found ? found[1] : null;
        }

        if (typeof headers === "object") {
            for (const k of Object.keys(headers)) {
                if (k.toLowerCase() === target) return headers[k];
            }
        }

        return null;
    }

    function isTeeinblueApi(url) {
        return (
            String(url).includes("portal-api.teeinblue.com") ||
            String(url).includes("graphql.teeinblue.com")
        );
    }

    function sendToken(token, url) {
        if (!token || !String(token).startsWith("Bearer ")) return;

        window.postMessage(
            {
                type: "TIB_BEARER_FOUND",
                token,
                url
            },
            "*"
        );
    }

    const originalFetch = window.fetch;

    window.fetch = async function (...args) {
        try {
            const input = args[0];
            const init = args[1] || {};
            const url = typeof input === "string" ? input : input?.url;

            let token = getHeaderValue(init.headers, "authorization");

            if (!token && input instanceof Request) {
                token = getHeaderValue(input.headers, "authorization");
            }

            if (token && isTeeinblueApi(url)) {
                sendToken(token, url);
            }
        } catch (error) {
            console.warn("[Teeinblue Token] Fetch hook error:", error);
        }

        return originalFetch.apply(this, args);
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this.__tib_url = url;
        this.__tib_headers = {};
        return originalOpen.call(this, method, url, ...rest);
    };

    XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
        this.__tib_headers = this.__tib_headers || {};
        this.__tib_headers[String(name).toLowerCase()] = value;
        return originalSetRequestHeader.call(this, name, value);
    };

    XMLHttpRequest.prototype.send = function (...args) {
        try {
            const url = this.__tib_url || "";
            const token = this.__tib_headers?.authorization;

            if (token && isTeeinblueApi(url)) {
                sendToken(token, url);
            }
        } catch (error) {
            console.warn("[Teeinblue Token] XHR hook error:", error);
        }

        return originalSend.apply(this, args);
    };
})();