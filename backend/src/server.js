require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const {
  sequelize,
  Movie,
  Showtime,
  Booking,
  BookedSeat,
  User,
  Ticket,
  Payment,
  Product,
  Order,
  Promotion,
  AuditLog,
  Voucher,
  UserVoucher,
  LoyaltyPoint,
  PointTransaction,
  VoucherMilestone,
  QRLoginSession,
  TicketScanLog,
  defaultBooked,
  syncAndSeed
} = require('./db');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET || 'metiz-secret-key-12345';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(morgan('dev'));

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Vui lòng đăng nhập để thực hiện thao tác này' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ' });
    req.user = user;
    next();
  });
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Chưa xác thực người dùng' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này' });
    }
    next();
  };
}

// Helper for seat keys
function seatKey(movieId, date, time) {
  return `${movieId}-${date}-${time}`;
}

// Helper to get seat price based on seat code and room name
function getSeatPrice(seat, roomName = '') {
  const row = seat.charAt(0).toUpperCase();
  if (row === 'K') return 110000; // Couple seat
  if ('EFGHIJ'.includes(row)) return 75000; // VIP rows on web
  if (roomName && roomName.toUpperCase().includes('VIP')) return 75000; // VIP room (mobile / web)
  return 55000; // Standard seat
}

// Helper to process loyalty point transactions and spend milestones
async function processLoyaltyAndMilestones(userId, bookingId, finalAmount, pointDiscountAmount, transaction) {
  let voucherAwarded = null;
  const pointsEarned = Math.floor(finalAmount / 10000);
  
  let lp = await LoyaltyPoint.findOne({ where: { userId }, transaction });
  if (!lp) {
    lp = await LoyaltyPoint.create({
      userId,
      totalPoints: 0,
      totalSpending: 0,
      membershipLevel: 'Standard'
    }, { transaction });
  }

  // Deduct points if points were used/redeemed
  const pointsRedeemed = Math.ceil(pointDiscountAmount / 1000);
  if (pointsRedeemed > 0) {
    lp.totalPoints = Math.max(0, lp.totalPoints - pointsRedeemed);
    await PointTransaction.create({
      userId,
      bookingId,
      transactionType: 'redeem',
      points: pointsRedeemed,
      amountEquivalent: pointDiscountAmount,
      description: `Sử dụng điểm tích lũy thanh toán đơn ${bookingId}`
    }, { transaction });
  }

  // Credit points earned from this transaction
  if (pointsEarned > 0) {
    lp.totalPoints += pointsEarned;
    await PointTransaction.create({
      userId,
      bookingId,
      transactionType: 'earn',
      points: pointsEarned,
      amountEquivalent: 0,
      description: `Tích điểm từ giao dịch ${bookingId}`
    }, { transaction });
  }

  lp.totalSpending += finalAmount;

  if (lp.totalPoints >= 500) {
    lp.membershipLevel = 'Diamond';
  } else if (lp.totalPoints >= 200) {
    lp.membershipLevel = 'Gold';
  } else {
    lp.membershipLevel = 'Standard';
  }
  await lp.save({ transaction });

  const u = await User.findByPk(userId, { transaction });
  if (u) {
    u.points = lp.totalPoints;
    u.tier = `Thành viên ${lp.membershipLevel}`;
    await u.save({ transaction });
  }

  // Check cumulative spending milestones (every 5,000,000đ)
  const milestoneIndex = Math.floor(lp.totalSpending / 5000000);
  if (milestoneIndex > 0) {
    const countAwarded = await VoucherMilestone.count({
      where: { userId, milestoneIndex },
      transaction
    });

    if (countAwarded === 0) {
      const randomCode = `TRIAN5M-${userId}-${milestoneIndex}-${Math.floor(Math.random()*1000)}`;
      const newVoucher = await Voucher.create({
        code: randomCode,
        name: 'Voucher tri ân khách hàng thân thiết',
        description: 'Voucher giảm giá 10% tối đa 100K cho hóa đơn từ 200K trở lên',
        discountType: 'percent',
        discountValue: 10,
        maxDiscountAmount: 100000,
        minOrderAmount: 200000,
        quantity: 1,
        usedCount: 0,
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 10),
        status: 'active',
        createdBy: 'system'
      }, { transaction });

      await UserVoucher.create({
        userId,
        voucherId: newVoucher.id,
        status: 'active',
        assignedAt: new Date(),
        expiredAt: new Date(Date.now() + 30*24*60*60*1000)
      }, { transaction });

      await VoucherMilestone.create({
        userId,
        milestoneAmount: milestoneIndex * 5000000,
        milestoneIndex,
        voucherId: newVoucher.id
      }, { transaction });

      voucherAwarded = newVoucher;

      await AuditLog.create({
        actor: 'system',
        action: 'AWARD_MILESTONE_VOUCHER',
        details: `Tự động cấp voucher tri ân ${randomCode} cho User ${userId} đạt mốc chi tiêu ${milestoneIndex * 5} triệu`
      }, { transaction });
    }
  }

  return voucherAwarded;
}

app.get('/', (req, res) => {
  res.json({ message: 'Metiz Cinema backend is running', api: '/api' });
});

// ==========================================
// 1. AUTHENTICATION & MEMBERSHIP APIS
// ==========================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu' });
    }

    const exist = await User.findOne({ where: { email } });
    if (exist) {
      return res.status(409).json({ message: 'Email này đã được đăng ký tài khoản thành viên' });
    }

    const newUser = await User.create({
      fullName,
      email,
      phone,
      password: bcrypt.hashSync(password, 10),
      role: 'member',
      points: 50, // Welcome points
      tier: 'Thành viên Standard'
    });

    const token = jwt.sign({ id: newUser.id, role: newUser.role, fullName: newUser.fullName }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'Đăng ký tài khoản thành công! Tặng ngay 50 điểm tích lũy.',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        points: newUser.points,
        tier: newUser.tier
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi đăng ký tài khoản: ' + err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ Email và Mật khẩu' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, fullName: user.fullName }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        points: user.points,
        tier: user.tier
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi đăng nhập: ' + err.message });
  }
});

// QR LOGIN APIS
app.post('/api/auth/qr/create', async (req, res) => {
  try {
    const crypto = require('crypto');
    const sessionToken = `QR_LOGIN_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    const expiredAt = new Date(Date.now() + 90 * 1000); // 90 seconds expiration

    const session = await QRLoginSession.create({
      sessionToken,
      status: 'pending',
      expiredAt
    });

    res.status(201).json({
      success: true,
      sessionToken,
      qrUrl: `https://cinema-demo.com/qr-login/confirm?sessionToken=${sessionToken}`,
      expiredAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tạo phiên QR: ' + err.message });
  }
});

