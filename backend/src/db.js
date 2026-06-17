const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const bcrypt = require('bcryptjs');


// Initialize Sequelize
// Try to connect to MySQL first, fallback to SQLite if connection fails
let sequelize;

const dbName = process.env.DB_NAME || 'metiz_cinema_db';
const dbUser = process.env.DB_USER || 'root';
const dbPass = process.env.DB_PASS || 'Nguyen@1904';
const dbHost = process.env.DB_HOST || '127.0.0.1';

try {
  sequelize = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
  console.log('Sequelize: Configured for MySQL connection.');
} catch (err) {
  console.log('Sequelize: MySQL config failed, falling back to SQLite.', err.message);
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'cinema.sqlite'),
    logging: false
  });
}

// Define Models
const Movie = sequelize.define('Movie', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  age: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING, // 'now', 'soon', 'hidden', 'ended'
    allowNull: false
  },
  desc: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  room: {
    type: DataTypes.STRING,
    allowNull: false
  },
  poster: {
    type: DataTypes.STRING, // URL or local path
    allowNull: true
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fullDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bannerImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  trailerUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  director: {
    type: DataTypes.STRING,
    allowNull: true
  },
  actors: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  releaseDate: {
    type: DataTypes.STRING,
    allowNull: true
  },
  language: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  updatedBy: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

const Showtime = sequelize.define('Showtime', {
  id: {
    type: DataTypes.STRING, // `${movieId}-${date}-${time}`
    primaryKey: true
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  movieTitle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false
  },
  room: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 55000
  }
});

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.STRING, // `BK${timestamp}`
    primaryKey: true
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Khách vãng lai'
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  movieTitle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false
  },
  seats: {
    type: DataTypes.TEXT, // Store seats as JSON string
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('seats');
      if (!rawValue) return [];
      try {
        return JSON.parse(rawValue);
      } catch (e) {
        return typeof rawValue === 'string' ? rawValue.split(',').map(s => s.trim()) : [];
      }
    },
    set(val) {
      this.setDataValue('seats', JSON.stringify(val));
    }
  },
  total: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

const BookedSeat = sequelize.define('BookedSeat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  showtimeId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  seat: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// NEW MODELS ACCORDING TO BUSINESS SPECIFICATION
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING, // 'member', 'staff', 'admin'
    allowNull: false,
    defaultValue: 'member'
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  tier: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Thành viên Standard'
  }
});

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.STRING, // e.g. TK-BK1234-A1
    primaryKey: true
  },
  bookingId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  seat: {
    type: DataTypes.STRING,
    allowNull: false
  },
  qrCode: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  status: {
    type: DataTypes.STRING, // 'valid', 'used', 'cancelled'
    allowNull: false,
    defaultValue: 'valid'
  },
  checkedInAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  checkedInBy: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bookingId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  paymentCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  voucherCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.STRING, // 'cash', 'transfer', 'online'
    allowNull: false
  },
  amountBeforeDiscount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  voucherDiscountAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  pointDiscountAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  finalAmount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.STRING, // 'pending', 'paid', 'refunded'
    allowNull: false,
    defaultValue: 'paid'
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
});

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING, // 'combos', 'merchandise', 'egifts'
    allowNull: false
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  desc: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  img: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.STRING, // `OR${timestamp}`
    primaryKey: true
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  total: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'paid'
  },
  items: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const raw = this.getDataValue('items');
      if (!raw) return [];
      try {
        return JSON.parse(raw);
      } catch (e) {
        return [];
      }
    },
    set(val) {
      this.setDataValue('items', JSON.stringify(val));
    }
  }
});

const Promotion = sequelize.define('Promotion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING, // 'percent', 'amount'
    allowNull: false,
    defaultValue: 'percent'
  },
  value: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  startDate: {
    type: DataTypes.STRING,
    allowNull: false
  },
  endDate: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active'
  }
});

// NEW MODELS ACCORDING TO SPECIFICATION
const Voucher = sequelize.define('Voucher', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  discountType: {
    type: DataTypes.STRING, // 'percent', 'amount', 'free_combo', 'discount_combo', 'loyalty', 'auto_milestone'
    allowNull: false
  },
  discountValue: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  maxDiscountAmount: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  minOrderAmount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  usedCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  startDate: {
    type: DataTypes.STRING,
    allowNull: false
  },
  endDate: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active' // 'active', 'inactive'
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  paranoid: true
});

