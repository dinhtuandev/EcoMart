# Activity Diagram – Quy trình mua hàng & Đặt hàng

## Purpose

Mô tả luồng mua hàng từ khi duyệt sản phẩm, thêm giỏ, đến khi tạo đơn hàng và điều hướng theo phương thức thanh toán (COD / VNPay / SePay).

## Source

- docs/02_EcoMart_Diagrams.md §4
- BA §2.1 Quy trình mua hàng; FR-19…24, FR-55, FR-56
- BR-04, BR-09, BR-13…18 (điều kiện giỏ hàng, kiểm tra tồn kho, snapshot giá)

## Diagram

```mermaid
flowchart TD
    Start([Bắt đầu]) --> Browse["Guest / Customer xem, tìm kiếm<br/>hoặc lọc sản phẩm"]
    Browse --> Detail["Xem chi tiết sản phẩm"]
    Detail --> Available{"Sản phẩm đang hiển thị<br/>và còn tồn kho?"}

    Available -- "Không" --> Notice["Hiển thị nhãn hết hàng /<br/>không thể mua"]
    Notice --> Browse

    Available -- "Có" --> LoginCheck{"Đã đăng nhập?"}
    LoginCheck -- "Không" --> Auth["Đăng nhập hoặc đăng ký<br/>xác thực OTP"]
    Auth --> AuthOK{"Xác thực thành công?"}
    AuthOK -- "Không" --> Auth
    AuthOK -- "Có" --> AddCart["Thêm sản phẩm vào giỏ hàng"]
    LoginCheck -- "Có" --> AddCart

    AddCart --> Continue{"Tiếp tục mua sắm?"}
    Continue -- "Có" --> Browse
    Continue -- "Không" --> Cart["Xem và cập nhật giỏ hàng"]
    Cart --> CartEmpty{"Giỏ hàng có sản phẩm?"}
    CartEmpty -- "Không" --> Browse
    CartEmpty -- "Có" --> Checkout["Vào trang Đặt hàng (Checkout)"]
    Checkout --> AddressValid{"Chọn địa chỉ giao hàng hợp lệ?"}
    AddressValid -- "Không" --> AddAddress["Thêm địa chỉ giao hàng mới"]
    AddAddress --> Checkout
    AddressValid -- "Có" --> ChoosePayment["Chọn phương thức thanh toán:<br/>COD / VNPay / SePay"]
    ChoosePayment --> Confirm["Nhấn Xác nhận đặt hàng"]

    Confirm --> CheckStock["Hệ thống kiểm tra tồn kho<br/>trong Transaction"]
    CheckStock --> StockEnough{"Đủ tồn kho cho toàn bộ món hàng?"}
    StockEnough -- "Không" --> StockError["Thông báo 422:<br/>Sản phẩm không đủ tồn kho"]
    StockError --> Cart

    StockEnough -- "Có" --> CreateOrder["Tạo đơn hàng PENDING,<br/>paymentStatus = UNPAID"]
    CreateOrder --> SaveOrder["Lưu OrderItem, giảm tồn kho<br/>và xóa giỏ hàng"]
    SaveOrder --> PaymentMethodCheck{"Phương thức thanh toán?"}

    PaymentMethodCheck -- "COD" --> SuccessCOD["Đặt hàng thành công,<br/>hiển thị chi tiết đơn"]
    SuccessCOD --> End([Kết thúc])

    PaymentMethodCheck -- "VNPay" --> RedirectVNPay["Chuyển hướng toàn trang sang<br/>VNPay Payment Gateway"]
    RedirectVNPay --> End

    PaymentMethodCheck -- "SePay" --> ShowVietQR["Hiển thị Popup VietQR Napas 247<br/>kèm mã đơn hàng"]
    ShowVietQR --> End
```

## Business Rules áp dụng

| Rule | Ý nghĩa trong luồng |
|---|---|
| BR-09/BR-13 | Chỉ sản phẩm đang hiển thị và còn tồn kho được thêm vào giỏ |
| BR-15 | Giỏ rỗng không đặt hàng được |
| BR-16 | Kiểm tra lại tồn kho toàn bộ giỏ trước khi tạo đơn (API trả `422` nếu thiếu) |
| BR-17/BR-18 | Tạo đơn: lưu giá/số lượng vào `order_items`, giảm tồn kho tương ứng |
| FR-56 | Đơn online: tạo `PaymentTransaction` và chuyển hướng sang cổng thanh toán |

> Sau khi đơn được tạo, luồng tiếp theo xem: [order-processing.md](order-processing.md) và [online-payment-gateways.md](online-payment-gateways.md).
