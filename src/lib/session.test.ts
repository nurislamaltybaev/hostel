// Run: npm test
import assert from "node:assert";
import { test } from "node:test";

process.env.SESSION_SECRET = "test-secret-test-secret-test-secret-1234";

test("session token: roundtrip, tampering, expiry", async () => {
  const { createSessionToken, verifySessionToken, SESSION_MAX_AGE } = await import("./session");
  const now = 1_000_000;
  const token = createSessionToken("admin", now);

  assert.deepEqual(verifySessionToken(token, now), { username: "admin" });
  assert.equal(verifySessionToken(token, now + SESSION_MAX_AGE * 1000 + 1), null, "expired");
  assert.equal(verifySessionToken(undefined), null);
  assert.equal(verifySessionToken("garbage"), null);

  const [payload, signature] = token.split(".");
  const forged = Buffer.from(JSON.stringify({ u: "root", exp: now * 10 })).toString("base64url");
  assert.equal(verifySessionToken(`${forged}.${signature}`, now), null, "forged payload");
  assert.equal(verifySessionToken(`${payload}.${"A".repeat(signature.length)}`, now), null, "bad signature");
});
