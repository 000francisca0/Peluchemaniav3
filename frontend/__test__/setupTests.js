// __test__/setupTests.js
import '@testing-library/jest-dom'

// 👇 AÑADE ESTO
// Mock global para window.matchMedia, que no existe en jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false, // Simula 'desktop' por defecto
    media: query,
    onchange: null,
    addListener: vi.fn(), // obsoleto
    removeListener: vi.fn(), // obsoleto
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})