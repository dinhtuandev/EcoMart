# 🌿 EcoMart — Nền tảng Thương mại Điện tử Xanh & Tiêu dùng Bền vững

**EcoMart** là hệ thống sàn thương mại điện tử B2C chuyên kinh doanh các dòng sản phẩm thân thiện với môi trường, hỗ trợ người tiêu dùng tiếp cận lối sống xanh bền vững thông qua đánh giá chỉ số sinh thái (**Eco-Score 1-5 sao**), chứng nhận nhãn xanh, giỏ hàng trực tuyến, thanh toán đa phương thức (**COD**, **VNPay Sandbox**, **SePay VietQR Napas 247**), và xác thực bảo mật OTP qua **Gmail SMTP**.

---

## 🏗️ Cấu trúc Dự án

```text
EcoMart/
├── docs/                            # Tài liệu dự án: BA, ERD, API spec, wireframes
│   ├── 01_EcoMart_Business_Analysis.md
│   ├── 02_EcoMart_Diagrams.md
│   ├── 03_EcoMart_ERD.md
│   ├── 04_EcoMart_database_design.md
│   ├── 05_EcoMart_API_Specification.md
│   ├── 06_EcoMart_Wireframe_Specification.md
│   ├── 07_EcoMart_Frontend_Module_Checklist.md
│   └── diagrams/                    # Nguồn diagram Mermaid
│       ├── activity/                # Sơ đồ hoạt động — luồng nghiệp vụ (đăng ký OTP, thanh toán…)
│       ├── sequence/                # Sơ đồ tuần tự — tương tác API giữa actor, frontend & backend
│       └── state/                   # Sơ đồ trạng thái — vòng đời entity (trạng thái đơn/thanh toán)
├── ecomart-backend/                 # Backend RESTful API monolith (Spring Boot 3.3.x, Java 17)
│   ├── src/main/java/com/ecomart/
│   │   ├── config/                  # Cấu hình Spring: security, CORS, OpenAPI, khai báo bean
│   │   ├── controller/              # REST controller — endpoint API theo từng tài nguyên
│   │   ├── dto/
│   │   │   ├── request/             # Đối tượng nhận dữ liệu đầu vào (kèm Bean Validation)
│   │   │   └── response/            # Đối tượng trả dữ liệu ra cho client
│   │   ├── entity/                  # Thực thể JPA ánh xạ tới bảng trong database
│   │   │   └── enums/               # Enum dùng bởi entity (trạng thái đơn, phương thức thanh toán…)
│   │   ├── exception/               # Exception nghiệp vụ riêng + trình xử lý lỗi toàn cục
│   │   ├── repository/              # Repository Spring Data JPA (tầng truy cập dữ liệu)
│   │   ├── security/                # JWT provider, bộ lọc xác thực, user principal
│   │   ├── service/                 # Interface nghiệp vụ (business logic)
│   │   │   └── impl/                # Lớp hiện thực cụ thể của service
│   │   ├── specification/           # JPA Specification — lọc/truy vấn động và phân trang
│   │   └── util/                    # Lớp tiện ích (mapper, sinh dữ liệu…)
│   ├── src/main/resources/          # Cấu hình application.yml, asset tĩnh, template email
│   ├── src/test/                    # Test đơn vị & tích hợp (controller, repository, service, util)
│   ├── Dockerfile                   # Build image backend (multi-stage: Maven → JRE 17)
│   ├── .env.example                 # Mẫu biến môi trường (copy thành .env để dùng)
│   └── pom.xml                      # Khai báo dependencies Maven
├── ecomart-database/                # Schema DDL SQL, mỗi engine database một thư mục
│   ├── postgresql/                  # Script schema PostgreSQL 15+ (engine mặc định docker-compose)
│   └── sqlserver/                   # Script schema SQL Server 2019+ (phương án thay thế cho team)
├── ecomart-frontend/                # Frontend SPA (React 18 + Vite + TypeScript + TailwindCSS)
│   ├── index.html                   # HTML khung gốc duy nhất, nạp React App vào #root
│   ├── package.json · vite.config.ts · tailwind.config.js   # Cấu hình dependencies & build
│   ├── Dockerfile · nginx.conf · vercel.json                # Đóng gói Docker & deploy Vercel
│   ├── README.md                    # Mô tả chi tiết từng file/thư mục của frontend
│   ├── public/                      # Tài nguyên tĩnh phục vụ trực tiếp (favicon.svg…)
│   └── src/
│       ├── assets/                  # Tài nguyên tĩnh của app
│       │   ├── css/index.css        # CSS duy nhất (import các layer Tailwind)
│       │   ├── images/              # Hình ảnh dự án (logo, banner, eco-badge…)
│       │   └── fonts/               # Font chữ hệ thống
│       ├── components/              # Component UI tái sử dụng, nhóm theo domain nghiệp vụ
│       │   ├── address/ auth/ brand/
│       │   ├── category/ certification/ payment/ product/     # → component theo tính năng
│       │   ├── layout/              # Thành phần bố cục trang (header, footer, điều hướng)
│       │   └── ui/                  # Nền tảng UI gốc (Button, Input, Modal, Toast, Badge…)
│       ├── context/                 # React Context quản lý state: CartContext, ToastContext
│       ├── hooks/                   # Custom hook — lấy dữ liệu public (thương hiệu, danh mục…)
│       ├── lib/                     # Thiết lập client lõi: instance Axios + interceptor
│       ├── pages/                   # Component cấp route (màn hình phía khách hàng)
│       │   └── admin/               # Trang dashboard quản trị (sản phẩm, đơn hàng, báo cáo…)
│       ├── providers/               # AuthProvider — state xác thực toàn cục (useReducer + Context)
│       ├── routes/                  # Định nghĩa router (AppRoutes) & chặn route (ProtectedRoute)
│       ├── services/                # Module gọi API — mỗi file phụ trách một tài nguyên backend
│       ├── types/                   # Định nghĩa type/interface TypeScript dùng chung
│       └── utils/                   # Tiện ích: hằng số, hàm format (tiền tệ, ngày tháng…)
├── docker-compose.yml               # Orchestration chạy local: postgres + backend + frontend/nginx
├── render.yaml                      # Blueprint deploy backend lên Render
├── .gitignore                       # Loại trừ .env, node_modules, build artifacts, IDE…
└── README.md                        # Tài liệu bạn đang đọc
```

