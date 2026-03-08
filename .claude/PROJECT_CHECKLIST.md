# JamJapan — Project Checklist (งานจริง)

> อัพเดทล่าสุด: 2026-03-08
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
- ❌ Standard error format `{ error, message, statusCode }` ทุก endpoint
- ❌ Input validation (Zod schema) ทุก POST/PUT endpoint
- ❌ API versioning (/api/v1/...)
- ❌ Rate limiting (ป้องกัน abuse)
- ❌ API documentation (Swagger / OpenAPI)
- ❌ Pagination response มี `hasNext`, `hasPrev` field
- ❌ Response time SLA กำหนด (เช่น < 200ms)

---

## 5. 🔐 Security

### Authentication & Authorization
- ✅ Google OAuth (nuxt-auth-utils)
- ✅ Session management
- ✅ Role: USER / ADMIN ใน DB
- ❌ Auth middleware ป้องกัน admin API routes
- ❌ Admin role assignment flow (ใครเป็นคนให้ ADMIN role?)
- ❌ Session expiry กำหนด

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
- ❌ Secrets rotation plan
- ❌ Production secrets ใน Railway env vars (ยังไม่ deploy)

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
- ❌ Railway project setup
- ❌ PostgreSQL plugin ใน Railway
- ❌ Environment variables ใน Railway
- ❌ Build command: `prisma generate && prisma db push && nuxt build`
- ❌ Domain setup (custom domain?)

### CI/CD Pipeline
- ❌ Auto-deploy on push to `main`
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
- ❌ Loading states ทุก async operation
- ❌ Error states (API ล้มเหลว แสดงอะไร?)
- ❌ Empty states (search ไม่เจอ แสดงอะไร?)
- ❌ Offline support (PWA?)
- ❌ Accessibility audit (WCAG 2.1)
- ❌ English language support

---

## Priority สำหรับ Phase ถัดไป

### 🔴 ก่อน Deploy Production (Critical)
- [ ] Auth middleware ป้องกัน admin routes
- [ ] Input validation (Zod) ทุก POST/PUT
- [ ] Standard error format
- [ ] Railway deployment + PostgreSQL
- [ ] Google OAuth credentials จริง

### 🟡 หลัง Deploy (Important)
- [ ] Image storage (Cloudinary)
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring
- [ ] Loading/Error/Empty states

### 🟢 Phase 3+ (Nice to Have)
- [ ] Tests (Vitest + Playwright)
- [ ] CI/CD (GitHub Actions)
- [ ] API documentation
- [ ] Rate limiting
