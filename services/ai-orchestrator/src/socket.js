const { Server } = require('socket.io');

let io;

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: '*', // Allow all origins for now
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('join_room', (room) => {
            socket.join(room);
            console.log(`User ${socket.id} joined room: ${room}`);
        });

        socket.on('send_message', (data) => {
            // Broadcast to room
            socket.to(data.room).emit('receive_message', data);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
}

function getIo() {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
}

module.exports = { initSocket, getIo };
