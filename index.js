const express = require('express')
const socket = require('socket.io')
const port = 3000

let app = express()
let server = app.listen(port, () => {
    console.log(`Server Started on port ${port}`)
})

app.use(express.static('public'))

let io = socket(server)
io.on('connection', (socket) => {
    console.log('exstablished connection with ', socket.id)

    socket.on('video', (data) => {
        socket.broadcast.emit('video', data)
    })
    socket.on('videoLoad', (data) => {
        socket.broadcast.emit('videoLoad', data)
    })
    socket.on('chat', (data) => {
        console.log(data)
        socket.broadcast.emit('chat', data)
    })
})