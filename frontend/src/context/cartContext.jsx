// src/context/cartContext.jsx
import React, { createContext, useState, useContext } from 'react'; // <--- Agregamos useContext

export const CartContext = createContext();

// 1. Creamos el Hook personalizado (ESTO ES LO QUE FALTABA)
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // --- FUNCIONES EXISTENTES ---
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const itemInCart = prevItems.find((item) => item.id === product.id);
      if (itemInCart) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (product) => {
    setCartItems((prevItems) => {
      const itemInCart = prevItems.find((item) => item.id === product.id);
      if (itemInCart?.quantity === 1) {
        return prevItems.filter((item) => item.id !== product.id);
      } else {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
    });
  };

  // --- NUEVAS FUNCIONES ---

  // Función para ELIMINAR un item por completo
  const removeItem = (product) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== product.id));
  };

  // Función para VACIAR todo el carrito
  const clearCart = () => {
    setCartItems([]);
  };

  // Compartimos las funciones
  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};