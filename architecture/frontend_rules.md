# Frontend Rules (React + Vite)

## 1. Công nghệ & Thư viện Sử dụng
- **Core**: React 18+ với Vite.
- **Routing**: `react-router-dom` v6.
- **HTTP Client**: `axios`.
- **Styling**: `tailwindcss`.
- **State Management**: **React Context API** (`AuthContext`, `CartContext`). KHÔNG DÙNG Redux/Zustand trừ khi có yêu cầu đặc biệt.

## 2. Cấu trúc Thư mục & Trách nhiệm
- `components/common/`: Các UI component cơ bản dùng lại nhiều lần (Button, Input, Badge, Modal, Pagination, Spinner).
- `components/layout/`: Header, Footer, AdminSidebar, UserNavbar.
- `pages/`: Chứa các trang hoàn chỉnh tương ứng với từng Route (`HomePage`, `LoginPage`, `CartPage`, `AdminDashboardPage`,...).
- `services/`: Chứa các hàm gọi API bằng Axios (`authApi.js`, `productApi.js`, `orderApi.js`).
- `context/`: `AuthContext.jsx` (quản lý user, token, login/logout) và `CartContext.jsx` (quản lý số lượng & danh sách sản phẩm trong giỏ).
- `routes/`: Cấu hình danh sách Route & `ProtectedRoute.jsx` để kiểm tra phân quyền (User/Admin).

## 3. Quy tắc API Calls & State Management
- **KHÔNG gọi `axios` trực tiếp trong UI Component (pages/components)**. Mọi lệnh gọi API phải thông qua hàm trong `services/`.
- Quản lý JWT Token: Lưu Token trong `localStorage`. Tự động đính kèm `Authorization: Bearer <token>` thông qua Axios Request Interceptor.
- Xử lý trạng thái `loading` và `error` trên mọi trang có fetch dữ liệu để cải thiện trải nghiệm người dùng.

## 4. Quy tắc UI & Styling
- Chỉ sử dụng class TailwindCSS. Tránh viết CSS thuần hoặc inline styles `style={{...}}`.
- Xây dựng giao diện Responsive ưu tiên trải nghiệm trên Laptop/Desktop và thích ứng tốt trên Mobile.
- Định dạng tiền tệ hiển thị đúng chuẩn Việt Nam Đồng (VND), ví dụ: `15.990.000 ₫` sử dụng utility `formatCurrency()`.

## 5. Những điều CẤM trong Frontend
- ❌ Không dùng các thư viện State Management quá phức tạp (Redux Toolkit, MobX) gây rườm rà.
- ❌ Không hardcode URL Backend trong component; phải dùng file `.env` (`VITE_API_BASE_URL`).
- ❌ Không để ứng dụng bị crash khi API trả về lỗi (luôn dùng `try/catch` hoặc `.catch()` để xử lý).
