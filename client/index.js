/*
Questo è l'oggetto principale della web application.

Il suo scopo è quello di gestire il container e mostrare gli elementi corretti
a seconda del click, gestendo un routing client-side.

E' l'unico file javascript che accede direttamente al DOM, in modo da mantenere
la "separation of concerns".
*/


/*
  Vengono dichiarate le variabili globali
*/
var container, publicSongs, yourSongs, playlists, yourFriends;

var queueEl, isQueueShowed;
var allMenuItems;
function init() {
  /*
    Questa funzione viene chiamata una volta costruito il DOM.

    Si controlla se l'utente ha settato un cookie username, e se questo è vero, lo aggiungiamo al sessionStorage.
    Questo è utile perché il sessionStorage è più comodo da accedere, mentre i cookie sono necessari
    perché possono essere settati in modalità sicura dal server.
  */
  if (!sessionStorage.getItem('username') && getCookie('username')) {
    sessionStorage.setItem('username', getCookie('username'));
  }

  /*
    Se l'utente non ha effettuato l'accesso (non è presente nè nel session storage nè è presente un cookie)
    allora mostriamo la sezione di benvenuto.
    Tale sezione è nascosta di default.
  */
  if (!sessionStorage.getItem('username') && !getCookie('username')) {
    document.getElementById('hero-banner').style.display = 'block';
  }

  /*
    Questo evento viene richiamato alla chiusura della finestra/scheda.
    Se l'utente ha effettuato l'accesso, allora salviamo la coda
    in modo che si possa continuare l'ascolto una volta che si apre
    nuovamente la pagina.
  */
  window.onbeforeunload = saveSession;

  // Campo di benvenuto. Visibile in alto a destra
  var welcomeField = document.getElementById('welcome');
  // Tasto login
  var loginField = document.getElementById('login');
  // Tasto registrati
  var signupField = document.getElementById('sign-up');
  // Tasto logout
  var logoutField = document.getElementById('logout');
  var username = sessionStorage.getItem('username');
  

  logoutField.addEventListener('click', function() {
    /*
      Se viene cliccato il tasto "logout", eliminiamo cookie e sessionStorage
      e ridirigiamo l'utente nella homescreen (o aggiornamo la pagina, se è già lì)
    */
    saveSession(function() {
      sessionStorage.removeItem('username');
      document.cookie = 'username=;'
      window.location.href = window.location.origin;
    });
  });

  /*
    Se l'utente ha effettuato il login, nascondiamo i tasti "login" e "registrati"
    E diamo il benvenuto con il suo nome.
  */
  if (username) {
    welcomeField.innerText = 'Benvenuto '+username+'!';
    loginField.style.display = 'none';
    signupField.style.display = 'none';
    welcomeField.style.display = 'inline';
    logout.style.display = 'inline';
  }
  else {
    welcomeField.style.display = 'none';
    logoutField.style.display = 'none';
    loginField.style.display = 'inline';
    signupField.style.display = 'inline';
  }
  /*
    Vengono inizializzate le variabili del DOM.
  */
  container = document.getElementById('tracks-container');

  /*
    Le seguenti variabili rappresentano i pulsanti del menù
  */
  publicSongs = document.getElementById('public-songs');
  yourSongs = document.getElementById('your-songs');
  playlists = document.getElementById('playlists');
  yourFriends = document.getElementById('your-friends');
  /*
    Per una questione di comodità, riportiamo tutti i pulsanti in un array
  */
  allMenuItems = [publicSongs, yourSongs, playlists, yourFriends];

  /*
    Una volta inizializzate le variabili del menù, possiamo legare gli eventi
  */
  bindMenuEvents();

 
  /*
    Si inizializza l'elemento "coda"
  */
  queueEl = document.getElementById('queue');
  /*
    Di default è nascosta
  */
  isQueueShowed = false;
  /*
    Una volta aperta la pagina, il client prova a richiedere la coda al server.
    La richiesta (come tutte le richieste al server) viene effettuata attraverso
    l'oggetto service.
  */

  if (sessionStorage.getItem('username')) {
    service.getQueue(sessionStorage.getItem('username'), function(data) {
      /*
        Se ci sono stati errori, li mostriamo
      */
      if (data.error) return alert(data.error);
  
      /*
        Altrimenti, aggiungiamo tutte le canzoni ottenute alla coda.
        La definizione dell'oggetto player può essere trovata in /client/player.js
      */
      data.forEach(function (song) {
        player.addToQueue(song, false);
      });
  
      /*
        Se è presente almeno una canzone, possiamo accedere alla prima canzone attraverso data[0].
        La prima canzone ha in più il campo "seconds" che indica a quanti secondi era arrivata
        la canzone.
        Se la canzone non era partita, il campo "secondi" sarà impostato a -1.
        Se la canzone non era partita, la coda verrà caricata ma il player
        non verrà mostrato.
      */
      if (data[0] && data[0].seconds !== -1) {
        player.getAudioElement().pause();
        player.getAudioElement().currentTime = data[0].seconds;
      }
  
      /*
        Adesso che la coda è stata caricata, possiamo mostrare l'elemento.
      */
      queueEl.style.display = 'initial';
      /*
        loadPublicSongs() va chiamato qui, in quanto ogni track controlla se l'elemento <audio>
        sta riproducendo la sua canzone, in modo da poter sincronizzare i tasti play/button.
        Di conseguenza, bisogna attendere che il server abbia restituito la coda
        per poter visualizzare a video le canzoni.
      */
      loadPublicSongs();
  
    });
  } else {
    loadPublicSongs();
  }


  var showQueue = document.getElementsByClassName('show-queue');

  /*
    Abbiamo due tasti per mostrare e nascondere la coda. Entrambi hanno
    classe show-queue. Leghiamo lo stesso evento ad entrambi.
  */
  showQueue[0].addEventListener('click', function() {
    toggleQueue();
  });

  showQueue[1].addEventListener('click', function() {
    toggleQueue();
  });

  /*
    Sottoscrizione queueEmitter, per ogni canzone aggiunta alla coda
    verrà emesso un evento.

    Viene utilizzato il design pattern dell'event emitter poiché le canzoni nella coda
    possono essere immessi da ogni parte dell'applicazione, e in questo modo centralizziamo
    la logica da eseguire in caso quest'evento avvenga.
  */
  queueEmitter.subscribe(function (queue) {
    var listContainerEl = document.getElementById('list-container');
    /*
      Viene svuotata la lista della coda.
    */
    listContainerEl.innerHTML = '';
    var listEl = document.createElement('ul');
    queue.forEach(function(song, id) {
      var listItemEl = document.createElement('li');
      // Il testo dell'elemento sarà solo il titolo della canzone
      listItemEl.innerText = song.title;
      listItemEl.style.cursor = 'pointer';

      var deleteButtonEl = document.createElement('span');
      deleteButtonEl.classList = 'delete-icon';
      listItemEl.appendChild(deleteButtonEl);

      // Al click, l'elemento verrà riprodotto
      listItemEl.addEventListener('click', function(evt) {
        if (evt.target.classList.value === 'delete-icon') {
          return player.removeFromQueue(id);
        }
        
        player.playTrack(id);
      });



      listEl.appendChild(listItemEl);
    });

    listContainerEl.appendChild(listEl);
  });
  /*
    Qui finisce la funzione init()
  */
}

