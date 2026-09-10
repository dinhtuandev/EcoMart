# Use Case Diagrams – EcoMart

## Purpose

Mô tả các use case của hệ thống EcoMart theo từng nhóm actor: (1) Chức năng công khai & Xác thực, (2) Chức năng Customer, (3) Chức năng Admin. Use case quá lớn nên được chia thành 3 diagram theo domain để dễ đọc; mã use case giữ nguyên ký hiệu `UC…` trong tài liệu Diagrams.

## Source

- BA §6 Use Case List (UC-G-*, UC-C-*, UC-A-*), §4 Functional Requirements
- docs/02_EcoMart_Diagrams.md §2 (bảng đối chiếu UC01–UC45) và §2.1 Ghi chú Use Case
- BR-21/22/27/28 (điều kiện hủy đơn, xác nhận đơn, đánh giá)

## Diagram

### 1. Chức năng công khai & Xác thực (Guest / Customer)

```mermaid
flowchart LR
    G[Guest]
    C[Customer]

    subgraph EM["Hệ thống EcoMart"]
        subgraph PUBLIC["Chức năng công khai và Xác thực"]
            UC01(["Xem trang chủ"])
            UC02(["Xem danh mục và sản phẩm"])
            UC03(["Xem chi tiết sản phẩm và đánh giá"])
            UC04(["Tìm kiếm sản phẩm"])
            UC05(["Lọc và sắp xếp sản phẩm"])
            UC33(["Xem trang chính sách"])
            UC34(["Gửi liên hệ / feedback"])
            UC06(["Đăng ký tài khoản"])
            UC40(["Xác thực email qua mã OTP"])
            UC41(["Gửi lại mã OTP kích hoạt"])
            UC07(["Đăng nhập"])
            UC08(["Yêu cầu quên mật khẩu"])
            UC42(["Đặt lại mật khẩu qua mã OTP"])
        end
    end

    G --- UC01
    G --- UC02
    G --- UC03
    G --- UC04
    G --- UC05
    G --- UC33
    G --- UC34
    G --- UC06
    G --- UC40
    G --- UC41
    G --- UC07
    G --- UC08
    G --- UC42

    C -.->|"kế thừa chức năng Guest"| G
    C --- UC07

    UC06 -. "<<include>>" .-> UC40
    UC08 -. "<<include>>" .-> UC42
```

### 2. Chức năng Customer

```mermaid
flowchart LR
    C[Customer]

    subgraph EM["Hệ thống EcoMart"]
        subgraph CF["Chức năng Customer"]
            UC09(["Quản lý hồ sơ cá nhân"])
            UC10(["Đổi mật khẩu"])
            UC11(["Quản lý địa chỉ giao hàng"])
            UC12(["Quản lý giỏ hàng"])
            UC43(["Làm trống giỏ hàng"])
            UC13(["Đặt hàng"])
            UC44(["Thử lại thanh toán online"])
            UC14(["Theo dõi và xem chi tiết đơn hàng"])
            UC15(["Hủy đơn hàng chờ xác nhận"])
            UC16(["Xem lịch sử mua hàng"])
            UC17(["Đánh giá sản phẩm đã mua"])
        end

        subgraph INC["Use case được bao gồm"]
            UC27(["Kiểm tra tồn kho"])
            UC28(["Chọn địa chỉ giao hàng"])
            UC29(["Lưu chi tiết đơn hàng và giảm tồn kho"])
            UC31(["Hủy đơn và hoàn lại tồn kho"])
            UC39(["Khởi tạo giao dịch thanh toán online"])
        end
    end

    C --- UC09
    C --- UC10
    C --- UC11
    C --- UC12
    C --- UC43
    C --- UC13
    C --- UC44
    C --- UC14
    C --- UC15
    C --- UC16
    C --- UC17

    UC13 -. "<<include>>" .-> UC27
    UC13 -. "<<include>>" .-> UC28
    UC13 -. "<<include>>" .-> UC29
    UC13 -. "chỉ khi chọn thanh toán online" .-> UC39
    UC44 -. "<<include>>" .-> UC39
    UC15 -. "<<include>>" .-> UC31
```

### 3. Chức năng Admin

```mermaid
flowchart LR
    A[Admin]

    subgraph EM["Hệ thống EcoMart"]
        subgraph AF["Chức năng Admin"]
            UC07A(["Đăng nhập quản trị"])
            UC18(["Xem dashboard tổng quan"])
            UC45(["Xem báo cáo phân tích nâng cao"])
            UC19(["Quản lý người dùng"])
            UC20(["Quản lý danh mục"])
            UC21(["Quản lý thương hiệu"])
            UC22(["Quản lý sản phẩm"])
            UC23(["Quản lý tồn kho"])
            UC24(["Quản lý đơn hàng"])
            UC25(["Quản lý đánh giá"])
            UC35(["Quản lý chứng nhận sinh thái"])
            UC36(["Quản lý tin nhắn liên hệ"])
            UC37(["Quản lý nội dung trang chính sách"])
            UC38(["Cấu hình thông tin cửa hàng"])
        end

        subgraph INCA["Hành động con trên đơn hàng"]
            UC30(["Xác nhận đơn hàng"])
            UC31A(["Hủy đơn và hoàn lại tồn kho"])
            UC32(["Hoàn thành đơn hàng"])
        end
    end

    A --- UC07A
    A --- UC18
    A --- UC45
    A --- UC19
    A --- UC20
    A --- UC21
    A --- UC22
    A --- UC23
    A --- UC24
    A --- UC25
    A --- UC35
    A --- UC36
    A --- UC37
    A --- UC38

    UC24 -. "<<include>>" .-> UC30
    UC24 -. "<<include>>" .-> UC31A
    UC24 -. "<<include>>" .-> UC32
    UC22 -. "<<include>>" .-> UC35
```

## Ghi chú nghiệp vụ (từ BA/docs)

- `Đăng ký tài khoản` kích hoạt OTP 6 số qua Resend API; tài khoản chưa kích hoạt (`is_email_verified = false`) không đăng nhập được cho đến khi hoàn tất `Xác thực email qua mã OTP`.
- `Đặt hàng` include kiểm tra tồn kho, chọn địa chỉ, lưu chi tiết đơn và giảm tồn kho; nếu chọn thanh toán online thì khởi tạo thêm giao dịch thanh toán và mở cổng (VNPay redirect hoặc modal VietQR).
- Customer chỉ hủy được đơn ở trạng thái **Chờ xác nhận** (`PENDING`) — BR-21.
- Admin xác nhận đơn online chỉ khi trạng thái thanh toán là **Đã thanh toán** (`PAID`) — BR-22.
- `Đánh giá sản phẩm đã mua` chỉ hợp lệ với sản phẩm thuộc đơn **Đã hoàn thành** (`COMPLETED`) của chính Customer đó — BR-27/28 (điều kiện này do API thực thi tại `POST /reviews`, không phải một use case riêng).
- `UC31` xuất hiện ở cả diagram Customer và Admin vì cả hai actor đều kích hoạt hành động hủy kèm hoàn tồn kho (BR-21/23).
