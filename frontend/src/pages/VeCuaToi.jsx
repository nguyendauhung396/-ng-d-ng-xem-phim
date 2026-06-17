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

        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
          <h3 style={{ fontWeight: 800, marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '10px', color: '#fff', fontSize: '15px', letterSpacing: '0.05em' }}>
            DANH SÁCH VÉ PHIM ĐÃ ĐẶT (MYSQL DATABASE)
          </h3>
          
          {bookingsHistory.length === 0 ? (
            <p className="muted" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              Bạn chưa đăng nhập hoặc chưa thực hiện giao dịch nào.<br/>
              Vui lòng đăng nhập tài khoản thành viên để đồng bộ lịch sử đặt vé an toàn.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {bookingsHistory.map((item) => (
                <div key={item.id} style={{ border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', background: 'var(--primary-teal)', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontWeight: '800' }}>
                      {item.id}
                    </span>
                    <h4 style={{ fontWeight: '800', marginTop: '10px', fontSize: '16px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{item.movieTitle}</h4>
                    <p className="muted" style={{ fontSize: '13.5px', marginTop: '6px', color: 'var(--text-muted)' }}>
                      📅 Ngày: <b style={{ color: '#fff' }}>{new Date(item.date).toLocaleDateString('vi-VN')}</b> • ⏰ Giờ: <b style={{ color: '#fff' }}>{item.time}</b>
                    </p>
                    <p className="muted" style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
                      🛋 Ghế đã chọn: <b style={{ color: 'var(--primary-teal)' }}>{item.seats ? item.seats.join(', ') : ''}</b>
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="muted" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tổng thanh toán:</span>
                    <h3 style={{ color: '#ef4444', fontWeight: '900', fontSize: '18px', marginTop: '2px' }}>{money(item.total)}</h3>
                    <span className="muted" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Khách: {item.customerName}</span>
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
