import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        phim: resolve(__dirname, 'phim.html'),
        lichChieu: resolve(__dirname, 'lich-chieu-phim.html'),
        muaSam: resolve(__dirname, 'mua-sam.html'),
        lienHe: resolve(__dirname, 'lien-he.html'),
        tinTuc: resolve(__dirname, 'tin-va-khuyen-mai.html'),
        thanhVien: resolve(__dirname, 'thong-tin-thanh-vien.html'),
        veCuaToi: resolve(__dirname, 've-cua-toi.html'),
        staff: resolve(__dirname, 'staff-dashboard.html'),
        admin: resolve(__dirname, 'admin-dashboard.html')
      }
    }
  }
});
