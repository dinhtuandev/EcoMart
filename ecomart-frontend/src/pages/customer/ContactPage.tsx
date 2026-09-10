import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  Sparkles,
  ExternalLink,
  HelpCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  Leaf,
} from 'lucide-react';
import { storeSettingApi } from '../../services/storeSettingApi';
import { contactApi } from '../../services/contactApi';
import { useToast } from '../../context/ToastContext';
import { StoreSetting, CreateContactMessagePayload } from '../../types';
import { Button } from '../../components/ui/Button';
import { NewsletterSection } from '../../components/ui/NewsletterSection';

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();

  const [settings, setSettings] = useState<StoreSetting | null>(null);
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);

  // Form State
  const [formData, setFormData] = useState<CreateContactMessagePayload>({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    content: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateContactMessagePayload, string>>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchStoreSettings = async (): Promise<void> => {
      try {
        const response = await storeSettingApi.getSettings(controller.signal);
        if (isMounted && response.data) {
          setSettings(response.data);
        }
      } catch (err: unknown) {
        if ((err as Error).name !== 'CanceledError') {
          console.error('Failed to load store settings:', err);
        }
      } finally {
        if (isMounted) {
          setLoadingSettings(false);
        }
      }
    };

    fetchStoreSettings();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof CreateContactMessagePayload]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateContactMessagePayload, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên của bạn';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập địa chỉ email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Địa chỉ email không hợp lệ';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Vui lòng nhập tiêu đề liên hệ';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Tiêu đề phải có ít nhất 5 ký tự';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Vui lòng nhập nội dung liên hệ';
    } else if (formData.content.trim().length < 10) {
      newErrors.content = 'Nội dung liên hệ phải có ít nhất 10 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getMapEmbedUrl = (rawUrl?: string): string => {
    const defaultEmbed =
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4946681007886!2d106.69916297586866!3d10.773374289375171!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f46df3e9619%3A0xb3bf481a5665ebfb!2zUXXhuq1uIDEsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaA!5e0!3m2!1svi!2svn!4v1700000000000!5m2!1svi!2svn';

    if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.includes('google.com/maps/embed')) {
      return defaultEmbed;
    }
    return rawUrl.trim();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await contactApi.sendMessage({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || undefined,
        subject: formData.subject.trim(),
        content: formData.content.trim(),
      });

      if (response.success) {
        showToast(
          response.message || 'Gửi tin nhắn liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.',
          'success'
        );
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          subject: '',
          content: '',
        });
        setErrors({});
      } else {
        showToast(response.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.', 'error');
      }
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast(errorMsg || 'Có lỗi xảy ra khi gửi tin nhắn liên hệ.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 sm:space-y-12 pb-16 text-softdark">
      {/* ── HERO BANNER ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-primary-950 via-primary-900 to-primary-800 text-white py-10 sm:py-12 px-6 sm:px-12 text-center shadow-2xl border border-primary-800/50">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-32 top-0 w-[40rem] h-[40rem] rounded-full bg-primary-500/10 blur-[100px]" />
        <div className="pointer-events-none absolute -left-32 bottom-0 w-[40rem] h-[40rem] rounded-full bg-accent-500/10 blur-[100px]" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-800/80 border border-primary-700/80 text-primary-200 text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-accent-400" />
            Hỗ Trợ &amp; Đồng Hành Sinh Thái
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
            Liên Hệ Với EcoMart
          </h1>
          <p className="text-primary-200/90 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe mọi ý kiến đóng góp, thắc mắc về tiêu chuẩn sinh thái, đơn hàng và sứ mệnh sống xanh của bạn.
          </p>
        </div>
      </section>

      {/* ── 2-COLUMN CONTENT GRID ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        {/* Left Column: Store Contact Information */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-surface rounded-[2.5rem] p-6 sm:p-8 border border-border shadow-sm flex flex-col justify-between h-full space-y-6">
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-softdark flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary-100/80 text-primary-700">
                  <MessageSquare className="w-5 h-5" />
                </div>
                Thông Tin Liên Hệ
              </h2>

              {loadingSettings ? (
                <div className="space-y-4 animate-pulse flex-1 flex flex-col justify-between">
                  <div className="h-16 bg-primary-100/60 rounded-2xl" />
                  <div className="h-16 bg-primary-100/60 rounded-2xl" />
                  <div className="h-16 bg-primary-100/60 rounded-2xl" />
                  <div className="h-16 bg-primary-100/60 rounded-2xl" />
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between gap-4">
                  {/* Phone */}
                  <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface-soft border border-border hover:border-primary-300/80 hover:shadow-xs transition-all">
                    <div className="p-2.5 bg-primary-100 text-primary-800 rounded-xl shadow-2xs shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-softdark-muted">Hotline tư vấn</div>
                      <a
                        href={`tel:${settings?.storePhone || '0987654321'}`}
                        className="text-sm font-bold text-softdark hover:text-primary-700 transition-colors mt-0.5 block"
                      >
                        {settings?.storePhone || '0987 654 321'}
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface-soft border border-border hover:border-primary-300/80 hover:shadow-xs transition-all">
                    <div className="p-2.5 bg-primary-100 text-primary-800 rounded-xl shadow-2xs shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-softdark-muted">Email hỗ trợ</div>
                      <a
                        href={`mailto:${settings?.storeEmail || 'support@ecomart.vn'}`}
                        className="text-sm font-bold text-softdark hover:text-primary-700 transition-colors mt-0.5 block"
                      >
                        {settings?.storeEmail || 'support@ecomart.vn'}
                      </a>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface-soft border border-border hover:border-primary-300/80 hover:shadow-xs transition-all">
                    <div className="p-2.5 bg-primary-100 text-primary-800 rounded-xl shadow-2xs shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-softdark-muted">Địa chỉ văn phòng</div>
                      <div className="text-sm font-bold text-softdark mt-0.5 leading-relaxed">
                        {settings?.storeAddress || '123 Đường Sinh Thái, Quận 1, TP. Hồ Chí Minh'}
                      </div>
                    </div>
                  </div>

                  {/* Working hours */}
                  <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface-soft border border-border hover:border-primary-300/80 hover:shadow-xs transition-all">
                    <div className="p-2.5 bg-primary-100 text-primary-800 rounded-xl shadow-2xs shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-softdark-muted">Giờ làm việc</div>
                      <div className="text-sm font-bold text-softdark mt-0.5">
                        Thứ Hai - Thứ Bảy: 08:00 - 18:00
                      </div>
                    </div>
                  </div>

                  {/* Commitment Badge */}
                  <div className="p-4 bg-primary-50/80 rounded-2xl border border-primary-200/80 flex items-start gap-3 mt-1">
                    <div className="p-2 bg-primary-100 text-primary-700 rounded-xl shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="text-xs">
                      <h4 className="font-bold text-softdark mb-0.5">Cam Kết Phản Hồi Trong 24H</h4>
                      <p className="text-softdark-muted leading-relaxed">
                        Đội ngũ CSKH EcoMart cam kết lắng nghe và giải đáp thắc mắc của bạn nhanh chóng.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-surface rounded-[2.5rem] p-6 sm:p-8 border border-border shadow-sm flex flex-col justify-between h-full space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-softdark flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent-100/80 text-accent-800">
                  <Send className="w-5 h-5" />
                </div>
                Liên Hệ Trực Tuyến
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="contact-fullName"
                  className="block text-xs font-bold text-softdark uppercase tracking-wider mb-1.5"
                >
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  id="contact-fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nguyễn Văn A"
                  tabIndex={0}
                  aria-label="Họ và tên của bạn"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all ${
                    errors.fullName
                      ? 'border-rose-400 bg-rose-50/20 text-softdark focus:ring-4 focus:ring-rose-400/20'
                      : 'border-border bg-surface text-softdark placeholder:text-softdark-muted/50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'
                  }`}
                />
                {errors.fullName && (
                  <p className="text-xs text-rose-500 font-semibold mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-bold text-softdark uppercase tracking-wider mb-1.5"
                  >
                    Địa chỉ Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@domain.com"
                    tabIndex={0}
                    aria-label="Địa chỉ email liên hệ"
                    className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all ${
                      errors.email
                        ? 'border-rose-400 bg-rose-50/20 text-softdark focus:ring-4 focus:ring-rose-400/20'
                        : 'border-border bg-surface text-softdark placeholder:text-softdark-muted/50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-500 font-semibold mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-xs font-bold text-softdark uppercase tracking-wider mb-1.5"
                  >
                    Số điện thoại
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0912 345 678"
                    tabIndex={0}
                    aria-label="Số điện thoại liên hệ"
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-surface text-softdark placeholder:text-softdark-muted/50 text-sm font-medium outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-bold text-softdark uppercase tracking-wider mb-1.5"
                >
                  Tiêu đề liên hệ <span className="text-rose-500">*</span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Tư vấn về chứng nhận hữu cơ của sản phẩm..."
                  tabIndex={0}
                  aria-label="Tiêu đề tin nhắn liên hệ"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all ${
                    errors.subject
                      ? 'border-rose-400 bg-rose-50/20 text-softdark focus:ring-4 focus:ring-rose-400/20'
                      : 'border-border bg-surface text-softdark placeholder:text-softdark-muted/50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'
                  }`}
                />
                {errors.subject && (
                  <p className="text-xs text-rose-500 font-semibold mt-1">{errors.subject}</p>
                )}
              </div>

              {/* Content Textarea */}
              <div>
                <label
                  htmlFor="contact-content"
                  className="block text-xs font-bold text-softdark uppercase tracking-wider mb-1.5"
                >
                  Nội dung chi tiết <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="contact-content"
                  name="content"
                  rows={5}
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Nhập nội dung bạn cần hỗ trợ hoặc trao đổi với EcoMart..."
                  tabIndex={0}
                  aria-label="Nội dung chi tiết tin nhắn liên hệ"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all resize-y ${
                    errors.content
                      ? 'border-rose-400 bg-rose-50/20 text-softdark focus:ring-4 focus:ring-rose-400/20'
                      : 'border-border bg-surface text-softdark placeholder:text-softdark-muted/50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'
                  }`}
                />
                {errors.content && (
                  <p className="text-xs text-rose-500 font-semibold mt-1">{errors.content}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={submitting}
                  ariaLabel="Gửi tin nhắn liên hệ"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl shadow-md shadow-primary-700/20 gap-2 font-bold"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Gửi Tin Nhắn
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>



      {/* ── GOOGLE MAP SECTION ──────────────────────────────────────── */}
      <section id="google-map-section" className="bg-surface rounded-[2.5rem] p-8 sm:p-10 border border-border shadow-sm space-y-6 scroll-mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100/80 text-primary-800 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-primary-700" />
              Văn Phòng &amp; Trung Tâm Trải Nghiệm
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-softdark tracking-tight">
              Ghé Thăm Không Gian Sinh Thái EcoMart
            </h2>
            <p className="text-xs sm:text-sm text-softdark-muted">
              {settings?.storeAddress || '123 Đường Sinh Thái, Bến Nghé, Quận 1, TP. Hồ Chí Minh'}
            </p>
          </div>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              settings?.storeAddress || '123 Đường Sinh Thái, Quận 1, TP. Hồ Chí Minh'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary-50 hover:bg-primary-100 text-primary-800 border border-primary-200 text-xs font-bold transition-all shadow-2xs shrink-0 self-start sm:self-auto hover:scale-[1.02] active:scale-95"
          >
            <span>Chỉ Đường Trên Google Maps</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Map iframe container */}
        <div className="relative overflow-hidden rounded-[2rem] border border-border h-[350px] sm:h-[420px] shadow-inner bg-primary-50/30">
          <iframe
            src={getMapEmbedUrl(settings?.mapEmbedUrl)}
            title="Bản đồ vị trí EcoMart"
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
          />
        </div>
      </section>

      {/* ── FAQ SECTION ─────────────────────────────────────────────── */}
      <section className="bg-surface rounded-[2.5rem] p-8 sm:p-12 lg:p-14 border border-border shadow-sm space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-100/80 text-accent-800 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-accent-600" />
            Câu Hỏi Thường Gặp
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-softdark tracking-tight">
            Giải Đáp Thắc Mắc Nhanh
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {[
            {
              icon: <ShieldCheck className="w-5 h-5 text-primary-700" />,
              bg: 'bg-primary-50/70 border-primary-200/70',
              iconBg: 'bg-primary-100 text-primary-800',
              question: 'Làm sao để biết sản phẩm đạt chuẩn sinh thái?',
              answer:
                'Mọi sản phẩm tại EcoMart đều được thẩm định qua thang điểm Eco-Score minh bạch và công khai chứng nhận quốc tế như USDA Organic, FSC, Fair Trade.',
            },
            {
              icon: <Leaf className="w-5 h-5 text-primary-700" />,
              bg: 'bg-primary-50/70 border-primary-200/70',
              iconBg: 'bg-primary-100 text-primary-800',
              question: 'Quy cách đóng gói không rác thải nhựa như thế nào?',
              answer:
                'EcoMart sử dụng 100% thùng carton tái chế, băng keo giấy hoạt tính nước và đệm chèn rơm sinh học tự phân hủy hoàn toàn trong môi trường tự nhiên.',
            },
            {
              icon: <Truck className="w-5 h-5 text-primary-700" />,
              bg: 'bg-surface-soft border-border',
              iconBg: 'bg-primary-100 text-primary-800',
              question: 'Thời gian giao hàng và chi phí vận chuyển?',
              answer:
                'Đơn hàng nội thành được giao nhanh trong 24 giờ. Đơn liên tỉnh từ 2–3 ngày làm việc. Hỗ trợ giao hàng COD và miễn phí vận chuyển cho đơn hàng đủ điều kiện.',
            },
            {
              icon: <RotateCcw className="w-5 h-5 text-primary-700" />,
              bg: 'bg-surface-soft border-border',
              iconBg: 'bg-primary-100 text-primary-800',
              question: 'Chính sách bảo hành và đổi trả sản phẩm?',
              answer:
                'Hỗ trợ đổi trả miễn phí trong 7 ngày nếu sản phẩm có lỗi từ nhà sản xuất hoặc bị hư hại trong quá trình giao hàng mà không phát sinh thêm chi phí.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-6 sm:p-7 rounded-[2rem] border ${item.bg} space-y-3 transition-all hover:shadow-xs`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`p-3 rounded-2xl ${item.iconBg} shrink-0 shadow-xs`}>
                  {item.icon}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-softdark">
                  {item.question}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-softdark-muted leading-relaxed pl-14">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER SECTION ──────────────────────────────────────── */}
      <NewsletterSection />
    </div>
  );
};

export default ContactPage;