app.get('/api/auth/qr/status/:sessionToken', async (req, res) => {
  try {
    const { sessionToken } = req.params;
    const session = await QRLoginSession.findOne({ where: { sessionToken } });
    if (!session) {
      return res.status(404).json({ message: 'Không tìm thấy phiên đăng nhập QR' });
    }

    // Check expiration
    if (session.status === 'pending' && new Date() > session.expiredAt) {
      session.status = 'expired';
      await session.save();
    }

    if (session.status === 'confirmed') {
      // Complete registration on client by issuing JWT token
      session.status = 'used';
      session.usedAt = new Date();
      await session.save();

      const user = await User.findByPk(session.userId);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng xác thực' });
      }

      const token = jwt.sign({ id: user.id, role: user.role, fullName: user.fullName }, JWT_SECRET, { expiresIn: '24h' });

      // Log the login event
      await AuditLog.create({
        actor: user.fullName,
        action: 'QR_LOGIN',
        details: `Đăng nhập nhanh thành công bằng mã QR trên trình duyệt. Vai trò: ${user.role}.`
      });

      return res.json({
        success: true,
        status: 'confirmed',
        accessToken: token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          points: user.points,
          tier: user.tier
        }
      });
    }

    res.json({
      success: true,
      status: session.status
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi kiểm tra trạng thái QR: ' + err.message });
  }
});

app.post('/api/auth/qr/confirm', authenticateToken, async (req, res) => {
  try {
    const { sessionToken, confirm, password } = req.body;
    const session = await QRLoginSession.findOne({ where: { sessionToken } });
    if (!session) {
      return res.status(404).json({ message: 'Không tìm thấy phiên đăng nhập QR' });
    }

    if (session.status !== 'pending' && session.status !== 'scanned') {
      return res.status(400).json({ message: 'Mã QR này đã được sử dụng hoặc hết hạn' });
    }

    if (new Date() > session.expiredAt) {
      session.status = 'expired';
      await session.save();
      return res.status(400).json({ message: 'Mã QR này đã hết hạn sử dụng' });
    }

    // Strict Admin verification
    if (req.user.role === 'admin') {
      if (!password) {
        // Flag to client that admin password verification is required
        return res.json({
          success: false,
          requireAdminVerification: true,
          message: 'Vui lòng xác thực mật khẩu Admin để hoàn tất đăng nhập nhanh.'
        });
      }

      const adminUser = await User.findByPk(req.user.id);
      if (!adminUser || !bcrypt.compareSync(password, adminUser.password)) {
        return res.status(401).json({ message: 'Xác thực tài khoản Admin thất bại. Mật khẩu không đúng.' });
      }
    }

    if (confirm === true) {
      session.status = 'confirmed';
      session.userId = req.user.id;
      session.role = req.user.role;
      session.confirmedAt = new Date();
      session.ipAddress = req.ip || '127.0.0.1';
      session.deviceInfo = req.headers['user-agent'] || 'Mobile App';
      await session.save();

      res.json({
        success: true,
        message: 'Đăng nhập thành công! Phiên làm việc trên máy tính đã được kích hoạt.'
      });
    } else {
      session.status = 'cancelled';
      await session.save();
      res.json({
        success: true,
        message: 'Yêu cầu đăng nhập đã bị từ chối.'
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xác nhận QR: ' + err.message });
  }
});

app.post('/api/auth/qr/cancel', async (req, res) => {
  try {
    const { sessionToken } = req.body;
    const session = await QRLoginSession.findOne({ where: { sessionToken } });
    if (session) {
      session.status = 'cancelled';
      await session.save();
    }
    res.json({ success: true, message: 'Đã hủy phiên QR' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi hủy phiên QR: ' + err.message });
  }
});

// ==========================================
// 2. PRODUCT SHOP & PROMOTIONS APIS
// ==========================================

app.get('/api/products', async (req, res) => {
  try {
    const result = await Product.findAll();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy sản phẩm shop: ' + err.message });
  }
});

app.get('/api/promotions', async (req, res) => {
  try {
    const result = await Promotion.findAll({ where: { status: 'active' } });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy mã khuyến mãi: ' + err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, phone, total, items = [] } = req.body;
    if (!customerName || !phone || items.length === 0) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin đặt hàng' });
    }

    const orderId = `OR${Date.now()}`;
    const order = await Order.create({
      id: orderId,
      customerName,
      phone,
      total,
      status: 'paid',
      items
    });

    res.status(201).json({ message: 'Mua combo bắp nước thành công!', order });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi mua sắm: ' + err.message });
  }
});

// ==========================================
// 3. CORE MOVIE, SHOWTIME, SEAT APIS
// ==========================================

app.get('/api/movies', async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const result = await Movie.findAll({ where });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách phim: ' + err.message });
  }
});

app.get('/api/showtimes', async (req, res) => {
  try {
    const { date, movieId } = req.query;
    const where = {};
    if (date) where.date = date;
    if (movieId) where.movieId = Number(movieId);

    const result = await Showtime.findAll({ where });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy lịch chiếu: ' + err.message });
  }
});

app.get('/api/seats', async (req, res) => {
  try {
    const { movieId, date, time } = req.query;
    if (!movieId || !date || !time) {
      return res.status(400).json({ message: 'Thiếu movieId, date hoặc time' });
    }
    const showtimeId = seatKey(movieId, date, time);
    
    // Find all booked seats in database for this showtime
    const bookedFromDb = await BookedSeat.findAll({
      where: { showtimeId }
    });
    const bookedNames = bookedFromDb.map((bs) => bs.seat);
    
    res.json({ booked: [...new Set([...defaultBooked, ...bookedNames])] });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách ghế: ' + err.message });
  }
});

// Transactional booking creation
app.post('/api/bookings', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { customerName = 'Khách vãng lai', phone = '', movieId, date, time, seats = [], userId } = req.body;
    if (!movieId || !date || !time || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: 'Vui lòng chọn phim, ngày, suất chiếu và ghế' });
    }

    const movie = await Movie.findByPk(Number(movieId), { transaction });
    if (!movie) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }

    const showtimeId = seatKey(movieId, date, time);
    
    // Check if these seats are already booked
    const existingBookings = await BookedSeat.findAll({
      where: { showtimeId, seat: seats },
      transaction
    });

    const isDefaultBooked = seats.some((seat) => defaultBooked.includes(seat));

    if (existingBookings.length > 0 || isDefaultBooked) {
      const duplicated = [
        ...existingBookings.map((eb) => eb.seat),
        ...seats.filter((seat) => defaultBooked.includes(seat))
      ];
      await transaction.rollback();
      return res.status(409).json({
        message: `Ghế đã được đặt mất rồi: ${[...new Set(duplicated)].join(', ')}. Vui lòng chọn ghế khác!`
      });
    }

    // Resolve userId if not provided but phone matches a registered user
    let resolvedUserId = userId ? Number(userId) : null;
    if (!resolvedUserId && phone) {
      const foundUser = await User.findOne({ where: { phone }, transaction });
      if (foundUser) {
        resolvedUserId = foundUser.id;
      }
    }

    // Determine createdBy based on JWT token if available
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let creator = 'Khách vãng lai';
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        creator = decoded.fullName;
      } catch (e) {}
    } else if (req.body.createdBy) {
      creator = req.body.createdBy;
    } else if (resolvedUserId) {
      // If registered member booked directly online, they are the creator
      const foundUser = await User.findByPk(resolvedUserId, { transaction });
      if (foundUser) creator = foundUser.fullName;
    }

    const amountBeforeDiscount = seats.reduce((sum, seat) => sum + getSeatPrice(seat, movie.room), 0);
    const isSingleStage = (req.body.total !== undefined);
    const bookingTotal = isSingleStage ? Number(req.body.total) : amountBeforeDiscount;
    const bookingId = `BK${Date.now()}`;

    // Create Booking
    const booking = await Booking.create({
      id: bookingId,
      customerName,
      phone,
      movieId: Number(movieId),
      movieTitle: movie.title,
      date,
      time,
      seats,
      total: bookingTotal,
      userId: resolvedUserId,
      createdBy: creator
    }, { transaction });

    // Create BookedSeat records
    const bookedSeatsData = seats.map((seat) => ({ showtimeId, seat }));
    await BookedSeat.bulkCreate(bookedSeatsData, { transaction });

    // Create individual Ticket records for check-in scanning
    const ticketsData = seats.map((seat) => ({
      id: `TK-${bookingId}-${seat}`,
      bookingId,
      seat,
      qrCode: `TK-${bookingId}-${seat}`,
      status: 'valid'
    }));
    await Ticket.bulkCreate(ticketsData, { transaction });

    // Create Payment record according to stage
    if (isSingleStage) {
      await Payment.create({
        bookingId,
        userId: resolvedUserId,
        paymentCode: `PM${Date.now()}`,
        paymentMethod: 'cash',
        amountBeforeDiscount,
        voucherDiscountAmount: Math.max(0, amountBeforeDiscount - bookingTotal),
        pointDiscountAmount: 0,
        finalAmount: bookingTotal,
        paymentStatus: 'paid',
        paidAt: new Date()
      }, { transaction });

      // Process loyalty points and milestones immediately for single-stage auto-paid bookings (e.g. mobile/staff)
      if (resolvedUserId) {
        await processLoyaltyAndMilestones(resolvedUserId, bookingId, bookingTotal, 0, transaction);
      }
    } else {
      // For multi-stage web flow, create a pending payment that will be detailed and confirmed later
      await Payment.create({
        bookingId,
        userId: resolvedUserId,
        paymentCode: `PM${Date.now()}`,
        paymentMethod: 'cash',
        amountBeforeDiscount,
        voucherDiscountAmount: 0,
        pointDiscountAmount: 0,
        finalAmount: amountBeforeDiscount,
        paymentStatus: 'pending',
        paidAt: new Date()
      }, { transaction });
    }

    await transaction.commit();
    res.status(201).json({ message: 'Đặt vé thành công! Dữ liệu đã được lưu trữ an toàn.', booking });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ message: 'Lỗi đặt vé hệ thống: ' + err.message });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const { userId, phone } = req.query;
    const where = {};
    if (userId) where.userId = Number(userId);
    if (phone) where.phone = phone;

    const result = await Booking.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy lịch sử đặt vé: ' + err.message });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, phone, message } = req.body;
    if (!name || !phone) return res.status(400).json({ message: 'Vui lòng nhập họ tên và số điện thoại' });
    
    // Save contact record in AuditLog as simulated mailbox
    await AuditLog.create({
      actor: name,
      action: 'SEND_CONTACT',
      details: `Khách liên hệ hỗ trợ: SĐT ${phone} - Nội dung: "${message || ''}"`
    });

    res.status(201).json({ message: 'Đã gửi yêu cầu liên hệ thành công. Chúng tôi sẽ phản hồi sớm nhất!', contact: { name, phone, message } });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi gửi ý kiến liên hệ: ' + err.message });
  }
});

