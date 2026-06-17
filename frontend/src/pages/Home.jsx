import React from 'react';
import { MascotLeft, MascotRight } from '../utils/helpers';

export default function Home({
  bannerSlides,
  currentSlide,
  setCurrentSlide,
  nowMovies,
  dates,
  showtimes,
  dateLabel,
  quickBooking,
  filter,
  setFilter,
  filteredMovies,
  openBooking,
  activeDate,
  navigateTo,
  promoItems
}) {
  return (
    <>
      {/* HERO BANNER */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div 
          className="hero-illustrative-bg" 
          style={{ backgroundImage: `url(${bannerSlides[currentSlide].img})` }}
        />
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div className="hero-content">
            <span className="hero-eyebrow">{bannerSlides[currentSlide].eyebrow}</span>
            <h1>{bannerSlides[currentSlide].title}</h1>
            <p className="lead">{bannerSlides[currentSlide].desc}</p>
            <div className="hero-actions">
              <a href="/lich-chieu-phim.html" className="btn primary" onClick={(e) => { e.preventDefault(); navigateTo('/lich-chieu-phim.html'); }}>Đặt Vé Ngay</a>
              <a href="/phim.html" className="btn outline" onClick={(e) => { e.preventDefault(); navigateTo('/phim.html'); }}>Xem Chi Tiết</a>
            </div>
          </div>
        </div>
        <div className="carousel-dots">
          {bannerSlides.map((_, i) => (
            <span 
              key={i} 
              className={`dot ${currentSlide === i ? 'active' : ''}`}
              onClick={() => setCurrentSlide(i)}
            />
          ))}
        </div>
      </section>

      {/* QUICK BOOK BAR */}
      <section className="quick-book container">
        <div>
          <label>Chọn Phim</label>
          <select id="quickMovie">
            {nowMovies.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
        </div>
        <div>
          <label>Ngày Chiếu</label>
          <select id="quickDate">
            {dates.map((d, i) => <option key={d} value={d}>{dateLabel(d, i)}</option>)}
          </select>
        </div>
        <div>
          <label>Suất Chiếu</label>
          <select id="quickTime">
            {showtimes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button className="btn" onClick={quickBooking}>MUA VÉ NHANH</button>
      </section>

      {/* PHIM DANG CHIEU / PHIM SAP CHIEU */}
      <section className="section container">
        <div className="section-header-block">
          <MascotLeft />
          <div className="section-title-tabs">
            <button className={`tab-btn ${filter === 'now' ? 'active' : ''}`} onClick={() => setFilter('now')}>
              Phim Đang Chiếu
            </button>
            <button className={`tab-btn ${filter === 'soon' ? 'active' : ''}`} onClick={() => setFilter('soon')}>
              Phim Sắp Chiếu
            </button>
          </div>
          <MascotRight />
        </div>

        <div className="movie-grid">
          {filteredMovies.slice(0, 8).map((m) => (
            <article className="movie-card" key={m.id}>
              <div className="poster-wrapper">
                <span className={`age-tag ${m.age.toLowerCase()}`}>
                  {m.age}
                </span>
                <img className="poster-img" src={m.poster} alt={m.title} />
              </div>
              <div className="movie-info">
                <h3>{m.title}</h3>
                <div className="movie-meta-item">Thể loại: <span>{m.genre}</span></div>
                <div className="movie-meta-item">Thời lượng: <span>{m.duration}</span></div>
                
                <button 
                  disabled={m.status !== 'now'} 
                  className="movie-card-btn" 
                  onClick={() => openBooking(m.id, activeDate, '14:10')}
                >
                  {m.status === 'now' ? 'ĐẶT VÉ' : 'SẮP CHIẾU'}
                </button>
              </div>
            </article>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button className="btn" onClick={() => navigateTo('/phim.html')}>
            XEM TOÀN BỘ PHIM
          </button>
        </div>
      </section>

      {/* TIN TỨC & ƯU ĐÃI */}
      <section id="promo" className="section container">
        <div className="section-header-block">
          <MascotLeft />
          <div className="section-title-plain">
            Tin Tức & Ưu Đãi
          </div>
          <MascotRight />
        </div>

        <div className="promo-grid">
          {promoItems.map((item) => (
            <article className="promo-card" key={item.id} style={{ cursor: 'pointer' }} onClick={() => navigateTo('/tin-va-khuyen-mai.html')}>
              <div className="promo-img-wrapper">
                <img className="promo-img" src={item.img} alt={item.title} />
              </div>
              <div className="promo-content">
                <span className="promo-category">{item.category}</span>
                <h3>{item.title}</h3>
              </div>
            </article>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button className="btn" onClick={() => navigateTo('/tin-va-khuyen-mai.html')}>
            TẤT CẢ TIN TỨC & KHUYẾN MÃI
          </button>
        </div>
      </section>

      {/* BẢNG GIÁ VÉ */}
      <section className="section price-section">
        <div className="container">
          <div className="section-header-block" style={{ marginBottom: '30px' }}>
            <div className="section-title-plain">Bảng Giá Vé Tham Khảo</div>
          </div>
          <div className="price-table">
            <div>
              <b>Người lớn 2D (Ngày Thường)</b>
              <span>55.000đ</span>
            </div>
            <div>
              <b>Học sinh / Sinh viên / U22</b>
              <span>45.000đ</span>
            </div>
            <div>
              <b>Trẻ em (Dưới 1.3m)</b>
              <span>40.000đ</span>
            </div>
            <div>
              <b>Phụ thu Ghế VIP / Ghế đôi</b>
              <span>+5.000đ / +10.000đ</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
