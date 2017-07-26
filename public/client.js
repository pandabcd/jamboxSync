// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


var songList = ["https://www.youtube.com/watch?v=8UVNT4wvIGY", "https://www.youtube.com/v/ukjrC6iwhCE",  "https://www.youtube.com/watch?v=x_elT6zkqN0"] ;
var index = 0 ;
var connectToServer = true ;
var isAdmin = false ;


// Connecting to server and stuff
var socket = io.connect("http://192.168.1.7:5000") ;

socket.on('admin', function(){
  isAdmin = true ;
  console.log("I am the admin: " + isAdmin) ;
})

socket.on('sync', function (data){
  console.log("I have receieved data") ;
  console.log(data) ;
  syncClientsWithServer(data) ;
}) ;


// Function to sync according to playtime and state of player in server
function syncClientsWithServer(data){
  var currentTime = data.currentTime ;
  var serverState = data.serverState ;
  console.log(connectToServer +" "+ currentTime +" " + serverState) ;

  if( !connectToServer){
    return ;
  }

  while (client.getPlayerState == YT.PlayerState.buffering){
    sleep(4);
  }

  // var currentTime = server.getCurrentTime() ;
  console.log(currentTime)
  client.seekTo(currentTime) ;

  var serverState = server.getPlayerState() ;
  
  if(serverState==1){
    client.playVideo() ;
 }

if(serverState==2 || serverState==3){
    client.pauseVideo() ;
 }

}

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var server, client;
function onYouTubeIframeAPIReady() {
  server = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: '8UVNT4wvIGY',
    events: {
      'onReady': onPlayerReadyServer,
      'onStateChange': onPlayerStateChangeServer
    }
  });

  client = new YT.Player('player2', {
    height: '399',
    width: '656',
    videoId: '8UVNT4wvIGY',
    events: {
      'onReady': onPlayerReadyClient,
      'onStateChange': onPlayerStateChangeClient
    }
  });
}



// 4. The API will call this function when the video player is ready.
function onPlayerReadyServer(event) {
  event.target.playVideo();
  // var myVar = setInterval( syncClientsWithServers, 5000);
}

// A sleep function i do not understand
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}




// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChangeServer(event) {
	
	
	if(event.data == YT.PlayerState.PLAYING){
		var currentTime = server.getCurrentTime();
		console.log("Server playing:current Time: " + currentTime + "\n");
		if (connectToServer){
  		client.seekTo(currentTime) ;
  		client.playVideo() ;
  	}
	}

	if(event.data == YT.PlayerState.PAUSED){
		console.log("Server state change: paused" + event.data);
		if (connectToServer){
  		client.pauseVideo() ;
  	}
	}

	if(event.data == YT.PlayerState.BUFFERING){
		console.log("Server state change: buffering" + event.data);
		if(connectToServer){
			client.pauseVideo() ;
		}
	}

	if(event.data == YT.PlayerState.CUED){
		console.log("Server state change: cued " + event.data);
		console.log("Server cued");
	}

	// Make this for client side too
  if (event.data == YT.PlayerState.ENDED){
  	server.loadVideoByUrl( songList[index+1] + "?version=3" );
  	console.log(songList[index+1] + "?version=3") ;
  	
  	if(connection){
  		client.loadVideoByUrl(songList[index+1] + "?version=3" ) ;
  	}
  	else{
  		// Else cue song
  	}
  	index+=1 ;
  }
 
}

function onPlayerReadyClient(event){
		event.target.playVideo() ;
}

function onPlayerStateChangeClient(event) {
}













function disConnect(){
	connection = !connection ;
	var connectionButton = document.getElementById("connectionButton");
	if(connection){
		connectionButton.style.background = "green" ;
		connectionButton.innerHTML = "Disconnect" ;
	}
	else{
		connectionButton.style.background = "red" ;
		connectionButton.innerHTML = "Connect" ;
	}
}

function displayFormContents(form){
	
    	var out = '';
  for (var i=0, el; el = form.elements[i]; i++) {
      if (el.name) {
          out += el.name + ' = ' + el.value + '\n';
          // console.log(el.name +el.value) ;
          songList.push(el.value) ;
      }
  }
  console.log(songList) ;
}

// <!-- Returns the state of the player. Possible values are:
// -1 – unstarted
// 0 – ended
// 1 – playing
// 2 – paused
// 3 – buffering
// 5 – video cued -->