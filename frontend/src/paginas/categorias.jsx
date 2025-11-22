import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../lib/api.js';

// Función auxiliar para asignar imagen local
const getImageFor = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('oso')) return '/osito.jpg';
  if (n.includes('fantas')) return '/unicornio.jpg';
  if (n.includes('animal')) return '/conejo.jpg'; // Asegúrate de tener esta foto o usa otra
  return '/peluchemania.png'; // Imagen por defecto
};

export default function Categorias() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/categorias`);
        const data = await res.json();
        setCats(res.ok ? (data || []) : []);
      } catch (err) {
        console.error("Error cargando categorías:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="main-content">
      <div className="container">
        
        <div className="card" style={{ marginBottom: 24, textAlign: 'center' }}>
          <div className="card-body">
            <h1 style={{ margin: 0, color: 'var(--brand)' }}>Categorías</h1>
            <p className="card-sub">Explora por tipo de peluche</p>
          </div>
        </div>

        {loading ? (
          <div className="card"><div className="card-body text-center"><p>Cargando...</p></div></div>
        ) : (
          <section className="grid">
            {cats.map((c) => {
              const imageSrc = getImageFor(c.nombre);
              
              return (
                <Link
                  key={c.id}
                  to={`/categoria/${c.id}`}
                  className="card hover-effect"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                    <img 
                      src={imageSrc} 
                      alt={c.nombre} 
                      className="w-100 h-100"
                      style={{ objectFit: 'cover', transition: 'transform 0.3s' }} 
                    />
                    {/* Overlay opcional para que el texto resalte */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }}></div>
                    <h3 
                        style={{ 
                            position: 'absolute', 
                            bottom: '10px', 
                            left: '0', 
                            right: '0', 
                            textAlign: 'center', 
                            color: 'white', 
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                            margin: 0
                        }}
                    >
                        {c.nombre}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}