// ==========================================
// 4. STAFF APIS (TICKET LOOKUP & CHECK-IN)
// ==========================================

app.get('/api/staff/tickets/lookup', authenticateToken, requireRole(['staff', 'admin']), async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ message: 'Vui lòng nhập mã tra cứu (mã booking hoặc SĐT)' });

    const trimmedCode = code.trim();
    const isBookingId = trimmedCode.toUpperCase().startsWith('BK');
    let bookings = [];

    if (isBookingId) {
      const booking = await Booking.findOne({ where: { id: trimmedCode.toUpperCase() } });
      if (booking) bookings.push(booking);
    } else {
      bookings = await Booking.findAll({
        where: { phone: trimmedCode },
        order: [['createdAt', 'DESC']]
      });
    }

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin đặt vé phù hợp' });
    }

    const results = [];
    for (const booking of bookings) {
      const tickets = await Ticket.findAll({ where: { bookingId: booking.id } });
      results.push({ booking, tickets });
    }

    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tra cứu vé: ' + err.message });
  }
});

app.post('/api/staff/tickets/checkin', authenticateToken, requireRole(['staff', 'admin']), async (req, res) => {
  try {
    const { ticketId, ticketCode } = req.body;
    const targetId = ticketId || ticketCode;
    const staffName = req.user.fullName;
    if (!targetId) return res.status(400).json({ message: 'Thiếu mã Ticket' });

    const ticket = await Ticket.findByPk(targetId);
    if (!ticket) {
      await TicketScanLog.create({
        staffId: req.user.id,
        scanResult: 'failed',
        reason: 'Không tìm thấy vé trong hệ thống',
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip
      });
      return res.status(404).json({ message: 'Không tìm thấy vé trong hệ thống' });
    }

    if (ticket.status === 'used' || ticket.status === 'checked_in') {
      await TicketScanLog.create({
        ticketId: ticket.id,
        bookingId: ticket.bookingId,
        staffId: req.user.id,
        scanResult: 'failed',
        reason: 'Vé đã được sử dụng',
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip
      });
      return res.status(400).json({
        message: `Vé này đã được soát trước đó vào lúc ${new Date(ticket.checkedInAt).toLocaleTimeString('vi-VN')} bởi ${ticket.checkedInBy}`
      });
    }

    // Mark as checked_in
    ticket.status = 'checked_in';
    ticket.checkedInAt = new Date();
    ticket.checkedInBy = staffName;
    await ticket.save();

    // Log in TicketScanLog
    await TicketScanLog.create({
      ticketId: ticket.id,
      bookingId: ticket.bookingId,
      staffId: req.user.id,
      scanResult: 'success',
      reason: 'Check-in thành công',
      deviceInfo: req.headers['user-agent'],
      ipAddress: req.ip
    });

    // Log the check-in event in AuditLog
    await AuditLog.create({
      actor: staffName,
      action: 'CHECKIN_TICKET',
      details: `Soát vé thành công: Vé ${ticket.id} (Ghế ${ticket.seat}) của booking ${ticket.bookingId}`
    });

    res.json({ message: 'Soát vé & Check-in thành công!', ticket });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi check-in: ' + err.message });
  }
});

app.post('/api/staff/tickets/verify', authenticateToken, requireRole(['staff', 'admin']), async (req, res) => {
  try {
    const { qrCode } = req.body;
    if (!qrCode) return res.status(400).json({ message: 'Thiếu mã QR hoặc mã vé' });

    const trimmed = qrCode.trim();
    let ticket = await Ticket.findOne({ where: { qrCode: trimmed } });
    if (!ticket) {
      ticket = await Ticket.findByPk(trimmed);
    }

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Mã QR không tồn tại trong hệ thống. Vui lòng kiểm tra lại vé hoặc liên hệ quầy hỗ trợ.'
      });
    }

    const booking = await Booking.findByPk(ticket.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy booking tương ứng.' });
    }

    const movie = await Movie.findByPk(booking.movieId);

    res.json({
      success: true,
      message: 'Vé hợp lệ.',
      data: {
        ticketCode: ticket.id,
        bookingCode: booking.id,
        movieName: booking.movieTitle,
        showDate: booking.date,
        showTime: booking.time,
        roomName: movie ? movie.room : 'Phòng chiếu',
        seatName: ticket.seat,
        status: ticket.status,
        customerName: booking.customerName
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xác thực vé: ' + err.message });
  }
});

