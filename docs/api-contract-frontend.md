# FlyingClass API Contract (Frontend Handoff)

## Base
- Base URL: `/api/v1`
- Auth header: `Authorization: Bearer <access_token>`
- Content types:
  - JSON: `application/json`
  - Upload: `multipart/form-data`

## Auth Levels
- `Public`: không cần token
- `JWT`: cần access token
- `JWT Refresh`: cần refresh token guard (`/auth/refresh`)
- `Lecturer`: JWT + role `LECTURER`
- `Admin`: JWT + role `ADMIN`

## Standard Error Shape
- Thực tế trả theo chuẩn exception của NestJS (thường có `statusCode`, `message`, `error`).

---

## 1) Health

| Method | Path | Auth | Request |
|---|---|---|---|
| GET | `/health/liveness` | Public | - |
| GET | `/health/readiness` | Public | - |

---

## 2) Auth

| Method | Path | Auth | Request |
|---|---|---|---|
| POST | `/auth/register` | Public | body: `{ email, fullName, password(min 8), role: STUDENT \| LECTURER }` |
| POST | `/auth/login` | Public | body: `{ email, password(min 8) }` |
| POST | `/auth/refresh` | JWT Refresh | header refresh token (theo guard hiện tại) |
| POST | `/auth/logout` | JWT | - |
| POST | `/auth/forgot-password` | Public | body: `{ email }` |
| POST | `/auth/reset-password` | Public | body: `{ token, newPassword(min 8) }` |
| GET | `/auth/verify?token=...` | Public | query: `token`; response redirect `302` về frontend |

---

## 3) Teacher - Profile

| Method | Path | Auth | Request |
|---|---|---|---|
| GET | `/teachers/me/profile` | Lecturer | - |
| PUT | `/teachers/me/profile` | Lecturer | JSON hoặc multipart. text fields: `fullName?`, `phone?`, `bio?`; file fields: `avatar/avatarFile?`, `identityCard...?(max 1)`, `degrees/supportingDocuments...? (max 10)` |

Note: nếu upload KYC trong endpoint profile thì bắt buộc có đủ 1 file CCCD + ít nhất 1 file chứng chỉ.

---

## 4) Teacher - Classes

| Method | Path | Auth | Request |
|---|---|---|---|
| GET | `/teachers/me/classes/subjects` | Lecturer | - |
| GET | `/teachers/me/classes/reviews/detailed` | Lecturer | - |
| POST | `/teachers/me/classes` | Lecturer | JSON/multipart: `title*`, `description?`, `price* (>=0)`, `type? (PUBLIC/PRIVATE)`, `maxStudents? (1..5000)`, `subjectId?`, `coverImage?` |
| GET | `/teachers/me/classes` | Lecturer | - |
| GET | `/teachers/me/classes/dashboard/stats` | Lecturer | - |
| GET | `/teachers/me/classes/trash` | Lecturer | - |
| POST | `/teachers/me/classes/trash/cleanup` | Lecturer | - |
| GET | `/teachers/me/classes/export/all` | Lecturer | CSV file |
| GET | `/teachers/me/classes/export/:id/members` | Lecturer | CSV file |
| GET | `/teachers/me/classes/:id` | Lecturer | - |
| PATCH | `/teachers/me/classes/:id` | Lecturer | body giống create, tất cả optional |
| PUT | `/teachers/me/classes/:id` | Lecturer | body giống update |
| DELETE | `/teachers/me/classes/:id` | Lecturer | move to trash |
| PATCH | `/teachers/me/classes/:id/restore` | Lecturer | - |

---

## 5) Teacher - Class Members

| Method | Path | Auth | Request |
|---|---|---|---|
| POST | `/teachers/me/class-members` | Lecturer | body: `{ classId, studentId }` |
| GET | `/teachers/me/class-members/class/:classId` | Lecturer | query: `status?` (`ACTIVE \| INACTIVE \| DROPPED`) |
| DELETE | `/teachers/me/class-members/class/:classId/student/:studentId` | Lecturer | - |

Alias cũ vẫn tồn tại: `/class-members/...` (khuyến nghị FE mới dùng `/teachers/me/class-members/...`).

