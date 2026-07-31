import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const CheckoutPage = () => {
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientPhone: '',
    addressDetail: '',
    ward: '',
    district: '',
    province: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Placeholder checkout shell
    setTimeout(() => {
      setLoading(false);
      navigate('/orders');
    }, 600);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Đặt hàng (Thanh toán COD)</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 space-y-4">
        <h2 className="text-lg font-bold text-slate-700 border-b pb-2">Thông tin người nhận hàng</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Họ tên người nhận"
            id="recipientName"
            value={formData.recipientName}
            onChange={handleChange}
            required
          />
          <Input
            label="Số điện thoại người nhận"
            id="recipientPhone"
            value={formData.recipientPhone}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          label="Địa chỉ chi tiết"
          id="addressDetail"
          placeholder="Số nhà, tên đường..."
          value={formData.addressDetail}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Phường / Xã" id="ward" value={formData.ward} onChange={handleChange} required />
          <Input label="Quận / Huyện" id="district" value={formData.district} onChange={handleChange} required />
          <Input label="Tỉnh / Thành phố" id="province" value={formData.province} onChange={handleChange} required />
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
          <p className="font-bold">⚠️ Phương thức thanh toán:</p>
          <p>Hệ thống áp dụng thanh toán COD (Nhận hàng và thanh toán tiền mặt trực tiếp cho nhân viên giao hàng).</p>
        </div>

        <div className="pt-4">
          <Button type="submit" isLoading={loading} className="w-full" size="lg">
            Xác nhận đặt hàng
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
