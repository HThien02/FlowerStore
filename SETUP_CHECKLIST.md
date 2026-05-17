# FlowerStore Enhancement - Setup Checklist

**Hướng dẫn cài đặt hoàn chỉnh để kích hoạt các tính năng mới**

---

## Phase 1: Chuẩn Bị Môi Trường

- [ ] Node.js 16+ đã cài đặt (`node --version`)
- [ ] npm hoặc pnpm đã cài (`npm --version`)
- [ ] VS Code hoặc editor khác
- [ ] Supabase account (existing)
- [ ] Gmail hoặc email provider khác

---

## Phase 2: Database Migration - Thêm 4 Bảng Mới

### 2.1 Vào Supabase Console
- [ ] Đăng nhập: https://app.supabase.com
- [ ] Chọn project FlowerStore
- [ ] Click **SQL Editor** (left sidebar)
- [ ] Click **"New Query"** hoặc **"+"**

### 2.2 Chạy Migration Script
- [ ] Copy toàn bộ nội dung từ `/scripts/create-tables.sql`
- [ ] Paste vào SQL Editor
- [ ] Click **"Execute"** hoặc **Ctrl+Enter**
- [ ] Chờ xanh lá ✅ (successful)
- [ ] Không có red errors ❌

### 2.3 Kiểm tra Tables Được Tạo
- [ ] Click **"Table Editor"** (left sidebar)
- [ ] Xem 4 tables mới:
  - [ ] `staff` - quản lý nhân viên
  - [ ] `delivery_schedule` - lịch giao hàng
  - [ ] `email_logs` - logs email
  - [ ] `order_extensions` - mở rộng data order

### 2.4 Kiểm tra Indexes
- [ ] Vào **SQL Editor** → **"Saved queries"**
- [ ] Kiểm tra 9 indexes đã tạo
- [ ] Xem trong Table Editor → mỗi table có indexes

---

## Phase 3: Cấu Hình SMTP Email

### 3.1 Chọn Email Provider (Gmail - Dễ Nhất)
- [ ] Email: your_email@gmail.com

### 3.2 Bật 2-Step Verification (Gmail)
- [ ] Vào: https://myaccount.google.com/security
- [ ] Click **"2-Step Verification"**
- [ ] Làm theo hướng dẫn
- [ ] Bật xong ✅

### 3.3 Tạo App Password
- [ ] Vào: https://myaccount.google.com/apppasswords
- [ ] **App**: chọn **Mail**
- [ ] **Device**: chọn **Windows Computer** (hoặc thiết bị của bạn)
- [ ] Click **"Generate"**
- [ ] Copy 16-ký tự password (ví dụ: `abcd efgh ijkl mnop`)
- [ ] **LƯU PASSWORD NÀY**

### 3.4 Tạo .env.local
- [ ] Mở project folder: `/vercel/share/v0-project`
- [ ] Tạo file: `.env.local` (nếu chưa có)
- [ ] Paste nội dung:
  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your_email@gmail.com
  SMTP_PASS=your_app_password_here
  SMTP_FROM=noreply@flowerstore.com
  ```
- [ ] Replace `your_email@gmail.com` với email thực
- [ ] Replace `your_app_password_here` với 16-ký tự password từ bước 3.3
- [ ] Lưu file (Ctrl+S)

### 3.5 Kiểm tra SMTP Config
- [ ] Xem file `.env.local`:
  - [ ] `SMTP_HOST=smtp.gmail.com` ✅
  - [ ] `SMTP_PORT=587` ✅
  - [ ] `SMTP_USER` không trống ✅
  - [ ] `SMTP_PASS` là 16-ký tự ✅

---

## Phase 4: Cài Đặt Dependencies

- [ ] Mở Terminal (Ctrl+` trong VS Code hoặc Terminal app)
- [ ] Chạy: `npm install`
- [ ] Chờ cài đặt hoàn (không có red errors)
- [ ] Terminal hiển thị: `added X packages` ✅

---

## Phase 5: Khởi Động Dev Server

### 5.1 Chạy Server
- [ ] Terminal: `npm run dev`
- [ ] Chờ thấy: **"✓ Ready in Xms"** hoặc **"Compiled successfully"**
- [ ] Không có errors ❌
- [ ] Server chạy tại: `http://localhost:3000` (hoặc port khác nếu 3000 đang dùng)

