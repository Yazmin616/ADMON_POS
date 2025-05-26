// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/sales');
const categoriesRoutes = require('./routes/categoryRoutes');
const clientRoutes = require('./routes/clientRoutes');
const brandsRoutes = require('./routes/brandRoutes');
const containersRoutes = require('./routes/containerRoutes');


const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('POS backend funcionando ✅');
});

(async () => {
  try {
    // Verificamos la conexión a la base de datos con async/await
    await db.query('SELECT 1');
    console.log('✅ Conexión con la base de datos establecida correctamente');

    // Definir rutas
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/sales', saleRoutes);
    app.use('/api/categories', categoriesRoutes);
    app.use('/api/clientes', clientRoutes);
    app.use('/api/brands', brandsRoutes);
    app.use('/api/containers', containersRoutes);
    

    // Iniciar servidor
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Error al conectar con la base de datos:', err);
    process.exit(1);
  }
})();
