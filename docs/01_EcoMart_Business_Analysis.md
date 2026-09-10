# Tài liệu Business Analysis – EcoMart

## 1. Giới thiệu dự án

### 1.1. Giới thiệu

EcoMart là website thương mại điện tử B2C quy mô đồ án sinh viên năm 3, chuyên bán sản phẩm tiêu dùng thân thiện với môi trường. Website giúp khách hàng tìm, so sánh thông tin cơ bản và mua các sản phẩm như bình nước tái sử dụng, túi vải, ống hút, đồ dùng gia đình thân thiện môi trường, sản phẩm từ tre/gỗ/vật liệu tái chế và sản phẩm chăm sóc cá nhân xanh.

Website hướng đến mô hình mua sắm trực tuyến: khách hàng tìm kiếm sản phẩm, xem thông tin chi tiết (gồm chứng nhận eco, điểm thân thiện môi trường, vật liệu), thêm sản phẩm vào giỏ hàng, đặt hàng với phương thức thanh toán COD hoặc thanh toán online (VNPay, SePay) và theo dõi trạng thái đơn hàng. Quản trị viên quản lý dữ liệu sản phẩm, chứng nhận, tồn kho, đơn hàng, thanh toán, người dùng, đánh giá, liên hệ khách hàng, nội dung trang chính sách và doanh thu.

### 1.2. Mục tiêu

- Xây dựng kênh bán hàng trực tuyến cho các sản phẩm thân thiện với môi trường.
- Giúp khách hàng dễ dàng tìm kiếm, so sánh thông tin cơ bản (gồm mức độ thân thiện môi trường) và mua sản phẩm.
- Hỗ trợ quản trị viên quản lý danh mục, thương hiệu, chứng nhận, sản phẩm, tồn kho, đơn hàng và thanh toán tập trung.
- Cung cấp dữ liệu doanh thu cơ bản phục vụ việc theo dõi hoạt động bán hàng.
- Làm cơ sở phân tích cho các bước thiết kế Use Case, ERD, cơ sở dữ liệu, UI/UX, Backend và Frontend.

### 1.3. Phạm vi hệ thống

| Nhóm người dùng | Phạm vi chức năng |
|---|---|
| Guest | Xem trang chủ, danh mục, chi tiết sản phẩm; tìm kiếm và lọc sản phẩm (gồm lọc theo chứng nhận eco, điểm thân thiện môi trường); đăng ký, đăng nhập, quên mật khẩu; xem trang chính sách; gửi liên hệ/feedback. |
| Customer | Quản lý hồ sơ, mật khẩu, địa chỉ giao hàng, giỏ hàng; đặt hàng và thanh toán COD hoặc online (VNPay/SePay); theo dõi, hủy đơn khi chưa xác nhận; xem lịch sử mua hàng; đánh giá sản phẩm đã mua; gửi liên hệ/feedback. |
| Admin | Đăng nhập quản trị; xem dashboard; quản lý người dùng, danh mục, thương hiệu, chứng nhận, sản phẩm, tồn kho, đơn hàng, thanh toán, đánh giá, liên hệ khách hàng, nội dung trang chính sách, cấu hình cửa hàng; xem báo cáo doanh thu. |

### 1.4. Ngoài phạm vi

- Chatbot, AI hoặc gợi ý sản phẩm bằng AI.
- Chương trình thành viên, tích điểm, loyalty, mã giảm giá/voucher có điều kiện áp dụng phức tạp (khuyến mại trong phạm vi này chỉ là hiển thị giá cũ/giá mới trên sản phẩm, không phải hệ thống mã giảm giá).
- CRM, ERP hoặc nghiệp vụ vận hành doanh nghiệp nâng cao.
- Mô hình microservice.
- Đa nhà bán hàng hoặc mô hình marketplace.
- Đa kho, đa chi nhánh — chỉ một địa chỉ cửa hàng duy nhất (phục vụ hiển thị Google Maps).
- Tích hợp cổng thanh toán ngoài VNPay và SePay; tự động hoàn tiền qua API cổng thanh toán (hoàn tiền xử lý thủ công ngoài hệ thống).

### 1.5. Đối tượng sử dụng

| Đối tượng | Nhu cầu chính |
|---|---|
| Khách vãng lai (Guest) | Tham khảo sản phẩm, tìm kiếm sản phẩm phù hợp và tạo tài khoản. |
| Khách hàng (Customer) | Mua sản phẩm, quản lý thông tin nhận hàng, theo dõi đơn và đánh giá sản phẩm. |
| Quản trị viên (Admin) | Cần công cụ quản lý dữ liệu sản phẩm, tồn kho, người dùng, đơn hàng và đánh giá. |

### 1.6. Stakeholder

| Stakeholder | Vai trò/Mối quan tâm |
|---|---|
| Chủ cửa hàng/đơn vị sở hữu EcoMart | Mong muốn có kênh bán hàng trực tuyến, quản lý hàng hóa và theo dõi doanh thu. |
| Khách hàng | Mong muốn tìm đúng sản phẩm, đặt hàng thuận tiện và biết trạng thái đơn hàng. |
| Quản trị viên | Cần công cụ quản lý dữ liệu sản phẩm, tồn kho, người dùng, đơn hàng và đánh giá. |
| Nhóm thực hiện đồ án | Cần tài liệu nghiệp vụ thống nhất để thiết kế và phát triển hệ thống. |
| Giảng viên/Hội đồng đánh giá | Đánh giá tính hợp lý, đầy đủ và nhất quán của phân tích nghiệp vụ. |

### 1.7. Giả định

- EcoMart chỉ bán hàng trong một thị trường nội địa; tiền tệ hiển thị là Việt Nam đồng.
- Mỗi tài khoản khách hàng sử dụng một email duy nhất.
- Hệ thống hỗ trợ 2 nhóm phương thức thanh toán: thanh toán khi nhận hàng (COD) và thanh toán online qua cổng VNPay (môi trường sandbox) hoặc SePay.
- Tồn kho được quản lý theo từng sản phẩm, không phân tách theo chi nhánh hoặc kho vật lý.
- Một đơn hàng chỉ được giao đến một địa chỉ giao hàng.
- Giá sản phẩm được áp dụng tại thời điểm khách hàng đặt hàng và được lưu lại trong chi tiết đơn hàng.
- Admin là vai trò quản trị duy nhất trong phạm vi đồ án.
- Tài khoản Admin ban đầu được tạo bằng seed data hoặc thao tác trực tiếp trong cơ sở dữ liệu; hệ thống không cung cấp luồng tự đăng ký/tạo mới Admin.
- Backup dữ liệu, logging lỗi và audit thao tác Admin là trách nhiệm của cấu hình hạ tầng/framework; không yêu cầu entity hoặc API nghiệp vụ riêng trong phạm vi này.
- Điểm thân thiện môi trường (`eco_score`) do Admin tự đánh giá và nhập thủ công (1-5), không tính tự động từ công thức phức tạp.
- Chứng nhận/nhãn xanh là danh mục do Admin quản lý tập trung, một sản phẩm có thể gắn nhiều chứng nhận.
- Cửa hàng chỉ có một địa chỉ vật lý duy nhất; thông tin liên hệ và Google Maps hiển thị cố định, không quản lý theo nhiều chi nhánh.
- Nội dung các trang chính sách (đổi trả, bảo hành, vận chuyển) do Admin soạn thảo và chỉnh sửa trực tiếp trên hệ thống, không qua quy trình phê duyệt nhiều bước.

### 1.8. Thuật ngữ

| Thuật ngữ | Diễn giải |
|---|---|
| Guest | Người truy cập website nhưng chưa đăng nhập. |
| Customer | Người dùng đã đăng ký, đăng nhập và có quyền mua hàng. |
| Admin | Người dùng có quyền quản trị hệ thống. |
| Sản phẩm | Hàng hóa thân thiện với môi trường được đăng bán trên EcoMart. |
| Danh mục | Nhóm phân loại sản phẩm, ví dụ: Đồ dùng nhà bếp, Túi vải, Mỹ phẩm hữu cơ. |
| Thương hiệu | Đơn vị sản xuất hoặc nhãn hiệu của sản phẩm. |
| Chứng nhận/nhãn xanh | Chứng nhận thân thiện môi trường gắn cho sản phẩm, ví dụ: Nhãn xanh Việt Nam, FSC, Hữu cơ. |
| Điểm thân thiện môi trường | Điểm số 1-5 do Admin đánh giá mức độ thân thiện môi trường của sản phẩm. |
| Tồn kho | Số lượng sản phẩm hiện có và có thể bán. |
| Giỏ hàng | Nơi lưu tạm các sản phẩm Customer dự định mua. |
| Đơn hàng | Yêu cầu mua hàng được tạo khi Customer xác nhận đặt hàng. |
| Chi tiết đơn hàng | Danh sách sản phẩm, số lượng và giá bán thuộc một đơn hàng. |
| COD | Thanh toán bằng tiền mặt khi nhận hàng. |
| VNPay/SePay | Cổng thanh toán online được tích hợp để Customer thanh toán trước qua chuyển khoản/QR/thẻ. |
| IPN/Webhook | Cơ chế cổng thanh toán gọi ngược về hệ thống để xác nhận kết quả giao dịch. |
| Khuyến mại | Việc hiển thị giá cũ (gạch ngang) và giá bán mới trên sản phẩm đang giảm giá. |
| Đánh giá | Nhận xét và điểm đánh giá của Customer cho sản phẩm đã mua. |
| Dashboard | Màn hình tổng quan dành cho Admin về dữ liệu vận hành cơ bản. |

