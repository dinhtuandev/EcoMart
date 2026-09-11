import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings,
  Store,
  Phone,
  Mail,
  MapPin,
  Save,
  Compass,
  ExternalLink,
  Info,
  CheckCircle2,
  Eye,
  RefreshCw,
  Building2,
  Plus,
  Clock,
  Trash2,
  Edit2,
  X,
  Search,
  ChevronRight,
  Home,
} from 'lucide-react';
import { storeSettingApi } from '../../services/storeSettingApi';
import { useToast } from '../../context/ToastContext';
import { UpdateStoreSettingPayload } from '../../types';

export interface StoreBranch {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  openingHours: string;
  status: 'ACTIVE' | 'UPCOMING' | 'MAINTENANCE';
  isMain?: boolean;
}

const DEFAULT_BRANCHES: StoreBranch[] = [
  {
    id: 'branch-1',
    name: 'EcoMart Flagship - Trụ Sở Trung Tâm',
    city: 'TP. Hồ Chí Minh',
    address: '12 Đường A, Phường B, Quận C, TP. Hồ Chí Minh',
    phone: '0281234567',
    openingHours: '08:00 - 21:30 (Cả tuần)',
    status: 'ACTIVE',
    isMain: true,
  },
  {
    id: 'branch-2',
    name: 'EcoMart Ba Đình',
    city: 'Hà Nội',
    address: '45 Kim Mã, Phường Kim Mã, Quận Ba Đình, Hà Nội',
    phone: '024 3888 9999',
    openingHours: '08:00 - 21:30 (Cả tuần)',
    status: 'ACTIVE',
    isMain: false,
  },
  {
    id: 'branch-3',
    name: 'EcoMart Hải Châu',
    city: 'Đà Nẵng',
    address: '88 Nguyễn Văn Linh, Phường Nam Dương, Quận Hải Châu, Đà Nẵng',
    phone: '0236 3777 888',
    openingHours: '08:30 - 21:00 (Cả tuần)',
    status: 'ACTIVE',
    isMain: false,
  },
  {
    id: 'branch-4',
    name: 'EcoMart Ninh Kiều',
    city: 'Cần Thơ',
    address: '120 Đường 30 Tháng 4, Phường An Phú, Quận Ninh Kiều, Cần Thơ',
    phone: '0292 3666 777',
    openingHours: '08:00 - 21:00 (Cả tuần)',
    status: 'UPCOMING',
    isMain: false,
  },
];

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();

  // Tab State
  const [activeTab, setActiveTab] = useState<'main' | 'branches'>('main');

  // Backend Store Settings State
  const [settingsForm, setSettingsForm] = useState<UpdateStoreSettingPayload>({
    storePhone: '',
    storeEmail: '',
    storeAddress: '',
    mapEmbedUrl: '',
  });
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);

  // Branches State (Lưu trữ bền vững trên LocalStorage)
  const [branches, setBranches] = useState<StoreBranch[]>(() => {
    try {
      const saved = localStorage.getItem('ecomart_store_branches');
      return saved ? JSON.parse(saved) : DEFAULT_BRANCHES;
    } catch {
      return DEFAULT_BRANCHES;
    }
  });

  const [branchSearch, setBranchSearch] = useState<string>('');
  const [editingBranch, setEditingBranch] = useState<StoreBranch | null>(null);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState<boolean>(false);
  const [branchToDelete, setBranchToDelete] = useState<StoreBranch | null>(null);

  // Form Branch State
  const [branchForm, setBranchForm] = useState<{
    name: string;
    city: string;
    address: string;
    phone: string;
    openingHours: string;
    status: 'ACTIVE' | 'UPCOMING' | 'MAINTENANCE';
  }>({
    name: '',
    city: 'TP. Hồ Chí Minh',
    address: '',
    phone: '',
    openingHours: '08:00 - 21:30 (Cả tuần)',
    status: 'ACTIVE',
  });

  // Đồng bộ branches vào LocalStorage khi thay đổi
  useEffect(() => {
    try {
      localStorage.setItem('ecomart_store_branches', JSON.stringify(branches));
    } catch {
      // ignore
    }
  }, [branches]);

  // Load backend settings
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchStoreSettings = async (): Promise<void> => {
      setLoadingSettings(true);
      try {
        const response = await storeSettingApi.getSettings(controller.signal);
        if (isMounted && response.data) {
          const loadedData = {
            storePhone: response.data.storePhone || '',
            storeEmail: response.data.storeEmail || '',
            storeAddress: response.data.storeAddress || '',
            mapEmbedUrl: response.data.mapEmbedUrl || '',
          };
          setSettingsForm(loadedData);

          // Tự động cập nhật địa chỉ và hotline cho chi nhánh chính nếu có
          setBranches((prev) =>
            prev.map((b) =>
              b.isMain
                ? {
                    ...b,
                    address: loadedData.storeAddress || b.address,
                    phone: loadedData.storePhone || b.phone,
                  }
                : b
            )
          );
        }
      } catch (err: unknown) {
        if ((err as Error).name !== 'CanceledError') {
          showToast('Không thể tải cấu hình cửa hàng.', 'error');
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
  }, [showToast]);

  // Lưu cấu hình vào Backend
  const handleSaveSettings = async (e?: React.FormEvent<HTMLFormElement>): Promise<void> => {
    if (e) e.preventDefault();
    setSavingSettings(true);

    try {
      const response = await storeSettingApi.updateSettings({
        storePhone: settingsForm.storePhone?.trim(),
        storeEmail: settingsForm.storeEmail?.trim(),
        storeAddress: settingsForm.storeAddress?.trim(),
        mapEmbedUrl: settingsForm.mapEmbedUrl?.trim(),
      });

      if (response.success) {
        showToast(response.message || 'Cập nhật cấu hình cửa hàng thành công!', 'success');

        // Cập nhật thông tin chi nhánh chính
        setBranches((prev) =>
          prev.map((b) =>
            b.isMain
              ? {
                  ...b,
                  address: settingsForm.storeAddress || b.address,
                  phone: settingsForm.storePhone || b.phone,
                }
              : b
          )
        );
      } else {
        showToast(response.message || 'Không thể cập nhật cấu hình.', 'error');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast(msg || 'Có lỗi xảy ra khi lưu cấu hình.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Mở modal thêm chi nhánh mới
  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({
      name: '',
      city: 'TP. Hồ Chí Minh',
      address: '',
      phone: '',
      openingHours: '08:00 - 21:30 (Cả tuần)',
      status: 'ACTIVE',
    });
    setIsBranchModalOpen(true);
  };

  // Mở modal sửa chi nhánh
  const handleOpenEditBranch = (branch: StoreBranch) => {
    setEditingBranch(branch);
    setBranchForm({
      name: branch.name,
      city: branch.city,
      address: branch.address,
      phone: branch.phone,
      openingHours: branch.openingHours,
      status: branch.status,
    });
    setIsBranchModalOpen(true);
  };

  // Lưu chi nhánh (Thêm hoặc Sửa)
  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name.trim() || !branchForm.address.trim()) {
      showToast('Vui lòng nhập tên và địa chỉ chi nhánh.', 'warning');
      return;
    }

    if (editingBranch) {
      setBranches((prev) =>
        prev.map((b) =>
          b.id === editingBranch.id
            ? {
                ...b,
                ...branchForm,
                name: branchForm.name.trim(),
                address: branchForm.address.trim(),
                phone: branchForm.phone.trim(),
              }
            : b
        )
      );
      showToast(`Đã cập nhật chi nhánh "${branchForm.name}"!`, 'success');
    } else {
      const newBranch: StoreBranch = {
        id: `branch-${Date.now()}`,
        ...branchForm,
        name: branchForm.name.trim(),
        address: branchForm.address.trim(),
        phone: branchForm.phone.trim(),
        isMain: false,
      };
      setBranches((prev) => [...prev, newBranch]);
      showToast(`Đã thêm chi nhánh mới "${branchForm.name}" thành công!`, 'success');
    }

    setIsBranchModalOpen(false);
  };

  // Xóa chi nhánh
  const handleConfirmDeleteBranch = () => {
    if (!branchToDelete) return;
    if (branchToDelete.isMain) {
      showToast('Không thể xóa Trụ sở chính của hệ thống.', 'error');
      setBranchToDelete(null);
      return;
    }
    setBranches((prev) => prev.filter((b) => b.id !== branchToDelete.id));
    showToast(`Đã xóa chi nhánh "${branchToDelete.name}".`, 'success');
    setBranchToDelete(null);
  };

  // Lọc chi nhánh theo tìm kiếm
  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(branchSearch.toLowerCase()) ||
      b.city.toLowerCase().includes(branchSearch.toLowerCase()) ||
      b.address.toLowerCase().includes(branchSearch.toLowerCase())
  );

  return (
    <div className="w-full space-y-5 pb-12">
      {/* Header Banner - Full Width */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-inner">
            <Settings className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Cấu Hình Cửa Hàng & Hệ Thống Chi Nhánh
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Admin Scope
            </span>
          </div>
        </div>

        {/* Nút hành động theo Tab */}
        <div className="flex items-center gap-3">
          {activeTab === 'main' ? (
            <button
              type="button"
              onClick={() => handleSaveSettings()}
              disabled={savingSettings || loadingSettings}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {savingSettings ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu Trụ Sở Chính</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenAddBranch}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Chi Nhánh Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-gray-200/80 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('main')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'main'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-gray-100'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Trụ Sở & Cửa Hàng Chính</span>
          <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-800/30 text-emerald-100 font-black">
            Đồng bộ BE
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('branches')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'branches'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-gray-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Mạng Lưới Chi Nhánh</span>
          <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-black">
            {branches.length} điểm
          </span>
        </button>
      </div>

      {/* TAB 1: TRỤ SỞ CHÍNH (KẾT NỐI TRỰC TIẾP BACKEND) */}
      {activeTab === 'main' && (
        <>
          {loadingSettings ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
              <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-gray-100 h-96" />
              <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-gray-100 h-96" />
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* CỘT TRÁI (7/12): Form thông tin cơ sở chính */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-6">
                  <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                        <Store className="w-5 h-5" />
                      </div>
                      <h2 className="text-base font-bold text-slate-900">Thông Tin Trụ Sở Chính</h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Số điện thoại */}
                    <div>
                      <label htmlFor="setting-phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Số điện thoại hotline <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          id="setting-phone"
                          type="text"
                          value={settingsForm.storePhone || ''}
                          onChange={(e) =>
                            setSettingsForm((prev) => ({ ...prev, storePhone: e.target.value }))
                          }
                          placeholder="VD: 0281234567"
                          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-slate-800 bg-slate-50/50 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Email hỗ trợ */}
                    <div>
                      <label htmlFor="setting-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Email hỗ trợ khách hàng <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          id="setting-email"
                          type="email"
                          value={settingsForm.storeEmail || ''}
                          onChange={(e) =>
                            setSettingsForm((prev) => ({ ...prev, storeEmail: e.target.value }))
                          }
                          placeholder="VD: contact@ecomart.vn"
                          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-slate-800 bg-slate-50/50 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Địa chỉ văn phòng / Cửa hàng */}
                    <div className="sm:col-span-2">
                      <label htmlFor="setting-address" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Địa chỉ trụ sở / Cửa hàng chính <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          id="setting-address"
                          type="text"
                          value={settingsForm.storeAddress || ''}
                          onChange={(e) =>
                            setSettingsForm((prev) => ({ ...prev, storeAddress: e.target.value }))
                          }
                          placeholder="VD: 12 Đường A, Phường B, Quận C, TP. Hồ Chí Minh"
                          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-slate-800 bg-slate-50/50 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Cấu hình Bản đồ Google Maps */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-5">
                  <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                        <Compass className="w-5 h-5" />
                      </div>
                      <h2 className="text-base font-bold text-slate-900">Tích Hợp Google Maps Trụ Sở</h2>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="setting-map" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Đường dẫn nhúng iframe (src URL)
                    </label>
                    <div className="relative">
                      <textarea
                        id="setting-map"
                        rows={3}
                        value={settingsForm.mapEmbedUrl || ''}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({ ...prev, mapEmbedUrl: e.target.value }))
                        }
                        placeholder="https://www.google.com/maps/embed?pb=..."
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 font-mono text-xs text-slate-700 bg-slate-50/50 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Hướng dẫn nhanh */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-600 space-y-1">
                      <span className="font-bold text-slate-800">Cách lấy liên kết nhúng từ Google Maps:</span>
                      <ol className="list-decimal list-inside space-y-0.5 text-slate-500">
                        <li>Tìm địa chỉ cửa hàng trên <strong>Google Maps</strong>.</li>
                        <li>Bấm nút <strong>Chia sẻ (Share)</strong> → Chọn tab <strong>Nhúng bản đồ (Embed a map)</strong>.</li>
                        <li>Sao chép đường dẫn trong thuộc tính <code>src="..."</code> và dán vào ô bên trên.</li>
                      </ol>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {savingSettings ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Đang lưu cài đặt...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Lưu Cài Đặt Trụ Sở</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI (5/12): Xem trước trực quan (Live Preview) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Xem trước bản đồ */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-emerald-600" />
                      <h3 className="font-bold text-slate-900 text-sm">Xem Trước Bản Đồ Nhúng</h3>
                    </div>
                    {settingsForm.mapEmbedUrl && (
                      <a
                        href={settingsForm.mapEmbedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                      >
                        Mở tab mới <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {settingsForm.mapEmbedUrl ? (
                    <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-inner bg-slate-100">
                      <iframe
                        src={settingsForm.mapEmbedUrl}
                        title="Xem trước bản đồ EcoMart"
                        className="w-full h-[320px] border-0"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="h-[260px] rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-50/50">
                      <Compass className="w-10 h-10 text-slate-300 mb-2 stroke-1" />
                      <span className="text-xs font-bold text-slate-600">Chưa có liên kết bản đồ</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        Hãy nhập đường dẫn Google Maps iframe ở cột bên trái để hiển thị bản đồ trực quan
                      </span>
                    </div>
                  )}
                </div>

                {/* Mô phỏng hiển thị Khách hàng */}
                <div className="bg-gradient-to-br from-emerald-950 to-slate-900 text-emerald-50 rounded-3xl p-6 sm:p-7 shadow-lg space-y-4 border border-emerald-900/60">
                  <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                      Mô phỏng hiển thị chân trang
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-800/60 text-emerald-200 border border-emerald-700/50">
                      Khách hàng thấy
                    </span>
                  </div>

                  <div className="space-y-3 pt-1 text-sm">
                    <div>
                      <span className="text-xs text-emerald-300/70 font-semibold block">Tên hệ thống:</span>
                      <span className="text-lg font-black text-white tracking-tight block">EcoMart Vietnam</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-emerald-300/70 block">Hotline:</span>
                        <span className="font-bold text-white block">
                          {settingsForm.storePhone || <span className="italic text-emerald-400/50">Chưa cấu hình</span>}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-emerald-300/70 block">Email hỗ trợ:</span>
                        <span className="font-bold text-white break-all block">
                          {settingsForm.storeEmail || <span className="italic text-emerald-400/50">Chưa cấu hình</span>}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-emerald-300/70 block">Địa chỉ văn phòng:</span>
                        <span className="text-xs leading-relaxed text-emerald-100 font-medium block">
                          {settingsForm.storeAddress || <span className="italic text-emerald-400/50">Chưa cấu hình</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </>
      )}

      {/* TAB 2: MẠNG LƯỚI CHI NHÁNH */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
          {/* Thanh tìm kiếm và bộ lọc chi nhánh */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={branchSearch}
                onChange={(e) => setBranchSearch(e.target.value)}
                placeholder="Tìm chi nhánh theo tên, tỉnh thành hoặc địa chỉ..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
              <span>Tổng số điểm bán:</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-black">
                {filteredBranches.length} chi nhánh
              </span>
            </div>
          </div>

          {/* Grid danh sách chi nhánh */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBranches.map((branch) => (
              <div
                key={branch.id}
                className={`bg-white rounded-3xl p-6 border shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
                  branch.isMain
                    ? 'border-emerald-200 bg-gradient-to-b from-white to-emerald-50/20'
                    : 'border-gray-100'
                }`}
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {branch.city}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {branch.isMain && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                          Trụ sở chính
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          branch.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : branch.status === 'UPCOMING'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {branch.status === 'ACTIVE'
                          ? 'Đang hoạt động'
                          : branch.status === 'UPCOMING'
                          ? 'Sắp khai trương'
                          : 'Bảo trì'}
                      </span>
                    </div>
                  </div>

                  {/* Branch Name */}
                  <h3 className="font-bold text-slate-900 text-base mb-3 leading-snug">
                    {branch.name}
                  </h3>

                  {/* Branch Details */}
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed">{branch.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="font-bold font-mono">{branch.phone || 'Chưa có SĐT'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>{branch.openingHours}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="border-t border-gray-100 pt-4 mt-5 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditBranch(branch)}
                    className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                    title="Chỉnh sửa chi nhánh"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {!branch.isMain && (
                    <button
                      type="button"
                      onClick={() => setBranchToDelete(branch)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Xóa chi nhánh"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredBranches.length === 0 && (
            <div className="py-20 text-center bg-white rounded-3xl border border-gray-100">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">Không tìm thấy chi nhánh phù hợp</p>
              <p className="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa tìm kiếm</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL THÊM / SỬA CHI NHÁNH */}
      {isBranchModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-900 text-lg">
                  {editingBranch ? 'Chỉnh Sửa Chi Nhánh' : 'Thêm Chi Nhánh Mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBranchModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tên chi nhánh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={branchForm.name}
                  onChange={(e) => setBranchForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="VD: EcoMart Hoàn Kiếm"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tỉnh / Thành phố <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={branchForm.city}
                    onChange={(e) => setBranchForm((p) => ({ ...p, city: e.target.value }))}
                    placeholder="VD: Hà Nội"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="VD: 024 3888 9999"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Địa chỉ chi tiết <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={branchForm.address}
                  onChange={(e) => setBranchForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Giờ hoạt động
                  </label>
                  <input
                    type="text"
                    value={branchForm.openingHours}
                    onChange={(e) => setBranchForm((p) => ({ ...p, openingHours: e.target.value }))}
                    placeholder="08:00 - 21:30"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Trạng thái
                  </label>
                  <select
                    value={branchForm.status}
                    onChange={(e) =>
                      setBranchForm((p) => ({
                        ...p,
                        status: e.target.value as 'ACTIVE' | 'UPCOMING' | 'MAINTENANCE',
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold bg-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="UPCOMING">Sắp khai trương</option>
                    <option value="MAINTENANCE">Đang bảo trì</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingBranch ? 'Cập Nhật Chi Nhánh' : 'Lưu Chi Nhánh Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA CHI NHÁNH */}
      {branchToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Xóa Chi Nhánh?</h3>
                <span className="text-xs text-slate-500 truncate max-w-[200px] block">
                  {branchToDelete.name}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa chi nhánh <strong>"{branchToDelete.name}"</strong> khỏi danh sách mạng lưới điểm bán không?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBranchToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBranch}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;
