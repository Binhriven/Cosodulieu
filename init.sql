CREATE DATABASE IF NOT EXISTS hotel_booking_management;
USE hotel_booking_management;

--------------------------------------------------------------------------------
-- 1. BẢNG TÀI KHOẢN QUẢN TRỊ
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS TaiKhoanQuanTri (
    ID_quan_tri INT(11) NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    PRIMARY KEY (ID_quan_tri)
);

--------------------------------------------------------------------------------
-- 2. BẢNG KHÁCH HÀNG
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS KhachHang (
    ID_khach_hang INT(11) NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    ho_ten VARCHAR(100) NOT NULL,
    sdt VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    PRIMARY KEY (ID_khach_hang)
);

--------------------------------------------------------------------------------
-- 3. BẢNG KHÁCH SẠN
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS KhachSan (
    ID_khach_san INT(11) NOT NULL AUTO_INCREMENT,
    ten_KS VARCHAR(100) NOT NULL,
    dia_chi VARCHAR(255) NOT NULL,
    diem_tb DECIMAL(3,2) DEFAULT 0.00,
    ID_quan_tri INT(11) NOT NULL,
    PRIMARY KEY (ID_khach_san),
    CONSTRAINT fk_KhachSan_QuanTri 
        FOREIGN KEY (ID_quan_tri) REFERENCES TaiKhoanQuanTri (ID_quan_tri) 
        ON DELETE RESTRICT ON UPDATE CASCADE
);

--------------------------------------------------------------------------------
-- 4. BẢNG LOẠI PHÒNG
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS LoaiPhong (
    ID_loai_phong INT(11) NOT NULL AUTO_INCREMENT,
    ten_loai VARCHAR(50) NOT NULL,
    suc_chua INT(11) NOT NULL,
    ID_khach_san INT(11) NOT NULL,
    PRIMARY KEY (ID_loai_phong),
    CONSTRAINT fk_LoaiPhong_KhachSan 
        FOREIGN KEY (ID_khach_san) REFERENCES KhachSan (ID_khach_san) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_suc_chua CHECK (suc_chua > 0)
);

--------------------------------------------------------------------------------
-- 5. BẢNG QUỸ PHÒNG GIÁ (Thực thể yếu)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS QuyPhongGia (
    ID_loai_phong INT(11) NOT NULL,
    ngay DATE NOT NULL,
    so_luong_trong INT(11) NOT NULL,
    gia_ban DECIMAL(15,2) NOT NULL,
    PRIMARY KEY (ID_loai_phong, ngay),
    CONSTRAINT fk_QuyPhongGia_LoaiPhong 
        FOREIGN KEY (ID_loai_phong) REFERENCES LoaiPhong (ID_loai_phong) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_so_luong_trong CHECK (so_luong_trong >= 0),
    CONSTRAINT chk_gia_ban CHECK (gia_ban >= 0)
);

--------------------------------------------------------------------------------
-- 6. BẢNG ĐƠN ĐẶT PHÒNG
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS DonDatPhong (
    ID_don INT(11) NOT NULL AUTO_INCREMENT,
    tong_tien DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    trang_thai VARCHAR(30) NOT NULL,
    ID_khach_hang INT(11) NOT NULL,
    PRIMARY KEY (ID_don),
    CONSTRAINT fk_DonDatPhong_KhachHang 
        FOREIGN KEY (ID_khach_hang) REFERENCES KhachHang (ID_khach_hang) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_trang_thai_don CHECK (trang_thai IN ('Chờ thanh toán', 'Đã thanh toán', 'Đã hủy', 'Hoàn thành'))
);

--------------------------------------------------------------------------------
-- 7. BẢNG CHI TIẾT ĐẶT PHÒNG (Thực thể liên kết)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ChiTietDatPhong (
    ID_don INT(11) NOT NULL,
    ID_loai_phong INT(11) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    so_luong_phong INT(11) NOT NULL,
    gia_mua DECIMAL(15,2) NOT NULL,
    PRIMARY KEY (ID_don, ID_loai_phong),
    CONSTRAINT fk_CTDP_DonDatPhong 
        FOREIGN KEY (ID_don) REFERENCES DonDatPhong (ID_don) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_CTDP_LoaiPhong 
        FOREIGN KEY (ID_loai_phong) REFERENCES LoaiPhong (ID_loai_phong) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_so_luong_dat CHECK (so_luong_phong > 0),
    CONSTRAINT chk_gia_mua CHECK (gia_mua >= 0)
);

--------------------------------------------------------------------------------
-- 8. BẢNG GIAO DỊCH
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS GiaoDich (
    ma_giao_dich VARCHAR(50) NOT NULL,
    so_tien DECIMAL(15,2) NOT NULL,
    thoi_gian DATETIME NOT NULL,
    ID_don INT(11) NOT NULL UNIQUE,
    PRIMARY KEY (ma_giao_dich),
    CONSTRAINT fk_GiaoDich_DonDatPhong 
        FOREIGN KEY (ID_don) REFERENCES DonDatPhong (ID_don) 
        ON DELETE RESTRICT ON UPDATE CASCADE
);

--------------------------------------------------------------------------------
-- 9. BẢNG ĐÁNH GIÁ
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS DanhGia (
    ID_danh_gia INT(11) NOT NULL AUTO_INCREMENT,
    rating INT(11) NOT NULL,
    noi_dung TEXT,
    ID_don INT(11) NOT NULL,
    ID_loai_phong INT(11) NOT NULL,
    PRIMARY KEY (ID_danh_gia),
    CONSTRAINT fk_DanhGia_CTDP 
        FOREIGN KEY (ID_don, ID_loai_phong) REFERENCES ChiTietDatPhong (ID_don, ID_loai_phong) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5)
);

--------------------------------------------------------------------------------
-- CÁC TRIGGER KIỂM TRA NGHIỆP VỤ NÂNG CAO
--------------------------------------------------------------------------------

-- 1. Trigger kiểm tra ngày Check-out phải sau ngày Check-in
DELIMITER $
CREATE TRIGGER trigger_check_in_out_BEFORE_INSERT
BEFORE INSERT ON ChiTietDatPhong
FOR EACH ROW
BEGIN
    IF NEW.check_out <= NEW.check_in THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Ngày trả phòng (check_out) bắt buộc phải sau ngày nhận phòng (check_in)!';
    END IF;
END$
DELIMITER ;

-- 2. Trigger kiểm tra ngày Check-out phải sau ngày Check-in (khi Update)
DELIMITER $
CREATE TRIGGER trigger_check_in_out_BEFORE_UPDATE
BEFORE UPDATE ON ChiTietDatPhong
FOR EACH ROW
BEGIN
    IF NEW.check_out <= NEW.check_in THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Ngày trả phòng (check_out) bắt buộc phải sau ngày nhận phòng (check_in)!';
    END IF;
END$
DELIMITER ;

-- 3. Trigger cấm Đánh giá nếu đơn chưa Hoàn thành
DELIMITER $
CREATE TRIGGER trigger_danh_gia_hop_le_BEFORE_INSERT
BEFORE INSERT ON DanhGia
FOR EACH ROW
BEGIN
    DECLARE don_status VARCHAR(30);
    
    SELECT trang_thai INTO don_status 
    FROM DonDatPhong 
    WHERE ID_don = NEW.ID_don;
    
    IF don_status != 'Hoàn thành' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Chỉ được phép đánh giá khi đơn đặt phòng đã Hoàn thành (đã trải qua thời gian lưu trú)!';
    END IF;
END$
DELIMITER ;