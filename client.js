
//  ************************************************************************************************
var net = require("net");
var http = require("http");
var url = require("url");

var client = new net.Socket();
client.allowHalfOpen = true;
client.connect(9000, '127.0.0.1', function() { console.log('Connected'); });

client.once('data', (data) => {

    var _data = data.toString();

    var d = data.toString().split("\r\n");
    var _x = _data.split('\r\n')[0].split(' ')[1];
    var _host = _x.split(':')[0];
    var _port = _x.split(':')[1] || 443;
    console.log('incoming message to node request data is ', _x);
    if (d.length > 4) {      
        httpServer.emit('connection', client)
    } else {
        console.log('its response  and will be sent back to server from node : ', d)
    }

})





var httpServer = http.createServerer = http.createServer();

httpServer.addListener('connect', function(req, socket) {
    var hostPort = getHostPortFromString(req.url, 443);
    var hostDomain = hostPort[0];
    var port = parseInt(hostPort[1]);

    console.log("Proxying HTTPS request for:", hostDomain, port);


    var proxySocket = new net.Socket();
    client.allowHalfOpen = true;
    proxySocket.connect(port, hostDomain, function() {
        var httpV = "HTTP/" + req.httpVersion + " 200 Connection established\r\n\r\n";
        socket.write(httpV);
    });

    proxySocket.on('data', function(chunk) {
        console.log(' ------------------------------------------------------------------------ ')
        console.log('          web response recieved by node is ')
        console.log(' ------------------------------------------------------------------------ ')
		console.log(chunk.toString());
        
        socket.write(chunk);
    });

    proxySocket.on('end', function() {
        socket.end();
    });

    proxySocket.on('error', function() {
        socket.write("HTTP/" + req.httpVersion + " 500 Connection error\r\n\r\n");
        socket.end();
    });

    socket.on('data', function(chunk) {
        proxySocket.write(chunk);

    });

    socket.on('end', function() {
        proxySocket.end();
    });

    socket.on('error', function() {
        proxySocket.end();
    });


});


var regex_hostport = /^([^:]+)(:([0-9]+))?$/;

var getHostPortFromString = function(hostString, defaultPort) {
    var host = hostString;
    var port = defaultPort;

    var result = regex_hostport.exec(hostString);
    if (result != null) {
        host = result[1];
        if (result[2] != null) {
            port = result[3];
        }
    }

    return ([host, port]);
};