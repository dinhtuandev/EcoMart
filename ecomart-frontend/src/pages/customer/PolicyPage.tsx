import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
  ChevronRight,
  HelpCircle,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PolicyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'returns' | 'shipping' | 'privacy' | 'eco'>('returns');

  return (
    <div className="space-y-10 sm:space-y-12 pb-16 text-slate-800">
      {/* ── HERO BANNER ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white py-12 px-6 sm:px-12 text-center shadow-2xl border border-emerald-800/50">
        <div className="pointer-events-none absolute -right-32 top-0 w-[35rem] h-[35rem] rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="pointer-events-none absolute -left-32 bottom-0 w-[35rem] h-[35rem] rounded-full bg-amber-500/10 blur-[100px]" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-700/80 text-emerald-200 text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-inner">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Minh Bạch &amp; An Tâm Mua Sắm
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
            Chính Sách EcoMart
          </h1>
          <p className="text-emerald-200/90 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Cam kết mang đến trải nghiệm dịch vụ sống xanh an toàn, uy tín với các chính sách đổi trả, vận chuyển và bảo mật rõ ràng.
          </p>
        </div>
      </section>

      {/* ── POLICY NAVIGATION & CONTENT ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Navigation Tabs (Left Column) */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col justify-between h-full space-y-4">
            <div className="space-y-2">
              <h3 className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Danh Mục Chính Sách
              </h3>

              <button
                type="button"
                onClick={() => setActiveTab('returns')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all text-sm font-bold ${
                  activeTab === 'returns'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-5 h-5 shrink-0" />
                  <span>Chính Sách Đổi Trả</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-75" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('shipping')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all text-sm font-bold ${
                  activeTab === 'shipping'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 shrink-0" />
                  <span>Giao Hàng &amp; Đóng Gói</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-75" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all text-sm font-bold ${
                  activeTab === 'privacy'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 shrink-0" />
                  <span>Bảo Mật Quyền Riêng Tư</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-75" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('eco')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all text-sm font-bold ${
                  activeTab === 'eco'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 shrink-0" />
                  <span>Tiêu Chuẩn Eco-Score</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-75" />
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Cần hỗ trợ trực tiếp?
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vui lòng liên hệ với đội ngũ CSKH EcoMart để được tư vấn thêm.
              </p>
              <Link
                to="/contact"
                className="inline-block text-xs font-bold text-emerald-700 hover:text-emerald-900 underline mt-1"
              >
                Trang Liên Hệ &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Policy Detail Content (Right Column) */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm flex flex-col justify-between h-full space-y-8">
          {activeTab === 'returns' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Chính Sách Đổi Trả &amp; Hoàn Tiền
                  </h2>
                  <p className="text-xs text-slate-500">Áp dụng cho toàn bộ đơn hàng tại EcoMart</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                <h3 className="font-bold text-slate-900 text-base">1. Điều kiện đổi trả hàng</h3>
                <ul className="space-y-2 list-disc list-inside pl-2">
                  <li>Sản phẩm còn nguyên tem mác, chưa qua sử dụng hoặc hư hỏng do vận chuyển.</li>
                  <li>Sản phẩm giao không đúng chủng loại, mẫu mã hoặc hết hạn sử dụng.</li>
                  <li>Thời gian yêu cầu đổi trả trong vòng <strong>7 ngày</strong> kể từ khi nhận hàng.</li>
                </ul>

                <h3 className="font-bold text-slate-900 text-base pt-2">2. Quy trình hoàn tiền</h3>
                <p>
                  Sau khi nhận được sản phẩm hoàn trả và kiểm định chất lượng, EcoMart sẽ tiến hành hoàn tiền qua hình thức chuyển khoản ngân hàng hoặc ví điện tử trong vòng 24 - 48h làm việc.
                </p>

                <h3 className="font-bold text-slate-900 text-base pt-2">3. Chi phí đổi trả</h3>
                <p>
                  EcoMart miễn phí 100% chi phí vận chuyển đổi trả nếu lỗi thuộc về nhà sản xuất hoặc khâu giao hàng.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Chính Sách Giao Hàng &amp; Đóng Gói Xanh
                  </h2>
                  <p className="text-xs text-slate-500">Tiêu chuẩn đóng gói 100% không rác thải nhựa</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                <h3 className="font-bold text-slate-900 text-base">1. Quy cách đóng gói sinh thái</h3>
                <p>
                  EcoMart cam kết sử dụng 100% thùng carton tái chế, băng keo giấy thủy phân và túi sinh học tự phân hủy. Hạn chế tối đa rác thải nhựa phát thải ra môi trường.
                </p>

                <h3 className="font-bold text-slate-900 text-base pt-2">2. Thời gian &amp; Phí giao hàng</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="font-bold text-emerald-800">Nội thành TP.HCM</div>
                    <div className="text-xs text-slate-500">Giao nhanh trong 24h - 48h</div>
                    <div className="text-xs font-semibold text-slate-700">Freeship đơn từ 300.000đ</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="font-bold text-emerald-800">Các Tỉnh Thành Khác</div>
                    <div className="text-xs text-slate-500">Giao hàng tiêu chuẩn 2 - 4 ngày</div>
                    <div className="text-xs font-semibold text-slate-700">Freeship đơn từ 500.000đ</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Chính Sách Bảo Mật Quyền Riêng Tư
                  </h2>
                  <p className="text-xs text-slate-500">Bảo vệ an toàn thông tin cá nhân khách hàng</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                <h3 className="font-bold text-slate-900 text-base">1. Thu thập thông tin</h3>
                <p>
                  EcoMart chỉ thu thập các thông tin cần thiết như họ tên, địa chỉ giao hàng, số điện thoại và email nhằm phục vụ việc xử lý đơn hàng và chăm sóc khách hàng tốt hơn.
                </p>

                <h3 className="font-bold text-slate-900 text-base pt-2">2. Cam kết bảo mật</h3>
                <p>
                  Mọi thông tin cá nhân và dữ liệu thanh toán đều được mã hóa bằng chuẩn an toàn SSL. EcoMart tuyệt đối không chia sẻ hoặc bán dữ liệu cho bên thứ ba vì mục đích thương mại.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'eco' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Tiêu Chuẩn Thang Điểm Eco-Score
                  </h2>
                  <p className="text-xs text-slate-500">Kiểm định sinh thái minh bạch &amp; khoa học</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                <p>
                  Thang điểm Eco-Score tại EcoMart đánh giá tác động môi trường dựa trên 5 tiêu chí cốt lõi: Nguồn gốc nguyên liệu, Quy trình sản xuất, Khả năng phân hủy, Đóng gói tái chế và Chứng nhận quốc tế (USDA Organic, FSC, Fair Trade, GRS).
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-emerald-900 text-xs sm:text-sm">Eco-Score 90 - 100 (Xuất Sắc)</div>
                      <div className="text-xs text-slate-600">Sản phẩm hữu cơ 100%, thuần chay, đạt nhiều chứng nhận uy tín quốc tế.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-800 text-xs sm:text-sm">Eco-Score 75 - 89 (Tốt)</div>
                      <div className="text-xs text-slate-600">Nguyên liệu thân thiện môi trường, tái chế tốt, hạn chế tối đa hóa chất độc hại.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
