import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/cartContext';
import { useAuth } from '../context/AuthContext';
import { FaMapMarkerAlt, FaHome, FaCreditCard, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { API_BASE } from '../lib/api.js';

const formatPrice = (price) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price || 0);

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const { cartItems, clearCart } = useContext(CartContext);
  
  const [boletaId, setBoletaId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Estados del formulario
  const [calle, setCalle] = useState('');
  const [depto, setDepto] = useState('');
  const [region, setRegion] = useState('');
  const [comuna, setComuna] = useState('');
  
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- TRUCO: Sincronizar dirección apenas cargue el usuario ---
  useEffect(() => {
    if (user && user.direccionDefault) {
      console.log("Cargando dirección del usuario:", user.direccionDefault);
      setCalle(prev => prev || user.direccionDefault.calle || '');
      setDepto(prev => prev || user.direccionDefault.depto || '');
      setRegion(prev => prev || user.direccionDefault.region || '');
      setComuna(prev => prev || user.direccionDefault.comuna || '');
    }
  }, [user]); // Se ejecuta cuando 'user' cambia o termina de cargar
  // -----------------------------------------------------------

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    if (!user) { navigate('/inicio'); return; }
    if (cartItems.length === 0 && !boletaId) { navigate('/carro'); }
  }, [user, cartItems, boletaId, navigate]);

  const total = useMemo(() => cartItems.reduce((s, it) => s + Number(it.precio)*Number(it.quantity), 0), [cartItems]);

  const handlePurchase = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!calle || !region || !comuna) {
      setError('Por favor completa los datos de envío.');
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        userId: user.email, 
        cartItems, 
        shippingAddress: { calle, depto, region, comuna },
        total
      };

      const resp = await fetch(`${API_BASE}/checkout/purchase`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error('Error al procesar');
      
      setBoletaId(data.boletaId);
      clearCart();
    } catch (err) {
      navigate('/checkout/rechazado', { state: { error: 'Error de conexión.' } });
    } finally { setIsProcessing(false); }
  };

  if (boletaId) {
    return (
      <div className="main-content container text-center" style={{paddingTop:'4rem'}}>
        <div className="card center-card" style={{maxWidth:'500px', margin:'0 auto'}}>
          <div style={{fontSize:'4rem', color:'#28a745', marginBottom:'1rem'}}><FaCheckCircle/></div>
          <h1 style={{color:'#28a745', margin:0}}>¡Compra Exitosa!</h1>
          <p style={{fontSize:'1.1rem', color:'#555'}}>Gracias por tu preferencia</p>
          
          <div style={{background:'#f1f9f1', padding:'1.5rem', borderRadius:'12px', margin:'2rem 0', border:'1px dashed #28a745'}}>
            <p style={{margin:0, fontSize:'0.9rem', color:'#555', textTransform:'uppercase', letterSpacing:'1px'}}>Orden N°</p>
            <h2 style={{margin:'5px 0 0', color:'#28a745', letterSpacing:'1px'}}>{boletaId}</h2>
          </div>
          <div style={{textAlign:'left', marginBottom:'2rem', padding:'0 1rem'}}>
            <h4 style={{margin:'0 0 10px'}}>Enviando a:</h4>
            <div style={{display:'flex', gap:10, alignItems:'center', color:'#555'}}>
               <FaMapMarkerAlt style={{color:'var(--brand)'}}/>
               <span>{calle} {depto}, {comuna}, {region}</span>
            </div>
          </div>
          <Link to="/" className="btn btn-primary btn-block">Seguir Comprando</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content container" style={{paddingBottom: isMobile ? 100 : '2rem'}}>
      <div style={{marginBottom:'2rem'}}>
         <Link to="/carro" style={{textDecoration:'none', color:'var(--muted)', fontWeight:600}}><FaArrowLeft/> Volver al Carrito</Link>
         <h1 style={{margin:'10px 0', color:'var(--brand)'}}>Finalizar Compra</h1>
      </div>

      <div className="grid" style={{ gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: '2rem' }}>
        
        {/* FORMULARIO */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display:'flex', alignItems:'center', gap:10 }}>
            <FaMapMarkerAlt style={{color:'var(--brand)'}}/> Datos de Envío
          </h3>
          
          {/* Aviso visual si cargó la dirección automática */}
          {user?.direccionDefault?.calle && !calle && (
             <div style={{fontSize:'0.9rem', color:'#666', fontStyle:'italic', marginBottom:10}}>Cargando tu dirección guardada...</div>
          )}

          {error && <div style={{color:'#dc3545', background:'#fff5f5', padding:10, borderRadius:8, marginBottom:'1rem'}}>{error}</div>}
          
          <form onSubmit={handlePurchase} style={{ display: 'grid', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Región</label><input className="form-control" value={region} onChange={e => setRegion(e.target.value)} placeholder="Ej: Metropolitana"/></div>
            <div className="form-group"><label className="form-label">Comuna</label><input className="form-control" value={comuna} onChange={e => setComuna(e.target.value)} placeholder="Ej: Providencia"/></div>
            <div className="form-group"><label className="form-label">Calle y Número</label><input className="form-control" value={calle} onChange={e => setCalle(e.target.value)} placeholder="Ej: Av. Siempre Viva 123"/></div>
            <div className="form-group"><label className="form-label">Depto (Opcional)</label><input className="form-control" value={depto} onChange={e => setDepto(e.target.value)} placeholder="Ej: 402B"/></div>
            
            <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
              <h4 style={{margin:'0 0 10px 0', display:'flex', alignItems:'center', gap:10}}><FaCreditCard/> Pago</h4>
              <div style={{padding:15, background:'#f8f9fa', borderRadius:8, color:'#555', fontSize:'0.9rem', border:'1px solid #eee'}}>
                 Tarjeta de Crédito / Débito (WebPay)
              </div>
            </div>
          </form>
        </div>

        {/* RESUMEN */}
        <div className="card" style={{ padding: '2rem', height: 'fit-content' }}>
          <h3 style={{ marginTop: 0 }}>Tu Pedido</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
            {cartItems.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent:'space-between', marginBottom: '10px', borderBottom: '1px dashed #eee', paddingBottom: '10px' }}>
                <div>
                   <div style={{fontWeight:600}}>{item.nombre}</div>
                   <small style={{color:'var(--muted)'}}>{item.quantity} x {formatPrice(item.precio)}</small>
                </div>
                <div style={{fontWeight:700}}>{formatPrice(item.precio * item.quantity)}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: '800', marginTop: '1rem', color:'var(--brand)' }}>
            <span>Total</span><span>{formatPrice(total)}</span>
          </div>
          {!isMobile && <button className="btn btn-primary btn-block" onClick={handlePurchase} disabled={isProcessing} style={{ marginTop: '1.5rem', fontSize: '1.1rem', padding: '12px' }}>{isProcessing ? 'Procesando...' : 'Pagar Ahora'}</button>}
        </div>
      </div>

      {isMobile && (
        <div style={{position:'fixed', bottom:0, left:0, right:0, background:'white', padding:'15px', boxShadow:'0 -4px 20px rgba(0,0,0,0.1)', zIndex:1000, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
           <div><small>Total a pagar</small><div style={{fontWeight:800, fontSize:'1.2rem', color:'var(--brand)'}}>{formatPrice(total)}</div></div>
           <button className="btn btn-primary" onClick={handlePurchase} disabled={isProcessing}>{isProcessing ? '...' : 'Pagar'}</button>
        </div>
      )}
    </div>
  );
}