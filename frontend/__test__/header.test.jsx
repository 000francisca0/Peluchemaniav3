import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import Header from '../src/components/header'; // Asegúrate que la ruta sea correcta
import { CartContext } from '../src/context/cartContext';

// --- Mocks ---

// 1. Mock de 'react-router-dom' para 'useNavigate'
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual, // Mantenemos <Link> y <MemoryRouter>
    useNavigate: () => mockNavigate,
  };
});

// 2. Mock de 'AuthContext'
const mockLogout = vi.fn();
// Importamos el hook que vamos a mockear
import { useAuth } from '../src/context/AuthContext'; 
// Le decimos a Vitest que reemplace 'useAuth' con una función mock
vi.mock('../src/context/AuthContext', async () => {
  const actual = await vi.importActual('../src/context/AuthContext');
  return {
    ...actual, // Mantenemos AuthProvider, etc. si fueran necesarios
    useAuth: vi.fn(), // Reemplazamos el hook
  };
});
// Creamos un alias para el hook mockeado para usarlo fácil
const mockedUseAuth = useAuth;

// --- Mock de Datos ---
const mockClient = { id: 1, nombre: 'Juan', apellidos: 'Pérez', rol: 'Cliente' };
const mockAdmin = { id: 2, nombre: 'Admin', apellidos: 'User', rol: 'Administrador' };

// --- Estados Simulados ---
const guestState = { isLoggedIn: false, user: null, logout: mockLogout };
const clientState = { isLoggedIn: true, user: mockClient, logout: mockLogout };
const adminState = { isLoggedIn: true, user: mockAdmin, logout: mockLogout };

const emptyCart = { cartItems: [] };
const fullCart = { cartItems: [{ id: 1, quantity: 2 }, { id: 2, quantity: 1 }] }; // 3 items totales

// --- Helper para renderizar ---
const renderComponent = (authValue, cartValue) => {
  // Seteamos el valor que retornará el hook 'useAuth' para este test
  mockedUseAuth.mockReturnValue(authValue);

  render(
    <MemoryRouter>
      {/* Usamos el Provider real de CartContext */}
      <CartContext.Provider value={cartValue}>
        <Header />
      </CartContext.Provider>
    </MemoryRouter>
  );
};

// --- Configuración Global ---
beforeEach(() => {
  // Limpiamos todos los mocks antes de CADA test
  mockNavigate.mockClear();
  mockLogout.mockClear();
  mockedUseAuth.mockClear();
});


// =================================================================
// Pruebas para el Header
// =================================================================

