// __test__/categoria.test.jsx

import { render, screen, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom' // Needed for useParams

// Import the component to test
import Categoria from '../src/paginas/categoria.jsx'

// --- 1. MOCK CHILD COMPONENT ---
vi.mock('../src/components/ProductCard/productCard.jsx', () => ({
  default: ({ producto }) => (
    <div data-testid={`product-card-${producto.id}`}>
      Mock ProductCard: {producto.nombre}
    </div>
  )
}));

// --- 2. MOCK DATA ---
// Products specifically for category '1'
const mockProductsCategory1 = [
  { id: 101, nombre: 'Oso Clásico', categoria_id: 1, imagen_url: '/osito.jpg', precio: 19990 },
  { id: 102, nombre: 'Oso Panda', categoria_id: 1, imagen: '/panda.jpg', precio: 18990 },
];

// Empty array for category '2'
const mockProductsCategory2 = [];

// --- 3. MOCK API ---
beforeEach(() => {
  vi.spyOn(global, 'fetch').mockImplementation((url) => {
    // Mock API for category 1
    if (url.includes('/api/productos/category/1')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: mockProductsCategory1 }),
      });
    }
    // Mock API for category 2 (no products)
    if (url.includes('/api/productos/category/2')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: mockProductsCategory2 }),
      });
    }
    // Mock API for category 99 (error)
    if (url.includes('/api/productos/category/99')) {
      return Promise.resolve({
        ok: false,
        json: async () => ({ error: 'Error simulado de categoría' }),
      });
    }
    return Promise.reject(new Error(`Unhandled API call: ${url}`));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// --- 4. RENDER HELPER ---
// Renders the component within routes to simulate the URL param
const renderCategoriaPage = (categoryId) => {
  render(
    <MemoryRouter initialEntries={[`/categoria/${categoryId}`]}>
      <Routes>
        {/* The path MUST match how you define it in your main App router */}
        <Route path="/categoria/:categoryId" element={<Categoria />} />
      </Routes>
    </MemoryRouter>
  );
};

// --- 5. TESTS ---
describe('Página Categoria', () => {

  test('1. Muestra estado de carga inicial', () => {
    renderCategoriaPage(1);
    expect(screen.getByText('Cargando productos...')).toBeInTheDocument();
  });

  test('2. Muestra el título y productos para la categoría 1', async () => {
    renderCategoriaPage(1); // Render with categoryId = 1

    // Wait for loading to finish
    await waitFor(() => {
      // Check for a product specific to category 1
      expect(screen.getByText('Mock ProductCard: Oso Clásico')).toBeInTheDocument();
    });

    // Check the title reflects the categoryId from the URL
    expect(screen.getByRole('heading', { name: 'Categoría 1' })).toBeInTheDocument();

    // Check that both products for category 1 are rendered
    expect(screen.getByText('Mock ProductCard: Oso Clásico')).toBeInTheDocument();
    expect(screen.getByText('Mock ProductCard: Oso Panda')).toBeInTheDocument();
  });

  test('3. Muestra mensaje "No hay productos" para la categoría 2', async () => {
    renderCategoriaPage(2); // Render with categoryId = 2

    // Wait for loading to finish (the "No hay productos" message appears after loading)
    await waitFor(() => {
      expect(screen.getByText('No hay productos en esta categoría.')).toBeInTheDocument();
    });

    // Check the title
    expect(screen.getByRole('heading', { name: 'Categoría 2' })).toBeInTheDocument();

    // Ensure no product cards were rendered
    expect(screen.queryByText(/Mock ProductCard:/i)).not.toBeInTheDocument();
  });

  test('4. Muestra mensaje de error si la API falla para categoría 99', async () => {
    renderCategoriaPage(99); // Render with categoryId = 99

    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText('Error simulado de categoría')).toBeInTheDocument();
    });

    // Check the title
    expect(screen.getByRole('heading', { name: 'Categoría 99' })).toBeInTheDocument();

    // Ensure no product cards were rendered
    expect(screen.queryByText(/Mock ProductCard:/i)).not.toBeInTheDocument();
  });

});