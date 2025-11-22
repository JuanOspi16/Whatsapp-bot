import dotenv from "dotenv";
import express from "express";
import { Pool } from "pg";
import { use } from "react";

dotenv.config();
const app = express();

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DB_NAME,
    password: process.env.PASSWORD,
    port: process.env.DB_PORT,  // usa otro nombre para no chocar con el puerto del servidor
});

pool.connect()
    .then(() => console.log("Conectado a la base de datos"))
    .catch((err) => console.error("Error al conectar a la base de datos", err));

const PORT = process.env.API_PORT || 3001;

app.listen(PORT, () => {
    console.log(`Servidor de base de datos escuchando en el puerto ${PORT}`);
});

//Get clien by phone number
app.get("/client/:whatsapp_number", async (req, res) => {
    const { whatsapp_number } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM clients WHERE phone_number = $1',
            [whatsapp_number]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error("Error al obtener el cliente", err);
        res.status(500).json({ message: "Error del servidor" });
    }
});

//Get employee by id
app.get("/employee/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM employees WHERE client_id = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error("Error al obtener el empleado", err);
        res.status(500).json({ message: "Error del servidor" });
    }
});

//Get services by client id
app.get("/services/:client_id", async (req, res) => {
    const { client_id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM services WHERE client_id = $1',
            [client_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Servicios no encontrados" });
        }

        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error al obtener los servicios", err);
        res.status(500).json({ message: "Error del servidor" });
    }
});

//Get state by id
app.get("/state/:user_phone", async (req, res) => {
    const { user_phone } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM user_states WHERE id = $1',
            [user_phone]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ step: -1 });
        }
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error al obtener el estado", err);
        res.status(500).json({ message: "Error del servidor" });
    }
});

//Create state
app.post("/state", express.json(), async (req, res) => {
    const { user_phone, step, employee_selected, selected_date, selected_time, client_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO states (user_phone, step, employee_selected, selected_date, selected_time, client_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [user_phone, step, employee_selected, selected_date, selected_time,  client_id]
        );
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error("Error al crear el estado", err);
        res.status(500).json({ message: "Error del servidor" });
    }
});

//Update state
app.put("/state/:id", express.json(), async (req, res) => {
    const { id } = req.params;
    const { step, employee_selected, selected_date, selected_time } = req.body;
    try {
        const result = await pool.query(
            'UPDATE states SET step = $1, employee_selected = $2, selected_date = $3, selected_time = $4 WHERE user_state_id = $5 RETURNING *',
            [step, employee_selected, selected_date, selected_time, id]
        );
        res.status(200).json(result.rows[0]);
    }catch (err) {
        console.error("Error al actualizar el estado", err);
        res.status(500).json({ message: "Error del servidor" });
    }
});