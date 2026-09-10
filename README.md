# 🌿 EcoMart — Nền tảng Thương mại Điện tử Xanh & Tiêu dùng Bền vững

**EcoMart** là hệ thống sàn thương mại điện tử B2C chuyên kinh doanh các dòng sản phẩm thân thiện với môi trường. Dự án được phát triển theo mô hình Monorepo (Spring Boot + React/Vite/TS), tích hợp các tính năng tiên tiến bao gồm đánh giá chỉ số sinh thái (**Eco-Score 1-5 sao**), xác thực qua mạng xã hội (**OAuth2 Google/Facebook**), thanh toán đa phương thức (**COD**, **VNPay**, **SePay VietQR**), và thông báo hệ thống tự động.

---

## 🏗️ Cấu trúc Monorepo

```text
EcoMart/
├── .agents/                 # AI Tooling & configuration
├── .github/                 # CI/CD workflows
├── architecture/            # Coding rules & architectural standards
├── docs/                    # Tài liệu dự án: BA, ERD, API spec, wireframes
├── ecomart-backend/         # Spring Boot Monolith (Java 17+)
├── ecomart-database/        # Schema SQL (PostgreSQL/SQL Server)
├── ecomart-frontend/        # React SPA (Vite + TypeScript + TailwindCSS)
├── tools/                   # Utility tools (Diagram validator)
├── docker-compose.yml       # Orchestration chạy local (Full-stack)
├── .env.example             # Template cấu hình chung cho cả BE & FE
└── README.md                # Tài liệu dự án (File này)
```

---

## 🚀 Tech Stack

| Layer                | Công nghệ                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------- |
| **Backend**          | Java 17, Spring Boot 3.3.x, Spring Security 6 (Stateless JWT), JPA, Hibernate             |
| **Authentication**   | JWT, OAuth2 (Google, Facebook)                                                            |
| **Email**            | Spring Mail (SMTP/Gmail) — cho OTP & Thông báo                                            |
| **Database**         | PostgreSQL 15 (mặc định)                                                                  |
| **Frontend**         | React 18, Vite, TypeScript, TailwindCSS, React Router v6, Axios                           |
| **Thanh toán**       | COD, VNPay Sandbox (HMAC-SHA512 IPN), SePay VietQR Napas 247 (Webhook)                    |
| **Container**        | Docker Compose (postgres + backend + frontend/nginx)                                      |

---

## 🛠️ Hướng dẫn Khởi động Nhanh

### Với Docker Compose (Khuyến nghị)

1. **Chuẩn bị file cấu hình:**
   Copy `.env.example` thành `.env` tại root (và trong các module nếu cần ghi đè) và điền các biến môi trường cần thiết (JWT secret, OAuth credentials, DB credentials, SMTP config, Payment API keys).

2. **Dựng và khởi chạy:**
   ```bash
   docker compose up -d --build
   ```

3. **Truy cập:**
   - **Frontend:** `http://localhost:3000`
   - **Backend API:** `http://localhost:8081`

---

## 📖 Tài liệu liên quan
- [Business Analysis](docs/01_EcoMart_Business_Analysis.md)
- [Database ERD](docs/03_EcoMart_ERD.md)
- [API Specification](docs/05_EcoMart_API_Specification.md)
- [Frontend Checklist](docs/07_EcoMart_Frontend_Module_Checklist.md)
