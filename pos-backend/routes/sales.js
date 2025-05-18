const express = require('express');
const router = express.Router();
const db = require('../db');

// Registrar una venta con validación de stock
router.post('/', (req, res) => {
  const { carrito, total, iva, total_with_iva, user_id } = req.body;

  if (!carrito || carrito.length === 0 || !user_id) {
    return res.status(400).json({ error: 'Datos de venta incompletos' });
  }

  const productIds = carrito.map(item => item.id);
  const placeholders = productIds.map(() => '?').join(',');
  const sql = `SELECT id, stock, min_stock FROM products WHERE id IN (${placeholders})`;

  db.query(sql, productIds, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al validar stock' });

    let errores = [];

    // Validamos si el stock es suficiente para cada producto
    for (let item of carrito) {
      const producto = results.find(p => p.id === item.id);
      if (!producto) {
        errores.push(`Producto con ID ${item.id} no encontrado.`);
        continue;
      }

      const stockRestante = producto.stock - item.cantidad;

      if (item.cantidad > producto.stock) {
        errores.push(`No hay suficiente stock del producto ID ${item.id}. Solo hay ${producto.stock}.`);
      } else if (stockRestante < producto.min_stock) {
        errores.push(`Venta dejaría el producto ID ${item.id} debajo del stock mínimo (${producto.min_stock}). Quedarían ${stockRestante}.`);
      }
    }

    if (errores.length > 0) {
      return res.status(400).json({ error: 'Validación de stock fallida', detalles: errores });
    }

    // Insertar la venta
    const sqlVenta = `
      INSERT INTO sales (user_id, total, iva, total_with_iva)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sqlVenta, [user_id, total, iva, total_with_iva], (errVenta, result) => {
      if (errVenta) return res.status(500).json({ error: 'Error al guardar la venta' });

      const saleId = result.insertId;
      const detalles = carrito.map(item => [saleId, item.id, item.cantidad, item.subtotal]);

      const sqlDetalles = `
        INSERT INTO sale_details (sale_id, product_id, quantity, subtotal)
        VALUES ?
      `;

      db.query(sqlDetalles, [detalles], (errDetalles) => {
        if (errDetalles) return res.status(500).json({ error: 'Error al guardar detalles de venta' });

        // Actualizar stock
        const actualizarStock = carrito.map(item => {
          return new Promise((resolve, reject) => {
            const sqlUpdate = `UPDATE products SET stock = stock - ? WHERE id = ?`;
            db.query(sqlUpdate, [item.cantidad, item.id], (errUpdate) => {
              if (errUpdate) reject(errUpdate);
              else resolve();
            });
          });
        });

        Promise.all(actualizarStock)
          .then(() => {
            res.json({ message: 'Venta registrada con éxito y stock actualizado', saleId });
          })
          .catch(() => {
            res.status(500).json({ error: 'Venta registrada, pero error al actualizar stock' });
          });
      });
    });
  });
});

module.exports = router;
