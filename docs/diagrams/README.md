# EcoMart System Diagrams — Index

Bộ sơ đồ hệ thống EcoMart được xây dựng từ tài liệu BA/docs trong `docs/` (source of truth). Toàn bộ diagram dùng Mermaid và đã được xác thực syntax bằng `mermaid.parse()` chính thức (xem mục Validation).

## Danh sách Diagram

| # | Loại | File | Nguồn chính |
|---|---|---|---|
| 01 | System Context | [01-system-context.md](01-system-context.md) | BA §1.3, §2.4, §3; FR-55…57; BR-19/40/43; README |
| 02 | Use Case (chia 3 nhóm) | [02-use-case.md](02-use-case.md) | BA §6 Use Case List; doc 02 §2 |
| 03 | System Architecture | [03-system-architecture.md](03-system-architecture.md) | README Tech Stack; CLAUDE.md; architecture/backend_rules.md; architecture/project_context.md |
| 04 | ERD (21 bảng) | [04-erd.md](04-erd.md) | doc 03 ERD; doc 04 database design |
| A1 | Activity — Đăng ký & OTP email | [activity/registration-email-otp.md](activity/registration-email-otp.md) | doc 02 §3; FR-60…62, FR-65/66; NFR-21/22 |
| A2 | Activity — Mua hàng & Đặt hàng | [activity/purchase-checkout.md](activity/purchase-checkout.md) | doc 02 §4; BA §2.1; BR-09…18 |
| A3 | Activity — Xử lý đơn hàng | [activity/order-processing.md](activity/order-processing.md) | doc 02 §5 + bảng §5.1; BR-20…25/34; API §7.5 |
| A4 | Activity — Thanh toán online | [activity/online-payment-gateways.md](activity/online-payment-gateways.md) | doc 02 §6; FR-56/57; BR-40…43 |
| A5 | Activity — Đánh giá sản phẩm | [activity/review-product.md](activity/review-product.md) | FR-29/30; BR-27…30; API §6.5; ERD-R-13/14 |
| S1 | Sequence — Đăng ký / Đăng nhập / Refresh Token | [sequence/auth-register-login-refresh.md](sequence/auth-register-login-refresh.md) | API §4; doc 02 §3; FR-63/64 |
| S2 | Sequence — Duyệt sản phẩm | [sequence/product-browsing.md](sequence/product-browsing.md) | API §5; FR-01…08, 43…45, 48; NFR-08 |
| S3 | Sequence — Checkout & tạo đơn hàng | [sequence/checkout-create-order.md](sequence/checkout-create-order.md) | API §6.4; BR-15…18; ERD-R-08/09; doc 04 §8 |
| S4 | Sequence — Thanh toán VNPay | [sequence/payment-vnpay.md](sequence/payment-vnpay.md) | API §6.6; doc 02 §6; BR-40/43; NFR-19 |
| S5 | Sequence — Thanh toán SePay VietQR | [sequence/payment-sepay.md](sequence/payment-sepay.md) | API §6.6; doc 02 §6; checklist Module 9 |
| S6 | Sequence — Hủy đơn & hoàn tiền thủ công | [sequence/order-cancel-refund.md](sequence/order-cancel-refund.md) | BR-21…23/42; API §6.4, §7.5; ERD-R-18 |
| S7 | Sequence — Đánh giá & kiểm duyệt | [sequence/review-submit.md](sequence/review-submit.md) | API §6.5, §7.6; BR-27…30 |
| T1 | State — Trạng thái xử lý đơn hàng | [state/order-status.md](state/order-status.md) | doc 02 §1, §5.1; BR-22…25/34; ERD-R-10 |
| T2 | State — Trạng thái thanh toán của đơn | [state/order-payment-status.md](state/order-payment-status.md) | BR-20/40/42; ERD-R-12; doc 02 §5.1 |
| T3 | State — Trạng thái giao dịch thanh toán | [state/payment-transaction-status.md](state/payment-transaction-status.md) | doc 02 §6; API §6.6; ERD-R-17 |

## Quy ước chung

- **Actor**: `Guest`, `Customer`, `Admin` — đúng thuật ngữ BA.
- **External systems**: `Gmail SMTP` (email OTP), `VNPay Sandbox` (IPN HMAC-SHA512), `SePay` (VietQR Napas 247 webhook), Google Maps chỉ là iframe embed hiển thị.
- **Trạng thái**: dùng cặp giá trị API + nhãn tiếng Việt (`PENDING` — Chờ xác nhận, …) theo quy ước API Spec §2.6.
- **Backend layers** trong sequence diagram: Controller → Service → PostgreSQL (theo architecture rules 4 tầng; tầng Repository được thể hiện tập trung ở diagram Architecture).
- Thông tin không được docs mô tả được ghi chú rõ `NOT SPECIFIED`, không tự suy diễn.

## Validation syntax Mermaid

Không có Mermaid MCP trong môi trường; toàn bộ khối ```mermaid``` được xác thực bằng package `mermaid` chính thức:

```bash
cd mermaid && npm install   # lần đầu
node validate.mjs ../docs/diagrams
```

Kết quả kỳ vọng: mọi block in ra `PASS`.
