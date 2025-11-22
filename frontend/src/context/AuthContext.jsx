import React, { createContext, useState, useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  // 1. INICIALIZACIÓN: Intentamos recuperar al usuario guardado si recargas la página
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_data');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2. LOGIN: Recibe los datos del Backend y los guarda
  const login = (userData, token) => {
    // Guardamos el token para las peticiones
    localStorage.setItem('token', token);

    // PREPARAR OBJETO DE USUARIO
    // El backend envía campos sueltos (direccionCalle, direccionRegion...)
    // Nosotros los agrupamos en 'direccionDefault' para que el Checkout los lea fácil.
    const userToSave = {
      id: userData.id,
      nombre: userData.nombre,
      email: userData.email,
      rol: userData.rol, // "ADMIN", "CLIENTE", etc.
      
      // Creamos el objeto de dirección agrupado
      direccionDefault: {
        region: userData.direccionRegion || '',
        comuna: userData.direccionComuna || '',
        calle: userData.direccionCalle || '',
        depto: userData.direccionDepto || ''
      }
    };

    // Guardamos en el navegador y en el estado
    localStorage.setItem('user_data', JSON.stringify(userToSave));
    setUser(userToSave);
  };

  // 3. LOGOUT: Limpia todo
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

// --- COMPONENTES DE PROTECCIÓN DE RUTAS ---

// 1. Para rutas que requieren estar logueado (ej: Carrito, Checkout)
export const RequireAuth = ({ children }) => {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.user) {
    // Si no está logueado, lo mandamos al login y recordamos de dónde venía
    return <Navigate to="/inicio" state={{ from: location }} replace />;
  }

  return children;
};

// 2. Para rutas de ADMINISTRADOR (y Vendedor)
export const RequireAdmin = ({ children }) => {
  const auth = useAuth();
  const location = useLocation();

  // Permitimos acceso si es ADMIN o VENDEDOR
  const esPersonalAutorizado = 
    auth.user?.rol === 'ADMIN' || 
    auth.user?.rol === 'ROLE_ADMIN' ||
    auth.user?.rol === 'VENDEDOR' || 
    auth.user?.rol === 'ROLE_VENDEDOR';

  if (!auth.user || !esPersonalAutorizado) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};