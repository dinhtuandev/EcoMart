import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Heart,
  ArrowRight,
  Truck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Award,
} from 'lucide-react';
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
          // Graceful fallback
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
    <footer className="relative bg-gradient-to-b from-[#0c241a] via-[#081b13] to-[#040e0a] text-primary-200/80 border-t border-primary-800/40 mt-auto overflow-hidden">
      {/* Decorative ambient glowing circles */}
      <div className="pointer-events-none absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-primary-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-10 w-96 h-96 rounded-full bg-accent-500/10 blur-[130px]" />

      <div className="relative max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8 space-y-12">
        {/* ── TOP ECO COMMITMENT HIGHLIGHTS BAR ──────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-10 border-b border-primary-800/40">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-primary-900/40 border border-primary-800/50 backdrop-blur-xs">
            <div className="p-2.5 rounded-xl bg-primary-800/80 text-accent-400 shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">100% Sản Phẩm Sinh Thái</div>
              <div className="text-[11px] text-primary-300/80">Chứng nhận hữu cơ quốc tế minh bạch</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-primary-900/40 border border-primary-800/50 backdrop-blur-xs">
            <div className="p-2.5 rounded-xl bg-primary-800/80 text-accent-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Bao Bì Không Rác Thải Nhựa</div>
              <div className="text-[11px] text-primary-300/80">100% giấy tái chế &amp; túi tự phân hủy</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-primary-900/40 border border-primary-800/50 backdrop-blur-xs">
            <div className="p-2.5 rounded-xl bg-primary-800/80 text-accent-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Giao Hàng Xanh Giảm Phát Thải</div>
              <div className="text-[11px] text-primary-300/80">Tối ưu lộ trình và xe điện nội thành</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-primary-900/40 border border-primary-800/50 backdrop-blur-xs">
            <div className="p-2.5 rounded-xl bg-primary-800/80 text-accent-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Đổi Trả An Tâm 7 Ngày</div>
              <div className="text-[11px] text-primary-300/80">Cam kết hoàn tiền 100% nếu có lỗi</div>
            </div>
          </div>
        </div>

        {/* ── MAIN 4-COLUMN FOOTER GRID ──────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-10 border-b border-primary-800/40">
          {/* Col 1: Brand Info & Mission (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-primary-700/80 text-accent-300 border border-primary-600/60 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-primary-950/50">
                <Leaf className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-white group-hover:text-accent-300 transition-colors">
                  Eco<span className="text-accent-400">Mart</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent-300/80 -mt-1">
                  Sống Xanh Bền Vững
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-primary-200/80 leading-relaxed max-w-sm">
              Sàn thương mại điện tử tiên phong đồng hành cùng lối sống xanh, cung cấp các sản phẩm có kiểm định chuẩn sinh thái và thang điểm Eco-Score minh bạch.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-900/80 border border-primary-700/60 text-xs font-bold text-accent-300">
              <Sparkles className="w-3.5 h-3.5 text-accent-400" />
              <span>Tiêu chuẩn sống xanh tương lai</span>
            </div>
          </div>

          {/* Col 2: Navigation Links (2.5 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <span>Khám Phá</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-accent-300 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-primary-500" />
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-accent-300 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-primary-500" />
                  Sản phẩm sinh thái
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-accent-300 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-primary-500" />
                  Đơn mua của tôi
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-accent-300 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-primary-500" />
                  Liên hệ hỗ trợ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Policy & Standards (2.5 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <span>Chính Sách &amp; Tiêu Chuẩn</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/policy" className="hover:text-accent-300 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-primary-500" />
                  Chính sách đổi trả 7 ngày
                </Link>
              </li>
              <li>
                <Link to="/policy" className="hover:text-accent-300 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-primary-500" />
                  Giao hàng &amp; Đóng gói xanh
                </Link>
              </li>
              <li>
                <Link to="/policy" className="hover:text-accent-300 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-primary-500" />
                  Bảo mật quyền riêng tư
                </Link>
              </li>
              <li>
                <Link to="/policy" className="hover:text-accent-300 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-primary-500" />
                  Thang điểm Eco-Score
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Store Contact & Location (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Thông Tin Liên Hệ
            </h4>
            <div className="space-y-3 text-xs text-primary-200/90">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
                <span>
                  Hotline CSKH:{' '}
                  <a
                    href={`tel:${settings?.storePhone || '0987654321'}`}
                    className="font-bold text-white hover:text-accent-300 transition-colors"
                  >
                    {settings?.storePhone || '0987 654 321'}
                  </a>
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
                <span>
                  Email:{' '}
                  <a
                    href={`mailto:${settings?.storeEmail || 'support@ecomart.vn'}`}
                    className="font-bold text-white hover:text-accent-300 transition-colors"
                  >
                    {settings?.storeEmail || 'support@ecomart.vn'}
                  </a>
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Địa chỉ: {settings?.storeAddress || '123 Đường Sinh Thái, Quận 1, TP. Hồ Chí Minh'}
                </span>
              </div>
              <div className="pt-1">
                <Link
                  to="/contact#google-map-section"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-accent-300 hover:text-accent-200 underline transition-colors"
                >
                  <span>Chỉ đường trên Bản đồ</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM COPYRIGHT & PAYMENT BADGES ─────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-primary-400">
          <div>
            © {new Date().getFullYear()} <span className="text-white font-bold">EcoMart Platform</span>. Bản quyền thuộc về EcoMart.
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-primary-300/70">Phương thức thanh toán:</span>
            <div className="flex items-center gap-1.5 font-bold text-[10px] text-primary-200">
              <span className="px-2 py-0.5 rounded-md bg-primary-900/80 border border-primary-700/60">COD</span>
              <span className="px-2 py-0.5 rounded-md bg-primary-900/80 border border-primary-700/60 text-blue-300">VNPay</span>
              <span className="px-2 py-0.5 rounded-md bg-primary-900/80 border border-primary-700/60 text-emerald-300">SePay QR</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-primary-300">
            <span>Đồng hành sống xanh vì tương lai</span>
            <Heart className="w-3.5 h-3.5 text-accent-400 fill-accent-400" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
