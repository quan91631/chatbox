const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

// Crypto js
var salt = CryptoJS.lib.WordArray.random(128 / 8);
var key128Bits = CryptoJS.PBKDF2("Secret Passphrase", salt, {
  keySize: 128 / 32
});

if (messageForm != null) {
  const name = prompt('What is your name?')
  appendMessage('You have joined the room')
  socket.emit('new-user', roomName, name)
  messageForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const message = messageInput.value
    var encrypted = CryptoJS.AES.encrypt(message, key128Bits.toString());
    const payload = {message: encrypted.toString(), key: key128Bits.toString()}
    appendMessage(`You: ${message}`)
//  Send the message to the room
    socket.emit('send-chat-message', roomName, payload)
    messageInput.value = ''
  })
}

socket.on('room-created', room => {
  const roomElement = document.createElement('div')
  roomElement.innerText = room
  const roomLink = document.createElement('a')
  roomLink.href = `/${room}`
  roomLink.innerText = 'join'
  roomContainer.append(roomElement)
  roomContainer.append(roomLink)
})

socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
})

socket.on('user-connected', name => {
  appendMessage(`${name} connected`)
})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`)
})

function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)  
}