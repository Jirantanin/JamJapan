# JamJapan — Project Context for Agents

## Overview
เว็บแนะนำเส้นทางเดินเท้าในญี่ปุ่น สำหรับนักท่องเที่ยวไทย
Content สร้างโดย admin, ในอนาคตรองรับ community-driven

## Stack
- Nuxt 3 (SSR + Nitro), TypeScript, Vue 3
- Tailwind CSS, @nuxtjs/i18n (Thai default)
- Prisma ORM v7 (SQLite dev / PostgreSQL prod)
- nuxt-auth-utils (Google OAuth + session)
- Leaflet + @vue-leaflet/vue-leaflet (maps)

## Directory Structure
```
pages/           → index.vue, routes/index.vue, routes/[id].vue, search.vue
components/
  common/        → DifficultyBadge.vue, SearchBar.vue
  home/          → HeroSection.vue, PopularRoutes.vue
  layout/        → AppHeader.vue, AppFooter.vue
  route/         → RouteCard.vue, RouteInfo.vue, RouteMap.vue, StepCard.vue
composables/     → useRoutes.ts, useMapSync.ts
server/
  api/
    routes/      → index.get.ts, index.post.ts, [id].get.ts, [id].put.ts, [id].delete.ts
    auth/        → google.get.ts
    cities.get.ts
  utils/         → prisma.ts (getPrisma), transform.ts (transformRoute)
  types/         → auth.d.ts
types/           → route.ts (Route, Step, Location, City, Difficulty)
prisma/          → schema.dev.prisma (SQLite), schema.prisma (PostgreSQL), seed.ts
```

## Coding Conventions
- **Server routes**: `defineEventHandler`, ไฟล์ชื่อ `[route].[method].ts`
- **DB access**: ใช้ `getPrisma()` จาก `server/utils/prisma.ts` เสมอ (async factory)
- **Transform**: ใช้ `transformRoute()` จาก `server/utils/transform.ts` แปลง Prisma model → API response
- **Tags**: เก็บใน DB เป็น JSON string (`"[\"food\",\"tokyo\"]"`), parse ตอน transform
- **Components**: `<script setup lang="ts">`, ≤200 บรรทัด
- **Composables**: `useFetch` / `useAsyncData`, reactive `ref` / `computed`
- **Auth check (server)**: ดู `server/api/routes/index.post.ts` เป็น example
- **No Pinia**: ใช้ Nuxt `useState` หรือ composable refs แทน

## DB Models
```prisma
User    { id, email, name, avatar, role(USER|ADMIN), provider, providerId }
Route   { id(slug), title, description, city, difficulty, estimatedMinutes,
          distanceMeters, coverImage, startLat/Lng/Name, endLat/Lng/Name,
          tags(JSON string), createdById }
Step    { id, order, instruction, image, locationLat/Lng/Name,
          distanceFromPrev, note, routeId }
```

## API Response Format (Route)
```json
{
  "id": "shinjuku-to-golden-gai",
  "title": "สถานี Shinjuku → Golden Gai",
  "city": "tokyo", "difficulty": "medium",
  "estimatedMinutes": 12, "distanceMeters": 800,
  "start": { "lat": 35.68, "lng": 139.70, "name": "..." },
  "end":   { "lat": 35.69, "lng": 139.70, "name": "..." },
  "tags": ["nightlife", "bars"],
  "steps": [{ "order": 1, "instruction": "...", "location": {...} }]
}
```

## Key Reference Files
- `.claude/PROJECT_CHECKLIST.md` — สถานะงานทั้งหมดแยกตาม phase
- `prisma/schema.dev.prisma` — DB schema ฉบับสมบูรณ์
- `server/utils/transform.ts` — transformRoute() logic
- `types/route.ts` — TypeScript interfaces ทั้งหมด
- `server/api/routes/index.get.ts` — ตัวอย่าง API pattern ที่ถูกต้อง
