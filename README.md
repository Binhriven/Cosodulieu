# Hệ Thống Quản Lý Đặt Phòng Khách Sạn

Website quản lý cơ sở dữ liệu đặt phòng khách sạn với giao diện web đơn giản, hỗ trợ CRUD cho tất cả 9 bảng.

## Yêu Cầu

- **Node.js** (phiên bản 16 trở lên)
- **MySQL** đang chạy trên port `3307`
  - Username: `root`
  - Password: `your_secure_mysql_password`

## Cấu Trúc Thư Mục

```
sql-huy/
├── init.sql            # Tạo database và các bảng
├── seed.sql            # Dữ liệu mẫu để test
├── seed-runner.js      # Script chạy init.sql + seed.sql
├── server.js           # Server Node.js (Express)
├── package.json
└── public/
    ├── index.html      # Giao diện chính
    ├── style.css       # Giao diện dark theme
    └── app.js          # Logic frontend
```

## Hướng Dẫn Cài Đặt Từng Bước

### Bước 1: Cài đặt thư viện

Mở terminal tại thư mục dự án và chạy:

```bash
npm install
```

Lệnh này sẽ cài 3 thư viện cần thiết:
- `express` – web server
- `mysql2` – kết nối MySQL
- `cors` – cho phép gọi API từ frontend

### Bước 2: Tạo database và dữ liệu mẫu

Đảm bảo MySQL đang chạy trên port 3307, sau đó chạy:

```bash
npm run seed
```

Script này sẽ:
1. Tạo database `hotel_booking_management`
2. Tạo 9 bảng theo schema trong `init.sql`
3. Tạo 3 trigger kiểm tra nghiệp vụ
4. Chèn dữ liệu mẫu từ `seed.sql`

Kết quả mong đợi:

```
Dang ket noi MySQL...
Dang chay init.sql...
=> Tao schema thanh cong
=> Trigger 1 da tao
=> Trigger 2 da tao
=> Trigger 3 da tao
Dang chay seed.sql...
=> Chen du lieu mau thanh cong

Hoan tat cai dat CSDL!
```

### Bước 3: Khởi chạy server

```bash
npm start
```

Server sẽ chạy tại: **http://localhost:3000**

## Hướng Dẫn Sử Dụng

### Tab "Quản Lý Dữ Liệu"

Đây là tab chính để thao tác CRUD trên các bảng.

#### Xem dữ liệu (View)
1. Chọn bảng từ dropdown "Chọn bảng" (ví dụ: Khách Hàng)
2. Nhấn nút **View**
3. Dữ liệu sẽ hiển thị trong bảng kết quả bên dưới

#### Thêm dữ liệu (Insert)
1. Chọn bảng cần thêm
2. Nhấn nút **Insert**
3. Điền thông tin vào các ô (các trường ID tự tăng sẽ bị khóa)
4. Nhấn **Thêm mới**

#### Sửa dữ liệu (Update)
1. Chọn bảng và nhấn **View** để xem dữ liệu
2. Nhấn nút **Update**
3. Click vào dòng muốn sửa trong bảng kết quả → dữ liệu sẽ tự động điền vào form
4. Sửa các trường cần thay đổi
5. Nhấn **Cập nhật**

#### Xóa dữ liệu (Delete)
1. Chọn bảng và nhấn **View** để xem dữ liệu
2. Nhấn nút **Delete**
3. Click vào dòng muốn xóa → khóa chính sẽ tự động điền
4. Nhấn **Xóa**

#### Tìm kiếm (Search)
1. Chọn bảng
2. Nhập giá trị vào các ô cần tìm (có thể nhập một phần cho trường text)
3. Nhấn **Search**
4. Kết quả tìm kiếm sẽ hiển thị

### Tab "SQL Console"

Cho phép viết và thực thi câu lệnh SQL trực tiếp:

1. Chuyển sang tab **SQL Console** trên thanh menu
2. Nhập câu lệnh SQL vào ô nhập (ví dụ: `SELECT * FROM KhachHang WHERE ho_ten LIKE '%Nguyễn%'`)
3. Nhấn **Thực thi**
4. Kết quả hiển thị bên dưới

## Danh Sách Các Bảng

| STT | Tên bảng         | Mô tả                    |
|-----|------------------|---------------------------|
| 1   | TaiKhoanQuanTri  | Tài khoản quản trị viên   |
| 2   | KhachHang        | Thông tin khách hàng      |
| 3   | KhachSan         | Thông tin khách sạn       |
| 4   | LoaiPhong        | Các loại phòng            |
| 5   | QuyPhongGia      | Quỹ phòng và giá theo ngày|
| 6   | DonDatPhong      | Đơn đặt phòng            |
| 7   | ChiTietDatPhong  | Chi tiết đặt phòng       |
| 8   | GiaoDich         | Giao dịch thanh toán      |
| 9   | DanhGia          | Đánh giá của khách hàng   |

## Cấu Hình Kết Nối MySQL

Nếu cần thay đổi thông tin kết nối, sửa trong 2 file:

- `server.js` (dòng 12-20)
- `seed-runner.js` (dòng 8-14)

```javascript
{
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: 'your_secure_mysql_password',
  database: 'hotel_booking_management'
}
```
