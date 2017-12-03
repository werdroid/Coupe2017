const PR = 0;
const GR = 1;

var robot = {
  mmX: 1500,
  mmY: 1000,
  aDeg: 90,
  aRad: (Math.PI/2)
}

var elem = {
  log: {
    monitor: document.getElementById('logMonitor'),
    robot: [document.getElementById('logRobot0'), document.getElementById('logRobot1')]
  },
  seuilsForces: {
    $val: $('#valSeuilsForces'),
    $handleMin: $('#handleMin'),
    $handleMax: $('#handleMax')
  }
}

var log = {
  monitor: function(msg) {
    elem.log.monitor.innerHTML = msg + '<br>' + elem.log.monitor.innerHTML;
  },
  robot: function(r, msg) {
    var t = '';
    if(match.enCours[r]) {
      t = '<span class="infoTimer">' + Math.trunc(((new Date().getTime()) - match.debut[r])/1000) + '</span>';
    }
    elem.log.robot[r].innerHTML = t + msg + '<br>' + elem.log.robot[r].innerHTML;
  }
}

vision.init();

window.addEventListener('resize', vision.conteneur.majPosition);

var points = [];
var rssiMin = 999;
var rssiMax = 100;
traiterMessage = function(r, msgStr) {
  if(msgStr[0] == '#') {
    var msg = msgStr.split(',');
    var trame = {};
    var obj = [];
    // i = 0 <=> '#'
    for(var i = 1; i < msg.length; i++) {
      obj = msg[i].split(':');
      trame[obj[0]] = obj[1];
    }
    var id = trame['index'];
    points[id] = trame;
    //pair = !pair;
    vision.modifier.pointVu(id, points[id]['dist'], parseInt(points[id]['rssi']));
    // rssi entre 0 et 255
    // dist entre 0 et 9777 (= 10000 ?)
    /*points[id]['rssi'] = parseInt(points[id]['rssi']);
    if(points[id]['rssi'] < rssiMin)
      rssiMin = points[id]['rssi'];
    if(points[id]['rssi'] > rssiMax)
      rssiMax = points[id]['rssi'];*/
    //console.log(rssiMin + ' - ' + rssiMax);
  }
  else if(msgStr[0] == '@') {
    var action = msgStr.split('|');
    var param = JSON.parse('{' + action[2] + '}');
    switch(action[1]) {
      case 'Codeurs':
        break;
      case 'Position':
        robot.mmX = param.mmX;
        robot.mmY = param.mmY;
        robot.aDeg = param.angleDeg;
        robot.aRad = param.angleRad;
        vision.modifier.positionRobot(robot.mmX, robot.mmY);
        break;
      default:
        break;
    }
  }
  else if(msgStr[0] == '$') {
    // Rien
  }
  else {
    switch(msgStr) {
      case "DebutDuMatch\n":
      case "led change\n":
      case "RT INTERRUPTION TOO LONG\n":
      case "\n":
        break;
      default:
        log.monitor(msgStr);
    }
  }
}

// Fortement inspiré de http://stackoverflow.com/questions/11257062/converting-json-object-to-csv-format-in-javascript
var pts2csv = function() {
  var str = 'index;angleDeg;distance;force\r\n';
  
  /*for(var index in points[0]) {
    if(line != '')
      line += ',';
    line += index;
  }*/
  
  for(var i = 0; i < points.length; i++) {
    var line = '';
    /*for(var index in points[i]) {
      if(line != '')
        line += ',';
      line += points[i][index];
    }*/
    line += points[i].index + ';' + points[i].angleDeg + ';' + points[i].dist + ';' + points[i].rssi;
    str += line + '\r\n';
  }
  
  return str;
}
var robot2csv = function() {
  var str = '';
  str += 'robot.mmX;' + robot.mmX + '\r\n';
  str += 'robot.mmY;' + robot.mmY + '\r\n';
  str += 'robot.aDeg;' + robot.aDeg + '\r\n';
  str += '\r\n';
  return str;
}

/*
elem.seuilForceMax.slider.addEventListener('change', function() {
  elem.seuilForceMax.value.innerText = this.value;
  vision.param.seuilForceMax = this.value;
});*/

document.getElementById('bExporterPoints').addEventListener('click', function() {
  var date = new Date();
  var fichier = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + '_' + date.getHours() + date.getMinutes() + date.getSeconds() + '.csv';
  chrome.fileSystem.chooseEntry({
      type: 'saveFile',
      suggestedName: fichier,
      accepts: [ { description: 'Fichier csv (*.csv)',
                   extensions: ['csv']} ],
      acceptsAllTypes: true
    },
    function(fileEntry) {
      //savedFileEntry = fileEntry;

      // Use this to get a file path appropriate for displaying
      var pathFichier;
      chrome.fileSystem.getDisplayPath(fileEntry, function(path) {
        pathFichier = path;
        log.monitor('Export vers ' + path);
      });
      
      fileEntry.createWriter(function(fileWriter) {
        fileWriter.onwriteend = function(e) {
          log.monitor('Terminé');
        };

        fileWriter.onerror = function(e) {
          log.monitor('Echec : '+e.toString());
        };

        fileWriter.write(new Blob([robot2csv() + pts2csv()]));

      });
    }
  );
});


$( function() {
  var majSeuilsForces = function() {
    elem.seuilsForces.$handleMin.text( vision.param.seuilForceMin );
    elem.seuilsForces.$handleMax.text( vision.param.seuilForceMax );
  }
  
  $('#seuilsForces').slider({
    range: true,
    min: 0,
    max: 254,
    values: [vision.param.seuilForceMin, vision.param.seuilForceMax],
    create: majSeuilsForces,
    slide: function(event, ui) {
      vision.param.seuilForceMin = ui.values[0];
      vision.param.seuilForceMax = ui.values[1];
      majSeuilsForces();
      //elem.seuilsForces.$val.text('Min ' + ui.values[0] + ' ; Max ' + ui.values[1]);        
    }
  });
});
/*
var timer = function() {
  console.log(rssiMin + ' ; ' + rssiMax);
  setTimeout(timer, 1000);
}
timer();*/