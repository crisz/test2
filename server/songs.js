var express = require('express');
var router = express.Router();
var multer = require('multer');
var mysql = require('mysql');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype === 'audio/mp3' || file.mimetype === 'audio/mpeg') {
      console.log('loading songs...'+file.originalname)
      cb(null, 'songs');
    } else if (file.mimetype === 'image/jpeg') {
      
      console.log('loading jpg...'+file.originalname)
      file.filename = file.filename;
      cb(null, 'img');
    } else {
      console.log('error', file.mimetype + 'is not audio/mp3 or image/jpeg');
      cb({error: 'Mime type not supported'});
    }
  }
});


var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  multipleStatements: true
});

connection.query('CREATE DATABASE IF NOT EXISTS spotifai', function (err) {
  if (err) throw err;
  connection.query('USE spotifai', function (err) {
      if (err) throw err;
      connection.query(`CREATE TABLE IF NOT EXISTS \`song\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`title\` varchar(100) NOT NULL,
        \`author\` varchar(100) NOT NULL,
        \`album\` varchar(100) NOT NULL,
        \`mp3_path\` varchar(100) NOT NULL,
        \`img_path\` varchar(100) NOT NULL,
        \`owner\` varchar(100) NOT NULL,
        PRIMARY KEY (\`id\`)
      )`, function (err) {
              if (err) throw err;
          });

      connection.query(`CREATE TABLE IF NOT EXISTS \`playlist\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`user_id\` int NOT NULL,
        \`name\` varchar(100) NOT NULL,
        PRIMARY KEY (\`id\`),
        FOREIGN KEY (user_id) REFERENCES user(id)
      )`, function (err) {
              if (err) throw err;
          });

      connection.query(`CREATE TABLE IF NOT EXISTS \`playlist_has_song\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`playlist_id\` int NOT NULL,
        \`song_id\` int NOT NULL,
        \`user_id\` int NOT NULL,
        PRIMARY KEY (\`id\`),
        FOREIGN KEY (playlist_id) REFERENCES playlist(id),
        FOREIGN KEY (user_id) REFERENCES user(id)
      )`, function (err) {
              if (err) throw err;
          });
  });
});
var upload = multer({storage});

router.get('/songs/:username', function(req, res) {
  console.log('Il mio username è '+req.username);
  connection.query('SELECT * FROM song WHERE ?;', {owner: req.params.username}, function(err, data) {
    if (err) throw err;
    res.json(data);
    res.end();
  });
});

router.get('/songs', function(req, res) {
  connection.query('SELECT * FROM song WHERE owner="public";', function(err, data) {
    if (err) throw err;
    res.json(data);
    res.end();
  });
});

/*
  Questo metodo riceve come parametro, all'interno dell'URL, l'id della canzone.
  Ad esempio, un messaggio di tipo POST con questo url:
  /playlist/129452
  creerà una playlist che avrà 
  - come nome il nome passato nel body come valore della chiave "name"
  - come canzone, la canzone passata come parametro nell'url (nell'esempio, 129452)
  - come proprietario, l'username passato nel body come valore della chiave "username"

  Invia al client informazioni sulla playlist appena creata
*/
router.post('/playlist/:song', function(req, res) {
  var song_id = req.params.song;
  var username = req.body.username;
  var playlist_name = req.body.name;
  console.log(playlist_name);
  connection.query('SELECT id FROM user WHERE ?', {username}, function(err, data) {
    if (err) throw err;
    console.log('data', data);
    var user_id = data[0].id;

    connection.query('INSERT INTO playlist SET ?;', {user_id, name: playlist_name}, function(err, data, bb) {
      if (err) throw err;
      console.log('##',bb,'##');
      console.log('new_pl', data);
      connection.query('INSERT INTO playlist_has_song SET ?;', {user_id, playlist_id: data.insertId, song_id}, function(err, data) {
        if (err) throw err;
        res.json(data);
        res.end();
      });
    });
  })
});

