# Sequence Diagram – Checkout & Tạo đơn hàng

## Purpose

Mô tả luồng tạo đơn hàng từ giỏ hàng: kiểm tra điều kiện, khóa tồn kho chống oversell, snapshot đơn hàng, trừ tồn kho, xóa giỏ và khởi tạo giao dịch thanh toán online (nếu có).

## Source

- API §6.4 `POST /orders` — 7 bước bắt buộc trong một giao dịch
- BR-15…BR-18 (giỏ không rỗng, kiểm tra tồn kho lại trước khi tạo, snapshot giá, giảm tồn kho)
- ERD-R-08 (khóa dòng inventories theo product_id tăng dần), ERD-R-09 (snapshot)
- docs/04_EcoMart_database_design.md §8 (Transaction rules); FR-55/FR-56

## Diagram

```mermaid
sequenceDiagram
    autonumber
    actor C as Customer
    participant FE as "Frontend SPA (React)"
    participant CTL as "REST Controller /api/v1"
    participant SVC as "Service (Business Logic)"
    participant DB as "PostgreSQL"

    C->>FE: Nhấn Xác nhận đặt hàng<br/>(đã chọn addressId và paymentMethod)
    FE->>CTL: POST /orders {addressId, paymentMethod}
    CTL->>SVC: Thực hiện checkout

    SVC->>DB: Kiểm tra giỏ không rỗng, Customer isActive,<br/>địa chỉ thuộc Customer

    alt Giỏ rỗng hoặc địa chỉ không hợp lệ
        CTL-->>FE: 422 Không thể đặt hàng khi giỏ hàng rỗng / địa chỉ không hợp lệ
        FE-->>C: Quay lại trang giỏ hàng với thông báo lỗi
    else Điều kiện hợp lệ
        SVC->>DB: SELECT ... FOR UPDATE khóa dòng inventories<br/>theo thứ tự productId tăng dần rồi kiểm tra tồn kho

        alt Thiếu tồn kho của bất kỳ sản phẩm nào
            SVC-->>CTL: Rollback giao dịch
            CTL-->>FE: 422 Một hoặc nhiều sản phẩm không đủ tồn kho
            FE-->>C: Hiển thị item lỗi, tải lại giỏ hàng
        else Đủ tồn kho cho toàn bộ món hàng
            note over SVC,DB: Tất cả bước dưới đây trong cùng một @Transactional
            SVC->>DB: Tạo Order: status=PENDING, paymentStatus=UNPAID,<br/>snapshot recipient_name / phone / delivery_address
            SVC->>DB: Tạo OrderItems với unit_price tại thời điểm đặt (snapshot)
            SVC->>DB: Giảm inventories.quantity theo số lượng đặt
            SVC->>DB: Xóa CartItems đã chuyển thành đơn hàng

            alt paymentMethod = COD
                SVC-->>CTL: Order PENDING UNPAID, paymentUrl = null
                CTL-->>FE: 201 {order, paymentUrl: null}
                FE-->>C: Chuyển đến Payment Result / Order Detail
            else paymentMethod = VNPAY hoặc SEPAY
                SVC->>DB: Tạo PaymentTransaction PENDING kèm paymentRef duy nhất
                SVC->>SVC: Gọi API cổng thanh toán lấy paymentUrl<br/>(bước này nằm ngoài DB transaction)
                CTL-->>FE: 201 {order, paymentUrl}
                FE-->>C: Redirect toàn trang (window.location.href) sang paymentUrl
            end
        end
    end
```

## Ghi chú

- Nếu bước gọi cổng thanh toán thất bại, **đơn hàng đã tạo vẫn giữ nguyên**; Customer có thể dùng `POST /orders/{orderId}/retry-payment` để tạo phiên thanh toán mới (API §6.4).
- Giá sản phẩm thay đổi sau này không ảnh hưởng đơn đã tạo (BR-17).
- Luồng tiếp theo sau redirect xem [payment-vnpay.md](payment-vnpay.md) hoặc [payment-sepay.md](payment-sepay.md).
