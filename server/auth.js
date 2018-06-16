var express = require('express');
var mysql = require('mysql');
var router = express.Router();

/*
  Viene importata la funzione di validazione
*/
var validate = require('../shared/validate');

/*
  Viene creata la connessione con il server
*/
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'vagrantdb',
  password: 'vagrantdb'
});


/*
  Se la tabella non esiste, viene creata
*/
connection.query('CREATE DATABASE IF NOT EXISTS spotifai', function (err) {
  if (err) throw err;
  connection.query('USE spotifai', function (err) {
      if (err) throw err;
      connection.query(`CREATE TABLE IF NOT EXISTS \`user\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`first_name\` varchar(100) NOT NULL,
        \`last_name\` varchar(100) NOT NULL,
        \`username\` varchar(100) UNIQUE NOT NULL,
        \`email\` varchar(100) UNIQUE NOT NULL,
        \`password\` varchar(100) NOT NULL,
        \`last_access\` long,
        PRIMARY KEY (\`id\`)
      )`, function (err) {
              if (err) throw err;
          });
  });
});


/*
  Questo handler matcha tutte le richieste di tipo POST che hanno 
  come percorso /auth/login
*/
router.post('/login', function(req, res) {
  var user = [{username: req.body.username}, {password: req.body.password}];
  /*
    Msyql trasformerà i punti interrogati in username=req.body.username e password=req.body.password
    Serve per evitare sql injections
  */
  connection.query('SELECT * from user WHERE ? AND ?', user, function(err, result) {
    if (err) throw err;
    /*
      Se trova un risultato, mandiamo il messaggio di successo
    */
    if(result !== null && result.length > 0) {
      res.statusCode = 200;
      res.json(result[0]);
      res.end();
    } else {
      res.statusCode = 401;
      res.json({
        error: 'Login failed'
      });
      res.end();
    }
  });

  
});

router.post('/delete', function(req, res) {
  var username = req.cookies.username;
  connection.query('delete from user where ?;', {username}, function(err, data) {
    if (err) {
      res.statusCode = 500;

      res.json({
        error: 'Cannot delete user'
      });
      res.end();
    }
    else {
      res.json({
        message: 'User deleted'
      });
      res.end();
    }
  });
});

router.post('/sign-up', function(req, res) {
  var user = req.body;
  /*
    Il metodo validate è lo stesso usato dal client
  */
  if (validate.validateSignup(user.first_name, user.last_name, user.username, user.email, user.password)) {
    res.statusCode = 400;
    /*
      Se non viene superata la validazione, si invia il messaggio di errore
    */
    res.json({
      error: 'Form is not valid'
    });
    return res.end();
  } else {
    connection.query('INSERT INTO `user` set ?;', user, function (err, data) {
      if (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
          var field = err.sqlMessage.split('\'')[3];

          res.json({
            /*
              Lo stesso accade se l'username o l'email è già in uso.
              errorField sarà il name dell'input text nel form
              di conseguenza sappiamo immediatamente in che punto mostrare l'errore
            */
            errorField: {
              [field]: field+' già in uso. Inseriscine un altro.'
            }
          });
          return res.end();
        }
        res.statusCode = 400;
        /*
          Questo non dovrebbe accadere
        */
        res.json({
          error: 'Error in database. Please contact Cristian'
        });
        return res.end();
      }
      else {
        /*
          Se non si è verificato nessun errore, inviamo questo messaggio di successo
        */
        res.statusCode = 200;
        res.json({
          message: 'Sign up success!',
          username: user.username
        });
        return res.end();
      }
    });
  }

});

module.exports = router;

module.exports.setAlive = function(username) {
  connection.query(`UPDATE user SET last_access=${Date.now()} WHERE username="${username}"`, function(err) {
    if (err) throw err;
  });
}