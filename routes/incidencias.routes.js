import { Router } from "express";
import {query, closePool} from "../data/db.js";
import dayjs from 'dayjs';

const router = Router()

router.post('/AgregarIncidencia/:idCategoria', async (req, res)=>{

    const idCategoria = parseInt(req.params.idCategoria);
    const idFiscalGeneral = req.body.idFiscalGeneral;
    const observaciones = req.body.observaciones;

    try{
        const idTicket = await query(
        `INSERT INTO public."Incidencias"(
        "idFiscalGeneral", "idCategoria", "fechaCreacion", observaciones, estado, "ultimaActualizacion")
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING "idTicket";`,
        [idFiscalGeneral, idCategoria, dayjs().format("YYYY-MM-DD HH:mm:ss"), observaciones, 'Pendiente', dayjs().format("YYYY-MM-DD HH:mm:ss")]
        );

        res.status(200).json({ success: true, mensaje: `Incidencia creada con éxito con el nº de ticket: ${idTicket.rows[0].idTicket}.`});
    }
    catch(error){
        console.error('Error al cargar incidencia:', error);
        res.status(500).json({ error: `Error del servidor al cargar incidencia: ${error.message}`});
    }
})

export default router