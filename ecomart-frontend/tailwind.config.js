/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#F4FAF7', // Nền xanh gần trắng
          100: '#E8F5EE', // Xanh pastel rất nhẹ
          200: '#D2ECDF', // Pastel rõ hơn
          300: '#B5DEC9', // Sage/mint nhẹ
          400: '#8FC9AA', // Xanh dịu
          500: '#68B58B', // Xanh botanical
          600: '#4D9A73', // Xanh trung tính
          700: '#397B5A', // Xanh đậm
          800: '#285A43', // Xanh forest
          900: '#193D2E', // Xanh rất đậm
          950: '#10291F', // Deep botanical
        },

        // Dải màu xanh lá tươi sáng (Leaf / Mint / Vibrant Green) làm điểm nhấn thay cho màu vàng
        accent: {
          50:  '#F2FBF5', // Xanh lá sáng siêu nhẹ
          100: '#E1F8EB', // Xanh mint nhạt
          200: '#C3F0D6', // Xanh búp non pastel
          300: '#92E3B7', // Xanh lá mạ tươi
          400: '#54CE90', // Xanh lá tươi sáng
          500: '#28B674', // Xanh ngọc lục bảo / Eco green chủ đạo
          600: '#1C955C', // Xanh lá đậm vừa
          700: '#17764A', // Xanh ngọc đậm
          800: '#165D3C', // Xanh đậm bảo vệ mắt
          900: '#144D33', // Xanh rừng rậm
          950: '#082C1C', // Xanh bóng đêm tự nhiên
        },

        // Tương thích ngược: map autumn sang dải màu xanh lá tươi sáng
        autumn: {
          50:  '#F2FBF5',
          100: '#E1F8EB',
          200: '#C3F0D6',
          300: '#92E3B7',
          400: '#54CE90',
          500: '#28B674',
          600: '#1C955C',
          700: '#17764A',
          800: '#165D3C',
          900: '#144D33',
          950: '#082C1C',
        },

        softdark: {
          DEFAULT: '#1F2924', // Main text
          muted: '#53615A',   // Secondary text
          light: '#7A8780',   // Placeholder / caption
        },

        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#FAFCFA',
          green: '#F1F8F4',
          warm: '#F2FAF5', // Thay đổi từ vàng nhạt sang xanh ngọc nhạt
        },

        border: {
          DEFAULT: '#DCE9E1',
          muted: '#EAF1ED',
          warm: '#CDEADC', // Thay đổi từ viền vàng sang viền xanh ngọc
        },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },

  plugins: [],
};