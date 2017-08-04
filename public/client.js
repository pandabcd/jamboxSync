var socket = io.connect("http://192.168.2.35:5000") ;

// Function to sync according to playtime and state of player in server
function syncClientsWithServer(data){

  console.log(connectToServer) ;
  if(isAdmin || (!connectToServer)){
    console.log("server time and current time ADMIN: " + data.seekTime + " " + youtubePlayer.getCurrentTime()) ;
     return ;    // Else will skip a beat
  }
  else{
    console.log("server time and current time: " + data.seekTime + " " + youtubePlayer.getCurrentTime()) ;
  }


  var currentTime = data.seekTime ;
  var serverState = data.playerState ;
  var sendTime = data.sendTime ;
  console.log("gihihihihi");
  console.log("sendTime"+sendTime);
  
  var packetDelay = 0 
  var playerTime = youtubePlayer.getCurrentTime() ;
  


  // console.log("server time and current time: " + data.seekTime + " " + youtubePlayer.getCurrentTime());
  
  console.log("Server and player state: " + serverState + youtubePlayer.getPlayerState()) ;
  youtubePlayer.seekTo(currentTime+packetDelay) ;
   
  if(serverState==1){
    youtubePlayer.playVideo() ;
 }

if(serverState==2 || serverState==3){
    youtubePlayer.pauseVideo() ;
 }

}




function playNewSong(songId, songList){
  // console.log("playNewSong: " +songId) ;
  youtubePlayer.loadVideoById(songId);
  // console.log("Update thumbnail"+songList);
  // updateThumbnails(songIndex+1);
  updateThumbnailsByList(songList);
}

function requestNewSongPlay(songId){
  // console.log("Requesting server to load new song: " + songId);

  if(isAdmin){
    // I know this is very poor
    if(songId==songList[index+1]){
      // console.log("hi");
      socket.emit('loadNewSong', {songId: songId, songList:songList.slice(index+2,index+2+numberOfThumbnails)}) ;
    }
    else{
      socket.emit('loadNewSong', {songId: songId, songList:songList.slice(index,index+numberOfThumbnails)}) ;
    }
  }
  else{
    alert("You are not an admin") ;
  }
}

socket.on('loadNewSong', function(data){
  var songId = data.songId ;
  var songList = data.songList ;
  // console.log("Server requesting to play song: " + songId+" "+songList) ;
  playNewSong(songId, songList) ;
  
});

function updateThumbnailsByList(songList){
  for(var i=0;i<numberOfThumbnails;i++){
    // console.log(i-index+" "+songList[i]);
    var thumbnail = document.getElementById("thumbnail"+(i+1) );
    thumbnail.src=getThumbnailFromId(songList[i]);
  }
}


function addSongToQueue(songId){
  songList.push(songId) ;
}

function addSongRequest(form){
  var songId = youtube_parser(form.elements[0].value) ;

  var songInputBox = document.getElementById("formAddSong");
  songInputBox.innerHTML = " " ;

  if (songId==false){
    alert("Not a youtube link or unable to process") ;
    return ;
  }

  
  alert("Song Added") ; 
  console.log("add song request: " + form.elements[0].value);
  socket.emit('addSong',{songId: songId}) ;
}

socket.on('addSong', function(data){
  var songId = data.songId ;
  addSongToQueue(songId);
  // updateThumbnails(index+1) ;
  console.log("Server requesting to add song: " + songId) ;
});


// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var youtubePlayer ;
function onYouTubeIframeAPIReady() {
  youtubePlayer = new YT.Player('player', {
    // height: '390',
    // width: '640',
    videoId: songList[0],
    events: {
      'onReady': onPlayerReadyServer,
      'onStateChange': onPlayerStateChangeServer
    }
  });

  // askServerForSync() ;
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
  if(isAdmin){
    sendStateToServer();
  }
  if (event.data == YT.PlayerState.ENDED){
    if(isAdmin){
      requestNewSongPlay(songList[index+1]) ;
      index+=1;
  }
  }
 
}


