# FlyingClass API v1 - Optimized Postman Guide

## Collection file
- `docs/api-v1-all-routes.postman_collection.json`

## Mục tiêu
Collection này được viết lại để:
- Bao phủ toàn bộ route hiện có trong backend.
- Có mô tả cho từng API request.
- Tự động set biến/token/id bằng script để test nhanh theo flow.

## Thứ tự chạy khuyến nghị
1. `00 - Setup & Health`
2. `01 - Auth`
3. `02` đến `11` theo nhu cầu

## Nhóm biến quan trọng
- URL: `base_url`
- Auth:
  - `admin_access_token`, `admin_refresh_token`
  - `lecturer_access_token`, `lecturer_refresh_token`
  - `student_access_token`, `student_refresh_token`
- IDs tự động:
  - `admin_user_id`, `lecturer_user_id`, `student_user_id`
  - `class_id`, `cloud_doc_id`, `chat_message_id`, `kyc_application_id`
- IDs set tay khi cần test admin review:
  - `course_id` (course đang `PENDING_REVIEW`)
  - `payout_id` (payout đang `PENDING`)

## Seed tương thích
Collection này tương thích trực tiếp với dữ liệu seed full hiện tại (`FullDatasetSeeder`).

## Ghi chú
- Các request multipart cần set đúng đường dẫn local cho:
  - `sample_image_path`
  - `sample_doc_path`
- Script chung toàn collection có lưu lại metadata để debug nhanh:
  - `last_status_code`
  - `last_response_time_ms`
  - `last_request_name`
