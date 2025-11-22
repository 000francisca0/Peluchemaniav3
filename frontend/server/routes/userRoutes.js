// server/routes/userRoutes.js
import express from 'express';
import { db } from '../database.js';

const router = express.Router();

/** LIST ALL USERS (basic fields + role) */
router.get('/', (_req, res) => {
  const sql = `
    SELECT u.id, u.nombre, u.apellidos, u.email, r.nombre AS rol,
           COALESCE(d.calle,'') AS calle, COALESCE(d.depto,'') AS depto,
           COALESCE(d.region,'') AS region, COALESCE(d.comuna,'') AS comuna
    FROM usuarios u
    LEFT JOIN roles r ON r.id = u.rol_id
    LEFT JOIN direcciones d ON d.usuario_id = u.id
    ORDER BY u.id ASC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ data: rows || [] });
  });
});

/** GET USER BY ID (with address) */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT u.id, u.nombre, u.apellidos, u.email, r.nombre AS rol,
           d.calle, d.depto, d.region, d.comuna
    FROM usuarios u
    LEFT JOIN roles r ON r.id = u.rol_id
    LEFT JOIN direcciones d ON d.usuario_id = u.id
    WHERE u.id = ?
  `;
  db.get(sql, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ data: row });
  });
});

/** CREATE USER (simple admin-created user, no login flow here) */
router.post('/', (req, res) => {
  const { nombre, apellidos, email, password_hash, rol_id } = req.body;
  if (!nombre || !apellidos || !email || !password_hash || !rol_id) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  const sql = `
    INSERT INTO usuarios (nombre, apellidos, email, password_hash, rol_id)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(sql, [nombre, apellidos, email, password_hash, rol_id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

/** UPDATE USER (and optional address) */
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const {
    nombre, apellidos, email, rol_id,
    calle, depto, region, comuna
  } = req.body;

  // update user
  const sqlU = `
    UPDATE usuarios
    SET nombre = COALESCE(?, nombre),
        apellidos = COALESCE(?, apellidos),
        email = COALESCE(?, email),
        rol_id = COALESCE(?, rol_id)
    WHERE id = ?
  `;
  db.run(sqlU, [nombre, apellidos, email, rol_id, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    // upsert address
    if (calle || region || comuna || typeof depto !== 'undefined') {
      const check = 'SELECT id FROM direcciones WHERE usuario_id = ?';
      db.get(check, [id], (e, r) => {
        if (e) return res.status(500).json({ error: e.message });
        if (!r) {
          const ins = `
            INSERT INTO direcciones (usuario_id, calle, depto, region, comuna)
            VALUES (?, ?, ?, ?, ?)
          `;
          db.run(ins, [id, calle || '', depto || null, region || '', comuna || ''], (ie) => {
            if (ie) return res.status(500).json({ error: ie.message });
            res.json({ message: 'Usuario actualizado (y dirección creada).' });
          });
        } else {
          const upd = `
            UPDATE direcciones
            SET calle = COALESCE(?, calle),
                depto = COALESCE(?, depto),
                region = COALESCE(?, region),
                comuna = COALESCE(?, comuna)
            WHERE usuario_id = ?
          `;
          db.run(upd, [calle, depto, region, comuna, id], (ue) => {
            if (ue) return res.status(500).json({ error: ue.message });
            res.json({ message: 'Usuario actualizado.' });
          });
        }
      });
    } else {
      res.json({ message: 'Usuario actualizado.' });
    }
  });
});

/** USER PURCHASE HISTORY (boletas + detalles) */
router.get('/:id/boletas', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT b.*, 
      (SELECT json_group_array(json_object(
        'id', d.id,
        'producto_id', d.producto_id,
        'nombre_producto', d.nombre_producto,
        'precio_unitario', d.precio_unitario,
        'cantidad', d.cantidad,
        'imagen_url', COALESCE(d.imagen_url,'')
      )) FROM boleta_detalles d WHERE d.boleta_id = b.id) AS detalles
    FROM boletas b
    WHERE b.usuario_id = ?
    ORDER BY b.fecha_compra DESC
  `;
  db.all(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ data: (rows || []).map(r => ({ ...r, detalles: JSON.parse(r.detalles || '[]') })) });
  });
});

export default router;