/*
  Attraverso questa funzione, leghiamo ognuno dei pulsanti alla vista giusta.
*/
function bindMenuEvents() {
  publicSongs.addEventListener('click', function() {
    loadPublicSongs();
  });
  yourSongs.addEventListener('click', function() {
    loadYourSongs();
  });
  playlists.addEventListener('click', function() {
    loadPlaylists();
  });
  yourFriends.addEventListener('click', function() {
    loadYourFriends();
  });
}

/*
  Questo array verrà riempito con tutte le canzoni.
  Serve per tenere traccia delle canzoni e poterle scorrere tutte facilmente
  ad esempio, per la ricerca
*/
var trackElements = [];

function loadPublicSongs(id) {
  /*
    La funzione changeView() esegue le seguenti azioni:
    - toglie la sottolineature da tutti i pulsanti
    - aggiungi la sottolineatura al pulsante passato come parametro
    - pulisce il container
  */
  changeView(publicSongs);

  /*
    Si invia la richiesta al server per ottenere tutte le canzoni pubbliche
  */
  getPublicSongs(function (tracks) {
    /*
      Il primo elemento riguarda la ricerca delle canzoni
    */
    container.innerHTML = '<div class="search-song"><label for="search-song"><strong>Cerca canzone</strong></label><input type="search" id="search-song" placeholder="Cerca canzone..."></div>'; 
    // Si svuota il contenitore delle canzoni
    trackElements = [];
    /*
      Per ogni canzone ottenuta dal server, si crea un elemento Track e si aggiunge al container.
      La definizione di TrackEl può essere trovata in /client/views/track.element.js
    */
    tracks.forEach(function(item) {
      var element = new TrackEl(item);

      trackElements.push(element);
      container.appendChild(element.element);
    });

    /*
      Ad ogni lettera inserita nella casella di ricerca, si nascondono quelle non corrispondenti
      il metodo "match" è nel prototipo di TrackEl
    */
    document.getElementById('search-song').addEventListener('keyup', function () {
      var self = this;
      trackElements.forEach(function (trackEl) {
        if (trackEl.match(self.value)) {
          trackEl.element.style.display = 'none';
        } else {
          trackEl.element.style.display = 'inline-block';
        }
      });
    });
  });
}

