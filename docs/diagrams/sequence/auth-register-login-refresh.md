# Sequence Diagrams – Authentication (Đăng ký OTP, Đăng nhập, Refresh Token)

## Purpose

Mô tả tương tác giữa Guest/Customer/Admin, Frontend SPA, Backend API và các thành phần dữ liệu/dịch vụ ngoài trong các luồng xác thực: đăng ký + OTP email, đăng nhập và làm mới phiên.

## Source

- API §4 Authentication API (`register`, `verify-email`, `resend-verification`, `login`, `refresh-token`, `me`)
- docs/02_EcoMart_Diagrams.md §3; FR-60…FR-66
- NFR-21/22 (cooldown 60s, 5 lần / 15 phút, tối đa 5 lần sai OTP); FR-63 (refresh token), FR-64 (get me)
- Wireframe §3.5–§3.7 (phân luồng điều hướng sau login theo role)

## Diagram

### 1. Đăng ký tài khoản & Xác thực email bằng mã OTP

```mermaid
sequenceDiagram
    autonumber
    actor G as Guest
    participant FE as "Frontend SPA (React)"
    participant CTL as "REST Controller /api/v1"
    participant SVC as "Service (Business Logic)"
    participant DB as "PostgreSQL"
    participant RES as "Resend API"

    G->>FE: Điền form đăng ký và gửi
    FE->>CTL: POST /auth/register {fullName, email, password, phoneNumber}
    CTL->>SVC: Xử lý đăng ký
    SVC->>DB: Kiểm tra email đã tồn tại?

    alt Email đã tồn tại
        CTL-->>FE: 409 Email đã được sử dụng
        FE-->>G: Báo lỗi, ở lại form
    else Anti-spam vi phạm (cooldown 60s hoặc quá 5 lần trong 15 phút)
        CTL-->>FE: 429 Too Many Requests
        FE-->>G: Toast cảnh báo kèm đếm ngược
    else Thông tin hợp lệ
        SVC->>DB: Tạo User is_email_verified=false + EmailVerificationToken (OTP 6 số, hạn 5 phút)
        SVC->>RES: Gửi email chứa mã OTP kích hoạt
        RES-->>SVC: Gửi thành công
        CTL-->>FE: 201 Đăng ký thành công
        FE-->>G: Mở Modal nhập OTP với đếm ngược 60 giây

        G->>FE: Nhập mã OTP 6 số
        FE->>CTL: POST /auth/verify-email {email, otpCode}
        CTL->>SVC: Xác thực OTP
        SVC->>DB: Tra token theo email, kiểm tra expires_at và failed_attempts

        alt OTP đúng và còn hạn
            SVC->>DB: user.is_email_verified = true, đánh dấu token đã dùng
            SVC->>SVC: Sinh Access Token (JWT) + Refresh Token
            CTL-->>FE: 200 {accessToken, refreshToken, user}
            FE-->>G: Tự động đăng nhập vào hệ thống
        else Sai mã nhưng chưa đạt ngưỡng
            SVC->>DB: failed_attempts = failed_attempts + 1
            CTL-->>FE: 400 kèm số lần thử còn lại
            FE-->>G: Báo lỗi, cho nhập lại
        else Hết hạn hoặc đã sai quá 5 lần
            SVC->>DB: Vô hiệu hóa token
            CTL-->>FE: 400 Token hết hạn / bị vô hiệu hóa
            FE-->>G: Cho phép gửi lại OTP qua POST /auth/resend-verification
        end
    end
```

### 2. Đăng nhập & Làm mới phiên (Refresh Token)

```mermaid
sequenceDiagram
    autonumber
    actor U as Customer hoặc Admin
    participant FE as "Frontend SPA (React)"
    participant CTL as "REST Controller /api/v1"
    participant SVC as "Service (Business Logic)"
    participant DB as "PostgreSQL"

    U->>FE: Nhập email / mật khẩu và đăng nhập
    FE->>CTL: POST /auth/login {email, password}
    CTL->>SVC: Xác thực đăng nhập
    SVC->>DB: Tra user theo email (UNIQUE)

    alt Tài khoản chưa xác thực email (is_email_verified=false) hoặc is_active=false
        CTL-->>FE: 401 kèm thông báo hướng dẫn
        FE-->>U: Hiển thị lỗi xác thực / tài khoản không hoạt động
    else Email hoặc mật khẩu sai
        CTL-->>FE: 401
        FE-->>U: Hiển thị lỗi xác thực
    else Thông tin hợp lệ
        SVC->>SVC: So khớp password_hash, sinh Access Token (JWT) + Refresh Token
        CTL-->>FE: 200 {accessToken, refreshToken, role}

        alt role = ADMIN
            FE-->>U: Điều hướng tới Dashboard /admin
        else role = CUSTOMER
            FE-->>U: Điều hướng về trang trước đó hoặc trang chủ
        end

        U->>FE: Tiếp tục sử dụng ứng dụng
        note over FE: Khi request trả 401 do access token hết hạn,<br/>Axios interceptor tự động gọi refresh-token (FR-63)
        FE->>CTL: POST /auth/refresh-token {refreshToken}
        CTL->>SVC: Kiểm tra refresh token hợp lệ
        SVC-->>CTL: Cấp access token mới
        CTL-->>FE: 200 accessToken mới
        FE->>CTL: Tự động gửi lại request gốc với Bearer token mới
        CTL-->>FE: Phản hồi request gốc thành công
    end
```

## Ghi chú

- `GET /auth/me` cho phép client lấy profile + vai trò từ Bearer Token (FR-64) — luồng đơn giản GET trực tiếp nên không vẽ riêng.
- Secret key (JWT_SECRET, RESEND_API_KEY…) nạp 100% qua `.env`, không hardcode (NFR-23).
