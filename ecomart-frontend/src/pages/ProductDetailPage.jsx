import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { productApi } from '../services/productApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Star, ShoppingBag, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState('');
  const [loading, setLoading] = useState(true);

  const { handleAddToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const [prodRes, revRes] = await Promise.all([
          productApi.getProductDetail(id),
          productApi.getProductReviews(id, { page: 1, pageSize: 10 }),
        ]);
        if (prodRes.success) {
          setProduct(prodRes.data);
          const firstImg =
            prodRes.data.images?.find((img) => img.isPrimary)?.url ||
            prodRes.data.images?.[0]?.url ||
            'https://via.placeholder.com/500';
          setActiveImg(firstImg);
        }
        if (revRes.success) {
          setReviews(revRes.data.items || []);
        }
      } catch (err) {
        console.error('Failed to fetch detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const onAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
      return;
    }
    const success = await handleAddToCart(product.id, quantity);
    if (success) {
      alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng thành công!`);
    }
  };

  if (loading) {
    return <div className="h-96 bg-slate-100 animate-pulse rounded-3xl"></div>;
  }

  if (!product) {
    return <div className="p-12 text-center text-slate-500">Sản phẩm không tồn tại hoặc đã dừng kinh doanh.</div>;
  }

  return (
    <div className="space-y-12 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shadow-inner">
            <img src={activeImg} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImg(img.url)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImg === img.url ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                {product.category?.name}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {product.brand?.name}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">{product.name}</h1>

            <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(product.averageRating || 0)
                        ? 'fill-amber-400 stroke-amber-400'
                        : 'fill-slate-200 stroke-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span>{product.averageRating || 0}</span>
              <span className="text-slate-400 font-normal">({product.reviewCount || 0} đánh giá)</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Giá khuyến mãi</span>
                <span className="text-3xl font-extrabold text-blue-600">
                  {Number(product.sellingPrice).toLocaleString('vi-VN')} ₫
                </span>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${product.quantityInStock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {product.quantityInStock > 0 ? `Còn hàng (${product.quantityInStock})` : 'Hết hàng'}
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">{product.description || 'Chưa có mô tả chi tiết.'}</p>
          </div>

          {/* Action Bar */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold text-slate-500 uppercase">Số lượng:</label>
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 rounded-l-xl"
                >
                  -
                </button>
                <span className="w-12 text-center font-bold text-slate-800 text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.quantityInStock, quantity + 1))}
                  className="w-9 h-9 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 rounded-r-xl"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={onAddToCart}
              disabled={product.quantityInStock <= 0}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50"
            >
              <ShoppingBag className="w-5 h-5" />
              Thêm Vào Giỏ Hàng
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Đánh Giá Sản Phẩm Khách Hàng</h2>

        {reviews.length === 0 ? (
          <p className="text-sm text-slate-500 italic">Chưa có đánh giá nào cho sản phẩm này.</p>
        ) : (
          <div className="space-y-4 divide-y divide-slate-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800">{rev.customerName || 'Khách hàng'}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 stroke-amber-400' : 'fill-slate-200 stroke-slate-200'}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetailPage;
