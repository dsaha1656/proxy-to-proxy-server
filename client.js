const net = require('net');
const request = require('request');

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

clientToProxy.on('data', (dataFromProxyServer)=>{

    console.log("data from server");
    // data = JSON.parse(dataFromProxyServer);
    // console.log(data.con=="SERVERTOCLIENT");
    // data = data.data;
    // // console.log(data);

    // data = new Buffer(data);
    // data = new Buffer(data);
    console.log(dataFromProxyServer.toString())
    var proxiedConnection = (dataFromProxyServer.toString().split('TYPE: SERVERTOCLIENT').length>1);
    console.log(proxiedConnection);
    data = dataFromProxyServer;
    // // data = JSON.stringify(data.data);
    // // console.log(data)
    // data = Buffer.(JSON.parse(data.data))
    // console.log(data.data);
    if(proxiedConnection){

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

    let clientToServerSocket = net.createConnection({
      host: serverAddress,
      port: serverPort
    }, () => {
      console.log('PROXY TO SERVER SET UP');
      if (isTLSConnection) {
        clientToProxy.write('HTTP/1.1 200 OK\r\n\n');
      } 
      else {
        clientToServerSocket.write(data);
      }

      clientToProxy.pipe(clientToServerSocket);
      clientToServerSocket.pipe(clientToProxy);

      clientToServerSocket.on('error', (err) => {
        console.log('PROXY TO SERVER ERROR');
        console.log(err);
      });
      
    });

    }
});

clientToProxy.on('error', err => {
  console.log('CLIENT TO PROXY ERROR');
  console.log(err);
});

