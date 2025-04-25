const { createServer } = require('http');
const { Server } = require('socket.io');
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

httpServer.listen(process.env.PORT || 1337, () => {
  console.log(`Servidor Strapi iniciado en el puerto ${process.env.PORT || 1337}`);
}); 