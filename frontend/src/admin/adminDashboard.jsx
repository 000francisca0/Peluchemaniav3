import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBoxOpen, FaTags, FaUsers, FaClipboardList, FaChartLine, FaUserCog } from 'react-icons/fa';

export default function AdminDashboard() {
  const { user } = useAuth();
  const rol = user?.rol || '';
  const esAdmin = rol === 'ADMIN' || rol === 'ROLE_ADMIN';

  // Definimos el menú completo
  const allMenuItems = [
    { 
      title: 'Productos', 
      path: '/admin/productos', 
      icon: <FaBoxOpen />, 
      desc: 'Gestionar inventario', 
      allowed: ['ADMIN', 'ROLE_ADMIN', 'VENDEDOR', 'ROLE_VENDEDOR'] // Todos
    },
    { 
      title: 'Ventas', 
      path: '/admin/boletas', 
      icon: <FaClipboardList />, 
      desc: 'Historial de pedidos', 
      allowed: ['ADMIN', 'ROLE_ADMIN', 'VENDEDOR', 'ROLE_VENDEDOR'] // Todos
    },
    { 
      title: 'Categorías', 
      path: '/admin/categorias', 
      icon: <FaTags />, 
      desc: 'Editar categorías', 
      allowed: ['ADMIN', 'ROLE_ADMIN'] // Solo Admin
    },
    { 
      title: 'Usuarios', 
      path: '/admin/usuarios', 
      icon: <FaUsers />, 
      desc: 'Ver clientes', 
      allowed: ['ADMIN', 'ROLE_ADMIN'] // Solo Admin
    },
    { 
      title: 'Reportes', 
      path: '/admin/reportes', 
      icon: <FaChartLine />, 
      desc: 'Estadísticas', 
      allowed: ['ADMIN', 'ROLE_ADMIN'] // Solo Admin
    },
    { 
      title: 'Mi Perfil', 
      path: '/admin/perfil', 
      icon: <FaUserCog />, 
      desc: 'Configuración', 
      allowed: ['ADMIN', 'ROLE_ADMIN'] // Solo Admin (Opcional)
    },
  ];

  // Filtramos según el rol del usuario
  const menuVisible = allMenuItems.filter(item => item.allowed.includes(rol));

  return (
    <div className="main-content">
      <div className="container">
        
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
          <h1 style={{ color: 'var(--brand)', margin: 0 }}>Panel de Control</h1>
          <p style={{ color: 'var(--muted)', margin: '0.5rem 0 0' }}>
            Hola, <strong>{user?.nombre || 'Usuario'}</strong> ({esAdmin ? 'Administrador Total' : 'Vendedor'})
          </p>
        </div>

        {/* Grid de Opciones */}
        <div className="grid">
          {menuVisible.map((item, index) => (
            <Link 
              key={index} 
              to={item.path} 
              className="card hover-effect"
              style={{ textDecoration: 'none', color: 'inherit', borderLeft: '4px solid var(--brand)' }}
            >
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', color: 'var(--brand)', background: '#fff3f3', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  {item.icon}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{item.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)' }}>{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}