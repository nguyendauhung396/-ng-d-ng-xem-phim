import React from 'react';

export function money(n) {
  return n ? n.toLocaleString('vi-VN') + 'đ' : '0đ';
}

export function dateLabel(date, index) {
  if (index === 0) return 'Hôm nay';
  return new Date(date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

export function MetizLogo({ onClick }) {
  return (
    <div className="logo" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="logo-m">
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <path d="M15 80V35C15 26.7 21.7 20 30 20H35C38.3 20 41 22.7 41 26V80" stroke="#00adb5" strokeWidth="12" strokeLinecap="round" fill="none"/>
          <path d="M41 40C41 31.7 47.7 25 56 25H60C68.3 25 75 31.7 75 40V80" stroke="#d62246" strokeWidth="12" strokeLinecap="round" fill="none"/>
          <path d="M28 45L46 63" stroke="#f39c12" strokeWidth="10" strokeLinecap="round"/>
          <path d="M50 63L68 45" stroke="#8e44ad" strokeWidth="10" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="logo-text-wrapper">
        <span className="logo-brand">metiz<span>cinema</span></span>
        <span className="logo-sub">ĐÀ NẴNG</span>
      </div>
    </div>
  );
}

export function MascotLeft() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" style={{ position: 'absolute', left: '15px' }}>
      <circle cx="20" cy="20" r="16" fill="#fbc531" />
      <circle cx="15" cy="17" r="2.5" fill="#2f3640" />
      <circle cx="25" cy="17" r="2.5" fill="#2f3640" />
      <path d="M 14 24 Q 20 30 26 24" stroke="#2f3640" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="18" y="6" width="4" height="6" rx="2" fill="#e84118" />
    </svg>
  );
}

export function MascotRight() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" style={{ position: 'absolute', right: '15px' }}>
      <circle cx="20" cy="20" r="16" fill="#4cd137" />
      <circle cx="15" cy="17" r="2.5" fill="#2f3640" />
      <circle cx="25" cy="17" r="2.5" fill="#2f3640" />
      <path d="M 14 24 Q 20 30 26 24" stroke="#2f3640" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="18" y="6" width="4" height="6" rx="2" fill="#9c88ff" />
    </svg>
  );
}
