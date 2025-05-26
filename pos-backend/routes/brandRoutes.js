const express = require('express');
const router = express.Router();
const db = require('../db'); // Asegúrate que db exporta el pool de mysql2/promise

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM brands');
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener marcas:', err); // Log para debug
    res.status(500).json({ error: 'Error al obtener marcas' });
  }
});
// GET: todas las categorías
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM categories');
    res.json(results);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// POST: nueva categoría
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre requerido' });

  try {
    await db.query('INSERT INTO categories (name) VALUES (?)', [name]);
    res.status(201).json({ message: 'Categoría creada' });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

// Obtener marcas que tienen productos en una categoría específica
router.get('/by-category/:categoryId', async (req, res) => {
  const { categoryId } = req.params;
  try {
    const [results] = await db.query(`
      SELECT DISTINCT b.id, b.name 
      FROM products p
      JOIN brands b ON p.brand_id = b.id
      WHERE p.category_id = ?
    `, [categoryId]);

    res.json(results);
  } catch (error) {
    console.error('Error al obtener marcas por categoría:', error);
    res.status(500).json({ error: 'Error al obtener marcas' });
  }
});

module.exports = router;