---

## 🚀 Tech Stack

| Layer                | Công nghệ                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------- |
| **Backend**          | Java 17, Spring Boot 3.3.x, Spring Security 6 (Stateless JWT), Spring Data JPA, Hibernate |
| **Database**         | PostgreSQL 15 (mặc định docker-compose, port 5432)                                        |
| **Frontend**         | React 18, Vite, TypeScript, TailwindCSS, React Router v6, Axios                           |
| **State Management** | React Context API (`AuthContext`, `CartContext`, `ToastContext`)                          |
| **Email**            | Gmail SMTP (OTP xác thực email & đặt lại mật khẩu; dev fallback ghi OTP vào log)          |
| **Thanh toán**       | COD, VNPay Sandbox (HMAC-SHA512 IPN), SePay VietQR Napas 247 (Webhook)                    |
| **Container**        | Docker Compose (postgres + backend + frontend/nginx)                                      |

---

## 👥 Vai trò & Phân quyền Nghiệp vụ (Roles & Permissions)

Hệ thống được thiết kế và phân định rạch ròi giữa các vai trò nhằm phản ánh đúng mô hình vận hành thực tế của một sàn thương mại điện tử sinh thái:

### 1. 👤 Khách hàng (Customer)
* **Khám phá & Trải nghiệm:** Tìm kiếm sản phẩm xanh, lọc đa chiều theo danh mục, thương hiệu, chứng nhận sinh thái và chỉ số **Eco-Score (1-5 sao)**.
* **Giỏ hàng & Đặt hàng:** Quản lý giỏ hàng trực tuyến, thanh toán đa phương thức qua **COD**, **VNPay Sandbox**, và **SePay VietQR Napas 247**.
* **Hồ sơ & Hậu mãi:** Quản lý sổ địa chỉ nhận hàng, theo dõi hành trình đơn hàng, hủy đơn khi chưa duyệt (`PENDING`), đánh giá sao và nhận xét về sản phẩm đã mua.

