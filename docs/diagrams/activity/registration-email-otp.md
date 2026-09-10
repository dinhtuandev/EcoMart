# Activity Diagram – Đăng ký & Xác thực Email OTP

## Purpose

Mô tả luồng nghiệp vụ đăng ký tài khoản Customer và kích hoạt tài khoản bằng mã OTP 6 chữ số gửi qua email, gồm các quy tắc chống spam và chống brute-force.

## Source

- docs/02_EcoMart_Diagrams.md §3
- FR-09, FR-60, FR-61, FR-65, FR-66; NFR-21, NFR-22
- API §4.1–§4.3 (`register`, `verify-email`, `resend-verification`)
- ERD-R-16 (tự vô hiệu hóa token sau 5 lần sai)

## Diagram

```mermaid
flowchart TD
    Start([Bắt đầu]) --> FillForm["Guest điền thông tin đăng ký:<br/>Họ tên, Email, Mật khẩu, SĐT"]
    FillForm --> Submit["Gửi yêu cầu đăng ký"]
    Submit --> CheckEmail{"Email đã tồn tại?"}
    CheckEmail -- "Có" --> ShowEmailError["Thông báo lỗi 409:<br/>Email đã được sử dụng"]
    ShowEmailError --> FillForm

    CheckEmail -- "Không" --> CheckSpam{"Kiểm tra Anti-Spam:<br/>Cooldown 60s và Rate Limit 5/15p?"}
    CheckSpam -- "Vi phạm" --> Show429["Thông báo lỗi 429:<br/>Vui lòng đợi trước khi yêu cầu tiếp"]
    Show429 --> FillForm

    CheckSpam -- "Hợp lệ" --> CreateUser["Tạo User trạng thái chưa xác thực email:<br/>isEmailVerified = false"]
    CreateUser --> GenOTP["Sinh mã OTP 6 chữ số ngẫu nhiên,<br/>hiệu lực 5 phút"]
    GenOTP --> SendMail["Gửi email chứa mã OTP kích hoạt<br/>qua Resend API"]
    SendMail --> OpenModal["Frontend mở Modal nhập<br/>mã OTP xác thực"]

    OpenModal --> InputOTP["Người dùng nhập mã OTP 6 số"]
    InputOTP --> VerifyOTP{"Mã OTP hợp lệ và còn hạn?"}

    VerifyOTP -- "Hết hạn" --> ExpiredErr["Thông báo OTP đã hết hạn"]
    ExpiredErr --> ResendPrompt{"Yêu cầu gửi lại mã OTP?"}
    ResendPrompt -- "Có" --> CheckSpam
    ResendPrompt -- "Không" --> EndFail([Kết thúc])

    VerifyOTP -- "Sai mã" --> IncFailed["Tăng số lần thử sai:<br/>failedAttempts + 1"]
    IncFailed --> CheckMax{"Đã sai >= 5 lần?"}
    CheckMax -- "Có" --> InvalidateToken["Vô hiệu hóa token,<br/>thông báo lỗi brute-force"]
    InvalidateToken --> ResendPrompt
    CheckMax -- "Không" --> ShowRemaining["Báo lỗi sai mã,<br/>hiển thị số lần thử còn lại"]
    ShowRemaining --> InputOTP

    VerifyOTP -- "Đúng mã" --> ActivateUser["Cập nhật isEmailVerified = true,<br/>đánh dấu token đã dùng"]
    ActivateUser --> IssueTokens["Cấp phát Access Token và Refresh Token"]
    IssueTokens --> AutoLogin["Tự động đăng nhập người dùng vào hệ thống"]
    AutoLogin --> End([Kết thúc])
```

## Business Rules áp dụng

| Rule | Ý nghĩa trong luồng |
|---|---|
| BR-01/BR-02 | Email duy nhất, đúng định dạng → lỗi `409` nếu trùng |
| FR-65/NFR-21 | Cooldown 60s giữa 2 lần gửi; tối đa 5 yêu cầu / 15 phút mỗi email → `429` |
| FR-66/NFR-22 | Sai quá 5 lần liên tiếp → token bị vô hiệu hóa (chống brute-force) |
| OTP hết hạn | 5 phút cho OTP kích hoạt; gửi lại qua `resend-verification` |
