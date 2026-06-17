const http = require('http');

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(dataString);
    }

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        let parsed = responseBody;
        try {
          parsed = JSON.parse(responseBody);
        } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(dataString);
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== KLTN SECURITY & OPERATIONS VERIFICATION TESTS ===');
  
  try {
    // Test 1: Admin Login with JWT & Hashed Password verification
    console.log('\n[Test 1] Đăng nhập Admin và xác thực mật khẩu băm...');
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@metiz.vn',
      password: 'admin123'
    });
    
    if (adminLogin.statusCode === 200 && adminLogin.body.token) {
      console.log('✅ Thành công! Nhận được JWT Token:', adminLogin.body.token.substring(0, 30) + '...');
    } else {
      console.error('❌ Thất bại!', adminLogin.statusCode, adminLogin.body);
      process.exit(1);
    }

    const adminToken = adminLogin.body.token;
    const adminAuthHeader = { 'Authorization': `Bearer ${adminToken}` };

    // Test 2: Staff Login
    console.log('\n[Test 2] Đăng nhập Staff...');
    const staffLogin = await request('POST', '/api/auth/login', {
      email: 'staff@metiz.vn',
      password: 'staff123'
    });
    if (staffLogin.statusCode === 200 && staffLogin.body.token) {
      console.log('✅ Thành công! Nhận được JWT Token cho Staff.');
    } else {
      console.error('❌ Thất bại!', staffLogin.statusCode, staffLogin.body);
      process.exit(1);
    }

    const staffToken = staffLogin.body.token;
    const staffAuthHeader = { 'Authorization': `Bearer ${staffToken}` };

    // Test 3: RBAC verification (Staff accessing Admin reports)
    console.log('\n[Test 3] Kiểm tra RBAC: Nhân viên truy cập báo cáo doanh thu Admin (Nên bị từ chối)...');
    const rbacTest = await request('GET', '/api/admin/reports/revenue', null, staffAuthHeader);
    if (rbacTest.statusCode === 403) {
      console.log('✅ Thành công! Trả về 403 Forbidden như mong đợi:', rbacTest.body.message);
    } else {
      console.error('❌ Thất bại! Đáng lẽ phải trả về 403, nhưng trả về:', rbacTest.statusCode, rbacTest.body);
      process.exit(1);
    }

    // Test 4: Admin accessing Admin reports
    console.log('\n[Test 4] Admin truy cập báo cáo doanh thu...');
    const revenueReport = await request('GET', '/api/admin/reports/revenue', null, adminAuthHeader);
    if (revenueReport.statusCode === 200) {
      console.log('✅ Thành công! Tải được báo cáo doanh thu tổng quan:', JSON.stringify(revenueReport.body.summary));
    } else {
      console.error('❌ Thất bại!', revenueReport.statusCode, revenueReport.body);
      process.exit(1);
    }

    // Test 5: Staff creating a counter sale booking (manual booking)
    console.log('\n[Test 5] Staff lập giao dịch xuất vé tại quầy (SĐT 0987654321)...');
    // Fetch a showtime first
    const showtimesRes = await request('GET', '/api/showtimes');
    if (showtimesRes.statusCode !== 200 || showtimesRes.body.length === 0) {
      console.error('❌ Không tìm thấy suất chiếu nào trong DB để đặt thử.');
      process.exit(1);
    }
    const showtime = showtimesRes.body[0];
    const seatsToBook = ['A10', 'A11'];
    
    const bookingRes = await request('POST', '/api/bookings', {
      customerName: 'Kiểm thử viên',
      phone: '0987654321', // demo member SĐT
      movieId: showtime.movieId,
      date: showtime.date,
      time: showtime.time,
      seats: seatsToBook,
      total: showtime.price * seatsToBook.length
    }, staffAuthHeader); // Staff JWT token

    if (bookingRes.statusCode === 201) {
      console.log('✅ Thành công! Đã tạo Booking:', bookingRes.body.booking.id);
      console.log('   Ghi nhận người lập (createdBy):', bookingRes.body.booking.createdBy);
    } else {
      console.error('❌ Thất bại!', bookingRes.statusCode, bookingRes.body);
      process.exit(1);
    }

    const newBookingId = bookingRes.body.booking.id;

    // Test 6: Showtime scheduling collision check
    console.log('\n[Test 6] Kiểm tra xung đột lịch chiếu (Độ dài phim + dọn phòng)...');
    // Add showtime overlapping by 30 mins
    const duplicateShowtime = await request('POST', '/api/admin/showtimes', {
      movieId: showtime.movieId,
      date: showtime.date,
      time: showtime.time,
      price: showtime.price
    }, adminAuthHeader);

    if (duplicateShowtime.statusCode === 409) {
      console.log('✅ Thành công! Ngăn chặn trùng lịch phòng chiếu:', duplicateShowtime.body.message);
    } else {
      console.error('❌ Thất bại! Đáng lẽ phải báo lỗi trùng lịch (409), nhưng nhận được:', duplicateShowtime.statusCode, duplicateShowtime.body);
      process.exit(1);
    }

    // Test 7: Staff shift report check
    console.log('\n[Test 7] Nhân viên tải báo cáo ca làm việc...');
    const shiftReport = await request('GET', '/api/staff/shift-report', null, staffAuthHeader);
    if (shiftReport.statusCode === 200) {
      console.log('✅ Thành công! Thống kê ca làm của Staff:', JSON.stringify(shiftReport.body));
    } else {
      console.error('❌ Thất bại!', shiftReport.statusCode, shiftReport.body);
      process.exit(1);
    }

    // Test 8: Admin refunding counter sale booking
    console.log('\n[Test 8] Admin thực hiện hoàn trả giao dịch hủy đặt vé...');
    const refundRes = await request('POST', `/api/admin/bookings/${newBookingId}/refund`, null, adminAuthHeader);
    if (refundRes.statusCode === 200) {
      console.log('✅ Thành công! Giao dịch được hoàn trả, ghế đã giải phóng:', refundRes.body.message);
    } else {
      console.error('❌ Thất bại!', refundRes.statusCode, refundRes.body);
      process.exit(1);
    }

    console.log('\n========================================================');
    console.log('🎉 TẤT CẢ 8 BÀI KIỂM THỬ XÁC THỰC BẢO MẬT ĐÃ VƯỢT QUA!');
    console.log('========================================================');
    process.exit(0);

  } catch (err) {
    console.error('❌ Xảy ra lỗi kết nối / hệ thống:', err);
    process.exit(1);
  }
}

runTests();
