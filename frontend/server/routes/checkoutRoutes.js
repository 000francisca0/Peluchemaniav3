// server/routes/checkoutRoutes.js

import express from 'express';
import { db } from '../database.js';

const router = express.Router();

router.post('/purchase', async (req, res) => {
  const { userId, cartItems, shippingAddress } = req.body;

  if (!userId || !cartItems || cartItems.length === 0 || !shippingAddress) {
    return res.status(400).json({ error: "Faltan datos de usuario, carrito o dirección de envío." });
  }

  const { calle, depto, region, comuna } = shippingAddress;
  const total = cartItems.reduce((sum, item) => sum + Number(item.precio) * Number(item.quantity), 0);

  // Prechequeo de stock
  const checks = cartItems.map(
    (item) =>
      new Promise((resolve, reject) => {
        db.get('SELECT stock, nombre FROM productos WHERE id = ?', [item.id], (err, row) => {
          if (err) return reject(err);
          if (!row) return reject(new Error(`Producto ID ${item.id} no encontrado.`));
          if (row.stock < item.quantity)
            return reject(new Error(`Stock insuficiente para: ${row.nombre}. Stock disponible: ${row.stock}`));
          resolve();
        });
      })
  );

  try {
    await Promise.all(checks);
  } catch (e) {
    return res.status(409).json({ error: e.message });
  }

  // Transacción
  db.serialize(() => {
    db.run('BEGIN TRANSACTION;');

    db.run(
      `INSERT INTO boletas (usuario_id, total, calle_envio, depto_envio, region_envio, comuna_envio)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, total, calle, depto || null, region, comuna],
      function (err) {
        if (err) {
          db.run('ROLLBACK;');
          return res.status(500).json({ error: 'Error al crear la boleta.' });
        }
        const boleta_id = this.lastID;

        const detailPromises = cartItems.map(
          (item) =>
            new Promise((resolve, reject) => {
              db.run(
                `INSERT INTO boleta_detalles (boleta_id, producto_id, nombre_producto, precio_unitario, cantidad, imagen_url)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [boleta_id, item.id, item.nombre, item.precio, item.quantity, item.imagen || null],
                (errA) => {
                  if (errA) return reject(errA);
                  db.run(
                    `UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?`,
                    [item.quantity, item.id, item.quantity],
                    function (errB) {
                      if (errB) return reject(errB);
                      if (this.changes === 0) return reject(new Error(`Stock crítico falló para Producto ID ${item.id}.`));
                      resolve();
                    }
                  );
                }
              );
            })
        );

        Promise.all(detailPromises)
          .then(() => {
            db.run('COMMIT;', (commitErr) => {
              if (commitErr) {
                db.run('ROLLBACK;');
                return res.status(500).json({ error: 'Error de commit.' });
              }
              res.json({ message: 'Compra finalizada exitosamente.', boletaId: boleta_id });
            });
          })
          .catch((e) => {
            db.run('ROLLBACK;');
            res.status(500).json({ error: 'Error en la compra (Detalles/Stock): ' + e.message });
          });
      }
    );
  });
});

export default router;
