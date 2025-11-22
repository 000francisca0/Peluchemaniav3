import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../lib/api.js';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);

export default function Sales() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/productos`);
        const data = await res.json();
        
        // 1. FILTRO REAL: Solo los que marcaste como "En oferta" en el Admin
        const ofertasReales = (data || []).filter(p => p.onSale === true);
        
        // 2. Mapeamos los datos reales de la BD
        const listos = ofertasReales.map(p => {
          const originalPrice = Number(p.precio || 0);
          const discountPct = p.discountPercentage || 0; // Usamos el descuento real de la BD
          
          return {
            ...p,
            imagen: p.urlImagen || '/osito.jpg',
            originalPrice: originalPrice,
            discountPercentage: discountPct,
            // Calculamos el precio final real
            finalPrice: Math.round(originalPrice * (1 - discountPct))
          };
        });

        setItems(listos);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="main-content container text-center" style={{ padding: '4rem 0' }}>
        <h2 style={{ color: 'var(--muted)' }}>Buscando las mejores ofertas...</h2>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ color: '#d63031', fontWeight: 800, marginBottom: '0.5rem' }}>
            🔥 Ofertas Especiales
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>
            Precios rebajados seleccionados para ti
          </p>
        </div>

        {items.length === 0 ? (
          <div className="center-card">
            <h3>No hay ofertas activas por el momento.</h3>
            <p style={{color:'var(--muted)'}}>Revisa nuestro catálogo general para más opciones.</p>
            <Link to="/productos" className="btn btn-primary" style={{marginTop:'1rem'}}>Ver todos los productos</Link>
          </div>
        ) : (
          <div className="grid">
            {items.map(p => (
              <div key={p.id} className="card">
                
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <img 
                    className="card-media" 
                    src={p.imagen} 
                    alt={p.nombre} 
                    style={{ height: '220px' }}
                    onError={(e) => e.target.src = 'https://via.placeholder.com/300?text=Sin+Imagen'}
                  />
                  <span style={{ 
                    position: 'absolute', top: 10, right: 10, 
                    background: '#d63031', color: 'white',
                    padding: '4px 10px', borderRadius: '20px', 
                    fontWeight: 700, fontSize: '0.85rem'
                  }}>
                    -{Math.round(p.discountPercentage * 100)}%
                  </span>
                </div>

                <div className="card-body">
                  <h3 className="card-title">{p.nombre}</h3>
                  
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ color: 'var(--muted)', textDecoration: 'line-through', fontSize: '0.95rem' }}>
                      {formatPrice(p.originalPrice)}
                    </div>
                    <div style={{ fontWeight: 800, color: '#d63031', fontSize: '1.4rem' }}>
                      {formatPrice(p.finalPrice)}
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <Link to={`/producto/${p.id}`} className="btn btn-primary" style={{ width: '100%', backgroundColor: '#d63031', border: 'none' }}>
                    Ver Oferta
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