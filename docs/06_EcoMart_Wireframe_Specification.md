# Wireframe Specification – EcoMart

## 1. Mục đích

Tài liệu này mô tả wireframe và hành vi UX cho các màn hình EcoMart. Mục tiêu là giúp nhóm Frontend triển khai giao diện React nhất quán với Business Analysis và API Specification.

Phạm vi là bố cục, thành phần, luồng thao tác, dữ liệu, validation và responsive. Không quy định màu sắc, animation, hiệu ứng hoặc hình ảnh trang trí.

## 2. Quy ước dùng chung

### 2.1. Khung giao diện khách hàng

| Thành phần | Chức năng |
|---|---|
| Header | Logo EcoMart, ô tìm kiếm, liên kết danh mục, giỏ hàng, nút đăng nhập hoặc menu tài khoản. Header luôn hiện trên desktop/tablet; trên mobile ưu tiên logo, tìm kiếm, giỏ hàng và menu. |
| Thanh điều hướng | Liên kết đến nhóm danh mục chính; có thể thu gọn vào menu trên mobile. |
| Breadcrumb | Hiển thị vị trí hiện tại ở trang listing, chi tiết, profile và đơn hàng. |
| Footer | Liên kết chính sách (đổi trả, bảo hành, vận chuyển), liên hệ, thông tin EcoMart và bản quyền. Không chứa chức năng ngoài phạm vi BA. |
| Empty state | Hiển thị khi không có dữ liệu, kèm một hành động phù hợp như “Tiếp tục mua sắm”. |
| Loading state | Dùng skeleton hoặc chỉ báo đang tải tại khu vực dữ liệu thay vì chặn toàn bộ trang. |
| Error state | Hiển thị thông báo rõ ràng gần khu vực phát sinh lỗi và cho phép thử lại khi phù hợp. |

### 2.2. Khung giao diện quản trị

| Thành phần | Chức năng |
|---|---|
| Sidebar | Điều hướng Dashboard, Users, Categories, Brands, Products, Inventory, Orders và Reviews. |
| Top bar | Tiêu đề trang hiện tại, thông tin Admin, menu tài khoản và đăng xuất. |
| Nội dung chính | Khu vực bảng dữ liệu, bộ lọc, biểu mẫu và thao tác quản trị. |
| Table | Hiển thị danh sách, hỗ trợ lọc, phân trang và nút xem/chỉnh sửa theo quyền. |
| Modal xác nhận | Chỉ dùng cho hành động thay đổi trạng thái quan trọng: khóa/mở khóa tài khoản, hủy đơn, hoàn thành đơn, ẩn/hiện đánh giá. |

### 2.3. Quy tắc UX chung

- Nút chính của mỗi màn hình chỉ có một hành động ưu tiên, ví dụ “Đặt hàng”, “Lưu thay đổi”, “Thêm sản phẩm”.
- Các thao tác phá vỡ hoặc khó hoàn tác phải có xác nhận rõ ràng.
- Trạng thái đơn hàng luôn hiển thị bằng nhãn văn bản: Chờ xác nhận, Đã xác nhận, Đã hoàn thành hoặc Đã hủy.
- Form hiển thị validation ngay dưới trường lỗi; không chỉ thông báo lỗi tổng quát.
- Bảng dữ liệu trên mobile chuyển thành danh sách thẻ có nhãn trường thay vì ép cuộn ngang, ngoại trừ bảng chi tiết đơn hàng có thể cuộn ngang khi cần.

## 3. Guest

### 3.1. Home

**Mục đích màn hình:** Giúp Guest nhận biết EcoMart, tìm kiếm nhanh và đi đến danh mục hoặc sản phẩm phù hợp.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Header | Điều hướng, tìm kiếm, truy cập giỏ hàng/đăng nhập. | Không cần API riêng; tìm kiếm điều hướng đến `/products?keyword=`. |
| Khu vực giới thiệu ngắn | Nêu giá trị chính của cửa hàng và nút “Xem sản phẩm”. | Nội dung tĩnh. |
| Danh mục nổi bật | Hiển thị danh mục đang hoạt động; mỗi mục dẫn đến product listing đã lọc. | `GET /categories` |
| Danh sách sản phẩm | Hiển thị một số sản phẩm đang hiển thị: ảnh chính, tên, giá, tồn kho ngắn gọn, nút xem chi tiết. | `GET /products?page=1&pageSize=...` |
| Footer | Thông tin và liên kết cơ bản. | Nội dung tĩnh. |

**Luồng thao tác:** Guest vào trang chủ → tìm kiếm hoặc chọn danh mục/sản phẩm → chuyển đến Search Result, Product Listing hoặc Product Detail.

**Validation:** Từ khóa tìm kiếm được cắt khoảng trắng đầu/cuối; không gửi truy vấn trống.

**Responsive:** Desktop dùng lưới danh mục và lưới sản phẩm nhiều cột. Tablet giảm số cột. Mobile xếp danh mục/sản phẩm thành một hoặc hai cột, thanh điều hướng thu vào menu.

### 3.2. Product Listing

**Mục đích màn hình:** Cho phép Guest duyệt toàn bộ sản phẩm theo danh mục, thương hiệu và khoảng giá.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Breadcrumb và tiêu đề | Cho biết danh mục/trang đang xem. | Query trên URL. |
| Sidebar filter | Lọc theo danh mục, thương hiệu, khoảng giá, chứng nhận/nhãn xanh, điểm thân thiện môi trường tối thiểu. | `GET /categories`, `GET /brands`, `GET /certifications` |
| Thanh sắp xếp | Chọn giá tăng, giá giảm hoặc mới nhất. | Query `sort`. |
| Product grid | Card tối giản: ảnh, tên, giá (kèm giá cũ gạch ngang nếu đang khuyến mại), badge chứng nhận/eco score, trạng thái hết hàng, liên kết chi tiết. | `GET /products` |
| Pagination | Đổi trang và giữ lại bộ lọc hiện tại. | Query `page`, `pageSize`. |

