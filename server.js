///////////////////////////////////////////////
///////////// IMPORTS + VARIABLES /////////////
///////////////////////////////////////////////

// const http = require('http');
import http from 'http';
// const CONSTANTS = require('./utils/constants.js');
import * as CONSTANTS from './public/utils/constants.js';
// const fs = require('fs');
import fs from 'fs';
// const path = require('path');
import path from 'path';
// const { WebSocket, WebSocketServer } = require('ws');
import { WebSocket, WebSocketServer } from 'ws';

// You may choose to use the constants defined in the file below
const { PORT, MESSAGES, COLORS } = CONSTANTS;

// Active clients
const clients = [];
const colorsLeft = [...Object.values(COLORS)];

///////////////////////////////////////////////
///////////// HTTP SERVER LOGIC ///////////////
///////////////////////////////////////////////

// Create the HTTP server
const server = http.createServer((req, res) => {
  // get the file path from req.url, or '/public/index.html' if req.url is '/'
  const filePath = (req.url === '/') ? '/index.html' : req.url;

  // determine the contentType by the file extension
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  if (extname === '.js') contentType = 'text/javascript';
  else if (extname === '.css') contentType = 'text/css';

  // pipe the proper file to the res object
  res.writeHead(200, { 'Content-Type': contentType });
  // fs.createReadStream(`${__dirname}/${filePath}`, 'utf8').pipe(res);
  fs.createReadStream(`${path.resolve("public" + filePath)}`, 'utf8').pipe(res);
});

///////////////////////////////////////////////
////////////////// WS LOGIC ///////////////////
///////////////////////////////////////////////

// Exercise 3: Create the WebSocket Server using the HTTP server
const wsServer = new WebSocketServer({ server });


// TODO
// Exercise 5: Respond to connection events 
wsServer.on('connection', (socket, req) => {
  console.log('New client connected!');

  // Give ID
  // console.log('sec-websocket-key: ', req.headers['sec-websocket-key']);
  socket.id = req.headers['sec-websocket-key'];

  // Exercise 6: Respond to client messages
  socket.on('message', (data) => {
    // console.log('received: %s', data);
    // socket.send('Message received: ' + data.toString());
    const { type, payload } = JSON.parse(data.toString());

    switch (type) {
      case MESSAGES.MESSAGE.NEW_USER:
        handleNewUser(data, socket);
        break;
      case MESSAGES.MESSAGE.NEW_MESSAGE:
        payload.time = new Date().toLocaleTimeString();
        payload.usercolor = clients[socket.id].usercolor;
        broadcast({ type, payload }, socket);
        socket.send(JSON.stringify({
          type: MESSAGES.MESSAGE.OWN_MESSAGE_WITH_TIME,
          payload
        }));
        break;
      default:
        break;
    }

  });

  socket.on('close', (data) => {
    const time = new Date().toLocaleString();

    broadcast({
      type: MESSAGES.MESSAGE.USER_LEFT,
      payload: {
        username: clients[socket.id].username,
        usercolor: clients[socket.id].usercolor,
        time
      }
    }, socket);

    colorsLeft.push(clients[socket.id].usercolor);

    if (clients[socket.id]) {
      delete clients[socket.id];
    }
  });
});

// Exercise 7: Send a message back to the client, echoing the message received
// Exercise 8: Broadcast messages received to all other clients


///////////////////////////////////////////////
////////////// HELPER FUNCTIONS ///////////////
///////////////////////////////////////////////

function broadcast(data, socketToOmit) {
  // TODO
  // Exercise 8: Implement the broadcast pattern. Exclude the emitting socket!
  wsServer.clients.forEach((connectedClient) => {
    if (connectedClient.readyState === WebSocket.OPEN && connectedClient !== socketToOmit) {
      connectedClient.send(JSON.stringify(data));
    }
  });
}

function handleNewUser(data, socket) {
  const { type, payload } = JSON.parse(data.toString());
  payload.time = new Date().toLocaleString();

  if (clients.length <= 8) {
    payload.usercolor = colorsLeft.splice(Math.floor(Math.random() * colorsLeft.length), 1)[0];
  } else {
    payload.usercolor = Math.floor(Math.random() * 16777215).toString(16);
  }

  broadcast({ type, payload }, socket);

  clients[socket.id] = {
    id: socket.id,
    username: payload.username,
    usercolor: payload.usercolor
  };
}

// Start the server listening on localhost:8080
server.listen(PORT, () => {
  console.log(`Listening on: http://localhost:${server.address().port}`);
});

