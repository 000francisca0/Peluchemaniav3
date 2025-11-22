import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE } from '../lib/api';

const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

export default function CategoriaDetalle() {
  const { id } = useParams(); 
  const [productos, setProductos] = useState([]);
  const [nombreCategoria, setNombreCategoria] = useState('Cargando...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        // 1. Nombre de Categoría
        const resCat = await fetch(`${API_BASE}/categorias`);
        if (resCat.ok) {
          const categorias = await resCat.json();
          const encontrada = categorias.find(c => Number(c.id) === Number(id));
          setNombreCategoria(encontrada ? encontrada.nombre : 'Categoría desconocida');
        }

        // 2. Productos (Probamos endpoint específico o fallback)
        let data = [];
        const resProd = await fetch(`${API_BASE}/productos/categoria/${id}`);
        if (resProd.ok) {
          data = await resProd.json();
        } else {
          const resAll = await fetch(`${API_BASE}/productos`);
          const allData = await resAll.json();
          data = allData.filter(p => p.categoria && Number(p.categoria.id) === Number(id));
        }

        // 3. MAPEO CON REGLA DE OFERTAS
        const listos = data.map(p => {
          const precioNum = Number(p.precio || 0);
          // REGLA: Los productos con ID 1, 2 y 3 tienen 20% de descuento
          const esOferta = p.id <= 3; 
          const dcto = esOferta ? 0.20 : 0;

          return {
            ...p,
            imagen: p.urlImagen || '/osito.jpg',
            precioOriginal: precioNum,
            precioFinal: Math.round(precioNum * (1 - dcto)),
            esOferta: esOferta,
            porcentaje: dcto
          };
        });
        
        setProductos(listos);

      } catch (err) {
        console.error(err);
        setNombreCategoria('Error');
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [id]);

  if (loading) return <div className="main-content container text-center" style={{padding:'4rem'}}>Cargando...</div>;

  return (
    <div className="main-content">
      <div className="container">
        
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--text)', fontWeight: 800 }}>
            Colección: <span style={{ color: 'var(--brand)' }}>{nombreCategoria}</span>
          </h2>
          <Link to="/categorias" style={{ color: 'var(--muted)', textDecoration: 'none' }}>← Volver</Link>
        </div>
        
        {productos.length === 0 ? (
          <div className="center-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>No hay productos aquí todavía.</h3>
            <Link to="/productos" className="btn btn-primary mt-3">Ver catálogo</Link>
          </div>
        ) : (
          <div className="grid">
            {productos.map(p => (
              <div key={p.id} className="card hover-effect">
                
                <div style={{ position: 'relative', overflow: 'hidden', height: '220px' }}>
                  <img 
                    src={p.imagen} alt={p.nombre} className="card-media" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                    onError={(e) => e.target.src = 'https://via.placeholder.com/300?text=Sin+Imagen'}
                  />
                  {/* ETIQUETA DE OFERTA */}
                  {p.esOferta && (
                    <span style={{ 
                      position: 'absolute', top: 10, right: 10, 
                      background: '#d63031', color: 'white',
                      padding: '4px 10px', borderRadius: '20px', 
                      fontWeight: 700, fontSize: '0.8rem'
                    }}>
                      -{p.porcentaje * 100}% OFF
                    </span>
                  )}
                </div>

                <div className="card-body">
                  <h3 className="card-title">{p.nombre}</h3>
                  
                  {/* PRECIOS DINÁMICOS */}
                  <div style={{ marginTop: '0.5rem' }}>
                    {p.esOferta ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ textDecoration: 'line-through', color: 'var(--muted)', fontSize: '0.9rem' }}>
                          {CLP.format(p.precioOriginal)}
                        </span>
                        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#d63031' }}>
                          {CLP.format(p.precioFinal)}
                        </span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)' }}>
                        {CLP.format(p.precioFinal)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-actions">
                  <Link to={`/producto/${p.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                    Ver Detalle
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}