### 5.2 Kiểm tra Homepage
- [ ] Mở browser
- [ ] Vào: http://localhost:3000
- [ ] Thấy:
  - [ ] Trang home load thành công
  - [ ] Màu hồng/xanh/kem (colorful design) ✅
  - [ ] Navigation bar ✅
  - [ ] Hoa nổi (float animation) ✅

---

## Phase 6: Thêm Nhân Viên (Staff)

### 6.1 Truy Cập Staff Page
- [ ] Browser: http://localhost:3000/admin/staff
- [ ] Trang load thành công
- [ ] Thấy danh sách staff (trống nếu lần đầu)

### 6.2 Thêm Nhân Viên #1
- [ ] Click **"Add Staff Member"** hoặc button tương tự
- [ ] Form hiện lên
- [ ] Điền:
  - [ ] **Name**: `Nguyễn Văn A`
  - [ ] **Email**: `staff1@example.com`
  - [ ] **Phone**: `0912345678`
  - [ ] **Role**: `Regular Staff` (hoặc Admin)
- [ ] Click **"Create"** / **"Thêm"**
- [ ] Thấy success message ✅
- [ ] Nhân viên xuất hiện trong list

### 6.3 Thêm Nhân Viên #2
- [ ] Lặp lại 6.2 với:
  - [ ] **Name**: `Trần Thị B`
  - [ ] **Email**: `staff2@example.com`
  - [ ] **Phone**: `0987654321`

### 6.4 Thêm Nhân Viên #3 (Optional)
- [ ] Lặp lại 6.2 lần nữa
- [ ] Tối thiểu 2 nhân viên để test

### 6.5 Kiểm tra Staff List
- [ ] Trang `/admin/staff` hiển thị:
  - [ ] Tất cả 2-3 nhân viên
  - [ ] Mỗi nhân viên có: Name, Email, Status (Active), Edit/Delete
  - [ ] Status tất cả là: "active" ✅

---

## Phase 7: Tạo Đơn Hàng Test

### 7.1 Đi Tới Shop
- [ ] Browser: http://localhost:3000/shop
- [ ] Trang shop load thành công
- [ ] Thấy danh sách sản phẩm (hoa)

### 7.2 Thêm Sản Phẩm Vào Giỏ
- [ ] Click vào bất kỳ product card
- [ ] Hoặc click nút **"Add to Cart"**
- [ ] Chọn số lượng: `2`
- [ ] Click **"Add to Cart"** / **"Thêm vào Giỏ"**
- [ ] Thấy toast notification ✅
- [ ] Cart icon (top right) hiển thị: `2` ✅

### 7.3 Thêm Sản Phẩm Thứ 2
- [ ] Quay lại `/shop`
- [ ] Chọn sản phẩm khác
- [ ] Thêm vào giỏ (số lượng: `1`)
- [ ] Cart icon hiển thị: `3` ✅

### 7.4 Kiểm tra Giỏ Hàng
- [ ] Click Cart icon hoặc vào `/cart`
- [ ] Giỏ hiển thị:
  - [ ] 2 sản phẩm (items)
  - [ ] Số lượng đúng
  - [ ] Giá từng sản phẩm
  - [ ] Tổng tiền

### 7.5 Checkout
- [ ] Click **"Proceed to Checkout"** / **"Thanh Toán"**
- [ ] Hoặc vào: http://localhost:3000/checkout
- [ ] Thấy form 4 bước

### 7.6 Điền Checkout Form
**Bước 1 - Delivery Info:**
- [ ] **Address**: `123 Tran Hung Dao, HCMC`
- [ ] **Phone**: `0901234567`
- [ ] **Notes**: (optional)
- [ ] Click **"Next"**

**Bước 2 - Delivery Method:**
- [ ] Chọn: **Standard Delivery** (5$ - 2 days)
- [ ] Click **"Next"**

**Bước 3 - Payment Method:**
- [ ] Chọn: **Credit Card** (hoặc Stripe)
- [ ] Click **"Next"**

