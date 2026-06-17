import React from 'react';
import { MascotLeft, MascotRight } from '../utils/helpers';

export default function TinVaKhuyenMai({
  promoList
}) {
  return (
    <section className="section container">
      <div className="section-header-block">
        <MascotLeft />
        <div className="section-title-plain">Ưu Đãi & Sự Kiện Mới Nhất</div>
        <MascotRight />
      </div>

      <div className="movie-grid">
        {promoList.map((item) => (
          <article className="movie-card" key={item.id}>
            <div className="poster-wrapper" style={{ height: '200px' }}>
              <img className="poster-img" src={item.img} alt={item.title} />
            </div>
            <div className="movie-info">
              <span className="promo-category" style={{ fontSize: '10px', color: 'var(--primary-teal)', fontWeight: 800 }}>
                {item.date}
              </span>
              <h3 style={{ fontSize: '14px', minHeight: '38px', marginTop: '4px' }}>{item.title}</h3>
              <p className="muted" style={{ fontSize: '12px', minHeight: '66px', marginTop: '6px' }}>{item.desc}</p>
              
              <button 
                className="movie-card-btn" 
                onClick={() => alert(`Chi tiết ưu đãi: ${item.title}\nÁp dụng tại rạp Metiz Đà Nẵng.`)}
              >
                XEM CHI TIẾT
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
