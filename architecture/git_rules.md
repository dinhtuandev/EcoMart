# Git & Collaboration Rules

## 1. Chiến lược Phân nhánh (Branching Strategy)
- `main` / `master`: Nhánh sản phẩm ổn định, chỉ merge khi tính năng đã hoàn thiện và kiểm thử thành công.
- `dev`: Nhánh phát triển chính của cả nhóm. Các thành viên checkout từ `dev`.
- Nhánh tính năng (`feature/...`):
  - `feature/auth`: Đăng ký, Đăng nhập, JWT
  - `feature/product-catalog`: Quản lý & hiển thị sản phẩm
  - `feature/cart-checkout`: Giỏ hàng & Đặt hàng
  - `feature/admin-dashboard`: Giao diện & API Admin

## 2. Quy chuẩn Commit Message (Conventional Commits)
Format: `<type>: <tóm tắt ngắn gọn thay đổi bằng tiếng Việt hoặc tiếng Anh>`

Cấu trúc các `type`:
- `feat`: Thêm tính năng mới (Ví dụ: `feat: Thêm API tìm kiếm sản phẩm theo tên`)
- `fix`: Sửa lỗi (Ví dụ: `fix: Sửa lỗi không tính tổng tiền giỏ hàng`)
- `docs`: Cập nhật tài liệu (Ví dụ: `docs: Cập nhật API specification`)
- `style`: Thay đổi giao diện CSS/Tailwind (Ví dụ: `style: Chỉnh sửa padding cho ProductCard`)
- `refactor`: Tái cấu trúc code nhưng không đổi tính năng (Ví dụ: `refactor: Tách AuthService ra khỏi AuthController`)

## 3. Quy trình Merge & Code Review
- Không commit trực tiếp lên nhánh `main`.
- Đẩy branch cá nhân lên Git và tạo **Pull Request (PR)** vào `dev`.
- Tối thiểu 1 thành viên khác trong nhóm kiểm tra trước khi Merge PR.