## 2. Phân tích nghiệp vụ

### 2.1. Quy trình mua hàng

1. Guest truy cập website để xem danh mục, tìm kiếm, lọc hoặc xem chi tiết sản phẩm.
2. Nếu muốn mua hàng, Guest đăng ký hoặc đăng nhập để trở thành Customer.
   - Sau khi đăng nhập thành công từ thao tác “Thêm vào giỏ hàng”, hệ thống quay lại trang sản phẩm; Customer chủ động nhấn thêm vào giỏ lại để tránh thêm ngoài ý muốn.
3. Customer chọn sản phẩm và số lượng cần mua, sau đó thêm vào giỏ hàng.
4. Customer kiểm tra giỏ hàng; có thể thay đổi số lượng hoặc xóa sản phẩm.
5. Customer tiến hành đặt hàng, chọn hoặc thêm địa chỉ giao hàng.
6. Hệ thống kiểm tra giỏ hàng, thông tin địa chỉ và số lượng tồn kho.
7. Customer chọn phương thức thanh toán: COD, hoặc thanh toán online qua VNPay/SePay.
   - Nếu chọn COD: Customer gửi yêu cầu đặt hàng trực tiếp.
   - Nếu chọn thanh toán online: Customer được chuyển hướng sang trang thanh toán của cổng tương ứng để hoàn tất giao dịch.
8. Hệ thống tạo đơn hàng ở trạng thái chờ xác nhận, lưu chi tiết đơn hàng và cập nhật số lượng tồn kho tương ứng. Với đơn thanh toán online, trạng thái thanh toán ban đầu là **Chưa thanh toán** cho đến khi cổng thanh toán xác nhận qua webhook.
9. Admin kiểm tra đơn hàng và xác nhận hoặc hủy đơn hàng. Đơn thanh toán online chỉ được xác nhận sau khi trạng thái thanh toán chuyển thành **Đã thanh toán**.
10. Customer theo dõi trạng thái đơn hàng. Customer chỉ được hủy đơn khi đơn chưa được Admin xác nhận.
11. Khi đơn hàng hoàn thành, Customer có thể đánh giá các sản phẩm thuộc đơn hàng đó.

### 2.2. Quy trình quản lý sản phẩm

1. Admin tạo danh mục, thương hiệu và chứng nhận/nhãn xanh (nếu cần) trước khi tạo sản phẩm.
2. Admin thêm sản phẩm với các thông tin cơ bản: tên, danh mục, thương hiệu, giá bán, giá cũ (nếu đang khuyến mại), điểm thân thiện môi trường, thông tin vật liệu, chứng nhận gắn kèm, mô tả, hình ảnh và trạng thái hiển thị.
3. Admin cập nhật số lượng tồn kho cho từng sản phẩm.
4. Admin có thể chỉnh sửa thông tin sản phẩm khi cần.
5. Khi sản phẩm không còn kinh doanh, Admin chuyển sản phẩm sang trạng thái không hiển thị thay vì xóa dữ liệu có liên quan đến lịch sử đơn hàng.
6. Khách hàng chỉ xem và mua các sản phẩm đang hiển thị và còn tồn kho.

### 2.3. Quy trình xử lý đơn hàng

1. Đơn hàng được tạo sau khi Customer xác nhận đặt hàng với phương thức COD hoặc online.
2. Đơn hàng ban đầu có trạng thái **Chờ xác nhận**.
3. Admin kiểm tra thông tin đơn hàng, tồn kho và trạng thái thanh toán (nếu là đơn online).
4. Admin thực hiện một trong hai thao tác:
   - Xác nhận đơn hàng, sau đó đơn chuyển sang trạng thái **Đã xác nhận**. Với đơn online, chỉ thực hiện được khi trạng thái thanh toán là **Đã thanh toán**.
   - Hủy đơn hàng khi không thể xử lý; hệ thống hoàn lại số lượng tồn kho đã giữ cho đơn. Nếu đơn đã thanh toán online, Admin hoàn tiền thủ công ngoài hệ thống và cập nhật trạng thái thanh toán thành **Đã hoàn tiền**.
5. Sau khi giao hàng, Admin cập nhật đơn sang trạng thái **Đã hoàn thành**.
6. Đơn đã hoàn thành được dùng để tính báo cáo doanh thu và làm điều kiện cho Customer đánh giá sản phẩm.
7. Đơn đã hoàn thành không được xóa.

### 2.4. Quy trình thanh toán online (VNPay/SePay)

1. Sau khi Customer chọn phương thức thanh toán online và xác nhận đặt hàng, hệ thống tạo đơn hàng (trạng thái Chờ xác nhận, trạng thái thanh toán Chưa thanh toán) và tạo một giao dịch thanh toán (Payment Transaction) tương ứng.
2. Hệ thống gọi API của cổng thanh toán (VNPay hoặc SePay) để tạo URL/thông tin thanh toán, sau đó chuyển hướng Customer sang trang thanh toán của cổng.
3. Customer hoàn tất thanh toán trên trang của cổng thanh toán.
4. Cổng thanh toán gọi về hệ thống qua webhook/IPN (server-to-server) để thông báo kết quả giao dịch. Hệ thống bắt buộc xác thực chữ ký/checksum của yêu cầu này trước khi xử lý.
5. Nếu chữ ký hợp lệ và giao dịch thành công: hệ thống cập nhật giao dịch thanh toán thành **Thành công**, đơn hàng chuyển trạng thái thanh toán sang **Đã thanh toán**, ghi nhận thời điểm thanh toán.
6. Nếu giao dịch thất bại hoặc chữ ký không hợp lệ: hệ thống cập nhật giao dịch thành **Thất bại**, đơn hàng giữ trạng thái thanh toán **Chưa thanh toán**; Customer có thể thử lại thanh toán hoặc Admin hủy đơn thủ công nếu quá hạn.
7. Cổng thanh toán cũng chuyển hướng trình duyệt Customer về trang kết quả của hệ thống; trang này chỉ hiển thị thông tin, không dùng để xác nhận thanh toán (việc xác nhận chỉ dựa vào webhook/IPN đã xác thực).

### 2.5. Giá trị hệ thống mang lại

| Đối tượng | Giá trị |
|---|---|
| Customer | Có thể tìm kiếm và mua sản phẩm tiêu dùng thân thiện môi trường trực tuyến, quản lý địa chỉ, theo dõi đơn hàng và đưa ra đánh giá sau mua. |
| Admin | Quản lý tập trung sản phẩm, tồn kho, đơn hàng, người dùng và đánh giá; giảm việc theo dõi thủ công. |
| Chủ cửa hàng | Có dữ liệu doanh thu và phân tích chuyên sâu để theo dõi tình hình bán hàng. |
| Nhóm phát triển | Có quy trình nghiệp vụ và yêu cầu thống nhất làm căn cứ thiết kế, xây dựng và kiểm thử hệ thống. |

## 3. Actor

### 3.1. Guest

| Nội dung | Mô tả |
|---|---|
| Vai trò | Người truy cập website chưa đăng nhập. |
| Quyền hạn | Xem nội dung công khai và thực hiện các chức năng xác thực cơ bản. |
| Mục tiêu | Tìm hiểu sản phẩm và tạo/đăng nhập tài khoản để mua hàng. |
| Chức năng chính | Xem trang chủ, danh mục, chi tiết sản phẩm; tìm kiếm; lọc theo danh mục, thương hiệu, khoảng giá, chứng nhận, điểm thân thiện môi trường; đăng ký; đăng nhập; quên mật khẩu; xem trang chính sách; gửi liên hệ/feedback. |

### 3.2. Customer

