import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from '../src/paginas/inicio'; 
import { API_BASE } from '../src/lib/api.js'; // <-- 1. IMPORTAR API_BASE

// --- Mocks ---
const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(), 
  };
});

const mockLogin = vi.fn();
vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// --- Helper para renderizar ---
const renderComponent = (locationState = null) => {
  mockUseLocation.mockReturnValue({
    state: locationState,
    pathname: '/',
  });

  render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );
};

// --- Configuración Global ---
beforeEach(() => {
  mockNavigate.mockClear();
  mockLogin.mockClear();
  mockUseLocation.mockClear();
  vi.spyOn(global, 'fetch').mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// --- Suite de Pruebas ---
describe('Componente: LoginForm (inicio.jsx)', () => {

  // ... (los tests 'renderizar', 'campos vacíos', 'Ingresando...' quedan igual) ...
  it('debería renderizar el formulario de inicio de sesión correctamente', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    // ...
  });

  it('debería mostrar error de validación si los campos están vacíos', async () => {
    renderComponent();
    const user = userEvent.setup();
    const submitButton = screen.getByRole('button', { name: /ingresar/i });
    await user.click(submitButton);
    expect(await screen.findByText(/correo y contraseña son obligatorios/i)).toBeInTheDocument();
    // ...
  });

   it('debería mostrar "Ingresando..." y deshabilitar el botón durante la carga', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      new Promise(resolve =>
        setTimeout(() =>
          resolve({ ok: true, json: async () => ({ user: { rol: 'Cliente' } }) }),
        100)
      )
    );
    renderComponent();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/correo/i), 'test@test.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'pass123');
    const submitButton = screen.getByRole('button', { name: /ingresar/i });
    await user.click(submitButton);
    expect(submitButton).toBeDisabled();
    // ...
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
  });


  // --- Helper ---
  const fillValidForm = async (user) => {
    await user.type(screen.getByLabelText(/correo/i), 'cliente@test.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'cliente123');
  };

  it('debería loguear a un Cliente, llamar a context.login y navegar a /home', async () => {
    const fakeUser = { id: 1, email: 'cliente@test.com', rol: 'Cliente' };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ user: fakeUser }),
    });

    renderComponent();
    const user = userEvent.setup();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      // 👇 2. USAR API_BASE AQUÍ
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/auth/login`, 
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'cliente@test.com', password: 'cliente123' }),
        })
      );
    });

    expect(mockLogin).toHaveBeenCalledWith(fakeUser);
    expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true });
  });

  // ... (los tests 'Administrador', 'redirigir', 'credenciales incorrectas', 'error de red' quedan igual) ...
  it('debería loguear a un Administrador y navegar a /admin', async () => {
    const fakeAdmin = { id: 2, email: 'admin@test.com', rol: 'Administrador' };
     vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ user: fakeAdmin }),
    });
    renderComponent();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/correo/i), 'admin@test.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'admin123');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith(fakeAdmin));
    expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
  });
  
  it('debería redirigir a la página previa (ej. /carrito) si venía de allí', async () => {
     const fakeUser = { id: 1, rol: 'Cliente' };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ user: fakeUser }),
    });
    const fromLocation = { from: { pathname: '/carrito' } };
    renderComponent(fromLocation);
    const user = userEvent.setup();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /ingresar/i }));
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith(fakeUser));
    expect(mockNavigate).toHaveBeenCalledWith('/carrito', { replace: true });
  });

  it('debería mostrar error si las credenciales son incorrectas (fetch ok: false)', async () => {
     vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Credenciales incorrectas.' }),
    });
    renderComponent();
    const user = userEvent.setup();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /ingresar/i }));
    expect(await screen.findByText(/credenciales incorrectas/i)).toBeInTheDocument();
    // ...
  });

  it('debería mostrar error de conexión si fetch es rechazado (error de red)', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Failed to fetch'));
    renderComponent();
    const user = userEvent.setup();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /ingresar/i }));
    expect(await screen.findByText(/no se pudo conectar con el servidor/i)).toBeInTheDocument();
    // ...
  });
});