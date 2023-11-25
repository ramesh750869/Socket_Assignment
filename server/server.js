//server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const chatRooms = {};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.on('createRoom', (roomName) => {
        const passcode = Math.random().toString(36).slice(2, 8);
        chatRooms[roomName] = { passcode, messages: [], disabled: false };
        socket.join(roomName);
        io.to(roomName).emit('roomCreated', { passcode });
    });

    socket.on('joinRoom', (data) => {
        const { roomName, passcode, username } = data;
        if (chatRooms[roomName] && chatRooms[roomName].passcode === passcode) {
            socket.join(roomName);
            socket.emit('roomJoined', { messages: chatRooms[roomName].messages });
            socket.broadcast.to(roomName).emit('message', { username: 'System', message: `${username} joined the room.` });
        } else {
            socket.emit('roomError', { message: 'Invalid passcode' });
        }
    });

    socket.on('sendMessage', (data) => {
        const { roomName, message, username } = data;
        chatRooms[roomName].messages.push({ username, message });
        io.to(roomName).emit('message', { username, message });
    });

    socket.on('editMessage', (data) => {
        const { roomName, index, message } = data;
        chatRooms[roomName].messages[index].message = message;
        io.to(roomName).emit('messageEdited', { index, message });

        


    });

    socket.on('deleteMessage', (data) => {
        const { roomName, index } = data;
        chatRooms[roomName].messages.splice(index, 1);
        io.to(roomName).emit('messageDeleted', { index });
        

    });

    socket.on('disableRoom', (roomName) => {
        chatRooms[roomName].disabled = true;
        io.to(roomName).emit('roomDisabled');
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
