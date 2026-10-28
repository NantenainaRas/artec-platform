const Message = require('../models/Message');

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connecté:', socket.id);

    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} rejoint room ${userId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const { senderId, senderUsername, receiverId, operatorTarget, content } = data;

        if (!content || !senderId) return;

        const message = await Message.create({
          senderId,
          senderUsername: senderUsername || '',
          receiverId: receiverId || null,
          operatorTarget: operatorTarget || null,
          content
        });

        if (receiverId) io.to(receiverId).emit('receive_message', message);
        if (operatorTarget) io.emit(`operator_${operatorTarget}`, message);

        socket.emit('message_sent', message);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client déconnecté:', socket.id);
    });
  });
};

module.exports = setupSocket;