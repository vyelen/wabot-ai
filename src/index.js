import {
    Browsers,
    makeWASocket, 
    DisconnectReason, 
    useMultiFileAuthState
} from "@whiskeysockets/baileys";
import pino from "pino";

config();

const connect = async () => {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");
    const sock = makeWASocket({
        printQRInTerminal: true, 
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
        // this event used when a message was sent
    });
};
connect();
