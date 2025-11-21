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

//Obtener cliente por número de WhatsApp Business
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
