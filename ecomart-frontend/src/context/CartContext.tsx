import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { cartApi } from '../services/cartApi';
import { useAuth } from '../providers/AuthProvider';
import { useToast } from './ToastContext';
import { Cart, CartItem, CartContextType, CustomAxiosError } from '../types';
import { isStorePreviewActive } from '../utils/storePreview';

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const isStaffPreview =
    (user?.role === 'MANAGER' || user?.role === 'ADMIN') && isStorePreviewActive();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Debounce Timer để đồng bộ số lượng sản phẩm lên Backend sau 500ms
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Lấy dữ liệu giỏ hàng từ máy chủ
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || isStaffPreview) {
      setCart(null);
      return;
    }

    setLoading(true);
    try {
      const res = await cartApi.getCart();
      if (res && res.data) {
        setCart(res.data);
      }
    } catch {
      // Giỏ hàng trống hoặc chưa có dữ liệu
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isStaffPreview]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // 2. Tính toán phái sinh (Derived State) bằng useMemo
  const cartItems: CartItem[] = useMemo(() => {
    return cart?.items || [];
  }, [cart]);

  const totalQuantity: number = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [cartItems]);

  const totalAmount: number = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + (item.sellingPrice || 0) * (item.quantity || 0),
      0
    );
  }, [cartItems]);

  // 3. Xử lý Thêm sản phẩm vào giỏ hàng
  const handleAddToCart = async (productId: number, quantity = 1): Promise<boolean> => {
    if (isStaffPreview) {
      showToast('Chế độ xem sàn: không thể thêm sản phẩm vào giỏ hàng.', 'warning');
      return false;
    }

    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.', 'warning');
      return false;
    }

    setLoading(true);
    try {
      const res = await cartApi.addToCart({ productId, quantity });
      if (res && res.data) {
        await fetchCart();
        return true;
      }
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      const message =
        customError.response?.data?.message ||
        'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.';
      showToast(message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
    return false;
  };

  // 4. Optimistic Update + Debounce Sync 500ms khi tăng/giảm số lượng
  const handleLocalQuantityChange = (cartItemId: number, newQuantity: number): void => {
    if (isStaffPreview) return;
    if (!cart) return;

    const targetItem = cart.items.find((item) => item.id === cartItemId);
    if (!targetItem) return;

    // Giới hạn tối thiểu
    if (newQuantity < 1) return;

    // Giới hạn tồn kho
    if (newQuantity > targetItem.quantityInStock) {
      showToast(
        `Đã đạt giới hạn tồn kho! Tối đa ${targetItem.quantityInStock} sản phẩm.`,
        'warning'
      );
      return;
    }

    // Cập nhật ngay lập tức trên State Frontend (0ms lag)
    setCart((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        ),
      };
    });

    // Hủy timer cũ nếu user tiếp tục bấm
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    // Thiết lập timer 500ms để đồng bộ lên Backend PostgreSQL
    syncTimerRef.current = setTimeout(async () => {
      try {
        await cartApi.updateCartItem(cartItemId, { quantity: newQuantity });
      } catch (error: unknown) {
        // Rollback nếu thất bại
        await fetchCart();
        const customError = error as CustomAxiosError;
        const message =
          customError.response?.data?.message ||
          'Không thể cập nhật số lượng trên máy chủ. Đã khôi phục giỏ hàng.';
        showToast(message, 'error');
      }
    }, 500);
  };

  // 5. Xóa 1 sản phẩm khỏi giỏ hàng (Optimistic Update)
  const handleRemoveFromCart = async (cartItemId: number): Promise<void> => {
    if (isStaffPreview) return;
    if (!cart) return;

    const originalCart = { ...cart };

    // Cập nhật ngay trên UI
    setCart((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.filter((item) => item.id !== cartItemId),
      };
    });

    try {
      await cartApi.removeCartItem(cartItemId);
      showToast('Đã xóa sản phẩm khỏi giỏ hàng.', 'success');
    } catch (error: unknown) {
      // Rollback
      setCart(originalCart);
      const customError = error as CustomAxiosError;
      const message =
        customError.response?.data?.message ||
        'Không thể xóa sản phẩm. Đã khôi phục giỏ hàng.';
      showToast(message, 'error');
    }
  };

  // 6. Xóa toàn bộ giỏ hàng (Clear Cart)
  const handleClearCart = async (): Promise<void> => {
    if (isStaffPreview) return;
    if (!cart || cart.items.length === 0) return;

    const originalCart = { ...cart };

    // Cập nhật ngay trên UI
    setCart((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: [],
      };
    });

    try {
      await cartApi.clearCart();
      showToast('Đã làm trống giỏ hàng thành công.', 'success');
    } catch (error: unknown) {
      // Rollback
      setCart(originalCart);
      const customError = error as CustomAxiosError;
      const message =
        customError.response?.data?.message ||
        'Không thể xóa giỏ hàng. Đã khôi phục dữ liệu.';
      showToast(message, 'error');
    }
  };

  const value: CartContextType = {
    cart,
    cartItems,
    totalQuantity,
    totalAmount,
    loading,
    fetchCart,
    handleAddToCart,
    handleLocalQuantityChange,
    handleRemoveFromCart,
    handleClearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
