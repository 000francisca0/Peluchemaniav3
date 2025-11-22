// Example: CuidadoPeluches.jsx (apply same to HistoriaOsoTeddy.jsx)
import React from 'react';

function CuidadoPeluches() {
  const layoutStyle = {
    minHeight: 'auto',
    padding: '100px 2rem 40px 2rem',
    width: '100%',
    boxSizing: 'border-box',
    // ✅ Add global background
    backgroundImage: 'url("/oso5.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  const cardStyle = {
    maxWidth: '900px',
    margin: '0 auto',
    // ✅ Add a subtle white background with padding & rounded corners
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  };

  return (
    <div style={layoutStyle}>
      <div className="content-card" style={cardStyle}>
        <h1 className="productos-title" style={{ fontSize: '2rem' }}>
          Guía de Cuidado: Cómo Mantener tu Peluche como Nuevo
        </h1>
        <p>Publicado el 16 de Octubre de 2025</p>
        <hr />
        
        <h2>El Lavado Suave es la Clave</h2>
        <p>
          Para la mayoría de los peluches, el <strong>lavado a mano</strong> es la opción más segura. 
          Utiliza agua tibia y un detergente suave para ropa delicada. Nunca uses blanqueadores...
        </p>

        <h2>Secado Correcto</h2>
        <p>
          Evita la secadora, ya que el calor puede dañar las fibras y el relleno. 
          Envuelve el peluche en una toalla limpia para absorber el exceso de agua y luego
          déjalo secar al aire libre...
        </p>
      </div>
    </div>
  );
}

export default CuidadoPeluches;
