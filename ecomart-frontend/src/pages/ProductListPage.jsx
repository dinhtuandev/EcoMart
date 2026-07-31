import React from 'react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const ProductListPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Danh sách Sản phẩm</h1>
          <p className="text-sm text-slate-500">Khám phá các thiết bị & phụ kiện công nghệ chất lượng cao</p>
        </div>
        <div className="w-full md:w-72">
          <Input placeholder="Tìm kiếm sản phẩm..." id="search" />
        </div>
      </div>

      {/* Grid Placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div
            key={item}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-full h-40 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-sm font-medium">
                Product Image Placeholder
              </div>
              <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Laptop
              </span>
              <h3 className="font-semibold text-slate-800 line-clamp-2">
                Sản phẩm Mẫu #{item} - TechHub Laptop Demo
              </h3>
              <p className="text-lg font-bold text-blue-600">15.990.000 ₫</p>
            </div>
            <div className="pt-4">
              <Button size="sm" className="w-full">
                Thêm vào giỏ
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductListPage;