| Nội dung | Mô tả |
|---|---|
| Vai trò | Người dùng đã đăng ký và đăng nhập vào website. |
| Quyền hạn | Sử dụng toàn bộ chức năng của Guest và các chức năng mua hàng cá nhân. |
| Mục tiêu | Mua sản phẩm, quản lý thông tin giao hàng, theo dõi đơn hàng và đánh giá sản phẩm đã mua. |
| Chức năng chính | Quản lý thông tin cá nhân, đổi mật khẩu, quản lý địa chỉ, quản lý giỏ hàng, đặt hàng và thanh toán COD hoặc online (VNPay/SePay), theo dõi đơn, hủy đơn chưa xác nhận, xem lịch sử mua hàng, đánh giá sản phẩm, gửi liên hệ/feedback. |

### 3.3. Admin

| Nội dung | Mô tả |
|---|---|
| Vai trò | Người quản trị vận hành website EcoMart. |
| Quyền hạn | Truy cập khu vực quản trị và quản lý dữ liệu nghiệp vụ của hệ thống. |
| Mục tiêu | Đảm bảo thông tin bán hàng chính xác, tồn kho được kiểm soát và đơn hàng được xử lý đúng trạng thái. |
| Chức năng chính | Đăng nhập quản trị, xem dashboard, quản lý người dùng, danh mục, thương hiệu, chứng nhận, sản phẩm, tồn kho, đơn hàng, thanh toán, đánh giá, liên hệ khách hàng, nội dung trang chính sách, cấu hình cửa hàng và báo cáo doanh thu. |

## 4. Functional Requirements

| ID | Chức năng | Mô tả | Actor |
|---|---|---|---|
| FR-01 | Xem trang chủ | Hiển thị thông tin giới thiệu, danh mục và các sản phẩm đang được kinh doanh. | Guest, Customer |
| FR-02 | Xem danh mục sản phẩm | Cho phép xem danh sách các danh mục sản phẩm. | Guest, Customer |
| FR-03 | Xem sản phẩm theo danh mục | Hiển thị các sản phẩm thuộc danh mục được chọn. | Guest, Customer |
| FR-04 | Xem chi tiết sản phẩm | Hiển thị tên, hình ảnh, thương hiệu, giá, mô tả, số lượng tồn kho và đánh giá của sản phẩm. | Guest, Customer |
| FR-05 | Tìm kiếm sản phẩm | Cho phép tìm sản phẩm theo từ khóa tên sản phẩm. | Guest, Customer |
| FR-06 | Lọc theo danh mục | Cho phép lọc danh sách sản phẩm theo danh mục. | Guest, Customer |
| FR-07 | Lọc theo thương hiệu | Cho phép lọc danh sách sản phẩm theo thương hiệu. | Guest, Customer |
| FR-08 | Lọc theo khoảng giá | Cho phép lọc danh sách sản phẩm theo khoảng giá được chọn. | Guest, Customer |
| FR-09 | Đăng ký | Cho phép Guest tạo tài khoản Customer bằng thông tin hợp lệ. | Guest |
| FR-10 | Đăng nhập | Cho phép người dùng đăng nhập bằng email và mật khẩu. | Guest, Customer, Admin |
| FR-11 | Quên mật khẩu | Cho phép Guest hoặc Customer yêu cầu đặt lại mật khẩu thông qua email đã đăng ký. | Guest, Customer |
| FR-12 | Xem hồ sơ cá nhân | Hiển thị thông tin hồ sơ của Customer đang đăng nhập. | Customer |
| FR-13 | Cập nhật hồ sơ cá nhân | Cho phép Customer cập nhật thông tin cá nhân cơ bản. | Customer |
| FR-14 | Đổi mật khẩu | Cho phép Customer thay đổi mật khẩu sau khi xác thực mật khẩu hiện tại. | Customer |
| FR-15 | Xem địa chỉ giao hàng | Hiển thị danh sách địa chỉ giao hàng của Customer. | Customer |
| FR-16 | Thêm địa chỉ giao hàng | Cho phép Customer thêm địa chỉ giao hàng mới. | Customer |
| FR-17 | Cập nhật địa chỉ giao hàng | Cho phép Customer chỉnh sửa địa chỉ giao hàng thuộc sở hữu của mình. | Customer |
| FR-18 | Xóa địa chỉ giao hàng | Cho phép Customer xóa địa chỉ giao hàng không còn sử dụng. | Customer |
| FR-19 | Xem giỏ hàng | Hiển thị các sản phẩm, số lượng, đơn giá và tổng tiền tạm tính trong giỏ hàng. | Customer |
| FR-20 | Thêm vào giỏ hàng | Cho phép Customer thêm sản phẩm đang hiển thị và còn tồn kho vào giỏ hàng. | Customer |
| FR-21 | Cập nhật số lượng giỏ hàng | Cho phép Customer tăng hoặc giảm số lượng của một sản phẩm trong giỏ hàng, trong giới hạn tồn kho. | Customer |
| FR-22 | Xóa sản phẩm khỏi giỏ hàng | Cho phép Customer loại bỏ một sản phẩm khỏi giỏ hàng. | Customer |
| FR-23 | Đặt hàng COD | Cho phép Customer tạo đơn hàng từ giỏ hàng, chọn địa chỉ giao hàng và thanh toán bằng COD. | Customer |
| FR-24 | Kiểm tra tồn kho khi đặt hàng | Hệ thống kiểm tra tồn kho của từng sản phẩm trước khi tạo đơn hàng. | Hệ thống |
| FR-25 | Theo dõi đơn hàng | Cho phép Customer xem danh sách và trạng thái các đơn hàng của mình. | Customer |
| FR-26 | Xem chi tiết đơn hàng | Hiển thị thông tin giao hàng, sản phẩm, số lượng, giá và trạng thái của đơn hàng. | Customer, Admin |
| FR-27 | Hủy đơn hàng | Cho phép Customer hủy đơn hàng khi đơn đang ở trạng thái Chờ xác nhận. | Customer |
| FR-28 | Xem lịch sử mua hàng | Cho phép Customer xem các đơn hàng đã tạo, gồm cả đơn hoàn thành và đơn đã hủy. | Customer |
| FR-29 | Đánh giá sản phẩm | Cho phép Customer tạo đánh giá cho sản phẩm đã thuộc đơn hàng hoàn thành của mình. | Customer |
| FR-30 | Xem đánh giá sản phẩm | Hiển thị danh sách đánh giá hợp lệ của sản phẩm tại trang chi tiết sản phẩm. | Guest, Customer |
| FR-31 | Xem dashboard | Hiển thị số liệu tổng quan cơ bản về đơn hàng, doanh thu, sản phẩm và người dùng. | Admin |
| FR-32 | Quản lý người dùng | Cho phép Admin xem danh sách, tìm kiếm và cập nhật trạng thái hoạt động của Customer. | Admin |
| FR-33 | Quản lý danh mục | Cho phép Admin thêm, xem, sửa và quản lý trạng thái danh mục. | Admin |
| FR-34 | Quản lý thương hiệu | Cho phép Admin thêm, xem, sửa và quản lý trạng thái thương hiệu. | Admin |
| FR-35 | Quản lý sản phẩm | Cho phép Admin thêm, xem, sửa thông tin, hình ảnh và trạng thái hiển thị của sản phẩm. | Admin |
| FR-36 | Quản lý tồn kho | Cho phép Admin xem và cập nhật số lượng tồn kho của từng sản phẩm. | Admin |
| FR-37 | Xem danh sách đơn hàng | Cho phép Admin xem, tìm kiếm và lọc đơn hàng theo trạng thái. | Admin |
| FR-38 | Xác nhận đơn hàng | Cho phép Admin chuyển đơn từ trạng thái Chờ xác nhận sang Đã xác nhận. | Admin |
| FR-39 | Hủy đơn hàng quản trị | Cho phép Admin hủy đơn khi không thể xử lý và ghi nhận lý do hủy. | Admin |
| FR-40 | Hoàn thành đơn hàng | Cho phép Admin cập nhật đơn đã xác nhận sang trạng thái Đã hoàn thành sau khi giao thành công. | Admin |
| FR-41 | Quản lý đánh giá | Cho phép Admin xem danh sách và ẩn đánh giá không phù hợp khỏi phần hiển thị công khai. | Admin |
| FR-42 | Xem báo cáo doanh thu | Cho phép Admin xem doanh thu cơ bản theo khoảng thời gian, dựa trên đơn hàng đã hoàn thành. | Admin |
| FR-43 | Lọc theo chứng nhận | Cho phép lọc danh sách sản phẩm theo chứng nhận/nhãn xanh. | Guest, Customer |
| FR-44 | Lọc theo điểm thân thiện môi trường | Cho phép lọc danh sách sản phẩm theo điểm thân thiện môi trường tối thiểu. | Guest, Customer |
| FR-45 | Sắp xếp sản phẩm | Cho phép sắp xếp danh sách sản phẩm theo giá tăng/giảm hoặc mới nhất. | Guest, Customer |
| FR-46 | Quản lý chứng nhận | Cho phép Admin thêm, sửa, xem và cập nhật trạng thái chứng nhận/nhãn xanh. | Admin |
| FR-47 | Gắn chứng nhận cho sản phẩm | Cho phép Admin gắn hoặc gỡ một hoặc nhiều chứng nhận cho sản phẩm khi tạo/sửa sản phẩm. | Admin |
| FR-48 | Hiển thị giá khuyến mại | Hiển thị giá cũ (gạch ngang) và giá bán hiện tại khi sản phẩm đang được giảm giá. | Guest, Customer |
| FR-49 | Gửi liên hệ/feedback | Cho phép Guest hoặc Customer gửi tin nhắn liên hệ gồm họ tên, email, số điện thoại, nội dung. | Guest, Customer |
| FR-50 | Quản lý liên hệ | Cho phép Admin xem danh sách tin nhắn liên hệ và cập nhật trạng thái đã xử lý. | Admin |
| FR-51 | Xem trang chính sách | Hiển thị nội dung trang chính sách đổi trả, bảo hành, vận chuyển. | Guest, Customer |
| FR-52 | Quản lý nội dung trang chính sách | Cho phép Admin chỉnh sửa tiêu đề và nội dung các trang chính sách. | Admin |
| FR-53 | Xem thông tin liên hệ và bản đồ | Hiển thị số điện thoại, email, địa chỉ cửa hàng và bản đồ Google Maps tại trang Liên hệ. | Guest, Customer |
| FR-54 | Quản lý cấu hình cửa hàng | Cho phép Admin cập nhật số điện thoại, email, địa chỉ và đường dẫn nhúng Google Maps của cửa hàng. | Admin |
| FR-55 | Chọn phương thức thanh toán | Cho phép Customer chọn COD, VNPay hoặc SePay khi đặt hàng. | Customer |
| FR-56 | Khởi tạo thanh toán online | Hệ thống tạo giao dịch thanh toán và URL/thông tin thanh toán từ cổng VNPay hoặc SePay, sau đó chuyển hướng Customer sang cổng thanh toán. | Hệ thống |
| FR-57 | Xử lý webhook/IPN thanh toán | Hệ thống nhận và xác thực chữ ký kết quả giao dịch từ cổng thanh toán, cập nhật trạng thái thanh toán của đơn hàng tương ứng. | Hệ thống |
| FR-58 | Xem trạng thái thanh toán | Cho phép Customer xem trạng thái thanh toán của đơn hàng đang chờ xác nhận thanh toán online. | Customer |
| FR-59 | Quản lý thanh toán đơn hàng | Cho phép Admin xem trạng thái thanh toán, lịch sử giao dịch của đơn hàng và cập nhật trạng thái đã hoàn tiền khi xử lý hoàn tiền thủ công. | Admin |
| FR-60 | Xác thực tài khoản qua Email OTP | Hệ thống gửi mã OTP 6 chữ số qua Resend API khi Guest đăng ký; Customer bắt buộc xác thực OTP để kích hoạt tài khoản trước khi đăng nhập. | Hệ thống, Customer |
| FR-61 | Gửi lại mã OTP xác thực | Cho phép người dùng yêu cầu gửi lại mã OTP kích hoạt tài khoản qua email khi mã cũ hết hạn hoặc thất lạc. | Guest, Customer |
| FR-62 | Đặt lại mật khẩu bằng OTP | Cho phép người dùng nhận mã OTP 6 số qua email và trực tiếp đổi mật khẩu mới bảo mật. | Guest, Customer |
| FR-63 | Tự động làm mới phiên (Refresh Token) | Cho phép client gửi Refresh Token hợp lệ để nhận Access Token mới mà không bắt người dùng đăng nhập lại. | Hệ thống, Customer, Admin |
| FR-64 | Xem thông tin phiên đăng nhập (Get Me) | Cho phép client lấy thông tin profile và vai trò của tài khoản đang đăng nhập qua Bearer Token. | Customer, Admin |
| FR-65 | Chống Spam API Email (Anti-Spam) | Áp dụng Cooldown 60 giây và Rate Limiting tối đa 5 lần gửi OTP / 15 phút cho mỗi email để bảo vệ hạn ngạch và chống lạm dụng. | Hệ thống |
| FR-66 | Chống dò mã OTP (Anti-Brute-Force) | Đếm số lần nhập sai mã OTP; tự động vô hiệu hóa mã khi sai quá 5 lần liên tiếp để chống tấn công brute-force. | Hệ thống |
| FR-67 | Trung tâm Phân tích & Báo cáo Thông minh | Cung cấp 12 biểu đồ & chỉ số phân tích chuyên sâu cho Admin: Doanh thu ngày/tháng/năm, Top bán chạy, Tỷ trọng danh mục/thương hiệu, Phương thức thanh toán, Tăng trưởng khách hàng, VIPs, Nguy cơ hủy đơn, Cảnh báo tồn kho, CSAT & Eco-Impact. | Admin |

