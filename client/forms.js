function init() {
  if(document.getElementById('form')) {
    document.getElementById('form').onsubmit = function(event) {
      login(event);
    }
  }
  if (document.getElementById('form-su')) {
    document.getElementById('form-su').onsubmit = function(event) {   
      signup(event);   
    }
  }



  var errorsElements = [];
  
  function login(event) {
    event.preventDefault();
    /*
      validateLogin è una funzinoe creata all'interno di /shared/validate.js
      Il file si trova all'interno di "shared" poiché verrà utilizzato sia dal client che dal server
      al fine di garantire l'integrità del login e della registrazione, nel caso si tenti di bypassare
      la validazione client-side.

      La funzione in questione, ritorna un oggetto del tipo:
      {
        campoErrore1: messaggioDiErrore,
        campoErrore2: messaggioDiErrore,
        ... ecc
      }

      Nel caso non siano presenti errori di validazione, viene ritornato null.
    */
    var validateResult = validateLogin(this.username.value, this.password.value);

    /*
      errorsElements è un array dichiarato al di fuori della funzione. 
      Serve per tenere traccia degli elementi HTML che contengono i messaggi di errore
      in modo che ad ogni validazione possano essere puliti tutti e si possano generare
      nuovi messaggi di errore, senza che si accumulino o che permangano una volta risolti
    */
    errorsElements.forEach(function (el) {
      el.remove();
    });

    /*
      Una volta eliminati dal DOM tutti gli errori, viene svuotato l'array che ne conteneva le referenze.
    */
    errorsElements = [];

    /*
      Se ci sono errori, li mostriamo.
      Ricordiamo che validateResult è un oggetto contenente tutti gli errori.
      Di conseguenza, se ci sono errori, sarà valitato true.
    */
    if (validateResult) {
      for (var key in validateResult) {
        /*
          Il for scorre tutti gli errori.

          Se il div di errore è già presente, allora ritorniamo.
        */
        if (document.getElementById(key+'-error')) return;
        /*
          Altrimenti viene creato l'elemento che conterrà l'errore.
        */ 
        var errorEl = document.createElement('div');
        errorEl.classList = 'error';
        errorEl.id = key+'-error';
        /*
          L'id serve per ritrovare il div d'errore in seguito.
        */
        errorEl.innerText = validateResult[key];
        /*
          Si tiene memoria dell'errore, in modo che possa essere eliminato agevolmente una volta risolto.
        */
        errorsElements.push(errorEl);

        /*
          Come riportato in un commento precedente, in caso di errore validateLogin ritorna un
          oggetto che ha come chiave il nome del campo.
          Poiché "this" si riferisce al form, per accedere al campo di cui l'errore è oggetto
          è sufficiente accedere a this[key].

          Se ad esempio l'oggetto di errore è del tipo 
          {
            username: 'L'username è troppo corto'
          }

          Allora la seguente riga equivale ad accedere:
          
          form.username
        */
        this[key].parentElement.appendChild(errorEl);
      }
      /*
        Se ci sono errori, ritorniamo per prevenire che service.login venga invocato.
      */
      return;
    }
    /*
      Se non ci sono stati errori (e non siamo ritornati all'interno dell'if precedente), allora invochiamo login
      La definizione di service.login può essere trovata in client/service.js
    */
    service.login(this.username.value, this.password.value, function(response) {
      if(response.error) {
        alert(response.error);
      } else {
        sessionStorage.setItem('username', response.username);
        document.cookie = 'username='+response.username+';';
        window.location.href = window.location.origin;
      }
    });
  }

  /*
    La funzione signup è speculare a login.
  */
  function signup(event) {
    event.preventDefault();
    var username = this.username.value;
    var first_name = this.first_name.value;
    var last_name = this.last_name.value;
    var email = this.email.value;
    var password = this.password.value;

    var data = {username, first_name, last_name, email, password};

    var validateResult = validateSignup(first_name, last_name, username, email, password);

    errorsElements.forEach(function (el) {
      el.remove();
    });

    /*
      Una volta eliminati dal DOM tutti gli errori, viene svuotato l'array che ne conteneva le referenze.
    */
    errorsElements = [];

    /*
      Se ci sono errori, li mostriamo.
    */
    if (validateResult) {
      for (var key in validateResult) {
        if (document.getElementById(key+'-error')) return;
        /*
          Viene creato l'elemento che conterrà l'errore.
        */ 
        var errorEl = document.createElement('div');
        errorEl.classList = 'error';
        errorEl.id = key+'-error';
        errorEl.innerText = validateResult[key];
        /*
          Si tiene memoria dell'errore, in modo che possa essere eliminato agevolmente una volta risolto.
        */
        errorsElements.push(errorEl);

        /*
          Come riportato in un commento precedente, in caso di errore validateLogin ritorna un
          oggetto che ha come chiave il nome del campo.
          Poiché "this" si riferisce al form, per accedere al campo di cui l'errore è oggetto
          è sufficiente accedere a this[key].
        */
        this[key].parentElement.appendChild(errorEl);
      }
      /*
        Se ci sono errori, ritorniamo per prevenire che service.login venga invocato.
      */
      return;
    }

    service.signup(data, function(response) {
      if (response.errorField) {
        var validateResult = response.errorField;
        for (var key in validateResult) {
          if (document.getElementById(key+'-error')) return;
          var errorEl = document.createElement('div');
          errorEl.classList = 'error';
          errorEl.id = key+'-error';
          errorEl.innerText = validateResult[key];
          errorsElements.push(errorEl);
          this[key].parentElement.appendChild(errorEl);
        }
      }
      else if(response.error) {
        alert('Registrazione fallita', response.error);
      } else {
        sessionStorage.setItem('username', response.username);
        document.cookie = 'username='+response.username+';';
        window.location.href = window.location.origin;
      }
    });
  }
}