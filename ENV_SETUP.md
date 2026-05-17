# 🔑 Cách Setup .env.local

## 1 Phút Setup

### Bước 1: Copy Template
```bash
cp .env.local.example .env.local
```

### Bước 2: Mở File
Mở `.env.local` trong VS Code hoặc editor

### Bước 3: Gmail Setup (Nếu dùng Gmail)

**3.1 Bật 2-Factor Authentication**
- Đi: https://myaccount.google.com/security
- Click **"2-Step Verification"**
- Làm theo hướng dẫn
- Bật xong ✅

**3.2 Tạo App Password**
- Đi: https://myaccount.google.com/apppasswords
- **App**: chọn **Mail**
- **Device**: chọn **Windows Computer** (hoặc device của bạn)
- Click **"Generate"**
- Copy **16-ký tự password** (ví dụ: `abcd efgh ijkl mnop`)
- Lưu password này

**3.3 Paste vào .env.local**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM=noreply@flowerstore.com
```

Replace:
- `your_email@gmail.com` → Email của bạn
- `abcd efgh ijkl mnop` → 16-ký tự password từ bước 3.2

### Bước 4: Lưu File
- Ctrl+S để lưu

### Bước 5: Kiểm Tra
```bash
# Không output gì là tốt (không expose credentials)
cat .env.local
```

Hoặc kiểm tra trong VS Code - file `.env.local` sẽ có icon khóa 🔐

### Bước 6: Start Dev Server
```bash
npm run dev
```

---

## ✅ Xác Minh Setup

Khi dev server chạy:

**Test Email Sending:**
1. Tạo đơn hàng: `/shop` → add to cart → checkout
2. Hoàn thành đơn hàng
3. Vào: `/admin/emails`
4. Thấy email với status: **"sent"** ✅

**Nếu Email Failed:**
- Click vào email → xem error message
- Kiểm tra:
  - [ ] `SMTP_USER` đúng email
  - [ ] `SMTP_PASS` là 16-ký tự (không space)
  - [ ] 2FA đã bật trên Gmail
  - [ ] App Password tạo thành công

---

## 🔒 Bảo Mật

**IMPORTANT:**
- ✅ `.env.local` có trong `.gitignore`
- ✅ KHÔNG commit `.env.local` lên GitHub
- ✅ Giữ `SMTP_PASS` bí mật
- ✅ Nếu khác nhân lúc nào, tạo App Password mới

**Kiểm tra:**
```bash
# Xác minh .env.local không tracked
git status | grep env.local
# Không nên show .env.local
```

---

## Các Provider SMTP Khác

### Outlook
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_password
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_sendgrid_api_key
```

### AWS SES
```env
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_ses_username
SMTP_PASS=your_ses_password
```

---

## Troubleshooting

### "SMTP connection failed"
- [ ] Kiểm tra `SMTP_HOST` và `SMTP_PORT`
- [ ] Kiểm tra internet connection
- [ ] Thử disable VPN (nếu có)

### "Authentication failed"
- [ ] Kiểm tra `SMTP_USER` (email đúng)
- [ ] Kiểm tra `SMTP_PASS` (16-ký tự)
- [ ] Tạo App Password mới (nếu cũ)

### "Email sent but not received"
- [ ] Kiểm tra spam folder
- [ ] Kiểm tra email address đúng
- [ ] Xem `/admin/emails` → email status

---

## ✨ Xong!

.env.local đã setup thành công. 

Dev server chạy? **Tạo đơn hàng để test email!** 🌸
