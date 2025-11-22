// server/routes/authRoutes.js (ACTUALIZADO)

import express from 'express';
import { db } from '../database.js';
import bcrypt from 'bcryptjs';

const router = express.Router();
const saltRounds = 10;

// Registro de usuario (cliente por defecto) + dirección
router.post('/register', async (req, res) => {
  const { nombre, apellidos, email, password, calle, depto, region, comuna } = req.body;

  if (!nombre || !apellidos || !email || !password || !calle || !region || !comuna) {
    return res.status(400).json({ error: "Todos los campos (excepto Depto) son obligatorios." });
  }

  try {
    const password_hash = await bcrypt.hash(password, saltRounds);
    const rol_id = 2; // Cliente

    db.serialize(() => {
      db.run('BEGIN TRANSACTION;');

      db.run(
        `INSERT INTO usuarios (nombre, apellidos, email, password_hash, rol_id) VALUES (?, ?, ?, ?, ?)`,
        [nombre, apellidos, email, password_hash, rol_id],
        function (err) {
          if (err) {
            db.run('ROLLBACK;');
            if (err.message.includes('UNIQUE')) {
              return res.status(409).json({ error: 'El correo ya está registrado.' });
            }
            return res.status(500).json({ error: err.message });
          }

          const usuario_id = this.lastID;

          db.run(
            `INSERT INTO direcciones (usuario_id, calle, depto, region, comuna) VALUES (?, ?, ?, ?, ?)`,
            [usuario_id, calle, depto || null, region, comuna],
            function (err2) {
              if (err2) {
                db.run('ROLLBACK;');
                return res.status(500).json({ error: 'Error al guardar la dirección.' });
              }

              db.run('COMMIT;', (commitErr) => {
                if (commitErr) {
                  db.run('ROLLBACK;');
                  return res.status(500).json({ error: 'Error de commit.' });
                }
                res.json({ message: 'Registro exitoso.', id: usuario_id });
              });
            }
          );
        }
      );
    });
  } catch (e) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Login (devuelve rol y dirección por defecto)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });

  const sql = `
    SELECT u.id, u.nombre, u.apellidos, u.email, u.password_hash, r.nombre AS rol_nombre,
           d.calle, d.depto, d.region, d.comuna
    FROM usuarios u
    JOIN roles r ON u.rol_id = r.id
    LEFT JOIN direcciones d ON d.usuario_id = u.id
    WHERE u.email = ?
  `;
  db.get(sql, [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Credenciales incorrectas.' });

    try {
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Credenciales incorrectas.' });

      const userData = {
        id: user.id,
        nombre: user.nombre,
        apellidos: user.apellidos,
        email: user.email,
        rol: user.rol_nombre, // 'Administrador' o 'Cliente'
        direccion_default: {
          calle: user.calle,
          depto: user.depto,
          region: user.region,
          comuna: user.comuna,
        },
      };
      res.json({ message: 'Inicio de sesión exitoso.', user: userData });
    } catch {
      res.status(500).json({ error: 'Error en la verificación de contraseña.' });
    }
  });
});

export default router;
