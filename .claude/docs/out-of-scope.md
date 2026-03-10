# JamJapan — Out of Scope

> อัพเดทล่าสุด: 2026-03-10
> เอกสารนี้กำหนดขอบเขตของสิ่งที่ JamJapan **ไม่ทำ** เพื่อป้องกัน scope creep

---

## 1. ไม่ใช่ Navigation App
- ❌ Turn-by-turn GPS navigation แบบ real-time (ใช้ Google Maps แทน)
- ❌ Real-time location tracking
- ❌ Voice navigation / audio guidance
- ❌ Car / cycling / transit directions
- ❌ Speed/ETA calculation แบบ real-time
> **JamJapan เป็น walking guide ไม่ใช่ navigator** — ให้ข้อมูล step-by-step พร้อมรูปจุดสังเกต ไม่ใช่ GPS tracking

## 2. ไม่ใช่ Transit Planner
- ❌ Train / bus timetable lookup (ใช้ HyperDia, NAVITIME, Google Maps แทน)
- ❌ Fare calculation (ค่าโดยสาร)
- ❌ IC card integration (Suica, Pasmo)
- ❌ Route optimization (เส้นทางเร็วที่สุด / ถูกที่สุด)
- ❌ Delay / disruption alerts
> **JamJapan ครอบคลุมเฉพาะการเดินเท้า** ระหว่างจุดหมาย (เช่น จากสถานีรถไฟไปร้านอาหาร)

## 3. ไม่ใช่ Social Media Platform
- ❌ User messaging / direct chat
- ❌ User following / followers system
- ❌ News feed / timeline
- ❌ Stories / reels / short video
- ❌ Group / community chat rooms
> **Community features ของ JamJapan จำกัดอยู่ที่** การสร้าง routes, คำขอเส้นทาง, และ voting เท่านั้น

## 4. ไม่ใช่ Booking / E-commerce Platform
- ❌ Hotel / accommodation booking
- ❌ Restaurant reservation
- ❌ Activity / tour booking
- ❌ E-commerce / marketplace
- ❌ Payment processing
- ❌ Coupon / discount system
> **JamJapan ไม่ขายสินค้าหรือบริการ** เป็นแพลตฟอร์ม content อย่างเดียว

## 5. ไม่ใช่ Review / Blog Platform
- ❌ Restaurant / hotel reviews (ใช้ Google Reviews, TripAdvisor แทน)
- ❌ Blog posts / articles
- ❌ Travel diary / journal
- ❌ Photo album / gallery
> **JamJapan เน้น walking route guides** ไม่ใช่ travel blog ทั่วไป — อนาคตอาจเพิ่ม route reviews เฉพาะ

## 6. ไม่รองรับในปัจจุบัน (แต่อาจเพิ่มในอนาคต)
- ⏳ Offline mode / PWA (Planned: Phase 5+)
- ⏳ Multi-language support — English, Japanese (Planned: Phase 5+)
- ⏳ Multi-country support — ประเทศอื่นนอกจากญี่ปุ่น (Planned: Phase 5+)
- ⏳ Native mobile app — iOS/Android (ปัจจุบัน web-only)
- ⏳ Route reviews / ratings (Planned: Phase 5+)
- ⏳ Saved / bookmarked routes (Planned: Phase 5+)
- ⏳ User-uploaded photos (Planned: Phase 5+)
> **สิ่งเหล่านี้อยู่ใน roadmap** แต่ยังไม่ implement — จะทำเมื่อ core features มั่นคงแล้ว

---

## สรุป: JamJapan คืออะไร

✅ **JamJapan คือ:** เว็บแนะนำเส้นทางเดินเท้าในญี่ปุ่น แบบ step-by-step พร้อมรูปจุดสังเกตและแผนที่ สำหรับนักท่องเที่ยวไทย

✅ **JamJapan ทำได้:**
- ดูเส้นทางเดินเท้าพร้อม steps, รูป, แผนที่
- ค้นหาและ filter เส้นทาง
- Login ด้วย Google
- สร้าง/แก้ไข/ลบ routes (user + admin)
- ขอเส้นทางใหม่ + vote
- Admin จัดการ content

❌ **JamJapan ไม่ทำ:**
- Navigation / GPS tracking
- Transit planning / timetable
- Social networking
- Booking / e-commerce
- General travel blogging
