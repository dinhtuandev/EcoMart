# System Architecture Diagram – EcoMart

## Purpose

Mô tả kiến trúc logic của EcoMart theo đúng những gì tài liệu mô tả: monolith 3 tầng (React SPA → Spring Boot REST API → PostgreSQL) cùng các dịch vụ bên ngoài được tích hợp.

## Source

- README Tech Stack (Spring Boot 3.3.x, Java 17, Spring Security 6 stateless JWT, Spring Data JPA/Hibernate, PostgreSQL 15, React 18 + Vite + TS + TailwindCSS, Axios, Context API, Resend API, VNPay Sandbox HMAC-SHA512 IPN, SePay VietQR Napas 247, Docker Compose)
- CLAUDE.md (Monolithic 3-Tier; NO microservices/DDD/CQRS)
- architecture/backend_rules.md + project_context.md (4 tầng Controller → Service → Repository)
- API Specification §1–§2 (Base URL :8081, `/api/v1`, Bearer JWT, Swagger UI)

## Diagram

```mermaid
flowchart TB
    subgraph CLIENT["Tier 1 — Client"]
        BROWSER["Trình duyệt<br/>(Desktop / Tablet / Mobile — NFR-13)"]
        SPA["React SPA 18 + Vite + TypeScript + TailwindCSS<br/>React Router v6 · Axios interceptor (Refresh Token)<br/>AuthContext · CartContext · ToastContext"]
        BROWSER --> SPA
    end

    subgraph SERVER["Tier 2 — Backend Monolith (Spring Boot 3.3 · Java 17) :8081"]
        direction TB
        SEC["Spring Security 6<br/>Stateless JWT · Phân quyền CUSTOMER / ADMIN"]
        CTL["REST Controllers — /api/v1/**"]
        SVC["Business Services<br/>(nghiệp vụ trong @Transactional)"]
        REPO["Spring Data JPA Repositories<br/>(Hibernate, ddl-auto: update ở dev)"]
        SWAGGER["Swagger UI / OpenAPI Docs"]
        SEC --> CTL --> SVC --> REPO
    end

    DB[("PostgreSQL 15 :5432<br/>21 bảng dữ liệu")]

    subgraph EXT["Dịch vụ bên ngoài"]
        direction LR
        RESEND["Resend API<br/>(Email OTP)"]
        VNPAY["VNPay Sandbox<br/>(Payment URL + IPN)"]
        SEPAY["SePay<br/>(VietQR Napas 247 + Webhook)"]
    end

    SPA -->|"REST JSON + Bearer JWT<br/>Axios base URL :8081/api/v1"| SEC
    REPO -->|"JDBC"| DB
    SVC -.->|"Gửi OTP email"| RESEND
    SVC -->|"Tạo paymentUrl có chữ ký"| VNPAY
    VNPAY -->|"IPN POST /payments/vnpay/ipn<br/>(server-to-server)"| SEC
    SEPAY -->|"Webhook POST /payments/sepay/webhook<br/>(server-to-server)"| SEC
    SWAGGER -.-> CTL

    VNPAY <-.->|"Redirect toàn trang sang cổng<br/>và quay lại trang kết quả"| BROWSER
```

### Ghi chú

- Webhook/IPN đi thẳng vào backend và được xác thực chữ ký/checksum trước khi cập nhật dữ liệu; **không** tin dữ liệu redirect từ trình duyệt (BR-40/43, NFR-19).
- Triển khai bằng Docker Compose: postgres (:5432) + backend (:8081) + frontend/nginx (:3000); dev local chạy Vite tại :5173 (README).
- Không có message broker, cache layer hay service riêng nào khác trong phạm vi tài liệu — `NOT SPECIFIED` ngoài các thành phần trên.
