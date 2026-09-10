import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  Edit3,
  RefreshCw,
  CheckCircle2,
  Plus,
  Trash2,
  Image as ImageIcon,
  Leaf,
  Award,
} from 'lucide-react';
import { productApi } from '../../services/productApi';
import { useToast } from '../../context/ToastContext';
import {
  Product,
  ProductPayload,
  Category,
  Brand,
  Certification,
  CustomAxiosError,
} from '../../types';

export interface AdminProductModalProps {
  isOpen: boolean;
  productToEdit?: Product | null;
  categories: Category[];
  brands: Brand[];
  certifications: Certification[];
  onClose: () => void;
  onSuccess: (savedProduct: Product) => void;
}

interface FormErrors {
  name?: string;
  categoryId?: string;
  brandId?: string;
  sellingPrice?: string;
  originalPrice?: string;
  quantityInStock?: string;
  ecoScore?: string;
  materialInfo?: string;
  description?: string;
}

interface ImageInputItem {
  url: string;
  isPrimary: boolean;
  displayOrder: number;
}

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  isOpen,
  productToEdit,
  categories,
  brands,
  certifications,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<ProductPayload>({
    name: '',
    categoryId: 0,
    brandId: 0,
    sellingPrice: 0,
    originalPrice: 0,
    ecoScore: 5,
    materialInfo: '',
    certificationIds: [],
    description: '',
    isVisible: true,
    quantityInStock: 0,
    images: [],
  });

  const [imageInputs, setImageInputs] = useState<ImageInputItem[]>([
    { url: '', isPrimary: true, displayOrder: 0 },
  ]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        categoryId: productToEdit.category?.id || 0,
        brandId: productToEdit.brand?.id || 0,
        sellingPrice: productToEdit.sellingPrice,
        originalPrice: productToEdit.originalPrice || 0,
        ecoScore: productToEdit.ecoScore || 5,
        materialInfo: productToEdit.materialInfo || '',
        certificationIds: productToEdit.certifications?.map((c) => c.id) || [],
        description: productToEdit.description || '',
        isVisible: productToEdit.isVisible,
        quantityInStock: productToEdit.quantityInStock || 0,
      });

      if (productToEdit.images && productToEdit.images.length > 0) {
        setImageInputs(
          productToEdit.images.map((img) => ({
            url: img.imageUrl,
            isPrimary: img.isPrimary,
            displayOrder: img.displayOrder,
          }))
        );
      } else {
        setImageInputs([{ url: '', isPrimary: true, displayOrder: 0 }]);
      }
    } else {
      setFormData({
        name: '',
        categoryId: categories[0]?.id || 0,
        brandId: brands[0]?.id || 0,
        sellingPrice: 0,
        originalPrice: 0,
        ecoScore: 5,
        materialInfo: '',
        certificationIds: [],
        description: '',
        isVisible: true,
        quantityInStock: 10,
        images: [],
      });
      setImageInputs([{ url: '', isPrimary: true, displayOrder: 0 }]);
    }
    setErrors({});
  }, [isOpen, productToEdit, categories, brands]);

  if (!isOpen) {
    return null;
  }

  const handleAddImageRow = (): void => {
    setImageInputs((prev) => [
      ...prev,
      { url: '', isPrimary: prev.length === 0, displayOrder: prev.length },
    ]);
  };

  const handleRemoveImageRow = (index: number): void => {
    setImageInputs((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const handleImageChange = (index: number, url: string): void => {
    setImageInputs((prev) => {
      const updated = [...prev];
      updated[index].url = url;
      return updated;
    });
  };

  const handleSetPrimaryImage = (index: number): void => {
    setImageInputs((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  const handleToggleCertification = (certId: number): void => {
    setFormData((prev) => {
      const current = prev.certificationIds || [];
      if (current.includes(certId)) {
        return { ...prev, certificationIds: current.filter((id) => id !== certId) };
      }
      return { ...prev, certificationIds: [...current, certId] };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên sản phẩm không được để trống';
    } else if (formData.name.trim().length > 255) {
      newErrors.name = 'Tên sản phẩm không được vượt quá 255 ký tự';
    }

    if (!formData.categoryId || formData.categoryId <= 0) {
      newErrors.categoryId = 'Vui lòng chọn danh mục sản phẩm';
    }

    if (!formData.brandId || formData.brandId <= 0) {
      newErrors.brandId = 'Vui lòng chọn thương hiệu';
    }

    if (formData.sellingPrice === undefined || formData.sellingPrice < 0) {
      newErrors.sellingPrice = 'Giá bán phải lớn hơn hoặc bằng 0';
    }

    if (formData.originalPrice && formData.originalPrice < 0) {
      newErrors.originalPrice = 'Giá gốc phải lớn hơn hoặc bằng 0';
    }

    if (formData.quantityInStock === undefined || formData.quantityInStock < 0) {
      newErrors.quantityInStock = 'Số lượng tồn kho không được âm';
    }

    if (!formData.ecoScore || formData.ecoScore < 1 || formData.ecoScore > 5) {
      newErrors.ecoScore = 'Điểm Eco-Score phải từ 1 đến 5 lá';
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

    const validImages = imageInputs
      .filter((img) => img.url.trim().length > 0)
      .map((img, index) => ({
        url: img.url.trim(),
        isPrimary: img.isPrimary,
        displayOrder: index,
      }));

    const payload: ProductPayload = {
      ...formData,
      images: validImages,
    };

    try {
      if (productToEdit) {
        const response = await productApi.adminUpdateProduct(productToEdit.id, payload);
        if (validImages.length > 0) {
          await productApi.adminUpdateProductImages(productToEdit.id, validImages);
        }
        showToast('Cập nhật thông tin sản phẩm thành công!', 'success');
        onSuccess(response.data);
      } else {
        const response = await productApi.adminCreateProduct(payload);
        showToast('Tạo mới sản phẩm sinh thái thành công!', 'success');
        onSuccess(response.data);
      }
      onClose();
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      const message =
        customError.response?.data?.message ||
        'Không thể lưu thông tin sản phẩm. Vui lòng thử lại.';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl p-6 md:p-8 max-w-3xl w-full shadow-2xl space-y-6 relative border border-gray-100 animate-scale-up my-8 max-h-[90vh] overflow-y-auto">
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
        <div className="flex items-center gap-3 border-b pb-4 border-gray-100">
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            {productToEdit ? <Edit3 className="w-6 h-6" /> : <Package className="w-6 h-6" />}
          </div>
          <div>
            <h2 id="product-modal-title" className="text-xl font-bold text-slate-900">
              {productToEdit ? 'Chỉnh Sửa Sản Phẩm Sinh Thái' : 'Thêm Sản Phẩm Mới'}
            </h2>
            <p className="text-xs text-slate-500">
              Điền đầy đủ thông tin sản phẩm, chứng nhận sinh thái và kho hàng
            </p>
          </div>
        </div>

        {/* Form nhập */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tên sản phẩm */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Tên sản phẩm sinh thái <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Bình Giữ Nhiệt Tre Tự Nhiên EcoBottle 500ml..."
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }));
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
            />
            {errors.name && <p className="text-xs text-rose-500 font-medium pl-1">{errors.name}</p>}
          </div>

          {/* Danh mục & Thương hiệu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Danh mục <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    categoryId: parseInt(e.target.value, 10),
                  }))
                }
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
              >
                <option value={0}>-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-rose-500 font-medium pl-1">{errors.categoryId}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Thương hiệu đối tác <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.brandId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    brandId: parseInt(e.target.value, 10),
                  }))
                }
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
              >
                <option value={0}>-- Chọn thương hiệu --</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              {errors.brandId && (
                <p className="text-xs text-rose-500 font-medium pl-1">{errors.brandId}</p>
              )}
            </div>
          </div>

          {/* Giá bán, Giá gốc, Số lượng tồn kho */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Giá bán (₫) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                placeholder="250000"
                value={formData.sellingPrice || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sellingPrice: parseFloat(e.target.value) || 0,
                  }))
                }
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-mono font-bold text-emerald-600 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              {errors.sellingPrice && (
                <p className="text-xs text-rose-500 font-medium pl-1">{errors.sellingPrice}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Giá gốc niêm yết (₫)</label>
              <input
                type="number"
                min={0}
                step={1000}
                placeholder="300000"
                value={formData.originalPrice || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    originalPrice: parseFloat(e.target.value) || 0,
                  }))
                }
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-mono text-slate-500 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Tồn kho <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                placeholder="50"
                value={formData.quantityInStock ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    quantityInStock: parseInt(e.target.value, 10) || 0,
                  }))
                }
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              {errors.quantityInStock && (
                <p className="text-xs text-rose-500 font-medium pl-1">
                  {errors.quantityInStock}
                </p>
              )}
            </div>
          </div>

          {/* Eco-Score (1-5) & Vật liệu xanh */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                Điểm Eco-Score (1 - 5) <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.ecoScore || 5}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ecoScore: parseInt(e.target.value, 10),
                  }))
                }
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-800 focus:outline-none focus:border-emerald-500"
              >
                <option value={5}>🌿🌿🌿🌿🌿 5 Lá (Xuất sắc - Zero Waste)</option>
                <option value={4}>🌿🌿🌿🌿 4 Lá (Rất tốt - Tự phân hủy)</option>
                <option value={3}>🌿🌿🌿 3 Lá (Tốt - Tái chế / Organic)</option>
                <option value={2}>🌿🌿 2 Lá (Khá - Thân thiện)</option>
                <option value={1}>🌿 1 Lá (Tiêu chuẩn xanh cơ bản)</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700">Thông tin vật liệu xanh</label>
              <input
                type="text"
                placeholder="VD: 100% Tre tự nhiên, Inox 304 không gỉ, Sơn hữu cơ..."
                value={formData.materialInfo || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, materialInfo: e.target.value }))
                }
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          {/* Multi-select Chứng nhận sinh thái (Certifications) */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-gray-200">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              Chứng nhận sinh thái áp dụng cho sản phẩm này:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {certifications.map((cert) => {
                const isSelected = formData.certificationIds?.includes(cert.id);
                return (
                  <button
                    key={cert.id}
                    type="button"
                    onClick={() => handleToggleCertification(cert.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-sm'
                        : 'bg-white border-gray-200 text-slate-600 hover:border-emerald-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="w-3.5 h-3.5 text-emerald-600 rounded"
                    />
                    <span className="truncate">{cert.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Danh sách Hình ảnh URL */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                Danh sách URL Hình ảnh sản phẩm
              </label>
              <button
                type="button"
                onClick={handleAddImageRow}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm ảnh
              </button>
            </div>

            <div className="space-y-2">
              {imageInputs.map((img, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={img.url}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSetPrimaryImage(index)}
                    className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                      img.isPrimary
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {img.isPrimary ? '★ Ảnh chính' : 'Đặt làm ảnh chính'}
                  </button>
                  {imageInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImageRow(index)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mô tả chi tiết */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Mô tả chi tiết sản phẩm</label>
            <textarea
              rows={3}
              placeholder="Mô tả công dụng, cách sử dụng, vòng đời phân hủy sinh học..."
              value={formData.description || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
            />
          </div>

          {/* Trạng thái hiển thị */}
          <div className="pt-1 flex items-center gap-2">
            <input
              type="checkbox"
              id="isVisibleProduct"
              checked={formData.isVisible ?? true}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isVisible: e.target.checked }))
              }
              disabled={isSubmitting}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300 cursor-pointer"
            />
            <label
              htmlFor="isVisibleProduct"
              className="text-xs font-semibold text-slate-700 cursor-pointer select-none"
            >
              Hiển thị sản phẩm này trên gian hàng khách hàng (Public Catalog)
            </label>
          </div>

          {/* Nút hành động */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
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
                  <span>{productToEdit ? 'Cập Nhật Sản Phẩm' : 'Tạo Mới Sản Phẩm'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductModal;
