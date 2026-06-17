import React, { useState, useEffect } from 'react';
import { api } from '../api';

function money(n) {
  return n ? n.toLocaleString('vi-VN') + 'đ' : '0đ';
}

function MascotLeft() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" style={{ position: 'absolute', left: '15px' }}>
      <circle cx="20" cy="20" r="16" fill="#fbc531" />
      <circle cx="15" cy="17" r="2.5" fill="#2f3640" />
      <circle cx="25" cy="17" r="2.5" fill="#2f3640" />
      <path d="M 14 24 Q 20 30 26 24" stroke="#2f3640" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="18" y="6" width="4" height="6" rx="2" fill="#e84118" />
    </svg>
  );
}

function MascotRight() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" style={{ position: 'absolute', right: '15px' }}>
      <circle cx="20" cy="20" r="16" fill="#4cd137" />
      <circle cx="15" cy="17" r="2" fill="#2f3640" />
      <circle cx="25" cy="17" r="2" fill="#2f3640" />
      <path d="M 15 23 Q 20 28 25 23" stroke="#2f3640" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="21" r="2.5" fill="#ff7675" opacity="0.6" />
      <circle cx="28" cy="21" r="2.5" fill="#ff7675" opacity="0.6" />
      <path d="M 18 8 L 24 4" stroke="#2f3640" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function AdminDashboard({ user, handleLogout, movies, nowMovies, showtimes, showtimeData, loadBaseData }) {
  const [adminTab, setAdminTab] = useState('overview');
  const [adminRevenue, setAdminRevenue] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminAuditLogs, setAdminAuditLogs] = useState([]);
  const [adminVouchers, setAdminVouchers] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);

  // Ticket scan reporting states
  const [adminScanLogs, setAdminScanLogs] = useState([]);
  const [adminScanStats, setAdminScanStats] = useState(null);
  const [scanFilterResult, setScanFilterResult] = useState('');

  // API Call: Bookings List
  const loadAdminBookings = async () => {
    try {
      const data = await api.getBookings();
      setAdminBookings(data);
    } catch (err) {
      console.log('Error loading admin bookings:', err);
    }
  };


  // API Call: Revenue Overview
  const loadAdminOverview = async () => {
    try {
      const data = await api.adminGetRevenue();
      setAdminRevenue(data);
    } catch (err) {
      console.log('Error loading admin revenue:', err);
    }
  };

  // API Call: Users List
  const loadAdminUsers = async () => {
    try {
      const data = await api.adminGetUsers();
      setAdminUsers(data);
    } catch (err) {
      console.log('Error loading admin users:', err);
    }
  };

  // API Call: Audit Logs
  const loadAdminAuditLogs = async () => {
    try {
      const data = await api.adminGetAuditLogs();
      setAdminAuditLogs(data);
    } catch (err) {
      console.log('Error loading admin audit logs:', err);
    }
  };

  // API Call: Vouchers List
  const loadAdminVouchers = async () => {
    try {
      const data = await api.adminGetVouchers();
      setAdminVouchers(data);
    } catch (err) {
      console.log('Error loading admin vouchers:', err);
    }
  };

  // API Call: Scan Logs
  const loadAdminScanLogs = async (resFilter = '') => {
    try {
      const params = {};
      if (resFilter) params.scanResult = resFilter;
      const data = await api.adminGetScanLogs(params);
      setAdminScanLogs(data);
    } catch (err) {
      console.log('Error loading scan logs:', err);
    }
  };

  // API Call: Scan Stats
  const loadAdminScanStats = async () => {
    try {
      const data = await api.adminGetScanStats();
      setAdminScanStats(data);
    } catch (err) {
      console.log('Error loading scan stats:', err);
    }
  };

  // Fetch tab-specific data on change
  useEffect(() => {
    if (user?.role === 'admin') {
      if (adminTab === 'overview') loadAdminOverview();
      if (adminTab === 'accounts') loadAdminUsers();
      if (adminTab === 'audit-logs') loadAdminAuditLogs();
      if (adminTab === 'vouchers') loadAdminVouchers();
      if (adminTab === 'bookings') loadAdminBookings();
      if (adminTab === 'ticket-checkin') {
        loadAdminScanLogs(scanFilterResult);
        loadAdminScanStats();
      }
    }
  }, [adminTab, user, scanFilterResult]);

  const changeUserRoleAdmin = async (userId, role) => {
    try {
      const result = await api.adminUpdateUserRole(userId, role);
      alert(result.message);
      loadAdminUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAdminCreateVoucher = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.discountValue = Number(payload.discountValue);
    payload.maxDiscountAmount = payload.maxDiscountAmount ? Number(payload.maxDiscountAmount) : null;
    payload.minOrderAmount = payload.minOrderAmount ? Number(payload.minOrderAmount) : 0;
    payload.quantity = Number(payload.quantity);
    try {
      const res = await api.adminCreateVoucher(payload);
      alert(res.message);
      loadAdminVouchers();
      e.currentTarget.reset();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAdminDeleteVoucher = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa/ngừng hoạt động voucher này không?')) return;
    try {
      const result = await api.adminDeleteVoucher(id);
      alert(result.message);
      loadAdminVouchers();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleVoucherStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const result = await api.adminUpdateVoucherStatus(id, newStatus);
      alert(result.message);
      loadAdminVouchers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAdminCreateMovie = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      await api.adminCreateMovie(payload);
      alert('Thêm phim mới thành công!');
      loadBaseData();
      e.currentTarget.reset();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAdminDeleteMovie = async (id) => {
    if (!confirm('Bạn chắc chắn muốn xóa phim này khỏi hệ thống?')) return;
    try {
      await api.adminDeleteMovie(id);
      alert('Đã xóa phim khỏi rạp.');
      loadBaseData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAdminCreateShowtime = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      await api.adminCreateShowtime(payload);
      alert('Tạo suất chiếu thành công!');
      loadBaseData();
      e.currentTarget.reset();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAdminDeleteShowtime = async (id) => {
    if (!confirm('Xóa suất chiếu này?')) return;
    try {
      await api.adminDeleteShowtime(id);
      alert('Đã xóa suất chiếu.');
      loadBaseData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAdminRefundBooking = async (id) => {
    if (!confirm(`Bạn có chắc chắn muốn hủy đặt vé ${id} và thực hiện hoàn tiền tự động giải phóng ghế?`)) return;
    try {
      const result = await api.adminRefundBooking(id);
      alert(result.message);
      loadAdminBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-sidebar">
        <h3>QUẢN TRỊ CẤP CAO</h3>
        <button 
          className={`sidebar-btn ${adminTab === 'overview' ? 'active' : ''}`} 
          onClick={() => setAdminTab('overview')}
        >
          📊 Báo Cáo Doanh Thu
        </button>
        <button 
          className={`sidebar-btn ${adminTab === 'movies' ? 'active' : ''}`} 
          onClick={() => setAdminTab('movies')}
        >
          🎬 Quản Lý Phim
        </button>
        <button 
          className={`sidebar-btn ${adminTab === 'showtimes' ? 'active' : ''}`} 
          onClick={() => setAdminTab('showtimes')}
        >
          📅 Quản Lý Lịch Chiếu
        </button>
        <button 
          className={`sidebar-btn ${adminTab === 'accounts' ? 'active' : ''}`} 
          onClick={() => setAdminTab('accounts')}
        >
          👥 Phân Quyền Hội Viên
        </button>
        <button 
          className={`sidebar-btn ${adminTab === 'vouchers' ? 'active' : ''}`} 
          onClick={() => setAdminTab('vouchers')}
        >
          🎟️ Quản Lý Voucher
        </button>
        <button 
          className={`sidebar-btn ${adminTab === 'audit-logs' ? 'active' : ''}`} 
          onClick={() => setAdminTab('audit-logs')}
        >
          📜 Nhật Ký Audit logs
        </button>
        <button 
          className={`sidebar-btn ${adminTab === 'bookings' ? 'active' : ''}`} 
          onClick={() => setAdminTab('bookings')}
        >
          🎟️ Quản Lý Đặt Vé & Hủy
        </button>
        <button 
          className={`sidebar-btn ${adminTab === 'ticket-checkin' ? 'active' : ''}`} 
          onClick={() => setAdminTab('ticket-checkin')}
        >
          🔍 Báo Cáo Soát Vé QR
        </button>
        
        <hr style={{ borderColor: '#333', margin: '15px 0' }} />
        <button className="sidebar-btn" onClick={handleLogout} style={{ color: '#e74c3c' }}>
          🚪 Đăng Xuất
        </button>
      </div>

      <div className="dashboard-content">
        {adminTab === 'overview' && adminRevenue && (
          <div>
            <h1 style={{ fontWeight: 900, marginBottom: '20px' }}>📊 TỔNG QUAN DOANH THU HỆ THỐNG</h1>
            <p className="muted" style={{ marginBottom: '24px' }}>Báo cáo tổng hợp doanh số bán vé rạp chiếu phim và e-shop.</p>

            <div className="metrics-grid">
              <div className="metric-card">
                <span>TỔNG DOANH THU LŨY KẾ</span>
                <h2>{money(adminRevenue.summary.totalRevenue)}</h2>
              </div>
              <div className="metric-card warning">
                <span>DOANH SỐ COMBO BẮP NƯỚC</span>
                <h2>{money(adminRevenue.summary.concessionsRevenue)}</h2>
              </div>
              <div className="metric-card danger">
                <span>TỔNG VÉ ĐÃ BÁN</span>
                <h2>{adminRevenue.summary.totalBookings} đơn</h2>
              </div>
              <div className="metric-card" style={{ background: '#e8f8f5' }}>
                <span>THÀNH VIÊN ĐĂNG KÝ</span>
                <h2 style={{ color: 'var(--primary-teal)' }}>{adminRevenue.summary.totalMembers} hội viên</h2>
              </div>
            </div>

            <h3 style={{ fontWeight: 900, marginBottom: '14px' }}>DOANH THU CHI TIẾT THEO TỪNG ĐẦU PHIM</h3>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tên Phim Xem Nhiều</th>
                    <th>Doanh Thu Tích Lũy</th>
                    <th>Tỷ Lệ Đóng Góp</th>
                  </tr>
                </thead>
                <tbody>
                  {adminRevenue.movieSales.map((sales, idx) => (
                    <tr key={idx}>
                      <td><b>{sales.movie}</b></td>
                      <td><b style={{ color: '#d62246' }}>{money(sales.revenue)}</b></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ flexGrow: 1, height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--primary-teal)', width: `${Math.min(100, (sales.revenue / (adminRevenue.summary.totalRevenue || 1)) * 100)}%` }} />
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: '800' }}>
                            {((sales.revenue / (adminRevenue.summary.totalRevenue || 1)) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminTab === 'movies' && (
          <div>
            <h1 style={{ fontWeight: 900, marginBottom: '20px' }}>🎬 QUẢN LÝ DANH SÁCH PHIM</h1>
            <p className="muted" style={{ marginBottom: '24px' }}>Thêm, sửa và gỡ phim tại rạp Metiz Cinema.</p>

            <form onSubmit={handleAdminCreateMovie} style={{ background: '#fff', padding: '24px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '30px' }}>
              <h3 style={{ fontWeight: 900, marginBottom: '16px' }}>➕ THÊM PHIM MỚI</h3>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label>Tên phim</label>
                  <input name="title" placeholder="Ví dụ: SPIDER-MAN" required />
                </div>
                <div className="form-group">
                  <label>Thể loại</label>
                  <input name="genre" placeholder="Ví dụ: Hành động, Viễn tưởng" required />
                </div>
                <div className="form-group">
                  <label>Độ tuổi (Badge)</label>
                  <select name="age">
                    <option value="P">P (Phổ biến rộng rãi)</option>
                    <option value="K">K (Dành cho trẻ em)</option>
                    <option value="T13">T13 (Trên 13 tuổi)</option>
                    <option value="T16">T16 (Trên 16 tuổi)</option>
                    <option value="T18">T18 (Trên 18 tuổi)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Thời lượng</label>
                  <input name="duration" placeholder="Ví dụ: 120 phút" required />
                </div>
                <div className="form-group">
                  <label>Poster URL</label>
                  <input name="poster" placeholder="Nhập liên kết ảnh poster" required />
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select name="status">
                    <option value="now">Đang Chiếu (Now Playing)</option>
                    <option value="soon">Sắp Chiếu (Coming Soon)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phòng chiếu cố định</label>
                  <input name="room" placeholder="Ví dụ: Phòng chiếu 01" required />
                </div>
              </div>
              <div className="form-group">
                <label>Mô tả ngắn</label>
                <textarea name="desc" placeholder="Tóm tắt phim..." required style={{ height: '80px', fontFamily: 'inherit' }}></textarea>
              </div>
              <button className="btn" style={{ background: '#111', color: '#fff', marginTop: '16px', padding: '12px 30px' }}>
                THÊM PHIM VÀO HỆ THỐNG
              </button>
            </form>

            <h3 style={{ fontWeight: 900, marginBottom: '14px' }}>DANH SÁCH PHIM ĐANG CÓ</h3>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Tên Phim</th>
                    <th>Thể Loại</th>
                    <th>Phân Loại Tuổi</th>
                    <th>Phòng Chiếu</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map(m => (
                    <tr key={m.id}>
                      <td><img src={m.poster} style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '2px' }} /></td>
                      <td><b>{m.title}</b></td>
                      <td>{m.genre}</td>
                      <td>
                        <span className={`age-tag ${m.age.toLowerCase()}`} style={{ position: 'static', padding: '2px 8px' }}>
                          {m.age}
                        </span>
                      </td>
                      <td><b>{m.room}</b></td>
                      <td>
                        <button className="btn" style={{ background: '#e74c3c', color: '#fff', fontSize: '11px', padding: '6px 14px' }} onClick={() => handleAdminDeleteMovie(m.id)}>
                          XÓA
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminTab === 'showtimes' && (
          <div>
            <h1 style={{ fontWeight: 900, marginBottom: '20px' }}>📅 QUẢN LÝ LỊCH CHIẾU & SUẤT CHIẾU</h1>
            <p className="muted" style={{ marginBottom: '24px' }}>Quản lý phòng chiếu, lịch chiếu và tránh xung đột khung giờ.</p>

            <form onSubmit={handleAdminCreateShowtime} style={{ background: '#fff', padding: '24px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '30px' }}>
              <h3 style={{ fontWeight: 900, marginBottom: '16px' }}>➕ TẠO SUẤT CHIẾU MỚI</h3>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label>Chọn Phim</label>
                  <select name="movieId" required>
                    <option value="">-- Chọn Phim --</option>
                    {movies.map(m => <option key={m.id} value={m.id}>{m.title} ({m.room})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Ngày chiếu</label>
                  <input name="date" type="date" required />
                </div>
                <div className="form-group">
                  <label>Giờ chiếu</label>
                  <select name="time" required>
                    {showtimes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Giá vé tiêu chuẩn</label>
                  <input name="price" type="number" defaultValue="55000" required />
                </div>
              </div>
              <button className="btn" style={{ background: '#111', color: '#fff', marginTop: '16px', padding: '12px 30px' }}>
                TẠO SUẤT CHIẾU MỚI
              </button>
            </form>

            <h3 style={{ fontWeight: 900, marginBottom: '14px' }}>DANH SÁCH LỊCH SUẤT CHIẾU DƯỚI CƠ SĐ DỮ LIỆU</h3>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Suất ID</th>
                    <th>Tên Phim</th>
                    <th>Ngày Chiếu</th>
                    <th>Khung Giờ</th>
                    <th>Phòng</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {showtimeData.map(s => (
                    <tr key={s.id}>
                      <td><b>{s.id}</b></td>
                      <td><b>{s.movieTitle}</b></td>
                      <td>{s.date}</td>
                      <td><b style={{ color: 'var(--primary-teal)' }}>{s.time}</b></td>
                      <td>{s.room}</td>
                      <td>
                        <button className="btn" style={{ background: '#e74c3c', color: '#fff', fontSize: '11px', padding: '6px 14px' }} onClick={() => handleAdminDeleteShowtime(s.id)}>
                          XÓA LỊCH
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminTab === 'accounts' && (
          <div>
            <h1 style={{ fontWeight: 900, marginBottom: '20px' }}>👥 PHÂN QUYỀN HỘI VIÊN & TÀI KHOẢN</h1>
            <p className="muted" style={{ marginBottom: '24px' }}>Nâng cấp hoặc gỡ quyền nhân viên, quản trị hệ thống.</p>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Họ Tên</th>
                    <th>Email Liên Hệ</th>
                    <th>Số điện thoại</th>
                    <th>Tích Lũy</th>
                    <th>Hạng Thẻ</th>
                    <th>Chức Vụ</th>
                    <th>Thay Đổi Quyền</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map(u => (
                    <tr key={u.id}>
                      <td><b>{u.fullName}</b></td>
                      <td>{u.email}</td>
                      <td>{u.phone || 'SĐT Trống'}</td>
                      <td><b style={{ color: 'var(--primary-teal)' }}>{u.points}đ</b></td>
                      <td>{u.tier}</td>
                      <td>
                        <span style={{
                          background: u.role === 'admin' ? '#f8d7da' : u.role === 'staff' ? '#fff3cd' : '#e8f4fd',
                          color: u.role === 'admin' ? '#721c24' : u.role === 'staff' ? '#856404' : '#004085',
                          padding: '4px 10px',
                          borderRadius: '3px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <select 
                          value={u.role} 
                          onChange={e => changeUserRoleAdmin(u.id, e.target.value)}
                          style={{ padding: '6px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}
                        >
                          <option value="member">MEMBER (Thành viên)</option>
                          <option value="staff">STAFF (Soát vé/Quầy)</option>
                          <option value="admin">ADMIN (Quản trị viên)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminTab === 'audit-logs' && (
          <div>
            <h1 style={{ fontWeight: 900, marginBottom: '20px' }}>📜 NHẬT KÝ HOẠT ĐỘNG AUDIT LOGS</h1>
            <p className="muted" style={{ marginBottom: '24px' }}>Lịch sử ghi nhận các thao tác cấu hình, check-in, phân quyền của nhân viên/admin.</p>
 
            <div className="audit-list">
              {adminAuditLogs.length === 0 ? (
                <p className="muted" style={{ textAlign: 'center', padding: '40px 0' }}>Chưa có lịch sử audit logs được lưu trữ.</p>
              ) : (
                adminAuditLogs.map(log => (
                  <div className="audit-item" key={log.id}>
                    <div>
                      <span className="audit-item-actor">{log.actor}</span>
                      <b style={{ marginLeft: '10px', color: 'var(--primary-teal)' }}>{log.action}</b>
                      <p style={{ marginTop: '6px', color: '#555' }}>{log.details}</p>
                    </div>
                    <span style={{ fontSize: '11px', color: '#888' }}>
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {adminTab === 'vouchers' && (
          <div>
            <h1 style={{ fontWeight: 900, marginBottom: '20px' }}>🎟️ QUẢN LÝ VOUCHER KHUYẾN MÃI</h1>
            <p className="muted" style={{ marginBottom: '24px' }}>Tạo, sửa, khóa và kiểm soát các mã giảm giá trong hệ thống.</p>

            <form onSubmit={handleAdminCreateVoucher} style={{ background: '#fff', padding: '24px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '30px' }}>
              <h3 style={{ fontWeight: 900, marginBottom: '16px' }}>➕ TẠO VOUCHER MỚI</h3>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label>Mã Voucher (viết hoa, không dấu)</label>
                  <input name="code" placeholder="Ví dụ: METIZ50K" required style={{ textTransform: 'uppercase' }} />
                </div>
                <div className="form-group">
                  <label>Tên chương trình khuyến mãi</label>
                  <input name="name" placeholder="Ví dụ: Tri ân khách hàng" required />
                </div>
                <div className="form-group">
                  <label>Mô tả chi tiết</label>
                  <input name="description" placeholder="Ví dụ: Giảm ngay 50K..." required />
                </div>
                <div className="form-group">
                  <label>Loại giảm giá</label>
                  <select name="discountType" required>
                    <option value="percent">Giảm theo phần trăm (%)</option>
                    <option value="amount">Giảm số tiền cố định (đ)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Giá trị giảm</label>
                  <input name="discountValue" type="number" placeholder="Ví dụ: 10 hoặc 50000" required />
                </div>
                <div className="form-group">
                  <label>Đơn hàng tối thiểu (đ)</label>
                  <input name="minOrderAmount" type="number" defaultValue="0" required />
                </div>
                <div className="form-group">
                  <label>Số tiền giảm tối đa (đ)</label>
                  <input name="maxDiscountAmount" type="number" placeholder="Bỏ trống nếu không giới hạn" />
                </div>
                <div className="form-group">
                  <label>Số lượng phát hành</label>
                  <input name="quantity" type="number" placeholder="Ví dụ: 100" required />
                </div>
                <div className="form-group">
                  <label>Ngày bắt đầu</label>
                  <input name="startDate" type="date" required />
                </div>
                <div className="form-group">
                  <label>Ngày kết thúc</label>
                  <input name="endDate" type="date" required />
                </div>
              </div>
              <button className="btn" style={{ background: '#111', color: '#fff', marginTop: '16px', padding: '12px 30px' }}>
                PHÁT HÀNH VOUCHER
              </button>
            </form>

            <h3 style={{ fontWeight: 900, marginBottom: '14px' }}>DANH SÁCH VOUCHER</h3>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã Code</th>
                    <th>Tên Chương Trình</th>
                    <th>Loại Giảm</th>
                    <th>Min Đơn</th>
                    <th>Số Lượng / Đã Dùng</th>
                    <th>Hạn Sử Dụng</th>
                    <th>Trạng Thái</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {adminVouchers.map(v => (
                    <tr key={v.id} style={{ opacity: v.status === 'inactive' ? 0.5 : 1 }}>
                      <td><b style={{ color: 'var(--primary-teal)' }}>{v.code}</b></td>
                      <td>
                        <b>{v.name}</b>
                        <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>{v.description}</p>
                      </td>
                      <td><b>{v.discountType === 'percent' ? `${v.discountValue}%` : money(v.discountValue)}</b></td>
                      <td>{money(v.minOrderAmount)}</td>
                      <td><b>{v.usedCount}</b> / {v.quantity}</td>
                      <td><span style={{ fontSize: '12px' }}>{v.startDate} đến {v.endDate}</span></td>
                      <td>
                        <button 
                          className="btn" 
                          type="button"
                          style={{
                            background: v.status === 'active' ? '#2ecc71' : '#e74c3c',
                            color: '#fff',
                            fontSize: '10px',
                            padding: '4px 8px'
                          }}
                          onClick={() => toggleVoucherStatus(v.id, v.status)}
                        >
                          {v.status === 'active' ? 'HOẠT ĐỘNG' : 'TẠM KHÓA'}
                        </button>
                      </td>
                      <td>
                        <button 
                          className="btn" 
                          type="button"
                          style={{ background: '#e74c3c', color: '#fff', fontSize: '11px', padding: '6px 14px' }} 
                          onClick={() => handleAdminDeleteVoucher(v.id)}
                        >
                          XÓA
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminTab === 'bookings' && (
          <div>
            <h1 style={{ fontWeight: 900, marginBottom: '20px' }}>🎟️ QUẢN LÝ GIAO DỊCH ĐẶT VÉ</h1>
            <p className="muted" style={{ marginBottom: '24px' }}>Hủy giao dịch, hoàn tiền tự động và giải phóng ghế cho khách hàng.</p>
            
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã Booking</th>
                    <th>Khách Hàng</th>
                    <th>Phim</th>
                    <th>Suất Chiếu</th>
                    <th>Số Ghế</th>
                    <th>Tổng Tiền</th>
                    <th>Kênh Đặt</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {adminBookings.map(b => (
                    <tr key={b.id}>
                      <td><b>{b.id}</b></td>
                      <td>
                        <b>{b.customerName}</b><br/>
                        <span className="muted" style={{ fontSize: '11px' }}>{b.phone || 'Không có SĐT'}</span>
                      </td>
                      <td><b>{b.movieTitle}</b></td>
                      <td>
                        <span style={{ fontSize: '12px' }}>{b.time}</span><br/>
                        <span className="muted" style={{ fontSize: '11px' }}>{new Date(b.date).toLocaleDateString('vi-VN')}</span>
                      </td>
                      <td>
                        <b style={{ color: 'var(--primary-teal)' }}>{b.seats ? b.seats.join(', ') : ''}</b>
                      </td>
                      <td><b style={{ color: '#d62246' }}>{money(b.total)}</b></td>
                      <td><span className="muted" style={{ fontSize: '12px' }}>{b.createdBy || 'Web Portal'}</span></td>
                      <td>
                        <button 
                          className="btn" 
                          type="button"
                          style={{ background: '#e74c3c', color: '#fff', fontSize: '11px', padding: '6px 12px' }}
                          onClick={() => handleAdminRefundBooking(b.id)}
                        >
                          Hủy & Hoàn Tiền
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminTab === 'ticket-checkin' && (
          <div>
            <h1 style={{ fontWeight: 900, marginBottom: '20px' }}>🔍 THỐNG KÊ & NHẬT KÝ SOÁT VÉ QR</h1>
            <p className="muted" style={{ marginBottom: '24px' }}>Báo cáo lưu lượng soát vé thực tế, tỷ lệ check-in phòng chiếu và quản lý logs kiểm tra vé gian lận.</p>

            {adminScanStats && (
              <div className="metrics-grid" style={{ marginBottom: '30px' }}>
                <div className="metric-card" style={{ background: '#ebf5fb' }}>
                  <span>TỔNG VÉ ĐÃ BÁN</span>
                  <h2 style={{ color: '#2980b9' }}>{adminScanStats.totalSold || 0} vé</h2>
                </div>
                <div className="metric-card" style={{ background: '#eefbf3' }}>
                  <span>ĐÃ VÀO PHÒNG CHIẾU</span>
                  <h2 style={{ color: '#27ae60' }}>
                    {adminScanStats.totalCheckedIn || 0} vé ({((adminScanStats.totalCheckedIn || 0) / (adminScanStats.totalSold || 1) * 100).toFixed(1)}%)
                  </h2>
                </div>
                <div className="metric-card warning" style={{ background: '#fef9e7' }}>
                  <span>CHỜ CHECK-IN</span>
                  <h2 style={{ color: '#f39c12' }}>{adminScanStats.totalPending || 0} vé</h2>
                </div>
                <div className="metric-card danger" style={{ background: '#fdf2f2' }}>
                  <span>LƯỢT TỪ CHỐI / CẢNH BÁO</span>
                  <h2 style={{ color: '#e74c3c' }}>{adminScanStats.totalRejected || 0} lượt</h2>
                </div>
              </div>
            )}

            {/* Filter Section */}
            <div style={{ background: '#fafafa', padding: '16px 20px', border: '1px solid #eee', borderRadius: '6px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Bộ lọc trạng thái quét:</label>
                <select 
                  value={scanFilterResult} 
                  onChange={e => setScanFilterResult(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '180px' }}
                >
                  <option value="">Tất cả kết quả</option>
                  <option value="success">Thành công (success)</option>
                  <option value="failed">Thất bại / Bị từ chối (failed)</option>
                </select>
              </div>
              <button 
                className="btn" 
                style={{ background: '#111', color: '#fff', fontSize: '12px' }}
                onClick={() => {
                  loadAdminScanLogs(scanFilterResult);
                  loadAdminScanStats();
                }}
              >
                🔄 Tải lại dữ liệu
              </button>
            </div>

            {/* Logs Table */}
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Thời Gian Quét</th>
                    <th>Mã Vé</th>
                    <th>Mã Booking</th>
                    <th>Nhân Viên Soát</th>
                    <th>Kết Quả</th>
                    <th>Lý Do / Chi Tiết</th>
                    <th>Thiết Bị & IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {adminScanLogs.length > 0 ? (
                    adminScanLogs.map(log => (
                      <tr key={log.id} style={{ background: log.scanResult === 'failed' ? '#fff9f9' : '#fff' }}>
                        <td style={{ fontSize: '12px' }}>
                          {new Date(log.createdAt || log.scannedAt).toLocaleString('vi-VN')}
                        </td>
                        <td><b>{log.ticketId || log.ticketCode || 'N/A'}</b></td>
                        <td><b>{log.bookingId || log.bookingCode || 'N/A'}</b></td>
                        <td>
                          <span style={{ fontWeight: '600' }}>{log.Staff ? log.Staff.fullName : `Mã NV: ${log.staffId}`}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${log.scanResult === 'success' ? 'active' : 'inactive'}`} style={{
                            background: log.scanResult === 'success' ? '#2ecc71' : '#e74c3c',
                            color: '#fff',
                            fontWeight: 'bold'
                          }}>
                            {log.scanResult === 'success' ? 'Thành công' : 'Từ chối'}
                          </span>
                        </td>
                        <td style={{ fontSize: '13px', color: log.scanResult === 'failed' ? '#c0392b' : '#333' }}>
                          <b>{log.reason || log.failureReason || 'Chi tiết thành công'}</b>
                        </td>
                        <td className="muted" style={{ fontSize: '11px' }}>
                          {log.deviceInfo || 'Browser'} (IP: {log.ipAddress || '127.0.0.1'})
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                        Không tìm thấy nhật ký soát vé nào khớp với bộ lọc.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
