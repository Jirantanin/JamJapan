# JamJapan — Acceptance Criteria

> อัพเดทล่าสุด: 2026-03-10
> Acceptance Criteria แบบ Given/When/Then ผูกกับ User Story IDs
> Phase 1-4: AC ละเอียด (testable) | Phase 5+: AC คร่าวๆ (placeholder)

---

## Phase 1 — Public Browsing

### US-1.1: ดู Homepage

**AC-1.1.1: แสดง Hero Section และ Popular Routes**
- Given: ผู้เยี่ยมชมเปิดหน้าแรก
- When: หน้าโหลดเสร็จ
- Then: เห็น hero section, popular routes (สูงสุด 6 เส้นทาง), city shortcut pills ครบถ้วน

**AC-1.1.2: Navigate ไปหน้า Routes ตามเมือง**
- Given: ผู้เยี่ยมชมคลิก city pill "โตเกียว"
- When: คลิกสำเร็จ
- Then: navigate ไปหน้า `/routes?city=tokyo` และแสดงเส้นทางในเมืองโตเกียว

---

### US-1.2: ดูรายการเส้นทาง

**AC-1.2.1: แสดง Route Cards ทั้งหมด**
- Given: ผู้เยี่ยมชมเปิด `/routes`
- When: หน้าโหลดเสร็จ
- Then: แสดง route cards ของเส้นทางทั้งหมดที่มี status=published

**AC-1.2.2: Filter ตามเมือง**
- Given: ผู้เยี่ยมชมเลือก filter city=osaka
- When: filter เปลี่ยน
- Then: แสดงเฉพาะเส้นทางที่อยู่ในเมือง osaka

**AC-1.2.3: Filter ตามความยาก**
- Given: ผู้เยี่ยมชมเลือก filter difficulty=easy
- When: filter เปลี่ยน
- Then: แสดงเฉพาะเส้นทางที่มี difficulty="easy"

**AC-1.2.4: Empty State เมื่อไม่มีเส้นทาง**
- Given: ไม่มีเส้นทางที่ตรงกับ filter ที่เลือก
- When: filter ถูกใช้งาน
- Then: แสดง empty state message "ไม่พบเส้นทาง" + icon

---

### US-1.3: ดูรายละเอียดเส้นทาง

**AC-1.3.1: แสดงข้อมูลเส้นทางครบถ้วน**
- Given: ผู้เยี่ยมชมเปิด `/routes/:id`
- When: หน้าโหลดเสร็จ
- Then: แสดง title, description, difficulty badge, distance, estimated time, tags, cover image

**AC-1.3.2: แสดง Step Cards ตามลำดับ**
- Given: เส้นทางมี 5 steps
- When: เปิดหน้า route detail
- Then: แสดง step cards 5 ใบ เรียงตาม order จากน้อยไปมาก

**AC-1.3.3: แสดง Step Card Details**
- Given: step card แสดงในหน้า
- When: ดูข้อมูล step
- Then: มี instruction, image (ถ้ามี), distance from previous, note (ถ้ามี), location name

**AC-1.3.4: แสดง Leaflet Map พร้อม Markers**
- Given: ผู้เยี่ยมชมเปิด route detail
- When: หน้าโหลดเสร็จ
- Then: Leaflet map แสดง start marker, end marker, และ step markers ทั้งหมด

**AC-1.3.5: Error Page เมื่อไม่พบ Route**
- Given: route ที่ระบุไม่มีอยู่ในระบบ
- When: ขณะเปิด `/routes/:id`
- Then: แสดง 404 error page

---

### US-1.4: ค้นหาเส้นทาง

**AC-1.4.1: ค้นหาจาก Title/Description/Tags/Location**
- Given: ผู้เยี่ยมชมพิมพ์ "shinjuku" ในช่อง search
- When: กด Enter หรือคลิก search button
- Then: แสดงเส้นทางที่มี "shinjuku" ใน title, description, tags, หรือ location names

**AC-1.4.2: Empty State เมื่อค้นหาไม่เจอ**
- Given: ค้นหา "xyz" ไม่มีผลลัพธ์
- When: ค้นหาสำเร็จ
- Then: แสดง "ไม่พบเส้นทางที่ค้นหา" + suggestion to browse all routes

