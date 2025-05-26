const express = require('express');
const router = express.Router();
const db = require('../db'); // Asegúrate que 'db' exporta mysql2/promise

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

module.exports = router;
