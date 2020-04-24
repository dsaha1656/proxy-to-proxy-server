const net = require('net');

const server = net.createServer();
//websocket for send data to client server
const http = require('http');
const WebSocketServer = require('websocket').server;
const WSserver = http.createServer();
var wsconnection = null;
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
    wsconnection = connection;
});

var sendMessageToAll = (msg) => {
  console.log(msg);
  if(wsconnection)
    wsconnection.sendUTF(msg);
}
//proxy server communication
server.on('connection', (clientToProxySocket) => {
  sendMessageToAll('Client Connected To Proxy');
  // We need only the data once, the starting packet
  clientToProxySocket.once('data', (data) => {

    let isTLSConnection = data.toString().indexOf('CONNECT') !== -1;
    let serverPort = 9000;
    let serverAddress = "127.0.0.1";
    

    console.log(serverAddress);

    let proxyToProxySocket = net.createConnection({
      host: serverAddress,
      port: serverPort
    }, () => {

      // var tmpData = {'data':data};
      proxyToProxySocket.write(data)
      clientToProxySocket.pipe(proxyToProxySocket);
      proxyToProxySocket.pipe(clientToProxySocket);

      proxyToProxySocket.on('error', (err) => {
        console.log('PROXY TO PROXY ERROR');
        console.log(err);
      });
      
    });
    clientToProxySocket.on('error', err => {
      sendMessageToAll('CLIENT TO PROXY ERROR');
      sendMessageToAll(err);
    });
  });
});

server.on('error', (err) => {
  console.log('PROXY ERROR');
  console.log(err);
  // throw err;
});

server.on('close', () => {
  console.log('Client Disconnected');
});

server.listen(10000, () => {
  console.log('Server runnig at http://localhost:' + 10000);
});