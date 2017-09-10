var express = require('express') ;
var socket = require('socket.io') ;
var tcpp = require('tcp-ping');


// app setup
var app = express() ;

var server = app.listen(4000,'0.0.0.0', function(){
  console.log("Listening to port 4000") ;
})

// Static files
app.use(express.static('public')) ;

// Socket setup
var io = socket(server) ;

// Change hard coded to programme
var localHostIP = '192.168.43.202'

class clientPingPair{
  constructor(clientIp, ping){
    this.clientIp = clientIp;
    this.ping = ping;
  }
}

var clientPing = 0;

function pingClient(clientIp){
  tcpp.ping({ address: clientIp, port:4000,  attempts:100 }, function(err, data) {
      clientPing = data.avg;
  });
  return clientPing;
}


io.on('connection', function(socket){



  var clientIp = socket.request.connection.remoteAddress;
  var socketId = socket.id ;
 console.log("Client and local host Ips: " + clientIp+" "+localHostIP) ;
  // console.log('Made socket connection', socket.id) ;
  // console.log(clientIp) ;

  // Make the client admin if it is from localhost
  if(clientIp==localHostIP){
  	// console.log("Admin client") ;
  	io.to(socketId).emit('admin') ;
  }

  // Receiving admin state and broadcasting it at the same time
  socket.on('adminState', function (data){


    data.ping = pingClient(clientIp);
    console.log(data);
	  io.sockets.emit('sync', data) ;
	}) ;

  socket.on('addSong', function(data){
  	console.log("Request for adding song: " + data.songId);
  	io.sockets.emit('addSong', data) ;
  });

  socket.on('loadNewSong', function(data){
  	console.log("Request for loading new song: " + data.songId);
  	io.sockets.emit('loadNewSong', data) ;
  }) ;

}) ;





// Update time after every 'syncTimeInterval' miliseconds
// var syncTimeInterval = 20000 ;
// var myVar = setInterval( syncClientsWithServers, syncTimeInterval);

// function syncClientsWithServers(){
//   console.log("I am trying to emit") ;
//   io.sockets.emit('sync', {seekTime: 6, playerState: 1}) ;
// }



