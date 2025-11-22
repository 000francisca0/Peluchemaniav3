import React from 'react';
import { Link } from 'react-router-dom';

function Blog() {
  const articulos = [
    { id: 1, titulo: "Guía de Cuidado: Cómo Mantener tu Peluche como Nuevo", resumen: "Consejos y trucos esenciales para la limpieza y el almacenamiento de tus compañeros suaves.", path: "/blog/cuidado-de-peluches" },
    { id: 2, titulo: "La Historia del Oso Teddy: Un Clásico Atemporal", resumen: "Descubre el origen legendario del peluche más famoso del mundo y su impacto en la cultura pop.", path: "/blog/historia-oso-teddy" },
  ];

  return (
    <main className="main-content">
      <div className="container">
        <h1 className="mb-2" style={{ fontSize: '2.2rem', fontWeight: 800 }}>Nuestro Blog de Peluches</h1>

        <div className="grid">
          {articulos.map((articulo) => (
            <Link
              key={articulo.id}
              to={articulo.path}
              className="card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="card-body" style={{ paddingBottom: 0 }}>
                <h3 className="card-title" style={{ fontSize: '1.4rem' }}>{articulo.titulo}</h3>
                <p className="card-sub">{articulo.resumen}</p>
              </div>

              <div className="card-actions" style={{ justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost">Leer Más</button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Blog;
