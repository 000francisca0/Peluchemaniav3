import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Importamos los iconos necesarios (Sobre, Candado, Ojo Abierto, Ojo Cerrado)
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { API_BASE } from '../lib/api.js';

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para ver/ocultar contraseña
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!email || !password) {
      setServerError('Por favor completa todos los campos.');
      return;
    }

    setIsLoading(true);

    try {
      const resp = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!resp.ok) {
        setServerError('Correo o contraseña incorrectos.');
        setIsLoading(false);
        return;
      }

      // Login Exitoso
      const token = await resp.text();
      
      // Decodificamos para saber el rol
      const payloadBase64 = token.split('.')[1];
      const decodedUser = JSON.parse(atob(payloadBase64));

      const userData = {
        email: decodedUser.sub,
        rol: decodedUser.rol,
        token: token
      };
      
      login(userData, token);

      // Redirección inteligente
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      if (decodedUser.rol === 'ROLE_ADMIN' || decodedUser.rol === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }

    } catch (err) {
      console.error(err);
      setServerError('Error de conexión con el servidor.');
      setIsLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      
      <div className="form-shell" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem' }}>
        
        {/* LOGO CENTRADO */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img 
            src="/peluchemania.png" 
            alt="Peluchemania Logo" 
            style={{ width: '80px', height: 'auto', marginBottom: '1rem' }}
          />
          <h2 style={{ margin: 0, color: 'var(--brand)', fontWeight: 800 }}>¡Hola de nuevo!</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>Ingresa tus datos para continuar</p>
        </div>

        {/* MENSAJE DE ERROR */}
        {serverError && (
          <div style={{ 
            background: '#fff3f3', color: '#d63031', 
            padding: '10px', borderRadius: '8px', 
            fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem',
            border: '1px solid #ffc9c9'
          }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          
          {/* EMAIL */}
          <div className="form-group mb-3">
            <label className="form-label" htmlFor="loginEmail" style={{ fontSize: '0.9rem' }}>Correo Electrónico</label>
            <div className="input-icon-wrapper" style={{ position: 'relative' }}>
              <FaEnvelope style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', zIndex: 1 }} />
              <input
                id="loginEmail"
                type="email"
                className="form-control"
                placeholder="nombre@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }} // Espacio para el icono
              />
            </div>
          </div>

          {/* PASSWORD CON OJO */}
          <div className="form-group mb-4">
            <label className="form-label" htmlFor="loginPassword" style={{ fontSize: '0.9rem' }}>Contraseña</label>
            <div className="input-icon-wrapper" style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', zIndex: 1 }} />
              
              <input
                id="loginPassword"
                type={showPassword ? "text" : "password"} // Aquí cambiamos el tipo
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px', paddingRight: '40px' }} // Espacio para iconos ambos lados
              />

              {/* Botón OJO */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)',
                  display: 'flex', alignItems: 'center'
                }}
                tabIndex="-1" // Para no seleccionarlo con TAB antes que el submit
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          {/* BOTÓN SUBMIT */}
          <div className="d-grid gap-2">
            <button 
              type="submit" 
              className="btn btn-primary btn-block" 
              disabled={isLoading}
              style={{ padding: '12px', fontSize: '1rem', boxShadow: '0 4px 12px rgba(255, 160, 122, 0.4)' }}
            >
              {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </div>

          {/* LINKS */}
          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
            <p style={{ marginBottom: '0.5rem', color: 'var(--muted)' }}>
              ¿Aún no tienes cuenta? <Link to="/registro" style={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'none' }}>Regístrate aquí</Link>
            </p>
            <Link to="/" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.85rem' }}>
              ← Volver al inicio
            </Link>
          </div>
          
        </form>
      </div>
    </div>
  );
}