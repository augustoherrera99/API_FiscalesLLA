import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config()

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT || 5432), // puerto por defecto de PostgreSQL
  ssl: { rejectUnauthorized: false } 
});

/**
 * Ejecuta una consulta SQL parametrizada.
 * @param {string} text - Consulta SQL con placeholders ($1, $2, etc.).
 * @param {Array} params - Parámetros que se reemplazan en los placeholders.
 * @returns {Promise<object>} Resultado de la consulta.
 * 
 * Escenarios:
 * - Éxito: Devuelve un objeto con la propiedad `rows` (array de resultados) y `rowCount`.
 * - Sin resultados: `rows` será un array vacío y `rowCount` será 0.
 * - Error en la consulta: Lanza una excepción con información del error.
 */
export async function query(text, params) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } catch (err) {
    console.error('Error en la consulta:', err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Cierra todas las conexiones activas del pool.
 * 
 * Escenarios:
 * - Uso típico: Se utiliza al apagar la app para liberar recursos.
 * - Si ya está cerrado: No lanza error, simplemente no hace nada.
 */
export async function closePool() {
  try {
    await pool.end();
    console.log('Conexiones cerradas correctamente.');
  } catch (err) {
    console.error('Error al cerrar conexiones:', err);
  }
}
