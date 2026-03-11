# JamJapan — User Stories

**Project:** เว็บแนะนำเส้นทางเดินเท้าในญี่ปุ่น สำหรับนักท่องเที่ยวไทย  
**Date:** 2026-03-10  
**Version:** 1.0

---

## Overview
User stories สำหรับ JamJapan แยกตาม phase และ role ของผู้ใช้ (Visitor / User / Admin)

---

## Phase 1 — Public Browsing (6 stories)

### US-1.1
**AS** visitor  
**I WANT** ดู homepage ที่มีเส้นทางยอดนิยมและ city shortcuts  
**SO THAT** เลือกเส้นทางที่น่าสนใจได้เร็ว

### US-1.2
**AS** visitor  
**I WANT** ดูรายการเส้นทางทั้งหมดพร้อม filter ตามเมือง/ความยาก  
**SO THAT** หาเส้นทางที่ตรงกับความต้องการ

### US-1.3
**AS** visitor  
**I WANT** ดูรายละเอียดเส้นทาง step-by-step พร้อมแผนที่และรูป  
**SO THAT** เดินตามได้จริงโดยไม่หลง

### US-1.4
**AS** visitor  
**I WANT** ค้นหาเส้นทางด้วย keyword  
**SO THAT** หาเส้นทางที่รู้ชื่อจุดหมายได้

### US-1.5
**AS** visitor  
**I WANT** กดที่ step แล้วแผนที่ซูมไปจุดนั้น  
**SO THAT** เห็นตำแหน่งจริงบนแผนที่

### US-1.6
**AS** visitor  
**I WANT** เห็นข้อมูลระยะทาง เวลา ความยาก ของทุกเส้นทาง  
**SO THAT** ตัดสินใจเลือกเส้นทางที่เหมาะกับตัวเอง

---

## Phase 2 — Auth & Backend (3 stories)

### US-2.1
**AS** visitor  
**I WANT** login ด้วย Google  
**SO THAT** ใช้งาน features ที่ต้อง login ได้

### US-2.2
**AS** user  
**I WANT** เห็นชื่อและรูปโปรไฟล์ใน header  
**SO THAT** รู้ว่า login อยู่

### US-2.3
**AS** user  
**I WANT** logout ได้  
**SO THAT** ออกจากระบบเมื่อต้องการ

---

## Phase 3 — Admin (5 stories)

### US-3.1
**AS** admin  
**I WANT** ดู dashboard แสดงสถิติ routes ทั้งหมด  
**SO THAT** เห็นภาพรวมของ content

### US-3.2
**AS** admin  
**I WANT** สร้าง route ใหม่พร้อม steps, แผนที่, tags  
**SO THAT** เพิ่ม content ใน platform ได้

### US-3.3
**AS** admin  
**I WANT** แก้ไข route ที่มีอยู่  
**SO THAT** แก้ข้อมูลผิดหรือปรับปรุงเนื้อหาได้

### US-3.4
**AS** admin  
**I WANT** ลบ route  
**SO THAT** เอาเนื้อหาที่ไม่ต้องการออก

### US-3.5
**AS** admin  
**I WANT** จัดการ routes ในหน้าเดียวแบบ table view  
**SO THAT** ดูและจัดการ content ทั้งหมดได้สะดวก

---

## Phase 4 — Community (10 stories)

### US-4.1
**AS** user  
**I WANT** สร้าง route ของตัวเอง  
**SO THAT** แบ่งปันเส้นทางที่ค้นพบให้คนอื่น

### US-4.2
**AS** user  
**I WANT** ดูรายการ route ของฉันพร้อมสถานะ  
**SO THAT** จัดการ content ของตัวเองได้

### US-4.3
**AS** user  
**I WANT** publish draft route ของฉัน  
**SO THAT** เส้นทางปรากฏแก่ทุกคน

### US-4.4
**AS** user  
**I WANT** แก้ไข/ลบ route ของตัวเอง  
**SO THAT** ปรับปรุงหรือเอาออกได้

### US-4.5
**AS** visitor  
**I WANT** เห็น badge "Official"/"Community" บน route card  
**SO THAT** รู้ว่าใครสร้าง

### US-4.6
**AS** visitor  
**I WANT** filter routes ตาม source (official/community)  
**SO THAT** เลือกดูเฉพาะที่ต้องการ

### US-4.7
**AS** user  
**I WANT** ขอเส้นทางใหม่ (route request)  
**SO THAT** บอก community ว่าอยากได้เส้นทางไหน

### US-4.8
**AS** user  
**I WANT** vote คำขอเส้นทางของคนอื่น  
**SO THAT** แสดงความต้องการร่วมกัน

### US-4.9
**AS** admin  
**I WANT** ดูคำขอเส้นทาง sorted by votes  
**SO THAT** รู้ว่าควรสร้างเส้นทางไหนก่อน

### US-4.10
**AS** admin  
**I WANT** mark คำขอเป็น fulfilled/closed  
**SO THAT** จัดการ queue ของคำขอได้

---

## Phase 5+ — Future (7 stories, Placeholder)

*Placeholder — จะเพิ่มรายละเอียดเมื่อถึงเวลา implement*

### US-5.1
**AS** user  
**I WANT** รีวิว/ให้คะแนนเส้นทาง  
**SO THAT** ช่วยคนอื่นเลือก

### US-5.2
**AS** user  
**I WANT** bookmark เส้นทาง  
**SO THAT** กลับมาดูทีหลังได้

### US-5.3
**AS** user  
**I WANT** อัพโหลดรูปจุดสังเกต  
**SO THAT** ช่วยอัพเดทข้อมูลให้ทันสมัย

### US-5.4
**AS** visitor  
**I WANT** ดูเส้นทางในประเทศอื่นนอกจากญี่ปุ่น  
**SO THAT** ใช้ได้ตอนเที่ยวประเทศอื่น

### US-5.5
**AS** visitor  
**I WANT** ใช้เว็บเป็นภาษาอังกฤษ  
**SO THAT** ใช้ได้แม้ไม่รู้ภาษาไทย

### US-5.6
**AS** user  
**I WANT** ใช้งานได้ offline  
**SO THAT** ดูเส้นทางได้แม้ไม่มี internet

### US-5.7
**AS** admin  
**I WANT** เห็น error tracking + analytics  
**SO THAT** ตรวจสอบปัญหาและวัดผลได้

---

## Summary

| Phase | Count | Status |
|-------|-------|--------|
| Phase 1: Public Browsing | 6 | Public features |
| Phase 2: Auth & Backend | 3 | Authentication & user profiles |
| Phase 3: Admin | 5 | Admin content management |
| Phase 4: Community | 10 | User-generated content & voting |
| Phase 5+: Future | 7 | Placeholder — future features |
| **TOTAL** | **31** | |

---

*Last Updated: 2026-03-10*
