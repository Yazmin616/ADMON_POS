const db = require('../db');

const Cliente = {
  async crear({ nombre, telefono, direccion, correo }) {
    const [result] = await db.query(
      'INSERT INTO clientes (nombre, telefono, direccion, correo) VALUES (?, ?, ?, ?)',
      [nombre, telefono, direccion, correo]
    );
    return { id: result.insertId, nombre, telefono, direccion, correo };
  },

  async buscarPorNombre(nombre) {
    const [rows] = await db.query(
      'SELECT * FROM clientes WHERE nombre LIKE ? LIMIT 5',
      [`%${nombre}%`]
    );
    return rows;
  },

  async obtenerPorId(id) {
    const [rows] = await db.query(
      'SELECT * FROM clientes WHERE id = ?',
      [id]
    );
    return rows[0];
  }
};

module.exports = Cliente;