app.post('/api/staff/tickets/scan', authenticateToken, requireRole(['staff', 'admin']), async (req, res) => {
  try {
    const { qrCode } = req.body;
    if (!qrCode) return res.status(400).json({ message: 'Thiếu mã QR hoặc mã vé' });

    const trimmed = qrCode.trim();
    let ticket = await Ticket.findOne({ where: { qrCode: trimmed } });
    if (!ticket) {
      ticket = await Ticket.findByPk(trimmed);
    }

    if (!ticket) {
      await TicketScanLog.create({
        staffId: req.user.id,
        scanResult: 'failed',
        reason: 'Mã QR không tồn tại',
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip
      });
      return res.status(404).json({
        success: false,
        message: 'Mã QR không tồn tại trong hệ thống. Vui lòng kiểm tra lại vé hoặc liên hệ quầy hỗ trợ.'
      });
    }

    const booking = await Booking.findByPk(ticket.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy booking tương ứng.' });
    }

    const payment = await Payment.findOne({ where: { bookingId: booking.id } });
    const movie = await Movie.findByPk(booking.movieId);

    const isPaid = payment ? payment.paymentStatus === 'paid' : (booking.createdBy && booking.createdBy !== 'Khách vãng lai');
    if (!isPaid) {
      await TicketScanLog.create({
        ticketId: ticket.id,
        bookingId: booking.id,
        staffId: req.user.id,
        scanResult: 'failed',
        reason: 'Vé chưa được thanh toán',
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip
      });
      return res.status(400).json({ success: false, message: 'Vé chưa được thanh toán.' });
    }

    if (ticket.status === 'cancelled') {
      await TicketScanLog.create({
        ticketId: ticket.id,
        bookingId: booking.id,
        staffId: req.user.id,
        scanResult: 'failed',
        reason: 'Vé đã bị hủy',
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip
      });
      return res.status(400).json({ success: false, message: 'Vé đã bị hủy.' });
    }

    if (ticket.status === 'refunded') {
      await TicketScanLog.create({
        ticketId: ticket.id,
        bookingId: booking.id,
        staffId: req.user.id,
        scanResult: 'failed',
        reason: 'Vé đã hoàn tiền',
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip
      });
      return res.status(400).json({ success: false, message: 'Vé đã hoàn tiền.' });
    }

    if (ticket.status === 'checked_in' || ticket.status === 'used') {
      await TicketScanLog.create({
        ticketId: ticket.id,
        bookingId: booking.id,
        staffId: req.user.id,
        scanResult: 'failed',
        reason: 'Vé đã được sử dụng',
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip
      });
      return res.status(400).json({
        success: false,
        message: 'Vé đã được sử dụng.',
        data: {
          ticketCode: ticket.id,
          checkedInAt: ticket.checkedInAt ? new Date(ticket.checkedInAt).toLocaleString('vi-VN') : '',
          checkedInBy: ticket.checkedInBy
        }
      });
    }

    const todayStr = new Date().toLocaleDateString('en-CA');
    if (booking.date !== todayStr && req.user.role !== 'admin') {
      await TicketScanLog.create({
        ticketId: ticket.id,
        bookingId: booking.id,
        staffId: req.user.id,
        scanResult: 'failed',
        reason: `Vé sai ngày chiếu: ${booking.date} (Hôm nay: ${todayStr})`,
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip
      });
      return res.status(400).json({
        success: false,
        message: `Vé không đúng ngày chiếu hôm nay. Ngày chiếu của vé: ${booking.date}`
      });
    }

    if (req.user.role !== 'admin') {
      const [showHour, showMin] = booking.time.split(':').map(Number);
      const showDateTime = new Date(booking.date);
      showDateTime.setHours(showHour, showMin, 0, 0);

      const now = new Date();
      const diffMs = now.getTime() - showDateTime.getTime();
      const diffMins = diffMs / (60 * 1000);

      if (diffMins < -60) {
        await TicketScanLog.create({
          ticketId: ticket.id,
          bookingId: booking.id,
          staffId: req.user.id,
          scanResult: 'failed',
          reason: 'Chưa đến thời gian check-in',
          deviceInfo: req.headers['user-agent'],
          ipAddress: req.ip
        });
        return res.status(400).json({ success: false, message: 'Chưa đến thời gian check-in.' });
      }

      if (diffMins > 30) {
        await TicketScanLog.create({
          ticketId: ticket.id,
          bookingId: booking.id,
          staffId: req.user.id,
          scanResult: 'failed',
          reason: 'Đã quá thời gian check-in',
          deviceInfo: req.headers['user-agent'],
          ipAddress: req.ip
        });
        return res.status(400).json({ success: false, message: 'Đã quá thời gian check-in.' });
      }
    }

    ticket.status = 'checked_in';
    ticket.checkedInAt = new Date();
    ticket.checkedInBy = req.user.fullName;
    await ticket.save();

    await TicketScanLog.create({
      ticketId: ticket.id,
      bookingId: booking.id,
      staffId: req.user.id,
      scanResult: 'success',
      reason: 'Check-in thành công',
      deviceInfo: req.headers['user-agent'],
      ipAddress: req.ip
    });

    await AuditLog.create({
      actor: req.user.fullName,
      action: 'CHECKIN_QR_TICKET',
      details: `Soát vé QR thành công: Vé ${ticket.id} (Ghế ${ticket.seat}) của booking ${booking.id}`
    });

    res.json({
      success: true,
      message: 'Check-in thành công. Cho phép khách vào rạp.',
      data: {
        ticketCode: ticket.id,
        bookingCode: booking.id,
        movieName: booking.movieTitle,
        showDate: booking.date,
        showTime: booking.time,
        roomName: movie ? movie.room : 'Phòng chiếu',
        seatName: ticket.seat,
        customerName: booking.customerName,
        checkedInAt: new Date(ticket.checkedInAt).toLocaleString('vi-VN')
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi check-in quét QR: ' + err.message });
  }
});

app.post('/api/staff/bookings/scan', authenticateToken, requireRole(['staff', 'admin']), async (req, res) => {
  try {
    const { bookingCode } = req.body;
    if (!bookingCode) return res.status(400).json({ message: 'Thiếu mã đơn hàng bookingCode' });

    const trimmed = bookingCode.trim().toUpperCase();
    const booking = await Booking.findByPk(trimmed);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy booking trong hệ thống.' });
    }

    const tickets = await Ticket.findAll({ where: { bookingId: booking.id } });
    const movie = await Movie.findByPk(booking.movieId);

    res.json({
      success: true,
      booking: {
        bookingCode: booking.id,
        customerName: booking.customerName,
        movieName: booking.movieTitle,
        showDate: booking.date,
        showTime: booking.time,
        roomName: movie ? movie.room : 'Phòng chiếu'
      },
      tickets: tickets.map(t => ({
        ticketCode: t.id,
        seatName: t.seat,
        status: t.status
      }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi quét booking: ' + err.message });
  }
});

app.get('/api/admin/tickets/scan-logs', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { scanResult, staffId, ticketId, bookingId } = req.query;
    const where = {};
    if (scanResult) where.scanResult = scanResult;
    if (staffId) where.staffId = Number(staffId);
    if (ticketId) where.ticketId = ticketId;
    if (bookingId) where.bookingId = bookingId;

    const logs = await TicketScanLog.findAll({
      where,
      include: [{ model: User, as: 'Staff', attributes: ['fullName', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tải lịch sử quét vé: ' + err.message });
  }
});

app.get('/api/admin/tickets/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const totalSold = await Ticket.count();
    const totalCheckedIn = await Ticket.count({ where: { status: ['checked_in', 'used'] } });
    const totalPending = totalSold - totalCheckedIn;
    const totalRejected = await TicketScanLog.count({ where: { scanResult: 'failed' } });

    res.json({
      totalSold,
      totalCheckedIn,
      totalPending,
      totalRejected
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tải thống kê soát vé: ' + err.message });
  }
});

//

app.get('/api/staff/shift-report', authenticateToken, requireRole(['staff', 'admin']), async (req, res) => {
  try {
    const staffName = req.user.fullName;

    // Count tickets checked in by this staff
    const checkinCount = await Ticket.count({
      where: {
        checkedInBy: staffName,
        status: ['used', 'checked_in']
      }
    });

    // Find bookings created by this staff (at the counter)
    const bookings = await Booking.findAll({
      where: { createdBy: staffName }
    });

    let salesCount = 0;
    let revenue = 0;
    bookings.forEach(b => {
      salesCount += b.seats.length;
      revenue += b.total;
    });

    res.json({
      checkinCount,
      salesCount,
      revenue
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tải báo cáo ca làm: ' + err.message });
  }
});

// ==========================================
// 5. ADMIN MANAGEMENT APIS
// ==========================================

// CRUD Movies
app.post('/api/admin/movies', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    await AuditLog.create({
      actor: req.user.fullName,
      action: 'CREATE_MOVIE',
      details: `Thêm phim mới thành công: ${movie.title}`
    });
    res.status(201).json(movie);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi thêm phim: ' + err.message });
  }
});

app.put('/api/admin/movies/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const movie = await Movie.findByPk(Number(req.params.id));
    if (!movie) return res.status(404).json({ message: 'Không tìm thấy phim' });
    await movie.update(req.body);
    await AuditLog.create({
      actor: req.user.fullName,
      action: 'UPDATE_MOVIE',
      details: `Cập nhật phim thành công: ${movie.title}`
    });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật phim: ' + err.message });
  }
});

app.delete('/api/admin/movies/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const movie = await Movie.findByPk(Number(req.params.id));
    if (!movie) return res.status(404).json({ message: 'Không tìm thấy phim' });

    // Block deletion of movies with existing bookings
    const bookingCount = await Booking.count({ where: { movieId: movie.id } });
    if (bookingCount > 0) {
      return res.status(400).json({ message: 'Không thể xóa phim này vì đã có giao dịch đặt vé của khách hàng!' });
    }

    await movie.destroy();
    await AuditLog.create({
      actor: req.user.fullName,
      action: 'DELETE_MOVIE',
      details: `Xóa phim thành công: ${movie.title}`
    });
    res.json({ message: 'Xóa phim thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xóa phim: ' + err.message });
  }
});

// CRUD Showtimes
app.post('/api/admin/showtimes', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { movieId, date, time, price = 55000 } = req.body;
    const movie = await Movie.findByPk(Number(movieId));
    if (!movie) return res.status(404).json({ message: 'Không tìm thấy phim tương ứng' });

    const id = `${movieId}-${date}-${time}`;
    
    // Check collision duration check
    function timeToMinutes(timeStr) {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    }

    const existingShowtimes = await Showtime.findAll({ where: { date, room: movie.room } });
    const newDuration = parseInt(movie.duration) || 120;
    const newStart = timeToMinutes(time);
    const newEnd = newStart + newDuration + 15; // 15 mins cleaning time

    for (const ext of existingShowtimes) {
      const extMovie = await Movie.findByPk(ext.movieId);
      const extDuration = extMovie ? (parseInt(extMovie.duration) || 120) : 120;
      const extStart = timeToMinutes(ext.time);
      const extEnd = extStart + extDuration + 15;

      // Check overlap: max(start1, start2) < min(end1, end2)
      if (Math.max(newStart, extStart) < Math.min(newEnd, extEnd)) {
        return res.status(409).json({
          message: `Xung đột lịch chiếu! Phòng "${movie.room}" đang có phim "${ext.movieTitle}" chiếu từ ${ext.time} (kéo dài đến ${Math.floor(extEnd/60)}:${String(extEnd%60).padStart(2, '0')} bao gồm dọn phòng).`
        });
      }
    }

    const showtime = await Showtime.create({
      id,
      movieId: movie.id,
      movieTitle: movie.title,
      date,
      time,
      room: movie.room,
      price
    });

    await AuditLog.create({
      actor: req.user.fullName,
      action: 'CREATE_SHOWTIME',
      details: `Thêm lịch chiếu mới: ${movie.title} ngày ${date} lúc ${time}`
    });

    res.status(201).json(showtime);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi thêm lịch chiếu: ' + err.message });
  }
});

app.delete('/api/admin/showtimes/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const showtime = await Showtime.findByPk(req.params.id);
    if (!showtime) return res.status(404).json({ message: 'Không tìm thấy suất chiếu' });
    
    // Check if tickets are already booked
    const bookedCount = await BookedSeat.count({ where: { showtimeId: showtime.id } });
    if (bookedCount > 0) {
      return res.status(400).json({ message: 'Không thể xóa suất chiếu đã bán vé cho khách hàng!' });
    }

    await showtime.destroy();
    await AuditLog.create({
      actor: req.user.fullName,
      action: 'DELETE_SHOWTIME',
      details: `Xóa lịch chiếu: ${showtime.movieTitle} - ${showtime.id}`
    });
    res.json({ message: 'Xóa suất chiếu thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xóa suất chiếu: ' + err.message });
  }
});

// Admin Reports (Sales & Activity summaries)
app.get('/api/admin/reports/revenue', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const totalBookings = await Booking.count();
    const totalPayments = await Payment.sum('finalAmount') || 0; // Fix to use finalAmount (since amount isn't defined)
    const totalMembers = await User.count({ where: { role: 'member' } });
    const totalConcessions = await Order.sum('total') || 0;

    // Aggregate bookings by movie
    const bookings = await Booking.findAll();
    const movieSales = {};
    bookings.forEach((b) => {
      movieSales[b.movieTitle] = (movieSales[b.movieTitle] || 0) + b.total;
    });

    const formattedMovieSales = Object.entries(movieSales).map(([movie, revenue]) => ({
      movie,
      revenue
    }));

    res.json({
      summary: {
        totalBookings,
        totalRevenue: totalPayments + totalConcessions,
        concessionsRevenue: totalConcessions,
        totalMembers
      },
      movieSales: formattedMovieSales
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tổng hợp báo cáo: ' + err.message });
  }
});

// Audit Log access
app.get('/api/admin/audit-logs', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const logs = await AuditLog.findAll({ order: [['createdAt', 'DESC']] });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy nhật ký hệ thống: ' + err.message });
  }
});

