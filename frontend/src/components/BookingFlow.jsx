import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api';

function money(n) {
  return n ? n.toLocaleString('vi-VN') + 'đ' : '0đ';
}

export default function BookingFlow({ 
  booking, 
  onClose, 
  user, 
  bookedSeats, 
  selectedSeats, 
  toggleSeat
}) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  // Loyalty & Voucher states
  const [userVouchers, setUserVouchers] = useState([]);
  const [userLoyalty, setUserLoyalty] = useState(null);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState('');
  const [localVoucherInput, setLocalVoucherInput] = useState('');

  // Load user point balance & eligible vouchers
  useEffect(() => {
    if (user && user.id) {
      api.getLoyaltyMe(user.id)
        .then(data => setUserLoyalty(data))
        .catch(err => console.log('Error loading loyalty data:', err));

      api.getUserVouchers(user.id)
        .then(data => setUserVouchers(data))
        .catch(err => console.log('Error loading user vouchers:', err));
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('🚨 Thời gian giữ ghế đã hết! Hệ thống tự động giải phóng ghế.');
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onClose]);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  const rowsNormal = 'ABCDEFGHIJ'.split('');
  
  const getSeatPrice = (seat) => {
    const row = seat.charAt(0);
    if (row === 'K') return 110000;
    if ('EFGHIJ'.includes(row)) return 75000;
    return 55000;
  };

  const getSeatCategory = (seat) => {
    const row = seat.charAt(0);
    if (row === 'K') return 'couple';
    if ('EFGHIJ'.includes(row)) return 'vip';
    return 'standard';
  };

  const selectedDetails = selectedSeats.map(seat => ({
    seat,
    price: getSeatPrice(seat),
    categoryName: getSeatCategory(seat) === 'couple' ? 'Ghế Couple' : getSeatCategory(seat) === 'vip' ? 'Ghế VIP' : 'Ghế Thường'
  }));

  const baseTicketTotal = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);
  }, [selectedSeats]);

  const handleApplyVoucherCode = async (codeStr) => {
    if (!codeStr) {
      setAppliedVoucher(null);
      setVoucherDiscount(0);
      setVoucherSuccess('');
      setVoucherError('');
      return;
    }
    setVoucherError('');
    setVoucherSuccess('');
    try {
      const res = await api.applyVoucher({
        code: codeStr,
        userId: user ? user.id : null,
        orderAmount: baseTicketTotal
      });
      setAppliedVoucher(res.voucher);
      setVoucherDiscount(res.discount);
      setVoucherSuccess(`Áp dụng mã "${res.voucher.code}" thành công: Giảm ${money(res.discount)}`);
      
      // Auto adjust points used if order balance is exceeded
      const remaining = baseTicketTotal - res.discount;
      if (usePoints) {
        const maxP = Math.min(userLoyalty?.totalPoints || user?.points || 0, Math.floor(remaining / 1000));
        setPointsToUse(maxP);
      }
    } catch (err) {
      setVoucherError(err.message);
      setAppliedVoucher(null);
      setVoucherDiscount(0);
    }
  };

  const handleUsePointsToggle = (checked) => {
    setUsePoints(checked);
    if (checked) {
      const maxP = Math.min(userLoyalty?.totalPoints || user?.points || 0, Math.floor((baseTicketTotal - voucherDiscount) / 1000));
      setPointsToUse(maxP);
    } else {
      setPointsToUse(0);
    }
  };

  const handlePointsChange = (val) => {
    const entered = parseInt(val) || 0;
    const maxP = Math.min(userLoyalty?.totalPoints || user?.points || 0, Math.floor((baseTicketTotal - voucherDiscount) / 1000));
    setPointsToUse(Math.max(0, Math.min(entered, maxP)));
  };

  const pointDiscount = pointsToUse * 1000;
  const finalTotalAmount = Math.max(0, baseTicketTotal - voucherDiscount - pointDiscount);

  // Full integration check-out handler
  const handleConfirmCheckout = async () => {
    if (selectedSeats.length === 0) return alert('Vui lòng chọn ít nhất một ghế!');
    
    try {
      // 1. Create the booking
      const bookingResult = await api.createBooking({
        customerName: user ? user.fullName : 'Khách vãng lai',
        phone: user ? user.phone : '0123456789',
        movieId: booking.movieId,
        date: booking.date,
        time: booking.time,
        seats: selectedSeats,
        userId: user ? user.id : null
      });

      const bookingId = bookingResult.booking.id;

      // 2. Create the payment
      const paymentResult = await api.createPayment({
        bookingId,
        userId: user ? user.id : null,
        paymentMethod: 'cash',
        amountBeforeDiscount: baseTicketTotal,
        voucherCode: appliedVoucher ? appliedVoucher.code : null,
        pointsUsed: pointsToUse
      });

      const paymentId = paymentResult.payment.id;

      // 3. Confirm the payment
      const confirmResult = await api.confirmPayment({
        paymentId,
        staffName: user ? user.fullName : 'System'
      });

      // 4. Show success alerts & milestone vouchers
      let successMsg = `🎉 Đặt vé & Thanh toán thành công!\nMã đặt vé: ${bookingId}\nGhế: ${selectedSeats.join(', ')}\nTổng thanh toán: ${money(paymentResult.payment.finalAmount)}`;
      
      if (confirmResult.voucherAwarded) {
        successMsg += `\n\n🎁 QUÀ TẶNG TRI ÂN THÀNH VIÊN:\nChúc mừng bạn đạt mốc chi tiêu năm mới! Nhận ngay voucher: ${confirmResult.voucherAwarded.name} (${confirmResult.voucherAwarded.code})`;
      }

      alert(successMsg);

      if (onClose) {
        onClose();
      }

      // Reload window to update all dashboard elements (loyalty balance, vouchers, transaction lists)
      window.location.reload();
    } catch (err) {
      alert('Lỗi đặt vé: ' + err.message);
    }
  };

  return (
    <section className="section container" style={{ marginTop: '20px', minHeight: '80vh' }}>
      <div className="booking-steps-bar">
        <div className="booking-step completed">Chọn phim/ suất</div>
        <div className="booking-step active">Chọn ghế</div>
        <div className="booking-step">Chọn Bắp Nước</div>
        <div className="booking-step">Thanh toán</div>
        <div className="booking-step">Xác nhận</div>
      </div>

      <div className="booking-page-layout">
        <div className="seat-selection-card">
          <div className="seat-legend-bar">
            <div className="legend-types">
              <div className="legend-type-item">
                <span className="legend-badge standard">AI</span>
                <span>Ghế Thường</span>
              </div>
              <div className="legend-type-item">
                <span className="legend-badge vip">AI</span>
                <span>Ghế VIP</span>
              </div>
              <div className="legend-type-item">
                <span className="legend-badge couple">AI</span>
                <span>Ghế Couple</span>
              </div>
            </div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>
              Có thể chọn tối đa 10 ghế
            </div>
          </div>

          <div className="booking-screen-arc-container">
            <div className="booking-screen-arc">SCREEN</div>
          </div>

          <div className="booking-seats-grid">
            {rowsNormal.map((row) => (
              <div className="booking-seats-row" key={row}>
                <span className="row-label">{row}</span>
                {Array.from({ length: 22 }, (_, colIdx) => {
                  const colStr = String(colIdx + 1).padStart(2, '0');
                  const seatCode = `${row}${colStr}`;
                  const isBooked = bookedSeats.includes(seatCode);
                  const isSelected = selectedSeats.includes(seatCode);
                  const cat = getSeatCategory(seatCode);
                  
                  return (
                    <button
                      key={seatCode}
                      disabled={isBooked}
                      className={`booking-seat-btn ${cat} ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                      onClick={() => toggleSeat(seatCode)}
                      title={`${seatCode} - ${getSeatPrice(seatCode).toLocaleString()}đ`}
                    >
                      {seatCode}
                    </button>
                  );
                })}
                <span className="row-label">{row}</span>
              </div>
            ))}

            <div className="booking-seats-row" key="K">
              <span className="row-label">K</span>
              {Array.from({ length: 10 }, (_, colIdx) => {
                const colStr = String(colIdx + 1).padStart(2, '0');
                const seatCode = `K${colStr}`;
                const isBooked = bookedSeats.includes(seatCode);
                const isSelected = selectedSeats.includes(seatCode);
                
                return (
                  <button
                    key={seatCode}
                    disabled={isBooked}
                    className={`booking-seat-btn couple ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                    onClick={() => toggleSeat(seatCode)}
                    title={`${seatCode} - 110,000đ`}
                  >
                    {seatCode}
                  </button>
                );
              })}
              <span className="row-label">K</span>
            </div>
          </div>

          <div className="selection-card-footer">
            <div className="zoom-controls">
              <button className="zoom-btn" onClick={() => alert('Đã phóng to màn hình 10%')}>+</button>
              <button className="zoom-btn" onClick={() => alert('Đã thu nhỏ màn hình 10%')}>-</button>
            </div>
            
            <div className="footer-legends">
              <div className="footer-legend-item">
                <span className="legend-color-box selecting"></span>
                <span>Ghế đang chọn</span>
              </div>
              <div className="footer-legend-item">
                <span className="legend-color-box booked"></span>
                <span>Ghế đã bán</span>
              </div>
            </div>

            <div className="footer-stats">
              <div className="stat-item">
                <span>Tổng tiền</span>
                <span>{finalTotalAmount.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="stat-item">
                <span>Thời gian giữ ghế</span>
                <span className="timer-countdown">{minutes}:{seconds}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="booking-info-panel">
          <div className="booking-info-movie-card">
            <div 
              className="booking-info-movie-poster" 
              style={{ backgroundImage: `url(${booking.movie.poster})` }}
            />
            <div className="booking-info-movie-details">
              <h3>{booking.movie.title}</h3>
              <p>Suất chiếu: <b>{booking.time} - {booking.date}</b></p>
              <p>Định dạng: <b>2D</b></p>
              <p>Rạp: <b>{booking.movie.room}</b></p>
              <p style={{ marginTop: '8px' }}>Ghế: <b>{selectedSeats.length ? selectedSeats.join(', ') : 'Chưa chọn'}</b></p>
            </div>
          </div>

          <div className="booking-pricing-summary">
            {selectedDetails.map(({ seat, price, categoryName }) => (
              <div className="booking-price-row" key={seat}>
                <span>{seat} ({categoryName})</span>
                <span>{price.toLocaleString('vi-VN')} đ</span>
              </div>
            ))}

            <div style={{ borderTop: '1px solid #e2e8f0', margin: '12px 0', paddingTop: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary-teal)', textTransform: 'uppercase' }}>🎫 MÃ GIẢM GIÁ / VOUCHER</span>
              
              {user && userVouchers.length > 0 && (
                <div style={{ margin: '8px 0' }}>
                  <select 
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', background: '#fff' }}
                    onChange={(e) => {
                      setLocalVoucherInput(e.target.value);
                      handleApplyVoucherCode(e.target.value);
                    }}
                    value={appliedVoucher ? appliedVoucher.code : ''}
                  >
                    <option value="">-- Chọn voucher từ ví của bạn --</option>
                    {userVouchers.map(v => (
                      <option key={v.id} value={v.code}>
                        {v.code} - {v.name} (Giảm {v.discountType === 'percent' ? `${v.discountValue}%` : money(v.discountValue)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <input 
                  placeholder="Hoặc nhập mã voucher..." 
                  value={localVoucherInput}
                  onChange={e => setLocalVoucherInput(e.target.value)}
                  style={{ flexGrow: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', margin: 0 }}
                />
                <button 
                  className="btn" 
                  style={{ background: '#0f172a', color: '#fff', padding: '0 12px', borderRadius: '6px', fontSize: '12px', width: 'auto' }}
                  onClick={() => handleApplyVoucherCode(localVoucherInput)}
                >
                  ÁP DỤNG
                </button>
              </div>

              {voucherError && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontWeight: 'bold' }}>❌ {voucherError}</p>}
              {voucherSuccess && <p style={{ color: '#10b981', fontSize: '12px', marginTop: '6px', fontWeight: 'bold' }}>✅ {voucherSuccess}</p>}
            </div>

            {user && (
              <div style={{ borderTop: '1px solid #e2e8f0', margin: '12px 0', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#f39c12', textTransform: 'uppercase' }}>🪙 ĐIỂM TÍCH LŨY THÀNH VIÊN</span>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>
                    Số dư: <b>{userLoyalty?.totalPoints ?? user.points} điểm</b> (~{money((userLoyalty?.totalPoints ?? user.points) * 1000)})
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="chkUsePoints" 
                    checked={usePoints} 
                    onChange={e => handleUsePointsToggle(e.target.checked)} 
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="chkUsePoints" style={{ fontSize: '13px', cursor: 'pointer', fontWeight: '600', color: '#334155' }}>
                    Sử dụng điểm tích lũy thanh toán
                  </label>
                </div>

                {usePoints && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Sử dụng:</span>
                    <input 
                      type="number" 
                      min="0"
                      max={Math.min(userLoyalty?.totalPoints ?? user.points, Math.floor((baseTicketTotal - voucherDiscount) / 1000))}
                      value={pointsToUse}
                      onChange={e => handlePointsChange(e.target.value)}
                      style={{ width: '80px', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', textAlign: 'center' }}
                    />
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      điểm (Quy đổi giảm: <b>-{money(pointsToUse * 1000)}</b>)
                    </span>
                  </div>
                )}
              </div>
            )}

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
                <span>Giá vé gốc:</span>
                <span>{money(baseTicketTotal)}</span>
              </div>
              {voucherDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#ef4444', fontWeight: 'bold' }}>
                  <span>Voucher giảm giá:</span>
                  <span>-{money(voucherDiscount)}</span>
                </div>
              )}
              {pointDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#ef4444', fontWeight: 'bold' }}>
                  <span>Điểm tích lũy khấu trừ:</span>
                  <span>-{money(pointDiscount)}</span>
                </div>
              )}
              <div className="booking-price-row total" style={{ marginTop: '5px', border: 'none', paddingTop: 0 }}>
                <span>Tổng thanh toán:</span>
                <b style={{ fontSize: '18px', color: '#d62246' }}>{money(finalTotalAmount)}</b>
              </div>
            </div>
          </div>

          <div className="booking-action-row">
            <button className="booking-action-btn back" onClick={onClose}>
              Quay lại
            </button>
            <button 
              className="booking-action-btn continue" 
              disabled={selectedSeats.length === 0} 
              onClick={handleConfirmCheckout}
            >
              Thanh toán
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
