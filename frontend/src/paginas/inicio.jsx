import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { API_BASE } from '../lib/api.js';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({}); // Estado para errores de validación
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const e = {};
    // Permite solo los dominios específicos
    const emailRegex = /@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;

    if (!email) {
      e.email = 'El correo es obligatorio.';
    } else if (email.length > 100) {
      e.email = 'Máximo 100 caracteres.';
    } else if (!emailRegex.test(email)) {
      e.email = 'Solo se permiten correos de Duoc/Gmail.';
    }

    if (!password) {
      e.password = 'La contraseña es obligatoria.';
    } else if (password.length < 4 || password.length > 10) {
      e.password = 'Debe tener entre 4 y 10 caracteres.';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    if (!validateForm()) return; // Detener si la validación falla

    setIsLoading(true);

    try {
      const resp = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!resp.ok) {
        setServerError('Credenciales incorrectas o usuario no encontrado.');
        setIsLoading(false);
        return;
      }

      const data = await resp.json();
      const userData = data.usuario;

      login(userData, data.token);

      if (userData.rol === 'ADMIN' || userData.rol === 'ROLE_ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }

    } catch (err) {
      setServerError('No se pudo conectar con el servidor.');
      setIsLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      
      <div className="form-shell" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img src="/peluchemania.png" alt="Logo" style={{ width: '80px', height: 'auto', marginBottom: '1rem' }} />
          <h2 style={{ margin: 0, color: 'var(--brand)', fontWeight: 800 }}>Iniciar Sesión</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>Ingresa tus datos para continuar</p>
        </div>

        {serverError && <div className="server-error-message">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          
          {/* EMAIL */}
          <div className="form-group mb-3">
            <label className="form-label">Correo</label>
            <div className="input-icon-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                className="form-control"
                type="email"
                placeholder="ejemplo@duoc.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
                maxLength={100} // Máximo 100 caracteres
              />
            </div>
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          {/* PASSWORD CON OJO */}
          <div className="form-group mb-4">
            <label className="form-label">Contraseña</label>
            <div className="input-icon-wrapper">
              <FaLock className="input-icon" />
              <input
                className="form-control"
                type={showPassword ? "text" : "password"}
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                maxLength={10} // Máximo 10 caracteres
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', display: 'flex' }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <div className="error-message">{errors.password}</div>}
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

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
            <p style={{ marginBottom: '0.5rem', color: 'var(--muted)' }}>
              ¿Aún no tienes cuenta? <Link to="/registro" style={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'none' }}>Regístrate aquí</Link>
            </p>
          </div>
          
        </form>
      </div>
    </div>
  );
}