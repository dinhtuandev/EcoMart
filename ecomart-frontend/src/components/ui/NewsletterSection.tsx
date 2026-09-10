import React, { useState } from 'react';
import { Mail, ArrowRight, Leaf } from 'lucide-react';

export interface NewsletterSectionProps {
  heading?: string;
  subheading?: string;
  placeholder?: string;
  buttonLabel?: string;
  onSubmit?: (email: string) => void;
  className?: string;
}

export const NewsletterSection: React.FC<NewsletterSectionProps> = ({
  heading = 'Nhận ưu đãi sinh thái độc quyền',
  subheading = 'Đăng ký ngay để nhận voucher giảm 10% cho đơn hàng đầu tiên và cập nhật sản phẩm xanh mới nhất từ EcoMart!',
  placeholder = 'Nhập địa chỉ email của bạn...',
  buttonLabel = 'Đăng Ký Ngay',
  onSubmit,
  className = '',
}) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Vui lòng nhập email hợp lệ.');
      return;
    }
    setError('');
    onSubmit?.(email);
    setSubmitted(true);
    setEmail('');
  };

  return (
    <section
      className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 px-8 py-14 sm:px-16 sm:py-16 text-center shadow-xl ${className}`}
    >
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -top-12 -left-12 w-48 h-48 rounded-full bg-primary-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-autumn-400/20 blur-3xl" />

      <div className="relative space-y-6 max-w-2xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-600/60 border border-primary-500/60 text-primary-100 text-xs font-bold uppercase tracking-wider">
          <Leaf className="w-3.5 h-3.5" />
          Ưu đãi thành viên
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            {heading}
          </h2>
          <p className="text-sm text-primary-200 leading-relaxed max-w-lg mx-auto">
            {subheading}
          </p>
        </div>

        {/* Form */}
        {submitted ? (
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary-600/60 border border-primary-500 text-white font-bold text-sm">
            <Mail className="w-4 h-4 text-autumn-300" />
            Cảm ơn! Kiểm tra hộp thư của bạn nhé 🎉
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-md mx-auto"
          >
            <div className="flex-1 relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-primary-900/70 border border-primary-600/60 text-white placeholder-primary-400 text-sm focus:outline-none focus:ring-2 focus:ring-autumn-400 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-autumn-500 hover:bg-autumn-400 text-primary-950 font-black text-sm shadow-lg shadow-autumn-500/30 hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap"
            >
              {buttonLabel}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
        {error && <p className="text-xs text-rose-300 -mt-2">{error}</p>}

        {/* Trust note */}
        <p className="text-xs text-primary-400">
          🔒 Chúng tôi không chia sẻ thông tin của bạn. Hủy đăng ký bất kỳ lúc nào.
        </p>
      </div>
    </section>
  );
};

export default NewsletterSection;
