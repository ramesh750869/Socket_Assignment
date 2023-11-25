// client.js
const socket = io('http://localhost:3000');

let currentRoom;
let username;
let roomCreator;
let sender;
username = generateRandomUsername();

function createRoom() {

    const roomInput = document.getElementById('roomName');


    const roomName = document.getElementById('roomName').value;
    socket.emit('createRoom', roomName);

    roomCreator = socket.id;

    roomInput.value = '';



}

function joinRoom() {
    
    const roomName = document.getElementById('joinRoomName').value;
    const passcode = document.getElementById('passcode').value;

    
    
    socket.emit('joinRoom', { roomName, passcode, username});
    
}

function generateRandomUsername() {
    const adjectives = ['Adventurous', 'Curious', 'Energetic', 'Friendly', 'Mysterious', 'Optimistic', 'Resourceful', 'Witty'];
    const nouns = ['Explorer', 'Seeker', 'Pioneer', 'Traveler', 'Adventurer', 'Navigator', 'Voyager', 'Wanderer'];

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${randomAdjective} ${randomNoun}`;
}

function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = document.getElementById('message').value;
    socket.emit('sendMessage', { roomName: currentRoom, message, username});

    messageInput.value = '';
}

function editMessage(index) {
    const newMessage = prompt('Edit your message:', '');
    if (newMessage !== null) {
        socket.emit('editMessage', { roomName: currentRoom, index, message: newMessage});
    }
}

function deleteMessage(index) {
    const confirmDelete = confirm('Are you sure you want to delete this message?');
    if (confirmDelete) {
        socket.emit('deleteMessage', { roomName: currentRoom, index});
    }
}

function disableRoom() {
    //socket.emit('disableRoom', currentRoom);
    if (socket.id === roomCreator) {
        socket.emit('disableRoom', currentRoom);
    } else {
        alert('You are not authorized to disable this room.');
    }
    


}

socket.on('roomCreated', (data) => {
    alert(`Room created successfully. Passcode: ${data.passcode}`);
    document.getElementById('hideCreate').style.display = 'none';
});

socket.on('roomJoined', (data) => {
    currentRoom = document.getElementById('joinRoomName').value;
    document.getElementById('chat').style.display = 'block';
    document.getElementById('hideJoin').style.display = 'none';
    
    displayMessages(data.messages);
});

socket.on('roomError', (data) => {
    alert(data.message);
});

socket.on('message', (data) => {
    displayMessages([data]);
});

socket.on('messageEdited', (data) => {
    const messages = document.getElementById('messages');
    const listItem = messages.childNodes[data.index];
    listItem.textContent = `${data.username}: ${data.message}`;
});

socket.on('messageDeleted', (data) => {
    const messages = document.getElementById('messages');
    messages.removeChild(messages.childNodes[data.index]);
});

socket.on('roomDisabled', () => {
    alert('This room has been disabled.');
    document.getElementById('chat').style.display = 'none';
    document.getElementById('hideJoin').style.display = 'block';
    document.getElementById('hideCreate').style.display = 'block';
});

function displayMessages(messages) {
    const messagesList = document.getElementById('messages');
    //messagesList.innerHTML = ''; // Clear previous messages
    messages.forEach((msg, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${msg.username}: ${msg.message}`;

        // Edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editMessage(index);

        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteMessage(index);

        // Append buttons to the list item
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);

        messagesList.appendChild(listItem);
    });
}