---

### US-1.5: Map-Step Synchronization

**AC-1.5.1: Map ซูมไปที่ Step เมื่อคลิก Step Card**
- Given: ผู้เยี่ยมชมคลิก step card ที่ 3
- When: คลิกสำเร็จ
- Then: map ซูมไปที่ marker ของ step นั้น + marker highlight

**AC-1.5.2: Step Card Highlight เมื่อคลิก Marker**
- Given: ผู้เยี่ยมชมคลิก marker บนแผนที่
- When: คลิกสำเร็จ
- Then: step card ที่สอดคล้องกัน highlight + scroll into view

---

### US-1.6: ข้อมูลเส้นทางในการ์ด

**AC-1.6.1: Route Card แสดง Difficulty, Time, Distance**
- Given: route card แสดงในหน้า routes
- When: ดูการ์ด
- Then: เห็น difficulty badge (easy/medium/hard), estimated time (นาที), distance (เมตรหรือกิโลเมตร) ครบถ้วน

---

## Phase 2 — Authentication

### US-2.1: Login ด้วย Google OAuth

**AC-2.1.1: Redirect ไป Google OAuth**
- Given: ผู้เยี่ยมชมคลิก "เข้าสู่ระบบ" button
- When: คลิกสำเร็จ
- Then: redirect ไปยัง Google OAuth consent screen

**AC-2.1.2: Redirect กลับและ Set Session Cookie**
- Given: user OAuth สำเร็จ
- When: Google redirect กลับไปยัง app
- Then: session cookie ถูกสร้าง (expiry = 7 วัน) + redirect ไปยัง homepage หรือ return URL

**AC-2.1.3: สร้าง User Record ครั้งแรก**
- Given: user login ครั้งแรก
- When: OAuth สำเร็จ
- Then: สร้าง User record ใน DB พร้อม email, name, avatar จาก Google + role=USER

**AC-2.1.4: Set Admin Role จาก環境変数**
- Given: email ที่ login อยู่ใน NUXT_ADMIN_EMAILS
- When: OAuth สำเร็จ
- Then: set role=ADMIN แทน role=USER

---

### US-2.2: Profile Menu ใน Header

**AC-2.2.1: แสดง Avatar และ Name เมื่อ Logged In**
- Given: user เข้าสู่ระบบแล้ว
- When: ดูส่วน header
- Then: แสดง user avatar + name ตรงมุมขวา

**AC-2.2.2: Dropdown Menu พร้อมตัวเลือก**
- Given: user click avatar ใน header
- When: คลิกสำเร็จ
- Then: เห็น dropdown menu ที่มี:
  - "เส้นทางของฉัน" (link to /my/routes)
  - "สร้างเส้นทาง" (link to /routes/create)
  - "admin" (link to /admin, เฉพาะ admin role)
  - "ออกจากระบบ" (logout)

---

### US-2.3: Logout

**AC-2.3.1: Clear Session และ Redirect**
- Given: user click "ออกจากระบบ" ใน dropdown menu
- When: คลิกสำเร็จ
- Then: session cookie ถูกลบ + user redirect ไปยัง homepage

---

## Phase 3 — Admin Features

### US-3.1: Admin Dashboard

**AC-3.1.1: แสดง Dashboard Stats**
- Given: admin เปิด `/admin`
- When: หน้าโหลดเสร็จ
- Then: แสดง:
  - Total routes count
  - Routes grouped by city
  - Routes grouped by difficulty
  - 5 recent routes (latest by createdAt)

**AC-3.1.2: Redirect Non-Admin to Homepage**
- Given: non-admin user เปิด `/admin`
- When: middleware ตรวจสอบ role
- Then: redirect ไปยัง homepage (401/403)

---

### US-3.2: Admin สร้าง Route

**AC-3.2.1: Route สร้างสำเร็จ**
- Given: admin กรอก form ครบ (title, city, difficulty, distance, estimatedMinutes, start/end location, steps)
- When: submit form
- Then: route สร้างเป็น status=published, source=official + toast success message

**AC-3.2.2: Validation Error - Duplicate Slug**
- Given: slug id ซ้ำกับเส้นทางที่มีอยู่
- When: submit form
- Then: error message "Route with this ID already exists" ใต้ slug field

