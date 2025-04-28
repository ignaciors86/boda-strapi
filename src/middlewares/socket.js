module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('kudo', (kudo) => {
      socket.broadcast.emit('kudo', kudo);
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