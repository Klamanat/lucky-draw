# Lucky Wheel - วงล้อโชคลาภ

ระบบวงล้อโชคลาภสำหรับงาน Event/โปรโมชั่น

## Features

- วงล้อหมุนพร้อม animation
- กำหนด % ความน่าจะเป็นแต่ละรางวัลได้
- จำกัดสิทธิ์การหมุนต่อผู้ใช้
- ประวัติการหมุน
- Admin Panel จัดการรางวัล
- เชื่อมต่อ Google Sheet เป็น Database

## Tech Stack

- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend:** Google Apps Script
- **Database:** Google Sheet

## Quick Start (Demo Mode)

```bash
# ติดตั้ง dependencies
npm install

# รัน dev server
npm run dev
```

เปิด http://localhost:5173

**บัญชีทดสอบ:**
- `demo@example.com` - ผู้ใช้ทั่วไป
- `admin@example.com` - Admin

## Setup Google Sheet

### 1. สร้าง Google Sheet

1. ไปที่ https://sheets.google.com สร้าง Sheet ใหม่
2. Copy **Spreadsheet ID** จาก URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

### 2. Setup Google Apps Script

1. ใน Google Sheet ไปที่ **Extensions > Apps Script**
2. ลบโค้ดเดิม แล้ว copy โค้ดจาก `google-apps-script/Code.gs`
3. แก้ไข `SPREADSHEET_ID` ในโค้ด
4. รัน function `setupSheets()` เพื่อสร้าง sheets
5. **Deploy > New deployment > Web app**
   - Execute as: Me
   - Who has access: Anyone
6. Copy Web app URL

### 3. ตั้งค่า Frontend

```bash
# สร้างไฟล์ .env
cp .env.example .env
```

แก้ไข `.env`:
```
VITE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
```

## Commands

```bash
npm run dev      # Development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Project Structure

```
lucky-draw/
├── src/
│   ├── components/     # UI Components
│   ├── pages/          # Pages
│   ├── hooks/          # React Hooks
│   ├── services/       # API calls
│   └── types/          # TypeScript types
├── google-apps-script/
│   └── Code.gs         # Backend code
└── IMPLEMENTATION.md   # รายละเอียดเพิ่มเติม
```

## License

MIT
