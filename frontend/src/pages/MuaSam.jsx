import React from 'react';
import { MascotLeft, MascotRight, money } from '../utils/helpers';

export default function MuaSam({
  shopCategory,
  setShopCategory,
  filteredProducts,
  addToCart
}) {
  return (
    <section className="section container">
      <div className="section-header-block">
        <MascotLeft />
        <div className="section-title-tabs">
          <button className={`tab-btn ${shopCategory === 'combos' ? 'active' : ''}`} onClick={() => setShopCategory('combos')}>
            Combo Bắp Nước
          </button>
          <button className={`tab-btn ${shopCategory === 'merchandise' ? 'active' : ''}`} onClick={() => setShopCategory('merchandise')}>
            Merchandise (Ly/Cốc)
          </button>
          <button className={`tab-btn ${shopCategory === 'egifts' ? 'active' : ''}`} onClick={() => setShopCategory('egifts')}>
            Thẻ Quà Tặng eGift
          </button>
        </div>
        <MascotRight />
      </div>

      <div className="movie-grid">
        {filteredProducts.map((item) => (
          <article className="movie-card" key={item.id}>
            <div className="poster-wrapper" style={{ height: '240px' }}>
              <img className="poster-img" src={item.img} alt={item.name} />
            </div>
            <div className="movie-info">
              <h3 style={{ minHeight: '34px', fontSize: '14px' }}>{item.name}</h3>
              <p className="muted" style={{ fontSize: '12px', minHeight: '56px' }}>{item.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span style={{ fontWeight: '900', color: 'var(--primary-teal)', fontSize: '16px' }}>
                  {money(item.price)}
                </span>
                <button 
                  className="btn" 
                  style={{ background: 'linear-gradient(135deg, #00adb5, #00d2c4)', color: '#fff', fontSize: '11px', padding: '6px 14px', borderRadius: '8px' }}
                  onClick={() => addToCart(item)}
                >
                  CHỌN MUA
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
