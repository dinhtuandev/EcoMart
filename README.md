# 🌿 EcoMart — Nền tảng Thương mại Điện tử Xanh & Tiêu dùng Bền vững

**EcoMart** là hệ thống sàn thương mại điện tử B2C chuyên kinh doanh các dòng sản phẩm thân thiện với môi trường, hỗ trợ người tiêu dùng tiếp cận lối sống xanh bền vững thông qua đánh giá chỉ số sinh thái (**Eco-Score 1-5 sao**), chứng nhận nhãn xanh, giỏ hàng trực tuyến, thanh toán đa phương thức (**COD**, **VNPay Sandbox**, **SePay VietQR Napas 247**), và xác thực bảo mật OTP qua **Gmail SMTP**.

---

## 🏗️ Cấu trúc Dự án

```text
EcoMart/
├── docs/                            # Tài liệu dự án: BA, ERD, API spec, wireframes
├── ecomart-backend/                 # Backend RESTful API monolith (Spring Boot 3.3.x, Java 17)
├── ecomart-database/                # Schema DDL SQL, mỗi engine database một thư mục
├── ecomart-frontend/                # Frontend SPA (React 18 + Vite + TypeScript + TailwindCSS)
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
| **Email**            | Gmail SMTP (OTP xác thực email & đặt lại mật khẩu)                                        |
| **Thanh toán**       | COD, VNPay Sandbox (HMAC-SHA512 IPN), SePay VietQR Napas 247 (Webhook)                    |
| **Container**        | Docker Compose (postgres + backend + frontend/nginx)                                      |

---

## 🚀 Hướng dẫn Khởi động Nhanh

### Với Docker Compose (khuyến nghị)

#### Bước 1 — Tạo file cấu hình môi trường (.env)
Thêm các file `.env` vào thư mục `ecomart-backend` và `ecomart-frontend`. 
*Xem chi tiết hướng dẫn cấu hình trong file README tại từng module.*

#### Bước 2 — Build images & dựng containers
```bash
docker compose up -d --build
```

#### Bước 3 — Đường dẫn truy cập
| Service                | Port | URL                                   |
| ---------------------- | ---- | ------------------------------------- |
| Backend (Spring Boot)  | 8081 | http://localhost:8081                 |
| Frontend (React/Nginx) | 3000 | http://localhost:3000                 |
| Swagger UI             | 8081 | http://localhost:8081/swagger-ui.html |

---

## 📚 Tài liệu chi tiết
Xem thêm các tài liệu hướng dẫn tại thư mục `docs/` ở thư mục gốc của dự án.
