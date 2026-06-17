import React, { useEffect, useMemo, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { api } from './api';
import './style.css';

// Dedicated Actor Dashboards (RBAC)
import ForbiddenGate from './actors/ForbiddenGate';
import MemberDashboard from './actors/MemberDashboard';
import StaffDashboard from './actors/StaffDashboard';
import AdminDashboard from './actors/AdminDashboard';

// Modular Public Pages & components
import BookingFlow from './components/BookingFlow';
import Home from './pages/Home';
import LichChieuPhim from './pages/LichChieuPhim';
import Phim from './pages/Phim';
import MuaSam from './pages/MuaSam';
import LienHe from './pages/LienHe';
import TinVaKhuyenMai from './pages/TinVaKhuyenMai';
import VeCuaToi from './pages/VeCuaToi';

const showtimes = ['09:30', '11:45', '14:10', '16:30', '19:00', '21:20'];
const rows = 'ABCDEF'.split('');
const allSeats = rows.flatMap((row) => Array.from({ length: 10 }, (_, index) => `${row}${index + 1}`));

function money(n) {
  return n ? n.toLocaleString('vi-VN') + 'đ' : '0đ';
}

function dateLabel(date, index) {
  if (index === 0) return 'Hôm nay';
  return new Date(date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

function MetizLogo({ onClick }) {
  return (
    <div className="logo" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="logo-m">
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <path d="M15 80V35C15 26.7 21.7 20 30 20H35C38.3 20 41 22.7 41 26V80" stroke="#00adb5" strokeWidth="12" strokeLinecap="round" fill="none"/>
          <path d="M41 40C41 31.7 47.7 25 56 25H60C68.3 25 75 31.7 75 40V80" stroke="#d62246" strokeWidth="12" strokeLinecap="round" fill="none"/>
          <path d="M28 45L46 63" stroke="#f39c12" strokeWidth="10" strokeLinecap="round"/>
          <path d="M50 63L68 45" stroke="#8e44ad" strokeWidth="10" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="logo-text-wrapper">
        <span className="logo-brand">metiz<span>cinema</span></span>
        <span className="logo-sub">ĐÀ NẴNG</span>
      </div>
    </div>
  );
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

// ForbiddenGate is imported from './actors/ForbiddenGate'

function OldMemberDashboard({ user, bookingsHistory, onLogout }) {
  const [activeTab, setActiveTab] = useState('profile');

  const isGold = user.tier.toLowerCase().includes('gold');
  const isDiamond = user.tier.toLowerCase().includes('diamond');
  
  const cardBackground = isGold 
    ? 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)'
    : isDiamond
    ? 'linear-gradient(135deg, #434343 0%, #000000 100%)'
    : 'linear-gradient(135deg, #0f4c81 0%, #002855 100%)';

  return (
    <section className="section container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }} className="member-dashboard-grid">
        <style dangerouslySetInnerHTML={{__html: `
          @media (min-width: 992px) {
            .member-dashboard-grid {
              grid-template-columns: 350px 1fr !important;
            }
          }
          .member-card-wrapper {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 24px;
            box-shadow: var(--card-shadow);
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .m-star-card {
            background: ${cardBackground};
            border-radius: 12px;
            padding: 24px;
            color: #fff;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            aspect-ratio: 1.58 / 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .m-star-card::after {
            content: '';
            position: absolute;
            top: -20%;
            right: -20%;
            width: 60%;
            height: 100%;
            background: rgba(255, 255, 255, 0.05);
            transform: skewX(-20deg);
            pointer-events: none;
          }
          .m-star-logo {
            font-size: 20px;
            font-weight: 900;
            letter-spacing: 0.1em;
          }
          .m-star-barcode {
            margin-top: 15px;
            height: 40px;
            background: repeating-linear-gradient(90deg, #fff, #fff 2px, transparent 2px, transparent 6px);
            opacity: 0.8;
          }
          .m-star-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .dashboard-tabs-container {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: var(--card-shadow);
            overflow: hidden;
          }
          .dashboard-tabs-header {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            background: #f5f6fa;
            border-bottom: 1px solid #ddd;
          }
          .dashboard-tab-btn {
            border: none;
            background: transparent;
            padding: 15px 10px;
            font-size: 13px;
            font-weight: 800;
            cursor: pointer;
            text-align: center;
            color: #555;
            transition: all 0.2s;
            border-bottom: 3px solid transparent;
          }
          .dashboard-tab-btn.active {
            background: #fff;
            color: #111;
            border-bottom-color: var(--primary-teal);
          }
          .dashboard-tabs-content {
            padding: 30px;
          }
          .profile-form-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 15px;
          }
          @media (min-width: 768px) {
            .profile-form-grid {
              grid-template-columns: 1fr 1fr;
            }
          }
          .profile-field-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .profile-field-group label {
            font-size: 11px;
            font-weight: 800;
            color: #888;
            text-transform: uppercase;
          }
          .profile-field-group input {
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: #fafafa;
            color: #333;
            cursor: not-allowed;
          }
        `}} />

        <div className="member-card-wrapper">
          <div className="m-star-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="m-star-logo">M-STAR</div>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>
                ⭐ {user.points} ĐIỂM
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user.fullName}</div>
              <div className="m-star-barcode"></div>
              <div style={{ fontSize: '10px', opacity: 0.7, textAlign: 'center', marginTop: '4px', letterSpacing: '0.1em' }}>{user.phone}</div>
            </div>

            <div className="m-star-footer">
              <div>
                <div style={{ fontSize: '9px', opacity: 0.8, textTransform: 'uppercase' }}>Hạng thẻ</div>
                <div style={{ fontSize: '13px', fontWeight: '800' }}>{user.tier}</div>
              </div>
              <div style={{ fontSize: '11px', fontWeight: '700' }}>METIZ CINEMA</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#333', marginBottom: '10px' }}>TIẾN TRÌNH HẠNG THẺ</h4>
            
            <div style={{ position: 'relative', height: '6px', background: '#eee', borderRadius: '3px', margin: '20px 0 10px' }}>
              <div style={{ 
                position: 'absolute', 
                left: 0, 
                top: 0, 
                height: '100%', 
                width: isDiamond ? '100%' : isGold ? '66%' : '33%', 
                background: 'var(--primary-teal)',
                borderRadius: '3px' 
              }}></div>
              
              <div style={{ position: 'absolute', left: '33%', top: '50%', transform: 'translate(-50%, -50%)', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary-teal)', border: '2px solid #fff' }}></div>
              <div style={{ position: 'absolute', left: '66%', top: '50%', transform: 'translate(-50%, -50%)', width: '12px', height: '12px', borderRadius: '50%', background: isGold || isDiamond ? 'var(--primary-teal)' : '#eee', border: '2px solid #fff' }}></div>
              <div style={{ position: 'absolute', left: '100%', top: '50%', transform: 'translate(-50%, -50%)', width: '12px', height: '12px', borderRadius: '50%', background: isDiamond ? 'var(--primary-teal)' : '#eee', border: '2px solid #fff' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '800', color: '#888' }}>
              <span>M-STAR</span>
              <span>M-GOLD</span>
              <span>M-DIAMOND</span>
            </div>

            <div style={{ marginTop: '15px', background: '#fafafa', padding: '10px', borderRadius: '4px', fontSize: '11px', color: '#666', border: '1px dashed #ddd', textAlign: 'center' }}>
              Tổng chi tiêu năm 2026: <b>{(user.points * 20000).toLocaleString('vi-VN')}đ</b>
            </div>
          </div>
        </div>

        <div className="dashboard-tabs-container">
          <div className="dashboard-tabs-header">
            <button className={`dashboard-tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              👤 THÔNG TIN
            </button>
            <button className={`dashboard-tab-btn ${activeTab === 'card-rules' ? 'active' : ''}`} onClick={() => setActiveTab('card-rules')}>
              🎫 THẺ THÀNH VIÊN
            </button>
            <button className={`dashboard-tab-btn ${activeTab === 'policies' ? 'active' : ''}`} onClick={() => setActiveTab('policies')}>
              📜 CHÍNH SÁCH
            </button>
            <button className={`dashboard-tab-btn ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>
              💵 GIAO DỊCH
            </button>
          </div>

          <div className="dashboard-tabs-content">
            {activeTab === 'profile' && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '900', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px', color: '#111' }}>
                  THÔNG TIN TÀI KHOẢN HỘI VIÊN
                </h3>
                
                <div className="profile-form-grid">
                  <div className="profile-field-group">
                    <label>Họ và Tên</label>
                    <input value={user.fullName} readOnly style={{ border: '1px solid #ddd' }} />
                  </div>
                  <div className="profile-field-group">
                    <label>Địa Chỉ Email</label>
                    <input value={user.email} readOnly style={{ border: '1px solid #ddd' }} />
                  </div>
                  <div className="profile-field-group">
                    <label>Số Điện Thoại</label>
                    <input value={user.phone || 'Chưa cập nhật'} readOnly style={{ border: '1px solid #ddd' }} />
                  </div>
                  <div className="profile-field-group">
                    <label>Ngày Sinh</label>
                    <input value="19/04/2004" readOnly style={{ border: '1px solid #ddd' }} />
                  </div>
                  <div className="profile-field-group">
                    <label>CCCD / Hộ Chiếu</label>
                    <input value="54204006960" readOnly style={{ border: '1px solid #ddd' }} />
                  </div>
                  <div className="profile-field-group">
                    <label>Giới Tính</label>
                    <input value="Nam" readOnly style={{ border: '1px solid #ddd' }} />
                  </div>
                </div>

                <div style={{ marginTop: '20px', background: '#fff9db', border: '1px solid #ffe066', padding: '12px 16px', borderRadius: '4px', color: '#856404', fontSize: '12px', fontWeight: '700' }}>
                  ⚠️ Liên hệ hotline <b>0236 3630 689</b> hoặc tới quầy CSKH của rạp Metiz để được hỗ trợ thay đổi thông tin cá nhân.
                </div>

                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                  <a href="#" style={{ fontSize: '13px', color: 'var(--primary-teal)', fontWeight: 'bold' }} onClick={(e) => { e.preventDefault(); alert('Chức năng đổi mật khẩu đang gửi email xác nhận OTP tới: ' + user.email); }}>
                    Đổi mật khẩu?
                  </a>
                </div>
              </div>
            )}

            {activeTab === 'card-rules' && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '900', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px', color: '#111' }}>
                  HẠNG THẺ & QUYỀN LỢI ƯU ĐÃI
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '6px', background: !isGold && !isDiamond ? '#f8f9fa' : 'transparent' }}>
                    <h4 style={{ fontWeight: '800', color: '#0f4c81' }}>1. Hạng Thẻ Standard</h4>
                    <p className="muted" style={{ fontSize: '13px', marginTop: '5px' }}>
                      • Tích lũy <b>5%</b> giá trị giao dịch mua vé & bắp nước tại rạp online.<br/>
                      • Đạt hạng Standard ngay sau khi hoàn tất đăng ký tài khoản.
                    </p>
                  </div>
                  <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '6px', background: isGold ? '#fffdf5' : 'transparent', borderColor: isGold ? '#d4af37' : '#ddd' }}>
                    <h4 style={{ fontWeight: '800', color: '#aa7c11' }}>2. Hạng Thẻ VIP Gold (Đạt mốc từ 200 điểm)</h4>
                    <p className="muted" style={{ fontSize: '13px', marginTop: '5px' }}>
                      • Tích lũy <b>7%</b> giá trị giao dịch mua vé & bắp nước tại rạp online.<br/>
                      • Tặng 1 phần bắp ngọt size lớn miễn phí vào tuần lễ sinh nhật.
                    </p>
                  </div>
                  <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '6px', background: isDiamond ? '#fafafa' : 'transparent', borderColor: isDiamond ? '#333' : '#ddd' }}>
                    <h4 style={{ fontWeight: '800', color: '#333' }}>3. Hạng Thẻ VVIP Diamond (Đạt mốc từ 500 điểm)</h4>
                    <p className="muted" style={{ fontSize: '13px', marginTop: '5px' }}>
                      • Tích lũy <b>10%</b> giá trị giao dịch mua vé & bắp nước tại rạp online.<br/>
                      • Tặng 1 combo bắp nước lớn + 2 vé xem phim 2D miễn phí dịp sinh nhật.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'policies' && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '900', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px', color: '#111' }}>
                  CHÍNH SÁCH ĐIỀU KHOẢN THÀNH VIÊN
                </h3>
                <p className="muted" style={{ fontSize: '13px', lineHeight: '1.8' }}>
                  • Điểm tích lũy thành viên chỉ áp dụng đối với các giao dịch mua vé hợp lệ trên website hoặc tại quầy bán vé Metiz Cinema.<br/>
                  • Điểm tích lũy không có giá trị quy đổi thành tiền mặt, nhưng có thể dùng để đổi vé xem phim, combo bắp nước hoặc quà lưu niệm tại rạp.<br/>
                  • Thẻ thành viên là tài sản cá nhân, không được cho mượn hoặc chuyển nhượng dưới mọi hình thức.<br/>
                  • Hệ thống tự động thiết lập thời hạn duy trì hạng thẻ là 1 năm kể từ thời điểm nâng hạng thành công.
                </p>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '900', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px', color: '#111' }}>
                  LỊCH SỬ GIAO DỊCH (MYSQL DATABASE)
                </h3>
                {bookingsHistory.length === 0 ? (
                  <p className="muted" style={{ textAlign: 'center', padding: '30px 0' }}>
                    Bạn chưa thực hiện bất kỳ giao dịch đặt vé nào.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {bookingsHistory.map((item) => (
                      <div key={item.id} style={{ border: '1px solid #eee', borderRadius: '4px', padding: '12px', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ fontSize: '10px', background: 'var(--primary-teal)', color: '#fff', padding: '2px 6px', borderRadius: '3px', fontWeight: '800' }}>
                            {item.id}
                          </span>
                          <h4 style={{ fontWeight: '800', marginTop: '4px', fontSize: '14px' }}>{item.movieTitle}</h4>
                          <span className="muted" style={{ fontSize: '11px' }}>
                            🎬 Giờ chiếu: <b>{item.time} ({new Date(item.date).toLocaleDateString('vi-VN')})</b> • Ghế: <b>{item.seats.join(', ')}</b>
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <h4 style={{ color: '#d62246', fontWeight: '900' }}>{(item.total).toLocaleString('vi-VN')}đ</h4>
                          <span className="muted" style={{ fontSize: '10px' }}>Thanh toán thành công</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button className="btn" style={{ background: '#e74c3c', color: '#fff', width: 'auto', padding: '12px 40px' }} onClick={onLogout}>
          🚪 ĐĂNG XUẤT TÀI KHOẢN
        </button>
      </div>
    </section>
  );
}



const promoItems = [
  {
    id: 1,
    title: 'CHÍNH THỨC NÂNG CẤP DIỆN MẠO WEBSITE METIZ CINEMA VỚI TRẢI NGHIỆM ĐỈNH CAO',
    category: 'Tin tức',
    img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 2,
    title: 'HƯỚNG DẪN CHI TIẾT LỐI VÀO KHU VỰC GỬI XE TIỆN LỢI TẠI RẠP XE METIZ CINEMA',
    category: 'Cẩm nang',
    img: 'https://images.unsplash.com/photo-1506521788723-868151859846?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 3,
    title: 'DANH SÁCH NHỮNG BỘ PHIM HOT THÁNG 4 ĐÁNG XEM NHẤT TRÊN MÀN ẢNH RỘNG',
    category: 'Phim Hot',
    img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 4,
    title: 'NHỮNG CHI TIẾT ẤN TƯỢNG VÀ THÚ VỊ NHẤT CỦA SIÊU PHẨM ANIME CONAN MOVIE 27',
    category: 'Review',
    img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=60'
  }
];

const promoList = [
  {
    id: 1,
    title: 'QUÀ MỪNG LÊN HẠNG - ƯU ĐÃI THÀNH VIÊN METIZ 2026',
    date: '10/04/2026 - 31/12/2026',
    desc: 'Ưu đãi quà tặng bắp ngọt size lớn & vé xem phim 2D miễn phí dành riêng cho thành viên đạt hạng mức Gold & Diamond tại rạp.',
    img: 'https://images.unsplash.com/photo-1549463512-2051048a8733?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 2,
    title: 'SUPER MONDAY (THỨ HAI SIÊU HẠNG) - ĐỒNG GIÁ VÉ 45K',
    date: '01/01/2026 - 31/12/2026',
    desc: 'Mỗi thứ Hai hàng tuần, tận hưởng đồng giá vé xem phim 2D chỉ 45.000đ áp dụng cho tất cả khách hàng thành viên Metiz Cinema.',
    img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 3,
    title: 'KHUYẾN MÃI GIÁ VÉ U22 - HỌC SINH SINH VIÊN CHỈ 45K',
    date: '02/06/2026 - 31/12/2026',
    desc: 'Giá vé ưu đãi dành cho học sinh, sinh viên và thành viên dưới 22 tuổi chỉ 45.000đ/vé từ thứ Hai đến thứ Sáu hàng tuần.',
    img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&auto=format&fit=crop&q=60'
  }
];

const bannerSlides = [
  {
    id: 1,
    eyebrow: 'Suất chiếu đặc biệt từ 18H | 13-14.05.2026',
    title: 'TẠM BIỆT GOHAN',
    desc: 'Tác phẩm đặc biệt tri ân chặng đường huyền thoại của vũ trụ ngọc rồng Dragon Ball. Lần đầu tiên chiến binh Gohan tỏa sáng rực rỡ với sức mạnh vô hạn.',
    img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    eyebrow: 'Phim điện ảnh gia đình xuất sắc nhất năm',
    title: 'DORAEMON: BẢN GIAO HƯỞNG ĐỊA CẦU',
    desc: 'Mèo máy Doraemon và nhóm bạn Nobita dấn thân vào chuyến phiêu lưu âm nhạc kỳ vĩ để giải cứu nhân loại và mang giai điệu trở lại Trái Đất.',
    img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    eyebrow: 'Siêu phẩm viễn tưởng đình đám từ Lucasfilm',
    title: 'STAR WARS: MANDALORIAN & GROGU',
    desc: 'Bản hùng ca hoành tráng tiếp theo của thợ săn tiền thưởng Din Djarin và chú bé tí hon Grogu đáng yêu trong cuộc chiến bảo vệ thiên hà.',
    img: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1000&auto=format&fit=crop&q=80'
  }
];

function App() {
  const [movies, setMovies] = useState([]);
  const [showtimeData, setShowtimeData] = useState([]);
  const [filter, setFilter] = useState('now');
  const [activeDate, setActiveDate] = useState('');
  const [booking, setBooking] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loginOpen, setLoginOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Dynamic products & promo lists from DB
  const [productsList, setProductsList] = useState([]);
  const [promotionsList, setPromotionsList] = useState([]);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoCodeInput, setPromoCodeInput] = useState('');

  // Router state
  // Supported pages: '/home', '/lich-chieu-phim.html', '/phim.html', '/mua-sam.html', '/lien-he.html', '/tin-va-khuyen-mai.html', '/thong-tin-thanh-vien.html', '/ve-cua-toi.html', '/staff-dashboard.html', '/admin-dashboard.html'
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname;
    if (path === '/' || path === '/index.html') return '/home';
    return path;
  });

  const navigateTo = (path) => {
    window.history.pushState(null, '', path);
    setCurrentPage(path);
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/' || path === '/index.html') {
        setCurrentPage('/home');
      } else {
        setCurrentPage(path);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // E-shop states
  const [shopCategory, setShopCategory] = useState('combos');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Authentication states
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('metiz_session');
    return stored ? JSON.parse(stored) : null;
  });
  const [authTab, setAuthTab] = useState('login');
  const [otpSent, setOtpSent] = useState(false);
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // QR Login States
  const [qrSessionToken, setQrSessionToken] = useState('');
  const [qrStatusText, setQrStatusText] = useState('pending'); // 'pending', 'scanned', 'confirmed', 'expired', 'used', 'cancelled'
  const [qrError, setQrError] = useState('');
  const qrPollingRef = useRef(null);

  useEffect(() => {
    if (!qrSessionToken || (qrStatusText !== 'pending' && qrStatusText !== 'scanned')) {
      if (qrPollingRef.current) {
        clearInterval(qrPollingRef.current);
        qrPollingRef.current = null;
      }
      return;
    }

    qrPollingRef.current = setInterval(async () => {
      try {
        const res = await api.qrStatus(qrSessionToken);
        if (res.success) {
          setQrStatusText(res.status);
          if (res.status === 'confirmed') {
            // Logged in!
            clearInterval(qrPollingRef.current);
            qrPollingRef.current = null;
            
            // Save session
            const sessionData = {
              token: res.accessToken,
              user: res.user
            };
            localStorage.setItem('metiz_session', JSON.stringify(sessionData));
            setUser(sessionData);
            
            // Trigger UI close if login modal is open
            setLoginOpen(false);

            // Redirect according to role
            if (res.user.role === 'admin') {
              navigateTo('/admin-dashboard.html');
            } else if (res.user.role === 'staff') {
              navigateTo('/staff-dashboard.html');
            } else {
              navigateTo('/thong-tin-thanh-vien.html');
            }
          } else if (res.status === 'expired' || res.status === 'cancelled' || res.status === 'used') {
            clearInterval(qrPollingRef.current);
            qrPollingRef.current = null;
          }
        }
      } catch (err) {
        console.error('QR status polling error:', err);
      }
    }, 2000);

    return () => {
      if (qrPollingRef.current) {
        clearInterval(qrPollingRef.current);
        qrPollingRef.current = null;
      }
    };
  }, [qrSessionToken, qrStatusText]);

  const initQRLogin = async () => {
    try {
      setQrError('');
      setQrStatusText('pending');
      setQrSessionToken('');
      if (qrPollingRef.current) {
        clearInterval(qrPollingRef.current);
        qrPollingRef.current = null;
      }

      const res = await api.qrCreate();
      if (res.success) {
        setQrSessionToken(res.sessionToken);
      } else {
        setQrError('Không thể tạo phiên QR đăng nhập.');
      }
    } catch (err) {
      setQrError(err.message || 'Lỗi kết nối máy chủ');
    }
  };

  const cancelQRLogin = async () => {
    if (qrSessionToken) {
      try {
        await api.qrCancel({ sessionToken: qrSessionToken });
      } catch (e) {}
      setQrSessionToken('');
      setQrStatusText('cancelled');
    }
  };

  // Booking history state
  const [bookingsHistory, setBookingsHistory] = useState([]);

  // Dashboards States
  const [staffTab, setStaffTab] = useState('checkin');
  const [staffLookupCode, setStaffLookupCode] = useState('');
  const [staffActiveBooking, setStaffActiveBooking] = useState(null);
  const [staffActiveTickets, setStaffActiveTickets] = useState([]);
  const [staffCheckinCount, setStaffCheckinCount] = useState(0);
  const [staffSalesCount, setStaffSalesCount] = useState(0);

  const [adminTab, setAdminTab] = useState('overview');
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminRevenue, setAdminRevenue] = useState(null);
  const [adminAuditLogs, setAdminAuditLogs] = useState([]);

  // Auto rotate banner slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const loadBaseData = () => {
    Promise.all([
      api.getMovies(), 
      api.getShowtimes(), 
      api.getProducts(), 
      api.getPromotions()
    ])
      .then(([movieList, schedules, products, promos]) => {
        setMovies(movieList);
        setShowtimeData(schedules);
        setProductsList(products);
        setPromotionsList(promos);
        if (schedules.length > 0) {
          const uniqueDates = [...new Set(schedules.map((s) => s.date))].sort();
          setActiveDate(uniqueDates[0] || new Date().toISOString().slice(0, 10));
        } else {
          setActiveDate(new Date().toISOString().slice(0, 10));
        }
      })
      .catch((err) => console.log('Error loading base movies & showtimes:', err.message));
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  // Fetch bookings history if user is logged in
  const fetchBookingsHistory = async () => {
    if (!user) return;
    try {
      const data = await api.getBookings({ userId: user.id });
      setBookingsHistory(data);
    } catch (err) {
      console.log('Error loading bookings:', err);
    }
  };

  useEffect(() => {
    fetchBookingsHistory();
  }, [user]);

  const dates = useMemo(() => {
    return [...new Set(showtimeData.map((s) => s.date))].sort();
  }, [showtimeData]);

  const nowMovies = movies.filter((m) => m.status === 'now');
  const filteredMovies = movies.filter((m) => m.status === filter);
  const schedulesForDate = showtimeData.filter((s) => s.date === activeDate);

  const openBooking = async (movieId, date, time) => {
    const movie = movies.find((m) => m.id === Number(movieId));
    if (!movie) return;
    try {
      const seatData = await api.getSeats({ movieId, date, time });
      setBooking({ movie, movieId: Number(movieId), date, time });
      setBookedSeats(seatData.booked);
      setSelectedSeats([]);
      setAppliedPromo(null);
      setPromoCodeInput('');
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleSeat = (seat) => {
    if (bookedSeats.includes(seat)) return;
    setSelectedSeats((old) => old.includes(seat) ? old.filter((s) => s !== seat) : [...old, seat]);
  };

  // Promo Code checking
  const applyPromoCode = () => {
    const promo = promotionsList.find(p => p.code.toUpperCase() === promoCodeInput.trim().toUpperCase());
    if (!promo) {
      alert('Mã khuyến mãi không tồn tại hoặc đã hết hạn!');
      setAppliedPromo(null);
      return;
    }
    setAppliedPromo(promo);
    alert(`Áp dụng mã "${promo.code}" thành công: ${promo.title}`);
  };

  const getSeatPrice = (seat) => {
    const row = seat.charAt(0);
    if (row === 'K') return 110000;
    if ('EFGHIJ'.includes(row)) return 75000;
    return 55000;
  };

  const finalTicketTotal = useMemo(() => {
    const baseTotal = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);
    if (!appliedPromo) return baseTotal;
    if (appliedPromo.type === 'percent') {
      return baseTotal * (1 - appliedPromo.value / 100);
    } else {
      return Math.max(0, baseTotal - appliedPromo.value);
    }
  }, [selectedSeats, appliedPromo]);

  const confirmBooking = async () => {
    if (!selectedSeats.length) return alert('Vui lòng chọn ghế!');
    try {
      const result = await api.createBooking({
        customerName: user ? user.fullName : 'Khách vãng lai',
        phone: user ? user.phone : '0123456789',
        movieId: booking.movieId,
        date: booking.date,
        time: booking.time,
        seats: selectedSeats,
        userId: user ? user.id : null
      });
      alert(`🎉 Đặt vé thành công! Dữ liệu đã lưu trữ vào MySQL.\nMã vé: ${result.booking.id}\nGhế: ${result.booking.seats.join(', ')}\nTổng thanh toán: ${money(finalTicketTotal)}`);
      setBooking(null);
      fetchBookingsHistory();
      loadBaseData(); // Refresh seat status
    } catch (err) {
      alert(err.message);
    }
  };

  const quickBooking = () => {
    const movieId = document.querySelector('#quickMovie').value;
    const date = document.querySelector('#quickDate').value;
    const time = document.querySelector('#quickTime').value;
    openBooking(movieId, date, time);
  };

  const submitContact = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      const result = await api.contact(Object.fromEntries(form.entries()));
      alert(result.message);
      e.currentTarget.reset();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const result = await api.login({ email, password });
      alert(`Đăng nhập thành công! Chào mừng ${result.user.fullName}`);
      
      const loggedUser = {
        id: result.user.id,
        fullName: result.user.fullName,
        email: result.user.email,
        phone: result.user.phone,
        role: result.user.role,
        points: result.user.points,
        tier: result.user.tier,
        token: result.token
      };
      
      setUser(loggedUser);
      localStorage.setItem('metiz_session', JSON.stringify(loggedUser));
      setLoginOpen(false);

      if (loggedUser.role === 'staff') {
        navigateTo('/staff-dashboard.html');
      } else if (loggedUser.role === 'admin') {
        navigateTo('/admin-dashboard.html');
      } else {
        navigateTo('/home');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleQuickLogin = async (email, password) => {
    try {
      const result = await api.login({ email, password });
      alert(`⚡ ĐĂNG NHẬP NHANH THÀNH CÔNG!\nChào mừng ${result.user.role.toUpperCase()}: ${result.user.fullName}`);
      
      const loggedUser = {
        id: result.user.id,
        fullName: result.user.fullName,
        email: result.user.email,
        phone: result.user.phone,
        role: result.user.role,
        points: result.user.points,
        tier: result.user.tier,
        token: result.token
      };
      
      setUser(loggedUser);
      localStorage.setItem('metiz_session', JSON.stringify(loggedUser));
      setLoginOpen(false);

      if (loggedUser.role === 'staff') {
        navigateTo('/staff-dashboard.html');
      } else if (loggedUser.role === 'admin') {
        navigateTo('/admin-dashboard.html');
      } else {
        navigateTo('/home');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const fullName = e.target.name.value;
    const email = e.target.email.value;
    const phone = e.target.phone.value;
    const password = e.target.password.value;

    try {
      const result = await api.register({ fullName, email, phone, password });
      alert(result.message);
      setOtpPhone(phone);
      setOtpSent(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const verifyOtp = (e) => {
    e.preventDefault();
    if (otpCode === '123456' || otpCode.length === 6) {
      alert('Đăng ký tài khoản & Xác minh OTP thành công! Mời đăng nhập.');
      setOtpSent(false);
      setAuthTab('login');
    } else {
      alert('Mã OTP không đúng! Vui lòng nhập lại (Mã nháp: 123456).');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!resetEmail) return alert('Vui lòng nhập email');
    setResetSent(true);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('metiz_session');
    navigateTo('/home');
  };

  // Concessions cart logics
  const addToCart = (item) => {
    setCart((prev) => {
      const exist = prev.find((i) => i.id === item.id);
      if (exist) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, qty: 1 }];
    });
    alert(`Đã thêm "${item.name}" vào giỏ hàng!`);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  const checkoutCart = async () => {
    try {
      await api.createOrder({
        customerName: user ? user.fullName : 'Khách vãng lai',
        phone: user ? user.phone || '0123456789' : '0123456789',
        total: cartTotal,
        items: cart
      });
      alert(`🛒 Mua sắm bắp nước thành công giỏ hàng trị giá ${money(cartTotal)}!\nĐơn hàng đã được lưu trữ trong MySQL.`);
      setCart([]);
      setCartOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  // STAFF PORTAL METRICS & LOGIC
  const lookupStaffTickets = async () => {
    if (!staffLookupCode) return alert('Vui lòng nhập mã vé hoặc SĐT khách hàng');
    try {
      const data = await api.lookupTickets(staffLookupCode);
      setStaffActiveBooking(data.booking);
      setStaffActiveTickets(data.tickets);
    } catch (err) {
      alert(err.message);
      setStaffActiveBooking(null);
      setStaffActiveTickets([]);
    }
  };

  const checkinStaffTicket = async (ticketId) => {
    try {
      const result = await api.checkinTicket({ ticketId, staffName: user ? user.fullName : 'Soát vé viên' });
      alert(result.message);
      setStaffCheckinCount(prev => prev + 1);
      // Reload tickets
      if (staffLookupCode) {
        const data = await api.lookupTickets(staffLookupCode);
        setStaffActiveTickets(data.tickets);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Staff sells at counter
  const [staffMovieId, setStaffMovieId] = useState('');
  const [staffDate, setStaffDate] = useState('');
  const [staffTime, setStaffTime] = useState('');
  const [staffSeats, setStaffSeats] = useState([]);
  const [staffCustomerName, setStaffCustomerName] = useState('Khách quầy');
  const [staffPhone, setStaffPhone] = useState('0999999999');

  const openCounterSalesGrid = async () => {
    if (!staffMovieId || !staffDate || !staffTime) return alert('Hãy chọn đầy đủ Phim, Ngày, Giờ');
    try {
      const seatData = await api.getSeats({ movieId: staffMovieId, date: staffDate, time: staffTime });
      setBookedSeats(seatData.booked);
      setStaffSeats([]);
    } catch (err) {
      alert(err.message);
    }
  };

  const executeCounterSales = async () => {
    if (staffSeats.length === 0) return alert('Hãy chọn ít nhất 1 ghế cho khách!');
    try {
      await api.createBooking({
        customerName: staffCustomerName,
        phone: staffPhone,
        movieId: staffMovieId,
        date: staffDate,
        time: staffTime,
        seats: staffSeats
      });
      alert('🎉 Xuất vé tại quầy thành công! Khách thanh toán tiền mặt thành công.');
      setStaffSalesCount(prev => prev + staffSeats.length);
      setStaffSeats([]);
      // Reload seat grid
      const seatData = await api.getSeats({ movieId: staffMovieId, date: staffDate, time: staffTime });
      setBookedSeats(seatData.booked);
    } catch (err) {
      alert(err.message);
    }
  };

  // ADMIN PORTAL LOGICS
  const loadAdminOverview = async () => {
    try {
      const data = await api.adminGetRevenue();
      setAdminRevenue(data);
    } catch (err) {
      console.log('Error loading admin revenue:', err);
    }
  };

  const loadAdminUsers = async () => {
    try {
      const data = await api.adminGetUsers();
      setAdminUsers(data);
    } catch (err) {
      console.log('Error loading admin users:', err);
    }
  };

  const loadAdminAuditLogs = async () => {
    try {
      const data = await api.adminGetAuditLogs();
      setAdminAuditLogs(data);
    } catch (err) {
      console.log('Error loading admin audit logs:', err);
    }
  };

  useEffect(() => {
    if (currentPage === '/admin-dashboard.html' && user?.role === 'admin') {
      if (adminTab === 'overview') loadAdminOverview();
      if (adminTab === 'accounts') loadAdminUsers();
      if (adminTab === 'audit-logs') loadAdminAuditLogs();
    }
  }, [currentPage, adminTab, user]);

  const changeUserRoleAdmin = async (userId, role) => {
    try {
      const result = await api.adminUpdateUserRole(userId, role);
      alert(result.message);
      loadAdminUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  // Admin Create Movie
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

  // Admin Create Showtime
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

  // Dynamic filter products by category from state productsList
  const filteredProducts = useMemo(() => {
    return productsList.filter(item => item.category === shopCategory);
  }, [productsList, shopCategory]);

  return (
    <>
      {currentPage !== '/staff-dashboard.html' && currentPage !== '/admin-dashboard.html' && (
        <>
          {/* 1. SUPER TOP BAR */}
          <div className="super-topbar">
            <div className="container">
              <div style={{ display: 'flex', gap: '20px' }}>
                <a href="/ve-cua-toi.html" onClick={(e) => { e.preventDefault(); navigateTo('/ve-cua-toi.html'); }}>
                  🎟 VÉ CỦA TÔI
                </a>
                {user && user.role === 'staff' && (
                  <a href="/staff-dashboard.html" onClick={(e) => { e.preventDefault(); navigateTo('/staff-dashboard.html'); }} style={{ color: 'var(--primary-teal)', fontWeight: 'bold' }}>
                    💻 TRANG NHÂN VIÊN
                  </a>
                )}
                {user && user.role === 'admin' && (
                  <a href="/admin-dashboard.html" onClick={(e) => { e.preventDefault(); navigateTo('/admin-dashboard.html'); }} style={{ color: '#d62246', fontWeight: 'bold' }}>
                    ⚙️ TRANG QUẢN TRỊ
                  </a>
                )}
              </div>
              
              {user ? (
                <span style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  👤 XIN CHÀO: <b>{user.fullName}</b> ({user.tier} - {user.points}đ)
                  <a href="#" onClick={handleLogout} style={{ color: 'var(--primary-teal)', marginLeft: '10px' }}>
                    [ĐĂNG XUẤT]
                  </a>
                </span>
              ) : (
                <a href="/thong-tin-thanh-vien.html" onClick={(e) => { e.preventDefault(); setAuthTab('login'); navigateTo('/thong-tin-thanh-vien.html'); }}>
                  👤 ĐĂNG KÝ/ ĐĂNG NHẬP
                </a>
              )}

              <div className="lang-switch">
                <span className="active">VN</span> | <span>EN</span>
              </div>
            </div>
          </div>

          {/* 2. MAIN HEADER / NAVIGATION */}
          <header className="topbar">
            <div className="container nav">
              <MetizLogo onClick={() => navigateTo('/home')} />
              
              <nav className={navOpen ? 'open' : ''}>
                <a href="/lich-chieu-phim.html" className={currentPage === '/lich-chieu-phim.html' ? 'active' : ''} onClick={(e) => { e.preventDefault(); navigateTo('/lich-chieu-phim.html'); setNavOpen(false); }}>
                  Lịch Chiếu
                </a>
                <a href="/phim.html" className={currentPage === '/phim.html' ? 'active' : ''} onClick={(e) => { e.preventDefault(); navigateTo('/phim.html'); setNavOpen(false); }}>
                  Phim
                </a>
                <a href="/mua-sam.html" className={currentPage === '/mua-sam.html' ? 'active' : ''} onClick={(e) => { e.preventDefault(); navigateTo('/mua-sam.html'); setNavOpen(false); }}>
                  Mua Sắm
                </a>
                <a href="/lien-he.html" className={currentPage === '/lien-he.html' ? 'active' : ''} onClick={(e) => { e.preventDefault(); navigateTo('/lien-he.html'); setNavOpen(false); }}>
                  Dịch Vụ & Tiện Ích
                </a>
                <a href="/tin-va-khuyen-mai.html" className={currentPage === '/tin-va-khuyen-mai.html' ? 'active' : ''} onClick={(e) => { e.preventDefault(); navigateTo('/tin-va-khuyen-mai.html'); setNavOpen(false); }}>
                  Tin Tức & Ưu Đãi
                </a>
                <a href="/thong-tin-thanh-vien.html" className={currentPage === '/thong-tin-thanh-vien.html' ? 'active' : ''} onClick={(e) => { e.preventDefault(); navigateTo('/thong-tin-thanh-vien.html'); setNavOpen(false); }}>
                  Thành Viên
                </a>
              </nav>

              <div className="header-actions">
                <a href="/lich-chieu-phim.html" className="btn-buy-tickets" onClick={(e) => { e.preventDefault(); navigateTo('/lich-chieu-phim.html'); }}>
                  <span>🎟</span> MUA VÉ
                </a>
                <div className="cart-icon" onClick={() => setCartOpen(true)}>
                  🛒
                  <span className="cart-badge">{totalItems}</span>
                </div>
                <button className="hamburger" onClick={() => setNavOpen(!navOpen)}>☰</button>
              </div>
            </div>
          </header>
        </>
      )}

      {/* ==========================================
          STAFF DASHBOARD ROUTE (DELEGATED TO JSX)
         ========================================== */}
      {currentPage === '/staff-dashboard.html' && (
        user && user.role === 'staff' ? (
          <StaffDashboard 
            user={user} 
            handleLogout={handleLogout} 
            nowMovies={nowMovies} 
            dates={dates} 
            showtimes={showtimes} 
            allSeats={allSeats} 
          />
        ) : (
          <ForbiddenGate requiredRole="staff" onLogin={handleQuickLogin} />
        )
      )}

      {/* ==========================================
          ADMIN DASHBOARD ROUTE (DELEGATED TO JSX)
         ========================================== */}
      {currentPage === '/admin-dashboard.html' && (
        user && user.role === 'admin' ? (
          <AdminDashboard 
            user={user} 
            handleLogout={handleLogout} 
            movies={movies} 
            nowMovies={nowMovies} 
            showtimes={showtimes} 
            showtimeData={showtimeData} 
            loadBaseData={loadBaseData} 
          />
        ) : (
          <ForbiddenGate requiredRole="admin" onLogin={handleQuickLogin} />
        )
      )}

      {/* ==========================================
          STANDARD HOME & PUBLIC PAGES VIEWS
         ========================================== */}
      {currentPage !== '/staff-dashboard.html' && currentPage !== '/admin-dashboard.html' && (
        <>
          {booking ? (
            <BookingFlow 
              booking={booking} 
              onClose={() => setBooking(null)}
              user={user}
              bookedSeats={bookedSeats}
              selectedSeats={selectedSeats}
              toggleSeat={toggleSeat}
              confirmBooking={confirmBooking}
              applyPromoCode={applyPromoCode}
              promoCodeInput={promoCodeInput}
              setPromoCodeInput={setPromoCodeInput}
              appliedPromo={appliedPromo}
              finalTicketTotal={finalTicketTotal}
            />
          ) : (
            <>
              {currentPage === '/home' && (
                <Home 
                  bannerSlides={bannerSlides}
                  currentSlide={currentSlide}
                  setCurrentSlide={setCurrentSlide}
                  nowMovies={nowMovies}
                  dates={dates}
                  showtimes={showtimes}
                  dateLabel={dateLabel}
                  quickBooking={quickBooking}
                  filter={filter}
                  setFilter={setFilter}
                  filteredMovies={filteredMovies}
                  openBooking={openBooking}
                  activeDate={activeDate}
                  navigateTo={navigateTo}
                  promoItems={promoItems}
                />
              )}

              {currentPage === '/lich-chieu-phim.html' && (
                <LichChieuPhim 
                  dates={dates}
                  activeDate={activeDate}
                  setActiveDate={setActiveDate}
                  dateLabel={dateLabel}
                  nowMovies={nowMovies}
                  schedulesForDate={schedulesForDate}
                  openBooking={openBooking}
                />
              )}

              {currentPage === '/phim.html' && (
                <Phim 
                  filter={filter}
                  setFilter={setFilter}
                  filteredMovies={filteredMovies}
                  openBooking={openBooking}
                  activeDate={activeDate}
                />
              )}

              {currentPage === '/mua-sam.html' && (
                <MuaSam 
                  shopCategory={shopCategory}
                  setShopCategory={setShopCategory}
                  filteredProducts={filteredProducts}
                  addToCart={addToCart}
                />
              )}

              {currentPage === '/lien-he.html' && (
                <LienHe 
                  submitContact={submitContact}
                />
              )}

              {currentPage === '/tin-va-khuyen-mai.html' && (
                <TinVaKhuyenMai 
                  promoList={promoList}
                />
              )}

              {currentPage === '/thong-tin-thanh-vien.html' && (
                user ? (
                  <MemberDashboard user={user} bookingsHistory={bookingsHistory} onLogout={handleLogout} />
                ) : (
                  <section className="section container">
                    <div className="section-header-block">
                      <MascotLeft />
                      <div className="section-title-tabs">
                        <button className={`tab-btn ${authTab === 'login' ? 'active' : ''}`} onClick={() => { setAuthTab('login'); setOtpSent(false); cancelQRLogin(); }}>
                          Đăng Nhập Thành Viên
                        </button>
                        <button className={`tab-btn ${authTab === 'register' ? 'active' : ''}`} onClick={() => { setAuthTab('register'); setOtpSent(false); cancelQRLogin(); }}>
                          Đăng Ký Thành Viên Mới
                        </button>
                        <button className={`tab-btn ${authTab === 'qr' ? 'active' : ''}`} onClick={() => { setAuthTab('qr'); setOtpSent(false); initQRLogin(); }}>
                          🎟️ Đăng Nhập QR Code
                        </button>
                      </div>
                      <MascotRight />
                    </div>

                    <div style={{ maxWidth: '480px', margin: '0 auto', background: '#fff', border: '1px solid #ddd', padding: '30px', borderRadius: '4px', boxShadow: 'var(--card-shadow)' }}>
                      
                      {authTab === 'qr' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '10px 0' }}>
                          <h3 style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '15px', textAlign: 'center', margin: 0 }}>
                            ĐĂNG NHẬP BẰNG MÃ QR
                          </h3>
                          <p className="muted" style={{ fontSize: '12px', textAlign: 'center', margin: '0 0 10px 0', lineHeight: '1.5' }}>
                            Mở ứng dụng di động Metiz Cinema của bạn, đi tới mục <b>Tài khoản</b> &gt; chọn <b>Quét QR Đăng Nhập PC</b> để bắt đầu.
                          </p>

                          {qrError && (
                            <div style={{ color: '#d62246', fontSize: '12px', fontWeight: 'bold', background: '#ffeef0', padding: '10px', borderRadius: '4px', width: '100%', textAlign: 'center' }}>
                              ⚠️ {qrError}
                            </div>
                          )}

                          {qrSessionToken ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
                              <div style={{ border: '2px solid #00adb5', padding: '12px', borderRadius: '8px', background: '#fff', boxShadow: '0 4px 15px rgba(0, 173, 181, 0.15)' }}>
                                {qrStatusText === 'pending' || qrStatusText === 'scanned' ? (
                                  <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrSessionToken)}`}
                                    alt="QR Code" 
                                    style={{ width: '180px', height: '180px', display: 'block' }}
                                  />
                                ) : (
                                  <div style={{ width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
                                    <span style={{ fontSize: '48px' }}>
                                      {qrStatusText === 'confirmed' || qrStatusText === 'used' ? '✅' : '❌'}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div style={{ background: '#f8f9fa', padding: '8px 12px', borderRadius: '4px', fontSize: '11px', color: '#666', border: '1px dashed #ddd', width: '100%', textAlign: 'center' }}>
                                Mã phiên quét: <code style={{ fontWeight: 'bold', color: '#333' }}>{qrSessionToken}</code>
                              </div>

                              {qrStatusText === 'pending' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-teal)', fontWeight: 'bold', fontSize: '13px' }}>
                                  <span className="spinner-small" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid var(--primary-teal)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                                  Đang chờ quét camera...
                                </div>
                              )}

                              {qrStatusText === 'scanned' && (
                                <div style={{ color: '#f39c12', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  📱 Đã quét! Vui lòng ấn Đồng ý đăng nhập trên điện thoại...
                                </div>
                              )}

                              {qrStatusText === 'expired' && (
                                <div style={{ color: '#d62246', fontWeight: 'bold', fontSize: '13px' }}>
                                  ⏰ Mã QR đã hết hạn! Vui lòng tạo mã mới.
                                </div>
                              )}

                              {qrStatusText === 'cancelled' && (
                                <div style={{ color: '#d62246', fontWeight: 'bold', fontSize: '13px' }}>
                                  🚫 Yêu cầu đăng nhập đã bị từ chối.
                                </div>
                              )}

                              {(qrStatusText === 'expired' || qrStatusText === 'cancelled') && (
                                <button 
                                  type="button" 
                                  className="btn" 
                                  style={{ background: 'var(--primary-teal)', color: '#fff', padding: '8px 16px', fontSize: '12px', width: 'auto' }}
                                  onClick={initQRLogin}
                                >
                                  Tạo mã QR mới
                                </button>
                              )}
                            </div>
                          ) : (
                            !qrError && <div style={{ fontSize: '12px', color: '#666' }}>Đang tạo phiên QR đăng nhập...</div>
                          )}

                          <div style={{ marginTop: '10px', width: '100%', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <button 
                              type="button"
                              className="btn" 
                              style={{ width: '100%', padding: '10px', fontSize: '12px', background: '#333' }}
                              onClick={() => { setAuthTab('login'); cancelQRLogin(); }}
                            >
                              Quay lại đăng nhập thường
                            </button>
                          </div>
                        </div>
                      )}

                      {authTab === 'login' && !resetSent && (
                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <h3 style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '16px', textAlign: 'center' }}>
                            ĐĂNG NHẬP ĐỂ TÍCH ĐIỂM 5% GIAO DỊCH
                          </h3>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 800, color: '#888', display: 'block', marginBottom: '6px' }}>ĐỊA CHỈ EMAIL</label>
                            <input name="email" type="email" placeholder="Nhập email tài khoản" defaultValue="demo@cinemax.vn" required style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 800, color: '#888', display: 'block', marginBottom: '6px' }}>MẬT KHẨU BẢO MẬT</label>
                            <input name="password" type="password" placeholder="Nhập mật khẩu" defaultValue="123456" required style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }} />
                          </div>
                          <button className="btn" style={{ background: '#111', color: '#fff', padding: '12px', fontWeight: '800', width: '100%', marginTop: '10px' }}>
                            ĐĂNG NHẬP
                          </button>
                          <div style={{ textAlign: 'center', marginTop: '10px' }}>
                            <a href="#" style={{ fontSize: '12px', color: 'var(--primary-teal)' }} onClick={() => setResetSent(true)}>
                              Quên mật khẩu?
                            </a>
                          </div>
                          
                          <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#666', textAlign: 'center', marginBottom: '12px', letterSpacing: '0.05em' }}>
                              ⚡ ĐĂNG NHẬP NHANH 1-CLICK (RBAC)
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <button 
                                type="button"
                                className="btn" 
                                style={{ background: 'linear-gradient(135deg, #00adb5, #00d2c4)', color: '#fff', fontWeight: 'bold', padding: '10px', fontSize: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                onClick={() => handleQuickLogin('demo@cinemax.vn', '123456')}
                              >
                                🎟️ HỘI VIÊN (MEMBER)
                              </button>
                              <button 
                                type="button"
                                className="btn" 
                                style={{ background: 'linear-gradient(135deg, #8e44ad, #a29bfe)', color: '#fff', fontWeight: 'bold', padding: '10px', fontSize: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                onClick={() => handleQuickLogin('staff@metiz.vn', 'staff123')}
                              >
                                💻 NHÂN VIÊN SOÁT VÉ (STAFF)
                              </button>
                              <button 
                                type="button"
                                className="btn" 
                                style={{ background: 'linear-gradient(135deg, #d62246, #ff7675)', color: '#fff', fontWeight: 'bold', padding: '10px', fontSize: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                onClick={() => handleQuickLogin('admin@metiz.vn', 'admin123')}
                              >
                                ⚙️ QUẢN TRỊ VIÊN (ADMIN)
                              </button>
                            </div>
                          </div>
                        </form>
                      )}

                      {authTab === 'register' && !otpSent && (
                        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <h3 style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '16px', textAlign: 'center' }}>
                            ĐĂNG KÝ HỘI VIÊN METIZ NHẬN QUÀ BẤP FREE
                          </h3>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 800, color: '#888', display: 'block', marginBottom: '6px' }}>HỌ VÀ TÊN</label>
                            <input name="name" placeholder="Họ và tên của bạn" required style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 800, color: '#888', display: 'block', marginBottom: '6px' }}>SỐ ĐIỆN THOẠI DI ĐỘNG</label>
                            <input name="phone" placeholder="Nhập số điện thoại" required style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 800, color: '#888', display: 'block', marginBottom: '6px' }}>ĐỊA CHỈ EMAIL</label>
                            <input name="email" type="email" placeholder="Nhập email" required style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 800, color: '#888', display: 'block', marginBottom: '6px' }}>MẬT KHẨU</label>
                            <input name="password" type="password" placeholder="Tối thiểu 6 ký tự" required style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }} />
                          </div>
                          <button className="btn" style={{ background: 'linear-gradient(135deg, #00adb5, #00d2c4)', color: '#fff', padding: '12px', fontWeight: '800', width: '100%', marginTop: '10px' }}>
                            ĐĂNG KÝ NGAY
                          </button>
                        </form>
                      )}

                      {authTab === 'register' && otpSent && (
                        <form onSubmit={verifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <h3 style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '16px', textAlign: 'center' }}>
                            XÁC NHẬN MÃ OTP BẢO MẬT
                          </h3>
                          <p className="muted" style={{ fontSize: '12px', textAlign: 'center' }}>
                            Mã OTP đã được gửi đến số điện thoại: <b>{otpPhone}</b>. Vui lòng kiểm tra tin nhắn.
                          </p>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 800, color: '#888', display: 'block', marginBottom: '6px' }}>NHẬP MÃ OTP (6 CHỮ SỐ)</label>
                            <input 
                              placeholder="Mã nháp: 123456" 
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value)} 
                              required 
                              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center', letterSpacing: '0.5em', fontSize: '18px', fontWeight: '800' }} 
                            />
                          </div>
                          <button className="btn" style={{ background: '#222', color: '#fff', padding: '12px', fontWeight: '800', width: '100%' }}>
                            XÁC NHẬN HOÀN TẤT
                          </button>
                          <div style={{ textAlign: 'center' }}>
                            <a href="#" style={{ fontSize: '12px', color: '#888' }} onClick={() => setOtpSent(false)}>
                              [Quay lại bước trước]
                            </a>
                          </div>
                        </form>
                      )}

                      {resetSent && (
                        <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <h3 style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '16px', textAlign: 'center' }}>
                            KHÔI PHỤC MẬT KHẨU HỘI VIÊN
                          </h3>
                          <p className="muted" style={{ fontSize: '12px', textAlign: 'center' }}>
                            Hãy điền địa chỉ email đã đăng ký tài khoản. Metiz sẽ gửi mật khẩu khôi phục về hòm thư của bạn.
                          </p>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 800, color: '#888', display: 'block', marginBottom: '6px' }}>ĐỊA CHỈ EMAIL</label>
                            <input 
                              type="email" 
                              placeholder="Nhập email khôi phục"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              required 
                              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }} 
                            />
                          </div>
                          <button className="btn" style={{ background: '#111', color: '#fff', padding: '12px', fontWeight: '800', width: '100%' }}>
                            GỬI YÊU CẦU KHÔI PHỤC
                          </button>
                          <div style={{ textAlign: 'center' }}>
                            <a href="#" style={{ fontSize: '12px', color: '#888' }} onClick={() => setResetSent(false)}>
                              [Quay lại đăng nhập]
                            </a>
                          </div>
                        </form>
                      )}

                    </div>
                  </section>
                )
              )}

              {currentPage === '/ve-cua-toi.html' && (
                <VeCuaToi 
                  user={user}
                  bookingsHistory={bookingsHistory}
                  handleQuickLogin={handleQuickLogin}
                />
              )}

              {currentPage === '/home' && (
                <>
                  {/* LIÊN HỆ DƯỚI TRANG CHỦ */}
                  <section id="contact" className="section contact-section container">
                    <div className="contact-grid">
                      <div className="contact-info">
                        <h2>METIZ CINEMA ĐÀ NẴNG</h2>
                        <p className="muted" style={{ fontSize: '15px', lineHeight: '1.8' }}>
                          📍 Tầng 1, Helio Center, Đường 2/9, Hải Châu, Đà Nẵng.<br/>
                          📞 Hotline: 0236 3630 689 • Giờ mở cửa: 08:00 - 23:30 mỗi ngày.<br/>
                          ✉️ Email hỗ trợ khách hàng: contact@metiz.vn
                        </p>
                        <p className="muted" style={{ fontStyle: 'italic' }}>
                          Cụm rạp chiếu phim hiện đại hàng đầu miền Trung, sở hữu hệ thống âm thanh Dolby Atmos cao cấp và hàng loạt tiện ích ẩm thực đẳng cấp tại Helio Center.
                        </p>
                      </div>
                      
                      <form className="contact-form" onSubmit={submitContact}>
                        <h3 style={{ fontWeight: 800 }}>GỬI YÊU CẦU HỖ TRỢ</h3>
                        <input name="name" placeholder="Họ và tên của bạn" required />
                        <input name="phone" placeholder="Số điện thoại liên hệ" required />
                        <textarea name="message" placeholder="Nội dung bạn cần giải đáp..."></textarea>
                        <button className="btn">GỬI GÓP Ý</button>
                      </form>
                    </div>
                  </section>
                </>
              )}
            </>
          )}

          {/* 5. PRESET PREMIUM GRID FOOTER */}
          <footer>
            <div className="container footer-grid">
              <div className="footer-col">
                <h4>Về Metiz</h4>
                <ul>
                  <li><a href="/lien-he.html" onClick={(e) => { e.preventDefault(); navigateTo('/lien-he.html'); }}>Giới thiệu rạp</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Liên hệ nộp CV qua mail contact@metiz.vn'); }}>Cơ hội tuyển dụng</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); alert('FAQs: Bạn có thể đặt tối đa 10 ghế trong 1 giao dịch.'); }}>Câu hỏi FAQs</a></li>
                  <li><a href="/lien-he.html" onClick={(e) => { e.preventDefault(); navigateTo('/lien-he.html'); }}>Liên hệ quảng cáo</a></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Điều khoản</h4>
                <ul>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Điều khoản chung: Khán giả mua vé đúng độ tuổi quy định.'); }}>Điều khoản sử dụng</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Vé sau khi đặt thành công sẽ được ghi nhận vào MySQL.'); }}>Chính sách thanh toán</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Tích lũy 5% cho thành viên thường, 10% cho thành viên VIP.'); }}>Chính sách thành viên</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Bảo mật dữ liệu cá nhân của hội viên tuyệt đối.'); }}>Chính sách bảo mật</a></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Chăm Sóc Khách Hàng</h4>
                <p>
                  Hotline hỗ trợ: 0236 3630 689<br/>
                  Thời gian trực cuộc gọi từ 08:00 đến 22:00 hàng ngày.<br/>
                  Email tiếp nhận góp ý: contact@metiz.vn
                </p>
              </div>
              <div className="footer-col">
                <h4>Kết nối với Metiz</h4>
                <div className="social-links">
                  <a href="https://facebook.com" target="_blank" className="social-btn">F</a>
                  <a href="https://instagram.com" target="_blank" className="social-btn">I</a>
                  <a href="https://tiktok.com" target="_blank" className="social-btn">T</a>
                  <a href="https://youtube.com" target="_blank" className="social-btn">Y</a>
                </div>
                <div className="app-downloads">
                  <div className="app-btn" onClick={() => alert('Download Metiz app on iOS App Store.')}>
                    <span>📱</span>
                    <div className="app-btn-text">
                      <span>Tải trên</span>
                      <span>App Store</span>
                    </div>
                  </div>
                  <div className="app-btn" onClick={() => alert('Download Metiz app on Android Google Play.')}>
                    <span>🤖</span>
                    <div className="app-btn-text">
                      <span>Tải trên</span>
                      <span>Google Play</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="container footer-bottom">
              <div className="footer-bottom-logo">
                <span style={{ color: '#fff', fontWeight: 900, fontSize: '18px', letterSpacing: '0.05em' }}>
                  METIZ CINEMA
                </span>
                <span className="registered-badge">✓ ĐÃ ĐĂNG KÝ BỘ CÔNG THƯƠNG</span>
              </div>
              <p style={{ fontSize: '12px' }}>
                © 2026 Công Ty TNHH Metiz Cinema. Giấy CNĐKDN: 0401866112 - Sở KH&ĐT TP Đà Nẵng cấp lần đầu ngày 13/11/2017.<br/>
                Địa chỉ: Helio Center, Đường 2/9, Phường Hòa Cường Bắc, Quận Hải Châu, Thành phố Đà Nẵng, Việt Nam.
              </p>
            </div>
          </footer>
        </>
      )}

      {/* 6. OLD BOOKING MODAL REMOVED - INTEGRATED TO MAIN PAGE ROUTER */}

      {/* 7. SHOPPING CART OVERLAY MODAL */}
      {cartOpen && (
        <div className="modal show">
          <div className="modal-card" style={{ width: '540px' }}>
            <button className="close" onClick={() => setCartOpen(false)}>×</button>
            <div className="modal-header">
              <h2>🛒 GIỎ HÀNG MUA SẮM</h2>
            </div>
            <div className="modal-body">
              {cart.length === 0 ? (
                <p className="muted" style={{ textAlign: 'center', padding: '30px 0' }}>
                  Giỏ hàng của bạn đang trống.<br/>
                  Hãy truy cập trang "Mua Sắm" để chọn bắp ngọt, nước ép hoặc quà lưu niệm!
                </p>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                    {cart.map((item) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                        <div>
                          <h4 style={{ fontWeight: '800', fontSize: '13px' }}>{item.name}</h4>
                          <span className="muted" style={{ fontSize: '11px' }}>
                            {money(item.price)} x {item.qty}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontWeight: '800', color: 'var(--primary-teal)' }}>
                            {money(item.price * item.qty)}
                          </span>
                          <button 
                            style={{ color: '#d62246', background: 'transparent', fontSize: '18px', fontWeight: 'bold' }}
                            onClick={() => removeFromCart(item.id)}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="booking-summary" style={{ marginBottom: '20px' }}>
                    <span>Tổng tiền giỏ hàng:</span>
                    <b style={{ fontSize: '18px', color: '#d62246' }}>{money(cartTotal)}</b>
                  </div>
                  
                  <button className="btn" style={{ background: '#111', color: '#fff', width: '100%', padding: '12px' }} onClick={checkoutCart}>
                    TIẾN HÀNH THANH TOÁN
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. QUICK DIALOG MEMBERSHIP OR ALERTS */}
      {loginOpen && (
        <div className="modal show">
          <div className="modal-card">
            <button className="close" onClick={() => setLoginOpen(false)}>×</button>
            <div className="modal-header">
              <h2>ĐĂNG NHẬP NHANH THÀNH VIÊN</h2>
            </div>
            <div className="modal-body">
              <input placeholder="Nhập email đăng nhập" defaultValue="demo@cinemax.vn" id="modalEmail" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '12px' }} />
              <input type="password" placeholder="Nhập mật khẩu" defaultValue="123456" id="modalPassword" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '12px' }} />
              <button 
                className="btn" 
                style={{ width: '100%', padding: '12px', background: '#111', color: '#fff', fontWeight: 'bold' }}
                onClick={async () => {
                  const email = document.getElementById('modalEmail').value;
                  const password = document.getElementById('modalPassword').value;
                  try {
                    const result = await api.login({ email, password });
                    alert(`Đăng nhập thành công! Chào mừng ${result.user.fullName}`);
                    
                    const loggedUser = {
                      id: result.user.id,
                      fullName: result.user.fullName,
                      email: result.user.email,
                      phone: result.user.phone,
                      role: result.user.role,
                      points: result.user.points,
                      tier: result.user.tier,
                      token: result.token
                    };
                    
                    setUser(loggedUser);
                    localStorage.setItem('metiz_session', JSON.stringify(loggedUser));
                    setLoginOpen(false);
                    
                    if (loggedUser.role === 'staff') navigateTo('/staff-dashboard.html');
                    else if (loggedUser.role === 'admin') navigateTo('/admin-dashboard.html');
                    else navigateTo('/home');
                  } catch (err) {
                    alert(err.message);
                  }
                }}
              >
                ĐĂNG NHẬP NGAY
              </button>

              <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#666', textAlign: 'center', marginBottom: '12px', letterSpacing: '0.05em' }}>
                  ⚡ ĐĂNG NHẬP NHANH 1-CLICK (RBAC)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button 
                    className="btn" 
                    style={{ background: 'linear-gradient(135deg, #00adb5, #00d2c4)', color: '#fff', fontWeight: 'bold', padding: '10px', fontSize: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    onClick={() => handleQuickLogin('demo@cinemax.vn', '123456')}
                  >
                    🎟️ HỘI VIÊN (MEMBER)
                  </button>
                  <button 
                    className="btn" 
                    style={{ background: 'linear-gradient(135deg, #8e44ad, #a29bfe)', color: '#fff', fontWeight: 'bold', padding: '10px', fontSize: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    onClick={() => handleQuickLogin('staff@metiz.vn', 'staff123')}
                  >
                    💻 NHÂN VIÊN SOÁT VÉ (STAFF)
                  </button>
                  <button 
                    className="btn" 
                    style={{ background: 'linear-gradient(135deg, #d62246, #ff7675)', color: '#fff', fontWeight: 'bold', padding: '10px', fontSize: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    onClick={() => handleQuickLogin('admin@metiz.vn', 'admin123')}
                  >
                    ⚙️ QUẢN TRỊ VIÊN (ADMIN)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
