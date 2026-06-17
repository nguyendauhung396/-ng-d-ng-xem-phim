import React from 'react';
import { MascotLeft, MascotRight, money } from '../utils/helpers';

export default function LichChieuPhim({
  dates,
  activeDate,
  setActiveDate,
  dateLabel,
  nowMovies,
  schedulesForDate,
  openBooking
}) {
  return (
    <section className="section container">
      <div className="section-header-block">
        <MascotLeft />
        <div className="section-title-plain">Lịch Chiếu Phim Hàng Ngày</div>
        <MascotRight />
      </div>

      <div className="schedule-header">
        <h2>HÔM NAY CHIẾU GÌ</h2>
        <div className="date-pills">
          {dates.map((d, i) => (
            <button 
              key={d} 
              className={`date-pill ${activeDate === d ? 'active' : ''}`} 
              onClick={() => setActiveDate(d)}
            >
              {dateLabel(d, i)}
            </button>
          ))}
        </div>
      </div>

      <div className="schedule-list" style={{ marginTop: '20px' }}>
        {nowMovies.map((movie) => {
          const times = schedulesForDate.filter((s) => s.movieId === movie.id);
          if (times.length === 0) return null;
          return (
            <article className="schedule-card" key={movie.id}>
              <div 
                className="schedule-card-poster" 
                style={{ backgroundImage: `url(${movie.poster})` }}
              />
              <div className="schedule-card-info">
                <h3>{movie.title}</h3>
                <p>{movie.genre} • {movie.duration} • {movie.room} • {money(55000)}/vé</p>
                <div className="times">
                  {times.map((s) => (
                    <button 
                      className="time-btn" 
                      key={s.id} 
                      onClick={() => openBooking(movie.id, s.date, s.time)}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
