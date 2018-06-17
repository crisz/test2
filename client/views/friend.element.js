function FriendEl(friend, songs) {
  var friendEl = document.createElement('div');
  friendEl.classList = 'friend';

  var titleEl = document.createElement('div');
  titleEl.classList = 'title';
  titleEl.innerHTML = '<h2>'+friend+' <small>'+((Date.now() - songs[0].last_access) < 900000 ? 'Online' : 'Offline')+'</small></h2>';

  friendEl.appendChild(titleEl);
  if (songs.length === 0 || (songs.length === 1 && !songs[0].title)) {
    var message = document.createElement('span');
    message.classList = 'message';
    message.innerText = 'Il tuo amico non ha nessuna canzone nella coda!';
    friendEl.appendChild(message);
    return friendEl;
  }
  songs.length = 4;
  songs.forEach(function (song) {
    var songEl = document.createElement('div');
    songEl.classList = 'song';
    songEl.innerHTML = '<strong>'+song.title+'</strong> - ' + song.author;
    playButtonEl = document.createElement('span');
    playButtonEl.classList = 'play-icon';
    playButtonEl.addEventListener('click', function() {
      song.mp3 = 'mp3/'+song.mp3_path
      player.addToHead(song);
    });
   
    songEl.appendChild(playButtonEl);
    friendEl.appendChild(songEl);
  });


  return friendEl;
}
