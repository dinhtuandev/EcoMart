import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center py-24 px-4 space-y-6 max-w-md mx-auto">
      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
        <Leaf className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-6xl font-black text-slate-300">404</h1>
        <h2 className="text-2xl font-black text-slate-900">Trang Không Tồn Tại</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Đường dẫn bạn yêu cầu không khả dụng hoặc đã bị di chuyển. Hãy quay về trang chủ để tiếp tục mua sắm các sản phẩm sinh thái!
        </p>
      </div>

      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay Về Trang Chủ</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
