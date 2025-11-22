import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaHome, FaEye, FaEyeSlash } from 'react-icons/fa';
import { API_BASE } from '../lib/api.js';
import { useAuth } from '../context/AuthContext'; 

// [Toda la lista de REGIONES_COMUNAS_CHILE va aquí, no la borres]
const REGIONES_COMUNAS_CHILE = {
  "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
  "Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Pica", "Huara", "Camiña", "Colchane"],
  "Antofagasta": ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"],
  "Atacama": ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"],
  "Coquimbo": ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"],
  "Valparaíso": ["Valparaíso", "Viña del Mar", "Concón", "Quilpué", "Villa Alemana", "Casablanca", "Juan Fernández", "San Antonio", "Cartagena", "El Tabo", "El Quisco", "Algarrobo", "Santo Domingo"],
  "Metropolitana": ["Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"],
  "O'Higgins": ["Rancagua", "Machalí", "Graneros", "Mostazal", "San Fernando", "Santa Cruz", "Pichilemu"],
  "Maule": ["Talca", "Curicó", "Linares", "Constitución", "Cauquenes", "Parral"],
  "Ñuble": ["Chillán", "Chillán Viejo", "San Carlos", "Bulnes"],
  "Biobío": ["Concepción", "Talcahuano", "San Pedro de la Paz", "Chiguayante", "Coronel", "Lota", "Tomé", "Penco", "Hualpén", "Los Ángeles", "Arauco", "Lebu"],
  "La Araucanía": ["Temuco", "Padre Las Casas", "Villarrica", "Pucón", "Angol"],
  "Los Ríos": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
  "Los Lagos": ["Puerto Montt", "Puerto Varas", "Osorno", "Castro", "Ancud"],
  "Aysén": ["Coyhaique", "Puerto Aysén"],
  "Magallanes": ["Punta Arenas", "Puerto Natales"]
};
const REGIONES = Object.keys(REGIONES_COMUNAS_CHILE);

