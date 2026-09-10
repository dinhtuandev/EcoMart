# EcoMart – Project Context

## Purpose

EcoMart is a Vietnamese B2C e-commerce platform for sustainable products. Its differentiators are an **Eco-Score (1–5)**, eco-certifications, and sustainable-living content. Primary user journeys are product discovery, cart/checkout, payment, order tracking, reviews, and operational administration.

## Repository map

```text
./
├── ecomart-backend/     Spring Boot REST API monolith
├── ecomart-frontend/    React/Vite TypeScript SPA
├── ecomart-database/    PostgreSQL and SQL Server DDL reference scripts
├── docs/                Business analysis, ERD, API contract, wireframes, Mermaid diagrams
├── docker-compose.yml   Local PostgreSQL + backend + frontend/nginx stack
└── render.yaml          Render backend deployment blueprint
```

Read source code before changing behavior. `docs/05_EcoMart_API_Specification.md`, `docs/03_EcoMart_ERD.md`, and the diagrams in `docs/diagrams/` are the best supporting references; source code and tests are the runtime truth if they differ.

## Architecture and technologies

- **Backend:** Java 17, Spring Boot 3.3.5, Spring MVC, Spring Data JPA/Hibernate, Spring Security, Bean Validation, Lombok, JWT (`jjwt`), springdoc/Swagger, Maven.
- **Frontend:** React 18, TypeScript, Vite 5, React Router v6, Axios, Tailwind CSS 3, lucide-react. There is no Redux/query library; shared app state uses React Context.
- **Data:** PostgreSQL 16 in Docker. H2 is available for local/test development. SQL schemas are reference artifacts under `ecomart-database/`.
- **Integrations:** Gmail SMTP for OTP emails, Google/Facebook social sign-in, VNPay sandbox, and SePay VietQR. Never commit or expose their credentials.

## Backend conventions

Package root: `ecomart-backend/src/main/java/com/ecomart`.

```text
controller/       HTTP boundary, grouped by resource
service/          business interfaces
service/impl/     service implementations
repository/       Spring Data JPA persistence
entity/           JPA entities; entity/enums holds persisted status enums
dto/request/      validated request models
dto/response/     client response models, including ApiResponse<T>
specification/    dynamic filtering/pagination
security/         JWT filter, provider, and UserPrincipal
config/           security, CORS, payment, seed data, OpenAPI, async
exception/        domain errors and GlobalExceptionHandler
```

- API root is **`/api/v1`**. Preserve the existing `ApiResponse<T>` envelope and DTO boundary; do not return entities directly.
- Follow the existing flow: controller → service interface → `service/impl` → repository. Put validation on request DTOs and business/authorization checks in services or method security.
- `SecurityConfig` is the central route policy. It is stateless JWT authentication with `JwtAuthenticationFilter`; do not introduce server sessions or disable the filter for convenience.
- Roles are `CUSTOMER`, `MANAGER`, and `ADMIN`. `MANAGER` and `ADMIN` operate commerce/admin modules; only `ADMIN` can manage users and sensitive system settings.
- Public reads include products, categories, brands, certifications, public content pages, and store settings. Payment callbacks under `/api/v1/payments/**` are public by design and must validate gateway input/signatures in their service logic.
- Main domain modules: auth/OTP/password reset/social login, catalog (product/category/brand/certification), cart, addresses, orders, payments, reviews, contact/content/settings, inventory, users, and admin reports.
- Current status values: `OrderStatus`: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`; `PaymentStatus`: `UNPAID`, `PAID`, `FAILED`, `REFUNDED`; `PaymentMethod`: `COD`, `VNPAY`, `SEPAY`. Treat state transitions as business rules: do not bypass them in a controller.
- Product, order, review, and contact queries use JPA Specifications. Preserve filtering and pagination semantics when extending list endpoints.
- Tests mirror layers in `src/test/java/com/ecomart/{controller,service,repository,util}`. Add/update focused tests with backend behavior changes.

## Frontend conventions

Source root: `ecomart-frontend/src`.

```text
components/       reusable UI, layout, and feature components
pages/            route-level customer pages; pages/admin for management screens
services/         one API module per backend resource
types/            shared TypeScript API/domain types
providers/        AuthProvider and useAuth
context/          CartContext and ToastContext
routes/           AppRoutes and ProtectedRoute
hooks/             public catalog-fetching hooks
lib/axiosClient.ts shared Axios instance and token refresh handling
utils/             constants and formatting helpers
```

- Route definitions and role guards live in `src/routes/AppRoutes.tsx`; keep route authorization aligned with backend security.
- Provider nesting is `ToastProvider → AuthProvider → CartProvider`. Authentication tokens and cached user are stored in `localStorage` as `accessToken`, `refreshToken`, and `user`.
- Use `lib/axiosClient.ts` for normal API calls. It attaches the bearer token and serializes refresh-token retries; do not duplicate refresh/logout logic in feature services.
- API base URL is `VITE_API_BASE_URL`, defaulting to `http://localhost:8081/api/v1`. Vite variables are baked in at build time.
- Customer pages use `MainLayout`; management pages use `AdminLayout` and are protected for `ADMIN`/`MANAGER`. `/admin/users` and `/admin/settings` are admin-only.
- Reuse shared components in `components/ui` and existing domain components before adding new primitives. Keep UI text consistent with the Vietnamese product UI.
- Cart updates are optimistic and quantity updates debounce for 500 ms. Preserve server reconciliation/rollback behavior when changing cart code.

## Running and checking

From repository root:

```powershell
# Full local stack: PostgreSQL :5432, backend :8081, frontend HTTPS :3000
docker compose up -d --build

# Backend
cd ecomart-backend
Copy-Item .env.example .env
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run

# Frontend (separate terminal)
cd ecomart-frontend
npm install
npm run dev       # http://localhost:5173
npm run build
npm run lint
```

- Docker Compose loads `ecomart-backend/.env`, then overrides backend datasource values to its PostgreSQL service.
- Backend Swagger UI: `http://localhost:8081/swagger-ui.html`.
- Do not run `docker compose down -v` unless explicitly asked: it deletes the PostgreSQL volume.

## Configuration and safety

- Copy `ecomart-backend/.env.example` to a local `.env`; it is gitignored. Do not edit real secrets into tracked files, tests, logs, fixtures, or documentation.
- Key backend environment variables: `SPRING_DATASOURCE_*`, `APP_JWT_SECRET`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `VNPAY_*`, `SEPAY_*`, `clientIdGoogle`, `clientSecretGoogle`, `clientIdFacebook`, `clientSecretFacebook`, and optionally `APP_CORS_ALLOWED_ORIGIN_PATTERNS`.
- Production frontend needs `VITE_API_BASE_URL`; ensure backend CORS permits the deployed frontend origin.
- Keep externally supplied payment webhooks idempotent and signature-validated. Be especially careful with order/payment state and inventory updates, because they cross business boundaries.

## Change checklist

1. Identify the affected backend module, frontend service/page/component, and API contract before editing.
2. Keep DTO/types/services/routes in sync for API changes.
3. Enforce authorization on the backend even if the frontend hides a page/action.
4. Run the narrowest relevant backend test(s) and/or frontend build/lint. Report anything not run.
5. Do not overwrite unrelated working-tree changes; this repository may contain user-local `.claude/` and `.freebuff/` directories.
