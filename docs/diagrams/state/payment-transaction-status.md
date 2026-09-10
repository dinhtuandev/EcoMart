# State Diagram – Trạng thái giao dịch thanh toán (`payment_transactions.status`)

## Purpose

Mô tả vòng đời của một lần thử thanh toán online (PaymentTransaction). Mỗi lần thử là một bản ghi riêng với `payment_ref` duy nhất.

## Source

- docs/02_EcoMart_Diagrams.md §6 (VNPay IPN & SePay webhook)
- API §6.6 (xử lý webhook khi xác thực hợp lệ), §3.3 PaymentTransaction model
- ERD-R-12 (`TransactionStatus`: PENDING, SUCCESS, FAILED), ERD-R-17 (idempotency), BR-41

## Diagram

```mermaid
stateDiagram-v2
    direction TB

    state "PENDING — chờ kết quả" as PENDING_TX
    state "SUCCESS — thành công" as SUCCESS
    state "FAILED — thất bại" as FAILED_TX

    [*] --> PENDING_TX : Khởi tạo lần thử thanh toán online<br/>kèm payment_ref duy nhất<br/>(tạo đơn hoặc retry-payment)

    PENDING_TX --> SUCCESS : Webhook/IPN xác thực hợp lệ,<br/>giao dịch thành công, khớp số tiền
    PENDING_TX --> FAILED_TX : Cổng báo giao dịch thất bại<br/>hoặc số tiền nhận về lệch

    SUCCESS --> [*] : Order chuyển paymentStatus = PAID,<br/>paid_at = now()
    FAILED_TX --> [*] : Order giữ UNPAID,<br/>Customer retry-payment tạo giao dịch MỚI

    note right of PENDING_TX
        Webhook/IPN gọi lại nhiều lần với cùng
        gateway_transaction_no không tạo hiệu ứng trùng
        — UNIQUE(gateway, gateway_transaction_no)
        (ERD-R-17, BR-41)
    end note

    note right of FAILED_TX
        Lưu raw_response của cổng để audit/debug;
        rawResponse không trả về response của Customer (API §3.3)
    end note
```

## Bảng transition rút gọn

| From | To | Điều kiện | Tác động kèm theo |
|---|---|---|---|
| `[*] → PENDING` | `POST /orders` hoặc `/retry-payment` với phương thức online | Chưa tác động đến trạng thái thanh toán của đơn |
| `PENDING → SUCCESS` | VNPay: HMAC hợp lệ + `vnp_ResponseCode = 00` + khớp tiền; SePay: API key hợp lệ + orderCode khớp + đúng tiền | Order → `PAID`, ghi `paid_at` |
| `PENDING → FAILED` | Cổng trả thất bại / lệch số tiền (chữ ký vẫn hợp lệ) | Order giữ `UNPAID`, được phép retry |
