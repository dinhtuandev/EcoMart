# Activity Diagram – Thanh toán online (VNPay Sandbox & SePay VietQR)

## Purpose

Mô tả luồng thanh toán online cho hai cổng được hỗ trợ: VNPay Sandbox (redirect + IPN HMAC-SHA512) và SePay VietQR Napas 247 (modal QR + webhook API Key), với nguyên tắc bắt buộc xác thực webhook trước khi cập nhật trạng thái.

## Source

- docs/02_EcoMart_Diagrams.md §6
- FR-55…FR-58; BR-19, BR-40…BR-43; NFR-19/20
- API §6.6 Payment Gateway Webhook API; ERD-R-17 (idempotency)

## Diagram

```mermaid
flowchart TD
    Start([Bắt đầu]) --> OrderCreated["Đơn hàng đã tạo:<br/>PENDING, paymentStatus = UNPAID"]
    OrderCreated --> CreateTx["Tạo PaymentTransaction: PENDING<br/>kèm paymentRef duy nhất"]
    CreateTx --> CheckGateway{"Cổng thanh toán?"}

    CheckGateway -- "VNPay" --> GenVNPayURL["Sinh VNPay Payment URL<br/>có chữ ký HMAC-SHA512"]
    GenVNPayURL --> RedirectVNPay["Chuyển hướng trình duyệt sang<br/>cổng thanh toán VNPay"]
    RedirectVNPay --> PayVNPay["Customer thực hiện thanh toán trên VNPay"]
    PayVNPay --> VNPayIPN["VNPay gửi HTTP IPN Callback về server<br/>POST /payments/vnpay/ipn"]

    VNPayIPN --> VerifyVNPayHash{"Xác thực HMAC-SHA512<br/>và vnp_TmnCode?"}
    VerifyVNPayHash -- "Sai chữ ký" --> RejectVNPayIPN["Trả về RspCode 97: Invalid Checksum,<br/>không đổi trạng thái"]
    RejectVNPayIPN --> End([Kết thúc])

    VerifyVNPayHash -- "Đúng chữ ký" --> CheckVNPayResp{"vnp_ResponseCode == 00<br/>và khớp số tiền?"}
    CheckVNPayResp -- "Thất bại" --> VNPayFailed["Cập nhật<br/>PaymentTransaction = FAILED"]
    VNPayFailed --> VNPayRetPrompt["VNPay Return chuyển hướng<br/>về giao diện kết quả"]
    VNPayRetPrompt --> End

    CheckVNPayResp -- "Thành công" --> VNPaySuccess["Cập nhật PaymentTransaction = SUCCESS,<br/>Order = PAID, paidAt = now"]
    VNPaySuccess --> VNPayReturn["VNPay chuyển hướng trình duyệt về<br/>GET /payments/vnpay/return"]
    VNPayReturn --> VNPayShowUI["Frontend hiển thị thông báo;<br/>xác nhận trạng thái qua GET /orders/{orderId}"]
    VNPayShowUI --> End

    CheckGateway -- "SePay" --> GenVietQR["Tạo URL VietQR Napas 247:<br/>bank, account, amount, orderCode"]
    GenVietQR --> OpenModalQR["Frontend hiển thị Modal VietQR<br/>kèm mã QR và hướng dẫn chuyển khoản"]
    OpenModalQR --> AppTransfer["Customer quét mã QR và chuyển khoản<br/>qua App ngân hàng"]
    AppTransfer --> BankWebhook["SePay bắn Webhook<br/>POST /payments/sepay/webhook về server"]

    BankWebhook --> VerifySePayAuth{"Xác thực API Key SePay<br/>qua Header?"}
    VerifySePayAuth -- "Không hợp lệ" --> RejectSePay401["Trả về HTTP 401 Unauthorized,<br/>từ chối xử lý"]
    RejectSePay401 --> End

    VerifySePayAuth -- "Hợp lệ" --> ParseOrderCode{"Trích xuất orderCode hợp lệ<br/>từ nội dung chuyển khoản?"}
    ParseOrderCode -- "Không tìm thấy" --> RejectSePay422["Trả về HTTP 422:<br/>Nội dung không chứa mã đơn hàng"]
    RejectSePay422 --> End

    ParseOrderCode -- "Tìm thấy" --> MatchTx{"Khớp giao dịch PENDING<br/>và đúng số tiền?"}
    MatchTx -- "Không khớp" --> RejectSePayAmt["Báo lỗi sai lệch số tiền,<br/>không set PAID"]
    MatchTx -- "Khớp" --> SePaySuccess["Cập nhật PaymentTransaction = SUCCESS,<br/>Order = PAID, paidAt = now"]
    SePaySuccess --> CloseQRModal["Frontend đóng Modal VietQR<br/>và chuyển đến trang Order Detail"]
    CloseQRModal --> End
```

## Business Rules áp dụng

| Rule | Ý nghĩa trong luồng |
|---|---|
| BR-40/NFR-19 | Chỉ set `PAID` khi nhận và xác thực thành công webhook/IPN; không tin redirect từ trình duyệt |
| BR-43 | Yêu cầu chữ ký/checksum không hợp lệ bị từ chối và **không** làm thay đổi dữ liệu |
| BR-41/ERD-R-17 | Nhiều lần thử thanh toán là bình thường; webhook gọi lại không tạo giao dịch trùng (`UNIQUE(gateway, gateway_transaction_no)`) |
| FR-57/NFR-20 | Secret key của cổng chỉ tồn tại phía backend, không lộ ra response |
| BR-42 | Hoàn tiền (nếu có) là thao tác thủ công của Admin ngoài hệ thống — xem [order-processing.md](order-processing.md) |