### 2. 🧑‍💼 Quản lý Vận hành & Kinh doanh (Manager)
* **Quản lý Hàng hóa xanh:** Toàn quyền thêm/sửa/xóa sản phẩm, thẩm định chỉ số **Eco-Score**, gắn nhãn chứng nhận sinh thái (FSC, Organic...), quản lý cây danh mục và thương hiệu đối tác.
* **Vận hành Kho & Tồn hàng:** Theo dõi số lượng tồn kho thời gian thực, nhập kho bổ sung hàng loạt, tiếp nhận và xử lý cảnh báo sắp hết hàng (`Low Stock`) và hết hàng (`Out of Stock`).
* **Xử lý Đơn hàng & Giao vận:** Tiếp nhận đơn hàng, duyệt đơn (`CONFIRMED`), chuyển giao shipper (`SHIPPING`), hoàn tất (`DELIVERED`) hoặc hủy đơn; đối soát trạng thái thanh toán (tiền mặt COD, chuyển khoản).
* **Dịch vụ Khách hàng & Nội dung:** Kiểm duyệt và ẩn/hiện đánh giá của người mua; tiếp nhận và phản hồi thư liên hệ; cập nhật thông tin liên hệ cửa hàng (Hotline, Email CSKH, Địa chỉ, Google Maps); trực tiếp soạn thảo và biên tập các bài viết chính sách (Đổi trả, Bảo hành, Vận chuyển xanh, Giới thiệu sàn).
* **Phân tích Kinh doanh:** Theo dõi 12 báo cáo chuyên sâu (Doanh thu theo thời gian, Top sản phẩm bán chạy, Tỷ trọng danh mục/thương hiệu, Cơ cấu thanh toán, Khách hàng VIP, và Tác động sinh thái Eco-Impact).

### 3. 👨‍💻 Quản trị viên Hệ thống & Bảo mật (Admin)
* **Quản trị Tài khoản:** Quản lý danh sách người dùng và khóa/mở khóa tài khoản khi phát hiện vi phạm. Source hiện chưa cung cấp API cấp/thu hồi quyền `MANAGER`.
* **Cấu hình cửa hàng:** Cập nhật Hotline, Email CSKH, địa chỉ và Google Maps. Secrets cổng thanh toán, SMTP và OAuth được cấu hình bằng biến môi trường, không quản lý trong UI/API.
* **Giám sát Nền tảng:** Giám sát trạng thái hoạt động (Healthcheck) của các dịch vụ, quản lý sao lưu dữ liệu (Database Backup) và bảo trì an toàn thông tin hệ thống.

---

## 🚀 Hướng dẫn Khởi động Nhanh

### Với Docker Compose (khuyến nghị)

**Yêu cầu**: [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) hoặc Docker Engine + Compose plugin (Linux). Kiểm tra nhanh:

```bash
docker --version
docker compose version
```

#### Bước 1 — Tạo file cấu hình môi trường (.env)

Thêm các file `.env` vào thư mục `ecomart-backend` và `ecomart-frontend`:

- **Backend**: Thêm file `ecomart-backend/.env`
- **Frontend**: Thêm file `ecomart-frontend/.env`

#### Bước 2 — Build images & dựng containers

**Hiểu nhanh trước khi gõ lệnh:**

