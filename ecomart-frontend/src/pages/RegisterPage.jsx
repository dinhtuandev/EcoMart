import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setLoading(true);
    // Placeholder registration shell
    setTimeout(() => {
      setLoading(false);
      navigate('/login');
    }, 500);
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-xl shadow-md border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">Đăng ký tài khoản</h2>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-lg text-sm border border-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Họ và tên"
          id="fullName"
          placeholder="Nguyễn Văn A"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        <Input
          label="Địa chỉ Email"
          id="email"
          type="email"
          placeholder="example@techhub.vn"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          label="Số điện thoại"
          id="phone"
          placeholder="0987654321"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <Input
          label="Mật khẩu"
          id="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Input
          label="Xác nhận mật khẩu"
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <Button type="submit" isLoading={loading} className="w-full">
          Đăng ký
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-blue-600 hover:underline font-medium">
          Đăng nhập ngay
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
