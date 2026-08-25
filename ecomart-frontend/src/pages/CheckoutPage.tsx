import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  MapPin,
  CreditCard,
  Truck,
  ArrowLeft,
  Leaf,
  Package,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { addressApi } from '../services/addressApi';
import { orderApi } from '../services/orderApi';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Address, CartItem, PaymentMethod, CustomAxiosError } from '../types';
import { VietQrModal } from '../components/payment/VietQrModal';

interface CheckoutLocationState {
  selectedCartItemIds?: number[];
}

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}[] = [
  {
    value: 'COD',
    icon: <Truck className="w-5 h-5 text-emerald-600" />,
    label: 'Thanh toán khi nhận hàng (COD)',
    description: 'Kiểm tra hàng, ưng ý mới thanh toán. Miễn phí áp dụng toàn quốc.',
    badge: 'Phổ biến',
  },
  {
    value: 'VNPAY',
    icon: <CreditCard className="w-5 h-5 text-blue-600" />,
    label: 'VNPay — Thanh toán trực tuyến',
    description: 'Chuyển hướng sang cổng VNPay để thanh toán bằng thẻ ATM, Visa, MasterCard.',
  },
  {
    value: 'SEPAY',
    icon: <span className="text-base font-extrabold text-violet-600">QR</span>,
    label: 'SePay VietQR — Chuyển khoản nhanh',
    description: 'Quét mã QR thanh toán tức thì, hỗ trợ hơn 50 ngân hàng Napas 247.',
  },
];

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { cartItems, fetchCart } = useCart();

  // Lấy danh sách item đã chọn từ CartPage navigate state
  const locationState = location.state as CheckoutLocationState | null;
  const selectedCartItemIds = useMemo(
    () => new Set<number>(locationState?.selectedCartItemIds ?? []),
    [locationState]
  );

  // Lọc các item đã chọn để preview
  const itemsToCheckout: CartItem[] = useMemo(() => {
    if (selectedCartItemIds.size === 0) return cartItems;
    return cartItems.filter((item) => selectedCartItemIds.has(item.id));
  }, [cartItems, selectedCartItemIds]);

  const checkoutTotal: number = useMemo(() =>
    itemsToCheckout.reduce((s, i) => s + i.sellingPrice * i.quantity, 0),
    [itemsToCheckout]
  );

  // Địa chỉ giao hàng
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isLoadingAddr, setIsLoadingAddr] = useState<boolean>(true);

  // Phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');

  // Submit & VietQR Modal State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdOrderForQr, setCreatedOrderForQr] = useState<{
    id: number;
    orderCode: string;
    amount: number;
  } | null>(null);
  const [isVietQrOpen, setIsVietQrOpen] = useState<boolean>(false);

  // Redirect về cart nếu không có item nào
  useEffect(() => {
    if (!isLoadingAddr && cartItems.length === 0 && !isVietQrOpen) {
      navigate('/cart');
    }
  }, [cartItems, isLoadingAddr, isVietQrOpen, navigate]);

  // Load địa chỉ
  useEffect(() => {
    const load = async () => {
      setIsLoadingAddr(true);
      try {
        const res = await addressApi.getAddresses();
        const addrs = res.data || [];
        setAddresses(addrs);
        const def = addrs.find((a) => a.isDefault) ?? addrs[0];
        if (def) setSelectedAddressId(def.id);
      } catch {
        showToast('Không thể tải danh sách địa chỉ giao hàng.', 'error');
      } finally {
        setIsLoadingAddr(false);
      }
    };
    load();
  }, [showToast]);

  const handlePlaceOrder = async (): Promise<void> => {
    if (!selectedAddressId) {
      showToast('Vui lòng chọn địa chỉ giao hàng.', 'warning');
      return;
    }
    if (itemsToCheckout.length === 0) {
      showToast('Giỏ hàng trống. Vui lòng thêm sản phẩm trước.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await orderApi.createOrder({
        addressId: selectedAddressId,
        paymentMethod,
      });

      const createdOrder = res.data?.order;

      await fetchCart(); // Làm mới giỏ hàng sau khi đặt

      if (paymentMethod === 'VNPAY' && createdOrder) {
        // Chuyển hướng sang cổng Giả lập VNPay Sandbox
        navigate(
          `/payment/vnpay/mock?orderId=${createdOrder.id}&orderCode=${encodeURIComponent(
            createdOrder.orderCode
          )}&amount=${createdOrder.totalAmount}`
        );
        return;
      }

      if (paymentMethod === 'SEPAY' && createdOrder) {
        setCreatedOrderForQr({
          id: createdOrder.id,
          orderCode: createdOrder.orderCode,
          amount: createdOrder.totalAmount,
        });
        setIsVietQrOpen(true);
        return;
      }

      showToast('Đặt hàng thành công! Chúng tôi sẽ sớm xác nhận đơn của bạn.', 'success');
      navigate(`/orders/${createdOrder?.id}`);
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      const message =
        customError.response?.data?.message ||
        'Đặt hàng thất bại. Vui lòng kiểm tra lại giỏ hàng và thử lại.';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
        <button
          type="button"
          onClick={() => navigate('/cart')}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
          aria-label="Quay lại giỏ hàng"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Xác Nhận Đặt Hàng</h1>
            <p className="text-xs text-slate-500">
              Kiểm tra thông tin và chọn phương thức thanh toán
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái */}
        <div className="lg:col-span-2 space-y-6">
          {/* [1] Preview Sản Phẩm Đặt Hàng */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-600" />
              Sản Phẩm Đặt Hàng ({itemsToCheckout.length} mặt hàng)
            </h2>

            <div className="space-y-3">
              {itemsToCheckout.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                >
                  <img
                    src={
                      item.productImageUrl ||
                      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100'
                    }
                    alt={item.productName}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">
                      {item.productName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {formatCurrency(item.sellingPrice)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 flex-shrink-0">
                    {formatCurrency(item.sellingPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* [2] Chọn địa chỉ giao hàng */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Địa Chỉ Giao Hàng
              </h2>
              <Link
                to="/profile?tab=address"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Quản lý địa chỉ →
              </Link>
            </div>

            {isLoadingAddr ? (
              <div className="flex items-center gap-2 py-4 text-slate-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang tải danh sách địa chỉ...
              </div>
            ) : addresses.length === 0 ? (
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-800">
                    Bạn chưa có địa chỉ giao hàng nào
                  </p>
                  <Link
                    to="/profile?tab=address"
                    className="text-xs text-amber-700 underline"
                  >
                    Thêm địa chỉ mới tại đây
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {addresses.map((addr) => {
                  const fullAddress = [
                    addr.addressDetail,
                    addr.ward,
                    addr.district,
                    addr.province,
                  ]
                    .filter(Boolean)
                    .join(', ');
                  const isSelected = selectedAddressId === addr.id;

                  return (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-200'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={isSelected}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-0.5 w-4 h-4 text-emerald-600 accent-emerald-600 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">
                            {addr.recipientName}
                          </span>
                          <span className="text-xs text-slate-500">
                            {addr.recipientPhone}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{fullAddress}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* [3] Phương thức thanh toán */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Phương Thức Thanh Toán
            </h2>

            <div className="space-y-2.5">
              {PAYMENT_OPTIONS.map((opt) => {
                const isSelected = paymentMethod === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-200'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={isSelected}
                      onChange={() => setPaymentMethod(opt.value)}
                      className="w-4 h-4 text-emerald-600 accent-emerald-600 flex-shrink-0"
                    />
                    <div className="w-9 h-9 flex items-center justify-center bg-slate-100 rounded-xl flex-shrink-0">
                      {opt.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                        {opt.badge && (
                          <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{opt.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cột phải — Sticky Order Summary */}
        <div>
          <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm space-y-5 sticky top-24">
            <h2 className="text-sm font-bold text-slate-900 border-b pb-3 border-gray-100">
              Tóm Tắt Đơn Hàng
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính ({itemsToCheckout.length} sản phẩm):</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(checkoutTotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  Vận chuyển sinh thái:
                </span>
                <span className="font-bold text-emerald-600">Miễn phí (0 ₫)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phương thức:</span>
                <span className="font-bold text-slate-900">{paymentMethod}</span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-xs">Tổng thanh toán:</span>
                <span className="text-2xl font-black text-emerald-600">
                  {formatCurrency(checkoutTotal)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isSubmitting || addresses.length === 0 || !selectedAddressId}
              className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xử lý đơn hàng...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {paymentMethod === 'VNPAY'
                    ? 'Đặt Hàng & Chuyển sang VNPay'
                    : paymentMethod === 'SEPAY'
                    ? 'Đặt Hàng & Xem Mã QR'
                    : 'Xác Nhận Đặt Hàng COD'}
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-400 leading-relaxed">
              Bằng cách đặt hàng, bạn đồng ý với{' '}
              <span className="text-emerald-600 font-semibold">Điều khoản dịch vụ</span>{' '}
              và cam kết mua sắm có trách nhiệm vì môi trường.
            </p>
          </div>
        </div>
      </div>

      {/* VietQR Payment Modal */}
      {createdOrderForQr && (
        <VietQrModal
          isOpen={isVietQrOpen}
          orderId={createdOrderForQr.id}
          orderCode={createdOrderForQr.orderCode}
          amount={createdOrderForQr.amount}
          onClose={() => {
            setIsVietQrOpen(false);
            showToast('Đơn hàng đã được tạo. Bạn có thể thanh toán sau trong chi tiết đơn hàng.', 'warning');
            navigate(`/orders/${createdOrderForQr.id}`);
          }}
          onPaymentSuccess={() => {
            setIsVietQrOpen(false);
            showToast('Thanh toán đơn hàng thành công!', 'success');
            navigate(`/orders/${createdOrderForQr.id}`);
          }}
        />
      )}
    </div>
  );
};

export default CheckoutPage;

