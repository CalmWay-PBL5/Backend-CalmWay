import fs from "node:fs";

const OUT_FILE = "/app/docs/api-v1-all-routes.postman_collection.json";

const md = (lines) => lines.join("\n");

const script = (listen, exec) => ({
  listen,
  script: { type: "text/javascript", exec },
});

const bearerAuth = (variableName) => ({
  type: "bearer",
  bearer: [{ key: "token", value: `{{${variableName}}}`, type: "string" }],
});

const toQueryArray = (query) =>
  Object.entries(query).map(([key, value]) => ({ key, value: String(value) }));

const makeUrl = (route, query) => {
  const clean = route.replace(/^\//, "");
  const queryString = query
    ? `?${Object.entries(query)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&")}`
    : "";

  return {
    raw: `{{base_url}}/${clean}${queryString}`,
    host: ["{{base_url}}"],
    path: clean.split("/").filter(Boolean),
    ...(query ? { query: toQueryArray(query) } : {}),
  };
};

const unique = (arr) => [...new Set(arr)];

const extractTemplateVarsFromText = (input) => {
  const text = String(input ?? "");
  return [...text.matchAll(/\{\{([^}]+)\}\}/g)].map((m) => m[1].trim()).filter(Boolean);
};

const extractTemplateVarsFromObject = (obj) => {
  if (typeof obj === "undefined" || obj === null) {
    return [];
  }
  return extractTemplateVarsFromText(JSON.stringify(obj));
};

const extractSetVarsFromScripts = (scriptLines = []) => {
  const vars = [];
  for (const line of scriptLines) {
    for (const m of line.matchAll(/pm\.collectionVariables\.set\('([^']+)'/g)) {
      vars.push(m[1]);
    }
    for (const m of line.matchAll(/pm\.collectionVariables\.set\("([^"]+)"/g)) {
      vars.push(m[1]);
    }
  }
  return unique(vars);
};