**Luồng thao tác:** Chọn/xóa filter hoặc sort → cập nhật query URL → gọi lại danh sách → mở Product Detail khi chọn sản phẩm.

**Validation:** `minPrice` và `maxPrice` là số không âm; `minPrice` không lớn hơn `maxPrice`; ID danh mục/thương hiệu/chứng nhận phải hợp lệ; `minEcoScore` từ 1 đến 5.

**Responsive:** Desktop hiển thị sidebar bên trái và grid bên phải. Tablet dùng filter dạng drawer. Mobile chỉ hiện nút “Bộ lọc”, drawer toàn chiều rộng; sort nằm cùng hàng tiêu đề; grid 1–2 cột.

### 3.3. Product Detail

**Mục đích màn hình:** Cung cấp đủ thông tin để Guest/Customer quyết định mua sản phẩm.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Breadcrumb | Quay lại danh mục hoặc listing. | Thông tin Product. |
| Gallery ảnh | Ảnh chính lớn, thumbnail chọn ảnh. | `GET /products/{productId}` |
| Thông tin sản phẩm | Tên, thương hiệu, danh mục, giá (kèm giá cũ gạch ngang và % giảm nếu đang khuyến mại), mô tả, tồn kho/trạng thái hết hàng. | `GET /products/{productId}` |
| Khu vực eco | Điểm thân thiện môi trường (dạng sao/lá 1-5), danh sách badge chứng nhận kèm icon, mô tả vật liệu/khả năng tái chế. | `GET /products/{productId}` |
| Quantity stepper | Customer chọn số lượng trước khi thêm giỏ. | Tồn kho hiện tại. |
| Nút thêm giỏ hàng | Thêm sản phẩm; Guest được điều hướng Login trước. | Customer: `POST /cart/items` |
| Khu vực đánh giá | Điểm trung bình, số lượng review, danh sách review phân trang. | `GET /products/{productId}/reviews` |

**Luồng thao tác:** Xem ảnh/thông tin/eco → chọn số lượng → Customer thêm giỏ hàng; Guest chọn thêm giỏ hàng → Login → quay lại trang sản phẩm. Guest/Customer có thể đọc review và quay về listing.

**Validation:** Không cho tăng quantity vượt tồn kho; sản phẩm hết hàng vô hiệu hóa stepper và nút thêm giỏ; số lượng tối thiểu là 1; ẩn khu vực eco nếu sản phẩm không có `ecoScore`/`materialInfo`/chứng nhận nào.

**Responsive:** Desktop dùng hai cột gallery/thông tin. Tablet giữ hai cột hẹp hơn. Mobile xếp gallery trước, thông tin sau, khu vực eco ngay dưới giá; nút thêm giỏ hàng đặt toàn chiều rộng và dễ chạm.

### 3.4. Search Result

**Mục đích màn hình:** Hiển thị kết quả theo từ khóa đã tìm và cho phép tiếp tục lọc.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Search box | Hiển thị lại từ khóa, cho phép tìm kiếm mới. | `GET /products?keyword=` |
| Tiêu đề kết quả | Hiển thị “Kết quả cho …” và tổng số bản ghi. | `GET /products` |
| Filter/sort | Tương tự Product Listing, giữ keyword. | `GET /categories`, `GET /brands`, `GET /products` |
| Product grid/Pagination | Hiển thị kết quả hoặc empty state. | `GET /products` |

**Luồng thao tác:** Nhập từ khóa → gửi tìm kiếm → cập nhật URL → hiển thị kết quả; nếu không có kết quả, Guest có thể xóa từ khóa hoặc chuyển đến Product Listing.

**Validation:** Không tìm kiếm chuỗi chỉ có khoảng trắng; keyword có độ dài hợp lý theo quy ước Frontend.

**Responsive:** Cùng quy tắc Product Listing; search box luôn dễ truy cập ở đầu khu vực nội dung trên mobile.

### 3.5. Login

**Mục đích màn hình:** Xác thực Customer hoặc Admin và đưa người dùng về đúng khu vực.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Form đăng nhập | Nhập email, mật khẩu; gửi đăng nhập. | `POST /auth/login` |
| Nút hiển thị/ẩn mật khẩu | Hỗ trợ kiểm tra mật khẩu đã nhập. | Cục bộ. |
| Liên kết Quên mật khẩu | Chuyển đến Forgot Password. | Không gọi API. |
| Liên kết Đăng ký | Chuyển đến Register. | Không gọi API. |
| Thông báo lỗi | Hiển thị lỗi xác thực hoặc tài khoản không hoạt động. | Phản hồi API. |

**Luồng thao tác:** Nhập thông tin → đăng nhập → nếu role Customer chuyển về URL trước đó/trang chủ; nếu role Admin chuyển Dashboard.

**Validation:** Email đúng định dạng, bắt buộc; mật khẩu bắt buộc; vô hiệu hóa nút gửi khi request đang xử lý.

**Responsive:** Form có chiều rộng đọc tốt trên desktop; trên tablet/mobile chiếm gần toàn chiều rộng với padding an toàn, không cần sidebar.

### 3.6. Register & Email OTP Verification

**Mục đích màn hình:** Tạo tài khoản Customer mới và kích hoạt qua mã OTP 6 chữ số gửi đến email.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Form đăng ký (Bước 1) | Họ tên, email, số điện thoại, mật khẩu, xác nhận mật khẩu. | `POST /api/v1/auth/register` |
| Form nhập OTP (Bước 2) | Mã 6 chữ số, đếm ngược cooldown 60s, nút "Gửi lại mã OTP". | `POST /api/v1/auth/verify-email`, `POST /api/v1/auth/resend-verification` |
| Nút hiển thị/ẩn mật khẩu | Hỗ trợ nhập chính xác. | Cục bộ. |
| Liên kết Login | Chuyển sang Login. | Không gọi API. |

