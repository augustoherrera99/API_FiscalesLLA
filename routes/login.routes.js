import { Router } from "express";
import {query, closePool} from "../data/db.js";
import dotenv from 'dotenv';

dotenv.config()

const router = Router()

router.post('/loginUsuario', async (req, res)=>{
    const documento = req.body.DNI
    const pass = req.body.clave

    if (documento == process.env.USER_TEST && pass == process.env.PASS_TEST) {
        try {
            const idEscuela = await query(
            `INSERT INTO public."Escuelas"(
            "idCircuito", "idDepartamento", "idProvincia", "nombreEstablecimiento", direccion, coordenadas, "horaApertura", "horaCierre", "cantElectores", estado)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING "idEscuela";`,
            [1, 1, 1, 'Colegio Nacional de Monserrat', 'Obispo Trejo 294', 'x', null, null, 3111, false])

            const datosUsuario = await query(
            `INSERT INTO public."Usuario"(
            "idTipoUsuario", apellido, nombre, clave, email, telefono)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING "idUsuario", apellido, nombre, telefono;`,
            [2, 'Capacitado', 'Juan', null, null, '351999999'])

            const datosFiscalGeneral = await query(
            `INSERT INTO public."FiscalGeneral"(
            "idEscuela", "idUsuario", "DNI")
            VALUES ($1, $2, $3)
            RETURNING "idFiscalGeneral", "DNI";`,
            [idEscuela.rows[0].idEscuela, datosUsuario.rows[0].idUsuario, '49999999'])

            let Mesas = [];
            
            for (let i = 14; i < 18; i++) {
                let idMesa = await query(
                `INSERT INTO public."Mesas"(
                "idEscuela", "horaApertura", "ultimaHoraCargaVot", "cantElectores", estado, "numMesa", "cantVotos")
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING "idMesa";`,
                [idEscuela.rows[0].idEscuela, null, null, 250, false, i, 0]);

                Mesas.push(idMesa.rows[0].idMesa);
            }

            const datosUsuario1 = await query(
            `INSERT INTO public."Usuario"(
            "idTipoUsuario", apellido, nombre, clave, email, telefono)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING "idUsuario", apellido, nombre, telefono;`,
            [2, 'Moreyra', 'Alex', null, null, '354165497'])

            const datosUsuario2 = await query(
            `INSERT INTO public."Usuario"(
            "idTipoUsuario", apellido, nombre, clave, email, telefono)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING "idUsuario", apellido, nombre, telefono;`,
            [2, 'Suarez', 'Camila', null, null, '365166545'])

            const fiscal1 = await query(
            `INSERT INTO public."FiscalMesa"(
            "idMesa", "idUsuario", asistencia, suplente, "DNI", "idEscuela")
            VALUES ($1, $2, $3, $4, $5, $6);`,
            [Mesas[0], datosUsuario1.rows[0].idUsuario, false, false, '454165162', idEscuela.rows[0].idEscuela]);

            const fiscal2 = await query(
            `INSERT INTO public."FiscalMesa"(
            "idMesa", "idUsuario", asistencia, suplente, "DNI", "idEscuela")
            VALUES ($1, $2, $3, $4, $5, $6);`,
            [Mesas[1], datosUsuario2.rows[0].idUsuario, false, false, '475574655', idEscuela.rows[0].idEscuela]);

            res.status(200).json({
                success: true,
                idEscuela: idEscuela.rows[0].idEscuela,
                idFiscalGeneral: datosFiscalGeneral.rows[0].idFiscalGeneral,
                apellido: datosUsuario.rows[0].apellido,
                nombre: datosUsuario.rows[0].nombre,
                telefono: datosUsuario.rows[0].telefono,
                DNI: datosFiscalGeneral.rows[0].DNI
            })
        }
        catch (error) {
            console.error('Error al crear usuario y relaciones capacitación:', error);
            res.status(500).json({ error: `Error al crear usuario y relaciones capacitación: ${error.message}`});
        }
    }
    else {
        try {
            const result = await query(
            `SELECT u.apellido, u.nombre, u.telefono, f."DNI", f."idEscuela", f."idFiscalGeneral" 
            FROM "Usuario" u
            INNER JOIN "FiscalGeneral" f ON f."idUsuario" = u."idUsuario"
            WHERE f."DNI" = $1 AND u.clave = $2`,
            [documento, pass]);

            if(result.rowCount > 0){
                res.status(200).json({
                    success: true,
                    idEscuela: result.rows[0].idEscuela,
                    idFiscalGeneral: result.rows[0].idFiscalGeneral,
                    apellido: result.rows[0].apellido,
                    nombre: result.rows[0].nombre,
                    telefono: result.rows[0].telefono,
                    DNI: result.rows[0].DNI
                })
            }else{
                res.status(400).json({
                    success: false,
                    mensaje: `Contraseña y/o DNI incorrecto.`
                })
            }
        }
        catch (error){
            console.error('Error al iniciar sesión:', error);
            res.status(500).json({ error: `Error al iniciar sesión: ${error.message}`});
        }
    }
})

export default router