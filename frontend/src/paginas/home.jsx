import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE } from '../lib/api.js';

const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });
const fmt = (n) => CLP.format(Number(n || 0));

// Helper para elegir la foto de la categoría
const getCatImage = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('osos')) return '/osito.jpg';
  if (n.includes('fantas')) return '/unicornio.jpg';
  if (n.includes('animal')) return '/conejo.jpg'; 
  return '/osito.jpg'; 
};

// Hook para el carrusel automático
function useAutoSlide(length, delay = 4000) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % length);
    }, delay);
    return () => clearInterval(timerRef.current);
  }, [length, delay]);

  const goto = (i) => setIndex(((i % length) + length) % length);
  const next = () => goto(index + 1);
  const prev = () => goto(index - 1);

  const pause = () => timerRef.current && clearInterval(timerRef.current);
  const resume = () => {
    if (length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % length);
    }, delay);
  };

  return { index, goto, next, prev, pause, resume };
}

export default function Home() {
  const [onSale, setOnSale] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingSale, setLoadingSale] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);
  const navigate = useNavigate();

  // 1. Cargar Productos (SOLO OFERTAS REALES)
  useEffect(() => {
    (async () => {
      try {
        setLoadingSale(true);
        const res = await fetch(`${API_BASE}/productos`);
        const json = await res.json();
        
        // FILTRO REAL: Solo productos con onSale = true en la Base de Datos
        const ofertasReales = (json || []).filter(p => p.onSale === true);

        const data = ofertasReales.map(p => {
          const precioOriginal = Number(p.precio || 0);
          const discount = p.discountPercentage || 0;
          
          return {
            id: p.id,
            nombre: p.nombre,
            descripcion: p.descripcion,
            precio: precioOriginal,
            imagen: p.urlImagen || '/osito.jpg',
            discountPercentage: discount,
            // Calculamos el precio real basado en el descuento de la BD
            finalPrice: Math.round(precioOriginal * (1 - discount))
          };
        });
        setOnSale(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSale(false);
      }
    })();
  }, []);

  // 2. Cargar Categorías
  useEffect(() => {
    (async () => {
      try {
        setLoadingCats(true);
        const res = await fetch(`${API_BASE}/categorias`);
        const json = await res.json();
        setCategories(json || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingCats(false);
      }
    })();
  }, []);

  const { index, goto, next, prev, pause, resume } = useAutoSlide(onSale.length, 4500);
  const current = useMemo(() => onSale[index] || null, [onSale, index]);

  return (
    <main className="main-content">
      <div className="container">

        {/* ===================== HERO / CAROUSEL ===================== */}
        <section className="card" style={{ overflow: 'hidden', marginBottom: 40 }}>
          <div className="card-body" style={{ paddingBottom: 0 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 10 }}>
              <h1 style={{ margin: 0, color: 'var(--brand)', fontSize: '1.8rem' }}>¡Ofertas del Corazón!</h1>
              <Link to="/ofertas" className="btn btn-primary">Ver todas las ofertas</Link>
            </header>
          </div>

          <div onMouseEnter={pause} onMouseLeave={resume} style={{ position: 'relative' }}>
            <div className="home-hero-grid">
              
              {/* IMAGEN (Controlada para que no sea gigante) */}
              <div className="card home-hero-media" style={{ 
                  margin: 0, 
                  overflow: 'hidden', 
                  display: 'flex', 
                  // Esto limita la altura en PC para que no se vuelva loca
                  maxHeight: '400px', 
                  minHeight: '300px',
                  backgroundColor: '#fff', // Fondo blanco limpio para que contraste con la foto
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #f0f0f0'
              }}>
                {loadingSale ? (
                  <div className="card-body center-card">Cargando ofertas...</div>
                ) : current ? (
                  <button onClick={() => navigate(`/producto/${current.id}`)} style={{ border: 'none', padding: 0, background: 'transparent', cursor: 'pointer', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={current.imagen} 
                      alt={current.nombre} 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%', 
                        objectFit: 'contain' // 'contain' muestra la foto entera sin cortarla. Usa 'cover' si prefieres llenar todo el cuadro.
                      }} 
                    />
                  </button>
                ) : (
                  <div className="card-body center-card" style={{ flexDirection: 'column' }}>
                    <p style={{fontSize: '1.2rem', color: 'var(--muted)'}}>No hay ofertas activas hoy.</p>
                    <Link to="/productos" className="btn btn-ghost">Ver catálogo normal</Link>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="card" style={{ margin: 0, display: 'flex', justifyContent: 'center', border: 'none', boxShadow: 'none' }}>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
                  {current ? (
                    <>
                      <h2 className="card-title" style={{ fontSize: '2.2rem', marginBottom: 0 }}>{current.nombre}</h2>
                      <p className="card-sub" style={{ fontSize: '1.1rem' }}>
                        {current.descripcion ? current.descripcion.substring(0, 100) + '...' : 'Descripción no disponible.'}
                      </p>
                      
                      <div style={{ display: 'flex', gap: 15, alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ textDecoration: 'line-through', color: 'var(--muted)', fontSize: '1.2rem' }}>
                          {fmt(current.precio)}
                        </span>
                        <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--brand)' }}>
                          {fmt(current.finalPrice)}
                        </span>
                        {current.discountPercentage > 0 && (
                           <span style={{ padding: '5px 12px', background: '#d63031', color: 'white', borderRadius: 20, fontWeight: 700 }}>
                             -{Math.round(current.discountPercentage * 100)}% OFF
                           </span>
                        )}
                      </div>
                      
                      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                        <Link className="btn btn-primary" to={`/producto/${current.id}`} style={{ padding: '10px 25px', fontSize: '1.1rem' }}>
                          ¡Lo quiero!
                        </Link>
                        <Link className="btn btn-ghost" to={`/producto/${current.id}`}>Ver detalle</Link>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Controles (Solo si hay más de 1 oferta) */}
            {onSale.length > 1 && (
              <>
                <button className="btn btn-ghost" onClick={prev} style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', borderRadius: '50%', width: 40, height: 40, background: 'rgba(255,255,255,0.8)', display: 'grid', placeItems: 'center', zIndex: 2 }}>‹</button>
                <button className="btn btn-ghost" onClick={next} style={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', borderRadius: '50%', width: 40, height: 40, background: 'rgba(255,255,255,0.8)', display: 'grid', placeItems: 'center', zIndex: 2 }}>›</button>
              </>
            )}
          </div>
        </section>

        {/* ===================== CATEGORÍAS ===================== */}
        <section style={{ marginBottom: 40 }}>
          <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
            <div className="card-body">
              <h2 style={{ margin: 0, color: 'var(--text)' }}>Explora por Categoría</h2>
              <p className="card-sub">Encuentra rápidamente tu peluche ideal.</p>
            </div>
          </div>

          {loadingCats ? (
            <p className="text-center">Cargando categorías...</p>
          ) : (
            <div className="grid">
              {categories.map(c => {
                const imgCat = getCatImage(c.nombre);
                return (
                  <Link
                    key={c.id}
                    to={`/categoria/${c.id}`}
                    className="card hover-effect"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{ height: '200px', overflow: 'hidden' }}>
                      <img 
                        src={imgCat} 
                        alt={c.nombre} 
                        className="w-100 h-100"
                        style={{ objectFit: 'cover', transition: 'transform 0.3s' }} 
                      />
                    </div>
                    <div className="card-body" style={{ textAlign: 'center' }}>
                      <h3 className="card-title" style={{ marginBottom: 0 }}>{c.nombre}</h3>
                      <p className="card-sub" style={{ marginBottom: 0 }}>Ver colección</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ===================== BLOG ===================== */}
        <section>
          <div className="card">
            <div className="card-body home-blog-grid">
              <div>
                <h2 style={{ marginTop: 0, marginBottom: 10, color: 'var(--text)' }}>Consejos para cuidar tus peluches</h2>
                <p className="card-sub" style={{ marginBottom: 20, fontSize: '1.1rem' }}>
                  Aprende técnicas fáciles para mantener a tus amigos suaves como nuevos.
                  Limpieza, secado y almacenamiento correcto.
                </p>
                <Link to="/blog/cuidado-de-peluches" className="btn btn-primary">Leer artículo</Link>
              </div>
              
              <img
                src="/conejo.jpg" 
                alt="Cuidado de peluches"
                className="card-media"
                style={{ height: 250, objectFit: 'cover', borderRadius: 12 }}
                onError={(e) => e.target.src = 'https://via.placeholder.com/400?text=Blog'}
              />
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}