const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ket noi MySQL
const pool = mysql.createPool({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: 'your_secure_mysql_password',
  database: 'hotel_booking_management',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

// Thong tin cac bang trong CSDL (ten, khoa chinh, cac cot)
const TABLE_META = {
  TaiKhoanQuanTri: {
    label: 'Tài Khoản Quản Trị',
    pk: ['ID_quan_tri'],
    columns: [
      { name: 'ID_quan_tri', label: 'ID Quản Trị', type: 'number', auto: true },
      { name: 'username', label: 'Username', type: 'text' },
      { name: 'password', label: 'Password', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' }
    ]
  },
  KhachHang: {
    label: 'Khách Hàng',
    pk: ['ID_khach_hang'],
    columns: [
      { name: 'ID_khach_hang', label: 'ID Khách Hàng', type: 'number', auto: true },
      { name: 'username', label: 'Username', type: 'text' },
      { name: 'password', label: 'Password', type: 'text' },
      { name: 'ho_ten', label: 'Họ Tên', type: 'text' },
      { name: 'sdt', label: 'SĐT', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' }
    ]
  },
  KhachSan: {
    label: 'Khách Sạn',
    pk: ['ID_khach_san'],
    columns: [
      { name: 'ID_khach_san', label: 'ID Khách Sạn', type: 'number', auto: true },
      { name: 'ten_KS', label: 'Tên Khách Sạn', type: 'text' },
      { name: 'dia_chi', label: 'Địa Chỉ', type: 'text' },
      { name: 'diem_tb', label: 'Điểm TB', type: 'number', step: '0.01' },
      { name: 'ID_quan_tri', label: 'ID Quản Trị', type: 'number' }
    ]
  },
  LoaiPhong: {
    label: 'Loại Phòng',
    pk: ['ID_loai_phong'],
    columns: [
      { name: 'ID_loai_phong', label: 'ID Loại Phòng', type: 'number', auto: true },
      { name: 'ten_loai', label: 'Tên Loại', type: 'text' },
      { name: 'suc_chua', label: 'Sức Chứa', type: 'number' },
      { name: 'ID_khach_san', label: 'ID Khách Sạn', type: 'number' }
    ]
  },
  QuyPhongGia: {
    label: 'Quỹ Phòng Giá',
    pk: ['ID_loai_phong', 'ngay'],
    columns: [
      { name: 'ID_loai_phong', label: 'ID Loại Phòng', type: 'number' },
      { name: 'ngay', label: 'Ngày', type: 'date' },
      { name: 'so_luong_trong', label: 'Số Lượng Trống', type: 'number' },
      { name: 'gia_ban', label: 'Giá Bán', type: 'number', step: '0.01' }
    ]
  },
  DonDatPhong: {
    label: 'Đơn Đặt Phòng',
    pk: ['ID_don'],
    columns: [
      { name: 'ID_don', label: 'ID Đơn', type: 'number', auto: true },
      { name: 'tong_tien', label: 'Tổng Tiền', type: 'number', step: '0.01' },
      { name: 'trang_thai', label: 'Trạng Thái', type: 'select', options: ['Chờ thanh toán', 'Đã thanh toán', 'Đã hủy', 'Hoàn thành'] },
      { name: 'ID_khach_hang', label: 'ID Khách Hàng', type: 'number' }
    ]
  },
  ChiTietDatPhong: {
    label: 'Chi Tiết Đặt Phòng',
    pk: ['ID_don', 'ID_loai_phong'],
    columns: [
      { name: 'ID_don', label: 'ID Đơn', type: 'number' },
      { name: 'ID_loai_phong', label: 'ID Loại Phòng', type: 'number' },
      { name: 'check_in', label: 'Check-in', type: 'date' },
      { name: 'check_out', label: 'Check-out', type: 'date' },
      { name: 'so_luong_phong', label: 'Số Lượng Phòng', type: 'number' },
      { name: 'gia_mua', label: 'Giá Mua', type: 'number', step: '0.01' }
    ]
  },
  GiaoDich: {
    label: 'Giao Dịch',
    pk: ['ma_giao_dich'],
    columns: [
      { name: 'ma_giao_dich', label: 'Mã Giao Dịch', type: 'text' },
      { name: 'so_tien', label: 'Số Tiền', type: 'number', step: '0.01' },
      { name: 'thoi_gian', label: 'Thời Gian', type: 'datetime-local' },
      { name: 'ID_don', label: 'ID Đơn', type: 'number' }
    ]
  },
  DanhGia: {
    label: 'Đánh Giá',
    pk: ['ID_danh_gia'],
    columns: [
      { name: 'ID_danh_gia', label: 'ID Đánh Giá', type: 'number', auto: true },
      { name: 'rating', label: 'Rating (1-5)', type: 'number' },
      { name: 'noi_dung', label: 'Nội Dung', type: 'text' },
      { name: 'ID_don', label: 'ID Đơn', type: 'number' },
      { name: 'ID_loai_phong', label: 'ID Loại Phòng', type: 'number' }
    ]
  }
};

// Lay thong tin cac bang
app.get('/api/meta', (req, res) => {
  res.json(TABLE_META);
});

// Lay tat ca du lieu cua mot bang
app.get('/api/:table', async (req, res) => {
  const table = req.params.table;
  if (!TABLE_META[table]) return res.status(400).json({ error: 'Bảng không hợp lệ' });

  try {
    const [rows] = await pool.query(`SELECT * FROM \`${table}\``);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tim kiem du lieu trong bang
app.post('/api/:table/search', async (req, res) => {
  const table = req.params.table;
  if (!TABLE_META[table]) return res.status(400).json({ error: 'Bảng không hợp lệ' });

  try {
    const filters = req.body;
    const conditions = [];
    const values = [];

    for (const [col, val] of Object.entries(filters)) {
      if (val === '' || val === null || val === undefined) continue;
      const colMeta = TABLE_META[table].columns.find(c => c.name === col);
      if (!colMeta) continue;

      if (colMeta.type === 'text') {
        conditions.push(`\`${col}\` LIKE ?`);
        values.push(`%${val}%`);
      } else {
        conditions.push(`\`${col}\` = ?`);
        values.push(val);
      }
    }

    let sql = `SELECT * FROM \`${table}\``;
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const [rows] = await pool.query(sql, values);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Them ban ghi moi
app.post('/api/:table', async (req, res) => {
  const table = req.params.table;
  if (!TABLE_META[table]) return res.status(400).json({ error: 'Bảng không hợp lệ' });

  try {
    const data = req.body;
    const meta = TABLE_META[table];
    const insertData = {};

    // Bo qua cot auto-increment neu rong
    for (const col of meta.columns) {
      if (col.auto && (!data[col.name] || data[col.name] === '')) continue;
      if (data[col.name] !== undefined && data[col.name] !== '') {
        insertData[col.name] = data[col.name];
      }
    }

    const cols = Object.keys(insertData);
    const placeholders = cols.map(() => '?').join(', ');
    const vals = Object.values(insertData);

    const sql = `INSERT INTO \`${table}\` (${cols.map(c => `\`${c}\``).join(', ')}) VALUES (${placeholders})`;
    const [result] = await pool.query(sql, vals);
    res.json({ success: true, message: 'Thêm thành công!', insertId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cap nhat ban ghi
app.put('/api/:table', async (req, res) => {
  const table = req.params.table;
  if (!TABLE_META[table]) return res.status(400).json({ error: 'Bảng không hợp lệ' });

  try {
    const data = req.body;
    const meta = TABLE_META[table];
    const pkCols = meta.pk;

    // Tao menh de SET (cac cot khong phai khoa chinh)
    const setCols = [];
    const setVals = [];
    for (const col of meta.columns) {
      if (pkCols.includes(col.name)) continue;
      if (data[col.name] !== undefined && data[col.name] !== '') {
        setCols.push(`\`${col.name}\` = ?`);
        setVals.push(data[col.name]);
      }
    }

    // Tao menh de WHERE (khoa chinh)
    const whereCols = [];
    const whereVals = [];
    for (const pk of pkCols) {
      whereCols.push(`\`${pk}\` = ?`);
      whereVals.push(data[pk]);
    }

    if (setCols.length === 0) return res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
    if (whereVals.some(v => !v && v !== 0)) return res.status(400).json({ error: 'Thiếu khóa chính' });

    const sql = `UPDATE \`${table}\` SET ${setCols.join(', ')} WHERE ${whereCols.join(' AND ')}`;
    const [result] = await pool.query(sql, [...setVals, ...whereVals]);
    res.json({ success: true, message: `Cập nhật thành công! (${result.affectedRows} dòng)` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Xoa ban ghi
app.delete('/api/:table', async (req, res) => {
  const table = req.params.table;
  if (!TABLE_META[table]) return res.status(400).json({ error: 'Bảng không hợp lệ' });

  try {
    const data = req.body;
    const meta = TABLE_META[table];
    const pkCols = meta.pk;

    const whereCols = [];
    const whereVals = [];
    for (const pk of pkCols) {
      whereCols.push(`\`${pk}\` = ?`);
      whereVals.push(data[pk]);
    }

    if (whereVals.some(v => !v && v !== 0)) return res.status(400).json({ error: 'Thiếu khóa chính để xóa' });

    const sql = `DELETE FROM \`${table}\` WHERE ${whereCols.join(' AND ')}`;
    const [result] = await pool.query(sql, whereVals);
    res.json({ success: true, message: `Xóa thành công! (${result.affectedRows} dòng)` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Thuc thi cau lenh SQL tuy chinh
app.post('/api/execute/query', async (req, res) => {
  const { sql } = req.body;
  if (!sql || !sql.trim()) return res.status(400).json({ error: 'Câu SQL trống' });

  try {
    const [rows, fields] = await pool.query(sql);
    if (Array.isArray(rows)) {
      res.json({ type: 'select', rows, columns: fields ? fields.map(f => f.name) : [] });
    } else {
      res.json({ type: 'execute', affectedRows: rows.affectedRows, message: 'Thực thi thành công!' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log('Hotel Booking Management System');
  console.log(`Server dang chay tai http://localhost:${PORT}`);
  console.log('MySQL: localhost:3307');
});
