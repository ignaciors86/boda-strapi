const WebSocket = require('ws');
const PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PORT });

console.log('Servidor de señalización WebSocket en puerto', PORT);

wss.on('connection', function connection(ws) {
  console.log(`[SIGNALING] Nuevo cliente conectado. Total: ${wss.clients.size}`);
  ws.on('message', function incoming(message) {
    let msgString;
    try {
      // Si es un buffer o arraybuffer, conviértelo a string
      if (typeof message !== 'string') {
        msgString = Buffer.from(message).toString('utf8');
      } else {
        msgString = message;
      }
      JSON.parse(msgString); // Solo reenvía si es JSON válido
    } catch (e) {
      console.warn('[SIGNALING] Mensaje recibido pero no es JSON válido, ignorado. Contenido:', message);
      return;
    }
    console.log(`[SIGNALING] Mensaje recibido: ${msgString}`);
    let reenviados = 0;
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msgString);
        reenviados++;
      }
    });
    console.log(`[SIGNALING] Mensaje reenviado a ${reenviados} cliente(s). Total conectados: ${wss.clients.size}`);
  });
  ws.on('close', () => {
    console.log(`[SIGNALING] Cliente desconectado. Total: ${wss.clients.size - 1}`);
  });
}); 