import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../services/cartApi';
import { useAuth } from './AuthContext';
import { Cart, CartItem, CartContextType } from '../types';

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
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
      // Ignore initial cart errors
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleAddToCart = async (productId: number, quantity = 1): Promise<boolean> => {
    if (!isAuthenticated) return false;
    setLoading(true);
    try {
      const res = await cartApi.addToCart({ productId, quantity });
      if (res && res.data) {
        setCart(res.data);
        return true;
      }
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
    return false;
  };

  const handleUpdateQuantity = async (cartItemId: number, quantity: number): Promise<void> => {
    setLoading(true);
    try {
      const res = await cartApi.updateCartItem(cartItemId, { quantity });
      if (res && res.data) {
        setCart(res.data);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (cartItemId: number): Promise<void> => {
    setLoading(true);
    try {
      await cartApi.removeCartItem(cartItemId);
      await fetchCart();
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const totalItems =
    cart?.items?.reduce((acc: number, item: CartItem) => acc + item.quantity, 0) || 0;
  const totalPrice = cart?.totalAmount || 0;

  const value: CartContextType = {
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

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
