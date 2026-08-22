import React, { useEffect, useState } from 'react';
import { productApi } from '../services/productApi';
import { categoryApi } from '../services/categoryApi';
import { brandApi } from '../services/brandApi';
import { adminApi } from '../services/adminApi';
import { Plus, Edit, PackageCheck } from 'lucide-react';

const AdminProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        productApi.adminGetProducts({ page: 1, pageSize: 50 }),
        categoryApi.getActiveCategories(),
        brandApi.getActiveBrands(),
      ]);
      if (prodRes.success) setProducts(prodRes.data.items || []);
      if (catRes.success) setCategories(catRes.data || []);
      if (brandRes.success) setBrands(brandRes.data || []);
    } catch (err) {
      console.error('Failed to fetch admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleUpdateStock = async (productId, currentStock) => {
    const newStock = window.prompt('Nhập số lượng tồn kho mới:', currentStock);
    if (newStock === null) return;
    try {
      const res = await adminApi.updateInventory(productId, { quantityInStock: parseInt(newStock, 10) });
      if (res.success) {
        alert('Đã cập nhật tồn kho thành công!');
        fetchProducts();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi cập nhật tồn kho.');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quản Lý Sản Phẩm & Tồn Kho</h1>
          <p className="text-xs text-slate-500">Danh sách sản phẩm và điều chỉnh số lượng tồn kho</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
            <tr>
              <th className="p-4">Sản Phẩm</th>
              <th className="p-4">Danh Mục</th>
              <th className="p-4">Thương Hiệu</th>
              <th className="p-4">Giá Bán</th>
              <th className="p-4">Tồn Kho</th>
              <th className="p-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-900">{p.name}</td>
                <td className="p-4 text-xs font-semibold text-slate-600">{p.category?.name}</td>
                <td className="p-4 text-xs font-semibold text-slate-600">{p.brand?.name}</td>
                <td className="p-4 font-extrabold text-blue-600">
                  {Number(p.sellingPrice).toLocaleString('vi-VN')} ₫
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.quantityInStock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {p.quantityInStock}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleUpdateStock(p.id, p.quantityInStock)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl inline-flex items-center gap-1"
                  >
                    <PackageCheck className="w-3.5 h-3.5" /> Sửa Tồn Kho
                  </button>
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