## 5. Non-functional Requirements

| Nhóm | ID | Yêu cầu |
|---|---|---|
| Security | NFR-01 | Mật khẩu phải được lưu trữ dưới dạng mã hóa; không lưu mật khẩu gốc. |
| Security | NFR-02 | Chức năng theo vai trò phải được kiểm soát: Guest, Customer và Admin chỉ truy cập được dữ liệu/chức năng được cấp quyền. |
| Security | NFR-03 | Customer chỉ được xem, sửa hoặc hủy dữ liệu thuộc sở hữu của chính mình, như hồ sơ, địa chỉ, giỏ hàng và đơn hàng. |
| Security | NFR-04 | Admin phải đăng nhập mới được truy cập khu vực quản trị. |
| Security | NFR-05 | Dữ liệu nhập từ người dùng phải được kiểm tra tính hợp lệ trước khi lưu. |
| Security | NFR-19 | Mọi webhook/IPN từ cổng thanh toán phải được xác thực chữ ký/checksum phía server trước khi cập nhật trạng thái thanh toán; không tin dữ liệu redirect từ trình duyệt khách hàng. |
| Security | NFR-20 | Thông tin nhạy cảm liên quan giao dịch thanh toán (khóa bí mật, secret key của cổng thanh toán) không được lưu ở phía Frontend hoặc lộ ra response API. |
| Security | NFR-21 | Giới hạn tần suất gửi email OTP: Cooldown 60s giữa 2 lần gửi liên tiếp và tối đa 5 yêu cầu / 15 phút cho mỗi email (HTTP 429 Too Many Requests). |
| Security | NFR-22 | Giới hạn số lần thử OTP tối đa 5 lần; hủy token ngay khi đạt ngưỡng để chống vét cạn (Brute-force). |
| Security | NFR-23 | Toàn bộ thông tin bí mật (API Keys, JWT Secret, DB Credentials) phải nạp 100% qua file `.env`, không hardcode vào source code hay file cấu hình commit lên VCS. |
| Performance | NFR-06 | Các trang thông thường như trang chủ, danh sách sản phẩm và chi tiết sản phẩm nên phản hồi trong vòng 3 giây ở điều kiện sử dụng bình thường. |
| Performance | NFR-07 | Tìm kiếm, lọc sản phẩm và tải danh sách đơn hàng phải có phản hồi rõ ràng cho người dùng trong thời gian chờ xử lý. |
| Performance | NFR-08 | Danh sách sản phẩm, đơn hàng, người dùng và đánh giá phải hỗ trợ phân trang để tránh tải quá nhiều dữ liệu cùng lúc. |
| Availability | NFR-09 | Hệ thống cần hoạt động ổn định trong thời gian trình diễn và kiểm thử đồ án, trừ thời gian bảo trì đã thông báo. |
| Availability | NFR-10 | Khi xảy ra lỗi xử lý, hệ thống phải thông báo lỗi thân thiện và không để người dùng tiếp tục thao tác trên dữ liệu không hợp lệ. |
| Maintainability | NFR-11 | Chức năng cần được phân chia theo các module nghiệp vụ rõ ràng để thuận tiện bảo trì và mở rộng trong phạm vi đồ án. |
| Maintainability | NFR-12 | Các thông báo, trạng thái đơn hàng và quy tắc nghiệp vụ dùng thuật ngữ nhất quán trên toàn hệ thống. |
| Responsive | NFR-13 | Giao diện phải sử dụng được trên máy tính, máy tính bảng và điện thoại di động. |
| Responsive | NFR-14 | Các thao tác quan trọng như tìm kiếm, thêm giỏ hàng, đặt hàng và theo dõi đơn phải dễ thực hiện trên màn hình nhỏ. |
| Backup dữ liệu | NFR-15 | Dữ liệu nghiệp vụ quan trọng gồm người dùng, sản phẩm, tồn kho, đơn hàng và đánh giá cần được sao lưu định kỳ. |
| Backup dữ liệu | NFR-16 | Bản sao lưu phải có thể được dùng để phục hồi dữ liệu khi xảy ra sự cố mất dữ liệu. |
| Logging cơ bản | NFR-17 | Hệ thống cần ghi nhận lỗi hệ thống để hỗ trợ kiểm tra và xử lý sự cố. |
| Logging cơ bản | NFR-18 | Hệ thống cần ghi nhận các thao tác quản trị quan trọng, gồm cập nhật sản phẩm, tồn kho, trạng thái đơn hàng và trạng thái đánh giá. |

