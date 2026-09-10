# State Diagram – Trạng thái xử lý đơn hàng (`orders.status`)

## Purpose

Mô tả vòng đời trạng thái nghiệp vụ của một đơn hàng và các transition hợp lệ kèm tác nhân/điều kiện.

## Source

- docs/02_EcoMart_Diagrams.md §1 (quy ước) + bảng quy tắc chuyển trạng thái §5.1
- BR-20…BR-25, BR-34; ERD-R-10; API §7.5 (quy tắc `/confirm`, `/cancel`, `/complete`)
- BA §2.3 Quy trình xử lý đơn hàng

## Diagram

```mermaid
stateDiagram-v2
    direction TB

    state "Chờ xác nhận (PENDING)" as PENDING
    state "Đã xác nhận (CONFIRMED)" as CONFIRMED
    state "Đã hoàn thành (COMPLETED)" as COMPLETED
    state "Đã hủy (CANCELLED)" as CANCELLED

    [*] --> PENDING : Customer tạo đơn từ giỏ hàng<br/>paymentStatus = UNPAID

    PENDING --> CONFIRMED : Admin /confirm —<br/>COD hoặc online đã PAID
    PENDING --> CANCELLED : Customer hủy (lý do mặc định)<br/>hoặc Admin hủy — hoàn tồn kho

    CONFIRMED --> COMPLETED : Admin /complete sau khi giao hàng<br/>COD tự set paymentStatus = PAID
    CONFIRMED --> CANCELLED : Admin /cancel kèm lý do — hoàn tồn kho

    COMPLETED --> [*] : Đơn được tính doanh thu,<br/>cho phép Customer đánh giá
    CANCELLED --> [*] : Nếu từng PAID online,<br/>Admin ghi nhận REFUNDED thủ công

    note right of CONFIRMED
        Đơn online UNPAID không xác nhận được
        — API trả 409 (BR-22)
    end note

    note right of COMPLETED
        Trạng thái cuối: không thể chuyển
        sang trạng thái khác, không được xóa
        (BR-25, BR-34)
    end note

    note right of CANCELLED
        Trạng thái cuối: không được xóa;
        đơn PAID online cần Admin hoàn tiền
        thủ công rồi set REFUNDED (BR-42)
    end note
```

## Bảng transition rút gọn

| From | To | Tác nhân | Điều kiện | Tác động |
|---|---|---|---|---|
| `[*]` → `PENDING` | Tạo đơn | Customer | Giỏ hợp lệ, đủ tồn kho | Trừ tồn kho, snapshot giá/địa chỉ |
| `PENDING → CONFIRMED` | Xác nhận | Admin | COD hoặc online `PAID` (khác → `409`) | Ghi nhận `confirmedAt` |
| `PENDING → CANCELLED` | Hủy | Customer hoặc Admin | — | Hoàn tồn kho; lưu lý do |
| `CONFIRMED → CANCELLED` | Hủy | Admin | Lý do bắt buộc | Hoàn tồn kho |
| `CONFIRMED → COMPLETED` | Hoàn thành | Admin | Sau khi giao thành công | Ghi nhận `completedAt`; COD auto `PAID`; tính doanh thu; mở điều kiện đánh giá |
