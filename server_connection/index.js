import { get_client } from "../db_connection/fun_clients.js";

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const token = process.env.WHATSAPP_TOKEN;
const verifyToken = process.env.VERIFY_TOKEN;
const phoneNumberId = process.env.PHONE_NUMBER_ID;

console.log("Servidor iniciado correctamente");
//Verificar el webhook
app.get("/webhook", (req, res) => {
    console.log("GET recibido:", req.query);
    const mode = req.query["hub.mode"];
    const challenge = req.query["hub.challenge"];
    const tokenReceived = req.query["hub.verify_token"];

    if (mode && tokenReceived && mode === "subscribe" && tokenReceived === verifyToken) {
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
    }else{
        res.sendStatus(403);
    }
});

//Recibir mensajes

app.post("/webhook", async (req, res) => {
    console.log("Webhook recibió algo:", JSON.stringify(req.body, null, 2));
    const body = req.body;
    if (body.object) {
        const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
        
        if(message && message.type === "text"){
            const from = message.from;
            const text = message.text.body;
            const bot_number = body["entry"][0]["changes"][0]["value"]["metadata"]["display_phone_number"]
            
            console.log(get_client({phone_number: bot_number}));

            await sendMessage(from, `Hola! Soy el bot de pruebas desde ${bot_number}`);
        }
    }

    res.sendStatus(200);
});

//Enviar mensajes

async function sendMessage(to, text){
    try{

        await axios({
            method: "POST",
            url: `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            data: {
                messaging_product: "whatsapp",
                to: to,
                text: { body: text },
            },
        });

        console.log(`Mensaje enviado a ${to}: ${text}`);

    }catch(error){
        console.error("Error al enviar el mensaje:", error.response ? error.response.data : error.message);
    }
}

app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});