**Luồng thao tác:** Nhập thông tin → gửi đăng ký (`201`) → màn hình chuyển sang nhập OTP 6 chữ số → nhập OTP → xác thực thành công → nhận JWT token → tự động đăng nhập & chuyển về Trang chủ / Checkout.

**Validation:** Họ tên/email/mật khẩu bắt buộc; email hợp lệ; email trùng trả `409`; xác nhận mật khẩu phải khớp; mã OTP là 6 chữ số; quá 5 lần sai vô hiệu hóa token; cooldown 60s trước khi được ấn gửi lại.

**Responsive:** Tương tự Login; form OTP hiển thị 6 ô nhập chữ số riêng biệt trên cả desktop và mobile.

### 3.7. Forgot Password & Reset Password OTP

**Mục đích màn hình:** Cho phép Guest/Customer đặt lại mật khẩu bằng mã OTP 6 chữ số gửi qua email.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Form email (Bước 1) | Nhập email nhận mã OTP khôi phục. | `POST /api/v1/auth/forgot-password` |
| Form OTP & Mật khẩu mới (Bước 2) | Nhập OTP 6 chữ số + mật khẩu mới + xác nhận mật khẩu. | `POST /api/v1/auth/reset-password-otp` |
| Liên kết quay lại Login | Quay lại trang đăng nhập. | Không gọi API. |

**Luồng thao tác:** Nhập email → gửi OTP → chuyển form nhập OTP và mật khẩu mới → gửi → thành công chuyển về Login.

**Validation:** Email bắt buộc; OTP 6 chữ số; mật khẩu mới khớp; hiệu lực OTP 15 phút, quá 5 lần sai bị khóa token.

### 3.8. Policy Page

**Mục đích màn hình:** Hiển thị nội dung 1 trong 3 trang chính sách (đổi trả, bảo hành, vận chuyển) dùng chung 1 layout theo `slug`.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Breadcrumb/tiêu đề | Hiển thị tiêu đề trang theo `slug` hiện tại. | `GET /api/v1/pages/{slug}` |
| Nội dung | Render nội dung do Admin soạn (rich text/markdown). | `GET /api/v1/pages/{slug}` |
| Liên kết sang 2 trang chính sách còn lại | Điều hướng nhanh giữa đổi trả/bảo hành/vận chuyển. | Điều hướng cục bộ. |

**Luồng thao tác:** Vào trang từ Footer hoặc liên kết trong Checkout → tải nội dung theo `slug` → hiển thị.

**Validation:** Nếu `slug` không tồn tại, hiển thị trang 404 thân thiện thay vì lỗi trắng.

**Responsive:** Một cột nội dung, chiều rộng đọc tốt trên desktop; full width có padding trên mobile.


### 3.10. Contact

**Mục đích màn hình:** Cho phép Guest/Customer gửi liên hệ/feedback và xem thông tin/bản đồ cửa hàng.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Thông tin liên hệ | SĐT, email, địa chỉ cửa hàng. | `GET /settings/public` |
| Google Maps embed | Nhúng iframe bản đồ vị trí cửa hàng từ `mapEmbedUrl`. | `GET /settings/public` |
| Form liên hệ | Họ tên, email, số điện thoại (tùy chọn), tiêu đề (tùy chọn), nội dung. Tự điền họ tên/email nếu Customer đã đăng nhập. | `POST /contact` |
| Nút gửi | Gửi form, hiển thị trạng thái đã gửi. | `POST /contact` |

**Luồng thao tác:** Xem thông tin/bản đồ → điền form → gửi → hiển thị thông báo đã gửi thành công, xóa form.

**Validation:** Họ tên, email, nội dung bắt buộc; email đúng định dạng; chống gửi trùng bằng khóa nút trong lúc request.

**Responsive:** Desktop hai cột: thông tin/bản đồ bên trái, form bên phải. Mobile xếp dọc: thông tin → bản đồ → form.

### 4.1. Profile

**Mục đích màn hình:** Customer xem và cập nhật thông tin cá nhân, đổi mật khẩu.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Account navigation | Liên kết Profile, Addresses, Orders. | Cục bộ. |
| Form hồ sơ | Hiển thị email chỉ đọc; cập nhật họ tên, số điện thoại. | `GET /me`, `PATCH /me` |
| Form đổi mật khẩu | Mật khẩu hiện tại, mật khẩu mới, xác nhận mật khẩu mới. | `PATCH /me/password` |
| Nút lưu | Lưu từng form độc lập để lỗi không ảnh hưởng phần còn lại. | API tương ứng. |

**Luồng thao tác:** Tải hồ sơ → sửa thông tin → lưu → nhận thông báo; hoặc đổi mật khẩu → xác thực mật khẩu cũ → thành công.

**Validation:** Họ tên bắt buộc; số điện thoại hợp lệ nếu có; mật khẩu hiện tại bắt buộc; xác nhận mật khẩu mới khớp.

**Responsive:** Desktop dùng account navigation trái/nội dung phải. Tablet/mobile chuyển navigation thành hàng tab hoặc menu chọn; form một cột.

### 4.2. Address Management

**Mục đích màn hình:** Customer quản lý địa chỉ giao hàng của riêng mình.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Danh sách địa chỉ | Mỗi item hiển thị người nhận, điện thoại, địa chỉ, nhãn mặc định, nút sửa/xóa/chọn mặc định. | `GET /me/addresses` |
| Nút thêm địa chỉ | Mở form tạo địa chỉ. | `POST /me/addresses` |
| Form/Modal địa chỉ | Nhập thông tin người nhận và địa chỉ. | `POST` hoặc `PATCH /me/addresses/{addressId}` |
| Modal xóa | Xác nhận trước khi xóa. | `DELETE /me/addresses/{addressId}` |

