# Deploy EcoMart Backend lên Render (Free) + Supabase Postgres

Hướng dẫn triển khai Web Service trên Render (free tier) với Supabase Postgres làm database production. Tài liệu giả định người thực hiện đã có tài khoản GitHub, Render, Supabase và tài khoản Gmail (bật 2FA để tạo App Password).

---

## 1. Chuẩn bị môi trường

| Tool | Vai trò |
|---|---|
| GitHub | Source code repo, Render pull image từ đây |
| Supabase | Managed Postgres (500MB free tier, không expire) |
| Render | Host Spring Boot Web Service (free plan, 512MB RAM) |
| UptimeRobot | Ping health endpoint mỗi 14 phút để giữ service awake |

Lưu ý về giới hạn Render Free:
- Web Service sleep sau 15 phút không có traffic → cold start 30-50s ở request đầu.
- Postgres mặc định của Render chỉ free 90 ngày → tài liệu này dùng Supabase thay thế.

---

## 2. Tạo Supabase Postgres

### 2.1 — Tạo project
1. Mở https://supabase.com → đăng nhập → **New Project**.
2. Điền:
   - **Name**: `ecomart-db`
   - **Database Password**: password mạnh (lưu lại nơi an toàn, dùng làm `SPRING_DATASOURCE_PASSWORD`).
   - **Region**: `Southeast Asia (Singapore)`.
3. Bấm **Create new project** → chờ provision (~2 phút).

### 2.2 — Lấy Connection String
1. Vào **Project Settings** (icon bánh răng) → **Database** → mục **Connection string** → tab **URI**.
2. Copy URI có dạng:
   ```
   postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
3. Thay `[YOUR-PASSWORD]` bằng password đã tạo ở 2.1.
4. Convert sang JDBC URL:
   - Đổi prefix `postgresql://` → `jdbc:postgresql://`
   - Thêm `?sslmode=require` cuối URL

   Kết quả:
   ```
   jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```
5. Ghi lại 3 giá trị:
   - `SPRING_DATASOURCE_URL` (chuỗi JDBC ở trên)
   - `SPRING_DATASOURCE_USERNAME` = `postgres`
   - `SPRING_DATASOURCE_PASSWORD` = password

### 2.3 — Direct connection thay Pooler
Nếu dùng Direct connection (port `5432`) thay Pooler (port `6543`):
- Hostname: `db.<project-ref>.supabase.co`
- USERNAME và PASSWORD giữ nguyên

### 2.4 — Network access
Supabase cho phép mọi IP mặc định. Kiểm tra tại **Database** → **Network bans** nếu kết nối bị từ chối.

---

## 3. Chuẩn bị code

Repo đã có sẵn các file cần thiết:
- `Dockerfile` (multi-stage, Maven cache layer)
- `render.yaml` ở thư mục gốc repo (Blueprint)
- `src/main/resources/application-prod.yml` (prod profile)
- `src/main/resources/db/migration/V1__baseline.sql` (Flyway baseline)
- `pom.xml` (actuator + flyway deps)

### 3.1 — Generate JWT secret
Chạy trên máy local:
```bash
openssl rand -base64 64
```
Kết quả dùng làm `APP_JWT_SECRET`. Tối thiểu 64 ký tự, không dùng giá trị mặc định trong code.

### 3.2 — Push code lên GitHub
```bash
git add -A
git commit -m "feat(deploy): your commit message"
git push origin dev
```

---

## 4. Tạo Web Service trên Render

### 4.1 — Khởi tạo Blueprint
1. Mở https://dashboard.render.com → đăng nhập.
2. Bấm **New +** → **Blueprint**.
3. Kết nối GitHub repo monorepo `EcoMart` (nếu chưa → **Configure account**).
4. Chọn branch: `main`.
5. Render đọc `render.yaml` → hiển thị service `ecomart-backend` → bấm **Apply**.

Service mặc định:
- Plan: Free
- Region: Singapore
- Runtime: Docker (tự build từ Dockerfile)

### 4.2 — Set biến môi trường
Vào service `ecomart-backend` → **Environment** → thêm/sửa các biến:

| Key | Value | Nguồn |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` | set thẳng |
| `SERVER_PORT` | `8081` | set thẳng |
| `SPRING_DATASOURCE_URL` | JDBC URL từ mục 2.2 | Supabase |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | Supabase |
| `SPRING_DATASOURCE_PASSWORD` | password | Supabase |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` | lần đầu để JPA tạo schema |
| `APP_JWT_SECRET` | output `openssl rand` | local |
| `APP_JWT_EXPIRATION_MS` | `86400000` | set thẳng |
| `MAIL_USERNAME` | địa chỉ Gmail gửi OTP | tài khoản Gmail |
| `MAIL_PASSWORD` | App Password 16 ký tự (bật 2FA) | Google Account → Security |
| `VNPAY_TMN_CODE` | sandbox hoặc prod | VNPay |
| `VNPAY_HASH_SECRET` | sandbox hoặc prod | VNPay |
| `VNPAY_PAY_URL` | `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html` | set thẳng |
| `VNPAY_RETURN_URL` | `https://<frontend-domain>/payment/vnpay/return` | frontend domain |
| `SEPAY_API_KEY` | sepay key | SePay |
| `SEPAY_ACCOUNT_NUMBER` | số tài khoản | SePay |
| `SEPAY_BANK` | `970415` | set thẳng |
| `APP_CORS_ALLOWED_ORIGIN_PATTERNS` | `https://<frontend-domain>.vercel.app` | domain Vercel, comma-separated |

