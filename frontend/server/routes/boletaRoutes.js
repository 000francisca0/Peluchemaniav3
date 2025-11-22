// server/routes/boletaRoutes.js
import express from 'express';
import { db } from '../database.js';

const router = express.Router();

/** LIST ALL RECEIPTS */
router.get('/', (_req, res) => {
  const sql = `
    SELECT b.*, u.nombre || ' ' || u.apellidos AS cliente
    FROM boletas b
    JOIN usuarios u ON u.id = b.usuario_id
    ORDER BY b.fecha_compra DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ data: rows || [] });
  });
});

/** GET RECEIPT WITH DETAILS */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM boletas WHERE id = ?`;
  db.get(sql, [id], (err, boleta) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!boleta) return res.status(404).json({ error: 'Boleta no encontrada' });

    const dsql = `SELECT * FROM boleta_detalles WHERE boleta_id = ?`;
    db.all(dsql, [id], (derr, detalles) => {
      if (derr) return res.status(500).json({ error: derr.message });
      res.json({ data: { ...boleta, detalles: detalles || [] } });
    });
  });
});

export default router;
