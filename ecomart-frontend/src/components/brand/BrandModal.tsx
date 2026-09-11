import React, { useState, useEffect } from 'react';
import { X, Award, Edit3, RefreshCw, CheckCircle2 } from 'lucide-react';
import { brandApi } from '../../services/brandApi';
import { useToast } from '../../context/ToastContext';
import { Brand, BrandPayload, CustomAxiosError } from '../../types';

export interface BrandModalProps {
  isOpen: boolean;
  brandToEdit?: Brand | null;
  onClose: () => void;
  onSuccess: (savedBrand: Brand) => void;
}

interface FormErrors {
  name?: string;
  description?: string;
}

export const BrandModal: React.FC<BrandModalProps> = ({
  isOpen,
  brandToEdit,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<BrandPayload>({
    name: '',
    description: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (brandToEdit) {
      setFormData({
        name: brandToEdit.name,
        description: brandToEdit.description || '',
        isActive: brandToEdit.isActive,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        isActive: true,
      });
    }
    setErrors({});
  }, [isOpen, brandToEdit]);

  if (!isOpen) {
    return null;
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên thương hiệu không được để trống';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Tên thương hiệu không được vượt quá 100 ký tự';
    }

    if (formData.description && formData.description.length > 255) {
      newErrors.description = 'Mô tả không được vượt quá 255 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (brandToEdit) {
        const response = await brandApi.adminUpdateBrand(brandToEdit.id, formData);
        showToast('Cập nhật thương hiệu đối tác thành công!', 'success');
        onSuccess(response.data);
      } else {
        const response = await brandApi.adminCreateBrand(formData);
        showToast('Thêm mới thương hiệu đối tác thành công!', 'success');
        onSuccess(response.data);
      }
      onClose();
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      const message =
        customError.response?.data?.message ||
        'Không thể lưu thông tin thương hiệu. Vui lòng thử lại.';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="brand-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 relative border border-gray-100 animate-scale-up">
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all disabled:opacity-50"
          aria-label="Đóng cửa sổ"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modal */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            {brandToEdit ? <Edit3 className="w-5 h-5" /> : <Award className="w-5 h-5" />}
          </div>
          <div>
            <h2 id="brand-modal-title" className="text-xl font-bold text-slate-900">
              {brandToEdit ? 'Chỉnh Sửa Thương Hiệu' : 'Thêm Thương Hiệu Mới'}
            </h2>
            <p className="text-xs text-slate-500">
              Thương hiệu xanh đồng hành sản xuất bền vững cùng EcoMart
            </p>
          </div>
        </div>

        {/* Form nhập */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên thương hiệu */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Tên thương hiệu <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: EcoGreen Vietnam, Vinabamboo, BioBag..."
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }));
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            {errors.name && <p className="text-xs text-rose-500 font-medium pl-1">{errors.name}</p>}
          </div>

          {/* Mô tả thương hiệu */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Mô tả / Cam kết xanh</label>
            <textarea
              rows={3}
              placeholder="Mô tả tiêu chuẩn sinh thái, nguồn gốc nguyên liệu và cam kết của thương hiệu..."
              value={formData.description || ''}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, description: e.target.value }));
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: undefined }));
                }
              }}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
            />
            {errors.description && (
              <p className="text-xs text-rose-500 font-medium pl-1">{errors.description}</p>
            )}
          </div>

          {/* Trạng thái hoạt động */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="isActiveBrand"
              checked={formData.isActive ?? true}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              disabled={isSubmitting}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300 cursor-pointer"
            />
            <label
              htmlFor="isActiveBrand"
              className="text-xs font-semibold text-slate-700 cursor-pointer select-none"
            >
              Kích hoạt hiển thị sản phẩm của thương hiệu này
            </label>
          </div>

          {/* Nút hành động */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-xl transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{brandToEdit ? 'Cập Nhật' : 'Tạo Mới'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandModal;
