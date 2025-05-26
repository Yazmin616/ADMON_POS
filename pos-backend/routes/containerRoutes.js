const express = require('express');
const router = express.Router();
const db = require('../db'); // El pool ya es promise, no usar .promise()

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, type FROM containers');
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener envases:', err);
    res.status(500).json({ error: 'Error al obtener envases' });
  }
});

module.exports = router;
