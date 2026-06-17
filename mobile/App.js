import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Switch
} from 'react-native';
import { api } from './src/api';

const { width } = Dimensions.get('window');

// Premium Color System
const COLORS = {
  bg: '#080c16',          // Deep void dark blue
  cardBg: '#121a2e',      // Slate night blue
  cardBgLight: '#1e293b', // Lighter slate blue
  accentCyan: '#00f2fe',  // Electric neon cyan
  accentBlue: '#4facfe',  // Neon blue
  accentPink: '#ff2a5f',  // Vibrant rose/pink for VIP & hot tags
  textPrimary: '#ffffff', // Pure white
  textSecondary: '#94a3b8', // Muted slate
  border: '#1b263b',      // Muted border lines
  green: '#10b981',
  blue: '#3b82f6',
  orange: '#f59e0b',
  red: '#ef4444'
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('Home'); // Home, Shop, Booking, Profile
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // QR Login confirmation states
  const [showQRConfirm, setShowQRConfirm] = useState(false);
  const [qrConfirmToken, setQrConfirmToken] = useState('');
  const [qrAdminPassword, setQrAdminPassword] = useState('');
  const [confirmingQR, setConfirmingQR] = useState(false);
  
  // Login fields
  const [email, setEmail] = useState('demo@cinemax.vn');
  const [password, setPassword] = useState('123456');

  // Booking Flow State
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('14:10');
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingsHistory, setBookingsHistory] = useState([]);

  // Shop Concessions State
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('combos'); // combos, merchandise, egifts
  const [cart, setCart] = useState([]);
  const [shopLoading, setShopLoading] = useState(false);

  // Promotions State
  const [promotions, setPromotions] = useState([]);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Loyalty & Voucher states
  const [userVouchers, setUserVouchers] = useState([]);
  const [userLoyalty, setUserLoyalty] = useState(null);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState('');

  // Staff Portal States
  const [staffTab, setStaffTab] = useState('checkin'); // checkin, counter-sales, shift-report
  const [staffLookupCode, setStaffLookupCode] = useState('');
  const [staffActiveBooking, setStaffActiveBooking] = useState(null);
  const [staffActiveTickets, setStaffActiveTickets] = useState([]);
  const [staffCheckinCount, setStaffCheckinCount] = useState(0);
  const [staffSalesCount, setStaffSalesCount] = useState(0);
  // Staff counter booking fields
  const [staffMovieId, setStaffMovieId] = useState('');
  const [staffDate, setStaffDate] = useState('');
  const [staffTime, setStaffTime] = useState('14:10');
  const [staffSeats, setStaffSeats] = useState([]);
  const [staffCustomerName, setStaffCustomerName] = useState('Khách quầy');
  const [staffPhone, setStaffPhone] = useState('0999999999');
  const [staffBookedSeats, setStaffBookedSeats] = useState([]);

  // Admin Portal States
  const [adminTab, setAdminTab] = useState('overview'); // overview, users, audit
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminRevenue, setAdminRevenue] = useState(null);
  const [adminAuditLogs, setAdminAuditLogs] = useState([]);

  // Generate next 5 dates starting from today
  const getDates = () => {
    const dates = [];
    const weekdays = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dayName = weekdays[d.getDay()];
      const dayNum = d.getDate().toString().padStart(2, '0');
      const monthNum = (d.getMonth() + 1).toString().padStart(2, '0');
      const fullDate = d.toISOString().slice(0, 10);
      dates.push({ 
        label: i === 0 ? 'Hôm nay' : `${dayName}`, 
        subLabel: `${dayNum}/${monthNum}`, 
        value: fullDate 
      });
    }
    return dates;
  };

  const showtimeList = ["09:30", "11:45", "14:10", "16:30", "19:00", "21:20"];

  // Initialize and Fetch data on mount
  useEffect(() => {
    const dates = getDates();
    if (dates.length > 0) {
      setSelectedDate(dates[0].value);
      setStaffDate(dates[0].value);
    }
    loadMovies();
    loadProducts();
    loadPromotions();
  }, []);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const data = await api.getMovies();
      setMovies(data);
      if (data.length > 0) {
        setStaffMovieId(data[0].id.toString());
      }
    } catch (err) {
      console.warn('API error loading movies, using mock:', err.message);
      const mock = [
        {
          id: 1,
          title: 'TẠM BIỆT GOHAN',
          genre: 'Gia đình, Hoạt hình',
          duration: '140 phút',
          poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500',
          desc: 'Suất chiếu đặc biệt chào mừng sự trở lại của Dragon Ball, tạm biệt người anh hùng Gohan.',
          age: 'K',
          status: 'now',
          room: 'Phòng chiếu 02'
        },
        {
          id: 2,
          title: '(LỒNG TIẾNG) DORAEMON: BẢN GIAO HƯỞNG ĐỊA CẦU',
          genre: 'Hoạt hình, Phiêu lưu',
          duration: '101 phút',
          poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500',
          desc: 'Nobita và các bạn tham gia chuyến phiêu lưu âm nhạc để giải cứu Trái Đất.',
          age: 'P',
          status: 'now',
          room: 'Phòng chiếu 03'
        }
      ];
      setMovies(mock);
      setStaffMovieId('1');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setShopLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.warn('API error loading shop products:', err.message);
    } finally {
      setShopLoading(false);
    }
  };

  const loadPromotions = async () => {
    try {
      const data = await api.getPromotions();
      setPromotions(data);
    } catch (err) {
      console.warn('API error loading promotions:', err.message);
    }
  };

  const handleLogin = async () => {
    try {
      const data = await api.login(email, password);
      api.setToken(data.token);
      setUser(data.user);
      Alert.alert('Thành công', `Chào mừng hội viên ${data.user.fullName}!`);
      
      // Load specific portal data
      if (data.user.role === 'staff') {
        setStaffTab('checkin');
      } else if (data.user.role === 'admin') {
        setAdminTab('overview');
        loadAdminData();
      } else {
        loadHistory(data.user.id);
        loadUserLoyaltyAndVouchers(data.user.id);
      }
    } catch (err) {
      Alert.alert('Đăng nhập thất bại', err.message);
    }
  };

  const loadHistory = async (userId) => {
    try {
      const data = await api.getBookingsHistory(userId);
      setBookingsHistory(data);
    } catch (err) {
      console.log('Error loading history:', err.message);
    }
  };

  const loadUserLoyaltyAndVouchers = async (userId) => {
    if (!userId) return;
    try {
      const loyalty = await api.getLoyaltyMe(userId);
      setUserLoyalty(loyalty);
    } catch (err) {
      console.log('Error loading loyalty:', err.message);
    }
    try {
      const vouchers = await api.getUserVouchers(userId);
      setUserVouchers(vouchers);
    } catch (err) {
      console.log('Error loading user vouchers:', err.message);
    }
  };

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
      const pricePerSeat = selectedMovie.room.includes('VIP') ? 75000 : 55000;
      const baseTotal = selectedSeats.length * pricePerSeat;
      
      const res = await api.applyVoucher({
        code: codeStr,
        userId: user ? user.id : null,
        orderAmount: baseTotal
      });
      setAppliedVoucher(res.voucher);
      setVoucherDiscount(res.discount);
      setVoucherSuccess(`Áp dụng thành công: Giảm ${res.discount.toLocaleString('vi-VN')} đ`);
      
      // Auto adjust points used if order balance is exceeded
      const remaining = baseTotal - res.discount;
      if (usePoints) {
        const maxP = Math.min(userLoyalty?.totalPoints || user?.points || 0, Math.floor(remaining / 1000));
        setPointsToUse(maxP);
      }
    } catch (err) {
      setVoucherError(err.message);
      setAppliedVoucher(null);
      setVoucherDiscount(0);
      Alert.alert('Mã giảm giá không hợp lệ', err.message);
    }
  };

  const handleUsePointsToggle = (checked) => {
    setUsePoints(checked);
    const pricePerSeat = selectedMovie.room.includes('VIP') ? 75000 : 55000;
    const baseTotal = selectedSeats.length * pricePerSeat;
    if (checked) {
      const maxP = Math.min(userLoyalty?.totalPoints || user?.points || 0, Math.floor((baseTotal - voucherDiscount) / 1000));
      setPointsToUse(maxP);
    } else {
      setPointsToUse(0);
    }
  };

  const handlePointsChange = (text) => {
    const entered = parseInt(text) || 0;
    const pricePerSeat = selectedMovie.room.includes('VIP') ? 75000 : 55000;
    const baseTotal = selectedSeats.length * pricePerSeat;
    const maxP = Math.min(userLoyalty?.totalPoints || user?.points || 0, Math.floor((baseTotal - voucherDiscount) / 1000));
    setPointsToUse(Math.max(0, Math.min(entered, maxP)));
  };

  const loadAdminData = async () => {
    try {
      const usersData = await api.adminGetUsers();
      setAdminUsers(usersData);
      
      const revData = await api.adminGetRevenue();
      setAdminRevenue(revData);
      
      const logsData = await api.adminGetAuditLogs();
      setAdminAuditLogs(logsData);
    } catch (err) {
      console.log('Error loading admin details:', err.message);
    }
  };

  const handleQuickLogin = async (role) => {
    let emailMap = 'demo@cinemax.vn';
    let passMap = '123456';
    if (role === 'staff') {
      emailMap = 'staff@metiz.vn';
      passMap = 'staff123';
    } else if (role === 'admin') {
      emailMap = 'admin@metiz.vn';
      passMap = 'admin123';
    }
    
    try {
      const data = await api.login(emailMap, passMap);
      api.setToken(data.token);
      setUser(data.user);
      Alert.alert('Đăng nhập nhanh', `Quyền: ${data.user.role.toUpperCase()}`);
      
      if (data.user.role === 'staff') {
        setStaffTab('checkin');
      } else if (data.user.role === 'admin') {
        setAdminTab('overview');
        loadAdminData();
      } else {
        loadHistory(data.user.id);
        loadUserLoyaltyAndVouchers(data.user.id);
      }
    } catch (err) {
      Alert.alert('Lỗi', err.message);
    }
  };

  const handleQRConfirm = async (confirmValue) => {
    if (!qrConfirmToken) {
      Alert.alert('Nhắc nhở', 'Vui lòng nhập mã QR phiên đăng nhập.');
      return;
    }
    
    try {
      setConfirmingQR(true);
      const res = await api.qrConfirm({
        sessionToken: qrConfirmToken.trim(),
        confirm: confirmValue,
        password: qrAdminPassword
      });
      
      if (res.requireAdminVerification) {
        Alert.alert('Bảo mật Admin', 'Vai trò Admin yêu cầu xác thực mật khẩu để tiếp tục.');
        setConfirmingQR(false);
        return;
      }
      
      Alert.alert(confirmValue ? 'Thành công 🎉' : 'Đã từ chối 🚫', res.message);
      if (res.success) {
        setShowQRConfirm(false);
        setQrConfirmToken('');
        setQrAdminPassword('');
      }
    } catch (err) {
      Alert.alert('Lỗi xác thực', err.message);
    } finally {
      setConfirmingQR(false);
    }
  };

  const startBooking = async (movie) => {
    setSelectedMovie(movie);
    setSelectedSeats([]);
    setAppliedPromo(null);
    setPromoCodeInput('');
    setAppliedVoucher(null);
    setVoucherDiscount(0);
    setUsePoints(false);
    setPointsToUse(0);
    setVoucherSuccess('');
    setVoucherError('');

    if (user) {
      loadUserLoyaltyAndVouchers(user.id);
    }

    const dates = getDates();
    const defaultDate = dates[0].value;
    setSelectedDate(defaultDate);
    setSelectedTime('14:10');
    
    try {
      const data = await api.getSeats(movie.id, defaultDate, '14:10');
      setBookedSeats(data.bookedSeats || []);
    } catch (err) {
      setBookedSeats(['A3', 'A4', 'B5', 'C8']); 
    }
    setCurrentPage('Booking');
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedSeats([]);
    try {
      const data = await api.getSeats(selectedMovie.id, date, selectedTime);
      setBookedSeats(data.bookedSeats || []);
    } catch (err) {
      setBookedSeats(['A3', 'A4', 'B5', 'C8']);
    }
  };

  const handleTimeChange = async (time) => {
    setSelectedTime(time);
    setSelectedSeats([]);
    try {
      const data = await api.getSeats(selectedMovie.id, selectedDate, time);
      setBookedSeats(data.bookedSeats || []);
    } catch (err) {
      setBookedSeats(['A3', 'A4', 'B5', 'C8']);
    }
  };

  const toggleSeat = (seatCode) => {
    if (selectedSeats.includes(seatCode)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatCode));
    } else {
      if (selectedSeats.length >= 10) {
        Alert.alert('Giới hạn', 'Bạn chỉ được chọn tối đa 10 ghế.');
        return;
      }
      setSelectedSeats(prev => [...prev, seatCode]);
    }
  };

  const applyPromoCode = () => {
    const matched = promotions.find(p => p.code.toUpperCase() === promoCodeInput.trim().toUpperCase());
    if (!matched) {
      Alert.alert('Thông báo', 'Mã khuyến mãi không tồn tại hoặc đã hết hạn!');
      setAppliedPromo(null);
      return;
    }
    setAppliedPromo(matched);
    Alert.alert('Thành công', `Đã áp dụng mã giảm giá: ${matched.title}`);
  };

  const confirmBooking = async () => {
    if (!user) {
      Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập tài khoản thành viên để tiếp tục đặt vé.');
      setCurrentPage('Profile');
      return;
    }
    if (selectedSeats.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất 1 ghế.');
      return;
    }

    try {
      const pricePerSeat = selectedMovie.room.includes('VIP') ? 75000 : 55000;
      const baseTotal = selectedSeats.length * pricePerSeat;

      // 1. Create booking (does not pass total, indicating multi-stage flow)
      const bookingResult = await api.createBooking({
        customerName: user.fullName,
        phone: user.phone || '0123456789',
        movieId: selectedMovie.id,
        date: selectedDate,
        time: selectedTime,
        seats: selectedSeats,
        userId: user.id
      });

      const bookingId = bookingResult.booking.id;

      // 2. Create payment with discount detail
      const paymentResult = await api.createPayment({
        bookingId,
        userId: user.id,
        paymentMethod: 'cash',
        amountBeforeDiscount: baseTotal,
        voucherCode: appliedVoucher ? appliedVoucher.code : null,
        pointsUsed: pointsToUse
      });

      const paymentId = paymentResult.payment.id;

      // 3. Confirm the payment
      const confirmResult = await api.confirmPayment({
        paymentId,
        staffName: user.fullName
      });

      // 4. Alert success and details
      let successMsg = `Cảm ơn bạn đã mua vé xem phim ${selectedMovie.title}!\n\nMã đặt vé: ${bookingId}\nGhế: ${selectedSeats.join(', ')}\nTổng thanh toán: ${paymentResult.payment.finalAmount.toLocaleString('vi-VN')} đ`;
      
      if (confirmResult.voucherAwarded) {
        successMsg += `\n\n🎁 QUÀ TẶNG TRI ÂN THÀNH VIÊN:\nChúc mừng bạn đạt mốc chi tiêu! Nhận ngay voucher: ${confirmResult.voucherAwarded.name} (${confirmResult.voucherAwarded.code})`;
      }

      Alert.alert('Đặt vé thành công 🎉', successMsg);

      // Refresh data
      loadHistory(user.id);
      loadUserLoyaltyAndVouchers(user.id);

      // Reset booking selection
      setSelectedSeats([]);
      setAppliedPromo(null);
      setAppliedVoucher(null);
      setVoucherDiscount(0);
      setUsePoints(false);
      setPointsToUse(0);
      setPromoCodeInput('');
      setCurrentPage('Profile');
    } catch (err) {
      Alert.alert('Đặt vé thất bại', err.message);
    }
  };

  // Concessions cart methods
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    Alert.alert('Đã chọn', `Thêm thành công 1 ${product.name} vào giỏ hàng.`);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQty = (productId, change) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + change;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const checkoutCart = async () => {
    if (cart.length === 0) return;
    
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const payload = {
      customerName: user ? user.fullName : 'Khách vãng lai',
      phone: user ? user.phone : '0999999999',
      items: cart.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
      total: cartTotal
    };

    try {
      await api.createOrder(payload);
      Alert.alert('Đặt mua thành công! 🍿', 'Sản phẩm đã được thanh toán và sẵn sàng nhận tại quầy concessions.');
      setCart([]);
    } catch (err) {
      Alert.alert('Giao dịch thất bại', err.message);
    }
  };

  // Staff Portal Actions
  const lookupStaffTickets = async () => {
    if (!staffLookupCode) {
      Alert.alert('Nhắc nhở', 'Vui lòng nhập mã vé hoặc SĐT khách hàng.');
      return;
    }
    try {
      const data = await api.lookupTickets(staffLookupCode);
      setStaffActiveBooking(data.booking);
      setStaffActiveTickets(data.tickets);
    } catch (err) {
      Alert.alert('Tra cứu thất bại', err.message);
      setStaffActiveBooking(null);
      setStaffActiveTickets([]);
    }
  };

  const checkinStaffTicket = async (ticketId) => {
    try {
      const result = await api.checkinTicket({ ticketId, staffName: user ? user.fullName : 'Soát vé viên' });
      Alert.alert('Kiểm vé thành công', result.message);
      setStaffCheckinCount(prev => prev + 1);
      // Reload tickets
      if (staffLookupCode) {
        const data = await api.lookupTickets(staffLookupCode);
        setStaffActiveTickets(data.tickets);
      }
    } catch (err) {
      Alert.alert('Lỗi', err.message);
    }
  };

  const loadStaffSeats = async () => {
    if (!staffMovieId || !staffDate || !staffTime) return;
    try {
      const seatData = await api.getSeats(Number(staffMovieId), staffDate, staffTime);
      setStaffBookedSeats(seatData.bookedSeats || []);
      setStaffSeats([]);
    } catch (err) {
      Alert.alert('Lỗi nạp ghế', err.message);
    }
  };

  const toggleStaffSeat = (seatCode) => {
    if (staffSeats.includes(seatCode)) {
      setStaffSeats(prev => prev.filter(s => s !== seatCode));
    } else {
      setStaffSeats(prev => [...prev, seatCode]);
    }
  };

  const executeCounterSales = async () => {
    if (staffSeats.length === 0) {
      Alert.alert('Thông báo', 'Hãy chọn ít nhất 1 ghế.');
      return;
    }
    const movieObj = movies.find(m => m.id === Number(staffMovieId));
    if (!movieObj) return;

    const pricePerSeat = movieObj.room.includes('VIP') ? 75000 : 55000;
    const total = staffSeats.length * pricePerSeat;

    const payload = {
      customerName: staffCustomerName,
      phone: staffPhone,
      movieId: Number(staffMovieId),
      movieTitle: movieObj.title,
      date: staffDate,
      time: staffTime,
      seats: staffSeats,
      total: total
    };

    try {
      await api.createBooking(payload);
      Alert.alert('Xuất vé thành công 🎉', 'Thu tiền mặt và in hóa đơn tại quầy thành công.');
      setStaffSalesCount(prev => prev + staffSeats.length);
      setStaffSeats([]);
      loadStaffSeats(); // Refresh grid
    } catch (err) {
      Alert.alert('Thất bại', err.message);
    }
  };

  // Admin Portal actions
  const changeUserRole = async (userId, newRole) => {
    try {
      const res = await api.adminUpdateUserRole(userId, newRole);
      Alert.alert('Thành công', res.message);
      loadAdminData(); // Refresh list
    } catch (err) {
      Alert.alert('Lỗi đổi quyền', err.message);
    }
  };

  const getAgeColor = (age) => {
    switch (age) {
      case 'P': return COLORS.green;
      case 'K': return COLORS.blue;
      case 'T13': return COLORS.orange;
      case 'T16': return '#ff7b00';
      case 'T18': return COLORS.red;
      default: return COLORS.textSecondary;
    }
  };

  const renderHome = () => (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {/* Featured Promotional Banner */}
      <View style={styles.heroContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800' }} 
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>⚡ APP ĐỘC QUYỀN</Text>
          </View>
          <Text style={styles.heroTitle}>Trải Nghiệm Điện Ảnh Đỉnh Cao 3D</Text>
          <Text style={styles.heroDesc}>Đồng bộ tức thì với toàn bộ hệ thống rạp chiếu tại Helio Đà Nẵng.</Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>PHIM ĐANG CHIẾU</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accentCyan} />
          <Text style={styles.loadingText}>Đang tải danh sách phim...</Text>
        </View>
      ) : (
        <View style={styles.movieGrid}>
          {movies.map((m) => (
            <View key={m.id} style={styles.movieCard}>
              <View style={styles.posterWrapper}>
                <Image source={{ uri: m.poster }} style={styles.moviePoster} />
                <View style={[styles.ageBadge, { backgroundColor: getAgeColor(m.age) }]}>
                  <Text style={styles.ageText}>{m.age}</Text>
                </View>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{m.duration || '120 min'}</Text>
                </View>
              </View>
              <Text style={styles.movieTitle} numberOfLines={1}>{m.title}</Text>
              <Text style={styles.movieMeta} numberOfLines={1}>🎬 {m.genre}</Text>
              <Text style={styles.movieRoomText}>📍 {m.room}</Text>
              <TouchableOpacity style={styles.bookingBtn} onPress={() => startBooking(m)}>
                <Text style={styles.bookingBtnText}>ĐẶT VÉ</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Modern Price List Section */}
      <View style={styles.pricingContainer}>
        <Text style={styles.pricingHeader}>🏷️ BẢNG GIÁ VÉ THAM KHẢO</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Ghế Thường (2D)</Text>
          <Text style={styles.priceValue}>55.000đ</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Phòng VIP (Ghế Da)</Text>
          <Text style={styles.priceValue}>75.000đ</Text>
        </View>
        <View style={styles.priceRow_last}>
          <Text style={styles.priceLabel}>Sweetbox (Ghế Đôi)</Text>
          <Text style={styles.priceValue_hot}>110.000đ</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderShop = () => {
    const filteredProducts = products.filter(p => p.category === activeCategory);
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Shop category buttons */}
          <View style={styles.shopCategoryContainer}>
            <TouchableOpacity 
              style={[styles.shopTab, activeCategory === 'combos' && styles.shopTabActive]}
              onPress={() => setActiveCategory('combos')}
            >
              <Text style={[styles.shopTabText, activeCategory === 'combos' && styles.shopTabTextActive]}>🍿 Bắp Nước</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.shopTab, activeCategory === 'merchandise' && styles.shopTabActive]}
              onPress={() => setActiveCategory('merchandise')}
            >
              <Text style={[styles.shopTabText, activeCategory === 'merchandise' && styles.shopTabTextActive]}>🥤 Ly Quà Tặng</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.shopTab, activeCategory === 'egifts' && styles.shopTabActive]}
              onPress={() => setActiveCategory('egifts')}
            >
              <Text style={[styles.shopTabText, activeCategory === 'egifts' && styles.shopTabTextActive]}>🎁 Thẻ Quà eGift</Text>
            </TouchableOpacity>
          </View>

          {shopLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.accentCyan} />
            </View>
          ) : (
            <View style={styles.shopGrid}>
              {filteredProducts.map(p => (
                <View key={p.id} style={styles.shopCard}>
                  <Image source={{ uri: p.img }} style={styles.shopPoster} />
                  <Text style={styles.shopTitle} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.shopDesc} numberOfLines={2}>{p.desc}</Text>
                  <View style={styles.shopBuyRow}>
                    <Text style={styles.shopPriceText}>{p.price.toLocaleString('vi-VN')}đ</Text>
                    <TouchableOpacity style={styles.shopBuyBtn} onPress={() => addToCart(p)}>
                      <Text style={styles.shopBuyBtnText}>CHỌN</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Cart display inside shop if not empty */}
          {cart.length > 0 && (
            <View style={styles.cartSticky}>
              <Text style={styles.cartTitle}>🛒 GIỎ HÀNG CONCESSIONS</Text>
              {cart.map(item => (
                <View key={item.id} style={styles.cartItemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</Text>
                  </View>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCartQty(item.id, -1)}>
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCartQty(item.id, 1)}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.removeCartBtn} onPress={() => removeFromCart(item.id)}>
                      <Text style={styles.removeCartBtnText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <View style={styles.cartDivider} />
              <View style={styles.cartTotalRow}>
                <Text style={styles.cartTotalLabel}>Tổng thanh toán:</Text>
                <Text style={styles.cartTotalVal}>{cartTotal.toLocaleString('vi-VN')}đ</Text>
              </View>
              <TouchableOpacity style={styles.cartCheckoutBtn} onPress={checkoutCart}>
                <Text style={styles.cartCheckoutBtnText}>XÁC NHẬN THANH TOÁN</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderBooking = () => {
    if (!selectedMovie) return null;
    const pricePerSeat = selectedMovie.room.includes('VIP') ? 75000 : 55000;
    const rows = 'ABCDEF'.split('');
    const dates = getDates();
    
    // Calculate final ticket amount
    const baseTotal = selectedSeats.length * pricePerSeat;
    const pointDiscount = pointsToUse * 1000;
    const finalTotal = Math.max(0, baseTotal - voucherDiscount - pointDiscount);

    return (
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Short Movie Banner Info */}
        <View style={styles.bookingMovieBanner}>
          <Image source={{ uri: selectedMovie.poster }} style={styles.bannerBlurBg} blurRadius={15} />
          <View style={styles.bannerOverlayShadow} />
          <View style={styles.bannerContent}>
            <Image source={{ uri: selectedMovie.poster }} style={styles.miniPoster} />
            <View style={styles.miniPosterDetails}>
              <Text style={styles.miniMovieTitle} numberOfLines={2}>{selectedMovie.title}</Text>
              <View style={styles.miniMetaRow}>
                <View style={[styles.miniAgeBadge, { backgroundColor: getAgeColor(selectedMovie.age) }]}>
                  <Text style={styles.ageText}>{selectedMovie.age}</Text>
                </View>
                <Text style={styles.miniGenreText}>{selectedMovie.genre}</Text>
              </View>
              <Text style={styles.miniRoomText}>📍 {selectedMovie.room}</Text>
            </View>
          </View>
        </View>

        {/* 1. Date Selector Scroll */}
        <Text style={styles.stepTitle}>1. Chọn ngày chiếu</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {dates.map((dateObj) => {
            const isSelected = selectedDate === dateObj.value;
            return (
              <TouchableOpacity 
                key={dateObj.value} 
                style={[styles.dateCard, isSelected && styles.dateCardActive]}
                onPress={() => handleDateChange(dateObj.value)}
              >
                <Text style={[styles.dateCardLabel, isSelected && styles.dateTextActive]}>{dateObj.label}</Text>
                <Text style={[styles.dateCardSub, isSelected && styles.dateTextSubActive]}>{dateObj.subLabel}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 2. Showtime Selector Scroll */}
        <Text style={styles.stepTitle}>2. Chọn khung giờ</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {showtimeList.map((timeStr) => {
            const isSelected = selectedTime === timeStr;
            return (
              <TouchableOpacity 
                key={timeStr} 
                style={[styles.timeCard, isSelected && styles.timeCardActive]}
                onPress={() => handleTimeChange(timeStr)}
              >
                <Text style={[styles.timeCardText, isSelected && styles.timeTextActive]}>{timeStr}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 3. Seat Selection */}
        <Text style={styles.stepTitle}>3. Chọn ghế</Text>

        {/* Curved Screen Arc */}
        <View style={styles.screenIndicatorContainer}>
          <View style={styles.screenGlowLine} />
          <Text style={styles.screenGlowText}>MÀN HÌNH CHÍNH (SCREEN)</Text>
        </View>

        {/* Seats Grid with Aisle Split */}
        <View style={styles.seatsContainer}>
          {rows.map((row) => (
            <View key={row} style={styles.seatRow}>
              {/* Row Label (Left) */}
              <Text style={styles.rowLetter}>{row}</Text>
              
              {/* Seat Buttons (Split 4 and 4) */}
              <View style={styles.rowSeatsBlock}>
                {Array.from({ length: 8 }, (_, colIdx) => {
                  const seatCode = `${row}${colIdx + 1}`;
                  const isBooked = bookedSeats.includes(seatCode);
                  const isSelected = selectedSeats.includes(seatCode);
                  
                  return (
                    <React.Fragment key={seatCode}>
                      <TouchableOpacity
                        disabled={isBooked}
                        style={[
                          styles.seatUnit,
                          isBooked && styles.seatUnitBooked,
                          isSelected && styles.seatUnitSelected
                        ]}
                        onPress={() => toggleSeat(seatCode)}
                      >
                        {isBooked ? (
                          <Text style={styles.seatUnitTextMuted}>×</Text>
                        ) : (
                          <Text style={[styles.seatUnitText, isSelected && styles.seatUnitTextActive]}>
                            {colIdx + 1}
                          </Text>
                        )}
                      </TouchableOpacity>
                      {/* Insert Aisle Space after seat 4 */}
                      {colIdx === 3 && <View style={styles.aisleSpace} />}
                    </React.Fragment>
                  );
                })}
              </View>

              {/* Row Label (Right) */}
              <Text style={styles.rowLetter}>{row}</Text>
            </View>
          ))}
        </View>

        {/* Custom Legend */}
        <View style={styles.legendWrapper}>
          <View style={styles.legendCell}>
            <View style={styles.legendBoxEmpty} />
            <Text style={styles.legendLabel}>Ghế trống</Text>
          </View>
          <View style={styles.legendCell}>
            <View style={styles.legendBoxSelected} />
            <Text style={styles.legendLabel}>Đang chọn</Text>
          </View>
          <View style={styles.legendCell}>
            <View style={styles.legendBoxBooked}>
              <Text style={styles.legendBookedText}>×</Text>
            </View>
            <Text style={styles.legendLabel}>Đã đặt</Text>
          </View>
        </View>

        {/* 4. Voucher & Discount Selection */}
        <Text style={styles.stepTitle}>4. Chọn Voucher / Quà tặng</Text>
        <View style={styles.promoForm}>
          <TextInput 
            style={styles.promoInput} 
            placeholder="Nhập mã voucher khác" 
            placeholderTextColor="#64748b"
            value={promoCodeInput}
            onChangeText={setPromoCodeInput}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.promoBtn} onPress={() => handleApplyVoucherCode(promoCodeInput)}>
            <Text style={styles.promoBtnText}>ÁP DỤNG</Text>
          </TouchableOpacity>
        </View>

        {/* User's Own Vouchers List */}
        {user && userVouchers && userVouchers.length > 0 ? (
          <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
            <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 6, fontWeight: 'bold' }}>
              Voucher trong ví của bạn (Nhấn để chọn):
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
              {userVouchers.map((v) => {
                const isSelected = appliedVoucher && appliedVoucher.code === v.code;
                return (
                  <TouchableOpacity
                    key={v.id}
                    onPress={() => {
                      if (isSelected) {
                        handleApplyVoucherCode('');
                      } else {
                        handleApplyVoucherCode(v.code);
                      }
                    }}
                    style={{
                      backgroundColor: isSelected ? 'rgba(0, 242, 254, 0.15)' : COLORS.cardBg,
                      borderColor: isSelected ? COLORS.accentCyan : COLORS.border,
                      borderWidth: 1,
                      borderRadius: 8,
                      padding: 10,
                      marginRight: 8,
                      width: 160
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: isSelected ? COLORS.accentCyan : '#fff' }} numberOfLines={1}>
                      {v.code}
                    </Text>
                    <Text style={{ fontSize: 9, color: COLORS.textSecondary, marginTop: 2 }} numberOfLines={2}>
                      {v.name}
                    </Text>
                    <Text style={{ fontSize: 9, color: COLORS.accentPink, fontWeight: 'bold', marginTop: 4 }}>
                      Giảm {v.discountType === 'percent' ? `${v.discountValue}%` : `${v.discountValue.toLocaleString()}đ`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          user && (
            <Text style={{ fontSize: 10, color: COLORS.textSecondary, marginHorizontal: 16, marginBottom: 12, fontStyle: 'italic' }}>
              Bạn chưa có voucher nào trong ví.
            </Text>
          )
        )}

        {voucherSuccess ? (
          <View style={[styles.appliedPromoCard, { borderColor: COLORS.green }]}>
            <Text style={[styles.appliedPromoText, { color: COLORS.green }]}>🎉 {voucherSuccess}</Text>
          </View>
        ) : null}

        {/* 5. Loyalty Points Redemption */}
        {user && (userLoyalty?.totalPoints > 0 || user?.points > 0) ? (
          <View style={{ marginHorizontal: 16, marginBottom: 16, backgroundColor: COLORS.cardBg, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>Dùng điểm tích lũy Metiz</Text>
                <Text style={{ fontSize: 10, color: COLORS.textSecondary, marginTop: 2 }}>
                  Bạn có: {userLoyalty?.totalPoints ?? user.points} điểm (1 điểm = 1.000đ)
                </Text>
              </View>
              <Switch
                value={usePoints}
                onValueChange={handleUsePointsToggle}
                trackColor={{ false: '#334155', true: COLORS.accentCyan }}
                thumbColor={usePoints ? '#fff' : '#94a3b8'}
              />
            </View>

            {usePoints && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <Text style={{ fontSize: 11, color: '#fff', marginRight: 10 }}>Nhập số điểm cần dùng:</Text>
                <TextInput
                  style={{
                    backgroundColor: COLORS.cardBgLight,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderRadius: 6,
                    color: '#fff',
                    paddingHorizontal: 8,
                    height: 32,
                    width: 80,
                    textAlign: 'center',
                    fontSize: 12
                  }}
                  keyboardType="numeric"
                  value={String(pointsToUse)}
                  onChangeText={handlePointsChange}
                />
              </View>
            )}
          </View>
        ) : null}

        {/* Glowing Checkout summary ticket */}
        <View style={styles.checkoutTicket}>
          <View style={styles.ticketDottedLine} />
          
          <View style={styles.checkoutRow}>
            <Text style={styles.checkoutLabel}>Ghế đã chọn:</Text>
            <Text style={styles.checkoutValueCyan}>
              {selectedSeats.length > 0 ? selectedSeats.sort().join(', ') : 'Chưa chọn'}
            </Text>
          </View>

          <View style={styles.checkoutRow}>
            <Text style={styles.checkoutLabel}>Tổng tiền gốc:</Text>
            <Text style={styles.checkoutValue}>{baseTotal.toLocaleString('vi-VN')} đ</Text>
          </View>

          {voucherDiscount > 0 && (
            <View style={styles.checkoutRow}>
              <Text style={styles.checkoutLabel}>Giảm giá voucher:</Text>
              <Text style={[styles.checkoutValue, { color: COLORS.green }]}>
                -{ voucherDiscount.toLocaleString('vi-VN') } đ
              </Text>
            </View>
          )}

          {pointDiscount > 0 && (
            <View style={styles.checkoutRow}>
              <Text style={styles.checkoutLabel}>Giảm giá điểm thưởng:</Text>
              <Text style={[styles.checkoutValue, { color: COLORS.green }]}>
                -{ pointDiscount.toLocaleString('vi-VN') } đ
              </Text>
            </View>
          )}

          <View style={styles.checkoutRowTotal}>
            <Text style={styles.checkoutLabelTotal}>TỔNG TIỀN THANH TOÁN:</Text>
            <Text style={styles.checkoutValueTotal}>
              {finalTotal.toLocaleString('vi-VN')} đ
            </Text>
          </View>

          <TouchableOpacity style={styles.confirmCheckoutBtn} onPress={confirmBooking}>
            <Text style={styles.confirmCheckoutText}>XÁC NHẬN THANH TOÁN & ĐẶT VÉ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // Sub-renderers for Profile / Actor Portals
  const renderMemberDashboard = () => (
    <View style={{ paddingBottom: 20 }}>
      {/* Member Card */}
      <View style={styles.memberCardContainer}>
        <View style={styles.memberCardGlow} />
        <View style={styles.memberCardHeader}>
          <View style={styles.avatarWrapper}>
            <Text style={styles.avatarInitial}>{user.fullName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.memberCardTitleSec}>
            <Text style={styles.memberCardName} numberOfLines={1}>{user.fullName}</Text>
            <Text style={styles.memberCardEmail} numberOfLines={1}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.memberTierRow}>
          <View style={styles.tierBadge}>
            <Text style={styles.tierBadgeText}>👑 {user.tier}</Text>
          </View>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsBadgeText}>💎 {user.points} Điểm</Text>
          </View>
        </View>

        {/* Custom Progress Bar for Rewards */}
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${Math.min((user.points / 500) * 100, 100)}%` }]} />
          </View>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressSubText}>Tiến trình VIP</Text>
            <Text style={styles.progressSubText}>{user.points} / 500đ</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.bookingBtn, { marginHorizontal: 0, marginVertical: 10, backgroundColor: COLORS.accentCyan }]}
        onPress={() => { setShowQRConfirm(true); setQrConfirmToken(''); setQrAdminPassword(''); }}
      >
        <Text style={[styles.bookingBtnText, { color: '#090e1a', fontWeight: 'bold' }]}>📱 QUÉT QR ĐĂNG NHẬP PC</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => setUser(null)}>
        <Text style={styles.logoutBtnText}>ĐĂNG XUẤT TÀI KHOẢN</Text>
      </TouchableOpacity>

      {/* Ticket History Stub layout */}
      <Text style={styles.historySectionHeader}>🎟️ LỊCH SỬ ĐẶT VÉ</Text>
      {bookingsHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Bạn chưa có giao dịch nào.</Text>
        </View>
      ) : (
        bookingsHistory.map((item) => (
          <View key={item.id} style={styles.stubTicket}>
            {/* Left Side: Film info */}
            <View style={styles.stubLeft}>
              <Text style={styles.stubTitle} numberOfLines={1}>{item.movieTitle}</Text>
              <Text style={styles.stubMeta}>📅 {item.date} • 🕒 {item.time}</Text>
              <Text style={styles.stubSeats}>🛋️ Ghế: <Text style={{ color: COLORS.accentCyan, fontWeight: '800' }}>{item.seats ? item.seats.join(', ') : ''}</Text></Text>
              <Text style={styles.stubCode}>Mã vé: {item.id}</Text>
            </View>
            {/* Dashed vertical separator */}
            <View style={styles.stubDivider}>
              <View style={styles.notchTop} />
              <View style={styles.dashLine} />
              <View style={styles.notchBottom} />
            </View>
            {/* Right Side: Price / Scan stub */}
            <View style={styles.stubRight}>
              <Text style={styles.stubTotalLabel}>TỔNG CHI</Text>
              <Text style={styles.stubPrice}>{(item.total || 0).toLocaleString('vi-VN')}đ</Text>
              <View style={styles.stubBarcodePlaceholder}>
                <View style={styles.bar1} />
                <View style={styles.bar2} />
                <View style={styles.bar3} />
                <View style={styles.bar4} />
                <View style={styles.bar1} />
                <View style={styles.bar3} />
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderStaffDashboard = () => (
    <View style={{ paddingHorizontal: 16 }}>
      {/* Portal Header */}
      <View style={styles.portalCard}>
        <Text style={styles.portalRole}>🛠️ QUẦY NHÂN VIÊN</Text>
        <Text style={styles.portalWelcome}>Xin chào: {user.fullName}</Text>
      </View>

      {/* Staff category selectors */}
      <View style={styles.subTabRow}>
        <TouchableOpacity 
          style={[styles.subTabButton, staffTab === 'checkin' && styles.subTabActive]} 
          onPress={() => setStaffTab('checkin')}
        >
          <Text style={styles.subTabText}>🔍 Soát Vé</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.subTabButton, staffTab === 'counter-sales' && styles.subTabActive]} 
          onPress={() => {
            setStaffTab('counter-sales');
            loadStaffSeats();
          }}
        >
          <Text style={styles.subTabText}>🎟️ Bán Vé Quầy</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.subTabButton, staffTab === 'shift-report' && styles.subTabActive]} 
          onPress={() => setStaffTab('shift-report')}
        >
          <Text style={styles.subTabText}>📊 Ca Làm</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.portalContentBox}>
        {staffTab === 'checkin' && (
          <View>
            <Text style={styles.portalSectionTitle}>🔍 KIỂM TRA & SOÁT VÉ</Text>
            <View style={styles.portalInputRow}>
              <TextInput 
                style={styles.portalInput} 
                placeholder="BK... hoặc Số Điện Thoại"
                placeholderTextColor="#64748b"
                value={staffLookupCode}
                onChangeText={setStaffLookupCode}
              />
              <TouchableOpacity style={styles.portalBtn} onPress={lookupStaffTickets}>
                <Text style={styles.portalBtnText}>TÌM</Text>
              </TouchableOpacity>
            </View>

            {staffActiveBooking && (
              <View style={styles.staffLookupCard}>
                <Text style={styles.staffDetailText}>👤 Khách hàng: <Text style={{ color: '#fff', fontWeight: 'bold' }}>{staffActiveBooking.customerName}</Text></Text>
                <Text style={styles.staffDetailText}>🎬 Phim: <Text style={{ color: '#fff', fontWeight: 'bold' }}>{staffActiveBooking.movieTitle}</Text></Text>
                <Text style={styles.staffDetailText}>🕒 Suất chiếu: <Text style={{ color: COLORS.accentCyan }}>{staffActiveBooking.time} ({staffActiveBooking.date})</Text></Text>
                <Text style={styles.staffDetailText}>🛋️ Ghế: <Text style={{ color: COLORS.accentCyan, fontWeight: 'bold' }}>{staffActiveBooking.seats.join(', ')}</Text></Text>
                
                <Text style={styles.ticketsSubTitle}>Từng Ghế Thành Phần:</Text>
                {staffActiveTickets.map(tk => (
                  <View key={tk.id} style={styles.staffTicketRow}>
                    <Text style={styles.staffTicketSeat}>{tk.seat}</Text>
                    {tk.status === 'valid' ? (
                      <TouchableOpacity style={styles.checkinConfirmBtn} onPress={() => checkinStaffTicket(tk.id)}>
                        <Text style={styles.checkinConfirmBtnText}>XÁC NHẬN SOÁT VÉ</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.checkedInLabel}>✓ Đã Soát</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {staffTab === 'counter-sales' && (
          <View>
            <Text style={styles.portalSectionTitle}>🎟️ BÁN VÉ TRỰC TIẾP TẠI QUẦY</Text>
            
            <View style={styles.adminDropdownRow}>
              <Text style={styles.dropdownLabel}>Chọn Phim:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
                {movies.map(m => (
                  <TouchableOpacity 
                    key={m.id} 
                    style={[styles.dropdownItem, staffMovieId === m.id.toString() && styles.dropdownItemActive]}
                    onPress={() => {
                      setStaffMovieId(m.id.toString());
                      setStaffSeats([]);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{m.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.adminDropdownRow}>
              <Text style={styles.dropdownLabel}>Suất Chiếu:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
                {showtimeList.map(t => (
                  <TouchableOpacity 
                    key={t} 
                    style={[styles.dropdownItem, staffTime === t && styles.dropdownItemActive]}
                    onPress={() => {
                      setStaffTime(t);
                      setStaffSeats([]);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity style={styles.loadSeatsBtn} onPress={loadStaffSeats}>
              <Text style={styles.loadSeatsBtnText}>NẠP SƠ ĐỒ GHẾ TRỐNG</Text>
            </TouchableOpacity>

            {/* Custom counter seats */}
            <View style={[styles.seatsContainer, { marginHorizontal: 0, marginTop: 15 }]}>
              <View style={styles.screenIndicatorContainer}>
                <View style={styles.screenGlowLine} />
              </View>
              
              {'ABCDEF'.split('').map(row => (
                <View key={row} style={styles.seatRow}>
                  <Text style={styles.rowLetter}>{row}</Text>
                  <View style={styles.rowSeatsBlock}>
                    {Array.from({ length: 8 }, (_, colIdx) => {
                      const seatCode = `${row}${colIdx + 1}`;
                      const isBooked = staffBookedSeats.includes(seatCode);
                      const isSelected = staffSeats.includes(seatCode);
                      
                      return (
                        <React.Fragment key={seatCode}>
                          <TouchableOpacity
                            disabled={isBooked}
                            style={[
                              styles.seatUnit,
                              isBooked && styles.seatUnitBooked,
                              isSelected && styles.seatUnitSelected
                            ]}
                            onPress={() => toggleStaffSeat(seatCode)}
                          >
                            {isBooked ? (
                              <Text style={styles.seatUnitTextMuted}>×</Text>
                            ) : (
                              <Text style={[styles.seatUnitText, isSelected && styles.seatUnitTextActive]}>
                                {colIdx + 1}
                              </Text>
                            )}
                          </TouchableOpacity>
                          {colIdx === 3 && <View style={styles.aisleSpace} />}
                        </React.Fragment>
                      );
                    })}
                  </View>
                  <Text style={styles.rowLetter}>{row}</Text>
                </View>
              ))}
            </View>

            <TextInput 
              style={styles.portalInputForm}
              placeholder="Tên khách hàng"
              placeholderTextColor="#64748b"
              value={staffCustomerName}
              onChangeText={setStaffCustomerName}
            />
            <TextInput 
              style={styles.portalInputForm}
              placeholder="SĐT khách hàng"
              placeholderTextColor="#64748b"
              value={staffPhone}
              onChangeText={setStaffPhone}
            />

            <View style={styles.counterSummary}>
              <Text style={styles.counterSummaryText}>Ghế đã chọn: <Text style={{ color: COLORS.accentCyan, fontWeight: 'bold' }}>{staffSeats.join(', ') || 'Chưa chọn'}</Text></Text>
              <Text style={styles.counterSummaryText}>Tổng tiền: <Text style={{ color: COLORS.accentPink, fontWeight: 'bold' }}>{(staffSeats.length * 55000).toLocaleString('vi-VN')} đ</Text></Text>
            </View>

            <TouchableOpacity style={styles.executeCounterBtn} onPress={executeCounterSales}>
              <Text style={styles.executeCounterBtnText}>XUẤT VÉ & THU TIỀN</Text>
            </TouchableOpacity>
          </View>
        )}

        {staffTab === 'shift-report' && (
          <View>
            <Text style={styles.portalSectionTitle}>📊 BÁO CÁO CA LÀM VIỆC</Text>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Vé đã soát tại cổng:</Text>
              <Text style={styles.metricVal}>{staffCheckinCount} vé</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Vé đã xuất tại quầy:</Text>
              <Text style={styles.metricVal}>{staffSalesCount} vé</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Doanh thu thu tiền mặt:</Text>
              <Text style={[styles.metricVal, { color: COLORS.green }]}>{(staffSalesCount * 55000).toLocaleString('vi-VN')}đ</Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.bookingBtn, { marginHorizontal: 0, marginVertical: 10, backgroundColor: COLORS.accentCyan }]}
        onPress={() => { setShowQRConfirm(true); setQrConfirmToken(''); setQrAdminPassword(''); }}
      >
        <Text style={[styles.bookingBtnText, { color: '#090e1a', fontWeight: 'bold' }]}>📱 QUÉT QR ĐĂNG NHẬP PC</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.logoutBtn, { marginHorizontal: 0 }]} onPress={() => setUser(null)}>
        <Text style={styles.logoutBtnText}>ĐĂNG XUẤT TÀI KHOẢN</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAdminDashboard = () => (
    <View style={{ paddingHorizontal: 16 }}>
      {/* Portal Header */}
      <View style={[styles.portalCard, { borderColor: COLORS.accentPink }]}>
        <Text style={[styles.portalRole, { color: COLORS.accentPink }]}>👑 QUẢN TRỊ VIÊN</Text>
        <Text style={styles.portalWelcome}>Xin chào Admin: {user.fullName}</Text>
      </View>

      {/* Admin category selectors */}
      <View style={styles.subTabRow}>
        <TouchableOpacity 
          style={[styles.subTabButton, adminTab === 'overview' && styles.subTabActive]} 
          onPress={() => setAdminTab('overview')}
        >
          <Text style={styles.subTabText}>📊 Tổng quan</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.subTabButton, adminTab === 'users' && styles.subTabActive]} 
          onPress={() => setAdminTab('users')}
        >
          <Text style={styles.subTabText}>👥 Người Dùng</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.subTabButton, adminTab === 'audit' && styles.subTabActive]} 
          onPress={() => setAdminTab('audit')}
        >
          <Text style={styles.subTabText}>📜 Nhật ký</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.portalContentBox}>
        {adminTab === 'overview' && adminRevenue && (
          <View>
            <Text style={styles.portalSectionTitle}>📊 BÁO CÁO DOANH THU HỆ THỐNG</Text>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Tổng doanh thu bán vé:</Text>
              <Text style={[styles.metricVal, { color: COLORS.accentCyan }]}>{adminRevenue.totalRevenueTickets ? adminRevenue.totalRevenueTickets.toLocaleString('vi-VN') : 0}đ</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Tổng doanh thu bắp nước:</Text>
              <Text style={[styles.metricVal, { color: COLORS.accentCyan }]}>{adminRevenue.totalRevenueConcessions ? adminRevenue.totalRevenueConcessions.toLocaleString('vi-VN') : 0}đ</Text>
            </View>
            <View style={[styles.metricItem, { borderTopWidth: 1, borderColor: COLORS.border, paddingTop: 10 }]}>
              <Text style={[styles.metricLabel, { fontWeight: 'bold', color: '#fff' }]}>TỔNG THU HỆ THỐNG:</Text>
              <Text style={[styles.metricVal, { color: COLORS.green, fontWeight: 'bold' }]}>
                {((adminRevenue.totalRevenueTickets || 0) + (adminRevenue.totalRevenueConcessions || 0)).toLocaleString('vi-VN')}đ
              </Text>
            </View>
          </View>
        )}

        {adminTab === 'users' && (
          <View>
            <Text style={styles.portalSectionTitle}>👥 PHÂN QUYỀN HỘI VIÊN (RBAC)</Text>
            {adminUsers.map(u => (
              <View key={u.id} style={styles.userRoleCard}>
                <View>
                  <Text style={styles.userRoleName}>{u.fullName}</Text>
                  <Text style={styles.userRoleEmail}>{u.email}</Text>
                  <Text style={styles.userRoleRole}>Quyền hiện tại: <Text style={{ color: COLORS.accentCyan, fontWeight: 'bold' }}>{u.role.toUpperCase()}</Text></Text>
                </View>
                <View style={styles.roleActionButtons}>
                  <TouchableOpacity style={styles.roleBtn} onPress={() => changeUserRole(u.id, 'member')}>
                    <Text style={styles.roleBtnText}>MEMBER</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.roleBtn, { backgroundColor: '#8e44ad' }]} onPress={() => changeUserRole(u.id, 'staff')}>
                    <Text style={styles.roleBtnText}>STAFF</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.roleBtn, { backgroundColor: COLORS.accentPink }]} onPress={() => changeUserRole(u.id, 'admin')}>
                    <Text style={styles.roleBtnText}>ADMIN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {adminTab === 'audit' && (
          <View>
            <Text style={styles.portalSectionTitle}>📜 NHẬT KÝ HOẠT ĐỘNG HỆ THỐNG</Text>
            {adminAuditLogs.length === 0 ? (
              <Text style={styles.emptyText}>Chưa có nhật ký hoạt động.</Text>
            ) : (
              adminAuditLogs.map(log => (
                <View key={log.id} style={styles.auditLogCard}>
                  <Text style={styles.auditActor}>👤 Tác nhân: {log.actor}</Text>
                  <Text style={styles.auditAction}>⚡ Hành động: {log.action}</Text>
                  <Text style={styles.auditDetails}>📝 Chi tiết: {log.details}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.bookingBtn, { marginHorizontal: 0, marginVertical: 10, backgroundColor: COLORS.accentCyan }]}
        onPress={() => { setShowQRConfirm(true); setQrConfirmToken(''); setQrAdminPassword(''); }}
      >
        <Text style={[styles.bookingBtnText, { color: '#090e1a', fontWeight: 'bold' }]}>📱 QUÉT QR ĐĂNG NHẬP PC</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.logoutBtn, { marginHorizontal: 0 }]} onPress={() => setUser(null)}>
        <Text style={styles.logoutBtnText}>ĐĂNG XUẤT TÀI KHOẢN</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProfile = () => (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {user ? (
        user.role === 'staff' ? (
          renderStaffDashboard()
        ) : user.role === 'admin' ? (
          renderAdminDashboard()
        ) : (
          renderMemberDashboard()
        )
      ) : (
        <View style={styles.loginWrapper}>
          <View style={styles.loginHeaderCenter}>
            <Text style={styles.loginLogoText}>METIZ</Text>
            <Text style={styles.loginSubTextText}>HỘI VIÊN ĐIỆN ẢNH</Text>
          </View>

          <View style={styles.loginFormCard}>
            <Text style={styles.formTitle}>Đăng Nhập Tá Vương</Text>
            
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>EMAIL</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Nhập địa chỉ email" 
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>MẬT KHẨU</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Nhập mật khẩu" 
                placeholderTextColor="#64748b"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity style={styles.loginActionBtn} onPress={handleLogin}>
              <Text style={styles.loginActionText}>ĐĂNG NHẬP NGAY</Text>
            </TouchableOpacity>

            <Text style={styles.quickLoginHeader}>⚡ ĐĂNG NHẬP NHANH 1-CLICK</Text>
            <View style={styles.quickLoginRow}>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: COLORS.accentCyan }]} onPress={() => handleQuickLogin('member')}>
                <Text style={[styles.quickBtnText, { color: '#090e1a' }]}>HỘI VIÊN</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#8e44ad' }]} onPress={() => handleQuickLogin('staff')}>
                <Text style={styles.quickBtnText}>NHÂN VIÊN</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: COLORS.accentPink }]} onPress={() => handleQuickLogin('admin')}>
                <Text style={styles.quickBtnText}>ADMIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.headerLogoContainer}>
          <Text style={styles.logoMetiz}>METIZ</Text>
          <Text style={styles.logoCinema}>CINEMA</Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Đồng bộ Web</Text>
        </View>
      </View>

      {/* Active Page Screen */}
      {currentPage === 'Home' && renderHome()}
      {currentPage === 'Shop' && renderShop()}
      {currentPage === 'Booking' && renderBooking()}
      {currentPage === 'Profile' && renderProfile()}

      {/* Floating Glassmorphic Tabs Bar */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={styles.tabButton}
          onPress={() => setCurrentPage('Home')}
        >
          <Text style={[styles.tabIcon, currentPage === 'Home' && styles.activeTabText]}>🏠</Text>
          <Text style={[styles.tabText, currentPage === 'Home' && styles.activeTabText]}>Trang Chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabButton}
          onPress={() => setCurrentPage('Shop')}
        >
          <Text style={[styles.tabIcon, currentPage === 'Shop' && styles.activeTabText]}>🍿</Text>
          <Text style={[styles.tabText, currentPage === 'Shop' && styles.activeTabText]}>Mua Sắm</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabButton}
          onPress={() => selectedMovie ? setCurrentPage('Booking') : Alert.alert('Thông báo', 'Vui lòng chọn phim ở Trang Chủ trước.')}
        >
          <Text style={[styles.tabIcon, currentPage === 'Booking' && styles.activeTabText]}>🎟️</Text>
          <Text style={[styles.tabText, currentPage === 'Booking' && styles.activeTabText]}>Đặt Vé</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabButton}
          onPress={() => setCurrentPage('Profile')}
        >
          <Text style={[styles.tabIcon, currentPage === 'Profile' && styles.activeTabText]}>👤</Text>
          <Text style={[styles.tabText, currentPage === 'Profile' && styles.activeTabText]}>Hội Viên</Text>
        </TouchableOpacity>
      </View>

      {/* 9. SIMULATED QR LOGIN CONFIRMATION MODAL */}
      {showQRConfirm && (
        <View style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(8, 12, 22, 0.95)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <View style={{
            backgroundColor: COLORS.cardBg,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: COLORS.accentCyan,
            padding: 24,
            width: '100%',
            maxWidth: 360,
            shadowColor: COLORS.accentCyan,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 5
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '900',
              color: COLORS.accentCyan,
              textAlign: 'center',
              marginBottom: 10
            }}>
              📱 XÁC NHẬN ĐĂNG NHẬP QR
            </Text>

            <Text style={{
              fontSize: 12,
              color: COLORS.textSecondary,
              textAlign: 'center',
              lineHeight: 16,
              marginBottom: 20
            }}>
              Vui lòng nhập mã phiên hiển thị trên màn hình PC và xác nhận để tiếp tục đăng nhập.
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 10,
                fontWeight: 'bold',
                color: COLORS.textSecondary,
                marginBottom: 6
              }}>
                MÃ PHIÊN QR (SESSION TOKEN)
              </Text>
              <TextInput
                style={{
                  backgroundColor: COLORS.cardBgLight,
                  borderColor: COLORS.border,
                  borderWidth: 1,
                  borderRadius: 6,
                  color: '#fff',
                  padding: 10,
                  fontSize: 14
                }}
                placeholder="QR_LOGIN_XXXXXXXX"
                placeholderTextColor="#64748b"
                value={qrConfirmToken}
                onChangeText={setQrConfirmToken}
                autoCapitalize="characters"
              />
            </View>

            {user?.role === 'admin' && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{
                  fontSize: 10,
                  fontWeight: 'bold',
                  color: COLORS.accentPink,
                  marginBottom: 6
                }}>
                  MẬT KHẨU ADMIN (BẮT BUỘC 2FA)
                </Text>
                <TextInput
                  style={{
                    backgroundColor: COLORS.cardBgLight,
                    borderColor: COLORS.accentPink,
                    borderWidth: 1,
                    borderRadius: 6,
                    color: '#fff',
                    padding: 10,
                    fontSize: 14
                  }}
                  placeholder="Nhập mật khẩu Admin"
                  placeholderTextColor="#64748b"
                  secureTextEntry
                  value={qrAdminPassword}
                  onChangeText={setQrAdminPassword}
                />
              </View>
            )}

            {confirmingQR ? (
              <ActivityIndicator size="small" color={COLORS.accentCyan} style={{ marginVertical: 12 }} />
            ) : (
              <View style={{ gap: 10, marginTop: 10 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: COLORS.accentCyan,
                    paddingVertical: 12,
                    borderRadius: 6,
                    alignItems: 'center'
                  }}
                  onPress={() => handleQRConfirm(true)}
                >
                  <Text style={{ color: '#080c16', fontWeight: '900', fontSize: 13 }}>
                    ĐỒNG Ý ĐĂNG NHẬP
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: COLORS.red,
                    paddingVertical: 12,
                    borderRadius: 6,
                    alignItems: 'center'
                  }}
                  onPress={() => handleQRConfirm(false)}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>
                    TỪ CHỐI YÊU CẦU
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    paddingVertical: 10,
                    alignItems: 'center'
                  }}
                  onPress={() => {
                    setShowQRConfirm(false);
                    setQrConfirmToken('');
                    setQrAdminPassword('');
                  }}
                >
                  <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                    Hủy & Quay lại
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg
  },
  header: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logoMetiz: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.accentCyan,
    letterSpacing: 2
  },
  logoCinema: {
    fontSize: 20,
    fontWeight: '300',
    color: COLORS.textPrimary,
    letterSpacing: 2,
    marginLeft: 5
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f1d33',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
    marginRight: 6
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.green,
    textTransform: 'uppercase'
  },
  scrollContainer: {
    flex: 1,
    marginBottom: 70
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 10
  },
  heroContainer: {
    position: 'relative',
    height: 220,
    width: '100%',
    backgroundColor: '#000',
    overflow: 'hidden'
  },
  heroImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
    opacity: 0.8
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(8, 12, 22, 0.85)'
  },
  heroBadge: {
    backgroundColor: COLORS.accentPink,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 8
  },
  heroBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.textPrimary
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 6
  },
  heroDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 26,
    marginBottom: 10,
    marginHorizontal: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accentCyan,
    paddingLeft: 10,
    letterSpacing: 1
  },
  movieGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    justifyContent: 'space-between'
  },
  movieCard: {
    width: width * 0.45,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    marginBottom: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  posterWrapper: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000'
  },
  moviePoster: {
    height: 190,
    width: '100%',
    resizeMode: 'cover'
  },
  ageBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  ageText: {
    fontSize: 9,
    color: COLORS.textPrimary,
    fontWeight: '900'
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4
  },
  durationText: {
    fontSize: 8,
    color: COLORS.textPrimary,
    fontWeight: 'bold'
  },
  movieTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 10,
    marginBottom: 4
  },
  movieMeta: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 2
  },
  movieRoomText: {
    fontSize: 10,
    color: COLORS.accentCyan,
    fontWeight: '700',
    marginBottom: 6
  },
  bookingBtn: {
    backgroundColor: COLORS.accentCyan,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6
  },
  bookingBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#080c16'
  },
  pricingContainer: {
    backgroundColor: COLORS.cardBg,
    margin: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  pricingHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: 12,
    letterSpacing: 1
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  priceRow_last: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '500'
  },
  priceValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.accentCyan
  },
  priceValue_hot: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.accentPink
  },
  bookingMovieBanner: {
    position: 'relative',
    height: 110,
    backgroundColor: COLORS.cardBg,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  bannerBlurBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25
  },
  bannerOverlayShadow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 12, 22, 0.7)'
  },
  bannerContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center'
  },
  miniPoster: {
    width: 50,
    height: 75,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffffff30'
  },
  miniPosterDetails: {
    flex: 1,
    marginLeft: 16
  },
  miniMovieTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary
  },
  miniMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 2
  },
  miniAgeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8
  },
  miniGenreText: {
    fontSize: 11,
    color: COLORS.textSecondary
  },
  miniRoomText: {
    fontSize: 11,
    color: COLORS.accentCyan,
    fontWeight: '700'
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 16,
    letterSpacing: 1
  },
  horizontalScroll: {
    paddingLeft: 12,
    marginBottom: 10
  },
  dateCard: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 4,
    alignItems: 'center',
    minWidth: 80
  },
  dateCardActive: {
    borderColor: COLORS.accentCyan,
    backgroundColor: '#0a2333'
  },
  dateCardLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: 'bold'
  },
  dateCardSub: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '900',
    marginTop: 2
  },
  dateTextActive: {
    color: COLORS.accentCyan
  },
  dateTextSubActive: {
    color: COLORS.accentCyan
  },
  timeCard: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    alignItems: 'center'
  },
  timeCardActive: {
    borderColor: COLORS.accentCyan,
    backgroundColor: '#0a2333'
  },
  timeCardText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '900'
  },
  timeTextActive: {
    color: COLORS.accentCyan
  },
  screenIndicatorContainer: {
    alignItems: 'center',
    marginVertical: 16,
    position: 'relative'
  },
  screenGlowLine: {
    width: '75%',
    height: 4,
    backgroundColor: COLORS.accentCyan,
    borderRadius: 2,
    shadowColor: COLORS.accentCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8
  },
  screenGlowText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.textSecondary,
    letterSpacing: 3,
    marginTop: 8
  },
  seatsContainer: {
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: COLORS.cardBg,
    paddingVertical: 20,
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5
  },
  rowLetter: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    width: 25,
    textAlign: 'center'
  },
  rowSeatsBlock: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  seatUnit: {
    width: 26,
    height: 26,
    backgroundColor: '#1f2e4d',
    borderColor: COLORS.border,
    borderWidth: 1,
    marginHorizontal: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  seatUnitBooked: {
    backgroundColor: '#374151',
    borderColor: '#374151',
    opacity: 0.4
  },
  seatUnitSelected: {
    backgroundColor: COLORS.accentCyan,
    borderColor: COLORS.accentCyan
  },
  seatUnitText: {
    fontSize: 10,
    color: COLORS.textPrimary,
    fontWeight: '800'
  },
  seatUnitTextActive: {
    color: '#080c16'
  },
  seatUnitTextMuted: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: 'bold'
  },
  aisleSpace: {
    width: 16
  },
  legendWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 14,
    paddingHorizontal: 16
  },
  legendCell: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10
  },
  legendBoxEmpty: {
    width: 14,
    height: 14,
    backgroundColor: '#1f2e4d',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6
  },
  legendBoxSelected: {
    width: 14,
    height: 14,
    backgroundColor: COLORS.accentCyan,
    borderRadius: 4,
    marginRight: 6
  },
  legendBoxBooked: {
    width: 14,
    height: 14,
    backgroundColor: '#374151',
    opacity: 0.4,
    borderRadius: 4,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  legendBookedText: {
    fontSize: 8,
    color: COLORS.textSecondary,
    fontWeight: 'bold'
  },
  legendLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  promoForm: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8
  },
  promoInput: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 12,
    height: 44
  },
  promoBtn: {
    backgroundColor: COLORS.accentCyan,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44
  },
  promoBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#080c16'
  },
  appliedPromoCard: {
    backgroundColor: '#0a2e26',
    borderWidth: 1,
    borderColor: '#10b981',
    marginHorizontal: 16,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  },
  appliedPromoText: {
    fontSize: 11,
    color: '#10b981'
  },
  checkoutTicket: {
    backgroundColor: COLORS.cardBg,
    margin: 16,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative'
  },
  ticketDottedLine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed'
  },
  checkoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  checkoutRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  checkoutLabel: {
    fontSize: 12,
    color: COLORS.textSecondary
  },
  checkoutLabelTotal: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '900'
  },
  checkoutValue: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '800'
  },
  checkoutValueCyan: {
    fontSize: 12,
    color: COLORS.accentCyan,
    fontWeight: '800'
  },
  checkoutValueTotal: {
    fontSize: 18,
    color: COLORS.accentPink,
    fontWeight: '900'
  },
  confirmCheckoutBtn: {
    backgroundColor: COLORS.accentCyan,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16
  },
  confirmCheckoutText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#080c16',
    letterSpacing: 0.5
  },
  memberCardContainer: {
    backgroundColor: '#16223f',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#24345d',
    position: 'relative',
    overflow: 'hidden'
  },
  memberCardGlow: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 242, 254, 0.15)'
  },
  memberCardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accentCyan,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff30'
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '900',
    color: '#080c16'
  },
  memberCardTitleSec: {
    marginLeft: 14,
    flex: 1
  },
  memberCardName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary
  },
  memberCardEmail: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1
  },
  memberTierRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 12
  },
  tierBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8
  },
  tierBadgeText: {
    fontSize: 10,
    color: COLORS.textPrimary,
    fontWeight: '900'
  },
  pointsBadge: {
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20
  },
  pointsBadgeText: {
    fontSize: 10,
    color: COLORS.accentCyan,
    fontWeight: '900'
  },
  progressBarWrapper: {
    marginTop: 8
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.accentCyan,
    borderRadius: 3
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4
  },
  progressSubText: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: 'bold'
  },
  logoutBtn: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.red,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20
  },
  logoutBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.red,
    letterSpacing: 0.5
  },
  historySectionHeader: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginHorizontal: 16,
    marginBottom: 10,
    letterSpacing: 1
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 12
  },
  stubTicket: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 110,
    overflow: 'hidden'
  },
  stubLeft: {
    flex: 7,
    padding: 14,
    justifyContent: 'center'
  },
  stubTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 4
  },
  stubMeta: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 2
  },
  stubSeats: {
    fontSize: 10,
    color: COLORS.textSecondary
  },
  stubCode: {
    fontSize: 8,
    color: COLORS.textSecondary,
    marginTop: 4
  },
  stubDivider: {
    width: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    position: 'relative'
  },
  notchTop: {
    width: 14,
    height: 7,
    backgroundColor: COLORS.bg,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    position: 'absolute',
    top: -1,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  notchBottom: {
    width: 14,
    height: 7,
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    position: 'absolute',
    bottom: -1,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  dashLine: {
    flex: 1,
    width: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginVertical: 10
  },
  stubRight: {
    flex: 3,
    backgroundColor: '#121f3a',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stubTotalLabel: {
    fontSize: 8,
    color: COLORS.textSecondary,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  stubPrice: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.accentCyan,
    marginVertical: 4
  },
  stubBarcodePlaceholder: {
    flexDirection: 'row',
    height: 18,
    marginTop: 2,
    alignItems: 'center',
    opacity: 0.6
  },
  bar1: { width: 2, height: '100%', backgroundColor: COLORS.textPrimary, marginRight: 2 },
  bar2: { width: 1, height: '100%', backgroundColor: COLORS.textPrimary, marginRight: 1 },
  bar3: { width: 3, height: '100%', backgroundColor: COLORS.textPrimary, marginRight: 2 },
  bar4: { width: 1, height: '100%', backgroundColor: COLORS.textPrimary, marginRight: 1 },
  loginWrapper: {
    paddingVertical: 20
  },
  loginHeaderCenter: {
    alignItems: 'center',
    marginVertical: 20
  },
  loginLogoText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.accentCyan,
    letterSpacing: 6
  },
  loginSubTextText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginTop: 4,
    fontWeight: '700'
  },
  loginFormCard: {
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: 'center'
  },
  inputWrapper: {
    marginBottom: 14
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.accentCyan,
    marginBottom: 6,
    letterSpacing: 1
  },
  input: {
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 10,
    padding: 12,
    color: COLORS.textPrimary,
    fontSize: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  loginActionBtn: {
    backgroundColor: COLORS.accentCyan,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8
  },
  loginActionText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#080c16',
    letterSpacing: 0.5
  },
  quickLoginHeader: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
    letterSpacing: 1
  },
  quickLoginRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  quickBtn: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  quickBtnText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.textPrimary
  },
  tabsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: '#0a0f1d',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 6
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%'
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 2,
    color: COLORS.textSecondary
  },
  tabText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  activeTabText: {
    color: COLORS.accentCyan
  },

  // NEW STYLES FOR SHOP AND PORTALS (Inherited from Web)
  shopCategoryContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    margin: 16,
    borderRadius: 10,
    padding: 6,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  shopTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8
  },
  shopTabActive: {
    backgroundColor: COLORS.accentCyan
  },
  shopTabText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textSecondary
  },
  shopTabTextActive: {
    color: '#080c16'
  },
  shopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    justifyContent: 'space-between'
  },
  shopCard: {
    width: width * 0.45,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    marginBottom: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  shopPoster: {
    height: 120,
    width: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
    backgroundColor: '#000'
  },
  shopTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 4
  },
  shopDesc: {
    fontSize: 10,
    color: COLORS.textSecondary,
    height: 30,
    lineHeight: 14
  },
  shopBuyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  shopPriceText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.accentCyan
  },
  shopBuyBtn: {
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.accentCyan,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  shopBuyBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.accentCyan
  },
  cartSticky: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    margin: 16,
    borderRadius: 14,
    padding: 16
  },
  cartTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 12,
    letterSpacing: 1
  },
  cartItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  cartItemName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textPrimary
  },
  cartItemPrice: {
    fontSize: 11,
    color: COLORS.accentCyan,
    fontWeight: '700'
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  qtyBtn: {
    width: 24,
    height: 24,
    backgroundColor: COLORS.cardBgLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4
  },
  qtyBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  qtyText: {
    color: '#fff',
    paddingHorizontal: 8,
    fontSize: 12,
    fontWeight: 'bold'
  },
  removeCartBtn: {
    marginLeft: 10
  },
  removeCartBtnText: {
    fontSize: 14
  },
  cartDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12
  },
  cartTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  cartTotalLabel: {
    fontSize: 12,
    color: COLORS.textSecondary
  },
  cartTotalVal: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.accentPink
  },
  cartCheckoutBtn: {
    backgroundColor: COLORS.accentCyan,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  cartCheckoutBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#080c16'
  },

  // Portals layout
  portalCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.accentCyan
  },
  portalRole: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.accentCyan,
    letterSpacing: 1
  },
  portalWelcome: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4
  },
  subTabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 8,
    padding: 4,
    marginBottom: 14
  },
  subTabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6
  },
  subTabActive: {
    backgroundColor: COLORS.cardBgLight
  },
  subTabText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold'
  },
  portalContentBox: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16
  },
  portalSectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 14,
    letterSpacing: 0.5
  },
  portalInputRow: {
    flexDirection: 'row',
    marginBottom: 14
  },
  portalInput: {
    flex: 1,
    backgroundColor: COLORS.cardBgLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#fff',
    fontSize: 12,
    height: 40
  },
  portalBtn: {
    backgroundColor: COLORS.accentCyan,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginLeft: 8
  },
  portalBtnText: {
    color: '#080c16',
    fontWeight: '900',
    fontSize: 11
  },
  staffLookupCard: {
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  staffDetailText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4
  },
  ticketsSubTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  staffTicketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  staffTicketSeat: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.accentCyan
  },
  checkinConfirmBtn: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4
  },
  checkinConfirmBtnText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff'
  },
  checkedInLabel: {
    fontSize: 11,
    color: COLORS.green,
    fontWeight: 'bold'
  },
  adminDropdownRow: {
    marginBottom: 10
  },
  dropdownLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 4
  },
  dropdownItem: {
    backgroundColor: COLORS.cardBgLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  dropdownItemActive: {
    borderColor: COLORS.accentCyan,
    backgroundColor: '#0a2333'
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  loadSeatsBtn: {
    backgroundColor: COLORS.cardBgLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4
  },
  loadSeatsBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.accentCyan
  },
  portalInputForm: {
    backgroundColor: COLORS.cardBgLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#fff',
    fontSize: 12,
    height: 40,
    marginTop: 10
  },
  counterSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  counterSummaryText: {
    fontSize: 12,
    color: COLORS.textSecondary
  },
  executeCounterBtn: {
    backgroundColor: COLORS.accentCyan,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12
  },
  executeCounterBtnText: {
    color: '#080c16',
    fontWeight: '900',
    fontSize: 12
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textSecondary
  },
  metricVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff'
  },
  userRoleCard: {
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  userRoleName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff'
  },
  userRoleEmail: {
    fontSize: 11,
    color: COLORS.textSecondary
  },
  userRoleRole: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4
  },
  roleActionButtons: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between'
  },
  roleBtn: {
    flex: 1,
    backgroundColor: COLORS.border,
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: 'center',
    marginHorizontal: 2
  },
  roleBtnText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold'
  },
  auditLogCard: {
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  auditActor: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff'
  },
  auditAction: {
    fontSize: 10,
    color: COLORS.accentCyan,
    marginTop: 2
  },
  auditDetails: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2
  }
});
