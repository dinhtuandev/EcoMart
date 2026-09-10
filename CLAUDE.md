# TechHub Claude Configuration & Rules Reference

## 📌 Project Context
- **Project Name**: EcoMart (E-Commerce B2C Website for Eco-friendly Consumer Products).
- **Architecture**: Monolithic 3-Tier (React SPA + Spring Boot 3 REST API + Relational DB).
- **Primary Source of Truth**: `architecture/` folder rules and `docs/` folder specs.

## 🚀 Registered Skills (.claude/skills/)

### Core Workflow & Process Skills
1. `context-loader`: Systematically loads project rules, specs, schemas, and source files before starting tasks.
2. `task-breakdown`: Breaks down features into step-by-step task plans with In-Scope vs Out-of-Scope boundaries.
3. `implement-feature`: Executes end-to-end feature code across Backend (Spring Boot) and Frontend (React SPA).
4. `bug-debugger`: Diagnoses and fixes runtime errors, stack traces, and HTTP errors from empirical log evidence.
5. `code-review`: Audits code against security, performance, UI/UX, and `architecture/` project compliance standards.
6. `git-conventional-commit`: Formats Git commit messages, branch names, and PRs following Conventional Commits.

### Backend Development Skills (Spring Boot 3)
7. `spring-boot-feature`: Guidelines for building end-to-end 3-tier features.
8. `spring-boot-api`: Guidelines for generating REST controllers, services, repositories, and Java Record DTOs.
9. `spring-boot-entity`: Guidelines for defining JPA Entities, database auditing, and indexes.
10. `spring-boot-testing`: Guidelines for writing JUnit 5 & Mockito unit/integration tests with AssertJ.
11. `spring-boot-openapi`: Guidelines for adding OpenAPI 3 / Swagger documentation annotations.

### Frontend Development Skills (React + Vite + TailwindCSS)
12. `react-component-page`: Guidelines for building React SPA pages, components, Axios services, and Context API.
13. `react-component`: Guidelines for writing clean, accessible React components with Tailwind CSS.
14. `react-form-zod`: Guidelines for building type-safe forms with React Hook Form & Zod schema validation.
15. `react-axios-client`: Guidelines for Axios instance setup, interceptors, and service wrappers.
16. `react-ecommerce-ui`: Guidelines for E-commerce UI components (Product Cards, Order Status Badges, Cart Drawer).

### Database & Verification Skills
17. `db-migration-seeding`: Guidelines for SQL schema updates and initial database seeding.
18. `api-testing-verification`: Guidelines for testing RESTful endpoints and JWT authentication flow.
19. `code-review-compliance`: Automated checklist to ensure code complies with `architecture/` rules and no over-engineering occurred.

## ⚠️ Non-Negotiable Boundaries
- NO Microservices, NO DDD, NO CQRS, NO Kafka/Event Sourcing.
- NO production online payment gateways (one sandbox gateway is permitted), no marketplace, no ESG/carbon tracking, and no complex promotion engine.
- NO Redux (Use React Context API only).
