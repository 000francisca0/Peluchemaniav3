// src/paginas/registro.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaHome } from 'react-icons/fa';
import { API_BASE } from '../lib/api.js'; 

// ... (Tu objeto REGIONES_COMUNAS_CHILE va aquí) ...
const REGIONES_COMUNAS_CHILE = {
  "Región de Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
  "Región de Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Pica", "Huara", "Camiña", "Colchane"],
  "Región de Antofagasta": ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"],
  "Región de Atacama": ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"],
  "Región de Coquimbo": ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"],
  "Región de Valparaíso": ["Valparaíso", "Viña del Mar", "Concón", "Quilpué", "Villa Alemana", "Casablanca", "Concon", "Isla de Pascua", "Juan Fernández", "Limache", "Olmué", "Quillota", "La Cruz", "Calera", "San Felipe", "Los Andes", "San Antonio", "Cartagena", "El Quisco", "Algarrobo", "Santo Domingo"],
  "Región Metropolitana de Santiago": ["Santiago","Cerrillos","Cerro Navia","Conchalí","El Bosque","Estación Central","Huechuraba","Independencia","La Cisterna","La Florida","La Granja","La Pintana","La Reina","Las Condes","Lo Barnechea","Lo Espejo","Lo Prado","Macul","Maipú","Ñuñoa","Pedro Aguirre Cerda","Peñalolén","Providencia","Pudahuel","Quilicura","Quinta Normal","Recoleta","Renca","San Joaquín","San Miguel","San Ramón","Vitacura","Puente Alto","San Bernardo","Padre Hurtado","Melipilla"],
  "Región del Libertador Gral. Bernardo O’Higgins": ["Rancagua","Machalí","Graneros","Mostazal","Doñihue","Coltauco","Requínoa","San Fernando","Santa Cruz","Pichilemu","Litueche"],
  "Región del Maule": ["Talca","Curicó","Linares","Constitución","Cauquenes","Parral","San Javier","Molina"],
  "Región de Ñuble": ["Chillán","Chillán Viejo","San Carlos","Quillón","Yungay"],
  "Región del Biobío": ["Concepción","Talcahuano","San Pedro de la Paz","Coronel","Lota","Hualpén","Los Ángeles","Lebu","Arauco"],
  "Región de La Araucanía": ["Temuco","Padre Las Casas","Villarrica","Pucón","Angol","Lautaro"],
  "Región de Los Ríos": ["Valdivia","La Unión","Panguipulli","Río Bueno","Los Lagos"],
  "Región de Los Lagos": ["Puerto Montt","Osorno","Puerto Varas","Castro","Ancud","Chaitén"],
  "Región de Aysén del Gral. Carlos Ibáñez del Campo": ["Coyhaique","Puerto Aysén","Chile Chico","Cochrane"],
  "Región de Magallanes y de la Antártica Chilena": ["Punta Arenas","Puerto Natales","Porvenir","Puerto Williams"]
};
const REGIONES = Object.keys(REGIONES_COMUNAS_CHILE);


