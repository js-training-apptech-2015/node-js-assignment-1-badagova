const http = require('http');
const https = require('https');
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
	
	this.serverURL = url.parse(serverURL);
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
	var proxyURL = url.parse(req.url)
    var options = {
        hostname: servers[1].serverURL.hostname,
        method: req.method,
        path: proxyURL.path,
		headers: req.headers
    };
	options.headers.host = servers[1].serverURL.hostname;
	if (req.method == 'OPTIONS'){
		res.writeHead(200, {
    		'Access-Control-Allow-Headers': 'Content-Type',
			'Access-Control-Allow-Methods': 'DELETE, GET, POST, PUT',
			'Access-Control-Allow-Origin': 'null'
		});
		res.end();
    } else if (options.method == 'POST'){
		req.setEncoding('utf8');
		req.on('data', function(reqData){
			console.log(reqData);
			var proxyRequest = https.request(options, function (serverResponse) {
				serverResponse.on('data', function (resData) {
					console.log(resData);
        			res.writeHead(serverResponse.statusCode, serverResponse.headers);
					res.write(resData);
					res.end();
    			});
			});
			proxyRequest.write(reqData);
			proxyRequest.end();
		});
		/*
		var options2 = {
        hostname: 'rocky-sierra-3635.herokuapp.com',
        method: 'GET',
        path: '/games',
		headers: {
    		'Content-Type': 'application/json'
		}
    };
		var proxyRequest = https.request(options2, function (serverResponse) {
    			serverResponse.on('data', function (data) {
					console.log(data);
    			});
			});
			proxyRequest.end();*/
	};
}).listen(8080);

proxyServer.on('connect', function(req, cltSocket, head){
	var srvSocket = net.connect(servers[0].serverURL.hostname, function() {
    cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                    'Proxy-agent: Node.js-Proxy\r\n' +
                    '\r\n');
    srvSocket.write(head);
    srvSocket.pipe(cltSocket);
    cltSocket.pipe(srvSocket);
  });
});

/*
Request URL:https://rocky-sierra-3635.herokuapp.com:443/games
Request Method:GET
Status Code:200 OK
Response Headersview source
connection:close
content-type:text/html;charset=UTF-8
date:Tue, 02 Feb 2016 11:30:00 GMT
server:Jetty(7.6.8.v20121106)
via:1.1 vegur
Request Headersview source
Content-Type:application/json
Host:rocky-sierra-3635.herokuapp.com

proxyServer.listen(8080, function () {
	var options = {
        hostname: servers[0].serverURL.hostname,
        method: 'CONNECT',
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
	proxyRequest.on('connect', (res, socket, head) => {
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
      proxyServer.close();
    });
});*/