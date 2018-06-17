/*
  Vengono richieste le dipendenze
*/
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var path = require('path');


/*
  Vengono importati i file necessari
*/
var songs = require('./songs');
var auth = require('./auth');
var friends = require('./friends');
var queue = require('./queue');
var streaming = require('./streaming');

/*
  Si inizializza il server
*/
var app = express();

/*
  Vengono definiti i percorsi delle varie cartelle.
  clientPath contiene il percorso del client, che verrà servito dal server per ogni richiesta
  il cui percorso non cominci con /api o con /auth.

  Le richieste che iniziano con /auth servono per l'autenticazione, la registrazione e il logout
  Le richieste che iniziano con /api servono per richiedere canzoni, playlist, code, ecc
*/
var clientPath = path.join('client');
var imgPath = path.join('img');
var sharedPath = path.join('shared');

/*
  Vengono specificati due middleware.

  bodyParser serve per poter effettuare il parsing del body trasmesso in JSON.
  Ci permette di accedere al body attraverso la variabile req.body

  cookieParser serve per effettuare il parsing dei cookie.
  Ci permette di accedere ai cookie attraverso la variabile req.cookies
*/
app.use(bodyParser.json());
app.use(cookieParser());


/*
  Matcha OGNI richiesta. Il codice verrà eseguito per ogni richiesta che inizia con /
  vale a dire tutte le richieste.
*/
app.use('/', function(req, res, next) {
  /*
    Per OGNI richiesta, controlliamo se l'utente ha effettuato l'accesso.
    Se l'utente ha effettuato l'accesso, avrà sicuramente un cookie dove viene memorizzato l'username
    tale cookie verrà mandato automaticamente ad ogni richiesta.
    Noi sfruttiamo la presenza di questo cookie per aggiornare la colonna "last_access" per l'utente che
    ha effettuato la richiesta. Questo ci permette di capire se un utente è stato online di recente o meno.

    Per aggiornare la colonna "last_access" si utilizza il metodo .setAlive, definito all'interno
    del file auth.js.
  */
  if (req.cookies.username) 
    auth.setAlive(req.cookies.username);
  next();
});

/*
  Un utente che non ha effettuato il login non può caricare una canzone. Di conseguenza,
  se un utente richiede il file "./load-your-songs.html" ma non ha nessun cookie con
  chiave username, riceverà un messaggio di errore.
*/
app.use('/load-your-songs.html', function(req, res, next) {
  var username = req.cookies.username;
  if (username) 
    return next();
  res.json({error: 'permesso negato'});
  res.end();
});

/*
  Tutte le richieste che iniziano con /api verranno gestiti dai file song.js, friends.js e queue.js
*/
app.use('/api', songs, friends, queue);
app.use('/auth', auth);
app.use(express.static(sharedPath));
// app.use('/mp3', streaming);
app.use('/mp3', express.static('songs'));
app.use('/img', express.static(imgPath));
app.use(express.static(clientPath));

/*
  Se la richiesta non ha matchato nessun handler, allora serviamo index.html
*/
app.use('/', function(req, res) {
  res.sendFile(path.resolve(path.join(clientPath, 'index.html')));
});

/*
  Questo è il metodo start richiamato in ../index.js
*/
module.exports.start = function() {
  app.listen(3000, function() {
    console.log('Server started on port 3000');
  });
}

