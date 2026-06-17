const movies = [
  { id: 1, title: 'Biệt Đội Sao Băng', genre: 'Hành động', age: 'T13', duration: '118 phút', status: 'now', desc: 'Một biệt đội trẻ chống lại hiểm họa ngoài không gian.', room: 'Phòng chiếu 02' },
  { id: 2, title: 'Ngôi Nhà Bí Ẩn', genre: 'Kinh dị', age: 'T16', duration: '102 phút', status: 'now', desc: 'Những bí mật bị chôn vùi trong căn nhà cổ.', room: 'Phòng chiếu 03' },
  { id: 3, title: 'Ngày Hè Rực Rỡ', genre: 'Gia đình', age: 'P', duration: '96 phút', status: 'now', desc: 'Chuyến đi mùa hè đầy tiếng cười và cảm xúc.', room: 'Phòng chiếu 01' },
  { id: 4, title: 'Đường Đua Tốc Độ', genre: 'Phiêu lưu', age: 'T13', duration: '110 phút', status: 'now', desc: 'Cuộc đua quyết định danh dự của tay lái trẻ.', room: 'Phòng chiếu 04' },
  { id: 5, title: 'Hành Tinh Lạ', genre: 'Khoa học viễn tưởng', age: 'T13', duration: '124 phút', status: 'soon', desc: 'Nhiệm vụ khám phá hành tinh chưa từng được biết đến.', room: 'Sắp cập nhật' },
  { id: 6, title: 'Lời Hẹn Tháng Sáu', genre: 'Tình cảm', age: 'P', duration: '99 phút', status: 'soon', desc: 'Một câu chuyện tình nhẹ nhàng giữa thành phố biển.', room: 'Sắp cập nhật' }
];

const baseTimes = ['09:30', '11:45', '14:10', '16:30', '19:00', '21:20'];

function getDates() {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function buildShowtimes() {
  const dates = getDates();
  return dates.flatMap((date) =>
    movies
      .filter((movie) => movie.status === 'now')
      .flatMap((movie, index) => baseTimes.slice(index % 2, index % 2 + 5).map((time) => ({
        id: `${movie.id}-${date}-${time}`,
        movieId: movie.id,
        movieTitle: movie.title,
        date,
        time,
        room: movie.room,
        price: 55000
      })))
  );
}

const bookedSeats = new Map();
const defaultBooked = ['A3', 'B5', 'C7', 'D2', 'E8', 'F4'];
const bookings = [];

function seatKey(movieId, date, time) {
  return `${movieId}-${date}-${time}`;
}

module.exports = { movies, baseTimes, buildShowtimes, bookedSeats, defaultBooked, bookings, seatKey };
