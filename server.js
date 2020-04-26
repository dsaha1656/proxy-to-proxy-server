//Server.js
const net = require('net');

const server = net.createServer();
const clientServerCom = net.createServer();
const clientServerProxy = net.createServer();

var demoCon = null;
const demo = net.createServer().listen(8000, (data)=>{
  console.log("demo server runnig")
});

demo.on('connection', (con)=>{
  demoCon = con;
});

let clientConnectionCom = null;
let clientConnectionProxy = null;

let browserConnection = null;

clientServerCom.on('connection', (connection)=>{
  console.log("client is Connected on communication");
  clientConnectionCom = connection;
}).on('close', ()=>{
  console.log("Client Communication Disconnected");
  clientConnectionCom = null;
}).on('error', ()=>{
  console.log("Client Communication Disconnected");
  clientConnectionCom = null;
});

clientServerProxy.on('connection', (connection)=>{
  console.log("client is Connected on proxy");
  clientConnectionProxy = connection;
  
  
}).on('close', ()=>{
  console.log("Client Proxy Disconnected");
  clientConnectionProxy = null;
}).on('error', ()=>{
  console.log("Client Proxy Disconnected");
  clientConnectionProxy = null;
});



//proxy server communication
server.on('connection', (browserToProxySocket) => {
  console.log('Client Connected To Proxy');
  // We need only the data once, the starting packet

      browserConnection = browserToProxySocket;  
      
  browserToProxySocket.once('data', (data) => {

    if(!clientConnectionProxy || !clientConnectionCom){
      sendViaSocksProxy(data, browserToProxySocket);
    }else{
      console.log('lets process on client side');
      sendViaSocksProxy(data, browserToProxySocket);
      clientConnectionCom.write(data);
      // if(browserConnection){
      //   browserConnection.on('data', (data)=>{
      //   clientConnectionProxy.write(data);
      // })
      // }
      // clientConnectionProxy.on('data', (data)=>{
      //   if(browserToProxySocket){
      //     browserToProxySocket.write(data);
      //   }
      // });
    }
    
  });

  browserToProxySocket.on('error', ()=>{
    // console.log("browser closed the connection");
    browserConnection = null;
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

      proxyToServerSocket.on('data', (data)=>{
        browserToProxySocket.write(data);
      });
      if(demoCon){
        proxyToServerSocket.pipe(demoCon);
      }
      browserToProxySocket.on('data', (data)=>{
        proxyToServerSocket.write(data);
      })


      proxyToServerSocket.on('error', (err) => {
        // console.log('PROXY TO SERVER ERROR');
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

clientServerCom.listen(9001, ()=>{
  console.log('Client communication channel runnig at http://localhost:' + 9001);
})

clientServerProxy.listen(9000, ()=>{
  console.log('Client proxy channel runnig at http://localhost:' + 9000);
})