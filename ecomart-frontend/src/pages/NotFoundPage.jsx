import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="text-center py-20 space-y-4">
      <h1 className="text-6xl font-black text-slate-300">404</h1>
      <h2 className="text-2xl font-bold text-slate-800">Trang không tồn tại</h2>
      <p className="text-slate-500">Đường dẫn bạn yêu cầu không khả dụng hoặc đã bị di chuyển.</p>
      <div className="pt-4">
        <Link to="/">
          <Button size="md">Quay về Trang chủ</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
