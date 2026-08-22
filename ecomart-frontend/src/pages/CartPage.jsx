import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

const CartPage = () => {
  const { cartItems, totalPrice, handleUpdateQuantity, handleRemoveFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 text-center bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-4">
        <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Vui lòng đăng nhập</h2>
        <p className="text-xs text-slate-500">Bạn cần đăng nhập tài khoản để xem và quản lý giỏ hàng.</p>
        <Link to="/login" className="inline-block px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl">
          Đăng Nhập Ngay
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 text-center bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-4">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Giỏ hàng trống</h2>
        <p className="text-xs text-slate-500">Hãy thêm các sản phẩm yêu thích vào giỏ để tiến hành đặt hàng.</p>
        <Link to="/products" className="inline-block px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl">
          Khám Phá Sản Phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <h1 className="text-2xl font-extrabold text-slate-900">Giỏ Hàng Của Bạn</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.cartItemId || item.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.productImage || item.product?.images?.[0]?.url || 'https://via.placeholder.com/100'}
                  alt={item.productName || item.name}
                  className="w-16 h-16 object-cover rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-800">{item.productName || item.product?.name}</h3>
                  <p className="text-sm font-extrabold text-blue-600">
                    {Number(item.unitPrice || item.price || 0).toLocaleString('vi-VN')} ₫
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                  <button
                    onClick={() => handleUpdateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 rounded-l-xl"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-slate-800 text-xs">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 rounded-r-xl"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-400">Tổng cộng</p>
                  <p className="text-sm font-extrabold text-slate-900">
                    {Number((item.unitPrice || 0) * item.quantity).toLocaleString('vi-VN')} ₫
                  </p>
                </div>

                <button
                  onClick={() => handleRemoveFromCart(item.cartItemId)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 h-fit">
          <h2 className="text-lg font-bold text-slate-900 border-b pb-4 border-slate-100">Tóm Tắt Đơn Hàng</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Phương thức thanh toán:</span>
              <span className="font-bold text-slate-800">COD (Nhận hàng thanh toán)</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Phí vận chuyển:</span>
              <span className="font-bold text-emerald-600">Miễn phí</span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="font-extrabold text-slate-900">Tổng thanh toán:</span>
              <span className="text-2xl font-extrabold text-blue-600">
                {Number(totalPrice).toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            Tiến Hành Đặt Hàng <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
