import React from 'react';
import Button from '../components/common/Button';

const AdminProductPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Sản phẩm (Admin)</h1>
        <Button size="md">+ Thêm sản phẩm mới</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Tên sản phẩm</th>
              <th className="px-6 py-3">Giá bán</th>
              <th className="px-6 py-3">Tồn kho</th>
              <th className="px-6 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {[1, 2, 3].map((item) => (
              <tr key={item} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono font-bold">#{item}</td>
                <td className="px-6 py-4 font-medium text-slate-900">Laptop TechHub Demo #{item}</td>
                <td className="px-6 py-4 font-bold text-blue-600">15.990.000 ₫</td>
                <td className="px-6 py-4">25 cái</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-blue-600 hover:underline font-medium">Sửa</button>
                  <button className="text-rose-600 hover:underline font-medium">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductPage;
