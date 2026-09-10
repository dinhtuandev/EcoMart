# 🌿 EcoMart — Nền tảng Thương mại Điện tử Xanh & Tiêu dùng Bền vững

**EcoMart** là hệ thống sàn thương mại điện tử B2C chuyên kinh doanh các dòng sản phẩm thân thiện với môi trường, hỗ trợ người tiêu dùng tiếp cận lối sống xanh bền vững thông qua đánh giá chỉ số sinh thái (**Eco-Score 1-5 sao**), chứng nhận nhãn xanh, giỏ hàng trực tuyến, thanh toán đa phương thức (**COD**, **VNPay Sandbox**, **SePay VietQR Napas 247**), và xác thực bảo mật OTP qua **Resend Email API**.

---

## 🏗️ Cấu trúc Dự án

```text
EcoMart/
├── architecture/                      # Quy ước dự án — source of truth: api/backend/coding/database/frontend/git/ui rules, task-template
├── docs/                              # Tài liệu dự án (BA docs, ERD, API specs, wireframes)
│   ├── 01_EcoMart_Business_Analysis.md
│   ├── 02_EcoMart_Diagrams.md
│   ├── 03_EcoMart_ERD.md
│   ├── 04_EcoMart_database_design.md
│   ├── 05_EcoMart_API_Specification.md
│   ├── 06_EcoMart_Wireframe_Specification.md
│   ├── 07_EcoMart_Frontend_Module_Checklist.md
│   └── diagrams/                      # Mermaid diagram sources
│       ├── activity/                  # Activity diagrams — business workflows (register OTP, checkout, payment)
│       ├── sequence/                  # Sequence diagrams — API interaction flows between actors, frontend & backend
│       └── state/                     # State diagrams — entity lifecycle transitions (order/payment status)
├── tools/
│   └── diagram-validator/             # Công cụ validate syntax Mermaid (node validate.mjs <dir>)
├── ecomart-backend/                   # Backend RESTful API monolith (Spring Boot 3.3.x, Java 17)
│   ├── src/main/java/com/ecomart/
│   │   ├── config/                    # Spring configuration classes: security config, CORS, OpenAPI, beans
│   │   ├── controller/                # REST controllers exposing API endpoints per resource
│   │   ├── dto/
│   │   │   ├── request/               # Inbound request payload objects (Bean Validation applied)
│   │   │   └── response/              # Outbound response payload objects returned to clients
│   │   ├── entity/                    # JPA entities mapped to database tables
│   │   │   └── enums/                 # Enum types used by entities (order status, payment method…)
│   │   ├── exception/                 # Custom business exceptions & global exception handler
│   │   ├── repository/                # Spring Data JPA repositories (data access layer)
│   │   ├── security/                  # JWT provider, authentication filter, user principal
│   │   ├── service/                   # Business logic service interfaces
│   │   │   └── impl/                  # Concrete service implementations
│   │   ├── specification/             # JPA Specifications for dynamic query filtering & pagination
│   │   └── util/                      # Helper/utility classes (mappers, generators…)
│   ├── src/main/resources/            # application.yml configs, static assets, email templates
│   ├── src/test/                      # Unit & integration tests (controller, repository, service, util)
│   └── Dockerfile                     # Multi-stage build (Maven → JRE), dùng bởi docker-compose.yml
├── ecomart-database/                  # DDL schema SQL
│   └── ecomart_schema_postgresql.sql  # PostgreSQL 15+ schema script (engine mặc định trong docker-compose)
├── ecomart-frontend/                  # Frontend SPA (React 18 + Vite + TypeScript + TailwindCSS)
│   └── src/
│       ├── components/                # Reusable UI components grouped by business domain
│       │   ├── address/ · auth/ · brand/ · category/ · certification/ · payment/ · product/
│       │   │                          #   → domain-specific feature components
│       │   ├── common/                # Generic shared components used across pages
│       │   ├── layout/                # Page layout components (header, footer, navigation)
│       │   └── ui/                    # Design-system primitives (toast container, base UI elements)
│       ├── context/                   # React Context state providers: CartContext, ToastContext
│       ├── hooks/                     # Custom React hooks for public data fetching (brands, categories…)
│       ├── lib/                       # Core client setup: Axios instance with interceptors
│       ├── pages/                     # Route-level page components (customer-facing screens)
│       │   └── admin/                 # Admin dashboard pages (products, orders, users, reports…)
│       ├── providers/                 # AuthProvider — global auth state via useReducer + Context
│       ├── routes/                    # Router definitions (AppRoutes) & route guards (ProtectedRoute)
│       ├── services/                  # API service modules, one file per backend resource
│       ├── types/                     # Shared TypeScript type/interface definitions
│       └── utils/                     # Helpers: constants, formatters (currency, date…)
├── .env.example                       # Template biến môi trường cho cả backend & frontend
├── .gitignore                         # Ignore chung (chuẩn bị cho monorepo sau này)
├── docker-compose.yml                 # Full stack: postgres + backend + frontend(nginx)
├── DOCKER.md                          # Hướng dẫn chạy bằng Docker Compose
├── CLAUDE.md                          # Cấu hình AI-assisted dev (skills, boundaries)
├── CLEANUP_PLAN.md                    # Kế hoạch dọn dẹp cấu trúc dự án
└── README.md
```

