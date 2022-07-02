import http from 'http';
import * as CONSTANTS from './public/utils/constants.js';
import fs from 'fs';
import path from 'path';
import { WebSocket, WebSocketServer } from 'ws';

const { PORT, MESSAGES, COLORS } = CONSTANTS;

// Active clients
const clients = [];
const colorsLeft = [...Object.values(COLORS)];

// Create HTTP server
const server = http.createServer((req, res) => {
  // get file path from req.url, or '/public/index.html' if req.url is '/'
  const filePath = (req.url === '/') ? '/index.html' : req.url;

  // determine contentType by file extension
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  if (extname === '.js') contentType = 'text/javascript';
  else if (extname === '.css') contentType = 'text/css';

  // pipe proper file to res object
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(`${path.resolve("public" + filePath)}`, 'utf8').pipe(res);
});

// Set up ws server
const wsServer = new WebSocketServer({ server });

wsServer.on('connection', (socket, req) => {
  console.log('New client connected!');

  socket.id = req.headers['sec-websocket-key'];

  socket.on('message', (data) => {
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

// Helper functions
function broadcast(data, socketToOmit) {
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

// Start server listening on localhost:8080
server.listen(PORT, () => {
  console.log(`Listening on: http://localhost:${server.address().port}`);
});