// Accounts access and management
app.get('/api/admin/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const users = await User.findAll({ order: [['role', 'ASC'], ['fullName', 'ASC']] });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách tài khoản: ' + err.message });
  }
});

app.put('/api/admin/users/:id/role', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByPk(Number(req.params.id));
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });

    const oldRole = user.role;
    user.role = role;
    if (role === 'admin') user.tier = 'Quản trị viên';
    else if (role === 'staff') user.tier = 'Nhân viên rạp';
    else user.tier = 'Thành viên Standard';

    await user.save();

    await AuditLog.create({
      actor: req.user.fullName,
      action: 'CHANGE_USER_ROLE',
      details: `Thay đổi quyền hạn: ${user.fullName} từ ${oldRole} thành ${role}`
    });

    res.json({ message: 'Cập nhật phân quyền người dùng thành công', user });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi phân quyền tài khoản: ' + err.message });
  }
});

// Admin Refund Booking API
app.post('/api/admin/bookings/:id/refund', authenticateToken, requireRole(['admin']), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findByPk(bookingId, { transaction });
    if (!booking) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Không tìm thấy booking' });
    }

    // Check if already refunded
    const payment = await Payment.findOne({ where: { bookingId }, transaction });
    if (payment && payment.paymentStatus === 'refunded') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Đơn hàng này đã được hoàn tiền trước đó' });
    }

    // Release booked seats
    const showtimeId = seatKey(booking.movieId, booking.date, booking.time);
    await BookedSeat.destroy({
      where: { showtimeId, seat: booking.seats },
      transaction
    });

    // Mark tickets as cancelled
    await Ticket.update(
      { status: 'cancelled' },
      { where: { bookingId }, transaction }
    );

    // Update payment status to refunded
    if (payment) {
      payment.paymentStatus = 'refunded';
      await payment.save({ transaction });
    }

    // Refund loyalty points if used
    if (payment && payment.pointDiscountAmount > 0 && booking.userId) {
      const pointsRedeemed = Math.ceil(payment.pointDiscountAmount / 1000);
      let lp = await LoyaltyPoint.findOne({ where: { userId: booking.userId }, transaction });
      if (lp) {
        lp.totalPoints += pointsRedeemed;
        lp.totalSpending = Math.max(0, lp.totalSpending - payment.finalAmount);
        await lp.save({ transaction });

        await PointTransaction.create({
          userId: booking.userId,
          bookingId,
          transactionType: 'refund',
          points: pointsRedeemed,
          amountEquivalent: payment.pointDiscountAmount,
          description: `Hoàn điểm từ giao dịch bị hủy ${bookingId}`
        }, { transaction });

        const u = await User.findByPk(booking.userId, { transaction });
        if (u) {
          u.points = lp.totalPoints;
          await u.save({ transaction });
        }
      }
    }

    // Deduct points earned if earned
    if (payment && payment.finalAmount > 0 && booking.userId) {
      const pointsEarned = Math.floor(payment.finalAmount / 10000);
      if (pointsEarned > 0) {
        let lp = await LoyaltyPoint.findOne({ where: { userId: booking.userId }, transaction });
        if (lp) {
          lp.totalPoints = Math.max(0, lp.totalPoints - pointsEarned);
          await lp.save({ transaction });

          await PointTransaction.create({
            userId: booking.userId,
            bookingId,
            transactionType: 'adjust',
            points: -pointsEarned,
            amountEquivalent: 0,
            description: `Khấu trừ điểm đã tích từ giao dịch bị hủy ${bookingId}`
          }, { transaction });

          const u = await User.findByPk(booking.userId, { transaction });
          if (u) {
            u.points = lp.totalPoints;
            await u.save({ transaction });
          }
        }
      }
    }

    await AuditLog.create({
      actor: req.user.fullName,
      action: 'REFUND_BOOKING',
      details: `Hoàn tiền & hủy vé thành công cho Booking ${bookingId}. Trả lại các ghế ${booking.seats.join(', ')}.`
    }, { transaction });

    await transaction.commit();
    res.json({ message: 'Hoàn tiền & hủy vé thành công! Ghế đã được giải phóng.' });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ message: 'Lỗi hoàn tiền: ' + err.message });
  }
});

