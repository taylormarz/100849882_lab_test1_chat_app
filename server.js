const express = require('express')
const socketio = require('socket.io')
const mongoose = require('mongoose')

const app = express()
const SERVER_PORT = 3001

app.use(express.json());

// mongodb connection
const DB_NAME = 'comp3133'
const DB_USER_NAME = 'taylormarz'
const DB_PASSWORD = '905Sysco'
const DB_CONNECTION = `mongodb+srv://${DB_USER_NAME}:${DB_PASSWORD}@cluster0.vb98d.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`

mongoose.connect(DB_CONNECTION)
.then(() => console.log('Successfully connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// server connection
const server = app.listen(SERVER_PORT, () => {
    console.log(`Server running on http://localhost:${SERVER_PORT}/`)
})

const io = socketio(server)

io.on('connection', (socket) => {
    console.log(`New Socket: ${socket.id}`)

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`)
    })
})