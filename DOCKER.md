# 🐳 Hướng dẫn chạy EcoMart bằng Docker (Full Stack)

Dự án được container hóa với **3 service** trong [`docker-compose.yml`](docker-compose.yml) ở **thư mục gốc**:

| Service | Container | Mô tả | Port |
|---|---|---|---|
| `postgres` | `ecomart-postgres` | PostgreSQL 16, dữ liệu lưu trong volume `postgres_data` | `5432` |
| `backend` | `ecomart-backend` | Spring Boot API (build từ [`ecomart-backend/Dockerfile`](ecomart-backend/Dockerfile)) | `8081` |
| `frontend` | `ecomart-frontend` | React SPA phục vụ bằng Nginx (build từ [`ecomart-frontend/Dockerfile`](ecomart-frontend/Dockerfile)) | `3000 → 80` |

```
┌──────────────────────── Docker Compose ────────────────────────┐
│                                                                │
│  ┌────────────┐     ┌───────────┐ JDBC  ┌──────────┐           │
│  │  frontend  │────▶│  backend  │──────▶│ postgres │           │
│  │ :3000→80   │ API │  :8081    │ 5432  │  :5432   │           │
│  └────────────┘     └───────────┘       └──────────┘           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## ✅ Yêu cầu

- **Docker Desktop** (Windows/Mac) hoặc Docker Engine + Docker Compose plugin (Linux).
- Kiểm tra nhanh:

```bash
docker --version
docker compose version
```

---

## 🚀 Chạy nhanh

```bash
# 1. Tạo file môi trường từ template (chỉ cần làm 1 lần)
cp .env.example .env
#    → Mở .env và điền: DB password, APP_JWT_SECRET, RESEND_API_KEY, VNPAY_*, SEPAY_*

# 2. Khởi động toàn bộ stack (build lần đầu sẽ lâu do Maven tải dependencies)
docker compose up -d --build
```

Compose sẽ:

1. Khởi động PostgreSQL → chờ **healthy**.
2. Build image backend → khởi động với biến môi trường nạp từ `.env` gốc (`env_file: ./.env`) + override datasource về host `postgres`.
3. Build image frontend (Vite build + Nginx) → reverse proxy `/api` về backend.

Sau khi chạy, truy cập:

| Gì | URL |
|---|---|
| 🌐 Web App | <http://localhost:3000> |
| 🔌 REST API | <http://localhost:8081> |
| 📄 Swagger UI | <http://localhost:8081/swagger-ui.html> |
| 📜 OpenAPI Spec (JSON) | <http://localhost:8081/v3/api-docs> |

> 🔑 Tài khoản admin mặc định: `admin@ecomart.com` / `Admin123!` *(seed tự động khi khởi động)*.

---

## 🧰 Các lệnh Docker hữu ích

```bash
# Xem trạng thái các container
docker compose ps

# Xem log (theo dõi liên tục)
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Dừng toàn bộ stack (giữ nguyên dữ liệu trong volume)
docker compose down

# Dừng và XÓA luôn volume dữ liệu (⚠️ mất toàn bộ data)
docker compose down -v

# Rebuild lại image sau khi sửa code
docker compose up -d --build backend
docker compose up -d --build frontend

# Restart một service
docker compose restart backend

# Vào shell của container postgres
docker compose exec postgres psql -U postgres -d ecomart_db
```

---

## ⚙️ Cấu hình qua file `.env`

Toàn bộ cấu hình nằm trong file `.env` tại **thư mục gốc dự án** (đã được `.gitignore` loại trừ — không bao giờ commit). Template đầy đủ xem [.env.example](.env.example), gồm cả biến frontend:

```env
# ── Backend (Spring Boot) ──
SERVER_PORT=8081
SPRING_DATASOURCE_PASSWORD=your_database_password
APP_JWT_SECRET=your_jwt_secret_key_at_least_256_bits_long
RESEND_API_KEY=...
VNPAY_TMN_CODE=... / VNPAY_HASH_SECRET=...
SEPAY_API_KEY=...

# ── Frontend (Vite) ──
VITE_API_BASE_URL=http://localhost:8081/api/v1
```

> ⚠️ Khi chạy full stack qua Compose, `SPRING_DATASOURCE_URL/USERNAME/PASSWORD` bị override cứng trong `docker-compose.yml` để trỏ về container `postgres` — giá trị trong `.env` chỉ có tác dụng khi chạy backend thủ công ngoài Docker.

> 🔑 Nên đổi `APP_JWT_SECRET` dài (>= 32 bytes) trước khi deploy thật!

Sau khi đổi cấu hình, chạy lại:

```bash
docker compose up -d
```

---

## 🩺 Xử lý sự cố thường gặp

| Vấn đề | Cách xử lý |
|---|---|
| **Lỗi port `3000`/`8081`/`5432` đã bị chiếm** | Đổi mapping port trong `docker-compose.yml`, rồi `docker compose up -d` |
| **Backend crash vì không kết nối được DB** | `docker compose logs backend` → đảm bảo `postgres` healthy trước (`docker compose ps`) |
| **Thay đổi code không phản ánh khi up lại** | `docker compose up -d --build backend` (hoặc thêm `--no-cache` nếu cần build sạch) |
| **Lần build đầu quá lâu** | Bình thường — Maven phải tải dependencies. Các lần sau nhanh nhờ layer cache |
| **Muốn xóa dữ liệu DB, chạy lại từ đầu** | `docker compose down -v && docker compose up -d --build` |

---

## 🏗️ Các file Docker trong dự án

| File | Vai trò |
|---|---|
| [`docker-compose.yml`](docker-compose.yml) | Định nghĩa 3 service `postgres` + `backend` + `frontend`, healthcheck, volume, network (**duy nhất**, không còn compose riêng trong thư mục con) |
| [`ecomart-backend/Dockerfile`](ecomart-backend/Dockerfile) | Multi-stage build: Maven build JAR (layer cache) → JRE gọn nhẹ, chạy non-root user |
| [`ecomart-backend/.dockerignore`](ecomart-backend/.dockerignore) | Loại trừ `target/`, `.git`, `.env`, IDE files... khỏi build context |
| [`ecomart-frontend/Dockerfile`](ecomart-frontend/Dockerfile) | Build React SPA bằng Vite rồi phục vụ qua Nginx |
| [`ecomart-frontend/nginx.conf`](ecomart-frontend/nginx.conf) | Cấu hình Nginx cho SPA routing + proxy API |