- **Image** = bản đóng gói sẵn (app + môi trường chạy). Dự án có 3 image:
  | Image | Nguồn | Bên trong |
  |---|---|---|
  | `postgres` | Tải sẵn từ Docker Hub (`postgres:16-alpine`) | Database PostgreSQL 16, không cần build |
  | Backend | **Tự build** từ [`ecomart-backend/Dockerfile`](ecomart-backend/Dockerfile) | Maven biên dịch code Java → file `app.jar` → đóng vào image JRE 17 gọn nhẹ |
  | Frontend | **Tự build** từ [`ecomart-frontend/Dockerfile`](ecomart-frontend/Dockerfile) | `npm ci` + `npm run build` ra bộ file tĩnh → đặt vào Nginx để serve |
- **Container** = thể hiện đang chạy của image. Compose sẽ tạo 3 container tên lần lượt: `ecomart-postgres`, `ecomart-backend`, `ecomart-frontend`.

**Một lệnh duy nhất để build image + tạo container + chạy tất cả:**

```bash
docker compose up -d --build
```

Lệnh này lần lượt làm các việc sau:

1. Đọc cấu hình từ `docker-compose.yml` ở thư mục gốc repo.
2. Build image backend từ thư mục `./ecomart-backend` (theo Dockerfile của nó).
3. Build image frontend từ thư mục `./ecomart-frontend`.
4. Tạo network nội bộ `ecomart-network` để 3 container gọi nhau theo tên service.
5. Chạy container `ecomart-postgres` trước, chờ healthcheck `pg_isready` báo khỏe.
6. Chạy `ecomart-backend` kết nối vào DB, mở port `8081` ra máy bạn.
7. Chạy `ecomart-frontend` (Nginx), mở port `3000`.

> ⏳ Lần build đầu hơi lâu (Maven tải dependencies + `npm ci`) — các lần sau nhanh hơn nhiều nhờ layer cache. Muốn theo dõi từng bước thì bỏ cờ `-d`: `docker compose up --build`.

**Muốn build riêng từng image (không chạy container):**

```bash
docker compose build backend     # chỉ build image backend
docker compose build frontend    # chỉ build image frontend
```

**Muốn dựng/chạy riêng một container** (ví dụ chỉ cần DB để code backend local):

```bash
docker compose up -d postgres    # chỉ tạo + chạy container postgres
```

Kiểm tra trạng thái bằng `docker compose ps` — cả 3 service phải ở trạng thái `running`/`healthy`. Xem image đã build xong: `docker images | findstr ecomart` (Windows) hoặc `| grep ecomart` (macOS/Linux).

#### Bước 3 — Chạy hằng ngày & Đường dẫn truy cập

Sau lần khởi tạo đầu tiên, mỗi lần mở máy muốn chạy dự án bạn **chỉ cần mở Docker Desktop và cho chạy các container** (hoặc gõ `docker compose up -d`), sau đó truy cập các đường dẫn:

| Service                | Port | URL                                   |
| ---------------------- | ---- | ------------------------------------- |
| Backend (Spring Boot)  | 8081 | http://localhost:8081                 |
| Frontend (React/Nginx) | 3000 | http://localhost:3000                 |
| PostgreSQL             | 5432 | localhost:5432                        |
| Swagger UI             | 8081 | http://localhost:8081/swagger-ui.html |
| OpenAPI Docs           | 8081 | http://localhost:8081/v3/api-docs     |

> ⚠️ **Lưu ý:** KHÔNG truy cập `http://localhost:8081/` (vì backend là REST API bảo mật JWT, đường dẫn gốc sẽ bị Spring Security chặn lỗi `403 Forbidden`).

#### Bước 4 — Lệnh hữu ích hằng ngày

