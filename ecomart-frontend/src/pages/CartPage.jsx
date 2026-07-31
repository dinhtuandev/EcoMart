import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Button from '../components/common/Button';
import { formatCurrency } from '../utils/formatters';

const CartPage = () => {
  const { cartItems, totalPrice, handleUpdateQuantity, handleRemoveFromCart, handleClearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
        <div className="text-5xl">🛒</div>
        <h2 className="text-2xl font-bold text-slate-800">Giỏ hàng của bạn đang trống</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Hãy khám phá danh mục sản phẩm tuyệt vời của TechHub và thêm các thiết bị yêu thích vào giỏ hàng.
        </p>
        <div className="pt-4">
          <Link to="/products">
            <Button size="md">Quay lại mua sắm</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Giỏ hàng của bạn</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400">
                  Img
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{item.name}</h3>
                  <p className="text-sm font-bold text-blue-600">{formatCurrency(item.price)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => handleRemoveFromCart(item.id)}
                  className="text-rose-500 hover:text-rose-700 text-sm font-medium"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <button
              onClick={handleClearCart}
              className="text-xs text-slate-500 hover:text-rose-600 underline"
            >
              Xóa toàn bộ giỏ hàng
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 h-fit space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-3">Tóm tắt đơn hàng</h2>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Tổng tiền sản phẩm:</span>
            <span className="font-bold text-slate-800">{formatCurrency(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Phương thức thanh toán:</span>
            <span className="font-bold text-emerald-600">COD (Khi nhận hàng)</span>
          </div>
          <div className="pt-4 border-t">
            <Link to="/checkout">
              <Button size="lg" className="w-full">
                Tiến hành đặt hàng (COD)
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
