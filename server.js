//Server.js
const net = require('net');

const server = net.createServer();
const clientServer = net.createServer();
let clientIsConneted = false;
let proxyToClientConnection = null;
clientServer.on('connection', (connection)=>{
  console.log("client is Connected on proxy server");
  clientIsConneted = true;
  proxyToClientConnection = connection;
});


//proxy server communication
server.on('connection', (browserToProxySocket) => {
  console.log('Browser connection to Proxy');
  // console.log(browserToProxySocket)
  // We need only the data once, the starting packet
  browserToProxySocket.once('data', (data) => {
    if(!clientIsConneted){
      sendViaSocksProxy(data, browserToProxySocket);  
    }else{

      proxyToClientConnection.write(data);
      // console.log(data.toString());
      proxyToClientConnection.pipe(browserToProxySocket);
      browserToProxySocket.pipe(proxyToClientConnection);

    }
    
  });
});


var sendViaSocksProxy = (data, browserToProxySocket) => {
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
        browserToProxySocket.write('HTTP/1.1 200 OK\r\n\n');
      } else {
        proxyToServerSocket.write(data);
      }

      browserToProxySocket.pipe(proxyToServerSocket);
      proxyToServerSocket.pipe(browserToProxySocket);

      proxyToServerSocket.on('error', (err) => {
        console.log('PROXY TO SERVER ERROR');
        // console.log(err);
      });
      
    });
    browserToProxySocket.on('error', err => {
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
  clientIsConneted = false;
  proxyToClientConnection = null;
});

server.listen(10000, () => {
  console.log('Server runnig at http://localhost:' + 10000);
});
clientServer.listen(9000, ()=>{
  console.log('Client Server runnig at http://localhost:' + 9000);
})