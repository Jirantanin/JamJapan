# JamJapan — Project Checklist (งานจริง)

> อัพเดทล่าสุด: 2026-03-09
> Legend: ✅ Done | 🔄 In Progress | ❌ Not Started

---

## 1. 📋 Product Requirements

- ✅ Problem Statement กำหนดแล้ว (walking route guide สำหรับนักท่องเที่ยวในญี่ปุ่น)
- ✅ Vision กำหนดแล้ว (community-driven, multi-country)
- ✅ Phases วางแผนแล้ว (1-5)
- ❌ User Stories เขียนอย่างเป็นทางการ (AS / I WANT / SO THAT)
- ❌ Acceptance Criteria กำหนดต่อ feature
- ❌ Out of Scope document
- ❌ Competitive Analysis (เทียบกับ Google Maps, HyperDia ฯลฯ)

---

## 2. 🏗️ System Architecture

### Infrastructure
- ✅ Tech stack กำหนดแล้ว (Nuxt 3, Prisma, PostgreSQL, Railway)
- ✅ Dual-schema (SQLite dev / PostgreSQL prod)
- ✅ Dockerfile + Railway deploy config
- ❌ Architecture diagram (C4 model หรือ simple diagram)
- ❌ CDN setup (static assets)
- ❌ Image storage (S3 / Cloudinary) — ตอนนี้รูปยัง placeholder
- ❌ Caching strategy (Redis / in-memory)
- ❌ Backup strategy (database backup plan)

### Rendering Strategy
- ✅ SSR (Nuxt 3 default)
- ❌ กำหนดว่าหน้าไหนควรเป็น SSG (static) หน้าไหนควรเป็น SSR

---

## 3. 🗄️ Data Design

### Current Schema
- ✅ User model
- ✅ Route model
- ✅ Step model

### Missing for Future Phases
- ❌ RouteRequest model (Phase 4 — user ขอเส้นทาง)
- ❌ Review / Rating model (Phase 4)
- ❌ SavedRoute model (Phase 4 — bookmark)
- ❌ Photo model (Phase 4 — user-uploaded photos)
- ❌ Tag model (many-to-many กับ Route)
- ❌ Soft delete strategy (deletedAt field)
- ❌ Audit log (ใครแก้อะไร เมื่อไหร่)

---

## 4. 🔌 API Design

### Endpoints (ทำแล้ว)
- ✅ GET /api/routes (list + filter + search + pagination)
- ✅ GET /api/routes/:id (detail + steps)
- ✅ POST /api/routes (admin create)
- ✅ PUT /api/routes/:id (admin update)
- ✅ DELETE /api/routes/:id (admin delete)
- ✅ GET /api/cities
- ✅ GET /api/auth/google (OAuth)

### API Quality
- ✅ Input validation (Zod schema) สำหรับ POST/PUT endpoints
- ✅ Auth utility (requireAuth, requireAdmin) — 401/403 แยกชัดเจน
- ❌ API versioning (/api/v1/...)
- ❌ Rate limiting (ป้องกัน abuse)
- ❌ API documentation (Swagger / OpenAPI)
- ❌ Pagination response มี `hasNext`, `hasPrev` field
- ❌ Response time SLA กำหนด (เช่น < 200ms)

---

## 5. 🔐 Security

### Authentication & Authorization
- ✅ Google OAuth (nuxt-auth-utils)
- ✅ Session management + session expiry (7 วัน)
- ✅ Role: USER / ADMIN ใน DB
- ✅ Auth utility functions (requireAuth, requireAdmin) ป้องกัน admin API routes
- ✅ Admin role assignment flow (NUXT_ADMIN_EMAILS env var)
- ❌ Google OAuth credentials จริง (ต้องเพิ่ม redirect URI ใน Google Cloud Console)

### Data Protection
- ✅ SQL Injection protection (Prisma ORM)
- ✅ XSS protection (Vue auto-escape)
- ✅ CSRF protection (nuxt-auth-utils)
- ❌ Input sanitization (HTML strip ก่อน save)
- ❌ Content Security Policy (CSP) headers
- ❌ Rate limiting per IP

### Secrets Management
- ✅ .env ไม่ commit (อยู่ใน .gitignore)
- ✅ .env.example มีแล้ว
- ✅ Production secrets ใน Railway env vars
- ❌ Secrets rotation plan

---

## 6. 🧪 Testing

### Unit Tests
- ❌ Test setup (Vitest)
- ❌ Business logic tests (transform.ts, filter logic)
- ❌ API response format tests

### Integration Tests
- ❌ API endpoint tests (Supertest / Nitro test)
- ❌ Database query tests

### E2E Tests
- ❌ E2E setup (Playwright)
- ❌ Critical user flows (ดู route, search, filter)
- ❌ Auth flow tests

### CI
- ❌ GitHub Actions: run tests on PR
- ❌ GitHub Actions: lint check
- ❌ Block merge if tests fail

---

## 7. 🚀 Deployment & DevOps

### Production Setup
- ✅ Railway project setup (JamJapan)
- ✅ PostgreSQL plugin ใน Railway
- ✅ Environment variables ใน Railway (DATABASE_URL, OAuth, session)
- ✅ Dockerfile builder (FROM node:22)
- ✅ start.sh (prisma db push + seed + exec node)
- ✅ Healthcheck configured (/)
- ✅ Public domain: jamjapan-production.up.railway.app
- ❌ Custom domain
- ❌ Auto-deploy on push to `main`

### CI/CD Pipeline
- ❌ Staging environment (optional)
- ❌ Database migration strategy (prisma migrate vs db push)

### Monitoring
- ❌ Error tracking (Sentry หรือ similar)
- ❌ Uptime monitoring (UptimeRobot ฟรี)
- ❌ Performance monitoring (response time)
- ❌ Log aggregation

---

## 8. 🖼️ Content & Assets

- ❌ Cover images สำหรับ 3 routes ที่มีอยู่
- ❌ Step images (รูปประกอบแต่ละ step)
- ❌ Image upload pipeline (admin อัพรูปยังไง?)
- ❌ Image optimization (WebP, resize, lazy load)
- ❌ Favicon / OG image / meta tags

---

## 9. 📱 UX / Accessibility

- ✅ Responsive design (mobile-first)
- ✅ Thai language (i18n)
- ✅ Loading states ทุก async operation
- ✅ Error states (API ล้มเหลว แสดง banner)
- ✅ Empty states (search ไม่เจอ แสดง message)
- ❌ Offline support (PWA?)
- ❌ Accessibility audit (WCAG 2.1)
- ❌ English language support

---

## Phase 2 Completion Status

### ✅ เสร็จแล้ว (Critical)
- [x] Auth utility (requireAuth/requireAdmin) — 401/403 แยกชัดเจน
- [x] Admin role assignment (NUXT_ADMIN_EMAILS env var auto-assign)
- [x] Session expiry (7 วัน)
- [x] Input validation (Zod) ทุก POST/PUT
- [x] Railway deployment + PostgreSQL + seeded data
- [x] Loading/Error/Empty states ทุกหน้า

### 🟡 ทำเอง (Important)
- [ ] Google OAuth redirect URI ใน Google Cloud Console
- [ ] Image storage (Cloudinary)

### 🟢 Phase 3+ (Nice to Have)
- [ ] Admin panel UI
- [ ] Tests (Vitest + Playwright)
- [ ] CI/CD (GitHub Actions)
- [ ] API documentation
- [ ] Rate limiting
