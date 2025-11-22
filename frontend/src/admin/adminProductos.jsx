import React, { useEffect, useState } from 'react';
import { API_BASE } from '../lib/api.js';
import { FaEdit, FaTrash, FaPlus, FaExclamationTriangle, FaBoxOpen, FaImage, FaSearch, FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [criticos, setCriticos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para mensajes (En lugar de alerts)
  const [mensaje, setMensaje] = useState(null); // { tipo: 'exito' | 'error', texto: '' }

  const [filtroCritico, setFiltroCritico] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const [nuevo, setNuevo] = useState({
    nombre: '', descripcion: '', precio: '', stock: '', 
    categoriaId: '', imagenUrl: '', discountPercentage: '', onSale: false
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => { loadAll(); }, []);

  // Función auxiliar para mostrar mensajes temporales
  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000); // Desaparece a los 4 segundos
  };

  async function loadAll() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [pRes, cRes, lRes] = await Promise.all([
        fetch(`${API_BASE}/productos`),
        fetch(`${API_BASE}/categorias`),
        fetch(`${API_BASE}/productos/low-stock`, { headers }).catch(() => ({ ok: false })), 
      ]);
      
      const p = await pRes.json();
      const c = await cRes.json();
      const l = lRes.ok ? await lRes.json() : [];

      setProductos(p || []);
      setCategorias(c || []);
      setCriticos(l || []);
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  }

  const handleImageUpload = (e, isEdit) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (isEdit) setEditando(prev => ({ ...prev, imagenUrl: reader.result }));
      else setNuevo(prev => ({ ...prev, imagenUrl: reader.result }));
    };
  };

  async function crearProducto() {
    if (!nuevo.nombre || !nuevo.precio || !nuevo.categoriaId) {
      mostrarMensaje('error', 'Faltan datos obligatorios (Nombre, Precio, Categoría)');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...nuevo,
        precio: Number(nuevo.precio),
        stock: Number(nuevo.stock),
        urlImagen: nuevo.imagenUrl || '/osito.jpg',
        discountPercentage: nuevo.discountPercentage ? Number(nuevo.discountPercentage) : 0,
        categoria: { id: Number(nuevo.categoriaId) }
      };
      const res = await fetch(`${API_BASE}/productos`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        mostrarMensaje('exito', '¡Producto creado correctamente!');
        setNuevo({ nombre:'', descripcion:'', precio:'', stock:'', categoriaId:'', imagenUrl:'', discountPercentage:'', onSale: false });
        loadAll();
      } else {
        mostrarMensaje('error', 'Error al crear. Revisa la conexión.');
      }
    } catch (e) { mostrarMensaje('error', e.message); }
  }

  async function eliminarProducto(id) {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/productos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        loadAll();
        mostrarMensaje('exito', 'Producto eliminado.');
      }
    } catch (e) { mostrarMensaje('error', e.message); }
  }

  async function guardarEdicion() {
    try {
      const token = localStorage.getItem('token');
      
      // PREPARAR PAYLOAD SEGURO
      const payload = {
        nombre: editando.nombre,
        descripcion: editando.descripcion,
        precio: Number(editando.precio),
        stock: Number(editando.stock),
        urlImagen: editando.imagenUrl,
        onSale: editando.onSale,
        discountPercentage: editando.discountPercentage ? Number(editando.discountPercentage) : 0,
        // Si se seleccionó una nueva categoría (ID numérico), se usa. Si no, se mantiene la actual (Objeto).
        categoria: editando.categoriaId 
          ? { id: Number(editando.categoriaId) } 
          : (editando.categoria ? { id: editando.categoria.id } : null)
      };

      const res = await fetch(`${API_BASE}/productos/${editando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (res.ok) { 
        mostrarMensaje('exito', '¡Cambios guardados exitosamente!');
        setEditando(null); 
        loadAll(); 
      } else {
        mostrarMensaje('error', 'Error del servidor al guardar cambios.');
      }
    } catch (e) { mostrarMensaje('error', 'Error de conexión.'); }
  }

  const prepararEdicion = (p) => {
    setEditando({ ...p, imagenUrl: p.urlImagen, categoriaId: p.categoria?.id || '', discountPercentage: p.discountPercentage || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMensaje(null);
  };

  if (loading) return <div className="main-content container text-center" style={{padding:'4rem'}}>Cargando inventario...</div>;

  // Componente de filtrado
  const productosFiltrados = productos.filter(p => {
    const cumpleStock = filtroCritico ? p.stock < 5 : true;
    const cumpleBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleStock && cumpleBusqueda;
  });
  const stockCriticoCount = productos.filter(p => p.stock < 5).length;

  return (
    <div className="main-content">
      <div className="container">
        
        <div style={{ marginBottom:'2rem', textAlign:'center' }}>
          <h1 style={{ color: 'var(--brand)', margin:0 }}>Inventario</h1>
        </div>

        {/* MENSAJES DE NOTIFICACIÓN (SIN ALERTAS) */}
        {mensaje && (
          <div style={{
            position: 'fixed', top: '90px', right: '20px', zIndex: 2000,
            padding: '15px 20px', borderRadius: '10px',
            background: mensaje.tipo === 'exito' ? '#d4edda' : '#f8d7da',
            color: mensaje.tipo === 'exito' ? '#155724' : '#721c24',
            border: `1px solid ${mensaje.tipo === 'exito' ? '#c3e6cb' : '#f5c6cb'}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600'
          }}>
            {mensaje.tipo === 'exito' ? <FaCheckCircle /> : <FaTimesCircle />}
            {mensaje.texto}
          </div>
        )}

        {/* TARJETAS DE RESUMEN */}
        <div className="grid" style={{ marginBottom: '2rem' }}>
          <div onClick={() => setFiltroCritico(false)} className="card hover-effect" style={{ cursor: 'pointer', borderLeft: !filtroCritico ? '5px solid var(--brand)' : 'transparent', background: !filtroCritico ? '#fff' : '#f9f9f9' }}>
            <div className="card-body" style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
              <div style={{ background:'#e3f2fd', color:'#1565c0', padding:15, borderRadius:'50%', fontSize:'1.5rem' }}><FaBoxOpen/></div>
              <div><h2 style={{ margin:0, fontSize:'1.8rem' }}>{productos.length}</h2><span style={{ color:'var(--muted)' }}>Total Productos</span></div>
            </div>
          </div>
          <div onClick={() => setFiltroCritico(true)} className="card hover-effect" style={{ cursor: 'pointer', borderLeft: filtroCritico ? '5px solid #dc3545' : 'transparent', background: filtroCritico ? '#fff' : '#f9f9f9' }}>
            <div className="card-body" style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
              <div style={{ background:'#ffebee', color:'#c62828', padding:15, borderRadius:'50%', fontSize:'1.5rem' }}><FaExclamationTriangle/></div>
              <div><h2 style={{ margin:0, fontSize:'1.8rem', color: stockCriticoCount > 0 ? '#dc3545' : 'inherit' }}>{stockCriticoCount}</h2><span style={{ color: stockCriticoCount > 0 ? '#dc3545' : 'var(--muted)' }}>Stock Bajo</span></div>
            </div>
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="card" style={{ marginBottom: 20, padding:'1.5rem' }}>
          <h3 style={{ marginTop:0, color:'var(--brand)', display:'flex', justifyContent:'space-between' }}>
            {editando ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
            {editando && <button onClick={()=>setEditando(null)} className="btn btn-ghost" style={{padding:'4px 8px'}}><FaTimes/></button>}
          </h3>
          
          <div style={{ display:'grid', gap:'1rem', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', marginTop:12 }}>
            <div className="form-group"><label className="form-label">Nombre</label><input className="form-control" value={editando ? editando.nombre : nuevo.nombre} onChange={e => editando ? setEditando({...editando, nombre:e.target.value}) : setNuevo({...nuevo, nombre:e.target.value})}/></div>
            <div className="form-group"><label className="form-label">Precio</label><input className="form-control" type="number" value={editando ? editando.precio : nuevo.precio} onChange={e => editando ? setEditando({...editando, precio:e.target.value}) : setNuevo({...nuevo, precio:e.target.value})}/></div>
            <div className="form-group"><label className="form-label">Stock</label><input className="form-control" type="number" value={editando ? editando.stock : nuevo.stock} onChange={e => editando ? setEditando({...editando, stock:e.target.value}) : setNuevo({...nuevo, stock:e.target.value})}/></div>
            <div className="form-group"><label className="form-label">Categoría</label><select className="form-control" value={editando ? editando.categoriaId : nuevo.categoriaId} onChange={e => editando ? setEditando({...editando, categoriaId:e.target.value}) : setNuevo({...nuevo, categoriaId:e.target.value})}><option value="">-- Seleccionar --</option>{categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Descuento (0.20)</label><input className="form-control" type="number" step="0.01" value={editando ? editando.discountPercentage : nuevo.discountPercentage} onChange={e => editando ? setEditando({...editando, discountPercentage:e.target.value}) : setNuevo({...nuevo, discountPercentage:e.target.value})}/></div>
            <div className="form-group" style={{display:'flex', alignItems:'end'}}><label style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer', border:'1px solid #ddd', padding:'10px', borderRadius:8, width:'100%', background:'#f9f9f9'}}><input type="checkbox" checked={editando ? editando.onSale : nuevo.onSale} onChange={e => editando ? setEditando({...editando, onSale: e.target.checked}) : setNuevo({...nuevo, onSale: e.target.checked})}/><strong>¿En Oferta?</strong></label></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Imagen</label><div style={{display:'flex', gap:10, alignItems:'center', flexWrap:'wrap'}}><label className="btn btn-ghost" style={{cursor:'pointer'}}><FaImage /> Subir Foto<input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e, !!editando)} /></label><input className="form-control" style={{flex:1}} placeholder="O pega URL..." value={editando ? editando.imagenUrl : nuevo.imagenUrl} onChange={e => editando ? setEditando({...editando, imagenUrl:e.target.value}) : setNuevo({...nuevo, imagenUrl:e.target.value})}/>{(editando ? editando.imagenUrl : nuevo.imagenUrl) && <img src={editando ? editando.imagenUrl : nuevo.imagenUrl} alt="Preview" style={{height:40, borderRadius:4}} />}</div></div>
            <div style={{ gridColumn: '1 / -1' }}><textarea className="form-control" rows="2" placeholder="Descripción..." value={editando ? editando.descripcion : nuevo.descripcion} onChange={e => editando ? setEditando({...editando, descripcion:e.target.value}) : setNuevo({...nuevo, descripcion:e.target.value})}/></div>
          </div>
          <div style={{ marginTop:'1rem' }}><button className="btn btn-primary btn-block" onClick={editando ? guardarEdicion : crearProducto}>{editando ? 'Guardar Cambios' : 'Crear Producto'}</button></div>
        </div>

        {/* TABLA */}
        <div className="card"><div className="card-body">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:10}}>
            <h3 style={{ margin:0 }}>{filtroCritico ? 'Stock Crítico' : 'Listado'}</h3>
            <div style={{position:'relative'}}><FaSearch style={{position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#aaa'}}/><input placeholder="Buscar..." className="form-control" style={{paddingLeft:35, width:200}} value={busqueda} onChange={(e)=>setBusqueda(e.target.value)}/></div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '650px' }}>
              <thead><tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: 'var(--muted)' }}><th style={{ padding: '10px' }}>Foto</th><th style={{ padding: '10px' }}>Producto</th><th style={{ padding: '10px' }}>Precio</th><th style={{ padding: '10px' }}>Stock</th><th style={{ padding: '10px' }}>Estado</th><th style={{ padding: '10px' }}>Acciones</th></tr></thead>
              <tbody>
                {productosFiltrados.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                    <td style={{ padding: '10px' }}><img src={p.urlImagen || '/placeholder.jpg'} alt="min" style={{ width:40, height:40, objectFit:'cover', borderRadius:6 }} /></td>
                    <td style={{ padding: '10px' }}><strong>{p.nombre}</strong><br/><small className="text-muted">{p.categoria?.nombre}</small></td>
                    <td style={{ padding: '10px' }}>{CLP.format(p.precio)}</td>
                    <td style={{ padding: '10px' }}><span style={{ color: p.stock < 5 ? '#dc3545' : 'inherit', fontWeight: p.stock < 5 ? 700 : 400 }}>{p.stock}</span></td>
                    <td style={{ padding: '10px' }}>{p.onSale ? <span className="badge" style={{background:'#2ecc71'}}>OFERTA</span> : '-'}</td>
                    <td style={{ padding: '10px' }}><button className="btn btn-ghost" onClick={() => prepararEdicion(p)} style={{padding:'6px', marginRight:5}}><FaEdit/></button><button className="btn btn-ghost" onClick={() => eliminarProducto(p.id)} style={{padding:'6px', color:'#dc3545', borderColor:'#dc3545'}}><FaTrash/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div></div>
      </div>
    </div>
  );
}