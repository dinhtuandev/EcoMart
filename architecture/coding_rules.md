# General Coding Rules

## 1. Nguyên tắc Lập trình Cốt lõi
- **DRY (Don't Repeat Yourself)**: Không lặp lại logic. Tách hàm dùng chung hoặc helper khi cần.
- **KISS (Keep It Simple, Stupid)**: Ưu tiên mã nguồn đơn giản, dễ đọc hơn là mã nguồn ngắn nhưng khó hiểu hoặc quá trừu tượng.
- **Early Returns Pattern**: Trả về sớm (Early return) để giảm độ sâu lồng nhau của câu lệnh `if/else`.

```java
// ✅ ĐÚNG (Early Return)
public OrderResponse cancelOrder(Long orderId, Long userId) {
    Order order = orderRepository.findById(orderId)
        .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));

    if (!order.getUser().getId().equals(userId)) {
        throw new BadRequestException("Bạn không có quyền hủy đơn hàng này");
    }

    if (order.getStatus() != OrderStatus.PENDING) {
        throw new BadRequestException("Chỉ có thể hủy đơn hàng ở trạng thái Chờ xác nhận");
    }

    order.setStatus(OrderStatus.CANCELLED);
    return orderMapper.toResponse(orderRepository.save(order));
}
```

## 2. Quy tắc Đặt tên (Naming Rules)
- **Class / Component / Interface**: `PascalCase` (Ví dụ: `ProductService`, `ProductCard`, `OrderRepository`).
- **Variable / Function / Method**: `camelCase` (Ví dụ: `calculateTotalPrice`, `handleSubmitOrder`).
- **Constant**: `UPPER_SNAKE_CASE` (Ví dụ: `MAX_PAGE_SIZE = 20`, `DEFAULT_ROLE = "ROLE_USER"`).
- **Event Handler (React)**: Bắt buộc dùng tiền tố `handle` cho hàm bắt sự kiện (Ví dụ: `handleClick`, `handleSubmit`, `handleCategoryChange`).

## 3. Quản lý Mã nguồn & Sạch sẽ
- **Không chứa Dead Code**: Xóa các biến, import, hàm không được sử dụng.
- **Không để log dư thừa**: Loại bỏ `System.out.println` ở Java và `console.log` ở React trước khi commit.
- **Không để comment TODO**: Phải hoàn thiện đầy đủ logic, không bỏ lỡ logic dở dang.

## 4. Accessibility & UI Standard (React)
- Thẻ tương tác (Button, Link) phải có thuộc tính rõ ràng: `aria-label`, `tabIndex`, `onClick`, `onKeyDown` khi cần.
- Sử dụng đúng thẻ HTML5 Semantic: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
