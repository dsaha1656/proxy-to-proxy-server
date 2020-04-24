// Node.js WebSocket server script
const http = require('http');
const WebSocketServer = require('websocket').server;
const WSserver = http.createServer();
WSserver.listen(9898);

const wServer = new WebSocketServer({
    httpServer: WSserver
});

wServer.on('request', function(request) {
    const connection = request.accept(null, request.origin);
    connection.on('message', function(message) {
      console.log('Received Message:', message.utf8Data);
      connection.sendUTF('Hi this is WebSocket server!');
    });
    connection.on('close', function(reasonCode, description) {
        console.log('Client has disconnected.');
    });
});
