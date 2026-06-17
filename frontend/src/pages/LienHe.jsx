import React from 'react';
import { MascotLeft, MascotRight } from '../utils/helpers';

export default function LienHe({
  submitContact
}) {
  return (
    <section className="section container">
      <div className="section-header-block">
        <MascotLeft />
        <div className="section-title-plain">Dịch Vụ Rạp & Thông Tin Liên Hệ</div>
        <MascotRight />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '60px' }}>
        <div className="contact-info">
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111' }}>GIỚI THIỆU PHÒNG CHIẾU METIZ</h2>
          <p className="muted">
            Metiz Cinema tự hào mang lại không gian thưởng thức điện ảnh đỉnh cao đạt tiêu chuẩn quốc tế cho khán giả Đà Nẵng:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            <div style={{ background: '#fff', border: '1px solid #ddd', padding: '14px', borderRadius: '4px' }}>
              <b>🔊 HỆ THỐNG ÂM THANH DOLBY ATMOS</b>
              <p className="muted" style={{ fontSize: '12px', marginTop: '4px' }}>Công nghệ giả lập âm thanh vòm sống động chân thực đến từng milimet, trải nghiệm 360 độ cực sướng.</p>
            </div>
            <div style={{ background: '#fff', border: '1px solid #ddd', padding: '14px', borderRadius: '4px' }}>
              <b>🛋 GHẾ SWEETBOX ĐÔI LÃNG MẠN</b>
              <p className="muted" style={{ fontSize: '12px', marginTop: '4px' }}>Ghế đôi Sweetbox ấm áp thiết kế riêng biệt ở hàng ghế cuối rạp dành cho các cặp đôi yêu thích không gian riêng tư.</p>
            </div>
            <div style={{ background: '#fff', border: '1px solid #ddd', padding: '14px', borderRadius: '4px' }}>
              <b>🍿 QUẦY BẮP NƯỚC CONCESSION CAO CẤP</b>
              <p className="muted" style={{ fontSize: '12px', marginTop: '4px' }}>Hương vị bắp caramel, phô mai thơm ngon chuẩn Mỹ kết hợp cùng các combo nước ngọt đa dạng, vệ sinh.</p>
            </div>
          </div>
        </div>

        <div className="contact-info">
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111' }}>LIÊN HỆ BAN QUẢN TRỊ</h2>
          <p className="muted" style={{ fontSize: '14px', lineHeight: '1.8' }}>
            📍 Địa chỉ cụm rạp: Helio Center, Đường 2/9, Hòa Cường Bắc, Hải Châu, Đà Nẵng.<br/>
            📞 Điện thoại hotline: 0236 3630 689<br/>
            ✉️ Email hỗ trợ trực tiếp: contact@metiz.vn
          </p>
          <form className="contact-form" onSubmit={submitContact} style={{ marginTop: '16px' }}>
            <input name="name" placeholder="Họ và tên của bạn" required />
            <input name="phone" placeholder="Số điện thoại di động" required />
            <textarea name="message" placeholder="Để lại lời nhắn hỗ trợ tại đây..."></textarea>
            <button className="btn" style={{ background: '#111', color: '#fff' }}>GỬI LIÊN HỆ NGAY</button>
          </form>
        </div>
      </div>
    </section>
  );
}
