import React, { useEffect, useState } from 'react';
import { X, Truck, MapPin, Clock, PackageCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { shippingApi } from '../../services/shippingApi';
import { ShippingOrder } from '../../types';

interface ShippingTrackingModalProps {
  trackingNumber: string;
  onClose: () => void;
}

export const ShippingTrackingModal: React.FC<ShippingTrackingModalProps> = ({
  trackingNumber,
  onClose,
}) => {
  const [shipping, setShipping] = useState<ShippingOrder | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    shippingApi
      .track(trackingNumber)
      .then((res) => {
        if (res.data) {
          setShipping(res.data);
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Không tìm thấy thông tin vận đơn');
      })
      .finally(() => setIsLoading(false));
  }, [trackingNumber]);

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      READY_TO_PICK: { label: 'Chờ lấy hàng', color: 'bg-amber-50 text-amber-700 border-amber-200' },
      PICKING: { label: 'Đang lấy hàng', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      DELIVERING: { label: 'Đang vận chuyển', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      ARRIVED_AT_LOCAL_HUB: { label: 'Đã đến bưu cục phát (Giao trong 24h)', color: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold' },
      DELIVERED: { label: 'Giao thành công', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      DELIVERY_FAILED: { label: 'Giao thất bại', color: 'bg-rose-50 text-rose-700 border-rose-200' },
      RETURNED_TO_SENDER: { label: 'Đã hoàn trả', color: 'bg-slate-100 text-slate-700 border-slate-200' },
      CANCELLED: { label: 'Đã hủy', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    };
    return map[status] || { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200' };
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Tra Cứu Vận Đơn</h3>
              <p className="text-xs font-mono font-semibold text-emerald-600">{trackingNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-xs font-medium">Đang tải lịch sử hành trình...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : shipping ? (
            <>
              {/* Status & Carrier summary */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Trạng thái hiện tại:</span>
                  <span
                    className={`inline-block mt-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      getStatusBadge(shipping.status).color
                    }`}
                  >
                    {getStatusBadge(shipping.status).label}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Đơn vị vận chuyển:</span>
                  <span className="font-bold text-slate-800 mt-1 block">
                    {shipping.carrier === 'ECO_EXPRESS' ? 'Eco Express (Nội bộ)' : shipping.carrier}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Chiều vận chuyển:</span>
                  <span className="font-semibold text-slate-700 mt-0.5 block">
                    {shipping.shippingType === 'REVERSE' ? 'Thu hồi đổi trả / bảo hành' : 'Giao hàng tiêu chuẩn'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Cước phí:</span>
                  <span className="font-semibold text-slate-700 mt-0.5 block">
                    {shipping.shippingFee.toLocaleString('vi-VN')} ₫ ({shipping.feeBearer === 'SHOP' ? 'Shop hỗ trợ' : 'Khách thanh toán'})
                  </span>
                </div>
              </div>

              {/* Sender & Receiver */}
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Người gửi: {shipping.senderName} ({shipping.senderPhone})</span>
                  </div>
                  <p className="text-slate-600 pl-5">{shipping.senderAddress}</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Người nhận: {shipping.receiverName} ({shipping.receiverPhone})</span>
                  </div>
                  <p className="text-slate-600 pl-5">{shipping.receiverAddress}</p>
                </div>
              </div>

              {/* Timeline Logs */}
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Lịch Sử Hành Trình
                </h4>

                {shipping.logs && shipping.logs.length > 0 ? (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {shipping.logs.map((log, index) => (
                      <div key={log.id || index} className="relative group">
                        <div
                          className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                            index === shipping.logs!.length - 1
                              ? 'border-emerald-600 ring-4 ring-emerald-100'
                              : 'border-slate-400'
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              index === shipping.logs!.length - 1 ? 'bg-emerald-600' : 'bg-slate-400'
                            }`}
                          />
                        </div>
                        <div className="text-xs space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">
                              {getStatusBadge(log.status).label}
                            </span>
                            <span className="text-[11px] font-medium text-slate-400">
                              {formatDate(log.timestamp)}
                            </span>
                          </div>
                          {log.location && (
                            <p className="text-slate-600 font-medium flex items-center gap-1 text-[11px]">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {log.location}
                            </p>
                          )}
                          {log.note && <p className="text-slate-500 text-[11px] mt-1">{log.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Chưa có thông tin di chuyển chi tiết.</p>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
export default ShippingTrackingModal;
