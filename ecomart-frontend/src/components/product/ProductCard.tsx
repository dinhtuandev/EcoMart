import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { EcoScoreBadge } from './EcoScoreBadge';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { handleAddToCart } = useCart();
  const { showToast } = useToast();

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

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/80 p-4 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <div className="absolute top-6 left-6 z-10 bg-rose-500 text-white text-[11px] font-black px-2 py-0.5 rounded-lg shadow-sm">
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

          {/* Certifications chips */}
          {product.certifications && product.certifications.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.certifications.slice(0, 2).map((cert) => (
                <span
                  key={cert.id}
                  className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  {cert.name}
                </span>
              ))}
              {product.certifications.length > 2 && (
                <span className="text-[10px] font-bold text-slate-400 self-center">
                  +{product.certifications.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Product Title */}
        <Link to={`/products/${product.id}`} className="block">
          <h3 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-emerald-600 transition-colors leading-snug">
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

        <button
          type="button"
          onClick={onAddToCartClick}
          disabled={product.quantityInStock <= 0}
          className="w-full py-2 px-3 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{product.quantityInStock > 0 ? 'Thêm Vào Giỏ' : 'Tạm Hết Hàng'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
