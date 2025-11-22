// __test__/detallesProductos.test.jsx

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { CartContext } from '../src/context/cartContext'
import DetallesProductos from '../src/paginas/detallesProductos.jsx'

// --- 1. MOCKS ---
const mockProducto = {
  id: 1,
  nombre: 'Peluche Detalle 1',
  descripcion: 'Descripción detallada del peluche',
  precio: 10000,
  discount_percentage: 0.3,
  discounted_price: 7000,
  stock: 5,
  images: ['/img1.jpg', '/img2.jpg'],
  imagen: '/img1.jpg'
}
const mockProductoSinStock = {
  ...mockProducto,
  id: 2,
  nombre: 'Peluche Agotado',
  stock: 0,
}

// --- 2. CONFIGURACIÓN ---
const mockAddToCart = vi.fn()

beforeEach(() => {
  mockAddToCart.mockClear()
  vi.spyOn(global, 'fetch').mockImplementation((url) => {
    if (url.includes('/api/productos/1/details')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: mockProducto }),
      })
    }
    if (url.includes('/api/productos/2/details')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: mockProductoSinStock }),
      })
    }
    if (url.includes('/api/productos/99/details')) {
      return Promise.resolve({
        ok: false,
        json: async () => ({ error: 'Producto no existe' }),
      })
    }
    return Promise.reject(new Error(`API no simulada: ${url}`))
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

// --- 3. FUNCIÓN RENDER ---
const renderDetalles = (productoId) => {
  render(
    <CartContext.Provider value={{ addToCart: mockAddToCart }}>
      <MemoryRouter initialEntries={[`/producto/${productoId}`]}>
        <Routes>
          <Route path="/producto/:id" element={<DetallesProductos />} />
        </Routes>
      </MemoryRouter>
    </CartContext.Provider>
  )
}

// --- 4. LOS TESTS ---
describe('Página DetallesProductos', () => {

  test('1. muestra "Cargando..." inicialmente', () => {
    renderDetalles(1)
    expect(screen.getByText('Cargando producto...')).toBeInTheDocument()
  })

  test('2. muestra los detalles del producto y el precio con descuento', async () => {
    renderDetalles(1)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Peluche Detalle 1' })).toBeInTheDocument()
    })
    expect(screen.getByText('Descripción detallada del peluche')).toBeInTheDocument()
    expect(screen.getByText('$10.000')).toBeInTheDocument()
    expect(screen.getByText('$7.000')).toBeInTheDocument()
    
    // 👇 ESTRATEGIA CORREGIDA (Test 2)
    // 1. Busca el tag <strong> que dice "Stock:"
    const stockLabel = screen.getByText('Stock:');
    // 2. Comprueba el texto de su padre <p>
    expect(stockLabel.parentElement).toHaveTextContent(/Stock:\s*5/i);
  })

  test('3. llama a addToCart cuando se hace clic en el botón', async () => {
    renderDetalles(1)
    const boton = await screen.findByRole('button', { name: 'Agregar al carrito' })
    fireEvent.click(boton)
    expect(mockAddToCart).toHaveBeenCalledTimes(1)
    expect(mockAddToCart).toHaveBeenCalledWith({
      id: 1,
      nombre: 'Peluche Detalle 1',
      precio: 7000,
      imagen: '/img1.jpg',
      stock: 5,
    })
  })

  test('4. muestra "Sin stock" y deshabilita el botón si el stock es 0', async () => {
    renderDetalles(2)
    const boton = await screen.findByRole('button', { name: 'Sin stock' })
    
    // 👇 ESTRATEGIA CORREGIDA (Test 4)
    // 1. Busca el tag <strong> que dice "Stock:"
    const stockLabel = screen.getByText('Stock:');
    // 2. Comprueba el texto de su padre <p>
    expect(stockLabel.parentElement).toHaveTextContent(/Stock:\s*0/i);
    
    expect(boton).toBeDisabled()
  })

  test('5. muestra un mensaje de error si la API falla', async () => {
    renderDetalles(99)
    await waitFor(() => {
      expect(screen.getByText('Producto no existe')).toBeInTheDocument()
    })
  })
})