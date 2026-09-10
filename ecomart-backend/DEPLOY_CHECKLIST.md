# Checklist Deploy EcoMart Backend lên Render

Dùng file này để đánh dấu từng thao tác. Khi hoàn thành 100% thì deploy thành công.

---

## Bước 1: Code production-ready (đã làm)

| # | Thao tác | Trạng thái |
|---|---|---|
| 1.1 | Thêm `spring-boot-starter-actuator` vào `pom.xml` | [x] |
| 1.2 | Tạo `src/main/resources/application-prod.yml` | [x] |
| 1.3 | Sửa `SecurityConfig.java`: permitAll `/actuator/health` | [x] |

**Cách verify**: 
```powershell
git status --short
```
Kỳ vọng thấy:
- `M pom.xml`
- `M src/main/java/com/ecomart/config/SecurityConfig.java`
- `?? src/main/resources/application-prod.yml`

---

## Bước 2: Flyway migrations (đã làm)

| # | Thao tác | Trạng thái |
|---|---|---|
| 2.1 | Thêm `flyway-core` + `flyway-database-postgresql` vào `pom.xml` | [x] |
| 2.2 | Tạo `src/main/resources/db/migration/V1__baseline.sql` | [x] |
| 2.3 | Cấu hình `flyway.baseline-on-migrate: true` trong prod yml | [x] |

**Cách verify**:
```powershell
Test-Path src\main\resources\db\migration\V1__baseline.sql
```
Kỳ vọng: `True`

---

## Bước 3: Render Blueprint + Dockerfile tối ưu (đã làm)

| # | Thao tác | Trạng thái |
|---|---|---|
| 3.1 | Sửa `Dockerfile`: cache Maven deps layer | [x] |
| 3.2 | Sửa `Dockerfile`: thêm `JAVA_OPTS` cho Render 512MB RAM | [x] |
| 3.3 | Tạo `render.yaml` (Web Service free, Singapore, health check `/actuator/health`) | [x] |
| 3.4 | Sửa `.dockerignore`: loại `render.yaml`, `.github` | [x] |

**Cách verify**:
```powershell
Test-Path render.yaml
Test-Path DEPLOY_RENDER.md
```
Kỳ vọng: cả 2 = `True`

---

## Bước 4: Setup Supabase Postgres (THAO TÁC TAY)

| # | Thao tác | Trạng thái |
|---|---|---|
| 4.1 | Tạo Supabase project tên `ecomart-db` region Singapore | [ ] |
| 4.2 | Lưu Database Password an toàn (sẽ dùng làm `SPRING_DATASOURCE_PASSWORD`) | [ ] |
| 4.3 | Vào Project Settings → Database → Connection string → tab URI | [ ] |
| 4.4 | Copy URI, thay password, convert sang JDBC: `jdbc:postgresql://...?sslmode=require` | [ ] |
| 4.5 | Ghi lại 3 giá trị: URL, USERNAME=`postgres`, PASSWORD | [ ] |

**Cách verify**: mở Supabase Dashboard → Table Editor (sẽ rỗng lúc này, OK).

---

## Bước 5: Deploy lên Render (THAO TÁC TAY)

| # | Thao tác | Trạng thái |
|---|---|---|
| 5.1 | `git add -A && git commit -m "..."` trong folder `ecomart-backend` | [ ] |
| 5.2 | `git push origin main` lên GitHub | [ ] |
| 5.3 | Render Dashboard → **New +** → **Blueprint** | [ ] |
| 5.4 | Connect GitHub repo `EcoMart`, chọn branch `main` | [ ] |
| 5.5 | Bấm **Apply** → Render đọc `render.yaml` → tạo service | [ ] |
| 5.6 | Vào **Environment** → điền 14 biến từ bảng dưới | [ ] |
| 5.7 | Bấm **Save Changes** → đợi redeploy ~5-8 phút | [ ] |
| 5.8 | Vào **Logs** → thấy `Started EcomartBackendApplication` | [ ] |

### Biến môi trường cần điền (Render Dashboard):

| Key | Value nguồn |
|---|---|
| `SPRING_DATASOURCE_URL` | từ bước 4.4 |
| `SPRING_DATASOURCE_USERNAME` | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | từ bước 4.2 |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` (lần đầu) |
| `APP_JWT_SECRET` | `openssl rand -base64 64` (chạy trên máy local) |
| `MAIL_USERNAME` | địa chỉ Gmail gửi OTP |
| `MAIL_PASSWORD` | Google App Password 16 ký tự (bật 2FA) |
| `VNPAY_TMN_CODE` | sandbox hoặc prod |
| `VNPAY_HASH_SECRET` | sandbox hoặc prod |
| `VNPAY_RETURN_URL` | `https://<frontend-domain>/payment/vnpay/return` |
| `SEPAY_API_KEY` | sepay dashboard |
| `SEPAY_ACCOUNT_NUMBER` | số tài khoản thật |
| `APP_CORS_ALLOWED_ORIGIN_PATTERNS` | domain Vercel (VD: `https://ecomart.vercel.app`) |

---

## Bước 6: Verify sau deploy (THAO TÁC TAY)

| # | Test | URL | Kỳ vọng | Trạng thái |
|---|---|---|---|---|
| 6.1 | Health check | `https://ecomart-backend.onrender.com/actuator/health` | `{"status":"UP"}` | [ ] |
| 6.2 | Swagger UI | `https://ecomart-backend.onrender.com/swagger-ui.html` | Load UI thành công | [ ] |
| 6.3 | API public | `GET /api/v1/products` | `200 OK` + `[]` hoặc data | [ ] |
| 6.4 | DB schema | Mở Supabase → Table Editor | Thấy 25 bảng (users, products, ...) | [ ] |
| 6.5 | OpenAPI docs | `/v3/api-docs` | JSON spec trả về | [ ] |

---

## Bước 7: Keep awake (THAO TÁC TAY — optional nhưng khuyến nghị)

| # | Thao tác | Trạng thái |
|---|---|---|
| 7.1 | Đăng ký https://uptimerobot.com (free) | [ ] |
| 7.2 | Add New Monitor: HTTP(s), URL = `https://ecomart-backend.onrender.com/actuator/health` | [ ] |
| 7.3 | Interval = 14 minutes | [ ] |
| 7.4 | Verify monitor UP sau 5 phút | [ ] |

---

## Bước 8: Sau khi deploy ổn định (cleanup)

| # | Thao tác | Trạng thái |
|---|---|---|
| 8.1 | Đổi `SPRING_JPA_HIBERNATE_DDL_AUTO` từ `update` → `validate` | [ ] |
| 8.2 | Redeploy, kiểm tra app vẫn boot OK | [ ] |
| 8.3 | Commit final + push | [ ] |

---

## Tiến độ tổng

- [ ] Bước 1 (Code)
- [ ] Bước 2 (Flyway)
- [ ] Bước 3 (Render Blueprint)
- [ ] Bước 4 (Supabase)
- [ ] Bước 5 (Deploy Render)
- [ ] Bước 6 (Verify)
- [ ] Bước 7 (Keep awake)
- [ ] Bước 8 (Cleanup)

**Hoàn thành 8/8 = production-ready**.