describe('Componente: Header', () => {

  describe('Escenario: Usuario Invitado (No Logueado)', () => {
    it('debería mostrar los links de navegación principales', () => {
      renderComponent(guestState, emptyCart);
      
      // Buscamos la barra de navegación principal
      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      expect(within(nav).getByRole('link', { name: 'Inicio' })).toBeInTheDocument();
      expect(within(nav).getByRole('link', { name: 'Productos' })).toBeInTheDocument();
      expect(within(nav).getByRole('link', { name: 'Categorías' })).toBeInTheDocument();
    });

    it('debería mostrar "Iniciar Sesión" y "Regístrate"', () => {
      renderComponent(guestState, emptyCart);
      expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /regístrate/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /cerrar sesión/i })).not.toBeInTheDocument();
    });

    it('no debería mostrar el link de Admin', () => {
      renderComponent(guestState, emptyCart);
      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      expect(within(nav).queryByRole('link', { name: /admin/i })).not.toBeInTheDocument();
    });

    it('debería mostrar el carrito vacío (sin contador)', () => {
      renderComponent(guestState, emptyCart);
      const cartLink = screen.getByLabelText(/carrito de compras/i);
      expect(cartLink).toBeInTheDocument();
      // Verificamos que el span 'badge' (que contiene el número) no exista
      expect(cartLink.querySelector('.badge')).toBeNull();
    });
  });

  describe('Escenario: Usuario Cliente (Logueado)', () => {
    it('debería mostrar el nombre del usuario y el botón "Cerrar sesión"', () => {
      renderComponent(clientState, emptyCart);
      
      // Buscamos el nombre del usuario
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /iniciar sesión/i })).not.toBeInTheDocument();
    });

    it('no debería mostrar el link de Admin', () => {
      renderComponent(clientState, emptyCart);
      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      expect(within(nav).queryByRole('link', { name: /admin/i })).not.toBeInTheDocument();
    });

    it('debería llamar a logout y navegar a /home al cerrar sesión', async () => {
      renderComponent(clientState, emptyCart);
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /cerrar sesión/i }));

      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });

    it('debería mostrar el contador del carrito con 3 items', () => {
      renderComponent(clientState, fullCart); // Usamos el carrito lleno
      
      const cartLink = screen.getByLabelText(/carrito de compras/i);
      // Verificamos que el span 'badge' exista y tenga el texto '3'
      const badge = cartLink.querySelector('.badge');
      expect(badge).toBeInTheDocument();
      expect(badge.textContent).toBe('3');
    });
  });

  describe('Escenario: Usuario Administrador (Logueado)', () => {
    it('debería mostrar el link de Admin', () => {
      renderComponent(adminState, emptyCart);
      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      const adminLink = within(nav).getByRole('link', { name: /admin/i });
      
      expect(adminLink).toBeInTheDocument();
      expect(adminLink).toHaveAttribute('href', '/admin');
    });
  });

  describe('Funcionalidad: Menú Mobile', () => {
    it('debería abrir y cerrar el menú mobile al hacer clic en el toggle', async () => {
      renderComponent(guestState, emptyCart);
      const user = userEvent.setup();
      
      // 1. Menú está cerrado
      expect(screen.queryByRole('navigation', { name: /mobile navigation/i })).not.toBeInTheDocument();
      
      // 2. Abrir menú
      const toggleButton = screen.getByLabelText(/abrir menú/i);
      await user.click(toggleButton);
      
      // 3. Menú está abierto
      const mobileNav = screen.getByRole('navigation', { name: /mobile navigation/i });
      expect(mobileNav).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

      // 4. Cerrar menú (haciendo clic de nuevo)
      await user.click(toggleButton);
      expect(screen.queryByRole('navigation', { name: /mobile navigation/i })).not.toBeInTheDocument();
    });

    it('debería cerrar el menú mobile al hacer clic en un link', async () => {
      renderComponent(guestState, emptyCart);
      const user = userEvent.setup();

      // 1. Abrir menú
      await user.click(screen.getByLabelText(/abrir menú/i));
      const mobileNav = screen.getByRole('navigation', { name: /mobile navigation/i });
      expect(mobileNav).toBeInTheDocument();

      // 2. Clic en un link dentro del menú mobile
      const mobileLink = within(mobileNav).getByRole('link', { name: 'Productos' });
      await user.click(mobileLink);

      // 3. Menú se cierra
      expect(screen.queryByRole('navigation', { name: /mobile navigation/i })).not.toBeInTheDocument();
    });

    it('debería mostrar el contenido correcto en el menú mobile (Admin, Carrito lleno)', async () => {
      renderComponent(adminState, fullCart);
      const user = userEvent.setup();
      
      // 1. Abrir menú
      await user.click(screen.getByLabelText(/abrir menú/i));
      const mobileNav = screen.getByRole('navigation', { name: /mobile navigation/i });
      
      // 2. Verificar link de Admin
      expect(within(mobileNav).getByRole('link', { name: 'Admin' })).toBeInTheDocument();
      
      // 3. Verificar botón de Logout
      expect(within(mobileNav).getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
      
      // 4. Verificar contador de carrito
      expect(within(mobileNav).getByText(/carrito \(3\)/i)).toBeInTheDocument();
    });
  });
});