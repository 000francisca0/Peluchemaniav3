import React, { createContext, useState, useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_data');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    
    const userToSave = {
      id: userData.id,
      nombre: userData.nombre,
      email: userData.email,
      rol: userData.rol,
      direccionDefault: {
        region: userData.direccionRegion || '',
        comuna: userData.direccionComuna || '',
        calle: userData.direccionCalle || '',
        depto: userData.direccionDepto || ''
      }
    };

    localStorage.setItem('user_data', JSON.stringify(userToSave));
    setUser(userToSave);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- PROTECCIÓN DE RUTAS ---

export const RequireAuth = ({ children }) => {
  const auth = useAuth();
  const location = useLocation();
  if (!auth.user) return <Navigate to="/inicio" state={{ from: location }} replace />;
  return children;
};

// CORREGIDO: Acepta ADMIN y VENDEDOR
export const RequireAdmin = ({ children }) => {
  const auth = useAuth();
  const location = useLocation();

  // Lista de roles permitidos en el panel
  const rolesPermitidos = ['ADMIN', 'ROLE_ADMIN', 'VENDEDOR', 'ROLE_VENDEDOR'];

  if (!auth.user || !rolesPermitidos.includes(auth.user.rol)) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};