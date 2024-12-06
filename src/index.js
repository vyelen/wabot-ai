import {
    Browsers,
    makeWASocket, 
    DisconnectReason, 
    useMultiFileAuthState
} from "@whiskeysockets/baileys";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import commandHandler from "./commands.js";
import pino from "pino";

config();

const client = new GoogleGenerativeAI(process.env.API_KEY).getGenerativeModel({ 
    model: "gemini-1.5-flash"
});
const connect = async () => {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");
    const sock = makeWASocket({
        printQRInTerminal: true, 
        version: [22, 13, 74],
        browser: Browsers.ubuntu("Chrome"),
        auth: state,
        logger: pino({ level: "fatal" })
    });

    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
        if(
        
            connection === "close" && 
            lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
        
        ) connect();
    });
    sock.ev.on ("creds.update", saveCreds);
    
    sock.ev.on("messages.upsert", async msg => {
        await commandHandler(sock, client, msg)
    });
};
connect();