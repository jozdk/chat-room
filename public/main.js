import * as CONSTANTS from '/utils/constants.js';

// Variables
let wsClient;
let username;
const { MESSAGES, PORT } = CONSTANTS;

// DOM set-up
const messageBox = document.querySelector('#messageBox');
const messageForm = document.querySelector('#messageForm');
const usernameModal = document.querySelector('#username-modal');
const closeModalBtn = document.querySelector('.close');
const usernameForm = document.querySelector("#username-form");
const usernameInput = document.querySelector("#username-input");
const messages = document.querySelector('.chat');

// Ask for username on page load
document.addEventListener('DOMContentLoaded', () => {
    usernameModal.style.display = 'block';
});

closeModalBtn.onclick = () => {
    usernameModal.style.display = 'none';
};

window.onclick = (e) => {
    if (e.target === usernameModal) {
        usernameModal.style.display = 'none';
    }
};

usernameForm.onsubmit = (e) => {
    e.preventDefault();
    username = usernameInput.value;
    usernameModal.style.display = 'none';
    localStorage.setItem('username', JSON.stringify(username));
    // Start the WebSocket server
    init();
}

// Send to server when client enters a message
messageForm.onsubmit = function (e) {
    e.preventDefault();
    const message = messageBox.value;
    messageBox.value = '';
    sendMessageToServer(message);
}

// Set up ws client
function init() {
    // If a WebSocket connection exists already, close it (not necessary, but it is a best practice to avoid a cluttered namespace)
    if (wsClient) {
        wsClient.onerror = wsClient.onopen = wsClient.onclose = null;
        wsClient.close();
    }

    // Create new WebSocket connection
    const URL = 'ws://localhost:' + PORT;
    wsClient = new WebSocket(URL);

    // Respond to connections: define .onopen event handler
    wsClient.onopen = () => {
        console.log('Connected to Websocket server!');
        wsClient.send(JSON.stringify({
            type: MESSAGES.MESSAGE.NEW_USER,
            payload: { username }
        }));
    }

    // Respond to messages from the server: define .onmessage event handler
    wsClient.onmessage = (messageEvent) => {
        const { type, payload } = JSON.parse(messageEvent.data);

        // Parse custom message types, format each message based on type
        switch (type) {
            case MESSAGES.MESSAGE.NEW_USER:
                showMessageReceived(`<em><strong style='color: ${payload.usercolor};'>${payload.username}</strong> has joint at ${payload.time}!</em>`);
                break;
            case MESSAGES.MESSAGE.USER_LEFT:
                showMessageReceived(`<em><strong style='color: ${payload.usercolor};'>${payload.username}</strong> has left at ${payload.time}</em>`);
                break;
            case MESSAGES.MESSAGE.NEW_MESSAGE:
                showMessageReceived(
                    `<strong style='color: ${payload.usercolor};'>${payload.username}</strong> <span'>${payload.message}</span> <span class='time'>${payload.time.slice(0, -6)}</span>`
                );
                break;
            case MESSAGES.MESSAGE.OWN_MESSAGE_WITH_TIME:
                showMessageSent(`${payload.message} <span class='time' style='color: #fff'>${payload.time.slice(0, -6)}</span>`);
            default:
                break;
        }
    };

    // The event handlers below are useful for properly cleaning up a closed/broken WebSocket client connection

    // .onclose is executed when the socket connection is closed
    wsClient.onclose = (event) => {
        showMessageReceived('No WebSocket connection');
        wsClient = null;
    }

    // .onerror is executed when error event occurs on the WebSocket connection
    wsClient.onerror = (event) => {
        console.error("WebSocket error observed:", event);
        wsClient = null;
    }
}

function sendMessageToServer(message) {
    // Check if client is connected to the ws server
    if (!wsClient) {
        showMessageReceived('No WebSocket connection. Please submit a username');
        return;
    }

    // Send message in a custom message object
    const msgObj = {
        type: MESSAGES.MESSAGE.NEW_MESSAGE,
        payload: { message, username }
    };

    wsClient.send(JSON.stringify(msgObj));
}

// DOM helper functions

// Aliases of the showNewMessage function
function showMessageSent(message) {
    showNewMessage(message, 'sending');
}
function showMessageReceived(message) {
    showNewMessage(message, 'receiving');
}

// Display message in the messages container node
function showNewMessage(message, className) {
    // Create text node element for the message
    const textNode = document.createElement('div');
    textNode.innerHTML = message;
    textNode.className = 'message';

    // Wrap text node in message element
    const messageNode = document.createElement('div');
    messageNode.className = 'messages ' + className;
    messageNode.appendChild(textNode);

    // Append messageNode to messages container element
    messages.appendChild(messageNode);
    messages.scrollTop = messages.scrollHeight;
}