/*
  Questa funzione è speculare a loadPublicSongs()
*/
function loadYourSongs() {
  changeView(yourSongs);


  if (!sessionStorage.getItem('username')) {
    container.innerHTML = '<strong> Non hai effettuato l\'accesso. Clicca su "login" e carica le tue canzoni!</strong>';
    return;
  }
  getYourSongs(function (tracks) {
    container.innerHTML = '<a href="load-your-songs.html"><strong>Carica una canzone</strong></a><br>';
    container.innerHTML += '<div class="search-song"><label for="search-song">Cerca canzone</label><input type="search" id="search-song" placeholder="Cerca canzone..."></div>'; 
    
    trackElements = [];
    tracks.forEach(function(item) {
      var element = new TrackEl(item);

      trackElements.push(element);
      container.appendChild(element.element);
    });

    document.getElementById('search-song').addEventListener('keyup', function () {
      var self = this;
      trackElements.forEach(function (trackEl) {
        if (trackEl.match(self.value)) {
          trackEl.element.style.display = 'none';
        } else {
          trackEl.element.style.display = 'inline-block';
        }
      });
    });
  });
}

function loadPlaylists() {
  /*
    Viene cambiata la sezione invocando la funzione changeView.
  */
  changeView(playlists);
  /*
    Si ottengono le playlist dal server. La richiesta è asincrona
  */
  getPlaylists(function (pl) {
    /*
      Se non ci sono playlist, otteniamo un oggetto vuoto,
      dunque mostriamo un messaggio di errore.
      Altrimenti puliamo il container in modo che possiamo appendere
      tutti gli elementi "Playlist"
    */
    if (Object.keys(pl).length === 0)
      container.innerHTML = '<span class="message">Non hai nessuna playlist.<br>Scegli una canzone e clicca su "Aggiungi alla playlsit" per crearne una.</span>';
    else
      container.innerHTML = '';

    /*
      L'oggetto ricevuto è del tipo
      {
        "nome playlist 1": {
          "canzone 1": {
            ... oggetto canzone
          },
          "canzone 2": {
            ... oggetto canzone
          }
        },
        "nome playlist 2": {
          "canzone 3": {
            ... oggetto canzone
          }
        }
      }

      Scorriamo ogni chiave e, per ognuno di essi, creiamo un oggetto di tipo PlaylistEl.
      La definizione di PlaylistEl può essere trovata in client/views/playlist.element.js
    */ 
    for (var key in pl) {
      container.appendChild(new PlaylistEl(key, pl[key]));
    }
  });
}

