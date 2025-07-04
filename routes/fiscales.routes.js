import { Router } from "express";
import {query, closePool} from "../data/db.js";

const router = Router()

router.get('/FiscalesSuplentes/:idEscuela', async (req, res)=>{
    const idEscuela = parseInt(req.params.idEscuela);

    try {
        // Query para la escuela
        const fiscalesSuplentes = await query(
            `SELECT f."idFiscalMesa", u."apellido", u."nombre", f."DNI", u."telefono" 
            FROM "FiscalMesa" f
            INNER JOIN "Usuario" u ON u."idUsuario" = f."idUsuario"
            WHERE suplente = true AND f."idEscuela" = $1`,
            [idEscuela]
        );

        return res.status(200).json({
        fiscalesSuplentes: fiscalesSuplentes.rows, // puede ser un array vacío
        cantidad: fiscalesSuplentes.rowCount,
        mensaje: fiscalesSuplentes.rowCount > 0 
            ? 'Fiscales suplentes encontrados'
            : 'La escuela no tiene fiscales suplentes asignados',
        });
    }
    catch (error) {
        console.error('Error en la consulta FiscalesSuplentes:', error);
        res.status(500).json({ error: 'Error del servidor al consultar fiscales suplentes' });
    }
})

router.post('/AgregarFiscalSuplente/:idEscuela', async (req, res)=>{

    const idEscuela = parseInt(req.params.idEscuela);
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const dni = req.body.DNI;
    const celular = req.body.celular;

    try{
        const idUsuario = await query(
        `INSERT INTO "Usuario"("idTipoUsuario", apellido, nombre, telefono)
        VALUES ($1, $2, $3, $4)
        RETURNING "idUsuario";`,
        [1, apellido, nombre, celular]
        );

        await query(
        `INSERT INTO "FiscalMesa"("idUsuario", suplente, "DNI", "idEscuela")
        VALUES ($1, $2, $3, $4);`,
        [idUsuario.rows[0].idUsuario, true, dni, idEscuela])

        res.status(200).json({ success: true, mensaje: `Fiscal de mesa suplente creado con éxito.`});
    }
    catch(error){
        console.error('Error al cargar el fiscal de mesa suplente:', error);
        res.status(500).json({ error: `Error del servidor al cargar fiscal de mesa suplente: ${error.message}`});
    }
})

router.put('/Asistencia/:idFiscal', async (req, res)=>{

    const idFiscal = parseInt(req.params.idFiscal);
    const asistencia = req.body.asistencia;

    try{
        if (asistencia == true || asistencia == false) {
            const result = await query(
            `UPDATE public."FiscalMesa"
            SET asistencia = $1
            WHERE "idFiscalMesa" = $2;`,
            [asistencia, idFiscal]
            );

            if (result.rowCount > 0) {
            res.status(200).json({ success: true, mensaje: 'Asistencia marcada con éxito.'});
            } else {
            res.status(404).json({ success: false, mensaje: 'Fiscal no encontrado' });
            }
        }
        else {
            res.status(400).json({ mensaje: 'Asistencia debe ser un valor booleano.' });
        }

    }catch(error){
        console.error('Error al marcar asistencia:', error);
        res.status(500).json({ error: 'Error del servidor al marcar asistencia.' });
    }
})

router.put('/ActualizarFiscal/:idFiscal/:idUsuario', async (req, res) => {
    const idFiscal = parseInt(req.params.idFiscal);
    const idUsuario = parseInt(req.params.idUsuario);
    const body = req.body;

    if (isNaN(idFiscal)) {
        return res.status(400).json({ error: 'idFiscal inválido' });
    }

    if (isNaN(idUsuario)) {
        return res.status(400).json({ error: 'idUsuario inválido' });
    }

    try {
        // Armado dinámico para tabla Usuario
        const camposUsuario = ['apellido', 'nombre', 'telefono'];
        const dataUsuario = {};
        if (idUsuario) {
            for (let campo of camposUsuario) {
                if (body[campo]) {
                    dataUsuario[campo] = body[campo];
                }
            }
        }

        let result1 = { rowCount: 1 }; // Asumimos OK si no actualiza
        if (Object.keys(dataUsuario).length > 0) {
            const setClauses = Object.keys(dataUsuario).map((k, i) => `${k} = $${i + 1}`);
            const values = Object.values(dataUsuario);
            values.push(idUsuario); // último parámetro para WHERE

            const sqlUsuario = `
                UPDATE public."Usuario"
                SET ${setClauses.join(', ')}
                WHERE "idUsuario" = $${values.length};
            `;
            result1 = await query(sqlUsuario, values);
        }

        // Armado dinámico para tabla FiscalMesa
        const camposFiscal = { suplente: 'suplente', dni: '"DNI"' };
        const dataFiscal = {};
        for (let campo in camposFiscal) {
            if (body[campo] !== undefined) {
                dataFiscal[camposFiscal[campo]] = body[campo];
            }
        }

        let result2 = { rowCount: 1 }; // Asumimos OK si no actualiza
        if (Object.keys(dataFiscal).length > 0) {
            const setClauses = Object.keys(dataFiscal).map((k, i) => `${k} = $${i + 1}`);
            const values = Object.values(dataFiscal);
            values.push(idFiscal); // último parámetro para WHERE

            const sqlFiscal = `
                UPDATE public."FiscalMesa"
                SET ${setClauses.join(', ')}
                WHERE "idFiscal" = $${values.length};
            `;
            result2 = await query(sqlFiscal, values);
        }

        if (result1.rowCount > 0 && result2.rowCount > 0) {
            res.status(200).json({ success: true, mensaje: 'Datos actualizados correctamente.' });
        } else {
            res.status(404).json({ success: false, mensaje: 'No se encontró el registro a actualizar.' });
        }

    } catch (error) {
        console.error('Error al actualizar datos del fiscal:', error);
        res.status(500).json({ error: 'Error del servidor al modificar datos del fiscal.' });
    }
});


