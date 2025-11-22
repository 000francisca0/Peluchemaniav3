import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useContext } from 'react';
import { CartProvider, CartContext } from '../src/context/cartContext'; // Asegúrate que la ruta sea correcta

// --- Mock de Datos ---
const productA = { id: 1, nombre: 'Oso Teddy', precio: 10000 };
const productB = { id: 2, nombre: 'Conejo Saltador', precio: 8000 };

// --- Helper de Setup ---

// 1. Creamos un "wrapper" que es nuestro Provider.
// renderHook necesita esto para que el contexto esté disponible.
const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

// 2. Creamos una función que renderiza el hook y nos devuelve el resultado.
// Lo hacemos en una función para que CADA test empiece con un carrito vacío.
const setupHook = () => {
  const { result } = renderHook(() => useContext(CartContext), { wrapper });
  return result;
};

// --- Suite de Pruebas ---
describe('Contexto: CartContext', () => {

  it('debería tener un carrito vacío inicialmente', () => {
    const result = setupHook();
    expect(result.current.cartItems).toEqual([]);
  });

  // --- Pruebas para addToCart ---
  it('debería agregar un nuevo producto al carrito', () => {
    const result = setupHook();

    // "act" es necesario para envolver cualquier acción que cause
    // una actualización de estado en React.
    act(() => {
      result.current.addToCart(productA);
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0]).toEqual({ ...productA, quantity: 1 });
  });

  it('debería incrementar la cantidad de un producto existente', () => {
    const result = setupHook();

    // Añadimos el producto A (cantidad = 1)
    act(() => {
      result.current.addToCart(productA);
    });
    
    // Añadimos el producto A de nuevo (cantidad = 2)
    act(() => {
      result.current.addToCart(productA);
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0]).toEqual({ ...productA, quantity: 2 });
  });

  it('debería agregar múltiples productos diferentes', () => {
    const result = setupHook();

    act(() => { result.current.addToCart(productA); });
    act(() => { result.current.addToCart(productB); });

    expect(result.current.cartItems).toHaveLength(2);
    // Usamos 'toContainEqual' para verificar que el objeto existe en el array
    expect(result.current.cartItems).toContainEqual({ ...productA, quantity: 1 });
    expect(result.current.cartItems).toContainEqual({ ...productB, quantity: 1 });
  });

  // --- Pruebas para removeFromCart (decrementar) ---
  it('debería decrementar la cantidad de un producto', () => {
    const result = setupHook();

    // Setup: Añadimos producto A dos veces
    act(() => { result.current.addToCart(productA); });
    act(() => { result.current.addToCart(productA); });
    expect(result.current.cartItems[0].quantity).toBe(2);

    // Act: Removemos uno
    act(() => {
      result.current.removeFromCart(productA);
    });

    // Assert: Queda uno
    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].quantity).toBe(1);
  });

  it('debería eliminar el producto si la cantidad es 1 al usar removeFromCart', () => {
    const result = setupHook();

    // Setup: Añadimos producto A una vez
    act(() => { result.current.addToCart(productA); });
    expect(result.current.cartItems).toHaveLength(1);

    // Act: Removemos uno
    act(() => {
      result.current.removeFromCart(productA);
    });

    // Assert: El carrito queda vacío
    expect(result.current.cartItems).toHaveLength(0);
    expect(result.current.cartItems).toEqual([]);
  });

  // --- Pruebas para removeItem (eliminar línea) ---
  it('debería eliminar un producto por completo (removeItem), sin importar la cantidad', () => {
    const result = setupHook();

    // Setup: Añadimos producto A tres veces
    act(() => { result.current.addToCart(productA); });
    act(() => { result.current.addToCart(productA); });
    act(() => { result.current.addToCart(productA); });
    expect(result.current.cartItems[0].quantity).toBe(3);

    // Act: Usamos removeItem
    act(() => {
      result.current.removeItem(productA);
    });

    // Assert: El carrito queda vacío
    expect(result.current.cartItems).toHaveLength(0);
  });

  // --- Pruebas para clearCart ---
  it('debería vaciar el carrito por completo (clearCart)', () => {
    const result = setupHook();
    
    // Setup: Añadimos dos productos
    act(() => { result.current.addToCart(productA); });
    act(() => { result.current.addToCart(productB); });
    expect(result.current.cartItems).toHaveLength(2);

    // Act: Limpiamos el carrito
    act(() => {
      result.current.clearCart();
    });

    // Assert: El carrito queda vacío
    expect(result.current.cartItems).toHaveLength(0);
    expect(result.current.cartItems).toEqual([]);
  });

});