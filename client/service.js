var service = (function() {
  var server;
  var method;
  
  function http(data, callback) {
    var request = new XMLHttpRequest();
    request.withCredentials = true;
    request.open(method || 'POST', server, true);
    // request.setRequestHeader('cookie', document.cookie);
    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    // request.setRequestHeader('body', JSON.stringify(data));
    request.send(JSON.stringify(data)); 
    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        // setTimeout(() => callback(JSON.parse(request.response)), 1000);
    
        var response = JSON.parse(request.response);

        if (response.error) {
          alert(response.error);
        }
        callback(response);
      }
    }
  }

  function getSongs(cb) {
    server = 'api/songs/'+sessionStorage.getItem('username');
    method = 'GET';
    var data = {};

    http(data, function(res) {
      res.forEach(el => {
        el.mp3 = 'mp3/'+el.mp3_path;
        el.img = 'img/'+el.img_path;          
      });

      console.log('yours', res);

      cb(res);
    });
  }

  function getPublicSongs(cb) {
    server = 'api/songs';
    method = 'GET';
    var data = {};

    http(data, function(res) {
      res.forEach(el => {
        el.mp3 = 'mp3/'+el.mp3_path;
        el.img = 'img/'+el.img_path;          
      });

      cb(res);
    });
  }

  function login(username, password, cb) {
    server = 'auth/login';
    method = 'POST';
    var data = {username, password};

    http(data, cb);
  }

  function signup(data, cb) {
    server = 'auth/sign-up';
    method = 'POST';

    http(data, cb);
  }

  function getYourFriends(cb) {
    server = 'api/friends/'+sessionStorage.getItem('username');
    method = 'GET';
    var data = {};

    http(data, cb);
  }

  function getPlaylists(cb) {
    server = 'api/playlists/'+sessionStorage.getItem('username');
    method = 'GET';
    var data = {};

    http(data, function (data) {
      var keys = Object.keys(data);
      keys.forEach(function (key) {
        data[key].forEach(function (el) {
          el.mp3 = 'mp3/'+el.mp3_path;
          el.img = 'img/'+el.img_path;   
        });
       });
      
      cb(data);
    });
  }

  function addFriend(friend, cb) {
    server = 'api/friend/'+friend;
    method = 'POST';
    var data = {}

    http(data, cb);
  }

  function addSongToPlaylist(song, playlist, cb) {
    server = 'api/playlist/'+playlist+'/'+song;
    method = 'POST';
    var data = {username: sessionStorage.getItem('username')};

    http(data, cb);
  }

  function addPlaylist(song, playlist, cb) {
    server = 'api/playlist/'+song;
    method = 'POST';
    var data = {username: sessionStorage.getItem('username'), name: playlist};

    http(data, cb);
  }

  function getQueue(username, cb) {
    server = 'api/queue/'+username;
    method = 'GET';
    var data = {};

    http(data, function (data) {
      if (!data.erorr) {
        data.forEach(function (el) {
          el.mp3 = 'mp3/'+el.mp3_path;
          el.img = 'img/'+el.img_path;   
       });
      }      
      cb(data);
    });
  }

  function saveQueue(data, cb) {
    server = 'api/queue';
    method = 'POST';
    
    http(data, cb);
  }

  function deleteSongFromPlaylist(playlist_id, song_id, cb) {
    console.log('deleting ',playlist_id,song_id);
    
    server = 'api/playlist/delete/'+playlist_id+'/'+song_id;
    method = 'POST';
    var data = {};

    http(data, cb);
  }

  function deleteSong(song_id, cb) {
    server = 'api/song/delete/'+song_id;
    method = 'POST';
    var data = {};

    http(data, cb);
  }

  return {deleteSong, deleteSongFromPlaylist, addFriend, getSongs, getPublicSongs, getQueue, saveQueue, getYourFriends, getPlaylists, addPlaylist, login, signup, addSongToPlaylist};
})(); 