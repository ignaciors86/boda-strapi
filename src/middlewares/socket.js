module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    socket.on('kudo', (kudo) => {
      console.log('Recibido kudo:', kudo);
      socket.broadcast.emit('kudo', kudo);
    });

    socket.on('cambiar-coleccion', (data) => {
      console.log('Recibido cambio de colección:', data);
      const { coleccion } = data;
      // Emitir a todos los clientes excepto al emisor, igual que con los kudos
      socket.broadcast.emit('cambiar-coleccion', { coleccion });
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  });
}; 