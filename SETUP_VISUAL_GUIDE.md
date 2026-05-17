# Visual Setup Guide - Hình Ảnh Hướng Dẫn

## 1️⃣ Database Migration Flow

```
Step 1: Supabase Console
┌─────────────────────────────┐
│  https://app.supabase.com   │
│                             │
│  Select Project: FlowerStore│
│  Click: SQL Editor          │
│  Click: New Query           │
└──────────────┬──────────────┘
               │
Step 2: Copy & Paste SQL
┌─────────────────────────────┐
│  /scripts/create-tables.sql │
│  └─ Copy toàn bộ nội dung   │
│                             │
│  Paste vào SQL Editor       │
└──────────────┬──────────────┘
               │
Step 3: Execute
┌─────────────────────────────┐
│  Click "Execute"            │
│  Chờ xanh lá ✅             │
│  Không có red errors        │
└──────────────┬──────────────┘
               │
Step 4: Verify
┌─────────────────────────────┐
│  Table Editor               │
│  ✅ staff                   │
│  ✅ delivery_schedule       │
│  ✅ email_logs              │
│  ✅ order_extensions        │
└─────────────────────────────┘
```

---

## 2️⃣ SMTP Setup Flow (Gmail)

```
Gmail Setup
├── 1. Bật 2FA
│   └─ https://myaccount.google.com/security
│      Click "2-Step Verification" → Complete
│
├── 2. Tạo App Password
│   └─ https://myaccount.google.com/apppasswords
│      App: Mail
│      Device: Windows Computer
│      Generate → Copy 16-char password
│
├── 3. Tạo .env.local
│   └─ Project root folder
│      SMTP_HOST=smtp.gmail.com
│      SMTP_PORT=587
│      SMTP_USER=your_email@gmail.com
│      SMTP_PASS=copied_password_here
│      SMTP_FROM=noreply@flowerstore.com
│
└── 4. Ready!
    └─ Email system active ✅
```

---

## 3️⃣ Setup Timeline

```
                SETUP FLOWCHART
                ================

        ┌─────────────────────┐
        │   START HERE.md     │  ← You are here
        │    (Overview)       │
        └──────────┬──────────┘
                   │ Read QUICK_START.md
                   ▼
        ┌─────────────────────┐
        │  QUICK_START.md     │  ← 5 min overview
        │  (5 minute setup)   │
        └──────────┬──────────┘
                   │ Need detail?
                   ▼
        ┌─────────────────────┐
        │ SETUP_GUIDE_VI.md   │  ← Full guide (30 min)
        │  (Step by step)     │
        └──────────┬──────────┘
                   │ During setup
                   ▼
        ┌─────────────────────┐
        │SETUP_CHECKLIST.md   │  ← Track progress
        │  (15 Phase List)    │
        └──────────┬──────────┘
                   │ Need tech info?
                   ▼
        ┌─────────────────────┐
        │ENHANCEMENT_SUMMARY  │  ← Technical docs
        │  (API + Database)   │
        └─────────────────────┘
```

---

## 4️⃣ Feature Activation Timeline

```
Phase 1         Phase 2         Phase 3         Phase 4
Database        SMTP            Staff           Test
Setup           Config          Setup           Verification
(5 min)         (5 min)         (5 min)         (5 min)
   │               │               │               │
   ▼               ▼               ▼               ▼

SQL          .env.local       /admin/staff    /admin/emails
Migration    SMTP_HOST=...    Add Members     Check Logs
  Created      Created            Added          Verified


        ✅ All Systems Ready!

        Can Now:
        ├─ Auto-schedule deliveries
        ├─ Assign staff automatically
        ├─ Send emails automatically
        ├─ View admin dashboard
        └─ Manage everything
```

---

## 5️⃣ Testing Flow

