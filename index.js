import express from 'express'
import { closePool } from './data/db.js';

import eleccionesRouter from './routes/elecciones.routes.js'
import escuelaRouter from './routes/escuela.routes.js'
import fiscalesRouter from './routes/fiscales.routes.js'
import incidenciasRouter from './routes/incidencias.routes.js'
import loginRouter from './routes/login.routes.js'
const app = express()
import dotenv from 'dotenv';

dotenv.config()

const port = process.env.PORT || 3001;

app.use(express.json());

app.listen(port, () =>{
    console.log(`Servidor levantado en puerto ${port}`)
})

app.use('/elecciones', eleccionesRouter)
app.use('/escuela', escuelaRouter)
app.use('/fiscales', fiscalesRouter)
app.use('/incidencias', incidenciasRouter)
app.use('/login', loginRouter)

// Cierre limpio en señales de sistema
const shutdown = async () => {
  console.log('\nCerrando servidor y conexiones a la base de datos...');
  await closePool(); // liberás conexiones
  server.close(() => {
    console.log('Servidor cerrado correctamente.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);  // Ctrl+C
process.on('SIGTERM', shutdown); // kill, PM2, etc.