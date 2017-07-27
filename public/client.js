var socket = io.connect("http://192.168.1.7:5000") ;

// Function to sync according to playtime and state of player in server
function syncClientsWithServer(data){

  if(isAdmin){
    return ;    // Else will skip a beat
  }

  var currentTime = data.seekTime ;
  var serverState = data.playerState ;
  
  if( !connectToServer){
    return ;
  }

  youtubePlayer.seekTo(currentTime) ;
 
  if(serverState==1){
    youtubePlayer.playVideo() ;
 }

if(serverState==2 || serverState==3){
    youtubePlayer.pauseVideo() ;
 }

}




function playNewSong(songId){
  console.log("playNewSong: " +songId) ;
  youtubePlayer.loadVideoById(songId);
}

function requestNewSongPlay(songId){
  console.log("Requesting server to load new song: " + songId);
  socket.emit('loadNewSong', {songId: songId}) ;
}

socket.on('loadNewSong', function(data){
  var songId = data.songId ;
  playNewSong(songId) ;
  console.log("Server requesting to play song: " + songId) ;
});


function addSongToQueue(songId){
  songList.push(songId) ;
}

function addSongRequest(form){
  var songId = youtube_parser(form.elements[0].value) ;
  console.log("add song request: " + form.elements[0].value);
  socket.emit('addSong',{songId: songId}) ;
}

socket.on('addSong', function(data){
  var songId = data.songId ;
  addSongToQueue(songId);
  console.log("Server requesting to add song: " + songId)
});

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var youtubePlayer ;
function onYouTubeIframeAPIReady() {
  youtubePlayer = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: 'fJ9rUzIMcZQ',
    events: {
      'onReady': onPlayerReadyServer,
      'onStateChange': onPlayerStateChangeServer
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

// function onPlayerStateChangeServer(event){

// }

function onPlayerStateChangeServer(event) {


  // Make this for client side too
  if (event.data == YT.PlayerState.ENDED){
    youtubePlayer.loadVideoById( songList[index] );
    // console.log(songList[index]) ;
    
    if(connectToServer){
      // Complete song change code
      youtubePlayer.loadVideoById(songList[index] ) ;
    }
    else{
      // Else cue song
    }

    index+=1 ;
  }
 
}


function sendStateToServer(){
  if(!isAdmin){
    return ;
  }
  // console.log("Sending adminState to server") ;
  socket.emit('adminState', {seekTime: youtubePlayer.getCurrentTime(), playerState: youtubePlayer.getPlayerState()}) ;
}


function disConnect(){
  connectToServer = !connectToServer ;
  var connectionButton = document.getElementById("connectionButton");
  if(connectToServer){
    connectionButton.style.background = "green" ;
    connectionButton.innerHTML = "Disconnect" ;
  }
  else{
    connectionButton.style.background = "red" ;
    connectionButton.innerHTML = "Connect" ;
  }
}

function addSongToQueue(songId){
  songList.push(songId) ;
}

function addSongRequest(form){
  var songId = youtube_parser(form.elements[0].value) ;
  console.log("add song request: " + form.elements[0].value);
  socket.emit('addSong',{songId: songId}) ;
}

socket.on('addSong', function(data){
  var songId = data.songId ;
  addSongToQueue(songId);
  console.log("Server requesting to add song: " + songId)
});

function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

function playNextSong(){

    requestNewSongPlay(songList[index+1]) ;
    // youtubePlayer.loadVideoById( songList[index+1]  );
    console.log("playNextSong: " + index + songList[index+1] ) ;
    index+=1 ;   
}

function playPreviousSong(){
    requestNewSongPlay(songList[index-1]) ;
    // youtubePlayer.loadVideoById( songList[index-1]  );
    console.log(songList[index+1]) ;
    index-=1 ;  
    if(index==-1){
      index = 0;
    }
}

function printSongList(){
  console.log(songList) ;
}

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


var songList = ["HgzGwKwLmgM", "Bznxx12Ptl0"] ;
var index = -1 ;
var connectToServer = true ;
var isAdmin = false ;


// Connecting to server and stuff

socket.on('admin', function(){
  isAdmin = true ;
  // console.log("I am the admin: " + isAdmin) ;
}) ;

socket.on('sync', function (data){
  // console.log("I have receieved data") ;
  // console.log(data) ;
  syncClientsWithServer(data) ;
}) ;




setInterval( sendStateToServer, 5000);


// <!-- Returns the state of the player. Possible values are:
// -1 – unstarted
// 0 – ended
// 1 – playing
// 2 – paused
// 3 – buffering
// 5 – video cued -->