---

## 6) Teacher - Students

| Method | Path | Auth | Request |
|---|---|---|---|
| GET | `/teachers/me/students` | Lecturer | query: `skip? (>=0, default 0)`, `take? (1..100, default 20)` |
| GET | `/teachers/me/students/search/query` | Lecturer | query: `q*`, `skip?`, `take?` |
| GET | `/teachers/me/students/stats/overview` | Lecturer | - |
| GET | `/teachers/me/students/export/all` | Lecturer | CSV file |
| GET | `/teachers/me/students/export/course/:courseId` | Lecturer | CSV file |
| GET | `/teachers/me/students/:studentId` | Lecturer | - |

---

## 7) Teacher - Revenue

| Method | Path | Auth | Request |
|---|---|---|---|
| GET | `/teachers/me/revenue/summary` | Lecturer | - |
| GET | `/teachers/me/revenue/monthly` | Lecturer | query: `year? (2000..3000, default năm hiện tại UTC)` |

---

## 8) KYC

| Method | Path | Auth | Request |
|---|---|---|---|
| POST | `/kyc/submit` | Lecturer | multipart: 1 file CCCD (`identityCard/identity_card/cccd/identity`) + >=1 file chứng chỉ (`supportingDocuments/...`), max 10 files chứng chỉ |
| GET | `/kyc/me` | Lecturer | - |
| PATCH | `/kyc/:id/review` | Admin | body: `{ status, rejectionReason? }` |
| GET | `/admin/kyc` | Admin | query: `page?`, `limit?`, `status?` |
| GET | `/admin/kyc/stats` | Admin | query: `start?`, `end?` (date string) |
| PATCH | `/admin/kyc/:id/review` | Admin | body: `{ status, rejectionReason? }` |

---

## 9) Lessons - Cloud Docs

| Method | Path | Auth | Request |
|---|---|---|---|
| POST | `/lessons/cloud-doc` | JWT | body: `{ title, url(valid URL), classId }` |
| GET | `/lessons/class/:classId/cloud-docs` | JWT | - |
| PATCH | `/lessons/:id/title` | JWT | body: `{ title }` |
| DELETE | `/lessons/:id` | JWT | no content (`204`) |

---

## 10) Chat

| Method | Path | Auth | Request |
|---|---|---|---|
| GET | `/classes/:classId/chat-history` | JWT | query: `take? (1..200, default 50)` |
| POST | `/classes/:classId/chat/messages` | JWT | body: `{ content(max 5000) }` |
| DELETE | `/classes/:classId/chat/messages/:messageId` | JWT | - |

Alias route: `/chat/classes/:classId/...` tương đương.

---

## 11) AI Assistant

| Method | Path | Auth | Request |
|---|---|---|---|
| GET | `/ai-assistant/models` | JWT | - |
| POST | `/ai-assistant/chat` | JWT | JSON: `{ message }` hoặc multipart: `message` + `file?` (tối đa 1 file) |

---

## 12) Admin - Courses, Finance, Settings, Users

| Method | Path | Auth | Request |
|---|---|---|---|
| PATCH | `/admin/courses/:id/review` | Admin | body: `{ status: APPROVED \| REJECTED, reason? }` |
| GET | `/admin/finance/dashboard` | Admin | query: `startDate?`, `endDate?` (date string) |
| PATCH | `/admin/finance/payouts/:id/review` | Admin | body: `{ status: COMPLETED \| REJECTED, transactionRef?/reason? }` |
| GET | `/admin/settings` | Admin | - |
| PATCH | `/admin/settings/:key` | Admin | body: `{ value }` |
| PATCH | `/admin/users/:id/status` | Admin | body: `{ isActive: boolean, reason? }` (reason bắt buộc khi khóa) |

---

## Frontend Implementation Notes
- Các endpoint `export/*` trả về CSV stream, cần xử lý download file.
- Với upload multipart (profile/class/kyc/ai-assistant), dùng `FormData`, không set tay `Content-Type` (để browser tự gắn boundary).
- API dùng global validation pipe (`whitelist + forbidNonWhitelisted`), nên FE chỉ gửi đúng field đã định nghĩa.
