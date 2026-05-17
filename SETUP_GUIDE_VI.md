# Hướng Dẫn Setup FlowerStore Enhancement

## Tổng Quan Tính Năng Mới

Bạn vừa nhận được những tính năng sau:
- ✅ Hệ thống lên lịch giao hàng tự động (cách nhau 30 phút nếu xung đột)
- ✅ Quản lý nhân sự (thêm, sửa, xoá, tạo tài khoản)
- ✅ Gửi email tự động qua SMTP (6 loại email)
- ✅ Admin Dashboard để quản lý mọi thứ
- ✅ Giao diện đầy màu sắc và sinh động

---

## BƯỚC 1: SET UP DATABASE (SUPABASE)

### Công việc cần làm:
1. Mở Supabase Console: https://supabase.com/
2. Chọn project FlowerStore của bạn
3. Vào **SQL Editor** (bên trái)

### Chạy Script SQL:

1. Click nút **"+ New Query"** hoặc **"New"** → **"SQL Query"**
2. Copy toàn bộ đoạn code dưới đây vào editor:

```sql
-- Staff Management Table
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  phone VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'active',
  is_admin BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Delivery Schedule Table
CREATE TABLE IF NOT EXISTS delivery_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_delivery_time TIMESTAMP WITH TIME ZONE,
  status VARCHAR DEFAULT 'scheduled',
  notes TEXT
);

-- Email Logs Table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type VARCHAR NOT NULL,
  recipient_email VARCHAR NOT NULL,
  subject VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'pending',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3
);

-- Order Extensions Table
CREATE TABLE IF NOT EXISTS order_extensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  customer_name VARCHAR,
  customer_phone VARCHAR,
  delivery_reminder_sent BOOLEAN DEFAULT FALSE,
  delivery_reminder_sent_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  notes TEXT
);

-- Tạo Index để tăng tốc độ truy vấn
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_schedule_order_id ON delivery_schedule(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_schedule_staff_id ON delivery_schedule(staff_id);
CREATE INDEX IF NOT EXISTS idx_delivery_schedule_status ON delivery_schedule(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_order_id ON email_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_order_extensions_order_id ON order_extensions(order_id);
```

3. Click nút **"Execute"** hoặc nhấn **Ctrl+Enter**
4. Chờ kết quả thành công (xanh lá cây)

### Kiểm tra Database:
- Vào **Table Editor** (bên trái)
- Bạn sẽ thấy 4 bảng mới: `staff`, `delivery_schedule`, `email_logs`, `order_extensions`

---

## BƯỚC 2: CẤU HÌNH SMTP EMAIL

### Gmail (Cách dễ nhất)

#### 2a. Bật 2-Factor Authentication (nếu chưa bật):
1. Đi tới: https://myaccount.google.com/security
2. Bên trái, click **"2-Step Verification"**
3. Làm theo hướng dẫn để bật

#### 2b. Tạo App Password:
1. Đi tới: https://myaccount.google.com/apppasswords
2. Chọn **App: Mail** và **Device: Windows Computer** (hoặc của bạn)
3. Click **Generate**
4. Google sẽ tạo một password 16 ký tự - **Copy password này**

#### 2c. Thêm vào `.env.local`:
Tạo file `.env.local` ở thư mục gốc project (hoặc thêm vào nếu đã có):

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_generated_app_password
SMTP_FROM=noreply@flowerstore.com
```

**Ví dụ:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=myfloralshop@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM=orders@flowerstore.com
```

### Cách khác: Dùng Email Provider khác

**Gmail** (hướng dẫn trên)

**Outlook/Hotmail**:
```
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_password
```

**Yahoo Mail**:
```
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your_email@yahoo.com
SMTP_PASS=your_password
```

---

## BƯỚC 3: KHỞI ĐỘNG ỨNG DỤNG

### Chạy Dev Server:
```bash
cd /vercel/share/v0-project
npm run dev
```

Ứng dụng sẽ chạy tại: **http://localhost:3000**

---

## BƯỚC 4: KIỂM TRA HỆ THỐNG

### Test từng bước:

#### 4.1 Thêm Nhân Viên
1. Truy cập: **http://localhost:3000/admin/staff**
2. Click **"Add Staff Member"** hoặc button tương tự
3. Điền thông tin:
   - **Name**: Nguyễn Văn A
   - **Email**: staff1@example.com
   - **Phone**: 0912345678
   - **Role**: Regular Staff
4. Click **"Create Staff"** / **"Thêm"**
5. Lặp lại với nhân viên thứ 2

**Kết quả kỳ vọng**: Bạn sẽ thấy danh sách nhân viên

