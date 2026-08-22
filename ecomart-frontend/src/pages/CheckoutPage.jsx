import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { addressApi } from '../services/addressApi';
import { orderApi } from '../services/orderApi';
import { Truck, CheckCircle2, Plus } from 'lucide-react';

const CheckoutPage = () => {
  const { cartItems, totalPrice, fetchCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    recipientName: '',
    phone: '',
    streetAddress: '',
    isDefault: true,
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAddr = async () => {
      try {
        const res = await addressApi.getAddresses();
        if (res.success && res.data?.length > 0) {
          setAddresses(res.data);
          const defaultAddr = res.data.find((a) => a.isDefault) || res.data[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setShowAddForm(true);
        }
      } catch (err) {
        console.error('Failed to fetch addresses:', err);
      }
    };
    fetchAddr();
  }, []);

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await addressApi.createAddress(newAddress);
      if (res.success) {
        setAddresses([...addresses, res.data]);
        setSelectedAddressId(res.data.id);
        setShowAddForm(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể thêm địa chỉ');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Vui lòng chọn hoặc thêm địa chỉ giao hàng.');
      return;
    }
    setLoading(true);
    try {
      const res = await orderApi.createOrder({
        addressId: selectedAddressId,
        notes,
      });
      if (res.success) {
        alert('Đặt hàng thành công! Đơn hàng của bạn đang ở trạng thái PENDING.');
        await fetchCart();
        navigate('/orders');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Đặt hàng thất bại. Vui lòng kiểm tra tồn kho.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return <div className="p-12 text-center text-slate-500">Giỏ hàng của bạn đang trống.</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <h1 className="text-2xl font-extrabold text-slate-900">Xác Nhận Đặt Hàng COD</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Addresses & Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address Selection */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-4 border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" /> Địa Chỉ Giao Hàng
              </h2>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Thêm địa chỉ mới
                </button>
              )}
            </div>

            {showAddForm ? (
              <form onSubmit={handleCreateAddress} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Tên người nhận</label>
                    <input
                      type="text"
                      required
                      value={newAddress.recipientName}
                      onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Số điện thoại</label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Địa chỉ chi tiết</label>
                  <input
                    type="text"
                    required
                    placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
                    value={newAddress.streetAddress}
                    onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl">
                    Lưu Địa Chỉ
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`block p-4 border rounded-2xl cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{addr.recipientName}</span>
                            <span className="text-xs font-semibold text-slate-500">({addr.phone})</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{addr.streetAddress}</p>
                        </div>
                      </div>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          Mặc định
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Ghi chú cho đơn hàng (Tùy chọn)</h3>
            <textarea
              rows="3"
              placeholder="Nhập ghi chú giao hàng nếu có..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>
        </div>

        {/* Order Summary & Confirm */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 h-fit">
          <h2 className="text-lg font-bold text-slate-900 border-b pb-4 border-slate-100">Chi Tiết Thanh Toán</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Số lượng sản phẩm:</span>
              <span className="font-bold text-slate-800">{cartItems.length} mặt hàng</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Hình thức:</span>
              <span className="font-bold text-emerald-600">Thanh toán COD khi nhận hàng</span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="font-extrabold text-slate-900">Tổng tiền:</span>
              <span className="text-2xl font-extrabold text-blue-600">
                {Number(totalPrice).toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            {loading ? 'Đang Xử Lý Đơn...' : 'Xác Nhận Đặt Hàng COD'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
