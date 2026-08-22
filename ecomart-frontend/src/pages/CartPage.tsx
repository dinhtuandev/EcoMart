import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Plus,
  Minus,
  CheckSquare,
  Square,
  Sparkles,
  ShieldCheck,
  Truck,
  Leaf,
  AlertCircle,
  PackageX,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const CartPage: React.FC = () => {
  const {
    cartItems,
    loading,
    handleLocalQuantityChange,
    handleRemoveFromCart,
    handleClearCart,
  } = useCart();

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State quản lý các sản phẩm được chọn để thanh toán
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Tự động chọn tất cả các sản phẩm khả dụng khi tải giỏ hàng
  useEffect(() => {
    if (cartItems.length > 0) {
      const availableIds = cartItems
        .filter((item) => item.isAvailable)
        .map((item) => item.id);
      setSelectedIds(new Set(availableIds));
    } else {
      setSelectedIds(new Set());
    }
  }, [cartItems]);

  // Format tiền VNĐ
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  // Toggle chọn 1 sản phẩm
  const handleToggleSelect = (cartItemId: number): void => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cartItemId)) {
        next.delete(cartItemId);
      } else {
        next.add(cartItemId);
      }
      return next;
    });
  };

  // Chọn / Bỏ chọn tất cả
  const availableItems = useMemo(
    () => cartItems.filter((item) => item.isAvailable),
    [cartItems]
  );

  const isAllSelected =
    availableItems.length > 0 && selectedIds.size === availableItems.length;

  const handleToggleSelectAll = (): void => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(availableItems.map((item) => item.id)));
    }
  };

  // Lọc ra các món đang được chọn để thanh toán
  const itemsToCheckout = useMemo(() => {
    return cartItems.filter((item) => selectedIds.has(item.id) && item.isAvailable);
  }, [cartItems, selectedIds]);

  // Tính tổng tiền thanh toán phái sinh bằng useMemo
  const subtotalCheckout = useMemo(() => {
    return itemsToCheckout.reduce(
      (sum, item) => sum + (item.sellingPrice || 0) * (item.quantity || 0),
      0
    );
  }, [itemsToCheckout]);

  const totalQuantityCheckout = useMemo(() => {
    return itemsToCheckout.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [itemsToCheckout]);

  // Điểm thưởng EcoMart Green Rewards ước tính (1 điểm / 10.000đ)
  const estimatedEcoPoints = useMemo(() => {
    return Math.floor(subtotalCheckout / 10000);
  }, [subtotalCheckout]);

  // Tiến hành chuyển sang trang Checkout
  const handleProceedToCheckout = (): void => {
    if (itemsToCheckout.length === 0) return;
    navigate('/checkout', {
      state: {
        selectedCartItemIds: Array.from(selectedIds),
      },
    });
  };

  // 1. Chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-5 my-12">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Vui lòng đăng nhập</h2>
          <p className="text-xs text-slate-500 mt-1">
            Bạn cần đăng nhập tài khoản EcoMart để xem và quản lý giỏ hàng.
          </p>
        </div>
        <Link
          to="/login"
          className="inline-block w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
        >
          Đăng Nhập Ngay
        </Link>
      </div>
    );
  }

  // 2. Giỏ hàng trống
  if (!loading && cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-5 my-12">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
          <PackageX className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Giỏ hàng của bạn đang trống</h2>
          <p className="text-xs text-slate-500 mt-1">
            Hãy lựa chọn những sản phẩm xanh thân thiện môi trường để bắt đầu mua sắm bền vững.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
        >
          <Leaf className="w-4 h-4" /> Khám Phá Sản Phẩm Xanh
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header Giỏ hàng */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Giỏ Hàng Sinh Thái
            </h1>
            <p className="text-xs text-slate-500">
              Quản lý và chọn các sản phẩm xanh đạt chuẩn tiêu dùng bền vững
            </p>
          </div>
        </div>

        {cartItems.length > 0 && (
          <button
            type="button"
            onClick={handleClearCart}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-all self-start sm:self-auto flex items-center gap-1.5 border border-rose-100"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả giỏ hàng
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột Trái: Danh Sách Sản Phẩm */}
        <div className="lg:col-span-2 space-y-4">
          {/* Thanh Chọn Tất Cả */}
          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2.5 text-xs font-bold text-slate-800 hover:text-emerald-600 transition-colors"
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>
                Chọn tất cả ({availableItems.length} sản phẩm khả dụng)
              </span>
            </button>

            <span className="text-xs font-semibold text-slate-500">
              Đã chọn: <strong className="text-emerald-600">{selectedIds.size}</strong> món
            </span>
          </div>

          {/* Danh Sách Items */}
          <div className="space-y-3">
            {cartItems.map((item) => {
              const isSelected = selectedIds.has(item.id);
              const isOutOfStock = !item.isAvailable || item.quantityInStock <= 0;
              const discountPercent =
                item.originalPrice && item.originalPrice > item.sellingPrice
                  ? Math.round(
                      ((item.originalPrice - item.sellingPrice) / item.originalPrice) * 100
                    )
                  : 0;

              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-sm transition-all duration-200 ${
                    isOutOfStock
                      ? 'border-gray-200 bg-slate-50/70 opacity-60'
                      : isSelected
                      ? 'border-emerald-500/50 ring-1 ring-emerald-500/20'
                      : 'border-gray-200/80 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Checkbox + Info */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      {/* Checkbox */}
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => handleToggleSelect(item.id)}
                        className="text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      {/* Image */}
                      <Link
                        to={`/products/${item.productId}`}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-gray-100 flex-shrink-0 relative group"
                      >
                        <img
                          src={
                            item.productImageUrl ||
                            'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300'
                          }
                          alt={item.productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300';
                          }}
                        />
                        {discountPercent > 0 && (
                          <span className="absolute top-1 left-1 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                            -{discountPercent}%
                          </span>
                        )}
                      </Link>

                      {/* Product details */}
                      <div className="space-y-1 min-w-0">
                        <Link
                          to={`/products/${item.productId}`}
                          className="font-bold text-sm text-slate-900 hover:text-emerald-600 transition-colors line-clamp-2 leading-snug"
                        >
                          {item.productName}
                        </Link>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-emerald-600">
                            {formatCurrency(item.sellingPrice)}
                          </span>
                          {item.originalPrice && item.originalPrice > item.sellingPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              {formatCurrency(item.originalPrice)}
                            </span>
                          )}
                        </div>

                        {/* Stock warning badge */}
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                            <AlertCircle className="w-3 h-3" /> Tạm hết hàng
                          </span>
                        ) : item.quantityInStock < 10 ? (
                          <span className="text-[11px] font-medium text-amber-600">
                            Chỉ còn {item.quantityInStock} sản phẩm
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Stepper + Subtotal + Remove */}
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                      {/* Quantity Stepper (KHÔNG cho phép nhập tay, chỉ bấm nút) */}
                      <div className="flex items-center bg-slate-100 border border-gray-200 rounded-xl p-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleLocalQuantityChange(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1 || isOutOfStock}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                          aria-label="Giảm số lượng"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-9 text-center font-bold text-slate-900 text-xs select-none">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleLocalQuantityChange(item.id, item.quantity + 1)
                          }
                          disabled={
                            item.quantity >= item.quantityInStock || isOutOfStock
                          }
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                          aria-label="Tăng số lượng"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-[90px]">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">
                          Thành tiền
                        </p>
                        <p className="text-sm font-black text-slate-900">
                          {formatCurrency(item.sellingPrice * item.quantity)}
                        </p>
                      </div>

                      {/* Nút Xóa */}
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Xóa sản phẩm"
                        aria-label={`Xóa ${item.productName}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cột Phải: Tóm Tắt Đơn Hàng (Order Summary) */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm space-y-5 sticky top-24">
            <h2 className="text-base font-bold text-slate-900 border-b pb-3 border-gray-100 flex items-center justify-between">
              <span>Tóm Tắt Đơn Hàng</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {totalQuantityCheckout} món chọn
              </span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính hàng đã chọn:</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(subtotalCheckout)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 items-center">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  Vận chuyển sinh thái:
                </span>
                <span className="font-bold text-emerald-600">Miễn phí (0 ₫)</span>
              </div>

              {/* Eco Rewards Points */}
              {estimatedEcoPoints > 0 && (
                <div className="flex justify-between items-center bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/60 text-emerald-900">
                  <span className="flex items-center gap-1 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Điểm thưởng EcoMart:
                  </span>
                  <span className="font-extrabold text-emerald-700">
                    +{estimatedEcoPoints} điểm
                  </span>
                </div>
              )}

              {/* Tổng thanh toán */}
              <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Tổng thanh toán:
                  </p>
                  <p className="text-[10px] text-slate-400">(Đã bao gồm VAT & Ưu đãi)</p>
                </div>
                <span className="text-2xl font-black text-emerald-600">
                  {formatCurrency(subtotalCheckout)}
                </span>
              </div>
            </div>

            {/* Nút Tiến Hành Thanh Toán */}
            <button
              type="button"
              onClick={handleProceedToCheckout}
              disabled={itemsToCheckout.length === 0}
              className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 hover:shadow-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>Tiến Hành Đặt Hàng</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Cam kết xanh EcoMart */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>100% Đóng gói bằng bao bì tự phân hủy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