#### 4.2 Tạo Đơn Hàng Test
1. Truy cập: **http://localhost:3000/shop** (hoặc `/en/shop`)
2. Chọn vài bông hoa, thêm vào giỏ
3. Checkout → Điền thông tin khách hàng
4. Hoàn thành đơn hàng

**Kết quả kỳ vọng**: Đơn hàng được tạo thành công

#### 4.3 Kiểm tra Lên Lịch Tự Động
1. Truy cập: **http://localhost:3000/admin/schedule**
2. Bạn sẽ thấy một delivery được lên lịch tự động
3. **Thời gian lên lịch = Thời gian hiện tại + 1 giờ**
4. Nhân viên được assign tự động (round-robin)

**Kết quả kỳ vọng**: Delivery được lên lịch thành công

#### 4.4 Kiểm tra Email Gửi Đi
1. Truy cập: **http://localhost:3000/admin/emails**
2. Bạn sẽ thấy danh sách email:
   - ✅ Order Confirmation (cho khách hàng)
   - ✅ Admin Notification (cho admin)
   - ✅ Staff Assignment (cho nhân viên)
3. Status phải là **"sent"** (xanh lá)

**Kết quả kỳ vọng**: Email logs hiển thị tất cả email đã gửi

#### 4.5 Kiểm tra Giao Diện Mới
1. Truy cập: **http://localhost:3000** (Homepage)
2. Bạn sẽ thấy:
   - ✅ Màu hồng, xanh, kem sinh động
   - ✅ Hoa nổi (float animation)
   - ✅ Chữ gradient
   - ✅ Button bounce khi hover

3. Truy cập: **http://localhost:3000/shop**
4. Thẻ sản phẩm sẽ có:
   - ✅ Border hồng khi hover
   - ✅ Giá gradient
   - ✅ Animation khi thêm vào giỏ

---

## BƯỚC 5: XUNG ĐỘT LỊCH (TEST FEATURE XÁC LẬP)

### Test Tự Động Dịch Lịch

Nếu bạn tạo 2 đơn hàng gần nhau:
- Đơn 1: Lên lịch lúc **10:00**
- Đơn 2 (cùng lúc): Hệ thống sẽ thấy xung đột → **Dịch sang 10:30**
- Đơn 3: Lên lịch **11:00**

Kiểm tra tại **/admin/schedule**, bạn sẽ thấy các giờ khác nhau.

---

## BƯỚC 6: QUẢN LÝ NHÂN VIÊN

### Các tính năng tại **/admin/staff**:
- **View**: Xem tất cả nhân viên (active/inactive)
- **Add**: Thêm nhân viên mới
- **Edit**: Sửa thông tin nhân viên
- **Activate/Deactivate**: Kích hoạt hoặc vô hiệu hóa
- **Delete**: Xoá nhân viên (nếu có quyền)

### Phân quyền:
- **Admin**: Có thể quản lý toàn bộ hệ thống
- **Staff**: Chỉ xem lịch của mình

---

## BƯỚC 7: QUẢN LÝ LỊCH GIAO HÀNG

### Tại **/admin/schedule**:
- **Xem all deliveries**: Danh sách tất cả giao hàng
- **Filter by staff**: Lọc theo nhân viên
- **Update status**: 
  - Scheduled (chưa giao)
  - In Progress (đang giao)
  - Completed (đã giao)
  - Failed (giao không thành)
- **Reassign**: Gán lại cho nhân viên khác

### Khi nhân viên giao xong:
1. Click vào delivery
2. Chọn **"Mark as Completed"**
3. Chọn ngày/giờ giao thực tế
4. Click **"Save"**

---

## BƯỚC 8: MONITORING EMAIL

### Tại **/admin/emails**:

#### Thông tin hiển thị:
| Cột | Ý Nghĩa |
|-----|---------|
| Type | Loại email (order-confirmation, payment-success, etc.) |
| To | Địa chỉ email nhận |
| Status | sent/failed/pending |
| Date | Ngày gửi |
| Error | Lý do thất bại (nếu có) |

#### Email Types (6 loại):
1. **order-confirmation** - Xác nhận đơn hàng cho khách
2. **payment-success** - Thông báo thanh toán thành công
3. **delivery-reminder** - Nhắc nhở giao hàng (1 giờ trước)
4. **cancellation** - Thông báo hủy đơn
5. **staff-assignment** - Giao việc cho nhân viên
6. **admin-notification** - Thông báo cho admin

#### Filter:
- **All**: Tất cả email
- **Sent**: Email gửi thành công (✅)
- **Failed**: Email gửi thất bại (❌)
- **Pending**: Đang chờ gửi (⏳)

#### Nếu gửi thất bại:
- Kiểm tra SMTP credentials
- Kiểm tra email recipient có đúng không
- Xem error message

---