const buildRequestDescription = ({
  method,
  route,
  noAuth,
  authVar,
  query,
  body,
  formdata,
  prerequest,
  test,
  description,
  contentType,
}) => {
  const varsInRequest = unique([
    ...extractTemplateVarsFromText(route),
    ...extractTemplateVarsFromObject(query),
    ...extractTemplateVarsFromObject(body),
    ...extractTemplateVarsFromObject(formdata),
    ...extractTemplateVarsFromText(authVar ? `{{${authVar}}}` : ""),
  ]);
  const varsSetByScripts = unique([
    ...extractSetVarsFromScripts(prerequest || []),
    ...extractSetVarsFromScripts(test || []),
  ]);

  const lines = [
    "## API này dùng để làm gì?",
    description || "Request này dùng để kiểm thử endpoint theo đúng contract backend.",
    "",
    "## Thông tin request",
    `- Method: \`${method}\``,
    `- URL: \`{{base_url}}${route}\``,
    `- Auth: ${noAuth ? "`No Auth`" : authVar ? `\`Bearer {{${authVar}}}\`` : "`Inherited / default`"}`,
    `- Content-Type: \`${contentType}\``,
  ];

  if (query && Object.keys(query).length > 0) {
    lines.push(`- Query mẫu: \`${JSON.stringify(query)}\``);
  }

  if (body) {
    lines.push(`- Body mẫu: \`JSON\``);
  }

  if (formdata) {
    lines.push(`- Body mẫu: \`multipart/form-data\``);
  }

  lines.push("", "## Chuẩn bị trước khi test");
  lines.push("1. Đảm bảo server chạy và `base_url` đúng.");
  if (!noAuth && authVar) {
    lines.push(`2. Đảm bảo biến token \`${authVar}\` đã có giá trị hợp lệ (chạy login trước).`);
  } else {
    lines.push("2. Request này không yêu cầu token.");
  }

  if (varsInRequest.length) {
    lines.push(`3. Kiểm tra các biến đầu vào: ${varsInRequest.map((v) => `\`${v}\``).join(", ")}.`);
  } else {
    lines.push("3. Không cần thêm biến đầu vào ngoài `base_url`.");
  }

  lines.push("", "## Cách test chi tiết");
  lines.push("1. Mở request và kiểm tra lại URL/query/body theo nhu cầu test.");
  lines.push("2. Bấm `Send`.");
  lines.push("3. Kiểm tra status code + response body trả về.");
  lines.push("4. Nếu test luồng lỗi, thử dữ liệu thiếu/sai format để xác nhận validation.");

  if (varsSetByScripts.length) {
    lines.push(
      `5. Script của request sẽ tự cập nhật biến: ${varsSetByScripts.map((v) => `\`${v}\``).join(", ")}.`,
    );
  }

  lines.push("", "## Kỳ vọng");
  lines.push("- Happy path: nhận response 2xx và dữ liệu đúng schema.");
  lines.push("- Error path: nhận 4xx/5xx với message phù hợp khi dữ liệu/token không hợp lệ.");

  return md(lines);
};

const jsonRequest = ({
  name,
  method,
  route,
  query,
  authVar,
  noAuth = false,
  body,
  description,
  prerequest,
  test,
}) => ({
  name,
  ...(prerequest || test
    ? {
        event: [
          ...(prerequest ? [script("prerequest", prerequest)] : []),
          ...(test ? [script("test", test)] : []),
        ],
      }
    : {}),
  request: {
    ...(noAuth ? { auth: { type: "noauth" } } : authVar ? { auth: bearerAuth(authVar) } : {}),
    method,
    header: body
      ? [{ key: "Content-Type", value: "application/json", type: "text" }]
      : [],
    ...(body
      ? {
          body: {
            mode: "raw",
            raw: JSON.stringify(body, null, 2),
            options: { raw: { language: "json" } },
          },
        }
      : {}),
    url: makeUrl(route, query),
    description: buildRequestDescription({
      method,
      route,
      noAuth,
      authVar,
      query,
      body,
      prerequest,
      test,
      description,
      contentType: "application/json",
    }),
  },
  response: [],
});

const formDataRequest = ({
  name,
  method,
  route,
  query,
  authVar,
  noAuth = false,
  formdata,
  description,
  prerequest,
  test,
}) => ({
  name,
  ...(prerequest || test
    ? {
        event: [
          ...(prerequest ? [script("prerequest", prerequest)] : []),
          ...(test ? [script("test", test)] : []),
        ],
      }
    : {}),
  request: {
    ...(noAuth ? { auth: { type: "noauth" } } : authVar ? { auth: bearerAuth(authVar) } : {}),
    method,
    header: [],
    body: { mode: "formdata", formdata },
    url: makeUrl(route, query),
    description: buildRequestDescription({
      method,
      route,
      noAuth,
      authVar,
      query,
      formdata,
      prerequest,
      test,
      description,
      contentType: "multipart/form-data",
    }),
  },
  response: [],
});

const folder = (name, item, options = {}) => ({
  name,
  item,
  ...(options.description ? { description: options.description } : {}),
  ...(options.authVar ? { auth: bearerAuth(options.authVar) } : {}),
  ...(options.prerequest || options.test
    ? {
        event: [
          ...(options.prerequest ? [script("prerequest", options.prerequest)] : []),
          ...(options.test ? [script("test", options.test)] : []),
        ],
      }
    : {}),
});

const commonTestScript = [
  "pm.test('Status code is valid HTTP', function () {",
  "  pm.expect(pm.response.code).to.be.within(100, 599);",
  "});",
  "pm.collectionVariables.set('last_status_code', String(pm.response.code));",
  "pm.collectionVariables.set('last_response_time_ms', String(pm.response.responseTime));",
  "pm.collectionVariables.set('last_request_name', pm.info.requestName);",
  "let body = null;",
  "try { body = pm.response.json(); } catch (_) {}",
  "if (body && typeof body === 'object') {",
  "  if (body.id) pm.collectionVariables.set('last_entity_id', String(body.id));",
  "  if (body.data && Array.isArray(body.data) && body.data.length && body.data[0]?.id) {",
  "    pm.collectionVariables.set('last_list_first_id', String(body.data[0].id));",
  "  }",
  "}",
];

const loginTestScript = (rolePrefix) => [
  "pm.test('Login success', function () { pm.response.to.have.status(200); });",
  "const json = pm.response.json();",
  "pm.test('Has access token', function () { pm.expect(json.access_token).to.be.a('string').and.not.empty; });",
  "pm.collectionVariables.set('" + rolePrefix + "_access_token', json.access_token || '');",
  "pm.collectionVariables.set('" + rolePrefix + "_refresh_token', json.refresh_token || '');",
  "if (json?.user?.id) pm.collectionVariables.set('" + rolePrefix + "_user_id', String(json.user.id));",
  "pm.collectionVariables.set('current_role', '" + rolePrefix + "');",
  "pm.collectionVariables.set('current_access_token', json.access_token || '');",
  "pm.collectionVariables.set('current_refresh_token', json.refresh_token || '');",
];

const createClassTestScript = [
  "pm.test('Create class success', function () { pm.expect(pm.response.code).to.be.oneOf([200, 201]); });",
  "const json = pm.response.json();",
  "if (json?.id) pm.collectionVariables.set('class_id', String(json.id));",
  "if (json?.id) pm.collectionVariables.set('active_class_id', String(json.id));",
];

const listClassCaptureScript = [
  "pm.test('List classes success', function () { pm.response.to.have.status(200); });",
  "const json = pm.response.json();",
  "const first = Array.isArray(json) ? json[0] : json?.data?.[0] || json?.items?.[0];",
  "if (first?.id) pm.collectionVariables.set('class_id', String(first.id));",
  "const trash = (Array.isArray(json) ? json : json?.data || json?.items || []).find((x) => x?.status === 'PENDING_DELETE');",
  "if (trash?.id) pm.collectionVariables.set('trash_class_id', String(trash.id));",
];

const listKycCaptureScript = [
  "pm.test('KYC list success', function () { pm.response.to.have.status(200); });",
  "const json = pm.response.json();",
  "const first = Array.isArray(json) ? json[0] : json?.data?.[0] || json?.items?.[0];",
  "if (first?.id) pm.collectionVariables.set('kyc_application_id', String(first.id));",
];

const getMyKycCaptureScript = [
  "pm.test('Get my KYC success', function () { pm.response.to.have.status(200); });",
  "const json = pm.response.json();",
  "if (json?.id) pm.collectionVariables.set('my_kyc_id', String(json.id));",
  "if (json?.id) pm.collectionVariables.set('kyc_application_id', String(json.id));",
];

const createCloudDocCaptureScript = [
  "pm.test('Create cloud doc success', function () { pm.expect(pm.response.code).to.be.oneOf([200, 201]); });",
  "const json = pm.response.json();",
  "if (json?.id) pm.collectionVariables.set('cloud_doc_id', String(json.id));",
];

const sendChatCaptureScript = [
  "pm.test('Send chat message success', function () { pm.expect(pm.response.code).to.be.oneOf([200, 201]); });",
  "const json = pm.response.json();",
  "if (json?.id) pm.collectionVariables.set('chat_message_id', String(json.id));",
];

const collectionDescription = md([
  "## Mục tiêu",
  "Collection này tối ưu cho test nhanh toàn bộ API `api/v1` theo flow thực tế.",
  "",
  "## Cách dùng nhanh",
  "1. Import collection này vào Postman.",
  "2. Chạy folder `00 - Setup & Health` trước để khởi tạo biến.",
  "3. Chạy các request login trong `01 - Auth` để tự lưu token/ids.",
  "4. Chạy lần lượt các folder còn lại.",
  "",
  "## Quy ước biến",
  "- `*_access_token`, `*_refresh_token`: token theo role.",
  "- `*_user_id`: user id theo role, tự set từ login.",
  "- `class_id`, `cloud_doc_id`, `chat_message_id`, `kyc_application_id`: tự cập nhật từ API tạo/list.",
  "- `course_id`, `payout_id`: cần set tay nếu bạn muốn test route review cụ thể phía admin.",
  "",
  "## Seed khuyến nghị",
  "Dùng dữ liệu seed full để test ổn định (các account seed và token verify/reset đã có sẵn).",
]);

const collection = {
  info: {
    _postman_id: "f0f009ab-2d7f-4b58-a174-optimized-api-v1",
    name: "FlyingClass API v1 - Optimized Test Collection",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    description: collectionDescription,
  },
  variable: [
    { key: "base_url", value: "http://localhost:3001/api/v1", type: "string" },
    { key: "run_id", value: "", type: "string" },

    { key: "admin_email", value: "admin@flyingclass.com", type: "string" },
    { key: "admin_password", value: "password123", type: "string" },

    { key: "lecturer_approved_email", value: "lecturer.approved@flyingclass.com", type: "string" },
    { key: "lecturer_pending_email", value: "lecturer.pending@flyingclass.com", type: "string" },
    { key: "lecturer_rejected_email", value: "lecturer.rejected@flyingclass.com", type: "string" },
    { key: "lecturer_password", value: "password123", type: "string" },

    { key: "student_a_email", value: "student.a@flyingclass.com", type: "string" },
    { key: "student_b_email", value: "student.b@flyingclass.com", type: "string" },
    { key: "student_unverified_email", value: "student.unverified@flyingclass.com", type: "string" },
    { key: "student_password", value: "password123", type: "string" },

    { key: "verify_email_token", value: "seed-verify-email-token-student-unverified", type: "string" },
    { key: "reset_password_token", value: "seed-reset-password-token-student-a", type: "string" },

    { key: "admin_access_token", value: "", type: "string" },
    { key: "admin_refresh_token", value: "", type: "string" },
    { key: "admin_user_id", value: "", type: "string" },

    { key: "lecturer_access_token", value: "", type: "string" },
    { key: "lecturer_refresh_token", value: "", type: "string" },
    { key: "lecturer_user_id", value: "", type: "string" },

    { key: "student_access_token", value: "", type: "string" },
    { key: "student_refresh_token", value: "", type: "string" },
    { key: "student_user_id", value: "", type: "string" },

    { key: "current_role", value: "", type: "string" },
    { key: "current_access_token", value: "", type: "string" },
    { key: "current_refresh_token", value: "", type: "string" },

    { key: "class_id", value: "", type: "string" },
    { key: "active_class_id", value: "", type: "string" },
    { key: "trash_class_id", value: "", type: "string" },
    { key: "cloud_doc_id", value: "", type: "string" },
    { key: "chat_message_id", value: "", type: "string" },
    { key: "kyc_application_id", value: "", type: "string" },
    { key: "my_kyc_id", value: "", type: "string" },
    { key: "course_id", value: "", type: "string" },
    { key: "payout_id", value: "", type: "string" },
    { key: "target_user_id", value: "", type: "string" },
    { key: "setting_key", value: "PLATFORM_COMMISSION_RATE", type: "string" },

    { key: "sample_image_path", value: "/absolute/path/to/image.jpg", type: "string" },
    { key: "sample_doc_path", value: "/absolute/path/to/document.pdf", type: "string" },
    { key: "revenue_year", value: String(new Date().getUTCFullYear()), type: "string" },

    { key: "last_status_code", value: "", type: "string" },
    { key: "last_response_time_ms", value: "", type: "string" },
    { key: "last_request_name", value: "", type: "string" },
    { key: "last_entity_id", value: "", type: "string" },
    { key: "last_list_first_id", value: "", type: "string" },
  ],
  event: [
    script("prerequest", [
      "const now = Date.now();",
      "if (!pm.collectionVariables.get('run_id')) pm.collectionVariables.set('run_id', String(now));",
      "if (!pm.collectionVariables.get('target_user_id') && pm.collectionVariables.get('student_user_id')) {",
      "  pm.collectionVariables.set('target_user_id', pm.collectionVariables.get('student_user_id'));",
      "}",
      "if (!pm.collectionVariables.get('base_url')) pm.collectionVariables.set('base_url', 'http://localhost:3001/api/v1');",
    ]),
    script("test", commonTestScript),
  ],
  item: [
    folder(
      "00 - Setup & Health",
      [
        jsonRequest({
          name: "Initialize dynamic variables",
          method: "GET",
          route: "/health/liveness",
          noAuth: true,
          description: md([
            "Khởi tạo biến runtime để test mượt hơn.",
            "",
            "Script sẽ:",
            "- set `run_id`",
            "- map `target_user_id` từ `student_user_id` nếu có",
          ]),
          test: [
            "pm.test('Health liveness ok', function () { pm.response.to.have.status(200); });",
            "if (!pm.collectionVariables.get('run_id')) pm.collectionVariables.set('run_id', String(Date.now()));",
          ],
        }),
        jsonRequest({
          name: "GET /health/liveness",
          method: "GET",
          route: "/health/liveness",
          noAuth: true,
          description: "Kiểm tra app còn sống (memory checks).",
        }),
        jsonRequest({
          name: "GET /health/readiness",
          method: "GET",
          route: "/health/readiness",
          noAuth: true,
          description: "Kiểm tra app sẵn sàng phục vụ (database, redis, minio).",
        }),
      ],
      {
        description: "Folder khởi động để đảm bảo môi trường test ổn trước khi chạy flow chính.",
      },
    ),

    folder(
      "01 - Auth",
      [
        jsonRequest({
          name: "POST /auth/register (student)",
          method: "POST",
          route: "/auth/register",
          noAuth: true,
          description: md([
            "Đăng ký tài khoản học viên mới.",
            "",
            "Khi chạy collection thường xuyên, email sẽ tự unique theo `run_id`.",
          ]),
          prerequest: [
            "const email = `student.register.${pm.collectionVariables.get('run_id')}@example.com`;",
            "pm.collectionVariables.set('student_register_email', email);",
          ],
          body: {
            email: "{{student_register_email}}",
            password: "{{student_password}}",
            fullName: "Student Register API",
            role: "STUDENT",
          },
        }),
        jsonRequest({
          name: "POST /auth/register (lecturer)",
          method: "POST",
          route: "/auth/register",
          noAuth: true,
          description: "Đăng ký tài khoản giảng viên mới để test flow verify + KYC.",
          prerequest: [
            "const email = `lecturer.register.${pm.collectionVariables.get('run_id')}@example.com`;",
            "pm.collectionVariables.set('lecturer_register_email', email);",
          ],
          body: {
            email: "{{lecturer_register_email}}",
            password: "{{lecturer_password}}",
            fullName: "Lecturer Register API",
            role: "LECTURER",
          },
        }),
        jsonRequest({
          name: "GET /auth/verify",
          method: "GET",
          route: "/auth/verify",
          query: { token: "{{verify_email_token}}" },
          noAuth: true,
          description: "Xác thực email theo token. Với seed hiện tại có token mặc định trong biến `verify_email_token`.",
        }),
        jsonRequest({
          name: "POST /auth/login (admin)",
          method: "POST",
          route: "/auth/login",
          noAuth: true,
          body: {
            email: "{{admin_email}}",
            password: "{{admin_password}}",
          },
          description: "Đăng nhập admin, tự lưu `admin_access_token`, `admin_refresh_token`, `admin_user_id`.",
          test: loginTestScript("admin"),
        }),
        jsonRequest({
          name: "POST /auth/login (lecturer approved)",
          method: "POST",
          route: "/auth/login",
          noAuth: true,
          body: {
            email: "{{lecturer_approved_email}}",
            password: "{{lecturer_password}}",
          },
          description: "Đăng nhập giảng viên đã approved KYC, tự lưu token/ids role lecturer.",
          test: loginTestScript("lecturer"),
        }),
        jsonRequest({
          name: "POST /auth/login (student A)",
          method: "POST",
          route: "/auth/login",
          noAuth: true,
          body: {
            email: "{{student_a_email}}",
            password: "{{student_password}}",
          },
          description: "Đăng nhập student A, tự lưu token/ids role student.",
          test: loginTestScript("student"),
        }),
        jsonRequest({
          name: "POST /auth/login (student B, capture target_user_id)",
          method: "POST",
          route: "/auth/login",
          noAuth: true,
          body: {
            email: "{{student_b_email}}",
            password: "{{student_password}}",
          },
          description: "Đăng nhập student B để lấy id dùng cho admin toggle status (`target_user_id`).",
          test: [
            ...loginTestScript("student"),
            "const json = pm.response.json();",
            "if (json?.user?.id) pm.collectionVariables.set('target_user_id', String(json.user.id));",
          ],
        }),
        jsonRequest({
          name: "POST /auth/refresh (admin)",
          method: "POST",
          route: "/auth/refresh",
          authVar: "admin_refresh_token",
          description: "Lấy access/refresh token mới cho admin bằng refresh token (Bearer refresh token).",
          test: loginTestScript("admin"),
        }),
        jsonRequest({
          name: "POST /auth/refresh (lecturer)",
          method: "POST",
          route: "/auth/refresh",
          authVar: "lecturer_refresh_token",
          description: "Lấy access/refresh token mới cho lecturer bằng refresh token.",
          test: loginTestScript("lecturer"),
        }),
        jsonRequest({
          name: "POST /auth/refresh (student)",
          method: "POST",
          route: "/auth/refresh",
          authVar: "student_refresh_token",
          description: "Lấy access/refresh token mới cho student bằng refresh token.",
          test: loginTestScript("student"),
        }),
        jsonRequest({
          name: "POST /auth/logout (student)",
          method: "POST",
          route: "/auth/logout",
          authVar: "student_access_token",
          description: "Đăng xuất user hiện tại (clear refresh token đã lưu phía backend).",
        }),
        jsonRequest({
          name: "POST /auth/forgot-password",
          method: "POST",
          route: "/auth/forgot-password",
          noAuth: true,
          body: {
            email: "{{student_a_email}}",
          },
          description: "Yêu cầu reset password; backend tạo token reset và gửi mail/queue.",
        }),
        jsonRequest({
          name: "POST /auth/reset-password",
          method: "POST",
          route: "/auth/reset-password",
          noAuth: true,
          body: {
            token: "{{reset_password_token}}",
            newPassword: "NewPassword123!",
          },
          description: "Đặt lại mật khẩu theo token reset. Token seed có sẵn trong biến `reset_password_token`.",
          test: [
            "pm.test('Reset password success', function () { pm.response.to.have.status(200); });",
            "pm.collectionVariables.set('student_password', 'NewPassword123!');",
          ],
        }),
      ],
      {
        description: "Nhóm API xác thực: register, verify email, login, refresh token, forgot/reset password, logout.",
      },
    ),

    folder(
      "02 - Teacher Profile",
      [
        jsonRequest({
          name: "GET /teachers/me/profile",
          method: "GET",
          route: "/teachers/me/profile",
          authVar: "lecturer_access_token",
          description: "Lấy hồ sơ giảng viên đang đăng nhập.",
        }),
        jsonRequest({
          name: "PUT /teachers/me/profile (JSON)",
          method: "PUT",
          route: "/teachers/me/profile",
          authVar: "lecturer_access_token",
          body: {
            fullName: "Lecturer API Updated",
            phone: "0909990001",
            bio: "Updated by optimized Postman collection",
          },
          description: "Cập nhật thông tin profile dạng JSON (không upload file).",
        }),
        formDataRequest({
          name: "PUT /teachers/me/profile (Multipart + KYC files)",
          method: "PUT",
          route: "/teachers/me/profile",
          authVar: "lecturer_access_token",
          description: md([
            "Cập nhật profile + upload avatar + KYC cùng lúc.",
            "",
            "Form-data fields:",
            "- `avatar` (file)",
            "- `identityCard` (file)",
            "- `supportingDocuments` (file, có thể nhiều)",
          ]),
          formdata: [
            { key: "fullName", value: "Lecturer Multipart Updated", type: "text" },
            { key: "phone", value: "0909990002", type: "text" },
            { key: "bio", value: "Multipart update profile", type: "text" },
            { key: "avatar", type: "file", src: "{{sample_image_path}}" },
            { key: "identityCard", type: "file", src: "{{sample_image_path}}" },
            { key: "supportingDocuments", type: "file", src: "{{sample_doc_path}}" },
          ],
        }),
      ],
      {
        description: "Nhóm API profile giảng viên. Cần token lecturer.",
      },
    ),

    folder(
      "03 - Teacher Classes",
      [
        jsonRequest({
          name: "GET /teachers/me/classes/subjects",
          method: "GET",
          route: "/teachers/me/classes/subjects",
          authVar: "lecturer_access_token",
          description: "Lấy danh sách môn học để tạo/cập nhật lớp.",
        }),
        jsonRequest({
          name: "POST /teachers/me/classes",
          method: "POST",
          route: "/teachers/me/classes",
          authVar: "lecturer_access_token",
          description: "Tạo lớp học mới. Script tự lưu `class_id`.",
          body: {
            title: "Class Created From Optimized Collection",
            description: "Class for e2e route testing",
            price: 149000,
            type: "PUBLIC",
            maxStudents: 35,
          },
          test: createClassTestScript,
        }),
        jsonRequest({
          name: "GET /teachers/me/classes",
          method: "GET",
          route: "/teachers/me/classes",
          authVar: "lecturer_access_token",
          description: "Lấy danh sách lớp active của giảng viên. Script tự bắt `class_id` đầu tiên.",
          test: listClassCaptureScript,
        }),
        jsonRequest({
          name: "GET /teachers/me/classes/dashboard/stats",
          method: "GET",
          route: "/teachers/me/classes/dashboard/stats",
          authVar: "lecturer_access_token",
          description: "Lấy thống kê dashboard lớp học của giảng viên.",
        }),
        jsonRequest({
          name: "GET /teachers/me/classes/reviews/detailed",
          method: "GET",
          route: "/teachers/me/classes/reviews/detailed",
          authVar: "lecturer_access_token",
          description: "Lấy danh sách review chi tiết cho các lớp của giảng viên.",
        }),
        jsonRequest({
          name: "GET /teachers/me/classes/trash",
          method: "GET",
          route: "/teachers/me/classes/trash",
          authVar: "lecturer_access_token",
          description: "Lấy danh sách lớp đang trong thùng rác.",
          test: [
            "const json = pm.response.json();",
            "const first = Array.isArray(json) ? json[0] : json?.data?.[0] || json?.items?.[0];",
            "if (first?.id) pm.collectionVariables.set('trash_class_id', String(first.id));",
          ],
        }),
        jsonRequest({
          name: "POST /teachers/me/classes/trash/cleanup",
          method: "POST",
          route: "/teachers/me/classes/trash/cleanup",
          authVar: "lecturer_access_token",
          description: "Xóa vĩnh viễn các lớp trong trash của giảng viên.",
        }),
        jsonRequest({
          name: "GET /teachers/me/classes/export/all",
          method: "GET",
          route: "/teachers/me/classes/export/all",
          authVar: "lecturer_access_token",
          description: "Export toàn bộ lớp của giảng viên dạng CSV.",
        }),
        jsonRequest({
          name: "GET /teachers/me/classes/export/:id/members",
          method: "GET",
          route: "/teachers/me/classes/export/{{class_id}}/members",
          authVar: "lecturer_access_token",
          description: "Export danh sách thành viên lớp theo `class_id` dạng CSV.",
        }),
        jsonRequest({
          name: "GET /teachers/me/classes/:id",
          method: "GET",
          route: "/teachers/me/classes/{{class_id}}",
          authVar: "lecturer_access_token",
          description: "Lấy chi tiết 1 lớp học.",
        }),
        jsonRequest({
          name: "PATCH /teachers/me/classes/:id",
          method: "PATCH",
          route: "/teachers/me/classes/{{class_id}}",
          authVar: "lecturer_access_token",
          description: "Cập nhật một phần thông tin lớp học.",
          body: {
            title: "Class Patched By Collection",
            price: 179000,
          },
        }),
        jsonRequest({
          name: "PUT /teachers/me/classes/:id",
          method: "PUT",
          route: "/teachers/me/classes/{{class_id}}",
          authVar: "lecturer_access_token",
          description: "Cập nhật đầy đủ thông tin lớp học.",
          body: {
            title: "Class Replaced By Collection",
            description: "Full update request",
            price: 189000,
            type: "PRIVATE",
            maxStudents: 45,
          },
        }),
        jsonRequest({
          name: "DELETE /teachers/me/classes/:id",
          method: "DELETE",
          route: "/teachers/me/classes/{{class_id}}",
          authVar: "lecturer_access_token",
          description: "Chuyển lớp vào trash.",
        }),
        jsonRequest({
          name: "PATCH /teachers/me/classes/:id/restore",
          method: "PATCH",
          route: "/teachers/me/classes/{{class_id}}/restore",
          authVar: "lecturer_access_token",
          description: "Khôi phục lớp từ trash về active.",
        }),
      ],
      {
        description: "Nhóm API quản lý lớp học của giảng viên.",
      },
    ),

    folder(
      "04 - Teacher Class Members",
      [
        jsonRequest({
          name: "POST /teachers/me/class-members",
          method: "POST",
          route: "/teachers/me/class-members",
          authVar: "lecturer_access_token",
          description: "Thêm học sinh vào lớp (dùng `class_id` + `student_user_id`).",
          body: {
            classId: "{{class_id}}",
            studentId: "{{student_user_id}}",
          },
        }),
        jsonRequest({
          name: "GET /teachers/me/class-members/class/:classId",
          method: "GET",
          route: "/teachers/me/class-members/class/{{class_id}}",
          query: { status: "ACTIVE" },
          authVar: "lecturer_access_token",
          description: "Lấy danh sách thành viên của lớp theo trạng thái.",
        }),
        jsonRequest({
          name: "DELETE /teachers/me/class-members/class/:classId/student/:studentId",
          method: "DELETE",
          route: "/teachers/me/class-members/class/{{class_id}}/student/{{student_user_id}}",
          authVar: "lecturer_access_token",
          description: "Xóa học sinh khỏi lớp.",
        }),

        jsonRequest({
          name: "POST /class-members (alias)",
          method: "POST",
          route: "/class-members",
          authVar: "lecturer_access_token",
          description: "Alias route của add class member.",
          body: {
            classId: "{{class_id}}",
            studentId: "{{student_user_id}}",
          },
        }),
        jsonRequest({
          name: "GET /class-members/class/:classId (alias)",
          method: "GET",
          route: "/class-members/class/{{class_id}}",
          query: { status: "ACTIVE" },
          authVar: "lecturer_access_token",
          description: "Alias route của list class members.",
        }),
        jsonRequest({
          name: "DELETE /class-members/class/:classId/student/:studentId (alias)",
          method: "DELETE",
          route: "/class-members/class/{{class_id}}/student/{{student_user_id}}",
          authVar: "lecturer_access_token",
          description: "Alias route của remove class member.",
        }),
      ],
      {
        description: "Nhóm API quản lý thành viên lớp của giảng viên (bao gồm alias routes).",
      },
    ),

    folder(
      "05 - Teacher Students",
      [
        jsonRequest({
          name: "GET /teachers/me/students",
          method: "GET",
          route: "/teachers/me/students",
          query: { skip: 0, take: 20 },
          authVar: "lecturer_access_token",
          description: "Lấy danh sách học sinh đã mua khóa học của giảng viên.",
          test: [
            "const json = pm.response.json();",
            "const first = json?.data?.[0];",
            "if (first?.id) pm.collectionVariables.set('student_user_id', String(first.id));",
            "if (first?.id && !pm.collectionVariables.get('target_user_id')) pm.collectionVariables.set('target_user_id', String(first.id));",
          ],
        }),
        jsonRequest({
          name: "GET /teachers/me/students/search/query",
          method: "GET",
          route: "/teachers/me/students/search/query",
          query: { q: "student", skip: 0, take: 20 },
          authVar: "lecturer_access_token",
          description: "Tìm kiếm học sinh theo từ khóa `q`.",
        }),
        jsonRequest({
          name: "GET /teachers/me/students/stats/overview",
          method: "GET",
          route: "/teachers/me/students/stats/overview",
          authVar: "lecturer_access_token",
          description: "Lấy thống kê tổng quan học sinh của giảng viên.",
        }),
        jsonRequest({
          name: "GET /teachers/me/students/export/all",
          method: "GET",
          route: "/teachers/me/students/export/all",
          authVar: "lecturer_access_token",
          description: "Export toàn bộ học sinh của giảng viên dạng CSV.",
        }),
        jsonRequest({
          name: "GET /teachers/me/students/export/course/:courseId",
          method: "GET",
          route: "/teachers/me/students/export/course/{{course_id}}",
          authVar: "lecturer_access_token",
          description: "Export học sinh theo course cụ thể. Cần set `course_id` trước.",
        }),
        jsonRequest({
          name: "GET /teachers/me/students/:studentId",
          method: "GET",
          route: "/teachers/me/students/{{student_user_id}}",
          authVar: "lecturer_access_token",
          description: "Lấy chi tiết 1 học sinh thuộc tập học sinh của giảng viên.",
        }),
      ],
      {
        description: "Nhóm API quản lý học sinh của giảng viên.",
      },
    ),

    folder(
      "06 - Teacher Revenue",
      [
        jsonRequest({
          name: "GET /teachers/me/revenue/summary",
          method: "GET",
          route: "/teachers/me/revenue/summary",
          authVar: "lecturer_access_token",
          description: "Lấy tóm tắt doanh thu của giảng viên.",
          test: [
            "const json = pm.response.json();",
            "const firstCourse = json?.revenueByCourse?.[0];",
            "if (firstCourse?.courseId) pm.collectionVariables.set('course_id', String(firstCourse.courseId));",
          ],
        }),
        jsonRequest({
          name: "GET /teachers/me/revenue/monthly",
          method: "GET",
          route: "/teachers/me/revenue/monthly",
          query: { year: "{{revenue_year}}" },
          authVar: "lecturer_access_token",
          description: "Lấy doanh thu theo tháng trong 1 năm.",
        }),
      ],
      {
        description: "Nhóm API doanh thu của giảng viên.",
      },
    ),

    folder(
      "07 - KYC",
      [
        formDataRequest({
          name: "POST /kyc/submit",
          method: "POST",
          route: "/kyc/submit",
          authVar: "lecturer_access_token",
          description: md([
            "Nộp hồ sơ KYC cho giảng viên.",
            "",
            "Bắt buộc gửi multipart/form-data với:",
            "- `identityCard` (1 file)",
            "- `supportingDocuments` (>=1 file)",
          ]),
          formdata: [
            { key: "identityCard", type: "file", src: "{{sample_image_path}}" },
            { key: "supportingDocuments", type: "file", src: "{{sample_doc_path}}" },
          ],
        }),
        jsonRequest({
          name: "GET /kyc/me",
          method: "GET",
          route: "/kyc/me",
          authVar: "lecturer_access_token",
          description: "Lấy hồ sơ KYC của giảng viên hiện tại. Script tự lưu `kyc_application_id`.",
          test: getMyKycCaptureScript,
        }),
        jsonRequest({
          name: "PATCH /kyc/:id/review (admin endpoint in KycController)",
          method: "PATCH",
          route: "/kyc/{{kyc_application_id}}/review",
          authVar: "admin_access_token",
          body: {
            status: "APPROVED",
          },
          description: "Duyệt KYC qua route `/kyc/:id/review` (chỉ admin).",
        }),
        jsonRequest({
          name: "GET /admin/kyc",
          method: "GET",
          route: "/admin/kyc",
          query: { page: 1, limit: 10 },
          authVar: "admin_access_token",
          description: "Lấy danh sách KYC cho admin. Script tự bắt id bản ghi đầu tiên.",
          test: listKycCaptureScript,
        }),
        jsonRequest({
          name: "GET /admin/kyc/stats",
          method: "GET",
          route: "/admin/kyc/stats",
          query: {
            start: "2026-01-01",
            end: "2026-12-31",
          },
          authVar: "admin_access_token",
          description: "Lấy thống kê KYC theo khoảng thời gian.",
        }),
        jsonRequest({
          name: "PATCH /admin/kyc/:id/review",
          method: "PATCH",
          route: "/admin/kyc/{{kyc_application_id}}/review",
          authVar: "admin_access_token",
          body: {
            status: "REJECTED",
            rejectionReason: "Need clearer supporting documents",
          },
          description: "Review KYC từ route admin chuẩn.",
        }),
      ],
      {
        description: "Nhóm API KYC của lecturer/admin.",
      },
    ),

    folder(
      "08 - Lessons",
      [
        jsonRequest({
          name: "POST /lessons/cloud-doc",
          method: "POST",
          route: "/lessons/cloud-doc",
          authVar: "lecturer_access_token",
          body: {
            classId: "{{class_id}}",
            title: "Lesson cloud doc from optimized collection",
            url: "https://docs.google.com/document/d/EXAMPLE_ID/edit",
          },
          description: "Tạo bài học cloud-doc cho lớp. Script tự lưu `cloud_doc_id`.",
          test: createCloudDocCaptureScript,
        }),
        jsonRequest({
          name: "GET /lessons/class/:classId/cloud-docs",
          method: "GET",
          route: "/lessons/class/{{class_id}}/cloud-docs",
          authVar: "lecturer_access_token",
          description: "Lấy danh sách cloud-doc của lớp.",
          test: [
            "const json = pm.response.json();",
            "if (Array.isArray(json) && json.length && json[0]?.id) pm.collectionVariables.set('cloud_doc_id', String(json[0].id));",
          ],
        }),
        jsonRequest({
          name: "PATCH /lessons/:id/title",
          method: "PATCH",
          route: "/lessons/{{cloud_doc_id}}/title",
          authVar: "lecturer_access_token",
          body: { title: "Cloud doc title updated" },
          description: "Đổi tiêu đề cloud-doc theo `cloud_doc_id`.",
        }),
        jsonRequest({
          name: "DELETE /lessons/:id",
          method: "DELETE",
          route: "/lessons/{{cloud_doc_id}}",
          authVar: "lecturer_access_token",
          description: "Xóa cloud-doc theo id.",
        }),
      ],
      {
        description: "Nhóm API quản lý lesson cloud-doc.",
      },
    ),

    folder(
      "09 - Chat",
      [
        jsonRequest({
          name: "GET /classes/:classId/chat-history",
          method: "GET",
          route: "/classes/{{class_id}}/chat-history",
          query: { take: 20 },
          authVar: "lecturer_access_token",
          description: "Lấy lịch sử chat lớp (route chuẩn).",
          test: [
            "const json = pm.response.json();",
            "if (Array.isArray(json) && json.length && json[json.length - 1]?.id) pm.collectionVariables.set('chat_message_id', String(json[json.length - 1].id));",
          ],
        }),
        jsonRequest({
          name: "POST /classes/:classId/chat/messages",
          method: "POST",
          route: "/classes/{{class_id}}/chat/messages",
          authVar: "lecturer_access_token",
          body: { content: "Hello class, this is an optimized test message." },
          description: "Gửi tin nhắn chat vào lớp (route chuẩn).",
          test: sendChatCaptureScript,
        }),
        jsonRequest({
          name: "DELETE /classes/:classId/chat/messages/:messageId",
          method: "DELETE",
          route: "/classes/{{class_id}}/chat/messages/{{chat_message_id}}",
          authVar: "lecturer_access_token",
          description: "Xóa tin nhắn chat theo `messageId` (route chuẩn).",
        }),

        jsonRequest({
          name: "GET /chat/classes/:classId/chat-history (alias)",
          method: "GET",
          route: "/chat/classes/{{class_id}}/chat-history",
          query: { take: 20 },
          authVar: "lecturer_access_token",
          description: "Alias route của chat history.",
        }),
        jsonRequest({
          name: "POST /chat/classes/:classId/chat/messages (alias)",
          method: "POST",
          route: "/chat/classes/{{class_id}}/chat/messages",
          authVar: "lecturer_access_token",
          body: { content: "Alias route message." },
          description: "Alias route của gửi chat message.",
          test: sendChatCaptureScript,
        }),
        jsonRequest({
          name: "DELETE /chat/classes/:classId/chat/messages/:messageId (alias)",
          method: "DELETE",
          route: "/chat/classes/{{class_id}}/chat/messages/{{chat_message_id}}",
          authVar: "lecturer_access_token",
          description: "Alias route của xóa chat message.",
        }),
      ],
      {
        description: "Nhóm API chat trong lớp học (bao gồm route alias).",
      },
    ),

    folder(
      "10 - AI Assistant",
      [
        jsonRequest({
          name: "GET /ai-assistant/models",
          method: "GET",
          route: "/ai-assistant/models",
          authVar: "lecturer_access_token",
          description: "Lấy danh sách model AI assistant khả dụng.",
        }),
        jsonRequest({
          name: "POST /ai-assistant/chat (JSON)",
          method: "POST",
          route: "/ai-assistant/chat",
          authVar: "lecturer_access_token",
          body: {
            message: "Tóm tắt nội dung bài học đại số bậc nhất",
          },
          description: "Chat với AI assistant bằng JSON body (không đính kèm file).",
        }),
        formDataRequest({
          name: "POST /ai-assistant/chat (Multipart)",
          method: "POST",
          route: "/ai-assistant/chat",
          authVar: "lecturer_access_token",
          description: "Chat với AI assistant kèm file đính kèm dạng multipart/form-data.",
          formdata: [
            { key: "message", value: "Phân tích file này giúp tôi", type: "text" },
            { key: "file", type: "file", src: "{{sample_doc_path}}" },
          ],
        }),
      ],
      {
        description: "Nhóm API AI assistant.",
      },
    ),

    folder(
      "11 - Admin",
      [
        jsonRequest({
          name: "GET /admin/settings",
          method: "GET",
          route: "/admin/settings",
          authVar: "admin_access_token",
          description: "Lấy toàn bộ system settings.",
          test: [
            "const json = pm.response.json();",
            "if (Array.isArray(json) && json.length && json[0]?.key) pm.collectionVariables.set('setting_key', String(json[0].key));",
          ],
        }),
        jsonRequest({
          name: "PATCH /admin/settings/:key",
          method: "PATCH",
          route: "/admin/settings/{{setting_key}}",
          authVar: "admin_access_token",
          body: { value: "18" },
          description: "Cập nhật giá trị 1 setting theo key.",
        }),
        jsonRequest({
          name: "PATCH /admin/users/:id/status",
          method: "PATCH",
          route: "/admin/users/{{target_user_id}}/status",
          authVar: "admin_access_token",
          body: {
            isActive: false,
            reason: "Seeded test lock action",
          },
          description: "Khóa/mở khóa tài khoản user theo `target_user_id`.",
        }),
        jsonRequest({
          name: "PATCH /admin/courses/:id/review",
          method: "PATCH",
          route: "/admin/courses/{{course_id}}/review",
          authVar: "admin_access_token",
          body: {
            status: "APPROVED",
          },
          description: md([
            "Duyệt khóa học đang ở trạng thái `PENDING_REVIEW`.",
            "",
            "Lưu ý: cần set đúng `course_id` của khóa đang pending review.",
          ]),
        }),
        jsonRequest({
          name: "GET /admin/finance/dashboard",
          method: "GET",
          route: "/admin/finance/dashboard",
          query: {
            startDate: "2026-01-01",
            endDate: "2026-12-31",
          },
          authVar: "admin_access_token",
          description: "Lấy dashboard doanh thu nền tảng.",
        }),
        jsonRequest({
          name: "PATCH /admin/finance/payouts/:id/review",
          method: "PATCH",
          route: "/admin/finance/payouts/{{payout_id}}/review",
          authVar: "admin_access_token",
          body: {
            status: "COMPLETED",
            transactionRef: "BANK-SEED-TXN-001",
          },
          description: md([
            "Duyệt yêu cầu payout (chỉ áp dụng khi payout đang `PENDING`).",
            "",
            "Lưu ý: cần set `payout_id` trước.",
          ]),
        }),
      ],
      {
        description: "Nhóm API quản trị hệ thống (settings/users/courses/finance/kyc).",
      },
    ),
  ],
};

fs.writeFileSync(OUT_FILE, `${JSON.stringify(collection, null, 2)}\n`, "utf8");
console.log(`Generated ${OUT_FILE}`);
console.log(`Folders: ${collection.item.length}`);

let requestCount = 0;
const walk = (items) => {
  for (const it of items) {
    if (it.item) walk(it.item);
    else if (it.request) requestCount += 1;
  }
};
walk(collection.item);
console.log(`Requests: ${requestCount}`);