---

## 🚀 Tech Stack

| Layer | Công nghệ |
|---|---|
| **Backend** | Java 17, Spring Boot 3.3.x, Spring Security 6 (Stateless JWT), Spring Data JPA, Hibernate |
| **Database** | PostgreSQL 15 (mặc định docker-compose, port 5432) |
| **Frontend** | React 18, Vite, TypeScript, TailwindCSS, React Router v6, Axios |
| **State Management** | React Context API (`AuthContext`, `CartContext`, `ToastContext`) |
| **Email** | Resend API (OTP xác thực email & đặt lại mật khẩu) |
| **Thanh toán** | COD, VNPay Sandbox (HMAC-SHA512 IPN), SePay VietQR Napas 247 (Webhook) |
| **Container** | Docker Compose (postgres + backend + frontend/nginx) |

---

## 🚀 Hướng dẫn Khởi động Nhanh

### Với Docker Compose (khuyến nghị)

```bash
# Copy file cấu hình môi trường từ template gốc
cp .env.example .env
# Chỉnh sửa .env: DB credentials, JWT_SECRET, RESEND_API_KEY, VNPAY/SEPAY configs

# Khởi động toàn bộ stack
docker compose up -d --build
```

| Service | Port | URL |
|---|---|---|
| Backend (Spring Boot) | 8081 | http://localhost:8081 |
| Frontend (React/Nginx) | 3000 | http://localhost:3000 |
| PostgreSQL | 5432 | localhost:5432 |
| Swagger UI | 8081 | http://localhost:8081/swagger-ui.html |
| OpenAPI Docs | 8081 | http://localhost:8081/v3/api-docs |

### Khởi động thủ công

#### 1. Backend (`ecomart-backend`)

```powershell
# Lấy template env từ thư mục gốc (chưa có thì copy trước)
cp .env.example .env
cd ecomart-backend
./mvnw.cmd spring-boot:run
```

#### 2. Frontend (`ecomart-frontend`)

```powershell
cd ecomart-frontend
npm install
npm run dev
```

- **Web App**: http://localhost:5173 (Vite dev server)

---

## 🔐 Tài khoản mặc định (Seed Data)

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@ecomart.vn` | Admin123! |

---

## 🧪 Trạng thái Kiểm thử & Chất lượng

- **Backend Unit & Integration Tests**: `./mvnw test` (`BUILD SUCCESS`).
- **Bảo mật & Rate Limiting**: Cooldown 60s, Rate Limiting 5 lần / 15 phút, Anti-Brute-Force OTP 5 lần.
- **Tài liệu**: Chuẩn hóa 100% trong thư mục [`docs/`](docs/) — phản ánh chính xác source code thực tế.

---

## 📚 Tài liệu

| File | Nội dung |
|---|---|
| [01_Business_Analysis](docs/01_EcoMart_Business_Analysis.md) | Actor, FR/NFR, Use Case, User Story, Business Rules, Entity, Module, Screen List |
| [02_Diagrams](docs/02_EcoMart_Diagrams.md) | Use Case Diagram, Activity Diagrams (Đăng ký OTP, Mua hàng, Đơn hàng, Thanh toán VNPay/SePay) |
| [03_ERD](docs/03_EcoMart_ERD.md) | Entity Relationship Diagram, Data Dictionary (21 bảng) |
| [04_Database_Design](docs/04_EcoMart_database_design.md) | DDL file locations, naming conventions, transaction rules |
| [05_API_Specification](docs/05_EcoMart_API_Specification.md) | REST API contracts đầy đủ (Auth OTP, Customer, Admin, Payment Webhooks, 12 Reports) |
| [06_Wireframe_Specification](docs/06_EcoMart_Wireframe_Specification.md) | UX/UI wireframe và hành vi màn hình |
| [07_Frontend_Module_Checklist](docs/07_EcoMart_Frontend_Module_Checklist.md) | Checklist triển khai Frontend theo module |
