const express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const GroupChat = require('./models/GroupChat');
const PrivateChat = require('./models/PrivateChat');

const app = express();
const SERVER_PORT = 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'view')));

// mongodb connection
const DB_NAME = 'comp3133';
const DB_USER_NAME = 'taylormarz';
const DB_PASSWORD = '905Sysco';
const DB_CONNECTION = `mongodb+srv://${DB_USER_NAME}:${DB_PASSWORD}@cluster0.vb98d.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(DB_CONNECTION)
    .then(() => console.log('Successfully connected to COMP3133 DB!'))
    .catch(err => console.error('Error connecting to COMP3133 DB:', err));

app.use('/user', userRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'login.html'));
});

// server connection
const server = app.listen(SERVER_PORT, () => {
    console.log(`Server is running on: http://localhost:${SERVER_PORT}/`);
});

const io = socketio(server);

const users = {};
const activeUsers = {};

io.on('connection', (socket) => {
    socket.on('registerUser', (username) => {
        activeUsers[username] = socket.id;

        io.emit('onlineUsers', Object.keys(activeUsers));
    });

    socket.on('getOnlineUsers', () => {
        socket.emit('onlineUsers', Object.keys(activeUsers));
    });

    // join groupchat room 
    socket.on('joinRoom', async ({ username, room }) => {
        socket.join(room);
        users[socket.id] = { username, room };
        // alert users to who has joined the groupchat room
        socket.to(room).emit('message', {
            username: 'Chat App',
            text: `${username} has joined the chat`
        });

        const previousMessages = await GroupChat.find({ room });
        previousMessages.forEach((msg) => {
            socket.emit('message', { username: msg.from_user, text: msg.message });
        });

        const roomUsers = Object.values(users).filter((user) => user.room === room);
        io.to(room).emit('roomUsers', { room, users: roomUsers });
    });

    socket.on('chatMessage', async (text) => {
        const user = users[socket.id];
        if (user) {
            const { username, room } = user;

            io.to(room).emit('message', { username, text });

            const chatMessage = new GroupChat({
                from_user: username,
                room,
                message: text
            });

            try {
                await chatMessage.save();
            } catch (error) {
                console.error('Message not saved:', error);
            }
        }
    });
    // functionality to leave chat room
    socket.on('leaveRoom', () => {
        const user = users[socket.id];
        if (user) {
            const { username, room } = user;
            delete users[socket.id];

            socket.to(room).emit('message', {
                username: 'Chat App',
                text: `${username} has left the chat`
            });

            const roomUsers = Object.values(users).filter((user) => user.room === room);
            io.to(room).emit('roomUsers', { room, users: roomUsers });
        }
    });

    // functionality for private chat rooms
    socket.on('privateMessage', async ({ from_user, to_user, message }) => {
        const recipientSocketId = activeUsers[to_user];

        if (recipientSocketId) {
            io.to(recipientSocketId).emit('privateMessage', { from_user, message });
        }

        // saving messages from private chat rooms
        try {
            const privateMessage = new PrivateChat({
                from_user,
                to_user,
                message
            });

            await privateMessage.save();
        } catch (error) {
            console.error('Message not saved:', error);
        }
    });

    // function to show user who is typing in private chat room
    socket.on('typing', ({ from_user, to_user }) => {
        const recipientSocketId = activeUsers[to_user];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('typing', { from_user });
        }
    });

    // if the user stops typing function takes user typing message away
    socket.on('stopTyping', ({ to_user }) => {
        const recipientSocketId = activeUsers[to_user];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('stopTyping');
        }
    });

    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            const { username, room } = user;
            delete users[socket.id];

            socket.to(room).emit('message', {
                username: 'Chat App',
                text: `${username} has left the chat`
            });

            const roomUsers = Object.values(users).filter((user) => user.room === room);
            io.to(room).emit('roomUsers', { room, users: roomUsers });
        }

        const disconnectedUser = Object.keys(activeUsers).find(
            (username) => activeUsers[username] === socket.id
        );

        if (disconnectedUser) {
            delete activeUsers[disconnectedUser];
            io.emit('onlineUsers', Object.keys(activeUsers));
        }
    });
});