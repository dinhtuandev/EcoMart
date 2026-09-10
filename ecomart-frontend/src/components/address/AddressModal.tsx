import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Phone, User as UserIcon, RefreshCw, CheckCircle2 } from 'lucide-react';
import { addressApi } from '../../services/addressApi';
import {
  locationApi,
  ProvinceItem,
  DistrictWithWards,
  WardItem,
} from '../../services/locationApi';
import { useToast } from '../../context/ToastContext';
import { Address, AddressPayload, CustomAxiosError } from '../../types';

export interface AddressModalProps {
  isOpen: boolean;
  addressToEdit?: Address | null;
  onClose: () => void;
  onSuccess: (savedAddress: Address) => void;
}

interface FormErrors {
  recipientName?: string;
  recipientPhone?: string;
  province?: string;
  district?: string;
  ward?: string;
  addressDetail?: string;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  addressToEdit,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<AddressPayload>({
    recipientName: '',
    recipientPhone: '',
    province: '',
    district: '',
    ward: '',
    addressDetail: '',
    isDefault: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // States lưu danh sách từ Vietnam Provinces Open API
  const [provinces, setProvinces] = useState<ProvinceItem[]>([]);
  const [districts, setDistricts] = useState<DistrictWithWards[]>([]);
  const [wards, setWards] = useState<WardItem[]>([]);

  // Loading states
  const [isLoadingProvinces, setIsLoadingProvinces] = useState<boolean>(false);
  const [isLoadingSubdivisions, setIsLoadingSubdivisions] = useState<boolean>(false);

  const { showToast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  // 1. Tải danh sách 63 Tỉnh/Thành phố khi mở Modal
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsLoadingProvinces(true);

    locationApi
      .getProvinces(controller.signal)
      .then((data) => {
        setProvinces(data);

        // Nếu đang chỉnh sửa địa chỉ cũ -> Khôi phục Tỉnh -> Quận -> Phường
        if (addressToEdit) {
          setFormData({
            recipientName: addressToEdit.recipientName,
            recipientPhone: addressToEdit.recipientPhone,
            province: addressToEdit.province,
            district: addressToEdit.district,
            ward: addressToEdit.ward,
            addressDetail: addressToEdit.addressDetail,
            isDefault: addressToEdit.isDefault,
          });

          const matchedProvince = data.find((p) => p.name === addressToEdit.province);
          if (matchedProvince) {
            setIsLoadingSubdivisions(true);
            locationApi
              .getProvinceWithSubdivisions(matchedProvince.code, controller.signal)
              .then((provinceDetail) => {
                const districtList = provinceDetail.districts || [];
                setDistricts(districtList);

                const matchedDistrict = districtList.find((d) => d.name === addressToEdit.district);
                if (matchedDistrict && matchedDistrict.wards) {
                  setWards(matchedDistrict.wards);
                }
              })
              .finally(() => setIsLoadingSubdivisions(false));
          }
        } else {
          setFormData({
            recipientName: '',
            recipientPhone: '',
            province: '',
            district: '',
            ward: '',
            addressDetail: '',
            isDefault: false,
          });
          setDistricts([]);
          setWards([]);
        }
      })
      .catch((err: unknown) => {
        if ((err as Error).name !== 'CanceledError') {
          showToast('Không thể tải danh sách Tỉnh / Thành phố.', 'error');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingProvinces(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [isOpen, addressToEdit, showToast]);

  if (!isOpen) {
    return null;
  }

  // 2. Xử lý khi chọn Tỉnh / Thành phố (Tải 1 lần depth=3 cho riêng tỉnh đó ~15KB)
  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>): Promise<void> => {
    const provinceName = e.target.value;
    const selectedProvince = provinces.find((p) => p.name === provinceName);

    setFormData((prev) => ({
      ...prev,
      province: provinceName,
      district: '',
      ward: '',
    }));
    setDistricts([]);
    setWards([]);

    if (errors.province) {
      setErrors((prev) => ({ ...prev, province: undefined }));
    }

    if (!selectedProvince) {
      return;
    }

    setIsLoadingSubdivisions(true);
    try {
      const provinceDetail = await locationApi.getProvinceWithSubdivisions(selectedProvince.code);
      setDistricts(provinceDetail.districts || []);
    } catch {
      showToast('Không thể tải danh sách Quận / Huyện.', 'error');
    } finally {
      setIsLoadingSubdivisions(false);
    }
  };

  // 3. Xử lý khi chọn Quận / Huyện (Lấy ngay mảng wards đã có sẵn, 0ms latency)
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const districtName = e.target.value;
    const selectedDistrict = districts.find((d) => d.name === districtName);

    setFormData((prev) => ({
      ...prev,
      district: districtName,
      ward: '',
    }));

    if (errors.district) {
      setErrors((prev) => ({ ...prev, district: undefined }));
    }

    if (selectedDistrict && selectedDistrict.wards) {
      setWards(selectedDistrict.wards);
    } else {
      setWards([]);
    }
  };

  // 4. Xử lý khi chọn Phường / Xã
  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const wardName = e.target.value;
    setFormData((prev) => ({ ...prev, ward: wardName }));
    if (errors.ward) {
      setErrors((prev) => ({ ...prev, ward: undefined }));
    }
  };

  // 5. Validation form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Vui lòng nhập tên người nhận';
    } else if (formData.recipientName.trim().length < 2) {
      newErrors.recipientName = 'Tên người nhận phải có ít nhất 2 ký tự';
    }

    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    if (!formData.recipientPhone.trim()) {
      newErrors.recipientPhone = 'Vui lòng nhập số điện thoại';
    } else if (!phoneRegex.test(formData.recipientPhone.trim())) {
      newErrors.recipientPhone = 'Số điện thoại không hợp lệ (VD: 0912345678)';
    }

    if (!formData.province) {
      newErrors.province = 'Vui lòng chọn Tỉnh / Thành phố';
    }

    if (!formData.district) {
      newErrors.district = 'Vui lòng chọn Quận / Huyện';
    }

    if (!formData.ward) {
      newErrors.ward = 'Vui lòng chọn Phường / Xã';
    }

    if (!formData.addressDetail.trim()) {
      newErrors.addressDetail = 'Vui lòng nhập địa chỉ chi tiết (Số nhà, tên đường)';
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
      if (addressToEdit) {
        const response = await addressApi.updateAddress(addressToEdit.id, formData);
        showToast('Cập nhật địa chỉ nhận hàng thành công!', 'success');
        onSuccess(response.data);
      } else {
        const response = await addressApi.createAddress(formData);
        showToast('Thêm địa chỉ nhận hàng mới thành công!', 'success');
        onSuccess(response.data);
      }
      onClose();
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      const message = customError.response?.data?.message || 'Không thể lưu địa chỉ. Vui lòng thử lại.';
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
      aria-labelledby="address-modal-title"
    >
      <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 relative border border-gray-100 max-h-[90vh] overflow-y-auto">
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

        {/* Tiêu đề Modal */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 id="address-modal-title" className="text-xl font-bold text-slate-900">
              {addressToEdit ? 'Chỉnh Sửa Địa Chỉ' : 'Thêm Địa Chỉ Nhận Hàng'}
            </h2>
            <p className="text-xs text-slate-500">
              Địa chỉ dùng để nhận các sản phẩm xanh từ EcoMart
            </p>
          </div>
        </div>

        {/* Form nhập */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên & SĐT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tên người nhận</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={formData.recipientName}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, recipientName: e.target.value }));
                    if (errors.recipientName) setErrors((prev) => ({ ...prev, recipientName: undefined }));
                  }}
                  disabled={isSubmitting}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
              {errors.recipientName && (
                <p className="text-xs text-rose-500 font-medium pl-1">{errors.recipientName}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Số điện thoại</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  placeholder="0912345678"
                  value={formData.recipientPhone}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, recipientPhone: e.target.value }));
                    if (errors.recipientPhone) setErrors((prev) => ({ ...prev, recipientPhone: undefined }));
                  }}
                  disabled={isSubmitting}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
              {errors.recipientPhone && (
                <p className="text-xs text-rose-500 font-medium pl-1">{errors.recipientPhone}</p>
              )}
            </div>
          </div>

          {/* Tỉnh / Thành phố */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Tỉnh / Thành phố</label>
              {isLoadingProvinces && (
                <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Đang tải 63 Tỉnh...
                </span>
              )}
            </div>
            <select
              value={formData.province}
              onChange={handleProvinceChange}
              disabled={isSubmitting || isLoadingProvinces}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
            >
              <option value="">-- Chọn Tỉnh / Thành phố --</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.province && (
              <p className="text-xs text-rose-500 font-medium pl-1">{errors.province}</p>
            )}
          </div>

          {/* Quận / Huyện & Phường / Xã */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Quận / Huyện</label>
                {isLoadingSubdivisions && (
                  <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  </span>
                )}
              </div>
              <select
                value={formData.district}
                onChange={handleDistrictChange}
                disabled={isSubmitting || isLoadingSubdivisions || !formData.province}
                className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50 disabled:bg-gray-100"
              >
                <option value="">-- Chọn Quận / Huyện --</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.district && (
                <p className="text-xs text-rose-500 font-medium pl-1">{errors.district}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Phường / Xã</label>
              <select
                value={formData.ward}
                onChange={handleWardChange}
                disabled={isSubmitting || !formData.district}
                className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50 disabled:bg-gray-100"
              >
                <option value="">-- Chọn Phường / Xã --</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </select>
              {errors.ward && (
                <p className="text-xs text-rose-500 font-medium pl-1">{errors.ward}</p>
              )}
            </div>
          </div>

          {/* Địa chỉ chi tiết */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Địa chỉ chi tiết</label>
            <input
              type="text"
              placeholder="Số nhà, tên ngõ/đường, tòa nhà..."
              value={formData.addressDetail}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, addressDetail: e.target.value }));
                if (errors.addressDetail) setErrors((prev) => ({ ...prev, addressDetail: undefined }));
              }}
              disabled={isSubmitting}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            {errors.addressDetail && (
              <p className="text-xs text-rose-500 font-medium pl-1">{errors.addressDetail}</p>
            )}
          </div>

          {/* Checkbox Đặt làm mặc định */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault || false}
              onChange={(e) => setFormData((prev) => ({ ...prev, isDefault: e.target.checked }))}
              disabled={isSubmitting}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300 cursor-pointer"
            />
            <label htmlFor="isDefault" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
              Đặt làm địa chỉ nhận hàng mặc định
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
                  <span>{addressToEdit ? 'Cập Nhật' : 'Thêm Địa Chỉ'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;
