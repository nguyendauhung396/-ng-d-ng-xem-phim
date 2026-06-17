// Mobile API client for Metiz Cinema (Inherits all Web endpoints)
const API_BASE = 'http://10.0.2.2:5000/api'; // Use 10.0.2.2 for Android Emulator, or local IP (e.g., 192.168.x.x) for physical devices.

let authToken = '';

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
  };
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Có lỗi xảy ra');
  return data;
}

export const api = {
  setToken: (token) => {
    authToken = token;
  },
  qrConfirm: (payload) => request('/auth/qr/confirm', { method: 'POST', body: JSON.stringify(payload) }),
  // Public Core
  getMovies: (status) => request(`/movies${status ? `?status=${status}` : ''}`),
  getShowtimes: (date) => request(`/showtimes${date ? `?date=${date}` : ''}`),
  getSeats: (movieId, date, time) => request(`/seats?movieId=${movieId}&date=${date}&time=${encodeURIComponent(time)}`),
  createBooking: (payload) => request('/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  getBookingsHistory: (userId) => request(`/bookings?userId=${userId}`),
  contact: (payload) => request('/contact', { method: 'POST', body: JSON.stringify(payload) }),
  
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  
  // Concessions E-Shop & Promo
  getProducts: () => request('/products'),
  getPromotions: () => request('/promotions'),
  createOrder: (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  
  // Staff Portal
  lookupTickets: (code) => request(`/staff/tickets/lookup?code=${encodeURIComponent(code)}`),
  checkinTicket: (payload) => request('/staff/tickets/checkin', { method: 'POST', body: JSON.stringify(payload) }),
  
  // Admin Portal
  adminGetUsers: () => request('/admin/users'),
  adminUpdateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  adminGetRevenue: () => request('/admin/reports/revenue'),
  adminGetAuditLogs: () => request('/admin/audit-logs'),
  
  adminCreateMovie: (payload) => request('/admin/movies', { method: 'POST', body: JSON.stringify(payload) }),
  adminUpdateMovie: (id, payload) => request(`/admin/movies/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  adminDeleteMovie: (id) => request(`/admin/movies/${id}`, { method: 'DELETE' }),
  
  adminCreateShowtime: (payload) => request('/admin/showtimes', { method: 'POST', body: JSON.stringify(payload) }),
  adminDeleteShowtime: (id) => request(`/admin/showtimes/${id}`, { method: 'DELETE' }),

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
