import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from '../src/paginas/registro';
import { API_BASE } from '../src/lib/api.js';

// Mockear 'react-router-dom'
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// --- Helper para renderizar ---
const renderComponent = () => {
  return render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>
  );
};

// --- Configuración Global de Mocks ---
beforeEach(() => {
  mockNavigate.mockClear();
  vi.spyOn(global, 'fetch').mockClear();
  vi.spyOn(window, 'alert').mockImplementation(() => {});
  // Asegurémonos de que siempre usemos timers reales por defecto
  vi.useRealTimers(); 
});

afterEach(() => {
  vi.restoreAllMocks();
});


// --- Suite de Pruebas ---
describe('Componente: RegisterForm', () => {
  
  const setupUser = () => userEvent.setup();

  // ... (los tests 'renderizar', 'validación vacío', 'contraseñas no coinciden', 'cargar comunas' quedan igual) ...
  it('debería renderizar el formulario correctamente', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/tu nombre/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ejemplo@duoc.cl/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/región/i)).toBeInTheDocument(); 
    expect(screen.getByLabelText(/comuna/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarme/i })).toBeInTheDocument();
  });

  it('debería mostrar errores de validación al enviar el formulario vacío', async () => {
    renderComponent();
    const user = setupUser();
    const submitButton = screen.getByRole('button', { name: /registrarme/i });
    await user.click(submitButton);
    expect(await screen.findByText(/el nombre es requerido/i)).toBeInTheDocument();
    // ... otros expects de validación
  });

  it('debería mostrar un error si las contraseñas no coinciden', async () => {
    renderComponent();
    const user = setupUser();
    await user.type(screen.getByLabelText(/^contraseña/i), 'pass123');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'pass456');
    await user.click(screen.getByRole('button', { name: /registrarme/i }));
    expect(await screen.findByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
  });

  it('debería cargar comunas al seleccionar una región y resetearla al cambiar', async () => {
    renderComponent();
    const user = setupUser();
    const regionSelect = screen.getByLabelText(/región/i);
    const comunaSelect = screen.getByLabelText(/comuna/i);
    await user.selectOptions(regionSelect, 'Región Metropolitana de Santiago');
    expect(comunaSelect).toBeEnabled();
    // ... otros expects de comunas
  });


  // --- Helper para llenar formulario ---
  const fillValidForm = async (user) => {
    await user.type(screen.getByPlaceholderText(/tu nombre/i), 'Usuario');
    await user.type(screen.getByPlaceholderText(/tus apellidos/i), 'Prueba');
    await user.type(screen.getByPlaceholderText(/ejemplo@duoc.cl/i), 'test@test.com');
    await user.selectOptions(screen.getByLabelText(/región/i), 'Región Metropolitana de Santiago'); 
    const comunaSelect = await screen.findByLabelText(/comuna/i); // Espera a que aparezca/se habilite
    await user.selectOptions(comunaSelect, 'Providencia');
    await user.type(screen.getByPlaceholderText(/ej: av. vicuña mackenna 4860/i), 'Calle Falsa 123');
    await user.type(screen.getByLabelText(/^contraseña/i), 'pass1234'); 
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'pass1234'); 
  };


  it('debería registrar al usuario, mostrar mensaje y navegar al inicio (/)', async () => {
    // SIN fake timers
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Usuario registrado exitosamente' }),
    });
    
    renderComponent();
    const user = setupUser(); 

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /registrarme/i }));

    // Verificar fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/auth/register`, expect.anything());
    });

    // Verificar mensaje de éxito
    expect(await screen.findByText(/¡Registro exitoso! Redirigiendo/i)).toBeInTheDocument();
    
    // 👇 ESPERAR LA NAVEGACIÓN (que ocurre después de 1200ms)
    await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      }, 
      { timeout: 2000 } // Damos un margen extra (ej. 2 segundos)
    ); 
  });


  it('debería mostrar un mensaje de error del servidor si el registro falla...', async () => {
    // SIN fake timers
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'El correo ya está en uso' }),
    });

    renderComponent();
    const user = setupUser();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /registrarme/i }));

    expect(await screen.findByText(/el correo ya está en uso/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });


  it('debería mostrar un error de conexión si fetch es rechazado...', async () => {
    // SIN fake timers
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Failed to fetch'));
    
    renderComponent();
    const user = setupUser();
    
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /registrarme/i }));

    expect(await screen.findByText(/no se pudo conectar con el servidor/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});