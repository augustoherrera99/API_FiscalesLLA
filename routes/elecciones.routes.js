import { Router } from "express";
import {query, closePool} from "../data/db.js";
import dayjs from 'dayjs';

const router = Router()

router.put('/ActualizarCantVotos/:idMesa', async (req, res)=>{

    const idMesa = parseInt(req.params.idMesa);
    const cantVotos = parseInt(req.body.cantVotos);

    if (isNaN(idMesa)) {
        return res.status(400).json({ error: 'idMesa inválido.' });
    }

    if (isNaN(cantVotos)) {
        return res.status(400).json({ error: 'cantidad de votos inválida.' });
    }

    try{
        const result = await query(
        `UPDATE public."Mesas"
        SET "cantVotos"= $1, "ultimaHoraCargaVot"= $2
        WHERE "idMesa"= $3;`,
        [cantVotos, dayjs().format("YYYY-MM-DD HH:mm:ss"), idMesa]
        );

        if (result.rowCount > 0) {
        res.status(200).json({ success: true, mensaje: 'Cantidad de votos actualizada correctamente.'});
        } else {
        res.status(404).json({ success: false, mensaje: 'Mesa no encontrada.' });
        }

    }catch(error){
        console.error('Error al actualizar la cantidad de votos:', error);
        res.status(500).json({ error: `Error del servidor al actualizar la cantidad de votos. Error: ${error.message}` });
    }
})

router.post('/CargaActaEscrutinio/:idMesa', async (req, res)=>{

    const idMesa = parseInt(req.params.idMesa);
    const votosLLA = req.body.votosLLA;
    const votosHxNP = req.body.votosHxNP;
    const votosUxP = req.body.votosUxP;
    const votosJxC = req.body.votosJxC;
    const votosImpugnados = req.body.votosImpugnados;
    const votosBlanco = req.body.votosBlanco;
    const votosNulos = req.body.votosNulos;
    const votosRecurridos = req.body.votosRecurridos;
    const votosCGElectoral = req.body.votosCGElectoral;
    const total = req.body.total;

    try{
        await query(
        `INSERT INTO public."ActaEscrutinio"(
        "idMesa", "cantVotosLLA", "cantVotosUxP", "cantVotosHxNP", "cantVotosJxC", "votosNulos", "votosRecurridos", 
        "votosBlancos", "votosCGElectoral", "votosImpugnados", total, "mesaImpugnada")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`,
        [idMesa, votosLLA, votosUxP, votosHxNP, votosJxC, votosNulos, votosRecurridos, votosBlanco, votosCGElectoral, votosImpugnados, total, false]
        );

        res.status(200).json({ success: true, mensaje: `Acta de escrutinio cargada con éxito.`});
    }
    catch(error){
        console.error('Error al cargar acta de escrutinio:', error);
        res.status(500).json({ error: `Error del servidor al cargar acta de escrutinio: ${error.message}`});
    }
})

// agregar endpoint anular mesa

export default router