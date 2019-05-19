
var Module;
if (!Module) Module = (typeof Module !== "undefined" ? Module : null) || {};
var moduleOverrides = {};
for (var key in Module) {
 if (Module.hasOwnProperty(key)) {
  moduleOverrides[key] = Module[key];
 }
}
var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
if (Module["ENVIRONMENT"]) {
 if (Module["ENVIRONMENT"] === "WEB") {
  ENVIRONMENT_IS_WEB = true;
 } else if (Module["ENVIRONMENT"] === "WORKER") {
  ENVIRONMENT_IS_WORKER = true;
 } else if (Module["ENVIRONMENT"] === "NODE") {
  ENVIRONMENT_IS_NODE = true;
 } else if (Module["ENVIRONMENT"] === "SHELL") {
  ENVIRONMENT_IS_SHELL = true;
 } else {
  throw new Error("The provided Module['ENVIRONMENT'] value is not valid. It must be one of: WEB|WORKER|NODE|SHELL.");
 }
} else {
 ENVIRONMENT_IS_WEB = typeof window === "object";
 ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
 ENVIRONMENT_IS_NODE = typeof process === "object" && typeof require === "function" && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
 ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
}
if (ENVIRONMENT_IS_NODE) {
 if (!Module["print"]) Module["print"] = console.log;
 if (!Module["printErr"]) Module["printErr"] = console.warn;
 var nodeFS;
 var nodePath;
 Module["read"] = function shell_read(filename, binary) {
  if (!nodeFS) nodeFS = require("fs");
  if (!nodePath) nodePath = require("path");
  filename = nodePath["normalize"](filename);
  var ret = nodeFS["readFileSync"](filename);
  return binary ? ret : ret.toString();
 };
 Module["readBinary"] = function readBinary(filename) {
  var ret = Module["read"](filename, true);
  if (!ret.buffer) {
   ret = new Uint8Array(ret);
  }
  assert(ret.buffer);
  return ret;
 };
 Module["load"] = function load(f) {
  globalEval(read(f));
 };
 if (!Module["thisProgram"]) {
  if (process["argv"].length > 1) {
   Module["thisProgram"] = process["argv"][1].replace(/\\/g, "/");
  } else {
   Module["thisProgram"] = "unknown-program";
  }
 }
 Module["arguments"] = process["argv"].slice(2);
 if (typeof module !== "undefined") {
  module["exports"] = Module;
 }
 process["on"]("uncaughtException", (function(ex) {
  if (!(ex instanceof ExitStatus)) {
   throw ex;
  }
 }));
 Module["inspect"] = (function() {
  return "[Emscripten Module object]";
 });
} else if (ENVIRONMENT_IS_SHELL) {
 if (!Module["print"]) Module["print"] = print;
 if (typeof printErr != "undefined") Module["printErr"] = printErr;
 if (typeof read != "undefined") {
  Module["read"] = read;
 } else {
  Module["read"] = function shell_read() {
   throw "no read() available";
  };
 }
 Module["readBinary"] = function readBinary(f) {
  if (typeof readbuffer === "function") {
   return new Uint8Array(readbuffer(f));
  }
  var data = read(f, "binary");
  assert(typeof data === "object");
  return data;
 };
 if (typeof scriptArgs != "undefined") {
  Module["arguments"] = scriptArgs;
 } else if (typeof arguments != "undefined") {
  Module["arguments"] = arguments;
 }
 if (typeof quit === "function") {
  Module["quit"] = (function(status, toThrow) {
   quit(status);
  });
 }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
 Module["read"] = function shell_read(url) {
  var xhr = new XMLHttpRequest;
  xhr.open("GET", url, false);
  xhr.send(null);
  return xhr.responseText;
 };
 if (ENVIRONMENT_IS_WORKER) {
  Module["readBinary"] = function readBinary(url) {
   var xhr = new XMLHttpRequest;
   xhr.open("GET", url, false);
   xhr.responseType = "arraybuffer";
   xhr.send(null);
   return new Uint8Array(xhr.response);
  };
 }
 Module["readAsync"] = function readAsync(url, onload, onerror) {
  var xhr = new XMLHttpRequest;
  xhr.open("GET", url, true);
  xhr.responseType = "arraybuffer";
  xhr.onload = function xhr_onload() {
   if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
    onload(xhr.response);
   } else {
    onerror();
   }
  };
  xhr.onerror = onerror;
  xhr.send(null);
 };
 if (typeof arguments != "undefined") {
  Module["arguments"] = arguments;
 }
 if (typeof console !== "undefined") {
  if (!Module["print"]) Module["print"] = function shell_print(x) {
   console.log(x);
  };
  if (!Module["printErr"]) Module["printErr"] = function shell_printErr(x) {
   console.warn(x);
  };
 } else {
  var TRY_USE_DUMP = false;
  if (!Module["print"]) Module["print"] = TRY_USE_DUMP && typeof dump !== "undefined" ? (function(x) {
   dump(x);
  }) : (function(x) {});
 }
 if (ENVIRONMENT_IS_WORKER) {
  Module["load"] = importScripts;
 }
 if (typeof Module["setWindowTitle"] === "undefined") {
  Module["setWindowTitle"] = (function(title) {
   document.title = title;
  });
 }
} else {
 throw "Unknown runtime environment. Where are we?";
}
function globalEval(x) {
 eval.call(null, x);
}
if (!Module["load"] && Module["read"]) {
 Module["load"] = function load(f) {
  globalEval(Module["read"](f));
 };
}
if (!Module["print"]) {
 Module["print"] = (function() {});
}
if (!Module["printErr"]) {
 Module["printErr"] = Module["print"];
}
if (!Module["arguments"]) {
 Module["arguments"] = [];
}
if (!Module["thisProgram"]) {
 Module["thisProgram"] = "./this.program";
}
if (!Module["quit"]) {
 Module["quit"] = (function(status, toThrow) {
  throw toThrow;
 });
}
Module.print = Module["print"];
Module.printErr = Module["printErr"];
Module["preRun"] = [];
Module["postRun"] = [];
for (var key in moduleOverrides) {
 if (moduleOverrides.hasOwnProperty(key)) {
  Module[key] = moduleOverrides[key];
 }
}
moduleOverrides = undefined;
var Runtime = {
 setTempRet0: (function(value) {
  tempRet0 = value;
  return value;
 }),
 getTempRet0: (function() {
  return tempRet0;
 }),
 stackSave: (function() {
  return STACKTOP;
 }),
 stackRestore: (function(stackTop) {
  STACKTOP = stackTop;
 }),
 getNativeTypeSize: (function(type) {
  switch (type) {
  case "i1":
  case "i8":
   return 1;
  case "i16":
   return 2;
  case "i32":
   return 4;
  case "i64":
   return 8;
  case "float":
   return 4;
  case "double":
   return 8;
  default:
   {
    if (type[type.length - 1] === "*") {
     return Runtime.QUANTUM_SIZE;
    } else if (type[0] === "i") {
     var bits = parseInt(type.substr(1));
     assert(bits % 8 === 0);
     return bits / 8;
    } else {
     return 0;
    }
   }
  }
 }),
 getNativeFieldSize: (function(type) {
  return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
 }),
 STACK_ALIGN: 16,
 prepVararg: (function(ptr, type) {
  if (type === "double" || type === "i64") {
   if (ptr & 7) {
    assert((ptr & 7) === 4);
    ptr += 4;
   }
  } else {
   assert((ptr & 3) === 0);
  }
  return ptr;
 }),
 getAlignSize: (function(type, size, vararg) {
  if (!vararg && (type == "i64" || type == "double")) return 8;
  if (!type) return Math.min(size, 8);
  return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
 }),
 dynCall: (function(sig, ptr, args) {
  if (args && args.length) {
   assert(args.length == sig.length - 1);
   assert("dynCall_" + sig in Module, "bad function pointer type - no table for sig '" + sig + "'");
   return Module["dynCall_" + sig].apply(null, [ ptr ].concat(args));
  } else {
   assert(sig.length == 1);
   assert("dynCall_" + sig in Module, "bad function pointer type - no table for sig '" + sig + "'");
   return Module["dynCall_" + sig].call(null, ptr);
  }
 }),
 functionPointers: [],
 addFunction: (function(func) {
  for (var i = 0; i < Runtime.functionPointers.length; i++) {
   if (!Runtime.functionPointers[i]) {
    Runtime.functionPointers[i] = func;
    return 2 * (1 + i);
   }
  }
  throw "Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.";
 }),
 removeFunction: (function(index) {
  Runtime.functionPointers[(index - 2) / 2] = null;
 }),
 warnOnce: (function(text) {
  if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
  if (!Runtime.warnOnce.shown[text]) {
   Runtime.warnOnce.shown[text] = 1;
   Module.printErr(text);
  }
 }),
 funcWrappers: {},
 getFuncWrapper: (function(func, sig) {
  if (!func) return;
  assert(sig);
  if (!Runtime.funcWrappers[sig]) {
   Runtime.funcWrappers[sig] = {};
  }
  var sigCache = Runtime.funcWrappers[sig];
  if (!sigCache[func]) {
   if (sig.length === 1) {
    sigCache[func] = function dynCall_wrapper() {
     return Runtime.dynCall(sig, func);
    };
   } else if (sig.length === 2) {
    sigCache[func] = function dynCall_wrapper(arg) {
     return Runtime.dynCall(sig, func, [ arg ]);
    };
   } else {
    sigCache[func] = function dynCall_wrapper() {
     return Runtime.dynCall(sig, func, Array.prototype.slice.call(arguments));
    };
   }
  }
  return sigCache[func];
 }),
 getCompilerSetting: (function(name) {
  throw "You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work";
 }),
 stackAlloc: (function(size) {
  var ret = STACKTOP;
  STACKTOP = STACKTOP + size | 0;
  STACKTOP = STACKTOP + 15 & -16;
  assert((STACKTOP | 0) < (STACK_MAX | 0) | 0) | 0;
  return ret;
 }),
 staticAlloc: (function(size) {
  var ret = STATICTOP;
  STATICTOP = STATICTOP + (assert(!staticSealed), size) | 0;
  STATICTOP = STATICTOP + 15 & -16;
  return ret;
 }),
 dynamicAlloc: (function(size) {
  assert(DYNAMICTOP_PTR);
  var ret = HEAP32[DYNAMICTOP_PTR >> 2];
  var end = (ret + size + 15 | 0) & -16;
  HEAP32[DYNAMICTOP_PTR >> 2] = end;
  if (end >= TOTAL_MEMORY) {
   var success = enlargeMemory();
   if (!success) {
    HEAP32[DYNAMICTOP_PTR >> 2] = ret;
    return 0;
   }
  }
  return ret;
 }),
 alignMemory: (function(size, quantum) {
  var ret = size = Math.ceil(size / (quantum ? quantum : 16)) * (quantum ? quantum : 16);
  return ret;
 }),
 makeBigInt: (function(low, high, unsigned) {
  var ret = unsigned ? +(low >>> 0) + +(high >>> 0) * +4294967296 : +(low >>> 0) + +(high | 0) * +4294967296;
  return ret;
 }),
 GLOBAL_BASE: 8,
 QUANTUM_SIZE: 4,
 __dummy__: 0
};
Module["Runtime"] = Runtime;
var ABORT = 0;
var EXITSTATUS = 0;
function assert(condition, text) {
 if (!condition) {
  abort("Assertion failed: " + text);
 }
}
function getCFunc(ident) {
 var func = Module["_" + ident];
 if (!func) {
  try {
   func = eval("_" + ident);
  } catch (e) {}
 }
 assert(func, "Cannot call unknown function " + ident + " (perhaps LLVM optimizations or closure removed it?)");
 return func;
}
var cwrap, ccall;
((function() {
 var JSfuncs = {
  "stackSave": (function() {
   Runtime.stackSave();
  }),
  "stackRestore": (function() {
   Runtime.stackRestore();
  }),
  "arrayToC": (function(arr) {
   var ret = Runtime.stackAlloc(arr.length);
   writeArrayToMemory(arr, ret);
   return ret;
  }),
  "stringToC": (function(str) {
   var ret = 0;
   if (str !== null && str !== undefined && str !== 0) {
    var len = (str.length << 2) + 1;
    ret = Runtime.stackAlloc(len);
    stringToUTF8(str, ret, len);
   }
   return ret;
  })
 };
 var toC = {
  "string": JSfuncs["stringToC"],
  "array": JSfuncs["arrayToC"]
 };
 ccall = function ccallFunc(ident, returnType, argTypes, args, opts) {
  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  assert(returnType !== "array", 'Return type should not be "array".');
  if (args) {
   for (var i = 0; i < args.length; i++) {
    var converter = toC[argTypes[i]];
    if (converter) {
     if (stack === 0) stack = Runtime.stackSave();
     cArgs[i] = converter(args[i]);
    } else {
     cArgs[i] = args[i];
    }
   }
  }
  var ret = func.apply(null, cArgs);
  if ((!opts || !opts.async) && typeof EmterpreterAsync === "object") {
   assert(!EmterpreterAsync.state, "cannot start async op with normal JS calling ccall");
  }
  if (opts && opts.async) assert(!returnType, "async ccalls cannot return values");
  if (returnType === "string") ret = Pointer_stringify(ret);
  if (stack !== 0) {
   if (opts && opts.async) {
    EmterpreterAsync.asyncFinalizers.push((function() {
     Runtime.stackRestore(stack);
    }));
    return;
   }
   Runtime.stackRestore(stack);
  }
  return ret;
 };
 var sourceRegex = /^function\s*[a-zA-Z$_0-9]*\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;
 function parseJSFunc(jsfunc) {
  var parsed = jsfunc.toString().match(sourceRegex).slice(1);
  return {
   arguments: parsed[0],
   body: parsed[1],
   returnValue: parsed[2]
  };
 }
 var JSsource = null;
 function ensureJSsource() {
  if (!JSsource) {
   JSsource = {};
   for (var fun in JSfuncs) {
    if (JSfuncs.hasOwnProperty(fun)) {
     JSsource[fun] = parseJSFunc(JSfuncs[fun]);
    }
   }
  }
 }
 cwrap = function cwrap(ident, returnType, argTypes) {
  argTypes = argTypes || [];
  var cfunc = getCFunc(ident);
  var numericArgs = argTypes.every((function(type) {
   return type === "number";
  }));
  var numericRet = returnType !== "string";
  if (numericRet && numericArgs) {
   return cfunc;
  }
  var argNames = argTypes.map((function(x, i) {
   return "$" + i;
  }));
  var funcstr = "(function(" + argNames.join(",") + ") {";
  var nargs = argTypes.length;
  if (!numericArgs) {
   ensureJSsource();
   funcstr += "var stack = " + JSsource["stackSave"].body + ";";
   for (var i = 0; i < nargs; i++) {
    var arg = argNames[i], type = argTypes[i];
    if (type === "number") continue;
    var convertCode = JSsource[type + "ToC"];
    funcstr += "var " + convertCode.arguments + " = " + arg + ";";
    funcstr += convertCode.body + ";";
    funcstr += arg + "=(" + convertCode.returnValue + ");";
   }
  }
  var cfuncname = parseJSFunc((function() {
   return cfunc;
  })).returnValue;
  funcstr += "var ret = " + cfuncname + "(" + argNames.join(",") + ");";
  if (!numericRet) {
   var strgfy = parseJSFunc((function() {
    return Pointer_stringify;
   })).returnValue;
   funcstr += "ret = " + strgfy + "(ret);";
  }
  funcstr += "if (typeof EmterpreterAsync === 'object') { assert(!EmterpreterAsync.state, 'cannot start async op with normal JS calling cwrap') }";
  if (!numericArgs) {
   ensureJSsource();
   funcstr += JSsource["stackRestore"].body.replace("()", "(stack)") + ";";
  }
  funcstr += "return ret})";
  return eval(funcstr);
 };
}))();
Module["ccall"] = ccall;
Module["cwrap"] = cwrap;
function setValue(ptr, value, type, noSafe) {
 type = type || "i8";
 if (type.charAt(type.length - 1) === "*") type = "i32";
 switch (type) {
 case "i1":
  HEAP8[ptr >> 0] = value;
  break;
 case "i8":
  HEAP8[ptr >> 0] = value;
  break;
 case "i16":
  HEAP16[ptr >> 1] = value;
  break;
 case "i32":
  HEAP32[ptr >> 2] = value;
  break;
 case "i64":
  tempI64 = [ value >>> 0, (tempDouble = value, +Math_abs(tempDouble) >= +1 ? tempDouble > +0 ? (Math_min(+Math_floor(tempDouble / +4294967296), +4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / +4294967296) >>> 0 : 0) ], HEAP32[ptr >> 2] = tempI64[0], HEAP32[ptr + 4 >> 2] = tempI64[1];
  break;
 case "float":
  HEAPF32[ptr >> 2] = value;
  break;
 case "double":
  HEAPF64[ptr >> 3] = value;
  break;
 default:
  abort("invalid type for setValue: " + type);
 }
}
Module["setValue"] = setValue;
function getValue(ptr, type, noSafe) {
 type = type || "i8";
 if (type.charAt(type.length - 1) === "*") type = "i32";
 switch (type) {
 case "i1":
  return HEAP8[ptr >> 0];
 case "i8":
  return HEAP8[ptr >> 0];
 case "i16":
  return HEAP16[ptr >> 1];
 case "i32":
  return HEAP32[ptr >> 2];
 case "i64":
  return HEAP32[ptr >> 2];
 case "float":
  return HEAPF32[ptr >> 2];
 case "double":
  return HEAPF64[ptr >> 3];
 default:
  abort("invalid type for setValue: " + type);
 }
 return null;
}
Module["getValue"] = getValue;
var ALLOC_NORMAL = 0;
var ALLOC_STACK = 1;
var ALLOC_STATIC = 2;
var ALLOC_DYNAMIC = 3;
var ALLOC_NONE = 4;
Module["ALLOC_NORMAL"] = ALLOC_NORMAL;
Module["ALLOC_STACK"] = ALLOC_STACK;
Module["ALLOC_STATIC"] = ALLOC_STATIC;
Module["ALLOC_DYNAMIC"] = ALLOC_DYNAMIC;
Module["ALLOC_NONE"] = ALLOC_NONE;
function allocate(slab, types, allocator, ptr) {
 var zeroinit, size;
 if (typeof slab === "number") {
  zeroinit = true;
  size = slab;
 } else {
  zeroinit = false;
  size = slab.length;
 }
 var singleType = typeof types === "string" ? types : null;
 var ret;
 if (allocator == ALLOC_NONE) {
  ret = ptr;
 } else {
  ret = [ typeof _malloc === "function" ? _malloc : Runtime.staticAlloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc ][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
 }
 if (zeroinit) {
  var ptr = ret, stop;
  assert((ret & 3) == 0);
  stop = ret + (size & ~3);
  for (; ptr < stop; ptr += 4) {
   HEAP32[ptr >> 2] = 0;
  }
  stop = ret + size;
  while (ptr < stop) {
   HEAP8[ptr++ >> 0] = 0;
  }
  return ret;
 }
 if (singleType === "i8") {
  if (slab.subarray || slab.slice) {
   HEAPU8.set(slab, ret);
  } else {
   HEAPU8.set(new Uint8Array(slab), ret);
  }
  return ret;
 }
 var i = 0, type, typeSize, previousType;
 while (i < size) {
  var curr = slab[i];
  if (typeof curr === "function") {
   curr = Runtime.getFunctionIndex(curr);
  }
  type = singleType || types[i];
  if (type === 0) {
   i++;
   continue;
  }
  assert(type, "Must know what type to store in allocate!");
  if (type == "i64") type = "i32";
  setValue(ret + i, curr, type);
  if (previousType !== type) {
   typeSize = Runtime.getNativeTypeSize(type);
   previousType = type;
  }
  i += typeSize;
 }
 return ret;
}
Module["allocate"] = allocate;
function getMemory(size) {
 if (!staticSealed) return Runtime.staticAlloc(size);
 if (!runtimeInitialized) return Runtime.dynamicAlloc(size);
 return _malloc(size);
}
Module["getMemory"] = getMemory;
function Pointer_stringify(ptr, length) {
 if (length === 0 || !ptr) return "";
 var hasUtf = 0;
 var t;
 var i = 0;
 while (1) {
  assert(ptr + i < TOTAL_MEMORY);
  t = HEAPU8[ptr + i >> 0];
  hasUtf |= t;
  if (t == 0 && !length) break;
  i++;
  if (length && i == length) break;
 }
 if (!length) length = i;
 var ret = "";
 if (hasUtf < 128) {
  var MAX_CHUNK = 1024;
  var curr;
  while (length > 0) {
   curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
   ret = ret ? ret + curr : curr;
   ptr += MAX_CHUNK;
   length -= MAX_CHUNK;
  }
  return ret;
 }
 return Module["UTF8ToString"](ptr);
}
Module["Pointer_stringify"] = Pointer_stringify;
function AsciiToString(ptr) {
 var str = "";
 while (1) {
  var ch = HEAP8[ptr++ >> 0];
  if (!ch) return str;
  str += String.fromCharCode(ch);
 }
}
Module["AsciiToString"] = AsciiToString;
function stringToAscii(str, outPtr) {
 return writeAsciiToMemory(str, outPtr, false);
}
Module["stringToAscii"] = stringToAscii;
var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;
function UTF8ArrayToString(u8Array, idx) {
 var endPtr = idx;
 while (u8Array[endPtr]) ++endPtr;
 if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
  return UTF8Decoder.decode(u8Array.subarray(idx, endPtr));
 } else {
  var u0, u1, u2, u3, u4, u5;
  var str = "";
  while (1) {
   u0 = u8Array[idx++];
   if (!u0) return str;
   if (!(u0 & 128)) {
    str += String.fromCharCode(u0);
    continue;
   }
   u1 = u8Array[idx++] & 63;
   if ((u0 & 224) == 192) {
    str += String.fromCharCode((u0 & 31) << 6 | u1);
    continue;
   }
   u2 = u8Array[idx++] & 63;
   if ((u0 & 240) == 224) {
    u0 = (u0 & 15) << 12 | u1 << 6 | u2;
   } else {
    u3 = u8Array[idx++] & 63;
    if ((u0 & 248) == 240) {
     u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u3;
    } else {
     u4 = u8Array[idx++] & 63;
     if ((u0 & 252) == 248) {
      u0 = (u0 & 3) << 24 | u1 << 18 | u2 << 12 | u3 << 6 | u4;
     } else {
      u5 = u8Array[idx++] & 63;
      u0 = (u0 & 1) << 30 | u1 << 24 | u2 << 18 | u3 << 12 | u4 << 6 | u5;
     }
    }
   }
   if (u0 < 65536) {
    str += String.fromCharCode(u0);
   } else {
    var ch = u0 - 65536;
    str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
   }
  }
 }
}
Module["UTF8ArrayToString"] = UTF8ArrayToString;
function UTF8ToString(ptr) {
 return UTF8ArrayToString(HEAPU8, ptr);
}
Module["UTF8ToString"] = UTF8ToString;
function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
 if (!(maxBytesToWrite > 0)) return 0;
 var startIdx = outIdx;
 var endIdx = outIdx + maxBytesToWrite - 1;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
  if (u <= 127) {
   if (outIdx >= endIdx) break;
   outU8Array[outIdx++] = u;
  } else if (u <= 2047) {
   if (outIdx + 1 >= endIdx) break;
   outU8Array[outIdx++] = 192 | u >> 6;
   outU8Array[outIdx++] = 128 | u & 63;
  } else if (u <= 65535) {
   if (outIdx + 2 >= endIdx) break;
   outU8Array[outIdx++] = 224 | u >> 12;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  } else if (u <= 2097151) {
   if (outIdx + 3 >= endIdx) break;
   outU8Array[outIdx++] = 240 | u >> 18;
   outU8Array[outIdx++] = 128 | u >> 12 & 63;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  } else if (u <= 67108863) {
   if (outIdx + 4 >= endIdx) break;
   outU8Array[outIdx++] = 248 | u >> 24;
   outU8Array[outIdx++] = 128 | u >> 18 & 63;
   outU8Array[outIdx++] = 128 | u >> 12 & 63;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  } else {
   if (outIdx + 5 >= endIdx) break;
   outU8Array[outIdx++] = 252 | u >> 30;
   outU8Array[outIdx++] = 128 | u >> 24 & 63;
   outU8Array[outIdx++] = 128 | u >> 18 & 63;
   outU8Array[outIdx++] = 128 | u >> 12 & 63;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  }
 }
 outU8Array[outIdx] = 0;
 return outIdx - startIdx;
}
Module["stringToUTF8Array"] = stringToUTF8Array;
function stringToUTF8(str, outPtr, maxBytesToWrite) {
 assert(typeof maxBytesToWrite == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
 return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}
Module["stringToUTF8"] = stringToUTF8;
function lengthBytesUTF8(str) {
 var len = 0;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
  if (u <= 127) {
   ++len;
  } else if (u <= 2047) {
   len += 2;
  } else if (u <= 65535) {
   len += 3;
  } else if (u <= 2097151) {
   len += 4;
  } else if (u <= 67108863) {
   len += 5;
  } else {
   len += 6;
  }
 }
 return len;
}
Module["lengthBytesUTF8"] = lengthBytesUTF8;
var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined;
function demangle(func) {
 var __cxa_demangle_func = Module["___cxa_demangle"] || Module["__cxa_demangle"];
 if (__cxa_demangle_func) {
  try {
   var s = func.substr(1);
   var len = lengthBytesUTF8(s) + 1;
   var buf = _malloc(len);
   stringToUTF8(s, buf, len);
   var status = _malloc(4);
   var ret = __cxa_demangle_func(buf, 0, 0, status);
   if (getValue(status, "i32") === 0 && ret) {
    return Pointer_stringify(ret);
   }
  } catch (e) {} finally {
   if (buf) _free(buf);
   if (status) _free(status);
   if (ret) _free(ret);
  }
  return func;
 }
 Runtime.warnOnce("warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling");
 return func;
}
function demangleAll(text) {
 var regex = /__Z[\w\d_]+/g;
 return text.replace(regex, (function(x) {
  var y = demangle(x);
  return x === y ? x : x + " [" + y + "]";
 }));
}
function jsStackTrace() {
 var err = new Error;
 if (!err.stack) {
  try {
   throw new Error(0);
  } catch (e) {
   err = e;
  }
  if (!err.stack) {
   return "(no stack trace available)";
  }
 }
 return err.stack.toString();
}
function stackTrace() {
 var js = jsStackTrace();
 if (Module["extraStackTrace"]) js += "\n" + Module["extraStackTrace"]();
 return demangleAll(js);
}
Module["stackTrace"] = stackTrace;
var HEAP, buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
function updateGlobalBufferViews() {
 Module["HEAP8"] = HEAP8 = new Int8Array(buffer);
 Module["HEAP16"] = HEAP16 = new Int16Array(buffer);
 Module["HEAP32"] = HEAP32 = new Int32Array(buffer);
 Module["HEAPU8"] = HEAPU8 = new Uint8Array(buffer);
 Module["HEAPU16"] = HEAPU16 = new Uint16Array(buffer);
 Module["HEAPU32"] = HEAPU32 = new Uint32Array(buffer);
 Module["HEAPF32"] = HEAPF32 = new Float32Array(buffer);
 Module["HEAPF64"] = HEAPF64 = new Float64Array(buffer);
}
var STATIC_BASE, STATICTOP, staticSealed;
var STACK_BASE, STACKTOP, STACK_MAX;
var DYNAMIC_BASE, DYNAMICTOP_PTR;
STATIC_BASE = STATICTOP = STACK_BASE = STACKTOP = STACK_MAX = DYNAMIC_BASE = DYNAMICTOP_PTR = 0;
staticSealed = false;
function writeStackCookie() {
 assert((STACK_MAX & 3) == 0);
 HEAPU32[(STACK_MAX >> 2) - 1] = 34821223;
 HEAPU32[(STACK_MAX >> 2) - 2] = 2310721022;
}
function checkStackCookie() {
 if (HEAPU32[(STACK_MAX >> 2) - 1] != 34821223 || HEAPU32[(STACK_MAX >> 2) - 2] != 2310721022) {
  abort("Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x02135467, but received 0x" + HEAPU32[(STACK_MAX >> 2) - 2].toString(16) + " " + HEAPU32[(STACK_MAX >> 2) - 1].toString(16));
 }
 if (HEAP32[0] !== 1668509029) throw "Runtime error: The application has corrupted its heap memory area (address zero)!";
}
function abortStackOverflow(allocSize) {
 abort("Stack overflow! Attempted to allocate " + allocSize + " bytes on the stack, but stack has only " + (STACK_MAX - Module["asm"].stackSave() + allocSize) + " bytes available!");
}
function abortOnCannotGrowMemory() {
 abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " + TOTAL_MEMORY + ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or (4) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ");
}
function enlargeMemory() {
 abortOnCannotGrowMemory();
}
var TOTAL_STACK = Module["TOTAL_STACK"] || 5242880;
var TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 16777216;
if (TOTAL_MEMORY < TOTAL_STACK) Module.printErr("TOTAL_MEMORY should be larger than TOTAL_STACK, was " + TOTAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")");
assert(typeof Int32Array !== "undefined" && typeof Float64Array !== "undefined" && Int32Array.prototype.subarray !== undefined && Int32Array.prototype.set !== undefined, "JS engine does not provide full typed array support");
if (Module["buffer"]) {
 buffer = Module["buffer"];
 assert(buffer.byteLength === TOTAL_MEMORY, "provided buffer should be " + TOTAL_MEMORY + " bytes, but it is " + buffer.byteLength);
} else {
 {
  buffer = new ArrayBuffer(TOTAL_MEMORY);
 }
 assert(buffer.byteLength === TOTAL_MEMORY);
}
updateGlobalBufferViews();
function getTotalMemory() {
 return TOTAL_MEMORY;
}
HEAP32[0] = 1668509029;
HEAP16[1] = 25459;
if (HEAPU8[2] !== 115 || HEAPU8[3] !== 99) throw "Runtime error: expected the system to be little-endian!";
Module["HEAP"] = HEAP;
Module["buffer"] = buffer;
Module["HEAP8"] = HEAP8;
Module["HEAP16"] = HEAP16;
Module["HEAP32"] = HEAP32;
Module["HEAPU8"] = HEAPU8;
Module["HEAPU16"] = HEAPU16;
Module["HEAPU32"] = HEAPU32;
Module["HEAPF32"] = HEAPF32;
Module["HEAPF64"] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
 while (callbacks.length > 0) {
  var callback = callbacks.shift();
  if (typeof callback == "function") {
   callback();
   continue;
  }
  var func = callback.func;
  if (typeof func === "number") {
   if (callback.arg === undefined) {
    Module["dynCall_v"](func);
   } else {
    Module["dynCall_vi"](func, callback.arg);
   }
  } else {
   func(callback.arg === undefined ? null : callback.arg);
  }
 }
}
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATEXIT__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
var runtimeExited = false;
function preRun() {
 if (Module["preRun"]) {
  if (typeof Module["preRun"] == "function") Module["preRun"] = [ Module["preRun"] ];
  while (Module["preRun"].length) {
   addOnPreRun(Module["preRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
 checkStackCookie();
 if (runtimeInitialized) return;
 runtimeInitialized = true;
 callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
 checkStackCookie();
 callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
 checkStackCookie();
 callRuntimeCallbacks(__ATEXIT__);
 runtimeExited = true;
}
function postRun() {
 checkStackCookie();
 if (Module["postRun"]) {
  if (typeof Module["postRun"] == "function") Module["postRun"] = [ Module["postRun"] ];
  while (Module["postRun"].length) {
   addOnPostRun(Module["postRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
 __ATPRERUN__.unshift(cb);
}
Module["addOnPreRun"] = addOnPreRun;
function addOnInit(cb) {
 __ATINIT__.unshift(cb);
}
Module["addOnInit"] = addOnInit;
function addOnPreMain(cb) {
 __ATMAIN__.unshift(cb);
}
Module["addOnPreMain"] = addOnPreMain;
function addOnExit(cb) {
 __ATEXIT__.unshift(cb);
}
Module["addOnExit"] = addOnExit;
function addOnPostRun(cb) {
 __ATPOSTRUN__.unshift(cb);
}
Module["addOnPostRun"] = addOnPostRun;
function intArrayFromString(stringy, dontAddNull, length) {
 var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
 var u8array = new Array(len);
 var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
 if (dontAddNull) u8array.length = numBytesWritten;
 return u8array;
}
Module["intArrayFromString"] = intArrayFromString;
function intArrayToString(array) {
 var ret = [];
 for (var i = 0; i < array.length; i++) {
  var chr = array[i];
  if (chr > 255) {
   assert(false, "Character code " + chr + " (" + String.fromCharCode(chr) + ")  at offset " + i + " not in 0x00-0xFF.");
   chr &= 255;
  }
  ret.push(String.fromCharCode(chr));
 }
 return ret.join("");
}
Module["intArrayToString"] = intArrayToString;
function writeStringToMemory(string, buffer, dontAddNull) {
 Runtime.warnOnce("writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!");
 var lastChar, end;
 if (dontAddNull) {
  end = buffer + lengthBytesUTF8(string);
  lastChar = HEAP8[end];
 }
 stringToUTF8(string, buffer, Infinity);
 if (dontAddNull) HEAP8[end] = lastChar;
}
Module["writeStringToMemory"] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
 assert(array.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)");
 HEAP8.set(array, buffer);
}
Module["writeArrayToMemory"] = writeArrayToMemory;
function writeAsciiToMemory(str, buffer, dontAddNull) {
 for (var i = 0; i < str.length; ++i) {
  assert(str.charCodeAt(i) === str.charCodeAt(i) & 255);
  HEAP8[buffer++ >> 0] = str.charCodeAt(i);
 }
 if (!dontAddNull) HEAP8[buffer >> 0] = 0;
}
Module["writeAsciiToMemory"] = writeAsciiToMemory;
if (!Math["imul"] || Math["imul"](4294967295, 5) !== -5) Math["imul"] = function imul(a, b) {
 var ah = a >>> 16;
 var al = a & 65535;
 var bh = b >>> 16;
 var bl = b & 65535;
 return al * bl + (ah * bl + al * bh << 16) | 0;
};
Math.imul = Math["imul"];
if (!Math["clz32"]) Math["clz32"] = (function(x) {
 x = x >>> 0;
 for (var i = 0; i < 32; i++) {
  if (x & 1 << 31 - i) return i;
 }
 return 32;
});
Math.clz32 = Math["clz32"];
if (!Math["trunc"]) Math["trunc"] = (function(x) {
 return x < 0 ? Math.ceil(x) : Math.floor(x);
});
Math.trunc = Math["trunc"];
var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_round = Math.round;
var Math_min = Math.min;
var Math_clz32 = Math.clz32;
var Math_trunc = Math.trunc;
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
var runDependencyTracking = {};
function getUniqueRunDependency(id) {
 var orig = id;
 while (1) {
  if (!runDependencyTracking[id]) return id;
  id = orig + Math.random();
 }
 return id;
}
function addRunDependency(id) {
 runDependencies++;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
 if (id) {
  assert(!runDependencyTracking[id]);
  runDependencyTracking[id] = 1;
  if (runDependencyWatcher === null && typeof setInterval !== "undefined") {
   runDependencyWatcher = setInterval((function() {
    if (ABORT) {
     clearInterval(runDependencyWatcher);
     runDependencyWatcher = null;
     return;
    }
    var shown = false;
    for (var dep in runDependencyTracking) {
     if (!shown) {
      shown = true;
      Module.printErr("still waiting on run dependencies:");
     }
     Module.printErr("dependency: " + dep);
    }
    if (shown) {
     Module.printErr("(end of list)");
    }
   }), 1e4);
  }
 } else {
  Module.printErr("warning: run dependency added without ID");
 }
}
Module["addRunDependency"] = addRunDependency;
function removeRunDependency(id) {
 runDependencies--;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
 if (id) {
  assert(runDependencyTracking[id]);
  delete runDependencyTracking[id];
 } else {
  Module.printErr("warning: run dependency removed without ID");
 }
 if (runDependencies == 0) {
  if (runDependencyWatcher !== null) {
   clearInterval(runDependencyWatcher);
   runDependencyWatcher = null;
  }
  if (dependenciesFulfilled) {
   var callback = dependenciesFulfilled;
   dependenciesFulfilled = null;
   callback();
  }
 }
}
Module["removeRunDependency"] = removeRunDependency;
Module["preloadedImages"] = {};
Module["preloadedAudios"] = {};
var FS = {
 error: (function() {
  abort("Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with  -s FORCE_FILESYSTEM=1");
 }),
 init: (function() {
  FS.error();
 }),
 createDataFile: (function() {
  FS.error();
 }),
 createPreloadedFile: (function() {
  FS.error();
 }),
 createLazyFile: (function() {
  FS.error();
 }),
 open: (function() {
  FS.error();
 }),
 mkdev: (function() {
  FS.error();
 }),
 registerDevice: (function() {
  FS.error();
 }),
 analyzePath: (function() {
  FS.error();
 }),
 loadFilesFromDB: (function() {
  FS.error();
 }),
 ErrnoError: function ErrnoError() {
  FS.error();
 }
};
Module["FS_createDataFile"] = FS.createDataFile;
Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
var ASM_CONSTS = [ (function() {
 return +(new Date);
}), (function($0, $1) {
 traiterMessage($0 ? 0 : 1, Pointer_stringify($1));
}), (function($0, $1, $2) {
 var ptr = $0;
 var size = $1;
 var robot = $2 ? 0 : 1;
 var buffer = Module.HEAPU8.buffer.slice(ptr, ptr + size);
 traiterTrameMonitor(robot, buffer);
}) ];
function _emscripten_asm_const_i(code) {
 return ASM_CONSTS[code]();
}
function _emscripten_asm_const_iiii(code, a0, a1, a2) {
 return ASM_CONSTS[code](a0, a1, a2);
}
function _emscripten_asm_const_iii(code, a0, a1) {
 return ASM_CONSTS[code](a0, a1);
}
STATIC_BASE = Runtime.GLOBAL_BASE;
STATICTOP = STATIC_BASE + 7840;
__ATINIT__.push({
 func: (function() {
  __GLOBAL__sub_I_simulateur_cpp();
 })
});
allocate([ 82, 3, 0, 0, 28, 2, 0, 0, 44, 1, 0, 0, 166, 4, 0, 0, 76, 4, 0, 0, 220, 5, 0, 0, 5, 0, 0, 0, 11, 0, 0, 0, 2, 0, 0, 0, 7, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 204, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 146, 26, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 40, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 123, 114, 101, 116, 117, 114, 110, 32, 43, 110, 101, 119, 32, 68, 97, 116, 101, 125, 0, 69, 67, 82, 65, 78, 58, 32, 37, 115, 0, 83, 69, 82, 73, 65, 76, 49, 58, 32, 37, 115, 0, 123, 32, 116, 114, 97, 105, 116, 101, 114, 77, 101, 115, 115, 97, 103, 101, 40, 36, 48, 32, 63, 32, 48, 32, 58, 32, 49, 44, 32, 80, 111, 105, 110, 116, 101, 114, 95, 115, 116, 114, 105, 110, 103, 105, 102, 121, 40, 36, 49, 41, 41, 59, 125, 0, 33, 32, 69, 82, 82, 79, 82, 95, 84, 73, 77, 69, 79, 85, 84, 0, 33, 32, 69, 82, 82, 79, 82, 95, 79, 66, 83, 84, 65, 67, 76, 69, 0, 33, 32, 69, 82, 82, 79, 82, 95, 70, 73, 78, 95, 77, 65, 84, 67, 72, 0, 33, 32, 69, 82, 82, 79, 82, 95, 67, 65, 83, 95, 78, 79, 78, 95, 71, 69, 82, 69, 0, 33, 32, 35, 35, 35, 35, 35, 32, 69, 82, 82, 79, 82, 95, 80, 65, 82, 65, 77, 69, 84, 82, 69, 32, 35, 35, 35, 35, 35, 0, 33, 32, 69, 82, 82, 79, 82, 95, 80, 65, 83, 95, 67, 79, 68, 69, 0, 33, 32, 69, 82, 82, 79, 82, 95, 80, 76, 85, 83, 95, 82, 73, 69, 78, 95, 65, 95, 70, 65, 73, 82, 69, 0, 33, 32, 69, 82, 82, 79, 82, 95, 80, 65, 83, 95, 80, 79, 83, 83, 73, 66, 76, 69, 0, 33, 32, 35, 32, 65, 85, 84, 82, 69, 0, 33, 32, 35, 35, 35, 35, 35, 32, 69, 82, 82, 79, 82, 95, 63, 63, 63, 32, 58, 32, 37, 100, 0, 10, 0, 123, 32, 118, 97, 114, 32, 112, 116, 114, 32, 61, 32, 36, 48, 59, 32, 118, 97, 114, 32, 115, 105, 122, 101, 32, 61, 32, 36, 49, 59, 32, 118, 97, 114, 32, 114, 111, 98, 111, 116, 32, 61, 32, 36, 50, 32, 63, 32, 48, 32, 58, 32, 49, 59, 32, 118, 97, 114, 32, 98, 117, 102, 102, 101, 114, 32, 61, 32, 77, 111, 100, 117, 108, 101, 46, 72, 69, 65, 80, 85, 56, 46, 98, 117, 102, 102, 101, 114, 46, 115, 108, 105, 99, 101, 40, 112, 116, 114, 44, 32, 112, 116, 114, 32, 43, 32, 115, 105, 122, 101, 41, 59, 32, 116, 114, 97, 105, 116, 101, 114, 84, 114, 97, 109, 101, 77, 111, 110, 105, 116, 111, 114, 40, 114, 111, 98, 111, 116, 44, 32, 98, 117, 102, 102, 101, 114, 41, 59, 32, 125, 0, 83, 73, 67, 75, 32, 115, 105, 99, 107, 95, 100, 105, 115, 97, 98, 108, 101, 95, 100, 101, 116, 101, 99, 116, 105, 111, 110, 61, 116, 114, 117, 101, 0, 83, 73, 67, 75, 32, 115, 105, 99, 107, 95, 100, 105, 115, 97, 98, 108, 101, 95, 100, 101, 116, 101, 99, 116, 105, 111, 110, 61, 102, 97, 108, 115, 101, 0, 83, 73, 77, 85, 58, 32, 109, 117, 115, 105, 113, 117, 101, 32, 97, 108, 101, 114, 116, 0, 83, 73, 77, 85, 58, 32, 109, 117, 115, 105, 113, 117, 101, 32, 101, 110, 100, 0, 33, 32, 68, 195, 169, 112, 108, 97, 99, 101, 109, 101, 110, 116, 32, 118, 101, 114, 115, 32, 37, 100, 44, 32, 37, 100, 32, 97, 98, 97, 110, 100, 111, 110, 110, 195, 169, 32, 40, 116, 105, 109, 101, 111, 117, 116, 32, 37, 100, 32, 97, 116, 116, 101, 105, 110, 116, 41, 0, 33, 32, 68, 195, 169, 112, 108, 97, 99, 101, 109, 101, 110, 116, 32, 118, 101, 114, 115, 32, 37, 100, 44, 32, 37, 100, 32, 97, 98, 97, 110, 100, 111, 110, 110, 195, 169, 32, 40, 79, 66, 83, 84, 65, 67, 76, 69, 41, 0, 33, 32, 68, 195, 169, 112, 108, 97, 99, 101, 109, 101, 110, 116, 32, 118, 101, 114, 115, 32, 37, 100, 44, 32, 37, 100, 32, 97, 98, 97, 110, 100, 111, 110, 110, 195, 169, 32, 40, 70, 73, 78, 32, 77, 65, 84, 67, 72, 41, 0, 33, 32, 68, 195, 169, 112, 108, 97, 99, 101, 109, 101, 110, 116, 32, 118, 101, 114, 115, 32, 37, 100, 44, 32, 37, 100, 32, 97, 98, 97, 110, 100, 111, 110, 110, 195, 169, 32, 40, 67, 65, 83, 32, 78, 79, 78, 32, 71, 69, 82, 69, 41, 0, 33, 32, 68, 195, 169, 112, 108, 97, 99, 101, 109, 101, 110, 116, 32, 118, 101, 114, 115, 32, 37, 102, 44, 32, 37, 102, 32, 97, 98, 97, 110, 100, 111, 110, 110, 195, 169, 32, 40, 65, 85, 84, 82, 69, 32, 69, 82, 82, 69, 85, 82, 41, 0, 33, 32, 35, 35, 35, 32, 68, 195, 169, 112, 108, 97, 99, 101, 109, 101, 110, 116, 32, 118, 101, 114, 115, 32, 37, 100, 44, 32, 37, 100, 32, 97, 98, 97, 110, 100, 111, 110, 110, 195, 169, 32, 40, 69, 114, 114, 101, 117, 114, 32, 105, 110, 99, 111, 110, 110, 117, 101, 32, 97, 32, 99, 111, 114, 114, 105, 103, 101, 114, 41, 0, 33, 32, 65, 112, 114, 195, 168, 115, 32, 37, 100, 32, 116, 101, 110, 116, 97, 116, 105, 118, 101, 115, 32, 40, 109, 97, 120, 41, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 50, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 51, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 52, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 53, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 54, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 56, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 57, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 48, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 49, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 50, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 51, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 52, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 54, 83, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 50, 83, 0, 33, 32, 35, 35, 35, 35, 35, 35, 35, 35, 35, 32, 69, 82, 82, 69, 85, 82, 32, 58, 32, 80, 111, 105, 110, 116, 32, 39, 37, 100, 39, 32, 115, 97, 110, 115, 32, 115, 116, 114, 97, 116, 195, 169, 103, 105, 101, 0, 68, 195, 169, 116, 111, 117, 114, 46, 46, 46, 0, 33, 32, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 32, 69, 82, 82, 69, 85, 82, 58, 32, 105, 100, 80, 111, 105, 110, 116, 32, 39, 37, 100, 39, 32, 105, 110, 99, 111, 114, 114, 101, 99, 116, 32, 100, 97, 110, 115, 32, 103, 101, 116, 80, 111, 105, 110, 116, 0, 33, 32, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 32, 69, 114, 114, 101, 117, 114, 32, 58, 32, 112, 97, 114, 97, 109, 195, 168, 116, 114, 101, 115, 32, 100, 101, 32, 114, 111, 98, 111, 116, 95, 100, 97, 110, 115, 95, 122, 111, 110, 101, 32, 109, 97, 108, 32, 100, 195, 169, 102, 105, 110, 105, 115, 46, 0, 77, 97, 116, 99, 104, 32, 80, 82, 10, 10, 0, 80, 114, 101, 116, 10, 0, 61, 61, 61, 61, 32, 82, 97, 112, 112, 111, 114, 116, 101, 114, 32, 67, 85, 66, 37, 100, 32, 61, 61, 61, 61, 0, 33, 32, 35, 35, 35, 35, 35, 35, 35, 32, 99, 117, 98, 32, 100, 111, 105, 116, 32, 195, 170, 116, 114, 101, 32, 48, 32, 49, 32, 111, 117, 32, 50, 32, 40, 114, 101, 195, 167, 117, 32, 58, 32, 37, 100, 41, 0, 65, 116, 116, 101, 110, 100, 117, 32, 58, 32, 48, 124, 54, 48, 32, 59, 32, 82, 101, 195, 167, 117, 32, 58, 32, 37, 100, 0, 67, 85, 66, 37, 100, 32, 112, 108, 97, 99, 195, 169, 32, 101, 110, 32, 123, 37, 100, 44, 32, 37, 100, 125, 0, 83, 111, 114, 116, 32, 100, 101, 32, 108, 97, 32, 122, 111, 110, 101, 32, 100, 101, 32, 100, 195, 169, 112, 97, 114, 116, 0, 33, 32, 35, 35, 35, 35, 35, 35, 35, 35, 35, 32, 69, 82, 82, 69, 85, 82, 32, 58, 32, 97, 99, 116, 105, 111, 110, 32, 105, 110, 99, 111, 110, 110, 117, 101, 0, 58, 58, 58, 32, 65, 99, 116, 105, 111, 110, 32, 37, 100, 32, 91, 37, 100, 93, 32, 58, 58, 58, 0, 80, 114, 111, 99, 104, 97, 105, 110, 101, 32, 97, 99, 116, 105, 111, 110, 32, 58, 32, 37, 100, 32, 91, 37, 100, 93, 32, 63, 0, 61, 61, 61, 61, 32, 65, 99, 116, 105, 118, 97, 116, 105, 111, 110, 32, 100, 117, 32, 112, 97, 110, 110, 101, 97, 117, 32, 61, 61, 61, 61, 0, 79, 110, 32, 115, 116, 111, 112, 32, 108, 101, 115, 32, 109, 111, 116, 101, 117, 114, 115, 0, 49, 46, 32, 80, 111, 115, 105, 116, 105, 111, 110, 110, 101, 114, 10, 0, 50, 46, 32, 74, 97, 99, 107, 32, 105, 110, 10, 0, 51, 46, 32, 66, 65, 85, 32, 111, 102, 102, 10, 0, 67, 111, 117, 108, 101, 117, 114, 32, 58, 32, 86, 69, 82, 84, 10, 0, 67, 111, 117, 108, 101, 117, 114, 32, 58, 32, 79, 82, 65, 78, 71, 69, 10, 0, 10, 10, 0, 52, 46, 32, 74, 97, 99, 107, 32, 111, 117, 116, 10, 10, 0, 80, 114, 101, 116, 10, 10, 0, 45, 45, 45, 32, 82, 97, 112, 112, 111, 114, 116, 101, 114, 32, 67, 85, 66, 37, 100, 32, 45, 45, 45, 0, 77, 97, 116, 99, 104, 32, 71, 82, 10, 0, 32, 46, 32, 82, 101, 116, 105, 114, 101, 114, 32, 116, 97, 115, 115, 101, 97, 117, 120, 10, 0, 73, 110, 105, 116, 105, 97, 108, 105, 115, 97, 116, 105, 111, 110, 46, 46, 46, 0, 32, 79, 107, 10, 0, 61, 61, 61, 32, 80, 104, 97, 115, 101, 32, 49, 32, 61, 61, 61, 0, 33, 32, 35, 35, 35, 35, 32, 66, 79, 85, 67, 76, 69, 32, 73, 78, 70, 73, 78, 73, 69, 32, 63, 32, 35, 35, 35, 0, 61, 61, 61, 32, 40, 49, 41, 32, 79, 110, 32, 98, 111, 117, 99, 108, 101, 32, 61, 61, 61, 0, 61, 61, 61, 32, 80, 104, 97, 115, 101, 32, 50, 32, 61, 61, 61, 0, 61, 61, 61, 32, 40, 50, 41, 32, 79, 110, 32, 98, 111, 117, 99, 108, 101, 32, 61, 61, 61, 0, 45, 45, 45, 32, 69, 118, 97, 99, 117, 101, 114, 32, 69, 97, 117, 120, 32, 85, 115, 195, 169, 101, 115, 32, 45, 45, 45, 0, 69, 97, 117, 120, 32, 117, 115, 195, 169, 101, 115, 32, 108, 97, 114, 103, 117, 195, 169, 101, 115, 0, 71, 82, 32, 110, 101, 32, 112, 101, 117, 116, 32, 112, 97, 115, 32, 102, 97, 105, 114, 101, 32, 108, 39, 97, 99, 116, 105, 111, 110, 32, 37, 100, 0, 45, 45, 45, 32, 69, 118, 97, 99, 117, 101, 114, 32, 69, 97, 117, 32, 80, 114, 111, 112, 114, 101, 32, 45, 45, 45, 0, 45, 45, 45, 32, 86, 105, 100, 101, 114, 32, 82, 69, 80, 32, 79, 112, 112, 32, 45, 45, 45, 0, 82, 69, 80, 32, 79, 112, 112, 32, 118, 105, 100, 195, 169, 0, 45, 45, 45, 32, 86, 105, 100, 101, 114, 32, 82, 69, 77, 32, 79, 112, 112, 32, 45, 45, 45, 0, 82, 69, 77, 95, 111, 112, 112, 32, 118, 105, 100, 195, 169, 0, 45, 45, 45, 32, 86, 105, 100, 101, 114, 32, 82, 69, 77, 32, 45, 45, 45, 0, 82, 69, 77, 32, 118, 105, 100, 195, 169, 0, 45, 45, 45, 32, 65, 99, 116, 105, 118, 101, 114, 32, 65, 98, 101, 105, 108, 108, 101, 32, 45, 45, 45, 0, 82, 101, 99, 97, 108, 97, 103, 101, 32, 101, 110, 32, 89, 46, 46, 46, 0, 79, 75, 0, 82, 101, 99, 97, 108, 97, 103, 101, 32, 101, 110, 32, 88, 46, 46, 46, 0, 40, 82, 101, 99, 97, 108, 195, 169, 32, 97, 117, 32, 112, 97, 115, 115, 97, 103, 101, 41, 0, 65, 66, 69, 73, 76, 76, 69, 32, 97, 116, 116, 101, 105, 110, 116, 101, 46, 0, 65, 98, 101, 105, 108, 108, 101, 32, 97, 99, 116, 105, 118, 195, 169, 101, 0, 45, 45, 45, 32, 79, 117, 118, 114, 105, 114, 32, 82, 69, 80, 32, 45, 45, 45, 0, 82, 69, 80, 32, 111, 117, 118, 101, 114, 116, 0, 45, 45, 45, 32, 86, 105, 100, 101, 114, 32, 82, 69, 80, 32, 45, 45, 45, 0, 82, 69, 80, 32, 118, 105, 100, 195, 169, 0, 45, 45, 45, 32, 65, 99, 116, 105, 118, 101, 114, 32, 112, 97, 110, 110, 101, 97, 117, 32, 45, 45, 45, 0, 80, 97, 110, 110, 101, 97, 117, 32, 97, 99, 116, 105, 118, 195, 169, 0, 33, 32, 79, 110, 32, 115, 116, 111, 112, 112, 101, 32, 108, 101, 115, 32, 109, 111, 116, 101, 117, 114, 115, 0, 73, 110, 105, 116, 105, 97, 108, 105, 115, 97, 116, 105, 111, 110, 32, 100, 101, 115, 32, 115, 101, 114, 118, 111, 115, 0, 84, 114, 105, 32, 58, 32, 0, 78, 101, 117, 116, 114, 101, 0, 69, 97, 117, 32, 112, 114, 111, 112, 114, 101, 0, 69, 97, 117, 32, 117, 115, 101, 101, 0, 69, 120, 116, 114, 101, 109, 101, 32, 71, 97, 117, 99, 104, 101, 0, 69, 120, 116, 114, 101, 109, 101, 32, 68, 114, 111, 105, 116, 101, 0, 37, 100, 0, 67, 117, 105, 108, 108, 101, 114, 101, 32, 97, 32, 109, 105, 101, 108, 32, 58, 32, 0, 73, 110, 105, 116, 0, 71, 97, 117, 99, 104, 101, 0, 65, 32, 57, 48, 0, 68, 114, 111, 105, 116, 101, 0, 69, 118, 97, 99, 117, 97, 116, 105, 111, 110, 32, 100, 101, 115, 32, 101, 97, 117, 120, 32, 117, 115, 195, 169, 101, 115, 32, 58, 32, 0, 66, 108, 111, 113, 117, 101, 101, 0, 79, 117, 118, 101, 114, 116, 101, 0, 80, 111, 115, 105, 116, 105, 111, 110, 110, 101, 109, 101, 110, 116, 32, 100, 117, 32, 98, 114, 97, 115, 32, 58, 32, 0, 76, 101, 118, 195, 169, 0, 73, 110, 116, 101, 114, 114, 117, 112, 116, 101, 117, 114, 0, 70, 105, 110, 32, 109, 105, 110, 117, 116, 101, 117, 114, 44, 32, 112, 114, 111, 99, 101, 100, 117, 114, 101, 32, 100, 39, 97, 114, 114, 101, 116, 0, 35, 70, 105, 110, 80, 114, 111, 103, 114, 97, 109, 109, 101, 0, 35, 68, 101, 98, 117, 116, 68, 117, 77, 97, 116, 99, 104, 10, 0, 65, 116, 116, 101, 110, 116, 101, 32, 102, 105, 110, 32, 100, 117, 32, 109, 97, 116, 99, 104, 32, 40, 114, 101, 115, 116, 101, 32, 37, 100, 32, 109, 115, 41, 0, 61, 37, 100, 0, 108, 101, 100, 77, 97, 116, 114, 105, 120, 58, 32, 83, 99, 111, 114, 101, 32, 61, 32, 37, 100, 0, 43, 37, 100, 0, 45, 37, 100, 0, 108, 101, 100, 77, 97, 116, 114, 105, 120, 58, 32, 83, 99, 111, 114, 101, 32, 43, 61, 32, 37, 100, 0, 33, 0, 17, 0, 10, 0, 17, 17, 17, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 15, 10, 17, 17, 17, 3, 10, 7, 0, 1, 19, 9, 11, 11, 0, 0, 9, 6, 11, 0, 0, 11, 0, 6, 17, 0, 0, 0, 17, 17, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 10, 10, 17, 17, 17, 0, 10, 0, 0, 2, 0, 9, 11, 0, 0, 0, 9, 0, 11, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 12, 0, 0, 0, 0, 9, 12, 0, 0, 0, 0, 0, 12, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 0, 0, 0, 4, 13, 0, 0, 0, 0, 9, 14, 0, 0, 0, 0, 0, 14, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 15, 0, 0, 0, 0, 9, 16, 0, 0, 0, 0, 0, 16, 0, 0, 16, 0, 0, 18, 0, 0, 0, 18, 18, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 18, 18, 18, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 10, 0, 0, 0, 0, 9, 11, 0, 0, 0, 0, 0, 11, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 12, 0, 0, 0, 0, 9, 12, 0, 0, 0, 0, 0, 12, 0, 0, 12, 0, 0, 45, 43, 32, 32, 32, 48, 88, 48, 120, 0, 40, 110, 117, 108, 108, 41, 0, 45, 48, 88, 43, 48, 88, 32, 48, 88, 45, 48, 120, 43, 48, 120, 32, 48, 120, 0, 105, 110, 102, 0, 73, 78, 70, 0, 110, 97, 110, 0, 78, 65, 78, 0, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 46, 0, 84, 33, 34, 25, 13, 1, 2, 3, 17, 75, 28, 12, 16, 4, 11, 29, 18, 30, 39, 104, 110, 111, 112, 113, 98, 32, 5, 6, 15, 19, 20, 21, 26, 8, 22, 7, 40, 36, 23, 24, 9, 10, 14, 27, 31, 37, 35, 131, 130, 125, 38, 42, 43, 60, 61, 62, 63, 67, 71, 74, 77, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 99, 100, 101, 102, 103, 105, 106, 107, 108, 114, 115, 116, 121, 122, 123, 124, 0, 73, 108, 108, 101, 103, 97, 108, 32, 98, 121, 116, 101, 32, 115, 101, 113, 117, 101, 110, 99, 101, 0, 68, 111, 109, 97, 105, 110, 32, 101, 114, 114, 111, 114, 0, 82, 101, 115, 117, 108, 116, 32, 110, 111, 116, 32, 114, 101, 112, 114, 101, 115, 101, 110, 116, 97, 98, 108, 101, 0, 78, 111, 116, 32, 97, 32, 116, 116, 121, 0, 80, 101, 114, 109, 105, 115, 115, 105, 111, 110, 32, 100, 101, 110, 105, 101, 100, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 110, 111, 116, 32, 112, 101, 114, 109, 105, 116, 116, 101, 100, 0, 78, 111, 32, 115, 117, 99, 104, 32, 102, 105, 108, 101, 32, 111, 114, 32, 100, 105, 114, 101, 99, 116, 111, 114, 121, 0, 78, 111, 32, 115, 117, 99, 104, 32, 112, 114, 111, 99, 101, 115, 115, 0, 70, 105, 108, 101, 32, 101, 120, 105, 115, 116, 115, 0, 86, 97, 108, 117, 101, 32, 116, 111, 111, 32, 108, 97, 114, 103, 101, 32, 102, 111, 114, 32, 100, 97, 116, 97, 32, 116, 121, 112, 101, 0, 78, 111, 32, 115, 112, 97, 99, 101, 32, 108, 101, 102, 116, 32, 111, 110, 32, 100, 101, 118, 105, 99, 101, 0, 79, 117, 116, 32, 111, 102, 32, 109, 101, 109, 111, 114, 121, 0, 82, 101, 115, 111, 117, 114, 99, 101, 32, 98, 117, 115, 121, 0, 73, 110, 116, 101, 114, 114, 117, 112, 116, 101, 100, 32, 115, 121, 115, 116, 101, 109, 32, 99, 97, 108, 108, 0, 82, 101, 115, 111, 117, 114, 99, 101, 32, 116, 101, 109, 112, 111, 114, 97, 114, 105, 108, 121, 32, 117, 110, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 73, 110, 118, 97, 108, 105, 100, 32, 115, 101, 101, 107, 0, 67, 114, 111, 115, 115, 45, 100, 101, 118, 105, 99, 101, 32, 108, 105, 110, 107, 0, 82, 101, 97, 100, 45, 111, 110, 108, 121, 32, 102, 105, 108, 101, 32, 115, 121, 115, 116, 101, 109, 0, 68, 105, 114, 101, 99, 116, 111, 114, 121, 32, 110, 111, 116, 32, 101, 109, 112, 116, 121, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 115, 101, 116, 32, 98, 121, 32, 112, 101, 101, 114, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 116, 105, 109, 101, 100, 32, 111, 117, 116, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 102, 117, 115, 101, 100, 0, 72, 111, 115, 116, 32, 105, 115, 32, 100, 111, 119, 110, 0, 72, 111, 115, 116, 32, 105, 115, 32, 117, 110, 114, 101, 97, 99, 104, 97, 98, 108, 101, 0, 65, 100, 100, 114, 101, 115, 115, 32, 105, 110, 32, 117, 115, 101, 0, 66, 114, 111, 107, 101, 110, 32, 112, 105, 112, 101, 0, 73, 47, 79, 32, 101, 114, 114, 111, 114, 0, 78, 111, 32, 115, 117, 99, 104, 32, 100, 101, 118, 105, 99, 101, 32, 111, 114, 32, 97, 100, 100, 114, 101, 115, 115, 0, 66, 108, 111, 99, 107, 32, 100, 101, 118, 105, 99, 101, 32, 114, 101, 113, 117, 105, 114, 101, 100, 0, 78, 111, 32, 115, 117, 99, 104, 32, 100, 101, 118, 105, 99, 101, 0, 78, 111, 116, 32, 97, 32, 100, 105, 114, 101, 99, 116, 111, 114, 121, 0, 73, 115, 32, 97, 32, 100, 105, 114, 101, 99, 116, 111, 114, 121, 0, 84, 101, 120, 116, 32, 102, 105, 108, 101, 32, 98, 117, 115, 121, 0, 69, 120, 101, 99, 32, 102, 111, 114, 109, 97, 116, 32, 101, 114, 114, 111, 114, 0, 73, 110, 118, 97, 108, 105, 100, 32, 97, 114, 103, 117, 109, 101, 110, 116, 0, 65, 114, 103, 117, 109, 101, 110, 116, 32, 108, 105, 115, 116, 32, 116, 111, 111, 32, 108, 111, 110, 103, 0, 83, 121, 109, 98, 111, 108, 105, 99, 32, 108, 105, 110, 107, 32, 108, 111, 111, 112, 0, 70, 105, 108, 101, 110, 97, 109, 101, 32, 116, 111, 111, 32, 108, 111, 110, 103, 0, 84, 111, 111, 32, 109, 97, 110, 121, 32, 111, 112, 101, 110, 32, 102, 105, 108, 101, 115, 32, 105, 110, 32, 115, 121, 115, 116, 101, 109, 0, 78, 111, 32, 102, 105, 108, 101, 32, 100, 101, 115, 99, 114, 105, 112, 116, 111, 114, 115, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 66, 97, 100, 32, 102, 105, 108, 101, 32, 100, 101, 115, 99, 114, 105, 112, 116, 111, 114, 0, 78, 111, 32, 99, 104, 105, 108, 100, 32, 112, 114, 111, 99, 101, 115, 115, 0, 66, 97, 100, 32, 97, 100, 100, 114, 101, 115, 115, 0, 70, 105, 108, 101, 32, 116, 111, 111, 32, 108, 97, 114, 103, 101, 0, 84, 111, 111, 32, 109, 97, 110, 121, 32, 108, 105, 110, 107, 115, 0, 78, 111, 32, 108, 111, 99, 107, 115, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 82, 101, 115, 111, 117, 114, 99, 101, 32, 100, 101, 97, 100, 108, 111, 99, 107, 32, 119, 111, 117, 108, 100, 32, 111, 99, 99, 117, 114, 0, 83, 116, 97, 116, 101, 32, 110, 111, 116, 32, 114, 101, 99, 111, 118, 101, 114, 97, 98, 108, 101, 0, 80, 114, 101, 118, 105, 111, 117, 115, 32, 111, 119, 110, 101, 114, 32, 100, 105, 101, 100, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 99, 97, 110, 99, 101, 108, 101, 100, 0, 70, 117, 110, 99, 116, 105, 111, 110, 32, 110, 111, 116, 32, 105, 109, 112, 108, 101, 109, 101, 110, 116, 101, 100, 0, 78, 111, 32, 109, 101, 115, 115, 97, 103, 101, 32, 111, 102, 32, 100, 101, 115, 105, 114, 101, 100, 32, 116, 121, 112, 101, 0, 73, 100, 101, 110, 116, 105, 102, 105, 101, 114, 32, 114, 101, 109, 111, 118, 101, 100, 0, 68, 101, 118, 105, 99, 101, 32, 110, 111, 116, 32, 97, 32, 115, 116, 114, 101, 97, 109, 0, 78, 111, 32, 100, 97, 116, 97, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 68, 101, 118, 105, 99, 101, 32, 116, 105, 109, 101, 111, 117, 116, 0, 79, 117, 116, 32, 111, 102, 32, 115, 116, 114, 101, 97, 109, 115, 32, 114, 101, 115, 111, 117, 114, 99, 101, 115, 0, 76, 105, 110, 107, 32, 104, 97, 115, 32, 98, 101, 101, 110, 32, 115, 101, 118, 101, 114, 101, 100, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 101, 114, 114, 111, 114, 0, 66, 97, 100, 32, 109, 101, 115, 115, 97, 103, 101, 0, 70, 105, 108, 101, 32, 100, 101, 115, 99, 114, 105, 112, 116, 111, 114, 32, 105, 110, 32, 98, 97, 100, 32, 115, 116, 97, 116, 101, 0, 78, 111, 116, 32, 97, 32, 115, 111, 99, 107, 101, 116, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 97, 100, 100, 114, 101, 115, 115, 32, 114, 101, 113, 117, 105, 114, 101, 100, 0, 77, 101, 115, 115, 97, 103, 101, 32, 116, 111, 111, 32, 108, 97, 114, 103, 101, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 119, 114, 111, 110, 103, 32, 116, 121, 112, 101, 32, 102, 111, 114, 32, 115, 111, 99, 107, 101, 116, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 110, 111, 116, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 83, 111, 99, 107, 101, 116, 32, 116, 121, 112, 101, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 78, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 102, 97, 109, 105, 108, 121, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 65, 100, 100, 114, 101, 115, 115, 32, 102, 97, 109, 105, 108, 121, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 32, 98, 121, 32, 112, 114, 111, 116, 111, 99, 111, 108, 0, 65, 100, 100, 114, 101, 115, 115, 32, 110, 111, 116, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 78, 101, 116, 119, 111, 114, 107, 32, 105, 115, 32, 100, 111, 119, 110, 0, 78, 101, 116, 119, 111, 114, 107, 32, 117, 110, 114, 101, 97, 99, 104, 97, 98, 108, 101, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 115, 101, 116, 32, 98, 121, 32, 110, 101, 116, 119, 111, 114, 107, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 97, 98, 111, 114, 116, 101, 100, 0, 78, 111, 32, 98, 117, 102, 102, 101, 114, 32, 115, 112, 97, 99, 101, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 83, 111, 99, 107, 101, 116, 32, 105, 115, 32, 99, 111, 110, 110, 101, 99, 116, 101, 100, 0, 83, 111, 99, 107, 101, 116, 32, 110, 111, 116, 32, 99, 111, 110, 110, 101, 99, 116, 101, 100, 0, 67, 97, 110, 110, 111, 116, 32, 115, 101, 110, 100, 32, 97, 102, 116, 101, 114, 32, 115, 111, 99, 107, 101, 116, 32, 115, 104, 117, 116, 100, 111, 119, 110, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 97, 108, 114, 101, 97, 100, 121, 32, 105, 110, 32, 112, 114, 111, 103, 114, 101, 115, 115, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 105, 110, 32, 112, 114, 111, 103, 114, 101, 115, 115, 0, 83, 116, 97, 108, 101, 32, 102, 105, 108, 101, 32, 104, 97, 110, 100, 108, 101, 0, 82, 101, 109, 111, 116, 101, 32, 73, 47, 79, 32, 101, 114, 114, 111, 114, 0, 81, 117, 111, 116, 97, 32, 101, 120, 99, 101, 101, 100, 101, 100, 0, 78, 111, 32, 109, 101, 100, 105, 117, 109, 32, 102, 111, 117, 110, 100, 0, 87, 114, 111, 110, 103, 32, 109, 101, 100, 105, 117, 109, 32, 116, 121, 112, 101, 0, 78, 111, 32, 101, 114, 114, 111, 114, 32, 105, 110, 102, 111, 114, 109, 97, 116, 105, 111, 110, 0, 0 ], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
var tempDoublePtr = STATICTOP;
STATICTOP += 16;
assert(tempDoublePtr % 8 == 0);
var EMTSTACKTOP = getMemory(1048576);
var EMT_STACK_MAX = EMTSTACKTOP + 1048576;
var eb = getMemory(60344);
assert(eb % 8 === 0);
__ATPRERUN__.push((function() {
 HEAPU8.set([ 140, 6, 89, 1, 0, 0, 0, 0, 2, 200, 0, 0, 12, 2, 0, 0, 2, 201, 0, 0, 0, 202, 154, 59, 2, 202, 0, 0, 0, 15, 0, 0, 1, 203, 0, 0, 143, 203, 87, 1, 136, 204, 0, 0, 0, 203, 204, 0, 143, 203, 88, 1, 136, 203, 0, 0, 1, 204, 48, 2, 3, 203, 203, 204, 137, 203, 0, 0, 130, 203, 0, 0, 136, 204, 0, 0, 49, 203, 203, 204, 96, 0, 0, 0, 1, 204, 48, 2, 135, 203, 0, 0, 204, 0, 0, 0, 141, 204, 88, 1, 3, 203, 204, 200, 143, 203, 83, 1, 141, 203, 88, 1, 1, 204, 0, 0, 85, 203, 204, 0, 141, 204, 88, 1, 1, 203, 0, 2, 3, 204, 204, 203, 25, 116, 204, 12, 134, 204, 0, 0, 172, 229, 0, 0, 1, 0, 0, 0, 128, 204, 0, 0, 0, 122, 204, 0, 34, 204, 122, 0, 121, 204, 5, 0, 68, 20, 1, 0, 1, 33, 1, 0, 1, 34, 205, 14, 119, 0, 20, 0, 38, 204, 4, 1, 32, 204, 204, 0, 1, 203, 206, 14, 1, 205, 211, 14, 125, 6, 204, 203, 205, 0, 0, 0, 1, 205, 0, 8, 19, 205, 4, 205, 32, 205, 205, 0, 1, 203, 208, 14, 125, 7, 205, 6, 203, 0, 0, 0, 58, 20, 1, 0, 1, 203, 1, 8, 19, 203, 4, 203, 33, 203, 203, 0, 38, 203, 203, 1, 0, 33, 203, 0, 0, 34, 7, 0, 134, 203, 0, 0, 172, 229, 0, 0, 20, 0, 0, 0, 128, 203, 0, 0, 0, 168, 203, 0, 2, 203, 0, 0, 0, 0, 240, 127, 19, 203, 168, 203, 2, 205, 0, 0, 0, 0, 240, 127, 16, 203, 203, 205, 2, 205, 0, 0, 0, 0, 240, 127, 19, 205, 168, 205, 2, 204, 0, 0, 0, 0, 240, 127, 13, 205, 205, 204, 1, 204, 0, 0, 34, 204, 204, 0, 19, 205, 205, 204, 20, 203, 203, 205, 121, 203, 83, 5, 141, 205, 88, 1, 134, 203, 0, 0, 68, 232, 0, 0, 20, 205, 0, 0, 144, 203, 41, 1, 142, 203, 41, 1, 59, 205, 2, 0, 65, 203, 203, 205, 59, 205, 0, 0, 70, 203, 203, 205, 121, 203, 8, 0, 141, 205, 88, 1, 82, 203, 205, 0, 143, 203, 65, 1, 141, 203, 88, 1, 141, 205, 65, 1, 26, 205, 205, 1, 85, 203, 205, 0, 39, 205, 5, 32, 32, 205, 205, 97, 121, 205, 0, 1, 25, 205, 34, 9, 143, 205, 69, 1, 38, 205, 5, 32, 32, 205, 205, 0, 141, 203, 69, 1, 125, 35, 205, 34, 203, 0, 0, 0, 39, 205, 33, 2, 0, 203, 205, 0, 143, 203, 70, 1, 1, 203, 11, 0, 16, 203, 203, 3, 1, 205, 12, 0, 4, 205, 205, 3, 32, 205, 205, 0, 20, 203, 203, 205, 121, 203, 5, 0, 142, 203, 41, 1, 59, 205, 2, 0, 65, 43, 203, 205, 119, 0, 42, 0, 59, 29, 8, 0, 1, 205, 12, 0, 4, 50, 205, 3, 26, 205, 50, 1, 143, 205, 71, 1, 59, 203, 16, 0, 65, 205, 29, 203, 144, 205, 72, 1, 141, 205, 71, 1, 32, 205, 205, 0, 120, 205, 6, 0, 142, 205, 72, 1, 58, 29, 205, 0, 141, 205, 71, 1, 0, 50, 205, 0, 119, 0, 244, 255, 78, 205, 35, 0, 143, 205, 73, 1, 141, 205, 73, 1, 41, 205, 205, 24, 42, 205, 205, 24, 32, 205, 205, 45, 121, 205, 11, 0, 142, 205, 72, 1, 142, 203, 41, 1, 59, 204, 2, 0, 65, 203, 203, 204, 68, 203, 203, 0, 142, 204, 72, 1, 64, 203, 203, 204, 63, 205, 205, 203, 68, 43, 205, 0, 119, 0, 9, 0, 142, 205, 41, 1, 59, 203, 2, 0, 65, 205, 205, 203, 142, 203, 72, 1, 63, 205, 205, 203, 142, 203, 72, 1, 64, 43, 205, 203, 119, 0, 1, 0, 141, 205, 88, 1, 82, 203, 205, 0, 143, 203, 74, 1, 141, 204, 74, 1, 34, 204, 204, 0, 121, 204, 6, 0, 1, 204, 0, 0, 141, 206, 74, 1, 4, 204, 204, 206, 0, 205, 204, 0, 119, 0, 3, 0, 141, 204, 74, 1, 0, 205, 204, 0, 0, 203, 205, 0, 143, 203, 75, 1, 141, 205, 75, 1, 141, 204, 75, 1, 34, 204, 204, 0, 41, 204, 204, 31, 42, 204, 204, 31, 134, 203, 0, 0, 64, 151, 0, 0, 205, 204, 116, 0, 143, 203, 76, 1, 141, 203, 76, 1, 45, 203, 203, 116, 56, 3, 0, 0, 141, 203, 88, 1, 1, 204, 0, 2, 3, 203, 203, 204, 1, 204, 48, 0, 107, 203, 11, 204, 141, 204, 88, 1, 1, 203, 0, 2, 3, 204, 204, 203, 25, 31, 204, 11, 119, 0, 3, 0, 141, 204, 76, 1, 0, 31, 204, 0, 26, 204, 31, 1, 143, 204, 77, 1, 141, 204, 77, 1, 141, 203, 74, 1, 42, 203, 203, 31, 38, 203, 203, 2, 25, 203, 203, 43, 1, 205, 255, 0, 19, 203, 203, 205, 83, 204, 203, 0, 26, 203, 31, 2, 143, 203, 78, 1, 141, 203, 78, 1, 25, 204, 5, 15, 1, 205, 255, 0, 19, 204, 204, 205, 83, 203, 204, 0, 141, 204, 88, 1, 3, 36, 204, 200, 58, 60, 43, 0, 75, 204, 60, 0, 143, 204, 79, 1, 1, 203, 240, 14, 141, 205, 79, 1, 90, 204, 203, 205, 143, 204, 80, 1, 25, 204, 36, 1, 143, 204, 81, 1, 141, 204, 80, 1, 1, 203, 255, 0, 19, 204, 204, 203, 38, 203, 5, 32, 20, 204, 204, 203, 1, 203, 255, 0, 19, 204, 204, 203, 83, 36, 204, 0, 141, 203, 79, 1, 76, 203, 203, 0, 64, 204, 60, 203, 144, 204, 82, 1, 141, 204, 81, 1, 141, 203, 83, 1, 4, 204, 204, 203, 32, 204, 204, 1, 121, 204, 23, 0, 38, 204, 4, 8, 32, 204, 204, 0, 34, 203, 3, 1, 142, 205, 82, 1, 59, 206, 16, 0, 65, 205, 205, 206, 59, 206, 0, 0, 69, 205, 205, 206, 19, 203, 203, 205, 19, 204, 204, 203, 121, 204, 4, 0, 141, 204, 81, 1, 0, 54, 204, 0, 119, 0, 11, 0, 25, 204, 36, 2, 143, 204, 84, 1, 141, 204, 81, 1, 1, 203, 46, 0, 83, 204, 203, 0, 141, 203, 84, 1, 0, 54, 203, 0, 119, 0, 3, 0, 141, 203, 81, 1, 0, 54, 203, 0, 142, 203, 82, 1, 59, 204, 16, 0, 65, 203, 203, 204, 59, 204, 0, 0, 70, 203, 203, 204, 121, 203, 6, 0, 0, 36, 54, 0, 142, 203, 82, 1, 59, 204, 16, 0, 65, 60, 203, 204, 119, 0, 197, 255, 0, 204, 54, 0, 143, 204, 85, 1, 33, 203, 3, 0, 141, 205, 85, 1, 141, 206, 83, 1, 4, 205, 205, 206, 26, 205, 205, 2, 15, 205, 205, 3, 19, 203, 203, 205, 121, 203, 4, 0, 25, 203, 3, 2, 0, 204, 203, 0, 119, 0, 5, 0, 141, 203, 85, 1, 141, 205, 83, 1, 4, 203, 203, 205, 0, 204, 203, 0, 0, 106, 204, 0, 141, 204, 78, 1, 4, 204, 116, 204, 141, 203, 70, 1, 3, 204, 204, 203, 3, 115, 204, 106, 1, 203, 32, 0, 134, 204, 0, 0, 104, 201, 0, 0, 0, 203, 2, 115, 4, 0, 0, 0, 141, 203, 70, 1, 134, 204, 0, 0, 116, 229, 0, 0, 0, 35, 203, 0, 1, 203, 48, 0, 2, 205, 0, 0, 0, 0, 1, 0, 21, 205, 4, 205, 134, 204, 0, 0, 104, 201, 0, 0, 0, 203, 2, 115, 205, 0, 0, 0, 141, 205, 88, 1, 3, 205, 205, 200, 141, 203, 85, 1, 141, 206, 83, 1, 4, 203, 203, 206, 134, 204, 0, 0, 116, 229, 0, 0, 0, 205, 203, 0, 1, 203, 48, 0, 141, 205, 85, 1, 141, 206, 83, 1, 4, 205, 205, 206, 4, 205, 106, 205, 1, 206, 0, 0, 1, 207, 0, 0, 134, 204, 0, 0, 104, 201, 0, 0, 0, 203, 205, 206, 207, 0, 0, 0, 141, 207, 78, 1, 141, 206, 78, 1, 4, 206, 116, 206, 134, 204, 0, 0, 116, 229, 0, 0, 0, 207, 206, 0, 1, 206, 32, 0, 1, 207, 0, 32, 21, 207, 4, 207, 134, 204, 0, 0, 104, 201, 0, 0, 0, 206, 2, 115, 207, 0, 0, 0, 0, 114, 115, 0, 119, 0, 117, 4, 34, 204, 3, 0, 1, 207, 6, 0, 125, 84, 204, 207, 3, 0, 0, 0, 142, 207, 41, 1, 59, 204, 2, 0, 65, 207, 207, 204, 59, 204, 0, 0, 70, 207, 207, 204, 121, 207, 14, 0, 141, 207, 88, 1, 82, 117, 207, 0, 141, 207, 88, 1, 26, 204, 117, 28, 85, 207, 204, 0, 142, 204, 41, 1, 59, 207, 2, 0, 65, 204, 204, 207, 60, 207, 0, 0, 0, 0, 0, 16, 65, 70, 204, 207, 26, 108, 117, 28, 119, 0, 7, 0, 141, 207, 88, 1, 82, 110, 207, 0, 142, 207, 41, 1, 59, 204, 2, 0, 65, 70, 207, 204, 0, 108, 110, 0, 34, 118, 108, 0, 121, 118, 5, 0, 141, 207, 88, 1, 25, 207, 207, 8, 0, 204, 207, 0, 119, 0, 6, 0, 141, 207, 88, 1, 25, 207, 207, 8, 1, 206, 32, 1, 3, 207, 207, 206, 0, 204, 207, 0, 0, 94, 204, 0, 0, 28, 94, 0, 58, 77, 70, 0, 75, 119, 77, 0, 85, 28, 119, 0, 25, 120, 28, 4, 77, 204, 119, 0, 64, 121, 77, 204, 60, 204, 0, 0, 0, 202, 154, 59, 65, 204, 121, 204, 59, 207, 0, 0, 70, 204, 204, 207, 121, 204, 6, 0, 0, 28, 120, 0, 60, 204, 0, 0, 0, 202, 154, 59, 65, 77, 121, 204, 119, 0, 241, 255, 1, 204, 0, 0, 15, 123, 204, 108, 121, 123, 80, 0, 0, 46, 94, 0, 0, 49, 120, 0, 0, 125, 108, 0, 34, 124, 125, 29, 1, 204, 29, 0, 125, 126, 124, 125, 204, 0, 0, 0, 26, 24, 49, 4, 16, 127, 24, 46, 121, 127, 3, 0, 0, 64, 46, 0, 119, 0, 41, 0, 0, 25, 24, 0, 1, 27, 0, 0, 82, 128, 25, 0, 1, 204, 0, 0, 135, 129, 1, 0, 128, 204, 126, 0, 128, 204, 0, 0, 0, 130, 204, 0, 1, 204, 0, 0, 134, 131, 0, 0, 76, 231, 0, 0, 129, 130, 27, 204, 128, 204, 0, 0, 0, 132, 204, 0, 1, 204, 0, 0, 134, 133, 0, 0, 164, 223, 0, 0, 131, 132, 201, 204, 128, 204, 0, 0, 0, 134, 204, 0, 85, 25, 133, 0, 1, 204, 0, 0, 134, 135, 0, 0, 44, 231, 0, 0, 131, 132, 201, 204, 128, 204, 0, 0, 0, 136, 204, 0, 26, 23, 25, 4, 16, 137, 23, 46, 120, 137, 4, 0, 0, 25, 23, 0, 0, 27, 135, 0, 119, 0, 226, 255, 32, 204, 135, 0, 121, 204, 3, 0, 0, 64, 46, 0, 119, 0, 4, 0, 26, 138, 46, 4, 85, 138, 135, 0, 0, 64, 138, 0, 0, 65, 49, 0, 16, 139, 64, 65, 120, 139, 2, 0, 119, 0, 7, 0, 26, 140, 65, 4, 82, 141, 140, 0, 32, 204, 141, 0, 121, 204, 3, 0, 0, 65, 140, 0, 119, 0, 248, 255, 141, 204, 88, 1, 82, 142, 204, 0, 141, 204, 88, 1, 4, 207, 142, 126, 85, 204, 207, 0, 1, 207, 0, 0, 4, 204, 142, 126, 47, 207, 207, 204, 204, 7, 0, 0, 0, 46, 64, 0, 0, 49, 65, 0, 4, 125, 142, 126, 119, 0, 185, 255, 0, 45, 64, 0, 0, 48, 65, 0, 4, 109, 142, 126, 119, 0, 4, 0, 0, 45, 94, 0, 0, 48, 120, 0, 0, 109, 108, 0, 34, 143, 109, 0, 121, 143, 90, 0, 0, 73, 45, 0, 0, 75, 48, 0, 0, 145, 109, 0, 1, 207, 0, 0, 4, 144, 207, 145, 34, 207, 144, 9, 1, 204, 9, 0, 125, 146, 207, 144, 204, 0, 0, 0, 16, 147, 73, 75, 121, 147, 34, 0, 1, 22, 0, 0, 0, 47, 73, 0, 82, 150, 47, 0, 24, 204, 150, 146, 3, 151, 204, 22, 85, 47, 151, 0, 1, 204, 1, 0, 22, 204, 204, 146, 26, 204, 204, 1, 19, 204, 150, 204, 24, 207, 201, 146, 5, 152, 204, 207, 25, 153, 47, 4, 16, 154, 153, 75, 121, 154, 4, 0, 0, 22, 152, 0, 0, 47, 153, 0, 119, 0, 241, 255, 82, 155, 73, 0, 25, 156, 73, 4, 32, 207, 155, 0, 125, 9, 207, 156, 73, 0, 0, 0, 32, 207, 152, 0, 121, 207, 4, 0, 0, 11, 9, 0, 0, 81, 75, 0, 119, 0, 13, 0, 25, 157, 75, 4, 85, 75, 152, 0, 0, 11, 9, 0, 0, 81, 157, 0, 119, 0, 8, 0, 82, 148, 73, 0, 25, 149, 73, 4, 32, 207, 148, 0, 125, 10, 207, 149, 73, 0, 0, 0, 0, 11, 10, 0, 0, 81, 75, 0, 39, 207, 5, 32, 32, 207, 207, 102, 125, 158, 207, 94, 11, 0, 0, 0, 0, 159, 81, 0, 25, 204, 84, 25, 28, 204, 204, 9, 38, 204, 204, 255, 25, 204, 204, 1, 4, 206, 159, 158, 42, 206, 206, 2, 47, 204, 204, 206, 16, 9, 0, 0, 25, 204, 84, 25, 28, 204, 204, 9, 38, 204, 204, 255, 25, 204, 204, 1, 41, 204, 204, 2, 3, 204, 158, 204, 0, 207, 204, 0, 119, 0, 2, 0, 0, 207, 81, 0, 0, 13, 207, 0, 141, 207, 88, 1, 82, 160, 207, 0, 141, 207, 88, 1, 3, 204, 160, 146, 85, 207, 204, 0, 3, 204, 160, 146, 34, 204, 204, 0, 121, 204, 5, 0, 0, 73, 11, 0, 0, 75, 13, 0, 3, 145, 160, 146, 119, 0, 174, 255, 0, 72, 11, 0, 0, 74, 13, 0, 119, 0, 3, 0, 0, 72, 45, 0, 0, 74, 48, 0, 16, 161, 72, 74, 121, 161, 22, 0, 0, 162, 72, 0, 82, 163, 72, 0, 35, 204, 163, 10, 121, 204, 5, 0, 4, 204, 94, 162, 42, 204, 204, 2, 27, 53, 204, 9, 119, 0, 15, 0, 4, 204, 94, 162, 42, 204, 204, 2, 27, 32, 204, 9, 1, 39, 10, 0, 27, 164, 39, 10, 25, 165, 32, 1, 48, 204, 163, 164, 172, 9, 0, 0, 0, 53, 165, 0, 119, 0, 5, 0, 0, 32, 165, 0, 0, 39, 164, 0, 119, 0, 248, 255, 1, 53, 0, 0, 39, 204, 5, 32, 33, 204, 204, 102, 1, 207, 0, 0, 125, 166, 204, 53, 207, 0, 0, 0, 4, 207, 84, 166, 33, 204, 84, 0, 39, 206, 5, 32, 32, 206, 206, 103, 19, 204, 204, 206, 41, 204, 204, 31, 42, 204, 204, 31, 3, 167, 207, 204, 0, 169, 74, 0, 4, 204, 169, 94, 42, 204, 204, 2, 27, 204, 204, 9, 26, 204, 204, 9, 47, 204, 167, 204, 236, 12, 0, 0, 25, 204, 94, 4, 1, 207, 0, 36, 3, 207, 167, 207, 28, 207, 207, 9, 38, 207, 207, 255, 1, 206, 0, 4, 4, 207, 207, 206, 41, 207, 207, 2, 3, 170, 204, 207, 1, 207, 0, 36, 3, 207, 167, 207, 30, 207, 207, 9, 38, 207, 207, 255, 25, 207, 207, 1, 34, 207, 207, 9, 121, 207, 16, 0, 1, 207, 0, 36, 3, 207, 167, 207, 30, 207, 207, 9, 38, 207, 207, 255, 25, 38, 207, 1, 1, 57, 10, 0, 27, 171, 57, 10, 25, 37, 38, 1, 32, 207, 37, 9, 121, 207, 3, 0, 0, 56, 171, 0, 119, 0, 5, 0, 0, 38, 37, 0, 0, 57, 171, 0, 119, 0, 248, 255, 1, 56, 10, 0, 82, 172, 170, 0, 9, 207, 172, 56, 38, 207, 207, 255, 0, 173, 207, 0, 25, 207, 170, 4, 13, 174, 207, 74, 32, 207, 173, 0, 19, 207, 174, 207, 121, 207, 5, 0, 0, 80, 170, 0, 0, 82, 53, 0, 0, 103, 72, 0, 119, 0, 132, 0, 7, 207, 172, 56, 38, 207, 207, 255, 0, 175, 207, 0, 38, 204, 175, 1, 32, 204, 204, 0, 121, 204, 5, 0, 61, 204, 0, 0, 0, 0, 0, 90, 58, 207, 204, 0, 119, 0, 5, 0, 62, 204, 0, 0, 1, 0, 0, 0, 0, 0, 64, 67, 58, 207, 204, 0, 58, 86, 207, 0, 28, 207, 56, 2, 38, 207, 207, 255, 0, 176, 207, 0, 13, 204, 173, 176, 19, 204, 174, 204, 121, 204, 4, 0, 59, 204, 1, 0, 58, 207, 204, 0, 119, 0, 4, 0, 61, 204, 0, 0, 0, 0, 192, 63, 58, 207, 204, 0, 58, 95, 207, 0, 48, 204, 173, 176, 72, 11, 0, 0, 61, 204, 0, 0, 0, 0, 0, 63, 58, 207, 204, 0, 119, 0, 2, 0, 58, 207, 95, 0, 58, 15, 207, 0, 32, 177, 33, 0, 121, 177, 4, 0, 58, 41, 15, 0, 58, 42, 86, 0, 119, 0, 22, 0, 78, 178, 34, 0, 41, 204, 178, 24, 42, 204, 204, 24, 32, 204, 204, 45, 121, 204, 4, 0, 68, 204, 86, 0, 58, 207, 204, 0, 119, 0, 2, 0, 58, 207, 86, 0, 58, 14, 207, 0, 41, 204, 178, 24, 42, 204, 204, 24, 32, 204, 204, 45, 121, 204, 4, 0, 68, 204, 15, 0, 58, 207, 204, 0, 119, 0, 2, 0, 58, 207, 15, 0, 58, 8, 207, 0, 58, 41, 8, 0, 58, 42, 14, 0, 4, 207, 172, 173, 85, 170, 207, 0, 63, 179, 42, 41, 70, 180, 179, 42, 121, 180, 62, 0, 4, 207, 172, 173, 3, 181, 207, 56, 85, 170, 181, 0, 2, 207, 0, 0, 255, 201, 154, 59, 48, 207, 207, 181, 84, 12, 0, 0, 0, 90, 72, 0, 0, 113, 170, 0, 26, 182, 113, 4, 1, 207, 0, 0, 85, 113, 207, 0, 16, 183, 182, 90, 121, 183, 6, 0, 26, 184, 90, 4, 1, 207, 0, 0, 85, 184, 207, 0, 0, 97, 184, 0, 119, 0, 2, 0, 0, 97, 90, 0, 82, 185, 182, 0, 25, 207, 185, 1, 85, 182, 207, 0, 2, 207, 0, 0, 255, 201, 154, 59, 25, 204, 185, 1, 48, 207, 207, 204, 72, 12, 0, 0, 0, 90, 97, 0, 0, 113, 182, 0, 119, 0, 235, 255, 0, 89, 97, 0, 0, 112, 182, 0, 119, 0, 3, 0, 0, 89, 72, 0, 0, 112, 170, 0, 0, 186, 89, 0, 82, 187, 89, 0, 35, 207, 187, 10, 121, 207, 7, 0, 0, 80, 112, 0, 4, 207, 94, 186, 42, 207, 207, 2, 27, 82, 207, 9, 0, 103, 89, 0, 119, 0, 19, 0, 4, 207, 94, 186, 42, 207, 207, 2, 27, 67, 207, 9, 1, 69, 10, 0, 27, 188, 69, 10, 25, 189, 67, 1, 48, 207, 187, 188, 180, 12, 0, 0, 0, 80, 112, 0, 0, 82, 189, 0, 0, 103, 89, 0, 119, 0, 7, 0, 0, 67, 189, 0, 0, 69, 188, 0, 119, 0, 246, 255, 0, 80, 170, 0, 0, 82, 53, 0, 0, 103, 72, 0, 25, 190, 80, 4, 16, 191, 190, 74, 125, 12, 191, 190, 74, 0, 0, 0, 0, 92, 82, 0, 0, 102, 12, 0, 0, 104, 103, 0, 119, 0, 4, 0, 0, 92, 53, 0, 0, 102, 74, 0, 0, 104, 72, 0, 0, 100, 102, 0, 16, 192, 104, 100, 120, 192, 3, 0, 1, 105, 0, 0, 119, 0, 9, 0, 26, 193, 100, 4, 82, 194, 193, 0, 32, 207, 194, 0, 121, 207, 3, 0, 0, 100, 193, 0, 119, 0, 247, 255, 1, 105, 1, 0, 119, 0, 1, 0, 1, 207, 0, 0, 4, 195, 207, 92, 39, 207, 5, 32, 32, 207, 207, 103, 121, 207, 119, 0, 33, 207, 84, 0, 40, 207, 207, 1, 38, 207, 207, 1, 3, 85, 207, 84, 15, 196, 92, 85, 1, 207, 251, 255, 15, 197, 207, 92, 19, 207, 196, 197, 121, 207, 6, 0, 26, 207, 85, 1, 4, 198, 207, 92, 26, 21, 5, 1, 0, 61, 198, 0, 119, 0, 3, 0, 26, 21, 5, 2, 26, 61, 85, 1, 38, 207, 4, 8, 32, 207, 207, 0, 121, 207, 95, 0, 121, 105, 36, 0, 26, 199, 100, 4, 82, 207, 199, 0, 143, 207, 0, 1, 141, 207, 0, 1, 32, 207, 207, 0, 121, 207, 3, 0, 1, 68, 9, 0, 119, 0, 29, 0, 141, 207, 0, 1, 31, 207, 207, 10, 38, 207, 207, 255, 32, 207, 207, 0, 121, 207, 21, 0, 1, 55, 0, 0, 1, 76, 10, 0, 27, 207, 76, 10, 143, 207, 1, 1, 25, 207, 55, 1, 143, 207, 2, 1, 141, 207, 0, 1, 141, 204, 1, 1, 9, 207, 207, 204, 38, 207, 207, 255, 32, 207, 207, 0, 121, 207, 6, 0, 141, 207, 2, 1, 0, 55, 207, 0, 141, 207, 1, 1, 0, 76, 207, 0, 119, 0, 242, 255, 141, 207, 2, 1, 0, 68, 207, 0, 119, 0, 4, 0, 1, 68, 0, 0, 119, 0, 2, 0, 1, 68, 9, 0, 39, 204, 21, 32, 0, 207, 204, 0, 143, 207, 3, 1, 0, 207, 100, 0, 143, 207, 4, 1, 141, 207, 3, 1, 32, 207, 207, 102, 121, 207, 24, 0, 141, 204, 4, 1, 4, 204, 204, 94, 42, 204, 204, 2, 27, 204, 204, 9, 26, 204, 204, 9, 4, 207, 204, 68, 143, 207, 5, 1, 1, 207, 0, 0, 141, 204, 5, 1, 15, 207, 207, 204, 141, 204, 5, 1, 1, 206, 0, 0, 125, 87, 207, 204, 206, 0, 0, 0, 15, 206, 61, 87, 143, 206, 6, 1, 141, 206, 6, 1, 125, 62, 206, 61, 87, 0, 0, 0, 0, 44, 21, 0, 0, 71, 62, 0, 1, 111, 0, 0, 119, 0, 36, 0, 141, 204, 4, 1, 4, 204, 204, 94, 42, 204, 204, 2, 27, 204, 204, 9, 26, 204, 204, 9, 3, 206, 204, 92, 143, 206, 7, 1, 141, 204, 7, 1, 4, 206, 204, 68, 143, 206, 8, 1, 1, 206, 0, 0, 141, 204, 8, 1, 15, 206, 206, 204, 141, 204, 8, 1, 1, 207, 0, 0, 125, 88, 206, 204, 207, 0, 0, 0, 15, 207, 61, 88, 143, 207, 9, 1, 141, 207, 9, 1, 125, 63, 207, 61, 88, 0, 0, 0, 0, 44, 21, 0, 0, 71, 63, 0, 1, 111, 0, 0, 119, 0, 10, 0, 0, 44, 21, 0, 0, 71, 61, 0, 38, 207, 4, 8, 0, 111, 207, 0, 119, 0, 5, 0, 0, 44, 5, 0, 0, 71, 84, 0, 38, 207, 4, 8, 0, 111, 207, 0, 20, 204, 71, 111, 0, 207, 204, 0, 143, 207, 10, 1, 39, 204, 44, 32, 0, 207, 204, 0, 143, 207, 12, 1, 141, 207, 12, 1, 32, 207, 207, 102, 121, 207, 13, 0, 1, 204, 0, 0, 15, 207, 204, 92, 143, 207, 13, 1, 141, 204, 13, 1, 1, 206, 0, 0, 125, 207, 204, 92, 206, 0, 0, 0, 143, 207, 14, 1, 1, 66, 0, 0, 141, 207, 14, 1, 0, 107, 207, 0, 119, 0, 64, 0, 34, 207, 92, 0, 143, 207, 15, 1, 141, 206, 15, 1, 125, 207, 206, 195, 92, 0, 0, 0, 143, 207, 16, 1, 141, 206, 16, 1, 141, 204, 16, 1, 34, 204, 204, 0, 41, 204, 204, 31, 42, 204, 204, 31, 134, 207, 0, 0, 64, 151, 0, 0, 206, 204, 116, 0, 143, 207, 18, 1, 141, 207, 18, 1, 4, 207, 116, 207, 34, 207, 207, 2, 121, 207, 18, 0, 141, 207, 18, 1, 0, 52, 207, 0, 26, 207, 52, 1, 143, 207, 19, 1, 141, 207, 19, 1, 1, 204, 48, 0, 83, 207, 204, 0, 141, 204, 19, 1, 4, 204, 116, 204, 34, 204, 204, 2, 121, 204, 4, 0, 141, 204, 19, 1, 0, 52, 204, 0, 119, 0, 245, 255, 141, 204, 19, 1, 0, 51, 204, 0, 119, 0, 3, 0, 141, 204, 18, 1, 0, 51, 204, 0, 42, 207, 92, 31, 0, 204, 207, 0, 143, 204, 20, 1, 26, 204, 51, 1, 143, 204, 22, 1, 141, 204, 22, 1, 141, 207, 20, 1, 38, 207, 207, 2, 25, 207, 207, 43, 1, 206, 255, 0, 19, 207, 207, 206, 83, 204, 207, 0, 1, 204, 255, 0, 19, 204, 44, 204, 0, 207, 204, 0, 143, 207, 23, 1, 26, 207, 51, 2, 143, 207, 24, 1, 141, 207, 24, 1, 141, 204, 23, 1, 83, 207, 204, 0, 141, 204, 24, 1, 0, 66, 204, 0, 141, 204, 24, 1, 4, 107, 116, 204, 25, 204, 33, 1, 143, 204, 25, 1, 141, 207, 25, 1, 3, 204, 207, 71, 143, 204, 26, 1, 141, 207, 26, 1, 141, 206, 10, 1, 33, 206, 206, 0, 38, 206, 206, 1, 3, 207, 207, 206, 3, 204, 207, 107, 143, 204, 28, 1, 1, 207, 32, 0, 141, 206, 28, 1, 134, 204, 0, 0, 104, 201, 0, 0, 0, 207, 2, 206, 4, 0, 0, 0, 134, 204, 0, 0, 116, 229, 0, 0, 0, 34, 33, 0, 1, 206, 48, 0, 141, 207, 28, 1, 2, 205, 0, 0, 0, 0, 1, 0, 21, 205, 4, 205, 134, 204, 0, 0, 104, 201, 0, 0, 0, 206, 2, 207, 205, 0, 0, 0, 141, 204, 12, 1, 32, 204, 204, 102, 121, 204, 193, 0, 16, 204, 94, 104, 143, 204, 29, 1, 141, 204, 29, 1, 125, 26, 204, 94, 104, 0, 0, 0, 0, 91, 26, 0, 82, 204, 91, 0, 143, 204, 30, 1, 141, 205, 30, 1, 1, 207, 0, 0, 141, 206, 88, 1, 3, 206, 206, 200, 25, 206, 206, 9, 134, 204, 0, 0, 64, 151, 0, 0, 205, 207, 206, 0, 143, 204, 31, 1, 13, 204, 91, 26, 143, 204, 32, 1, 141, 204, 32, 1, 121, 204, 18, 0, 141, 204, 31, 1, 141, 206, 88, 1, 3, 206, 206, 200, 25, 206, 206, 9, 45, 204, 204, 206, 136, 17, 0, 0, 141, 204, 88, 1, 3, 204, 204, 200, 1, 206, 48, 0, 107, 204, 8, 206, 141, 206, 88, 1, 3, 206, 206, 200, 25, 40, 206, 8, 119, 0, 34, 0, 141, 206, 31, 1, 0, 40, 206, 0, 119, 0, 31, 0, 141, 206, 88, 1, 3, 206, 206, 200, 141, 204, 31, 1, 48, 206, 206, 204, 4, 18, 0, 0, 141, 204, 88, 1, 3, 204, 204, 200, 1, 207, 48, 0, 141, 205, 31, 1, 141, 203, 83, 1, 4, 205, 205, 203, 135, 206, 2, 0, 204, 207, 205, 0, 141, 206, 31, 1, 0, 19, 206, 0, 26, 206, 19, 1, 143, 206, 33, 1, 141, 206, 88, 1, 3, 206, 206, 200, 141, 205, 33, 1, 48, 206, 206, 205, 248, 17, 0, 0, 141, 206, 33, 1, 0, 19, 206, 0, 119, 0, 247, 255, 141, 206, 33, 1, 0, 40, 206, 0, 119, 0, 3, 0, 141, 206, 31, 1, 0, 40, 206, 0, 0, 206, 40, 0, 143, 206, 34, 1, 141, 205, 88, 1, 3, 205, 205, 200, 25, 205, 205, 9, 141, 207, 34, 1, 4, 205, 205, 207, 134, 206, 0, 0, 116, 229, 0, 0, 0, 40, 205, 0, 25, 206, 91, 4, 143, 206, 35, 1, 141, 206, 35, 1, 55, 206, 94, 206, 84, 18, 0, 0, 141, 206, 35, 1, 0, 91, 206, 0, 119, 0, 177, 255, 141, 206, 10, 1, 32, 206, 206, 0, 120, 206, 5, 0, 1, 205, 1, 0, 134, 206, 0, 0, 116, 229, 0, 0, 0, 202, 205, 0, 141, 205, 35, 1, 16, 206, 205, 100, 143, 206, 36, 1, 1, 205, 0, 0, 15, 206, 205, 71, 143, 206, 37, 1, 141, 206, 36, 1, 141, 205, 37, 1, 19, 206, 206, 205, 121, 206, 78, 0, 0, 79, 71, 0, 141, 206, 35, 1, 0, 98, 206, 0, 82, 206, 98, 0, 143, 206, 38, 1, 141, 205, 38, 1, 1, 207, 0, 0, 141, 204, 88, 1, 3, 204, 204, 200, 25, 204, 204, 9, 134, 206, 0, 0, 64, 151, 0, 0, 205, 207, 204, 0, 143, 206, 39, 1, 141, 206, 88, 1, 3, 206, 206, 200, 141, 204, 39, 1, 48, 206, 206, 204, 64, 19, 0, 0, 141, 204, 88, 1, 3, 204, 204, 200, 1, 207, 48, 0, 141, 205, 39, 1, 141, 203, 83, 1, 4, 205, 205, 203, 135, 206, 2, 0, 204, 207, 205, 0, 141, 206, 39, 1, 0, 18, 206, 0, 26, 206, 18, 1, 143, 206, 40, 1, 141, 206, 88, 1, 3, 206, 206, 200, 141, 205, 40, 1, 48, 206, 206, 205, 52, 19, 0, 0, 141, 206, 40, 1, 0, 18, 206, 0, 119, 0, 247, 255, 141, 206, 40, 1, 0, 17, 206, 0, 119, 0, 3, 0, 141, 206, 39, 1, 0, 17, 206, 0, 34, 206, 79, 9, 143, 206, 42, 1, 141, 205, 42, 1, 1, 207, 9, 0, 125, 206, 205, 79, 207, 0, 0, 0, 143, 206, 43, 1, 141, 207, 43, 1, 134, 206, 0, 0, 116, 229, 0, 0, 0, 17, 207, 0, 25, 206, 98, 4, 143, 206, 44, 1, 26, 206, 79, 9, 143, 206, 45, 1, 141, 207, 44, 1, 16, 206, 207, 100, 143, 206, 46, 1, 1, 207, 9, 0, 15, 206, 207, 79, 143, 206, 47, 1, 141, 206, 46, 1, 141, 207, 47, 1, 19, 206, 206, 207, 121, 206, 6, 0, 141, 206, 45, 1, 0, 79, 206, 0, 141, 206, 44, 1, 0, 98, 206, 0, 119, 0, 186, 255, 141, 206, 45, 1, 0, 78, 206, 0, 119, 0, 2, 0, 0, 78, 71, 0, 25, 206, 78, 9, 143, 206, 48, 1, 1, 207, 48, 0, 141, 205, 48, 1, 1, 204, 9, 0, 1, 203, 0, 0, 134, 206, 0, 0, 104, 201, 0, 0, 0, 207, 205, 204, 203, 0, 0, 0, 119, 0, 159, 0, 25, 206, 104, 4, 143, 206, 49, 1, 141, 206, 49, 1, 125, 101, 105, 100, 206, 0, 0, 0, 1, 203, 255, 255, 15, 206, 203, 71, 143, 206, 50, 1, 141, 206, 50, 1, 121, 206, 131, 0, 32, 206, 111, 0, 143, 206, 51, 1, 0, 96, 71, 0, 0, 99, 104, 0, 82, 206, 99, 0, 143, 206, 52, 1, 141, 203, 52, 1, 1, 204, 0, 0, 141, 205, 88, 1, 3, 205, 205, 200, 25, 205, 205, 9, 134, 206, 0, 0, 64, 151, 0, 0, 203, 204, 205, 0, 143, 206, 53, 1, 141, 206, 53, 1, 141, 205, 88, 1, 3, 205, 205, 200, 25, 205, 205, 9, 45, 206, 206, 205, 152, 20, 0, 0, 141, 206, 88, 1, 3, 206, 206, 200, 1, 205, 48, 0, 107, 206, 8, 205, 141, 205, 88, 1, 3, 205, 205, 200, 25, 16, 205, 8, 119, 0, 3, 0, 141, 205, 53, 1, 0, 16, 205, 0, 13, 205, 99, 104, 143, 205, 54, 1, 141, 205, 54, 1, 121, 205, 23, 0, 25, 205, 16, 1, 143, 205, 57, 1, 1, 206, 1, 0, 134, 205, 0, 0, 116, 229, 0, 0, 0, 16, 206, 0, 34, 205, 96, 1, 143, 205, 58, 1, 141, 205, 51, 1, 141, 206, 58, 1, 19, 205, 205, 206, 121, 205, 4, 0, 141, 205, 57, 1, 0, 59, 205, 0, 119, 0, 41, 0, 1, 206, 1, 0, 134, 205, 0, 0, 116, 229, 0, 0, 0, 202, 206, 0, 141, 205, 57, 1, 0, 59, 205, 0, 119, 0, 34, 0, 141, 206, 88, 1, 3, 206, 206, 200, 16, 205, 206, 16, 143, 205, 55, 1, 141, 205, 55, 1, 120, 205, 3, 0, 0, 59, 16, 0, 119, 0, 26, 0, 1, 206, 0, 0, 141, 204, 83, 1, 4, 206, 206, 204, 3, 205, 16, 206, 143, 205, 86, 1, 141, 206, 88, 1, 3, 206, 206, 200, 1, 204, 48, 0, 141, 203, 86, 1, 135, 205, 2, 0, 206, 204, 203, 0, 0, 58, 16, 0, 26, 205, 58, 1, 143, 205, 56, 1, 141, 205, 88, 1, 3, 205, 205, 200, 141, 203, 56, 1, 48, 205, 205, 203, 128, 21, 0, 0, 141, 205, 56, 1, 0, 58, 205, 0, 119, 0, 247, 255, 141, 205, 56, 1, 0, 59, 205, 0, 119, 0, 1, 0, 0, 205, 59, 0, 143, 205, 59, 1, 141, 203, 88, 1, 3, 203, 203, 200, 25, 203, 203, 9, 141, 204, 59, 1, 4, 205, 203, 204, 143, 205, 60, 1, 141, 204, 60, 1, 15, 205, 204, 96, 143, 205, 61, 1, 141, 204, 61, 1, 141, 203, 60, 1, 125, 205, 204, 203, 96, 0, 0, 0, 143, 205, 62, 1, 141, 203, 62, 1, 134, 205, 0, 0, 116, 229, 0, 0, 0, 59, 203, 0, 141, 203, 60, 1, 4, 205, 96, 203, 143, 205, 63, 1, 25, 205, 99, 4, 143, 205, 64, 1, 141, 205, 64, 1, 16, 205, 205, 101, 1, 203, 255, 255, 141, 204, 63, 1, 15, 203, 203, 204, 19, 205, 205, 203, 121, 205, 6, 0, 141, 205, 63, 1, 0, 96, 205, 0, 141, 205, 64, 1, 0, 99, 205, 0, 119, 0, 134, 255, 141, 205, 63, 1, 0, 83, 205, 0, 119, 0, 2, 0, 0, 83, 71, 0, 25, 205, 83, 18, 143, 205, 66, 1, 1, 203, 48, 0, 141, 204, 66, 1, 1, 206, 18, 0, 1, 207, 0, 0, 134, 205, 0, 0, 104, 201, 0, 0, 0, 203, 204, 206, 207, 0, 0, 0, 0, 205, 66, 0, 143, 205, 67, 1, 141, 207, 67, 1, 4, 207, 116, 207, 134, 205, 0, 0, 116, 229, 0, 0, 0, 66, 207, 0, 1, 207, 32, 0, 141, 206, 28, 1, 1, 204, 0, 32, 21, 204, 4, 204, 134, 205, 0, 0, 104, 201, 0, 0, 0, 207, 2, 206, 204, 0, 0, 0, 141, 205, 28, 1, 0, 114, 205, 0, 119, 0, 55, 0, 38, 204, 5, 32, 33, 204, 204, 0, 1, 206, 224, 14, 1, 207, 228, 14, 125, 205, 204, 206, 207, 0, 0, 0, 143, 205, 11, 1, 70, 207, 20, 20, 59, 206, 0, 0, 59, 204, 0, 0, 70, 206, 206, 204, 20, 207, 207, 206, 0, 205, 207, 0, 143, 205, 17, 1, 38, 207, 5, 32, 33, 207, 207, 0, 1, 206, 232, 14, 1, 204, 236, 14, 125, 205, 207, 206, 204, 0, 0, 0, 143, 205, 21, 1, 141, 205, 17, 1, 141, 204, 21, 1, 141, 206, 11, 1, 125, 30, 205, 204, 206, 0, 0, 0, 25, 206, 33, 3, 143, 206, 27, 1, 1, 204, 32, 0, 141, 205, 27, 1, 2, 207, 0, 0, 255, 255, 254, 255, 19, 207, 4, 207, 134, 206, 0, 0, 104, 201, 0, 0, 0, 204, 2, 205, 207, 0, 0, 0, 134, 206, 0, 0, 116, 229, 0, 0, 0, 34, 33, 0, 1, 207, 3, 0, 134, 206, 0, 0, 116, 229, 0, 0, 0, 30, 207, 0, 1, 207, 32, 0, 141, 205, 27, 1, 1, 204, 0, 32, 21, 204, 4, 204, 134, 206, 0, 0, 104, 201, 0, 0, 0, 207, 2, 205, 204, 0, 0, 0, 141, 206, 27, 1, 0, 114, 206, 0, 15, 206, 114, 2, 143, 206, 68, 1, 141, 206, 68, 1, 125, 93, 206, 2, 114, 0, 0, 0, 141, 206, 88, 1, 137, 206, 0, 0, 139, 93, 0, 0, 140, 5, 59, 1, 0, 0, 0, 0, 2, 200, 0, 0, 188, 14, 0, 0, 2, 201, 0, 0, 255, 0, 0, 0, 2, 202, 0, 0, 137, 40, 1, 0, 1, 203, 0, 0, 143, 203, 57, 1, 136, 204, 0, 0, 0, 203, 204, 0, 143, 203, 58, 1, 136, 203, 0, 0, 25, 203, 203, 64, 137, 203, 0, 0, 130, 203, 0, 0, 136, 204, 0, 0, 49, 203, 203, 204, 244, 23, 0, 0, 1, 204, 64, 0, 135, 203, 0, 0, 204, 0, 0, 0, 141, 203, 58, 1, 109, 203, 16, 1, 141, 203, 58, 1, 25, 203, 203, 24, 25, 81, 203, 40, 1, 22, 0, 0, 1, 23, 0, 0, 1, 33, 0, 0, 0, 133, 1, 0, 1, 203, 255, 255, 15, 101, 203, 23, 121, 101, 15, 0, 2, 203, 0, 0, 255, 255, 255, 127, 4, 105, 203, 23, 15, 109, 105, 22, 121, 109, 7, 0, 134, 115, 0, 0, 228, 231, 0, 0, 1, 203, 75, 0, 85, 115, 203, 0, 1, 42, 255, 255, 119, 0, 5, 0, 3, 123, 22, 23, 0, 42, 123, 0, 119, 0, 2, 0, 0, 42, 23, 0, 78, 127, 133, 0, 41, 203, 127, 24, 42, 203, 203, 24, 32, 203, 203, 0, 121, 203, 4, 0, 1, 203, 87, 0, 143, 203, 57, 1, 119, 0, 49, 5, 0, 140, 127, 0, 0, 152, 133, 0, 41, 203, 140, 24, 42, 203, 203, 24, 1, 204, 0, 0, 1, 205, 38, 0, 138, 203, 204, 205, 56, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 72, 25, 0, 0, 119, 0, 10, 0, 0, 24, 152, 0, 0, 204, 152, 0, 143, 204, 15, 1, 119, 0, 13, 0, 0, 25, 152, 0, 0, 164, 152, 0, 1, 204, 9, 0, 143, 204, 57, 1, 119, 0, 8, 0, 25, 143, 152, 1, 141, 203, 58, 1, 109, 203, 16, 143, 78, 72, 143, 0, 0, 140, 72, 0, 0, 152, 143, 0, 119, 0, 197, 255, 141, 203, 57, 1, 32, 203, 203, 9, 121, 203, 33, 0, 1, 203, 0, 0, 143, 203, 57, 1, 25, 157, 164, 1, 78, 169, 157, 0, 41, 203, 169, 24, 42, 203, 203, 24, 32, 203, 203, 37, 120, 203, 5, 0, 0, 24, 25, 0, 0, 203, 164, 0, 143, 203, 15, 1, 119, 0, 21, 0, 25, 184, 25, 1, 25, 194, 164, 2, 141, 203, 58, 1, 109, 203, 16, 194, 78, 203, 194, 0, 143, 203, 3, 1, 141, 203, 3, 1, 41, 203, 203, 24, 42, 203, 203, 24, 32, 203, 203, 37, 121, 203, 6, 0, 0, 25, 184, 0, 0, 164, 194, 0, 1, 203, 9, 0, 143, 203, 57, 1, 119, 0, 229, 255, 0, 24, 184, 0, 0, 203, 194, 0, 143, 203, 15, 1, 119, 0, 1, 0, 0, 203, 24, 0, 143, 203, 12, 1, 0, 203, 133, 0, 143, 203, 13, 1, 1, 203, 0, 0, 46, 203, 0, 203, 56, 26, 0, 0, 141, 204, 12, 1, 141, 205, 13, 1, 4, 204, 204, 205, 134, 203, 0, 0, 116, 229, 0, 0, 0, 133, 204, 0, 141, 203, 12, 1, 141, 204, 13, 1, 4, 203, 203, 204, 32, 203, 203, 0, 120, 203, 10, 0, 0, 34, 33, 0, 141, 203, 12, 1, 141, 204, 13, 1, 4, 22, 203, 204, 0, 23, 42, 0, 141, 204, 15, 1, 0, 133, 204, 0, 0, 33, 34, 0, 119, 0, 107, 255, 141, 203, 15, 1, 25, 204, 203, 1, 143, 204, 14, 1, 141, 203, 14, 1, 78, 204, 203, 0, 143, 204, 16, 1, 141, 204, 16, 1, 41, 204, 204, 24, 42, 204, 204, 24, 26, 204, 204, 48, 35, 204, 204, 10, 121, 204, 46, 0, 141, 203, 15, 1, 25, 204, 203, 2, 143, 204, 17, 1, 141, 203, 17, 1, 78, 204, 203, 0, 143, 204, 18, 1, 141, 203, 15, 1, 25, 204, 203, 3, 143, 204, 19, 1, 141, 204, 18, 1, 41, 204, 204, 24, 42, 204, 204, 24, 32, 204, 204, 36, 141, 203, 19, 1, 141, 205, 14, 1, 125, 66, 204, 203, 205, 0, 0, 0, 141, 205, 18, 1, 41, 205, 205, 24, 42, 205, 205, 24, 32, 205, 205, 36, 1, 203, 1, 0, 125, 9, 205, 203, 33, 0, 0, 0, 141, 204, 18, 1, 41, 204, 204, 24, 42, 204, 204, 24, 32, 204, 204, 36, 121, 204, 7, 0, 141, 204, 16, 1, 41, 204, 204, 24, 42, 204, 204, 24, 26, 204, 204, 48, 0, 205, 204, 0, 119, 0, 3, 0, 1, 204, 255, 255, 0, 205, 204, 0, 0, 203, 205, 0, 143, 203, 51, 1, 141, 203, 51, 1, 0, 27, 203, 0, 0, 48, 9, 0, 0, 203, 66, 0, 143, 203, 53, 1, 119, 0, 6, 0, 1, 27, 255, 255, 0, 48, 33, 0, 141, 205, 14, 1, 0, 203, 205, 0, 143, 203, 53, 1, 141, 203, 58, 1, 141, 205, 53, 1, 109, 203, 16, 205, 141, 203, 53, 1, 78, 205, 203, 0, 143, 205, 20, 1, 141, 205, 20, 1, 41, 205, 205, 24, 42, 205, 205, 24, 26, 205, 205, 32, 35, 205, 205, 32, 121, 205, 70, 0, 1, 32, 0, 0, 141, 203, 20, 1, 0, 205, 203, 0, 143, 205, 9, 1, 141, 203, 20, 1, 41, 203, 203, 24, 42, 203, 203, 24, 26, 205, 203, 32, 143, 205, 22, 1, 141, 203, 53, 1, 0, 205, 203, 0, 143, 205, 54, 1, 1, 203, 1, 0, 141, 204, 22, 1, 22, 203, 203, 204, 0, 205, 203, 0, 143, 205, 21, 1, 141, 205, 21, 1, 19, 205, 205, 202, 32, 205, 205, 0, 121, 205, 8, 0, 0, 31, 32, 0, 141, 205, 9, 1, 0, 71, 205, 0, 141, 203, 54, 1, 0, 205, 203, 0, 143, 205, 28, 1, 119, 0, 48, 0, 141, 203, 21, 1, 20, 203, 203, 32, 0, 205, 203, 0, 143, 205, 23, 1, 141, 203, 54, 1, 25, 205, 203, 1, 143, 205, 24, 1, 141, 205, 58, 1, 141, 203, 24, 1, 109, 205, 16, 203, 141, 205, 24, 1, 78, 203, 205, 0, 143, 203, 25, 1, 141, 203, 25, 1, 41, 203, 203, 24, 42, 203, 203, 24, 26, 203, 203, 32, 35, 203, 203, 32, 121, 203, 15, 0, 141, 203, 23, 1, 0, 32, 203, 0, 141, 205, 25, 1, 0, 203, 205, 0, 143, 203, 9, 1, 141, 205, 25, 1, 41, 205, 205, 24, 42, 205, 205, 24, 26, 203, 205, 32, 143, 203, 22, 1, 141, 205, 24, 1, 0, 203, 205, 0, 143, 203, 54, 1, 119, 0, 208, 255, 141, 203, 23, 1, 0, 31, 203, 0, 141, 203, 25, 1, 0, 71, 203, 0, 141, 205, 24, 1, 0, 203, 205, 0, 143, 203, 28, 1, 119, 0, 7, 0, 1, 31, 0, 0, 141, 203, 20, 1, 0, 71, 203, 0, 141, 205, 53, 1, 0, 203, 205, 0, 143, 203, 28, 1, 41, 205, 71, 24, 42, 205, 205, 24, 32, 203, 205, 42, 143, 203, 26, 1, 141, 203, 26, 1, 121, 203, 135, 0, 141, 205, 28, 1, 25, 203, 205, 1, 143, 203, 27, 1, 141, 205, 27, 1, 78, 203, 205, 0, 143, 203, 29, 1, 141, 203, 29, 1, 41, 203, 203, 24, 42, 203, 203, 24, 26, 203, 203, 48, 35, 203, 203, 10, 121, 203, 48, 0, 141, 205, 28, 1, 25, 203, 205, 2, 143, 203, 30, 1, 141, 205, 30, 1, 78, 203, 205, 0, 143, 203, 31, 1, 141, 203, 31, 1, 41, 203, 203, 24, 42, 203, 203, 24, 32, 203, 203, 36, 121, 203, 34, 0, 141, 203, 29, 1, 41, 203, 203, 24, 42, 203, 203, 24, 26, 203, 203, 48, 41, 203, 203, 2, 1, 205, 10, 0, 97, 4, 203, 205, 141, 203, 27, 1, 78, 205, 203, 0, 143, 205, 32, 1, 141, 203, 32, 1, 41, 203, 203, 24, 42, 203, 203, 24, 26, 203, 203, 48, 41, 203, 203, 3, 3, 205, 3, 203, 143, 205, 33, 1, 141, 203, 33, 1, 82, 205, 203, 0, 143, 205, 34, 1, 141, 203, 33, 1, 106, 205, 203, 4, 143, 205, 35, 1, 141, 203, 28, 1, 25, 205, 203, 3, 143, 205, 36, 1, 141, 205, 34, 1, 0, 30, 205, 0, 1, 59, 1, 0, 141, 203, 36, 1, 0, 205, 203, 0, 143, 205, 55, 1, 119, 0, 6, 0, 1, 205, 23, 0, 143, 205, 57, 1, 119, 0, 3, 0, 1, 205, 23, 0, 143, 205, 57, 1, 141, 205, 57, 1, 32, 205, 205, 23, 121, 205, 44, 0, 1, 205, 0, 0, 143, 205, 57, 1, 32, 205, 48, 0, 143, 205, 37, 1, 141, 205, 37, 1, 120, 205, 3, 0, 1, 12, 255, 255, 119, 0, 210, 3, 1, 205, 0, 0, 46, 205, 0, 205, 116, 30, 0, 0, 82, 205, 2, 0, 143, 205, 49, 1, 141, 203, 49, 1, 1, 204, 0, 0, 25, 204, 204, 4, 26, 204, 204, 1, 3, 203, 203, 204, 1, 204, 0, 0, 25, 204, 204, 4, 26, 204, 204, 1, 40, 204, 204, 255, 19, 203, 203, 204, 0, 205, 203, 0, 143, 205, 38, 1, 141, 203, 38, 1, 82, 205, 203, 0, 143, 205, 39, 1, 141, 205, 38, 1, 25, 205, 205, 4, 85, 2, 205, 0, 141, 205, 39, 1, 0, 30, 205, 0, 1, 59, 0, 0, 141, 203, 27, 1, 0, 205, 203, 0, 143, 205, 55, 1, 119, 0, 6, 0, 1, 30, 0, 0, 1, 59, 0, 0, 141, 203, 27, 1, 0, 205, 203, 0, 143, 205, 55, 1, 141, 205, 58, 1, 141, 203, 55, 1, 109, 205, 16, 203, 34, 203, 30, 0, 143, 203, 40, 1, 1, 205, 0, 32, 20, 205, 31, 205, 0, 203, 205, 0, 143, 203, 41, 1, 1, 205, 0, 0, 4, 203, 205, 30, 143, 203, 42, 1, 141, 203, 40, 1, 141, 205, 41, 1, 125, 8, 203, 205, 31, 0, 0, 0, 141, 205, 40, 1, 141, 203, 42, 1, 125, 7, 205, 203, 30, 0, 0, 0, 0, 45, 7, 0, 0, 46, 8, 0, 0, 64, 59, 0, 141, 205, 55, 1, 0, 203, 205, 0, 143, 203, 45, 1, 119, 0, 20, 0, 141, 205, 58, 1, 25, 205, 205, 16, 134, 203, 0, 0, 68, 207, 0, 0, 205, 0, 0, 0, 143, 203, 43, 1, 141, 203, 43, 1, 34, 203, 203, 0, 121, 203, 3, 0, 1, 12, 255, 255, 119, 0, 137, 3, 141, 203, 58, 1, 106, 73, 203, 16, 141, 203, 43, 1, 0, 45, 203, 0, 0, 46, 31, 0, 0, 64, 48, 0, 0, 203, 73, 0, 143, 203, 45, 1, 141, 205, 45, 1, 78, 203, 205, 0, 143, 203, 44, 1, 141, 203, 44, 1, 41, 203, 203, 24, 42, 203, 203, 24, 32, 203, 203, 46, 121, 203, 101, 0, 141, 205, 45, 1, 25, 203, 205, 1, 143, 203, 46, 1, 141, 205, 46, 1, 78, 203, 205, 0, 143, 203, 47, 1, 141, 203, 47, 1, 41, 203, 203, 24, 42, 203, 203, 24, 32, 203, 203, 42, 120, 203, 15, 0, 141, 203, 45, 1, 25, 89, 203, 1, 141, 203, 58, 1, 109, 203, 16, 89, 141, 203, 58, 1, 25, 203, 203, 16, 134, 90, 0, 0, 68, 207, 0, 0, 203, 0, 0, 0, 141, 203, 58, 1, 106, 75, 203, 16, 0, 28, 90, 0, 0, 74, 75, 0, 119, 0, 79, 0, 141, 205, 45, 1, 25, 203, 205, 2, 143, 203, 48, 1, 141, 203, 48, 1, 78, 77, 203, 0, 41, 203, 77, 24, 42, 203, 203, 24, 26, 203, 203, 48, 35, 203, 203, 10, 121, 203, 30, 0, 141, 203, 45, 1, 25, 78, 203, 3, 78, 79, 78, 0, 41, 203, 79, 24, 42, 203, 203, 24, 32, 203, 203, 36, 121, 203, 23, 0, 41, 203, 77, 24, 42, 203, 203, 24, 26, 203, 203, 48, 41, 203, 203, 2, 1, 205, 10, 0, 97, 4, 203, 205, 141, 205, 48, 1, 78, 80, 205, 0, 41, 205, 80, 24, 42, 205, 205, 24, 26, 205, 205, 48, 41, 205, 205, 3, 3, 82, 3, 205, 82, 83, 82, 0, 106, 84, 82, 4, 141, 205, 45, 1, 25, 85, 205, 4, 141, 205, 58, 1, 109, 205, 16, 85, 0, 28, 83, 0, 0, 74, 85, 0, 119, 0, 40, 0, 32, 86, 64, 0, 120, 86, 3, 0, 1, 12, 255, 255, 119, 0, 53, 3, 1, 205, 0, 0, 46, 205, 0, 205, 200, 32, 0, 0, 82, 205, 2, 0, 143, 205, 50, 1, 141, 205, 50, 1, 1, 203, 0, 0, 25, 203, 203, 4, 26, 203, 203, 1, 3, 205, 205, 203, 1, 203, 0, 0, 25, 203, 203, 4, 26, 203, 203, 1, 40, 203, 203, 255, 19, 205, 205, 203, 0, 87, 205, 0, 82, 88, 87, 0, 25, 205, 87, 4, 85, 2, 205, 0, 0, 205, 88, 0, 143, 205, 10, 1, 119, 0, 3, 0, 1, 205, 0, 0, 143, 205, 10, 1, 141, 205, 58, 1, 141, 203, 48, 1, 109, 205, 16, 203, 141, 203, 10, 1, 0, 28, 203, 0, 141, 203, 48, 1, 0, 74, 203, 0, 119, 0, 4, 0, 1, 28, 255, 255, 141, 203, 45, 1, 0, 74, 203, 0, 1, 26, 0, 0, 0, 92, 74, 0, 78, 91, 92, 0, 1, 203, 57, 0, 41, 205, 91, 24, 42, 205, 205, 24, 26, 205, 205, 65, 48, 203, 203, 205, 40, 33, 0, 0, 1, 12, 255, 255, 119, 0, 7, 3, 25, 93, 92, 1, 141, 203, 58, 1, 109, 203, 16, 93, 78, 94, 92, 0, 1, 203, 236, 12, 27, 205, 26, 58, 3, 203, 203, 205, 41, 205, 94, 24, 42, 205, 205, 24, 26, 205, 205, 65, 3, 95, 203, 205, 78, 96, 95, 0, 19, 205, 96, 201, 26, 205, 205, 1, 35, 205, 205, 8, 121, 205, 5, 0, 19, 205, 96, 201, 0, 26, 205, 0, 0, 92, 93, 0, 119, 0, 228, 255, 41, 205, 96, 24, 42, 205, 205, 24, 32, 205, 205, 0, 121, 205, 3, 0, 1, 12, 255, 255, 119, 0, 237, 2, 1, 205, 255, 255, 15, 97, 205, 27, 41, 205, 96, 24, 42, 205, 205, 24, 32, 205, 205, 19, 121, 205, 7, 0, 121, 97, 3, 0, 1, 12, 255, 255, 119, 0, 228, 2, 1, 205, 49, 0, 143, 205, 57, 1, 119, 0, 27, 0, 121, 97, 16, 0, 41, 205, 27, 2, 3, 98, 4, 205, 19, 205, 96, 201, 85, 98, 205, 0, 41, 205, 27, 3, 3, 99, 3, 205, 82, 100, 99, 0, 106, 102, 99, 4, 141, 205, 58, 1, 85, 205, 100, 0, 141, 205, 58, 1, 109, 205, 4, 102, 1, 205, 49, 0, 143, 205, 57, 1, 119, 0, 11, 0, 1, 205, 0, 0, 53, 205, 0, 205, 20, 34, 0, 0, 1, 12, 0, 0, 119, 0, 204, 2, 141, 203, 58, 1, 19, 204, 96, 201, 134, 205, 0, 0, 164, 56, 0, 0, 203, 204, 2, 0, 141, 205, 57, 1, 32, 205, 205, 49, 121, 205, 11, 0, 1, 205, 0, 0, 143, 205, 57, 1, 1, 205, 0, 0, 53, 205, 0, 205, 92, 34, 0, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 112, 253, 78, 103, 92, 0, 33, 104, 26, 0, 41, 204, 103, 24, 42, 204, 204, 24, 38, 204, 204, 15, 32, 204, 204, 3, 19, 204, 104, 204, 121, 204, 6, 0, 41, 204, 103, 24, 42, 204, 204, 24, 38, 204, 204, 223, 0, 205, 204, 0, 119, 0, 4, 0, 41, 204, 103, 24, 42, 204, 204, 24, 0, 205, 204, 0, 0, 17, 205, 0, 1, 205, 0, 32, 19, 205, 46, 205, 0, 106, 205, 0, 2, 205, 0, 0, 255, 255, 254, 255, 19, 205, 46, 205, 0, 107, 205, 0, 32, 205, 106, 0, 125, 47, 205, 46, 107, 0, 0, 0, 1, 204, 65, 0, 1, 203, 56, 0, 138, 17, 204, 203, 208, 35, 0, 0, 180, 35, 0, 0, 212, 35, 0, 0, 180, 35, 0, 0, 40, 36, 0, 0, 44, 36, 0, 0, 48, 36, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 52, 36, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 132, 36, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 136, 36, 0, 0, 180, 35, 0, 0, 140, 36, 0, 0, 208, 36, 0, 0, 136, 37, 0, 0, 180, 37, 0, 0, 184, 37, 0, 0, 180, 35, 0, 0, 188, 37, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 192, 37, 0, 0, 232, 37, 0, 0, 88, 39, 0, 0, 204, 39, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 252, 39, 0, 0, 180, 35, 0, 0, 40, 40, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 84, 40, 0, 0, 0, 49, 133, 0, 1, 50, 0, 0, 1, 51, 188, 14, 0, 54, 81, 0, 0, 69, 28, 0, 0, 70, 47, 0, 119, 0, 40, 1, 119, 0, 110, 0, 141, 204, 58, 1, 82, 170, 204, 0, 141, 204, 58, 1, 106, 171, 204, 4, 141, 204, 58, 1, 109, 204, 8, 170, 141, 204, 58, 1, 25, 204, 204, 8, 1, 205, 0, 0, 109, 204, 4, 205, 141, 205, 58, 1, 141, 204, 58, 1, 25, 204, 204, 8, 85, 205, 204, 0, 1, 67, 255, 255, 141, 205, 58, 1, 25, 204, 205, 8, 143, 204, 11, 1, 1, 204, 75, 0, 143, 204, 57, 1, 119, 0, 18, 1, 119, 0, 88, 0, 119, 0, 87, 0, 119, 0, 86, 0, 141, 204, 58, 1, 82, 76, 204, 0, 32, 172, 28, 0, 121, 172, 11, 0, 1, 205, 32, 0, 1, 203, 0, 0, 134, 204, 0, 0, 104, 201, 0, 0, 0, 205, 45, 203, 47, 0, 0, 0, 1, 20, 0, 0, 1, 204, 84, 0, 143, 204, 57, 1, 119, 0, 1, 1, 0, 67, 28, 0, 0, 204, 76, 0, 143, 204, 11, 1, 1, 204, 75, 0, 143, 204, 57, 1, 119, 0, 251, 0, 119, 0, 244, 0, 119, 0, 64, 0, 141, 204, 58, 1, 82, 158, 204, 0, 141, 204, 58, 1, 106, 159, 204, 4, 141, 204, 58, 1, 25, 204, 204, 24, 19, 205, 158, 201, 107, 204, 39, 205, 141, 205, 58, 1, 25, 205, 205, 24, 25, 49, 205, 39, 1, 50, 0, 0, 1, 51, 188, 14, 0, 54, 81, 0, 1, 69, 1, 0, 0, 70, 107, 0, 119, 0, 232, 0, 141, 205, 58, 1, 82, 138, 205, 0, 141, 205, 58, 1, 106, 139, 205, 4, 34, 205, 139, 0, 121, 205, 19, 0, 1, 205, 0, 0, 1, 204, 0, 0, 134, 141, 0, 0, 160, 230, 0, 0, 205, 204, 138, 139, 128, 204, 0, 0, 0, 142, 204, 0, 141, 204, 58, 1, 85, 204, 141, 0, 141, 204, 58, 1, 109, 204, 4, 142, 1, 16, 1, 0, 1, 18, 188, 14, 0, 144, 141, 0, 0, 145, 142, 0, 1, 204, 66, 0, 143, 204, 57, 1, 119, 0, 208, 0, 38, 204, 47, 1, 32, 204, 204, 0, 1, 205, 190, 14, 125, 5, 204, 200, 205, 0, 0, 0, 1, 205, 0, 8, 19, 205, 47, 205, 32, 205, 205, 0, 1, 204, 189, 14, 125, 6, 205, 5, 204, 0, 0, 0, 1, 204, 1, 8, 19, 204, 47, 204, 33, 204, 204, 0, 38, 204, 204, 1, 0, 16, 204, 0, 0, 18, 6, 0, 0, 144, 138, 0, 0, 145, 139, 0, 1, 204, 66, 0, 143, 204, 57, 1, 119, 0, 186, 0, 141, 204, 58, 1, 86, 190, 204, 0, 134, 191, 0, 0, 0, 0, 0, 0, 0, 190, 45, 28, 47, 17, 0, 0, 0, 22, 191, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 154, 252, 119, 0, 245, 255, 119, 0, 244, 255, 119, 0, 197, 255, 134, 160, 0, 0, 228, 231, 0, 0, 82, 161, 160, 0, 134, 162, 0, 0, 104, 230, 0, 0, 161, 0, 0, 0, 0, 35, 162, 0, 1, 205, 71, 0, 143, 205, 57, 1, 119, 0, 162, 0, 19, 204, 26, 201, 0, 205, 204, 0, 143, 205, 56, 1, 141, 205, 56, 1, 41, 205, 205, 24, 42, 205, 205, 24, 1, 204, 0, 0, 1, 203, 8, 0, 138, 205, 204, 203, 64, 38, 0, 0, 96, 38, 0, 0, 128, 38, 0, 0, 176, 38, 0, 0, 224, 38, 0, 0, 44, 38, 0, 0, 8, 39, 0, 0, 40, 39, 0, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 119, 252, 141, 204, 58, 1, 82, 111, 204, 0, 85, 111, 42, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 111, 252, 141, 204, 58, 1, 82, 112, 204, 0, 85, 112, 42, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 103, 252, 34, 113, 42, 0, 141, 204, 58, 1, 82, 114, 204, 0, 85, 114, 42, 0, 41, 203, 113, 31, 42, 203, 203, 31, 109, 114, 4, 203, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 91, 252, 2, 203, 0, 0, 255, 255, 0, 0, 19, 203, 42, 203, 0, 116, 203, 0, 141, 203, 58, 1, 82, 117, 203, 0, 84, 117, 116, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 79, 252, 19, 203, 42, 201, 0, 118, 203, 0, 141, 203, 58, 1, 82, 119, 203, 0, 83, 119, 118, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 69, 252, 141, 203, 58, 1, 82, 120, 203, 0, 85, 120, 42, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 61, 252, 34, 121, 42, 0, 141, 203, 58, 1, 82, 122, 203, 0, 85, 122, 42, 0, 41, 204, 121, 31, 42, 204, 204, 31, 109, 122, 4, 204, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 49, 252, 141, 205, 58, 1, 82, 134, 205, 0, 141, 205, 58, 1, 106, 135, 205, 4, 134, 136, 0, 0, 164, 208, 0, 0, 134, 135, 81, 0, 4, 205, 81, 136, 15, 137, 205, 28, 38, 204, 47, 8, 32, 204, 204, 0, 20, 204, 204, 137, 121, 204, 3, 0, 0, 205, 28, 0, 119, 0, 4, 0, 4, 204, 81, 136, 25, 204, 204, 1, 0, 205, 204, 0, 0, 29, 205, 0, 0, 13, 136, 0, 1, 37, 0, 0, 1, 39, 188, 14, 0, 55, 29, 0, 0, 68, 47, 0, 0, 150, 134, 0, 0, 153, 135, 0, 1, 205, 67, 0, 143, 205, 57, 1, 119, 0, 41, 0, 1, 205, 8, 0, 16, 124, 205, 28, 1, 205, 8, 0, 125, 125, 124, 28, 205, 0, 0, 0, 1, 38, 120, 0, 0, 44, 125, 0, 39, 205, 47, 8, 0, 63, 205, 0, 1, 205, 61, 0, 143, 205, 57, 1, 119, 0, 29, 0, 141, 205, 58, 1 ], eb + 0);
 HEAPU8.set([ 82, 163, 205, 0, 1, 205, 0, 0, 14, 205, 163, 205, 1, 204, 198, 14, 125, 165, 205, 163, 204, 0, 0, 0, 0, 35, 165, 0, 1, 204, 71, 0, 143, 204, 57, 1, 119, 0, 18, 0, 141, 204, 58, 1, 82, 108, 204, 0, 141, 204, 58, 1, 106, 110, 204, 4, 1, 16, 0, 0, 1, 18, 188, 14, 0, 144, 108, 0, 0, 145, 110, 0, 1, 204, 66, 0, 143, 204, 57, 1, 119, 0, 7, 0, 0, 38, 17, 0, 0, 44, 28, 0, 0, 63, 47, 0, 1, 205, 61, 0, 143, 205, 57, 1, 119, 0, 1, 0, 141, 204, 57, 1, 32, 204, 204, 61, 121, 204, 45, 0, 1, 204, 0, 0, 143, 204, 57, 1, 141, 204, 58, 1, 82, 126, 204, 0, 141, 204, 58, 1, 106, 128, 204, 4, 38, 204, 38, 32, 0, 129, 204, 0, 134, 130, 0, 0, 136, 206, 0, 0, 126, 128, 81, 129, 38, 204, 63, 8, 0, 131, 204, 0, 32, 203, 131, 0, 32, 205, 126, 0, 32, 206, 128, 0, 19, 205, 205, 206, 20, 203, 203, 205, 0, 204, 203, 0, 143, 204, 52, 1, 42, 204, 38, 4, 0, 132, 204, 0, 141, 203, 52, 1, 121, 203, 3, 0, 0, 204, 200, 0, 119, 0, 3, 0, 3, 203, 200, 132, 0, 204, 203, 0, 0, 60, 204, 0, 141, 204, 52, 1, 1, 203, 0, 0, 1, 205, 2, 0, 125, 61, 204, 203, 205, 0, 0, 0, 0, 13, 130, 0, 0, 37, 61, 0, 0, 39, 60, 0, 0, 55, 44, 0, 0, 68, 63, 0, 0, 150, 126, 0, 0, 153, 128, 0, 1, 205, 67, 0, 143, 205, 57, 1, 119, 0, 140, 0, 141, 205, 57, 1, 32, 205, 205, 66, 121, 205, 16, 0, 1, 205, 0, 0, 143, 205, 57, 1, 134, 146, 0, 0, 64, 151, 0, 0, 144, 145, 81, 0, 0, 13, 146, 0, 0, 37, 16, 0, 0, 39, 18, 0, 0, 55, 28, 0, 0, 68, 47, 0, 0, 150, 144, 0, 0, 153, 145, 0, 1, 205, 67, 0, 143, 205, 57, 1, 119, 0, 122, 0, 141, 205, 57, 1, 32, 205, 205, 71, 121, 205, 28, 0, 1, 205, 0, 0, 143, 205, 57, 1, 1, 205, 0, 0, 134, 166, 0, 0, 176, 98, 0, 0, 35, 205, 28, 0, 0, 167, 35, 0, 3, 168, 35, 28, 1, 203, 0, 0, 45, 203, 166, 203, 176, 41, 0, 0, 0, 205, 28, 0, 119, 0, 3, 0, 4, 203, 166, 167, 0, 205, 203, 0, 0, 62, 205, 0, 1, 205, 0, 0, 13, 205, 166, 205, 125, 43, 205, 168, 166, 0, 0, 0, 0, 49, 35, 0, 1, 50, 0, 0, 1, 51, 188, 14, 0, 54, 43, 0, 0, 69, 62, 0, 0, 70, 107, 0, 119, 0, 92, 0, 141, 205, 57, 1, 32, 205, 205, 75, 121, 205, 89, 0, 1, 205, 0, 0, 143, 205, 57, 1, 141, 205, 11, 1, 0, 15, 205, 0, 1, 21, 0, 0, 1, 41, 0, 0, 82, 173, 15, 0, 32, 205, 173, 0, 121, 205, 4, 0, 0, 19, 21, 0, 0, 53, 41, 0, 119, 0, 25, 0, 141, 205, 58, 1, 25, 205, 205, 20, 134, 174, 0, 0, 40, 230, 0, 0, 205, 173, 0, 0, 4, 175, 67, 21, 34, 205, 174, 0, 16, 203, 175, 174, 20, 205, 205, 203, 121, 205, 4, 0, 0, 19, 21, 0, 0, 53, 174, 0, 119, 0, 12, 0, 25, 176, 15, 4, 3, 177, 174, 21, 16, 178, 177, 67, 121, 178, 5, 0, 0, 15, 176, 0, 0, 21, 177, 0, 0, 41, 174, 0, 119, 0, 230, 255, 0, 19, 177, 0, 0, 53, 174, 0, 119, 0, 1, 0, 34, 179, 53, 0, 121, 179, 3, 0, 1, 12, 255, 255, 119, 0, 172, 0, 1, 203, 32, 0, 134, 205, 0, 0, 104, 201, 0, 0, 0, 203, 45, 19, 47, 0, 0, 0, 32, 180, 19, 0, 121, 180, 5, 0, 1, 20, 0, 0, 1, 205, 84, 0, 143, 205, 57, 1, 119, 0, 38, 0, 141, 205, 11, 1, 0, 36, 205, 0, 1, 40, 0, 0, 82, 181, 36, 0, 32, 205, 181, 0, 121, 205, 5, 0, 0, 20, 19, 0, 1, 205, 84, 0, 143, 205, 57, 1, 119, 0, 28, 0, 141, 205, 58, 1, 25, 205, 205, 20, 134, 182, 0, 0, 40, 230, 0, 0, 205, 181, 0, 0, 3, 183, 182, 40, 15, 185, 19, 183, 121, 185, 5, 0, 0, 20, 19, 0, 1, 205, 84, 0, 143, 205, 57, 1, 119, 0, 16, 0, 25, 186, 36, 4, 141, 203, 58, 1, 25, 203, 203, 20, 134, 205, 0, 0, 116, 229, 0, 0, 0, 203, 182, 0, 16, 187, 183, 19, 121, 187, 4, 0, 0, 36, 186, 0, 0, 40, 183, 0, 119, 0, 227, 255, 0, 20, 19, 0, 1, 205, 84, 0, 143, 205, 57, 1, 119, 0, 1, 0, 141, 205, 57, 1, 32, 205, 205, 67, 121, 205, 46, 0, 1, 205, 0, 0, 143, 205, 57, 1, 1, 205, 255, 255, 15, 147, 205, 55, 2, 205, 0, 0, 255, 255, 254, 255, 19, 205, 68, 205, 0, 148, 205, 0, 125, 10, 147, 148, 68, 0, 0, 0, 33, 149, 150, 0, 33, 151, 153, 0, 33, 154, 55, 0, 0, 155, 13, 0, 20, 205, 149, 151, 40, 205, 205, 1, 38, 205, 205, 1, 4, 203, 81, 155, 3, 205, 205, 203, 15, 156, 205, 55, 121, 156, 3, 0, 0, 205, 55, 0, 119, 0, 7, 0, 20, 203, 149, 151, 40, 203, 203, 1, 38, 203, 203, 1, 4, 204, 81, 155, 3, 203, 203, 204, 0, 205, 203, 0, 0, 56, 205, 0, 20, 205, 149, 151, 20, 205, 154, 205, 125, 57, 205, 56, 55, 0, 0, 0, 20, 205, 149, 151, 20, 205, 154, 205, 125, 14, 205, 13, 81, 0, 0, 0, 0, 49, 14, 0, 0, 50, 37, 0, 0, 51, 39, 0, 0, 54, 81, 0, 0, 69, 57, 0, 0, 70, 10, 0, 119, 0, 21, 0, 141, 205, 57, 1, 32, 205, 205, 84, 121, 205, 18, 0, 1, 205, 0, 0, 143, 205, 57, 1, 1, 203, 32, 0, 1, 204, 0, 32, 21, 204, 47, 204, 134, 205, 0, 0, 104, 201, 0, 0, 0, 203, 45, 20, 204, 0, 0, 0, 15, 188, 20, 45, 125, 189, 188, 45, 20, 0, 0, 0, 0, 22, 189, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 238, 250, 0, 192, 54, 0, 0, 193, 49, 0, 4, 205, 192, 193, 15, 195, 69, 205, 121, 195, 4, 0, 4, 204, 192, 193, 0, 205, 204, 0, 119, 0, 2, 0, 0, 205, 69, 0, 0, 11, 205, 0, 3, 196, 11, 50, 15, 197, 45, 196, 125, 58, 197, 196, 45, 0, 0, 0, 1, 204, 32, 0, 134, 205, 0, 0, 104, 201, 0, 0, 0, 204, 58, 196, 70, 0, 0, 0, 134, 205, 0, 0, 116, 229, 0, 0, 0, 51, 50, 0, 2, 205, 0, 0, 0, 0, 1, 0, 21, 205, 70, 205, 0, 198, 205, 0, 1, 204, 48, 0, 134, 205, 0, 0, 104, 201, 0, 0, 0, 204, 58, 196, 198, 0, 0, 0, 1, 204, 48, 0, 4, 203, 192, 193, 1, 206, 0, 0, 134, 205, 0, 0, 104, 201, 0, 0, 0, 204, 11, 203, 206, 0, 0, 0, 4, 206, 192, 193, 134, 205, 0, 0, 116, 229, 0, 0, 0, 49, 206, 0, 1, 205, 0, 32, 21, 205, 70, 205, 0, 199, 205, 0, 1, 206, 32, 0, 134, 205, 0, 0, 104, 201, 0, 0, 0, 206, 58, 196, 199, 0, 0, 0, 0, 22, 58, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 183, 250, 141, 205, 57, 1, 32, 205, 205, 87, 121, 205, 62, 0, 1, 205, 0, 0, 45, 205, 0, 205, 60, 46, 0, 0, 32, 205, 33, 0, 143, 205, 0, 1, 141, 205, 0, 1, 121, 205, 3, 0, 1, 12, 0, 0, 119, 0, 53, 0, 1, 52, 1, 0, 41, 206, 52, 2, 3, 205, 4, 206, 143, 205, 1, 1, 141, 206, 1, 1, 82, 205, 206, 0, 143, 205, 2, 1, 141, 205, 2, 1, 32, 205, 205, 0, 121, 205, 3, 0, 0, 65, 52, 0, 119, 0, 19, 0, 41, 206, 52, 3, 3, 205, 3, 206, 143, 205, 4, 1, 141, 206, 4, 1, 141, 203, 2, 1, 134, 205, 0, 0, 164, 56, 0, 0, 206, 203, 2, 0, 25, 205, 52, 1, 143, 205, 5, 1, 141, 205, 5, 1, 34, 205, 205, 10, 121, 205, 4, 0, 141, 205, 5, 1, 0, 52, 205, 0, 119, 0, 230, 255, 1, 12, 1, 0, 119, 0, 23, 0, 41, 203, 65, 2, 3, 205, 4, 203, 143, 205, 7, 1, 141, 203, 7, 1, 82, 205, 203, 0, 143, 205, 8, 1, 25, 205, 65, 1, 143, 205, 6, 1, 141, 205, 8, 1, 32, 205, 205, 0, 120, 205, 3, 0, 1, 12, 255, 255, 119, 0, 10, 0, 141, 205, 6, 1, 34, 205, 205, 10, 121, 205, 4, 0, 141, 205, 6, 1, 0, 65, 205, 0, 119, 0, 238, 255, 1, 12, 1, 0, 119, 0, 2, 0, 0, 12, 42, 0, 141, 205, 58, 1, 137, 205, 0, 0, 139, 12, 0, 0, 140, 5, 127, 0, 0, 0, 0, 0, 2, 122, 0, 0, 32, 1, 0, 0, 2, 123, 0, 0, 192, 0, 0, 0, 2, 124, 0, 0, 224, 1, 0, 0, 1, 120, 0, 0, 136, 125, 0, 0, 0, 121, 125, 0, 136, 125, 0, 0, 1, 126, 176, 0, 3, 125, 125, 126, 137, 125, 0, 0, 130, 125, 0, 0, 136, 126, 0, 0, 49, 125, 125, 126, 164, 46, 0, 0, 1, 126, 176, 0, 135, 125, 0, 0, 126, 0, 0, 0, 1, 125, 128, 0, 3, 116, 121, 125, 25, 114, 121, 120, 25, 113, 121, 112, 25, 112, 121, 104, 25, 111, 121, 96, 25, 110, 121, 88, 25, 109, 121, 80, 25, 108, 121, 72, 25, 107, 121, 64, 25, 106, 121, 56, 25, 105, 121, 48, 25, 119, 121, 40, 25, 118, 121, 32, 25, 117, 121, 24, 25, 115, 121, 16, 25, 104, 121, 8, 0, 103, 121, 0, 1, 125, 144, 0, 3, 13, 121, 125, 1, 125, 136, 0, 3, 14, 121, 125, 0, 59, 0, 0, 0, 70, 1, 0, 0, 81, 2, 0, 0, 92, 3, 0, 0, 5, 4, 0, 1, 9, 0, 0, 1, 10, 0, 0, 0, 15, 59, 0, 1, 125, 255, 0, 19, 125, 15, 125, 0, 16, 125, 0, 1, 125, 41, 0, 1, 126, 52, 0, 138, 16, 125, 126, 8, 48, 0, 0, 144, 48, 0, 0, 252, 48, 0, 0, 156, 49, 0, 0, 40, 50, 0, 0, 176, 50, 0, 0, 4, 48, 0, 0, 52, 51, 0, 0, 212, 51, 0, 0, 36, 52, 0, 0, 172, 52, 0, 0, 56, 53, 0, 0, 164, 53, 0, 0, 244, 53, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 96, 54, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 4, 48, 0, 0, 232, 54, 0, 0, 119, 0, 213, 1, 1, 126, 184, 5, 134, 125, 0, 0, 248, 219, 0, 0, 126, 103, 0, 0, 1, 125, 6, 0, 134, 17, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 17, 3, 0, 1, 9, 1, 0, 119, 0, 202, 1, 1, 9, 0, 0, 1, 125, 8, 0, 134, 18, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 18, 3, 0, 1, 11, 54, 0, 119, 0, 194, 1, 1, 125, 208, 0, 134, 19, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 19, 3, 0, 1, 11, 53, 0, 119, 0, 187, 1, 134, 20, 0, 0, 140, 90, 0, 0, 122, 0, 0, 0, 121, 20, 3, 0, 1, 11, 92, 0, 119, 0, 181, 1, 1, 10, 1, 0, 119, 0, 179, 1, 1, 126, 199, 5, 134, 125, 0, 0, 248, 219, 0, 0, 126, 104, 0, 0, 1, 125, 138, 0, 134, 21, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 21, 3, 0, 1, 9, 1, 0, 119, 0, 168, 1, 1, 9, 0, 0, 1, 125, 84, 0, 134, 22, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 22, 3, 0, 1, 11, 53, 0, 119, 0, 160, 1, 134, 23, 0, 0, 140, 90, 0, 0, 122, 0, 0, 0, 121, 23, 3, 0, 1, 11, 92, 0, 119, 0, 154, 1, 1, 10, 1, 0, 119, 0, 152, 1, 1, 126, 214, 5, 134, 125, 0, 0, 248, 219, 0, 0, 126, 115, 0, 0, 1, 125, 24, 0, 134, 24, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 24, 3, 0, 1, 9, 1, 0, 119, 0, 141, 1, 1, 9, 0, 0, 1, 125, 2, 0, 134, 25, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 25, 3, 0, 1, 11, 49, 0, 119, 0, 133, 1, 1, 125, 4, 0, 134, 26, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 26, 3, 0, 1, 11, 53, 0, 119, 0, 126, 1, 134, 27, 0, 0, 140, 90, 0, 0, 122, 0, 0, 0, 121, 27, 3, 0, 1, 11, 92, 0, 119, 0, 120, 1, 134, 28, 0, 0, 140, 90, 0, 0, 123, 0, 0, 0, 121, 28, 3, 0, 1, 11, 52, 0, 119, 0, 114, 1, 1, 10, 1, 0, 119, 0, 112, 1, 1, 126, 229, 5, 134, 125, 0, 0, 248, 219, 0, 0, 126, 117, 0, 0, 1, 125, 236, 0, 134, 29, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 29, 3, 0, 1, 9, 1, 0, 119, 0, 101, 1, 1, 9, 0, 0, 1, 125, 2, 0, 134, 30, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 30, 3, 0, 1, 11, 53, 0, 119, 0, 93, 1, 1, 125, 16, 0, 134, 31, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 31, 3, 0, 1, 11, 52, 0, 119, 0, 86, 1, 1, 125, 0, 1, 134, 32, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 32, 3, 0, 1, 11, 92, 0, 119, 0, 79, 1, 1, 10, 1, 0, 119, 0, 77, 1, 1, 126, 244, 5, 134, 125, 0, 0, 248, 219, 0, 0, 126, 118, 0, 0, 134, 33, 0, 0, 140, 90, 0, 0, 124, 0, 0, 0, 121, 33, 3, 0, 1, 9, 1, 0, 119, 0, 67, 1, 1, 9, 0, 0, 1, 125, 2, 0, 134, 34, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 34, 3, 0, 1, 11, 53, 0, 119, 0, 59, 1, 1, 125, 12, 0, 134, 35, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 35, 3, 0, 1, 11, 92, 0, 119, 0, 52, 1, 1, 125, 16, 0, 134, 36, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 36, 3, 0, 1, 11, 52, 0, 119, 0, 45, 1, 1, 10, 1, 0, 119, 0, 43, 1, 1, 126, 3, 6, 134, 125, 0, 0, 248, 219, 0, 0, 126, 119, 0, 0, 1, 125, 28, 0, 134, 37, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 37, 3, 0, 1, 9, 1, 0, 119, 0, 32, 1, 1, 9, 0, 0, 1, 125, 2, 0, 134, 38, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 38, 3, 0, 1, 11, 49, 0, 119, 0, 24, 1, 134, 39, 0, 0, 140, 90, 0, 0, 122, 0, 0, 0, 121, 39, 3, 0, 1, 11, 92, 0, 119, 0, 18, 1, 134, 40, 0, 0, 140, 90, 0, 0, 123, 0, 0, 0, 121, 40, 3, 0, 1, 11, 52, 0, 119, 0, 12, 1, 1, 10, 1, 0, 119, 0, 10, 1, 1, 126, 18, 6, 134, 125, 0, 0, 248, 219, 0, 0, 126, 105, 0, 0, 1, 125, 16, 0, 134, 41, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 41, 3, 0, 1, 9, 1, 0, 119, 0, 255, 0, 1, 9, 0, 0, 1, 125, 2, 0, 134, 42, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 42, 3, 0, 1, 11, 49, 0, 119, 0, 247, 0, 1, 125, 12, 0, 134, 43, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 43, 3, 0, 1, 11, 46, 0, 119, 0, 240, 0, 134, 44, 0, 0, 140, 90, 0, 0, 122, 0, 0, 0, 121, 44, 3, 0, 1, 11, 92, 0, 119, 0, 234, 0, 134, 45, 0, 0, 140, 90, 0, 0, 123, 0, 0, 0, 121, 45, 3, 0, 1, 11, 52, 0, 119, 0, 228, 0, 1, 10, 1, 0, 119, 0, 226, 0, 1, 126, 33, 6, 134, 125, 0, 0, 248, 219, 0, 0, 126, 106, 0, 0, 1, 125, 222, 0, 134, 46, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 46, 3, 0, 1, 9, 1, 0, 119, 0, 215, 0, 1, 9, 0, 0, 134, 47, 0, 0, 140, 90, 0, 0, 122, 0, 0, 0, 121, 47, 3, 0, 1, 11, 92, 0, 119, 0, 208, 0, 1, 10, 1, 0, 119, 0, 206, 0, 1, 126, 48, 6, 134, 125, 0, 0, 248, 219, 0, 0, 126, 107, 0, 0, 1, 125, 204, 0, 134, 49, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 49, 3, 0, 1, 9, 1, 0, 119, 0, 195, 0, 1, 9, 0, 0, 1, 125, 2, 0, 134, 50, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 50, 3, 0, 1, 11, 49, 0, 119, 0, 187, 0, 1, 125, 16, 0, 134, 51, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 51, 3, 0, 1, 11, 53, 0, 119, 0, 180, 0, 134, 52, 0, 0, 140, 90, 0, 0, 122, 0, 0, 0, 121, 52, 3, 0, 1, 11, 92, 0, 119, 0, 174, 0, 1, 10, 1, 0, 119, 0, 172, 0, 1, 126, 64, 6, 134, 125, 0, 0, 248, 219, 0, 0, 126, 108, 0, 0, 1, 125, 198, 1, 134, 53, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 53, 3, 0, 1, 9, 1, 0, 119, 0, 161, 0, 1, 9, 0, 0, 1, 125, 8, 0, 134, 54, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 54, 3, 0, 1, 11, 52, 0, 119, 0, 153, 0, 1, 125, 16, 0, 134, 55, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 55, 3, 0, 1, 11, 53, 0, 119, 0, 146, 0, 1, 125, 32, 0, 134, 56, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 56, 3, 0, 1, 11, 92, 0, 119, 0, 139, 0, 1, 10, 1, 0, 119, 0, 137, 0, 1, 126, 80, 6, 134, 125, 0, 0, 248, 219, 0, 0, 126, 109, 0, 0, 1, 125, 220, 0, 134, 57, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 57, 3, 0, 1, 9, 1, 0, 119, 0, 126, 0, 1, 9, 0, 0, 1, 125, 2, 0, 134, 58, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 58, 3, 0, 1, 11, 53, 0, 119, 0, 118, 0, 134, 60, 0, 0, 140, 90, 0, 0, 122, 0, 0, 0, 121, 60, 3, 0, 1, 11, 92, 0, 119, 0, 112, 0, 1, 10, 1, 0, 119, 0, 110, 0, 1, 126, 96, 6, 134, 125, 0, 0, 248, 219, 0, 0, 126, 110, 0, 0, 1, 125, 222, 0, 134, 61, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 61, 3, 0, 1, 9, 1, 0, 119, 0, 99, 0, 1, 9, 0, 0, 134, 62, 0, 0, 140, 90, 0, 0, 122, 0, 0, 0, 121, 62, 3, 0, 1, 11, 92, 0, 119, 0, 92, 0, 1, 10, 1, 0, 119, 0, 90, 0, 1, 126, 112, 6, 134, 125, 0, 0, 248, 219, 0, 0, 126, 111, 0, 0, 1, 125, 10, 0, 134, 63, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 63, 3, 0, 1, 9, 1, 0, 119, 0, 79, 0, 1, 9, 0, 0, 1, 125, 212, 0, 134, 64, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 64, 3, 0, 1, 11, 53, 0, 119, 0, 71, 0, 134, 65, 0, 0, 140, 90, 0, 0, 122, 0, 0, 0, 121, 65, 3, 0, 1, 11, 92, 0, 119, 0, 65, 0, 1, 10, 1, 0, 119, 0, 63, 0, 1, 126, 128, 6, 134, 125, 0, 0, 248, 219, 0, 0, 126, 112, 0, 0, 134, 66, 0, 0, 140, 90, 0, 0, 124, 0, 0, 0, 121, 66, 3, 0, 1, 9, 1, 0, 119, 0, 53, 0, 1, 9, 0, 0, 1, 125, 2, 0, 134, 67, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 67, 3, 0, 1, 11, 53, 0, 119, 0, 45, 0, 1, 125, 12, 0, 134, 68, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 68, 3, 0, 1, 11, 92, 0, 119, 0, 38, 0, 1, 125, 16, 0, 134, 69, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 69, 3, 0, 1, 11, 52, 0, 119, 0, 31, 0, 1, 10, 1, 0, 119, 0, 29, 0, 1, 126, 144, 6, 134, 125, 0, 0, 248, 219, 0, 0, 126, 113, 0, 0, 1, 125, 236, 1, 134, 71, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 71, 3, 0, 1, 9, 1, 0, 119, 0, 18, 0, 1, 9, 0, 0, 1, 125, 2, 0, 134, 72, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 72, 3, 0, 1, 11, 53, 0, 119, 0, 10, 0, 1, 125, 16, 0, 134, 73, 0, 0, 140, 90, 0, 0, 125, 0, 0, 0, 121, 73, 3, 0, 1, 11, 52, 0, 119, 0, 3, 0, 1, 10, 1, 0, 119, 0, 1, 0, 0, 74, 10, 0, 38, 125, 74, 1, 0, 75, 125, 0, 0, 76, 59, 0, 121, 75, 13, 0, 1, 125, 255, 0, 19, 125, 76, 125, 0, 77, 125, 0, 85, 114, 77, 0, 1, 126, 161, 6, 134, 125, 0, 0, 248, 219, 0, 0, 126, 114, 0, 0, 1, 48, 10, 0, 0, 8, 48, 0, 137, 121, 0, 0, 139, 8, 0, 0, 134, 125, 0, 0, 164, 133, 0, 0, 14, 76, 0, 0, 82, 125, 14, 0, 85, 13, 125, 0, 106, 126, 14, 4, 109, 13, 4, 126, 0, 78, 9, 0, 38, 126, 78, 1, 0, 79, 126, 0, 121, 79, 16, 0, 82, 80, 13, 0, 25, 82, 13, 4, 82, 83, 82, 0, 0, 84, 70, 0, 0, 85, 81, 0, 0, 86, 92, 0, 0, 87, 5, 0, 134, 88, 0, 0, 108, 85, 0, 0, 80, 83, 84, 85, 86, 87, 0, 0, 0, 48, 88, 0, 0, 8, 48, 0, 137, 121, 0, 0, 139, 8, 0, 0, 1, 125, 209, 6, 134, 126, 0, 0, 248, 219, 0, 0, 125, 116, 0, 0, 0, 89, 11, 0, 0, 90, 70, 0, 0, 91, 81, 0, 0, 93, 92, 0, 0, 94, 5, 0, 134, 95, 0, 0, 76, 46, 0, 0, 89, 90, 91, 93, 94, 0, 0, 0, 0, 12, 95, 0, 0, 96, 12, 0, 41, 126, 96, 24, 42, 126, 126, 24, 33, 97, 126, 0, 121, 97, 7, 0, 0, 98, 12, 0, 0, 48, 98, 0, 0, 8, 48, 0, 137, 121, 0, 0, 139, 8, 0, 0, 119, 0, 14, 0, 0, 99, 59, 0, 0, 100, 70, 0, 0, 101, 81, 0, 0, 102, 92, 0, 0, 6, 5, 0, 134, 7, 0, 0, 76, 46, 0, 0, 99, 100, 101, 102, 6, 0, 0, 0, 0, 48, 7, 0, 0, 8, 48, 0, 137, 121, 0, 0, 139, 8, 0, 0, 1, 126, 0, 0, 139, 126, 0, 0, 140, 3, 195, 0, 0, 0, 0, 0, 2, 191, 0, 0, 255, 255, 0, 0, 2, 192, 0, 0, 255, 0, 0, 0, 1, 189, 0, 0, 136, 193, 0, 0, 0, 190, 193, 0, 1, 193, 20, 0, 16, 42, 193, 1, 120, 42, 38, 1, 1, 193, 9, 0, 1, 194, 10, 0, 138, 1, 193, 194, 12, 57, 0, 0, 96, 57, 0, 0, 216, 57, 0, 0, 68, 58, 0, 0, 192, 58, 0, 0, 76, 59, 0, 0, 192, 59, 0, 0, 76, 60, 0, 0, 192, 60, 0, 0, 20, 61, 0, 0, 119, 0, 24, 1, 82, 119, 2, 0, 0, 53, 119, 0, 1, 193, 0, 0, 25, 64, 193, 4, 0, 140, 64, 0, 26, 139, 140, 1, 3, 75, 53, 139, 1, 193, 0, 0, 25, 86, 193, 4, 0, 143, 86, 0, 26, 142, 143, 1, 40, 193, 142, 255, 0, 141, 193, 0, 19, 193, 75, 141, 0, 97, 193, 0, 0, 108, 97, 0, 82, 5, 108, 0, 25, 129, 108, 4, 85, 2, 129, 0, 85, 0, 5, 0, 119, 0, 3, 1, 82, 123, 2, 0, 0, 16, 123, 0, 1, 193, 0, 0, 25, 24, 193, 4, 0, 145, 24, 0, 26, 144, 145, 1, 3, 25, 16, 144, 1, 193, 0, 0, 25, 26, 193, 4, 0, 148, 26, 0, 26, 147, 148, 1, 40, 193, 147, 255, 0, 146, 193, 0, 19, 193, 25, 146, 0, 27, 193, 0, 0, 28, 27, 0, 82, 29, 28, 0, 25, 136, 28, 4, 85, 2, 136, 0, 34, 30, 29, 0, 41, 193, 30, 31, 42, 193, 193, 31, 0, 31, 193, 0, 0, 32, 0, 0, 0, 33, 32, 0, 85, 33, 29, 0, 25, 34, 32, 4, 0, 35, 34, 0, 85, 35, 31, 0, 119, 0, 229, 0, 82, 127, 2, 0, 0, 36, 127, 0, 1, 193, 0, 0, 25, 37, 193, 4, 0, 150, 37, 0, 26, 149, 150, 1, 3, 38, 36, 149, 1, 193, 0, 0, 25, 39, 193, 4, 0, 153, 39, 0, 26, 152, 153, 1, 40, 193, 152, 255, 0, 151, 193, 0, 19, 193, 38, 151, 0, 40, 193, 0, 0, 41, 40, 0, 82, 43, 41, 0, 25, 137, 41, 4, 85, 2, 137, 0, 0, 44, 0, 0, 0, 45, 44, 0, 85, 45, 43, 0, 25, 46, 44, 4, 0, 47, 46, 0, 1, 193, 0, 0, 85, 47, 193, 0, 119, 0, 202, 0, 82, 128, 2, 0, 0, 48, 128, 0, 1, 193, 0, 0, 25, 49, 193, 8, 0, 155, 49, 0, 26, 154, 155, 1, 3, 50, 48, 154, 1, 193, 0, 0, 25, 51, 193, 8, 0, 158, 51, 0, 26, 157, 158, 1, 40, 193, 157, 255, 0, 156, 193, 0, 19, 193, 50, 156, 0, 52, 193, 0, 0, 54, 52, 0, 0, 55, 54, 0, 0, 56, 55, 0, 82, 57, 56, 0, 25, 58, 55, 4, 0, 59, 58, 0, 82, 60, 59, 0, 25, 138, 54, 8, 85, 2, 138, 0, 0, 61, 0, 0, 0, 62, 61, 0, 85, 62, 57, 0, 25, 63, 61, 4, 0, 65, 63, 0, 85, 65, 60, 0, 119, 0, 171, 0, 82, 120, 2, 0, 0, 66, 120, 0, 1, 193, 0, 0, 25, 67, 193, 4, 0, 160, 67, 0, 26, 159, 160, 1, 3, 68, 66, 159, 1, 193, 0, 0, 25, 69, 193, 4, 0, 163, 69, 0, 26, 162, 163, 1, 40, 193, 162, 255, 0, 161, 193, 0, 19, 193, 68, 161, 0, 70, 193, 0, 0, 71, 70, 0, 82, 72, 71, 0, 25, 130, 71, 4, 85, 2, 130, 0, 19, 193, 72, 191, 0, 73, 193, 0, 41, 193, 73, 16, 42, 193, 193, 16, 0, 74, 193, 0, 34, 76, 74, 0, 41, 193, 76, 31, 42, 193, 193, 31, 0, 77, 193, 0, 0, 78, 0, 0, 0, 79, 78, 0, 85, 79, 74, 0, 25, 80, 78, 4, 0, 81, 80, 0, 85, 81, 77, 0, 119, 0, 136, 0, 82, 121, 2, 0, 0, 82, 121, 0, 1, 193, 0, 0, 25, 83, 193, 4, 0, 165, 83, 0, 26, 164, 165, 1, 3, 84, 82, 164, 1, 193, 0, 0, 25, 85, 193, 4, 0, 168, 85, 0, 26, 167, 168, 1, 40, 193, 167, 255, 0, 166, 193, 0, 19, 193, 84, 166, 0, 87, 193, 0, 0, 88, 87, 0, 82, 89, 88, 0, 25, 131, 88, 4, 85, 2, 131, 0, 19, 193, 89, 191, 0, 4, 193, 0, 0, 90, 0, 0, 0, 91, 90, 0, 85, 91, 4, 0, 25, 92, 90, 4, 0, 93, 92, 0, 1, 193, 0, 0, 85, 93, 193, 0, 119, 0, 107, 0, 82, 122, 2, 0, 0, 94, 122, 0, 1, 193, 0, 0, 25, 95, 193, 4, 0, 170, 95, 0, 26, 169, 170, 1, 3, 96, 94, 169, 1, 193, 0, 0, 25, 98, 193, 4, 0, 173, 98, 0, 26, 172, 173, 1, 40, 193, 172, 255, 0, 171, 193, 0, 19, 193, 96, 171, 0, 99, 193, 0, 0, 100, 99, 0, 82, 101, 100, 0, 25, 132, 100, 4, 85, 2, 132, 0, 19, 193, 101, 192, 0, 102, 193, 0, 41, 193, 102, 24, 42, 193, 193, 24, 0, 103, 193, 0, 34, 104, 103, 0, 41, 193, 104, 31, 42, 193, 193, 31, 0, 105, 193, 0, 0, 106, 0, 0, 0, 107, 106, 0, 85, 107, 103, 0, 25, 109, 106, 4, 0, 110, 109, 0, 85, 110, 105, 0, 119, 0, 72, 0, 82, 124, 2, 0, 0, 111, 124, 0, 1, 193, 0, 0, 25, 112, 193, 4, 0, 175, 112, 0, 26, 174, 175, 1, 3, 113, 111, 174, 1, 193, 0, 0, 25, 114, 193, 4, 0, 178, 114, 0, 26, 177, 178, 1, 40, 193, 177, 255, 0, 176, 193, 0, 19, 193, 113, 176, 0, 115, 193, 0, 0, 116, 115, 0, 82, 117, 116, 0, 25, 133, 116, 4, 85, 2, 133, 0, 19, 193, 117, 192, 0, 3, 193, 0, 0, 118, 0, 0, 0, 6, 118, 0, 85, 6, 3, 0, 25, 7, 118, 4, 0, 8, 7, 0, 1, 193, 0, 0, 85, 8, 193, 0, 119, 0, 43, 0, 82, 125, 2, 0, 0, 9, 125, 0, 1, 193, 0, 0, 25, 10, 193, 8, 0, 180, 10, 0, 26, 179, 180, 1, 3, 11, 9, 179, 1, 193, 0, 0, 25, 12, 193, 8, 0, 183, 12, 0, 26, 182, 183, 1, 40, 193, 182, 255, 0, 181, 193, 0, 19, 193, 11, 181, 0, 13, 193, 0, 0, 14, 13, 0, 86, 15, 14, 0, 25, 134, 14, 8, 85, 2, 134, 0, 87, 0, 15, 0, 119, 0, 22, 0, 82, 126, 2, 0, 0, 17, 126, 0, 1, 193, 0, 0, 25, 18, 193, 8, 0, 185, 18, 0, 26, 184, 185, 1, 3, 19, 17, 184, 1, 193, 0, 0, 25, 20, 193, 8, 0, 188, 20, 0, 26, 187, 188, 1, 40, 193, 187, 255, 0, 186, 193, 0, 19, 193, 19, 186, 0, 21, 193, 0, 0, 22, 21, 0, 86, 23, 22, 0, 25, 135, 22, 8, 85, 2, 135, 0, 87, 0, 23, 0, 119, 0, 1, 0, 139, 0, 0, 0, 140, 5, 75, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 6, 1, 0, 0, 7, 6, 0, 0, 8, 2, 0, 0, 9, 3, 0, 0, 10, 9, 0, 32, 69, 7, 0, 121, 69, 27, 0, 33, 11, 4, 0, 32, 69, 10, 0, 121, 69, 11, 0, 121, 11, 5, 0, 9, 69, 5, 8, 85, 4, 69, 0, 1, 70, 0, 0, 109, 4, 4, 70, 1, 68, 0, 0, 7, 67, 5, 8, 129, 68, 0, 0, 139, 67, 0, 0, 119, 0, 14, 0, 120, 11, 5, 0, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 38, 70, 0, 255, 85, 4, 70, 0, 38, 69, 1, 0, 109, 4, 4, 69, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 32, 12, 10, 0, 32, 69, 8, 0, 121, 69, 83, 0, 121, 12, 11, 0, 33, 69, 4, 0, 121, 69, 5, 0, 9, 69, 7, 8, 85, 4, 69, 0, 1, 70, 0, 0, 109, 4, 4, 70, 1, 68, 0, 0, 7, 67, 7, 8, 129, 68, 0, 0, 139, 67, 0, 0, 32, 70, 5, 0, 121, 70, 11, 0, 33, 70, 4, 0, 121, 70, 5, 0, 1, 70, 0, 0, 85, 4, 70, 0, 9, 69, 7, 10, 109, 4, 4, 69, 1, 68, 0, 0, 7, 67, 7, 10, 129, 68, 0, 0, 139, 67, 0, 0, 26, 13, 10, 1, 19, 69, 13, 10, 32, 69, 69, 0, 121, 69, 18, 0, 33, 69, 4, 0, 121, 69, 8, 0, 38, 69, 0, 255, 39, 69, 69, 0, 85, 4, 69, 0, 19, 70, 13, 7, 38, 71, 1, 0, 20, 70, 70, 71, 109, 4, 4, 70, 1, 68, 0, 0, 134, 70, 0, 0, 176, 224, 0, 0, 10, 0, 0, 0, 24, 70, 7, 70, 0, 67, 70, 0, 129, 68, 0, 0, 139, 67, 0, 0, 135, 14, 3, 0, 10, 0, 0, 0, 135, 70, 3, 0, 7, 0, 0, 0, 4, 15, 14, 70, 37, 70, 15, 30, 121, 70, 15, 0, 25, 16, 15, 1, 1, 70, 31, 0, 4, 17, 70, 15, 0, 36, 16, 0, 22, 70, 7, 17, 24, 69, 5, 16, 20, 70, 70, 69, 0, 35, 70, 0, 24, 70, 7, 16, 0, 34, 70, 0, 1, 33, 0, 0, 22, 70, 5, 17, 0, 32, 70, 0, 119, 0, 139, 0, 32, 70, 4, 0, 121, 70, 5, 0, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 38, 70, 0, 255, 39, 70, 70, 0, 85, 4, 70, 0, 38, 69, 1, 0, 20, 69, 6, 69, 109, 4, 4, 69, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 119, 0, 122, 0, 120, 12, 43, 0, 135, 27, 3, 0, 10, 0, 0, 0, 135, 69, 3, 0, 7, 0, 0, 0, 4, 28, 27, 69, 37, 69, 28, 31, 121, 69, 20, 0, 25, 29, 28, 1, 1, 69, 31, 0, 4, 30, 69, 28, 26, 69, 28, 31, 42, 69, 69, 31, 0, 31, 69, 0, 0, 36, 29, 0, 24, 69, 5, 29, 19, 69, 69, 31, 22, 70, 7, 30, 20, 69, 69, 70, 0, 35, 69, 0, 24, 69, 7, 29, 19, 69, 69, 31, 0, 34, 69, 0, 1, 33, 0, 0, 22, 69, 5, 30, 0, 32, 69, 0, 119, 0, 95, 0, 32, 69, 4, 0, 121, 69, 5, 0, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 38, 69, 0, 255, 39, 69, 69, 0, 85, 4, 69, 0, 38, 70, 1, 0, 20, 70, 6, 70, 109, 4, 4, 70, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 26, 18, 8, 1, 19, 70, 18, 8, 33, 70, 70, 0, 121, 70, 44, 0, 135, 70, 3, 0, 8, 0, 0, 0, 25, 20, 70, 33, 135, 70, 3, 0, 7, 0, 0, 0, 4, 21, 20, 70, 1, 70, 64, 0, 4, 22, 70, 21, 1, 70, 32, 0, 4, 23, 70, 21, 42, 70, 23, 31, 0, 24, 70, 0, 26, 25, 21, 32, 42, 70, 25, 31, 0, 26, 70, 0, 0, 36, 21, 0, 26, 70, 23, 1, 42, 70, 70, 31, 24, 69, 7, 25, 19, 70, 70, 69, 22, 69, 7, 23, 24, 71, 5, 21, 20, 69, 69, 71, 19, 69, 69, 26, 20, 70, 70, 69, 0, 35, 70, 0, 24, 70, 7, 21, 19, 70, 26, 70, 0, 34, 70, 0, 22, 70, 5, 22, 19, 70, 70, 24, 0, 33, 70, 0, 22, 70, 7, 22, 24, 69, 5, 25, 20, 70, 70, 69, 19, 70, 70, 24, 22, 69, 5, 23, 26, 71, 21, 33, 42, 71, 71, 31, 19, 69, 69, 71, 20, 70, 70, 69, 0, 32, 70, 0, 119, 0, 32, 0, 33, 70, 4, 0, 121, 70, 5, 0, 19, 70, 18, 5, 85, 4, 70, 0, 1, 69, 0, 0, 109, 4, 4, 69, 32, 69, 8, 1, 121, 69, 10, 0, 38, 69, 1, 0, 20, 69, 6, 69, 0, 68, 69, 0, 38, 69, 0, 255, 39, 69, 69, 0, 0, 67, 69, 0, 129, 68, 0, 0, 139, 67, 0, 0, 119, 0, 15, 0, 134, 19, 0, 0, 176, 224, 0, 0, 8, 0, 0, 0, 24, 69, 7, 19, 39, 69, 69, 0, 0, 68, 69, 0, 1, 69, 32, 0, 4, 69, 69, 19, 22, 69, 7, 69, 24, 70, 5, 19, 20, 69, 69, 70, 0, 67, 69, 0, 129, 68, 0, 0, 139, 67, 0, 0, 32, 69, 36, 0, 121, 69, 8, 0, 0, 63, 32, 0, 0, 62, 33, 0, 0, 61, 34, 0, 0, 60, 35, 0, 1, 59, 0, 0, 1, 58, 0, 0, 119, 0, 89, 0, 38, 69, 2, 255, 39, 69, 69, 0, 0, 37, 69, 0, 38, 69, 3, 0, 20, 69, 9, 69, 0, 38, 69, 0, 1, 69, 255, 255, 1, 70, 255, 255, 134, 39, 0, 0, 76, 231, 0, 0, 37, 38, 69, 70, 128, 70, 0, 0, 0, 40, 70, 0, 0, 46, 32, 0, 0, 45, 33, 0, 0, 44, 34, 0, 0, 43, 35, 0, 0, 42, 36, 0, 1, 41, 0, 0, 43, 70, 45, 31, 41, 69, 46, 1, 20, 70, 70, 69, 0, 47, 70, 0, 41, 70, 45, 1, 20, 70, 41, 70, 0, 48, 70, 0, 41, 70, 43, 1, 43, 69, 46, 31, 20, 70, 70, 69, 39, 70, 70, 0, 0, 49, 70, 0, 43, 70, 43, 31, 41, 69, 44, 1, 20, 70, 70, 69, 0, 50, 70, 0, 134, 70, 0, 0, 160, 230, 0, 0, 39, 40, 49, 50, 128, 70, 0, 0, 0, 51, 70, 0, 42, 70, 51, 31, 34, 71, 51, 0, 1, 72, 255, 255, 1, 73, 0, 0, 125, 69, 71, 72, 73, 0, 0, 0, 41, 69, 69, 1, 20, 70, 70, 69, 0, 52, 70, 0, 38, 70, 52, 1, 0, 53, 70, 0, 19, 70, 52, 37, 34, 73, 51, 0, 1, 72, 255, 255, 1, 71, 0, 0, 125, 69, 73, 72, 71, 0, 0, 0, 42, 69, 69, 31, 34, 72, 51, 0, 1, 73, 255, 255, 1, 74, 0, 0, 125, 71, 72, 73, 74, 0, 0, 0, 41, 71, 71, 1, 20, 69, 69, 71, 19, 69, 69, 38, 134, 54, 0, 0, 160, 230, 0, 0, 49, 50, 70, 69, 0, 55, 54, 0, 128, 69, 0, 0, 0, 56, 69, 0, 26, 57, 42, 1, 32, 69, 57, 0, 120, 69, 8, 0, 0, 46, 47, 0, 0, 45, 48, 0, 0, 44, 56, 0, 0, 43, 55, 0, 0, 42, 57, 0, 0, 41, 53, 0, 119, 0, 194, 255, 0, 63, 47, 0, 0, 62, 48, 0, 0, 61, 56, 0, 0, 60, 55, 0, 1, 59, 0, 0, 0, 58, 53, 0, 0, 64, 62, 0, 1, 65, 0, 0, 20, 69, 63, 65, 0, 66, 69, 0, 33, 69, 4, 0, 121, 69, 4, 0, 39, 69, 60, 0, 85, 4, 69, 0, 109, 4, 4, 61, 39, 69, 64, 0, 43, 69, 69, 31, 41, 70, 66, 1, 20, 69, 69, 70, 41, 70, 65, 1, 43, 71, 64, 31, 20, 70, 70, 71, 38, 70, 70, 0, 20, 69, 69, 70, 20, 69, 69, 59, 0, 68, 69, 0, 41, 69, 64, 1, 1, 70, 0, 0, 43, 70, 70, 31, 20, 69, 69, 70, 38, 69, 69, 254, 20, 69, 69, 58, 0, 67, 69, 0, 129, 68, 0, 0, 139, 67, 0, 0, 140, 2, 87, 0, 0, 0, 0, 0, 2, 80, 0, 0, 136, 19, 0, 0, 1, 78, 0, 0, 136, 81, 0, 0, 0, 79, 81, 0, 136, 81, 0, 0, 25, 81, 81, 64, 137, 81, 0, 0, 130, 81, 0, 0, 136, 82, 0, 0, 49, 81, 81, 82, 112, 67, 0, 0, 1, 82, 64, 0, 135, 81, 0, 0, 82, 0, 0, 0, 25, 75, 79, 24, 25, 74, 79, 16, 25, 73, 79, 8, 0, 72, 79, 0, 0, 23, 0, 0, 0, 34, 1, 0, 0, 56, 23, 0, 85, 72, 56, 0, 1, 82, 111, 7, 134, 81, 0, 0, 248, 219, 0, 0, 82, 72, 0, 0, 0, 67, 23, 0, 1, 81, 3, 0, 17, 70, 81, 67, 121, 70, 15, 0, 0, 71, 23, 0, 85, 73, 71, 0, 1, 82, 137, 7, 134, 81, 0, 0, 248, 219, 0, 0, 82, 73, 0, 0, 1, 82, 11, 0, 134, 81, 0, 0, 28, 136, 0, 0, 82, 0, 0, 0, 1, 12, 100, 0, 0, 69, 12, 0, 137, 79, 0, 0, 139, 69, 0, 0, 1, 82, 60, 0, 1, 83, 0, 0, 1, 84, 1, 0, 134, 81, 0, 0, 48, 149, 0, 0, 82, 83, 84, 0, 0, 2, 34, 0, 1, 84, 0, 0, 1, 81, 61, 0, 138, 2, 84, 81, 64, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 4, 69, 0, 0, 76, 70, 0, 0, 1, 81, 11, 0, 134, 84, 0, 0, 28, 136, 0, 0, 81, 0, 0, 0, 0, 41, 34, 0, 85, 74, 41, 0, 1, 81, 184, 7, 134, 84, 0, 0, 248, 219, 0, 0, 81, 74, 0, 0, 1, 12, 0, 0, 0, 69, 12, 0, 137, 79, 0, 0, 139, 69, 0, 0, 119, 0, 134, 0, 0, 3, 23, 0, 1, 86, 0, 0, 1, 81, 3, 0, 138, 3, 86, 81, 96, 69, 0, 0, 4, 70, 0, 0, 40, 70, 0, 0, 119, 0, 126, 0, 1, 81, 106, 4, 1, 84, 168, 2, 1, 83, 100, 0, 1, 82, 1, 0, 1, 85, 3, 0, 134, 4, 0, 0, 108, 85, 0, 0, 81, 84, 83, 82, 80, 85, 0, 0, 0, 45, 4, 0, 0, 5, 45, 0, 41, 85, 5, 24, 42, 85, 85, 24, 33, 6, 85, 0, 121, 6, 5, 0, 1, 12, 0, 0, 0, 69, 12, 0, 137, 79, 0, 0, 139, 69, 0, 0, 1, 85, 82, 3, 1, 82, 32, 3, 1, 83, 100, 0, 1, 84, 1, 0, 1, 81, 184, 11, 1, 86, 3, 0, 134, 7, 0, 0, 108, 85, 0, 0, 85, 82, 83, 84, 81, 86, 0, 0, 0, 45, 7, 0, 0, 8, 45, 0, 41, 86, 8, 24, 42, 86, 86, 24, 33, 9, 86, 0, 120, 9, 2, 0, 119, 0, 90, 0, 1, 12, 0, 0, 0, 69, 12, 0, 137, 79, 0, 0, 139, 69, 0, 0, 119, 0, 85, 0, 1, 81, 15, 0, 134, 86, 0, 0, 28, 136, 0, 0, 81, 0, 0, 0, 1, 12, 100, 0, 0, 69, 12, 0, 137, 79, 0, 0, 139, 69, 0, 0, 119, 0, 76, 0, 1, 81, 15, 0, 134, 86, 0, 0, 28, 136, 0, 0, 81, 0, 0, 0, 1, 12, 100, 0, 0, 69, 12, 0, 137, 79, 0, 0, 139, 69, 0, 0, 119, 0, 67, 0, 0, 10, 23, 0, 41, 86, 10, 3, 25, 11, 86, 8, 82, 13, 11, 0, 1, 86, 200, 0, 15, 14, 13, 86, 120, 14, 51, 0, 0, 15, 23, 0, 41, 86, 15, 3, 25, 16, 86, 8, 82, 17, 16, 0, 1, 86, 20, 5, 15, 18, 86, 17, 120, 18, 44, 0, 0, 19, 23, 0, 41, 86, 19, 3, 25, 20, 86, 8, 25, 21, 20, 4, 82, 22, 21, 0, 1, 86, 76, 4, 15, 24, 86, 22, 120, 24, 36, 0, 0, 25, 23, 0, 41, 86, 25, 3, 25, 26, 86, 8, 25, 27, 26, 4, 82, 28, 27, 0, 1, 86, 132, 3, 15, 29, 28, 86, 120, 29, 28, 0, 0, 30, 23, 0, 41, 86, 30, 3, 25, 31, 86, 8, 82, 32, 31, 0, 0, 33, 23, 0, 41, 86, 33, 3, 25, 35, 86, 8, 25, 36, 35, 4, 82, 37, 36, 0, 1, 86, 100, 0, 1, 81, 1, 0, 1, 84, 3, 0, 134, 38, 0, 0, 108, 85, 0, 0, 32, 37, 86, 81, 80, 84, 0, 0, 0, 45, 38, 0, 0, 39, 45, 0, 41, 84, 39, 24, 42, 84, 84, 24, 33, 40, 84, 0, 120, 40, 2, 0, 119, 0, 14, 0, 1, 12, 60, 0, 0, 69, 12, 0, 137, 79, 0, 0, 139, 69, 0, 0, 1, 81, 10, 0, 134, 84, 0, 0, 28, 136, 0, 0, 81, 0, 0, 0, 1, 12, 100, 0, 0, 69, 12, 0, 137, 79, 0, 0, 139, 69, 0, 0, 119, 0, 1, 0, 0, 42, 23, 0, 1, 85, 0, 0, 1, 82, 3, 0, 138, 42, 85, 82, 116, 71, 0, 0, 164, 71, 0, 0, 212, 71, 0, 0, 119, 0, 37, 0, 1, 84, 82, 3, 1, 81, 150, 0, 1, 86, 80, 0, 1, 83, 1, 0, 1, 82, 64, 31, 1, 85, 6, 0, 134, 43, 0, 0, 108, 85, 0, 0, 84, 81, 86, 83, 82, 85, 0, 0, 0, 45, 43, 0, 119, 0, 25, 0, 1, 85, 38, 2, 1, 82, 150, 0, 1, 83, 80, 0, 1, 86, 1, 0, 1, 81, 64, 31, 1, 84, 6, 0, 134, 44, 0, 0, 108, 85, 0, 0, 85, 82, 83, 86, 81, 84, 0, 0, 0, 45, 44, 0, 119, 0, 13, 0, 1, 84, 188, 2, 1, 81, 150, 0, 1, 86, 80, 0, 1, 83, 1, 0, 1, 82, 64, 31, 1, 85, 6, 0, 134, 46, 0, 0, 108, 85, 0, 0, 84, 81, 86, 83, 82, 85, 0, 0, 0, 45, 46, 0, 119, 0, 1, 0, 0, 47, 45, 0, 41, 85, 47, 24, 42, 85, 85, 24, 33, 48, 85, 0, 121, 48, 44, 0, 1, 85, 248, 22, 80, 49, 85, 0, 41, 85, 49, 16, 42, 85, 85, 16, 0, 50, 85, 0, 0, 51, 23, 0, 41, 85, 51, 3, 25, 52, 85, 8, 85, 52, 50, 0, 1, 85, 250, 22, 80, 53, 85, 0, 41, 85, 53, 16, 42, 85, 85, 16, 0, 54, 85, 0, 0, 55, 23, 0, 41, 85, 55, 3, 25, 57, 85, 8, 25, 58, 57, 4, 85, 58, 54, 0, 0, 59, 23, 0, 1, 85, 248, 22, 80, 60, 85, 0, 41, 85, 60, 16, 42, 85, 85, 16, 0, 61, 85, 0, 1, 85, 250, 22, 80, 62, 85, 0, 41, 85, 62, 16, 42, 85, 85, 16, 0, 63, 85, 0, 85, 75, 59, 0, 25, 76, 75, 4, 85, 76, 61, 0, 25, 77, 75, 8, 85, 77, 63, 0, 1, 82, 212, 7, 134, 85, 0, 0, 248, 219, 0, 0, 82, 75, 0, 0, 1, 12, 60, 0, 0, 69, 12, 0, 137, 79, 0, 0, 139, 69, 0, 0, 0, 64, 23, 0, 1, 84, 0, 0, 1, 81, 3, 0, 138, 64, 84, 81, 228, 72, 0, 0, 20, 73, 0, 0, 68, 73, 0, 0, 119, 0, 37, 0, 1, 85, 82, 3, 1, 82, 144, 1, 1, 83, 80, 0, 1, 86, 0, 0, 1, 81, 64, 31, 1, 84, 4, 0, 134, 65, 0, 0, 108, 85, 0, 0, 85, 82, 83, 86, 81, 84, 0, 0, 0, 45, 65, 0, 119, 0, 25, 0, 1, 84, 38, 2, 1, 81, 144, 1, 1, 86, 80, 0, 1, 83, 0, 0, 1, 82, 64, 31, 1, 85, 4, 0, 134, 66, 0, 0, 108, 85, 0, 0, 84, 81, 86, 83, 82, 85, 0, 0, 0, 45, 66, 0, 119, 0, 13, 0, 1, 85, 188, 2, 1, 82, 144, 1, 1, 83, 80, 0, 1, 86, 0, 0, 1, 81, 64, 31, 1, 84, 4, 0, 134, 68, 0, 0, 108, 85, 0, 0, 85, 82, 83, 86, 81, 84, 0, 0, 0, 45, 68, 0, 119, 0, 1, 0, 1, 12, 100, 0, 0, 69, 12, 0, 137, 79, 0, 0, 139, 69, 0, 0, 140, 0, 88, 0, 0, 0, 0, 0, 2, 77, 0, 0, 208, 7, 0, 0, 2, 78, 0, 0, 200, 0, 0, 0, 2, 79, 0, 0, 116, 22, 0, 0, 2, 80, 0, 0, 144, 1, 0, 0, 2, 81, 0, 0, 184, 11, 0, 0, 1, 75, 0, 0, 136, 82, 0, 0, 0, 76, 82, 0, 136, 82, 0, 0, 25, 82, 82, 64, 137, 82, 0, 0, 130, 82, 0, 0, 136, 83, 0, 0, 49, 82, 82, 83, 232, 73, 0, 0, 1, 83, 64, 0, 135, 82, 0, 0, 83, 0, 0, 0, 25, 74, 76, 40, 25, 73, 76, 32, 25, 72, 76, 24, 25, 71, 76, 16, 25, 70, 76, 8, 0, 69, 76, 0, 1, 83, 127, 10, 134, 82, 0, 0, 248, 219, 0, 0, 83, 69, 0, 0, 1, 82, 118, 26, 78, 23, 82, 0, 38, 82, 23, 1, 0, 34, 82, 0, 121, 34, 5, 0, 1, 0, 12, 0, 0, 65, 0, 0, 137, 76, 0, 0, 139, 65, 0, 0, 1, 82, 132, 23, 82, 45, 82, 0, 25, 56, 45, 1, 1, 82, 132, 23, 85, 82, 56, 0, 1, 82, 46, 0, 1, 83, 100, 0, 1, 84, 1, 0, 1, 85, 64, 31, 1, 86, 3, 0, 134, 66, 0, 0, 76, 46, 0, 0, 82, 83, 84, 85, 86, 0, 0, 0, 0, 1, 66, 0, 0, 67, 1, 0, 41, 86, 67, 24, 42, 86, 86, 24, 33, 68, 86, 0, 121, 68, 6, 0, 0, 2, 1, 0, 0, 0, 2, 0, 0, 65, 0, 0, 137, 76, 0, 0, 139, 65, 0, 0, 1, 86, 230, 0, 1, 85, 234, 6, 1, 84, 100, 0, 1, 83, 1, 0, 1, 82, 3, 0, 134, 3, 0, 0, 108, 85, 0, 0, 86, 85, 84, 83, 81, 82, 0, 0, 0, 1, 3, 0, 78, 4, 79, 0, 38, 82, 4, 1, 0, 5, 82, 0, 121, 5, 8, 0, 1, 83, 160, 255, 1, 84, 0, 0, 1, 85, 1, 0, 134, 82, 0, 0, 160, 139, 0, 0, 83, 84, 85, 0, 119, 0, 7, 0, 1, 85, 40, 0, 1, 84, 0, 0, 1, 83, 1, 0, 134, 82, 0, 0, 160, 139, 0, 0, 85, 84, 83, 0, 1, 83, 151, 10, 134, 82, 0, 0, 52, 223, 0, 0, 83, 0, 0, 0, 1, 82, 230, 0, 1, 83, 0, 0, 134, 6, 0, 0, 84, 203, 0, 0, 82, 83, 77, 0, 0, 1, 6, 0, 1, 82, 1, 0, 134, 83, 0, 0, 244, 214, 0, 0, 82, 0, 0, 0, 1, 83, 230, 0, 1, 82, 100, 0, 1, 84, 0, 0, 1, 85, 220, 5, 1, 86, 5, 0, 134, 7, 0, 0, 108, 85, 0, 0, 83, 77, 82, 84, 85, 86, 0, 0, 0, 1, 7, 0, 0, 8, 1, 0, 1, 86, 255, 0, 19, 86, 8, 86, 0, 9, 86, 0, 32, 10, 9, 1, 121, 10, 13, 0, 1, 86, 58, 7, 134, 11, 0, 0, 48, 225, 0, 0, 86, 0, 0, 0, 76, 86, 11, 0, 58, 13, 86, 0, 1, 86, 236, 22, 89, 86, 13, 0, 1, 85, 168, 10, 134, 86, 0, 0, 248, 219, 0, 0, 85, 70, 0, 0, 1, 85, 0, 0, 134, 86, 0, 0, 244, 214, 0, 0, 85, 0, 0, 0, 1, 85, 244, 1, 134, 86, 0, 0, 176, 213, 0, 0, 85, 0, 0, 0, 78, 14, 79, 0, 38, 86, 14, 1, 0, 15, 86, 0, 1, 86, 40, 0, 1, 85, 160, 255, 125, 16, 15, 86, 85, 0, 0, 0, 1, 86, 0, 0, 1, 84, 1, 0, 134, 85, 0, 0, 160, 139, 0, 0, 16, 86, 84, 0, 1, 84, 244, 1, 134, 85, 0, 0, 176, 213, 0, 0, 84, 0, 0, 0, 78, 17, 79, 0, 38, 85, 17, 1, 0, 18, 85, 0, 1, 85, 160, 255, 1, 84, 40, 0, 125, 19, 18, 85, 84, 0, 0, 0, 1, 85, 0, 0, 1, 86, 1, 0, 134, 84, 0, 0, 160, 139, 0, 0, 19, 85, 86, 0, 1, 86, 244, 1, 134, 84, 0, 0, 176, 213, 0, 0, 86, 0, 0, 0, 1, 84, 230, 0, 1, 86, 234, 6, 1, 85, 100, 0, 1, 82, 1, 0, 1, 83, 3, 0, 134, 20, 0, 0, 108, 85, 0, 0, 84, 86, 85, 82, 81, 83, 0, 0, 0, 1, 20, 0, 1, 82, 171, 10, 134, 83, 0, 0, 52, 223, 0, 0, 82, 0, 0, 0, 1, 83, 234, 6, 134, 21, 0, 0, 84, 203, 0, 0, 81, 83, 77, 0, 0, 1, 21, 0, 1, 82, 1, 0, 134, 83, 0, 0, 244, 214, 0, 0, 82, 0, 0, 0, 1, 83, 0, 0, 1, 82, 234, 6, 1, 85, 50, 0, 1, 86, 0, 0, 1, 84, 220, 5, 1, 87, 5, 0, 134, 22, 0, 0, 108, 85, 0, 0, 83, 82, 85, 86, 84, 87, 0, 0, 0, 1, 22, 0, 0, 24, 1, 0, 1, 87, 255, 0, 19, 87, 24, 87, 0, 25, 87, 0, 32, 26, 25, 1, 121, 26, 16, 0, 1, 87, 150, 0, 134, 27, 0, 0, 72, 212, 0, 0, 87, 0, 0, 0, 134, 28, 0, 0, 48, 225, 0, 0, 27, 0, 0, 0, 76, 87, 28, 0, 58, 29, 87, 0, 1, 87, 232, 22, 89, 87, 29, 0, 1, 84, 168, 10, 134, 87, 0, 0, 248, 219, 0, 0, 84, 71, 0, 0, 1, 84, 0, 0, 134, 87, 0, 0, 244, 214, 0, 0, 84, 0, 0, 0, 1, 87, 230, 0, 1, 84, 234, 6, 1, 86, 100, 0, 1, 85, 1, 0, 1, 82, 3, 0, 134, 30, 0, 0, 108, 85, 0, 0, 87, 84, 86, 85, 81, 82, 0, 0, 0, 1, 30, 0, 1, 82, 17, 1, 1, 85, 64, 6, 1, 86, 100, 0, 1, 84, 1, 0, 1, 87, 3, 0, 134, 31, 0, 0, 108, 85, 0, 0, 82, 85, 86, 84, 81, 87, 0, 0, 0, 1, 31, 0, 0, 32, 1, 0, 41, 87, 32, 24, 42, 87, 87, 24, 33, 33, 87, 0, 121, 33, 6, 0, 0, 35, 1, 0, 0, 0, 35, 0, 0, 65, 0, 0, 137, 76, 0, 0, 139, 65, 0, 0, 1, 87, 90, 1, 1, 84, 120, 5, 134, 36, 0, 0, 84, 203, 0, 0, 87, 84, 77, 0, 0, 1, 36, 0, 0, 37, 1, 0, 41, 84, 37, 24, 42, 84, 84, 24, 33, 38, 84, 0, 121, 38, 6, 0, 0, 39, 1, 0, 0, 0, 39, 0, 0, 65, 0, 0, 137, 76, 0, 0, 139, 65, 0, 0, 1, 12, 1, 0, 0, 40, 12, 0, 36, 41, 40, 2, 120, 41, 3, 0, 1, 75, 29, 0, 119, 0, 107, 0, 78, 42, 79, 0, 38, 84, 42, 1, 0, 43, 84, 0, 121, 43, 8, 0, 1, 87, 160, 255, 1, 86, 0, 0, 1, 85, 1, 0, 134, 84, 0, 0, 160, 139, 0, 0, 87, 86, 85, 0, 119, 0, 7, 0, 1, 85, 40, 0, 1, 86, 0, 0, 1, 87, 1, 0, 134, 84, 0, 0, 160, 139, 0, 0, 85, 86, 87, 0, 134, 84, 0, 0, 176, 213, 0, 0, 80, 0, 0, 0, 1, 84, 132, 23, 82, 44, 84, 0, 1, 84, 8, 7, 3, 46, 84, 44, 1, 84, 100, 0, 1, 87, 0, 0, 1, 86, 3, 0, 134, 47, 0, 0, 108, 85, 0, 0, 78, 46, 84, 87, 81, 86, 0, 0, 0, 1, 47, 0, 0, 48, 1, 0, 41, 86, 48, 24, 42, 86, 86, 24, 33, 49, 86, 0, 121, 49, 3, 0, 1, 75, 22, 0, 119, 0, 68, 0, 1, 86, 0, 0, 134, 51, 0, 0, 84, 203, 0, 0, 78, 86, 77, 0, 0, 1, 51, 0, 1, 87, 1, 0, 134, 86, 0, 0, 244, 214, 0, 0, 87, 0, 0, 0, 1, 86, 100, 0, 1, 87, 0, 0, 1, 84, 5, 0, 134, 52, 0, 0, 108, 85, 0, 0, 78, 77, 86, 87, 77, 84, 0, 0, 0, 1, 52, 0, 0, 53, 1, 0, 1, 84, 255, 0, 19, 84, 53, 84, 0, 54, 84, 0, 32, 55, 54, 1, 121, 55, 13, 0, 1, 84, 58, 7, 134, 57, 0, 0, 48, 225, 0, 0, 84, 0, 0, 0, 76, 84, 57, 0, 58, 58, 84, 0, 1, 84, 236, 22, 89, 84, 58, 0, 1, 87, 188, 10, 134, 84, 0, 0, 248, 219, 0, 0, 87, 72, 0, 0, 1, 87, 0, 0, 134, 84, 0, 0, 244, 214, 0, 0, 87, 0, 0, 0, 1, 87, 209, 10, 134, 84, 0, 0, 248, 219, 0, 0, 87, 73, 0, 0, 78, 59, 79, 0, 38, 84, 59, 1, 0, 60, 84, 0, 121, 60, 8, 0, 1, 87, 40, 0, 1, 86, 0, 0, 1, 85, 1, 0, 134, 84, 0, 0, 160, 139, 0, 0, 87, 86, 85, 0, 119, 0, 7, 0, 1, 85, 160, 255, 1, 86, 0, 0, 1, 87, 1, 0, 134, 84, 0, 0, 160, 139, 0, 0, 85, 86, 87, 0, 134, 84, 0, 0, 176, 213, 0, 0, 80, 0, 0, 0, 0, 61, 12, 0, 25, 62, 61, 1, 0, 12, 62, 0, 119, 0, 146, 255, 32, 84, 75, 22, 121, 84, 7, 0, 0, 50, 1, 0, 0, 0, 50, 0, 0, 65, 0, 0, 137, 76, 0, 0, 139, 65, 0, 0, 119, 0, 39, 0, 32, 84, 75, 29, 121, 84, 37, 0, 1, 84, 118, 26, 1, 87, 1, 0, 83, 84, 87, 0, 1, 84, 227, 10, 134, 87, 0, 0, 248, 219, 0, 0, 84, 74, 0, 0, 1, 84, 50, 0, 134, 87, 0, 0, 12, 216, 0, 0 ], eb + 10240);
 HEAPU8.set([ 84, 0, 0, 0, 1, 87, 8, 7, 1, 84, 100, 0, 1, 86, 1, 0, 1, 85, 136, 19, 1, 82, 10, 0, 134, 63, 0, 0, 108, 85, 0, 0, 78, 87, 84, 86, 85, 82, 0, 0, 0, 1, 63, 0, 1, 82, 17, 1, 1, 85, 64, 6, 1, 86, 100, 0, 1, 84, 1, 0, 1, 87, 136, 19, 1, 83, 10, 0, 134, 64, 0, 0, 108, 85, 0, 0, 82, 85, 86, 84, 87, 83, 0, 0, 0, 1, 64, 0, 1, 0, 0, 0, 0, 65, 0, 0, 137, 76, 0, 0, 139, 65, 0, 0, 1, 83, 0, 0, 139, 83, 0, 0, 140, 0, 70, 0, 0, 0, 0, 0, 2, 64, 0, 0, 236, 5, 0, 0, 2, 65, 0, 0, 85, 9, 0, 0, 1, 62, 0, 0, 136, 66, 0, 0, 0, 63, 66, 0, 136, 66, 0, 0, 25, 66, 66, 96, 137, 66, 0, 0, 130, 66, 0, 0, 136, 67, 0, 0, 49, 66, 66, 67, 188, 80, 0, 0, 1, 67, 96, 0, 135, 66, 0, 0, 67, 0, 0, 0, 25, 57, 63, 48, 25, 56, 63, 40, 25, 61, 63, 32, 25, 60, 63, 24, 25, 59, 63, 16, 25, 58, 63, 8, 0, 55, 63, 0, 25, 23, 63, 68, 25, 50, 63, 56, 134, 66, 0, 0, 52, 235, 0, 0, 134, 66, 0, 0, 52, 235, 0, 0, 1, 67, 15, 9, 134, 66, 0, 0, 232, 223, 0, 0, 67, 0, 0, 0, 1, 66, 116, 22, 78, 52, 66, 0, 38, 66, 52, 1, 0, 53, 66, 0, 121, 53, 6, 0, 1, 67, 189, 8, 134, 66, 0, 0, 232, 223, 0, 0, 67, 0, 0, 0, 119, 0, 5, 0, 1, 67, 205, 8, 134, 66, 0, 0, 232, 223, 0, 0, 67, 0, 0, 0, 1, 67, 223, 8, 134, 66, 0, 0, 232, 223, 0, 0, 67, 0, 0, 0, 1, 67, 149, 8, 134, 66, 0, 0, 232, 223, 0, 0, 67, 0, 0, 0, 1, 67, 25, 9, 134, 66, 0, 0, 232, 223, 0, 0, 67, 0, 0, 0, 1, 67, 165, 8, 134, 66, 0, 0, 232, 223, 0, 0, 67, 0, 0, 0, 1, 67, 177, 8, 134, 66, 0, 0, 232, 223, 0, 0, 67, 0, 0, 0, 1, 67, 226, 8, 134, 66, 0, 0, 232, 223, 0, 0, 67, 0, 0, 0, 1, 67, 46, 9, 134, 66, 0, 0, 232, 223, 0, 0, 67, 0, 0, 0, 1, 1, 0, 0, 1, 12, 1, 0, 1, 66, 32, 0, 82, 66, 66, 0, 85, 23, 66, 0, 1, 67, 32, 0, 106, 67, 67, 4, 109, 23, 4, 67, 1, 66, 32, 0, 106, 66, 66, 8, 109, 23, 8, 66, 1, 34, 3, 0, 1, 45, 1, 0, 1, 66, 44, 0, 82, 66, 66, 0, 85, 50, 66, 0, 1, 67, 44, 0, 106, 67, 67, 4, 109, 50, 4, 67, 1, 51, 2, 0, 134, 67, 0, 0, 240, 220, 0, 0, 1, 66, 244, 1, 134, 67, 0, 0, 176, 213, 0, 0, 66, 0, 0, 0, 1, 66, 64, 9, 134, 67, 0, 0, 232, 223, 0, 0, 66, 0, 0, 0, 134, 67, 0, 0, 104, 235, 0, 0, 1, 66, 240, 8, 134, 67, 0, 0, 232, 223, 0, 0, 66, 0, 0, 0, 1, 66, 200, 0, 134, 67, 0, 0, 176, 213, 0, 0, 66, 0, 0, 0, 1, 66, 250, 0, 1, 68, 244, 1, 59, 69, 0, 0, 134, 67, 0, 0, 252, 212, 0, 0, 66, 68, 69, 0, 134, 67, 0, 0, 184, 234, 0, 0, 134, 67, 0, 0, 4, 235, 0, 0, 134, 67, 0, 0, 148, 225, 0, 0, 1, 69, 244, 1, 134, 67, 0, 0, 176, 213, 0, 0, 69, 0, 0, 0, 1, 69, 0, 0, 134, 67, 0, 0, 96, 226, 0, 0, 69, 0, 0, 0, 1, 69, 44, 1, 1, 68, 16, 39, 134, 67, 0, 0, 92, 202, 0, 0, 69, 68, 0, 0, 1, 68, 5, 0, 134, 67, 0, 0, 12, 216, 0, 0, 68, 0, 0, 0, 1, 68, 5, 0, 134, 67, 0, 0, 12, 216, 0, 0, 68, 0, 0, 0, 1, 68, 29, 0, 134, 67, 0, 0, 12, 216, 0, 0, 68, 0, 0, 0, 1, 68, 69, 9, 134, 67, 0, 0, 248, 219, 0, 0, 68, 55, 0, 0, 0, 2, 34, 0, 0, 0, 2, 0, 0, 3, 1, 0, 25, 4, 3, 1, 0, 1, 4, 0, 0, 5, 1, 0, 1, 67, 50, 0, 15, 6, 67, 5, 121, 6, 3, 0, 1, 62, 6, 0, 119, 0, 39, 0, 0, 7, 0, 0, 25, 8, 7, 1, 0, 0, 8, 0, 0, 9, 0, 0, 0, 10, 34, 0, 17, 11, 10, 9, 121, 11, 6, 0, 1, 0, 0, 0, 1, 68, 113, 9, 134, 67, 0, 0, 248, 219, 0, 0, 68, 59, 0, 0, 0, 13, 0, 0, 41, 67, 13, 2, 3, 14, 23, 67, 82, 15, 14, 0, 134, 67, 0, 0, 192, 131, 0, 0, 15, 0, 0, 0, 1, 67, 118, 26, 78, 16, 67, 0, 38, 67, 16, 1, 0, 17, 67, 0, 120, 17, 2, 0, 119, 0, 223, 255, 1, 67, 119, 26, 78, 18, 67, 0, 38, 67, 18, 1, 0, 19, 67, 0, 120, 19, 2, 0, 119, 0, 217, 255, 1, 67, 127, 26, 78, 20, 67, 0, 38, 67, 20, 1, 0, 21, 67, 0, 121, 21, 212, 255, 1, 62, 12, 0, 119, 0, 1, 0, 32, 67, 62, 6, 121, 67, 5, 0, 134, 67, 0, 0, 248, 219, 0, 0, 65, 58, 0, 0, 119, 0, 27, 0, 32, 67, 62, 12, 121, 67, 25, 0, 1, 1, 0, 0, 0, 22, 1, 0, 25, 24, 22, 1, 0, 1, 24, 0, 0, 25, 1, 0, 1, 67, 50, 0, 15, 26, 67, 25, 120, 26, 14, 0, 1, 68, 9, 0, 134, 67, 0, 0, 192, 131, 0, 0, 68, 0, 0, 0, 1, 68, 10, 0, 134, 67, 0, 0, 192, 131, 0, 0, 68, 0, 0, 0, 1, 67, 176, 23, 82, 27, 67, 0, 32, 28, 27, 0, 121, 28, 238, 255, 119, 0, 4, 0, 134, 67, 0, 0, 248, 219, 0, 0, 65, 60, 0, 0, 1, 68, 135, 9, 134, 67, 0, 0, 248, 219, 0, 0, 68, 61, 0, 0, 0, 29, 45, 0, 38, 67, 29, 1, 0, 30, 67, 0, 120, 30, 11, 0, 1, 68, 25, 0, 1, 69, 0, 0, 1, 66, 1, 0, 134, 67, 0, 0, 244, 153, 0, 0, 68, 69, 66, 0, 134, 67, 0, 0, 64, 218, 0, 0, 137, 63, 0, 0, 139, 0, 0, 0, 1, 1, 0, 0, 0, 31, 51, 0, 0, 0, 31, 0, 0, 32, 1, 0, 25, 33, 32, 1, 0, 1, 33, 0, 0, 35, 1, 0, 1, 67, 50, 0, 15, 36, 67, 35, 121, 36, 3, 0, 1, 62, 19, 0, 119, 0, 31, 0, 0, 37, 0, 0, 25, 38, 37, 1, 0, 0, 38, 0, 0, 39, 0, 0, 0, 40, 51, 0, 17, 41, 40, 39, 121, 41, 6, 0, 1, 0, 0, 0, 1, 66, 151, 9, 134, 67, 0, 0, 248, 219, 0, 0, 66, 57, 0, 0, 0, 42, 0, 0, 41, 67, 42, 2, 3, 43, 50, 67, 82, 44, 43, 0, 134, 67, 0, 0, 192, 131, 0, 0, 44, 0, 0, 0, 1, 67, 122, 26, 78, 46, 67, 0, 38, 67, 46, 1, 0, 47, 67, 0, 1, 67, 176, 23, 82, 48, 67, 0, 32, 49, 48, 0, 19, 67, 47, 49, 0, 54, 67, 0, 121, 54, 219, 255, 119, 0, 1, 0, 32, 67, 62, 19, 121, 67, 4, 0, 134, 67, 0, 0, 248, 219, 0, 0, 65, 56, 0, 0, 1, 66, 1, 0, 134, 67, 0, 0, 240, 118, 0, 0, 66, 0, 0, 0, 1, 66, 25, 0, 1, 69, 0, 0, 1, 68, 1, 0, 134, 67, 0, 0, 244, 153, 0, 0, 66, 69, 68, 0, 134, 67, 0, 0, 64, 218, 0, 0, 137, 63, 0, 0, 139, 0, 0, 0, 140, 6, 89, 0, 0, 0, 0, 0, 2, 86, 0, 0, 255, 0, 0, 0, 1, 84, 0, 0, 136, 87, 0, 0, 0, 85, 87, 0, 136, 87, 0, 0, 25, 87, 87, 80, 137, 87, 0, 0, 130, 87, 0, 0, 136, 88, 0, 0, 49, 87, 87, 88, 176, 85, 0, 0, 1, 88, 80, 0, 135, 87, 0, 0, 88, 0, 0, 0, 25, 74, 85, 56, 25, 73, 85, 48, 25, 72, 85, 40, 25, 71, 85, 32, 25, 76, 85, 24, 25, 75, 85, 16, 0, 70, 85, 0, 0, 56, 0, 0, 0, 67, 1, 0, 0, 68, 2, 0, 0, 69, 3, 0, 0, 6, 4, 0, 0, 7, 5, 0, 1, 9, 0, 0, 1, 87, 104, 22, 78, 10, 87, 0, 38, 87, 10, 1, 0, 11, 87, 0, 120, 11, 8, 0, 0, 12, 7, 0, 19, 87, 12, 86, 0, 13, 87, 0, 25, 14, 13, 5, 19, 87, 14, 86, 0, 15, 87, 0, 0, 7, 15, 0, 0, 16, 68, 0, 134, 87, 0, 0, 224, 229, 0, 0, 16, 0, 0, 0, 0, 17, 69, 0, 41, 87, 17, 16, 42, 87, 87, 16, 33, 18, 87, 0, 121, 18, 7, 0, 0, 19, 56, 0, 0, 20, 67, 0, 1, 88, 208, 7, 134, 87, 0, 0, 84, 203, 0, 0, 19, 20, 88, 0, 0, 21, 56, 0, 0, 22, 67, 0, 0, 23, 6, 0, 0, 24, 69, 0, 134, 25, 0, 0, 48, 219, 0, 0, 21, 22, 23, 24, 0, 8, 25, 0, 0, 26, 9, 0, 25, 87, 26, 1, 41, 87, 87, 24, 42, 87, 87, 24, 0, 27, 87, 0, 0, 9, 27, 0, 0, 28, 8, 0, 19, 87, 28, 86, 0, 29, 87, 0, 32, 30, 29, 2, 121, 30, 7, 0, 134, 87, 0, 0, 152, 232, 0, 0, 1, 88, 232, 3, 134, 87, 0, 0, 176, 213, 0, 0, 88, 0, 0, 0, 0, 31, 8, 0, 19, 87, 31, 86, 0, 32, 87, 0, 32, 33, 32, 2, 120, 33, 2, 0, 119, 0, 10, 0, 0, 34, 9, 0, 19, 87, 34, 86, 0, 35, 87, 0, 0, 36, 7, 0, 19, 87, 36, 86, 0, 37, 87, 0, 15, 38, 35, 37, 120, 38, 218, 255, 119, 0, 1, 0, 0, 39, 8, 0, 19, 87, 39, 86, 0, 40, 87, 0, 33, 41, 40, 0, 120, 41, 4, 0, 0, 66, 8, 0, 137, 85, 0, 0, 139, 66, 0, 0, 0, 42, 8, 0, 19, 87, 42, 86, 0, 43, 87, 0, 1, 87, 1, 0, 1, 88, 127, 0, 138, 43, 87, 88, 80, 89, 0, 0, 148, 89, 0, 0, 188, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 228, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 40, 89, 0, 0, 12, 90, 0, 0, 0, 57, 56, 0, 0, 58, 67, 0, 85, 73, 57, 0, 25, 82, 73, 4, 85, 82, 58, 0, 1, 88, 84, 5, 134, 87, 0, 0, 248, 219, 0, 0, 88, 73, 0, 0, 119, 0, 58, 0, 0, 44, 56, 0, 0, 45, 67, 0, 0, 46, 6, 0, 2, 87, 0, 0, 255, 255, 0, 0, 19, 87, 46, 87, 0, 47, 87, 0, 85, 70, 44, 0, 25, 77, 70, 4, 85, 77, 45, 0, 25, 81, 70, 8, 85, 81, 47, 0, 1, 88, 76, 4, 134, 87, 0, 0, 248, 219, 0, 0, 88, 70, 0, 0, 119, 0, 41, 0, 0, 48, 56, 0, 0, 49, 67, 0, 85, 75, 48, 0, 25, 83, 75, 4, 85, 83, 49, 0, 1, 88, 135, 4, 134, 87, 0, 0, 248, 219, 0, 0, 88, 75, 0, 0, 119, 0, 31, 0, 0, 50, 56, 0, 0, 51, 67, 0, 85, 76, 50, 0, 25, 78, 76, 4, 85, 78, 51, 0, 1, 88, 184, 4, 134, 87, 0, 0, 248, 219, 0, 0, 88, 76, 0, 0, 119, 0, 21, 0, 0, 52, 56, 0, 0, 53, 67, 0, 85, 71, 52, 0, 25, 79, 71, 4, 85, 79, 53, 0, 1, 88, 234, 4, 134, 87, 0, 0, 248, 219, 0, 0, 88, 71, 0, 0, 119, 0, 11, 0, 0, 54, 56, 0, 0, 55, 67, 0, 85, 72, 54, 0, 25, 80, 72, 4, 85, 80, 55, 0, 1, 88, 31, 5, 134, 87, 0, 0, 248, 219, 0, 0, 88, 72, 0, 0, 119, 0, 1, 0, 0, 59, 9, 0, 19, 87, 59, 86, 0, 60, 87, 0, 0, 61, 7, 0, 19, 87, 61, 86, 0, 62, 87, 0, 17, 63, 62, 60, 120, 63, 4, 0, 0, 66, 8, 0, 137, 85, 0, 0, 139, 66, 0, 0, 0, 64, 9, 0, 19, 87, 64, 86, 0, 65, 87, 0, 85, 74, 65, 0, 1, 88, 155, 5, 134, 87, 0, 0, 248, 219, 0, 0, 88, 74, 0, 0, 0, 66, 8, 0, 137, 85, 0, 0, 139, 66, 0, 0, 140, 1, 116, 0, 0, 0, 0, 0, 1, 110, 0, 0, 136, 112, 0, 0, 0, 111, 112, 0, 136, 112, 0, 0, 25, 112, 112, 16, 137, 112, 0, 0, 130, 112, 0, 0, 136, 113, 0, 0, 49, 112, 112, 113, 200, 90, 0, 0, 1, 113, 16, 0, 135, 112, 0, 0, 113, 0, 0, 0, 25, 4, 111, 3, 0, 22, 0, 0, 1, 33, 0, 0, 0, 44, 22, 0, 2, 112, 0, 0, 255, 255, 0, 0, 19, 112, 44, 112, 0, 55, 112, 0, 38, 112, 55, 2, 0, 66, 112, 0, 32, 77, 66, 2, 121, 77, 21, 0, 1, 112, 0, 0, 1, 113, 0, 0, 1, 114, 232, 3, 1, 115, 72, 3, 134, 88, 0, 0, 148, 152, 0, 0, 112, 113, 114, 115, 38, 115, 88, 1, 0, 99, 115, 0, 0, 5, 33, 0, 38, 115, 5, 1, 0, 13, 115, 0, 38, 115, 13, 1, 0, 14, 115, 0, 20, 115, 14, 99, 0, 15, 115, 0, 33, 16, 15, 0, 38, 115, 16, 1, 0, 17, 115, 0, 0, 33, 17, 0, 0, 18, 22, 0, 2, 115, 0, 0, 255, 255, 0, 0, 19, 115, 18, 115, 0, 19, 115, 0, 38, 115, 19, 4, 0, 20, 115, 0, 32, 21, 20, 4, 121, 21, 21, 0, 1, 115, 232, 3, 1, 114, 0, 0, 1, 113, 220, 5, 1, 112, 208, 7, 134, 23, 0, 0, 148, 152, 0, 0, 115, 114, 113, 112, 38, 112, 23, 1, 0, 24, 112, 0, 0, 25, 33, 0, 38, 112, 25, 1, 0, 26, 112, 0, 38, 112, 26, 1, 0, 27, 112, 0, 20, 112, 27, 24, 0, 28, 112, 0, 33, 29, 28, 0, 38, 112, 29, 1, 0, 30, 112, 0, 0, 33, 30, 0, 0, 31, 22, 0, 2, 112, 0, 0, 255, 255, 0, 0, 19, 112, 31, 112, 0, 32, 112, 0, 38, 112, 32, 8, 0, 34, 112, 0, 32, 35, 34, 8, 121, 35, 21, 0, 1, 112, 0, 0, 1, 113, 72, 3, 1, 114, 232, 3, 1, 115, 95, 5, 134, 36, 0, 0, 148, 152, 0, 0, 112, 113, 114, 115, 38, 115, 36, 1, 0, 37, 115, 0, 0, 38, 33, 0, 38, 115, 38, 1, 0, 39, 115, 0, 38, 115, 39, 1, 0, 40, 115, 0, 20, 115, 40, 37, 0, 41, 115, 0, 33, 42, 41, 0, 38, 115, 42, 1, 0, 43, 115, 0, 0, 33, 43, 0, 0, 45, 22, 0, 2, 115, 0, 0, 255, 255, 0, 0, 19, 115, 45, 115, 0, 46, 115, 0, 38, 115, 46, 16, 0, 47, 115, 0, 32, 48, 47, 16, 121, 48, 21, 0, 1, 115, 0, 0, 1, 114, 95, 5, 1, 113, 232, 3, 1, 112, 208, 7, 134, 49, 0, 0, 148, 152, 0, 0, 115, 114, 113, 112, 38, 112, 49, 1, 0, 50, 112, 0, 0, 51, 33, 0, 38, 112, 51, 1, 0, 52, 112, 0, 38, 112, 52, 1, 0, 53, 112, 0, 20, 112, 53, 50, 0, 54, 112, 0, 33, 56, 54, 0, 38, 112, 56, 1, 0, 57, 112, 0, 0, 33, 57, 0, 0, 58, 33, 0, 38, 112, 58, 1, 0, 59, 112, 0, 121, 59, 12, 0, 0, 60, 33, 0, 38, 112, 60, 1, 0, 61, 112, 0, 38, 112, 61, 1, 0, 1, 112, 0, 83, 4, 1, 0, 78, 3, 4, 0, 38, 112, 3, 1, 0, 12, 112, 0, 137, 111, 0, 0, 139, 12, 0, 0, 0, 62, 22, 0, 2, 112, 0, 0, 255, 255, 0, 0, 19, 112, 62, 112, 0, 63, 112, 0, 38, 112, 63, 32, 0, 64, 112, 0, 32, 65, 64, 32, 121, 65, 21, 0, 1, 112, 208, 7, 1, 113, 0, 0, 1, 114, 184, 11, 1, 115, 72, 3, 134, 67, 0, 0, 148, 152, 0, 0, 112, 113, 114, 115, 38, 115, 67, 1, 0, 68, 115, 0, 0, 69, 33, 0, 38, 115, 69, 1, 0, 70, 115, 0, 38, 115, 70, 1, 0, 71, 115, 0, 20, 115, 71, 68, 0, 72, 115, 0, 33, 73, 72, 0, 38, 115, 73, 1, 0, 74, 115, 0, 0, 33, 74, 0, 0, 75, 22, 0, 2, 115, 0, 0, 255, 255, 0, 0, 19, 115, 75, 115, 0, 76, 115, 0, 38, 115, 76, 64, 0, 78, 115, 0, 32, 79, 78, 64, 121, 79, 21, 0, 1, 115, 220, 5, 1, 114, 0, 0, 1, 113, 208, 7, 1, 112, 208, 7, 134, 80, 0, 0, 148, 152, 0, 0, 115, 114, 113, 112, 38, 112, 80, 1, 0, 81, 112, 0, 0, 82, 33, 0, 38, 112, 82, 1, 0, 83, 112, 0, 38, 112, 83, 1, 0, 84, 112, 0, 20, 112, 84, 81, 0, 85, 112, 0, 33, 86, 85, 0, 38, 112, 86, 1, 0, 87, 112, 0, 0, 33, 87, 0, 0, 89, 22, 0, 2, 112, 0, 0, 255, 255, 0, 0, 19, 112, 89, 112, 0, 90, 112, 0, 1, 112, 128, 0, 19, 112, 90, 112, 0, 91, 112, 0, 1, 112, 128, 0, 13, 92, 91, 112, 121, 92, 21, 0, 1, 112, 208, 7, 1, 113, 72, 3, 1, 114, 184, 11, 1, 115, 95, 5, 134, 93, 0, 0, 148, 152, 0, 0, 112, 113, 114, 115, 38, 115, 93, 1, 0, 94, 115, 0, 0, 95, 33, 0, 38, 115, 95, 1, 0, 96, 115, 0, 38, 115, 96, 1, 0, 97, 115, 0, 20, 115, 97, 94, 0, 98, 115, 0, 33, 100, 98, 0, 38, 115, 100, 1, 0, 101, 115, 0, 0, 33, 101, 0, 0, 102, 22, 0, 2, 115, 0, 0, 255, 255, 0, 0, 19, 115, 102, 115, 0, 103, 115, 0, 1, 115, 0, 1, 19, 115, 103, 115, 0, 104, 115, 0, 1, 115, 0, 1, 13, 105, 104, 115, 121, 105, 21, 0, 1, 115, 208, 7, 1, 114, 95, 5, 1, 113, 184, 11, 1, 112, 208, 7, 134, 106, 0, 0, 148, 152, 0, 0, 115, 114, 113, 112, 38, 112, 106, 1, 0, 107, 112, 0, 0, 108, 33, 0, 38, 112, 108, 1, 0, 109, 112, 0, 38, 112, 109, 1, 0, 6, 112, 0, 20, 112, 6, 107, 0, 7, 112, 0, 33, 8, 7, 0, 38, 112, 8, 1, 0, 9, 112, 0, 0, 33, 9, 0, 0, 10, 33, 0, 38, 112, 10, 1, 0, 11, 112, 0, 38, 112, 11, 1, 0, 2, 112, 0, 83, 4, 2, 0, 78, 3, 4, 0, 38, 112, 3, 1, 0, 12, 112, 0, 137, 111, 0, 0, 139, 12, 0, 0, 140, 0, 67, 0, 0, 0, 0, 0, 2, 60, 0, 0, 68, 8, 0, 0, 1, 58, 0, 0, 136, 61, 0, 0, 0, 59, 61, 0, 136, 61, 0, 0, 25, 61, 61, 64, 137, 61, 0, 0, 130, 61, 0, 0, 136, 62, 0, 0, 49, 61, 61, 62, 48, 95, 0, 0, 1, 62, 64, 0, 135, 61, 0, 0, 62, 0, 0, 0, 25, 55, 59, 24, 25, 54, 59, 16, 25, 53, 59, 8, 0, 52, 59, 0, 25, 34, 59, 40, 25, 45, 59, 32, 134, 61, 0, 0, 52, 235, 0, 0, 1, 62, 94, 7, 134, 61, 0, 0, 232, 223, 0, 0, 62, 0, 0, 0, 1, 61, 116, 22, 78, 48, 61, 0, 38, 61, 48, 1, 0, 49, 61, 0, 121, 49, 6, 0, 1, 62, 189, 8, 134, 61, 0, 0, 232, 223, 0, 0, 62, 0, 0, 0, 119, 0, 5, 0, 1, 62, 205, 8, 134, 61, 0, 0, 232, 223, 0, 0, 62, 0, 0, 0, 1, 62, 223, 8, 134, 61, 0, 0, 232, 223, 0, 0, 62, 0, 0, 0, 1, 62, 149, 8, 134, 61, 0, 0, 232, 223, 0, 0, 62, 0, 0, 0, 1, 62, 165, 8, 134, 61, 0, 0, 232, 223, 0, 0, 62, 0, 0, 0, 1, 62, 177, 8, 134, 61, 0, 0, 232, 223, 0, 0, 62, 0, 0, 0, 1, 62, 226, 8, 134, 61, 0, 0, 232, 223, 0, 0, 62, 0, 0, 0, 1, 62, 46, 9, 134, 61, 0, 0, 232, 223, 0, 0, 62, 0, 0, 0, 1, 62, 244, 1, 134, 61, 0, 0, 176, 213, 0, 0, 62, 0, 0, 0, 134, 61, 0, 0, 196, 226, 0, 0, 1, 62, 64, 9, 134, 61, 0, 0, 232, 223, 0, 0, 62, 0, 0, 0, 134, 61, 0, 0, 104, 235, 0, 0, 1, 62, 105, 7, 134, 61, 0, 0, 232, 223, 0, 0, 62, 0, 0, 0, 1, 62, 200, 0, 134, 61, 0, 0, 176, 213, 0, 0, 62, 0, 0, 0, 1, 62, 101, 0, 1, 63, 159, 0, 59, 64, 0, 0, 134, 61, 0, 0, 252, 212, 0, 0, 62, 63, 64, 0, 134, 61, 0, 0, 184, 234, 0, 0, 134, 61, 0, 0, 4, 235, 0, 0, 134, 61, 0, 0, 148, 225, 0, 0, 1, 64, 244, 1, 134, 61, 0, 0, 176, 213, 0, 0, 64, 0, 0, 0, 1, 23, 2, 0, 1, 61, 0, 0, 85, 34, 61, 0, 1, 64, 0, 0, 109, 34, 4, 64, 1, 64, 0, 0, 85, 45, 64, 0, 1, 61, 0, 0, 109, 45, 4, 61, 1, 64, 184, 11, 134, 61, 0, 0, 176, 213, 0, 0, 64, 0, 0, 0, 1, 64, 237, 7, 134, 61, 0, 0, 248, 219, 0, 0, 64, 52, 0, 0, 1, 64, 99, 0, 1, 63, 16, 39, 134, 61, 0, 0, 92, 202, 0, 0, 64, 63, 0, 0, 1, 12, 0, 0, 1, 0, 1, 0, 0, 50, 12, 0, 41, 61, 50, 2, 3, 51, 34, 61, 82, 2, 51, 0, 25, 3, 2, 1, 85, 51, 3, 0, 0, 4, 12, 0, 1, 61, 0, 0, 1, 63, 2, 0, 138, 4, 61, 63, 44, 97, 0, 0, 92, 97, 0, 0, 1, 63, 8, 8, 134, 61, 0, 0, 248, 219, 0, 0, 63, 53, 0, 0, 119, 0, 26, 0, 0, 5, 12, 0, 41, 61, 5, 2, 3, 6, 45, 61, 82, 7, 6, 0, 134, 8, 0, 0, 128, 158, 0, 0, 7, 0, 0, 0, 0, 9, 12, 0, 41, 61, 9, 2, 3, 10, 45, 61, 85, 10, 8, 0, 119, 0, 14, 0, 0, 11, 12, 0, 41, 61, 11, 2, 3, 13, 45, 61, 82, 14, 13, 0, 1, 61, 0, 0, 134, 15, 0, 0, 44, 67, 0, 0, 61, 14, 0, 0, 0, 16, 12, 0, 41, 61, 16, 2, 3, 17, 45, 61, 85, 17, 15, 0, 119, 0, 1, 0, 0, 18, 12, 0, 0, 19, 12, 0, 41, 61, 19, 2, 3, 20, 45, 61, 82, 21, 20, 0, 85, 54, 18, 0, 25, 56, 54, 4, 85, 56, 21, 0, 1, 63, 45, 8, 134, 61, 0, 0, 248, 219, 0, 0, 63, 54, 0, 0, 1, 1, 0, 0, 0, 22, 12, 0, 25, 24, 22, 1, 0, 12, 24, 0, 0, 25, 12, 0, 30, 61, 25, 2, 38, 61, 61, 255, 0, 26, 61, 0, 0, 12, 26, 0, 0, 27, 1, 0, 25, 28, 27, 1, 0, 1, 28, 0, 0, 29, 12, 0, 0, 30, 12, 0, 41, 61, 30, 2, 3, 31, 45, 61, 82, 32, 31, 0, 85, 55, 29, 0, 25, 57, 55, 4, 85, 57, 32, 0, 134, 61, 0, 0, 248, 219, 0, 0, 60, 55, 0, 0, 0, 33, 12, 0, 41, 61, 33, 2, 3, 35, 45, 61, 82, 36, 35, 0, 32, 37, 36, 100, 0, 38, 1, 0, 36, 39, 38, 2, 1, 61, 0, 0, 125, 40, 37, 39, 61, 0, 0, 0, 120, 40, 224, 255, 119, 0, 1, 0, 0, 41, 12, 0, 41, 61, 41, 2, 3, 42, 45, 61, 82, 43, 42, 0, 32, 44, 43, 100, 121, 44, 2, 0, 1, 0, 0, 0, 0, 46, 0, 0, 38, 61, 46, 1, 0, 47, 61, 0, 120, 47, 156, 255, 119, 0, 1, 0, 1, 63, 51, 0, 1, 64, 100, 0, 1, 62, 1, 0, 1, 65, 16, 39, 1, 66, 10, 0, 134, 61, 0, 0, 76, 46, 0, 0, 63, 64, 62, 65, 66, 0, 0, 0, 134, 61, 0, 0, 64, 218, 0, 0, 137, 59, 0, 0, 139, 0, 0, 0, 140, 3, 64, 0, 0, 0, 0, 0, 2, 59, 0, 0, 128, 128, 128, 128, 2, 60, 0, 0, 255, 254, 254, 254, 2, 61, 0, 0, 255, 0, 0, 0, 1, 57, 0, 0, 136, 62, 0, 0, 0, 58, 62, 0, 19, 62, 1, 61, 0, 38, 62, 0, 0, 49, 0, 0, 38, 62, 49, 3, 0, 50, 62, 0, 33, 51, 50, 0, 33, 52, 2, 0, 19, 62, 52, 51, 0, 56, 62, 0, 121, 56, 34, 0, 19, 62, 1, 61, 0, 53, 62, 0, 0, 6, 0, 0, 0, 9, 2, 0, 78, 54, 6, 0, 41, 62, 54, 24, 42, 62, 62, 24, 41, 63, 53, 24, 42, 63, 63, 24, 13, 18, 62, 63, 121, 18, 5, 0, 0, 5, 6, 0, 0, 8, 9, 0, 1, 57, 6, 0, 119, 0, 23, 0, 25, 19, 6, 1, 26, 20, 9, 1, 0, 21, 19, 0, 38, 63, 21, 3, 0, 22, 63, 0, 33, 23, 22, 0, 33, 24, 20, 0, 19, 63, 24, 23, 0, 55, 63, 0, 121, 55, 4, 0, 0, 6, 19, 0, 0, 9, 20, 0, 119, 0, 233, 255, 0, 4, 19, 0, 0, 7, 20, 0, 0, 17, 24, 0, 1, 57, 5, 0, 119, 0, 5, 0, 0, 4, 0, 0, 0, 7, 2, 0, 0, 17, 52, 0, 1, 57, 5, 0, 32, 63, 57, 5, 121, 63, 8, 0, 121, 17, 5, 0, 0, 5, 4, 0, 0, 8, 7, 0, 1, 57, 6, 0, 119, 0, 3, 0, 0, 14, 4, 0, 1, 16, 0, 0, 32, 63, 57, 6, 121, 63, 83, 0, 78, 25, 5, 0, 19, 63, 1, 61, 0, 26, 63, 0, 41, 63, 25, 24, 42, 63, 63, 24, 41, 62, 26, 24, 42, 62, 62, 24, 13, 27, 63, 62, 121, 27, 4, 0, 0, 14, 5, 0, 0, 16, 8, 0, 119, 0, 71, 0, 2, 62, 0, 0, 1, 1, 1, 1, 5, 28, 38, 62, 1, 62, 3, 0, 16, 29, 62, 8, 121, 29, 33, 0, 0, 10, 5, 0, 0, 12, 8, 0, 82, 30, 10, 0, 21, 62, 30, 28, 0, 31, 62, 0, 2, 62, 0, 0, 1, 1, 1, 1, 4, 32, 31, 62, 19, 62, 31, 59, 0, 33, 62, 0, 21, 62, 33, 59, 0, 34, 62, 0, 19, 62, 34, 32, 0, 35, 62, 0, 32, 36, 35, 0, 120, 36, 2, 0, 119, 0, 13, 0, 25, 37, 10, 4, 26, 39, 12, 4, 1, 62, 3, 0, 16, 40, 62, 39, 121, 40, 4, 0, 0, 10, 37, 0, 0, 12, 39, 0, 119, 0, 234, 255, 0, 3, 37, 0, 0, 11, 39, 0, 1, 57, 11, 0, 119, 0, 7, 0, 0, 13, 10, 0, 0, 15, 12, 0, 119, 0, 4, 0, 0, 3, 5, 0, 0, 11, 8, 0, 1, 57, 11, 0, 32, 62, 57, 11, 121, 62, 8, 0, 32, 41, 11, 0, 121, 41, 4, 0, 0, 14, 3, 0, 1, 16, 0, 0, 119, 0, 23, 0, 0, 13, 3, 0, 0, 15, 11, 0, 78, 42, 13, 0, 41, 62, 42, 24, 42, 62, 62, 24, 41, 63, 26, 24, 42, 63, 63, 24, 13, 43, 62, 63, 121, 43, 4, 0, 0, 14, 13, 0, 0, 16, 15, 0, 119, 0, 11, 0, 25, 44, 13, 1, 26, 45, 15, 1, 32, 46, 45, 0, 121, 46, 4, 0, 0, 14, 44, 0, 1, 16, 0, 0, 119, 0, 4, 0, 0, 13, 44, 0, 0, 15, 45, 0, 119, 0, 237, 255, 33, 47, 16, 0, 1, 63, 0, 0, 125, 48, 47, 14, 63, 0, 0, 0, 139, 48, 0, 0, 140, 3, 69, 0, 0, 0, 0, 0, 2, 66, 0, 0, 146, 0, 0, 0, 1, 64, 0, 0, 136, 67, 0, 0, 0, 65, 67, 0, 136, 67, 0, 0, 25, 67, 67, 48, 137, 67, 0, 0, 130, 67, 0, 0, 136, 68, 0, 0, 49, 67, 67, 68, 100, 101, 0, 0, 1, 68, 48, 0, 135, 67, 0, 0, 68, 0, 0, 0, 25, 59, 65, 16, 0, 58, 65, 0, 25, 30, 65, 32, 25, 41, 0, 28, 82, 52, 41, 0, 85, 30, 52, 0, 25, 54, 30, 4, 25, 55, 0, 20, 82, 56, 55, 0, 4, 57, 56, 52, 85, 54, 57, 0, 25, 10, 30, 8, 85, 10, 1, 0, 25, 11, 30, 12, 85, 11, 2, 0, 3, 12, 57, 2, 25, 13, 0, 60, 82, 14, 13, 0, 0, 15, 30, 0, 85, 58, 14, 0, 25, 60, 58, 4, 85, 60, 15, 0, 25, 61, 58, 8, 1, 67, 2, 0, 85, 61, 67, 0, 135, 16, 4, 0, 66, 58, 0, 0, 134, 17, 0, 0, 236, 227, 0, 0, 16, 0, 0, 0, 13, 18, 12, 17, 121, 18, 3, 0, 1, 64, 3, 0, 119, 0, 69, 0, 1, 4, 2, 0, 0, 5, 12, 0, 0, 6, 30, 0, 0, 26, 17, 0, 34, 25, 26, 0, 120, 25, 44, 0, 4, 35, 5, 26, 25, 36, 6, 4, 82, 37, 36, 0, 16, 38, 37, 26, 25, 39, 6, 8, 125, 9, 38, 39, 6, 0, 0, 0, 41, 67, 38, 31, 42, 67, 67, 31, 0, 40, 67, 0, 3, 8, 40, 4, 1, 67, 0, 0, 125, 42, 38, 37, 67, 0, 0, 0, 4, 3, 26, 42, 82, 43, 9, 0, 3, 44, 43, 3, 85, 9, 44, 0, 25, 45, 9, 4, 82, 46, 45, 0, 4, 47, 46, 3, 85, 45, 47, 0, 82, 48, 13, 0, 0, 49, 9, 0, 85, 59, 48, 0, 25, 62, 59, 4, 85, 62, 49, 0, 25, 63, 59, 8, 85, 63, 8, 0, 135, 50, 4, 0, 66, 59, 0, 0, 134, 51, 0, 0, 236, 227, 0, 0, 50, 0, 0, 0, 13, 53, 35, 51, 121, 53, 3, 0, 1, 64, 3, 0, 119, 0, 25, 0, 0, 4, 8, 0, 0, 5, 35, 0, 0, 6, 9, 0, 0, 26, 51, 0, 119, 0, 212, 255, 25, 27, 0, 16, 1, 67, 0, 0, 85, 27, 67, 0, 1, 67, 0, 0, 85, 41, 67, 0, 1, 67, 0, 0, 85, 55, 67, 0, 82, 28, 0, 0, 39, 67, 28, 32, 0, 29, 67, 0, 85, 0, 29, 0, 32, 31, 4, 2, 121, 31, 3, 0, 1, 7, 0, 0, 119, 0, 5, 0, 25, 32, 6, 4, 82, 33, 32, 0, 4, 34, 2, 33, 0, 7, 34, 0, 32, 67, 64, 3, 121, 67, 11, 0, 25, 19, 0, 44, 82, 20, 19, 0, 25, 21, 0, 48, 82, 22, 21, 0, 3, 23, 20, 22, 25, 24, 0, 16, 85, 24, 23, 0, 85, 41, 20, 0, 85, 55, 20, 0, 0, 7, 2, 0, 137, 65, 0, 0, 139, 7, 0, 0, 140, 3, 77, 0, 0, 0, 0, 0, 1, 74, 0, 0, 136, 76, 0, 0, 0, 75, 76, 0, 82, 29, 0, 0, 2, 76, 0, 0, 34, 237, 251, 106, 3, 40, 29, 76, 25, 51, 0, 8, 82, 62, 51, 0, 134, 68, 0, 0, 252, 230, 0, 0, 62, 40, 0, 0, 25, 69, 0, 12, 82, 70, 69, 0, 134, 9, 0, 0, 252, 230, 0, 0, 70, 40, 0, 0, 25, 10, 0, 16, 82, 11, 10, 0, 134, 12, 0, 0, 252, 230, 0, 0, 11, 40, 0, 0, 43, 76, 1, 2, 0, 13, 76, 0, 16, 14, 68, 13, 121, 14, 114, 0, 41, 76, 68, 2, 0, 15, 76, 0, 4, 16, 1, 15, 16, 17, 9, 16, 16, 18, 12, 16, 19, 76, 17, 18, 0, 71, 76, 0, 121, 71, 104, 0, 20, 76, 12, 9, 0, 19, 76, 0, 38, 76, 19, 3, 0, 20, 76, 0, 32, 21, 20, 0, 121, 21, 96, 0, 43, 76, 9, 2, 0, 22, 76, 0, 43, 76, 12, 2, 0, 23, 76, 0, 1, 4, 0, 0, 0, 5, 68, 0, 43, 76, 5, 1, 0, 24, 76, 0, 3, 25, 4, 24, 41, 76, 25, 1, 0, 26, 76, 0, 3, 27, 26, 22, 41, 76, 27, 2, 3, 28, 0, 76, 82, 30, 28, 0, 134, 31, 0, 0, 252, 230, 0, 0, 30, 40, 0, 0, 25, 32, 27, 1, 41, 76, 32, 2, 3, 33, 0, 76, 82, 34, 33, 0, 134, 35, 0, 0, 252, 230, 0, 0, 34, 40, 0, 0, 16, 36, 35, 1, 4, 37, 1, 35, 16, 38, 31, 37, 19, 76, 36, 38, 0, 72, 76, 0, 120, 72, 3, 0, 1, 8, 0, 0, 119, 0, 68, 0, 3, 39, 35, 31, 3, 41, 0, 39, 78, 42, 41, 0, 41, 76, 42, 24, 42, 76, 76, 24, 32, 43, 76, 0, 120, 43, 3, 0, 1, 8, 0, 0, 119, 0, 59, 0, 3, 44, 0, 35, 134, 45, 0, 0, 252, 204, 0, 0, 2, 44, 0, 0, 32, 46, 45, 0, 120, 46, 14, 0, 32, 65, 5, 1, 34, 66, 45, 0, 4, 67, 5, 24, 125, 7, 66, 24, 67, 0, 0, 0, 125, 6, 66, 4, 25, 0, 0, 0, 121, 65, 3, 0, 1, 8, 0, 0, 119, 0, 43, 0, 0, 4, 6, 0, 0, 5, 7, 0, 119, 0, 202, 255, 3, 47, 26, 23, 41, 76, 47, 2, 3, 48, 0, 76, 82, 49, 48, 0, 134, 50, 0, 0, 252, 230, 0, 0, 49, 40, 0, 0, 25, 52, 47, 1, 41, 76, 52, 2, 3, 53, 0, 76, 82, 54, 53, 0, 134, 55, 0, 0, 252, 230, 0, 0, 54, 40, 0, 0, 16, 56, 55, 1, 4, 57, 1, 55, 16, 58, 50, 57, 19, 76, 56, 58, 0, 73, 76, 0, 121, 73, 13, 0, 3, 59, 0, 55, 3, 60, 55, 50, 3, 61, 0, 60, 78, 63, 61, 0, 41, 76, 63, 24, 42, 76, 76, 24, 32, 64, 76, 0, 1, 76, 0, 0, 125, 3, 64, 59, 76, 0, 0, 0, 0, 8, 3, 0, 119, 0, 8, 0, 1, 8, 0, 0, 119, 0, 6, 0, 1, 8, 0, 0, 119, 0, 4, 0, 1, 8, 0, 0, 119, 0, 2, 0, 1, 8, 0, 0, 139, 8, 0, 0, 140, 0, 33, 0, 0, 0, 0, 0, 2, 26, 0, 0, 32, 3, 0, 0, 1, 24, 0, 0, 136, 27, 0, 0, 0, 25, 27, 0, 136, 27, 0, 0, 25, 27, 27, 32, 137, 27, 0, 0, 130, 27, 0, 0, 136, 28, 0, 0, 49, 27, 27, 28, 180, 105, 0, 0, 1, 28, 32, 0, 135, 27, 0, 0, 28, 0, 0, 0, 25, 23, 25, 8, 0, 22, 25, 0, 1, 1, 32, 3, 1, 28, 99, 10, 134, 27, 0, 0, 248, 219, 0, 0, 28, 22, 0, 0, 1, 27, 120, 26, 78, 15, 27, 0, 38, 27, 15, 1, 0, 16, 27, 0, 121, 16, 5, 0, 1, 0, 12, 0, 0, 14, 0, 0, 137, 25, 0, 0, 139, 14, 0, 0, 1, 27, 172, 23, 82, 17, 27, 0, 1, 27, 4, 0, 15, 18, 27, 17, 121, 18, 5, 0, 1, 0, 14, 0, 0, 14, 0, 0, 137, 25, 0, 0, 139, 14, 0, 0, 1, 27, 176, 23, 82, 19, 27, 0, 1, 27, 4, 0, 15, 20, 27, 19, 121, 20, 5, 0, 1, 0, 14, 0, 0, 14, 0, 0, 137, 25, 0, 0, 139, 14, 0, 0, 1, 27, 136, 23, 82, 21, 27, 0, 25, 2, 21, 1, 1, 27, 136, 23, 85, 27, 2, 0, 1, 27, 43, 0, 1, 28, 100, 0, 1, 29, 1, 0, 1, 30, 64, 31, 1, 31, 3, 0, 134, 3, 0, 0, 76, 46, 0, 0, 27, 28, 29, 30, 31, 0, 0, 0, 0, 12, 3, 0, 0, 4, 12, 0, 41, 31, 4, 24, 42, 31, 31, 24, 33, 5, 31, 0, 121, 5, 7, 0, 0, 6, 12, 0, 0, 0, 6, 0, 0, 14, 0, 0, 137, 25, 0, 0, 139, 14, 0, 0, 119, 0, 173, 0, 1, 30, 65, 0, 1, 29, 0, 0, 1, 28, 1, 0, 134, 31, 0, 0, 160, 128, 0, 0, 30, 29, 28, 0, 1, 31, 98, 2, 1, 28, 58, 7, 1, 29, 50, 0, 1, 30, 1, 0, 1, 27, 184, 11, 1, 32, 3, 0, 134, 7, 0, 0, 108, 85, 0, 0, 31, 28, 29, 30, 27, 32, 0, 0, 0, 12, 7, 0, 1, 27, 140, 255, 1, 30, 0, 0, 1, 29, 1, 0, 134, 32, 0, 0, 160, 128, 0, 0, 27, 30, 29, 0, 1, 29, 100, 0, 1, 30, 0, 0, 1, 27, 1, 0, 134, 32, 0, 0, 160, 128, 0, 0, 29, 30, 27, 0, 134, 32, 0, 0, 176, 213, 0, 0, 26, 0, 0, 0, 134, 32, 0, 0, 228, 232, 0, 0, 134, 32, 0, 0, 176, 213, 0, 0, 26, 0, 0, 0, 1, 27, 100, 0, 1, 30, 0, 0, 1, 29, 1, 0, 134, 32, 0, 0, 160, 128, 0, 0, 27, 30, 29, 0, 134, 32, 0, 0, 176, 213, 0, 0, 26, 0, 0, 0, 134, 32, 0, 0, 104, 232, 0, 0, 134, 32, 0, 0, 176, 213, 0, 0, 26, 0, 0, 0, 1, 29, 100, 0, 1, 30, 0, 0, 1, 27, 1, 0, 134, 32, 0, 0, 160, 128, 0, 0, 29, 30, 27, 0, 134, 32, 0, 0, 176, 213, 0, 0, 26, 0, 0, 0, 134, 32, 0, 0, 228, 232, 0, 0, 134, 32, 0, 0, 176, 213, 0, 0, 26, 0, 0, 0, 1, 27, 100, 0, 1, 30, 0, 0, 1, 29, 1, 0, 134, 32, 0, 0, 160, 128, 0, 0, 27, 30, 29, 0, 134, 32, 0, 0, 176, 213, 0, 0, 26, 0, 0, 0, 134, 32, 0, 0, 104, 232, 0, 0, 134, 32, 0, 0, 176, 213, 0, 0, 26, 0, 0, 0, 1, 29, 100, 0, 1, 30, 0, 0, 1, 27, 1, 0, 134, 32, 0, 0, 160, 128, 0, 0, 29, 30, 27, 0, 134, 32, 0, 0, 176, 213, 0, 0, 26, 0, 0, 0, 134, 32, 0, 0, 228, 232, 0, 0, 134, 32, 0, 0, 176, 213, 0, 0, 26, 0, 0, 0, 1, 27, 100, 0, 1, 30, 0, 0, 1, 29, 1, 0, 134, 32, 0, 0, 160, 128, 0, 0, 27, 30, 29, 0, 134, 32, 0, 0, 176, 213, 0, 0, 26, 0, 0, 0, 134, 32, 0, 0, 104, 232, 0, 0, 134, 32, 0, 0, 176, 213, 0, 0, 26, 0, 0, 0, 1, 29, 100, 0, 1, 30, 0, 0, 1, 27, 1, 0, 134, 32, 0, 0, 160, 128, 0, 0, 29, 30, 27, 0, 134, 32, 0, 0, 176, 213, 0, 0, 26, 0, 0, 0, 134, 32, 0, 0, 228, 232, 0, 0, 134, 32, 0, 0, 176, 213, 0, 0, 26, 0, 0, 0, 1, 27, 100, 0, 1, 30, 0, 0, 1, 29, 1, 0, 134, 32, 0, 0, 160, 128, 0, 0, 27, 30, 29, 0, 134, 32, 0, 0, 176, 213, 0, 0, 26, 0, 0, 0, 134, 32, 0, 0, 104, 232, 0, 0, 134, 32, 0, 0, 176, 213, 0, 0, 26, 0, 0, 0, 1, 29, 100, 0, 1, 30, 0, 0, 1, 27, 1, 0, 134, 32, 0, 0, 160, 128, 0, 0, 29, 30, 27, 0, 1, 32, 172, 23, 82, 8, 32, 0, 25, 9, 8, 4, 1, 32, 172, 23, 85, 32, 9, 0, 1, 32, 176, 23, 82, 10, 32, 0, 25, 11, 10, 4, 1, 32, 176, 23, 85, 32, 11, 0, 1, 32, 120, 26, 1, 27, 1, 0, 83, 32, 27, 0, 1, 32, 117, 10, 134, 27, 0, 0, 248, 219, 0, 0, 32, 23, 0, 0, 1, 27, 46, 0, 1, 32, 100, 0, 1, 30, 0, 0, 1, 29, 64, 31, 1, 28, 3, 0, 134, 13, 0, 0, 76, 46, 0, 0, 27, 32, 30, 29, 28, 0, 0, 0, 0, 12, 13, 0, 1, 0, 0, 0, 0, 14, 0, 0, 137, 25, 0, 0, 139, 14, 0, 0, 1, 28, 0, 0, 139, 28, 0, 0, 140, 1, 48, 0, 0, 0, 0, 0, 1, 40, 0, 0, 136, 42, 0, 0, 0, 41, 42, 0, 136, 42, 0, 0, 25, 42, 42, 16, 137, 42, 0, 0, 130, 42, 0, 0, 136, 43, 0, 0, 49, 42, 42, 43, 152, 109, 0, 0, 1, 43, 16, 0, 135, 42, 0, 0, 43, 0, 0, 0, 0, 39, 41, 0, 0, 13, 0, 0, 0, 33, 13, 0, 85, 39, 33, 0, 1, 43, 247, 8, 134, 42, 0, 0, 248, 219, 0, 0, 43, 39, 0, 0, 0, 34, 13, 0, 1, 42, 126, 26, 3, 35, 42, 34, 78, 36, 35, 0, 38, 42, 36, 1, 0, 37, 42, 0, 121, 37, 5, 0, 1, 2, 12, 0, 0, 32, 2, 0, 137, 41, 0, 0, 139, 32, 0, 0, 0, 38, 13, 0, 1, 42, 0, 0, 1, 43, 3, 0, 138, 38, 42, 43, 20, 110, 0, 0, 28, 110, 0, 0, 36, 110, 0, 0, 1, 2, 11, 0, 0, 32, 2, 0, 137, 41, 0, 0, 139, 32, 0, 0, 119, 0, 7, 0, 1, 1, 140, 23, 119, 0, 5, 0, 1, 1, 144, 23, 119, 0, 3, 0, 1, 1, 148, 23, 119, 0, 1, 0, 82, 3, 1, 0, 25, 4, 3, 1, 85, 1, 4, 0, 0, 5, 13, 0, 1, 42, 0, 0, 1, 43, 3, 0, 138, 5, 42, 43, 88, 110, 0, 0, 192, 110, 0, 0, 40, 111, 0, 0, 119, 0, 67, 0, 1, 42, 140, 23, 82, 6, 42, 0, 25, 7, 6, 1, 1, 42, 140, 23, 85, 42, 7, 0, 1, 42, 53, 0, 1, 43, 100, 0, 1, 44, 1, 0, 1, 45, 64, 31, 1, 46, 10, 0, 134, 8, 0, 0, 76, 46, 0, 0, 42, 43, 44, 45, 46, 0, 0, 0, 0, 24, 8, 0, 0, 9, 24, 0, 41, 46, 9, 24, 42, 46, 46, 24, 33, 10, 46, 0, 121, 10, 47, 0, 0, 11, 24, 0, 0, 2, 11, 0, 0, 32, 2, 0, 137, 41, 0, 0, 139, 32, 0, 0, 119, 0, 41, 0, 1, 46, 144, 23, 82, 12, 46, 0, 25, 14, 12, 1, 1, 46, 144, 23, 85, 46, 14, 0, 1, 46, 48, 0, 1, 45, 100, 0, 1, 44, 1, 0, 1, 43, 64, 31, 1, 42, 10, 0, 134, 15, 0, 0, 76, 46, 0, 0, 46, 45, 44, 43, 42, 0, 0, 0, 0, 24, 15, 0, 0, 16, 24, 0, 41, 42, 16, 24, 42, 42, 42, 24, 33, 17, 42, 0, 121, 17, 21, 0, 0, 18, 24, 0, 0, 2, 18, 0, 0, 32, 2, 0, 137, 41, 0, 0, 139, 32, 0, 0, 119, 0, 15, 0, 1, 42, 148, 23, 82, 19, 42, 0, 25, 20, 19, 1, 1, 42, 148, 23, 85, 42, 20, 0, 1, 43, 15, 0, 134, 42, 0, 0, 28, 136, 0, 0, 43, 0, 0, 0, 1, 2, 0, 0, 0, 32, 2, 0, 137, 41, 0, 0, 139, 32, 0, 0, 119, 0, 1, 0, 0, 21, 13, 0, 1, 42, 0, 0, 1, 43, 2, 0, 138, 21, 42, 43, 124, 111, 0, 0, 188, 111, 0, 0, 119, 0, 33, 0, 1, 42, 82, 3, 1, 43, 94, 1, 1, 44, 80, 0, 1, 45, 1, 0, 1, 46, 64, 31, 1, 47, 10, 0, 134, 22, 0, 0, 108, 85, 0, 0, 42, 43, 44, 45, 46, 47, 0, 0, 0, 24, 22, 0, 1, 46, 4, 0, 134, 47, 0, 0, 12, 216, 0, 0, 46, 0, 0, 0, 119, 0, 17, 0, 1, 47, 100, 2, 1, 46, 94, 1, 1, 45, 80, 0, 1, 44, 1, 0, 1, 43, 64, 31, 1, 42, 10, 0, 134, 23, 0, 0, 108, 85, 0, 0, 47, 46, 45, 44, 43, 42, 0, 0, 0, 24, 23, 0, 1, 43, 4, 0, 134, 42, 0, 0, 12, 216, 0, 0, 43, 0, 0, 0, 119, 0, 1, 0, 0, 25, 13, 0, 1, 42, 123, 26, 3, 26, 42, 25, 1, 42, 1, 0, 83, 26, 42, 0, 0, 27, 24, 0, 41, 42, 27, 24, 42, 42, 42, 24, 33, 28, 42, 0, 121, 28, 7, 0, 0, 29, 24, 0, 0, 2, 29, 0, 0, 32, 2, 0, 137, 41, 0, 0, 139, 32, 0, 0, 119, 0, 15, 0, 0, 30, 13, 0, 1, 42, 126, 26, 3, 31, 42, 30, 1, 42, 1, 0, 83, 31, 42, 0, 1, 43, 176, 255, 1, 44, 208, 7, 134, 42, 0, 0, 92, 202, 0, 0, 43, 44, 0, 0, 1, 2, 0, 0, 0, 32, 2, 0, 137, 41, 0, 0, 139, 32, 0, 0, 1, 42, 0, 0, 139, 42, 0, 0, 140, 2, 55, 0, 0, 0, 0, 0, 2, 52, 0, 0, 128, 128, 128, 128, 2, 53, 0, 0, 255, 254, 254, 254, 1, 50, 0, 0, 136, 54, 0, 0, 0, 51, 54, 0, 0, 25, 1, 0, 0, 36, 0, 0, 21, 54, 25, 36, 0, 44, 54, 0, 38, 54, 44, 3, 0, 45, 54, 0, 32, 46, 45, 0, 121, 46, 74, 0, 38, 54, 25, 3, 0, 47, 54, 0, 32, 48, 47, 0, 121, 48, 4, 0, 0, 5, 1, 0, 0, 7, 0, 0, 119, 0, 24, 0, 0, 6, 1, 0, 0, 8, 0, 0, 78, 49, 6, 0, 83, 8, 49, 0, 41, 54, 49, 24, 42, 54, 54, 24, 32, 15, 54, 0, 121, 15, 3, 0, 0, 9, 8, 0, 119, 0, 60, 0, 25, 16, 6, 1, 25, 17, 8, 1, 0, 18, 16, 0, 38, 54, 18, 3, 0, 19, 54, 0, 32, 20, 19, 0, 121, 20, 4, 0, 0, 5, 16, 0, 0, 7, 17, 0, 119, 0, 4, 0, 0, 6, 16, 0, 0, 8, 17, 0, 119, 0, 236, 255, 82, 21, 5, 0, 2, 54, 0, 0, 1, 1, 1, 1, 4, 22, 21, 54, 19, 54, 21, 52, 0, 23, 54, 0, 21, 54, 23, 52, 0, 24, 54, 0, 19, 54, 24, 22, 0, 26, 54, 0, 32, 27, 26, 0, 121, 27, 26, 0, 0, 4, 7, 0, 0, 10, 5, 0, 0, 30, 21, 0, 25, 28, 10, 4, 25, 29, 4, 4, 85, 4, 30, 0, 82, 31, 28, 0, 2, 54, 0, 0, 1, 1, 1, 1, 4, 32, 31, 54, 19, 54, 31, 52, 0, 33, 54, 0, 21, 54, 33, 52, 0, 34, 54, 0, 19, 54, 34, 32, 0, 35, 54, 0, 32, 37, 35, 0, 121, 37, 5, 0, 0, 4, 29, 0, 0, 10, 28, 0, 0, 30, 31, 0, 119, 0, 238, 255, 0, 2, 28, 0, 0, 3, 29, 0, 119, 0, 3, 0, 0, 2, 5, 0, 0, 3, 7, 0, 0, 11, 2, 0, 0, 12, 3, 0, 1, 50, 8, 0, 119, 0, 4, 0, 0, 11, 1, 0, 0, 12, 0, 0, 1, 50, 8, 0, 32, 54, 50, 8, 121, 54, 24, 0, 78, 38, 11, 0, 83, 12, 38, 0, 41, 54, 38, 24, 42, 54, 54, 24, 32, 39, 54, 0, 121, 39, 3, 0, 0, 9, 12, 0, 119, 0, 16, 0, 0, 13, 12, 0, 0, 14, 11, 0, 25, 40, 14, 1, 25, 41, 13, 1, 78, 42, 40, 0, 83, 41, 42, 0, 41, 54, 42, 24, 42, 54, 54, 24, 32, 43, 54, 0, 121, 43, 3, 0, 0, 9, 41, 0, 119, 0, 4, 0, 0, 13, 41, 0, 0, 14, 40, 0, 119, 0, 244, 255, 139, 9, 0, 0, 140, 3, 65, 0, 0, 0, 0, 0, 2, 62, 0, 0, 255, 0, 0, 0, 2, 63, 0, 0, 128, 0, 0, 0, 1, 60, 0, 0, 136, 64, 0, 0, 0, 61, 64, 0, 1, 64, 0, 0, 13, 24, 0, 64, 121, 24, 3, 0, 1, 3, 1, 0, 119, 0, 146, 0, 35, 35, 1, 128, 121, 35, 6, 0, 19, 64, 1, 62, 0, 46, 64, 0, 83, 0, 46, 0, 1, 3, 1, 0, 119, 0, 139, 0, 134, 54, 0, 0, 20, 233, 0, 0, 1, 64, 188, 0, 3, 55, 54, 64, 82, 56, 55, 0, 82, 57, 56, 0, 1, 64, 0, 0, 13, 58, 57, 64, 121, 58, 18, 0, 38, 64, 1, 128, 0, 4, 64, 0, 2, 64, 0, 0, 128, 223, 0, 0, 13, 5, 4, 64, 121, 5, 6, 0, 19, 64, 1, 62, 0, 7, 64, 0, 83, 0, 7, 0, 1, 3, 1, 0, 119, 0, 119, 0, 134, 6, 0, 0, 228, 231, 0, 0, 1, 64, 84, 0, 85, 6, 64, 0, 1, 3, 255, 255, 119, 0, 113, 0, 1, 64, 0, 8, 16, 8, 1, 64, 121, 8, 19, 0, 43, 64, 1, 6, 0, 9, 64, 0, 1, 64, 192, 0, 20, 64, 9, 64, 0, 10, 64, 0, 19, 64, 10, 62, 0, 11, 64, 0, 25, 12, 0, 1, 83, 0, 11, 0, 38, 64, 1, 63, 0, 13, 64, 0, 20, 64, 13, 63, 0, 14, 64, 0, 19, 64, 14, 62, 0, 15, 64, 0, 83, 12, 15, 0, 1, 3, 2, 0, 119, 0, 92, 0, 2, 64, 0, 0, 0, 216, 0, 0, 16, 16, 1, 64, 1, 64, 0, 224, 19, 64, 1, 64, 0, 17, 64, 0, 2, 64, 0, 0, 0, 224, 0, 0, 13, 18, 17, 64, 20, 64, 16, 18, 0, 59, 64, 0, 121, 59, 29, 0, 43, 64, 1, 12, 0, 19, 64, 0, 1, 64, 224, 0, 20, 64, 19, 64, 0, 20, 64, 0, 19, 64, 20, 62, 0, 21, 64, 0, 25, 22, 0, 1, 83, 0, 21, 0, 43, 64, 1, 6, 0, 23, 64, 0, 38, 64, 23, 63, 0, 25, 64, 0, 20, 64, 25, 63, 0, 26, 64, 0, 19, 64, 26, 62, 0, 27, 64, 0, 25, 28, 0, 2, 83, 22, 27, 0, 38, 64, 1, 63, 0, 29, 64, 0, 20, 64, 29, 63, 0, 30, 64, 0, 19, 64, 30, 62, 0, 31, 64, 0, 83, 28, 31, 0, 1, 3, 3, 0, 119, 0, 52, 0, 2, 64, 0, 0, 0, 0, 1, 0, 4, 32, 1, 64, 2, 64, 0, 0, 0, 0, 16, 0, 16, 33, 32, 64, 121, 33, 39, 0, 43, 64, 1, 18, 0, 34, 64, 0, 1, 64, 240, 0, 20, 64, 34, 64, 0, 36, 64, 0, 19, 64, 36, 62, 0, 37, 64, 0, 25, 38, 0, 1, 83, 0, 37, 0, 43, 64, 1, 12, 0, 39, 64, 0, 38, 64, 39, 63, 0, 40, 64, 0, 20, 64, 40, 63, 0, 41, 64, 0, 19, 64, 41, 62, 0, 42, 64, 0, 25, 43, 0, 2, 83, 38, 42, 0, 43, 64, 1, 6, 0, 44, 64, 0, 38, 64, 44, 63, 0, 45, 64, 0, 20, 64, 45, 63, 0, 47, 64, 0, 19, 64, 47, 62, 0, 48, 64, 0, 25, 49, 0, 3, 83, 43, 48, 0, 38, 64, 1, 63, 0, 50, 64, 0, 20, 64, 50, 63, 0, 51, 64, 0, 19, 64, 51, 62, 0, 52, 64, 0, 83, 49, 52, 0, 1, 3, 4, 0, 119, 0, 7, 0, 134, 53, 0, 0, 228, 231, 0, 0, 1, 64, 84, 0, 85, 53, 64, 0, 1, 3, 255, 255, 119, 0, 1, 0, 139, 3, 0, 0, 140, 3, 54, 0, 0, 0, 0, 0, 1, 47, 0, 0, 136, 50, 0, 0, 0, 48, 50, 0, 136, 50, 0, 0, 1, 51, 224, 0, 3, 50, 50, 51, 137, 50, 0, 0, 130, 50, 0, 0, 136, 51, 0, 0, 49, 50, 50, 51, 24, 117, 0, 0, 1, 51, 224, 0, 135, 50, 0, 0, 51, 0, 0, 0, 25, 27, 48, 120, 25, 38, 48, 80, 0, 40, 48, 0, 1, 50, 136, 0, 3, 41, 48, 50, 0, 46, 38, 0, 25, 49, 46, 40, 1, 50, 0, 0, 85, 46, 50, 0, 25, 46, 46, 4, 54, 50, 46, 49, 52, 117, 0, 0, 82, 45, 2, 0, 85, 27, 45, 0, 1, 50, 0, 0, 134, 42, 0, 0, 152, 23, 0, 0, 50, 1, 27, 40, 38, 0, 0, 0, 34, 43, 42, 0, 121, 43, 3, 0, 1, 4, 255, 255, 119, 0, 94, 0, 25, 44, 0, 76, 82, 7, 44, 0, 1, 50, 255, 255, 15, 8, 50, 7, 121, 8, 6, 0, 134, 9, 0, 0, 232, 234, 0, 0, 0, 0, 0, 0, 0, 39, 9, 0, 119, 0, 2, 0, 1, 39, 0, 0, 82, 10, 0, 0, 38, 50, 10, 32, 0, 11, 50, 0, 25, 12, 0, 74, 78, 13, 12, 0, 41, 50, 13, 24, 42, 50, 50, 24, 34, 14, 50, 1, 121, 14, 4, 0, 38, 50, 10, 223, 0, 15, 50, 0, 85, 0, 15, 0, 25, 16, 0, 48, 82, 17, 16, 0, 32, 18, 17, 0, 121, 18, 46, 0, 25, 20, 0, 44, 82, 21, 20, 0, 85, 20, 41, 0, 25, 22, 0, 28, 85, 22, 41, 0, 25, 23, 0, 20, 85, 23, 41, 0, 1, 50, 80, 0, 85, 16, 50, 0, 25, 24, 41, 80, 25, 25, 0, 16, 85, 25, 24, 0, 134, 26, 0, 0, 152, 23, 0, 0, 0, 1, 27, 40, 38, 0, 0, 0, 1, 50, 0, 0, 13, 28, 21, 50, 121, 28, 3, 0, 0, 5, 26, 0, 119, 0, 30, 0, 25, 29, 0, 36, 82, 30, 29, 0, 38, 51, 30, 7, 1, 52, 0, 0, 1, 53, 0, 0, 135, 50, 5, 0, 51, 0, 52, 53, 82, 31, 23, 0, 1, 50, 0, 0, 13, 32, 31, 50, 1, 50, 255, 255, 125, 3, 32, 50, 26, 0, 0, 0, 85, 20, 21, 0, 1, 50, 0, 0, 85, 16, 50, 0, 1, 50, 0, 0, 85, 25, 50, 0, 1, 50, 0, 0, 85, 22, 50, 0, 1, 50, 0, 0, 85, 23, 50, 0, 0, 5, 3, 0, 119, 0, 6, 0, 134, 19, 0, 0, 152, 23, 0, 0, 0, 1, 27, 40, 38, 0, 0, 0, 0, 5, 19, 0, 82, 33, 0, 0, 38, 50, 33, 32, 0, 34, 50, 0, 32, 35, 34, 0, 1, 50, 255, 255, 125, 6, 35, 5, 50, 0, 0, 0, 20, 50, 33, 11, 0, 36, 50, 0, 85, 0, 36, 0, 32, 37, 39, 0, 120, 37, 4, 0, 134, 50, 0, 0, 208, 234, 0, 0, 0, 0, 0, 0, 0, 4, 6, 0, 137, 48, 0, 0, 139, 4, 0, 0, 140, 1, 43, 0, 0, 0, 0, 0, 1, 35, 0, 0, 136, 37, 0, 0, 0, 36, 37, 0, 136, 37, 0, 0, 25, 37, 37, 16, 137, 37, 0, 0, 130, 37, 0, 0, 136, 38, 0, 0, 49, 37, 37, 38, 44, 119, 0, 0, 1, 38, 16, 0, 135, 37, 0, 0, 38, 0, 0, 0, 25, 34, 36, 8, 0, 33, 36, 0, 38, 37, 0, 1, 0, 26, 37, 0, 0, 13, 26, 0, 1, 38, 173, 9, 134, 37, 0, 0, 248, 219, 0, 0, 38, 33, 0, 0, 0, 27, 13, 0, 38, 37, 27, 1, 0, 28, 37, 0, 40, 37, 28, 1, 0, 1, 37, 0, 1, 37, 176, 23, 82, 29, 37, 0, 32, 30, 29, 0, 19, 37, 1, 30, 0, 32, 37, 0, 121, 32, 5, 0, 1, 2, 12, 0, 0, 25, 2, 0, 137, 36, 0, 0, 139, 25, 0, 0, 1, 37, 164, 23, 82, 31, 37, 0, 25, 3, 31, 1, 1, 37, 164, 23, 85, 37, 3, 0, 1, 37, 86, 0, 1, 38, 100, 0, 1, 39, 1, 0, 1, 40, 64, 31, 1, 41, 10, 0, 134, 4, 0, 0, 76, 46, 0, 0, 37, 38, 39, 40, 41, 0, 0, 0, 0, 24, 4, 0, 0, 5, 24, 0, 41, 41, 5, 24, 42, 41, 41, 24, 33, 6, 41, 0, 121, 6, 6, 0, 0, 7, 24, 0, 0, 2, 7, 0, 0, 25, 2, 0, 137, 36, 0, 0, 139, 25, 0, 0, 1, 41, 164, 6, 1, 40, 220, 5, 1, 39, 50, 0, 1, 38, 1, 0 ], eb + 20480);
 HEAPU8.set([ 1, 37, 160, 15, 1, 42, 3, 0, 134, 8, 0, 0, 108, 85, 0, 0, 41, 40, 39, 38, 37, 42, 0, 0, 0, 24, 8, 0, 1, 42, 18, 7, 1, 37, 220, 5, 1, 38, 100, 0, 1, 39, 0, 0, 1, 40, 160, 15, 1, 41, 3, 0, 134, 9, 0, 0, 108, 85, 0, 0, 42, 37, 38, 39, 40, 41, 0, 0, 0, 24, 9, 0, 0, 10, 24, 0, 41, 41, 10, 24, 42, 41, 41, 24, 33, 11, 41, 0, 121, 11, 6, 0, 0, 12, 24, 0, 0, 2, 12, 0, 0, 25, 2, 0, 137, 36, 0, 0, 139, 25, 0, 0, 1, 41, 18, 7, 1, 40, 0, 0, 1, 39, 0, 0, 134, 14, 0, 0, 84, 203, 0, 0, 41, 40, 39, 0, 0, 24, 14, 0, 0, 15, 24, 0, 41, 39, 15, 24, 42, 39, 39, 24, 33, 16, 39, 0, 121, 16, 7, 0, 0, 17, 24, 0, 0, 2, 17, 0, 0, 25, 2, 0, 137, 36, 0, 0, 139, 25, 0, 0, 119, 0, 110, 0, 1, 39, 18, 7, 1, 40, 164, 6, 1, 41, 50, 0, 1, 38, 0, 0, 1, 37, 160, 15, 1, 42, 3, 0, 134, 18, 0, 0, 108, 85, 0, 0, 39, 40, 41, 38, 37, 42, 0, 0, 0, 24, 18, 0, 1, 37, 25, 0, 1, 38, 1, 0, 1, 41, 1, 0, 134, 42, 0, 0, 244, 153, 0, 0, 37, 38, 41, 0, 1, 41, 160, 15, 134, 42, 0, 0, 176, 213, 0, 0, 41, 0, 0, 0, 1, 41, 90, 0, 1, 38, 0, 0, 1, 37, 1, 0, 134, 42, 0, 0, 244, 153, 0, 0, 41, 38, 37, 0, 1, 37, 144, 1, 134, 42, 0, 0, 176, 213, 0, 0, 37, 0, 0, 0, 1, 42, 18, 7, 1, 37, 220, 5, 1, 38, 100, 0, 1, 41, 1, 0, 1, 40, 184, 11, 1, 39, 3, 0, 134, 19, 0, 0, 108, 85, 0, 0, 42, 37, 38, 41, 40, 39, 0, 0, 0, 24, 19, 0, 1, 40, 200, 0, 134, 39, 0, 0, 176, 213, 0, 0, 40, 0, 0, 0, 1, 39, 18, 7, 1, 40, 164, 6, 1, 41, 50, 0, 1, 38, 0, 0, 1, 37, 184, 11, 1, 42, 3, 0, 134, 20, 0, 0, 108, 85, 0, 0, 39, 40, 41, 38, 37, 42, 0, 0, 0, 24, 20, 0, 1, 37, 100, 0, 134, 42, 0, 0, 176, 213, 0, 0, 37, 0, 0, 0, 1, 37, 25, 0, 1, 38, 1, 0, 1, 41, 1, 0, 134, 42, 0, 0, 244, 153, 0, 0, 37, 38, 41, 0, 1, 41, 160, 15, 134, 42, 0, 0, 176, 213, 0, 0, 41, 0, 0, 0, 1, 41, 90, 0, 1, 38, 0, 0, 1, 37, 1, 0, 134, 42, 0, 0, 244, 153, 0, 0, 41, 38, 37, 0, 1, 37, 144, 1, 134, 42, 0, 0, 176, 213, 0, 0, 37, 0, 0, 0, 1, 42, 18, 7, 1, 37, 220, 5, 1, 38, 100, 0, 1, 41, 1, 0, 1, 40, 184, 11, 1, 39, 3, 0, 134, 21, 0, 0, 108, 85, 0, 0, 42, 37, 38, 41, 40, 39, 0, 0, 0, 24, 21, 0, 1, 39, 176, 23, 82, 22, 39, 0, 27, 23, 22, 10, 134, 39, 0, 0, 12, 216, 0, 0, 23, 0, 0, 0, 1, 39, 176, 23, 1, 40, 0, 0, 85, 39, 40, 0, 1, 39, 201, 9, 134, 40, 0, 0, 248, 219, 0, 0, 39, 34, 0, 0, 1, 2, 0, 0, 0, 25, 2, 0, 137, 36, 0, 0, 139, 25, 0, 0, 1, 40, 0, 0, 139, 40, 0, 0, 140, 3, 47, 0, 0, 0, 0, 0, 1, 43, 0, 0, 136, 45, 0, 0, 0, 44, 45, 0, 25, 31, 2, 16, 82, 37, 31, 0, 1, 45, 0, 0, 13, 38, 37, 45, 121, 38, 12, 0, 134, 40, 0, 0, 204, 205, 0, 0, 2, 0, 0, 0, 32, 41, 40, 0, 121, 41, 5, 0, 82, 9, 31, 0, 0, 13, 9, 0, 1, 43, 5, 0, 119, 0, 6, 0, 1, 5, 0, 0, 119, 0, 4, 0, 0, 39, 37, 0, 0, 13, 39, 0, 1, 43, 5, 0, 32, 45, 43, 5, 121, 45, 66, 0, 25, 42, 2, 20, 82, 11, 42, 0, 4, 12, 13, 11, 16, 14, 12, 1, 0, 15, 11, 0, 121, 14, 8, 0, 25, 16, 2, 36, 82, 17, 16, 0, 38, 45, 17, 7, 135, 18, 5, 0, 45, 2, 0, 1, 0, 5, 18, 0, 119, 0, 53, 0, 25, 19, 2, 75, 78, 20, 19, 0, 1, 45, 255, 255, 41, 46, 20, 24, 42, 46, 46, 24, 15, 21, 45, 46, 121, 21, 35, 0, 0, 3, 1, 0, 32, 22, 3, 0, 121, 22, 6, 0, 1, 6, 0, 0, 0, 7, 0, 0, 0, 8, 1, 0, 0, 33, 15, 0, 119, 0, 31, 0, 26, 23, 3, 1, 3, 24, 0, 23, 78, 25, 24, 0, 41, 46, 25, 24, 42, 46, 46, 24, 32, 26, 46, 10, 120, 26, 3, 0, 0, 3, 23, 0, 119, 0, 241, 255, 25, 27, 2, 36, 82, 28, 27, 0, 38, 46, 28, 7, 135, 29, 5, 0, 46, 2, 0, 3, 16, 30, 29, 3, 121, 30, 3, 0, 0, 5, 29, 0, 119, 0, 20, 0, 3, 32, 0, 3, 4, 4, 1, 3, 82, 10, 42, 0, 0, 6, 3, 0, 0, 7, 32, 0, 0, 8, 4, 0, 0, 33, 10, 0, 119, 0, 5, 0, 1, 6, 0, 0, 0, 7, 0, 0, 0, 8, 1, 0, 0, 33, 15, 0, 135, 46, 6, 0, 33, 7, 8, 0, 82, 34, 42, 0, 3, 35, 34, 8, 85, 42, 35, 0, 3, 36, 6, 8, 0, 5, 36, 0, 139, 5, 0, 0, 140, 0, 43, 0, 0, 0, 0, 0, 1, 36, 0, 0, 136, 38, 0, 0, 0, 37, 38, 0, 136, 38, 0, 0, 25, 38, 38, 32, 137, 38, 0, 0, 130, 38, 0, 0, 136, 39, 0, 0, 49, 38, 38, 39, 32, 124, 0, 0, 1, 39, 32, 0, 135, 38, 0, 0, 39, 0, 0, 0, 25, 35, 37, 8, 0, 34, 37, 0, 1, 1, 32, 3, 1, 39, 63, 10, 134, 38, 0, 0, 248, 219, 0, 0, 39, 34, 0, 0, 1, 38, 122, 26, 78, 28, 38, 0, 38, 38, 28, 1, 0, 29, 38, 0, 121, 29, 5, 0, 1, 0, 12, 0, 0, 27, 0, 0, 137, 37, 0, 0, 139, 27, 0, 0, 1, 38, 152, 23, 82, 30, 38, 0, 25, 31, 30, 1, 1, 38, 152, 23, 85, 38, 31, 0, 1, 38, 116, 22, 78, 32, 38, 0, 38, 38, 32, 1, 0, 33, 38, 0, 1, 38, 242, 8, 1, 39, 186, 9, 125, 2, 33, 38, 39, 0, 0, 0, 2, 39, 0, 0, 255, 255, 0, 0, 19, 39, 2, 39, 0, 3, 39, 0, 0, 23, 3, 0, 1, 39, 86, 0, 1, 38, 100, 0, 1, 40, 1, 0, 1, 41, 64, 31, 1, 42, 3, 0, 134, 4, 0, 0, 76, 46, 0, 0, 39, 38, 40, 41, 42, 0, 0, 0, 0, 12, 4, 0, 0, 5, 12, 0, 41, 42, 5, 24, 42, 42, 42, 24, 33, 6, 42, 0, 121, 6, 6, 0, 0, 7, 12, 0, 0, 0, 7, 0, 0, 27, 0, 0, 137, 37, 0, 0, 139, 27, 0, 0, 0, 8, 23, 0, 41, 42, 8, 16, 42, 42, 42, 16, 0, 9, 42, 0, 1, 42, 214, 6, 1, 41, 100, 0, 1, 40, 1, 0, 1, 38, 184, 11, 1, 39, 3, 0, 134, 10, 0, 0, 108, 85, 0, 0, 9, 42, 41, 40, 38, 39, 0, 0, 0, 12, 10, 0, 0, 11, 12, 0, 41, 39, 11, 24, 42, 39, 39, 24, 33, 13, 39, 0, 121, 13, 7, 0, 0, 14, 12, 0, 0, 0, 14, 0, 0, 27, 0, 0, 137, 37, 0, 0, 139, 27, 0, 0, 119, 0, 108, 0, 1, 38, 140, 255, 1, 40, 0, 0, 1, 41, 1, 0, 134, 39, 0, 0, 160, 128, 0, 0, 38, 40, 41, 0, 1, 41, 144, 1, 134, 39, 0, 0, 176, 213, 0, 0, 41, 0, 0, 0, 0, 15, 23, 0, 41, 39, 15, 16, 42, 39, 39, 16, 0, 16, 39, 0, 1, 39, 58, 7, 1, 41, 50, 0, 1, 40, 1, 0, 1, 38, 184, 11, 1, 42, 3, 0, 134, 17, 0, 0, 108, 85, 0, 0, 16, 39, 41, 40, 38, 42, 0, 0, 0, 12, 17, 0, 1, 38, 65, 0, 1, 40, 0, 0, 1, 41, 1, 0, 134, 42, 0, 0, 160, 128, 0, 0, 38, 40, 41, 0, 1, 41, 144, 1, 134, 42, 0, 0, 176, 213, 0, 0, 41, 0, 0, 0, 1, 41, 140, 255, 1, 40, 0, 0, 1, 38, 1, 0, 134, 42, 0, 0, 160, 128, 0, 0, 41, 40, 38, 0, 1, 38, 144, 1, 134, 42, 0, 0, 176, 213, 0, 0, 38, 0, 0, 0, 1, 38, 10, 0, 134, 42, 0, 0, 12, 216, 0, 0, 38, 0, 0, 0, 1, 38, 136, 19, 134, 42, 0, 0, 176, 213, 0, 0, 38, 0, 0, 0, 1, 42, 172, 23, 82, 18, 42, 0, 25, 19, 18, 4, 1, 42, 172, 23, 85, 42, 19, 0, 1, 42, 176, 23, 82, 20, 42, 0, 25, 21, 20, 4, 1, 42, 176, 23, 85, 42, 21, 0, 1, 42, 122, 26, 1, 38, 1, 0, 83, 42, 38, 0, 1, 42, 85, 10, 134, 38, 0, 0, 248, 219, 0, 0, 42, 35, 0, 0, 0, 22, 23, 0, 41, 38, 22, 16, 42, 38, 38, 16, 0, 24, 38, 0, 1, 38, 214, 6, 1, 42, 100, 0, 1, 40, 0, 0, 1, 41, 184, 11, 1, 39, 3, 0, 134, 25, 0, 0, 108, 85, 0, 0, 24, 38, 42, 40, 41, 39, 0, 0, 0, 12, 25, 0, 1, 41, 100, 0, 1, 40, 0, 0, 1, 42, 1, 0, 134, 39, 0, 0, 160, 128, 0, 0, 41, 40, 42, 0, 1, 42, 144, 1, 134, 39, 0, 0, 176, 213, 0, 0, 42, 0, 0, 0, 1, 39, 86, 0, 1, 42, 100, 0, 1, 40, 0, 0, 1, 41, 64, 31, 1, 38, 3, 0, 134, 26, 0, 0, 76, 46, 0, 0, 39, 42, 40, 41, 38, 0, 0, 0, 0, 12, 26, 0, 1, 0, 0, 0, 0, 27, 0, 0, 137, 37, 0, 0, 139, 27, 0, 0, 1, 38, 0, 0, 139, 38, 0, 0, 140, 1, 41, 0, 0, 0, 0, 0, 1, 38, 0, 0, 136, 40, 0, 0, 0, 39, 40, 0, 1, 40, 0, 0, 13, 8, 0, 40, 121, 8, 68, 0, 1, 40, 164, 1, 82, 35, 40, 0, 1, 40, 0, 0, 13, 36, 35, 40, 121, 36, 3, 0, 1, 29, 0, 0, 119, 0, 7, 0, 1, 40, 164, 1, 82, 9, 40, 0, 134, 10, 0, 0, 16, 127, 0, 0, 9, 0, 0, 0, 0, 29, 10, 0, 134, 11, 0, 0, 56, 234, 0, 0, 82, 3, 11, 0, 1, 40, 0, 0, 13, 12, 3, 40, 121, 12, 3, 0, 0, 5, 29, 0, 119, 0, 43, 0, 0, 4, 3, 0, 0, 6, 29, 0, 25, 13, 4, 76, 82, 14, 13, 0, 1, 40, 255, 255, 15, 15, 40, 14, 121, 15, 6, 0, 134, 16, 0, 0, 232, 234, 0, 0, 4, 0, 0, 0, 0, 26, 16, 0, 119, 0, 2, 0, 1, 26, 0, 0, 25, 17, 4, 20, 82, 18, 17, 0, 25, 20, 4, 28, 82, 21, 20, 0, 16, 22, 21, 18, 121, 22, 8, 0, 134, 23, 0, 0, 0, 198, 0, 0, 4, 0, 0, 0, 20, 40, 23, 6, 0, 24, 40, 0, 0, 7, 24, 0, 119, 0, 2, 0, 0, 7, 6, 0, 32, 25, 26, 0, 120, 25, 4, 0, 134, 40, 0, 0, 208, 234, 0, 0, 4, 0, 0, 0, 25, 27, 4, 56, 82, 2, 27, 0, 1, 40, 0, 0, 13, 28, 2, 40, 121, 28, 3, 0, 0, 5, 7, 0, 119, 0, 4, 0, 0, 4, 2, 0, 0, 6, 7, 0, 119, 0, 217, 255, 134, 40, 0, 0, 124, 234, 0, 0, 0, 1, 5, 0, 119, 0, 25, 0, 25, 19, 0, 76, 82, 30, 19, 0, 1, 40, 255, 255, 15, 31, 40, 30, 120, 31, 6, 0, 134, 32, 0, 0, 0, 198, 0, 0, 0, 0, 0, 0, 0, 1, 32, 0, 119, 0, 15, 0, 134, 33, 0, 0, 232, 234, 0, 0, 0, 0, 0, 0, 32, 37, 33, 0, 134, 34, 0, 0, 0, 198, 0, 0, 0, 0, 0, 0, 121, 37, 3, 0, 0, 1, 34, 0, 119, 0, 5, 0, 134, 40, 0, 0, 208, 234, 0, 0, 0, 0, 0, 0, 0, 1, 34, 0, 139, 1, 0, 0, 140, 3, 33, 0, 0, 0, 0, 0, 1, 29, 0, 0, 136, 31, 0, 0, 0, 30, 31, 0, 136, 31, 0, 0, 25, 31, 31, 64, 137, 31, 0, 0, 130, 31, 0, 0, 136, 32, 0, 0, 49, 31, 31, 32, 220, 128, 0, 0, 1, 32, 64, 0, 135, 31, 0, 0, 32, 0, 0, 0, 25, 3, 30, 48, 25, 28, 30, 40, 25, 27, 30, 32, 25, 26, 30, 24, 25, 25, 30, 16, 25, 24, 30, 8, 0, 23, 30, 0, 25, 19, 30, 44, 0, 16, 0, 0, 38, 31, 1, 1, 0, 20, 31, 0, 0, 17, 20, 0, 38, 31, 2, 1, 0, 21, 31, 0, 0, 18, 21, 0, 0, 22, 17, 0, 38, 31, 22, 1, 0, 4, 31, 0, 121, 4, 10, 0, 1, 31, 135, 26, 78, 5, 31, 0, 0, 6, 16, 0, 78, 31, 19, 0, 83, 3, 31, 0, 134, 31, 0, 0, 140, 163, 0, 0, 3, 5, 6, 0, 119, 0, 9, 0, 0, 7, 16, 0, 1, 31, 255, 0, 19, 31, 7, 31, 0, 8, 31, 0, 1, 32, 132, 26, 134, 31, 0, 0, 40, 229, 0, 0, 32, 8, 0, 0, 0, 9, 16, 0, 1, 31, 135, 26, 83, 31, 9, 0, 0, 10, 18, 0, 38, 31, 10, 1, 0, 11, 31, 0, 120, 11, 3, 0, 137, 30, 0, 0, 139, 0, 0, 0, 1, 32, 136, 11, 134, 31, 0, 0, 52, 223, 0, 0, 32, 0, 0, 0, 0, 12, 16, 0, 1, 31, 255, 0, 19, 31, 12, 31, 0, 13, 31, 0, 1, 31, 60, 0, 1, 32, 81, 0, 138, 13, 31, 32, 48, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 76, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 104, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 132, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 0, 131, 0, 0, 160, 131, 0, 0, 0, 14, 16, 0, 1, 31, 255, 0, 19, 31, 14, 31, 0, 15, 31, 0, 85, 28, 15, 0, 1, 32, 200, 11, 134, 31, 0, 0, 248, 219, 0, 0, 32, 28, 0, 0, 137, 30, 0, 0, 139, 0, 0, 0, 119, 0, 36, 0, 1, 32, 161, 11, 134, 31, 0, 0, 248, 219, 0, 0, 32, 25, 0, 0, 137, 30, 0, 0, 139, 0, 0, 0, 119, 0, 29, 0, 1, 32, 170, 11, 134, 31, 0, 0, 248, 219, 0, 0, 32, 26, 0, 0, 137, 30, 0, 0, 139, 0, 0, 0, 119, 0, 22, 0, 1, 32, 143, 11, 134, 31, 0, 0, 248, 219, 0, 0, 32, 23, 0, 0, 137, 30, 0, 0, 139, 0, 0, 0, 119, 0, 15, 0, 1, 32, 150, 11, 134, 31, 0, 0, 248, 219, 0, 0, 32, 24, 0, 0, 137, 30, 0, 0, 139, 0, 0, 0, 119, 0, 8, 0, 1, 32, 185, 11, 134, 31, 0, 0, 248, 219, 0, 0, 32, 27, 0, 0, 137, 30, 0, 0, 139, 0, 0, 0, 119, 0, 1, 0, 139, 0, 0, 0, 140, 1, 31, 0, 0, 0, 0, 0, 1, 27, 0, 0, 136, 29, 0, 0, 0, 28, 29, 0, 136, 29, 0, 0, 25, 29, 29, 16, 137, 29, 0, 0, 130, 29, 0, 0, 136, 30, 0, 0, 49, 29, 29, 30, 252, 131, 0, 0, 1, 30, 16, 0, 135, 29, 0, 0, 30, 0, 0, 0, 0, 26, 28, 0, 0, 12, 0, 0, 0, 20, 12, 0, 1, 29, 0, 0, 1, 30, 12, 0, 138, 20, 29, 30, 100, 132, 0, 0, 116, 132, 0, 0, 132, 132, 0, 0, 148, 132, 0, 0, 164, 132, 0, 0, 188, 132, 0, 0, 212, 132, 0, 0, 236, 132, 0, 0, 252, 132, 0, 0, 12, 133, 0, 0, 28, 133, 0, 0, 52, 133, 0, 0, 0, 9, 12, 0, 85, 26, 9, 0, 1, 30, 223, 9, 134, 29, 0, 0, 248, 219, 0, 0, 30, 26, 0, 0, 1, 19, 11, 0, 119, 0, 57, 0, 134, 21, 0, 0, 224, 160, 0, 0, 0, 19, 21, 0, 119, 0, 53, 0, 134, 22, 0, 0, 240, 146, 0, 0, 0, 19, 22, 0, 119, 0, 49, 0, 134, 24, 0, 0, 132, 73, 0, 0, 0, 19, 24, 0, 119, 0, 45, 0, 134, 25, 0, 0, 112, 105, 0, 0, 0, 19, 25, 0, 119, 0, 41, 0, 1, 29, 0, 0, 134, 2, 0, 0, 92, 109, 0, 0, 29, 0, 0, 0, 0, 19, 2, 0, 119, 0, 35, 0, 1, 29, 1, 0, 134, 3, 0, 0, 92, 109, 0, 0, 29, 0, 0, 0, 0, 19, 3, 0, 119, 0, 29, 0, 1, 29, 2, 0, 134, 4, 0, 0, 92, 109, 0, 0, 29, 0, 0, 0, 0, 19, 4, 0, 119, 0, 23, 0, 134, 5, 0, 0, 228, 123, 0, 0, 0, 19, 5, 0, 119, 0, 19, 0, 134, 6, 0, 0, 120, 156, 0, 0, 0, 19, 6, 0, 119, 0, 15, 0, 134, 7, 0, 0, 184, 218, 0, 0, 0, 19, 7, 0, 119, 0, 11, 0, 1, 29, 0, 0, 134, 8, 0, 0, 240, 118, 0, 0, 29, 0, 0, 0, 0, 19, 8, 0, 119, 0, 5, 0, 134, 23, 0, 0, 160, 144, 0, 0, 0, 19, 23, 0, 119, 0, 1, 0, 0, 10, 19, 0, 134, 29, 0, 0, 28, 136, 0, 0, 10, 0, 0, 0, 0, 11, 19, 0, 41, 29, 11, 24, 42, 29, 29, 24, 33, 13, 29, 0, 121, 13, 11, 0, 0, 14, 19, 0, 1, 29, 255, 0, 19, 29, 14, 29, 0, 15, 29, 0, 32, 16, 15, 12, 121, 16, 5, 0, 1, 1, 0, 0, 0, 18, 1, 0, 137, 28, 0, 0, 139, 18, 0, 0, 0, 17, 19, 0, 0, 1, 17, 0, 0, 18, 1, 0, 137, 28, 0, 0, 139, 18, 0, 0, 140, 2, 24, 0, 0, 0, 0, 0, 2, 19, 0, 0, 172, 3, 0, 0, 2, 20, 0, 0, 86, 9, 0, 0, 2, 21, 0, 0, 176, 6, 0, 0, 1, 17, 0, 0, 136, 22, 0, 0, 0, 18, 22, 0, 136, 22, 0, 0, 25, 22, 22, 16, 137, 22, 0, 0, 130, 22, 0, 0, 136, 23, 0, 0, 49, 22, 22, 23, 248, 133, 0, 0, 1, 23, 16, 0, 135, 22, 0, 0, 23, 0, 0, 0, 0, 16, 18, 0, 0, 8, 1, 0, 0, 9, 8, 0, 1, 22, 255, 0, 19, 22, 9, 22, 0, 10, 22, 0, 1, 22, 41, 0, 1, 23, 52, 0, 138, 10, 22, 23, 28, 135, 0, 0, 40, 135, 0, 0, 80, 135, 0, 0, 92, 135, 0, 0, 132, 135, 0, 0, 144, 135, 0, 0, 236, 134, 0, 0, 156, 135, 0, 0, 168, 135, 0, 0, 180, 135, 0, 0, 192, 135, 0, 0, 204, 135, 0, 0, 216, 135, 0, 0, 228, 135, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 240, 135, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 236, 134, 0, 0, 252, 135, 0, 0, 0, 15, 8, 0, 1, 22, 255, 0, 19, 22, 15, 22, 0, 6, 22, 0, 85, 16, 6, 0, 1, 23, 220, 6, 134, 22, 0, 0, 248, 219, 0, 0, 23, 16, 0, 0, 1, 4, 76, 4, 1, 5, 244, 1, 119, 0, 60, 0, 1, 4, 250, 0, 1, 5, 14, 1, 119, 0, 57, 0, 1, 22, 116, 22, 78, 11, 22, 0, 38, 22, 11, 1, 0, 12, 22, 0, 1, 22, 228, 2, 125, 2, 12, 19, 22, 0, 0, 0, 0, 4, 2, 0, 1, 5, 244, 1, 119, 0, 47, 0, 1, 4, 176, 6, 1, 5, 98, 2, 119, 0, 44, 0, 1, 22, 116, 22, 78, 13, 22, 0, 38, 22, 13, 1, 0, 14, 22, 0, 1, 22, 228, 2, 125, 3, 14, 19, 22, 0, 0, 0, 0, 4, 3, 0, 1, 5, 196, 9, 119, 0, 34, 0, 1, 4, 176, 6, 1, 5, 86, 9, 119, 0, 31, 0, 1, 4, 220, 5, 1, 5, 98, 2, 119, 0, 28, 0, 1, 4, 220, 5, 1, 5, 230, 0, 119, 0, 25, 0, 1, 4, 56, 4, 1, 5, 77, 2, 119, 0, 22, 0, 1, 4, 172, 3, 1, 5, 170, 5, 119, 0, 19, 0, 1, 4, 210, 0, 1, 5, 106, 4, 119, 0, 16, 0, 1, 4, 172, 3, 1, 5, 106, 4, 119, 0, 13, 0, 1, 4, 172, 3, 1, 5, 82, 3, 119, 0, 10, 0, 1, 4, 28, 2, 1, 5, 44, 1, 119, 0, 7, 0, 1, 4, 44, 6, 1, 5, 86, 9, 119, 0, 4, 0, 1, 4, 16, 4, 1, 5, 78, 7, 119, 0, 1, 0, 85, 0, 5, 0, 25, 7, 0, 4, 85, 7, 4, 0, 137, 18, 0, 0, 139, 0, 0, 0, 140, 1, 22, 0, 0, 0, 0, 0, 1, 18, 0, 0, 136, 20, 0, 0, 0, 19, 20, 0, 136, 20, 0, 0, 25, 20, 20, 96, 137, 20, 0, 0, 130, 20, 0, 0, 136, 21, 0, 0, 49, 20, 20, 21, 88, 136, 0, 0, 1, 21, 96, 0, 135, 20, 0, 0, 21, 0, 0, 0, 25, 13, 19, 80, 25, 12, 19, 72, 25, 11, 19, 64, 25, 10, 19, 56, 25, 9, 19, 48, 25, 17, 19, 40, 25, 16, 19, 32, 25, 15, 19, 24, 25, 14, 19, 16, 25, 8, 19, 8, 0, 7, 19, 0, 0, 1, 0, 0, 0, 2, 1, 0, 1, 20, 255, 0, 19, 20, 2, 20, 0, 3, 20, 0, 1, 20, 0, 0, 1, 21, 128, 0, 138, 3, 20, 21, 204, 138, 0, 0, 224, 138, 0, 0, 244, 138, 0, 0, 8, 139, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 28, 139, 0, 0, 48, 139, 0, 0, 68, 139, 0, 0, 164, 138, 0, 0, 88, 139, 0, 0, 108, 139, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 164, 138, 0, 0, 128, 139, 0, 0, 0, 4, 1, 0, 1, 20, 255, 0, 19, 20, 4, 20, 0, 5, 20, 0, 85, 13, 5, 0, 1, 21, 51, 3, 134, 20, 0, 0, 248, 219, 0, 0, 21, 13, 0, 0, 119, 0, 51, 0, 1, 21, 168, 10, 134, 20, 0, 0, 248, 219, 0, 0, 21, 7, 0, 0, 119, 0, 46, 0, 1, 21, 131, 2, 134, 20, 0, 0, 248, 219, 0, 0, 21, 8, 0, 0, 119, 0, 41, 0, 1, 21, 147, 2, 134, 20, 0, 0, 248, 219, 0, 0, 21, 14, 0, 0, 119, 0, 36, 0, 1, 21, 164, 2, 134, 20, 0, 0, 248, 219, 0, 0, 21, 15, 0, 0, 119, 0, 31, 0, 1, 21, 182, 2, 134, 20, 0, 0, 248, 219, 0, 0, 21, 16, 0, 0, 119, 0, 26, 0, 1, 21, 203, 2, 134, 20, 0, 0, 248, 219, 0, 0, 21, 17, 0, 0, 119, 0, 21, 0, 1, 21, 250, 2, 134, 20, 0, 0, 248, 219, 0, 0, 21, 10, 0, 0, 119, 0, 16, 0, 1, 21, 20, 3, 134, 20, 0, 0, 248, 219, 0, 0, 21, 11, 0, 0, 119, 0, 11, 0, 1, 21, 233, 2, 134, 20, 0, 0, 248, 219, 0, 0, 21, 9, 0, 0, 119, 0, 6, 0, 1, 21, 41, 3, 134, 20, 0, 0, 248, 219, 0, 0, 21, 12, 0, 0, 119, 0, 1, 0, 0, 6, 1, 0, 137, 19, 0, 0, 139, 6, 0, 0, 140, 3, 32, 0, 0, 0, 0, 0, 1, 28, 0, 0, 136, 30, 0, 0, 0, 29, 30, 0, 136, 30, 0, 0, 25, 30, 30, 48, 137, 30, 0, 0, 130, 30, 0, 0, 136, 31, 0, 0, 49, 30, 30, 31, 220, 139, 0, 0, 1, 31, 48, 0, 135, 30, 0, 0, 31, 0, 0, 0, 25, 3, 29, 40, 25, 27, 29, 32, 25, 26, 29, 24, 25, 25, 29, 16, 25, 24, 29, 8, 0, 23, 29, 0, 25, 19, 29, 36, 0, 16, 0, 0, 38, 30, 1, 1, 0, 20, 30, 0, 0, 17, 20, 0, 38, 30, 2, 1, 0, 21, 30, 0, 0, 18, 21, 0, 0, 22, 17, 0, 38, 30, 22, 1, 0, 4, 30, 0, 121, 4, 10, 0, 1, 30, 134, 26, 78, 5, 30, 0, 0, 6, 16, 0, 78, 30, 19, 0, 83, 3, 30, 0, 134, 30, 0, 0, 140, 163, 0, 0, 3, 5, 6, 0, 119, 0, 9, 0, 0, 7, 16, 0, 1, 30, 255, 0, 19, 30, 7, 30, 0, 8, 30, 0, 1, 31, 131, 26, 134, 30, 0, 0, 40, 229, 0, 0, 31, 8, 0, 0, 0, 9, 16, 0, 1, 30, 134, 26, 83, 30, 9, 0, 0, 10, 18, 0, 38, 30, 10, 1, 0, 11, 30, 0, 120, 11, 3, 0, 137, 29, 0, 0, 139, 0, 0, 0, 1, 31, 203, 11, 134, 30, 0, 0, 52, 223, 0, 0, 31, 0, 0, 0, 0, 12, 16, 0, 1, 30, 255, 0, 19, 30, 12, 30, 0, 13, 30, 0, 1, 30, 37, 0, 1, 31, 124, 0, 138, 13, 30, 31, 216, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 244, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 16, 143, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 168, 142, 0, 0, 44, 143, 0, 0, 0, 14, 16, 0, 1, 30, 255, 0, 19, 30, 14, 30, 0, 15, 30, 0, 85, 27, 15, 0, 1, 31, 200, 11, 134, 30, 0, 0, 248, 219, 0, 0, 31, 27, 0, 0, 137, 29, 0, 0, 139, 0, 0, 0, 119, 0, 29, 0, 1, 31, 222, 11, 134, 30, 0, 0, 248, 219, 0, 0, 31, 23, 0, 0, 137, 29, 0, 0, 139, 0, 0, 0, 119, 0, 22, 0, 1, 31, 239, 11, 134, 30, 0, 0, 248, 219, 0, 0, 31, 26, 0, 0, 137, 29, 0, 0, 139, 0, 0, 0, 119, 0, 15, 0, 1, 31, 234, 11, 134, 30, 0, 0, 248, 219, 0, 0, 31, 25, 0, 0, 137, 29, 0, 0, 139, 0, 0, 0, 119, 0, 8, 0, 1, 31, 227, 11, 134, 30, 0, 0, 248, 219, 0, 0, 31, 24, 0, 0, 137, 29, 0, 0, 139, 0, 0, 0, 119, 0, 1, 0, 139, 0, 0, 0, 140, 4, 37, 0, 0, 0, 0, 0, 1, 31, 0, 0, 136, 35, 0, 0, 0, 32, 35, 0, 136, 35, 0, 0, 1, 36, 128, 0, 3, 35, 35, 36, 137, 35, 0, 0, 130, 35, 0, 0, 136, 36, 0, 0, 49, 35, 35, 36, 140, 143, 0, 0, 1, 36, 128, 0, 135, 35, 0, 0, 36, 0, 0, 0, 25, 24, 32, 124, 0, 25, 32, 0, 0, 30, 25, 0, 1, 33, 168, 1, 25, 34, 30, 124, 82, 35, 33, 0, 85, 30, 35, 0, 25, 30, 30, 4, 25, 33, 33, 4, 54, 35, 30, 34, 160, 143, 0, 0, 26, 26, 1, 1, 2, 35, 0, 0, 254, 255, 255, 127, 16, 27, 35, 26, 121, 27, 13, 0, 32, 28, 1, 0, 121, 28, 5, 0, 0, 6, 24, 0, 1, 7, 1, 0, 1, 31, 4, 0, 119, 0, 10, 0, 134, 29, 0, 0, 228, 231, 0, 0, 1, 35, 75, 0, 85, 29, 35, 0, 1, 5, 255, 255, 119, 0, 4, 0, 0, 6, 0, 0, 0, 7, 1, 0, 1, 31, 4, 0, 32, 35, 31, 4, 121, 35, 35, 0, 0, 8, 6, 0, 1, 35, 254, 255, 4, 9, 35, 8, 16, 10, 9, 7, 125, 4, 10, 9, 7, 0, 0, 0, 25, 11, 25, 48, 85, 11, 4, 0, 25, 12, 25, 20, 85, 12, 6, 0, 25, 13, 25, 44, 85, 13, 6, 0, 3, 14, 6, 4, 25, 15, 25, 16, 85, 15, 14, 0, 25, 16, 25, 28, 85, 16, 14, 0, 134, 17, 0, 0, 216, 116, 0, 0, 25, 2, 3, 0, 32, 18, 4, 0, 121, 18, 3, 0, 0, 5, 17, 0, 119, 0, 11, 0, 82, 19, 12, 0, 82, 20, 15, 0, 13, 21, 19, 20, 41, 35, 21, 31, 42, 35, 35, 31, 0, 22, 35, 0, 3, 23, 19, 22, 1, 35, 0, 0, 83, 23, 35, 0, 0, 5, 17, 0, 137, 32, 0, 0, 139, 5, 0, 0, 140, 0, 30, 0, 0, 0, 0, 0, 1, 22, 0, 0, 136, 24, 0, 0, 0, 23, 24, 0, 136, 24, 0, 0, 25, 24, 24, 16, 137, 24, 0, 0, 130, 24, 0, 0, 136, 25, 0, 0, 49, 24, 24, 25, 220, 144, 0, 0, 1, 25, 16, 0, 135, 24, 0, 0, 25, 0, 0, 0, 25, 21, 23, 8, 0, 20, 23, 0, 1, 25, 244, 10, 134, 24, 0, 0, 248, 219, 0, 0, 25, 20, 0, 0, 1, 24, 119, 26, 78, 12, 24, 0, 38, 24, 12, 1, 0, 13, 24, 0, 121, 13, 5, 0, 1, 0, 12, 0, 0, 11, 0, 0, 137, 23, 0, 0, 139, 11, 0, 0, 1, 24, 168, 23, 82, 14, 24, 0, 25, 15, 14, 1, 1, 24, 168, 23, 85, 24, 15, 0, 1, 24, 42, 0, 1, 25, 100, 0, 1, 26, 1, 0, 1, 27, 64, 31, 1, 28, 3, 0, 134, 16, 0, 0, 76, 46, 0, 0, 24, 25, 26, 27, 28, 0, 0, 0, 0, 1, 16, 0, 0, 17, 1, 0, 41, 28, 17, 24, 42, 28, 28, 24, 33, 18, 28, 0, 121, 18, 6, 0, 0, 19, 1, 0, 0, 0, 19, 0, 0, 11, 0, 0, 137, 23, 0, 0, 139, 11, 0, 0, 1, 28, 44, 1, 1, 27, 72, 3, 1, 26, 100, 0, 1, 25, 1, 0, 1, 24, 136, 19, 1, 29, 3, 0, 134, 2, 0, 0, 108, 85, 0, 0, 28, 27, 26, 25, 24, 29, 0, 0, 0, 1, 2, 0, 0, 3, 1, 0, 41, 29, 3, 24, 42, 29, 29, 24, 33, 4, 29, 0, 121, 4, 6, 0, 0, 5, 1, 0, 0, 0, 5, 0, 0, 11, 0, 0, 137, 23, 0, 0, 139, 11, 0, 0, 1, 24, 184, 11, 1, 25, 72, 3, 1, 26, 208, 7, 134, 29, 0, 0, 84, 203, 0, 0, 24, 25, 26, 0, 1, 29, 240, 0, 1, 26, 72, 3, 1, 25, 100, 0, 1, 24, 0, 0, 1, 27, 208, 7, 1, 28, 3, 0, 134, 6, 0, 0, 108, 85, 0, 0, 29, 26, 25, 24, 27, 28, 0, 0, 0, 1, 6, 0, 0, 7, 1, 0, 41, 28, 7, 24, 42, 28, 28, 24, 33, 8, 28, 0, 121, 8, 7, 0, 0, 9, 1, 0, 0, 0, 9, 0, 0, 11, 0, 0, 137, 23, 0, 0, 139, 11, 0, 0, 119, 0, 43, 0, 1, 27, 160, 255, 1, 24, 0, 0, 1, 25, 1, 0, 134, 28, 0, 0, 160, 139, 0, 0, 27, 24, 25, 0, 1, 25, 144, 1, 134, 28, 0, 0, 176, 213, 0, 0, 25, 0, 0, 0, 1, 25, 40, 0, 1, 24, 0, 0, 1, 27, 1, 0, 134, 28, 0, 0, 160, 139, 0, 0, 25, 24, 27, 0, 1, 27, 10, 0, 134, 28, 0, 0, 12, 216, 0, 0, 27, 0, 0, 0, 1, 28, 119, 26, 1, 27, 1, 0, 83, 28, 27, 0, 1, 28, 7, 11, 134, 27, 0, 0, 248, 219, 0, 0, 28, 21, 0, 0, 1, 27, 44, 1, 1, 28, 72, 3, 1, 24, 100, 0, 1, 25, 1, 0, 1, 26, 136, 19, 1, 29, 3, 0, 134, 10, 0, 0, 108, 85, 0, 0, 27, 28, 24, 25, 26, 29, 0, 0, 0, 1, 10, 0, 1, 0, 0, 0, 0, 11, 0, 0, 137, 23, 0, 0, 139, 11, 0, 0, 1, 29, 0, 0, 139, 29, 0, 0, 140, 0, 30, 0, 0, 0, 0, 0, 1, 22, 0, 0, 136, 24, 0, 0, 0, 23, 24, 0, 136, 24, 0, 0, 25, 24, 24, 16, 137, 24, 0, 0, 130, 24, 0, 0, 136, 25, 0, 0, 49, 24, 24, 25, 44, 147, 0, 0, 1, 25, 16, 0, 135, 24, 0, 0, 25, 0, 0, 0, 25, 21, 23, 8, 0, 20, 23, 0, 1, 25, 18, 11, 134, 24, 0, 0, 248, 219, 0, 0, 25, 20, 0, 0, 1, 24, 119, 26, 78, 12, 24, 0, 38, 24, 12, 1, 0, 13, 24, 0, 121, 13, 5, 0, 1, 0, 12, 0, 0, 11, 0, 0, 137, 23, 0, 0, 139, 11, 0, 0, 1, 24, 172, 23, 82, 14, 24, 0, 1, 24, 0, 0, 15, 15, 24, 14, 121, 15, 5, 0, 1, 0, 14, 0, 0, 11, 0, 0, 137, 23, 0, 0, 139, 11, 0, 0, 1, 24, 128, 23, 82, 16, 24, 0, 25, 17, 16, 1, 1, 24, 128, 23, 85, 24, 17, 0, 1, 24, 42, 0, 1, 25, 100, 0, 1, 26, 1, 0, 1, 27, 64, 31, 1, 28, 3, 0, 134, 18, 0, 0, 76, 46, 0, 0, 24, 25, 26, 27, 28, 0, 0, 0, 0, 1, 18, 0, 0, 19, 1, 0, 41, 28, 19, 24, 42, 28, 28, 24, 33, 2, 28, 0, 121, 2, 6, 0, 0, 3, 1, 0, 0, 0, 3, 0, 0, 11, 0, 0, 137, 23, 0, 0, 139, 11, 0, 0, 1, 27, 140, 255, 1, 26, 0, 0, 1, 25, 1, 0, 134, 28, 0, 0, 160, 128, 0, 0, 27, 26, 25, 0, 1, 28, 116, 22, 78, 4, 28, 0, 38, 28, 4, 1, 0, 5, 28, 0, 121, 5, 13, 0, 1, 28, 150, 0, 1, 25, 172, 3, 1, 26, 50, 0, 1, 27, 1, 0, 1, 24, 184, 11, 1, 29, 3, 0, 134, 6, 0, 0, 108, 85, 0, 0, 28, 25, 26, 27, 24, 29, 0, 0, 0, 1, 6, 0, 119, 0, 12, 0, 1, 29, 150, 0, 1, 24, 228, 2, 1, 27, 50, 0, 1, 26, 1, 0, 1, 25, 184, 11, 1, 28, 3, 0, 134, 7, 0, 0, 108, 85, 0, 0, 29, 24, 27, 26, 25, 28, 0, 0, 0, 1, 7, 0, 1, 25, 65, 0, 1, 26, 0, 0, 1, 27, 1, 0, 134, 28, 0, 0, 160, 128, 0, 0, 25, 26, 27, 0, 1, 27, 10, 0, 134, 28, 0, 0, 12, 216, 0, 0, 27, 0, 0, 0, 1, 27, 136, 19, 134, 28, 0, 0, 176, 213, 0, 0, 27, 0, 0, 0, 1, 28, 172, 23, 82, 8, 28, 0, 25, 9, 8, 8, 1, 28, 172, 23, 85, 28, 9, 0, 1, 28, 119, 26, 1, 27, 1, 0, 83, 28, 27, 0, 1, 28, 36, 11, 134, 27, 0, 0, 248, 219, 0, 0, 28, 21, 0, 0, 1, 27, 42, 0, 1, 28, 100, 0, 1, 26, 0, 0, 1, 25, 64, 31, 1, 24, 3, 0, 134, 10, 0, 0, 76, 46, 0, 0, 27, 28, 26, 25, 24, 0, 0, 0, 0, 1, 10, 0, 1, 25, 100, 0, 1, 26, 0, 0, 1, 28, 1, 0, 134, 24, 0, 0, 160, 128, 0, 0, 25, 26, 28, 0, 1, 0, 0, 0, 0, 11, 0, 0, 137, 23, 0, 0, 139, 11, 0, 0, 140, 3, 30, 0, 0, 0, 0, 0, 1, 26, 0, 0, 136, 28, 0, 0, 0, 27, 28, 0, 136, 28, 0, 0, 25, 28, 28, 48, 137, 28, 0, 0, 130, 28, 0, 0, 136, 29, 0, 0, 49, 28, 28, 29, 108, 149, 0, 0, 1, 29, 48, 0, 135, 28, 0, 0, 29, 0, 0, 0, 25, 3, 27, 32, 25, 25, 27, 24, 25, 24, 27, 16, 25, 23, 27, 8, 0, 22, 27, 0, 25, 18, 27, 28, 0, 15, 0, 0, 38, 28, 1, 1, 0, 19, 28, 0, 0, 16, 19, 0, 38, 28, 2, 1, 0, 20, 28, 0, 0, 17, 20, 0, 0, 21, 16, 0, 38, 28, 21, 1, 0, 4, 28, 0, 121, 4, 10, 0, 1, 28, 137, 26, 78, 5, 28, 0, 0, 6, 15, 0, 78, 28, 18, 0, 83, 3, 28, 0, 134, 28, 0, 0, 140, 163, 0, 0, 3, 5, 6, 0, 119, 0, 9, 0, 0, 7, 15, 0, 1, 28, 255, 0, 19, 28, 7, 28, 0, 8, 28, 0, 1, 29, 136, 26, 134, 28, 0, 0, 40, 229, 0, 0, 29, 8, 0, 0, 0, 9, 17, 0, 38, 28, 9, 1, 0, 10, 28, 0, 120, 10, 3, 0, 137, 27, 0, 0, 139, 0, 0, 0, 1, 29, 36, 12, 134, 28, 0, 0, 52, 223, 0, 0, 29, 0, 0, 0, 0, 11, 15, 0, 1, 28, 255, 0, 19, 28, 11, 28, 0, 12, 28, 0, 1, 28, 29, 0, 1, 29, 32, 0, 138, 12, 28, 29, 232, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 4, 151, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 184, 150, 0, 0, 32, 151, 0, 0, 0, 13, 15, 0, 1, 28, 255, 0, 19, 28, 13, 28, 0, 14, 28, 0, 85, 25, 14, 0, 1, 29, 200, 11, 134, 28, 0, 0, 248, 219, 0, 0, 29, 25, 0, 0, 137, 27, 0, 0, 139, 0, 0, 0, 119, 0, 22, 0, 1, 29, 222, 11, 134, 28, 0, 0, 248, 219, 0, 0, 29, 22, 0, 0, 137, 27, 0, 0, 139, 0, 0, 0, 119, 0, 15, 0, 1, 29, 68, 12, 134, 28, 0, 0, 248, 219, 0, 0, 29, 24, 0, 0, 137, 27, 0, 0, 139, 0, 0, 0, 119, 0, 8, 0, 1, 29, 62, 12, 134, 28, 0, 0, 248, 219, 0, 0, 29, 23, 0, 0, 137, 27, 0, 0, 139, 0, 0, 0, 119, 0, 1, 0, 139, 0, 0, 0, 140, 3, 40, 0, 0, 0, 0, 0, 2, 37, 0, 0, 255, 0, 0, 0, 1, 35, 0, 0, 136, 38, 0, 0, 0, 36, 38, 0, 1, 38, 0, 0, 16, 28, 38, 1, 1, 38, 255, 255, 16, 29, 38, 0, 32, 30, 1, 0, 19, 38, 30, 29, 0, 31, 38, 0, 20, 38, 28, 31, 0, 32, 38, 0, 121, 32, 41, 0, 0, 6, 2, 0, 0, 33, 0, 0, 0, 34, 1, 0, 1, 38, 10, 0, 1, 39, 0, 0, 134, 9, 0, 0, 164, 223, 0, 0, 33, 34, 38, 39, 128, 39, 0, 0, 0, 10, 39, 0, 19, 39, 9, 37, 0, 11, 39, 0, 39, 39, 11, 48, 0, 12, 39, 0, 26, 13, 6, 1, 83, 13, 12, 0, 1, 39, 10, 0, 1, 38, 0, 0, 134, 14, 0, 0, 44, 231, 0, 0, 33, 34, 39, 38, 128, 38, 0, 0, 0, 15, 38, 0, 1, 38, 9, 0, 16, 16, 38, 34, 1, 38, 255, 255, 16, 17, 38, 33, 32, 18, 34, 9, 19, 38, 18, 17, 0, 19, 38, 0, 20, 38, 16, 19, 0, 20, 38, 0, 121, 20, 5, 0, 0, 6, 13, 0, 0, 33, 14, 0, 0, 34, 15, 0, 119, 0, 223, 255, 0, 3, 14, 0, 0, 5, 13, 0, 119, 0, 3, 0, 0, 3, 0, 0, 0, 5, 2, 0, 32, 21, 3, 0, 121, 21, 3, 0, 0, 7, 5, 0, 119, 0, 22, 0, 0, 4, 3, 0, 0, 8, 5, 0, 31, 38, 4, 10, 38, 38, 38, 255, 0, 22, 38, 0, 39, 38, 22, 48, 0, 23, 38, 0, 19, 38, 23, 37, 0, 24, 38, 0, 26, 25, 8, 1, 83, 25, 24, 0, 29, 38, 4, 10, 38, 38, 38, 255, 0, 26, 38, 0, 35, 27, 4, 10, 121, 27, 3, 0, 0, 7, 25, 0, 119, 0, 4, 0, 0, 4, 26, 0, 0, 8, 25, 0, 119, 0, 238, 255, 139, 7, 0, 0, 140, 4, 38, 0, 0, 0, 0, 0, 1, 34, 0, 0, 136, 36, 0, 0, 0, 35, 36, 0, 136, 36, 0, 0, 25, 36, 36, 32, 137, 36, 0, 0, 130, 36, 0, 0, 136, 37, 0, 0, 49, 36, 36, 37, 208, 152, 0, 0, 1, 37, 32, 0, 135, 36, 0, 0, 37, 0, 0, 0, 0, 33, 35, 0, 0, 27, 0, 0, 0, 28, 1, 0, 0, 29, 2, 0, 0, 30, 3, 0, 0, 31, 27, 0, 0, 32, 29, 0, 15, 4, 32, 31, 121, 4, 3, 0, 1, 34, 3, 0, 119, 0, 6, 0, 0, 5, 28, 0, 0, 6, 30, 0, 15, 7, 6, 5, 121, 7, 2, 0, 1, 34, 3, 0, 32, 36, 34, 3, 121, 36, 7, 0, 134, 36, 0, 0, 148, 227, 0, 0, 1, 37, 22, 7, 134, 36, 0, 0, 248, 219, 0, 0, 37, 33, 0, 0, 1, 36, 248, 22, 80, 8, 36, 0, 41, 36, 8, 16, 42, 36, 36, 16, 0, 9, 36, 0, 134, 10, 0, 0, 72, 212, 0, 0, 9, 0, 0, 0, 0, 11, 27, 0, 17, 12, 11, 10, 120, 12, 4, 0, 1, 26, 0, 0, 137, 35, 0, 0, 139, 26, 0, 0, 1, 36, 248, 22, 80, 13, 36, 0, 41, 36, 13, 16, 42, 36, 36, 16, 0, 14, 36, 0, 134, 15, 0, 0, 72, 212, 0, 0, 14, 0, 0, 0, 0, 16, 29, 0, 17, 17, 15, 16, 120, 17, 4, 0, 1, 26, 0, 0, 137, 35, 0, 0, 139, 26, 0, 0, 1, 36, 250, 22, 80, 18, 36, 0, 41, 36, 18, 16, 42, 36, 36, 16, 0, 19, 36, 0, 0, 20, 28, 0, 17, 21, 20, 19, 120, 21, 4, 0, 1, 26, 0, 0, 137, 35, 0, 0, 139, 26, 0, 0, 1, 36, 250, 22, 80, 22, 36, 0, 41, 36, 22, 16, 42, 36, 36, 16, 0, 23, 36, 0, 0, 24, 30, 0, 17, 25, 23, 24, 0, 26, 25, 0, 137, 35, 0, 0, 139, 26, 0, 0, 140, 3, 30, 0, 0, 0, 0, 0, 1, 26, 0, 0, 136, 28, 0, 0, 0, 27, 28, 0, 136, 28, 0, 0, 25, 28, 28, 32, 137, 28, 0, 0, 130, 28, 0, 0, 136, 29, 0, 0, 49, 28, 28, 29, 48, 154, 0, 0, 1, 29, 32, 0, 135, 28, 0, 0, 29, 0, 0, 0, 25, 3, 27, 24, 25, 25, 27, 16, 25, 24, 27, 8, 0, 23, 27, 0, 25, 19, 27, 20, 0, 16, 0, 0, 38, 28, 1, 1, 0, 20, 28, 0, 0, 17, 20, 0, 38, 28, 2, 1, 0, 21, 28, 0, 0, 18, 21, 0, 0, 22, 17, 0, 38, 28, 22, 1, 0, 4, 28, 0, 121, 4, 10, 0, 1, 28, 133, 26, 78, 5, 28, 0, 0, 6, 16, 0, 78, 28, 19, 0, 83, 3, 28, 0, 134, 28, 0, 0, 140, 163, 0, 0, 3, 5, 6, 0, 119, 0, 9, 0, 0, 7, 16, 0, 1, 28, 255, 0, 19, 28, 7, 28, 0, 8, 28, 0, 1, 29, 130, 26, 134, 28, 0, 0, 40, 229, 0, 0, 29, 8, 0, 0, 0, 9, 16, 0, 1, 28, 133, 26, 83, 28, 9, 0, 0, 10, 18, 0, 38, 28, 10, 1, 0, 11, 28, 0, 120, 11, 3, 0, 137, 27, 0, 0, 139, 0, 0, 0, 1, 29, 246, 11, 134, 28, 0, 0, 52, 223, 0, 0, 29, 0, 0, 0, 0, 12, 16, 0, 1, 28, 255, 0, 19, 28, 12, 28, 0, 13, 28, 0, 1, 28, 25, 0, 1, 29, 66, 0, 138, 13, 28, 29, 60, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 12, 156, 0, 0, 88, 156, 0, 0, 0, 14, 16, 0, 1, 28, 255, 0, 19, 28, 14, 28, 0, 15, 28, 0, 85, 25, 15, 0, 1, 29, 200, 11, 134, 28, 0, 0, 248, 219, 0, 0, 29, 25, 0, 0, 137, 27, 0, 0, 139, 0, 0, 0, 119, 0, 15, 0, 1, 29, 28, 12, 134, 28, 0, 0, 248, 219, 0, 0, 29, 24, 0, 0, 137, 27, 0, 0, 139, 0, 0, 0, 119, 0, 8, 0, 1, 29, 20, 12, 134, 28, 0, 0, 248, 219, 0, 0, 29, 23, 0, 0, 137, 27, 0, 0, 139, 0, 0, 0, 119, 0, 1, 0, 139, 0, 0, 0, 140, 0, 27, 0, 0, 0, 0, 0, 1, 19, 0, 0, 136, 21, 0, 0, 0, 20, 21, 0, 136, 21, 0, 0, 25, 21, 21, 16, 137, 21, 0, 0, 130, 21, 0, 0, 136, 22, 0, 0, 49, 21, 21, 22, 180, 156, 0, 0, 1, 22, 16, 0, 135, 21, 0, 0, 22, 0, 0, 0, 25, 18, 20, 8, 0, 17, 20, 0, 1, 22, 27, 10, 134, 21, 0, 0, 248, 219, 0, 0, 22, 17, 0, 0, 1, 21, 121, 26, 78, 9, 21, 0, 38, 21, 9, 1, 0, 10, 21, 0, 121, 10, 5, 0, 1, 0, 12, 0, 0, 8, 0, 0, 137, 20, 0, 0, 139, 8, 0, 0, 1, 21, 176, 23, 82, 11, 21, 0, 1, 21, 0, 0, 15, 12, 21, 11, 121, 12, 5, 0, 1, 0, 14, 0, 0, 8, 0, 0, 137, 20, 0, 0, 139, 8, 0, 0, 1, 21, 156, 23, 82, 13, 21, 0, 25, 14, 13, 1, 1, 21, 156, 23, 85, 21, 14, 0, 1, 21, 44, 0, 1, 22, 100, 0, 1, 23, 1, 0, 1, 24, 64, 31, 1, 25, 3, 0, 134, 15, 0, 0, 76, 46, 0, 0, 21, 22, 23, 24, 25, 0, 0, 0, 0, 1, 15, 0, 0, 16, 1, 0, 41, 25, 16, 24, 42, 25, 25, 24, 33, 2, 25, 0, 121, 2, 7, 0, 0, 3, 1, 0, 0, 0, 3, 0, 0, 8, 0, 0, 137, 20, 0, 0, 139, 8, 0, 0, 119, 0, 64, 0, 1, 24, 65, 0, 1, 23, 0, 0, 1, 22, 1, 0, 134, 25, 0, 0, 160, 128, 0, 0, 24, 23, 22, 0, 1, 25, 34, 11, 1, 22, 172, 3, 1, 23, 50, 0, 1, 24, 1, 0, 1, 21, 184, 11, 1, 26, 3, 0, 134, 4, 0, 0, 108, 85, 0, 0, 25, 22, 23, 24, 21, 26, 0, 0, 0, 1, 4, 0, 1, 21, 140, 255, 1, 24, 0, 0, 1, 23, 1, 0, 134, 26, 0, 0, 160, 128, 0, 0, 21, 24, 23, 0, 1, 23, 10, 0, 134, 26, 0, 0, 12, 216, 0, 0, 23, 0, 0, 0, 1, 23, 136, 19, 134, 26, 0, 0, 176, 213, 0, 0, 23, 0, 0, 0, 1, 26, 176, 23, 82, 5, 26, 0, 25, 6, 5, 8, 1, 26, 176, 23, 85, 26, 6, 0, 1, 26, 121, 26, 1, 23, 1, 0, 83, 26, 23, 0, 1, 26, 49, 10, 134, 23, 0, 0, 248, 219, 0, 0, 26, 18, 0, 0, 1, 23, 44, 0, 1, 26, 100, 0, 1, 24, 0, 0, 1, 21, 64, 31, 1, 22, 3, 0, 134, 7, 0, 0, 76, 46, 0, 0, 23, 26, 24, 21, 22, 0, 0, 0, 0, 1, 7, 0, 1, 21, 100, 0, 1, 24, 0, 0, 1, 26, 1, 0, 134, 22, 0, 0, 160, 128, 0, 0, 21, 24, 26, 0, 1, 0, 0, 0, 0, 8, 0, 0, 137, 20, 0, 0, 139, 8, 0, 0, 1, 22, 0, 0, 139, 22, 0, 0, 140, 1, 27, 0, 0, 0, 0, 0, 1, 19, 0, 0, 136, 21, 0, 0, 0, 20, 21, 0, 136, 21, 0, 0, 25, 21, 21, 16, 137, 21, 0, 0, 130, 21, 0, 0, 136, 22, 0, 0, 49, 21, 21, 22, 188, 158, 0, 0, 1, 22, 16, 0, 135, 21, 0, 0, 22, 0, 0, 0, 0, 18, 20, 0, 0, 10, 0, 0, 1, 22, 97, 8, 134, 21, 0, 0, 248, 219, 0, 0, 22, 18, 0, 0, 1, 21, 51, 0, 1, 22, 100, 0, 1, 23, 1, 0, 1, 24, 136, 19, 1, 25, 5, 0, 134, 12, 0, 0, 76, 46, 0, 0, 21, 22, 23, 24, 25, 0, 0, 0, 0, 11, 12, 0, 1, 24, 60, 0, 1, 23, 0, 0, 1, 22, 1, 0, 134, 25, 0, 0, 48, 149, 0, 0, 24, 23, 22, 0, 0, 13, 11, 0, 41, 25, 13, 24, 42, 25, 25, 24, 33, 14, 25, 0, 121, 14, 5, 0, 1, 1, 0, 0, 0, 9, 1, 0, 137, 20, 0, 0, 139, 9, 0, 0, 1, 25, 106, 4, 1, 22, 0, 0, 1, 23, 0, 0, 134, 15, 0, 0, 84, 203, 0, 0, 25, 22, 23, 0, 0, 11, 15, 0, 0, 16, 11, 0, 41, 23, 16, 24, 42, 23, 23, 24, 33, 17, 23, 0, 121, 17, 6, 0, 1, 1, 0, 0, 0, 9, 1, 0, 137, 20, 0, 0, 139, 9, 0, 0, 119, 0, 88, 0, 1, 22, 55, 0, 1, 25, 0, 0, 1, 24, 1, 0, 134, 23, 0, 0, 48, 149, 0, 0, 22, 25, 24, 0, 1, 23, 106, 4, 1, 24, 80, 0, 1, 25, 100, 0, 1, 22, 1, 0, 1, 21, 208, 7, 1, 26, 5, 0, 134, 2, 0, 0, 108, 85, 0, 0, 23, 24, 25, 22, 21, 26, 0, 0, 0, 11, 2, 0, 1, 26, 106, 4, 1, 21, 164, 1, 1, 22, 100, 0, 1, 25, 0, 0, 1, 24, 208, 7, 1, 23, 5, 0, 134, 3, 0, 0, 108, 85, 0, 0, 26, 21, 22, 25, 24, 23, 0, 0, 0, 11, 3, 0, 1, 23, 56, 4, 1, 24, 80, 0, 1, 25, 100, 0, 1, 22, 1, 0, 1, 21, 208, 7 ], eb + 30720);
 HEAPU8.set([ 1, 26, 5, 0, 134, 4, 0, 0, 108, 85, 0, 0, 23, 24, 25, 22, 21, 26, 0, 0, 0, 11, 4, 0, 1, 26, 56, 4, 1, 21, 164, 1, 1, 22, 100, 0, 1, 25, 0, 0, 1, 24, 208, 7, 1, 23, 5, 0, 134, 5, 0, 0, 108, 85, 0, 0, 26, 21, 22, 25, 24, 23, 0, 0, 0, 11, 5, 0, 1, 23, 156, 4, 1, 24, 164, 1, 1, 25, 100, 0, 1, 22, 1, 0, 1, 21, 208, 7, 1, 26, 5, 0, 134, 6, 0, 0, 108, 85, 0, 0, 23, 24, 25, 22, 21, 26, 0, 0, 0, 11, 6, 0, 1, 26, 156, 4, 1, 21, 80, 0, 1, 22, 100, 0, 1, 25, 1, 0, 1, 24, 208, 7, 1, 23, 5, 0, 134, 7, 0, 0, 108, 85, 0, 0, 26, 21, 22, 25, 24, 23, 0, 0, 0, 11, 7, 0, 1, 23, 156, 4, 1, 24, 164, 1, 1, 25, 100, 0, 1, 22, 0, 0, 1, 21, 208, 7, 1, 26, 5, 0, 134, 8, 0, 0, 108, 85, 0, 0, 23, 24, 25, 22, 21, 26, 0, 0, 0, 11, 8, 0, 1, 1, 100, 0, 0, 9, 1, 0, 137, 20, 0, 0, 139, 9, 0, 0, 1, 26, 0, 0, 139, 26, 0, 0, 140, 0, 26, 0, 0, 0, 0, 0, 1, 18, 0, 0, 136, 20, 0, 0, 0, 19, 20, 0, 136, 20, 0, 0, 25, 20, 20, 16, 137, 20, 0, 0, 130, 20, 0, 0, 136, 21, 0, 0, 49, 20, 20, 21, 28, 161, 0, 0, 1, 21, 16, 0, 135, 20, 0, 0, 21, 0, 0, 0, 25, 17, 19, 8, 0, 16, 19, 0, 1, 21, 46, 11, 134, 20, 0, 0, 248, 219, 0, 0, 21, 16, 0, 0, 1, 20, 117, 26, 78, 8, 20, 0, 38, 20, 8, 1, 0, 9, 20, 0, 121, 9, 5, 0, 1, 0, 12, 0, 0, 7, 0, 0, 137, 19, 0, 0, 139, 7, 0, 0, 1, 20, 124, 23, 82, 10, 20, 0, 25, 11, 10, 1, 1, 20, 124, 23, 85, 20, 11, 0, 1, 20, 51, 0, 1, 21, 100, 0, 1, 22, 1, 0, 1, 23, 64, 31, 1, 24, 3, 0, 134, 12, 0, 0, 76, 46, 0, 0, 20, 21, 22, 23, 24, 0, 0, 0, 0, 1, 12, 0, 0, 13, 1, 0, 41, 24, 13, 24, 42, 24, 24, 24, 33, 14, 24, 0, 121, 14, 6, 0, 0, 15, 1, 0, 0, 0, 15, 0, 0, 7, 0, 0, 137, 19, 0, 0, 139, 7, 0, 0, 1, 24, 106, 4, 1, 23, 0, 0, 1, 22, 0, 0, 134, 2, 0, 0, 84, 203, 0, 0, 24, 23, 22, 0, 0, 1, 2, 0, 0, 3, 1, 0, 41, 22, 3, 24, 42, 22, 22, 24, 33, 4, 22, 0, 121, 4, 6, 0, 1, 0, 0, 0, 0, 7, 0, 0, 137, 19, 0, 0, 139, 7, 0, 0, 119, 0, 37, 0, 1, 22, 106, 4, 1, 23, 150, 0, 1, 24, 50, 0, 1, 21, 1, 0, 1, 20, 208, 7, 1, 25, 5, 0, 134, 5, 0, 0, 108, 85, 0, 0, 22, 23, 24, 21, 20, 25, 0, 0, 0, 1, 5, 0, 1, 20, 70, 11, 134, 25, 0, 0, 248, 219, 0, 0, 20, 17, 0, 0, 1, 25, 117, 26, 1, 20, 1, 0, 83, 25, 20, 0, 1, 25, 25, 0, 134, 20, 0, 0, 12, 216, 0, 0, 25, 0, 0, 0, 1, 20, 51, 0, 1, 25, 100, 0, 1, 21, 0, 0, 1, 24, 64, 31, 1, 23, 3, 0, 134, 6, 0, 0, 76, 46, 0, 0, 20, 25, 21, 24, 23, 0, 0, 0, 0, 1, 6, 0, 1, 0, 0, 0, 0, 7, 0, 0, 137, 19, 0, 0, 139, 7, 0, 0, 1, 23, 0, 0, 139, 23, 0, 0, 140, 2, 25, 0, 0, 0, 0, 0, 1, 22, 0, 0, 136, 24, 0, 0, 0, 23, 24, 0, 1, 4, 0, 0, 1, 24, 2, 15, 3, 15, 24, 4, 78, 16, 15, 0, 1, 24, 255, 0, 19, 24, 16, 24, 0, 17, 24, 0, 13, 18, 17, 0, 121, 18, 3, 0, 1, 22, 2, 0, 119, 0, 10, 0, 25, 19, 4, 1, 32, 20, 19, 87, 121, 20, 5, 0, 1, 3, 90, 15, 1, 6, 87, 0, 1, 22, 5, 0, 119, 0, 3, 0, 0, 4, 19, 0, 119, 0, 238, 255, 32, 24, 22, 2, 121, 24, 8, 0, 32, 14, 4, 0, 121, 14, 3, 0, 1, 2, 90, 15, 119, 0, 4, 0, 1, 3, 90, 15, 0, 6, 4, 0, 1, 22, 5, 0, 32, 24, 22, 5, 121, 24, 20, 0, 1, 22, 0, 0, 0, 5, 3, 0, 78, 21, 5, 0, 41, 24, 21, 24, 42, 24, 24, 24, 32, 7, 24, 0, 25, 8, 5, 1, 120, 7, 3, 0, 0, 5, 8, 0, 119, 0, 249, 255, 26, 9, 6, 1, 32, 10, 9, 0, 121, 10, 3, 0, 0, 2, 8, 0, 119, 0, 5, 0, 0, 3, 8, 0, 0, 6, 9, 0, 1, 22, 5, 0, 119, 0, 238, 255, 25, 11, 1, 20, 82, 12, 11, 0, 134, 13, 0, 0, 192, 231, 0, 0, 2, 12, 0, 0, 139, 13, 0, 0, 140, 3, 33, 0, 0, 0, 0, 0, 2, 30, 0, 0, 255, 0, 0, 0, 1, 28, 0, 0, 136, 31, 0, 0, 0, 29, 31, 0, 136, 31, 0, 0, 25, 31, 31, 16, 137, 31, 0, 0, 130, 31, 0, 0, 136, 32, 0, 0, 49, 31, 31, 32, 208, 163, 0, 0, 1, 32, 16, 0, 135, 31, 0, 0, 32, 0, 0, 0, 0, 21, 1, 0, 0, 22, 2, 0, 0, 23, 21, 0, 19, 31, 23, 30, 0, 24, 31, 0, 0, 25, 22, 0, 19, 31, 25, 30, 0, 26, 31, 0, 15, 27, 26, 24, 121, 27, 30, 0, 0, 3, 21, 0, 19, 31, 3, 30, 0, 4, 31, 0, 0, 5, 22, 0, 19, 31, 5, 30, 0, 6, 31, 0, 17, 7, 6, 4, 120, 7, 2, 0, 119, 0, 18, 0, 0, 8, 21, 0, 19, 31, 8, 30, 0, 9, 31, 0, 134, 31, 0, 0, 40, 229, 0, 0, 0, 9, 0, 0, 1, 32, 20, 0, 134, 31, 0, 0, 176, 213, 0, 0, 32, 0, 0, 0, 0, 10, 21, 0, 26, 31, 10, 1, 41, 31, 31, 24, 42, 31, 31, 24, 0, 11, 31, 0, 0, 21, 11, 0, 119, 0, 231, 255, 137, 29, 0, 0, 139, 0, 0, 0, 119, 0, 29, 0, 0, 12, 21, 0, 19, 31, 12, 30, 0, 13, 31, 0, 0, 14, 22, 0, 19, 31, 14, 30, 0, 15, 31, 0, 17, 16, 13, 15, 120, 16, 2, 0, 119, 0, 18, 0, 0, 17, 21, 0, 19, 31, 17, 30, 0, 18, 31, 0, 134, 31, 0, 0, 40, 229, 0, 0, 0, 18, 0, 0, 1, 32, 20, 0, 134, 31, 0, 0, 176, 213, 0, 0, 32, 0, 0, 0, 0, 19, 21, 0, 25, 31, 19, 1, 41, 31, 31, 24, 42, 31, 31, 24, 0, 20, 31, 0, 0, 21, 20, 0, 119, 0, 231, 255, 137, 29, 0, 0, 139, 0, 0, 0, 139, 0, 0, 0, 140, 2, 26, 0, 0, 0, 0, 0, 1, 21, 0, 0, 136, 23, 0, 0, 0, 22, 23, 0, 127, 23, 0, 0, 87, 23, 0, 0, 127, 23, 0, 0, 82, 11, 23, 0, 127, 23, 0, 0, 106, 12, 23, 4, 1, 23, 52, 0, 135, 13, 7, 0, 11, 12, 23, 0, 128, 23, 0, 0, 0, 14, 23, 0, 2, 23, 0, 0, 255, 255, 0, 0, 19, 23, 13, 23, 0, 15, 23, 0, 1, 23, 255, 7, 19, 23, 15, 23, 0, 20, 23, 0, 41, 23, 20, 16, 42, 23, 23, 16, 1, 24, 0, 0, 1, 25, 0, 8, 138, 23, 24, 25, 168, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 80, 197, 0, 0, 244, 197, 0, 0, 1, 24, 255, 7, 19, 24, 13, 24, 0, 6, 24, 0, 1, 24, 254, 3, 4, 7, 6, 24, 85, 1, 7, 0, 2, 24, 0, 0, 255, 255, 15, 128, 19, 24, 12, 24, 0, 8, 24, 0, 2, 24, 0, 0, 0, 0, 224, 63, 20, 24, 8, 24, 0, 9, 24, 0, 127, 24, 0, 0, 85, 24, 11, 0, 127, 24, 0, 0, 109, 24, 4, 9, 127, 24, 0, 0, 86, 10, 24, 0, 58, 2, 10, 0, 119, 0, 22, 0, 59, 24, 0, 0, 70, 16, 0, 24, 121, 16, 12, 0, 61, 24, 0, 0, 0, 0, 128, 95, 65, 17, 0, 24, 134, 18, 0, 0, 224, 164, 0, 0, 17, 1, 0, 0, 82, 4, 1, 0, 26, 5, 4, 64, 58, 3, 18, 0, 0, 19, 5, 0, 119, 0, 3, 0, 58, 3, 0, 0, 1, 19, 0, 0, 85, 1, 19, 0, 58, 2, 3, 0, 119, 0, 3, 0, 58, 2, 0, 0, 119, 0, 1, 0, 139, 2, 0, 0, 140, 1, 28, 0, 0, 0, 0, 0, 1, 22, 0, 0, 136, 24, 0, 0, 0, 23, 24, 0, 25, 2, 0, 20, 82, 13, 2, 0, 25, 15, 0, 28, 82, 16, 15, 0, 16, 17, 16, 13, 121, 17, 16, 0, 25, 18, 0, 36, 82, 19, 18, 0, 38, 25, 19, 7, 1, 26, 0, 0, 1, 27, 0, 0, 135, 24, 5, 0, 25, 0, 26, 27, 82, 20, 2, 0, 1, 24, 0, 0, 13, 21, 20, 24, 121, 21, 3, 0, 1, 1, 255, 255, 119, 0, 4, 0, 1, 22, 3, 0, 119, 0, 2, 0, 1, 22, 3, 0, 32, 24, 22, 3, 121, 24, 28, 0, 25, 3, 0, 4, 82, 4, 3, 0, 25, 5, 0, 8, 82, 6, 5, 0, 16, 7, 4, 6, 121, 7, 10, 0, 0, 8, 4, 0, 0, 9, 6, 0, 4, 10, 8, 9, 25, 11, 0, 40, 82, 12, 11, 0, 38, 25, 12, 7, 1, 27, 1, 0, 135, 24, 5, 0, 25, 0, 10, 27, 25, 14, 0, 16, 1, 24, 0, 0, 85, 14, 24, 0, 1, 24, 0, 0, 85, 15, 24, 0, 1, 24, 0, 0, 85, 2, 24, 0, 1, 24, 0, 0, 85, 5, 24, 0, 1, 24, 0, 0, 85, 3, 24, 0, 1, 1, 0, 0, 139, 1, 0, 0, 140, 3, 21, 0, 0, 0, 0, 0, 1, 17, 0, 0, 136, 19, 0, 0, 0, 18, 19, 0, 136, 19, 0, 0, 25, 19, 19, 32, 137, 19, 0, 0, 130, 19, 0, 0, 136, 20, 0, 0, 49, 19, 19, 20, 32, 199, 0, 0, 1, 20, 32, 0, 135, 19, 0, 0, 20, 0, 0, 0, 0, 12, 18, 0, 25, 5, 18, 20, 25, 6, 0, 60, 82, 7, 6, 0, 0, 8, 5, 0, 85, 12, 7, 0, 25, 13, 12, 4, 1, 19, 0, 0, 85, 13, 19, 0, 25, 14, 12, 8, 85, 14, 1, 0, 25, 15, 12, 12, 85, 15, 8, 0, 25, 16, 12, 16, 85, 16, 2, 0, 1, 19, 140, 0, 135, 9, 8, 0, 19, 12, 0, 0, 134, 10, 0, 0, 236, 227, 0, 0, 9, 0, 0, 0, 34, 11, 10, 0, 121, 11, 5, 0, 1, 19, 255, 255, 85, 5, 19, 0, 1, 4, 255, 255, 119, 0, 3, 0, 82, 3, 5, 0, 0, 4, 3, 0, 137, 18, 0, 0, 139, 4, 0, 0, 140, 3, 34, 0, 0, 0, 0, 0, 1, 30, 0, 0, 136, 32, 0, 0, 0, 31, 32, 0, 136, 32, 0, 0, 25, 32, 32, 32, 137, 32, 0, 0, 130, 32, 0, 0, 136, 33, 0, 0, 49, 32, 32, 33, 216, 199, 0, 0, 1, 33, 32, 0, 135, 32, 0, 0, 33, 0, 0, 0, 0, 25, 0, 0, 0, 26, 1, 0, 0, 27, 2, 0, 0, 3, 25, 0, 1, 32, 248, 22, 80, 4, 32, 0, 41, 32, 4, 16, 42, 32, 32, 16, 0, 5, 32, 0, 4, 6, 3, 5 ], eb + 40960);
 HEAPU8.set([ 0, 28, 6, 0, 0, 7, 26, 0, 1, 32, 250, 22, 80, 8, 32, 0, 41, 32, 8, 16, 42, 32, 32, 16, 0, 9, 32, 0, 4, 10, 7, 9, 0, 29, 10, 0, 0, 11, 29, 0, 0, 12, 28, 0, 0, 23, 11, 0, 0, 24, 12, 0, 0, 13, 23, 0, 76, 32, 13, 0, 58, 14, 32, 0, 0, 15, 24, 0, 76, 32, 15, 0, 58, 16, 32, 0, 135, 17, 9, 0, 14, 16, 0, 0, 58, 18, 17, 0, 1, 32, 252, 22, 89, 32, 18, 0, 0, 19, 25, 0, 2, 32, 0, 0, 255, 255, 0, 0, 19, 32, 19, 32, 0, 20, 32, 0, 1, 32, 248, 22, 84, 32, 20, 0, 0, 21, 26, 0, 2, 32, 0, 0, 255, 255, 0, 0, 19, 32, 21, 32, 0, 22, 32, 0, 1, 32, 250, 22, 84, 32, 22, 0, 134, 32, 0, 0, 72, 209, 0, 0, 137, 31, 0, 0, 1, 32, 0, 0, 139, 32, 0, 0, 140, 3, 22, 0, 0, 0, 0, 0, 1, 18, 0, 0, 136, 20, 0, 0, 0, 19, 20, 0, 136, 20, 0, 0, 25, 20, 20, 32, 137, 20, 0, 0, 130, 20, 0, 0, 136, 21, 0, 0, 49, 20, 20, 21, 232, 200, 0, 0, 1, 21, 32, 0, 135, 20, 0, 0, 21, 0, 0, 0, 0, 15, 19, 0, 25, 8, 19, 16, 25, 9, 0, 36, 1, 20, 5, 0, 85, 9, 20, 0, 82, 10, 0, 0, 38, 20, 10, 64, 0, 11, 20, 0, 32, 12, 11, 0, 121, 12, 18, 0, 25, 13, 0, 60, 82, 14, 13, 0, 0, 3, 8, 0, 85, 15, 14, 0, 25, 16, 15, 4, 1, 20, 19, 84, 85, 16, 20, 0, 25, 17, 15, 8, 85, 17, 3, 0, 1, 20, 54, 0, 135, 4, 10, 0, 20, 15, 0, 0, 32, 5, 4, 0, 120, 5, 4, 0, 25, 6, 0, 75, 1, 20, 255, 255, 83, 6, 20, 0, 134, 7, 0, 0, 32, 101, 0, 0, 0, 1, 2, 0, 137, 19, 0, 0, 139, 7, 0, 0, 140, 5, 24, 0, 0, 0, 0, 0, 1, 20, 0, 0, 136, 22, 0, 0, 0, 21, 22, 0, 136, 22, 0, 0, 1, 23, 0, 1, 3, 22, 22, 23, 137, 22, 0, 0, 130, 22, 0, 0, 136, 23, 0, 0, 49, 22, 22, 23, 168, 201, 0, 0, 1, 23, 0, 1, 135, 22, 0, 0, 23, 0, 0, 0, 0, 14, 21, 0, 2, 22, 0, 0, 0, 32, 1, 0, 19, 22, 4, 22, 0, 15, 22, 0, 32, 16, 15, 0, 15, 17, 3, 2, 19, 22, 17, 16, 0, 19, 22, 0, 121, 19, 34, 0, 4, 18, 2, 3, 1, 22, 0, 1, 16, 7, 18, 22, 1, 22, 0, 1, 125, 8, 7, 18, 22, 0, 0, 0, 135, 22, 2, 0, 14, 1, 8, 0, 1, 22, 255, 0, 16, 9, 22, 18, 121, 9, 19, 0, 4, 10, 2, 3, 0, 6, 18, 0, 1, 23, 0, 1, 134, 22, 0, 0, 116, 229, 0, 0, 0, 14, 23, 0, 1, 22, 0, 1, 4, 11, 6, 22, 1, 22, 255, 0, 16, 12, 22, 11, 121, 12, 3, 0, 0, 6, 11, 0, 119, 0, 246, 255, 1, 22, 255, 0, 19, 22, 10, 22, 0, 13, 22, 0, 0, 5, 13, 0, 119, 0, 2, 0, 0, 5, 18, 0, 134, 22, 0, 0, 116, 229, 0, 0, 0, 14, 5, 0, 137, 21, 0, 0, 139, 0, 0, 0, 140, 2, 30, 0, 0, 0, 0, 0, 1, 26, 0, 0, 136, 28, 0, 0, 0, 27, 28, 0, 136, 28, 0, 0, 25, 28, 28, 16, 137, 28, 0, 0, 130, 28, 0, 0, 136, 29, 0, 0, 49, 28, 28, 29, 152, 202, 0, 0, 1, 29, 16, 0, 135, 28, 0, 0, 29, 0, 0, 0, 0, 20, 0, 0, 0, 21, 1, 0, 0, 22, 20, 0, 76, 28, 22, 0, 58, 23, 28, 0, 1, 28, 252, 22, 88, 24, 28, 0, 58, 19, 24, 0, 58, 25, 19, 0, 135, 2, 11, 0, 25, 0, 0, 0, 65, 3, 23, 2, 1, 28, 248, 22, 80, 4, 28, 0, 41, 28, 4, 16, 42, 28, 28, 16, 76, 28, 28, 0, 58, 5, 28, 0, 63, 6, 5, 3, 75, 7, 6, 0, 1, 28, 248, 22, 84, 28, 7, 0, 0, 8, 20, 0, 76, 28, 8, 0, 58, 9, 28, 0, 1, 28, 252, 22, 88, 10, 28, 0, 58, 12, 10, 0, 58, 11, 12, 0, 135, 13, 12, 0, 11, 0, 0, 0, 65, 14, 9, 13, 1, 28, 250, 22, 80, 15, 28, 0, 41, 28, 15, 16, 42, 28, 28, 16, 76, 28, 28, 0, 58, 16, 28, 0, 63, 17, 16, 14, 75, 18, 17, 0, 1, 28, 250, 22, 84, 28, 18, 0, 134, 28, 0, 0, 72, 209, 0, 0, 137, 27, 0, 0, 1, 28, 0, 0, 139, 28, 0, 0, 140, 3, 33, 0, 0, 0, 0, 0, 1, 29, 0, 0, 136, 31, 0, 0, 0, 30, 31, 0, 136, 31, 0, 0, 25, 31, 31, 32, 137, 31, 0, 0, 130, 31, 0, 0, 136, 32, 0, 0, 49, 31, 31, 32, 144, 203, 0, 0, 1, 32, 32, 0, 135, 31, 0, 0, 32, 0, 0, 0, 0, 24, 0, 0, 0, 25, 1, 0, 0, 26, 2, 0, 0, 4, 24, 0, 1, 31, 248, 22, 80, 5, 31, 0, 41, 31, 5, 16, 42, 31, 31, 16, 0, 6, 31, 0, 4, 7, 4, 6, 0, 27, 7, 0, 0, 8, 25, 0, 1, 31, 250, 22, 80, 9, 31, 0, 41, 31, 9, 16, 42, 31, 31, 16, 0, 10, 31, 0, 4, 11, 8, 10, 0, 28, 11, 0, 0, 12, 28, 0, 0, 13, 27, 0, 0, 22, 12, 0, 0, 23, 13, 0, 0, 14, 22, 0, 76, 31, 14, 0, 58, 15, 31, 0, 0, 16, 23, 0, 76, 31, 16, 0, 58, 17, 31, 0, 135, 18, 9, 0, 15, 17, 0, 0, 58, 19, 18, 0, 58, 3, 19, 0, 58, 20, 3, 0, 1, 31, 136, 19, 134, 21, 0, 0, 128, 220, 0, 0, 20, 31, 0, 0, 137, 30, 0, 0, 139, 21, 0, 0, 140, 1, 16, 0, 0, 0, 0, 0, 1, 12, 0, 0, 136, 14, 0, 0, 0, 13, 14, 0, 136, 14, 0, 0, 25, 14, 14, 32, 137, 14, 0, 0, 130, 14, 0, 0, 136, 15, 0, 0, 49, 14, 14, 15, 108, 204, 0, 0, 1, 15, 32, 0, 135, 14, 0, 0, 15, 0, 0, 0, 25, 11, 13, 16, 25, 10, 13, 8, 0, 9, 13, 0, 0, 1, 0, 0, 0, 2, 1, 0, 1, 14, 0, 0, 15, 3, 14, 2, 0, 4, 1, 0, 121, 3, 7, 0, 85, 9, 4, 0, 1, 15, 203, 12, 134, 14, 0, 0, 144, 221, 0, 0, 15, 9, 0, 0, 119, 0, 14, 0, 34, 5, 4, 0, 121, 5, 10, 0, 0, 6, 1, 0, 1, 14, 0, 0, 4, 7, 14, 6, 85, 10, 7, 0, 1, 15, 207, 12, 134, 14, 0, 0, 144, 221, 0, 0, 15, 10, 0, 0, 119, 0, 3, 0, 137, 13, 0, 0, 139, 0, 0, 0, 0, 8, 1, 0, 85, 11, 8, 0, 1, 15, 211, 12, 134, 14, 0, 0, 248, 219, 0, 0, 15, 11, 0, 0, 137, 13, 0, 0, 139, 0, 0, 0, 140, 2, 25, 0, 0, 0, 0, 0, 1, 21, 0, 0, 136, 23, 0, 0, 0, 22, 23, 0, 78, 11, 0, 0, 78, 12, 1, 0, 41, 23, 11, 24, 42, 23, 23, 24, 41, 24, 12, 24, 42, 24, 24, 24, 14, 13, 23, 24, 41, 24, 11, 24, 42, 24, 24, 24, 32, 14, 24, 0, 20, 24, 14, 13, 0, 20, 24, 0, 121, 20, 4, 0, 0, 4, 12, 0, 0, 5, 11, 0, 119, 0, 24, 0, 0, 2, 1, 0, 0, 3, 0, 0, 25, 15, 3, 1, 25, 16, 2, 1, 78, 17, 15, 0, 78, 18, 16, 0, 41, 24, 17, 24, 42, 24, 24, 24, 41, 23, 18, 24, 42, 23, 23, 24, 14, 6, 24, 23, 41, 23, 17, 24, 42, 23, 23, 24, 32, 7, 23, 0, 20, 23, 7, 6, 0, 19, 23, 0, 121, 19, 4, 0, 0, 4, 18, 0, 0, 5, 17, 0, 119, 0, 4, 0, 0, 2, 16, 0, 0, 3, 15, 0, 119, 0, 236, 255, 1, 23, 255, 0, 19, 23, 5, 23, 0, 8, 23, 0, 1, 23, 255, 0, 19, 23, 4, 23, 0, 9, 23, 0, 4, 10, 8, 9, 139, 10, 0, 0, 140, 1, 25, 0, 0, 0, 0, 0, 1, 22, 0, 0, 136, 24, 0, 0, 0, 23, 24, 0, 25, 2, 0, 74, 78, 13, 2, 0, 41, 24, 13, 24, 42, 24, 24, 24, 0, 15, 24, 0, 1, 24, 255, 0, 3, 16, 15, 24, 20, 24, 16, 15, 0, 17, 24, 0, 1, 24, 255, 0, 19, 24, 17, 24, 0, 18, 24, 0, 83, 2, 18, 0, 82, 19, 0, 0, 38, 24, 19, 8, 0, 20, 24, 0, 32, 21, 20, 0, 121, 21, 20, 0, 25, 4, 0, 8, 1, 24, 0, 0, 85, 4, 24, 0, 25, 5, 0, 4, 1, 24, 0, 0, 85, 5, 24, 0, 25, 6, 0, 44, 82, 7, 6, 0, 25, 8, 0, 28, 85, 8, 7, 0, 25, 9, 0, 20, 85, 9, 7, 0, 25, 10, 0, 48, 82, 11, 10, 0, 3, 12, 7, 11, 25, 14, 0, 16, 85, 14, 12, 0, 1, 1, 0, 0, 119, 0, 5, 0, 39, 24, 19, 32, 0, 3, 24, 0, 85, 0, 3, 0, 1, 1, 255, 255, 139, 1, 0, 0, 140, 4, 27, 0, 0, 0, 0, 0, 2, 25, 0, 0, 255, 0, 0, 0, 1, 23, 0, 0, 136, 26, 0, 0, 0, 24, 26, 0, 32, 17, 0, 0, 32, 18, 1, 0, 19, 26, 17, 18, 0, 19, 26, 0, 121, 19, 3, 0, 0, 4, 2, 0, 119, 0, 33, 0, 0, 5, 2, 0, 0, 11, 1, 0, 0, 21, 0, 0, 38, 26, 21, 15, 0, 20, 26, 0, 1, 26, 240, 14, 3, 22, 26, 20, 78, 6, 22, 0, 19, 26, 6, 25, 0, 7, 26, 0, 20, 26, 7, 3, 0, 8, 26, 0, 19, 26, 8, 25, 0, 9, 26, 0, 26, 10, 5, 1, 83, 10, 9, 0, 1, 26, 4, 0, 135, 12, 7, 0, 21, 11, 26, 0, 128, 26, 0, 0, 0, 13, 26, 0, 32, 14, 12, 0, 32, 15, 13, 0, 19, 26, 14, 15, 0, 16, 26, 0, 121, 16, 3, 0, 0, 4, 10, 0, 119, 0, 5, 0, 0, 5, 10, 0, 0, 11, 13, 0, 0, 21, 12, 0, 119, 0, 228, 255, 139, 4, 0, 0, 140, 1, 20, 0, 0, 0, 0, 0, 1, 17, 0, 0, 136, 19, 0, 0, 0, 18, 19, 0, 82, 3, 0, 0, 78, 4, 3, 0, 41, 19, 4, 24, 42, 19, 19, 24, 0, 5, 19, 0, 26, 15, 5, 48, 35, 13, 15, 10, 121, 13, 21, 0, 1, 2, 0, 0, 0, 9, 3, 0, 0, 16, 15, 0, 27, 6, 2, 10, 3, 7, 16, 6, 25, 8, 9, 1, 85, 0, 8, 0, 78, 10, 8, 0, 41, 19, 10, 24, 42, 19, 19, 24, 0, 11, 19, 0, 26, 14, 11, 48, 35, 12, 14, 10, 121, 12, 5, 0, 0, 2, 7, 0, 0, 9, 8, 0, 0, 16, 14, 0, 119, 0, 242, 255, 0, 1, 7, 0, 119, 0, 2, 0, 1, 1, 0, 0, 139, 1, 0, 0, 140, 1, 21, 0, 0, 0, 0, 0, 1, 17, 0, 0, 136, 19, 0, 0, 0, 18, 19, 0, 136, 19, 0, 0, 25, 19, 19, 16, 137, 19, 0, 0, 130, 19, 0, 0, 136, 20, 0, 0, 49, 19, 19, 20, 12, 208, 0, 0, 1, 20, 16, 0, 135, 19, 0, 0, 20, 0, 0, 0, 58, 8, 0, 0, 1, 19, 106, 22, 78, 9, 19, 0, 38, 19, 9, 1, 0, 10, 19, 0, 38, 19, 10, 1, 0, 11, 19, 0, 32, 12, 11, 0, 1, 19, 105, 22, 78, 13, 19, 0, 41, 19, 13, 24, 42, 19, 19, 24, 33, 14, 19, 0, 19, 19, 12, 14, 0, 16, 19, 0, 58, 15, 8, 0, 121, 16, 16, 0, 68, 2, 15, 0, 58, 3, 2, 0, 62, 19, 0, 0, 24, 45, 68, 84, 251, 33, 9, 64, 63, 4, 3, 19, 58, 5, 4, 0, 134, 6, 0, 0, 28, 210, 0, 0, 5, 0, 0, 0, 58, 1, 6, 0, 58, 7, 1, 0, 137, 18, 0, 0, 139, 7, 0, 0, 119, 0, 5, 0, 58, 1, 15, 0, 58, 7, 1, 0, 137, 18, 0, 0, 139, 7, 0, 0, 59, 19, 0, 0, 139, 19, 0, 0, 140, 3, 22, 0, 0, 0, 0, 0, 1, 19, 0, 0, 136, 21, 0, 0, 0, 20, 21, 0, 32, 12, 0, 0, 32, 13, 1, 0, 19, 21, 12, 13, 0, 14, 21, 0, 121, 14, 3, 0, 0, 3, 2, 0, 119, 0, 29, 0, 0, 4, 2, 0, 0, 6, 1, 0, 0, 16, 0, 0, 1, 21, 255, 0, 19, 21, 16, 21, 0, 15, 21, 0, 38, 21, 15, 7, 0, 17, 21, 0, 39, 21, 17, 48, 0, 18, 21, 0, 26, 5, 4, 1, 83, 5, 18, 0, 1, 21, 3, 0, 135, 7, 7, 0, 16, 6, 21, 0, 128, 21, 0, 0, 0, 8, 21, 0, 32, 9, 7, 0, 32, 10, 8, 0, 19, 21, 9, 10, 0, 11, 21, 0, 121, 11, 3, 0, 0, 3, 5, 0, 119, 0, 5, 0, 0, 4, 5, 0, 0, 6, 8, 0, 0, 16, 7, 0, 119, 0, 232, 255, 139, 3, 0, 0, 140, 0, 19, 0, 0, 0, 0, 0, 1, 14, 0, 0, 136, 16, 0, 0, 0, 15, 16, 0, 134, 0, 0, 0, 192, 232, 0, 0, 1, 16, 92, 23, 85, 16, 0, 0, 1, 16, 252, 22, 88, 1, 16, 0, 1, 16, 96, 23, 89, 16, 1, 0, 1, 16, 248, 22, 80, 6, 16, 0, 1, 16, 104, 23, 84, 16, 6, 0, 1, 16, 250, 22, 80, 7, 16, 0, 1, 16, 106, 23, 84, 16, 7, 0, 1, 16, 0, 23, 80, 8, 16, 0, 1, 16, 110, 23, 84, 16, 8, 0, 1, 16, 2, 23, 80, 9, 16, 0, 1, 16, 112, 23, 84, 16, 9, 0, 1, 16, 104, 22, 78, 10, 16, 0, 38, 16, 10, 1, 0, 11, 16, 0, 38, 16, 11, 1, 0, 12, 16, 0, 1, 16, 115, 23, 83, 16, 12, 0, 1, 16, 40, 23, 78, 13, 16, 0, 1, 16, 116, 23, 83, 16, 13, 0, 1, 16, 104, 22, 78, 2, 16, 0, 38, 16, 2, 1, 0, 3, 16, 0, 38, 16, 3, 1, 0, 4, 16, 0, 1, 16, 2, 0, 1, 17, 88, 23, 1, 18, 36, 0, 135, 5, 13, 0, 16, 17, 18, 4, 139, 0, 0, 0, 140, 1, 20, 0, 0, 0, 0, 0, 1, 16, 0, 0, 136, 18, 0, 0, 0, 17, 18, 0, 136, 18, 0, 0, 25, 18, 18, 16, 137, 18, 0, 0, 130, 18, 0, 0, 136, 19, 0, 0, 49, 18, 18, 19, 88, 210, 0, 0, 1, 19, 16, 0, 135, 18, 0, 0, 19, 0, 0, 0, 58, 1, 0, 0, 58, 8, 1, 0, 58, 9, 8, 0, 62, 18, 0, 0, 24, 45, 68, 84, 251, 33, 9, 192, 71, 10, 9, 18, 120, 10, 2, 0, 119, 0, 10, 0, 58, 11, 1, 0, 58, 12, 11, 0, 62, 18, 0, 0, 24, 45, 68, 84, 251, 33, 25, 64, 63, 13, 12, 18, 58, 14, 13, 0, 58, 1, 14, 0, 119, 0, 240, 255, 58, 15, 1, 0, 58, 2, 15, 0, 62, 18, 0, 0, 24, 45, 68, 84, 251, 33, 9, 64, 73, 3, 2, 18, 58, 4, 1, 0, 120, 3, 2, 0, 119, 0, 9, 0, 58, 5, 4, 0, 62, 18, 0, 0, 24, 45, 68, 84, 251, 33, 25, 64, 64, 6, 5, 18, 58, 7, 6, 0, 58, 1, 7, 0, 119, 0, 240, 255, 137, 17, 0, 0, 139, 4, 0, 0, 140, 1, 7, 0, 0, 0, 0, 0, 25, 5, 0, 15, 38, 5, 5, 240, 0, 0, 5, 0, 130, 5, 1, 0, 82, 1, 5, 0, 3, 3, 1, 0, 1, 5, 0, 0, 15, 5, 5, 0, 15, 6, 3, 1, 19, 5, 5, 6, 34, 6, 3, 0, 20, 5, 5, 6, 121, 5, 7, 0, 135, 5, 14, 0, 1, 6, 12, 0, 135, 5, 15, 0, 6, 0, 0, 0, 1, 5, 255, 255, 139, 5, 0, 0, 130, 5, 1, 0, 85, 5, 3, 0, 135, 4, 16, 0, 47, 5, 4, 3, 124, 211, 0, 0, 135, 5, 17, 0, 32, 5, 5, 0, 121, 5, 8, 0, 130, 5, 1, 0, 85, 5, 1, 0, 1, 6, 12, 0, 135, 5, 15, 0, 6, 0, 0, 0, 1, 5, 255, 255, 139, 5, 0, 0, 139, 1, 0, 0, 140, 0, 10, 0, 0, 0, 0, 0, 1, 6, 0, 0, 136, 8, 0, 0, 0, 7, 8, 0, 136, 8, 0, 0, 25, 8, 8, 16, 137, 8, 0, 0, 130, 8, 0, 0, 136, 9, 0, 0, 49, 8, 8, 9, 188, 211, 0, 0, 1, 9, 16, 0, 135, 8, 0, 0, 9, 0, 0, 0, 25, 5, 7, 8, 0, 4, 7, 0, 134, 0, 0, 0, 196, 230, 0, 0, 1, 8, 250, 0, 15, 1, 0, 8, 120, 1, 3, 0, 137, 7, 0, 0, 139, 0, 0, 0, 1, 9, 81, 12, 134, 8, 0, 0, 248, 219, 0, 0, 9, 4, 0, 0, 1, 8, 124, 22, 1, 9, 0, 0, 85, 8, 9, 0, 1, 9, 104, 22, 78, 2, 9, 0, 38, 9, 2, 1, 0, 3, 9, 0, 121, 3, 4, 0, 134, 9, 0, 0, 52, 227, 0, 0, 119, 0, 3, 0, 134, 9, 0, 0, 180, 222, 0, 0, 1, 8, 113, 12, 134, 9, 0, 0, 248, 219, 0, 0, 8, 5, 0, 0, 1, 8, 10, 0, 134, 9, 0, 0, 136, 228, 0, 0, 8, 0, 0, 0, 119, 0, 252, 255, 140, 1, 17, 0, 0, 0, 0, 0, 1, 13, 0, 0, 136, 15, 0, 0, 0, 14, 15, 0, 136, 15, 0, 0, 25, 15, 15, 16, 137, 15, 0, 0, 130, 15, 0, 0, 136, 16, 0, 0, 49, 15, 15, 16, 132, 212, 0, 0, 1, 16, 16, 0, 135, 15, 0, 0, 16, 0, 0, 0, 0, 4, 0, 0, 1, 15, 106, 22, 78, 5, 15, 0, 38, 15, 5, 1, 0, 6, 15, 0, 38, 15, 6, 1, 0, 7, 15, 0, 32, 8, 7, 0, 1, 15, 105, 22, 78, 9, 15, 0, 41, 15, 9, 24, 42, 15, 15, 24, 33, 10, 15, 0, 19, 15, 8, 10, 0, 12, 15, 0, 0, 11, 4, 0, 121, 12, 8, 0, 1, 15, 184, 11, 4, 2, 15, 11, 0, 1, 2, 0, 0, 3, 1, 0, 137, 14, 0, 0, 139, 3, 0, 0, 119, 0, 5, 0, 0, 1, 11, 0, 0, 3, 1, 0, 137, 14, 0, 0, 139, 3, 0, 0, 1, 15, 0, 0, 139, 15, 0, 0, 140, 3, 17, 0, 0, 0, 0, 0, 1, 13, 0, 0, 136, 15, 0, 0, 0, 14, 15, 0, 136, 15, 0, 0, 25, 15, 15, 16, 137, 15, 0, 0, 130, 15, 0, 0, 136, 16, 0, 0, 49, 15, 15, 16, 56, 213, 0, 0, 1, 16, 16, 0, 135, 15, 0, 0, 16, 0, 0, 0, 0, 6, 0, 0, 0, 7, 1, 0, 58, 8, 2, 0, 0, 9, 6, 0, 134, 10, 0, 0, 72, 212, 0, 0, 9, 0, 0, 0, 2, 15, 0, 0, 255, 255, 0, 0, 19, 15, 10, 15, 0, 11, 15, 0, 1, 15, 248, 22, 84, 15, 11, 0, 0, 12, 7, 0, 2, 15, 0, 0, 255, 255, 0, 0, 19, 15, 12, 15, 0, 3, 15, 0, 1, 15, 250, 22, 84, 15, 3, 0, 58, 4, 8, 0, 134, 5, 0, 0, 208, 207, 0, 0, 4, 0, 0, 0, 1, 15, 252, 22, 89, 15, 5, 0, 134, 15, 0, 0, 72, 209, 0, 0, 137, 14, 0, 0, 139, 0, 0, 0, 140, 1, 15, 0, 0, 0, 0, 0, 1, 11, 0, 0, 136, 13, 0, 0, 0, 12, 13, 0, 136, 13, 0, 0, 25, 13, 13, 16, 137, 13, 0, 0, 130, 13, 0, 0, 136, 14, 0, 0, 49, 13, 13, 14, 236, 213, 0, 0, 1, 14, 16, 0, 135, 13, 0, 0, 14, 0, 0, 0, 0, 1, 0, 0, 134, 4, 0, 0, 192, 232, 0, 0, 0, 3, 4, 0, 134, 5, 0, 0, 192, 232, 0, 0, 0, 6, 3, 0, 4, 7, 5, 6, 0, 8, 1, 0, 18, 9, 8, 7, 120, 9, 12, 0, 1, 13, 124, 22, 82, 10, 13, 0, 33, 2, 10, 0, 121, 2, 3, 0, 134, 13, 0, 0, 128, 211, 0, 0, 1, 14, 10, 0, 134, 13, 0, 0, 136, 228, 0, 0, 14, 0, 0, 0, 119, 0, 239, 255, 137, 12, 0, 0, 139, 0, 0, 0, 140, 1, 14, 0, 0, 0, 0, 0, 1, 10, 0, 0, 136, 12, 0, 0, 0, 11, 12, 0, 136, 12, 0, 0, 25, 12, 12, 16, 137, 12, 0, 0, 130, 12, 0, 0, 136, 13, 0, 0, 49, 12, 12, 13, 136, 214, 0, 0, 1, 13, 16, 0, 135, 12, 0, 0, 13, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1, 0, 1, 12, 2, 0, 83, 2, 12, 0, 25, 3, 2, 1, 1, 12, 2, 0, 83, 3, 12, 0, 25, 4, 2, 2, 1, 12, 2, 0, 83, 4, 12, 0, 25, 5, 2, 3, 1, 12, 17, 0, 83, 5, 12, 0, 25, 6, 2, 32, 1, 12, 3, 0, 83, 6, 12, 0, 25, 7, 2, 33, 1, 12, 3, 0, 83, 7, 12, 0, 25, 8, 2, 34, 1, 12, 3, 0, 83, 8, 12, 0, 25, 9, 2, 35, 1, 12, 3, 0, 83, 9, 12, 0, 137, 11, 0, 0, 139, 0, 0, 0, 140, 1, 11, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 136, 9, 0, 0, 25, 9, 9, 16, 137, 9, 0, 0, 130, 9, 0, 0, 136, 10, 0, 0, 49, 9, 9, 10, 48, 215, 0, 0, 1, 10, 16, 0, 135, 9, 0, 0, 10, 0, 0, 0, 25, 6, 8, 8, 0, 5, 8, 0, 38, 9, 0, 1, 0, 2, 9, 0, 0, 1, 2, 0, 0, 3, 1, 0, 38, 9, 3, 1, 0, 4, 9, 0, 121, 4, 8, 0, 1, 10, 227, 3, 134, 9, 0, 0, 248, 219, 0, 0, 10, 5, 0, 0, 137, 8, 0, 0, 139, 0, 0, 0, 119, 0, 7, 0, 1, 10, 4, 4, 134, 9, 0, 0, 248, 219, 0, 0, 10, 6, 0, 0, 137, 8, 0, 0, 139, 0, 0, 0, 139, 0, 0, 0, 140, 1, 10, 0, 0, 0, 0, 0, 1, 6, 0, 0, 136, 8, 0, 0, 0, 7, 8, 0, 136, 8, 0, 0, 25, 8, 8, 16, 137, 8, 0, 0, 130, 8, 0, 0, 136, 9, 0, 0, 49, 8, 8, 9, 200, 215, 0, 0, 1, 9, 16, 0, 135, 8, 0, 0, 9, 0, 0, 0, 25, 5, 7, 8, 0, 4, 7, 0, 0, 1, 0, 0, 0, 2, 1, 0, 85, 4, 2, 0, 1, 9, 177, 12, 134, 8, 0, 0, 144, 221, 0, 0, 9, 4, 0, 0, 0, 3, 1, 0, 85, 5, 3, 0, 1, 9, 181, 12, 134, 8, 0, 0, 248, 219, 0, 0, 9, 5, 0, 0, 137, 7, 0, 0, 139, 0, 0, 0, 140, 1, 13, 0, 0, 0, 0, 0, 1, 9, 0, 0, 136, 11, 0, 0, 0, 10, 11, 0, 136, 11, 0, 0, 25, 11, 11, 16, 137, 11, 0, 0, 130, 11, 0, 0, 136, 12, 0, 0, 49, 11, 11, 12, 72, 216, 0, 0, 1, 12, 16, 0, 135, 11, 0, 0, 12, 0, 0, 0, 0, 2, 0, 0, 0, 3, 2, 0, 1, 11, 112, 22, 82, 4, 11, 0, 3, 5, 4, 3, 1, 11, 112, 22, 85, 11, 5, 0, 1, 11, 112, 22, 82, 6, 11, 0, 34, 7, 6, 0, 1, 11, 0, 0, 125, 1, 7, 11, 5, 0, 0, 0, 1, 11, 112, 22, 85, 11, 1, 0, 0, 8, 2, 0, 134, 11, 0, 0, 48, 204, 0, 0, 8, 0, 0, 0, 137, 10, 0, 0, 139, 0, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 2, 104, 22, 1, 3, 0, 0, 83, 2, 3, 0, 1, 3, 64, 23, 61, 2, 0, 0, 0, 0, 68, 65, 89, 3, 2, 0, 1, 2, 68, 23, 59, 3, 76, 13, 89, 2, 3, 0, 1, 3, 72, 23, 61, 2, 0, 0, 143, 194, 117, 61, 89, 3, 2, 0, 1, 2, 76, 23, 61, 3, 0, 0, 154, 153, 153, 62, 89, 2, 3, 0, 1, 3, 80, 23, 61, 2, 0, 0, 143, 194, 117, 61, 89, 3, 2, 0, 1, 2, 84, 23, 61, 3, 0, 0, 205, 204, 204, 62, 89, 2, 3, 0, 1, 3, 12, 23, 1, 2, 244, 1, 84, 3, 2, 0, 1, 2, 60, 23, 1, 3, 127, 0, 84, 2, 3, 0, 1, 3, 62, 23, 1, 2, 50, 0, 84, 3, 2, 0, 134, 2, 0, 0, 108, 231, 0, 0, 1, 3, 129, 26, 1, 4, 5, 0, 134, 2, 0, 0, 220, 228, 0, 0, 3, 4, 0, 0, 1, 4, 129, 26, 1, 3, 0, 0, 134, 2, 0, 0, 40, 229, 0, 0, 4, 3, 0, 0, 134, 2, 0, 0, 240, 220, 0, 0, 139, 0, 0, 0, 140, 3, 16, 0, 0, 0, 0, 0, 1, 13, 0, 0, 136, 15, 0, 0, 0, 14, 15, 0, 25, 6, 0, 16, 82, 7, 6, 0, 25, 8, 0, 20, 82, 9, 8, 0, 0, 10, 9, 0, 4, 11, 7, 10, 16, 12, 2, 11, 125, 3, 12, 2, 11, 0, 0, 0, 135, 15, 6, 0, 9, 1, 3, 0, 82, 4, 8, 0, 3, 5, 4, 3, 85, 8, 5, 0, 139, 2, 0, 0, 140, 1, 11, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 136, 9, 0, 0, 25, 9, 9, 16, 137, 9, 0, 0, 130, 9, 0, 0, 136, 10, 0, 0, 49, 9, 9, 10, 4, 218, 0, 0, 1, 10, 16, 0, 135, 9, 0, 0, 10, 0, 0, 0, 0, 6, 8, 0, 25, 1, 0, 60, 82, 2, 1, 0, 134, 3, 0, 0, 160, 234, 0, 0, 2, 0, 0, 0, 85, 6, 3, 0, 1, 9, 6, 0, 135, 4, 18, 0, 9, 6, 0, 0, 134, 5, 0, 0, 236, 227, 0, 0, 4, 0, 0, 0, 137, 8, 0, 0, 139, 5, 0, 0, 140, 0, 7, 0, 0, 0, 0, 0, 1, 3, 0, 0, 136, 5, 0, 0, 0, 4, 5, 0, 136, 5, 0, 0, 25, 5, 5, 16, 137, 5, 0, 0, 130, 5, 0, 0, 136, 6, 0, 0, 49, 5, 5, 6, 124, 218, 0, 0, 1, 6, 16, 0, 135, 5, 0, 0, 6, 0, 0, 0, 0, 2, 4, 0, 134, 0, 0, 0, 196, 230, 0, 0, 85, 2, 0, 0, 1, 6, 142, 12, 134, 5, 0, 0, 248, 219, 0, 0, 6, 2, 0, 0, 134, 1, 0, 0, 196, 230, 0, 0, 134, 5, 0, 0, 176, 213, 0, 0, 1, 0, 0, 0, 137, 4, 0, 0, 139, 0, 0, 0, 140, 0, 9, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 136, 7, 0, 0, 25, 7, 7, 16, 137, 7, 0, 0, 130, 7, 0, 0, 136, 8, 0, 0, 49, 7, 7, 8, 244, 218, 0, 0, 1, 8, 16, 0, 135, 7, 0, 0, 8, 0, 0, 0, 0, 4, 6, 0, 1, 8, 0, 10, 134, 7, 0, 0, 248, 219, 0, 0, 8, 4, 0, 0, 1, 7, 172, 23, 82, 1, 7, 0, 32, 2, 1, 0, 121, 2, 3, 0, 1, 0, 12, 0, 119, 0, 2, 0, 1, 0, 14, 0, 0, 3, 0, 0, 137, 6, 0, 0, 139, 3, 0, 0, 140, 4, 14, 0, 0, 0, 0, 0, 1, 10, 0, 0, 136, 12, 0, 0, 0, 11, 12, 0, 136, 12, 0, 0, 25, 12, 12, 16, 137, 12, 0, 0, 130, 12, 0, 0, 136, 13, 0, 0, 49, 12, 12, 13, 108, 219, 0, 0, 1, 13, 16, 0, 135, 12, 0, 0, 13, 0, 0, 0, 0, 4, 0, 0, 0, 5, 1, 0, 0, 6, 2, 0, 0, 7, 3, 0, 0, 8, 4, 0, 0, 9, 5, 0, 1, 13, 0, 0, 134, 12, 0, 0, 156, 199, 0, 0, 8, 9, 13, 0, 137, 11, 0, 0, 1, 12, 0, 0, 139, 12, 0, 0, 140, 2, 13, 0, 0, 0, 0, 0, 1, 10, 0, 0, 136, 12, 0, 0, 0, 11, 12, 0, 1, 12, 0, 0, 13, 3, 1, 12, 121, 3, 3, 0, 1, 2, 0, 0, 119, 0, 8, 0, 82, 4, 1, 0, 25, 5, 1, 4, 82, 6, 5, 0, 134, 7, 0, 0, 52, 103, 0, 0, 4, 6, 0, 0, 0, 2, 7, 0, 1, 12, 0, 0, 14, 8, 2, 12, 125, 9, 8, 2, 0, 0, 0, 0, 139, 9, 0, 0, 140, 2, 10, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 136, 7, 0, 0, 25, 7, 7, 32, 137, 7, 0, 0, 130, 7, 0, 0, 136, 8, 0, 0, 49, 7, 7, 8, 52, 220, 0, 0, 1, 8, 32, 0, 135, 7, 0, 0, 8, 0, 0, 0, 0, 3, 6, 0, 0, 2, 0, 0, 85, 3, 1, 0, 0, 4, 2, 0, 1, 8, 240, 25, 1, 9, 81, 0, 134, 7, 0, 0, 76, 143, 0, 0, 8, 9, 4, 3, 1, 9, 240, 25, 1, 8, 74, 3, 135, 7, 19, 0, 9, 8, 0, 0, 1, 8, 240, 25, 134, 7, 0, 0, 52, 223, 0, 0, 8, 0, 0, 0, 137, 6, 0, 0, 139, 0, 0, 0, 140, 2, 11, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 136, 9, 0, 0, 25, 9, 9, 16, 137, 9, 0, 0, 130, 9, 0, 0, 136, 10, 0, 0, 49, 9, 9, 10, 188, 220, 0, 0, 1, 10, 16, 0, 135, 9, 0, 0, 10, 0, 0, 0, 58, 2, 0, 0, 0, 3, 1, 0, 58, 4, 2, 0, 1, 9, 252, 22, 88, 5, 9, 0, 63, 6, 5, 4, 1, 9, 252, 22, 89, 9, 6, 0, 134, 9, 0, 0, 72, 209, 0, 0, 137, 8, 0, 0, 1, 9, 0, 0, 139, 9, 0, 0, 140, 0, 7, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 136, 3, 0, 0, 25, 3, 3, 16, 137, 3, 0, 0, 130, 3, 0, 0, 136, 4, 0, 0, 49, 3, 3, 4, 44, 221, 0, 0, 1, 4, 16, 0, 135, 3, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 1, 4, 110, 11, 134, 3, 0, 0, 248, 219, 0, 0, 4, 0, 0, 0, 1, 4, 90, 0, 1, 5, 0, 0, 1, 6, 1, 0, 134, 3, 0, 0, 244, 153, 0, 0, 4, 5, 6, 0, 1, 6, 37, 0, 1, 5, 0, 0, 1, 4, 1, 0, 134, 3, 0, 0, 160, 139, 0, 0, 6, 5, 4, 0, 1, 4, 100, 0, 1, 5, 0, 0, 1, 6, 1, 0, 134, 3, 0, 0, 160, 128, 0, 0, 4, 5, 6, 0, 137, 2, 0, 0, 139, 0, 0, 0, 140, 2, 10, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 136, 7, 0, 0, 25, 7, 7, 32, 137, 7, 0, 0, 130, 7, 0, 0, 136, 8, 0, 0, 49, 7, 7, 8, 204, 221, 0, 0, 1, 8, 32, 0, 135, 7, 0, 0, 8, 0, 0, 0, 0, 3, 6, 0, 0, 2, 0, 0, 85, 3, 1, 0, 0, 4, 2, 0, 1, 8, 66, 26, 1, 9, 51, 0, 134, 7, 0, 0, 76, 143, 0, 0, 8, 9, 4, 3, 1, 9, 66, 26, 134, 7, 0, 0, 76, 224, 0, 0, 9, 0, 0, 0, 137, 6, 0, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 2, 104, 22, 1, 3, 1, 0, 83, 2, 3, 0, 1, 3, 64, 23, 61, 2, 0, 0, 0, 0, 68, 65, 89, 3, 2, 0, 1, 2, 68, 23, 59, 3, 159, 8, 89, 2, 3, 0, 1, 3, 72, 23, 61, 2, 0, 0, 154, 153, 25, 62, 89, 3, 2, 0, 1, 2, 76, 23, 61, 3, 0, 0, 0, 0, 192, 63, 89, 2, 3, 0, 1, 3, 80, 23, 61, 2, 0, 0, 236, 81, 184, 61, 89, 3, 2, 0, 1, 2, 84, 23, 61, 3, 0, 0, 205, 204, 140, 63, 89, 2, 3, 0, 1, 3, 12, 23, 1, 2, 238, 2, 84, 3, 2, 0, 1, 2, 60, 23, 1, 3, 127, 0, 84, 2, 3, 0, 1, 3, 62, 23, 1, 2, 50, 0, 84, 3, 2, 0, 134, 2, 0, 0, 156, 233, 0, 0, 139, 0, 0, 0, 140, 0, 7, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 136, 3, 0, 0, 25, 3, 3, 16, 137, 3, 0, 0, 130, 3, 0, 0, 136, 4, 0, 0, 49, 3, 3, 4, 240, 222, 0, 0, 1, 4, 16, 0, 135, 3, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 134, 3, 0, 0, 28, 235, 0, 0, 1, 4, 86, 11, 134, 3, 0, 0, 248, 219, 0, 0, 4, 0, 0, 0, 1, 4, 25, 0, 1, 5, 0, 0, 1, 6, 1, 0, 134, 3, 0, 0, 244, 153, 0, 0, 4, 5, 6, 0, 134, 3, 0, 0, 48, 228, 0, 0, 137, 2, 0, 0, 139, 0, 0, 0, 140, 1, 11, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 136, 9, 0, 0, 25, 9, 9, 16, 137, 9, 0, 0, 130, 9, 0, 0, 136, 10, 0, 0, 49, 9, 9, 10, 112, 223, 0, 0, 1, 10, 16, 0, 135, 9, 0, 0, 10, 0, 0, 0, 0, 1, 0, 0, 1, 9, 104, 22, 78, 2, 9, 0, 38, 9, 2, 1, 0, 3, 9, 0, 38, 9, 3, 1, 0, 4, 9, 0, 0, 5, 1, 0, 1, 9, 1, 0, 135, 6, 20, 0, 9, 4, 5, 0, 137, 8, 0, 0, 139, 0, 0, 0, 140, 4, 7, 0, 0, 0, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 136, 6, 0, 0, 25, 6, 6, 16, 137, 6, 0, 0, 0, 4, 5, 0, 134, 6, 0, 0, 108, 61, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 137, 5, 0, 0, 106, 6, 4, 4, 129, 6, 0, 0, 82, 6, 4, 0, 139, 6, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 136, 6, 0, 0, 25, 6, 6, 16, 137, 6, 0, 0, 130, 6, 0, 0, 136, 7, 0, 0, 49, 6, 6, 7, 36, 224, 0, 0, 1, 7, 16, 0, 135, 6, 0, 0, 7, 0, 0, 0, 0, 3, 5, 0, 0, 1, 0, 0, 0, 2, 1, 0, 85, 3, 2, 0, 1, 7, 55, 2, 134, 6, 0, 0, 248, 219, 0, 0, 7, 3, 0, 0, 137, 5, 0, 0, 139, 0, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 136, 6, 0, 0, 25, 6, 6, 16, 137, 6, 0, 0, 130, 6, 0, 0, 136, 7, 0, 0, 49, 6, 6, 7, 136, 224, 0, 0, 1, 7, 16, 0, 135, 6, 0, 0, 7, 0, 0, 0, 0, 3, 5, 0, 0, 1, 0, 0, 0, 2, 1, 0, 85, 3, 2, 0, 1, 7, 65, 2, 134, 6, 0, 0, 248, 219, 0, 0, 7, 3, 0, 0, 137, 5, 0, 0, 139, 0, 0, 0, 140, 1, 5, 0, 0, 0, 0, 0, 130, 2, 2, 0, 1, 3, 255, 0, 19, 3, 0, 3, 90, 1, 2, 3, 34, 2, 1, 8, 121, 2, 2, 0, 139, 1, 0, 0, 130, 2, 2, 0, 42, 3, 0, 8, 1, 4, 255, 0, 19, 3, 3, 4, 90, 1, 2, 3, 34, 2, 1, 8, 121, 2, 3, 0, 25, 2, 1, 8, 139, 2, 0, 0, 130, 2, 2, 0, 42, 3, 0, 16, 1, 4, 255, 0, 19, 3, 3, 4, 90, 1, 2, 3, 34, 2, 1, 8, 121, 2, 3, 0, 25, 2, 1, 16, 139, 2, 0, 0, 130, 2, 2, 0, 43, 3, 0, 24, 90, 2, 2, 3, 25, 2, 2, 24, 139, 2, 0, 0, 140, 1, 11, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 136, 9, 0, 0, 25, 9, 9, 16, 137, 9, 0, 0, 130, 9, 0, 0, 136, 10, 0, 0, 49, 9, 9, 10, 108, 225, 0, 0, 1, 10, 16, 0, 135, 9, 0, 0, 10, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1, 0, 76, 9, 2, 0, 58, 3, 9, 0, 1, 9, 64, 23, 88, 4, 9, 0, 65, 5, 3, 4, 75, 6, 5, 0, 137, 8, 0, 0, 139, 6, 0, 0, 140, 0, 6, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 136, 4, 0, 0, 25, 4, 4, 16, 137, 4, 0, 0, 130, 4, 0, 0, 136, 5, 0, 0, 49, 4, 4, 5, 208, 225, 0, 0, 1, 5, 16, 0, 135, 4, 0, 0, 5, 0, 0, 0, 0, 1, 3, 0, 134, 0, 0, 0, 192, 232, 0, 0, 1, 4, 124, 22, 85, 4, 0, 0, 1, 5, 127, 12, 134, 4, 0, 0, 248, 219, 0, 0, 5, 1, 0, 0, 137, 3, 0, 0, 139, 0, 0, 0, 140, 1, 9, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 136, 7, 0, 0, 25, 7, 7, 16, 137, 7, 0, 0, 130, 7, 0, 0, 136, 8, 0, 0, 49, 7, 7, 8, 56, 226, 0, 0, 1, 8, 16, 0, 135, 7, 0, 0, 8, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1, 0, 25, 3, 2, 13, 1, 7, 0, 0, 83, 3, 7, 0, 25, 4, 2, 14, 1, 7, 0, 0, 83, 4, 7, 0, 137, 6, 0, 0, 139, 0, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 136, 6, 0, 0, 25, 6, 6, 16, 137, 6, 0, 0, 130, 6, 0, 0, 136, 7, 0, 0, 49, 6, 6, 7, 156, 226, 0, 0, 1, 7, 16, 0, 135, 6, 0, 0, 7, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1, 0, 1, 6, 112, 22, 85, 6, 2, 0, 0, 3, 1, 0, 134, 6, 0, 0, 140, 215, 0, 0, 3, 0, 0, 0, 137, 5, 0, 0, 139, 0, 0, 0, 140, 0, 7, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 136, 3, 0, 0, 25, 3, 3, 16, 137, 3, 0, 0, 130, 3, 0, 0, 136, 4, 0, 0, 49, 3, 3, 4, 0, 227, 0, 0, 1, 4, 16, 0, 135, 3, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 1, 4, 110, 11, 134, 3, 0, 0, 248, 219, 0, 0, 4, 0, 0, 0, 1, 4, 29, 0, 1, 5, 0, 0, 1, 6, 1, 0, 134, 3, 0, 0, 48, 149, 0, 0, 4, 5, 6, 0, 137, 2, 0, 0, 139, 0, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 136, 3, 0, 0, 25, 3, 3, 16, 137, 3, 0, 0, 130, 3, 0, 0, 136, 4, 0, 0, 49, 3, 3, 4, 112, 227, 0, 0, 1, 4, 16, 0, 135, 3, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 134, 3, 0, 0, 28, 235, 0, 0, 1, 4, 129, 8, 134, 3, 0, 0, 248, 219, 0, 0, 4, 0, 0, 0, 137, 2, 0, 0, 139, 0, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 136, 3, 0, 0, 25, 3, 3, 16, 137, 3, 0, 0, 130, 3, 0, 0, 136, 4, 0, 0, 49, 3, 3, 4, 208, 227, 0, 0, 1, 4, 16, 0, 135, 3, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 1, 4, 38, 4, 134, 3, 0, 0, 248, 219, 0, 0, 4, 0, 0, 0, 137, 2, 0, 0, 139, 0, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 1, 7, 0, 240, 16, 2, 7, 0, 121, 2, 8, 0, 1, 7, 0, 0, 4, 3, 7, 0, 134, 4, 0, 0, 228, 231, 0, 0, 85, 4, 3, 0, 1, 1, 255, 255, 119, 0, 2, 0, 0, 1, 0, 0, 139, 1, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 136, 3, 0, 0, 25, 3, 3, 16, 137, 3, 0, 0, 130, 3, 0, 0, 136, 4, 0, 0, 49, 3, 3, 4, 108, 228, 0, 0, 1, 4, 16, 0, 135, 3, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 1, 4, 58, 4, 134, 3, 0, 0, 248, 219, 0, 0, 4, 0, 0, 0, 137, 2, 0, 0, 139, 0, 0, 0, 140, 1, 7, 0, 0, 0, 0, 0, 1, 3, 0, 0, 136, 5, 0, 0, 0, 4, 5, 0, 136, 5, 0, 0, 25, 5, 5, 16, 137, 5, 0, 0, 130, 5, 0, 0, 136, 6, 0, 0, 49, 5, 5, 6, 196, 228, 0, 0, 1, 6, 16, 0, 135, 5, 0, 0, 6, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1, 0, 135, 5, 21, 0, 2, 0, 0, 0, 137, 4, 0, 0, 139, 0, 0, 0, 140, 2, 8, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 136, 6, 0, 0, 25, 6, 6, 16, 137, 6, 0, 0, 130, 6, 0, 0, 136, 7, 0, 0, 49, 6, 6, 7, 24, 229, 0, 0, 1, 7, 16, 0, 135, 6, 0, 0, 7, 0, 0, 0, 0, 2, 0, 0, 0, 3, 1, 0, 137, 5, 0, 0, 139, 0, 0, 0, 140, 2, 8, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 136, 6, 0, 0, 25, 6, 6, 16, 137, 6, 0, 0, 130, 6, 0, 0, 136, 7, 0, 0, 49, 6, 6, 7, 100, 229, 0, 0, 1, 7, 16, 0, 135, 6, 0, 0, 7, 0, 0, 0, 0, 2, 0, 0, 0, 3, 1, 0, 137, 5, 0, 0, 139, 0, 0, 0, 140, 3, 9, 0, 0, 0, 0, 0, 1, 6, 0, 0, 136, 8, 0, 0, 0, 7, 8, 0, 82, 3, 0, 0, 38, 8, 3, 32, 0, 4, 8, 0, 32, 5, 4, 0, 121, 5, 4, 0, 134, 8, 0, 0, 116, 122, 0, 0, 1, 2, 0, 0, 139, 0, 0, 0, 140, 1, 6, 0, 0, 0, 0, 0, 1, 3, 0, 0, 136, 5, 0, 0, 0, 4, 5, 0, 127, 5, 0, 0, 87, 5, 0, 0, 127, 5, 0, 0, 82, 1, 5, 0, 127, 5, 0, 0, 106, 2, 5, 4, 129, 2, 0, 0, 139, 1, 0, 0, 140, 1, 6, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 136, 4, 0, 0, 25, 4, 4, 16, 137, 4, 0, 0, 130, 4, 0, 0, 136, 5, 0, 0, 49, 4, 4, 5, 28, 230, 0, 0, 1, 5, 16, 0, 135, 4, 0, 0, 5, 0, 0, 0, 0, 1, 0, 0, 137, 3, 0, 0, 139, 0, 0, 0, 140, 2, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 1, 7, 0, 0, 13, 3, 0, 7, 121, 3, 3, 0, 1, 2, 0, 0, 119, 0, 6, 0, 1, 7, 0, 0, 134, 4, 0, 0, 88, 114, 0, 0, 0, 1, 7, 0, 0, 2, 4, 0, 139, 2, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 134, 1, 0, 0, 84, 233, 0, 0, 1, 7, 188, 0, 3, 2, 1, 7, 82, 3, 2, 0, 134, 4, 0, 0, 152, 162, 0, 0, 0, 3, 0, 0, 139, 4, 0, 0, 140, 4, 8, 0, 0, 0, 0, 0, 4, 4, 0, 2, 4, 5, 1, 3, 4, 6, 1, 3, 16, 7, 0, 2, 4, 5, 6, 7, 129, 5, 0, 0, 139, 4, 0, 0, 140, 0, 7, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 134, 0, 0, 0, 192, 232, 0, 0, 1, 6, 124, 22, 82, 1, 6, 0, 4, 2, 0, 1, 2, 6, 0, 0, 208, 126, 1, 0, 4, 3, 6, 2, 139, 3, 0, 0, 140, 2, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 32, 3, 1, 0, 134, 4, 0, 0, 200, 233, 0, 0, 0, 0, 0, 0, 125, 2, 3, 0, 4, 0, 0, 0, 139, 2, 0, 0, 140, 4, 6, 0, 0, 0, 0, 0, 1, 5, 0, 0, 134, 4, 0, 0, 108, 61, 0, 0, 0, 1, 2, 3, 5, 0, 0, 0, 139, 4, 0, 0, 140, 4, 8, 0, 0, 0, 0, 0, 3, 4, 0, 2, 3, 6, 1, 3, 16, 7, 4, 0, 3, 5, 6, 7, 129, 5, 0, 0, 139, 4, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 130, 26, 1, 4, 17, 0, 134, 2, 0, 0, 220, 228, 0, 0, 3, 4, 0, 0, 1, 4, 131, 26, 1, 3, 33, 0, 134, 2, 0, 0, 220, 228, 0, 0, 4, 3, 0, 0, 1, 3, 132, 26, 1, 4, 9, 0, 134, 2, 0, 0, 220, 228, 0, 0, 3, 4, 0, 0, 139, 0, 0, 0, 140, 2, 6, 0, 0, 0, 0, 0, 1, 3, 0, 0, 136, 5, 0, 0, 0, 4, 5, 0, 134, 2, 0, 0, 160, 219, 0, 0, 0, 1, 0, 0, 139, 2, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 134, 0, 0, 0, 52, 233, 0, 0, 25, 1, 0, 64, 139, 1, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 134, 2, 0, 0, 16, 234, 0, 0, 134, 2, 0, 0, 116, 233, 0, 0, 139, 0, 0, 0, 140, 2, 2, 0, 0, 0, 0, 0, 137, 0, 0, 0, 132, 0, 0, 1, 139, 0, 0, 0, 140, 2, 6, 0, 0, 0, 0, 0, 1, 3, 0, 0, 136, 5, 0, 0, 0, 4, 5, 0, 134, 2, 0, 0, 224, 164, 0, 0, 0, 1, 0, 0, 139, 2, 0, 0, 140, 0, 6, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 130, 255, 1, 4, 0, 0, 1, 5, 1, 0, 134, 2, 0, 0, 160, 128, 0, 0, 3, 4, 5, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 234, 12, 134, 2, 0, 0, 76, 224, 0, 0, 3, 0, 0, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 1, 3, 0, 0, 135, 0, 22, 0, 3, 0, 0, 0, 139, 0, 0, 0, 140, 0, 6, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 60, 0, 1, 4, 0, 0, 1, 5, 1, 0, 134, 2, 0, 0, 160, 128, 0, 0, 3, 4, 5, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 134, 0, 0, 0, 128, 235, 0, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 134, 0, 0, 0, 128, 235, 0, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 134, 0, 0, 0, 128, 235, 0, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 88, 23, 134, 2, 0, 0, 76, 214, 0, 0, 3, 0, 0, 0, 139, 0, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 136, 26, 1, 4, 29, 0, 134, 2, 0, 0, 220, 228, 0, 0, 3, 4, 0, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 255, 0, 19, 1, 0, 1, 41, 1, 1, 24, 42, 2, 0, 8, 1, 3, 255, 0, 19, 2, 2, 3, 41, 2, 2, 16, 20, 1, 1, 2, 42, 2, 0, 16, 1, 3, 255, 0, 19, 2, 2, 3, 41, 2, 2, 8, 20, 1, 1, 2, 43, 2, 0, 24, 20, 1, 1, 2, 139, 1, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 104, 22, 134, 2, 0, 0, 252, 225, 0, 0, 3, 0, 0, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 228, 25, 135, 2, 23, 0, 3, 0, 0, 0, 1, 2, 236, 25, 139, 2, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 2, 164, 25, 139, 2, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 228, 25, 135, 2, 24, 0, 3, 0, 0, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 139, 0, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 1, 3, 0, 0, 139, 3, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 139, 0, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 139, 0, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 139, 0, 0, 0, 140, 3, 5, 0, 0, 0, 0, 0, 1, 4, 1, 0, 135, 3, 25, 0, 4, 0, 0, 0, 1, 3, 0, 0, 139, 3, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 139, 0, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 2, 52, 0, 139, 2, 0, 0, 140, 1, 3, 0, 0, 0, 0, 0, 1, 2, 0, 0, 135, 1, 26, 0, 2, 0, 0, 0, 1, 1, 0, 0, 139, 1, 0, 0 ], eb + 51200);
 var relocations = [];
 relocations = relocations.concat([ 80, 780, 1976, 2284, 2464, 2568, 2868, 3044, 3128, 3232, 4452, 4516, 4584, 4676, 4832, 4900, 5236, 5488, 6116, 6300, 6304, 6308, 6312, 6316, 6320, 6324, 6328, 6332, 6336, 6340, 6344, 6348, 6352, 6356, 6360, 6364, 6368, 6372, 6376, 6380, 6384, 6388, 6392, 6396, 6400, 6404, 6408, 6412, 6416, 6420, 6424, 6428, 6432, 6436, 6440, 6444, 6448, 6684, 7684, 8312, 8476, 8712, 8772, 8916, 8920, 8924, 8928, 8932, 8936, 8940, 8944, 8948, 8952, 8956, 8960, 8964, 8968, 8972, 8976, 8980, 8984, 8988, 8992, 8996, 9e3, 9004, 9008, 9012, 9016, 9020, 9024, 9028, 9032, 9036, 9040, 9044, 9048, 9052, 9056, 9060, 9064, 9068, 9072, 9076, 9080, 9084, 9088, 9092, 9096, 9100, 9104, 9108, 9112, 9116, 9120, 9124, 9128, 9132, 9136, 9740, 9744, 9748, 9752, 9756, 9760, 9764, 9768, 10660, 11604, 11924, 12084, 12088, 12092, 12096, 12100, 12104, 12108, 12112, 12116, 12120, 12124, 12128, 12132, 12136, 12140, 12144, 12148, 12152, 12156, 12160, 12164, 12168, 12172, 12176, 12180, 12184, 12188, 12192, 12196, 12200, 12204, 12208, 12212, 12216, 12220, 12224, 12228, 12232, 12236, 12240, 12244, 12248, 12252, 12256, 12260, 12264, 12268, 12272, 12276, 12280, 12284, 12288, 14560, 14564, 14568, 14572, 14576, 14580, 14584, 14588, 14592, 14596, 17248, 17424, 17428, 17432, 17436, 17440, 17444, 17448, 17452, 17456, 17460, 17464, 17468, 17472, 17476, 17480, 17484, 17488, 17492, 17496, 17500, 17504, 17508, 17512, 17516, 17520, 17524, 17528, 17532, 17536, 17540, 17544, 17548, 17552, 17556, 17560, 17564, 17568, 17572, 17576, 17580, 17584, 17588, 17592, 17596, 17600, 17604, 17608, 17612, 17616, 17620, 17624, 17628, 17632, 17636, 17640, 17644, 17648, 17652, 17656, 17660, 17664, 17744, 17748, 17752, 18276, 18280, 18284, 18644, 18648, 18652, 18904, 20652, 21920, 22316, 22320, 22324, 22328, 22332, 22336, 22340, 22344, 22348, 22352, 22356, 22360, 22364, 22368, 22372, 22376, 22380, 22384, 22388, 22392, 22396, 22400, 22404, 22408, 22412, 22416, 22420, 22424, 22428, 22432, 22436, 22440, 22444, 22448, 22452, 22456, 22460, 22464, 22468, 22472, 22476, 22480, 22484, 22488, 22492, 22496, 22500, 22504, 22508, 22512, 22516, 22520, 22524, 22528, 22532, 22536, 22540, 22544, 22548, 22552, 22556, 22560, 22564, 22568, 22572, 22576, 22580, 22584, 22588, 22592, 22596, 22600, 22604, 22608, 22612, 22616, 22620, 22624, 22628, 22632, 22636, 22640, 22644, 22648, 22652, 22656, 22660, 22664, 22668, 22672, 22676, 22680, 22684, 22688, 22692, 22696, 22700, 22704, 22708, 22712, 22716, 22720, 22724, 22728, 22732, 22736, 22740, 22744, 22748, 22752, 22756, 22760, 22764, 22768, 22772, 22776, 22780, 22784, 22788, 22792, 22796, 22800, 22804, 22808, 22812, 22816, 22820, 23224, 24352, 24848, 24852, 25940, 27044, 28040, 28148, 28152, 28156, 28232, 28236, 28240, 28528, 28532, 29960, 30020, 30492, 31760, 32972, 33212, 33216, 33220, 33224, 33228, 33232, 33236, 33240, 33244, 33248, 33252, 33256, 33260, 33264, 33268, 33272, 33276, 33280, 33284, 33288, 33292, 33296, 33300, 33304, 33308, 33312, 33316, 33320, 33324, 33328, 33332, 33336, 33340, 33344, 33348, 33352, 33356, 33360, 33364, 33368, 33372, 33376, 33380, 33384, 33388, 33392, 33396, 33400, 33404, 33408, 33412, 33416, 33420, 33424, 33428, 33432, 33436, 33440, 33444, 33448, 33452, 33456, 33460, 33464, 33468, 33472, 33476, 33480, 33484, 33488, 33492, 33496, 33500, 33504, 33508, 33512, 33516, 33520, 33524, 33528, 33532, 33772, 33812, 33816, 33820, 33824, 33828, 33832, 33836, 33840, 33844, 33848, 33852, 33856, 34280, 34332, 34336, 34340, 34344, 34348, 34352, 34356, 34360, 34364, 34368, 34372, 34376, 34380, 34384, 34388, 34392, 34396, 34400, 34404, 34408, 34412, 34416, 34420, 34424, 34428, 34432, 34436, 34440, 34444, 34448, 34452, 34456, 34460, 34464, 34468, 34472, 34476, 34480, 34484, 34488, 34492, 34496, 34500, 34504, 34508, 34512, 34516, 34520, 34524, 34528, 34532, 34536, 34888, 34980, 34984, 34988, 34992, 34996, 35e3, 35004, 35008, 35012, 35016, 35020, 35024, 35028, 35032, 35036, 35040, 35044, 35048, 35052, 35056, 35060, 35064, 35068, 35072, 35076, 35080, 35084, 35088, 35092, 35096, 35100, 35104, 35108, 35112, 35116, 35120, 35124, 35128, 35132, 35136, 35140, 35144, 35148, 35152, 35156, 35160, 35164, 35168, 35172, 35176, 35180, 35184, 35188, 35192, 35196, 35200, 35204, 35208, 35212, 35216, 35220, 35224, 35228, 35232, 35236, 35240, 35244, 35248, 35252, 35256, 35260, 35264, 35268, 35272, 35276, 35280, 35284, 35288, 35292, 35296, 35300, 35304, 35308, 35312, 35316, 35320, 35324, 35328, 35332, 35336, 35340, 35344, 35348, 35352, 35356, 35360, 35364, 35368, 35372, 35376, 35380, 35384, 35388, 35392, 35396, 35400, 35404, 35408, 35412, 35416, 35420, 35424, 35428, 35432, 35436, 35440, 35444, 35448, 35452, 35456, 35460, 35464, 35468, 35472, 35476, 35480, 35484, 35488, 35788, 36024, 36028, 36032, 36036, 36040, 36044, 36048, 36052, 36056, 36060, 36064, 36068, 36072, 36076, 36080, 36084, 36088, 36092, 36096, 36100, 36104, 36108, 36112, 36116, 36120, 36124, 36128, 36132, 36136, 36140, 36144, 36148, 36152, 36156, 36160, 36164, 36168, 36172, 36176, 36180, 36184, 36188, 36192, 36196, 36200, 36204, 36208, 36212, 36216, 36220, 36224, 36228, 36232, 36236, 36240, 36244, 36248, 36252, 36256, 36260, 36264, 36268, 36272, 36276, 36280, 36284, 36288, 36292, 36296, 36300, 36304, 36308, 36312, 36316, 36320, 36324, 36328, 36332, 36336, 36340, 36344, 36348, 36352, 36356, 36360, 36364, 36368, 36372, 36376, 36380, 36384, 36388, 36392, 36396, 36400, 36404, 36408, 36412, 36416, 36420, 36424, 36428, 36432, 36436, 36440, 36444, 36448, 36452, 36456, 36460, 36464, 36468, 36472, 36476, 36480, 36484, 36488, 36492, 36496, 36500, 36504, 36508, 36512, 36516, 36732, 36788, 37068, 37660, 38236, 38456, 38460, 38464, 38468, 38472, 38476, 38480, 38484, 38488, 38492, 38496, 38500, 38504, 38508, 38512, 38516, 38520, 38524, 38528, 38532, 38536, 38540, 38544, 38548, 38552, 38556, 38560, 38564, 38568, 38572, 38576, 38580, 39104, 39456, 39684, 39688, 39692, 39696, 39700, 39704, 39708, 39712, 39716, 39720, 39724, 39728, 39732, 39736, 39740, 39744, 39748, 39752, 39756, 39760, 39764, 39768, 39772, 39776, 39780, 39784, 39788, 39792, 39796, 39800, 39804, 39808, 39812, 39816, 39820, 39824, 39828, 39832, 39836, 39840, 39844, 39848, 39852, 39856, 39860, 39864, 39868, 39872, 39876, 39880, 39884, 39888, 39892, 39896, 39900, 39904, 39908, 39912, 39916, 39920, 39924, 39928, 39932, 39936, 39940, 39944, 40100, 40620, 41228, 41920, 42320, 42324, 42328, 42332, 42336, 42340, 42344, 42348, 42352, 42356, 42360, 42364, 42368, 42372, 42376, 42380, 42384, 42388, 42392, 42396, 42400, 42404, 42408, 42412, 42416, 42420, 42424, 42428, 42432, 42436, 42440, 42444, 42448, 42452, 42456, 42460, 42464, 42468, 42472, 42476, 42480, 42484, 42488, 42492, 42496, 42500, 42504, 42508, 42512, 42516, 42520, 42524, 42528, 42532, 42536, 42540, 42544, 42548, 42552, 42556, 42560, 42564, 42568, 42572, 42576, 42580, 42584, 42588, 42592, 42596, 42600, 42604, 42608, 42612, 42616, 42620, 42624, 42628, 42632, 42636, 42640, 42644, 42648, 42652, 42656, 42660, 42664, 42668, 42672, 42676, 42680, 42684, 42688, 42692, 42696, 42700, 42704, 42708, 42712, 42716, 42720, 42724, 42728, 42732, 42736, 42740, 42744, 42748, 42752, 42756, 42760, 42764, 42768, 42772, 42776, 42780, 42784, 42788, 42792, 42796, 42800, 42804, 42808, 42812, 42816, 42820, 42824, 42828, 42832, 42836, 42840, 42844, 42848, 42852, 42856, 42860, 42864, 42868, 42872, 42876, 42880, 42884, 42888, 42892, 42896, 42900, 42904, 42908, 42912, 42916, 42920, 42924, 42928, 42932, 42936, 42940, 42944, 42948, 42952, 42956, 42960, 42964, 42968, 42972, 42976, 42980, 42984, 42988, 42992, 42996, 43e3, 43004, 43008, 43012, 43016, 43020, 43024, 43028, 43032, 43036, 43040, 43044, 43048, 43052, 43056, 43060, 43064, 43068, 43072, 43076, 43080, 43084, 43088, 43092, 43096, 43100, 43104, 43108, 43112, 43116, 43120, 43124, 43128, 43132, 43136, 43140, 43144, 43148, 43152, 43156, 43160, 43164, 43168, 43172, 43176, 43180, 43184, 43188, 43192, 43196, 43200, 43204, 43208, 43212, 43216, 43220, 43224, 43228, 43232, 43236, 43240, 43244, 43248, 43252, 43256, 43260, 43264, 43268, 43272, 43276, 43280, 43284, 43288, 43292, 43296, 43300, 43304, 43308, 43312, 43316, 43320, 43324, 43328, 43332, 43336, 43340, 43344, 43348, 43352, 43356, 43360, 43364, 43368, 43372, 43376, 43380, 43384, 43388, 43392, 43396, 43400, 43404, 43408, 43412, 43416, 43420, 43424, 43428, 43432, 43436, 43440, 43444, 43448, 43452, 43456, 43460, 43464, 43468, 43472, 43476, 43480, 43484, 43488, 43492, 43496, 43500, 43504, 43508, 43512, 43516, 43520, 43524, 43528, 43532, 43536, 43540, 43544, 43548, 43552, 43556, 43560, 43564, 43568, 43572, 43576, 43580, 43584, 43588, 43592, 43596, 43600, 43604, 43608, 43612, 43616, 43620, 43624, 43628, 43632, 43636, 43640, 43644, 43648, 43652, 43656, 43660, 43664, 43668, 43672, 43676, 43680, 43684, 43688, 43692, 43696, 43700, 43704, 43708, 43712, 43716, 43720, 43724, 43728, 43732, 43736, 43740, 43744, 43748, 43752, 43756, 43760, 43764, 43768, 43772, 43776, 43780, 43784, 43788, 43792, 43796, 43800, 43804, 43808, 43812, 43816, 43820, 43824, 43828, 43832, 43836, 43840, 43844, 43848, 43852, 43856, 43860, 43864, 43868, 43872, 43876, 43880, 43884, 43888, 43892, 43896, 43900, 43904, 43908, 43912, 43916, 43920, 43924, 43928, 43932, 43936, 43940, 43944, 43948, 43952, 43956, 43960, 43964, 43968, 43972, 43976, 43980, 43984, 43988, 43992, 43996, 44e3, 44004, 44008, 44012, 44016, 44020, 44024, 44028, 44032, 44036, 44040, 44044, 44048, 44052, 44056, 44060, 44064, 44068, 44072, 44076, 44080, 44084, 44088, 44092, 44096, 44100, 44104, 44108, 44112, 44116, 44120, 44124, 44128, 44132, 44136, 44140, 44144, 44148, 44152, 44156, 44160, 44164, 44168, 44172, 44176, 44180, 44184, 44188, 44192, 44196, 44200, 44204, 44208, 44212, 44216, 44220, 44224, 44228, 44232, 44236, 44240, 44244, 44248, 44252, 44256, 44260, 44264, 44268, 44272, 44276, 44280, 44284, 44288, 44292, 44296, 44300, 44304, 44308, 44312, 44316, 44320, 44324, 44328, 44332, 44336, 44340, 44344, 44348, 44352, 44356, 44360, 44364, 44368, 44372, 44376, 44380, 44384, 44388, 44392, 44396, 44400, 44404, 44408, 44412, 44416, 44420, 44424, 44428, 44432, 44436, 44440, 44444, 44448, 44452, 44456, 44460, 44464, 44468, 44472, 44476, 44480, 44484, 44488, 44492, 44496, 44500, 44504, 44508, 44512, 44516, 44520, 44524, 44528, 44532, 44536, 44540, 44544, 44548, 44552, 44556, 44560, 44564, 44568, 44572, 44576, 44580, 44584, 44588, 44592, 44596, 44600, 44604, 44608, 44612, 44616, 44620, 44624, 44628, 44632, 44636, 44640, 44644, 44648, 44652, 44656, 44660, 44664, 44668, 44672, 44676, 44680, 44684, 44688, 44692, 44696, 44700, 44704, 44708, 44712, 44716, 44720, 44724, 44728, 44732, 44736, 44740, 44744, 44748, 44752, 44756, 44760, 44764, 44768, 44772, 44776, 44780, 44784, 44788, 44792, 44796, 44800, 44804, 44808, 44812, 44816, 44820, 44824, 44828, 44832, 44836, 44840, 44844, 44848, 44852, 44856, 44860, 44864, 44868, 44872, 44876, 44880, 44884, 44888, 44892, 44896, 44900, 44904, 44908, 44912, 44916, 44920, 44924, 44928, 44932, 44936, 44940, 44944, 44948, 44952, 44956, 44960, 44964, 44968, 44972, 44976, 44980, 44984, 44988, 44992, 44996, 45e3, 45004, 45008, 45012, 45016, 45020, 45024, 45028, 45032, 45036, 45040, 45044, 45048, 45052, 45056, 45060, 45064, 45068, 45072, 45076, 45080, 45084, 45088, 45092, 45096, 45100, 45104, 45108, 45112, 45116, 45120, 45124, 45128, 45132, 45136, 45140, 45144, 45148, 45152, 45156, 45160, 45164, 45168, 45172, 45176, 45180, 45184, 45188, 45192, 45196, 45200, 45204, 45208, 45212, 45216, 45220, 45224, 45228, 45232, 45236, 45240, 45244, 45248, 45252, 45256, 45260, 45264, 45268, 45272, 45276, 45280, 45284, 45288, 45292, 45296, 45300, 45304, 45308, 45312, 45316, 45320, 45324, 45328, 45332, 45336, 45340, 45344, 45348, 45352, 45356, 45360, 45364, 45368, 45372, 45376, 45380, 45384, 45388, 45392, 45396, 45400, 45404, 45408, 45412, 45416, 45420, 45424, 45428, 45432, 45436, 45440, 45444, 45448, 45452, 45456, 45460, 45464, 45468, 45472, 45476, 45480, 45484, 45488, 45492, 45496, 45500, 45504, 45508, 45512, 45516, 45520, 45524, 45528, 45532, 45536, 45540, 45544, 45548, 45552, 45556, 45560, 45564, 45568, 45572, 45576, 45580, 45584, 45588, 45592, 45596, 45600, 45604, 45608, 45612, 45616, 45620, 45624, 45628, 45632, 45636, 45640, 45644, 45648, 45652, 45656, 45660, 45664, 45668, 45672, 45676, 45680, 45684, 45688, 45692, 45696, 45700, 45704, 45708, 45712, 45716, 45720, 45724, 45728, 45732, 45736, 45740, 45744, 45748, 45752, 45756, 45760, 45764, 45768, 45772, 45776, 45780, 45784, 45788, 45792, 45796, 45800, 45804, 45808, 45812, 45816, 45820, 45824, 45828, 45832, 45836, 45840, 45844, 45848, 45852, 45856, 45860, 45864, 45868, 45872, 45876, 45880, 45884, 45888, 45892, 45896, 45900, 45904, 45908, 45912, 45916, 45920, 45924, 45928, 45932, 45936, 45940, 45944, 45948, 45952, 45956, 45960, 45964, 45968, 45972, 45976, 45980, 45984, 45988, 45992, 45996, 46e3, 46004, 46008, 46012, 46016, 46020, 46024, 46028, 46032, 46036, 46040, 46044, 46048, 46052, 46056, 46060, 46064, 46068, 46072, 46076, 46080, 46084, 46088, 46092, 46096, 46100, 46104, 46108, 46112, 46116, 46120, 46124, 46128, 46132, 46136, 46140, 46144, 46148, 46152, 46156, 46160, 46164, 46168, 46172, 46176, 46180, 46184, 46188, 46192, 46196, 46200, 46204, 46208, 46212, 46216, 46220, 46224, 46228, 46232, 46236, 46240, 46244, 46248, 46252, 46256, 46260, 46264, 46268, 46272, 46276, 46280, 46284, 46288, 46292, 46296, 46300, 46304, 46308, 46312, 46316, 46320, 46324, 46328, 46332, 46336, 46340, 46344, 46348, 46352, 46356, 46360, 46364, 46368, 46372, 46376, 46380, 46384, 46388, 46392, 46396, 46400, 46404, 46408, 46412, 46416, 46420, 46424, 46428, 46432, 46436, 46440, 46444, 46448, 46452, 46456, 46460, 46464, 46468, 46472, 46476, 46480, 46484, 46488, 46492, 46496, 46500, 46504, 46508, 46512, 46516, 46520, 46524, 46528, 46532, 46536, 46540, 46544, 46548, 46552, 46556, 46560, 46564, 46568, 46572, 46576, 46580, 46584, 46588, 46592, 46596, 46600, 46604, 46608, 46612, 46616, 46620, 46624, 46628, 46632, 46636, 46640, 46644, 46648, 46652, 46656, 46660, 46664, 46668, 46672, 46676, 46680, 46684, 46688, 46692, 46696, 46700, 46704, 46708, 46712, 46716, 46720, 46724, 46728, 46732, 46736, 46740, 46744, 46748, 46752, 46756, 46760, 46764, 46768, 46772, 46776, 46780, 46784, 46788, 46792, 46796, 46800, 46804, 46808, 46812, 46816, 46820, 46824, 46828, 46832, 46836, 46840, 46844, 46848, 46852, 46856, 46860, 46864, 46868, 46872, 46876, 46880, 46884, 46888, 46892, 46896, 46900, 46904, 46908, 46912, 46916, 46920, 46924, 46928, 46932, 46936, 46940, 46944, 46948, 46952, 46956, 46960, 46964, 46968, 46972, 46976, 46980, 46984, 46988, 46992, 46996, 47e3, 47004, 47008, 47012, 47016, 47020, 47024, 47028, 47032, 47036, 47040, 47044, 47048, 47052, 47056, 47060, 47064, 47068, 47072, 47076, 47080, 47084, 47088, 47092, 47096, 47100, 47104, 47108, 47112, 47116, 47120, 47124, 47128, 47132, 47136, 47140, 47144, 47148, 47152, 47156, 47160, 47164, 47168, 47172, 47176, 47180, 47184, 47188, 47192, 47196, 47200, 47204, 47208, 47212, 47216, 47220, 47224, 47228, 47232, 47236, 47240, 47244, 47248, 47252, 47256, 47260, 47264, 47268, 47272, 47276, 47280, 47284, 47288, 47292, 47296, 47300, 47304, 47308, 47312, 47316, 47320, 47324, 47328, 47332, 47336, 47340, 47344, 47348, 47352, 47356, 47360, 47364, 47368, 47372, 47376, 47380, 47384, 47388, 47392, 47396, 47400, 47404, 47408, 47412, 47416, 47420, 47424, 47428, 47432, 47436, 47440, 47444, 47448, 47452, 47456, 47460, 47464, 47468, 47472, 47476, 47480, 47484, 47488, 47492, 47496, 47500, 47504, 47508, 47512, 47516, 47520, 47524, 47528, 47532, 47536, 47540, 47544, 47548, 47552, 47556, 47560, 47564, 47568, 47572, 47576, 47580, 47584, 47588, 47592, 47596, 47600, 47604, 47608, 47612, 47616, 47620, 47624, 47628, 47632, 47636, 47640, 47644, 47648, 47652, 47656, 47660, 47664, 47668, 47672, 47676, 47680, 47684, 47688, 47692, 47696, 47700, 47704, 47708, 47712, 47716, 47720, 47724, 47728, 47732, 47736, 47740, 47744, 47748, 47752, 47756, 47760, 47764, 47768, 47772, 47776, 47780, 47784, 47788, 47792, 47796, 47800, 47804, 47808, 47812, 47816, 47820, 47824, 47828, 47832, 47836, 47840, 47844, 47848, 47852, 47856, 47860, 47864, 47868, 47872, 47876, 47880, 47884, 47888, 47892, 47896, 47900, 47904, 47908, 47912, 47916, 47920, 47924, 47928, 47932, 47936, 47940, 47944, 47948, 47952, 47956, 47960, 47964, 47968, 47972, 47976, 47980, 47984, 47988, 47992, 47996, 48e3, 48004, 48008, 48012, 48016, 48020, 48024, 48028, 48032, 48036, 48040, 48044, 48048, 48052, 48056, 48060, 48064, 48068, 48072, 48076, 48080, 48084, 48088, 48092, 48096, 48100, 48104, 48108, 48112, 48116, 48120, 48124, 48128, 48132, 48136, 48140, 48144, 48148, 48152, 48156, 48160, 48164, 48168, 48172, 48176, 48180, 48184, 48188, 48192, 48196, 48200, 48204, 48208, 48212, 48216, 48220, 48224, 48228, 48232, 48236, 48240, 48244, 48248, 48252, 48256, 48260, 48264, 48268, 48272, 48276, 48280, 48284, 48288, 48292, 48296, 48300, 48304, 48308, 48312, 48316, 48320, 48324, 48328, 48332, 48336, 48340, 48344, 48348, 48352, 48356, 48360, 48364, 48368, 48372, 48376, 48380, 48384, 48388, 48392, 48396, 48400, 48404, 48408, 48412, 48416, 48420, 48424, 48428, 48432, 48436, 48440, 48444, 48448, 48452, 48456, 48460, 48464, 48468, 48472, 48476, 48480, 48484, 48488, 48492, 48496, 48500, 48504, 48508, 48512, 48516, 48520, 48524, 48528, 48532, 48536, 48540, 48544, 48548, 48552, 48556, 48560, 48564, 48568, 48572, 48576, 48580, 48584, 48588, 48592, 48596, 48600, 48604, 48608, 48612, 48616, 48620, 48624, 48628, 48632, 48636, 48640, 48644, 48648, 48652, 48656, 48660, 48664, 48668, 48672, 48676, 48680, 48684, 48688, 48692, 48696, 48700, 48704, 48708, 48712, 48716, 48720, 48724, 48728, 48732, 48736, 48740, 48744, 48748, 48752, 48756, 48760, 48764, 48768, 48772, 48776, 48780, 48784, 48788, 48792, 48796, 48800, 48804, 48808, 48812, 48816, 48820, 48824, 48828, 48832, 48836, 48840, 48844, 48848, 48852, 48856, 48860, 48864, 48868, 48872, 48876, 48880, 48884, 48888, 48892, 48896, 48900, 48904, 48908, 48912, 48916, 48920, 48924, 48928, 48932, 48936, 48940, 48944, 48948, 48952, 48956, 48960, 48964, 48968, 48972, 48976, 48980, 48984, 48988, 48992, 48996, 49e3, 49004, 49008, 49012, 49016, 49020, 49024, 49028, 49032, 49036, 49040, 49044, 49048, 49052, 49056, 49060, 49064, 49068, 49072, 49076, 49080, 49084, 49088, 49092, 49096, 49100, 49104, 49108, 49112, 49116, 49120, 49124, 49128, 49132, 49136, 49140, 49144, 49148, 49152, 49156, 49160, 49164, 49168, 49172, 49176, 49180, 49184, 49188, 49192, 49196, 49200, 49204, 49208, 49212, 49216, 49220, 49224, 49228, 49232, 49236, 49240, 49244, 49248, 49252, 49256, 49260, 49264, 49268, 49272, 49276, 49280, 49284, 49288, 49292, 49296, 49300, 49304, 49308, 49312, 49316, 49320, 49324, 49328, 49332, 49336, 49340, 49344, 49348, 49352, 49356, 49360, 49364, 49368, 49372, 49376, 49380, 49384, 49388, 49392, 49396, 49400, 49404, 49408, 49412, 49416, 49420, 49424, 49428, 49432, 49436, 49440, 49444, 49448, 49452, 49456, 49460, 49464, 49468, 49472, 49476, 49480, 49484, 49488, 49492, 49496, 49500, 49504, 49508, 49512, 49516, 49520, 49524, 49528, 49532, 49536, 49540, 49544, 49548, 49552, 49556, 49560, 49564, 49568, 49572, 49576, 49580, 49584, 49588, 49592, 49596, 49600, 49604, 49608, 49612, 49616, 49620, 49624, 49628, 49632, 49636, 49640, 49644, 49648, 49652, 49656, 49660, 49664, 49668, 49672, 49676, 49680, 49684, 49688, 49692, 49696, 49700, 49704, 49708, 49712, 49716, 49720, 49724, 49728, 49732, 49736, 49740, 49744, 49748, 49752, 49756, 49760, 49764, 49768, 49772, 49776, 49780, 49784, 49788, 49792, 49796, 49800, 49804, 49808, 49812, 49816, 49820, 49824, 49828, 49832, 49836, 49840, 49844, 49848, 49852, 49856, 49860, 49864, 49868, 49872, 49876, 49880, 49884, 49888, 49892, 49896, 49900, 49904, 49908, 49912, 49916, 49920, 49924, 49928, 49932, 49936, 49940, 49944, 49948, 49952, 49956, 49960, 49964, 49968, 49972, 49976, 49980, 49984, 49988, 49992, 49996, 5e4, 50004, 50008, 50012, 50016, 50020, 50024, 50028, 50032, 50036, 50040, 50044, 50048, 50052, 50056, 50060, 50064, 50068, 50072, 50076, 50080, 50084, 50088, 50092, 50096, 50100, 50104, 50108, 50112, 50116, 50120, 50124, 50128, 50132, 50136, 50140, 50144, 50148, 50152, 50156, 50160, 50164, 50168, 50172, 50176, 50180, 50184, 50188, 50192, 50196, 50200, 50204, 50208, 50212, 50216, 50220, 50224, 50228, 50232, 50236, 50240, 50244, 50248, 50252, 50256, 50260, 50264, 50268, 50272, 50276, 50280, 50284, 50288, 50292, 50296, 50300, 50304, 50308, 50312, 50316, 50320, 50324, 50328, 50332, 50336, 50340, 50344, 50348, 50352, 50356, 50360, 50364, 50368, 50372, 50376, 50380, 50384, 50388, 50392, 50396, 50400, 50404, 50408, 50412, 50416, 50420, 50424, 50428, 50432, 50436, 50440, 50444, 50448, 50452, 50456, 50460, 50464, 50468, 50472, 50476, 50480, 50484, 50488, 50492, 50496, 50500, 50504, 50508, 50960, 51144, 51416, 51608, 51848, 52096, 52316, 53244, 53832, 54096, 54188, 54388, 54568, 54748, 54904, 55072, 55224, 55352, 55796, 55916, 56036, 56156, 56356, 56492, 56604, 56764, 57056, 57184, 57364, 57464, 57692, 57792, 57896, 57996, 58096, 58208, 58304, 58460, 58548, 58632, 58708, 58892, 140, 260, 352, 760, 1252, 1272, 1300, 1336, 1376, 1404, 1428, 1784, 1808, 1836, 4012, 4276, 4292, 4324, 4404, 4652, 4712, 4804, 4972, 5100, 5204, 5312, 5364, 5588, 5708, 5740, 5768, 5928, 5944, 5960, 5988, 6204, 6704, 7936, 8104, 8736, 9296, 9460, 9620, 9668, 9680, 10092, 10396, 10560, 10636, 10800, 10908, 10996, 11048, 11320, 11428, 11444, 11476, 11504, 11524, 11552, 11704, 12304, 12320, 12352, 12380, 12404, 12440, 12456, 12488, 12512, 12548, 12564, 12596, 12624, 12648, 12672, 12708, 12724, 12756, 12784, 12812, 12848, 12860, 12892, 12920, 12948, 12984, 13e3, 13032, 13056, 13080, 13116, 13132, 13164, 13192, 13216, 13240, 13276, 13292, 13320, 13356, 13372, 13404, 13432, 13456, 13492, 13508, 13540, 13568, 13596, 13632, 13648, 13680, 13704, 13740, 13756, 13784, 13820, 13836, 13868, 13892, 13928, 13940, 13972, 14e3, 14028, 14064, 14080, 14112, 14140, 14212, 14240, 14312, 14348, 14380, 14464, 16032, 16640, 16764, 16872, 16996, 17304, 17344, 17360, 17400, 17676, 17700, 17784, 17864, 17932, 17968, 18168, 18232, 18320, 18368, 18416, 18604, 18688, 18736, 18784, 18952, 19040, 19120, 19168, 19196, 19212, 19232, 19252, 19284, 19332, 19364, 19380, 19396, 19444, 19460, 19508, 19524, 19556, 19580, 19596, 19616, 19652, 19700, 19712, 19744, 19760, 19792, 19832, 19900, 20008, 20036, 20048, 20088, 20140, 20160, 20184, 20232, 20264, 20280, 20296, 20336, 20364, 20376, 20460, 20476, 20508, 20552, 20708, 20716, 20728, 20764, 20784, 20800, 20816, 20832, 20848, 20864, 20880, 20896, 20988, 21e3, 21016, 21028, 21040, 21056, 21080, 21092, 21100, 21108, 21120, 21136, 21156, 21172, 21188, 21204, 21220, 21312, 21340, 21436, 21496, 21512, 21544, 21560, 21600, 21612, 21712, 21740, 21804, 21820, 21844, 21856, 22048, 22092, 22120, 22180, 22192, 22852, 22920, 22960, 23e3, 23040, 23080, 23160, 23308, 23424, 23540, 23656, 23832, 23948, 24072, 24196, 24396, 24408, 24444, 24464, 24480, 24496, 24512, 24528, 24544, 24560, 24576, 24588, 24600, 24612, 24624, 24640, 24664, 24676, 24684, 24692, 24704, 24756, 24772, 24792, 24864, 24896, 24948, 25016, 25108, 25236, 25252, 26068, 26244, 26468, 26488, 26508, 26652, 26680, 26764, 26852, 26880, 27080, 27240, 27316, 27352, 27384, 27408, 27420, 27432, 27440, 27464, 27476, 27488, 27496, 27520, 27532, 27544, 27552, 27576, 27588, 27600, 27608, 27632, 27644, 27656, 27664, 27688, 27700, 27712, 27720, 27744, 27756, 27768, 27776, 27800, 27812, 27824, 27832, 27856, 27924, 27956, 28080, 28292, 28396, 28484, 28568, 28592, 28632, 28656, 28764, 29360, 29440, 29888, 30040, 30092, 30228, 30360, 30428, 30536, 30648, 30732, 30776, 30848, 30932, 30964, 30980, 31004, 31020, 31056, 31080, 31116, 31140, 31164, 31180, 31204, 31220, 31256, 31288, 31316, 31392, 31796, 31936, 32032, 32108, 32124, 32172, 32204, 32220, 32244, 32260, 32276, 32292, 32360, 32408, 32440, 32456, 32488, 32600, 32616, 32676, 32724, 32764, 32816, 32852, 32872, 32888, 32912, 33088, 33124, 33176, 33564, 33592, 33620, 33648, 33676, 33704, 33876, 33896, 33912, 33928, 33944, 33964, 33988, 34012, 34032, 34048, 34064, 34084, 34104, 34124, 34568, 35520, 35540, 35560, 35580, 35600, 35620, 35640, 35660, 35680, 35700, 35720, 35900, 35936, 35988, 36548, 36576, 36604, 36632, 36660, 36840, 36952, 37100, 37188, 37272, 37344, 37380, 37456, 37472, 37496, 37512, 37540, 37576, 37692, 37816, 37888, 37944, 37992, 38024, 38040, 38056, 38104, 38136, 38168, 38344, 38380, 38420, 38612, 38640, 38668, 38696, 38812, 38864, 39196, 39208, 39240, 39296, 39560, 39596, 39648, 39976, 40004, 40032, 40132, 40256, 40332, 40368, 40400, 40416, 40432, 40480, 40512, 40544, 40652, 40684, 40716, 40776, 40844, 40880, 40924, 40968, 41012, 41056, 41100, 41144, 41260, 41348, 41420, 41500, 41524, 41552, 41584, 41856, 42028, 42044, 42144, 42160, 50628, 51052, 51356, 51544, 51724, 51788, 52036, 52256, 52380, 52424, 52460, 53360, 53600, 54216, 54248, 54292, 54304, 54316, 54332, 54604, 54672, 54692, 54772, 54784, 54828, 54840, 55132, 55160, 55268, 55292, 55436, 55616, 55632, 55652, 55664, 55828, 55856, 55940, 55956, 55968, 55976, 56064, 56204, 56280, 56400, 56432, 56544, 56632, 56656, 56680, 56704, 56808, 56824, 57004, 57080, 57092, 57116, 57128, 57288, 57404, 57504, 57816, 57836, 58036, 58124, 58148, 58232, 58244, 58332, 58392, 58488, 58784, 58968, 59008, 59028, 59100, 59160, 59196, 59276, 59296, 59316, 59352, 59388, 59424, 59432, 59484, 59532, 59572, 59656, 59692, 59724, 59756, 59792, 59836, 59948 ]);
 for (var i = 0; i < relocations.length; i++) {
  assert(relocations[i] % 4 === 0);
  assert(relocations[i] >= 0 && relocations[i] < eb + 60344);
  assert(HEAPU32[eb + relocations[i] >> 2] + eb < -1 >>> 0, [ i, relocations[i] ]);
  HEAPU32[eb + relocations[i] >> 2] = HEAPU32[eb + relocations[i] >> 2] + eb;
 }
}));
function _emscripten_set_main_loop_timing(mode, value) {
 Browser.mainLoop.timingMode = mode;
 Browser.mainLoop.timingValue = value;
 if (!Browser.mainLoop.func) {
  console.error("emscripten_set_main_loop_timing: Cannot set timing mode for main loop since a main loop does not exist! Call emscripten_set_main_loop first to set one up.");
  return 1;
 }
 if (mode == 0) {
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
   var timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now()) | 0;
   setTimeout(Browser.mainLoop.runner, timeUntilNextTick);
  };
  Browser.mainLoop.method = "timeout";
 } else if (mode == 1) {
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
   Browser.requestAnimationFrame(Browser.mainLoop.runner);
  };
  Browser.mainLoop.method = "rAF";
 } else if (mode == 2) {
  if (!window["setImmediate"]) {
   var setImmediates = [];
   var emscriptenMainLoopMessageId = "setimmediate";
   function Browser_setImmediate_messageHandler(event) {
    if (event.source === window && event.data === emscriptenMainLoopMessageId) {
     event.stopPropagation();
     setImmediates.shift()();
    }
   }
   window.addEventListener("message", Browser_setImmediate_messageHandler, true);
   window["setImmediate"] = function Browser_emulated_setImmediate(func) {
    setImmediates.push(func);
    if (ENVIRONMENT_IS_WORKER) {
     if (Module["setImmediates"] === undefined) Module["setImmediates"] = [];
     Module["setImmediates"].push(func);
     window.postMessage({
      target: emscriptenMainLoopMessageId
     });
    } else window.postMessage(emscriptenMainLoopMessageId, "*");
   };
  }
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
   window["setImmediate"](Browser.mainLoop.runner);
  };
  Browser.mainLoop.method = "immediate";
 }
 return 0;
}
function _emscripten_get_now() {
 abort();
}
function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop, arg, noSetTiming) {
 Module["noExitRuntime"] = true;
 assert(!Browser.mainLoop.func, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");
 Browser.mainLoop.func = func;
 Browser.mainLoop.arg = arg;
 var browserIterationFunc;
 if (typeof arg !== "undefined") {
  browserIterationFunc = (function() {
   Module["dynCall_vi"](func, arg);
  });
 } else {
  browserIterationFunc = (function() {
   Module["dynCall_v"](func);
  });
 }
 var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
 Browser.mainLoop.runner = function Browser_mainLoop_runner() {
  if (ABORT) return;
  if (Browser.mainLoop.queue.length > 0) {
   var start = Date.now();
   var blocker = Browser.mainLoop.queue.shift();
   blocker.func(blocker.arg);
   if (Browser.mainLoop.remainingBlockers) {
    var remaining = Browser.mainLoop.remainingBlockers;
    var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
    if (blocker.counted) {
     Browser.mainLoop.remainingBlockers = next;
    } else {
     next = next + .5;
     Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9;
    }
   }
   console.log('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + " ms");
   Browser.mainLoop.updateStatus();
   if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
   setTimeout(Browser.mainLoop.runner, 0);
   return;
  }
  if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
  if (Browser.mainLoop.timingMode == 1 && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
   Browser.mainLoop.scheduler();
   return;
  } else if (Browser.mainLoop.timingMode == 0) {
   Browser.mainLoop.tickStartTime = _emscripten_get_now();
  }
  if (Browser.mainLoop.method === "timeout" && Module.ctx) {
   Module.printErr("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!");
   Browser.mainLoop.method = "";
  }
  Browser.mainLoop.runIter(browserIterationFunc);
  checkStackCookie();
  if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  if (typeof SDL === "object" && SDL.audio && SDL.audio.queueNewAudioData) SDL.audio.queueNewAudioData();
  Browser.mainLoop.scheduler();
 };
 if (!noSetTiming) {
  if (fps && fps > 0) _emscripten_set_main_loop_timing(0, 1e3 / fps); else _emscripten_set_main_loop_timing(1, 1);
  Browser.mainLoop.scheduler();
 }
 if (simulateInfiniteLoop) {
  throw "SimulateInfiniteLoop";
 }
}
var Browser = {
 mainLoop: {
  scheduler: null,
  method: "",
  currentlyRunningMainloop: 0,
  func: null,
  arg: 0,
  timingMode: 0,
  timingValue: 0,
  currentFrameNumber: 0,
  queue: [],
  pause: (function() {
   Browser.mainLoop.scheduler = null;
   Browser.mainLoop.currentlyRunningMainloop++;
  }),
  resume: (function() {
   Browser.mainLoop.currentlyRunningMainloop++;
   var timingMode = Browser.mainLoop.timingMode;
   var timingValue = Browser.mainLoop.timingValue;
   var func = Browser.mainLoop.func;
   Browser.mainLoop.func = null;
   _emscripten_set_main_loop(func, 0, false, Browser.mainLoop.arg, true);
   _emscripten_set_main_loop_timing(timingMode, timingValue);
   Browser.mainLoop.scheduler();
  }),
  updateStatus: (function() {
   if (Module["setStatus"]) {
    var message = Module["statusMessage"] || "Please wait...";
    var remaining = Browser.mainLoop.remainingBlockers;
    var expected = Browser.mainLoop.expectedBlockers;
    if (remaining) {
     if (remaining < expected) {
      Module["setStatus"](message + " (" + (expected - remaining) + "/" + expected + ")");
     } else {
      Module["setStatus"](message);
     }
    } else {
     Module["setStatus"]("");
    }
   }
  }),
  runIter: (function(func) {
   if (ABORT) return;
   if (Module["preMainLoop"]) {
    var preRet = Module["preMainLoop"]();
    if (preRet === false) {
     return;
    }
   }
   try {
    func();
   } catch (e) {
    if (e instanceof ExitStatus) {
     return;
    } else {
     if (e && typeof e === "object" && e.stack) Module.printErr("exception thrown: " + [ e, e.stack ]);
     throw e;
    }
   }
   if (Module["postMainLoop"]) Module["postMainLoop"]();
  })
 },
 isFullscreen: false,
 pointerLock: false,
 moduleContextCreatedCallbacks: [],
 workers: [],
 init: (function() {
  if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];
  if (Browser.initted) return;
  Browser.initted = true;
  try {
   new Blob;
   Browser.hasBlobConstructor = true;
  } catch (e) {
   Browser.hasBlobConstructor = false;
   console.log("warning: no blob constructor, cannot create blobs with mimetypes");
  }
  Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : !Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null;
  Browser.URLObject = typeof window != "undefined" ? window.URL ? window.URL : window.webkitURL : undefined;
  if (!Module.noImageDecoding && typeof Browser.URLObject === "undefined") {
   console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
   Module.noImageDecoding = true;
  }
  var imagePlugin = {};
  imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
   return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
  };
  imagePlugin["handle"] = function imagePlugin_handle(byteArray, name, onload, onerror) {
   var b = null;
   if (Browser.hasBlobConstructor) {
    try {
     b = new Blob([ byteArray ], {
      type: Browser.getMimetype(name)
     });
     if (b.size !== byteArray.length) {
      b = new Blob([ (new Uint8Array(byteArray)).buffer ], {
       type: Browser.getMimetype(name)
      });
     }
    } catch (e) {
     Runtime.warnOnce("Blob constructor present but fails: " + e + "; falling back to blob builder");
    }
   }
   if (!b) {
    var bb = new Browser.BlobBuilder;
    bb.append((new Uint8Array(byteArray)).buffer);
    b = bb.getBlob();
   }
   var url = Browser.URLObject.createObjectURL(b);
   assert(typeof url == "string", "createObjectURL must return a url as a string");
   var img = new Image;
   img.onload = function img_onload() {
    assert(img.complete, "Image " + name + " could not be decoded");
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    Module["preloadedImages"][name] = canvas;
    Browser.URLObject.revokeObjectURL(url);
    if (onload) onload(byteArray);
   };
   img.onerror = function img_onerror(event) {
    console.log("Image " + url + " could not be decoded");
    if (onerror) onerror();
   };
   img.src = url;
  };
  Module["preloadPlugins"].push(imagePlugin);
  var audioPlugin = {};
  audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
   return !Module.noAudioDecoding && name.substr(-4) in {
    ".ogg": 1,
    ".wav": 1,
    ".mp3": 1
   };
  };
  audioPlugin["handle"] = function audioPlugin_handle(byteArray, name, onload, onerror) {
   var done = false;
   function finish(audio) {
    if (done) return;
    done = true;
    Module["preloadedAudios"][name] = audio;
    if (onload) onload(byteArray);
   }
   function fail() {
    if (done) return;
    done = true;
    Module["preloadedAudios"][name] = new Audio;
    if (onerror) onerror();
   }
   if (Browser.hasBlobConstructor) {
    try {
     var b = new Blob([ byteArray ], {
      type: Browser.getMimetype(name)
     });
    } catch (e) {
     return fail();
    }
    var url = Browser.URLObject.createObjectURL(b);
    assert(typeof url == "string", "createObjectURL must return a url as a string");
    var audio = new Audio;
    audio.addEventListener("canplaythrough", (function() {
     finish(audio);
    }), false);
    audio.onerror = function audio_onerror(event) {
     if (done) return;
     console.log("warning: browser could not fully decode audio " + name + ", trying slower base64 approach");
     function encode64(data) {
      var BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var PAD = "=";
      var ret = "";
      var leftchar = 0;
      var leftbits = 0;
      for (var i = 0; i < data.length; i++) {
       leftchar = leftchar << 8 | data[i];
       leftbits += 8;
       while (leftbits >= 6) {
        var curr = leftchar >> leftbits - 6 & 63;
        leftbits -= 6;
        ret += BASE[curr];
       }
      }
      if (leftbits == 2) {
       ret += BASE[(leftchar & 3) << 4];
       ret += PAD + PAD;
      } else if (leftbits == 4) {
       ret += BASE[(leftchar & 15) << 2];
       ret += PAD;
      }
      return ret;
     }
     audio.src = "data:audio/x-" + name.substr(-3) + ";base64," + encode64(byteArray);
     finish(audio);
    };
    audio.src = url;
    Browser.safeSetTimeout((function() {
     finish(audio);
    }), 1e4);
   } else {
    return fail();
   }
  };
  Module["preloadPlugins"].push(audioPlugin);
  function pointerLockChange() {
   Browser.pointerLock = document["pointerLockElement"] === Module["canvas"] || document["mozPointerLockElement"] === Module["canvas"] || document["webkitPointerLockElement"] === Module["canvas"] || document["msPointerLockElement"] === Module["canvas"];
  }
  var canvas = Module["canvas"];
  if (canvas) {
   canvas.requestPointerLock = canvas["requestPointerLock"] || canvas["mozRequestPointerLock"] || canvas["webkitRequestPointerLock"] || canvas["msRequestPointerLock"] || (function() {});
   canvas.exitPointerLock = document["exitPointerLock"] || document["mozExitPointerLock"] || document["webkitExitPointerLock"] || document["msExitPointerLock"] || (function() {});
   canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
   document.addEventListener("pointerlockchange", pointerLockChange, false);
   document.addEventListener("mozpointerlockchange", pointerLockChange, false);
   document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
   document.addEventListener("mspointerlockchange", pointerLockChange, false);
   if (Module["elementPointerLock"]) {
    canvas.addEventListener("click", (function(ev) {
     if (!Browser.pointerLock && Module["canvas"].requestPointerLock) {
      Module["canvas"].requestPointerLock();
      ev.preventDefault();
     }
    }), false);
   }
  }
 }),
 createContext: (function(canvas, useWebGL, setInModule, webGLContextAttributes) {
  if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx;
  var ctx;
  var contextHandle;
  if (useWebGL) {
   var contextAttributes = {
    antialias: false,
    alpha: false
   };
   if (webGLContextAttributes) {
    for (var attribute in webGLContextAttributes) {
     contextAttributes[attribute] = webGLContextAttributes[attribute];
    }
   }
   contextHandle = GL.createContext(canvas, contextAttributes);
   if (contextHandle) {
    ctx = GL.getContext(contextHandle).GLctx;
   }
  } else {
   ctx = canvas.getContext("2d");
  }
  if (!ctx) return null;
  if (setInModule) {
   if (!useWebGL) assert(typeof GLctx === "undefined", "cannot set in module if GLctx is used, but we are a non-GL context that would replace it");
   Module.ctx = ctx;
   if (useWebGL) GL.makeContextCurrent(contextHandle);
   Module.useWebGL = useWebGL;
   Browser.moduleContextCreatedCallbacks.forEach((function(callback) {
    callback();
   }));
   Browser.init();
  }
  return ctx;
 }),
 destroyContext: (function(canvas, useWebGL, setInModule) {}),
 fullscreenHandlersInstalled: false,
 lockPointer: undefined,
 resizeCanvas: undefined,
 requestFullscreen: (function(lockPointer, resizeCanvas, vrDevice) {
  Browser.lockPointer = lockPointer;
  Browser.resizeCanvas = resizeCanvas;
  Browser.vrDevice = vrDevice;
  if (typeof Browser.lockPointer === "undefined") Browser.lockPointer = true;
  if (typeof Browser.resizeCanvas === "undefined") Browser.resizeCanvas = false;
  if (typeof Browser.vrDevice === "undefined") Browser.vrDevice = null;
  var canvas = Module["canvas"];
  function fullscreenChange() {
   Browser.isFullscreen = false;
   var canvasContainer = canvas.parentNode;
   if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer) {
    canvas.exitFullscreen = document["exitFullscreen"] || document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["msExitFullscreen"] || document["webkitCancelFullScreen"] || (function() {});
    canvas.exitFullscreen = canvas.exitFullscreen.bind(document);
    if (Browser.lockPointer) canvas.requestPointerLock();
    Browser.isFullscreen = true;
    if (Browser.resizeCanvas) Browser.setFullscreenCanvasSize();
   } else {
    canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
    canvasContainer.parentNode.removeChild(canvasContainer);
    if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
   }
   if (Module["onFullScreen"]) Module["onFullScreen"](Browser.isFullscreen);
   if (Module["onFullscreen"]) Module["onFullscreen"](Browser.isFullscreen);
   Browser.updateCanvasDimensions(canvas);
  }
  if (!Browser.fullscreenHandlersInstalled) {
   Browser.fullscreenHandlersInstalled = true;
   document.addEventListener("fullscreenchange", fullscreenChange, false);
   document.addEventListener("mozfullscreenchange", fullscreenChange, false);
   document.addEventListener("webkitfullscreenchange", fullscreenChange, false);
   document.addEventListener("MSFullscreenChange", fullscreenChange, false);
  }
  var canvasContainer = document.createElement("div");
  canvas.parentNode.insertBefore(canvasContainer, canvas);
  canvasContainer.appendChild(canvas);
  canvasContainer.requestFullscreen = canvasContainer["requestFullscreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullscreen"] ? (function() {
   canvasContainer["webkitRequestFullscreen"](Element["ALLOW_KEYBOARD_INPUT"]);
  }) : null) || (canvasContainer["webkitRequestFullScreen"] ? (function() {
   canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]);
  }) : null);
  if (vrDevice) {
   canvasContainer.requestFullscreen({
    vrDisplay: vrDevice
   });
  } else {
   canvasContainer.requestFullscreen();
  }
 }),
 requestFullScreen: (function(lockPointer, resizeCanvas, vrDevice) {
  Module.printErr("Browser.requestFullScreen() is deprecated. Please call Browser.requestFullscreen instead.");
  Browser.requestFullScreen = (function(lockPointer, resizeCanvas, vrDevice) {
   return Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice);
  });
  return Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice);
 }),
 nextRAF: 0,
 fakeRequestAnimationFrame: (function(func) {
  var now = Date.now();
  if (Browser.nextRAF === 0) {
   Browser.nextRAF = now + 1e3 / 60;
  } else {
   while (now + 2 >= Browser.nextRAF) {
    Browser.nextRAF += 1e3 / 60;
   }
  }
  var delay = Math.max(Browser.nextRAF - now, 0);
  setTimeout(func, delay);
 }),
 requestAnimationFrame: function requestAnimationFrame(func) {
  if (typeof window === "undefined") {
   Browser.fakeRequestAnimationFrame(func);
  } else {
   if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window["requestAnimationFrame"] || window["mozRequestAnimationFrame"] || window["webkitRequestAnimationFrame"] || window["msRequestAnimationFrame"] || window["oRequestAnimationFrame"] || Browser.fakeRequestAnimationFrame;
   }
   window.requestAnimationFrame(func);
  }
 },
 safeCallback: (function(func) {
  return (function() {
   if (!ABORT) return func.apply(null, arguments);
  });
 }),
 allowAsyncCallbacks: true,
 queuedAsyncCallbacks: [],
 pauseAsyncCallbacks: (function() {
  Browser.allowAsyncCallbacks = false;
 }),
 resumeAsyncCallbacks: (function() {
  Browser.allowAsyncCallbacks = true;
  if (Browser.queuedAsyncCallbacks.length > 0) {
   var callbacks = Browser.queuedAsyncCallbacks;
   Browser.queuedAsyncCallbacks = [];
   callbacks.forEach((function(func) {
    func();
   }));
  }
 }),
 safeRequestAnimationFrame: (function(func) {
  return Browser.requestAnimationFrame((function() {
   if (ABORT) return;
   if (Browser.allowAsyncCallbacks) {
    func();
   } else {
    Browser.queuedAsyncCallbacks.push(func);
   }
  }));
 }),
 safeSetTimeout: (function(func, timeout) {
  Module["noExitRuntime"] = true;
  return setTimeout((function() {
   if (ABORT) return;
   if (Browser.allowAsyncCallbacks) {
    func();
   } else {
    Browser.queuedAsyncCallbacks.push(func);
   }
  }), timeout);
 }),
 safeSetInterval: (function(func, timeout) {
  Module["noExitRuntime"] = true;
  return setInterval((function() {
   if (ABORT) return;
   if (Browser.allowAsyncCallbacks) {
    func();
   }
  }), timeout);
 }),
 getMimetype: (function(name) {
  return {
   "jpg": "image/jpeg",
   "jpeg": "image/jpeg",
   "png": "image/png",
   "bmp": "image/bmp",
   "ogg": "audio/ogg",
   "wav": "audio/wav",
   "mp3": "audio/mpeg"
  }[name.substr(name.lastIndexOf(".") + 1)];
 }),
 getUserMedia: (function(func) {
  if (!window.getUserMedia) {
   window.getUserMedia = navigator["getUserMedia"] || navigator["mozGetUserMedia"];
  }
  window.getUserMedia(func);
 }),
 getMovementX: (function(event) {
  return event["movementX"] || event["mozMovementX"] || event["webkitMovementX"] || 0;
 }),
 getMovementY: (function(event) {
  return event["movementY"] || event["mozMovementY"] || event["webkitMovementY"] || 0;
 }),
 getMouseWheelDelta: (function(event) {
  var delta = 0;
  switch (event.type) {
  case "DOMMouseScroll":
   delta = event.detail;
   break;
  case "mousewheel":
   delta = event.wheelDelta;
   break;
  case "wheel":
   delta = event["deltaY"];
   break;
  default:
   throw "unrecognized mouse wheel event: " + event.type;
  }
  return delta;
 }),
 mouseX: 0,
 mouseY: 0,
 mouseMovementX: 0,
 mouseMovementY: 0,
 touches: {},
 lastTouches: {},
 calculateMouseEvent: (function(event) {
  if (Browser.pointerLock) {
   if (event.type != "mousemove" && "mozMovementX" in event) {
    Browser.mouseMovementX = Browser.mouseMovementY = 0;
   } else {
    Browser.mouseMovementX = Browser.getMovementX(event);
    Browser.mouseMovementY = Browser.getMovementY(event);
   }
   if (typeof SDL != "undefined") {
    Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
    Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
   } else {
    Browser.mouseX += Browser.mouseMovementX;
    Browser.mouseY += Browser.mouseMovementY;
   }
  } else {
   var rect = Module["canvas"].getBoundingClientRect();
   var cw = Module["canvas"].width;
   var ch = Module["canvas"].height;
   var scrollX = typeof window.scrollX !== "undefined" ? window.scrollX : window.pageXOffset;
   var scrollY = typeof window.scrollY !== "undefined" ? window.scrollY : window.pageYOffset;
   assert(typeof scrollX !== "undefined" && typeof scrollY !== "undefined", "Unable to retrieve scroll position, mouse positions likely broken.");
   if (event.type === "touchstart" || event.type === "touchend" || event.type === "touchmove") {
    var touch = event.touch;
    if (touch === undefined) {
     return;
    }
    var adjustedX = touch.pageX - (scrollX + rect.left);
    var adjustedY = touch.pageY - (scrollY + rect.top);
    adjustedX = adjustedX * (cw / rect.width);
    adjustedY = adjustedY * (ch / rect.height);
    var coords = {
     x: adjustedX,
     y: adjustedY
    };
    if (event.type === "touchstart") {
     Browser.lastTouches[touch.identifier] = coords;
     Browser.touches[touch.identifier] = coords;
    } else if (event.type === "touchend" || event.type === "touchmove") {
     var last = Browser.touches[touch.identifier];
     if (!last) last = coords;
     Browser.lastTouches[touch.identifier] = last;
     Browser.touches[touch.identifier] = coords;
    }
    return;
   }
   var x = event.pageX - (scrollX + rect.left);
   var y = event.pageY - (scrollY + rect.top);
   x = x * (cw / rect.width);
   y = y * (ch / rect.height);
   Browser.mouseMovementX = x - Browser.mouseX;
   Browser.mouseMovementY = y - Browser.mouseY;
   Browser.mouseX = x;
   Browser.mouseY = y;
  }
 }),
 asyncLoad: (function(url, onload, onerror, noRunDep) {
  var dep = !noRunDep ? getUniqueRunDependency("al " + url) : "";
  Module["readAsync"](url, (function(arrayBuffer) {
   assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
   onload(new Uint8Array(arrayBuffer));
   if (dep) removeRunDependency(dep);
  }), (function(event) {
   if (onerror) {
    onerror();
   } else {
    throw 'Loading data file "' + url + '" failed.';
   }
  }));
  if (dep) addRunDependency(dep);
 }),
 resizeListeners: [],
 updateResizeListeners: (function() {
  var canvas = Module["canvas"];
  Browser.resizeListeners.forEach((function(listener) {
   listener(canvas.width, canvas.height);
  }));
 }),
 setCanvasSize: (function(width, height, noUpdates) {
  var canvas = Module["canvas"];
  Browser.updateCanvasDimensions(canvas, width, height);
  if (!noUpdates) Browser.updateResizeListeners();
 }),
 windowedWidth: 0,
 windowedHeight: 0,
 setFullscreenCanvasSize: (function() {
  if (typeof SDL != "undefined") {
   var flags = HEAPU32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2];
   flags = flags | 8388608;
   HEAP32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2] = flags;
  }
  Browser.updateResizeListeners();
 }),
 setWindowedCanvasSize: (function() {
  if (typeof SDL != "undefined") {
   var flags = HEAPU32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2];
   flags = flags & ~8388608;
   HEAP32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2] = flags;
  }
  Browser.updateResizeListeners();
 }),
 updateCanvasDimensions: (function(canvas, wNative, hNative) {
  if (wNative && hNative) {
   canvas.widthNative = wNative;
   canvas.heightNative = hNative;
  } else {
   wNative = canvas.widthNative;
   hNative = canvas.heightNative;
  }
  var w = wNative;
  var h = hNative;
  if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
   if (w / h < Module["forcedAspectRatio"]) {
    w = Math.round(h * Module["forcedAspectRatio"]);
   } else {
    h = Math.round(w / Module["forcedAspectRatio"]);
   }
  }
  if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas.parentNode && typeof screen != "undefined") {
   var factor = Math.min(screen.width / w, screen.height / h);
   w = Math.round(w * factor);
   h = Math.round(h * factor);
  }
  if (Browser.resizeCanvas) {
   if (canvas.width != w) canvas.width = w;
   if (canvas.height != h) canvas.height = h;
   if (typeof canvas.style != "undefined") {
    canvas.style.removeProperty("width");
    canvas.style.removeProperty("height");
   }
  } else {
   if (canvas.width != wNative) canvas.width = wNative;
   if (canvas.height != hNative) canvas.height = hNative;
   if (typeof canvas.style != "undefined") {
    if (w != wNative || h != hNative) {
     canvas.style.setProperty("width", w + "px", "important");
     canvas.style.setProperty("height", h + "px", "important");
    } else {
     canvas.style.removeProperty("width");
     canvas.style.removeProperty("height");
    }
   }
  }
 }),
 wgetRequests: {},
 nextWgetRequestHandle: 0,
 getNextWgetRequestHandle: (function() {
  var handle = Browser.nextWgetRequestHandle;
  Browser.nextWgetRequestHandle++;
  return handle;
 })
};
var EmterpreterAsync = {
 initted: false,
 state: 0,
 saveStack: "",
 yieldCallbacks: [],
 postAsync: null,
 asyncFinalizers: [],
 ensureInit: (function() {
  if (this.initted) return;
  this.initted = true;
  abortDecorators.push((function(output, what) {
   if (EmterpreterAsync.state !== 0) {
    return output + "\nThis error happened during an emterpreter-async save or load of the stack. Was there non-emterpreted code on the stack during save (which is unallowed)? You may want to adjust EMTERPRETIFY_BLACKLIST, EMTERPRETIFY_WHITELIST.\nThis is what the stack looked like when we tried to save it: " + [ EmterpreterAsync.state, EmterpreterAsync.saveStack ];
   }
   return output;
  }));
 }),
 setState: (function(s) {
  this.ensureInit();
  this.state = s;
  Module["asm"].setAsyncState(s);
 }),
 handle: (function(doAsyncOp, yieldDuring) {
  Module["noExitRuntime"] = true;
  if (EmterpreterAsync.state === 0) {
   var stack = new Int32Array(HEAP32.subarray(EMTSTACKTOP >> 2, Module["asm"].emtStackSave() >> 2));
   var stacktop = Module["asm"].stackSave();
   var resumedCallbacksForYield = false;
   function resumeCallbacksForYield() {
    if (resumedCallbacksForYield) return;
    resumedCallbacksForYield = true;
    EmterpreterAsync.yieldCallbacks.forEach((function(func) {
     func();
    }));
    Browser.resumeAsyncCallbacks();
   }
   var callingDoAsyncOp = 1;
   doAsyncOp(function resume(post) {
    if (callingDoAsyncOp) {
     assert(callingDoAsyncOp === 1);
     callingDoAsyncOp++;
     setTimeout((function() {
      resume(post);
     }), 0);
     return;
    }
    assert(EmterpreterAsync.state === 1 || EmterpreterAsync.state === 3);
    EmterpreterAsync.setState(3);
    if (yieldDuring) {
     resumeCallbacksForYield();
    }
    HEAP32.set(stack, EMTSTACKTOP >> 2);
    assert(stacktop === Module["asm"].stackSave());
    EmterpreterAsync.setState(2);
    if (Browser.mainLoop.func) {
     Browser.mainLoop.resume();
    }
    assert(!EmterpreterAsync.postAsync);
    EmterpreterAsync.postAsync = post || null;
    Module["asm"].emterpret(stack[0]);
    if (!yieldDuring && EmterpreterAsync.state === 0) {
     Browser.resumeAsyncCallbacks();
    }
    if (EmterpreterAsync.state === 0) {
     EmterpreterAsync.asyncFinalizers.forEach((function(func) {
      func();
     }));
     EmterpreterAsync.asyncFinalizers.length = 0;
    }
   });
   callingDoAsyncOp = 0;
   EmterpreterAsync.setState(1);
   EmterpreterAsync.saveStack = (new Error).stack;
   if (Browser.mainLoop.func) {
    Browser.mainLoop.pause();
   }
   if (yieldDuring) {
    setTimeout((function() {
     resumeCallbacksForYield();
    }), 0);
   } else {
    Browser.pauseAsyncCallbacks();
   }
  } else {
   assert(EmterpreterAsync.state === 2);
   EmterpreterAsync.setState(0);
   if (EmterpreterAsync.postAsync) {
    var ret = EmterpreterAsync.postAsync();
    EmterpreterAsync.postAsync = null;
    return ret;
   }
  }
 })
};
function _emscripten_sleep(ms) {
 EmterpreterAsync.handle((function(resume) {
  setTimeout((function() {
   if (ABORT) return;
   resume();
  }), ms);
 }));
}
function ___lock() {}
function ___unlock() {}
var SYSCALLS = {
 varargs: 0,
 get: (function(varargs) {
  SYSCALLS.varargs += 4;
  var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
  return ret;
 }),
 getStr: (function() {
  var ret = Pointer_stringify(SYSCALLS.get());
  return ret;
 }),
 get64: (function() {
  var low = SYSCALLS.get(), high = SYSCALLS.get();
  if (low >= 0) assert(high === 0); else assert(high === -1);
  return low;
 }),
 getZero: (function() {
  assert(SYSCALLS.get() === 0);
 })
};
function ___syscall6(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD();
  FS.close(stream);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
var cttz_i8 = allocate([ 8, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 7, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0 ], "i8", ALLOC_STATIC);
function ___setErrNo(value) {
 if (Module["___errno_location"]) HEAP32[Module["___errno_location"]() >> 2] = value; else Module.printErr("failed to set errno from JS");
 return value;
}
function _emscripten_memcpy_big(dest, src, num) {
 HEAPU8.set(HEAPU8.subarray(src, src + num), dest);
 return dest;
}
function ___syscall140(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), offset_high = SYSCALLS.get(), offset_low = SYSCALLS.get(), result = SYSCALLS.get(), whence = SYSCALLS.get();
  var offset = offset_low;
  FS.llseek(stream, offset, whence);
  HEAP32[result >> 2] = stream.position;
  if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
function ___syscall146(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.get(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
  var ret = 0;
  if (!___syscall146.buffer) {
   ___syscall146.buffers = [ null, [], [] ];
   ___syscall146.printChar = (function(stream, curr) {
    var buffer = ___syscall146.buffers[stream];
    assert(buffer);
    if (curr === 0 || curr === 10) {
     (stream === 1 ? Module["print"] : Module["printErr"])(UTF8ArrayToString(buffer, 0));
     buffer.length = 0;
    } else {
     buffer.push(curr);
    }
   });
  }
  for (var i = 0; i < iovcnt; i++) {
   var ptr = HEAP32[iov + i * 8 >> 2];
   var len = HEAP32[iov + (i * 8 + 4) >> 2];
   for (var j = 0; j < len; j++) {
    ___syscall146.printChar(stream, HEAPU8[ptr + j]);
   }
   ret += len;
  }
  return ret;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
function ___syscall54(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas, vrDevice) {
 Module.printErr("Module.requestFullScreen is deprecated. Please call Module.requestFullscreen instead.");
 Module["requestFullScreen"] = Module["requestFullscreen"];
 Browser.requestFullScreen(lockPointer, resizeCanvas, vrDevice);
};
Module["requestFullscreen"] = function Module_requestFullscreen(lockPointer, resizeCanvas, vrDevice) {
 Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice);
};
Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) {
 Browser.requestAnimationFrame(func);
};
Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) {
 Browser.setCanvasSize(width, height, noUpdates);
};
Module["pauseMainLoop"] = function Module_pauseMainLoop() {
 Browser.mainLoop.pause();
};
Module["resumeMainLoop"] = function Module_resumeMainLoop() {
 Browser.mainLoop.resume();
};
Module["getUserMedia"] = function Module_getUserMedia() {
 Browser.getUserMedia();
};
Module["createContext"] = function Module_createContext(canvas, useWebGL, setInModule, webGLContextAttributes) {
 return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes);
};
if (ENVIRONMENT_IS_NODE) {
 _emscripten_get_now = function _emscripten_get_now_actual() {
  var t = process["hrtime"]();
  return t[0] * 1e3 + t[1] / 1e6;
 };
} else if (typeof dateNow !== "undefined") {
 _emscripten_get_now = dateNow;
} else if (typeof self === "object" && self["performance"] && typeof self["performance"]["now"] === "function") {
 _emscripten_get_now = (function() {
  return self["performance"]["now"]();
 });
} else if (typeof performance === "object" && typeof performance["now"] === "function") {
 _emscripten_get_now = (function() {
  return performance["now"]();
 });
} else {
 _emscripten_get_now = Date.now;
}
__ATEXIT__.push((function() {
 var fflush = Module["_fflush"];
 if (fflush) fflush(0);
 var printChar = ___syscall146.printChar;
 if (!printChar) return;
 var buffers = ___syscall146.buffers;
 if (buffers[1].length) printChar(1, 10);
 if (buffers[2].length) printChar(2, 10);
}));
DYNAMICTOP_PTR = allocate(1, "i32", ALLOC_STATIC);
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
STACK_MAX = STACK_BASE + TOTAL_STACK;
DYNAMIC_BASE = Runtime.alignMemory(STACK_MAX);
HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
staticSealed = true;
assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");
function nullFunc_ii(x) {
 Module["printErr"]("Invalid function pointer called with signature 'ii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
 Module["printErr"]("Build with ASSERTIONS=2 for more info.");
 abort(x);
}
function nullFunc_iiii(x) {
 Module["printErr"]("Invalid function pointer called with signature 'iiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
 Module["printErr"]("Build with ASSERTIONS=2 for more info.");
 abort(x);
}
function invoke_ii(index, a1) {
 try {
  return Module["dynCall_ii"](index, a1);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_iiii(index, a1, a2, a3) {
 try {
  return Module["dynCall_iiii"](index, a1, a2, a3);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
Module.asmGlobalArg = {
 "Math": Math,
 "Int8Array": Int8Array,
 "Int16Array": Int16Array,
 "Int32Array": Int32Array,
 "Uint8Array": Uint8Array,
 "Uint16Array": Uint16Array,
 "Uint32Array": Uint32Array,
 "Float32Array": Float32Array,
 "Float64Array": Float64Array,
 "NaN": NaN,
 "Infinity": Infinity
};
Module.asmLibraryArg = {
 "abort": abort,
 "assert": assert,
 "enlargeMemory": enlargeMemory,
 "getTotalMemory": getTotalMemory,
 "abortOnCannotGrowMemory": abortOnCannotGrowMemory,
 "abortStackOverflow": abortStackOverflow,
 "nullFunc_ii": nullFunc_ii,
 "nullFunc_iiii": nullFunc_iiii,
 "invoke_ii": invoke_ii,
 "invoke_iiii": invoke_iiii,
 "___syscall146": ___syscall146,
 "_emscripten_sleep": _emscripten_sleep,
 "_emscripten_asm_const_i": _emscripten_asm_const_i,
 "_emscripten_asm_const_iiii": _emscripten_asm_const_iiii,
 "___lock": ___lock,
 "___syscall6": ___syscall6,
 "_emscripten_set_main_loop_timing": _emscripten_set_main_loop_timing,
 "___syscall140": ___syscall140,
 "_emscripten_asm_const_iii": _emscripten_asm_const_iii,
 "_emscripten_memcpy_big": _emscripten_memcpy_big,
 "___syscall54": ___syscall54,
 "___unlock": ___unlock,
 "_emscripten_set_main_loop": _emscripten_set_main_loop,
 "_emscripten_get_now": _emscripten_get_now,
 "___setErrNo": ___setErrNo,
 "DYNAMICTOP_PTR": DYNAMICTOP_PTR,
 "tempDoublePtr": tempDoublePtr,
 "ABORT": ABORT,
 "STACKTOP": STACKTOP,
 "STACK_MAX": STACK_MAX,
 "cttz_i8": cttz_i8
};
Module.asmLibraryArg["EMTSTACKTOP"] = EMTSTACKTOP;
Module.asmLibraryArg["EMT_STACK_MAX"] = EMT_STACK_MAX;
Module.asmLibraryArg["eb"] = eb;
// EMSCRIPTEN_START_ASM

var asm = (function(global,env,buffer) {

'almost asm';


  var HEAP8 = new global.Int8Array(buffer);
  var HEAP16 = new global.Int16Array(buffer);
  var HEAP32 = new global.Int32Array(buffer);
  var HEAPU8 = new global.Uint8Array(buffer);
  var HEAPU16 = new global.Uint16Array(buffer);
  var HEAPU32 = new global.Uint32Array(buffer);
  var HEAPF32 = new global.Float32Array(buffer);
  var HEAPF64 = new global.Float64Array(buffer);

  var DYNAMICTOP_PTR=env.DYNAMICTOP_PTR|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;
  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var cttz_i8=env.cttz_i8|0;

  var __THREW__ = 0;
  var threwValue = 0;
  var setjmpId = 0;
  var undef = 0;
  var nan = global.NaN, inf = global.Infinity;
  var tempInt = 0, tempBigInt = 0, tempBigIntS = 0, tempValue = 0, tempDouble = 0.0;
  var tempRet0 = 0;

  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var Math_min=global.Math.min;
  var Math_max=global.Math.max;
  var Math_clz32=global.Math.clz32;
  var abort=env.abort;
  var assert=env.assert;
  var enlargeMemory=env.enlargeMemory;
  var getTotalMemory=env.getTotalMemory;
  var abortOnCannotGrowMemory=env.abortOnCannotGrowMemory;
  var abortStackOverflow=env.abortStackOverflow;
  var nullFunc_ii=env.nullFunc_ii;
  var nullFunc_iiii=env.nullFunc_iiii;
  var invoke_ii=env.invoke_ii;
  var invoke_iiii=env.invoke_iiii;
  var ___syscall146=env.___syscall146;
  var _emscripten_sleep=env._emscripten_sleep;
  var _emscripten_asm_const_i=env._emscripten_asm_const_i;
  var _emscripten_asm_const_iiii=env._emscripten_asm_const_iiii;
  var ___lock=env.___lock;
  var ___syscall6=env.___syscall6;
  var _emscripten_set_main_loop_timing=env._emscripten_set_main_loop_timing;
  var ___syscall140=env.___syscall140;
  var _emscripten_asm_const_iii=env._emscripten_asm_const_iii;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var ___syscall54=env.___syscall54;
  var ___unlock=env.___unlock;
  var _emscripten_set_main_loop=env._emscripten_set_main_loop;
  var _emscripten_get_now=env._emscripten_get_now;
  var ___setErrNo=env.___setErrNo;
  var tempFloat = 0.0;
  var asyncState = 0;

var EMTSTACKTOP = env.EMTSTACKTOP|0;
var EMT_STACK_MAX = env.EMT_STACK_MAX|0;
var eb = env.eb|0;
// EMSCRIPTEN_START_FUNCS

function _malloc($0) {
 $0 = $0 | 0;
 var $$$0172$i = 0, $$$0173$i = 0, $$$4236$i = 0, $$$4329$i = 0, $$$i = 0, $$0 = 0, $$0$i = 0, $$0$i$i = 0, $$0$i$i$i = 0, $$0$i20$i = 0, $$01$i$i = 0, $$0172$lcssa$i = 0, $$01726$i = 0, $$0173$lcssa$i = 0, $$01735$i = 0, $$0192 = 0, $$0194 = 0, $$0201$i$i = 0, $$0202$i$i = 0, $$0206$i$i = 0, $$0207$i$i = 0, $$024370$i = 0, $$0260$i$i = 0, $$0261$i$i = 0, $$0262$i$i = 0, $$0268$i$i = 0, $$0269$i$i = 0, $$0320$i = 0, $$0322$i = 0, $$0323$i = 0, $$0325$i = 0, $$0331$i = 0, $$0336$i = 0, $$0337$$i = 0, $$0337$i = 0, $$0339$i = 0, $$0340$i = 0, $$0345$i = 0, $$1176$i = 0, $$1178$i = 0, $$124469$i = 0, $$1264$i$i = 0, $$1266$i$i = 0, $$1321$i = 0, $$1326$i = 0, $$1341$i = 0, $$1347$i = 0, $$1351$i = 0, $$2234243136$i = 0, $$2247$ph$i = 0, $$2253$ph$i = 0, $$2333$i = 0, $$3$i = 0, $$3$i$i = 0, $$3$i200 = 0, $$3328$i = 0, $$3349$i = 0, $$4$lcssa$i = 0, $$4$ph$i = 0, $$411$i = 0, $$4236$i = 0, $$4329$lcssa$i = 0, $$432910$i = 0, $$4335$$4$i = 0, $$4335$ph$i = 0, $$43359$i = 0, $$723947$i = 0, $$748$i = 0, $$pre = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i17$i = 0, $$pre$i195 = 0, $$pre$i210 = 0, $$pre$phi$i$iZ2D = 0, $$pre$phi$i18$iZ2D = 0, $$pre$phi$i211Z2D = 0, $$pre$phi$iZ2D = 0, $$pre$phiZ2D = 0, $$sink1$i = 0, $$sink1$i$i = 0, $$sink14$i = 0, $$sink2$i = 0, $$sink2$i204 = 0, $$sink3$i = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0, $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0, $444 = 0, $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0, $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0, $480 = 0, $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0, $499 = 0, $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0, $516 = 0, $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0, $534 = 0, $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0, $552 = 0, $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0, $570 = 0, $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0, $589 = 0, $59 = 0, $590 = 0, $591 = 0, $592 = 0, $593 = 0, $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0, $606 = 0, $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0, $624 = 0, $625 = 0, $626 = 0, $627 = 0, $628 = 0, $629 = 0, $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0, $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0, $642 = 0, $643 = 0, $644 = 0, $645 = 0, $646 = 0, $647 = 0, $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0, $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0, $660 = 0, $661 = 0, $662 = 0, $663 = 0, $664 = 0, $665 = 0, $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0, $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0, $679 = 0, $68 = 0, $680 = 0, $681 = 0, $682 = 0, $683 = 0, $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0, $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0, $697 = 0, $698 = 0, $699 = 0, $7 = 0, $70 = 0, $700 = 0, $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0, $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0, $714 = 0, $715 = 0, $716 = 0, $717 = 0, $718 = 0, $719 = 0, $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0, $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0, $732 = 0, $733 = 0, $734 = 0, $735 = 0, $736 = 0, $737 = 0, $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0, $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0, $750 = 0, $751 = 0, $752 = 0, $753 = 0, $754 = 0, $755 = 0, $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0, $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0, $769 = 0, $77 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0, $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0, $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0, $787 = 0, $788 = 0, $789 = 0, $79 = 0, $790 = 0, $791 = 0, $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0, $797 = 0, $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $803 = 0, $804 = 0, $805 = 0, $806 = 0, $807 = 0, $808 = 0, $809 = 0, $81 = 0, $810 = 0, $811 = 0, $812 = 0, $813 = 0, $814 = 0, $815 = 0, $816 = 0, $817 = 0, $818 = 0, $819 = 0, $82 = 0, $820 = 0, $821 = 0, $822 = 0, $823 = 0, $824 = 0, $825 = 0, $826 = 0, $827 = 0, $828 = 0, $829 = 0, $83 = 0, $830 = 0, $831 = 0, $832 = 0, $833 = 0, $834 = 0, $835 = 0, $836 = 0, $837 = 0, $838 = 0, $839 = 0, $84 = 0, $840 = 0, $841 = 0, $842 = 0, $843 = 0, $844 = 0, $845 = 0, $846 = 0, $847 = 0, $848 = 0, $849 = 0, $85 = 0, $850 = 0, $851 = 0, $852 = 0, $853 = 0, $854 = 0, $855 = 0, $856 = 0, $857 = 0, $858 = 0, $859 = 0, $86 = 0, $860 = 0, $861 = 0, $862 = 0, $863 = 0, $864 = 0, $865 = 0, $866 = 0, $867 = 0, $868 = 0, $869 = 0, $87 = 0, $870 = 0, $871 = 0, $872 = 0, $873 = 0, $874 = 0, $875 = 0, $876 = 0, $877 = 0, $878 = 0, $879 = 0, $88 = 0, $880 = 0, $881 = 0, $882 = 0, $883 = 0, $884 = 0, $885 = 0, $886 = 0, $887 = 0, $888 = 0, $889 = 0, $89 = 0, $890 = 0, $891 = 0, $892 = 0, $893 = 0, $894 = 0, $895 = 0, $896 = 0, $897 = 0, $898 = 0, $899 = 0, $9 = 0, $90 = 0, $900 = 0, $901 = 0, $902 = 0, $903 = 0, $904 = 0, $905 = 0, $906 = 0, $907 = 0, $908 = 0, $909 = 0, $91 = 0, $910 = 0, $911 = 0, $912 = 0, $913 = 0, $914 = 0, $915 = 0, $916 = 0, $917 = 0, $918 = 0, $919 = 0, $92 = 0, $920 = 0, $921 = 0, $922 = 0, $923 = 0, $924 = 0, $925 = 0, $926 = 0, $927 = 0, $928 = 0, $929 = 0, $93 = 0, $930 = 0, $931 = 0, $932 = 0, $933 = 0, $934 = 0, $935 = 0, $936 = 0, $937 = 0, $938 = 0, $939 = 0, $94 = 0, $940 = 0, $941 = 0, $942 = 0, $943 = 0, $944 = 0, $945 = 0, $946 = 0, $947 = 0, $948 = 0, $949 = 0, $95 = 0, $950 = 0, $951 = 0, $952 = 0, $953 = 0, $954 = 0, $955 = 0, $956 = 0, $957 = 0, $958 = 0, $959 = 0, $96 = 0, $960 = 0, $961 = 0, $962 = 0, $963 = 0, $964 = 0, $965 = 0, $966 = 0, $967 = 0, $968 = 0, $969 = 0, $97 = 0, $970 = 0, $98 = 0, $99 = 0, $cond$i = 0, $cond$i$i = 0, $cond$i208 = 0, $exitcond$i$i = 0, $not$$i = 0, $not$$i$i = 0, $not$$i197 = 0, $not$$i209 = 0, $not$1$i = 0, $not$1$i203 = 0, $not$3$i = 0, $not$5$i = 0, $or$cond$i = 0, $or$cond$i201 = 0, $or$cond1$i = 0, $or$cond10$i = 0, $or$cond11$i = 0, $or$cond11$not$i = 0, $or$cond12$i = 0, $or$cond2$i = 0, $or$cond2$i199 = 0, $or$cond49$i = 0, $or$cond5$i = 0, $or$cond50$i = 0, $or$cond7$i = 0, label = 0, sp = 0;
 label = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 asyncState ? abort(-12) | 0 : 0;
 if ((STACKTOP | 0) >= (STACK_MAX | 0)) abortStackOverflow(16 | 0), asyncState ? abort(-12) | 0 : 0;
 $1 = sp;
 $2 = $0 >>> 0 < 245;
 do {
  if ($2) {
   $3 = $0 >>> 0 < 11;
   $4 = $0 + 11 | 0;
   $5 = $4 & -8;
   $6 = $3 ? 16 : $5;
   $7 = $6 >>> 3;
   $8 = HEAP32[1517] | 0;
   $9 = $8 >>> $7;
   $10 = $9 & 3;
   $11 = ($10 | 0) == 0;
   if (!$11) {
    $12 = $9 & 1;
    $13 = $12 ^ 1;
    $14 = $13 + $7 | 0;
    $15 = $14 << 1;
    $16 = 6108 + ($15 << 2) | 0;
    $17 = $16 + 8 | 0;
    $18 = HEAP32[$17 >> 2] | 0;
    $19 = $18 + 8 | 0;
    $20 = HEAP32[$19 >> 2] | 0;
    $21 = ($16 | 0) == ($20 | 0);
    if ($21) {
     $22 = 1 << $14;
     $23 = $22 ^ -1;
     $24 = $8 & $23;
     HEAP32[1517] = $24;
    } else {
     $25 = $20 + 12 | 0;
     HEAP32[$25 >> 2] = $16;
     HEAP32[$17 >> 2] = $20;
    }
    $26 = $14 << 3;
    $27 = $26 | 3;
    $28 = $18 + 4 | 0;
    HEAP32[$28 >> 2] = $27;
    $29 = $18 + $26 | 0;
    $30 = $29 + 4 | 0;
    $31 = HEAP32[$30 >> 2] | 0;
    $32 = $31 | 1;
    HEAP32[$30 >> 2] = $32;
    $$0 = $19;
    STACKTOP = sp;
    return $$0 | 0;
   }
   $33 = HEAP32[6076 >> 2] | 0;
   $34 = $6 >>> 0 > $33 >>> 0;
   if ($34) {
    $35 = ($9 | 0) == 0;
    if (!$35) {
     $36 = $9 << $7;
     $37 = 2 << $7;
     $38 = 0 - $37 | 0;
     $39 = $37 | $38;
     $40 = $36 & $39;
     $41 = 0 - $40 | 0;
     $42 = $40 & $41;
     $43 = $42 + -1 | 0;
     $44 = $43 >>> 12;
     $45 = $44 & 16;
     $46 = $43 >>> $45;
     $47 = $46 >>> 5;
     $48 = $47 & 8;
     $49 = $48 | $45;
     $50 = $46 >>> $48;
     $51 = $50 >>> 2;
     $52 = $51 & 4;
     $53 = $49 | $52;
     $54 = $50 >>> $52;
     $55 = $54 >>> 1;
     $56 = $55 & 2;
     $57 = $53 | $56;
     $58 = $54 >>> $56;
     $59 = $58 >>> 1;
     $60 = $59 & 1;
     $61 = $57 | $60;
     $62 = $58 >>> $60;
     $63 = $61 + $62 | 0;
     $64 = $63 << 1;
     $65 = 6108 + ($64 << 2) | 0;
     $66 = $65 + 8 | 0;
     $67 = HEAP32[$66 >> 2] | 0;
     $68 = $67 + 8 | 0;
     $69 = HEAP32[$68 >> 2] | 0;
     $70 = ($65 | 0) == ($69 | 0);
     if ($70) {
      $71 = 1 << $63;
      $72 = $71 ^ -1;
      $73 = $8 & $72;
      HEAP32[1517] = $73;
      $90 = $73;
     } else {
      $74 = $69 + 12 | 0;
      HEAP32[$74 >> 2] = $65;
      HEAP32[$66 >> 2] = $69;
      $90 = $8;
     }
     $75 = $63 << 3;
     $76 = $75 - $6 | 0;
     $77 = $6 | 3;
     $78 = $67 + 4 | 0;
     HEAP32[$78 >> 2] = $77;
     $79 = $67 + $6 | 0;
     $80 = $76 | 1;
     $81 = $79 + 4 | 0;
     HEAP32[$81 >> 2] = $80;
     $82 = $79 + $76 | 0;
     HEAP32[$82 >> 2] = $76;
     $83 = ($33 | 0) == 0;
     if (!$83) {
      $84 = HEAP32[6088 >> 2] | 0;
      $85 = $33 >>> 3;
      $86 = $85 << 1;
      $87 = 6108 + ($86 << 2) | 0;
      $88 = 1 << $85;
      $89 = $90 & $88;
      $91 = ($89 | 0) == 0;
      if ($91) {
       $92 = $90 | $88;
       HEAP32[1517] = $92;
       $$pre = $87 + 8 | 0;
       $$0194 = $87;
       $$pre$phiZ2D = $$pre;
      } else {
       $93 = $87 + 8 | 0;
       $94 = HEAP32[$93 >> 2] | 0;
       $$0194 = $94;
       $$pre$phiZ2D = $93;
      }
      HEAP32[$$pre$phiZ2D >> 2] = $84;
      $95 = $$0194 + 12 | 0;
      HEAP32[$95 >> 2] = $84;
      $96 = $84 + 8 | 0;
      HEAP32[$96 >> 2] = $$0194;
      $97 = $84 + 12 | 0;
      HEAP32[$97 >> 2] = $87;
     }
     HEAP32[6076 >> 2] = $76;
     HEAP32[6088 >> 2] = $79;
     $$0 = $68;
     STACKTOP = sp;
     return $$0 | 0;
    }
    $98 = HEAP32[6072 >> 2] | 0;
    $99 = ($98 | 0) == 0;
    if ($99) {
     $$0192 = $6;
    } else {
     $100 = 0 - $98 | 0;
     $101 = $98 & $100;
     $102 = $101 + -1 | 0;
     $103 = $102 >>> 12;
     $104 = $103 & 16;
     $105 = $102 >>> $104;
     $106 = $105 >>> 5;
     $107 = $106 & 8;
     $108 = $107 | $104;
     $109 = $105 >>> $107;
     $110 = $109 >>> 2;
     $111 = $110 & 4;
     $112 = $108 | $111;
     $113 = $109 >>> $111;
     $114 = $113 >>> 1;
     $115 = $114 & 2;
     $116 = $112 | $115;
     $117 = $113 >>> $115;
     $118 = $117 >>> 1;
     $119 = $118 & 1;
     $120 = $116 | $119;
     $121 = $117 >>> $119;
     $122 = $120 + $121 | 0;
     $123 = 6372 + ($122 << 2) | 0;
     $124 = HEAP32[$123 >> 2] | 0;
     $125 = $124 + 4 | 0;
     $126 = HEAP32[$125 >> 2] | 0;
     $127 = $126 & -8;
     $128 = $127 - $6 | 0;
     $129 = $124 + 16 | 0;
     $130 = HEAP32[$129 >> 2] | 0;
     $not$3$i = ($130 | 0) == (0 | 0);
     $$sink14$i = $not$3$i & 1;
     $131 = ($124 + 16 | 0) + ($$sink14$i << 2) | 0;
     $132 = HEAP32[$131 >> 2] | 0;
     $133 = ($132 | 0) == (0 | 0);
     if ($133) {
      $$0172$lcssa$i = $124;
      $$0173$lcssa$i = $128;
     } else {
      $$01726$i = $124;
      $$01735$i = $128;
      $135 = $132;
      while (1) {
       $134 = $135 + 4 | 0;
       $136 = HEAP32[$134 >> 2] | 0;
       $137 = $136 & -8;
       $138 = $137 - $6 | 0;
       $139 = $138 >>> 0 < $$01735$i >>> 0;
       $$$0173$i = $139 ? $138 : $$01735$i;
       $$$0172$i = $139 ? $135 : $$01726$i;
       $140 = $135 + 16 | 0;
       $141 = HEAP32[$140 >> 2] | 0;
       $not$$i = ($141 | 0) == (0 | 0);
       $$sink1$i = $not$$i & 1;
       $142 = ($135 + 16 | 0) + ($$sink1$i << 2) | 0;
       $143 = HEAP32[$142 >> 2] | 0;
       $144 = ($143 | 0) == (0 | 0);
       if ($144) {
        $$0172$lcssa$i = $$$0172$i;
        $$0173$lcssa$i = $$$0173$i;
        break;
       } else {
        $$01726$i = $$$0172$i;
        $$01735$i = $$$0173$i;
        $135 = $143;
       }
      }
     }
     $145 = $$0172$lcssa$i + $6 | 0;
     $146 = $$0172$lcssa$i >>> 0 < $145 >>> 0;
     if ($146) {
      $147 = $$0172$lcssa$i + 24 | 0;
      $148 = HEAP32[$147 >> 2] | 0;
      $149 = $$0172$lcssa$i + 12 | 0;
      $150 = HEAP32[$149 >> 2] | 0;
      $151 = ($150 | 0) == ($$0172$lcssa$i | 0);
      do {
       if ($151) {
        $156 = $$0172$lcssa$i + 20 | 0;
        $157 = HEAP32[$156 >> 2] | 0;
        $158 = ($157 | 0) == (0 | 0);
        if ($158) {
         $159 = $$0172$lcssa$i + 16 | 0;
         $160 = HEAP32[$159 >> 2] | 0;
         $161 = ($160 | 0) == (0 | 0);
         if ($161) {
          $$3$i = 0;
          break;
         } else {
          $$1176$i = $160;
          $$1178$i = $159;
         }
        } else {
         $$1176$i = $157;
         $$1178$i = $156;
        }
        while (1) {
         $162 = $$1176$i + 20 | 0;
         $163 = HEAP32[$162 >> 2] | 0;
         $164 = ($163 | 0) == (0 | 0);
         if (!$164) {
          $$1176$i = $163;
          $$1178$i = $162;
          continue;
         }
         $165 = $$1176$i + 16 | 0;
         $166 = HEAP32[$165 >> 2] | 0;
         $167 = ($166 | 0) == (0 | 0);
         if ($167) {
          break;
         } else {
          $$1176$i = $166;
          $$1178$i = $165;
         }
        }
        HEAP32[$$1178$i >> 2] = 0;
        $$3$i = $$1176$i;
       } else {
        $152 = $$0172$lcssa$i + 8 | 0;
        $153 = HEAP32[$152 >> 2] | 0;
        $154 = $153 + 12 | 0;
        HEAP32[$154 >> 2] = $150;
        $155 = $150 + 8 | 0;
        HEAP32[$155 >> 2] = $153;
        $$3$i = $150;
       }
      } while (0);
      $168 = ($148 | 0) == (0 | 0);
      do {
       if (!$168) {
        $169 = $$0172$lcssa$i + 28 | 0;
        $170 = HEAP32[$169 >> 2] | 0;
        $171 = 6372 + ($170 << 2) | 0;
        $172 = HEAP32[$171 >> 2] | 0;
        $173 = ($$0172$lcssa$i | 0) == ($172 | 0);
        if ($173) {
         HEAP32[$171 >> 2] = $$3$i;
         $cond$i = ($$3$i | 0) == (0 | 0);
         if ($cond$i) {
          $174 = 1 << $170;
          $175 = $174 ^ -1;
          $176 = $98 & $175;
          HEAP32[6072 >> 2] = $176;
          break;
         }
        } else {
         $177 = $148 + 16 | 0;
         $178 = HEAP32[$177 >> 2] | 0;
         $not$1$i = ($178 | 0) != ($$0172$lcssa$i | 0);
         $$sink2$i = $not$1$i & 1;
         $179 = ($148 + 16 | 0) + ($$sink2$i << 2) | 0;
         HEAP32[$179 >> 2] = $$3$i;
         $180 = ($$3$i | 0) == (0 | 0);
         if ($180) {
          break;
         }
        }
        $181 = $$3$i + 24 | 0;
        HEAP32[$181 >> 2] = $148;
        $182 = $$0172$lcssa$i + 16 | 0;
        $183 = HEAP32[$182 >> 2] | 0;
        $184 = ($183 | 0) == (0 | 0);
        if (!$184) {
         $185 = $$3$i + 16 | 0;
         HEAP32[$185 >> 2] = $183;
         $186 = $183 + 24 | 0;
         HEAP32[$186 >> 2] = $$3$i;
        }
        $187 = $$0172$lcssa$i + 20 | 0;
        $188 = HEAP32[$187 >> 2] | 0;
        $189 = ($188 | 0) == (0 | 0);
        if (!$189) {
         $190 = $$3$i + 20 | 0;
         HEAP32[$190 >> 2] = $188;
         $191 = $188 + 24 | 0;
         HEAP32[$191 >> 2] = $$3$i;
        }
       }
      } while (0);
      $192 = $$0173$lcssa$i >>> 0 < 16;
      if ($192) {
       $193 = $$0173$lcssa$i + $6 | 0;
       $194 = $193 | 3;
       $195 = $$0172$lcssa$i + 4 | 0;
       HEAP32[$195 >> 2] = $194;
       $196 = $$0172$lcssa$i + $193 | 0;
       $197 = $196 + 4 | 0;
       $198 = HEAP32[$197 >> 2] | 0;
       $199 = $198 | 1;
       HEAP32[$197 >> 2] = $199;
      } else {
       $200 = $6 | 3;
       $201 = $$0172$lcssa$i + 4 | 0;
       HEAP32[$201 >> 2] = $200;
       $202 = $$0173$lcssa$i | 1;
       $203 = $145 + 4 | 0;
       HEAP32[$203 >> 2] = $202;
       $204 = $145 + $$0173$lcssa$i | 0;
       HEAP32[$204 >> 2] = $$0173$lcssa$i;
       $205 = ($33 | 0) == 0;
       if (!$205) {
        $206 = HEAP32[6088 >> 2] | 0;
        $207 = $33 >>> 3;
        $208 = $207 << 1;
        $209 = 6108 + ($208 << 2) | 0;
        $210 = 1 << $207;
        $211 = $8 & $210;
        $212 = ($211 | 0) == 0;
        if ($212) {
         $213 = $8 | $210;
         HEAP32[1517] = $213;
         $$pre$i = $209 + 8 | 0;
         $$0$i = $209;
         $$pre$phi$iZ2D = $$pre$i;
        } else {
         $214 = $209 + 8 | 0;
         $215 = HEAP32[$214 >> 2] | 0;
         $$0$i = $215;
         $$pre$phi$iZ2D = $214;
        }
        HEAP32[$$pre$phi$iZ2D >> 2] = $206;
        $216 = $$0$i + 12 | 0;
        HEAP32[$216 >> 2] = $206;
        $217 = $206 + 8 | 0;
        HEAP32[$217 >> 2] = $$0$i;
        $218 = $206 + 12 | 0;
        HEAP32[$218 >> 2] = $209;
       }
       HEAP32[6076 >> 2] = $$0173$lcssa$i;
       HEAP32[6088 >> 2] = $145;
      }
      $219 = $$0172$lcssa$i + 8 | 0;
      $$0 = $219;
      STACKTOP = sp;
      return $$0 | 0;
     } else {
      $$0192 = $6;
     }
    }
   } else {
    $$0192 = $6;
   }
  } else {
   $220 = $0 >>> 0 > 4294967231;
   if ($220) {
    $$0192 = -1;
   } else {
    $221 = $0 + 11 | 0;
    $222 = $221 & -8;
    $223 = HEAP32[6072 >> 2] | 0;
    $224 = ($223 | 0) == 0;
    if ($224) {
     $$0192 = $222;
    } else {
     $225 = 0 - $222 | 0;
     $226 = $221 >>> 8;
     $227 = ($226 | 0) == 0;
     if ($227) {
      $$0336$i = 0;
     } else {
      $228 = $222 >>> 0 > 16777215;
      if ($228) {
       $$0336$i = 31;
      } else {
       $229 = $226 + 1048320 | 0;
       $230 = $229 >>> 16;
       $231 = $230 & 8;
       $232 = $226 << $231;
       $233 = $232 + 520192 | 0;
       $234 = $233 >>> 16;
       $235 = $234 & 4;
       $236 = $235 | $231;
       $237 = $232 << $235;
       $238 = $237 + 245760 | 0;
       $239 = $238 >>> 16;
       $240 = $239 & 2;
       $241 = $236 | $240;
       $242 = 14 - $241 | 0;
       $243 = $237 << $240;
       $244 = $243 >>> 15;
       $245 = $242 + $244 | 0;
       $246 = $245 << 1;
       $247 = $245 + 7 | 0;
       $248 = $222 >>> $247;
       $249 = $248 & 1;
       $250 = $249 | $246;
       $$0336$i = $250;
      }
     }
     $251 = 6372 + ($$0336$i << 2) | 0;
     $252 = HEAP32[$251 >> 2] | 0;
     $253 = ($252 | 0) == (0 | 0);
     L74 : do {
      if ($253) {
       $$2333$i = 0;
       $$3$i200 = 0;
       $$3328$i = $225;
       label = 57;
      } else {
       $254 = ($$0336$i | 0) == 31;
       $255 = $$0336$i >>> 1;
       $256 = 25 - $255 | 0;
       $257 = $254 ? 0 : $256;
       $258 = $222 << $257;
       $$0320$i = 0;
       $$0325$i = $225;
       $$0331$i = $252;
       $$0337$i = $258;
       $$0340$i = 0;
       while (1) {
        $259 = $$0331$i + 4 | 0;
        $260 = HEAP32[$259 >> 2] | 0;
        $261 = $260 & -8;
        $262 = $261 - $222 | 0;
        $263 = $262 >>> 0 < $$0325$i >>> 0;
        if ($263) {
         $264 = ($262 | 0) == 0;
         if ($264) {
          $$411$i = $$0331$i;
          $$432910$i = 0;
          $$43359$i = $$0331$i;
          label = 61;
          break L74;
         } else {
          $$1321$i = $$0331$i;
          $$1326$i = $262;
         }
        } else {
         $$1321$i = $$0320$i;
         $$1326$i = $$0325$i;
        }
        $265 = $$0331$i + 20 | 0;
        $266 = HEAP32[$265 >> 2] | 0;
        $267 = $$0337$i >>> 31;
        $268 = ($$0331$i + 16 | 0) + ($267 << 2) | 0;
        $269 = HEAP32[$268 >> 2] | 0;
        $270 = ($266 | 0) == (0 | 0);
        $271 = ($266 | 0) == ($269 | 0);
        $or$cond2$i199 = $270 | $271;
        $$1341$i = $or$cond2$i199 ? $$0340$i : $266;
        $272 = ($269 | 0) == (0 | 0);
        $not$5$i = $272 ^ 1;
        $273 = $not$5$i & 1;
        $$0337$$i = $$0337$i << $273;
        if ($272) {
         $$2333$i = $$1341$i;
         $$3$i200 = $$1321$i;
         $$3328$i = $$1326$i;
         label = 57;
         break;
        } else {
         $$0320$i = $$1321$i;
         $$0325$i = $$1326$i;
         $$0331$i = $269;
         $$0337$i = $$0337$$i;
         $$0340$i = $$1341$i;
        }
       }
      }
     } while (0);
     if ((label | 0) == 57) {
      $274 = ($$2333$i | 0) == (0 | 0);
      $275 = ($$3$i200 | 0) == (0 | 0);
      $or$cond$i201 = $274 & $275;
      if ($or$cond$i201) {
       $276 = 2 << $$0336$i;
       $277 = 0 - $276 | 0;
       $278 = $276 | $277;
       $279 = $223 & $278;
       $280 = ($279 | 0) == 0;
       if ($280) {
        $$0192 = $222;
        break;
       }
       $281 = 0 - $279 | 0;
       $282 = $279 & $281;
       $283 = $282 + -1 | 0;
       $284 = $283 >>> 12;
       $285 = $284 & 16;
       $286 = $283 >>> $285;
       $287 = $286 >>> 5;
       $288 = $287 & 8;
       $289 = $288 | $285;
       $290 = $286 >>> $288;
       $291 = $290 >>> 2;
       $292 = $291 & 4;
       $293 = $289 | $292;
       $294 = $290 >>> $292;
       $295 = $294 >>> 1;
       $296 = $295 & 2;
       $297 = $293 | $296;
       $298 = $294 >>> $296;
       $299 = $298 >>> 1;
       $300 = $299 & 1;
       $301 = $297 | $300;
       $302 = $298 >>> $300;
       $303 = $301 + $302 | 0;
       $304 = 6372 + ($303 << 2) | 0;
       $305 = HEAP32[$304 >> 2] | 0;
       $$4$ph$i = 0;
       $$4335$ph$i = $305;
      } else {
       $$4$ph$i = $$3$i200;
       $$4335$ph$i = $$2333$i;
      }
      $306 = ($$4335$ph$i | 0) == (0 | 0);
      if ($306) {
       $$4$lcssa$i = $$4$ph$i;
       $$4329$lcssa$i = $$3328$i;
      } else {
       $$411$i = $$4$ph$i;
       $$432910$i = $$3328$i;
       $$43359$i = $$4335$ph$i;
       label = 61;
      }
     }
     if ((label | 0) == 61) {
      while (1) {
       label = 0;
       $307 = $$43359$i + 4 | 0;
       $308 = HEAP32[$307 >> 2] | 0;
       $309 = $308 & -8;
       $310 = $309 - $222 | 0;
       $311 = $310 >>> 0 < $$432910$i >>> 0;
       $$$4329$i = $311 ? $310 : $$432910$i;
       $$4335$$4$i = $311 ? $$43359$i : $$411$i;
       $312 = $$43359$i + 16 | 0;
       $313 = HEAP32[$312 >> 2] | 0;
       $not$1$i203 = ($313 | 0) == (0 | 0);
       $$sink2$i204 = $not$1$i203 & 1;
       $314 = ($$43359$i + 16 | 0) + ($$sink2$i204 << 2) | 0;
       $315 = HEAP32[$314 >> 2] | 0;
       $316 = ($315 | 0) == (0 | 0);
       if ($316) {
        $$4$lcssa$i = $$4335$$4$i;
        $$4329$lcssa$i = $$$4329$i;
        break;
       } else {
        $$411$i = $$4335$$4$i;
        $$432910$i = $$$4329$i;
        $$43359$i = $315;
        label = 61;
       }
      }
     }
     $317 = ($$4$lcssa$i | 0) == (0 | 0);
     if ($317) {
      $$0192 = $222;
     } else {
      $318 = HEAP32[6076 >> 2] | 0;
      $319 = $318 - $222 | 0;
      $320 = $$4329$lcssa$i >>> 0 < $319 >>> 0;
      if ($320) {
       $321 = $$4$lcssa$i + $222 | 0;
       $322 = $$4$lcssa$i >>> 0 < $321 >>> 0;
       if (!$322) {
        $$0 = 0;
        STACKTOP = sp;
        return $$0 | 0;
       }
       $323 = $$4$lcssa$i + 24 | 0;
       $324 = HEAP32[$323 >> 2] | 0;
       $325 = $$4$lcssa$i + 12 | 0;
       $326 = HEAP32[$325 >> 2] | 0;
       $327 = ($326 | 0) == ($$4$lcssa$i | 0);
       do {
        if ($327) {
         $332 = $$4$lcssa$i + 20 | 0;
         $333 = HEAP32[$332 >> 2] | 0;
         $334 = ($333 | 0) == (0 | 0);
         if ($334) {
          $335 = $$4$lcssa$i + 16 | 0;
          $336 = HEAP32[$335 >> 2] | 0;
          $337 = ($336 | 0) == (0 | 0);
          if ($337) {
           $$3349$i = 0;
           break;
          } else {
           $$1347$i = $336;
           $$1351$i = $335;
          }
         } else {
          $$1347$i = $333;
          $$1351$i = $332;
         }
         while (1) {
          $338 = $$1347$i + 20 | 0;
          $339 = HEAP32[$338 >> 2] | 0;
          $340 = ($339 | 0) == (0 | 0);
          if (!$340) {
           $$1347$i = $339;
           $$1351$i = $338;
           continue;
          }
          $341 = $$1347$i + 16 | 0;
          $342 = HEAP32[$341 >> 2] | 0;
          $343 = ($342 | 0) == (0 | 0);
          if ($343) {
           break;
          } else {
           $$1347$i = $342;
           $$1351$i = $341;
          }
         }
         HEAP32[$$1351$i >> 2] = 0;
         $$3349$i = $$1347$i;
        } else {
         $328 = $$4$lcssa$i + 8 | 0;
         $329 = HEAP32[$328 >> 2] | 0;
         $330 = $329 + 12 | 0;
         HEAP32[$330 >> 2] = $326;
         $331 = $326 + 8 | 0;
         HEAP32[$331 >> 2] = $329;
         $$3349$i = $326;
        }
       } while (0);
       $344 = ($324 | 0) == (0 | 0);
       do {
        if ($344) {
         $426 = $223;
        } else {
         $345 = $$4$lcssa$i + 28 | 0;
         $346 = HEAP32[$345 >> 2] | 0;
         $347 = 6372 + ($346 << 2) | 0;
         $348 = HEAP32[$347 >> 2] | 0;
         $349 = ($$4$lcssa$i | 0) == ($348 | 0);
         if ($349) {
          HEAP32[$347 >> 2] = $$3349$i;
          $cond$i208 = ($$3349$i | 0) == (0 | 0);
          if ($cond$i208) {
           $350 = 1 << $346;
           $351 = $350 ^ -1;
           $352 = $223 & $351;
           HEAP32[6072 >> 2] = $352;
           $426 = $352;
           break;
          }
         } else {
          $353 = $324 + 16 | 0;
          $354 = HEAP32[$353 >> 2] | 0;
          $not$$i209 = ($354 | 0) != ($$4$lcssa$i | 0);
          $$sink3$i = $not$$i209 & 1;
          $355 = ($324 + 16 | 0) + ($$sink3$i << 2) | 0;
          HEAP32[$355 >> 2] = $$3349$i;
          $356 = ($$3349$i | 0) == (0 | 0);
          if ($356) {
           $426 = $223;
           break;
          }
         }
         $357 = $$3349$i + 24 | 0;
         HEAP32[$357 >> 2] = $324;
         $358 = $$4$lcssa$i + 16 | 0;
         $359 = HEAP32[$358 >> 2] | 0;
         $360 = ($359 | 0) == (0 | 0);
         if (!$360) {
          $361 = $$3349$i + 16 | 0;
          HEAP32[$361 >> 2] = $359;
          $362 = $359 + 24 | 0;
          HEAP32[$362 >> 2] = $$3349$i;
         }
         $363 = $$4$lcssa$i + 20 | 0;
         $364 = HEAP32[$363 >> 2] | 0;
         $365 = ($364 | 0) == (0 | 0);
         if ($365) {
          $426 = $223;
         } else {
          $366 = $$3349$i + 20 | 0;
          HEAP32[$366 >> 2] = $364;
          $367 = $364 + 24 | 0;
          HEAP32[$367 >> 2] = $$3349$i;
          $426 = $223;
         }
        }
       } while (0);
       $368 = $$4329$lcssa$i >>> 0 < 16;
       do {
        if ($368) {
         $369 = $$4329$lcssa$i + $222 | 0;
         $370 = $369 | 3;
         $371 = $$4$lcssa$i + 4 | 0;
         HEAP32[$371 >> 2] = $370;
         $372 = $$4$lcssa$i + $369 | 0;
         $373 = $372 + 4 | 0;
         $374 = HEAP32[$373 >> 2] | 0;
         $375 = $374 | 1;
         HEAP32[$373 >> 2] = $375;
        } else {
         $376 = $222 | 3;
         $377 = $$4$lcssa$i + 4 | 0;
         HEAP32[$377 >> 2] = $376;
         $378 = $$4329$lcssa$i | 1;
         $379 = $321 + 4 | 0;
         HEAP32[$379 >> 2] = $378;
         $380 = $321 + $$4329$lcssa$i | 0;
         HEAP32[$380 >> 2] = $$4329$lcssa$i;
         $381 = $$4329$lcssa$i >>> 3;
         $382 = $$4329$lcssa$i >>> 0 < 256;
         if ($382) {
          $383 = $381 << 1;
          $384 = 6108 + ($383 << 2) | 0;
          $385 = HEAP32[1517] | 0;
          $386 = 1 << $381;
          $387 = $385 & $386;
          $388 = ($387 | 0) == 0;
          if ($388) {
           $389 = $385 | $386;
           HEAP32[1517] = $389;
           $$pre$i210 = $384 + 8 | 0;
           $$0345$i = $384;
           $$pre$phi$i211Z2D = $$pre$i210;
          } else {
           $390 = $384 + 8 | 0;
           $391 = HEAP32[$390 >> 2] | 0;
           $$0345$i = $391;
           $$pre$phi$i211Z2D = $390;
          }
          HEAP32[$$pre$phi$i211Z2D >> 2] = $321;
          $392 = $$0345$i + 12 | 0;
          HEAP32[$392 >> 2] = $321;
          $393 = $321 + 8 | 0;
          HEAP32[$393 >> 2] = $$0345$i;
          $394 = $321 + 12 | 0;
          HEAP32[$394 >> 2] = $384;
          break;
         }
         $395 = $$4329$lcssa$i >>> 8;
         $396 = ($395 | 0) == 0;
         if ($396) {
          $$0339$i = 0;
         } else {
          $397 = $$4329$lcssa$i >>> 0 > 16777215;
          if ($397) {
           $$0339$i = 31;
          } else {
           $398 = $395 + 1048320 | 0;
           $399 = $398 >>> 16;
           $400 = $399 & 8;
           $401 = $395 << $400;
           $402 = $401 + 520192 | 0;
           $403 = $402 >>> 16;
           $404 = $403 & 4;
           $405 = $404 | $400;
           $406 = $401 << $404;
           $407 = $406 + 245760 | 0;
           $408 = $407 >>> 16;
           $409 = $408 & 2;
           $410 = $405 | $409;
           $411 = 14 - $410 | 0;
           $412 = $406 << $409;
           $413 = $412 >>> 15;
           $414 = $411 + $413 | 0;
           $415 = $414 << 1;
           $416 = $414 + 7 | 0;
           $417 = $$4329$lcssa$i >>> $416;
           $418 = $417 & 1;
           $419 = $418 | $415;
           $$0339$i = $419;
          }
         }
         $420 = 6372 + ($$0339$i << 2) | 0;
         $421 = $321 + 28 | 0;
         HEAP32[$421 >> 2] = $$0339$i;
         $422 = $321 + 16 | 0;
         $423 = $422 + 4 | 0;
         HEAP32[$423 >> 2] = 0;
         HEAP32[$422 >> 2] = 0;
         $424 = 1 << $$0339$i;
         $425 = $426 & $424;
         $427 = ($425 | 0) == 0;
         if ($427) {
          $428 = $426 | $424;
          HEAP32[6072 >> 2] = $428;
          HEAP32[$420 >> 2] = $321;
          $429 = $321 + 24 | 0;
          HEAP32[$429 >> 2] = $420;
          $430 = $321 + 12 | 0;
          HEAP32[$430 >> 2] = $321;
          $431 = $321 + 8 | 0;
          HEAP32[$431 >> 2] = $321;
          break;
         }
         $432 = HEAP32[$420 >> 2] | 0;
         $433 = ($$0339$i | 0) == 31;
         $434 = $$0339$i >>> 1;
         $435 = 25 - $434 | 0;
         $436 = $433 ? 0 : $435;
         $437 = $$4329$lcssa$i << $436;
         $$0322$i = $437;
         $$0323$i = $432;
         while (1) {
          $438 = $$0323$i + 4 | 0;
          $439 = HEAP32[$438 >> 2] | 0;
          $440 = $439 & -8;
          $441 = ($440 | 0) == ($$4329$lcssa$i | 0);
          if ($441) {
           label = 97;
           break;
          }
          $442 = $$0322$i >>> 31;
          $443 = ($$0323$i + 16 | 0) + ($442 << 2) | 0;
          $444 = $$0322$i << 1;
          $445 = HEAP32[$443 >> 2] | 0;
          $446 = ($445 | 0) == (0 | 0);
          if ($446) {
           label = 96;
           break;
          } else {
           $$0322$i = $444;
           $$0323$i = $445;
          }
         }
         if ((label | 0) == 96) {
          HEAP32[$443 >> 2] = $321;
          $447 = $321 + 24 | 0;
          HEAP32[$447 >> 2] = $$0323$i;
          $448 = $321 + 12 | 0;
          HEAP32[$448 >> 2] = $321;
          $449 = $321 + 8 | 0;
          HEAP32[$449 >> 2] = $321;
          break;
         } else if ((label | 0) == 97) {
          $450 = $$0323$i + 8 | 0;
          $451 = HEAP32[$450 >> 2] | 0;
          $452 = $451 + 12 | 0;
          HEAP32[$452 >> 2] = $321;
          HEAP32[$450 >> 2] = $321;
          $453 = $321 + 8 | 0;
          HEAP32[$453 >> 2] = $451;
          $454 = $321 + 12 | 0;
          HEAP32[$454 >> 2] = $$0323$i;
          $455 = $321 + 24 | 0;
          HEAP32[$455 >> 2] = 0;
          break;
         }
        }
       } while (0);
       $456 = $$4$lcssa$i + 8 | 0;
       $$0 = $456;
       STACKTOP = sp;
       return $$0 | 0;
      } else {
       $$0192 = $222;
      }
     }
    }
   }
  }
 } while (0);
 $457 = HEAP32[6076 >> 2] | 0;
 $458 = $457 >>> 0 < $$0192 >>> 0;
 if (!$458) {
  $459 = $457 - $$0192 | 0;
  $460 = HEAP32[6088 >> 2] | 0;
  $461 = $459 >>> 0 > 15;
  if ($461) {
   $462 = $460 + $$0192 | 0;
   HEAP32[6088 >> 2] = $462;
   HEAP32[6076 >> 2] = $459;
   $463 = $459 | 1;
   $464 = $462 + 4 | 0;
   HEAP32[$464 >> 2] = $463;
   $465 = $462 + $459 | 0;
   HEAP32[$465 >> 2] = $459;
   $466 = $$0192 | 3;
   $467 = $460 + 4 | 0;
   HEAP32[$467 >> 2] = $466;
  } else {
   HEAP32[6076 >> 2] = 0;
   HEAP32[6088 >> 2] = 0;
   $468 = $457 | 3;
   $469 = $460 + 4 | 0;
   HEAP32[$469 >> 2] = $468;
   $470 = $460 + $457 | 0;
   $471 = $470 + 4 | 0;
   $472 = HEAP32[$471 >> 2] | 0;
   $473 = $472 | 1;
   HEAP32[$471 >> 2] = $473;
  }
  $474 = $460 + 8 | 0;
  $$0 = $474;
  STACKTOP = sp;
  return $$0 | 0;
 }
 $475 = HEAP32[6080 >> 2] | 0;
 $476 = $475 >>> 0 > $$0192 >>> 0;
 if ($476) {
  $477 = $475 - $$0192 | 0;
  HEAP32[6080 >> 2] = $477;
  $478 = HEAP32[6092 >> 2] | 0;
  $479 = $478 + $$0192 | 0;
  HEAP32[6092 >> 2] = $479;
  $480 = $477 | 1;
  $481 = $479 + 4 | 0;
  HEAP32[$481 >> 2] = $480;
  $482 = $$0192 | 3;
  $483 = $478 + 4 | 0;
  HEAP32[$483 >> 2] = $482;
  $484 = $478 + 8 | 0;
  $$0 = $484;
  STACKTOP = sp;
  return $$0 | 0;
 }
 $485 = HEAP32[1635] | 0;
 $486 = ($485 | 0) == 0;
 if ($486) {
  HEAP32[6548 >> 2] = 4096;
  HEAP32[6544 >> 2] = 4096;
  HEAP32[6552 >> 2] = -1;
  HEAP32[6556 >> 2] = -1;
  HEAP32[6560 >> 2] = 0;
  HEAP32[6512 >> 2] = 0;
  $487 = $1;
  $488 = $487 & -16;
  $489 = $488 ^ 1431655768;
  HEAP32[$1 >> 2] = $489;
  HEAP32[1635] = $489;
  $493 = 4096;
 } else {
  $$pre$i195 = HEAP32[6548 >> 2] | 0;
  $493 = $$pre$i195;
 }
 $490 = $$0192 + 48 | 0;
 $491 = $$0192 + 47 | 0;
 $492 = $493 + $491 | 0;
 $494 = 0 - $493 | 0;
 $495 = $492 & $494;
 $496 = $495 >>> 0 > $$0192 >>> 0;
 if (!$496) {
  $$0 = 0;
  STACKTOP = sp;
  return $$0 | 0;
 }
 $497 = HEAP32[6508 >> 2] | 0;
 $498 = ($497 | 0) == 0;
 if (!$498) {
  $499 = HEAP32[6500 >> 2] | 0;
  $500 = $499 + $495 | 0;
  $501 = $500 >>> 0 <= $499 >>> 0;
  $502 = $500 >>> 0 > $497 >>> 0;
  $or$cond1$i = $501 | $502;
  if ($or$cond1$i) {
   $$0 = 0;
   STACKTOP = sp;
   return $$0 | 0;
  }
 }
 $503 = HEAP32[6512 >> 2] | 0;
 $504 = $503 & 4;
 $505 = ($504 | 0) == 0;
 L167 : do {
  if ($505) {
   $506 = HEAP32[6092 >> 2] | 0;
   $507 = ($506 | 0) == (0 | 0);
   L169 : do {
    if ($507) {
     label = 118;
    } else {
     $$0$i20$i = 6516;
     while (1) {
      $508 = HEAP32[$$0$i20$i >> 2] | 0;
      $509 = $508 >>> 0 > $506 >>> 0;
      if (!$509) {
       $510 = $$0$i20$i + 4 | 0;
       $511 = HEAP32[$510 >> 2] | 0;
       $512 = $508 + $511 | 0;
       $513 = $512 >>> 0 > $506 >>> 0;
       if ($513) {
        break;
       }
      }
      $514 = $$0$i20$i + 8 | 0;
      $515 = HEAP32[$514 >> 2] | 0;
      $516 = ($515 | 0) == (0 | 0);
      if ($516) {
       label = 118;
       break L169;
      } else {
       $$0$i20$i = $515;
      }
     }
     $539 = $492 - $475 | 0;
     $540 = $539 & $494;
     $541 = $540 >>> 0 < 2147483647;
     if ($541) {
      $542 = (tempInt = _sbrk($540 | 0) | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
      $543 = HEAP32[$$0$i20$i >> 2] | 0;
      $544 = HEAP32[$510 >> 2] | 0;
      $545 = $543 + $544 | 0;
      $546 = ($542 | 0) == ($545 | 0);
      if ($546) {
       $547 = ($542 | 0) == (-1 | 0);
       if ($547) {
        $$2234243136$i = $540;
       } else {
        $$723947$i = $540;
        $$748$i = $542;
        label = 135;
        break L167;
       }
      } else {
       $$2247$ph$i = $542;
       $$2253$ph$i = $540;
       label = 126;
      }
     } else {
      $$2234243136$i = 0;
     }
    }
   } while (0);
   do {
    if ((label | 0) == 118) {
     $517 = (tempInt = _sbrk(0) | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
     $518 = ($517 | 0) == (-1 | 0);
     if ($518) {
      $$2234243136$i = 0;
     } else {
      $519 = $517;
      $520 = HEAP32[6544 >> 2] | 0;
      $521 = $520 + -1 | 0;
      $522 = $521 & $519;
      $523 = ($522 | 0) == 0;
      $524 = $521 + $519 | 0;
      $525 = 0 - $520 | 0;
      $526 = $524 & $525;
      $527 = $526 - $519 | 0;
      $528 = $523 ? 0 : $527;
      $$$i = $528 + $495 | 0;
      $529 = HEAP32[6500 >> 2] | 0;
      $530 = $$$i + $529 | 0;
      $531 = $$$i >>> 0 > $$0192 >>> 0;
      $532 = $$$i >>> 0 < 2147483647;
      $or$cond$i = $531 & $532;
      if ($or$cond$i) {
       $533 = HEAP32[6508 >> 2] | 0;
       $534 = ($533 | 0) == 0;
       if (!$534) {
        $535 = $530 >>> 0 <= $529 >>> 0;
        $536 = $530 >>> 0 > $533 >>> 0;
        $or$cond2$i = $535 | $536;
        if ($or$cond2$i) {
         $$2234243136$i = 0;
         break;
        }
       }
       $537 = (tempInt = _sbrk($$$i | 0) | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
       $538 = ($537 | 0) == ($517 | 0);
       if ($538) {
        $$723947$i = $$$i;
        $$748$i = $517;
        label = 135;
        break L167;
       } else {
        $$2247$ph$i = $537;
        $$2253$ph$i = $$$i;
        label = 126;
       }
      } else {
       $$2234243136$i = 0;
      }
     }
    }
   } while (0);
   do {
    if ((label | 0) == 126) {
     $548 = 0 - $$2253$ph$i | 0;
     $549 = ($$2247$ph$i | 0) != (-1 | 0);
     $550 = $$2253$ph$i >>> 0 < 2147483647;
     $or$cond7$i = $550 & $549;
     $551 = $490 >>> 0 > $$2253$ph$i >>> 0;
     $or$cond10$i = $551 & $or$cond7$i;
     if (!$or$cond10$i) {
      $561 = ($$2247$ph$i | 0) == (-1 | 0);
      if ($561) {
       $$2234243136$i = 0;
       break;
      } else {
       $$723947$i = $$2253$ph$i;
       $$748$i = $$2247$ph$i;
       label = 135;
       break L167;
      }
     }
     $552 = HEAP32[6548 >> 2] | 0;
     $553 = $491 - $$2253$ph$i | 0;
     $554 = $553 + $552 | 0;
     $555 = 0 - $552 | 0;
     $556 = $554 & $555;
     $557 = $556 >>> 0 < 2147483647;
     if (!$557) {
      $$723947$i = $$2253$ph$i;
      $$748$i = $$2247$ph$i;
      label = 135;
      break L167;
     }
     $558 = (tempInt = _sbrk($556 | 0) | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
     $559 = ($558 | 0) == (-1 | 0);
     if ($559) {
      (tempInt = _sbrk($548 | 0) | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
      $$2234243136$i = 0;
      break;
     } else {
      $560 = $556 + $$2253$ph$i | 0;
      $$723947$i = $560;
      $$748$i = $$2247$ph$i;
      label = 135;
      break L167;
     }
    }
   } while (0);
   $562 = HEAP32[6512 >> 2] | 0;
   $563 = $562 | 4;
   HEAP32[6512 >> 2] = $563;
   $$4236$i = $$2234243136$i;
   label = 133;
  } else {
   $$4236$i = 0;
   label = 133;
  }
 } while (0);
 if ((label | 0) == 133) {
  $564 = $495 >>> 0 < 2147483647;
  if ($564) {
   $565 = (tempInt = _sbrk($495 | 0) | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
   $566 = (tempInt = _sbrk(0) | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
   $567 = ($565 | 0) != (-1 | 0);
   $568 = ($566 | 0) != (-1 | 0);
   $or$cond5$i = $567 & $568;
   $569 = $565 >>> 0 < $566 >>> 0;
   $or$cond11$i = $569 & $or$cond5$i;
   $570 = $566;
   $571 = $565;
   $572 = $570 - $571 | 0;
   $573 = $$0192 + 40 | 0;
   $574 = $572 >>> 0 > $573 >>> 0;
   $$$4236$i = $574 ? $572 : $$4236$i;
   $or$cond11$not$i = $or$cond11$i ^ 1;
   $575 = ($565 | 0) == (-1 | 0);
   $not$$i197 = $574 ^ 1;
   $576 = $575 | $not$$i197;
   $or$cond49$i = $576 | $or$cond11$not$i;
   if (!$or$cond49$i) {
    $$723947$i = $$$4236$i;
    $$748$i = $565;
    label = 135;
   }
  }
 }
 if ((label | 0) == 135) {
  $577 = HEAP32[6500 >> 2] | 0;
  $578 = $577 + $$723947$i | 0;
  HEAP32[6500 >> 2] = $578;
  $579 = HEAP32[6504 >> 2] | 0;
  $580 = $578 >>> 0 > $579 >>> 0;
  if ($580) {
   HEAP32[6504 >> 2] = $578;
  }
  $581 = HEAP32[6092 >> 2] | 0;
  $582 = ($581 | 0) == (0 | 0);
  do {
   if ($582) {
    $583 = HEAP32[6084 >> 2] | 0;
    $584 = ($583 | 0) == (0 | 0);
    $585 = $$748$i >>> 0 < $583 >>> 0;
    $or$cond12$i = $584 | $585;
    if ($or$cond12$i) {
     HEAP32[6084 >> 2] = $$748$i;
    }
    HEAP32[6516 >> 2] = $$748$i;
    HEAP32[6520 >> 2] = $$723947$i;
    HEAP32[6528 >> 2] = 0;
    $586 = HEAP32[1635] | 0;
    HEAP32[6104 >> 2] = $586;
    HEAP32[6100 >> 2] = -1;
    $$01$i$i = 0;
    while (1) {
     $587 = $$01$i$i << 1;
     $588 = 6108 + ($587 << 2) | 0;
     $589 = $588 + 12 | 0;
     HEAP32[$589 >> 2] = $588;
     $590 = $588 + 8 | 0;
     HEAP32[$590 >> 2] = $588;
     $591 = $$01$i$i + 1 | 0;
     $exitcond$i$i = ($591 | 0) == 32;
     if ($exitcond$i$i) {
      break;
     } else {
      $$01$i$i = $591;
     }
    }
    $592 = $$723947$i + -40 | 0;
    $593 = $$748$i + 8 | 0;
    $594 = $593;
    $595 = $594 & 7;
    $596 = ($595 | 0) == 0;
    $597 = 0 - $594 | 0;
    $598 = $597 & 7;
    $599 = $596 ? 0 : $598;
    $600 = $$748$i + $599 | 0;
    $601 = $592 - $599 | 0;
    HEAP32[6092 >> 2] = $600;
    HEAP32[6080 >> 2] = $601;
    $602 = $601 | 1;
    $603 = $600 + 4 | 0;
    HEAP32[$603 >> 2] = $602;
    $604 = $600 + $601 | 0;
    $605 = $604 + 4 | 0;
    HEAP32[$605 >> 2] = 40;
    $606 = HEAP32[6556 >> 2] | 0;
    HEAP32[6096 >> 2] = $606;
   } else {
    $$024370$i = 6516;
    while (1) {
     $607 = HEAP32[$$024370$i >> 2] | 0;
     $608 = $$024370$i + 4 | 0;
     $609 = HEAP32[$608 >> 2] | 0;
     $610 = $607 + $609 | 0;
     $611 = ($$748$i | 0) == ($610 | 0);
     if ($611) {
      label = 145;
      break;
     }
     $612 = $$024370$i + 8 | 0;
     $613 = HEAP32[$612 >> 2] | 0;
     $614 = ($613 | 0) == (0 | 0);
     if ($614) {
      break;
     } else {
      $$024370$i = $613;
     }
    }
    if ((label | 0) == 145) {
     $615 = $$024370$i + 12 | 0;
     $616 = HEAP32[$615 >> 2] | 0;
     $617 = $616 & 8;
     $618 = ($617 | 0) == 0;
     if ($618) {
      $619 = $581 >>> 0 >= $607 >>> 0;
      $620 = $581 >>> 0 < $$748$i >>> 0;
      $or$cond50$i = $620 & $619;
      if ($or$cond50$i) {
       $621 = $609 + $$723947$i | 0;
       HEAP32[$608 >> 2] = $621;
       $622 = HEAP32[6080 >> 2] | 0;
       $623 = $581 + 8 | 0;
       $624 = $623;
       $625 = $624 & 7;
       $626 = ($625 | 0) == 0;
       $627 = 0 - $624 | 0;
       $628 = $627 & 7;
       $629 = $626 ? 0 : $628;
       $630 = $581 + $629 | 0;
       $631 = $$723947$i - $629 | 0;
       $632 = $622 + $631 | 0;
       HEAP32[6092 >> 2] = $630;
       HEAP32[6080 >> 2] = $632;
       $633 = $632 | 1;
       $634 = $630 + 4 | 0;
       HEAP32[$634 >> 2] = $633;
       $635 = $630 + $632 | 0;
       $636 = $635 + 4 | 0;
       HEAP32[$636 >> 2] = 40;
       $637 = HEAP32[6556 >> 2] | 0;
       HEAP32[6096 >> 2] = $637;
       break;
      }
     }
    }
    $638 = HEAP32[6084 >> 2] | 0;
    $639 = $$748$i >>> 0 < $638 >>> 0;
    if ($639) {
     HEAP32[6084 >> 2] = $$748$i;
    }
    $640 = $$748$i + $$723947$i | 0;
    $$124469$i = 6516;
    while (1) {
     $641 = HEAP32[$$124469$i >> 2] | 0;
     $642 = ($641 | 0) == ($640 | 0);
     if ($642) {
      label = 153;
      break;
     }
     $643 = $$124469$i + 8 | 0;
     $644 = HEAP32[$643 >> 2] | 0;
     $645 = ($644 | 0) == (0 | 0);
     if ($645) {
      break;
     } else {
      $$124469$i = $644;
     }
    }
    if ((label | 0) == 153) {
     $646 = $$124469$i + 12 | 0;
     $647 = HEAP32[$646 >> 2] | 0;
     $648 = $647 & 8;
     $649 = ($648 | 0) == 0;
     if ($649) {
      HEAP32[$$124469$i >> 2] = $$748$i;
      $650 = $$124469$i + 4 | 0;
      $651 = HEAP32[$650 >> 2] | 0;
      $652 = $651 + $$723947$i | 0;
      HEAP32[$650 >> 2] = $652;
      $653 = $$748$i + 8 | 0;
      $654 = $653;
      $655 = $654 & 7;
      $656 = ($655 | 0) == 0;
      $657 = 0 - $654 | 0;
      $658 = $657 & 7;
      $659 = $656 ? 0 : $658;
      $660 = $$748$i + $659 | 0;
      $661 = $640 + 8 | 0;
      $662 = $661;
      $663 = $662 & 7;
      $664 = ($663 | 0) == 0;
      $665 = 0 - $662 | 0;
      $666 = $665 & 7;
      $667 = $664 ? 0 : $666;
      $668 = $640 + $667 | 0;
      $669 = $668;
      $670 = $660;
      $671 = $669 - $670 | 0;
      $672 = $660 + $$0192 | 0;
      $673 = $671 - $$0192 | 0;
      $674 = $$0192 | 3;
      $675 = $660 + 4 | 0;
      HEAP32[$675 >> 2] = $674;
      $676 = ($668 | 0) == ($581 | 0);
      do {
       if ($676) {
        $677 = HEAP32[6080 >> 2] | 0;
        $678 = $677 + $673 | 0;
        HEAP32[6080 >> 2] = $678;
        HEAP32[6092 >> 2] = $672;
        $679 = $678 | 1;
        $680 = $672 + 4 | 0;
        HEAP32[$680 >> 2] = $679;
       } else {
        $681 = HEAP32[6088 >> 2] | 0;
        $682 = ($668 | 0) == ($681 | 0);
        if ($682) {
         $683 = HEAP32[6076 >> 2] | 0;
         $684 = $683 + $673 | 0;
         HEAP32[6076 >> 2] = $684;
         HEAP32[6088 >> 2] = $672;
         $685 = $684 | 1;
         $686 = $672 + 4 | 0;
         HEAP32[$686 >> 2] = $685;
         $687 = $672 + $684 | 0;
         HEAP32[$687 >> 2] = $684;
         break;
        }
        $688 = $668 + 4 | 0;
        $689 = HEAP32[$688 >> 2] | 0;
        $690 = $689 & 3;
        $691 = ($690 | 0) == 1;
        if ($691) {
         $692 = $689 & -8;
         $693 = $689 >>> 3;
         $694 = $689 >>> 0 < 256;
         L237 : do {
          if ($694) {
           $695 = $668 + 8 | 0;
           $696 = HEAP32[$695 >> 2] | 0;
           $697 = $668 + 12 | 0;
           $698 = HEAP32[$697 >> 2] | 0;
           $699 = ($698 | 0) == ($696 | 0);
           if ($699) {
            $700 = 1 << $693;
            $701 = $700 ^ -1;
            $702 = HEAP32[1517] | 0;
            $703 = $702 & $701;
            HEAP32[1517] = $703;
            break;
           } else {
            $704 = $696 + 12 | 0;
            HEAP32[$704 >> 2] = $698;
            $705 = $698 + 8 | 0;
            HEAP32[$705 >> 2] = $696;
            break;
           }
          } else {
           $706 = $668 + 24 | 0;
           $707 = HEAP32[$706 >> 2] | 0;
           $708 = $668 + 12 | 0;
           $709 = HEAP32[$708 >> 2] | 0;
           $710 = ($709 | 0) == ($668 | 0);
           do {
            if ($710) {
             $715 = $668 + 16 | 0;
             $716 = $715 + 4 | 0;
             $717 = HEAP32[$716 >> 2] | 0;
             $718 = ($717 | 0) == (0 | 0);
             if ($718) {
              $719 = HEAP32[$715 >> 2] | 0;
              $720 = ($719 | 0) == (0 | 0);
              if ($720) {
               $$3$i$i = 0;
               break;
              } else {
               $$1264$i$i = $719;
               $$1266$i$i = $715;
              }
             } else {
              $$1264$i$i = $717;
              $$1266$i$i = $716;
             }
             while (1) {
              $721 = $$1264$i$i + 20 | 0;
              $722 = HEAP32[$721 >> 2] | 0;
              $723 = ($722 | 0) == (0 | 0);
              if (!$723) {
               $$1264$i$i = $722;
               $$1266$i$i = $721;
               continue;
              }
              $724 = $$1264$i$i + 16 | 0;
              $725 = HEAP32[$724 >> 2] | 0;
              $726 = ($725 | 0) == (0 | 0);
              if ($726) {
               break;
              } else {
               $$1264$i$i = $725;
               $$1266$i$i = $724;
              }
             }
             HEAP32[$$1266$i$i >> 2] = 0;
             $$3$i$i = $$1264$i$i;
            } else {
             $711 = $668 + 8 | 0;
             $712 = HEAP32[$711 >> 2] | 0;
             $713 = $712 + 12 | 0;
             HEAP32[$713 >> 2] = $709;
             $714 = $709 + 8 | 0;
             HEAP32[$714 >> 2] = $712;
             $$3$i$i = $709;
            }
           } while (0);
           $727 = ($707 | 0) == (0 | 0);
           if ($727) {
            break;
           }
           $728 = $668 + 28 | 0;
           $729 = HEAP32[$728 >> 2] | 0;
           $730 = 6372 + ($729 << 2) | 0;
           $731 = HEAP32[$730 >> 2] | 0;
           $732 = ($668 | 0) == ($731 | 0);
           do {
            if ($732) {
             HEAP32[$730 >> 2] = $$3$i$i;
             $cond$i$i = ($$3$i$i | 0) == (0 | 0);
             if (!$cond$i$i) {
              break;
             }
             $733 = 1 << $729;
             $734 = $733 ^ -1;
             $735 = HEAP32[6072 >> 2] | 0;
             $736 = $735 & $734;
             HEAP32[6072 >> 2] = $736;
             break L237;
            } else {
             $737 = $707 + 16 | 0;
             $738 = HEAP32[$737 >> 2] | 0;
             $not$$i$i = ($738 | 0) != ($668 | 0);
             $$sink1$i$i = $not$$i$i & 1;
             $739 = ($707 + 16 | 0) + ($$sink1$i$i << 2) | 0;
             HEAP32[$739 >> 2] = $$3$i$i;
             $740 = ($$3$i$i | 0) == (0 | 0);
             if ($740) {
              break L237;
             }
            }
           } while (0);
           $741 = $$3$i$i + 24 | 0;
           HEAP32[$741 >> 2] = $707;
           $742 = $668 + 16 | 0;
           $743 = HEAP32[$742 >> 2] | 0;
           $744 = ($743 | 0) == (0 | 0);
           if (!$744) {
            $745 = $$3$i$i + 16 | 0;
            HEAP32[$745 >> 2] = $743;
            $746 = $743 + 24 | 0;
            HEAP32[$746 >> 2] = $$3$i$i;
           }
           $747 = $742 + 4 | 0;
           $748 = HEAP32[$747 >> 2] | 0;
           $749 = ($748 | 0) == (0 | 0);
           if ($749) {
            break;
           }
           $750 = $$3$i$i + 20 | 0;
           HEAP32[$750 >> 2] = $748;
           $751 = $748 + 24 | 0;
           HEAP32[$751 >> 2] = $$3$i$i;
          }
         } while (0);
         $752 = $668 + $692 | 0;
         $753 = $692 + $673 | 0;
         $$0$i$i = $752;
         $$0260$i$i = $753;
        } else {
         $$0$i$i = $668;
         $$0260$i$i = $673;
        }
        $754 = $$0$i$i + 4 | 0;
        $755 = HEAP32[$754 >> 2] | 0;
        $756 = $755 & -2;
        HEAP32[$754 >> 2] = $756;
        $757 = $$0260$i$i | 1;
        $758 = $672 + 4 | 0;
        HEAP32[$758 >> 2] = $757;
        $759 = $672 + $$0260$i$i | 0;
        HEAP32[$759 >> 2] = $$0260$i$i;
        $760 = $$0260$i$i >>> 3;
        $761 = $$0260$i$i >>> 0 < 256;
        if ($761) {
         $762 = $760 << 1;
         $763 = 6108 + ($762 << 2) | 0;
         $764 = HEAP32[1517] | 0;
         $765 = 1 << $760;
         $766 = $764 & $765;
         $767 = ($766 | 0) == 0;
         if ($767) {
          $768 = $764 | $765;
          HEAP32[1517] = $768;
          $$pre$i17$i = $763 + 8 | 0;
          $$0268$i$i = $763;
          $$pre$phi$i18$iZ2D = $$pre$i17$i;
         } else {
          $769 = $763 + 8 | 0;
          $770 = HEAP32[$769 >> 2] | 0;
          $$0268$i$i = $770;
          $$pre$phi$i18$iZ2D = $769;
         }
         HEAP32[$$pre$phi$i18$iZ2D >> 2] = $672;
         $771 = $$0268$i$i + 12 | 0;
         HEAP32[$771 >> 2] = $672;
         $772 = $672 + 8 | 0;
         HEAP32[$772 >> 2] = $$0268$i$i;
         $773 = $672 + 12 | 0;
         HEAP32[$773 >> 2] = $763;
         break;
        }
        $774 = $$0260$i$i >>> 8;
        $775 = ($774 | 0) == 0;
        do {
         if ($775) {
          $$0269$i$i = 0;
         } else {
          $776 = $$0260$i$i >>> 0 > 16777215;
          if ($776) {
           $$0269$i$i = 31;
           break;
          }
          $777 = $774 + 1048320 | 0;
          $778 = $777 >>> 16;
          $779 = $778 & 8;
          $780 = $774 << $779;
          $781 = $780 + 520192 | 0;
          $782 = $781 >>> 16;
          $783 = $782 & 4;
          $784 = $783 | $779;
          $785 = $780 << $783;
          $786 = $785 + 245760 | 0;
          $787 = $786 >>> 16;
          $788 = $787 & 2;
          $789 = $784 | $788;
          $790 = 14 - $789 | 0;
          $791 = $785 << $788;
          $792 = $791 >>> 15;
          $793 = $790 + $792 | 0;
          $794 = $793 << 1;
          $795 = $793 + 7 | 0;
          $796 = $$0260$i$i >>> $795;
          $797 = $796 & 1;
          $798 = $797 | $794;
          $$0269$i$i = $798;
         }
        } while (0);
        $799 = 6372 + ($$0269$i$i << 2) | 0;
        $800 = $672 + 28 | 0;
        HEAP32[$800 >> 2] = $$0269$i$i;
        $801 = $672 + 16 | 0;
        $802 = $801 + 4 | 0;
        HEAP32[$802 >> 2] = 0;
        HEAP32[$801 >> 2] = 0;
        $803 = HEAP32[6072 >> 2] | 0;
        $804 = 1 << $$0269$i$i;
        $805 = $803 & $804;
        $806 = ($805 | 0) == 0;
        if ($806) {
         $807 = $803 | $804;
         HEAP32[6072 >> 2] = $807;
         HEAP32[$799 >> 2] = $672;
         $808 = $672 + 24 | 0;
         HEAP32[$808 >> 2] = $799;
         $809 = $672 + 12 | 0;
         HEAP32[$809 >> 2] = $672;
         $810 = $672 + 8 | 0;
         HEAP32[$810 >> 2] = $672;
         break;
        }
        $811 = HEAP32[$799 >> 2] | 0;
        $812 = ($$0269$i$i | 0) == 31;
        $813 = $$0269$i$i >>> 1;
        $814 = 25 - $813 | 0;
        $815 = $812 ? 0 : $814;
        $816 = $$0260$i$i << $815;
        $$0261$i$i = $816;
        $$0262$i$i = $811;
        while (1) {
         $817 = $$0262$i$i + 4 | 0;
         $818 = HEAP32[$817 >> 2] | 0;
         $819 = $818 & -8;
         $820 = ($819 | 0) == ($$0260$i$i | 0);
         if ($820) {
          label = 194;
          break;
         }
         $821 = $$0261$i$i >>> 31;
         $822 = ($$0262$i$i + 16 | 0) + ($821 << 2) | 0;
         $823 = $$0261$i$i << 1;
         $824 = HEAP32[$822 >> 2] | 0;
         $825 = ($824 | 0) == (0 | 0);
         if ($825) {
          label = 193;
          break;
         } else {
          $$0261$i$i = $823;
          $$0262$i$i = $824;
         }
        }
        if ((label | 0) == 193) {
         HEAP32[$822 >> 2] = $672;
         $826 = $672 + 24 | 0;
         HEAP32[$826 >> 2] = $$0262$i$i;
         $827 = $672 + 12 | 0;
         HEAP32[$827 >> 2] = $672;
         $828 = $672 + 8 | 0;
         HEAP32[$828 >> 2] = $672;
         break;
        } else if ((label | 0) == 194) {
         $829 = $$0262$i$i + 8 | 0;
         $830 = HEAP32[$829 >> 2] | 0;
         $831 = $830 + 12 | 0;
         HEAP32[$831 >> 2] = $672;
         HEAP32[$829 >> 2] = $672;
         $832 = $672 + 8 | 0;
         HEAP32[$832 >> 2] = $830;
         $833 = $672 + 12 | 0;
         HEAP32[$833 >> 2] = $$0262$i$i;
         $834 = $672 + 24 | 0;
         HEAP32[$834 >> 2] = 0;
         break;
        }
       }
      } while (0);
      $959 = $660 + 8 | 0;
      $$0 = $959;
      STACKTOP = sp;
      return $$0 | 0;
     }
    }
    $$0$i$i$i = 6516;
    while (1) {
     $835 = HEAP32[$$0$i$i$i >> 2] | 0;
     $836 = $835 >>> 0 > $581 >>> 0;
     if (!$836) {
      $837 = $$0$i$i$i + 4 | 0;
      $838 = HEAP32[$837 >> 2] | 0;
      $839 = $835 + $838 | 0;
      $840 = $839 >>> 0 > $581 >>> 0;
      if ($840) {
       break;
      }
     }
     $841 = $$0$i$i$i + 8 | 0;
     $842 = HEAP32[$841 >> 2] | 0;
     $$0$i$i$i = $842;
    }
    $843 = $839 + -47 | 0;
    $844 = $843 + 8 | 0;
    $845 = $844;
    $846 = $845 & 7;
    $847 = ($846 | 0) == 0;
    $848 = 0 - $845 | 0;
    $849 = $848 & 7;
    $850 = $847 ? 0 : $849;
    $851 = $843 + $850 | 0;
    $852 = $581 + 16 | 0;
    $853 = $851 >>> 0 < $852 >>> 0;
    $854 = $853 ? $581 : $851;
    $855 = $854 + 8 | 0;
    $856 = $854 + 24 | 0;
    $857 = $$723947$i + -40 | 0;
    $858 = $$748$i + 8 | 0;
    $859 = $858;
    $860 = $859 & 7;
    $861 = ($860 | 0) == 0;
    $862 = 0 - $859 | 0;
    $863 = $862 & 7;
    $864 = $861 ? 0 : $863;
    $865 = $$748$i + $864 | 0;
    $866 = $857 - $864 | 0;
    HEAP32[6092 >> 2] = $865;
    HEAP32[6080 >> 2] = $866;
    $867 = $866 | 1;
    $868 = $865 + 4 | 0;
    HEAP32[$868 >> 2] = $867;
    $869 = $865 + $866 | 0;
    $870 = $869 + 4 | 0;
    HEAP32[$870 >> 2] = 40;
    $871 = HEAP32[6556 >> 2] | 0;
    HEAP32[6096 >> 2] = $871;
    $872 = $854 + 4 | 0;
    HEAP32[$872 >> 2] = 27;
    HEAP32[$855 >> 2] = HEAP32[6516 >> 2] | 0;
    HEAP32[$855 + 4 >> 2] = HEAP32[6516 + 4 >> 2] | 0;
    HEAP32[$855 + 8 >> 2] = HEAP32[6516 + 8 >> 2] | 0;
    HEAP32[$855 + 12 >> 2] = HEAP32[6516 + 12 >> 2] | 0;
    HEAP32[6516 >> 2] = $$748$i;
    HEAP32[6520 >> 2] = $$723947$i;
    HEAP32[6528 >> 2] = 0;
    HEAP32[6524 >> 2] = $855;
    $874 = $856;
    while (1) {
     $873 = $874 + 4 | 0;
     HEAP32[$873 >> 2] = 7;
     $875 = $874 + 8 | 0;
     $876 = $875 >>> 0 < $839 >>> 0;
     if ($876) {
      $874 = $873;
     } else {
      break;
     }
    }
    $877 = ($854 | 0) == ($581 | 0);
    if (!$877) {
     $878 = $854;
     $879 = $581;
     $880 = $878 - $879 | 0;
     $881 = HEAP32[$872 >> 2] | 0;
     $882 = $881 & -2;
     HEAP32[$872 >> 2] = $882;
     $883 = $880 | 1;
     $884 = $581 + 4 | 0;
     HEAP32[$884 >> 2] = $883;
     HEAP32[$854 >> 2] = $880;
     $885 = $880 >>> 3;
     $886 = $880 >>> 0 < 256;
     if ($886) {
      $887 = $885 << 1;
      $888 = 6108 + ($887 << 2) | 0;
      $889 = HEAP32[1517] | 0;
      $890 = 1 << $885;
      $891 = $889 & $890;
      $892 = ($891 | 0) == 0;
      if ($892) {
       $893 = $889 | $890;
       HEAP32[1517] = $893;
       $$pre$i$i = $888 + 8 | 0;
       $$0206$i$i = $888;
       $$pre$phi$i$iZ2D = $$pre$i$i;
      } else {
       $894 = $888 + 8 | 0;
       $895 = HEAP32[$894 >> 2] | 0;
       $$0206$i$i = $895;
       $$pre$phi$i$iZ2D = $894;
      }
      HEAP32[$$pre$phi$i$iZ2D >> 2] = $581;
      $896 = $$0206$i$i + 12 | 0;
      HEAP32[$896 >> 2] = $581;
      $897 = $581 + 8 | 0;
      HEAP32[$897 >> 2] = $$0206$i$i;
      $898 = $581 + 12 | 0;
      HEAP32[$898 >> 2] = $888;
      break;
     }
     $899 = $880 >>> 8;
     $900 = ($899 | 0) == 0;
     if ($900) {
      $$0207$i$i = 0;
     } else {
      $901 = $880 >>> 0 > 16777215;
      if ($901) {
       $$0207$i$i = 31;
      } else {
       $902 = $899 + 1048320 | 0;
       $903 = $902 >>> 16;
       $904 = $903 & 8;
       $905 = $899 << $904;
       $906 = $905 + 520192 | 0;
       $907 = $906 >>> 16;
       $908 = $907 & 4;
       $909 = $908 | $904;
       $910 = $905 << $908;
       $911 = $910 + 245760 | 0;
       $912 = $911 >>> 16;
       $913 = $912 & 2;
       $914 = $909 | $913;
       $915 = 14 - $914 | 0;
       $916 = $910 << $913;
       $917 = $916 >>> 15;
       $918 = $915 + $917 | 0;
       $919 = $918 << 1;
       $920 = $918 + 7 | 0;
       $921 = $880 >>> $920;
       $922 = $921 & 1;
       $923 = $922 | $919;
       $$0207$i$i = $923;
      }
     }
     $924 = 6372 + ($$0207$i$i << 2) | 0;
     $925 = $581 + 28 | 0;
     HEAP32[$925 >> 2] = $$0207$i$i;
     $926 = $581 + 20 | 0;
     HEAP32[$926 >> 2] = 0;
     HEAP32[$852 >> 2] = 0;
     $927 = HEAP32[6072 >> 2] | 0;
     $928 = 1 << $$0207$i$i;
     $929 = $927 & $928;
     $930 = ($929 | 0) == 0;
     if ($930) {
      $931 = $927 | $928;
      HEAP32[6072 >> 2] = $931;
      HEAP32[$924 >> 2] = $581;
      $932 = $581 + 24 | 0;
      HEAP32[$932 >> 2] = $924;
      $933 = $581 + 12 | 0;
      HEAP32[$933 >> 2] = $581;
      $934 = $581 + 8 | 0;
      HEAP32[$934 >> 2] = $581;
      break;
     }
     $935 = HEAP32[$924 >> 2] | 0;
     $936 = ($$0207$i$i | 0) == 31;
     $937 = $$0207$i$i >>> 1;
     $938 = 25 - $937 | 0;
     $939 = $936 ? 0 : $938;
     $940 = $880 << $939;
     $$0201$i$i = $940;
     $$0202$i$i = $935;
     while (1) {
      $941 = $$0202$i$i + 4 | 0;
      $942 = HEAP32[$941 >> 2] | 0;
      $943 = $942 & -8;
      $944 = ($943 | 0) == ($880 | 0);
      if ($944) {
       label = 216;
       break;
      }
      $945 = $$0201$i$i >>> 31;
      $946 = ($$0202$i$i + 16 | 0) + ($945 << 2) | 0;
      $947 = $$0201$i$i << 1;
      $948 = HEAP32[$946 >> 2] | 0;
      $949 = ($948 | 0) == (0 | 0);
      if ($949) {
       label = 215;
       break;
      } else {
       $$0201$i$i = $947;
       $$0202$i$i = $948;
      }
     }
     if ((label | 0) == 215) {
      HEAP32[$946 >> 2] = $581;
      $950 = $581 + 24 | 0;
      HEAP32[$950 >> 2] = $$0202$i$i;
      $951 = $581 + 12 | 0;
      HEAP32[$951 >> 2] = $581;
      $952 = $581 + 8 | 0;
      HEAP32[$952 >> 2] = $581;
      break;
     } else if ((label | 0) == 216) {
      $953 = $$0202$i$i + 8 | 0;
      $954 = HEAP32[$953 >> 2] | 0;
      $955 = $954 + 12 | 0;
      HEAP32[$955 >> 2] = $581;
      HEAP32[$953 >> 2] = $581;
      $956 = $581 + 8 | 0;
      HEAP32[$956 >> 2] = $954;
      $957 = $581 + 12 | 0;
      HEAP32[$957 >> 2] = $$0202$i$i;
      $958 = $581 + 24 | 0;
      HEAP32[$958 >> 2] = 0;
      break;
     }
    }
   }
  } while (0);
  $960 = HEAP32[6080 >> 2] | 0;
  $961 = $960 >>> 0 > $$0192 >>> 0;
  if ($961) {
   $962 = $960 - $$0192 | 0;
   HEAP32[6080 >> 2] = $962;
   $963 = HEAP32[6092 >> 2] | 0;
   $964 = $963 + $$0192 | 0;
   HEAP32[6092 >> 2] = $964;
   $965 = $962 | 1;
   $966 = $964 + 4 | 0;
   HEAP32[$966 >> 2] = $965;
   $967 = $$0192 | 3;
   $968 = $963 + 4 | 0;
   HEAP32[$968 >> 2] = $967;
   $969 = $963 + 8 | 0;
   $$0 = $969;
   STACKTOP = sp;
   return $$0 | 0;
  }
 }
 $970 = (tempInt = ___errno_location() | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
 HEAP32[$970 >> 2] = 12;
 $$0 = 0;
 STACKTOP = sp;
 return $$0 | 0;
}
function emterpret(pc) {
 pc = pc | 0;
 var sp = 0, inst = 0, lx = 0, ly = 0, lz = 0;
 var ld = 0.0;
 HEAP32[EMTSTACKTOP >> 2] = pc;
 sp = EMTSTACKTOP + 8 | 0;
 assert(HEAPU8[pc >> 0] >>> 0 == 140 | 0);
 lx = HEAPU16[pc + 2 >> 1] | 0;
 EMTSTACKTOP = EMTSTACKTOP + (lx + 1 << 3) | 0;
 assert((EMTSTACKTOP | 0) <= (EMT_STACK_MAX | 0) | 0);
 if ((asyncState | 0) != 2) {} else {
  pc = (HEAP32[sp - 4 >> 2] | 0) - 8 | 0;
 }
 pc = pc + 4 | 0;
 while (1) {
  pc = pc + 4 | 0;
  inst = HEAP32[pc >> 2] | 0;
  lx = inst >> 8 & 255;
  ly = inst >> 16 & 255;
  lz = inst >>> 24;
  switch (inst & 255) {
  case 0:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[sp + (ly << 3) >> 2] | 0;
   break;
  case 1:
   HEAP32[sp + (lx << 3) >> 2] = inst >> 16;
   break;
  case 2:
   pc = pc + 4 | 0;
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[pc >> 2] | 0;
   break;
  case 3:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) + (HEAP32[sp + (lz << 3) >> 2] | 0) | 0;
   break;
  case 4:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) - (HEAP32[sp + (lz << 3) >> 2] | 0) | 0;
   break;
  case 5:
   HEAP32[sp + (lx << 3) >> 2] = Math_imul(HEAP32[sp + (ly << 3) >> 2] | 0, HEAP32[sp + (lz << 3) >> 2] | 0) | 0;
   break;
  case 7:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] >>> 0) / (HEAP32[sp + (lz << 3) >> 2] >>> 0) >>> 0;
   break;
  case 9:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] >>> 0) % (HEAP32[sp + (lz << 3) >> 2] >>> 0) >>> 0;
   break;
  case 13:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) == (HEAP32[sp + (lz << 3) >> 2] | 0) | 0;
   break;
  case 14:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) != (HEAP32[sp + (lz << 3) >> 2] | 0) | 0;
   break;
  case 15:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) < (HEAP32[sp + (lz << 3) >> 2] | 0) | 0;
   break;
  case 16:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[sp + (ly << 3) >> 2] >>> 0 < HEAP32[sp + (lz << 3) >> 2] >>> 0 | 0;
   break;
  case 17:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) <= (HEAP32[sp + (lz << 3) >> 2] | 0) | 0;
   break;
  case 18:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[sp + (ly << 3) >> 2] >>> 0 <= HEAP32[sp + (lz << 3) >> 2] >>> 0 | 0;
   break;
  case 19:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) & (HEAP32[sp + (lz << 3) >> 2] | 0);
   break;
  case 20:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[sp + (ly << 3) >> 2] | 0 | (HEAP32[sp + (lz << 3) >> 2] | 0);
   break;
  case 21:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) ^ (HEAP32[sp + (lz << 3) >> 2] | 0);
   break;
  case 22:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) << (HEAP32[sp + (lz << 3) >> 2] | 0);
   break;
  case 24:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) >>> (HEAP32[sp + (lz << 3) >> 2] | 0);
   break;
  case 25:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) + (inst >> 24) | 0;
   break;
  case 26:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) - (inst >> 24) | 0;
   break;
  case 27:
   HEAP32[sp + (lx << 3) >> 2] = Math_imul(HEAP32[sp + (ly << 3) >> 2] | 0, inst >> 24) | 0;
   break;
  case 28:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) / (inst >> 24) | 0;
   break;
  case 29:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] >>> 0) / (lz >>> 0) >>> 0;
   break;
  case 30:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) % (inst >> 24) | 0;
   break;
  case 31:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] >>> 0) % (lz >>> 0) >>> 0;
   break;
  case 32:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) == inst >> 24 | 0;
   break;
  case 33:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) != inst >> 24 | 0;
   break;
  case 34:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) < inst >> 24 | 0;
   break;
  case 35:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[sp + (ly << 3) >> 2] >>> 0 < lz >>> 0 | 0;
   break;
  case 36:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) <= inst >> 24 | 0;
   break;
  case 37:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[sp + (ly << 3) >> 2] >>> 0 <= lz >>> 0 | 0;
   break;
  case 38:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) & inst >> 24;
   break;
  case 39:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[sp + (ly << 3) >> 2] | 0 | inst >> 24;
   break;
  case 40:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) ^ inst >> 24;
   break;
  case 41:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) << lz;
   break;
  case 42:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) >> lz;
   break;
  case 43:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) >>> lz;
   break;
  case 45:
   if ((HEAP32[sp + (ly << 3) >> 2] | 0) == (HEAP32[sp + (lz << 3) >> 2] | 0)) {
    pc = pc + 4 | 0;
   } else {
    pc = HEAP32[pc + 4 >> 2] | 0;
    pc = pc - 4 | 0;
    continue;
   }
   break;
  case 46:
   if ((HEAP32[sp + (ly << 3) >> 2] | 0) != (HEAP32[sp + (lz << 3) >> 2] | 0)) {
    pc = pc + 4 | 0;
   } else {
    pc = HEAP32[pc + 4 >> 2] | 0;
    pc = pc - 4 | 0;
    continue;
   }
   break;
  case 47:
   if ((HEAP32[sp + (ly << 3) >> 2] | 0) < (HEAP32[sp + (lz << 3) >> 2] | 0)) {
    pc = pc + 4 | 0;
   } else {
    pc = HEAP32[pc + 4 >> 2] | 0;
    pc = pc - 4 | 0;
    continue;
   }
   break;
  case 48:
   if (HEAP32[sp + (ly << 3) >> 2] >>> 0 < HEAP32[sp + (lz << 3) >> 2] >>> 0) {
    pc = pc + 4 | 0;
   } else {
    pc = HEAP32[pc + 4 >> 2] | 0;
    pc = pc - 4 | 0;
    continue;
   }
   break;
  case 49:
   if ((HEAP32[sp + (ly << 3) >> 2] | 0) <= (HEAP32[sp + (lz << 3) >> 2] | 0)) {
    pc = pc + 4 | 0;
   } else {
    pc = HEAP32[pc + 4 >> 2] | 0;
    pc = pc - 4 | 0;
    continue;
   }
   break;
  case 53:
   if ((HEAP32[sp + (ly << 3) >> 2] | 0) != (HEAP32[sp + (lz << 3) >> 2] | 0)) {
    pc = HEAP32[pc + 4 >> 2] | 0;
    pc = pc - 4 | 0;
    continue;
   } else {
    pc = pc + 4 | 0;
   }
   break;
  case 54:
   if ((HEAP32[sp + (ly << 3) >> 2] | 0) < (HEAP32[sp + (lz << 3) >> 2] | 0)) {
    pc = HEAP32[pc + 4 >> 2] | 0;
    pc = pc - 4 | 0;
    continue;
   } else {
    pc = pc + 4 | 0;
   }
   break;
  case 55:
   if (HEAP32[sp + (ly << 3) >> 2] >>> 0 < HEAP32[sp + (lz << 3) >> 2] >>> 0) {
    pc = HEAP32[pc + 4 >> 2] | 0;
    pc = pc - 4 | 0;
    continue;
   } else {
    pc = pc + 4 | 0;
   }
   break;
  case 58:
   HEAPF64[sp + (lx << 3) >> 3] = +HEAPF64[sp + (ly << 3) >> 3];
   break;
  case 59:
   HEAPF64[sp + (lx << 3) >> 3] = +(inst >> 16);
   break;
  case 60:
   pc = pc + 4 | 0;
   HEAPF64[sp + (lx << 3) >> 3] = +(HEAP32[pc >> 2] | 0);
   break;
  case 61:
   pc = pc + 4 | 0;
   HEAPF64[sp + (lx << 3) >> 3] = +HEAPF32[pc >> 2];
   break;
  case 62:
   HEAP32[tempDoublePtr >> 2] = HEAP32[pc + 4 >> 2];
   HEAP32[tempDoublePtr + 4 >> 2] = HEAP32[pc + 8 >> 2];
   pc = pc + 8 | 0;
   HEAPF64[sp + (lx << 3) >> 3] = +HEAPF64[tempDoublePtr >> 3];
   break;
  case 63:
   HEAPF64[sp + (lx << 3) >> 3] = +HEAPF64[sp + (ly << 3) >> 3] + +HEAPF64[sp + (lz << 3) >> 3];
   break;
  case 64:
   HEAPF64[sp + (lx << 3) >> 3] = +HEAPF64[sp + (ly << 3) >> 3] - +HEAPF64[sp + (lz << 3) >> 3];
   break;
  case 65:
   HEAPF64[sp + (lx << 3) >> 3] = +HEAPF64[sp + (ly << 3) >> 3] * +HEAPF64[sp + (lz << 3) >> 3];
   break;
  case 68:
   HEAPF64[sp + (lx << 3) >> 3] = -+HEAPF64[sp + (ly << 3) >> 3];
   break;
  case 69:
   HEAP32[sp + (lx << 3) >> 2] = +HEAPF64[sp + (ly << 3) >> 3] == +HEAPF64[sp + (lz << 3) >> 3] | 0;
   break;
  case 70:
   HEAP32[sp + (lx << 3) >> 2] = +HEAPF64[sp + (ly << 3) >> 3] != +HEAPF64[sp + (lz << 3) >> 3] | 0;
   break;
  case 71:
   HEAP32[sp + (lx << 3) >> 2] = +HEAPF64[sp + (ly << 3) >> 3] < +HEAPF64[sp + (lz << 3) >> 3] | 0;
   break;
  case 73:
   HEAP32[sp + (lx << 3) >> 2] = +HEAPF64[sp + (ly << 3) >> 3] > +HEAPF64[sp + (lz << 3) >> 3] | 0;
   break;
  case 75:
   HEAP32[sp + (lx << 3) >> 2] = ~~+HEAPF64[sp + (ly << 3) >> 3];
   break;
  case 76:
   HEAPF64[sp + (lx << 3) >> 3] = +(HEAP32[sp + (ly << 3) >> 2] | 0);
   break;
  case 77:
   HEAPF64[sp + (lx << 3) >> 3] = +(HEAP32[sp + (ly << 3) >> 2] >>> 0);
   break;
  case 78:
   HEAP32[sp + (lx << 3) >> 2] = HEAP8[HEAP32[sp + (ly << 3) >> 2] >> 0];
   break;
  case 80:
   HEAP32[sp + (lx << 3) >> 2] = HEAP16[HEAP32[sp + (ly << 3) >> 2] >> 1];
   break;
  case 82:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[HEAP32[sp + (ly << 3) >> 2] >> 2];
   break;
  case 83:
   HEAP8[HEAP32[sp + (lx << 3) >> 2] >> 0] = HEAP32[sp + (ly << 3) >> 2] | 0;
   break;
  case 84:
   HEAP16[HEAP32[sp + (lx << 3) >> 2] >> 1] = HEAP32[sp + (ly << 3) >> 2] | 0;
   break;
  case 85:
   HEAP32[HEAP32[sp + (lx << 3) >> 2] >> 2] = HEAP32[sp + (ly << 3) >> 2] | 0;
   break;
  case 86:
   HEAPF64[sp + (lx << 3) >> 3] = +HEAPF64[HEAP32[sp + (ly << 3) >> 2] >> 3];
   break;
  case 87:
   HEAPF64[HEAP32[sp + (lx << 3) >> 2] >> 3] = +HEAPF64[sp + (ly << 3) >> 3];
   break;
  case 88:
   HEAPF64[sp + (lx << 3) >> 3] = +HEAPF32[HEAP32[sp + (ly << 3) >> 2] >> 2];
   break;
  case 89:
   HEAPF32[HEAP32[sp + (lx << 3) >> 2] >> 2] = +HEAPF64[sp + (ly << 3) >> 3];
   break;
  case 90:
   HEAP32[sp + (lx << 3) >> 2] = HEAP8[(HEAP32[sp + (ly << 3) >> 2] | 0) + (HEAP32[sp + (lz << 3) >> 2] | 0) >> 0];
   break;
  case 97:
   HEAP32[(HEAP32[sp + (lx << 3) >> 2] | 0) + (HEAP32[sp + (ly << 3) >> 2] | 0) >> 2] = HEAP32[sp + (lz << 3) >> 2] | 0;
   break;
  case 106:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[(HEAP32[sp + (ly << 3) >> 2] | 0) + (inst >> 24) >> 2];
   break;
  case 107:
   HEAP8[(HEAP32[sp + (lx << 3) >> 2] | 0) + (ly << 24 >> 24) >> 0] = HEAP32[sp + (lz << 3) >> 2] | 0;
   break;
  case 109:
   HEAP32[(HEAP32[sp + (lx << 3) >> 2] | 0) + (ly << 24 >> 24) >> 2] = HEAP32[sp + (lz << 3) >> 2] | 0;
   break;
  case 119:
   pc = pc + (inst >> 16 << 2) | 0;
   pc = pc - 4 | 0;
   continue;
   break;
  case 120:
   if (HEAP32[sp + (lx << 3) >> 2] | 0) {
    pc = pc + (inst >> 16 << 2) | 0;
    pc = pc - 4 | 0;
    continue;
   }
   break;
  case 121:
   if (!(HEAP32[sp + (lx << 3) >> 2] | 0)) {
    pc = pc + (inst >> 16 << 2) | 0;
    pc = pc - 4 | 0;
    continue;
   }
   break;
  case 125:
   pc = pc + 4 | 0;
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[sp + (ly << 3) >> 2] | 0 ? HEAP32[sp + (lz << 3) >> 2] | 0 : HEAP32[sp + ((HEAPU8[pc >> 0] | 0) << 3) >> 2] | 0;
   break;
  case 127:
   HEAP32[sp + (lx << 3) >> 2] = tempDoublePtr;
   break;
  case 128:
   HEAP32[sp + (lx << 3) >> 2] = tempRet0;
   break;
  case 129:
   tempRet0 = HEAP32[sp + (lx << 3) >> 2] | 0;
   break;
  case 130:
   switch (ly | 0) {
   case 0:
    {
     HEAP32[sp + (lx << 3) >> 2] = STACK_MAX;
     continue;
    }
   case 1:
    {
     HEAP32[sp + (lx << 3) >> 2] = DYNAMICTOP_PTR;
     continue;
    }
   case 2:
    {
     HEAP32[sp + (lx << 3) >> 2] = cttz_i8;
     continue;
    }
   default:
    assert(0);
   }
   break;
  case 132:
   switch (inst >> 8 & 255) {
   case 0:
    {
     STACK_MAX = HEAP32[sp + (lz << 3) >> 2] | 0;
     continue;
    }
   case 1:
    {
     DYNAMICTOP_PTR = HEAP32[sp + (lz << 3) >> 2] | 0;
     continue;
    }
   case 2:
    {
     cttz_i8 = HEAP32[sp + (lz << 3) >> 2] | 0;
     continue;
    }
   default:
    assert(0);
   }
   break;
  case 134:
   lz = HEAPU8[(HEAP32[pc + 4 >> 2] | 0) + 1 | 0] | 0;
   ly = 0;
   assert((EMTSTACKTOP + 8 | 0) <= (EMT_STACK_MAX | 0) | 0);
   if ((asyncState | 0) != 2) {
    while ((ly | 0) < (lz | 0)) {
     HEAP32[EMTSTACKTOP + (ly << 3) + 8 >> 2] = HEAP32[sp + (HEAPU8[pc + 8 + ly >> 0] << 3) >> 2] | 0;
     HEAP32[EMTSTACKTOP + (ly << 3) + 12 >> 2] = HEAP32[sp + (HEAPU8[pc + 8 + ly >> 0] << 3) + 4 >> 2] | 0;
     ly = ly + 1 | 0;
    }
   }
   HEAP32[sp - 4 >> 2] = pc;
   emterpret(HEAP32[pc + 4 >> 2] | 0);
   if ((asyncState | 0) == 1) {
    EMTSTACKTOP = sp - 8 | 0;
    return;
   }
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[EMTSTACKTOP >> 2] | 0;
   HEAP32[sp + (lx << 3) + 4 >> 2] = HEAP32[EMTSTACKTOP + 4 >> 2] | 0;
   pc = pc + (4 + lz + 3 >> 2 << 2) | 0;
   break;
  case 135:
   switch (inst >>> 16 | 0) {
   case 0:
    {
     HEAP32[sp - 4 >> 2] = pc;
     abortStackOverflow(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 1:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _bitshift64Shl(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 2:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _memset(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 3:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = Math_clz32(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 4:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = ___syscall146(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 5:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = FUNCTION_TABLE_iiii[HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] & 7](HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 7 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 6:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _memcpy(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 7:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _bitshift64Lshr(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 8:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = ___syscall140(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 9:
    {
     HEAP32[sp - 4 >> 2] = pc;
     ld = +Math_atan2(+HEAPF64[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 3], +HEAPF64[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 3]);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAPF64[sp + (lx << 3) >> 3] = ld;
     pc = pc + 4 | 0;
     continue;
    }
   case 10:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = ___syscall54(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 11:
    {
     HEAP32[sp - 4 >> 2] = pc;
     ld = +Math_cos(+HEAPF64[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 3]);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAPF64[sp + (lx << 3) >> 3] = ld;
     pc = pc + 4 | 0;
     continue;
    }
   case 12:
    {
     HEAP32[sp - 4 >> 2] = pc;
     ld = +Math_sin(+HEAPF64[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 3]);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAPF64[sp + (lx << 3) >> 3] = ld;
     pc = pc + 4 | 0;
     continue;
    }
   case 13:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _emscripten_asm_const_iiii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 7 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 14:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = abortOnCannotGrowMemory() | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     continue;
    }
   case 15:
    {
     HEAP32[sp - 4 >> 2] = pc;
     ___setErrNo(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 16:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = getTotalMemory() | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     continue;
    }
   case 17:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = enlargeMemory() | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     continue;
    }
   case 18:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = ___syscall6(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 19:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _strcat(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 20:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _emscripten_asm_const_iii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 21:
    {
     HEAP32[sp - 4 >> 2] = pc;
     _emscripten_sleep(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 22:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _emscripten_asm_const_i(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 23:
    {
     HEAP32[sp - 4 >> 2] = pc;
     ___lock(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 24:
    {
     HEAP32[sp - 4 >> 2] = pc;
     ___unlock(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 25:
    {
     HEAP32[sp - 4 >> 2] = pc;
     nullFunc_iiii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 26:
    {
     HEAP32[sp - 4 >> 2] = pc;
     nullFunc_ii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   default:
    assert(0);
   }
   break;
  case 136:
   HEAP32[sp + (lx << 3) >> 2] = STACKTOP;
   break;
  case 137:
   STACKTOP = HEAP32[sp + (lx << 3) >> 2] | 0;
   break;
  case 138:
   lz = HEAP32[sp + (lz << 3) >> 2] | 0;
   lx = (HEAP32[sp + (lx << 3) >> 2] | 0) - (HEAP32[sp + (ly << 3) >> 2] | 0) >>> 0;
   if (lx >>> 0 >= lz >>> 0) {
    pc = pc + (lz << 2) | 0;
    continue;
   }
   pc = HEAP32[pc + 4 + (lx << 2) >> 2] | 0;
   pc = pc - 4 | 0;
   continue;
   break;
  case 139:
   EMTSTACKTOP = sp - 8 | 0;
   HEAP32[EMTSTACKTOP >> 2] = HEAP32[sp + (lx << 3) >> 2] | 0;
   HEAP32[EMTSTACKTOP + 4 >> 2] = HEAP32[sp + (lx << 3) + 4 >> 2] | 0;
   return;
   break;
  case 141:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[sp + (inst >>> 16 << 3) >> 2] | 0;
   break;
  case 142:
   HEAPF64[sp + (lx << 3) >> 3] = +HEAPF64[sp + (inst >>> 16 << 3) >> 3];
   break;
  case 143:
   HEAP32[sp + (inst >>> 16 << 3) >> 2] = HEAP32[sp + (lx << 3) >> 2] | 0;
   break;
  case 144:
   HEAPF64[sp + (inst >>> 16 << 3) >> 3] = +HEAPF64[sp + (lx << 3) >> 3];
   break;
  default:
   assert(0);
  }
 }
 assert(0);
}

function _free($0) {
 $0 = $0 | 0;
 var $$0195$i = 0, $$0195$in$i = 0, $$0348 = 0, $$0349 = 0, $$0361 = 0, $$0368 = 0, $$1 = 0, $$1347 = 0, $$1352 = 0, $$1355 = 0, $$1363 = 0, $$1367 = 0, $$2 = 0, $$3 = 0, $$3365 = 0, $$pre = 0, $$pre$phiZ2D = 0, $$sink3 = 0, $$sink5 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $cond374 = 0, $cond375 = 0, $not$ = 0, $not$370 = 0, label = 0, sp = 0;
 label = 0;
 sp = STACKTOP;
 $1 = ($0 | 0) == (0 | 0);
 asyncState ? abort(-12) | 0 : 0;
 if ($1) {
  return;
 }
 $2 = $0 + -8 | 0;
 $3 = HEAP32[6084 >> 2] | 0;
 $4 = $0 + -4 | 0;
 $5 = HEAP32[$4 >> 2] | 0;
 $6 = $5 & -8;
 $7 = $2 + $6 | 0;
 $8 = $5 & 1;
 $9 = ($8 | 0) == 0;
 do {
  if ($9) {
   $10 = HEAP32[$2 >> 2] | 0;
   $11 = $5 & 3;
   $12 = ($11 | 0) == 0;
   if ($12) {
    return;
   }
   $13 = 0 - $10 | 0;
   $14 = $2 + $13 | 0;
   $15 = $10 + $6 | 0;
   $16 = $14 >>> 0 < $3 >>> 0;
   if ($16) {
    return;
   }
   $17 = HEAP32[6088 >> 2] | 0;
   $18 = ($14 | 0) == ($17 | 0);
   if ($18) {
    $78 = $7 + 4 | 0;
    $79 = HEAP32[$78 >> 2] | 0;
    $80 = $79 & 3;
    $81 = ($80 | 0) == 3;
    if (!$81) {
     $$1 = $14;
     $$1347 = $15;
     $87 = $14;
     break;
    }
    $82 = $14 + $15 | 0;
    $83 = $14 + 4 | 0;
    $84 = $15 | 1;
    $85 = $79 & -2;
    HEAP32[6076 >> 2] = $15;
    HEAP32[$78 >> 2] = $85;
    HEAP32[$83 >> 2] = $84;
    HEAP32[$82 >> 2] = $15;
    return;
   }
   $19 = $10 >>> 3;
   $20 = $10 >>> 0 < 256;
   if ($20) {
    $21 = $14 + 8 | 0;
    $22 = HEAP32[$21 >> 2] | 0;
    $23 = $14 + 12 | 0;
    $24 = HEAP32[$23 >> 2] | 0;
    $25 = ($24 | 0) == ($22 | 0);
    if ($25) {
     $26 = 1 << $19;
     $27 = $26 ^ -1;
     $28 = HEAP32[1517] | 0;
     $29 = $28 & $27;
     HEAP32[1517] = $29;
     $$1 = $14;
     $$1347 = $15;
     $87 = $14;
     break;
    } else {
     $30 = $22 + 12 | 0;
     HEAP32[$30 >> 2] = $24;
     $31 = $24 + 8 | 0;
     HEAP32[$31 >> 2] = $22;
     $$1 = $14;
     $$1347 = $15;
     $87 = $14;
     break;
    }
   }
   $32 = $14 + 24 | 0;
   $33 = HEAP32[$32 >> 2] | 0;
   $34 = $14 + 12 | 0;
   $35 = HEAP32[$34 >> 2] | 0;
   $36 = ($35 | 0) == ($14 | 0);
   do {
    if ($36) {
     $41 = $14 + 16 | 0;
     $42 = $41 + 4 | 0;
     $43 = HEAP32[$42 >> 2] | 0;
     $44 = ($43 | 0) == (0 | 0);
     if ($44) {
      $45 = HEAP32[$41 >> 2] | 0;
      $46 = ($45 | 0) == (0 | 0);
      if ($46) {
       $$3 = 0;
       break;
      } else {
       $$1352 = $45;
       $$1355 = $41;
      }
     } else {
      $$1352 = $43;
      $$1355 = $42;
     }
     while (1) {
      $47 = $$1352 + 20 | 0;
      $48 = HEAP32[$47 >> 2] | 0;
      $49 = ($48 | 0) == (0 | 0);
      if (!$49) {
       $$1352 = $48;
       $$1355 = $47;
       continue;
      }
      $50 = $$1352 + 16 | 0;
      $51 = HEAP32[$50 >> 2] | 0;
      $52 = ($51 | 0) == (0 | 0);
      if ($52) {
       break;
      } else {
       $$1352 = $51;
       $$1355 = $50;
      }
     }
     HEAP32[$$1355 >> 2] = 0;
     $$3 = $$1352;
    } else {
     $37 = $14 + 8 | 0;
     $38 = HEAP32[$37 >> 2] | 0;
     $39 = $38 + 12 | 0;
     HEAP32[$39 >> 2] = $35;
     $40 = $35 + 8 | 0;
     HEAP32[$40 >> 2] = $38;
     $$3 = $35;
    }
   } while (0);
   $53 = ($33 | 0) == (0 | 0);
   if ($53) {
    $$1 = $14;
    $$1347 = $15;
    $87 = $14;
   } else {
    $54 = $14 + 28 | 0;
    $55 = HEAP32[$54 >> 2] | 0;
    $56 = 6372 + ($55 << 2) | 0;
    $57 = HEAP32[$56 >> 2] | 0;
    $58 = ($14 | 0) == ($57 | 0);
    if ($58) {
     HEAP32[$56 >> 2] = $$3;
     $cond374 = ($$3 | 0) == (0 | 0);
     if ($cond374) {
      $59 = 1 << $55;
      $60 = $59 ^ -1;
      $61 = HEAP32[6072 >> 2] | 0;
      $62 = $61 & $60;
      HEAP32[6072 >> 2] = $62;
      $$1 = $14;
      $$1347 = $15;
      $87 = $14;
      break;
     }
    } else {
     $63 = $33 + 16 | 0;
     $64 = HEAP32[$63 >> 2] | 0;
     $not$370 = ($64 | 0) != ($14 | 0);
     $$sink3 = $not$370 & 1;
     $65 = ($33 + 16 | 0) + ($$sink3 << 2) | 0;
     HEAP32[$65 >> 2] = $$3;
     $66 = ($$3 | 0) == (0 | 0);
     if ($66) {
      $$1 = $14;
      $$1347 = $15;
      $87 = $14;
      break;
     }
    }
    $67 = $$3 + 24 | 0;
    HEAP32[$67 >> 2] = $33;
    $68 = $14 + 16 | 0;
    $69 = HEAP32[$68 >> 2] | 0;
    $70 = ($69 | 0) == (0 | 0);
    if (!$70) {
     $71 = $$3 + 16 | 0;
     HEAP32[$71 >> 2] = $69;
     $72 = $69 + 24 | 0;
     HEAP32[$72 >> 2] = $$3;
    }
    $73 = $68 + 4 | 0;
    $74 = HEAP32[$73 >> 2] | 0;
    $75 = ($74 | 0) == (0 | 0);
    if ($75) {
     $$1 = $14;
     $$1347 = $15;
     $87 = $14;
    } else {
     $76 = $$3 + 20 | 0;
     HEAP32[$76 >> 2] = $74;
     $77 = $74 + 24 | 0;
     HEAP32[$77 >> 2] = $$3;
     $$1 = $14;
     $$1347 = $15;
     $87 = $14;
    }
   }
  } else {
   $$1 = $2;
   $$1347 = $6;
   $87 = $2;
  }
 } while (0);
 $86 = $87 >>> 0 < $7 >>> 0;
 if (!$86) {
  return;
 }
 $88 = $7 + 4 | 0;
 $89 = HEAP32[$88 >> 2] | 0;
 $90 = $89 & 1;
 $91 = ($90 | 0) == 0;
 if ($91) {
  return;
 }
 $92 = $89 & 2;
 $93 = ($92 | 0) == 0;
 if ($93) {
  $94 = HEAP32[6092 >> 2] | 0;
  $95 = ($7 | 0) == ($94 | 0);
  $96 = HEAP32[6088 >> 2] | 0;
  if ($95) {
   $97 = HEAP32[6080 >> 2] | 0;
   $98 = $97 + $$1347 | 0;
   HEAP32[6080 >> 2] = $98;
   HEAP32[6092 >> 2] = $$1;
   $99 = $98 | 1;
   $100 = $$1 + 4 | 0;
   HEAP32[$100 >> 2] = $99;
   $101 = ($$1 | 0) == ($96 | 0);
   if (!$101) {
    return;
   }
   HEAP32[6088 >> 2] = 0;
   HEAP32[6076 >> 2] = 0;
   return;
  }
  $102 = ($7 | 0) == ($96 | 0);
  if ($102) {
   $103 = HEAP32[6076 >> 2] | 0;
   $104 = $103 + $$1347 | 0;
   HEAP32[6076 >> 2] = $104;
   HEAP32[6088 >> 2] = $87;
   $105 = $104 | 1;
   $106 = $$1 + 4 | 0;
   HEAP32[$106 >> 2] = $105;
   $107 = $87 + $104 | 0;
   HEAP32[$107 >> 2] = $104;
   return;
  }
  $108 = $89 & -8;
  $109 = $108 + $$1347 | 0;
  $110 = $89 >>> 3;
  $111 = $89 >>> 0 < 256;
  do {
   if ($111) {
    $112 = $7 + 8 | 0;
    $113 = HEAP32[$112 >> 2] | 0;
    $114 = $7 + 12 | 0;
    $115 = HEAP32[$114 >> 2] | 0;
    $116 = ($115 | 0) == ($113 | 0);
    if ($116) {
     $117 = 1 << $110;
     $118 = $117 ^ -1;
     $119 = HEAP32[1517] | 0;
     $120 = $119 & $118;
     HEAP32[1517] = $120;
     break;
    } else {
     $121 = $113 + 12 | 0;
     HEAP32[$121 >> 2] = $115;
     $122 = $115 + 8 | 0;
     HEAP32[$122 >> 2] = $113;
     break;
    }
   } else {
    $123 = $7 + 24 | 0;
    $124 = HEAP32[$123 >> 2] | 0;
    $125 = $7 + 12 | 0;
    $126 = HEAP32[$125 >> 2] | 0;
    $127 = ($126 | 0) == ($7 | 0);
    do {
     if ($127) {
      $132 = $7 + 16 | 0;
      $133 = $132 + 4 | 0;
      $134 = HEAP32[$133 >> 2] | 0;
      $135 = ($134 | 0) == (0 | 0);
      if ($135) {
       $136 = HEAP32[$132 >> 2] | 0;
       $137 = ($136 | 0) == (0 | 0);
       if ($137) {
        $$3365 = 0;
        break;
       } else {
        $$1363 = $136;
        $$1367 = $132;
       }
      } else {
       $$1363 = $134;
       $$1367 = $133;
      }
      while (1) {
       $138 = $$1363 + 20 | 0;
       $139 = HEAP32[$138 >> 2] | 0;
       $140 = ($139 | 0) == (0 | 0);
       if (!$140) {
        $$1363 = $139;
        $$1367 = $138;
        continue;
       }
       $141 = $$1363 + 16 | 0;
       $142 = HEAP32[$141 >> 2] | 0;
       $143 = ($142 | 0) == (0 | 0);
       if ($143) {
        break;
       } else {
        $$1363 = $142;
        $$1367 = $141;
       }
      }
      HEAP32[$$1367 >> 2] = 0;
      $$3365 = $$1363;
     } else {
      $128 = $7 + 8 | 0;
      $129 = HEAP32[$128 >> 2] | 0;
      $130 = $129 + 12 | 0;
      HEAP32[$130 >> 2] = $126;
      $131 = $126 + 8 | 0;
      HEAP32[$131 >> 2] = $129;
      $$3365 = $126;
     }
    } while (0);
    $144 = ($124 | 0) == (0 | 0);
    if (!$144) {
     $145 = $7 + 28 | 0;
     $146 = HEAP32[$145 >> 2] | 0;
     $147 = 6372 + ($146 << 2) | 0;
     $148 = HEAP32[$147 >> 2] | 0;
     $149 = ($7 | 0) == ($148 | 0);
     if ($149) {
      HEAP32[$147 >> 2] = $$3365;
      $cond375 = ($$3365 | 0) == (0 | 0);
      if ($cond375) {
       $150 = 1 << $146;
       $151 = $150 ^ -1;
       $152 = HEAP32[6072 >> 2] | 0;
       $153 = $152 & $151;
       HEAP32[6072 >> 2] = $153;
       break;
      }
     } else {
      $154 = $124 + 16 | 0;
      $155 = HEAP32[$154 >> 2] | 0;
      $not$ = ($155 | 0) != ($7 | 0);
      $$sink5 = $not$ & 1;
      $156 = ($124 + 16 | 0) + ($$sink5 << 2) | 0;
      HEAP32[$156 >> 2] = $$3365;
      $157 = ($$3365 | 0) == (0 | 0);
      if ($157) {
       break;
      }
     }
     $158 = $$3365 + 24 | 0;
     HEAP32[$158 >> 2] = $124;
     $159 = $7 + 16 | 0;
     $160 = HEAP32[$159 >> 2] | 0;
     $161 = ($160 | 0) == (0 | 0);
     if (!$161) {
      $162 = $$3365 + 16 | 0;
      HEAP32[$162 >> 2] = $160;
      $163 = $160 + 24 | 0;
      HEAP32[$163 >> 2] = $$3365;
     }
     $164 = $159 + 4 | 0;
     $165 = HEAP32[$164 >> 2] | 0;
     $166 = ($165 | 0) == (0 | 0);
     if (!$166) {
      $167 = $$3365 + 20 | 0;
      HEAP32[$167 >> 2] = $165;
      $168 = $165 + 24 | 0;
      HEAP32[$168 >> 2] = $$3365;
     }
    }
   }
  } while (0);
  $169 = $109 | 1;
  $170 = $$1 + 4 | 0;
  HEAP32[$170 >> 2] = $169;
  $171 = $87 + $109 | 0;
  HEAP32[$171 >> 2] = $109;
  $172 = HEAP32[6088 >> 2] | 0;
  $173 = ($$1 | 0) == ($172 | 0);
  if ($173) {
   HEAP32[6076 >> 2] = $109;
   return;
  } else {
   $$2 = $109;
  }
 } else {
  $174 = $89 & -2;
  HEAP32[$88 >> 2] = $174;
  $175 = $$1347 | 1;
  $176 = $$1 + 4 | 0;
  HEAP32[$176 >> 2] = $175;
  $177 = $87 + $$1347 | 0;
  HEAP32[$177 >> 2] = $$1347;
  $$2 = $$1347;
 }
 $178 = $$2 >>> 3;
 $179 = $$2 >>> 0 < 256;
 if ($179) {
  $180 = $178 << 1;
  $181 = 6108 + ($180 << 2) | 0;
  $182 = HEAP32[1517] | 0;
  $183 = 1 << $178;
  $184 = $182 & $183;
  $185 = ($184 | 0) == 0;
  if ($185) {
   $186 = $182 | $183;
   HEAP32[1517] = $186;
   $$pre = $181 + 8 | 0;
   $$0368 = $181;
   $$pre$phiZ2D = $$pre;
  } else {
   $187 = $181 + 8 | 0;
   $188 = HEAP32[$187 >> 2] | 0;
   $$0368 = $188;
   $$pre$phiZ2D = $187;
  }
  HEAP32[$$pre$phiZ2D >> 2] = $$1;
  $189 = $$0368 + 12 | 0;
  HEAP32[$189 >> 2] = $$1;
  $190 = $$1 + 8 | 0;
  HEAP32[$190 >> 2] = $$0368;
  $191 = $$1 + 12 | 0;
  HEAP32[$191 >> 2] = $181;
  return;
 }
 $192 = $$2 >>> 8;
 $193 = ($192 | 0) == 0;
 if ($193) {
  $$0361 = 0;
 } else {
  $194 = $$2 >>> 0 > 16777215;
  if ($194) {
   $$0361 = 31;
  } else {
   $195 = $192 + 1048320 | 0;
   $196 = $195 >>> 16;
   $197 = $196 & 8;
   $198 = $192 << $197;
   $199 = $198 + 520192 | 0;
   $200 = $199 >>> 16;
   $201 = $200 & 4;
   $202 = $201 | $197;
   $203 = $198 << $201;
   $204 = $203 + 245760 | 0;
   $205 = $204 >>> 16;
   $206 = $205 & 2;
   $207 = $202 | $206;
   $208 = 14 - $207 | 0;
   $209 = $203 << $206;
   $210 = $209 >>> 15;
   $211 = $208 + $210 | 0;
   $212 = $211 << 1;
   $213 = $211 + 7 | 0;
   $214 = $$2 >>> $213;
   $215 = $214 & 1;
   $216 = $215 | $212;
   $$0361 = $216;
  }
 }
 $217 = 6372 + ($$0361 << 2) | 0;
 $218 = $$1 + 28 | 0;
 HEAP32[$218 >> 2] = $$0361;
 $219 = $$1 + 16 | 0;
 $220 = $$1 + 20 | 0;
 HEAP32[$220 >> 2] = 0;
 HEAP32[$219 >> 2] = 0;
 $221 = HEAP32[6072 >> 2] | 0;
 $222 = 1 << $$0361;
 $223 = $221 & $222;
 $224 = ($223 | 0) == 0;
 do {
  if ($224) {
   $225 = $221 | $222;
   HEAP32[6072 >> 2] = $225;
   HEAP32[$217 >> 2] = $$1;
   $226 = $$1 + 24 | 0;
   HEAP32[$226 >> 2] = $217;
   $227 = $$1 + 12 | 0;
   HEAP32[$227 >> 2] = $$1;
   $228 = $$1 + 8 | 0;
   HEAP32[$228 >> 2] = $$1;
  } else {
   $229 = HEAP32[$217 >> 2] | 0;
   $230 = ($$0361 | 0) == 31;
   $231 = $$0361 >>> 1;
   $232 = 25 - $231 | 0;
   $233 = $230 ? 0 : $232;
   $234 = $$2 << $233;
   $$0348 = $234;
   $$0349 = $229;
   while (1) {
    $235 = $$0349 + 4 | 0;
    $236 = HEAP32[$235 >> 2] | 0;
    $237 = $236 & -8;
    $238 = ($237 | 0) == ($$2 | 0);
    if ($238) {
     label = 73;
     break;
    }
    $239 = $$0348 >>> 31;
    $240 = ($$0349 + 16 | 0) + ($239 << 2) | 0;
    $241 = $$0348 << 1;
    $242 = HEAP32[$240 >> 2] | 0;
    $243 = ($242 | 0) == (0 | 0);
    if ($243) {
     label = 72;
     break;
    } else {
     $$0348 = $241;
     $$0349 = $242;
    }
   }
   if ((label | 0) == 72) {
    HEAP32[$240 >> 2] = $$1;
    $244 = $$1 + 24 | 0;
    HEAP32[$244 >> 2] = $$0349;
    $245 = $$1 + 12 | 0;
    HEAP32[$245 >> 2] = $$1;
    $246 = $$1 + 8 | 0;
    HEAP32[$246 >> 2] = $$1;
    break;
   } else if ((label | 0) == 73) {
    $247 = $$0349 + 8 | 0;
    $248 = HEAP32[$247 >> 2] | 0;
    $249 = $248 + 12 | 0;
    HEAP32[$249 >> 2] = $$1;
    HEAP32[$247 >> 2] = $$1;
    $250 = $$1 + 8 | 0;
    HEAP32[$250 >> 2] = $248;
    $251 = $$1 + 12 | 0;
    HEAP32[$251 >> 2] = $$0349;
    $252 = $$1 + 24 | 0;
    HEAP32[$252 >> 2] = 0;
    break;
   }
  }
 } while (0);
 $253 = HEAP32[6100 >> 2] | 0;
 $254 = $253 + -1 | 0;
 HEAP32[6100 >> 2] = $254;
 $255 = ($254 | 0) == 0;
 if ($255) {
  $$0195$in$i = 6524;
 } else {
  return;
 }
 while (1) {
  $$0195$i = HEAP32[$$0195$in$i >> 2] | 0;
  $256 = ($$0195$i | 0) == (0 | 0);
  $257 = $$0195$i + 8 | 0;
  if ($256) {
   break;
  } else {
   $$0195$in$i = $257;
  }
 }
 HEAP32[6100 >> 2] = -1;
 return;
}

function _memcpy(dest, src, num) {
 dest = dest | 0;
 src = src | 0;
 num = num | 0;
 var ret = 0, aligned_dest_end = 0, block_aligned_dest_end = 0, dest_end = 0;
 if ((num | 0) >= 8192) {
  return _emscripten_memcpy_big(dest | 0, src | 0, num | 0) | 0;
 }
 ret = dest | 0;
 dest_end = dest + num | 0;
 if ((dest & 3) == (src & 3)) {
  while (dest & 3) {
   if ((num | 0) == 0) return ret | 0;
   HEAP8[dest >> 0] = HEAP8[src >> 0] | 0;
   dest = dest + 1 | 0;
   src = src + 1 | 0;
   num = num - 1 | 0;
  }
  aligned_dest_end = dest_end & -4 | 0;
  block_aligned_dest_end = aligned_dest_end - 64 | 0;
  while ((dest | 0) <= (block_aligned_dest_end | 0)) {
   HEAP32[dest >> 2] = HEAP32[src >> 2] | 0;
   HEAP32[dest + 4 >> 2] = HEAP32[src + 4 >> 2] | 0;
   HEAP32[dest + 8 >> 2] = HEAP32[src + 8 >> 2] | 0;
   HEAP32[dest + 12 >> 2] = HEAP32[src + 12 >> 2] | 0;
   HEAP32[dest + 16 >> 2] = HEAP32[src + 16 >> 2] | 0;
   HEAP32[dest + 20 >> 2] = HEAP32[src + 20 >> 2] | 0;
   HEAP32[dest + 24 >> 2] = HEAP32[src + 24 >> 2] | 0;
   HEAP32[dest + 28 >> 2] = HEAP32[src + 28 >> 2] | 0;
   HEAP32[dest + 32 >> 2] = HEAP32[src + 32 >> 2] | 0;
   HEAP32[dest + 36 >> 2] = HEAP32[src + 36 >> 2] | 0;
   HEAP32[dest + 40 >> 2] = HEAP32[src + 40 >> 2] | 0;
   HEAP32[dest + 44 >> 2] = HEAP32[src + 44 >> 2] | 0;
   HEAP32[dest + 48 >> 2] = HEAP32[src + 48 >> 2] | 0;
   HEAP32[dest + 52 >> 2] = HEAP32[src + 52 >> 2] | 0;
   HEAP32[dest + 56 >> 2] = HEAP32[src + 56 >> 2] | 0;
   HEAP32[dest + 60 >> 2] = HEAP32[src + 60 >> 2] | 0;
   dest = dest + 64 | 0;
   src = src + 64 | 0;
  }
  while ((dest | 0) < (aligned_dest_end | 0)) {
   HEAP32[dest >> 2] = HEAP32[src >> 2] | 0;
   dest = dest + 4 | 0;
   src = src + 4 | 0;
  }
 } else {
  aligned_dest_end = dest_end - 4 | 0;
  while ((dest | 0) < (aligned_dest_end | 0)) {
   HEAP8[dest >> 0] = HEAP8[src >> 0] | 0;
   HEAP8[dest + 1 >> 0] = HEAP8[src + 1 >> 0] | 0;
   HEAP8[dest + 2 >> 0] = HEAP8[src + 2 >> 0] | 0;
   HEAP8[dest + 3 >> 0] = HEAP8[src + 3 >> 0] | 0;
   dest = dest + 4 | 0;
   src = src + 4 | 0;
  }
 }
 while ((dest | 0) < (dest_end | 0)) {
  HEAP8[dest >> 0] = HEAP8[src >> 0] | 0;
  dest = dest + 1 | 0;
  src = src + 1 | 0;
 }
 return ret | 0;
}

function _strlen($0) {
 $0 = $0 | 0;
 var $$0 = 0, $$015$lcssa = 0, $$01519 = 0, $$1$lcssa = 0, $$pn = 0, $$pre = 0, $$sink = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 label = 0;
 sp = STACKTOP;
 $1 = $0;
 $2 = $1 & 3;
 $3 = ($2 | 0) == 0;
 L1 : do {
  if ($3) {
   $$015$lcssa = $0;
   label = 4;
  } else {
   $$01519 = $0;
   $23 = $1;
   while (1) {
    $4 = HEAP8[$$01519 >> 0] | 0;
    $5 = $4 << 24 >> 24 == 0;
    if ($5) {
     $$sink = $23;
     break L1;
    }
    $6 = $$01519 + 1 | 0;
    $7 = $6;
    $8 = $7 & 3;
    $9 = ($8 | 0) == 0;
    if ($9) {
     $$015$lcssa = $6;
     label = 4;
     break;
    } else {
     $$01519 = $6;
     $23 = $7;
    }
   }
  }
 } while (0);
 if ((label | 0) == 4) {
  $$0 = $$015$lcssa;
  while (1) {
   $10 = HEAP32[$$0 >> 2] | 0;
   $11 = $10 + -16843009 | 0;
   $12 = $10 & -2139062144;
   $13 = $12 ^ -2139062144;
   $14 = $13 & $11;
   $15 = ($14 | 0) == 0;
   $16 = $$0 + 4 | 0;
   if ($15) {
    $$0 = $16;
   } else {
    break;
   }
  }
  $17 = $10 & 255;
  $18 = $17 << 24 >> 24 == 0;
  if ($18) {
   $$1$lcssa = $$0;
  } else {
   $$pn = $$0;
   while (1) {
    $19 = $$pn + 1 | 0;
    $$pre = HEAP8[$19 >> 0] | 0;
    $20 = $$pre << 24 >> 24 == 0;
    if ($20) {
     $$1$lcssa = $19;
     break;
    } else {
     $$pn = $19;
    }
   }
  }
  $21 = $$1$lcssa;
  $$sink = $21;
 }
 $22 = $$sink - $1 | 0;
 return $22 | 0;
}

function _memset(ptr, value, num) {
 ptr = ptr | 0;
 value = value | 0;
 num = num | 0;
 var end = 0, aligned_end = 0, block_aligned_end = 0, value4 = 0;
 end = ptr + num | 0;
 value = value & 255;
 if ((num | 0) >= 67) {
  while ((ptr & 3) != 0) {
   HEAP8[ptr >> 0] = value;
   ptr = ptr + 1 | 0;
  }
  aligned_end = end & -4 | 0;
  block_aligned_end = aligned_end - 64 | 0;
  value4 = value | value << 8 | value << 16 | value << 24;
  while ((ptr | 0) <= (block_aligned_end | 0)) {
   HEAP32[ptr >> 2] = value4;
   HEAP32[ptr + 4 >> 2] = value4;
   HEAP32[ptr + 8 >> 2] = value4;
   HEAP32[ptr + 12 >> 2] = value4;
   HEAP32[ptr + 16 >> 2] = value4;
   HEAP32[ptr + 20 >> 2] = value4;
   HEAP32[ptr + 24 >> 2] = value4;
   HEAP32[ptr + 28 >> 2] = value4;
   HEAP32[ptr + 32 >> 2] = value4;
   HEAP32[ptr + 36 >> 2] = value4;
   HEAP32[ptr + 40 >> 2] = value4;
   HEAP32[ptr + 44 >> 2] = value4;
   HEAP32[ptr + 48 >> 2] = value4;
   HEAP32[ptr + 52 >> 2] = value4;
   HEAP32[ptr + 56 >> 2] = value4;
   HEAP32[ptr + 60 >> 2] = value4;
   ptr = ptr + 64 | 0;
  }
  while ((ptr | 0) < (aligned_end | 0)) {
   HEAP32[ptr >> 2] = value4;
   ptr = ptr + 4 | 0;
  }
 }
 while ((ptr | 0) < (end | 0)) {
  HEAP8[ptr >> 0] = value;
  ptr = ptr + 1 | 0;
 }
 return end - num | 0;
}

function ___uremdi3($a$0, $a$1, $b$0, $b$1) {
 $a$0 = $a$0 | 0;
 $a$1 = $a$1 | 0;
 $b$0 = $b$0 | 0;
 $b$1 = $b$1 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $a$0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $a$1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $b$0;
  HEAP32[EMTSTACKTOP + 32 >> 2] = $b$1;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 57252 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function ___udivdi3($a$0, $a$1, $b$0, $b$1) {
 $a$0 = $a$0 | 0;
 $a$1 = $a$1 | 0;
 $b$0 = $b$0 | 0;
 $b$1 = $b$1 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $a$0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $a$1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $b$0;
  HEAP32[EMTSTACKTOP + 32 >> 2] = $b$1;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 59180 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function runPostSets() {}
function _i64Subtract(a, b, c, d) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 d = d | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = a;
  HEAP32[EMTSTACKTOP + 16 >> 2] = b;
  HEAP32[EMTSTACKTOP + 24 >> 2] = c;
  HEAP32[EMTSTACKTOP + 32 >> 2] = d;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 59040 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function _i64Add(a, b, c, d) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 d = d | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = a;
  HEAP32[EMTSTACKTOP + 16 >> 2] = b;
  HEAP32[EMTSTACKTOP + 24 >> 2] = c;
  HEAP32[EMTSTACKTOP + 32 >> 2] = d;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 59212 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function ___stdout_write($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 51372 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function ___stdio_write($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 25888 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function _bitshift64Shl(low, high, bits) {
 low = low | 0;
 high = high | 0;
 bits = bits | 0;
 var ander = 0;
 asyncState ? abort(-12) | 0 : 0;
 if ((bits | 0) < 32) {
  ander = (1 << bits) - 1 | 0;
  tempRet0 = high << bits | (low & ander << 32 - bits) >>> 32 - bits;
  return low << bits;
 }
 tempRet0 = low << bits - 32;
 return 0;
}

function ___stdio_seek($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 50916 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function _sn_write($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 55672 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function _bitshift64Lshr(low, high, bits) {
 low = low | 0;
 high = high | 0;
 bits = bits | 0;
 var ander = 0;
 asyncState ? abort(-12) | 0 : 0;
 if ((bits | 0) < 32) {
  ander = (1 << bits) - 1 | 0;
  tempRet0 = high >>> bits;
  return low >>> bits | (high & ander) << 32 - bits;
 }
 tempRet0 = 0;
 return high >>> bits - 32 | 0;
}

function b1(p0, p1, p2) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = p0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = p1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = p2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 60236 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function establishStackSpace(stackBase, stackMax) {
 stackBase = stackBase | 0;
 stackMax = stackMax | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = stackBase;
  HEAP32[EMTSTACKTOP + 16 >> 2] = stackMax;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 59440 | 0);
}

function ___stpcpy($0, $1) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 28796 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function _sbrk(increment) {
 increment = increment | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = increment;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 53996 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function stackAlloc(size) {
 size = size | 0;
 var ret = 0;
 ret = STACKTOP;
 STACKTOP = STACKTOP + size | 0;
 STACKTOP = STACKTOP + 15 & -16;
 if ((STACKTOP | 0) >= (STACK_MAX | 0)) abortStackOverflow(size | 0);
 return ret | 0;
}

function ___stdio_close($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 55752 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function _llvm_bswap_i32(x) {
 x = x | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = x;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 59848 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function _fflush($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 32528 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function b0(p0) {
 p0 = p0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = p0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 60316 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function _strcat($0, $1) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 var $2 = 0, $3 = 0, label = 0, sp = 0;
 label = 0;
 sp = STACKTOP;
 $2 = _strlen($0) | 0;
 $3 = $0 + $2 | 0;
 _strcpy($3, $1) | 0;
 return $0 | 0;
}

function _emscripten_get_global_libc() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 6e4 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function ___errno_location() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 59364 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function dynCall_iiii(index, a1, a2, a3) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 return FUNCTION_TABLE_iiii[index & 7](a1 | 0, a2 | 0, a3 | 0) | 0;
}

function __GLOBAL__sub_I_simulateur_cpp() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 59400 | 0);
}

function setThrew(threw, value) {
 threw = threw | 0;
 value = value | 0;
 if ((__THREW__ | 0) == 0) {
  __THREW__ = threw;
  threwValue = value;
 }
}

function _strcpy($0, $1) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 var label = 0, sp = 0;
 label = 0;
 sp = STACKTOP;
 ___stpcpy($0, $1) | 0;
 return $0 | 0;
}

function _match_pr() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 24300 | 0);
}

function _match_gr() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 20592 | 0);
}

function _pr_init() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 56840 | 0);
}

function _gr_init() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 55452 | 0);
}

function dynCall_ii(index, a1) {
 index = index | 0;
 a1 = a1 | 0;
 return FUNCTION_TABLE_ii[index & 1](a1 | 0) | 0;
}

function emtStackSave() {
 asyncState ? abort(-12) | 0 : 0;
 return EMTSTACKTOP | 0;
}

function getTempRet0() {
 asyncState ? abort(-12) | 0 : 0;
 return tempRet0 | 0;
}

function setTempRet0(value) {
 value = value | 0;
 tempRet0 = value;
}

function stackRestore(top) {
 top = top | 0;
 STACKTOP = top;
}

function emtStackRestore(x) {
 x = x | 0;
 EMTSTACKTOP = x;
}

function setAsyncState(x) {
 x = x | 0;
 asyncState = x;
}

function stackSave() {
 return STACKTOP | 0;
}

// EMSCRIPTEN_END_FUNCS

var FUNCTION_TABLE_ii = [b0,___stdio_close];
var FUNCTION_TABLE_iiii = [b1,b1,___stdout_write,___stdio_seek,_sn_write,___stdio_write,b1,b1];

  return { _llvm_bswap_i32: _llvm_bswap_i32, stackSave: stackSave, getTempRet0: getTempRet0, ___udivdi3: ___udivdi3, setThrew: setThrew, _bitshift64Lshr: _bitshift64Lshr, _i64Subtract: _i64Subtract, _bitshift64Shl: _bitshift64Shl, _fflush: _fflush, _memset: _memset, emterpret: emterpret, _sbrk: _sbrk, _memcpy: _memcpy, stackAlloc: stackAlloc, _match_gr: _match_gr, ___uremdi3: ___uremdi3, emtStackSave: emtStackSave, _pr_init: _pr_init, _match_pr: _match_pr, setTempRet0: setTempRet0, _i64Add: _i64Add, __GLOBAL__sub_I_simulateur_cpp: __GLOBAL__sub_I_simulateur_cpp, dynCall_iiii: dynCall_iiii, _emscripten_get_global_libc: _emscripten_get_global_libc, emtStackRestore: emtStackRestore, dynCall_ii: dynCall_ii, _gr_init: _gr_init, ___errno_location: ___errno_location, _free: _free, runPostSets: runPostSets, establishStackSpace: establishStackSpace, stackRestore: stackRestore, _malloc: _malloc, setAsyncState: setAsyncState };
})
// EMSCRIPTEN_END_ASM
(Module.asmGlobalArg, Module.asmLibraryArg, buffer);
var real__llvm_bswap_i32 = asm["_llvm_bswap_i32"];
asm["_llvm_bswap_i32"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__llvm_bswap_i32.apply(null, arguments);
});
var real_stackSave = asm["stackSave"];
asm["stackSave"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real_stackSave.apply(null, arguments);
});
var real__i64Subtract = asm["_i64Subtract"];
asm["_i64Subtract"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__i64Subtract.apply(null, arguments);
});
var real____udivdi3 = asm["___udivdi3"];
asm["___udivdi3"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real____udivdi3.apply(null, arguments);
});
var real_getTempRet0 = asm["getTempRet0"];
asm["getTempRet0"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real_getTempRet0.apply(null, arguments);
});
var real__bitshift64Lshr = asm["_bitshift64Lshr"];
asm["_bitshift64Lshr"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__bitshift64Lshr.apply(null, arguments);
});
var real__bitshift64Shl = asm["_bitshift64Shl"];
asm["_bitshift64Shl"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__bitshift64Shl.apply(null, arguments);
});
var real__fflush = asm["_fflush"];
asm["_fflush"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__fflush.apply(null, arguments);
});
var real__sbrk = asm["_sbrk"];
asm["_sbrk"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__sbrk.apply(null, arguments);
});
var real_stackAlloc = asm["stackAlloc"];
asm["stackAlloc"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real_stackAlloc.apply(null, arguments);
});
var real__match_gr = asm["_match_gr"];
asm["_match_gr"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__match_gr.apply(null, arguments);
});
var real____uremdi3 = asm["___uremdi3"];
asm["___uremdi3"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real____uremdi3.apply(null, arguments);
});
var real__pr_init = asm["_pr_init"];
asm["_pr_init"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__pr_init.apply(null, arguments);
});
var real__match_pr = asm["_match_pr"];
asm["_match_pr"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__match_pr.apply(null, arguments);
});
var real_setTempRet0 = asm["setTempRet0"];
asm["setTempRet0"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real_setTempRet0.apply(null, arguments);
});
var real__i64Add = asm["_i64Add"];
asm["_i64Add"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__i64Add.apply(null, arguments);
});
var real___GLOBAL__sub_I_simulateur_cpp = asm["__GLOBAL__sub_I_simulateur_cpp"];
asm["__GLOBAL__sub_I_simulateur_cpp"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real___GLOBAL__sub_I_simulateur_cpp.apply(null, arguments);
});
var real__emscripten_get_global_libc = asm["_emscripten_get_global_libc"];
asm["_emscripten_get_global_libc"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__emscripten_get_global_libc.apply(null, arguments);
});
var real__gr_init = asm["_gr_init"];
asm["_gr_init"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__gr_init.apply(null, arguments);
});
var real____errno_location = asm["___errno_location"];
asm["___errno_location"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real____errno_location.apply(null, arguments);
});
var real__free = asm["_free"];
asm["_free"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__free.apply(null, arguments);
});
var real_setThrew = asm["setThrew"];
asm["setThrew"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real_setThrew.apply(null, arguments);
});
var real_establishStackSpace = asm["establishStackSpace"];
asm["establishStackSpace"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real_establishStackSpace.apply(null, arguments);
});
var real_stackRestore = asm["stackRestore"];
asm["stackRestore"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real_stackRestore.apply(null, arguments);
});
var real__malloc = asm["_malloc"];
asm["_malloc"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__malloc.apply(null, arguments);
});
var _llvm_bswap_i32 = Module["_llvm_bswap_i32"] = asm["_llvm_bswap_i32"];
var stackSave = Module["stackSave"] = asm["stackSave"];
var _i64Subtract = Module["_i64Subtract"] = asm["_i64Subtract"];
var ___udivdi3 = Module["___udivdi3"] = asm["___udivdi3"];
var getTempRet0 = Module["getTempRet0"] = asm["getTempRet0"];
var _bitshift64Lshr = Module["_bitshift64Lshr"] = asm["_bitshift64Lshr"];
var _bitshift64Shl = Module["_bitshift64Shl"] = asm["_bitshift64Shl"];
var _fflush = Module["_fflush"] = asm["_fflush"];
var _memset = Module["_memset"] = asm["_memset"];
var _sbrk = Module["_sbrk"] = asm["_sbrk"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var stackAlloc = Module["stackAlloc"] = asm["stackAlloc"];
var _match_gr = Module["_match_gr"] = asm["_match_gr"];
var ___uremdi3 = Module["___uremdi3"] = asm["___uremdi3"];
var _pr_init = Module["_pr_init"] = asm["_pr_init"];
var _match_pr = Module["_match_pr"] = asm["_match_pr"];
var setTempRet0 = Module["setTempRet0"] = asm["setTempRet0"];
var _i64Add = Module["_i64Add"] = asm["_i64Add"];
var __GLOBAL__sub_I_simulateur_cpp = Module["__GLOBAL__sub_I_simulateur_cpp"] = asm["__GLOBAL__sub_I_simulateur_cpp"];
var _emscripten_get_global_libc = Module["_emscripten_get_global_libc"] = asm["_emscripten_get_global_libc"];
var _gr_init = Module["_gr_init"] = asm["_gr_init"];
var ___errno_location = Module["___errno_location"] = asm["___errno_location"];
var _free = Module["_free"] = asm["_free"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var setThrew = Module["setThrew"] = asm["setThrew"];
var establishStackSpace = Module["establishStackSpace"] = asm["establishStackSpace"];
var stackRestore = Module["stackRestore"] = asm["stackRestore"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
Runtime.stackAlloc = Module["stackAlloc"];
Runtime.stackSave = Module["stackSave"];
Runtime.stackRestore = Module["stackRestore"];
Runtime.establishStackSpace = Module["establishStackSpace"];
Runtime.setTempRet0 = Module["setTempRet0"];
Runtime.getTempRet0 = Module["getTempRet0"];
Module["asm"] = asm;
function ExitStatus(status) {
 this.name = "ExitStatus";
 this.message = "Program terminated with exit(" + status + ")";
 this.status = status;
}
ExitStatus.prototype = new Error;
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var preloadStartTime = null;
var calledMain = false;
dependenciesFulfilled = function runCaller() {
 if (!Module["calledRun"]) run();
 if (!Module["calledRun"]) dependenciesFulfilled = runCaller;
};
Module["callMain"] = Module.callMain = function callMain(args) {
 assert(runDependencies == 0, "cannot call main when async dependencies remain! (listen on __ATMAIN__)");
 assert(__ATPRERUN__.length == 0, "cannot call main when preRun functions remain to be called");
 args = args || [];
 ensureInitRuntime();
 var argc = args.length + 1;
 function pad() {
  for (var i = 0; i < 4 - 1; i++) {
   argv.push(0);
  }
 }
 var argv = [ allocate(intArrayFromString(Module["thisProgram"]), "i8", ALLOC_NORMAL) ];
 pad();
 for (var i = 0; i < argc - 1; i = i + 1) {
  argv.push(allocate(intArrayFromString(args[i]), "i8", ALLOC_NORMAL));
  pad();
 }
 argv.push(0);
 argv = allocate(argv, "i32", ALLOC_NORMAL);
 var initialEmtStackTop = Module["asm"].emtStackSave();
 try {
  var ret = Module["_main"](argc, argv, 0);
  exit(ret, true);
 } catch (e) {
  if (e instanceof ExitStatus) {
   return;
  } else if (e == "SimulateInfiniteLoop") {
   Module["noExitRuntime"] = true;
   Module["asm"].emtStackRestore(initialEmtStackTop);
   return;
  } else {
   var toLog = e;
   if (e && typeof e === "object" && e.stack) {
    toLog = [ e, e.stack ];
   }
   Module.printErr("exception thrown: " + toLog);
   Module["quit"](1, e);
  }
 } finally {
  calledMain = true;
 }
};
function run(args) {
 args = args || Module["arguments"];
 if (preloadStartTime === null) preloadStartTime = Date.now();
 if (runDependencies > 0) {
  return;
 }
 writeStackCookie();
 preRun();
 if (runDependencies > 0) return;
 if (Module["calledRun"]) return;
 function doRun() {
  if (Module["calledRun"]) return;
  Module["calledRun"] = true;
  if (ABORT) return;
  ensureInitRuntime();
  preMain();
  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
   Module.printErr("pre-main prep time: " + (Date.now() - preloadStartTime) + " ms");
  }
  if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
  if (Module["_main"] && shouldRunNow) Module["callMain"](args);
  postRun();
 }
 if (Module["setStatus"]) {
  Module["setStatus"]("Running...");
  setTimeout((function() {
   setTimeout((function() {
    Module["setStatus"]("");
   }), 1);
   doRun();
  }), 1);
 } else {
  doRun();
 }
 checkStackCookie();
}
Module["run"] = Module.run = run;
function exit(status, implicit) {
 if (implicit && Module["noExitRuntime"]) {
  Module.printErr("exit(" + status + ") implicitly called by end of main(), but noExitRuntime, so not exiting the runtime (you can use emscripten_force_exit, if you want to force a true shutdown)");
  return;
 }
 if (Module["noExitRuntime"]) {
  Module.printErr("exit(" + status + ") called, but noExitRuntime, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)");
 } else {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;
  exitRuntime();
  if (Module["onExit"]) Module["onExit"](status);
 }
 if (ENVIRONMENT_IS_NODE) {
  process["exit"](status);
 }
 Module["quit"](status, new ExitStatus(status));
}
Module["exit"] = Module.exit = exit;
var abortDecorators = [];
function abort(what) {
 if (Module["onAbort"]) {
  Module["onAbort"](what);
 }
 if (what !== undefined) {
  Module.print(what);
  Module.printErr(what);
  what = JSON.stringify(what);
 } else {
  what = "";
 }
 ABORT = true;
 EXITSTATUS = 1;
 var extra = "";
 var output = "abort(" + what + ") at " + stackTrace() + extra;
 if (abortDecorators) {
  abortDecorators.forEach((function(decorator) {
   output = decorator(output, what);
  }));
 }
 throw output;
}
Module["abort"] = Module.abort = abort;
if (Module["preInit"]) {
 if (typeof Module["preInit"] == "function") Module["preInit"] = [ Module["preInit"] ];
 while (Module["preInit"].length > 0) {
  Module["preInit"].pop()();
 }
}
var shouldRunNow = true;
if (Module["noInitialRun"]) {
 shouldRunNow = false;
}
run();

