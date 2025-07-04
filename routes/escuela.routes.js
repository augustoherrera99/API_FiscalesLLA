import { Router } from "express";
import {query, closePool} from "../data/db.js";
import dayjs from 'dayjs';

const router = Router()

router.get('/InfoEscuela/:idEscuela', async (req, res) => {
  const idEscuela = parseInt(req.params.idEscuela);

  try {
    // Query para la escuela
    const escuela = await query(
      `SELECT 
        e."idEscuela", 
        c."descripcion" AS "circuito", 
        d."descripcion" AS "departamento", 
        p."descripcion" AS "provincia", 
        e."nombreEstablecimiento", 
        e."direccion", 
        e."cantElectores"
      FROM "Escuelas" e
      INNER JOIN "CircuitoElectoral" c ON c."idCircuito" = e."idCircuito"
      INNER JOIN "Departamento" d ON d."idDepartamento" = e."idDepartamento"
      INNER JOIN "Provincia" p ON p."idProvincia" = e."idProvincia"
      WHERE e."idEscuela" = $1`,
      [idEscuela]
    );

    // Si no se encontró la escuela
    if (escuela.rowCount === 0) {
      return res.status(404).json({ mensaje: `La escuela con ID ${idEscuela} no se encuentra` });
    }

    // Query para las mesas
    const mesas = await query(
      `SELECT 
        m."idMesa", 
        f."idFiscalMesa",
        u."idUsuario", 
        u."apellido", 
        u."nombre", 
        f."DNI", 
        u."telefono", 
        m."cantElectores", 
        m."estado" AS "mesaOcupada", 
        m."numMesa",
        m."cantVotos",
        m."ultimaHoraCargaVot"
      FROM "Mesas" m
      LEFT JOIN "FiscalMesa" f ON f."idMesa" = m."idMesa"
      LEFT JOIN "Usuario" u ON u."idUsuario" = f."idUsuario"
      WHERE m."idEscuela" = $1
      ORDER BY m."numMesa"`,
      [idEscuela]
    );

    const listas = await query(
      `SELECT * FROM "Listas"`
    );

    // Construir estructura final
    const data = {
      idEscuela: escuela.rows[0].idEscuela,
      circuito: escuela.rows[0].circuito,
      departamento: escuela.rows[0].departamento,
      provincia: escuela.rows[0].provincia,
      nameEscuela: escuela.rows[0].nombreEstablecimiento,
      direccionEscuela: escuela.rows[0].direccion,
      cantElectores: escuela.rows[0].cantElectores,
      mesas: mesas.rows.map((mesa) => ({
        idMesa: mesa.idMesa,
        idUsuarioFiscal: mesa.idUsuario,
        idFiscalMesa: mesa.idFiscalMesa ?? null,
        numMesa: mesa.numMesa,
        apellido: mesa.apellido ?? null,
        nombre: mesa.nombre ?? null,
        dni: mesa.DNI ?? null,
        telefono: mesa.telefono ?? null,
        cantVotos: mesa.cantVotos ?? null,
        ultimaHoraCargaVot: mesa.ultimaHoraCargaVot ?? null,
        cantElectores: mesa.cantElectores ?? null,
        mesaOcupada: mesa.mesaOcupada ?? false,
      })),
      listas: listas.rows.map((lista) => ({
        idLista: lista.idLista,
        nombre: lista.nombre,
        rutaLogo: lista.rutaLogo
      }))
    };

    res.status(200).json(data);
  } catch (error) {
    console.error('Error en la consulta InfoEscuela:', error);
    res.status(500).json({ error: 'Error del servidor al consultar la escuela' });
  }
});

router.put('/AbrirEscuela/:idEscuela', async (req, res)=>{

    const idEscuela = parseInt(req.params.idEscuela);
    //const estadoEscuela = req.body.estado;
    //const fechaApertura = req.body.fechaApertura;

    try{
        const result = await query(
        `UPDATE "Escuelas"
        SET "estado" = $1, "horaApertura" = $2
        WHERE "idEscuela" = $3`,
        [true, dayjs().format("YYYY-MM-DD HH:mm:ss"), idEscuela]
        );

        if (result.rowCount > 0) {
        res.status(200).json({ success: true, mensaje: 'Escuela abierta', fechaApertura: fechaApertura});
        } else {
        res.status(404).json({ success: false, mensaje: 'Escuela no encontrada' });
        }

    }catch(error){
        console.error('Error al abrir la escuela:', error);
        res.status(500).json({ error: 'Error del servidor al abrir escuela.' });
    }
})


export default router