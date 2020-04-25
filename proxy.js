var net = require('net');

var server = net.createServer(function(socket) {
	socket.write('Echo from proxy server 99\r\n');
	socket.pipe(socket);
});

server.on('data', (data)=>{
	console.log("data received: "+ data);
});
server.listen(99, '127.0.0.1', ()=>{
	console.log("proxy running....");
});