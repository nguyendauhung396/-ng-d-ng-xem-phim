import React from 'react';

export default function ForbiddenGate({ requiredRole, onLogin }) {
  const roleNameMap = {
    admin: 'Quản trị viên (Admin)',
    staff: 'Nhân viên soát vé (Staff)',
    member: 'Hội viên Metiz (Member)'
  };

  const demoAccounts = {
    admin: { email: 'admin@metiz.vn', pass: 'admin123' },
    staff: { email: 'staff@metiz.vn', pass: 'staff123' },
    member: { email: 'demo@cinemax.vn', pass: '123456' }
  };

  const details = demoAccounts[requiredRole];

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'radial-gradient(circle at center, #1b262c 0%, #0f171e 100%)',
      color: '#fff'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '40px 30px',
        textAlign: 'center',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          fontSize: '60px',
          marginBottom: '20px',
          filter: 'drop-shadow(0 0 10px rgba(231, 76, 60, 0.5))'
        }}>
          🚫
        </div>
        <h2 style={{
          fontSize: '22px',
          fontWeight: '900',
          letterSpacing: '0.05em',
          marginBottom: '15px',
          color: '#e74c3c'
        }}>
          QUYỀN TRUY CẬP BỊ HẠN CHẾ
        </h2>
        <p style={{
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#ccc',
          marginBottom: '30px'
        }}>
          Bạn đang truy cập vào trang dành riêng cho <b>{roleNameMap[requiredRole] || requiredRole}</b>.<br/>
          Vui lòng sử dụng tính năng Đăng Nhập Nhanh dưới đây để tiếp tục trải nghiệm tác nhân này.
        </p>

        {details && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <h4 style={{
              fontSize: '12px',
              fontWeight: '800',
              color: 'var(--primary-teal)',
              letterSpacing: '0.05em',
              marginBottom: '14px',
              textTransform: 'uppercase'
            }}>
              ⚡ Đăng Nhập Nhanh Vai Trò Này
            </h4>
            <button
              onClick={() => onLogin(details.email, details.pass)}
              style={{
                width: '100%',
                padding: '14px',
                background: requiredRole === 'admin' ? 'linear-gradient(135deg, #d62246, #ff7675)' :
                            requiredRole === 'staff' ? 'linear-gradient(135deg, #8e44ad, #a29bfe)' :
                            'linear-gradient(135deg, #00adb5, #00d2c4)',
                color: '#fff',
                fontWeight: '900',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              }}
            >
              🔑 ĐĂNG NHẬP VỚI TƯ CÁCH {requiredRole.toUpperCase()}
            </button>
            <div style={{
              marginTop: '12px',
              fontSize: '11px',
              color: '#888'
            }}>
              Tài khoản: <b>{details.email}</b> / Mật khẩu: <b>{details.pass}</b>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
