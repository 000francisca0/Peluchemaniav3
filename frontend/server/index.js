import express from 'express';
import cors from 'cors';
import { db } from './database.js';
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import categoriaRoutes from './routes/categoriaRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';
import bcrypt from 'bcryptjs';
import userRoutes from './routes/userRoutes.js';
import boletaRoutes from './routes/boletaRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const app = express();

// ----------------------------------------------------
// CONFIG 
// ----------------------------------------------------
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';
app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// STATIC FILES (IDENTICAL TO LOCAL)
// ----------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve everything in /public (so /osito.jpg etc. works)
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
app.use(express.static(PUBLIC_DIR));

// ✅ Create uploads folder inside /public and serve it too
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// /uploads/...  → serves public/uploads/
// /api/uploads/...  → also works for API_BASE + '/uploads/...'
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/api/uploads', express.static(UPLOADS_DIR));

// ----------------------------------------------------
// DATABASE + SEEDING
// ----------------------------------------------------
function initializeDatabase() {
  function ensureColumn(table, column, type, cb) {
    db.all(`PRAGMA table_info(${table});`, [], (err, rows) => {
      if (err) return cb && cb(err);
      const hasCol = rows.some(r => r.name === column);
      if (hasCol) return cb && cb(null);
      db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type};`, [], cb);
    });
  }

  db.serialize(() => {
    // 1. Roles
    db.run(`CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT UNIQUE NOT NULL
    );`);

    // 2. Usuarios
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apellidos TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      rol_id INTEGER,
      FOREIGN KEY (rol_id) REFERENCES roles(id)
    );`);

    // 3. Categorias
    db.run(`CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT UNIQUE NOT NULL
    );`);

    // 4. Productos
    db.run(`CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      precio REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      imagen_url TEXT,
      categoria_id INTEGER,
      on_sale INTEGER NOT NULL DEFAULT 0,
      discount_percentage REAL,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    );`);

    ensureColumn('productos', 'discount_percentage', 'REAL', () => {});

    // 5. Producto_imagenes
    db.run(`CREATE TABLE IF NOT EXISTS producto_imagenes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_id INTEGER NOT NULL,
      imagen_url TEXT NOT NULL,
      orden INTEGER NOT NULL,
      FOREIGN KEY (producto_id) REFERENCES productos(id)
    );`);

    // 6. Direcciones
    db.run(`CREATE TABLE IF NOT EXISTS direcciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      calle TEXT NOT NULL,
      depto TEXT,
      region TEXT NOT NULL,
      comuna TEXT NOT NULL,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );`);

    // 7. Boletas
    db.run(`CREATE TABLE IF NOT EXISTS boletas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      fecha_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
      total REAL NOT NULL,
      calle_envio TEXT NOT NULL,
      depto_envio TEXT,
      region_envio TEXT NOT NULL,
      comuna_envio TEXT NOT NULL,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );`);

    // 8. Boleta_Detalles
    db.run(`CREATE TABLE IF NOT EXISTS boleta_detalles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      boleta_id INTEGER NOT NULL,
      producto_id INTEGER NOT NULL,
      nombre_producto TEXT NOT NULL,
      precio_unitario REAL NOT NULL,
      cantidad INTEGER NOT NULL,
      imagen_url TEXT,
      FOREIGN KEY (boleta_id) REFERENCES boletas(id),
      FOREIGN KEY (producto_id) REFERENCES productos(id)
    );`);

    // ---- Seeds (unchanged) ----
    const seedRoles = (cb) => {
      db.get('SELECT COUNT(*) AS count FROM roles', (err, row) => {
        if (err) return cb(err);
        if (row.count === 0) {
          db.run("INSERT INTO roles (nombre) VALUES ('Administrador')", (e1) => {
            if (e1) return cb(e1);
            db.run("INSERT INTO roles (nombre) VALUES ('Cliente')", cb);
          });
        } else cb(null);
      });
    };

    const seedCategorias = (cb) => {
      db.get('SELECT COUNT(*) AS count FROM categorias', (err, row) => {
        if (err) return cb(err);
        if (row.count === 0) {
          db.run("INSERT INTO categorias (nombre) VALUES ('Osos')", (e1) => {
            if (e1) return cb(e1);
            db.run("INSERT INTO categorias (nombre) VALUES ('Animales')", (e2) => {
              if (e2) return cb(e2);
              db.run("INSERT INTO categorias (nombre) VALUES ('Fantasía')", cb);
            });
          });
        } else cb(null);
      });
    };

    const seedProductos = (cb) => {
      const initialProducts = [
        { nombre: 'Oso Clásico de Peluche', descripcion: 'El clásico y fiel amigo de peluche.', precio: 19990, stock: 15, imagen_url: '/osito.jpg', categoria_id: 1, on_sale: 0, discount_percentage: 0.25 },
        { nombre: 'Conejo Saltarin Suave', descripcion: 'Ideal para abrazar, orejas largas.', precio: 15990, stock: 22, imagen_url: '/conejo.jpg', categoria_id: 2, on_sale: 0, discount_percentage: 0.00 },
        { nombre: 'Dinosaurio Rex Amigable', descripcion: 'Un T-Rex muy amigable.', precio: 22990, stock: 5, imagen_url: '/dinosaurio.jpg', categoria_id: 2, on_sale: 0, discount_percentage: 0.10 },
        { nombre: 'Unicornio Mágico Brillante', descripcion: 'Brilla con magia.', precio: 24990, stock: 8, imagen_url: '/unicornio.jpg', categoria_id: 3, on_sale: 0, discount_percentage: 0.15 },
        { nombre: 'Panda', descripcion: 'Panda de bambú suave.', precio: 18990, stock: 12, imagen_url: '/panda.jpg', categoria_id: 1, on_sale: 0, discount_percentage: 0.20 },
        { nombre: 'Perezoso', descripcion: 'Para abrazos lentos.', precio: 21990, stock: 10, imagen_url: '/peresozo.jpg', categoria_id: 2, on_sale: 0, discount_percentage: null },
      ];

      db.get('SELECT COUNT(*) AS count FROM productos', (err, row) => {
        if (err) return cb(err);
        if (row.count === 0) {
          const stmt = db.prepare(`INSERT INTO productos 
            (nombre, descripcion, precio, stock, imagen_url, categoria_id, on_sale, discount_percentage) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
          initialProducts.forEach(p => {
            stmt.run(
              p.nombre, p.descripcion || null, p.precio, p.stock,
              p.imagen_url || null, p.categoria_id || null, p.on_sale ? 1 : 0,
              p.discount_percentage == null ? null : p.discount_percentage
            );
          });
          stmt.finalize(cb);
        } else cb(null);
      });
    };

    const seedAdminUserAndAddress = (cb) => {
      const ADMIN_EMAIL = 'admin@duoc.cl';
      const ADMIN_PASS = 'admin123';

      db.get("SELECT id FROM roles WHERE nombre = 'Administrador'", (roleErr, roleRow) => {
        if (roleErr) return cb(roleErr);
        if (!roleRow) return cb(new Error("Admin role missing"));

        const adminRoleId = roleRow.id;

        db.get('SELECT id, rol_id FROM usuarios WHERE email = ?', [ADMIN_EMAIL], (usrErr, userRow) => {
          if (usrErr) return cb(usrErr);

          const ensureAddress = (usuarioId) => {
            db.get('SELECT id FROM direcciones WHERE usuario_id = ?', [usuarioId], (addrErr, addrRow) => {
              if (addrErr) return cb(addrErr);
              if (addrRow) return cb(null);
              db.run(
                `INSERT INTO direcciones (usuario_id, calle, depto, region, comuna)
                 VALUES (?, ?, ?, ?, ?)`,
                [usuarioId, 'Av. Siempre Viva 742', 'Oficina 101', 'Región Metropolitana de Santiago', 'Santiago'],
                cb
              );
            });
          };

          if (!userRow) {
            const hash = bcrypt.hashSync(ADMIN_PASS, 10);
            db.run(
              `INSERT INTO usuarios (nombre, apellidos, email, password_hash, rol_id)
               VALUES (?, ?, ?, ?, ?)`,
              ['Admin', 'Principal', ADMIN_EMAIL, hash, adminRoleId],
              function (insErr) {
                if (insErr) return cb(insErr);
                ensureAddress(this.lastID);
              }
            );
          } else {
            if (userRow.rol_id !== adminRoleId) {
              db.run('UPDATE usuarios SET rol_id = ? WHERE id = ?', [adminRoleId, userRow.id], (updErr) => {
                if (updErr) return cb(updErr);
                ensureAddress(userRow.id);
              });
            } else {
              ensureAddress(userRow.id);
            }
          }
        });
      });
    };

    const seedDemoClientAndSales = (cb) => {
      const DEMO_EMAIL = 'cliente.demo@gmail.com';
      const DEMO_PASS_HASH = bcrypt.hashSync('demo1234', 10);

      const ensureSales = (uid, done) => {
        db.get('SELECT COUNT(*) AS c FROM boletas', (be, br) => {
          if (be) return done(be);
          if ((br?.c || 0) > 0) return done(null);

          db.all('SELECT id, nombre, precio, imagen_url FROM productos LIMIT 3', (pe, prs) => {
            if (pe) return done(pe);
            if (!prs?.length) return done(null);

            const saleSets = [
              { when: '-30 days', items: [{ p: prs[0], q: 1 }, { p: prs[1], q: 2 }] },
              { when: '-10 days', items: [{ p: prs[1], q: 1 }] },
              { when: '-2 days',  items: [{ p: prs[2], q: 3 }] },
            ];

            let pending = saleSets.length;
            saleSets.forEach((s) => {
              const total = s.items.reduce((sum, it) => sum + it.p.precio * it.q, 0);
              db.run(
                `INSERT INTO boletas (usuario_id, fecha_compra, total, calle_envio, depto_envio, region_envio, comuna_envio)
                 VALUES (?, datetime('now','${s.when}'), ?, 'Calle Falsa 123', 'Depto 5', 'Región Metropolitana de Santiago', 'Santiago')`,
                [uid, total],
                function (err) {
                  if (err) return done(err);
                  const boletaId = this.lastID;
                  let pendingItems = s.items.length;
                  s.items.forEach((it) => {
                    db.run(
                      `INSERT INTO boleta_detalles (boleta_id, producto_id, nombre_producto, precio_unitario, cantidad, imagen_url)
                       VALUES (?, ?, ?, ?, ?, ?)`,
                      [boletaId, it.p.id, it.p.nombre, it.p.precio, it.q, it.p.imagen_url || null],
                      (e2) => {
                        if (e2) return done(e2);
                        if (--pendingItems === 0 && --pending === 0) done(null);
                      }
                    );
                  });
                }
              );
            });
          });
        });
      };

      db.get("SELECT id FROM roles WHERE nombre='Cliente'", (re, rr) => {
        if (re) return cb(re);
        if (!rr) return cb(new Error('Cliente role missing'));

        db.get('SELECT id FROM usuarios WHERE email = ?', [DEMO_EMAIL], (uErr, uRow) => {
          if (uErr) return cb(uErr);

          if (!uRow) {
            db.run(
              `INSERT INTO usuarios (nombre, apellidos, email, password_hash, rol_id)
               VALUES ('Cliente','Demo', ?, ?, ?)`,
              [DEMO_EMAIL, DEMO_PASS_HASH, rr.id],
              function (ie) {
                if (ie) return cb(ie);
                const uid = this.lastID;
                db.run(
                  `INSERT INTO direcciones (usuario_id, calle, depto, region, comuna)
                   VALUES (?, 'Calle Falsa 123', 'Depto 5', 'Región Metropolitana de Santiago', 'Santiago')`,
                  [uid],
                  (adErr) => {
                    if (adErr) return cb(adErr);
                    ensureSales(uid, cb);
                  }
                );
              }
            );
          } else {
            ensureSales(uRow.id, cb);
          }
        });
      });
    };

    // Chain everything:
    seedRoles((e1) => {
      if (e1) return console.error('Seed roles error:', e1.message);
      seedCategorias((e2) => {
        if (e2) return console.error('Seed categorias error:', e2.message);
        seedProductos((e3) => {
          if (e3) return console.error('Seed productos error:', e3.message);
          seedAdminUserAndAddress((e4) => {
            if (e4) return console.error('Seed admin error:', e4.message);
            seedDemoClientAndSales((e5) => {
              if (e5) return console.error('Seed demo sales error:', e5.message);
              console.log('✅ Seeding completo.');
            });
          });
        });
      });
    });
  });
}

initializeDatabase();

// ----------------------------------------------------
// RUTAS
// ----------------------------------------------------
app.get('/', (_req, res) => res.send('API de Peluchemania funcionando!'));

app.use('/api/productos', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/users', userRoutes);
app.use('/api/boletas', boletaRoutes);
app.use('/api/reportes', reportRoutes);

// ----------------------------------------------------
// START (bind to HOST for systemd/nginx proxy)
// ----------------------------------------------------
app.listen(PORT, HOST, () => {
  console.log(`Servidor Express escuchando en http://${HOST}:${PORT}`);
});
