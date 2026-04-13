import { randomUUID } from "node:crypto";
import { Client } from "pg";

const BASE_URL = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000/api/v1";
const ADMIN_EMAIL = process.env.SMOKE_ADMIN_EMAIL ?? "admin@flyingclass.com";
const ADMIN_PASSWORD = process.env.SMOKE_ADMIN_PASSWORD ?? "password123";

const results = [];

function logResult(name, ok, status, expected, body) {
  results.push({ name, ok, status, expected, body });
  const mark = ok ? "PASS" : "FAIL";
  const expectedText = Array.isArray(expected) ? expected.join("|") : expected;

  console.log(`[${mark}] ${name} -> status=${status}, expected=${expectedText}`);
  if (!ok && body) {
    console.log(`  body: ${body.slice(0, 400)}`);
  }
}

async function request(name, method, path, options = {}) {
  const { headers = {}, body, expected = [200] } = options;
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body,
    redirect: "manual",
  });

  const text = await response.text();
  const ok = expected.includes(response.status);
  logResult(name, ok, response.status, expected, text);

  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  return { response, text, json, ok };
}

async function readLatestVerificationToken(email) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for smoke test token lookup.");
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    const query = await client.query(
      'select token from email_verifications where email = $1 order by "createdAt" desc limit 1',
      [email],
    );
    return query.rows[0]?.token ?? null;
  } finally {
    await client.end();
  }
}

