const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  
  // Try retrieving token from stored metiz_session
  try {
    const stored = localStorage.getItem('metiz_session');
    if (stored) {
      const session = JSON.parse(stored);
      if (session.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
      }
    }
  } catch (e) {
    console.error('Error parsing token from session:', e);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...headers, ...options.headers },
    ...options
  });

  if (res.status === 401 || res.status === 403) {
    const stored = localStorage.getItem('metiz_session');
    if (stored) {
      localStorage.removeItem('metiz_session');
      alert('Phiên làm việc đã hết hạn hoặc không hợp lệ. Hệ thống sẽ chuyển hướng đăng nhập lại.');
      window.location.href = '/';
      return;
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Có lỗi xảy ra');
  return data;
}

export const api = {
  // Public Core
  getMovies: (status) => request(`/movies${status ? `?status=${status}` : ''}`),
  getShowtimes: (date) => request(`/showtimes${date ? `?date=${date}` : ''}`),
  getSeats: ({ movieId, date, time }) => request(`/seats?movieId=${movieId}&date=${date}&time=${encodeURIComponent(time)}`),
  createBooking: (payload) => request('/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  getBookings: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/bookings?${q}`);
  },
  contact: (payload) => request('/contact', { method: 'POST', body: JSON.stringify(payload) }),
  
  // Auth
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  qrCreate: () => request('/auth/qr/create', { method: 'POST' }),
  qrStatus: (token) => request(`/auth/qr/status/${token}`),
  qrConfirm: (payload) => request('/auth/qr/confirm', { method: 'POST', body: JSON.stringify(payload) }),
  qrCancel: (payload) => request('/auth/qr/cancel', { method: 'POST', body: JSON.stringify(payload) }),
  
  // Concessions E-Shop & Promo
  getProducts: () => request('/products'),
  getPromotions: () => request('/promotions'),
  createOrder: (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  
  // Staff Portal
  lookupTickets: (code) => request(`/staff/tickets/lookup?code=${encodeURIComponent(code)}`),
  checkinTicket: (payload) => request('/staff/tickets/checkin', { method: 'POST', body: JSON.stringify(payload) }),
  getShiftReport: () => request('/staff/shift-report'),
  verifyTicketQR: (payload) => request('/staff/tickets/verify', { method: 'POST', body: JSON.stringify(payload) }),
  scanTicketQR: (payload) => request('/staff/tickets/scan', { method: 'POST', body: JSON.stringify(payload) }),
  scanBookingQR: (payload) => request('/staff/bookings/scan', { method: 'POST', body: JSON.stringify(payload) }),
  
  // Admin Portal
  adminGetUsers: () => request('/admin/users'),
  adminUpdateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  adminGetRevenue: () => request('/admin/reports/revenue'),
  adminGetAuditLogs: () => request('/admin/audit-logs'),
  adminRefundBooking: (id) => request(`/admin/bookings/${id}/refund`, { method: 'POST' }),
  adminGetScanLogs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/tickets/scan-logs?${q}`);
  },
  adminGetScanStats: () => request('/admin/tickets/stats'),
  
  adminCreateMovie: (payload) => request('/admin/movies', { method: 'POST', body: JSON.stringify(payload) }),
  adminUpdateMovie: (id, payload) => request(`/admin/movies/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  adminDeleteMovie: (id) => request(`/admin/movies/${id}`, { method: 'DELETE' }),
  
  adminCreateShowtime: (payload) => request('/admin/showtimes', { method: 'POST', body: JSON.stringify(payload) }),
  adminUpdateShowtime: (id, payload) => request(`/admin/showtimes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  adminDeleteShowtime: (id) => request(`/admin/showtimes/${id}`, { method: 'DELETE' }),

  // Banners
  getBanners: () => request('/banners'),
  adminGetBanners: () => request('/admin/banners'),
  adminCreateBanner: (payload) => request('/admin/banners', { method: 'POST', body: JSON.stringify(payload) }),
  adminUpdateBanner: (id, payload) => request(`/admin/banners/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  adminDeleteBanner: (id) => request(`/admin/banners/${id}`, { method: 'DELETE' }),
  adminUpdateBannerStatus: (id, status) => request(`/admin/banners/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  adminReorderBanners: (orders) => request('/admin/banners/reorder', { method: 'PATCH', body: JSON.stringify({ orders }) }),

  // Voucher Management (Admin)
  adminGetVouchers: () => request('/admin/vouchers'),
  adminGetVoucher: (id) => request(`/admin/vouchers/${id}`),
  adminCreateVoucher: (payload) => request('/admin/vouchers', { method: 'POST', body: JSON.stringify(payload) }),
  adminUpdateVoucher: (id, payload) => request(`/admin/vouchers/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  adminDeleteVoucher: (id) => request(`/admin/vouchers/${id}`, { method: 'DELETE' }),
  adminUpdateVoucherStatus: (id, status) => request(`/admin/vouchers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Voucher Management (User)
  getUserVouchers: (userId) => request(`/user/vouchers?userId=${userId}`),
  validateVoucher: (payload) => request('/vouchers/validate', { method: 'POST', body: JSON.stringify(payload) }),
  applyVoucher: (payload) => request('/vouchers/apply', { method: 'POST', body: JSON.stringify(payload) }),

  // Loyalty & Points
  getLoyaltyMe: (userId) => request(`/loyalty/me?userId=${userId}`),
  redeemLoyalty: (payload) => request('/loyalty/redeem', { method: 'POST', body: JSON.stringify(payload) }),
  getLoyaltyTransactions: (userId) => request(`/loyalty/transactions?userId=${userId}`),
  checkMilestone: (userId) => request('/loyalty/check-milestone', { method: 'POST', body: JSON.stringify({ userId }) }),

  // Payment Flow
  createPayment: (payload) => request('/payments/create', { method: 'POST', body: JSON.stringify(payload) }),
  confirmPayment: (payload) => request('/payments/confirm', { method: 'POST', body: JSON.stringify(payload) }),
  cancelPayment: (payload) => request('/payments/cancel', { method: 'POST', body: JSON.stringify(payload) }),
  getPaymentDetail: (id) => request(`/payments/${id}`)
};
