# 🧹 Kế hoạch Dọn dẹp Cấu trúc Dự án EcoMart

> **✅ TRẠNG THÁI: ĐÃ THỰC THI — 25/08/2026**
> - GĐ0 ✅ Backup tại `C:\Users\tm987\AppData\Local\Temp\kilo\ecomart-backup-20260825` (7601 files, gồm cả `.git` 2 repo con)
> - GĐ1 ✅ Xoá `compose.yaml` backend · sửa `env_file` → `./.env` · viết lại DOCKER.md · `.env.example` BE+FE · gitignore FE
> - GĐ2 ✅ CLAUDE.md `.ai/`→`architecture/` · README khớp thực tế · xoá HELP.md · gộp CHECKLIST.md vào docs/07
> - GĐ3 ✅ `mermaid/`→`tools/diagram-validator/` · xoá `target/`, `dist/`
> - Kiểm chứng ✅ compose config OK · diagram 24/24 PASS · backend tests **220/220** · frontend build OK
>
> **⏳ Còn treo (cần bạn quyết định / tự làm):**
> 1. `.github/modernize/java-upgrade` — chưa xoá, chờ xác nhận không còn dùng GitHub Copilot App Modernization.
> 2. `ecomart-frontend/.env` ✅ Đã gỡ khỏi git tracking (chỉ còn trên local).
> 3. Đã gộp thành công Monorepo và push lên GitHub `dinhtuandev/EcoMart`.
> 4. ✅ Đã tích hợp các tính năng mới từ EcoMartX (OAuth2, Theme, Toast, CI/CD) vào Monorepo.
> 5. ✅ Đã cập nhật `README.md` mới nhất cho Monorepo.

> Mục tiêu: dọn sạch sự rối trong trạng thái **3 thư mục tách biệt** (backend / frontend / database+docs)
> đang phát triển song song. Việc gộp về 1 monorepo root **chưa thực hiện** — để dành cho giai đoạn
> tích hợp sau khi phát triển ổn định.
> Nguyên tắc: mỗi thứ chỉ có **một nguồn sự thật** (1 docker-compose · 1 bộ env · 1 bộ docs/rules).

---

## 📋 Hiện trạng (vấn đề đã xác nhận)

| # | Vấn đề | Vị trí | Mức độ | Xử lý |
|---|--------|--------|--------|-------|
| P1 | Root **không phải git repo**; `ecomart-backend/.git`, `ecomart-frontend/.git` là 2 repo độc lập | root | 🔴 Nghiêm trọng | ✅ **Đã xử lý** — Gộp thành Monorepo duy nhất, giữ nguyên 100% lịch sử commit |
| P2 | 2 file compose song song: `docker-compose.yml` (fullstack) vs `ecomart-backend/compose.yaml` (hardcode JWT secret) | root, backend | 🔴 Nghiêm trọng | ✅ GĐ1 |
| P3 | `docker-compose.yml` trỏ `env_file: ./ecomart-backend/.env` — file **không tồn tại** | docker-compose.yml:39 | 🔴 Break | ✅ GĐ1 |
| P4 | `.env.example` ở root chứa biến backend; frontend `.env` không được gitignore trong repo của nó | root, frontend | 🟡 Rối | ✅ GĐ1 |
| P5 | `CLAUDE.md` tham chiếu `.ai/` nhưng thư mục thật là `architecture/` | CLAUDE.md | 🟡 Sai lệch | ✅ GĐ2 |
| P6 | README vẽ `ecomart-database/postgresql/` + `sqlserver/` — thực tế chỉ 1 file SQL phẳng | README.md | 🟡 Sai lệch | ✅ GĐ2 |
| P7 | `mermaid/` (công cụ validate diagram + node_modules) nằm ở root | mermaid/ | 🟡 Rối | ✅ GĐ3 |
| P8 | `HELP.md` (Spring Initializr), `target/`, `dist/`, `.github/modernize/` | backend, frontend, .github | 🟢 Rác | ✅ GĐ3 |

---

## Giai đoạn 0 — Backup (bắt buộc làm đầu tiên)

- [ ] Zip/copy toàn bộ thư mục `EcoMart/` ra ngoài OneDrive (ổ khác hoặc ổ đĩa local).
- [ ] Push `ecomart-backend` và `ecomart-frontend` lên GitHub remote (backup branch) trước khi xoá/sửa gì.

---

## Giai đoạn 1 — Docker & Env: một nguồn sự thật

