// server.js

const express = require('express');
const WebSocket = require('ws');
const uuid = require('node-uuid');
const colours = ['#4286f4', '#ef8d23', '#23ed15', '#ed15e5'];

// Set the port to 4000
const PORT = 4000;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new WebSocket.Server({ server });

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
  console.log('Client connected');

  wss.broadcast(JSON.stringify({
    type: 'userCount',
    content: wss.clients.size
  }));

  ws.send(JSON.stringify({
    type: 'userColour',
    content: colours[Math.floor(Math.random() * 4)]
  }));

  ws.on('message', function incoming(message) {
    const receivedMsg = JSON.parse(message);

    outgoingMsg = receivedMsg;

    switch(receivedMsg.type) {
      case 'postMessage':
        console.log(`User ${receivedMsg.username} said ${receivedMsg.content}`);
        outgoingMsg.type = 'incomingMessage';
        break;
      case 'postNotification':
        console.log(receivedMsg);
        outgoingMsg.type = 'incomingNotification';
        break;
      default:
        console.log(`Unknown message type: ${receivedMsg.type}`)
    }

    outgoingMsg.id = uuid.v4();

    wss.broadcast(JSON.stringify(outgoingMsg));

  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    console.log('Client disconnected');

    wss.broadcast(JSON.stringify({
      type: 'userCount',
      content: wss.clients.size
    }));

    });
});