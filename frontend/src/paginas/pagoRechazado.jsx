import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTimesCircle, FaRedo, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';

const fmt = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Number(n || 0));

export default function PagoRechazado() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Valores por defecto para que no falle si entran directo
  const {
    items = [],
    total = 0,
    address = null,
    errorMessage = 'La transacción fue denegada por el banco.',
    attemptedAt = new Date().toISOString(),
  } = state || {};

  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="container">
        
        {/* TARJETA CENTRAL */}
        <div className="card center-card" style={{ maxWidth: '550px', margin: '0 auto', padding: '3rem 2rem', textAlign: 'center' }}>
          
          {/* ICONO ERROR */}
          <div style={{ color: '#dc3545', marginBottom: '1.5rem' }}>
            <FaTimesCircle size={80} />
          </div>

          <h1 style={{ color: '#dc3545', marginTop: 0, fontWeight: 800 }}>¡Pago Rechazado!</h1>
          
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Lo sentimos, no pudimos procesar tu compra.
          </p>

          {/* CAJA DE ERROR */}
          <div style={{ 
            background: '#fff5f5', 
            border: '1px solid #ffc9c9', 
            borderRadius: '12px', 
            padding: '1rem', 
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#c62828', fontSize: '0.95rem' }}>Detalle del error:</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#333' }}>{errorMessage}</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#999' }}>
              Fecha intento: {new Date(attemptedAt).toLocaleString()}
            </p>
          </div>

          {/* RESUMEN COMPACTO */}
          {items.length > 0 && (
            <div style={{ marginBottom: '2rem', textAlign: 'left', padding: '0 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #ddd', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--muted)' }}>Monto intentado:</span>
                <strong style={{ fontSize: '1.2rem' }}>{fmt(total)}</strong>
              </div>
              {address && (
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  Destino: {address.comuna}, {address.region}
                </div>
              )}
            </div>
          )}

          {/* BOTONES DE ACCIÓN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => navigate('/checkout')} 
              className="btn btn-primary" 
              style={{ padding: '12px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <FaRedo /> Intentar Nuevamente
            </button>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Link to="/carro" className="btn btn-ghost" style={{ justifyContent: 'center' }}>
                <FaShoppingCart style={{marginRight:5}}/> Carrito
              </Link>
              <Link to="/" className="btn btn-ghost" style={{ justifyContent: 'center' }}>
                <FaArrowLeft style={{marginRight:5}}/> Inicio
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}