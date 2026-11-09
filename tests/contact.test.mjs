import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.mjs";

test("contact validation and delivery gate", async () => {
    const original = globalThis.fetch;
    let sent = 0, verified = 0, response = { success: true, action: "contact", hostname: "pocdigital.org" };
    const env = {
        TURNSTILE_SECRET: "test-only", TURNSTILE_HOSTNAMES: "pocdigital.org,www.pocdigital.org",
        CONTACT_TO: "inbox@example.com", CONTACT_FROM: "contact@example.com",
        CONTACT_EMAIL: { send: async message => {
            assert.equal(message.to, "inbox@example.com");
            assert.equal(message.replyTo, "visitor@example.com");
            sent++;
        }},
        ASSETS: { fetch: async () => new Response("static") }
    };
    const data = { name: "Visitor", email: "visitor@example.com", subject: "Hello", message: "Question",
        "cf-turnstile-response": "fresh" };
    const request = (body = data, origin = "https://pocdigital.org") => new Request("https://pocdigital.org/api/contact", {
        method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify(body)
    });
    globalThis.fetch = async (url, options) => {
        verified++;
        assert.equal(url, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
        assert.equal(options.body.get("secret"), "test-only");
        assert.equal(options.body.get("response"), "fresh");
        return Response.json(response);
    };
    try {
        assert.equal((await worker.fetch(request({ ...data, "cf-turnstile-response": "" }), env)).status, 403);
        assert.equal(verified, 0);
        assert.equal((await worker.fetch(request(data, "https://evil.example"), env)).status, 403);
        assert.equal((await worker.fetch(request({ ...data, email: "bad" }), env)).status, 400);
        assert.equal((await worker.fetch(request({ ...data, subject: "Header\r\nInjection" }), env)).status, 400);
        assert.equal((await worker.fetch(request({ ...data, message: "x".repeat(25000) }), env)).status, 413);
        for (const invalid of [
            { success: false, "error-codes": ["timeout-or-duplicate"] },
            { success: "true", action: "contact", hostname: "pocdigital.org" },
            { success: true, action: "login", hostname: "pocdigital.org" },
            { success: true, action: "contact", hostname: "evil.example" },
            { success: true, action: "contact", hostname: "www.pocdigital.org" }
        ]) {
            response = invalid;
            assert.equal((await worker.fetch(request(), env)).status, 403);
        }
        assert.equal(sent, 0);
        response = { success: true, action: "contact", hostname: "pocdigital.org" };
        assert.equal((await worker.fetch(request(), { ...env, TURNSTILE_SECRET: "" })).status, 503);
        assert.equal((await worker.fetch(request(), { ...env, CONTACT_EMAIL: undefined })).status, 503);
        assert.equal((await worker.fetch(request(), env)).status, 200);
        assert.equal(sent, 1);
        response = { success: false, "error-codes": ["timeout-or-duplicate"] };
        assert.equal((await worker.fetch(request(), env)).status, 403);
        assert.equal(sent, 1);
        response = { success: true, action: "contact", hostname: "pocdigital.org" };
        assert.equal((await worker.fetch(request(), { ...env, CONTACT_EMAIL: { send: async () => { throw Error("private failure"); } } })).status, 502);
        globalThis.fetch = async () => { throw Error("network"); };
        assert.equal((await worker.fetch(request(), env)).status, 403);
        globalThis.fetch = async () => new Response("bad", { status: 500 });
        assert.equal((await worker.fetch(request(), env)).status, 403);
        assert.equal((await worker.fetch(new Request("https://pocdigital.org/"), env)).status, 200);
        assert.equal((await worker.fetch(new Request("https://pocdigital.org/api/contact"), env)).status, 405);
        assert.equal((await worker.fetch(new Request("https://pocdigital.org/api/missing"), env)).status, 404);
        assert.equal(sent, 1);
    } finally { globalThis.fetch = original; }
});
