import React, { useState, useEffect } from 'react';
import { API_BASE } from '../lib/api.js';
import { FaCalendarAlt, FaFileExcel, FaChartLine, FaMoneyBillWave, FaSearch, FaEye, FaTimes, FaUser, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';

const CLP = (n) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Number(n || 0));

export default function AdminReportes() {
  const [todasLasBoletas, setTodasLasBoletas] = useState([]);
  const [boletasFiltradas, setBoletasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para la carga del Excel
  const [exportando, setExportando] = useState(false);

  // Filtros
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Estadísticas
  const [totalVentas, setTotalVentas] = useState(0);
  const [cantidadVentas, setCantidadVentas] = useState(0);

  // Modal Detalle
  const [boletaSeleccionada, setBoletaSeleccionada] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    filtrarYCalcular();
  }, [todasLasBoletas, fechaInicio, fechaFin]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/boletas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const ordenadas = (data || []).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setTodasLasBoletas(ordenadas);
    } catch (error) {
      console.error("Error cargando reportes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarYCalcular = () => {
    let resultado = todasLasBoletas;
    if (fechaInicio) {
      resultado = resultado.filter(b => new Date(b.fecha) >= new Date(fechaInicio));
    }
    if (fechaFin) {
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59);
      resultado = resultado.filter(b => new Date(b.fecha) <= fin);
    }
    setBoletasFiltradas(resultado);
    
    const total = resultado.reduce((sum, b) => sum + b.total, 0);
    setTotalVentas(total);
    setCantidadVentas(resultado.length);
  };

  // --- EXPORTAR CON DETALLE DE PRODUCTOS ---
  const exportarExcel = async () => {
    if (boletasFiltradas.length === 0) return;
    
    setExportando(true); // Activamos indicador de carga
    const token = localStorage.getItem('token');

    try {
      // 1. Cabeceras del CSV
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "ID Boleta,Fecha,Hora,Cliente,Direccion,Total,Detalle Productos\n";

      // 2. Recorremos cada boleta y buscamos sus productos
      // Usamos Promise.all para esperar a que se carguen todos los detalles
      const filasPromesas = boletasFiltradas.map(async (b) => {
        let resumenProductos = "Sin detalles";
        
        try {
          // Llamada al backend para obtener los items de esta boleta
          const resDet = await fetch(`${API_BASE}/boletas/${b.id}/detalles`, {
             headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resDet.ok) {
            const items = await resDet.json();
            // Formateamos la lista de productos en un solo string (ej: "2x Oso | 1x Panda")
            resumenProductos = items.map(i => 
              `(${i.cantidad}) ${i.producto?.nombre || 'Eliminado'}`
            ).join(" | ");
          }
        } catch (e) {
          console.error("Error obteniendo detalle para boleta " + b.id);
        }

        // Formateo de datos básicos
        const fecha = new Date(b.fecha).toLocaleDateString('es-CL');
        const hora = new Date(b.fecha).toLocaleTimeString('es-CL');
        // Reemplazamos comas por espacios para no romper el CSV
        const dirLimpia = (b.direccion || '').replace(/,/g, ' - '); 
        const productosLimpios = resumenProductos.replace(/,/g, ' - ');

        return `${b.id},${fecha},${hora},${b.usuarioEmail},${dirLimpia},${b.total},"${productosLimpios}"`;
      });

      // Esperamos a que todas las filas estén listas
      const filas = await Promise.all(filasPromesas);
      csvContent += filas.join("\n");

      // 3. Descarga
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `reporte_detallado_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Error exportando:", error);
      alert("Hubo un error al generar el reporte detallado.");
    } finally {
      setExportando(false); // Apagamos indicador
    }
  };

  // --- MODAL DETALLE (Visualización rápida) ---
  const verDetalle = async (boleta) => {
    setBoletaSeleccionada(boleta);
    setDetalles([]);
    setCargandoDetalle(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/boletas/${boleta.id}/detalles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setDetalles(await res.json());
    } catch (error) { console.error(error); } 
    finally { setCargandoDetalle(false); }
  };

  const cerrarModal = () => { setBoletaSeleccionada(null); setDetalles([]); };

  if (loading) return <div className="main-content container text-center" style={{padding:'4rem'}}>Cargando datos...</div>;

  return (
    <div className="main-content">
      <div className="container">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: 10 }}>
          <div>
             <h1 style={{ color: 'var(--brand)', margin: 0 }}>Reportes</h1>
             <p style={{ color: 'var(--muted)', margin: 0 }}>Analiza ventas y productos</p>
          </div>
          
          <button 
            onClick={exportarExcel} 
            disabled={exportando}
            className="btn btn-primary" 
            style={{ background: '#217346', borderColor: '#217346', display: 'flex', alignItems: 'center', gap: 8, opacity: exportando ? 0.7 : 1 }}
          >
            {exportando ? <FaSpinner className="fa-spin"/> : <FaFileExcel />} 
            {exportando ? 'Generando...' : 'Exportar Excel Detallado'}
          </button>
        </div>

        {/* FILTROS */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', background: '#f8f9fa' }}>
          <h4 style={{ marginTop: 0, marginBottom: '1rem', display:'flex', alignItems:'center', gap:8 }}><FaSearch/> Filtrar por Fecha</h4>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Desde:</label>
              <input type="date" className="form-control" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Hasta:</label>
              <input type="date" className="form-control" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
            </div>
            <button className="btn btn-ghost" onClick={() => { setFechaInicio(''); setFechaFin(''); }} style={{ height: '42px' }}>Limpiar</button>
          </div>
        </div>

        {/* RESUMEN */}
        <div className="grid" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          <div className="card hover-effect" style={{ borderLeft: '5px solid #2ecc71' }}>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ background: '#e8f8f5', color: '#2ecc71', padding: 15, borderRadius: '50%', fontSize: '1.8rem' }}><FaMoneyBillWave /></div>
              <div><h2 style={{ margin: 0, fontSize: '2rem' }}>{CLP(totalVentas)}</h2><span style={{ color: 'var(--muted)' }}>Ingresos Totales</span></div>
            </div>
          </div>
          <div className="card hover-effect" style={{ borderLeft: '5px solid #3498db' }}>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ background: '#e8f6fd', color: '#3498db', padding: 15, borderRadius: '50%', fontSize: '1.8rem' }}><FaChartLine /></div>
              <div><h2 style={{ margin: 0, fontSize: '2rem' }}>{cantidadVentas}</h2><span style={{ color: 'var(--muted)' }}>Ventas Realizadas</span></div>
            </div>
          </div>
        </div>

        {/* TABLA */}
        <div className="card">
          <div className="card-body" style={{ overflowX: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>Transacciones</h3>
            {boletasFiltradas.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No hay ventas en este periodo.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: 'var(--muted)' }}>
                    <th style={{ padding: '1rem' }}>ID</th>
                    <th style={{ padding: '1rem' }}>Fecha</th>
                    <th style={{ padding: '1rem' }}>Cliente</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Monto</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {boletasFiltradas.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>#{b.id}</td>
                      <td style={{ padding: '1rem' }}>
                        {new Date(b.fecha).toLocaleDateString('es-CL')} <small style={{color:'#999'}}>{new Date(b.fecha).toLocaleTimeString('es-CL', {hour:'2-digit', minute:'2-digit'})}</small>
                      </td>
                      <td style={{ padding: '1rem' }}>{b.usuarioEmail}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: '#2ecc71' }}>{CLP(b.total)}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button className="btn btn-ghost" onClick={() => verDetalle(b)} style={{ padding: '5px 10px' }}><FaEye /> Ver</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* MODAL DETALLE */}
        {boletaSeleccionada && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Boleta #{boletaSeleccionada.id}</h3>
                <button onClick={cerrarModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}><FaTimes/></button>
              </div>
              <div className="card-body">
                <div style={{marginBottom:'1.5rem', padding:'10px', background:'#f8f9fa', borderRadius:'8px', fontSize:'0.9rem', color:'#555'}}>
                    <p style={{margin:'4px 0'}}><FaUser style={{marginRight:5}}/> <strong>Cliente:</strong> {boletaSeleccionada.usuarioEmail}</p>
                    <p style={{margin:'4px 0'}}><FaMapMarkerAlt style={{marginRight:5}}/> <strong>Envío:</strong> {boletaSeleccionada.direccion}</p>
                </div>
                {cargandoDetalle ? <p className="text-center">Cargando...</p> : detalles.length === 0 ? 
                  <div style={{textAlign:'center', padding:'1rem', color:'#e67e22', border:'1px dashed #e67e22', borderRadius:'8px', background:'#fffaf0'}}><p style={{margin:0, fontWeight:'bold'}}>⚠️ Detalles no disponibles</p></div> : 
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {detalles.map((d, index) => (
                      <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                        <img src={d.producto?.urlImagen || '/placeholder.jpg'} alt="prod" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }} />
                        <div style={{ flex: 1 }}><div style={{ fontWeight: 'bold' }}>{d.producto?.nombre || 'Producto Eliminado'}</div><div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{d.cantidad} x {CLP(d.precioUnitario)}</div></div>
                        <div style={{ fontWeight: 'bold' }}>{CLP(d.cantidad * d.precioUnitario)}</div>
                      </div>
                    ))}
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800', color: 'var(--brand)' }}><span>Total</span><span>{CLP(boletaSeleccionada.total)}</span></div>
                  </div>
                }
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