## 6. Use Case List

### 6.1. Use Case của Guest

| ID | Use Case | Mô tả ngắn |
|---|---|---|
| UC-G-01 | Xem trang chủ | Xem nội dung tổng quan và sản phẩm đang hiển thị. |
| UC-G-02 | Xem danh mục | Xem các danh mục sản phẩm. |
| UC-G-03 | Xem sản phẩm theo danh mục | Xem sản phẩm thuộc một danh mục. |
| UC-G-04 | Xem chi tiết sản phẩm | Xem thông tin chi tiết và đánh giá sản phẩm. |
| UC-G-05 | Tìm kiếm sản phẩm | Tìm sản phẩm theo từ khóa. |
| UC-G-06 | Lọc sản phẩm | Lọc theo danh mục, thương hiệu hoặc khoảng giá. |
| UC-G-07 | Đăng ký | Tạo tài khoản Customer. |
| UC-G-08 | Đăng nhập | Đăng nhập vào hệ thống. |
| UC-G-09 | Quên mật khẩu | Yêu cầu đặt lại mật khẩu. |
| UC-G-10 | Xem trang chính sách | Xem nội dung chính sách đổi trả, bảo hành, vận chuyển. |
| UC-G-11 | Gửi liên hệ | Gửi tin nhắn liên hệ/feedback đến cửa hàng. |
| UC-G-12 | Xem bản đồ cửa hàng | Xem vị trí cửa hàng qua Google Maps tại trang Liên hệ. |

### 6.2. Use Case của Customer

| ID | Use Case | Mô tả ngắn |
|---|---|---|
| UC-C-01 | Xem/cập nhật hồ sơ cá nhân | Xem và chỉnh sửa thông tin cá nhân. |
| UC-C-02 | Đổi mật khẩu | Thay đổi mật khẩu tài khoản. |
| UC-C-03 | Quản lý địa chỉ giao hàng | Thêm, sửa, xóa và xem địa chỉ giao hàng. |
| UC-C-04 | Xem giỏ hàng | Xem sản phẩm hiện có trong giỏ hàng. |
| UC-C-05 | Thêm vào giỏ hàng | Thêm sản phẩm vào giỏ hàng. |
| UC-C-06 | Cập nhật giỏ hàng | Thay đổi số lượng sản phẩm trong giỏ hàng. |
| UC-C-07 | Xóa khỏi giỏ hàng | Xóa sản phẩm khỏi giỏ hàng. |
| UC-C-08 | Đặt hàng | Tạo đơn hàng từ giỏ hàng, chọn thanh toán COD hoặc online (VNPay/SePay). |
| UC-C-09 | Xem danh sách đơn hàng | Xem các đơn hàng đã tạo. |
| UC-C-10 | Xem chi tiết đơn hàng | Xem thông tin, trạng thái và trạng thái thanh toán của một đơn hàng. |
| UC-C-11 | Hủy đơn hàng | Hủy đơn đang ở trạng thái Chờ xác nhận. |
| UC-C-12 | Xem lịch sử mua hàng | Xem các đơn hàng đã hoàn thành hoặc đã hủy. |
| UC-C-13 | Đánh giá sản phẩm | Đánh giá sản phẩm thuộc đơn hàng đã hoàn thành. |
| UC-C-14 | Gửi liên hệ | Gửi tin nhắn liên hệ/feedback đến cửa hàng. |

### 6.3. Use Case của Admin

| ID | Use Case | Mô tả ngắn |
|---|---|---|
| UC-A-01 | Đăng nhập quản trị | Đăng nhập vào khu vực quản trị. |
| UC-A-02 | Xem dashboard | Xem số liệu tổng quan của hệ thống. |
| UC-A-03 | Quản lý người dùng | Xem, tìm kiếm và cập nhật trạng thái Customer. |
| UC-A-04 | Quản lý danh mục | Thêm, sửa, xem và cập nhật trạng thái danh mục. |
| UC-A-05 | Quản lý thương hiệu | Thêm, sửa, xem và cập nhật trạng thái thương hiệu. |
| UC-A-06 | Quản lý sản phẩm | Thêm, sửa, xem và cập nhật trạng thái hiển thị sản phẩm. |
| UC-A-07 | Quản lý tồn kho | Xem và cập nhật tồn kho sản phẩm. |
| UC-A-08 | Xem danh sách đơn hàng | Xem, tìm kiếm và lọc đơn hàng. |
| UC-A-09 | Xác nhận đơn hàng | Xác nhận đơn đang chờ xác nhận. |
| UC-A-10 | Hủy đơn hàng | Hủy đơn không thể xử lý và ghi nhận lý do. |
| UC-A-11 | Hoàn thành đơn hàng | Cập nhật trạng thái đơn sau khi giao thành công. |
| UC-A-12 | Quản lý đánh giá | Xem và ẩn đánh giá không phù hợp. |
| UC-A-13 | Xem báo cáo doanh thu | Xem doanh thu theo khoảng thời gian. |
| UC-A-14 | Quản lý chứng nhận | Thêm, sửa, xem và cập nhật trạng thái chứng nhận/nhãn xanh. |
| UC-A-15 | Quản lý liên hệ | Xem và xử lý tin nhắn liên hệ/feedback. |
| UC-A-16 | Quản lý nội dung trang chính sách | Chỉnh sửa nội dung trang đổi trả, bảo hành, vận chuyển. |
| UC-A-17 | Quản lý cấu hình cửa hàng | Cập nhật thông tin liên hệ và bản đồ cửa hàng. |
| UC-A-18 | Quản lý thanh toán đơn hàng | Xem trạng thái, lịch sử giao dịch thanh toán và cập nhật trạng thái hoàn tiền. |

## 7. User Story

### 7.1. User Story của Guest

| ID | User Story |
|---|---|
| US-G-01 | As a Guest, I want to xem trang chủ, so that I can biết các nhóm sản phẩm và sản phẩm đang được bán. |
| US-G-02 | As a Guest, I want to xem danh mục sản phẩm, so that I can truy cập nhanh nhóm sản phẩm mình quan tâm. |
| US-G-03 | As a Guest, I want to xem chi tiết sản phẩm, so that I can biết thông tin cần thiết trước khi quyết định mua. |
| US-G-04 | As a Guest, I want to tìm kiếm sản phẩm theo từ khóa, so that I can nhanh chóng tìm sản phẩm cần mua. |
| US-G-05 | As a Guest, I want to lọc sản phẩm theo danh mục, thương hiệu và khoảng giá, so that I can thu hẹp danh sách sản phẩm phù hợp. |
| US-G-06 | As a Guest, I want to đăng ký tài khoản, so that I can mua hàng và quản lý đơn hàng của mình. |
| US-G-07 | As a Guest, I want to đăng nhập, so that I can sử dụng các chức năng dành cho Customer. |
| US-G-08 | As a Guest, I want to yêu cầu đặt lại mật khẩu, so that I can lấy lại quyền truy cập khi quên mật khẩu. |
| US-G-09 | As a Guest, I want to xem chính sách đổi trả/bảo hành/vận chuyển, so that I can yên tâm trước khi quyết định mua hàng. |
| US-G-10 | As a Guest, I want to gửi liên hệ cho cửa hàng, so that I can đặt câu hỏi hoặc góp ý trước khi mua. |

### 7.2. User Story của Customer