const UserVoucher = sequelize.define('UserVoucher', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  voucherId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING, // 'active', 'used', 'expired'
    allowNull: false,
    defaultValue: 'active'
  },
  assignedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expiredAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

const LoyaltyPoint = sequelize.define('LoyaltyPoint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalPoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  totalSpending: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  membershipLevel: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Standard'
  }
});

const PointTransaction = sequelize.define('PointTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bookingId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  transactionType: {
    type: DataTypes.STRING, // 'earn', 'redeem', 'refund', 'adjust'
    allowNull: false
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amountEquivalent: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

const VoucherMilestone = sequelize.define('VoucherMilestone', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  milestoneAmount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  milestoneIndex: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  voucherId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  achievedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
});

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  actor: {
    type: DataTypes.STRING,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

const QRLoginSession = sequelize.define('QRLoginSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sessionToken: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'scanned', 'confirmed', 'used', 'expired', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  role: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deviceInfo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  expiredAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  confirmedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

const TicketScanLog = sequelize.define('TicketScanLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ticketId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bookingId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  staffId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  scanResult: {
    type: DataTypes.ENUM('success', 'failed'),
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deviceInfo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

const HomeBanner = sequelize.define('HomeBanner', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  eyebrow: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  buttonText: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Đặt vé ngay'
  },
  buttonLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING, // 'active', 'inactive', 'expired'
    allowNull: false,
    defaultValue: 'active'
  },
  startDate: {
    type: DataTypes.STRING,
    allowNull: true
  },
  endDate: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  updatedBy: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Relationships
Movie.hasMany(Showtime, { foreignKey: 'movieId', onDelete: 'CASCADE' });
Showtime.belongsTo(Movie, { foreignKey: 'movieId' });
TicketScanLog.belongsTo(User, { foreignKey: 'staffId', as: 'Staff' });
User.hasMany(TicketScanLog, { foreignKey: 'staffId' });
HomeBanner.belongsTo(Movie, { foreignKey: 'movieId', as: 'Movie', onDelete: 'SET NULL' });
Movie.hasMany(HomeBanner, { foreignKey: 'movieId', as: 'Banners' });

// Default Booked Seats
const defaultBooked = ['A3', 'B5', 'C7', 'D2', 'E8', 'F4'];

const baseSeedMovies = [
  {
    title: 'TẠM BIỆT GOHAN',
    genre: 'Gia đình, Hoạt hình',
    age: 'K',
    duration: '140 phút',
    status: 'now',
    desc: 'Suất chiếu đặc biệt chào mừng sự trở lại của Dragon Ball, tạm biệt người anh hùng Gohan.',
    room: 'Phòng chiếu 02',
    poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: '(LỒNG TIẾNG) DORAEMON: BẢN GIAO HƯỞNG ĐỊA CẦU',
    genre: 'Hoạt hình, Phiêu lưu',
    age: 'P',
    duration: '101 phút',
    status: 'now',
    desc: 'Nobita và các bạn tham gia chuyến phiêu lưu âm nhạc để giải cứu Trái Đất.',
    room: 'Phòng chiếu 03',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: 'STAR WARS: MANDALORIAN & GROGU',
    genre: 'Hành động, Viễn tưởng',
    age: 'T13',
    duration: '120 phút',
    status: 'now',
    desc: 'Cuộc hành trình tiếp theo của Din Djarin và Grogu trong vũ trụ Star Wars rộng lớn.',
    room: 'Phòng chiếu 04',
    poster: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: 'BÀI TRÙNG PHÁ ÁN',
    genre: 'Hình sự, Hành động',
    age: 'T18',
    duration: '111 phút',
    status: 'now',
    desc: 'Đội ngũ thám tử tài ba hợp sức để giải mã một vụ án giết người hàng loạt chấn động.',
    room: 'Phòng chiếu 01',
    poster: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: 'KHÁCH',
    genre: 'Kinh dị, Giật gân',
    age: 'T18',
    duration: '91 phút',
    status: 'now',
    desc: 'Căn nhà hoang luôn đón tiếp những vị khách không mời mà đến vào mỗi tối.',
    room: 'Phòng chiếu 02',
    poster: 'https://images.unsplash.com/photo-1505635339347-29141f230000?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: 'NGÔI ĐỀN KỲ QUÁI 4',
    genre: 'Hài, Kinh dị',
    age: 'T16',
    duration: '120 phút',
    status: 'now',
    desc: 'Phần tiếp theo của loạt phim ma Thái Lan đình đám, hài hước và rùng rợn.',
    room: 'Phòng chiếu 03',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: 'MA TRẬN',
    genre: 'Kinh dị, Viễn tưởng',
    age: 'T18',
    duration: '111 phút',
    status: 'now',
    desc: 'Liệu bạn sẽ chọn viên thuốc xanh hay viên thuốc đỏ để khám phá sự thật?',
    room: 'Phòng chiếu 04',
    poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: 'MOBIUS SUIT GUNDAM TIA CHỚP HATHAWAY',
    genre: 'Hoạt hình, Viễn tưởng',
    age: 'T13',
    duration: '101 phút',
    status: 'soon',
    desc: 'Cuộc nổi dậy của lực lượng kháng chiến chống lại sự thống trị độc tài toàn cầu.',
    room: 'Sắp cập nhật',
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: 'ỐC MƯỢN HỒN',
    genre: 'Tâm lý, Kinh dị',
    age: 'T16',
    duration: '110 phút',
    status: 'soon',
    desc: 'Những bí ẩn xung quanh cuộc sống của một người phụ nữ bị ám ảnh bởi linh hồn lạ.',
    room: 'Sắp cập nhật',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60'
  }
];

const movieTemplates = [
  { title: 'Kẻ Hủy Diệt', genre: 'Hành động, Viễn tưởng', age: 'T16', desc: 'Trận chiến sinh tử giữa nhân loại và thế lực máy móc thông minh.' },
  { title: 'Chiến Binh Ánh Sáng', genre: 'Phiêu lưu, Giả tưởng', age: 'T13', desc: 'Hành trình tìm kiếm thanh gươm huyền thoại bảo vệ vương quốc.' },
  { title: 'Tình Yêu Không Lối Thoát', genre: 'Tình cảm, Tâm lý', age: 'T16', desc: 'Câu chuyện tình đầy nước mắt giữa hai tâm hồn cô đơn.' },
  { title: 'Cơn Ác Mộng Đêm Hè', genre: 'Kinh dị, Giật gân', age: 'T18', desc: 'Nhóm bạn trẻ đối diện với thế lực tà ác trong ngôi nhà gỗ trong rừng.' },
  { title: 'Thám Tử Lừng Danh', genre: 'Hình sự, Trinh thám', age: 'T13', desc: 'Vụ án mạng bí ẩn trong lâu đài cổ kính được thám tử phá giải.' },
  { title: 'Cuộc Chiến Sinh Tử', genre: 'Hành động, Phiêu lưu', age: 'T18', desc: 'Đấu trường khắc nghiệt nơi chỉ có một người được quyền sống sót.' },
  { title: 'Gia Đình Siêu Quậy', genre: 'Hài, Gia đình', age: 'P', desc: 'Những tình huống dở khóc dở cười của gia đình ba thế hệ.' },
  { title: 'Vương Quốc Kỳ Diệu', genre: 'Hoạt hình, Gia đình', age: 'P', desc: 'Thế giới đầy sắc màu kỳ lạ nơi các đồ vật biết nói chuyện.' },
  { title: 'Dòng Sông Ký Ức', genre: 'Tâm lý, Chính kịch', age: 'K', desc: 'Hành trình vượt qua nỗi mất mát lớn lao của một gia đình nhỏ.' },
  { title: 'Hành Tinh Bất Định', genre: 'Viễn tưởng, Phiêu lưu', age: 'T13', desc: 'Cuộc thám hiểm hành tinh mới nằm ngoài hệ mặt trời của phi hành đoàn.' },
  { title: 'Võ Sĩ Cuối Cùng', genre: 'Hành động, Cổ trang', age: 'T16', desc: 'Sự phục quốc vĩ đại của người cận vệ hoàng gia duy nhất sống sót.' },
  { title: 'Mùa Hè Năm Ấy', genre: 'Lãng mạn, Học đường', age: 'T13', desc: 'Ký ức ngọt ngào và thơ mộng của nhóm học sinh năm cuối cấp.' },
  { title: 'Đèn Khuya', genre: 'Kinh dị, Bí ẩn', age: 'T18', desc: 'Truyền thuyết đô thị đáng sợ về chiếc đèn dầu lúc nửa đêm.' },
  { title: 'Mật Mã Tối Cao', genre: 'Hành động, Giật gân', age: 'T16', desc: 'Cuộc rượt đuổi nghẹt thở nhằm ngăn chặn quả bom hạt nhân kích hoạt.' },
  { title: 'Bóng Đêm Luân Hồi', genre: 'Kinh dị, Tâm linh', age: 'T16', desc: 'Oán khí ngàn năm quay lại đòi nợ máu dòng tộc giàu sang.' },
  { title: 'Bay Cao Cùng Ước Mơ', genre: 'Tài liệu, Truyền cảm hứng', age: 'P', desc: 'Hành trình chinh phục ước mơ âm nhạc của các trẻ em nghèo.' },
  { title: 'Quái Vật Đầm Lầy', genre: 'Kinh dị, Khoa học viễn tưởng', age: 'T16', desc: 'Thí nghiệm sinh học thất bại giải phóng sinh vật khổng lồ tàn phá thành phố.' },
  { title: 'Trò Chơi Trí Tuệ', genre: 'Tâm lý, Giật gân', age: 'T16', desc: 'Cuộc đấu trí đỉnh cao giữa giáo sư toán học và tên tội phạm thiên tài.' },
  { title: 'Vết Sẹo Thời Gian', genre: 'Chiến tranh, Tâm lý', age: 'T18', desc: 'Góc khuất chiến tranh qua lời kể của người lính già xuất ngũ.' },
  { title: 'Siêu Cấp Thú Cưng', genre: 'Hoạt hình, Hài', age: 'K', desc: 'Biệt đội thú cưng siêu năng lực giải cứu người chủ yêu quý.' }
];

const posterIds = [
  'photo-1485846234645-a62644f84728', 'photo-1536440136628-849c177e76a1', 'photo-1478720568477-152d9b164e26',
  'photo-1509281373149-e957c6296406', 'photo-1517604931442-7e0c8ed2963c', 'photo-1489599849927-2ee91cede3ba',
  'photo-1505635339347-29141f230000', 'photo-1518709268805-4e9042af9f23', 'photo-1526374965328-7f61d4dc18c5',
  'photo-1534447677768-be436bb09401', 'photo-1563089145-599997674d42', 'photo-1607604276583-eef5d076aa5f',
  'photo-1542204172-e7052809f852', 'photo-1535498730771-e735b998cd64', 'photo-1497124401559-3e75ec2e794a',
  'photo-1504701954957-2390f80619b4', 'photo-1500462918020-f16758657ce9', 'photo-1501183007986-d0d080b147f9',
  'photo-1513151233558-d860c5398176', 'photo-1518173946687-a4c8a3833927'
];

const generatedMovies = [];
const baseSeedMoviesCount = baseSeedMovies.length;
for (let i = 0; i < 200; i++) {
  if (i < baseSeedMoviesCount) {
    generatedMovies.push({
      id: i + 1,
      ...baseSeedMovies[i]
    });
  } else {
    const template = movieTemplates[(i - baseSeedMoviesCount) % movieTemplates.length];
    const iteration = Math.floor((i - baseSeedMoviesCount) / movieTemplates.length) + 2;
    const status = (i % 8 === 0) ? 'soon' : 'now'; // 87.5% now playing, 12.5% coming soon
    generatedMovies.push({
      id: i + 1,
      title: `${template.title.toUpperCase()} ${iteration}`,
      genre: template.genre,
      age: template.age,
      duration: `${95 + (i % 5) * 10} phút`,
      status: status,
      desc: `${template.desc} Phần phim thứ ${iteration} hứa hẹn mang lại những cảm xúc bùng nổ vượt trội.`,
      room: status === 'soon' ? 'Sắp cập nhật' : `Phòng chiếu 0${(i % 5) + 1}`,
      poster: `https://images.unsplash.com/${posterIds[i % posterIds.length]}?w=500&auto=format&fit=crop&q=60`
    });
  }
}
const initialMovies = generatedMovies;

const initialProducts = [
  // Combos
  { id: 'c1', name: 'Combo Metiz Single', category: 'combos', price: 75000, desc: '1 bắp lớn vị ngọt/mặn + 1 nước ngọt size lớn tùy chọn.', img: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&auto=format&fit=crop&q=60' },
  { id: 'c2', name: 'Combo Metiz Double', category: 'combos', price: 99000, desc: '1 bắp lớn vị ngọt/mặn + 2 nước ngọt size lớn tùy chọn.', img: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400&auto=format&fit=crop&q=60' },
  { id: 'c3', name: 'Combo Metiz Family', category: 'combos', price: 145000, desc: '2 bắp lớn tùy chọn vị + 3 nước ngọt size lớn cực đã.', img: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&auto=format&fit=crop&q=60' },
  { id: 'c4', name: 'Combo Metiz Sweetbox', category: 'combos', price: 125000, desc: '1 bắp lớn vị phô mai/caramel + 2 nước ép tươi ngon bổ dưỡng.', img: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=400&auto=format&fit=crop&q=60' },
  // Merchandise
  { id: 'm1', name: 'Ly Giữ Nhiệt Doraemon Movie 43', category: 'merchandise', price: 150000, desc: 'Ly thép không gỉ giữ nhiệt cao cấp in hình Doraemon và bản nhạc giao hưởng.', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=60' },
  { id: 'm2', name: 'Bình Nước Dragon Ball Super', category: 'merchandise', price: 110000, desc: 'Bình nhựa Tritan cao cấp an toàn sức khỏe, in hình chiến binh Songoku & Gohan.', img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop&q=60' },
  { id: 'm3', name: 'Mô Hình Nhựa Chibi Star Wars Grogu', category: 'merchandise', price: 120000, desc: 'Mô hình trang trí bàn làm việc cực dễ thương của Baby Yoda Grogu chính hãng.', img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=60' },
  // eGifts
  { id: 'e1', name: 'Thẻ Quà Tặng Metiz Giftcard 100K', category: 'egifts', price: 100000, desc: 'Thẻ quà tặng điện tử trị giá 100.000đ dùng mua vé hoặc bắp nước tại rạp.', img: 'https://images.unsplash.com/photo-1549463512-2051048a8733?w=400&auto=format&fit=crop&q=60' },
  { id: 'e2', name: 'Thẻ Quà Tặng Metiz Giftcard 200K', category: 'egifts', price: 200000, desc: 'Thẻ quà tặng điện tử trị giá 200.000đ dùng mua vé hoặc bắp nước tại rạp.', img: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=400&auto=format&fit=crop&q=60' },
  { id: 'e3', name: 'Voucher Xem Phim 2D Cuối Tuần', category: 'egifts', price: 65000, desc: 'Voucher quy đổi 01 vé xem phim định dạng 2D áp dụng tất cả các ngày kể cả lễ.', img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=60' }
];

const baseTimes = ['09:30', '11:45', '14:10', '16:30', '19:00', '21:20'];

function getDates() {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

async function syncAndSeed() {
  try {
    // Try to authenticate connection
    await sequelize.authenticate();
    console.log('Sequelize: Database connection established successfully.');

    // Sync database with alter: true to dynamically add new columns (e.g. userId)
    await sequelize.sync({ alter: true }); 
    console.log('Sequelize: Database models synchronized.');

    // Seed Movies if empty
    const movieCount = await Movie.count();
    if (movieCount === 0) {
      await Movie.bulkCreate(initialMovies);
      console.log('Sequelize: Seeded initial movies successfully.');
    }

    // Seed Showtimes dynamically
    const showtimeCount = await Showtime.count();
    if (showtimeCount === 0) {
      const dbMovies = await Movie.findAll({ where: { status: 'now' } });
      const dates = getDates();
      const showtimesToSeed = [];

      dates.forEach((date) => {
        dbMovies.forEach((movie, index) => {
          const selectedTimes = baseTimes.slice(index % 2, (index % 2) + 5);
          selectedTimes.forEach((time) => {
            showtimesToSeed.push({
              id: `${movie.id}-${date}-${time}`,
              movieId: movie.id,
              movieTitle: movie.title,
              date: date,
              time: time,
              room: movie.room,
              price: 55000
            });
          });
        });
      });

      await Showtime.bulkCreate(showtimesToSeed);
      console.log(`Sequelize: Seeded ${showtimesToSeed.length} showtimes successfully.`);
    }

    // Seed Products if empty
    const productCount = await Product.count();
    if (productCount === 0) {
      await Product.bulkCreate(initialProducts);
      console.log('Sequelize: Seeded e-shop products.');
    }

    // Seed Roles and users if empty
    const userCount = await User.count();
    if (userCount === 0) {
      await User.bulkCreate([
        {
          fullName: 'Demo Member',
          email: 'demo@cinemax.vn',
          phone: '0987654321',
          password: bcrypt.hashSync('123456', 10),
          role: 'member',
          points: 120,
          tier: 'Thành viên Gold'
        },
        {
          fullName: 'Staff Inspector',
          email: 'staff@metiz.vn',
          phone: '0912345678',
          password: bcrypt.hashSync('staff123', 10),
          role: 'staff',
          points: 0,
          tier: 'Nhân viên rạp'
        },
        {
          fullName: 'System Administrator',
          email: 'admin@metiz.vn',
          phone: '0909090909',
          password: bcrypt.hashSync('admin123', 10),
          role: 'admin',
          points: 0,
          tier: 'Quản trị viên'
        }
      ]);
      console.log('Sequelize: Seeded default accounts.');
    }

    // Seed default promotions if empty
    const promoCount = await Promotion.count();
    if (promoCount === 0) {
      await Promotion.bulkCreate([
        {
          code: 'METIZNEW',
          title: 'Khuyến mãi thành viên mới - 10%',
          type: 'percent',
          value: 10,
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          status: 'active'
        },
        {
          code: 'METIZVIP',
          title: 'Khuyến mãi Vip giảm ngay 20K',
          type: 'amount',
          value: 20000,
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          status: 'active'
        }
      ]);
      console.log('Sequelize: Seeded promotions.');
    }

    // Seed default Vouchers if empty
    const voucherCount = await Voucher.count();
    if (voucherCount === 0) {
      await Voucher.bulkCreate([
        {
          code: 'CINEMA10',
          name: 'Giảm giá khai trương - 10%',
          description: 'Giảm ngay 10% tối đa 50K cho đơn hàng từ 150K trở lên',
          discountType: 'percent',
          discountValue: 10,
          maxDiscountAmount: 50000,
          minOrderAmount: 150000,
          quantity: 1000,
          usedCount: 0,
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          status: 'active',
          createdBy: 'system'
        },
        {
          code: 'METIZ50',
          name: 'Tri ân thành viên Metiz - Giảm 50K',
          description: 'Giảm ngay 50.000đ cho đơn hàng từ 200.000đ trở lên',
          discountType: 'amount',
          discountValue: 50000,
          maxDiscountAmount: 50000,
          minOrderAmount: 200000,
          quantity: 500,
          usedCount: 0,
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          status: 'active',
          createdBy: 'system'
        }
      ]);
      console.log('Sequelize: Seeded vouchers.');
    }

    // Seed default HomeBanners if empty
    const bannerCount = await HomeBanner.count();
    if (bannerCount === 0) {
      await HomeBanner.bulkCreate([
        {
          movieId: 1,
          title: 'TẠM BIỆT GOHAN',
          eyebrow: 'Suất chiếu đặc biệt từ 18H | 13-14.05.2026',
          description: 'Tác phẩm đặc biệt tri ân chặng đường huyền thoại của vũ trụ ngọc rồng Dragon Ball. Lần đầu tiên chiến binh Gohan tỏa sáng rực rỡ với sức mạnh vô hạn.',
          imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&auto=format&fit=crop&q=80',
          buttonText: 'Đặt vé ngay',
          buttonLink: '/home',
          priority: 1,
          status: 'active',
          createdBy: 'system'
        },
        {
          movieId: 2,
          title: 'DORAEMON: BẢN GIAO HƯỞNG ĐỊA CẦU',
          eyebrow: 'Phim điện ảnh gia đình xuất sắc nhất năm',
          description: 'Mèo máy Doraemon và nhóm bạn Nobita dấn thân vào chuyến phiêu lưu âm nhạc kỳ vĩ để giải cứu nhân loại và mang giai điệu trở lại Trái Đất.',
          imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000&auto=format&fit=crop&q=80',
          buttonText: 'Đặt vé ngay',
          buttonLink: '/home',
          priority: 2,
          status: 'active',
          createdBy: 'system'
        },
        {
          movieId: 3,
          title: 'STAR WARS: MANDALORIAN & GROGU',
          eyebrow: 'Siêu phẩm viễn tưởng đình đám từ Lucasfilm',
          description: 'Bản hùng ca hoành tráng tiếp theo của thợ săn tiền thưởng Din Djarin và chú bé tí hon Grogu đáng yêu trong cuộc chiến bảo vệ thiên hà.',
          imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1000&auto=format&fit=crop&q=80',
          buttonText: 'Đặt vé ngay',
          buttonLink: '/home',
          priority: 3,
          status: 'active',
          createdBy: 'system'
        }
      ]);
      console.log('Sequelize: Seeded home banners.');
    }

  } catch (error) {
    console.error('Sequelize: Sync and seed error:', error);
  }
}

module.exports = {
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
  HomeBanner,
  defaultBooked,
  syncAndSeed
};
