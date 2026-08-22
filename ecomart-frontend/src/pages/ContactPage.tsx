import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Sparkles } from 'lucide-react';
import { storeSettingApi } from '../services/storeSettingApi';
import { contactApi } from '../services/contactApi';
import { useToast } from '../context/ToastContext';
import { StoreSetting, CreateContactMessagePayload } from '../types';

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
    <div className="space-y-10 pb-12">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-8 sm:p-12 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Hỗ Trợ & Phản Hồi
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Liên Hệ Với EcoMart
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Chúng tôi luôn sẵn sàng lắng nghe mọi ý kiến đóng góp, thắc mắc về sản phẩm sinh thái và đơn hàng của bạn.
          </p>
        </div>
      </section>

      {/* 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Store Contact Information */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Thông Tin Liên Hệ
            </h2>

            {loadingSettings ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-14 bg-slate-100 rounded-2xl" />
                <div className="h-14 bg-slate-100 rounded-2xl" />
                <div className="h-14 bg-slate-100 rounded-2xl" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Phone */}
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/60">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Hotline tư vấn</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {settings?.storePhone || '0987 654 321'}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-teal-50/50 border border-teal-100/60">
                  <div className="p-2.5 bg-teal-500/10 text-teal-600 rounded-xl">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Email hỗ trợ</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {settings?.storeEmail || 'support@ecomart.vn'}
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <div className="p-2.5 bg-slate-200 text-slate-700 rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Địa chỉ văn phòng</div>
                    <div className="text-sm font-medium text-slate-800 mt-0.5 leading-relaxed">
                      {settings?.storeAddress || '123 Đường Sinh Thái, Quận 1, TP. Hồ Chí Minh'}
                    </div>
                  </div>
                </div>

                {/* Working hours */}
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <div className="p-2.5 bg-slate-200 text-slate-700 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Giờ làm việc</div>
                    <div className="text-sm font-medium text-slate-800 mt-0.5">
                      Thứ Hai - Thứ Bảy: 08:00 - 18:00
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Google Map Embed */}
            {settings?.mapEmbedUrl && (
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Bản Đồ Chỉ Đường
                </div>
                <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-inner">
                  <iframe
                    src={settings.mapEmbedUrl}
                    title="Vị trí cửa hàng EcoMart"
                    className="w-full h-[260px] border-0"
                    loading="lazy"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                Gửi Tin Nhắn Cho Chúng Tôi
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Điền thông tin vào form dưới đây, đội ngũ chăm sóc khách hàng EcoMart sẽ liên hệ lại bạn trong thời gian sớm nhất.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="contact-fullName"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
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
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400'
                      : 'border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
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
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
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
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400'
                        : 'border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-500 font-semibold mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
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
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
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
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400'
                      : 'border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
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
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
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
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400'
                      : 'border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                />
                {errors.content && (
                  <p className="text-xs text-rose-500 font-semibold mt-1">{errors.content}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  tabIndex={0}
                  aria-label="Gửi tin nhắn liên hệ"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md shadow-emerald-600/20 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang gửi tin nhắn...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Gửi Tin Nhắn</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
