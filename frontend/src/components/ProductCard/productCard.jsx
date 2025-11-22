// src/components/ProductCard/productCard.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/cartContext';

function ProductCard({ producto }) {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const goToDetails = () => navigate(`/producto/${producto.id}`);

  const formatPrice = (n) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Number(n || 0));

  const hasDiscount = (producto.discount_percentage || 0) > 0;
  const finalPrice = hasDiscount ? (producto.discounted_price ?? Math.round(producto.precio * (1 - producto.discount_percentage))) : producto.precio;

  return (
    <article className="card" role="article" aria-label={producto.nombre}>
      {/* Clickable media */}
      <button
        onClick={goToDetails}
        style={{ border: 'none', padding: 0, background: 'transparent', cursor: 'pointer' }}
        aria-label={`Ver detalles de ${producto.nombre}`}
      >
        <img src={producto.imagen || producto.imagen_url} alt={producto.nombre} className="card-media" />
      </button>

      {/* body */}
      <div className="card-body">
        <h3 className="card-title">{producto.nombre}</h3>

        {/* Price with discount */}
        {hasDiscount ? (
          <div>
            <div className="card-sub" style={{ textDecoration: 'line-through' }}>
              {formatPrice(producto.precio)}
            </div>
            <div style={{ fontWeight: 800, color: 'var(--brand)', fontSize: '1.1rem' }}>
              {formatPrice(finalPrice)}
            </div>
          </div>
        ) : (
          <p className="card-sub" style={{ fontWeight: 800 }}>{formatPrice(producto.precio)}</p>
        )}
      </div>

      {/* actions */}
      <div className="card-actions">
        <button type="button" className="btn btn-ghost" onClick={goToDetails}>
          Ver Detalle
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => addToCart({
            ...producto,
            precio: finalPrice, // ensure discounted price is added to cart
            imagen: producto.imagen || producto.imagen_url
          })}
        >
          Agregar
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
