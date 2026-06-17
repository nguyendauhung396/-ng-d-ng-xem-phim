import React from 'react';
import { MascotLeft, MascotRight } from '../utils/helpers';

export default function Phim({
  filter,
  setFilter,
  filteredMovies,
  openBooking,
  activeDate
}) {
  return (
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
        {filteredMovies.map((m) => (
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
              <p className="muted" style={{ fontSize: '12px', minHeight: '52px', marginTop: '6px' }}>{m.desc}</p>
              
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
    </section>
  );
}
