const net = require('net');

const server = net.createServer();

server.on('connection', (clientToProxySocket) => {
  console.log('Client Connected To Proxy');
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
      console.log('CLIENT TO PROXY ERROR');
      console.log(err);
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