```bash
docker compose logs -f backend            # Xem log backend liên tục (Ctrl+C để thoát)
docker compose ps                          # Trạng thái các container
docker compose restart backend             # Restart một service
docker compose up -d --build backend      # Rebuild + chạy lại sau khi sửa code
docker compose exec postgres psql -U postgres -d ecomart_db   # Vào shell PostgreSQL
```

#### Dừng & dọn dẹp

```bash
docker compose down        # Dừng mọi service, GIỮ nguyên dữ liệu trong volume
docker compose down -v     # ⚠️ Xóa cả volume — MẤT TOÀN BỘ dữ liệu database
```

#### Lỗi thường gặp

| Hiện tượng                            | Cách xử lý                                                                                   |
| ------------------------------------- | -------------------------------------------------------------------------------------------- |
| Port `8081`/`3000`/`5432` đã bị chiếm | Đổi mapping port bên trái trong `docker-compose.yml`                                         |
| Backend crash, không kết nối được DB  | `docker compose ps` xem `postgres` đã `healthy` chưa; xem thêm `docker compose logs backend` |
| Sửa code nhưng không thấy thay đổi    | Image cũ vẫn đang chạy — phải rebuild: `docker compose up -d --build <service>`              |
| Swagger trả 404 ngay sau khi up       | Backend chưa khởi động xong (~30–45s đầu), đợi rồi refresh                                   |
| Muốn xóa sạch data, chạy lại từ đầu   | `docker compose down -v && docker compose up -d --build`                                     |

Chi tiết chuyên sâu hơn về Docker của backend: [`ecomart-backend/docs/DOCKER.md`](ecomart-backend/docs/DOCKER.md).

### Khởi động thủ công

#### 1. Cài đặt PostgreSQL local (không dùng Docker)

Nếu không chạy qua Docker Compose, cài PostgreSQL trực tiếp bằng một trong các cách sau:

**Cách A — Installer chính thức (khuyên dùng cho Windows)**