**AC-3.2.3: Validation Error - Missing Required Fields**
- Given: required field (เช่น title, city) ยังว่าง
- When: submit form
- Then: inline errors แสดงใต้ field ที่ผิด + form ไม่ submit

---

### US-3.3: Admin แก้ไข Route

**AC-3.3.1: Form Pre-filled ด้วยข้อมูลเดิม**
- Given: admin เปิด `/admin/routes/:id/edit`
- When: หน้าโหลดเสร็จ
- Then: form fields pre-filled ด้วยข้อมูล route เดิม

**AC-3.3.2: Route Updated สำเร็จ**
- Given: admin แก้ไข field และ submit
- When: submit form
- Then: route updated + toast success message

---

### US-3.4: Admin ลบ Route

**AC-3.4.1: Confirm Dialog**
- Given: admin click "ลบ" button
- When: คลิกสำเร็จ
- Then: แสดง confirm dialog "ลบเส้นทาง '[title]' หรือไม่?"

**AC-3.4.2: Route Deleted**
- Given: admin confirm การลบ
- When: confirm สำเร็จ
- Then: route deleted จาก DB + toast success + redirect ไป /admin/routes

---

### US-3.5: Route Management Table

**AC-3.5.1: แสดงตาราง Routes ทั้งหมด**
- Given: admin เปิด `/admin/routes`
- When: หน้าโหลดเสร็จ
- Then: แสดงตาราง routes ทั้งหมด พร้อม columns:
  - ID (slug)
  - Title
  - City
  - Difficulty
  - Status (published/draft)
  - Source (official/community)
  - Edit/Delete buttons

---

## Phase 4 — Community Features

### US-4.1: User สร้าง Route

**AC-4.1.1: สร้าง Route Form**
- Given: user (logged in) เปิด `/routes/create`
- When: หน้าโหลดเสร็จ
- Then: แสดง form เหมือน admin create route

**AC-4.1.2: Route สร้างเป็น Draft**
- Given: user submit form
- When: submit สำเร็จ
- Then: route สร้างเป็น status=draft, source=community + redirect ไป /my/routes

**AC-4.1.3: Redirect ถ้า Not Logged In**
- Given: user ยังไม่ login พยายามเปิด `/routes/create`
- When: access page
- Then: redirect ไป homepage + show toast "โปรดเข้าสู่ระบบก่อน"

---

### US-4.2: My Routes Dashboard

**AC-4.2.1: แสดง Routes ของ User เท่านั้น**
- Given: user เปิด `/my/routes`
- When: หน้าโหลดเสร็จ
- Then: แสดงเฉพาะ routes ที่ createdById = current user

**AC-4.2.2: Filter ตามสถานะ**
- Given: user select filter "draft" จาก status dropdown
- When: filter เปลี่ยน
- Then: แสดงเฉพาะ draft routes ของ user

**AC-4.2.3: Empty State**
- Given: user ไม่มี routes
- When: เปิด `/my/routes`
- Then: แสดง "คุณยังไม่มีเส้นทาง" + button "สร้างเส้นทาง"

---

### US-4.3: Publish Draft Route

**AC-4.3.1: Publish Status**
- Given: user click "เผยแพร่" บน draft route card
- When: คลิกสำเร็จ
- Then: status เปลี่ยนจาก draft → published + toast success

**AC-4.3.2: Route ปรากฏใน Public Listing**
- Given: route ถูก publish
- When: user เปิด `/routes`
- Then: route ปรากฏในรายการ routes สาธารณะ

---

### US-4.4: แก้ไข/ลบ Route ตัวเอง

**AC-4.4.1: User แก้ไข Route ตัวเอง**
- Given: user click "แก้ไข" บน route ของตัวเอง
- When: submit changes
- Then: route updated + toast success

**AC-4.4.2: Authorization Check - ลบ Route ของคนอื่น**
- Given: user พยายาม PUT/DELETE route ของคนอื่น
- When: request ส่งไปยัง API
- Then: API return 403 Forbidden + error message "ไม่มีสิทธิ์แก้ไขเส้นทางนี้"

