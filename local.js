var net = require('net');

var server = net.createServer(function(socket) {
	socket.write('Echo server 1338\r\n');
	// socket.pipe(socket);
});

server.on('data', (data)=>{
	console.log("data received: "+ data);
});
server.listen(1338, '127.0.0.1');