import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setLoading(true);
    // Placeholder login flow shell
    setTimeout(() => {
      handleLogin({ email, fullName: 'Demo Customer', role: 'CUSTOMER' }, 'fake-jwt-token');
      setLoading(false);
      navigate('/');
    }, 500);
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-xl shadow-md border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">Đăng nhập tài khoản</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-lg text-sm border border-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Địa chỉ Email"
          id="email"
          type="email"
          placeholder="example@techhub.vn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Mật khẩu"
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" isLoading={loading} className="w-full">
          Đăng nhập
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-blue-600 hover:underline font-medium">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
