
var net = require("net");
var http = require("http");
var httpServer = http.createServer();
var config = {tunnelPort: 9000, proxyPort:10000}
var wClients = [];
const tunnels = [];
var once = false;
//  ************************************************************************************************
//                      PROXY SECTION
//  ************************************************************************************************
const server = net.createServer((client) => {
    //working without tunnel
    // httpServer.emit('connection', client);
    wClients.push(client);
    console.log("----------client connected-------")
    client.allowHalfOpen = true;
    var node = tunnels[0];
    node.pipe(client).pipe(node);

}).listen(config.proxyPort)

//  ************************************************************************************************
//                      TUNNEL SECTION
//  ************************************************************************************************

const tServer = net.createServer(tunnel => {
    tunnel.allowHalfOpen = true;
    tunnel.id = 112;
    console.log('tunnel recieved-', tunnel.remoteAddress)
    tunnels.push(tunnel);
    console.log(tunnels.length)


    tunnel.once('data', (d) => {
        //var socket = JSON.parse(d.toString());
        //var s = new net.Socket();
        //s = socket;
        //s.connect({ host: 'www.youtube.com', port: 443 });
        var totalClients = wClients.length;
        console.log('Server:  tunnel data-recieved --------------', d.toString())
        if (totalClients > 0) {
            console.log('Server:  piping client from total waiting clients(%d)', wClients.length);
            var client = wClients[totalClients - 1];
            tunnel.pipe(client).pipe(tunnel);
        }
    })


}).listen(config.tunnelPort)
