const express = require('express');
const router = express.Router();
const db = require('../db');  // Asegúrate de que esta ruta sea correcta

// Obtener productos
router.get('/products', (req, res) => {
  const sql = 'SELECT * FROM products'; // Consulta SQL para obtener todos los productos
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      return res.status(500).json({ error: 'Error al obtener productos' });
    }
    res.json(results);  // Enviar los productos al frontend
  });
});

// Registrar una venta con validación de stock
router.post('/', async (req, res) => {
  const { carrito, total, iva, total_with_iva, user_id } = req.body;

  if (!carrito || carrito.length === 0 || !user_id) {
    return res.status(400).json({ error: 'Datos de venta incompletos' });
  }

  // Validación de stock
  const productIds = carrito.map(item => item.id);
  const placeholders = productIds.map(() => '?').join(',');
  const sql = `SELECT id, stock, min_stock FROM products WHERE id IN (${placeholders})`;

  try {
    const [results] = await db.promise().query(sql, productIds);  // Usamos db.promise() para facilitar el uso de async/await
    let errores = [];

    // Validamos si el stock es suficiente para cada producto en el carrito
    for (let item of carrito) {
      const producto = results.find(p => p.id === item.id);
      if (!producto) {
        errores.push(`Producto con ID ${item.id} no encontrado.`);
        continue;
      }

      const stockRestante = producto.stock - item.cantidad;

      if (item.cantidad > producto.stock) {
        errores.push(`No hay suficiente stock de producto ID ${item.id}.`);
      } else if (stockRestante < producto.min_stock) {
        errores.push(`Venta dejaría producto ID ${item.id} debajo del stock mínimo (${producto.min_stock}).`);
      }
    }

    if (errores.length > 0) {
      return res.status(400).json({ error: 'Validación de stock fallida', detalles: errores });
    }

    // Registrar la venta
    const sqlVenta = `
      INSERT INTO sales (user_id, total, iva, total_with_iva)
      VALUES (?, ?, ?, ?)
    `;

    const [ventaResult] = await db.promise().query(sqlVenta, [user_id, total, iva, total_with_iva]);
    const saleId = ventaResult.insertId;

    const detalles = carrito.map(item => [saleId, item.id, item.cantidad, item.subtotal]);

    const sqlDetalles = `
      INSERT INTO sale_details (sale_id, product_id, quantity, subtotal)
      VALUES ?
    `;

    await db.promise().query(sqlDetalles, [detalles]);

    // Actualizar stock
    const actualizarStock = carrito.map(item => {
      return db.promise().query(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [item.cantidad, item.id]
      );
    });

    await Promise.all(actualizarStock);

    res.json({ message: 'Venta registrada con éxito y stock actualizado', saleId });
  } catch (err) {
    console.error('Error al registrar la venta:', err);
    res.status(500).json({ error: 'Error al registrar la venta' });
  }
});

module.exports = router;
