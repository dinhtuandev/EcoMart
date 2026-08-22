import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../services/productApi';
import { categoryApi } from '../services/categoryApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Star, ArrowRight, ShieldCheck, Truck, Headphones } from 'lucide-react';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { handleAddToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productApi.searchProducts({ page: 1, pageSize: 8, sort: 'newest' }),
          categoryApi.getActiveCategories()
        ]);
        if (prodRes.success) setProducts(prodRes.data.items || []);
        if (catRes.success) setCategories(catRes.data || []);
      } catch (err) {
        console.error('Failed to fetch home page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const onAddToCart = async (e, productId) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
      return;
    }
    const success = await handleAddToCart(productId, 1);
    if (success) {
      alert('Đã thêm sản phẩm vào giỏ hàng thành công!');
    }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-8 sm:p-14 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md border border-blue-400/30">
            ✨ Trải Nghiệm Công Nghệ Đỉnh Cao
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Cửa Hàng Thiết Bị <br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              Công Nghệ TechHub
            </span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Cung cấp Laptop, linh kiện, bàn phím, chuột và thiết bị công nghệ chính hãng. Đặt hàng cực kỳ dễ dàng với phương thức thanh toán COD an toàn.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-7 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/30"
            >
              Khám Phá Ngay <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-slate-800 mt-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Giao Hàng COD</h4>
              <p className="text-xs text-slate-400">Nhận hàng kiểm tra thanh toán</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Chính Hãng 100%</h4>
              <p className="text-xs text-slate-400">Bảo hành uy tín toàn quốc</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Hỗ Trợ 24/7</h4>
              <p className="text-xs text-slate-400">Tư vấn nhiệt tình tận tâm</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      {categories.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Danh Mục Nổi Bật</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-sm text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:shadow-sm transition-all"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Sản Phẩm Mới Nhất</h2>
            <p className="text-xs text-slate-500">Các thiết bị được cập nhật mới nhất tại hệ thống</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-500">
            Chưa có sản phẩm nào được cập nhật.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => {
              const primaryImg = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || 'https://via.placeholder.com/300';
              return (
                <div
                  key={product.id}
                  className="group bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <Link to={`/products/${product.id}`} className="block overflow-hidden rounded-xl bg-slate-50 aspect-square relative">
                      <img
                        src={primaryImg}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/90 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {product.category?.name}
                      </span>
                    </Link>

                    <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                      <span>{product.averageRating || 0}</span>
                      <span className="text-slate-400 font-normal">({product.reviewCount || 0})</span>
                    </div>

                    <Link to={`/products/${product.id}`} className="block">
                      <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="pt-1 flex items-baseline justify-between">
                      <p className="text-lg font-extrabold text-blue-600">
                        {Number(product.sellingPrice).toLocaleString('vi-VN')} ₫
                      </p>
                      <span className={`text-[11px] font-medium ${product.quantityInStock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {product.quantityInStock > 0 ? `Còn ${product.quantityInStock}` : 'Hết hàng'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={(e) => onAddToCart(e, product.id)}
                      disabled={product.quantityInStock <= 0}
                      className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white font-medium text-xs py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
