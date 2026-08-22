import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productApi } from '../services/productApi';
import { categoryApi } from '../services/categoryApi';
import { brandApi } from '../services/brandApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Star, ShoppingBag } from 'lucide-react';

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const { handleAddToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const keyword = searchParams.get('keyword') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const brandId = searchParams.get('brandId') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          categoryApi.getActiveCategories(),
          brandApi.getActiveBrands(),
        ]);
        if (catRes.success) setCategories(catRes.data || []);
        if (brandRes.success) setBrands(brandRes.data || []);
      } catch (err) {
        console.error('Failed to fetch metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          pageSize: 12,
          keyword: keyword || undefined,
          categoryId: categoryId || undefined,
          brandId: brandId || undefined,
          sort,
        };
        const res = await productApi.searchProducts(params);
        if (res.success) {
          setProducts(res.data.items || []);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, categoryId, brandId, sort, page]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const onAddToCart = async (e, productId) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
      return;
    }
    const success = await handleAddToCart(productId, 1);
    if (success) {
      alert('Đã thêm sản phẩm vào giỏ thành công!');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Search Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Danh Sách Sản Phẩm</h1>
          <p className="text-xs text-slate-500">Khám phá và mua sắm thiết bị công nghệ chính hãng</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={keyword}
            onChange={(e) => updateParam('keyword', e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-6 h-fit">
          <div className="flex items-center gap-2 border-b pb-3 border-slate-100 font-bold text-slate-800">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Bộ Lọc Sản Phẩm</span>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Danh Mục</label>
            <select
              value={categoryId}
              onChange={(e) => updateParam('categoryId', e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thương Hiệu</label>
            <select
              value={brandId}
              onChange={(e) => updateParam('brandId', e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="">Tất cả thương hiệu</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sắp Xếp</label>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="newest">Mới nhất</option>
              <option value="priceAsc">Giá tăng dần</option>
              <option value="priceDesc">Giá giảm dần</option>
            </select>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="md:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-500">
              Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const primaryImg =
                  product.images?.find((img) => img.isPrimary)?.url ||
                  product.images?.[0]?.url ||
                  'https://via.placeholder.com/300';
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateParam('page', p.toString())}
                  className={`w-9 h-9 rounded-xl font-bold text-xs transition-all ${
                    p === page ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductListPage;