**Luồng thao tác:** Xem danh sách → thêm/sửa → lưu và tải lại danh sách; chọn mặc định bằng thao tác sửa `isDefault`; xóa sau xác nhận.

**Validation:** Người nhận, số điện thoại, địa chỉ chi tiết, quận/huyện, tỉnh/thành bắt buộc; không cho xóa địa chỉ đang được form Checkout chọn nếu có thao tác chưa lưu.

**Responsive:** Desktop dùng danh sách rộng với thao tác cuối dòng. Mobile dùng từng thẻ địa chỉ, nút thao tác đặt dưới nội dung, form mở dạng full-screen drawer/modal.

### 4.3. Shopping Cart

**Mục đích màn hình:** Customer xem, điều chỉnh giỏ hàng và chuyển sang Checkout.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Cart item list | Ảnh, tên, giá, quantity stepper, thành tiền, nút xóa. | `GET /cart`, `PATCH /cart/items/{id}`, `DELETE /cart/items/{id}` |
| Order summary | Tạm tính, tổng tiền, số sản phẩm; không hiển thị phí/voucher ngoài phạm vi. | `GET /cart` |
| Nút Checkout | Chỉ khả dụng khi giỏ có sản phẩm hợp lệ. | Điều hướng `/checkout`. |
| Empty state | Thông báo giỏ trống và nút xem sản phẩm. | `GET /cart` |

**Luồng thao tác:** Mở giỏ → thay đổi quantity/xóa item → tổng tiền cập nhật → Checkout. Khi API trả không đủ tồn kho, hiển thị lỗi ngay item bị ảnh hưởng và tải lại giỏ.

**Validation:** Quantity tối thiểu 1, không vượt tồn kho; item sản phẩm không còn hiển thị/hết hàng được thông báo để Customer xóa hoặc cập nhật.

**Responsive:** Desktop chia danh sách và summary hai cột; summary có thể bám theo vùng nhìn. Mobile xếp summary dưới danh sách, nút Checkout toàn chiều rộng.

### 4.4. Checkout

**Mục đích màn hình:** Customer xác nhận địa chỉ, chọn phương thức thanh toán và tạo đơn hàng.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Address selector | Chọn một địa chỉ, hiển thị mặc định trước; liên kết thêm địa chỉ. | `GET /me/addresses` |
| Order items summary | Chỉ đọc: sản phẩm, số lượng, giá tại thời điểm xem. | `GET /cart` |
| Payment method selector | Chọn 1 trong 3: COD, VNPay, SePay (radio/card chọn). | Gửi kèm `POST /orders`. |
| Total summary | Tổng tiền từ giỏ hàng. | `GET /cart` |
| Nút Đặt hàng | Tạo đơn sau khi Customer xác nhận. | `POST /orders` |

**Luồng thao tác:** Mở Checkout → tải giỏ/địa chỉ → chọn địa chỉ → chọn phương thức thanh toán → nhấn Đặt hàng.
- Nếu chọn COD: tạo đơn thành công → chuyển thẳng tới Order Detail của đơn vừa tạo.
- Nếu chọn VNPay/SePay: tạo đơn thành công, API trả về `paymentUrl` → Frontend chuyển hướng (redirect) toàn trang sang `paymentUrl` → Customer thanh toán trên trang cổng → cổng chuyển hướng về Payment Result (mục 4.7).

**Validation:** Phải chọn địa chỉ và phương thức thanh toán; giỏ không rỗng; chống gửi trùng bằng cách khóa nút trong lúc request. Nếu checkout trả lỗi tồn kho, quay lại giỏ với thông báo item lỗi. Nếu khởi tạo thanh toán online thất bại (lỗi gọi cổng), hiển thị lỗi và cho phép thử lại mà không tạo đơn trùng.

**Responsive:** Desktop dùng hai cột thông tin giao hàng/danh sách và tổng đơn. Mobile theo thứ tự: địa chỉ → sản phẩm → phương thức thanh toán → tổng tiền → nút đặt hàng cố định ở cuối vùng nhìn nếu không che nội dung.

### 4.5. Payment Result

**Mục đích màn hình:** Hiển thị kết quả sau khi Customer quay lại từ cổng thanh toán online, hoặc sau khi đặt hàng COD thành công.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Trạng thái kết quả | Icon + thông báo theo `paymentStatus` của đơn (Đã thanh toán/Chưa thanh toán/Thất bại) hoặc theo đơn COD thành công. | `GET /orders/{orderId}` |
| Thông tin đơn tóm tắt | Mã đơn, tổng tiền, phương thức thanh toán. | `GET /orders/{orderId}` |
| Nút xem chi tiết đơn | Chuyển đến Order Detail. | Điều hướng. |
| Nút thử lại thanh toán | Chỉ hiện khi thanh toán thất bại/chưa hoàn tất; tạo lại giao dịch thanh toán. | `POST /orders/{orderId}/retry-payment` |

**Luồng thao tác:** Cổng thanh toán redirect Customer về màn hình này kèm mã đơn → Frontend gọi `GET /orders/{orderId}` để lấy `paymentStatus` mới nhất (không tin tham số trên URL redirect) → hiển thị đúng trạng thái. Nếu `paymentStatus` vẫn `UNPAID` do webhook chưa kịp xử lý, hiển thị trạng thái "Đang xác nhận thanh toán" và tự động tải lại sau vài giây.

**Validation:** Không hiển thị "Đã thanh toán" chỉ dựa vào query string redirect; luôn xác nhận lại qua API.

**Responsive:** Một cột, căn giữa nội dung trạng thái; nút hành động toàn chiều rộng trên mobile.

### 4.6. Order History