- Tải tại [postgresql.org/download](https://www.postgresql.org/download/) — Windows dùng installer EDB.
- Khi cài: đặt mật khẩu user `postgres`, giữ port mặc định `5432`.

**Cách B — Qua trình quản lý gói**

```bash
# Windows (winget)
winget install PostgreSQL.PostgreSQL.16

# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Ubuntu / WSL2
sudo apt install postgresql-16
```

**Cách C — Dịch vụ cloud miễn phí (không cần cài máy)**

- [Neon](https://neon.tech), [Supabase](https://supabase.com) hoặc [Railway](https://railway.app) — tạo database rồi lấy connection string.
- Lưu ý: thay host trong `SPRING_DATASOURCE_URL` theo connection string cloud cung cấp (thường yêu cầu SSL).

Sau khi cài xong, tạo database cho dự án (bằng `psql` hoặc GUI như pgAdmin/DBeaver):

```sql
CREATE DATABASE ecomart_db;
```

Đảm bảo `ecomart-backend/.env` trỏ đúng:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/ecomart_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=<mật khẩu bạn đã đặt>
```

> 💡 Schema DDL nằm tại [`ecomart-database/postgresql/ecomart_schema_postgresql.sql`](ecomart-database/postgresql/ecomart_schema_postgresql.sql). Hibernate đang để `ddl-auto: update` nên bảng tự sinh khi chạy backend; script này dùng để khởi tạo thủ công/đối chiếu.

#### 2. Backend (`ecomart-backend`)

```powershell
cd ecomart-backend
cp .env.example .env
# Cấu hình .env với DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET, RESEND_API_KEY, VNPAY_*, SEPAY_*
./mvnw.cmd spring-boot:run
```

#### 3. Frontend (`ecomart-frontend`)

```powershell
cd ecomart-frontend
npm install
npm run dev
```

- **Web App**: http://localhost:5173 (Vite dev server)

---

## 🌍 Deployment

Kiến trúc triển khai production:

```text
GitHub repo
├── Frontend  → Vercel  (React/Vite SPA, CDN toàn cầu, HTTPS tự động)
└── Backend   → Render  (Docker runtime + PostgreSQL managed)
                     ▲
                     └── Browser gọi API trực tiếp qua VITE_API_BASE_URL (CORS đã mở qua env)
```

### Backend — Render

1. Push code lên GitHub.
2. Trên [Render Dashboard](https://dashboard.render.com): **New → Blueprint** → chọn repo → Render đọc tự động [`render.yaml`](render.yaml) ở thư mục gốc.
3. **Cấu hình database — chọn 1 trong 2:**

   **Option A — Render PostgreSQL (nhanh nhất, cùng dashboard)**
   - **New → PostgreSQL** (region `Singapore` cho độ trễ thấp tại VN).
   - Mở tab **Connections** → copy **External Database URL**, dạng `postgresql://user:password@host/dbname`.
   - ⚠️ Free tier chỉ sống **30 ngày** rồi bị xóa.

   **Option B — [Neon](https://neon.tech) (khuyên dùng nếu muốn free lâu dài)**
   - Tạo project → copy **Pooled connection** string, dạng:
     `postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require`
   - Free tier **không hết hạn** (0.5 GB storage), compute autosuspend sau ~5 phút idle nhưng cold start chỉ ~1s.
   - ⚠️ **Bắt buộc giữ `sslmode=require`** — Neon từ chối kết nối không mã hóa.

   Convert connection string sang định dạng JDBC và điền vào biến môi trường của backend service:

   | Biến                         | Option A (Render)               | Option B (Neon)                                                      |
   | ---------------------------- | ------------------------------- | -------------------------------------------------------------------- |
   | `SPRING_DATASOURCE_URL`      | `jdbc:postgresql://host/dbname` | `jdbc:postgresql://ep-xxx-pooler...neon.tech/dbname?sslmode=require` |
   | `SPRING_DATASOURCE_USERNAME` | `user`                          | `user`                                                               |
   | `SPRING_DATASOURCE_PASSWORD` | `password`                      | `password`                                                           |

   > 💡 Với Neon: nếu gặp lỗi prepared statement qua endpoint `-pooler` (PgBouncer transaction mode), thêm `&prepareThreshold=0` vào URL, hoặc dùng endpoint direct (bỏ `-pooler`) — đánh đổi là không tận dụng pooling của Neon.

4. Điền nốt biến CORS cho backend service:

   | Biến                               | Giá trị                            |
   | ---------------------------------- | ---------------------------------- |
   | `APP_CORS_ALLOWED_ORIGIN_PATTERNS` | `https://<ten-project>.vercel.app` |

5. `APP_JWT_SECRET` được **tự sinh ngẫu nhiên** lần deploy đầu (`generateValue` trong render.yaml) — không cần điền.
6. Deploy. Health check dùng `/v3/api-docs`; Swagger: `https://<service>.onrender.com/swagger-ui.html`.

> ⚠️ **Free tier của Render**: web service **ngủ sau 15 phút** không có request (request đầu sau đó chậm ~30–60s do cold start). Database nên dùng **Neon (Option B)** để tránh giới hạn 30 ngày của Render PostgreSQL free. Production thật nên nâng plan trả phí.

### Frontend — Vercel

1. Trên [Vercel Dashboard](https://vercel.com/new): **Import** repo GitHub.
2. Cấu hình project:
   - **Root Directory**: `ecomart-frontend`
   - Framework Preset: **Vite** (tự detect qua [`vercel.json`](ecomart-frontend/vercel.json))
3. Thêm biến môi trường trước khi deploy:

   | Biến                | Giá trị                                       |
   | ------------------- | --------------------------------------------- |
   | `VITE_API_BASE_URL` | `https://ecomart-backend.onrender.com/api/v1` |

4. Deploy → nhận domain `https://<ten-project>.vercel.app`.
5. Quay lại bước 4 phần Render, đảm bảo `APP_CORS_ALLOWED_ORIGIN_PATTERNS` chứa đúng domain này (Render sẽ redeploy khi đổi env).

> 💡 SPA routing đã xử lý sẵn trong `vercel.json` (rewrite mọi route về `index.html`). Lưu ý: giá trị `VITE_*` được **bake lúc build** — đổi biến môi trường trên Vercel sẽ trigger build lại tự động.

#### 🔐 Cấu hình Google Cloud Console cho OAuth2

`LoginPage.tsx` dùng redirect flow `response_type=token%20id_token` với `redirect_uri=${window.location.origin + '/login'}`. Cần whitelist trong **APIs & Services → Credentials → OAuth 2.0 Client IDs** của project Google.

**Authorized JavaScript origins** (nơi browser gọi tới Google):

```
http://localhost:5173                       # Vite dev (npm run dev)
http://localhost:3000                       # Docker local (HTTP)
https://<ten-project>.vercel.app            # Vercel production
```

**Authorized redirect URIs** (Google redirect user về sau khi consent):

```
http://localhost:5173/login
http://localhost:3000/login
https://<ten-project>.vercel.app/login
```

> Đăng ký tạo OAuth client **Web application** (không phải Desktop / Mobile), enable **Google Identity Services API** ở Library, OAuth consent screen chọn External + scope `openid email profile`. Credentials cần khai lên backend (xem `render.yaml`/`ecomart-backend/.env.example`).

---

## 🔐 Tài khoản mặc định (Seed Data)

| Vai trò | Email | Mật khẩu | Phạm vi trách nhiệm |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@ecomart.com` | `Admin123!` | Quản trị tài khoản, cấu hình thanh toán, bảo mật hệ thống & ghi nhận log hệ thống. |
| **Manager** | `manager@ecomart.com` | `Manager123!` | Quản lý sản phẩm xanh, duyệt đơn hàng, kho bãi, nội dung & CSKH. |
| **Customer** | `customer@ecomart.com` | `Customer123!` | Mua sắm, thanh toán, theo dõi đơn hàng & đánh giá sản phẩm. |

---

## 🧪 Trạng thái Kiểm thử & Chất lượng

- **Backend Unit & Integration Tests**: `./mvnw test` (`BUILD SUCCESS`).
- **Bảo mật & Rate Limiting**: Cooldown 60s, Rate Limiting 5 lần / 15 phút, Anti-Brute-Force OTP 5 lần.
- **Tài liệu**: Chuẩn hóa 100% trong thư mục [`docs/`](docs/) — phản ánh chính xác source code thực tế.

---

## 📚 Tài liệu

| File                                                                         | Nội dung                                                                                      |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [01_Business_Analysis](docs/01_EcoMart_Business_Analysis.md)                 | Actor, FR/NFR, Use Case, User Story, Business Rules, Entity, Module, Screen List              |
| [02_Diagrams](docs/02_EcoMart_Diagrams.md)                                   | Use Case Diagram, Activity Diagrams (Đăng ký OTP, Mua hàng, Đơn hàng, Thanh toán VNPay/SePay) |
| [03_ERD](docs/03_EcoMart_ERD.md)                                             | Entity Relationship Diagram, Data Dictionary (21 bảng)                                        |
| [04_Database_Design](docs/04_EcoMart_database_design.md)                     | DDL file locations, naming conventions, transaction rules                                     |
| [05_API_Specification](docs/05_EcoMart_API_Specification.md)                 | REST API contracts đầy đủ (Auth OTP, Customer, Admin, Payment Webhooks, 12 Reports)           |
| [06_Wireframe_Specification](docs/06_EcoMart_Wireframe_Specification.md)     | UX/UI wireframe và hành vi màn hình                                                           |
| [07_Frontend_Module_Checklist](docs/07_EcoMart_Frontend_Module_Checklist.md) | Checklist triển khai Frontend theo module                                                     |
