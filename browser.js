var net = require('net');
var con = new net.Socket();
con.connect(99, '127.0.0.1', ()=>{
	console.log("connection made");
});
con.on('data', (data)=>{
	console.log(data);
})
var client = () => {
	con.write("jo");
	client();	
}
setTimeout(client, 1000);