**Bước 4 - Review:**
- [ ] Kiểm tra:
  - [ ] Sản phẩm đúng
  - [ ] Địa chỉ đúng
  - [ ] Phí giao đúng
  - [ ] Tổng tiền chính xác
- [ ] Click **"Complete Order"** / **"Hoàn Tất Đơn"**
- [ ] Thấy success message ✅

---

## Phase 8: Kiểm tra Lên Lịch Giao Hàng

### 8.1 Vào Schedule Admin
- [ ] Browser: http://localhost:3000/admin/schedule
- [ ] Trang load thành công

### 8.2 Kiểm tra Delivery Tự Động
- [ ] Thấy ít nhất **1 delivery** trong list
- [ ] Delivery có:
  - [ ] **Order ID**: ID từ đơn hàng vừa tạo
  - [ ] **Assigned Staff**: Tên nhân viên (auto-assigned) ✅
  - [ ] **Scheduled Time**: 1 giờ sau thời gian đặt hàng ✅
  - [ ] **Status**: `scheduled` ✅

### 8.3 Test Dịch Lịch (Nếu có nhiều đơn)
- [ ] Tạo 2-3 đơn hàng liên tiếp
- [ ] Kiểm tra `/admin/schedule`
- [ ] Thời gian sẽ không trùng:
  - [ ] Ví dụ: 10:00, 10:30, 11:00 ✅ (dịch 30 min)

### 8.4 Cập Nhật Delivery Status
- [ ] Click vào delivery
- [ ] Click **"Mark as In Progress"** → status = `in-progress` ✅
- [ ] Click **"Mark as Completed"** → status = `completed` ✅
- [ ] Nhập actual delivery time
- [ ] Lưu ✅

---

## Phase 9: Kiểm tra Email Logs

### 9.1 Vào Email Logs Page
- [ ] Browser: http://localhost:3000/admin/emails
- [ ] Trang load thành công

### 9.2 Kiểm tra Emails Gửi Đi
- [ ] Thấy **3-4 emails** trong list:
  - [ ] `order-confirmation` (xác nhận đơn) ✅
  - [ ] `payment-success` (thanh toán thành công) ✅
  - [ ] `staff-assignment` (giao việc cho staff) ✅
  - [ ] `admin-notification` (thông báo admin) ✅

### 9.3 Kiểm tra Email Status
- [ ] Tất cả emails phải có: **Status = "sent"** ✅ (xanh)
- [ ] Không có: "failed" hoặc "pending"
- [ ] Nếu có "failed":
  - [ ] Click để xem error message
  - [ ] Kiểm tra `.env.local` SMTP credentials

### 9.4 Xem Chi Tiết Email
- [ ] Click vào email:
  - [ ] **Type**: loại email ✅
  - [ ] **To**: email nhận (khách, admin, staff) ✅
  - [ ] **Subject**: tiêu đề ✅
  - [ ] **Status**: "sent" ✅
  - [ ] **Sent At**: thời gian gửi ✅
  - [ ] **Error**: không có (hoặc có lý do nếu failed)

### 9.5 Filter Emails
- [ ] Click **"Sent Only"** → chỉ xem sent emails ✅
- [ ] Click **"Failed Only"** → xem failed emails
- [ ] Click **"All"** → reset ✅

---

## Phase 10: Kiểm tra Giao Diện Mới (UI)

