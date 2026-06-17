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

async function runQRTests() {
  console.log('=== KLTN QR AUTHENTICATION STATE MACHINE & SECURITY TESTS ===');

  try {
    // 1. Create a session
    console.log('\n[Test 1] Tạo phiên đăng nhập QR mới...');
    const createRes = await request('POST', '/api/auth/qr/create');
    if (createRes.statusCode !== 201 || !createRes.body.sessionToken) {
      console.error('❌ Thất bại tạo phiên QR:', createRes.statusCode, createRes.body);
      process.exit(1);
    }
    const sessionToken = createRes.body.sessionToken;
    console.log(`✅ Thành công! Đã tạo phiên: ${sessionToken}`);

    // 2. Check initial status
    console.log('\n[Test 2] Kiểm tra trạng thái ban đầu...');
    const statusRes = await request('GET', `/api/auth/qr/status/${sessionToken}`);
    if (statusRes.statusCode === 200 && statusRes.body.status === 'pending') {
      console.log('✅ Thành công! Trạng thái là "pending".');
    } else {
      console.error('❌ Thất bại kiểm tra trạng thái:', statusRes.statusCode, statusRes.body);
      process.exit(1);
    }

    // 3. User login (to act as mobile scanner app)
    console.log('\n[Test 3] Đăng nhập hội viên demo@cinemax.vn (Đại diện mobile app)...');
    const userLogin = await request('POST', '/api/auth/login', {
      email: 'demo@cinemax.vn',
      password: '123456'
    });
    if (userLogin.statusCode !== 200 || !userLogin.body.token) {
      console.error('❌ Đăng nhập hội viên thất bại:', userLogin.statusCode, userLogin.body);
      process.exit(1);
    }
    const userToken = userLogin.body.token;
    const userHeaders = { 'Authorization': `Bearer ${userToken}` };
    console.log('✅ Đăng nhập thành công.');

    // 4. Confirm QR session as User
    console.log('\n[Test 4] Hội viên quét và xác nhận phiên QR...');
    const confirmRes = await request('POST', '/api/auth/qr/confirm', {
      sessionToken,
      confirm: true
    }, userHeaders);
    if (confirmRes.statusCode === 200 && confirmRes.body.success) {
      console.log('✅ Xác nhận thành công:', confirmRes.body.message);
    } else {
      console.error('❌ Xác nhận thất bại:', confirmRes.statusCode, confirmRes.body);
      process.exit(1);
    }

    // 5. Poll status after confirmation (expecting confirmed/used state and token issuance)
    console.log('\n[Test 5] PC Polling trạng thái sau khi xác nhận (Nhận token đăng nhập)...');
    const statusConfirmedRes = await request('GET', `/api/auth/qr/status/${sessionToken}`);
    if (statusConfirmedRes.statusCode === 200 && statusConfirmedRes.body.status === 'confirmed' && statusConfirmedRes.body.accessToken) {
      console.log('✅ Thành công! PC đã nhận JWT Access Token cho User:', statusConfirmedRes.body.user.fullName);
    } else {
      console.error('❌ Thất bại nhận token:', statusConfirmedRes.statusCode, statusConfirmedRes.body);
      process.exit(1);
    }

    // 6. Admin 2FA checks (Admin confirmation require password)
    console.log('\n[Test 6] Đăng nhập Admin và tạo phiên QR mới để kiểm tra 2FA...');
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@metiz.vn',
      password: 'admin123'
    });
    const adminToken = adminLogin.body.token;
    const adminHeaders = { 'Authorization': `Bearer ${adminToken}` };

    const createResAdmin = await request('POST', '/api/auth/qr/create');
    const adminSessionToken = createResAdmin.body.sessionToken;

    console.log('   Gửi yêu cầu xác nhận Admin KHÔNG có mật khẩu (Nên bị chặn)...');
    const confirmAdminFail = await request('POST', '/api/auth/qr/confirm', {
      sessionToken: adminSessionToken,
      confirm: true
    }, adminHeaders);

    if (confirmAdminFail.statusCode === 200 && confirmAdminFail.body.requireAdminVerification) {
      console.log('✅ Thành công! Hệ thống yêu cầu nhập mật khẩu xác thực bổ sung.');
    } else {
      console.error('❌ Thất bại! Đáng lẽ phải yêu cầu nhập mật khẩu:', confirmAdminFail.statusCode, confirmAdminFail.body);
      process.exit(1);
    }

    console.log('   Gửi yêu cầu xác nhận Admin CÓ mật khẩu đúng...');
    const confirmAdminSuccess = await request('POST', '/api/auth/qr/confirm', {
      sessionToken: adminSessionToken,
      confirm: true,
      password: 'admin123'
    }, adminHeaders);

    if (confirmAdminSuccess.statusCode === 200 && confirmAdminSuccess.body.success) {
      console.log('✅ Thành công! Admin đã xác nhận đăng nhập QR bằng 2FA mật khẩu.');
    } else {
      console.error('❌ Admin xác nhận thất bại:', confirmAdminSuccess.statusCode, confirmAdminSuccess.body);
      process.exit(1);
    }

    console.log('\n========================================================');
    console.log('🎉 TẤT CẢ CÁC BÀI KIỂM THỬ TRẠNG THÁI QR ĐÃ HOÀN THÀNH XUẤT SẮC!');
    console.log('========================================================');
    process.exit(0);

  } catch (err) {
    console.error('❌ Xảy ra lỗi kết nối:', err);
    process.exit(1);
  }
}

runQRTests();
