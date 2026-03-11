# JamJapan — Project Checklist (งานจริง)

> อัพเดทล่าสุด: 2026-03-10 (Phase 4 Complete!)
> Legend: ✅ Done | 🔄 In Progress | ❌ Not Started

---

## 1. 📋 Product Requirements

- ✅ Problem Statement กำหนดแล้ว (walking route guide สำหรับนักท่องเที่ยวในญี่ปุ่น)
- ✅ Vision กำหนดแล้ว (community-driven, multi-country)
- ✅ Phases วางแผนแล้ว (1-5)
- ✅ User Stories เขียนอย่างเป็นทางการ → [`.claude/docs/user-stories.md`](.claude/docs/user-stories.md)
- ✅ Acceptance Criteria กำหนดต่อ feature → [`.claude/docs/acceptance-criteria.md`](.claude/docs/acceptance-criteria.md)
- ✅ Out of Scope document → [`.claude/docs/out-of-scope.md`](.claude/docs/out-of-scope.md)
- ✅ Competitive Analysis → [`.claude/docs/competitive-analysis.md`](.claude/docs/competitive-analysis.md)

---

## 2. 🏗️ System Architecture

### Infrastructure
- ✅ Tech stack กำหนดแล้ว (Nuxt 3, Prisma, PostgreSQL, Railway)
- ✅ Dual-schema (SQLite dev / PostgreSQL prod)
- ✅ Dockerfile + Railway deploy config
- ✅ Multi-layout system (default + admin)
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
- ✅ RouteRequest model (Phase 4 — user ขอเส้นทาง) + Vote model
- ❌ Review / Rating model (Phase 5)
- ❌ SavedRoute model (Phase 5 — bookmark)
- ❌ Photo model (Phase 5 — user-uploaded photos)
- ❌ Tag model (many-to-many กับ Route)
- ❌ Soft delete strategy (deletedAt field)
- ❌ Audit log (ใครแก้อะไร เมื่อไหร่)

---

## 4. 🔌 API Design

### Endpoints (ทำแล้ว)
- ✅ GET /api/routes (list + filter + search + pagination + source filter)
- ✅ GET /api/routes/:id (detail + steps + visibility check)
- ✅ POST /api/routes (user + admin create, sets status/source by role)
- ✅ PUT /api/routes/:id (owner-or-admin update)
- ✅ DELETE /api/routes/:id (owner-or-admin delete)
- ✅ PUT /api/routes/:id/status (publish/unpublish by owner or admin)
- ✅ GET /api/my/routes (user's own routes with status filter)
- ✅ GET /api/route-requests (list + city/status/sort filter)
- ✅ POST /api/route-requests (user create request)
- ✅ PUT /api/route-requests/:id (owner edit pending request)
- ✅ DELETE /api/route-requests/:id (owner-or-admin delete)
- ✅ POST /api/route-requests/:id/vote (toggle upvote)
- ✅ GET /api/admin/route-requests (admin list all requests)
- ✅ PUT /api/admin/route-requests/:id/status (admin fulfill/close)
- ✅ GET /api/cities
- ✅ GET /api/auth/google (OAuth)
- ✅ GET /api/admin/stats (admin dashboard stats + totalRequests + pendingRequests)

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
- ✅ Client-side admin route guard (middleware/admin.ts)
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
- ❌ Admin panel flows (create/edit/delete route)

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
- ✅ Form validation feedback (inline errors)
- ✅ Toast notifications (success/error/info)
- ✅ Confirmation dialogs (ก่อน delete)
- ❌ Offline support (PWA?)
- ❌ Accessibility audit (WCAG 2.1)
- ❌ English language support

---

## Phase Completion Status

### Phase 1 ✅ Frontend UI
- [x] Homepage, Routes list, Route detail, Search pages
- [x] Responsive components, Leaflet map, Thai i18n

### Phase 2 ✅ Backend + Database + Auth
- [x] PostgreSQL + Prisma (User, Route, Step models)
- [x] CRUD API routes + Zod validation
- [x] Google OAuth + role-based auth (USER/ADMIN)
- [x] Railway deployment + seeded data
- [x] Loading/Error/Empty states ทุกหน้า

### Phase 3 ✅ Admin Panel + Content Creation
- [x] Admin layout (sidebar + header bar) + route middleware
- [x] Admin dashboard (stats: total routes, by city, by difficulty, recent routes)
- [x] Route management list (table/cards, edit/delete actions)
- [x] Route form — create & edit (basic info, location pickers, tags, steps)
- [x] Step editor (add/reorder/delete, collapsible, Leaflet map per step)
- [x] Client-side form validation (mirrors Zod schema)
- [x] Toast notifications + confirmation dialogs
- [x] Admin link in AppHeader (for admin users only)
- [x] i18n: admin.* translation keys (Thai)
- [x] Tested: 10/10 tests passed (dashboard, list, create, edit, validation, sidebar, header, desktop, navigation, no errors)

### 🟡 ทำเอง (Important)
- [ ] Google OAuth redirect URI ใน Google Cloud Console
- [ ] Image storage (Cloudinary)

### Phase 4 ✅ Community Features (User Routes + Route Requests + Voting)
- [x] Route model: added `status` (draft/published/unpublished) and `source` (official/community)
- [x] RouteRequest + Vote models (with denormalized voteCount + unique vote constraint)
- [x] User-generated routes: POST /api/routes now open to all users (sets draft/community for users, published/official for admin)
- [x] Route ownership: PUT/DELETE /api/routes/:id checks owner-or-admin, added `requireOwnerOrAdmin()` utility
- [x] Route publish/unpublish: PUT /api/routes/:id/status endpoint (users can draft→published own routes, admin can set any status)
- [x] My Routes page (/my/routes): user dashboard with status tabs (all/draft/published/unpublished) + publish/edit/delete actions
- [x] User create/edit route pages (/routes/create, /my/routes/:id/edit): reuse AdminRouteForm component
- [x] Route Requests CRUD: GET/POST/PUT/DELETE /api/route-requests with city/status/sort filters
- [x] Vote toggle: POST /api/route-requests/:id/vote with atomic vote count update
- [x] Route Requests frontend: browse requests at /route-requests, create at /route-requests/create, vote with toggle button
- [x] Admin route requests management: /admin/route-requests page with table, status filter, fulfill/close/delete actions
- [x] Shared components: SourceBadge (official/community), StatusBadge (draft/published/unpublished), CreatorInfo, VoteButton
- [x] Route listing: added source filter chips (all/official/community), SourceBadge on cards
- [x] Navigation: added "คำขอเส้นทาง" link + "เส้นทางของฉัน"/"สร้างเส้นทาง" in user menu + admin sidebar
- [x] Auth middleware: /my/routes, /routes/create, /route-requests/create require login
- [x] Type safety: RouteStatus, RouteSource, RequestStatus, RouteRequest interface types
- [x] TypeScript fixes: Zod v4 .errors → .issues compatibility, Prisma client regenerated
- [x] PR opened: https://github.com/Jirantanin/JamJapan/pull/4

### Phase 5+ (Next)
- [ ] Tests (Vitest + Playwright)
- [ ] CI/CD (GitHub Actions)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Rate limiting
- [ ] Multi-country support
- [ ] Review/Rating system
- [ ] Saved routes (bookmarks)
