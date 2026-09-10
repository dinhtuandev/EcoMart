# Task Execution Template for AI & Developers

> **Hướng dẫn**: Copy template này khi yêu cầu AI thực hiện 1 tính năng hoặc task cụ thể để đảm bảo AI làm đúng mô hình, không vượt quá ranh giới đồ án EcoMart.

---

## 📌 Task Name: [Tên nhiệm vụ / Tính năng]

### 1. Mục tiêu Task (Goal)
- Mô tả ngắn gọn nhiệm vụ cần hoàn thành (Ví dụ: Viết API thêm sản phẩm vào giỏ hàng và giao diện nút "Thêm vào giỏ" ở Frontend).

### 2. Phạm vi & Ranh giới (Scope & Boundaries)
- **Nên làm (In-Scope)**:
  - [ ] Chi tiết 1...
  - [ ] Chi tiết 2...
- **CẤM làm (Out-of-Scope / Non-Goals)**:
  - ❌ KHÔNG áp dụng Microservices / Kafka / Event-Driven.
  - ❌ KHÔNG thêm thanh toán online (chỉ làm COD).
  - ❌ KHÔNG sửa đổi các bảng DB ngoài phạm vi task này.

### 3. Danh sách File ảnh hưởng (Affected Files)
- **Backend**:
  - [NEW] `com.group.ecommerce.controller.CartController.java`
  - [MODIFY] `com.group.ecommerce.service.CartService.java`
- **Frontend**:
  - [NEW] `src/services/cartApi.js`
  - [MODIFY] `src/pages/public/ProductDetailPage.jsx`

### 4. Kế hoạch Triển khai Chi tiết (Step-by-Step Plan)
1. **Bước 1**: [Mô tả chi tiết bước 1]
2. **Bước 2**: [Mô tả chi tiết bước 2]
3. **Bước 3**: [Mô tả chi tiết bước 3]

### 5. Tiêu chí Kiểm thử & Nghiệm thu (Verification Checklist)
- [ ] Backend build không có lỗi compile (`./mvnw clean compile`).
- [ ] API trả về đúng format `ApiResponse` chuẩn.
- [ ] Giao diện React hiển thị mượt mà, không lag, không crash.
- [ ] Không có lỗi console ở Frontend hay Exception ở Backend.