export default function RegisterForm() {
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [calle, setCalle] = useState('');
  const [depto, setDepto] = useState('');
  const [region, setRegion] = useState('');
  const [comuna, setComuna] = useState('');

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const comunasDisponibles = region ? REGIONES_COMUNAS_CHILE[region] : [];

  useEffect(() => { setComuna(''); }, [region]);

  const validateForm = () => {
    const e = {};
    const nombreCompleto = `${nombre} ${apellidos}`.trim();
    
    // --- VALIDACIÓN DE REGLAS DE NEGOCIO ---
    const dominioRegex = /@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;

    if (!nombreCompleto || nombreCompleto.length < 5) e.nombre = 'Nombre y apellido requeridos (mín. 5 caracteres).';
    
    if (!email) {
      e.email = 'El correo es obligatorio.';
    } else if (email.length > 100) {
      e.email = 'Máximo 100 caracteres.';
    } else if (!dominioRegex.test(email)) {
      e.email = 'Solo dominios @duoc.cl, @profesor.duoc.cl o @gmail.com.';
    }

    if (!password || password.length < 4 || password.length > 10) { // Regla: 4 a 10 caracteres
      e.password = 'La contraseña debe tener entre 4 y 10 caracteres.';
    }
    if (password !== confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden.';

    if (!calle || calle.length < 5) e.calle = 'La dirección es requerida.';
    if (!region) e.region = 'La Región es requerida.';
    if (!comuna) e.comuna = 'La Comuna es requerida.';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // 1. REGISTRO
      const payloadRegistro = {
        nombre: `${nombre} ${apellidos}`.trim(), 
        email: email,
        password: password,
        rol: "CLIENTE",
        direccionRegion: region,
        direccionComuna: comuna,
        direccionCalle: calle,
        direccionDepto: depto
      };

      const resRegistro = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadRegistro),
      });

      if (!resRegistro.ok) {
        const errorData = await resRegistro.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al registrar. El correo podría estar en uso.');
      }

      // 2. AUTO-LOGIN
      const resLogin = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (resLogin.ok) {
        const dataLogin = await resLogin.json();
        login(dataLogin.usuario, dataLogin.token);
        navigate('/');
      } else {
        navigate('/inicio');
      }

    } catch (err) {
      setServerError(err.message || 'No se pudo conectar con el servidor.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '85vh', padding: '2rem 0' }}>
      <div className="form-shell" style={{ maxWidth: '500px' }}>
        <div style={{textAlign:'center', marginBottom:'1.5rem'}}>
          <h2 style={{ margin: 0, color: 'var(--brand)', fontWeight: 800 }}>Crear Cuenta</h2>
          <p style={{ color: 'var(--muted)' }}>Únete a Peluchemanía</p>
        </div>

        {serverError && <div className="server-error-message">{serverError}</div>}

        <form noValidate onSubmit={handleSubmit}>
          
          {/* Nombre y Apellido */}
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <div className="input-icon-wrapper"><FaUser className="input-icon" /><input className="form-control" style={{paddingLeft:40}} placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} /></div>
              {errors.nombre && <div className="error-message" style={{color:'#dc3545', fontWeight:600}}>{errors.nombre}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Apellidos</label>
              <div className="input-icon-wrapper"><FaUser className="input-icon" /><input className="form-control" style={{paddingLeft:40}} placeholder="Tus apellidos" value={apellidos} onChange={(e) => setApellidos(e.target.value)} /></div>
              {errors.apellidos && <div className="error-message" style={{color:'#dc3545', fontWeight:600}}>{errors.apellidos}</div>}
            </div>
          </div>
          
          {/* Email */}
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <div className="input-icon-wrapper"><FaEnvelope className="input-icon" /><input className="form-control" style={{paddingLeft:40}} type="email" placeholder="ejemplo@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={100} /></div>
            {errors.email && <div className="error-message" style={{color:'#dc3545', fontWeight:600}}>{errors.email}</div>}
          </div>

          <h4 style={{margin:'1.5rem 0 1rem', color:'#555', borderBottom:'1px solid #eee', paddingBottom:'5px'}}>Dirección de Envío</h4>

          {/* Dirección (Grid) */}
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Región</label>
              <div className="input-icon-wrapper">
                <FaMapMarkerAlt className="input-icon" />
                <select className="form-control" style={{paddingLeft:40}} value={region} onChange={(e) => setRegion(e.target.value)}>
                  <option value="">Seleccionar</option>
                  {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {errors.region && <div className="error-message" style={{color:'#dc3545', fontWeight:600}}>{errors.region}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Comuna</label>
              <div className="input-icon-wrapper">
                <FaMapMarkerAlt className="input-icon" />
                <select className="form-control" style={{paddingLeft:40}} value={comuna} onChange={(e) => setComuna(e.target.value)} disabled={!region}>
                  <option value="">Seleccionar</option>
                  {comunasDisponibles.sort().map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {errors.comuna && <div className="error-message" style={{color:'#dc3545', fontWeight:600}}>{errors.comuna}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Calle y Número</label>
            <div className="input-icon-wrapper">
              <FaHome className="input-icon" />
              <input className="form-control" style={{paddingLeft:40}} placeholder="Ej: Av. Siempre Viva 123" value={calle} onChange={(e) => setCalle(e.target.value)} />
            </div>
            {errors.calle && <div className="error-message" style={{color:'#dc3545', fontWeight:600}}>{errors.calle}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Depto / Casa (Opcional)</label>
            <div className="input-icon-wrapper">
              <FaHome className="input-icon" />
              <input className="form-control" style={{paddingLeft:40}} placeholder="Ej: 402B" value={depto} onChange={(e) => setDepto(e.target.value)} />
            </div>
          </div>

          <h4 style={{margin:'1.5rem 0 1rem', color:'#555', borderBottom:'1px solid #eee', paddingBottom:'5px'}}>Seguridad</h4>

          {/* Contraseñas (Grid) */}
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div className="input-icon-wrapper" style={{position:'relative'}}>
                <FaLock className="input-icon" />
                <input className="form-control" style={{paddingLeft:40, paddingRight:40}} type={showPassword ? "text" : "password"} placeholder="4 a 10 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={10} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', border:'none', background:'none', color:'var(--brand)', cursor:'pointer'}}>
                  {showPassword ? <FaEyeSlash/> : <FaEye/>}
                </button>
              </div>
              {errors.password && <div className="error-message" style={{color:'#dc3545', fontWeight:600}}>{errors.password}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar</label>
              <div className="input-icon-wrapper">
                <FaLock className="input-icon" />
                <input className="form-control" style={{paddingLeft:40}} type="password" placeholder="Repite la contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} maxLength={10} />
              </div>
              {errors.confirmPassword && <div className="error-message" style={{color:'#dc3545', fontWeight:600}}>{errors.confirmPassword}</div>}
            </div>
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={isSubmitting} style={{marginTop:'1rem', padding:'12px', fontSize:'1.1rem'}}>
            {isSubmitting ? 'Registrando...' : 'Registrarme'}
          </button>

          <Link to="/inicio" className="text-center" style={{ display: 'block', marginTop: 16, textDecoration:'none', color:'var(--muted)' }}>
            ¿Ya tienes cuenta? <span style={{color:'var(--brand)', fontWeight:'bold'}}>Inicia Sesión</span>
          </Link>

        </form>
      </div>
    </div>
  );
}