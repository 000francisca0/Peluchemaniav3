// __test__/categorias.test.jsx

import { render, screen, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom' // Needed for <Link>

// Import the component to test
import Categorias from '../src/paginas/categorias.jsx'

// --- 1. MOCK DATA ---
const mockCategories = [
  { id: 1, nombre: 'Osos de Peluche' },
  { id: 2, nombre: 'Animales Fantásticos' },
  { id: 3, nombre: 'Vida Marina' }
];

// --- 2. MOCK API ---
beforeEach(() => {
  vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ data: mockCategories }),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// --- 3. RENDER HELPER ---
const renderCategoriasPage = () => {
  render(
    <MemoryRouter>
      <Categorias />
    </MemoryRouter>
  );
};

// --- 4. TESTS ---
describe('Página Categorias', () => {

  test('1. Muestra estado de carga inicial', () => {
    renderCategoriasPage();
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  test('2. Muestra la lista de categorías después de cargar', async () => {
    renderCategoriasPage();

    // Wait for loading to finish (check for a category name)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Osos de Peluche' })).toBeInTheDocument();
    });

    // Check main title
    expect(screen.getByRole('heading', { name: 'Categorías' })).toBeInTheDocument();

    // Check if all category links are rendered
    expect(screen.getByRole('link', { name: 'Osos de Peluche' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Animales Fantásticos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Vida Marina' })).toBeInTheDocument();

    // Check if the links point to the correct URLs
    const osoLink = screen.getByRole('link', { name: 'Osos de Peluche' });
    expect(osoLink).toHaveAttribute('href', '/categoria/1');

    const fantasticoLink = screen.getByRole('link', { name: 'Animales Fantásticos' });
    expect(fantasticoLink).toHaveAttribute('href', '/categoria/2');

    const marinoLink = screen.getByRole('link', { name: 'Vida Marina' });
    expect(marinoLink).toHaveAttribute('href', '/categoria/3');
  });

  test('3. Muestra mensaje si la API falla', async () => {
    // Override fetch mock for this test
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false, // Simulate failure
      json: async () => ({ error: 'API Error' }), // Simulate error message (though your code doesn't use it)
    });

    renderCategoriasPage();

    // Wait for loading to finish. Since the API failed, cats will be [],
    // so the loading indicator will disappear but no categories will render.
    // We'll check that the loading text is gone and no category links are present.
    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    // Ensure no category links were rendered
    expect(screen.queryByRole('link', { name: /.+/ })).not.toBeInTheDocument();
     // Check that the main heading is still there
    expect(screen.getByRole('heading', { name: 'Categorías' })).toBeInTheDocument();
  });
});