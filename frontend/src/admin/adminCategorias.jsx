import React, { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { API_BASE } from '../lib/api.js';

export default function AdminCategorias() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [newName, setNewName] = useState('');
  
  const [editing, setEditing] = useState(null); 
  const [editName, setEditName] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/categorias`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar');
      setCats(data || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const createCat = async () => {
    if (!newName.trim()) return;
    setErr('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/categorias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nombre: newName })
      });
      if (!res.ok) throw new Error('Error al crear');
      setNewName('');
      load();
    } catch (e) { setErr(e.message); }
  };

  const updateCat = async (id) => {
    if (!editName.trim()) return;
    setErr('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/categorias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nombre: editName })
      });
      if (!res.ok) throw new Error('Error al actualizar');
      setEditing(null); setEditName(''); load();
    } catch (e) { setErr(e.message); }
  };

  const deleteCat = async (id) => {
    if (!window.confirm("¿Eliminar?")) return;
    setErr('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/categorias/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al eliminar');
      load();
    } catch (e) { setErr(e.message); }
  };

  if (loading) return <div className="main-content container text-center">Cargando...</div>;

  return (
    <div className="main-content">
      <div className="container">
        
        <h1 style={{ color: 'var(--brand)', marginBottom: '1.5rem', textAlign: 'center' }}>Gestión de Categorías</h1>

        {err && <div style={{ padding: 10, background: '#ffebee', color: '#c62828', borderRadius: 8, marginBottom: 20 }}>{err}</div>}

        {/* CAMBIO CLAVE: Usamos Flexbox con Wrap.
            - En PC: Se ponen lado a lado.
            - En Móvil: Se ponen uno debajo del otro automáticamente.
        */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'start' }}>
          
          {/* --- PANEL CREAR (Ocupa todo el ancho en móvil, 1/3 en PC) --- */}
          <div className="card" style={{ flex: '1 1 300px', padding: '1.5rem' }}>
            <h3 style={{ marginTop: 0, color: '#555' }}>Nueva Categoría</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                className="form-control"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre..."
              />
              <button 
                className="btn btn-primary" 
                onClick={createCat} 
                disabled={!newName.trim()}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <FaPlus /> Crear
              </button>
            </div>
          </div>

          {/* --- LISTA (Ocupa todo el ancho en móvil, 2/3 en PC) --- */}
          <div className="card" style={{ flex: '2 1 300px' }}>
            <div className="card-body" style={{ overflowX: 'auto' }}> {/* Scroll horizontal si la tabla es muy ancha */}
              {cats.length === 0 ? (
                <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Sin categorías.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '300px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: 'var(--muted)' }}>
                      <th style={{ padding: '10px' }}>Nombre</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cats.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={{ padding: '10px', verticalAlign: 'middle' }}>
                          {editing === c.id ? (
                            <input className="form-control" value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
                          ) : (
                            <span style={{ fontWeight: '600' }}>{c.nombre}</span>
                          )}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            {editing === c.id ? (
                              <>
                                <button onClick={() => updateCat(c.id)} className="btn btn-primary" style={{ padding: '6px' }}><FaSave /></button>
                                <button onClick={() => { setEditing(null); setEditName(''); }} className="btn btn-ghost" style={{ padding: '6px' }}><FaTimes /></button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => { setEditing(c.id); setEditName(c.nombre); }} className="btn btn-ghost" style={{ padding: '6px' }}><FaEdit /></button>
                                <button onClick={() => deleteCat(c.id)} className="btn btn-ghost" style={{ padding: '6px', color: '#dc3545', borderColor: '#dc3545' }}><FaTrash /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}