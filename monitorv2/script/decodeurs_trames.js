var decoderTrameMonitor = function(buffer) {

  var offset = 0;
  var HEAP8 = new Int8Array(buffer);
  var HEAP16 = new Int16Array(buffer);
  var HEAP32 = new Int32Array(buffer);
  var HEAPU8 = new Uint8Array(buffer);
  var HEAPU16 = new Uint16Array(buffer);
  var HEAPU32 = new Uint32Array(buffer);
  var HEAPF32 = new Float32Array(buffer);
  function nextChar() {    return String.fromCharCode(nextUInt8()); }
  function nextUInt8() {   var value = HEAPU8[offset >> 0]; offset += 1; return value; }
  function nextUInt16() {  var value = HEAPU16[offset >> 1]; offset += 2; return value; }
  function nextUInt32() {  var value = HEAPU32[offset >> 2]; offset += 4; return value; }
  function nextInt8() {  var value = HEAP8[offset >> 0]; offset += 1; return value; }
  function nextInt16() {   var value = HEAP16[offset >> 1]; offset += 2; return value; }
  function nextInt32() {   var value = HEAP32[offset >> 2]; offset += 4; return value; }
  function nextFloat() {   var value = HEAPF32[offset >> 2]; offset += 4; return value; }

  var trameMonitor = {};
  if (nextChar() !== '' ||
      nextChar() !== '' ||
      nextChar() !== '' ||
      nextChar() !== '') {
    throw new Error('Trame monitor ne commence pas par STX STX STX DC1, trash it.');
  }

  // pour la lecture, l'ordre est important
  trameMonitor.millis = nextUInt32();
  trameMonitor.a = nextFloat();
  trameMonitor.time_total = nextUInt32();
  trameMonitor.xMm = nextInt16();
  trameMonitor.yMm = nextInt16();
  trameMonitor.proche_distance = nextUInt16();
  trameMonitor.consigneXmm = nextUInt16();
  trameMonitor.consigneYmm = nextUInt16();
  trameMonitor.sickObstacle = nextUInt8();
  trameMonitor.isPR = nextUInt8();
  trameMonitor.led_state = nextUInt8();
  
  trameMonitor.empty = nextUInt8();
  trameMonitor.empty = nextUInt8();
  trameMonitor.empty = nextUInt8();

  if (nextChar() !== '' ||
      nextChar() !== '' ||
      nextChar() !== '' ||
      nextChar() !== '') {
    throw new Error('Trame monitor ne termine pas par 4 ETX, trash it.');
  }
  
  return trameMonitor;
  
}


var decoderTrameSick = function(buffer) {

  var offset = 0;
  var HEAP8 = new Int8Array(buffer);
  var HEAP16 = new Int16Array(buffer);
  var HEAP32 = new Int32Array(buffer);
  var HEAPU8 = new Uint8Array(buffer);
  var HEAPU16 = new Uint16Array(buffer);
  var HEAPU32 = new Uint32Array(buffer);
  var HEAPF32 = new Float32Array(buffer);
  function nextChar() {    return String.fromCharCode(nextUInt8()); }
  function nextUInt8() {   var value = HEAPU8[offset >> 0]; offset += 1; return value; }
  function nextUInt16() {  var value = HEAPU16[offset >> 1]; offset += 2; return value; }
  function nextUInt32() {  var value = HEAPU32[offset >> 2]; offset += 4; return value; }
  function nextInt8() {  var value = HEAP8[offset >> 0]; offset += 1; return value; }
  function nextInt16() {   var value = HEAP16[offset >> 1]; offset += 2; return value; }
  function nextInt32() {   var value = HEAP32[offset >> 2]; offset += 4; return value; }
  function nextFloat() {   var value = HEAPF32[offset >> 2]; offset += 4; return value; }


  var trameSick = {};
  
  if (nextChar() !== '' ||
      nextChar() !== '' ||
      nextChar() !== '' ||
      nextChar() !== '') {
    throw new Error('Trame Sick ne commence pas par STX STX STX DC2, trash it.');
  }

  // pour la lecture, l'ordre est important
  trameSick.id = nextUInt16();
  trameSick.angleDeg = nextInt16();
  trameSick.dist = nextUInt16();    
  trameSick.rssi = nextUInt8();
  
  trameSick.empty = nextUInt8();
  
  
  if (nextChar() !== '' ||
      nextChar() !== '' ||
      nextChar() !== '' ||
      nextChar() !== '') {
    throw new Error('Trame monitor ne termine pas par 4 ETX, trash it.');
  }
  
  return trameSick;
}
//*/