- [ ] **Xoá `ecomart-backend/compose.yaml`** — giữ duy nhất root `docker-compose.yml` làm full-stack chính. (File này đang hardcode JWT secret plaintext — xoá luôn là tốt nhất.)
- [ ] Sửa `docker-compose.yml` dòng 39: `env_file: - ./ecomart-backend/.env` → `- ./.env` (root `.env` đã tồn tại), hoặc bỏ `env_file` và truyền qua `environment: ${APP_JWT_SECRET}` từ root `.env`.
- [ ] Cập nhật `DOCKER.md`: hiện đang mô tả `compose.yaml` của backend với service tên `app` — viết lại theo root compose (service `backend`, `frontend`, `postgres`).
- [ ] Chuẩn hoá env:
  - Root `.env.example` = template **duy nhất**, chia 2 section rõ ràng: `# Backend (Spring)` + `# Frontend (Vite)` (thêm `VITE_API_BASE_URL=http://localhost:8081/api/v1`).
  - Xoá `ecomart-frontend/.env` khỏi working tree nếu không cần thiết (dev copy từ `.env.example`).
- [ ] Gitignore từng repo con (trong lúc còn tách repo):
  - `ecomart-frontend/.gitignore`: thêm dòng `.env` (hiện chỉ ignore `.env.*.local` → secret có thể bị commit).
  - `ecomart-backend/.gitignore`: đã ignore `.env` — không cần sửa.
  - Root `.gitignore`: giữ nguyên làm bản nháp cho lần gộp monorepo sau.

---

## Giai đoạn 2 — Đồng bộ Docs & Rules

- [ ] Sửa `CLAUDE.md`: đổi mọi tham chiếu `.ai/` → `architecture/`.
- [ ] Cập nhật README.md mục "Cấu trúc Dự án":
  - `ecomart-database/` → mô tả đúng: `ecomart_schema_postgresql.sql` (file phẳng). Hoặc nếu muốn giữ mô tả cũ thì tạo folder `postgresql/` di chuyển file vào — **chọn 1, đừng để lệch**.
  - Bổ sung các mục còn thiếu: `architecture/` (coding rules), `tools/diagram-validator/` (xem GĐ3), `docker-compose.yml`, `DOCKER.md`, `CLEANUP_PLAN.md`.
- [ ] Xoá `ecomart-backend/HELP.md` (leftover Spring Initializr).
- [ ] Quyết định `.github/modernize/java-upgrade` (hook GitHub Copilot App Modernization): nếu không còn nâng cấp Java nữa → xoá cả thư mục.
- [ ] `ecomart-frontend/CHECKLIST.md`: review — nếu nội dung trùng `docs/07_EcoMart_Frontend_Module_Checklist.md` thì xoá/gộp về `docs/`.

---

## Giai đoạn 3 — Công cụ & Artifact + Kiểm chứng nhanh

### Dọn công cụ & artifact
- [ ] Di chuyển `mermaid/validate.mjs` + `package.json` → `tools/diagram-validator/`; xoá `node_modules` (ai cần thì `npm i` lại). Cập nhật đường dẫn trong `docs/diagrams/README.md` (mục Validation).
- [ ] Xoá artifact build khỏi đĩa (OneDrive sync nhẹ hơn):
  ```powershell
  Remove-Item -Recurse -Force ecomart-backend\target
  Remove-Item -Recurse -Force ecomart-frontend\dist
  ```
- [ ] *(Tuỳ chọn)* `ecomart-frontend/vite.config.js` → `vite.config.ts` (project TS).
- [ ] Giữ nguyên: `.claude/`, `.agents/`, `skills-lock.json` (AI tooling — ghi 1 dòng giải thích trong README).

### Kiểm chứng nhanh sau cleanup
- [ ] `docker compose up -d --build` chạy full stack từ root **không lỗi** (env_file đã sửa).
- [ ] Backend: `.\mvnw test` pass.
- [ ] Frontend: `npm run build` pass.
- [ ] Diagram: `node tools/diagram-validator/validate.mjs docs/diagrams` pass.

---

## Giai đoạn tương lai — Gộp monorepo *(chưa làm — ghi lại để sau)*

Khi phát triển ổn định và sẵn sàng tích hợp:
1. Backup + push cả 2 repo con lên remote.
2. Xoá `.git` con → `git init` tại root (mất lịch sử con) hoặc dùng `git subtree add --prefix=...` (giữ lịch sử).
3. Gộp `.gitignore` con vào root `.gitignore` (đã soạn sẵn từ GĐ1), xoá các `.gitignore` thừa trong thư mục con.
4. Tạo remote mới cho monorepo, push.

---

## Thứ tự khuyến nghị thực thi

1. GĐ0 (backup) → 2. GĐ1 (docker/env) → 3. GĐ2 (docs/rules) → 4. GĐ3 (tools/artifact + verify)