Bấm **Save Changes** → Render tự động redeploy.

### 4.3 — Theo dõi build
1. Vào tab **Logs** → xem build progress.
2. Build lần đầu ~5-8 phút (Maven download dependencies).
3. Thành công khi log hiển thị `Started EcomartBackendApplication` trong vài giây không crash.

---

## 5. Verify triển khai

### 5.1 — Health check
```
GET https://<service-name>.onrender.com/actuator/health
```
Response kỳ vọng:
```json
{"status":"UP"}
```

### 5.2 — Swagger UI
```
https://<service-name>.onrender.com/swagger-ui.html
```
Kỳ vọng: load UI với danh sách endpoints.

### 5.3 — API public
```
GET https://<service-name>.onrender.com/api/v1/products
```
Kỳ vọng: `200 OK` + JSON array (rỗng nếu chưa seed data).

### 5.4 — Database schema
1. Mở Supabase → **Table Editor**.
2. Kỳ vọng thấy ~25 bảng: `users`, `products`, `categories`, `orders`, `cart`, `carts`, `reviews`, `addresses`, `payments`, ...
3. Nếu không thấy → đợi 1-2 phút (JPA cần thời gian tạo bảng lần đầu) rồi refresh.

### 5.5 — Flyway baseline
Vào Supabase → **SQL Editor** → chạy:
```sql
SELECT * FROM flyway_schema_history;
```
Kỳ vọng: 1 row với `version=1`, `description=baseline`, `success=true`.

---

## 6. Keep-awake với UptimeRobot

Render Free sleep service sau 15 phút không có traffic. Ping health endpoint mỗi 14 phút để giữ awake.

1. Đăng ký tại https://uptimerobot.com (free tier).
2. **Add New Monitor**:
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `EcoMart Backend Health`
   - **URL**: `https://<service-name>.onrender.com/actuator/health`
   - **Monitoring Interval**: `14 minutes`
3. Bấm **Create Monitor**.
4. Monitor sẽ ping tự động mỗi 14 phút → service không sleep.

---

## 7. Hardening sau khi ổn định

### 7.1 — Chuyển sang ddl-auto=validate
Sau lần deploy đầu tiên (schema đã được JPA tạo):
1. Render Dashboard → **Environment** → đổi `SPRING_JPA_HIBERNATE_DDL_AUTO` từ `update` → `validate`.
2. **Save Changes** → redeploy.
3. App chỉ verify schema khớp entity, không tự ý thay đổi. Migration sau này phải qua Flyway `V2__...`.

### 7.2 — Custom domain (optional)
1. Render Dashboard → service → **Settings** → **Custom Domain**.
2. Thêm `api.<domain>` → copy CNAME target.
3. Tạo CNAME record tại DNS provider.
4. Render tự cấp SSL sau khi DNS propagate (5-30 phút).

### 7.3 — Backup database
- Supabase free tier có auto backup hàng ngày, retention 7 ngày.
- Production: nâng cấp lên Pro ($25/mo) để retention 30 ngày + point-in-time recovery.

---

## 8. Troubleshooting

| Triệu chứng | Nguyên nhân | Cách xử lý |
|---|---|---|
| `FATAL: password authentication failed` | Sai `SPRING_DATASOURCE_PASSWORD` | Lấy lại từ Supabase Project Settings → Database |
| `SSL error` khi connect Postgres | JDBC URL thiếu `?sslmode=require` | Sửa URL, thêm query param |
| `Schema-validation: missing table [xxx]` | DB chưa có schema, đang ở `ddl-auto=validate` | Tạm đổi về `update`, redeploy, sau đó đổi lại `validate` |
| Cold start 30-50s | Render Free tắt service khi không có traffic | Setup UptimeRobot như mục 6 |
| `Connection refused` tới Postgres | Sai host/port | Kiểm tra Connection string từ Supabase. Pooler (6543) vs Direct (5432) |
| Email không gửi | Chưa set MAIL_* hoặc dùng mật khẩu thường | Tạo Google App Password (2FA), điền vào MAIL_USERNAME/MAIL_PASSWORD |
| Build fail với OOM | Maven cần > 512MB RAM trong build | Render free plan giới hạn 512MB; cân nhắc nâng cấp Starter ($7/mo) |
| App crash sau khi start | Thiếu biến môi trường | Check tab **Logs** trên Render, tìm `null` hoặc `Could not resolve placeholder` |
| Disk không persistent | Render Free không lưu file sau restart | Upload ảnh/file phải dùng S3/Cloudinary, không lưu local |

---

## 9. Cấu trúc file triển khai

```
ecomart-backend/
├── Dockerfile                              # Multi-stage build, cache Maven deps
├── render.yaml                             # Render Blueprint ở ROOT repo (xem /render.yaml), free plan Singapore
├── .dockerignore                           # Loại bỏ file không cần trong build context
├── src/main/resources/
│   ├── application.yml                     # Default profile (local dev)
│   ├── application-docker.yml              # Profile cho docker-compose
│   ├── application-prod.yml                # Profile cho Render (prod)
│   └── db/migration/
│       └── V1__baseline.sql                # Flyway baseline marker
└── pom.xml                                 # Thêm actuator + flyway deps
```

---

## 10. Tham khảo

- Render Docs: https://docs.render.com
- Supabase Docs: https://supabase.com/docs
- Spring Boot Actuator: https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html
- Flyway: https://documentation.red-gate.com/fd
- UptimeRobot: https://uptimerobot.com