| ID | User Story |
|---|---|
| US-C-01 | As a Customer, I want to cập nhật thông tin cá nhân, so that thông tin tài khoản của tôi luôn chính xác. |
| US-C-02 | As a Customer, I want to đổi mật khẩu, so that tôi có thể bảo vệ tài khoản của mình. |
| US-C-03 | As a Customer, I want to quản lý địa chỉ giao hàng, so that tôi có thể chọn địa chỉ phù hợp khi đặt hàng. |
| US-C-04 | As a Customer, I want to thêm sản phẩm vào giỏ hàng, so that tôi có thể lưu các sản phẩm dự định mua. |
| US-C-05 | As a Customer, I want to thay đổi số lượng hoặc xóa sản phẩm trong giỏ hàng, so that đơn hàng của tôi phù hợp với nhu cầu thực tế. |
| US-C-06 | As a Customer, I want to đặt hàng và thanh toán bằng COD hoặc online qua VNPay/SePay, so that tôi có nhiều lựa chọn thanh toán phù hợp. |
| US-C-07 | As a Customer, I want to xem trạng thái đơn hàng và trạng thái thanh toán, so that tôi biết đơn hàng đang được xử lý đến đâu. |
| US-C-08 | As a Customer, I want to hủy đơn chưa được xác nhận, so that tôi có thể thay đổi quyết định mua hàng khi cần. |
| US-C-09 | As a Customer, I want to xem lịch sử mua hàng, so that tôi có thể tra cứu các đơn hàng trước đây. |
| US-C-10 | As a Customer, I want to đánh giá sản phẩm đã mua, so that tôi có thể chia sẻ trải nghiệm sử dụng với người mua khác. |
| US-C-11 | As a Customer, I want to lọc sản phẩm theo chứng nhận eco hoặc điểm thân thiện môi trường, so that tôi chọn được sản phẩm đúng tiêu chí bền vững tôi quan tâm. |

### 7.3. User Story của Admin

| ID | User Story |
|---|---|
| US-A-01 | As an Admin, I want to xem dashboard, so that tôi có thể nắm được tình hình hoạt động cơ bản của website. |
| US-A-02 | As an Admin, I want to quản lý người dùng, so that tôi có thể kiểm soát trạng thái hoạt động của các tài khoản Customer. |
| US-A-03 | As an Admin, I want to quản lý danh mục và thương hiệu, so that sản phẩm được phân loại và hiển thị nhất quán. |
| US-A-04 | As an Admin, I want to quản lý sản phẩm, so that thông tin bán hàng luôn đầy đủ và chính xác. |
| US-A-05 | As an Admin, I want to cập nhật tồn kho, so that Customer chỉ có thể đặt số lượng sản phẩm còn có thể bán. |
| US-A-06 | As an Admin, I want to xác nhận, hủy hoặc hoàn thành đơn hàng, so that quy trình xử lý đơn được theo dõi nhất quán. |
| US-A-07 | As an Admin, I want to quản lý đánh giá, so that các đánh giá hiển thị trên website phù hợp. |
| US-A-08 | As an Admin, I want to xem báo cáo doanh thu theo khoảng thời gian, so that tôi có thể theo dõi kết quả bán hàng. |
| US-A-09 | As an Admin, I want to quản lý chứng nhận/nhãn xanh và gắn cho sản phẩm, so that Customer nhận biết đúng sản phẩm đạt tiêu chuẩn thân thiện môi trường. |
| US-A-10 | As an Admin, I want to xem và xử lý tin nhắn liên hệ, so that tôi phản hồi kịp thời cho khách hàng. |
| US-A-11 | As an Admin, I want to chỉnh sửa nội dung trang chính sách, so that thông tin đổi trả/bảo hành/vận chuyển luôn cập nhật mà không cần sửa code. |
| US-A-12 | As an Admin, I want to xem trạng thái thanh toán và lịch sử giao dịch của đơn hàng, so that tôi xác nhận đơn đúng quy trình và xử lý hoàn tiền khi cần. |

## 8. Business Rules

| ID | Business Rule |
|---|---|
| BR-01 | Mỗi tài khoản phải có một email duy nhất trong hệ thống. |
| BR-02 | Email đăng ký phải đúng định dạng email hợp lệ. |
| BR-03 | Mật khẩu không được lưu dưới dạng văn bản gốc. |
| BR-04 | Guest phải đăng ký và đăng nhập thành công trước khi sử dụng giỏ hàng, đặt hàng, quản lý địa chỉ, theo dõi đơn hàng hoặc đánh giá sản phẩm. |
| BR-05 | Customer chỉ được xem và cập nhật hồ sơ cá nhân của chính mình. |
| BR-06 | Customer chỉ được đổi mật khẩu khi nhập đúng mật khẩu hiện tại. |
| BR-07 | Customer chỉ được xem, sửa hoặc xóa địa chỉ giao hàng thuộc sở hữu của mình. |
| BR-08 | Mỗi đơn hàng phải có đúng một địa chỉ giao hàng hợp lệ tại thời điểm đặt hàng. |
| BR-09 | Chỉ sản phẩm đang hiển thị mới được hiển thị trong danh sách sản phẩm công khai và được phép thêm vào giỏ hàng. |
| BR-10 | Một sản phẩm phải thuộc đúng một danh mục và đúng một thương hiệu. |
| BR-11 | Giá bán sản phẩm phải lớn hơn 0. |
| BR-12 | Số lượng tồn kho không được nhỏ hơn 0. |
| BR-13 | Customer không được thêm sản phẩm hết hàng vào giỏ hàng. |
| BR-14 | Số lượng của mỗi sản phẩm trong giỏ hàng phải lớn hơn 0 và không được vượt quá tồn kho hiện tại. |
| BR-15 | Customer không thể đặt hàng khi giỏ hàng rỗng. |
| BR-16 | Trước khi tạo đơn hàng, hệ thống phải kiểm tra lại tồn kho của toàn bộ sản phẩm trong giỏ hàng. |
| BR-17 | Khi đơn hàng được tạo thành công, hệ thống phải lưu giá bán và số lượng của từng sản phẩm vào chi tiết đơn hàng; việc thay đổi giá sản phẩm sau đó không làm thay đổi giá của đơn đã tạo. |
| BR-18 | Khi đơn hàng được tạo thành công, tồn kho của từng sản phẩm phải được giảm theo số lượng đặt mua. |
| BR-19 | EcoMart hỗ trợ 3 phương thức thanh toán: COD, VNPay, SePay. |
| BR-20 | Đơn hàng mới được tạo có trạng thái **Chờ xác nhận** và trạng thái thanh toán **Chưa thanh toán**; đơn COD giữ trạng thái thanh toán này cho đến khi hoàn thành. |
| BR-21 | Customer chỉ được hủy đơn hàng của chính mình khi đơn ở trạng thái **Chờ xác nhận**. Khi Customer hủy, hệ thống tự ghi nhận lý do hủy mặc định (Customer không nhập lý do). |
| BR-22 | Admin chỉ được xác nhận đơn hàng ở trạng thái **Chờ xác nhận**. Với đơn thanh toán online, chỉ xác nhận được khi trạng thái thanh toán là **Đã thanh toán**. Sau khi xác nhận, đơn chuyển sang trạng thái **Đã xác nhận**. |
| BR-23 | Admin có thể hủy đơn ở trạng thái **Chờ xác nhận** hoặc **Đã xác nhận**; khi hủy, hệ thống phải hoàn lại tồn kho tương ứng và lưu lý do hủy. |
| BR-24 | Admin chỉ được chuyển đơn sang trạng thái **Đã hoàn thành** khi đơn đang ở trạng thái **Đã xác nhận**. |
| BR-25 | Đơn hàng đã hoàn thành hoặc đã hủy không được xóa khỏi hệ thống. |
| BR-26 | Doanh thu chỉ được tính từ các đơn hàng có trạng thái **Đã hoàn thành**. |
| BR-27 | Customer chỉ được đánh giá sản phẩm có trong đơn hàng **Đã hoàn thành** của chính Customer đó. |
| BR-28 | Mỗi Customer chỉ được tạo một đánh giá cho mỗi sản phẩm trong một đơn hàng hoàn thành. |
| BR-29 | Điểm đánh giá sản phẩm phải nằm trong khoảng từ 1 đến 5. |
| BR-30 | Đánh giá bị Admin ẩn không được hiển thị công khai tại trang chi tiết sản phẩm, nhưng vẫn được lưu để phục vụ quản lý. |
| BR-31 | Danh mục hoặc thương hiệu đang được gán cho sản phẩm không được xóa; Admin chỉ có thể chuyển sang trạng thái không hoạt động. |
| BR-32 | Sản phẩm đã xuất hiện trong đơn hàng không được xóa; Admin chỉ có thể chuyển sản phẩm sang trạng thái không hiển thị. |
| BR-33 | Customer có tài khoản không hoạt động không được đăng nhập hoặc tạo đơn hàng mới. |
| BR-34 | Admin không được thay đổi đơn hàng đã hoàn thành về các trạng thái trước đó. |
| BR-35 | Điểm thân thiện môi trường của sản phẩm, nếu có, chỉ nhận giá trị nguyên từ 1 đến 5. |
| BR-36 | Chứng nhận đang được gắn cho sản phẩm không được xóa; Admin chỉ có thể chuyển sang trạng thái không hoạt động. |
| BR-37 | Giá cũ (giá trước khuyến mại) của sản phẩm, nếu có, phải lớn hơn giá bán hiện tại. |
| BR-38 | Tin nhắn liên hệ không yêu cầu đăng nhập; Admin là người duy nhất được cập nhật trạng thái xử lý tin nhắn liên hệ. |
| BR-39 | Nội dung trang chính sách và cấu hình cửa hàng chỉ Admin được chỉnh sửa. |
| BR-40 | Đơn hàng thanh toán online chỉ chuyển trạng thái thanh toán sang **Đã thanh toán** khi hệ thống nhận và xác thực thành công webhook/IPN từ cổng thanh toán tương ứng. |
| BR-41 | Một đơn hàng có thể có nhiều lần thử thanh toán; đơn chỉ được xem là đã thanh toán khi có ít nhất một giao dịch thành công khớp đúng đơn hàng và số tiền. |
| BR-42 | Khi đơn hàng đã thanh toán online bị hủy, Admin xử lý hoàn tiền thủ công ngoài hệ thống và cập nhật trạng thái thanh toán thành **Đã hoàn tiền**; hệ thống không tự động gọi API hoàn tiền của cổng thanh toán. |
| BR-43 | Webhook/IPN xác nhận thanh toán phải được xác thực chữ ký/checksum hợp lệ trước khi cập nhật trạng thái thanh toán; yêu cầu không hợp lệ phải bị từ chối và không làm thay đổi dữ liệu. |
| BR-44 | Một sản phẩm có thể gắn nhiều chứng nhận; một chứng nhận có thể gắn cho nhiều sản phẩm. |

