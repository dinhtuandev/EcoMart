# Backend Rules (Spring Boot)

## 1. Kiến trúc & Cấu trúc Tầng (3-Tier Layered Architecture)
Chỉ sử dụng 4 tầng cơ bản:
1. `controller`: Tiếp nhận HTTP request, validate dữ liệu đầu vào (`@Valid`), chuyển giao cho Service và trả về `ResponseEntity<ApiResponse<T>>`.Không chứa business logic.
2. `service` & `service.impl`: Chứa toàn bộ business logic, quản lý transaction (`@Transactional`). Dùng Interface + Impl.
3. `repository`: Spring Data JPA interfaces (`JpaRepository<Entity, Long>`). Dùng Query Methods hoặc `@Query` HQL/SQL đơn giản.
4. `entity`: JPA Entities đại diện cho các bảng trong DB.

## 2. Quy tắc DTO & Mapping
- **KHÔNG BÂO GIỜ** trả trực tiếp `Entity` ra `Controller` hoặc nhận `Entity` ở `Request Body`.
- Dùng gói `dto/request/` cho payload gửi lên và `dto/response/` cho data trả về.
- Sử dụng Lombok (`@Data`, `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`) để giảm boilerplate code.

## 3. Quy tắc Security & Authentication
- Spring Security 6 với cấu hình **Stateless JWT**.
- Lưu mật khẩu mã hóa bằng `BCryptPasswordEncoder`.
- Mọi endpoint public (`/api/v1/auth/**`, GET `/api/v1/products/**`, GET `/api/v1/categories/**`) không cần Token.
- Endpoint người dùng (`/api/v1/orders/**`, `/api/v1/me/**`) yêu cầu `ROLE_CUSTOMER` hoặc `ROLE_ADMIN` — lưu ý DB lưu `role_name` là `CUSTOMER`/`ADMIN` (không có tiền tố `ROLE_`); tiền tố `ROLE_` chỉ thêm khi build `GrantedAuthority` cho Spring Security.
- Endpoint quản trị (`/api/v1/admin/**`) yêu cầu bắt buộc `ROLE_ADMIN`.

## 4. Quy tắc Xử lý Lỗi (Exception Handling)
- Sử dụng `@RestControllerAdvice` trong `exception/GlobalExceptionHandler.java`.
- Tạo các Custom Exception đơn giản như `ResourceNotFoundException`, `BadRequestException`, `UnauthorizedException`.
- Bắt lỗi `@Valid` (`MethodArgumentNotValidException`) và trả về chi tiết các field bị lỗi rõ ràng.

## 5. Những điều CẤM trong Backend
- ❌ Không dùng CQRS, Event Sourcing, Domain-Driven Design (DDD).
- ❌ Không tự viết SQL thuần rườm rà khi Spring Data JPA đã hỗ trợ method chuẩn.
- ❌ Không tạo các service/component trung gian không cần thiết.
- ❌ Không để lọt ngoại lệ (Uncaught Exception) ra phía client mà không qua `GlobalExceptionHandler`.
