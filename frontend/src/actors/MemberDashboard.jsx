import React, { useState, useEffect } from 'react';
import { api } from '../api';

function money(n) {
  return n ? n.toLocaleString('vi-VN') + 'đ' : '0đ';
}

export default function MemberDashboard({ user: initialUser, bookingsHistory, onLogout }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [myVouchers, setMyVouchers] = useState([]);
  const [pointTransactions, setPointTransactions] = useState([]);
  const [loyaltyInfo, setLoyaltyInfo] = useState(null);

  useEffect(() => {
    if (initialUser?.id) {
      // load vouchers
      api.getUserVouchers(initialUser.id)
        .then(data => setMyVouchers(data))
        .catch(err => console.log('Err load vouchers:', err));

      // load point transactions
      api.getLoyaltyTransactions(initialUser.id)
        .then(data => setPointTransactions(data))
        .catch(err => console.log('Err load transactions:', err));

      // load loyalty summary
      api.getLoyaltyMe(initialUser.id)
        .then(data => setLoyaltyInfo(data))
        .catch(err => console.log('Err load loyalty info:', err));
    }
  }, [initialUser]);

  const user = {
    ...initialUser,
    points: loyaltyInfo ? loyaltyInfo.totalPoints : initialUser.points,
    tier: loyaltyInfo ? `Thành viên ${loyaltyInfo.membershipLevel}` : initialUser.tier,
    totalSpending: loyaltyInfo ? loyaltyInfo.totalSpending : 0
  };

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
              Tổng chi tiêu lũy kế: <b>{user.totalSpending.toLocaleString('vi-VN')}đ</b>
            </div>
          </div>
        </div>

        <div className="dashboard-tabs-container">
          <div className="dashboard-tabs-header" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            <button className={`dashboard-tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              👤 THÔNG TIN
            </button>
            <button className={`dashboard-tab-btn ${activeTab === 'card-rules' ? 'active' : ''}`} onClick={() => setActiveTab('card-rules')}>
              🎫 THẺ THÀNH VIÊN
            </button>
            <button className={`dashboard-tab-btn ${activeTab === 'vouchers' ? 'active' : ''}`} onClick={() => setActiveTab('vouchers')}>
              🎟️ VOUCHER
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

            {activeTab === 'vouchers' && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '900', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px', color: '#111' }}>
                  KHO VOUCHER KHUYẾN MÃI CỦA BẠN
                </h3>
                {myVouchers.length === 0 ? (
                  <p className="muted" style={{ textAlign: 'center', padding: '30px 0' }}>
                    Hiện bạn chưa sở hữu mã giảm giá nào. Hãy tích lũy chi tiêu để nhận voucher tri ân nhé!
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }} className="voucher-grid">
                    <style dangerouslySetInnerHTML={{__html: `
                      @media (max-width: 768px) {
                        .voucher-grid {
                          grid-template-columns: 1fr !important;
                        }
                      }
                      .voucher-card {
                        background: #fff;
                        border: 1px solid #e2e8f0;
                        border-radius: 8px;
                        padding: 16px;
                                             .voucher-card::before {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 0;
                        bottom: 0;
                        width: 4px;
                        background: var(--primary-teal);
                      }
                    `}} />
                    {myVouchers.map(v => (
                      <div className="voucher-card" key={v.id}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--primary-teal)', background: '#e0f2fe', padding: '4px 8px', borderRadius: '4px' }}>
                              {v.code}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>Hạn: {v.endDate}</span>
                          </div>
                          <h4 style={{ fontWeight: '800', marginTop: '10px', fontSize: '14px', color: '#1e293b' }}>{v.name}</h4>
                          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}>{v.description}</p>
                        </div>
                        <div style={{ marginTop: '12px', borderTop: '1px dashed #e2e8f0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
                          <span>Đơn tối thiểu: <b>{money(v.minOrderAmount)}</b></span>
                          <span>Giảm: <b>{v.discountType === 'percent' ? `${v.discountValue}%` : money(v.discountValue)}</b></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                  LỊCH SỬ GIAO DỊCH & TÍCH ĐIỂM
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="transactions-layout">
                  <style dangerouslySetInnerHTML={{__html: `
                    @media (max-width: 768px) {
                      .transactions-layout {
                        grid-template-columns: 1fr !important;
                      }
                    }
                  `}} />
                  <div>
                    <h4 style={{ fontWeight: '800', marginBottom: '10px', fontSize: '13px', color: 'var(--primary-teal)' }}>🎟️ LỊCH SỬ ĐẶT VÉ</h4>
                    {bookingsHistory.length === 0 ? (
                      <p className="muted" style={{ fontSize: '12px' }}>Bạn chưa đặt vé nào.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {bookingsHistory.map((item) => (
                          <div key={item.id} style={{ border: '1px solid #eee', borderRadius: '4px', padding: '10px', background: '#fafafa' }}>
                            <span style={{ fontSize: '9px', background: 'var(--primary-teal)', color: '#fff', padding: '2px 4px', borderRadius: '3px', fontWeight: '800' }}>
                              #{item.id}
                            </span>
                            <h5 style={{ fontWeight: '800', margin: '4px 0 2px', fontSize: '13px' }}>{item.movieTitle}</h5>
                            <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>
                              🎬 {item.time} ({new Date(item.date).toLocaleDateString('vi-VN')}) • Ghế: {item.seats.join(', ')}
                            </p>
                            <b style={{ color: '#d62246', fontSize: '13px', display: 'block', marginTop: '4px' }}>{money(item.total)}</b>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 style={{ fontWeight: '800', marginBottom: '10px', fontSize: '13px', color: '#f39c12' }}>🪙 LỊCH SỬ ĐIỂM TÍCH LŨY</h4>
                    {pointTransactions.length === 0 ? (
                      <p className="muted" style={{ fontSize: '12px' }}>Chưa có giao dịch tích lũy điểm.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {pointTransactions.map((tx) => (
                          <div key={tx.id} style={{ border: '1px solid #eee', borderRadius: '4px', padding: '10px', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{
                                fontSize: '9px',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontWeight: '800',
                                color: '#fff',
                                background: tx.transactionType === 'earn' ? '#2ecc71' : '#e74c3c'
                              }}>
                                {tx.transactionType === 'earn' ? 'TÍCH ĐIỂM' : 'TIÊU ĐIỂM'}
                              </span>
                              <p style={{ fontSize: '12px', margin: '4px 0 2px', color: '#333' }}>{tx.description}</p>
                              <span style={{ fontSize: '10px', color: '#888' }}>{new Date(tx.createdAt).toLocaleString('vi-VN')}</span>
                            </div>
                            <b style={{ color: tx.transactionType === 'earn' ? '#2ecc71' : '#e74c3c', fontSize: '14px' }}>
                              {tx.transactionType === 'earn' ? `+${tx.points}` : `-${tx.points}`}
                            </b>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button 
          className="btn" 
          style={{ background: '#e74c3c', color: '#fff', width: 'auto', padding: '12px 40px' }} 
          onClick={onLogout}
        >
          🚪 ĐĂNG XUẤT TÀI KHOẢN
        </button>
      </div>
    </section>
  );
}
