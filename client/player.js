
/*
  Questo oggetto singleton serve per gestire la riproduzione dei brani.
  I metodi pubblici riguardano l'aggiunta e la rimozione di brani, mentre la coda è
  e tutta la logica è gestita internamente e nascosta all'esterno.
*/
var player = (function () {
  /*
    Se il browser non supporta HTML5, ritorniamo immediatamente, il messaggio contenuto
    all'interno del tag <audio> verrà mostrato e la console non conterrà errori.

    In seguito, vengono inizializzate le variabili
  */
  var supportsAudio = document.createElement('audio').canPlayType;
  if (!supportsAudio) return;
  var index = 0;
  var playing = false; // All'inizio, il player è sempre in pausa
  var waiting = false; // Lo stato di waiting avviene quando si termina la coda e si è in attesa di un nuovo brano
  var queue = [];
  // Il seguente elemento conterrà il nome della canzone
  var songName = document.getElementsByClassName('song-name')[0];
  // Il seguente elemento è l'elemento audio
  var audio = document.getElementById('audio1');
  // Il tasto per eseguire la canzone precedente
  var previousSong = document.getElementById('previous');
  // Il tasto per eseguire la canzone successiva
  var nextSong = document.getElementById('next');

  audio.addEventListener('play', function() {
    /*
      In caso venga premuto il tasto play, impostiamo la variabile di stato
      "playing" a true e, se l'elemento riprodotto ha un campo "playButton"
      allora lo si cambierà per mostrare il simbolo della pausa.

      Per come è stato implementato la web application, ogni canzone presente nel sito,
      quando viene aggiunta nel DOM, controlla se la canzone riprodotta è la sua e sincronizza
      il pulsante play/pause.
      Di conseguenza, legare questa logica anche all'interno del player potrebbe sembrare
      ridondante, ma in realtà permette di sincronizzare i pulsanti senza dover ri-costruire il DOM.
     */
    playing = true;
    if (queue[index].playButton)
      queue[index].playButton.style.backgroundImage = 'url("../img/pause.png")';
    
    audio.play();
  });

  audio.addEventListener('pause', function() {
    playing = false;
    if (queue[index].playButton)
      queue[index].playButton.style.backgroundImage = 'url("../img/play-button.png")';
    audio.pause();
  });

  /*
    Questo evento viene richiamato ogni qualvolta la riproduzione di una canzone finisce.
    Si passa dunque alla canzone successiva (eccetto se quella riprodotta era l'ultima).
  */
  audio.addEventListener('ended', function() {
    if (index < queue.length - 1) {
      index++;
      loadTrack(index);
      audio.play();
    } else {
      audio.pause();
      index = 0;
      loadTrack(index);
    }
    queue[index].playButton.style.backgroundImage = 'url("../img/play-button.png")';
  });

  /*
    Se si clicca sul pulsante "canzone precedente", allora si controlla se l'indice della canzone
    attualmente riprodotta sia >0, in caso affermativo si riproduce la canzone precedente nella coda.

    La canzone viene caricata nel player, ma viene riprodotta solo se il player era in modalità riproduzione
    PRIMA di cliccare su "indietro".

    Per il pulsante "avanti" si implementa una logica simile
  */
  previousSong.addEventListener('click', function() {
    if (index > 0) {
      index--;
      loadTrack(index);
      if (playing) {
        audio.play();
      }
    } else {
      audio.pause();
      index = 0;
      loadTrack(index);
    }
  });

  nextSong.addEventListener('click', function() {
    if (index< queue.length - 1) {
      index++;
      loadTrack(index);
      if (playing) {
        audio.play();
      }
    } else {
      audio.pause();
      index = 0;
      loadTrack(index);
    }
  });

  /*
    La libreria "plyr" ci permette di modificare la grafica dell'elemento player.
  */
  plyr.setup(audio, {});

  /*
    Una volta eseguito questo IIFE, si riproduce la prima canzone della lista 
  */
  playTrack(0);


  /*
    Questa funzione è pubblica, e serve per caricare una canzone nel player senza eseguirla.

  */
  function loadTrack(id) {
    if (id >= queue.length) {
      waiting = true;
      return false;
    }

    if (!queue[id])
      return false;
    songName.innerText = queue[id].title + ' --- ' + queue[id].author;
    index = id;
    audio.src = queue[id].mp3;
    return true;
  }

  /*
    Questa funzione, oltra a caricare la canzone, la esegue anche.
  */
  function playTrack(id) {
    if (loadTrack(id)) {
      audio.play();
    }
  }

  /*
    Questa funzione serve per aggiungere una canzone alla coda.
    L'aggiunta alla coda non implica la riproduzione immediata, a meno che la coda non sia vuota.
    Se la coda è vuota ma si vuole forzare il player a NON riprodurre la canzone, allora
    si può impostare il secondo parametro a false. Di default, il parametro è impostato a true.
  */
  function addToQueue(song, playSong) {
    if (arguments.length === 1) playSong = true;

    /*
      Il player è nascosto di default, se il metodo viene invocato, lo si mostra
    */
    if (queue.length === 0) {
      document.getElementById('player').style.minHeight = '100px';
    }

    /*
      Viene aggiunta la canzone alla coda attraverso il metodo push
    */
    queue.push(song);

    /*
      Se il player è in pausa ma l'utente non ha cliccato il tasto "pausa", ad esempio perché
      la coda di riproduzione è esaurita, allora il player entra nello stato di waiting.
      
      Nello stato di waiting, se una canzone viene aggiunta, viene riprodotta immediatamente.
    */
    if (waiting) {
      waiting = false;
      if (!playSong) // Se avevamo forzato il player a non riprodurre, allora carichiamo solo la canzone
        loadTrack(queue.length - 1);
      else
        playTrack(queue.length - 1);
    }

    /*
      Emettiamo un evento per notificare tutti gli agenti interessati alle modifiche della coda
    */
    queueEmitter.emit(queue);
    
  }

  /*
    addToHead è come addToQueue, ma presenta alcune peculiarità.
    La canzone aggiunta in testa viene sempre riprodotta, e se ne era presente un'altra in esecuzione
    allora la nuova canzone sostituirà quella in corso.
  */
  function addToHead(song, playSong) {
    if (arguments.length === 1) playSong = true;

    /*
      Se l'utente clicca due volte su play, probabilmente intende mettere in pausa il player.
      Ricordiamo che una volta cliccato su "play", l'icona "play" diviene l'icona "pause".
    */
    if (song === queue[index] && playing) {
      audio.pause();
      return;
    }

    /*
      Opposto al caso precedente, se il player è in pausa e playSong=true, e l'utente clicca
      "play" riguardo una canzone già iniziata, allora NON ri-aggiungiamo la canzone
      in testa, riproducendola dall'inizio, ma bensì riprendiamo la canzone corrente.
    */
    else if ((song === queue[index] && !playing) && playSong) {
      audio.play();
      return;
    }
    if (queue.length === 0) {
      document.getElementById('player').style.minHeight = '100px';
    }

    if (playing && queue[index]) {
      var currentSong = queue[index];
      removeFromQueue(currentSong);
      addToQueue(currentSong);
    }

    /*
      Viene aggiunta la canzone in testa, attraverso il metodo unshit
    */
    queue.unshift(song);
    /*
      Una volta che la nuova canzone viene aggiunta in testa, viene riprodotta
    */
    playTrack(0);
    
    queueEmitter.emit(queue);
  }

  function removeFromQueue(i) {
    debugger;
    queue.splice(i, 1);

    if (i === index) {
      index = (2*index)%queue.length;
      if (index >= queue.length)
        loadTrack(index);
      else hidePlayer();
    }
    
    queueEmitter.emit(queue);
  }

  function hidePlayer() {
    document.getElementById('player').style.minHeight = '0px';
  }

  function removeById(id) {
    queue = queue.filter(function(song) {
      return song.id !== id;
    });
    if (id === queue[index].song_id || id === queue[index].id) {
      index = (2*index)%queue.length;
      if (index >= queue.length)
        loadTrack(index);
      else hidePlayer();
    }
    queueEmitter.emit(queue);
  }

  function getNowPlaying() {
    return queue[index];
  }

  function getAudioElement() {
    return audio;
  }
  
  function getQueue() {
    return queue;
  }

  function bindButton(id, button) {
    queue
      .filter(song => song.id === id || song.song_id === id)
      .map(function (song) {
        song.playButton = button;
      });
  }

  return {loadTrack, playTrack, addToQueue, addToHead, removeFromQueue, removeById, getNowPlaying, getAudioElement, getQueue, bindButton};
})();


var queueEmitter = (function(){
  var fns = [];

  function subscribe(fn) {
    fns.push(fn);
  }

  function emit(data) {
    fns.forEach(function(fn) {
      fn(data);
    });
  }

  return {subscribe, emit}
})();