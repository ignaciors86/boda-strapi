const { createServer } = require('http');
const { Server } = require('socket.io');
const WebSocket = require('ws');
const strapi = require('@strapi/strapi');
const socketMiddleware = require('./middlewares/socket');

const app = strapi();
const httpServer = createServer(app.server);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Configurar el middleware de Socket.IO
socketMiddleware(io);

// --- INICIO WEBSOCKET PURO PARA /ws ---
const PING_INTERVAL = 30000;
const PONG_TIMEOUT = 10000;
const MAX_RECEIVERS = 100;

const wss = new WebSocket.Server({ noServer: true });
let broadcaster = null;
const receivers = new Map();
const pingIntervals = new Map();

httpServer.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

const cleanupClient = (ws) => {
  const interval = pingIntervals.get(ws);
  if (interval) {
    clearInterval(interval);
    pingIntervals.delete(ws);
  }
};
const canAddReceiver = () => receivers.size < MAX_RECEIVERS;
wss.on('connection', (ws) => {
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) ws.ping();
  }, PING_INTERVAL);
  pingIntervals.set(ws, interval);
  ws.on('pong', () => { ws.isAlive = true; });
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      switch (data.type) {
        case 'broadcast':
          if (broadcaster) broadcaster.close(1000, 'Nuevo emisor conectado');
          broadcaster = ws;
          receivers.forEach((receiver, id) => {
            if (receiver.readyState === WebSocket.OPEN) {
              receiver.send(JSON.stringify({ type: 'broadcast', receiverId: id }));
            }
          });
          break;
        case 'request_broadcast':
          if (!canAddReceiver()) {
            ws.send(JSON.stringify({ type: 'error', message: 'Límite de receptores alcanzado' }));
            ws.close(1000, 'Límite de receptores alcanzado');
            return;
          }
          if (broadcaster && broadcaster.readyState === WebSocket.OPEN) {
            const receiverId = data.receiverId;
            receivers.set(receiverId, ws);
            broadcaster.send(JSON.stringify({ type: 'request_broadcast', receiverId }));
          } else {
            ws.send(JSON.stringify({ type: 'error', message: 'No hay emisor disponible' }));
          }
          break;
        case 'offer':
          if (data.receiverId) {
            const receiver = receivers.get(data.receiverId);
            if (receiver && receiver.readyState === WebSocket.OPEN) {
              receiver.send(JSON.stringify({ type: 'offer', offer: data.offer, receiverId: data.receiverId }));
            } else {
              ws.send(JSON.stringify({ type: 'error', message: 'Receptor no encontrado' }));
            }
          }
          break;
        case 'answer':
          if (broadcaster && broadcaster.readyState === WebSocket.OPEN) {
            broadcaster.send(JSON.stringify({ type: 'answer', answer: data.answer, receiverId: data.receiverId }));
          }
          break;
        case 'candidate':
          if (data.isEmitter) {
            const receiver = receivers.get(data.receiverId);
            if (receiver && receiver.readyState === WebSocket.OPEN) {
              receiver.send(JSON.stringify({ type: 'candidate', candidate: data.candidate, receiverId: data.receiverId }));
            }
          } else if (broadcaster && broadcaster.readyState === WebSocket.OPEN) {
            broadcaster.send(JSON.stringify({ type: 'candidate', candidate: data.candidate, receiverId: data.receiverId }));
          }
          break;
      }
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: 'Error procesando mensaje' }));
    }
  });
  ws.on('close', () => {
    cleanupClient(ws);
    if (ws === broadcaster) {
      broadcaster = null;
      receivers.forEach((receiver, id) => {
        if (receiver.readyState === WebSocket.OPEN) {
          receiver.send(JSON.stringify({ type: 'broadcaster_disconnected', receiverId: id }));
        }
      });
      receivers.clear();
    } else {
      for (const [id, receiver] of receivers.entries()) {
        if (receiver === ws) {
          receivers.delete(id);
          break;
        }
      }
    }
  });
  ws.on('error', () => { cleanupClient(ws); });
});
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      cleanupClient(ws);
      ws.terminate();
      return;
    }
    ws.isAlive = false;
  });
}, PONG_TIMEOUT);
// --- FIN WEBSOCKET PURO ---

httpServer.listen(process.env.PORT || 1337, () => {
  console.log(`Servidor Strapi + WebSocket iniciado en el puerto ${process.env.PORT || 1337}`);
}); 