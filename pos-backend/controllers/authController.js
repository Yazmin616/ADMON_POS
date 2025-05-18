// controllers/authController.js
const db = require('../db');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const sql = 'SELECT * FROM users WHERE username = ?';
    
    // Usamos db.query de forma asíncrona
    db.query(sql, [username], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error del servidor al consultar la base de datos' });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Usuario no encontrado' });
      }

      const user = results[0];

      // Comparación de contraseñas sin encriptar (solo para desarrollo)
      if (user.password !== password) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      });
    });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};
