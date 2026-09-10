# Activity Diagram – Quy trình xử lý đơn hàng (Admin & Customer)

## Purpose

Mô tả vòng đời xử lý đơn hàng: Customer/Admin hủy đơn, Admin xác nhận và hoàn thành đơn, kèm các ràng buộc về tồn kho, trạng thái thanh toán và hoàn tiền thủ công.

## Source

- docs/02_EcoMart_Diagrams.md §5 + bảng quy tắc chuyển trạng thái §5.1
- BR-20…BR-25, BR-34; API §7.5 (quy tắc `/confirm`, `/cancel`, `/complete`, `/payment-status`)
- ERD-R-18 (hoàn tiền thủ công)

## Diagram

```mermaid
flowchart TD
    Start([Bắt đầu]) --> NewOrder["Đơn hàng được tạo:<br/>Chờ xác nhận (PENDING)"]
    NewOrder --> CustomerAction{"Customer hủy đơn?"}

    CustomerAction -- "Có" --> CustomerCancel["Customer gọi<br/>POST /orders/{orderId}/cancel"]
    CustomerCancel --> Restore1["Hoàn lại tồn kho và gán lý do mặc định:<br/>Khách hàng hủy đơn"]
    Restore1 --> RefundCheck1{"Đơn đã thanh toán online<br/>(PAID)?"}
    RefundCheck1 -- "Có" --> Refund1["Admin hoàn tiền thủ công ngoài hệ thống,<br/>cập nhật paymentStatus = REFUNDED"]
    Refund1 --> Cancelled1["Đơn hàng: CANCELLED"]
    RefundCheck1 -- "Không" --> Cancelled1
    Cancelled1 --> End([Kết thúc])

    CustomerAction -- "Không" --> AdminReview["Admin xem chi tiết đơn hàng"]
    AdminReview --> AdminDecision{"Admin có thể xử lý đơn?"}

    AdminDecision -- "Không" --> AdminCancel["Admin gọi POST /admin/orders/{orderId}/cancel<br/>kèm cancellationReason bắt buộc"]
    AdminCancel --> Restore2["Hoàn lại tồn kho cho các sản phẩm"]
    Restore2 --> RefundCheck2{"Đơn đã thanh toán online<br/>(PAID)?"}
    RefundCheck2 -- "Có" --> Refund2["Admin hoàn tiền thủ công ngoài hệ thống,<br/>cập nhật paymentStatus = REFUNDED"]
    Refund2 --> Cancelled2["Đơn hàng: CANCELLED"]
    RefundCheck2 -- "Không" --> Cancelled2
    Cancelled2 --> End

    AdminDecision -- "Có" --> PaymentCheck{"COD, hoặc online đã<br/>thanh toán (PAID)?"}
    PaymentCheck -- "Không" --> WaitPayment["Chờ Customer hoàn tất thanh toán<br/>hoặc Admin hủy nếu quá hạn"]
    WaitPayment --> AdminReview

    PaymentCheck -- "Có" --> Confirm["Admin gọi<br/>POST /admin/orders/{orderId}/confirm"]
    Confirm --> Confirmed["Đơn hàng: CONFIRMED"]
    Confirmed --> Delivered{"Giao hàng thành công?"}

    Delivered -- "Có" --> Complete["Admin gọi<br/>POST /admin/orders/{orderId}/complete"]
    Complete --> CheckCOD{"Phương thức COD?"}
    CheckCOD -- "Có" --> SetPaidCOD["Tự động cập nhật<br/>paymentStatus = PAID, paidAt = now"]
    SetPaidCOD --> CompleteDone["Đơn hàng: COMPLETED"]
    CheckCOD -- "Không" --> CompleteDone
    CompleteDone --> Revenue["Ghi nhận doanh thu vào hệ thống báo cáo"]
    Revenue --> ReviewEligible["Customer đủ điều kiện<br/>đánh giá sản phẩm"]
    ReviewEligible --> End

    Delivered -- "Không" --> AdminCancel2["Admin hủy đơn không giao được"]
    AdminCancel2 --> Restore3["Hoàn lại tồn kho"]
    Restore3 --> RefundCheck3{"Đơn đã thanh toán online<br/>(PAID)?"}
    RefundCheck3 -- "Có" --> Refund3["Admin hoàn tiền thủ công,<br/>cập nhật paymentStatus = REFUNDED"]
    Refund3 --> Cancelled3["Đơn hàng: CANCELLED"]
    RefundCheck3 -- "Không" --> Cancelled3
    Cancelled3 --> End
```

## Bảng quy tắc chuyển trạng thái đơn hàng

| Trạng thái hiện tại | Điều kiện thanh toán | Tác nhân | Hành động hợp lệ | Trạng thái sau | Tác động |
|---|---|---|---|---|---|
| `PENDING` | Bất kỳ | Customer | Hủy đơn | `CANCELLED` | Hoàn tồn kho; ghi nhận cần hoàn tiền nếu `PAID` |
| `PENDING` | `COD` hoặc online `PAID` | Admin | Xác nhận (`/confirm`) | `CONFIRMED` | Ghi nhận `confirmedAt` |
| `PENDING` | Online `UNPAID` | Admin | Không được xác nhận (`409`) | Giữ `PENDING` | Chờ thanh toán hoặc hủy |
| `PENDING` / `CONFIRMED` | Bất kỳ | Admin | Hủy (`/cancel`) | `CANCELLED` | Hoàn tồn kho; lưu lý do Admin nhập |
| `CONFIRMED` | Bất kỳ | Admin | Hoàn thành (`/complete`) | `COMPLETED` | Ghi nhận `completedAt`; COD tự set `PAID`; tính doanh thu |
| `COMPLETED` / `CANCELLED` | — | Không áp dụng | Không thể chuyển trạng thái khác | Không áp dụng | BR-25/BR-34 |
