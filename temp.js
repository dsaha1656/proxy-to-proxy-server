const net = require('net');

const proxyServerIp = "127.0.0.1";

let demo = net.Socket();

demo.connect(
  {
    host: proxyServerIp,
    port: 8000,
    keepAlive: true
  }, 
  () => {
    console.log('demo connection');
});

demo.on('data', (data)=>{
	console.log(data);
  demo.write(data)
});