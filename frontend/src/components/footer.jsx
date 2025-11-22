import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaHeart, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  // CAMBIO: Usamos 'user' directamente para saber si está logueado
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <footer className="footer" style={{ borderTop: '4px solid var(--brand)' }}>
      <div className="footer-inner container">
        
        {/* COLUMNA 1: MARCA */}
        <div className="footer-section">
          <h3 style={{ color: 'var(--brand)', fontSize: '1.4rem', marginBottom: '1rem' }}>
            Peluchemania
          </h3>
          <p style={{ lineHeight: '1.6', color: 'var(--muted)' }}>
            Tus amigos suaves te esperan para darte los mejores abrazos. 
            Calidad y ternura garantizada.
          </p>
        </div>

        {/* COLUMNA 2: NAVEGACIÓN */}
        <div className="footer-section">
          <h3 style={{ marginBottom: '1rem' }}>Explora</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Inicio</Link></li>
            <li><Link to="/productos" style={{ textDecoration: 'none', color: 'inherit' }}>Productos</Link></li>
            <li><Link to="/categorias" style={{ textDecoration: 'none', color: 'inherit' }}>Categorías</Link></li>
            <li><Link to="/ofertas" style={{ textDecoration: 'none', color: '#d63031', fontWeight: 'bold' }}>Ofertas</Link></li>
            <li><Link to="/blog" style={{ textDecoration: 'none', color: 'inherit' }}>Blog</Link></li>
          </ul>
        </div>

        {/* COLUMNA 3: CONTACTO Y SOCIAL */}
        <div className="footer-section">
          <h3 style={{ marginBottom: '1rem' }}>Síguenos</h3>
          
          <div className="social" style={{ display: 'flex', gap: '15px', fontSize: '1.2rem', marginBottom: '1rem' }}>
            <a href="#" aria-label="Facebook" style={{ color: '#3b5998' }}><FaFacebookF /></a>
            <a href="#" aria-label="Instagram" style={{ color: '#E1306C' }}><FaInstagram /></a>
            <a href="#" aria-label="Twitter" style={{ color: '#1DA1F2' }}><FaTwitter /></a>
          </div>
          
          <p className="mb-2" style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            contacto@peluchemania.cl
          </p>

          {/* INFO DE SESIÓN PEQUEÑA EN EL FOOTER */}
          {user && (
            <div style={{ 
              marginTop: '1rem', 
              paddingTop: '1rem', 
              borderTop: '1px dashed #ddd',
              fontSize: '0.85rem'
            }}>
              <span style={{ display: 'block', marginBottom: '5px', color: 'var(--text)' }}>
                Hola, <strong>{user.nombre || user.email}</strong>
              </span>
              <button 
                onClick={handleLogout} 
                style={{ 
                  background: 'none', border: 'none', 
                  color: '#dc3545', cursor: 'pointer', 
                  padding: 0, fontWeight: '600',
                  display: 'flex', alignItems: 'center', gap: '5px'
                }}
              >
                <FaSignOutAlt size={12} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BARRA INFERIOR */}
      <div style={{ 
        textAlign: 'center', 
        padding: '1.5rem', 
        background: '#f8f9fa', 
        marginTop: '2rem',
        fontSize: '0.9rem',
        color: '#aaa'
      }}>
        <p style={{ margin: 0 }}>
          &copy; {new Date().getFullYear()} Peluchemania. Hecho con <FaHeart style={{ color: '#e25555', margin: '0 3px' }} /> por Estudiantes Duoc.
        </p>
      </div>
    </footer>
  );
};

export default Footer;