**Mục đích màn hình:** Customer theo dõi và tra cứu mọi đơn hàng của mình.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Status filter | Lọc tất cả/PENDING/CONFIRMED/COMPLETED/CANCELLED. | `GET /orders?status=` |
| Order list | Mã đơn, ngày đặt, tổng tiền, trạng thái, số sản phẩm, nút xem chi tiết. | `GET /orders` |
| Pagination | Chuyển trang đơn hàng. | `GET /orders?page=` |
| Empty state | Thông báo chưa có đơn, liên kết xem sản phẩm. | `GET /orders` |

**Luồng thao tác:** Chọn trạng thái → tải danh sách → chọn đơn → Order Detail.

**Validation:** Query `status` chỉ dùng bốn giá trị hợp lệ; mọi dữ liệu hiển thị chỉ thuộc Customer đang đăng nhập.

**Responsive:** Desktop có bảng/list rộng. Mobile dùng thẻ đơn hàng với mã đơn và trạng thái nổi bật ở đầu; thông tin phụ xếp dọc.

### 4.7. Order Detail

**Mục đích màn hình:** Hiển thị đầy đủ thông tin của một đơn và các thao tác Customer được phép thực hiện.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Header đơn hàng | Mã đơn, trạng thái, ngày đặt. | `GET /orders/{orderId}` |
| Timeline/trạng thái văn bản | Thể hiện trạng thái hiện tại; không suy diễn trạng thái giao vận ngoài phạm vi. | `GET /orders/{orderId}` |
| Trạng thái thanh toán | Phương thức thanh toán và trạng thái (Chưa thanh toán/Đã thanh toán/Thất bại/Đã hoàn tiền). | `GET /orders/{orderId}` |
| Nút thanh toán lại | Chỉ hiện khi phương thức online và trạng thái thanh toán Chưa thanh toán/Thất bại, đơn còn PENDING. | `POST /orders/{orderId}/retry-payment` |
| Shipping address | Hiển thị bản chụp người nhận, điện thoại, địa chỉ. | `GET /orders/{orderId}` |
| Danh sách sản phẩm | Sản phẩm, giá đã chốt, số lượng, thành tiền; nút đánh giá nếu `canReview`. | `GET /orders/{orderId}` |
| Tổng đơn | Phương thức thanh toán và tổng tiền. | `GET /orders/{orderId}` |
| Hủy đơn | Chỉ hiện khi trạng thái PENDING; mở modal xác nhận. | `POST /orders/{orderId}/cancel` |
| Review form/modal | Tạo review cho order item đủ điều kiện. | `POST /reviews` |

**Luồng thao tác:** Mở đơn → xem chi tiết → nếu PENDING và online chưa thanh toán, có thể thanh toán lại (chuyển hướng sang cổng như ở Checkout); nếu PENDING, chọn hủy và xác nhận; nếu COMPLETED, chọn đánh giá một sản phẩm → gửi review → cập nhật nút/trạng thái review.

**Validation:** Không hiển thị hủy với trạng thái khác PENDING; không hiển thị thanh toán lại với đơn COD hoặc đã thanh toán; điểm review bắt buộc từ 1–5; nếu API báo trạng thái vừa thay đổi, tải lại chi tiết đơn.

**Responsive:** Desktop có hai cột thông tin đơn/tổng đơn. Mobile xếp tuần tự; bảng item chuyển thẻ hoặc cuộn ngang tối thiểu để bảo toàn giá/số lượng/thành tiền.

## 5. Admin

### 5.1. Dashboard

**Mục đích màn hình:** Giúp Admin nắm tình hình vận hành cơ bản ngay sau đăng nhập.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Sidebar/Top bar | Điều hướng và thao tác tài khoản Admin. | Cục bộ. |
| Summary metrics | Số đơn hàng, doanh thu từ đơn hoàn thành, số sản phẩm, số Customer. | `GET /admin/dashboard` |
| Khu vực trạng thái đơn | Hiển thị số lượng theo trạng thái để dẫn sang Order Management với filter tương ứng. | `GET /admin/dashboard` |
| Liên kết thao tác nhanh | Đi đến tạo sản phẩm, quản lý đơn hoặc tồn kho. | Điều hướng. |

**Luồng thao tác:** Admin đăng nhập → Dashboard tải số liệu → chọn trạng thái hoặc thao tác nhanh → chuyển màn hình quản trị tương ứng.

**Validation:** Nếu tải lỗi, hiển thị lỗi theo từng khu vực số liệu và nút thử lại; không hiển thị số liệu cũ như dữ liệu mới.

**Responsive:** Desktop sidebar cố định và metrics xếp hàng. Tablet sidebar thu gọn. Mobile sidebar là drawer, metrics xếp một cột hoặc hai cột tùy không gian.

### 5.2. User Management

**Mục đích màn hình:** Cho phép Admin tra cứu Customer và cập nhật trạng thái hoạt động.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Search/filter bar | Tìm theo tên/email, lọc hoạt động/không hoạt động. | `GET /admin/users` |
| User table | Họ tên, email, điện thoại, trạng thái, ngày tạo, thao tác. | `GET /admin/users` |
| Status action | Khóa/mở hoạt động Customer sau modal xác nhận. | `PATCH /admin/users/{userId}/status` |
| Pagination | Di chuyển giữa các trang. | `GET /admin/users?page=` |

**Luồng thao tác:** Tìm/lọc → chọn Customer → nhấn đổi trạng thái → xác nhận → cập nhật hàng dữ liệu hoặc tải lại.

**Validation:** Không hiển thị thao tác role; API lỗi quyền hoặc user không tồn tại hiển thị thông báo; không gửi request lặp khi đang xử lý.

**Responsive:** Desktop table. Tablet có thể ẩn cột ngày tạo. Mobile dùng thẻ Customer, hành động khóa/mở là nút rõ ràng trong mỗi thẻ.

