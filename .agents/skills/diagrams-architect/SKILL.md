---
name: diagrams-architect
description: >-
  Expert guide and templates for generating high-quality technical diagrams, Mermaid diagrams
  (Sequence, Flowchart, ER, Class, State, Architecture, C4, GitGraph), PlantUML, and visual software documentation.
---

# Diagrams Architect & Visual Documentation Skill

This skill equips the agent with expert-level standards, syntax rules, color palettes, and structured templates to generate clear, bug-free, and aesthetically pleasing technical diagrams using Mermaid and visual modeling standards.

---

## 1. Core Principles for Diagramming

1. **Clarity & Purpose**: Every diagram must answer a specific architectural or business question (e.g., "What happens during checkout?", "How do microservices communicate?").
2. **Standard Color Coding & Contrast**:
   - 🟩 **Success / Core Business Path**: `#dcfce7` (border `#16a34a`, text `#14532d`)
   - 🟦 **External Systems / Integration**: `#dbeafe` (border `#2563eb`, text `#1e3a8a`)
   - 🟨 **Async / Webhook / Queue**: `#fef3c7` (border `#d97706`, text `#78350f`)
   - 🟥 **Error / Rollback / Fallback**: `#fee2e2` (border `#dc2626`, text `#7f1d1d`)
3. **Escaping & Quoting Rules**:
   - Always wrap node labels containing spaces, brackets, parentheses, colons, or special characters in double quotes: `node["Process (Step 1): Data"]`.
   - Never use raw HTML tags inside node labels.

---

## 2. Mermaid Diagram Templates & Best Practices

### A. Sequence Diagrams (Interactions & Protocols)
Use for API workflows, authentication handshakes, payment gateways, webhooks, and distributed transactions.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Khách Hàng (Browser/App)
    participant Gateway as API Gateway / Filter
    participant Service as Domain Service
    participant DB as PostgreSQL
    participant Ext as Third-Party Service (e.g., VNPay, Resend)

    Client->>Gateway: POST /api/v1/resource (Payload)
    Gateway->>Gateway: Validate Token & Rate Limit

    alt Token Hợp lệ
        Gateway->>Service: Forward Request
        Service->>DB: Query / Mutate Data
        DB-->>Service: Return Entity
        
        opt Cần gọi Dịch vụ ngoài (Async / Sync)
            Service->>Ext: Dispatch Webhook / Send Mail
            Ext-->>Service: Ack (200 OK)
        end
        
        Service-->>Gateway: Response DTO
        Gateway-->>Client: HTTP 200 / 201 Created
    else Token Không hợp lệ / Hết hạn
        Gateway-->>Client: HTTP 401 Unauthorized
    end
```

**Sequence Diagram Best Practices**:
- Always use `autonumber` for numbered steps.
- Group logical phases with `rect rgb(...)` and `Note over ...`.
- Explicitly label parallel paths with `par ... and ...` and conditional branches with `alt ... else ... end`.

---

### B. Flowcharts & Business Process Workflows
Use for decision trees, order status transitions, state validation, and batch jobs.

```mermaid
flowchart TD
    Start([Bắt đầu]) --> Step1[Nhận Yêu cầu từ Client]
    Step1 --> Decision1{Xác thực Dữ liệu?}
    
    Decision1 -- Không hợp lệ --> ErrResp[Trả về HTTP 400 Bad Request]
    Decision1 -- Hợp lệ --> CheckCache{Kiểm tra Cache / Stock?}
    
    CheckCache -- Đã có / Đủ hàng --> ProcessTx[Xử lý Giao dịch DB]
    CheckCache -- Hết hàng --> OutOfStock[Trả về HTTP 409 Conflict]
    
    ProcessTx --> CommitDB[(PostgreSQL Commit)]
    CommitDB --> SendEmail[/Gửi Email Thông báo qua Resend/]
    SendEmail --> Success([Hoàn tất - HTTP 200])
    
    ErrResp --> End([Kết thúc])
    OutOfStock --> End
    Success --> End

    classDef success fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d;
    classDef warning fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f;
    classDef danger fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#7f1d1d;
    
    class Success,ProcessTx success;
    class CheckCache warning;
    class ErrResp,OutOfStock danger;
```

---

### C. Entity-Relationship (ER) Diagrams
Use for database schema design, entity associations, foreign keys, and cardinalities.

```mermaid
erDiagram
    USERS ||--o{ ORDERS : "places"
    USERS ||--o{ REVIEWS : "writes"
    USERS ||--o{ ADDRESSES : "has"
    CATEGORIES ||--o{ PRODUCTS : "contains"
    BRANDS ||--o{ PRODUCTS : "manufactures"
    PRODUCTS ||--o{ PRODUCT_IMAGES : "has"
    PRODUCTS ||--o{ PRODUCT_CERTIFICATIONS : "certified_by"
    ORDERS ||--|{ ORDER_ITEMS : "includes"
    PRODUCTS ||--o{ ORDER_ITEMS : "ordered_in"
    ORDERS ||--o{ PAYMENT_TRANSACTIONS : "paid_with"

    USERS {
        bigint id PK
        string email UK
        string password_hash
        string full_name
        boolean is_active
        boolean is_email_verified
    }

    ORDERS {
        bigint id PK
        string order_code UK
        bigint user_id FK
        numeric total_amount
        string status
        string payment_status
    }
```

---

### D. Architecture / System Component Diagrams
Use for high-level system components, networking layers, microservices, and storage topology.

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Layer"]
        Web["Next.js / React Frontend"]
        Mobile["Mobile Web / App"]
    end

    subgraph SecurityGateway ["API Security & Ingress"]
        Nginx["Nginx Reverse Proxy / SSL"]
        JwtFilter["Spring Security (JWT Filter)"]
    end

    subgraph BackendCore ["EcoMart Monolith Core"]
        AuthModule["Auth & User Module"]
        CatalogModule["Catalog & Inventory Module"]
        OrderModule["Order & Checkout Module"]
        PaymentModule["Payment & Webhook Module"]
        AnalyticsModule["Admin Analytics & Intelligence"]
    end

    subgraph DataStorage ["Data & Storage Layer"]
        Postgres[(PostgreSQL 16 Database)]
        Cloudinary[(Cloud Storage / CDN)]
    end

    subgraph ExternalGateways ["External Integrations"]
        ResendAPI["Resend Email API"]
        VNPayGW["VNPay Sandbox Gateway"]
        SePayQR["SePay VietQR 247"]
    end

    Web --> Nginx
    Mobile --> Nginx
    Nginx --> JwtFilter
    JwtFilter --> BackendCore
    
    BackendCore --> Postgres
    BackendCore --> Cloudinary
    AuthModule --> ResendAPI
    PaymentModule --> VNPayGW
    PaymentModule --> SePayQR
```

---

## 3. Checklist Before Outputting Diagrams

- [ ] Node IDs contain only alphanumeric characters and underscores (`Order_Svc`, `DB_1`).
- [ ] Labels with spaces or punctuation are enclosed in double quotes.
- [ ] No special characters break the parser (avoid `<` or `>` inside labels, use `&lt;` or `&gt;` if needed).
- [ ] Diagram is wrapped in standard ` ```mermaid ` code blocks.
- [ ] Workflow contains clear start, error branches, and end states.
