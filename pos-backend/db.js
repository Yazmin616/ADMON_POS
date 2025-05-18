// db.js
const mysql = require('mysql2');

// Usar las variables del archivo .env
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
    process.exit(1); // Si no se puede conectar, termina el proceso
  }
  console.log('✅ Conexión exitosa con la base de datos');
});

module.exports = db;
