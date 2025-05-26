const express = require('express');
const router = express.Router();
const Cliente = require('../models/clienteModel');

// Crear nuevo cliente
router.post('/', async (req, res) => {
  try {
    const nuevo = await Cliente.crear(req.body);
    res.json(nuevo);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

// Buscar por nombre (autocomplete)
router.get('/', async (req, res) => {
  try {
    const { nombre } = req.query;
    const resultados = await Cliente.buscarPorNombre(nombre || '');
    res.json(resultados);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar cliente' });
  }
});

// Obtener por ID
router.get('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.obtenerPorId(req.params.id);
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
});

module.exports = router;