## 9. Entity nghiệp vụ

> Các entity dưới đây là đối tượng nghiệp vụ dự kiến, dùng làm cơ sở cho bước thiết kế ERD và cơ sở dữ liệu. Phần này không phải thiết kế Database.

| Entity | Chức năng nghiệp vụ |
|---|---|
| User | Lưu thông tin tài khoản của Customer và Admin, gồm thông tin đăng nhập, thông tin cá nhân, trạng thái kích hoạt email (`is_email_verified`) và trạng thái hoạt động (`is_active`). |
| Role | Xác định vai trò của User trong hệ thống: `CUSTOMER` hoặc `ADMIN`. |
| EmailVerificationToken | Lưu mã OTP 6 số xác thực kích hoạt email khi đăng ký tài khoản (hạn 5 phút, tối đa 5 lần thử sai). |
| PasswordResetToken | Lưu mã OTP/token đặt lại mật khẩu của User (hạn 15 phút, tối đa 5 lần thử sai). |
| Address | Lưu các địa chỉ giao hàng thuộc một Customer. Một Customer có thể có nhiều địa chỉ. |
| Category | Lưu thông tin nhóm phân loại sản phẩm, ví dụ: Đồ dùng gia đình, Túi vải & Ba lô, Mỹ phẩm hữu cơ, Đồ dùng nhà bếp xanh. |
| Brand | Lưu thông tin thương hiệu sản phẩm, ví dụ: EcoLife, BambooHome, GreenEarth, AnEco. |
| Product | Lưu thông tin cơ bản của sản phẩm: tên, mô tả, giá bán, giá cũ (nếu khuyến mại), điểm thân thiện môi trường, thông tin vật liệu, trạng thái hiển thị, danh mục và thương hiệu. |
| ProductImage | Lưu hình ảnh của một sản phẩm. Một Product có thể có nhiều ProductImage. |
| Certification | Lưu thông tin chứng nhận/nhãn xanh do Admin quản lý, ví dụ: Nhãn xanh Việt Nam, FSC, Hữu cơ. |
| ProductCertification | Liên kết N-N giữa Product và Certification. |
| Inventory | Lưu số lượng tồn kho hiện tại của từng Product. |
| Cart | Đại diện cho giỏ hàng của một Customer trước khi đặt hàng. |
| CartItem | Lưu từng sản phẩm và số lượng tương ứng trong Cart. |
| Order | Lưu thông tin chung của đơn hàng: Customer đặt hàng, địa chỉ giao hàng, phương thức thanh toán, trạng thái thanh toán, tổng tiền, trạng thái xử lý, thời điểm tạo và lý do hủy nếu có. |
| OrderItem | Lưu từng sản phẩm trong Order, gồm tên sản phẩm tại thời điểm đặt, đơn giá, số lượng và thành tiền. |
| PaymentTransaction | Lưu từng lần thử thanh toán online của một Order, gồm mã tham chiếu `paymentRef`, cổng thanh toán, số tiền, mã giao dịch đối tác và kết quả. |
| Review | Lưu điểm đánh giá, nội dung nhận xét, trạng thái hiển thị và thông tin Customer đánh giá cho Product (gắn trực tiếp với `OrderItem`). |
| OrderStatus | Đại diện cho trạng thái nghiệp vụ của đơn hàng: Chờ xác nhận (`PENDING`), Đã xác nhận (`CONFIRMED`), Đã hoàn thành (`COMPLETED`) hoặc Đã hủy (`CANCELLED`). |
| ContactMessage | Lưu tin nhắn liên hệ/feedback từ Guest hoặc Customer và trạng thái xử lý của Admin. |
| ContentPage | Lưu nội dung các trang chính sách (đổi trả, bảo hành, vận chuyển) do Admin chỉnh sửa. |
| StoreSetting | Lưu cấu hình cửa hàng: số điện thoại, email, địa chỉ, đường dẫn nhúng Google Maps. |

### 9.1. Quan hệ nghiệp vụ chính

- Một `Role` có thể được gán cho nhiều `User`; mỗi `User` thuộc một `Role`.
- Một `Customer` có thể có nhiều `Address`, nhưng một `Address` chỉ thuộc một `Customer`.
- Một `Category` có thể có nhiều `Product`; mỗi `Product` thuộc một `Category`.
- Một `Brand` có thể có nhiều `Product`; mỗi `Product` thuộc một `Brand`.
- Một `Product` có thể có nhiều `ProductImage` và có một thông tin `Inventory`.
- Một `Customer` có một `Cart`; một `Cart` có nhiều `CartItem`.
- Một `Customer` có thể tạo nhiều `Order`; mỗi `Order` có nhiều `OrderItem`.
- Một `Product` có thể xuất hiện trong nhiều `OrderItem`.
- Một `Customer` có thể tạo nhiều `Review`; một `Product` có thể nhận nhiều `Review`.
- Một `Review` chỉ hợp lệ khi liên kết với sản phẩm thuộc đơn hàng hoàn thành của Customer.
- Một `Product` có thể gắn nhiều `Certification`, một `Certification` có thể gắn nhiều `Product` (qua `ProductCertification`).
- Một `Order` có thể có nhiều `PaymentTransaction` (nhiều lần thử thanh toán).
- `ContactMessage`, `ContentPage`, `StoreSetting` là các entity độc lập, không có quan hệ bắt buộc với `User`.

## 10. Module hệ thống

| Module | Trách nhiệm |
|---|---|
| Authentication | Đăng ký, đăng nhập, quên mật khẩu, đặt lại mật khẩu, xác thực người dùng và phân quyền theo vai trò. |
| User | Quản lý hồ sơ Customer, đổi mật khẩu, trạng thái tài khoản và quản lý người dùng từ khu vực Admin. |
| Product | Hiển thị, tìm kiếm, lọc, xem chi tiết và quản lý thông tin sản phẩm, hình ảnh, giá bán, trạng thái hiển thị. |
| Category | Hiển thị và quản lý danh mục sản phẩm. |
| Brand | Hiển thị và quản lý thương hiệu sản phẩm. |
| Cart | Thêm sản phẩm, cập nhật số lượng, xóa sản phẩm và hiển thị tổng tiền tạm tính trong giỏ hàng. |
| Order | Tạo đơn hàng, quản lý chi tiết đơn, theo dõi trạng thái, hủy đơn, xử lý đơn hàng và xem lịch sử mua hàng. |
| Payment | Khởi tạo giao dịch thanh toán online (VNPay/SePay), xử lý webhook/IPN, theo dõi trạng thái thanh toán và hỗ trợ ghi nhận hoàn tiền thủ công. |
| Certification | Quản lý danh mục chứng nhận/nhãn xanh và gắn chứng nhận cho sản phẩm. |
| Inventory | Theo dõi và cập nhật tồn kho; kiểm tra tồn kho khi Customer thêm sản phẩm vào giỏ và đặt hàng. |
| Review | Tạo, hiển thị và quản lý đánh giá sản phẩm. |
| Contact | Tiếp nhận tin nhắn liên hệ/feedback từ Guest/Customer và hỗ trợ Admin xử lý. |
| Content | Quản lý nội dung trang chính sách (đổi trả, bảo hành, vận chuyển) và cấu hình cửa hàng (liên hệ, Google Maps). |
| Dashboard | Tổng hợp số liệu cơ bản phục vụ Admin, gồm số lượng đơn hàng, sản phẩm, người dùng và doanh thu từ đơn hoàn thành. |