## BƯỚC 9: TÍCH HỢP VÀO QUY TRÌNH HIỆN TẠI

### Khi khách đặt hàng:
```
Khách đặt hàng → Xác nhận thanh toán → 
Email Confirmation gửi đi → 
Hệ thống tự động lên lịch giao (1 giờ sau) →
Assign nhân viên tự động →
Email Staff Assignment gửi →
Email Admin Notification gửi →
Tất cả được log ở /admin/emails
```

### Tùy chỉnh Assign Nhân Viên:
1. Vào **/admin/schedule**
2. Nhấp vào delivery cần chỉnh
3. Click **"Reassign"**
4. Chọn nhân viên khác
5. Click **"Save"**

---

## BƯỚC 10: TROUBLESHOOTING

### Vấn đề 1: Email không gửi được

**Dấu hiệu**: `/admin/emails` shows status = "failed"

**Giải pháp**:
1. Kiểm tra `.env.local` - SMTP credentials đúng chưa?
2. Nếu Gmail: Bạn đã tạo App Password chưa?
3. Thử gửi test email:
   ```bash
   node -e "require('nodemailer').createTransport({host:'smtp.gmail.com',port:587,auth:{user:'your@gmail.com',pass:'app-password'}}).sendMail({from:'you@gmail.com',to:'test@example.com',subject:'Test',html:'<p>Test</p>'}, (err, info) => console.log(err || info))"
   ```

### Vấn đề 2: Delivery không được lên lịch

**Dấu hiệu**: `/admin/schedule` trống

**Giải pháp**:
1. Kiểm tra database tables được tạo chưa: Vào Supabase → Table Editor
2. Nếu table trống, kiểm tra order được tạo trong `orders` table chưa
3. Kiểm tra `/api/orders/events` được gọi chưa (xem browser console)

### Vấn đề 3: Nhân viên không được auto-assign

**Dấu hiệu**: delivery_schedule.staff_id = NULL

**Giải pháp**:
1. Kiểm tra bạn đã thêm nhân viên ở `/admin/staff` chưa
2. Nhân viên phải có status = "active"
3. Kiểm tra `/lib/staff.ts` function `assignStaffRoundRobin()`

### Vấn đề 4: Giao diện không màu sắc

**Dấu hiệu**: Website vẫn toàn xám, không có màu hồng/xanh

**Giải pháp**:
1. Xoá cache browser: **Ctrl+Shift+Delete** hoặc **Cmd+Shift+Delete**
2. Reload trang: **Ctrl+R** hoặc **F5**
3. Kiểm tra `/app/globals.css` có `:root` color variables chưa

---

## BƯỚC 11: LỆNH HỮU DỤNG

```bash
# Chạy dev server
npm run dev

# Build production
npm run build

# Chạy production
npm run start

# Chạy tests (nếu có)
npm test

# Lint code
npm run lint
```

---

## BƯỚC 12: TRIỂN KHAI PRODUCTION (Vercel)

### 1. Push code lên GitHub:
```bash
git add .
git commit -m "Add staff management, scheduling, and email system"
git push origin main
```

### 2. Vào Vercel:
- https://vercel.com/dashboard
- Connect repo nếu chưa
- Chọn branch `main`
- Click **"Deploy"**

### 3. Thêm Environment Variables vào Vercel:
1. Vào **Project Settings** → **Environment Variables**
2. Thêm 5 biến:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `SMTP_FROM`
3. Click **"Save"**

### 4. Redeploy:
- Vào **Deployments**
- Click **"Redeploy"** trên deployment mới nhất

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Chạy SQL migration trong Supabase
- [ ] Thêm `.env.local` với SMTP credentials
- [ ] Bật 2FA Google (nếu dùng Gmail)
- [ ] Tạo App Password Google
- [ ] Chạy `npm run dev`
- [ ] Thêm 2+ nhân viên ở `/admin/staff`
- [ ] Tạo 1 đơn hàng test ở `/shop`
- [ ] Kiểm tra delivery tại `/admin/schedule`
- [ ] Kiểm tra email tại `/admin/emails` (status = "sent")
- [ ] Test reassign delivery
- [ ] Test giao diện mới (màu sắc, animation)
- [ ] Push code lên GitHub
- [ ] Deploy lên Vercel
- [ ] Thêm env vars vào Vercel
- [ ] Redeploy

---

## 🎉 HOÀN TẤT!

Hệ thống của bạn giờ đã có:
- ✅ Lên lịch giao hàng tự động
- ✅ Quản lý nhân sự
- ✅ Email notifications
- ✅ Admin dashboard
- ✅ Giao diện đẹp & sinh động

**Nếu có vấn đề**, hãy kiểm tra lại các bước hoặc xem phần Troubleshooting.

**Chúc mừng!** 🌸