function loadYourFriends() {
  changeView(yourFriends);
  if (!sessionStorage.getItem('username')) {
    container.innerHTML = '<strong>Effettua l\'accesso e aggiungi i tuoi amici!</strong>';
    return;
  }
  getYourFriends(function (friends) {
    container.innerHTML = '<div class="add-friend"><label for="add-friend"><strong> Aggiungi amico </strong></label><input type="text" id="add-friend" placeholder="username">'
                          +'<button class="action" onclick="addFriend()">Aggiungi</button></div>';

    console.log('bananaaa', friends);
    for (var friend in friends) {
      console.log(friend, friends[friend]);
      
      container.appendChild(new FriendEl(friend, friends[friend]));
    }
  });
}

function changeView(newView) {
  clearSelected();
  newView.classList = 'selected';
  // container.innerHTML = '<div class="loader"></div>'
}

function clearSelected() {
  allMenuItems.forEach(function(el) {
    el.classList = '';
  })
}

function getPlaylists(cb) {
  service.getPlaylists(cb);
}

function getPublicSongs(cb) {
  service.getPublicSongs(cb);
}

function getYourSongs(cb) {
  service.getSongs(cb);
}

function getYourFriends(cb) {
  service.getYourFriends(cb);
}


/*
  Come loadPublicSongs(), ma in più effettua lo scrolling all'area interessata.
  Questo evento, così come successivi, è legato ai pulsanti nella topbar
*/
function scrollPublic() {
  loadPublicSongs();
  document.querySelector('#container').scrollIntoView({ 
    behavior: 'smooth' 
  });
}

function scrollYours() {
  loadYourSongs();
  document.querySelector('#container').scrollIntoView({ 
    behavior: 'smooth' 
  });
}

function scrollPlaylist() {
  loadPlaylists();
  document.querySelector('#container').scrollIntoView({ 
    behavior: 'smooth' 
  });
}

function scrollFriends() {
  loadYourFriends();
  document.querySelector('#container').scrollIntoView({ 
    behavior: 'smooth' 
  });
}

/*
  Funzione per aggiungere un amico.
*/
function addFriend() {
  var friend = document.getElementById('add-friend').value;
  service.addFriend(friend, function(data) {
    console.log(data);
    
    loadYourFriends();
  });
}


/*
  Questa funzione è stata rubata da StackOverflow. Serve per effettuare il parsing dei cookie
*/
function getCookie(c_name) {
  var i,x,y,ARRcookies=document.cookie.split(";");

  for (i=0; i<ARRcookies.length; i++) {
    x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
    y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
    x=x.replace(/^\s+|\s+$/g,"");
    if (x==c_name) {
      return unescape(y);
    }
  }
}


/*
  Questa funzione mostra e nasconde la coda.
  Di default, la coda è nascosta per 340px sulla destra
*/


function toggleQueue() {
  isQueueShowed = !isQueueShowed;

    if (isQueueShowed) {
      queueEl.style.marginRight = '0';
    } else {
      if (queueEl.offsetWidth!==400) {
        queueEl.style.marginRight = '-60vw';
      } else {
        queueEl.style.marginRight = (-queueEl.offsetWidth+60)+'px';
      }
    }
}

function saveSession(cb) {
  /*
    Se l'utente non ha effettuato l'accesso, ritorniamo.
  */ 
  if (!this.sessionStorage.getItem('username')) return;
  /*
    Altrimenti, salviamo la coda richiamando il metodo saveQueue.
    L'oggetto service e la definizione del metodo può essere trovato in /client/service.js
  */
  service.saveQueue({
    owner: this.sessionStorage.getItem('username'), /* nome utente */
    seconds: player.getAudioElement().currentTime, /* numero di secondi a cui è arrivata la canzone*/
    queue: player.getQueue().map(el => el.song_id || el.id) /* la coda, per risparmiare banda inviamo solo gli id delle canzoni*/
  }, cb); 
}