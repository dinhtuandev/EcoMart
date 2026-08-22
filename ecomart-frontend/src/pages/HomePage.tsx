import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../services/productApi';
import { categoryApi } from '../services/categoryApi';
import { ProductCard } from '../components/product/ProductCard';
import {
  Leaf,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Recycle,
  Award,
} from 'lucide-react';
import { Product, Category } from '../types';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productApi.getProducts({ page: 0, pageSize: 8, sort: 'newest' }, controller.signal),
          categoryApi.getCategories(controller.signal),
        ]);
        if (isMounted) {
          const items = prodRes.data?.items || prodRes.data?.content || [];
          setProducts(items);
          setCategories(catRes.data || []);
        }
      } catch (err: unknown) {
        if ((err as Error).name !== 'CanceledError') {
          console.error('Failed to fetch home page data:', err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="space-y-14 pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-8 sm:p-14 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-emerald-400/30">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Mua Sắm Xanh — Vì Tương Lai Bền Vững
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Sản Phẩm Sinh Thái <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
              Chuẩn Xanh EcoMart
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
            Khám phá hàng ngàn sản phẩm đạt tiêu chuẩn sinh thái, chứng nhận hữu cơ quốc tế và có điểm Eco-Score minh bạch. Giao hàng COD toàn quốc.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-7 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/30 hover:scale-105"
            >
              Khám Phá Sản Phẩm <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-emerald-800/60 mt-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 border border-emerald-500/30">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Minh Bạch Eco-Score</h4>
              <p className="text-xs text-slate-300 mt-0.5">Thang điểm sinh thái 1 - 5★</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-teal-500/20 rounded-2xl text-teal-400 border border-teal-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Chứng Nhận Chuẩn Quốc Tế</h4>
              <p className="text-xs text-slate-300 mt-0.5">USDA Organic, Fair Trade, FSC</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 border border-emerald-500/30">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Giao Hàng Xanh COD</h4>
              <p className="text-xs text-slate-300 mt-0.5">Đóng gói vật liệu tái chế 100%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      {categories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Recycle className="w-5 h-5 text-emerald-600" />
              Danh Mục Sản Phẩm Nổi Bật
            </h2>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="px-5 py-2.5 bg-white border border-gray-200 rounded-2xl font-bold text-xs text-slate-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/40 hover:shadow-sm transition-all"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-500" />
              Sản Phẩm Sinh Thái Mới Nhất
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Tuyển chọn các sản phẩm thân thiện với môi trường vừa lên kệ
            </p>
          </div>

          <Link
            to="/products"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-slate-50 text-slate-500">
            Chưa có sản phẩm nào được cập nhật.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
