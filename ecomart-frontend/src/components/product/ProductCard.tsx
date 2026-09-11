import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles, Eye } from 'lucide-react';
import { Product } from '../../types';
import { EcoScoreBadge } from './EcoScoreBadge';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useStorePreview } from '../../hooks/useStorePreview';

export interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const { handleAddToCart } = useCart();
  const { showToast } = useToast();
  const { isPreview } = useStorePreview();

  const primaryImg =
    product.images?.find((img) => img.isPrimary)?.imageUrl ||
    product.images?.[0]?.imageUrl ||
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500';

  const discountPercent =
    product.originalPrice && product.originalPrice > product.sellingPrice
      ? Math.round(
          ((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100
        )
      : 0;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  const onAddToCartClick = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    if (product.quantityInStock <= 0) {
      showToast('Sản phẩm hiện đã hết hàng!', 'error');
      return;
    }

    try {
      const success = await handleAddToCart(product.id, 1);
      if (success) {
        showToast(`Đã thêm "${product.name}" vào giỏ hàng!`, 'success');
      }
    } catch {
      showToast('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.', 'error');
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="group bg-white rounded-2xl border border-gray-200/80 p-4 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden">
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded-lg shadow-sm">
            -{discountPercent}%
          </div>
        )}

        {/* Image */}
        <Link
          to={`/products/${product.id}`}
          className="block relative w-full sm:w-44 aspect-square rounded-xl overflow-hidden bg-slate-50 shrink-0"
        >
          <img
            src={primaryImg}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500';
            }}
          />
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-white/90 text-emerald-800 rounded-md backdrop-blur-md shadow-xs border border-emerald-100">
              {product.category?.name || 'Sinh thái'}
            </span>
          </div>
        </Link>

        {/* Content Info */}
        <div className="flex-1 min-w-0 space-y-2 text-left w-full">
          <div className="flex items-center gap-2">
            <EcoScoreBadge score={product.ecoScore} showLabel={true} size="sm" />
            {product.brand?.name && (
              <span className="text-xs font-semibold text-slate-400">
                • {product.brand.name}
              </span>
            )}
          </div>

          <Link to={`/products/${product.id}`} className="block">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-emerald-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {product.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Certifications */}
          {product.certifications && product.certifications.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {product.certifications.map((cert) => (
                <span
                  key={cert.id}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200"
                >
                  <Sparkles className="w-2.5 h-2.5 shrink-0" />
                  <span>{cert.name}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price & Action Button */}
        <div className="sm:w-48 shrink-0 flex flex-col justify-between sm:border-l sm:border-gray-100 sm:pl-5 space-y-3 w-full pt-3 sm:pt-0 border-t sm:border-t-0">
          <div>
            <p className="text-lg font-extrabold text-emerald-600">
              {formatCurrency(product.sellingPrice)}
            </p>
            {product.originalPrice && product.originalPrice > product.sellingPrice && (
              <p className="text-xs text-slate-400 line-through">
                {formatCurrency(product.originalPrice)}
              </p>
            )}
            <span
              className={`text-[11px] font-semibold block mt-1 ${
                product.quantityInStock > 0 ? 'text-slate-500' : 'text-rose-500 font-bold'
              }`}
            >
              {product.quantityInStock > 0 ? `Còn hàng (${product.quantityInStock})` : 'Hết hàng'}
            </span>
          </div>

          {isPreview ? (
            <Link
              to={`/products/${product.id}`}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>Xem chi tiết</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAddToCartClick}
              disabled={product.quantityInStock <= 0}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{product.quantityInStock > 0 ? 'Thêm Vào Giỏ' : 'Tạm Hết Hàng'}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/80 p-4 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <div className="absolute top-6 left-6 z-10 bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded-lg shadow-sm">
          -{discountPercent}%
        </div>
      )}

      <div>
        {/* Thumbnail Image */}
        <Link
          to={`/products/${product.id}`}
          className="block relative aspect-square rounded-xl overflow-hidden bg-slate-50 mb-3.5"
        >
          <img
            src={primaryImg}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500';
            }}
          />
          {/* Category Tag overlay */}
          <div className="absolute bottom-2.5 left-2.5">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-white/90 text-emerald-800 rounded-md backdrop-blur-md shadow-xs border border-emerald-100">
              {product.category?.name || 'Sinh thái'}
            </span>
          </div>
        </Link>

        {/* Eco-Score & Certifications */}
        <div className="space-y-1.5 mb-2.5">
          <div className="flex items-center justify-between gap-1">
            <EcoScoreBadge score={product.ecoScore} showLabel={false} size="sm" />
            <span className="text-[11px] font-medium text-slate-400 truncate">
              {product.brand?.name}
            </span>
          </div>

          {/* Certifications chips - 1 single line with ellipsis & fixed height */}
          <div className="h-5 flex items-center gap-1 overflow-hidden flex-nowrap">
            {product.certifications && product.certifications.length > 0 ? (
              <>
                {product.certifications.slice(0, 2).map((cert) => (
                  <span
                    key={cert.id}
                    title={cert.name}
                    className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 max-w-[115px] truncate shrink min-w-0"
                  >
                    <Sparkles className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{cert.name}</span>
                  </span>
                ))}
                {product.certifications.length > 2 && (
                  <span className="text-[10px] font-bold text-slate-400 shrink-0 self-center">
                    +{product.certifications.length - 2}
                  </span>
                )}
              </>
            ) : (
              <div className="h-5" />
            )}
          </div>
        </div>

        {/* Product Title - Fixed 2-line height for perfect horizontal alignment */}
        <Link to={`/products/${product.id}`} className="block">
          <h3
            title={product.name}
            className="font-bold text-slate-900 text-sm line-clamp-2 h-10 group-hover:text-emerald-600 transition-colors leading-snug"
          >
            {product.name}
          </h3>
        </Link>
      </div>

      {/* Footer: Price, Stock & Add to Cart */}
      <div className="pt-3.5 mt-2 border-t border-gray-100 space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-base font-extrabold text-emerald-600">
              {formatCurrency(product.sellingPrice)}
            </p>
            {product.originalPrice && product.originalPrice > product.sellingPrice && (
              <p className="text-xs text-slate-400 line-through">
                {formatCurrency(product.originalPrice)}
              </p>
            )}
          </div>

          <span
            className={`text-[11px] font-semibold ${
              product.quantityInStock > 0 ? 'text-slate-500' : 'text-rose-500 font-bold'
            }`}
          >
            {product.quantityInStock > 0 ? `Còn ${product.quantityInStock}` : 'Hết hàng'}
          </span>
        </div>

        {isPreview ? (
          <Link
            to={`/products/${product.id}`}
            className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem chi tiết</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={onAddToCartClick}
            disabled={product.quantityInStock <= 0}
            className="w-full py-2 px-3 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{product.quantityInStock > 0 ? 'Thêm Vào Giỏ' : 'Tạm Hết Hàng'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
