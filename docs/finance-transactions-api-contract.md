# API Contract - Admin Finance Transactions

## Endpoint
- **Method:** `GET`
- **Path:** `/api/v1/admin/finance/transactions`
- **Auth:** `Bearer access token`
- **Role:** `ADMIN`

## Query Params
- `q` (optional, string): tìm theo `id` hoặc `transactionRef` (contains, không phân biệt hoa thường)
- `status` (optional, enum): `PENDING | SUCCESS | FAILED | REFUNDED`
- `startDate` (optional, string date): ví dụ `2026-02-01`
- `endDate` (optional, string date): ví dụ `2026-02-29`
- `page` (optional, number, default `1`, min `1`)
- `limit` (optional, number, default `20`, min `1`, max `100`)

## Rules
- Nếu có cả `startDate` và `endDate` thì `startDate <= endDate`.
- Kết quả sắp xếp mới nhất trước (`createdAt desc`).

## Success Response (200)
```json
{
  "items": [
    {
      "id": "4f95d3f7-4f46-4ec7-9ec8-bf6a3e0b6314",
      "transactionRef": "SEED-COURSE-TX-0002",
      "amount": 700000,
      "platformFee": 140000,
      "instructorRevenue": 560000,
      "status": "SUCCESS",
      "paymentMethod": "bank_transfer",
      "createdAt": "2026-03-12T09:00:00.000Z",
      "course": {
        "id": "course_001",
        "title": "Math Mastery for Grade 9"
      },
      "teacher": {
        "id": "teacher_001",
        "email": "lecturer.approved@flyingclass.test",
        "fullName": "Lecturer Approved"
      },
      "student": {
        "id": "student_001",
        "email": "student.a@flyingclass.test",
        "fullName": "Student A"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

## Common Errors
- `400`: `startDate` hoặc `endDate` không hợp lệ
- `400`: `startDate` lớn hơn `endDate`
- `400`: `status` không đúng enum
- `401`: thiếu/sai token
- `403`: không phải role ADMIN
