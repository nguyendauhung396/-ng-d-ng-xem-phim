# Cinema Fullstack Demo

Dự án demo website đặt vé xem phim, đã tách thành:

- `frontend`: React.js + Vite
- `backend`: Node.js + Express

## Cách chạy nhanh

### 1. Chạy backend
```bash
cd backend
npm install
npm run dev
```
Backend chạy tại: `http://localhost:5000`

### 2. Chạy frontend
Mở terminal mới:
```bash
cd frontend
npm install
npm run dev
```
Frontend chạy tại: `http://localhost:5173`

## API chính

- `GET /api/movies` - Lấy danh sách phim
- `GET /api/showtimes` - Lấy lịch chiếu
- `GET /api/seats?movieId=1&date=2026-06-02&time=14:10` - Lấy ghế đã đặt
- `POST /api/bookings` - Đặt vé
- `POST /api/contact` - Gửi liên hệ demo
- `POST /api/auth/login` - Đăng nhập demo

## Tài khoản demo

Email: `demo@cinemax.vn`
Mật khẩu: `123456`

> Đây là dự án demo để học tập. Dữ liệu được lưu tạm trong bộ nhớ backend, khởi động lại server sẽ mất booking mới.
