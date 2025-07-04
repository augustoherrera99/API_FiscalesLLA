# API de Fiscales Electorales

API REST desarrollada con Express y PostgreSQL para la gestión de fiscales electorales durante elecciones.

## 📌 Base URL
```
https://api-fiscaleslla.onrender.com
```

## 🔐 Login

### `POST /login/loginUsuario`
Inicia sesión de un usuario. Si el usuario es `test` y la clave es `milei2027`, se genera un entorno de capacitación.

**Body JSON:**
```json
{
  "DNI": "test",
  "clave": "milei2027"
}
```

## 🏫 Escuela

### `GET /escuela/InfoEscuela/:idEscuela`
Devuelve información detallada de una escuela, sus mesas y fiscales asignados.

### `PUT /escuela/AbrirEscuela/:idEscuela`
Marca la escuela como abierta y registra la hora de apertura.

## 🗳️ Elecciones

### `PUT /elecciones/ActualizarCantVotos/:idMesa`
Actualiza la cantidad de votos de una mesa.

**Body JSON:**
```json
{
  "cantVotos": 123
}
```

### `POST /elecciones/CargaActaEscrutinio/:idMesa`
Carga los resultados del acta de escrutinio.

**Body JSON:**
```json
{
  "votosLLA": 100,
  "votosUxP": 90,
  "votosHxNP": 50,
  "votosJxC": 80,
  "votosNulos": 5,
  "votosRecurridos": 2,
  "votosBlanco": 10,
  "votosCGElectoral": 1,
  "votosImpugnados": 3,
  "total": 341
}
```

## 👤 Fiscales

### `GET /fiscales/FiscalesSuplentes/:idEscuela`
Devuelve fiscales suplentes asignados a una escuela.

### `POST /fiscales/AgregarFiscal/:idEscuela`
Agrega un fiscal titular a una escuela y lo asocia a una mesa.

**Body JSON:**
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "DNI": "12345678",
  "celular": "3511234567",
  "idMesa": 10
}
```

### `POST /fiscales/AgregarFiscalSuplente/:idEscuela`
Agrega un fiscal suplente a una escuela.

### `PUT /fiscales/Asistencia/:idFiscal`
Marca la asistencia de un fiscal.

**Body JSON:**
```json
{
  "asistencia": true
}
```

### `PUT /fiscales/ActualizarFiscal/:idFiscal`
Actualiza dinámicamente los datos de un fiscal.

El flujo seria que el fiscal en donde presionas "cambiar fiscal" se intercambian sus idMesa de un numero a null y pasa a tener propiedad suplente  = true y el fiscal suplente que se seleccione suplente = false con el idMesa que tenia el fiscal anterior. Despues en el refresh de la pagina deberia de traer desde el endpoint infoEscuela la info actualizada y se te cargara con el fiscal seleccionado

**Body JSON (Si cambia a titular):**
(idMesa, (no es lo mismo que numMesa que es la que aparece en el label) que se selecciono a cambiar)

```json
{
  "idMesa": 2, 
  "suplente": false
}
```

**Body JSON (Si cambia a suplente):**
(idMesa, (no es lo mismo que numMesa que es la que aparece en el label) que se selecciono a cambiar)

```json
{
  "idMesa": null,
  "suplente": true
}
```

## 🧾 Endpoint: Eliminar fiscal

### `DELETE /eliminarFiscal/:idFiscal`

Elimina un fiscal del sistema según su ID.

### 🔧 Parámetros

- **URL Param**:
  - `idFiscal` (integer): ID del fiscal a eliminar.

### 📥 Ejemplo de solicitud

```http
DELETE /api/fiscales/42
```

### 📤 Respuesta esperada (éxito)

```json
{
  "message": "Fiscal eliminado correctamente"
}
```

### ❌ Posibles errores

- `404 Not Found`: si el `idFiscal` no existe
- `500 Internal Server Error`: si ocurre un error en la base de datos

### 🧪 Notas

- El fiscal se elimina de la tabla `FiscalMesa`.
- No se valida si ese fiscal está asociado a alguna mesa activa.

## ⚠️ Incidencias

### `POST /incidencias/AgregarIncidencia/:idCategoria`
Crea una nueva incidencia para un fiscal general.

**Body JSON:**
```json
{
  "idFiscalGeneral": 1,
  "observaciones": "Falta boletas en mesa 3"
}
```

## 🧱 Estructura del Proyecto
- `index.js`: archivo principal que levanta el servidor.
- `db.js`: conexión a PostgreSQL mediante pool.
- `routes/`: contiene cada grupo de rutas.

## ⚙️ Stack Tecnológico
- **Servidor**: Node.js + Express 5
- **Base de datos**: PostgreSQL
- **Manejo de fechas**: `dayjs`
- **Puerto por defecto**: `3001`
