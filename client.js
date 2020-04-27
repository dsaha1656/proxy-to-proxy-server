const net = require('net');

const proxyServerIp = "127.0.0.1";
const proxyServerPort = 9000;
const proxyServerCommunicationPort = 9001;

let clientToProxyCommunication = net.Socket();
let clientToProxy = net.Socket();



clientToProxyCommunication.connect(
  {
    host: proxyServerIp,
    port: proxyServerCommunicationPort
  }, 
  () => {
    console.log('Client To Proxy Communication connection');
});

clientToProxyCommunication.on('data', (data)=>{
  let clientToProxy = net.Socket();
  clientToProxy.connect(
  {
    host: proxyServerIp,
    port: proxyServerPort
  }, 
  () => {
      console.log('Client To Proxy connection');
  });
  console.log("data ready for processing");

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

    let clientToInternet = net.createConnection({
      host: serverAddress,
      port: serverPort
    }, () => {
      console.log('PROXY TO SERVER SET UP');
      if (isTLSConnection) {
        clientToProxy.write('HTTP/1.1 200 OK\r\n\n');
      } else {
        clientToInternet.write(data);
      }
      console.log("data returned")
      clientToProxy.on('data', (data)=>{
        clientToInternet.write(data);
      })

      clientToInternet.on('data', (data)=>{
        clientToProxy.write(data);
      });

      clientToInternet.on('error', (err) => {
        console.log('-------------------PROXY TO SERVER ERROR');
        console.log(err);
        clientToProxy.end()
      });
      clientToInternet.on('close', (err) => {
        console.log('-------------------PROXY TO SERVER CLOSE');
        console.log(err);
        clientToProxy.end();
      });
      
    });

    clientToProxy.on('data', (dataFromProxyServer)=>{
        console.log("data from server");
    });

    clientToProxy.on('error', err => {
      console.log('-------------------CLIENT TO PROXY connection ERROR');
      console.log(err);
    });

    clientToProxy.on('close', err => {
      console.log('-------------------CLIENT TO PROXY connection CLOSE');
      console.log(err);
    });


});


clientToProxyCommunication.on('error', err => {
  console.log('-------------------CLIENT TO PROXY Communication ERROR');
  console.log(err);
});

