# State Diagram – Trạng thái thanh toán của đơn hàng (`orders.payment_status`)

## Purpose

Mô tả vòng đời trạng thái thanh toán của một đơn hàng. Trạng thái này **độc lập** với trạng thái xử lý đơn (`orders.status`) và chỉ được thay đổi khi có webhook/IPN hợp lệ hoặc thao tác Admin được tài liệu cho phép.

## Source

- docs/02_EcoMart_Diagrams.md §1 (trạng thái thanh toán độc lập) + §5/§6
- BR-20, BR-40, BR-42; ERD-R-12; API §6.6, §7.5 (`payment-status`), §8 bảng ánh xạ BR

## Diagram

```mermaid
stateDiagram-v2
    direction TB

    state "Chưa thanh toán (UNPAID)" as UNPAID
    state "Đã thanh toán (PAID)" as PAID
    state "Đã hoàn tiền (REFUNDED)" as REFUNDED

    [*] --> UNPAID : Đơn hàng được tạo —<br/>mặc định với cả COD và online (BR-20)

    UNPAID --> PAID : Webhook/IPN hợp lệ xác nhận<br/>giao dịch thành công khớp số tiền (online)
    UNPAID --> PAID : Admin hoàn thành đơn COD —<br/>tự động set PAID, paid_at = now()

    PAID --> REFUNDED : Admin ghi nhận thủ công sau khi hoàn tiền<br/>ngoài hệ thống — chỉ áp dụng đơn CANCELLED<br/>phương thức khác COD (BR-42)

    note right of UNPAID
        Giao dịch thất bại giữ nguyên UNPAID;
        Customer retry-payment tạo PaymentTransaction mới.
        Giá trị FAILED tồn tại trong enum schema
        (ERD-R-12) nhưng tài liệu không mô tả luồng nào
        chuyển payment_status cấp ĐƠN sang FAILED
        — NOT SPECIFIED.
    end note

    note right of REFUNDED
        Hệ thống không tự gọi API hoàn tiền
        của cổng thanh toán (BR-42).
    end note
```

## Bảng transition rút gọn

| From | To | Điều kiện / tác nhân | Nguồn |
|---|---|---|---|
| `[*] → UNPAID` | Tạo đơn (COD & online) | Tự động | BR-20 |
| `UNPAID → PAID` | Webhook/IPN hợp lệ + khớp số tiền | Hệ thống | BR-40/41 |
| `UNPAID → PAID` | Hoàn thành đơn COD | Admin `/complete` tự set | docs 02 §5.1 |
| `PAID → REFUNDED` | Đơn đã `CANCELLED`, method ≠ `COD`, hoàn tiền ngoài hệ thống xong | Admin `PATCH /admin/orders/{orderId}/payment-status` | BR-42, ERD-R-18 |
| `UNPAID → ?` khi giao dịch FAILED | Giữ `UNPAID`; chuyển sang `FAILED` cấp đơn **không được mô tả** | — | API §6.6 bước 4 |

> Lưu ý nhất quán: `FAILED` là trạng thái của **PaymentTransaction**, không phải của đơn hàng theo các luồng được mô tả — xem [payment-transaction-status.md](payment-transaction-status.md).
