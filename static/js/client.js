// Jai Shree Ram

// This is client side, we will emit things to server
// By adding the js file --> http://localhost:8000/socket.io/socket.io.js
// We are now connected to the socket server

const socket = io('http://localhost:5001');
const form = document.getElementById('message-sender');
const messageInput = document.getElementById('message');

// We will add our messages in queryseletor container
const messageContainer = document.querySelector('.container');

var audio = new Audio('../static/notifications.mp3');

// Making an apend function
const append = (message, position) => {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement)
    if(position == 'left'){
        audio.play();
    }
}

//Taking name of user
const name = prompt("Enter your name to join the chat: ");
// Now we will emit the user name to server
socket.emit('new-user-joined', name);

// Now we need to listen what server emits
// listening names of users
socket.on('user-joined', name => {
    append(`${name} joined the chat`, 'left');
})

// Action when you submit a message
form.addEventListener('submit', (e) => {
    // prevetDefault --> page don't get reloaded autometically
    e.preventDefault();
    const message = messageInput.value;
    append(`You: ${message}`, 'right');
    socket.emit('send', message);
    messageInput.value = '';
})


// Now we will listen the message
socket.on('recieve', data => {
    append(`${data.name}: ${data.message}`, 'left')
})

socket.on('left', username => {
    append(`${username} left the chat`, 'left');
})