```
1️⃣ ADD STAFF
   http://localhost:3000/admin/staff
   
   Add Staff Button
   ├─ Name: Nguyễn Văn A
   ├─ Email: staff1@example.com
   ├─ Phone: 0912345678
   └─ Click "Create" ✅


2️⃣ BROWSE SHOP
   http://localhost:3000/shop
   
   Product Card
   ├─ Click Product
   ├─ See Details
   └─ Add to Cart ✅


3️⃣ CHECKOUT
   http://localhost:3000/checkout
   
   Checkout Steps:
   ├─ Step 1: Delivery Info
   ├─ Step 2: Delivery Method
   ├─ Step 3: Payment Method
   └─ Step 4: Review & Complete ✅


4️⃣ CHECK SCHEDULE
   http://localhost:3000/admin/schedule
   
   Automated:
   ├─ Order Created ✅
   ├─ Delivery Scheduled (1 hour later) ✅
   ├─ Staff Auto-Assigned ✅
   └─ Status: "scheduled" ✅


5️⃣ CHECK EMAILS
   http://localhost:3000/admin/emails
   
   Email Types:
   ├─ order-confirmation ✅
   ├─ payment-success ✅
   ├─ staff-assignment ✅
   └─ admin-notification ✅
   
   Status: "sent" ✅
```

---

## 6️⃣ URL Map

```
CUSTOMER JOURNEY          ADMIN MANAGEMENT
─────────────────        ──────────────────

/                         /admin
  └─ Homepage               └─ Dashboard
     (colorful!)              (stats)

/shop                     /admin/staff
  └─ Product List           └─ Staff Management
     (colorful cards)           (CRUD)

/shop/:slug               /admin/schedule
  └─ Product Detail         └─ Delivery Schedule
     (more details)             (track + update)

/cart                     /admin/emails
  └─ Shopping Cart          └─ Email Logs
     (review items)            (monitor)

/checkout
  └─ 4-Step Checkout
     (payment)
```

---

## 7️⃣ Color Scheme Preview

```
🎨 COLORFUL & PLAYFUL THEME

Primary Colors:
┌─────────────────┐
│ Rose Pink       │  #e75480  ← Main color
│ ███████████████ │
└─────────────────┘

Secondary Colors:
┌─────────────────┐
│ Light Pink      │  #f0689e  ← Accent
│ ███████████████ │
└─────────────────┘

┌─────────────────┐
│ Cyan Blue       │  #6dd5ed  ← Highlight
│ ███████████████ │
└─────────────────┘

Background:
┌─────────────────┐
│ Cream           │  #fdf9f5  ← Background
│ ███████████████ │
└─────────────────┘

Usage:
- Buttons: Rose Pink
- Text: Dark Gray
- Borders: Rose Pink / Cyan
- Backgrounds: Cream
- Gradients: Pink → Cyan
```

---

## 8️⃣ Email Sending Flow

```
Customer Places Order
        │
        ▼
    API Call
    POST /api/orders/events
        │
        ├──────────────────────┐
        │                      │
        ▼                      ▼
   DB Updates          Auto Schedule
   - Order created     - Time: now + 1 hour
   - Save details      - Staff assigned
                       - Conflict check
                       │
                       └─ Shift 30 min if needed
                              │
                              ▼
        ┌─────────────────────────────┐
        │  EMAIL SENDING (SMTP)       │
        ├─────────────────────────────┤
        │ ✉️ order-confirmation       │  → Customer
        │ ✉️ payment-success          │  → Customer
        │ ✉️ staff-assignment         │  → Staff
        │ ✉️ admin-notification       │  → Admin
        └──────────┬──────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ EMAIL_LOGS TABLE     │
        ├──────────────────────┤
        │ Logged:              │
        │ - Type               │
        │ - Recipient          │
        │ - Status: "sent"     │
        │ - Timestamp          │
        │ - Error (if any)     │
        └──────────────────────┘
                   │
                   ▼
        /admin/emails shows all ✅
```

---

## 9️⃣ File Structure Overview

