const express = require('express')
const socketio = require('socket.io')
const app = express()
const SERVER_PORT = 3000;

const server = app.listen(SERVER_PORT, () => {
    console.log('Chat Server running on http://localhost:3000/')
})

const io = socketio(server)

io.on('connection', (socket) => {
    console.log(`New Socket: ${socket.id}`)

    socket.on('disconnect', () => {
        console.log(`User disconnected ${socket.id}`)
    })
})