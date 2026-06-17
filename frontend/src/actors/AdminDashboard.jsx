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

  // Banner management & Edits
  const [adminBanners, setAdminBanners] = useState([]);
  const [editingBanner, setEditingBanner] = useState(null);
  const [editingMovie, setEditingMovie] = useState(null);
  const [editingShowtime, setEditingShowtime] = useState(null);

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

  // API Call: Banners List
  const loadAdminBanners = async () => {
    try {
      const data = await api.adminGetBanners();
      setAdminBanners(data);
    } catch (err) {
      console.log('Error loading admin banners:', err);
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
      if (adminTab === 'banners') loadAdminBanners();
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

  const handleAdminUpdateMovie = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      await api.adminUpdateMovie(editingMovie.id, payload);
      alert('Cập nhật phim thành công!');
      setEditingMovie(null);
      loadBaseData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAdminUpdateShowtime = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      await api.adminUpdateShowtime(editingShowtime.id, payload);
      alert('Cập nhật suất chiếu thành công!');
      setEditingShowtime(null);
      loadBaseData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAdminCreateBanner = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    if (payload.movieId) payload.movieId = Number(payload.movieId);
    else delete payload.movieId;
    payload.priority = payload.priority ? Number(payload.priority) : 0;
    try {
      await api.adminCreateBanner(payload);
      alert('Tạo banner quảng cáo thành công!');
      loadAdminBanners();
      e.currentTarget.reset();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAdminUpdateBanner = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    if (payload.movieId) payload.movieId = Number(payload.movieId);
    else payload.movieId = null;
    payload.priority = payload.priority ? Number(payload.priority) : 0;
    try {
      await api.adminUpdateBanner(editingBanner.id, payload);
      alert('Cập nhật banner quảng cáo thành công!');
      setEditingBanner(null);
      loadAdminBanners();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAdminDeleteBanner = async (id) => {
    if (!confirm('Bạn chắc chắn muốn xóa banner này?')) return;
    try {
      await api.adminDeleteBanner(id);
      alert('Đã xóa banner quảng cáo.');
      loadAdminBanners();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleBannerStatusAdmin = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await api.adminUpdateBannerStatus(id, newStatus);
      loadAdminBanners();
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
          className={`sidebar-btn ${adminTab === 'banners' ? 'active' : ''}`} 
          onClick={() => setAdminTab('banners')}
        >
          🖼️ Quản Lý Banner
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
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn" style={{ background: '#3498db', color: '#fff', fontSize: '11px', padding: '6px 14px' }} onClick={() => setEditingMovie(m)}>
                            SỬA
                          </button>
                          <button className="btn" style={{ background: '#e74c3c', color: '#fff', fontSize: '11px', padding: '6px 14px' }} onClick={() => handleAdminDeleteMovie(m.id)}>
                            XÓA
                          </button>
                        </div>
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
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn" style={{ background: '#3498db', color: '#fff', fontSize: '11px', padding: '6px 14px' }} onClick={() => setEditingShowtime(s)}>
                            SỬA
                          </button>
                          <button className="btn" style={{ background: '#e74c3c', color: '#fff', fontSize: '11px', padding: '6px 14px' }} onClick={() => handleAdminDeleteShowtime(s.id)}>
                            XÓA LỊCH
                          </button>
                        </div>
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

        {adminTab === 'banners' && (
          <div>
            <h1 style={{ fontWeight: 900, marginBottom: '20px' }}>🖼️ QUẢN LÝ BANNER QUẢNG CÁO TRANG CHỦ</h1>
            <p className="muted" style={{ marginBottom: '24px' }}>Cấu hình slider quảng cáo trang chủ động, liên kết phim và thứ tự ưu tiên hiển thị.</p>

            <form onSubmit={handleAdminCreateBanner} style={{ background: '#fff', padding: '24px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '30px' }}>
              <h3 style={{ fontWeight: 900, marginBottom: '16px' }}>➕ THÊM BANNER MỚI</h3>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label>Tiêu đề chính</label>
                  <input name="title" placeholder="Ví dụ: TẠM BIỆT GOHAN" required />
                </div>
                <div className="form-group">
                  <label>Eyebrow (Dòng mô tả phụ phía trên)</label>
                  <input name="eyebrow" placeholder="Ví dụ: Suất chiếu đặc biệt từ 18H" />
                </div>
                <div className="form-group">
                  <label>Đường dẫn hình ảnh (URL)</label>
                  <input name="imageUrl" placeholder="Nhập URL hình ảnh (1000x800 hoặc tỉ lệ tương đương)" required />
                </div>
                <div className="form-group">
                  <label>Liên kết phim (Chọn nếu muốn liên kết)</label>
                  <select name="movieId">
                    <option value="">-- Không liên kết --</option>
                    {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Chữ trên nút bấm</label>
                  <input name="buttonText" placeholder="Ví dụ: Đặt vé ngay" defaultValue="Đặt vé ngay" />
                </div>
                <div className="form-group">
                  <label>Liên kết khi bấm nút (Optional)</label>
                  <input name="buttonLink" placeholder="Ví dụ: /lich-chieu-phim.html" />
                </div>
                <div className="form-group">
                  <label>Độ ưu tiên hiển thị</label>
                  <input name="priority" type="number" defaultValue="0" required />
                </div>
                <div className="form-group">
                  <label>Trạng thái ban đầu</label>
                  <select name="status">
                    <option value="active">Hoạt động (Active)</option>
                    <option value="inactive">Tạm ngưng (Inactive)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ngày bắt đầu hiển thị</label>
                  <input name="startDate" type="date" />
                </div>
                <div className="form-group">
                  <label>Ngày kết thúc hiển thị</label>
                  <input name="endDate" type="date" />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '15px' }}>
                <label>Mô tả chi tiết</label>
                <textarea name="description" placeholder="Nội dung mô tả tóm tắt..." style={{ height: '70px', width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'inherit' }}></textarea>
              </div>
              <button className="btn" style={{ background: '#111', color: '#fff', marginTop: '16px', padding: '12px 30px' }}>
                TẠO BANNER QUẢNG CÁO MỚI
              </button>
            </form>

            <h3 style={{ fontWeight: 900, marginBottom: '14px' }}>DANH SÁCH BANNER QUẢNG CÁO DƯỚI CƠ SỞ DỮ LIỆU</h3>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ảnh Banner</th>
                    <th>Tiêu đề / Eyebrow</th>
                    <th>Liên Kết Phim</th>
                    <th>Độ Ưu Tiên</th>
                    <th>Thời Hạn Hiển Thị</th>
                    <th>Trạng Thái</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {adminBanners.length > 0 ? (
                    adminBanners.map(b => (
                      <tr key={b.id}>
                        <td>
                          <img src={b.imageUrl} alt={b.title} style={{ width: '120px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }} />
                        </td>
                        <td>
                          <div style={{ fontWeight: 'bold' }}>{b.title}</div>
                          <div className="muted" style={{ fontSize: '11px' }}>{b.eyebrow}</div>
                        </td>
                        <td>
                          {b.Movie ? (
                            <span style={{ fontWeight: '600', color: 'var(--primary-teal)' }}>🎬 {b.Movie.title}</span>
                          ) : (
                            <span className="muted">Không liên kết</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <b>{b.priority}</b>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <button 
                                onClick={async () => {
                                  const orders = [{ id: b.id, priority: b.priority - 1 }];
                                  await api.adminReorderBanners(orders);
                                  loadAdminBanners();
                                }} 
                                style={{ padding: '0 4px', fontSize: '9px', cursor: 'pointer' }}
                                title="Tăng thứ tự (giảm số priority)"
                              >
                                🔺
                              </button>
                              <button 
                                onClick={async () => {
                                  const orders = [{ id: b.id, priority: b.priority + 1 }];
                                  await api.adminReorderBanners(orders);
                                  loadAdminBanners();
                                }} 
                                style={{ padding: '0 4px', fontSize: '9px', cursor: 'pointer' }}
                                title="Giảm thứ tự (tăng số priority)"
                              >
                                🔻
                              </button>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px' }}>
                            {b.startDate || 'N/A'} ~ {b.endDate || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className={`status-badge ${b.status === 'active' ? 'active' : 'inactive'}`} 
                            style={{ border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                            onClick={() => toggleBannerStatusAdmin(b.id, b.status)}
                          >
                            {b.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                          </button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn" style={{ background: '#3498db', color: '#fff', fontSize: '11px', padding: '6px 12px' }} onClick={() => setEditingBanner(b)}>
                              SỬA
                            </button>
                            <button className="btn" style={{ background: '#e74c3c', color: '#fff', fontSize: '11px', padding: '6px 12px' }} onClick={() => handleAdminDeleteBanner(b.id)}>
                              XÓA
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                        Chưa có banner quảng cáo nào được khởi tạo dưới cơ sở dữ liệu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODALS EDITING */}
      {editingMovie && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontWeight: 900, marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📝 CẬP NHẬT PHIM</span>
              <button onClick={() => setEditingMovie(null)} style={{ border: 'none', background: 'transparent', fontSize: '24px', cursor: 'pointer', color: '#888' }}>&times;</button>
            </h3>
            <form onSubmit={handleAdminUpdateMovie}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Tên phim</label>
                  <input name="title" defaultValue={editingMovie.title} required style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div className="form-group">
                  <label>Thể loại</label>
                  <input name="genre" defaultValue={editingMovie.genre} required style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div className="form-group">
                  <label>Độ tuổi (Badge)</label>
                  <select name="age" defaultValue={editingMovie.age} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <option value="P">P (Phổ biến rộng rãi)</option>
                    <option value="K">K (Dành cho trẻ em)</option>
                    <option value="T13">T13 (Trên 13 tuổi)</option>
                    <option value="T16">T16 (Trên 16 tuổi)</option>
                    <option value="T18">T18 (Trên 18 tuổi)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Thời lượng</label>
                  <input name="duration" defaultValue={editingMovie.duration} required style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div className="form-group">
                  <label>Poster URL</label>
                  <input name="poster" defaultValue={editingMovie.poster} required style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select name="status" defaultValue={editingMovie.status} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <option value="now">Đang Chiếu (Now Playing)</option>
                    <option value="soon">Sắp Chiếu (Coming Soon)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phòng chiếu cố định</label>
                  <input name="room" defaultValue={editingMovie.room} required style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '15px' }}>
                <label>Mô tả ngắn</label>
                <textarea name="desc" defaultValue={editingMovie.desc} required style={{ width: '100%', height: '80px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn outline" onClick={() => setEditingMovie(null)}>HỦY</button>
                <button type="submit" className="btn primary" style={{ background: '#00adb5', color: '#fff' }}>LƯU THAY ĐỔI</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingShowtime && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontWeight: 900, marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📝 CẬP NHẬT SUẤT CHIẾU</span>
              <button onClick={() => setEditingShowtime(null)} style={{ border: 'none', background: 'transparent', fontSize: '24px', cursor: 'pointer', color: '#888' }}>&times;</button>
            </h3>
            <p style={{ fontSize: '12px', color: '#e74c3c', marginBottom: '15px' }}>
              * Lưu ý: Nếu suất chiếu đã có khách mua vé, các thông tin Phim, Ngày, Giờ không được phép thay đổi.
            </p>
            <form onSubmit={handleAdminUpdateShowtime}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="form-group">
                  <label>Phim chiếu</label>
                  <select name="movieId" defaultValue={editingShowtime.movieId} required style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
                    {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Ngày chiếu</label>
                  <input name="date" type="date" defaultValue={editingShowtime.date} required style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div className="form-group">
                  <label>Giờ chiếu</label>
                  <select name="time" defaultValue={editingShowtime.time} required style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
                    {showtimes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Giá vé tiêu chuẩn (đ)</label>
                  <input name="price" type="number" defaultValue={editingShowtime.price} required style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn outline" onClick={() => setEditingShowtime(null)}>HỦY</button>
                <button type="submit" className="btn primary" style={{ background: '#00adb5', color: '#fff' }}>LƯU THAY ĐỔI</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingBanner && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontWeight: 900, marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📝 CẬP NHẬT BANNER</span>
              <button onClick={() => setEditingBanner(null)} style={{ border: 'none', background: 'transparent', fontSize: '24px', cursor: 'pointer', color: '#888' }}>&times;</button>
            </h3>
            <form onSubmit={handleAdminUpdateBanner}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Tiêu đề chính</label>
                  <input name="title" defaultValue={editingBanner.title} required style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div className="form-group">
                  <label>Eyebrow (Dòng mô tả phụ phía trên)</label>
                  <input name="eyebrow" defaultValue={editingBanner.eyebrow} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div className="form-group">
                  <label>Liên kết phim (Chọn nếu muốn liên kết)</label>
                  <select name="movieId" defaultValue={editingBanner.movieId || ''}>
                    <option value="">-- Không liên kết --</option>
                    {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Đường dẫn hình ảnh (URL)</label>
                  <input name="imageUrl" defaultValue={editingBanner.imageUrl} required style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div className="form-group">
                  <label>Chữ trên nút bấm</label>
                  <input name="buttonText" defaultValue={editingBanner.buttonText} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div className="form-group">
                  <label>Liên kết khi bấm nút (Optional)</label>
                  <input name="buttonLink" defaultValue={editingBanner.buttonLink} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div className="form-group">
                  <label>Độ ưu tiên hiển thị</label>
                  <input name="priority" type="number" defaultValue={editingBanner.priority} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select name="status" defaultValue={editingBanner.status}>
                    <option value="active">Hoạt động (Active)</option>
                    <option value="inactive">Tạm ngưng (Inactive)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ngày bắt đầu hiển thị</label>
                  <input name="startDate" type="date" defaultValue={editingBanner.startDate || ''} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div className="form-group">
                  <label>Ngày kết thúc hiển thị</label>
                  <input name="endDate" type="date" defaultValue={editingBanner.endDate || ''} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '15px' }}>
                <label>Mô tả chi tiết</label>
                <textarea name="description" defaultValue={editingBanner.description} style={{ width: '100%', height: '70px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn outline" onClick={() => setEditingBanner(null)}>HỦY</button>
                <button type="submit" className="btn primary" style={{ background: '#00adb5', color: '#fff' }}>LƯU THAY ĐỔI</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
