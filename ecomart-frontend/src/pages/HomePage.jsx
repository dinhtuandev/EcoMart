import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const HomePage = () => {
  return (
    <div className="space-y-12">
      {/* Hero Banner Skeleton */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 sm:p-12 text-white shadow-lg">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Chào mừng đến với TechHub
          </h1>
          <p className="text-blue-100 text-lg">
            Hệ thống mua sắm thiết bị công nghệ, laptop, linh kiện chính hãng. Thanh toán linh hoạt qua phương thức COD (nhận hàng thanh toán).
          </p>
          <div className="pt-4">
            <Link to="/products">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow">
                Khám phá sản phẩm ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Section Placeholder Shell */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Sản phẩm nổi bật</h2>
          <Link to="/products" className="text-sm font-medium text-blue-600 hover:underline">
            Xem tất cả →
          </Link>
        </div>
        <div className="p-12 text-center border-2 border-dashed border-slate-300 rounded-xl bg-white text-slate-500">
          Placeholder: Danh sách sản phẩm nổi bật sẽ được hiển thị ở đây.
        </div>
      </section>
    </div>
  );
};

export default HomePage;
