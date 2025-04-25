// import type { Core } from '@strapi/strapi';
import socketIO from 'socket.io';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    console.log('Registrando Socket.IO...');
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    console.log('Inicializando Socket.IO...');
    
    try {
      const server = strapi.server.httpServer;
      
      if (!server) {
        console.error('No se pudo obtener el servidor HTTP de Strapi');
        return;
      }

      console.log('Servidor HTTP de Strapi obtenido correctamente');

      const io = new socketIO.Server(server, {
        cors: {
          origin: "*",
          methods: ["GET", "POST", "OPTIONS"],
          allowedHeaders: ["*"],
          credentials: false
        },
        transports: ['websocket', 'polling'],
        allowEIO3: true,
        pingTimeout: 60000,
        pingInterval: 25000
      });

      console.log('Socket.IO configurado');

      io.on('connection', (socket) => {
        console.log('Nuevo cliente conectado:', socket.id);

        socket.on('kudo', (data) => {
          console.log('Kudo recibido:', data);
          socket.broadcast.emit('kudo', data);
        });

        socket.on('disconnect', () => {
          console.log('Cliente desconectado:', socket.id);
        });
      });

      strapi.io = io;
      console.log('Socket.IO inicializado correctamente');
    } catch (error) {
      console.error('Error al inicializar Socket.IO:', error);
    }
  },
};
