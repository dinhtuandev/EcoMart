import React from 'react';
import { useParams } from 'react-router-dom';
import Button from '../components/common/Button';

const ProductDetailPage = () => {
  const { id } = useParams();

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Image Gallery Shell */}
      <div className="space-y-4">
        <div className="w-full h-80 sm:h-96 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-medium">
          Main Product Image (ID: {id})
        </div>
      </div>

      {/* Product Details Shell */}
      <div className="space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Thương hiệu: ASUS
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Chi tiết sản phẩm #{id} - Laptop Gaming ROG Strix
          </h1>
          <div className="text-3xl font-extrabold text-blue-600">24.990.000 ₫</div>
          <div className="text-sm text-slate-600 space-y-2 pt-2">
            <p className="font-semibold text-slate-700">Mô tả sản phẩm:</p>
            <p className="leading-relaxed">
              Chi tiết cấu hình, thông số kỹ thuật và tính năng nổi bật của sản phẩm sẽ được nạp từ Backend REST API.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex gap-4">
          <Button size="lg" className="flex-1">
            🛒 Thêm vào giỏ hàng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
