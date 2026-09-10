# EcoMart Frontend

Ứng dụng Single Page Application (SPA) xây dựng bằng **React 18**, **Vite**, và **TypeScript**.

## 🛠 Tech Stack
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React Context API
- **API Client**: Axios

## 🚀 Cấu hình & Chạy Local
1. Cài đặt dependencies:
   ```bash
   npm install
   ```
2. Chạy môi trường phát triển:
   ```bash
   npm run dev
   ```
3. Build production:
   ```bash
   npm run build
   ```

## 🌐 Môi trường (.env)
Tạo file `.env` tại thư mục này với các biến sau:
```env
VITE_API_BASE_URL=http://localhost:8081
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_FACEBOOK_APP_ID=your_facebook_app_id
```

## 📦 Docker
Trong production, Frontend được build thành file tĩnh và serve qua Nginx trên port 3000. Để khởi chạy cùng Backend, hãy sử dụng lệnh `docker compose up -d --build` tại thư mục gốc.