// ==========================================
// 6. ADMIN & USER VOUCHER APIS (NEW)
// ==========================================

app.get('/api/admin/vouchers', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const list = await Voucher.findAll({ paranoid: false });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách voucher: ' + err.message });
  }
});

app.get('/api/admin/vouchers/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const item = await Voucher.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Voucher không tồn tại' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết voucher: ' + err.message });
  }
});

app.post('/api/admin/vouchers', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { code, name, description, discountType, discountValue, maxDiscountAmount, minOrderAmount, quantity, startDate, endDate } = req.body;
    if (!code || !name || !discountType || discountValue === undefined || quantity === undefined || !startDate || !endDate) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc' });
    }
    if (discountValue <= 0) return res.status(400).json({ message: 'Giá trị giảm giá phải lớn hơn 0' });
    if (discountType === 'percent' && discountValue > 100) return res.status(400).json({ message: 'Phần trăm giảm giá không được vượt quá 100%' });
    if (quantity < 1) return res.status(400).json({ message: 'Số lượng voucher phải lớn hơn hoặc bằng 1' });
    if (new Date(startDate) > new Date(endDate)) return res.status(400).json({ message: 'Ngày bắt đầu không được lớn hơn ngày kết thúc' });

    // Check unique code
    const exist = await Voucher.findOne({ where: { code: code.toUpperCase().trim() } });
    if (exist) return res.status(409).json({ message: 'Mã voucher này đã tồn tại trong hệ thống' });

    const item = await Voucher.create({
      code: code.toUpperCase().trim(),
      name,
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderAmount: minOrderAmount || 0,
      quantity,
      usedCount: 0,
      startDate,
      endDate,
      status: 'active',
      createdBy: req.user.fullName
    });

    await AuditLog.create({
      actor: req.user.fullName,
      action: 'CREATE_VOUCHER',
      details: `Tạo voucher mới: ${item.code} (${item.name})`
    });

    res.status(201).json({ message: 'Tạo voucher thành công!', voucher: item });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tạo voucher: ' + err.message });
  }
});

app.put('/api/admin/vouchers/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const item = await Voucher.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Voucher không tồn tại' });
    
    const { name, description, startDate, endDate, quantity, status, minOrderAmount } = req.body;
    
    if (item.usedCount > 0) {
      if (req.body.code && req.body.code !== item.code) {
        return res.status(400).json({ message: 'Voucher đã được sử dụng, không thể sửa Mã voucher' });
      }
      if (req.body.discountType && req.body.discountType !== item.discountType) {
        return res.status(400).json({ message: 'Voucher đã được sử dụng, không thể sửa Loại giảm giá' });
      }
      if (req.body.discountValue !== undefined && req.body.discountValue !== item.discountValue) {
        return res.status(400).json({ message: 'Voucher đã được sử dụng, không thể sửa Giá trị giảm giá' });
      }
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'Ngày bắt đầu không được lớn hơn ngày kết thúc' });
    }

    await item.update({
      name: name || item.name,
      description: description || item.description,
      startDate: startDate || item.startDate,
      endDate: endDate || item.endDate,
      quantity: quantity !== undefined ? quantity : item.quantity,
      status: status || item.status,
      minOrderAmount: minOrderAmount !== undefined ? minOrderAmount : item.minOrderAmount
    });

    await AuditLog.create({
      actor: req.user.fullName,
      action: 'UPDATE_VOUCHER',
      details: `Cập nhật voucher: ${item.code}`
    });

    res.json({ message: 'Cập nhật voucher thành công!', voucher: item });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật voucher: ' + err.message });
  }
});

