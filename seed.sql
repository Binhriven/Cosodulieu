USE hotel_booking_management;

-- ============================================
-- SEED DATA
-- ============================================

-- 1. Tài khoản quản trị
INSERT INTO TaiKhoanQuanTri (username, password, email) VALUES
('admin1', 'admin123', 'admin1@hotel.vn'),
('admin2', 'admin123', 'admin2@hotel.vn'),
('admin3', 'admin123', 'admin3@hotel.vn');

-- 2. Khách hàng
INSERT INTO KhachHang (username, password, ho_ten, sdt, email) VALUES
('nguyenvana', 'pass123', 'Nguyễn Văn A', '0901234567', 'nguyenvana@gmail.com'),
('tranthib', 'pass123', 'Trần Thị B', '0912345678', 'tranthib@gmail.com'),
('levanc', 'pass123', 'Lê Văn C', '0923456789', 'levanc@gmail.com'),
('phamthid', 'pass123', 'Phạm Thị D', '0934567890', 'phamthid@gmail.com'),
('hoangvane', 'pass123', 'Hoàng Văn E', '0945678901', 'hoangvane@gmail.com');

-- 3. Khách sạn
INSERT INTO KhachSan (ten_KS, dia_chi, diem_tb, ID_quan_tri) VALUES
('Grand Palace Hotel', '123 Nguyễn Huệ, Quận 1, TP.HCM', 4.50, 1),
('Sunrise Resort', '456 Trần Phú, Nha Trang', 4.20, 2),
('Ha Noi Elegance', '789 Hàng Bài, Hoàn Kiếm, Hà Nội', 4.80, 3),
('Da Nang Beach Hotel', '321 Võ Nguyên Giáp, Đà Nẵng', 4.00, 1);

-- 4. Loại phòng
INSERT INTO LoaiPhong (ten_loai, suc_chua, ID_khach_san) VALUES
('Standard', 2, 1),
('Deluxe', 3, 1),
('Suite', 4, 1),
('Standard', 2, 2),
('Deluxe', 3, 2),
('Standard', 2, 3),
('VIP Suite', 5, 3),
('Standard', 2, 4),
('Family', 6, 4);

-- 5. Quỹ phòng giá
INSERT INTO QuyPhongGia (ID_loai_phong, ngay, so_luong_trong, gia_ban) VALUES
(1, '2026-04-16', 10, 500000.00),
(1, '2026-04-17', 8, 500000.00),
(1, '2026-04-18', 5, 550000.00),
(2, '2026-04-16', 5, 900000.00),
(2, '2026-04-17', 4, 900000.00),
(3, '2026-04-16', 2, 2000000.00),
(3, '2026-04-17', 2, 2000000.00),
(4, '2026-04-16', 15, 400000.00),
(5, '2026-04-16', 8, 750000.00),
(6, '2026-04-16', 12, 600000.00),
(7, '2026-04-16', 3, 3500000.00),
(8, '2026-04-16', 20, 350000.00),
(9, '2026-04-16', 5, 1200000.00);

-- 6. Đơn đặt phòng
INSERT INTO DonDatPhong (tong_tien, trang_thai, ID_khach_hang) VALUES
(1000000.00, 'Hoàn thành', 1),
(2700000.00, 'Đã thanh toán', 2),
(4000000.00, 'Hoàn thành', 3),
(500000.00, 'Chờ thanh toán', 4),
(1200000.00, 'Đã hủy', 5);

-- 7. Chi tiết đặt phòng
INSERT INTO ChiTietDatPhong (ID_don, ID_loai_phong, check_in, check_out, so_luong_phong, gia_mua) VALUES
(1, 1, '2026-04-10', '2026-04-12', 1, 500000.00),
(2, 2, '2026-04-15', '2026-04-18', 1, 900000.00),
(3, 3, '2026-04-08', '2026-04-10', 1, 2000000.00),
(4, 4, '2026-04-20', '2026-04-21', 1, 400000.00),
(5, 9, '2026-04-22', '2026-04-23', 1, 1200000.00);

-- 8. Giao dịch
INSERT INTO GiaoDich (ma_giao_dich, so_tien, thoi_gian, ID_don) VALUES
('GD20260410001', 1000000.00, '2026-04-10 08:30:00', 1),
('GD20260415002', 2700000.00, '2026-04-15 14:20:00', 2),
('GD20260408003', 4000000.00, '2026-04-08 10:00:00', 3);

-- 9. Đánh giá (chỉ cho đơn đã hoàn thành)
INSERT INTO DanhGia (rating, noi_dung, ID_don, ID_loai_phong) VALUES
(5, 'Phòng rất sạch sẽ, nhân viên thân thiện. Rất hài lòng!', 1, 1),
(4, 'Phòng Suite tuyệt vời, view đẹp. Sẽ quay lại!', 3, 3);
