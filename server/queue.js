var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'vagrantdb',
  password: 'vagrantdb',
  multipleStatements: true
});

connection.query('CREATE DATABASE IF NOT EXISTS spotifai', function (err) {
  if (err) throw err;
  connection.query('USE spotifai', function (err) {
      if (err) throw err;
      connection.query(`CREATE TABLE IF NOT EXISTS \`queue\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`song_id\` int NOT NULL,
        \`position\` int NOT NULL,
        \`owner\` varchar(100) NOT NULL,
        \`seconds\` int,
        PRIMARY KEY (\`id\`),
        FOREIGN KEY (song_id) REFERENCES song(id)
      )`, function (err) {
              if (err) throw err;
          });
  });
});

router.post('/queue/delete/:id', function(req, res) {
  var song_id = req.params.id;
  connection.query('DELETE FROM queue WHERE ?;', {song_id}, function(err, data) {
    if (err) {
      res.statusCode = 500;

      res.json({
        error: 'Cannot delete song from queue'
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

router.post('/queue', function (req, res) {
  console.log(req.body);
  var queue = req.body.queue;
  var modified_queue = queue.map(function(song_id, index) {
    return [song_id,
            index,
            req.body.owner,
            req.body.seconds || -1
          ];
  });

  connection.query('DELETE FROM queue WHERE ?;', {owner: req.body.owner}, function(err, data) {
    if (err) throw err;
    if (modified_queue.length === 0) return;
    connection.query(`INSERT INTO queue (song_id, position, owner, seconds) VALUES ?;`, [modified_queue], function(err, data) {
      if (err) throw err;
      res.json(data);
      res.end();
    });
  });
});

router.get('/queue/:username', function (req, res) {
  var username = req.params.username;
  connection.query(`SELECT *
                    FROM queue JOIN song ON queue.song_id = song.id 
                    WHERE ? ;`, {'queue.owner': username}, function(err, data) {
    if (err) throw err;
    res.json(data);
    res.end();
  });
});

module.exports = router;