### 10.1 Homepage Design
- [ ] Vào: http://localhost:3000
- [ ] Kiểm tra:
  - [ ] **Background**: màu kem (#fdf9f5) ✅
  - [ ] **Hero Section**: 
    - [ ] Hoa nổi (float animation) 🌹 ✅
    - [ ] Text gradient (hồng → xanh) ✅
    - [ ] Buttons màu hồng ✅
  - [ ] **Stats Cards**: border hồng, hover effect ✅
  - [ ] **Animations**: mượt mà, không lag ✅

### 10.2 Shop Page Design
- [ ] Vào: http://localhost:3000/shop
- [ ] Kiểm tra Product Cards:
  - [ ] **Border**: hồng (#e75480) ✅
  - [ ] **Hover**: border sáng hơn, shadow lớn ✅
  - [ ] **Price**: gradient color ✅
  - [ ] **Rating Stars**: màu xanh (#6dd5ed) ✅
  - [ ] **Add Button**: màu hồng, scale up on hover ✅
  - [ ] **Heart Icon**: animation when click ✅

### 10.3 Admin Pages Design
- [ ] `/admin`: dashboard với stats cards ✅
- [ ] `/admin/staff`: form add staff với styling ✅
- [ ] `/admin/schedule`: deliveries list với colors ✅
- [ ] `/admin/emails`: email logs với filter buttons ✅

### 10.4 Animations
- [ ] **Float**: hoa nổi liên tục (smooth) ✅
- [ ] **Bounce-in**: text bounce vào (smooth) ✅
- [ ] **Hover**: button/card hover effects ✅
- [ ] **Shimmer**: loading effect (nếu có) ✅
- [ ] Không có lag/jank ✅

---

## Phase 11: Kiểm tra Responsive Design

### 11.1 Mobile (375px)
- [ ] F12 → Toggle device toolbar
- [ ] Chọn **iPhone** hoặc **375px width**
- [ ] Kiểm tra:
  - [ ] Layout stack (không ngang) ✅
  - [ ] Text readable ✅
  - [ ] Buttons clickable ✅
  - [ ] Images scale down ✅

### 11.2 Tablet (768px)
- [ ] Chọn **iPad** hoặc **768px width**
- [ ] Kiểm tra:
  - [ ] 2-column layout ✅
  - [ ] Content centered ✅
  - [ ] Spacing proper ✅

### 11.3 Desktop (1920px)
- [ ] Chọn **1920px width** (hoặc max)
- [ ] Kiểm tra:
  - [ ] Full layout ✅
  - [ ] Not too wide ✅
  - [ ] Readable ✅

---

## Phase 12: Kiểm tra Bilingual (English/Vietnamese)

### 12.1 Switch to Vietnamese
- [ ] Homepage: http://localhost:3000
- [ ] Click language button (top right)
- [ ] Chọn: **VI** (Tiếng Việt)
- [ ] URL thay đổi: `/vi` ✅
- [ ] Text dịch sang Tiếng Việt ✅
- [ ] Admin pages: `/vi/admin/...` ✅

### 12.2 Switch Back to English
- [ ] Click language button
- [ ] Chọn: **EN** (English)
- [ ] URL thay đổi: `/en` ✅
- [ ] Text tiếng Anh ✅

### 12.3 Email Content
- [ ] Check `/admin/emails`
- [ ] Email subjects dịch theo ngôn ngữ hiện tại ✅

---

## Phase 13: Console & Developer Tools

### 13.1 Check Console
- [ ] F12 → **Console** tab
- [ ] Kiểm tra:
  - [ ] **Red errors**: KHÔNG ĐƯỢC CÓ ❌
  - [ ] **Yellow warnings**: bình thường ⚠️
  - [ ] **SMTP logs**: "[SMTP] Email sent to..." ✅

### 13.2 Check Network
- [ ] F12 → **Network** tab
- [ ] Refresh page
- [ ] Kiểm tra:
  - [ ] All requests: status **200** ✅
  - [ ] No **404** or **500** errors ❌
  - [ ] Images load ✅

### 13.3 Check Application/Storage
- [ ] F12 → **Application** tab
- [ ] **Local Storage**: cart items saved ✅
- [ ] **Cookies**: language preference ✅

---

## Phase 14: Database Verification

### 14.1 Supabase Tables
- [ ] Supabase Console → **Table Editor**
- [ ] Kiểm tra mỗi table:

**staff table:**
- [ ] Có 2-3 rows (nhân viên) ✅
- [ ] Mỗi row có: id, name, email, phone, status (active) ✅

**delivery_schedule table:**
- [ ] Có 1+ rows (lịch giao) ✅
- [ ] Mỗi row có: id, order_id, staff_id, scheduled_time, status ✅

**email_logs table:**
- [ ] Có 3+ rows (logs email) ✅
- [ ] Mỗi row có: id, email_type, recipient_email, status (sent) ✅

**order_extensions table:**
- [ ] Có 1+ rows (từ order) ✅
- [ ] Mỗi row có: id, order_id, customer_name, customer_phone ✅

### 14.2 Foreign Keys & Relationships
- [ ] delivery_schedule.order_id → orders.id ✅
- [ ] delivery_schedule.staff_id → staff.id ✅
- [ ] email_logs.order_id → orders.id ✅
- [ ] order_extensions.order_id → orders.id ✅

---

## Phase 15: Final Verification & Deployment Ready

### 15.1 Complete End-to-End Test
- [ ] **Full Flow**:
  1. [ ] Add staff (`/admin/staff`) ✅
  2. [ ] Browse shop (`/shop`) ✅
  3. [ ] Add to cart ✅
  4. [ ] Checkout (`/checkout`) ✅
  5. [ ] Order created ✅
  6. [ ] Delivery scheduled (`/admin/schedule`) ✅
  7. [ ] Emails sent (`/admin/emails`) ✅
  8. [ ] Status updated ✅

### 15.2 Performance
- [ ] Page load time < 3 seconds ✅
- [ ] No lag when switching pages ✅
- [ ] Animations smooth ✅
- [ ] Mobile smooth ✅

### 15.3 Code Quality
- [ ] No TypeScript errors
- [ ] No console errors ❌
- [ ] No warnings (except normal ones)
- [ ] Build successful: `npm run build` ✅

### 15.4 Documentation Review
- [ ] Read `SETUP_GUIDE_VI.md` ✅
- [ ] Read `ENHANCEMENT_SUMMARY.md` ✅
- [ ] Read `QUICK_START.md` ✅
- [ ] Understand all features ✅

### 15.5 Git Commit (If Using Git)
```bash
git add .
git commit -m "Add staff management, scheduling, and email system"
git push origin main
```
- [ ] Commit message clear ✅
- [ ] All files committed ✅
- [ ] No sensitive data ✅
- [ ] Push successful ✅

### 15.6 Ready for Vercel Deployment
- [ ] All tests passed ✅
- [ ] No errors ✅
- [ ] Database working ✅
- [ ] SMTP working ✅
- [ ] UI looks great ✅
- [ ] Bilingual working ✅

---

## 🎉 Completion Summary

Đánh dấu hoàn thành mỗi giai đoạn:

- [ ] **Phase 1**: Environment Ready
- [ ] **Phase 2**: Database Migration
- [ ] **Phase 3**: SMTP Configuration
- [ ] **Phase 4**: Dependencies Installed
- [ ] **Phase 5**: Dev Server Running
- [ ] **Phase 6**: Staff Added
- [ ] **Phase 7**: Order Created
- [ ] **Phase 8**: Delivery Scheduled
- [ ] **Phase 9**: Email Logs Verified
- [ ] **Phase 10**: UI Colorful
- [ ] **Phase 11**: Responsive
- [ ] **Phase 12**: Bilingual
- [ ] **Phase 13**: Console Clean
- [ ] **Phase 14**: Database Correct
- [ ] **Phase 15**: Ready to Deploy

---

## ✅ Hệ Thống Của Bạn Giờ Có:

- ✅ Lên lịch giao hàng tự động (1 giờ sau, dịch 30 min nếu xung đột)
- ✅ Quản lý nhân sự (add, edit, delete staff)
- ✅ Gửi email tự động (6 loại via SMTP)
- ✅ Admin dashboard hoàn chỉnh
- ✅ Giao diện sinh động & colorful
- ✅ Hỗ trợ Tiếng Anh & Tiếng Việt
- ✅ Responsive trên mọi device
- ✅ Email logging & tracking

---

## 📞 Troubleshooting Quick Links

- **Email không gửi**: Kiểm tra `.env.local` SMTP credentials
- **Delivery không scheduled**: Kiểm tra staff được add chưa
- **Giao diện không màu sắc**: Xoá cache, reload trang
- **Console errors**: Xem chi tiết, check terminal
- **Database errors**: Kiểm tra Supabase tables & relationships

Xem chi tiết: **`SETUP_GUIDE_VI.md`** → **Troubleshooting section**

---

## 🚀 Next Step: Deploy to Vercel

Khi sẵn sàng, push code lên GitHub và deploy lên Vercel!

**Hoàn tất!** 🌸
