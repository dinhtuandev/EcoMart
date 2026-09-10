# Activity Diagram – Đánh giá sản phẩm

## Purpose

Mô tả luồng Customer đánh giá sản phẩm đã mua và quy tắc điều kiện đánh giá, kèm hành vi ẩn/hiện đánh giá của Admin.

## Source

- FR-29, FR-30, FR-41; BR-27…BR-30
- API §6.5 (`POST /reviews`, `PATCH /reviews/{reviewId}`) — hệ thống tự suy ra `productId` từ `orderItemId`, trả `422` nếu không đủ điều kiện
- ERD-R-13 (`reviews.order_item_id` UNIQUE), ERD-R-14 (rating 1–5)

## Diagram

```mermaid
flowchart TD
    Start([Bắt đầu]) --> OpenOrder["Customer mở Order Detail<br/>thuộc đơn COMPLETED của mình"]
    OpenOrder --> PickItem["Chọn sản phẩm trong đơn<br/>có cờ canReview = true"]
    PickItem --> HasReview{"Sản phẩm này đã có<br/>đánh giá trong đơn?"}

    HasReview -- "Có" --> EditReview["Customer chỉnh sửa đánh giá cũ:<br/>PATCH /reviews/{reviewId}"]
    EditReview --> InputRating

    HasReview -- "Không" --> OpenForm["Mở form đánh giá"]
    OpenForm --> InputRating["Nhập điểm 1-5 và nội dung nhận xét"]
    InputRating --> Validate{"Điểm nằm trong 1-5?"}
    Validate -- "Không" --> Reinput["Báo lỗi validation,<br/>yêu cầu nhập lại"]
    Reinput --> InputRating

    Validate -- "Có" --> Submit["Gửi POST /reviews<br/>{orderItemId, rating, comment}"]
    Submit --> Eligible{"Hệ thống kiểm tra:<br/>order item thuộc đơn COMPLETED,<br/>thuộc Customer này,<br/>chưa có review?"}
    Eligible -- "Không" --> Reject422["API trả 422:<br/>Chỉ có thể đánh giá sản phẩm trong<br/>đơn hàng đã hoàn thành của bạn"]
    Reject422 --> End([Kết thúc])

    Eligible -- "Có" --> CreateReview["Tạo Review: suy ra productId từ orderItemId,<br/>is_visible = true"]
    CreateReview --> Done["Hiển thị đánh giá tại<br/>trang chi tiết sản phẩm"]
    Done --> End

    Done -.-> Moderation["Admin có thể ẩn đánh giá không phù hợp:<br/>PATCH /admin/reviews/{reviewId}/visibility"]
    Moderation -.-> Hidden["Đánh giá bị ẩn không hiển thị công khai<br/>nhưng vẫn được lưu để quản lý"]
```

## Business Rules áp dụng

| Rule | Ý nghĩa trong luồng |
|---|---|
| BR-27 | Chỉ đánh giá sản phẩm thuộc đơn `COMPLETED` của chính Customer |
| BR-28 | Mỗi Customer một đánh giá cho mỗi sản phẩm trong một đơn hoàn thành (`order_item_id` UNIQUE) |
| BR-29 | Điểm đánh giá từ 1 đến 5 |
| BR-30 | Đánh giá bị Admin ẩn không hiển thị công khai nhưng vẫn lưu |
