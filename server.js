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
const { PORT, CLIENT } = CONSTANTS;

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
  fs.createReadStream(`${path.join(path.resolve('./'), 'public', filePath)}`, 'utf8').pipe(res);
});

///////////////////////////////////////////////
////////////////// WS LOGIC ///////////////////
///////////////////////////////////////////////

// Exercise 3: Create the WebSocket Server using the HTTP server
const wsServer = new WebSocketServer({ server });


// TODO
// Exercise 5: Respond to connection events 
wsServer.on('connection', (socket) => {
  console.log('New client connected!');

  // Exercise 6: Respond to client messages
  socket.on('message', (data) => {
    console.log('received: %s', data);
    // socket.send('Message received: ' + data.toString());
    const { type, payload } = JSON.parse(data.toString());

    switch (type) {
      case CLIENT.MESSAGE.NEW_USER:
        payload.time = new Date().toLocaleString();
        broadcast(JSON.stringify({ type, payload }));
        break;
      case CLIENT.MESSAGE.NEW_MESSAGE:
        payload.time = new Date().toLocaleTimeString();
        broadcast(JSON.stringify({ type, payload }), socket);
        socket.send(JSON.stringify({
          type: CLIENT.MESSAGE.OWN_MESSAGE_WITH_TIME,
          payload
        }));
        break;
      default:
        break;
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
      connectedClient.send(data.toString());
    }
  });
}

// Start the server listening on localhost:8080
server.listen(PORT, () => {
  console.log(`Listening on: http://localhost:${server.address().port}`);
});

