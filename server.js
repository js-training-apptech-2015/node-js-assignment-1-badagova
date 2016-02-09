const http = require('http');
const https = require('https');
//const net = require('net');
const url = require('url');

function Scheduling (servers){
	this.servers = servers;
	this.current = -1;
	
};

function Server (serverURL){
	this.serverURL = url.parse(serverURL);
	this.serverName = serverURL.slice(serverURL.indexOf('//')+2, serverURL.indexOf(".herokuapp"));	
};

function Servers (serversArr){
	var that = this;
	this.serversArr = serversArr;
	this.current = -1;
	this.options = {};
	
	this.defaultOptions = {
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Allow-Methods': 'DELETE, GET, POST, PUT',
		'Access-Control-Allow-Origin': 'null'
	};
	
	this.setOptions = function(request) {
		//var url = url.parse(request.url)
    	that.options = {
        	hostname: that.serversArr[that.current].serverURL.hostname,
        	method: request.method,
        	path: url.parse(request.url).path,
			headers: request.headers
    	};
		that.options.headers['host'] = that.serversArr[that.current].serverURL.hostname;//'aqueous-ocean-2864.herokuapp.com';
	};
	
	this.wrap = function (data){
		return {
			'server': that.serversArr[that.current].serverName,
			'data': data
		};
	};
	
	this.PostPut = function PostPutRequest (reqData, res, req) {
		var proxyRequest = https.request(that.options, function (serverResponse) {
			serverResponse.on('data', function (resData) {
				res.writeHead(serverResponse.statusCode, serverResponse.headers);
				res.write(JSON.stringify(that.wrap(resData.toString())));
				res.end();
    		});
		});
		proxyRequest.write(reqData);
		proxyRequest.end();
		proxyRequest.on('error', function(err){
			console.log(err);
			that.getNext(req);
			PostPutRequest(reqData, res);
		});
	};
	
	this.Get = function GetRequest (res, req) {
		var proxyRequest = https.request(that.options, function (serverResponse) {
			serverResponse.on('data', function (resData) {
				res.writeHead(serverResponse.statusCode, serverResponse.headers);
				res.write(JSON.stringify(that.wrap(resData.toString())));
				res.end();
    		});
		});
		proxyRequest.end();
		proxyRequest.on('error', function(err){
			console.log(err);
			that.getNext(req);
			GetRequest(res);
		});
	};
	
	this.getNext = function(req) {
		if (that.current < 2){
			that.current ++;
		} else {
			that.current = 0;
		};
		that.setOptions(req);
	};		
};

var servers = [];
servers.push(new Server('https://rocky-sierra-3635.herokuapp.com'), 
			 new Server('https://polar-waters-8630.herokuapp.com'),
			 new Server('https://aqueous-ocean-2864.herokuapp.com'));

var currentServer = new Servers (servers);

var proxyServer = http.createServer(function(req,res){
	currentServer.getNext(req);
	req.setEncoding('utf8');
	if (req.method == 'OPTIONS'){
		res.writeHead(200, currentServer.defaultOptions);
		res.end();
    } else if ((currentServer.options.method == 'POST')||(currentServer.options.method == 'PUT')){
		req.on('data', function(reqData){
			currentServer.PostPut(reqData, res);
		});
	} else if (currentServer.options.method == 'GET'){
		currentServer.Get(res);
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