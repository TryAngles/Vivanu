// utils/fetchJSON.js

export class FetchError extends Error {
    constructor(message = "Error", status = 500, data = null) {
        super(message);
        this.name = "FetchError";
        this.status = status;
        this.data = data;
    }
}

export async function fetchJSON(url, options = {}) {
    const {
        method = "GET",
        headers = {},
        body,
        timeout = 10000
    } = options;

    const controller = new AbortController();

    const timer = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...headers
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal
        });

        clearTimeout(timer);

        let data;

        try {
            data = await response.json();
        } catch {
            throw new FetchError("Invalid JSON", response.status);
        }

        if (!response.ok)
            throw new FetchError(
                data?.message || response.statusText,
                response.status,
                data
            );

        return data;

    } catch (e) {
        clearTimeout(timer);

        if (e.name === "AbortError")
            throw new FetchError("Request Timeout", 408);

        if (e instanceof FetchError)
            throw e;

        if (!navigator.onLine)
            throw new FetchError("No Internet", 0);

        throw new FetchError(e.message || "Unknown Error", 500);
    }
}