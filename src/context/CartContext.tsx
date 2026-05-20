'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '@/types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from LocalStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('vip_vaper_cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to LocalStorage when it changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('vip_vaper_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cart, isLoaded]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.product.id === product.id);

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        const newQty = newCart[existingItemIndex].quantity + quantity;
        // Limit quantity by stock if available
        newCart[existingItemIndex].quantity = product.stock > 0 ? Math.min(newQty, product.stock) : newQty;
        return newCart;
      }

      return [...prevCart, { product, quantity: Math.min(quantity, product.stock > 0 ? product.stock : 99) }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId) {
          const maxQty = item.product.stock > 0 ? item.product.stock : 99;
          return { ...item, quantity: Math.min(quantity, maxQty) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartSubtotal = cart.reduce((total, item) => {
    const price = item.product.promo_price ?? item.product.price;
    return total + price * item.quantity;
  }, 0);

  // Here, we can add shipping fees or coupon logic in the future.
  const cartTotal = cartSubtotal;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
