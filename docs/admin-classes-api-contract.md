# API Contract - Admin Class Management

## Auth
- `Bearer access token`
- Role: `ADMIN`

## 1) List Classes (Admin)
- **Method:** `GET`
- **Path:** `/api/v1/admin/classes`

### Query Params
- `q` (optional, string): tìm theo `id`, `title`, `classCode` (contains, không phân biệt hoa thường)
- `status` (optional, enum): `ACTIVE | PAUSED | PENDING_DELETE`
  - Trang quản lý lớp học admin không hiển thị lớp đang ở `PENDING_DELETE` (thùng rác).
  - Nếu gửi `status=PENDING_DELETE`, API trả danh sách rỗng để tương thích frontend cũ.
- `page` (optional, number, default `1`, min `1`)
- `limit` (optional, number, default `20`, min `1`, max `100`)

### Success Response (200)
```json
{
  "items": [
    {
      "id": "8c1d6677-e195-4683-a7ca-012a29cb09ac",
      "teacherId": "ca2fcc7b-51c5-4a95-852f-82a2d32b9e5d",
      "subjectId": "9196702d-685a-4ae1-bcfb-fdf47e64e23e",
      "title": "Physics By Pending Lecturer",
      "description": "Class by another lecturer for authorization tests",
      "price": 159000,
      "coverImage": null,
      "classCode": "SEED-CLASS-OTHER-001",
      "invitationToken": null,
      "maxStudents": 45,
      "type": "PUBLIC",
      "status": "ACTIVE",
      "createdAt": "2026-05-02T05:20:38.315Z",
      "deletedAt": null,
      "subject": {
        "id": "9196702d-685a-4ae1-bcfb-fdf47e64e23e",
        "name": "Physics"
      },
      "studentCount": 0,
      "totalRevenue": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 4,
    "totalPages": 1
  }
}
```

### Common Errors
- `400`: `status` không đúng enum
- `401`: thiếu/sai token
- `403`: không phải role ADMIN

---

## 2) Get Class Detail
- **Method:** `GET`
- **Path:** `/api/v1/admin/classes/:id`

### Path Params
- `id` (string, required): class id

### Success Response (200)
```json
{
  "id": "8c1d6677-e195-4683-a7ca-012a29cb09ac",
  "teacherId": "ca2fcc7b-51c5-4a95-852f-82a2d32b9e5d",
  "subjectId": "9196702d-685a-4ae1-bcfb-fdf47e64e23e",
  "title": "Physics By Pending Lecturer",
  "description": "Class by another lecturer for authorization tests",
  "price": 159000,
  "coverImage": null,
  "classCode": "SEED-CLASS-OTHER-001",
  "invitationToken": null,
  "maxStudents": 45,
  "type": "PUBLIC",
  "status": "ACTIVE",
  "createdAt": "2026-05-02T05:20:38.315Z",
  "deletedAt": null,
  "subject": {
    "id": "9196702d-685a-4ae1-bcfb-fdf47e64e23e",
    "name": "Physics"
  },
  "studentCount": 0,
  "totalRevenue": 0
}
```

### Common Errors
- `401`: thiếu/sai token
- `403`: không phải role ADMIN
- `404`: không tìm thấy lớp học

---

## 3) Pause Class (Admin)
- **Method:** `PATCH`
- **Path:** `/api/v1/admin/classes/:id/pause`

### Path Params
- `id` (string, required): class id

### Rules
- Chỉ pause được lớp đang `ACTIVE`.
- Nếu lớp đã `PAUSED` => trả lỗi.
- Nếu lớp đang `PENDING_DELETE` (thùng rác) => trả lỗi.
- Khi pause, `status` chuyển sang `PAUSED`.

### Success Response (200)
```json
{
  "message": "Đã tạm dừng lớp học."
}
```

### Common Errors
- `400`: lớp đã tạm dừng
- `400`: không thể tạm dừng lớp trong thùng rác
- `401`: thiếu/sai token
- `403`: không phải role ADMIN
- `404`: không tìm thấy lớp học

---

## 4) Resume Class (Admin)
- **Method:** `PATCH`
- **Path:** `/api/v1/admin/classes/:id/resume`

### Path Params
- `id` (string, required): class id

### Rules
- Chỉ resume được lớp đang `PAUSED`.
- Khi resume, `status` chuyển về `ACTIVE`.

### Success Response (200)
```json
{
  "message": "Đã mở lại lớp học."
}
```

### Common Errors
- `400`: lớp không ở trạng thái `PAUSED`
- `401`: thiếu/sai token
- `403`: không phải role ADMIN
- `404`: không tìm thấy lớp học
