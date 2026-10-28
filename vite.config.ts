import { defineConfig } from 'vite';
// 多頁：網站首頁＋後台（/admin.html，正式環境由 Cloudflare Access 保護）
export default defineConfig({
  build: { rollupOptions: { input: { main: 'index.html', admin: 'admin.html' } } },
});
