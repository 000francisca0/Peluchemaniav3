// src/admin/adminPerfil.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminPerfil() {
  const { user } = useAuth();

  return (
    <main className="main-content">
      <div className="container">
        <article className="center-card">
          <h1 style={{ marginTop: 0 }}>Perfil de Administrador</h1>

          {!user ? (
            <p className="card-sub">Cargando usuario…</p>
          ) : (
            <div className="card" style={{ maxWidth: 700, margin: '0 auto' }}>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <div className="card-sub">Nombre</div>
                    <div style={{ fontWeight: 700 }}>{user.nombre} {user.apellidos}</div>
                  </div>
                  <div>
                    <div className="card-sub">Rol</div>
                    <span style={{ fontWeight: 800, color: 'var(--brand)' }}>{user.rol}</span>
                  </div>
                  <div>
                    <div className="card-sub">Email</div>
                    <div>{user.email}</div>
                  </div>
                  <div>
                    <div className="card-sub">Dirección por defecto</div>
                    {user.direccion_default ? (
                      <div>
                        {user.direccion_default.calle}{user.direccion_default.depto ? ` (${user.direccion_default.depto})` : ''}<br />
                        {user.direccion_default.comuna}, {user.direccion_default.region}
                      </div>
                    ) : (
                      <div>No registrada</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </article>
      </div>
    </main>
  );
}
