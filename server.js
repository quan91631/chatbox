const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const CryptoJS  = require("crypto-js")
// Database 
const mongoose = require("mongoose")
const Room = require("./database/Schema")
mongoose.connect("mongodb://localhost/chatboxdb", () => {
    console.log("Database connected")
},
    e => console.log(e)
)
// Create a new room with no message yet
async function create(id){
  if(await Room.exists({roomID: id}) == null){
    const room = new Room({roomID: id, message: [""]})
    await room.save()
  }
}

// Update the room with the message to the database
async function update(id, newMessage){
  const filter = {roomID: id};
  await Room.findOneAndUpdate({filter}, {$push: {message: newMessage}}, {new:true})
}

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

const rooms = { }

app.get('/', (req, res) => {
  res.render('index', { rooms: rooms })
})

app.post('/room', (req, res) => {
  if (rooms[req.body.room] != null) {
    return res.redirect('/')
  }
  rooms[req.body.room] = { users: {}}
  res.redirect(req.body.room)
  // Send message that new room was created
  io.emit('room-created', req.body.room)
})

app.get('/:room', (req, res) => {
  // Create the new Room
  if (rooms[req.params.room] == null) {
    return res.redirect('/')
  }
  res.render('room', { roomName: req.params.room})
  create(req.params.room)
})

server.listen(3000)
// Socket IO Section
io.on('connection', socket => {
  socket.on('new-user', (room, name) => {
    socket.join(room)
    rooms[room].users[socket.id] = name
    socket.to(room).broadcast.emit('user-connected', name)
  })

  socket.on('send-chat-message', (room, payload) => {
    update(rooms[room].users[socket.id], payload.message)
    let decryptedMessage = CryptoJS.AES.decrypt(payload.message, payload.key)
    let originalText = decryptedMessage.toString(CryptoJS.enc.Utf8)
    socket.to(room).broadcast.emit('chat-message', { message: originalText, name: rooms[room].users[socket.id] })
  })

  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
      delete rooms[room].users[socket.id]
    })
  })
})

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}