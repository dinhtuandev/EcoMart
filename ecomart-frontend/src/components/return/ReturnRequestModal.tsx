import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  RotateCcw,
  ShieldCheck,
  Package,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  UploadCloud,
  Camera,
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  Play,
  RefreshCw,
} from 'lucide-react';
import { returnApi } from '../../services/returnApi';
import { useToast } from '../../context/ToastContext';
import {
  ReturnEligibilityResponse,
  ReturnItemEligibility,
  ReturnRequestType,
  CreateReturnPayload,
} from '../../types';

export const DEFAULT_STANDARD_REASONS = [
  'Sản phẩm bị lỗi kỹ thuật, không hoạt động',
  'Sản phẩm bị hư hỏng, bể vỡ trong quá trình vận chuyển',
  'Giao sai sản phẩm (sai màu sắc, kích cỡ, chủng loại)',
  'Sản phẩm không đúng với mô tả trên website',
  'Sản phẩm hết hạn sử dụng hoặc bao bì không còn nguyên vẹn',
  'Khác (vui lòng ghi chú chi tiết)',
];

interface UploadedMedia {
  id: string;
  url: string;
  name: string;
  size?: number;
  isVideo: boolean;
  previewUrl?: string;
  isUploading?: boolean;
}

interface ReturnRequestModalProps {
  orderId: number;
  orderCode: string;
  defaultAddress: string;
  defaultName: string;
  defaultPhone: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({
  orderId,
  orderCode,
  defaultAddress,
  defaultName,
  defaultPhone,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();

  const [eligibility, setEligibility] = useState<ReturnEligibilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [requestType, setRequestType] = useState<ReturnRequestType>('RETURN_REFUND');
  const [selectedItems, setSelectedItems] = useState<Map<number, number>>(new Map()); // orderItemId -> quantity
  const [reason, setReason] = useState<string>(DEFAULT_STANDARD_REASONS[0]);
  const [customerNote, setCustomerNote] = useState<string>('');

  // Media Upload State
  const [mediaList, setMediaList] = useState<UploadedMedia[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [manualUrlInput, setManualUrlInput] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Pickup Info State
  const [pickupName, setPickupName] = useState<string>(defaultName);
  const [pickupPhone, setPickupPhone] = useState<string>(defaultPhone);
  const [pickupAddress, setPickupAddress] = useState<string>(defaultAddress);

  // Helper check eligibility safely
  const isItemEligible = (item: ReturnItemEligibility, type: ReturnRequestType): boolean => {
    if (type === 'WARRANTY') {
      return Boolean(item.isWarrantyEligible ?? item.warrantyEligible ?? false);
    }
    return Boolean(item.isReturnEligible ?? item.returnEligible ?? false);
  };

  const checkHasAnyEligible = (elig: ReturnEligibilityResponse | null): boolean => {
    if (!elig) return false;
    if (elig.isEligibleForAny !== undefined) return elig.isEligibleForAny;
    if (elig.eligibleForAny !== undefined) return elig.eligibleForAny;
    return (elig.items || []).some(
      (i) => (i.isReturnEligible ?? i.returnEligible) || (i.isWarrantyEligible ?? i.warrantyEligible)
    );
  };

  const fetchEligibility = () => {
    setIsLoading(true);
    setFetchError(null);
    returnApi
      .checkEligibility(orderId)
      .then((res) => {
        if (res.data) {
          setEligibility(res.data);
          if (res.data.standardReasons && res.data.standardReasons.length > 0) {
            setReason(res.data.standardReasons[0]);
          }
          // Pre-select first eligible item
          const firstEligible = res.data.items?.find((i) => isItemEligible(i, requestType));
          if (firstEligible) {
            setSelectedItems(new Map([[firstEligible.orderItemId, 1]]));
          }
        }
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Không thể kiểm tra điều kiện đổi trả';
        setFetchError(msg);
        showToast(msg, 'error');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchEligibility();
  }, [orderId]);

  const handleTypeChange = (type: ReturnRequestType) => {
    setRequestType(type);
    if (eligibility?.items) {
      const newSelected = new Map<number, number>();
      selectedItems.forEach((qty, orderItemId) => {
        const item = eligibility.items.find((i) => i.orderItemId === orderItemId);
        if (item && isItemEligible(item, type)) {
          newSelected.set(orderItemId, qty);
        }
      });
      if (newSelected.size === 0) {
        const firstEligible = eligibility.items.find((i) => isItemEligible(i, type));
        if (firstEligible) {
          newSelected.set(firstEligible.orderItemId, 1);
        }
      }
      setSelectedItems(newSelected);
    }
  };

  const toggleItem = (item: ReturnItemEligibility) => {
    const isCurrentlyEligible = isItemEligible(item, requestType);
    if (!isCurrentlyEligible) return;

    setSelectedItems((prev) => {
      const next = new Map(prev);
      if (next.has(item.orderItemId)) {
        next.delete(item.orderItemId);
      } else {
        next.set(item.orderItemId, 1);
      }
      return next;
    });
  };

  const updateQuantity = (orderItemId: number, maxQty: number, qty: number) => {
    const safeQty = Math.max(1, Math.min(maxQty, qty));
    setSelectedItems((prev) => {
      const next = new Map(prev);
      next.set(orderItemId, safeQty);
      return next;
    });
  };

  // ==========================================
  // Media Upload Handlers (Mobile & PC)
  // ==========================================
  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    const validFiles: File[] = [];
    for (const file of files) {
      const isVideo =
        file.type.startsWith('video/') || /\.(mp4|mov|webm|mkv)$/i.test(file.name);
      const maxSize = isVideo ? 50 * 1024 * 1024 : 15 * 1024 * 1024;
      if (file.size > maxSize) {
        showToast(
          `Tệp "${file.name}" vượt quá dung lượng (${isVideo ? '50MB cho video' : '15MB cho ảnh'})`,
          'error'
        );
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Generate local previews
    const newItems: UploadedMedia[] = validFiles.map((file) => {
      const isVideo =
        file.type.startsWith('video/') || /\.(mp4|mov|webm|mkv)$/i.test(file.name);
      return {
        id: Math.random().toString(36).substring(2, 9),
        url: '',
        name: file.name,
        size: file.size,
        isVideo,
        previewUrl: URL.createObjectURL(file),
        isUploading: true,
      };
    });

    setMediaList((prev) => [...prev, ...newItems]);
    setIsUploading(true);

    try {
      const res = await returnApi.uploadFiles(validFiles);
      const uploadedUrls = res.data || [];

      setMediaList((prev) => {
        let uIdx = 0;
        return prev.map((m) => {
          if (m.isUploading && uIdx < uploadedUrls.length) {
            const serverUrl = uploadedUrls[uIdx++];
            return { ...m, url: serverUrl, isUploading: false };
          }
          return m;
        });
      });
      showToast(`Đã tải lên ${uploadedUrls.length} tệp thành công`, 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Tải tệp lên thất bại. Vui lòng thử lại.', 'error');
      setMediaList((prev) => prev.filter((m) => !m.isUploading));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const removeMedia = (index: number) => {
    setMediaList((prev) => {
      const item = prev[index];
      if (item?.previewUrl && item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const addManualUrl = () => {
    if (!manualUrlInput.trim()) return;
    if (!manualUrlInput.startsWith('http://') && !manualUrlInput.startsWith('https://')) {
      showToast('Đường dẫn ảnh/video phải bắt đầu bằng http:// hoặc https://', 'error');
      return;
    }
    const isVideo =
      /\.(mp4|mov|webm|mkv)/i.test(manualUrlInput) ||
      manualUrlInput.includes('youtube.com') ||
      manualUrlInput.includes('youtu.be');

    setMediaList((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        url: manualUrlInput.trim(),
        name: manualUrlInput.trim().split('/').pop() || 'Liên kết ngoài',
        isVideo,
        previewUrl: manualUrlInput.trim(),
        isUploading: false,
      },
    ]);
    setManualUrlInput('');
    setShowUrlInput(false);
    showToast('Đã thêm liên kết minh chứng', 'success');
  };

  const calculateTotalRefund = (): number => {
    if (!eligibility || requestType !== 'RETURN_REFUND') return 0;
    let sum = 0;
    selectedItems.forEach((qty, orderItemId) => {
      const item = eligibility.items?.find((i) => i.orderItemId === orderItemId);
      if (item) {
        sum += item.unitPrice * qty;
      }
    });
    return sum;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedItems.size === 0) {
      showToast('Vui lòng chọn ít nhất 1 sản phẩm cần đổi trả/bảo hành', 'error');
      return;
    }

    if (!reason.trim()) {
      showToast('Vui lòng chọn hoặc nhập lý do', 'error');
      return;
    }

    if (isUploading) {
      showToast('Vui lòng đợi các tệp hình ảnh/video hoàn tất tải lên', 'error');
      return;
    }

    const finalEvidenceUrls = mediaList.map((m) => m.url).filter(Boolean);
    if (finalEvidenceUrls.length === 0) {
      showToast('Vui lòng cung cấp ít nhất 1 hình ảnh hoặc video minh chứng lỗi', 'error');
      return;
    }

    if (!pickupAddress.trim() || !pickupPhone.trim()) {
      showToast('Vui lòng nhập đầy đủ thông tin địa chỉ và SĐT lấy hàng', 'error');
      return;
    }

    const itemsPayload = Array.from(selectedItems.entries()).map(([orderItemId, quantity]) => ({
      orderItemId,
      quantity,
    }));

    const payload: CreateReturnPayload = {
      orderId,
      requestType,
      reason,
      customerNote: customerNote.trim() || undefined,
      items: itemsPayload,
      evidenceUrls: finalEvidenceUrls,
      pickupAddress: pickupAddress.trim(),
      pickupContactName: pickupName.trim(),
      pickupContactPhone: pickupPhone.trim(),
    };

    setIsSubmitting(true);
    try {
      await returnApi.createReturn(payload);
      showToast('Gửi yêu cầu đổi trả/bảo hành thành công! CSKH sẽ liên hệ sớm nhất.', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Không thể tạo yêu cầu đổi trả', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasonList =
    eligibility?.standardReasons && eligibility.standardReasons.length > 0
      ? eligibility.standardReasons
      : DEFAULT_STANDARD_REASONS;

  const hasAnyEligible = checkHasAnyEligible(eligibility);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Yêu Cầu Đổi Trả / Bảo Hành</h3>
              <p className="text-xs text-slate-500 font-medium">Đơn hàng #{orderCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden Inputs for Multi-device file handling */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />

        {/* Form Body */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-xs font-medium">Đang kiểm tra điều kiện chính sách...</p>
          </div>
        ) : fetchError ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Không Thể Kiểm Tra Điều Kiện</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{fetchError}</p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={fetchEligibility}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Thử lại
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Đóng lại
              </button>
            </div>
          </div>
        ) : eligibility && !hasAnyEligible ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Đơn Hàng Không Đủ Điều Kiện</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tất cả các sản phẩm trong đơn hàng này đã hết thời hạn đổi trả và bảo hành hoặc đã hoàn tất thủ tục trước đó.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Đóng lại
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6">
            {/* 1. Chọn loại yêu cầu */}
            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                1. Chọn Hình Thức Xử Lý <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {[
                  {
                    type: 'RETURN_REFUND' as ReturnRequestType,
                    label: 'Trả hàng & Hoàn tiền',
                    desc: 'Thu hồi hàng & hoàn lại tiền',
                  },
                  {
                    type: 'RETURN_EXCHANGE' as ReturnRequestType,
                    label: 'Đổi sản phẩm mới',
                    desc: 'Đổi sản phẩm cùng loại',
                  },
                  {
                    type: 'WARRANTY' as ReturnRequestType,
                    label: 'Bảo hành chính hãng',
                    desc: 'Gửi hãng kiểm tra & sửa chữa',
                  },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.type}
                    onClick={() => handleTypeChange(item.type)}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                      requestType === item.type
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="block text-xs font-bold text-slate-900">{item.label}</span>
                    <span className="hidden sm:block text-[11px] text-slate-500 mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Chọn sản phẩm */}
            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                2. Chọn Sản Phẩm Cần Xử Lý <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-2.5">
                {eligibility?.items && eligibility.items.length > 0 ? (
                  eligibility.items.map((item) => {
                    const isEligible = isItemEligible(item, requestType);
                    const isSelected = selectedItems.has(item.orderItemId);
                    const selectedQty = selectedItems.get(item.orderItemId) || 1;

                    return (
                      <div
                        key={item.orderItemId}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          !isEligible
                            ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
                            : isSelected
                            ? 'bg-emerald-50/30 border-emerald-500 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            disabled={!isEligible}
                            checked={isSelected}
                            onChange={() => toggleItem(item)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer flex-shrink-0"
                          />
                          {item.productImageUrl ? (
                            <img
                              src={item.productImageUrl}
                              alt=""
                              className="w-11 h-11 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <Package className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">{item.productName}</p>
                            <p className="text-[11px] text-slate-500">
                              {item.unitPrice.toLocaleString('vi-VN')} ₫ × Còn lại được đổi:{' '}
                              <span className="font-semibold text-slate-800">{item.availableReturnQuantity}</span>
                            </p>
                            {!isEligible && (
                              <span className="inline-block text-[10px] font-bold text-rose-600 mt-0.5">
                                {requestType === 'WARRANTY'
                                  ? 'Hết hạn bảo hành hoặc đã xử lý'
                                  : 'Hết hạn đổi trả (quá số ngày quy định)'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Số lượng chọn */}
                        {isSelected && (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[11px] text-slate-500 font-medium">SL:</span>
                            <input
                              type="number"
                              min={1}
                              max={item.availableReturnQuantity}
                              value={selectedQty}
                              onChange={(e) =>
                                updateQuantity(
                                  item.orderItemId,
                                  item.availableReturnQuantity,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-14 p-1 text-center font-bold text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                    Không tìm thấy thông tin sản phẩm trong đơn hàng này.
                  </div>
                )}
              </div>

              {requestType === 'RETURN_REFUND' && calculateTotalRefund() > 0 && (
                <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex justify-between items-center font-bold text-emerald-900">
                  <span>Số tiền hoàn dự kiến:</span>
                  <span className="text-sm font-black text-emerald-600">
                    {calculateTotalRefund().toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              )}
            </div>

            {/* 3. Lý do & Ghi chú */}
            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                3. Lý Do & Mô Tả Chi Tiết Lỗi <span className="text-rose-500">*</span>
              </label>
              <div>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                >
                  {reasonList.map((r, idx) => (
                    <option key={idx} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                rows={2}
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Mô tả cụ thể hơn về tình trạng sản phẩm để nhân viên xử lý nhanh hơn..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none placeholder:text-slate-400"
              />
            </div>

            {/* 4. Minh chứng (Ảnh/Video) - Multi-Device & Mobile Friendly */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  4. Ảnh / Video Minh Chứng Lỗi <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  {mediaList.length} tệp đã chọn
                </span>
              </div>

              {/* Action Buttons Bar for Multi-Device */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-2.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 rounded-xl border border-emerald-200/80 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Chụp ảnh / Quay</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <UploadCloud className="w-4 h-4 text-slate-600" />
                  <span>Chọn từ máy</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="col-span-2 sm:col-span-1 p-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{showUrlInput ? 'Ẩn ô dán link' : 'Dán link ngoài'}</span>
                </button>
              </div>

              {/* Manual URL Input Dropdown */}
              {showUrlInput && (
                <div className="flex gap-2 mb-3 p-2 bg-slate-50 border border-slate-200 rounded-xl animate-in fade-in duration-200">
                  <input
                    type="text"
                    value={manualUrlInput}
                    onChange={(e) => setManualUrlInput(e.target.value)}
                    placeholder="Dán link ảnh hoặc video (vd: https://...)"
                    className="flex-1 p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={addManualUrl}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm
                  </button>
                </div>
              )}

              {/* Drag & Drop Zone for Desktop */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFilesSelected(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`hidden sm:flex border-2 border-dashed rounded-xl p-4 flex-col items-center justify-center text-center cursor-pointer transition-all mb-3 ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                    : 'border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/20'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1.5">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Kéo thả hình ảnh, video vào đây hoặc <span className="text-emerald-600 underline">chọn tệp từ máy</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Hỗ trợ JPG, PNG, WEBP (tối đa 15MB) & MP4, MOV, WEBM (tối đa 50MB)
                </p>
              </div>

              {/* Uploaded Media Preview Grid */}
              {mediaList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {mediaList.map((media, idx) => (
                    <div
                      key={media.id}
                      className="group relative aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-900 shadow-sm"
                    >
                      {media.isVideo ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                          <video
                            src={media.previewUrl || media.url}
                            className="w-full h-full object-cover opacity-80"
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm">
                              <Play className="w-4 h-4 ml-0.5 fill-white" />
                            </div>
                          </div>
                          <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-bold text-white flex items-center gap-1">
                            <Video className="w-3 h-3 text-emerald-400" /> Video
                          </span>
                        </div>
                      ) : (
                        <img
                          src={media.previewUrl || media.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Uploading overlay */}
                      {media.isUploading && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white gap-1 p-2">
                          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                          <span className="text-[10px] font-bold text-center">Đang tải...</span>
                        </div>
                      )}

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMedia(idx);
                        }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow"
                        title="Xóa tệp này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">
                  Chưa có ảnh/video nào được chọn. Vui lòng cung cấp ít nhất 1 hình ảnh hoặc video minh chứng lỗi.
                </p>
              )}
            </div>

            {/* 5. Thông tin lấy hàng thu hồi */}
            <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block">5. Thông Tin Lấy Hàng Thu Hồi (Bưu tá qua nhận):</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Tên người gửi"
                  value={pickupName}
                  onChange={(e) => setPickupName(e.target.value)}
                  className="p-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  placeholder="SĐT liên hệ"
                  value={pickupPhone}
                  onChange={(e) => setPickupPhone(e.target.value)}
                  className="p-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <input
                type="text"
                placeholder="Địa chỉ cụ thể"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Submit buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi yêu cầu...
                  </>
                ) : (
                  'Gửi Yêu Cầu Đổi Trả'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default ReturnRequestModal;