export default function RegisterForm() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [calle, setCalle] = useState('');
  const [depto, setDepto] = useState('');
  const [region, setRegion] = useState('');
  const [comuna, setComuna] = useState('');

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [okMsg, setOkMsg] = useState('');

  const comunasDisponibles = region ? REGIONES_COMUNAS_CHILE[region] : [];

  useEffect(() => { setComuna(''); }, [region]);

  const validateForm = () => {
    const e = {};
    if (!nombre || nombre.length < 3) e.nombre = 'El nombre es requerido (min 3).';
    if (!apellidos || apellidos.length < 3) e.apellidos = 'Los apellidos son requeridos (min 3).';

    if (!email) {
      e.email = 'El correo es requerido.';
    }

    if (!password || password.length < 4 || password.length > 10) {
      e.password = 'La contraseña debe tener entre 4 y 10 caracteres.';
    }
    if (password !== confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden.';

    if (!calle || calle.length < 5) e.calle = 'La calle y numeración son requeridas.';
    if (!region) e.region = 'La Región es requerida.';
    if (!comuna) e.comuna = 'La Comuna es requerida.';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    setOkMsg('');
    if (!validateForm()) return;

    try {
      const resp = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, apellidos, email, password, calle, depto: depto || null, region, comuna }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setServerError(data?.error || 'Error al registrar el usuario.');
        return;
      }
      setOkMsg('¡Registro exitoso! Redirigiendo al inicio de sesión…');
      setTimeout(() => navigate('/'), 1200);
    } catch {
      setServerError('No se pudo conectar con el servidor.');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      <div className="form-shell">
        <h2>Crear Cuenta</h2>

        <form noValidate onSubmit={handleSubmit}>
          <div className="grid form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="nombre">Nombre</label>
              <div className="input-icon-wrapper">
                <input
                  id="nombre" // <-- AÑADIDO
                  className="form-control"
                  type="text"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
                <FaUser className="input-icon" />
              </div>
              {errors.nombre && <div className="error-message">{errors.nombre}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="apellidos">Apellidos</label>
              <div className="input-icon-wrapper">
                <input
                  id="apellidos" // <-- AÑADIDO
                  className="form-control"
                  type="text"
                  placeholder="Tus apellidos"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                />
                <FaUser className="input-icon" />
              </div>
              {errors.apellidos && <div className="error-message">{errors.apellidos}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Correo</label>
            <div className="input-icon-wrapper">
              <input
                id="email" // <-- AÑADIDO
                className="form-control"
                type="email"
                placeholder="ejemplo@duoc.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FaEnvelope className="input-icon" />
            </div>
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <h4 className="mb-2">Dirección de Envío</h4>

          <div className="grid form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="region">Región</label>
              <div className="input-icon-wrapper">
                <select
                  id="region" // <-- AÑADIDO
                  className="form-control"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  <option value="">Selecciona una Región</option>
                  {REGIONES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <FaMapMarkerAlt className="input-icon" />
              </div>
              {errors.region && <div className="error-message">{errors.region}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="comuna">Comuna</label>
              <div className="input-icon-wrapper">
                <select
                  id="comuna" // <-- AÑADIDO
                  className="form-control"
                  value={comuna}
                  onChange={(e) => setComuna(e.target.value)}
                  disabled={!region}
                >
                  <option value="">Selecciona una Comuna</option>
                  {comunasDisponibles.sort().map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <FaMapMarkerAlt className="input-icon" />
              </div>
              {errors.comuna && <div className="error-message">{errors.comuna}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="calle">Calle y Numeración</label>
            <div className="input-icon-wrapper">
              <input
                id="calle" // <-- AÑADIDO
                className="form-control"
                type="text"
                placeholder="Ej: Av. Vicuña Mackenna 4860"
                value={calle}
                onChange={(e) => setCalle(e.target.value)}
              />
              <FaHome className="input-icon" />
            </div>
            {errors.calle && <div className="error-message">{errors.calle}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="depto">Departamento / Casa (Opcional)</label>
            <div className="input-icon-wrapper">
              <input
                id="depto" // <-- AÑADIDO
                className="form-control"
                type="text"
                placeholder="Ej: Depto 501"
                value={depto}
                onChange={(e) => setDepto(e.target.value)}
              />
              <FaHome className="input-icon" />
            </div>
          </div>

          <div className="grid form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="password">Contraseña</label>
              <div className="input-icon-wrapper">
                <input
                  id="password" // <-- AÑADIDO
                  className="form-control"
                  type="password"
                  placeholder="Crea tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <FaLock className="input-icon" />
              </div>
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirmar Contraseña</label>
              <div className="input-icon-wrapper">
                <input
                  id="confirmPassword" // <-- AÑADIDO
                  className="form-control"
                  type="password"
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <FaLock className="input-icon" />
              </div>
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>
          </div>

          <button className="btn btn-primary btn-block" type="submit">
            Registrarme
          </button>

          <Link to="/inicio" className="text-center" style={{ display: 'block', marginTop: 16 }}>
            ¿Ya tienes cuenta? Inicia Sesión
          </Link>

          {serverError && (
            <div className="server-error-message" style={{ marginTop: 12 }}>
              {serverError}
            </div>
          )}
          {okMsg && (
            <div
              style={{
                background: 'rgba(25,135,84,.08)',
                color: '#198754',
                padding: '.6rem .8rem',
                borderRadius: 8,
                marginTop: 12
              }}
            >
              {okMsg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}