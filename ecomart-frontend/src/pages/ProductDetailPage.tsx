import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Leaf,
  ShieldCheck,
  Plus,
  Minus,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Award,
  AlertCircle,
} from 'lucide-react';
import { productApi } from '../services/productApi';
import { reviewApi } from '../services/reviewApi';
import { EcoScoreBadge } from '../components/product/EcoScoreBadge';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useStorePreview } from '../hooks/useStorePreview';
import { Product, ProductImage, ProductReviewSummary } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { handleAddToCart } = useCart();
  const { showToast } = useToast();
  const { isPreview } = useStorePreview();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    const controller = new AbortController();
    setIsLoading(true);

    productApi
      .getProductDetail(id, controller.signal)
      .then((res) => {
        if (isMounted && res.data) {
          setProduct(res.data);
          const primary =
            res.data.images?.find((img) => img.isPrimary)?.imageUrl ||
            res.data.images?.[0]?.imageUrl ||
            'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800';
          setSelectedImage(primary);
        }
      })
      .catch((error: unknown) => {
        if ((error as Error).name !== 'CanceledError' && isMounted) {
          showToast('Không tìm thấy thông tin sản phẩm.', 'error');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id, showToast]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  const handleQuantityChange = (delta: number): void => {
    if (!product) return;
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > product.quantityInStock) {
        showToast(`Số lượng tối đa trong kho là ${product.quantityInStock}`, 'warning');
        return product.quantityInStock;
      }
      return next;
    });
  };

  const onAddToCart = async (): Promise<void> => {
    if (!product) return;

    if (product.quantityInStock <= 0) {
      showToast('Sản phẩm đã hết hàng!', 'error');
      return;
    }

    setIsAddingToCart(true);
    try {
      const success = await handleAddToCart(product.id, quantity);
      if (success) {
        showToast(`Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng!`, 'success');
      }
    } catch {
      showToast('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const onBuyNow = async (): Promise<void> => {
    await onAddToCart();
    navigate('/cart');
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium">Đang tải thông tin sản phẩm sinh thái...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4 shadow-sm max-w-md mx-auto my-12">
        <AlertCircle className="w-16 h-16 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Sản phẩm không tồn tại</h2>
        <p className="text-xs text-slate-500">
          Sản phẩm này có thể đã ngừng kinh doanh hoặc đường dẫn không chính xác.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh mục
        </Link>
      </div>
    );
  }

  const discountPercent =
    product.originalPrice && product.originalPrice > product.sellingPrice
      ? Math.round(
          ((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100
        )
      : 0;

  return (
    <div className="space-y-10 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/" className="hover:text-emerald-600 transition-colors">
          Trang chủ
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-emerald-600 transition-colors">
          Sản phẩm
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 sm:p-10 rounded-3xl border border-gray-200/80 shadow-sm">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          {/* Large Image Container */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-gray-100 relative shadow-inner">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-contain p-4 transition-all duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800';
              }}
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md">
                Giảm {discountPercent}%
              </span>
            )}
          </div>

          {/* Small Image Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img: ProductImage) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImage(img.imageUrl)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 bg-slate-50 transition-all ${
                    selectedImage === img.imageUrl
                      ? 'border-emerald-600 shadow-md ring-2 ring-emerald-600/20'
                      : 'border-gray-200 hover:border-emerald-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Category & Brand info */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                {product.category?.name}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Thương hiệu: <strong className="text-slate-900">{product.brand?.name}</strong>
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Eco-Score Badge */}
            <div className="pt-1">
              <EcoScoreBadge score={product.ecoScore} showLabel={true} size="lg" />
            </div>

            {/* Price Box */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-gray-200/80 flex items-baseline gap-4">
              <span className="text-3xl font-black text-emerald-600">
                {formatCurrency(product.sellingPrice)}
              </span>
              {product.originalPrice && product.originalPrice > product.sellingPrice && (
                <span className="text-sm font-semibold text-slate-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Material & Sustainability Highlights */}
            {product.materialInfo && (
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/60 space-y-1">
                <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  Vật Liệu Sinh Thái & Tiêu Chuẩn Sản Xuất:
                </p>
                <p className="text-xs text-emerald-800 font-medium">{product.materialInfo}</p>
              </div>
            )}

            {/* Green Certifications */}
            {product.certifications && product.certifications.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Chứng Nhận Sinh Thái Đạt Chuẩn:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-2.5 bg-white border border-emerald-200 rounded-xl flex items-center gap-2.5 shadow-xs"
                    >
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{cert.name}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-1">
                          {cert.description || 'Tiêu chuẩn xanh quốc tế'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions: Quantity Stepper & Buy Buttons */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            {isPreview ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-800">
                Chế độ xem sàn: bạn chỉ đang xem thông tin sản phẩm, không thể mua hàng.
              </div>
            ) : (
              <>
            {/* Quantity Stepper */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700">Số lượng:</span>
              <div className="flex items-center bg-slate-100 border border-gray-200 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || product.quantityInStock <= 0}
                  className="p-1.5 hover:bg-white text-slate-700 rounded-lg transition-all disabled:opacity-40"
                  aria-label="Giảm số lượng"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center font-bold text-sm text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.quantityInStock || product.quantityInStock <= 0}
                  className="p-1.5 hover:bg-white text-slate-700 rounded-lg transition-all disabled:opacity-40"
                  aria-label="Tăng số lượng"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <span
                className={`text-xs font-semibold ${
                  product.quantityInStock > 0 ? 'text-slate-500' : 'text-rose-500 font-bold'
                }`}
              >
                (Còn {product.quantityInStock} sản phẩm trong kho)
              </span>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={onAddToCart}
                disabled={product.quantityInStock <= 0 || isAddingToCart}
                className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Thêm Vào Giỏ Hàng</span>
              </button>

              <button
                type="button"
                onClick={onBuyNow}
                disabled={product.quantityInStock <= 0 || isAddingToCart}
                className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Mua Ngay</span>
              </button>
            </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 border-b pb-3 border-gray-100">
          Mô Tả & Thông Tin Chi Tiết
        </h2>
        <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {product.description || (
            <p className="italic text-slate-400">
              Sản phẩm sinh thái chất lượng cao từ đối tác đạt chuẩn xanh của EcoMart.
            </p>
          )}
        </div>
      </div>

      {/* Product Reviews Section */}
      <ProductReviewSection productId={product.id} />

      {/* Sticky Mobile Add-to-Cart Bar (lg:hidden) */}
      {!isPreview && (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl p-3 flex items-center justify-between gap-3 lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase truncate">
            {product.name}
          </p>
          <p className="text-sm font-black text-emerald-600">
            {formatCurrency(product.sellingPrice)}
          </p>
        </div>

        <button
          type="button"
          onClick={onAddToCart}
          disabled={product.quantityInStock <= 0 || isAddingToCart}
          tabIndex={0}
          aria-label="Thêm vào giỏ hàng"
          className="flex-1 max-w-[200px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
        >
          {isAddingToCart ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ShoppingBag className="w-3.5 h-3.5" />
          )}
          <span>Thêm Vào Giỏ</span>
        </button>
      </div>
      )}
    </div>
  );
};

// =============================================
// Product Review Section Component
// =============================================
interface ProductReviewSectionProps {
  productId: number;
}

const ProductReviewSection: React.FC<ProductReviewSectionProps> = ({ productId }) => {
  const [summary, setSummary] = useState<ProductReviewSummary | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    reviewApi
      .getProductReviews(productId, {
        rating: selectedRating,
        page,
        pageSize: 5,
      })
      .then((res) => {
        if (isMounted && res.data) {
          setSummary(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId, selectedRating, page]);

  const ratingBreakdown = summary?.ratingBreakdown;
  const totalCount = summary?.reviewCount || 0;
  const avgRating = summary?.averageRating || 0;
  const reviewsList = summary?.reviews?.items || summary?.reviews?.content || [];
  const totalPages =
    summary?.reviews?.pagination?.totalPages ?? summary?.reviews?.totalPages ?? 1;

  const calculatePercent = (count: number = 0): number => {
    if (!totalCount || totalCount === 0) return 0;
    return Math.round((count / totalCount) * 100);
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  return (
    <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-200/80 shadow-sm space-y-8">
      <div className="flex items-center justify-between border-b pb-4 border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Đánh Giá & Nhận Xét Từ Khách Hàng
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Nhận xét thực tế từ người mua đã trải nghiệm sản phẩm
          </p>
        </div>
      </div>

      {/* Rating Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
        {/* Left: Big Score */}
        <div className="flex flex-col items-center justify-center text-center space-y-2 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-6">
          <span className="text-5xl font-black text-slate-900">
            {avgRating > 0 ? avgRating.toFixed(1) : '0.0'}
          </span>
          <div className="flex items-center gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="text-lg">
                {star <= Math.round(avgRating) ? '★' : '☆'}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Dựa trên {totalCount} lượt đánh giá
          </p>
        </div>

        {/* Right: Breakdown Bars */}
        <div className="md:col-span-2 space-y-2 justify-center flex flex-col">
          {[
            { star: 5, count: ratingBreakdown?.star5 ?? 0 },
            { star: 4, count: ratingBreakdown?.star4 ?? 0 },
            { star: 3, count: ratingBreakdown?.star3 ?? 0 },
            { star: 2, count: ratingBreakdown?.star2 ?? 0 },
            { star: 1, count: ratingBreakdown?.star1 ?? 0 },
          ].map(({ star, count }) => {
            const percent = calculatePercent(count);
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-slate-600 font-bold flex items-center gap-1">
                  {star} <span className="text-amber-400">★</span>
                </span>
                <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-16 text-right text-slate-400 font-medium">
                  {count} ({percent}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap border-b border-gray-100 pb-4">
        <span className="text-xs font-bold text-slate-700 mr-2">Lọc theo:</span>
        <button
          type="button"
          onClick={() => {
            setSelectedRating(undefined);
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedRating === undefined
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Tất cả ({totalCount})
        </button>
        {[5, 4, 3, 2, 1].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              setSelectedRating(r);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedRating === r
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {r} Sao
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4 py-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : reviewsList.length === 0 ? (
        <div className="text-center py-12 text-slate-400 space-y-2">
          <p className="text-sm font-medium">Chưa có đánh giá nào cho bộ lọc này.</p>
          <p className="text-xs">
            Hãy là người đầu tiên mua và chia sẻ cảm nhận về sản phẩm sinh thái này!
          </p>
        </div>
      ) : (
        <div className="space-y-4 divide-y divide-gray-100">
          {reviewsList.map((rev) => (
            <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                    {rev.userFullName ? rev.userFullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      {rev.userFullName || 'Khách hàng EcoMart'}
                    </span>
                    <p className="text-[10px] text-slate-400">{formatDate(rev.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center text-amber-400 text-xs">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s}>{s <= rev.rating ? '★' : '☆'}</span>
                  ))}
                </div>
              </div>

              {rev.comment && (
                <p className="text-xs text-slate-700 leading-relaxed pl-10">
                  {rev.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                page === p
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;



