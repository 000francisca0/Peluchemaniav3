import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sales from '../src/paginas/ofertas'; // Asegúrate que la ruta sea correcta

// --- Mock de datos ---
const mockOffers = [
  {
    id: 1,
    nombre: 'Oso Gigante en Oferta',
    imagen_url: 'http://example.com/oso.png',
    precio: 20000,
    discounted_price: 15000,
    discount_percentage: 0.25,
  },
  {
    id: 2,
    nombre: 'Conejo Saltador con Descuento',
    imagen_url: 'http://example.com/conejo.png',
    precio: 10000,
    discounted_price: 8000,
    discount_percentage: 0.20,
  }
];

// --- Helper para renderizar ---
const renderComponent = () => {
  render(
    <MemoryRouter>
      <Sales />
    </MemoryRouter>
  );
};

// --- Configuración Global de Mocks ---
beforeEach(() => {
  vi.spyOn(global, 'fetch').mockClear();
  // Mockeamos console.error para silenciarlo en el test de error
  vi.spyOn(console, 'error').mockImplementation(() => {}); 
});

afterEach(() => {
  vi.restoreAllMocks();
});


// --- Suite de Pruebas ---
describe('Componente: Sales (ofertas.jsx)', () => {

  it('debería mostrar el estado de "Cargando ofertas…" inicialmente', () => {
    // Simulamos un fetch que nunca se resuelve para probar el estado de carga
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
    
    renderComponent();

    expect(screen.getByText(/cargando ofertas…/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /ofertas/i })).not.toBeInTheDocument();
  });

  it('debería mostrar "No hay productos en oferta" si fetch retorna un array vacío', async () => {
    // 1. Mock de fetch con respuesta vacía
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });

    renderComponent();

    // 2. Esperar que "Cargando..." desaparezca
    await waitFor(() => {
      expect(screen.queryByText(/cargando ofertas…/i)).not.toBeInTheDocument();
    });

    // 3. Verificar que se muestra el título y el mensaje de vacío
    expect(screen.getByRole('heading', { name: /ofertas/i })).toBeInTheDocument();
    expect(screen.getByText(/no hay productos en oferta por el momento/i)).toBeInTheDocument();
  });

  it('debería renderizar la lista de productos en oferta si fetch retorna datos', async () => {
    // 1. Mock de fetch con datos
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockOffers }),
    });

    renderComponent();

    // 2. Esperar que aparezca un producto
    expect(await screen.findByText('Oso Gigante en Oferta')).toBeInTheDocument();

    // 3. Verificar que los elementos de carga/vacío NO están
    expect(screen.queryByText(/cargando ofertas…/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no hay productos en oferta/i)).not.toBeInTheDocument();

    // 4. Verificar contenido del Producto 1 (Oso)
    expect(screen.getByText('Conejo Saltador con Descuento')).toBeInTheDocument();
    // Usamos regex para los precios por el formateo de 'es-CL' ($ 20.000)
    expect(screen.getByText(/\$\s*20.000/i)).toBeInTheDocument();
    expect(screen.getByText(/\$\s*15.000/i)).toBeInTheDocument();
    expect(screen.getByText(/descuento: 25%/i)).toBeInTheDocument();

    // 5. Verificar contenido del Producto 2 (Conejo)
    expect(screen.getByText(/\$\s*10.000/i)).toBeInTheDocument();
    expect(screen.getByText(/\$\s*8.000/i)).toBeInTheDocument();
    expect(screen.getByText(/descuento: 20%/i)).toBeInTheDocument();

    // 6. Verificar imágenes y links
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('src', 'http://example.com/oso.png');
    expect(images[0]).toHaveAttribute('alt', 'Oso Gigante en Oferta');

    expect(screen.getByRole('link', { name: /oso gigante/i })).toHaveAttribute('href', '/producto/1');
    expect(screen.getByRole('link', { name: /conejo saltador/i })).toHaveAttribute('href', '/producto/2');
  });

  it('debería mostrar "No hay productos en oferta" si el fetch falla (es rechazado)', async () => {
    // 1. Mock de fetch con error de red
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Error de red'));

    renderComponent();

    // 2. Esperar que "Cargando..." desaparezca
    await waitFor(() => {
      expect(screen.queryByText(/cargando ofertas…/i)).not.toBeInTheDocument();
    });

    // 3. Verificar que se muestra el estado vacío (comportamiento de "finally")
    expect(screen.getByText(/no hay productos en oferta por el momento/i)).toBeInTheDocument();
    
    // 4. Verificar que el error fue capturado y logueado
    expect(console.error).toHaveBeenCalled();
  });

});