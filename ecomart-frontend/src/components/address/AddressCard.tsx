import React from 'react';
import { MapPin, Phone, User as UserIcon, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { Address } from '../../types';

export interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (addressId: number) => void;
  onSetDefault?: (address: Address) => void;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  const handleDeleteClick = (): void => {
    const isConfirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa địa chỉ của "${address.receiverName}" (${address.detailAddress}) không?`
    );
    if (isConfirmed) {
      onDelete(address.id);
    }
  };

  return (
    <div
      className={`relative p-5 rounded-2xl border transition-all duration-200 bg-white ${
        address.isDefault
          ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {/* Header card: Tên & Badge Mặc định */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <UserIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {address.receiverName}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{address.receiverPhone}</span>
            </div>
          </div>
        </div>

        {address.isDefault && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            <span>Mặc định</span>
          </span>
        )}
      </div>

      {/* Chi tiết địa chỉ */}
      <div className="flex items-start gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-gray-100">
        <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          {address.detailAddress}, {address.ward}, {address.district}, {address.province}
        </span>
      </div>

      {/* Hành động */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        {!address.isDefault && onSetDefault ? (
          <button
            type="button"
            onClick={() => onSetDefault(address)}
            className="text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
          >
            Thiết lập mặc định
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(address)}
            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
            title="Chỉnh sửa địa chỉ"
            aria-label="Chỉnh sửa địa chỉ"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
            title="Xóa địa chỉ"
            aria-label="Xóa địa chỉ"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressCard;
