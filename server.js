const http = require('http');
const https = require('https');
const net = require('net');
const url = require('url');

function Scheduling (servers){
	this.servers = servers;
	this.current = -1;
	this.getNext = function() {
		if (this.current < 2){
			this.current ++;
		} else {
			this.current = 0;
		};
		return this.servers[this.current];
	};
};

function Server (serverURL){
	this.serverURL = url.parse(serverURL);
	this.serverName = serverURL.slice(serverURL.indexOf('//')+2, serverURL.indexOf(".herokuapp"));	
	this.defaultOptions = {
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Allow-Methods': 'DELETE, GET, POST, PUT',
		'Access-Control-Allow-Origin': 'null'
	};
	this.setOptions = function(request) {
		//var url = url.parse(request.url)
    	this.options = {
        	hostname: this.serverURL.hostname,
        	method: request.method,
        	path: url.parse(request.url).path,
			headers: request.headers
    	};
		this.options.headers['host'] = this.serverURL.hostname;
	};
	this.wrap = function (data){
		return {
			'server': this.serverName,
			'data': data
		};
	};
};

var servers = [];
servers.push(new Server('https://rocky-sierra-3635.herokuapp.com'), 
			 new Server('https://polar-waters-8630.herokuapp.com'),
			 new Server('https://aqueous-ocean-2864.herokuapp.com'));

var scheduling = new Scheduling (servers);


var proxyServer = http.createServer(function(req,res){
	var currentServer = scheduling.getNext();
	currentServer.setOptions(req);
	req.setEncoding('utf8');
	if (req.method == 'OPTIONS'){
		res.writeHead(200, currentServer.defaultOptions);
		res.end();
    } else if ((currentServer.options.method == 'POST')||(currentServer.options.method == 'PUT')){
		req.on('data', function(reqData){
			var proxyRequest = https.request(currentServer.options, function (serverResponse) {
				serverResponse.on('data', function (resData) {
					res.writeHead(serverResponse.statusCode, serverResponse.headers);
					res.write(JSON.stringify(currentServer.wrap(resData.toString())));
					res.end();
    			});
			});
			proxyRequest.write(reqData);
			proxyRequest.end();
			proxyRequest.on("error", function(err){
				console.log(err);
				currentServer = scheduling.getNext();
				currentServer.setOptions(req);
				
			});
		});
	} else if (currentServer.options.method == 'GET'){
		var proxyRequest = https.request(currentServer.options, function (serverResponse) {
			serverResponse.on('data', function (resData) {
				res.writeHead(serverResponse.statusCode, serverResponse.headers);
				res.write(JSON.stringify(currentServer.wrap(JSON.stringify(resData))));
				res.end();
    		});
		});
		proxyRequest.end();
	};
}).listen(8080);

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
*/