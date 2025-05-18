const express = require('express');
const router = express.Router();
const db = require('../db'); // Asegúrate de que esta ruta sea válida

// GET: todas las categorías
router.get('/', (req, res) => {
  db.query('SELECT * FROM categories', (error, results) => {
    if (error) {
      console.error('Error al obtener categorías:', error);
      return res.status(500).json({ error: 'Error al obtener categorías' });
    }
    res.json(results);
  });
});

// POST: nueva categoría
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre requerido' });

  db.query('INSERT INTO categories (name) VALUES (?)', [name], (error, result) => {
    if (error) {
      console.error('Error al crear categoría:', error);
      return res.status(500).json({ error: 'Error al crear categoría' });
    }
    res.status(201).json({ message: 'Categoría creada' });
  });
});

module.exports = router;
