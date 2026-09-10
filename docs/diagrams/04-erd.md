# Entity Relationship Diagram (ERD) – EcoMart

## Purpose

Mô tả cấu trúc dữ liệu của EcoMart: 21 bảng, khóa chính/ngoại, ràng buộc và cardinality. Đây là ERD của record, phản ánh trực tiếp thiết kế đã được triển khai.

## Source

- docs/03_EcoMart_ERD.md §2 (ERD), §3 (Data Dictionary), §4 (Integrity Constraints ERD-R-01…18)
- docs/04_EcoMart_database_design.md §4–§8 (21 bảng, enums, transaction rules)
- BA §9 Entity nghiệp vụ + §9.1 Quan hệ nghiệp vụ chính

## Diagram

```mermaid
erDiagram
    roles ||--o{ users : "phan quyen 1:N"
    users ||--o{ email_verification_tokens : "xac thuc email 1:N"
    users ||--o{ password_reset_tokens : "dat lai mat khau 1:N"
    users ||--o{ addresses : "so huu dia chi 1:N"
    users ||--o| carts : "gio hang 1:1"
    carts ||--o{ cart_items : "chua mon hang 1:N"
    products ||--o{ cart_items : "duoc them vao 1:N"

    categories ||--o{ products : "phan loai danh muc 1:N"
    brands ||--o{ products : "thuong hieu 1:N"
    products ||--o{ product_images : "co hinh anh 1:N"
    products ||--|| inventories : "ton kho 1:1"
    products ||--o{ product_certifications : "duoc gan 1:N"
    certifications ||--o{ product_certifications : "gan cho 1:N"

    users ||--o{ orders : "dat hang 1:N"
    orders ||--|{ order_items : "gom cac mon 1:N"
    products ||--o{ order_items : "san pham goc 1:N"
    orders ||--o{ payment_transactions : "lich su giao dich 1:N"

    users ||--o{ reviews : "viet danh gia 1:N"
    products ||--o{ reviews : "nhan danh gia 1:N"
    order_items ||--o| reviews : "can cu danh gia 1:1"

    roles {
        bigint id PK
        varchar name UK "CUSTOMER, ADMIN"
        varchar description
    }

    users {
        bigint id PK
        bigint role_id FK
        varchar full_name
        varchar email UK
        varchar password_hash
        varchar phone_number
        boolean is_active
        boolean is_email_verified
        datetime created_at
        datetime updated_at
    }

    email_verification_tokens {
        bigint id PK
        varchar email
        varchar otp_code
        datetime expires_at
        boolean is_used
        int failed_attempts
        datetime created_at
    }

    password_reset_tokens {
        bigint id PK
        bigint user_id FK
        varchar token UK
        datetime expires_at
        boolean is_used
        int failed_attempts
        datetime created_at
    }

    addresses {
        bigint id PK
        bigint user_id FK
        varchar recipient_name
        varchar recipient_phone
        varchar address_detail
        varchar ward
        varchar district
        varchar province
        boolean is_default
        datetime created_at
        datetime updated_at
    }

    categories {
        bigint id PK
        varchar name UK
        varchar description
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    brands {
        bigint id PK
        varchar name UK
        varchar description
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    certifications {
        bigint id PK
        varchar name UK
        varchar description
        varchar icon_url
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    products {
        bigint id PK
        bigint category_id FK
        bigint brand_id FK
        varchar name
        text description
        decimal selling_price
        decimal original_price
        int eco_score
        varchar material_info
        boolean is_visible
        datetime created_at
        datetime updated_at
    }

    product_images {
        bigint id PK
        bigint product_id FK
        varchar image_url
        boolean is_primary
        int display_order
        datetime created_at
    }

    product_certifications {
        bigint product_id PK, FK
        bigint certification_id PK, FK
    }

    inventories {
        bigint id PK
        bigint product_id FK, UK
        int quantity
        datetime updated_at
    }

    carts {
        bigint id PK
        bigint user_id FK, UK
        datetime created_at
        datetime updated_at
    }

    cart_items {
        bigint id PK
        bigint cart_id FK
        bigint product_id FK
        int quantity
        datetime created_at
        datetime updated_at
    }

    orders {
        bigint id PK
        bigint user_id FK
        varchar order_code UK
        varchar status "PENDING, CONFIRMED, COMPLETED, CANCELLED"
        varchar payment_method "COD, VNPAY, SEPAY"
        varchar payment_status "UNPAID, PAID, FAILED, REFUNDED"
        decimal total_amount
        varchar recipient_name
        varchar recipient_phone
        varchar delivery_address
        text cancellation_reason
        datetime ordered_at
        datetime confirmed_at
        datetime completed_at
        datetime cancelled_at
        datetime paid_at
    }

    order_items {
        bigint id PK
        bigint order_id FK
        bigint product_id FK
        varchar product_name
        decimal unit_price
        int quantity
        decimal line_total
    }

    payment_transactions {
        bigint id PK
        bigint order_id FK
        varchar payment_ref UK
        varchar gateway "VNPAY, SEPAY"
        decimal amount
        varchar gateway_transaction_no
        varchar status "PENDING, SUCCESS, FAILED"
        text raw_response
        datetime created_at
        datetime updated_at
    }

    reviews {
        bigint id PK
        bigint user_id FK
        bigint product_id FK
        bigint order_item_id FK, UK
        int rating
        text comment
        boolean is_visible
        datetime created_at
        datetime updated_at
    }

    contact_messages {
        bigint id PK
        varchar full_name
        varchar email
        varchar phone
        varchar subject
        text content
        varchar status "NEW, RESOLVED"
        datetime created_at
        datetime resolved_at
    }

    content_pages {
        bigint id PK
        varchar slug UK
        varchar title
        text content
        datetime updated_at
    }

    store_settings {
        varchar setting_key PK
        text setting_value
        datetime updated_at
    }
```

## Ràng buộc toàn vẹn chính

| Mã | Ràng buộc | Nguồn |
|---|---|---|
| ERD-R-01 | `users.email` UNIQUE | BR-01/02 |
| ERD-R-02/03 | 1 User ≤ 1 Cart; `(cart_id, product_id)` UNIQUE trong `cart_items` | BR-14 |
| ERD-R-04/05/06 | Tồn kho ≥ 0; giá bán > 0; `original_price` > `selling_price` | BR-11/12/37 |
| ERD-R-07/14 | `eco_score`, `rating` là số nguyên 1–5 | BR-29/35 |
| ERD-R-08 | Checkout khóa dòng `inventories` theo thứ tự `product_id` tăng dần chống oversell | API §6.4 |
| ERD-R-09 | `order_items` lưu snapshot tên/giá/số lượng tại thời điểm đặt | BR-17 |
| ERD-R-13 | `reviews.order_item_id` UNIQUE — chỉ review khi đơn `COMPLETED` | BR-27/28 |
| ERD-R-15 | Không xóa cứng category/brand/certification/product đã có dữ liệu đơn | BR-31/32/36 |
| ERD-R-16 | Token OTP tự vô hiệu hóa sau 5 lần sai | FR-66 |
| ERD-R-17 | `UNIQUE(gateway, gateway_transaction_no)` — webhook idempotent | BR-41 |
| ERD-R-18 | `REFUNDED` chỉ do Admin ghi nhận thủ công trên đơn `CANCELLED` đã `PAID` | BR-42 |
