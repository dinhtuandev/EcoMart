# Sequence Diagrams – Đánh giá sản phẩm & Kiểm duyệt

## Purpose

Mô tả (1) Customer gửi đánh giá cho sản phẩm thuộc đơn `COMPLETED` với toàn bộ kiểm tra điều kiện, (2) Admin xem và ẩn/hiện đánh giá.

## Source

- API §6.5 (`POST /reviews` — suy ra `productId` từ `orderItemId`, `422` nếu không đủ điều kiện; `PATCH /reviews/{reviewId}`), §7.6 (`GET /admin/reviews`, `PATCH /admin/reviews/{reviewId}/visibility`)
- BR-27…BR-30; ERD-R-13/14; FR-29…FR-30, FR-41
- Wireframe §5.8 Review Management

## Diagram

### 1. Customer gửi đánh giá

```mermaid
sequenceDiagram
    autonumber
    actor C as Customer
    participant FE as "Frontend SPA (React)"
    participant CTL as "REST Controller /api/v1"
    participant SVC as "Service (Business Logic)"
    participant DB as "PostgreSQL"

    C->>FE: Mở Order Detail của đơn COMPLETED,<br/>chọn sản phẩm có canReview = true
    FE->>CTL: GET /orders/{orderId}
    CTL-->>FE: 200 Chi tiết đơn kèm cờ canReview từng item

    C->>FE: Nhập điểm 1-5 và nội dung nhận xét, gửi đánh giá
    FE->>CTL: POST /reviews {orderItemId, rating, comment}
    CTL->>SVC: Tạo đánh giá

    SVC->>DB: Load order_item theo orderItemId,<br/>join orders kiểm tra trạng thái và chủ sở hữu

    alt Item không thuộc đơn COMPLETED của Customer này<br/>hoặc đã tồn tại review
        CTL-->>FE: 422 Chỉ có thể đánh giá sản phẩm trong<br/>đơn hàng đã hoàn thành của bạn
        FE-->>C: Hiển thị lỗi không đủ điều kiện
    else rating ngoài khoảng 1-5 hoặc dữ liệu không hợp lệ
        CTL-->>FE: 400 Dữ liệu gửi lên không hợp lệ
        FE-->>C: Báo lỗi validation dưới trường
    else Đủ điều kiện
        note over SVC,DB: Hệ thống tự suy ra productId từ orderItemId
        SVC->>DB: INSERT reviews (user_id, product_id, order_item_id UNIQUE,<br/>rating 1-5, comment, is_visible = true)
        DB-->>SVC: Review đã tạo
        CTL-->>FE: 201 Tạo đánh giá thành công
        FE-->>C: Cập nhật nút/trạng thái đánh giá trên item
    end
```

### 2. Admin kiểm duyệt đánh giá

```mermaid
sequenceDiagram
    autonumber
    actor A as Admin
    participant FE as "Frontend SPA (React)"
    participant CTL as "REST Controller /api/v1/admin"
    participant SVC as "Service (Business Logic)"
    participant DB as "PostgreSQL"

    A->>FE: Mở trang Quản lý đánh giá,<br/>lọc theo sản phẩm / trạng thái hiển thị
    FE->>CTL: GET /admin/reviews?productId&isVisible&page&pageSize
    CTL->>SVC: Truy vấn danh sách đánh giá
    SVC->>DB: SELECT reviews + thông tin product/customer
    DB-->>SVC: Danh sách toàn bộ đánh giá (gồm cả đã ẩn)
    CTL-->>FE: 200
    FE-->>A: Hiển thị bảng đánh giá

    A->>FE: Chọn ẩn đánh giá không phù hợp (modal xác nhận)
    FE->>CTL: PATCH /admin/reviews/{reviewId}/visibility {"isVisible": false}
    CTL->>SVC: Cập nhật hiển thị
    SVC->>DB: UPDATE reviews SET is_visible = false
    DB-->>SVC: Đã cập nhật
    CTL-->>FE: 200
    FE-->>A: Cập nhật dòng dữ liệu trong bảng

    note over SVC,DB: Đánh giá bị ẩn không hiển thị công khai tại chi tiết sản phẩm<br/>nhưng vẫn được lưu để quản lý (BR-30)<br/>và không có API sửa nội dung hay xóa review
```

## Business Rules áp dụng

| Rule | Ý nghĩa trong luồng |
|---|---|
| BR-27 | Chỉ đánh giá sản phẩm thuộc đơn `COMPLETED` của chính Customer |
| BR-28 | Một review mỗi order item — ràng buộc `order_item_id` UNIQUE |
| BR-29 | rating nguyên từ 1 đến 5 |
| BR-30 | Ẩn chỉ đổi `is_visible`; review vẫn được lưu |
| NFR-18 | Thao tác ẩn/hiện đánh giá của Admin được ghi log |
