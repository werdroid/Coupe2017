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
}), (function($0, $1) {
 var ptr = $0;
 var size = $1;
 var buffer = Module.HEAPU8.buffer.slice(ptr, ptr + size);
 traiterTrameMonitor(buffer);
}) ];
function _emscripten_asm_const_i(code) {
 return ASM_CONSTS[code]();
}
function _emscripten_asm_const_iii(code, a0, a1) {
 return ASM_CONSTS[code](a0, a1);
}
STATIC_BASE = Runtime.GLOBAL_BASE;
STATICTOP = STATIC_BASE + 7360;
__ATINIT__.push({
 func: (function() {
  __GLOBAL__sub_I_simulateur_cpp();
 })
});
allocate([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 60, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 190, 24, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 252, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 123, 114, 101, 116, 117, 114, 110, 32, 43, 110, 101, 119, 32, 68, 97, 116, 101, 125, 0, 69, 67, 82, 65, 78, 58, 32, 37, 115, 0, 123, 32, 116, 114, 97, 105, 116, 101, 114, 77, 101, 115, 115, 97, 103, 101, 40, 36, 48, 32, 63, 32, 48, 32, 58, 32, 49, 44, 32, 80, 111, 105, 110, 116, 101, 114, 95, 115, 116, 114, 105, 110, 103, 105, 102, 121, 40, 36, 49, 41, 41, 59, 125, 0, 10, 0, 123, 32, 118, 97, 114, 32, 112, 116, 114, 32, 61, 32, 36, 48, 59, 32, 118, 97, 114, 32, 115, 105, 122, 101, 32, 61, 32, 36, 49, 59, 32, 118, 97, 114, 32, 98, 117, 102, 102, 101, 114, 32, 61, 32, 77, 111, 100, 117, 108, 101, 46, 72, 69, 65, 80, 85, 56, 46, 98, 117, 102, 102, 101, 114, 46, 115, 108, 105, 99, 101, 40, 112, 116, 114, 44, 32, 112, 116, 114, 32, 43, 32, 115, 105, 122, 101, 41, 59, 32, 116, 114, 97, 105, 116, 101, 114, 84, 114, 97, 109, 101, 77, 111, 110, 105, 116, 111, 114, 40, 98, 117, 102, 102, 101, 114, 41, 59, 32, 125, 0, 83, 73, 77, 85, 58, 32, 109, 117, 115, 105, 113, 117, 101, 32, 97, 108, 101, 114, 116, 0, 83, 73, 77, 85, 58, 32, 109, 117, 115, 105, 113, 117, 101, 32, 101, 110, 100, 0, 33, 32, 68, 195, 169, 112, 108, 97, 99, 101, 109, 101, 110, 116, 32, 118, 101, 114, 115, 32, 37, 102, 44, 32, 37, 102, 32, 97, 98, 97, 110, 100, 111, 110, 110, 195, 169, 0, 33, 32, 68, 195, 169, 112, 108, 97, 99, 101, 109, 101, 110, 116, 32, 118, 101, 114, 115, 32, 37, 102, 44, 32, 37, 102, 32, 97, 98, 97, 110, 100, 111, 110, 110, 195, 169, 32, 40, 116, 105, 109, 101, 111, 117, 116, 32, 37, 100, 32, 97, 116, 116, 101, 105, 110, 116, 41, 0, 33, 32, 68, 195, 169, 112, 108, 97, 99, 101, 109, 101, 110, 116, 32, 118, 101, 114, 115, 32, 37, 102, 44, 32, 37, 102, 32, 97, 98, 97, 110, 100, 111, 110, 110, 195, 169, 32, 40, 79, 66, 83, 84, 65, 67, 76, 69, 41, 0, 33, 32, 68, 195, 169, 112, 108, 97, 99, 101, 109, 101, 110, 116, 32, 118, 101, 114, 115, 32, 37, 102, 44, 32, 37, 102, 32, 97, 98, 97, 110, 100, 111, 110, 110, 195, 169, 32, 40, 70, 73, 78, 32, 77, 65, 84, 67, 72, 41, 0, 33, 32, 68, 195, 169, 112, 108, 97, 99, 101, 109, 101, 110, 116, 32, 118, 101, 114, 115, 32, 37, 102, 44, 32, 37, 102, 32, 97, 98, 97, 110, 100, 111, 110, 110, 195, 169, 32, 40, 83, 116, 114, 97, 116, 195, 169, 103, 105, 101, 41, 0, 33, 32, 68, 195, 169, 112, 108, 97, 99, 101, 109, 101, 110, 116, 32, 118, 101, 114, 115, 32, 37, 102, 44, 32, 37, 102, 32, 97, 98, 97, 110, 100, 111, 110, 110, 195, 169, 32, 40, 65, 85, 84, 82, 69, 32, 69, 82, 82, 69, 85, 82, 41, 0, 33, 32, 68, 195, 169, 112, 108, 97, 99, 101, 109, 101, 110, 116, 32, 118, 101, 114, 115, 32, 37, 102, 44, 32, 37, 102, 32, 97, 98, 97, 110, 100, 111, 110, 110, 195, 169, 32, 40, 32, 101, 114, 114, 101, 117, 114, 32, 105, 110, 99, 111, 110, 110, 117, 101, 32, 97, 32, 99, 111, 114, 114, 105, 103, 101, 114, 32, 41, 0, 33, 32, 65, 112, 114, 195, 168, 115, 32, 37, 100, 32, 116, 101, 110, 116, 97, 116, 105, 118, 101, 115, 32, 40, 109, 97, 120, 41, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 52, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 55, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 56, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 48, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 52, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 53, 0, 80, 111, 105, 110, 116, 32, 105, 110, 99, 111, 110, 110, 117, 0, 33, 32, 35, 35, 35, 35, 35, 35, 35, 35, 35, 32, 69, 82, 82, 69, 85, 82, 32, 58, 32, 80, 111, 105, 110, 116, 32, 39, 37, 100, 39, 32, 115, 97, 110, 115, 32, 115, 116, 114, 97, 116, 195, 169, 103, 105, 101, 0, 79, 110, 32, 118, 97, 32, 102, 97, 105, 114, 101, 32, 117, 110, 32, 112, 101, 116, 105, 116, 32, 100, 195, 169, 116, 111, 117, 114, 46, 46, 46, 0, 33, 32, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 32, 69, 82, 82, 69, 85, 82, 58, 32, 105, 100, 80, 111, 105, 110, 116, 32, 39, 37, 100, 39, 32, 105, 110, 99, 111, 114, 114, 101, 99, 116, 32, 100, 97, 110, 115, 32, 103, 101, 116, 90, 111, 110, 101, 0, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 32, 69, 114, 114, 101, 117, 114, 32, 58, 32, 112, 97, 114, 97, 109, 195, 168, 116, 114, 101, 115, 32, 100, 101, 32, 114, 111, 98, 111, 116, 95, 100, 97, 110, 115, 95, 122, 111, 110, 101, 32, 109, 97, 108, 32, 100, 195, 169, 102, 105, 110, 105, 115, 46, 0, 112, 114, 95, 105, 110, 105, 116, 40, 41, 0, 70, 105, 110, 32, 112, 114, 111, 103, 114, 97, 109, 109, 101, 0, 65, 116, 116, 97, 113, 117, 101, 32, 100, 117, 32, 99, 195, 180, 116, 195, 169, 32, 100, 101, 32, 108, 97, 32, 103, 114, 111, 115, 115, 101, 32, 100, 117, 110, 101, 0, 76, 105, 98, 195, 169, 114, 97, 116, 105, 111, 110, 32, 100, 101, 115, 32, 99, 117, 98, 101, 115, 0, 65, 116, 116, 97, 113, 117, 101, 32, 100, 101, 32, 108, 97, 32, 103, 114, 111, 115, 115, 101, 32, 100, 117, 110, 101, 32, 112, 97, 114, 32, 108, 101, 32, 109, 105, 108, 105, 101, 117, 0, 65, 116, 116, 97, 113, 117, 101, 32, 100, 101, 32, 108, 97, 32, 112, 101, 116, 105, 116, 101, 32, 100, 117, 110, 101, 0, 77, 97, 116, 99, 104, 32, 80, 82, 10, 10, 0, 67, 111, 117, 108, 101, 117, 114, 32, 58, 32, 86, 69, 82, 84, 10, 10, 0, 67, 111, 117, 108, 101, 117, 114, 32, 58, 32, 86, 73, 79, 76, 69, 84, 10, 10, 0, 10, 33, 33, 32, 82, 79, 85, 76, 69, 65, 85, 88, 10, 0, 33, 33, 32, 68, 69, 83, 65, 67, 84, 73, 86, 69, 83, 10, 10, 0, 10, 82, 111, 117, 108, 101, 97, 117, 120, 32, 65, 99, 116, 105, 102, 115, 10, 10, 0, 80, 114, 101, 116, 10, 0, 83, 111, 114, 116, 32, 100, 101, 32, 108, 97, 32, 122, 111, 110, 101, 32, 100, 101, 32, 100, 195, 169, 112, 97, 114, 116, 0, 68, 105, 114, 101, 99, 116, 105, 111, 110, 32, 58, 32, 108, 101, 115, 32, 99, 97, 98, 105, 110, 101, 115, 0, 70, 101, 114, 109, 101, 116, 117, 114, 101, 32, 100, 101, 115, 32, 112, 111, 114, 116, 101, 115, 0, 69, 116, 32, 100, 101, 32, 100, 101, 117, 120, 0, 68, 105, 114, 101, 99, 116, 105, 111, 110, 32, 58, 32, 108, 101, 115, 32, 100, 117, 110, 101, 115, 0, 103, 114, 95, 105, 110, 105, 116, 40, 41, 0, 35, 35, 35, 35, 35, 35, 35, 35, 35, 32, 69, 82, 82, 69, 85, 82, 32, 58, 32, 80, 79, 83, 73, 84, 73, 79, 78, 32, 105, 110, 99, 111, 110, 110, 117, 101, 32, 100, 97, 110, 115, 32, 112, 111, 115, 105, 116, 105, 111, 110, 110, 101, 114, 95, 98, 114, 97, 115, 95, 103, 97, 117, 99, 104, 101, 0, 80, 111, 115, 105, 116, 105, 111, 110, 110, 101, 109, 101, 110, 116, 32, 98, 114, 97, 115, 32, 103, 97, 117, 99, 104, 101, 32, 37, 102, 32, 100, 101, 103, 0, 35, 35, 35, 35, 35, 35, 35, 35, 35, 32, 69, 82, 82, 69, 85, 82, 32, 58, 32, 80, 79, 83, 73, 84, 73, 79, 78, 32, 105, 110, 99, 111, 110, 110, 117, 101, 32, 100, 97, 110, 115, 32, 112, 111, 115, 105, 116, 105, 111, 110, 110, 101, 114, 95, 98, 114, 97, 115, 95, 100, 114, 111, 105, 116, 0, 80, 111, 115, 105, 116, 105, 111, 110, 110, 101, 109, 101, 110, 116, 32, 98, 114, 97, 115, 32, 100, 114, 111, 105, 116, 32, 37, 102, 32, 100, 101, 103, 0, 70, 105, 110, 32, 100, 101, 32, 109, 97, 116, 99, 104, 44, 32, 102, 117, 110, 110, 121, 32, 97, 99, 116, 105, 111, 110, 32, 33, 0, 70, 105, 110, 80, 114, 111, 103, 114, 97, 109, 109, 101, 0, 49, 46, 32, 80, 111, 115, 105, 116, 105, 111, 110, 110, 101, 114, 10, 0, 50, 46, 32, 74, 97, 99, 107, 32, 105, 110, 10, 0, 51, 46, 32, 66, 65, 85, 32, 111, 102, 102, 10, 0, 67, 111, 117, 108, 101, 117, 114, 32, 58, 32, 74, 65, 85, 78, 69, 10, 0, 67, 111, 117, 108, 101, 117, 114, 32, 58, 32, 66, 76, 69, 85, 10, 0, 10, 10, 0, 52, 46, 32, 74, 97, 99, 107, 32, 111, 117, 116, 10, 10, 0, 80, 114, 101, 116, 10, 10, 0, 45, 45, 45, 45, 45, 32, 82, 101, 99, 117, 112, 101, 114, 101, 114, 32, 77, 111, 100, 117, 108, 101, 32, 53, 32, 45, 45, 45, 45, 45, 0, 101, 110, 32, 112, 114, 101, 110, 97, 110, 116, 32, 113, 113, 32, 109, 105, 110, 101, 114, 97, 105, 115, 32, 97, 117, 32, 112, 97, 115, 115, 97, 103, 101, 32, 33, 0, 77, 105, 110, 101, 114, 97, 105, 115, 32, 99, 104, 97, 114, 103, 101, 115, 0, 70, 105, 110, 32, 100, 117, 32, 100, 195, 169, 112, 108, 97, 99, 101, 109, 101, 110, 116, 32, 112, 111, 117, 114, 32, 77, 111, 100, 117, 108, 101, 32, 53, 32, 100, 97, 110, 115, 32, 108, 97, 32, 122, 111, 110, 101, 32, 100, 101, 32, 100, 195, 169, 112, 97, 114, 116, 46, 0, 45, 45, 45, 45, 45, 32, 82, 101, 99, 117, 112, 101, 114, 101, 114, 32, 77, 111, 100, 117, 108, 101, 32, 49, 32, 45, 45, 45, 45, 45, 0, 74, 101, 32, 118, 97, 105, 115, 32, 114, 195, 169, 99, 117, 112, 195, 169, 114, 101, 114, 32, 108, 101, 32, 109, 111, 100, 117, 108, 101, 32, 49, 46, 32, 84, 97, 105, 97, 117, 116, 32, 33, 0, 77, 111, 100, 117, 108, 101, 32, 49, 32, 100, 97, 110, 115, 32, 108, 97, 32, 122, 111, 110, 101, 32, 100, 101, 32, 100, 195, 169, 112, 97, 114, 116, 32, 33, 0, 77, 97, 116, 99, 104, 32, 71, 82, 10, 0, 73, 110, 105, 116, 105, 97, 108, 105, 115, 97, 116, 105, 111, 110, 46, 46, 46, 0, 32, 79, 107, 10, 0, 33, 32, 35, 35, 35, 35, 35, 35, 35, 35, 35, 32, 69, 82, 82, 69, 85, 82, 32, 58, 32, 97, 99, 116, 105, 111, 110, 95, 101, 110, 95, 99, 111, 117, 114, 115, 32, 105, 110, 99, 111, 110, 110, 117, 0, 58, 58, 32, 69, 99, 104, 101, 99, 32, 115, 117, 114, 32, 97, 99, 116, 105, 111, 110, 32, 37, 100, 32, 58, 58, 0, 58, 58, 32, 65, 99, 116, 105, 111, 110, 32, 37, 100, 32, 116, 101, 114, 109, 105, 110, 101, 101, 32, 58, 58, 0, 69, 99, 104, 101, 99, 32, 100, 101, 32, 108, 97, 32, 100, 195, 169, 112, 111, 115, 101, 46, 32, 69, 110, 32, 114, 111, 117, 116, 101, 32, 118, 101, 114, 115, 32, 112, 111, 105, 110, 116, 32, 100, 101, 32, 115, 101, 99, 111, 117, 114, 115, 46, 0, 77, 105, 110, 101, 114, 97, 105, 115, 32, 100, 195, 169, 112, 111, 115, 195, 169, 115, 46, 0, 45, 45, 45, 45, 45, 32, 68, 101, 112, 111, 115, 101, 114, 32, 118, 101, 114, 115, 32, 100, 101, 112, 111, 116, 32, 45, 45, 45, 45, 45, 0, 69, 110, 32, 114, 111, 117, 116, 101, 32, 118, 101, 114, 115, 32, 68, 101, 112, 111, 116, 46, 0, 68, 101, 112, 111, 116, 32, 97, 116, 116, 101, 105, 110, 116, 46, 0, 33, 32, 82, 101, 99, 97, 108, 97, 103, 101, 32, 105, 109, 112, 111, 115, 115, 105, 98, 108, 101, 0, 82, 101, 99, 97, 108, 97, 103, 101, 0, 45, 45, 45, 45, 45, 32, 77, 105, 110, 101, 114, 97, 105, 115, 32, 71, 67, 67, 49, 52, 32, 45, 45, 45, 45, 45, 0, 71, 67, 67, 49, 52, 32, 97, 116, 116, 101, 105, 110, 116, 46, 0, 45, 45, 45, 45, 45, 32, 77, 105, 110, 101, 114, 97, 105, 115, 32, 71, 67, 67, 49, 48, 32, 45, 45, 45, 45, 45, 0, 71, 67, 67, 49, 48, 32, 97, 116, 116, 101, 105, 110, 116, 46, 0, 45, 45, 45, 45, 45, 32, 77, 105, 110, 101, 114, 97, 105, 115, 32, 80, 67, 76, 32, 45, 45, 45, 45, 45, 0, 80, 67, 76, 32, 97, 116, 116, 101, 105, 110, 116, 46, 0, 45, 45, 45, 45, 45, 32, 75, 110, 111, 99, 107, 101, 114, 32, 77, 111, 100, 117, 108, 101, 32, 50, 32, 100, 101, 32, 102, 97, 99, 101, 32, 45, 45, 45, 45, 45, 0, 45, 45, 45, 45, 45, 32, 77, 105, 110, 101, 114, 97, 105, 115, 32, 80, 67, 68, 55, 32, 45, 45, 45, 45, 45, 0, 80, 67, 68, 55, 32, 97, 116, 116, 101, 105, 110, 116, 46, 0, 77, 111, 105, 110, 115, 32, 100, 101, 32, 50, 53, 48, 32, 109, 115, 32, 114, 101, 115, 116, 97, 110, 116, 115, 32, 33, 0, 68, 101, 98, 117, 116, 68, 117, 77, 97, 116, 99, 104, 10, 0, 65, 116, 116, 101, 110, 116, 101, 32, 102, 105, 110, 32, 100, 117, 32, 109, 97, 116, 99, 104, 46, 0, 17, 0, 10, 0, 17, 17, 17, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 15, 10, 17, 17, 17, 3, 10, 7, 0, 1, 19, 9, 11, 11, 0, 0, 9, 6, 11, 0, 0, 11, 0, 6, 17, 0, 0, 0, 17, 17, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 10, 10, 17, 17, 17, 0, 10, 0, 0, 2, 0, 9, 11, 0, 0, 0, 9, 0, 11, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 12, 0, 0, 0, 0, 9, 12, 0, 0, 0, 0, 0, 12, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 0, 0, 0, 4, 13, 0, 0, 0, 0, 9, 14, 0, 0, 0, 0, 0, 14, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 15, 0, 0, 0, 0, 9, 16, 0, 0, 0, 0, 0, 16, 0, 0, 16, 0, 0, 18, 0, 0, 0, 18, 18, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 18, 18, 18, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 10, 0, 0, 0, 0, 9, 11, 0, 0, 0, 0, 0, 11, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 12, 0, 0, 0, 0, 9, 12, 0, 0, 0, 0, 0, 12, 0, 0, 12, 0, 0, 45, 43, 32, 32, 32, 48, 88, 48, 120, 0, 40, 110, 117, 108, 108, 41, 0, 45, 48, 88, 43, 48, 88, 32, 48, 88, 45, 48, 120, 43, 48, 120, 32, 48, 120, 0, 105, 110, 102, 0, 73, 78, 70, 0, 110, 97, 110, 0, 78, 65, 78, 0, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 46, 0, 84, 33, 34, 25, 13, 1, 2, 3, 17, 75, 28, 12, 16, 4, 11, 29, 18, 30, 39, 104, 110, 111, 112, 113, 98, 32, 5, 6, 15, 19, 20, 21, 26, 8, 22, 7, 40, 36, 23, 24, 9, 10, 14, 27, 31, 37, 35, 131, 130, 125, 38, 42, 43, 60, 61, 62, 63, 67, 71, 74, 77, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 99, 100, 101, 102, 103, 105, 106, 107, 108, 114, 115, 116, 121, 122, 123, 124, 0, 73, 108, 108, 101, 103, 97, 108, 32, 98, 121, 116, 101, 32, 115, 101, 113, 117, 101, 110, 99, 101, 0, 68, 111, 109, 97, 105, 110, 32, 101, 114, 114, 111, 114, 0, 82, 101, 115, 117, 108, 116, 32, 110, 111, 116, 32, 114, 101, 112, 114, 101, 115, 101, 110, 116, 97, 98, 108, 101, 0, 78, 111, 116, 32, 97, 32, 116, 116, 121, 0, 80, 101, 114, 109, 105, 115, 115, 105, 111, 110, 32, 100, 101, 110, 105, 101, 100, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 110, 111, 116, 32, 112, 101, 114, 109, 105, 116, 116, 101, 100, 0, 78, 111, 32, 115, 117, 99, 104, 32, 102, 105, 108, 101, 32, 111, 114, 32, 100, 105, 114, 101, 99, 116, 111, 114, 121, 0, 78, 111, 32, 115, 117, 99, 104, 32, 112, 114, 111, 99, 101, 115, 115, 0, 70, 105, 108, 101, 32, 101, 120, 105, 115, 116, 115, 0, 86, 97, 108, 117, 101, 32, 116, 111, 111, 32, 108, 97, 114, 103, 101, 32, 102, 111, 114, 32, 100, 97, 116, 97, 32, 116, 121, 112, 101, 0, 78, 111, 32, 115, 112, 97, 99, 101, 32, 108, 101, 102, 116, 32, 111, 110, 32, 100, 101, 118, 105, 99, 101, 0, 79, 117, 116, 32, 111, 102, 32, 109, 101, 109, 111, 114, 121, 0, 82, 101, 115, 111, 117, 114, 99, 101, 32, 98, 117, 115, 121, 0, 73, 110, 116, 101, 114, 114, 117, 112, 116, 101, 100, 32, 115, 121, 115, 116, 101, 109, 32, 99, 97, 108, 108, 0, 82, 101, 115, 111, 117, 114, 99, 101, 32, 116, 101, 109, 112, 111, 114, 97, 114, 105, 108, 121, 32, 117, 110, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 73, 110, 118, 97, 108, 105, 100, 32, 115, 101, 101, 107, 0, 67, 114, 111, 115, 115, 45, 100, 101, 118, 105, 99, 101, 32, 108, 105, 110, 107, 0, 82, 101, 97, 100, 45, 111, 110, 108, 121, 32, 102, 105, 108, 101, 32, 115, 121, 115, 116, 101, 109, 0, 68, 105, 114, 101, 99, 116, 111, 114, 121, 32, 110, 111, 116, 32, 101, 109, 112, 116, 121, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 115, 101, 116, 32, 98, 121, 32, 112, 101, 101, 114, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 116, 105, 109, 101, 100, 32, 111, 117, 116, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 102, 117, 115, 101, 100, 0, 72, 111, 115, 116, 32, 105, 115, 32, 100, 111, 119, 110, 0, 72, 111, 115, 116, 32, 105, 115, 32, 117, 110, 114, 101, 97, 99, 104, 97, 98, 108, 101, 0, 65, 100, 100, 114, 101, 115, 115, 32, 105, 110, 32, 117, 115, 101, 0, 66, 114, 111, 107, 101, 110, 32, 112, 105, 112, 101, 0, 73, 47, 79, 32, 101, 114, 114, 111, 114, 0, 78, 111, 32, 115, 117, 99, 104, 32, 100, 101, 118, 105, 99, 101, 32, 111, 114, 32, 97, 100, 100, 114, 101, 115, 115, 0, 66, 108, 111, 99, 107, 32, 100, 101, 118, 105, 99, 101, 32, 114, 101, 113, 117, 105, 114, 101, 100, 0, 78, 111, 32, 115, 117, 99, 104, 32, 100, 101, 118, 105, 99, 101, 0, 78, 111, 116, 32, 97, 32, 100, 105, 114, 101, 99, 116, 111, 114, 121, 0, 73, 115, 32, 97, 32, 100, 105, 114, 101, 99, 116, 111, 114, 121, 0, 84, 101, 120, 116, 32, 102, 105, 108, 101, 32, 98, 117, 115, 121, 0, 69, 120, 101, 99, 32, 102, 111, 114, 109, 97, 116, 32, 101, 114, 114, 111, 114, 0, 73, 110, 118, 97, 108, 105, 100, 32, 97, 114, 103, 117, 109, 101, 110, 116, 0, 65, 114, 103, 117, 109, 101, 110, 116, 32, 108, 105, 115, 116, 32, 116, 111, 111, 32, 108, 111, 110, 103, 0, 83, 121, 109, 98, 111, 108, 105, 99, 32, 108, 105, 110, 107, 32, 108, 111, 111, 112, 0, 70, 105, 108, 101, 110, 97, 109, 101, 32, 116, 111, 111, 32, 108, 111, 110, 103, 0, 84, 111, 111, 32, 109, 97, 110, 121, 32, 111, 112, 101, 110, 32, 102, 105, 108, 101, 115, 32, 105, 110, 32, 115, 121, 115, 116, 101, 109, 0, 78, 111, 32, 102, 105, 108, 101, 32, 100, 101, 115, 99, 114, 105, 112, 116, 111, 114, 115, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 66, 97, 100, 32, 102, 105, 108, 101, 32, 100, 101, 115, 99, 114, 105, 112, 116, 111, 114, 0, 78, 111, 32, 99, 104, 105, 108, 100, 32, 112, 114, 111, 99, 101, 115, 115, 0, 66, 97, 100, 32, 97, 100, 100, 114, 101, 115, 115, 0, 70, 105, 108, 101, 32, 116, 111, 111, 32, 108, 97, 114, 103, 101, 0, 84, 111, 111, 32, 109, 97, 110, 121, 32, 108, 105, 110, 107, 115, 0, 78, 111, 32, 108, 111, 99, 107, 115, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 82, 101, 115, 111, 117, 114, 99, 101, 32, 100, 101, 97, 100, 108, 111, 99, 107, 32, 119, 111, 117, 108, 100, 32, 111, 99, 99, 117, 114, 0, 83, 116, 97, 116, 101, 32, 110, 111, 116, 32, 114, 101, 99, 111, 118, 101, 114, 97, 98, 108, 101, 0, 80, 114, 101, 118, 105, 111, 117, 115, 32, 111, 119, 110, 101, 114, 32, 100, 105, 101, 100, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 99, 97, 110, 99, 101, 108, 101, 100, 0, 70, 117, 110, 99, 116, 105, 111, 110, 32, 110, 111, 116, 32, 105, 109, 112, 108, 101, 109, 101, 110, 116, 101, 100, 0, 78, 111, 32, 109, 101, 115, 115, 97, 103, 101, 32, 111, 102, 32, 100, 101, 115, 105, 114, 101, 100, 32, 116, 121, 112, 101, 0, 73, 100, 101, 110, 116, 105, 102, 105, 101, 114, 32, 114, 101, 109, 111, 118, 101, 100, 0, 68, 101, 118, 105, 99, 101, 32, 110, 111, 116, 32, 97, 32, 115, 116, 114, 101, 97, 109, 0, 78, 111, 32, 100, 97, 116, 97, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 68, 101, 118, 105, 99, 101, 32, 116, 105, 109, 101, 111, 117, 116, 0, 79, 117, 116, 32, 111, 102, 32, 115, 116, 114, 101, 97, 109, 115, 32, 114, 101, 115, 111, 117, 114, 99, 101, 115, 0, 76, 105, 110, 107, 32, 104, 97, 115, 32, 98, 101, 101, 110, 32, 115, 101, 118, 101, 114, 101, 100, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 101, 114, 114, 111, 114, 0, 66, 97, 100, 32, 109, 101, 115, 115, 97, 103, 101, 0, 70, 105, 108, 101, 32, 100, 101, 115, 99, 114, 105, 112, 116, 111, 114, 32, 105, 110, 32, 98, 97, 100, 32, 115, 116, 97, 116, 101, 0, 78, 111, 116, 32, 97, 32, 115, 111, 99, 107, 101, 116, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 97, 100, 100, 114, 101, 115, 115, 32, 114, 101, 113, 117, 105, 114, 101, 100, 0, 77, 101, 115, 115, 97, 103, 101, 32, 116, 111, 111, 32, 108, 97, 114, 103, 101, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 119, 114, 111, 110, 103, 32, 116, 121, 112, 101, 32, 102, 111, 114, 32, 115, 111, 99, 107, 101, 116, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 110, 111, 116, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 83, 111, 99, 107, 101, 116, 32, 116, 121, 112, 101, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 78, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 102, 97, 109, 105, 108, 121, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 65, 100, 100, 114, 101, 115, 115, 32, 102, 97, 109, 105, 108, 121, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 32, 98, 121, 32, 112, 114, 111, 116, 111, 99, 111, 108, 0, 65, 100, 100, 114, 101, 115, 115, 32, 110, 111, 116, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 78, 101, 116, 119, 111, 114, 107, 32, 105, 115, 32, 100, 111, 119, 110, 0, 78, 101, 116, 119, 111, 114, 107, 32, 117, 110, 114, 101, 97, 99, 104, 97, 98, 108, 101, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 115, 101, 116, 32, 98, 121, 32, 110, 101, 116, 119, 111, 114, 107, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 97, 98, 111, 114, 116, 101, 100, 0, 78, 111, 32, 98, 117, 102, 102, 101, 114, 32, 115, 112, 97, 99, 101, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 83, 111, 99, 107, 101, 116, 32, 105, 115, 32, 99, 111, 110, 110, 101, 99, 116, 101, 100, 0, 83, 111, 99, 107, 101, 116, 32, 110, 111, 116, 32, 99, 111, 110, 110, 101, 99, 116, 101, 100, 0, 67, 97, 110, 110, 111, 116, 32, 115, 101, 110, 100, 32, 97, 102, 116, 101, 114, 32, 115, 111, 99, 107, 101, 116, 32, 115, 104, 117, 116, 100, 111, 119, 110, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 97, 108, 114, 101, 97, 100, 121, 32, 105, 110, 32, 112, 114, 111, 103, 114, 101, 115, 115, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 105, 110, 32, 112, 114, 111, 103, 114, 101, 115, 115, 0, 83, 116, 97, 108, 101, 32, 102, 105, 108, 101, 32, 104, 97, 110, 100, 108, 101, 0, 82, 101, 109, 111, 116, 101, 32, 73, 47, 79, 32, 101, 114, 114, 111, 114, 0, 81, 117, 111, 116, 97, 32, 101, 120, 99, 101, 101, 100, 101, 100, 0, 78, 111, 32, 109, 101, 100, 105, 117, 109, 32, 102, 111, 117, 110, 100, 0, 87, 114, 111, 110, 103, 32, 109, 101, 100, 105, 117, 109, 32, 116, 121, 112, 101, 0, 78, 111, 32, 101, 114, 114, 111, 114, 32, 105, 110, 102, 111, 114, 109, 97, 116, 105, 111, 110, 0, 0 ], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
var tempDoublePtr = STATICTOP;
STATICTOP += 16;
assert(tempDoublePtr % 8 == 0);
var EMTSTACKTOP = getMemory(1048576);
var EMT_STACK_MAX = EMTSTACKTOP + 1048576;
var eb = getMemory(49328);
assert(eb % 8 === 0);
__ATPRERUN__.push((function() {
 HEAPU8.set([ 140, 6, 89, 1, 0, 0, 0, 0, 2, 200, 0, 0, 12, 2, 0, 0, 2, 201, 0, 0, 0, 202, 154, 59, 2, 202, 0, 0, 193, 13, 0, 0, 1, 203, 0, 0, 143, 203, 87, 1, 136, 204, 0, 0, 0, 203, 204, 0, 143, 203, 88, 1, 136, 203, 0, 0, 1, 204, 48, 2, 3, 203, 203, 204, 137, 203, 0, 0, 130, 203, 0, 0, 136, 204, 0, 0, 49, 203, 203, 204, 96, 0, 0, 0, 1, 204, 48, 2, 135, 203, 0, 0, 204, 0, 0, 0, 141, 204, 88, 1, 3, 203, 204, 200, 143, 203, 83, 1, 141, 203, 88, 1, 1, 204, 0, 0, 85, 203, 204, 0, 141, 204, 88, 1, 1, 203, 0, 2, 3, 204, 204, 203, 25, 116, 204, 12, 134, 204, 0, 0, 76, 187, 0, 0, 1, 0, 0, 0, 128, 204, 0, 0, 0, 122, 204, 0, 34, 204, 122, 0, 121, 204, 5, 0, 68, 20, 1, 0, 1, 33, 1, 0, 1, 34, 142, 13, 119, 0, 20, 0, 38, 204, 4, 1, 32, 204, 204, 0, 1, 203, 143, 13, 1, 205, 148, 13, 125, 6, 204, 203, 205, 0, 0, 0, 1, 205, 0, 8, 19, 205, 4, 205, 32, 205, 205, 0, 1, 203, 145, 13, 125, 7, 205, 6, 203, 0, 0, 0, 58, 20, 1, 0, 1, 203, 1, 8, 19, 203, 4, 203, 33, 203, 203, 0, 38, 203, 203, 1, 0, 33, 203, 0, 0, 34, 7, 0, 134, 203, 0, 0, 76, 187, 0, 0, 20, 0, 0, 0, 128, 203, 0, 0, 0, 168, 203, 0, 2, 203, 0, 0, 0, 0, 240, 127, 19, 203, 168, 203, 2, 205, 0, 0, 0, 0, 240, 127, 16, 203, 203, 205, 2, 205, 0, 0, 0, 0, 240, 127, 19, 205, 168, 205, 2, 204, 0, 0, 0, 0, 240, 127, 13, 205, 205, 204, 1, 204, 0, 0, 34, 204, 204, 0, 19, 205, 205, 204, 20, 203, 203, 205, 121, 203, 83, 5, 141, 205, 88, 1, 134, 203, 0, 0, 156, 189, 0, 0, 20, 205, 0, 0, 144, 203, 41, 1, 142, 203, 41, 1, 59, 205, 2, 0, 65, 203, 203, 205, 59, 205, 0, 0, 70, 203, 203, 205, 121, 203, 8, 0, 141, 205, 88, 1, 82, 203, 205, 0, 143, 203, 65, 1, 141, 203, 88, 1, 141, 205, 65, 1, 26, 205, 205, 1, 85, 203, 205, 0, 39, 205, 5, 32, 32, 205, 205, 97, 121, 205, 0, 1, 25, 205, 34, 9, 143, 205, 69, 1, 38, 205, 5, 32, 32, 205, 205, 0, 141, 203, 69, 1, 125, 35, 205, 34, 203, 0, 0, 0, 39, 205, 33, 2, 0, 203, 205, 0, 143, 203, 70, 1, 1, 203, 11, 0, 16, 203, 203, 3, 1, 205, 12, 0, 4, 205, 205, 3, 32, 205, 205, 0, 20, 203, 203, 205, 121, 203, 5, 0, 142, 203, 41, 1, 59, 205, 2, 0, 65, 43, 203, 205, 119, 0, 42, 0, 59, 29, 8, 0, 1, 205, 12, 0, 4, 50, 205, 3, 26, 205, 50, 1, 143, 205, 71, 1, 59, 203, 16, 0, 65, 205, 29, 203, 144, 205, 72, 1, 141, 205, 71, 1, 32, 205, 205, 0, 120, 205, 6, 0, 142, 205, 72, 1, 58, 29, 205, 0, 141, 205, 71, 1, 0, 50, 205, 0, 119, 0, 244, 255, 78, 205, 35, 0, 143, 205, 73, 1, 141, 205, 73, 1, 41, 205, 205, 24, 42, 205, 205, 24, 32, 205, 205, 45, 121, 205, 11, 0, 142, 205, 72, 1, 142, 203, 41, 1, 59, 204, 2, 0, 65, 203, 203, 204, 68, 203, 203, 0, 142, 204, 72, 1, 64, 203, 203, 204, 63, 205, 205, 203, 68, 43, 205, 0, 119, 0, 9, 0, 142, 205, 41, 1, 59, 203, 2, 0, 65, 205, 205, 203, 142, 203, 72, 1, 63, 205, 205, 203, 142, 203, 72, 1, 64, 43, 205, 203, 119, 0, 1, 0, 141, 205, 88, 1, 82, 203, 205, 0, 143, 203, 74, 1, 141, 204, 74, 1, 34, 204, 204, 0, 121, 204, 6, 0, 1, 204, 0, 0, 141, 206, 74, 1, 4, 204, 204, 206, 0, 205, 204, 0, 119, 0, 3, 0, 141, 204, 74, 1, 0, 205, 204, 0, 0, 203, 205, 0, 143, 203, 75, 1, 141, 205, 75, 1, 141, 204, 75, 1, 34, 204, 204, 0, 41, 204, 204, 31, 42, 204, 204, 31, 134, 203, 0, 0, 156, 106, 0, 0, 205, 204, 116, 0, 143, 203, 76, 1, 141, 203, 76, 1, 45, 203, 203, 116, 56, 3, 0, 0, 141, 203, 88, 1, 1, 204, 0, 2, 3, 203, 203, 204, 1, 204, 48, 0, 107, 203, 11, 204, 141, 204, 88, 1, 1, 203, 0, 2, 3, 204, 204, 203, 25, 31, 204, 11, 119, 0, 3, 0, 141, 204, 76, 1, 0, 31, 204, 0, 26, 204, 31, 1, 143, 204, 77, 1, 141, 204, 77, 1, 141, 203, 74, 1, 42, 203, 203, 31, 38, 203, 203, 2, 25, 203, 203, 43, 1, 205, 255, 0, 19, 203, 203, 205, 83, 204, 203, 0, 26, 203, 31, 2, 143, 203, 78, 1, 141, 203, 78, 1, 25, 204, 5, 15, 1, 205, 255, 0, 19, 204, 204, 205, 83, 203, 204, 0, 141, 204, 88, 1, 3, 36, 204, 200, 58, 60, 43, 0, 75, 204, 60, 0, 143, 204, 79, 1, 1, 203, 177, 13, 141, 205, 79, 1, 90, 204, 203, 205, 143, 204, 80, 1, 25, 204, 36, 1, 143, 204, 81, 1, 141, 204, 80, 1, 1, 203, 255, 0, 19, 204, 204, 203, 38, 203, 5, 32, 20, 204, 204, 203, 1, 203, 255, 0, 19, 204, 204, 203, 83, 36, 204, 0, 141, 203, 79, 1, 76, 203, 203, 0, 64, 204, 60, 203, 144, 204, 82, 1, 141, 204, 81, 1, 141, 203, 83, 1, 4, 204, 204, 203, 32, 204, 204, 1, 121, 204, 23, 0, 38, 204, 4, 8, 32, 204, 204, 0, 34, 203, 3, 1, 142, 205, 82, 1, 59, 206, 16, 0, 65, 205, 205, 206, 59, 206, 0, 0, 69, 205, 205, 206, 19, 203, 203, 205, 19, 204, 204, 203, 121, 204, 4, 0, 141, 204, 81, 1, 0, 54, 204, 0, 119, 0, 11, 0, 25, 204, 36, 2, 143, 204, 84, 1, 141, 204, 81, 1, 1, 203, 46, 0, 83, 204, 203, 0, 141, 203, 84, 1, 0, 54, 203, 0, 119, 0, 3, 0, 141, 203, 81, 1, 0, 54, 203, 0, 142, 203, 82, 1, 59, 204, 16, 0, 65, 203, 203, 204, 59, 204, 0, 0, 70, 203, 203, 204, 121, 203, 6, 0, 0, 36, 54, 0, 142, 203, 82, 1, 59, 204, 16, 0, 65, 60, 203, 204, 119, 0, 197, 255, 0, 204, 54, 0, 143, 204, 85, 1, 33, 203, 3, 0, 141, 205, 85, 1, 141, 206, 83, 1, 4, 205, 205, 206, 26, 205, 205, 2, 15, 205, 205, 3, 19, 203, 203, 205, 121, 203, 4, 0, 25, 203, 3, 2, 0, 204, 203, 0, 119, 0, 5, 0, 141, 203, 85, 1, 141, 205, 83, 1, 4, 203, 203, 205, 0, 204, 203, 0, 0, 106, 204, 0, 141, 204, 78, 1, 4, 204, 116, 204, 141, 203, 70, 1, 3, 204, 204, 203, 3, 115, 204, 106, 1, 203, 32, 0, 134, 204, 0, 0, 240, 158, 0, 0, 0, 203, 2, 115, 4, 0, 0, 0, 141, 203, 70, 1, 134, 204, 0, 0, 20, 187, 0, 0, 0, 35, 203, 0, 1, 203, 48, 0, 2, 205, 0, 0, 0, 0, 1, 0, 21, 205, 4, 205, 134, 204, 0, 0, 240, 158, 0, 0, 0, 203, 2, 115, 205, 0, 0, 0, 141, 205, 88, 1, 3, 205, 205, 200, 141, 203, 85, 1, 141, 206, 83, 1, 4, 203, 203, 206, 134, 204, 0, 0, 20, 187, 0, 0, 0, 205, 203, 0, 1, 203, 48, 0, 141, 205, 85, 1, 141, 206, 83, 1, 4, 205, 205, 206, 4, 205, 106, 205, 1, 206, 0, 0, 1, 207, 0, 0, 134, 204, 0, 0, 240, 158, 0, 0, 0, 203, 205, 206, 207, 0, 0, 0, 141, 207, 78, 1, 141, 206, 78, 1, 4, 206, 116, 206, 134, 204, 0, 0, 20, 187, 0, 0, 0, 207, 206, 0, 1, 206, 32, 0, 1, 207, 0, 32, 21, 207, 4, 207, 134, 204, 0, 0, 240, 158, 0, 0, 0, 206, 2, 115, 207, 0, 0, 0, 0, 114, 115, 0, 119, 0, 117, 4, 34, 204, 3, 0, 1, 207, 6, 0, 125, 84, 204, 207, 3, 0, 0, 0, 142, 207, 41, 1, 59, 204, 2, 0, 65, 207, 207, 204, 59, 204, 0, 0, 70, 207, 207, 204, 121, 207, 14, 0, 141, 207, 88, 1, 82, 117, 207, 0, 141, 207, 88, 1, 26, 204, 117, 28, 85, 207, 204, 0, 142, 204, 41, 1, 59, 207, 2, 0, 65, 204, 204, 207, 60, 207, 0, 0, 0, 0, 0, 16, 65, 70, 204, 207, 26, 108, 117, 28, 119, 0, 7, 0, 141, 207, 88, 1, 82, 110, 207, 0, 142, 207, 41, 1, 59, 204, 2, 0, 65, 70, 207, 204, 0, 108, 110, 0, 34, 118, 108, 0, 121, 118, 5, 0, 141, 207, 88, 1, 25, 207, 207, 8, 0, 204, 207, 0, 119, 0, 6, 0, 141, 207, 88, 1, 25, 207, 207, 8, 1, 206, 32, 1, 3, 207, 207, 206, 0, 204, 207, 0, 0, 94, 204, 0, 0, 28, 94, 0, 58, 77, 70, 0, 75, 119, 77, 0, 85, 28, 119, 0, 25, 120, 28, 4, 77, 204, 119, 0, 64, 121, 77, 204, 60, 204, 0, 0, 0, 202, 154, 59, 65, 204, 121, 204, 59, 207, 0, 0, 70, 204, 204, 207, 121, 204, 6, 0, 0, 28, 120, 0, 60, 204, 0, 0, 0, 202, 154, 59, 65, 77, 121, 204, 119, 0, 241, 255, 1, 204, 0, 0, 15, 123, 204, 108, 121, 123, 80, 0, 0, 46, 94, 0, 0, 49, 120, 0, 0, 125, 108, 0, 34, 124, 125, 29, 1, 204, 29, 0, 125, 126, 124, 125, 204, 0, 0, 0, 26, 24, 49, 4, 16, 127, 24, 46, 121, 127, 3, 0, 0, 64, 46, 0, 119, 0, 41, 0, 0, 25, 24, 0, 1, 27, 0, 0, 82, 128, 25, 0, 1, 204, 0, 0, 135, 129, 1, 0, 128, 204, 126, 0, 128, 204, 0, 0, 0, 130, 204, 0, 1, 204, 0, 0, 134, 131, 0, 0, 180, 188, 0, 0, 129, 130, 27, 204, 128, 204, 0, 0, 0, 132, 204, 0, 1, 204, 0, 0, 134, 133, 0, 0, 88, 182, 0, 0, 131, 132, 201, 204, 128, 204, 0, 0, 0, 134, 204, 0, 85, 25, 133, 0, 1, 204, 0, 0, 134, 135, 0, 0, 148, 188, 0, 0, 131, 132, 201, 204, 128, 204, 0, 0, 0, 136, 204, 0, 26, 23, 25, 4, 16, 137, 23, 46, 120, 137, 4, 0, 0, 25, 23, 0, 0, 27, 135, 0, 119, 0, 226, 255, 32, 204, 135, 0, 121, 204, 3, 0, 0, 64, 46, 0, 119, 0, 4, 0, 26, 138, 46, 4, 85, 138, 135, 0, 0, 64, 138, 0, 0, 65, 49, 0, 16, 139, 64, 65, 120, 139, 2, 0, 119, 0, 7, 0, 26, 140, 65, 4, 82, 141, 140, 0, 32, 204, 141, 0, 121, 204, 3, 0, 0, 65, 140, 0, 119, 0, 248, 255, 141, 204, 88, 1, 82, 142, 204, 0, 141, 204, 88, 1, 4, 207, 142, 126, 85, 204, 207, 0, 1, 207, 0, 0, 4, 204, 142, 126, 47, 207, 207, 204, 204, 7, 0, 0, 0, 46, 64, 0, 0, 49, 65, 0, 4, 125, 142, 126, 119, 0, 185, 255, 0, 45, 64, 0, 0, 48, 65, 0, 4, 109, 142, 126, 119, 0, 4, 0, 0, 45, 94, 0, 0, 48, 120, 0, 0, 109, 108, 0, 34, 143, 109, 0, 121, 143, 90, 0, 0, 73, 45, 0, 0, 75, 48, 0, 0, 145, 109, 0, 1, 207, 0, 0, 4, 144, 207, 145, 34, 207, 144, 9, 1, 204, 9, 0, 125, 146, 207, 144, 204, 0, 0, 0, 16, 147, 73, 75, 121, 147, 34, 0, 1, 22, 0, 0, 0, 47, 73, 0, 82, 150, 47, 0, 24, 204, 150, 146, 3, 151, 204, 22, 85, 47, 151, 0, 1, 204, 1, 0, 22, 204, 204, 146, 26, 204, 204, 1, 19, 204, 150, 204, 24, 207, 201, 146, 5, 152, 204, 207, 25, 153, 47, 4, 16, 154, 153, 75, 121, 154, 4, 0, 0, 22, 152, 0, 0, 47, 153, 0, 119, 0, 241, 255, 82, 155, 73, 0, 25, 156, 73, 4, 32, 207, 155, 0, 125, 9, 207, 156, 73, 0, 0, 0, 32, 207, 152, 0, 121, 207, 4, 0, 0, 11, 9, 0, 0, 81, 75, 0, 119, 0, 13, 0, 25, 157, 75, 4, 85, 75, 152, 0, 0, 11, 9, 0, 0, 81, 157, 0, 119, 0, 8, 0, 82, 148, 73, 0, 25, 149, 73, 4, 32, 207, 148, 0, 125, 10, 207, 149, 73, 0, 0, 0, 0, 11, 10, 0, 0, 81, 75, 0, 39, 207, 5, 32, 32, 207, 207, 102, 125, 158, 207, 94, 11, 0, 0, 0, 0, 159, 81, 0, 25, 204, 84, 25, 28, 204, 204, 9, 38, 204, 204, 255, 25, 204, 204, 1, 4, 206, 159, 158, 42, 206, 206, 2, 47, 204, 204, 206, 16, 9, 0, 0, 25, 204, 84, 25, 28, 204, 204, 9, 38, 204, 204, 255, 25, 204, 204, 1, 41, 204, 204, 2, 3, 204, 158, 204, 0, 207, 204, 0, 119, 0, 2, 0, 0, 207, 81, 0, 0, 13, 207, 0, 141, 207, 88, 1, 82, 160, 207, 0, 141, 207, 88, 1, 3, 204, 160, 146, 85, 207, 204, 0, 3, 204, 160, 146, 34, 204, 204, 0, 121, 204, 5, 0, 0, 73, 11, 0, 0, 75, 13, 0, 3, 145, 160, 146, 119, 0, 174, 255, 0, 72, 11, 0, 0, 74, 13, 0, 119, 0, 3, 0, 0, 72, 45, 0, 0, 74, 48, 0, 16, 161, 72, 74, 121, 161, 22, 0, 0, 162, 72, 0, 82, 163, 72, 0, 35, 204, 163, 10, 121, 204, 5, 0, 4, 204, 94, 162, 42, 204, 204, 2, 27, 53, 204, 9, 119, 0, 15, 0, 4, 204, 94, 162, 42, 204, 204, 2, 27, 32, 204, 9, 1, 39, 10, 0, 27, 164, 39, 10, 25, 165, 32, 1, 48, 204, 163, 164, 172, 9, 0, 0, 0, 53, 165, 0, 119, 0, 5, 0, 0, 32, 165, 0, 0, 39, 164, 0, 119, 0, 248, 255, 1, 53, 0, 0, 39, 204, 5, 32, 33, 204, 204, 102, 1, 207, 0, 0, 125, 166, 204, 53, 207, 0, 0, 0, 4, 207, 84, 166, 33, 204, 84, 0, 39, 206, 5, 32, 32, 206, 206, 103, 19, 204, 204, 206, 41, 204, 204, 31, 42, 204, 204, 31, 3, 167, 207, 204, 0, 169, 74, 0, 4, 204, 169, 94, 42, 204, 204, 2, 27, 204, 204, 9, 26, 204, 204, 9, 47, 204, 167, 204, 236, 12, 0, 0, 25, 204, 94, 4, 1, 207, 0, 36, 3, 207, 167, 207, 28, 207, 207, 9, 38, 207, 207, 255, 1, 206, 0, 4, 4, 207, 207, 206, 41, 207, 207, 2, 3, 170, 204, 207, 1, 207, 0, 36, 3, 207, 167, 207, 30, 207, 207, 9, 38, 207, 207, 255, 25, 207, 207, 1, 34, 207, 207, 9, 121, 207, 16, 0, 1, 207, 0, 36, 3, 207, 167, 207, 30, 207, 207, 9, 38, 207, 207, 255, 25, 38, 207, 1, 1, 57, 10, 0, 27, 171, 57, 10, 25, 37, 38, 1, 32, 207, 37, 9, 121, 207, 3, 0, 0, 56, 171, 0, 119, 0, 5, 0, 0, 38, 37, 0, 0, 57, 171, 0, 119, 0, 248, 255, 1, 56, 10, 0, 82, 172, 170, 0, 9, 207, 172, 56, 38, 207, 207, 255, 0, 173, 207, 0, 25, 207, 170, 4, 13, 174, 207, 74, 32, 207, 173, 0, 19, 207, 174, 207, 121, 207, 5, 0, 0, 80, 170, 0, 0, 82, 53, 0, 0, 103, 72, 0, 119, 0, 132, 0, 7, 207, 172, 56, 38, 207, 207, 255, 0, 175, 207, 0, 38, 204, 175, 1, 32, 204, 204, 0, 121, 204, 5, 0, 61, 204, 0, 0, 0, 0, 0, 90, 58, 207, 204, 0, 119, 0, 5, 0, 62, 204, 0, 0, 1, 0, 0, 0, 0, 0, 64, 67, 58, 207, 204, 0, 58, 86, 207, 0, 28, 207, 56, 2, 38, 207, 207, 255, 0, 176, 207, 0, 13, 204, 173, 176, 19, 204, 174, 204, 121, 204, 4, 0, 59, 204, 1, 0, 58, 207, 204, 0, 119, 0, 4, 0, 61, 204, 0, 0, 0, 0, 192, 63, 58, 207, 204, 0, 58, 95, 207, 0, 48, 204, 173, 176, 72, 11, 0, 0, 61, 204, 0, 0, 0, 0, 0, 63, 58, 207, 204, 0, 119, 0, 2, 0, 58, 207, 95, 0, 58, 15, 207, 0, 32, 177, 33, 0, 121, 177, 4, 0, 58, 41, 15, 0, 58, 42, 86, 0, 119, 0, 22, 0, 78, 178, 34, 0, 41, 204, 178, 24, 42, 204, 204, 24, 32, 204, 204, 45, 121, 204, 4, 0, 68, 204, 86, 0, 58, 207, 204, 0, 119, 0, 2, 0, 58, 207, 86, 0, 58, 14, 207, 0, 41, 204, 178, 24, 42, 204, 204, 24, 32, 204, 204, 45, 121, 204, 4, 0, 68, 204, 15, 0, 58, 207, 204, 0, 119, 0, 2, 0, 58, 207, 15, 0, 58, 8, 207, 0, 58, 41, 8, 0, 58, 42, 14, 0, 4, 207, 172, 173, 85, 170, 207, 0, 63, 179, 42, 41, 70, 180, 179, 42, 121, 180, 62, 0, 4, 207, 172, 173, 3, 181, 207, 56, 85, 170, 181, 0, 2, 207, 0, 0, 255, 201, 154, 59, 48, 207, 207, 181, 84, 12, 0, 0, 0, 90, 72, 0, 0, 113, 170, 0, 26, 182, 113, 4, 1, 207, 0, 0, 85, 113, 207, 0, 16, 183, 182, 90, 121, 183, 6, 0, 26, 184, 90, 4, 1, 207, 0, 0, 85, 184, 207, 0, 0, 97, 184, 0, 119, 0, 2, 0, 0, 97, 90, 0, 82, 185, 182, 0, 25, 207, 185, 1, 85, 182, 207, 0, 2, 207, 0, 0, 255, 201, 154, 59, 25, 204, 185, 1, 48, 207, 207, 204, 72, 12, 0, 0, 0, 90, 97, 0, 0, 113, 182, 0, 119, 0, 235, 255, 0, 89, 97, 0, 0, 112, 182, 0, 119, 0, 3, 0, 0, 89, 72, 0, 0, 112, 170, 0, 0, 186, 89, 0, 82, 187, 89, 0, 35, 207, 187, 10, 121, 207, 7, 0, 0, 80, 112, 0, 4, 207, 94, 186, 42, 207, 207, 2, 27, 82, 207, 9, 0, 103, 89, 0, 119, 0, 19, 0, 4, 207, 94, 186, 42, 207, 207, 2, 27, 67, 207, 9, 1, 69, 10, 0, 27, 188, 69, 10, 25, 189, 67, 1, 48, 207, 187, 188, 180, 12, 0, 0, 0, 80, 112, 0, 0, 82, 189, 0, 0, 103, 89, 0, 119, 0, 7, 0, 0, 67, 189, 0, 0, 69, 188, 0, 119, 0, 246, 255, 0, 80, 170, 0, 0, 82, 53, 0, 0, 103, 72, 0, 25, 190, 80, 4, 16, 191, 190, 74, 125, 12, 191, 190, 74, 0, 0, 0, 0, 92, 82, 0, 0, 102, 12, 0, 0, 104, 103, 0, 119, 0, 4, 0, 0, 92, 53, 0, 0, 102, 74, 0, 0, 104, 72, 0, 0, 100, 102, 0, 16, 192, 104, 100, 120, 192, 3, 0, 1, 105, 0, 0, 119, 0, 9, 0, 26, 193, 100, 4, 82, 194, 193, 0, 32, 207, 194, 0, 121, 207, 3, 0, 0, 100, 193, 0, 119, 0, 247, 255, 1, 105, 1, 0, 119, 0, 1, 0, 1, 207, 0, 0, 4, 195, 207, 92, 39, 207, 5, 32, 32, 207, 207, 103, 121, 207, 119, 0, 33, 207, 84, 0, 40, 207, 207, 1, 38, 207, 207, 1, 3, 85, 207, 84, 15, 196, 92, 85, 1, 207, 251, 255, 15, 197, 207, 92, 19, 207, 196, 197, 121, 207, 6, 0, 26, 207, 85, 1, 4, 198, 207, 92, 26, 21, 5, 1, 0, 61, 198, 0, 119, 0, 3, 0, 26, 21, 5, 2, 26, 61, 85, 1, 38, 207, 4, 8, 32, 207, 207, 0, 121, 207, 95, 0, 121, 105, 36, 0, 26, 199, 100, 4, 82, 207, 199, 0, 143, 207, 0, 1, 141, 207, 0, 1, 32, 207, 207, 0, 121, 207, 3, 0, 1, 68, 9, 0, 119, 0, 29, 0, 141, 207, 0, 1, 31, 207, 207, 10, 38, 207, 207, 255, 32, 207, 207, 0, 121, 207, 21, 0, 1, 55, 0, 0, 1, 76, 10, 0, 27, 207, 76, 10, 143, 207, 1, 1, 25, 207, 55, 1, 143, 207, 2, 1, 141, 207, 0, 1, 141, 204, 1, 1, 9, 207, 207, 204, 38, 207, 207, 255, 32, 207, 207, 0, 121, 207, 6, 0, 141, 207, 2, 1, 0, 55, 207, 0, 141, 207, 1, 1, 0, 76, 207, 0, 119, 0, 242, 255, 141, 207, 2, 1, 0, 68, 207, 0, 119, 0, 4, 0, 1, 68, 0, 0, 119, 0, 2, 0, 1, 68, 9, 0, 39, 204, 21, 32, 0, 207, 204, 0, 143, 207, 3, 1, 0, 207, 100, 0, 143, 207, 4, 1, 141, 207, 3, 1, 32, 207, 207, 102, 121, 207, 24, 0, 141, 204, 4, 1, 4, 204, 204, 94, 42, 204, 204, 2, 27, 204, 204, 9, 26, 204, 204, 9, 4, 207, 204, 68, 143, 207, 5, 1, 1, 207, 0, 0, 141, 204, 5, 1, 15, 207, 207, 204, 141, 204, 5, 1, 1, 206, 0, 0, 125, 87, 207, 204, 206, 0, 0, 0, 15, 206, 61, 87, 143, 206, 6, 1, 141, 206, 6, 1, 125, 62, 206, 61, 87, 0, 0, 0, 0, 44, 21, 0, 0, 71, 62, 0, 1, 111, 0, 0, 119, 0, 36, 0, 141, 204, 4, 1, 4, 204, 204, 94, 42, 204, 204, 2, 27, 204, 204, 9, 26, 204, 204, 9, 3, 206, 204, 92, 143, 206, 7, 1, 141, 204, 7, 1, 4, 206, 204, 68, 143, 206, 8, 1, 1, 206, 0, 0, 141, 204, 8, 1, 15, 206, 206, 204, 141, 204, 8, 1, 1, 207, 0, 0, 125, 88, 206, 204, 207, 0, 0, 0, 15, 207, 61, 88, 143, 207, 9, 1, 141, 207, 9, 1, 125, 63, 207, 61, 88, 0, 0, 0, 0, 44, 21, 0, 0, 71, 63, 0, 1, 111, 0, 0, 119, 0, 10, 0, 0, 44, 21, 0, 0, 71, 61, 0, 38, 207, 4, 8, 0, 111, 207, 0, 119, 0, 5, 0, 0, 44, 5, 0, 0, 71, 84, 0, 38, 207, 4, 8, 0, 111, 207, 0, 20, 204, 71, 111, 0, 207, 204, 0, 143, 207, 10, 1, 39, 204, 44, 32, 0, 207, 204, 0, 143, 207, 12, 1, 141, 207, 12, 1, 32, 207, 207, 102, 121, 207, 13, 0, 1, 204, 0, 0, 15, 207, 204, 92, 143, 207, 13, 1, 141, 204, 13, 1, 1, 206, 0, 0, 125, 207, 204, 92, 206, 0, 0, 0, 143, 207, 14, 1, 1, 66, 0, 0, 141, 207, 14, 1, 0, 107, 207, 0, 119, 0, 64, 0, 34, 207, 92, 0, 143, 207, 15, 1, 141, 206, 15, 1, 125, 207, 206, 195, 92, 0, 0, 0, 143, 207, 16, 1, 141, 206, 16, 1, 141, 204, 16, 1, 34, 204, 204, 0, 41, 204, 204, 31, 42, 204, 204, 31, 134, 207, 0, 0, 156, 106, 0, 0, 206, 204, 116, 0, 143, 207, 18, 1, 141, 207, 18, 1, 4, 207, 116, 207, 34, 207, 207, 2, 121, 207, 18, 0, 141, 207, 18, 1, 0, 52, 207, 0, 26, 207, 52, 1, 143, 207, 19, 1, 141, 207, 19, 1, 1, 204, 48, 0, 83, 207, 204, 0, 141, 204, 19, 1, 4, 204, 116, 204, 34, 204, 204, 2, 121, 204, 4, 0, 141, 204, 19, 1, 0, 52, 204, 0, 119, 0, 245, 255, 141, 204, 19, 1, 0, 51, 204, 0, 119, 0, 3, 0, 141, 204, 18, 1, 0, 51, 204, 0, 42, 207, 92, 31, 0, 204, 207, 0, 143, 204, 20, 1, 26, 204, 51, 1, 143, 204, 22, 1, 141, 204, 22, 1, 141, 207, 20, 1, 38, 207, 207, 2, 25, 207, 207, 43, 1, 206, 255, 0, 19, 207, 207, 206, 83, 204, 207, 0, 1, 204, 255, 0, 19, 204, 44, 204, 0, 207, 204, 0, 143, 207, 23, 1, 26, 207, 51, 2, 143, 207, 24, 1, 141, 207, 24, 1, 141, 204, 23, 1, 83, 207, 204, 0, 141, 204, 24, 1, 0, 66, 204, 0, 141, 204, 24, 1, 4, 107, 116, 204, 25, 204, 33, 1, 143, 204, 25, 1, 141, 207, 25, 1, 3, 204, 207, 71, 143, 204, 26, 1, 141, 207, 26, 1, 141, 206, 10, 1, 33, 206, 206, 0, 38, 206, 206, 1, 3, 207, 207, 206, 3, 204, 207, 107, 143, 204, 28, 1, 1, 207, 32, 0, 141, 206, 28, 1, 134, 204, 0, 0, 240, 158, 0, 0, 0, 207, 2, 206, 4, 0, 0, 0, 134, 204, 0, 0, 20, 187, 0, 0, 0, 34, 33, 0, 1, 206, 48, 0, 141, 207, 28, 1, 2, 205, 0, 0, 0, 0, 1, 0, 21, 205, 4, 205, 134, 204, 0, 0, 240, 158, 0, 0, 0, 206, 2, 207, 205, 0, 0, 0, 141, 204, 12, 1, 32, 204, 204, 102, 121, 204, 193, 0, 16, 204, 94, 104, 143, 204, 29, 1, 141, 204, 29, 1, 125, 26, 204, 94, 104, 0, 0, 0, 0, 91, 26, 0, 82, 204, 91, 0, 143, 204, 30, 1, 141, 205, 30, 1, 1, 207, 0, 0, 141, 206, 88, 1, 3, 206, 206, 200, 25, 206, 206, 9, 134, 204, 0, 0, 156, 106, 0, 0, 205, 207, 206, 0, 143, 204, 31, 1, 13, 204, 91, 26, 143, 204, 32, 1, 141, 204, 32, 1, 121, 204, 18, 0, 141, 204, 31, 1, 141, 206, 88, 1, 3, 206, 206, 200, 25, 206, 206, 9, 45, 204, 204, 206, 136, 17, 0, 0, 141, 204, 88, 1, 3, 204, 204, 200, 1, 206, 48, 0, 107, 204, 8, 206, 141, 206, 88, 1, 3, 206, 206, 200, 25, 40, 206, 8, 119, 0, 34, 0, 141, 206, 31, 1, 0, 40, 206, 0, 119, 0, 31, 0, 141, 206, 88, 1, 3, 206, 206, 200, 141, 204, 31, 1, 48, 206, 206, 204, 4, 18, 0, 0, 141, 204, 88, 1, 3, 204, 204, 200, 1, 207, 48, 0, 141, 205, 31, 1, 141, 203, 83, 1, 4, 205, 205, 203, 135, 206, 2, 0, 204, 207, 205, 0, 141, 206, 31, 1, 0, 19, 206, 0, 26, 206, 19, 1, 143, 206, 33, 1, 141, 206, 88, 1, 3, 206, 206, 200, 141, 205, 33, 1, 48, 206, 206, 205, 248, 17, 0, 0, 141, 206, 33, 1, 0, 19, 206, 0, 119, 0, 247, 255, 141, 206, 33, 1, 0, 40, 206, 0, 119, 0, 3, 0, 141, 206, 31, 1, 0, 40, 206, 0, 0, 206, 40, 0, 143, 206, 34, 1, 141, 205, 88, 1, 3, 205, 205, 200, 25, 205, 205, 9, 141, 207, 34, 1, 4, 205, 205, 207, 134, 206, 0, 0, 20, 187, 0, 0, 0, 40, 205, 0, 25, 206, 91, 4, 143, 206, 35, 1, 141, 206, 35, 1, 55, 206, 94, 206, 84, 18, 0, 0, 141, 206, 35, 1, 0, 91, 206, 0, 119, 0, 177, 255, 141, 206, 10, 1, 32, 206, 206, 0, 120, 206, 5, 0, 1, 205, 1, 0, 134, 206, 0, 0, 20, 187, 0, 0, 0, 202, 205, 0, 141, 205, 35, 1, 16, 206, 205, 100, 143, 206, 36, 1, 1, 205, 0, 0, 15, 206, 205, 71, 143, 206, 37, 1, 141, 206, 36, 1, 141, 205, 37, 1, 19, 206, 206, 205, 121, 206, 78, 0, 0, 79, 71, 0, 141, 206, 35, 1, 0, 98, 206, 0, 82, 206, 98, 0, 143, 206, 38, 1, 141, 205, 38, 1, 1, 207, 0, 0, 141, 204, 88, 1, 3, 204, 204, 200, 25, 204, 204, 9, 134, 206, 0, 0, 156, 106, 0, 0, 205, 207, 204, 0, 143, 206, 39, 1, 141, 206, 88, 1, 3, 206, 206, 200, 141, 204, 39, 1, 48, 206, 206, 204, 64, 19, 0, 0, 141, 204, 88, 1, 3, 204, 204, 200, 1, 207, 48, 0, 141, 205, 39, 1, 141, 203, 83, 1, 4, 205, 205, 203, 135, 206, 2, 0, 204, 207, 205, 0, 141, 206, 39, 1, 0, 18, 206, 0, 26, 206, 18, 1, 143, 206, 40, 1, 141, 206, 88, 1, 3, 206, 206, 200, 141, 205, 40, 1, 48, 206, 206, 205, 52, 19, 0, 0, 141, 206, 40, 1, 0, 18, 206, 0, 119, 0, 247, 255, 141, 206, 40, 1, 0, 17, 206, 0, 119, 0, 3, 0, 141, 206, 39, 1, 0, 17, 206, 0, 34, 206, 79, 9, 143, 206, 42, 1, 141, 205, 42, 1, 1, 207, 9, 0, 125, 206, 205, 79, 207, 0, 0, 0, 143, 206, 43, 1, 141, 207, 43, 1, 134, 206, 0, 0, 20, 187, 0, 0, 0, 17, 207, 0, 25, 206, 98, 4, 143, 206, 44, 1, 26, 206, 79, 9, 143, 206, 45, 1, 141, 207, 44, 1, 16, 206, 207, 100, 143, 206, 46, 1, 1, 207, 9, 0, 15, 206, 207, 79, 143, 206, 47, 1, 141, 206, 46, 1, 141, 207, 47, 1, 19, 206, 206, 207, 121, 206, 6, 0, 141, 206, 45, 1, 0, 79, 206, 0, 141, 206, 44, 1, 0, 98, 206, 0, 119, 0, 186, 255, 141, 206, 45, 1, 0, 78, 206, 0, 119, 0, 2, 0, 0, 78, 71, 0, 25, 206, 78, 9, 143, 206, 48, 1, 1, 207, 48, 0, 141, 205, 48, 1, 1, 204, 9, 0, 1, 203, 0, 0, 134, 206, 0, 0, 240, 158, 0, 0, 0, 207, 205, 204, 203, 0, 0, 0, 119, 0, 159, 0, 25, 206, 104, 4, 143, 206, 49, 1, 141, 206, 49, 1, 125, 101, 105, 100, 206, 0, 0, 0, 1, 203, 255, 255, 15, 206, 203, 71, 143, 206, 50, 1, 141, 206, 50, 1, 121, 206, 131, 0, 32, 206, 111, 0, 143, 206, 51, 1, 0, 96, 71, 0, 0, 99, 104, 0, 82, 206, 99, 0, 143, 206, 52, 1, 141, 203, 52, 1, 1, 204, 0, 0, 141, 205, 88, 1, 3, 205, 205, 200, 25, 205, 205, 9, 134, 206, 0, 0, 156, 106, 0, 0, 203, 204, 205, 0, 143, 206, 53, 1, 141, 206, 53, 1, 141, 205, 88, 1, 3, 205, 205, 200, 25, 205, 205, 9, 45, 206, 206, 205, 152, 20, 0, 0, 141, 206, 88, 1, 3, 206, 206, 200, 1, 205, 48, 0, 107, 206, 8, 205, 141, 205, 88, 1, 3, 205, 205, 200, 25, 16, 205, 8, 119, 0, 3, 0, 141, 205, 53, 1, 0, 16, 205, 0, 13, 205, 99, 104, 143, 205, 54, 1, 141, 205, 54, 1, 121, 205, 23, 0, 25, 205, 16, 1, 143, 205, 57, 1, 1, 206, 1, 0, 134, 205, 0, 0, 20, 187, 0, 0, 0, 16, 206, 0, 34, 205, 96, 1, 143, 205, 58, 1, 141, 205, 51, 1, 141, 206, 58, 1, 19, 205, 205, 206, 121, 205, 4, 0, 141, 205, 57, 1, 0, 59, 205, 0, 119, 0, 41, 0, 1, 206, 1, 0, 134, 205, 0, 0, 20, 187, 0, 0, 0, 202, 206, 0, 141, 205, 57, 1, 0, 59, 205, 0, 119, 0, 34, 0, 141, 206, 88, 1, 3, 206, 206, 200, 16, 205, 206, 16, 143, 205, 55, 1, 141, 205, 55, 1, 120, 205, 3, 0, 0, 59, 16, 0, 119, 0, 26, 0, 1, 206, 0, 0, 141, 204, 83, 1, 4, 206, 206, 204, 3, 205, 16, 206, 143, 205, 86, 1, 141, 206, 88, 1, 3, 206, 206, 200, 1, 204, 48, 0, 141, 203, 86, 1, 135, 205, 2, 0, 206, 204, 203, 0, 0, 58, 16, 0, 26, 205, 58, 1, 143, 205, 56, 1, 141, 205, 88, 1, 3, 205, 205, 200, 141, 203, 56, 1, 48, 205, 205, 203, 128, 21, 0, 0, 141, 205, 56, 1, 0, 58, 205, 0, 119, 0, 247, 255, 141, 205, 56, 1, 0, 59, 205, 0, 119, 0, 1, 0, 0, 205, 59, 0, 143, 205, 59, 1, 141, 203, 88, 1, 3, 203, 203, 200, 25, 203, 203, 9, 141, 204, 59, 1, 4, 205, 203, 204, 143, 205, 60, 1, 141, 204, 60, 1, 15, 205, 204, 96, 143, 205, 61, 1, 141, 204, 61, 1, 141, 203, 60, 1, 125, 205, 204, 203, 96, 0, 0, 0, 143, 205, 62, 1, 141, 203, 62, 1, 134, 205, 0, 0, 20, 187, 0, 0, 0, 59, 203, 0, 141, 203, 60, 1, 4, 205, 96, 203, 143, 205, 63, 1, 25, 205, 99, 4, 143, 205, 64, 1, 141, 205, 64, 1, 16, 205, 205, 101, 1, 203, 255, 255, 141, 204, 63, 1, 15, 203, 203, 204, 19, 205, 205, 203, 121, 205, 6, 0, 141, 205, 63, 1, 0, 96, 205, 0, 141, 205, 64, 1, 0, 99, 205, 0, 119, 0, 134, 255, 141, 205, 63, 1, 0, 83, 205, 0, 119, 0, 2, 0, 0, 83, 71, 0, 25, 205, 83, 18, 143, 205, 66, 1, 1, 203, 48, 0, 141, 204, 66, 1, 1, 206, 18, 0, 1, 207, 0, 0, 134, 205, 0, 0, 240, 158, 0, 0, 0, 203, 204, 206, 207, 0, 0, 0, 0, 205, 66, 0, 143, 205, 67, 1, 141, 207, 67, 1, 4, 207, 116, 207, 134, 205, 0, 0, 20, 187, 0, 0, 0, 66, 207, 0, 1, 207, 32, 0, 141, 206, 28, 1, 1, 204, 0, 32, 21, 204, 4, 204, 134, 205, 0, 0, 240, 158, 0, 0, 0, 207, 2, 206, 204, 0, 0, 0, 141, 205, 28, 1, 0, 114, 205, 0, 119, 0, 55, 0, 38, 204, 5, 32, 33, 204, 204, 0, 1, 206, 161, 13, 1, 207, 165, 13, 125, 205, 204, 206, 207, 0, 0, 0, 143, 205, 11, 1, 70, 207, 20, 20, 59, 206, 0, 0, 59, 204, 0, 0, 70, 206, 206, 204, 20, 207, 207, 206, 0, 205, 207, 0, 143, 205, 17, 1, 38, 207, 5, 32, 33, 207, 207, 0, 1, 206, 169, 13, 1, 204, 173, 13, 125, 205, 207, 206, 204, 0, 0, 0, 143, 205, 21, 1, 141, 205, 17, 1, 141, 204, 21, 1, 141, 206, 11, 1, 125, 30, 205, 204, 206, 0, 0, 0, 25, 206, 33, 3, 143, 206, 27, 1, 1, 204, 32, 0, 141, 205, 27, 1, 2, 207, 0, 0, 255, 255, 254, 255, 19, 207, 4, 207, 134, 206, 0, 0, 240, 158, 0, 0, 0, 204, 2, 205, 207, 0, 0, 0, 134, 206, 0, 0, 20, 187, 0, 0, 0, 34, 33, 0, 1, 207, 3, 0, 134, 206, 0, 0, 20, 187, 0, 0, 0, 30, 207, 0, 1, 207, 32, 0, 141, 205, 27, 1, 1, 204, 0, 32, 21, 204, 4, 204, 134, 206, 0, 0, 240, 158, 0, 0, 0, 207, 2, 205, 204, 0, 0, 0, 141, 206, 27, 1, 0, 114, 206, 0, 15, 206, 114, 2, 143, 206, 68, 1, 141, 206, 68, 1, 125, 93, 206, 2, 114, 0, 0, 0, 141, 206, 88, 1, 137, 206, 0, 0, 139, 93, 0, 0, 140, 5, 59, 1, 0, 0, 0, 0, 2, 200, 0, 0, 125, 13, 0, 0, 2, 201, 0, 0, 255, 0, 0, 0, 2, 202, 0, 0, 137, 40, 1, 0, 1, 203, 0, 0, 143, 203, 57, 1, 136, 204, 0, 0, 0, 203, 204, 0, 143, 203, 58, 1, 136, 203, 0, 0, 25, 203, 203, 64, 137, 203, 0, 0, 130, 203, 0, 0, 136, 204, 0, 0, 49, 203, 203, 204, 244, 23, 0, 0, 1, 204, 64, 0, 135, 203, 0, 0, 204, 0, 0, 0, 141, 203, 58, 1, 109, 203, 16, 1, 141, 203, 58, 1, 25, 203, 203, 24, 25, 81, 203, 40, 1, 22, 0, 0, 1, 23, 0, 0, 1, 33, 0, 0, 0, 133, 1, 0, 1, 203, 255, 255, 15, 101, 203, 23, 121, 101, 15, 0, 2, 203, 0, 0, 255, 255, 255, 127, 4, 105, 203, 23, 15, 109, 105, 22, 121, 109, 7, 0, 134, 115, 0, 0, 100, 189, 0, 0, 1, 203, 75, 0, 85, 115, 203, 0, 1, 42, 255, 255, 119, 0, 5, 0, 3, 123, 22, 23, 0, 42, 123, 0, 119, 0, 2, 0, 0, 42, 23, 0, 78, 127, 133, 0, 41, 203, 127, 24, 42, 203, 203, 24, 32, 203, 203, 0, 121, 203, 4, 0, 1, 203, 87, 0, 143, 203, 57, 1, 119, 0, 49, 5, 0, 140, 127, 0, 0, 152, 133, 0, 41, 203, 140, 24, 42, 203, 203, 24, 1, 204, 0, 0, 1, 205, 38, 0, 138, 203, 204, 205, 56, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 72, 25, 0, 0, 119, 0, 10, 0, 0, 24, 152, 0, 0, 204, 152, 0, 143, 204, 15, 1, 119, 0, 13, 0, 0, 25, 152, 0, 0, 164, 152, 0, 1, 204, 9, 0, 143, 204, 57, 1, 119, 0, 8, 0, 25, 143, 152, 1, 141, 203, 58, 1, 109, 203, 16, 143, 78, 72, 143, 0, 0, 140, 72, 0, 0, 152, 143, 0, 119, 0, 197, 255, 141, 203, 57, 1, 32, 203, 203, 9, 121, 203, 33, 0, 1, 203, 0, 0, 143, 203, 57, 1, 25, 157, 164, 1, 78, 169, 157, 0, 41, 203, 169, 24, 42, 203, 203, 24, 32, 203, 203, 37, 120, 203, 5, 0, 0, 24, 25, 0, 0, 203, 164, 0, 143, 203, 15, 1, 119, 0, 21, 0, 25, 184, 25, 1, 25, 194, 164, 2, 141, 203, 58, 1, 109, 203, 16, 194, 78, 203, 194, 0, 143, 203, 3, 1, 141, 203, 3, 1, 41, 203, 203, 24, 42, 203, 203, 24, 32, 203, 203, 37, 121, 203, 6, 0, 0, 25, 184, 0, 0, 164, 194, 0, 1, 203, 9, 0, 143, 203, 57, 1, 119, 0, 229, 255, 0, 24, 184, 0, 0, 203, 194, 0, 143, 203, 15, 1, 119, 0, 1, 0, 0, 203, 24, 0, 143, 203, 12, 1, 0, 203, 133, 0, 143, 203, 13, 1, 1, 203, 0, 0, 46, 203, 0, 203, 56, 26, 0, 0, 141, 204, 12, 1, 141, 205, 13, 1, 4, 204, 204, 205, 134, 203, 0, 0, 20, 187, 0, 0, 0, 133, 204, 0, 141, 203, 12, 1, 141, 204, 13, 1, 4, 203, 203, 204, 32, 203, 203, 0, 120, 203, 10, 0, 0, 34, 33, 0, 141, 203, 12, 1, 141, 204, 13, 1, 4, 22, 203, 204, 0, 23, 42, 0, 141, 204, 15, 1, 0, 133, 204, 0, 0, 33, 34, 0, 119, 0, 107, 255, 141, 203, 15, 1, 25, 204, 203, 1, 143, 204, 14, 1, 141, 203, 14, 1, 78, 204, 203, 0, 143, 204, 16, 1, 141, 204, 16, 1, 41, 204, 204, 24, 42, 204, 204, 24, 26, 204, 204, 48, 35, 204, 204, 10, 121, 204, 46, 0, 141, 203, 15, 1, 25, 204, 203, 2, 143, 204, 17, 1, 141, 203, 17, 1, 78, 204, 203, 0, 143, 204, 18, 1, 141, 203, 15, 1, 25, 204, 203, 3, 143, 204, 19, 1, 141, 204, 18, 1, 41, 204, 204, 24, 42, 204, 204, 24, 32, 204, 204, 36, 141, 203, 19, 1, 141, 205, 14, 1, 125, 66, 204, 203, 205, 0, 0, 0, 141, 205, 18, 1, 41, 205, 205, 24, 42, 205, 205, 24, 32, 205, 205, 36, 1, 203, 1, 0, 125, 9, 205, 203, 33, 0, 0, 0, 141, 204, 18, 1, 41, 204, 204, 24, 42, 204, 204, 24, 32, 204, 204, 36, 121, 204, 7, 0, 141, 204, 16, 1, 41, 204, 204, 24, 42, 204, 204, 24, 26, 204, 204, 48, 0, 205, 204, 0, 119, 0, 3, 0, 1, 204, 255, 255, 0, 205, 204, 0, 0, 203, 205, 0, 143, 203, 51, 1, 141, 203, 51, 1, 0, 27, 203, 0, 0, 48, 9, 0, 0, 203, 66, 0, 143, 203, 53, 1, 119, 0, 6, 0, 1, 27, 255, 255, 0, 48, 33, 0, 141, 205, 14, 1, 0, 203, 205, 0, 143, 203, 53, 1, 141, 203, 58, 1, 141, 205, 53, 1, 109, 203, 16, 205, 141, 203, 53, 1, 78, 205, 203, 0, 143, 205, 20, 1, 141, 205, 20, 1, 41, 205, 205, 24, 42, 205, 205, 24, 26, 205, 205, 32, 35, 205, 205, 32, 121, 205, 70, 0, 1, 32, 0, 0, 141, 203, 20, 1, 0, 205, 203, 0, 143, 205, 9, 1, 141, 203, 20, 1, 41, 203, 203, 24, 42, 203, 203, 24, 26, 205, 203, 32, 143, 205, 22, 1, 141, 203, 53, 1, 0, 205, 203, 0, 143, 205, 54, 1, 1, 203, 1, 0, 141, 204, 22, 1, 22, 203, 203, 204, 0, 205, 203, 0, 143, 205, 21, 1, 141, 205, 21, 1, 19, 205, 205, 202, 32, 205, 205, 0, 121, 205, 8, 0, 0, 31, 32, 0, 141, 205, 9, 1, 0, 71, 205, 0, 141, 203, 54, 1, 0, 205, 203, 0, 143, 205, 28, 1, 119, 0, 48, 0, 141, 203, 21, 1, 20, 203, 203, 32, 0, 205, 203, 0, 143, 205, 23, 1, 141, 203, 54, 1, 25, 205, 203, 1, 143, 205, 24, 1, 141, 205, 58, 1, 141, 203, 24, 1, 109, 205, 16, 203, 141, 205, 24, 1, 78, 203, 205, 0, 143, 203, 25, 1, 141, 203, 25, 1, 41, 203, 203, 24, 42, 203, 203, 24, 26, 203, 203, 32, 35, 203, 203, 32, 121, 203, 15, 0, 141, 203, 23, 1, 0, 32, 203, 0, 141, 205, 25, 1, 0, 203, 205, 0, 143, 203, 9, 1, 141, 205, 25, 1, 41, 205, 205, 24, 42, 205, 205, 24, 26, 203, 205, 32, 143, 203, 22, 1, 141, 205, 24, 1, 0, 203, 205, 0, 143, 203, 54, 1, 119, 0, 208, 255, 141, 203, 23, 1, 0, 31, 203, 0, 141, 203, 25, 1, 0, 71, 203, 0, 141, 205, 24, 1, 0, 203, 205, 0, 143, 203, 28, 1, 119, 0, 7, 0, 1, 31, 0, 0, 141, 203, 20, 1, 0, 71, 203, 0, 141, 205, 53, 1, 0, 203, 205, 0, 143, 203, 28, 1, 41, 205, 71, 24, 42, 205, 205, 24, 32, 203, 205, 42, 143, 203, 26, 1, 141, 203, 26, 1, 121, 203, 135, 0, 141, 205, 28, 1, 25, 203, 205, 1, 143, 203, 27, 1, 141, 205, 27, 1, 78, 203, 205, 0, 143, 203, 29, 1, 141, 203, 29, 1, 41, 203, 203, 24, 42, 203, 203, 24, 26, 203, 203, 48, 35, 203, 203, 10, 121, 203, 48, 0, 141, 205, 28, 1, 25, 203, 205, 2, 143, 203, 30, 1, 141, 205, 30, 1, 78, 203, 205, 0, 143, 203, 31, 1, 141, 203, 31, 1, 41, 203, 203, 24, 42, 203, 203, 24, 32, 203, 203, 36, 121, 203, 34, 0, 141, 203, 29, 1, 41, 203, 203, 24, 42, 203, 203, 24, 26, 203, 203, 48, 41, 203, 203, 2, 1, 205, 10, 0, 97, 4, 203, 205, 141, 203, 27, 1, 78, 205, 203, 0, 143, 205, 32, 1, 141, 203, 32, 1, 41, 203, 203, 24, 42, 203, 203, 24, 26, 203, 203, 48, 41, 203, 203, 3, 3, 205, 3, 203, 143, 205, 33, 1, 141, 203, 33, 1, 82, 205, 203, 0, 143, 205, 34, 1, 141, 203, 33, 1, 106, 205, 203, 4, 143, 205, 35, 1, 141, 203, 28, 1, 25, 205, 203, 3, 143, 205, 36, 1, 141, 205, 34, 1, 0, 30, 205, 0, 1, 59, 1, 0, 141, 203, 36, 1, 0, 205, 203, 0, 143, 205, 55, 1, 119, 0, 6, 0, 1, 205, 23, 0, 143, 205, 57, 1, 119, 0, 3, 0, 1, 205, 23, 0, 143, 205, 57, 1, 141, 205, 57, 1, 32, 205, 205, 23, 121, 205, 44, 0, 1, 205, 0, 0, 143, 205, 57, 1, 32, 205, 48, 0, 143, 205, 37, 1, 141, 205, 37, 1, 120, 205, 3, 0, 1, 12, 255, 255, 119, 0, 210, 3, 1, 205, 0, 0, 46, 205, 0, 205, 116, 30, 0, 0, 82, 205, 2, 0, 143, 205, 49, 1, 141, 203, 49, 1, 1, 204, 0, 0, 25, 204, 204, 4, 26, 204, 204, 1, 3, 203, 203, 204, 1, 204, 0, 0, 25, 204, 204, 4, 26, 204, 204, 1, 40, 204, 204, 255, 19, 203, 203, 204, 0, 205, 203, 0, 143, 205, 38, 1, 141, 203, 38, 1, 82, 205, 203, 0, 143, 205, 39, 1, 141, 205, 38, 1, 25, 205, 205, 4, 85, 2, 205, 0, 141, 205, 39, 1, 0, 30, 205, 0, 1, 59, 0, 0, 141, 203, 27, 1, 0, 205, 203, 0, 143, 205, 55, 1, 119, 0, 6, 0, 1, 30, 0, 0, 1, 59, 0, 0, 141, 203, 27, 1, 0, 205, 203, 0, 143, 205, 55, 1, 141, 205, 58, 1, 141, 203, 55, 1, 109, 205, 16, 203, 34, 203, 30, 0, 143, 203, 40, 1, 1, 205, 0, 32, 20, 205, 31, 205, 0, 203, 205, 0, 143, 203, 41, 1, 1, 205, 0, 0, 4, 203, 205, 30, 143, 203, 42, 1, 141, 203, 40, 1, 141, 205, 41, 1, 125, 8, 203, 205, 31, 0, 0, 0, 141, 205, 40, 1, 141, 203, 42, 1, 125, 7, 205, 203, 30, 0, 0, 0, 0, 45, 7, 0, 0, 46, 8, 0, 0, 64, 59, 0, 141, 205, 55, 1, 0, 203, 205, 0, 143, 203, 45, 1, 119, 0, 20, 0, 141, 205, 58, 1, 25, 205, 205, 16, 134, 203, 0, 0, 0, 164, 0, 0, 205, 0, 0, 0, 143, 203, 43, 1, 141, 203, 43, 1, 34, 203, 203, 0, 121, 203, 3, 0, 1, 12, 255, 255, 119, 0, 137, 3, 141, 203, 58, 1, 106, 73, 203, 16, 141, 203, 43, 1, 0, 45, 203, 0, 0, 46, 31, 0, 0, 64, 48, 0, 0, 203, 73, 0, 143, 203, 45, 1, 141, 205, 45, 1, 78, 203, 205, 0, 143, 203, 44, 1, 141, 203, 44, 1, 41, 203, 203, 24, 42, 203, 203, 24, 32, 203, 203, 46, 121, 203, 101, 0, 141, 205, 45, 1, 25, 203, 205, 1, 143, 203, 46, 1, 141, 205, 46, 1, 78, 203, 205, 0, 143, 203, 47, 1, 141, 203, 47, 1, 41, 203, 203, 24, 42, 203, 203, 24, 32, 203, 203, 42, 120, 203, 15, 0, 141, 203, 45, 1, 25, 89, 203, 1, 141, 203, 58, 1, 109, 203, 16, 89, 141, 203, 58, 1, 25, 203, 203, 16, 134, 90, 0, 0, 0, 164, 0, 0, 203, 0, 0, 0, 141, 203, 58, 1, 106, 75, 203, 16, 0, 28, 90, 0, 0, 74, 75, 0, 119, 0, 79, 0, 141, 205, 45, 1, 25, 203, 205, 2, 143, 203, 48, 1, 141, 203, 48, 1, 78, 77, 203, 0, 41, 203, 77, 24, 42, 203, 203, 24, 26, 203, 203, 48, 35, 203, 203, 10, 121, 203, 30, 0, 141, 203, 45, 1, 25, 78, 203, 3, 78, 79, 78, 0, 41, 203, 79, 24, 42, 203, 203, 24, 32, 203, 203, 36, 121, 203, 23, 0, 41, 203, 77, 24, 42, 203, 203, 24, 26, 203, 203, 48, 41, 203, 203, 2, 1, 205, 10, 0, 97, 4, 203, 205, 141, 205, 48, 1, 78, 80, 205, 0, 41, 205, 80, 24, 42, 205, 205, 24, 26, 205, 205, 48, 41, 205, 205, 3, 3, 82, 3, 205, 82, 83, 82, 0, 106, 84, 82, 4, 141, 205, 45, 1, 25, 85, 205, 4, 141, 205, 58, 1, 109, 205, 16, 85, 0, 28, 83, 0, 0, 74, 85, 0, 119, 0, 40, 0, 32, 86, 64, 0, 120, 86, 3, 0, 1, 12, 255, 255, 119, 0, 53, 3, 1, 205, 0, 0, 46, 205, 0, 205, 200, 32, 0, 0, 82, 205, 2, 0, 143, 205, 50, 1, 141, 205, 50, 1, 1, 203, 0, 0, 25, 203, 203, 4, 26, 203, 203, 1, 3, 205, 205, 203, 1, 203, 0, 0, 25, 203, 203, 4, 26, 203, 203, 1, 40, 203, 203, 255, 19, 205, 205, 203, 0, 87, 205, 0, 82, 88, 87, 0, 25, 205, 87, 4, 85, 2, 205, 0, 0, 205, 88, 0, 143, 205, 10, 1, 119, 0, 3, 0, 1, 205, 0, 0, 143, 205, 10, 1, 141, 205, 58, 1, 141, 203, 48, 1, 109, 205, 16, 203, 141, 203, 10, 1, 0, 28, 203, 0, 141, 203, 48, 1, 0, 74, 203, 0, 119, 0, 4, 0, 1, 28, 255, 255, 141, 203, 45, 1, 0, 74, 203, 0, 1, 26, 0, 0, 0, 92, 74, 0, 78, 91, 92, 0, 1, 203, 57, 0, 41, 205, 91, 24, 42, 205, 205, 24, 26, 205, 205, 65, 48, 203, 203, 205, 40, 33, 0, 0, 1, 12, 255, 255, 119, 0, 7, 3, 25, 93, 92, 1, 141, 203, 58, 1, 109, 203, 16, 93, 78, 94, 92, 0, 1, 203, 173, 11, 27, 205, 26, 58, 3, 203, 203, 205, 41, 205, 94, 24, 42, 205, 205, 24, 26, 205, 205, 65, 3, 95, 203, 205, 78, 96, 95, 0, 19, 205, 96, 201, 26, 205, 205, 1, 35, 205, 205, 8, 121, 205, 5, 0, 19, 205, 96, 201, 0, 26, 205, 0, 0, 92, 93, 0, 119, 0, 228, 255, 41, 205, 96, 24, 42, 205, 205, 24, 32, 205, 205, 0, 121, 205, 3, 0, 1, 12, 255, 255, 119, 0, 237, 2, 1, 205, 255, 255, 15, 97, 205, 27, 41, 205, 96, 24, 42, 205, 205, 24, 32, 205, 205, 19, 121, 205, 7, 0, 121, 97, 3, 0, 1, 12, 255, 255, 119, 0, 228, 2, 1, 205, 49, 0, 143, 205, 57, 1, 119, 0, 27, 0, 121, 97, 16, 0, 41, 205, 27, 2, 3, 98, 4, 205, 19, 205, 96, 201, 85, 98, 205, 0, 41, 205, 27, 3, 3, 99, 3, 205, 82, 100, 99, 0, 106, 102, 99, 4, 141, 205, 58, 1, 85, 205, 100, 0, 141, 205, 58, 1, 109, 205, 4, 102, 1, 205, 49, 0, 143, 205, 57, 1, 119, 0, 11, 0, 1, 205, 0, 0, 53, 205, 0, 205, 20, 34, 0, 0, 1, 12, 0, 0, 119, 0, 204, 2, 141, 203, 58, 1, 19, 204, 96, 201, 134, 205, 0, 0, 76, 46, 0, 0, 203, 204, 2, 0, 141, 205, 57, 1, 32, 205, 205, 49, 121, 205, 11, 0, 1, 205, 0, 0, 143, 205, 57, 1, 1, 205, 0, 0, 53, 205, 0, 205, 92, 34, 0, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 112, 253, 78, 103, 92, 0, 33, 104, 26, 0, 41, 204, 103, 24, 42, 204, 204, 24, 38, 204, 204, 15, 32, 204, 204, 3, 19, 204, 104, 204, 121, 204, 6, 0, 41, 204, 103, 24, 42, 204, 204, 24, 38, 204, 204, 223, 0, 205, 204, 0, 119, 0, 4, 0, 41, 204, 103, 24, 42, 204, 204, 24, 0, 205, 204, 0, 0, 17, 205, 0, 1, 205, 0, 32, 19, 205, 46, 205, 0, 106, 205, 0, 2, 205, 0, 0, 255, 255, 254, 255, 19, 205, 46, 205, 0, 107, 205, 0, 32, 205, 106, 0, 125, 47, 205, 46, 107, 0, 0, 0, 1, 204, 65, 0, 1, 203, 56, 0, 138, 17, 204, 203, 208, 35, 0, 0, 180, 35, 0, 0, 212, 35, 0, 0, 180, 35, 0, 0, 40, 36, 0, 0, 44, 36, 0, 0, 48, 36, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 52, 36, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 132, 36, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 136, 36, 0, 0, 180, 35, 0, 0, 140, 36, 0, 0, 208, 36, 0, 0, 136, 37, 0, 0, 180, 37, 0, 0, 184, 37, 0, 0, 180, 35, 0, 0, 188, 37, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 192, 37, 0, 0, 232, 37, 0, 0, 88, 39, 0, 0, 204, 39, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 252, 39, 0, 0, 180, 35, 0, 0, 40, 40, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 84, 40, 0, 0, 0, 49, 133, 0, 1, 50, 0, 0, 1, 51, 125, 13, 0, 54, 81, 0, 0, 69, 28, 0, 0, 70, 47, 0, 119, 0, 40, 1, 119, 0, 110, 0, 141, 204, 58, 1, 82, 170, 204, 0, 141, 204, 58, 1, 106, 171, 204, 4, 141, 204, 58, 1, 109, 204, 8, 170, 141, 204, 58, 1, 25, 204, 204, 8, 1, 205, 0, 0, 109, 204, 4, 205, 141, 205, 58, 1, 141, 204, 58, 1, 25, 204, 204, 8, 85, 205, 204, 0, 1, 67, 255, 255, 141, 205, 58, 1, 25, 204, 205, 8, 143, 204, 11, 1, 1, 204, 75, 0, 143, 204, 57, 1, 119, 0, 18, 1, 119, 0, 88, 0, 119, 0, 87, 0, 119, 0, 86, 0, 141, 204, 58, 1, 82, 76, 204, 0, 32, 172, 28, 0, 121, 172, 11, 0, 1, 205, 32, 0, 1, 203, 0, 0, 134, 204, 0, 0, 240, 158, 0, 0, 0, 205, 45, 203, 47, 0, 0, 0, 1, 20, 0, 0, 1, 204, 84, 0, 143, 204, 57, 1, 119, 0, 1, 1, 0, 67, 28, 0, 0, 204, 76, 0, 143, 204, 11, 1, 1, 204, 75, 0, 143, 204, 57, 1, 119, 0, 251, 0, 119, 0, 244, 0, 119, 0, 64, 0, 141, 204, 58, 1, 82, 158, 204, 0, 141, 204, 58, 1, 106, 159, 204, 4, 141, 204, 58, 1, 25, 204, 204, 24, 19, 205, 158, 201, 107, 204, 39, 205, 141, 205, 58, 1, 25, 205, 205, 24, 25, 49, 205, 39, 1, 50, 0, 0, 1, 51, 125, 13, 0, 54, 81, 0, 1, 69, 1, 0, 0, 70, 107, 0, 119, 0, 232, 0, 141, 205, 58, 1, 82, 138, 205, 0, 141, 205, 58, 1, 106, 139, 205, 4, 34, 205, 139, 0, 121, 205, 19, 0, 1, 205, 0, 0, 1, 204, 0, 0, 134, 141, 0, 0, 64, 188, 0, 0, 205, 204, 138, 139, 128, 204, 0, 0, 0, 142, 204, 0, 141, 204, 58, 1, 85, 204, 141, 0, 141, 204, 58, 1, 109, 204, 4, 142, 1, 16, 1, 0, 1, 18, 125, 13, 0, 144, 141, 0, 0, 145, 142, 0, 1, 204, 66, 0, 143, 204, 57, 1, 119, 0, 208, 0, 38, 204, 47, 1, 32, 204, 204, 0, 1, 205, 127, 13, 125, 5, 204, 200, 205, 0, 0, 0, 1, 205, 0, 8, 19, 205, 47, 205, 32, 205, 205, 0, 1, 204, 126, 13, 125, 6, 205, 5, 204, 0, 0, 0, 1, 204, 1, 8, 19, 204, 47, 204, 33, 204, 204, 0, 38, 204, 204, 1, 0, 16, 204, 0, 0, 18, 6, 0, 0, 144, 138, 0, 0, 145, 139, 0, 1, 204, 66, 0, 143, 204, 57, 1, 119, 0, 186, 0, 141, 204, 58, 1, 86, 190, 204, 0, 134, 191, 0, 0, 0, 0, 0, 0, 0, 190, 45, 28, 47, 17, 0, 0, 0, 22, 191, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 154, 252, 119, 0, 245, 255, 119, 0, 244, 255, 119, 0, 197, 255, 134, 160, 0, 0, 100, 189, 0, 0, 82, 161, 160, 0, 134, 162, 0, 0, 8, 188, 0, 0, 161, 0, 0, 0, 0, 35, 162, 0, 1, 205, 71, 0, 143, 205, 57, 1, 119, 0, 162, 0, 19, 204, 26, 201, 0, 205, 204, 0, 143, 205, 56, 1, 141, 205, 56, 1, 41, 205, 205, 24, 42, 205, 205, 24, 1, 204, 0, 0, 1, 203, 8, 0, 138, 205, 204, 203, 64, 38, 0, 0, 96, 38, 0, 0, 128, 38, 0, 0, 176, 38, 0, 0, 224, 38, 0, 0, 44, 38, 0, 0, 8, 39, 0, 0, 40, 39, 0, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 119, 252, 141, 204, 58, 1, 82, 111, 204, 0, 85, 111, 42, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 111, 252, 141, 204, 58, 1, 82, 112, 204, 0, 85, 112, 42, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 103, 252, 34, 113, 42, 0, 141, 204, 58, 1, 82, 114, 204, 0, 85, 114, 42, 0, 41, 203, 113, 31, 42, 203, 203, 31, 109, 114, 4, 203, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 91, 252, 2, 203, 0, 0, 255, 255, 0, 0, 19, 203, 42, 203, 0, 116, 203, 0, 141, 203, 58, 1, 82, 117, 203, 0, 84, 117, 116, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 79, 252, 19, 203, 42, 201, 0, 118, 203, 0, 141, 203, 58, 1, 82, 119, 203, 0, 83, 119, 118, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 69, 252, 141, 203, 58, 1, 82, 120, 203, 0, 85, 120, 42, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 61, 252, 34, 121, 42, 0, 141, 203, 58, 1, 82, 122, 203, 0, 85, 122, 42, 0, 41, 204, 121, 31, 42, 204, 204, 31, 109, 122, 4, 204, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 49, 252, 141, 205, 58, 1, 82, 134, 205, 0, 141, 205, 58, 1, 106, 135, 205, 4, 134, 136, 0, 0, 96, 165, 0, 0, 134, 135, 81, 0, 4, 205, 81, 136, 15, 137, 205, 28, 38, 204, 47, 8, 32, 204, 204, 0, 20, 204, 204, 137, 121, 204, 3, 0, 0, 205, 28, 0, 119, 0, 4, 0, 4, 204, 81, 136, 25, 204, 204, 1, 0, 205, 204, 0, 0, 29, 205, 0, 0, 13, 136, 0, 1, 37, 0, 0, 1, 39, 125, 13, 0, 55, 29, 0, 0, 68, 47, 0, 0, 150, 134, 0, 0, 153, 135, 0, 1, 205, 67, 0, 143, 205, 57, 1, 119, 0, 41, 0, 1, 205, 8, 0, 16, 124, 205, 28, 1, 205, 8, 0, 125, 125, 124, 28, 205, 0, 0, 0, 1, 38, 120, 0, 0, 44, 125, 0, 39, 205, 47, 8, 0, 63, 205, 0, 1, 205, 61, 0, 143, 205, 57, 1, 119, 0, 29, 0, 141, 205, 58, 1 ], eb + 0);
 HEAPU8.set([ 82, 163, 205, 0, 1, 205, 0, 0, 14, 205, 163, 205, 1, 204, 135, 13, 125, 165, 205, 163, 204, 0, 0, 0, 0, 35, 165, 0, 1, 204, 71, 0, 143, 204, 57, 1, 119, 0, 18, 0, 141, 204, 58, 1, 82, 108, 204, 0, 141, 204, 58, 1, 106, 110, 204, 4, 1, 16, 0, 0, 1, 18, 125, 13, 0, 144, 108, 0, 0, 145, 110, 0, 1, 204, 66, 0, 143, 204, 57, 1, 119, 0, 7, 0, 0, 38, 17, 0, 0, 44, 28, 0, 0, 63, 47, 0, 1, 205, 61, 0, 143, 205, 57, 1, 119, 0, 1, 0, 141, 204, 57, 1, 32, 204, 204, 61, 121, 204, 45, 0, 1, 204, 0, 0, 143, 204, 57, 1, 141, 204, 58, 1, 82, 126, 204, 0, 141, 204, 58, 1, 106, 128, 204, 4, 38, 204, 38, 32, 0, 129, 204, 0, 134, 130, 0, 0, 68, 163, 0, 0, 126, 128, 81, 129, 38, 204, 63, 8, 0, 131, 204, 0, 32, 203, 131, 0, 32, 205, 126, 0, 32, 206, 128, 0, 19, 205, 205, 206, 20, 203, 203, 205, 0, 204, 203, 0, 143, 204, 52, 1, 42, 204, 38, 4, 0, 132, 204, 0, 141, 203, 52, 1, 121, 203, 3, 0, 0, 204, 200, 0, 119, 0, 3, 0, 3, 203, 200, 132, 0, 204, 203, 0, 0, 60, 204, 0, 141, 204, 52, 1, 1, 203, 0, 0, 1, 205, 2, 0, 125, 61, 204, 203, 205, 0, 0, 0, 0, 13, 130, 0, 0, 37, 61, 0, 0, 39, 60, 0, 0, 55, 44, 0, 0, 68, 63, 0, 0, 150, 126, 0, 0, 153, 128, 0, 1, 205, 67, 0, 143, 205, 57, 1, 119, 0, 140, 0, 141, 205, 57, 1, 32, 205, 205, 66, 121, 205, 16, 0, 1, 205, 0, 0, 143, 205, 57, 1, 134, 146, 0, 0, 156, 106, 0, 0, 144, 145, 81, 0, 0, 13, 146, 0, 0, 37, 16, 0, 0, 39, 18, 0, 0, 55, 28, 0, 0, 68, 47, 0, 0, 150, 144, 0, 0, 153, 145, 0, 1, 205, 67, 0, 143, 205, 57, 1, 119, 0, 122, 0, 141, 205, 57, 1, 32, 205, 205, 71, 121, 205, 28, 0, 1, 205, 0, 0, 143, 205, 57, 1, 1, 205, 0, 0, 134, 166, 0, 0, 164, 77, 0, 0, 35, 205, 28, 0, 0, 167, 35, 0, 3, 168, 35, 28, 1, 203, 0, 0, 45, 203, 166, 203, 176, 41, 0, 0, 0, 205, 28, 0, 119, 0, 3, 0, 4, 203, 166, 167, 0, 205, 203, 0, 0, 62, 205, 0, 1, 205, 0, 0, 13, 205, 166, 205, 125, 43, 205, 168, 166, 0, 0, 0, 0, 49, 35, 0, 1, 50, 0, 0, 1, 51, 125, 13, 0, 54, 43, 0, 0, 69, 62, 0, 0, 70, 107, 0, 119, 0, 92, 0, 141, 205, 57, 1, 32, 205, 205, 75, 121, 205, 89, 0, 1, 205, 0, 0, 143, 205, 57, 1, 141, 205, 11, 1, 0, 15, 205, 0, 1, 21, 0, 0, 1, 41, 0, 0, 82, 173, 15, 0, 32, 205, 173, 0, 121, 205, 4, 0, 0, 19, 21, 0, 0, 53, 41, 0, 119, 0, 25, 0, 141, 205, 58, 1, 25, 205, 205, 20, 134, 174, 0, 0, 128, 187, 0, 0, 205, 173, 0, 0, 4, 175, 67, 21, 34, 205, 174, 0, 16, 203, 175, 174, 20, 205, 205, 203, 121, 205, 4, 0, 0, 19, 21, 0, 0, 53, 174, 0, 119, 0, 12, 0, 25, 176, 15, 4, 3, 177, 174, 21, 16, 178, 177, 67, 121, 178, 5, 0, 0, 15, 176, 0, 0, 21, 177, 0, 0, 41, 174, 0, 119, 0, 230, 255, 0, 19, 177, 0, 0, 53, 174, 0, 119, 0, 1, 0, 34, 179, 53, 0, 121, 179, 3, 0, 1, 12, 255, 255, 119, 0, 172, 0, 1, 203, 32, 0, 134, 205, 0, 0, 240, 158, 0, 0, 0, 203, 45, 19, 47, 0, 0, 0, 32, 180, 19, 0, 121, 180, 5, 0, 1, 20, 0, 0, 1, 205, 84, 0, 143, 205, 57, 1, 119, 0, 38, 0, 141, 205, 11, 1, 0, 36, 205, 0, 1, 40, 0, 0, 82, 181, 36, 0, 32, 205, 181, 0, 121, 205, 5, 0, 0, 20, 19, 0, 1, 205, 84, 0, 143, 205, 57, 1, 119, 0, 28, 0, 141, 205, 58, 1, 25, 205, 205, 20, 134, 182, 0, 0, 128, 187, 0, 0, 205, 181, 0, 0, 3, 183, 182, 40, 15, 185, 19, 183, 121, 185, 5, 0, 0, 20, 19, 0, 1, 205, 84, 0, 143, 205, 57, 1, 119, 0, 16, 0, 25, 186, 36, 4, 141, 203, 58, 1, 25, 203, 203, 20, 134, 205, 0, 0, 20, 187, 0, 0, 0, 203, 182, 0, 16, 187, 183, 19, 121, 187, 4, 0, 0, 36, 186, 0, 0, 40, 183, 0, 119, 0, 227, 255, 0, 20, 19, 0, 1, 205, 84, 0, 143, 205, 57, 1, 119, 0, 1, 0, 141, 205, 57, 1, 32, 205, 205, 67, 121, 205, 46, 0, 1, 205, 0, 0, 143, 205, 57, 1, 1, 205, 255, 255, 15, 147, 205, 55, 2, 205, 0, 0, 255, 255, 254, 255, 19, 205, 68, 205, 0, 148, 205, 0, 125, 10, 147, 148, 68, 0, 0, 0, 33, 149, 150, 0, 33, 151, 153, 0, 33, 154, 55, 0, 0, 155, 13, 0, 20, 205, 149, 151, 40, 205, 205, 1, 38, 205, 205, 1, 4, 203, 81, 155, 3, 205, 205, 203, 15, 156, 205, 55, 121, 156, 3, 0, 0, 205, 55, 0, 119, 0, 7, 0, 20, 203, 149, 151, 40, 203, 203, 1, 38, 203, 203, 1, 4, 204, 81, 155, 3, 203, 203, 204, 0, 205, 203, 0, 0, 56, 205, 0, 20, 205, 149, 151, 20, 205, 154, 205, 125, 57, 205, 56, 55, 0, 0, 0, 20, 205, 149, 151, 20, 205, 154, 205, 125, 14, 205, 13, 81, 0, 0, 0, 0, 49, 14, 0, 0, 50, 37, 0, 0, 51, 39, 0, 0, 54, 81, 0, 0, 69, 57, 0, 0, 70, 10, 0, 119, 0, 21, 0, 141, 205, 57, 1, 32, 205, 205, 84, 121, 205, 18, 0, 1, 205, 0, 0, 143, 205, 57, 1, 1, 203, 32, 0, 1, 204, 0, 32, 21, 204, 47, 204, 134, 205, 0, 0, 240, 158, 0, 0, 0, 203, 45, 20, 204, 0, 0, 0, 15, 188, 20, 45, 125, 189, 188, 45, 20, 0, 0, 0, 0, 22, 189, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 238, 250, 0, 192, 54, 0, 0, 193, 49, 0, 4, 205, 192, 193, 15, 195, 69, 205, 121, 195, 4, 0, 4, 204, 192, 193, 0, 205, 204, 0, 119, 0, 2, 0, 0, 205, 69, 0, 0, 11, 205, 0, 3, 196, 11, 50, 15, 197, 45, 196, 125, 58, 197, 196, 45, 0, 0, 0, 1, 204, 32, 0, 134, 205, 0, 0, 240, 158, 0, 0, 0, 204, 58, 196, 70, 0, 0, 0, 134, 205, 0, 0, 20, 187, 0, 0, 0, 51, 50, 0, 2, 205, 0, 0, 0, 0, 1, 0, 21, 205, 70, 205, 0, 198, 205, 0, 1, 204, 48, 0, 134, 205, 0, 0, 240, 158, 0, 0, 0, 204, 58, 196, 198, 0, 0, 0, 1, 204, 48, 0, 4, 203, 192, 193, 1, 206, 0, 0, 134, 205, 0, 0, 240, 158, 0, 0, 0, 204, 11, 203, 206, 0, 0, 0, 4, 206, 192, 193, 134, 205, 0, 0, 20, 187, 0, 0, 0, 49, 206, 0, 1, 205, 0, 32, 21, 205, 70, 205, 0, 199, 205, 0, 1, 206, 32, 0, 134, 205, 0, 0, 240, 158, 0, 0, 0, 206, 58, 196, 199, 0, 0, 0, 0, 22, 58, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 183, 250, 141, 205, 57, 1, 32, 205, 205, 87, 121, 205, 62, 0, 1, 205, 0, 0, 45, 205, 0, 205, 60, 46, 0, 0, 32, 205, 33, 0, 143, 205, 0, 1, 141, 205, 0, 1, 121, 205, 3, 0, 1, 12, 0, 0, 119, 0, 53, 0, 1, 52, 1, 0, 41, 206, 52, 2, 3, 205, 4, 206, 143, 205, 1, 1, 141, 206, 1, 1, 82, 205, 206, 0, 143, 205, 2, 1, 141, 205, 2, 1, 32, 205, 205, 0, 121, 205, 3, 0, 0, 65, 52, 0, 119, 0, 19, 0, 41, 206, 52, 3, 3, 205, 3, 206, 143, 205, 4, 1, 141, 206, 4, 1, 141, 203, 2, 1, 134, 205, 0, 0, 76, 46, 0, 0, 206, 203, 2, 0, 25, 205, 52, 1, 143, 205, 5, 1, 141, 205, 5, 1, 34, 205, 205, 10, 121, 205, 4, 0, 141, 205, 5, 1, 0, 52, 205, 0, 119, 0, 230, 255, 1, 12, 1, 0, 119, 0, 23, 0, 41, 203, 65, 2, 3, 205, 4, 203, 143, 205, 7, 1, 141, 203, 7, 1, 82, 205, 203, 0, 143, 205, 8, 1, 25, 205, 65, 1, 143, 205, 6, 1, 141, 205, 8, 1, 32, 205, 205, 0, 120, 205, 3, 0, 1, 12, 255, 255, 119, 0, 10, 0, 141, 205, 6, 1, 34, 205, 205, 10, 121, 205, 4, 0, 141, 205, 6, 1, 0, 65, 205, 0, 119, 0, 238, 255, 1, 12, 1, 0, 119, 0, 2, 0, 0, 12, 42, 0, 141, 205, 58, 1, 137, 205, 0, 0, 139, 12, 0, 0, 140, 3, 195, 0, 0, 0, 0, 0, 2, 191, 0, 0, 255, 255, 0, 0, 2, 192, 0, 0, 255, 0, 0, 0, 1, 189, 0, 0, 136, 193, 0, 0, 0, 190, 193, 0, 1, 193, 20, 0, 16, 42, 193, 1, 120, 42, 38, 1, 1, 193, 9, 0, 1, 194, 10, 0, 138, 1, 193, 194, 180, 46, 0, 0, 8, 47, 0, 0, 128, 47, 0, 0, 236, 47, 0, 0, 104, 48, 0, 0, 244, 48, 0, 0, 104, 49, 0, 0, 244, 49, 0, 0, 104, 50, 0, 0, 188, 50, 0, 0, 119, 0, 24, 1, 82, 119, 2, 0, 0, 53, 119, 0, 1, 193, 0, 0, 25, 64, 193, 4, 0, 140, 64, 0, 26, 139, 140, 1, 3, 75, 53, 139, 1, 193, 0, 0, 25, 86, 193, 4, 0, 143, 86, 0, 26, 142, 143, 1, 40, 193, 142, 255, 0, 141, 193, 0, 19, 193, 75, 141, 0, 97, 193, 0, 0, 108, 97, 0, 82, 5, 108, 0, 25, 129, 108, 4, 85, 2, 129, 0, 85, 0, 5, 0, 119, 0, 3, 1, 82, 123, 2, 0, 0, 16, 123, 0, 1, 193, 0, 0, 25, 24, 193, 4, 0, 145, 24, 0, 26, 144, 145, 1, 3, 25, 16, 144, 1, 193, 0, 0, 25, 26, 193, 4, 0, 148, 26, 0, 26, 147, 148, 1, 40, 193, 147, 255, 0, 146, 193, 0, 19, 193, 25, 146, 0, 27, 193, 0, 0, 28, 27, 0, 82, 29, 28, 0, 25, 136, 28, 4, 85, 2, 136, 0, 34, 30, 29, 0, 41, 193, 30, 31, 42, 193, 193, 31, 0, 31, 193, 0, 0, 32, 0, 0, 0, 33, 32, 0, 85, 33, 29, 0, 25, 34, 32, 4, 0, 35, 34, 0, 85, 35, 31, 0, 119, 0, 229, 0, 82, 127, 2, 0, 0, 36, 127, 0, 1, 193, 0, 0, 25, 37, 193, 4, 0, 150, 37, 0, 26, 149, 150, 1, 3, 38, 36, 149, 1, 193, 0, 0, 25, 39, 193, 4, 0, 153, 39, 0, 26, 152, 153, 1, 40, 193, 152, 255, 0, 151, 193, 0, 19, 193, 38, 151, 0, 40, 193, 0, 0, 41, 40, 0, 82, 43, 41, 0, 25, 137, 41, 4, 85, 2, 137, 0, 0, 44, 0, 0, 0, 45, 44, 0, 85, 45, 43, 0, 25, 46, 44, 4, 0, 47, 46, 0, 1, 193, 0, 0, 85, 47, 193, 0, 119, 0, 202, 0, 82, 128, 2, 0, 0, 48, 128, 0, 1, 193, 0, 0, 25, 49, 193, 8, 0, 155, 49, 0, 26, 154, 155, 1, 3, 50, 48, 154, 1, 193, 0, 0, 25, 51, 193, 8, 0, 158, 51, 0, 26, 157, 158, 1, 40, 193, 157, 255, 0, 156, 193, 0, 19, 193, 50, 156, 0, 52, 193, 0, 0, 54, 52, 0, 0, 55, 54, 0, 0, 56, 55, 0, 82, 57, 56, 0, 25, 58, 55, 4, 0, 59, 58, 0, 82, 60, 59, 0, 25, 138, 54, 8, 85, 2, 138, 0, 0, 61, 0, 0, 0, 62, 61, 0, 85, 62, 57, 0, 25, 63, 61, 4, 0, 65, 63, 0, 85, 65, 60, 0, 119, 0, 171, 0, 82, 120, 2, 0, 0, 66, 120, 0, 1, 193, 0, 0, 25, 67, 193, 4, 0, 160, 67, 0, 26, 159, 160, 1, 3, 68, 66, 159, 1, 193, 0, 0, 25, 69, 193, 4, 0, 163, 69, 0, 26, 162, 163, 1, 40, 193, 162, 255, 0, 161, 193, 0, 19, 193, 68, 161, 0, 70, 193, 0, 0, 71, 70, 0, 82, 72, 71, 0, 25, 130, 71, 4, 85, 2, 130, 0, 19, 193, 72, 191, 0, 73, 193, 0, 41, 193, 73, 16, 42, 193, 193, 16, 0, 74, 193, 0, 34, 76, 74, 0, 41, 193, 76, 31, 42, 193, 193, 31, 0, 77, 193, 0, 0, 78, 0, 0, 0, 79, 78, 0, 85, 79, 74, 0, 25, 80, 78, 4, 0, 81, 80, 0, 85, 81, 77, 0, 119, 0, 136, 0, 82, 121, 2, 0, 0, 82, 121, 0, 1, 193, 0, 0, 25, 83, 193, 4, 0, 165, 83, 0, 26, 164, 165, 1, 3, 84, 82, 164, 1, 193, 0, 0, 25, 85, 193, 4, 0, 168, 85, 0, 26, 167, 168, 1, 40, 193, 167, 255, 0, 166, 193, 0, 19, 193, 84, 166, 0, 87, 193, 0, 0, 88, 87, 0, 82, 89, 88, 0, 25, 131, 88, 4, 85, 2, 131, 0, 19, 193, 89, 191, 0, 4, 193, 0, 0, 90, 0, 0, 0, 91, 90, 0, 85, 91, 4, 0, 25, 92, 90, 4, 0, 93, 92, 0, 1, 193, 0, 0, 85, 93, 193, 0, 119, 0, 107, 0, 82, 122, 2, 0, 0, 94, 122, 0, 1, 193, 0, 0, 25, 95, 193, 4, 0, 170, 95, 0, 26, 169, 170, 1, 3, 96, 94, 169, 1, 193, 0, 0, 25, 98, 193, 4, 0, 173, 98, 0, 26, 172, 173, 1, 40, 193, 172, 255, 0, 171, 193, 0, 19, 193, 96, 171, 0, 99, 193, 0, 0, 100, 99, 0, 82, 101, 100, 0, 25, 132, 100, 4, 85, 2, 132, 0, 19, 193, 101, 192, 0, 102, 193, 0, 41, 193, 102, 24, 42, 193, 193, 24, 0, 103, 193, 0, 34, 104, 103, 0, 41, 193, 104, 31, 42, 193, 193, 31, 0, 105, 193, 0, 0, 106, 0, 0, 0, 107, 106, 0, 85, 107, 103, 0, 25, 109, 106, 4, 0, 110, 109, 0, 85, 110, 105, 0, 119, 0, 72, 0, 82, 124, 2, 0, 0, 111, 124, 0, 1, 193, 0, 0, 25, 112, 193, 4, 0, 175, 112, 0, 26, 174, 175, 1, 3, 113, 111, 174, 1, 193, 0, 0, 25, 114, 193, 4, 0, 178, 114, 0, 26, 177, 178, 1, 40, 193, 177, 255, 0, 176, 193, 0, 19, 193, 113, 176, 0, 115, 193, 0, 0, 116, 115, 0, 82, 117, 116, 0, 25, 133, 116, 4, 85, 2, 133, 0, 19, 193, 117, 192, 0, 3, 193, 0, 0, 118, 0, 0, 0, 6, 118, 0, 85, 6, 3, 0, 25, 7, 118, 4, 0, 8, 7, 0, 1, 193, 0, 0, 85, 8, 193, 0, 119, 0, 43, 0, 82, 125, 2, 0, 0, 9, 125, 0, 1, 193, 0, 0, 25, 10, 193, 8, 0, 180, 10, 0, 26, 179, 180, 1, 3, 11, 9, 179, 1, 193, 0, 0, 25, 12, 193, 8, 0, 183, 12, 0, 26, 182, 183, 1, 40, 193, 182, 255, 0, 181, 193, 0, 19, 193, 11, 181, 0, 13, 193, 0, 0, 14, 13, 0, 86, 15, 14, 0, 25, 134, 14, 8, 85, 2, 134, 0, 87, 0, 15, 0, 119, 0, 22, 0, 82, 126, 2, 0, 0, 17, 126, 0, 1, 193, 0, 0, 25, 18, 193, 8, 0, 185, 18, 0, 26, 184, 185, 1, 3, 19, 17, 184, 1, 193, 0, 0, 25, 20, 193, 8, 0, 188, 20, 0, 26, 187, 188, 1, 40, 193, 187, 255, 0, 186, 193, 0, 19, 193, 19, 186, 0, 21, 193, 0, 0, 22, 21, 0, 86, 23, 22, 0, 25, 135, 22, 8, 85, 2, 135, 0, 87, 0, 23, 0, 119, 0, 1, 0, 139, 0, 0, 0, 140, 5, 75, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 6, 1, 0, 0, 7, 6, 0, 0, 8, 2, 0, 0, 9, 3, 0, 0, 10, 9, 0, 32, 69, 7, 0, 121, 69, 27, 0, 33, 11, 4, 0, 32, 69, 10, 0, 121, 69, 11, 0, 121, 11, 5, 0, 9, 69, 5, 8, 85, 4, 69, 0, 1, 70, 0, 0, 109, 4, 4, 70, 1, 68, 0, 0, 7, 67, 5, 8, 129, 68, 0, 0, 139, 67, 0, 0, 119, 0, 14, 0, 120, 11, 5, 0, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 38, 70, 0, 255, 85, 4, 70, 0, 38, 69, 1, 0, 109, 4, 4, 69, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 32, 12, 10, 0, 32, 69, 8, 0, 121, 69, 83, 0, 121, 12, 11, 0, 33, 69, 4, 0, 121, 69, 5, 0, 9, 69, 7, 8, 85, 4, 69, 0, 1, 70, 0, 0, 109, 4, 4, 70, 1, 68, 0, 0, 7, 67, 7, 8, 129, 68, 0, 0, 139, 67, 0, 0, 32, 70, 5, 0, 121, 70, 11, 0, 33, 70, 4, 0, 121, 70, 5, 0, 1, 70, 0, 0, 85, 4, 70, 0, 9, 69, 7, 10, 109, 4, 4, 69, 1, 68, 0, 0, 7, 67, 7, 10, 129, 68, 0, 0, 139, 67, 0, 0, 26, 13, 10, 1, 19, 69, 13, 10, 32, 69, 69, 0, 121, 69, 18, 0, 33, 69, 4, 0, 121, 69, 8, 0, 38, 69, 0, 255, 39, 69, 69, 0, 85, 4, 69, 0, 19, 70, 13, 7, 38, 71, 1, 0, 20, 70, 70, 71, 109, 4, 4, 70, 1, 68, 0, 0, 134, 70, 0, 0, 0, 183, 0, 0, 10, 0, 0, 0, 24, 70, 7, 70, 0, 67, 70, 0, 129, 68, 0, 0, 139, 67, 0, 0, 135, 14, 3, 0, 10, 0, 0, 0, 135, 70, 3, 0, 7, 0, 0, 0, 4, 15, 14, 70, 37, 70, 15, 30, 121, 70, 15, 0, 25, 16, 15, 1, 1, 70, 31, 0, 4, 17, 70, 15, 0, 36, 16, 0, 22, 70, 7, 17, 24, 69, 5, 16, 20, 70, 70, 69, 0, 35, 70, 0, 24, 70, 7, 16, 0, 34, 70, 0, 1, 33, 0, 0, 22, 70, 5, 17, 0, 32, 70, 0, 119, 0, 139, 0, 32, 70, 4, 0, 121, 70, 5, 0, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 38, 70, 0, 255, 39, 70, 70, 0, 85, 4, 70, 0, 38, 69, 1, 0, 20, 69, 6, 69, 109, 4, 4, 69, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 119, 0, 122, 0, 120, 12, 43, 0, 135, 27, 3, 0, 10, 0, 0, 0, 135, 69, 3, 0, 7, 0, 0, 0, 4, 28, 27, 69, 37, 69, 28, 31, 121, 69, 20, 0, 25, 29, 28, 1, 1, 69, 31, 0, 4, 30, 69, 28, 26, 69, 28, 31, 42, 69, 69, 31, 0, 31, 69, 0, 0, 36, 29, 0, 24, 69, 5, 29, 19, 69, 69, 31, 22, 70, 7, 30, 20, 69, 69, 70, 0, 35, 69, 0, 24, 69, 7, 29, 19, 69, 69, 31, 0, 34, 69, 0, 1, 33, 0, 0, 22, 69, 5, 30, 0, 32, 69, 0, 119, 0, 95, 0, 32, 69, 4, 0, 121, 69, 5, 0, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 38, 69, 0, 255, 39, 69, 69, 0, 85, 4, 69, 0, 38, 70, 1, 0, 20, 70, 6, 70, 109, 4, 4, 70, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 26, 18, 8, 1, 19, 70, 18, 8, 33, 70, 70, 0, 121, 70, 44, 0, 135, 70, 3, 0, 8, 0, 0, 0, 25, 20, 70, 33, 135, 70, 3, 0, 7, 0, 0, 0, 4, 21, 20, 70, 1, 70, 64, 0, 4, 22, 70, 21, 1, 70, 32, 0, 4, 23, 70, 21, 42, 70, 23, 31, 0, 24, 70, 0, 26, 25, 21, 32, 42, 70, 25, 31, 0, 26, 70, 0, 0, 36, 21, 0, 26, 70, 23, 1, 42, 70, 70, 31, 24, 69, 7, 25, 19, 70, 70, 69, 22, 69, 7, 23, 24, 71, 5, 21, 20, 69, 69, 71, 19, 69, 69, 26, 20, 70, 70, 69, 0, 35, 70, 0, 24, 70, 7, 21, 19, 70, 26, 70, 0, 34, 70, 0, 22, 70, 5, 22, 19, 70, 70, 24, 0, 33, 70, 0, 22, 70, 7, 22, 24, 69, 5, 25, 20, 70, 70, 69, 19, 70, 70, 24, 22, 69, 5, 23, 26, 71, 21, 33, 42, 71, 71, 31, 19, 69, 69, 71, 20, 70, 70, 69, 0, 32, 70, 0, 119, 0, 32, 0, 33, 70, 4, 0, 121, 70, 5, 0, 19, 70, 18, 5, 85, 4, 70, 0, 1, 69, 0, 0, 109, 4, 4, 69, 32, 69, 8, 1, 121, 69, 10, 0, 38, 69, 1, 0, 20, 69, 6, 69, 0, 68, 69, 0, 38, 69, 0, 255, 39, 69, 69, 0, 0, 67, 69, 0, 129, 68, 0, 0, 139, 67, 0, 0, 119, 0, 15, 0, 134, 19, 0, 0, 0, 183, 0, 0, 8, 0, 0, 0, 24, 69, 7, 19, 39, 69, 69, 0, 0, 68, 69, 0, 1, 69, 32, 0, 4, 69, 69, 19, 22, 69, 7, 69, 24, 70, 5, 19, 20, 69, 69, 70, 0, 67, 69, 0, 129, 68, 0, 0, 139, 67, 0, 0, 32, 69, 36, 0, 121, 69, 8, 0, 0, 63, 32, 0, 0, 62, 33, 0, 0, 61, 34, 0, 0, 60, 35, 0, 1, 59, 0, 0, 1, 58, 0, 0, 119, 0, 89, 0, 38, 69, 2, 255, 39, 69, 69, 0, 0, 37, 69, 0, 38, 69, 3, 0, 20, 69, 9, 69, 0, 38, 69, 0, 1, 69, 255, 255, 1, 70, 255, 255, 134, 39, 0, 0, 180, 188, 0, 0, 37, 38, 69, 70, 128, 70, 0, 0, 0, 40, 70, 0, 0, 46, 32, 0, 0, 45, 33, 0, 0, 44, 34, 0, 0, 43, 35, 0, 0, 42, 36, 0, 1, 41, 0, 0, 43, 70, 45, 31, 41, 69, 46, 1, 20, 70, 70, 69, 0, 47, 70, 0, 41, 70, 45, 1, 20, 70, 41, 70, 0, 48, 70, 0, 41, 70, 43, 1, 43, 69, 46, 31, 20, 70, 70, 69, 39, 70, 70, 0, 0, 49, 70, 0, 43, 70, 43, 31, 41, 69, 44, 1, 20, 70, 70, 69, 0, 50, 70, 0, 134, 70, 0, 0, 64, 188, 0, 0, 39, 40, 49, 50, 128, 70, 0, 0, 0, 51, 70, 0, 42, 70, 51, 31, 34, 71, 51, 0, 1, 72, 255, 255, 1, 73, 0, 0, 125, 69, 71, 72, 73, 0, 0, 0, 41, 69, 69, 1, 20, 70, 70, 69, 0, 52, 70, 0, 38, 70, 52, 1, 0, 53, 70, 0, 19, 70, 52, 37, 34, 73, 51, 0, 1, 72, 255, 255, 1, 71, 0, 0, 125, 69, 73, 72, 71, 0, 0, 0, 42, 69, 69, 31, 34, 72, 51, 0, 1, 73, 255, 255, 1, 74, 0, 0, 125, 71, 72, 73, 74, 0, 0, 0, 41, 71, 71, 1, 20, 69, 69, 71, 19, 69, 69, 38, 134, 54, 0, 0, 64, 188, 0, 0, 49, 50, 70, 69, 0, 55, 54, 0, 128, 69, 0, 0, 0, 56, 69, 0, 26, 57, 42, 1, 32, 69, 57, 0, 120, 69, 8, 0, 0, 46, 47, 0, 0, 45, 48, 0, 0, 44, 56, 0, 0, 43, 55, 0, 0, 42, 57, 0, 0, 41, 53, 0, 119, 0, 194, 255, 0, 63, 47, 0, 0, 62, 48, 0, 0, 61, 56, 0, 0, 60, 55, 0, 1, 59, 0, 0, 0, 58, 53, 0, 0, 64, 62, 0, 1, 65, 0, 0, 20, 69, 63, 65, 0, 66, 69, 0, 33, 69, 4, 0, 121, 69, 4, 0, 39, 69, 60, 0, 85, 4, 69, 0, 109, 4, 4, 61, 39, 69, 64, 0, 43, 69, 69, 31, 41, 70, 66, 1, 20, 69, 69, 70, 41, 70, 65, 1, 43, 71, 64, 31, 20, 70, 70, 71, 38, 70, 70, 0, 20, 69, 69, 70, 20, 69, 69, 59, 0, 68, 69, 0, 41, 69, 64, 1, 1, 70, 0, 0, 43, 70, 70, 31, 20, 69, 69, 70, 38, 69, 69, 254, 20, 69, 69, 58, 0, 67, 69, 0, 129, 68, 0, 0, 139, 67, 0, 0, 140, 5, 96, 0, 0, 0, 0, 0, 2, 90, 0, 0, 0, 4, 0, 0, 2, 91, 0, 0, 228, 3, 0, 0, 2, 92, 0, 0, 96, 1, 0, 0, 2, 93, 0, 0, 132, 2, 0, 0, 1, 88, 0, 0, 136, 94, 0, 0, 0, 89, 94, 0, 136, 94, 0, 0, 25, 94, 94, 112, 137, 94, 0, 0, 130, 94, 0, 0, 136, 95, 0, 0, 49, 94, 94, 95, 48, 57, 0, 0, 1, 95, 112, 0, 135, 94, 0, 0, 95, 0, 0, 0, 25, 83, 89, 72, 25, 82, 89, 64, 25, 81, 89, 56, 25, 80, 89, 48, 25, 87, 89, 40, 25, 86, 89, 32, 25, 85, 89, 24, 25, 84, 89, 16, 25, 79, 89, 8, 0, 78, 89, 0, 25, 10, 89, 88, 25, 11, 89, 80, 0, 56, 0, 0, 0, 67, 1, 0, 0, 76, 2, 0, 0, 77, 3, 0, 0, 5, 4, 0, 1, 6, 0, 0, 1, 7, 0, 0, 0, 12, 56, 0, 1, 94, 255, 0, 19, 94, 12, 94, 0, 13, 94, 0, 1, 94, 41, 0, 1, 95, 15, 0, 138, 13, 94, 95, 236, 57, 0, 0, 212, 57, 0, 0, 212, 57, 0, 0, 200, 58, 0, 0, 212, 57, 0, 0, 212, 57, 0, 0, 80, 59, 0, 0, 208, 59, 0, 0, 212, 57, 0, 0, 56, 60, 0, 0, 212, 57, 0, 0, 212, 57, 0, 0, 212, 57, 0, 0, 160, 60, 0, 0, 32, 61, 0, 0, 1, 95, 229, 4, 134, 94, 0, 0, 240, 180, 0, 0, 95, 81, 0, 0, 1, 7, 1, 0, 119, 0, 241, 0, 1, 95, 121, 4, 134, 94, 0, 0, 240, 180, 0, 0, 95, 78, 0, 0, 1, 94, 2, 0, 134, 14, 0, 0, 232, 67, 0, 0, 94, 0, 0, 0, 121, 14, 3, 0, 1, 6, 1, 0, 119, 0, 230, 0, 1, 6, 0, 0, 1, 94, 32, 3, 134, 15, 0, 0, 232, 67, 0, 0, 94, 0, 0, 0, 121, 15, 3, 0, 1, 8, 48, 0, 119, 0, 222, 0, 1, 94, 64, 0, 134, 16, 0, 0, 232, 67, 0, 0, 94, 0, 0, 0, 121, 16, 10, 0, 1, 94, 48, 0, 134, 17, 0, 0, 104, 167, 0, 0, 94, 0, 0, 0, 121, 17, 3, 0, 1, 8, 44, 0, 119, 0, 210, 0, 1, 8, 48, 0, 119, 0, 208, 0, 1, 94, 140, 0, 134, 18, 0, 0, 232, 67, 0, 0, 94, 0, 0, 0, 121, 18, 10, 0, 1, 94, 44, 0, 134, 19, 0, 0, 104, 167, 0, 0, 94, 0, 0, 0, 121, 19, 3, 0, 1, 6, 1, 0, 119, 0, 196, 0, 1, 8, 44, 0, 119, 0, 194, 0, 134, 20, 0, 0, 232, 67, 0, 0, 90, 0, 0, 0, 121, 20, 3, 0, 1, 8, 55, 0, 119, 0, 188, 0, 1, 7, 1, 0, 119, 0, 186, 0, 1, 95, 136, 4, 134, 94, 0, 0, 240, 180, 0, 0, 95, 79, 0, 0, 1, 94, 142, 0, 134, 21, 0, 0, 232, 67, 0, 0, 94, 0, 0, 0, 121, 21, 3, 0, 1, 6, 1, 0, 119, 0, 175, 0, 1, 6, 0, 0, 1, 94, 96, 3, 134, 22, 0, 0, 232, 67, 0, 0, 94, 0, 0, 0, 121, 22, 10, 0, 1, 94, 48, 0, 134, 23, 0, 0, 104, 167, 0, 0, 94, 0, 0, 0, 121, 23, 3, 0, 1, 6, 1, 0, 119, 0, 162, 0, 1, 8, 48, 0, 119, 0, 160, 0, 134, 24, 0, 0, 232, 67, 0, 0, 90, 0, 0, 0, 121, 24, 3, 0, 1, 8, 55, 0, 119, 0, 154, 0, 1, 7, 1, 0, 119, 0, 152, 0, 1, 95, 151, 4, 134, 94, 0, 0, 240, 180, 0, 0, 95, 84, 0, 0, 134, 25, 0, 0, 232, 67, 0, 0, 92, 0, 0, 0, 121, 25, 3, 0, 1, 6, 1, 0, 119, 0, 142, 0, 1, 6, 0, 0, 134, 26, 0, 0, 232, 67, 0, 0, 93, 0, 0, 0, 121, 26, 3, 0, 1, 8, 48, 0, 119, 0, 135, 0, 1, 94, 10, 0, 134, 27, 0, 0, 232, 67, 0, 0, 94, 0, 0, 0, 121, 27, 3, 0, 1, 8, 44, 0, 119, 0, 128, 0, 134, 28, 0, 0, 232, 67, 0, 0, 90, 0, 0, 0, 121, 28, 3, 0, 1, 8, 55, 0, 119, 0, 122, 0, 1, 7, 1, 0, 119, 0, 120, 0, 1, 95, 166, 4, 134, 94, 0, 0, 240, 180, 0, 0, 95, 85, 0, 0, 134, 29, 0, 0, 232, 67, 0, 0, 91, 0, 0, 0, 121, 29, 3, 0, 1, 6, 1, 0, 119, 0, 110, 0, 1, 6, 0, 0, 1, 94, 10, 0, 134, 30, 0, 0, 232, 67, 0, 0, 94, 0, 0, 0, 121, 30, 3, 0, 1, 8, 44, 0, 119, 0, 102, 0, 134, 31, 0, 0, 232, 67, 0, 0, 90, 0, 0, 0, 121, 31, 3, 0, 1, 8, 55, 0, 119, 0, 96, 0, 1, 7, 1, 0, 119, 0, 94, 0, 1, 95, 181, 4, 134, 94, 0, 0, 240, 180, 0, 0, 95, 86, 0, 0, 134, 32, 0, 0, 232, 67, 0, 0, 91, 0, 0, 0, 121, 32, 3, 0, 1, 6, 1, 0, 119, 0, 84, 0, 1, 6, 0, 0, 1, 94, 10, 0, 134, 33, 0, 0, 232, 67, 0, 0, 94, 0, 0, 0, 121, 33, 3, 0, 1, 8, 44, 0, 119, 0, 76, 0, 134, 34, 0, 0, 232, 67, 0, 0, 90, 0, 0, 0, 121, 34, 3, 0, 1, 8, 55, 0, 119, 0, 70, 0, 1, 7, 1, 0, 119, 0, 68, 0, 1, 95, 197, 4, 134, 94, 0, 0, 240, 180, 0, 0, 95, 87, 0, 0, 134, 35, 0, 0, 232, 67, 0, 0, 92, 0, 0, 0, 121, 35, 3, 0, 1, 6, 1, 0, 119, 0, 58, 0, 1, 6, 0, 0, 134, 36, 0, 0, 232, 67, 0, 0, 93, 0, 0, 0, 121, 36, 3, 0, 1, 8, 48, 0, 119, 0, 51, 0, 1, 94, 10, 0, 134, 37, 0, 0, 232, 67, 0, 0, 94, 0, 0, 0, 121, 37, 3, 0, 1, 8, 44, 0, 119, 0, 44, 0, 134, 38, 0, 0, 232, 67, 0, 0, 90, 0, 0, 0, 121, 38, 3, 0, 1, 8, 55, 0, 119, 0, 38, 0, 1, 7, 1, 0, 119, 0, 36, 0, 1, 95, 213, 4, 134, 94, 0, 0, 240, 180, 0, 0, 95, 80, 0, 0, 1, 94, 6, 6, 134, 39, 0, 0, 232, 67, 0, 0, 94, 0, 0, 0, 121, 39, 3, 0, 1, 6, 1, 0, 119, 0, 25, 0, 1, 6, 0, 0, 1, 94, 224, 1, 134, 40, 0, 0, 232, 67, 0, 0, 94, 0, 0, 0, 121, 40, 10, 0, 1, 94, 48, 0, 134, 41, 0, 0, 104, 167, 0, 0, 94, 0, 0, 0, 121, 41, 3, 0, 1, 6, 1, 0, 119, 0, 12, 0, 1, 8, 48, 0, 119, 0, 10, 0, 1, 94, 8, 0, 134, 42, 0, 0, 232, 67, 0, 0, 94, 0, 0, 0, 121, 42, 3, 0, 1, 8, 44, 0, 119, 0, 3, 0, 1, 7, 1, 0, 119, 0, 1, 0, 0, 43, 7, 0, 38, 94, 43, 1, 0, 44, 94, 0, 0, 46, 56, 0, 121, 44, 13, 0, 1, 94, 255, 0, 19, 94, 46, 94, 0, 47, 94, 0, 85, 82, 47, 0, 1, 95, 243, 4, 134, 94, 0, 0, 240, 180, 0, 0, 95, 82, 0, 0, 1, 45, 4, 0, 0, 75, 45, 0, 137, 89, 0, 0, 139, 75, 0, 0, 134, 94, 0, 0, 72, 156, 0, 0, 11, 46, 0, 0, 82, 94, 11, 0, 85, 10, 94, 0, 106, 95, 11, 4, 109, 10, 4, 95, 0, 48, 6, 0, 38, 95, 48, 1, 0, 49, 95, 0, 121, 49, 16, 0, 82, 50, 10, 0, 25, 51, 10, 4, 82, 52, 51, 0, 0, 53, 67, 0, 0, 54, 76, 0, 0, 55, 77, 0, 0, 57, 5, 0, 134, 58, 0, 0, 148, 72, 0, 0, 50, 52, 53, 54, 55, 57, 0, 0, 0, 45, 58, 0, 0, 75, 45, 0, 137, 89, 0, 0, 139, 75, 0, 0, 1, 94, 35, 5, 134, 95, 0, 0, 240, 180, 0, 0, 94, 83, 0, 0, 0, 59, 8, 0, 0, 60, 67, 0, 0, 61, 76, 0, 0, 62, 77, 0, 0, 63, 5, 0, 134, 64, 0, 0, 212, 56, 0, 0, 59, 60, 61, 62, 63, 0, 0, 0, 0, 9, 64, 0, 0, 65, 9, 0, 41, 95, 65, 24, 42, 95, 95, 24, 33, 66, 95, 0, 121, 66, 7, 0, 0, 68, 9, 0, 0, 45, 68, 0, 0, 75, 45, 0, 137, 89, 0, 0, 139, 75, 0, 0, 119, 0, 14, 0, 0, 69, 56, 0, 0, 70, 67, 0, 0, 71, 76, 0, 0, 72, 77, 0, 0, 73, 5, 0, 134, 74, 0, 0, 212, 56, 0, 0, 69, 70, 71, 72, 73, 0, 0, 0, 0, 45, 74, 0, 0, 75, 45, 0, 137, 89, 0, 0, 139, 75, 0, 0, 1, 95, 0, 0, 139, 95, 0, 0, 140, 0, 74, 0, 0, 0, 0, 0, 2, 63, 0, 0, 181, 24, 0, 0, 2, 64, 0, 0, 224, 46, 0, 0, 2, 65, 0, 0, 186, 21, 0, 0, 2, 66, 0, 0, 120, 5, 0, 0, 2, 67, 0, 0, 184, 21, 0, 0, 2, 68, 0, 0, 49, 10, 0, 0, 2, 69, 0, 0, 252, 9, 0, 0, 1, 60, 0, 0, 136, 70, 0, 0, 0, 61, 70, 0, 136, 70, 0, 0, 1, 71, 128, 0, 3, 70, 70, 71, 137, 70, 0, 0, 130, 70, 0, 0, 136, 71, 0, 0, 49, 70, 70, 71, 112, 63, 0, 0, 1, 71, 128, 0, 135, 70, 0, 0, 71, 0, 0, 0, 25, 58, 61, 32, 25, 57, 61, 24, 25, 56, 61, 16, 25, 55, 61, 8, 0, 54, 61, 0, 25, 35, 61, 40, 134, 70, 0, 0, 40, 192, 0, 0, 1, 13, 9, 0, 1, 24, 2, 0, 0, 59, 35, 0, 25, 62, 59, 72, 1, 70, 0, 0, 85, 59, 70, 0, 25, 59, 59, 4, 54, 70, 59, 62, 160, 63, 0, 0, 134, 70, 0, 0, 40, 192, 0, 0, 1, 71, 123, 9, 134, 70, 0, 0, 156, 182, 0, 0, 71, 0, 0, 0, 1, 70, 41, 21, 78, 50, 70, 0, 41, 70, 50, 24, 42, 70, 70, 24, 33, 51, 70, 0, 121, 51, 6, 0, 1, 71, 71, 8, 134, 70, 0, 0, 156, 182, 0, 0, 71, 0, 0, 0, 119, 0, 5, 0, 1, 71, 88, 8, 134, 70, 0, 0, 156, 182, 0, 0, 71, 0, 0, 0, 1, 71, 104, 8, 134, 70, 0, 0, 156, 182, 0, 0, 71, 0, 0, 0, 1, 71, 31, 8, 134, 70, 0, 0, 156, 182, 0, 0, 71, 0, 0, 0, 1, 71, 47, 8, 134, 70, 0, 0, 156, 182, 0, 0, 71, 0, 0, 0, 1, 71, 59, 8, 134, 70, 0, 0, 156, 182, 0, 0, 71, 0, 0, 0, 1, 71, 107, 8, 134, 70, 0, 0, 156, 182, 0, 0, 71, 0, 0, 0, 1, 71, 133, 9, 134, 70, 0, 0, 156, 182, 0, 0, 71, 0, 0, 0, 1, 2, 0, 0, 1, 70, 0, 0, 83, 63, 70, 0, 1, 70, 32, 22, 1, 71, 0, 0, 85, 70, 71, 0, 1, 70, 244, 1, 134, 71, 0, 0, 220, 173, 0, 0, 70, 0, 0, 0, 1, 70, 151, 9, 134, 71, 0, 0, 156, 182, 0, 0, 70, 0, 0, 0, 134, 71, 0, 0, 92, 192, 0, 0, 1, 70, 121, 8, 134, 71, 0, 0, 156, 182, 0, 0, 70, 0, 0, 0, 1, 70, 200, 0, 134, 71, 0, 0, 220, 173, 0, 0, 70, 0, 0, 0, 1, 70, 118, 3, 1, 72, 196, 0, 61, 73, 0, 0, 228, 203, 22, 192, 134, 71, 0, 0, 164, 170, 0, 0, 70, 72, 73, 0, 134, 71, 0, 0, 172, 191, 0, 0, 134, 71, 0, 0, 248, 191, 0, 0, 134, 71, 0, 0, 128, 183, 0, 0, 1, 73, 244, 1, 134, 71, 0, 0, 220, 173, 0, 0, 73, 0, 0, 0, 134, 71, 0, 0, 212, 188, 0, 0, 1, 73, 62, 254, 1, 72, 136, 19, 134, 71, 0, 0, 228, 159, 0, 0, 73, 72, 0, 0, 0, 52, 2, 0, 1, 71, 0, 0, 1, 72, 9, 0, 138, 52, 71, 72, 116, 65, 0, 0, 132, 65, 0, 0, 156, 65, 0, 0, 172, 65, 0, 0, 188, 65, 0, 0, 204, 65, 0, 0, 220, 65, 0, 0, 236, 65, 0, 0, 252, 65, 0, 0, 1, 72, 156, 9, 134, 71, 0, 0, 240, 180, 0, 0, 72, 54, 0, 0, 1, 1, 4, 0, 119, 0, 39, 0, 134, 53, 0, 0, 252, 111, 0, 0, 0, 1, 53, 0, 119, 0, 35, 0, 1, 71, 1, 0, 134, 3, 0, 0, 12, 93, 0, 0, 71, 0, 0, 0, 0, 1, 3, 0, 119, 0, 29, 0, 134, 4, 0, 0, 12, 148, 0, 0, 0, 1, 4, 0, 119, 0, 25, 0, 134, 5, 0, 0, 212, 154, 0, 0, 0, 1, 5, 0, 119, 0, 21, 0, 134, 6, 0, 0, 148, 149, 0, 0, 0, 1, 6, 0, 119, 0, 17, 0, 134, 7, 0, 0, 12, 148, 0, 0, 0, 1, 7, 0, 119, 0, 13, 0, 134, 8, 0, 0, 124, 152, 0, 0, 0, 1, 8, 0, 119, 0, 9, 0, 134, 9, 0, 0, 8, 151, 0, 0, 0, 1, 9, 0, 119, 0, 5, 0, 134, 10, 0, 0, 124, 152, 0, 0, 0, 1, 10, 0, 119, 0, 1, 0, 0, 11, 1, 0, 41, 71, 11, 24, 42, 71, 71, 24, 33, 12, 71, 0, 0, 14, 2, 0, 41, 71, 14, 3, 3, 15, 35, 71, 121, 12, 11, 0, 25, 16, 15, 4, 1, 71, 1, 0, 85, 16, 71, 0, 0, 17, 2, 0, 85, 55, 17, 0, 1, 72, 201, 9, 134, 71, 0, 0, 240, 180, 0, 0, 72, 55, 0, 0, 119, 0, 9, 0, 1, 71, 1, 0, 85, 15, 71, 0, 0, 18, 2, 0, 85, 56, 18, 0, 1, 72, 227, 9, 134, 71, 0, 0, 240, 180, 0, 0, 72, 56, 0, 0, 78, 19, 63, 0, 38, 71, 19, 1, 0, 20, 71, 0, 120, 20, 2, 0, 119, 0, 53, 0, 1, 71, 0, 0, 134, 21, 0, 0, 172, 102, 0, 0, 71, 0, 0, 0, 0, 1, 21, 0, 0, 22, 1, 0, 41, 71, 22, 24, 42, 71, 71, 24, 33, 23, 71, 0, 120, 23, 7, 0, 1, 71, 0, 0, 83, 63, 71, 0, 134, 71, 0, 0, 240, 180, 0, 0, 68, 58, 0, 0, 119, 0, 236, 255, 134, 71, 0, 0, 240, 180, 0, 0, 69, 57, 0, 0, 80, 25, 67, 0, 41, 71, 25, 16, 42, 71, 71, 16, 0, 26, 71, 0, 1, 71, 88, 2, 15, 27, 71, 26, 121, 27, 17, 0, 80, 28, 65, 0, 41, 71, 28, 16, 42, 71, 71, 16, 0, 29, 71, 0, 15, 30, 29, 66, 121, 30, 11, 0, 1, 71, 41, 0, 1, 72, 100, 0, 1, 73, 0, 0, 1, 70, 5, 0, 134, 31, 0, 0, 212, 56, 0, 0, 71, 72, 73, 64, 70, 0, 0, 0, 0, 1, 31, 0, 119, 0, 210, 255, 1, 70, 54, 0, 1, 73, 100, 0, 1, 72, 0, 0, 1, 71, 5, 0, 134, 32, 0, 0, 212, 56, 0, 0, 70, 73, 72, 64, 71, 0, 0, 0, 0, 1, 32, 0, 119, 0, 200, 255, 1, 46, 0, 0, 0, 33, 2, 0, 25, 34, 33, 1, 0, 2, 34, 0, 0, 36, 2, 0, 1, 71, 9, 0, 17, 37, 71, 36, 1, 71, 0, 0, 125, 0, 37, 71, 34, 0, 0, 0, 0, 2, 0, 0, 0, 38, 46, 0, 25, 39, 38, 1, 0, 46, 39, 0, 0, 40, 2, 0, 41, 71, 40, 3, 3, 41, 35, 71, 82, 42, 41, 0, 32, 43, 42, 1, 0, 44, 46, 0, 36, 45, 44, 9, 1, 71, 0, 0, 125, 47, 43, 45, 71, 0, 0, 0, 120, 47, 233, 255, 119, 0, 1, 0, 134, 48, 0, 0, 20, 189, 0, 0, 1, 71, 244, 1, 16, 49, 48, 71, 120, 49, 86, 255, 119, 0, 1, 0, 134, 71, 0, 0, 232, 183, 0, 0, 137, 61, 0, 0, 139, 0, 0, 0, 140, 1, 133, 0, 0, 0, 0, 0, 2, 127, 0, 0, 220, 5, 0, 0, 2, 128, 0, 0, 255, 255, 0, 0, 1, 125, 0, 0, 136, 129, 0, 0, 0, 126, 129, 0, 136, 129, 0, 0, 25, 129, 129, 16, 137, 129, 0, 0, 130, 129, 0, 0, 136, 130, 0, 0, 49, 129, 129, 130, 52, 68, 0, 0, 1, 130, 16, 0, 135, 129, 0, 0, 130, 0, 0, 0, 0, 1, 0, 0, 1, 37, 0, 0, 0, 48, 1, 0, 19, 129, 48, 128, 0, 59, 129, 0, 38, 129, 59, 2, 0, 70, 129, 0, 32, 81, 70, 2, 121, 81, 20, 0, 1, 129, 188, 2, 1, 130, 0, 0, 1, 131, 88, 2, 134, 92, 0, 0, 64, 86, 0, 0, 129, 130, 127, 131, 38, 131, 92, 1, 0, 103, 131, 0, 0, 114, 37, 0, 38, 131, 114, 1, 0, 2, 131, 0, 38, 131, 2, 1, 0, 13, 131, 0, 20, 131, 13, 103, 0, 24, 131, 0, 33, 30, 24, 0, 38, 131, 30, 1, 0, 31, 131, 0, 0, 37, 31, 0, 0, 32, 1, 0, 19, 131, 32, 128, 0, 33, 131, 0, 38, 131, 33, 4, 0, 34, 131, 0, 32, 35, 34, 4, 121, 35, 20, 0, 1, 131, 188, 2, 1, 130, 88, 2, 1, 129, 232, 3, 134, 36, 0, 0, 64, 86, 0, 0, 131, 130, 127, 129, 38, 129, 36, 1, 0, 38, 129, 0, 0, 39, 37, 0, 38, 129, 39, 1, 0, 40, 129, 0, 38, 129, 40, 1, 0, 41, 129, 0, 20, 129, 41, 38, 0, 42, 129, 0, 33, 43, 42, 0, 38, 129, 43, 1, 0, 44, 129, 0, 0, 37, 44, 0, 0, 45, 1, 0, 19, 129, 45, 128, 0, 46, 129, 0, 38, 129, 46, 8, 0, 47, 129, 0, 32, 49, 47, 8, 121, 49, 19, 0, 1, 129, 232, 3, 1, 130, 232, 3, 134, 50, 0, 0, 64, 86, 0, 0, 129, 130, 127, 127, 38, 130, 50, 1, 0, 51, 130, 0, 0, 52, 37, 0, 38, 130, 52, 1, 0, 53, 130, 0, 38, 130, 53, 1, 0, 54, 130, 0, 20, 130, 54, 51, 0, 55, 130, 0, 33, 56, 55, 0, 38, 130, 56, 1, 0, 57, 130, 0, 0, 37, 57, 0, 0, 58, 1, 0, 19, 130, 58, 128, 0, 60, 130, 0, 38, 130, 60, 16, 0, 61, 130, 0, 32, 62, 61, 16, 121, 62, 19, 0, 1, 130, 232, 3, 1, 129, 208, 7, 134, 63, 0, 0, 64, 86, 0, 0, 130, 127, 127, 129, 38, 129, 63, 1, 0, 64, 129, 0, 0, 65, 37, 0, 38, 129, 65, 1, 0, 66, 129, 0, 38, 129, 66, 1, 0, 67, 129, 0, 20, 129, 67, 64, 0, 68, 129, 0, 33, 69, 68, 0, 38, 129, 69, 1, 0, 71, 129, 0, 0, 37, 71, 0, 0, 72, 1, 0, 19, 129, 72, 128, 0, 73, 129, 0, 38, 129, 73, 32, 0, 74, 129, 0, 32, 75, 74, 32, 121, 75, 21, 0, 1, 129, 0, 0, 1, 130, 0, 0, 1, 131, 188, 2, 1, 132, 132, 3, 134, 76, 0, 0, 64, 86, 0, 0, 129, 130, 131, 132, 38, 132, 76, 1, 0, 77, 132, 0, 0, 78, 37, 0, 38, 132, 78, 1, 0, 79, 132, 0, 38, 132, 79, 1, 0, 80, 132, 0, 20, 132, 80, 77, 0, 82, 132, 0, 33, 83, 82, 0, 38, 132, 83, 1, 0, 84, 132, 0, 0, 37, 84, 0, 0, 85, 1, 0, 19, 132, 85, 128, 0, 86, 132, 0, 38, 132, 86, 64, 0, 87, 132, 0, 32, 88, 87, 64, 121, 88, 20, 0, 1, 132, 44, 1, 1, 131, 188, 2, 1, 130, 188, 2, 134, 89, 0, 0, 64, 86, 0, 0, 132, 131, 130, 127, 38, 130, 89, 1, 0, 90, 130, 0, 0, 91, 37, 0, 38, 130, 91, 1, 0, 93, 130, 0, 38, 130, 93, 1, 0, 94, 130, 0, 20, 130, 94, 90, 0, 95, 130, 0, 33, 96, 95, 0, 38, 130, 96, 1, 0, 97, 130, 0, 0, 37, 97, 0, 0, 98, 1, 0, 19, 130, 98, 128, 0, 99, 130, 0, 1, 130, 128, 0, 19, 130, 99, 130, 0, 100, 130, 0, 1, 130, 128, 0, 13, 101, 100, 130, 121, 101, 20, 0, 1, 130, 188, 2, 1, 131, 232, 3, 1, 132, 232, 3, 134, 102, 0, 0, 64, 86, 0, 0, 130, 131, 132, 127, 38, 132, 102, 1, 0, 104, 132, 0, 0, 105, 37, 0, 38, 132, 105, 1, 0, 106, 132, 0, 38, 132, 106, 1, 0, 107, 132, 0, 20, 132, 107, 104, 0, 108, 132, 0, 33, 109, 108, 0, 38, 132, 109, 1, 0, 110, 132, 0, 0, 37, 110, 0, 0, 111, 1, 0, 19, 132, 111, 128, 0, 112, 132, 0, 1, 132, 0, 1, 19, 132, 112, 132, 0, 113, 132, 0, 1, 132, 0, 1, 13, 115, 113, 132, 121, 115, 20, 0, 1, 132, 44, 1, 1, 131, 232, 3, 1, 130, 208, 7, 134, 116, 0, 0, 64, 86, 0, 0, 132, 127, 131, 130, 38, 130, 116, 1, 0, 117, 130, 0, 0, 118, 37, 0, 38, 130, 118, 1, 0, 119, 130, 0, 38, 130, 119, 1, 0, 120, 130, 0, 20, 130, 120, 117, 0, 121, 130, 0, 33, 122, 121, 0, 38, 130, 122, 1, 0, 123, 130, 0, 0, 37, 123, 0, 0, 124, 1, 0, 19, 130, 124, 128, 0, 3, 130, 0, 1, 130, 0, 2, 19, 130, 3, 130, 0, 4, 130, 0, 1, 130, 0, 2, 13, 5, 4, 130, 121, 5, 21, 0, 1, 130, 0, 0, 1, 131, 132, 3, 1, 132, 44, 1, 1, 129, 208, 7, 134, 6, 0, 0, 64, 86, 0, 0, 130, 131, 132, 129, 38, 129, 6, 1, 0, 7, 129, 0, 0, 8, 37, 0, 38, 129, 8, 1, 0, 9, 129, 0, 38, 129, 9, 1, 0, 10, 129, 0, 20, 129, 10, 7, 0, 11, 129, 0, 33, 12, 11, 0, 38, 129, 12, 1, 0, 14, 129, 0, 0, 37, 14, 0, 0, 15, 1, 0, 19, 129, 15, 128, 0, 16, 129, 0, 1, 129, 0, 4, 19, 129, 16, 129, 0, 17, 129, 0, 1, 129, 0, 4, 13, 18, 17, 129, 120, 18, 6, 0, 0, 28, 37, 0, 38, 129, 28, 1, 0, 29, 129, 0, 137, 126, 0, 0, 139, 29, 0, 0, 1, 129, 0, 0, 1, 132, 184, 11, 1, 131, 208, 7, 134, 19, 0, 0, 64, 86, 0, 0, 127, 129, 132, 131, 38, 131, 19, 1, 0, 20, 131, 0, 0, 21, 37, 0, 38, 131, 21, 1, 0, 22, 131, 0, 38, 131, 22, 1, 0, 23, 131, 0, 20, 131, 23, 20, 0, 25, 131, 0, 33, 26, 25, 0, 38, 131, 26, 1, 0, 27, 131, 0, 0, 37, 27, 0, 0, 28, 37, 0, 38, 131, 28, 1, 0, 29, 131, 0, 137, 126, 0, 0, 139, 29, 0, 0, 140, 6, 87, 0, 0, 0, 0, 0, 2, 84, 0, 0, 255, 0, 0, 0, 1, 82, 0, 0, 136, 85, 0, 0, 0, 83, 85, 0, 136, 85, 0, 0, 25, 85, 85, 96, 137, 85, 0, 0, 130, 85, 0, 0, 136, 86, 0, 0, 49, 85, 85, 86, 216, 72, 0, 0, 1, 86, 96, 0, 135, 85, 0, 0, 86, 0, 0, 0, 25, 72, 83, 64, 25, 71, 83, 56, 25, 69, 83, 48, 25, 68, 83, 40, 25, 67, 83, 32, 25, 73, 83, 24, 25, 70, 83, 8, 0, 66, 83, 0, 0, 56, 0, 0, 0, 63, 1, 0, 0, 64, 2, 0, 0, 65, 3, 0, 0, 6, 4, 0, 0, 7, 5, 0, 1, 9, 0, 0, 0, 10, 64, 0, 134, 85, 0, 0, 192, 187, 0, 0, 10, 0, 0, 0, 0, 11, 65, 0, 41, 85, 11, 16, 42, 85, 85, 16, 33, 12, 85, 0, 121, 12, 7, 0, 0, 13, 56, 0, 0, 14, 63, 0, 1, 86, 208, 7, 134, 85, 0, 0, 220, 160, 0, 0, 13, 14, 86, 0, 0, 15, 56, 0, 0, 16, 63, 0, 0, 17, 6, 0, 0, 18, 65, 0, 134, 19, 0, 0, 40, 180, 0, 0, 15, 16, 17, 18, 0, 8, 19, 0, 0, 20, 9, 0, 25, 85, 20, 1, 41, 85, 85, 24, 42, 85, 85, 24, 0, 21, 85, 0, 0, 9, 21, 0, 0, 22, 8, 0, 19, 85, 22, 84, 0, 23, 85, 0, 32, 24, 23, 2, 121, 24, 5, 0, 1, 86, 232, 3, 134, 85, 0, 0, 220, 173, 0, 0, 86, 0, 0, 0, 0, 25, 8, 0, 19, 85, 25, 84, 0, 26, 85, 0, 32, 27, 26, 2, 120, 27, 2, 0, 119, 0, 10, 0, 0, 28, 9, 0, 19, 85, 28, 84, 0, 29, 85, 0, 0, 30, 7, 0, 19, 85, 30, 84, 0, 31, 85, 0, 15, 32, 29, 31, 120, 32, 220, 255, 119, 0, 1, 0, 0, 33, 8, 0, 19, 85, 33, 84, 0, 34, 85, 0, 33, 35, 34, 0, 120, 35, 4, 0, 0, 62, 8, 0, 137, 83, 0, 0, 139, 62, 0, 0, 0, 36, 56, 0, 0, 37, 63, 0, 85, 66, 36, 0, 25, 74, 66, 4, 85, 74, 37, 0, 1, 86, 235, 2, 134, 85, 0, 0, 240, 180, 0, 0, 86, 66, 0, 0, 0, 38, 8, 0, 19, 85, 38, 84, 0, 39, 85, 0, 1, 85, 1, 0, 1, 86, 127, 0, 138, 39, 85, 86, 104, 76, 0, 0, 172, 76, 0, 0, 212, 76, 0, 0, 252, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 64, 76, 0, 0, 36, 77, 0, 0, 0, 52, 56, 0, 0, 53, 63, 0, 85, 71, 52, 0, 25, 79, 71, 4, 85, 79, 53, 0, 1, 86, 23, 4, 134, 85, 0, 0, 240, 180, 0, 0, 86, 71, 0, 0, 119, 0, 58, 0, 0, 40, 56, 0, 0, 41, 63, 0, 0, 42, 6, 0, 2, 85, 0, 0, 255, 255, 0, 0, 19, 85, 42, 85, 0, 43, 85, 0, 85, 70, 40, 0, 25, 80, 70, 4, 85, 80, 41, 0, 25, 81, 70, 8, 85, 81, 43, 0, 1, 86, 17, 3, 134, 85, 0, 0, 240, 180, 0, 0, 86, 70, 0, 0, 119, 0, 41, 0, 0, 44, 56, 0, 0, 45, 63, 0, 85, 73, 44, 0, 25, 75, 73, 4, 85, 75, 45, 0, 1, 86, 76, 3, 134, 85, 0, 0, 240, 180, 0, 0, 86, 73, 0, 0, 119, 0, 31, 0, 0, 46, 56, 0, 0, 47, 63, 0, 85, 67, 46, 0, 25, 76, 67, 4, 85, 76, 47, 0, 1, 86, 125, 3, 134, 85, 0, 0, 240, 180, 0, 0, 86, 67, 0, 0, 119, 0, 21, 0, 0, 48, 56, 0, 0, 49, 63, 0, 85, 68, 48, 0, 25, 77, 68, 4, 85, 77, 49, 0, 1, 86, 175, 3, 134, 85, 0, 0, 240, 180, 0, 0, 86, 68, 0, 0, 119, 0, 11, 0, 0, 50, 56, 0, 0, 51, 63, 0, 85, 69, 50, 0, 25, 78, 69, 4, 85, 78, 51, 0, 1, 86, 226, 3, 134, 85, 0, 0, 240, 180, 0, 0, 86, 69, 0, 0, 119, 0, 1, 0, 0, 54, 9, 0, 19, 85, 54, 84, 0, 55, 85, 0, 0, 57, 7, 0, 19, 85, 57, 84, 0, 58, 85, 0, 17, 59, 58, 55, 120, 59, 4, 0, 0, 62, 8, 0, 137, 83, 0, 0, 139, 62, 0, 0, 0, 60, 9, 0, 19, 85, 60, 84, 0, 61, 85, 0, 85, 72, 61, 0, 1, 86, 92, 4, 134, 85, 0, 0, 240, 180, 0, 0, 86, 72, 0, 0, 0, 62, 8, 0, 137, 83, 0, 0, 139, 62, 0, 0, 140, 3, 64, 0, 0, 0, 0, 0, 2, 59, 0, 0, 128, 128, 128, 128, 2, 60, 0, 0, 255, 254, 254, 254, 2, 61, 0, 0, 255, 0, 0, 0, 1, 57, 0, 0, 136, 62, 0, 0, 0, 58, 62, 0, 19, 62, 1, 61, 0, 38, 62, 0, 0, 49, 0, 0, 38, 62, 49, 3, 0, 50, 62, 0, 33, 51, 50, 0, 33, 52, 2, 0, 19, 62, 52, 51, 0, 56, 62, 0, 121, 56, 34, 0, 19, 62, 1, 61, 0, 53, 62, 0, 0, 6, 0, 0, 0, 9, 2, 0, 78, 54, 6, 0, 41, 62, 54, 24, 42, 62, 62, 24, 41, 63, 53, 24, 42, 63, 63, 24, 13, 18, 62, 63, 121, 18, 5, 0, 0, 5, 6, 0, 0, 8, 9, 0, 1, 57, 6, 0, 119, 0, 23, 0, 25, 19, 6, 1, 26, 20, 9, 1, 0, 21, 19, 0, 38, 63, 21, 3, 0, 22, 63, 0, 33, 23, 22, 0, 33, 24, 20, 0, 19, 63, 24, 23, 0, 55, 63, 0, 121, 55, 4, 0, 0, 6, 19, 0, 0, 9, 20, 0, 119, 0, 233, 255, 0, 4, 19, 0, 0, 7, 20, 0, 0, 17, 24, 0, 1, 57, 5, 0, 119, 0, 5, 0, 0, 4, 0, 0, 0, 7, 2, 0, 0, 17, 52, 0, 1, 57, 5, 0, 32, 63, 57, 5, 121, 63, 8, 0, 121, 17, 5, 0, 0, 5, 4, 0, 0, 8, 7, 0, 1, 57, 6, 0, 119, 0, 3, 0, 0, 14, 4, 0, 1, 16, 0, 0, 32, 63, 57, 6, 121, 63, 83, 0, 78, 25, 5, 0, 19, 63, 1, 61, 0, 26, 63, 0, 41, 63, 25, 24, 42, 63, 63, 24, 41, 62, 26, 24, 42, 62, 62, 24, 13, 27, 63, 62, 121, 27, 4, 0, 0, 14, 5, 0, 0, 16, 8, 0, 119, 0, 71, 0, 2, 62, 0, 0, 1, 1, 1, 1, 5, 28, 38, 62, 1, 62, 3, 0, 16, 29, 62, 8, 121, 29, 33, 0, 0, 10, 5, 0, 0, 12, 8, 0, 82, 30, 10, 0, 21, 62, 30, 28, 0, 31, 62, 0, 2, 62, 0, 0, 1, 1, 1, 1, 4, 32, 31, 62, 19, 62, 31, 59, 0, 33, 62, 0, 21, 62, 33, 59, 0, 34, 62, 0, 19, 62, 34, 32, 0, 35, 62, 0, 32, 36, 35, 0, 120, 36, 2, 0, 119, 0, 13, 0, 25, 37, 10, 4, 26, 39, 12, 4, 1, 62, 3, 0, 16, 40, 62, 39, 121, 40, 4, 0, 0, 10, 37, 0, 0, 12, 39, 0, 119, 0, 234, 255, 0, 3, 37, 0, 0, 11, 39, 0, 1, 57, 11, 0, 119, 0, 7, 0, 0, 13, 10, 0, 0, 15, 12, 0, 119, 0, 4, 0, 0, 3, 5, 0, 0, 11, 8, 0, 1, 57, 11, 0, 32, 62, 57, 11, 121, 62, 8, 0, 32, 41, 11, 0, 121, 41, 4, 0, 0, 14, 3, 0, 1, 16, 0, 0, 119, 0, 23, 0, 0, 13, 3, 0, 0, 15, 11, 0, 78, 42, 13, 0, 41, 62, 42, 24, 42, 62, 62, 24, 41, 63, 26, 24, 42, 63, 63, 24, 13, 43, 62, 63, 121, 43, 4, 0, 0, 14, 13, 0, 0, 16, 15, 0, 119, 0, 11, 0, 25, 44, 13, 1, 26, 45, 15, 1, 32, 46, 45, 0, 121, 46, 4, 0, 0, 14, 44, 0, 1, 16, 0, 0, 119, 0, 4, 0, 0, 13, 44, 0, 0, 15, 45, 0, 119, 0, 237, 255 ], eb + 10240);
 HEAPU8.set([ 33, 47, 16, 0, 1, 63, 0, 0, 125, 48, 47, 14, 63, 0, 0, 0, 139, 48, 0, 0, 140, 3, 69, 0, 0, 0, 0, 0, 2, 66, 0, 0, 146, 0, 0, 0, 1, 64, 0, 0, 136, 67, 0, 0, 0, 65, 67, 0, 136, 67, 0, 0, 25, 67, 67, 48, 137, 67, 0, 0, 130, 67, 0, 0, 136, 68, 0, 0, 49, 67, 67, 68, 88, 80, 0, 0, 1, 68, 48, 0, 135, 67, 0, 0, 68, 0, 0, 0, 25, 59, 65, 16, 0, 58, 65, 0, 25, 30, 65, 32, 25, 41, 0, 28, 82, 52, 41, 0, 85, 30, 52, 0, 25, 54, 30, 4, 25, 55, 0, 20, 82, 56, 55, 0, 4, 57, 56, 52, 85, 54, 57, 0, 25, 10, 30, 8, 85, 10, 1, 0, 25, 11, 30, 12, 85, 11, 2, 0, 3, 12, 57, 2, 25, 13, 0, 60, 82, 14, 13, 0, 0, 15, 30, 0, 85, 58, 14, 0, 25, 60, 58, 4, 85, 60, 15, 0, 25, 61, 58, 8, 1, 67, 2, 0, 85, 61, 67, 0, 135, 16, 4, 0, 66, 58, 0, 0, 134, 17, 0, 0, 184, 184, 0, 0, 16, 0, 0, 0, 13, 18, 12, 17, 121, 18, 3, 0, 1, 64, 3, 0, 119, 0, 69, 0, 1, 4, 2, 0, 0, 5, 12, 0, 0, 6, 30, 0, 0, 26, 17, 0, 34, 25, 26, 0, 120, 25, 44, 0, 4, 35, 5, 26, 25, 36, 6, 4, 82, 37, 36, 0, 16, 38, 37, 26, 25, 39, 6, 8, 125, 9, 38, 39, 6, 0, 0, 0, 41, 67, 38, 31, 42, 67, 67, 31, 0, 40, 67, 0, 3, 8, 40, 4, 1, 67, 0, 0, 125, 42, 38, 37, 67, 0, 0, 0, 4, 3, 26, 42, 82, 43, 9, 0, 3, 44, 43, 3, 85, 9, 44, 0, 25, 45, 9, 4, 82, 46, 45, 0, 4, 47, 46, 3, 85, 45, 47, 0, 82, 48, 13, 0, 0, 49, 9, 0, 85, 59, 48, 0, 25, 62, 59, 4, 85, 62, 49, 0, 25, 63, 59, 8, 85, 63, 8, 0, 135, 50, 4, 0, 66, 59, 0, 0, 134, 51, 0, 0, 184, 184, 0, 0, 50, 0, 0, 0, 13, 53, 35, 51, 121, 53, 3, 0, 1, 64, 3, 0, 119, 0, 25, 0, 0, 4, 8, 0, 0, 5, 35, 0, 0, 6, 9, 0, 0, 26, 51, 0, 119, 0, 212, 255, 25, 27, 0, 16, 1, 67, 0, 0, 85, 27, 67, 0, 1, 67, 0, 0, 85, 41, 67, 0, 1, 67, 0, 0, 85, 55, 67, 0, 82, 28, 0, 0, 39, 67, 28, 32, 0, 29, 67, 0, 85, 0, 29, 0, 32, 31, 4, 2, 121, 31, 3, 0, 1, 7, 0, 0, 119, 0, 5, 0, 25, 32, 6, 4, 82, 33, 32, 0, 4, 34, 2, 33, 0, 7, 34, 0, 32, 67, 64, 3, 121, 67, 11, 0, 25, 19, 0, 44, 82, 20, 19, 0, 25, 21, 0, 48, 82, 22, 21, 0, 3, 23, 20, 22, 25, 24, 0, 16, 85, 24, 23, 0, 85, 41, 20, 0, 85, 55, 20, 0, 0, 7, 2, 0, 137, 65, 0, 0, 139, 7, 0, 0, 140, 3, 77, 0, 0, 0, 0, 0, 1, 74, 0, 0, 136, 76, 0, 0, 0, 75, 76, 0, 82, 29, 0, 0, 2, 76, 0, 0, 34, 237, 251, 106, 3, 40, 29, 76, 25, 51, 0, 8, 82, 62, 51, 0, 134, 68, 0, 0, 100, 188, 0, 0, 62, 40, 0, 0, 25, 69, 0, 12, 82, 70, 69, 0, 134, 9, 0, 0, 100, 188, 0, 0, 70, 40, 0, 0, 25, 10, 0, 16, 82, 11, 10, 0, 134, 12, 0, 0, 100, 188, 0, 0, 11, 40, 0, 0, 43, 76, 1, 2, 0, 13, 76, 0, 16, 14, 68, 13, 121, 14, 114, 0, 41, 76, 68, 2, 0, 15, 76, 0, 4, 16, 1, 15, 16, 17, 9, 16, 16, 18, 12, 16, 19, 76, 17, 18, 0, 71, 76, 0, 121, 71, 104, 0, 20, 76, 12, 9, 0, 19, 76, 0, 38, 76, 19, 3, 0, 20, 76, 0, 32, 21, 20, 0, 121, 21, 96, 0, 43, 76, 9, 2, 0, 22, 76, 0, 43, 76, 12, 2, 0, 23, 76, 0, 1, 4, 0, 0, 0, 5, 68, 0, 43, 76, 5, 1, 0, 24, 76, 0, 3, 25, 4, 24, 41, 76, 25, 1, 0, 26, 76, 0, 3, 27, 26, 22, 41, 76, 27, 2, 3, 28, 0, 76, 82, 30, 28, 0, 134, 31, 0, 0, 100, 188, 0, 0, 30, 40, 0, 0, 25, 32, 27, 1, 41, 76, 32, 2, 3, 33, 0, 76, 82, 34, 33, 0, 134, 35, 0, 0, 100, 188, 0, 0, 34, 40, 0, 0, 16, 36, 35, 1, 4, 37, 1, 35, 16, 38, 31, 37, 19, 76, 36, 38, 0, 72, 76, 0, 120, 72, 3, 0, 1, 8, 0, 0, 119, 0, 68, 0, 3, 39, 35, 31, 3, 41, 0, 39, 78, 42, 41, 0, 41, 76, 42, 24, 42, 76, 76, 24, 32, 43, 76, 0, 120, 43, 3, 0, 1, 8, 0, 0, 119, 0, 59, 0, 3, 44, 0, 35, 134, 45, 0, 0, 184, 161, 0, 0, 2, 44, 0, 0, 32, 46, 45, 0, 120, 46, 14, 0, 32, 65, 5, 1, 34, 66, 45, 0, 4, 67, 5, 24, 125, 7, 66, 24, 67, 0, 0, 0, 125, 6, 66, 4, 25, 0, 0, 0, 121, 65, 3, 0, 1, 8, 0, 0, 119, 0, 43, 0, 0, 4, 6, 0, 0, 5, 7, 0, 119, 0, 202, 255, 3, 47, 26, 23, 41, 76, 47, 2, 3, 48, 0, 76, 82, 49, 48, 0, 134, 50, 0, 0, 100, 188, 0, 0, 49, 40, 0, 0, 25, 52, 47, 1, 41, 76, 52, 2, 3, 53, 0, 76, 82, 54, 53, 0, 134, 55, 0, 0, 100, 188, 0, 0, 54, 40, 0, 0, 16, 56, 55, 1, 4, 57, 1, 55, 16, 58, 50, 57, 19, 76, 56, 58, 0, 73, 76, 0, 121, 73, 13, 0, 3, 59, 0, 55, 3, 60, 55, 50, 3, 61, 0, 60, 78, 63, 61, 0, 41, 76, 63, 24, 42, 76, 76, 24, 32, 64, 76, 0, 1, 76, 0, 0, 125, 3, 64, 59, 76, 0, 0, 0, 0, 8, 3, 0, 119, 0, 8, 0, 1, 8, 0, 0, 119, 0, 6, 0, 1, 8, 0, 0, 119, 0, 4, 0, 1, 8, 0, 0, 119, 0, 2, 0, 1, 8, 0, 0, 139, 8, 0, 0, 140, 2, 55, 0, 0, 0, 0, 0, 2, 52, 0, 0, 128, 128, 128, 128, 2, 53, 0, 0, 255, 254, 254, 254, 1, 50, 0, 0, 136, 54, 0, 0, 0, 51, 54, 0, 0, 25, 1, 0, 0, 36, 0, 0, 21, 54, 25, 36, 0, 44, 54, 0, 38, 54, 44, 3, 0, 45, 54, 0, 32, 46, 45, 0, 121, 46, 74, 0, 38, 54, 25, 3, 0, 47, 54, 0, 32, 48, 47, 0, 121, 48, 4, 0, 0, 5, 1, 0, 0, 7, 0, 0, 119, 0, 24, 0, 0, 6, 1, 0, 0, 8, 0, 0, 78, 49, 6, 0, 83, 8, 49, 0, 41, 54, 49, 24, 42, 54, 54, 24, 32, 15, 54, 0, 121, 15, 3, 0, 0, 9, 8, 0, 119, 0, 60, 0, 25, 16, 6, 1, 25, 17, 8, 1, 0, 18, 16, 0, 38, 54, 18, 3, 0, 19, 54, 0, 32, 20, 19, 0, 121, 20, 4, 0, 0, 5, 16, 0, 0, 7, 17, 0, 119, 0, 4, 0, 0, 6, 16, 0, 0, 8, 17, 0, 119, 0, 236, 255, 82, 21, 5, 0, 2, 54, 0, 0, 1, 1, 1, 1, 4, 22, 21, 54, 19, 54, 21, 52, 0, 23, 54, 0, 21, 54, 23, 52, 0, 24, 54, 0, 19, 54, 24, 22, 0, 26, 54, 0, 32, 27, 26, 0, 121, 27, 26, 0, 0, 4, 7, 0, 0, 10, 5, 0, 0, 30, 21, 0, 25, 28, 10, 4, 25, 29, 4, 4, 85, 4, 30, 0, 82, 31, 28, 0, 2, 54, 0, 0, 1, 1, 1, 1, 4, 32, 31, 54, 19, 54, 31, 52, 0, 33, 54, 0, 21, 54, 33, 52, 0, 34, 54, 0, 19, 54, 34, 32, 0, 35, 54, 0, 32, 37, 35, 0, 121, 37, 5, 0, 0, 4, 29, 0, 0, 10, 28, 0, 0, 30, 31, 0, 119, 0, 238, 255, 0, 2, 28, 0, 0, 3, 29, 0, 119, 0, 3, 0, 0, 2, 5, 0, 0, 3, 7, 0, 0, 11, 2, 0, 0, 12, 3, 0, 1, 50, 8, 0, 119, 0, 4, 0, 0, 11, 1, 0, 0, 12, 0, 0, 1, 50, 8, 0, 32, 54, 50, 8, 121, 54, 24, 0, 78, 38, 11, 0, 83, 12, 38, 0, 41, 54, 38, 24, 42, 54, 54, 24, 32, 39, 54, 0, 121, 39, 3, 0, 0, 9, 12, 0, 119, 0, 16, 0, 0, 13, 12, 0, 0, 14, 11, 0, 25, 40, 14, 1, 25, 41, 13, 1, 78, 42, 40, 0, 83, 41, 42, 0, 41, 54, 42, 24, 42, 54, 54, 24, 32, 43, 54, 0, 121, 43, 3, 0, 0, 9, 41, 0, 119, 0, 4, 0, 0, 13, 41, 0, 0, 14, 40, 0, 119, 0, 244, 255, 139, 9, 0, 0, 140, 4, 59, 0, 0, 0, 0, 0, 1, 55, 0, 0, 136, 57, 0, 0, 0, 56, 57, 0, 136, 57, 0, 0, 25, 57, 57, 32, 137, 57, 0, 0, 130, 57, 0, 0, 136, 58, 0, 0, 49, 57, 57, 58, 124, 86, 0, 0, 1, 58, 32, 0, 135, 57, 0, 0, 58, 0, 0, 0, 0, 54, 56, 0, 25, 37, 56, 20, 0, 48, 0, 0, 0, 50, 1, 0, 0, 51, 2, 0, 0, 52, 3, 0, 0, 53, 48, 0, 0, 7, 51, 0, 15, 8, 7, 53, 121, 8, 3, 0, 1, 55, 3, 0, 119, 0, 6, 0, 0, 9, 50, 0, 0, 10, 52, 0, 15, 11, 10, 9, 121, 11, 2, 0, 1, 55, 3, 0, 32, 57, 55, 3, 121, 57, 7, 0, 134, 57, 0, 0, 252, 184, 0, 0, 1, 58, 124, 5, 134, 57, 0, 0, 240, 180, 0, 0, 58, 54, 0, 0, 1, 57, 41, 21, 78, 12, 57, 0, 41, 57, 12, 24, 42, 57, 57, 24, 33, 13, 57, 0, 1, 57, 184, 21, 80, 14, 57, 0, 41, 57, 14, 16, 42, 57, 57, 16, 0, 15, 57, 0, 0, 16, 48, 0, 121, 13, 48, 0, 134, 31, 0, 0, 16, 169, 0, 0, 16, 0, 0, 0, 17, 32, 15, 31, 121, 32, 33, 0, 1, 57, 184, 21, 80, 33, 57, 0, 41, 57, 33, 16, 42, 57, 57, 16, 0, 34, 57, 0, 0, 35, 51, 0, 134, 36, 0, 0, 16, 169, 0, 0, 35, 0, 0, 0, 17, 38, 36, 34, 121, 38, 20, 0, 1, 57, 186, 21, 80, 39, 57, 0, 41, 57, 39, 16, 42, 57, 57, 16, 0, 40, 57, 0, 0, 41, 50, 0, 17, 42, 41, 40, 121, 42, 10, 0, 1, 57, 186, 21, 80, 43, 57, 0, 41, 57, 43, 16, 42, 57, 57, 16, 0, 44, 57, 0, 0, 45, 52, 0, 17, 46, 44, 45, 0, 47, 46, 0, 119, 0, 6, 0, 1, 47, 0, 0, 119, 0, 4, 0, 1, 47, 0, 0, 119, 0, 2, 0, 1, 47, 0, 0, 38, 57, 47, 1, 0, 5, 57, 0, 83, 37, 5, 0, 78, 6, 37, 0, 38, 57, 6, 1, 0, 49, 57, 0, 137, 56, 0, 0, 139, 49, 0, 0, 119, 0, 41, 0, 17, 17, 16, 15, 121, 17, 30, 0, 1, 57, 184, 21, 80, 18, 57, 0, 41, 57, 18, 16, 42, 57, 57, 16, 0, 19, 57, 0, 0, 20, 51, 0, 17, 21, 19, 20, 121, 21, 20, 0, 1, 57, 186, 21, 80, 22, 57, 0, 41, 57, 22, 16, 42, 57, 57, 16, 0, 23, 57, 0, 0, 24, 50, 0, 17, 25, 24, 23, 121, 25, 10, 0, 1, 57, 186, 21, 80, 26, 57, 0, 41, 57, 26, 16, 42, 57, 57, 16, 0, 27, 57, 0, 0, 28, 52, 0, 17, 29, 27, 28, 0, 30, 29, 0, 119, 0, 6, 0, 1, 30, 0, 0, 119, 0, 4, 0, 1, 30, 0, 0, 119, 0, 2, 0, 1, 30, 0, 0, 38, 57, 30, 1, 0, 4, 57, 0, 83, 37, 4, 0, 78, 6, 37, 0, 38, 57, 6, 1, 0, 49, 57, 0, 137, 56, 0, 0, 139, 49, 0, 0, 1, 57, 0, 0, 139, 57, 0, 0, 140, 3, 65, 0, 0, 0, 0, 0, 2, 62, 0, 0, 255, 0, 0, 0, 2, 63, 0, 0, 128, 0, 0, 0, 1, 60, 0, 0, 136, 64, 0, 0, 0, 61, 64, 0, 1, 64, 0, 0, 13, 24, 0, 64, 121, 24, 3, 0, 1, 3, 1, 0, 119, 0, 146, 0, 35, 35, 1, 128, 121, 35, 6, 0, 19, 64, 1, 62, 0, 46, 64, 0, 83, 0, 46, 0, 1, 3, 1, 0, 119, 0, 139, 0, 134, 54, 0, 0, 228, 189, 0, 0, 1, 64, 188, 0, 3, 55, 54, 64, 82, 56, 55, 0, 82, 57, 56, 0, 1, 64, 0, 0, 13, 58, 57, 64, 121, 58, 18, 0, 38, 64, 1, 128, 0, 4, 64, 0, 2, 64, 0, 0, 128, 223, 0, 0, 13, 5, 4, 64, 121, 5, 6, 0, 19, 64, 1, 62, 0, 7, 64, 0, 83, 0, 7, 0, 1, 3, 1, 0, 119, 0, 119, 0, 134, 6, 0, 0, 100, 189, 0, 0, 1, 64, 84, 0, 85, 6, 64, 0, 1, 3, 255, 255, 119, 0, 113, 0, 1, 64, 0, 8, 16, 8, 1, 64, 121, 8, 19, 0, 43, 64, 1, 6, 0, 9, 64, 0, 1, 64, 192, 0, 20, 64, 9, 64, 0, 10, 64, 0, 19, 64, 10, 62, 0, 11, 64, 0, 25, 12, 0, 1, 83, 0, 11, 0, 38, 64, 1, 63, 0, 13, 64, 0, 20, 64, 13, 63, 0, 14, 64, 0, 19, 64, 14, 62, 0, 15, 64, 0, 83, 12, 15, 0, 1, 3, 2, 0, 119, 0, 92, 0, 2, 64, 0, 0, 0, 216, 0, 0, 16, 16, 1, 64, 1, 64, 0, 224, 19, 64, 1, 64, 0, 17, 64, 0, 2, 64, 0, 0, 0, 224, 0, 0, 13, 18, 17, 64, 20, 64, 16, 18, 0, 59, 64, 0, 121, 59, 29, 0, 43, 64, 1, 12, 0, 19, 64, 0, 1, 64, 224, 0, 20, 64, 19, 64, 0, 20, 64, 0, 19, 64, 20, 62, 0, 21, 64, 0, 25, 22, 0, 1, 83, 0, 21, 0, 43, 64, 1, 6, 0, 23, 64, 0, 38, 64, 23, 63, 0, 25, 64, 0, 20, 64, 25, 63, 0, 26, 64, 0, 19, 64, 26, 62, 0, 27, 64, 0, 25, 28, 0, 2, 83, 22, 27, 0, 38, 64, 1, 63, 0, 29, 64, 0, 20, 64, 29, 63, 0, 30, 64, 0, 19, 64, 30, 62, 0, 31, 64, 0, 83, 28, 31, 0, 1, 3, 3, 0, 119, 0, 52, 0, 2, 64, 0, 0, 0, 0, 1, 0, 4, 32, 1, 64, 2, 64, 0, 0, 0, 0, 16, 0, 16, 33, 32, 64, 121, 33, 39, 0, 43, 64, 1, 18, 0, 34, 64, 0, 1, 64, 240, 0, 20, 64, 34, 64, 0, 36, 64, 0, 19, 64, 36, 62, 0, 37, 64, 0, 25, 38, 0, 1, 83, 0, 37, 0, 43, 64, 1, 12, 0, 39, 64, 0, 38, 64, 39, 63, 0, 40, 64, 0, 20, 64, 40, 63, 0, 41, 64, 0, 19, 64, 41, 62, 0, 42, 64, 0, 25, 43, 0, 2, 83, 38, 42, 0, 43, 64, 1, 6, 0, 44, 64, 0, 38, 64, 44, 63, 0, 45, 64, 0, 20, 64, 45, 63, 0, 47, 64, 0, 19, 64, 47, 62, 0, 48, 64, 0, 25, 49, 0, 3, 83, 43, 48, 0, 38, 64, 1, 63, 0, 50, 64, 0, 20, 64, 50, 63, 0, 51, 64, 0, 19, 64, 51, 62, 0, 52, 64, 0, 83, 49, 52, 0, 1, 3, 4, 0, 119, 0, 7, 0, 134, 53, 0, 0, 100, 189, 0, 0, 1, 64, 84, 0, 85, 53, 64, 0, 1, 3, 255, 255, 119, 0, 1, 0, 139, 3, 0, 0, 140, 3, 54, 0, 0, 0, 0, 0, 1, 47, 0, 0, 136, 50, 0, 0, 0, 48, 50, 0, 136, 50, 0, 0, 1, 51, 224, 0, 3, 50, 50, 51, 137, 50, 0, 0, 130, 50, 0, 0, 136, 51, 0, 0, 49, 50, 50, 51, 52, 91, 0, 0, 1, 51, 224, 0, 135, 50, 0, 0, 51, 0, 0, 0, 25, 27, 48, 120, 25, 38, 48, 80, 0, 40, 48, 0, 1, 50, 136, 0, 3, 41, 48, 50, 0, 46, 38, 0, 25, 49, 46, 40, 1, 50, 0, 0, 85, 46, 50, 0, 25, 46, 46, 4, 54, 50, 46, 49, 80, 91, 0, 0, 82, 45, 2, 0, 85, 27, 45, 0, 1, 50, 0, 0, 134, 42, 0, 0, 152, 23, 0, 0, 50, 1, 27, 40, 38, 0, 0, 0, 34, 43, 42, 0, 121, 43, 3, 0, 1, 4, 255, 255, 119, 0, 94, 0, 25, 44, 0, 76, 82, 7, 44, 0, 1, 50, 255, 255, 15, 8, 50, 7, 121, 8, 6, 0, 134, 9, 0, 0, 220, 191, 0, 0, 0, 0, 0, 0, 0, 39, 9, 0, 119, 0, 2, 0, 1, 39, 0, 0, 82, 10, 0, 0, 38, 50, 10, 32, 0, 11, 50, 0, 25, 12, 0, 74, 78, 13, 12, 0, 41, 50, 13, 24, 42, 50, 50, 24, 34, 14, 50, 1, 121, 14, 4, 0, 38, 50, 10, 223, 0, 15, 50, 0, 85, 0, 15, 0, 25, 16, 0, 48, 82, 17, 16, 0, 32, 18, 17, 0, 121, 18, 46, 0, 25, 20, 0, 44, 82, 21, 20, 0, 85, 20, 41, 0, 25, 22, 0, 28, 85, 22, 41, 0, 25, 23, 0, 20, 85, 23, 41, 0, 1, 50, 80, 0, 85, 16, 50, 0, 25, 24, 41, 80, 25, 25, 0, 16, 85, 25, 24, 0, 134, 26, 0, 0, 152, 23, 0, 0, 0, 1, 27, 40, 38, 0, 0, 0, 1, 50, 0, 0, 13, 28, 21, 50, 121, 28, 3, 0, 0, 5, 26, 0, 119, 0, 30, 0, 25, 29, 0, 36, 82, 30, 29, 0, 38, 51, 30, 7, 1, 52, 0, 0, 1, 53, 0, 0, 135, 50, 5, 0, 51, 0, 52, 53, 82, 31, 23, 0, 1, 50, 0, 0, 13, 32, 31, 50, 1, 50, 255, 255, 125, 3, 32, 50, 26, 0, 0, 0, 85, 20, 21, 0, 1, 50, 0, 0, 85, 16, 50, 0, 1, 50, 0, 0, 85, 25, 50, 0, 1, 50, 0, 0, 85, 22, 50, 0, 1, 50, 0, 0, 85, 23, 50, 0, 0, 5, 3, 0, 119, 0, 6, 0, 134, 19, 0, 0, 152, 23, 0, 0, 0, 1, 27, 40, 38, 0, 0, 0, 0, 5, 19, 0, 82, 33, 0, 0, 38, 50, 33, 32, 0, 34, 50, 0, 32, 35, 34, 0, 1, 50, 255, 255, 125, 6, 35, 5, 50, 0, 0, 0, 20, 50, 33, 11, 0, 36, 50, 0, 85, 0, 36, 0, 32, 37, 39, 0, 120, 37, 4, 0, 134, 50, 0, 0, 196, 191, 0, 0, 0, 0, 0, 0, 0, 4, 6, 0, 137, 48, 0, 0, 139, 4, 0, 0, 140, 1, 42, 0, 0, 0, 0, 0, 1, 34, 0, 0, 136, 36, 0, 0, 0, 35, 36, 0, 136, 36, 0, 0, 25, 36, 36, 32, 137, 36, 0, 0, 130, 36, 0, 0, 136, 37, 0, 0, 49, 36, 36, 37, 72, 93, 0, 0, 1, 37, 32, 0, 135, 36, 0, 0, 37, 0, 0, 0, 25, 33, 35, 24, 25, 32, 35, 16, 25, 31, 35, 8, 0, 30, 35, 0, 38, 36, 0, 1, 0, 24, 36, 0, 0, 12, 24, 0, 1, 37, 128, 8, 134, 36, 0, 0, 240, 180, 0, 0, 37, 30, 0, 0, 0, 25, 12, 0, 38, 36, 25, 1, 0, 26, 36, 0, 121, 26, 5, 0, 1, 37, 159, 8, 134, 36, 0, 0, 240, 180, 0, 0, 37, 31, 0, 0, 134, 36, 0, 0, 212, 188, 0, 0, 1, 36, 44, 0, 1, 37, 100, 0, 1, 38, 1, 0, 1, 39, 16, 39, 1, 40, 3, 0, 134, 27, 0, 0, 212, 56, 0, 0, 36, 37, 38, 39, 40, 0, 0, 0, 0, 23, 27, 0, 0, 28, 23, 0, 41, 40, 28, 24, 42, 40, 40, 24, 33, 29, 40, 0, 121, 29, 5, 0, 1, 1, 0, 0, 0, 22, 1, 0, 137, 35, 0, 0, 139, 22, 0, 0, 1, 40, 135, 3, 1, 39, 240, 3, 1, 38, 100, 0, 1, 37, 1, 0, 1, 36, 16, 39, 1, 41, 3, 0, 134, 2, 0, 0, 148, 72, 0, 0, 40, 39, 38, 37, 36, 41, 0, 0, 0, 23, 2, 0, 0, 3, 23, 0, 41, 41, 3, 24, 42, 41, 41, 24, 33, 4, 41, 0, 121, 4, 5, 0, 1, 1, 0, 0, 0, 22, 1, 0, 137, 35, 0, 0, 139, 22, 0, 0, 1, 41, 234, 1, 1, 36, 175, 5, 1, 37, 100, 0, 1, 38, 1, 0, 1, 39, 16, 39, 1, 40, 3, 0, 134, 5, 0, 0, 148, 72, 0, 0, 41, 36, 37, 38, 39, 40, 0, 0, 0, 23, 5, 0, 0, 6, 23, 0, 41, 40, 6, 24, 42, 40, 40, 24, 33, 7, 40, 0, 121, 7, 5, 0, 1, 1, 0, 0, 0, 22, 1, 0, 137, 35, 0, 0, 139, 22, 0, 0, 0, 8, 12, 0, 38, 40, 8, 1, 0, 9, 40, 0, 121, 9, 32, 0, 1, 40, 186, 1, 1, 39, 227, 5, 1, 38, 100, 0, 1, 37, 1, 0, 1, 36, 184, 11, 1, 41, 3, 0, 134, 10, 0, 0, 148, 72, 0, 0, 40, 39, 38, 37, 36, 41, 0, 0, 0, 23, 10, 0, 134, 41, 0, 0, 172, 185, 0, 0, 1, 41, 181, 24, 1, 36, 1, 0, 83, 41, 36, 0, 1, 41, 195, 8, 134, 36, 0, 0, 240, 180, 0, 0, 41, 32, 0, 0, 1, 36, 234, 1, 1, 41, 175, 5, 1, 37, 90, 0, 1, 38, 0, 0, 1, 39, 184, 11, 1, 40, 3, 0, 134, 11, 0, 0, 148, 72, 0, 0, 36, 41, 37, 38, 39, 40, 0, 0, 0, 23, 11, 0, 1, 40, 64, 1, 1, 39, 176, 4, 1, 38, 100, 0, 1, 37, 1, 0, 1, 41, 16, 39, 1, 36, 3, 0, 134, 13, 0, 0, 148, 72, 0, 0, 40, 39, 38, 37, 41, 36, 0, 0, 0, 23, 13, 0, 0, 14, 23, 0, 41, 36, 14, 24, 42, 36, 36, 24, 33, 15, 36, 0, 121, 15, 5, 0, 1, 1, 0, 0, 0, 22, 1, 0, 137, 35, 0, 0, 139, 22, 0, 0, 1, 36, 152, 3, 1, 41, 88, 3, 1, 37, 50, 0, 1, 38, 1, 0, 1, 39, 16, 39, 1, 40, 3, 0, 134, 16, 0, 0, 148, 72, 0, 0, 36, 41, 37, 38, 39, 40, 0, 0, 0, 23, 16, 0, 0, 17, 23, 0, 41, 40, 17, 24, 42, 40, 40, 24, 33, 18, 40, 0, 121, 18, 5, 0, 1, 1, 0, 0, 0, 22, 1, 0, 137, 35, 0, 0, 139, 22, 0, 0, 1, 40, 152, 3, 1, 39, 64, 1, 1, 38, 50, 0, 1, 37, 1, 0, 1, 41, 16, 39, 1, 36, 3, 0, 134, 19, 0, 0, 148, 72, 0, 0, 40, 39, 38, 37, 41, 36, 0, 0, 0, 23, 19, 0, 0, 20, 23, 0, 41, 36, 20, 24, 42, 36, 36, 24, 33, 21, 36, 0, 121, 21, 6, 0, 1, 1, 0, 0, 0, 22, 1, 0, 137, 35, 0, 0, 139, 22, 0, 0, 119, 0, 14, 0, 1, 41, 112, 254, 1, 37, 208, 7, 134, 36, 0, 0, 228, 159, 0, 0, 41, 37, 0, 0, 1, 37, 212, 8, 134, 36, 0, 0, 240, 180, 0, 0, 37, 33, 0, 0, 1, 1, 0, 0, 0, 22, 1, 0, 137, 35, 0, 0, 139, 22, 0, 0, 1, 36, 0, 0, 139, 36, 0, 0, 140, 3, 47, 0, 0, 0, 0, 0, 1, 43, 0, 0, 136, 45, 0, 0, 0, 44, 45, 0, 25, 31, 2, 16, 82, 37, 31, 0, 1, 45, 0, 0, 13, 38, 37, 45, 121, 38, 12, 0, 134, 40, 0, 0, 136, 162, 0, 0, 2, 0, 0, 0, 32, 41, 40, 0, 121, 41, 5, 0, 82, 9, 31, 0, 0, 13, 9, 0, 1, 43, 5, 0, 119, 0, 6, 0, 1, 5, 0, 0, 119, 0, 4, 0, 0, 39, 37, 0, 0, 13, 39, 0, 1, 43, 5, 0, 32, 45, 43, 5, 121, 45, 66, 0, 25, 42, 2, 20, 82, 11, 42, 0, 4, 12, 13, 11, 16, 14, 12, 1, 0, 15, 11, 0, 121, 14, 8, 0, 25, 16, 2, 36, 82, 17, 16, 0, 38, 45, 17, 7, 135, 18, 5, 0, 45, 2, 0, 1, 0, 5, 18, 0, 119, 0, 53, 0, 25, 19, 2, 75, 78, 20, 19, 0, 1, 45, 255, 255, 41, 46, 20, 24, 42, 46, 46, 24, 15, 21, 45, 46, 121, 21, 35, 0, 0, 3, 1, 0, 32, 22, 3, 0, 121, 22, 6, 0, 1, 6, 0, 0, 0, 7, 0, 0, 0, 8, 1, 0, 0, 33, 15, 0, 119, 0, 31, 0, 26, 23, 3, 1, 3, 24, 0, 23, 78, 25, 24, 0, 41, 46, 25, 24, 42, 46, 46, 24, 32, 26, 46, 10, 120, 26, 3, 0, 0, 3, 23, 0, 119, 0, 241, 255, 25, 27, 2, 36, 82, 28, 27, 0, 38, 46, 28, 7, 135, 29, 5, 0, 46, 2, 0, 3, 16, 30, 29, 3, 121, 30, 3, 0, 0, 5, 29, 0, 119, 0, 20, 0, 3, 32, 0, 3, 4, 4, 1, 3, 82, 10, 42, 0, 0, 6, 3, 0, 0, 7, 32, 0, 0, 8, 4, 0, 0, 33, 10, 0, 119, 0, 5, 0, 1, 6, 0, 0, 0, 7, 0, 0, 0, 8, 1, 0, 0, 33, 15, 0, 135, 46, 6, 0, 33, 7, 8, 0, 82, 34, 42, 0, 3, 35, 34, 8, 85, 42, 35, 0, 3, 36, 6, 8, 0, 5, 36, 0, 139, 5, 0, 0, 140, 0, 25, 0, 0, 0, 0, 0, 1, 16, 0, 0, 136, 18, 0, 0, 0, 17, 18, 0, 136, 18, 0, 0, 25, 18, 18, 48, 137, 18, 0, 0, 130, 18, 0, 0, 136, 19, 0, 0, 49, 18, 18, 19, 240, 97, 0, 0, 1, 19, 48, 0, 135, 18, 0, 0, 19, 0, 0, 0, 25, 15, 17, 32, 25, 14, 17, 24, 25, 13, 17, 16, 25, 12, 17, 8, 0, 11, 17, 0, 134, 18, 0, 0, 40, 192, 0, 0, 1, 19, 86, 6, 134, 18, 0, 0, 156, 182, 0, 0, 19, 0, 0, 0, 1, 18, 41, 21, 78, 1, 18, 0, 41, 18, 1, 24, 42, 18, 18, 24, 33, 3, 18, 0, 121, 3, 6, 0, 1, 19, 97, 6, 134, 18, 0, 0, 156, 182, 0, 0, 19, 0, 0, 0, 119, 0, 5, 0, 1, 19, 114, 6, 134, 18, 0, 0, 156, 182, 0, 0, 19, 0, 0, 0, 1, 18, 45, 21, 78, 4, 18, 0, 38, 18, 4, 1, 0, 5, 18, 0, 121, 5, 6, 0, 1, 19, 163, 6, 134, 18, 0, 0, 156, 182, 0, 0, 19, 0, 0, 0, 119, 0, 9, 0, 1, 19, 133, 6, 134, 18, 0, 0, 156, 182, 0, 0, 19, 0, 0, 0, 1, 19, 147, 6, 134, 18, 0, 0, 156, 182, 0, 0, 19, 0, 0, 0, 1, 19, 31, 8, 134, 18, 0, 0, 156, 182, 0, 0, 19, 0, 0, 0, 1, 19, 47, 8, 134, 18, 0, 0, 156, 182, 0, 0, 19, 0, 0, 0, 1, 19, 59, 8, 134, 18, 0, 0, 156, 182, 0, 0, 19, 0, 0, 0, 1, 19, 107, 8, 134, 18, 0, 0, 156, 182, 0, 0, 19, 0, 0, 0, 134, 18, 0, 0, 92, 192, 0, 0, 1, 19, 182, 6, 134, 18, 0, 0, 156, 182, 0, 0, 19, 0, 0, 0, 1, 19, 150, 0, 1, 20, 238, 2, 59, 21, 0, 0, 134, 18, 0, 0, 164, 170, 0, 0, 19, 20, 21, 0, 134, 18, 0, 0, 172, 191, 0, 0, 134, 18, 0, 0, 248, 191, 0, 0, 1, 21, 137, 11, 134, 18, 0, 0, 156, 182, 0, 0, 21, 0, 0, 0, 134, 6, 0, 0, 192, 189, 0, 0, 1, 18, 60, 21, 85, 18, 6, 0, 1, 21, 232, 3, 134, 18, 0, 0, 40, 186, 0, 0, 21, 0, 0, 0, 1, 21, 188, 6, 134, 18, 0, 0, 240, 180, 0, 0, 21, 11, 0, 0, 1, 18, 94, 1, 1, 21, 238, 2, 1, 20, 100, 0, 1, 19, 1, 0, 1, 22, 136, 19, 1, 23, 5, 0, 134, 7, 0, 0, 148, 72, 0, 0, 18, 21, 20, 19, 22, 23, 0, 0, 0, 0, 7, 0, 1, 22, 215, 6, 134, 23, 0, 0, 240, 180, 0, 0, 22, 12, 0, 0, 1, 23, 194, 1, 1, 22, 44, 1, 1, 19, 100, 0, 1, 20, 1, 0, 1, 21, 136, 19, 1, 18, 5, 0, 134, 8, 0, 0, 148, 72, 0, 0, 23, 22, 19, 20, 21, 18, 0, 0, 0, 0, 8, 0, 1, 21, 194, 1, 1, 20, 208, 7, 1, 19, 232, 3, 134, 18, 0, 0, 220, 160, 0, 0, 21, 20, 19, 0, 1, 19, 239, 6, 134, 18, 0, 0, 240, 180, 0, 0, 19, 13, 0, 0, 1, 18, 194, 1, 1, 19, 0, 0, 1, 20, 120, 0, 1, 21, 0, 0, 1, 22, 232, 3, 1, 23, 3, 0, 134, 9, 0, 0, 148, 72, 0, 0, 18, 19, 20, 21, 22, 23, 0, 0, 0, 0, 9, 0, 1, 23, 194, 1, 1, 22, 144, 1, 1, 21, 50, 0, 1, 20, 1, 0, 1, 19, 184, 11, 1, 18, 3, 0, 134, 10, 0, 0, 148, 72, 0, 0, 23, 22, 21, 20, 19, 18, 0, 0, 0, 0, 10, 0, 1, 19, 4, 7, 134, 18, 0, 0, 240, 180, 0, 0, 19, 14, 0, 0, 1, 18, 88, 2, 1, 19, 0, 0, 1, 20, 120, 0, 1, 21, 0, 0, 1, 22, 232, 3, 1, 23, 3, 0, 134, 2, 0, 0, 148, 72, 0, 0, 18, 19, 20, 21, 22, 23, 0, 0, 0, 0, 2, 0, 1, 22, 15, 7, 134, 23, 0, 0, 240, 180, 0, 0, 22, 15, 0, 0, 1, 22, 194, 1, 1, 21, 224, 1, 1, 20, 100, 0, 1, 19, 1, 0, 1, 18, 136, 19, 1, 24, 8, 0, 134, 23, 0, 0, 148, 72, 0, 0, 22, 21, 20, 19, 18, 24, 0, 0, 1, 24, 32, 3, 1, 18, 224, 1, 1, 19, 100, 0, 1, 20, 1, 0, 1, 21, 136, 19, 1, 22, 8, 0, 134, 23, 0, 0, 148, 72, 0, 0, 24, 18, 19, 20, 21, 22, 0, 0, 134, 23, 0, 0, 152, 176, 0, 0, 134, 23, 0, 0, 248, 177, 0, 0, 134, 23, 0, 0, 164, 172, 0, 0, 134, 23, 0, 0, 248, 177, 0, 0, 134, 23, 0, 0, 164, 172, 0, 0, 134, 23, 0, 0, 164, 172, 0, 0, 137, 17, 0, 0, 139, 0, 0, 0, 140, 1, 41, 0, 0, 0, 0, 0, 1, 38, 0, 0, 136, 40, 0, 0, 0, 39, 40, 0, 1, 40, 0, 0, 13, 8, 0, 40, 121, 8, 68, 0, 1, 40, 120, 1, 82, 35, 40, 0, 1, 40, 0, 0, 13, 36, 35, 40, 121, 36, 3, 0, 1, 29, 0, 0, 119, 0, 7, 0, 1, 40, 120, 1, 82, 9, 40, 0, 134, 10, 0, 0, 28, 101, 0, 0, 9, 0, 0, 0, 0, 29, 10, 0, 134, 11, 0, 0, 44, 191, 0, 0, 82, 3, 11, 0, 1, 40, 0, 0, 13, 12, 3, 40, 121, 12, 3, 0, 0, 5, 29, 0, 119, 0, 43, 0, 0, 4, 3, 0, 0, 6, 29, 0, 25, 13, 4, 76, 82, 14, 13, 0, 1, 40, 255, 255, 15, 15, 40, 14, 121, 15, 6, 0, 134, 16, 0, 0, 220, 191, 0, 0, 4, 0, 0, 0, 0, 26, 16, 0, 119, 0, 2, 0, 1, 26, 0, 0, 25, 17, 4, 20, 82, 18, 17, 0, 25, 20, 4, 28, 82, 21, 20, 0, 16, 22, 21, 18, 121, 22, 8, 0, 134, 23, 0, 0, 240, 153, 0, 0, 4, 0, 0, 0, 20, 40, 23, 6, 0, 24, 40, 0, 0, 7, 24, 0, 119, 0, 2, 0, 0, 7, 6, 0, 32, 25, 26, 0, 120, 25, 4, 0, 134, 40, 0, 0, 196, 191, 0, 0, 4, 0, 0, 0, 25, 27, 4, 56, 82, 2, 27, 0, 1, 40, 0, 0, 13, 28, 2, 40, 121, 28, 3, 0, 0, 5, 7, 0, 119, 0, 4, 0, 0, 4, 2, 0, 0, 6, 7, 0, 119, 0, 217, 255, 134, 40, 0, 0, 112, 191, 0, 0, 0, 1, 5, 0, 119, 0, 25, 0, 25, 19, 0, 76, 82, 30, 19, 0, 1, 40, 255, 255, 15, 31, 40, 30, 120, 31, 6, 0, 134, 32, 0, 0, 240, 153, 0, 0, 0, 0, 0, 0, 0, 1, 32, 0, 119, 0, 15, 0, 134, 33, 0, 0, 220, 191, 0, 0, 0, 0, 0, 0, 32, 37, 33, 0, 134, 34, 0, 0, 240, 153, 0, 0, 0, 0, 0, 0, 121, 37, 3, 0, 0, 1, 34, 0, 119, 0, 5, 0, 134, 40, 0, 0, 196, 191, 0, 0, 0, 0, 0, 0, 0, 1, 34, 0, 139, 1, 0, 0, 140, 1, 33, 0, 0, 0, 0, 0, 1, 24, 0, 0, 136, 26, 0, 0, 0, 25, 26, 0, 136, 26, 0, 0, 25, 26, 26, 48, 137, 26, 0, 0, 130, 26, 0, 0, 136, 27, 0, 0, 49, 26, 26, 27, 232, 102, 0, 0, 1, 27, 48, 0, 135, 26, 0, 0, 27, 0, 0, 0, 25, 23, 25, 32, 25, 22, 25, 24, 25, 21, 25, 16, 25, 20, 25, 8, 0, 19, 25, 0, 38, 26, 0, 1, 0, 13, 26, 0, 0, 11, 13, 0, 1, 27, 69, 10, 134, 26, 0, 0, 240, 180, 0, 0, 27, 19, 0, 0, 1, 27, 100, 10, 134, 26, 0, 0, 240, 180, 0, 0, 27, 20, 0, 0, 1, 26, 47, 0, 1, 27, 90, 0, 1, 28, 1, 0, 1, 29, 40, 35, 1, 30, 3, 0, 134, 14, 0, 0, 212, 56, 0, 0, 26, 27, 28, 29, 30, 0, 0, 0, 0, 12, 14, 0, 0, 15, 12, 0, 41, 30, 15, 24, 42, 30, 30, 24, 33, 16, 30, 0, 121, 16, 6, 0, 0, 17, 12, 0, 0, 1, 17, 0, 0, 10, 1, 0, 137, 25, 0, 0, 139, 10, 0, 0, 1, 29, 121, 10, 134, 30, 0, 0, 240, 180, 0, 0, 29, 21, 0, 0, 0, 18, 11, 0, 38, 30, 18, 1, 0, 2, 30, 0, 121, 2, 65, 0, 1, 29, 5, 0, 1, 28, 0, 0, 134, 30, 0, 0, 40, 175, 0, 0, 29, 28, 0, 0, 1, 30, 240, 0, 1, 28, 38, 2, 1, 29, 80, 0, 1, 27, 1, 0, 1, 26, 208, 7, 1, 31, 2, 0, 134, 3, 0, 0, 148, 72, 0, 0, 30, 28, 29, 27, 26, 31, 0, 0, 0, 12, 3, 0, 0, 4, 12, 0, 41, 31, 4, 24, 42, 31, 31, 24, 33, 5, 31, 0, 121, 5, 6, 0, 1, 26, 136, 10, 134, 31, 0, 0, 240, 180, 0, 0, 26, 22, 0, 0, 119, 0, 22, 0, 1, 26, 158, 10, 134, 31, 0, 0, 240, 180, 0, 0, 26, 23, 0, 0, 1, 26, 240, 0, 1, 27, 0, 0, 1, 29, 50, 0, 1, 28, 1, 0, 1, 30, 208, 7, 1, 32, 3, 0, 134, 31, 0, 0, 148, 72, 0, 0, 26, 27, 29, 28, 30, 32, 0, 0, 1, 32, 240, 0, 1, 30, 224, 1, 61, 28, 0, 0, 219, 15, 201, 191, 134, 31, 0, 0, 164, 170, 0, 0, 32, 30, 28, 0, 1, 28, 4, 0, 1, 30, 0, 0, 134, 31, 0, 0, 40, 175, 0, 0, 28, 30, 0, 0, 1, 31, 240, 0, 1, 30, 158, 2, 1, 28, 80, 0, 1, 32, 0, 0, 1, 29, 136, 19, 1, 27, 3, 0, 134, 6, 0, 0, 148, 72, 0, 0, 31, 30, 28, 32, 29, 27, 0, 0, 0, 12, 6, 0, 119, 0, 39, 0, 1, 27, 210, 0, 1, 29, 8, 2, 1, 32, 80, 0, 1, 28, 1, 0, 1, 30, 184, 11, 1, 31, 2, 0, 134, 7, 0, 0, 148, 72, 0, 0, 27, 29, 32, 28, 30, 31, 0, 0, 0, 12, 7, 0, 1, 31, 210, 0, 1, 30, 239, 1, 1, 28, 80, 0, 1, 32, 1, 0, 1, 29, 196, 9, 1, 27, 2, 0, 134, 8, 0, 0, 148, 72, 0, 0, 31, 30, 28, 32, 29, 27, 0, 0, 0, 12, 8, 0, 1, 29, 3, 0, 1, 32, 0, 0, 134, 27, 0, 0, 40, 175, 0, 0, 29, 32, 0, 0, 1, 27, 4, 1, 1, 32, 158, 2, 1, 29, 80, 0, 1, 28, 0, 0, 1, 30, 136, 19, 1, 31, 3, 0, 134, 9, 0, 0, 148, 72, 0, 0, 27, 32, 29, 28, 30, 31, 0, 0, 0, 12, 9, 0, 134, 31, 0, 0, 212, 188, 0, 0, 1, 1, 0, 0, 0, 10, 1, 0, 137, 25, 0, 0, 139, 10, 0, 0, 140, 4, 37, 0, 0, 0, 0, 0, 1, 31, 0, 0, 136, 35, 0, 0, 0, 32, 35, 0, 136, 35, 0, 0, 1, 36, 128, 0, 3, 35, 35, 36, 137, 35, 0, 0, 130, 35, 0, 0, 136, 36, 0, 0, 49, 35, 35, 36, 136, 105, 0, 0, 1, 36, 128, 0, 135, 35, 0, 0, 36, 0, 0, 0, 25, 24, 32, 124, 0, 25, 32, 0, 0, 30, 25, 0, 1, 33, 124, 1, 25, 34, 30, 124, 82, 35, 33, 0, 85, 30, 35, 0, 25, 30, 30, 4, 25, 33, 33, 4, 54, 35, 30, 34, 156, 105, 0, 0, 26, 26, 1, 1, 2, 35, 0, 0, 254, 255, 255, 127, 16, 27, 35, 26, 121, 27, 13, 0, 32, 28, 1, 0, 121, 28, 5, 0, 0, 6, 24, 0, 1, 7, 1, 0, 1, 31, 4, 0, 119, 0, 10, 0, 134, 29, 0, 0, 100, 189, 0, 0, 1, 35, 75, 0, 85, 29, 35, 0, 1, 5, 255, 255, 119, 0, 4, 0, 0, 6, 0, 0, 0, 7, 1, 0, 1, 31, 4, 0, 32, 35, 31, 4, 121, 35, 35, 0, 0, 8, 6, 0, 1, 35, 254, 255, 4, 9, 35, 8, 16, 10, 9, 7, 125, 4, 10, 9, 7, 0, 0, 0, 25, 11, 25, 48, 85, 11, 4, 0, 25, 12, 25, 20, 85, 12, 6, 0, 25, 13, 25, 44, 85, 13, 6, 0, 3, 14, 6, 4, 25, 15, 25, 16, 85, 15, 14, 0, 25, 16, 25, 28, 85, 16, 14, 0, 134, 17, 0, 0, 244, 90, 0, 0, 25, 2, 3, 0, 32, 18, 4, 0, 121, 18, 3, 0, 0, 5, 17, 0, 119, 0, 11, 0, 82, 19, 12, 0, 82, 20, 15, 0, 13, 21, 19, 20, 41, 35, 21, 31, 42, 35, 35, 31, 0, 22, 35, 0, 3, 23, 19, 22, 1, 35, 0, 0, 83, 23, 35, 0, 0, 5, 17, 0, 137, 32, 0, 0, 139, 5, 0, 0, 140, 3, 40, 0, 0, 0, 0, 0, 2, 37, 0, 0, 255, 0, 0, 0, 1, 35, 0, 0, 136, 38, 0, 0, 0, 36, 38, 0, 1, 38, 0, 0, 16, 28, 38, 1, 1, 38, 255, 255, 16, 29, 38, 0, 32, 30, 1, 0, 19, 38, 30, 29, 0, 31, 38, 0, 20, 38, 28, 31, 0, 32, 38, 0, 121, 32, 41, 0, 0, 6, 2, 0, 0, 33, 0, 0, 0, 34, 1, 0, 1, 38, 10, 0, 1, 39, 0, 0, 134, 9, 0, 0, 88, 182, 0, 0, 33, 34, 38, 39, 128, 39, 0, 0, 0, 10, 39, 0, 19, 39, 9, 37, 0, 11, 39, 0, 39, 39, 11, 48, 0, 12, 39, 0, 26, 13, 6, 1, 83, 13, 12, 0, 1, 39, 10, 0, 1, 38, 0, 0, 134, 14, 0, 0, 148, 188, 0, 0, 33, 34, 39, 38, 128, 38, 0, 0, 0, 15, 38, 0, 1, 38, 9, 0, 16, 16, 38, 34, 1, 38, 255, 255, 16, 17, 38, 33, 32, 18, 34, 9, 19, 38, 18, 17, 0, 19, 38, 0, 20, 38, 16, 19, 0, 20, 38, 0, 121, 20, 5, 0, 0, 6, 13, 0, 0, 33, 14, 0, 0, 34, 15, 0, 119, 0, 223, 255, 0, 3, 14, 0, 0, 5, 13, 0, 119, 0, 3, 0, 0, 3, 0, 0, 0, 5, 2, 0, 32, 21, 3, 0, 121, 21, 3, 0, 0, 7, 5, 0, 119, 0, 22, 0, 0, 4, 3, 0, 0, 8, 5, 0, 31, 38, 4, 10, 38, 38, 38, 255, 0, 22, 38, 0, 39, 38, 22, 48, 0, 23, 38, 0, 19, 38, 23, 37, 0, 24, 38, 0, 26, 25, 8, 1, 83, 25, 24, 0, 29, 38, 4, 10, 38, 38, 38, 255, 0, 26, 38, 0, 35, 27, 4, 10, 121, 27, 3, 0, 0, 7, 25, 0, 119, 0, 4, 0, 0, 4, 26, 0, 0, 8, 25, 0, 119, 0, 238, 255, 139, 7, 0, 0, 140, 2, 26, 0, 0, 0, 0, 0, 2, 23, 0, 0, 135, 0, 0, 0, 1, 21, 0, 0, 136, 24, 0, 0, 0, 22, 24, 0, 136, 24, 0, 0, 25, 24, 24, 32, 137, 24, 0, 0, 130, 24, 0, 0, 136, 25, 0, 0, 49, 24, 24, 25, 52, 108, 0, 0, 1, 25, 32, 0, 135, 24, 0, 0, 25, 0, 0, 0, 25, 2, 22, 19, 25, 20, 22, 8, 0, 19, 22, 0, 25, 14, 22, 16, 0, 11, 0, 0, 38, 24, 1, 1, 0, 15, 24, 0, 0, 12, 15, 0, 0, 16, 11, 0, 1, 24, 255, 0, 19, 24, 16, 24, 0, 17, 24, 0, 1, 24, 1, 0, 1, 25, 9, 0, 138, 17, 24, 25, 172, 108, 0, 0, 180, 108, 0, 0, 188, 108, 0, 0, 196, 108, 0, 0, 204, 108, 0, 0, 212, 108, 0, 0, 220, 108, 0, 0, 228, 108, 0, 0, 236, 108, 0, 0, 1, 25, 147, 7, 134, 24, 0, 0, 240, 180, 0, 0, 25, 19, 0, 0, 1, 13, 135, 0, 119, 0, 19, 0, 1, 13, 135, 0, 119, 0, 17, 0, 1, 13, 175, 0, 119, 0, 15, 0, 1, 13, 165, 0, 119, 0, 13, 0, 1, 13, 113, 0, 119, 0, 11, 0, 1, 13, 100, 0, 119, 0, 9, 0, 1, 13, 115, 0, 119, 0, 7, 0, 1, 13, 150, 0, 119, 0, 5, 0, 1, 13, 135, 0, 119, 0, 3, 0, 1, 13, 130, 0, 119, 0, 1, 0, 0, 18, 12, 0, 38, 24, 18, 1, 0, 3, 24, 0, 121, 3, 16, 0, 1, 24, 52, 21, 82, 4, 24, 0, 1, 24, 255, 0, 19, 24, 4, 24, 0, 5, 24, 0, 0, 6, 13, 0, 1, 24, 255, 0, 19, 24, 6, 24, 0, 7, 24, 0, 78, 24, 14, 0, 83, 2, 24, 0, 134, 24, 0, 0, 152, 113, 0, 0, 2, 5, 7, 0, 119, 0, 6, 0, 0, 8, 13, 0, 1, 25, 180, 24, 134, 24, 0, 0, 200, 186, 0, 0, 25, 8, 0, 0, 0, 9, 13, 0, 1, 24, 52, 21, 85, 24, 9, 0, 0, 10, 13, 0, 85, 20, 10, 0, 1, 25, 212, 7, 134, 24, 0, 0, 240, 180, 0, 0, 25, 20, 0, 0, 137, 22, 0, 0, 139, 0, 0, 0, 140, 2, 25, 0, 0, 0, 0, 0, 1, 21, 0, 0, 136, 23, 0, 0, 0, 22, 23, 0, 136, 23, 0, 0, 25, 23, 23, 32, 137, 23, 0, 0, 130, 23, 0, 0, 136, 24, 0, 0, 49, 23, 23, 24, 188, 109, 0, 0, 1, 24, 32, 0, 135, 23, 0, 0, 24, 0, 0, 0, 25, 2, 22, 19, 25, 20, 22, 8, 0, 19, 22, 0, 25, 14, 22, 16, 0, 11, 0, 0, 38, 23, 1, 1, 0, 15, 23, 0, 0, 12, 15, 0, 0, 16, 11, 0, 1, 23, 255, 0, 19, 23, 16, 23, 0, 17, 23, 0, 1, 23, 1, 0, 1, 24, 9, 0, 138, 17, 23, 24, 52, 110, 0, 0, 60, 110, 0, 0, 68, 110, 0, 0, 76, 110, 0, 0, 84, 110, 0, 0, 92, 110, 0, 0, 100, 110, 0, 0, 108, 110, 0, 0, 116, 110, 0, 0, 1, 24, 47, 7, 134, 23, 0, 0, 240, 180, 0, 0, 24, 19, 0, 0, 1, 13, 80, 0, 119, 0, 19, 0, 1, 13, 77, 0, 119, 0, 17, 0, 1, 13, 42, 0, 119, 0, 15, 0, 1, 13, 45, 0, 119, 0, 13, 0, 1, 13, 95, 0, 119, 0, 11, 0, 1, 13, 115, 0, 119, 0, 9, 0, 1, 13, 95, 0, 119, 0, 7, 0, 1, 13, 80, 0, 119, 0, 5, 0, 1, 13, 70, 0, 119, 0, 3, 0, 1, 13, 68, 0, 119, 0, 1, 0, 0, 18, 12, 0, 38, 23, 18, 1, 0, 3, 23, 0, 121, 3, 16, 0, 1, 23, 48, 21, 82, 4, 23, 0, 1, 23, 255, 0, 19, 23, 4, 23, 0, 5, 23, 0, 0, 6, 13, 0, 1, 23, 255, 0, 19, 23, 6, 23, 0, 7, 23, 0, 78, 23, 14, 0, 83, 2, 23, 0, 134, 23, 0, 0, 152, 113, 0, 0, 2, 5, 7, 0, 119, 0, 6, 0, 0, 8, 13, 0, 1, 24, 179, 24, 134, 23, 0, 0, 200, 186, 0, 0, 24, 8, 0, 0, 0, 9, 13, 0, 1, 23, 48, 21, 85, 23, 9, 0, 0, 10, 13, 0, 85, 20, 10, 0, 1, 24, 113, 7, 134, 23, 0, 0, 240, 180, 0, 0, 24, 20, 0, 0, 137, 22, 0, 0, 139, 0, 0, 0, 140, 2, 25, 0, 0, 0, 0, 0, 1, 22, 0, 0, 136, 24, 0, 0, 0, 23, 24, 0, 1, 4, 0, 0, 1, 24, 195, 13, 3, 15, 24, 4, 78, 16, 15, 0, 1, 24, 255, 0, 19, 24, 16, 24, 0, 17, 24, 0, 13, 18, 17, 0, 121, 18, 3, 0, 1, 22, 2, 0, 119, 0, 10, 0, 25, 19, 4, 1, 32, 20, 19, 87, 121, 20, 5, 0, 1, 3, 27, 14, 1, 6, 87, 0, 1, 22, 5, 0, 119, 0, 3, 0, 0, 4, 19, 0, 119, 0, 238, 255, 32, 24, 22, 2, 121, 24, 8, 0, 32, 14, 4, 0, 121, 14, 3, 0, 1, 2, 27, 14, 119, 0, 4, 0, 1, 3, 27, 14, 0, 6, 4, 0, 1, 22, 5, 0, 32, 24, 22, 5, 121, 24, 20, 0, 1, 22, 0, 0, 0, 5, 3, 0, 78, 21, 5, 0, 41, 24, 21, 24, 42, 24, 24, 24, 32, 7, 24, 0, 25, 8, 5, 1, 120, 7, 3, 0, 0, 5, 8, 0, 119, 0, 249, 255, 26, 9, 6, 1, 32, 10, 9, 0, 121, 10, 3, 0, 0, 2, 8, 0, 119, 0, 5, 0, 0, 3, 8, 0, 0, 6, 9, 0, 1, 22, 5, 0, 119, 0, 238, 255, 25, 11, 1, 20, 82, 12, 11, 0, 134, 13, 0, 0, 64, 189, 0, 0, 2, 12, 0, 0, 139, 13, 0, 0, 140, 0, 23, 0, 0, 0, 0, 0, 1, 15, 0, 0, 136, 17, 0, 0, 0, 16, 17, 0, 136, 17, 0, 0, 25, 17, 17, 32, 137, 17, 0, 0, 130, 17, 0, 0, 136, 18, 0, 0, 49, 17, 17, 18, 56, 112, 0, 0, 1, 18, 32, 0, 135, 17, 0, 0, 18, 0, 0, 0, 25, 14, 16, 16, 25, 13, 16, 8, 0, 12, 16, 0, 1, 18, 15, 9, 134, 17, 0, 0, 240, 180, 0, 0, 18, 12, 0, 0, 1, 18, 46, 9, 134, 17, 0, 0, 240, 180, 0, 0, 18, 13, 0, 0, 134, 17, 0, 0, 212, 188, 0, 0, 1, 17, 55, 0, 1, 18, 100, 0, 1, 19, 1, 0, 1, 20, 64, 31, 1, 21, 3, 0, 134, 4, 0, 0, 212, 56, 0, 0, 17, 18, 19, 20, 21, 0, 0, 0, 0, 1, 4, 0, 0, 5, 1, 0, 41, 21, 5, 24, 42, 21, 21, 24, 33, 6, 21, 0, 121, 6, 5, 0, 1, 0, 0, 0, 0, 3, 0, 0, 137, 16, 0, 0, 139, 3, 0, 0, 1, 21, 46, 4, 1, 20, 86, 3, 1, 19, 100, 0, 1, 18, 1, 0, 1, 17, 64, 31, 1, 22, 3, 0, 134, 7, 0, 0, 148, 72, 0, 0, 21, 20, 19, 18, 17, 22, 0, 0, 0, 1, 7, 0, 0, 8, 1, 0, 41, 22, 8, 24, 42, 22, 22, 24, 33, 9, 22, 0, 121, 9, 5, 0, 1, 0, 0, 0, 0, 3, 0, 0, 137, 16, 0, 0, 139, 3, 0, 0, 1, 22, 152, 3, 1, 17, 64, 1, 1, 18, 50, 0, 1, 19, 1, 0, 1, 20, 64, 31, 1, 21, 3, 0, 134, 10, 0, 0, 148, 72, 0, 0, 22, 17, 18, 19, 20, 21, 0, 0, 0, 1, 10, 0, 0, 11, 1, 0, 41, 21, 11, 24, 42, 21, 21, 24, 33, 2, 21, 0, 121, 2, 6, 0, 1, 0, 0, 0, 0, 3, 0, 0, 137, 16, 0, 0, 139, 3, 0, 0, 119, 0, 14, 0, 1, 20, 88, 9, 134, 21, 0, 0, 240, 180, 0, 0, 20, 14, 0, 0, 1, 20, 112, 254, 1, 19, 208, 7, 134, 21, 0, 0, 228, 159, 0, 0, 20, 19, 0, 0, 1, 0, 0, 0, 0, 3, 0, 0, 137, 16, 0, 0, 139, 3, 0, 0, 1, 21, 0, 0, 139, 21, 0, 0, 140, 3, 33, 0, 0, 0, 0, 0, 2, 30, 0, 0, 255, 0, 0, 0, 1, 28, 0, 0, 136, 31, 0, 0, 0, 29, 31, 0, 136, 31, 0, 0, 25, 31, 31, 16, 137, 31, 0, 0, 130, 31, 0, 0, 136, 32, 0, 0, 49, 31, 31, 32, 220, 113, 0, 0, 1, 32, 16, 0, 135, 31, 0, 0, 32, 0, 0, 0, 0, 21, 1, 0, 0, 22, 2, 0, 0, 23, 21, 0, 19, 31, 23, 30, 0, 24, 31, 0, 0, 25, 22, 0, 19, 31, 25, 30, 0, 26, 31, 0, 15, 27, 26, 24, 121, 27, 30, 0, 0, 3, 21, 0, 19, 31, 3, 30, 0, 4, 31, 0, 0, 5, 22, 0, 19, 31, 5, 30, 0, 6, 31, 0, 17, 7, 6, 4, 120, 7, 2, 0, 119, 0, 18, 0, 0, 8, 21, 0, 19, 31, 8, 30, 0, 9, 31, 0, 134, 31, 0, 0, 200, 186, 0, 0, 0, 9, 0, 0, 1, 32, 20, 0, 134, 31, 0, 0, 220, 173, 0, 0, 32, 0, 0, 0, 0, 10, 21, 0, 26, 31, 10, 1, 41, 31, 31, 24, 42, 31, 31, 24, 0, 11, 31, 0, 0, 21, 11, 0, 119, 0, 231, 255, 137, 29, 0, 0, 139, 0, 0, 0, 119, 0, 29, 0, 0, 12, 21, 0, 19, 31, 12, 30, 0, 13, 31, 0, 0, 14, 22, 0, 19, 31, 14, 30, 0, 15, 31, 0, 17, 16, 13, 15, 120, 16, 2, 0, 119, 0, 18, 0, 0, 17, 21, 0, 19, 31, 17, 30, 0, 18, 31, 0, 134, 31, 0, 0, 200, 186, 0, 0, 0, 18, 0, 0, 1, 32, 20, 0, 134, 31, 0, 0, 220, 173, 0, 0, 32, 0, 0, 0, 0, 19, 21, 0, 25, 31, 19, 1, 41, 31, 31, 24, 42, 31, 31, 24, 0, 20, 31, 0, 0, 21, 20, 0, 119, 0, 231, 255, 137, 29, 0, 0, 139, 0, 0, 0, 139, 0, 0, 0, 140, 2, 26, 0, 0, 0, 0, 0, 1, 21, 0, 0, 136, 23, 0, 0, 0, 22, 23, 0, 127, 23, 0, 0, 87, 23, 0, 0, 127, 23, 0, 0, 82, 11, 23, 0, 127, 23, 0, 0, 106, 12, 23, 4, 1, 23, 52, 0, 135, 13, 7, 0, 11, 12, 23, 0, 128, 23, 0, 0, 0, 14, 23, 0, 2, 23, 0, 0, 255, 255, 0, 0, 19, 23, 13, 23, 0, 15, 23, 0, 1, 23, 255, 7, 19, 23, 15, 23, 0, 20, 23, 0, 41, 23, 20, 16, 42, 23, 23, 16, 1, 24, 0, 0, 1, 25, 0, 8, 138, 23, 24, 25, 180, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0 ], eb + 20480);
 HEAPU8.set([ 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 92, 147, 0, 0, 0, 148, 0, 0, 1, 24, 255, 7, 19, 24, 13, 24, 0, 6, 24, 0, 1, 24, 254, 3, 4, 7, 6, 24, 85, 1, 7, 0, 2, 24, 0, 0, 255, 255, 15, 128, 19, 24, 12, 24, 0, 8, 24, 0, 2, 24, 0, 0, 0, 0, 224, 63, 20, 24, 8, 24, 0, 9, 24, 0, 127, 24, 0, 0, 85, 24, 11, 0, 127, 24, 0, 0, 109, 24, 4, 9, 127, 24, 0, 0, 86, 10, 24, 0, 58, 2, 10, 0, 119, 0, 22, 0, 59, 24, 0, 0, 70, 16, 0, 24, 121, 16, 12, 0, 61, 24, 0, 0, 0, 0, 128, 95, 65, 17, 0, 24, 134, 18, 0, 0, 236, 114, 0, 0, 17, 1, 0, 0, 82, 4, 1, 0, 26, 5, 4, 64, 58, 3, 18, 0, 0, 19, 5, 0, 119, 0, 3, 0, 58, 3, 0, 0, 1, 19, 0, 0, 85, 1, 19, 0, 58, 2, 3, 0, 119, 0, 3, 0, 58, 2, 0, 0, 119, 0, 1, 0, 139, 2, 0, 0, 140, 0, 22, 0, 0, 0, 0, 0, 1, 14, 0, 0, 136, 16, 0, 0, 0, 15, 16, 0, 136, 16, 0, 0, 25, 16, 16, 32, 137, 16, 0, 0, 130, 16, 0, 0, 136, 17, 0, 0, 49, 16, 16, 17, 72, 148, 0, 0, 1, 17, 32, 0, 135, 16, 0, 0, 17, 0, 0, 0, 25, 13, 15, 16, 25, 12, 15, 8, 0, 11, 15, 0, 1, 17, 70, 11, 134, 16, 0, 0, 240, 180, 0, 0, 17, 11, 0, 0, 134, 16, 0, 0, 212, 188, 0, 0, 1, 16, 47, 0, 1, 17, 100, 0, 1, 18, 1, 0, 1, 19, 64, 31, 1, 20, 3, 0, 134, 3, 0, 0, 212, 56, 0, 0, 16, 17, 18, 19, 20, 0, 0, 0, 0, 1, 3, 0, 0, 4, 1, 0, 41, 20, 4, 24, 42, 20, 20, 24, 33, 5, 20, 0, 121, 5, 7, 0, 0, 6, 1, 0, 0, 0, 6, 0, 0, 2, 0, 0, 137, 15, 0, 0, 139, 2, 0, 0, 119, 0, 52, 0, 1, 19, 96, 11, 134, 20, 0, 0, 240, 180, 0, 0, 19, 12, 0, 0, 1, 19, 6, 0, 1, 18, 0, 0, 134, 20, 0, 0, 40, 175, 0, 0, 19, 18, 0, 0, 1, 20, 194, 1, 1, 18, 157, 2, 1, 19, 100, 0, 1, 17, 1, 0, 1, 16, 208, 7, 1, 21, 3, 0, 134, 7, 0, 0, 148, 72, 0, 0, 20, 18, 19, 17, 16, 21, 0, 0, 0, 1, 7, 0, 1, 21, 138, 2, 1, 16, 28, 2, 1, 17, 208, 7, 134, 8, 0, 0, 220, 160, 0, 0, 21, 16, 17, 0, 0, 1, 8, 0, 134, 9, 0, 0, 172, 185, 0, 0, 0, 1, 9, 0, 1, 17, 181, 24, 1, 16, 1, 0, 83, 17, 16, 0, 1, 17, 195, 8, 134, 16, 0, 0, 240, 180, 0, 0, 17, 13, 0, 0, 1, 16, 47, 0, 1, 17, 90, 0, 1, 21, 0, 0, 1, 19, 184, 11, 1, 18, 3, 0, 134, 10, 0, 0, 212, 56, 0, 0, 16, 17, 21, 19, 18, 0, 0, 0, 0, 1, 10, 0, 1, 0, 0, 0, 0, 2, 0, 0, 137, 15, 0, 0, 139, 2, 0, 0, 1, 18, 0, 0, 139, 18, 0, 0, 140, 0, 22, 0, 0, 0, 0, 0, 1, 14, 0, 0, 136, 16, 0, 0, 0, 15, 16, 0, 136, 16, 0, 0, 25, 16, 16, 32, 137, 16, 0, 0, 130, 16, 0, 0, 136, 17, 0, 0, 49, 16, 16, 17, 208, 149, 0, 0, 1, 17, 32, 0, 135, 16, 0, 0, 17, 0, 0, 0, 25, 13, 15, 16, 25, 12, 15, 8, 0, 11, 15, 0, 1, 17, 251, 10, 134, 16, 0, 0, 240, 180, 0, 0, 17, 11, 0, 0, 134, 16, 0, 0, 212, 188, 0, 0, 1, 16, 54, 0, 1, 17, 100, 0, 1, 18, 1, 0, 1, 19, 64, 31, 1, 20, 3, 0, 134, 3, 0, 0, 212, 56, 0, 0, 16, 17, 18, 19, 20, 0, 0, 0, 0, 1, 3, 0, 0, 4, 1, 0, 41, 20, 4, 24, 42, 20, 20, 24, 33, 5, 20, 0, 121, 5, 7, 0, 0, 6, 1, 0, 0, 0, 6, 0, 0, 2, 0, 0, 137, 15, 0, 0, 139, 2, 0, 0, 119, 0, 47, 0, 1, 19, 20, 11, 134, 20, 0, 0, 240, 180, 0, 0, 19, 12, 0, 0, 1, 20, 68, 3, 1, 19, 200, 6, 1, 18, 100, 0, 1, 17, 1, 0, 1, 16, 184, 11, 1, 21, 3, 0, 134, 7, 0, 0, 148, 72, 0, 0, 20, 19, 18, 17, 16, 21, 0, 0, 0, 1, 7, 0, 1, 21, 46, 4, 1, 16, 78, 7, 1, 17, 208, 7, 134, 8, 0, 0, 220, 160, 0, 0, 21, 16, 17, 0, 0, 1, 8, 0, 134, 9, 0, 0, 172, 185, 0, 0, 0, 1, 9, 0, 1, 17, 181, 24, 1, 16, 1, 0, 83, 17, 16, 0, 1, 17, 195, 8, 134, 16, 0, 0, 240, 180, 0, 0, 17, 13, 0, 0, 1, 16, 54, 0, 1, 17, 90, 0, 1, 21, 0, 0, 1, 18, 184, 11, 1, 19, 3, 0, 134, 10, 0, 0, 212, 56, 0, 0, 16, 17, 21, 18, 19, 0, 0, 0, 0, 1, 10, 0, 1, 0, 0, 0, 0, 2, 0, 0, 137, 15, 0, 0, 139, 2, 0, 0, 1, 19, 0, 0, 139, 19, 0, 0, 140, 0, 22, 0, 0, 0, 0, 0, 1, 14, 0, 0, 136, 16, 0, 0, 0, 15, 16, 0, 136, 16, 0, 0, 25, 16, 16, 32, 137, 16, 0, 0, 130, 16, 0, 0, 136, 17, 0, 0, 49, 16, 16, 17, 68, 151, 0, 0, 1, 17, 32, 0, 135, 16, 0, 0, 17, 0, 0, 0, 25, 13, 15, 16, 25, 12, 15, 8, 0, 11, 15, 0, 1, 17, 167, 10, 134, 16, 0, 0, 240, 180, 0, 0, 17, 11, 0, 0, 134, 16, 0, 0, 212, 188, 0, 0, 1, 16, 54, 0, 1, 17, 100, 0, 1, 18, 1, 0, 1, 19, 64, 31, 1, 20, 3, 0, 134, 3, 0, 0, 212, 56, 0, 0, 16, 17, 18, 19, 20, 0, 0, 0, 0, 1, 3, 0, 0, 4, 1, 0, 41, 20, 4, 24, 42, 20, 20, 24, 33, 5, 20, 0, 121, 5, 7, 0, 0, 6, 1, 0, 0, 0, 6, 0, 0, 2, 0, 0, 137, 15, 0, 0, 139, 2, 0, 0, 119, 0, 47, 0, 1, 19, 194, 10, 134, 20, 0, 0, 240, 180, 0, 0, 19, 12, 0, 0, 1, 20, 106, 2, 1, 19, 63, 7, 1, 18, 100, 0, 1, 17, 1, 0, 1, 16, 184, 11, 1, 21, 3, 0, 134, 7, 0, 0, 148, 72, 0, 0, 20, 19, 18, 17, 16, 21, 0, 0, 0, 1, 7, 0, 1, 21, 0, 0, 1, 16, 208, 7, 1, 17, 208, 7, 134, 8, 0, 0, 220, 160, 0, 0, 21, 16, 17, 0, 0, 1, 8, 0, 134, 9, 0, 0, 172, 185, 0, 0, 0, 1, 9, 0, 1, 17, 181, 24, 1, 16, 1, 0, 83, 17, 16, 0, 1, 17, 195, 8, 134, 16, 0, 0, 240, 180, 0, 0, 17, 13, 0, 0, 1, 16, 54, 0, 1, 17, 90, 0, 1, 21, 0, 0, 1, 18, 184, 11, 1, 19, 3, 0, 134, 10, 0, 0, 212, 56, 0, 0, 16, 17, 21, 18, 19, 0, 0, 0, 0, 1, 10, 0, 1, 0, 0, 0, 0, 2, 0, 0, 137, 15, 0, 0, 139, 2, 0, 0, 1, 19, 0, 0, 139, 19, 0, 0, 140, 0, 22, 0, 0, 0, 0, 0, 1, 14, 0, 0, 136, 16, 0, 0, 0, 15, 16, 0, 136, 16, 0, 0, 25, 16, 16, 32, 137, 16, 0, 0, 130, 16, 0, 0, 136, 17, 0, 0, 49, 16, 16, 17, 184, 152, 0, 0, 1, 17, 32, 0, 135, 16, 0, 0, 17, 0, 0, 0, 25, 13, 15, 16, 25, 12, 15, 8, 0, 11, 15, 0, 1, 17, 209, 10, 134, 16, 0, 0, 240, 180, 0, 0, 17, 11, 0, 0, 134, 16, 0, 0, 212, 188, 0, 0, 1, 16, 50, 0, 1, 17, 100, 0, 1, 18, 1, 0, 1, 19, 64, 31, 1, 20, 3, 0, 134, 3, 0, 0, 212, 56, 0, 0, 16, 17, 18, 19, 20, 0, 0, 0, 0, 1, 3, 0, 0, 4, 1, 0, 41, 20, 4, 24, 42, 20, 20, 24, 33, 5, 20, 0, 121, 5, 7, 0, 0, 6, 1, 0, 0, 0, 6, 0, 0, 2, 0, 0, 137, 15, 0, 0, 139, 2, 0, 0, 119, 0, 47, 0, 1, 19, 236, 10, 134, 20, 0, 0, 240, 180, 0, 0, 19, 12, 0, 0, 1, 20, 94, 1, 1, 19, 160, 5, 1, 18, 100, 0, 1, 17, 1, 0, 1, 16, 184, 11, 1, 21, 3, 0, 134, 7, 0, 0, 148, 72, 0, 0, 20, 19, 18, 17, 16, 21, 0, 0, 0, 1, 7, 0, 1, 21, 0, 0, 1, 16, 208, 7, 1, 17, 208, 7, 134, 8, 0, 0, 220, 160, 0, 0, 21, 16, 17, 0, 0, 1, 8, 0, 134, 9, 0, 0, 172, 185, 0, 0, 0, 1, 9, 0, 1, 17, 181, 24, 1, 16, 1, 0, 83, 17, 16, 0, 1, 17, 195, 8, 134, 16, 0, 0, 240, 180, 0, 0, 17, 13, 0, 0, 1, 16, 50, 0, 1, 17, 90, 0, 1, 21, 0, 0, 1, 18, 184, 11, 1, 19, 3, 0, 134, 10, 0, 0, 212, 56, 0, 0, 16, 17, 21, 18, 19, 0, 0, 0, 0, 1, 10, 0, 1, 0, 0, 0, 0, 2, 0, 0, 137, 15, 0, 0, 139, 2, 0, 0, 1, 19, 0, 0, 139, 19, 0, 0, 140, 1, 28, 0, 0, 0, 0, 0, 1, 22, 0, 0, 136, 24, 0, 0, 0, 23, 24, 0, 25, 2, 0, 20, 82, 13, 2, 0, 25, 15, 0, 28, 82, 16, 15, 0, 16, 17, 16, 13, 121, 17, 16, 0, 25, 18, 0, 36, 82, 19, 18, 0, 38, 25, 19, 7, 1, 26, 0, 0, 1, 27, 0, 0, 135, 24, 5, 0, 25, 0, 26, 27, 82, 20, 2, 0, 1, 24, 0, 0, 13, 21, 20, 24, 121, 21, 3, 0, 1, 1, 255, 255, 119, 0, 4, 0, 1, 22, 3, 0, 119, 0, 2, 0, 1, 22, 3, 0, 32, 24, 22, 3, 121, 24, 28, 0, 25, 3, 0, 4, 82, 4, 3, 0, 25, 5, 0, 8, 82, 6, 5, 0, 16, 7, 4, 6, 121, 7, 10, 0, 0, 8, 4, 0, 0, 9, 6, 0, 4, 10, 8, 9, 25, 11, 0, 40, 82, 12, 11, 0, 38, 25, 12, 7, 1, 27, 1, 0, 135, 24, 5, 0, 25, 0, 10, 27, 25, 14, 0, 16, 1, 24, 0, 0, 85, 14, 24, 0, 1, 24, 0, 0, 85, 15, 24, 0, 1, 24, 0, 0, 85, 2, 24, 0, 1, 24, 0, 0, 85, 5, 24, 0, 1, 24, 0, 0, 85, 3, 24, 0, 1, 1, 0, 0, 139, 1, 0, 0, 140, 0, 22, 0, 0, 0, 0, 0, 2, 15, 0, 0, 208, 7, 0, 0, 1, 13, 0, 0, 136, 16, 0, 0, 0, 14, 16, 0, 136, 16, 0, 0, 25, 16, 16, 16, 137, 16, 0, 0, 130, 16, 0, 0, 136, 17, 0, 0, 49, 16, 16, 17, 24, 155, 0, 0, 1, 17, 16, 0, 135, 16, 0, 0, 17, 0, 0, 0, 0, 12, 14, 0, 1, 16, 41, 21, 78, 4, 16, 0, 41, 16, 4, 24, 42, 16, 16, 24, 33, 5, 16, 0, 121, 5, 3, 0, 1, 0, 0, 0, 119, 0, 65, 0, 1, 17, 33, 11, 134, 16, 0, 0, 240, 180, 0, 0, 17, 12, 0, 0, 134, 16, 0, 0, 212, 188, 0, 0, 1, 16, 48, 0, 1, 17, 100, 0, 1, 18, 1, 0, 1, 19, 64, 31, 1, 20, 3, 0, 134, 6, 0, 0, 212, 56, 0, 0, 16, 17, 18, 19, 20, 0, 0, 0, 0, 1, 6, 0, 0, 7, 1, 0, 41, 20, 7, 24, 42, 20, 20, 24, 33, 8, 20, 0, 121, 8, 3, 0, 1, 0, 0, 0, 119, 0, 42, 0, 1, 19, 9, 0, 1, 18, 0, 0, 134, 20, 0, 0, 40, 175, 0, 0, 19, 18, 0, 0, 1, 20, 47, 3, 1, 18, 35, 5, 1, 19, 100, 0, 1, 17, 1, 0, 1, 16, 3, 0, 134, 9, 0, 0, 148, 72, 0, 0, 20, 18, 19, 17, 15, 16, 0, 0, 0, 1, 9, 0, 1, 17, 212, 254, 134, 16, 0, 0, 228, 159, 0, 0, 17, 15, 0, 0, 0, 10, 1, 0, 41, 16, 10, 24, 42, 16, 16, 24, 33, 11, 16, 0, 121, 11, 3, 0, 1, 0, 0, 0, 119, 0, 16, 0, 134, 16, 0, 0, 212, 188, 0, 0, 1, 16, 138, 2, 1, 17, 64, 6, 1, 19, 100, 0, 1, 18, 1, 0, 1, 20, 136, 19, 1, 21, 3, 0, 134, 2, 0, 0, 148, 72, 0, 0, 16, 17, 19, 18, 20, 21, 0, 0, 0, 1, 2, 0, 1, 0, 0, 0, 119, 0, 1, 0, 0, 3, 0, 0, 137, 14, 0, 0, 139, 3, 0, 0, 140, 2, 15, 0, 0, 0, 0, 0, 1, 11, 0, 0, 136, 13, 0, 0, 0, 12, 13, 0, 136, 13, 0, 0, 25, 13, 13, 16, 137, 13, 0, 0, 130, 13, 0, 0, 136, 14, 0, 0, 49, 13, 13, 14, 132, 156, 0, 0, 1, 14, 16, 0, 135, 13, 0, 0, 14, 0, 0, 0, 0, 10, 12, 0, 0, 4, 1, 0, 0, 5, 4, 0, 1, 13, 255, 0, 19, 13, 5, 13, 0, 6, 13, 0, 1, 13, 41, 0, 1, 14, 15, 0, 138, 6, 13, 14, 20, 157, 0, 0, 228, 156, 0, 0, 228, 156, 0, 0, 32, 157, 0, 0, 228, 156, 0, 0, 228, 156, 0, 0, 44, 157, 0, 0, 56, 157, 0, 0, 228, 156, 0, 0, 68, 157, 0, 0, 228, 156, 0, 0, 228, 156, 0, 0, 228, 156, 0, 0, 80, 157, 0, 0, 92, 157, 0, 0, 0, 7, 4, 0, 1, 13, 255, 0, 19, 13, 7, 13, 0, 8, 13, 0, 85, 10, 8, 0, 1, 14, 67, 5, 134, 13, 0, 0, 240, 180, 0, 0, 14, 10, 0, 0, 1, 2, 76, 4, 1, 3, 244, 1, 119, 0, 22, 0, 1, 2, 200, 0, 1, 3, 132, 3, 119, 0, 19, 0, 1, 2, 188, 2, 1, 3, 232, 3, 119, 0, 16, 0, 1, 2, 181, 2, 1, 3, 80, 1, 119, 0, 13, 0, 1, 2, 76, 4, 1, 3, 244, 1, 119, 0, 10, 0, 1, 2, 70, 5, 1, 3, 144, 1, 119, 0, 7, 0, 1, 2, 164, 6, 1, 3, 238, 2, 119, 0, 4, 0, 1, 2, 32, 3, 1, 3, 120, 5, 119, 0, 1, 0, 85, 0, 3, 0, 25, 9, 0, 4, 85, 9, 2, 0, 137, 12, 0, 0, 139, 0, 0, 0, 140, 3, 21, 0, 0, 0, 0, 0, 1, 17, 0, 0, 136, 19, 0, 0, 0, 18, 19, 0, 136, 19, 0, 0, 25, 19, 19, 32, 137, 19, 0, 0, 130, 19, 0, 0, 136, 20, 0, 0, 49, 19, 19, 20, 184, 157, 0, 0, 1, 20, 32, 0, 135, 19, 0, 0, 20, 0, 0, 0, 0, 12, 18, 0, 25, 5, 18, 20, 25, 6, 0, 60, 82, 7, 6, 0, 0, 8, 5, 0, 85, 12, 7, 0, 25, 13, 12, 4, 1, 19, 0, 0, 85, 13, 19, 0, 25, 14, 12, 8, 85, 14, 1, 0, 25, 15, 12, 12, 85, 15, 8, 0, 25, 16, 12, 16, 85, 16, 2, 0, 1, 19, 140, 0, 135, 9, 8, 0, 19, 12, 0, 0, 134, 10, 0, 0, 184, 184, 0, 0, 9, 0, 0, 0, 34, 11, 10, 0, 121, 11, 5, 0, 1, 19, 255, 255, 85, 5, 19, 0, 1, 4, 255, 255, 119, 0, 3, 0, 82, 3, 5, 0, 0, 4, 3, 0, 137, 18, 0, 0, 139, 4, 0, 0, 140, 3, 22, 0, 0, 0, 0, 0, 1, 18, 0, 0, 136, 20, 0, 0, 0, 19, 20, 0, 136, 20, 0, 0, 25, 20, 20, 32, 137, 20, 0, 0, 130, 20, 0, 0, 136, 21, 0, 0, 49, 20, 20, 21, 112, 158, 0, 0, 1, 21, 32, 0, 135, 20, 0, 0, 21, 0, 0, 0, 0, 15, 19, 0, 25, 8, 19, 16, 25, 9, 0, 36, 1, 20, 5, 0, 85, 9, 20, 0, 82, 10, 0, 0, 38, 20, 10, 64, 0, 11, 20, 0, 32, 12, 11, 0, 121, 12, 18, 0, 25, 13, 0, 60, 82, 14, 13, 0, 0, 3, 8, 0, 85, 15, 14, 0, 25, 16, 15, 4, 1, 20, 19, 84, 85, 16, 20, 0, 25, 17, 15, 8, 85, 17, 3, 0, 1, 20, 54, 0, 135, 4, 9, 0, 20, 15, 0, 0, 32, 5, 4, 0, 120, 5, 4, 0, 25, 6, 0, 75, 1, 20, 255, 255, 83, 6, 20, 0, 134, 7, 0, 0, 20, 80, 0, 0, 0, 1, 2, 0, 137, 19, 0, 0, 139, 7, 0, 0, 140, 5, 24, 0, 0, 0, 0, 0, 1, 20, 0, 0, 136, 22, 0, 0, 0, 21, 22, 0, 136, 22, 0, 0, 1, 23, 0, 1, 3, 22, 22, 23, 137, 22, 0, 0, 130, 22, 0, 0, 136, 23, 0, 0, 49, 22, 22, 23, 48, 159, 0, 0, 1, 23, 0, 1, 135, 22, 0, 0, 23, 0, 0, 0, 0, 14, 21, 0, 2, 22, 0, 0, 0, 32, 1, 0, 19, 22, 4, 22, 0, 15, 22, 0, 32, 16, 15, 0, 15, 17, 3, 2, 19, 22, 17, 16, 0, 19, 22, 0, 121, 19, 34, 0, 4, 18, 2, 3, 1, 22, 0, 1, 16, 7, 18, 22, 1, 22, 0, 1, 125, 8, 7, 18, 22, 0, 0, 0, 135, 22, 2, 0, 14, 1, 8, 0, 1, 22, 255, 0, 16, 9, 22, 18, 121, 9, 19, 0, 4, 10, 2, 3, 0, 6, 18, 0, 1, 23, 0, 1, 134, 22, 0, 0, 20, 187, 0, 0, 0, 14, 23, 0, 1, 22, 0, 1, 4, 11, 6, 22, 1, 22, 255, 0, 16, 12, 22, 11, 121, 12, 3, 0, 0, 6, 11, 0, 119, 0, 246, 255, 1, 22, 255, 0, 19, 22, 10, 22, 0, 13, 22, 0, 0, 5, 13, 0, 119, 0, 2, 0, 0, 5, 18, 0, 134, 22, 0, 0, 20, 187, 0, 0, 0, 14, 5, 0, 137, 21, 0, 0, 139, 0, 0, 0, 140, 2, 30, 0, 0, 0, 0, 0, 1, 26, 0, 0, 136, 28, 0, 0, 0, 27, 28, 0, 136, 28, 0, 0, 25, 28, 28, 16 ], eb + 30720);
 HEAPU8.set([ 137, 28, 0, 0, 130, 28, 0, 0, 136, 29, 0, 0, 49, 28, 28, 29, 32, 160, 0, 0, 1, 29, 16, 0, 135, 28, 0, 0, 29, 0, 0, 0, 0, 20, 0, 0, 0, 21, 1, 0, 0, 22, 20, 0, 76, 28, 22, 0, 58, 23, 28, 0, 1, 28, 188, 21, 88, 24, 28, 0, 58, 19, 24, 0, 58, 25, 19, 0, 135, 2, 10, 0, 25, 0, 0, 0, 65, 3, 23, 2, 1, 28, 184, 21, 80, 4, 28, 0, 41, 28, 4, 16, 42, 28, 28, 16, 76, 28, 28, 0, 58, 5, 28, 0, 63, 6, 5, 3, 75, 7, 6, 0, 1, 28, 184, 21, 84, 28, 7, 0, 0, 8, 20, 0, 76, 28, 8, 0, 58, 9, 28, 0, 1, 28, 188, 21, 88, 10, 28, 0, 58, 12, 10, 0, 58, 11, 12, 0, 135, 13, 11, 0, 11, 0, 0, 0, 65, 14, 9, 13, 1, 28, 186, 21, 80, 15, 28, 0, 41, 28, 15, 16, 42, 28, 28, 16, 76, 28, 28, 0, 58, 16, 28, 0, 63, 17, 16, 14, 75, 18, 17, 0, 1, 28, 186, 21, 84, 28, 18, 0, 134, 28, 0, 0, 224, 178, 0, 0, 137, 27, 0, 0, 1, 28, 0, 0, 139, 28, 0, 0, 140, 3, 33, 0, 0, 0, 0, 0, 1, 29, 0, 0, 136, 31, 0, 0, 0, 30, 31, 0, 136, 31, 0, 0, 25, 31, 31, 32, 137, 31, 0, 0, 130, 31, 0, 0, 136, 32, 0, 0, 49, 31, 31, 32, 24, 161, 0, 0, 1, 32, 32, 0, 135, 31, 0, 0, 32, 0, 0, 0, 0, 24, 0, 0, 0, 25, 1, 0, 0, 26, 2, 0, 0, 4, 24, 0, 1, 31, 184, 21, 80, 5, 31, 0, 41, 31, 5, 16, 42, 31, 31, 16, 0, 6, 31, 0, 4, 7, 4, 6, 0, 27, 7, 0, 0, 8, 25, 0, 1, 31, 186, 21, 80, 9, 31, 0, 41, 31, 9, 16, 42, 31, 31, 16, 0, 10, 31, 0, 4, 11, 8, 10, 0, 28, 11, 0, 0, 12, 28, 0, 0, 13, 27, 0, 0, 22, 12, 0, 0, 23, 13, 0, 0, 14, 22, 0, 76, 31, 14, 0, 58, 15, 31, 0, 0, 16, 23, 0, 76, 31, 16, 0, 58, 17, 31, 0, 135, 18, 12, 0, 15, 17, 0, 0, 58, 19, 18, 0, 58, 3, 19, 0, 58, 20, 3, 0, 1, 31, 136, 19, 134, 21, 0, 0, 120, 181, 0, 0, 20, 31, 0, 0, 137, 30, 0, 0, 139, 21, 0, 0, 140, 2, 25, 0, 0, 0, 0, 0, 1, 21, 0, 0, 136, 23, 0, 0, 0, 22, 23, 0, 78, 11, 0, 0, 78, 12, 1, 0, 41, 23, 11, 24, 42, 23, 23, 24, 41, 24, 12, 24, 42, 24, 24, 24, 14, 13, 23, 24, 41, 24, 11, 24, 42, 24, 24, 24, 32, 14, 24, 0, 20, 24, 14, 13, 0, 20, 24, 0, 121, 20, 4, 0, 0, 4, 12, 0, 0, 5, 11, 0, 119, 0, 24, 0, 0, 2, 1, 0, 0, 3, 0, 0, 25, 15, 3, 1, 25, 16, 2, 1, 78, 17, 15, 0, 78, 18, 16, 0, 41, 24, 17, 24, 42, 24, 24, 24, 41, 23, 18, 24, 42, 23, 23, 24, 14, 6, 24, 23, 41, 23, 17, 24, 42, 23, 23, 24, 32, 7, 23, 0, 20, 23, 7, 6, 0, 19, 23, 0, 121, 19, 4, 0, 0, 4, 18, 0, 0, 5, 17, 0, 119, 0, 4, 0, 0, 2, 16, 0, 0, 3, 15, 0, 119, 0, 236, 255, 1, 23, 255, 0, 19, 23, 5, 23, 0, 8, 23, 0, 1, 23, 255, 0, 19, 23, 4, 23, 0, 9, 23, 0, 4, 10, 8, 9, 139, 10, 0, 0, 140, 1, 25, 0, 0, 0, 0, 0, 1, 22, 0, 0, 136, 24, 0, 0, 0, 23, 24, 0, 25, 2, 0, 74, 78, 13, 2, 0, 41, 24, 13, 24, 42, 24, 24, 24, 0, 15, 24, 0, 1, 24, 255, 0, 3, 16, 15, 24, 20, 24, 16, 15, 0, 17, 24, 0, 1, 24, 255, 0, 19, 24, 17, 24, 0, 18, 24, 0, 83, 2, 18, 0, 82, 19, 0, 0, 38, 24, 19, 8, 0, 20, 24, 0, 32, 21, 20, 0, 121, 21, 20, 0, 25, 4, 0, 8, 1, 24, 0, 0, 85, 4, 24, 0, 25, 5, 0, 4, 1, 24, 0, 0, 85, 5, 24, 0, 25, 6, 0, 44, 82, 7, 6, 0, 25, 8, 0, 28, 85, 8, 7, 0, 25, 9, 0, 20, 85, 9, 7, 0, 25, 10, 0, 48, 82, 11, 10, 0, 3, 12, 7, 11, 25, 14, 0, 16, 85, 14, 12, 0, 1, 1, 0, 0, 119, 0, 5, 0, 39, 24, 19, 32, 0, 3, 24, 0, 85, 0, 3, 0, 1, 1, 255, 255, 139, 1, 0, 0, 140, 4, 27, 0, 0, 0, 0, 0, 2, 25, 0, 0, 255, 0, 0, 0, 1, 23, 0, 0, 136, 26, 0, 0, 0, 24, 26, 0, 32, 17, 0, 0, 32, 18, 1, 0, 19, 26, 17, 18, 0, 19, 26, 0, 121, 19, 3, 0, 0, 4, 2, 0, 119, 0, 33, 0, 0, 5, 2, 0, 0, 11, 1, 0, 0, 21, 0, 0, 38, 26, 21, 15, 0, 20, 26, 0, 1, 26, 177, 13, 3, 22, 26, 20, 78, 6, 22, 0, 19, 26, 6, 25, 0, 7, 26, 0, 20, 26, 7, 3, 0, 8, 26, 0, 19, 26, 8, 25, 0, 9, 26, 0, 26, 10, 5, 1, 83, 10, 9, 0, 1, 26, 4, 0, 135, 12, 7, 0, 21, 11, 26, 0, 128, 26, 0, 0, 0, 13, 26, 0, 32, 14, 12, 0, 32, 15, 13, 0, 19, 26, 14, 15, 0, 16, 26, 0, 121, 16, 3, 0, 0, 4, 10, 0, 119, 0, 5, 0, 0, 5, 10, 0, 0, 11, 13, 0, 0, 21, 12, 0, 119, 0, 228, 255, 139, 4, 0, 0, 140, 1, 20, 0, 0, 0, 0, 0, 1, 17, 0, 0, 136, 19, 0, 0, 0, 18, 19, 0, 82, 3, 0, 0, 78, 4, 3, 0, 41, 19, 4, 24, 42, 19, 19, 24, 0, 5, 19, 0, 26, 15, 5, 48, 35, 13, 15, 10, 121, 13, 21, 0, 1, 2, 0, 0, 0, 9, 3, 0, 0, 16, 15, 0, 27, 6, 2, 10, 3, 7, 16, 6, 25, 8, 9, 1, 85, 0, 8, 0, 78, 10, 8, 0, 41, 19, 10, 24, 42, 19, 19, 24, 0, 11, 19, 0, 26, 14, 11, 48, 35, 12, 14, 10, 121, 12, 5, 0, 0, 2, 7, 0, 0, 9, 8, 0, 0, 16, 14, 0, 119, 0, 242, 255, 0, 1, 7, 0, 119, 0, 2, 0, 1, 1, 0, 0, 139, 1, 0, 0, 140, 1, 21, 0, 0, 0, 0, 0, 1, 17, 0, 0, 136, 19, 0, 0, 0, 18, 19, 0, 136, 19, 0, 0, 25, 19, 19, 16, 137, 19, 0, 0, 130, 19, 0, 0, 136, 20, 0, 0, 49, 19, 19, 20, 200, 164, 0, 0, 1, 20, 16, 0, 135, 19, 0, 0, 20, 0, 0, 0, 58, 8, 0, 0, 1, 19, 42, 21, 78, 9, 19, 0, 38, 19, 9, 1, 0, 10, 19, 0, 38, 19, 10, 1, 0, 11, 19, 0, 32, 12, 11, 0, 1, 19, 41, 21, 78, 13, 19, 0, 41, 19, 13, 24, 42, 19, 19, 24, 33, 14, 19, 0, 19, 19, 12, 14, 0, 16, 19, 0, 58, 15, 8, 0, 121, 16, 16, 0, 68, 2, 15, 0, 58, 3, 2, 0, 62, 19, 0, 0, 24, 45, 68, 84, 251, 33, 9, 64, 63, 4, 3, 19, 58, 5, 4, 0, 134, 6, 0, 0, 4, 166, 0, 0, 5, 0, 0, 0, 58, 1, 6, 0, 58, 7, 1, 0, 137, 18, 0, 0, 139, 7, 0, 0, 119, 0, 5, 0, 58, 1, 15, 0, 58, 7, 1, 0, 137, 18, 0, 0, 139, 7, 0, 0, 59, 19, 0, 0, 139, 19, 0, 0, 140, 3, 22, 0, 0, 0, 0, 0, 1, 19, 0, 0, 136, 21, 0, 0, 0, 20, 21, 0, 32, 12, 0, 0, 32, 13, 1, 0, 19, 21, 12, 13, 0, 14, 21, 0, 121, 14, 3, 0, 0, 3, 2, 0, 119, 0, 29, 0, 0, 4, 2, 0, 0, 6, 1, 0, 0, 16, 0, 0, 1, 21, 255, 0, 19, 21, 16, 21, 0, 15, 21, 0, 38, 21, 15, 7, 0, 17, 21, 0, 39, 21, 17, 48, 0, 18, 21, 0, 26, 5, 4, 1, 83, 5, 18, 0, 1, 21, 3, 0, 135, 7, 7, 0, 16, 6, 21, 0, 128, 21, 0, 0, 0, 8, 21, 0, 32, 9, 7, 0, 32, 10, 8, 0, 19, 21, 9, 10, 0, 11, 21, 0, 121, 11, 3, 0, 0, 3, 5, 0, 119, 0, 5, 0, 0, 4, 5, 0, 0, 6, 8, 0, 0, 16, 7, 0, 119, 0, 232, 255, 139, 3, 0, 0, 140, 1, 20, 0, 0, 0, 0, 0, 1, 16, 0, 0, 136, 18, 0, 0, 0, 17, 18, 0, 136, 18, 0, 0, 25, 18, 18, 16, 137, 18, 0, 0, 130, 18, 0, 0, 136, 19, 0, 0, 49, 18, 18, 19, 64, 166, 0, 0, 1, 19, 16, 0, 135, 18, 0, 0, 19, 0, 0, 0, 58, 1, 0, 0, 58, 8, 1, 0, 58, 9, 8, 0, 62, 18, 0, 0, 24, 45, 68, 84, 251, 33, 9, 192, 71, 10, 9, 18, 120, 10, 2, 0, 119, 0, 10, 0, 58, 11, 1, 0, 58, 12, 11, 0, 62, 18, 0, 0, 24, 45, 68, 84, 251, 33, 25, 64, 63, 13, 12, 18, 58, 14, 13, 0, 58, 1, 14, 0, 119, 0, 240, 255, 58, 15, 1, 0, 58, 2, 15, 0, 62, 18, 0, 0, 24, 45, 68, 84, 251, 33, 9, 64, 73, 3, 2, 18, 58, 4, 1, 0, 120, 3, 2, 0, 119, 0, 9, 0, 58, 5, 4, 0, 62, 18, 0, 0, 24, 45, 68, 84, 251, 33, 25, 64, 64, 6, 5, 18, 58, 7, 6, 0, 58, 1, 7, 0, 119, 0, 240, 255, 137, 17, 0, 0, 139, 4, 0, 0, 140, 1, 7, 0, 0, 0, 0, 0, 25, 5, 0, 15, 38, 5, 5, 240, 0, 0, 5, 0, 130, 5, 1, 0, 82, 1, 5, 0, 3, 3, 1, 0, 1, 5, 0, 0, 15, 5, 5, 0, 15, 6, 3, 1, 19, 5, 5, 6, 34, 6, 3, 0, 20, 5, 5, 6, 121, 5, 7, 0, 135, 5, 13, 0, 1, 6, 12, 0, 135, 5, 14, 0, 6, 0, 0, 0, 1, 5, 255, 255, 139, 5, 0, 0, 130, 5, 1, 0, 85, 5, 3, 0, 135, 4, 15, 0, 47, 5, 4, 3, 100, 167, 0, 0, 135, 5, 16, 0, 32, 5, 5, 0, 121, 5, 8, 0, 130, 5, 1, 0, 85, 5, 1, 0, 1, 6, 12, 0, 135, 5, 14, 0, 6, 0, 0, 0, 1, 5, 255, 255, 139, 5, 0, 0, 139, 1, 0, 0, 140, 1, 19, 0, 0, 0, 0, 0, 1, 15, 0, 0, 136, 17, 0, 0, 0, 16, 17, 0, 136, 17, 0, 0, 25, 17, 17, 16, 137, 17, 0, 0, 130, 17, 0, 0, 136, 18, 0, 0, 49, 17, 17, 18, 164, 167, 0, 0, 1, 18, 16, 0, 135, 17, 0, 0, 18, 0, 0, 0, 0, 7, 16, 0, 0, 1, 0, 0, 0, 8, 1, 0, 134, 17, 0, 0, 72, 156, 0, 0, 7, 8, 0, 0, 82, 9, 7, 0, 26, 10, 9, 50, 25, 11, 7, 4, 82, 12, 11, 0, 26, 13, 12, 50, 82, 14, 7, 0, 25, 2, 14, 50, 25, 3, 7, 4, 82, 4, 3, 0, 25, 5, 4, 50, 134, 6, 0, 0, 64, 86, 0, 0, 10, 13, 2, 5, 137, 16, 0, 0, 139, 6, 0, 0, 140, 0, 6, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 136, 3, 0, 0, 25, 3, 3, 16, 137, 3, 0, 0, 130, 3, 0, 0, 136, 4, 0, 0, 49, 3, 3, 4, 52, 168, 0, 0, 1, 4, 16, 0, 135, 3, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 1, 3, 40, 21, 1, 4, 0, 0, 83, 3, 4, 0, 1, 3, 37, 7, 134, 4, 0, 0, 240, 180, 0, 0, 3, 0, 0, 0, 1, 4, 240, 21, 61, 3, 0, 0, 0, 0, 68, 65, 89, 4, 3, 0, 1, 3, 244, 21, 59, 4, 159, 8, 89, 3, 4, 0, 1, 4, 248, 21, 61, 3, 0, 0, 154, 153, 25, 62, 89, 4, 3, 0, 1, 3, 252, 21, 61, 4, 0, 0, 0, 0, 192, 63, 89, 3, 4, 0, 1, 4, 0, 22, 61, 3, 0, 0, 236, 81, 184, 61, 89, 4, 3, 0, 1, 3, 4, 22, 61, 4, 0, 0, 205, 204, 140, 63, 89, 3, 4, 0, 1, 3, 179, 24, 1, 5, 29, 0, 134, 4, 0, 0, 124, 186, 0, 0, 3, 5, 0, 0, 1, 5, 180, 24, 1, 3, 30, 0, 134, 4, 0, 0, 124, 186, 0, 0, 5, 3, 0, 0, 1, 3, 178, 24, 1, 5, 31, 0, 134, 4, 0, 0, 124, 186, 0, 0, 3, 5, 0, 0, 1, 5, 2, 0, 1, 3, 0, 0, 134, 4, 0, 0, 40, 175, 0, 0, 5, 3, 0, 0, 134, 4, 0, 0, 0, 191, 0, 0, 137, 2, 0, 0, 139, 0, 0, 0, 140, 1, 17, 0, 0, 0, 0, 0, 1, 13, 0, 0, 136, 15, 0, 0, 0, 14, 15, 0, 136, 15, 0, 0, 25, 15, 15, 16, 137, 15, 0, 0, 130, 15, 0, 0, 136, 16, 0, 0, 49, 15, 15, 16, 76, 169, 0, 0, 1, 16, 16, 0, 135, 15, 0, 0, 16, 0, 0, 0, 0, 4, 0, 0, 1, 15, 42, 21, 78, 5, 15, 0, 38, 15, 5, 1, 0, 6, 15, 0, 38, 15, 6, 1, 0, 7, 15, 0, 32, 8, 7, 0, 1, 15, 41, 21, 78, 9, 15, 0, 41, 15, 9, 24, 42, 15, 15, 24, 33, 10, 15, 0, 19, 15, 8, 10, 0, 12, 15, 0, 0, 11, 4, 0, 121, 12, 8, 0, 1, 15, 184, 11, 4, 2, 15, 11, 0, 1, 2, 0, 0, 3, 1, 0, 137, 14, 0, 0, 139, 3, 0, 0, 119, 0, 5, 0, 0, 1, 11, 0, 0, 3, 1, 0, 137, 14, 0, 0, 139, 3, 0, 0, 1, 15, 0, 0, 139, 15, 0, 0, 140, 0, 6, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 136, 4, 0, 0, 25, 4, 4, 16, 137, 4, 0, 0, 130, 4, 0, 0, 136, 5, 0, 0, 49, 4, 4, 5, 0, 170, 0, 0, 1, 5, 16, 0, 135, 4, 0, 0, 5, 0, 0, 0, 25, 1, 3, 8, 0, 0, 3, 0, 134, 4, 0, 0, 16, 192, 0, 0, 1, 5, 245, 7, 134, 4, 0, 0, 240, 180, 0, 0, 5, 0, 0, 0, 134, 4, 0, 0, 212, 190, 0, 0, 1, 5, 232, 3, 134, 4, 0, 0, 40, 186, 0, 0, 5, 0, 0, 0, 134, 4, 0, 0, 0, 191, 0, 0, 1, 5, 32, 3, 134, 4, 0, 0, 40, 186, 0, 0, 5, 0, 0, 0, 134, 4, 0, 0, 212, 190, 0, 0, 1, 5, 32, 3, 134, 4, 0, 0, 40, 186, 0, 0, 5, 0, 0, 0, 134, 4, 0, 0, 0, 191, 0, 0, 1, 5, 232, 3, 134, 4, 0, 0, 40, 186, 0, 0, 5, 0, 0, 0, 134, 4, 0, 0, 212, 190, 0, 0, 134, 4, 0, 0, 84, 185, 0, 0, 1, 5, 18, 8, 134, 4, 0, 0, 240, 180, 0, 0, 5, 1, 0, 0, 119, 0, 0, 0, 140, 3, 17, 0, 0, 0, 0, 0, 1, 13, 0, 0, 136, 15, 0, 0, 0, 14, 15, 0, 136, 15, 0, 0, 25, 15, 15, 16, 137, 15, 0, 0, 130, 15, 0, 0, 136, 16, 0, 0, 49, 15, 15, 16, 224, 170, 0, 0, 1, 16, 16, 0, 135, 15, 0, 0, 16, 0, 0, 0, 0, 6, 0, 0, 0, 7, 1, 0, 58, 8, 2, 0, 0, 9, 6, 0, 134, 10, 0, 0, 16, 169, 0, 0, 9, 0, 0, 0, 2, 15, 0, 0, 255, 255, 0, 0, 19, 15, 10, 15, 0, 11, 15, 0, 1, 15, 184, 21, 84, 15, 11, 0, 0, 12, 7, 0, 2, 15, 0, 0, 255, 255, 0, 0, 19, 15, 12, 15, 0, 3, 15, 0, 1, 15, 186, 21, 84, 15, 3, 0, 58, 4, 8, 0, 134, 5, 0, 0, 140, 164, 0, 0, 4, 0, 0, 0, 1, 15, 188, 21, 89, 15, 5, 0, 134, 15, 0, 0, 224, 178, 0, 0, 137, 14, 0, 0, 139, 0, 0, 0, 140, 1, 14, 0, 0, 0, 0, 0, 1, 10, 0, 0, 136, 12, 0, 0, 0, 11, 12, 0, 136, 12, 0, 0, 25, 12, 12, 16, 137, 12, 0, 0, 130, 12, 0, 0, 136, 13, 0, 0, 49, 12, 12, 13, 148, 171, 0, 0, 1, 13, 16, 0, 135, 12, 0, 0, 13, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1, 0, 1, 12, 64, 0, 83, 2, 12, 0, 25, 3, 2, 1, 1, 12, 64, 0, 83, 3, 12, 0, 25, 4, 2, 2, 1, 12, 64, 0, 83, 4, 12, 0, 25, 5, 2, 3, 1, 12, 64, 0, 83, 5, 12, 0, 25, 6, 2, 20, 1, 12, 64, 0, 83, 6, 12, 0, 25, 7, 2, 21, 1, 12, 64, 0, 83, 7, 12, 0, 25, 8, 2, 22, 1, 12, 64, 0, 83, 8, 12, 0, 25, 9, 2, 23, 1, 12, 64, 0, 83, 9, 12, 0, 137, 11, 0, 0, 139, 0, 0, 0, 140, 0, 9, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 136, 7, 0, 0, 25, 7, 7, 16, 137, 7, 0, 0, 130, 7, 0, 0, 136, 8, 0, 0, 49, 7, 7, 8, 60, 172, 0, 0, 1, 8, 16, 0, 135, 7, 0, 0, 8, 0, 0, 0, 0, 4, 6, 0, 134, 0, 0, 0, 20, 189, 0, 0, 35, 1, 0, 250, 120, 1, 3, 0, 137, 6, 0, 0, 139, 0, 0, 0, 1, 8, 110, 11, 134, 7, 0, 0, 240, 180, 0, 0, 8, 4, 0, 0, 1, 7, 40, 21, 78, 2, 7, 0, 38, 7, 2, 1, 0, 3, 7, 0, 121, 3, 6, 0, 134, 7, 0, 0, 84, 184, 0, 0, 137, 6, 0, 0, 139, 0, 0, 0, 119, 0, 5, 0, 134, 7, 0, 0, 196, 169, 0, 0, 137, 6, 0, 0, 139, 0, 0, 0, 139, 0, 0, 0, 140, 0, 10, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 136, 3, 0, 0, 25, 3, 3, 16, 137, 3, 0, 0, 130, 3, 0, 0, 136, 4, 0, 0, 49, 3, 3, 4, 224, 172, 0, 0, 1, 4, 16, 0, 135, 3, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 1, 4, 60, 6, 134, 3, 0, 0, 240, 180, 0, 0, 4, 0, 0, 0, 1, 4, 76, 4, 1, 5, 144, 1, 1, 6, 50, 0, 1, 7, 0, 0, 1, 8, 208, 7, 1, 9, 5, 0, 134, 3, 0, 0, 148, 72, 0, 0, 4, 5, 6, 7, 8, 9, 0, 0, 1, 9, 182, 3, 1, 8, 150, 0, 1, 7, 50, 0, 1, 6, 1, 0, 1, 5, 160, 15, 1, 4, 5, 0, 134, 3, 0, 0, 148, 72, 0, 0, 9, 8, 7, 6, 5, 4, 0, 0, 1, 4, 32, 3, 134, 3, 0, 0, 40, 186, 0, 0, 4, 0, 0, 0, 1, 4, 76, 4, 1, 5, 44, 1, 1, 6, 50, 0, 1, 7, 1, 0, 1, 8, 160, 15, 1, 9, 5, 0, 134, 3, 0, 0, 148, 72, 0, 0, 4, 5, 6, 7, 8, 9, 0, 0, 1, 9, 182, 3, 1, 8, 150, 0, 1, 7, 50, 0, 1, 6, 1, 0, 1, 5, 160, 15, 1, 4, 5, 0, 134, 3, 0, 0, 148, 72, 0, 0, 9, 8, 7, 6, 5, 4, 0, 0, 1, 4, 176, 4, 1, 5, 194, 1, 1, 6, 50, 0, 1, 7, 0, 0, 1, 8, 184, 11, 1, 9, 5, 0, 134, 3, 0, 0, 148, 72, 0, 0, 4, 5, 6, 7, 8, 9, 0, 0, 134, 3, 0, 0, 104, 179, 0, 0, 137, 2, 0, 0, 139, 0, 0, 0, 140, 1, 13, 0, 0, 0, 0, 0, 1, 9, 0, 0, 136, 11, 0, 0, 0, 10, 11, 0, 136, 11, 0, 0, 25, 11, 11, 16, 137, 11, 0, 0, 130, 11, 0, 0, 136, 12, 0, 0, 49, 11, 11, 12, 24, 174, 0, 0, 1, 12, 16, 0, 135, 11, 0, 0, 12, 0, 0, 0, 0, 1, 0, 0, 134, 3, 0, 0, 192, 189, 0, 0, 0, 2, 3, 0, 134, 4, 0, 0, 192, 189, 0, 0, 0, 5, 2, 0, 4, 6, 4, 5, 0, 7, 1, 0, 18, 8, 7, 6, 120, 8, 8, 0, 134, 11, 0, 0, 0, 172, 0, 0, 1, 12, 10, 0, 134, 11, 0, 0, 40, 186, 0, 0, 12, 0, 0, 0, 119, 0, 243, 255, 137, 10, 0, 0, 139, 0, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 136, 3, 0, 0, 25, 3, 3, 16, 137, 3, 0, 0, 130, 3, 0, 0, 136, 4, 0, 0, 49, 3, 3, 4, 164, 174, 0, 0, 1, 4, 16, 0, 135, 3, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 1, 3, 40, 21, 1, 4, 1, 0, 83, 3, 4, 0, 1, 3, 194, 5, 134, 4, 0, 0, 240, 180, 0, 0, 3, 0, 0, 0, 1, 4, 240, 21, 61, 3, 0, 0, 0, 0, 68, 65, 89, 4, 3, 0, 1, 3, 244, 21, 59, 4, 159, 8, 89, 3, 4, 0, 1, 4, 248, 21, 61, 3, 0, 0, 154, 153, 25, 62, 89, 4, 3, 0, 1, 3, 252, 21, 61, 4, 0, 0, 0, 0, 192, 63, 89, 3, 4, 0, 1, 4, 0, 22, 61, 3, 0, 0, 236, 81, 184, 61, 89, 4, 3, 0, 1, 3, 4, 22, 61, 4, 0, 0, 205, 204, 140, 63, 89, 3, 4, 0, 137, 2, 0, 0, 139, 0, 0, 0, 140, 2, 15, 0, 0, 0, 0, 0, 1, 11, 0, 0, 136, 13, 0, 0, 0, 12, 13, 0, 136, 13, 0, 0, 25, 13, 13, 16, 137, 13, 0, 0, 130, 13, 0, 0, 136, 14, 0, 0, 49, 13, 13, 14, 100, 175, 0, 0, 1, 14, 16, 0, 135, 13, 0, 0, 14, 0, 0, 0, 0, 3, 0, 0, 38, 13, 1, 1, 0, 5, 13, 0, 0, 4, 5, 0, 0, 6, 3, 0, 0, 7, 4, 0, 38, 13, 7, 1, 0, 8, 13, 0, 134, 13, 0, 0, 240, 107, 0, 0, 6, 8, 0, 0, 0, 9, 3, 0, 0, 10, 4, 0, 38, 13, 10, 1, 0, 2, 13, 0, 134, 13, 0, 0, 128, 109, 0, 0, 9, 2, 0, 0, 137, 12, 0, 0, 139, 0, 0, 0, 140, 3, 16, 0, 0, 0, 0, 0, 1, 13, 0, 0, 136, 15, 0, 0, 0, 14, 15, 0, 25, 6, 0, 16, 82, 7, 6, 0, 25, 8, 0, 20, 82, 9, 8, 0, 0, 10, 9, 0, 4, 11, 7, 10, 16, 12, 2, 11, 125, 3, 12, 2, 11, 0, 0, 0, 135, 15, 6, 0, 9, 1, 3, 0, 82, 4, 8, 0, 3, 5, 4, 3, 85, 8, 5, 0, 139, 2, 0, 0, 140, 3, 14, 0, 0, 0, 0, 0, 1, 10, 0, 0, 136, 12, 0, 0, 0, 11, 12, 0, 136, 12, 0, 0, 25, 12, 12, 16, 137, 12, 0, 0, 130, 12, 0, 0, 136, 13, 0, 0, 49, 12, 12, 13, 64, 176, 0, 0, 1, 13, 16, 0, 135, 12, 0, 0, 13, 0, 0, 0, 0, 3, 0, 0, 0, 4, 1, 0, 0, 5, 2, 0, 0, 6, 3, 0, 2, 12, 0, 0, 255, 255, 0, 0, 19, 12, 6, 12, 0, 7, 12, 0, 1, 12, 184, 21, 84, 12, 7, 0, 0, 8, 4, 0, 2, 12, 0, 0, 255, 255, 0, 0, 19, 12, 8, 12, 0, 9, 12, 0, 1, 12, 186, 21, 84, 12, 9, 0, 134, 12, 0, 0, 224, 178, 0, 0, 137, 11, 0, 0, 1, 12, 0, 0, 139, 12, 0, 0, 140, 0, 10, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 136, 3, 0, 0, 25, 3, 3, 16, 137, 3, 0, 0, 130, 3, 0, 0, 136, 4, 0, 0, 49, 3, 3, 4, 212, 176, 0, 0, 1, 4, 16, 0, 135, 3, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 1, 4, 218, 5, 134, 3, 0, 0, 240, 180, 0, 0, 4, 0, 0, 0, 1, 4, 126, 4, 1, 5, 44, 1, 1, 6, 100, 0, 1, 7, 1, 0, 1, 8, 136, 19, 1, 9, 5, 0, 134, 3, 0, 0, 148, 72, 0, 0, 4, 5, 6, 7, 8, 9, 0, 0, 1, 9, 20, 5, 1, 8, 180, 0, 1, 7, 30, 0, 1, 6, 1, 0, 1, 5, 184, 11, 1, 4, 5, 0, 134, 3, 0, 0, 148, 72, 0, 0, 9, 8, 7, 6, 5, 4, 0, 0, 1, 4, 32, 3, 134, 3, 0, 0, 40, 186, 0, 0, 4, 0, 0, 0, 1, 4, 176, 4, 1, 5, 94, 1, 1, 6, 50, 0, 1, 7, 0, 0, 1, 8, 136, 19, 1, 9, 5, 0, 134, 3, 0, 0, 148, 72, 0, 0, 4, 5, 6, 7, 8, 9, 0, 0, 134, 3, 0, 0, 104, 179, 0, 0, 137, 2, 0, 0, 139, 0, 0, 0, 140, 1, 11, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 136, 9, 0, 0, 25, 9, 9, 16, 137, 9, 0, 0, 130, 9, 0, 0, 136, 10, 0, 0, 49, 9, 9, 10, 188, 177, 0, 0, 1, 10, 16, 0, 135, 9, 0, 0, 10, 0, 0, 0, 0, 6, 8, 0, 25, 1, 0, 60, 82, 2, 1, 0, 134, 3, 0, 0, 148, 191, 0, 0, 2, 0, 0, 0, 85, 6, 3, 0, 1, 9, 6, 0, 135, 4, 17, 0, 9, 6, 0, 0, 134, 5, 0, 0, 184, 184, 0, 0, 4, 0, 0, 0, 137, 8, 0, 0, 139, 5, 0, 0, 140, 0, 10, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 136, 3, 0, 0, 25, 3, 3, 16, 137, 3, 0, 0, 130, 3, 0, 0, 136, 4, 0, 0, 49, 3, 3, 4, 52, 178, 0, 0, 1, 4, 16, 0, 135, 3, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 1, 4, 20, 6, 134, 3, 0, 0, 240, 180, 0, 0, 4, 0, 0, 0, 1, 4, 226, 4, 1, 5, 44, 1, 1, 6, 50, 0, 1, 7, 0, 0, 1, 8, 136, 19, 1, 9, 5, 0, 134, 3, 0, 0, 148, 72, 0, 0, 4, 5, 6, 7, 8, 9, 0, 0, 1, 9, 170, 5, 1, 8, 150, 0, 1, 7, 30, 0, 1, 6, 1, 0, 1, 5, 184, 11, 1, 4, 5, 0, 134, 3, 0, 0, 148, 72, 0, 0, 9, 8, 7, 6, 5, 4, 0, 0, 1, 4, 132, 3, 134, 3, 0, 0, 40, 186, 0, 0, 4, 0, 0, 0, 1, 4, 176, 4, 1, 5, 224, 1, 1, 6, 50, 0, 1, 7, 0, 0, 1, 8, 136, 19, 1, 9, 5, 0, 134, 3, 0, 0, 148, 72, 0, 0, 4, 5, 6, 7, 8, 9, 0, 0, 134, 3, 0, 0, 104, 179, 0, 0, 137, 2, 0, 0, 139, 0, 0, 0, 140, 0, 12, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 1, 9, 12, 22, 1, 10, 210, 4, 85, 9, 10, 0, 1, 10, 188, 21, 88, 0, 10, 0, 1, 10, 16, 22, 89, 10, 0, 0, 1, 10, 184, 21, 80, 1, 10, 0, 1, 10, 20, 22, 84, 10, 1, 0, 1, 10, 186, 21, 80, 2, 10, 0, 1, 10, 22, 22, 84, 10, 2, 0, 1, 10, 40, 21, 78, 3, 10, 0, 38, 10, 3, 1, 0, 4, 10, 0, 38, 10, 4, 1, 0, 5, 10, 0, 1, 10, 27, 22, 83, 10, 5, 0, 1, 10, 2, 0, 1, 9, 8, 22, 1, 11, 24, 0, 135, 6, 18, 0, 10, 9, 11, 0, 139, 0, 0, 0, 140, 0, 10, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 136, 3, 0, 0, 25, 3, 3, 16, 137, 3, 0, 0, 130, 3, 0, 0, 136, 4, 0, 0, 49, 3, 3, 4, 164, 179, 0, 0, 1, 4, 16, 0, 135, 3, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 1, 4, 254, 5, 134, 3, 0, 0, 240, 180, 0, 0, 4, 0, 0, 0, 1, 4, 176, 4, 1, 5, 244, 1, 1, 6, 50, 0, 1, 7, 0, 0, 1, 8, 184, 11, 1, 9, 8, 0, 134, 3, 0, 0, 148, 72, 0, 0, 4, 5, 6, 7, 8, 9, 0, 0, 1, 9, 176, 4, 1, 8, 208, 7, 1, 7, 208, 7, 134, 3, 0, 0, 220, 160, 0, 0, 9, 8, 7, 0, 1, 7, 176, 4, 1, 8, 98, 2, 1, 9, 50, 0, 1, 6, 1, 0, 1, 5, 136, 19, 1, 4, 2, 0, 134, 3, 0, 0, 148, 72, 0, 0, 7, 8, 9, 6, 5, 4, 0, 0, 137, 2, 0, 0, 139, 0, 0, 0, 140, 4, 14, 0, 0, 0, 0, 0, 1, 10, 0, 0, 136, 12, 0, 0, 0, 11, 12, 0, 136, 12, 0, 0, 25, 12, 12, 16, 137, 12, 0, 0, 130, 12, 0, 0, 136, 13, 0, 0, 49, 12, 12, 13, 100, 180, 0, 0, 1, 13, 16, 0, 135, 12, 0, 0, 13, 0, 0, 0, 0, 4, 0, 0, 0, 5, 1, 0, 0, 6, 2, 0, 0, 7, 3, 0, 0, 8, 4, 0, 0, 9, 5, 0, 1, 13, 0, 0, 134, 12, 0, 0, 4, 176, 0, 0, 8, 9, 13, 0, 137, 11, 0, 0, 1, 12, 0, 0, 139, 12, 0, 0, 140, 2, 13, 0, 0, 0, 0, 0, 1, 10, 0, 0, 136, 12, 0, 0, 0, 11, 12, 0, 1, 12, 0, 0, 13, 3, 1, 12, 121, 3, 3, 0, 1, 2, 0, 0, 119, 0, 8, 0, 82, 4, 1, 0, 25, 5, 1, 4, 82, 6, 5, 0, 134, 7, 0, 0, 40, 82, 0, 0, 4, 6, 0, 0, 0, 2, 7, 0, 1, 12, 0, 0, 14, 8, 2, 12, 125, 9, 8, 2, 0, 0, 0, 0, 139, 9, 0, 0, 140, 2, 10, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 136, 7, 0, 0, 25, 7, 7, 32, 137, 7, 0, 0, 130, 7, 0, 0, 136, 8, 0, 0, 49, 7, 7, 8, 44, 181, 0, 0, 1, 8, 32, 0, 135, 7, 0, 0, 8, 0, 0, 0, 0, 3, 6, 0, 0, 2, 0, 0, 85, 3, 1, 0, 0, 4, 2, 0, 1, 8, 96, 24, 1, 9, 81, 0, 134, 7, 0, 0, 72, 105, 0, 0, 8, 9, 4, 3, 1, 9, 96, 24, 1, 8, 75, 2, 135, 7, 19, 0, 9, 8, 0, 0, 1, 8, 96, 24, 134, 7, 0, 0, 232, 181, 0, 0, 8, 0, 0, 0, 137, 6, 0, 0, 139, 0, 0, 0, 140, 2, 11, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 136, 9, 0, 0, 25, 9, 9, 16, 137, 9, 0, 0, 130, 9, 0, 0, 136, 10, 0, 0, 49, 9, 9, 10, 180, 181, 0, 0, 1, 10, 16, 0, 135, 9, 0, 0, 10, 0, 0, 0, 58, 2, 0, 0, 0, 3, 1, 0, 58, 4, 2, 0, 1, 9, 188, 21, 88, 5, 9, 0, 63, 6, 5, 4, 1, 9, 188, 21, 89, 9, 6, 0, 134, 9, 0, 0, 224, 178, 0, 0, 137, 8, 0, 0, 1, 9, 0, 0, 139, 9, 0, 0, 140, 1, 11, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 136, 9, 0, 0, 25, 9, 9, 16, 137, 9, 0, 0, 130, 9, 0, 0, 136, 10, 0, 0, 49, 9, 9, 10, 36, 182, 0, 0, 1, 10, 16, 0, 135, 9, 0, 0, 10, 0, 0, 0, 0, 1, 0, 0, 1, 9, 40, 21, 78, 2, 9, 0, 38, 9, 2, 1, 0, 3, 9, 0, 38, 9, 3, 1, 0, 4, 9, 0, 0, 5, 1, 0, 1, 9, 1, 0, 135, 6, 18, 0, 9, 4, 5, 0, 137, 8, 0, 0, 139, 0, 0, 0, 140, 4, 7, 0, 0, 0, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 136, 6, 0, 0, 25, 6, 6, 16, 137, 6, 0, 0, 0, 4, 5, 0, 134, 6, 0, 0, 20, 51, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 137, 5, 0, 0, 106, 6, 4, 4, 129, 6, 0, 0, 82, 6, 4, 0, 139, 6, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 136, 6, 0, 0, 25, 6, 6, 16, 137, 6, 0, 0, 130, 6, 0, 0, 136, 7, 0, 0, 49, 6, 6, 7, 216, 182, 0, 0, 1, 7, 16, 0, 135, 6, 0, 0, 7, 0, 0, 0, 0, 3, 5, 0, 0, 1, 0, 0, 0, 2, 1, 0, 85, 3, 2, 0, 1, 7, 11, 2, 134, 6, 0, 0, 240, 180, 0, 0, 7, 3, 0, 0, 137, 5, 0, 0, 139, 0, 0, 0, 140, 1, 5, 0, 0, 0, 0, 0, 130, 2, 2, 0, 1, 3, 255, 0, 19, 3, 0, 3, 90, 1, 2, 3, 34, 2, 1, 8, 121, 2, 2, 0, 139, 1, 0, 0, 130, 2, 2, 0, 42, 3, 0, 8, 1, 4, 255, 0, 19, 3, 3, 4, 90, 1, 2, 3, 34, 2, 1, 8, 121, 2, 3, 0, 25, 2, 1, 8, 139, 2, 0, 0, 130, 2, 2, 0, 42, 3, 0, 16, 1, 4, 255, 0, 19, 3, 3, 4, 90, 1, 2, 3, 34, 2, 1, 8, 121, 2, 3, 0, 25, 2, 1, 16, 139, 2, 0, 0, 130, 2, 2, 0, 43, 3, 0, 24, 90, 2, 2, 3, 25, 2, 2, 24, 139, 2, 0, 0, 140, 0, 6, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 136, 4, 0, 0, 25, 4, 4, 16, 137, 4, 0, 0, 130, 4, 0, 0, 136, 5, 0, 0, 49, 4, 4, 5, 188, 183, 0, 0, 1, 5, 16, 0, 135, 4, 0, 0, 5, 0, 0, 0, 0, 1, 3, 0, 134, 0, 0, 0, 192, 189, 0, 0, 1, 4, 60, 21, 85, 4, 0, 0, 1, 5, 137, 11, 134, 4, 0, 0, 240, 180, 0, 0, 5, 1, 0, 0, 137, 3, 0, 0, 139, 0, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 136, 3, 0, 0, 25, 3, 3, 16, 137, 3, 0, 0, 130, 3, 0, 0, 136, 4, 0, 0, 49, 3, 3, 4, 36, 184, 0, 0, 1, 4, 16, 0, 135, 3, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 1, 4, 151, 11, 134, 3, 0, 0, 240, 180, 0, 0, 4, 0, 0, 0, 2, 4, 0, 0, 144, 95, 1, 0, 134, 3, 0, 0, 220, 173, 0, 0, 4, 0, 0, 0, 137, 2, 0, 0, 139, 0, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 136, 3, 0, 0, 25, 3, 3, 16, 137, 3, 0, 0, 130, 3, 0, 0, 136, 4, 0, 0, 49, 3, 3, 4, 144, 184, 0, 0, 1, 4, 16, 0, 135, 3, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 134, 3, 0, 0, 84, 185, 0, 0, 134, 3, 0, 0, 16, 192, 0, 0, 1, 4, 204, 5, 134, 3, 0, 0, 240, 180, 0, 0, 4, 0, 0, 0, 119, 0, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 1, 7, 0, 240, 16, 2, 7, 0, 121, 2, 8, 0, 1, 7, 0, 0, 4, 3, 7, 0, 134, 4, 0, 0, 100, 189, 0, 0, 85, 4, 3, 0, 1, 1, 255, 255, 119, 0, 2, 0, 0, 1, 0, 0, 139, 1, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 136, 3, 0, 0, 25, 3, 3, 16, 137, 3, 0, 0, 130, 3, 0, 0, 136, 4, 0, 0, 49, 3, 3, 4, 56, 185, 0, 0, 1, 4, 16, 0, 135, 3, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 1, 4, 197, 2, 134, 3, 0, 0, 240, 180, 0, 0, 4, 0, 0, 0, 137, 2, 0, 0, 139, 0, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 136, 3, 0, 0, 25, 3, 3, 16, 137, 3, 0, 0, 130, 3, 0, 0, 136, 4, 0, 0, 49, 3, 3, 4, 144, 185, 0, 0, 1, 4, 16, 0, 135, 3, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 1, 4, 217, 2, 134, 3, 0, 0, 240, 180, 0, 0, 4, 0, 0, 0, 137, 2, 0, 0, 139, 0, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 2, 0, 1, 4, 0, 0, 134, 2, 0, 0, 128, 109, 0, 0, 3, 4, 0, 0, 1, 4, 2, 0, 1, 3, 0, 0, 134, 2, 0, 0, 240, 107, 0, 0, 4, 3, 0, 0, 1, 3, 244, 1, 134, 2, 0, 0, 220, 173, 0, 0, 3, 0, 0, 0, 1, 3, 1, 0, 1, 4, 1, 0, 134, 2, 0, 0, 240, 107, 0, 0, 3, 4, 0, 0, 1, 4, 1, 0, 1, 3, 1, 0, 134, 2, 0, 0, 128, 109, 0, 0, 4, 3, 0, 0, 1, 2, 0, 0, 139, 2, 0, 0, 140, 1, 7, 0, 0, 0, 0, 0, 1, 3, 0, 0, 136, 5, 0, 0, 0, 4, 5, 0, 136, 5, 0, 0, 25, 5, 5, 16, 137, 5, 0, 0, 130, 5, 0, 0, 136, 6, 0, 0, 49, 5, 5, 6, 100, 186, 0, 0, 1, 6, 16, 0, 135, 5, 0, 0, 6, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1, 0, 135, 5, 20, 0, 2, 0, 0, 0, 137, 4, 0, 0, 139, 0, 0, 0, 140, 2, 8, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 136, 6, 0, 0, 25, 6, 6, 16, 137, 6, 0, 0, 130, 6, 0, 0, 136, 7, 0, 0, 49, 6, 6, 7, 184, 186, 0, 0, 1, 7, 16, 0, 135, 6, 0, 0, 7, 0, 0, 0, 0, 2, 0, 0, 0, 3, 1, 0, 137, 5, 0, 0, 139, 0, 0, 0, 140, 2, 8, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 136, 6, 0, 0, 25, 6, 6, 16, 137, 6, 0, 0, 130, 6, 0, 0, 136, 7, 0, 0, 49, 6, 6, 7, 4, 187, 0, 0, 1, 7, 16, 0, 135, 6, 0, 0, 7, 0, 0, 0, 0, 2, 0, 0, 0, 3, 1, 0, 137, 5, 0, 0, 139, 0, 0, 0, 140, 3, 9, 0, 0, 0, 0, 0, 1, 6, 0, 0, 136, 8, 0, 0, 0, 7, 8, 0, 82, 3, 0, 0, 38, 8, 3, 32, 0, 4, 8, 0, 32, 5, 4, 0, 121, 5, 4, 0, 134, 8, 0, 0, 68, 96, 0, 0, 1, 2, 0, 0, 139, 0, 0, 0, 140, 1, 6, 0, 0, 0, 0, 0, 1, 3, 0, 0, 136, 5, 0, 0, 0, 4, 5, 0, 127, 5, 0, 0, 87, 5, 0, 0, 127, 5, 0, 0, 82, 1, 5, 0, 127, 5, 0, 0, 106, 2, 5, 4, 129, 2, 0, 0, 139, 1, 0, 0, 140, 2, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 1, 7, 0, 0, 13, 3, 0, 7, 121, 3, 3, 0, 1, 2, 0, 0, 119, 0, 6, 0, 1, 7, 0, 0, 134, 4, 0, 0, 116, 88, 0, 0, 0, 1, 7, 0, 0, 2, 4, 0, 139, 2, 0, 0, 140, 1, 6, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 136, 4, 0, 0, 25, 4, 4, 16, 137, 4, 0, 0, 130, 4, 0, 0, 136, 5, 0, 0, 49, 4, 4, 5, 252, 187, 0, 0, 1, 5, 16, 0, 135, 4, 0, 0, 5, 0, 0, 0, 0, 1, 0, 0, 137, 3, 0, 0, 139, 0, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 134, 1, 0, 0, 36, 190, 0, 0, 1, 7, 188, 0, 3, 2, 1, 7, 82, 3, 2, 0, 134, 4, 0, 0, 8, 111, 0, 0, 0, 3, 0, 0, 139, 4, 0, 0, 140, 4, 8, 0, 0, 0, 0, 0, 4, 4, 0, 2, 4, 5, 1, 3, 4, 6, 1, 3, 16, 7, 0, 2, 4, 5, 6, 7, 129, 5, 0, 0, 139, 4, 0, 0, 140, 2, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 32, 3, 1, 0, 134, 4, 0, 0, 100, 190, 0, 0, 0, 0, 0, 0, 125, 2, 3, 0, 4, 0, 0, 0, 139, 2, 0, 0, 140, 4, 6, 0, 0, 0, 0, 0, 1, 5, 0, 0, 134, 4, 0, 0, 20, 51, 0, 0, 0, 1, 2, 3, 5, 0, 0, 0, 139, 4, 0, 0, 140, 4, 8, 0, 0, 0, 0, 0, 3, 4, 0, 2, 3, 6, 1, 3, 16, 7, 4, 0, 3, 5, 6, 7, 129, 5, 0, 0, 139, 4, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 1, 0, 1, 4, 0, 0, 134, 2, 0, 0, 240, 107, 0, 0, 3, 4, 0, 0, 1, 4, 1, 0, 1, 3, 0, 0, 134, 2, 0, 0, 128, 109, 0, 0, 4, 3, 0, 0, 139, 0, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 1, 4, 60, 21, 82, 0, 4, 0, 2, 4, 0, 0, 144, 95, 1, 0, 4, 1, 4, 0, 139, 1, 0, 0, 140, 2, 6, 0, 0, 0, 0, 0, 1, 3, 0, 0, 136, 5, 0, 0, 0, 4, 5, 0, 134, 2, 0, 0, 152, 180, 0, 0, 0, 1, 0, 0, 139, 2, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 134, 0, 0, 0, 4, 190, 0, 0, 25, 1, 0, 64, 139, 1, 0, 0, 140, 2, 2, 0, 0, 0, 0, 0, 137, 0, 0, 0, 132, 0, 0, 1, 139, 0, 0, 0, 140, 2, 6, 0, 0, 0, 0, 0, 1, 3, 0, 0, 136, 5, 0, 0, 0, 4, 5, 0, 134, 2, 0, 0, 236, 114, 0, 0, 0, 1, 0, 0, 139, 2, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 1, 3, 0, 0, 135, 0, 21, 0, 3, 0, 0, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 134, 0, 0, 0, 116, 192, 0, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 134, 0, 0, 0, 116, 192, 0, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 134, 0, 0, 0, 116, 192, 0, 0, 139, 0, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 134, 2, 0, 0, 172, 190, 0, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 255, 0, 19, 1, 0, 1, 41, 1, 1, 24, 42, 2, 0, 8, 1, 3, 255, 0, 19, 2, 2, 3, 41, 2, 2, 16, 20, 1, 1, 2, 42, 2, 0, 16, 1, 3, 255, 0, 19, 2, 2, 3, 41, 2, 2, 8, 20, 1, 1, 2, 43, 2, 0, 24, 20, 1, 1, 2, 139, 1, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 8, 22, 134, 2, 0, 0, 88, 171, 0, 0, 3, 0, 0, 0, 139, 0, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 178, 24, 1, 4, 160, 0, 134, 2, 0, 0, 200, 186, 0, 0, 3, 4, 0, 0, 139, 0, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 178, 24, 1, 4, 74, 0, 134, 2, 0, 0, 200, 186, 0, 0, 3, 4, 0, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 84, 24, 135, 2, 22, 0, 3, 0, 0, 0, 1, 2, 92, 24, 139, 2, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 2, 20, 24, 139, 2, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 84, 24, 135, 2, 23, 0, 3, 0, 0, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 139, 0, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 1, 3, 0, 0, 139, 3, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 139, 0, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 139, 0, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 139, 0, 0, 0, 140, 3, 5, 0, 0, 0, 0, 0, 1, 4, 1, 0, 135, 3, 24, 0, 4, 0, 0, 0, 1, 3, 0, 0, 139, 3, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 139, 0, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 2, 8, 0, 139, 2, 0, 0, 140, 1, 3, 0, 0, 0, 0, 0, 1, 2, 0, 0, 135, 1, 25, 0, 2, 0, 0, 0, 1, 1, 0, 0, 139, 1, 0, 0, 0, 0, 0, 0 ], eb + 40960);
 var relocations = [];
 relocations = relocations.concat([ 80, 780, 1976, 2284, 2464, 2568, 2868, 3044, 3128, 3232, 4452, 4516, 4584, 4676, 4832, 4900, 5236, 5488, 6116, 6300, 6304, 6308, 6312, 6316, 6320, 6324, 6328, 6332, 6336, 6340, 6344, 6348, 6352, 6356, 6360, 6364, 6368, 6372, 6376, 6380, 6384, 6388, 6392, 6396, 6400, 6404, 6408, 6412, 6416, 6420, 6424, 6428, 6432, 6436, 6440, 6444, 6448, 6684, 7684, 8312, 8476, 8712, 8772, 8916, 8920, 8924, 8928, 8932, 8936, 8940, 8944, 8948, 8952, 8956, 8960, 8964, 8968, 8972, 8976, 8980, 8984, 8988, 8992, 8996, 9e3, 9004, 9008, 9012, 9016, 9020, 9024, 9028, 9032, 9036, 9040, 9044, 9048, 9052, 9056, 9060, 9064, 9068, 9072, 9076, 9080, 9084, 9088, 9092, 9096, 9100, 9104, 9108, 9112, 9116, 9120, 9124, 9128, 9132, 9136, 9740, 9744, 9748, 9752, 9756, 9760, 9764, 9768, 10660, 11604, 11912, 11916, 11920, 11924, 11928, 11932, 11936, 11940, 11944, 11948, 14624, 14744, 14748, 14752, 14756, 14760, 14764, 14768, 14772, 14776, 14780, 14784, 14788, 14792, 14796, 14800, 16224, 16304, 16696, 16700, 16704, 16708, 16712, 16716, 16720, 16724, 16728, 17444, 18632, 19012, 19016, 19020, 19024, 19028, 19032, 19036, 19040, 19044, 19048, 19052, 19056, 19060, 19064, 19068, 19072, 19076, 19080, 19084, 19088, 19092, 19096, 19100, 19104, 19108, 19112, 19116, 19120, 19124, 19128, 19132, 19136, 19140, 19144, 19148, 19152, 19156, 19160, 19164, 19168, 19172, 19176, 19180, 19184, 19188, 19192, 19196, 19200, 19204, 19208, 19212, 19216, 19220, 19224, 19228, 19232, 19236, 19240, 19244, 19248, 19252, 19256, 19260, 19264, 19268, 19272, 19276, 19280, 19284, 19288, 19292, 19296, 19300, 19304, 19308, 19312, 19316, 19320, 19324, 19328, 19332, 19336, 19340, 19344, 19348, 19352, 19356, 19360, 19364, 19368, 19372, 19376, 19380, 19384, 19388, 19392, 19396, 19400, 19404, 19408, 19412, 19416, 19420, 19424, 19428, 19432, 19436, 19440, 19444, 19448, 19452, 19456, 19460, 19464, 19468, 19472, 19476, 19480, 19484, 19488, 19492, 19496, 19500, 19504, 19508, 19512, 19516, 20552, 22124, 23332, 23392, 23864, 25056, 26328, 27e3, 27056, 27684, 27760, 27764, 27768, 27772, 27776, 27780, 27784, 27788, 27792, 28076, 28152, 28156, 28160, 28164, 28168, 28172, 28176, 28180, 28184, 28712, 29132, 29532, 29536, 29540, 29544, 29548, 29552, 29556, 29560, 29564, 29568, 29572, 29576, 29580, 29584, 29588, 29592, 29596, 29600, 29604, 29608, 29612, 29616, 29620, 29624, 29628, 29632, 29636, 29640, 29644, 29648, 29652, 29656, 29660, 29664, 29668, 29672, 29676, 29680, 29684, 29688, 29692, 29696, 29700, 29704, 29708, 29712, 29716, 29720, 29724, 29728, 29732, 29736, 29740, 29744, 29748, 29752, 29756, 29760, 29764, 29768, 29772, 29776, 29780, 29784, 29788, 29792, 29796, 29800, 29804, 29808, 29812, 29816, 29820, 29824, 29828, 29832, 29836, 29840, 29844, 29848, 29852, 29856, 29860, 29864, 29868, 29872, 29876, 29880, 29884, 29888, 29892, 29896, 29900, 29904, 29908, 29912, 29916, 29920, 29924, 29928, 29932, 29936, 29940, 29944, 29948, 29952, 29956, 29960, 29964, 29968, 29972, 29976, 29980, 29984, 29988, 29992, 29996, 3e4, 30004, 30008, 30012, 30016, 30020, 30024, 30028, 30032, 30036, 30040, 30044, 30048, 30052, 30056, 30060, 30064, 30068, 30072, 30076, 30080, 30084, 30088, 30092, 30096, 30100, 30104, 30108, 30112, 30116, 30120, 30124, 30128, 30132, 30136, 30140, 30144, 30148, 30152, 30156, 30160, 30164, 30168, 30172, 30176, 30180, 30184, 30188, 30192, 30196, 30200, 30204, 30208, 30212, 30216, 30220, 30224, 30228, 30232, 30236, 30240, 30244, 30248, 30252, 30256, 30260, 30264, 30268, 30272, 30276, 30280, 30284, 30288, 30292, 30296, 30300, 30304, 30308, 30312, 30316, 30320, 30324, 30328, 30332, 30336, 30340, 30344, 30348, 30352, 30356, 30360, 30364, 30368, 30372, 30376, 30380, 30384, 30388, 30392, 30396, 30400, 30404, 30408, 30412, 30416, 30420, 30424, 30428, 30432, 30436, 30440, 30444, 30448, 30452, 30456, 30460, 30464, 30468, 30472, 30476, 30480, 30484, 30488, 30492, 30496, 30500, 30504, 30508, 30512, 30516, 30520, 30524, 30528, 30532, 30536, 30540, 30544, 30548, 30552, 30556, 30560, 30564, 30568, 30572, 30576, 30580, 30584, 30588, 30592, 30596, 30600, 30604, 30608, 30612, 30616, 30620, 30624, 30628, 30632, 30636, 30640, 30644, 30648, 30652, 30656, 30660, 30664, 30668, 30672, 30676, 30680, 30684, 30688, 30692, 30696, 30700, 30704, 30708, 30712, 30716, 30720, 30724, 30728, 30732, 30736, 30740, 30744, 30748, 30752, 30756, 30760, 30764, 30768, 30772, 30776, 30780, 30784, 30788, 30792, 30796, 30800, 30804, 30808, 30812, 30816, 30820, 30824, 30828, 30832, 30836, 30840, 30844, 30848, 30852, 30856, 30860, 30864, 30868, 30872, 30876, 30880, 30884, 30888, 30892, 30896, 30900, 30904, 30908, 30912, 30916, 30920, 30924, 30928, 30932, 30936, 30940, 30944, 30948, 30952, 30956, 30960, 30964, 30968, 30972, 30976, 30980, 30984, 30988, 30992, 30996, 31e3, 31004, 31008, 31012, 31016, 31020, 31024, 31028, 31032, 31036, 31040, 31044, 31048, 31052, 31056, 31060, 31064, 31068, 31072, 31076, 31080, 31084, 31088, 31092, 31096, 31100, 31104, 31108, 31112, 31116, 31120, 31124, 31128, 31132, 31136, 31140, 31144, 31148, 31152, 31156, 31160, 31164, 31168, 31172, 31176, 31180, 31184, 31188, 31192, 31196, 31200, 31204, 31208, 31212, 31216, 31220, 31224, 31228, 31232, 31236, 31240, 31244, 31248, 31252, 31256, 31260, 31264, 31268, 31272, 31276, 31280, 31284, 31288, 31292, 31296, 31300, 31304, 31308, 31312, 31316, 31320, 31324, 31328, 31332, 31336, 31340, 31344, 31348, 31352, 31356, 31360, 31364, 31368, 31372, 31376, 31380, 31384, 31388, 31392, 31396, 31400, 31404, 31408, 31412, 31416, 31420, 31424, 31428, 31432, 31436, 31440, 31444, 31448, 31452, 31456, 31460, 31464, 31468, 31472, 31476, 31480, 31484, 31488, 31492, 31496, 31500, 31504, 31508, 31512, 31516, 31520, 31524, 31528, 31532, 31536, 31540, 31544, 31548, 31552, 31556, 31560, 31564, 31568, 31572, 31576, 31580, 31584, 31588, 31592, 31596, 31600, 31604, 31608, 31612, 31616, 31620, 31624, 31628, 31632, 31636, 31640, 31644, 31648, 31652, 31656, 31660, 31664, 31668, 31672, 31676, 31680, 31684, 31688, 31692, 31696, 31700, 31704, 31708, 31712, 31716, 31720, 31724, 31728, 31732, 31736, 31740, 31744, 31748, 31752, 31756, 31760, 31764, 31768, 31772, 31776, 31780, 31784, 31788, 31792, 31796, 31800, 31804, 31808, 31812, 31816, 31820, 31824, 31828, 31832, 31836, 31840, 31844, 31848, 31852, 31856, 31860, 31864, 31868, 31872, 31876, 31880, 31884, 31888, 31892, 31896, 31900, 31904, 31908, 31912, 31916, 31920, 31924, 31928, 31932, 31936, 31940, 31944, 31948, 31952, 31956, 31960, 31964, 31968, 31972, 31976, 31980, 31984, 31988, 31992, 31996, 32e3, 32004, 32008, 32012, 32016, 32020, 32024, 32028, 32032, 32036, 32040, 32044, 32048, 32052, 32056, 32060, 32064, 32068, 32072, 32076, 32080, 32084, 32088, 32092, 32096, 32100, 32104, 32108, 32112, 32116, 32120, 32124, 32128, 32132, 32136, 32140, 32144, 32148, 32152, 32156, 32160, 32164, 32168, 32172, 32176, 32180, 32184, 32188, 32192, 32196, 32200, 32204, 32208, 32212, 32216, 32220, 32224, 32228, 32232, 32236, 32240, 32244, 32248, 32252, 32256, 32260, 32264, 32268, 32272, 32276, 32280, 32284, 32288, 32292, 32296, 32300, 32304, 32308, 32312, 32316, 32320, 32324, 32328, 32332, 32336, 32340, 32344, 32348, 32352, 32356, 32360, 32364, 32368, 32372, 32376, 32380, 32384, 32388, 32392, 32396, 32400, 32404, 32408, 32412, 32416, 32420, 32424, 32428, 32432, 32436, 32440, 32444, 32448, 32452, 32456, 32460, 32464, 32468, 32472, 32476, 32480, 32484, 32488, 32492, 32496, 32500, 32504, 32508, 32512, 32516, 32520, 32524, 32528, 32532, 32536, 32540, 32544, 32548, 32552, 32556, 32560, 32564, 32568, 32572, 32576, 32580, 32584, 32588, 32592, 32596, 32600, 32604, 32608, 32612, 32616, 32620, 32624, 32628, 32632, 32636, 32640, 32644, 32648, 32652, 32656, 32660, 32664, 32668, 32672, 32676, 32680, 32684, 32688, 32692, 32696, 32700, 32704, 32708, 32712, 32716, 32720, 32724, 32728, 32732, 32736, 32740, 32744, 32748, 32752, 32756, 32760, 32764, 32768, 32772, 32776, 32780, 32784, 32788, 32792, 32796, 32800, 32804, 32808, 32812, 32816, 32820, 32824, 32828, 32832, 32836, 32840, 32844, 32848, 32852, 32856, 32860, 32864, 32868, 32872, 32876, 32880, 32884, 32888, 32892, 32896, 32900, 32904, 32908, 32912, 32916, 32920, 32924, 32928, 32932, 32936, 32940, 32944, 32948, 32952, 32956, 32960, 32964, 32968, 32972, 32976, 32980, 32984, 32988, 32992, 32996, 33e3, 33004, 33008, 33012, 33016, 33020, 33024, 33028, 33032, 33036, 33040, 33044, 33048, 33052, 33056, 33060, 33064, 33068, 33072, 33076, 33080, 33084, 33088, 33092, 33096, 33100, 33104, 33108, 33112, 33116, 33120, 33124, 33128, 33132, 33136, 33140, 33144, 33148, 33152, 33156, 33160, 33164, 33168, 33172, 33176, 33180, 33184, 33188, 33192, 33196, 33200, 33204, 33208, 33212, 33216, 33220, 33224, 33228, 33232, 33236, 33240, 33244, 33248, 33252, 33256, 33260, 33264, 33268, 33272, 33276, 33280, 33284, 33288, 33292, 33296, 33300, 33304, 33308, 33312, 33316, 33320, 33324, 33328, 33332, 33336, 33340, 33344, 33348, 33352, 33356, 33360, 33364, 33368, 33372, 33376, 33380, 33384, 33388, 33392, 33396, 33400, 33404, 33408, 33412, 33416, 33420, 33424, 33428, 33432, 33436, 33440, 33444, 33448, 33452, 33456, 33460, 33464, 33468, 33472, 33476, 33480, 33484, 33488, 33492, 33496, 33500, 33504, 33508, 33512, 33516, 33520, 33524, 33528, 33532, 33536, 33540, 33544, 33548, 33552, 33556, 33560, 33564, 33568, 33572, 33576, 33580, 33584, 33588, 33592, 33596, 33600, 33604, 33608, 33612, 33616, 33620, 33624, 33628, 33632, 33636, 33640, 33644, 33648, 33652, 33656, 33660, 33664, 33668, 33672, 33676, 33680, 33684, 33688, 33692, 33696, 33700, 33704, 33708, 33712, 33716, 33720, 33724, 33728, 33732, 33736, 33740, 33744, 33748, 33752, 33756, 33760, 33764, 33768, 33772, 33776, 33780, 33784, 33788, 33792, 33796, 33800, 33804, 33808, 33812, 33816, 33820, 33824, 33828, 33832, 33836, 33840, 33844, 33848, 33852, 33856, 33860, 33864, 33868, 33872, 33876, 33880, 33884, 33888, 33892, 33896, 33900, 33904, 33908, 33912, 33916, 33920, 33924, 33928, 33932, 33936, 33940, 33944, 33948, 33952, 33956, 33960, 33964, 33968, 33972, 33976, 33980, 33984, 33988, 33992, 33996, 34e3, 34004, 34008, 34012, 34016, 34020, 34024, 34028, 34032, 34036, 34040, 34044, 34048, 34052, 34056, 34060, 34064, 34068, 34072, 34076, 34080, 34084, 34088, 34092, 34096, 34100, 34104, 34108, 34112, 34116, 34120, 34124, 34128, 34132, 34136, 34140, 34144, 34148, 34152, 34156, 34160, 34164, 34168, 34172, 34176, 34180, 34184, 34188, 34192, 34196, 34200, 34204, 34208, 34212, 34216, 34220, 34224, 34228, 34232, 34236, 34240, 34244, 34248, 34252, 34256, 34260, 34264, 34268, 34272, 34276, 34280, 34284, 34288, 34292, 34296, 34300, 34304, 34308, 34312, 34316, 34320, 34324, 34328, 34332, 34336, 34340, 34344, 34348, 34352, 34356, 34360, 34364, 34368, 34372, 34376, 34380, 34384, 34388, 34392, 34396, 34400, 34404, 34408, 34412, 34416, 34420, 34424, 34428, 34432, 34436, 34440, 34444, 34448, 34452, 34456, 34460, 34464, 34468, 34472, 34476, 34480, 34484, 34488, 34492, 34496, 34500, 34504, 34508, 34512, 34516, 34520, 34524, 34528, 34532, 34536, 34540, 34544, 34548, 34552, 34556, 34560, 34564, 34568, 34572, 34576, 34580, 34584, 34588, 34592, 34596, 34600, 34604, 34608, 34612, 34616, 34620, 34624, 34628, 34632, 34636, 34640, 34644, 34648, 34652, 34656, 34660, 34664, 34668, 34672, 34676, 34680, 34684, 34688, 34692, 34696, 34700, 34704, 34708, 34712, 34716, 34720, 34724, 34728, 34732, 34736, 34740, 34744, 34748, 34752, 34756, 34760, 34764, 34768, 34772, 34776, 34780, 34784, 34788, 34792, 34796, 34800, 34804, 34808, 34812, 34816, 34820, 34824, 34828, 34832, 34836, 34840, 34844, 34848, 34852, 34856, 34860, 34864, 34868, 34872, 34876, 34880, 34884, 34888, 34892, 34896, 34900, 34904, 34908, 34912, 34916, 34920, 34924, 34928, 34932, 34936, 34940, 34944, 34948, 34952, 34956, 34960, 34964, 34968, 34972, 34976, 34980, 34984, 34988, 34992, 34996, 35e3, 35004, 35008, 35012, 35016, 35020, 35024, 35028, 35032, 35036, 35040, 35044, 35048, 35052, 35056, 35060, 35064, 35068, 35072, 35076, 35080, 35084, 35088, 35092, 35096, 35100, 35104, 35108, 35112, 35116, 35120, 35124, 35128, 35132, 35136, 35140, 35144, 35148, 35152, 35156, 35160, 35164, 35168, 35172, 35176, 35180, 35184, 35188, 35192, 35196, 35200, 35204, 35208, 35212, 35216, 35220, 35224, 35228, 35232, 35236, 35240, 35244, 35248, 35252, 35256, 35260, 35264, 35268, 35272, 35276, 35280, 35284, 35288, 35292, 35296, 35300, 35304, 35308, 35312, 35316, 35320, 35324, 35328, 35332, 35336, 35340, 35344, 35348, 35352, 35356, 35360, 35364, 35368, 35372, 35376, 35380, 35384, 35388, 35392, 35396, 35400, 35404, 35408, 35412, 35416, 35420, 35424, 35428, 35432, 35436, 35440, 35444, 35448, 35452, 35456, 35460, 35464, 35468, 35472, 35476, 35480, 35484, 35488, 35492, 35496, 35500, 35504, 35508, 35512, 35516, 35520, 35524, 35528, 35532, 35536, 35540, 35544, 35548, 35552, 35556, 35560, 35564, 35568, 35572, 35576, 35580, 35584, 35588, 35592, 35596, 35600, 35604, 35608, 35612, 35616, 35620, 35624, 35628, 35632, 35636, 35640, 35644, 35648, 35652, 35656, 35660, 35664, 35668, 35672, 35676, 35680, 35684, 35688, 35692, 35696, 35700, 35704, 35708, 35712, 35716, 35720, 35724, 35728, 35732, 35736, 35740, 35744, 35748, 35752, 35756, 35760, 35764, 35768, 35772, 35776, 35780, 35784, 35788, 35792, 35796, 35800, 35804, 35808, 35812, 35816, 35820, 35824, 35828, 35832, 35836, 35840, 35844, 35848, 35852, 35856, 35860, 35864, 35868, 35872, 35876, 35880, 35884, 35888, 35892, 35896, 35900, 35904, 35908, 35912, 35916, 35920, 35924, 35928, 35932, 35936, 35940, 35944, 35948, 35952, 35956, 35960, 35964, 35968, 35972, 35976, 35980, 35984, 35988, 35992, 35996, 36e3, 36004, 36008, 36012, 36016, 36020, 36024, 36028, 36032, 36036, 36040, 36044, 36048, 36052, 36056, 36060, 36064, 36068, 36072, 36076, 36080, 36084, 36088, 36092, 36096, 36100, 36104, 36108, 36112, 36116, 36120, 36124, 36128, 36132, 36136, 36140, 36144, 36148, 36152, 36156, 36160, 36164, 36168, 36172, 36176, 36180, 36184, 36188, 36192, 36196, 36200, 36204, 36208, 36212, 36216, 36220, 36224, 36228, 36232, 36236, 36240, 36244, 36248, 36252, 36256, 36260, 36264, 36268, 36272, 36276, 36280, 36284, 36288, 36292, 36296, 36300, 36304, 36308, 36312, 36316, 36320, 36324, 36328, 36332, 36336, 36340, 36344, 36348, 36352, 36356, 36360, 36364, 36368, 36372, 36376, 36380, 36384, 36388, 36392, 36396, 36400, 36404, 36408, 36412, 36416, 36420, 36424, 36428, 36432, 36436, 36440, 36444, 36448, 36452, 36456, 36460, 36464, 36468, 36472, 36476, 36480, 36484, 36488, 36492, 36496, 36500, 36504, 36508, 36512, 36516, 36520, 36524, 36528, 36532, 36536, 36540, 36544, 36548, 36552, 36556, 36560, 36564, 36568, 36572, 36576, 36580, 36584, 36588, 36592, 36596, 36600, 36604, 36608, 36612, 36616, 36620, 36624, 36628, 36632, 36636, 36640, 36644, 36648, 36652, 36656, 36660, 36664, 36668, 36672, 36676, 36680, 36684, 36688, 36692, 36696, 36700, 36704, 36708, 36712, 36716, 36720, 36724, 36728, 36732, 36736, 36740, 36744, 36748, 36752, 36756, 36760, 36764, 36768, 36772, 36776, 36780, 36784, 36788, 36792, 36796, 36800, 36804, 36808, 36812, 36816, 36820, 36824, 36828, 36832, 36836, 36840, 36844, 36848, 36852, 36856, 36860, 36864, 36868, 36872, 36876, 36880, 36884, 36888, 36892, 36896, 36900, 36904, 36908, 36912, 36916, 36920, 36924, 36928, 36932, 36936, 36940, 36944, 36948, 36952, 36956, 36960, 36964, 36968, 36972, 36976, 36980, 36984, 36988, 36992, 36996, 37e3, 37004, 37008, 37012, 37016, 37020, 37024, 37028, 37032, 37036, 37040, 37044, 37048, 37052, 37056, 37060, 37064, 37068, 37072, 37076, 37080, 37084, 37088, 37092, 37096, 37100, 37104, 37108, 37112, 37116, 37120, 37124, 37128, 37132, 37136, 37140, 37144, 37148, 37152, 37156, 37160, 37164, 37168, 37172, 37176, 37180, 37184, 37188, 37192, 37196, 37200, 37204, 37208, 37212, 37216, 37220, 37224, 37228, 37232, 37236, 37240, 37244, 37248, 37252, 37256, 37260, 37264, 37268, 37272, 37276, 37280, 37284, 37288, 37292, 37296, 37300, 37304, 37308, 37312, 37316, 37320, 37324, 37328, 37332, 37336, 37340, 37344, 37348, 37352, 37356, 37360, 37364, 37368, 37372, 37376, 37380, 37384, 37388, 37392, 37396, 37400, 37404, 37408, 37412, 37416, 37420, 37424, 37428, 37432, 37436, 37440, 37444, 37448, 37452, 37456, 37460, 37464, 37468, 37472, 37476, 37480, 37484, 37488, 37492, 37496, 37500, 37504, 37508, 37512, 37516, 37520, 37524, 37528, 37532, 37536, 37540, 37544, 37548, 37552, 37556, 37560, 37564, 37568, 37572, 37576, 37580, 37584, 37588, 37592, 37596, 37600, 37604, 37608, 37612, 37616, 37620, 37624, 37628, 37632, 37636, 37640, 37644, 37648, 37652, 37656, 37660, 37664, 37668, 37672, 37676, 37680, 37684, 37688, 37692, 37696, 37700, 37704, 37708, 37712, 37716, 37720, 37944, 38336, 38708, 39080, 39688, 40052, 40104, 40108, 40112, 40116, 40120, 40124, 40128, 40132, 40136, 40140, 40144, 40148, 40152, 40156, 40160, 40360, 40544, 40736, 40976, 41224, 42168, 42544, 42808, 42900, 43044, 43324, 43504, 43728, 43908, 44076, 44240, 44552, 44692, 44884, 45104, 45252, 45484, 45604, 45972, 46164, 46364, 46500, 46612, 46792, 47020, 47124, 47232, 47400, 47488, 47700, 47784, 47860, 48108, 140, 260, 352, 760, 1252, 1272, 1300, 1336, 1376, 1404, 1428, 1784, 1808, 1836, 4012, 4276, 4292, 4324, 4404, 4652, 4712, 4804, 4972, 5100, 5204, 5312, 5364, 5588, 5708, 5740, 5768, 5928, 5944, 5960, 5988, 6204, 6704, 7936, 8104, 8736, 9296, 9460, 9620, 9668, 9680, 10092, 10396, 10560, 10636, 10800, 10908, 10996, 11048, 11320, 11428, 11444, 11476, 11504, 11524, 11552, 11704, 13384, 13992, 14116, 14224, 14348, 14812, 14836, 14852, 14884, 14912, 14932, 14968, 14988, 15020, 15056, 15072, 15104, 15124, 15156, 15192, 15204, 15232, 15260, 15284, 15320, 15332, 15364, 15388, 15424, 15436, 15468, 15492, 15528, 15540, 15568, 15596, 15620, 15656, 15672, 15704, 15724, 15760, 15832, 15860, 15932, 15968, 16e3, 16084, 16268, 16312, 16324, 16364, 16384, 16400, 16416, 16432, 16448, 16464, 16480, 16520, 16536, 16548, 16560, 16576, 16604, 16616, 16624, 16632, 16644, 16656, 16672, 16740, 16760, 16780, 16800, 16816, 16832, 16848, 16864, 16880, 16896, 16968, 17004, 17040, 17084, 17100, 17180, 17220, 17348, 17372, 17512, 17616, 17716, 17816, 17924, 18028, 18140, 18252, 18368, 18500, 18716, 18760, 18788, 18852, 18980, 19548, 19616, 19656, 19696, 19736, 19776, 19856, 20680, 20856, 21080, 21100, 21120, 21264, 21292, 21376, 21464, 21492, 22220, 22232, 22292, 22336, 22732, 22812, 23260, 23412, 23464, 23600, 23732, 23800, 23916, 23948, 23960, 23988, 24068, 24148, 24244, 24264, 24288, 24324, 24368, 24448, 24528, 24596, 24612, 24688, 25096, 25108, 25148, 25168, 25204, 25224, 25240, 25256, 25272, 25288, 25304, 25316, 25328, 25352, 25364, 25372, 25384, 25396, 25416, 25432, 25468, 25492, 25528, 25560, 25576, 25612, 25656, 25680, 25716, 25740, 25776, 25816, 25832, 25840, 25848, 25856, 25864, 25872, 25956, 25972, 26032, 26080, 26120, 26172, 26208, 26228, 26244, 26268, 26384, 26400, 26432, 26496, 26532, 26568, 26612, 26632, 26668, 26700, 26720, 26756, 26804, 26848, 26876, 26912, 26932, 27108, 27220, 27384, 27436, 27804, 27956, 27980, 28016, 28196, 28348, 28372, 28408, 28656, 28748, 28764, 28776, 28804, 28884, 28964, 29028, 29048, 29240, 29256, 29356, 29372, 37840, 37980, 37992, 38020, 38088, 38108, 38144, 38176, 38192, 38220, 38252, 38372, 38384, 38412, 38480, 38516, 38548, 38564, 38592, 38624, 38744, 38756, 38784, 38852, 38888, 38920, 38936, 38964, 38996, 39116, 39128, 39156, 39224, 39260, 39292, 39308, 39336, 39368, 39748, 39760, 39788, 39844, 39876, 39900, 39940, 39972, 40192, 40452, 40672, 40852, 40916, 41164, 41384, 42284, 42932, 42984, 43084, 43196, 43216, 43236, 43256, 43268, 43532, 43544, 43556, 43568, 43580, 43592, 43604, 43616, 43628, 43640, 43652, 43660, 43672, 43764, 43832, 43852, 44100, 44128, 44160, 44180, 44268, 44304, 44344, 44364, 44400, 44440, 44480, 44496, 44576, 44588, 44616, 44628, 44732, 44936, 44964, 45192, 45280, 45316, 45356, 45376, 45412, 45428, 45516, 45544, 45632, 45668, 45708, 45728, 45764, 45780, 46e3, 46036, 46064, 46100, 46212, 46288, 46408, 46440, 46552, 46716, 46832, 47044, 47064, 47152, 47172, 47256, 47264, 47276, 47332, 47428, 47516, 47564, 47584, 47600, 47620, 47640, 47936, 48048, 48160, 48180, 48256, 48292, 48372, 48392, 48472, 48508, 48564, 48636, 48668, 48700, 48732, 48840, 48884, 48928 ]);
 for (var i = 0; i < relocations.length; i++) {
  assert(relocations[i] % 4 === 0);
  assert(relocations[i] >= 0 && relocations[i] < eb + 49328);
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
   $8 = HEAP32[1417] | 0;
   $9 = $8 >>> $7;
   $10 = $9 & 3;
   $11 = ($10 | 0) == 0;
   if (!$11) {
    $12 = $9 & 1;
    $13 = $12 ^ 1;
    $14 = $13 + $7 | 0;
    $15 = $14 << 1;
    $16 = 5708 + ($15 << 2) | 0;
    $17 = $16 + 8 | 0;
    $18 = HEAP32[$17 >> 2] | 0;
    $19 = $18 + 8 | 0;
    $20 = HEAP32[$19 >> 2] | 0;
    $21 = ($16 | 0) == ($20 | 0);
    if ($21) {
     $22 = 1 << $14;
     $23 = $22 ^ -1;
     $24 = $8 & $23;
     HEAP32[1417] = $24;
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
   $33 = HEAP32[5676 >> 2] | 0;
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
     $65 = 5708 + ($64 << 2) | 0;
     $66 = $65 + 8 | 0;
     $67 = HEAP32[$66 >> 2] | 0;
     $68 = $67 + 8 | 0;
     $69 = HEAP32[$68 >> 2] | 0;
     $70 = ($65 | 0) == ($69 | 0);
     if ($70) {
      $71 = 1 << $63;
      $72 = $71 ^ -1;
      $73 = $8 & $72;
      HEAP32[1417] = $73;
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
      $84 = HEAP32[5688 >> 2] | 0;
      $85 = $33 >>> 3;
      $86 = $85 << 1;
      $87 = 5708 + ($86 << 2) | 0;
      $88 = 1 << $85;
      $89 = $90 & $88;
      $91 = ($89 | 0) == 0;
      if ($91) {
       $92 = $90 | $88;
       HEAP32[1417] = $92;
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
     HEAP32[5676 >> 2] = $76;
     HEAP32[5688 >> 2] = $79;
     $$0 = $68;
     STACKTOP = sp;
     return $$0 | 0;
    }
    $98 = HEAP32[5672 >> 2] | 0;
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
     $123 = 5972 + ($122 << 2) | 0;
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
        $171 = 5972 + ($170 << 2) | 0;
        $172 = HEAP32[$171 >> 2] | 0;
        $173 = ($$0172$lcssa$i | 0) == ($172 | 0);
        if ($173) {
         HEAP32[$171 >> 2] = $$3$i;
         $cond$i = ($$3$i | 0) == (0 | 0);
         if ($cond$i) {
          $174 = 1 << $170;
          $175 = $174 ^ -1;
          $176 = $98 & $175;
          HEAP32[5672 >> 2] = $176;
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
        $206 = HEAP32[5688 >> 2] | 0;
        $207 = $33 >>> 3;
        $208 = $207 << 1;
        $209 = 5708 + ($208 << 2) | 0;
        $210 = 1 << $207;
        $211 = $8 & $210;
        $212 = ($211 | 0) == 0;
        if ($212) {
         $213 = $8 | $210;
         HEAP32[1417] = $213;
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
       HEAP32[5676 >> 2] = $$0173$lcssa$i;
       HEAP32[5688 >> 2] = $145;
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
    $223 = HEAP32[5672 >> 2] | 0;
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
     $251 = 5972 + ($$0336$i << 2) | 0;
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
       $304 = 5972 + ($303 << 2) | 0;
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
      $318 = HEAP32[5676 >> 2] | 0;
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
         $347 = 5972 + ($346 << 2) | 0;
         $348 = HEAP32[$347 >> 2] | 0;
         $349 = ($$4$lcssa$i | 0) == ($348 | 0);
         if ($349) {
          HEAP32[$347 >> 2] = $$3349$i;
          $cond$i208 = ($$3349$i | 0) == (0 | 0);
          if ($cond$i208) {
           $350 = 1 << $346;
           $351 = $350 ^ -1;
           $352 = $223 & $351;
           HEAP32[5672 >> 2] = $352;
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
          $384 = 5708 + ($383 << 2) | 0;
          $385 = HEAP32[1417] | 0;
          $386 = 1 << $381;
          $387 = $385 & $386;
          $388 = ($387 | 0) == 0;
          if ($388) {
           $389 = $385 | $386;
           HEAP32[1417] = $389;
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
         $420 = 5972 + ($$0339$i << 2) | 0;
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
          HEAP32[5672 >> 2] = $428;
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
 $457 = HEAP32[5676 >> 2] | 0;
 $458 = $457 >>> 0 < $$0192 >>> 0;
 if (!$458) {
  $459 = $457 - $$0192 | 0;
  $460 = HEAP32[5688 >> 2] | 0;
  $461 = $459 >>> 0 > 15;
  if ($461) {
   $462 = $460 + $$0192 | 0;
   HEAP32[5688 >> 2] = $462;
   HEAP32[5676 >> 2] = $459;
   $463 = $459 | 1;
   $464 = $462 + 4 | 0;
   HEAP32[$464 >> 2] = $463;
   $465 = $462 + $459 | 0;
   HEAP32[$465 >> 2] = $459;
   $466 = $$0192 | 3;
   $467 = $460 + 4 | 0;
   HEAP32[$467 >> 2] = $466;
  } else {
   HEAP32[5676 >> 2] = 0;
   HEAP32[5688 >> 2] = 0;
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
 $475 = HEAP32[5680 >> 2] | 0;
 $476 = $475 >>> 0 > $$0192 >>> 0;
 if ($476) {
  $477 = $475 - $$0192 | 0;
  HEAP32[5680 >> 2] = $477;
  $478 = HEAP32[5692 >> 2] | 0;
  $479 = $478 + $$0192 | 0;
  HEAP32[5692 >> 2] = $479;
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
 $485 = HEAP32[1535] | 0;
 $486 = ($485 | 0) == 0;
 if ($486) {
  HEAP32[6148 >> 2] = 4096;
  HEAP32[6144 >> 2] = 4096;
  HEAP32[6152 >> 2] = -1;
  HEAP32[6156 >> 2] = -1;
  HEAP32[6160 >> 2] = 0;
  HEAP32[6112 >> 2] = 0;
  $487 = $1;
  $488 = $487 & -16;
  $489 = $488 ^ 1431655768;
  HEAP32[$1 >> 2] = $489;
  HEAP32[1535] = $489;
  $493 = 4096;
 } else {
  $$pre$i195 = HEAP32[6148 >> 2] | 0;
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
 $497 = HEAP32[6108 >> 2] | 0;
 $498 = ($497 | 0) == 0;
 if (!$498) {
  $499 = HEAP32[6100 >> 2] | 0;
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
 $503 = HEAP32[6112 >> 2] | 0;
 $504 = $503 & 4;
 $505 = ($504 | 0) == 0;
 L167 : do {
  if ($505) {
   $506 = HEAP32[5692 >> 2] | 0;
   $507 = ($506 | 0) == (0 | 0);
   L169 : do {
    if ($507) {
     label = 118;
    } else {
     $$0$i20$i = 6116;
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
      $520 = HEAP32[6144 >> 2] | 0;
      $521 = $520 + -1 | 0;
      $522 = $521 & $519;
      $523 = ($522 | 0) == 0;
      $524 = $521 + $519 | 0;
      $525 = 0 - $520 | 0;
      $526 = $524 & $525;
      $527 = $526 - $519 | 0;
      $528 = $523 ? 0 : $527;
      $$$i = $528 + $495 | 0;
      $529 = HEAP32[6100 >> 2] | 0;
      $530 = $$$i + $529 | 0;
      $531 = $$$i >>> 0 > $$0192 >>> 0;
      $532 = $$$i >>> 0 < 2147483647;
      $or$cond$i = $531 & $532;
      if ($or$cond$i) {
       $533 = HEAP32[6108 >> 2] | 0;
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
     $552 = HEAP32[6148 >> 2] | 0;
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
   $562 = HEAP32[6112 >> 2] | 0;
   $563 = $562 | 4;
   HEAP32[6112 >> 2] = $563;
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
  $577 = HEAP32[6100 >> 2] | 0;
  $578 = $577 + $$723947$i | 0;
  HEAP32[6100 >> 2] = $578;
  $579 = HEAP32[6104 >> 2] | 0;
  $580 = $578 >>> 0 > $579 >>> 0;
  if ($580) {
   HEAP32[6104 >> 2] = $578;
  }
  $581 = HEAP32[5692 >> 2] | 0;
  $582 = ($581 | 0) == (0 | 0);
  do {
   if ($582) {
    $583 = HEAP32[5684 >> 2] | 0;
    $584 = ($583 | 0) == (0 | 0);
    $585 = $$748$i >>> 0 < $583 >>> 0;
    $or$cond12$i = $584 | $585;
    if ($or$cond12$i) {
     HEAP32[5684 >> 2] = $$748$i;
    }
    HEAP32[6116 >> 2] = $$748$i;
    HEAP32[6120 >> 2] = $$723947$i;
    HEAP32[6128 >> 2] = 0;
    $586 = HEAP32[1535] | 0;
    HEAP32[5704 >> 2] = $586;
    HEAP32[5700 >> 2] = -1;
    $$01$i$i = 0;
    while (1) {
     $587 = $$01$i$i << 1;
     $588 = 5708 + ($587 << 2) | 0;
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
    HEAP32[5692 >> 2] = $600;
    HEAP32[5680 >> 2] = $601;
    $602 = $601 | 1;
    $603 = $600 + 4 | 0;
    HEAP32[$603 >> 2] = $602;
    $604 = $600 + $601 | 0;
    $605 = $604 + 4 | 0;
    HEAP32[$605 >> 2] = 40;
    $606 = HEAP32[6156 >> 2] | 0;
    HEAP32[5696 >> 2] = $606;
   } else {
    $$024370$i = 6116;
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
       $622 = HEAP32[5680 >> 2] | 0;
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
       HEAP32[5692 >> 2] = $630;
       HEAP32[5680 >> 2] = $632;
       $633 = $632 | 1;
       $634 = $630 + 4 | 0;
       HEAP32[$634 >> 2] = $633;
       $635 = $630 + $632 | 0;
       $636 = $635 + 4 | 0;
       HEAP32[$636 >> 2] = 40;
       $637 = HEAP32[6156 >> 2] | 0;
       HEAP32[5696 >> 2] = $637;
       break;
      }
     }
    }
    $638 = HEAP32[5684 >> 2] | 0;
    $639 = $$748$i >>> 0 < $638 >>> 0;
    if ($639) {
     HEAP32[5684 >> 2] = $$748$i;
    }
    $640 = $$748$i + $$723947$i | 0;
    $$124469$i = 6116;
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
        $677 = HEAP32[5680 >> 2] | 0;
        $678 = $677 + $673 | 0;
        HEAP32[5680 >> 2] = $678;
        HEAP32[5692 >> 2] = $672;
        $679 = $678 | 1;
        $680 = $672 + 4 | 0;
        HEAP32[$680 >> 2] = $679;
       } else {
        $681 = HEAP32[5688 >> 2] | 0;
        $682 = ($668 | 0) == ($681 | 0);
        if ($682) {
         $683 = HEAP32[5676 >> 2] | 0;
         $684 = $683 + $673 | 0;
         HEAP32[5676 >> 2] = $684;
         HEAP32[5688 >> 2] = $672;
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
            $702 = HEAP32[1417] | 0;
            $703 = $702 & $701;
            HEAP32[1417] = $703;
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
           $730 = 5972 + ($729 << 2) | 0;
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
             $735 = HEAP32[5672 >> 2] | 0;
             $736 = $735 & $734;
             HEAP32[5672 >> 2] = $736;
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
         $763 = 5708 + ($762 << 2) | 0;
         $764 = HEAP32[1417] | 0;
         $765 = 1 << $760;
         $766 = $764 & $765;
         $767 = ($766 | 0) == 0;
         if ($767) {
          $768 = $764 | $765;
          HEAP32[1417] = $768;
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
        $799 = 5972 + ($$0269$i$i << 2) | 0;
        $800 = $672 + 28 | 0;
        HEAP32[$800 >> 2] = $$0269$i$i;
        $801 = $672 + 16 | 0;
        $802 = $801 + 4 | 0;
        HEAP32[$802 >> 2] = 0;
        HEAP32[$801 >> 2] = 0;
        $803 = HEAP32[5672 >> 2] | 0;
        $804 = 1 << $$0269$i$i;
        $805 = $803 & $804;
        $806 = ($805 | 0) == 0;
        if ($806) {
         $807 = $803 | $804;
         HEAP32[5672 >> 2] = $807;
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
    $$0$i$i$i = 6116;
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
    HEAP32[5692 >> 2] = $865;
    HEAP32[5680 >> 2] = $866;
    $867 = $866 | 1;
    $868 = $865 + 4 | 0;
    HEAP32[$868 >> 2] = $867;
    $869 = $865 + $866 | 0;
    $870 = $869 + 4 | 0;
    HEAP32[$870 >> 2] = 40;
    $871 = HEAP32[6156 >> 2] | 0;
    HEAP32[5696 >> 2] = $871;
    $872 = $854 + 4 | 0;
    HEAP32[$872 >> 2] = 27;
    HEAP32[$855 >> 2] = HEAP32[6116 >> 2] | 0;
    HEAP32[$855 + 4 >> 2] = HEAP32[6116 + 4 >> 2] | 0;
    HEAP32[$855 + 8 >> 2] = HEAP32[6116 + 8 >> 2] | 0;
    HEAP32[$855 + 12 >> 2] = HEAP32[6116 + 12 >> 2] | 0;
    HEAP32[6116 >> 2] = $$748$i;
    HEAP32[6120 >> 2] = $$723947$i;
    HEAP32[6128 >> 2] = 0;
    HEAP32[6124 >> 2] = $855;
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
      $888 = 5708 + ($887 << 2) | 0;
      $889 = HEAP32[1417] | 0;
      $890 = 1 << $885;
      $891 = $889 & $890;
      $892 = ($891 | 0) == 0;
      if ($892) {
       $893 = $889 | $890;
       HEAP32[1417] = $893;
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
     $924 = 5972 + ($$0207$i$i << 2) | 0;
     $925 = $581 + 28 | 0;
     HEAP32[$925 >> 2] = $$0207$i$i;
     $926 = $581 + 20 | 0;
     HEAP32[$926 >> 2] = 0;
     HEAP32[$852 >> 2] = 0;
     $927 = HEAP32[5672 >> 2] | 0;
     $928 = 1 << $$0207$i$i;
     $929 = $927 & $928;
     $930 = ($929 | 0) == 0;
     if ($930) {
      $931 = $927 | $928;
      HEAP32[5672 >> 2] = $931;
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
  $960 = HEAP32[5680 >> 2] | 0;
  $961 = $960 >>> 0 > $$0192 >>> 0;
  if ($961) {
   $962 = $960 - $$0192 | 0;
   HEAP32[5680 >> 2] = $962;
   $963 = HEAP32[5692 >> 2] | 0;
   $964 = $963 + $$0192 | 0;
   HEAP32[5692 >> 2] = $964;
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
     lz = ___syscall54(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 10:
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
   case 11:
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
   case 12:
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
   case 13:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = abortOnCannotGrowMemory() | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     continue;
    }
   case 14:
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
   case 15:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = getTotalMemory() | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     continue;
    }
   case 16:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = enlargeMemory() | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     continue;
    }
   case 17:
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
   case 18:
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
     _emscripten_sleep(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 21:
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
   case 22:
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
   case 23:
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
   case 24:
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
   case 25:
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
 $3 = HEAP32[5684 >> 2] | 0;
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
   $17 = HEAP32[5688 >> 2] | 0;
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
    HEAP32[5676 >> 2] = $15;
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
     $28 = HEAP32[1417] | 0;
     $29 = $28 & $27;
     HEAP32[1417] = $29;
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
    $56 = 5972 + ($55 << 2) | 0;
    $57 = HEAP32[$56 >> 2] | 0;
    $58 = ($14 | 0) == ($57 | 0);
    if ($58) {
     HEAP32[$56 >> 2] = $$3;
     $cond374 = ($$3 | 0) == (0 | 0);
     if ($cond374) {
      $59 = 1 << $55;
      $60 = $59 ^ -1;
      $61 = HEAP32[5672 >> 2] | 0;
      $62 = $61 & $60;
      HEAP32[5672 >> 2] = $62;
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
  $94 = HEAP32[5692 >> 2] | 0;
  $95 = ($7 | 0) == ($94 | 0);
  $96 = HEAP32[5688 >> 2] | 0;
  if ($95) {
   $97 = HEAP32[5680 >> 2] | 0;
   $98 = $97 + $$1347 | 0;
   HEAP32[5680 >> 2] = $98;
   HEAP32[5692 >> 2] = $$1;
   $99 = $98 | 1;
   $100 = $$1 + 4 | 0;
   HEAP32[$100 >> 2] = $99;
   $101 = ($$1 | 0) == ($96 | 0);
   if (!$101) {
    return;
   }
   HEAP32[5688 >> 2] = 0;
   HEAP32[5676 >> 2] = 0;
   return;
  }
  $102 = ($7 | 0) == ($96 | 0);
  if ($102) {
   $103 = HEAP32[5676 >> 2] | 0;
   $104 = $103 + $$1347 | 0;
   HEAP32[5676 >> 2] = $104;
   HEAP32[5688 >> 2] = $87;
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
     $119 = HEAP32[1417] | 0;
     $120 = $119 & $118;
     HEAP32[1417] = $120;
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
     $147 = 5972 + ($146 << 2) | 0;
     $148 = HEAP32[$147 >> 2] | 0;
     $149 = ($7 | 0) == ($148 | 0);
     if ($149) {
      HEAP32[$147 >> 2] = $$3365;
      $cond375 = ($$3365 | 0) == (0 | 0);
      if ($cond375) {
       $150 = 1 << $146;
       $151 = $150 ^ -1;
       $152 = HEAP32[5672 >> 2] | 0;
       $153 = $152 & $151;
       HEAP32[5672 >> 2] = $153;
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
  $172 = HEAP32[5688 >> 2] | 0;
  $173 = ($$1 | 0) == ($172 | 0);
  if ($173) {
   HEAP32[5676 >> 2] = $109;
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
  $181 = 5708 + ($180 << 2) | 0;
  $182 = HEAP32[1417] | 0;
  $183 = 1 << $178;
  $184 = $182 & $183;
  $185 = ($184 | 0) == 0;
  if ($185) {
   $186 = $182 | $183;
   HEAP32[1417] = $186;
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
 $217 = 5972 + ($$0361 << 2) | 0;
 $218 = $$1 + 28 | 0;
 HEAP32[$218 >> 2] = $$0361;
 $219 = $$1 + 16 | 0;
 $220 = $$1 + 20 | 0;
 HEAP32[$220 >> 2] = 0;
 HEAP32[$219 >> 2] = 0;
 $221 = HEAP32[5672 >> 2] | 0;
 $222 = 1 << $$0361;
 $223 = $221 & $222;
 $224 = ($223 | 0) == 0;
 do {
  if ($224) {
   $225 = $221 | $222;
   HEAP32[5672 >> 2] = $225;
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
 $253 = HEAP32[5700 >> 2] | 0;
 $254 = $253 + -1 | 0;
 HEAP32[5700 >> 2] = $254;
 $255 = ($254 | 0) == 0;
 if ($255) {
  $$0195$in$i = 6124;
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
 HEAP32[5700 >> 2] = -1;
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
 emterpret(eb + 46680 | 0);
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
 emterpret(eb + 48276 | 0);
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
 emterpret(eb + 48192 | 0);
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
 emterpret(eb + 48308 | 0);
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
 emterpret(eb + 40500 | 0);
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
 emterpret(eb + 20500 | 0);
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
 emterpret(eb + 40316 | 0);
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
 emterpret(eb + 44980 | 0);
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
 emterpret(eb + 49216 | 0);
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
 emterpret(eb + 48520 | 0);
}

function ___stpcpy($0, $1) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 21604 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function _sbrk(increment) {
 increment = increment | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = increment;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 42708 | 0);
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
 emterpret(eb + 45440 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function _llvm_bswap_i32(x) {
 x = x | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = x;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 48740 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function _fflush($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 25884 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function b0(p0) {
 p0 = p0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = p0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 49296 | 0);
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
 emterpret(eb + 48980 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function ___errno_location() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 48484 | 0);
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
 emterpret(eb + 48708 | 0);
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
 emterpret(eb + 25012 | 0);
}

function _match_gr() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 16120 | 0);
}

function _pr_init() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 44648 | 0);
}

function _gr_init() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 43e3 | 0);
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