**AC-4.4.3: Delete Route**
- Given: user click "ลบ" บน route ของตัวเอง
- When: confirm deletion
- Then: route deleted + toast success

---

### US-4.5: Source Badge

**AC-4.5.1: Official Badge**
- Given: route source=official
- When: แสดง route card
- Then: badge สีเขียว "Official" ปรากฏ

**AC-4.5.2: Community Badge**
- Given: route source=community
- When: แสดง route card
- Then: badge สีน้ำเงิน "Community" ปรากฏ

---

### US-4.6: Source Filter

**AC-4.6.1: Filter Official Routes**
- Given: user select filter source=official
- When: filter เปลี่ยน
- Then: แสดงเฉพาะ official routes

**AC-4.6.2: Filter Community Routes**
- Given: user select filter source=community
- When: filter เปลี่ยน
- Then: แสดงเฉพาะ community routes

---

### US-4.7: Route Request

**AC-4.7.1: Submit Route Request**
- Given: user submit request form (title, city, start, end, description)
- When: submit สำเร็จ
- Then: request สร้างเป็น status=pending, voteCount=0 + toast success

**AC-4.7.2: Validation Error**
- Given: required field ยังว่าง
- When: submit form
- Then: inline errors แสดงใต้ field ที่ผิด

---

### US-4.8: Vote on Route Request

**AC-4.8.1: Vote Success**
- Given: logged-in user click vote button บน request
- When: คลิกสำเร็จ
- Then: voteCount +1, button แสดง voted state (เช่น filled heart)

**AC-4.8.2: Unvote**
- Given: user click vote button อีกครั้ง (unvote)
- When: คลิกสำเร็จ
- Then: voteCount -1, button แสดง not-voted state

**AC-4.8.3: Login Required**
- Given: not-logged-in user click vote
- When: คลิกสำเร็จ
- Then: toast error "โปรดเข้าสู่ระบบก่อน"

---

### US-4.9: Admin ดู Route Requests

**AC-4.9.1: แสดงตาราง Requests**
- Given: admin เปิด `/admin/route-requests`
- When: หน้าโหลดเสร็จ
- Then: แสดงตาราง requests sorted by voteCount (descending)

**AC-4.9.2: Filter ตามสถานะ**
- Given: admin select filter status=pending
- When: filter เปลี่ยน
- Then: แสดงเฉพาะ pending requests

---

### US-4.10: Admin จัดการ Route Requests

**AC-4.10.1: Mark as Fulfilled**
- Given: admin click "สร้างแล้ว" button
- When: คลิกสำเร็จ
- Then: status เปลี่ยนจาก pending → fulfilled + toast success

**AC-4.10.2: Close Request**
- Given: admin click "ปิด" button
- When: คลิกสำเร็จ
- Then: status เปลี่ยนจาก pending → closed + toast success

---

## Phase 5+ — Future Features (Placeholder)

### US-5.1: Multi-Language Support

**AC-5.1.1: ภาษาอังกฤษ**
- Given: user เปลี่ยนภาษาเป็น English
- When: เลือกจาก language selector
- Then: จะเพิ่มรายละเอียดเมื่อถึงเวลา implement

**AC-5.1.2: ภาษาญี่ปุ่น**
- Given: user เปลี่ยนภาษาเป็น 日本語
- When: เลือกจาก language selector
- Then: จะเพิ่มรายละเอียดเมื่อถึงเวลา implement

---

### US-5.2: Multi-Country Support

**AC-5.2.1: เลือกประเทศ**
- Given: user เลือกประเทศอื่นนอกจากญี่ปุ่น
- When: ขณะ browse routes
- Then: จะเพิ่มรายละเอียดเมื่อถึงเวลา implement

---

### US-5.3: Advanced Filtering

**AC-5.3.1: Filter ตามประเภท (Tags)**
- Given: user เลือก tags เหลือหลาย
- When: apply filter
- Then: จะเพิ่มรายละเอียดเมื่อถึงเวลา implement

---

### US-5.4: Favorite Routes

**AC-5.4.1: Save Favorite**
- Given: user click heart button
- When: คลิกสำเร็จ
- Then: จะเพิ่มรายละเอียดเมื่อถึงเวลา implement

