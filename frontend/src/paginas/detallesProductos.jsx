import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CartContext } from '../context/cartContext';
import { API_BASE } from '../lib/api.js';

export default function DetallesProductos() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext); // O useCart() si actualizaste el context

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const fmt = (n) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Number(n || 0));

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/productos/${id}`);
        if (!res.ok) throw new Error('Producto no encontrado');
        const data = await res.json();

        // --- LÓGICA DE OFERTA UNIFICADA ---
        // Si el ID es 1, 2 o 3 -> Aplicamos 20% de descuento
        const isSale = Number(data.id) <= 3;
        const discountPct = isSale ? 0.20 : 0;
        
        const precioBase = Number(data.precio);
        const precioFinal = Math.round(precioBase * (1 - discountPct));

        const mainImage = data.urlImagen || '/osito.jpg'; 
        const imgs = [mainImage]; 

        const productoAdaptado = {
          id: data.id,
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: precioBase,     // Precio original
          finalPrice: precioFinal, // Precio con descuento ya calculado
          stock: Number(data.stock),
          images: imgs,
          imagen: mainImage,
          // Flags para el renderizado
          discount_percentage: discountPct,
          on_sale: isSale ? 1 : 0 
        };

        setProducto(productoAdaptado);
        setSelectedImage(imgs[0]);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <main className="main-content"><div className="container center-card" style={{marginTop:'4rem'}}>Cargando...</div></main>;
  if (error) return <main className="main-content"><div className="container center-card"><h3 style={{color:'red'}}>{error}</h3><Link to="/productos" className="btn btn-primary mt-3">Volver</Link></div></main>;

  const hasDiscount = producto.on_sale === 1;

  const handleAddToCart = () => {
    addToCart({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.finalPrice, // ¡Importante! Al carrito va el precio final
      imagen: producto.imagen,
      stock: producto.stock
    });
  };

  return (
    <main className="main-content">
      <div className="container">
        <div style={{ marginBottom: '1rem' }}>
             <Link to="/productos" style={{ textDecoration: 'none', color: 'var(--muted)', fontWeight: 600 }}>← Volver al catálogo</Link>
        </div>

        <article className="card">
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, alignItems: 'start' }}>
              
              {/* Galería */}
              <div>
                <div className="card" style={{ border: '1px solid #eee', overflow: 'hidden' }}>
                  <img src={selectedImage} alt={producto.nombre} className="card-media" style={{ height: '400px', objectFit: 'contain', backgroundColor: '#fafafa' }} />
                </div>
              </div>

              {/* Info */}
              <div>
                <h1 style={{ marginTop: 0, fontSize: '2.2rem', color: 'var(--text)' }}>{producto.nombre}</h1>
                <p className="card-sub" style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>{producto.descripcion}</p>

                {/* Precios */}
                <div style={{ display: 'flex', gap: 15, alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
                  {hasDiscount ? (
                    <div>
                      <div style={{ color: 'var(--muted)', textDecoration: 'line-through', fontSize: '1.1rem' }}>
                        {fmt(producto.precio)}
                      </div>
                      <div style={{ fontWeight: 800, color: '#d63031', fontSize: '2rem' }}>
                        {fmt(producto.finalPrice)}
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand)' }}>
                      {fmt(producto.precio)}
                    </span>
                  )}

                  {hasDiscount && (
                    <span style={{ padding: '6px 12px', background: '#d63031', color: 'white', borderRadius: 20, fontWeight: 700, fontSize: '0.9rem' }}>
                      -{Math.round(producto.discount_percentage * 100)}% OFF
                    </span>
                  )}
                </div>

                <p style={{ marginTop: 12 }}>
                    <strong>Disponibilidad: </strong> 
                    <span style={{ color: producto.stock > 0 ? '#27ae60' : '#c0392b', fontWeight: 700 }}>
                        {producto.stock > 0 ? `En Stock (${producto.stock})` : 'Agotado'}
                    </span>
                </p>

                <div style={{ marginTop: 30 }}>
                  <button className="btn btn-primary" onClick={handleAddToCart} disabled={producto.stock <= 0} style={{ padding: '12px 30px', width: '100%' }}>
                    {producto.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}