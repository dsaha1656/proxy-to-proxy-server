const net = require('net');
const proxyServerIp = "127.0.0.1";
const proxyServerPort = 9000;
let clientToProxy = net.Socket();

clientToProxy.connect(
  {
    host: proxyServerIp,
    port: proxyServerPort
  }, 
  () => {
    console.log('Client To proxy connection');
});

clientToProxy.on('data', (data)=> {
    // //connecting to the server

    // console.log(data.toString())
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
    console.log("tls=>",isTLSConnection);
    console.log(serverAddress, serverPort);

    let clientToServerSocket = net.Socket();
    clientToServerSocket.connect({
      host: serverAddress,
      port: serverPort
    }, () => {
      if (isTLSConnection) {
        clientToProxy.write('HTTP/1.1 200 OK\r\n\n');
      } else {
        clientToServerSocket.write(data);
      }
      clientToServerSocket.write(data);
      clientToServerSocket.pipe(clientToProxy);
      clientToProxy.pipe(clientToServerSocket);
    });
    clientToServerSocket.on('data', (data)=>{
      console.log(data);
    })

    clientToServerSocket.on('end', (data)=>{
      clientToServerSocket.end()
    })
    // let clientToServerSocket = net.createConnection({
    //   host: serverAddress,
    //   port: serverPort
    // }, () => {
    //   console.log('CLIENT TO SERVER SET UP');
    //   if (isTLSConnection) {
    //     clientToProxy.write('HTTP/1.1 200 OK\r\n\n');
    //   } else {
    //     clientToServerSocket.write(data);
    //     console.log("data written")
    //   }
    //   // console.log(JSON.stringify(data));
    //   // clientToProxy.pipe(clientToServerSocket);
    //   // clientToServerSocket.pipe(clientToProxy);
      
    // });
    
    // clientToServerSocket.on('close',()=>{
    //   console.log("connection ended");
    // })

    clientToProxy.on('error', (err) => {
      console.log('CLIENT TO SERVER ERROR');
      console.log(err);
    });
});




