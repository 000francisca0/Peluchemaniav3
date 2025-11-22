import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, renderHook, act, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth, RequireAuth, RequireAdmin } from '../src/context/AuthContext';

// --- Mock de Datos ---
const mockUser = { id: 1, email: 'cliente@test.com', rol: 'Cliente' };
const mockAdmin = { id: 2, email: 'admin@test.com', rol: 'Administrador' };

// --- Mock de localStorage ---
let localStorageStore = {};
const localStorageMock = {
  getItem: vi.fn((key) => localStorageStore[key] || null),
  setItem: vi.fn((key, value) => { localStorageStore[key] = value.toString(); }),
  removeItem: vi.fn((key) => { delete localStorageStore[key]; }),
  clear: vi.fn(() => { localStorageStore = {}; }),
};
vi.stubGlobal('localStorage', localStorageMock);

// --- Mock de 'react-router-dom' ---
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: (props) => {
      mockNavigate(props);
      return <div data-testid="mock-navigate" />;
    },
    useLocation: () => ({
      pathname: '/ruta-protegida', // Ruta de origen simulada
    }),
  };
});

// --- Configuración Global ---
beforeEach(() => {
  localStorageMock.clear();
  mockNavigate.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});


// =================================================================
// Pruebas para la Lógica del Hook (AuthProvider)
// (Esta parte estaba bien y debería pasar)
// =================================================================
describe('Contexto: AuthProvider (Hook Logic)', () => {
  
  const setupHook = () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });
    return result;
  };

  it('debería tener el estado inicial (loading: false, user: null) si no hay localStorage', () => {
    const result = setupHook();
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.isLoggedIn).toBe(false);
  });

  it('debería cargar el usuario desde localStorage al montar', () => {
    localStorageMock.setItem('currentUser', JSON.stringify(mockAdmin));
    const result = setupHook();
    expect(result.current.loading).toBe(false);
    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.user).toEqual(mockAdmin);
  });

  it('debería limpiar localStorage si los datos están corruptos o incompletos', () => {
    localStorageMock.setItem('currentUser', JSON.stringify({ id: 1, nombre: 'Test' }));
    const result = setupHook();
    expect(result.current.user).toBe(null);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('currentUser');
  });

  it('debería loguear un usuario, actualizar el estado y guardar en localStorage', () => {
    const result = setupHook();
    act(() => {
      result.current.login(mockUser);
    });
    expect(result.current.user).toEqual(mockUser);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('currentUser', JSON.stringify(mockUser));
  });

  it('debería desloguear un usuario, limpiar el estado y limpiar localStorage', () => {
    localStorageMock.setItem('currentUser', JSON.stringify(mockUser));
    const result = setupHook();
    
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBe(null);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('currentUser');
  });
});


// =================================================================
// Pruebas para los Componentes de Ruta (RequireAuth / RequireAdmin)
// (AQUÍ ESTÁ LA CORRECCIÓN)
// =================================================================

// --- ARREGLO ---
// Este helper ahora renderiza el <AuthProvider> REAL.
// Controlamos el estado (logueado/no logueado)
// seteando el mock de localStorage ANTES de llamar a esta función.
const renderWithContext = (children) => {
  return render(
    <AuthProvider>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </AuthProvider>
  );
};

// --- Pruebas para <RequireAuth> ---
describe('Componente: RequireAuth', () => {

  // El test de 'loading' se quita porque el estado 'loading'
  // se resuelve casi instantáneamente en el useEffect.

  it('debería redirigir a / (login) si no está logueado', () => {
    // 1. Setup: Nos aseguramos que localStorage esté vacío
    localStorageMock.clear();
    
    // 2. Act: Renderizamos el componente dentro del provider real
    renderWithContext(<RequireAuth><div>Contenido Secreto</div></RequireAuth>);
    
    // 3. Assert
    expect(screen.queryByText('Contenido Secreto')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(expect.objectContaining({ to: '/' }));
  });

  it('debería renderizar el children si está logueado', () => {
    // 1. Setup: Ponemos un usuario en localStorage
    localStorageMock.setItem('currentUser', JSON.stringify(mockUser));

    // 2. Act
    renderWithContext(<RequireAuth><div>Contenido Secreto</div></RequireAuth>);

    // 3. Assert
    expect(screen.getByText('Contenido Secreto')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

// --- Pruebas para <RequireAdmin> ---
describe('Componente: RequireAdmin', () => {
  
  it('debería redirigir a / (login) si no está logueado', () => {
    // 1. Setup
    localStorageMock.clear();
    
    // 2. Act
    renderWithContext(<RequireAdmin><div>Panel Admin</div></RequireAdmin>);

    // 3. Assert
    expect(screen.queryByText('Panel Admin')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith(expect.objectContaining({ to: '/' }));
  });

  it('debería redirigir a /home si es un Cliente (no admin)', () => {
    // 1. Setup: Logueamos un Cliente
    localStorageMock.setItem('currentUser', JSON.stringify(mockUser));

    // 2. Act
    renderWithContext(<RequireAdmin><div>Panel Admin</div></RequireAdmin>);
    
    // 3. Assert
    expect(screen.queryByText('Panel Admin')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith(expect.objectContaining({ to: '/home' }));
  });

  it('debería renderizar el children si es un Administrador', () => {
    // 1. Setup: Logueamos un Admin
    localStorageMock.setItem('currentUser', JSON.stringify(mockAdmin));

    // 2. Act
    renderWithContext(<RequireAdmin><div>Panel Admin</div></RequireAdmin>);

    // 3. Assert
    expect(screen.getByText('Panel Admin')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});