```
/vercel/share/v0-project/
│
├── 📁 lib/
│   ├── 📄 email/
│   │   ├── smtp.ts           (SMTP transporter)
│   │   ├── templates.ts      (6 email templates)
│   │   └── layout.ts         (HTML email layout)
│   ├── scheduling.ts         (Auto-scheduling)
│   ├── staff.ts              (Staff functions)
│   └── db.ts                 (Database queries)
│
├── 📁 app/
│   ├── 📁 api/
│   │   ├── orders/events/
│   │   │   └── route.ts      (Order event API)
│   │   ├── staff/
│   │   │   └── route.ts      (Staff CRUD API)
│   │   ├── deliveries/
│   │   │   └── schedule/
│   │   │       └── route.ts  (Schedule API)
│   │   └── email-logs/
│   │       └── route.ts      (Email logs API)
│   │
│   └── 📁 [locale]/
│       ├── 📁 admin/
│       │   ├── page.tsx          (Dashboard)
│       │   ├── staff/page.tsx    (Staff management)
│       │   ├── schedule/page.tsx (Schedule management)
│       │   └── emails/page.tsx   (Email logs)
│       └── [existing pages]
│
├── 📁 components/
│   ├── home/
│   │   └── hero-section.tsx  (Redesigned with animations)
│   ├── product-card.tsx      (Colorful design)
│   └── [other components]
│
├── 📄 globals.css            (Color scheme + animations)
├── 📄 QUICK_START.md         (5 min guide)
├── 📄 SETUP_GUIDE_VI.md      (Detailed guide)
├── 📄 SETUP_CHECKLIST.md     (Tracking checklist)
├── 📄 ENHANCEMENT_SUMMARY.md (Technical docs)
└── 📄 scripts/
    └── create-tables.sql     (Database migration)
```

---

## 🔟 Troubleshooting Decision Tree

```
IS YOUR SYSTEM WORKING?
        │
        ├─ YES → Go to DEPLOYMENT section
        │
        └─ NO ──┐
                │
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
 Database   SMTP Email   UI/Styling
   Issue      Issue        Issue
    │           │           │
    ├─ Check    ├─ Check    ├─ Clear
    │  SQL      │  .env     │  cache
    │  Exec     │  SMTP     │  Reload
    │           │  Creds    │  Restart
    │           │           │
    ├─ Check    ├─ Check    ├─ Check
    │  Tables   │  Gmail    │  globals
    │  Created  │  App Pass │  .css
    │           │           │
    └─ All OK?  └─ All OK?  └─ All OK?
         │            │           │
         └────┬───────┴─────┬─────┘
              │             │
              ▼             ▼
           WORKS! ✅    See Logs
                      F12 → Console
```

---

## 📊 Setup Progress Tracker

```
SETUP PROGRESS
──────────────────────────────────────────────

[████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 25%
  Phase 1: Database
  ✅ SQL migration
  ✅ Tables created


[████████████████░░░░░░░░░░░░░░░░░░░░░░░░░] 50%
  Phase 2: SMTP
  ✅ .env.local created
  ✅ Gmail App Password


[████████████████████████░░░░░░░░░░░░░░░░░] 75%
  Phase 3: Staff Setup
  ✅ Server running
  ✅ Staff added


[████████████████████████████████████████░░] 95%
  Phase 4: Testing
  ✅ Order created
  ✅ Delivery scheduled
  ✅ Emails sent


[██████████████████████████████████████████] 100%
  ✅ READY FOR DEPLOYMENT!
```

---

## 🎯 Quick Decision Guide

```
What do you need?

1. Fast Setup (5 min)?
   → QUICK_START.md

2. Complete Guide (30 min)?
   → SETUP_GUIDE_VI.md

3. Step-by-step Checklist?
   → SETUP_CHECKLIST.md

4. Technical Details?
   → ENHANCEMENT_SUMMARY.md

5. Visual Guide?
   → You're reading it! 📖
```

---

**Bạn đã sẵn sàng! Hãy bắt đầu từ QUICK_START.md hoặc SETUP_GUIDE_VI.md** 🚀