app.delete('/api/admin/vouchers/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const item = await Voucher.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Voucher không tồn tại' });

    if (item.usedCount > 0) {
      item.status = 'inactive';
      await item.save();
      await AuditLog.create({
        actor: req.user.fullName,
        action: 'DEACTIVATE_VOUCHER',
        details: `Hệ thống chuyển trạng thái voucher ${item.code} sang 'Ngừng hoạt động' vì đã có lượt sử dụng`
      });
      return res.json({ message: 'Voucher đã được sử dụng nên hệ thống tự chuyển sang trạng thái Ngừng hoạt động.' });
    } else {
      await item.destroy();
      await AuditLog.create({
        actor: req.user.fullName,
        action: 'DELETE_VOUCHER',
        details: `Xóa mềm voucher thành công: ${item.code}`
      });
      return res.json({ message: 'Xóa voucher thành công (xóa mềm).' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xóa voucher: ' + err.message });
  }
});

app.patch('/api/admin/vouchers/:id/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { status } = req.body;
    const item = await Voucher.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Voucher không tồn tại' });
    item.status = status;
    await item.save();

    await AuditLog.create({
      actor: req.user.fullName,
      action: 'UPDATE_VOUCHER_STATUS',
      details: `Cập nhật trạng thái voucher ${item.code} sang ${status}`
    });

    res.json({ message: 'Cập nhật trạng thái thành công', voucher: item });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật trạng thái voucher: ' + err.message });
  }
});

app.get('/api/user/vouchers', async (req, res) => {
  try {
    const { userId } = req.query;
    const publicVouchers = await Voucher.findAll({ where: { status: 'active' } });
    
    let personalVouchers = [];
    if (userId) {
      const uvRelations = await UserVoucher.findAll({ where: { userId: Number(userId), status: 'active' } });
      const assignedIds = uvRelations.map(r => r.voucherId);
      personalVouchers = await Voucher.findAll({ where: { id: assignedIds } });
    }

    const allVouchers = [...publicVouchers, ...personalVouchers];
    const uniqueVouchers = Array.from(new Map(allVouchers.map(v => [v.code, v])).values());
    res.json(uniqueVouchers);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy voucher người dùng: ' + err.message });
  }
});

app.post('/api/vouchers/validate', async (req, res) => {
  try {
    const { code, userId, orderAmount } = req.body;
    if (!code) return res.status(400).json({ message: 'Vui lòng cung cấp mã voucher' });

    const voucher = await Voucher.findOne({
      where: { code: code.toUpperCase().trim(), status: 'active' }
    });

    if (!voucher) return res.status(404).json({ message: 'Mã giảm giá không tồn tại hoặc đã bị khóa' });

    const nowStr = new Date().toISOString().slice(0, 10);
    if (voucher.startDate > nowStr || voucher.endDate < nowStr) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết hạn sử dụng' });
    }

    if (voucher.usedCount >= voucher.quantity) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
    }

    if (orderAmount && orderAmount < voucher.minOrderAmount) {
      return res.status(400).json({ message: `Đơn hàng tối thiểu phải từ ${voucher.minOrderAmount.toLocaleString('vi-VN')}đ để áp dụng` });
    }

    if (userId) {
      const userVoucher = await UserVoucher.findOne({
        where: { userId: Number(userId), voucherId: voucher.id }
      });
      if (userVoucher && userVoucher.status === 'used') {
        return res.status(400).json({ message: 'Bạn đã sử dụng mã giảm giá này rồi' });
      }
    }

    res.json({ valid: true, voucher });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi kiểm tra voucher: ' + err.message });
  }
});

app.post('/api/vouchers/apply', async (req, res) => {
  try {
    const { code, userId, orderAmount } = req.body;
    if (!code || !orderAmount) return res.status(400).json({ message: 'Thiếu thông tin áp dụng voucher' });

    const voucher = await Voucher.findOne({
      where: { code: code.toUpperCase().trim(), status: 'active' }
    });

    if (!voucher) return res.status(404).json({ message: 'Mã giảm giá không tồn tại' });
    if (orderAmount < voucher.minOrderAmount) {
      return res.status(400).json({ message: `Đơn hàng tối thiểu từ ${voucher.minOrderAmount.toLocaleString('vi-VN')}đ` });
    }

    let discount = 0;
    if (voucher.discountType === 'percent') {
      discount = orderAmount * (voucher.discountValue / 100);
      if (voucher.maxDiscountAmount) {
        discount = Math.min(discount, voucher.maxDiscountAmount);
      }
    } else {
      discount = voucher.discountValue;
    }
    discount = Math.min(discount, orderAmount);

    res.json({ discount, finalAmount: orderAmount - discount, voucher });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi áp dụng voucher: ' + err.message });
  }
});

// ==========================================
// 7. LOYALTY POINTS & REDEMPTION APIS (NEW)
// ==========================================

app.get('/api/loyalty/me', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'Thiếu userId' });

    let lp = await LoyaltyPoint.findOne({ where: { userId: Number(userId) } });
    if (!lp) {
      lp = await LoyaltyPoint.create({
        userId: Number(userId),
        totalPoints: 0,
        totalSpending: 0,
        membershipLevel: 'Standard'
      });
    }

    res.json(lp);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy điểm tích lũy: ' + err.message });
  }
});

app.post('/api/loyalty/redeem', async (req, res) => {
  try {
    const { userId, pointsToRedeem, orderAmount } = req.body;
    if (!userId || pointsToRedeem === undefined || !orderAmount) {
      return res.status(400).json({ message: 'Thiếu thông tin quy đổi điểm' });
    }

    const points = parseInt(pointsToRedeem);
    if (points <= 0) return res.status(400).json({ message: 'Số điểm sử dụng phải lớn hơn 0' });

    let lp = await LoyaltyPoint.findOne({ where: { userId: Number(userId) } });
    if (!lp || lp.totalPoints < points) {
      return res.status(400).json({ message: 'Số điểm tích lũy của bạn không đủ' });
    }

    const discountAmount = points * 1000;
    const finalRedeemDiscount = Math.min(discountAmount, orderAmount);
    const pointsActuallyRedeemed = Math.ceil(finalRedeemDiscount / 1000);

    res.json({
      redeemedPoints: pointsActuallyRedeemed,
      discountAmount: finalRedeemDiscount,
      remainingAmount: orderAmount - finalRedeemDiscount
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi quy đổi điểm: ' + err.message });
  }
});

app.get('/api/loyalty/transactions', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'Thiếu userId' });
    const list = await PointTransaction.findAll({
      where: { userId: Number(userId) },
      order: [['createdAt', 'DESC']]
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy lịch sử điểm: ' + err.message });
  }
});

