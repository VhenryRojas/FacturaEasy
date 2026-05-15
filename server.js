const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

//1. MIDDLEWARES GLOBALES (CORS, JSON y Archivos Estáticos)
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

//2. IMPORTAR RUTAS
const authRoutes = require('./routes/auth');
const documentosRoutes = require('./routes/documentos');

//3. CONECTAR RUTAS (Todas colgarán del prefijo '/api')
app.use('/api', authRoutes);
app.use('/api', documentosRoutes);

//4. ARRANCAR SERVIDOR
app.listen(port, () => {
    console.log(`Servidor listo en http://localhost:${port}/login.html`);
});