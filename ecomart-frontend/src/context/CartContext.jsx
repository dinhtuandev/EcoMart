import { createContext, useContext, useState, useEffect } from 'react';
import { cartApi } from '../services/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const res = await cartApi.getCart();
      if (res.success) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const handleAddToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) return false;
    setLoading(true);
    try {
      const res = await cartApi.addToCart({ productId, quantity });
      if (res.success) {
        setCart(res.data);
        return true;
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng');
    } finally {
      setLoading(false);
    }
    return false;
  };

  const handleUpdateQuantity = async (cartItemId, quantity) => {
    setLoading(true);
    try {
      const res = await cartApi.updateCartItem(cartItemId, { quantity });
      if (res.success) {
        setCart(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể cập nhật số lượng');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (cartItemId) => {
    setLoading(true);
    try {
      await cartApi.removeCartItem(cartItemId);
      await fetchCart();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa sản phẩm khỏi giỏ');
    } finally {
      setLoading(false);
    }
  };

  const totalItems = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const totalPrice = cart?.totalAmount || 0;

  const value = {
    cart,
    cartItems: cart?.items || [],
    totalItems,
    totalPrice,
    loading,
    fetchCart,
    handleAddToCart,
    handleRemoveFromCart,
    handleUpdateQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
