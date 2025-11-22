// __test__/productos.test.jsx

import { render, screen, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Productos from '../src/paginas/productos.jsx'

// --- 1. MOCK CHILD COMPONENT ---
vi.mock('../src/components/ProductCard/productCard.jsx', () => ({
  default: ({ producto }) => (
    <div data-testid={`product-card-${producto.id}`}>
      Mock ProductCard: {producto.nombre}
    </div>
  )
}));

// --- 2. MOCK DATA ---
const mockCategories = [
  { id: 1, nombre: 'Osos de Peluche' },
  { id: 2, nombre: 'Animales Fantásticos' }
];
const mockProducts = [
  { id: 101, nombre: 'Oso Clásico', categoria_id: 1, imagen_url: '/osito.jpg', precio: 19990 },
  { id: 102, nombre: 'Oso Panda', categoria_id: 1, imagen: '/panda.jpg', precio: 18990 },
  { id: 103, nombre: 'Unicornio Mágico', categoria_id: 2, imagen_url: '/unicornio.jpg', precio: 24990 },
  { id: 104, nombre: 'Conejo Saltarin', categoria_id: null, imagen: '/conejo.jpg', precio: 15990 },
];

// --- 3. MOCK API ---
beforeEach(() => {
  vi.spyOn(global, 'fetch').mockImplementation((url) => {
    if (url.includes('/api/categorias')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: mockCategories }),
      });
    }
    if (url.includes('/api/productos')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: mockProducts }),
      });
    }
    return Promise.reject(new Error(`Unhandled API call: ${url}`));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// --- 4. RENDER HELPER ---
const renderProductosPage = () => {
  render(
    <MemoryRouter>
      <Productos />
    </MemoryRouter>
  );
};

// --- 5. TESTS ---
describe('Página Productos', () => {

  test('1. Muestra el estado de carga inicial', () => {
    renderProductosPage();
    expect(screen.getByText('Cargando productos y categorías...')).toBeInTheDocument();
  });

  test('2. Muestra productos agrupados por categoría después de cargar', async () => {
    renderProductosPage();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Osos de Peluche' })).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: 'Todos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Osos de Peluche' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Animales Fantásticos' })).toBeInTheDocument();
    const ososSection = screen.getByRole('heading', { name: 'Osos de Peluche' }).closest('section');
    expect(ososSection).toHaveTextContent('Mock ProductCard: Oso Clásico');
    expect(ososSection).toHaveTextContent('Mock ProductCard: Oso Panda');
    expect(ososSection).not.toHaveTextContent('Mock ProductCard: Unicornio Mágico');
    const fantasticosSection = screen.getByRole('heading', { name: 'Animales Fantásticos' }).closest('section');
    expect(fantasticosSection).toHaveTextContent('Mock ProductCard: Unicornio Mágico');
    expect(fantasticosSection).not.toHaveTextContent('Mock ProductCard: Oso Clásico');
    expect(fantasticosSection).not.toHaveTextContent('Mock ProductCard: Conejo Saltarin');
    const otrosSection = screen.getByRole('heading', { name: 'Otros' }).closest('section');
    expect(otrosSection).toHaveTextContent('Mock ProductCard: Conejo Saltarin');
    expect(otrosSection).not.toHaveTextContent('Mock ProductCard: Oso Clásico');
  });

  test('3. Muestra mensaje de error si falla la carga de categorías', async () => {
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.includes('/api/categorias')) {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Error simulado de categorías' }),
        });
      }
      if (url.includes('/api/productos')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockProducts }),
        });
      }
      return Promise.reject(new Error(`Unhandled API call: ${url}`));
    });

    renderProductosPage();

    await waitFor(() => {
      // 👇 CORRECCIÓN 1: Usamos getAllByText y verificamos que no esté vacío
      const errorMessages = screen.getAllByText('Error simulado de categorías');
      expect(errorMessages.length).toBeGreaterThan(0); // Asegura que al menos un mensaje está
    });

    expect(screen.queryByText(/Mock ProductCard:/i)).not.toBeInTheDocument();
  });

  test('4. Muestra mensaje de error si falla la carga de productos', async () => {
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.includes('/api/categorias')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockCategories }),
        });
      }
      if (url.includes('/api/productos')) {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Error simulado de productos' }),
        });
      }
      return Promise.reject(new Error(`Unhandled API call: ${url}`));
    });

    renderProductosPage();

    await waitFor(() => {
      // 👇 CORRECCIÓN 2: Usamos getAllByText
      const errorMessages = screen.getAllByText('Error simulado de productos');
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    expect(screen.queryByText(/Mock ProductCard:/i)).not.toBeInTheDocument();
  });

});