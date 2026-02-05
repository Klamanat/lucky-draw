# Lucky Wheel - Implementation Guide

## สรุปโปรเจค
ระบบวงล้อโชคลาภสำหรับงาน Event/โปรโมชั่น
- **Frontend:** React + Vite + TypeScript + TailwindCSS
- **Backend:** Google Apps Script (Web App)
- **Database:** Google Sheet

---

## ขั้นตอนการ Setup

### 1. Setup Google Sheet

1. สร้าง Google Sheet ใหม่ที่ https://sheets.google.com
2. Copy **Spreadsheet ID** จาก URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

### 2. Setup Google Apps Script

1. ในหน้า Google Sheet ไปที่ **Extensions > Apps Script**
2. ลบโค้ดเดิมทั้งหมด แล้ว copy โค้ดจากไฟล์ `google-apps-script/Code.gs`
3. แก้ไขบรรทัด:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```
   เป็น ID ที่ copy มาจากขั้นตอน 1

4. **รัน function `setupSheets`** เพื่อสร้าง sheets และข้อมูลตัวอย่าง:
   - เลือก function: `setupSheets`
   - กด Run (▶️)
   - อนุญาต permissions ที่ขึ้นมา

5. **Deploy เป็น Web App:**
   - ไปที่ **Deploy > New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - กด **Deploy**
   - Copy **Web app URL** ที่ได้

### 3. Setup Frontend

1. สร้างไฟล์ `.env` จาก `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. แก้ไข `.env`:
   ```
   VITE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```

3. ติดตั้ง dependencies และรัน:
   ```bash
   npm install
   npm run dev
   ```

4. เปิด http://localhost:5173

---

## โครงสร้างไฟล์

```
lucky-draw/
├── src/
│   ├── components/
│   │   ├── LuckyWheel/        # วงล้อหมุน
│   │   │   ├── LuckyWheel.tsx
│   │   │   ├── SpinButton.tsx
│   │   │   └── index.ts
│   │   ├── PrizePopup.tsx     # Popup แสดงรางวัล
│   │   ├── LoginForm.tsx      # ฟอร์ม login
│   │   ├── RegisterForm.tsx   # ฟอร์มลงทะเบียน
│   │   └── SpinHistory.tsx    # ประวัติการหมุน
│   ├── pages/
│   │   ├── Home.tsx           # หน้าหมุนวงล้อ
│   │   ├── History.tsx        # หน้าประวัติ
│   │   └── admin/
│   │       ├── Dashboard.tsx  # Admin dashboard
│   │       ├── PrizeManager.tsx # จัดการรางวัล
│   │       └── SpinLogs.tsx   # ประวัติทั้งหมด
│   ├── hooks/
│   │   ├── useAuth.ts         # Authentication hook
│   │   └── useSpin.ts         # Spin logic hook
│   ├── services/
│   │   └── api.ts             # API calls
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── App.tsx                # Main app + routing
│   ├── main.tsx               # Entry point
│   └── index.css              # TailwindCSS styles
├── google-apps-script/
│   └── Code.gs                # Apps Script backend
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── .env.example
```

---

## Google Sheet Structure

### Sheet: `prizes`
| Column | Field | Description |
|--------|-------|-------------|
| A | id | รหัสรางวัล |
| B | name | ชื่อรางวัล |
| C | description | คำอธิบาย |
| D | image_url | URL รูปภาพ |
| E | probability | ความน่าจะเป็น % |
| F | quantity | จำนวน (-1 = ไม่จำกัด) |
| G | is_active | TRUE/FALSE |
| H | color | สี HEX |

### Sheet: `users`
| Column | Field | Description |
|--------|-------|-------------|
| A | id | รหัสผู้ใช้ |
| B | email | อีเมล |
| C | name | ชื่อ |
| D | phone | เบอร์โทร |
| E | spins_remaining | สิทธิ์หมุนคงเหลือ |
| F | role | user / admin |
| G | created_at | วันที่สร้าง |

### Sheet: `spin_history`
| Column | Field | Description |
|--------|-------|-------------|
| A | id | รหัส |
| B | user_id | รหัสผู้ใช้ |
| C | user_name | ชื่อผู้ใช้ |
| D | user_email | อีเมล |
| E | prize_id | รหัสรางวัล |
| F | prize_name | ชื่อรางวัล |
| G | spun_at | วันเวลาที่หมุน |

---

## API Endpoints

| Action | Description |
|--------|-------------|
| `getPrizes` | ดึงรางวัลทั้งหมด |
| `spin` | หมุนวงล้อ (params: userId) |
| `getHistory` | ประวัติหมุนของ user |
| `registerUser` | ลงทะเบียน (POST) |
| `loginUser` | เข้าสู่ระบบ |
| `addPrize` | เพิ่มรางวัล (Admin) |
| `updatePrize` | แก้ไขรางวัล (Admin) |
| `deletePrize` | ลบรางวัล (Admin) |
| `getAllHistory` | ประวัติทั้งหมด (Admin) |
| `getStats` | สถิติ (Admin) |

---

## Features

### User Features
- ✅ ลงทะเบียน / เข้าสู่ระบบ
- ✅ หมุนวงล้อพร้อม animation
- ✅ แสดง popup รางวัลที่ได้
- ✅ ดูสิทธิ์หมุนคงเหลือ
- ✅ ดูประวัติการหมุน

### Admin Features
- ✅ Dashboard สถิติ
- ✅ จัดการรางวัล (เพิ่ม/แก้/ลบ)
- ✅ กำหนด probability แต่ละรางวัล
- ✅ ดูประวัติหมุนทั้งหมด

---

## การใช้งาน

### เข้าสู่ระบบ Admin
- Email: `admin@example.com`
- ไปที่ `/admin`

### เพิ่มผู้ใช้ Admin
แก้ไขใน Google Sheet `users`:
- เพิ่มแถวใหม่
- ตั้ง role เป็น `admin`

### เพิ่มสิทธิ์หมุน
แก้ไข column `spins_remaining` ใน sheet `users`

---

## Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Deployment (Production)

### Frontend → Vercel/Netlify
1. Push code ไป GitHub
2. Connect กับ Vercel/Netlify
3. ตั้ง Environment Variable:
   - `VITE_SCRIPT_URL` = URL ของ Apps Script

### Backend
Google Apps Script deploy แล้วใช้ได้เลย ไม่ต้องมี server แยก
