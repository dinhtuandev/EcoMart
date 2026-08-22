import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  MapPin,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Plus,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { useToast } from '../context/ToastContext';
import { userApi } from '../services/userApi';
import { addressApi } from '../services/addressApi';
import AddressCard from '../components/address/AddressCard';
import AddressModal from '../components/address/AddressModal';
import { Address, CustomAxiosError } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'info' | 'address' | 'password'>('info');

  // State Tab Thông Tin
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // State Tab Địa Chỉ
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState<boolean>(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);

  // State Tab Đổi Mật Khẩu
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);

  // Đồng bộ thông tin profile khi user thay đổi
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  // Load danh sách địa chỉ với AbortController chống Memory Leak
  useEffect(() => {
    if (activeTab !== 'address') {
      return;
    }

    const controller = new AbortController();
    setIsLoadingAddresses(true);

    addressApi
      .getAddresses(controller.signal)
      .then((response) => {
        setAddresses(response.data);
      })
      .catch((error: unknown) => {
        const customError = error as CustomAxiosError;
        if (customError.name === 'CanceledError') {
          return;
        }
        showToast('Không thể tải danh sách địa chỉ.', 'error');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingAddresses(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [activeTab, showToast]);

  // Xử lý lưu thông tin cá nhân
  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!profileForm.fullName.trim()) {
      showToast('Họ và tên không được để trống', 'warning');
      return;
    }

    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    if (profileForm.phoneNumber && !phoneRegex.test(profileForm.phoneNumber.trim())) {
      showToast('Số điện thoại không đúng định dạng', 'warning');
      return;
    }

    setIsSavingProfile(true);

    try {
      const response = await userApi.updateProfile({
        fullName: profileForm.fullName.trim(),
        phoneNumber: profileForm.phoneNumber.trim() || undefined,
      });

      // BẮT BUỘC: Cập nhật User vào Auth State để Header thay đổi tức thì
      updateUser(response.data);
      showToast('Cập nhật thông tin cá nhân thành công!', 'success');
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      showToast(
        customError.response?.data?.message || 'Cập nhật thông tin thất bại.',
        'error'
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Xử lý sau khi Thêm / Sửa địa chỉ (Optimistic Update cho isDefault)
  const handleAddressSaved = (savedAddress: Address): void => {
    setAddresses((prevAddresses) => {
      let updatedList = [...prevAddresses];
      const existsIndex = updatedList.findIndex((item) => item.id === savedAddress.id);

      if (existsIndex >= 0) {
        updatedList[existsIndex] = savedAddress;
      } else {
        updatedList.unshift(savedAddress);
      }

      // OPTIMISTIC UPDATE: Nếu địa chỉ vừa lưu là Mặc định -> Chuyển tất cả địa chỉ khác thành false
      if (savedAddress.isDefault) {
        updatedList = updatedList.map((item) => ({
          ...item,
          isDefault: item.id === savedAddress.id,
        }));
      }

      return updatedList;
    });
  };

  // Xử lý Xóa địa chỉ
  const handleDeleteAddress = async (addressId: number): Promise<void> => {
    try {
      await addressApi.deleteAddress(addressId);
      setAddresses((prev) => prev.filter((item) => item.id !== addressId));
      showToast('Đã xóa địa chỉ nhận hàng.', 'success');
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      showToast(customError.response?.data?.message || 'Xóa địa chỉ thất bại.', 'error');
    }
  };

  // Xử lý Đặt làm mặc định
  const handleSetDefaultAddress = async (address: Address): Promise<void> => {
    // Optimistic Update giao diện trước
    setAddresses((prev) =>
      prev.map((item) => ({
        ...item,
        isDefault: item.id === address.id,
      }))
    );

    try {
      await addressApi.updateAddress(address.id, {
        receiverName: address.receiverName,
        receiverPhone: address.receiverPhone,
        province: address.province,
        district: address.district,
        ward: address.ward,
        detailAddress: address.detailAddress,
        isDefault: true,
      });
      showToast(`Đã đặt địa chỉ "${address.receiverName}" làm mặc định.`, 'success');
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      showToast(customError.response?.data?.message || 'Không thể đặt mặc định.', 'error');
      // Rollback nếu lỗi bằng cách load lại danh sách
      addressApi.getAddresses().then((res) => setAddresses(res.data));
    }
  };

  // Xử lý Đổi Mật Khẩu
  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const errors: { currentPassword?: string; newPassword?: string; confirmPassword?: string } = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsChangingPassword(true);

    try {
      await userApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      showToast('Đổi mật khẩu thành công!', 'success');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      showToast(
        customError.response?.data?.message || 'Mật khẩu hiện tại không chính xác.',
        'error'
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Tiêu đề & Giới thiệu */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-2xl shadow-inner">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {user?.fullName || 'Tài Khoản Khách Hàng'}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
              <span>{user?.email}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3.5 h-3.5" />
                Đã xác thực
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3.5 py-2 rounded-xl border border-gray-100">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Tham gia EcoMart từ 2026</span>
        </div>
      </div>

      {/* Navigation Tabs (Màu chủ đạo Emerald) */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all duration-200 ${
            activeTab === 'info'
              ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-gray-300'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Thông Tin Cá Nhân</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('address')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all duration-200 ${
            activeTab === 'address'
              ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-gray-300'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Sổ Địa Chỉ</span>
          {addresses.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded-full">
              {addresses.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('password')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all duration-200 ${
            activeTab === 'password'
              ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-gray-300'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Đổi Mật Khẩu</span>
        </button>
      </div>

      {/* Nội dung Tab */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
        {/* TAB 1: THÔNG TIN CÁ NHÂN */}
        {activeTab === 'info' && (
          <form onSubmit={handleSaveProfile} className="max-w-xl space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email (Không thể thay đổi)</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-gray-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Họ và Tên</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Nhập họ và tên"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  disabled={isSavingProfile}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Số Điện Thoại</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  placeholder="0912345678"
                  value={profileForm.phoneNumber}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  disabled={isSavingProfile}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              {isSavingProfile ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu Thay Đổi</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: SỔ ĐỊA CHỈ NHẬN HÀNG */}
        {activeTab === 'address' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Danh Sách Địa Chỉ Nhận Hàng</h2>
                <p className="text-xs text-slate-500">Quản lý các địa chỉ giao hàng của bạn khi đặt mua tại EcoMart</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAddressToEdit(null);
                  setIsAddressModalOpen(true);
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Địa Chỉ Mới</span>
              </button>
            </div>

            {isLoadingAddresses ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Đang tải danh sách địa chỉ...</span>
              </div>
            ) : addresses.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 border border-dashed border-gray-200 rounded-2xl p-6 space-y-3">
                <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-600">Bạn chưa có địa chỉ nhận hàng nào</p>
                <button
                  type="button"
                  onClick={() => {
                    setAddressToEdit(null);
                    setIsAddressModalOpen(true);
                  }}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  + Thêm địa chỉ đầu tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    onEdit={(item) => {
                      setAddressToEdit(item);
                      setIsAddressModalOpen(true);
                    }}
                    onDelete={handleDeleteAddress}
                    onSetDefault={handleSetDefaultAddress}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ĐỔI MẬT KHẨU */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="max-w-xl space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Mật khẩu hiện tại</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => {
                    setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }));
                    if (passwordErrors.currentPassword) {
                      setPasswordErrors((prev) => ({ ...prev, currentPassword: undefined }));
                    }
                  }}
                  disabled={isChangingPassword}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-xs text-rose-500 font-medium pl-1">{passwordErrors.currentPassword}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Mật khẩu mới</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  value={passwordForm.newPassword}
                  onChange={(e) => {
                    setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }));
                    if (passwordErrors.newPassword) {
                      setPasswordErrors((prev) => ({ ...prev, newPassword: undefined }));
                    }
                  }}
                  disabled={isChangingPassword}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-xs text-rose-500 font-medium pl-1">{passwordErrors.newPassword}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập lại mật khẩu mới"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => {
                    setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }));
                    if (passwordErrors.confirmPassword) {
                      setPasswordErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }
                  }}
                  disabled={isChangingPassword}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-rose-500 font-medium pl-1">{passwordErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              {isChangingPassword ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cập Nhật Mật Khẩu</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Modal Thêm / Sửa địa chỉ */}
      <AddressModal
        isOpen={isAddressModalOpen}
        addressToEdit={addressToEdit}
        onClose={() => setIsAddressModalOpen(false)}
        onSuccess={handleAddressSaved}
      />
    </div>
  );
};

export default ProfilePage;
