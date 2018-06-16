var songLoaded = true;

function init() {
  document.getElementById('img').onchange = function (evt) {
    var tgt = evt.target || window.event.srcElement,
      files = tgt.files;

    if (FileReader && files && files.length) {
      var fr = new FileReader();
      fr.onload = function () {
        document.getElementById('song-img').src = fr.result;
      }
      fr.readAsDataURL(files[0]);
    } else {
      alert('Live image not supported');
    }
  }

  document.getElementById('track').onchange = function () {
    var tgt = evt.target || window.event.srcElement,
      files = tgt.files;

    if (files) {
      songLoaded = false;
    }
  }

  document.getElementById('username-field').value = sessionStorage.getItem('username') || 'public';
}