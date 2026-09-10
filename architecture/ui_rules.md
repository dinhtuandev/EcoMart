# UI / UX Design Rules (React + TailwindCSS)

## 1. Phong cách Thiết kế & Tone màu (Design System & Aesthetic)
- **Chủ đề**: EcoMart – Website Thương mại Điện tử Thiết bị Công nghệ (Laptop, PC, Phụ kiện).
- **Tông màu chủ đạo**:
  - Primary: Indigo / Blue (`bg-blue-600`, `hover:bg-blue-700`, `text-blue-600`) cho nút chính, link, highlight.
  - Neutral / Background: Slate / Gray (`bg-slate-50` cho nền, `bg-white` cho card, `text-slate-800` cho chữ).
  - Accent / Status Badges (chỉ 4 trạng thái, hệ thống không tách bước vận chuyển — không dùng `SHIPPED`/`DELIVERED`):
    - `PENDING` (Chờ xác nhận): Vàng (`bg-amber-100 text-amber-800`)
    - `CONFIRMED` (Đã xác nhận): Xanh dương (`bg-blue-100 text-blue-800`)
    - `COMPLETED` (Đã hoàn thành): Xanh lá (`bg-emerald-100 text-emerald-800`)
    - `CANCELLED` (Đã hủy): Đỏ (`bg-rose-100 text-rose-800`)

## 2. Quy tắc TailwindCSS Usage
- **CHỈ dùng Tailwind Utility Classes**. Không dùng CSS file riêng trừ `index.css` cho font-family / base reset.
- Không hardcode màu sắc kiểu hex `bg-[#123456]` trừ trường hợp logo đặc thù. Sử dụng màu chuẩn của Tailwind (`blue-600`, `gray-100`,...).

## 3. Trải nghiệm Người dùng (UX & Micro-interactions)
- **Hover Effects**: Thẻ sản phẩm (`ProductCard`) có hiệu ứng nổi nhẹ khi hover (`hover:shadow-lg transition-all duration-300`).
- **Loading State**: Mọi thao tác submit form hoặc tải dữ liệu từ API đều phải có hiệu ứng Spinner hoặc Skeleton loader.
- **Empty State**: Khi giỏ hàng trống, đơn hàng trống, hoặc tìm kiếm không thấy sản phẩm, phải hiển thị hình minh họa + nút quay lại mua hàng.
- **Notification / Alert**: Dùng Toast Notification (như `react-toastify` hoặc `hot-toast`) để thông báo khi thêm giỏ hàng thành công, đăng nhập lỗi, hoặc đặt hàng thành công.

## 4. Layout & Grid Standards
- **Product Grid**:
  - Mobile: 1-2 cột (`grid-cols-1 sm:grid-cols-2`)
  - Tablet: 3 cột (`md:grid-cols-3`)
  - Desktop: 4-5 cột (`lg:grid-cols-4 xl:grid-cols-5`)
- **Responsive Navigation**: Navbar hỗ trợ Hamburger Menu trên Mobile.
