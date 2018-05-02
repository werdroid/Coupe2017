var localisation = {
  elem: {
    section: document.getElementById('sLocalisation')
  },
  SEUIL: 200,
  init: function() {
    for(var i = 0; i < 270; i++) {
      $('<div class="score">' + i + '<br>' +
          '<span class="fond">' +
            '<span class="bar bar' + i + '">&nbsp;</div>' +
          '</span>' +
         '</div>').appendTo(this.elem.section);
    }
  },
  majScore: function(i, valeur) {
    $('.bar' + i).css('width', Math.max((this.SEUIL - valeur) * 100 / this.SEUIL, 0) + '%').text(valeur);
  },

  scoresAleatoires: function() {
    for(var i = 0; i < 270; i++) {
      this.majScore(i, parseInt(Math.random() * 1000))
    }
  }


};