/*
  Questo metodo invierà al client tutte le playlist per un dato utente, passato come parametro dell'url
*/

router.get('/playlists/:username', function(req, res) {
  connection.query(`SELECT *, song.id as song_id FROM user, playlist, song, playlist_has_song
                    WHERE 
                        user.id = playlist.user_id 
                          AND 
                        user.username="${req.params.username}"
                          AND
                        playlist.id = playlist_has_song.playlist_id
                          AND
                        user.id = playlist_has_song.user_id
                          AND
                        song.id = playlist_has_song.song_id;`, function(err, data) {
    if (err) throw err;
    /*
      Raggruppiamo l'oggetto in base al nome della playlist, l'oggetto risultante sarà della forma
      {
        "nome_playlist_1": [
          {
            "title": "Titolo canzone 1",
            "author": "Autore canzone 1",
            ...
          },
          {
            "title": "Titolo canzone 2",
            "author": "Autore canzone 2",
            ...
          }
        ],
        "nome_playlist_2": [
          ...
        ]
      }
    */
    data = data.reduce(function (r, a) {
                r[a.name] = r[a.name] || [];
                r[a.name].push(a);
                return r;
              }, Object.create(null));
    res.json(data);
    res.end();
  });
});

/*
  Rimuove una canzone definitivamente
*/
router.post('/song/delete/:id', function(req, res) {
  var song_id = req.params.id;
  connection.query('DELETE FROM queue WHERE ?; DELETE FROM playlist_has_song WHERE ?; DELETE FROM song WHERE ?;', 
                    [{song_id},{song_id},{id: song_id}], function(err, data) {
    if (err) {
      throw err;
      res.statusCode = 500;

      res.json({
        error: 'Cannot delete song from playlist'
      });
      res.end();
    }
    else {
      res.json({
        message: 'song deleted'
      });
      res.end();
    }
  });
});


/*
  Rimuove una canzone dalla playlist
*/
router.post('/playlist/delete/:playlist_id/:id/', function(req, res) {
  var song_id = req.params.id;
  var playlist_id = req.params.playlist_id;
  console.log('deleting', {song_id, playlist_id});
  
  connection.query('DELETE FROM playlist_has_song WHERE ? AND ?;', [{song_id},{playlist_id}], function(err, data) {
    console.log(data);
    
    if (err) {
      throw err;
      res.statusCode = 500;

      res.json({
        error: 'Cannot delete song from playlist'
      });
      res.end();
    }
    else {
      res.json({
        message: 'song deleted'
      });
      res.end();
    }
  });
});

/*
  Aggiunge una canzone ad una playlist esistente
*/ 

router.post('/playlist/:playlist/:song', function(req, res) {
  var playlist_name = req.params.playlist;
  var song_id = req.params.song;
  var username = req.body.username;
  connection.query('SELECT id FROM user WHERE ?', {username}, function(err, data) {
    if (err) throw err;
    var user_id = data[0].id;
    console.log(user_id);
    connection.query('SELECT id FROM playlist WHERE ?', {name: playlist_name}, function(err, data) {
      if (err) throw err;
      var playlist_id = data[0].id;
      console.log("pid", playlist_id);
      connection.query('INSERT INTO playlist_has_song SET ?;', {user_id, song_id, playlist_id}, function (err, data) {
        res.json(data);
        res.end();
      });
    });
  });
});








router.post('/song', upload.any(), function(req, res) {
  var song = {
    title: req.body.title,
    author: req.body.author,
    album: req.body.album,
    img_path: req.files[0].filename,
    mp3_path: req.files[1].filename,
    owner: req.body.username 
  };
  console.log(req.body, song);
  connection.query('INSERT INTO `song` set ?;', song, function (err, data) {
    if(!err) {
      res.redirect('/');
    } else {
      throw err;
    }
    res.end();
  });
});

module.exports = router;