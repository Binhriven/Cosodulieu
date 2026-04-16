// Ung dung quan ly dat phong khach san - Frontend

const API = '';
let tableMeta = {};
let currentTable = '';
let currentMode = 'view';

// Khoi tao khi trang tai xong
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch(`${API}/api/meta`);
    tableMeta = await res.json();
    populateTableSelect();
  } catch (err) {
    showToast('Không thể kết nối server! Kiểm tra lại server.', 'error');
  }
});

// Tao danh sach bang trong dropdown
function populateTableSelect() {
  const sel = document.getElementById('table-select');
  sel.innerHTML = '';
  for (const [key, meta] of Object.entries(tableMeta)) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = meta.label;
    sel.appendChild(opt);
  }
  sel.addEventListener('change', () => {
    currentTable = sel.value;
    setMode('view');
    buildForm();
  });

  currentTable = sel.value;
  setMode('view');
  buildForm();
}

// Chuyen doi che do (view/insert/update/delete)
function setMode(mode) {
  currentMode = mode;
  const badge = document.getElementById('mode-badge');
  const submitBtn = document.getElementById('btn-submit');
  
  badge.className = 'mode-badge ' + mode;
  
  const labels = {
    view: 'VIEW',
    insert: 'INSERT',
    update: 'UPDATE',
    delete: 'DELETE'
  };
  badge.textContent = labels[mode] || mode.toUpperCase();

  if (mode === 'insert' || mode === 'update' || mode === 'delete') {
    submitBtn.style.display = 'inline-flex';
    const submitLabels = {
      insert: 'Thêm mới',
      update: 'Cập nhật',
      delete: 'Xóa'
    };
    submitBtn.textContent = submitLabels[mode];
    
    submitBtn.className = 'btn';
    if (mode === 'insert') submitBtn.classList.add('btn-insert');
    else if (mode === 'update') submitBtn.classList.add('btn-update');
    else if (mode === 'delete') submitBtn.classList.add('btn-delete');
  } else {
    submitBtn.style.display = 'none';
  }
}

// Xay dung form dong theo bang da chon
function buildForm() {
  if (!currentTable || !tableMeta[currentTable]) return;
  
  const meta = tableMeta[currentTable];
  const container = document.getElementById('form-fields');
  const title = document.getElementById('form-title');
  
  title.textContent = meta.label;
  container.innerHTML = '';

  for (const col of meta.columns) {
    const group = document.createElement('div');
    group.className = 'form-group';

    const label = document.createElement('label');
    label.textContent = col.label;
    label.setAttribute('for', `field-${col.name}`);
    group.appendChild(label);

    let input;
    if (col.type === 'select') {
      input = document.createElement('select');
      input.id = `field-${col.name}`;
      input.dataset.col = col.name;
      const emptyOpt = document.createElement('option');
      emptyOpt.value = '';
      emptyOpt.textContent = '-- Chọn --';
      input.appendChild(emptyOpt);
      for (const opt of col.options) {
        const o = document.createElement('option');
        o.value = opt;
        o.textContent = opt;
        input.appendChild(o);
      }
    } else {
      input = document.createElement('input');
      input.id = `field-${col.name}`;
      input.dataset.col = col.name;
      input.type = col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : col.type === 'datetime-local' ? 'datetime-local' : 'text';
      if (col.step) input.step = col.step;
      input.placeholder = col.label;
    }
    
    group.appendChild(input);
    container.appendChild(group);
  }

  updateFieldStates();
}

// Cap nhat trang thai cac truong nhap lieu theo che do
function updateFieldStates() {
  if (!currentTable || !tableMeta[currentTable]) return;
  const meta = tableMeta[currentTable];

  for (const col of meta.columns) {
    const field = document.getElementById(`field-${col.name}`);
    if (!field) continue;

    field.disabled = false;
    
    // Khoa truong auto-increment khi insert
    if (currentMode === 'insert' && col.auto) {
      field.disabled = true;
      field.value = '';
    }
    // Chi cho nhap khoa chinh khi xoa
    if (currentMode === 'delete') {
      field.disabled = !meta.pk.includes(col.name);
    }
  }
}

// Xu ly nhan nut View
function handleView() {
  currentTable = document.getElementById('table-select').value;
  setMode('view');
  buildForm();
  loadData();
}

// Xu ly nhan nut Insert
function handleInsert() {
  currentTable = document.getElementById('table-select').value;
  setMode('insert');
  buildForm();
  clearForm();
}

// Xu ly nhan nut Update
function handleUpdate() {
  currentTable = document.getElementById('table-select').value;
  setMode('update');
  buildForm();
}

// Xu ly nhan nut Delete
function handleDelete() {
  currentTable = document.getElementById('table-select').value;
  setMode('delete');
  buildForm();
}

