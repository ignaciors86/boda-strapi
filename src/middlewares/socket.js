module.exports = (io) => {
  io.on('connection', (socket) => {
    // Unirse a una room específica
    socket.on('joinRoom', (room) => {
      socket.join(room);
    });

    socket.on('kudo', (kudo) => {
      // Si el kudo tiene room, emitir solo a esa room
      if (kudo.room) {
        socket.to(kudo.room).emit('kudo', kudo);
      } else {
        // Compatibilidad: emitir globalmente si no hay room
        socket.broadcast.emit('kudo', kudo);
      }
    });

    socket.on('cambiar-coleccion', (data) => {
      const { coleccion } = data;
      socket.broadcast.emit('cambiar-coleccion', { coleccion });
    });

    socket.on('audio-data', (data) => {
      console.log('[AUDIO] Recibido audio-data', data);
      socket.broadcast.emit('audio-data', data);
    });

    socket.on('disconnect', () => {});
  });
}; 