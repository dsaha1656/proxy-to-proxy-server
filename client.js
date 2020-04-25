const net = require('net');

const server = net.createServer();

server.on('connection', (proxyToProxySocket) => {
  console.log('Proxy Connected To Proxy');
  // We need only the data once, the starting packet
  proxyToProxySocket.once('data', (data) => {
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
        proxyToProxySocket.write('HTTP/1.1 200 OK\r\n\n');
      } else {
        proxyToServerSocket.write(data);
      }

      proxyToProxySocket.pipe(proxyToServerSocket);
      proxyToServerSocket.pipe(proxyToProxySocket);

      proxyToServerSocket.on('error', (err) => {
        console.log('PROXY TO SERVER ERROR');
        console.log(err);
      });
      
    });
    proxyToProxySocket.on('error', err => {
      console.log('CLIENT TO PROXY ERROR');
      console.log(err);
    });
  });
});

server.on('error', (err) => {
  console.log('SERVER ERROR');
  console.log(err);
  // throw err;
});

server.on('close', () => {
  console.log('Proxy Disconnected');
});

server.listen(9000, () => {
  console.log('Server runnig at http://localhost:' + 9000);
});