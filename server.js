const http = require('http');
const net = require('net');
const url = require('url');

var servers = [];
servers.push(new Server('https://rocky-sierra-3635.herokuapp.com'), 
			 new Server('https://polar-waters-8630.herokuapp.com'),
			 new Server('https://aqueous-ocean-2864.herokuapp.com'));

function Response (serverName, data){
	this.server = serverName;
	this.data = data;
};

function Server (serverURL){
	this.options = {
		hostname: serverURL,
	  	path: '/games',
  		headers: {
    		'Content-Type': 'application/json'
		}
	};
	
	this.serverURL = serverURL;
	this.serverName = serverURL.slice(serverURL.indexOf('//')+2, serverURL.indexOf(".herokuapp"));
	this.request = function(method){
		var req;
		this.options.method = method;
		req = https.request(this.options, function(res) {
			
			res.on('data', function(srvResponse) {
				new Response(this.serverName, srvResponse);
			})
			reject('error');
    		/*res.on('end', function () {
    
  			});*/
			
			});
		//req.write(body);
		req.end();
	};		 
};



var proxyServer = http.createServer(function(req,res){
	console.log(req.url);
	debugger;
	var proxyURL = url.parse(req.url)
    var options = {
       // hostname: servers[0].serverURL.hostname,
        method: req.method,
        //path: servers[0].serverURL + proxyURL.path,
		path: 'https://polar-waters-8630.herokuapp.com/games',
        headers: req.headers
    };
    var proxyRequest = http.request(options, function (res) {
    	res.on('data', function (data) {
        	console.log(data.toString());
    	});
	});
 	proxyRequest.end();
}).listen(8080);

/*proxy.on('connect', function(req, cltSocket, head){
	var srvSocket = net.connect(servers[0].serverURL.hostname, function() {
    cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                    'Proxy-agent: Node.js-Proxy\r\n' +
                    '\r\n');
    srvSocket.write(head);
    srvSocket.pipe(cltSocket);
    cltSocket.pipe(srvSocket);
  });
});*/

//proxy., function() {
/*	var options = {
    port: servers[0].serverURL.port,
    hostname: servers[0].serverURL.hostname,
    method: 'CONNECT',
    path: 'games'
  };

  var req = http.request(options);
  req.end();

  req.on('connect', (res, socket, head) => {
    console.log('got connected!');

    // make a request over an HTTP tunnel
    socket.write('GET / HTTP/1.1\r\n' +
                 'Host: www.google.com:80\r\n' +
                 'Connection: close\r\n' +
                 '\r\n');
    socket.on('data', (chunk) => {
      console.log(chunk.toString());
    });
    socket.on('end', () => {
      proxy.close();
    });
  });
});*/