var express = require('express');
var mysql = require('mysql');
var dbConfig = require('./db.config.json');

var router = express.Router();

/*
  Viene creata la connessione al database
*/

dbConfig.multipleStatements = true;
var connection = mysql.createConnection(dbConfig);

/*
  Si creano le tabelle se non esistono
*/
connection.query('CREATE DATABASE IF NOT EXISTS spotifai', function (err) {
  if (err) throw err;
  connection.query('USE spotifai', function (err) {
      if (err) throw err;
      connection.query(`CREATE TABLE IF NOT EXISTS \`friend\` (
        \`friend1\` varchar(100) NOT NULL,
        \`friend2\` varchar(100) NOT NULL,
        PRIMARY KEY (\`friend1\`, \`friend2\`)
      )`, function (err) {
              if (err) throw err;
          });
  });
});

/*
  Questo handler matcha tutte le richieste di tipo GET che hanno un 
  percorso del tipo

  /api/friends/cristian
  /api/friends/mario
  /api/friends/foo

  è possibile accedere all'username (dopo friends/ )
  attraverso la variabile req.params.username.

  Dato un utente, questa funzione restituisce tutti gli amici di quell'utente.

  Ad esempio, richiamando /api/friends/mario, verrà restituito un array con tutti gli amici di
  Mario e tutte le canzoni che stanno ascoltando gli amici di Mario.

  Non è necessaria autenticazione, motivo per cui non vengono utilizzati cookie
*/
router.get('/friends/:username', function(req, res) {
  var username = req.params.username;
  connection.query(`SELECT * 
                    FROM friend, user, queue, song
                    WHERE
                      (friend1="${username}" OR friend2="${username}")
                      AND
                      (user.username=friend1 OR user.username=friend2)
                      AND
                      (queue.owner = user.username)
                      AND
                      (song.id = queue.song_id)
                      AND queue.owner <> "${username}"`, function(err, data) {
    if (err) {
      console.error(err);
      /*
        Se ci sono stati errori...
      */
      res.statusCode = 400;
      res.json({
        error: 'Error in database. Please contact Cristian'
      });
      res.end();
    }
    else {
      /*
        Se non ci sono stati errori, utilizziamo il metodo .reduce per compattare 
        i risultati.
        Utiliziamo l'array saved_id per tenere traccia delle canzoni inserite nella
        risposta, in modo di evitare di inviare duplicati.
      */
      res.statusCode = 200;
      console.log(data);
      
      var saved_id = [];
      data = data.reduce(function (r, a) {
        var friend = a.friend1 === username ? a.friend2 : a.friend1;
        r[friend] = r[friend] || [];
        if (a.owner !== username && !saved_id.includes(a.id)) {
          r[friend].push(a);
          saved_id.push(a.id);
        }
        return r;
      }, Object.create(null));

      /*
        La query precedente ha il problema di escludere gli amici che non hanno ascoltato ancora una canzone.
        Per risolvere il problema, effettuiamo una nuova query in cui includiamo solo tali amici, e poi uniamo i due risultati.
      */
      connection.query(`SELECT * FROM friend WHERE friend1="${username}" or friend2="${username}"`, function(err, new_data) {
        if (err) throw err;
        new_data.forEach(function(el) {
          var friend = el.friend1 === username ? el.friend2 : el.friend1;
          if (!data[friend]) data[friend] = [{last_access: 0}];
        });+
        
        res.json(data);
        res.end();
      });
    }
  });
});


/*
  Questa funzione serve per aggiungere un amico
  è necessario aver effettuato l'accesso per aggiungere qualcuno
  di conseguenza vengono utilizzati i cookie
*/
router.post('/friend/:username', function(req, res) {
  var friend1 = req.params.username;
  var friend2 = req.cookies.username;
  if (!friend2 || !friend1) return;

  /*
    Il seguente formato verrà esteso in:
    { friend1: friend1, friend2: friend2}
  */
  var friends = { friend1, friend2 };

  connection.query('SELECT * FROM user WHERE ?;', {username: friend1}, function(err, data) {
    if (err) {
      console.error(err);
      res.statusCode = 400;
      res.json({
        error: 'Impossibile aggiungere l\' utente'
      });
      return res.end();
    }
    else if (data === null || data.length === 0){
      res.statusCode = 400;
      res.json({
        error: 'L\'utente inserito non esiste'
      });
      return res.end();
    }
    else {
      connection.query('INSERT INTO `friend` set ?;', friends, function (err, data) {
        if (err) {
          console.error(err);
          res.statusCode = 400;
          res.json({
            error: 'Impossibile aggiungere l\' utente'
          });
          return res.end();
        }
        else {
          res.statusCode = 200;
          res.json({
            message: 'Friend insertion success!'
          });
          return res.end();
        }
      });
    }
  });
});


module.exports = router;