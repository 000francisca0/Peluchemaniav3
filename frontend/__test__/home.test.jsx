// __test__/home.test.jsx

import { render, screen, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'

// ⚠️ ¡Importante! Tu componente usa <Link> y useNavigate,
// por lo que DEBE estar envuelto en un Router para las pruebas.
import { MemoryRouter } from 'react-router-dom'

// Importa el componente que vamos a probar
import Home from '../src/paginas/home.jsx'

// --- 1. DEFINICIÓN DE DATOS FALSOS (MOCKS) ---

const mockOfertas = [
  {
    id: 1,
    nombre: 'Peluche de Oferta 1',
    precio: 10000,
    discounted_price: 8000,
    discount_percentage: 0.2,
    imagen_url: '/peluche-oferta-1.jpg',
    descripcion: 'Descripción de la oferta 1'
  },
  {
    id: 2,
    nombre: 'Peluche de Oferta 2',
    precio: 5000,
    discounted_price: 4000,
    discount_percentage: 0.2,
    imagen_url: '/peluche-oferta-2.jpg',
    descripcion: 'Descripción de la oferta 2'
  }
]

const mockCategorias = [
  { id: 10, nombre: 'Osos de Peluche' },
  { id: 11, nombre: 'Animales Fantásticos' }
]

// --- 2. CONFIGURACIÓN DE MOCKS DE API ---

// Interceptamos 'fetch' antes de cada prueba
beforeEach(() => {
  vi.spyOn(global, 'fetch').mockImplementation((url) => {

    // Simula la API de productos en oferta
    if (url.includes('/api/productos/on-sale')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: mockOfertas }),
      })
    }

    // Simula la API de categorías
    if (url.includes('/api/categorias')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: mockCategorias }),
      })
    }

    // Para cualquier otra llamada no esperada
    return Promise.reject(new Error(`Llamada a API no simulada: ${url}`))
  })
})

// Limpiamos los mocks después de cada prueba
afterEach(() => {
  vi.restoreAllMocks()
})

// --- 3. FUNCIÓN DE AYUDA PARA RENDERIZAR ---

// Creamos esta función para no repetir <MemoryRouter> en cada test
const renderHome = () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  )
}

// --- 4. LOS TESTS ---

describe('Página Home', () => {

  test('1. muestra los estados de carga iniciales', () => {
    renderHome()

    // Verifica que ambos mensajes de carga aparezcan al inicio
    expect(screen.getByText('Cargando ofertas…')).toBeInTheDocument()
    expect(screen.getByText('Cargando categorías…')).toBeInTheDocument()
  })

  test('2. muestra productos en oferta y categorías al cargar exitosamente', async () => {
    renderHome()

    // Esperamos a que la UI se actualice después de los 'fetch'
    await waitFor(() => {
      // Busca el nombre del primer producto de oferta
      expect(screen.getByText('Peluche de Oferta 1')).toBeInTheDocument()
      // Busca el nombre de la primera categoría
      expect(screen.getByText('Osos de Peluche')).toBeInTheDocument()
    })

    // También podemos verificar que los "Cargando..." desaparecieron
    expect(screen.queryByText('Cargando ofertas…')).not.toBeInTheDocument()
    expect(screen.queryByText('Cargando categorías…')).not.toBeInTheDocument()
  })

  test('3. muestra el contenido estático del blog', () => {
    renderHome()

    // Esto no depende de la API, así que no necesita 'waitFor'
    expect(screen.getByText('Consejos para cuidar tus peluches')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Leer el artículo' })).toBeInTheDocument()
  })

  test('4. muestra mensajes de error si las APIs fallan', async () => {
    // Para este test, SOBREESCRIBIMOS el mock de 'fetch'
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.includes('/api/productos/on-sale')) {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Error de ofertas simulado' }),
        })
      }
      if (url.includes('/api/categorias')) {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Error de categorías simulado' }),
        })
      }
      return Promise.reject(new Error('URL no simulada'))
    })

    renderHome()

    // Esperamos a que aparezcan los mensajes de error
    await waitFor(() => {
      expect(screen.getByText('Error de ofertas simulado')).toBeInTheDocument()
      expect(screen.getByText('Error de categorías simulado')).toBeInTheDocument()
    })
  })

})