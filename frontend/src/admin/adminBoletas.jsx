import React, { useEffect, useState } from 'react';
import { API_BASE } from '../lib/api.js';
import { FaReceipt, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaEye, FaTimes } from 'react-icons/fa';

export default function AdminBoletas() {
  const [boletas, setBoletas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Modal de Detalle
  const [boletaSeleccionada, setBoletaSeleccionada] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  // Formateadores
  const CLP = (n) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Number(n || 0));
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return `${d.toLocaleDateString('es-CL')} ${d.toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'})}`;
  };

  useEffect(() => {
    cargarBoletas();
  }, []);

  const cargarBoletas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/boletas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        // Ordenamos por ID descendente (más nuevas arriba)
        const ordenadas = (data || []).sort((a, b) => b.id - a.id);
        setBoletas(ordenadas);
      }
    } catch (error) {
      console.error("Error al cargar boletas:", error);
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (boleta) => {
    setBoletaSeleccionada(boleta);
    setDetalles([]);
    setCargandoDetalle(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/boletas/${boleta.id}/detalles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDetalles(data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const cerrarModal = () => {
    setBoletaSeleccionada(null);
    setDetalles([]);
  };

  if (loading) return <div className="main-content container text-center" style={{padding:'4rem'}}>Cargando historial...</div>;

  return (
    <div className="main-content">
      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--brand)', margin: 0 }}>Historial de Ventas</h1>
          <p style={{ color: 'var(--muted)' }}>Registro de transacciones</p>
        </div>

        <div className="card">
          <div className="card-body" style={{ overflowX: 'auto' }}>
            {boletas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>No hay ventas registradas aún.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: 'var(--muted)' }}>
                    <th style={{ padding: '1rem' }}>N°</th>
                    <th style={{ padding: '1rem' }}>Fecha</th>
                    <th style={{ padding: '1rem' }}>Cliente</th>
                    <th style={{ padding: '1rem' }}>Envío</th>
                    <th style={{ padding: '1rem' }}>Total</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {boletas.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--brand)' }}>#{b.id}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                           <FaCalendarAlt style={{color:'#ccc'}}/> {formatDate(b.fecha)}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>{b.usuarioEmail}</td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', color:'#666' }}>{b.direccion}</td>
                      <td style={{ padding: '1rem', fontWeight: '800', color: '#28a745' }}>{CLP(b.total)}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button 
                          className="btn btn-ghost" 
                          onClick={() => verDetalle(b)} 
                          style={{ padding: '5px 10px', fontSize: '0.9rem' }}
                        >
                          <FaEye /> Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* --- MODAL DE DETALLE --- */}
        {boletaSeleccionada && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}>
            <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', animation: 'fadeIn 0.3s ease' }}>
              
              {/* Cabecera Modal */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Boleta #{boletaSeleccionada.id}</h3>
                <button onClick={cerrarModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}><FaTimes/></button>
              </div>
              
              <div className="card-body">
                {/* Info General */}
                <div style={{marginBottom:'1.5rem', padding:'10px', background:'#f8f9fa', borderRadius:'8px', fontSize:'0.9rem', color:'#555'}}>
                    <p style={{margin:'4px 0'}}><FaUser style={{marginRight:5}}/> <strong>Cliente:</strong> {boletaSeleccionada.usuarioEmail}</p>
                    <p style={{margin:'4px 0'}}><FaMapMarkerAlt style={{marginRight:5}}/> <strong>Envío:</strong> {boletaSeleccionada.direccion}</p>
                    <p style={{margin:'4px 0'}}><FaCalendarAlt style={{marginRight:5}}/> <strong>Fecha:</strong> {formatDate(boletaSeleccionada.fecha)}</p>
                </div>

                <h4 style={{marginBottom:'1rem', borderBottom:'2px solid var(--brand)', display:'inline-block'}}>Productos</h4>

                {cargandoDetalle ? (
                  <p className="text-center text-muted">Cargando detalles...</p>
                ) : detalles.length === 0 ? (
                  // MENSAJE SI NO HAY PRODUCTOS (Caso Legacy)
                  <div style={{textAlign:'center', padding:'1rem', color:'#e67e22', border:'1px dashed #e67e22', borderRadius:'8px', background:'#fffaf0'}}>
                     <p style={{margin:0, fontWeight:'bold'}}>⚠️ Detalles no disponibles</p>
                     <small>Esta venta se registró antes de la actualización del sistema.</small>
                  </div>
                ) : (
                  // LISTA DE PRODUCTOS
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {detalles.map((d, index) => (
                      <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                        
                        {/* FOTO PRODUCTO */}
                        <img 
                          src={d.producto?.urlImagen || '/placeholder.jpg'} 
                          alt="prod" 
                          style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, border:'1px solid #ddd' }} 
                        />
                        
                        {/* INFO */}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', color:'var(--text)' }}>
                              {d.producto?.nombre || 'Producto Eliminado'}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                              {d.cantidad} unidad(es) x {CLP(d.precioUnitario)}
                          </div>
                        </div>
                        
                        {/* SUBTOTAL */}
                        <div style={{ fontWeight: 'bold', fontSize:'1.1rem' }}>
                          {CLP(d.cantidad * d.precioUnitario)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TOTAL FINAL */}
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: '800', color: 'var(--brand)', borderTop:'2px solid #eee', paddingTop:'15px' }}>
                  <span>Total</span>
                  <span>{CLP(boletaSeleccionada.total)}</span>
                </div>

              </div>
              
              <div style={{ padding: '1rem', background: '#f9f9f9', textAlign: 'right' }}>
                <button className="btn btn-primary" onClick={cerrarModal}>Cerrar</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}