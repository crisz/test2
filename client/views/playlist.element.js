function PlaylistEl(playlistName, songs) {
  var playlistEl = document.createElement('div');
  playlistEl.classList = 'playlist';

  var titleEl = document.createElement('div');
  titleEl.classList = 'title';
  titleEl.innerHTML = '<h2>'+playlistName+'</h2>';

  playlistEl.appendChild(titleEl);
  songs.forEach(function (song) {
    var songEl = document.createElement('div');
    songEl.classList = 'song';
    songEl.innerHTML = '<strong>'+song.title+'</strong> - ' + song.author;
    playButtonEl = document.createElement('span');
    playButtonEl.classList = 'play-icon';
    playButtonEl.addEventListener('click', function() {
      player.addToHead(song);
    });
    var deleteButtonEl = document.createElement('span');
    deleteButtonEl.classList = 'delete-icon';
    deleteButtonEl.addEventListener('click', function() {
      service.deleteSongFromPlaylist(song.playlist_id, song.song_id, function(data) {
        if (data.error) {
          return alert(data.error);
        }
        alert(data.message);
        loadPlaylists();
      });
    });
    songEl.appendChild(playButtonEl);
    songEl.appendChild(deleteButtonEl);
    playlistEl.appendChild(songEl);
  });


  return playlistEl;
}