---

### US-5.5: Route Reviews & Ratings

**AC-5.5.1: Leave Review**
- Given: user ดูหน้า route detail
- When: click "ให้คะแนน" button
- Then: จะเพิ่มรายละเอียดเมื่อถึงเวลา implement

---

### US-5.6: Social Sharing

**AC-5.6.1: Share to Social Media**
- Given: user click share button
- When: เลือกวิธีแชร์
- Then: จะเพิ่มรายละเอียดเมื่อถึงเวลา implement

---

### US-5.7: Offline Support

**AC-5.7.1: Download Route Map**
- Given: user เปิด route detail
- When: click "ดาวน์โหลด"
- Then: จะเพิ่มรายละเอียดเมื่อถึงเวลา implement

---

## Cross-Cutting Concerns

### Loading States

**AC-CC.1.1: Skeleton Loading ขณะ Fetch Data**
- Given: ผู้ใช้เปิดหน้าที่ต้อง fetch data (routes, route detail)
- When: ขณะโหลด data
- Then: แสดง skeleton loaders/spinners แทน content

**AC-CC.1.2: Progress Indicator**
- Given: operation ที่ใช้เวลา (เช่น upload image)
- When: ขณะทำงาน
- Then: แสดง progress bar หรือ loading indicator

---

### Error States

**AC-CC.2.1: API Error Message**
- Given: API request ล้มเหลว
- When: ได้ error response
- Then: แสดง user-friendly error message + retry button

**AC-CC.2.2: Network Error**
- Given: ไม่มีการเชื่อมต่ออินเทอร์เน็ต
- When: ขณะ fetch
- Then: แสดง "เกิดข้อผิดพลาด กรุณาตรวจสอบการเชื่อมต่อ" + retry option

---

### Responsive Design

**AC-CC.3.1: Mobile View (< 640px)**
- Given: ผู้ใช้เข้าจาก mobile device
- When: ใช้งาน app
- Then: layout ปรับให้เหมาะสม, readable text, touchable buttons (48px+), single column

**AC-CC.3.2: Tablet View (640px - 1024px)**
- Given: ผู้ใช้เข้าจาก tablet
- When: ใช้งาน app
- Then: layout ปรับให้เหมาะสม, 2-column grid (routes card), readable text

**AC-CC.3.3: Desktop View (1024px+)**
- Given: ผู้ใช้เข้าจาก desktop
- When: ใช้งาน app
- Then: layout ปรับให้เหมาะสม, 3-column grid (routes card), full width

---

### Internationalization (i18n)

**AC-CC.4.1: ข้อความทั้งหมดเป็นภาษาไทย**
- Given: user เปิด app
- When: ดูส่วนต่างๆ
- Then: UI text ทั้งหมด (buttons, labels, messages) แสดงเป็นภาษาไทย

**AC-CC.4.2: Date/Time Format**
- Given: app แสดงวันที่/เวลา
- When: display
- Then: ใช้ format ภาษาไทย (วจ. ปค. xxxx, เวลา HH:MM)

---

### Toast Notifications

**AC-CC.5.1: Success Toast**
- Given: action สำเร็จ (create, update, delete, login)
- When: action complete
- Then: success toast แสดง 3 วินาที + ข้อความอธิบาย

**AC-CC.5.2: Error Toast**
- Given: action ล้มเหลว
- When: error occur
- Then: error toast แสดง 3 วินาที (สามารถปิดได้เร็วกว่า)

**AC-CC.5.3: Info Toast**
- Given: ข้อมูล/warning ที่ต้องแจ้ง
- When: display
- Then: info toast แสดง 3 วินาที

---

## Notes for Implementation

- **Test Coverage**: ทุก AC ควร cover ด้วย automated tests (unit/integration/e2e)
- **Definition of Done**: Feature ถือว่า done เมื่อ AC ทั้งหมดผ่าน + code review + documentation
- **User Feedback**: เมื่อ implement Phase 5+, ควร collect feedback จาก users ก่อน final AC
- **Browser Compatibility**: ทดสอบบน Chrome, Firefox, Safari, Edge
- **Accessibility**: ทุก interactive element ต้อง WCAG 2.1 AA compliant
