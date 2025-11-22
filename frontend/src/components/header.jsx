import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/cartContext'; 
import { useAuth } from '../context/AuthContext';
import { BsCart4, BsPersonCircle, BsGearFill, BsBoxArrowRight, BsList, BsX } from 'react-icons/bs';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const { cartItems } = useCart();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Verificamos rol (ajustado a Spring Boot)
  const isAdmin = user?.rol === 'ADMIN' || user?.rol === 'ROLE_ADMIN';

  const handleLinkClick = () => setMenuOpen(false);
  
  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const linkStyle = {
    textDecoration: 'none',
    color: '#2c3e50',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'color 0.2s',
    display: 'flex',
    alignItems: 'center'
  };

  return (
    <>
      <div style={{ height: '80px' }}></div>

      <header className="header-fixed" style={{ 
        height: '80px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 5%', 
        backgroundColor: '#fff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        zIndex: 1000
      }}>
        
        {/* --- LOGO --- */}
        <div className="header-left" style={{ flexShrink: 0 }}>
          <Link to="/" onClick={handleLinkClick}>
            <img src="/peluchemania.png" alt="Logo" style={{ height: '60px', display: 'block' }} />
          </Link>
        </div>

        {/* --- NAV DESKTOP --- */}
        <nav className="nav hidden-sm" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/" style={linkStyle}>Inicio</Link>
          <Link to="/productos" style={linkStyle}>Productos</Link>
          <Link to="/categorias" style={linkStyle}>Categorías</Link>
          <Link to="/ofertas" style={{...linkStyle, color: '#d63031'}}>Ofertas</Link>
          <Link to="/nosotros" style={linkStyle}>Nosotros</Link>
          <Link to="/blog" style={linkStyle}>Blog</Link>
        </nav>

        {/* --- CONTROLES DERECHA --- */}
        <div className="right-controls" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          
          <div className="auth-links hidden-sm" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {!user ? (
              <>
                <Link to="/inicio" className="btn btn-ghost" style={{ padding: '8px 16px', borderRadius: '20px' }}>
                  Iniciar Sesión
                </Link>
                <Link to="/registro" className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '20px' }}>
                  Regístrate
                </Link>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                
                {/* Nombre Usuario */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand)', fontWeight: '700', marginRight: '5px' }}>
                  <BsPersonCircle size={18} />
                  <span>{user.nombre || 'Usuario'}</span>
                </div>

                {/* BOTÓN ADMIN MEJORADO */}
                {isAdmin && (
                  <Link to="/admin" style={{
                    textDecoration: 'none',
                    background: '#fff3f3', // Fondo suave color marca
                    color: 'var(--brand)',
                    border: '1px solid var(--brand)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}>
                    <BsGearFill size={14} /> Admin
                  </Link>
                )}

                {/* Botón Salir con Texto */}
                <button onClick={handleLogout} style={{
                  border: '1px solid #dc3545',
                  background: 'transparent',
                  color: '#dc3545',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  Salir <BsBoxArrowRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Carrito */}
          <Link to="/carro" className="cart-link" style={{ position: 'relative', color: '#333', fontSize: '1.4rem' }}>
            <BsCart4 />
            {totalItems > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-10px',
                background: '#d63031', color: 'white',
                borderRadius: '50%', width: '20px', height: '20px',
                fontSize: '0.75rem', fontWeight: 'bold',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {totalItems}
              </span>
            )}
          </Link>

          {/* Móvil Toggle */}
          <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#333' }}>
            {menuOpen ? <BsX /> : <BsList />}
          </button>
        </div>
      </header>

      {/* Menú Móvil */}
      {menuOpen && (
        <div className="mobile-nav" style={{
          position: 'fixed', top: '80px', left: 0, right: 0,
          background: 'white', padding: '20px',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
          display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 999
        }}>
          <Link to="/" onClick={handleLinkClick} style={linkStyle}>Inicio</Link>
          <Link to="/productos" onClick={handleLinkClick} style={linkStyle}>Productos</Link>
          <Link to="/categorias" onClick={handleLinkClick} style={linkStyle}>Categorías</Link>
          <Link to="/ofertas" onClick={handleLinkClick} style={{...linkStyle, color: '#d63031'}}>Ofertas</Link>
          
          <div style={{ borderTop: '1px solid #eee', margin: '5px 0' }}></div>

          {user ? (
            <>
              <div style={{ fontWeight: 'bold', color: 'var(--brand)' }}>Hola, {user.email}</div>
              {isAdmin && (
                <Link to="/admin" onClick={handleLinkClick} style={{...linkStyle, color: 'var(--brand)'}}>
                  <BsGearFill style={{marginRight:'8px'}}/> Ir al Panel de Admin
                </Link>
              )}
              <button onClick={handleLogout} style={{ ...linkStyle, color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <BsBoxArrowRight style={{marginRight:'8px'}}/> Cerrar sesión
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/inicio" onClick={handleLinkClick} className="btn btn-ghost" style={{textAlign:'center'}}>Iniciar sesión</Link>
              <Link to="/registro" onClick={handleLinkClick} className="btn btn-primary" style={{textAlign:'center'}}>Regístrate</Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Header;