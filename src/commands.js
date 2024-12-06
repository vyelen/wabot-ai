const commandHandler = async (sock, client, msg) => {
    let command;
    const splitCommand = "; ";

    try {
        command = (msg.messages[0].message.extendedTextMessage.text).split(splitCommand)
    } catch (error) {
        command = (msg.messages[0].message.conversation).split(splitCommand);
    }

    if (command[0] === ".ai") {
        const clientResponse = await client.generateContent(command[1]);
        
        await sock.sendMessage(msg.messages[0].key.remoteJid, {
            text: clientResponse.response.text()
        });
    }
};

export default commandHandler;