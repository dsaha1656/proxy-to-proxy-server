var net = require('net');

var server = net.createServer(function(socket) {
	socket.write('Echo from internet 100\r\n');
	socket.pipe(socket);
});

server.on('data', (data)=>{
	console.log("data received: "+ data);
});
server.listen(100, '127.0.0.1');