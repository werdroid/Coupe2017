var localisation = {
  elem: {
    section: document.getElementById('sLocalisation')
  },
  SEUIL: 200,
  DISTANCE_100: 500,
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
  majDistance: function(i, valeur) {
    $('.bar' + i).css('width', Math.min(this.DISTANCE_100, valeur) / this.DISTANCE_100 * 100 + '%').text(valeur);
  },

  scoresAleatoires: function() {
    for(var i = 0; i < 270; i++) {
      this.majScore(i, parseInt(Math.random() * 1000))
    }
  }


};