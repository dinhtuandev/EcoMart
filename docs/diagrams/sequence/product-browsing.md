# Sequence Diagram – Duyệt sản phẩm (Public Catalog)

## Purpose

Mô tả tương tác đọc dữ liệu công khai: xem danh mục/thương hiệu/chứng nhận, tìm kiếm – lọc – sắp xếp sản phẩm, xem chi tiết và đánh giá công khai của sản phẩm.

## Source

- API §5 Public Catalog API
- FR-01…FR-08, FR-43…FR-45 (tìm kiếm/lọc/sắp xếp), FR-30/FR-48 (đánh giá công khai, giá khuyến mại)
- BR-09 (chỉ hiển thị sản phẩm đang hiển thị), NFR-08 (phân trang), NFR-06/07 (hiệu năng phản hồi)

## Diagram

```mermaid
sequenceDiagram
    autonumber
    actor V as Guest
    participant FE as "Frontend SPA (React)"
    participant CTL as "REST Controller /api/v1"
    participant SVC as "Service (Business Logic)"
    participant DB as "PostgreSQL"

    V->>FE: Mở trang chủ / danh sách sản phẩm
    FE->>CTL: GET /categories, GET /brands, GET /certifications
    CTL->>SVC: Lấy nguồn dữ liệu bộ lọc
    SVC->>DB: SELECT các bản ghi is_active = true
    DB-->>SVC: Danh mục, thương hiệu, chứng nhận đang hoạt động
    CTL-->>FE: 200

    V->>FE: Tìm kiếm từ khóa hoặc chọn bộ lọc<br/>(danh mục, thương hiệu, khoảng giá,<br/>chứng nhận, minEcoScore) và sắp xếp
    FE->>CTL: GET /products?page&pageSize&keyword&categoryId&brandId&minPrice&maxPrice&certificationId&minEcoScore&sort
    CTL->>SVC: Truy vấn catalog
    SVC->>DB: SELECT products WHERE is_visible = true<br/>+ điều kiện lọc / sort / phân trang
    DB-->>SVC: items + tổng số bản ghi
    SVC-->>CTL: Trang kết quả
    CTL-->>FE: 200 {items, pagination}
    note over FE: Chỉ hiển thị sản phẩm isVisible=true (BR-09),<br/>giá cũ gạch ngang khi originalPrice lớn hơn sellingPrice (BR-37, FR-48)

    V->>FE: Chọn một sản phẩm
    FE->>CTL: GET /products/{productId}
    SVC->>DB: Chi tiết sản phẩm + tồn kho + hình ảnh + chứng nhận
    DB-->>SVC: Dữ liệu chi tiết
    CTL-->>FE: 200 Product (kèm averageRating, reviewCount)
    FE-->>V: Hiển thị chi tiết sản phẩm

    V->>FE: Xem đánh giá của sản phẩm
    FE->>CTL: GET /products/{productId}/reviews?page&pageSize
    SVC->>DB: SELECT reviews WHERE product_id = ? AND is_visible = true
    DB-->>SVC: Đánh giá hợp lệ
    CTL-->>FE: 200 Danh sách đánh giá công khai
```

## Ghi chú

- Các endpoint này **PUBLIC**, không yêu cầu Bearer token (API §5).
- Sản phẩm hết hàng vẫn hiển thị nhưng không thể thêm vào giỏ hàng (API §5.1).
- Thông tin review công khai không bao gồm dữ liệu nhạy cảm của Customer (API §5.2).
