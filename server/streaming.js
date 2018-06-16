var path = require('path');
var fs = require('fs');
var express = require('express');
var router = express.Router();
var songsPath = path.join('songs');

router.get('/:song_name', function(req, res) {
  var songFile = path.join(songsPath, req.params.song_name);
  fs.createReadStream(songFile).pipe(res);
});

module.exports = router;