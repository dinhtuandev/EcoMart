# Sequence Diagrams – Hủy đơn hàng & Hoàn tiền thủ công

## Purpose

Mô tả hai luồng hủy đơn: (1) Customer tự hủy đơn đang `PENDING`, (2) Admin hủy đơn `PENDING`/`CONFIRMED` kèm lý do bắt buộc; cùng bước ghi nhận hoàn tiền thủ công `REFUNDED` cho đơn online đã thanh toán.

## Source

- BR-21…BR-23 (điều kiện hủy, hoàn tồn kho, lý do), BR-42 (hoàn tiền thủ công), ERD-R-18
- API §6.4 `POST /orders/{orderId}/cancel`, §7.5 `/admin/orders/{orderId}/cancel`, `PATCH /admin/orders/{orderId}/payment-status`
- docs/04_EcoMart_database_design.md §8 (hủy đơn trong cùng transaction)
- docs/02_EcoMart_Diagrams.md §5 + bảng §5.1

## Diagram

### 1. Customer hủy đơn chưa xác nhận

```mermaid
sequenceDiagram
    autonumber
    actor C as Customer
    participant FE as "Frontend SPA (React)"
    participant CTL as "REST Controller /api/v1"
    participant SVC as "Service (Business Logic)"
    participant DB as "PostgreSQL"

    C->>FE: Nhấn Hủy đơn trên đơn PENDING<br/>(xác nhận qua modal)
    FE->>CTL: POST /orders/{orderId}/cancel {}
    CTL->>SVC: Xử lý hủy đơn
    SVC->>DB: Load order, kiểm tra thuộc Customer<br/>và status = PENDING

    alt Đơn không thuộc Customer hoặc không phải PENDING
        CTL-->>FE: 409 Đơn hàng không thể hủy ở trạng thái hiện tại
        FE-->>C: Hiển thị lỗi, tải lại chi tiết đơn
    else Hợp lệ
        note over SVC,DB: Trong cùng một @Transactional
        SVC->>DB: UPDATE orders SET status = CANCELLED,<br/>cancelled_at = now(),<br/>cancellation_reason = "Khách hàng hủy đơn"
        SVC->>DB: Hoàn lại inventories.quantity đúng một lần

        alt paymentStatus = PAID (đã thanh toán online)
            note over SVC: KHÔNG gọi API hoàn tiền của cổng —<br/>chỉ ghi nhận đơn cần hoàn tiền (BR-42)
            SVC-->>CTL: Đơn CANCELLED, chờ Admin hoàn tiền thủ công
        else COD hoặc chưa thanh toán
            SVC-->>CTL: Đơn CANCELLED
        end

        CTL-->>FE: 200 Hủy thành công
        FE-->>C: Cập nhật trạng thái Đã hủy kèm lý do mặc định
    end
```

### 2. Admin hủy đơn & ghi nhận hoàn tiền thủ công

```mermaid
sequenceDiagram
    autonumber
    actor A as Admin
    participant FE as "Frontend SPA (React)"
    participant CTL as "REST Controller /api/v1/admin"
    participant SVC as "Service (Business Logic)"
    participant DB as "PostgreSQL"

    A->>FE: Hủy đơn với lý do bắt buộc
    FE->>CTL: POST /admin/orders/{orderId}/cancel {cancellationReason}
    CTL->>SVC: Hủy đơn (Admin)
    SVC->>DB: Kiểm tra status thuộc {PENDING, CONFIRMED}

    alt Trạng thái khác hoặc COMPLETED/CANCELLED
        CTL-->>FE: 409 Trạng thái không hợp lệ
    else Hợp lệ
        SVC->>DB: UPDATE orders SET status = CANCELLED,<br/>cancellation_reason = lý do Admin nhập, cancelled_at = now()
        SVC->>DB: Hoàn lại inventories.quantity đúng một lần
        CTL-->>FE: 200 Hủy thành công
        FE-->>A: Tải lại chi tiết đơn
    end

    opt Đơn CANCELLED từng thanh toán online và đã PAID
        A->>A: Chuyển khoản hoàn tiền cho khách<br/>ngoài hệ thống (thủ công)
        A->>FE: Nhấn Đánh dấu đã hoàn tiền
        FE->>CTL: PATCH /admin/orders/{orderId}/payment-status {"paymentStatus": "REFUNDED"}
        CTL->>SVC: Ghi nhận hoàn tiền
        SVC->>DB: Kiểm tra điều kiện: status = CANCELLED,<br/>paymentMethod khác COD, paymentStatus trước đó = PAID

        alt Điều kiện thỏa mãn
            SVC->>DB: UPDATE orders SET payment_status = REFUNDED
            CTL-->>FE: 200
            FE-->>A: Hiển thị trạng thái Đã hoàn tiền
        else Điều kiện không thỏa
            CTL-->>FE: 400 / 409 Không thể cập nhật hoàn tiền
        end
    end
```

## Business Rules áp dụng

| Rule | Ý nghĩa trong luồng |
|---|---|
| BR-21 | Customer chỉ hủy khi `PENDING`; hệ thống tự gán lý do "Khách hàng hủy đơn" |
| BR-22/BR-34 | Admin xác nhận chỉ từ `PENDING`; đơn `COMPLETED` không thể quay lại trạng thái cũ |
| BR-23 | Admin hủy được `PENDING`/`CONFIRMED`, bắt buộc lưu lý do, hoàn tồn kho |
| BR-25 | Đơn `COMPLETED`/`CANCELLED` không được xóa |
| BR-42/ERD-R-18 | `REFUNDED` là thao tác ghi nhận thủ công, không gọi API cổng thanh toán |