app.post('/api/loyalty/check-milestone', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'Thiếu userId' });
    
    const lp = await LoyaltyPoint.findOne({ where: { userId: Number(userId) } });
    if (!lp) return res.json({ message: 'Người dùng chưa có lịch sử tích lũy chi tiêu' });

    const milestoneIndex = Math.floor(lp.totalSpending / 5000000);
    if (milestoneIndex === 0) return res.json({ message: 'Chưa đạt mốc chi tiêu 5 triệu' });

    const countAwarded = await VoucherMilestone.count({
      where: { userId: Number(userId), milestoneIndex }
    });

    if (countAwarded > 0) {
      return res.json({ message: 'Người dùng đã nhận đủ voucher mốc này trước đó.' });
    }

    const randomCode = `TRIAN5M-${userId}-${milestoneIndex}-${Math.floor(Math.random()*1000)}`;
    const newVoucher = await Voucher.create({
      code: randomCode,
      name: 'Voucher tri ân khách hàng thân thiết',
      description: 'Voucher giảm giá 10% tối đa 100K cho hóa đơn từ 200K trở lên',
      discountType: 'percent',
      discountValue: 10,
      maxDiscountAmount: 100000,
      minOrderAmount: 200000,
      quantity: 1,
      usedCount: 0,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 10),
      status: 'active',
      createdBy: 'system'
    });

    await UserVoucher.create({
      userId: Number(userId),
      voucherId: newVoucher.id,
      status: 'active',
      assignedAt: new Date(),
      expiredAt: new Date(Date.now() + 30*24*60*60*1000)
    });

    await VoucherMilestone.create({
      userId: Number(userId),
      milestoneAmount: milestoneIndex * 5000000,
      milestoneIndex,
      voucherId: newVoucher.id
    });

    res.json({
      message: 'Cấp voucher thành công',
      voucher: { code: newVoucher.code, name: newVoucher.name }
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi kiểm tra mốc: ' + err.message });
  }
});

// ==========================================
// 8. PAYMENT & BILLING TRANSACTION APIS (NEW)
// ==========================================

app.post('/api/payments/create', async (req, res) => {
  try {
    const { bookingId, userId, paymentMethod, amountBeforeDiscount, voucherCode, pointsUsed } = req.body;
    if (!bookingId || !paymentMethod || amountBeforeDiscount === undefined) {
      return res.status(400).json({ message: 'Thiếu thông tin thanh toán' });
    }

    let voucherDiscountAmount = 0;
    if (voucherCode) {
      const voucher = await Voucher.findOne({ where: { code: voucherCode.toUpperCase().trim(), status: 'active' } });
      if (voucher && amountBeforeDiscount >= voucher.minOrderAmount) {
        if (voucher.discountType === 'percent') {
          voucherDiscountAmount = amountBeforeDiscount * (voucher.discountValue / 100);
          if (voucher.maxDiscountAmount) {
            voucherDiscountAmount = Math.min(voucherDiscountAmount, voucher.maxDiscountAmount);
          }
        } else {
          voucherDiscountAmount = voucher.discountValue;
        }
        voucherDiscountAmount = Math.min(voucherDiscountAmount, amountBeforeDiscount);
      }
    }

    let pointDiscountAmount = 0;
    if (pointsUsed && userId) {
      let lp = await LoyaltyPoint.findOne({ where: { userId: Number(userId) } });
      if (!lp) {
        const userObj = await User.findByPk(Number(userId));
        if (userObj) {
          lp = await LoyaltyPoint.create({
            userId: Number(userId),
            totalPoints: userObj.points || 0,
            totalSpending: 0,
            membershipLevel: 'Standard'
          });
        }
      }
      if (lp) {
        const maxPointsAble = Math.min(lp.totalPoints, pointsUsed);
        pointDiscountAmount = maxPointsAble * 1000;
        pointDiscountAmount = Math.min(pointDiscountAmount, amountBeforeDiscount - voucherDiscountAmount);
      }
    }

    const finalAmount = amountBeforeDiscount - voucherDiscountAmount - pointDiscountAmount;
    const paymentCode = `PM${Date.now()}`;

    // Find existing payment for this booking or create a new one
    let payment = await Payment.findOne({ where: { bookingId } });
    if (payment) {
      await payment.update({
        userId: userId ? Number(userId) : null,
        paymentMethod,
        amountBeforeDiscount,
        voucherDiscountAmount,
        pointDiscountAmount,
        finalAmount,
        voucherCode: voucherCode ? voucherCode.toUpperCase().trim() : null,
        paymentStatus: 'pending'
      });
    } else {
      payment = await Payment.create({
        bookingId,
        userId: userId ? Number(userId) : null,
        paymentCode,
        paymentMethod,
        amountBeforeDiscount,
        voucherDiscountAmount,
        pointDiscountAmount,
        finalAmount,
        voucherCode: voucherCode ? voucherCode.toUpperCase().trim() : null,
        paymentStatus: 'pending'
      });
    }

    res.status(201).json({ message: 'Tạo thanh toán thành công!', payment });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tạo thanh toán: ' + err.message });
  }
});

app.post('/api/payments/confirm', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { paymentId, staffName = 'System' } = req.body;
    if (!paymentId) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Thiếu mã Payment ID' });
    }

    const payment = await Payment.findByPk(paymentId, { transaction });
    if (!payment) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
    }

    if (payment.paymentStatus === 'paid') {
      await transaction.rollback();
      return res.json({ message: 'Thanh toán đã được xác nhận.', payment });
    }

    payment.paymentStatus = 'paid';
    payment.paidAt = new Date();
    await payment.save({ transaction });

    // Update associated booking total to final amount paid
    const booking = await Booking.findByPk(payment.bookingId, { transaction });
    if (booking) {
      booking.total = payment.finalAmount;
      await booking.save({ transaction });
    }

    // Mark applied voucher as used
    if (payment.voucherCode) {
      const voucher = await Voucher.findOne({
        where: { code: payment.voucherCode.toUpperCase().trim() },
        transaction
      });
      if (voucher) {
        voucher.usedCount += 1;
        await voucher.save({ transaction });

        if (payment.userId) {
          let uv = await UserVoucher.findOne({
            where: { userId: payment.userId, voucherId: voucher.id },
            transaction
          });
          if (uv) {
            uv.status = 'used';
            uv.usedAt = new Date();
            await uv.save({ transaction });
          } else {
            // General voucher, create as used
            await UserVoucher.create({
              userId: payment.userId,
              voucherId: voucher.id,
              status: 'used',
              assignedAt: new Date(),
              usedAt: new Date()
            }, { transaction });
          }
        }
      }
    }

    const userId = payment.userId;
    let voucherAwarded = null;

    if (userId) {
      voucherAwarded = await processLoyaltyAndMilestones(
        userId,
        payment.bookingId,
        payment.finalAmount,
        payment.pointDiscountAmount,
        transaction
      );
    }

    await transaction.commit();
    res.json({
      message: 'Thành công',
      payment,
      voucherAwarded: voucherAwarded ? { code: voucherAwarded.code, name: voucherAwarded.name } : null
    });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ message: 'Lỗi xác nhận thanh toán: ' + err.message });
  }
});


app.post('/api/payments/cancel', async (req, res) => {
  try {
    const { paymentId } = req.body;
    const payment = await Payment.findByPk(paymentId);
    if (!payment) return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
    payment.paymentStatus = 'refunded';
    await payment.save();
    res.json({ message: 'Đã hủy giao dịch thanh toán thành công', payment });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi hủy thanh toán: ' + err.message });
  }
});

app.get('/api/payments/:id', async (req, res) => {
  try {
    const item = await Payment.findByPk(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết thanh toán: ' + err.message });
  }
});

// Sync database and start server
syncAndSeed().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
});
