import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Phone, Mail, MapPin, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { storeSettingApi } from '../../services/storeSettingApi';
import { StoreSetting } from '../../types';

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState<StoreSetting | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchSettings = async (): Promise<void> => {
      try {
        const response = await storeSettingApi.getSettings(controller.signal);
        if (isMounted && response.data) {
          setSettings(response.data);
        }
      } catch (err: unknown) {
        if ((err as Error).name !== 'CanceledError') {
          // Fallback will be shown gracefully
        }
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-400 pt-14 pb-8 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          {/* Column 1: Brand & Mission (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Leaf className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  Eco<span className="text-emerald-500">Mart</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80 -mt-1">
                  Eco Shopping Platform
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Sàn thương mại điện tử tiên phong cung cấp các sản phẩm sinh thái, chứng nhận hữu cơ quốc tế và thang điểm Eco-Score minh bạch vì một tương lai bền vững.
            </p>

            <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Đóng gói thân thiện môi trường</span>
            </div>
          </div>

          {/* Column 2: Quick Links & Policy Pages (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Chính Sách & Điều Hướng
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/products"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  Sản phẩm sinh thái
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  Liên hệ & Hỗ trợ
                </Link>
              </li>
              <li>
                <Link
                  to="/pages/privacy-policy"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  to="/pages/terms"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link
                  to="/pages/return-policy"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  Chính sách đổi trả 7 ngày
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Store Contact Information (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Thông Tin Liên Hệ
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Hotline: <strong className="text-white">{settings?.storePhone || '0987 654 321'}</strong>
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Email: <strong className="text-white">{settings?.storeEmail || 'support@ecomart.vn'}</strong>
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Địa chỉ: {settings?.storeAddress || '123 Đường Sinh Thái, Quận 1, TP. Hồ Chí Minh'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} <span className="text-slate-400 font-semibold">EcoMart Platform</span>. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Xây dựng với tinh thần sống xanh</span>
            <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
