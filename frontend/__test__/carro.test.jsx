// __test__/carro.test.jsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { CartContext } from '../src/context/cartContext'
import Carro from '../src/paginas/carro.jsx'

// --- 1. MOCKS Y CONFIGURACIÓN ---
const mockNavigate = vi.fn()
const authUserLoggedIn = {
  isLoggedIn: true,
  user: {
    direccion_default: {
      region: 'Metropolitana',
      comuna: 'Santiago',
      calle: 'Calle Falsa 123',
      depto: 'Apto 4B'
    }
  },
  role: 'Cliente',
  loading: false
}
const authUserLoggedOut = {
  isLoggedIn: false,
  user: null,
  role: null,
  loading: false
}
const mockAddToCart = vi.fn()
const mockRemoveFromCart = vi.fn()
const mockRemoveItem = vi.fn()
const mockCartItems = [
  { id: 1, nombre: 'Peluche Bonito', precio: 10000, quantity: 2, imagen: 'img1.jpg' },
  { id: 2, nombre: 'Oso Grande', precio: 5000, quantity: 1, imagen: 'img2.jpg' }
]

beforeEach(() => {
  mockAddToCart.mockClear()
  mockRemoveFromCart.mockClear()
  mockRemoveItem.mockClear()
  mockNavigate.mockClear()
  vi.spyOn(window, 'alert').mockImplementation(() => {});
  vi.mock('react-router-dom', async (importOriginal) => {
    const mod = await importOriginal()
    return {
      ...mod,
      useNavigate: () => mockNavigate,
    }
  })
  vi.mock('../src/context/AuthContext', () => ({
    useAuth: () => vi.authValue,
    AuthProvider: ({ children }) => <>{children}</>,
    RequireAuth: ({ children }) => <>{children}</>,
    RequireAdmin: ({ children }) => <>{children}</>,
  }));
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetModules()
})

// --- 2. FUNCIÓN DE AYUDA PARA RENDERIZAR ---
const renderCarro = (cartContextValue, authContextValue) => {
  vi.authValue = authContextValue;
  render(
    <CartContext.Provider value={cartContextValue}>
      <MemoryRouter initialEntries={['/carro']}>
        <Routes>
          <Route path="/carro" element={<Carro />} /> 
          <Route path="/checkout" element={<div>Página Checkout</div>} />
          <Route path="/productos" element={<div>Página Productos</div>} />
          <Route path="/" element={<div>Página Home</div>} /> 
        </Routes>
      </MemoryRouter>
    </CartContext.Provider>
  )
}

// --- 3. LOS TESTS ---
describe('Página Carro', () => {

  test('1. muestra "carrito vacío" si no hay items', () => {
    const cartValue = { cartItems: [], addToCart: mockAddToCart, removeFromCart: mockRemoveFromCart, removeItem: mockRemoveItem };
    renderCarro(cartValue, authUserLoggedOut);
    expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver Productos' })).toBeInTheDocument();
  });

  test('2. muestra items y totales (Usuario Deslogueado)', () => {
    const cartValue = { cartItems: mockCartItems, addToCart: mockAddToCart, removeFromCart: mockRemoveFromCart, removeItem: mockRemoveItem };
    renderCarro(cartValue, authUserLoggedOut);
    expect(screen.getByText('Peluche Bonito')).toBeInTheDocument();
    expect(screen.getByText('Oso Grande')).toBeInTheDocument();
    expect(screen.getByText('$20.000')).toBeInTheDocument();
    expect(screen.getByText('$5.000')).toBeInTheDocument();
    expect(screen.getByText('Total a Pagar')).toBeInTheDocument();
    expect(screen.getByText('$25.000')).toBeInTheDocument();
    
    // 👇 CORRECCIÓN (Test 2)
    // 1. Busca el link
    const loginLink = screen.getByRole('link', { name: 'Inicia sesión' });
    // 2. Comprueba el texto de su padre <p>
    expect(loginLink.parentElement).toHaveTextContent(/Inicia sesión para ver tu dirección de envío por defecto/i);
    
    expect(screen.getByRole('button', { name: 'Ir a Checkout' })).toBeDisabled();
  });

  test('3. muestra la dirección si el usuario está logueado', () => {
    const cartValue = { cartItems: mockCartItems, addToCart: mockAddToCart, removeFromCart: mockRemoveFromCart, removeItem: mockRemoveItem };
    renderCarro(cartValue, authUserLoggedIn);

    // 👇 CORRECCIÓN (Test 3)
    // 1. Busca el texto "Metropolitana" (que está en el <strong>)
    const regionLabel = screen.getByText('Metropolitana');
    // 2. Comprueba el texto de su padre <p> (usamos \s* para ignorar espacios/saltos)
    expect(regionLabel.parentElement).toHaveTextContent(/Metropolitana\s*,\s*Santiago/i);

    // 3. Busca el texto de la calle
    const calleLabel = screen.getByText(/Calle Falsa 123/i);
    // 4. Comprueba el texto de su padre <p>
    expect(calleLabel.parentElement).toHaveTextContent(/Calle Falsa 123\s*\(Apto 4B\)/i);
    
    expect(screen.getByRole('button', { name: 'Ir a Checkout' })).not.toBeDisabled();
  });
  
  test('4. las funciones del carrito (+, -, eliminar) son llamadas', () => {
    const cartValue = { cartItems: mockCartItems, addToCart: mockAddToCart, removeFromCart: mockRemoveFromCart, removeItem: mockRemoveItem };
    renderCarro(cartValue, authUserLoggedIn);
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar cantidad de Peluche Bonito' }));
    expect(mockAddToCart).toHaveBeenCalledTimes(1);
    expect(mockAddToCart).toHaveBeenCalledWith(mockCartItems[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Reducir cantidad de Peluche Bonito' }));
    expect(mockRemoveFromCart).toHaveBeenCalledTimes(1);
    expect(mockRemoveFromCart).toHaveBeenCalledWith(mockCartItems[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Oso Grande del carrito' }));
    expect(mockRemoveItem).toHaveBeenCalledTimes(1);
    expect(mockRemoveItem).toHaveBeenCalledWith(mockCartItems[1]);
  });

  test('5. navega a /checkout si el usuario está logueado', () => {
    const cartValue = { cartItems: mockCartItems, addToCart: mockAddToCart, removeFromCart: mockRemoveFromCart, removeItem: mockRemoveItem };
    renderCarro(cartValue, authUserLoggedIn);
    const checkoutButton = screen.getByRole('button', { name: 'Ir a Checkout' });
    expect(checkoutButton).not.toBeDisabled();
    fireEvent.click(checkoutButton);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/checkout');
  });
  
  test('6. muestra "Error: No hay dirección registrada" si el usuario no tiene dirección', () => {
    const authUserSinDireccion = { ...authUserLoggedIn, user: { ...authUserLoggedIn.user, direccion_default: null } };
    const cartValue = { cartItems: mockCartItems, addToCart: mockAddToCart, removeFromCart: mockRemoveFromCart, removeItem: mockRemoveItem };
    renderCarro(cartValue, authUserSinDireccion);
    expect(screen.getByText('Error: No hay dirección registrada. Actualiza tu perfil.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ir a Checkout' })).not.toBeDisabled();
  });
})