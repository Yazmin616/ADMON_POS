// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/sales');
const categoriesRoute = require('./routes/categoriesRoute');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('POS backend funcionando ✅');
});

// Verificación de la conexión a la base de datos
db.query('SELECT 1', (err) => {
  if (err) {
    console.error('❌ Error al conectar con la base de datos:', err);
    process.exit(1); // Si no puede conectar, termina el proceso
  }

  console.log('✅ Conexión con la base de datos establecida correctamente');

  // Rutas
  app.use('/api/auth', authRoutes);
  app.use('/api', productRoutes);
  app.use('/api/sales', saleRoutes);
  app.use('/api/categories', categoriesRoute);

  // Iniciar servidor
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
});
