import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../lib/api';
import { useCart } from '../context/cartContext'; 

const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { addToCart } = useCart(); 

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/productos`);
      const data = await response.json();

      const listos = data.map((p) => {
        const precioOriginal = Number(p.precio || 0);
        
        // --- LÓGICA REAL DE LA BASE DE DATOS ---
        // Ahora leemos directamente si el Admin lo marcó como oferta
        const esOferta = p.onSale === true;
        const descuento = p.discountPercentage || 0;
        
        // Calculamos el precio final real
        const precioFinal = esOferta ? Math.round(precioOriginal * (1 - descuento)) : precioOriginal;

        return {
          ...p,
          imagen: p.urlImagen || '/osito.jpg',
          precioOriginal: precioOriginal,
          precioFinal: precioFinal,
          esOferta: esOferta,
          porcentajeDescuento: descuento
        };
      });

      setProductos(listos);
    } catch (err) {
      console.error("Error cargando productos:", err);
    } finally {
      setLoading(false);
    }
  };

  // Agregar al carrito con el precio calculado
  const handleAdd = (producto) => {
    const itemParaCarrito = {
      ...producto,
      precio: producto.precioFinal 
    };
    addToCart(itemParaCarrito);
  };

  if (loading) {
    return (
      <div className="main-content container text-center" style={{ padding: '4rem 0' }}>
        <h2 style={{ color: 'var(--muted)' }}>Cargando catálogo...</h2>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="container">
        
        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ color: 'var(--brand)', fontWeight: 800, marginBottom: '0.5rem' }}>
            Nuestra Colección
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>
            Encuentra el compañero perfecto
          </p>
        </div>

        {productos.length === 0 ? (
          <div className="center-card">
            <p>No hay productos disponibles en este momento.</p>
          </div>
        ) : (
          /* Diseño Grid Responsivo */
          <div className="grid">
            {productos.map((p) => (
              <div key={p.id} className="card">
                
                {/* Imagen */}
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <img 
                    src={p.imagen} 
                    alt={p.nombre} 
                    className="card-media"
                    style={{ height: '220px' }} 
                    onError={(e) => e.target.src = 'https://via.placeholder.com/300?text=Sin+Imagen'}
                  />
                  
                  {/* Etiqueta SOLO si es Oferta Real */}
                  {p.esOferta && (
                    <span style={{ 
                      position: 'absolute', top: 10, right: 10, 
                      background: '#d63031', color: 'white',
                      padding: '4px 10px', borderRadius: '20px', 
                      fontWeight: 700, fontSize: '0.8rem'
                    }}>
                      -{Math.round(p.porcentajeDescuento * 100)}% OFF
                    </span>
                  )}
                </div>

                {/* Cuerpo */}
                <div className="card-body">
                  <h3 className="card-title">{p.nombre}</h3>
                  <p className="card-sub">
                    {p.descripcion ? p.descripcion.substring(0, 45) + '...' : 'Suave y tierno.'}
                  </p>
                  
                  {/* Precios Dinámicos */}
                  <div style={{ marginTop: '0.5rem' }}>
                    {p.esOferta ? (
                      // CASO OFERTA: Precio tachado + Nuevo
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ 
                          textDecoration: 'line-through', 
                          color: 'var(--muted)', 
                          fontSize: '0.9rem' 
                        }}>
                          {CLP.format(p.precioOriginal)}
                        </span>
                        <span style={{ 
                          fontSize: '1.3rem', 
                          fontWeight: 800, 
                          color: '#d63031' 
                        }}>
                          {CLP.format(p.precioFinal)}
                        </span>
                      </div>
                    ) : (
                      // CASO NORMAL
                      <div style={{ 
                        fontSize: '1.3rem', 
                        fontWeight: 800, 
                        color: 'var(--text)' 
                      }}>
                        {CLP.format(p.precioFinal)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="card-actions">
                  <Link to={`/producto/${p.id}`} className="btn btn-ghost" style={{ flex: 1 }}>
                    Ver Detalle
                  </Link>
                  
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1 }}
                    onClick={() => handleAdd(p)}
                  >
                    Agregar
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}