### 5.3. Product Management

**Mục đích màn hình:** Admin tạo, tra cứu và cập nhật sản phẩm; ngừng hiển thị thay vì xóa cứng.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Search/filter bar | Tìm tên, lọc danh mục, thương hiệu, trạng thái hiển thị. | `GET /admin/products`, `GET /admin/categories`, `GET /admin/brands` |
| Product table | Ảnh chính, tên, danh mục, thương hiệu, giá (kèm giá cũ nếu có), tồn kho, điểm eco, hiển thị, thao tác. | `GET /admin/products` |
| Nút thêm sản phẩm | Mở trang/form tạo sản phẩm. | `POST /admin/products` |
| Product form | Nhập tên, danh mục, thương hiệu, giá bán, giá cũ (tùy chọn), điểm thân thiện môi trường (tùy chọn), thông tin vật liệu, chọn chứng nhận (multi-select), mô tả, tồn kho, hiển thị, danh sách ảnh. | `POST`/`PATCH /admin/products/{productId}` |
| Certification multi-select | Chọn một hoặc nhiều chứng nhận đang hoạt động để gắn cho sản phẩm. | `GET /admin/certifications` |
| Image manager | Thêm, sắp xếp, chọn một ảnh chính; lưu toàn bộ danh sách ảnh. | `PUT /admin/products/{productId}/images` |

**Luồng thao tác:** Mở danh sách → tìm/lọc hoặc thêm/sửa → validation → lưu → quay về danh sách/ở lại form với thông báo thành công. Khi ngừng bán, đổi `isVisible` thành false.

**Validation:** Tên, danh mục, thương hiệu, giá, tồn kho bắt buộc khi tạo; giá > 0; giá cũ (nếu nhập) phải lớn hơn giá bán; điểm eco (nếu nhập) là số nguyên 1-5; tồn kho là số nguyên ≥ 0; danh mục/thương hiệu/chứng nhận phải hoạt động; chỉ có tối đa một ảnh chính; URL ảnh không rỗng.

**Responsive:** Desktop table và form hai cột có nhóm hợp lý. Mobile list thẻ; form một cột; image manager hiển thị danh sách dọc dễ sắp xếp.

### 5.4. Category Management

**Mục đích màn hình:** Admin quản lý nhóm phân loại sản phẩm.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Danh sách/bảng danh mục | Tên, mô tả ngắn, trạng thái, ngày cập nhật, thao tác sửa. | `GET /admin/categories` |
| Nút thêm danh mục | Mở form tạo mới. | `POST /admin/categories` |
| Form danh mục | Tên, mô tả, trạng thái hoạt động. | `POST`/`PATCH /admin/categories/{categoryId}` |

**Luồng thao tác:** Thêm hoặc chọn sửa → nhập → lưu → cập nhật danh sách. Admin chuyển `isActive` thành false nếu không muốn dùng danh mục mới.

**Validation:** Tên bắt buộc, không trùng; mô tả có giới hạn độ dài; không có thao tác xóa cứng.

**Responsive:** Desktop dùng table/form modal hoặc panel bên. Mobile dùng danh sách thẻ và form full-screen modal.

### 5.5. Brand Management

**Mục đích màn hình:** Admin quản lý thương hiệu sản phẩm.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Danh sách/bảng thương hiệu | Tên, mô tả, trạng thái, thao tác sửa. | `GET /admin/brands` |
| Nút thêm thương hiệu | Mở form tạo. | `POST /admin/brands` |
| Form thương hiệu | Tên, mô tả, trạng thái hoạt động. | `POST`/`PATCH /admin/brands/{brandId}` |

**Luồng thao tác:** Tương tự Category Management: tạo/sửa → validation → lưu → cập nhật danh sách.

**Validation:** Tên bắt buộc, không trùng; không xóa cứng thương hiệu đã được gán cho sản phẩm.

**Responsive:** Áp dụng cùng bố cục Category Management.

### 5.6. Inventory Management

**Mục đích màn hình:** Admin theo dõi và cập nhật tồn kho từng sản phẩm.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Search/filter bar | Tìm tên, tùy chọn chỉ hiển thị sắp hết hàng. | `GET /admin/inventory` |
| Inventory table | Ảnh, tên sản phẩm, tồn kho hiện tại, thời điểm cập nhật, nút điều chỉnh. | `GET /admin/inventory` |
| Edit inventory modal | Nhập số lượng tồn kho mới và xác nhận. | `PATCH /admin/inventory/{productId}` |
| Pagination | Chuyển trang. | `GET /admin/inventory?page=` |

**Luồng thao tác:** Tìm sản phẩm → nhấn điều chỉnh → nhập số lượng mới → xác nhận → cập nhật dòng dữ liệu.

**Validation:** Số lượng bắt buộc, là số nguyên ≥ 0; hiển thị tồn kho hiện tại để tránh nhập nhầm; không cho gửi khi có thay đổi đơn hàng dẫn đến API trả xung đột/lỗi.

**Responsive:** Desktop table. Mobile mỗi sản phẩm là thẻ, số lượng hiện tại và nút điều chỉnh dễ nhìn; modal số lượng toàn chiều rộng.

### 5.7. Order Management

