import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Blog from '../src/paginas/blog'; // Asegúrate que la ruta sea correcta

// --- Helper para renderizar con el Router ---
const renderComponent = () => {
  render(
    <MemoryRouter>
      <Blog />
    </MemoryRouter>
  );
};

// --- Suite de Pruebas ---
describe('Componente: Blog (blog.jsx)', () => {

  it('debería renderizar el título principal de la página', () => {
    renderComponent();
    
    expect(screen.getByRole('heading', {
      level: 1,
      name: /nuestro blog de peluches/i
    })).toBeInTheDocument();
  });

  it('debería renderizar la lista de artículos del blog', () => {
    renderComponent();

    // --- Verificar Artículo 1 ---
    
    // Verificar el título (H3)
    expect(screen.getByRole('heading', {
      level: 3,
      name: /guía de cuidado: cómo mantener tu peluche como nuevo/i
    })).toBeInTheDocument();

    // Verificar el resumen
    expect(screen.getByText(/consejos y trucos esenciales para la limpieza/i)).toBeInTheDocument();

    // --- Verificar Artículo 2 ---
    
    // Verificar el título (H3)
    expect(screen.getByRole('heading', {
      level: 3,
      name: /la historia del oso teddy: un clásico atemporal/i
    })).toBeInTheDocument();

    // Verificar el resumen
    expect(screen.getByText(/descubre el origen legendario del peluche más famoso/i)).toBeInTheDocument();
  });

  it('debería tener los links correctos para cada artículo', () => {
    renderComponent();

    // Para encontrar el link, buscamos por "role: link" y su "nombre accesible",
    // que es el texto del título que contiene.
    
    // Verificar Link 1
    const link1 = screen.getByRole('link', { name: /guía de cuidado/i });
    expect(link1).toHaveAttribute('href', '/blog/cuidado-de-peluches');

    // Verificar Link 2
    const link2 = screen.getByRole('link', { name: /la historia del oso teddy/i });
    expect(link2).toHaveAttribute('href', '/blog/historia-oso-teddy');
  });

});