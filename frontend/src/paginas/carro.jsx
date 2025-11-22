import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/cartContext';
import { useAuth } from '../context/AuthContext';
import { FaMapMarkerAlt, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';

function Carro() {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const { cartItems, addToCart, removeFromCart, removeItem } = useContext(CartContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const total = cartItems.reduce((sum, item) => sum + Number(item.precio || 0) * Number(item.quantity || 0), 0);

  const formatPrice = (price) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);

  const handleGoToCheckout = () => {
    if (!user) {
      if (isMobile) { alert('Inicia sesión para comprar.'); navigate('/inicio'); } 
      else { setNotice('Inicia sesión para continuar.'); }
      return;
    }
    if (cartItems.length === 0) { setNotice('Tu carrito está vacío.'); return; }
    navigate('/checkout');
  };

  // --- RESUMEN (Muestra la dirección si existe) ---
  const Summary = () => {
    // Aquí está la magia: Leemos la dirección del usuario
    const dir = user?.direccionDefault || {};
    const tieneDireccion = dir.calle && dir.comuna;

    return (
      <aside className="summary card">
        <h2 style={{marginTop:0}}>Resumen</h2>
        {notice && <div style={{padding:10, background:'#ffebee', color:'#c62828', borderRadius:8, marginBottom:10}}>{notice}</div>}
        
        <div style={{marginBottom:'1rem'}}>
          <h4 style={{margin:'0 0 10px 0', display:'flex', alignItems:'center', gap:6}}>
            <FaMapMarkerAlt style={{color:'var(--brand)'}}/> Envío
          </h4>
          
          {!user ? (
            <p style={{fontSize:'0.9rem', color:'var(--muted)'}}>Inicia sesión para ver tu dirección.</p>
          ) : tieneDireccion ? (
            <div style={{background:'#f8f9fa', padding:'10px', borderRadius:'8px', fontSize:'0.9rem', border:'1px solid #eee'}}>
              <strong>{dir.calle} {dir.depto}</strong><br/>
              {dir.comuna}, {dir.region}<br/>
              <span style={{color:'#2ecc71', fontSize:'0.8rem', fontWeight:700}}>✓ Dirección guardada</span>
            </div>
          ) : (
            <p style={{fontSize:'0.9rem', color:'var(--muted)'}}>Se solicitará en el siguiente paso.</p>
          )}
        </div>
        
        <div style={{display:'flex', justifyContent:'space-between', fontSize:'1.2rem', fontWeight:700, borderTop:'1px dashed #ddd', paddingTop:15}}>
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        
        <button className="btn btn-primary btn-block" onClick={handleGoToCheckout} style={{marginTop:15}} disabled={cartItems.length===0}>
          Ir a Pagar
        </button>
      </aside>
    );
  };

  // Barra Móvil
  const MobileSummaryBar = () => (
    <div style={{position:'fixed', bottom:0, left:0, right:0, background:'white', padding:'15px', boxShadow:'0 -4px 20px rgba(0,0,0,0.1)', display:'flex', justifyContent:'space-between', alignItems:'center', zIndex:1000}}>
      <div>
        <div style={{fontSize:'0.8rem', color:'#666'}}>Total a pagar</div>
        <div style={{fontSize:'1.2rem', fontWeight:'bold', color:'var(--brand)'}}>{formatPrice(total)}</div>
      </div>
      <button className="btn btn-primary" onClick={handleGoToCheckout} disabled={cartItems.length===0}>Pagar</button>
    </div>
  );

  return (
    <div className="main-content container" style={{paddingBottom: isMobile ? 100 : '2rem'}}>
      <h1 style={{color:'var(--brand)', marginBottom:'1.5rem'}}>Tu Carrito</h1>

      {cartItems.length === 0 ? (
        <div className="center-card">
          <h3>Tu carrito está vacío 😢</h3>
          <Link to="/productos" className="btn btn-primary" style={{marginTop:10}}>Ir a comprar</Link>
        </div>
      ) : (
        <div className="grid" style={{gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap:'2rem'}}>
          
          {/* LISTA ITEMS */}
          <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
            {cartItems.map((item) => (
              <div key={item.id} className="card" style={{padding:'1rem', flexDirection: isMobile ? 'column' : 'row', alignItems:'center', gap:15}}>
                <img src={item.imagen} style={{width:80, height:80, objectFit:'cover', borderRadius:8}} alt="prod"/>
                <div style={{flex:1, width:'100%'}}>
                  <h4 style={{margin:0}}>{item.nombre}</h4>
                  <p style={{margin:0, color:'var(--muted)', fontSize:'0.9rem'}}>{formatPrice(item.precio)} c/u</p>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:10, width: isMobile ? '100%' : 'auto', justifyContent:'space-between'}}>
                  <div style={{display:'flex', alignItems:'center', gap:5, background:'#f1f1f1', borderRadius:20, padding:'2px'}}>
                    <button onClick={()=>removeFromCart(item)} className="btn btn-ghost" style={{padding:'2px 8px', border:'none'}}><FaMinus size={10}/></button>
                    <span style={{fontWeight:700, minWidth:20, textAlign:'center'}}>{item.quantity}</span>
                    <button onClick={()=>addToCart(item)} className="btn btn-ghost" style={{padding:'2px 8px', border:'none'}}><FaPlus size={10}/></button>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontWeight:700}}>{formatPrice(item.precio * item.quantity)}</div>
                    <button onClick={()=>removeItem(item)} style={{background:'none', border:'none', color:'#dc3545', fontSize:'0.8rem', cursor:'pointer', padding:0}}>Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RESUMEN */}
          {!isMobile && <Summary />}
        </div>
      )}
      {isMobile && cartItems.length > 0 && <MobileSummaryBar />}
    </div>
  );
}
export default Carro;