**Mục đích màn hình:** Admin tìm kiếm, xem và xử lý vòng đời đơn hàng.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Search/filter bar | Tìm mã đơn, lọc trạng thái đơn, trạng thái thanh toán, phương thức thanh toán, ngày đặt. | `GET /admin/orders` |
| Order table | Mã đơn, Customer, ngày đặt, tổng tiền, phương thức thanh toán, trạng thái thanh toán, trạng thái đơn, thao tác xem. | `GET /admin/orders` |
| Order detail panel/page | Địa chỉ giao, item, tổng tiền, phương thức/trạng thái thanh toán, lịch sử giao dịch thanh toán, lịch sử thời điểm trạng thái, lý do hủy. | `GET /admin/orders/{orderId}` |
| Action buttons | Xác nhận PENDING (chỉ khi đã thanh toán với đơn online); hủy PENDING/CONFIRMED; hoàn thành CONFIRMED. | `POST /confirm`, `/cancel`, `/complete` |
| Cancel modal | Nhập lý do hủy bắt buộc; nếu đơn đã thanh toán online, hiển thị nhắc hoàn tiền thủ công. | `POST /admin/orders/{orderId}/cancel` |
| Đánh dấu đã hoàn tiền | Chỉ hiện khi đơn CANCELLED và từng thanh toán online; cập nhật `paymentStatus = REFUNDED` sau khi Admin đã chuyển khoản tay. | `PATCH /admin/orders/{orderId}/payment-status` |

**Luồng thao tác:** Lọc/tìm → mở chi tiết → UI chỉ hiển thị action hợp lệ theo trạng thái đơn và trạng thái thanh toán → Admin xác nhận/hủy/hoàn thành → modal xác nhận → gọi API → tải lại chi tiết/list.

**Validation:** Lý do hủy bắt buộc; không cho xác nhận đơn online khi `paymentStatus ≠ PAID`; action bị vô hiệu hóa lúc gửi; khi API trả `409`, hiển thị thông báo trạng thái đã đổi và tải lại đơn. Không có nút xóa đơn.

**Responsive:** Desktop table + trang chi tiết. Mobile order list dạng thẻ; chi tiết đơn xếp dọc; action buttons toàn chiều rộng, không dùng menu ẩn cho hành động quan trọng.

### 5.8. Review Management

**Mục đích màn hình:** Admin kiểm duyệt khả năng hiển thị của đánh giá.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Filter bar | Lọc theo sản phẩm, trạng thái hiển thị. | `GET /admin/reviews` |
| Review table/list | Sản phẩm, Customer, điểm, nội dung, ngày tạo, trạng thái hiển thị. | `GET /admin/reviews` |
| Visibility action | Ẩn/hiện review, có modal xác nhận khi ẩn. | `PATCH /admin/reviews/{reviewId}/visibility` |
| Pagination | Chuyển trang đánh giá. | `GET /admin/reviews?page=` |

**Luồng thao tác:** Lọc → đọc review → chọn ẩn/hiện → xác nhận khi ẩn → cập nhật trạng thái.

**Validation:** Không chỉnh sửa nội dung hoặc xóa review trong phạm vi Admin; action gửi `isVisible` là Boolean; nếu review không tồn tại, tải lại danh sách và báo lỗi.

**Responsive:** Desktop table; mobile review card hiển thị sản phẩm, điểm, nội dung, Customer và nút ẩn/hiện ở cuối card.

### 5.9. Revenue Report

**Mục đích màn hình:** Cho phép Admin theo dõi doanh thu cơ bản theo khoảng thời gian từ các đơn đã hoàn thành.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Bộ lọc thời gian | Chọn `fromDate` và `toDate`; mặc định là tháng hiện tại. | `GET /admin/reports/revenue` |
| Tổng doanh thu | Hiển thị tổng doanh thu của đơn `COMPLETED` trong khoảng chọn. | `GET /admin/reports/revenue` |
| Tổng số đơn hoàn thành | Hiển thị số đơn được dùng để tính doanh thu. | `GET /admin/reports/revenue` |
| Bảng/biểu đồ theo ngày | Hiển thị ngày, số đơn hoàn thành và doanh thu để theo dõi xu hướng. | `GET /admin/reports/revenue` |

**Luồng thao tác:** Mở báo cáo → tải khoảng thời gian mặc định → Admin đổi khoảng ngày → validation → tải lại số liệu. Chỉ tổng hợp đơn có trạng thái `COMPLETED` theo `completedAt`.

**Validation:** Hai ngày bắt buộc, đúng định dạng và `fromDate` không được sau `toDate`; khóa nút áp dụng khi đang tải; hiển thị empty state khi không có đơn hoàn thành.

**Responsive:** Desktop hiển thị metric và bảng/biểu đồ. Mobile xếp metric dọc, bảng có thể chuyển thành danh sách theo ngày.

### 5.10. Certification Management

**Mục đích màn hình:** Admin quản lý danh mục chứng nhận/nhãn xanh dùng để gắn cho sản phẩm.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Danh sách/bảng chứng nhận | Tên, mô tả, icon, trạng thái, thao tác sửa. | `GET /admin/certifications` |
| Nút thêm chứng nhận | Mở form tạo mới. | `POST /admin/certifications` |
| Form chứng nhận | Tên, mô tả, URL icon, trạng thái hoạt động. | `POST`/`PATCH /admin/certifications/{certificationId}` |

**Luồng thao tác:** Thêm hoặc chọn sửa → nhập → lưu → cập nhật danh sách. Admin chuyển `isActive` thành false thay vì xóa khi chứng nhận đã gắn sản phẩm.

**Validation:** Tên bắt buộc, không trùng; không có thao tác xóa cứng.

**Responsive:** Desktop dùng table/form modal. Mobile dùng danh sách thẻ và form full-screen modal — cùng bố cục Category Management.

### 5.11. Contact Management

**Mục đích màn hình:** Admin xem và xử lý tin nhắn liên hệ/feedback từ khách hàng.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Search/filter bar | Lọc theo trạng thái NEW/RESOLVED. | `GET /admin/contact-messages` |
| Message table/list | Họ tên, email, tiêu đề, ngày gửi, trạng thái, thao tác xem. | `GET /admin/contact-messages` |
| Message detail | Toàn bộ nội dung tin nhắn, thông tin liên hệ. | `GET /admin/contact-messages/{messageId}` |
| Nút đánh dấu đã xử lý | Chuyển trạng thái sang RESOLVED. | `PATCH /admin/contact-messages/{messageId}/resolve` |

