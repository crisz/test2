function TrackEl(track) {
  
  var title = track.title;
  var author = track.author;
  var mp3 = track.mp3;
  var image = track.img;
  var album = track.album;
  var id = track.id;


  this.image = image || '../img/song-placeholder.png';
  this.mp3 = window.location.origin + '/' + mp3;
  this.author = author;
  this.title = title;
  this.album = album || 'album';
  var cardEl = document.createElement('div');
  cardEl.classList = 'card';
  
  var infoContainerEl = document.createElement('div');
  infoContainerEl.classList = 'info-container';

  var titleEl = document.createElement('div');
  titleEl.classList = 'title';
  titleEl.innerText = this.title;

  var authorEl = document.createElement('div');
  authorEl.classList = 'author';
  authorEl.innerText = this.author;
  
  var albumEl = document.createElement('div');
  albumEl.classList = 'author';
  albumEl.innerText = this.album;

  var addPlaylistEl = document.createElement('div');
  addPlaylistEl.classList = 'author';
  addPlaylistEl.innerHTML = 'Aggiungi alla playlist...';
  addPlaylistEl.style.cursor = 'pointer';
  addPlaylistEl.style.color = 'indigo';

  addPlaylistEl.addEventListener('click', function(evt) {
    service.getPlaylists(function(data) {
      var playlists = Object.keys(data);

      showAddPlaylistEl(playlists, evt.pageX - evt.offsetX, evt.pageY, id, data);
    });
  });
  var deleteEl = document.createElement('div');
  deleteEl.classList = 'author';
  deleteEl.innerHTML = 'Rimuovi canzone';
  deleteEl.style.cursor = 'pointer';
  deleteEl.style.color = 'indigo';

  deleteEl.addEventListener('click', function() {
    console.log(track);
    
    service.deleteSong(track.id, function(data) {
      if (data.error) {
        return alert(data.error);
      }
      alert (data.message);
      loadYourSongs();
    });
  });

  var imageEl = document.createElement('div');
  imageEl.classList = 'image';
  imageEl.style.backgroundImage = 'url('+this.image+')';
  
  var buttonsEl = document.createElement('div');
  buttonsEl.classList = 'buttons';
  playButton = document.createElement('div');
  playButton.classList = 'play-button';

  player.bindButton(id, playButton);

  var whatImageShow = (!!player.getNowPlaying() && 
                       player.getNowPlaying().id === track.id && 
                       !player.getAudioElement().paused
                       ? '../img/pause.png' : '../img/play-button.png');
  playButton.style.backgroundImage = "url('"+whatImageShow+"')";
  track.playButton = playButton;

  playButton.addEventListener('click', function() {
    if (player.getNowPlaying() && player.getNowPlaying().id === track.id) {
      var audioEl = player.getAudioElement();
      if (audioEl.paused) {
        audioEl.play();
        playButton.style.backgroundImage = "url('../img/pause.png')";
      } else {
        audioEl.pause();
        playButton.style.backgroundImage = "url('../img/play-button.png')";
        
      }
    }
    else {
      console.log(3);
      
      player.addToHead(track); 
    }
  });



  var toQueueButton = document.createElement('span');
  toQueueButton.innerText = 'Aggiungi alla coda';
  toQueueButton.classList = 'to-queue';
  toQueueButton.addEventListener('click', function() {
    player.addToQueue(track);
  });

  buttonsEl.appendChild(toQueueButton);
  buttonsEl.appendChild(playButton);

  cardEl.appendChild(imageEl);
  infoContainerEl.appendChild(titleEl);
  infoContainerEl.appendChild(authorEl);
  infoContainerEl.appendChild(albumEl);
  infoContainerEl.appendChild(addPlaylistEl);

  if (getCookie('username') === track.owner)
    infoContainerEl.appendChild(deleteEl);
  infoContainerEl.appendChild(buttonsEl);
  cardEl.appendChild(infoContainerEl);
  this.element = cardEl;
}

TrackEl.prototype.match = function (value) {
  return (
    this.title.toLowerCase().indexOf(value.toLowerCase()) === -1 &&
    this.album.toLowerCase().indexOf(value.toLowerCase()) === -1 &&
    this.author.toLowerCase().indexOf(value.toLowerCase()) === -1
  )
}

TrackEl.prototype.play = function () {
  this.element.querySelector('audio').play();
}


var addPlaylistDiv;

function showAddPlaylistEl(playlists, x, y, songId, obj) {
  var div = document.createElement('div');
  div.style.left = x + 'px';
  div.style.top = y + 'px';
  div.classList = 'floatingPlaylist';
  div.innerHTML = '<strong> Seleziona una playlist </strong> <a onclick="closeDiv()" style="float: right; color: indigo"> Chiudi </a>';
  var list = document.createElement('ul');
  playlists.forEach(function(el) {
    var isAlready = false;
    console.log('xx', el, obj[el], songId);
    var filtered = obj[el].forEach(function(s) {
      if (s.song_id == songId) {
        isAlready = true;
      }
    });
    list.innerHTML += `<li class="addPlaylist ${isAlready?'checked':'no-checked'}" onclick="addSongToPlaylist('${songId}', '${el.replace(/\'/g, '\\\'')}')">${el}</li>`;
    console.log(list.innerHTML);
    
  });
  list.innerHTML += '<input type="text" name="playlist-name" id="playlist-name"><br>'
  list.innerHTML += `<li class="addPlaylist" onclick="createPlaylist(${songId})">Crea nuova playlist</li>`;
  div.appendChild(list);
  addPlaylistDiv = div;

  document.body.appendChild(div);
}

function addSongToPlaylist(songId, playlistName) {
  service.addSongToPlaylist(songId, playlistName, function(data) {
    closeDiv();
  });
}

function createPlaylist(songId) {
  var playlistName = document.getElementById('playlist-name').value;
  service.addPlaylist(songId, playlistName, function(data) {
    closeDiv();
  })
}

function closeDiv() {
  if (addPlaylistDiv) {
    addPlaylistDiv.remove();
    addPlaylistDiv = null;
  }
}