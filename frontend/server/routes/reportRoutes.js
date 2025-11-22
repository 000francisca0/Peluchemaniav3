// server/routes/reportRoutes.js
import express from 'express';
import { db } from '../database.js';

const router = express.Router();

/** SALES SUMMARY BETWEEN DATES */
router.get('/sales', (req, res) => {
  const { from, to } = req.query; // YYYY-MM-DD
  const where = (from && to) ? `WHERE date(fecha_compra) BETWEEN date(?) AND date(?)` : ``;
  const params = (from && to) ? [from, to] : [];

  const sql = `
    SELECT COUNT(*) AS num_boletas, COALESCE(SUM(total),0) AS total_vendido
    FROM boletas
    ${where}
  `;
  db.get(sql, params, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ data: row });
  });
});

/** TOP PRODUCTS BETWEEN DATES */
router.get('/top-products', (req, res) => {
  const { from, to } = req.query;
  const where = (from && to) ? `WHERE date(b.fecha_compra) BETWEEN date(?) AND date(?)` : ``;
  const params = (from && to) ? [from, to] : [];

  const sql = `
    SELECT d.producto_id, d.nombre_producto,
           SUM(d.cantidad) AS unidades, SUM(d.cantidad * d.precio_unitario) AS total
    FROM boleta_detalles d
    JOIN boletas b ON b.id = d.boleta_id
    ${where}
    GROUP BY d.producto_id, d.nombre_producto
    ORDER BY total DESC
    LIMIT 20
  `;
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ data: rows || [] });
  });
});

export default router;
