import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Nosotros from '../src/paginas/nosotros'; // Asegúrate que la ruta sea correcta

// --- Helper para renderizar con el Router ---
const renderComponent = () => {
  render(
    <MemoryRouter>
      <Nosotros />
    </MemoryRouter>
  );
};

// --- Suite de Pruebas ---
describe('Componente: Nosotros (nosotros.jsx)', () => {

  it('debería renderizar el contenido estático de la página "Nosotros"', () => {
    renderComponent();

    // 1. Verificar el título principal (H1)
    expect(screen.getByRole('heading', {
      level: 1,
      name: /nuestra historia: el origen de peluchemania/i
    })).toBeInTheDocument();

    // 2. Verificar los subtítulos (H2)
    expect(screen.getByRole('heading', {
      level: 2,
      name: /nuestra promesa de calidad/i
    })).toBeInTheDocument();
    
    expect(screen.getByRole('heading', {
      level: 2,
      name: /visión a futuro/i
    })).toBeInTheDocument();

    // 3. Verificar que partes clave del texto estén presentes
    
    // --- ARREGLO AQUÍ ---
    // Usamos una función matcher que es más específica.
    expect(screen.getByText((content, element) => {
      // 1. Solo nos interesan los párrafos <p>. Ignoramos los <div>, <main>, etc.
      if (element.tagName.toLowerCase() !== 'p') {
        return false;
      }

      // 2. Obtenemos todo el texto del <p>
      const elementText = element.textContent;
      // 3. Reemplazamos todos los espacios/saltos de línea por un solo espacio
      const normalizedText = elementText.replace(/\s+/g, ' ');
      // 4. Buscamos "fundada en 2015" en el texto normalizado
      return /fundada en 2015/i.test(normalizedText);
    })).toBeInTheDocument();
    
    // Estos funcionan bien porque el texto no está roto por otros tags
    expect(screen.getByText(/materiales hipoalergénicos y duraderos/i)).toBeInTheDocument();
    expect(screen.getByText(/gracias por ser parte de nuestra suave y adorable aventura/i)).toBeInTheDocument();
  });

});