// Xu ly gui form (them/sua/xoa)
async function handleSubmit() {
  const data = getFormData();

  try {
    let res;
    if (currentMode === 'insert') {
      res = await fetch(`${API}/api/${currentTable}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else if (currentMode === 'update') {
      res = await fetch(`${API}/api/${currentTable}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else if (currentMode === 'delete') {
      res = await fetch(`${API}/api/${currentTable}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }

    const result = await res.json();
    if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast(result.message, 'success');
      loadData();
    }
  } catch (err) {
    showToast('Lỗi: ' + err.message, 'error');
  }
}

// Xu ly tim kiem
async function handleSearch() {
  const data = getFormData();
  try {
    const res = await fetch(`${API}/api/${currentTable}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const rows = await res.json();
    if (rows.error) {
      showToast(rows.error, 'error');
    } else {
      renderTable(rows);
    }
  } catch (err) {
    showToast('Lỗi tìm kiếm: ' + err.message, 'error');
  }
}

// Tai du lieu tu bang hien tai
async function loadData() {
  try {
    const res = await fetch(`${API}/api/${currentTable}`);
    const rows = await res.json();
    if (rows.error) {
      showToast(rows.error, 'error');
    } else {
      renderTable(rows);
    }
  } catch (err) {
    showToast('Lỗi tải dữ liệu: ' + err.message, 'error');
  }
}

// Hien thi du lieu ra bang ket qua
function renderTable(rows) {
  const wrapper = document.getElementById('table-wrapper');
  const countEl = document.getElementById('row-count');
  
  countEl.textContent = `${rows.length} dòng`;

  if (!rows.length) {
    wrapper.innerHTML = '<p class="empty-state">Không có dữ liệu</p>';
    return;
  }

  const cols = Object.keys(rows[0]);
  let html = '<table><thead><tr>';
  cols.forEach(c => { html += `<th>${c}</th>`; });
  html += '</tr></thead><tbody>';

  rows.forEach((row, idx) => {
    html += `<tr onclick="selectRow(${idx}, this)" data-idx="${idx}">`;
    cols.forEach(c => {
      let v = row[c];
      if (v === null || v === undefined) v = '';
      if (typeof v === 'string' && v.match(/^\d{4}-\d{2}-\d{2}T/)) {
        v = v.substring(0, 10);
      }
      html += `<td>${v}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  wrapper.innerHTML = html;
  wrapper.dataset.rows = JSON.stringify(rows);
}

// Chon dong trong bang de dien vao form
function selectRow(idx, trEl) {
  document.querySelectorAll('#table-wrapper tr.selected').forEach(r => r.classList.remove('selected'));
  trEl.classList.add('selected');

  const wrapper = document.getElementById('table-wrapper');
  const rows = JSON.parse(wrapper.dataset.rows || '[]');
  const row = rows[idx];
  if (!row) return;

  const meta = tableMeta[currentTable];
  for (const col of meta.columns) {
    const field = document.getElementById(`field-${col.name}`);
    if (!field) continue;
    
    let val = row[col.name];
    if (val === null || val === undefined) val = '';
    
    if (col.type === 'datetime-local' && val) {
      val = String(val).substring(0, 16);
    } else if (col.type === 'date' && val) {
      if (typeof val === 'string' && val.includes('T')) {
        val = val.substring(0, 10);
      }
    }
    
    field.value = val;
  }

  updateFieldStates();
}

// Lay du lieu tu form
function getFormData() {
  const meta = tableMeta[currentTable];
  const data = {};
  for (const col of meta.columns) {
    const field = document.getElementById(`field-${col.name}`);
    if (!field || field.disabled) continue;
    if (field.value !== '') {
      data[col.name] = field.value;
    }
  }
  return data;
}

// Xoa toan bo form
function clearForm() {
  if (!currentTable || !tableMeta[currentTable]) return;
  const meta = tableMeta[currentTable];
  for (const col of meta.columns) {
    const field = document.getElementById(`field-${col.name}`);
    if (field) field.value = '';
  }
  document.querySelectorAll('#table-wrapper tr.selected').forEach(r => r.classList.remove('selected'));
}

// Thuc thi cau lenh SQL tu SQL Console
async function executeSQL() {
  const sql = document.getElementById('sql-input').value.trim();
  if (!sql) {
    showToast('Vui lòng nhập câu lệnh SQL', 'info');
    return;
  }

  try {
    const res = await fetch(`${API}/api/execute/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql })
    });
    const result = await res.json();

    if (result.error) {
      showToast(result.error, 'error');
      return;
    }

    const wrapper = document.getElementById('sql-table-wrapper');
    const countEl = document.getElementById('sql-row-count');

    if (result.type === 'select' && result.rows) {
      countEl.textContent = `${result.rows.length} dòng`;
      
      if (!result.rows.length) {
        wrapper.innerHTML = '<p class="empty-state">Không có kết quả</p>';
        return;
      }

      const cols = result.columns || Object.keys(result.rows[0]);
      let html = '<table><thead><tr>';
      cols.forEach(c => { html += `<th>${c}</th>`; });
      html += '</tr></thead><tbody>';

      result.rows.forEach(row => {
        html += '<tr>';
        cols.forEach(c => {
          let v = row[c];
          if (v === null || v === undefined) v = '';
          if (typeof v === 'string' && v.match(/^\d{4}-\d{2}-\d{2}T/)) {
            v = v.substring(0, 10);
          }
          html += `<td>${v}</td>`;
        });
        html += '</tr>';
      });

      html += '</tbody></table>';
      wrapper.innerHTML = html;
    } else {
      countEl.textContent = `${result.affectedRows || 0} dòng bị ảnh hưởng`;
      wrapper.innerHTML = `<p class="empty-state" style="color: var(--green);">${result.message}</p>`;
      showToast(result.message, 'success');
    }
  } catch (err) {
    showToast('Lỗi thực thi SQL: ' + err.message, 'error');
  }
}

// Chuyen tab
function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById(`btn-tab-${tab}`).classList.add('active');
}

// Hien thi thong bao
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };
  toast.textContent = `${icons[type] || ''} ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