// router.put('/ActualizarFiscal/:idFiscal', async (req, res)=>{

//     const idFiscal = parseInt(req.params.idFiscal);
//     const idUsuario = parseInt(req.body.idUsuario);
//     const nombre = req.body.nombre;
//     const apellido = req.body.apellido;
//     const dni = req.body.dni;
//     const celular = req.body.celular;
//     const idMesa = req.body.idMesa;
//     const suplente = req.body.suplente;

//     try{
//         if (suplente == true || suplente == false) {
//             const result1 = await query(
//             `UPDATE public."Usuario"
//             SET apellido=$1, nombre=$2, telefono=$3
//             WHERE "idUsuario"=$4;`,
//             [apellido, nombre, celular, idUsuario]
//             );

//             const result2 = await query(
//             `UPDATE public."FiscalMesa"
//             SET "idMesa"=$1, suplente=$2, "DNI"=$3
//             WHERE "idFiscal" = $4`,
//             [idMesa, suplente, dni, idFiscal]
//             );

//             if (result1.rowCount > 0 && result2.rowCount > 0) {
//             res.status(200).json({ success: true, mensaje: 'Asistencia marcada con éxito.'});
//             } else {
//             res.status(404).json({ success: false, mensaje: 'Fiscal no encontrado' });
//             }
//         }
//         else {
//             res.status(400).json({ mensaje: 'Suplente debe ser un valor booleano.' });
//         }

//     }catch(error){
//         console.error('Error al modificar datos fiscal:', error);
//         res.status(500).json({ error: 'Error del servidor al modificar datos fiscal.' });
//     }
// })

router.post('/AgregarFiscal/:idEscuela', async (req, res)=>{

    const idEscuela = parseInt(req.params.idEscuela);
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const dni = req.body.DNI;
    const celular = req.body.celular;
    const idMesa = parseInt(req.body.idMesa);

    try{
        const idUsuario = await query(
        `INSERT INTO "Usuario"("idTipoUsuario", apellido, nombre, telefono)
        VALUES ($1, $2, $3, $4)
        RETURNING "idUsuario";`,
        [1, apellido, nombre, celular]
        );

        await query(
        `INSERT INTO "FiscalMesa"("idMesa", "idUsuario", suplente, "DNI", "idEscuela")
        VALUES ($1, $2, $3, $4, $5);`,
        [idMesa, idUsuario.rows[0].idUsuario, false, dni, idEscuela])

        res.status(200).json({ success: true, mensaje: `Fiscal de mesa creado con éxito.`});
    }
    catch(error){
        console.error('Error al cargar el fiscal de mesa:', error);
        res.status(500).json({ error: `Error del servidor al cargar fiscal de mesa: ${error.message}`});
    }
})

router.delete('/fiscales/:idFiscal', async (req, res) => {
    const idFiscal = parseInt(req.params.idFiscal);

    // Validación básica
    if (isNaN(idFiscal)) {
        return res.status(400).json({ error: 'El ID del fiscal debe ser un número válido.' });
    }

    try {
        const idUsuario = await query(
            `DELETE FROM "FiscalMesa" WHERE "idFiscalMesa" = $1 RETURNING "idUsuario"`,
            [idFiscal]
        );

        if (isNaN(idUsuario.rows[0].idUsuario)) {
            const result = await query(
                `DELETE FROM "Usuario" WHERE "idUsuario" = $1"`,
                [idUsuario.rows[0].idUsuario]
            );

            if (result.rowCount > 0) {
                res.status(200).json({ success: true, mensaje: 'Fiscal eliminado correctamente.' });
            } else {
                res.status(404).json({ success: false, mensaje: 'Fiscal no encontrado.' });
            }
        }
        else {
            return res.status(404).json({ success: false, mensaje: 'Fiscal no encontrado.' });
        }
    } catch (error) {
        console.error('Error al eliminar fiscal:', error);
        res.status(500).json({ error: 'Error del servidor al eliminar el fiscal.' });
    }
});

export default router