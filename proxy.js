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
    // If you want to see the packet uncomment below
    // console.log(data.toString());

    let isTLSConnection = data.toString().indexOf('CONNECT') !== -1;

    // By Default port is 80
    let serverPort = 80;
    let serverAddress;
    if (isTLSConnection) {
      // Port changed if connection is TLS
      serverPort = data.toString()
                          .split('CONNECT ')[1].split(' ')[0].split(':')[1];;
      serverAddress = data.toString()
                          .split('CONNECT ')[1].split(' ')[0].split(':')[0];
    } else {
      serverAddress = data.toString().split('Host: ')[1].split('\r\n')[0];
    }

    console.log(serverAddress);

    let proxyToServerSocket = net.createConnection({
      host: serverAddress,
      port: serverPort
    }, () => {
      sendMessageToAll('PROXY TO SERVER SET UP');
      if (isTLSConnection) {
        clientToProxySocket.write('HTTP/1.1 200 OK\r\n\n');
      } else {
        proxyToServerSocket.write(data);
      }

      clientToProxySocket.pipe(proxyToServerSocket);
      proxyToServerSocket.pipe(clientToProxySocket);

      proxyToServerSocket.on('error', (err) => {
        sendMessageToAll('PROXY TO SERVER ERROR');
        sendMessageToAll(err);
      });
      
    });
    clientToProxySocket.on('error', err => {
      sendMessageToAll('CLIENT TO PROXY ERROR');
      sendMessageToAll(err);
    });
  });
});

server.on('error', (err) => {
  console.log('SERVER ERROR');
  console.log(err);
  // throw err;
});

server.on('close', () => {
  console.log('Client Disconnected');
});

server.listen(10000, () => {
  console.log('Server runnig at http://localhost:' + 10000);
});