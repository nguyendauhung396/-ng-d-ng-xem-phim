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
  QRLoginSession,
  TicketScanLog
} = require('./db');
const bcrypt = require('bcryptjs');

// 1. Define 10 Latest Movies (now showing) and 2 upcoming movies
const baseSeedMovies = [
  {
    title: 'TẠM BIỆT GOHAN',
    genre: 'Hoạt hình, Hành động, Viễn tưởng',
    age: 'T13',
    duration: '110 phút',
    status: 'now',
    desc: 'Tác phẩm điện ảnh tri ân sự cống hiến vĩ đại của chiến binh Gohan trong cuộc chiến bảo vệ Trái Đất.',
    room: 'Phòng chiếu 02',
    poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: 'DORAEMON: BẢN GIAO HƯỞNG ĐỊA CẦU',
    genre: 'Hoạt hình, Gia đình, Khoa học viễn tưởng',
    age: 'P',
    duration: '115 phút',
    status: 'now',
    desc: 'Nobita và Doraemon tham gia vào chuyến phiêu lưu âm nhạc để giải cứu Trái Đất khỏi hiểm họa diệt vong.',
    room: 'Phòng chiếu 01',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: 'STAR WARS: MANDALORIAN & GROGU',
    genre: 'Viễn tưởng, Hành động, Phiêu lưu',
    age: 'T13',
    duration: '125 phút',
    status: 'now',
    desc: 'Bộ phim điện ảnh tiếp nối hành trình phiêu lưu của Mandalorian và chú bé Grogu đáng yêu ngoài vũ trụ.',
    room: 'Phòng chiếu 03',
    poster: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: 'KẺ TRỘM MẶT TRĂNG 4',
    genre: 'Hoạt hình, Hài hước, Gia đình',
    age: 'P',
    duration: '95 phút',
    status: 'now',
    desc: 'Gru và gia đình chào đón thành viên mới Gru Jr., đồng thời phải đối đầu với ác nhân trốn ngục Maxime Le Mal.',
    room: 'Phòng chiếu 05',
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: 'LẬT MẶT 7: MỘT ĐIỀU ƯỚC',
    genre: 'Tâm lý, Gia đình',
    age: 'K',
    duration: '138 phút',
    status: 'now',
    desc: 'Câu chuyện cảm động về tình mẫu tử thiêng liêng của bà Hai và gia đình của năm người con lớn khôn lập nghiệp.',
    room: 'Phòng chiếu 02',
    poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: 'DEADPOOL & WOLVERINE',
    genre: 'Hành động, Hài hước, Viễn tưởng',
    age: 'T18',
    duration: '127 phút',
    status: 'now',
    desc: 'Bộ đôi siêu anh hùng lầy lội Deadpool và Wolverine hợp lực thực hiện sứ mệnh giải cứu dòng thời gian của Marvel.',
    room: 'Phòng chiếu 01',
    poster: 'https://images.unsplash.com/photo-1534802046520-4f27db7f3ae5?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: 'INSIDE OUT 2 (NHỮNG MẢNH GHÉP CẢM XÚC 2)',
    genre: 'Hoạt hình, Hài hước, Gia đình',
    age: 'P',
    duration: '96 phút',
    status: 'now',
    desc: 'Riley bước vào tuổi dậy thì với những biến động cảm xúc mới đầy hỗn loạn, bao gồm Lo Âu và Ghen Tị.',
    room: 'Phòng chiếu 04',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: 'GODZILLA X KONG: ĐẾ CHẾ MỚI',
    genre: 'Hành động, Phiêu lưu, Viễn tưởng',
    age: 'T13',
    duration: '115 phút',
    status: 'now',
    desc: 'Hai siêu quái thú Godzilla và Kong bắt tay chống lại mối đe dọa khổng lồ ẩn sâu trong lòng Trái Đất.',
    room: 'Phòng chiếu 03',
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: 'CHINH PHỤC VŨ TRỤ',
    genre: 'Khoa học viễn tưởng, Phiêu lưu',
    age: 'P',
    duration: '120 phút',
    status: 'now',
    desc: 'Chuyến du hành xuyên không gian của phi thuyền Discovery nhằm tìm kiếm sự sống ở hành tinh Kepler.',
    room: 'Phòng chiếu 05',
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: 'MA TRẬN: HỒI SINH',
    genre: 'Kinh dị, Viễn tưởng, Hành động',
    age: 'T18',
    duration: '111 phút',
    status: 'now',
    desc: 'Liệu Neo sẽ chọn viên thuốc xanh hay viên thuốc đỏ để khám phá thế giới ảo đang giam giữ loài người?',
    room: 'Phòng chiếu 04',
    poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60'
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
  },
  {
    title: 'DUNE: PHẦN BA',
    genre: 'Hành động, Viễn tưởng',
    age: 'T13',
    duration: '150 phút',
    status: 'soon',
    desc: 'Đỉnh cao vương quyền của Paul Atreides trên hành tinh cát Arrakis và cuộc chiến tranh thánh chống lại các gia tộc vũ trụ.',
    room: 'Sắp cập nhật',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=60'
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
  { id: 'c1', name: 'Combo Metiz Single', category: 'combos', price: 75000, desc: '1 bắp lớn vị ngọt/mặn + 1 nước ngọt size lớn tùy chọn.', img: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&auto=format&fit=crop&q=60' },
  { id: 'c2', name: 'Combo Metiz Double', category: 'combos', price: 99000, desc: '1 bắp lớn vị ngọt/mặn + 2 nước ngọt size lớn tùy chọn.', img: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400&auto=format&fit=crop&q=60' },
  { id: 'c3', name: 'Combo Metiz Family', category: 'combos', price: 145000, desc: '2 bắp lớn tùy chọn vị + 3 nước ngọt size lớn cực đã.', img: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&auto=format&fit=crop&q=60' },
  { id: 'c4', name: 'Combo Metiz Sweetbox', category: 'combos', price: 125000, desc: '1 bắp lớn vị phô mai/caramel + 2 nước ép tươi ngon bổ dưỡng.', img: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=400&auto=format&fit=crop&q=60' },
  { id: 'm1', name: 'Ly Giữ Nhiệt Doraemon Movie 43', category: 'merchandise', price: 150000, desc: 'Ly thép không gỉ giữ nhiệt cao cấp in hình Doraemon và bản nhạc giao hưởng.', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=60' },
  { id: 'm2', name: 'Bình Nước Dragon Ball Super', category: 'merchandise', price: 110000, desc: 'Bình nhựa Tritan cao cấp an toàn sức khỏe, in hình chiến binh Songoku & Gohan.', img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop&q=60' },
  { id: 'm3', name: 'Mô Hình Nhựa Chibi Star Wars Grogu', category: 'merchandise', price: 120000, desc: 'Mô hình trang trí bàn làm việc cực dễ thương của Baby Yoda Grogu chính hãng.', img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=60' },
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

// Vietnamese name generator arrays
const hoList = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const demList = ['Văn', 'Thị', 'Minh', 'Anh', 'Khánh', 'Hoài', 'Thanh', 'Tuấn', 'Hữu', 'Ngọc', 'Đức', 'Quang', 'Xuân', 'Kim'];
const tenList = ['Nam', 'Trang', 'Hùng', 'Hương', 'Hải', 'Lan', 'Sơn', 'Vy', 'Linh', 'Dũng', 'Phương', 'Minh', 'Thảo', 'Tùng', 'Tuấn', 'Hoa', 'Hoàng', 'Yến'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateVietnameseName() {
  return `${getRandomItem(hoList)} ${getRandomItem(demList)} ${getRandomItem(tenList)}`;
}

async function runResetAndSeed() {
  console.log('Starting full database wipe and massive seeder simulation...');
  try {
    // 1. Sync database with force: true
    await sequelize.sync({ force: true });
    console.log('✅ Wiped and re-created database tables.');

    // 2. Pre-hash passwords once to save CPU cycles (very important for 200 users!)
    const hashedMember = bcrypt.hashSync('123456', 10);
    const hashedStaff = bcrypt.hashSync('staff123', 10);
    const hashedAdmin = bcrypt.hashSync('admin123', 10);

    // 3. Generate 200 users: 1 Admin, 12 Staff, 187 Members
    const usersToCreate = [];

    // System Admin (1)
    usersToCreate.push({
      fullName: 'System Administrator',
      email: 'admin@metiz.vn',
      phone: '0909090909',
      password: hashedAdmin,
      role: 'admin',
      points: 0,
      tier: 'Quản trị viên'
    });

    // Staff members (12)
    for (let i = 1; i <= 12; i++) {
      usersToCreate.push({
        fullName: `Nhân viên quầy ${i}`,
        email: i === 1 ? 'staff@metiz.vn' : `staff${i}@metiz.vn`,
        phone: `0912345${i.toString().padStart(3, '0')}`,
        password: hashedStaff,
        role: 'staff',
        points: 0,
        tier: 'Nhân viên rạp'
      });
    }

    // Members (187)
    // Keep 'demo@cinemax.vn' as member 1 for easy testing
    usersToCreate.push({
      fullName: 'Demo Member',
      email: 'demo@cinemax.vn',
      phone: '0987654321',
      password: hashedMember,
      role: 'member',
      points: 320,
      tier: 'Thành viên Gold'
    });

    for (let i = 2; i <= 187; i++) {
      const pts = Math.floor(Math.random() * 1200);
      let tier = 'Thành viên Standard';
      if (pts >= 800) tier = 'Thành viên Diamond';
      else if (pts >= 300) tier = 'Thành viên Gold';

      usersToCreate.push({
        fullName: generateVietnameseName(),
        email: `member${i}@gmail.com`,
        phone: `090${(1000000 + i).toString().slice(1)}`,
        password: hashedMember,
        role: 'member',
        points: pts,
        tier: tier
      });
    }

    const createdUsers = await User.bulkCreate(usersToCreate);
    console.log(`✅ Seeded ${createdUsers.length} total users (1 Admin, 12 Staff, 187 Customers).`);

    // Initialize loyalty point records for all members
    const members = createdUsers.filter(u => u.role === 'member');
    const loyaltyPointsToCreate = members.map(m => ({
      userId: m.id,
      totalPoints: m.points,
      totalSpending: m.points * 200000,
      membershipLevel: m.tier.replace('Thành viên ', '')
    }));
    await LoyaltyPoint.bulkCreate(loyaltyPointsToCreate);
    console.log('✅ Initialized LoyaltyPoint records for all 187 members.');

    // 4. Seed 10 latest movies
    const movies = await Movie.bulkCreate(initialMovies);
    console.log(`✅ Seeded ${movies.length} movies (10 active, 2 upcoming).`);

    // 5. Seed Products
    await Product.bulkCreate(initialProducts);
    console.log('✅ Seeded concessions products.');

    // 6. Seed Promotions
    await Promotion.bulkCreate([
      {
        code: 'METIZNEW',
        title: 'Khuyến mãi thành viên mới - 10%',
        type: 'percent',
        value: 10,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        status: 'active'
      }
    ]);

    // Seed Vouchers
    const seededVouchers = await Voucher.bulkCreate([
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
      },
      {
        code: 'WELCOME50K',
        name: 'Voucher chào mừng thành viên mới - 50K',
        description: 'Giảm ngay 50K cho hóa đơn đặt vé xem phim bất kỳ.',
        discountType: 'amount',
        discountValue: 50000,
        maxDiscountAmount: 50000,
        minOrderAmount: 100000,
        quantity: 100,
        usedCount: 0,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        status: 'active',
        createdBy: 'system'
      }
    ]);
    console.log('✅ Seeded Promotions and Vouchers.');

    // Link WELCOME50K voucher to first 20 members
    const welcomeVoucher = seededVouchers.find(v => v.code === 'WELCOME50K');
    const userVouchersToCreate = [];
    for (let i = 0; i < 20; i++) {
      userVouchersToCreate.push({
        userId: members[i].id,
        voucherId: welcomeVoucher.id,
        status: 'unused'
      });
    }
    await UserVoucher.bulkCreate(userVouchersToCreate);
    console.log('✅ Linked WELCOME50K voucher to top 20 members.');

    // 7. Seed Showtimes
    const dbMovies = movies.filter(m => m.status === 'now');
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

    const seededShowtimes = await Showtime.bulkCreate(showtimesToSeed);
    console.log(`✅ Seeded ${seededShowtimes.length} showtimes.`);

    // 8. Generate 50 Rich Bookings and Payments (Historical Simulation)
    console.log('Simulating 50 historical booking transactions...');
    const bookingsData = [];
    const bookedSeatsData = [];
    const ticketsData = [];
    const paymentsData = [];
    const auditLogsData = [];

    const staffUsers = createdUsers.filter(u => u.role === 'staff');
    const seatsList = ['A01', 'A02', 'B03', 'B04', 'C05', 'C06', 'D07', 'E08', 'E09', 'F10', 'K01', 'K02'];

    for (let i = 1; i <= 50; i++) {
      const randShowtime = getRandomItem(seededShowtimes);
      const randMember = getRandomItem(members);
      const isCounterSale = Math.random() > 0.4; // 60% counter sales, 40% online
      const randStaff = getRandomItem(staffUsers);

      const bookingId = `BK17815125${i.toString().padStart(3, '0')}`;
      const seatsToBook = [getRandomItem(seatsList)];
      // If couple seat
      if (seatsToBook[0].startsWith('K')) {
        seatsToBook.push(seatsToBook[0] === 'K01' ? 'K02' : 'K01');
      }

      // Calculate total
      const total = seatsToBook.reduce((sum, seat) => {
        const row = seat.charAt(0);
        if (row === 'K') return sum + 110000;
        if ('EFG'.includes(row)) return sum + 75000;
        return sum + 55000;
      }, 0);

      const creator = isCounterSale ? randStaff.fullName : 'Web Portal';
      const createdDate = new Date();
      createdDate.setHours(createdDate.getHours() - (50 - i)); // spread over last 50 hours

      bookingsData.push({
        id: bookingId,
        userId: randMember.id,
        customerName: randMember.fullName,
        phone: randMember.phone,
        movieId: randShowtime.movieId,
        movieTitle: randShowtime.movieTitle,
        date: randShowtime.date,
        time: randShowtime.time,
        seats: seatsToBook,
        total: total,
        status: 'confirmed',
        createdBy: creator,
        createdAt: createdDate
      });

      seatsToBook.forEach(seat => {
        bookedSeatsData.push({
          showtimeId: randShowtime.id,
          seat: seat
        });

        // 70% of bookings are already checked in
        const isCheckedIn = createdDate < new Date() && Math.random() > 0.3;
        ticketsData.push({
          id: `TK-${bookingId}-${seat}`,
          bookingId: bookingId,
          seat: seat,
          qrCode: `TICKET-METIZ-${bookingId}-${seat}`,
          status: isCheckedIn ? 'checked_in' : 'valid',
          checkedInAt: isCheckedIn ? createdDate : null,
          checkedInBy: isCheckedIn ? randStaff.fullName : null
        });
      });

      paymentsData.push({
        bookingId: bookingId,
        userId: randMember.id,
        paymentCode: `PM17815125${i.toString().padStart(3, '0')}`,
        paymentMethod: isCounterSale ? 'cash' : 'VNPAY',
        amountBeforeDiscount: total,
        voucherDiscountAmount: 0,
        pointDiscountAmount: 0,
        finalAmount: total,
        paymentStatus: 'paid',
        paidAt: createdDate
      });

      // Add a couple of audit logs
      if (i % 5 === 0) {
        auditLogsData.push({
          actor: creator,
          action: isCounterSale ? 'COUNTER_SALE' : 'ONLINE_BOOKING',
          details: `Khách hàng ${randMember.fullName} (${randMember.phone}) đã mua vé xem phim "${randShowtime.movieTitle}" lúc ${randShowtime.time}, Ghế: ${seatsToBook.join(', ')}. Tổng tiền: ${total}đ.`,
          timestamp: createdDate
        });
      }
    }

    await Booking.bulkCreate(bookingsData);
    await BookedSeat.bulkCreate(bookedSeatsData);
    await Ticket.bulkCreate(ticketsData);
    await Payment.bulkCreate(paymentsData);

    // Add baseline audit logs
    auditLogsData.push(
      {
        actor: 'System Administrator',
        action: 'RESET_DB',
        details: 'Đã thiết lập lại cơ sở dữ liệu và đồng bộ hóa thành công 200 tài khoản khách hàng, nhân viên cùng 10 phim mới nhất.',
        timestamp: new Date()
      },
      {
        actor: 'System Administrator',
        action: 'UPDATE_ROLE',
        details: 'Cập nhật phân quyền cho 12 nhân viên quầy và 187 hội viên tích điểm.',
        timestamp: new Date()
      }
    );
    await AuditLog.bulkCreate(auditLogsData);

    console.log('✅ Seeded 50 booking history records, tickets, payments, and audit logs.');

    console.log('\n======================================================');
    console.log('🎉 10 MOVIES AND 200 USERS SYNCED SUCCESSFULLY!');
    console.log('======================================================');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during synchronization:', error);
    process.exit(1);
  }
}

runResetAndSeed();