function sendStateToServer(){
  var date = new Date();
  var time = date.getTime() ;
  // console.log("TIme and data" + time+date);
  if(!isAdmin){
    return ;
  }
  // console.log("Sending adminState to server") ;
  socket.emit('adminState', {seekTime: youtubePlayer.getCurrentTime(), playerState: youtubePlayer.getPlayerState(), sendTime: time}) ;
}


function disConnect(){
  var connectionButton = document.getElementById("connectionButton");
  connectToServer = !connectToServer ;
  if(connectToServer){
    connectionButton.style.background = "#006600" ;
    connectionButton.innerHTML = "Connected :)" ;
  }
  else{
    connectionButton.style.background = "#660000" ;
    connectionButton.innerHTML = "Disconnected :(" ;
  }
  console.log(connectToServer) ;
}

// function addSongToQueue(songId){
//   songList.push(songId) ;
// }

// function addSongRequest(form){
//   var songId = youtube_parser(form.elements[0].value) ;
//   console.log("add song request: " + form.elements[0].value);
//   socket.emit('addSong',{songId: songId}) ;
// }

// socket.on('addSong', function(data){
//   var songId = data.songId ;
//   addSongToQueue(songId);
//   console.log("Server requesting to add song: " + songId)
// });

function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

function playNextSong(){

    requestNewSongPlay(songList[index+1]) ;
    // youtubePlayer.loadVideoById( songList[index+1]  );
    console.log("playNextSong: " + songList[index+1] ) ;
    index+=1 ; 
    updateThumbnails(index+1);  
}

function playPreviousSong(){
    requestNewSongPlay(songList[index-1]) ;
    // youtubePlayer.loadVideoById( songList[index-1]  );
    console.log(songList[index+1]) ;
    index-=1 ;  
    if(index==-1){
      index = 0;
    }
    updateThumbnails(index+1);  
}

function printSongList(){
  console.log(songList) ;
}

function getThumbnailFromId(songId){
  return "https://img.youtube.com/vi/" + songId + "/0.jpg"
}

function onDomLoad(){
  updateThumbnails(1) ;
}

function updateThumbnails(index){
  // console.log("Updating thumbnails") ;
  for(var i=index;i<index+numberOfThumbnails;i++){
    // console.log(i-index+" "+songList[i]);
    var thumbnail = document.getElementById("thumbnail"+(i-index+1) );
    thumbnail.src=getThumbnailFromId(songList[i]);
  }
}

function showNotes(){
  console.log("Button clicked;");

  var noteButton = document.getElementById("notes");
  
  var para1 = document.createElement('P') ;
  var note1 = document.createTextNode("If you are connecting after the server has started, please wait for the next song to get synced with server. Till then, enjoy 'Bohemian Rhapsody' ");
  
  // var para2 = document.createElement('P') ;
  // var note2 =  document.createTextNode("Website Developed by : Subhodeep Maji ") ;

  // var para3 = document.createElement('P') ;
  // var note3 = document.createTextNode(" Designed by : Vinish Kumar") ;

  para1.className += "notes" ;
  // para2.className += "notes" ;
  // para3.className += "notes" ;
 
  para1.appendChild(note1);
  // para2.appendChild(note2);
  // para3.appendChild(note3);
  

  noteButton.appendChild(para1);
  // noteButton.appendChild(para2);
  // noteButton.appendChild(para3);

}

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


var songList = ["fJ9rUzIMcZQ", "HgzGwKwLmgM", "Bznxx12Ptl0"] ;
var index = 0 ;
var connectToServer = true ;
var isAdmin = false ;
var numberOfThumbnails = 4;
var rtt = 0;


window.addEventListener('DOMContentLoaded',function(event){
    onDomLoad() ;
});


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




setInterval( sendStateToServer, 10000);


// <!-- Returns the state of the player. Possible values are:
// -1 – unstarted
// 0 – ended
// 1 – playing
// 2 – paused
// 3 – buffering
// 5 – video cued -->