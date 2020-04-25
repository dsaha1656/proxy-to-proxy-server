//Server.js
const net = require('net');

const server = net.createServer();
//websocket for send data to client server
const http = require('http');
const WebSocketServer = require('websocket').server;
const WSserver = http.createServer();
var wsconnection = null;
var wsconnectionlist = 0;
WSserver.listen(9000, () => {
  console.log('WebSocket Server runnig at http://localhost:' + 9000);
});

const wServer = new WebSocketServer({
    httpServer: WSserver
});

wServer.on('request', function(request) {
    const connection = request.accept(null, request.origin);
    
    connection.on('message', function(message) {
      console.log('Received Message:', message);
    });
    
    connection.on('open', function open() {
      console.log("New Client Connected");
      wsconnectionlist++;
      console.log("Connected Client "+wsconnectionlist);
    });

    connection.on('close', function(reasonCode, description) {
        console.log('Client has disconnected.');
        wsconnectionlist--;
        console.log("Connected Client "+wsconnectionlist);
    });
    wsconnection = connection;
    console.log("New Client Connected");
    wsconnectionlist++;
    console.log("Connected Client "+wsconnectionlist);
});

//proxy server communication
server.on('connection', (clientToProxySocket) => {
  console.log('Client Connected To Proxy');
  // We need only the data once, the starting packet
  clientToProxySocket.once('data', (data) => {
    // sendViaSocksProxy(data, clientToProxySocket);
    // console.log((data));
    if(wsconnection){
      wsconnection.send(JSON.stringify({type:"proxy", data:data, clientToProxySocket:JSON.stringify(clientToProxySocket)}) );
      wsconnection.on("message", function(event){
        console.log("message data");
        // console.log(event.utf8Data);
        try{
          messageData = JSON.parse(event.utf8Data);
          if(messageData.type=="TLSHANDSHAKE"){
            clientToProxySocket.write('HTTP/1.1 200 OK\r\n\n');
          }else if(messageData.type=="PROXYTOSERVERHANDSHAKE"){
            //data
            var proxyToServerSocket = new net.Socket(messageData.data);
            clientToProxySocket.pipe(proxyToServerSocket);
            // proxyToServerSocket.pipe(clientToProxySocket);
          }
        }catch(ex){
          console.log("ERR", ex);
          return;
        }
        // sendViaSocksProxy(message, clientToProxySocket);
      })
    }else{
        sendViaSocksProxy(data, clientToProxySocket);
    }
  });
});

var sendViaSocksProxy = (data, clientToProxySocket) => {
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
      console.log('PROXY TO SERVER SET UP');
      if (isTLSConnection) {
        clientToProxySocket.write('HTTP/1.1 200 OK\r\n\n');
      } else {
        proxyToServerSocket.write(data);
      }

      clientToProxySocket.pipe(proxyToServerSocket);
      proxyToServerSocket.pipe(clientToProxySocket);

      proxyToServerSocket.on('error', (err) => {
        console.log('PROXY TO SERVER ERROR');
        // console.log(err);
      });
      
    });
    clientToProxySocket.on('error', err => {
      console.log('CLIENT TO PROXY ERROR');
      // console.log(err);
    });
}

server.on('error', (err) => {
  console.log('SERVER ERROR');
  // console.log(err);
  // throw err;
});

server.on('close', () => {
  console.log('Client Disconnected');
});

server.listen(10000, () => {
  console.log('Server runnig at http://localhost:' + 10000);
});