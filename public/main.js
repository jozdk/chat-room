import * as CONSTANTS from '/utils/constants.js';

////////////////////////////////////////////////
////////////// VARIABLES ///////////////////////
////////////////////////////////////////////////

// This variable will hold the WebSocket client connection. 
// Initialize in the init() function
let wsClient;
let username;
let usercolor;
const { CLIENT, PORT } = CONSTANTS;

////////////////////////////////////////////////
//////////////// DOM SETUP /////////////////////
////////////////////////////////////////////////

const messageBox = document.querySelector('#messageBox');
const messageForm = document.querySelector('#messageForm');
const usernameModal = document.querySelector('#username-modal');
const closeModalBtn = document.querySelector('.close');
const usernameForm = document.querySelector("#username-form");
const usernameInput = document.querySelector("#username-input");

// Event handler on page load
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
    usercolor = Math.floor(Math.random() * 16777215).toString(16);
    usernameModal.style.display = 'none';
    // Save to localStorage
    localStorage.setItem('username', JSON.stringify(username));
    localStorage.setItem('usercolor', JSON.stringify(usercolor));
    // Start the WebSocket server
    init();
}

// Event handler when the client enters a message
messageForm.onsubmit = function (e) {
    e.preventDefault();

    // Get the message from the messageBox
    const message = messageBox.value;
    // Render the sent message on the client as your own and reset the messageBox
    // showMessageSent(message);
    messageBox.value = '';

    sendMessageToServer(message);
}

window.addEventListener("beforeunload", () => {
    console.log("beforeunload happening");
    const username = JSON.parse(localStorage.getItem('username'));
    const usercolor = JSON.parse(localStorage.getItem('usercolor'));
    wsClient.send(JSON.stringify({
        type: CLIENT.MESSAGE.USER_LEFT,
        payload: {
            username,
            usercolor
        }
    }));
});

////////////////////////////////////////////////
////////////// WS CLIENT LOGIC /////////////////
////////////////////////////////////////////////

function init() {

    /* Note: 
    Though the conditional block below is not necessary, it is a best practice to avoid
    tampering with a cluttered namespace.
    */

    // If a WebSocket connection exists already, close it
    if (wsClient) {
        wsClient.onerror = wsClient.onopen = wsClient.onclose = null;
        wsClient.close();
    }


    // TODO: 
    // Exercise 4: Create a new WebSocket connection with the server using the ws protocol.
    const URL = 'ws://localhost:' + PORT;
    wsClient = new WebSocket(URL);


    // TODO:
    // Exercise 5: Respond to connections by defining the .onopen event handler.
    wsClient.onopen = () => {
        console.log('Connected to Websocket server!');
        wsClient.send(JSON.stringify({
            type: CLIENT.MESSAGE.NEW_USER,
            payload: { username, usercolor }
        }));
    }

    // TODO:
    // Exercise 7: Respond to messages from the servery by defining the .onmessage event handler
    wsClient.onmessage = (messageEvent) => {
        // showMessageReceived(messageEvent.data);
        const { type, payload } = JSON.parse(messageEvent.data);

        // Exercise 9: Parse custom message types, formatting each message based on the type.
        switch (type) {
            case CLIENT.MESSAGE.NEW_USER:
                showMessageReceived(`<em><strong style='color: #${payload.usercolor};'>${payload.username}</strong> has joint at ${payload.time}!</em>`);
                break;
            case CLIENT.MESSAGE.USER_LEFT:
                showMessageReceived(`<em><strong style='color: #${payload.usercolor};'>${payload.username}</strong> has left at ${payload.time}</em>`);
                break;
            case CLIENT.MESSAGE.NEW_MESSAGE:
                showMessageReceived(
                    `<strong style='color: #${payload.usercolor};'>${payload.username}</strong> <span'>${payload.message}</span> <span class='time'>${payload.time.slice(0, -6)}</span>`
                );
                break;
            case CLIENT.MESSAGE.OWN_MESSAGE_WITH_TIME:
                showMessageSent(`${payload.message} <span class='time' style='color: #fff'>${payload.time.slice(0, -6)}</span>`);
            default:
                break;
        }
    };

    /* Note:
    The event handlers below are useful for properly cleaning up a closed/broken WebSocket client connection.
    To read more about them, check out the WebSocket API documentation: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
    */

    // .onclose is executed when the socket connection is closed
    wsClient.onclose = (event) => {
        showMessageReceived('No WebSocket connection :(');
        wsClient = null;
    }

    // .onerror is executed when error event occurs on the WebSocket connection
    wsClient.onerror = (event) => {
        console.error("WebSocket error observed:", event);
        wsClient = null;
    }
}

function sendMessageToServer(message) {
    // Make sure the client is connected to the ws server
    if (!wsClient) {
        showMessageReceived('No WebSocket connection. Please submit a username');
        return;
    }

    // TODO:
    // Exercise 6: Send the message from the messageBox to the server
    // wsClient.send(message);

    // TODO:
    // Exercise 9: Send the message in a custom message object with .type and .payload properties
    const msgObj = {
        type: CLIENT.MESSAGE.NEW_MESSAGE,
        payload: { message, username, usercolor }
    };

    wsClient.send(JSON.stringify(msgObj));
}

////////////////////////////////////////////////
//////////// DOM HELPER FUNCTIONS //////////////
////////////////////////////////////////////////

const messages = document.querySelector('.chat');

// These functions are just aliases of the showNewMessage function
function showMessageSent(message) {
    showNewMessage(message, 'sending');
}
function showMessageReceived(message) {
    showNewMessage(message, 'receiving');
}

// This function displays a message in the messages container node. 
// className may either be 'mine' or 'yours' (see styles.css for the distinction)
function showNewMessage(message, className) {
    // Create a text node element for the message
    const textNode = document.createElement('div');
    textNode.innerHTML = message;
    textNode.className = 'message';

    // Wrap the text node in a message element
    const messageNode = document.createElement('div');
    messageNode.className = 'messages ' + className;
    messageNode.appendChild(textNode);

    // Append the messageNode to the messages container element
    messages.appendChild(messageNode);
    messages.scrollTop = messages.scrollHeight;
}