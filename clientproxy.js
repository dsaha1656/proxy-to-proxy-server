//Client.js
const WebSocket = require('ws')
const net = require('net');

var ws = new WebSocket("ws://127.0.0.1:9000");
ws.onopen = function (event) {
console.log('Connection is open ...');
ws.send("Hello Server");
};
ws.onerror = function (err) {
console.log('err: ', err);
}
ws.onmessage = function (event) {
	try{
		messageData = JSON.parse(event.data);
		if(messageData.type=="proxy"){
			data= messageData.data;
			clientToProxySocket = new net.Socket(messageData.clientToProxySocket);
		}
	}catch(ex){
		console.log("ERR", event.data);
		return;
	}
	var buffer = Buffer.from(data);
	// console.log(buff);
	startSimulation(buffer, clientToProxySocket);
};
ws.onclose = function() {
console.log("Connection is closed...");
}

var startSimulation = (data) => {
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
      console.log('WebSocket TO SERVER SET UP');
      if (isTLSConnection) {
        // clientToProxySocket.write('HTTP/1.1 200 OK\r\n\n');
        ws.send(JSON.stringify({type:"TLSHANDSHAKE"}));
      } else {
        proxyToServerSocket.write(data);
      }
      console.log((proxyToServerSocket));
      console.log("---------------------------------")
      ws.send(JSON.stringify({type:"PROXYTOSERVERHANDSHAKE", data:JSON.stringify(proxyToServerSocket)}));
      // clientToProxySocket.pipe(proxyToServerSocket);
      proxyToServerSocket.pipe(clientToProxySocket);

      proxyToServerSocket.on('error', (err) => {
        console.log('WebSocket TO SERVER ERROR');
        // console.log(err);
      });
      
    }).on('data', (data)=>{
    	console.log(data);
    });
}