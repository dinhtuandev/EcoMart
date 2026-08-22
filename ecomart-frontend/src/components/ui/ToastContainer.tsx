import React from 'react';
import { ToastItem } from '../../types';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

/**
 * Toast Container hiển thị cố định ở góc trên bên phải màn hình
 */
const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-xl text-white text-sm font-medium transition-all duration-300 transform translate-x-0 animate-slide-in ${
              isSuccess ? 'bg-emerald-600' : ''
            } ${isError ? 'bg-rose-600' : ''} ${
              isWarning ? 'bg-amber-500' : ''
            }`}
            role="alert"
          >
            <div className="flex items-center gap-3">
              {isSuccess && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
              {isError && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              {isWarning && <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
              <span>{toast.message}</span>
            </div>

            <button
              type="button"
              onClick={() => onRemove(toast.id)}
              className="ml-3 p-1 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
