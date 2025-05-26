const express = require('express');
const router = express.Router();
const db = require('../db'); // pool ya soporta promesas

router.get('/', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        p.id, p.name, p.price, p.stock, 
        p.min_stock, p.max_stock,
        p.capacity,
        p.category_id, c.name AS category_name,
        p.brand_id, b.name AS brand_name,
        p.container_id, ct.type AS container_type
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN containers ct ON p.container_id = ct.id
      WHERE p.active = 1
    `);
    res.json(results);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Agregar un nuevo producto
router.post('/', async (req, res) => {
  const {
    name, price, stock, min_stock, max_stock,
    category_id, capacity, brand_id, container_id
  } = req.body;

  if (!name || !price || !stock || !min_stock || !max_stock || !category_id) {
    return res.status(400).json({ error: 'Faltan datos obligatorios del producto' });
  }

  const sql = `
    INSERT INTO products 
    (name, price, stock, min_stock, max_stock, category_id, capacity, brand_id, container_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await db.query(sql, [
      name, price, stock, min_stock, max_stock,
      category_id, capacity || null,
      brand_id || null, container_id || null
    ]);

    res.json({ message: 'Producto agregado con éxito', productId: result.insertId });
  } catch (err) {
    console.error('Error al agregar producto:', err);
    res.status(500).json({ error: 'Error al agregar producto' });
  }
});

// Actualizar un producto
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  const fields = [
    'name', 'price', 'stock', 'min_stock', 'max_stock',
    'category_id', 'capacity', 'brand_id', 'container_id'
  ];

  const updates = [];
  const values = [];

  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  });

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
  }

  values.push(id); // Para el WHERE

  const sql = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;

  try {
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Devolver el producto actualizado
    const [updatedProductRows] = await db.query(`
      SELECT 
        p.id, p.name, p.price, p.stock, p.min_stock, p.max_stock,
        c.name AS category_name, p.category_id,
        p.capacity, p.brand_id, p.container_id
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);

    res.json(updatedProductRows[0]);
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Obtener productos filtrados por categoría y marca
router.get('/by-category-brand', async (req, res) => {
  const { categoryId, brandId } = req.query;
  try {
    const [results] = await db.query(
      'SELECT * FROM products WHERE category_id = ? AND brand_id = ?',
      [categoryId, brandId]
    );
    res.json(results);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Eliminar producto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;
