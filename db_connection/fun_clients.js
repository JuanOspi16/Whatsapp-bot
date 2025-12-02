import dotenv from "dotenv";
import express from "express";
import { Pool } from "pg";

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

//Get client by phone number
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

        res.status(200).json(result.rows);
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
            'SELECT * FROM user_states WHERE user_phone = $1',
            [user_phone]
        );
        if (result.rows.length === 0) {
            return res.status(200).json([{ step: -1 }]); //Si no hay estado, retornar step -1
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
            'INSERT INTO user_states (user_phone, step, employee_selected, selected_date, selected_time, client_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [user_phone, step, employee_selected, selected_date, selected_time,  client_id]
        );
        res.status(201).json(result.rows);
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
            'UPDATE user_states SET step = $1, employee_selected = $2, selected_date = $3, selected_time = $4 WHERE user_state_id = $5 RETURNING *',
            [step, employee_selected, selected_date, selected_time, id]
        );
        res.status(200).json(result.rows[0]);
    }catch (err) {
        console.error("Error al actualizar el estado", err);
        res.status(500).json({ message: "Error del servidor" });
    }
});

//Create services for state
app.post("/state_services", express.json(), async (req, res) => {
    const { user_state_id, service_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO user_states_services (user_state_id, service_id) VALUES ($1, $2) RETURNING *',
            [user_state_id, service_id]
        );
        res.status(201).json(result.rows);
    }
    catch (err) {
        console.error("Error al crear el servicio para el estado", err);
        res.status(500).json({ message: "Error del servidor" });
    }
});

//Get the services
app.get("/state_services/:id", express.json(), async (req, res) => {
    const {id} = req.params;
    console.log(id);
    try{
        const result = await pool.query(
            'SELECT * FROM user_states_services WHERE user_state_id = $1', [id]
        );
        if (result.rows.length === 0){
            return res.status(404).json({message: "Servicios no encontrados"})
        }
        res.status(200).json(result.rows);
    }catch(err){
        console.error("Error al obtener los servicios", err);
        res.status(500).json({message: "Error del servidor"})
    }
})

//Sum minutes or price
app.get("/state_services_sum", express.json(), async (req, res) => {
    const {col, id} = req.query;

    const allowedCols = ["price", "duration_minutes"];
    if (!allowedCols.includes(col)) {
        return res.status(400).json({ message: "Columna no permitida" });
    }

    try{
        const result = await pool.query(
            `SELECT SUM(${col}) FROM user_states_services 
            INNER JOIN services
            ON user_states_services.service_id = services.id
            WHERE user_state_id = $1;
            `, [id]
        );
        if (result.rows.length === 0){
            return res.status(404).json({message: "Servicios no encontrados"})
        }
        res.status(200).json(result.rows[0]);
    }catch(err){
        console.error("Error al obtener los servicios", err);
        res.status(500).json({message: "Error del servidor"})
    }
})

app.get("/schedule", express.json(), async(req, res) =>{
    const {id, day} = req.query;
    console.log(id, day);
    try{
        const result = await pool.query(
            `SELECT * FROM schedules
            WHERE employee_id = $1 AND weekday = $2`, [id, day]
        );
        if(result.rows.length === 0){
            return res.status(404).json({message: "Día no encontrado"})
        }
        res.status(200).json(result.rows[0]);
    }catch{
        console.error("Error al obtener los horarios");
        res.status(500).json({message: "Error del servidor"})
    }
})

app.get("/appointments", express.json(), async(req, res) => {
    const { id, today, day} = req.query;
    const current = new Date(today);
    let date = new Date(day);
    date.setHours(0, 0, 0, 0);
    //console.log(date, current);
    try{
        const result = await pool.query(
            `SELECT * FROM appointments
            WHERE employee_id = $1 AND start_time >= $2 AND end_time >= $3
            ORDER BY start_time ASC;`, [id, date, current]
        );
        if(result.rows.length === 0){
            return res.status(200).json([]);
        }
        res.status(200).json(result.rows);
    }catch{
        console.error("Error al obtener reservas");
        res.status(500).json({message: "Error del servidor"});
    }
})