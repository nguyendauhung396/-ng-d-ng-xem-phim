import React from 'react';
import { MascotLeft, MascotRight, money } from '../utils/helpers';
import ForbiddenGate from '../actors/ForbiddenGate';

export default function VeCuaToi({
  user,
  bookingsHistory,
  handleQuickLogin
}) {
  return (
    user ? (
      <section className="section container">
        <div className="section-header-block">
          <MascotLeft />
          <div className="section-title-plain">🎟 Lịch Sử Đặt Vé Của Tôi</div>
          <MascotRight />
        </div>

        <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '4px', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
          <h3 style={{ fontWeight: 800, marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            DANH SÁCH VÉ PHIM ĐÃ ĐẶT (MYSQL DATABASE)
          </h3>
          
          {bookingsHistory.length === 0 ? (
            <p className="muted" style={{ textAlign: 'center', padding: '40px 0' }}>
              Bạn chưa đăng nhập hoặc chưa thực hiện giao dịch nào.<br/>
              Vui lòng đăng nhập tài khoản thành viên để đồng bộ lịch sử đặt vé an toàn.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {bookingsHistory.map((item) => (
                <div key={item.id} style={{ border: '1px solid #eee', borderRadius: '4px', padding: '16px', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', background: 'var(--primary-teal)', color: '#fff', padding: '3px 8px', borderRadius: '3px', fontWeight: '800' }}>
                      {item.id}
                    </span>
                    <h4 style={{ fontWeight: '800', marginTop: '6px', fontSize: '16px', color: '#111' }}>{item.movieTitle}</h4>
                    <p className="muted" style={{ fontSize: '13px', marginTop: '4px' }}>
                      📅 Ngày: <b>{new Date(item.date).toLocaleDateString('vi-VN')}</b> • ⏰ Giờ: <b>{item.time}</b>
                    </p>
                    <p className="muted" style={{ fontSize: '13px' }}>
                      🛋 Ghế đã chọn: <b style={{ color: 'var(--primary-teal)' }}>{item.seats ? item.seats.join(', ') : ''}</b>
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="muted" style={{ fontSize: '12px' }}>Tổng thanh toán:</span>
                    <h3 style={{ color: '#d62246', fontWeight: '900', fontSize: '18px' }}>{money(item.total)}</h3>
                    <span className="muted" style={{ fontSize: '11px' }}>Khách: {item.customerName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    ) : (
      <ForbiddenGate requiredRole="member" onLogin={handleQuickLogin} />
    )
  );
}
