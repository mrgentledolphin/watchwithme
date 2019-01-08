const express = require('express')
const socket = require('socket.io')
const bodyParser = require('body-parser')
const helmet = require('helmet')

const port = process.env.PORT || 8080

let app = express()
let server = app.listen(port, () => {
    console.log(`Server Started on port ${port}`)
})

/* app.use(express.static('public')) */
app.set('view engine', 'hjs')
app.use(helmet.xssFilter())

app.use(express.static(__dirname + '/views/'))
    .use(bodyParser.urlencoded({extended: false}))
    .use(bodyParser.json())

app
    .get('/', (req, res) => {
        res.render('createRoom')
    })
    .get('/:room', (req, res) => {
        let room = req.params.room
        res.render('index', {room})
    })


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
        socket.broadcast.emit('chat', {
            text: encodeHTML(data.text),
            user: encodeHTML(data.user),
            roomName: encodeHTML(data.roomName)
        })
    })
})


let encodeHTML = (s) => {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}