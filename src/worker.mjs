const MAX_BYTES = 20000;
const reply = (status, message) => Response.json({ success: status === 200, message }, {
    status, headers: { "Cache-Control": "no-store" }
});
const emailValid = value => typeof value === "string" && value.length <= 254 &&
    /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(value);
const singleLine = (value, max) => typeof value === "string" &&
    value.trim().length > 0 && value.length <= max && !/[\r\n\x00-\x1f\x7f]/.test(value);

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
        if (url.pathname !== "/api/contact") return reply(404, "Not found.");
        if (request.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST" } });
        const hostnames = new Set((env.TURNSTILE_HOSTNAMES || "").split(",").map(x => x.trim()).filter(Boolean));
        if (!env.TURNSTILE_SECRET || !hostnames.size) return reply(503, "The contact form is not configured yet. Please email us directly.");
        // Origin checking supplements Turnstile; it is not a substitute for token validation.
        if (request.headers.get("Origin") !== url.origin || !hostnames.has(url.hostname)) return reply(403, "Submission not allowed.");
        if (!(request.headers.get("Content-Type") || "").toLowerCase().startsWith("application/json")) return reply(415, "Send JSON.");
        let data;
        try {
            // Read a bounded stream, including requests without Content-Length.
            const reader = request.body?.getReader();
            if (!reader) return reply(400, "Missing submission.");
            const chunks = [];
            let size = 0;
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                size += value.byteLength;
                if (size > MAX_BYTES) { await reader.cancel(); return reply(413, "Submission is too large."); }
                chunks.push(value);
            }
            const bytes = new Uint8Array(size);
            let offset = 0;
            for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
            data = JSON.parse(new TextDecoder().decode(bytes));
        } catch { return reply(400, "Invalid submission."); }
        if (!data || typeof data !== "object" ||
            !singleLine(data.name, 100) || !emailValid(data.email) ||
            !singleLine(data.subject, 200) || typeof data.message !== "string" ||
            !data.message.trim() || data.message.length > 5000) return reply(400, "Check the form fields and try again.");
        const token = data["cf-turnstile-response"];
        if (typeof token !== "string" || !token.length || token.length > 2048) return reply(403, "Complete the security check and try again.");
        let result;
        try {
            const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token });
            const ip = request.headers.get("CF-Connecting-IP");
            if (ip) body.set("remoteip", ip);
            const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
                method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body, signal: AbortSignal.timeout(10000)
            });
            if (!response.ok) throw new Error("Verification unavailable");
            result = await response.json();
        } catch { return reply(403, "Security verification failed. Please try again."); }
        if (result?.success !== true || result.action !== "contact" || !hostnames.has(result.hostname) ||
            result.hostname !== url.hostname) return reply(403, "Security verification failed. Please try again.");
        // Never accept sender or destination addresses from the visitor.
        if (!env.CONTACT_EMAIL?.send || !emailValid(env.CONTACT_TO) || !emailValid(env.CONTACT_FROM)) {
            return reply(503, "Email delivery is not configured yet. Please email us directly.");
        }
        try {
            await env.CONTACT_EMAIL.send({
                from: env.CONTACT_FROM, to: env.CONTACT_TO, replyTo: data.email,
                subject: "Website contact: " + data.subject.trim(),
                text: "Name: " + data.name.trim() + "\nEmail: " + data.email + "\n\n" + data.message.trim()
            });
        } catch { return reply(502, "We could not send your message. Please try again later or email us directly."); }
        return reply(200, "Your message has been accepted. Thank you!");
    }
};