**Luồng thao tác:** Lọc → mở chi tiết → đọc nội dung → đánh dấu đã xử lý (Admin phản hồi qua email/điện thoại ngoài hệ thống).

**Validation:** Không chỉnh sửa nội dung tin nhắn; không thao tác xóa.

**Responsive:** Desktop table + panel chi tiết. Mobile dùng danh sách thẻ, chi tiết mở full-screen.

### 5.12. Content Page Management

**Mục đích màn hình:** Admin chỉnh sửa nội dung 3 trang chính sách.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Danh sách trang | 3 dòng cố định: đổi trả, bảo hành, vận chuyển. | `GET /admin/pages` |
| Editor nội dung | Sửa tiêu đề và nội dung (rich text/markdown) theo `slug`. | `PATCH /admin/pages/{slug}` |
| Xem trước | Xem nội dung sẽ hiển thị cho Guest/Customer trước khi lưu. | Cục bộ. |

**Luồng thao tác:** Chọn trang → sửa nội dung → xem trước → lưu → thông báo thành công.

**Validation:** Tiêu đề và nội dung không được để trống.

**Responsive:** Desktop editor rộng có xem trước cạnh bên. Mobile editor toàn màn hình, xem trước dạng tab riêng.

### 5.13. Store Settings

**Mục đích màn hình:** Admin cập nhật thông tin liên hệ và bản đồ hiển thị ở trang Liên hệ.

**Thành phần giao diện và chức năng:**

| Thành phần | Chức năng | Dữ liệu/API |
|---|---|---|
| Form cấu hình | SĐT, email, địa chỉ, đường dẫn nhúng Google Maps (`mapEmbedUrl`). | `GET /admin/settings`, `PATCH /admin/settings` |
| Xem trước bản đồ | Hiển thị iframe theo `mapEmbedUrl` đã nhập để kiểm tra trước khi lưu. | Cục bộ. |

**Luồng thao tác:** Tải cấu hình hiện tại → chỉnh sửa → xem trước bản đồ → lưu.

**Validation:** Email đúng định dạng nếu nhập; `mapEmbedUrl` phải là URL hợp lệ nếu nhập.

**Responsive:** Một cột form, xem trước bản đồ nằm dưới trên mobile, cạnh bên trên desktop.

## 6. Mapping màn hình – route Frontend

| Nhóm | Màn hình | Route thực tế (`AppRoutes.tsx`) | Component |
|---|---|---|---|
| Guest | Home | `/` | `HomePage.tsx` |
| Guest | Login | `/login` | `LoginPage.tsx` |
| Guest | Register & OTP | `/register` | `RegisterPage.tsx` |
| Guest | Forgot Password | `/forgot-password` | `ForgotPasswordPage.tsx` |
| Guest | Product Listing | `/products` | `ProductListPage.tsx` |
| Guest | Product Detail | `/products/:id` | `ProductDetailPage.tsx` |
| Guest | Shopping Cart | `/cart` | `CartPage.tsx` |
| Guest | Contact | `/contact` | `ContactPage.tsx` |
| Guest | Policy Page | `/pages/:slug` | `ContentPage.tsx` |
| Guest | VNPay Return Page | `/payment/vnpay/return` | `VNPayReturnPage.tsx` |
| Customer | Checkout | `/checkout` | `CheckoutPage.tsx` |
| Customer | Order History | `/orders` | `OrderHistoryPage.tsx` |
| Customer | Order Detail | `/orders/:id` | `OrderDetailPage.tsx` |
| Customer | Profile & Addresses | `/profile` | `ProfilePage.tsx` |
| Admin | Dashboard | `/admin` | `AdminDashboardPage.tsx` |
| Admin | Category Management | `/admin/categories` | `AdminCategoryPage.tsx` |
| Admin | Brand Management | `/admin/brands` | `AdminBrandPage.tsx` |
| Admin | Product Management | `/admin/products` | `AdminProductPage.tsx` |
| Admin | Inventory Management | `/admin/inventory` | `AdminInventoryPage.tsx` |
| Admin | Certification Management | `/admin/certifications` | `AdminCertificationPage.tsx` |
| Admin | Order Management | `/admin/orders` | `AdminOrderPage.tsx` |
| Admin | Order Detail | `/admin/orders/:id` | `AdminOrderDetailPage.tsx` |
| Admin | Review Management | `/admin/reviews` | `AdminReviewPage.tsx` |
| Admin | User Management | `/admin/users` | `AdminUserPage.tsx` |
| Admin | Content Page Management | `/admin/content` | `AdminContentPage.tsx` |
| Admin | Store Settings | `/admin/settings` | `AdminSettingsPage.tsx` |


## 7. Kiểm tra UX trước khi Frontend triển khai

1. Mọi màn hình có loading, empty và error state tương ứng.
2. Guest không được thấy thao tác Customer khi chưa đăng nhập; Customer không truy cập được route `/admin/*`.
3. Điều hướng sau Login quay về trang trước đó nếu phù hợp.
4. Filter, sort và pagination được phản ánh trong URL để có thể chia sẻ/quay lại bằng trình duyệt.
5. Các action trạng thái đơn luôn được kiểm soát đồng thời ở UI và phản hồi API; UI không tự giả định thành công.
6. Form Checkout, form Product và modal hủy đơn phải chống gửi trùng.
7. Màn hình mobile không che nội dung hoặc nút chính bằng header/footer cố định.
8. Nhãn, trạng thái, tên trường và thông báo lỗi dùng thuật ngữ thống nhất với tài liệu BA.
9. Trạng thái thanh toán luôn được xác nhận lại qua API sau khi redirect từ cổng thanh toán, không tin trực tiếp query string trên URL trả về.
