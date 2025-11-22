import React, { useState, useEffect } from 'react';
import { API_BASE } from '../lib/api';
import { useAuth } from '../context/AuthContext'; 
import { FaUserShield, FaUser, FaEdit, FaHistory, FaSave, FaTimes, FaShoppingBag, FaPlus, FaCheckCircle, FaTimesCircle, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';

export default function AdminUsuarios() {
  const { user: currentUser, login } = useAuth(); // Importamos login para actualizar datos propios si es necesario
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState(null); 

  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [viewingHistory, setViewingHistory] = useState(null);
  const [boletas, setBoletas] = useState([]);
  
  // Formulario extendido con Dirección
  const [formData, setFormData] = useState({
    id: null, nombre: '', email: '', password: '', rol: 'CLIENTE',
    direccionRegion: '', direccionComuna: '', direccionCalle: '', direccionDepto: ''
  });

  useEffect(() => { cargarUsuarios(); }, []);

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  };

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarUsuario = async (usuario) => {
    if (usuario.email === currentUser.email) {
      mostrarMensaje('error', 'No puedes eliminar tu propia cuenta.');
      return;
    }
    if (!window.confirm(`¿Eliminar a ${usuario.nombre}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users/${usuario.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        mostrarMensaje('exito', 'Usuario eliminado.');
        cargarUsuarios();
      } else {
        mostrarMensaje('error', 'No se pudo eliminar.');
      }
    } catch (error) { mostrarMensaje('error', 'Error de conexión.'); }
  };

  const iniciarCreacion = () => {
    setFormData({ 
      id: null, nombre: '', email: '', password: '', rol: 'CLIENTE',
      direccionRegion: '', direccionComuna: '', direccionCalle: '', direccionDepto: ''
    });
    setModoEdicion(false);
    setMostrarForm(true);
    setViewingHistory(null);
  };

  const iniciarEdicion = (u) => {
    setFormData({ 
      id: u.id, nombre: u.nombre, email: u.email, password: '', rol: u.rol,
      direccionRegion: u.direccionRegion || '',
      direccionComuna: u.direccionComuna || '',
      direccionCalle: u.direccionCalle || '',
      direccionDepto: u.direccionDepto || ''
    });
    setModoEdicion(true);
    setMostrarForm(true);
    setViewingHistory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.email || (!modoEdicion && !formData.password)) {
      mostrarMensaje('error', 'Nombre, Email y Contraseña son obligatorios.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = modoEdicion ? `${API_BASE}/users/${formData.id}` : `${API_BASE}/users`;
      const method = modoEdicion ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const usuarioGuardado = await res.json();
        mostrarMensaje('exito', modoEdicion ? 'Datos actualizados.' : 'Usuario creado.');
        setMostrarForm(false);
        cargarUsuarios();
        
        // TRUCO: Si me edité a mí mismo, actualizo mi sesión local para que el Checkout lo note de inmediato
        if (modoEdicion && usuarioGuardado.email === currentUser.email) {
            login(usuarioGuardado, token); 
        }

      } else {
        mostrarMensaje('error', 'Error al guardar.');
      }
    } catch (error) {
      mostrarMensaje('error', 'Error de servidor.');
    }
  };

  const handleViewHistory = async (u) => {
    setViewingHistory(u);
    setMostrarForm(false); 
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users/${u.id}/boletas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBoletas(data || []); 
    } catch (error) { setBoletas([]); }
  };

  if (loading) return <div className="main-content container text-center" style={{padding:'4rem'}}>Cargando...</div>;

  return (
    <div className="main-content">
      <div className="container">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ color: 'var(--brand)', margin: 0 }}>Gestión de Usuarios</h1>
          {!mostrarForm && (
            <button className="btn btn-primary" onClick={iniciarCreacion}>
              <FaPlus /> Nuevo Usuario
            </button>
          )}
        </div>

        {mensaje && (
          <div style={{ position: 'fixed', top: '90px', right: '20px', zIndex: 2000, padding: '15px 20px', borderRadius: '10px', background: mensaje.tipo === 'exito' ? '#d4edda' : '#f8d7da', color: mensaje.tipo === 'exito' ? '#155724' : '#721c24', border: `1px solid ${mensaje.tipo === 'exito' ? '#c3e6cb' : '#f5c6cb'}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
            {mensaje.tipo === 'exito' ? <FaCheckCircle /> : <FaTimesCircle />} {mensaje.texto}
          </div>
        )}

        <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '2rem' }}>
          
          {/* --- FORMULARIO --- */}
          {mostrarForm && (
            <div className="card" style={{ borderLeft: '5px solid var(--brand)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>{modoEdicion ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h3>
                <button onClick={() => setMostrarForm(false)} className="btn btn-ghost" style={{padding:'5px'}}><FaTimes/></button>
              </div>
              
              {/* Datos de Cuenta */}
              <h4 style={{color:'var(--muted)', borderBottom:'1px solid #eee', paddingBottom:'5px'}}>Datos de Cuenta</h4>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom:'1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input className="form-control" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contraseña {modoEdicion && <span style={{fontSize:'0.8rem', fontWeight:'normal'}}>(Opcional)</span>}</label>
                  <input className="form-control" type="password" placeholder={modoEdicion ? "******" : "Requerida"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Rol</label>
                  <select className="form-control" value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})}>
                    <option value="CLIENTE">Cliente</option>
                    <option value="VENDEDOR">Vendedor</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
              </div>

              {/* Datos de Dirección */}
              <h4 style={{color:'var(--muted)', borderBottom:'1px solid #eee', paddingBottom:'5px'}}>Dirección de Envío</h4>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                 <div className="form-group"><label className="form-label">Región</label><input className="form-control" value={formData.direccionRegion} onChange={e => setFormData({...formData, direccionRegion: e.target.value})} /></div>
                 <div className="form-group"><label className="form-label">Comuna</label><input className="form-control" value={formData.direccionComuna} onChange={e => setFormData({...formData, direccionComuna: e.target.value})} /></div>
                 <div className="form-group" style={{gridColumn: '1 / -1'}}><label className="form-label">Calle y Número</label><input className="form-control" value={formData.direccionCalle} onChange={e => setFormData({...formData, direccionCalle: e.target.value})} /></div>
                 <div className="form-group"><label className="form-label">Depto/Casa</label><input className="form-control" value={formData.direccionDepto} onChange={e => setFormData({...formData, direccionDepto: e.target.value})} /></div>
              </div>
              
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '10px' }}>
                <button className="btn btn-primary" onClick={handleSubmit}><FaSave /> {modoEdicion ? 'Guardar Cambios' : 'Crear Usuario'}</button>
                <button className="btn btn-ghost" onClick={() => setMostrarForm(false)}>Cancelar</button>
              </div>
            </div>
          )}

          {/* --- HISTORIAL --- */}
          {viewingHistory && (
            <div className="card" style={{ borderLeft: '5px solid #007bff', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Historial: {viewingHistory.nombre}</h3>
                <button onClick={() => setViewingHistory(null)} className="btn btn-ghost" style={{padding:'5px'}}><FaTimes/></button>
              </div>
              {boletas.length === 0 ? <p style={{color:'var(--muted)'}}>Sin compras registradas.</p> : 
                 <ul style={{listStyle:'none', padding:0}}>{boletas.map(b => <li key={b.id} style={{padding:'10px', borderBottom:'1px solid #eee'}}>🛒 Boleta #{b.id} - ${b.total}</li>)}</ul>
              }
            </div>
          )}

          {/* --- TABLA --- */}
          <div className="card">
            <div className="card-body" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: 'var(--muted)' }}>
                    <th style={{ padding: '1rem' }}>ID</th>
                    <th style={{ padding: '1rem' }}>Usuario</th>
                    <th style={{ padding: '1rem' }}>Dirección</th>
                    <th style={{ padding: '1rem' }}>Rol</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                      <td style={{ padding: '1rem' }}>#{u.id}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 'bold' }}>{u.nombre}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '1rem', fontSize:'0.85rem', maxWidth:'200px' }}>
                        {u.direccionCalle ? 
                          <span><FaMapMarkerAlt style={{color:'#e74c3c'}}/> {u.direccionCalle}, {u.direccionComuna}</span> 
                          : <span style={{color:'#ccc'}}>-</span>}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {u.rol === 'ADMIN' ? <span className="badge" style={{background:'#e3f2fd', color:'#0d47a1', padding:'6px 10px', borderRadius:20}}><FaUserShield/> Admin</span> 
                        : u.rol === 'VENDEDOR' ? <span className="badge" style={{background:'#fff3cd', color:'#856404', padding:'6px 10px', borderRadius:20}}><FaShoppingBag/> Vendedor</span>
                        : <span className="badge" style={{background:'#f8f9fa', color:'#6c757d', padding:'6px 10px', borderRadius:20}}><FaUser/> Cliente</span>}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button className="btn btn-ghost" onClick={() => iniciarEdicion(u)} style={{ padding:'6px 10px' }} title="Editar"><FaEdit /></button>
                          <button className="btn btn-ghost" onClick={() => handleViewHistory(u)} style={{ padding:'6px 10px', color:'#007bff', borderColor:'#007bff' }} title="Historial"><FaHistory /></button>
                          {u.email !== currentUser?.email && <button className="btn btn-ghost" onClick={() => eliminarUsuario(u)} style={{ padding:'6px 10px', color:'#dc3545', borderColor:'#dc3545' }} title="Eliminar"><FaTrash /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}