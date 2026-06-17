import React, { useState, useEffect } from 'react';
import { api } from '../api';

function money(n) {
  return n ? n.toLocaleString('vi-VN') + 'đ' : '0đ';
}

function getSeatPrice(seat) {
  const row = seat.charAt(0).toUpperCase();
  if (row === 'K') return 110000;
  if ('EFGHIJ'.includes(row)) return 75000;
  return 55000;
}

function getSeatCategory(seat) {
  const row = seat.charAt(0).toUpperCase();
  if (row === 'K') return 'couple';
  if ('EFGHIJ'.includes(row)) return 'vip';
  return 'standard';
}

export default function StaffDashboard({ user, handleLogout, nowMovies, dates, showtimes, allSeats }) {
  const [staffTab, setStaffTab] = useState('checkin');
  const [staffLookupCode, setStaffLookupCode] = useState('');
  
  // Legacy Lookup states
  const [lookupResults, setLookupResults] = useState([]);
  const [staffActiveBooking, setStaffActiveBooking] = useState(null);
  const [staffActiveTickets, setStaffActiveTickets] = useState([]);
  
  // Shift reporting states (loaded from database)
  const [staffCheckinCount, setStaffCheckinCount] = useState(0);
  const [staffSalesCount, setStaffSalesCount] = useState(0);
  const [staffShiftRevenue, setStaffShiftRevenue] = useState(0);

  // Counter sales states
  const [staffMovieId, setStaffMovieId] = useState('');
  const [staffDate, setStaffDate] = useState('');
  const [staffTime, setStaffTime] = useState('');
  const [staffSeats, setStaffSeats] = useState([]);
  const [staffCustomerName, setStaffCustomerName] = useState('Khách quầy');
  const [staffPhone, setStaffPhone] = useState('');
  const [bookedSeats, setBookedSeats] = useState([]);

  // QR Scanner Simulator states
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedCode, setScannedCode] = useState('');

  // QR Checkin New States
  const [qrVerifyResult, setQrVerifyResult] = useState(null); // { success, message, data }
  const [isBookingScan, setIsBookingScan] = useState(false);
  const [bookingScanData, setBookingScanData] = useState(null); // { booking, tickets }
  const [selectedSeatsForCheckin, setSelectedSeatsForCheckin] = useState([]); // array of ticketCodes

  const loadShiftReport = async () => {
    try {
      const data = await api.getShiftReport();
      setStaffCheckinCount(data.checkinCount);
      setStaffSalesCount(data.salesCount);
      setStaffShiftRevenue(data.revenue);
    } catch (err) {
      console.error('Lỗi tải báo cáo ca:', err);
    }
  };

  useEffect(() => {
    loadShiftReport();
  }, []);

  useEffect(() => {
    if (staffTab === 'shift-report') {
      loadShiftReport();
    }
  }, [staffTab]);

  const handleVerifyOrScanCode = async (codeToVerify) => {
    const code = (codeToVerify || staffLookupCode).trim();
    if (!code) return alert('Vui lòng nhập mã QR vé hoặc mã Booking');

    setQrVerifyResult(null);
    setBookingScanData(null);
    setIsBookingScan(false);

    try {
      if (code.toUpperCase().startsWith('BK')) {
        const data = await api.scanBookingQR({ bookingCode: code });
        setIsBookingScan(true);
        setBookingScanData(data);
        const pendingTickets = data.tickets.filter(t => t.status !== 'checked_in' && t.status !== 'used').map(t => t.ticketCode);
        setSelectedSeatsForCheckin(pendingTickets);
      } else {
        const data = await api.verifyTicketQR({ qrCode: code });
        setQrVerifyResult({
          success: true,
          message: data.message,
          data: data.data
        });
      }
    } catch (err) {
      setQrVerifyResult({
        success: false,
        message: err.message
      });
    }
  };

  const handleScanAndCheckinSingle = async (qrCode) => {
    try {
      const data = await api.scanTicketQR({ qrCode });
      alert(data.message || 'Check-in thành công!');
      setQrVerifyResult(null);
      setStaffLookupCode('');
      loadShiftReport();
    } catch (err) {
      alert('Lỗi check-in: ' + err.message);
    }
  };

  const handleScanAndCheckinBooking = async () => {
    if (selectedSeatsForCheckin.length === 0) {
      return alert('Vui lòng chọn ít nhất một ghế để check-in');
    }
    let successCount = 0;
    let failMessages = [];

    for (const ticketCode of selectedSeatsForCheckin) {
      try {
        await api.scanTicketQR({ qrCode: ticketCode });
        successCount++;
      } catch (err) {
        failMessages.push(`${ticketCode}: ${err.message}`);
      }
    }

    if (failMessages.length > 0) {
      alert(`Đã check-in thành công ${successCount} vé. Thất bại ${failMessages.length} vé:\n` + failMessages.join('\n'));
    } else {
      alert(`🎉 Check-in thành công toàn bộ ${successCount} vé đã chọn!`);
    }

    if (bookingScanData) {
      handleVerifyOrScanCode(bookingScanData.booking.bookingCode);
    }
    loadShiftReport();
  };

  const handleCheckinAllBooking = async () => {
    if (!bookingScanData) return;
    const pendingTickets = bookingScanData.tickets.filter(t => t.status !== 'checked_in' && t.status !== 'used').map(t => t.ticketCode);
    if (pendingTickets.length === 0) {
      return alert('Tất cả các vé trong booking này đã được check-in rồi.');
    }
    
    let successCount = 0;
    let failMessages = [];

    for (const ticketCode of pendingTickets) {
      try {
        await api.scanTicketQR({ qrCode: ticketCode });
        successCount++;
      } catch (err) {
        failMessages.push(`${ticketCode}: ${err.message}`);
      }
    }

    if (failMessages.length > 0) {
      alert(`Đã check-in thành công ${successCount} vé. Thất bại ${failMessages.length} vé:\n` + failMessages.join('\n'));
    } else {
      alert(`🎉 Check-in thành công toàn bộ ${successCount} vé!`);
    }

    handleVerifyOrScanCode(bookingScanData.booking.bookingCode);
    loadShiftReport();
  };

  const lookupStaffTickets = async (codeToUse) => {
    const code = codeToUse || staffLookupCode;
    if (!code) return alert('Vui lòng nhập mã vé hoặc SĐT khách hàng');
    try {
      const data = await api.lookupTickets(code);
      if (data.results && data.results.length > 0) {
        setLookupResults(data.results);
        if (data.results.length === 1) {
          setStaffActiveBooking(data.results[0].booking);
          setStaffActiveTickets(data.results[0].tickets);
        } else {
          setStaffActiveBooking(null);
          setStaffActiveTickets([]);
        }
      } else {
        alert('Không tìm thấy vé phù hợp');
        setLookupResults([]);
        setStaffActiveBooking(null);
        setStaffActiveTickets([]);
      }
    } catch (err) {
      alert(err.message);
      setStaffActiveBooking(null);
      setStaffActiveTickets([]);
      setLookupResults([]);
    }
  };

  const selectBookingResult = (result) => {
    setStaffActiveBooking(result.booking);
    setStaffActiveTickets(result.tickets);
  };

  const checkinStaffTicket = async (ticketId) => {
    try {
      const result = await api.checkinTicket({ ticketId });
      alert(result.message);
      loadShiftReport();
      if (staffActiveBooking) {
        const data = await api.lookupTickets(staffActiveBooking.id);
        if (data.results && data.results.length > 0) {
          setStaffActiveTickets(data.results[0].tickets);
        }
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const startSimulationScan = (type = 'ticket') => {
    setShowQrScanner(true);
    setScanProgress(0);
    setScannedCode('');
    
    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          api.getBookings().then(res => {
            if (res && res.length > 0) {
              const bk = res[0];
              const code = type === 'booking' ? bk.id : `TK-${bk.id}-${bk.seats[0]}`;
              setScannedCode(code);
              setStaffLookupCode(code);
              setTimeout(() => {
                setShowQrScanner(false);
                handleVerifyOrScanCode(code);
              }, 800);
            } else {
              setScannedCode('Không tìm thấy booking');
              setTimeout(() => {
                setShowQrScanner(false);
                alert('Không có booking nào trong hệ thống để mô phỏng quét!');
              }, 1000);
            }
          }).catch(() => {
            setShowQrScanner(false);
          });
          return 100;
        }
        return p + 25;
      });
    }, 200);
  };

  const openCounterSalesGrid = async () => {
    if (!staffMovieId || !staffDate || !staffTime) return alert('Hãy chọn đầy đủ Phim, Ngày, Giờ');
    try {
      const seatData = await api.getSeats({ movieId: staffMovieId, date: staffDate, time: staffTime });
      setBookedSeats(seatData.booked);
      setStaffSeats([]);
    } catch (err) {
      alert(err.message);
    }
  };

  const executeCounterSales = async () => {
    if (staffSeats.length === 0) return alert('Hãy chọn ít nhất 1 ghế cho khách!');
    const totalAmount = staffSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);
    try {
      await api.createBooking({
        customerName: staffCustomerName,
        phone: staffPhone,
        movieId: staffMovieId,
        date: staffDate,
        time: staffTime,
        seats: staffSeats,
        total: totalAmount
      });
      alert('🎉 Xuất vé tại quầy thành công! Hệ thống đã tự động ghi nhận thanh toán tiền mặt.');
      loadShiftReport();
      setStaffSeats([]);
      const seatData = await api.getSeats({ movieId: staffMovieId, date: staffDate, time: staffTime });
      setBookedSeats(seatData.booked);
    } catch (err) {
      alert(err.message);
    }
  };

  const computedSalesTotal = staffSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);

  return (
    <div className="dashboard-layout">
      <div className="dashboard-sidebar">
        <h3>QUẦY HÀNH CHÍNH</h3>
        <p className="muted" style={{ padding: '0 15px', fontSize: '11px' }}>Chào, <b>{user?.fullName || 'Soát vé viên'}</b></p>
        
        <button 
          className={`sidebar-btn ${staffTab === 'checkin' ? 'active' : ''}`} 
          onClick={() => setStaffTab('checkin')}
        >
          🔍 Kiểm Vé & Soát QR
        </button>
        <button 
          className={`sidebar-btn ${staffTab === 'counter-sales' ? 'active' : ''}`} 
          onClick={() => setStaffTab('counter-sales')}
        >
          🎟 Bán Vé Tại Quầy
        </button>
        <button 
          className={`sidebar-btn ${staffTab === 'shift-report' ? 'active' : ''}`} 
          onClick={() => setStaffTab('shift-report')}
        >
          📊 Báo Cáo Ca Làm
        </button>
        
        <hr style={{ borderColor: '#333', margin: '15px 0' }} />
        <button className="sidebar-btn" onClick={handleLogout} style={{ color: '#e74c3c' }}>
          🚪 Đăng Xuất
        </button>
      </div>

      <div className="dashboard-content">
        {staffTab === 'checkin' && (
          <div>
            <h1 style={{ fontWeight: 900, marginBottom: '10px' }}>🔍 KIỂM VÉ & SOÁT VÉ QR CODE</h1>
            <p className="muted" style={{ marginBottom: '24px' }}>Hệ thống soát vé thông minh: Quét QR Code vé, mã Booking hoặc nhập thủ công để check-in.</p>

            {/* Main Action Bar */}
            <div className="ticket-scan-box" style={{ background: 'var(--bg-card)', border: '1px dashed rgba(255, 255, 255, 0.1)', padding: '24px', borderRadius: '8px', marginBottom: '30px' }}>
              <label style={{ fontWeight: 800, fontSize: '12px', display: 'block', marginBottom: '8px' }}>NHẬP MÃ QR VÉ / MÃ BOOKING</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                <input 
                  placeholder="Nhập mã QR vé (ví dụ: TK-BK...) hoặc mã Booking (ví dụ: BK...)" 
                  value={staffLookupCode} 
                  onChange={e => setStaffLookupCode(e.target.value)} 
                  style={{ flexGrow: 1, minWidth: '250px' }}
                />
                <button className="btn" style={{ background: 'var(--primary-teal)', color: '#fff', padding: '0 24px' }} onClick={() => handleVerifyOrScanCode()}>
                  XÁC MINH VÉ
                </button>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="btn" style={{ background: '#ff5722', color: '#fff' }} onClick={() => startSimulationScan('ticket')}>
                  📷 MÔ PHỎNG QUÉT QR VÉ
                </button>
                <button className="btn" style={{ background: '#00adb5', color: '#fff' }} onClick={() => startSimulationScan('booking')}>
                  📷 MÔ PHỎNG QUÉT BOOKING NHIỀU VÉ
                </button>
                {(qrVerifyResult || isBookingScan) && (
                  <button className="btn" style={{ background: '#aaa', color: '#fff' }} onClick={() => {
                    setQrVerifyResult(null);
                    setIsBookingScan(false);
                    setBookingScanData(null);
                    setStaffLookupCode('');
                  }}>
                    🔄 XÓA KẾT QUẢ / QUÉT MỚI
                  </button>
                )}
              </div>
            </div>

            {/* QR Simulator Overlay */}
            {showQrScanner && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                <div style={{ background: '#111', border: '2px solid var(--primary-teal)', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '450px', textAlign: 'center', color: '#fff' }}>
                  <h3 style={{ fontWeight: 900, color: 'var(--primary-teal)', marginBottom: '15px' }}>📷 ĐANG QUÉT MÃ QR TỪ CAMERA...</h3>
                  
                  <div style={{ width: '220px', height: '220px', margin: '20px auto', border: '4px solid #fff', borderRadius: '8px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#222' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#ff5722', animation: 'scanLine 2s infinite linear' }}></div>
                    <span style={{ fontSize: '48px' }}>🔲</span>
                    <p style={{ fontSize: '11px', marginTop: '10px', color: '#aaa' }}>Đưa mã QR vào khung hình</p>
                  </div>

                  <div style={{ width: '100%', background: '#333', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '15px' }}>
                    <div style={{ width: `${scanProgress}%`, background: 'var(--primary-teal)', height: '100%', transition: 'width 0.2s' }}></div>
                  </div>

                  <p className="muted" style={{ color: '#eee' }}>{scannedCode ? `Đã nhận diện: ${scannedCode}` : 'Đang giải mã...'}</p>
                  <button className="btn" style={{ marginTop: '20px', background: '#444', color: '#fff' }} onClick={() => setShowQrScanner(false)}>
                    HỦY BỎ
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 1: Single Ticket verification result (Valid / Invalid) */}
            {qrVerifyResult && (
              <div style={{ 
                background: qrVerifyResult.success && qrVerifyResult.data.status === 'valid' ? 'rgba(46, 204, 113, 0.05)' : 'rgba(231, 76, 60, 0.05)', 
                border: qrVerifyResult.success && qrVerifyResult.data.status === 'valid' ? '1px solid #2ecc71' : '1px solid #e74c3c',
                padding: '30px', 
                borderRadius: '8px', 
                marginBottom: '30px',
                color: '#fff'
              }}>
                {qrVerifyResult.success && qrVerifyResult.data.status === 'valid' ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                      <span style={{ fontSize: '36px', color: '#2ecc71' }}>✅</span>
                      <div>
                        <h2 style={{ margin: 0, color: '#2ecc71', fontWeight: 900 }}>VÉ HỢP LỆ</h2>
                        <p style={{ margin: 0, fontSize: '13px', color: '#2ecc71' }}>Suất chiếu chính xác & đã thanh toán. Đủ điều kiện vào rạp.</p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div>
                        <p style={{ margin: '6px 0' }}>Mã vé: <b>{qrVerifyResult.data.ticketCode}</b></p>
                        <p style={{ margin: '6px 0' }}>Tên phim: <b style={{ color: 'var(--primary-teal)' }}>{qrVerifyResult.data.movieName}</b></p>
                        <p style={{ margin: '6px 0' }}>Phòng chiếu: <b>{qrVerifyResult.data.roomName}</b></p>
                      </div>
                      <div>
                        <p style={{ margin: '6px 0' }}>Giờ chiếu: <b>{qrVerifyResult.data.showTime}</b></p>
                        <p style={{ margin: '6px 0' }}>Ngày chiếu: <b>{new Date(qrVerifyResult.data.showDate).toLocaleDateString('vi-VN')}</b></p>
                        <p style={{ margin: '6px 0' }}>Vị trí ghế: <b style={{ fontSize: '18px', color: '#e67e22' }}>{qrVerifyResult.data.seatName}</b></p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <button 
                        className="btn" 
                        style={{ background: '#2ecc71', color: '#fff', fontWeight: 'bold', padding: '12px 30px' }}
                        onClick={() => handleScanAndCheckinSingle(qrVerifyResult.data.ticketCode)}
                      >
                        XÁC NHẬN CHO KHÁCH VÀO RẠP
                      </button>
                      <button 
                        className="btn" 
                        style={{ background: '#333', color: '#fff', padding: '12px 20px' }}
                        onClick={() => setQrVerifyResult(null)}
                      >
                        HỦY BỎ
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                      <span style={{ fontSize: '36px', color: '#e74c3c' }}>❌</span>
                      <div>
                        <h2 style={{ margin: 0, color: '#e74c3c', fontWeight: 900 }}>VÉ KHÔNG HỢP LỆ / BỊ TỪ CHỐI</h2>
                        <p style={{ margin: 0, fontSize: '13px', color: '#e74c3c' }}>
                          Lý do: {qrVerifyResult.message || (qrVerifyResult.data && qrVerifyResult.data.status === 'checked_in' ? 'Vé đã được check-in sử dụng' : 'Lỗi xác thực vé')}
                        </p>
                      </div>
                    </div>

                    {qrVerifyResult.data && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '20px' }}>
                        <div>
                          <p style={{ margin: '6px 0' }}>Mã vé: <b>{qrVerifyResult.data.ticketCode}</b></p>
                          <p style={{ margin: '6px 0' }}>Tên phim: <b>{qrVerifyResult.data.movieName}</b></p>
                          <p style={{ margin: '6px 0' }}>Vị trí ghế: <b style={{ color: '#e74c3c' }}>{qrVerifyResult.data.seatName}</b></p>
                        </div>
                        <div>
                          <p style={{ margin: '6px 0' }}>Trạng thái vé: <b style={{ color: '#e74c3c' }}>{qrVerifyResult.data.status}</b></p>
                          <p style={{ margin: '6px 0' }}>Khách hàng: <b>{qrVerifyResult.data.customerName}</b></p>
                          {qrVerifyResult.data.checkedInAt && (
                            <p style={{ margin: '6px 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                              Đã check-in lúc: {qrVerifyResult.data.checkedInAt}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <button 
                      className="btn" 
                      style={{ background: '#e74c3c', color: '#fff', padding: '12px 25px' }}
                      onClick={() => setQrVerifyResult(null)}
                    >
                      QUAY LẠI QUÉT VÉ
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SCREEN 2: Multiple Tickets Booking scanner panel */}
            {isBookingScan && bookingScanData && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '30px', borderRadius: '8px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '15px', marginBottom: '20px' }}>
                  <h2 style={{ margin: 0, fontWeight: 900 }}>🎫 BOOKING: {bookingScanData.booking.bookingCode}</h2>
                  <span style={{ background: 'var(--primary-teal)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                    NHIỀU VÉ ({bookingScanData.tickets.length} GHẾ)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', marginBottom: '25px' }}>
                  <div>
                    <p style={{ margin: '4px 0' }}>Khách hàng: <b>{bookingScanData.booking.customerName}</b></p>
                    <p style={{ margin: '4px 0' }}>Tên phim: <b style={{ color: 'var(--primary-teal)' }}>{bookingScanData.booking.movieName}</b></p>
                    <p style={{ margin: '4px 0' }}>Phòng chiếu: <b>{bookingScanData.booking.roomName}</b></p>
                  </div>
                  <div>
                    <p style={{ margin: '4px 0' }}>Ngày chiếu: <b>{new Date(bookingScanData.booking.showDate).toLocaleDateString('vi-VN')}</b></p>
                    <p style={{ margin: '4px 0' }}>Suất chiếu: <b>{bookingScanData.booking.showTime}</b></p>
                  </div>
                </div>

                <h4 style={{ fontWeight: 800, marginBottom: '12px' }}>DANH SÁCH GHẾ CẦN CHECK-IN:</h4>
                <div style={{ border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
                  <table className="admin-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>Chọn</th>
                        <th>Mã Vé</th>
                        <th>Ghế</th>
                        <th>Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingScanData.tickets.map(t => {
                        const isChecked = t.status === 'checked_in' || t.status === 'used';
                        return (
                          <tr key={t.ticketCode} style={{ background: isChecked ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.03)' }}>
                            <td>
                              <input 
                                type="checkbox"
                                disabled={isChecked}
                                checked={selectedSeatsForCheckin.includes(t.ticketCode)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSeatsForCheckin(prev => [...prev, t.ticketCode]);
                                  } else {
                                    setSelectedSeatsForCheckin(prev => prev.filter(code => code !== t.ticketCode));
                                  }
                                }}
                              />
                            </td>
                            <td>{t.ticketCode}</td>
                            <td><b style={{ color: 'var(--primary-teal)' }}>{t.seatName}</b></td>
                            <td>
                              <span className={`status-badge ${t.status}`}>
                                {isChecked ? 'Đã vào rạp' : 'Chưa sử dụng'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <button 
                    className="btn" 
                    style={{ background: '#2ecc71', color: '#fff', fontWeight: 'bold' }}
                    onClick={handleScanAndCheckinBooking}
                  >
                    CHECK-IN CÁC VÉ ĐÃ CHỌN ({selectedSeatsForCheckin.length})
                  </button>
                  <button 
                    className="btn" 
                    style={{ background: 'var(--primary-teal)', color: '#fff', fontWeight: 'bold' }}
                    onClick={handleCheckinAllBooking}
                  >
                    CHECK-IN TOÀN BỘ CHƯA VÀO
                  </button>
                  <button 
                    className="btn" 
                    style={{ background: '#7f8c8d', color: '#fff' }}
                    onClick={() => {
                      setIsBookingScan(false);
                      setBookingScanData(null);
                    }}
                  >
                    QUAY LẠI
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 3: Traditional Search & Phone lookup (collapsible for backup) */}
            {!qrVerifyResult && !isBookingScan && (
              <div style={{ border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', background: 'var(--bg-card)', padding: '24px' }}>
                <h3 style={{ fontWeight: 800, margin: '0 0 15px' }}>📞 TÌM KIẾM THỦ CÔNG (SĐT / MÃ ĐẶT VÉ CỦU KHÁCH)</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  <input 
                    placeholder="Nhập SĐT khách hàng hoặc mã booking để tra cứu chi tiết..." 
                    value={staffLookupCode} 
                    onChange={e => setStaffLookupCode(e.target.value)} 
                    style={{ flexGrow: 1 }}
                  />
                  <button className="btn" style={{ background: '#333', color: '#fff' }} onClick={() => lookupStaffTickets()}>
                    TRA CỨU LỊCH SỬ VÉ
                  </button>
                </div>

                {/* Multiple Results Switcher */}
                {lookupResults.length > 1 && (
                  <div style={{ background: 'rgba(243, 156, 18, 0.05)', border: '1px solid rgba(243, 156, 18, 0.3)', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                    <h4 style={{ fontWeight: 800, color: '#f39c12', marginBottom: '10px' }}>
                      ⚠️ Tìm thấy {lookupResults.length} giao dịch đặt vé dưới Số điện thoại này:
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {lookupResults.map(res => (
                        <div 
                           key={res.booking.id} 
                           onClick={() => selectBookingResult(res)}
                           style={{ 
                             border: staffActiveBooking?.id === res.booking.id ? '2px solid var(--primary-teal)' : '1px solid rgba(255, 255, 255, 0.05)', 
                             padding: '10px 14px', 
                             borderRadius: '8px', 
                             cursor: 'pointer',
                             background: staffActiveBooking?.id === res.booking.id ? 'rgba(0, 173, 181, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                             display: 'flex',
                             justifyContent: 'space-between',
                             alignItems: 'center'
                           }}
                        >
                          <div>
                            <b>{res.booking.id}</b> - {res.booking.movieTitle}<br/>
                            <span style={{ fontSize: '12px' }} className="muted">
                              📅 {res.booking.time} ({new Date(res.booking.date).toLocaleDateString('vi-VN')})
                            </span>
                          </div>
                          <div>
                            <span style={{ fontSize: '12px', background: '#333', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#fff' }}>
                              {res.booking.seats.length} ghế
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {staffActiveBooking && (
                  <div className="ticket-info-display" style={{ border: '1px solid rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <h4 style={{ fontWeight: 900, borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '10px', marginBottom: '14px' }}>
                      LỊCH SỬ ĐẶT VÉ PHIM (MÃ: {staffActiveBooking.id})
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <div>
                        <p style={{ margin: '4px 0' }}>Khách hàng: <b>{staffActiveBooking.customerName}</b></p>
                        <p style={{ margin: '4px 0' }}>Số điện thoại: <b>{staffActiveBooking.phone || 'N/A'}</b></p>
                        <p style={{ margin: '4px 0' }}>Kênh đặt vé: <b>{staffActiveBooking.createdBy || 'Khách vãng lai'}</b></p>
                      </div>
                      <div>
                        <p style={{ margin: '4px 0' }}>Phim: <b>{staffActiveBooking.movieTitle}</b></p>
                        <p style={{ margin: '4px 0' }}>Suất chiếu: <b>{staffActiveBooking.time} ({new Date(staffActiveBooking.date).toLocaleDateString('vi-VN')})</b></p>
                        <p style={{ margin: '4px 0' }}>Tổng số ghế: <b>{staffActiveBooking.seats.join(', ')}</b></p>
                      </div>
                    </div>

                    <h5 style={{ fontWeight: 800, margin: '14px 0 10px' }}>TỪNG GHẾ THÀNH PHẦN:</h5>
                    <div className="admin-table-wrapper">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Mã Vé Con</th>
                            <th>Vị Trí Ghế</th>
                            <th>Trạng Thái</th>
                            <th>Hành Động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {staffActiveTickets.map(tk => (
                            <tr key={tk.id}>
                              <td><b>{tk.id}</b></td>
                              <td><b style={{ color: 'var(--primary-teal)' }}>{tk.seat}</b></td>
                              <td>
                                <span className={`status-badge ${tk.status}`}>
                                  {tk.status === 'valid' ? 'Còn hạn dùng' : (tk.status === 'used' || tk.status === 'checked_in') ? 'Đã checkin soát vé' : 'Đã hủy / hoàn tiền'}
                                </span>
                              </td>
                              <td>
                                {tk.status === 'valid' ? (
                                  <button className="btn" style={{ background: '#2ecc71', color: '#fff', fontSize: '11px', padding: '6px 14px' }} onClick={() => checkinStaffTicket(tk.id)}>
                                    XÁC NHẬN SOÁT VÉ
                                  </button>
                                ) : (tk.status === 'used' || tk.status === 'checked_in') ? (
                                  <span className="muted" style={{ fontSize: '11px' }}>Checkin lúc {new Date(tk.updatedAt).toLocaleTimeString('vi-VN')}</span>
                                ) : (
                                  <span style={{ color: 'red', fontSize: '11px' }}>Không thể sử dụng</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {staffTab === 'counter-sales' && (
          <div>
            <h1 style={{ fontWeight: 900, marginBottom: '20px' }}>🎟 QUẦY BÁN VÉ TẠI RẠP</h1>
            <p className="muted" style={{ marginBottom: '24px' }}>Bán vé và thu tiền mặt trực tiếp từ khách hàng.</p>

            <div className="admin-form-grid" style={{ marginBottom: '30px', background: 'var(--bg-card)', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
              <div className="form-group">
                <label>Chọn Phim Đang Chiếu</label>
                <select value={staffMovieId} onChange={e => setStaffMovieId(e.target.value)}>
                  <option value="">-- Chọn phim --</option>
                  {nowMovies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Ngày Chiếu</label>
                <select value={staffDate} onChange={e => setStaffDate(e.target.value)}>
                  <option value="">-- Chọn ngày --</option>
                  {dates.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Giờ Suất Chiếu</label>
                <select value={staffTime} onChange={e => setStaffTime(e.target.value)}>
                  <option value="">-- Chọn giờ --</option>
                  {showtimes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                <button className="btn" style={{ background: 'var(--primary-teal)', color: '#fff', height: '46px' }} onClick={openCounterSalesGrid}>
                  LOAD SƠ ĐỒ GHẾ TRỐNG
                </button>
              </div>
            </div>

            {staffMovieId && staffDate && staffTime && (
              <div style={{ background: 'var(--bg-card)', padding: '30px', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                <div className="screen">MÀN HÌNH QUẦY SOÁT</div>
                <div className="seats" style={{ maxWidth: '600px', margin: '0 auto 30px' }}>
                  {allSeats.map(seat => {
                    const isBooked = bookedSeats.includes(seat);
                    const isSelected = staffSeats.includes(seat);
                    const cat = getSeatCategory(seat);
                    return (
                      <button 
                        key={seat}
                        className={`seat ${cat} ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                        disabled={isBooked}
                        onClick={() => {
                          setStaffSeats(old => old.includes(seat) ? old.filter(s => s !== seat) : [...old, seat]);
                        }}
                      >
                        {seat}
                      </button>
                    );
                  })}
                </div>

                <div className="admin-form-grid" style={{ maxWidth: '600px', margin: '0 auto 20px' }}>
                  <div className="form-group">
                    <label>Tên Khách</label>
                    <input value={staffCustomerName} onChange={e => setStaffCustomerName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại thành viên (Nếu có)</label>
                    <input 
                      placeholder="Nhập SĐT để tự động tích điểm" 
                      value={staffPhone} 
                      onChange={e => setStaffPhone(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="booking-summary" style={{ maxWidth: '600px', margin: '0 auto 20px' }}>
                  <span>Ghế đã chọn: <b>{staffSeats.join(', ') || 'Chưa chọn'}</b></span>
                  <span>Tổng thu tiền mặt: <b>{money(computedSalesTotal)}</b></span>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button className="btn" style={{ background: 'linear-gradient(135deg, #00adb5, #00d2c4)', color: '#fff', padding: '12px 40px' }} onClick={executeCounterSales}>
                    XUẤT VÉ & THU TIỀN MẶT
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {staffTab === 'shift-report' && (
          <div>
            <h1 style={{ fontWeight: 900, marginBottom: '20px' }}>📊 BÁO CÁO KẾT QUẢ CA LÀM</h1>
            <p className="muted" style={{ marginBottom: '24px' }}>Số liệu kiểm vé soát cổng và bán vé tích lũy trong phiên làm việc hiện tại được đồng bộ với cơ sở dữ liệu.</p>

            <div className="metrics-grid">
              <div className="metric-card">
                <span>VÉ ĐÃ KIỂM SOÁT (CHECKED-IN)</span>
                <h2>{staffCheckinCount} vé</h2>
              </div>
              <div className="metric-card warning">
                <span>VÉ BÁN RA TẠI QUẦY TRỰC TIẾP</span>
                <h2>{staffSalesCount} vé</h2>
              </div>
              <div className="metric-card danger">
                <span>DOANH THU CA LÀM VIỆC</span>
                <h2>{money(staffShiftRevenue)}</h2>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Styles for scanning simulation */}
      <style>{`
        @keyframes scanLine {
          0% { top: 0; }
          50% { top: 220px; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
}