## 11. Danh sách màn hình

### 11.1. Màn hình Guest

| ID | Màn hình | Nội dung chính |
|---|---|---|
| SCR-G-01 | Trang chủ | Giới thiệu EcoMart, danh mục và các sản phẩm đang hiển thị. |
| SCR-G-02 | Danh sách sản phẩm | Hiển thị sản phẩm; hỗ trợ tìm kiếm, lọc danh mục, thương hiệu và khoảng giá. |
| SCR-G-03 | Danh sách sản phẩm theo danh mục | Hiển thị các sản phẩm thuộc danh mục được chọn. |
| SCR-G-04 | Chi tiết sản phẩm | Hiển thị hình ảnh, thông tin, giá, tồn kho, mô tả và đánh giá sản phẩm. |
| SCR-G-05 | Đăng ký | Form tạo tài khoản Customer. |
| SCR-G-06 | Đăng nhập | Form đăng nhập cho Customer và Admin. |
| SCR-G-07 | Quên mật khẩu | Form nhập email để yêu cầu đặt lại mật khẩu. |
| SCR-G-08 | Đặt lại mật khẩu | Form thiết lập mật khẩu mới sau khi yêu cầu hợp lệ. |
| SCR-G-09 | Trang chính sách | Hiển thị nội dung 1 trong 3 trang: đổi trả, bảo hành, vận chuyển (dùng chung 1 layout theo `slug`). |
| SCR-G-10 | Liên hệ | Form gửi liên hệ/feedback, thông tin SĐT/email/địa chỉ và bản đồ Google Maps nhúng. |

### 11.2. Màn hình Customer

| ID | Màn hình | Nội dung chính |
|---|---|---|
| SCR-C-01 | Hồ sơ cá nhân | Xem và cập nhật thông tin cá nhân. |
| SCR-C-02 | Đổi mật khẩu | Nhập mật khẩu hiện tại và mật khẩu mới. |
| SCR-C-03 | Danh sách địa chỉ giao hàng | Hiển thị các địa chỉ của Customer. |
| SCR-C-04 | Thêm/Sửa địa chỉ giao hàng | Tạo hoặc cập nhật địa chỉ giao hàng. |
| SCR-C-05 | Giỏ hàng | Hiển thị sản phẩm, số lượng, đơn giá, tổng tiền tạm tính; cho phép cập nhật và xóa. |
| SCR-C-06 | Đặt hàng | Chọn địa chỉ giao hàng, xem lại giỏ hàng và chọn phương thức thanh toán (COD/VNPay/SePay). |
| SCR-C-07 | Kết quả thanh toán | Hiển thị kết quả sau khi quay lại từ cổng thanh toán online (chỉ mang tính thông báo, không dùng để xác nhận thanh toán); đơn COD chuyển thẳng vào đây với trạng thái thành công. |
| SCR-C-08 | Danh sách đơn hàng | Hiển thị các đơn hàng của Customer và trạng thái tương ứng. |
| SCR-C-09 | Chi tiết đơn hàng | Hiển thị địa chỉ nhận hàng, sản phẩm, giá, số lượng, tổng tiền, trạng thái và lý do hủy nếu có. |
| SCR-C-10 | Lịch sử mua hàng | Hiển thị các đơn đã hoàn thành hoặc đã hủy. |
| SCR-C-11 | Tạo đánh giá sản phẩm | Cho phép Customer nhập điểm và nội dung đánh giá cho sản phẩm đủ điều kiện. |

### 11.3. Màn hình Admin

| ID | Màn hình | Nội dung chính |
|---|---|---|
| SCR-A-01 | Đăng nhập quản trị | Đăng nhập vào khu vực quản trị. |
| SCR-A-02 | Dashboard | Hiển thị số liệu tổng quan về đơn hàng, doanh thu, sản phẩm và người dùng. |
| SCR-A-03 | Quản lý người dùng | Danh sách Customer, tìm kiếm và cập nhật trạng thái hoạt động. |
| SCR-A-04 | Quản lý danh mục | Danh sách, thêm, sửa và cập nhật trạng thái danh mục. |
| SCR-A-05 | Quản lý thương hiệu | Danh sách, thêm, sửa và cập nhật trạng thái thương hiệu. |
| SCR-A-06 | Quản lý sản phẩm | Danh sách sản phẩm, tìm kiếm và thao tác quản lý. |
| SCR-A-07 | Thêm/Sửa sản phẩm | Nhập hoặc chỉnh sửa thông tin, hình ảnh, giá bán, giá cũ, điểm thân thiện môi trường, vật liệu, chứng nhận gắn kèm, danh mục, thương hiệu và trạng thái sản phẩm. |
| SCR-A-08 | Quản lý tồn kho | Xem tồn kho và cập nhật số lượng của từng sản phẩm. |
| SCR-A-09 | Quản lý đơn hàng | Danh sách đơn hàng; hỗ trợ tìm kiếm, lọc theo trạng thái xử lý và trạng thái thanh toán. |
| SCR-A-10 | Chi tiết/xử lý đơn hàng | Xem chi tiết đơn, trạng thái/lịch sử thanh toán và xác nhận, hủy hoặc hoàn thành đơn theo trạng thái hợp lệ. |
| SCR-A-11 | Quản lý đánh giá | Xem danh sách đánh giá và ẩn đánh giá không phù hợp. |
| SCR-A-12 | Báo cáo doanh thu | Xem doanh thu từ đơn hoàn thành theo khoảng thời gian. |
| SCR-A-13 | Quản lý chứng nhận | Danh sách, thêm, sửa và cập nhật trạng thái chứng nhận/nhãn xanh. |
| SCR-A-14 | Quản lý liên hệ | Danh sách tin nhắn liên hệ/feedback, xem chi tiết và đánh dấu đã xử lý. |
| SCR-A-15 | Quản lý nội dung trang | Chỉnh sửa tiêu đề/nội dung 3 trang chính sách. |
| SCR-A-16 | Cấu hình cửa hàng | Cập nhật SĐT, email, địa chỉ và đường dẫn nhúng Google Maps. |

## 12. Kết luận

Tài liệu Business Analysis cho EcoMart đã xác định phạm vi hệ thống thương mại điện tử B2C phù hợp với đồ án sinh viên. Tài liệu mô tả các đối tượng sử dụng, quy trình nghiệp vụ, yêu cầu chức năng và phi chức năng, Use Case, User Story, Business Rules, entity nghiệp vụ, module và danh sách màn hình cần thiết.

Các quy tắc trọng tâm đã được thống nhất xuyên suốt tài liệu:

- Hệ thống hỗ trợ thanh toán COD và online (VNPay, SePay); trạng thái thanh toán tách riêng khỏi trạng thái xử lý đơn.
- Webhook/IPN thanh toán bắt buộc xác thực chữ ký trước khi cập nhật trạng thái thanh toán.
- Customer chỉ được hủy đơn ở trạng thái **Chờ xác nhận**.
- Admin xử lý đơn hàng theo luồng **Chờ xác nhận → Đã xác nhận → Đã hoàn thành**, hoặc hủy đơn khi không thể xử lý; đơn online chỉ xác nhận được khi đã thanh toán.
- Tồn kho được kiểm tra trước khi đặt hàng, giảm khi đơn được tạo và hoàn lại khi đơn bị hủy.
- Doanh thu chỉ tính từ đơn **Đã hoàn thành**.
- Customer chỉ đánh giá sản phẩm đã mua trong đơn **Đã hoàn thành**.
- Chứng nhận/nhãn xanh và điểm thân thiện môi trường là thông tin do Admin quản lý và gắn cho sản phẩm.

Các bước tiếp theo được đề xuất:

1. Xây dựng Use Case Diagram.
2. Xây dựng Activity Diagram cho quy trình mua hàng và xử lý đơn hàng.
3. Xây dựng ERD từ các entity nghiệp vụ đã xác định.
4. Thiết kế cơ sở dữ liệu.
5. Thiết kế UI/UX theo danh sách màn hình.
6. Phát triển Backend theo các module nghiệp vụ.
7. Phát triển Frontend và kiểm thử các luồng chức năng chính.
