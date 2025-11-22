// server/routes/categoriaRoutes.js
import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Read all
router.get('/', (_req, res) => {
  db.all('SELECT * FROM categorias ORDER BY id', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'success', data: rows });
  });
});

// Create
router.post('/', (req, res) => {
  const { nombre } = req.body || {};
  if (!nombre || !String(nombre).trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio.' });
  }
  db.run('INSERT INTO categorias (nombre) VALUES (?)', [String(nombre).trim()], function (err) {
    if (err) {
      if (err.message?.includes('UNIQUE')) {
        return res.status(409).json({ error: 'La categoría ya existe.' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Creada', data: { id: this.lastID, nombre: String(nombre).trim() } });
  });
});

// Update
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body || {};
  if (!nombre || !String(nombre).trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio.' });
  }
  db.run('UPDATE categorias SET nombre = ? WHERE id = ?', [String(nombre).trim(), id], function (err) {
    if (err) {
      if (err.message?.includes('UNIQUE')) {
        return res.status(409).json({ error: 'La categoría ya existe.' });
      }
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) return res.status(404).json({ error: 'No encontrada.' });
    res.json({ message: 'Actualizada' });
  });
});

// Delete
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM categorias WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'No encontrada.' });
    res.json({ message: 'Eliminada' });
  });
});

export default router;
