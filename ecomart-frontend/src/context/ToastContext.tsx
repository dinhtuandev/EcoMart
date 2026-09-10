import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { ToastType, ToastItem, ToastContextType } from '../types';
import ToastContainer from '../components/ui/ToastContainer';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string): void => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success'): void => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, message, type };

      setToasts((prevToasts) => [...prevToasts, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 3000);
    },
    [removeToast]
  );

  // Lắng nghe toast bắn ra từ axiosClient.ts (lỗi 429, lỗi chung không do component tự bắt)
  useEffect(() => {
    const handleGlobalToast = (e: Event) => {
      const { type, message } = (e as CustomEvent<{ type: ToastType; message: string }>).detail;
      showToast(message, type);
    };
    window.addEventListener('app:toast', handleGlobalToast);
    return () => window.removeEventListener('app:toast', handleGlobalToast);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

