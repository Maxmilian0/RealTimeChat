const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users
const users = {};

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('New user connected');

    // Handle new user joining
    socket.on('join', (username) => {
        users[socket.id] = username;
        socket.broadcast.emit('user-connected', username);
        io.emit('update-users', Object.values(users));
    });

    // Handle chat messages
    socket.on('send-message', (message) => {
        socket.broadcast.emit('receive-message', {
            user: users[socket.id],
            message: message,
            time: new Date().toLocaleTimeString()
        });
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        const username = users[socket.id];
        delete users[socket.id];
        socket.broadcast.emit('user-disconnected', username);
        io.emit('update-users', Object.values(users));
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});