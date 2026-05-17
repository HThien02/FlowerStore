# Quick Start - FlowerStore Enhancement Setup

## ⚡ 5 Minutes to Ready

### Step 1: Database Setup (1 min)
Go to **Supabase SQL Editor** and run:
```sql
-- Copy everything from /scripts/create-tables.sql
-- Paste and Execute
```

### Step 2: Email Configuration (1 min)
Create `.env.local` at project root:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=orders@example.com
```

**Gmail Setup:**
- Enable 2FA: https://myaccount.google.com/security
- Generate App Password: https://myaccount.google.com/apppasswords
- Copy 16-char password to `.env.local`

### Step 3: Start Dev Server (1 min)
```bash
npm run dev
```
Open: **http://localhost:3000**

### Step 4: Add Staff (1 min)
- Go to: **http://localhost:3000/admin/staff**
- Click "Add Staff Member"
- Add 2-3 team members
- Status: Active

### Step 5: Test Full Flow (1 min)
| What | URL | Expected |
|------|-----|----------|
| Add staff | `/admin/staff` | ✅ Listed |
| Place order | `/shop` | ✅ Created |
| View schedule | `/admin/schedule` | ✅ 1 delivery scheduled |
| Check emails | `/admin/emails` | ✅ Emails sent |

---

## 📊 What You Got

✅ **Auto Scheduling**: Deliveries 1 hour after order, shift by 30 min if conflict  
✅ **Staff Management**: Add/edit/delete team members  
✅ **Email System**: 6 types (confirmation, payment, reminder, cancellation, staff, admin)  
✅ **Admin Dashboard**: Manage everything from one place  
✅ **Colorful UI**: Vibrant pink/cyan/cream with animations  
✅ **Bilingual**: English & Vietnamese support  

---

## 📍 Key URLs

**Customer:**
- `/` - Home (new design!)
- `/shop` - Products (colorful cards)
- `/checkout` - Checkout process

**Admin:**
- `/admin` - Dashboard
- `/admin/staff` - Staff management
- `/admin/schedule` - Delivery scheduling
- `/admin/emails` - Email logs

---

## 🐛 Troubleshooting

**Emails not sending?**
- Check `.env.local` SMTP credentials
- Verify Gmail App Password
- See `/admin/emails` for error details

**Delivery not scheduled?**
- Verify staff added at `/admin/staff`
- Check if order created (Supabase orders table)
- See browser console for errors

**Missing colors?**
- Clear cache: **Ctrl+Shift+Delete**
- Refresh: **F5**
- Restart server: **Ctrl+C** then `npm run dev`

---

## 📚 Full Guides

- **Detailed Setup**: See `SETUP_GUIDE_VI.md` (12-step guide in Vietnamese)
- **Tech Details**: See `ENHANCEMENT_SUMMARY.md` (complete documentation)
- **API Reference**: See `/lib/` files with inline comments

---

## ✅ Checklist

- [ ] Run SQL migration
- [ ] Add `.env.local`
- [ ] Run `npm run dev`
- [ ] Add 2+ staff members
- [ ] Test order creation
- [ ] Verify delivery scheduled
- [ ] Check emails sent
- [ ] View colorful homepage

---

## 🚀 Ready!

```bash
npm run dev
```

All features active. Explore `/admin/` for management tools!
