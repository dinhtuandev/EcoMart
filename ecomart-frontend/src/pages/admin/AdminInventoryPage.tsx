import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Warehouse,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit,
  Loader2,
  RefreshCw,
  X,
  Package,
} from 'lucide-react';
import { inventoryApi } from '../../services/inventoryApi';
import { useToast } from '../../context/ToastContext';
import { InventoryItem, CustomAxiosError } from '../../types';
import Pagination from '../../components/common/Pagination';

const formatCurrency = (amount?: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

// Modal Cập nhật số lượng tồn kho
interface UpdateStockModalProps {
  item: InventoryItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (productId: number, newStock: number) => void;
}

const UpdateStockModal: React.FC<UpdateStockModalProps> = ({
  item,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState<number>(item.quantityInStock);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    setQuantity(item.quantityInStock);
  }, [item]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (quantity < 0) {
      showToast('Số lượng tồn kho không được âm.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await inventoryApi.updateStock(item.productId, { quantityInStock: quantity });
      showToast(`Đã cập nhật tồn kho cho ${item.productName}`, 'success');
      onSuccess(item.productId, quantity);
      onClose();
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      showToast(
        customError.response?.data?.message || 'Không thể cập nhật tồn kho.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-stock-title"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <h3 id="modal-stock-title" className="text-base font-bold text-slate-900">
              Cập Nhật Tồn Kho
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            tabIndex={0}
            aria-label="Đóng cửa sổ"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-gray-100 space-y-1 text-xs">
          <p className="font-bold text-slate-900 text-sm">{item.productName}</p>
          <p className="text-slate-500">Mã sản phẩm: #{item.productId}</p>
          <p className="text-slate-500">
            Tồn hiện tại: <strong className="text-emerald-700">{item.quantityInStock}</strong>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="stock-quantity-input"
              className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider"
            >
              Số Lượng Tồn Mới <span className="text-rose-500">*</span>
            </label>
            <input
              id="stock-quantity-input"
              type="number"
              min={0}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
              required
              tabIndex={0}
              aria-label="Nhập số lượng tồn kho mới"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-bold text-sm outline-none transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              tabIndex={0}
              aria-label="Hủy bỏ"
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              tabIndex={0}
              aria-label="Lưu số lượng tồn kho"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Xác Nhận Lưu</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AdminInventoryPage: React.FC = () => {
  const { showToast } = useToast();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const pageSize = 10;

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>('');
  const [lowStockOnly, setLowStockOnly] = useState<boolean>(false);

  // Edit Stock Modal State
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Search Debounce (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchInventory = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    try {
      const res = await inventoryApi.getAdminInventory(
        {
          page: currentPage,
          pageSize,
          keyword: debouncedKeyword.trim() || undefined,
          lowStockOnly: lowStockOnly ? true : undefined,
        },
        controller.signal
      );

      if (res.data) {
        const content = res.data.items || res.data.content || [];
        setItems(content);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || content.length);
      }
    } catch (error: unknown) {
      const e = error as CustomAxiosError;
      if (e.name !== 'CanceledError' && e.name !== 'AbortError') {
        showToast('Không thể tải danh sách tồn kho.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, debouncedKeyword, lowStockOnly, showToast]);

  useEffect(() => {
    fetchInventory();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchInventory]);

  // Optimistic stock update
  const handleStockUpdated = (productId: number, newStock: number): void => {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantityInStock: newStock, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200">
          <XCircle className="w-3.5 h-3.5" />
          Hết hàng (0)
        </span>
      );
    }
    if (stock <= 5) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5" />
          Sắp hết hàng ({stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Còn hàng ({stock})
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Warehouse className="w-5 h-5" />
            </div>
            Quản Lý Tồn Kho (Inventory)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi, cảnh báo hết hàng và điều chỉnh số lượng tồn kho sản phẩm
          </p>
        </div>

        <button
          type="button"
          onClick={fetchInventory}
          disabled={isLoading}
          tabIndex={0}
          aria-label="Làm mới bảng tồn kho"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-gray-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input with Debounce */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên sản phẩm..."
            tabIndex={0}
            aria-label="Tìm kiếm sản phẩm trong kho"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-2xl border border-gray-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-emerald-500 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              tabIndex={0}
              aria-label="Xóa từ khóa tìm kiếm"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Low Stock Filter Toggle */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => {
                setLowStockOnly(e.target.checked);
                setCurrentPage(1);
              }}
              tabIndex={0}
              aria-label="Lọc sản phẩm sắp hết hàng"
              className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Chỉ hiện sắp hết hàng (Tồn &le; 5)
            </span>
          </label>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Warehouse className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-600">Không tìm thấy sản phẩm nào trong kho.</p>
            <p className="text-xs text-slate-400">Hãy thử thay đổi từ khóa hoặc điều kiện bộ lọc.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3.5">Mã SP</th>
                  <th className="px-5 py-3.5">Sản Phẩm</th>
                  <th className="px-5 py-3.5 text-center">Trạng Thái Tồn Kho</th>
                  <th className="px-5 py-3.5">Cập Nhật Lần Cuối</th>
                  <th className="px-5 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id || item.productId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-slate-500">
                      #{item.productId}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <img
                            src={
                              item.productImageUrl ||
                              'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100'
                            }
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 line-clamp-1">{item.productName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {item.categoryName || 'Sản phẩm EcoMart'}{' '}
                            {item.sellingPrice ? `• ${formatCurrency(item.sellingPrice)}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center">
                      {getStockBadge(item.quantityInStock)}
                    </td>

                    <td className="px-5 py-4 text-slate-500 font-medium">
                      {formatDate(item.updatedAt)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setEditingItem(item)}
                        tabIndex={0}
                        aria-label={`Cập nhật tồn kho cho ${item.productName}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Cập nhật</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Hiển thị <strong>{items.length}</strong> trên tổng số <strong>{totalElements}</strong> sản phẩm
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Edit Stock Modal */}
      {editingItem && (
        <UpdateStockModal
          item={editingItem}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={handleStockUpdated}
        />
      )}
    </div>
  );
};

export default AdminInventoryPage;