async function run() {
  await request("GET /health/liveness", "GET", "/health/liveness", {
    expected: [200],
  });
  await request("GET /health/readiness", "GET", "/health/readiness", {
    expected: [200],
  });

  const userEmail = `smoke-${Date.now()}@example.com`;
  const userPassword = "password123";
  const fullName = "Smoke Tester";

  await request("POST /auth/register", "POST", "/auth/register", {
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: userEmail,
      fullName,
      password: userPassword,
      role: "LECTURER",
    }),
    expected: [201],
  });

  const verifyToken = await readLatestVerificationToken(userEmail);
  if (!verifyToken) {
    logResult("DB lookup verification token", false, "n/a", "token exists", "No token found.");
  } else {
    await request("GET /auth/verify", "GET", `/auth/verify?token=${encodeURIComponent(verifyToken)}`, {
      expected: [302],
    });
  }

  const userLogin = await request("POST /auth/login (user)", "POST", "/auth/login", {
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: userEmail, password: userPassword }),
    expected: [200],
  });

  const userAccessToken = userLogin.json?.access_token;
  const userRefreshToken = userLogin.json?.refresh_token;

  if (userRefreshToken) {
    await request("POST /auth/refresh (user)", "POST", "/auth/refresh", {
      headers: { authorization: `Bearer ${userRefreshToken}` },
      expected: [200],
    });
  } else {
    logResult("POST /auth/refresh (user)", false, "n/a", [200], "No refresh token from login.");
  }

  await request("POST /auth/forgot-password", "POST", "/auth/forgot-password", {
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: userEmail }),
    expected: [200],
  });

  await request("POST /auth/reset-password (invalid token)", "POST", "/auth/reset-password", {
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      token: `invalid-${randomUUID()}`,
      newPassword: "newpassword123",
    }),
    expected: [400],
  });

  if (userAccessToken) {
    await request("GET /kyc/me (before submit)", "GET", "/kyc/me", {
      headers: { authorization: `Bearer ${userAccessToken}` },
      expected: [200],
    });

    const form = new FormData();
    form.append(
      "identityCard",
      new Blob(["demo identity card content"], { type: "application/pdf" }),
      "identity.pdf",
    );
    form.append(
      "supportingDocuments",
      new Blob(["demo cert content"], { type: "application/pdf" }),
      "certificate-1.pdf",
    );
    form.append(
      "supportingDocuments",
      new Blob(["demo cert content 2"], { type: "application/pdf" }),
      "certificate-2.pdf",
    );

    await request("POST /kyc/submit", "POST", "/kyc/submit", {
      headers: { authorization: `Bearer ${userAccessToken}` },
      body: form,
      expected: [201],
    });

    await request("GET /kyc/me (after submit)", "GET", "/kyc/me", {
      headers: { authorization: `Bearer ${userAccessToken}` },
      expected: [200],
    });

    await request("POST /auth/logout (user)", "POST", "/auth/logout", {
      headers: { authorization: `Bearer ${userAccessToken}` },
      expected: [200],
    });
  } else {
    logResult("POST /kyc/submit", false, "n/a", [201], "No access token from user login.");
    logResult("POST /auth/logout (user)", false, "n/a", [200], "No access token from user login.");
  }

  const adminLogin = await request("POST /auth/login (admin)", "POST", "/auth/login", {
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    expected: [200],
  });

  const adminAccessToken = adminLogin.json?.access_token;
  if (!adminAccessToken) {
    logResult("Admin token acquisition", false, "n/a", [200], "Admin login did not return access_token.");
    return;
  }

  const adminHeaders = { authorization: `Bearer ${adminAccessToken}` };

  await request("GET /admin/kyc", "GET", "/admin/kyc?page=1&limit=5", {
    headers: adminHeaders,
    expected: [200],
  });
  await request("GET /admin/kyc/stats", "GET", "/admin/kyc/stats", {
    headers: adminHeaders,
    expected: [200],
  });
  await request("GET /admin/finance/dashboard", "GET", "/admin/finance/dashboard", {
    headers: adminHeaders,
    expected: [200],
  });
  await request("GET /admin/settings", "GET", "/admin/settings", {
    headers: adminHeaders,
    expected: [200],
  });

  const settingsResponse = await fetch(`${BASE_URL}/admin/settings`, { headers: adminHeaders });
  const settings = await settingsResponse.json().catch(() => []);
  const settingKey = Array.isArray(settings) ? settings[0]?.key : undefined;

  if (settingKey) {
    await request("PATCH /admin/settings/:key", "PATCH", `/admin/settings/${encodeURIComponent(settingKey)}`, {
      headers: { ...adminHeaders, "content-type": "application/json" },
      body: JSON.stringify({ value: `smoke-${Date.now()}` }),
      expected: [200],
    });
  } else {
    logResult(
      "PATCH /admin/settings/:key",
      false,
      settingsResponse.status,
      [200],
      "No system settings found to update.",
    );
  }

  const missingId = randomUUID();

  await request("PATCH /admin/users/:id/status (not found)", "PATCH", `/admin/users/${missingId}/status`, {
    headers: { ...adminHeaders, "content-type": "application/json" },
    body: JSON.stringify({ isActive: false, reason: "smoke test" }),
    expected: [404],
  });

  await request("PATCH /admin/courses/:id/review (not found)", "PATCH", `/admin/courses/${missingId}/review`, {
    headers: { ...adminHeaders, "content-type": "application/json" },
    body: JSON.stringify({ status: "APPROVED" }),
    expected: [404],
  });

  await request(
    "PATCH /admin/finance/payouts/:id/review (not found)",
    "PATCH",
    `/admin/finance/payouts/${missingId}/review`,
    {
      headers: { ...adminHeaders, "content-type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED", transactionRef: "smoke-tx" }),
      expected: [404],
    },
  );

  await request("PATCH /admin/kyc/:id/review (not found)", "PATCH", `/admin/kyc/${missingId}/review`, {
    headers: { ...adminHeaders, "content-type": "application/json" },
    body: JSON.stringify({ status: "APPROVED" }),
    expected: [404],
  });

  await request("PATCH /kyc/:id/review (legacy route)", "PATCH", `/kyc/${missingId}/review`, {
    headers: { ...adminHeaders, "content-type": "application/json" },
    body: JSON.stringify({ status: "APPROVED" }),
    expected: [404],
  });
}

run()
  .catch((error) => {
    console.error("Smoke test aborted:", error?.stack ?? error?.message ?? error);
    process.exitCode = 1;
  })
  .finally(() => {
    const passed = results.filter((result) => result.ok).length;
    const failed = results.length - passed;

    console.log("\n=== API SMOKE SUMMARY ===");
    console.log(`BASE_URL: ${BASE_URL}`);
    console.log(`TOTAL: ${results.length}, PASS: ${passed}, FAIL: ${failed}`);

    if (failed > 0) {
      console.log("Failed checks:");
      for (const result of results.filter((item) => !item.ok)) {
        const expected = Array.isArray(result.expected)
          ? result.expected.join("|")
          : result.expected;
        console.log(`- ${result.name}: got ${result.status}, expected ${expected}`);
      }
      process.exitCode = 1;
    }
  });
