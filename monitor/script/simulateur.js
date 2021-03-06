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
STATICTOP = STATIC_BASE + 8160;
__ATINIT__.push({
 func: (function() {
  __GLOBAL__sub_I_simulateur_cpp();
 })
});
allocate([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 244, 1, 0, 0, 148, 17, 0, 0, 244, 1, 0, 0, 238, 2, 0, 0, 244, 1, 0, 0, 26, 4, 0, 0, 232, 3, 0, 0, 26, 4, 0, 0, 232, 3, 0, 0, 26, 4, 0, 0, 208, 7, 0, 0, 26, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 11, 0, 0, 0, 10, 0, 0, 0, 9, 0, 0, 0, 246, 255, 255, 255, 10, 0, 0, 0, 236, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 36, 27, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 224, 27, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 112, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 123, 114, 101, 116, 117, 114, 110, 32, 43, 110, 101, 119, 32, 68, 97, 116, 101, 125, 0, 69, 67, 82, 65, 78, 58, 32, 37, 115, 0, 83, 69, 82, 73, 65, 76, 49, 58, 32, 37, 115, 0, 83, 69, 82, 73, 65, 76, 51, 58, 32, 37, 115, 0, 123, 32, 116, 114, 97, 105, 116, 101, 114, 77, 101, 115, 115, 97, 103, 101, 40, 36, 48, 32, 63, 32, 48, 32, 58, 32, 49, 44, 32, 80, 111, 105, 110, 116, 101, 114, 95, 115, 116, 114, 105, 110, 103, 105, 102, 121, 40, 36, 49, 41, 41, 59, 125, 0, 79, 75, 0, 33, 32, 69, 82, 82, 79, 82, 95, 84, 73, 77, 69, 79, 85, 84, 0, 33, 32, 69, 82, 82, 79, 82, 95, 79, 66, 83, 84, 65, 67, 76, 69, 0, 33, 32, 69, 82, 82, 79, 82, 95, 70, 73, 78, 95, 77, 65, 84, 67, 72, 0, 33, 32, 69, 82, 82, 79, 82, 95, 67, 65, 83, 95, 78, 79, 78, 95, 71, 69, 82, 69, 0, 33, 32, 35, 35, 35, 35, 35, 32, 69, 82, 82, 79, 82, 95, 80, 65, 82, 65, 77, 69, 84, 82, 69, 32, 35, 35, 35, 35, 35, 0, 33, 32, 69, 82, 82, 79, 82, 95, 80, 65, 83, 95, 67, 79, 68, 69, 0, 33, 32, 69, 82, 82, 79, 82, 95, 80, 76, 85, 83, 95, 82, 73, 69, 78, 95, 65, 95, 70, 65, 73, 82, 69, 0, 33, 32, 69, 82, 82, 79, 82, 95, 80, 65, 83, 95, 80, 79, 83, 83, 73, 66, 76, 69, 0, 33, 32, 35, 32, 65, 85, 84, 82, 69, 0, 33, 32, 35, 35, 35, 35, 35, 32, 69, 82, 82, 79, 82, 95, 63, 63, 63, 32, 58, 32, 37, 100, 0, 10, 0, 123, 32, 118, 97, 114, 32, 112, 116, 114, 32, 61, 32, 36, 48, 59, 32, 118, 97, 114, 32, 115, 105, 122, 101, 32, 61, 32, 36, 49, 59, 32, 118, 97, 114, 32, 114, 111, 98, 111, 116, 32, 61, 32, 36, 50, 32, 63, 32, 48, 32, 58, 32, 49, 59, 32, 118, 97, 114, 32, 98, 117, 102, 102, 101, 114, 32, 61, 32, 77, 111, 100, 117, 108, 101, 46, 72, 69, 65, 80, 85, 56, 46, 98, 117, 102, 102, 101, 114, 46, 115, 108, 105, 99, 101, 40, 112, 116, 114, 44, 32, 112, 116, 114, 32, 43, 32, 115, 105, 122, 101, 41, 59, 32, 116, 114, 97, 105, 116, 101, 114, 84, 114, 97, 109, 101, 77, 111, 110, 105, 116, 111, 114, 40, 114, 111, 98, 111, 116, 44, 32, 98, 117, 102, 102, 101, 114, 41, 59, 32, 125, 0, 77, 97, 105, 110, 116, 105, 101, 110, 32, 114, 111, 116, 97, 116, 105, 111, 110, 32, 58, 32, 37, 100, 0, 83, 73, 77, 85, 58, 32, 109, 117, 115, 105, 113, 117, 101, 32, 97, 108, 101, 114, 116, 0, 83, 73, 77, 85, 58, 32, 109, 117, 115, 105, 113, 117, 101, 32, 101, 110, 100, 0, 45, 45, 45, 32, 82, 97, 112, 112, 111, 114, 116, 101, 114, 32, 65, 116, 111, 109, 101, 32, 37, 100, 32, 45, 45, 45, 0, 68, 105, 114, 101, 99, 116, 105, 111, 110, 32, 108, 39, 97, 116, 111, 109, 101, 0, 45, 45, 45, 32, 68, 105, 114, 101, 99, 116, 105, 111, 110, 32, 66, 108, 117, 101, 105, 117, 109, 32, 45, 45, 45, 0, 57, 0, 33, 32, 68, 195, 169, 112, 108, 97, 99, 101, 109, 101, 110, 116, 32, 118, 101, 114, 115, 32, 37, 100, 44, 32, 37, 100, 32, 97, 98, 97, 110, 100, 111, 110, 110, 195, 169, 32, 40, 116, 105, 109, 101, 111, 117, 116, 32, 37, 100, 32, 97, 116, 116, 101, 105, 110, 116, 41, 0, 33, 32, 68, 195, 169, 112, 108, 97, 99, 101, 109, 101, 110, 116, 32, 118, 101, 114, 115, 32, 37, 100, 44, 32, 37, 100, 32, 97, 98, 97, 110, 100, 111, 110, 110, 195, 169, 32, 40, 79, 66, 83, 84, 65, 67, 76, 69, 41, 0, 33, 32, 68, 195, 169, 112, 108, 97, 99, 101, 109, 101, 110, 116, 32, 118, 101, 114, 115, 32, 37, 100, 44, 32, 37, 100, 32, 97, 98, 97, 110, 100, 111, 110, 110, 195, 169, 32, 40, 70, 73, 78, 32, 77, 65, 84, 67, 72, 41, 0, 33, 32, 68, 195, 169, 112, 108, 97, 99, 101, 109, 101, 110, 116, 32, 118, 101, 114, 115, 32, 37, 100, 44, 32, 37, 100, 32, 97, 98, 97, 110, 100, 111, 110, 110, 195, 169, 32, 40, 67, 65, 83, 32, 78, 79, 78, 32, 71, 69, 82, 69, 41, 0, 33, 32, 68, 195, 169, 112, 108, 97, 99, 101, 109, 101, 110, 116, 32, 118, 101, 114, 115, 32, 37, 102, 44, 32, 37, 102, 32, 97, 98, 97, 110, 100, 111, 110, 110, 195, 169, 32, 40, 65, 85, 84, 82, 69, 32, 69, 82, 82, 69, 85, 82, 41, 0, 33, 32, 35, 35, 35, 32, 68, 195, 169, 112, 108, 97, 99, 101, 109, 101, 110, 116, 32, 118, 101, 114, 115, 32, 37, 100, 44, 32, 37, 100, 32, 97, 98, 97, 110, 100, 111, 110, 110, 195, 169, 32, 40, 69, 114, 114, 101, 117, 114, 32, 105, 110, 99, 111, 110, 110, 117, 101, 32, 97, 32, 99, 111, 114, 114, 105, 103, 101, 114, 41, 0, 33, 32, 65, 112, 114, 195, 168, 115, 32, 37, 100, 32, 116, 101, 110, 116, 97, 116, 105, 118, 101, 115, 32, 40, 109, 97, 120, 41, 0, 33, 32, 35, 35, 35, 35, 35, 35, 35, 32, 105, 100, 80, 111, 105, 110, 116, 32, 39, 37, 100, 39, 32, 105, 110, 99, 111, 114, 114, 101, 99, 116, 32, 100, 97, 110, 115, 32, 103, 101, 116, 80, 111, 105, 110, 116, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 50, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 51, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 52, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 53, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 54, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 54, 66, 49, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 54, 66, 50, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 54, 66, 51, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 54, 66, 52, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 55, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 56, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 57, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 48, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 49, 66, 49, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 49, 66, 50, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 49, 66, 51, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 49, 66, 52, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 49, 66, 53, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 49, 66, 54, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 49, 66, 55, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 49, 66, 56, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 49, 66, 57, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 49, 66, 49, 48, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 49, 66, 49, 49, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 49, 66, 49, 50, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 49, 66, 49, 51, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 50, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 51, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 52, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 53, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 54, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 54, 66, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 55, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 56, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 57, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 49, 57, 66, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 50, 48, 66, 49, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 50, 48, 66, 50, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 50, 48, 66, 51, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 50, 48, 66, 52, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 50, 48, 66, 53, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 50, 48, 66, 54, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 50, 48, 66, 55, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 50, 48, 66, 56, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 50, 48, 66, 57, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 80, 50, 48, 66, 49, 48, 0, 33, 32, 35, 35, 35, 35, 35, 35, 35, 35, 35, 32, 69, 82, 82, 69, 85, 82, 32, 58, 32, 80, 111, 105, 110, 116, 32, 39, 37, 100, 39, 32, 115, 97, 110, 115, 32, 115, 116, 114, 97, 116, 195, 169, 103, 105, 101, 0, 68, 195, 169, 116, 111, 117, 114, 46, 46, 46, 0, 33, 32, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 32, 69, 114, 114, 101, 117, 114, 32, 58, 32, 112, 97, 114, 97, 109, 195, 168, 116, 114, 101, 115, 32, 100, 101, 32, 114, 111, 98, 111, 116, 95, 100, 97, 110, 115, 95, 122, 111, 110, 101, 32, 109, 97, 108, 32, 100, 195, 169, 102, 105, 110, 105, 115, 46, 0, 77, 97, 116, 99, 104, 32, 80, 82, 10, 10, 0, 80, 114, 101, 116, 10, 0, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 0, 74, 117, 110, 32, 49, 53, 32, 50, 48, 49, 57, 0, 50, 50, 58, 53, 53, 58, 52, 52, 0, 3, 5, 4, 6, 6, 13, 83, 111, 114, 116, 32, 100, 101, 32, 108, 97, 32, 122, 111, 110, 101, 32, 100, 101, 32, 100, 195, 169, 112, 97, 114, 116, 0, 61, 61, 61, 32, 84, 111, 117, 116, 32, 101, 115, 116, 32, 102, 97, 105, 116, 32, 33, 32, 61, 61, 61, 0, 80, 82, 32, 110, 101, 32, 112, 101, 117, 116, 32, 112, 97, 115, 32, 102, 97, 105, 114, 101, 32, 108, 39, 97, 99, 116, 105, 111, 110, 32, 37, 100, 0, 35, 35, 32, 80, 114, 111, 103, 114, 97, 109, 109, 101, 114, 32, 108, 97, 32, 115, 117, 105, 116, 101, 32, 35, 35, 0, 79, 110, 32, 115, 116, 111, 112, 32, 108, 101, 115, 32, 109, 111, 116, 101, 117, 114, 115, 0, 49, 46, 32, 80, 111, 115, 105, 116, 105, 111, 110, 110, 101, 114, 10, 0, 50, 46, 32, 74, 97, 99, 107, 32, 105, 110, 10, 0, 51, 46, 32, 66, 65, 85, 32, 111, 102, 102, 10, 0, 67, 111, 117, 108, 101, 117, 114, 32, 58, 32, 74, 65, 85, 78, 69, 10, 0, 67, 111, 117, 108, 101, 117, 114, 32, 58, 32, 86, 73, 79, 76, 69, 84, 10, 0, 10, 10, 0, 52, 46, 32, 74, 97, 99, 107, 32, 111, 117, 116, 10, 10, 0, 80, 114, 101, 116, 10, 10, 0, 77, 97, 116, 99, 104, 32, 71, 82, 10, 0, 73, 110, 105, 116, 105, 97, 108, 105, 115, 97, 116, 105, 111, 110, 46, 46, 46, 0, 32, 79, 107, 10, 0, 61, 61, 61, 32, 80, 104, 97, 115, 101, 32, 49, 32, 61, 61, 61, 0, 33, 32, 35, 35, 35, 35, 32, 66, 79, 85, 67, 76, 69, 32, 73, 78, 70, 73, 78, 73, 69, 32, 63, 32, 35, 35, 35, 0, 61, 61, 61, 32, 40, 49, 41, 32, 79, 110, 32, 98, 111, 117, 99, 108, 101, 32, 61, 61, 61, 0, 61, 61, 61, 32, 80, 104, 97, 115, 101, 32, 50, 32, 61, 61, 61, 0, 61, 61, 61, 32, 40, 50, 41, 32, 79, 110, 32, 98, 111, 117, 99, 108, 101, 32, 61, 61, 61, 0, 71, 82, 32, 110, 101, 32, 112, 101, 117, 116, 32, 112, 97, 115, 32, 102, 97, 105, 114, 101, 32, 108, 39, 97, 99, 116, 105, 111, 110, 32, 37, 100, 0, 45, 45, 45, 32, 68, 101, 103, 97, 103, 101, 109, 101, 110, 116, 32, 45, 45, 45, 0, 66, 105, 101, 110, 32, 97, 114, 114, 105, 118, 195, 169, 32, 112, 114, 111, 99, 104, 101, 32, 100, 101, 32, 108, 39, 65, 68, 80, 0, 45, 45, 45, 32, 69, 120, 116, 114, 97, 105, 114, 101, 32, 71, 100, 32, 45, 45, 45, 0, 68, 111, 115, 32, 97, 117, 32, 109, 117, 114, 0, 45, 45, 45, 32, 68, 105, 115, 116, 114, 105, 98, 117, 116, 101, 117, 114, 32, 37, 100, 32, 45, 45, 45, 0, 79, 110, 32, 114, 101, 99, 117, 108, 101, 32, 108, 101, 110, 116, 101, 109, 101, 110, 116, 0, 45, 45, 45, 32, 65, 99, 116, 105, 118, 101, 114, 32, 101, 120, 112, 195, 169, 114, 105, 101, 110, 99, 101, 32, 45, 45, 45, 0, 45, 45, 45, 32, 65, 99, 116, 105, 118, 101, 114, 32, 65, 68, 80, 32, 45, 45, 45, 0, 46, 46, 46, 32, 69, 115, 115, 97, 105, 32, 37, 100, 32, 46, 46, 46, 0, 33, 32, 79, 110, 32, 115, 116, 111, 112, 112, 101, 32, 108, 101, 115, 32, 109, 111, 116, 101, 117, 114, 115, 0, 73, 110, 105, 116, 105, 97, 108, 105, 115, 97, 116, 105, 111, 110, 32, 100, 101, 115, 32, 115, 101, 114, 118, 111, 115, 0, 65, 68, 80, 32, 116, 114, 97, 110, 115, 108, 32, 58, 32, 0, 86, 101, 114, 115, 32, 74, 97, 117, 110, 101, 0, 86, 101, 114, 115, 32, 86, 105, 111, 108, 101, 116, 0, 78, 101, 117, 116, 114, 101, 0, 37, 100, 0, 65, 68, 80, 32, 100, 101, 112, 108, 32, 58, 32, 0, 76, 101, 118, 101, 114, 0, 71, 111, 108, 100, 101, 110, 105, 117, 109, 0, 66, 97, 105, 115, 115, 101, 114, 0, 66, 68, 70, 32, 58, 32, 0, 82, 97, 110, 103, 101, 114, 0, 83, 117, 114, 32, 112, 97, 108, 101, 116, 0, 70, 97, 105, 114, 101, 32, 116, 111, 109, 98, 101, 114, 0, 84, 65, 32, 58, 32, 0, 68, 101, 99, 104, 97, 114, 103, 101, 114, 0, 80, 111, 115, 105, 116, 105, 111, 110, 110, 101, 109, 101, 110, 116, 32, 100, 117, 32, 98, 114, 97, 115, 32, 58, 32, 0, 73, 110, 105, 116, 0, 76, 101, 118, 195, 169, 0, 73, 110, 116, 101, 114, 114, 117, 112, 116, 101, 117, 114, 0, 70, 105, 110, 32, 100, 117, 32, 109, 97, 116, 99, 104, 44, 32, 112, 114, 111, 99, 101, 100, 117, 114, 101, 32, 97, 114, 114, 101, 116, 0, 35, 70, 105, 110, 80, 114, 111, 103, 114, 97, 109, 109, 101, 0, 35, 68, 101, 98, 117, 116, 68, 117, 77, 97, 116, 99, 104, 10, 0, 65, 116, 116, 101, 110, 116, 101, 32, 102, 105, 110, 32, 100, 117, 32, 109, 97, 116, 99, 104, 32, 40, 114, 101, 115, 116, 101, 32, 37, 100, 32, 109, 115, 41, 0, 61, 37, 100, 0, 108, 101, 100, 77, 97, 116, 114, 105, 120, 58, 32, 83, 99, 111, 114, 101, 32, 61, 32, 37, 100, 0, 43, 37, 100, 0, 45, 37, 100, 0, 108, 101, 100, 77, 97, 116, 114, 105, 120, 58, 32, 83, 99, 111, 114, 101, 32, 43, 61, 32, 37, 100, 0, 33, 0, 17, 0, 10, 0, 17, 17, 17, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 15, 10, 17, 17, 17, 3, 10, 7, 0, 1, 19, 9, 11, 11, 0, 0, 9, 6, 11, 0, 0, 11, 0, 6, 17, 0, 0, 0, 17, 17, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 10, 10, 17, 17, 17, 0, 10, 0, 0, 2, 0, 9, 11, 0, 0, 0, 9, 0, 11, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 12, 0, 0, 0, 0, 9, 12, 0, 0, 0, 0, 0, 12, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 0, 0, 0, 4, 13, 0, 0, 0, 0, 9, 14, 0, 0, 0, 0, 0, 14, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 15, 0, 0, 0, 0, 9, 16, 0, 0, 0, 0, 0, 16, 0, 0, 16, 0, 0, 18, 0, 0, 0, 18, 18, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 18, 18, 18, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 10, 0, 0, 0, 0, 9, 11, 0, 0, 0, 0, 0, 11, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 12, 0, 0, 0, 0, 9, 12, 0, 0, 0, 0, 0, 12, 0, 0, 12, 0, 0, 45, 43, 32, 32, 32, 48, 88, 48, 120, 0, 40, 110, 117, 108, 108, 41, 0, 45, 48, 88, 43, 48, 88, 32, 48, 88, 45, 48, 120, 43, 48, 120, 32, 48, 120, 0, 105, 110, 102, 0, 73, 78, 70, 0, 110, 97, 110, 0, 78, 65, 78, 0, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 46, 0, 84, 33, 34, 25, 13, 1, 2, 3, 17, 75, 28, 12, 16, 4, 11, 29, 18, 30, 39, 104, 110, 111, 112, 113, 98, 32, 5, 6, 15, 19, 20, 21, 26, 8, 22, 7, 40, 36, 23, 24, 9, 10, 14, 27, 31, 37, 35, 131, 130, 125, 38, 42, 43, 60, 61, 62, 63, 67, 71, 74, 77, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 99, 100, 101, 102, 103, 105, 106, 107, 108, 114, 115, 116, 121, 122, 123, 124, 0, 73, 108, 108, 101, 103, 97, 108, 32, 98, 121, 116, 101, 32, 115, 101, 113, 117, 101, 110, 99, 101, 0, 68, 111, 109, 97, 105, 110, 32, 101, 114, 114, 111, 114, 0, 82, 101, 115, 117, 108, 116, 32, 110, 111, 116, 32, 114, 101, 112, 114, 101, 115, 101, 110, 116, 97, 98, 108, 101, 0, 78, 111, 116, 32, 97, 32, 116, 116, 121, 0, 80, 101, 114, 109, 105, 115, 115, 105, 111, 110, 32, 100, 101, 110, 105, 101, 100, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 110, 111, 116, 32, 112, 101, 114, 109, 105, 116, 116, 101, 100, 0, 78, 111, 32, 115, 117, 99, 104, 32, 102, 105, 108, 101, 32, 111, 114, 32, 100, 105, 114, 101, 99, 116, 111, 114, 121, 0, 78, 111, 32, 115, 117, 99, 104, 32, 112, 114, 111, 99, 101, 115, 115, 0, 70, 105, 108, 101, 32, 101, 120, 105, 115, 116, 115, 0, 86, 97, 108, 117, 101, 32, 116, 111, 111, 32, 108, 97, 114, 103, 101, 32, 102, 111, 114, 32, 100, 97, 116, 97, 32, 116, 121, 112, 101, 0, 78, 111, 32, 115, 112, 97, 99, 101, 32, 108, 101, 102, 116, 32, 111, 110, 32, 100, 101, 118, 105, 99, 101, 0, 79, 117, 116, 32, 111, 102, 32, 109, 101, 109, 111, 114, 121, 0, 82, 101, 115, 111, 117, 114, 99, 101, 32, 98, 117, 115, 121, 0, 73, 110, 116, 101, 114, 114, 117, 112, 116, 101, 100, 32, 115, 121, 115, 116, 101, 109, 32, 99, 97, 108, 108, 0, 82, 101, 115, 111, 117, 114, 99, 101, 32, 116, 101, 109, 112, 111, 114, 97, 114, 105, 108, 121, 32, 117, 110, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 73, 110, 118, 97, 108, 105, 100, 32, 115, 101, 101, 107, 0, 67, 114, 111, 115, 115, 45, 100, 101, 118, 105, 99, 101, 32, 108, 105, 110, 107, 0, 82, 101, 97, 100, 45, 111, 110, 108, 121, 32, 102, 105, 108, 101, 32, 115, 121, 115, 116, 101, 109, 0, 68, 105, 114, 101, 99, 116, 111, 114, 121, 32, 110, 111, 116, 32, 101, 109, 112, 116, 121, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 115, 101, 116, 32, 98, 121, 32, 112, 101, 101, 114, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 116, 105, 109, 101, 100, 32, 111, 117, 116, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 102, 117, 115, 101, 100, 0, 72, 111, 115, 116, 32, 105, 115, 32, 100, 111, 119, 110, 0, 72, 111, 115, 116, 32, 105, 115, 32, 117, 110, 114, 101, 97, 99, 104, 97, 98, 108, 101, 0, 65, 100, 100, 114, 101, 115, 115, 32, 105, 110, 32, 117, 115, 101, 0, 66, 114, 111, 107, 101, 110, 32, 112, 105, 112, 101, 0, 73, 47, 79, 32, 101, 114, 114, 111, 114, 0, 78, 111, 32, 115, 117, 99, 104, 32, 100, 101, 118, 105, 99, 101, 32, 111, 114, 32, 97, 100, 100, 114, 101, 115, 115, 0, 66, 108, 111, 99, 107, 32, 100, 101, 118, 105, 99, 101, 32, 114, 101, 113, 117, 105, 114, 101, 100, 0, 78, 111, 32, 115, 117, 99, 104, 32, 100, 101, 118, 105, 99, 101, 0, 78, 111, 116, 32, 97, 32, 100, 105, 114, 101, 99, 116, 111, 114, 121, 0, 73, 115, 32, 97, 32, 100, 105, 114, 101, 99, 116, 111, 114, 121, 0, 84, 101, 120, 116, 32, 102, 105, 108, 101, 32, 98, 117, 115, 121, 0, 69, 120, 101, 99, 32, 102, 111, 114, 109, 97, 116, 32, 101, 114, 114, 111, 114, 0, 73, 110, 118, 97, 108, 105, 100, 32, 97, 114, 103, 117, 109, 101, 110, 116, 0, 65, 114, 103, 117, 109, 101, 110, 116, 32, 108, 105, 115, 116, 32, 116, 111, 111, 32, 108, 111, 110, 103, 0, 83, 121, 109, 98, 111, 108, 105, 99, 32, 108, 105, 110, 107, 32, 108, 111, 111, 112, 0, 70, 105, 108, 101, 110, 97, 109, 101, 32, 116, 111, 111, 32, 108, 111, 110, 103, 0, 84, 111, 111, 32, 109, 97, 110, 121, 32, 111, 112, 101, 110, 32, 102, 105, 108, 101, 115, 32, 105, 110, 32, 115, 121, 115, 116, 101, 109, 0, 78, 111, 32, 102, 105, 108, 101, 32, 100, 101, 115, 99, 114, 105, 112, 116, 111, 114, 115, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 66, 97, 100, 32, 102, 105, 108, 101, 32, 100, 101, 115, 99, 114, 105, 112, 116, 111, 114, 0, 78, 111, 32, 99, 104, 105, 108, 100, 32, 112, 114, 111, 99, 101, 115, 115, 0, 66, 97, 100, 32, 97, 100, 100, 114, 101, 115, 115, 0, 70, 105, 108, 101, 32, 116, 111, 111, 32, 108, 97, 114, 103, 101, 0, 84, 111, 111, 32, 109, 97, 110, 121, 32, 108, 105, 110, 107, 115, 0, 78, 111, 32, 108, 111, 99, 107, 115, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 82, 101, 115, 111, 117, 114, 99, 101, 32, 100, 101, 97, 100, 108, 111, 99, 107, 32, 119, 111, 117, 108, 100, 32, 111, 99, 99, 117, 114, 0, 83, 116, 97, 116, 101, 32, 110, 111, 116, 32, 114, 101, 99, 111, 118, 101, 114, 97, 98, 108, 101, 0, 80, 114, 101, 118, 105, 111, 117, 115, 32, 111, 119, 110, 101, 114, 32, 100, 105, 101, 100, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 99, 97, 110, 99, 101, 108, 101, 100, 0, 70, 117, 110, 99, 116, 105, 111, 110, 32, 110, 111, 116, 32, 105, 109, 112, 108, 101, 109, 101, 110, 116, 101, 100, 0, 78, 111, 32, 109, 101, 115, 115, 97, 103, 101, 32, 111, 102, 32, 100, 101, 115, 105, 114, 101, 100, 32, 116, 121, 112, 101, 0, 73, 100, 101, 110, 116, 105, 102, 105, 101, 114, 32, 114, 101, 109, 111, 118, 101, 100, 0, 68, 101, 118, 105, 99, 101, 32, 110, 111, 116, 32, 97, 32, 115, 116, 114, 101, 97, 109, 0, 78, 111, 32, 100, 97, 116, 97, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 68, 101, 118, 105, 99, 101, 32, 116, 105, 109, 101, 111, 117, 116, 0, 79, 117, 116, 32, 111, 102, 32, 115, 116, 114, 101, 97, 109, 115, 32, 114, 101, 115, 111, 117, 114, 99, 101, 115, 0, 76, 105, 110, 107, 32, 104, 97, 115, 32, 98, 101, 101, 110, 32, 115, 101, 118, 101, 114, 101, 100, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 101, 114, 114, 111, 114, 0, 66, 97, 100, 32, 109, 101, 115, 115, 97, 103, 101, 0, 70, 105, 108, 101, 32, 100, 101, 115, 99, 114, 105, 112, 116, 111, 114, 32, 105, 110, 32, 98, 97, 100, 32, 115, 116, 97, 116, 101, 0, 78, 111, 116, 32, 97, 32, 115, 111, 99, 107, 101, 116, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 97, 100, 100, 114, 101, 115, 115, 32, 114, 101, 113, 117, 105, 114, 101, 100, 0, 77, 101, 115, 115, 97, 103, 101, 32, 116, 111, 111, 32, 108, 97, 114, 103, 101, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 119, 114, 111, 110, 103, 32, 116, 121, 112, 101, 32, 102, 111, 114, 32, 115, 111, 99, 107, 101, 116, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 110, 111, 116, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 83, 111, 99, 107, 101, 116, 32, 116, 121, 112, 101, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 78, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 102, 97, 109, 105, 108, 121, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 65, 100, 100, 114, 101, 115, 115, 32, 102, 97, 109, 105, 108, 121, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 32, 98, 121, 32, 112, 114, 111, 116, 111, 99, 111, 108, 0, 65, 100, 100, 114, 101, 115, 115, 32, 110, 111, 116, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 78, 101, 116, 119, 111, 114, 107, 32, 105, 115, 32, 100, 111, 119, 110, 0, 78, 101, 116, 119, 111, 114, 107, 32, 117, 110, 114, 101, 97, 99, 104, 97, 98, 108, 101, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 115, 101, 116, 32, 98, 121, 32, 110, 101, 116, 119, 111, 114, 107, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 97, 98, 111, 114, 116, 101, 100, 0, 78, 111, 32, 98, 117, 102, 102, 101, 114, 32, 115, 112, 97, 99, 101, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 83, 111, 99, 107, 101, 116, 32, 105, 115, 32, 99, 111, 110, 110, 101, 99, 116, 101, 100, 0, 83, 111, 99, 107, 101, 116, 32, 110, 111, 116, 32, 99, 111, 110, 110, 101, 99, 116, 101, 100, 0, 67, 97, 110, 110, 111, 116, 32, 115, 101, 110, 100, 32, 97, 102, 116, 101, 114, 32, 115, 111, 99, 107, 101, 116, 32, 115, 104, 117, 116, 100, 111, 119, 110, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 97, 108, 114, 101, 97, 100, 121, 32, 105, 110, 32, 112, 114, 111, 103, 114, 101, 115, 115, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 105, 110, 32, 112, 114, 111, 103, 114, 101, 115, 115, 0, 83, 116, 97, 108, 101, 32, 102, 105, 108, 101, 32, 104, 97, 110, 100, 108, 101, 0, 82, 101, 109, 111, 116, 101, 32, 73, 47, 79, 32, 101, 114, 114, 111, 114, 0, 81, 117, 111, 116, 97, 32, 101, 120, 99, 101, 101, 100, 101, 100, 0, 78, 111, 32, 109, 101, 100, 105, 117, 109, 32, 102, 111, 117, 110, 100, 0, 87, 114, 111, 110, 103, 32, 109, 101, 100, 105, 117, 109, 32, 116, 121, 112, 101, 0, 78, 111, 32, 101, 114, 114, 111, 114, 32, 105, 110, 102, 111, 114, 109, 97, 116, 105, 111, 110, 0, 0 ], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
var tempDoublePtr = STATICTOP;
STATICTOP += 16;
assert(tempDoublePtr % 8 == 0);
var EMTSTACKTOP = getMemory(1048576);
var EMT_STACK_MAX = EMTSTACKTOP + 1048576;
var eb = getMemory(73960);
assert(eb % 8 === 0);
__ATPRERUN__.push((function() {
 HEAPU8.set([ 140, 5, 135, 1, 0, 0, 0, 0, 2, 200, 0, 0, 0, 1, 0, 0, 2, 201, 0, 0, 0, 6, 0, 0, 2, 202, 0, 0, 128, 48, 0, 0, 1, 203, 0, 0, 143, 203, 133, 1, 136, 204, 0, 0, 0, 203, 204, 0, 143, 203, 134, 1, 136, 203, 0, 0, 1, 204, 176, 1, 3, 203, 203, 204, 137, 203, 0, 0, 130, 203, 0, 0, 136, 204, 0, 0, 49, 203, 203, 204, 96, 0, 0, 0, 1, 204, 176, 1, 135, 203, 0, 0, 204, 0, 0, 0, 1, 15, 0, 0, 1, 26, 0, 0, 1, 203, 255, 0, 19, 203, 0, 203, 1, 204, 41, 0, 1, 206, 80, 0, 138, 203, 204, 206, 192, 1, 0, 0, 100, 2, 0, 0, 12, 3, 0, 0, 188, 1, 0, 0, 184, 3, 0, 0, 132, 4, 0, 0, 116, 5, 0, 0, 64, 6, 0, 0, 188, 1, 0, 0, 48, 7, 0, 0, 36, 8, 0, 0, 56, 9, 0, 0, 188, 1, 0, 0, 188, 1, 0, 0, 188, 1, 0, 0, 188, 1, 0, 0, 76, 10, 0, 0, 248, 10, 0, 0, 188, 1, 0, 0, 200, 11, 0, 0, 188, 1, 0, 0, 152, 12, 0, 0, 188, 1, 0, 0, 188, 1, 0, 0, 136, 13, 0, 0, 112, 14, 0, 0, 48, 15, 0, 0, 244, 15, 0, 0, 184, 16, 0, 0, 124, 17, 0, 0, 64, 18, 0, 0, 4, 19, 0, 0, 200, 19, 0, 0, 140, 20, 0, 0, 80, 21, 0, 0, 20, 22, 0, 0, 216, 22, 0, 0, 188, 1, 0, 0, 188, 1, 0, 0, 188, 1, 0, 0, 188, 1, 0, 0, 188, 1, 0, 0, 188, 1, 0, 0, 188, 1, 0, 0, 188, 1, 0, 0, 188, 1, 0, 0, 188, 1, 0, 0, 188, 1, 0, 0, 188, 1, 0, 0, 188, 1, 0, 0, 188, 1, 0, 0, 156, 23, 0, 0, 188, 1, 0, 0, 128, 24, 0, 0, 188, 1, 0, 0, 100, 25, 0, 0, 188, 1, 0, 0, 72, 26, 0, 0, 44, 27, 0, 0, 188, 1, 0, 0, 188, 1, 0, 0, 44, 28, 0, 0, 188, 1, 0, 0, 64, 29, 0, 0, 188, 1, 0, 0, 92, 30, 0, 0, 124, 31, 0, 0, 188, 1, 0, 0, 156, 32, 0, 0, 188, 1, 0, 0, 188, 33, 0, 0, 188, 34, 0, 0, 188, 35, 0, 0, 188, 36, 0, 0, 220, 37, 0, 0, 28, 39, 0, 0, 92, 40, 0, 0, 156, 41, 0, 0, 220, 42, 0, 0, 28, 44, 0, 0, 119, 0, 232, 10, 1, 205, 91, 6, 141, 206, 134, 1, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 204, 62, 56, 134, 98, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 98, 3, 0, 1, 15, 1, 0, 119, 0, 220, 10, 1, 15, 0, 0, 1, 204, 64, 0, 134, 109, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 109, 3, 0, 1, 37, 98, 0, 119, 0, 212, 10, 1, 204, 128, 0, 134, 120, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 120, 3, 0, 1, 37, 94, 0, 119, 0, 205, 10, 134, 131, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 131, 3, 0, 1, 37, 50, 0, 119, 0, 199, 10, 134, 142, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 142, 3, 0, 1, 37, 106, 0, 119, 0, 193, 10, 1, 26, 1, 0, 119, 0, 191, 10, 1, 206, 106, 6, 141, 205, 134, 1, 25, 205, 205, 8, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 204, 62, 56, 134, 153, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 153, 3, 0, 1, 15, 1, 0, 119, 0, 178, 10, 1, 15, 0, 0, 1, 204, 64, 0, 134, 164, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 164, 3, 0, 1, 37, 98, 0, 119, 0, 170, 10, 1, 204, 128, 0, 134, 175, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 175, 3, 0, 1, 37, 94, 0, 119, 0, 163, 10, 134, 186, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 186, 3, 0, 1, 37, 50, 0, 119, 0, 157, 10, 134, 197, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 197, 3, 0, 1, 37, 106, 0, 119, 0, 151, 10, 1, 26, 1, 0, 119, 0, 149, 10, 1, 205, 121, 6, 141, 206, 134, 1, 25, 206, 206, 16, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 206, 62, 56, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 8, 1, 141, 204, 8, 1, 121, 204, 3, 0, 1, 15, 1, 0, 119, 0, 134, 10, 1, 15, 0, 0, 1, 206, 192, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 19, 1, 141, 204, 19, 1, 121, 204, 3, 0, 1, 37, 57, 0, 119, 0, 124, 10, 134, 204, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 143, 204, 30, 1, 141, 204, 30, 1, 121, 204, 3, 0, 1, 37, 50, 0, 119, 0, 116, 10, 134, 204, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 143, 204, 41, 1, 141, 204, 41, 1, 121, 204, 3, 0, 1, 37, 106, 0, 119, 0, 108, 10, 1, 26, 1, 0, 119, 0, 106, 10, 1, 206, 136, 6, 141, 205, 134, 1, 25, 205, 205, 24, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 205, 110, 8, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 52, 1, 141, 204, 52, 1, 121, 204, 3, 0, 1, 15, 1, 0, 119, 0, 91, 10, 1, 15, 0, 0, 1, 205, 16, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 59, 1, 141, 204, 59, 1, 121, 204, 3, 0, 1, 37, 46, 0, 119, 0, 81, 10, 134, 204, 0, 0, 68, 132, 0, 0, 202, 0, 0, 0, 143, 204, 64, 1, 141, 204, 64, 1, 121, 204, 3, 0, 1, 37, 99, 0, 119, 0, 73, 10, 134, 204, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 143, 204, 66, 1, 141, 204, 66, 1, 121, 204, 3, 0, 1, 37, 50, 0, 119, 0, 65, 10, 134, 204, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 143, 204, 69, 1, 141, 204, 69, 1, 121, 204, 3, 0, 1, 37, 106, 0, 119, 0, 57, 10, 1, 26, 1, 0, 119, 0, 55, 10, 1, 205, 151, 6, 141, 206, 134, 1, 25, 206, 206, 32, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 206, 30, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 70, 1, 141, 204, 70, 1, 121, 204, 3, 0, 1, 15, 1, 0, 119, 0, 40, 10, 1, 15, 0, 0, 1, 206, 32, 8, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 71, 1, 141, 204, 71, 1, 121, 204, 3, 0, 1, 37, 45, 0, 119, 0, 30, 10, 1, 206, 64, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 72, 1, 141, 204, 72, 1, 121, 204, 3, 0, 1, 37, 47, 0, 119, 0, 21, 10, 134, 204, 0, 0, 68, 132, 0, 0, 202, 0, 0, 0, 143, 204, 73, 1, 141, 204, 73, 1, 121, 204, 3, 0, 1, 37, 99, 0, 119, 0, 13, 10, 134, 204, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 143, 204, 74, 1, 141, 204, 74, 1, 121, 204, 3, 0, 1, 37, 50, 0, 119, 0, 5, 10, 134, 204, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 143, 204, 75, 1, 141, 204, 75, 1, 121, 204, 3, 0, 1, 37, 106, 0, 119, 0, 253, 9, 1, 26, 1, 0, 119, 0, 251, 9, 1, 206, 166, 6, 141, 205, 134, 1, 25, 205, 205, 40, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 205, 94, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 76, 1, 141, 204, 76, 1, 121, 204, 3, 0, 1, 15, 1, 0, 119, 0, 236, 9, 1, 15, 0, 0, 1, 205, 32, 8, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 77, 1, 141, 204, 77, 1, 121, 204, 3, 0, 1, 37, 45, 0, 119, 0, 226, 9, 134, 204, 0, 0, 68, 132, 0, 0, 202, 0, 0, 0, 143, 204, 78, 1, 141, 204, 78, 1, 121, 204, 3, 0, 1, 37, 99, 0, 119, 0, 218, 9, 134, 204, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 143, 204, 79, 1, 141, 204, 79, 1, 121, 204, 3, 0, 1, 37, 50, 0, 119, 0, 210, 9, 134, 204, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 143, 204, 80, 1, 141, 204, 80, 1, 121, 204, 3, 0, 1, 37, 106, 0, 119, 0, 202, 9, 1, 26, 1, 0, 119, 0, 200, 9, 1, 205, 181, 6, 141, 206, 134, 1, 25, 206, 206, 48, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 206, 24, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 81, 1, 141, 204, 81, 1, 121, 204, 3, 0, 1, 15, 1, 0, 119, 0, 185, 9, 1, 15, 0, 0, 1, 206, 70, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 83, 1, 141, 204, 83, 1, 121, 204, 3, 0, 1, 37, 47, 0, 119, 0, 175, 9, 1, 206, 32, 8, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 84, 1, 141, 204, 84, 1, 121, 204, 3, 0, 1, 37, 45, 0, 119, 0, 166, 9, 134, 204, 0, 0, 68, 132, 0, 0, 202, 0, 0, 0, 143, 204, 85, 1, 141, 204, 85, 1, 121, 204, 3, 0, 1, 37, 99, 0, 119, 0, 158, 9, 134, 204, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 143, 204, 86, 1, 141, 204, 86, 1, 121, 204, 3, 0, 1, 37, 50, 0, 119, 0, 150, 9, 134, 204, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 143, 204, 87, 1, 141, 204, 87, 1, 121, 204, 3, 0, 1, 37, 106, 0, 119, 0, 142, 9, 1, 26, 1, 0, 119, 0, 140, 9, 1, 206, 198, 6, 141, 205, 134, 1, 25, 205, 205, 56, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 205, 24, 1, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 88, 1, 141, 204, 88, 1, 121, 204, 3, 0, 1, 15, 1, 0, 119, 0, 125, 9, 1, 15, 0, 0, 1, 205, 6, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 89, 1, 141, 204, 89, 1, 121, 204, 3, 0, 1, 37, 46, 0, 119, 0, 115, 9, 1, 205, 32, 8, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 90, 1, 141, 204, 90, 1, 121, 204, 3, 0, 1, 37, 45, 0, 119, 0, 106, 9, 1, 205, 64, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 91, 1, 141, 204, 91, 1, 121, 204, 3, 0, 1, 37, 47, 0, 119, 0, 97, 9, 134, 204, 0, 0, 68, 132, 0, 0, 202, 0, 0, 0, 143, 204, 92, 1, 141, 204, 92, 1, 121, 204, 3, 0, 1, 37, 99, 0, 119, 0, 89, 9, 134, 204, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 143, 204, 93, 1, 141, 204, 93, 1, 121, 204, 3, 0, 1, 37, 106, 0, 119, 0, 81, 9, 1, 26, 1, 0, 119, 0, 79, 9, 1, 205, 215, 6, 141, 206, 134, 1, 25, 206, 206, 64, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 206, 24, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 94, 1, 141, 204, 94, 1, 121, 204, 3, 0, 1, 15, 1, 0, 119, 0, 64, 9, 1, 15, 0, 0, 1, 206, 6, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 95, 1, 141, 204, 95, 1, 121, 204, 3, 0, 1, 37, 46, 0, 119, 0, 54, 9, 1, 206, 32, 8, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 96, 1, 141, 204, 96, 1, 121, 204, 3, 0, 1, 37, 45, 0, 119, 0, 45, 9, 1, 206, 64, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 97, 1, 141, 204, 97, 1, 121, 204, 3, 0, 1, 37, 47, 0, 119, 0, 36, 9, 134, 204, 0, 0, 68, 132, 0, 0, 202, 0, 0, 0, 143, 204, 98, 1, 141, 204, 98, 1, 121, 204, 3, 0, 1, 37, 99, 0, 119, 0, 28, 9, 134, 204, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 143, 204, 99, 1, 141, 204, 99, 1, 121, 204, 3, 0, 1, 37, 50, 0, 119, 0, 20, 9, 134, 204, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 143, 204, 100, 1, 141, 204, 100, 1, 121, 204, 3, 0, 1, 37, 106, 0, 119, 0, 12, 9, 1, 26, 1, 0, 119, 0, 10, 9, 1, 206, 232, 6, 141, 205, 134, 1, 25, 205, 205, 72, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 205, 24, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 101, 1, 141, 204, 101, 1, 121, 204, 3, 0, 1, 15, 1, 0, 119, 0, 251, 8, 1, 15, 0, 0, 1, 205, 6, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 102, 1, 141, 204, 102, 1, 121, 204, 3, 0, 1, 37, 46, 0, 119, 0, 241, 8, 1, 205, 32, 8, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 103, 1, 141, 204, 103, 1, 121, 204, 3, 0, 1, 37, 45, 0, 119, 0, 232, 8, 1, 205, 64, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 104, 1, 141, 204, 104, 1, 121, 204, 3, 0, 1, 37, 47, 0, 119, 0, 223, 8, 134, 204, 0, 0, 68, 132, 0, 0, 202, 0, 0, 0, 143, 204, 105, 1, 141, 204, 105, 1, 121, 204, 3, 0, 1, 37, 99, 0, 119, 0, 215, 8, 134, 204, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 143, 204, 106, 1, 141, 204, 106, 1, 121, 204, 3, 0, 1, 37, 50, 0, 119, 0, 207, 8, 134, 204, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 143, 204, 107, 1, 141, 204, 107, 1, 121, 204, 3, 0, 1, 37, 106, 0, 119, 0, 199, 8, 1, 26, 1, 0, 119, 0, 197, 8, 1, 205, 249, 6, 141, 206, 134, 1, 25, 206, 206, 80, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 206, 226, 56, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 108, 1, 141, 204, 108, 1, 121, 204, 3, 0, 1, 15, 1, 0, 119, 0, 182, 8, 1, 15, 0, 0, 1, 206, 28, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 109, 1, 141, 204, 109, 1, 121, 204, 3, 0, 1, 37, 43, 0, 119, 0, 172, 8, 134, 204, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 143, 204, 110, 1, 141, 204, 110, 1, 121, 204, 3, 0, 1, 37, 50, 0, 119, 0, 164, 8, 134, 204, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 143, 204, 111, 1, 141, 204, 111, 1, 121, 204, 3, 0, 1, 37, 106, 0, 119, 0, 156, 8, 1, 26, 1, 0, 119, 0, 154, 8, 1, 206, 8, 7, 141, 205, 134, 1, 25, 205, 205, 88, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 205, 96, 56, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 112, 1, 141, 204, 112, 1, 121, 204, 3, 0, 1, 15, 1, 0, 119, 0, 139, 8, 1, 15, 0, 0, 1, 205, 130, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 113, 1, 141, 204, 113, 1, 121, 204, 3, 0, 1, 37, 57, 0, 119, 0, 129, 8, 1, 205, 28, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 114, 1, 141, 204, 114, 1, 121, 204, 3, 0, 1, 37, 43, 0, 119, 0, 120, 8, 134, 204, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 143, 204, 115, 1, 141, 204, 115, 1, 121, 204, 3, 0, 1, 37, 50, 0, 119, 0, 112, 8, 134, 204, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 143, 204, 116, 1, 141, 204, 116, 1, 121, 204, 3, 0, 1, 37, 106, 0, 119, 0, 104, 8, 1, 26, 1, 0, 119, 0, 102, 8, 1, 205, 23, 7, 141, 206, 134, 1, 25, 206, 206, 96, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 206, 96, 56, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 117, 1, 141, 204, 117, 1, 121, 204, 3, 0, 1, 15, 1, 0, 119, 0, 87, 8, 1, 15, 0, 0, 1, 206, 130, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 118, 1, 141, 204, 118, 1, 121, 204, 3, 0, 1, 37, 57, 0, 119, 0, 77, 8, 1, 206, 28, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 119, 1, 141, 204, 119, 1, 121, 204, 3, 0, 1, 37, 43, 0, 119, 0, 68, 8, 134, 204, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 143, 204, 120, 1, 141, 204, 120, 1, 121, 204, 3, 0, 1, 37, 50, 0, 119, 0, 60, 8, 134, 204, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 143, 204, 121, 1, 141, 204, 121, 1, 121, 204, 3, 0, 1, 37, 106, 0, 119, 0, 52, 8, 1, 26, 1, 0, 119, 0, 50, 8, 1, 206, 38, 7, 141, 205, 134, 1, 25, 205, 205, 104, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 205, 96, 8, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 122, 1, 141, 204, 122, 1, 121, 204, 3, 0, 1, 15, 1, 0, 119, 0, 35, 8, 1, 15, 0, 0, 1, 205, 14, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 123, 1, 141, 204, 123, 1, 121, 204, 3, 0, 1, 37, 45, 0, 119, 0, 25, 8, 1, 205, 16, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 124, 1, 141, 204, 124, 1, 121, 204, 3, 0, 1, 37, 47, 0, 119, 0, 16, 8, 134, 204, 0, 0, 68, 132, 0, 0, 202, 0, 0, 0, 143, 204, 125, 1, 141, 204, 125, 1, 121, 204, 3, 0, 1, 37, 99, 0, 119, 0, 8, 8, 134, 204, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 143, 204, 126, 1, 141, 204, 126, 1, 121, 204, 3, 0, 1, 37, 50, 0, 119, 0, 0, 8, 134, 204, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 143, 204, 127, 1, 141, 204, 127, 1, 121, 204, 3, 0, 1, 37, 106, 0, 119, 0, 248, 7, 1, 26, 1, 0, 119, 0, 246, 7, 1, 205, 54, 7, 141, 206, 134, 1, 25, 206, 206, 112, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 206, 96, 8, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 128, 1, 141, 204, 128, 1, 121, 204, 3, 0, 1, 15, 1, 0, 119, 0, 231, 7, 1, 15, 0, 0, 1, 206, 14, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 129, 1, 141, 204, 129, 1, 121, 204, 3, 0, 1, 37, 45, 0, 119, 0, 221, 7, 1, 206, 16, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 130, 1, 141, 204, 130, 1, 121, 204, 3, 0, 1, 37, 47, 0, 119, 0, 212, 7, 134, 204, 0, 0, 68, 132, 0, 0, 202, 0, 0, 0, 143, 204, 131, 1, 141, 204, 131, 1, 121, 204, 3, 0, 1, 37, 99, 0, 119, 0, 204, 7, 134, 204, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 143, 204, 132, 1, 141, 204, 132, 1, 121, 204, 3, 0, 1, 37, 50, 0, 119, 0, 196, 7, 134, 5, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 5, 3, 0, 1, 37, 106, 0, 119, 0, 190, 7, 1, 26, 1, 0, 119, 0, 188, 7, 1, 206, 72, 7, 141, 205, 134, 1, 25, 205, 205, 120, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 204, 96, 8, 134, 6, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 6, 3, 0, 1, 15, 1, 0, 119, 0, 175, 7, 1, 15, 0, 0, 1, 204, 14, 0, 134, 7, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 7, 3, 0, 1, 37, 45, 0, 119, 0, 167, 7, 1, 204, 16, 0, 134, 8, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 8, 3, 0, 1, 37, 47, 0, 119, 0, 160, 7, 134, 9, 0, 0, 68, 132, 0, 0, 202, 0, 0, 0, 121, 9, 3, 0, 1, 37, 99, 0, 119, 0, 154, 7, 134, 10, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 10, 3, 0, 1, 37, 50, 0, 119, 0, 148, 7, 134, 11, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 11, 3, 0, 1, 37, 106, 0, 119, 0, 142, 7, 1, 26, 1, 0, 119, 0, 140, 7, 1, 205, 90, 7, 141, 206, 134, 1, 1, 207, 128, 0, 3, 206, 206, 207, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 204, 96, 8, 134, 12, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 12, 3, 0, 1, 15, 1, 0, 119, 0, 126, 7, 1, 15, 0, 0, 1, 204, 14, 0, 134, 13, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 13, 3, 0, 1, 37, 45, 0, 119, 0, 118, 7, 1, 204, 16, 0, 134, 14, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 14, 3, 0, 1, 37, 47, 0, 119, 0, 111, 7, 134, 16, 0, 0, 68, 132, 0, 0, 202, 0, 0, 0, 121, 16, 3, 0, 1, 37, 99, 0, 119, 0, 105, 7, 134, 17, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 17, 3, 0, 1, 37, 50, 0, 119, 0, 99, 7, 134, 18, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 18, 3, 0, 1, 37, 106, 0, 119, 0, 93, 7, 1, 26, 1, 0, 119, 0, 91, 7, 1, 206, 108, 7, 141, 205, 134, 1, 1, 207, 136, 0, 3, 205, 205, 207, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 204, 96, 8, 134, 19, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 19, 3, 0, 1, 15, 1, 0, 119, 0, 77, 7, 1, 15, 0, 0, 1, 204, 14, 0, 134, 20, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 20, 3, 0, 1, 37, 45, 0, 119, 0, 69, 7, 1, 204, 16, 0, 134, 21, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 21, 3, 0, 1, 37, 47, 0, 119, 0, 62, 7, 134, 22, 0, 0, 68, 132, 0, 0, 202, 0, 0, 0, 121, 22, 3, 0, 1, 37, 99, 0, 119, 0, 56, 7, 134, 23, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 23, 3, 0, 1, 37, 50, 0, 119, 0, 50, 7, 134, 24, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 24, 3, 0, 1, 37, 106, 0, 119, 0, 44, 7, 1, 26, 1, 0, 119, 0, 42, 7, 1, 205, 126, 7, 141, 206, 134, 1, 1, 207, 144, 0, 3, 206, 206, 207, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 204, 96, 8, 134, 25, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 25, 3, 0, 1, 15, 1, 0, 119, 0, 28, 7, 1, 15, 0, 0, 1, 204, 14, 0, 134, 27, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 27, 3, 0, 1, 37, 45, 0, 119, 0, 20, 7, 1, 204, 16, 0, 134, 28, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 28, 3, 0, 1, 37, 47, 0, 119, 0, 13, 7, 134, 29, 0, 0, 68, 132, 0, 0, 202, 0, 0, 0, 121, 29, 3, 0, 1, 37, 99, 0, 119, 0, 7, 7, 134, 30, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 30, 3, 0, 1, 37, 50, 0, 119, 0, 1, 7, 134, 31, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 31, 3, 0, 1, 37, 106, 0, 119, 0, 251, 6, 1, 26, 1, 0, 119, 0, 249, 6, 1, 206, 144, 7, 141, 205, 134, 1, 1, 207, 152, 0, 3, 205, 205, 207, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 204, 96, 8, 134, 32, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 32, 3, 0, 1, 15, 1, 0, 119, 0, 235, 6, 1, 15, 0, 0, 1, 204, 14, 0, 134, 33, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 33, 3, 0, 1, 37, 45, 0, 119, 0, 227, 6, 1, 204, 16, 0, 134, 34, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 34, 3, 0, 1, 37, 47, 0, 119, 0, 220, 6, 134, 35, 0, 0, 68, 132, 0, 0, 202, 0, 0, 0, 121, 35, 3, 0, 1, 37, 99, 0, 119, 0, 214, 6, 134, 36, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 36, 3, 0, 1, 37, 50, 0, 119, 0, 208, 6, 134, 38, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 38, 3, 0, 1, 37, 106, 0, 119, 0, 202, 6, 1, 26, 1, 0, 119, 0, 200, 6, 1, 205, 162, 7, 141, 206, 134, 1, 1, 207, 160, 0, 3, 206, 206, 207, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 204, 96, 8, 134, 39, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 39, 3, 0, 1, 15, 1, 0, 119, 0, 186, 6, 1, 15, 0, 0, 1, 204, 14, 0, 134, 40, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 40, 3, 0, 1, 37, 45, 0, 119, 0, 178, 6, 1, 204, 16, 0, 134, 41, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 41, 3, 0, 1, 37, 47, 0, 119, 0, 171, 6, 134, 42, 0, 0, 68, 132, 0, 0, 202, 0, 0, 0, 121, 42, 3, 0, 1, 37, 99, 0, 119, 0, 165, 6, 134, 43, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 43, 3, 0, 1, 37, 50, 0, 119, 0, 159, 6, 134, 44, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 44, 3, 0, 1, 37, 106, 0, 119, 0, 153, 6, 1, 26, 1, 0, 119, 0, 151, 6, 1, 206, 180, 7, 141, 205, 134, 1, 1, 207, 168, 0, 3, 205, 205, 207, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 204, 96, 8, 134, 45, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 45, 3, 0, 1, 15, 1, 0, 119, 0, 137, 6, 1, 15, 0, 0, 1, 204, 14, 0, 134, 46, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 46, 3, 0, 1, 37, 45, 0, 119, 0, 129, 6, 1, 204, 16, 0, 134, 47, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 47, 3, 0, 1, 37, 47, 0, 119, 0, 122, 6, 134, 48, 0, 0, 68, 132, 0, 0, 202, 0, 0, 0, 121, 48, 3, 0, 1, 37, 99, 0, 119, 0, 116, 6, 134, 49, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 49, 3, 0, 1, 37, 50, 0, 119, 0, 110, 6, 134, 50, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 50, 3, 0, 1, 37, 106, 0, 119, 0, 104, 6, 1, 26, 1, 0, 119, 0, 102, 6, 1, 205, 198, 7, 141, 206, 134, 1, 1, 207, 176, 0, 3, 206, 206, 207, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 204, 96, 8, 134, 51, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 51, 3, 0, 1, 15, 1, 0, 119, 0, 88, 6, 1, 15, 0, 0, 1, 204, 14, 0, 134, 52, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 52, 3, 0, 1, 37, 45, 0, 119, 0, 80, 6, 1, 204, 16, 0, 134, 53, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 53, 3, 0, 1, 37, 47, 0, 119, 0, 73, 6, 134, 54, 0, 0, 68, 132, 0, 0, 202, 0, 0, 0, 121, 54, 3, 0, 1, 37, 99, 0, 119, 0, 67, 6, 134, 55, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 55, 3, 0, 1, 37, 50, 0, 119, 0, 61, 6, 134, 56, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 56, 3, 0, 1, 37, 106, 0, 119, 0, 55, 6, 1, 26, 1, 0, 119, 0, 53, 6, 1, 206, 216, 7, 141, 205, 134, 1, 1, 207, 184, 0, 3, 205, 205, 207, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 204, 96, 8, 134, 57, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 57, 3, 0, 1, 15, 1, 0, 119, 0, 39, 6, 1, 15, 0, 0, 1, 204, 14, 0, 134, 58, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 58, 3, 0, 1, 37, 45, 0, 119, 0, 31, 6, 1, 204, 16, 0, 134, 59, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 59, 3, 0, 1, 37, 47, 0, 119, 0, 24, 6, 134, 60, 0, 0, 68, 132, 0, 0, 202, 0, 0, 0, 121, 60, 3, 0, 1, 37, 99, 0, 119, 0, 18, 6, 134, 61, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 61, 3, 0, 1, 37, 50, 0, 119, 0, 12, 6, 134, 62, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 62, 3, 0, 1, 37, 106, 0, 119, 0, 6, 6, 1, 26, 1, 0, 119, 0, 4, 6, 1, 205, 235, 7, 141, 206, 134, 1, 1, 207, 192, 0, 3, 206, 206, 207, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 204, 96, 8, 134, 63, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 63, 3, 0, 1, 15, 1, 0, 119, 0, 246, 5, 1, 15, 0, 0, 1, 204, 14, 0, 134, 64, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 64, 3, 0, 1, 37, 45, 0, 119, 0, 238, 5, 1, 204, 16, 0, 134, 65, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 65, 3, 0, 1, 37, 47, 0, 119, 0, 231, 5, 134, 66, 0, 0, 68, 132, 0, 0, 202, 0, 0, 0, 121, 66, 3, 0, 1, 37, 99, 0, 119, 0, 225, 5, 134, 67, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 67, 3, 0, 1, 37, 50, 0, 119, 0, 219, 5, 134, 68, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 68, 3, 0, 1, 37, 106, 0, 119, 0, 213, 5, 1, 26, 1, 0, 119, 0, 211, 5, 1, 206, 254, 7, 141, 205, 134, 1, 1, 207, 200, 0, 3, 205, 205, 207, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 204, 96, 8, 134, 69, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 69, 3, 0, 1, 15, 1, 0, 119, 0, 197, 5, 1, 15, 0, 0, 1, 204, 14, 0, 134, 70, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 70, 3, 0, 1, 37, 45, 0, 119, 0, 189, 5, 1, 204, 16, 0, 134, 71, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 71, 3, 0, 1, 37, 47, 0, 119, 0, 182, 5, 134, 72, 0, 0, 68, 132, 0, 0, 202, 0, 0, 0, 121, 72, 3, 0, 1, 37, 99, 0, 119, 0, 176, 5, 134, 73, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 73, 3, 0, 1, 37, 50, 0, 119, 0, 170, 5, 134, 74, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 74, 3, 0, 1, 37, 106, 0, 119, 0, 164, 5, 1, 26, 1, 0, 119, 0, 162, 5, 1, 205, 17, 8, 141, 206, 134, 1, 1, 207, 208, 0, 3, 206, 206, 207, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 204, 96, 8, 134, 75, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 75, 3, 0, 1, 15, 1, 0, 119, 0, 148, 5, 1, 15, 0, 0, 1, 204, 14, 0, 134, 76, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 76, 3, 0, 1, 37, 45, 0, 119, 0, 140, 5, 1, 204, 16, 0, 134, 77, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 77, 3, 0, 1, 37, 47, 0, 119, 0, 133, 5, 134, 78, 0, 0, 68, 132, 0, 0, 202, 0, 0, 0, 121, 78, 3, 0, 1, 37, 99, 0, 119, 0, 127, 5, 134, 79, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 79, 3, 0, 1, 37, 50, 0, 119, 0, 121, 5, 134, 80, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 80, 3, 0, 1, 37, 106, 0, 119, 0, 115, 5, 1, 26, 1, 0, 119, 0, 113, 5, 1, 206, 36, 8, 141, 205, 134, 1, 1, 207, 216, 0, 3, 205, 205, 207, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 204, 224, 56, 134, 81, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 81, 3, 0, 1, 15, 1, 0, 119, 0, 99, 5, 1, 15, 0, 0, 1, 204, 2, 0, 134, 82, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 82, 3, 0, 1, 37, 57, 0, 119, 0, 91, 5, 1, 204, 4, 0, 134, 83, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 83, 3, 0, 1, 37, 43, 0, 119, 0, 84, 5, 1, 204, 8, 0, 134, 84, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 84, 3, 0, 1, 37, 45, 0, 119, 0, 77, 5, 1, 204, 16, 0, 134, 85, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 85, 3, 0, 1, 37, 47, 0, 119, 0, 70, 5, 134, 86, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 86, 3, 0, 1, 37, 50, 0, 119, 0, 64, 5, 134, 87, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 87, 3, 0, 1, 37, 106, 0, 119, 0, 58, 5, 1, 26, 1, 0, 119, 0, 56, 5, 1, 205, 52, 8, 141, 206, 134, 1, 1, 207, 224, 0, 3, 206, 206, 207, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 204, 224, 56, 134, 88, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 88, 3, 0, 1, 15, 1, 0, 119, 0, 42, 5, 1, 15, 0, 0, 1, 204, 2, 0, 134, 89, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 89, 3, 0, 1, 37, 57, 0, 119, 0, 34, 5, 1, 204, 4, 0, 134, 90, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 90, 3, 0, 1, 37, 43, 0, 119, 0, 27, 5, 1, 204, 8, 0, 134, 91, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 91, 3, 0, 1, 37, 45, 0, 119, 0, 20, 5, 1, 204, 16, 0, 134, 92, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 92, 3, 0, 1, 37, 47, 0, 119, 0, 13, 5, 134, 93, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 93, 3, 0, 1, 37, 50, 0, 119, 0, 7, 5, 134, 94, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 94, 3, 0, 1, 37, 106, 0, 119, 0, 1, 5, 1, 26, 1, 0, 119, 0, 255, 4, 1, 206, 68, 8, 141, 205, 134, 1, 1, 207, 232, 0, 3, 205, 205, 207, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 204, 224, 56, 134, 95, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 95, 3, 0, 1, 15, 1, 0, 119, 0, 241, 4, 1, 15, 0, 0, 1, 204, 2, 0, 134, 96, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 96, 3, 0, 1, 37, 57, 0, 119, 0, 233, 4, 1, 204, 4, 0, 134, 97, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 97, 3, 0, 1, 37, 43, 0, 119, 0, 226, 4, 1, 204, 8, 0, 134, 99, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 99, 3, 0, 1, 37, 45, 0, 119, 0, 219, 4, 1, 204, 16, 0, 134, 100, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 100, 3, 0, 1, 37, 47, 0, 119, 0, 212, 4, 134, 101, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 101, 3, 0, 1, 37, 50, 0, 119, 0, 206, 4, 134, 102, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 102, 3, 0, 1, 37, 106, 0, 119, 0, 200, 4, 1, 26, 1, 0, 119, 0, 198, 4, 1, 205, 84, 8, 141, 206, 134, 1, 1, 207, 240, 0, 3, 206, 206, 207, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 204, 224, 56, 134, 103, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 103, 3, 0, 1, 15, 1, 0, 119, 0, 184, 4, 1, 15, 0, 0, 1, 204, 2, 0, 134, 104, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 104, 3, 0, 1, 37, 57, 0, 119, 0, 176, 4, 1, 204, 4, 0, 134, 105, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 105, 3, 0, 1, 37, 43, 0, 119, 0, 169, 4, 1, 204, 8, 0, 134, 106, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 106, 3, 0, 1, 37, 45, 0, 119, 0, 162, 4, 1, 204, 16, 0, 134, 107, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 107, 3, 0, 1, 37, 47, 0, 119, 0, 155, 4, 134, 108, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 108, 3, 0, 1, 37, 50, 0, 119, 0, 149, 4, 134, 110, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 110, 3, 0, 1, 37, 106, 0, 119, 0, 143, 4, 1, 26, 1, 0, 119, 0, 141, 4, 1, 206, 100, 8, 141, 205, 134, 1, 1, 207, 248, 0, 3, 205, 205, 207, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 204, 192, 56, 134, 111, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 111, 3, 0, 1, 15, 1, 0, 119, 0, 127, 4, 1, 15, 0, 0, 1, 204, 2, 0, 134, 112, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 112, 3, 0, 1, 37, 57, 0, 119, 0, 119, 4, 1, 204, 4, 0, 134, 113, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 113, 3, 0, 1, 37, 43, 0, 119, 0, 112, 4, 1, 204, 8, 0, 134, 114, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 114, 3, 0, 1, 37, 45, 0, 119, 0, 105, 4, 1, 204, 16, 0, 134, 115, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 115, 3, 0, 1, 37, 47, 0, 119, 0, 98, 4, 1, 204, 32, 0, 134, 116, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 116, 3, 0, 1, 37, 98, 0, 119, 0, 91, 4, 134, 117, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 117, 3, 0, 1, 37, 50, 0, 119, 0, 85, 4, 134, 118, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 118, 3, 0, 1, 37, 106, 0, 119, 0, 79, 4, 1, 26, 1, 0, 119, 0, 77, 4, 1, 205, 116, 8, 141, 206, 134, 1, 3, 206, 206, 200, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 204, 64, 8, 134, 119, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 119, 3, 0, 1, 15, 1, 0, 119, 0, 64, 4, 1, 15, 0, 0, 1, 204, 2, 0, 134, 121, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 121, 3, 0, 1, 37, 57, 0, 119, 0, 56, 4, 1, 204, 4, 0, 134, 122, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 122, 3, 0, 1, 37, 43, 0, 119, 0, 49, 4, 1, 204, 8, 0, 134, 123, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 123, 3, 0, 1, 37, 45, 0, 119, 0, 42, 4, 1, 204, 16, 0, 134, 124, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 124, 3, 0, 1, 37, 47, 0, 119, 0, 35, 4, 1, 204, 32, 0, 134, 125, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 125, 3, 0, 1, 37, 98, 0, 119, 0, 28, 4, 134, 126, 0, 0, 68, 132, 0, 0, 202, 0, 0, 0, 121, 126, 3, 0, 1, 37, 99, 0, 119, 0, 22, 4, 134, 127, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 127, 3, 0, 1, 37, 50, 0, 119, 0, 16, 4, 134, 128, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 128, 3, 0, 1, 37, 106, 0, 119, 0, 10, 4, 1, 26, 1, 0, 119, 0, 8, 4, 1, 206, 133, 8, 141, 205, 134, 1, 1, 207, 8, 1, 3, 205, 205, 207, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 204, 64, 56, 134, 129, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 129, 3, 0, 1, 15, 1, 0, 119, 0, 250, 3, 1, 15, 0, 0, 1, 204, 2, 0, 134, 130, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 130, 3, 0, 1, 37, 57, 0, 119, 0, 242, 3, 1, 204, 4, 0, 134, 132, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 132, 3, 0, 1, 37, 43, 0, 119, 0, 235, 3, 1, 204, 8, 0, 134, 133, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 133, 3, 0, 1, 37, 45, 0, 119, 0, 228, 3, 1, 204, 16, 0, 134, 134, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 134, 3, 0, 1, 37, 47, 0, 119, 0, 221, 3, 1, 204, 32, 0, 134, 135, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 135, 3, 0, 1, 37, 98, 0, 119, 0, 214, 3, 1, 204, 128, 0, 134, 136, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 136, 3, 0, 1, 37, 99, 0, 119, 0, 207, 3, 134, 137, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 137, 3, 0, 1, 37, 50, 0, 119, 0, 201, 3, 134, 138, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 138, 3, 0, 1, 37, 106, 0, 119, 0, 195, 3, 1, 26, 1, 0, 119, 0, 193, 3, 1, 205, 149, 8, 141, 206, 134, 1, 1, 207, 16, 1, 3, 206, 206, 207, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 204, 32, 54, 134, 139, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 139, 3, 0, 1, 15, 1, 0, 119, 0, 179, 3, 1, 15, 0, 0, 1, 204, 2, 0, 134, 140, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 140, 3, 0, 1, 37, 57, 0, 119, 0, 171, 3, 1, 204, 4, 0, 134, 141, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 141, 3, 0, 1, 37, 43, 0, 119, 0, 164, 3, 1, 204, 8, 0, 134, 143, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 143, 3, 0, 1, 37, 45, 0, 119, 0, 157, 3, 1, 204, 16, 0, 134, 144, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 144, 3, 0, 1, 37, 47, 0, 119, 0, 150, 3, 1, 204, 64, 0, 134, 145, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 145, 3, 0, 1, 37, 92, 0, 119, 0, 143, 3, 1, 204, 128, 0, 134, 146, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 146, 3, 0, 1, 37, 107, 0, 119, 0, 136, 3, 134, 147, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 147, 3, 0, 1, 37, 50, 0, 119, 0, 130, 3, 1, 204, 0, 8, 134, 148, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 148, 3, 0, 1, 37, 94, 0, 119, 0, 123, 3, 1, 26, 1, 0, 119, 0, 121, 3, 1, 206, 165, 8, 141, 205, 134, 1, 1, 207, 24, 1, 3, 205, 205, 207, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 204, 128, 32, 134, 149, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 149, 3, 0, 1, 15, 1, 0, 119, 0, 107, 3, 1, 15, 0, 0, 1, 204, 2, 0, 134, 150, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 150, 3, 0, 1, 37, 57, 0, 119, 0, 99, 3, 1, 204, 4, 0, 134, 151, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 151, 3, 0, 1, 37, 43, 0, 119, 0, 92, 3, 1, 204, 8, 0, 134, 152, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 152, 3, 0, 1, 37, 45, 0, 119, 0, 85, 3, 1, 204, 16, 0, 134, 154, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 154, 3, 0, 1, 37, 47, 0, 119, 0, 78, 3, 1, 204, 32, 22, 134, 155, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 155, 3, 0, 1, 37, 106, 0, 119, 0, 71, 3, 1, 204, 64, 0, 134, 156, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 156, 3, 0, 1, 37, 92, 0, 119, 0, 64, 3, 134, 157, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 157, 3, 0, 1, 37, 50, 0, 119, 0, 58, 3, 1, 204, 0, 8, 134, 158, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 158, 3, 0, 1, 37, 94, 0, 119, 0, 51, 3, 1, 26, 1, 0, 119, 0, 49, 3, 1, 205, 181, 8, 141, 206, 134, 1, 1, 207, 32, 1, 3, 206, 206, 207, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 204, 128, 32, 134, 159, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 159, 3, 0, 1, 15, 1, 0, 119, 0, 35, 3, 1, 15, 0, 0, 1, 204, 2, 0, 134, 160, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 160, 3, 0, 1, 37, 57, 0, 119, 0, 27, 3, 1, 204, 4, 0, 134, 161, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 161, 3, 0, 1, 37, 43, 0, 119, 0, 20, 3, 1, 204, 8, 0, 134, 162, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 162, 3, 0, 1, 37, 45, 0, 119, 0, 13, 3, 1, 204, 16, 0, 134, 163, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 163, 3, 0, 1, 37, 47, 0, 119, 0, 6, 3, 1, 204, 32, 22, 134, 165, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 165, 3, 0, 1, 37, 106, 0, 119, 0, 255, 2, 1, 204, 64, 0, 134, 166, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 166, 3, 0, 1, 37, 92, 0, 119, 0, 248, 2, 134, 167, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 167, 3, 0, 1, 37, 50, 0, 119, 0, 242, 2, 1, 204, 0, 8, 134, 168, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 168, 3, 0, 1, 37, 94, 0, 119, 0, 235, 2, 1, 26, 1, 0, 119, 0, 233, 2, 1, 206, 198, 8, 141, 205, 134, 1, 1, 207, 40, 1, 3, 205, 205, 207, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 204, 128, 56, 134, 169, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 169, 3, 0, 1, 15, 1, 0, 119, 0, 219, 2, 1, 15, 0, 0, 1, 204, 2, 0, 134, 170, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 170, 3, 0, 1, 37, 57, 0, 119, 0, 211, 2, 1, 204, 4, 0, 134, 171, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 171, 3, 0, 1, 37, 43, 0, 119, 0, 204, 2, 1, 204, 8, 0, 134, 172, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 172, 3, 0, 1, 37, 45, 0, 119, 0, 197, 2, 1, 204, 16, 0, 134, 173, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 173, 3, 0, 1, 37, 47, 0, 119, 0, 190, 2, 1, 204, 96, 0, 134, 174, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 174, 3, 0, 1, 37, 99, 0, 119, 0, 183, 2, 134, 176, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 176, 3, 0, 1, 37, 50, 0, 119, 0, 177, 2, 134, 177, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 177, 3, 0, 1, 37, 106, 0, 119, 0, 171, 2, 1, 26, 1, 0, 119, 0, 169, 2, 1, 205, 216, 8, 141, 206, 134, 1, 1, 207, 48, 1, 3, 206, 206, 207, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 204, 128, 56, 134, 178, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 178, 3, 0, 1, 15, 1, 0, 119, 0, 155, 2, 1, 15, 0, 0, 1, 204, 2, 0, 134, 179, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 179, 3, 0, 1, 37, 57, 0, 119, 0, 147, 2, 1, 204, 4, 0, 134, 180, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 180, 3, 0, 1, 37, 43, 0, 119, 0, 140, 2, 1, 204, 8, 0, 134, 181, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 181, 3, 0, 1, 37, 45, 0, 119, 0, 133, 2, 1, 204, 16, 0, 134, 182, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 182, 3, 0, 1, 37, 47, 0, 119, 0, 126, 2, 1, 204, 96, 0, 134, 183, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 183, 3, 0, 1, 37, 99, 0, 119, 0, 119, 2, 134, 184, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 184, 3, 0, 1, 37, 50, 0, 119, 0, 113, 2, 134, 185, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 185, 3, 0, 1, 37, 106, 0, 119, 0, 107, 2, 1, 26, 1, 0, 119, 0, 105, 2, 1, 206, 234, 8, 141, 205, 134, 1, 1, 207, 56, 1, 3, 205, 205, 207, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 204, 128, 56, 134, 187, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 187, 3, 0, 1, 15, 1, 0, 119, 0, 91, 2, 1, 15, 0, 0, 1, 204, 2, 0, 134, 188, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 188, 3, 0, 1, 37, 57, 0, 119, 0, 83, 2, 1, 204, 4, 0, 134, 189, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 189, 3, 0, 1, 37, 43, 0, 119, 0, 76, 2, 1, 204, 8, 0, 134, 190, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 190, 3, 0, 1, 37, 45, 0, 119, 0, 69, 2, 1, 204, 16, 0, 134, 191, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 191, 3, 0, 1, 37, 47, 0, 119, 0, 62, 2, 1, 204, 96, 0, 134, 192, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 192, 3, 0, 1, 37, 99, 0, 119, 0, 55, 2, 134, 193, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 121, 193, 3, 0, 1, 37, 50, 0, 119, 0, 49, 2, 134, 194, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 121, 194, 3, 0, 1, 37, 106, 0, 119, 0, 43, 2, 1, 26, 1, 0, 119, 0, 41, 2, 1, 205, 252, 8, 141, 206, 134, 1, 1, 207, 64, 1, 3, 206, 206, 207, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 204, 128, 56, 134, 195, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 195, 3, 0, 1, 15, 1, 0, 119, 0, 27, 2, 1, 15, 0, 0, 1, 204, 2, 0, 134, 196, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 196, 3, 0, 1, 37, 57, 0, 119, 0, 19, 2, 1, 204, 4, 0, 134, 198, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 198, 3, 0, 1, 37, 43, 0, 119, 0, 12, 2, 1, 204, 8, 0, 134, 199, 0, 0, 68, 132, 0, 0, 204, 0, 0, 0, 121, 199, 3, 0, 1, 37, 45, 0, 119, 0, 5, 2, 1, 206, 16, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 0, 1, 141, 204, 0, 1, 121, 204, 3, 0, 1, 37, 47, 0, 119, 0, 252, 1, 1, 206, 96, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 1, 1, 141, 204, 1, 1, 121, 204, 3, 0, 1, 37, 99, 0, 119, 0, 243, 1, 134, 204, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 143, 204, 2, 1, 141, 204, 2, 1, 121, 204, 3, 0, 1, 37, 50, 0, 119, 0, 235, 1, 134, 204, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 143, 204, 3, 1, 141, 204, 3, 1, 121, 204, 3, 0, 1, 37, 106, 0, 119, 0, 227, 1, 1, 26, 1, 0, 119, 0, 225, 1, 1, 206, 14, 9, 141, 205, 134, 1, 1, 207, 72, 1, 3, 205, 205, 207, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 205, 128, 56, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 4, 1, 141, 204, 4, 1, 121, 204, 3, 0, 1, 15, 1, 0, 119, 0, 209, 1, 1, 15, 0, 0, 1, 205, 2, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 5, 1, 141, 204, 5, 1, 121, 204, 3, 0, 1, 37, 57, 0, 119, 0, 199, 1, 1, 205, 4, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 6, 1, 141, 204, 6, 1, 121, 204, 3, 0, 1, 37, 43, 0, 119, 0, 190, 1, 1, 205, 8, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 7, 1, 141, 204, 7, 1, 121, 204, 3, 0, 1, 37, 45, 0, 119, 0, 181, 1, 1, 205, 16, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 9, 1, 141, 204, 9, 1, 121, 204, 3, 0, 1, 37, 47, 0, 119, 0, 172, 1, 1, 205, 96, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 10, 1, 141, 204, 10, 1, 121, 204, 3, 0, 1, 37, 99, 0, 119, 0, 163, 1, 134, 204, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 143, 204, 11, 1, 141, 204, 11, 1, 121, 204, 3, 0, 1, 37, 50, 0, 119, 0, 155, 1, 134, 204, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 143, 204, 12, 1, 141, 204, 12, 1, 121, 204, 3, 0, 1, 37, 106, 0, 119, 0, 147, 1, 1, 26, 1, 0, 119, 0, 145, 1, 1, 205, 32, 9, 141, 206, 134, 1, 1, 207, 80, 1, 3, 206, 206, 207, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 206, 128, 56, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 13, 1, 141, 204, 13, 1, 121, 204, 3, 0, 1, 15, 1, 0, 119, 0, 129, 1, 1, 15, 0, 0, 1, 206, 2, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 14, 1, 141, 204, 14, 1, 121, 204, 3, 0, 1, 37, 57, 0, 119, 0, 119, 1, 1, 206, 4, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 15, 1, 141, 204, 15, 1, 121, 204, 3, 0, 1, 37, 43, 0, 119, 0, 110, 1, 1, 206, 8, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 16, 1, 141, 204, 16, 1, 121, 204, 3, 0, 1, 37, 45, 0, 119, 0, 101, 1, 1, 206, 16, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 17, 1, 141, 204, 17, 1, 121, 204, 3, 0, 1, 37, 47, 0, 119, 0, 92, 1, 1, 206, 96, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0 ], eb + 0);
 HEAPU8.set([ 143, 204, 18, 1, 141, 204, 18, 1, 121, 204, 3, 0, 1, 37, 99, 0, 119, 0, 83, 1, 134, 204, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 143, 204, 20, 1, 141, 204, 20, 1, 121, 204, 3, 0, 1, 37, 50, 0, 119, 0, 75, 1, 134, 204, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 143, 204, 21, 1, 141, 204, 21, 1, 121, 204, 3, 0, 1, 37, 106, 0, 119, 0, 67, 1, 1, 26, 1, 0, 119, 0, 65, 1, 1, 206, 50, 9, 141, 205, 134, 1, 1, 207, 88, 1, 3, 205, 205, 207, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 205, 128, 56, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 22, 1, 141, 204, 22, 1, 121, 204, 3, 0, 1, 15, 1, 0, 119, 0, 49, 1, 1, 15, 0, 0, 1, 205, 2, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 23, 1, 141, 204, 23, 1, 121, 204, 3, 0, 1, 37, 57, 0, 119, 0, 39, 1, 1, 205, 4, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 24, 1, 141, 204, 24, 1, 121, 204, 3, 0, 1, 37, 43, 0, 119, 0, 30, 1, 1, 205, 8, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 25, 1, 141, 204, 25, 1, 121, 204, 3, 0, 1, 37, 45, 0, 119, 0, 21, 1, 1, 205, 16, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 26, 1, 141, 204, 26, 1, 121, 204, 3, 0, 1, 37, 47, 0, 119, 0, 12, 1, 1, 205, 96, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 27, 1, 141, 204, 27, 1, 121, 204, 3, 0, 1, 37, 99, 0, 119, 0, 3, 1, 134, 204, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 143, 204, 28, 1, 141, 204, 28, 1, 121, 204, 3, 0, 1, 37, 50, 0, 119, 0, 251, 0, 134, 204, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 143, 204, 29, 1, 141, 204, 29, 1, 121, 204, 3, 0, 1, 37, 106, 0, 119, 0, 243, 0, 1, 26, 1, 0, 119, 0, 241, 0, 1, 205, 68, 9, 141, 206, 134, 1, 1, 207, 96, 1, 3, 206, 206, 207, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 206, 128, 56, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 31, 1, 141, 204, 31, 1, 121, 204, 3, 0, 1, 15, 1, 0, 119, 0, 225, 0, 1, 15, 0, 0, 1, 206, 2, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 32, 1, 141, 204, 32, 1, 121, 204, 3, 0, 1, 37, 57, 0, 119, 0, 215, 0, 1, 206, 4, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 33, 1, 141, 204, 33, 1, 121, 204, 3, 0, 1, 37, 43, 0, 119, 0, 206, 0, 1, 206, 8, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 34, 1, 141, 204, 34, 1, 121, 204, 3, 0, 1, 37, 45, 0, 119, 0, 197, 0, 1, 206, 16, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 35, 1, 141, 204, 35, 1, 121, 204, 3, 0, 1, 37, 47, 0, 119, 0, 188, 0, 1, 206, 96, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 36, 1, 141, 204, 36, 1, 121, 204, 3, 0, 1, 37, 99, 0, 119, 0, 179, 0, 134, 204, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 143, 204, 37, 1, 141, 204, 37, 1, 121, 204, 3, 0, 1, 37, 50, 0, 119, 0, 171, 0, 134, 204, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 143, 204, 38, 1, 141, 204, 38, 1, 121, 204, 3, 0, 1, 37, 106, 0, 119, 0, 163, 0, 1, 26, 1, 0, 119, 0, 161, 0, 1, 206, 86, 9, 141, 205, 134, 1, 1, 207, 104, 1, 3, 205, 205, 207, 134, 204, 0, 0, 24, 18, 1, 0, 206, 205, 0, 0, 1, 205, 128, 56, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 39, 1, 141, 204, 39, 1, 121, 204, 3, 0, 1, 15, 1, 0, 119, 0, 145, 0, 1, 15, 0, 0, 1, 205, 2, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 40, 1, 141, 204, 40, 1, 121, 204, 3, 0, 1, 37, 57, 0, 119, 0, 135, 0, 1, 205, 4, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 42, 1, 141, 204, 42, 1, 121, 204, 3, 0, 1, 37, 43, 0, 119, 0, 126, 0, 1, 205, 8, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 43, 1, 141, 204, 43, 1, 121, 204, 3, 0, 1, 37, 45, 0, 119, 0, 117, 0, 1, 205, 16, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 44, 1, 141, 204, 44, 1, 121, 204, 3, 0, 1, 37, 47, 0, 119, 0, 108, 0, 1, 205, 96, 0, 134, 204, 0, 0, 68, 132, 0, 0, 205, 0, 0, 0, 143, 204, 45, 1, 141, 204, 45, 1, 121, 204, 3, 0, 1, 37, 99, 0, 119, 0, 99, 0, 134, 204, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 143, 204, 46, 1, 141, 204, 46, 1, 121, 204, 3, 0, 1, 37, 50, 0, 119, 0, 91, 0, 134, 204, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 143, 204, 47, 1, 141, 204, 47, 1, 121, 204, 3, 0, 1, 37, 106, 0, 119, 0, 83, 0, 1, 26, 1, 0, 119, 0, 81, 0, 1, 205, 104, 9, 141, 206, 134, 1, 1, 207, 112, 1, 3, 206, 206, 207, 134, 204, 0, 0, 24, 18, 1, 0, 205, 206, 0, 0, 1, 206, 128, 56, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 48, 1, 141, 204, 48, 1, 121, 204, 3, 0, 1, 15, 1, 0, 119, 0, 65, 0, 1, 15, 0, 0, 1, 206, 2, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 49, 1, 141, 204, 49, 1, 121, 204, 3, 0, 1, 37, 57, 0, 119, 0, 55, 0, 1, 206, 4, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 50, 1, 141, 204, 50, 1, 121, 204, 3, 0, 1, 37, 43, 0, 119, 0, 46, 0, 1, 206, 8, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 51, 1, 141, 204, 51, 1, 121, 204, 3, 0, 1, 37, 45, 0, 119, 0, 37, 0, 1, 206, 16, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 53, 1, 141, 204, 53, 1, 121, 204, 3, 0, 1, 37, 47, 0, 119, 0, 28, 0, 1, 206, 96, 0, 134, 204, 0, 0, 68, 132, 0, 0, 206, 0, 0, 0, 143, 204, 54, 1, 141, 204, 54, 1, 121, 204, 3, 0, 1, 37, 99, 0, 119, 0, 19, 0, 134, 204, 0, 0, 68, 132, 0, 0, 200, 0, 0, 0, 143, 204, 55, 1, 141, 204, 55, 1, 121, 204, 3, 0, 1, 37, 50, 0, 119, 0, 11, 0, 134, 204, 0, 0, 68, 132, 0, 0, 201, 0, 0, 0, 143, 204, 56, 1, 141, 204, 56, 1, 121, 204, 3, 0, 1, 37, 106, 0, 119, 0, 3, 0, 1, 26, 1, 0, 119, 0, 1, 0, 0, 203, 26, 0, 143, 203, 57, 1, 141, 203, 57, 1, 38, 203, 203, 1, 121, 203, 22, 0, 141, 203, 134, 1, 1, 204, 120, 1, 1, 206, 255, 0, 19, 206, 0, 206, 97, 203, 204, 206, 1, 204, 123, 9, 141, 203, 134, 1, 1, 205, 120, 1, 3, 203, 203, 205, 134, 206, 0, 0, 24, 18, 1, 0, 204, 203, 0, 0, 1, 206, 10, 0, 143, 206, 82, 1, 141, 203, 82, 1, 0, 206, 203, 0, 143, 206, 68, 1, 141, 206, 134, 1, 137, 206, 0, 0, 141, 206, 68, 1, 139, 206, 0, 0, 141, 203, 134, 1, 1, 204, 136, 1, 3, 203, 203, 204, 134, 206, 0, 0, 156, 93, 0, 0, 203, 0, 0, 0, 141, 206, 134, 1, 1, 203, 144, 1, 141, 204, 134, 1, 1, 205, 136, 1, 94, 204, 204, 205, 97, 206, 203, 204, 141, 204, 134, 1, 1, 203, 144, 1, 3, 204, 204, 203, 141, 203, 134, 1, 1, 206, 136, 1, 3, 203, 203, 206, 106, 203, 203, 4, 109, 204, 4, 203, 0, 203, 15, 0, 143, 203, 58, 1, 141, 203, 58, 1, 38, 203, 203, 1, 121, 203, 27, 0, 141, 204, 134, 1, 1, 206, 144, 1, 94, 203, 204, 206, 143, 203, 60, 1, 141, 204, 134, 1, 1, 206, 144, 1, 3, 204, 204, 206, 106, 203, 204, 4, 143, 203, 61, 1, 141, 204, 60, 1, 141, 206, 61, 1, 134, 203, 0, 0, 80, 148, 0, 0, 204, 206, 1, 2, 3, 4, 0, 0, 143, 203, 62, 1, 141, 206, 62, 1, 0, 203, 206, 0, 143, 203, 82, 1, 141, 206, 82, 1, 0, 203, 206, 0, 143, 203, 68, 1, 141, 203, 134, 1, 137, 203, 0, 0, 141, 203, 68, 1, 139, 203, 0, 0, 1, 206, 171, 9, 141, 204, 134, 1, 1, 205, 128, 1, 3, 204, 204, 205, 134, 203, 0, 0, 24, 18, 1, 0, 206, 204, 0, 0, 0, 203, 37, 0, 143, 203, 63, 1, 141, 204, 63, 1, 134, 203, 0, 0, 0, 0, 0, 0, 204, 1, 2, 3, 4, 0, 0, 0, 143, 203, 65, 1, 141, 203, 65, 1, 41, 203, 203, 24, 42, 203, 203, 24, 33, 203, 203, 0, 121, 203, 12, 0, 141, 204, 65, 1, 0, 203, 204, 0, 143, 203, 82, 1, 141, 204, 82, 1, 0, 203, 204, 0, 143, 203, 68, 1, 141, 203, 134, 1, 137, 203, 0, 0, 141, 203, 68, 1, 139, 203, 0, 0, 119, 0, 16, 0, 134, 203, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 143, 203, 67, 1, 141, 204, 67, 1, 0, 203, 204, 0, 143, 203, 82, 1, 141, 204, 82, 1, 0, 203, 204, 0, 143, 203, 68, 1, 141, 203, 134, 1, 137, 203, 0, 0, 141, 203, 68, 1, 139, 203, 0, 0, 1, 203, 0, 0, 139, 203, 0, 0, 140, 6, 89, 1, 0, 0, 0, 0, 2, 200, 0, 0, 12, 2, 0, 0, 2, 201, 0, 0, 0, 202, 154, 59, 2, 202, 0, 0, 25, 16, 0, 0, 1, 203, 0, 0, 143, 203, 87, 1, 136, 204, 0, 0, 0, 203, 204, 0, 143, 203, 88, 1, 136, 203, 0, 0, 1, 204, 48, 2, 3, 203, 203, 204, 137, 203, 0, 0, 130, 203, 0, 0, 136, 204, 0, 0, 49, 203, 203, 204, 176, 47, 0, 0, 1, 204, 48, 2, 135, 203, 0, 0, 204, 0, 0, 0, 141, 204, 88, 1, 3, 203, 204, 200, 143, 203, 83, 1, 141, 203, 88, 1, 1, 204, 0, 0, 85, 203, 204, 0, 141, 204, 88, 1, 1, 203, 0, 2, 3, 204, 204, 203, 25, 116, 204, 12, 134, 204, 0, 0, 212, 26, 1, 0, 1, 0, 0, 0, 128, 204, 0, 0, 0, 122, 204, 0, 34, 204, 122, 0, 121, 204, 5, 0, 68, 20, 1, 0, 1, 33, 1, 0, 1, 34, 230, 15, 119, 0, 20, 0, 38, 204, 4, 1, 32, 204, 204, 0, 1, 203, 231, 15, 1, 205, 236, 15, 125, 6, 204, 203, 205, 0, 0, 0, 1, 205, 0, 8, 19, 205, 4, 205, 32, 205, 205, 0, 1, 203, 233, 15, 125, 7, 205, 6, 203, 0, 0, 0, 58, 20, 1, 0, 1, 203, 1, 8, 19, 203, 4, 203, 33, 203, 203, 0, 38, 203, 203, 1, 0, 33, 203, 0, 0, 34, 7, 0, 134, 203, 0, 0, 212, 26, 1, 0, 20, 0, 0, 0, 128, 203, 0, 0, 0, 168, 203, 0, 2, 203, 0, 0, 0, 0, 240, 127, 19, 203, 168, 203, 2, 205, 0, 0, 0, 0, 240, 127, 16, 203, 203, 205, 2, 205, 0, 0, 0, 0, 240, 127, 19, 205, 168, 205, 2, 204, 0, 0, 0, 0, 240, 127, 13, 205, 205, 204, 1, 204, 0, 0, 34, 204, 204, 0, 19, 205, 205, 204, 20, 203, 203, 205, 121, 203, 83, 5, 141, 205, 88, 1, 134, 203, 0, 0, 148, 29, 1, 0, 20, 205, 0, 0, 144, 203, 41, 1, 142, 203, 41, 1, 59, 205, 2, 0, 65, 203, 203, 205, 59, 205, 0, 0, 70, 203, 203, 205, 121, 203, 8, 0, 141, 205, 88, 1, 82, 203, 205, 0, 143, 203, 65, 1, 141, 203, 88, 1, 141, 205, 65, 1, 26, 205, 205, 1, 85, 203, 205, 0, 39, 205, 5, 32, 32, 205, 205, 97, 121, 205, 0, 1, 25, 205, 34, 9, 143, 205, 69, 1, 38, 205, 5, 32, 32, 205, 205, 0, 141, 203, 69, 1, 125, 35, 205, 34, 203, 0, 0, 0, 39, 205, 33, 2, 0, 203, 205, 0, 143, 203, 70, 1, 1, 203, 11, 0, 16, 203, 203, 3, 1, 205, 12, 0, 4, 205, 205, 3, 32, 205, 205, 0, 20, 203, 203, 205, 121, 203, 5, 0, 142, 203, 41, 1, 59, 205, 2, 0, 65, 43, 203, 205, 119, 0, 42, 0, 59, 29, 8, 0, 1, 205, 12, 0, 4, 50, 205, 3, 26, 205, 50, 1, 143, 205, 71, 1, 59, 203, 16, 0, 65, 205, 29, 203, 144, 205, 72, 1, 141, 205, 71, 1, 32, 205, 205, 0, 120, 205, 6, 0, 142, 205, 72, 1, 58, 29, 205, 0, 141, 205, 71, 1, 0, 50, 205, 0, 119, 0, 244, 255, 78, 205, 35, 0, 143, 205, 73, 1, 141, 205, 73, 1, 41, 205, 205, 24, 42, 205, 205, 24, 32, 205, 205, 45, 121, 205, 11, 0, 142, 205, 72, 1, 142, 203, 41, 1, 59, 204, 2, 0, 65, 203, 203, 204, 68, 203, 203, 0, 142, 204, 72, 1, 64, 203, 203, 204, 63, 205, 205, 203, 68, 43, 205, 0, 119, 0, 9, 0, 142, 205, 41, 1, 59, 203, 2, 0, 65, 205, 205, 203, 142, 203, 72, 1, 63, 205, 205, 203, 142, 203, 72, 1, 64, 43, 205, 203, 119, 0, 1, 0, 141, 205, 88, 1, 82, 203, 205, 0, 143, 203, 74, 1, 141, 204, 74, 1, 34, 204, 204, 0, 121, 204, 6, 0, 1, 204, 0, 0, 141, 206, 74, 1, 4, 204, 204, 206, 0, 205, 204, 0, 119, 0, 3, 0, 141, 204, 74, 1, 0, 205, 204, 0, 0, 203, 205, 0, 143, 203, 75, 1, 141, 205, 75, 1, 141, 204, 75, 1, 34, 204, 204, 0, 41, 204, 204, 31, 42, 204, 204, 31, 134, 203, 0, 0, 168, 202, 0, 0, 205, 204, 116, 0, 143, 203, 76, 1, 141, 203, 76, 1, 45, 203, 203, 116, 136, 50, 0, 0, 141, 203, 88, 1, 1, 204, 0, 2, 3, 203, 203, 204, 1, 204, 48, 0, 107, 203, 11, 204, 141, 204, 88, 1, 1, 203, 0, 2, 3, 204, 204, 203, 25, 31, 204, 11, 119, 0, 3, 0, 141, 204, 76, 1, 0, 31, 204, 0, 26, 204, 31, 1, 143, 204, 77, 1, 141, 204, 77, 1, 141, 203, 74, 1, 42, 203, 203, 31, 38, 203, 203, 2, 25, 203, 203, 43, 1, 205, 255, 0, 19, 203, 203, 205, 83, 204, 203, 0, 26, 203, 31, 2, 143, 203, 78, 1, 141, 203, 78, 1, 25, 204, 5, 15, 1, 205, 255, 0, 19, 204, 204, 205, 83, 203, 204, 0, 141, 204, 88, 1, 3, 36, 204, 200, 58, 60, 43, 0, 75, 204, 60, 0, 143, 204, 79, 1, 1, 203, 9, 16, 141, 205, 79, 1, 90, 204, 203, 205, 143, 204, 80, 1, 25, 204, 36, 1, 143, 204, 81, 1, 141, 204, 80, 1, 1, 203, 255, 0, 19, 204, 204, 203, 38, 203, 5, 32, 20, 204, 204, 203, 1, 203, 255, 0, 19, 204, 204, 203, 83, 36, 204, 0, 141, 203, 79, 1, 76, 203, 203, 0, 64, 204, 60, 203, 144, 204, 82, 1, 141, 204, 81, 1, 141, 203, 83, 1, 4, 204, 204, 203, 32, 204, 204, 1, 121, 204, 23, 0, 38, 204, 4, 8, 32, 204, 204, 0, 34, 203, 3, 1, 142, 205, 82, 1, 59, 206, 16, 0, 65, 205, 205, 206, 59, 206, 0, 0, 69, 205, 205, 206, 19, 203, 203, 205, 19, 204, 204, 203, 121, 204, 4, 0, 141, 204, 81, 1, 0, 54, 204, 0, 119, 0, 11, 0, 25, 204, 36, 2, 143, 204, 84, 1, 141, 204, 81, 1, 1, 203, 46, 0, 83, 204, 203, 0, 141, 203, 84, 1, 0, 54, 203, 0, 119, 0, 3, 0, 141, 203, 81, 1, 0, 54, 203, 0, 142, 203, 82, 1, 59, 204, 16, 0, 65, 203, 203, 204, 59, 204, 0, 0, 70, 203, 203, 204, 121, 203, 6, 0, 0, 36, 54, 0, 142, 203, 82, 1, 59, 204, 16, 0, 65, 60, 203, 204, 119, 0, 197, 255, 0, 204, 54, 0, 143, 204, 85, 1, 33, 203, 3, 0, 141, 205, 85, 1, 141, 206, 83, 1, 4, 205, 205, 206, 26, 205, 205, 2, 15, 205, 205, 3, 19, 203, 203, 205, 121, 203, 4, 0, 25, 203, 3, 2, 0, 204, 203, 0, 119, 0, 5, 0, 141, 203, 85, 1, 141, 205, 83, 1, 4, 203, 203, 205, 0, 204, 203, 0, 0, 106, 204, 0, 141, 204, 78, 1, 4, 204, 116, 204, 141, 203, 70, 1, 3, 204, 204, 203, 3, 115, 204, 106, 1, 203, 32, 0, 134, 204, 0, 0, 100, 252, 0, 0, 0, 203, 2, 115, 4, 0, 0, 0, 141, 203, 70, 1, 134, 204, 0, 0, 156, 26, 1, 0, 0, 35, 203, 0, 1, 203, 48, 0, 2, 205, 0, 0, 0, 0, 1, 0, 21, 205, 4, 205, 134, 204, 0, 0, 100, 252, 0, 0, 0, 203, 2, 115, 205, 0, 0, 0, 141, 205, 88, 1, 3, 205, 205, 200, 141, 203, 85, 1, 141, 206, 83, 1, 4, 203, 203, 206, 134, 204, 0, 0, 156, 26, 1, 0, 0, 205, 203, 0, 1, 203, 48, 0, 141, 205, 85, 1, 141, 206, 83, 1, 4, 205, 205, 206, 4, 205, 106, 205, 1, 206, 0, 0, 1, 207, 0, 0, 134, 204, 0, 0, 100, 252, 0, 0, 0, 203, 205, 206, 207, 0, 0, 0, 141, 207, 78, 1, 141, 206, 78, 1, 4, 206, 116, 206, 134, 204, 0, 0, 156, 26, 1, 0, 0, 207, 206, 0, 1, 206, 32, 0, 1, 207, 0, 32, 21, 207, 4, 207, 134, 204, 0, 0, 100, 252, 0, 0, 0, 206, 2, 115, 207, 0, 0, 0, 0, 114, 115, 0, 119, 0, 117, 4, 34, 204, 3, 0, 1, 207, 6, 0, 125, 84, 204, 207, 3, 0, 0, 0, 142, 207, 41, 1, 59, 204, 2, 0, 65, 207, 207, 204, 59, 204, 0, 0, 70, 207, 207, 204, 121, 207, 14, 0, 141, 207, 88, 1, 82, 117, 207, 0, 141, 207, 88, 1, 26, 204, 117, 28, 85, 207, 204, 0, 142, 204, 41, 1, 59, 207, 2, 0, 65, 204, 204, 207, 60, 207, 0, 0, 0, 0, 0, 16, 65, 70, 204, 207, 26, 108, 117, 28, 119, 0, 7, 0, 141, 207, 88, 1, 82, 110, 207, 0, 142, 207, 41, 1, 59, 204, 2, 0, 65, 70, 207, 204, 0, 108, 110, 0, 34, 118, 108, 0, 121, 118, 5, 0, 141, 207, 88, 1, 25, 207, 207, 8, 0, 204, 207, 0, 119, 0, 6, 0, 141, 207, 88, 1, 25, 207, 207, 8, 1, 206, 32, 1, 3, 207, 207, 206, 0, 204, 207, 0, 0, 94, 204, 0, 0, 28, 94, 0, 58, 77, 70, 0, 75, 119, 77, 0, 85, 28, 119, 0, 25, 120, 28, 4, 77, 204, 119, 0, 64, 121, 77, 204, 60, 204, 0, 0, 0, 202, 154, 59, 65, 204, 121, 204, 59, 207, 0, 0, 70, 204, 204, 207, 121, 204, 6, 0, 0, 28, 120, 0, 60, 204, 0, 0, 0, 202, 154, 59, 65, 77, 121, 204, 119, 0, 241, 255, 1, 204, 0, 0, 15, 123, 204, 108, 121, 123, 80, 0, 0, 46, 94, 0, 0, 49, 120, 0, 0, 125, 108, 0, 34, 124, 125, 29, 1, 204, 29, 0, 125, 126, 124, 125, 204, 0, 0, 0, 26, 24, 49, 4, 16, 127, 24, 46, 121, 127, 3, 0, 0, 64, 46, 0, 119, 0, 41, 0, 0, 25, 24, 0, 1, 27, 0, 0, 82, 128, 25, 0, 1, 204, 0, 0, 135, 129, 1, 0, 128, 204, 126, 0, 128, 204, 0, 0, 0, 130, 204, 0, 1, 204, 0, 0, 134, 131, 0, 0, 164, 28, 1, 0, 129, 130, 27, 204, 128, 204, 0, 0, 0, 132, 204, 0, 1, 204, 0, 0, 134, 133, 0, 0, 164, 20, 1, 0, 131, 132, 201, 204, 128, 204, 0, 0, 0, 134, 204, 0, 85, 25, 133, 0, 1, 204, 0, 0, 134, 135, 0, 0, 132, 28, 1, 0, 131, 132, 201, 204, 128, 204, 0, 0, 0, 136, 204, 0, 26, 23, 25, 4, 16, 137, 23, 46, 120, 137, 4, 0, 0, 25, 23, 0, 0, 27, 135, 0, 119, 0, 226, 255, 32, 204, 135, 0, 121, 204, 3, 0, 0, 64, 46, 0, 119, 0, 4, 0, 26, 138, 46, 4, 85, 138, 135, 0, 0, 64, 138, 0, 0, 65, 49, 0, 16, 139, 64, 65, 120, 139, 2, 0, 119, 0, 7, 0, 26, 140, 65, 4, 82, 141, 140, 0, 32, 204, 141, 0, 121, 204, 3, 0, 0, 65, 140, 0, 119, 0, 248, 255, 141, 204, 88, 1, 82, 142, 204, 0, 141, 204, 88, 1, 4, 207, 142, 126, 85, 204, 207, 0, 1, 207, 0, 0, 4, 204, 142, 126, 47, 207, 207, 204, 28, 55, 0, 0, 0, 46, 64, 0, 0, 49, 65, 0, 4, 125, 142, 126, 119, 0, 185, 255, 0, 45, 64, 0, 0, 48, 65, 0, 4, 109, 142, 126, 119, 0, 4, 0, 0, 45, 94, 0, 0, 48, 120, 0, 0, 109, 108, 0, 34, 143, 109, 0, 121, 143, 90, 0, 0, 73, 45, 0, 0, 75, 48, 0, 0, 145, 109, 0, 1, 207, 0, 0, 4, 144, 207, 145, 34, 207, 144, 9, 1, 204, 9, 0, 125, 146, 207, 144, 204, 0, 0, 0, 16, 147, 73, 75, 121, 147, 34, 0, 1, 22, 0, 0, 0, 47, 73, 0, 82, 150, 47, 0, 24, 204, 150, 146, 3, 151, 204, 22, 85, 47, 151, 0, 1, 204, 1, 0, 22, 204, 204, 146, 26, 204, 204, 1, 19, 204, 150, 204, 24, 207, 201, 146, 5, 152, 204, 207, 25, 153, 47, 4, 16, 154, 153, 75, 121, 154, 4, 0, 0, 22, 152, 0, 0, 47, 153, 0, 119, 0, 241, 255, 82, 155, 73, 0, 25, 156, 73, 4, 32, 207, 155, 0, 125, 9, 207, 156, 73, 0, 0, 0, 32, 207, 152, 0, 121, 207, 4, 0, 0, 11, 9, 0, 0, 81, 75, 0, 119, 0, 13, 0, 25, 157, 75, 4, 85, 75, 152, 0, 0, 11, 9, 0, 0, 81, 157, 0, 119, 0, 8, 0, 82, 148, 73, 0, 25, 149, 73, 4, 32, 207, 148, 0, 125, 10, 207, 149, 73, 0, 0, 0, 0, 11, 10, 0, 0, 81, 75, 0, 39, 207, 5, 32, 32, 207, 207, 102, 125, 158, 207, 94, 11, 0, 0, 0, 0, 159, 81, 0, 25, 204, 84, 25, 28, 204, 204, 9, 38, 204, 204, 255, 25, 204, 204, 1, 4, 206, 159, 158, 42, 206, 206, 2, 47, 204, 204, 206, 96, 56, 0, 0, 25, 204, 84, 25, 28, 204, 204, 9, 38, 204, 204, 255, 25, 204, 204, 1, 41, 204, 204, 2, 3, 204, 158, 204, 0, 207, 204, 0, 119, 0, 2, 0, 0, 207, 81, 0, 0, 13, 207, 0, 141, 207, 88, 1, 82, 160, 207, 0, 141, 207, 88, 1, 3, 204, 160, 146, 85, 207, 204, 0, 3, 204, 160, 146, 34, 204, 204, 0, 121, 204, 5, 0, 0, 73, 11, 0, 0, 75, 13, 0, 3, 145, 160, 146, 119, 0, 174, 255, 0, 72, 11, 0, 0, 74, 13, 0, 119, 0, 3, 0, 0, 72, 45, 0, 0, 74, 48, 0, 16, 161, 72, 74, 121, 161, 22, 0, 0, 162, 72, 0, 82, 163, 72, 0, 35, 204, 163, 10, 121, 204, 5, 0, 4, 204, 94, 162, 42, 204, 204, 2, 27, 53, 204, 9, 119, 0, 15, 0, 4, 204, 94, 162, 42, 204, 204, 2, 27, 32, 204, 9, 1, 39, 10, 0, 27, 164, 39, 10, 25, 165, 32, 1, 48, 204, 163, 164, 252, 56, 0, 0, 0, 53, 165, 0, 119, 0, 5, 0, 0, 32, 165, 0, 0, 39, 164, 0, 119, 0, 248, 255, 1, 53, 0, 0, 39, 204, 5, 32, 33, 204, 204, 102, 1, 207, 0, 0, 125, 166, 204, 53, 207, 0, 0, 0, 4, 207, 84, 166, 33, 204, 84, 0, 39, 206, 5, 32, 32, 206, 206, 103, 19, 204, 204, 206, 41, 204, 204, 31, 42, 204, 204, 31, 3, 167, 207, 204, 0, 169, 74, 0, 4, 204, 169, 94, 42, 204, 204, 2, 27, 204, 204, 9, 26, 204, 204, 9, 47, 204, 167, 204, 60, 60, 0, 0, 25, 204, 94, 4, 1, 207, 0, 36, 3, 207, 167, 207, 28, 207, 207, 9, 38, 207, 207, 255, 1, 206, 0, 4, 4, 207, 207, 206, 41, 207, 207, 2, 3, 170, 204, 207, 1, 207, 0, 36, 3, 207, 167, 207, 30, 207, 207, 9, 38, 207, 207, 255, 25, 207, 207, 1, 34, 207, 207, 9, 121, 207, 16, 0, 1, 207, 0, 36, 3, 207, 167, 207, 30, 207, 207, 9, 38, 207, 207, 255, 25, 38, 207, 1, 1, 57, 10, 0, 27, 171, 57, 10, 25, 37, 38, 1, 32, 207, 37, 9, 121, 207, 3, 0, 0, 56, 171, 0, 119, 0, 5, 0, 0, 38, 37, 0, 0, 57, 171, 0, 119, 0, 248, 255, 1, 56, 10, 0, 82, 172, 170, 0, 9, 207, 172, 56, 38, 207, 207, 255, 0, 173, 207, 0, 25, 207, 170, 4, 13, 174, 207, 74, 32, 207, 173, 0, 19, 207, 174, 207, 121, 207, 5, 0, 0, 80, 170, 0, 0, 82, 53, 0, 0, 103, 72, 0, 119, 0, 132, 0, 7, 207, 172, 56, 38, 207, 207, 255, 0, 175, 207, 0, 38, 204, 175, 1, 32, 204, 204, 0, 121, 204, 5, 0, 61, 204, 0, 0, 0, 0, 0, 90, 58, 207, 204, 0, 119, 0, 5, 0, 62, 204, 0, 0, 1, 0, 0, 0, 0, 0, 64, 67, 58, 207, 204, 0, 58, 86, 207, 0, 28, 207, 56, 2, 38, 207, 207, 255, 0, 176, 207, 0, 13, 204, 173, 176, 19, 204, 174, 204, 121, 204, 4, 0, 59, 204, 1, 0, 58, 207, 204, 0, 119, 0, 4, 0, 61, 204, 0, 0, 0, 0, 192, 63, 58, 207, 204, 0, 58, 95, 207, 0, 48, 204, 173, 176, 152, 58, 0, 0, 61, 204, 0, 0, 0, 0, 0, 63, 58, 207, 204, 0, 119, 0, 2, 0, 58, 207, 95, 0, 58, 15, 207, 0, 32, 177, 33, 0, 121, 177, 4, 0, 58, 41, 15, 0, 58, 42, 86, 0, 119, 0, 22, 0, 78, 178, 34, 0, 41, 204, 178, 24, 42, 204, 204, 24, 32, 204, 204, 45, 121, 204, 4, 0, 68, 204, 86, 0, 58, 207, 204, 0, 119, 0, 2, 0, 58, 207, 86, 0, 58, 14, 207, 0, 41, 204, 178, 24, 42, 204, 204, 24, 32, 204, 204, 45, 121, 204, 4, 0, 68, 204, 15, 0, 58, 207, 204, 0, 119, 0, 2, 0, 58, 207, 15, 0, 58, 8, 207, 0, 58, 41, 8, 0, 58, 42, 14, 0, 4, 207, 172, 173, 85, 170, 207, 0, 63, 179, 42, 41, 70, 180, 179, 42, 121, 180, 62, 0, 4, 207, 172, 173, 3, 181, 207, 56, 85, 170, 181, 0, 2, 207, 0, 0, 255, 201, 154, 59, 48, 207, 207, 181, 164, 59, 0, 0, 0, 90, 72, 0, 0, 113, 170, 0, 26, 182, 113, 4, 1, 207, 0, 0, 85, 113, 207, 0, 16, 183, 182, 90, 121, 183, 6, 0, 26, 184, 90, 4, 1, 207, 0, 0, 85, 184, 207, 0, 0, 97, 184, 0, 119, 0, 2, 0, 0, 97, 90, 0, 82, 185, 182, 0, 25, 207, 185, 1, 85, 182, 207, 0, 2, 207, 0, 0, 255, 201, 154, 59, 25, 204, 185, 1, 48, 207, 207, 204, 152, 59, 0, 0, 0, 90, 97, 0, 0, 113, 182, 0, 119, 0, 235, 255, 0, 89, 97, 0, 0, 112, 182, 0, 119, 0, 3, 0, 0, 89, 72, 0, 0, 112, 170, 0, 0, 186, 89, 0, 82, 187, 89, 0, 35, 207, 187, 10, 121, 207, 7, 0, 0, 80, 112, 0, 4, 207, 94, 186, 42, 207, 207, 2, 27, 82, 207, 9, 0, 103, 89, 0, 119, 0, 19, 0, 4, 207, 94, 186, 42, 207, 207, 2, 27, 67, 207, 9, 1, 69, 10, 0, 27, 188, 69, 10, 25, 189, 67, 1, 48, 207, 187, 188, 4, 60, 0, 0, 0, 80, 112, 0, 0, 82, 189, 0, 0, 103, 89, 0, 119, 0, 7, 0, 0, 67, 189, 0, 0, 69, 188, 0, 119, 0, 246, 255, 0, 80, 170, 0, 0, 82, 53, 0, 0, 103, 72, 0, 25, 190, 80, 4, 16, 191, 190, 74, 125, 12, 191, 190, 74, 0, 0, 0, 0, 92, 82, 0, 0, 102, 12, 0, 0, 104, 103, 0, 119, 0, 4, 0, 0, 92, 53, 0, 0, 102, 74, 0, 0, 104, 72, 0, 0, 100, 102, 0, 16, 192, 104, 100, 120, 192, 3, 0, 1, 105, 0, 0, 119, 0, 9, 0, 26, 193, 100, 4, 82, 194, 193, 0, 32, 207, 194, 0, 121, 207, 3, 0, 0, 100, 193, 0, 119, 0, 247, 255, 1, 105, 1, 0, 119, 0, 1, 0, 1, 207, 0, 0, 4, 195, 207, 92, 39, 207, 5, 32, 32, 207, 207, 103, 121, 207, 119, 0, 33, 207, 84, 0, 40, 207, 207, 1, 38, 207, 207, 1, 3, 85, 207, 84, 15, 196, 92, 85, 1, 207, 251, 255, 15, 197, 207, 92, 19, 207, 196, 197, 121, 207, 6, 0, 26, 207, 85, 1, 4, 198, 207, 92, 26, 21, 5, 1, 0, 61, 198, 0, 119, 0, 3, 0, 26, 21, 5, 2, 26, 61, 85, 1, 38, 207, 4, 8, 32, 207, 207, 0, 121, 207, 95, 0, 121, 105, 36, 0, 26, 199, 100, 4, 82, 207, 199, 0, 143, 207, 0, 1, 141, 207, 0, 1, 32, 207, 207, 0, 121, 207, 3, 0, 1, 68, 9, 0, 119, 0, 29, 0, 141, 207, 0, 1, 31, 207, 207, 10, 38, 207, 207, 255, 32, 207, 207, 0, 121, 207, 21, 0, 1, 55, 0, 0, 1, 76, 10, 0, 27, 207, 76, 10, 143, 207, 1, 1, 25, 207, 55, 1, 143, 207, 2, 1, 141, 207, 0, 1, 141, 204, 1, 1, 9, 207, 207, 204, 38, 207, 207, 255, 32, 207, 207, 0, 121, 207, 6, 0, 141, 207, 2, 1, 0, 55, 207, 0, 141, 207, 1, 1, 0, 76, 207, 0, 119, 0, 242, 255, 141, 207, 2, 1, 0, 68, 207, 0, 119, 0, 4, 0, 1, 68, 0, 0, 119, 0, 2, 0, 1, 68, 9, 0, 39, 204, 21, 32, 0, 207, 204, 0, 143, 207, 3, 1, 0, 207, 100, 0, 143, 207, 4, 1, 141, 207, 3, 1, 32, 207, 207, 102, 121, 207, 24, 0, 141, 204, 4, 1, 4, 204, 204, 94, 42, 204, 204, 2, 27, 204, 204, 9, 26, 204, 204, 9, 4, 207, 204, 68, 143, 207, 5, 1, 1, 207, 0, 0, 141, 204, 5, 1, 15, 207, 207, 204, 141, 204, 5, 1, 1, 206, 0, 0, 125, 87, 207, 204, 206, 0, 0, 0, 15, 206, 61, 87, 143, 206, 6, 1, 141, 206, 6, 1, 125, 62, 206, 61, 87, 0, 0, 0, 0, 44, 21, 0, 0, 71, 62, 0, 1, 111, 0, 0, 119, 0, 36, 0, 141, 204, 4, 1, 4, 204, 204, 94, 42, 204, 204, 2, 27, 204, 204, 9, 26, 204, 204, 9, 3, 206, 204, 92, 143, 206, 7, 1, 141, 204, 7, 1, 4, 206, 204, 68, 143, 206, 8, 1, 1, 206, 0, 0, 141, 204, 8, 1, 15, 206, 206, 204, 141, 204, 8, 1, 1, 207, 0, 0, 125, 88, 206, 204, 207, 0, 0, 0, 15, 207, 61, 88, 143, 207, 9, 1, 141, 207, 9, 1, 125, 63, 207, 61, 88, 0, 0, 0, 0, 44, 21, 0, 0, 71, 63, 0, 1, 111, 0, 0, 119, 0, 10, 0, 0, 44, 21, 0, 0, 71, 61, 0, 38, 207, 4, 8, 0, 111, 207, 0, 119, 0, 5, 0, 0, 44, 5, 0, 0, 71, 84, 0, 38, 207, 4, 8, 0, 111, 207, 0, 20, 204, 71, 111, 0, 207, 204, 0, 143, 207, 10, 1, 39, 204, 44, 32, 0, 207, 204, 0, 143, 207, 12, 1, 141, 207, 12, 1, 32, 207, 207, 102, 121, 207, 13, 0, 1, 204, 0, 0, 15, 207, 204, 92, 143, 207, 13, 1, 141, 204, 13, 1, 1, 206, 0, 0, 125, 207, 204, 92, 206, 0, 0, 0, 143, 207, 14, 1, 1, 66, 0, 0, 141, 207, 14, 1, 0, 107, 207, 0, 119, 0, 64, 0, 34, 207, 92, 0, 143, 207, 15, 1, 141, 206, 15, 1, 125, 207, 206, 195, 92, 0, 0, 0, 143, 207, 16, 1, 141, 206, 16, 1, 141, 204, 16, 1, 34, 204, 204, 0, 41, 204, 204, 31, 42, 204, 204, 31, 134, 207, 0, 0, 168, 202, 0, 0, 206, 204, 116, 0, 143, 207, 18, 1, 141, 207, 18, 1, 4, 207, 116, 207, 34, 207, 207, 2, 121, 207, 18, 0, 141, 207, 18, 1, 0, 52, 207, 0, 26, 207, 52, 1, 143, 207, 19, 1, 141, 207, 19, 1, 1, 204, 48, 0, 83, 207, 204, 0, 141, 204, 19, 1, 4, 204, 116, 204, 34, 204, 204, 2, 121, 204, 4, 0, 141, 204, 19, 1, 0, 52, 204, 0, 119, 0, 245, 255, 141, 204, 19, 1, 0, 51, 204, 0, 119, 0, 3, 0, 141, 204, 18, 1, 0, 51, 204, 0, 42, 207, 92, 31, 0, 204, 207, 0, 143, 204, 20, 1, 26, 204, 51, 1, 143, 204, 22, 1, 141, 204, 22, 1, 141, 207, 20, 1, 38, 207, 207, 2, 25, 207, 207, 43, 1, 206, 255, 0, 19, 207, 207, 206, 83, 204, 207, 0, 1, 204, 255, 0, 19, 204, 44, 204, 0, 207, 204, 0, 143, 207, 23, 1, 26, 207, 51, 2, 143, 207, 24, 1, 141, 207, 24, 1, 141, 204, 23, 1, 83, 207, 204, 0, 141, 204, 24, 1, 0, 66, 204, 0, 141, 204, 24, 1, 4, 107, 116, 204, 25, 204, 33, 1, 143, 204, 25, 1, 141, 207, 25, 1, 3, 204, 207, 71, 143, 204, 26, 1, 141, 207, 26, 1, 141, 206, 10, 1, 33, 206, 206, 0, 38, 206, 206, 1, 3, 207, 207, 206, 3, 204, 207, 107, 143, 204, 28, 1, 1, 207, 32, 0, 141, 206, 28, 1, 134, 204, 0, 0, 100, 252, 0, 0, 0, 207, 2, 206, 4, 0, 0, 0, 134, 204, 0, 0, 156, 26, 1, 0, 0, 34, 33, 0, 1, 206, 48, 0, 141, 207, 28, 1, 2, 205, 0, 0, 0, 0, 1, 0, 21, 205, 4, 205, 134, 204, 0, 0, 100, 252, 0, 0, 0, 206, 2, 207, 205, 0, 0, 0, 141, 204, 12, 1, 32, 204, 204, 102, 121, 204, 193, 0, 16, 204, 94, 104, 143, 204, 29, 1, 141, 204, 29, 1, 125, 26, 204, 94, 104, 0, 0, 0, 0, 91, 26, 0, 82, 204, 91, 0, 143, 204, 30, 1, 141, 205, 30, 1, 1, 207, 0, 0, 141, 206, 88, 1, 3, 206, 206, 200, 25, 206, 206, 9, 134, 204, 0, 0, 168, 202, 0, 0, 205, 207, 206, 0, 143, 204, 31, 1, 13, 204, 91, 26, 143, 204, 32, 1, 141, 204, 32, 1, 121, 204, 18, 0, 141, 204, 31, 1, 141, 206, 88, 1, 3, 206, 206, 200, 25, 206, 206, 9, 45, 204, 204, 206, 216, 64, 0, 0, 141, 204, 88, 1, 3, 204, 204, 200, 1, 206, 48, 0, 107, 204, 8, 206, 141, 206, 88, 1, 3, 206, 206, 200, 25, 40, 206, 8, 119, 0, 34, 0, 141, 206, 31, 1, 0, 40, 206, 0, 119, 0, 31, 0, 141, 206, 88, 1, 3, 206, 206, 200, 141, 204, 31, 1, 48, 206, 206, 204, 84, 65, 0, 0, 141, 204, 88, 1, 3, 204, 204, 200, 1, 207, 48, 0, 141, 205, 31, 1, 141, 203, 83, 1, 4, 205, 205, 203, 135, 206, 2, 0, 204, 207, 205, 0, 141, 206, 31, 1, 0, 19, 206, 0, 26, 206, 19, 1, 143, 206, 33, 1, 141, 206, 88, 1, 3, 206, 206, 200, 141, 205, 33, 1, 48, 206, 206, 205, 72, 65, 0, 0, 141, 206, 33, 1, 0, 19, 206, 0, 119, 0, 247, 255, 141, 206, 33, 1, 0, 40, 206, 0, 119, 0, 3, 0, 141, 206, 31, 1, 0, 40, 206, 0, 0, 206, 40, 0, 143, 206, 34, 1, 141, 205, 88, 1, 3, 205, 205, 200, 25, 205, 205, 9, 141, 207, 34, 1, 4, 205, 205, 207, 134, 206, 0, 0, 156, 26, 1, 0, 0, 40, 205, 0, 25, 206, 91, 4, 143, 206, 35, 1, 141, 206, 35, 1, 55, 206, 94, 206, 164, 65, 0, 0, 141, 206, 35, 1, 0, 91, 206, 0, 119, 0, 177, 255, 141, 206, 10, 1, 32, 206, 206, 0, 120, 206, 5, 0, 1, 205, 1, 0, 134, 206, 0, 0, 156, 26, 1, 0, 0, 202, 205, 0, 141, 205, 35, 1, 16, 206, 205, 100, 143, 206, 36, 1, 1, 205, 0, 0, 15, 206, 205, 71, 143, 206, 37, 1, 141, 206, 36, 1, 141, 205, 37, 1, 19, 206, 206, 205, 121, 206, 78, 0, 0, 79, 71, 0, 141, 206, 35, 1, 0, 98, 206, 0, 82, 206, 98, 0, 143, 206, 38, 1, 141, 205, 38, 1, 1, 207, 0, 0, 141, 204, 88, 1, 3, 204, 204, 200, 25, 204, 204, 9, 134, 206, 0, 0, 168, 202, 0, 0, 205, 207, 204, 0, 143, 206, 39, 1, 141, 206, 88, 1, 3, 206, 206, 200, 141, 204, 39, 1, 48, 206, 206, 204, 144, 66, 0, 0, 141, 204, 88, 1, 3, 204, 204, 200, 1, 207, 48, 0, 141, 205, 39, 1, 141, 203, 83, 1, 4, 205, 205, 203, 135, 206, 2, 0, 204, 207, 205, 0, 141, 206, 39, 1, 0, 18, 206, 0, 26, 206, 18, 1, 143, 206, 40, 1, 141, 206, 88, 1, 3, 206, 206, 200, 141, 205, 40, 1, 48, 206, 206, 205, 132, 66, 0, 0, 141, 206, 40, 1, 0, 18, 206, 0, 119, 0, 247, 255, 141, 206, 40, 1, 0, 17, 206, 0, 119, 0, 3, 0, 141, 206, 39, 1, 0, 17, 206, 0, 34, 206, 79, 9, 143, 206, 42, 1, 141, 205, 42, 1, 1, 207, 9, 0, 125, 206, 205, 79, 207, 0, 0, 0, 143, 206, 43, 1, 141, 207, 43, 1, 134, 206, 0, 0, 156, 26, 1, 0, 0, 17, 207, 0, 25, 206, 98, 4, 143, 206, 44, 1, 26, 206, 79, 9, 143, 206, 45, 1, 141, 207, 44, 1, 16, 206, 207, 100, 143, 206, 46, 1, 1, 207, 9, 0, 15, 206, 207, 79, 143, 206, 47, 1, 141, 206, 46, 1, 141, 207, 47, 1, 19, 206, 206, 207, 121, 206, 6, 0, 141, 206, 45, 1, 0, 79, 206, 0, 141, 206, 44, 1, 0, 98, 206, 0, 119, 0, 186, 255, 141, 206, 45, 1, 0, 78, 206, 0, 119, 0, 2, 0, 0, 78, 71, 0, 25, 206, 78, 9, 143, 206, 48, 1, 1, 207, 48, 0, 141, 205, 48, 1, 1, 204, 9, 0, 1, 203, 0, 0, 134, 206, 0, 0, 100, 252, 0, 0, 0, 207, 205, 204, 203, 0, 0, 0, 119, 0, 159, 0, 25, 206, 104, 4, 143, 206, 49, 1, 141, 206, 49, 1, 125, 101, 105, 100, 206, 0, 0, 0, 1, 203, 255, 255, 15, 206, 203, 71, 143, 206, 50, 1, 141, 206, 50, 1, 121, 206, 131, 0, 32, 206, 111, 0, 143, 206, 51, 1, 0, 96, 71, 0, 0, 99, 104, 0, 82, 206, 99, 0, 143, 206, 52, 1, 141, 203, 52, 1, 1, 204, 0, 0, 141, 205, 88, 1, 3, 205, 205, 200, 25, 205, 205, 9, 134, 206, 0, 0, 168, 202, 0, 0, 203, 204, 205, 0, 143, 206, 53, 1, 141, 206, 53, 1, 141, 205, 88, 1, 3, 205, 205, 200, 25, 205, 205, 9, 45, 206, 206, 205, 232, 67, 0, 0, 141, 206, 88, 1, 3, 206, 206, 200, 1, 205, 48, 0, 107, 206, 8, 205, 141, 205, 88, 1, 3, 205, 205, 200, 25, 16, 205, 8, 119, 0, 3, 0, 141, 205, 53, 1, 0, 16, 205, 0, 13, 205, 99, 104, 143, 205, 54, 1, 141, 205, 54, 1, 121, 205, 23, 0, 25, 205, 16, 1, 143, 205, 57, 1, 1, 206, 1, 0, 134, 205, 0, 0, 156, 26, 1, 0, 0, 16, 206, 0, 34, 205, 96, 1, 143, 205, 58, 1, 141, 205, 51, 1, 141, 206, 58, 1, 19, 205, 205, 206, 121, 205, 4, 0, 141, 205, 57, 1, 0, 59, 205, 0, 119, 0, 41, 0, 1, 206, 1, 0, 134, 205, 0, 0, 156, 26, 1, 0, 0, 202, 206, 0, 141, 205, 57, 1, 0, 59, 205, 0, 119, 0, 34, 0, 141, 206, 88, 1, 3, 206, 206, 200, 16, 205, 206, 16, 143, 205, 55, 1, 141, 205, 55, 1, 120, 205, 3, 0, 0, 59, 16, 0, 119, 0, 26, 0, 1, 206, 0, 0, 141, 204, 83, 1, 4, 206, 206, 204, 3, 205, 16, 206, 143, 205, 86, 1, 141, 206, 88, 1, 3, 206, 206, 200, 1, 204, 48, 0, 141, 203, 86, 1, 135, 205, 2, 0, 206, 204, 203, 0, 0, 58, 16, 0, 26, 205, 58, 1, 143, 205, 56, 1, 141, 205, 88, 1, 3, 205, 205, 200, 141, 203, 56, 1, 48, 205, 205, 203, 208, 68, 0, 0, 141, 205, 56, 1, 0, 58, 205, 0, 119, 0, 247, 255, 141, 205, 56, 1, 0, 59, 205, 0, 119, 0, 1, 0, 0, 205, 59, 0, 143, 205, 59, 1, 141, 203, 88, 1, 3, 203, 203, 200, 25, 203, 203, 9, 141, 204, 59, 1, 4, 205, 203, 204, 143, 205, 60, 1, 141, 204, 60, 1, 15, 205, 204, 96, 143, 205, 61, 1, 141, 204, 61, 1, 141, 203, 60, 1, 125, 205, 204, 203, 96, 0, 0, 0, 143, 205, 62, 1, 141, 203, 62, 1, 134, 205, 0, 0, 156, 26, 1, 0, 0, 59, 203, 0, 141, 203, 60, 1, 4, 205, 96, 203, 143, 205, 63, 1, 25, 205, 99, 4, 143, 205, 64, 1, 141, 205, 64, 1, 16, 205, 205, 101, 1, 203, 255, 255, 141, 204, 63, 1, 15, 203, 203, 204, 19, 205, 205, 203, 121, 205, 6, 0, 141, 205, 63, 1, 0, 96, 205, 0, 141, 205, 64, 1, 0, 99, 205, 0, 119, 0, 134, 255, 141, 205, 63, 1, 0, 83, 205, 0, 119, 0, 2, 0, 0, 83, 71, 0, 25, 205, 83, 18, 143, 205, 66, 1, 1, 203, 48, 0, 141, 204, 66, 1, 1, 206, 18, 0, 1, 207, 0, 0, 134, 205, 0, 0, 100, 252, 0, 0, 0, 203, 204, 206, 207, 0, 0, 0, 0, 205, 66, 0, 143, 205, 67, 1, 141, 207, 67, 1, 4, 207, 116, 207, 134, 205, 0, 0, 156, 26, 1, 0, 0, 66, 207, 0, 1, 207, 32, 0, 141, 206, 28, 1, 1, 204, 0, 32, 21, 204, 4, 204, 134, 205, 0, 0, 100, 252, 0, 0, 0, 207, 2, 206, 204, 0, 0, 0, 141, 205, 28, 1, 0, 114, 205, 0, 119, 0, 55, 0, 38, 204, 5, 32, 33, 204, 204, 0, 1, 206, 249, 15, 1, 207, 253, 15, 125, 205, 204, 206, 207, 0, 0, 0, 143, 205, 11, 1, 70, 207, 20, 20, 59, 206, 0, 0, 59, 204, 0, 0, 70, 206, 206, 204, 20, 207, 207, 206, 0, 205, 207, 0, 143, 205, 17, 1, 38, 207, 5, 32, 33, 207, 207, 0, 1, 206, 1, 16, 1, 204, 5, 16, 125, 205, 207, 206, 204, 0, 0, 0, 143, 205, 21, 1, 141, 205, 17, 1, 141, 204, 21, 1, 141, 206, 11, 1, 125, 30, 205, 204, 206, 0, 0, 0, 25, 206, 33, 3, 143, 206, 27, 1, 1, 204, 32, 0, 141, 205, 27, 1, 2, 207, 0, 0, 255, 255, 254, 255, 19, 207, 4, 207, 134, 206, 0, 0, 100, 252, 0, 0, 0, 204, 2, 205, 207, 0, 0, 0, 134, 206, 0, 0, 156, 26, 1, 0, 0, 34, 33, 0, 1, 207, 3, 0, 134, 206, 0, 0, 156, 26, 1, 0, 0, 30, 207, 0, 1, 207, 32, 0, 141, 205, 27, 1, 1, 204, 0, 32, 21, 204, 4, 204, 134, 206, 0, 0, 100, 252, 0, 0, 0, 207, 2, 205, 204, 0, 0, 0, 141, 206, 27, 1, 0, 114, 206, 0, 15, 206, 114, 2, 143, 206, 68, 1, 141, 206, 68, 1, 125, 93, 206, 2, 114, 0, 0, 0, 141, 206, 88, 1, 137, 206, 0, 0, 139, 93, 0, 0, 140, 5, 59, 1, 0, 0, 0, 0, 2, 200, 0, 0, 213, 15, 0, 0, 2, 201, 0, 0, 255, 0, 0, 0, 2, 202, 0, 0, 137, 40, 1, 0, 1, 203, 0, 0, 143, 203, 57, 1, 136, 204, 0, 0, 0, 203, 204, 0, 143, 203, 58, 1, 136, 203, 0, 0, 25, 203, 203, 64, 137, 203, 0, 0, 130, 203, 0, 0, 136, 204, 0, 0, 49, 203, 203, 204, 68, 71, 0, 0, 1, 204, 64, 0, 135, 203, 0, 0, 204, 0, 0, 0, 141, 203, 58, 1, 109, 203, 16, 1, 141, 203, 58, 1, 25, 203, 203, 24, 25, 81, 203, 40, 1, 22, 0, 0, 1, 23, 0, 0, 1, 33, 0, 0, 0, 133, 1, 0, 1, 203, 255, 255, 15, 101, 203, 23, 121, 101, 15, 0, 2, 203, 0, 0, 255, 255, 255, 127, 4, 105, 203, 23, 15, 109, 105, 22, 121, 109, 7, 0, 134, 115, 0, 0, 232, 28, 1, 0, 1, 203, 75, 0, 85, 115, 203, 0, 1, 42, 255, 255, 119, 0, 5, 0, 3, 123, 22, 23, 0, 42, 123, 0, 119, 0, 2, 0, 0, 42, 23, 0, 78, 127, 133, 0, 41, 203, 127, 24, 42, 203, 203, 24, 32, 203, 203, 0, 121, 203, 4, 0, 1, 203, 87, 0, 143, 203, 57, 1, 119, 0, 49, 5, 0, 140, 127, 0, 0, 152, 133, 0, 41, 203, 140, 24, 42, 203, 203, 24, 1, 204, 0, 0, 1, 205, 38, 0, 138, 203, 204, 205, 136, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 132, 72, 0, 0, 152, 72, 0, 0, 119, 0, 10, 0, 0, 24, 152, 0, 0, 204, 152, 0, 143, 204, 15, 1, 119, 0, 13, 0, 0, 25, 152, 0, 0, 164, 152, 0, 1, 204, 9, 0, 143, 204, 57, 1, 119, 0, 8, 0, 25, 143, 152, 1, 141, 203, 58, 1, 109, 203, 16, 143, 78, 72, 143, 0, 0, 140, 72, 0, 0, 152, 143, 0, 119, 0, 197, 255, 141, 203, 57, 1, 32, 203, 203, 9, 121, 203, 33, 0, 1, 203, 0, 0, 143, 203, 57, 1, 25, 157, 164, 1, 78, 169, 157, 0, 41, 203, 169, 24, 42, 203, 203, 24, 32, 203, 203, 37, 120, 203, 5, 0, 0, 24, 25, 0, 0, 203, 164, 0, 143, 203, 15, 1, 119, 0, 21, 0, 25, 184, 25, 1, 25, 194, 164, 2, 141, 203, 58, 1, 109, 203, 16, 194, 78, 203, 194, 0, 143, 203, 3, 1, 141, 203, 3, 1, 41, 203, 203, 24, 42, 203, 203, 24, 32, 203, 203, 37, 121, 203, 6, 0, 0, 25, 184, 0, 0, 164, 194, 0, 1, 203, 9, 0, 143, 203, 57, 1, 119, 0, 229, 255, 0, 24, 184, 0, 0, 203, 194, 0, 143, 203, 15, 1, 119, 0, 1, 0, 0, 203, 24, 0, 143, 203, 12, 1, 0, 203, 133, 0, 143, 203, 13, 1, 1, 203, 0, 0, 46, 203, 0, 203, 136, 73, 0, 0, 141, 204, 12, 1, 141, 205, 13, 1, 4, 204, 204, 205, 134, 203, 0, 0, 156, 26, 1, 0, 0, 133, 204, 0, 141, 203, 12, 1, 141, 204, 13, 1, 4, 203, 203, 204, 32, 203, 203, 0, 120, 203, 10, 0, 0, 34, 33, 0, 141, 203, 12, 1, 141, 204, 13, 1, 4, 22, 203, 204, 0, 23, 42, 0, 141, 204, 15, 1, 0, 133, 204, 0, 0, 33, 34, 0, 119, 0, 107, 255, 141, 203, 15, 1, 25, 204, 203, 1, 143, 204, 14, 1, 141, 203, 14, 1, 78, 204, 203, 0, 143, 204, 16, 1, 141, 204, 16, 1, 41, 204, 204, 24, 42, 204, 204, 24, 26, 204, 204, 48, 35, 204, 204, 10, 121, 204, 46, 0, 141, 203, 15, 1, 25, 204, 203, 2, 143, 204, 17, 1, 141, 203, 17, 1, 78, 204, 203, 0, 143, 204, 18, 1, 141, 203, 15, 1, 25, 204, 203, 3, 143, 204, 19, 1, 141, 204, 18, 1, 41, 204, 204, 24, 42, 204, 204, 24, 32, 204, 204, 36, 141, 203, 19, 1, 141, 205, 14, 1, 125, 66, 204, 203, 205, 0, 0, 0, 141, 205, 18, 1, 41, 205, 205, 24, 42, 205, 205, 24, 32, 205, 205, 36, 1, 203, 1, 0, 125, 9, 205, 203, 33, 0, 0, 0, 141, 204, 18, 1, 41, 204, 204, 24, 42, 204, 204, 24, 32, 204, 204, 36, 121, 204, 7, 0, 141, 204, 16, 1, 41, 204, 204, 24, 42, 204, 204, 24, 26, 204, 204, 48, 0, 205, 204, 0, 119, 0, 3, 0, 1, 204, 255, 255, 0, 205, 204, 0, 0, 203, 205, 0, 143, 203, 51, 1, 141, 203, 51, 1, 0, 27, 203, 0, 0, 48, 9, 0, 0, 203, 66, 0, 143, 203, 53, 1, 119, 0, 6, 0, 1, 27, 255, 255, 0, 48, 33, 0, 141, 205, 14, 1, 0, 203, 205, 0, 143, 203, 53, 1, 141, 203, 58, 1, 141, 205, 53, 1, 109, 203, 16, 205, 141, 203, 53, 1, 78, 205, 203, 0, 143, 205, 20, 1, 141, 205, 20, 1, 41, 205, 205, 24, 42, 205, 205, 24, 26, 205, 205, 32, 35, 205, 205, 32, 121, 205, 70, 0, 1, 32, 0, 0, 141, 203, 20, 1, 0, 205, 203, 0, 143, 205, 9, 1, 141, 203, 20, 1, 41, 203, 203, 24, 42, 203, 203, 24, 26, 205, 203, 32, 143, 205, 22, 1, 141, 203, 53, 1, 0, 205, 203, 0, 143, 205, 54, 1, 1, 203, 1, 0, 141, 204, 22, 1, 22, 203, 203, 204, 0, 205, 203, 0, 143, 205, 21, 1, 141, 205, 21, 1, 19, 205, 205, 202, 32, 205, 205, 0, 121, 205, 8, 0, 0, 31, 32, 0, 141, 205, 9, 1, 0, 71, 205, 0, 141, 203, 54, 1, 0, 205, 203, 0, 143, 205, 28, 1, 119, 0, 48, 0, 141, 203, 21, 1, 20, 203, 203, 32, 0, 205, 203, 0, 143, 205, 23, 1, 141, 203, 54, 1, 25, 205, 203, 1, 143, 205, 24, 1, 141, 205, 58, 1, 141, 203, 24, 1, 109, 205, 16, 203, 141, 205, 24, 1, 78, 203, 205, 0, 143, 203, 25, 1, 141, 203, 25, 1, 41, 203, 203, 24, 42, 203, 203, 24, 26, 203, 203, 32, 35, 203, 203, 32, 121, 203, 15, 0, 141, 203, 23, 1, 0, 32, 203, 0, 141, 205, 25, 1, 0, 203, 205, 0, 143, 203, 9, 1, 141, 205, 25, 1, 41, 205, 205, 24, 42, 205, 205, 24, 26, 203, 205, 32, 143, 203, 22, 1, 141, 205, 24, 1, 0, 203, 205, 0, 143, 203, 54, 1, 119, 0, 208, 255, 141, 203, 23, 1, 0, 31, 203, 0, 141, 203, 25, 1, 0, 71, 203, 0, 141, 205, 24, 1, 0, 203, 205, 0, 143, 203, 28, 1, 119, 0, 7, 0, 1, 31, 0, 0, 141, 203, 20, 1, 0, 71, 203, 0, 141, 205, 53, 1, 0, 203, 205, 0, 143, 203, 28, 1, 41, 205, 71, 24, 42, 205, 205, 24, 32, 203, 205, 42, 143, 203, 26, 1, 141, 203, 26, 1, 121, 203, 135, 0, 141, 205, 28, 1, 25, 203, 205, 1, 143, 203, 27, 1, 141, 205, 27, 1, 78, 203, 205, 0, 143, 203, 29, 1, 141, 203, 29, 1, 41, 203, 203, 24, 42, 203, 203, 24, 26, 203, 203, 48, 35, 203, 203, 10, 121, 203, 48, 0, 141, 205, 28, 1, 25, 203, 205, 2, 143, 203, 30, 1, 141, 205, 30, 1, 78, 203, 205, 0, 143, 203, 31, 1, 141, 203, 31, 1, 41, 203, 203, 24, 42, 203, 203, 24, 32, 203, 203, 36, 121, 203, 34, 0, 141, 203, 29, 1, 41, 203, 203, 24, 42, 203, 203, 24, 26, 203, 203, 48, 41, 203, 203, 2, 1, 205, 10, 0, 97, 4, 203, 205, 141, 203, 27, 1, 78, 205, 203, 0, 143, 205, 32, 1, 141, 203, 32, 1, 41, 203, 203, 24, 42, 203, 203, 24, 26, 203, 203, 48, 41, 203, 203, 3, 3, 205, 3, 203, 143, 205, 33, 1, 141, 203, 33, 1, 82, 205, 203, 0, 143, 205, 34, 1, 141, 203, 33, 1, 106, 205, 203, 4, 143, 205, 35, 1, 141, 203, 28, 1, 25, 205, 203, 3, 143, 205, 36, 1, 141, 205, 34, 1, 0, 30, 205, 0, 1, 59, 1, 0, 141, 203, 36, 1, 0, 205, 203, 0, 143, 205, 55, 1, 119, 0, 6, 0, 1, 205, 23, 0, 143, 205, 57, 1, 119, 0, 3, 0, 1, 205, 23, 0, 143, 205, 57, 1, 141, 205, 57, 1, 32, 205, 205, 23, 121, 205, 44, 0, 1, 205, 0, 0, 143, 205, 57, 1, 32, 205, 48, 0, 143, 205, 37, 1, 141, 205, 37, 1, 120, 205, 3, 0, 1, 12, 255, 255, 119, 0, 210, 3, 1, 205, 0, 0, 46, 205, 0, 205, 196, 77, 0, 0, 82, 205, 2, 0, 143, 205, 49, 1, 141, 203, 49, 1, 1, 204, 0, 0, 25, 204, 204, 4, 26, 204, 204, 1, 3, 203, 203, 204, 1, 204, 0, 0, 25, 204, 204, 4, 26, 204, 204, 1, 40, 204, 204, 255, 19, 203, 203, 204, 0, 205, 203, 0, 143, 205, 38, 1, 141, 203, 38, 1, 82, 205, 203, 0, 143, 205, 39, 1, 141, 205, 38, 1, 25, 205, 205, 4, 85, 2, 205, 0, 141, 205, 39, 1, 0, 30, 205, 0, 1, 59, 0, 0, 141, 203, 27, 1, 0, 205, 203, 0, 143, 205, 55, 1, 119, 0, 6, 0, 1, 30, 0, 0, 1, 59, 0, 0, 141, 203, 27, 1, 0, 205, 203, 0, 143, 205, 55, 1, 141, 205, 58, 1, 141, 203, 55, 1, 109, 205, 16, 203, 34, 203, 30, 0, 143, 203, 40, 1, 1, 205, 0, 32, 20, 205, 31, 205, 0, 203, 205, 0, 143, 203, 41, 1, 1, 205, 0, 0, 4, 203, 205, 30, 143, 203, 42, 1, 141, 203, 40, 1, 141, 205, 41, 1, 125, 8, 203, 205, 31, 0, 0, 0, 141, 205, 40, 1, 141, 203, 42, 1, 125, 7, 205, 203, 30, 0, 0, 0, 0, 45, 7, 0, 0, 46, 8, 0, 0, 64, 59, 0, 141, 205, 55, 1, 0, 203, 205, 0, 143, 203, 45, 1, 119, 0, 20, 0, 141, 205, 58, 1, 25, 205, 205, 16, 134, 203, 0, 0, 64, 2, 1, 0, 205, 0, 0, 0, 143, 203, 43, 1, 141, 203, 43, 1, 34, 203, 203, 0, 121, 203, 3, 0, 1, 12, 255, 255, 119, 0, 137, 3, 141, 203, 58, 1, 106, 73, 203, 16, 141, 203, 43, 1, 0, 45, 203, 0, 0, 46, 31, 0, 0, 64, 48, 0, 0, 203, 73, 0, 143, 203, 45, 1, 141, 205, 45, 1, 78, 203, 205, 0, 143, 203, 44, 1, 141, 203, 44, 1, 41, 203, 203, 24, 42, 203, 203, 24, 32, 203, 203, 46, 121, 203, 101, 0, 141, 205, 45, 1, 25, 203, 205, 1, 143, 203, 46, 1, 141, 205, 46, 1, 78, 203, 205, 0, 143, 203, 47, 1, 141, 203, 47, 1, 41, 203, 203, 24, 42, 203, 203, 24, 32, 203, 203, 42, 120, 203, 15, 0, 141, 203, 45, 1, 25, 89, 203, 1, 141, 203, 58, 1, 109, 203, 16, 89, 141, 203, 58, 1, 25, 203, 203, 16, 134, 90, 0, 0, 64, 2, 1, 0, 203, 0, 0, 0, 141, 203, 58, 1, 106, 75, 203, 16, 0, 28, 90, 0, 0, 74, 75, 0, 119, 0, 79, 0, 141, 205, 45, 1, 25, 203, 205, 2, 143, 203, 48, 1, 141, 203, 48, 1, 78, 77, 203, 0, 41, 203, 77, 24, 42, 203, 203, 24, 26, 203, 203, 48, 35, 203, 203, 10, 121, 203, 30, 0, 141, 203, 45, 1, 25, 78, 203, 3, 78, 79, 78, 0, 41, 203, 79, 24, 42, 203, 203, 24, 32, 203, 203, 36, 121, 203, 23, 0, 41, 203, 77, 24, 42, 203, 203, 24, 26, 203, 203, 48, 41, 203, 203, 2, 1, 205, 10, 0, 97, 4, 203, 205, 141, 205, 48, 1, 78, 80, 205, 0, 41, 205, 80, 24, 42, 205, 205, 24, 26, 205, 205, 48, 41, 205, 205, 3, 3, 82, 3, 205, 82, 83, 82, 0, 106, 84, 82, 4, 141, 205, 45, 1, 25, 85, 205, 4, 141, 205, 58, 1, 109, 205, 16, 85, 0, 28, 83, 0, 0, 74, 85, 0, 119, 0, 40, 0, 32, 86, 64, 0, 120, 86, 3, 0, 1, 12, 255, 255, 119, 0, 53, 3, 1, 205, 0, 0, 46, 205, 0, 205, 24, 80, 0, 0, 82, 205, 2, 0, 143, 205, 50, 1, 141, 205, 50, 1, 1, 203, 0, 0, 25, 203, 203, 4, 26, 203, 203, 1, 3, 205, 205, 203, 1, 203, 0, 0, 25, 203, 203, 4, 26, 203, 203, 1, 40, 203, 203, 255, 19, 205, 205, 203, 0, 87, 205, 0 ], eb + 10240);
 HEAPU8.set([ 82, 88, 87, 0, 25, 205, 87, 4, 85, 2, 205, 0, 0, 205, 88, 0, 143, 205, 10, 1, 119, 0, 3, 0, 1, 205, 0, 0, 143, 205, 10, 1, 141, 205, 58, 1, 141, 203, 48, 1, 109, 205, 16, 203, 141, 203, 10, 1, 0, 28, 203, 0, 141, 203, 48, 1, 0, 74, 203, 0, 119, 0, 4, 0, 1, 28, 255, 255, 141, 203, 45, 1, 0, 74, 203, 0, 1, 26, 0, 0, 0, 92, 74, 0, 78, 91, 92, 0, 1, 203, 57, 0, 41, 205, 91, 24, 42, 205, 205, 24, 26, 205, 205, 65, 48, 203, 203, 205, 120, 80, 0, 0, 1, 12, 255, 255, 119, 0, 7, 3, 25, 93, 92, 1, 141, 203, 58, 1, 109, 203, 16, 93, 78, 94, 92, 0, 1, 203, 5, 14, 27, 205, 26, 58, 3, 203, 203, 205, 41, 205, 94, 24, 42, 205, 205, 24, 26, 205, 205, 65, 3, 95, 203, 205, 78, 96, 95, 0, 19, 205, 96, 201, 26, 205, 205, 1, 35, 205, 205, 8, 121, 205, 5, 0, 19, 205, 96, 201, 0, 26, 205, 0, 0, 92, 93, 0, 119, 0, 228, 255, 41, 205, 96, 24, 42, 205, 205, 24, 32, 205, 205, 0, 121, 205, 3, 0, 1, 12, 255, 255, 119, 0, 237, 2, 1, 205, 255, 255, 15, 97, 205, 27, 41, 205, 96, 24, 42, 205, 205, 24, 32, 205, 205, 19, 121, 205, 7, 0, 121, 97, 3, 0, 1, 12, 255, 255, 119, 0, 228, 2, 1, 205, 49, 0, 143, 205, 57, 1, 119, 0, 27, 0, 121, 97, 16, 0, 41, 205, 27, 2, 3, 98, 4, 205, 19, 205, 96, 201, 85, 98, 205, 0, 41, 205, 27, 3, 3, 99, 3, 205, 82, 100, 99, 0, 106, 102, 99, 4, 141, 205, 58, 1, 85, 205, 100, 0, 141, 205, 58, 1, 109, 205, 4, 102, 1, 205, 49, 0, 143, 205, 57, 1, 119, 0, 11, 0, 1, 205, 0, 0, 53, 205, 0, 205, 100, 81, 0, 0, 1, 12, 0, 0, 119, 0, 204, 2, 141, 203, 58, 1, 19, 204, 96, 201, 134, 205, 0, 0, 224, 112, 0, 0, 203, 204, 2, 0, 141, 205, 57, 1, 32, 205, 205, 49, 121, 205, 11, 0, 1, 205, 0, 0, 143, 205, 57, 1, 1, 205, 0, 0, 53, 205, 0, 205, 172, 81, 0, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 112, 253, 78, 103, 92, 0, 33, 104, 26, 0, 41, 204, 103, 24, 42, 204, 204, 24, 38, 204, 204, 15, 32, 204, 204, 3, 19, 204, 104, 204, 121, 204, 6, 0, 41, 204, 103, 24, 42, 204, 204, 24, 38, 204, 204, 223, 0, 205, 204, 0, 119, 0, 4, 0, 41, 204, 103, 24, 42, 204, 204, 24, 0, 205, 204, 0, 0, 17, 205, 0, 1, 205, 0, 32, 19, 205, 46, 205, 0, 106, 205, 0, 2, 205, 0, 0, 255, 255, 254, 255, 19, 205, 46, 205, 0, 107, 205, 0, 32, 205, 106, 0, 125, 47, 205, 46, 107, 0, 0, 0, 1, 204, 65, 0, 1, 203, 56, 0, 138, 17, 204, 203, 32, 83, 0, 0, 4, 83, 0, 0, 36, 83, 0, 0, 4, 83, 0, 0, 120, 83, 0, 0, 124, 83, 0, 0, 128, 83, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 132, 83, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 212, 83, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 216, 83, 0, 0, 4, 83, 0, 0, 220, 83, 0, 0, 32, 84, 0, 0, 216, 84, 0, 0, 4, 85, 0, 0, 8, 85, 0, 0, 4, 83, 0, 0, 12, 85, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 16, 85, 0, 0, 56, 85, 0, 0, 168, 86, 0, 0, 28, 87, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 76, 87, 0, 0, 4, 83, 0, 0, 120, 87, 0, 0, 4, 83, 0, 0, 4, 83, 0, 0, 164, 87, 0, 0, 0, 49, 133, 0, 1, 50, 0, 0, 1, 51, 213, 15, 0, 54, 81, 0, 0, 69, 28, 0, 0, 70, 47, 0, 119, 0, 40, 1, 119, 0, 110, 0, 141, 204, 58, 1, 82, 170, 204, 0, 141, 204, 58, 1, 106, 171, 204, 4, 141, 204, 58, 1, 109, 204, 8, 170, 141, 204, 58, 1, 25, 204, 204, 8, 1, 205, 0, 0, 109, 204, 4, 205, 141, 205, 58, 1, 141, 204, 58, 1, 25, 204, 204, 8, 85, 205, 204, 0, 1, 67, 255, 255, 141, 205, 58, 1, 25, 204, 205, 8, 143, 204, 11, 1, 1, 204, 75, 0, 143, 204, 57, 1, 119, 0, 18, 1, 119, 0, 88, 0, 119, 0, 87, 0, 119, 0, 86, 0, 141, 204, 58, 1, 82, 76, 204, 0, 32, 172, 28, 0, 121, 172, 11, 0, 1, 205, 32, 0, 1, 203, 0, 0, 134, 204, 0, 0, 100, 252, 0, 0, 0, 205, 45, 203, 47, 0, 0, 0, 1, 20, 0, 0, 1, 204, 84, 0, 143, 204, 57, 1, 119, 0, 1, 1, 0, 67, 28, 0, 0, 204, 76, 0, 143, 204, 11, 1, 1, 204, 75, 0, 143, 204, 57, 1, 119, 0, 251, 0, 119, 0, 244, 0, 119, 0, 64, 0, 141, 204, 58, 1, 82, 158, 204, 0, 141, 204, 58, 1, 106, 159, 204, 4, 141, 204, 58, 1, 25, 204, 204, 24, 19, 205, 158, 201, 107, 204, 39, 205, 141, 205, 58, 1, 25, 205, 205, 24, 25, 49, 205, 39, 1, 50, 0, 0, 1, 51, 213, 15, 0, 54, 81, 0, 1, 69, 1, 0, 0, 70, 107, 0, 119, 0, 232, 0, 141, 205, 58, 1, 82, 138, 205, 0, 141, 205, 58, 1, 106, 139, 205, 4, 34, 205, 139, 0, 121, 205, 19, 0, 1, 205, 0, 0, 1, 204, 0, 0, 134, 141, 0, 0, 200, 27, 1, 0, 205, 204, 138, 139, 128, 204, 0, 0, 0, 142, 204, 0, 141, 204, 58, 1, 85, 204, 141, 0, 141, 204, 58, 1, 109, 204, 4, 142, 1, 16, 1, 0, 1, 18, 213, 15, 0, 144, 141, 0, 0, 145, 142, 0, 1, 204, 66, 0, 143, 204, 57, 1, 119, 0, 208, 0, 38, 204, 47, 1, 32, 204, 204, 0, 1, 205, 215, 15, 125, 5, 204, 200, 205, 0, 0, 0, 1, 205, 0, 8, 19, 205, 47, 205, 32, 205, 205, 0, 1, 204, 214, 15, 125, 6, 205, 5, 204, 0, 0, 0, 1, 204, 1, 8, 19, 204, 47, 204, 33, 204, 204, 0, 38, 204, 204, 1, 0, 16, 204, 0, 0, 18, 6, 0, 0, 144, 138, 0, 0, 145, 139, 0, 1, 204, 66, 0, 143, 204, 57, 1, 119, 0, 186, 0, 141, 204, 58, 1, 86, 190, 204, 0, 134, 191, 0, 0, 80, 47, 0, 0, 0, 190, 45, 28, 47, 17, 0, 0, 0, 22, 191, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 154, 252, 119, 0, 245, 255, 119, 0, 244, 255, 119, 0, 197, 255, 134, 160, 0, 0, 232, 28, 1, 0, 82, 161, 160, 0, 134, 162, 0, 0, 144, 27, 1, 0, 161, 0, 0, 0, 0, 35, 162, 0, 1, 205, 71, 0, 143, 205, 57, 1, 119, 0, 162, 0, 19, 204, 26, 201, 0, 205, 204, 0, 143, 205, 56, 1, 141, 205, 56, 1, 41, 205, 205, 24, 42, 205, 205, 24, 1, 204, 0, 0, 1, 203, 8, 0, 138, 205, 204, 203, 144, 85, 0, 0, 176, 85, 0, 0, 208, 85, 0, 0, 0, 86, 0, 0, 48, 86, 0, 0, 124, 85, 0, 0, 88, 86, 0, 0, 120, 86, 0, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 119, 252, 141, 204, 58, 1, 82, 111, 204, 0, 85, 111, 42, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 111, 252, 141, 204, 58, 1, 82, 112, 204, 0, 85, 112, 42, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 103, 252, 34, 113, 42, 0, 141, 204, 58, 1, 82, 114, 204, 0, 85, 114, 42, 0, 41, 203, 113, 31, 42, 203, 203, 31, 109, 114, 4, 203, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 91, 252, 2, 203, 0, 0, 255, 255, 0, 0, 19, 203, 42, 203, 0, 116, 203, 0, 141, 203, 58, 1, 82, 117, 203, 0, 84, 117, 116, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 79, 252, 19, 203, 42, 201, 0, 118, 203, 0, 141, 203, 58, 1, 82, 119, 203, 0, 83, 119, 118, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 69, 252, 141, 203, 58, 1, 82, 120, 203, 0, 85, 120, 42, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 61, 252, 34, 121, 42, 0, 141, 203, 58, 1, 82, 122, 203, 0, 85, 122, 42, 0, 41, 204, 121, 31, 42, 204, 204, 31, 109, 122, 4, 204, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 49, 252, 141, 205, 58, 1, 82, 134, 205, 0, 141, 205, 58, 1, 106, 135, 205, 4, 134, 136, 0, 0, 160, 3, 1, 0, 134, 135, 81, 0, 4, 205, 81, 136, 15, 137, 205, 28, 38, 204, 47, 8, 32, 204, 204, 0, 20, 204, 204, 137, 121, 204, 3, 0, 0, 205, 28, 0, 119, 0, 4, 0, 4, 204, 81, 136, 25, 204, 204, 1, 0, 205, 204, 0, 0, 29, 205, 0, 0, 13, 136, 0, 1, 37, 0, 0, 1, 39, 213, 15, 0, 55, 29, 0, 0, 68, 47, 0, 0, 150, 134, 0, 0, 153, 135, 0, 1, 205, 67, 0, 143, 205, 57, 1, 119, 0, 41, 0, 1, 205, 8, 0, 16, 124, 205, 28, 1, 205, 8, 0, 125, 125, 124, 28, 205, 0, 0, 0, 1, 38, 120, 0, 0, 44, 125, 0, 39, 205, 47, 8, 0, 63, 205, 0, 1, 205, 61, 0, 143, 205, 57, 1, 119, 0, 29, 0, 141, 205, 58, 1, 82, 163, 205, 0, 1, 205, 0, 0, 14, 205, 163, 205, 1, 204, 223, 15, 125, 165, 205, 163, 204, 0, 0, 0, 0, 35, 165, 0, 1, 204, 71, 0, 143, 204, 57, 1, 119, 0, 18, 0, 141, 204, 58, 1, 82, 108, 204, 0, 141, 204, 58, 1, 106, 110, 204, 4, 1, 16, 0, 0, 1, 18, 213, 15, 0, 144, 108, 0, 0, 145, 110, 0, 1, 204, 66, 0, 143, 204, 57, 1, 119, 0, 7, 0, 0, 38, 17, 0, 0, 44, 28, 0, 0, 63, 47, 0, 1, 205, 61, 0, 143, 205, 57, 1, 119, 0, 1, 0, 141, 204, 57, 1, 32, 204, 204, 61, 121, 204, 45, 0, 1, 204, 0, 0, 143, 204, 57, 1, 141, 204, 58, 1, 82, 126, 204, 0, 141, 204, 58, 1, 106, 128, 204, 4, 38, 204, 38, 32, 0, 129, 204, 0, 134, 130, 0, 0, 132, 1, 1, 0, 126, 128, 81, 129, 38, 204, 63, 8, 0, 131, 204, 0, 32, 203, 131, 0, 32, 205, 126, 0, 32, 206, 128, 0, 19, 205, 205, 206, 20, 203, 203, 205, 0, 204, 203, 0, 143, 204, 52, 1, 42, 204, 38, 4, 0, 132, 204, 0, 141, 203, 52, 1, 121, 203, 3, 0, 0, 204, 200, 0, 119, 0, 3, 0, 3, 203, 200, 132, 0, 204, 203, 0, 0, 60, 204, 0, 141, 204, 52, 1, 1, 203, 0, 0, 1, 205, 2, 0, 125, 61, 204, 203, 205, 0, 0, 0, 0, 13, 130, 0, 0, 37, 61, 0, 0, 39, 60, 0, 0, 55, 44, 0, 0, 68, 63, 0, 0, 150, 126, 0, 0, 153, 128, 0, 1, 205, 67, 0, 143, 205, 57, 1, 119, 0, 140, 0, 141, 205, 57, 1, 32, 205, 205, 66, 121, 205, 16, 0, 1, 205, 0, 0, 143, 205, 57, 1, 134, 146, 0, 0, 168, 202, 0, 0, 144, 145, 81, 0, 0, 13, 146, 0, 0, 37, 16, 0, 0, 39, 18, 0, 0, 55, 28, 0, 0, 68, 47, 0, 0, 150, 144, 0, 0, 153, 145, 0, 1, 205, 67, 0, 143, 205, 57, 1, 119, 0, 122, 0, 141, 205, 57, 1, 32, 205, 205, 71, 121, 205, 28, 0, 1, 205, 0, 0, 143, 205, 57, 1, 1, 205, 0, 0, 134, 166, 0, 0, 72, 162, 0, 0, 35, 205, 28, 0, 0, 167, 35, 0, 3, 168, 35, 28, 1, 203, 0, 0, 45, 203, 166, 203, 0, 89, 0, 0, 0, 205, 28, 0, 119, 0, 3, 0, 4, 203, 166, 167, 0, 205, 203, 0, 0, 62, 205, 0, 1, 205, 0, 0, 13, 205, 166, 205, 125, 43, 205, 168, 166, 0, 0, 0, 0, 49, 35, 0, 1, 50, 0, 0, 1, 51, 213, 15, 0, 54, 43, 0, 0, 69, 62, 0, 0, 70, 107, 0, 119, 0, 92, 0, 141, 205, 57, 1, 32, 205, 205, 75, 121, 205, 89, 0, 1, 205, 0, 0, 143, 205, 57, 1, 141, 205, 11, 1, 0, 15, 205, 0, 1, 21, 0, 0, 1, 41, 0, 0, 82, 173, 15, 0, 32, 205, 173, 0, 121, 205, 4, 0, 0, 19, 21, 0, 0, 53, 41, 0, 119, 0, 25, 0, 141, 205, 58, 1, 25, 205, 205, 20, 134, 174, 0, 0, 80, 27, 1, 0, 205, 173, 0, 0, 4, 175, 67, 21, 34, 205, 174, 0, 16, 203, 175, 174, 20, 205, 205, 203, 121, 205, 4, 0, 0, 19, 21, 0, 0, 53, 174, 0, 119, 0, 12, 0, 25, 176, 15, 4, 3, 177, 174, 21, 16, 178, 177, 67, 121, 178, 5, 0, 0, 15, 176, 0, 0, 21, 177, 0, 0, 41, 174, 0, 119, 0, 230, 255, 0, 19, 177, 0, 0, 53, 174, 0, 119, 0, 1, 0, 34, 179, 53, 0, 121, 179, 3, 0, 1, 12, 255, 255, 119, 0, 172, 0, 1, 203, 32, 0, 134, 205, 0, 0, 100, 252, 0, 0, 0, 203, 45, 19, 47, 0, 0, 0, 32, 180, 19, 0, 121, 180, 5, 0, 1, 20, 0, 0, 1, 205, 84, 0, 143, 205, 57, 1, 119, 0, 38, 0, 141, 205, 11, 1, 0, 36, 205, 0, 1, 40, 0, 0, 82, 181, 36, 0, 32, 205, 181, 0, 121, 205, 5, 0, 0, 20, 19, 0, 1, 205, 84, 0, 143, 205, 57, 1, 119, 0, 28, 0, 141, 205, 58, 1, 25, 205, 205, 20, 134, 182, 0, 0, 80, 27, 1, 0, 205, 181, 0, 0, 3, 183, 182, 40, 15, 185, 19, 183, 121, 185, 5, 0, 0, 20, 19, 0, 1, 205, 84, 0, 143, 205, 57, 1, 119, 0, 16, 0, 25, 186, 36, 4, 141, 203, 58, 1, 25, 203, 203, 20, 134, 205, 0, 0, 156, 26, 1, 0, 0, 203, 182, 0, 16, 187, 183, 19, 121, 187, 4, 0, 0, 36, 186, 0, 0, 40, 183, 0, 119, 0, 227, 255, 0, 20, 19, 0, 1, 205, 84, 0, 143, 205, 57, 1, 119, 0, 1, 0, 141, 205, 57, 1, 32, 205, 205, 67, 121, 205, 46, 0, 1, 205, 0, 0, 143, 205, 57, 1, 1, 205, 255, 255, 15, 147, 205, 55, 2, 205, 0, 0, 255, 255, 254, 255, 19, 205, 68, 205, 0, 148, 205, 0, 125, 10, 147, 148, 68, 0, 0, 0, 33, 149, 150, 0, 33, 151, 153, 0, 33, 154, 55, 0, 0, 155, 13, 0, 20, 205, 149, 151, 40, 205, 205, 1, 38, 205, 205, 1, 4, 203, 81, 155, 3, 205, 205, 203, 15, 156, 205, 55, 121, 156, 3, 0, 0, 205, 55, 0, 119, 0, 7, 0, 20, 203, 149, 151, 40, 203, 203, 1, 38, 203, 203, 1, 4, 204, 81, 155, 3, 203, 203, 204, 0, 205, 203, 0, 0, 56, 205, 0, 20, 205, 149, 151, 20, 205, 154, 205, 125, 57, 205, 56, 55, 0, 0, 0, 20, 205, 149, 151, 20, 205, 154, 205, 125, 14, 205, 13, 81, 0, 0, 0, 0, 49, 14, 0, 0, 50, 37, 0, 0, 51, 39, 0, 0, 54, 81, 0, 0, 69, 57, 0, 0, 70, 10, 0, 119, 0, 21, 0, 141, 205, 57, 1, 32, 205, 205, 84, 121, 205, 18, 0, 1, 205, 0, 0, 143, 205, 57, 1, 1, 203, 32, 0, 1, 204, 0, 32, 21, 204, 47, 204, 134, 205, 0, 0, 100, 252, 0, 0, 0, 203, 45, 20, 204, 0, 0, 0, 15, 188, 20, 45, 125, 189, 188, 45, 20, 0, 0, 0, 0, 22, 189, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 238, 250, 0, 192, 54, 0, 0, 193, 49, 0, 4, 205, 192, 193, 15, 195, 69, 205, 121, 195, 4, 0, 4, 204, 192, 193, 0, 205, 204, 0, 119, 0, 2, 0, 0, 205, 69, 0, 0, 11, 205, 0, 3, 196, 11, 50, 15, 197, 45, 196, 125, 58, 197, 196, 45, 0, 0, 0, 1, 204, 32, 0, 134, 205, 0, 0, 100, 252, 0, 0, 0, 204, 58, 196, 70, 0, 0, 0, 134, 205, 0, 0, 156, 26, 1, 0, 0, 51, 50, 0, 2, 205, 0, 0, 0, 0, 1, 0, 21, 205, 70, 205, 0, 198, 205, 0, 1, 204, 48, 0, 134, 205, 0, 0, 100, 252, 0, 0, 0, 204, 58, 196, 198, 0, 0, 0, 1, 204, 48, 0, 4, 203, 192, 193, 1, 206, 0, 0, 134, 205, 0, 0, 100, 252, 0, 0, 0, 204, 11, 203, 206, 0, 0, 0, 4, 206, 192, 193, 134, 205, 0, 0, 156, 26, 1, 0, 0, 49, 206, 0, 1, 205, 0, 32, 21, 205, 70, 205, 0, 199, 205, 0, 1, 206, 32, 0, 134, 205, 0, 0, 100, 252, 0, 0, 0, 206, 58, 196, 199, 0, 0, 0, 0, 22, 58, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 183, 250, 141, 205, 57, 1, 32, 205, 205, 87, 121, 205, 62, 0, 1, 205, 0, 0, 45, 205, 0, 205, 140, 93, 0, 0, 32, 205, 33, 0, 143, 205, 0, 1, 141, 205, 0, 1, 121, 205, 3, 0, 1, 12, 0, 0, 119, 0, 53, 0, 1, 52, 1, 0, 41, 206, 52, 2, 3, 205, 4, 206, 143, 205, 1, 1, 141, 206, 1, 1, 82, 205, 206, 0, 143, 205, 2, 1, 141, 205, 2, 1, 32, 205, 205, 0, 121, 205, 3, 0, 0, 65, 52, 0, 119, 0, 19, 0, 41, 206, 52, 3, 3, 205, 3, 206, 143, 205, 4, 1, 141, 206, 4, 1, 141, 203, 2, 1, 134, 205, 0, 0, 224, 112, 0, 0, 206, 203, 2, 0, 25, 205, 52, 1, 143, 205, 5, 1, 141, 205, 5, 1, 34, 205, 205, 10, 121, 205, 4, 0, 141, 205, 5, 1, 0, 52, 205, 0, 119, 0, 230, 255, 1, 12, 1, 0, 119, 0, 23, 0, 41, 203, 65, 2, 3, 205, 4, 203, 143, 205, 7, 1, 141, 203, 7, 1, 82, 205, 203, 0, 143, 205, 8, 1, 25, 205, 65, 1, 143, 205, 6, 1, 141, 205, 8, 1, 32, 205, 205, 0, 120, 205, 3, 0, 1, 12, 255, 255, 119, 0, 10, 0, 141, 205, 6, 1, 34, 205, 205, 10, 121, 205, 4, 0, 141, 205, 6, 1, 0, 65, 205, 0, 119, 0, 238, 255, 1, 12, 1, 0, 119, 0, 2, 0, 0, 12, 42, 0, 141, 205, 58, 1, 137, 205, 0, 0, 139, 12, 0, 0, 140, 2, 50, 0, 0, 0, 0, 0, 2, 43, 0, 0, 53, 5, 0, 0, 2, 44, 0, 0, 220, 5, 0, 0, 2, 45, 0, 0, 255, 0, 0, 0, 2, 46, 0, 0, 44, 6, 0, 0, 2, 47, 0, 0, 113, 5, 0, 0, 1, 41, 0, 0, 136, 48, 0, 0, 0, 42, 48, 0, 136, 48, 0, 0, 25, 48, 48, 48, 137, 48, 0, 0, 130, 48, 0, 0, 136, 49, 0, 0, 49, 48, 48, 49, 0, 94, 0, 0, 1, 49, 48, 0, 135, 48, 0, 0, 49, 0, 0, 0, 25, 38, 42, 40, 25, 37, 42, 32, 25, 36, 42, 24, 25, 40, 42, 16, 25, 39, 42, 8, 0, 35, 42, 0, 0, 14, 1, 0, 0, 25, 14, 0, 19, 48, 25, 45, 0, 29, 48, 0, 36, 30, 29, 57, 0, 31, 14, 0, 19, 48, 31, 45, 0, 32, 48, 0, 121, 30, 79, 0, 1, 48, 41, 0, 1, 49, 17, 0, 138, 32, 48, 49, 180, 94, 0, 0, 192, 94, 0, 0, 204, 94, 0, 0, 216, 94, 0, 0, 228, 94, 0, 0, 240, 94, 0, 0, 252, 94, 0, 0, 8, 95, 0, 0, 140, 94, 0, 0, 20, 95, 0, 0, 32, 95, 0, 0, 44, 95, 0, 0, 56, 95, 0, 0, 68, 95, 0, 0, 80, 95, 0, 0, 92, 95, 0, 0, 104, 95, 0, 0, 0, 33, 14, 0, 19, 48, 33, 45, 0, 34, 48, 0, 85, 35, 34, 0, 134, 48, 0, 0, 24, 18, 1, 0, 46, 35, 0, 0, 1, 2, 232, 3, 1, 3, 238, 2, 119, 0, 162, 1, 1, 2, 194, 1, 1, 3, 236, 0, 119, 0, 159, 1, 1, 2, 240, 2, 1, 3, 235, 0, 119, 0, 156, 1, 1, 2, 236, 0, 1, 3, 3, 1, 119, 0, 153, 1, 1, 2, 152, 0, 1, 3, 3, 1, 119, 0, 150, 1, 1, 2, 62, 5, 1, 3, 37, 1, 119, 0, 147, 1, 1, 2, 9, 6, 1, 3, 223, 0, 119, 0, 144, 1, 1, 2, 63, 5, 1, 3, 214, 0, 119, 0, 141, 1, 1, 2, 36, 7, 1, 3, 173, 0, 119, 0, 138, 1, 1, 2, 2, 7, 1, 3, 223, 0, 119, 0, 135, 1, 1, 2, 1, 7, 1, 3, 20, 1, 119, 0, 132, 1, 1, 2, 1, 7, 1, 3, 69, 1, 119, 0, 129, 1, 1, 2, 63, 7, 1, 3, 174, 0, 119, 0, 126, 1, 1, 2, 108, 7, 1, 3, 223, 0, 119, 0, 123, 1, 1, 2, 108, 7, 1, 3, 20, 1, 119, 0, 120, 1, 1, 2, 108, 7, 1, 3, 67, 1, 119, 0, 117, 1, 1, 2, 32, 1, 1, 3, 94, 3, 119, 0, 114, 1, 36, 4, 32, 74, 0, 5, 14, 0, 19, 48, 5, 45, 0, 6, 48, 0, 121, 4, 79, 0, 1, 48, 58, 0, 1, 49, 17, 0, 138, 6, 48, 49, 0, 96, 0, 0, 12, 96, 0, 0, 24, 96, 0, 0, 36, 96, 0, 0, 48, 96, 0, 0, 60, 96, 0, 0, 216, 95, 0, 0, 72, 96, 0, 0, 84, 96, 0, 0, 96, 96, 0, 0, 108, 96, 0, 0, 120, 96, 0, 0, 132, 96, 0, 0, 144, 96, 0, 0, 156, 96, 0, 0, 168, 96, 0, 0, 180, 96, 0, 0, 0, 7, 14, 0, 19, 48, 7, 45, 0, 8, 48, 0, 85, 39, 8, 0, 134, 48, 0, 0, 24, 18, 1, 0, 46, 39, 0, 0, 1, 2, 232, 3, 1, 3, 238, 2, 119, 0, 79, 1, 1, 2, 194, 1, 1, 3, 237, 2, 119, 0, 76, 1, 1, 2, 196, 1, 1, 3, 181, 2, 119, 0, 73, 1, 1, 2, 241, 2, 1, 3, 237, 2, 119, 0, 70, 1, 1, 2, 241, 2, 1, 3, 179, 2, 119, 0, 67, 1, 1, 2, 20, 5, 1, 3, 240, 1, 119, 0, 64, 1, 1, 2, 219, 4, 1, 3, 239, 1, 119, 0, 61, 1, 1, 2, 53, 5, 1, 3, 190, 1, 119, 0, 58, 1, 1, 2, 53, 5, 1, 3, 238, 1, 119, 0, 55, 1, 1, 2, 53, 5, 1, 3, 30, 2, 119, 0, 52, 1, 1, 2, 53, 5, 1, 3, 86, 2, 119, 0, 49, 1, 1, 2, 53, 5, 1, 3, 128, 2, 119, 0, 46, 1, 1, 2, 53, 5, 1, 3, 187, 2, 119, 0, 43, 1, 1, 2, 53, 5, 1, 3, 239, 2, 119, 0, 40, 1, 1, 2, 53, 5, 1, 3, 33, 3, 119, 0, 37, 1, 1, 2, 53, 5, 1, 3, 83, 3, 119, 0, 34, 1, 1, 2, 53, 5, 1, 3, 134, 3, 119, 0, 31, 1, 36, 9, 6, 91, 0, 10, 14, 0, 19, 48, 10, 45, 0, 11, 48, 0, 121, 9, 79, 0, 1, 48, 75, 0, 1, 49, 17, 0, 138, 11, 48, 49, 76, 97, 0, 0, 88, 97, 0, 0, 100, 97, 0, 0, 112, 97, 0, 0, 124, 97, 0, 0, 136, 97, 0, 0, 36, 97, 0, 0, 148, 97, 0, 0, 160, 97, 0, 0, 172, 97, 0, 0, 184, 97, 0, 0, 196, 97, 0, 0, 208, 97, 0, 0, 220, 97, 0, 0, 232, 97, 0, 0, 244, 97, 0, 0, 0, 98, 0, 0, 0, 12, 14, 0, 19, 48, 12, 45, 0, 13, 48, 0, 85, 40, 13, 0, 134, 48, 0, 0, 24, 18, 1, 0, 46, 40, 0, 0, 1, 2, 232, 3, 1, 3, 238, 2, 119, 0, 252, 0, 1, 2, 53, 5, 1, 3, 180, 3, 119, 0, 249, 0, 1, 2, 53, 5, 1, 3, 235, 3, 119, 0, 246, 0, 1, 2, 53, 5, 1, 3, 31, 4, 119, 0, 243, 0, 1, 2, 220, 5, 1, 3, 190, 1, 119, 0, 240, 0, 1, 2, 220, 5, 1, 3, 238, 1, 119, 0, 237, 0, 1, 2, 220, 5, 1, 3, 30, 2, 119, 0, 234, 0, 1, 2, 220, 5, 1, 3, 86, 2, 119, 0, 231, 0, 1, 2, 220, 5, 1, 3, 128, 2, 119, 0, 228, 0, 1, 2, 220, 5, 1, 3, 187, 2, 119, 0, 225, 0, 1, 2, 220, 5, 1, 3, 239, 2, 119, 0, 222, 0, 1, 2, 220, 5, 1, 3, 33, 3, 119, 0, 219, 0, 1, 2, 220, 5, 1, 3, 83, 3, 119, 0, 216, 0, 1, 2, 220, 5, 1, 3, 134, 3, 119, 0, 213, 0, 1, 2, 220, 5, 1, 3, 180, 3, 119, 0, 210, 0, 1, 2, 220, 5, 1, 3, 235, 3, 119, 0, 207, 0, 1, 2, 220, 5, 1, 3, 31, 4, 119, 0, 204, 0, 36, 15, 11, 108, 0, 16, 14, 0, 19, 48, 16, 45, 0, 17, 48, 0, 121, 15, 79, 0, 1, 48, 92, 0, 1, 49, 17, 0, 138, 17, 48, 49, 152, 98, 0, 0, 164, 98, 0, 0, 176, 98, 0, 0, 188, 98, 0, 0, 200, 98, 0, 0, 212, 98, 0, 0, 224, 98, 0, 0, 236, 98, 0, 0, 112, 98, 0, 0, 248, 98, 0, 0, 4, 99, 0, 0, 16, 99, 0, 0, 28, 99, 0, 0, 40, 99, 0, 0, 52, 99, 0, 0, 64, 99, 0, 0, 76, 99, 0, 0, 0, 18, 14, 0, 19, 48, 18, 45, 0, 19, 48, 0, 85, 36, 19, 0, 134, 48, 0, 0, 24, 18, 1, 0, 46, 36, 0, 0, 1, 2, 232, 3, 1, 3, 238, 2, 119, 0, 169, 0, 1, 2, 27, 1, 1, 3, 32, 5, 119, 0, 166, 0, 1, 2, 189, 0, 1, 3, 32, 5, 119, 0, 163, 0, 1, 2, 27, 1, 1, 3, 143, 6, 119, 0, 160, 0, 1, 2, 189, 0, 1, 3, 143, 6, 119, 0, 157, 0, 1, 2, 74, 1, 1, 3, 137, 8, 119, 0, 154, 0, 1, 2, 210, 0, 1, 3, 137, 8, 119, 0, 151, 0, 1, 2, 121, 3, 1, 3, 93, 5, 119, 0, 148, 0, 1, 2, 27, 4, 1, 3, 84, 5, 119, 0, 145, 0, 1, 2, 28, 4, 1, 3, 22, 5, 119, 0, 142, 0, 1, 2, 54, 5, 1, 3, 203, 4, 119, 0, 139, 0, 1, 2, 10, 5, 1, 3, 168, 4, 119, 0, 136, 0, 1, 2, 253, 4, 1, 3, 16, 5, 119, 0, 133, 0, 1, 2, 147, 5, 1, 3, 17, 5, 119, 0, 130, 0, 1, 2, 74, 3, 1, 3, 251, 8, 119, 0, 127, 0, 1, 2, 24, 4, 1, 3, 40, 9, 119, 0, 124, 0, 1, 2, 23, 4, 1, 3, 249, 8, 119, 0, 121, 0, 36, 20, 17, 125, 0, 21, 14, 0, 19, 48, 21, 45, 0, 22, 48, 0, 120, 20, 38, 0, 1, 48, 126, 0, 1, 49, 6, 0, 138, 22, 48, 49, 184, 99, 0, 0, 196, 99, 0, 0, 208, 99, 0, 0, 220, 99, 0, 0, 232, 99, 0, 0, 244, 99, 0, 0, 0, 26, 14, 0, 19, 48, 26, 45, 0, 27, 48, 0, 85, 38, 27, 0, 134, 48, 0, 0, 24, 18, 1, 0, 46, 38, 0, 0, 1, 2, 232, 3, 1, 3, 238, 2, 119, 0, 97, 0, 1, 2, 113, 5, 1, 3, 101, 8, 119, 0, 94, 0, 1, 2, 113, 5, 1, 3, 150, 8, 119, 0, 91, 0, 1, 2, 113, 5, 1, 3, 201, 8, 119, 0, 88, 0, 1, 2, 113, 5, 1, 3, 251, 8, 119, 0, 85, 0, 1, 2, 113, 5, 1, 3, 46, 9, 119, 0, 82, 0, 1, 2, 113, 5, 1, 3, 98, 9, 119, 0, 79, 0, 1, 48, 109, 0, 1, 49, 17, 0, 138, 22, 48, 49, 120, 100, 0, 0, 132, 100, 0, 0, 144, 100, 0, 0, 156, 100, 0, 0, 168, 100, 0, 0, 180, 100, 0, 0, 192, 100, 0, 0, 204, 100, 0, 0, 216, 100, 0, 0, 228, 100, 0, 0, 240, 100, 0, 0, 252, 100, 0, 0, 80, 100, 0, 0, 8, 101, 0, 0, 20, 101, 0, 0, 32, 101, 0, 0, 44, 101, 0, 0, 0, 23, 14, 0, 19, 48, 23, 45, 0, 24, 48, 0, 85, 37, 24, 0, 134, 48, 0, 0, 24, 18, 1, 0, 46, 37, 0, 0, 1, 2, 232, 3, 1, 3, 238, 2, 119, 0, 49, 0, 1, 2, 168, 4, 1, 3, 29, 9, 119, 0, 46, 0, 1, 2, 146, 4, 1, 3, 233, 8, 119, 0, 43, 0, 1, 2, 53, 5, 1, 3, 155, 7, 119, 0, 40, 0, 1, 2, 53, 5, 1, 3, 204, 7, 119, 0, 37, 0, 1, 2, 53, 5, 1, 3, 0, 8, 119, 0, 34, 0, 1, 2, 53, 5, 1, 3, 51, 8, 119, 0, 31, 0, 1, 2, 53, 5, 1, 3, 101, 8, 119, 0, 28, 0, 1, 2, 53, 5, 1, 3, 150, 8, 119, 0, 25, 0, 1, 2, 53, 5, 1, 3, 201, 8, 119, 0, 22, 0, 1, 2, 53, 5, 1, 3, 251, 8, 119, 0, 19, 0, 1, 2, 53, 5, 1, 3, 46, 9, 119, 0, 16, 0, 1, 2, 53, 5, 1, 3, 98, 9, 119, 0, 13, 0, 1, 2, 113, 5, 1, 3, 155, 7, 119, 0, 10, 0, 1, 2, 113, 5, 1, 3, 204, 7, 119, 0, 7, 0, 1, 2, 113, 5, 1, 3, 0, 8, 119, 0, 4, 0, 1, 2, 113, 5, 1, 3, 51, 8, 119, 0, 1, 0, 85, 0, 3, 0, 25, 28, 0, 4, 85, 28, 2, 0, 137, 42, 0, 0, 139, 0, 0, 0, 140, 1, 178, 0, 0, 0, 0, 0, 2, 169, 0, 0, 64, 31, 0, 0, 2, 170, 0, 0, 22, 24, 0, 0, 2, 171, 0, 0, 20, 24, 0, 0, 1, 167, 0, 0, 136, 172, 0, 0, 0, 168, 172, 0, 136, 172, 0, 0, 25, 172, 172, 32, 137, 172, 0, 0, 130, 172, 0, 0, 136, 173, 0, 0, 49, 172, 172, 173, 160, 101, 0, 0, 1, 173, 32, 0, 135, 172, 0, 0, 173, 0, 0, 0, 25, 166, 168, 8, 0, 165, 168, 0, 0, 77, 0, 0, 0, 110, 77, 0, 1, 172, 255, 0, 19, 172, 110, 172, 0, 121, 172, 0, 85, 165, 121, 0, 1, 173, 119, 4, 134, 172, 0, 0, 24, 18, 1, 0, 173, 165, 0, 0, 0, 132, 77, 0, 1, 172, 255, 0, 19, 172, 132, 172, 0, 143, 172, 0, 1, 172, 5, 0, 15, 154, 172, 143, 121, 154, 5, 0, 1, 1, 11, 0, 0, 73, 1, 0, 137, 168, 0, 0, 139, 73, 0, 0, 0, 2, 77, 0, 1, 172, 255, 0, 19, 172, 2, 172, 0, 13, 172, 0, 25, 24, 13, 16, 78, 35, 24, 0, 38, 172, 35, 1, 0, 46, 172, 0, 121, 46, 5, 0, 1, 1, 12, 0, 0, 73, 1, 0, 137, 168, 0, 0, 139, 73, 0, 0, 1, 172, 128, 23, 78, 57, 172, 0, 38, 172, 57, 1, 0, 68, 172, 0, 121, 68, 7, 0, 1, 173, 60, 0, 1, 174, 0, 0, 1, 175, 1, 0, 134, 172, 0, 0, 152, 200, 0, 0, 173, 174, 175, 0, 1, 99, 0, 0, 1, 175, 146, 4, 134, 172, 0, 0, 24, 18, 1, 0, 175, 166, 0, 0, 0, 74, 77, 0, 1, 172, 255, 0, 19, 172, 74, 172, 0, 75, 172, 0, 1, 177, 0, 0, 1, 176, 6, 0, 138, 75, 177, 176, 168, 102, 0, 0, 248, 102, 0, 0, 120, 103, 0, 0, 200, 103, 0, 0, 24, 104, 0, 0, 104, 104, 0, 0, 119, 0, 133, 0, 1, 172, 58, 0, 1, 175, 100, 0, 1, 174, 1, 0, 1, 173, 6, 0, 134, 76, 0, 0, 0, 0, 0, 0, 172, 175, 174, 169, 173, 0, 0, 0, 0, 88, 76, 0, 0, 78, 88, 0, 41, 173, 78, 24, 42, 173, 173, 24, 33, 79, 173, 0, 121, 79, 119, 0, 0, 80, 88, 0, 0, 1, 80, 0, 0, 73, 1, 0, 137, 168, 0, 0, 139, 73, 0, 0, 119, 0, 113, 0, 1, 173, 60, 0, 1, 174, 100, 0, 1, 175, 1, 0, 1, 172, 6, 0, 134, 81, 0, 0, 0, 0, 0, 0, 173, 174, 175, 169, 172, 0, 0, 0, 0, 88, 81, 0, 0, 82, 88, 0, 41, 172, 82, 24, 42, 172, 172, 24, 33, 83, 172, 0, 120, 83, 13, 0, 1, 172, 188, 2, 1, 175, 132, 3, 1, 174, 50, 0, 1, 173, 1, 0, 1, 176, 160, 15, 1, 177, 2, 0, 134, 85, 0, 0, 80, 148, 0, 0, 172, 175, 174, 173, 176, 177, 0, 0, 0, 88, 85, 0, 119, 0, 87, 0, 0, 84, 88, 0, 0, 1, 84, 0, 0, 73, 1, 0, 137, 168, 0, 0, 139, 73, 0, 0, 119, 0, 81, 0, 1, 177, 62, 0, 1, 176, 100, 0, 1, 173, 1, 0, 1, 174, 6, 0, 134, 86, 0, 0, 0, 0, 0, 0, 177, 176, 173, 169, 174, 0, 0, 0, 0, 88, 86, 0, 0, 87, 88, 0, 41, 174, 87, 24, 42, 174, 174, 24, 33, 89, 174, 0, 121, 89, 67, 0, 0, 90, 88, 0, 0, 1, 90, 0, 0, 73, 1, 0, 137, 168, 0, 0, 139, 73, 0, 0, 119, 0, 61, 0, 1, 174, 99, 0, 1, 173, 100, 0, 1, 176, 1, 0, 1, 177, 6, 0, 134, 91, 0, 0, 0, 0, 0, 0, 174, 173, 176, 169, 177, 0, 0, 0, 0, 88, 91, 0, 0, 92, 88, 0, 41, 177, 92, 24, 42, 177, 177, 24, 33, 93, 177, 0, 121, 93, 47, 0, 0, 94, 88, 0, 0, 1, 94, 0, 0, 73, 1, 0, 137, 168, 0, 0, 139, 73, 0, 0, 119, 0, 41, 0, 1, 177, 102, 0, 1, 176, 100, 0, 1, 173, 1, 0, 1, 174, 6, 0, 134, 95, 0, 0, 0, 0, 0, 0, 177, 176, 173, 169, 174, 0, 0, 0, 0, 88, 95, 0, 0, 96, 88, 0, 41, 174, 96, 24, 42, 174, 174, 24, 33, 97, 174, 0, 121, 97, 27, 0, 0, 98, 88, 0, 0, 1, 98, 0, 0, 73, 1, 0, 137, 168, 0, 0, 139, 73, 0, 0, 119, 0, 21, 0, 1, 174, 107, 0, 1, 173, 100, 0, 1, 176, 1, 0, 1, 177, 10, 0, 134, 100, 0, 0, 0, 0, 0, 0, 174, 173, 176, 169, 177, 0, 0, 0, 0, 88, 100, 0, 0, 101, 88, 0, 41, 177, 101, 24, 42, 177, 177, 24, 33, 102, 177, 0, 121, 102, 7, 0, 0, 103, 88, 0, 0, 1, 103, 0, 0, 73, 1, 0, 137, 168, 0, 0, 139, 73, 0, 0, 119, 0, 1, 0, 0, 104, 77, 0, 1, 177, 255, 0, 19, 177, 104, 177, 0, 105, 177, 0, 1, 177, 0, 0, 1, 172, 6, 0, 138, 105, 177, 172, 240, 104, 0, 0, 160, 105, 0, 0, 80, 106, 0, 0, 216, 107, 0, 0, 16, 109, 0, 0, 244, 110, 0, 0, 119, 0, 244, 1, 1, 177, 194, 1, 1, 176, 194, 1, 1, 173, 80, 0, 1, 174, 1, 0, 1, 175, 7, 0, 134, 106, 0, 0, 80, 148, 0, 0, 177, 176, 173, 174, 169, 175, 0, 0, 0, 88, 106, 0, 1, 175, 10, 0, 1, 174, 1, 0, 83, 175, 174, 0, 0, 107, 88, 0, 41, 174, 107, 24, 42, 174, 174, 24, 33, 108, 174, 0, 120, 108, 9, 0, 1, 175, 6, 0, 134, 174, 0, 0, 148, 12, 1, 0, 175, 0, 0, 0, 1, 174, 16, 0, 1, 175, 1, 0, 83, 174, 175, 0, 119, 0, 218, 1, 80, 109, 171, 0, 41, 175, 109, 16, 42, 175, 175, 16, 0, 111, 175, 0, 1, 175, 24, 0, 85, 175, 111, 0, 80, 112, 170, 0, 41, 175, 112, 16, 42, 175, 175, 16, 0, 113, 175, 0, 1, 175, 28, 0, 85, 175, 113, 0, 0, 114, 88, 0, 0, 1, 114, 0, 0, 73, 1, 0, 137, 168, 0, 0, 139, 73, 0, 0, 119, 0, 200, 1, 1, 175, 194, 1, 1, 174, 88, 2, 1, 173, 80, 0, 1, 176, 1, 0, 1, 177, 7, 0, 134, 115, 0, 0, 80, 148, 0, 0, 175, 174, 173, 176, 169, 177, 0, 0, 0, 88, 115, 0, 1, 177, 11, 0, 1, 176, 1, 0, 83, 177, 176, 0, 0, 116, 88, 0, 41, 176, 116, 24, 42, 176, 176, 24, 33, 117, 176, 0, 120, 117, 9, 0, 1, 177, 6, 0, 134, 176, 0, 0, 148, 12, 1, 0, 177, 0, 0, 0, 1, 176, 17, 0, 1, 177, 1, 0, 83, 176, 177, 0, 119, 0, 174, 1, 80, 118, 171, 0, 41, 177, 118, 16, 42, 177, 177, 16, 0, 119, 177, 0, 1, 177, 32, 0, 85, 177, 119, 0, 80, 120, 170, 0, 41, 177, 120, 16, 42, 177, 177, 16, 0, 122, 177, 0, 1, 177, 36, 0, 85, 177, 122, 0, 0, 123, 88, 0, 0, 1, 123, 0, 0, 73, 1, 0, 137, 168, 0, 0, 139, 73, 0, 0, 119, 0, 156, 1, 1, 177, 240, 1, 1, 176, 88, 2, 1, 173, 80, 0, 1, 174, 1, 0, 1, 175, 7, 0, 134, 124, 0, 0, 80, 148, 0, 0, 177, 176, 173, 174, 169, 175, 0, 0, 0, 88, 124, 0, 0, 125, 88, 0, 41, 175, 125, 24, 42, 175, 175, 24, 33, 126, 175, 0, 121, 126, 6, 0, 0, 127, 88, 0, 0, 1, 127, 0, 0, 73, 1, 0, 137, 168, 0, 0, 139, 73, 0, 0, 1, 174, 176, 255, 1, 173, 208, 7, 134, 175, 0, 0, 88, 253, 0, 0, 174, 173, 0, 0, 1, 175, 58, 0, 1, 173, 100, 0, 1, 174, 1, 0, 1, 176, 6, 0, 134, 128, 0, 0, 0, 0, 0, 0, 175, 173, 174, 169, 176, 0, 0, 0, 0, 88, 128, 0, 0, 129, 88, 0, 41, 176, 129, 24, 42, 176, 176, 24, 33, 130, 176, 0, 121, 130, 6, 0, 0, 131, 88, 0, 0, 1, 131, 0, 0, 73, 1, 0, 137, 168, 0, 0, 139, 73, 0, 0, 1, 176, 194, 1, 1, 174, 194, 1, 1, 173, 80, 0, 1, 175, 1, 0, 1, 177, 7, 0, 134, 133, 0, 0, 80, 148, 0, 0, 176, 174, 173, 175, 169, 177, 0, 0, 0, 88, 133, 0, 0, 134, 88, 0, 41, 177, 134, 24, 42, 177, 177, 24, 33, 135, 177, 0, 121, 135, 6, 0, 0, 136, 88, 0, 0, 1, 136, 0, 0, 73, 1, 0, 137, 168, 0, 0, 139, 73, 0, 0, 1, 177, 12, 0, 1, 175, 1, 0, 83, 177, 175, 0, 0, 137, 88, 0, 41, 175, 137, 24, 42, 175, 175, 24, 33, 138, 175, 0, 120, 138, 9, 0, 1, 177, 6, 0, 134, 175, 0, 0, 148, 12, 1, 0, 177, 0, 0, 0, 1, 175, 18, 0, 1, 177, 1, 0, 83, 175, 177, 0, 119, 0, 76, 1, 80, 139, 171, 0, 41, 177, 139, 16, 42, 177, 177, 16, 0, 140, 177, 0, 1, 177, 40, 0, 85, 177, 140, 0, 80, 141, 170, 0, 41, 177, 141, 16, 42, 177, 177, 16, 0, 142, 177, 0, 1, 177, 44, 0, 85, 177, 142, 0, 0, 144, 88, 0, 0, 1, 144, 0, 0, 73, 1, 0, 137, 168, 0, 0, 139, 73, 0, 0, 119, 0, 58, 1, 1, 177, 194, 1, 1, 175, 26, 4, 1, 173, 80, 0, 1, 174, 1, 0, 1, 176, 16, 39, 1, 172, 7, 0, 134, 145, 0, 0, 80, 148, 0, 0, 177, 175, 173, 174, 176, 172, 0, 0, 0, 88, 145, 0, 1, 172, 13, 0, 1, 176, 1, 0, 83, 172, 176, 0, 1, 176, 14, 0, 1, 172, 1, 0, 83, 176, 172, 0, 0, 146, 88, 0, 41, 172, 146, 24, 42, 172, 172, 24, 33, 147, 172, 0, 121, 147, 30, 0, 80, 148, 171, 0, 41, 172, 148, 16, 42, 172, 172, 16, 0, 149, 172, 0, 1, 172, 48, 0, 85, 172, 149, 0, 80, 150, 170, 0, 41, 172, 150, 16, 42, 172, 172, 16, 0, 151, 172, 0, 1, 172, 52, 0, 85, 172, 151, 0, 80, 152, 171, 0, 41, 172, 152, 16, 42, 172, 172, 16, 0, 153, 172, 0, 1, 172, 56, 0, 85, 172, 153, 0, 80, 155, 170, 0, 41, 172, 155, 16, 42, 172, 172, 16, 0, 156, 172, 0, 1, 172, 60, 0, 85, 172, 156, 0, 0, 157, 88, 0, 0, 1, 157, 0, 0, 73, 1, 0, 137, 168, 0, 0, 139, 73, 0, 0, 1, 172, 20, 0, 78, 158, 172, 0, 38, 172, 158, 1, 0, 159, 172, 0, 0, 160, 99, 0, 121, 159, 4, 0, 25, 162, 160, 1, 0, 99, 162, 0, 119, 0, 3, 0, 25, 161, 160, 9, 0, 99, 161, 0, 1, 172, 18, 0, 78, 163, 172, 0, 38, 172, 163, 1, 0, 164, 172, 0, 120, 164, 4, 0, 0, 3, 99, 0, 25, 4, 3, 1, 0, 99, 4, 0, 1, 172, 19, 0, 1, 176, 1, 0, 83, 172, 176, 0, 0, 5, 99, 0, 134, 176, 0, 0, 148, 12, 1, 0, 5, 0, 0, 0, 119, 0, 236, 0, 1, 176, 79, 2, 1, 172, 47, 2, 1, 174, 80, 0, 1, 173, 1, 0, 1, 175, 4, 0, 134, 6, 0, 0, 80, 148, 0, 0, 176, 172, 174, 173, 169, 175, 0, 0, 0, 88, 6, 0, 0, 7, 88, 0, 41, 175, 7, 24, 42, 175, 175, 24, 33, 8, 175, 0, 121, 8, 6, 0, 0, 9, 88, 0, 0, 1, 9, 0, 0, 73, 1, 0, 137, 168, 0, 0, 139, 73, 0, 0, 1, 173, 176, 255, 1, 174, 208, 7, 134, 175, 0, 0, 88, 253, 0, 0, 173, 174, 0, 0, 1, 175, 58, 0, 1, 174, 100, 0, 1, 173, 1, 0, 1, 172, 4, 0, 134, 10, 0, 0, 0, 0, 0, 0, 175, 174, 173, 169, 172, 0, 0, 0, 0, 88, 10, 0, 0, 11, 88, 0, 41, 172, 11, 24, 42, 172, 172, 24, 33, 12, 172, 0, 121, 12, 6, 0, 0, 14, 88, 0, 0, 1, 14, 0, 0, 73, 1, 0, 137, 168, 0, 0, 139, 73, 0, 0, 1, 172, 194, 1, 1, 173, 194, 1, 1, 174, 80, 0, 1, 175, 1, 0, 1, 176, 4, 0, 134, 15, 0, 0, 80, 148, 0, 0, 172, 173, 174, 175, 169, 176, 0, 0, 0, 88, 15, 0, 1, 176, 13, 0, 1, 175, 1, 0, 83, 176, 175, 0, 1, 175, 14, 0, 1, 176, 1, 0, 83, 175, 176, 0, 0, 16, 88, 0, 41, 176, 16, 24, 42, 176, 176, 24, 33, 17, 176, 0, 121, 17, 30, 0, 80, 18, 171, 0, 41, 176, 18, 16, 42, 176, 176, 16, 0, 19, 176, 0, 1, 176, 48, 0, 85, 176, 19, 0, 80, 20, 170, 0, 41, 176, 20, 16, 42, 176, 176, 16, 0, 21, 176, 0, 1, 176, 52, 0, 85, 176, 21, 0, 80, 22, 171, 0, 41, 176, 22, 16, 42, 176, 176, 16, 0, 23, 176, 0, 1, 176, 56, 0, 85, 176, 23, 0, 80, 25, 170, 0, 41, 176, 25, 16, 42, 176, 176, 16, 0, 26, 176, 0, 1, 176, 60, 0, 85, 176, 26, 0, 0, 27, 88, 0, 0, 1, 27, 0, 0, 73, 1, 0, 137, 168, 0, 0, 139, 73, 0, 0, 1, 176, 19, 0, 78, 28, 176, 0, 38, 176, 28, 1, 0, 29, 176, 0, 0, 30, 99, 0, 121, 29, 4, 0, 25, 32, 30, 1, 0, 99, 32, 0, 119, 0, 3, 0, 25, 31, 30, 13, 0, 99, 31, 0, 1, 176, 17, 0, 78, 33, 176, 0, 38, 176, 33, 1, 0, 34, 176, 0, 120, 34, 4, 0, 0, 36, 99, 0, 25, 37, 36, 6, 0, 99, 37, 0, 1, 176, 20, 0, 1, 175, 1, 0, 83, 176, 175, 0, 0, 38, 99, 0, 134, 175, 0, 0, 148, 12, 1, 0, 38, 0, 0, 0, 119, 0, 115, 0, 1, 175, 194, 1, 1, 176, 26, 4, 1, 174, 80, 0, 1, 173, 1, 0, 1, 172, 152, 58, 1, 177, 7, 0, 134, 39, 0, 0, 80, 148, 0, 0, 175, 176, 174, 173, 172, 177, 0, 0, 0, 88, 39, 0, 1, 177, 15, 0, 1, 172, 1, 0, 83, 177, 172, 0, 1, 172, 36, 0, 134, 40, 0, 0, 68, 132, 0, 0, 172, 0, 0, 0, 121, 40, 7, 0, 1, 172, 13, 0, 1, 177, 1, 0, 83, 172, 177, 0, 1, 177, 14, 0, 1, 172, 1, 0, 83, 177, 172, 0, 0, 41, 88, 0, 41, 172, 41, 24, 42, 172, 172, 24, 33, 42, 172, 0, 121, 42, 47, 0, 80, 43, 171, 0, 41, 172, 43, 16, 42, 172, 172, 16, 0, 44, 172, 0, 1, 172, 64, 0, 85, 172, 44, 0, 80, 45, 170, 0, 41, 172, 45, 16, 42, 172, 172, 16, 0, 47, 172, 0, 1, 172, 68, 0, 85, 172, 47, 0, 1, 172, 36, 0, 134, 48, 0, 0, 68, 132, 0, 0, 172, 0, 0, 0, 121, 48, 25, 0, 80, 49, 171, 0, 41, 172, 49, 16, 42, 172, 172, 16, 0, 50, 172, 0, 1, 172, 48, 0, 85, 172, 50, 0, 80, 51, 170, 0, 41, 172, 51, 16, 42, 172, 172, 16, 0, 52, 172, 0, 1, 172, 52, 0, 85, 172, 52, 0, 80, 53, 171, 0, 41, 172, 53, 16, 42, 172, 172, 16, 0, 54, 172, 0, 1, 172, 56, 0, 85, 172, 54, 0, 80, 55, 170, 0, 41, 172, 55, 16, 42, 172, 172, 16, 0, 56, 172, 0, 1, 172, 60, 0, 85, 172, 56, 0, 0, 58, 88, 0, 0, 1, 58, 0, 0, 73, 1, 0, 137, 168, 0, 0, 139, 73, 0, 0, 1, 172, 19, 0, 78, 59, 172, 0, 38, 172, 59, 1, 0, 60, 172, 0, 121, 60, 3, 0, 1, 167, 66, 0, 119, 0, 11, 0, 1, 172, 20, 0, 78, 61, 172, 0, 38, 172, 61, 1, 0, 62, 172, 0, 121, 62, 3, 0, 1, 167, 66, 0, 119, 0, 4, 0, 0, 63, 99, 0, 25, 64, 63, 12, 0, 99, 64, 0, 32, 172, 167, 66, 121, 172, 4, 0, 0, 65, 99, 0, 25, 66, 65, 9, 0, 99, 66, 0, 1, 172, 18, 0, 78, 67, 172, 0, 38, 172, 67, 1, 0, 69, 172, 0, 120, 69, 4, 0, 0, 70, 99, 0, 25, 71, 70, 1, 0, 99, 71, 0, 1, 172, 21, 0, 1, 177, 1, 0, 83, 172, 177, 0, 0, 72, 99, 0, 134, 177, 0, 0, 148, 12, 1, 0, 72, 0, 0, 0, 119, 0, 1, 0, 1, 172, 176, 255, 1, 173, 208, 7, 134, 177, 0, 0, 88, 253, 0, 0, 172, 173, 0, 0, 1, 1, 0, 0, 0, 73, 1, 0, 137, 168, 0, 0, 139, 73, 0, 0, 140, 3, 195, 0, 0, 0, 0, 0, 2, 191, 0, 0, 255, 255, 0, 0, 2, 192, 0, 0, 255, 0, 0, 0, 1, 189, 0, 0, 136, 193, 0, 0, 0, 190, 193, 0, 1, 193, 20, 0, 16, 42, 193, 1, 120, 42, 38, 1, 1, 193, 9, 0, 1, 194, 10, 0, 138, 1, 193, 194, 72, 113, 0, 0, 156, 113, 0, 0, 20, 114, 0, 0, 128, 114, 0, 0, 252, 114, 0, 0, 136, 115, 0, 0, 252, 115, 0, 0, 136, 116, 0, 0, 252, 116, 0, 0, 80, 117, 0, 0, 119, 0, 24, 1, 82, 119, 2, 0, 0, 53, 119, 0, 1, 193, 0, 0, 25, 64, 193, 4, 0, 140, 64, 0, 26, 139, 140, 1, 3, 75, 53, 139, 1, 193, 0, 0, 25, 86, 193, 4, 0, 143, 86, 0, 26, 142, 143, 1, 40, 193, 142, 255, 0, 141, 193, 0, 19, 193, 75, 141, 0, 97, 193, 0, 0, 108, 97, 0, 82, 5, 108, 0, 25, 129, 108, 4, 85, 2, 129, 0, 85, 0, 5, 0, 119, 0, 3, 1, 82, 123, 2, 0, 0, 16, 123, 0, 1, 193, 0, 0, 25, 24, 193, 4, 0, 145, 24, 0, 26, 144, 145, 1, 3, 25, 16, 144, 1, 193, 0, 0, 25, 26, 193, 4, 0, 148, 26, 0, 26, 147, 148, 1, 40, 193, 147, 255, 0, 146, 193, 0, 19, 193, 25, 146, 0, 27, 193, 0, 0, 28, 27, 0, 82, 29, 28, 0, 25, 136, 28, 4, 85, 2, 136, 0, 34, 30, 29, 0, 41, 193, 30, 31, 42, 193, 193, 31, 0, 31, 193, 0, 0, 32, 0, 0, 0, 33, 32, 0, 85, 33, 29, 0, 25, 34, 32, 4, 0, 35, 34, 0, 85, 35, 31, 0, 119, 0, 229, 0, 82, 127, 2, 0, 0, 36, 127, 0, 1, 193, 0, 0, 25, 37, 193, 4, 0, 150, 37, 0, 26, 149, 150, 1, 3, 38, 36, 149, 1, 193, 0, 0, 25, 39, 193, 4, 0, 153, 39, 0, 26, 152, 153, 1, 40, 193, 152, 255, 0, 151, 193, 0, 19, 193, 38, 151, 0, 40, 193, 0, 0, 41, 40, 0, 82, 43, 41, 0, 25, 137, 41, 4, 85, 2, 137, 0, 0, 44, 0, 0, 0, 45, 44, 0, 85, 45, 43, 0, 25, 46, 44, 4, 0, 47, 46, 0, 1, 193, 0, 0, 85, 47, 193, 0, 119, 0, 202, 0, 82, 128, 2, 0, 0, 48, 128, 0, 1, 193, 0, 0, 25, 49, 193, 8, 0, 155, 49, 0, 26, 154, 155, 1, 3, 50, 48, 154, 1, 193, 0, 0, 25, 51, 193, 8, 0, 158, 51, 0, 26, 157, 158, 1, 40, 193, 157, 255, 0, 156, 193, 0, 19, 193, 50, 156, 0, 52, 193, 0, 0, 54, 52, 0, 0, 55, 54, 0, 0, 56, 55, 0, 82, 57, 56, 0, 25, 58, 55, 4, 0, 59, 58, 0, 82, 60, 59, 0, 25, 138, 54, 8, 85, 2, 138, 0, 0, 61, 0, 0, 0, 62, 61, 0, 85, 62, 57, 0, 25, 63, 61, 4, 0, 65, 63, 0, 85, 65, 60, 0, 119, 0, 171, 0, 82, 120, 2, 0, 0, 66, 120, 0, 1, 193, 0, 0, 25, 67, 193, 4, 0, 160, 67, 0, 26, 159, 160, 1, 3, 68, 66, 159, 1, 193, 0, 0, 25, 69, 193, 4, 0, 163, 69, 0, 26, 162, 163, 1, 40, 193, 162, 255, 0, 161, 193, 0, 19, 193, 68, 161, 0, 70, 193, 0, 0, 71, 70, 0, 82, 72, 71, 0, 25, 130, 71, 4, 85, 2, 130, 0, 19, 193, 72, 191, 0, 73, 193, 0, 41, 193, 73, 16, 42, 193, 193, 16, 0, 74, 193, 0, 34, 76, 74, 0, 41, 193, 76, 31, 42, 193, 193, 31, 0, 77, 193, 0, 0, 78, 0, 0, 0, 79, 78, 0, 85, 79, 74, 0, 25, 80, 78, 4, 0, 81, 80, 0, 85, 81, 77, 0, 119, 0, 136, 0, 82, 121, 2, 0, 0, 82, 121, 0, 1, 193, 0, 0, 25, 83, 193, 4, 0, 165, 83, 0, 26, 164, 165, 1, 3, 84, 82, 164, 1, 193, 0, 0, 25, 85, 193, 4, 0, 168, 85, 0, 26, 167, 168, 1, 40, 193, 167, 255, 0, 166, 193, 0, 19, 193, 84, 166, 0, 87, 193, 0, 0, 88, 87, 0, 82, 89, 88, 0, 25, 131, 88, 4, 85, 2, 131, 0, 19, 193, 89, 191, 0, 4, 193, 0, 0, 90, 0, 0, 0, 91, 90, 0, 85, 91, 4, 0, 25, 92, 90, 4, 0, 93, 92, 0, 1, 193, 0, 0, 85, 93, 193, 0, 119, 0, 107, 0, 82, 122, 2, 0, 0, 94, 122, 0, 1, 193, 0, 0, 25, 95, 193, 4, 0, 170, 95, 0, 26, 169, 170, 1, 3, 96, 94, 169, 1, 193, 0, 0, 25, 98, 193, 4, 0, 173, 98, 0, 26, 172, 173, 1, 40, 193, 172, 255, 0, 171, 193, 0, 19, 193, 96, 171, 0, 99, 193, 0, 0, 100, 99, 0, 82, 101, 100, 0, 25, 132, 100, 4, 85, 2, 132, 0, 19, 193, 101, 192, 0, 102, 193, 0, 41, 193, 102, 24, 42, 193, 193, 24, 0, 103, 193, 0, 34, 104, 103, 0, 41, 193, 104, 31, 42, 193, 193, 31, 0, 105, 193, 0, 0, 106, 0, 0, 0, 107, 106, 0, 85, 107, 103, 0, 25, 109, 106, 4, 0, 110, 109, 0, 85, 110, 105, 0, 119, 0, 72, 0, 82, 124, 2, 0, 0, 111, 124, 0, 1, 193, 0, 0, 25, 112, 193, 4, 0, 175, 112, 0, 26, 174, 175, 1, 3, 113, 111, 174, 1, 193, 0, 0, 25, 114, 193, 4, 0, 178, 114, 0, 26, 177, 178, 1, 40, 193, 177, 255, 0, 176, 193, 0, 19, 193, 113, 176, 0, 115, 193, 0, 0, 116, 115, 0, 82, 117, 116, 0, 25, 133, 116, 4, 85, 2, 133, 0, 19, 193, 117, 192, 0, 3, 193, 0, 0, 118, 0, 0, 0, 6, 118, 0, 85, 6, 3, 0, 25, 7, 118, 4, 0, 8, 7, 0, 1, 193, 0, 0, 85, 8, 193, 0, 119, 0, 43, 0, 82, 125, 2, 0, 0, 9, 125, 0, 1, 193, 0, 0, 25, 10, 193, 8, 0, 180, 10, 0, 26, 179, 180, 1, 3, 11, 9, 179, 1, 193, 0, 0, 25, 12, 193, 8, 0, 183, 12, 0, 26, 182, 183, 1, 40, 193, 182, 255, 0, 181, 193, 0, 19, 193, 11, 181, 0, 13, 193, 0, 0, 14, 13, 0, 86, 15, 14, 0, 25, 134, 14, 8, 85, 2, 134, 0, 87, 0, 15, 0, 119, 0, 22, 0, 82, 126, 2, 0, 0, 17, 126, 0, 1, 193, 0, 0, 25, 18, 193, 8, 0, 185, 18, 0, 26, 184, 185, 1, 3, 19, 17, 184, 1, 193, 0, 0, 25, 20, 193, 8, 0, 188, 20, 0, 26, 187, 188, 1, 40, 193, 187, 255, 0, 186, 193, 0, 19, 193, 19, 186, 0, 21, 193, 0, 0, 22, 21, 0, 86, 23, 22, 0, 25, 135, 22, 8, 85, 2, 135, 0, 87, 0, 23, 0, 119, 0, 1, 0, 139, 0, 0, 0, 140, 5, 75, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 6, 1, 0, 0, 7, 6, 0, 0, 8, 2, 0, 0, 9, 3, 0, 0, 10, 9, 0, 32, 69, 7, 0, 121, 69, 27, 0, 33, 11, 4, 0, 32, 69, 10, 0, 121, 69, 11, 0, 121, 11, 5, 0, 9, 69, 5, 8, 85, 4, 69, 0, 1, 70, 0, 0, 109, 4, 4, 70, 1, 68, 0, 0, 7, 67, 5, 8, 129, 68, 0, 0, 139, 67, 0, 0, 119, 0, 14, 0, 120, 11, 5, 0, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 38, 70, 0, 255, 85, 4, 70, 0, 38, 69, 1, 0, 109, 4, 4, 69, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 32, 12, 10, 0, 32, 69, 8, 0, 121, 69, 83, 0, 121, 12, 11, 0, 33, 69, 4, 0, 121, 69, 5, 0, 9, 69, 7, 8, 85, 4, 69, 0, 1, 70, 0, 0, 109, 4, 4, 70, 1, 68, 0, 0, 7, 67, 7, 8, 129, 68, 0, 0, 139, 67, 0, 0, 32, 70, 5, 0, 121, 70, 11, 0, 33, 70, 4, 0, 121, 70, 5, 0, 1, 70, 0, 0, 85, 4, 70, 0, 9, 69, 7, 10, 109, 4, 4, 69, 1, 68, 0, 0, 7, 67, 7, 10, 129, 68, 0, 0, 139, 67, 0, 0, 26, 13, 10, 1, 19, 69, 13, 10, 32, 69, 69, 0, 121, 69, 18, 0, 33, 69, 4, 0, 121, 69, 8, 0, 38, 69, 0, 255, 39, 69, 69, 0, 85, 4, 69, 0, 19, 70, 13, 7, 38, 71, 1, 0, 20, 70, 70, 71, 109, 4, 4, 70, 1, 68, 0, 0, 134, 70, 0, 0, 8, 23, 1, 0, 10, 0, 0, 0, 24, 70, 7, 70, 0, 67, 70, 0, 129, 68, 0, 0, 139, 67, 0, 0, 135, 14, 3, 0, 10, 0, 0, 0, 135, 70, 3, 0, 7, 0, 0, 0, 4, 15, 14, 70, 37, 70, 15, 30, 121, 70, 15, 0, 25, 16, 15, 1, 1, 70, 31, 0, 4, 17, 70, 15, 0, 36, 16, 0, 22, 70, 7, 17, 24, 69, 5, 16, 20, 70, 70, 69, 0, 35, 70, 0, 24, 70, 7, 16, 0, 34, 70, 0, 1, 33, 0, 0, 22, 70, 5, 17, 0, 32, 70, 0, 119, 0, 139, 0, 32, 70, 4, 0, 121, 70, 5, 0, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 38, 70, 0, 255, 39, 70, 70, 0, 85, 4, 70, 0, 38, 69, 1, 0, 20, 69, 6, 69, 109, 4, 4, 69, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 119, 0, 122, 0, 120, 12, 43, 0, 135, 27, 3, 0, 10, 0, 0, 0, 135, 69, 3, 0, 7, 0, 0, 0, 4, 28, 27, 69, 37, 69, 28, 31, 121, 69, 20, 0, 25, 29, 28, 1, 1, 69, 31, 0, 4, 30, 69, 28, 26, 69, 28, 31, 42, 69, 69, 31, 0, 31, 69, 0, 0, 36, 29, 0, 24, 69, 5, 29, 19, 69, 69, 31, 22, 70, 7, 30, 20, 69, 69, 70, 0, 35, 69, 0, 24, 69, 7, 29, 19, 69, 69, 31, 0, 34, 69, 0, 1, 33, 0, 0, 22, 69, 5, 30, 0, 32, 69, 0, 119, 0, 95, 0, 32, 69, 4, 0, 121, 69, 5, 0 ], eb + 20480);
 HEAPU8.set([ 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 38, 69, 0, 255, 39, 69, 69, 0, 85, 4, 69, 0, 38, 70, 1, 0, 20, 70, 6, 70, 109, 4, 4, 70, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 26, 18, 8, 1, 19, 70, 18, 8, 33, 70, 70, 0, 121, 70, 44, 0, 135, 70, 3, 0, 8, 0, 0, 0, 25, 20, 70, 33, 135, 70, 3, 0, 7, 0, 0, 0, 4, 21, 20, 70, 1, 70, 64, 0, 4, 22, 70, 21, 1, 70, 32, 0, 4, 23, 70, 21, 42, 70, 23, 31, 0, 24, 70, 0, 26, 25, 21, 32, 42, 70, 25, 31, 0, 26, 70, 0, 0, 36, 21, 0, 26, 70, 23, 1, 42, 70, 70, 31, 24, 69, 7, 25, 19, 70, 70, 69, 22, 69, 7, 23, 24, 71, 5, 21, 20, 69, 69, 71, 19, 69, 69, 26, 20, 70, 70, 69, 0, 35, 70, 0, 24, 70, 7, 21, 19, 70, 26, 70, 0, 34, 70, 0, 22, 70, 5, 22, 19, 70, 70, 24, 0, 33, 70, 0, 22, 70, 7, 22, 24, 69, 5, 25, 20, 70, 70, 69, 19, 70, 70, 24, 22, 69, 5, 23, 26, 71, 21, 33, 42, 71, 71, 31, 19, 69, 69, 71, 20, 70, 70, 69, 0, 32, 70, 0, 119, 0, 32, 0, 33, 70, 4, 0, 121, 70, 5, 0, 19, 70, 18, 5, 85, 4, 70, 0, 1, 69, 0, 0, 109, 4, 4, 69, 32, 69, 8, 1, 121, 69, 10, 0, 38, 69, 1, 0, 20, 69, 6, 69, 0, 68, 69, 0, 38, 69, 0, 255, 39, 69, 69, 0, 0, 67, 69, 0, 129, 68, 0, 0, 139, 67, 0, 0, 119, 0, 15, 0, 134, 19, 0, 0, 8, 23, 1, 0, 8, 0, 0, 0, 24, 69, 7, 19, 39, 69, 69, 0, 0, 68, 69, 0, 1, 69, 32, 0, 4, 69, 69, 19, 22, 69, 7, 69, 24, 70, 5, 19, 20, 69, 69, 70, 0, 67, 69, 0, 129, 68, 0, 0, 139, 67, 0, 0, 32, 69, 36, 0, 121, 69, 8, 0, 0, 63, 32, 0, 0, 62, 33, 0, 0, 61, 34, 0, 0, 60, 35, 0, 1, 59, 0, 0, 1, 58, 0, 0, 119, 0, 89, 0, 38, 69, 2, 255, 39, 69, 69, 0, 0, 37, 69, 0, 38, 69, 3, 0, 20, 69, 9, 69, 0, 38, 69, 0, 1, 69, 255, 255, 1, 70, 255, 255, 134, 39, 0, 0, 164, 28, 1, 0, 37, 38, 69, 70, 128, 70, 0, 0, 0, 40, 70, 0, 0, 46, 32, 0, 0, 45, 33, 0, 0, 44, 34, 0, 0, 43, 35, 0, 0, 42, 36, 0, 1, 41, 0, 0, 43, 70, 45, 31, 41, 69, 46, 1, 20, 70, 70, 69, 0, 47, 70, 0, 41, 70, 45, 1, 20, 70, 41, 70, 0, 48, 70, 0, 41, 70, 43, 1, 43, 69, 46, 31, 20, 70, 70, 69, 39, 70, 70, 0, 0, 49, 70, 0, 43, 70, 43, 31, 41, 69, 44, 1, 20, 70, 70, 69, 0, 50, 70, 0, 134, 70, 0, 0, 200, 27, 1, 0, 39, 40, 49, 50, 128, 70, 0, 0, 0, 51, 70, 0, 42, 70, 51, 31, 34, 71, 51, 0, 1, 72, 255, 255, 1, 73, 0, 0, 125, 69, 71, 72, 73, 0, 0, 0, 41, 69, 69, 1, 20, 70, 70, 69, 0, 52, 70, 0, 38, 70, 52, 1, 0, 53, 70, 0, 19, 70, 52, 37, 34, 73, 51, 0, 1, 72, 255, 255, 1, 71, 0, 0, 125, 69, 73, 72, 71, 0, 0, 0, 42, 69, 69, 31, 34, 72, 51, 0, 1, 73, 255, 255, 1, 74, 0, 0, 125, 71, 72, 73, 74, 0, 0, 0, 41, 71, 71, 1, 20, 69, 69, 71, 19, 69, 69, 38, 134, 54, 0, 0, 200, 27, 1, 0, 49, 50, 70, 69, 0, 55, 54, 0, 128, 69, 0, 0, 0, 56, 69, 0, 26, 57, 42, 1, 32, 69, 57, 0, 120, 69, 8, 0, 0, 46, 47, 0, 0, 45, 48, 0, 0, 44, 56, 0, 0, 43, 55, 0, 0, 42, 57, 0, 0, 41, 53, 0, 119, 0, 194, 255, 0, 63, 47, 0, 0, 62, 48, 0, 0, 61, 56, 0, 0, 60, 55, 0, 1, 59, 0, 0, 0, 58, 53, 0, 0, 64, 62, 0, 1, 65, 0, 0, 20, 69, 63, 65, 0, 66, 69, 0, 33, 69, 4, 0, 121, 69, 4, 0, 39, 69, 60, 0, 85, 4, 69, 0, 109, 4, 4, 61, 39, 69, 64, 0, 43, 69, 69, 31, 41, 70, 66, 1, 20, 69, 69, 70, 41, 70, 65, 1, 43, 71, 64, 31, 20, 70, 70, 71, 38, 70, 70, 0, 20, 69, 69, 70, 20, 69, 69, 59, 0, 68, 69, 0, 41, 69, 64, 1, 1, 70, 0, 0, 43, 70, 70, 31, 20, 69, 69, 70, 38, 69, 69, 254, 20, 69, 69, 58, 0, 67, 69, 0, 129, 68, 0, 0, 139, 67, 0, 0, 140, 1, 111, 0, 0, 0, 0, 0, 2, 99, 0, 0, 16, 39, 0, 0, 2, 100, 0, 0, 8, 7, 0, 0, 2, 101, 0, 0, 244, 24, 0, 0, 2, 102, 0, 0, 248, 24, 0, 0, 2, 103, 0, 0, 0, 25, 0, 0, 2, 104, 0, 0, 252, 24, 0, 0, 1, 97, 0, 0, 136, 105, 0, 0, 0, 98, 105, 0, 136, 105, 0, 0, 25, 105, 105, 32, 137, 105, 0, 0, 130, 105, 0, 0, 136, 106, 0, 0, 49, 105, 105, 106, 212, 123, 0, 0, 1, 106, 32, 0, 135, 105, 0, 0, 106, 0, 0, 0, 25, 96, 98, 8, 0, 95, 98, 0, 0, 12, 0, 0, 0, 45, 12, 0, 1, 105, 255, 0, 19, 105, 45, 105, 0, 56, 105, 0, 85, 95, 56, 0, 1, 106, 19, 12, 134, 105, 0, 0, 24, 18, 1, 0, 106, 95, 0, 0, 0, 67, 12, 0, 1, 105, 255, 0, 19, 105, 67, 105, 0, 78, 105, 0, 1, 105, 3, 0, 15, 89, 105, 78, 121, 89, 5, 0, 1, 1, 11, 0, 0, 94, 1, 0, 137, 98, 0, 0, 139, 94, 0, 0, 0, 2, 12, 0, 1, 105, 255, 0, 19, 105, 2, 105, 0, 3, 105, 0, 25, 4, 3, 73, 78, 5, 4, 0, 38, 105, 5, 1, 0, 6, 105, 0, 121, 6, 5, 0, 1, 1, 12, 0, 0, 94, 1, 0, 137, 98, 0, 0, 139, 94, 0, 0, 1, 106, 70, 0, 1, 107, 0, 0, 1, 108, 1, 0, 134, 105, 0, 0, 104, 197, 0, 0, 106, 107, 108, 0, 0, 7, 12, 0, 1, 105, 255, 0, 19, 105, 7, 105, 0, 8, 105, 0, 1, 105, 0, 0, 1, 108, 4, 0, 138, 8, 105, 108, 172, 124, 0, 0, 64, 125, 0, 0, 212, 125, 0, 0, 104, 126, 0, 0, 119, 0, 149, 0, 82, 9, 101, 0, 25, 10, 9, 1, 85, 101, 10, 0, 1, 105, 51, 0, 1, 108, 100, 0, 1, 107, 1, 0, 1, 106, 10, 0, 134, 11, 0, 0, 0, 0, 0, 0, 105, 108, 107, 99, 106, 0, 0, 0, 0, 23, 11, 0, 0, 13, 23, 0, 41, 106, 13, 24, 42, 106, 106, 24, 33, 14, 106, 0, 120, 14, 15, 0, 1, 107, 0, 0, 134, 106, 0, 0, 24, 15, 1, 0, 107, 0, 0, 0, 1, 106, 55, 0, 1, 107, 100, 0, 1, 108, 1, 0, 1, 105, 10, 0, 134, 16, 0, 0, 88, 7, 1, 0, 106, 107, 108, 100, 105, 0, 0, 0, 0, 23, 16, 0, 119, 0, 118, 0, 0, 15, 23, 0, 0, 1, 15, 0, 0, 94, 1, 0, 137, 98, 0, 0, 139, 94, 0, 0, 119, 0, 112, 0, 82, 17, 102, 0, 25, 18, 17, 1, 85, 102, 18, 0, 1, 105, 67, 0, 1, 108, 100, 0, 1, 107, 1, 0, 1, 106, 10, 0, 134, 19, 0, 0, 0, 0, 0, 0, 105, 108, 107, 99, 106, 0, 0, 0, 0, 23, 19, 0, 0, 20, 23, 0, 41, 106, 20, 24, 42, 106, 106, 24, 33, 21, 106, 0, 120, 21, 15, 0, 1, 107, 0, 0, 134, 106, 0, 0, 24, 15, 1, 0, 107, 0, 0, 0, 1, 106, 80, 0, 1, 107, 100, 0, 1, 108, 1, 0, 1, 105, 10, 0, 134, 24, 0, 0, 88, 7, 1, 0, 106, 107, 108, 100, 105, 0, 0, 0, 0, 23, 24, 0, 119, 0, 81, 0, 0, 22, 23, 0, 0, 1, 22, 0, 0, 94, 1, 0, 137, 98, 0, 0, 139, 94, 0, 0, 119, 0, 75, 0, 82, 25, 104, 0, 25, 26, 25, 1, 85, 104, 26, 0, 1, 105, 71, 0, 1, 108, 100, 0, 1, 107, 1, 0, 1, 106, 10, 0, 134, 27, 0, 0, 0, 0, 0, 0, 105, 108, 107, 99, 106, 0, 0, 0, 0, 23, 27, 0, 0, 28, 23, 0, 41, 106, 28, 24, 42, 106, 106, 24, 33, 29, 106, 0, 120, 29, 15, 0, 1, 107, 0, 0, 134, 106, 0, 0, 24, 15, 1, 0, 107, 0, 0, 0, 1, 106, 85, 0, 1, 107, 100, 0, 1, 108, 1, 0, 1, 105, 10, 0, 134, 31, 0, 0, 88, 7, 1, 0, 106, 107, 108, 100, 105, 0, 0, 0, 0, 23, 31, 0, 119, 0, 44, 0, 0, 30, 23, 0, 0, 1, 30, 0, 0, 94, 1, 0, 137, 98, 0, 0, 139, 94, 0, 0, 119, 0, 38, 0, 82, 32, 103, 0, 25, 33, 32, 1, 85, 103, 33, 0, 1, 105, 75, 0, 1, 108, 100, 0, 1, 107, 1, 0, 1, 106, 10, 0, 134, 35, 0, 0, 0, 0, 0, 0, 105, 108, 107, 99, 106, 0, 0, 0, 0, 23, 35, 0, 0, 36, 23, 0, 41, 106, 36, 24, 42, 106, 106, 24, 33, 37, 106, 0, 120, 37, 15, 0, 1, 107, 0, 0, 134, 106, 0, 0, 24, 15, 1, 0, 107, 0, 0, 0, 1, 106, 89, 0, 1, 107, 100, 0, 1, 108, 1, 0, 1, 105, 10, 0, 134, 39, 0, 0, 88, 7, 1, 0, 106, 107, 108, 100, 105, 0, 0, 0, 0, 23, 39, 0, 119, 0, 7, 0, 0, 38, 23, 0, 0, 1, 38, 0, 0, 94, 1, 0, 137, 98, 0, 0, 139, 94, 0, 0, 119, 0, 1, 0, 0, 40, 23, 0, 41, 105, 40, 24, 42, 105, 105, 24, 33, 41, 105, 0, 121, 41, 16, 0, 0, 42, 23, 0, 1, 105, 255, 0, 19, 105, 42, 105, 0, 43, 105, 0, 33, 44, 43, 1, 121, 44, 10, 0, 1, 108, 1, 0, 134, 105, 0, 0, 24, 15, 1, 0, 108, 0, 0, 0, 0, 46, 23, 0, 0, 1, 46, 0, 0, 94, 1, 0, 137, 98, 0, 0, 139, 94, 0, 0, 1, 108, 170, 255, 1, 107, 0, 0, 1, 106, 1, 0, 134, 105, 0, 0, 104, 197, 0, 0, 108, 107, 106, 0, 1, 106, 220, 5, 134, 105, 0, 0, 48, 10, 1, 0, 106, 0, 0, 0, 1, 106, 43, 12, 134, 105, 0, 0, 24, 18, 1, 0, 106, 96, 0, 0, 1, 105, 92, 24, 80, 47, 105, 0, 0, 34, 47, 0, 1, 105, 92, 24, 1, 106, 15, 0, 84, 105, 106, 0, 1, 105, 200, 0, 134, 106, 0, 0, 48, 10, 1, 0, 105, 0, 0, 0, 1, 105, 221, 255, 1, 107, 144, 1, 134, 106, 0, 0, 88, 253, 0, 0, 105, 107, 0, 0, 1, 107, 200, 0, 134, 106, 0, 0, 48, 10, 1, 0, 107, 0, 0, 0, 1, 107, 35, 0, 1, 105, 238, 2, 134, 106, 0, 0, 88, 253, 0, 0, 107, 105, 0, 0, 1, 105, 200, 0, 134, 106, 0, 0, 48, 10, 1, 0, 105, 0, 0, 0, 1, 105, 206, 255, 1, 107, 232, 3, 134, 106, 0, 0, 88, 253, 0, 0, 105, 107, 0, 0, 1, 107, 200, 0, 134, 106, 0, 0, 48, 10, 1, 0, 107, 0, 0, 0, 0, 48, 34, 0, 1, 106, 92, 24, 84, 106, 48, 0, 1, 107, 200, 0, 134, 106, 0, 0, 48, 10, 1, 0, 107, 0, 0, 0, 1, 107, 156, 255, 1, 105, 136, 19, 134, 106, 0, 0, 88, 253, 0, 0, 107, 105, 0, 0, 1, 105, 232, 3, 134, 106, 0, 0, 48, 10, 1, 0, 105, 0, 0, 0, 1, 105, 1, 0, 134, 106, 0, 0, 24, 15, 1, 0, 105, 0, 0, 0, 0, 49, 12, 0, 1, 106, 255, 0, 19, 106, 49, 106, 0, 50, 106, 0, 1, 109, 0, 0, 1, 108, 4, 0, 138, 50, 109, 108, 152, 128, 0, 0, 236, 128, 0, 0, 64, 129, 0, 0, 148, 129, 0, 0, 119, 0, 105, 0, 1, 106, 51, 0, 1, 105, 100, 0, 1, 107, 0, 0, 1, 108, 152, 58, 1, 109, 7, 0, 134, 51, 0, 0, 0, 0, 0, 0, 106, 105, 107, 108, 109, 0, 0, 0, 0, 23, 51, 0, 0, 52, 23, 0, 41, 109, 52, 24, 42, 109, 109, 24, 33, 53, 109, 0, 121, 53, 90, 0, 0, 54, 23, 0, 0, 1, 54, 0, 0, 94, 1, 0, 137, 98, 0, 0, 139, 94, 0, 0, 119, 0, 84, 0, 1, 109, 67, 0, 1, 108, 100, 0, 1, 107, 0, 0, 1, 105, 152, 58, 1, 106, 7, 0, 134, 55, 0, 0, 0, 0, 0, 0, 109, 108, 107, 105, 106, 0, 0, 0, 0, 23, 55, 0, 0, 57, 23, 0, 41, 106, 57, 24, 42, 106, 106, 24, 33, 58, 106, 0, 121, 58, 69, 0, 0, 59, 23, 0, 0, 1, 59, 0, 0, 94, 1, 0, 137, 98, 0, 0, 139, 94, 0, 0, 119, 0, 63, 0, 1, 106, 71, 0, 1, 105, 100, 0, 1, 107, 0, 0, 1, 108, 152, 58, 1, 109, 7, 0, 134, 60, 0, 0, 0, 0, 0, 0, 106, 105, 107, 108, 109, 0, 0, 0, 0, 23, 60, 0, 0, 61, 23, 0, 41, 109, 61, 24, 42, 109, 109, 24, 33, 62, 109, 0, 121, 62, 48, 0, 0, 63, 23, 0, 0, 1, 63, 0, 0, 94, 1, 0, 137, 98, 0, 0, 139, 94, 0, 0, 119, 0, 42, 0, 1, 109, 75, 0, 1, 108, 100, 0, 1, 107, 0, 0, 1, 105, 152, 58, 1, 106, 7, 0, 134, 64, 0, 0, 0, 0, 0, 0, 109, 108, 107, 105, 106, 0, 0, 0, 0, 23, 64, 0, 0, 65, 23, 0, 41, 106, 65, 24, 42, 106, 106, 24, 33, 66, 106, 0, 121, 66, 6, 0, 0, 68, 23, 0, 0, 1, 68, 0, 0, 94, 1, 0, 137, 98, 0, 0, 139, 94, 0, 0, 1, 106, 71, 0, 1, 105, 100, 0, 1, 107, 1, 0, 1, 108, 152, 58, 1, 109, 7, 0, 134, 69, 0, 0, 0, 0, 0, 0, 106, 105, 107, 108, 109, 0, 0, 0, 0, 23, 69, 0, 0, 70, 23, 0, 41, 109, 70, 24, 42, 109, 109, 24, 33, 71, 109, 0, 121, 71, 7, 0, 0, 72, 23, 0, 0, 1, 72, 0, 0, 94, 1, 0, 137, 98, 0, 0, 139, 94, 0, 0, 119, 0, 1, 0, 1, 108, 70, 0, 1, 107, 0, 0, 1, 105, 1, 0, 134, 109, 0, 0, 104, 197, 0, 0, 108, 107, 105, 0, 1, 109, 60, 0, 1, 105, 100, 0, 1, 107, 1, 0, 1, 108, 32, 78, 1, 106, 7, 0, 134, 73, 0, 0, 0, 0, 0, 0, 109, 105, 107, 108, 106, 0, 0, 0, 0, 23, 73, 0, 0, 74, 23, 0, 41, 106, 74, 24, 42, 106, 106, 24, 33, 75, 106, 0, 121, 75, 6, 0, 0, 76, 23, 0, 0, 1, 76, 0, 0, 94, 1, 0, 137, 98, 0, 0, 139, 94, 0, 0, 1, 106, 238, 2, 1, 108, 88, 2, 1, 107, 80, 0, 1, 105, 1, 0, 1, 109, 184, 11, 1, 110, 7, 0, 134, 77, 0, 0, 80, 148, 0, 0, 106, 108, 107, 105, 109, 110, 0, 0, 0, 23, 77, 0, 0, 79, 23, 0, 41, 110, 79, 24, 42, 110, 110, 24, 33, 80, 110, 0, 121, 80, 6, 0, 0, 81, 23, 0, 0, 1, 81, 0, 0, 94, 1, 0, 137, 98, 0, 0, 139, 94, 0, 0, 1, 110, 194, 1, 1, 109, 88, 2, 1, 105, 80, 0, 1, 107, 1, 0, 1, 108, 184, 11, 1, 106, 7, 0, 134, 82, 0, 0, 80, 148, 0, 0, 110, 109, 105, 107, 108, 106, 0, 0, 0, 23, 82, 0, 0, 83, 23, 0, 41, 106, 83, 24, 42, 106, 106, 24, 33, 84, 106, 0, 121, 84, 6, 0, 0, 85, 23, 0, 0, 1, 85, 0, 0, 94, 1, 0, 137, 98, 0, 0, 139, 94, 0, 0, 1, 108, 32, 3, 134, 106, 0, 0, 48, 10, 1, 0, 108, 0, 0, 0, 1, 108, 90, 0, 1, 107, 0, 0, 1, 105, 1, 0, 134, 106, 0, 0, 224, 208, 0, 0, 108, 107, 105, 0, 1, 105, 7, 0, 134, 106, 0, 0, 148, 12, 1, 0, 105, 0, 0, 0, 1, 105, 32, 3, 134, 106, 0, 0, 48, 10, 1, 0, 105, 0, 0, 0, 1, 105, 47, 0, 1, 107, 0, 0, 1, 108, 1, 0, 134, 106, 0, 0, 224, 208, 0, 0, 105, 107, 108, 0, 1, 108, 32, 3, 134, 106, 0, 0, 48, 10, 1, 0, 108, 0, 0, 0, 1, 106, 237, 2, 1, 108, 88, 2, 1, 107, 100, 0, 1, 105, 0, 0, 1, 109, 64, 31, 1, 110, 10, 0, 134, 86, 0, 0, 80, 148, 0, 0, 106, 108, 107, 105, 109, 110, 0, 0, 0, 23, 86, 0, 0, 87, 23, 0, 41, 110, 87, 24, 42, 110, 110, 24, 33, 88, 110, 0, 121, 88, 7, 0, 0, 90, 23, 0, 0, 1, 90, 0, 0, 94, 1, 0, 137, 98, 0, 0, 139, 94, 0, 0, 119, 0, 12, 0, 0, 91, 12, 0, 1, 110, 255, 0, 19, 110, 91, 110, 0, 92, 110, 0, 25, 93, 92, 73, 1, 110, 1, 0, 83, 93, 110, 0, 1, 1, 0, 0, 0, 94, 1, 0, 137, 98, 0, 0, 139, 94, 0, 0, 1, 110, 0, 0, 139, 110, 0, 0, 140, 1, 187, 0, 0, 0, 0, 0, 2, 182, 0, 0, 255, 255, 0, 0, 1, 180, 0, 0, 136, 183, 0, 0, 0, 181, 183, 0, 136, 183, 0, 0, 25, 183, 183, 16, 137, 183, 0, 0, 130, 183, 0, 0, 136, 184, 0, 0, 49, 183, 183, 184, 136, 132, 0, 0, 1, 184, 16, 0, 135, 183, 0, 0, 184, 0, 0, 0, 25, 6, 181, 3, 0, 92, 0, 0, 1, 103, 0, 0, 0, 114, 92, 0, 19, 183, 114, 182, 0, 125, 183, 0, 38, 183, 125, 2, 0, 136, 183, 0, 32, 147, 136, 2, 121, 147, 21, 0, 1, 183, 0, 0, 1, 184, 0, 0, 1, 185, 20, 1, 1, 186, 10, 1, 134, 158, 0, 0, 252, 203, 0, 0, 183, 184, 185, 186, 38, 186, 158, 1, 0, 169, 186, 0, 0, 7, 103, 0, 38, 186, 7, 1, 0, 18, 186, 0, 38, 186, 18, 1, 0, 29, 186, 0, 20, 186, 29, 169, 0, 40, 186, 0, 33, 51, 40, 0, 38, 186, 51, 1, 0, 62, 186, 0, 0, 103, 62, 0, 0, 73, 92, 0, 19, 186, 73, 182, 0, 84, 186, 0, 38, 186, 84, 4, 0, 90, 186, 0, 32, 91, 90, 4, 121, 91, 21, 0, 1, 186, 0, 0, 1, 185, 10, 1, 1, 184, 20, 1, 1, 183, 253, 4, 134, 93, 0, 0, 252, 203, 0, 0, 186, 185, 184, 183, 38, 183, 93, 1, 0, 94, 183, 0, 0, 95, 103, 0, 38, 183, 95, 1, 0, 96, 183, 0, 38, 183, 96, 1, 0, 97, 183, 0, 20, 183, 97, 94, 0, 98, 183, 0, 33, 99, 98, 0, 38, 183, 99, 1, 0, 100, 183, 0, 0, 103, 100, 0, 0, 101, 92, 0, 19, 183, 101, 182, 0, 102, 183, 0, 38, 183, 102, 8, 0, 104, 183, 0, 32, 105, 104, 8, 121, 105, 21, 0, 1, 183, 0, 0, 1, 184, 253, 4, 1, 185, 20, 1, 1, 186, 103, 6, 134, 106, 0, 0, 252, 203, 0, 0, 183, 184, 185, 186, 38, 186, 106, 1, 0, 107, 186, 0, 0, 108, 103, 0, 38, 186, 108, 1, 0, 109, 186, 0, 38, 186, 109, 1, 0, 110, 186, 0, 20, 186, 110, 107, 0, 111, 186, 0, 33, 112, 111, 0, 38, 186, 112, 1, 0, 113, 186, 0, 0, 103, 113, 0, 0, 115, 103, 0, 38, 186, 115, 1, 0, 116, 186, 0, 121, 116, 12, 0, 0, 117, 103, 0, 38, 186, 117, 1, 0, 118, 186, 0, 38, 186, 118, 1, 0, 1, 186, 0, 83, 6, 1, 0, 78, 5, 6, 0, 38, 186, 5, 1, 0, 89, 186, 0, 137, 181, 0, 0, 139, 89, 0, 0, 0, 119, 92, 0, 19, 186, 119, 182, 0, 120, 186, 0, 38, 186, 120, 16, 0, 121, 186, 0, 32, 122, 121, 16, 121, 122, 21, 0, 1, 186, 0, 0, 1, 185, 103, 6, 1, 184, 144, 1, 1, 183, 208, 7, 134, 123, 0, 0, 252, 203, 0, 0, 186, 185, 184, 183, 38, 183, 123, 1, 0, 124, 183, 0, 0, 126, 103, 0, 38, 183, 126, 1, 0, 127, 183, 0, 38, 183, 127, 1, 0, 128, 183, 0, 20, 183, 128, 124, 0, 129, 183, 0, 33, 130, 129, 0, 38, 183, 130, 1, 0, 131, 183, 0, 0, 103, 131, 0, 0, 132, 92, 0, 19, 183, 132, 182, 0, 133, 183, 0, 38, 183, 133, 32, 0, 134, 183, 0, 32, 135, 134, 32, 121, 135, 21, 0, 1, 183, 20, 1, 1, 184, 0, 0, 1, 185, 202, 4, 1, 186, 136, 4, 134, 137, 0, 0, 252, 203, 0, 0, 183, 184, 185, 186, 38, 186, 137, 1, 0, 138, 186, 0, 0, 139, 103, 0, 38, 186, 139, 1, 0, 140, 186, 0, 38, 186, 140, 1, 0, 141, 186, 0, 20, 186, 141, 138, 0, 142, 186, 0, 33, 143, 142, 0, 38, 186, 143, 1, 0, 144, 186, 0, 0, 103, 144, 0, 0, 145, 92, 0, 19, 186, 145, 182, 0, 146, 186, 0, 38, 186, 146, 64, 0, 148, 186, 0, 32, 149, 148, 64, 121, 149, 21, 0, 1, 186, 20, 1, 1, 185, 136, 4, 1, 184, 220, 5, 1, 183, 103, 6, 134, 150, 0, 0, 252, 203, 0, 0, 186, 185, 184, 183, 38, 183, 150, 1, 0, 151, 183, 0, 0, 152, 103, 0, 38, 183, 152, 1, 0, 153, 183, 0, 38, 183, 153, 1, 0, 154, 183, 0, 20, 183, 154, 151, 0, 155, 183, 0, 33, 156, 155, 0, 38, 183, 156, 1, 0, 157, 183, 0, 0, 103, 157, 0, 0, 159, 103, 0, 38, 183, 159, 1, 0, 160, 183, 0, 121, 160, 12, 0, 0, 161, 103, 0, 38, 183, 161, 1, 0, 162, 183, 0, 38, 183, 162, 1, 0, 2, 183, 0, 83, 6, 2, 0, 78, 5, 6, 0, 38, 183, 5, 1, 0, 89, 183, 0, 137, 181, 0, 0, 139, 89, 0, 0, 0, 163, 92, 0, 19, 183, 163, 182, 0, 164, 183, 0, 1, 183, 128, 0, 19, 183, 164, 183, 0, 165, 183, 0, 1, 183, 128, 0, 13, 166, 165, 183, 121, 166, 21, 0, 1, 183, 220, 5, 1, 184, 136, 4, 1, 185, 146, 9, 1, 186, 103, 6, 134, 167, 0, 0, 252, 203, 0, 0, 183, 184, 185, 186, 38, 186, 167, 1, 0, 168, 186, 0, 0, 170, 103, 0, 38, 186, 170, 1, 0, 171, 186, 0, 38, 186, 171, 1, 0, 172, 186, 0, 20, 186, 172, 168, 0, 173, 186, 0, 33, 174, 173, 0, 38, 186, 174, 1, 0, 175, 186, 0, 0, 103, 175, 0, 0, 176, 92, 0, 19, 186, 176, 182, 0, 177, 186, 0, 1, 186, 0, 1, 19, 186, 177, 186, 0, 178, 186, 0, 1, 186, 0, 1, 13, 179, 178, 186, 121, 179, 21, 0, 1, 186, 144, 1, 1, 185, 103, 6, 1, 184, 220, 5, 1, 183, 208, 7, 134, 8, 0, 0, 252, 203, 0, 0, 186, 185, 184, 183, 38, 183, 8, 1, 0, 9, 183, 0, 0, 10, 103, 0, 38, 183, 10, 1, 0, 11, 183, 0, 38, 183, 11, 1, 0, 12, 183, 0, 20, 183, 12, 9, 0, 13, 183, 0, 33, 14, 13, 0, 38, 183, 14, 1, 0, 15, 183, 0, 0, 103, 15, 0, 0, 16, 92, 0, 19, 183, 16, 182, 0, 17, 183, 0, 1, 183, 0, 2, 19, 183, 17, 183, 0, 19, 183, 0, 1, 183, 0, 2, 13, 20, 19, 183, 121, 20, 21, 0, 1, 183, 146, 9, 1, 184, 0, 0, 1, 185, 184, 11, 1, 186, 103, 6, 134, 21, 0, 0, 252, 203, 0, 0, 183, 184, 185, 186, 38, 186, 21, 1, 0, 22, 186, 0, 0, 23, 103, 0, 38, 186, 23, 1, 0, 24, 186, 0, 38, 186, 24, 1, 0, 25, 186, 0, 20, 186, 25, 22, 0, 26, 186, 0, 33, 27, 26, 0, 38, 186, 27, 1, 0, 28, 186, 0, 0, 103, 28, 0, 0, 30, 103, 0, 38, 186, 30, 1, 0, 31, 186, 0, 121, 31, 12, 0, 0, 32, 103, 0, 38, 186, 32, 1, 0, 33, 186, 0, 38, 186, 33, 1, 0, 3, 186, 0, 83, 6, 3, 0, 78, 5, 6, 0, 38, 186, 5, 1, 0, 89, 186, 0, 137, 181, 0, 0, 139, 89, 0, 0, 0, 34, 92, 0, 19, 186, 34, 182, 0, 35, 186, 0, 1, 186, 0, 4, 19, 186, 35, 186, 0, 36, 186, 0, 1, 186, 0, 4, 13, 37, 36, 186, 121, 37, 21, 0, 1, 186, 220, 5, 1, 185, 103, 6, 1, 184, 184, 11, 1, 183, 208, 7, 134, 38, 0, 0, 252, 203, 0, 0, 186, 185, 184, 183, 38, 183, 38, 1, 0, 39, 183, 0, 0, 41, 103, 0, 38, 183, 41, 1, 0, 42, 183, 0, 38, 183, 42, 1, 0, 43, 183, 0, 20, 183, 43, 39, 0, 44, 183, 0, 33, 45, 44, 0, 38, 183, 45, 1, 0, 46, 183, 0, 0, 103, 46, 0, 0, 47, 92, 0, 19, 183, 47, 182, 0, 48, 183, 0, 1, 183, 0, 8, 19, 183, 48, 183, 0, 49, 183, 0, 1, 183, 0, 8, 13, 50, 49, 183, 121, 50, 21, 0, 1, 183, 202, 4, 1, 184, 0, 0, 1, 185, 220, 5, 1, 186, 136, 4, 134, 52, 0, 0, 252, 203, 0, 0, 183, 184, 185, 186, 38, 186, 52, 1, 0, 53, 186, 0, 0, 54, 103, 0, 38, 186, 54, 1, 0, 55, 186, 0, 38, 186, 55, 1, 0, 56, 186, 0, 20, 186, 56, 53, 0, 57, 186, 0, 33, 58, 57, 0, 38, 186, 58, 1, 0, 59, 186, 0, 0, 103, 59, 0, 0, 60, 92, 0, 19, 186, 60, 182, 0, 61, 186, 0, 1, 186, 0, 16, 19, 186, 61, 186, 0, 63, 186, 0, 1, 186, 0, 16, 13, 64, 63, 186, 121, 64, 21, 0, 1, 186, 220, 5, 1, 185, 0, 0, 1, 184, 132, 8, 1, 183, 136, 4, 134, 65, 0, 0, 252, 203, 0, 0, 186, 185, 184, 183, 38, 183, 65, 1, 0, 66, 183, 0, 0, 67, 103, 0, 38, 183, 67, 1, 0, 68, 183, 0, 38, 183, 68, 1, 0, 69, 183, 0, 20, 183, 69, 66, 0, 70, 183, 0, 33, 71, 70, 0, 38, 183, 71, 1, 0, 72, 183, 0, 0, 103, 72, 0, 0, 74, 92, 0, 19, 183, 74, 182, 0, 75, 183, 0, 1, 183, 0, 32, 19, 183, 75, 183, 0, 76, 183, 0, 1, 183, 0, 32, 13, 77, 76, 183, 121, 77, 21, 0, 1, 183, 132, 8, 1, 184, 0, 0, 1, 185, 146, 9, 1, 186, 136, 4, 134, 78, 0, 0, 252, 203, 0, 0, 183, 184, 185, 186, 38, 186, 78, 1, 0, 79, 186, 0, 0, 80, 103, 0, 38, 186, 80, 1, 0, 81, 186, 0, 38, 186, 81, 1, 0, 82, 186, 0, 20, 186, 82, 79, 0, 83, 186, 0, 33, 85, 83, 0, 38, 186, 85, 1, 0, 86, 186, 0, 0, 103, 86, 0, 0, 87, 103, 0, 38, 186, 87, 1, 0, 88, 186, 0, 38, 186, 88, 1, 0, 4, 186, 0, 83, 6, 4, 0, 78, 5, 6, 0, 38, 186, 5, 1, 0, 89, 186, 0, 137, 181, 0, 0, 139, 89, 0, 0, 140, 0, 95, 0, 0, 0, 0, 0, 2, 85, 0, 0, 244, 1, 0, 0, 2, 86, 0, 0, 141, 23, 0, 0, 2, 87, 0, 0, 255, 0, 0, 0, 2, 88, 0, 0, 44, 1, 0, 0, 2, 89, 0, 0, 208, 7, 0, 0, 1, 83, 0, 0, 136, 90, 0, 0, 0, 84, 90, 0, 136, 90, 0, 0, 25, 90, 90, 64, 137, 90, 0, 0, 130, 90, 0, 0, 136, 91, 0, 0, 49, 90, 90, 91, 140, 139, 0, 0, 1, 91, 64, 0, 135, 90, 0, 0, 91, 0, 0, 0, 25, 82, 84, 24, 25, 81, 84, 16, 25, 80, 84, 8, 0, 79, 84, 0, 25, 12, 84, 40, 25, 34, 84, 32, 1, 91, 94, 0, 134, 90, 0, 0, 156, 93, 0, 0, 12, 91, 0, 0, 1, 91, 91, 12, 134, 90, 0, 0, 24, 18, 1, 0, 91, 79, 0, 0, 1, 90, 8, 0, 78, 67, 90, 0, 38, 90, 67, 1, 0, 77, 90, 0, 121, 77, 5, 0, 1, 0, 12, 0, 0, 76, 0, 0, 137, 84, 0, 0, 139, 76, 0, 0, 1, 90, 212, 24, 82, 78, 90, 0, 25, 2, 78, 1, 1, 90, 212, 24, 85, 90, 2, 0, 1, 90, 0, 0, 1, 91, 0, 0, 1, 92, 8, 7, 1, 93, 88, 2, 134, 3, 0, 0, 252, 203, 0, 0, 90, 91, 92, 93, 120, 3, 21, 0, 1, 93, 43, 0, 1, 92, 100, 0, 1, 91, 1, 0, 1, 90, 32, 78, 1, 94, 10, 0, 134, 4, 0, 0, 0, 0, 0, 0, 93, 92, 91, 90, 94, 0, 0, 0, 0, 1, 4, 0, 0, 5, 1, 0, 41, 94, 5, 24, 42, 94, 94, 24, 33, 6, 94, 0, 121, 6, 6, 0, 0, 7, 1, 0, 0, 0, 7, 0, 0, 76, 0, 0, 137, 84, 0, 0, 139, 76, 0, 0, 1, 94, 43, 0, 1, 90, 100, 0, 1, 91, 1, 0, 1, 92, 32, 78, 1, 93, 10, 0, 134, 8, 0, 0, 0, 0, 0, 0, 94, 90, 91, 92, 93, 0, 0, 0, 0, 1, 8, 0, 0, 9, 1, 0, 41, 93, 9, 24, 42, 93, 93, 24, 33, 10, 93, 0, 121, 10, 6, 0, 0, 11, 1, 0, 0, 0, 11, 0, 0, 76, 0, 0, 137, 84, 0, 0, 139, 76, 0, 0, 1, 23, 2, 0, 1, 93, 116, 0, 82, 93, 93, 0, 85, 34, 93, 0, 1, 92, 116, 0, 106, 92, 92, 4, 109, 34, 4, 92, 1, 45, 0, 0, 0, 13, 45, 0, 19, 92, 13, 87, 0, 14, 92, 0, 34, 15, 14, 2, 120, 15, 3, 0, 1, 83, 21, 0, 119, 0, 196, 0, 0, 16, 45, 0, 19, 92, 16, 87, 0, 17, 92, 0, 85, 80, 17, 0, 1, 93, 111, 12, 134, 92, 0, 0, 24, 18, 1, 0, 93, 80, 0, 0, 0, 18, 45, 0, 19, 92, 18, 87, 0, 19, 92, 0, 32, 20, 19, 0, 121, 20, 9, 0, 1, 92, 150, 0, 1, 93, 194, 1, 1, 91, 100, 0, 134, 21, 0, 0, 128, 144, 0, 0, 92, 93, 91, 0, 0, 1, 21, 0, 119, 0, 20, 0, 82, 22, 12, 0, 0, 24, 45, 0, 19, 91, 24, 87, 0, 25, 91, 0, 41, 91, 25, 2, 3, 26, 34, 91, 82, 27, 26, 0, 3, 28, 22, 27, 25, 29, 12, 4, 82, 30, 29, 0, 1, 91, 100, 0, 1, 93, 0, 0, 1, 92, 112, 23, 1, 90, 10, 0, 134, 31, 0, 0, 80, 148, 0, 0, 28, 30, 91, 93, 92, 90, 0, 0, 0, 1, 31, 0, 0, 32, 1, 0, 41, 90, 32, 24, 42, 90, 90, 24, 33, 33, 90, 0, 121, 33, 3, 0, 1, 83, 14, 0, 119, 0, 149, 0, 1, 92, 215, 11, 134, 90, 0, 0, 24, 18, 1, 0, 92, 81, 0, 0, 134, 36, 0, 0, 148, 15, 1, 0, 134, 37, 0, 0, 80, 254, 0, 0, 36, 89, 89, 0, 0, 1, 37, 0, 0, 38, 1, 0, 41, 90, 38, 24, 42, 90, 90, 24, 33, 39, 90, 0, 121, 39, 3, 0, 1, 83, 16, 0, 119, 0, 132, 0, 78, 41, 86, 0, 38, 90, 41, 1, 0, 42, 90, 0, 1, 90, 44, 0, 1, 92, 126, 0, 125, 43, 42, 90, 92, 0, 0, 0, 1, 90, 0, 0, 1, 93, 1, 0, 134, 92, 0, 0, 56, 191, 0, 0, 43, 90, 93, 0, 1, 93, 8, 12, 134, 92, 0, 0, 24, 18, 1, 0, 93, 82, 0, 0, 1, 93, 0, 0, 134, 92, 0, 0, 24, 15, 1, 0, 93, 0, 0, 0, 82, 44, 12, 0, 0, 46, 45, 0, 19, 92, 46, 87, 0, 47, 92, 0, 41, 92, 47, 2, 3, 48, 34, 92, 82, 49, 48, 0, 3, 50, 44, 49, 1, 92, 100, 0, 1, 93, 50, 0, 1, 90, 0, 0, 1, 91, 10, 0, 134, 51, 0, 0, 80, 148, 0, 0, 50, 92, 93, 90, 89, 91, 0, 0, 0, 1, 51, 0, 1, 56, 0, 0, 0, 52, 56, 0, 19, 91, 52, 87, 0, 53, 91, 0, 34, 54, 53, 2, 120, 54, 2, 0, 119, 0, 56, 0, 134, 91, 0, 0, 48, 10, 1, 0, 88, 0, 0, 0, 78, 55, 86, 0, 38, 91, 55, 1, 0, 57, 91, 0, 1, 91, 126, 0, 1, 90, 44, 0, 125, 58, 57, 91, 90, 0, 0, 0, 1, 91, 0, 0, 1, 93, 1, 0, 134, 90, 0, 0, 56, 191, 0, 0, 58, 91, 93, 0, 134, 90, 0, 0, 48, 10, 1, 0, 85, 0, 0, 0, 1, 93, 20, 0, 1, 91, 0, 0, 1, 92, 1, 0, 134, 90, 0, 0, 32, 194, 0, 0, 93, 91, 92, 0, 134, 90, 0, 0, 48, 10, 1, 0, 88, 0, 0, 0, 78, 59, 86, 0, 38, 90, 59, 1, 0, 60, 90, 0, 1, 90, 44, 0, 1, 92, 126, 0, 125, 61, 60, 90, 92, 0, 0, 0, 1, 90, 0, 0, 1, 91, 1, 0, 134, 92, 0, 0, 56, 191, 0, 0, 61, 90, 91, 0, 134, 92, 0, 0, 48, 10, 1, 0, 85, 0, 0, 0, 1, 91, 126, 0, 1, 90, 0, 0, 1, 93, 1, 0, 134, 92, 0, 0, 32, 194, 0, 0, 91, 90, 93, 0, 0, 62, 56, 0, 25, 92, 62, 1, 41, 92, 92, 24, 42, 92, 92, 24, 0, 63, 92, 0, 0, 56, 63, 0, 119, 0, 196, 255, 134, 92, 0, 0, 48, 10, 1, 0, 85, 0, 0, 0, 82, 64, 12, 0, 0, 65, 45, 0, 19, 92, 65, 87, 0, 66, 92, 0, 41, 92, 66, 2, 3, 68, 34, 92, 82, 69, 68, 0, 3, 70, 64, 69, 25, 71, 12, 4, 82, 72, 71, 0, 1, 92, 100, 0, 1, 93, 1, 0, 1, 90, 10, 0, 134, 73, 0, 0, 80, 148, 0, 0, 70, 72, 92, 93, 89, 90, 0, 0, 0, 1, 73, 0, 1, 93, 1, 0, 134, 90, 0, 0, 24, 15, 1, 0, 93, 0, 0, 0, 0, 74, 45, 0, 25, 90, 74, 1, 41, 90, 90, 24, 42, 90, 90, 24, 0, 75, 90, 0, 0, 45, 75, 0, 119, 0, 55, 255, 32, 90, 83, 14, 121, 90, 7, 0, 0, 35, 1, 0, 0, 0, 35, 0, 0, 76, 0, 0, 137, 84, 0, 0, 139, 76, 0, 0, 119, 0, 22, 0, 32, 90, 83, 16, 121, 90, 7, 0, 0, 40, 1, 0, 0, 0, 40, 0, 0, 76, 0, 0, 137, 84, 0, 0, 139, 76, 0, 0, 119, 0, 14, 0, 32, 90, 83, 21, 121, 90, 12, 0, 1, 93, 10, 0, 134, 90, 0, 0, 148, 12, 1, 0, 93, 0, 0, 0, 1, 90, 8, 0, 1, 93, 1, 0, 83, 90, 93, 0, 1, 0, 0, 0, 0, 76, 0, 0, 137, 84, 0, 0, 139, 76, 0, 0, 1, 93, 0, 0, 139, 93, 0, 0, 140, 3, 68, 0, 0, 0, 0, 0, 2, 62, 0, 0, 255, 0, 0, 0, 2, 63, 0, 0, 32, 78, 0, 0, 2, 64, 0, 0, 20, 24, 0, 0, 2, 65, 0, 0, 136, 19, 0, 0, 1, 60, 0, 0, 136, 66, 0, 0, 0, 61, 66, 0, 136, 66, 0, 0, 25, 66, 66, 48, 137, 66, 0, 0, 130, 66, 0, 0, 136, 67, 0, 0, 49, 66, 66, 67, 220, 144, 0, 0, 1, 67, 48, 0, 135, 66, 0, 0, 67, 0, 0, 0, 0, 59, 61, 0, 25, 5, 61, 8, 0, 34, 0, 0, 0, 45, 1, 0, 0, 55, 2, 0, 1, 56, 1, 0, 1, 57, 2, 0, 1, 58, 4, 0, 1, 3, 8, 0, 1, 67, 94, 0, 134, 66, 0, 0, 156, 93, 0, 0, 5, 67, 0, 0, 1, 6, 1, 0, 1, 7, 0, 0, 1, 67, 164, 4, 134, 66, 0, 0, 24, 18, 1, 0, 67, 59, 0, 0, 1, 66, 8, 0, 78, 8, 66, 0, 38, 66, 8, 1, 0, 9, 66, 0, 121, 9, 3, 0, 1, 23, 12, 0, 119, 0, 193, 0, 0, 10, 7, 0, 19, 66, 10, 62, 0, 11, 66, 0, 34, 12, 11, 30, 120, 12, 3, 0, 1, 60, 24, 0, 119, 0, 146, 0, 0, 13, 7, 0, 25, 66, 13, 1, 41, 66, 66, 24, 42, 66, 66, 24, 0, 14, 66, 0, 0, 7, 14, 0, 0, 15, 6, 0, 19, 66, 15, 62, 0, 16, 66, 0, 1, 66, 1, 0, 1, 67, 8, 0, 138, 16, 66, 67, 184, 145, 0, 0, 36, 146, 0, 0, 176, 145, 0, 0, 160, 146, 0, 0, 176, 145, 0, 0, 176, 145, 0, 0, 176, 145, 0, 0, 8, 147, 0, 0, 1, 60, 21, 0, 119, 0, 124, 0, 82, 17, 5, 0, 25, 18, 5, 4, 82, 19, 18, 0, 0, 20, 55, 0, 1, 66, 1, 0, 1, 67, 5, 0, 134, 21, 0, 0, 80, 148, 0, 0, 17, 19, 20, 66, 63, 67, 0, 0, 0, 4, 21, 0, 0, 22, 4, 0, 19, 67, 22, 62, 0, 24, 67, 0, 1, 67, 0, 0, 1, 66, 3, 0, 138, 24, 67, 66, 16, 146, 0, 0, 8, 146, 0, 0, 24, 146, 0, 0, 1, 60, 8, 0, 119, 0, 102, 0, 1, 60, 7, 0, 119, 0, 100, 0, 119, 0, 1, 0, 1, 6, 2, 0, 119, 0, 89, 0, 80, 26, 64, 0, 41, 67, 26, 16, 42, 67, 67, 16, 0, 27, 67, 0, 0, 28, 45, 0, 0, 29, 55, 0, 1, 67, 1, 0, 1, 66, 3, 0, 134, 30, 0, 0, 80, 148, 0, 0, 27, 28, 29, 67, 63, 66, 0, 0, 0, 4, 30, 0, 0, 31, 4, 0, 19, 66, 31, 62, 0, 32, 66, 0, 1, 66, 0, 0, 1, 67, 3, 0, 138, 32, 66, 67, 132, 146, 0, 0, 124, 146, 0, 0, 140, 146, 0, 0, 1, 60, 12, 0, 119, 0, 73, 0, 1, 6, 4, 0, 119, 0, 63, 0, 134, 66, 0, 0, 48, 10, 1, 0, 65, 0, 0, 0, 1, 6, 1, 0, 119, 0, 58, 0, 82, 35, 5, 0, 0, 36, 45, 0, 0, 37, 55, 0, 1, 66, 1, 0, 1, 67, 5, 0, 134, 38, 0, 0, 80, 148, 0, 0, 35, 36, 37, 66, 63, 67, 0, 0, 0, 4, 38, 0, 0, 39, 4, 0, 19, 67, 39, 62, 0, 40, 67, 0, 1, 67, 0, 0, 1, 66, 3, 0, 138, 40, 67, 66, 244, 146, 0, 0, 236, 146, 0, 0, 252, 146, 0, 0, 1, 60, 16, 0, 119, 0, 45, 0, 1, 60, 15, 0, 119, 0, 43, 0, 119, 0, 1, 0, 1, 6, 8, 0, 119, 0, 32, 0, 80, 42, 64, 0, 41, 67, 42, 16, 42, 67, 67, 16, 0, 43, 67, 0, 0, 44, 34, 0, 0, 46, 55, 0, 1, 67, 1, 0, 1, 66, 3, 0, 134, 47, 0, 0, 80, 148, 0, 0, 43, 44, 46, 67, 63, 66, 0, 0, 0, 4, 47, 0, 0, 48, 4, 0, 19, 66, 48, 62, 0, 49, 66, 0, 1, 66, 0, 0, 1, 67, 3, 0, 138, 49, 66, 67, 104, 147, 0, 0, 96, 147, 0, 0, 112, 147, 0, 0, 1, 60, 20, 0, 119, 0, 16, 0, 1, 6, 1, 0, 119, 0, 6, 0, 134, 66, 0, 0, 48, 10, 1, 0, 65, 0, 0, 0, 1, 6, 4, 0, 119, 0, 1, 0, 0, 51, 7, 0, 19, 66, 51, 62, 0, 52, 66, 0, 1, 66, 30, 0, 17, 53, 66, 52, 121, 53, 107, 255, 1, 60, 23, 0, 119, 0, 1, 0, 32, 66, 60, 7, 121, 66, 3, 0, 1, 23, 0, 0, 119, 0, 37, 0, 32, 66, 60, 8, 121, 66, 4, 0, 0, 25, 4, 0, 0, 23, 25, 0, 119, 0, 32, 0, 32, 66, 60, 12, 121, 66, 4, 0, 0, 33, 4, 0, 0, 23, 33, 0, 119, 0, 27, 0, 32, 66, 60, 15, 121, 66, 3, 0, 1, 23, 0, 0, 119, 0, 23, 0, 32, 66, 60, 16, 121, 66, 4, 0, 0, 41, 4, 0, 0, 23, 41, 0, 119, 0, 18, 0, 32, 66, 60, 20, 121, 66, 4, 0, 0, 50, 4, 0, 0, 23, 50, 0, 119, 0, 13, 0, 32, 66, 60, 21, 121, 66, 3, 0, 1, 23, 10, 0, 119, 0, 9, 0, 32, 66, 60, 23, 121, 66, 3, 0, 1, 23, 1, 0, 119, 0, 5, 0, 32, 66, 60, 24, 121, 66, 3, 0, 1, 23, 1, 0, 119, 0, 1, 0, 0, 54, 23, 0, 137, 61, 0, 0, 139, 54, 0, 0, 140, 6, 85, 0, 0, 0, 0, 0, 2, 82, 0, 0, 255, 0, 0, 0, 1, 80, 0, 0, 136, 83, 0, 0, 0, 81, 83, 0, 136, 83, 0, 0, 25, 83, 83, 80, 137, 83, 0, 0, 130, 83, 0, 0, 136, 84, 0, 0, 49, 83, 83, 84, 148, 148, 0, 0, 1, 84, 80, 0, 135, 83, 0, 0, 84, 0, 0, 0, 25, 70, 81, 56, 25, 69, 81, 48, 25, 68, 81, 40, 25, 67, 81, 32, 25, 72, 81, 24, 25, 71, 81, 16, 0, 66, 81, 0, 0, 56, 0, 0, 0, 63, 1, 0, 0, 64, 2, 0, 0, 65, 3, 0, 0, 6, 4, 0, 0, 7, 5, 0, 1, 9, 0, 0, 1, 83, 140, 23, 78, 10, 83, 0, 38, 83, 10, 1, 0, 11, 83, 0, 121, 11, 2, 0, 1, 7, 120, 0, 0, 12, 64, 0, 134, 83, 0, 0, 8, 27, 1, 0, 12, 0, 0, 0, 0, 13, 65, 0, 41, 83, 13, 16, 42, 83, 83, 16, 33, 14, 83, 0, 121, 14, 7, 0, 0, 15, 56, 0, 0, 16, 63, 0, 1, 84, 208, 7, 134, 83, 0, 0, 80, 254, 0, 0, 15, 16, 84, 0, 0, 17, 56, 0, 0, 18, 63, 0, 0, 19, 6, 0, 0, 20, 65, 0, 134, 21, 0, 0, 80, 17, 1, 0, 17, 18, 19, 20, 0, 8, 21, 0, 0, 22, 9, 0, 25, 83, 22, 1, 41, 83, 83, 24, 42, 83, 83, 24, 0, 23, 83, 0, 0, 9, 23, 0, 0, 24, 8, 0, 19, 83, 24, 82, 0, 25, 83, 0, 32, 26, 25, 2, 121, 26, 7, 0, 134, 83, 0, 0, 184, 29, 1, 0, 1, 84, 232, 3, 134, 83, 0, 0, 48, 10, 1, 0, 84, 0, 0, 0, 0, 27, 8, 0, 19, 83, 27, 82, 0, 28, 83, 0, 32, 29, 28, 2, 120, 29, 2, 0, 119, 0, 10, 0, 0, 30, 9, 0, 19, 83, 30, 82, 0, 31, 83, 0, 0, 32, 7, 0, 19, 83, 32, 82, 0, 33, 83, 0, 15, 34, 31, 33, 120, 34, 218, 255, 119, 0, 1, 0, 0, 35, 8, 0, 19, 83, 35, 82, 0, 36, 83, 0, 33, 37, 36, 0, 120, 37, 4, 0, 0, 62, 8, 0, 137, 81, 0, 0, 139, 62, 0, 0, 0, 38, 8, 0, 19, 83, 38, 82, 0, 39, 83, 0, 1, 83, 1, 0, 1, 84, 127, 0, 138, 39, 83, 84, 28, 152, 0, 0, 96, 152, 0, 0, 136, 152, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 176, 152, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 244, 151, 0, 0, 216, 152, 0, 0, 0, 52, 56, 0, 0, 53, 63, 0, 85, 69, 52, 0, 25, 78, 69, 4, 85, 78, 53, 0, 1, 84, 200, 5, 134, 83, 0, 0, 24, 18, 1, 0, 84, 69, 0, 0, 119, 0, 58, 0, 0, 40, 56, 0, 0, 41, 63, 0, 0, 42, 6, 0, 2, 83, 0, 0, 255, 255, 0, 0, 19, 83, 42, 83, 0, 43, 83, 0, 85, 66, 40, 0, 25, 73, 66, 4, 85, 73, 41, 0, 25, 77, 66, 8, 85, 77, 43, 0, 1, 84, 192, 4, 134, 83, 0, 0, 24, 18, 1, 0, 84, 66, 0, 0, 119, 0, 41, 0, 0, 44, 56, 0, 0, 45, 63, 0, 85, 71, 44, 0, 25, 79, 71, 4, 85, 79, 45, 0, 1, 84, 251, 4, 134, 83, 0, 0, 24, 18, 1, 0, 84, 71, 0, 0, 119, 0, 31, 0, 0, 46, 56, 0, 0, 47, 63, 0, 85, 72, 46, 0, 25, 74, 72, 4, 85, 74, 47, 0, 1, 84, 44, 5, 134, 83, 0, 0, 24, 18, 1, 0, 84, 72, 0, 0, 119, 0, 21, 0, 0, 48, 56, 0, 0, 49, 63, 0, 85, 67, 48, 0, 25, 75, 67, 4, 85, 75, 49, 0, 1, 84, 94, 5, 134, 83, 0, 0, 24, 18, 1, 0, 84, 67, 0, 0, 119, 0, 11, 0, 0, 50, 56, 0, 0, 51, 63, 0, 85, 68, 50, 0, 25, 76, 68, 4, 85, 76, 51, 0, 1, 84, 147, 5, 134, 83, 0, 0, 24, 18, 1, 0, 84, 68, 0, 0, 119, 0, 1, 0, 0, 54, 9, 0, 19, 83, 54, 82, 0, 55, 83, 0, 0, 57, 7, 0, 19, 83, 57, 82, 0, 58, 83, 0, 17, 59, 58, 55, 120, 59, 4, 0, 0, 62, 8, 0, 137, 81, 0, 0, 139, 62, 0, 0, 0, 60, 9, 0, 19, 83, 60, 82, 0, 61, 83, 0, 85, 70, 61, 0, 1, 84, 15, 6, 134, 83, 0, 0, 24, 18, 1, 0, 84, 70, 0, 0, 0, 62, 8, 0, 137, 81, 0, 0, 139, 62, 0, 0, 140, 0, 64, 0, 0, 0, 0, 0, 1, 58, 0, 0, 136, 60, 0, 0, 0, 59, 60, 0, 136, 60, 0, 0, 25, 60, 60, 96, 137, 60, 0, 0, 130, 60, 0, 0, 136, 61, 0, 0, 49, 60, 60, 61, 148, 153, 0, 0, 1, 61, 96, 0, 135, 60, 0, 0, 61, 0, 0, 0, 25, 57, 59, 40, 25, 56, 59, 32, 25, 55, 59, 24, 25, 54, 59, 16, 25, 53, 59, 8, 0, 52, 59, 0, 25, 23, 59, 76, 25, 48, 59, 48, 134, 60, 0, 0, 76, 32, 1, 0, 1, 61, 26, 11, 134, 60, 0, 0, 232, 20, 1, 0, 61, 0, 0, 0, 1, 60, 141, 23, 78, 50, 60, 0, 38, 60, 50, 1, 0, 51, 60, 0, 121, 51, 6, 0, 1, 61, 223, 10, 134, 60, 0, 0, 232, 20, 1, 0, 61, 0, 0, 0, 119, 0, 5, 0, 1, 61, 240, 10, 134, 60, 0, 0, 232, 20, 1, 0, 61, 0, 0, 0, 1, 61, 2, 11, 134, 60, 0, 0, 232, 20, 1, 0, 61, 0, 0, 0, 1, 61, 183, 10, 134, 60, 0, 0, 232, 20, 1, 0, 61, 0, 0, 0, 1, 61, 199, 10, 134, 60, 0, 0, 232, 20, 1, 0, 61, 0, 0, 0, 1, 61, 211, 10, 134, 60, 0, 0, 232, 20, 1, 0, 61, 0, 0, 0, 1, 61, 5, 11, 134, 60, 0, 0, 232, 20, 1, 0, 61, 0, 0, 0, 1, 61, 36, 11, 134, 60, 0, 0, 232, 20, 1, 0, 61, 0, 0, 0, 1, 1, 0, 0, 1, 12, 1, 0, 1, 60, 80, 0, 82, 60, 60, 0, 85, 23, 60, 0, 1, 34, 1, 0, 1, 45, 1, 0, 1, 60, 84, 0, 82, 60, 60, 0, 85, 48, 60, 0, 1, 61, 84, 0, 106, 61, 61, 4, 109, 48, 4, 61, 1, 60, 84, 0, 106, 60, 60, 8, 109, 48, 8, 60, 1, 61, 84, 0, 106, 61, 61, 12, 109, 48, 12, 61, 1, 60, 84, 0, 106, 60, 60, 16, 109, 48, 16, 60, 1, 61, 84, 0, 106, 61, 61, 20, 109, 48, 20, 61, 1, 49, 6, 0, 134, 61, 0, 0, 28, 16, 1, 0, 1, 60, 244, 1, 134, 61, 0, 0, 48, 10, 1, 0, 60, 0, 0, 0, 1, 60, 54, 11, 134, 61, 0, 0, 232, 20, 1, 0, 60, 0, 0, 0, 134, 61, 0, 0, 128, 32, 1, 0, 1, 60, 19, 11, 134, 61, 0, 0, 232, 20, 1, 0, 60, 0, 0, 0, 1, 60, 200, 0, 134, 61, 0, 0, 48, 10, 1, 0, 60, 0, 0, 0, 1, 60, 3, 1, 1, 62, 194, 1, 61, 63, 0, 0, 219, 15, 201, 191, 134, 61, 0, 0, 124, 9, 1, 0, 60, 62, 63, 0, 134, 61, 0, 0, 208, 31, 1, 0, 134, 61, 0, 0, 28, 32, 1, 0, 134, 61, 0, 0, 148, 22, 1, 0, 1, 63, 244, 1, 134, 61, 0, 0, 48, 10, 1, 0, 63, 0, 0, 0, 1, 63, 0, 0, 134, 61, 0, 0, 136, 23, 1, 0, 63, 0, 0, 0, 1, 63, 5, 0, 134, 61, 0, 0, 148, 12, 1, 0, 63, 0, 0, 0, 1, 63, 20, 0, 134, 61, 0, 0, 148, 12, 1, 0, 63, 0, 0, 0, 1, 63, 59, 11, 134, 61, 0, 0, 24, 18, 1, 0, 63, 52, 0, 0, 0, 2, 34, 0, 0, 0, 2, 0, 0, 3, 1, 0, 25, 4, 3, 1, 0, 1, 4, 0, 0, 5, 1, 0, 1, 61, 50, 0, 15, 6, 61, 5, 121, 6, 3, 0, 1, 58, 6, 0, 119, 0, 26, 0, 0, 7, 0, 0, 25, 8, 7, 1, 0, 0, 8, 0, 0, 9, 0, 0, 0, 10, 34, 0, 17, 11, 10, 9, 121, 11, 6, 0, 1, 0, 0, 0, 1, 63, 103, 11, 134, 61, 0, 0, 24, 18, 1, 0, 63, 54, 0, 0, 0, 13, 0, 0, 41, 61, 13, 2, 3, 14, 23, 61, 82, 15, 14, 0, 134, 61, 0, 0, 192, 180, 0, 0, 15, 0, 0, 0, 1, 61, 9, 0, 78, 16, 61, 0, 38, 61, 16, 1, 0, 17, 61, 0, 121, 17, 224, 255, 119, 0, 1, 0, 32, 61, 58, 6, 121, 61, 5, 0, 1, 63, 75, 11, 134, 61, 0, 0, 24, 18, 1, 0, 63, 53, 0, 0, 1, 63, 125, 11, 134, 61, 0, 0, 24, 18, 1, 0, 63, 55, 0, 0, 0, 18, 45, 0, 38, 61, 18, 1, 0, 19, 61, 0, 120, 19, 5, 0, 134, 61, 0, 0, 236, 13, 1, 0, 137, 59, 0, 0, 139, 0, 0, 0, 1, 1, 0, 0, 0, 20, 49, 0, 0, 0, 20, 0, 0, 21, 1, 0, 25, 22, 21, 1, 0, 1, 22, 0, 0, 24, 1, 0, 1, 61, 50, 0, 15, 25, 61, 24, 120, 25, 57, 0, 0, 26, 0, 0, 25, 27, 26, 1, 0, 0, 27, 0, 0, 28, 0, 0, 0, 29, 49, 0, 17, 30, 29, 28, 121, 30, 6, 0, 1, 0, 0, 0, 1, 63, 141, 11, 134, 61, 0, 0, 24, 18, 1, 0, 63, 57, 0, 0, 0, 31, 0, 0, 41, 61, 31, 2, 3, 32, 48, 61, 82, 33, 32, 0, 134, 61, 0, 0, 192, 180, 0, 0, 33, 0, 0, 0, 1, 61, 9, 0, 78, 35, 61, 0, 38, 61, 35, 1, 0, 36, 61, 0, 120, 36, 2, 0, 119, 0, 225, 255, 1, 61, 8, 0, 78, 37, 61, 0, 38, 61, 37, 1, 0, 38, 61, 0, 120, 38, 2, 0, 119, 0, 219, 255, 1, 61, 72, 0, 78, 39, 61, 0, 38, 61, 39, 1, 0, 40, 61, 0, 120, 40, 2, 0, 119, 0, 213, 255, 1, 61, 73, 0, 78, 41, 61, 0, 38, 61, 41, 1, 0, 42, 61, 0, 120, 42, 2, 0, 119, 0, 207, 255, 1, 61, 74, 0, 78, 43, 61, 0, 38, 61, 43, 1, 0, 44, 61, 0, 120, 44, 2, 0, 119, 0, 201, 255, 1, 61, 75, 0, 78, 46, 61, 0, 38, 61, 46, 1, 0, 47, 61, 0, 121, 47, 196, 255, 1, 58, 22, 0, 119, 0, 1, 0, 32, 61, 58, 22, 121, 61, 5, 0, 134, 61, 0, 0, 236, 13, 1, 0, 137, 59, 0, 0, 139, 0, 0, 0, 1, 63, 75, 11, 134, 61, 0, 0, 24, 18, 1, 0, 63, 56, 0, 0, 134, 61, 0, 0, 236, 13, 1, 0, 137, 59, 0, 0, 139, 0, 0, 0, 140, 0, 84, 0, 0, 0, 0, 0, 2, 74, 0, 0, 244, 1, 0, 0, 2, 75, 0, 0, 141, 23, 0, 0, 2, 76, 0, 0, 44, 1, 0, 0, 2, 77, 0, 0, 255, 0, 0, 0, 2, 78, 0, 0, 208, 7, 0, 0, 1, 72, 0, 0, 136, 79, 0, 0, 0, 73, 79, 0, 136, 79, 0, 0, 25, 79, 79, 48, 137, 79, 0, 0, 130, 79, 0, 0, 136, 80, 0, 0, 49, 79, 79, 80, 28, 158, 0, 0, 1, 80, 48, 0, 135, 79, 0, 0, 80, 0, 0, 0, 25, 71, 73, 8, 0, 70, 73, 0, 25, 12, 73, 24, 25, 34, 73, 16, 1, 80, 96, 0, 134, 79, 0, 0, 156, 93, 0, 0, 12, 80, 0, 0, 1, 80, 244, 11, 134, 79, 0, 0, 24, 18, 1, 0, 80, 70, 0, 0, 1, 79, 8, 0, 78, 67, 79, 0, 38, 79, 67, 1, 0, 68, 79, 0, 120, 68, 5, 0, 1, 0, 14, 0, 0, 66, 0, 0, 137, 73, 0, 0, 139, 66, 0, 0, 1, 79, 72, 0, 78, 69, 79, 0, 38, 79, 69, 1, 0, 2, 79, 0, 121, 2, 5, 0, 1, 0, 12, 0, 0, 66, 0, 0, 137, 73, 0, 0, 139, 66, 0, 0, 1, 79, 4, 25, 82, 3, 79, 0, 25, 4, 3, 1, 1, 79, 4, 25, 85, 79, 4, 0, 1, 23, 2, 0, 1, 79, 108, 0, 82, 79, 79, 0, 85, 34, 79, 0, 1, 80, 108, 0, 106, 80, 80, 4, 109, 34, 4, 80, 1, 45, 0, 0, 0, 5, 45, 0, 19, 80, 5, 77, 0, 6, 80, 0, 34, 7, 6, 2, 120, 7, 3, 0, 1, 72, 18, 0, 119, 0, 187, 0, 0, 8, 45, 0, 19, 80, 8, 77, 0, 9, 80, 0, 32, 10, 9, 0, 121, 10, 12, 0, 1, 80, 96, 0, 1, 79, 100, 0, 1, 81, 1, 0, 1, 82, 32, 78, 1, 83, 7, 0, 134, 11, 0, 0, 0, 0, 0, 0, 80, 79, 81, 82, 83, 0, 0, 0, 0, 1, 11, 0, 119, 0, 20, 0, 82, 13, 12, 0, 0, 14, 45, 0, 19, 83, 14, 77, 0, 15, 83, 0, 41, 83, 15, 2, 3, 16, 34, 83, 82, 17, 16, 0, 3, 18, 13, 17, 25, 19, 12, 4, 82, 20, 19, 0, 1, 83, 100, 0, 1, 82, 0, 0, 1, 81, 112, 23, 1, 79, 7, 0, 134, 21, 0, 0, 80, 148, 0, 0, 18, 20, 83, 82, 81, 79, 0, 0, 0, 1, 21, 0, 0, 22, 1, 0, 41, 79, 22, 24, 42, 79, 79, 24, 33, 24, 79, 0, 121, 24, 3, 0, 1, 72, 11, 0, 119, 0, 145, 0, 134, 26, 0, 0, 148, 15, 1, 0, 134, 27, 0, 0, 80, 254, 0, 0, 26, 78, 78, 0, 0, 1, 27, 0, 0, 28, 1, 0, 41, 79, 28, 24, 42, 79, 79, 24, 33, 29, 79, 0, 121, 29, 3, 0, 1, 72, 13, 0, 119, 0, 132, 0, 78, 31, 75, 0, 38, 79, 31, 1, 0, 32, 79, 0, 1, 79, 44, 0, 1, 81, 126, 0, 125, 33, 32, 79, 81, 0, 0, 0, 1, 79, 0, 0, 1, 82, 1, 0, 134, 81, 0, 0, 56, 191, 0, 0, 33, 79, 82, 0, 1, 82, 8, 12, 134, 81, 0, 0, 24, 18, 1, 0, 82, 71, 0, 0 ], eb + 30720);
 HEAPU8.set([ 1, 82, 0, 0, 134, 81, 0, 0, 24, 15, 1, 0, 82, 0, 0, 0, 82, 35, 12, 0, 0, 36, 45, 0, 19, 81, 36, 77, 0, 37, 81, 0, 41, 81, 37, 2, 3, 38, 34, 81, 82, 39, 38, 0, 3, 40, 35, 39, 1, 81, 100, 0, 1, 82, 50, 0, 1, 79, 0, 0, 1, 83, 10, 0, 134, 41, 0, 0, 80, 148, 0, 0, 40, 81, 82, 79, 78, 83, 0, 0, 0, 1, 41, 0, 1, 56, 0, 0, 0, 42, 56, 0, 19, 83, 42, 77, 0, 43, 83, 0, 34, 44, 43, 3, 120, 44, 2, 0, 119, 0, 56, 0, 134, 83, 0, 0, 48, 10, 1, 0, 76, 0, 0, 0, 78, 46, 75, 0, 38, 83, 46, 1, 0, 47, 83, 0, 1, 83, 126, 0, 1, 79, 44, 0, 125, 48, 47, 83, 79, 0, 0, 0, 1, 83, 0, 0, 1, 82, 1, 0, 134, 79, 0, 0, 56, 191, 0, 0, 48, 83, 82, 0, 134, 79, 0, 0, 48, 10, 1, 0, 74, 0, 0, 0, 1, 82, 80, 0, 1, 83, 0, 0, 1, 81, 1, 0, 134, 79, 0, 0, 32, 194, 0, 0, 82, 83, 81, 0, 134, 79, 0, 0, 48, 10, 1, 0, 76, 0, 0, 0, 78, 49, 75, 0, 38, 79, 49, 1, 0, 50, 79, 0, 1, 79, 44, 0, 1, 81, 126, 0, 125, 51, 50, 79, 81, 0, 0, 0, 1, 79, 0, 0, 1, 83, 1, 0, 134, 81, 0, 0, 56, 191, 0, 0, 51, 79, 83, 0, 134, 81, 0, 0, 48, 10, 1, 0, 74, 0, 0, 0, 1, 83, 126, 0, 1, 79, 0, 0, 1, 82, 1, 0, 134, 81, 0, 0, 32, 194, 0, 0, 83, 79, 82, 0, 0, 52, 56, 0, 25, 81, 52, 1, 41, 81, 81, 24, 42, 81, 81, 24, 0, 53, 81, 0, 0, 56, 53, 0, 119, 0, 196, 255, 134, 81, 0, 0, 48, 10, 1, 0, 74, 0, 0, 0, 82, 54, 12, 0, 0, 55, 45, 0, 19, 81, 55, 77, 0, 57, 81, 0, 41, 81, 57, 2, 3, 58, 34, 81, 82, 59, 58, 0, 3, 60, 54, 59, 25, 61, 12, 4, 82, 62, 61, 0, 1, 81, 100, 0, 1, 82, 1, 0, 1, 79, 10, 0, 134, 63, 0, 0, 80, 148, 0, 0, 60, 62, 81, 82, 78, 79, 0, 0, 0, 1, 63, 0, 1, 82, 1, 0, 134, 79, 0, 0, 24, 15, 1, 0, 82, 0, 0, 0, 0, 64, 45, 0, 25, 79, 64, 1, 41, 79, 79, 24, 42, 79, 79, 24, 0, 65, 79, 0, 0, 45, 65, 0, 119, 0, 64, 255, 32, 79, 72, 11, 121, 79, 7, 0, 0, 25, 1, 0, 0, 0, 25, 0, 0, 66, 0, 0, 137, 73, 0, 0, 139, 66, 0, 0, 119, 0, 22, 0, 32, 79, 72, 13, 121, 79, 7, 0, 0, 30, 1, 0, 0, 0, 30, 0, 0, 66, 0, 0, 137, 73, 0, 0, 139, 66, 0, 0, 119, 0, 14, 0, 32, 79, 72, 18, 121, 79, 12, 0, 1, 82, 20, 0, 134, 79, 0, 0, 148, 12, 1, 0, 82, 0, 0, 0, 1, 79, 72, 0, 1, 82, 1, 0, 83, 79, 82, 0, 1, 0, 0, 0, 0, 66, 0, 0, 137, 73, 0, 0, 139, 66, 0, 0, 1, 82, 0, 0, 139, 82, 0, 0, 140, 3, 64, 0, 0, 0, 0, 0, 2, 59, 0, 0, 128, 128, 128, 128, 2, 60, 0, 0, 255, 254, 254, 254, 2, 61, 0, 0, 255, 0, 0, 0, 1, 57, 0, 0, 136, 62, 0, 0, 0, 58, 62, 0, 19, 62, 1, 61, 0, 38, 62, 0, 0, 49, 0, 0, 38, 62, 49, 3, 0, 50, 62, 0, 33, 51, 50, 0, 33, 52, 2, 0, 19, 62, 52, 51, 0, 56, 62, 0, 121, 56, 34, 0, 19, 62, 1, 61, 0, 53, 62, 0, 0, 6, 0, 0, 0, 9, 2, 0, 78, 54, 6, 0, 41, 62, 54, 24, 42, 62, 62, 24, 41, 63, 53, 24, 42, 63, 63, 24, 13, 18, 62, 63, 121, 18, 5, 0, 0, 5, 6, 0, 0, 8, 9, 0, 1, 57, 6, 0, 119, 0, 23, 0, 25, 19, 6, 1, 26, 20, 9, 1, 0, 21, 19, 0, 38, 63, 21, 3, 0, 22, 63, 0, 33, 23, 22, 0, 33, 24, 20, 0, 19, 63, 24, 23, 0, 55, 63, 0, 121, 55, 4, 0, 0, 6, 19, 0, 0, 9, 20, 0, 119, 0, 233, 255, 0, 4, 19, 0, 0, 7, 20, 0, 0, 17, 24, 0, 1, 57, 5, 0, 119, 0, 5, 0, 0, 4, 0, 0, 0, 7, 2, 0, 0, 17, 52, 0, 1, 57, 5, 0, 32, 63, 57, 5, 121, 63, 8, 0, 121, 17, 5, 0, 0, 5, 4, 0, 0, 8, 7, 0, 1, 57, 6, 0, 119, 0, 3, 0, 0, 14, 4, 0, 1, 16, 0, 0, 32, 63, 57, 6, 121, 63, 83, 0, 78, 25, 5, 0, 19, 63, 1, 61, 0, 26, 63, 0, 41, 63, 25, 24, 42, 63, 63, 24, 41, 62, 26, 24, 42, 62, 62, 24, 13, 27, 63, 62, 121, 27, 4, 0, 0, 14, 5, 0, 0, 16, 8, 0, 119, 0, 71, 0, 2, 62, 0, 0, 1, 1, 1, 1, 5, 28, 38, 62, 1, 62, 3, 0, 16, 29, 62, 8, 121, 29, 33, 0, 0, 10, 5, 0, 0, 12, 8, 0, 82, 30, 10, 0, 21, 62, 30, 28, 0, 31, 62, 0, 2, 62, 0, 0, 1, 1, 1, 1, 4, 32, 31, 62, 19, 62, 31, 59, 0, 33, 62, 0, 21, 62, 33, 59, 0, 34, 62, 0, 19, 62, 34, 32, 0, 35, 62, 0, 32, 36, 35, 0, 120, 36, 2, 0, 119, 0, 13, 0, 25, 37, 10, 4, 26, 39, 12, 4, 1, 62, 3, 0, 16, 40, 62, 39, 121, 40, 4, 0, 0, 10, 37, 0, 0, 12, 39, 0, 119, 0, 234, 255, 0, 3, 37, 0, 0, 11, 39, 0, 1, 57, 11, 0, 119, 0, 7, 0, 0, 13, 10, 0, 0, 15, 12, 0, 119, 0, 4, 0, 0, 3, 5, 0, 0, 11, 8, 0, 1, 57, 11, 0, 32, 62, 57, 11, 121, 62, 8, 0, 32, 41, 11, 0, 121, 41, 4, 0, 0, 14, 3, 0, 1, 16, 0, 0, 119, 0, 23, 0, 0, 13, 3, 0, 0, 15, 11, 0, 78, 42, 13, 0, 41, 62, 42, 24, 42, 62, 62, 24, 41, 63, 26, 24, 42, 63, 63, 24, 13, 43, 62, 63, 121, 43, 4, 0, 0, 14, 13, 0, 0, 16, 15, 0, 119, 0, 11, 0, 25, 44, 13, 1, 26, 45, 15, 1, 32, 46, 45, 0, 121, 46, 4, 0, 0, 14, 44, 0, 1, 16, 0, 0, 119, 0, 4, 0, 0, 13, 44, 0, 0, 15, 45, 0, 119, 0, 237, 255, 33, 47, 16, 0, 1, 63, 0, 0, 125, 48, 47, 14, 63, 0, 0, 0, 139, 48, 0, 0, 140, 0, 48, 0, 0, 0, 0, 0, 2, 43, 0, 0, 255, 0, 0, 0, 1, 41, 0, 0, 136, 44, 0, 0, 0, 42, 44, 0, 136, 44, 0, 0, 25, 44, 44, 80, 137, 44, 0, 0, 130, 44, 0, 0, 136, 45, 0, 0, 49, 44, 44, 45, 252, 164, 0, 0, 1, 45, 80, 0, 135, 44, 0, 0, 45, 0, 0, 0, 25, 36, 42, 56, 25, 35, 42, 48, 25, 40, 42, 40, 25, 39, 42, 32, 25, 38, 42, 24, 25, 37, 42, 16, 25, 34, 42, 8, 0, 33, 42, 0, 25, 12, 42, 68, 1, 45, 15, 10, 134, 44, 0, 0, 24, 18, 1, 0, 45, 33, 0, 0, 1, 45, 26, 10, 134, 44, 0, 0, 24, 18, 1, 0, 45, 34, 0, 0, 1, 45, 38, 10, 134, 44, 0, 0, 24, 18, 1, 0, 45, 37, 0, 0, 1, 45, 15, 10, 134, 44, 0, 0, 24, 18, 1, 0, 45, 38, 0, 0, 134, 44, 0, 0, 76, 32, 1, 0, 1, 45, 254, 9, 134, 44, 0, 0, 232, 20, 1, 0, 45, 0, 0, 0, 1, 44, 141, 23, 78, 27, 44, 0, 38, 44, 27, 1, 0, 28, 44, 0, 121, 28, 6, 0, 1, 45, 223, 10, 134, 44, 0, 0, 232, 20, 1, 0, 45, 0, 0, 0, 119, 0, 5, 0, 1, 45, 240, 10, 134, 44, 0, 0, 232, 20, 1, 0, 45, 0, 0, 0, 1, 45, 2, 11, 134, 44, 0, 0, 232, 20, 1, 0, 45, 0, 0, 0, 1, 45, 183, 10, 134, 44, 0, 0, 232, 20, 1, 0, 45, 0, 0, 0, 1, 45, 199, 10, 134, 44, 0, 0, 232, 20, 1, 0, 45, 0, 0, 0, 1, 45, 211, 10, 134, 44, 0, 0, 232, 20, 1, 0, 45, 0, 0, 0, 1, 45, 5, 11, 134, 44, 0, 0, 232, 20, 1, 0, 45, 0, 0, 0, 1, 45, 36, 11, 134, 44, 0, 0, 232, 20, 1, 0, 45, 0, 0, 0, 1, 45, 244, 1, 134, 44, 0, 0, 48, 10, 1, 0, 45, 0, 0, 0, 1, 1, 0, 0, 1, 44, 47, 10, 78, 44, 44, 0, 83, 12, 44, 0, 1, 45, 47, 10, 102, 45, 45, 1, 107, 12, 1, 45, 1, 44, 47, 10, 102, 44, 44, 2, 107, 12, 2, 44, 1, 45, 47, 10, 102, 45, 45, 3, 107, 12, 3, 45, 1, 44, 47, 10, 102, 44, 44, 4, 107, 12, 4, 44, 1, 45, 47, 10, 102, 45, 45, 5, 107, 12, 5, 45, 1, 23, 6, 0, 134, 45, 0, 0, 236, 23, 1, 0, 1, 44, 54, 11, 134, 45, 0, 0, 232, 20, 1, 0, 44, 0, 0, 0, 134, 45, 0, 0, 128, 32, 1, 0, 1, 44, 9, 10, 134, 45, 0, 0, 232, 20, 1, 0, 44, 0, 0, 0, 1, 44, 200, 0, 134, 45, 0, 0, 48, 10, 1, 0, 44, 0, 0, 0, 1, 44, 3, 1, 1, 46, 34, 3, 61, 47, 0, 0, 219, 15, 201, 63, 134, 45, 0, 0, 124, 9, 1, 0, 44, 46, 47, 0, 134, 45, 0, 0, 208, 31, 1, 0, 134, 45, 0, 0, 28, 32, 1, 0, 134, 45, 0, 0, 148, 22, 1, 0, 1, 47, 244, 1, 134, 45, 0, 0, 48, 10, 1, 0, 47, 0, 0, 0, 1, 47, 53, 10, 134, 45, 0, 0, 24, 18, 1, 0, 47, 39, 0, 0, 1, 47, 200, 0, 1, 46, 16, 39, 134, 45, 0, 0, 88, 253, 0, 0, 47, 46, 0, 0, 0, 29, 23, 0, 19, 45, 29, 43, 0, 30, 45, 0, 0, 0, 30, 0, 0, 31, 1, 0, 25, 32, 31, 1, 0, 1, 32, 0, 0, 2, 1, 0, 1, 45, 50, 0, 15, 3, 45, 2, 121, 3, 3, 0, 1, 41, 6, 0, 119, 0, 59, 0, 0, 4, 0, 0, 25, 45, 4, 1, 41, 45, 45, 24, 42, 45, 45, 24, 0, 5, 45, 0, 0, 0, 5, 0, 0, 6, 0, 0, 19, 45, 6, 43, 0, 7, 45, 0, 0, 8, 23, 0, 17, 9, 8, 7, 121, 9, 6, 0, 1, 0, 0, 0, 1, 46, 103, 11, 134, 45, 0, 0, 24, 18, 1, 0, 46, 35, 0, 0, 0, 10, 0, 0, 19, 45, 10, 43, 0, 11, 45, 0, 3, 13, 12, 11, 78, 14, 13, 0, 19, 45, 14, 43, 0, 15, 45, 0, 134, 45, 0, 0, 36, 207, 0, 0, 15, 0, 0, 0, 1, 45, 12, 0, 78, 16, 45, 0, 38, 45, 16, 1, 0, 17, 45, 0, 120, 17, 2, 0, 119, 0, 215, 255, 1, 45, 13, 0, 78, 18, 45, 0, 38, 45, 18, 1, 0, 19, 45, 0, 120, 19, 2, 0, 119, 0, 209, 255, 1, 45, 14, 0, 78, 20, 45, 0, 38, 45, 20, 1, 0, 21, 45, 0, 120, 21, 2, 0, 119, 0, 203, 255, 1, 45, 15, 0, 78, 22, 45, 0, 38, 45, 22, 1, 0, 24, 45, 0, 120, 24, 2, 0, 119, 0, 197, 255, 1, 45, 205, 27, 78, 25, 45, 0, 38, 45, 25, 1, 0, 26, 45, 0, 121, 26, 192, 255, 1, 41, 14, 0, 119, 0, 1, 0, 32, 45, 41, 6, 121, 45, 10, 0, 1, 46, 75, 11, 134, 45, 0, 0, 24, 18, 1, 0, 46, 40, 0, 0, 134, 45, 0, 0, 236, 13, 1, 0, 137, 42, 0, 0, 139, 0, 0, 0, 119, 0, 11, 0, 32, 45, 41, 14, 121, 45, 9, 0, 1, 46, 80, 10, 134, 45, 0, 0, 24, 18, 1, 0, 46, 36, 0, 0, 134, 45, 0, 0, 236, 13, 1, 0, 137, 42, 0, 0, 139, 0, 0, 0, 139, 0, 0, 0, 140, 3, 69, 0, 0, 0, 0, 0, 2, 66, 0, 0, 146, 0, 0, 0, 1, 64, 0, 0, 136, 67, 0, 0, 0, 65, 67, 0, 136, 67, 0, 0, 25, 67, 67, 48, 137, 67, 0, 0, 130, 67, 0, 0, 136, 68, 0, 0, 49, 67, 67, 68, 208, 168, 0, 0, 1, 68, 48, 0, 135, 67, 0, 0, 68, 0, 0, 0, 25, 59, 65, 16, 0, 58, 65, 0, 25, 30, 65, 32, 25, 41, 0, 28, 82, 52, 41, 0, 85, 30, 52, 0, 25, 54, 30, 4, 25, 55, 0, 20, 82, 56, 55, 0, 4, 57, 56, 52, 85, 54, 57, 0, 25, 10, 30, 8, 85, 10, 1, 0, 25, 11, 30, 12, 85, 11, 2, 0, 3, 12, 57, 2, 25, 13, 0, 60, 82, 14, 13, 0, 0, 15, 30, 0, 85, 58, 14, 0, 25, 60, 58, 4, 85, 60, 15, 0, 25, 61, 58, 8, 1, 67, 2, 0, 85, 61, 67, 0, 135, 16, 4, 0, 66, 58, 0, 0, 134, 17, 0, 0, 20, 25, 1, 0, 16, 0, 0, 0, 13, 18, 12, 17, 121, 18, 3, 0, 1, 64, 3, 0, 119, 0, 69, 0, 1, 4, 2, 0, 0, 5, 12, 0, 0, 6, 30, 0, 0, 26, 17, 0, 34, 25, 26, 0, 120, 25, 44, 0, 4, 35, 5, 26, 25, 36, 6, 4, 82, 37, 36, 0, 16, 38, 37, 26, 25, 39, 6, 8, 125, 9, 38, 39, 6, 0, 0, 0, 41, 67, 38, 31, 42, 67, 67, 31, 0, 40, 67, 0, 3, 8, 40, 4, 1, 67, 0, 0, 125, 42, 38, 37, 67, 0, 0, 0, 4, 3, 26, 42, 82, 43, 9, 0, 3, 44, 43, 3, 85, 9, 44, 0, 25, 45, 9, 4, 82, 46, 45, 0, 4, 47, 46, 3, 85, 45, 47, 0, 82, 48, 13, 0, 0, 49, 9, 0, 85, 59, 48, 0, 25, 62, 59, 4, 85, 62, 49, 0, 25, 63, 59, 8, 85, 63, 8, 0, 135, 50, 4, 0, 66, 59, 0, 0, 134, 51, 0, 0, 20, 25, 1, 0, 50, 0, 0, 0, 13, 53, 35, 51, 121, 53, 3, 0, 1, 64, 3, 0, 119, 0, 25, 0, 0, 4, 8, 0, 0, 5, 35, 0, 0, 6, 9, 0, 0, 26, 51, 0, 119, 0, 212, 255, 25, 27, 0, 16, 1, 67, 0, 0, 85, 27, 67, 0, 1, 67, 0, 0, 85, 41, 67, 0, 1, 67, 0, 0, 85, 55, 67, 0, 82, 28, 0, 0, 39, 67, 28, 32, 0, 29, 67, 0, 85, 0, 29, 0, 32, 31, 4, 2, 121, 31, 3, 0, 1, 7, 0, 0, 119, 0, 5, 0, 25, 32, 6, 4, 82, 33, 32, 0, 4, 34, 2, 33, 0, 7, 34, 0, 32, 67, 64, 3, 121, 67, 11, 0, 25, 19, 0, 44, 82, 20, 19, 0, 25, 21, 0, 48, 82, 22, 21, 0, 3, 23, 20, 22, 25, 24, 0, 16, 85, 24, 23, 0, 85, 41, 20, 0, 85, 55, 20, 0, 0, 7, 2, 0, 137, 65, 0, 0, 139, 7, 0, 0, 140, 3, 77, 0, 0, 0, 0, 0, 1, 74, 0, 0, 136, 76, 0, 0, 0, 75, 76, 0, 82, 29, 0, 0, 2, 76, 0, 0, 34, 237, 251, 106, 3, 40, 29, 76, 25, 51, 0, 8, 82, 62, 51, 0, 134, 68, 0, 0, 84, 28, 1, 0, 62, 40, 0, 0, 25, 69, 0, 12, 82, 70, 69, 0, 134, 9, 0, 0, 84, 28, 1, 0, 70, 40, 0, 0, 25, 10, 0, 16, 82, 11, 10, 0, 134, 12, 0, 0, 84, 28, 1, 0, 11, 40, 0, 0, 43, 76, 1, 2, 0, 13, 76, 0, 16, 14, 68, 13, 121, 14, 114, 0, 41, 76, 68, 2, 0, 15, 76, 0, 4, 16, 1, 15, 16, 17, 9, 16, 16, 18, 12, 16, 19, 76, 17, 18, 0, 71, 76, 0, 121, 71, 104, 0, 20, 76, 12, 9, 0, 19, 76, 0, 38, 76, 19, 3, 0, 20, 76, 0, 32, 21, 20, 0, 121, 21, 96, 0, 43, 76, 9, 2, 0, 22, 76, 0, 43, 76, 12, 2, 0, 23, 76, 0, 1, 4, 0, 0, 0, 5, 68, 0, 43, 76, 5, 1, 0, 24, 76, 0, 3, 25, 4, 24, 41, 76, 25, 1, 0, 26, 76, 0, 3, 27, 26, 22, 41, 76, 27, 2, 3, 28, 0, 76, 82, 30, 28, 0, 134, 31, 0, 0, 84, 28, 1, 0, 30, 40, 0, 0, 25, 32, 27, 1, 41, 76, 32, 2, 3, 33, 0, 76, 82, 34, 33, 0, 134, 35, 0, 0, 84, 28, 1, 0, 34, 40, 0, 0, 16, 36, 35, 1, 4, 37, 1, 35, 16, 38, 31, 37, 19, 76, 36, 38, 0, 72, 76, 0, 120, 72, 3, 0, 1, 8, 0, 0, 119, 0, 68, 0, 3, 39, 35, 31, 3, 41, 0, 39, 78, 42, 41, 0, 41, 76, 42, 24, 42, 76, 76, 24, 32, 43, 76, 0, 120, 43, 3, 0, 1, 8, 0, 0, 119, 0, 59, 0, 3, 44, 0, 35, 134, 45, 0, 0, 248, 255, 0, 0, 2, 44, 0, 0, 32, 46, 45, 0, 120, 46, 14, 0, 32, 65, 5, 1, 34, 66, 45, 0, 4, 67, 5, 24, 125, 7, 66, 24, 67, 0, 0, 0, 125, 6, 66, 4, 25, 0, 0, 0, 121, 65, 3, 0, 1, 8, 0, 0, 119, 0, 43, 0, 0, 4, 6, 0, 0, 5, 7, 0, 119, 0, 202, 255, 3, 47, 26, 23, 41, 76, 47, 2, 3, 48, 0, 76, 82, 49, 48, 0, 134, 50, 0, 0, 84, 28, 1, 0, 49, 40, 0, 0, 25, 52, 47, 1, 41, 76, 52, 2, 3, 53, 0, 76, 82, 54, 53, 0, 134, 55, 0, 0, 84, 28, 1, 0, 54, 40, 0, 0, 16, 56, 55, 1, 4, 57, 1, 55, 16, 58, 50, 57, 19, 76, 56, 58, 0, 73, 76, 0, 121, 73, 13, 0, 3, 59, 0, 55, 3, 60, 55, 50, 3, 61, 0, 60, 78, 63, 61, 0, 41, 76, 63, 24, 42, 76, 76, 24, 32, 64, 76, 0, 1, 76, 0, 0, 125, 3, 64, 59, 76, 0, 0, 0, 0, 8, 3, 0, 119, 0, 8, 0, 1, 8, 0, 0, 119, 0, 6, 0, 1, 8, 0, 0, 119, 0, 4, 0, 1, 8, 0, 0, 119, 0, 2, 0, 1, 8, 0, 0, 139, 8, 0, 0, 140, 2, 55, 0, 0, 0, 0, 0, 2, 52, 0, 0, 128, 128, 128, 128, 2, 53, 0, 0, 255, 254, 254, 254, 1, 50, 0, 0, 136, 54, 0, 0, 0, 51, 54, 0, 0, 25, 1, 0, 0, 36, 0, 0, 21, 54, 25, 36, 0, 44, 54, 0, 38, 54, 44, 3, 0, 45, 54, 0, 32, 46, 45, 0, 121, 46, 74, 0, 38, 54, 25, 3, 0, 47, 54, 0, 32, 48, 47, 0, 121, 48, 4, 0, 0, 5, 1, 0, 0, 7, 0, 0, 119, 0, 24, 0, 0, 6, 1, 0, 0, 8, 0, 0, 78, 49, 6, 0, 83, 8, 49, 0, 41, 54, 49, 24, 42, 54, 54, 24, 32, 15, 54, 0, 121, 15, 3, 0, 0, 9, 8, 0, 119, 0, 60, 0, 25, 16, 6, 1, 25, 17, 8, 1, 0, 18, 16, 0, 38, 54, 18, 3, 0, 19, 54, 0, 32, 20, 19, 0, 121, 20, 4, 0, 0, 5, 16, 0, 0, 7, 17, 0, 119, 0, 4, 0, 0, 6, 16, 0, 0, 8, 17, 0, 119, 0, 236, 255, 82, 21, 5, 0, 2, 54, 0, 0, 1, 1, 1, 1, 4, 22, 21, 54, 19, 54, 21, 52, 0, 23, 54, 0, 21, 54, 23, 52, 0, 24, 54, 0, 19, 54, 24, 22, 0, 26, 54, 0, 32, 27, 26, 0, 121, 27, 26, 0, 0, 4, 7, 0, 0, 10, 5, 0, 0, 30, 21, 0, 25, 28, 10, 4, 25, 29, 4, 4, 85, 4, 30, 0, 82, 31, 28, 0, 2, 54, 0, 0, 1, 1, 1, 1, 4, 32, 31, 54, 19, 54, 31, 52, 0, 33, 54, 0, 21, 54, 33, 52, 0, 34, 54, 0, 19, 54, 34, 32, 0, 35, 54, 0, 32, 37, 35, 0, 121, 37, 5, 0, 0, 4, 29, 0, 0, 10, 28, 0, 0, 30, 31, 0, 119, 0, 238, 255, 0, 2, 28, 0, 0, 3, 29, 0, 119, 0, 3, 0, 0, 2, 5, 0, 0, 3, 7, 0, 0, 11, 2, 0, 0, 12, 3, 0, 1, 50, 8, 0, 119, 0, 4, 0, 0, 11, 1, 0, 0, 12, 0, 0, 1, 50, 8, 0, 32, 54, 50, 8, 121, 54, 24, 0, 78, 38, 11, 0, 83, 12, 38, 0, 41, 54, 38, 24, 42, 54, 54, 24, 32, 39, 54, 0, 121, 39, 3, 0, 0, 9, 12, 0, 119, 0, 16, 0, 0, 13, 12, 0, 0, 14, 11, 0, 25, 40, 14, 1, 25, 41, 13, 1, 78, 42, 40, 0, 83, 41, 42, 0, 41, 54, 42, 24, 42, 54, 54, 24, 32, 43, 54, 0, 121, 43, 3, 0, 0, 9, 41, 0, 119, 0, 4, 0, 0, 13, 41, 0, 0, 14, 40, 0, 119, 0, 244, 255, 139, 9, 0, 0, 140, 3, 65, 0, 0, 0, 0, 0, 2, 62, 0, 0, 255, 0, 0, 0, 2, 63, 0, 0, 128, 0, 0, 0, 1, 60, 0, 0, 136, 64, 0, 0, 0, 61, 64, 0, 1, 64, 0, 0, 13, 24, 0, 64, 121, 24, 3, 0, 1, 3, 1, 0, 119, 0, 146, 0, 35, 35, 1, 128, 121, 35, 6, 0, 19, 64, 1, 62, 0, 46, 64, 0, 83, 0, 46, 0, 1, 3, 1, 0, 119, 0, 139, 0, 134, 54, 0, 0, 4, 30, 1, 0, 1, 64, 188, 0, 3, 55, 54, 64, 82, 56, 55, 0, 82, 57, 56, 0, 1, 64, 0, 0, 13, 58, 57, 64, 121, 58, 18, 0, 38, 64, 1, 128, 0, 4, 64, 0, 2, 64, 0, 0, 128, 223, 0, 0, 13, 5, 4, 64, 121, 5, 6, 0, 19, 64, 1, 62, 0, 7, 64, 0, 83, 0, 7, 0, 1, 3, 1, 0, 119, 0, 119, 0, 134, 6, 0, 0, 232, 28, 1, 0, 1, 64, 84, 0, 85, 6, 64, 0, 1, 3, 255, 255, 119, 0, 113, 0, 1, 64, 0, 8, 16, 8, 1, 64, 121, 8, 19, 0, 43, 64, 1, 6, 0, 9, 64, 0, 1, 64, 192, 0, 20, 64, 9, 64, 0, 10, 64, 0, 19, 64, 10, 62, 0, 11, 64, 0, 25, 12, 0, 1, 83, 0, 11, 0, 38, 64, 1, 63, 0, 13, 64, 0, 20, 64, 13, 63, 0, 14, 64, 0, 19, 64, 14, 62, 0, 15, 64, 0, 83, 12, 15, 0, 1, 3, 2, 0, 119, 0, 92, 0, 2, 64, 0, 0, 0, 216, 0, 0, 16, 16, 1, 64, 1, 64, 0, 224, 19, 64, 1, 64, 0, 17, 64, 0, 2, 64, 0, 0, 0, 224, 0, 0, 13, 18, 17, 64, 20, 64, 16, 18, 0, 59, 64, 0, 121, 59, 29, 0, 43, 64, 1, 12, 0, 19, 64, 0, 1, 64, 224, 0, 20, 64, 19, 64, 0, 20, 64, 0, 19, 64, 20, 62, 0, 21, 64, 0, 25, 22, 0, 1, 83, 0, 21, 0, 43, 64, 1, 6, 0, 23, 64, 0, 38, 64, 23, 63, 0, 25, 64, 0, 20, 64, 25, 63, 0, 26, 64, 0, 19, 64, 26, 62, 0, 27, 64, 0, 25, 28, 0, 2, 83, 22, 27, 0, 38, 64, 1, 63, 0, 29, 64, 0, 20, 64, 29, 63, 0, 30, 64, 0, 19, 64, 30, 62, 0, 31, 64, 0, 83, 28, 31, 0, 1, 3, 3, 0, 119, 0, 52, 0, 2, 64, 0, 0, 0, 0, 1, 0, 4, 32, 1, 64, 2, 64, 0, 0, 0, 0, 16, 0, 16, 33, 32, 64, 121, 33, 39, 0, 43, 64, 1, 18, 0, 34, 64, 0, 1, 64, 240, 0, 20, 64, 34, 64, 0, 36, 64, 0, 19, 64, 36, 62, 0, 37, 64, 0, 25, 38, 0, 1, 83, 0, 37, 0, 43, 64, 1, 12, 0, 39, 64, 0, 38, 64, 39, 63, 0, 40, 64, 0, 20, 64, 40, 63, 0, 41, 64, 0, 19, 64, 41, 62, 0, 42, 64, 0, 25, 43, 0, 2, 83, 38, 42, 0, 43, 64, 1, 6, 0, 44, 64, 0, 38, 64, 44, 63, 0, 45, 64, 0, 20, 64, 45, 63, 0, 47, 64, 0, 19, 64, 47, 62, 0, 48, 64, 0, 25, 49, 0, 3, 83, 43, 48, 0, 38, 64, 1, 63, 0, 50, 64, 0, 20, 64, 50, 63, 0, 51, 64, 0, 19, 64, 51, 62, 0, 52, 64, 0, 83, 49, 52, 0, 1, 3, 4, 0, 119, 0, 7, 0, 134, 53, 0, 0, 232, 28, 1, 0, 1, 64, 84, 0, 85, 53, 64, 0, 1, 3, 255, 255, 119, 0, 1, 0, 139, 3, 0, 0, 140, 3, 54, 0, 0, 0, 0, 0, 1, 47, 0, 0, 136, 50, 0, 0, 0, 48, 50, 0, 136, 50, 0, 0, 1, 51, 224, 0, 3, 50, 50, 51, 137, 50, 0, 0, 130, 50, 0, 0, 136, 51, 0, 0, 49, 50, 50, 51, 120, 177, 0, 0, 1, 51, 224, 0, 135, 50, 0, 0, 51, 0, 0, 0, 25, 27, 48, 120, 25, 38, 48, 80, 0, 40, 48, 0, 1, 50, 136, 0, 3, 41, 48, 50, 0, 46, 38, 0, 25, 49, 46, 40, 1, 50, 0, 0, 85, 46, 50, 0, 25, 46, 46, 4, 54, 50, 46, 49, 148, 177, 0, 0, 82, 45, 2, 0, 85, 27, 45, 0, 1, 50, 0, 0, 134, 42, 0, 0, 232, 70, 0, 0, 50, 1, 27, 40, 38, 0, 0, 0, 34, 43, 42, 0, 121, 43, 3, 0, 1, 4, 255, 255, 119, 0, 94, 0, 25, 44, 0, 76, 82, 7, 44, 0, 1, 50, 255, 255, 15, 8, 50, 7, 121, 8, 6, 0, 134, 9, 0, 0, 0, 32, 1, 0, 0, 0, 0, 0, 0, 39, 9, 0, 119, 0, 2, 0, 1, 39, 0, 0, 82, 10, 0, 0, 38, 50, 10, 32, 0, 11, 50, 0, 25, 12, 0, 74, 78, 13, 12, 0, 41, 50, 13, 24, 42, 50, 50, 24, 34, 14, 50, 1, 121, 14, 4, 0, 38, 50, 10, 223, 0, 15, 50, 0, 85, 0, 15, 0, 25, 16, 0, 48, 82, 17, 16, 0, 32, 18, 17, 0, 121, 18, 46, 0, 25, 20, 0, 44, 82, 21, 20, 0, 85, 20, 41, 0, 25, 22, 0, 28, 85, 22, 41, 0, 25, 23, 0, 20, 85, 23, 41, 0, 1, 50, 80, 0, 85, 16, 50, 0, 25, 24, 41, 80, 25, 25, 0, 16, 85, 25, 24, 0, 134, 26, 0, 0, 232, 70, 0, 0, 0, 1, 27, 40, 38, 0, 0, 0, 1, 50, 0, 0, 13, 28, 21, 50, 121, 28, 3, 0, 0, 5, 26, 0, 119, 0, 30, 0, 25, 29, 0, 36, 82, 30, 29, 0, 38, 51, 30, 7, 1, 52, 0, 0, 1, 53, 0, 0, 135, 50, 5, 0, 51, 0, 52, 53, 82, 31, 23, 0, 1, 50, 0, 0, 13, 32, 31, 50, 1, 50, 255, 255, 125, 3, 32, 50, 26, 0, 0, 0, 85, 20, 21, 0, 1, 50, 0, 0, 85, 16, 50, 0, 1, 50, 0, 0, 85, 25, 50, 0, 1, 50, 0, 0, 85, 22, 50, 0, 1, 50, 0, 0, 85, 23, 50, 0, 0, 5, 3, 0, 119, 0, 6, 0, 134, 19, 0, 0, 232, 70, 0, 0, 0, 1, 27, 40, 38, 0, 0, 0, 0, 5, 19, 0, 82, 33, 0, 0, 38, 50, 33, 32, 0, 34, 50, 0, 32, 35, 34, 0, 1, 50, 255, 255, 125, 6, 35, 5, 50, 0, 0, 0, 20, 50, 33, 11, 0, 36, 50, 0, 85, 0, 36, 0, 32, 37, 39, 0, 120, 37, 4, 0, 134, 50, 0, 0, 232, 31, 1, 0, 0, 0, 0, 0, 0, 4, 6, 0, 137, 48, 0, 0, 139, 4, 0, 0, 140, 3, 47, 0, 0, 0, 0, 0, 1, 43, 0, 0, 136, 45, 0, 0, 0, 44, 45, 0, 25, 31, 2, 16, 82, 37, 31, 0, 1, 45, 0, 0, 13, 38, 37, 45, 121, 38, 12, 0, 134, 40, 0, 0, 200, 0, 1, 0, 2, 0, 0, 0, 32, 41, 40, 0, 121, 41, 5, 0, 82, 9, 31, 0, 0, 13, 9, 0, 1, 43, 5, 0, 119, 0, 6, 0, 1, 5, 0, 0, 119, 0, 4, 0, 0, 39, 37, 0, 0, 13, 39, 0, 1, 43, 5, 0, 32, 45, 43, 5, 121, 45, 66, 0, 25, 42, 2, 20, 82, 11, 42, 0, 4, 12, 13, 11, 16, 14, 12, 1, 0, 15, 11, 0, 121, 14, 8, 0, 25, 16, 2, 36, 82, 17, 16, 0, 38, 45, 17, 7, 135, 18, 5, 0, 45, 2, 0, 1, 0, 5, 18, 0, 119, 0, 53, 0, 25, 19, 2, 75, 78, 20, 19, 0, 1, 45, 255, 255, 41, 46, 20, 24, 42, 46, 46, 24, 15, 21, 45, 46, 121, 21, 35, 0, 0, 3, 1, 0, 32, 22, 3, 0, 121, 22, 6, 0, 1, 6, 0, 0, 0, 7, 0, 0, 0, 8, 1, 0, 0, 33, 15, 0, 119, 0, 31, 0, 26, 23, 3, 1, 3, 24, 0, 23, 78, 25, 24, 0, 41, 46, 25, 24, 42, 46, 46, 24, 32, 26, 46, 10, 120, 26, 3, 0, 0, 3, 23, 0, 119, 0, 241, 255, 25, 27, 2, 36, 82, 28, 27, 0, 38, 46, 28, 7, 135, 29, 5, 0, 46, 2, 0, 3, 16, 30, 29, 3, 121, 30, 3, 0, 0, 5, 29, 0, 119, 0, 20, 0, 3, 32, 0, 3, 4, 4, 1, 3, 82, 10, 42, 0, 0, 6, 3, 0, 0, 7, 32, 0, 0, 8, 4, 0, 0, 33, 10, 0, 119, 0, 5, 0, 1, 6, 0, 0, 0, 7, 0, 0, 0, 8, 1, 0, 0, 33, 15, 0, 135, 46, 6, 0, 33, 7, 8, 0, 82, 34, 42, 0, 3, 35, 34, 8, 85, 42, 35, 0, 3, 36, 6, 8, 0, 5, 36, 0, 139, 5, 0, 0, 140, 1, 33, 0, 0, 0, 0, 0, 1, 29, 0, 0, 136, 31, 0, 0, 0, 30, 31, 0, 136, 31, 0, 0, 25, 31, 31, 16, 137, 31, 0, 0, 130, 31, 0, 0, 136, 32, 0, 0, 49, 31, 31, 32, 252, 180, 0, 0, 1, 32, 16, 0, 135, 31, 0, 0, 32, 0, 0, 0, 0, 28, 30, 0, 0, 12, 0, 0, 0, 22, 12, 0, 1, 31, 0, 0, 1, 32, 14, 0, 138, 22, 31, 32, 108, 181, 0, 0, 124, 181, 0, 0, 148, 181, 0, 0, 172, 181, 0, 0, 196, 181, 0, 0, 220, 181, 0, 0, 244, 181, 0, 0, 12, 182, 0, 0, 28, 182, 0, 0, 52, 182, 0, 0, 76, 182, 0, 0, 100, 182, 0, 0, 124, 182, 0, 0, 140, 182, 0, 0, 0, 11, 12, 0, 85, 28, 11, 0, 1, 32, 163, 11, 134, 31, 0, 0, 24, 18, 1, 0, 32, 28, 0, 0, 1, 21, 11, 0, 119, 0, 77, 0, 134, 23, 0, 0, 40, 139, 0, 0, 0, 21, 23, 0, 119, 0, 73, 0, 1, 31, 0, 0, 134, 24, 0, 0, 0, 212, 0, 0, 31, 0, 0, 0, 0, 21, 24, 0, 119, 0, 67, 0, 1, 31, 1, 0, 134, 25, 0, 0, 0, 212, 0, 0, 31, 0, 0, 0, 0, 21, 25, 0, 119, 0, 61, 0, 1, 31, 2, 0, 134, 26, 0, 0, 0, 212, 0, 0, 31, 0, 0, 0, 0, 21, 26, 0, 119, 0, 55, 0, 1, 31, 3, 0, 134, 27, 0, 0, 0, 212, 0, 0, 31, 0, 0, 0, 0, 21, 27, 0, 119, 0, 49, 0, 1, 31, 4, 0, 134, 2, 0, 0, 0, 212, 0, 0, 31, 0, 0, 0, 0, 21, 2, 0, 119, 0, 43, 0, 1, 31, 5, 0, 134, 3, 0, 0, 0, 212, 0, 0, 31, 0, 0, 0, 0, 21, 3, 0, 119, 0, 37, 0, 134, 4, 0, 0, 240, 7, 1, 0, 0, 21, 4, 0, 119, 0, 33, 0, 1, 31, 0, 0, 134, 5, 0, 0, 104, 123, 0, 0, 31, 0, 0, 0, 0, 21, 5, 0, 119, 0, 27, 0, 1, 31, 1, 0, 134, 6, 0, 0, 104, 123, 0, 0, 31, 0, 0, 0, 0, 21, 6, 0, 119, 0, 21, 0, 1, 31, 2, 0, 134, 7, 0, 0, 104, 123, 0, 0, 31, 0, 0, 0, 0, 21, 7, 0, 119, 0, 15, 0, 1, 31, 3, 0, 134, 8, 0, 0, 104, 123, 0, 0, 31, 0, 0, 0, 0, 21, 8, 0, 119, 0, 9, 0, 134, 9, 0, 0, 184, 157, 0, 0, 0, 21, 9, 0, 119, 0, 5, 0, 134, 10, 0, 0, 16, 188, 0, 0, 0, 21, 10, 0, 119, 0, 1, 0, 0, 13, 21, 0, 134, 31, 0, 0, 140, 184, 0, 0, 13, 0, 0, 0, 0, 14, 21, 0, 41, 31, 14, 24, 42, 31, 31, 24, 33, 15, 31, 0, 121, 15, 11, 0, 0, 16, 21, 0, 1, 31, 255, 0, 19, 31, 16, 31, 0, 17, 31, 0, 32, 18, 17, 12, 121, 18, 5, 0, 1, 1, 0, 0, 0, 20, 1, 0, 137, 30, 0, 0, 139, 20, 0, 0, 0, 19, 21, 0, 0, 1, 19, 0, 0, 20, 1, 0, 137, 30, 0, 0, 139, 20, 0, 0, 140, 1, 41, 0, 0, 0, 0, 0, 1, 38, 0, 0, 136, 40, 0, 0, 0, 39, 40, 0, 1, 40, 0, 0, 13, 8, 0, 40, 121, 8, 68, 0, 1, 40, 236, 1, 82, 35, 40, 0, 1, 40, 0, 0, 13, 36, 35, 40, 121, 36, 3, 0, 1, 29, 0, 0, 119, 0, 7, 0, 1, 40, 236, 1, 82, 9, 40, 0, 134, 10, 0, 0, 252, 182, 0, 0, 9, 0, 0, 0, 0, 29, 10, 0, 134, 11, 0, 0, 80, 31, 1, 0, 82, 3, 11, 0, 1, 40, 0, 0, 13, 12, 3, 40, 121, 12, 3, 0, 0, 5, 29, 0, 119, 0, 43, 0, 0, 4, 3, 0, 0, 6, 29, 0, 25, 13, 4, 76, 82, 14, 13, 0, 1, 40, 255, 255, 15, 15, 40, 14, 121, 15, 6, 0, 134, 16, 0, 0, 0, 32, 1, 0, 4, 0, 0, 0, 0, 26, 16, 0, 119, 0, 2, 0, 1, 26, 0, 0, 25, 17, 4, 20, 82, 18, 17, 0, 25, 20, 4, 28, 82, 21, 20, 0, 16, 22, 21, 18, 121, 22, 8, 0, 134, 23, 0, 0, 252, 248, 0, 0, 4, 0, 0, 0, 20, 40, 23, 6, 0, 24, 40, 0, 0, 7, 24, 0, 119, 0, 2, 0, 0, 7, 6, 0, 32, 25, 26, 0, 120, 25, 4, 0, 134, 40, 0, 0, 232, 31, 1, 0, 4, 0, 0, 0, 25, 27, 4, 56, 82, 2, 27, 0, 1, 40, 0, 0, 13, 28, 2, 40, 121, 28, 3, 0, 0, 5, 7, 0, 119, 0, 4, 0, 0, 4, 2, 0, 0, 6, 7, 0, 119, 0, 217, 255, 134, 40, 0, 0, 148, 31, 1, 0, 0, 1, 5, 0, 119, 0, 25, 0, 25, 19, 0, 76, 82, 30, 19, 0, 1, 40, 255, 255, 15, 31, 40, 30, 120, 31, 6, 0, 134, 32, 0, 0, 252, 248, 0, 0, 0, 0, 0, 0, 0, 1, 32, 0, 119, 0, 15, 0, 134, 33, 0, 0, 0, 32, 1, 0, 0, 0, 0, 0, 32, 37, 33, 0, 134, 34, 0, 0, 252, 248, 0, 0, 0, 0, 0, 0, 121, 37, 3, 0, 0, 1, 34, 0, 119, 0, 5, 0, 134, 40, 0, 0, 232, 31, 1, 0, 0, 0, 0, 0, 0, 1, 34, 0, 139, 1, 0, 0, 140, 1, 22, 0, 0, 0, 0, 0, 1, 18, 0, 0, 136, 20, 0, 0, 0, 19, 20, 0, 136, 20, 0, 0, 25, 20, 20, 96, 137, 20, 0, 0, 130, 20, 0, 0, 136, 21, 0, 0, 49, 20, 20, 21, 200, 184, 0, 0, 1, 21, 96, 0, 135, 20, 0, 0, 21, 0, 0, 0, 25, 13, 19, 80, 25, 12, 19, 72, 25, 11, 19, 64, 25, 10, 19, 56, 25, 9, 19, 48, 25, 17, 19, 40, 25, 16, 19, 32, 25, 15, 19, 24, 25, 14, 19, 16, 25, 8, 19, 8, 0, 7, 19, 0, 0, 1, 0, 0, 0, 2, 1, 0, 1, 20, 255, 0, 19, 20, 2, 20, 0, 3, 20, 0, 1, 20, 0, 0, 1, 21, 128, 0, 138, 3, 20, 21, 60, 187, 0, 0, 80, 187, 0, 0, 100, 187, 0, 0, 120, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 140, 187, 0, 0, 160, 187, 0, 0, 180, 187, 0, 0, 20, 187, 0, 0, 200, 187, 0, 0, 220, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 20, 187, 0, 0, 240, 187, 0, 0, 0, 4, 1, 0, 1, 20, 255, 0, 19, 20, 4, 20, 0, 5, 20, 0, 85, 13, 5, 0, 1, 21, 138, 3, 134, 20, 0, 0, 24, 18, 1, 0, 21, 13, 0, 0, 119, 0, 51, 0, 1, 21, 215, 2, 134, 20, 0, 0, 24, 18, 1, 0, 21, 7, 0, 0, 119, 0, 46, 0, 1, 21, 218, 2, 134, 20, 0, 0, 24, 18, 1, 0, 21, 8, 0, 0, 119, 0, 41, 0, 1, 21, 234, 2, 134, 20, 0, 0, 24, 18, 1, 0, 21, 14, 0, 0, 119, 0, 36, 0, 1, 21, 251, 2, 134, 20, 0, 0, 24, 18, 1, 0, 21, 15, 0, 0, 119, 0, 31, 0, 1, 21, 13, 3, 134, 20, 0, 0, 24, 18, 1, 0, 21, 16, 0, 0, 119, 0, 26, 0, 1, 21, 34, 3, 134, 20, 0, 0, 24, 18, 1, 0, 21, 17, 0, 0, 119, 0, 21, 0, 1, 21, 81, 3, 134, 20, 0, 0, 24, 18, 1, 0, 21, 10, 0, 0, 119, 0, 16, 0, 1, 21, 107, 3, 134, 20, 0, 0, 24, 18, 1, 0, 21, 11, 0, 0, 119, 0, 11, 0, 1, 21, 64, 3, 134, 20, 0, 0, 24, 18, 1, 0, 21, 9, 0, 0, 119, 0, 6, 0, 1, 21, 128, 3, 134, 20, 0, 0, 24, 18, 1, 0, 21, 12, 0, 0, 119, 0, 1, 0, 0, 6, 1, 0, 137, 19, 0, 0, 139, 6, 0, 0, 140, 0, 34, 0, 0, 0, 0, 0, 2, 28, 0, 0, 208, 7, 0, 0, 1, 26, 0, 0, 136, 29, 0, 0, 0, 27, 29, 0, 136, 29, 0, 0, 25, 29, 29, 32, 137, 29, 0, 0, 130, 29, 0, 0, 136, 30, 0, 0, 49, 29, 29, 30, 84, 188, 0, 0, 1, 30, 32, 0, 135, 29, 0, 0, 30, 0, 0, 0, 25, 25, 27, 8, 0, 24, 27, 0, 25, 12, 27, 16, 1, 30, 94, 0, 134, 29, 0, 0, 156, 93, 0, 0, 12, 30, 0, 0, 1, 30, 196, 11, 134, 29, 0, 0, 24, 18, 1, 0, 30, 24, 0, 0, 1, 29, 74, 0, 78, 17, 29, 0, 38, 29, 17, 1, 0, 18, 29, 0, 121, 18, 78, 0, 1, 29, 75, 0, 78, 19, 29, 0, 38, 29, 19, 1, 0, 20, 29, 0, 121, 20, 71, 0, 1, 29, 76, 0, 78, 21, 29, 0, 38, 29, 21, 1, 0, 22, 29, 0, 121, 22, 64, 0, 1, 29, 0, 0, 1, 30, 0, 0, 1, 31, 8, 7, 1, 32, 88, 2, 134, 23, 0, 0, 252, 203, 0, 0, 29, 30, 31, 32, 120, 23, 19, 0, 1, 32, 43, 0, 1, 31, 100, 0, 1, 30, 1, 0, 1, 29, 32, 78, 1, 33, 10, 0, 134, 2, 0, 0, 0, 0, 0, 0, 32, 31, 30, 29, 33, 0, 0, 0, 0, 1, 2, 0, 0, 3, 1, 0, 41, 33, 3, 24, 42, 33, 33, 24, 33, 4, 33, 0, 121, 4, 4, 0, 0, 5, 1, 0, 0, 0, 5, 0, 119, 0, 43, 0, 1, 33, 94, 0, 1, 29, 100, 0, 1, 30, 1, 0, 1, 31, 152, 58, 1, 32, 30, 0, 134, 6, 0, 0, 0, 0, 0, 0, 33, 29, 30, 31, 32, 0, 0, 0, 0, 1, 6, 0, 0, 7, 1, 0, 41, 32, 7, 24, 42, 32, 32, 24, 33, 8, 32, 0, 121, 8, 4, 0, 0, 9, 1, 0, 0, 0, 9, 0, 119, 0, 25, 0, 1, 31, 215, 11, 134, 32, 0, 0, 24, 18, 1, 0, 31, 25, 0, 0, 82, 10, 12, 0, 134, 11, 0, 0, 80, 254, 0, 0, 10, 28, 28, 0, 0, 1, 11, 0, 0, 13, 1, 0, 41, 32, 13, 24, 42, 32, 32, 24, 33, 14, 32, 0, 121, 14, 4, 0, 0, 15, 1, 0, 0, 0, 15, 0, 119, 0, 8, 0, 1, 0, 0, 0, 119, 0, 6, 0, 1, 26, 4, 0, 119, 0, 4, 0, 1, 26, 4, 0, 119, 0, 2, 0, 1, 26, 4, 0, 32, 32, 26, 4, 121, 32, 2, 0, 1, 0, 10, 0, 0, 16, 0, 0, 137, 27, 0, 0, 139, 16, 0, 0, 140, 4, 37, 0, 0, 0, 0, 0, 1, 31, 0, 0, 136, 35, 0, 0, 0, 32, 35, 0, 136, 35, 0, 0, 1, 36, 128, 0, 3, 35, 35, 36, 137, 35, 0, 0, 130, 35, 0, 0, 136, 36, 0, 0, 49, 35, 35, 36, 36, 190, 0, 0, 1, 36, 128, 0, 135, 35, 0, 0, 36, 0, 0, 0, 25, 24, 32, 124, 0, 25, 32, 0, 0, 30, 25, 0, 1, 33, 240, 1, 25, 34, 30, 124, 82, 35, 33, 0, 85, 30, 35, 0, 25, 30, 30, 4, 25, 33, 33, 4, 54, 35, 30, 34, 56, 190, 0, 0, 26, 26, 1, 1, 2, 35, 0, 0, 254, 255, 255, 127, 16, 27, 35, 26, 121, 27, 13, 0, 32, 28, 1, 0, 121, 28, 5, 0, 0, 6, 24, 0, 1, 7, 1, 0, 1, 31, 4, 0, 119, 0, 10, 0, 134, 29, 0, 0, 232, 28, 1, 0, 1, 35, 75, 0, 85, 29, 35, 0, 1, 5, 255, 255, 119, 0, 4, 0, 0, 6, 0, 0, 0, 7, 1, 0, 1, 31, 4, 0, 32, 35, 31, 4, 121, 35, 35, 0, 0, 8, 6, 0, 1, 35, 254, 255, 4, 9, 35, 8, 16, 10, 9, 7, 125, 4, 10, 9, 7, 0, 0, 0, 25, 11, 25, 48, 85, 11, 4, 0, 25, 12, 25, 20, 85, 12, 6, 0, 25, 13, 25, 44, 85, 13, 6, 0, 3, 14, 6, 4, 25, 15, 25, 16, 85, 15, 14, 0, 25, 16, 25, 28, 85, 16, 14, 0, 134, 17, 0, 0, 56, 177, 0, 0, 25, 2, 3, 0, 32, 18, 4, 0, 121, 18, 3, 0, 0, 5, 17, 0, 119, 0, 11, 0, 82, 19, 12, 0, 82, 20, 15, 0, 13, 21, 19, 20, 41, 35, 21, 31, 42, 35, 35, 31, 0, 22, 35, 0, 3, 23, 19, 22, 1, 35, 0, 0, 83, 23, 35, 0, 0, 5, 17, 0, 137, 32, 0, 0, 139, 5, 0, 0, 140, 3, 31, 0, 0, 0, 0, 0, 1, 27, 0, 0, 136, 29, 0, 0, 0, 28, 29, 0, 136, 29, 0, 0, 25, 29, 29, 48, 137, 29, 0, 0, 130, 29, 0, 0, 136, 30, 0, 0, 49, 29, 29, 30, 116, 191, 0, 0, 1, 30, 48, 0, 135, 29, 0, 0, 30, 0, 0, 0, 25, 3, 28, 32, 25, 26, 28, 24, 25, 25, 28, 16, 25, 24, 28, 8, 0, 23, 28, 0, 25, 19, 28, 28, 0, 16, 0, 0, 38, 29, 1, 1, 0, 20, 29, 0, 0, 17, 20, 0, 38, 29, 2, 1, 0, 21, 29, 0, 0, 18, 21, 0, 0, 22, 17, 0, 38, 29, 22, 1, 0, 4, 29, 0, 121, 4, 10, 0, 1, 29, 212, 27, 78, 5, 29, 0, 0, 6, 16, 0, 78, 29, 19, 0, 83, 3, 29, 0, 134, 29, 0, 0, 136, 214, 0, 0, 3, 5, 6, 0, 119, 0, 9, 0, 0, 7, 16, 0, 1, 29, 255, 0, 19, 29, 7, 29, 0, 8, 29, 0, 1, 30, 208, 27, 134, 29, 0, 0, 80, 26, 1, 0, 30, 8, 0, 0, 0, 9, 16, 0, 1, 29, 212, 27, 83, 29, 9, 0, 0, 10, 18, 0, 38, 29, 10, 1, 0, 11, 29, 0, 120, 11, 3, 0, 137, 28, 0, 0, 139, 0, 0, 0, 1, 30, 178, 12, 134, 29, 0, 0, 52, 20, 1, 0, 30, 0, 0, 0, 0, 12, 16, 0, 1, 29, 255, 0, 19, 29, 12, 29, 0, 13, 29, 0, 1, 29, 44, 0, 1, 30, 83, 0, 138, 13, 29, 30, 200, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 228, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 152, 193, 0, 0, 0, 194, 0, 0, 0, 14, 16, 0, 1, 29, 255, 0, 19, 29, 14, 29, 0, 15, 29, 0, 85, 26, 15, 0, 1, 30, 222, 12, 134, 29, 0, 0, 24, 18, 1, 0, 30, 26, 0, 0, 137, 28, 0, 0, 139, 0, 0, 0, 119, 0, 22, 0, 1, 30, 203, 12, 134, 29, 0, 0, 24, 18, 1, 0, 30, 24, 0, 0, 137, 28, 0, 0, 139, 0, 0, 0, 119, 0, 15, 0, 1, 30, 215, 12, 134, 29, 0, 0, 24, 18, 1, 0, 30, 25, 0, 0, 137, 28, 0, 0, 139, 0, 0, 0, 119, 0, 8, 0, 1, 30, 192, 12, 134, 29, 0, 0, 24, 18, 1, 0, 30, 23, 0, 0, 137, 28, 0, 0, 139, 0, 0, 0, 119, 0, 1, 0, 139, 0, 0, 0, 140, 3, 31, 0, 0, 0, 0, 0, 1, 27, 0, 0, 136, 29, 0, 0, 0, 28, 29, 0, 136, 29, 0, 0, 25, 29, 29, 48, 137, 29, 0, 0, 130, 29, 0, 0, 136, 30, 0, 0, 49, 29, 29, 30, 92, 194, 0, 0, 1, 30, 48, 0, 135, 29, 0, 0, 30, 0, 0, 0, 25, 3, 28, 32, 25, 26, 28, 24, 25, 25, 28, 16, 25, 24, 28, 8, 0, 23, 28, 0, 25, 19, 28, 28, 0, 16, 0, 0, 38, 29, 1, 1, 0, 20, 29, 0, 0, 17, 20, 0, 38, 29, 2, 1, 0, 21, 29, 0, 0, 18, 21, 0, 0, 22, 17, 0, 38, 29, 22, 1, 0, 4, 29, 0, 121, 4, 10, 0, 1, 29, 213, 27, 78, 5, 29, 0, 0, 6, 16, 0, 78, 29, 19, 0, 83, 3, 29, 0, 134, 29, 0, 0, 136, 214, 0, 0, 3, 5, 6, 0, 119, 0, 9, 0, 0, 7, 16, 0, 1, 29, 255, 0, 19, 29, 7, 29, 0, 8, 29, 0, 1, 30, 209, 27, 134, 29, 0, 0, 80, 26, 1, 0, 30, 8, 0, 0, 0, 9, 16, 0, 1, 29, 213, 27, 83, 29, 9, 0, 0, 10, 18, 0, 38, 29, 10, 1, 0, 11, 29, 0, 120, 11, 3, 0, 137, 28, 0, 0, 139, 0, 0, 0, 1, 30, 225, 12, 134, 29, 0, 0, 52, 20, 1, 0, 30, 0, 0, 0, 0, 12, 16, 0, 1, 29, 255, 0, 19, 29, 12, 29, 0, 13, 29, 0, 1, 29, 20, 0, 1, 30, 107, 0, 138, 13, 29, 30, 16, 197, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 44, 197, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 224, 196, 0, 0, 72, 197, 0, 0, 0, 14, 16, 0, 1, 29, 255, 0, 19, 29, 14, 29, 0, 15, 29, 0, 85, 26, 15, 0, 1, 30, 222, 12, 134, 29, 0, 0, 24, 18, 1, 0, 30, 26, 0, 0, 137, 28, 0, 0, 139, 0, 0, 0, 119, 0, 22, 0, 1, 30, 253, 12, 134, 29, 0, 0, 24, 18, 1, 0, 30, 25, 0, 0, 137, 28, 0, 0, 139, 0, 0, 0, 119, 0, 15, 0, 1, 30, 243, 12, 134, 29, 0, 0, 24, 18, 1, 0, 30, 24, 0, 0, 137, 28, 0, 0, 139, 0, 0, 0, 119, 0, 8, 0, 1, 30, 237, 12, 134, 29, 0, 0, 24, 18, 1, 0, 30, 23, 0, 0, 137, 28, 0, 0, 139, 0, 0, 0, 119, 0, 1, 0, 139, 0, 0, 0, 140, 3, 31, 0, 0, 0, 0, 0, 1, 27, 0, 0, 136, 29, 0, 0, 0, 28, 29, 0, 136, 29, 0, 0, 25, 29, 29, 48, 137, 29, 0, 0, 130, 29, 0, 0, 136, 30, 0, 0, 49, 29, 29, 30, 164, 197, 0, 0, 1, 30, 48, 0, 135, 29, 0, 0, 30, 0, 0, 0, 25, 3, 28, 32, 25, 26, 28, 24, 25, 25, 28, 16, 25, 24, 28, 8, 0, 23, 28, 0, 25, 19, 28, 28, 0, 16, 0, 0, 38, 29, 1, 1, 0, 20, 29, 0, 0, 17, 20, 0, 38, 29, 2, 1, 0, 21, 29, 0, 0, 18, 21, 0, 0, 22, 17, 0, 38, 29, 22, 1, 0, 4, 29, 0, 121, 4, 10, 0, 1, 29, 211, 27, 78, 5, 29, 0, 0, 6, 16, 0, 78, 29, 19, 0, 83, 3, 29, 0, 134, 29, 0, 0, 136, 214, 0, 0, 3, 5, 6, 0, 119, 0, 9, 0, 0, 7, 16, 0, 1, 29, 255, 0, 19, 29, 7, 29, 0, 8, 29, 0, 1, 30, 207, 27, 134, 29, 0, 0, 80, 26, 1, 0, 30, 8, 0, 0, 0, 9, 16, 0, 1, 29, 211, 27, 83, 29, 9, 0, 0, 10, 18, 0, 38, 29, 10, 1, 0, 11, 29, 0, 120, 11, 3, 0, 137, 28, 0, 0, 139, 0, 0, 0, 1, 30, 5, 13, 134, 29, 0, 0, 52, 20, 1, 0, 30, 0, 0, 0, 0, 12, 16, 0, 1, 29, 255, 0, 19, 29, 12, 29, 0, 13, 29, 0, 1, 29, 70, 0, 1, 30, 101, 0, 138, 13, 29, 30, 64, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 92, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0 ], eb + 40960);
 HEAPU8.set([ 16, 200, 0, 0, 16, 200, 0, 0, 16, 200, 0, 0, 120, 200, 0, 0, 0, 14, 16, 0, 1, 29, 255, 0, 19, 29, 14, 29, 0, 15, 29, 0, 85, 26, 15, 0, 1, 30, 222, 12, 134, 29, 0, 0, 24, 18, 1, 0, 30, 26, 0, 0, 137, 28, 0, 0, 139, 0, 0, 0, 119, 0, 22, 0, 1, 30, 12, 13, 134, 29, 0, 0, 24, 18, 1, 0, 30, 23, 0, 0, 137, 28, 0, 0, 139, 0, 0, 0, 119, 0, 15, 0, 1, 30, 19, 13, 134, 29, 0, 0, 24, 18, 1, 0, 30, 24, 0, 0, 137, 28, 0, 0, 139, 0, 0, 0, 119, 0, 8, 0, 1, 30, 29, 13, 134, 29, 0, 0, 24, 18, 1, 0, 30, 25, 0, 0, 137, 28, 0, 0, 139, 0, 0, 0, 119, 0, 1, 0, 139, 0, 0, 0, 140, 3, 30, 0, 0, 0, 0, 0, 1, 26, 0, 0, 136, 28, 0, 0, 0, 27, 28, 0, 136, 28, 0, 0, 25, 28, 28, 48, 137, 28, 0, 0, 130, 28, 0, 0, 136, 29, 0, 0, 49, 28, 28, 29, 212, 200, 0, 0, 1, 29, 48, 0, 135, 28, 0, 0, 29, 0, 0, 0, 25, 3, 27, 32, 25, 25, 27, 24, 25, 24, 27, 16, 25, 23, 27, 8, 0, 22, 27, 0, 25, 18, 27, 28, 0, 15, 0, 0, 38, 28, 1, 1, 0, 19, 28, 0, 0, 16, 19, 0, 38, 28, 2, 1, 0, 20, 28, 0, 0, 17, 20, 0, 0, 21, 16, 0, 38, 28, 21, 1, 0, 4, 28, 0, 121, 4, 10, 0, 1, 28, 215, 27, 78, 5, 28, 0, 0, 6, 15, 0, 78, 28, 18, 0, 83, 3, 28, 0, 134, 28, 0, 0, 136, 214, 0, 0, 3, 5, 6, 0, 119, 0, 9, 0, 0, 7, 15, 0, 1, 28, 255, 0, 19, 28, 7, 28, 0, 8, 28, 0, 1, 29, 214, 27, 134, 28, 0, 0, 80, 26, 1, 0, 29, 8, 0, 0, 0, 9, 17, 0, 38, 28, 9, 1, 0, 10, 28, 0, 120, 10, 3, 0, 137, 27, 0, 0, 139, 0, 0, 0, 1, 29, 58, 13, 134, 28, 0, 0, 52, 20, 1, 0, 29, 0, 0, 0, 0, 11, 15, 0, 1, 28, 255, 0, 19, 28, 11, 28, 0, 12, 28, 0, 1, 28, 29, 0, 1, 29, 32, 0, 138, 12, 28, 29, 80, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 108, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 32, 202, 0, 0, 136, 202, 0, 0, 0, 13, 15, 0, 1, 28, 255, 0, 19, 28, 13, 28, 0, 14, 28, 0, 85, 25, 14, 0, 1, 29, 222, 12, 134, 28, 0, 0, 24, 18, 1, 0, 29, 25, 0, 0, 137, 27, 0, 0, 139, 0, 0, 0, 119, 0, 22, 0, 1, 29, 84, 13, 134, 28, 0, 0, 24, 18, 1, 0, 29, 22, 0, 0, 137, 27, 0, 0, 139, 0, 0, 0, 119, 0, 15, 0, 1, 29, 95, 13, 134, 28, 0, 0, 24, 18, 1, 0, 29, 24, 0, 0, 137, 27, 0, 0, 139, 0, 0, 0, 119, 0, 8, 0, 1, 29, 89, 13, 134, 28, 0, 0, 24, 18, 1, 0, 29, 23, 0, 0, 137, 27, 0, 0, 139, 0, 0, 0, 119, 0, 1, 0, 139, 0, 0, 0, 140, 3, 40, 0, 0, 0, 0, 0, 2, 37, 0, 0, 255, 0, 0, 0, 1, 35, 0, 0, 136, 38, 0, 0, 0, 36, 38, 0, 1, 38, 0, 0, 16, 28, 38, 1, 1, 38, 255, 255, 16, 29, 38, 0, 32, 30, 1, 0, 19, 38, 30, 29, 0, 31, 38, 0, 20, 38, 28, 31, 0, 32, 38, 0, 121, 32, 41, 0, 0, 6, 2, 0, 0, 33, 0, 0, 0, 34, 1, 0, 1, 38, 10, 0, 1, 39, 0, 0, 134, 9, 0, 0, 164, 20, 1, 0, 33, 34, 38, 39, 128, 39, 0, 0, 0, 10, 39, 0, 19, 39, 9, 37, 0, 11, 39, 0, 39, 39, 11, 48, 0, 12, 39, 0, 26, 13, 6, 1, 83, 13, 12, 0, 1, 39, 10, 0, 1, 38, 0, 0, 134, 14, 0, 0, 132, 28, 1, 0, 33, 34, 39, 38, 128, 38, 0, 0, 0, 15, 38, 0, 1, 38, 9, 0, 16, 16, 38, 34, 1, 38, 255, 255, 16, 17, 38, 33, 32, 18, 34, 9, 19, 38, 18, 17, 0, 19, 38, 0, 20, 38, 16, 19, 0, 20, 38, 0, 121, 20, 5, 0, 0, 6, 13, 0, 0, 33, 14, 0, 0, 34, 15, 0, 119, 0, 223, 255, 0, 3, 14, 0, 0, 5, 13, 0, 119, 0, 3, 0, 0, 3, 0, 0, 0, 5, 2, 0, 32, 21, 3, 0, 121, 21, 3, 0, 0, 7, 5, 0, 119, 0, 22, 0, 0, 4, 3, 0, 0, 8, 5, 0, 31, 38, 4, 10, 38, 38, 38, 255, 0, 22, 38, 0, 39, 38, 22, 48, 0, 23, 38, 0, 19, 38, 23, 37, 0, 24, 38, 0, 26, 25, 8, 1, 83, 25, 24, 0, 29, 38, 4, 10, 38, 38, 38, 255, 0, 26, 38, 0, 35, 27, 4, 10, 121, 27, 3, 0, 0, 7, 25, 0, 119, 0, 4, 0, 0, 4, 26, 0, 0, 8, 25, 0, 119, 0, 238, 255, 139, 7, 0, 0, 140, 4, 38, 0, 0, 0, 0, 0, 1, 34, 0, 0, 136, 36, 0, 0, 0, 35, 36, 0, 136, 36, 0, 0, 25, 36, 36, 32, 137, 36, 0, 0, 130, 36, 0, 0, 136, 37, 0, 0, 49, 36, 36, 37, 56, 204, 0, 0, 1, 37, 32, 0, 135, 36, 0, 0, 37, 0, 0, 0, 0, 33, 35, 0, 0, 27, 0, 0, 0, 28, 1, 0, 0, 29, 2, 0, 0, 30, 3, 0, 0, 31, 27, 0, 0, 32, 29, 0, 15, 4, 32, 31, 121, 4, 3, 0, 1, 34, 3, 0, 119, 0, 6, 0, 0, 5, 28, 0, 0, 6, 30, 0, 15, 7, 6, 5, 121, 7, 2, 0, 1, 34, 3, 0, 32, 36, 34, 3, 121, 36, 7, 0, 134, 36, 0, 0, 188, 24, 1, 0, 1, 37, 182, 9, 134, 36, 0, 0, 24, 18, 1, 0, 37, 33, 0, 0, 1, 36, 20, 24, 80, 8, 36, 0, 41, 36, 8, 16, 42, 36, 36, 16, 0, 9, 36, 0, 134, 10, 0, 0, 200, 8, 1, 0, 9, 0, 0, 0, 0, 11, 27, 0, 17, 12, 11, 10, 120, 12, 4, 0, 1, 26, 0, 0, 137, 35, 0, 0, 139, 26, 0, 0, 1, 36, 20, 24, 80, 13, 36, 0, 41, 36, 13, 16, 42, 36, 36, 16, 0, 14, 36, 0, 134, 15, 0, 0, 200, 8, 1, 0, 14, 0, 0, 0, 0, 16, 29, 0, 17, 17, 15, 16, 120, 17, 4, 0, 1, 26, 0, 0, 137, 35, 0, 0, 139, 26, 0, 0, 1, 36, 22, 24, 80, 18, 36, 0, 41, 36, 18, 16, 42, 36, 36, 16, 0, 19, 36, 0, 0, 20, 28, 0, 17, 21, 20, 19, 120, 21, 4, 0, 1, 26, 0, 0, 137, 35, 0, 0, 139, 26, 0, 0, 1, 36, 22, 24, 80, 22, 36, 0, 41, 36, 22, 16, 42, 36, 36, 16, 0, 23, 36, 0, 0, 24, 30, 0, 17, 25, 23, 24, 0, 26, 25, 0, 137, 35, 0, 0, 139, 26, 0, 0, 140, 0, 32, 0, 0, 0, 0, 0, 2, 26, 0, 0, 39, 6, 0, 0, 1, 24, 0, 0, 136, 27, 0, 0, 0, 25, 27, 0, 136, 27, 0, 0, 25, 27, 27, 32, 137, 27, 0, 0, 130, 27, 0, 0, 136, 28, 0, 0, 49, 27, 27, 28, 160, 205, 0, 0, 1, 28, 32, 0, 135, 27, 0, 0, 28, 0, 0, 0, 25, 23, 25, 8, 0, 22, 25, 0, 25, 12, 25, 16, 1, 28, 94, 0, 134, 27, 0, 0, 156, 93, 0, 0, 12, 28, 0, 0, 1, 27, 8, 0, 78, 15, 27, 0, 38, 27, 15, 1, 0, 16, 27, 0, 121, 16, 3, 0, 1, 0, 12, 0, 119, 0, 81, 0, 1, 27, 156, 24, 82, 17, 27, 0, 25, 18, 17, 1, 1, 27, 156, 24, 85, 27, 18, 0, 1, 27, 0, 0, 1, 28, 0, 0, 1, 29, 8, 7, 1, 30, 88, 2, 134, 19, 0, 0, 252, 203, 0, 0, 27, 28, 29, 30, 120, 19, 19, 0, 1, 30, 43, 0, 1, 29, 100, 0, 1, 28, 1, 0, 1, 27, 32, 78, 1, 31, 10, 0, 134, 20, 0, 0, 0, 0, 0, 0, 30, 29, 28, 27, 31, 0, 0, 0, 0, 1, 20, 0, 0, 21, 1, 0, 41, 31, 21, 24, 42, 31, 31, 24, 33, 2, 31, 0, 121, 2, 4, 0, 0, 3, 1, 0, 0, 0, 3, 0, 119, 0, 50, 0, 1, 31, 150, 0, 1, 27, 194, 1, 1, 28, 100, 0, 134, 4, 0, 0, 128, 144, 0, 0, 31, 27, 28, 0, 0, 1, 4, 0, 0, 5, 1, 0, 41, 28, 5, 24, 42, 28, 28, 24, 33, 6, 28, 0, 121, 6, 4, 0, 0, 7, 1, 0, 0, 0, 7, 0, 119, 0, 35, 0, 1, 27, 215, 11, 134, 28, 0, 0, 24, 18, 1, 0, 27, 22, 0, 0, 1, 27, 60, 0, 1, 31, 0, 0, 1, 29, 1, 0, 134, 28, 0, 0, 152, 200, 0, 0, 27, 31, 29, 0, 82, 8, 12, 0, 1, 28, 0, 0, 1, 29, 208, 7, 134, 9, 0, 0, 80, 254, 0, 0, 8, 28, 29, 0, 0, 1, 9, 0, 0, 10, 1, 0, 41, 29, 10, 24, 42, 29, 29, 24, 33, 11, 29, 0, 121, 11, 4, 0, 0, 13, 1, 0, 0, 0, 13, 0, 119, 0, 10, 0, 1, 28, 137, 10, 134, 29, 0, 0, 24, 18, 1, 0, 28, 23, 0, 0, 1, 29, 8, 0, 1, 28, 1, 0, 83, 29, 28, 0, 1, 0, 0, 0, 119, 0, 1, 0, 0, 14, 0, 0, 137, 25, 0, 0, 139, 14, 0, 0, 140, 1, 27, 0, 0, 0, 0, 0, 1, 23, 0, 0, 136, 25, 0, 0, 0, 24, 25, 0, 136, 25, 0, 0, 25, 25, 25, 16, 137, 25, 0, 0, 130, 25, 0, 0, 136, 26, 0, 0, 49, 25, 25, 26, 96, 207, 0, 0, 1, 26, 16, 0, 135, 25, 0, 0, 26, 0, 0, 0, 0, 22, 24, 0, 0, 12, 0, 0, 0, 16, 12, 0, 1, 25, 0, 0, 1, 26, 14, 0, 138, 16, 25, 26, 208, 207, 0, 0, 224, 207, 0, 0, 248, 207, 0, 0, 16, 208, 0, 0, 40, 208, 0, 0, 64, 208, 0, 0, 88, 208, 0, 0, 176, 207, 0, 0, 176, 207, 0, 0, 176, 207, 0, 0, 176, 207, 0, 0, 176, 207, 0, 0, 176, 207, 0, 0, 112, 208, 0, 0, 0, 5, 12, 0, 85, 22, 5, 0, 1, 26, 104, 10, 134, 25, 0, 0, 24, 18, 1, 0, 26, 22, 0, 0, 1, 15, 11, 0, 119, 0, 45, 0, 134, 17, 0, 0, 92, 205, 0, 0, 0, 15, 17, 0, 119, 0, 41, 0, 1, 25, 0, 0, 134, 18, 0, 0, 80, 213, 0, 0, 25, 0, 0, 0, 0, 15, 18, 0, 119, 0, 35, 0, 1, 25, 1, 0, 134, 19, 0, 0, 80, 213, 0, 0, 25, 0, 0, 0, 0, 15, 19, 0, 119, 0, 29, 0, 1, 25, 2, 0, 134, 20, 0, 0, 80, 213, 0, 0, 25, 0, 0, 0, 0, 15, 20, 0, 119, 0, 23, 0, 1, 25, 3, 0, 134, 21, 0, 0, 80, 213, 0, 0, 25, 0, 0, 0, 0, 15, 21, 0, 119, 0, 17, 0, 1, 25, 4, 0, 134, 2, 0, 0, 80, 213, 0, 0, 25, 0, 0, 0, 0, 15, 2, 0, 119, 0, 11, 0, 1, 25, 5, 0, 134, 3, 0, 0, 80, 213, 0, 0, 25, 0, 0, 0, 0, 15, 3, 0, 119, 0, 5, 0, 134, 4, 0, 0, 12, 29, 1, 0, 0, 15, 4, 0, 119, 0, 1, 0, 0, 6, 15, 0, 41, 25, 6, 24, 42, 25, 25, 24, 33, 7, 25, 0, 121, 7, 15, 0, 0, 8, 15, 0, 134, 25, 0, 0, 140, 184, 0, 0, 8, 0, 0, 0, 0, 9, 15, 0, 1, 25, 255, 0, 19, 25, 9, 25, 0, 10, 25, 0, 32, 11, 10, 12, 121, 11, 5, 0, 1, 1, 0, 0, 0, 14, 1, 0, 137, 24, 0, 0, 139, 14, 0, 0, 0, 13, 15, 0, 0, 1, 13, 0, 0, 14, 1, 0, 137, 24, 0, 0, 139, 14, 0, 0, 140, 3, 30, 0, 0, 0, 0, 0, 1, 26, 0, 0, 136, 28, 0, 0, 0, 27, 28, 0, 136, 28, 0, 0, 25, 28, 28, 32, 137, 28, 0, 0, 130, 28, 0, 0, 136, 29, 0, 0, 49, 28, 28, 29, 28, 209, 0, 0, 1, 29, 32, 0, 135, 28, 0, 0, 29, 0, 0, 0, 25, 3, 27, 24, 25, 25, 27, 16, 25, 24, 27, 8, 0, 23, 27, 0, 25, 19, 27, 20, 0, 16, 0, 0, 38, 28, 1, 1, 0, 20, 28, 0, 0, 17, 20, 0, 38, 28, 2, 1, 0, 21, 28, 0, 0, 18, 21, 0, 0, 22, 17, 0, 38, 28, 22, 1, 0, 4, 28, 0, 121, 4, 10, 0, 1, 28, 210, 27, 78, 5, 28, 0, 0, 6, 16, 0, 78, 28, 19, 0, 83, 3, 28, 0, 134, 28, 0, 0, 136, 214, 0, 0, 3, 5, 6, 0, 119, 0, 9, 0, 0, 7, 16, 0, 1, 28, 255, 0, 19, 28, 7, 28, 0, 8, 28, 0, 1, 29, 206, 27, 134, 28, 0, 0, 80, 26, 1, 0, 29, 8, 0, 0, 0, 9, 16, 0, 1, 28, 210, 27, 83, 28, 9, 0, 0, 10, 18, 0, 38, 28, 10, 1, 0, 11, 28, 0, 120, 11, 3, 0, 137, 27, 0, 0, 139, 0, 0, 0, 1, 29, 42, 13, 134, 28, 0, 0, 52, 20, 1, 0, 29, 0, 0, 0, 0, 12, 16, 0, 1, 28, 255, 0, 19, 28, 12, 28, 0, 13, 28, 0, 1, 28, 47, 0, 1, 29, 44, 0, 138, 13, 28, 29, 208, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 160, 210, 0, 0, 236, 210, 0, 0, 0, 14, 16, 0, 1, 28, 255, 0, 19, 28, 14, 28, 0, 15, 28, 0, 85, 25, 15, 0, 1, 29, 222, 12, 134, 28, 0, 0, 24, 18, 1, 0, 29, 25, 0, 0, 137, 27, 0, 0, 139, 0, 0, 0, 119, 0, 15, 0, 1, 29, 215, 12, 134, 28, 0, 0, 24, 18, 1, 0, 29, 23, 0, 0, 137, 27, 0, 0, 139, 0, 0, 0, 119, 0, 8, 0, 1, 29, 48, 13, 134, 28, 0, 0, 24, 18, 1, 0, 29, 24, 0, 0, 137, 27, 0, 0, 139, 0, 0, 0, 119, 0, 1, 0, 139, 0, 0, 0, 140, 2, 25, 0, 0, 0, 0, 0, 1, 22, 0, 0, 136, 24, 0, 0, 0, 23, 24, 0, 1, 4, 0, 0, 1, 24, 27, 16, 3, 15, 24, 4, 78, 16, 15, 0, 1, 24, 255, 0, 19, 24, 16, 24, 0, 17, 24, 0, 13, 18, 17, 0, 121, 18, 3, 0, 1, 22, 2, 0, 119, 0, 10, 0, 25, 19, 4, 1, 32, 20, 19, 87, 121, 20, 5, 0, 1, 3, 115, 16, 1, 6, 87, 0, 1, 22, 5, 0, 119, 0, 3, 0, 0, 4, 19, 0, 119, 0, 238, 255, 32, 24, 22, 2, 121, 24, 8, 0, 32, 14, 4, 0, 121, 14, 3, 0, 1, 2, 115, 16, 119, 0, 4, 0, 1, 3, 115, 16, 0, 6, 4, 0, 1, 22, 5, 0, 32, 24, 22, 5, 121, 24, 20, 0, 1, 22, 0, 0, 0, 5, 3, 0, 78, 21, 5, 0, 41, 24, 21, 24, 42, 24, 24, 24, 32, 7, 24, 0, 25, 8, 5, 1, 120, 7, 3, 0, 0, 5, 8, 0, 119, 0, 249, 255, 26, 9, 6, 1, 32, 10, 9, 0, 121, 10, 3, 0, 0, 2, 8, 0, 119, 0, 5, 0, 0, 3, 8, 0, 0, 6, 9, 0, 1, 22, 5, 0, 119, 0, 238, 255, 25, 11, 1, 20, 82, 12, 11, 0, 134, 13, 0, 0, 196, 28, 1, 0, 2, 12, 0, 0, 139, 13, 0, 0, 140, 1, 25, 0, 0, 0, 0, 0, 1, 19, 0, 0, 136, 21, 0, 0, 0, 20, 21, 0, 136, 21, 0, 0, 25, 21, 21, 16, 137, 21, 0, 0, 130, 21, 0, 0, 136, 22, 0, 0, 49, 21, 21, 22, 60, 212, 0, 0, 1, 22, 16, 0, 135, 21, 0, 0, 22, 0, 0, 0, 0, 11, 0, 0, 0, 13, 11, 0, 1, 21, 255, 0, 19, 21, 13, 21, 0, 14, 21, 0, 1, 21, 5, 0, 15, 15, 21, 14, 121, 15, 5, 0, 1, 2, 11, 0, 0, 10, 2, 0, 137, 20, 0, 0, 139, 10, 0, 0, 1, 22, 47, 0, 1, 23, 0, 0, 1, 24, 1, 0, 134, 21, 0, 0, 224, 208, 0, 0, 22, 23, 24, 0, 1, 24, 70, 0, 1, 23, 0, 0, 1, 22, 1, 0, 134, 21, 0, 0, 104, 197, 0, 0, 24, 23, 22, 0, 0, 16, 11, 0, 134, 17, 0, 0, 76, 101, 0, 0, 16, 0, 0, 0, 0, 12, 17, 0, 0, 18, 12, 0, 1, 21, 255, 0, 19, 21, 18, 21, 0, 3, 21, 0, 33, 4, 3, 12, 121, 4, 30, 0, 0, 5, 11, 0, 1, 21, 255, 0, 19, 21, 5, 21, 0, 6, 21, 0, 1, 21, 0, 0, 1, 22, 6, 0, 138, 6, 21, 22, 0, 213, 0, 0, 8, 213, 0, 0, 16, 213, 0, 0, 24, 213, 0, 0, 32, 213, 0, 0, 40, 213, 0, 0, 119, 0, 16, 0, 1, 1, 216, 24, 119, 0, 11, 0, 1, 1, 220, 24, 119, 0, 9, 0, 1, 1, 224, 24, 119, 0, 7, 0, 1, 1, 228, 24, 119, 0, 5, 0, 1, 1, 232, 24, 119, 0, 3, 0, 1, 1, 236, 24, 119, 0, 1, 0, 82, 7, 1, 0, 25, 8, 7, 1, 85, 1, 8, 0, 0, 9, 12, 0, 0, 2, 9, 0, 0, 10, 2, 0, 137, 20, 0, 0, 139, 10, 0, 0, 140, 1, 25, 0, 0, 0, 0, 0, 1, 19, 0, 0, 136, 21, 0, 0, 0, 20, 21, 0, 136, 21, 0, 0, 25, 21, 21, 16, 137, 21, 0, 0, 130, 21, 0, 0, 136, 22, 0, 0, 49, 21, 21, 22, 140, 213, 0, 0, 1, 22, 16, 0, 135, 21, 0, 0, 22, 0, 0, 0, 0, 11, 0, 0, 0, 13, 11, 0, 1, 21, 255, 0, 19, 21, 13, 21, 0, 14, 21, 0, 1, 21, 5, 0, 15, 15, 21, 14, 121, 15, 5, 0, 1, 2, 11, 0, 0, 10, 2, 0, 137, 20, 0, 0, 139, 10, 0, 0, 0, 16, 11, 0, 134, 17, 0, 0, 76, 101, 0, 0, 16, 0, 0, 0, 0, 12, 17, 0, 0, 18, 12, 0, 1, 21, 255, 0, 19, 21, 18, 21, 0, 3, 21, 0, 33, 4, 3, 12, 121, 4, 30, 0, 0, 5, 11, 0, 1, 21, 255, 0, 19, 21, 5, 21, 0, 6, 21, 0, 1, 21, 0, 0, 1, 22, 6, 0, 138, 6, 21, 22, 32, 214, 0, 0, 40, 214, 0, 0, 48, 214, 0, 0, 56, 214, 0, 0, 64, 214, 0, 0, 72, 214, 0, 0, 119, 0, 16, 0, 1, 1, 160, 24, 119, 0, 11, 0, 1, 1, 164, 24, 119, 0, 9, 0, 1, 1, 168, 24, 119, 0, 7, 0, 1, 1, 172, 24, 119, 0, 5, 0, 1, 1, 176, 24, 119, 0, 3, 0, 1, 1, 180, 24, 119, 0, 1, 0, 82, 7, 1, 0, 25, 8, 7, 1, 85, 1, 8, 0, 1, 22, 31, 0, 1, 23, 0, 0, 1, 24, 1, 0, 134, 21, 0, 0, 152, 200, 0, 0, 22, 23, 24, 0, 0, 9, 12, 0, 0, 2, 9, 0, 0, 10, 2, 0, 137, 20, 0, 0, 139, 10, 0, 0, 140, 3, 33, 0, 0, 0, 0, 0, 2, 30, 0, 0, 255, 0, 0, 0, 1, 28, 0, 0, 136, 31, 0, 0, 0, 29, 31, 0, 136, 31, 0, 0, 25, 31, 31, 16, 137, 31, 0, 0, 130, 31, 0, 0, 136, 32, 0, 0, 49, 31, 31, 32, 204, 214, 0, 0, 1, 32, 16, 0, 135, 31, 0, 0, 32, 0, 0, 0, 0, 21, 1, 0, 0, 22, 2, 0, 0, 23, 21, 0, 19, 31, 23, 30, 0, 24, 31, 0, 0, 25, 22, 0, 19, 31, 25, 30, 0, 26, 31, 0, 15, 27, 26, 24, 121, 27, 30, 0, 0, 3, 21, 0, 19, 31, 3, 30, 0, 4, 31, 0, 0, 5, 22, 0, 19, 31, 5, 30, 0, 6, 31, 0, 17, 7, 6, 4, 120, 7, 2, 0, 119, 0, 18, 0, 0, 8, 21, 0, 19, 31, 8, 30, 0, 9, 31, 0, 134, 31, 0, 0, 80, 26, 1, 0, 0, 9, 0, 0, 1, 32, 20, 0, 134, 31, 0, 0, 48, 10, 1, 0, 32, 0, 0, 0, 0, 10, 21, 0, 26, 31, 10, 1, 41, 31, 31, 24, 42, 31, 31, 24, 0, 11, 31, 0, 0, 21, 11, 0, 119, 0, 231, 255, 137, 29, 0, 0, 139, 0, 0, 0, 119, 0, 29, 0, 0, 12, 21, 0, 19, 31, 12, 30, 0, 13, 31, 0, 0, 14, 22, 0, 19, 31, 14, 30, 0, 15, 31, 0, 17, 16, 13, 15, 120, 16, 2, 0, 119, 0, 18, 0, 0, 17, 21, 0, 19, 31, 17, 30, 0, 18, 31, 0, 134, 31, 0, 0, 80, 26, 1, 0, 0, 18, 0, 0, 1, 32, 20, 0, 134, 31, 0, 0, 48, 10, 1, 0, 32, 0, 0, 0, 0, 19, 21, 0, 25, 31, 19, 1, 41, 31, 31, 24, 42, 31, 31, 24, 0, 20, 31, 0, 0, 21, 20, 0, 119, 0, 231, 255, 137, 29, 0, 0, 139, 0, 0, 0, 139, 0, 0, 0, 140, 2, 26, 0, 0, 0, 0, 0, 1, 21, 0, 0, 136, 23, 0, 0, 0, 22, 23, 0, 127, 23, 0, 0, 87, 23, 0, 0, 127, 23, 0, 0, 82, 11, 23, 0, 127, 23, 0, 0, 106, 12, 23, 4, 1, 23, 52, 0, 135, 13, 7, 0, 11, 12, 23, 0, 128, 23, 0, 0, 0, 14, 23, 0, 2, 23, 0, 0, 255, 255, 0, 0, 19, 23, 13, 23, 0, 15, 23, 0, 1, 23, 255, 7, 19, 23, 15, 23, 0, 20, 23, 0, 41, 23, 20, 16, 42, 23, 23, 16, 1, 24, 0, 0, 1, 25, 0, 8, 138, 23, 24, 25, 164, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0 ], eb + 51200);
 HEAPU8.set([ 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 76, 248, 0, 0, 240, 248, 0, 0, 1, 24, 255, 7, 19, 24, 13, 24, 0, 6, 24, 0, 1, 24, 254, 3, 4, 7, 6, 24, 85, 1, 7, 0, 2, 24, 0, 0, 255, 255, 15, 128, 19, 24, 12, 24, 0, 8, 24, 0, 2, 24, 0, 0, 0, 0, 224, 63, 20, 24, 8, 24, 0, 9, 24, 0, 127, 24, 0, 0, 85, 24, 11, 0, 127, 24, 0, 0, 109, 24, 4, 9, 127, 24, 0, 0, 86, 10, 24, 0, 58, 2, 10, 0, 119, 0, 22, 0, 59, 24, 0, 0, 70, 16, 0, 24, 121, 16, 12, 0, 61, 24, 0, 0, 0, 0, 128, 95, 65, 17, 0, 24, 134, 18, 0, 0, 220, 215, 0, 0, 17, 1, 0, 0, 82, 4, 1, 0, 26, 5, 4, 64, 58, 3, 18, 0, 0, 19, 5, 0, 119, 0, 3, 0, 58, 3, 0, 0, 1, 19, 0, 0, 85, 1, 19, 0, 58, 2, 3, 0, 119, 0, 3, 0, 58, 2, 0, 0, 119, 0, 1, 0, 139, 2, 0, 0, 140, 1, 28, 0, 0, 0, 0, 0, 1, 22, 0, 0, 136, 24, 0, 0, 0, 23, 24, 0, 25, 2, 0, 20, 82, 13, 2, 0, 25, 15, 0, 28, 82, 16, 15, 0, 16, 17, 16, 13, 121, 17, 16, 0, 25, 18, 0, 36, 82, 19, 18, 0, 38, 25, 19, 7, 1, 26, 0, 0, 1, 27, 0, 0, 135, 24, 5, 0, 25, 0, 26, 27, 82, 20, 2, 0, 1, 24, 0, 0, 13, 21, 20, 24, 121, 21, 3, 0, 1, 1, 255, 255, 119, 0, 4, 0, 1, 22, 3, 0, 119, 0, 2, 0, 1, 22, 3, 0, 32, 24, 22, 3, 121, 24, 28, 0, 25, 3, 0, 4, 82, 4, 3, 0, 25, 5, 0, 8, 82, 6, 5, 0, 16, 7, 4, 6, 121, 7, 10, 0, 0, 8, 4, 0, 0, 9, 6, 0, 4, 10, 8, 9, 25, 11, 0, 40, 82, 12, 11, 0, 38, 25, 12, 7, 1, 27, 1, 0, 135, 24, 5, 0, 25, 0, 10, 27, 25, 14, 0, 16, 1, 24, 0, 0, 85, 14, 24, 0, 1, 24, 0, 0, 85, 15, 24, 0, 1, 24, 0, 0, 85, 2, 24, 0, 1, 24, 0, 0, 85, 5, 24, 0, 1, 24, 0, 0, 85, 3, 24, 0, 1, 1, 0, 0, 139, 1, 0, 0, 140, 3, 21, 0, 0, 0, 0, 0, 1, 17, 0, 0, 136, 19, 0, 0, 0, 18, 19, 0, 136, 19, 0, 0, 25, 19, 19, 32, 137, 19, 0, 0, 130, 19, 0, 0, 136, 20, 0, 0, 49, 19, 19, 20, 28, 250, 0, 0, 1, 20, 32, 0, 135, 19, 0, 0, 20, 0, 0, 0, 0, 12, 18, 0, 25, 5, 18, 20, 25, 6, 0, 60, 82, 7, 6, 0, 0, 8, 5, 0, 85, 12, 7, 0, 25, 13, 12, 4, 1, 19, 0, 0, 85, 13, 19, 0, 25, 14, 12, 8, 85, 14, 1, 0, 25, 15, 12, 12, 85, 15, 8, 0, 25, 16, 12, 16, 85, 16, 2, 0, 1, 19, 140, 0, 135, 9, 8, 0, 19, 12, 0, 0, 134, 10, 0, 0, 20, 25, 1, 0, 9, 0, 0, 0, 34, 11, 10, 0, 121, 11, 5, 0, 1, 19, 255, 255, 85, 5, 19, 0, 1, 4, 255, 255, 119, 0, 3, 0, 82, 3, 5, 0, 0, 4, 3, 0, 137, 18, 0, 0, 139, 4, 0, 0, 140, 3, 34, 0, 0, 0, 0, 0, 1, 30, 0, 0, 136, 32, 0, 0, 0, 31, 32, 0, 136, 32, 0, 0, 25, 32, 32, 32, 137, 32, 0, 0, 130, 32, 0, 0, 136, 33, 0, 0, 49, 32, 32, 33, 212, 250, 0, 0, 1, 33, 32, 0, 135, 32, 0, 0, 33, 0, 0, 0, 0, 25, 0, 0, 0, 26, 1, 0, 0, 27, 2, 0, 0, 3, 25, 0, 1, 32, 20, 24, 80, 4, 32, 0, 41, 32, 4, 16, 42, 32, 32, 16, 0, 5, 32, 0, 4, 6, 3, 5, 0, 28, 6, 0, 0, 7, 26, 0, 1, 32, 22, 24, 80, 8, 32, 0, 41, 32, 8, 16, 42, 32, 32, 16, 0, 9, 32, 0, 4, 10, 7, 9, 0, 29, 10, 0, 0, 11, 29, 0, 0, 12, 28, 0, 0, 23, 11, 0, 0, 24, 12, 0, 0, 13, 23, 0, 76, 32, 13, 0, 58, 14, 32, 0, 0, 15, 24, 0, 76, 32, 15, 0, 58, 16, 32, 0, 135, 17, 9, 0, 14, 16, 0, 0, 58, 18, 17, 0, 1, 32, 24, 24, 89, 32, 18, 0, 0, 19, 25, 0, 2, 32, 0, 0, 255, 255, 0, 0, 19, 32, 19, 32, 0, 20, 32, 0, 1, 32, 20, 24, 84, 32, 20, 0, 0, 21, 26, 0, 2, 32, 0, 0, 255, 255, 0, 0, 19, 32, 21, 32, 0, 22, 32, 0, 1, 32, 22, 24, 84, 32, 22, 0, 134, 32, 0, 0, 68, 4, 1, 0, 137, 31, 0, 0, 1, 32, 0, 0, 139, 32, 0, 0, 140, 3, 22, 0, 0, 0, 0, 0, 1, 18, 0, 0, 136, 20, 0, 0, 0, 19, 20, 0, 136, 20, 0, 0, 25, 20, 20, 32, 137, 20, 0, 0, 130, 20, 0, 0, 136, 21, 0, 0, 49, 20, 20, 21, 228, 251, 0, 0, 1, 21, 32, 0, 135, 20, 0, 0, 21, 0, 0, 0, 0, 15, 19, 0, 25, 8, 19, 16, 25, 9, 0, 36, 1, 20, 5, 0, 85, 9, 20, 0, 82, 10, 0, 0, 38, 20, 10, 64, 0, 11, 20, 0, 32, 12, 11, 0, 121, 12, 18, 0, 25, 13, 0, 60, 82, 14, 13, 0, 0, 3, 8, 0, 85, 15, 14, 0, 25, 16, 15, 4, 1, 20, 19, 84, 85, 16, 20, 0, 25, 17, 15, 8, 85, 17, 3, 0, 1, 20, 54, 0, 135, 4, 10, 0, 20, 15, 0, 0, 32, 5, 4, 0, 120, 5, 4, 0, 25, 6, 0, 75, 1, 20, 255, 255, 83, 6, 20, 0, 134, 7, 0, 0, 140, 168, 0, 0, 0, 1, 2, 0, 137, 19, 0, 0, 139, 7, 0, 0, 140, 5, 24, 0, 0, 0, 0, 0, 1, 20, 0, 0, 136, 22, 0, 0, 0, 21, 22, 0, 136, 22, 0, 0, 1, 23, 0, 1, 3, 22, 22, 23, 137, 22, 0, 0, 130, 22, 0, 0, 136, 23, 0, 0, 49, 22, 22, 23, 164, 252, 0, 0, 1, 23, 0, 1, 135, 22, 0, 0, 23, 0, 0, 0, 0, 14, 21, 0, 2, 22, 0, 0, 0, 32, 1, 0, 19, 22, 4, 22, 0, 15, 22, 0, 32, 16, 15, 0, 15, 17, 3, 2, 19, 22, 17, 16, 0, 19, 22, 0, 121, 19, 34, 0, 4, 18, 2, 3, 1, 22, 0, 1, 16, 7, 18, 22, 1, 22, 0, 1, 125, 8, 7, 18, 22, 0, 0, 0, 135, 22, 2, 0, 14, 1, 8, 0, 1, 22, 255, 0, 16, 9, 22, 18, 121, 9, 19, 0, 4, 10, 2, 3, 0, 6, 18, 0, 1, 23, 0, 1, 134, 22, 0, 0, 156, 26, 1, 0, 0, 14, 23, 0, 1, 22, 0, 1, 4, 11, 6, 22, 1, 22, 255, 0, 16, 12, 22, 11, 121, 12, 3, 0, 0, 6, 11, 0, 119, 0, 246, 255, 1, 22, 255, 0, 19, 22, 10, 22, 0, 13, 22, 0, 0, 5, 13, 0, 119, 0, 2, 0, 0, 5, 18, 0, 134, 22, 0, 0, 156, 26, 1, 0, 0, 14, 5, 0, 137, 21, 0, 0, 139, 0, 0, 0, 140, 2, 30, 0, 0, 0, 0, 0, 1, 26, 0, 0, 136, 28, 0, 0, 0, 27, 28, 0, 136, 28, 0, 0, 25, 28, 28, 16, 137, 28, 0, 0, 130, 28, 0, 0, 136, 29, 0, 0, 49, 28, 28, 29, 148, 253, 0, 0, 1, 29, 16, 0, 135, 28, 0, 0, 29, 0, 0, 0, 0, 20, 0, 0, 0, 21, 1, 0, 0, 22, 20, 0, 76, 28, 22, 0, 58, 23, 28, 0, 1, 28, 24, 24, 88, 24, 28, 0, 58, 19, 24, 0, 58, 25, 19, 0, 135, 2, 11, 0, 25, 0, 0, 0, 65, 3, 23, 2, 1, 28, 20, 24, 80, 4, 28, 0, 41, 28, 4, 16, 42, 28, 28, 16, 76, 28, 28, 0, 58, 5, 28, 0, 63, 6, 5, 3, 75, 7, 6, 0, 1, 28, 20, 24, 84, 28, 7, 0, 0, 8, 20, 0, 76, 28, 8, 0, 58, 9, 28, 0, 1, 28, 24, 24, 88, 10, 28, 0, 58, 12, 10, 0, 58, 11, 12, 0, 135, 13, 12, 0, 11, 0, 0, 0, 65, 14, 9, 13, 1, 28, 22, 24, 80, 15, 28, 0, 41, 28, 15, 16, 42, 28, 28, 16, 76, 28, 28, 0, 58, 16, 28, 0, 63, 17, 16, 14, 75, 18, 17, 0, 1, 28, 22, 24, 84, 28, 18, 0, 134, 28, 0, 0, 68, 4, 1, 0, 137, 27, 0, 0, 1, 28, 0, 0, 139, 28, 0, 0, 140, 3, 33, 0, 0, 0, 0, 0, 1, 29, 0, 0, 136, 31, 0, 0, 0, 30, 31, 0, 136, 31, 0, 0, 25, 31, 31, 32, 137, 31, 0, 0, 130, 31, 0, 0, 136, 32, 0, 0, 49, 31, 31, 32, 140, 254, 0, 0, 1, 32, 32, 0, 135, 31, 0, 0, 32, 0, 0, 0, 0, 24, 0, 0, 0, 25, 1, 0, 0, 26, 2, 0, 0, 4, 24, 0, 1, 31, 20, 24, 80, 5, 31, 0, 41, 31, 5, 16, 42, 31, 31, 16, 0, 6, 31, 0, 4, 7, 4, 6, 0, 27, 7, 0, 0, 8, 25, 0, 1, 31, 22, 24, 80, 9, 31, 0, 41, 31, 9, 16, 42, 31, 31, 16, 0, 10, 31, 0, 4, 11, 8, 10, 0, 28, 11, 0, 0, 12, 28, 0, 0, 13, 27, 0, 0, 22, 12, 0, 0, 23, 13, 0, 0, 14, 22, 0, 76, 31, 14, 0, 58, 15, 31, 0, 0, 16, 23, 0, 76, 31, 16, 0, 58, 17, 31, 0, 135, 18, 9, 0, 15, 17, 0, 0, 58, 19, 18, 0, 58, 3, 19, 0, 58, 20, 3, 0, 1, 31, 136, 19, 134, 21, 0, 0, 160, 18, 1, 0, 20, 31, 0, 0, 137, 30, 0, 0, 139, 21, 0, 0, 140, 1, 16, 0, 0, 0, 0, 0, 1, 12, 0, 0, 136, 14, 0, 0, 0, 13, 14, 0, 136, 14, 0, 0, 25, 14, 14, 32, 137, 14, 0, 0, 130, 14, 0, 0, 136, 15, 0, 0, 49, 14, 14, 15, 104, 255, 0, 0, 1, 15, 32, 0, 135, 14, 0, 0, 15, 0, 0, 0, 25, 11, 13, 16, 25, 10, 13, 8, 0, 9, 13, 0, 0, 1, 0, 0, 0, 2, 1, 0, 1, 14, 0, 0, 15, 3, 14, 2, 0, 4, 1, 0, 121, 3, 7, 0, 85, 9, 4, 0, 1, 15, 228, 13, 134, 14, 0, 0, 16, 19, 1, 0, 15, 9, 0, 0, 119, 0, 14, 0, 34, 5, 4, 0, 121, 5, 10, 0, 0, 6, 1, 0, 1, 14, 0, 0, 4, 7, 14, 6, 85, 10, 7, 0, 1, 15, 232, 13, 134, 14, 0, 0, 16, 19, 1, 0, 15, 10, 0, 0, 119, 0, 3, 0, 137, 13, 0, 0, 139, 0, 0, 0, 0, 8, 1, 0, 85, 11, 8, 0, 1, 15, 236, 13, 134, 14, 0, 0, 24, 18, 1, 0, 15, 11, 0, 0, 137, 13, 0, 0, 139, 0, 0, 0, 140, 2, 25, 0, 0, 0, 0, 0, 1, 21, 0, 0, 136, 23, 0, 0, 0, 22, 23, 0, 78, 11, 0, 0, 78, 12, 1, 0, 41, 23, 11, 24, 42, 23, 23, 24, 41, 24, 12, 24, 42, 24, 24, 24, 14, 13, 23, 24, 41, 24, 11, 24, 42, 24, 24, 24, 32, 14, 24, 0, 20, 24, 14, 13, 0, 20, 24, 0, 121, 20, 4, 0, 0, 4, 12, 0, 0, 5, 11, 0, 119, 0, 24, 0, 0, 2, 1, 0, 0, 3, 0, 0, 25, 15, 3, 1, 25, 16, 2, 1, 78, 17, 15, 0, 78, 18, 16, 0, 41, 24, 17, 24, 42, 24, 24, 24, 41, 23, 18, 24, 42, 23, 23, 24, 14, 6, 24, 23, 41, 23, 17, 24, 42, 23, 23, 24, 32, 7, 23, 0, 20, 23, 7, 6, 0, 19, 23, 0, 121, 19, 4, 0, 0, 4, 18, 0, 0, 5, 17, 0, 119, 0, 4, 0, 0, 2, 16, 0, 0, 3, 15, 0, 119, 0, 236, 255, 1, 23, 255, 0, 19, 23, 5, 23, 0, 8, 23, 0, 1, 23, 255, 0, 19, 23, 4, 23, 0, 9, 23, 0, 4, 10, 8, 9, 139, 10, 0, 0, 140, 1, 25, 0, 0, 0, 0, 0, 1, 22, 0, 0, 136, 24, 0, 0, 0, 23, 24, 0, 25, 2, 0, 74, 78, 13, 2, 0, 41, 24, 13, 24, 42, 24, 24, 24, 0, 15, 24, 0, 1, 24, 255, 0, 3, 16, 15, 24, 20, 24, 16, 15, 0, 17, 24, 0, 1, 24, 255, 0, 19, 24, 17, 24, 0, 18, 24, 0, 83, 2, 18, 0, 82, 19, 0, 0, 38, 24, 19, 8, 0, 20, 24, 0, 32, 21, 20, 0, 121, 21, 20, 0, 25, 4, 0, 8, 1, 24, 0, 0, 85, 4, 24, 0, 25, 5, 0, 4, 1, 24, 0, 0, 85, 5, 24, 0, 25, 6, 0, 44, 82, 7, 6, 0, 25, 8, 0, 28, 85, 8, 7, 0, 25, 9, 0, 20, 85, 9, 7, 0, 25, 10, 0, 48, 82, 11, 10, 0, 3, 12, 7, 11, 25, 14, 0, 16, 85, 14, 12, 0, 1, 1, 0, 0, 119, 0, 5, 0, 39, 24, 19, 32, 0, 3, 24, 0, 85, 0, 3, 0, 1, 1, 255, 255, 139, 1, 0, 0, 140, 4, 27, 0, 0, 0, 0, 0, 2, 25, 0, 0, 255, 0, 0, 0, 1, 23, 0, 0, 136, 26, 0, 0, 0, 24, 26, 0, 32, 17, 0, 0, 32, 18, 1, 0, 19, 26, 17, 18, 0, 19, 26, 0, 121, 19, 3, 0, 0, 4, 2, 0, 119, 0, 33, 0, 0, 5, 2, 0, 0, 11, 1, 0, 0, 21, 0, 0, 38, 26, 21, 15, 0, 20, 26, 0, 1, 26, 9, 16, 3, 22, 26, 20, 78, 6, 22, 0, 19, 26, 6, 25, 0, 7, 26, 0, 20, 26, 7, 3, 0, 8, 26, 0, 19, 26, 8, 25, 0, 9, 26, 0, 26, 10, 5, 1, 83, 10, 9, 0, 1, 26, 4, 0, 135, 12, 7, 0, 21, 11, 26, 0, 128, 26, 0, 0, 0, 13, 26, 0, 32, 14, 12, 0, 32, 15, 13, 0, 19, 26, 14, 15, 0, 16, 26, 0, 121, 16, 3, 0, 0, 4, 10, 0, 119, 0, 5, 0, 0, 5, 10, 0, 0, 11, 13, 0, 0, 21, 12, 0, 119, 0, 228, 255, 139, 4, 0, 0, 140, 1, 20, 0, 0, 0, 0, 0, 1, 17, 0, 0, 136, 19, 0, 0, 0, 18, 19, 0, 82, 3, 0, 0, 78, 4, 3, 0, 41, 19, 4, 24, 42, 19, 19, 24, 0, 5, 19, 0, 26, 15, 5, 48, 35, 13, 15, 10, 121, 13, 21, 0, 1, 2, 0, 0, 0, 9, 3, 0, 0, 16, 15, 0, 27, 6, 2, 10, 3, 7, 16, 6, 25, 8, 9, 1, 85, 0, 8, 0, 78, 10, 8, 0, 41, 19, 10, 24, 42, 19, 19, 24, 0, 11, 19, 0, 26, 14, 11, 48, 35, 12, 14, 10, 121, 12, 5, 0, 0, 2, 7, 0, 0, 9, 8, 0, 0, 16, 14, 0, 119, 0, 242, 255, 0, 1, 7, 0, 119, 0, 2, 0, 1, 1, 0, 0, 139, 1, 0, 0, 140, 1, 21, 0, 0, 0, 0, 0, 1, 17, 0, 0, 136, 19, 0, 0, 0, 18, 19, 0, 136, 19, 0, 0, 25, 19, 19, 16, 137, 19, 0, 0, 130, 19, 0, 0, 136, 20, 0, 0, 49, 19, 19, 20, 8, 3, 1, 0, 1, 20, 16, 0, 135, 19, 0, 0, 20, 0, 0, 0, 58, 8, 0, 0, 1, 19, 130, 23, 78, 9, 19, 0, 38, 19, 9, 1, 0, 10, 19, 0, 38, 19, 10, 1, 0, 11, 19, 0, 32, 12, 11, 0, 1, 19, 129, 23, 78, 13, 19, 0, 41, 19, 13, 24, 42, 19, 19, 24, 33, 14, 19, 0, 19, 19, 12, 14, 0, 16, 19, 0, 58, 15, 8, 0, 121, 16, 16, 0, 68, 2, 15, 0, 58, 3, 2, 0, 62, 19, 0, 0, 24, 45, 68, 84, 251, 33, 9, 64, 63, 4, 3, 19, 58, 5, 4, 0, 134, 6, 0, 0, 244, 5, 1, 0, 5, 0, 0, 0, 58, 1, 6, 0, 58, 7, 1, 0, 137, 18, 0, 0, 139, 7, 0, 0, 119, 0, 5, 0, 58, 1, 15, 0, 58, 7, 1, 0, 137, 18, 0, 0, 139, 7, 0, 0, 59, 19, 0, 0, 139, 19, 0, 0, 140, 3, 22, 0, 0, 0, 0, 0, 1, 19, 0, 0, 136, 21, 0, 0, 0, 20, 21, 0, 32, 12, 0, 0, 32, 13, 1, 0, 19, 21, 12, 13, 0, 14, 21, 0, 121, 14, 3, 0, 0, 3, 2, 0, 119, 0, 29, 0, 0, 4, 2, 0, 0, 6, 1, 0, 0, 16, 0, 0, 1, 21, 255, 0, 19, 21, 16, 21, 0, 15, 21, 0, 38, 21, 15, 7, 0, 17, 21, 0, 39, 21, 17, 48, 0, 18, 21, 0, 26, 5, 4, 1, 83, 5, 18, 0, 1, 21, 3, 0, 135, 7, 7, 0, 16, 6, 21, 0, 128, 21, 0, 0, 0, 8, 21, 0, 32, 9, 7, 0, 32, 10, 8, 0, 19, 21, 9, 10, 0, 11, 21, 0, 121, 11, 3, 0, 0, 3, 5, 0, 119, 0, 5, 0, 0, 4, 5, 0, 0, 6, 8, 0, 0, 16, 7, 0, 119, 0, 232, 255, 139, 3, 0, 0, 140, 0, 19, 0, 0, 0, 0, 0, 1, 14, 0, 0, 136, 16, 0, 0, 0, 15, 16, 0, 134, 0, 0, 0, 224, 29, 1, 0, 1, 16, 124, 24, 85, 16, 0, 0, 1, 16, 24, 24, 88, 1, 16, 0, 1, 16, 128, 24, 89, 16, 1, 0, 1, 16, 20, 24, 80, 6, 16, 0, 1, 16, 136, 24, 84, 16, 6, 0, 1, 16, 22, 24, 80, 7, 16, 0, 1, 16, 138, 24, 84, 16, 7, 0, 1, 16, 28, 24, 80, 8, 16, 0, 1, 16, 140, 24, 84, 16, 8, 0, 1, 16, 30, 24, 80, 9, 16, 0, 1, 16, 142, 24, 84, 16, 9, 0, 1, 16, 128, 23, 78, 10, 16, 0, 38, 16, 10, 1, 0, 11, 16, 0, 38, 16, 11, 1, 0, 12, 16, 0, 1, 16, 149, 24, 83, 16, 12, 0, 1, 16, 72, 24, 78, 13, 16, 0, 1, 16, 150, 24, 83, 16, 13, 0, 1, 16, 128, 23, 78, 2, 16, 0, 38, 16, 2, 1, 0, 3, 16, 0, 38, 16, 3, 1, 0, 4, 16, 0, 1, 16, 2, 0, 1, 17, 120, 24, 1, 18, 36, 0, 135, 5, 13, 0, 16, 17, 18, 4, 139, 0, 0, 0, 140, 0, 10, 0, 0, 0, 0, 0, 1, 6, 0, 0, 136, 8, 0, 0, 0, 7, 8, 0, 136, 8, 0, 0, 25, 8, 8, 16, 137, 8, 0, 0, 130, 8, 0, 0, 136, 9, 0, 0, 49, 8, 8, 9, 84, 5, 1, 0, 1, 9, 16, 0, 135, 8, 0, 0, 9, 0, 0, 0, 25, 5, 7, 8, 0, 4, 7, 0, 134, 0, 0, 0, 244, 11, 1, 0, 1, 8, 250, 0, 15, 1, 0, 8, 120, 1, 3, 0, 137, 7, 0, 0, 139, 0, 0, 0, 1, 8, 148, 23, 1, 9, 0, 0, 85, 8, 9, 0, 1, 9, 152, 23, 1, 8, 0, 0, 83, 9, 8, 0, 1, 9, 108, 13, 134, 8, 0, 0, 24, 18, 1, 0, 9, 4, 0, 0, 1, 8, 128, 23, 78, 2, 8, 0, 38, 8, 2, 1, 0, 3, 8, 0, 121, 3, 4, 0, 134, 8, 0, 0, 92, 24, 1, 0, 119, 0, 3, 0, 134, 8, 0, 0, 20, 22, 1, 0, 1, 9, 138, 13, 134, 8, 0, 0, 24, 18, 1, 0, 9, 5, 0, 0, 134, 8, 0, 0, 180, 32, 1, 0, 1, 9, 10, 0, 134, 8, 0, 0, 176, 25, 1, 0, 9, 0, 0, 0, 119, 0, 252, 255, 140, 1, 20, 0, 0, 0, 0, 0, 1, 16, 0, 0, 136, 18, 0, 0, 0, 17, 18, 0, 136, 18, 0, 0, 25, 18, 18, 16, 137, 18, 0, 0, 130, 18, 0, 0, 136, 19, 0, 0, 49, 18, 18, 19, 48, 6, 1, 0, 1, 19, 16, 0, 135, 18, 0, 0, 19, 0, 0, 0, 58, 1, 0, 0, 58, 8, 1, 0, 58, 9, 8, 0, 62, 18, 0, 0, 24, 45, 68, 84, 251, 33, 9, 192, 71, 10, 9, 18, 120, 10, 2, 0, 119, 0, 10, 0, 58, 11, 1, 0, 58, 12, 11, 0, 62, 18, 0, 0, 24, 45, 68, 84, 251, 33, 25, 64, 63, 13, 12, 18, 58, 14, 13, 0, 58, 1, 14, 0, 119, 0, 240, 255, 58, 15, 1, 0, 58, 2, 15, 0, 62, 18, 0, 0, 24, 45, 68, 84, 251, 33, 9, 64, 73, 3, 2, 18, 58, 4, 1, 0, 120, 3, 2, 0, 119, 0, 9, 0, 58, 5, 4, 0, 62, 18, 0, 0, 24, 45, 68, 84, 251, 33, 25, 64, 64, 6, 5, 18, 58, 7, 6, 0, 58, 1, 7, 0, 119, 0, 240, 255, 137, 17, 0, 0, 139, 4, 0, 0, 140, 1, 7, 0, 0, 0, 0, 0, 25, 5, 0, 15, 38, 5, 5, 240, 0, 0, 5, 0, 130, 5, 1, 0, 82, 1, 5, 0, 3, 3, 1, 0, 1, 5, 0, 0, 15, 5, 5, 0, 15, 6, 3, 1, 19, 5, 5, 6, 34, 6, 3, 0, 20, 5, 5, 6, 121, 5, 7, 0, 135, 5, 14, 0, 1, 6, 12, 0, 135, 5, 15, 0, 6, 0, 0, 0, 1, 5, 255, 255, 139, 5, 0, 0, 130, 5, 1, 0, 85, 5, 3, 0, 135, 4, 16, 0, 47, 5, 4, 3, 84, 7, 1, 0, 135, 5, 17, 0, 32, 5, 5, 0, 121, 5, 8, 0, 130, 5, 1, 0, 85, 5, 1, 0, 1, 6, 12, 0, 135, 5, 15, 0, 6, 0, 0, 0, 1, 5, 255, 255, 139, 5, 0, 0, 139, 1, 0, 0, 140, 5, 24, 0, 0, 0, 0, 0, 1, 20, 0, 0, 136, 22, 0, 0, 0, 21, 22, 0, 136, 22, 0, 0, 25, 22, 22, 32, 137, 22, 0, 0, 130, 22, 0, 0, 136, 23, 0, 0, 49, 22, 22, 23, 148, 7, 1, 0, 1, 23, 32, 0, 135, 22, 0, 0, 23, 0, 0, 0, 0, 5, 21, 0, 0, 15, 0, 0, 0, 16, 1, 0, 0, 17, 2, 0, 0, 18, 3, 0, 0, 19, 4, 0, 0, 6, 15, 0, 134, 22, 0, 0, 156, 93, 0, 0, 5, 6, 0, 0, 82, 7, 5, 0, 25, 8, 5, 4, 82, 9, 8, 0, 0, 10, 16, 0, 0, 11, 17, 0, 0, 12, 18, 0, 0, 13, 19, 0, 134, 14, 0, 0, 80, 148, 0, 0, 7, 9, 10, 11, 12, 13, 0, 0, 137, 21, 0, 0, 139, 14, 0, 0, 140, 0, 11, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 136, 9, 0, 0, 25, 9, 9, 16, 137, 9, 0, 0, 130, 9, 0, 0, 136, 10, 0, 0, 49, 9, 9, 10, 44, 8, 1, 0, 1, 10, 16, 0, 135, 9, 0, 0, 10, 0, 0, 0, 0, 6, 8, 0, 1, 10, 63, 12, 134, 9, 0, 0, 24, 18, 1, 0, 10, 6, 0, 0, 1, 9, 9, 0, 78, 1, 9, 0, 38, 9, 1, 1, 0, 2, 9, 0, 121, 2, 6, 0, 1, 0, 12, 0, 0, 5, 0, 0, 137, 8, 0, 0, 139, 5, 0, 0, 119, 0, 23, 0, 1, 9, 240, 24, 82, 3, 9, 0, 25, 4, 3, 1, 1, 9, 240, 24, 85, 9, 4, 0, 134, 9, 0, 0, 100, 30, 1, 0, 1, 10, 15, 0, 134, 9, 0, 0, 148, 12, 1, 0, 10, 0, 0, 0, 1, 10, 12, 0, 134, 9, 0, 0, 148, 12, 1, 0, 10, 0, 0, 0, 1, 9, 9, 0, 1, 10, 1, 0, 83, 9, 10, 0, 1, 0, 0, 0, 0, 5, 0, 0, 137, 8, 0, 0, 139, 5, 0, 0, 1, 10, 0, 0, 139, 10, 0, 0, 140, 1, 17, 0, 0, 0, 0, 0, 1, 13, 0, 0, 136, 15, 0, 0, 0, 14, 15, 0, 136, 15, 0, 0, 25, 15, 15, 16, 137, 15, 0, 0, 130, 15, 0, 0, 136, 16, 0, 0, 49, 15, 15, 16, 4, 9, 1, 0, 1, 16, 16, 0, 135, 15, 0, 0, 16, 0, 0, 0, 0, 4, 0, 0, 1, 15, 130, 23, 78, 5, 15, 0, 38, 15, 5, 1, 0, 6, 15, 0, 38, 15, 6, 1, 0, 7, 15, 0, 32, 8, 7, 0, 1, 15, 129, 23, 78, 9, 15, 0, 41, 15, 9, 24, 42, 15, 15, 24, 33, 10, 15, 0, 19, 15, 8, 10, 0, 12, 15, 0, 0, 11, 4, 0, 121, 12, 8, 0, 1, 15, 184, 11, 4, 2, 15, 11, 0, 1, 2, 0, 0, 3, 1, 0, 137, 14, 0, 0, 139, 3, 0, 0, 119, 0, 5, 0, 0, 1, 11, 0, 0, 3, 1, 0, 137, 14, 0, 0, 139, 3, 0, 0, 1, 15, 0, 0, 139, 15, 0, 0, 140, 3, 17, 0, 0, 0, 0, 0, 1, 13, 0, 0, 136, 15, 0, 0, 0, 14, 15, 0, 136, 15, 0, 0, 25, 15, 15, 16, 137, 15, 0, 0, 130, 15, 0, 0, 136, 16, 0, 0, 49, 15, 15, 16, 184, 9, 1, 0, 1, 16, 16, 0, 135, 15, 0, 0, 16, 0, 0, 0, 0, 6, 0, 0, 0, 7, 1, 0, 58, 8, 2, 0, 0, 9, 6, 0, 134, 10, 0, 0, 200, 8, 1, 0, 9, 0, 0, 0, 2, 15, 0, 0, 255, 255, 0, 0, 19, 15, 10, 15, 0, 11, 15, 0, 1, 15, 20, 24, 84, 15, 11, 0, 0, 12, 7, 0, 2, 15, 0, 0, 255, 255, 0, 0, 19, 15, 12, 15, 0, 3, 15, 0, 1, 15, 22, 24, 84, 15, 3, 0, 58, 4, 8, 0, 134, 5, 0, 0, 204, 2, 1, 0, 4, 0, 0, 0, 1, 15, 24, 24, 89, 15, 5, 0, 134, 15, 0, 0, 68, 4, 1, 0, 137, 14, 0, 0, 139, 0, 0, 0, 140, 1, 15, 0, 0, 0, 0, 0, 1, 11, 0, 0, 136, 13, 0, 0, 0, 12, 13, 0, 136, 13, 0, 0, 25, 13, 13, 16, 137, 13, 0, 0, 130, 13, 0, 0, 136, 14, 0, 0, 49, 13, 13, 14, 108, 10, 1, 0, 1, 14, 16, 0, 135, 13, 0, 0, 14, 0, 0, 0, 0, 1, 0, 0, 134, 4, 0, 0, 224, 29, 1, 0, 0, 3, 4, 0, 134, 5, 0, 0, 224, 29, 1, 0, 0, 6, 3, 0, 4, 7, 5, 6, 0, 8, 1, 0, 18, 9, 8, 7, 120, 9, 12, 0, 1, 13, 148, 23, 82, 10, 13, 0, 33, 2, 10, 0, 121, 2, 3, 0, 134, 13, 0, 0, 24, 5, 1, 0, 1, 14, 10, 0, 134, 13, 0, 0, 176, 25, 1, 0, 14, 0, 0, 0, 119, 0, 239, 255, 137, 12, 0, 0, 139, 0, 0, 0, 140, 1, 14, 0, 0, 0, 0, 0, 1, 10, 0, 0, 136, 12, 0, 0, 0, 11, 12, 0, 136, 12, 0, 0, 25, 12, 12, 16, 137, 12, 0, 0, 130, 12, 0, 0, 136, 13, 0, 0, 49, 12, 12, 13, 8, 11, 1, 0, 1, 13, 16, 0, 135, 12, 0, 0, 13, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1, 0, 1, 12, 2, 0, 83, 2, 12, 0, 25, 3, 2, 1, 1, 12, 2, 0, 83, 3, 12, 0, 25, 4, 2, 2, 1, 12, 2, 0, 83, 4, 12, 0, 25, 5, 2, 3, 1, 12, 17, 0, 83, 5, 12, 0, 25, 6, 2, 32, 1, 12, 3, 0, 83, 6, 12, 0, 25, 7, 2, 33, 1, 12, 3, 0, 83, 7, 12, 0, 25, 8, 2, 34, 1, 12, 3, 0, 83, 8, 12, 0, 25, 9, 2, 35, 1, 12, 3, 0, 83, 9, 12, 0, 137, 11, 0, 0, 139, 0, 0, 0, 140, 1, 10, 0, 0, 0, 0, 0, 1, 6, 0, 0, 136, 8, 0, 0, 0, 7, 8, 0, 136, 8, 0, 0, 25, 8, 8, 16, 137, 8, 0, 0, 130, 8, 0, 0, 136, 9, 0, 0, 49, 8, 8, 9, 176, 11, 1, 0, 1, 9, 16, 0, 135, 8, 0, 0, 9, 0, 0, 0, 25, 5, 7, 8, 0, 4, 7, 0, 0, 1, 0, 0, 0, 2, 1, 0, 85, 4, 2, 0, 1, 9, 202, 13, 134, 8, 0, 0, 16, 19, 1, 0, 9, 4, 0, 0, 0, 3, 1, 0, 85, 5, 3, 0, 1, 9, 206, 13, 134, 8, 0, 0, 24, 18, 1, 0, 9, 5, 0, 0, 137, 7, 0, 0, 139, 0, 0, 0, 140, 0, 12, 0, 0, 0, 0, 0, 1, 8, 0, 0, 136, 10, 0, 0, 0, 9, 10, 0, 136, 10, 0, 0, 25, 10, 10, 16, 137, 10, 0, 0, 130, 10, 0, 0, 136, 11, 0, 0, 49, 10, 10, 11, 48, 12, 1, 0, 1, 11, 16, 0, 135, 10, 0, 0, 11, 0, 0, 0, 1, 10, 152, 23, 78, 1, 10, 0, 38, 10, 1, 1, 0, 2, 10, 0, 121, 2, 14, 0, 134, 3, 0, 0, 224, 29, 1, 0, 1, 10, 148, 23, 82, 4, 10, 0, 4, 5, 3, 4, 2, 10, 0, 0, 208, 126, 1, 0, 4, 6, 10, 5, 0, 0, 6, 0, 0, 7, 0, 0, 137, 9, 0, 0, 139, 7, 0, 0, 119, 0, 6, 0, 2, 0, 0, 0, 208, 126, 1, 0, 0, 7, 0, 0, 137, 9, 0, 0, 139, 7, 0, 0, 1, 10, 0, 0, 139, 10, 0, 0, 140, 1, 13, 0, 0, 0, 0, 0, 1, 9, 0, 0, 136, 11, 0, 0, 0, 10, 11, 0, 136, 11, 0, 0, 25, 11, 11, 16, 137, 11, 0, 0, 130, 11, 0, 0, 136, 12, 0, 0, 49, 11, 11, 12, 208, 12, 1, 0, 1, 12, 16, 0, 135, 11, 0, 0, 12, 0, 0, 0, 0, 2, 0, 0, 0, 3, 2, 0, 1, 11, 136, 23, 82, 4, 11, 0, 3, 5, 4, 3, 1, 11, 136, 23, 85, 11, 5, 0, 1, 11, 136, 23, 82, 6, 11, 0, 34, 7, 6, 0, 1, 11, 0, 0, 125, 1, 7, 11, 5, 0, 0, 0, 1, 11, 136, 23, 85, 11, 1, 0, 0, 8, 2, 0, 134, 11, 0, 0, 44, 255, 0, 0, 8, 0, 0, 0, 137, 10, 0, 0, 139, 0, 0, 0, 140, 3, 16, 0, 0, 0, 0, 0, 1, 13, 0, 0, 136, 15, 0, 0, 0, 14, 15, 0, 25, 6, 0, 16, 82, 7, 6, 0, 25, 8, 0, 20, 82, 9, 8, 0, 0, 10, 9, 0, 4, 11, 7, 10, 16, 12, 2, 11, 125, 3, 12, 2, 11, 0, 0, 0, 135, 15, 6, 0, 9, 1, 3, 0, 82, 4, 8, 0, 3, 5, 4, 3, 85, 8, 5, 0, 139, 2, 0, 0, 140, 1, 11, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 136, 9, 0, 0, 25, 9, 9, 16, 137, 9, 0, 0, 130, 9, 0, 0, 136, 10, 0, 0, 49, 9, 9, 10, 176, 13, 1, 0, 1, 10, 16, 0, 135, 9, 0, 0, 10, 0, 0, 0, 0, 6, 8, 0, 25, 1, 0, 60, 82, 2, 1, 0, 134, 3, 0, 0, 184, 31, 1, 0, 2, 0, 0, 0, 85, 6, 3, 0, 1, 9, 6, 0, 135, 4, 18, 0, 9, 6, 0, 0, 134, 5, 0, 0, 20, 25, 1, 0, 4, 0, 0, 0, 137, 8, 0, 0, 139, 5, 0, 0, 140, 0, 7, 0, 0, 0, 0, 0, 1, 3, 0, 0, 136, 5, 0, 0, 0, 4, 5, 0, 136, 5, 0, 0, 25, 5, 5, 16, 137, 5, 0, 0, 130, 5, 0, 0, 136, 6, 0, 0, 49, 5, 5, 6, 40, 14, 1, 0, 1, 6, 16, 0, 135, 5, 0, 0, 6, 0, 0, 0, 0, 2, 4, 0, 134, 0, 0, 0, 244, 11, 1, 0, 85, 2, 0, 0, 1, 6, 167, 13, 134, 5, 0, 0, 24, 18, 1, 0, 6, 2, 0, 0, 134, 1, 0, 0, 244, 11, 1, 0, 134, 5, 0, 0, 48, 10, 1, 0, 1, 0, 0, 0, 137, 4, 0, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 2, 128, 23, 1, 3, 0, 0, 83, 2, 3, 0, 1, 3, 96, 24, 61, 2, 0, 0, 123, 20, 64, 65, 89, 3, 2, 0, 1, 2, 100, 24, 59, 3, 76, 13, 89, 2, 3, 0, 1, 3, 104, 24, 61, 2, 0, 0, 143, 194, 117, 61, 89, 3, 2, 0, 1, 2, 108, 24, 61, 3, 0, 0, 154, 153, 153, 62, 89, 2, 3, 0, 1, 3, 112, 24, 61, 2, 0, 0, 143, 194, 117, 61, 89, 3, 2, 0, 1, 2, 116, 24, 61, 3, 0, 0, 205, 204, 204, 62, 89, 2, 3, 0, 1, 3, 40, 24, 1, 2, 244, 1, 84, 3, 2, 0, 1, 2, 92, 24, 1, 3, 70, 0, 84, 2, 3, 0, 1, 3, 94, 24, 1, 2, 50, 0, 84, 3, 2, 0, 134, 2, 0, 0, 236, 27, 1, 0, 134, 2, 0, 0, 28, 16, 1, 0, 139, 0, 0, 0, 140, 1, 11, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 136, 9, 0, 0, 25, 9, 9, 16, 137, 9, 0, 0, 130, 9, 0, 0, 136, 10, 0, 0, 49, 9, 9, 10, 84, 15, 1, 0, 1, 10, 16, 0, 135, 9, 0, 0, 10, 0, 0, 0, 0, 6, 8, 0, 38, 9, 0, 1, 0, 2, 9, 0, 0, 1, 2, 0, 0, 3, 1, 0, 38, 9, 3, 1, 0, 4, 9, 0, 38, 9, 4, 1, 0, 5, 9, 0, 85, 6, 5, 0, 1, 10, 58, 4, 134, 9, 0, 0, 24, 18, 1, 0, 10, 6, 0, 0, 137, 8, 0, 0, 139, 0, 0, 0, 140, 0, 11, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 136, 9, 0, 0, 25, 9, 9, 16, 137, 9, 0, 0, 130, 9, 0, 0, 136, 10, 0, 0, 49, 9, 9, 10, 208, 15, 1, 0, 1, 10, 16, 0, 135, 9, 0, 0, 10, 0, 0, 0, 1, 9, 129, 23, 78, 1, 9, 0, 41, 9, 1, 24, 42, 9, 9, 24, 33, 2, 9, 0, 1, 9, 20, 24, 80, 3, 9, 0, 41, 9, 3, 16, 42, 9, 9, 16, 0, 4, 9, 0, 121, 2, 5, 0, 1, 9, 184, 11, 4, 5, 9, 4, 0, 0, 5, 0, 119, 0, 2, 0, 0, 0, 4, 0, 0, 6, 0, 0, 137, 8, 0, 0, 139, 6, 0, 0, 140, 0, 7, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 136, 3, 0, 0, 25, 3, 3, 16, 137, 3, 0, 0, 130, 3, 0, 0, 136, 4, 0, 0, 49, 3, 3, 4, 88, 16, 1, 0, 1, 4, 16, 0, 135, 3, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 1, 4, 152, 12, 134, 3, 0, 0, 24, 18, 1, 0, 4, 0, 0, 0, 1, 4, 47, 0, 1, 5, 0, 0, 1, 6, 1, 0, 134, 3, 0, 0, 224, 208, 0, 0, 4, 5, 6, 0, 1, 6, 70, 0, 1, 5, 0, 0, 1, 4, 1, 0, 134, 3, 0, 0, 104, 197, 0, 0, 6, 5, 4, 0, 1, 4, 126, 0, 1, 5, 0, 0, 1, 6, 1, 0, 134, 3, 0, 0, 32, 194, 0, 0, 4, 5, 6, 0, 1, 6, 90, 0, 1, 5, 0, 0, 1, 4, 1, 0, 134, 3, 0, 0, 56, 191, 0, 0, 6, 5, 4, 0, 137, 2, 0, 0, 139, 0, 0, 0, 140, 1, 11, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 136, 9, 0, 0, 25, 9, 9, 16, 137, 9, 0, 0, 130, 9, 0, 0, 136, 10, 0, 0, 49, 9, 9, 10, 16, 17, 1, 0, 1, 10, 16, 0, 135, 9, 0, 0, 10, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1, 0, 25, 3, 2, 12, 1, 9, 0, 0, 83, 3, 9, 0, 25, 4, 2, 14, 1, 9, 0, 0, 83, 4, 9, 0, 25, 5, 2, 15, 1, 9, 0, 0, 83, 5, 9, 0, 25, 6, 2, 24, 1, 9, 0, 0, 83, 6, 9, 0, 137, 8, 0, 0, 139, 0, 0, 0, 140, 4, 14, 0, 0, 0, 0, 0, 1, 10, 0, 0, 136, 12, 0, 0, 0, 11, 12, 0, 136, 12, 0, 0, 25, 12, 12, 16, 137, 12, 0, 0, 130, 12, 0, 0, 136, 13, 0, 0, 49, 12, 12, 13, 140, 17, 1, 0, 1, 13, 16, 0, 135, 12, 0, 0, 13, 0, 0, 0, 0, 4, 0, 0, 0, 5, 1, 0, 0, 6, 2, 0, 0, 7, 3, 0, 0, 8, 4, 0, 0, 9, 5, 0, 1, 13, 0, 0, 134, 12, 0, 0, 152, 250, 0, 0, 8, 9, 13, 0, 137, 11, 0, 0, 1, 12, 0, 0, 139, 12, 0, 0, 140, 2, 13, 0, 0, 0, 0, 0, 1, 10, 0, 0, 136, 12, 0, 0, 0, 11, 12, 0, 1, 12, 0, 0, 13, 3, 1, 12, 121, 3, 3, 0, 1, 2, 0, 0, 119, 0, 8, 0, 82, 4, 1, 0, 25, 5, 1, 4, 82, 6, 5, 0, 134, 7, 0, 0, 160, 170, 0, 0, 4, 6, 0, 0, 0, 2, 7, 0, 1, 12, 0, 0, 14, 8, 2, 12, 125, 9, 8, 2, 0, 0, 0, 0, 139, 9, 0, 0, 140, 2, 10, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 136, 7, 0, 0, 25, 7, 7, 32, 137, 7, 0, 0, 130, 7, 0, 0, 136, 8, 0, 0, 49, 7, 7, 8, 84, 18, 1, 0, 1, 8, 32, 0, 135, 7, 0, 0, 8, 0, 0, 0, 0, 3, 6, 0, 0, 2, 0, 0, 85, 3, 1, 0, 0, 4, 2, 0, 1, 8, 72, 27, 1, 9, 81, 0, 134, 7, 0, 0, 228, 189, 0, 0, 8, 9, 4, 3, 1, 9, 72, 27, 1, 8, 161, 3, 135, 7, 19, 0, 9, 8, 0, 0, 1, 8, 72, 27, 134, 7, 0, 0, 52, 20, 1, 0, 8, 0, 0, 0, 137, 6, 0, 0, 139, 0, 0, 0, 140, 2, 11, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 136, 9, 0, 0, 25, 9, 9, 16, 137, 9, 0, 0, 130, 9, 0, 0, 136, 10, 0, 0, 49, 9, 9, 10, 220, 18, 1, 0, 1, 10, 16, 0, 135, 9, 0, 0, 10, 0, 0, 0, 58, 2, 0, 0, 0, 3, 1, 0, 58, 4, 2, 0, 1, 9, 24, 24, 88, 5, 9, 0, 63, 6, 5, 4, 1, 9, 24, 24, 89, 9, 6, 0, 134, 9, 0, 0, 68, 4, 1, 0, 137, 8, 0, 0, 1, 9, 0, 0, 139, 9, 0, 0, 140, 2, 10, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 136, 7, 0, 0, 25, 7, 7, 32, 137, 7, 0, 0, 130, 7, 0, 0, 136, 8, 0, 0, 49, 7, 7, 8, 76, 19, 1, 0, 1, 8, 32, 0, 135, 7, 0, 0, 8, 0, 0, 0, 0, 3, 6, 0, 0, 2, 0, 0, 85, 3, 1, 0, 0, 4, 2, 0, 1, 8, 154, 27, 1, 9, 51, 0, 134, 7, 0, 0, 228, 189, 0, 0, 8, 9, 4, 3, 1, 9, 154, 27, 134, 7, 0, 0, 176, 21, 1, 0, 9, 0, 0, 0, 137, 6, 0, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 2, 128, 23, 1, 3, 1, 0, 83, 2, 3, 0, 1, 3, 96, 24, 61, 2, 0, 0, 0, 0, 68, 65, 89, 3, 2, 0, 1, 2, 100, 24, 59, 3, 159, 8, 89, 2, 3, 0, 1, 3, 104, 24, 61, 2, 0, 0, 154, 153, 25, 62, 89, 3, 2, 0, 1, 2, 108, 24, 61, 3, 0, 0, 0, 0, 192, 63, 89, 2, 3, 0, 1, 3, 112, 24, 61, 2, 0, 0, 236, 81, 184, 61, 89, 3, 2, 0, 1, 2, 116, 24, 61, 3, 0, 0, 205, 204, 140, 63, 89, 2, 3, 0, 1, 3, 40, 24, 1, 2, 88, 2, 84, 3, 2, 0, 1, 2, 92, 24, 1, 3, 65, 0, 84, 2, 3, 0, 1, 3, 94, 24, 1, 2, 50, 0, 84, 3, 2, 0, 134, 2, 0, 0, 180, 30, 1, 0, 139, 0, 0, 0, 140, 1, 11, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 136, 9, 0, 0, 25, 9, 9, 16, 137, 9, 0, 0, 130, 9, 0, 0, 136, 10, 0, 0, 49, 9, 9, 10, 112, 20, 1, 0, 1, 10, 16, 0, 135, 9, 0, 0, 10, 0, 0, 0, 0, 1, 0, 0, 1, 9, 128, 23, 78, 2, 9, 0, 38, 9, 2, 1, 0, 3, 9, 0, 38, 9, 3, 1, 0, 4, 9, 0, 0, 5, 1, 0, 1, 9, 1, 0, 135, 6, 20, 0, 9, 4, 5, 0, 137, 8, 0, 0, 139, 0, 0, 0, 140, 4, 7, 0, 0, 0, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 136, 6, 0, 0, 25, 6, 6, 16, 137, 6, 0, 0, 0, 4, 5, 0, 134, 6, 0, 0, 168, 117, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 137, 5, 0, 0, 106, 6, 4, 4, 129, 6, 0, 0, 82, 6, 4, 0, 139, 6, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 136, 6, 0, 0, 25, 6, 6, 16, 137, 6, 0, 0, 130, 6, 0, 0, 136, 7, 0, 0, 49, 6, 6, 7, 36, 21, 1, 0, 1, 7, 16, 0, 135, 6, 0, 0, 7, 0, 0, 0, 0, 3, 5, 0, 0, 1, 0, 0, 0, 2, 1, 0, 85, 3, 2, 0, 1, 7, 127, 2, 134, 6, 0, 0, 24, 18, 1, 0, 7, 3, 0, 0, 137, 5, 0, 0, 139, 0, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 136, 6, 0, 0, 25, 6, 6, 16, 137, 6, 0, 0, 130, 6, 0, 0, 136, 7, 0, 0, 49, 6, 6, 7, 136, 21, 1, 0, 1, 7, 16, 0, 135, 6, 0, 0, 7, 0, 0, 0, 0, 3, 5, 0, 0, 1, 0, 0, 0, 2, 1, 0, 85, 3, 2, 0, 1, 7, 149, 2, 134, 6, 0, 0, 24, 18, 1, 0, 7, 3, 0, 0, 137, 5, 0, 0, 139, 0, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 136, 6, 0, 0, 25, 6, 6, 16, 137, 6, 0, 0, 130, 6, 0, 0, 136, 7, 0, 0, 49, 6, 6, 7, 236, 21, 1, 0, 1, 7, 16, 0, 135, 6, 0, 0, 7, 0, 0, 0, 0, 3, 5, 0, 0, 1, 0, 0, 0, 2, 1, 0, 85, 3, 2, 0, 1, 7, 137, 2, 134, 6, 0, 0, 24, 18, 1, 0, 7, 3, 0, 0, 137, 5, 0, 0, 139, 0, 0, 0, 140, 0, 7, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 136, 3, 0, 0, 25, 3, 3, 16, 137, 3, 0, 0, 130, 3, 0, 0, 136, 4, 0, 0, 49, 3, 3, 4, 80, 22, 1, 0, 1, 4, 16, 0, 135, 3, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 134, 3, 0, 0, 52, 32, 1, 0, 1, 4, 128, 12, 134, 3, 0, 0, 24, 18, 1, 0, 4, 0, 0, 0, 1, 4, 90, 0, 1, 5, 0, 0, 1, 6, 1, 0, 134, 3, 0, 0, 224, 208, 0, 0, 4, 5, 6, 0, 134, 3, 0, 0, 88, 25, 1, 0, 137, 2, 0, 0, 139, 0, 0, 0, 140, 0, 6, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 136, 4, 0, 0, 25, 4, 4, 16, 137, 4, 0, 0, 130, 4, 0, 0, 136, 5, 0, 0, 49, 4, 4, 5, 208, 22, 1, 0, 1, 5, 16, 0, 135, 4, 0, 0, 5, 0, 0, 0, 0, 1, 3, 0, 1, 4, 152, 23, 1, 5, 1, 0, 83, 4, 5, 0, 134, 0, 0, 0, 224, 29, 1, 0, 1, 5, 148, 23, 85, 5, 0, 0, 1, 4, 152, 13, 134, 5, 0, 0, 24, 18, 1, 0, 4, 1, 0, 0, 137, 3, 0, 0, 139, 0, 0, 0, 140, 1, 5, 0, 0, 0, 0, 0, 130, 2, 2, 0, 1, 3, 255, 0, 19, 3, 0, 3, 90, 1, 2, 3, 34, 2, 1, 8, 121, 2, 2, 0, 139, 1, 0, 0, 130, 2, 2, 0, 42, 3, 0, 8, 1, 4, 255, 0, 19, 3, 3, 4, 90, 1, 2, 3, 34, 2, 1, 8, 121, 2, 3, 0, 25, 2, 1, 8, 139, 2, 0, 0, 130, 2, 2, 0, 42, 3, 0, 16, 1, 4, 255, 0, 19, 3, 3, 4, 90, 1, 2, 3, 34, 2, 1, 8, 121, 2, 3, 0, 25, 2, 1, 16, 139, 2, 0, 0, 130, 2, 2, 0, 43, 3, 0, 24, 90, 2, 2, 3, 25, 2, 2, 24, 139, 2, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 136, 6, 0, 0, 25, 6, 6, 16, 137, 6, 0, 0, 130, 6, 0, 0, 136, 7, 0, 0, 49, 6, 6, 7, 196, 23, 1, 0, 1, 7, 16, 0, 135, 6, 0, 0, 7, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1, 0, 1, 6, 136, 23, 85, 6, 2, 0, 0, 3, 1, 0, 134, 6, 0, 0, 116, 11, 1, 0, 3, 0, 0, 0, 137, 5, 0, 0, 139, 0, 0, 0, 140, 0, 7, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0 ], eb + 61440);
 HEAPU8.set([ 136, 3, 0, 0, 25, 3, 3, 16, 137, 3, 0, 0, 130, 3, 0, 0, 136, 4, 0, 0, 49, 3, 3, 4, 40, 24, 1, 0, 1, 4, 16, 0, 135, 3, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 1, 4, 152, 12, 134, 3, 0, 0, 24, 18, 1, 0, 4, 0, 0, 0, 1, 4, 29, 0, 1, 5, 0, 0, 1, 6, 1, 0, 134, 3, 0, 0, 152, 200, 0, 0, 4, 5, 6, 0, 137, 2, 0, 0, 139, 0, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 136, 3, 0, 0, 25, 3, 3, 16, 137, 3, 0, 0, 130, 3, 0, 0, 136, 4, 0, 0, 49, 3, 3, 4, 152, 24, 1, 0, 1, 4, 16, 0, 135, 3, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 134, 3, 0, 0, 52, 32, 1, 0, 1, 4, 163, 10, 134, 3, 0, 0, 24, 18, 1, 0, 4, 0, 0, 0, 137, 2, 0, 0, 139, 0, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 136, 3, 0, 0, 25, 3, 3, 16, 137, 3, 0, 0, 130, 3, 0, 0, 136, 4, 0, 0, 49, 3, 3, 4, 248, 24, 1, 0, 1, 4, 16, 0, 135, 3, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 1, 4, 81, 4, 134, 3, 0, 0, 24, 18, 1, 0, 4, 0, 0, 0, 137, 2, 0, 0, 139, 0, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 1, 7, 0, 240, 16, 2, 7, 0, 121, 2, 8, 0, 1, 7, 0, 0, 4, 3, 7, 0, 134, 4, 0, 0, 232, 28, 1, 0, 85, 4, 3, 0, 1, 1, 255, 255, 119, 0, 2, 0, 0, 1, 0, 0, 139, 1, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 136, 3, 0, 0, 25, 3, 3, 16, 137, 3, 0, 0, 130, 3, 0, 0, 136, 4, 0, 0, 49, 3, 3, 4, 148, 25, 1, 0, 1, 4, 16, 0, 135, 3, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 1, 4, 101, 4, 134, 3, 0, 0, 24, 18, 1, 0, 4, 0, 0, 0, 137, 2, 0, 0, 139, 0, 0, 0, 140, 1, 7, 0, 0, 0, 0, 0, 1, 3, 0, 0, 136, 5, 0, 0, 0, 4, 5, 0, 136, 5, 0, 0, 25, 5, 5, 16, 137, 5, 0, 0, 130, 5, 0, 0, 136, 6, 0, 0, 49, 5, 5, 6, 236, 25, 1, 0, 1, 6, 16, 0, 135, 5, 0, 0, 6, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1, 0, 135, 5, 21, 0, 2, 0, 0, 0, 137, 4, 0, 0, 139, 0, 0, 0, 140, 2, 8, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 136, 6, 0, 0, 25, 6, 6, 16, 137, 6, 0, 0, 130, 6, 0, 0, 136, 7, 0, 0, 49, 6, 6, 7, 64, 26, 1, 0, 1, 7, 16, 0, 135, 6, 0, 0, 7, 0, 0, 0, 0, 2, 0, 0, 0, 3, 1, 0, 137, 5, 0, 0, 139, 0, 0, 0, 140, 2, 8, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 136, 6, 0, 0, 25, 6, 6, 16, 137, 6, 0, 0, 130, 6, 0, 0, 136, 7, 0, 0, 49, 6, 6, 7, 140, 26, 1, 0, 1, 7, 16, 0, 135, 6, 0, 0, 7, 0, 0, 0, 0, 2, 0, 0, 0, 3, 1, 0, 137, 5, 0, 0, 139, 0, 0, 0, 140, 3, 9, 0, 0, 0, 0, 0, 1, 6, 0, 0, 136, 8, 0, 0, 0, 7, 8, 0, 82, 3, 0, 0, 38, 8, 3, 32, 0, 4, 8, 0, 32, 5, 4, 0, 121, 5, 4, 0, 134, 8, 0, 0, 80, 179, 0, 0, 1, 2, 0, 0, 139, 0, 0, 0, 140, 1, 6, 0, 0, 0, 0, 0, 1, 3, 0, 0, 136, 5, 0, 0, 0, 4, 5, 0, 127, 5, 0, 0, 87, 5, 0, 0, 127, 5, 0, 0, 82, 1, 5, 0, 127, 5, 0, 0, 106, 2, 5, 4, 129, 2, 0, 0, 139, 1, 0, 0, 140, 1, 6, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 136, 4, 0, 0, 25, 4, 4, 16, 137, 4, 0, 0, 130, 4, 0, 0, 136, 5, 0, 0, 49, 4, 4, 5, 68, 27, 1, 0, 1, 5, 16, 0, 135, 4, 0, 0, 5, 0, 0, 0, 0, 1, 0, 0, 137, 3, 0, 0, 139, 0, 0, 0, 140, 2, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 1, 7, 0, 0, 13, 3, 0, 7, 121, 3, 3, 0, 1, 2, 0, 0, 119, 0, 6, 0, 1, 7, 0, 0, 134, 4, 0, 0, 184, 174, 0, 0, 0, 1, 7, 0, 0, 2, 4, 0, 139, 2, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 134, 1, 0, 0, 68, 30, 1, 0, 1, 7, 188, 0, 3, 2, 1, 7, 82, 3, 2, 0, 134, 4, 0, 0, 12, 211, 0, 0, 0, 3, 0, 0, 139, 4, 0, 0, 140, 4, 8, 0, 0, 0, 0, 0, 4, 4, 0, 2, 4, 5, 1, 3, 4, 6, 1, 3, 16, 7, 0, 2, 4, 5, 6, 7, 129, 5, 0, 0, 139, 4, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 206, 27, 1, 4, 9, 0, 134, 2, 0, 0, 4, 26, 1, 0, 3, 4, 0, 0, 1, 4, 207, 27, 1, 3, 17, 0, 134, 2, 0, 0, 4, 26, 1, 0, 4, 3, 0, 0, 1, 3, 209, 27, 1, 4, 5, 0, 134, 2, 0, 0, 4, 26, 1, 0, 3, 4, 0, 0, 1, 4, 208, 27, 1, 3, 33, 0, 134, 2, 0, 0, 4, 26, 1, 0, 4, 3, 0, 0, 139, 0, 0, 0, 140, 2, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 32, 3, 1, 0, 134, 4, 0, 0, 224, 30, 1, 0, 0, 0, 0, 0, 125, 2, 3, 0, 4, 0, 0, 0, 139, 2, 0, 0, 140, 4, 6, 0, 0, 0, 0, 0, 1, 5, 0, 0, 134, 4, 0, 0, 168, 117, 0, 0, 0, 1, 2, 3, 5, 0, 0, 0, 139, 4, 0, 0, 140, 4, 8, 0, 0, 0, 0, 0, 3, 4, 0, 2, 3, 6, 1, 3, 16, 7, 4, 0, 3, 5, 6, 7, 129, 5, 0, 0, 139, 4, 0, 0, 140, 2, 6, 0, 0, 0, 0, 0, 1, 3, 0, 0, 136, 5, 0, 0, 0, 4, 5, 0, 134, 2, 0, 0, 192, 17, 1, 0, 0, 1, 0, 0, 139, 2, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 134, 0, 0, 0, 36, 30, 1, 0, 25, 1, 0, 64, 139, 1, 0, 0, 140, 0, 8, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 50, 0, 1, 4, 100, 0, 1, 5, 1, 0, 1, 6, 152, 58, 1, 7, 10, 0, 134, 2, 0, 0, 0, 0, 0, 0, 3, 4, 5, 6, 7, 0, 0, 0, 1, 2, 205, 27, 1, 7, 1, 0, 83, 2, 7, 0, 1, 7, 0, 0, 139, 7, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 134, 2, 0, 0, 40, 31, 1, 0, 134, 2, 0, 0, 140, 30, 1, 0, 139, 0, 0, 0, 140, 2, 2, 0, 0, 0, 0, 0, 137, 0, 0, 0, 132, 0, 0, 1, 139, 0, 0, 0, 140, 2, 6, 0, 0, 0, 0, 0, 1, 3, 0, 0, 136, 5, 0, 0, 0, 4, 5, 0, 134, 2, 0, 0, 220, 215, 0, 0, 0, 1, 0, 0, 139, 2, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 3, 14, 134, 2, 0, 0, 176, 21, 1, 0, 3, 0, 0, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 1, 3, 0, 0, 135, 0, 22, 0, 3, 0, 0, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 134, 0, 0, 0, 152, 32, 1, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 134, 0, 0, 0, 152, 32, 1, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 134, 0, 0, 0, 152, 32, 1, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 190, 4, 134, 2, 0, 0, 76, 21, 1, 0, 3, 0, 0, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 120, 24, 134, 2, 0, 0, 204, 10, 1, 0, 3, 0, 0, 0, 139, 0, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 214, 27, 1, 4, 29, 0, 134, 2, 0, 0, 4, 26, 1, 0, 3, 4, 0, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 255, 0, 19, 1, 0, 1, 41, 1, 1, 24, 42, 2, 0, 8, 1, 3, 255, 0, 19, 2, 2, 3, 41, 2, 2, 16, 20, 1, 1, 2, 42, 2, 0, 16, 1, 3, 255, 0, 19, 2, 2, 3, 41, 2, 2, 8, 20, 1, 1, 2, 43, 2, 0, 24, 20, 1, 1, 2, 139, 1, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 128, 23, 134, 2, 0, 0, 212, 16, 1, 0, 3, 0, 0, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 60, 27, 135, 2, 23, 0, 3, 0, 0, 0, 1, 2, 68, 27, 139, 2, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 2, 252, 26, 139, 2, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 60, 27, 135, 2, 24, 0, 3, 0, 0, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 139, 0, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 1, 3, 0, 0, 139, 3, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 139, 0, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 139, 0, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 139, 0, 0, 0, 140, 3, 5, 0, 0, 0, 0, 0, 1, 4, 1, 0, 135, 3, 25, 0, 4, 0, 0, 0, 1, 3, 0, 0, 139, 3, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 139, 0, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 2, 124, 0, 139, 2, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 139, 0, 0, 0, 140, 1, 3, 0, 0, 0, 0, 0, 1, 2, 0, 0, 135, 1, 26, 0, 2, 0, 0, 0, 1, 1, 0, 0, 139, 1, 0, 0 ], eb + 71680);
 var relocations = [];
 relocations = relocations.concat([ 80, 124, 128, 132, 136, 140, 144, 148, 152, 156, 160, 164, 168, 172, 176, 180, 184, 188, 192, 196, 200, 204, 208, 212, 216, 220, 224, 228, 232, 236, 240, 244, 248, 252, 256, 260, 264, 268, 272, 276, 280, 284, 288, 292, 296, 300, 304, 308, 312, 316, 320, 324, 328, 332, 336, 340, 344, 348, 352, 356, 360, 364, 368, 372, 376, 380, 384, 388, 392, 396, 400, 404, 408, 412, 416, 420, 424, 428, 432, 436, 440, 12192, 12892, 14088, 14396, 14576, 14680, 14980, 15156, 15240, 15344, 16564, 16628, 16696, 16788, 16944, 17012, 17348, 17600, 18228, 18412, 18416, 18420, 18424, 18428, 18432, 18436, 18440, 18444, 18448, 18452, 18456, 18460, 18464, 18468, 18472, 18476, 18480, 18484, 18488, 18492, 18496, 18500, 18504, 18508, 18512, 18516, 18520, 18524, 18528, 18532, 18536, 18540, 18544, 18548, 18552, 18556, 18560, 18796, 19796, 20424, 20588, 20824, 20884, 21028, 21032, 21036, 21040, 21044, 21048, 21052, 21056, 21060, 21064, 21068, 21072, 21076, 21080, 21084, 21088, 21092, 21096, 21100, 21104, 21108, 21112, 21116, 21120, 21124, 21128, 21132, 21136, 21140, 21144, 21148, 21152, 21156, 21160, 21164, 21168, 21172, 21176, 21180, 21184, 21188, 21192, 21196, 21200, 21204, 21208, 21212, 21216, 21220, 21224, 21228, 21232, 21236, 21240, 21244, 21248, 21852, 21856, 21860, 21864, 21868, 21872, 21876, 21880, 22772, 23716, 24048, 24136, 24140, 24144, 24148, 24152, 24156, 24160, 24164, 24168, 24172, 24176, 24180, 24184, 24188, 24192, 24196, 24200, 24468, 24472, 24476, 24480, 24484, 24488, 24492, 24496, 24500, 24504, 24508, 24512, 24516, 24520, 24524, 24528, 24532, 24800, 24804, 24808, 24812, 24816, 24820, 24824, 24828, 24832, 24836, 24840, 24844, 24848, 24852, 24856, 24860, 24864, 25132, 25136, 25140, 25144, 25148, 25152, 25156, 25160, 25164, 25168, 25172, 25176, 25180, 25184, 25188, 25192, 25196, 25464, 25468, 25472, 25476, 25480, 25484, 25612, 25616, 25620, 25624, 25628, 25632, 25636, 25640, 25644, 25648, 25652, 25656, 25660, 25664, 25668, 25672, 25676, 26e3, 26252, 26256, 26260, 26264, 26268, 26272, 26836, 26840, 26844, 26848, 26852, 26856, 28956, 28960, 28964, 28968, 28972, 28976, 28980, 28984, 28988, 28992, 31684, 31896, 31900, 31904, 31908, 32900, 32904, 32908, 32912, 33912, 35708, 37068, 37264, 37268, 37272, 37276, 37280, 37284, 37288, 37292, 37372, 37376, 37380, 37488, 37492, 37496, 37600, 37604, 37608, 37716, 37720, 37724, 38020, 38392, 38396, 38400, 38404, 38408, 38412, 38416, 38420, 38424, 38428, 38432, 38436, 38440, 38444, 38448, 38452, 38456, 38460, 38464, 38468, 38472, 38476, 38480, 38484, 38488, 38492, 38496, 38500, 38504, 38508, 38512, 38516, 38520, 38524, 38528, 38532, 38536, 38540, 38544, 38548, 38552, 38556, 38560, 38564, 38568, 38572, 38576, 38580, 38584, 38588, 38592, 38596, 38600, 38604, 38608, 38612, 38616, 38620, 38624, 38628, 38632, 38636, 38640, 38644, 38648, 38652, 38656, 38660, 38664, 38668, 38672, 38676, 38680, 38684, 38688, 38692, 38696, 38700, 38704, 38708, 38712, 38716, 38720, 38724, 38728, 38732, 38736, 38740, 38744, 38748, 38752, 38756, 38760, 38764, 38768, 38772, 38776, 38780, 38784, 38788, 38792, 38796, 38800, 38804, 38808, 38812, 38816, 38820, 38824, 38828, 38832, 38836, 38840, 38844, 38848, 38852, 38856, 38860, 38864, 38868, 38872, 38876, 38880, 38884, 38888, 38892, 38896, 39300, 40460, 42220, 43200, 45416, 45476, 46316, 46356, 46360, 46364, 46368, 46372, 46376, 46380, 46384, 46388, 46392, 46396, 46400, 46404, 46408, 47288, 47380, 47384, 47388, 47392, 47396, 47400, 47404, 47408, 47412, 47416, 47420, 47424, 47428, 47432, 47436, 47440, 47444, 47448, 47452, 47456, 47460, 47464, 47468, 47472, 47476, 47480, 47484, 47488, 47492, 47496, 47500, 47504, 47508, 47512, 47516, 47520, 47524, 47528, 47532, 47536, 47540, 47544, 47548, 47552, 47556, 47560, 47564, 47568, 47572, 47576, 47580, 47584, 47588, 47592, 47596, 47600, 47604, 47608, 47612, 47616, 47620, 47624, 47628, 47632, 47636, 47640, 47644, 47648, 47652, 47656, 47660, 47664, 47668, 47672, 47676, 47680, 47684, 47688, 47692, 47696, 47700, 47704, 47708, 47712, 47716, 47720, 47724, 47728, 47732, 47736, 47740, 47744, 47748, 47752, 47756, 47760, 47764, 47768, 47772, 47776, 47780, 47784, 47788, 47792, 47796, 47800, 47804, 47808, 47812, 47816, 47820, 47824, 47828, 47832, 47836, 47840, 47844, 47848, 47852, 47856, 47860, 47864, 47868, 47872, 47876, 47880, 47884, 47888, 48196, 48660, 48716, 48996, 49228, 49232, 49236, 49240, 49244, 49248, 49252, 49256, 49260, 49264, 49268, 49272, 49276, 49280, 49284, 49288, 49292, 49296, 49300, 49304, 49308, 49312, 49316, 49320, 49324, 49328, 49332, 49336, 49340, 49344, 49348, 49352, 49356, 49360, 49364, 49368, 49372, 49376, 49380, 49384, 49388, 49392, 49396, 49400, 49404, 49408, 49412, 49416, 49420, 49424, 49428, 49432, 49436, 49440, 49444, 49448, 49452, 49456, 49460, 49464, 49468, 49472, 49476, 49480, 49484, 49488, 49492, 49496, 49500, 49504, 49508, 49512, 49516, 49520, 49524, 49528, 49532, 49536, 49540, 49544, 49548, 49552, 49556, 49740, 49972, 49976, 49980, 49984, 49988, 49992, 49996, 5e4, 50004, 50008, 50012, 50016, 50020, 50024, 50028, 50032, 50036, 50040, 50044, 50048, 50052, 50056, 50060, 50064, 50068, 50072, 50076, 50080, 50084, 50088, 50092, 50096, 50100, 50104, 50108, 50112, 50116, 50120, 50124, 50128, 50132, 50136, 50140, 50144, 50148, 50152, 50156, 50160, 50164, 50168, 50172, 50176, 50180, 50184, 50188, 50192, 50196, 50200, 50204, 50208, 50212, 50216, 50220, 50224, 50228, 50232, 50236, 50240, 50244, 50248, 50252, 50256, 50260, 50264, 50268, 50272, 50276, 50280, 50284, 50288, 50292, 50296, 50300, 50304, 50308, 50312, 50316, 50320, 50324, 50328, 50332, 50336, 50340, 50344, 50348, 50352, 50356, 50360, 50364, 50368, 50372, 50376, 50380, 50384, 50388, 50392, 50396, 50580, 50812, 50816, 50820, 50824, 50828, 50832, 50836, 50840, 50844, 50848, 50852, 50856, 50860, 50864, 50868, 50872, 50876, 50880, 50884, 50888, 50892, 50896, 50900, 50904, 50908, 50912, 50916, 50920, 50924, 50928, 50932, 50936, 50940, 50944, 50948, 50952, 50956, 50960, 50964, 50968, 50972, 50976, 50980, 50984, 50988, 50992, 50996, 51e3, 51004, 51008, 51012, 51016, 51020, 51024, 51028, 51032, 51036, 51040, 51044, 51048, 51052, 51056, 51060, 51064, 51068, 51072, 51076, 51080, 51084, 51088, 51092, 51096, 51100, 51104, 51108, 51112, 51116, 51120, 51124, 51128, 51132, 51136, 51140, 51144, 51148, 51152, 51156, 51160, 51164, 51168, 51172, 51176, 51180, 51184, 51188, 51192, 51196, 51200, 51204, 51208, 51212, 51396, 51616, 51620, 51624, 51628, 51632, 51636, 51640, 51644, 51648, 51652, 51656, 51660, 51664, 51668, 51672, 51676, 51680, 51684, 51688, 51692, 51696, 51700, 51704, 51708, 51712, 51716, 51720, 51724, 51728, 51732, 51736, 51740, 52264, 52624, 53072, 53112, 53116, 53120, 53124, 53128, 53132, 53136, 53140, 53144, 53148, 53152, 53156, 53160, 53164, 53516, 53744, 53748, 53752, 53756, 53760, 53764, 53768, 53772, 53776, 53780, 53784, 53788, 53792, 53796, 53800, 53804, 53808, 53812, 53816, 53820, 53824, 53828, 53832, 53836, 53840, 53844, 53848, 53852, 53856, 53860, 53864, 53868, 53872, 53876, 53880, 53884, 53888, 53892, 53896, 53900, 53904, 53908, 53912, 53916, 54316, 54500, 54504, 54508, 54512, 54516, 54520, 54652, 54788, 54792, 54796, 54800, 54804, 54808, 54972, 55372, 55376, 55380, 55384, 55388, 55392, 55396, 55400, 55404, 55408, 55412, 55416, 55420, 55424, 55428, 55432, 55436, 55440, 55444, 55448, 55452, 55456, 55460, 55464, 55468, 55472, 55476, 55480, 55484, 55488, 55492, 55496, 55500, 55504, 55508, 55512, 55516, 55520, 55524, 55528, 55532, 55536, 55540, 55544, 55548, 55552, 55556, 55560, 55564, 55568, 55572, 55576, 55580, 55584, 55588, 55592, 55596, 55600, 55604, 55608, 55612, 55616, 55620, 55624, 55628, 55632, 55636, 55640, 55644, 55648, 55652, 55656, 55660, 55664, 55668, 55672, 55676, 55680, 55684, 55688, 55692, 55696, 55700, 55704, 55708, 55712, 55716, 55720, 55724, 55728, 55732, 55736, 55740, 55744, 55748, 55752, 55756, 55760, 55764, 55768, 55772, 55776, 55780, 55784, 55788, 55792, 55796, 55800, 55804, 55808, 55812, 55816, 55820, 55824, 55828, 55832, 55836, 55840, 55844, 55848, 55852, 55856, 55860, 55864, 55868, 55872, 55876, 55880, 55884, 55888, 55892, 55896, 55900, 55904, 55908, 55912, 55916, 55920, 55924, 55928, 55932, 55936, 55940, 55944, 55948, 55952, 55956, 55960, 55964, 55968, 55972, 55976, 55980, 55984, 55988, 55992, 55996, 56e3, 56004, 56008, 56012, 56016, 56020, 56024, 56028, 56032, 56036, 56040, 56044, 56048, 56052, 56056, 56060, 56064, 56068, 56072, 56076, 56080, 56084, 56088, 56092, 56096, 56100, 56104, 56108, 56112, 56116, 56120, 56124, 56128, 56132, 56136, 56140, 56144, 56148, 56152, 56156, 56160, 56164, 56168, 56172, 56176, 56180, 56184, 56188, 56192, 56196, 56200, 56204, 56208, 56212, 56216, 56220, 56224, 56228, 56232, 56236, 56240, 56244, 56248, 56252, 56256, 56260, 56264, 56268, 56272, 56276, 56280, 56284, 56288, 56292, 56296, 56300, 56304, 56308, 56312, 56316, 56320, 56324, 56328, 56332, 56336, 56340, 56344, 56348, 56352, 56356, 56360, 56364, 56368, 56372, 56376, 56380, 56384, 56388, 56392, 56396, 56400, 56404, 56408, 56412, 56416, 56420, 56424, 56428, 56432, 56436, 56440, 56444, 56448, 56452, 56456, 56460, 56464, 56468, 56472, 56476, 56480, 56484, 56488, 56492, 56496, 56500, 56504, 56508, 56512, 56516, 56520, 56524, 56528, 56532, 56536, 56540, 56544, 56548, 56552, 56556, 56560, 56564, 56568, 56572, 56576, 56580, 56584, 56588, 56592, 56596, 56600, 56604, 56608, 56612, 56616, 56620, 56624, 56628, 56632, 56636, 56640, 56644, 56648, 56652, 56656, 56660, 56664, 56668, 56672, 56676, 56680, 56684, 56688, 56692, 56696, 56700, 56704, 56708, 56712, 56716, 56720, 56724, 56728, 56732, 56736, 56740, 56744, 56748, 56752, 56756, 56760, 56764, 56768, 56772, 56776, 56780, 56784, 56788, 56792, 56796, 56800, 56804, 56808, 56812, 56816, 56820, 56824, 56828, 56832, 56836, 56840, 56844, 56848, 56852, 56856, 56860, 56864, 56868, 56872, 56876, 56880, 56884, 56888, 56892, 56896, 56900, 56904, 56908, 56912, 56916, 56920, 56924, 56928, 56932, 56936, 56940, 56944, 56948, 56952, 56956, 56960, 56964, 56968, 56972, 56976, 56980, 56984, 56988, 56992, 56996, 57e3, 57004, 57008, 57012, 57016, 57020, 57024, 57028, 57032, 57036, 57040, 57044, 57048, 57052, 57056, 57060, 57064, 57068, 57072, 57076, 57080, 57084, 57088, 57092, 57096, 57100, 57104, 57108, 57112, 57116, 57120, 57124, 57128, 57132, 57136, 57140, 57144, 57148, 57152, 57156, 57160, 57164, 57168, 57172, 57176, 57180, 57184, 57188, 57192, 57196, 57200, 57204, 57208, 57212, 57216, 57220, 57224, 57228, 57232, 57236, 57240, 57244, 57248, 57252, 57256, 57260, 57264, 57268, 57272, 57276, 57280, 57284, 57288, 57292, 57296, 57300, 57304, 57308, 57312, 57316, 57320, 57324, 57328, 57332, 57336, 57340, 57344, 57348, 57352, 57356, 57360, 57364, 57368, 57372, 57376, 57380, 57384, 57388, 57392, 57396, 57400, 57404, 57408, 57412, 57416, 57420, 57424, 57428, 57432, 57436, 57440, 57444, 57448, 57452, 57456, 57460, 57464, 57468, 57472, 57476, 57480, 57484, 57488, 57492, 57496, 57500, 57504, 57508, 57512, 57516, 57520, 57524, 57528, 57532, 57536, 57540, 57544, 57548, 57552, 57556, 57560, 57564, 57568, 57572, 57576, 57580, 57584, 57588, 57592, 57596, 57600, 57604, 57608, 57612, 57616, 57620, 57624, 57628, 57632, 57636, 57640, 57644, 57648, 57652, 57656, 57660, 57664, 57668, 57672, 57676, 57680, 57684, 57688, 57692, 57696, 57700, 57704, 57708, 57712, 57716, 57720, 57724, 57728, 57732, 57736, 57740, 57744, 57748, 57752, 57756, 57760, 57764, 57768, 57772, 57776, 57780, 57784, 57788, 57792, 57796, 57800, 57804, 57808, 57812, 57816, 57820, 57824, 57828, 57832, 57836, 57840, 57844, 57848, 57852, 57856, 57860, 57864, 57868, 57872, 57876, 57880, 57884, 57888, 57892, 57896, 57900, 57904, 57908, 57912, 57916, 57920, 57924, 57928, 57932, 57936, 57940, 57944, 57948, 57952, 57956, 57960, 57964, 57968, 57972, 57976, 57980, 57984, 57988, 57992, 57996, 58e3, 58004, 58008, 58012, 58016, 58020, 58024, 58028, 58032, 58036, 58040, 58044, 58048, 58052, 58056, 58060, 58064, 58068, 58072, 58076, 58080, 58084, 58088, 58092, 58096, 58100, 58104, 58108, 58112, 58116, 58120, 58124, 58128, 58132, 58136, 58140, 58144, 58148, 58152, 58156, 58160, 58164, 58168, 58172, 58176, 58180, 58184, 58188, 58192, 58196, 58200, 58204, 58208, 58212, 58216, 58220, 58224, 58228, 58232, 58236, 58240, 58244, 58248, 58252, 58256, 58260, 58264, 58268, 58272, 58276, 58280, 58284, 58288, 58292, 58296, 58300, 58304, 58308, 58312, 58316, 58320, 58324, 58328, 58332, 58336, 58340, 58344, 58348, 58352, 58356, 58360, 58364, 58368, 58372, 58376, 58380, 58384, 58388, 58392, 58396, 58400, 58404, 58408, 58412, 58416, 58420, 58424, 58428, 58432, 58436, 58440, 58444, 58448, 58452, 58456, 58460, 58464, 58468, 58472, 58476, 58480, 58484, 58488, 58492, 58496, 58500, 58504, 58508, 58512, 58516, 58520, 58524, 58528, 58532, 58536, 58540, 58544, 58548, 58552, 58556, 58560, 58564, 58568, 58572, 58576, 58580, 58584, 58588, 58592, 58596, 58600, 58604, 58608, 58612, 58616, 58620, 58624, 58628, 58632, 58636, 58640, 58644, 58648, 58652, 58656, 58660, 58664, 58668, 58672, 58676, 58680, 58684, 58688, 58692, 58696, 58700, 58704, 58708, 58712, 58716, 58720, 58724, 58728, 58732, 58736, 58740, 58744, 58748, 58752, 58756, 58760, 58764, 58768, 58772, 58776, 58780, 58784, 58788, 58792, 58796, 58800, 58804, 58808, 58812, 58816, 58820, 58824, 58828, 58832, 58836, 58840, 58844, 58848, 58852, 58856, 58860, 58864, 58868, 58872, 58876, 58880, 58884, 58888, 58892, 58896, 58900, 58904, 58908, 58912, 58916, 58920, 58924, 58928, 58932, 58936, 58940, 58944, 58948, 58952, 58956, 58960, 58964, 58968, 58972, 58976, 58980, 58984, 58988, 58992, 58996, 59e3, 59004, 59008, 59012, 59016, 59020, 59024, 59028, 59032, 59036, 59040, 59044, 59048, 59052, 59056, 59060, 59064, 59068, 59072, 59076, 59080, 59084, 59088, 59092, 59096, 59100, 59104, 59108, 59112, 59116, 59120, 59124, 59128, 59132, 59136, 59140, 59144, 59148, 59152, 59156, 59160, 59164, 59168, 59172, 59176, 59180, 59184, 59188, 59192, 59196, 59200, 59204, 59208, 59212, 59216, 59220, 59224, 59228, 59232, 59236, 59240, 59244, 59248, 59252, 59256, 59260, 59264, 59268, 59272, 59276, 59280, 59284, 59288, 59292, 59296, 59300, 59304, 59308, 59312, 59316, 59320, 59324, 59328, 59332, 59336, 59340, 59344, 59348, 59352, 59356, 59360, 59364, 59368, 59372, 59376, 59380, 59384, 59388, 59392, 59396, 59400, 59404, 59408, 59412, 59416, 59420, 59424, 59428, 59432, 59436, 59440, 59444, 59448, 59452, 59456, 59460, 59464, 59468, 59472, 59476, 59480, 59484, 59488, 59492, 59496, 59500, 59504, 59508, 59512, 59516, 59520, 59524, 59528, 59532, 59536, 59540, 59544, 59548, 59552, 59556, 59560, 59564, 59568, 59572, 59576, 59580, 59584, 59588, 59592, 59596, 59600, 59604, 59608, 59612, 59616, 59620, 59624, 59628, 59632, 59636, 59640, 59644, 59648, 59652, 59656, 59660, 59664, 59668, 59672, 59676, 59680, 59684, 59688, 59692, 59696, 59700, 59704, 59708, 59712, 59716, 59720, 59724, 59728, 59732, 59736, 59740, 59744, 59748, 59752, 59756, 59760, 59764, 59768, 59772, 59776, 59780, 59784, 59788, 59792, 59796, 59800, 59804, 59808, 59812, 59816, 59820, 59824, 59828, 59832, 59836, 59840, 59844, 59848, 59852, 59856, 59860, 59864, 59868, 59872, 59876, 59880, 59884, 59888, 59892, 59896, 59900, 59904, 59908, 59912, 59916, 59920, 59924, 59928, 59932, 59936, 59940, 59944, 59948, 59952, 59956, 59960, 59964, 59968, 59972, 59976, 59980, 59984, 59988, 59992, 59996, 6e4, 60004, 60008, 60012, 60016, 60020, 60024, 60028, 60032, 60036, 60040, 60044, 60048, 60052, 60056, 60060, 60064, 60068, 60072, 60076, 60080, 60084, 60088, 60092, 60096, 60100, 60104, 60108, 60112, 60116, 60120, 60124, 60128, 60132, 60136, 60140, 60144, 60148, 60152, 60156, 60160, 60164, 60168, 60172, 60176, 60180, 60184, 60188, 60192, 60196, 60200, 60204, 60208, 60212, 60216, 60220, 60224, 60228, 60232, 60236, 60240, 60244, 60248, 60252, 60256, 60260, 60264, 60268, 60272, 60276, 60280, 60284, 60288, 60292, 60296, 60300, 60304, 60308, 60312, 60316, 60320, 60324, 60328, 60332, 60336, 60340, 60344, 60348, 60352, 60356, 60360, 60364, 60368, 60372, 60376, 60380, 60384, 60388, 60392, 60396, 60400, 60404, 60408, 60412, 60416, 60420, 60424, 60428, 60432, 60436, 60440, 60444, 60448, 60452, 60456, 60460, 60464, 60468, 60472, 60476, 60480, 60484, 60488, 60492, 60496, 60500, 60504, 60508, 60512, 60516, 60520, 60524, 60528, 60532, 60536, 60540, 60544, 60548, 60552, 60556, 60560, 60564, 60568, 60572, 60576, 60580, 60584, 60588, 60592, 60596, 60600, 60604, 60608, 60612, 60616, 60620, 60624, 60628, 60632, 60636, 60640, 60644, 60648, 60652, 60656, 60660, 60664, 60668, 60672, 60676, 60680, 60684, 60688, 60692, 60696, 60700, 60704, 60708, 60712, 60716, 60720, 60724, 60728, 60732, 60736, 60740, 60744, 60748, 60752, 60756, 60760, 60764, 60768, 60772, 60776, 60780, 60784, 60788, 60792, 60796, 60800, 60804, 60808, 60812, 60816, 60820, 60824, 60828, 60832, 60836, 60840, 60844, 60848, 60852, 60856, 60860, 60864, 60868, 60872, 60876, 60880, 60884, 60888, 60892, 60896, 60900, 60904, 60908, 60912, 60916, 60920, 60924, 60928, 60932, 60936, 60940, 60944, 60948, 60952, 60956, 60960, 60964, 60968, 60972, 60976, 60980, 60984, 60988, 60992, 60996, 61e3, 61004, 61008, 61012, 61016, 61020, 61024, 61028, 61032, 61036, 61040, 61044, 61048, 61052, 61056, 61060, 61064, 61068, 61072, 61076, 61080, 61084, 61088, 61092, 61096, 61100, 61104, 61108, 61112, 61116, 61120, 61124, 61128, 61132, 61136, 61140, 61144, 61148, 61152, 61156, 61160, 61164, 61168, 61172, 61176, 61180, 61184, 61188, 61192, 61196, 61200, 61204, 61208, 61212, 61216, 61220, 61224, 61228, 61232, 61236, 61240, 61244, 61248, 61252, 61256, 61260, 61264, 61268, 61272, 61276, 61280, 61284, 61288, 61292, 61296, 61300, 61304, 61308, 61312, 61316, 61320, 61324, 61328, 61332, 61336, 61340, 61344, 61348, 61352, 61356, 61360, 61364, 61368, 61372, 61376, 61380, 61384, 61388, 61392, 61396, 61400, 61404, 61408, 61412, 61416, 61420, 61424, 61428, 61432, 61436, 61440, 61444, 61448, 61452, 61456, 61460, 61464, 61468, 61472, 61476, 61480, 61484, 61488, 61492, 61496, 61500, 61504, 61508, 61512, 61516, 61520, 61524, 61528, 61532, 61536, 61540, 61544, 61548, 61552, 61556, 61560, 61564, 61568, 61572, 61576, 61580, 61584, 61588, 61592, 61596, 61600, 61604, 61608, 61612, 61616, 61620, 61624, 61628, 61632, 61636, 61640, 61644, 61648, 61652, 61656, 61660, 61664, 61668, 61672, 61676, 61680, 61684, 61688, 61692, 61696, 61700, 61704, 61708, 61712, 61716, 61720, 61724, 61728, 61732, 61736, 61740, 61744, 61748, 61752, 61756, 61760, 61764, 61768, 61772, 61776, 61780, 61784, 61788, 61792, 61796, 61800, 61804, 61808, 61812, 61816, 61820, 61824, 61828, 61832, 61836, 61840, 61844, 61848, 61852, 61856, 61860, 61864, 61868, 61872, 61876, 61880, 61884, 61888, 61892, 61896, 61900, 61904, 61908, 61912, 61916, 61920, 61924, 61928, 61932, 61936, 61940, 61944, 61948, 61952, 61956, 61960, 61964, 61968, 61972, 61976, 61980, 61984, 61988, 61992, 61996, 62e3, 62004, 62008, 62012, 62016, 62020, 62024, 62028, 62032, 62036, 62040, 62044, 62048, 62052, 62056, 62060, 62064, 62068, 62072, 62076, 62080, 62084, 62088, 62092, 62096, 62100, 62104, 62108, 62112, 62116, 62120, 62124, 62128, 62132, 62136, 62140, 62144, 62148, 62152, 62156, 62160, 62164, 62168, 62172, 62176, 62180, 62184, 62188, 62192, 62196, 62200, 62204, 62208, 62212, 62216, 62220, 62224, 62228, 62232, 62236, 62240, 62244, 62248, 62252, 62256, 62260, 62264, 62268, 62272, 62276, 62280, 62284, 62288, 62292, 62296, 62300, 62304, 62308, 62312, 62316, 62320, 62324, 62328, 62332, 62336, 62340, 62344, 62348, 62352, 62356, 62360, 62364, 62368, 62372, 62376, 62380, 62384, 62388, 62392, 62396, 62400, 62404, 62408, 62412, 62416, 62420, 62424, 62428, 62432, 62436, 62440, 62444, 62448, 62452, 62456, 62460, 62464, 62468, 62472, 62476, 62480, 62484, 62488, 62492, 62496, 62500, 62504, 62508, 62512, 62516, 62520, 62524, 62528, 62532, 62536, 62540, 62544, 62548, 62552, 62556, 62560, 62564, 62568, 62572, 62576, 62580, 62584, 62588, 62592, 62596, 62600, 62604, 62608, 62612, 62616, 62620, 62624, 62628, 62632, 62636, 62640, 62644, 62648, 62652, 62656, 62660, 62664, 62668, 62672, 62676, 62680, 62684, 62688, 62692, 62696, 62700, 62704, 62708, 62712, 62716, 62720, 62724, 62728, 62732, 62736, 62740, 62744, 62748, 62752, 62756, 62760, 62764, 62768, 62772, 62776, 62780, 62784, 62788, 62792, 62796, 62800, 62804, 62808, 62812, 62816, 62820, 62824, 62828, 62832, 62836, 62840, 62844, 62848, 62852, 62856, 62860, 62864, 62868, 62872, 62876, 62880, 62884, 62888, 62892, 62896, 62900, 62904, 62908, 62912, 62916, 62920, 62924, 62928, 62932, 62936, 62940, 62944, 62948, 62952, 62956, 62960, 62964, 62968, 62972, 62976, 62980, 62984, 62988, 62992, 62996, 63e3, 63004, 63008, 63012, 63016, 63020, 63024, 63028, 63032, 63036, 63040, 63044, 63048, 63052, 63056, 63060, 63064, 63068, 63072, 63076, 63080, 63084, 63088, 63092, 63096, 63100, 63104, 63108, 63112, 63116, 63120, 63124, 63128, 63132, 63136, 63140, 63144, 63148, 63152, 63156, 63160, 63164, 63168, 63172, 63176, 63180, 63184, 63188, 63192, 63196, 63200, 63204, 63208, 63212, 63216, 63220, 63224, 63228, 63232, 63236, 63240, 63244, 63248, 63252, 63256, 63260, 63264, 63268, 63272, 63276, 63280, 63284, 63288, 63292, 63296, 63300, 63304, 63308, 63312, 63316, 63320, 63324, 63328, 63332, 63336, 63340, 63344, 63348, 63352, 63356, 63360, 63364, 63368, 63372, 63376, 63380, 63384, 63388, 63392, 63396, 63400, 63404, 63408, 63412, 63416, 63420, 63424, 63428, 63432, 63436, 63440, 63444, 63448, 63452, 63456, 63460, 63464, 63468, 63472, 63476, 63480, 63484, 63488, 63492, 63496, 63500, 63504, 63508, 63512, 63516, 63520, 63524, 63528, 63532, 63536, 63540, 63544, 63548, 63552, 63556, 63560, 64012, 64196, 64468, 64660, 64900, 65148, 65368, 66296, 66884, 67104, 67368, 67460, 67612, 67828, 68008, 68188, 68344, 68512, 68640, 68800, 69024, 69144, 69444, 69568, 69704, 69888, 70012, 70212, 70348, 70460, 70752, 70932, 71032, 71132, 71232, 71360, 71604, 71704, 71816, 71912, 72068, 72156, 72240, 72316, 72500, 460, 476, 508, 536, 560, 584, 628, 644, 676, 704, 728, 752, 796, 812, 852, 884, 916, 968, 984, 1024, 1056, 1088, 1120, 1172, 1188, 1228, 1264, 1296, 1328, 1360, 1412, 1428, 1468, 1500, 1532, 1564, 1616, 1632, 1672, 1708, 1740, 1772, 1804, 1856, 1872, 1912, 1948, 1984, 2016, 2048, 2100, 2116, 2156, 2192, 2228, 2260, 2292, 2324, 2376, 2392, 2432, 2468, 2504, 2536, 2568, 2600, 2652, 2668, 2708, 2740, 2772, 2824, 2840, 2880, 2916, 2948, 2980, 3032, 3048, 3088, 3124, 3156, 3188, 3240, 3256, 3296, 3332, 3364, 3396, 3428, 3480, 3496, 3536, 3572, 3604, 3636, 3668, 3712, 3728, 3760, 3788, 3812, 3836, 3860, 3908, 3924, 3956, 3984, 4008, 4032, 4056, 4104, 4120, 4152, 4180, 4204, 4228, 4252, 4300, 4316, 4348, 4376, 4400, 4424, 4448, 4496, 4512, 4544, 4572, 4596, 4620, 4644, 4692, 4708, 4740, 4768, 4792, 4816, 4840, 4888, 4904, 4936, 4964, 4988, 5012, 5036, 5084, 5100, 5132, 5160, 5184, 5208, 5232, 5280, 5296, 5328, 5356, 5380, 5404, 5428, 5476, 5492, 5524, 5552, 5576, 5600, 5624, 5672, 5688, 5720, 5748, 5772, 5796, 5820, 5868, 5884, 5916, 5944, 5968, 5992, 6016, 6064, 6080, 6112, 6140, 6168, 6196, 6220, 6244, 6292, 6308, 6340, 6368, 6396, 6424, 6448, 6472, 6520, 6536, 6568, 6596, 6624, 6652, 6676, 6700, 6748, 6764, 6796, 6824, 6852, 6880, 6904, 6928, 6976, 6992, 7024, 7052, 7080, 7108, 7136, 7160, 7184, 7228, 7244, 7276, 7304, 7332, 7360, 7388, 7412, 7436, 7460, 7508, 7524, 7556, 7584, 7612, 7640, 7668, 7696, 7720, 7744, 7792, 7808, 7840, 7868, 7896, 7924, 7952, 7980, 8004, 8032, 8080, 8096, 8128, 8156, 8184, 8212, 8240, 8268, 8292, 8320, 8368, 8384, 8416, 8444, 8472, 8500, 8528, 8556, 8580, 8608, 8656, 8672, 8704, 8732, 8760, 8788, 8816, 8840, 8864, 8912, 8928, 8960, 8988, 9016, 9044, 9072, 9096, 9120, 9168, 9184, 9216, 9244, 9272, 9300, 9328, 9352, 9376, 9424, 9440, 9472, 9500, 9528, 9556, 9592, 9624, 9656, 9712, 9728, 9768, 9804, 9840, 9876, 9912, 9944, 9976, 10032, 10048, 10088, 10124, 10160, 10196, 10232, 10264, 10296, 10352, 10368, 10408, 10444, 10480, 10516, 10552, 10584, 10616, 10672, 10688, 10728, 10764, 10800, 10836, 10872, 10904, 10936, 10992, 11008, 11048, 11084, 11120, 11156, 11192, 11224, 11256, 11312, 11328, 11368, 11404, 11440, 11476, 11512, 11544, 11576, 11672, 11732, 11864, 11940, 11964, 12048, 12252, 12372, 12464, 12872, 13364, 13384, 13412, 13448, 13488, 13516, 13540, 13896, 13920, 13948, 16124, 16388, 16404, 16436, 16516, 16764, 16824, 16916, 17084, 17212, 17316, 17424, 17476, 17700, 17820, 17852, 17880, 18040, 18056, 18072, 18100, 18316, 18816, 20048, 20216, 20848, 21408, 21572, 21732, 21780, 21792, 22204, 22508, 22672, 22748, 22912, 23020, 23108, 23160, 23432, 23540, 23556, 23588, 23616, 23636, 23664, 23816, 24224, 24556, 24888, 25220, 25508, 25700, 26056, 26196, 26216, 26300, 26380, 26444, 26508, 26588, 26668, 26748, 26888, 26944, 27064, 27120, 27240, 27308, 27336, 27416, 27512, 27636, 27908, 27944, 28012, 28040, 28120, 28392, 28432, 28468, 28580, 28848, 28872, 30428, 31036, 31160, 31268, 31392, 31740, 31860, 31948, 31992, 32020, 32096, 32140, 32168, 32244, 32288, 32316, 32392, 32436, 32464, 32560, 32604, 32620, 32636, 32676, 32696, 32712, 32732, 32748, 32768, 32784, 32812, 32832, 32848, 32864, 32944, 33028, 33112, 33196, 33276, 33352, 33384, 33468, 33552, 33616, 33640, 33656, 33672, 33696, 33712, 33748, 33988, 34096, 34204, 34372, 34480, 34588, 34764, 34880, 34996, 35172, 35288, 35404, 35520, 35756, 35772, 35856, 35892, 35972, 36112, 36156, 36232, 36284, 36296, 36304, 36384, 36400, 36416, 36476, 36524, 36572, 36584, 36608, 36620, 36668, 36680, 36704, 36744, 36808, 36832, 36948, 37128, 37152, 37332, 37448, 37520, 37560, 37676, 37748, 38124, 38168, 38196, 38256, 38268, 38928, 38996, 39036, 39076, 39116, 39156, 39236, 39352, 39364, 39400, 39420, 39436, 39452, 39468, 39484, 39500, 39516, 39632, 39644, 39660, 39672, 39684, 39700, 39728, 39740, 39748, 39756, 39768, 39784, 39800, 39816, 39832, 39924, 39952, 4e4, 40016, 40044, 40136, 40164, 40332, 40352, 40364, 40500, 40516, 40720, 40800, 40848, 40856, 40936, 40952, 40968, 41028, 41076, 41124, 41136, 41160, 41172, 41220, 41232, 41256, 41296, 41360, 41384, 41500, 42280, 42296, 42312, 42328, 42340, 42352, 42388, 42408, 42424, 42440, 42456, 42472, 42488, 42504, 42520, 42612, 42624, 42636, 42648, 42664, 42692, 42704, 42712, 42720, 42732, 42748, 42768, 42888, 42928, 43076, 43088, 43120, 43132, 43328, 43504, 43728, 43748, 43768, 43912, 43940, 44024, 44112, 44140, 44816, 44896, 45344, 45496, 45548, 45684, 45816, 45884, 45948, 46428, 46448, 46468, 46492, 46516, 46540, 46564, 46588, 46608, 46628, 46652, 46676, 46700, 46720, 46736, 46756, 46916, 46932, 46992, 47040, 47080, 47132, 47168, 47188, 47204, 47228, 47920, 47940, 47960, 47980, 48e3, 48020, 48040, 48060, 48080, 48100, 48120, 48232, 48248, 48336, 48372, 48444, 48500, 48516, 48768, 48880, 49104, 49140, 49192, 49588, 49616, 49644, 49672, 49848, 49884, 49936, 50428, 50456, 50484, 50512, 50688, 50724, 50776, 51244, 51272, 51300, 51328, 51504, 51540, 51580, 51772, 51800, 51828, 51856, 51972, 52024, 52356, 52368, 52400, 52456, 52660, 52736, 52772, 52836, 52888, 52912, 52936, 52988, 53184, 53204, 53224, 53248, 53272, 53296, 53320, 53344, 53364, 53404, 53620, 53656, 53708, 53948, 53976, 54004, 54260, 54396, 54420, 54436, 54724, 54892, 55080, 55096, 55196, 55212, 63680, 64104, 64408, 64596, 64776, 64840, 65088, 65308, 65432, 65476, 65512, 66412, 66652, 66912, 66968, 67e3, 67012, 67024, 67036, 67048, 67508, 67548, 67640, 67712, 67724, 67740, 68044, 68112, 68132, 68212, 68224, 68268, 68280, 68556, 68580, 68680, 68884, 69056, 69084, 69168, 69184, 69196, 69204, 69384, 69392, 69508, 69732, 69756, 69780, 69804, 69828, 70060, 70136, 70256, 70288, 70400, 70504, 70520, 70700, 70856, 70972, 71072, 71172, 71256, 71268, 71292, 71304, 71396, 71416, 71644, 71732, 71756, 71840, 71852, 71940, 72e3, 72096, 72392, 72576, 72616, 72636, 72716, 72736, 72756, 72776, 72816, 72852, 72924, 72960, 73016, 73072, 73080, 73132, 73172, 73244, 73276, 73308, 73344, 73384, 73428, 73540 ]);
 for (var i = 0; i < relocations.length; i++) {
  assert(relocations[i] % 4 === 0);
  assert(relocations[i] >= 0 && relocations[i] < eb + 73960);
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
   $8 = HEAP32[1603] | 0;
   $9 = $8 >>> $7;
   $10 = $9 & 3;
   $11 = ($10 | 0) == 0;
   if (!$11) {
    $12 = $9 & 1;
    $13 = $12 ^ 1;
    $14 = $13 + $7 | 0;
    $15 = $14 << 1;
    $16 = 6452 + ($15 << 2) | 0;
    $17 = $16 + 8 | 0;
    $18 = HEAP32[$17 >> 2] | 0;
    $19 = $18 + 8 | 0;
    $20 = HEAP32[$19 >> 2] | 0;
    $21 = ($16 | 0) == ($20 | 0);
    if ($21) {
     $22 = 1 << $14;
     $23 = $22 ^ -1;
     $24 = $8 & $23;
     HEAP32[1603] = $24;
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
   $33 = HEAP32[6420 >> 2] | 0;
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
     $65 = 6452 + ($64 << 2) | 0;
     $66 = $65 + 8 | 0;
     $67 = HEAP32[$66 >> 2] | 0;
     $68 = $67 + 8 | 0;
     $69 = HEAP32[$68 >> 2] | 0;
     $70 = ($65 | 0) == ($69 | 0);
     if ($70) {
      $71 = 1 << $63;
      $72 = $71 ^ -1;
      $73 = $8 & $72;
      HEAP32[1603] = $73;
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
      $84 = HEAP32[6432 >> 2] | 0;
      $85 = $33 >>> 3;
      $86 = $85 << 1;
      $87 = 6452 + ($86 << 2) | 0;
      $88 = 1 << $85;
      $89 = $90 & $88;
      $91 = ($89 | 0) == 0;
      if ($91) {
       $92 = $90 | $88;
       HEAP32[1603] = $92;
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
     HEAP32[6420 >> 2] = $76;
     HEAP32[6432 >> 2] = $79;
     $$0 = $68;
     STACKTOP = sp;
     return $$0 | 0;
    }
    $98 = HEAP32[6416 >> 2] | 0;
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
     $123 = 6716 + ($122 << 2) | 0;
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
        $171 = 6716 + ($170 << 2) | 0;
        $172 = HEAP32[$171 >> 2] | 0;
        $173 = ($$0172$lcssa$i | 0) == ($172 | 0);
        if ($173) {
         HEAP32[$171 >> 2] = $$3$i;
         $cond$i = ($$3$i | 0) == (0 | 0);
         if ($cond$i) {
          $174 = 1 << $170;
          $175 = $174 ^ -1;
          $176 = $98 & $175;
          HEAP32[6416 >> 2] = $176;
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
        $206 = HEAP32[6432 >> 2] | 0;
        $207 = $33 >>> 3;
        $208 = $207 << 1;
        $209 = 6452 + ($208 << 2) | 0;
        $210 = 1 << $207;
        $211 = $8 & $210;
        $212 = ($211 | 0) == 0;
        if ($212) {
         $213 = $8 | $210;
         HEAP32[1603] = $213;
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
       HEAP32[6420 >> 2] = $$0173$lcssa$i;
       HEAP32[6432 >> 2] = $145;
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
    $223 = HEAP32[6416 >> 2] | 0;
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
     $251 = 6716 + ($$0336$i << 2) | 0;
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
       $304 = 6716 + ($303 << 2) | 0;
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
      $318 = HEAP32[6420 >> 2] | 0;
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
         $347 = 6716 + ($346 << 2) | 0;
         $348 = HEAP32[$347 >> 2] | 0;
         $349 = ($$4$lcssa$i | 0) == ($348 | 0);
         if ($349) {
          HEAP32[$347 >> 2] = $$3349$i;
          $cond$i208 = ($$3349$i | 0) == (0 | 0);
          if ($cond$i208) {
           $350 = 1 << $346;
           $351 = $350 ^ -1;
           $352 = $223 & $351;
           HEAP32[6416 >> 2] = $352;
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
          $384 = 6452 + ($383 << 2) | 0;
          $385 = HEAP32[1603] | 0;
          $386 = 1 << $381;
          $387 = $385 & $386;
          $388 = ($387 | 0) == 0;
          if ($388) {
           $389 = $385 | $386;
           HEAP32[1603] = $389;
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
         $420 = 6716 + ($$0339$i << 2) | 0;
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
          HEAP32[6416 >> 2] = $428;
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
 $457 = HEAP32[6420 >> 2] | 0;
 $458 = $457 >>> 0 < $$0192 >>> 0;
 if (!$458) {
  $459 = $457 - $$0192 | 0;
  $460 = HEAP32[6432 >> 2] | 0;
  $461 = $459 >>> 0 > 15;
  if ($461) {
   $462 = $460 + $$0192 | 0;
   HEAP32[6432 >> 2] = $462;
   HEAP32[6420 >> 2] = $459;
   $463 = $459 | 1;
   $464 = $462 + 4 | 0;
   HEAP32[$464 >> 2] = $463;
   $465 = $462 + $459 | 0;
   HEAP32[$465 >> 2] = $459;
   $466 = $$0192 | 3;
   $467 = $460 + 4 | 0;
   HEAP32[$467 >> 2] = $466;
  } else {
   HEAP32[6420 >> 2] = 0;
   HEAP32[6432 >> 2] = 0;
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
 $475 = HEAP32[6424 >> 2] | 0;
 $476 = $475 >>> 0 > $$0192 >>> 0;
 if ($476) {
  $477 = $475 - $$0192 | 0;
  HEAP32[6424 >> 2] = $477;
  $478 = HEAP32[6436 >> 2] | 0;
  $479 = $478 + $$0192 | 0;
  HEAP32[6436 >> 2] = $479;
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
 $485 = HEAP32[1721] | 0;
 $486 = ($485 | 0) == 0;
 if ($486) {
  HEAP32[6892 >> 2] = 4096;
  HEAP32[6888 >> 2] = 4096;
  HEAP32[6896 >> 2] = -1;
  HEAP32[6900 >> 2] = -1;
  HEAP32[6904 >> 2] = 0;
  HEAP32[6856 >> 2] = 0;
  $487 = $1;
  $488 = $487 & -16;
  $489 = $488 ^ 1431655768;
  HEAP32[$1 >> 2] = $489;
  HEAP32[1721] = $489;
  $493 = 4096;
 } else {
  $$pre$i195 = HEAP32[6892 >> 2] | 0;
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
 $497 = HEAP32[6852 >> 2] | 0;
 $498 = ($497 | 0) == 0;
 if (!$498) {
  $499 = HEAP32[6844 >> 2] | 0;
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
 $503 = HEAP32[6856 >> 2] | 0;
 $504 = $503 & 4;
 $505 = ($504 | 0) == 0;
 L167 : do {
  if ($505) {
   $506 = HEAP32[6436 >> 2] | 0;
   $507 = ($506 | 0) == (0 | 0);
   L169 : do {
    if ($507) {
     label = 118;
    } else {
     $$0$i20$i = 6860;
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
      $520 = HEAP32[6888 >> 2] | 0;
      $521 = $520 + -1 | 0;
      $522 = $521 & $519;
      $523 = ($522 | 0) == 0;
      $524 = $521 + $519 | 0;
      $525 = 0 - $520 | 0;
      $526 = $524 & $525;
      $527 = $526 - $519 | 0;
      $528 = $523 ? 0 : $527;
      $$$i = $528 + $495 | 0;
      $529 = HEAP32[6844 >> 2] | 0;
      $530 = $$$i + $529 | 0;
      $531 = $$$i >>> 0 > $$0192 >>> 0;
      $532 = $$$i >>> 0 < 2147483647;
      $or$cond$i = $531 & $532;
      if ($or$cond$i) {
       $533 = HEAP32[6852 >> 2] | 0;
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
     $552 = HEAP32[6892 >> 2] | 0;
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
   $562 = HEAP32[6856 >> 2] | 0;
   $563 = $562 | 4;
   HEAP32[6856 >> 2] = $563;
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
  $577 = HEAP32[6844 >> 2] | 0;
  $578 = $577 + $$723947$i | 0;
  HEAP32[6844 >> 2] = $578;
  $579 = HEAP32[6848 >> 2] | 0;
  $580 = $578 >>> 0 > $579 >>> 0;
  if ($580) {
   HEAP32[6848 >> 2] = $578;
  }
  $581 = HEAP32[6436 >> 2] | 0;
  $582 = ($581 | 0) == (0 | 0);
  do {
   if ($582) {
    $583 = HEAP32[6428 >> 2] | 0;
    $584 = ($583 | 0) == (0 | 0);
    $585 = $$748$i >>> 0 < $583 >>> 0;
    $or$cond12$i = $584 | $585;
    if ($or$cond12$i) {
     HEAP32[6428 >> 2] = $$748$i;
    }
    HEAP32[6860 >> 2] = $$748$i;
    HEAP32[6864 >> 2] = $$723947$i;
    HEAP32[6872 >> 2] = 0;
    $586 = HEAP32[1721] | 0;
    HEAP32[6448 >> 2] = $586;
    HEAP32[6444 >> 2] = -1;
    $$01$i$i = 0;
    while (1) {
     $587 = $$01$i$i << 1;
     $588 = 6452 + ($587 << 2) | 0;
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
    HEAP32[6436 >> 2] = $600;
    HEAP32[6424 >> 2] = $601;
    $602 = $601 | 1;
    $603 = $600 + 4 | 0;
    HEAP32[$603 >> 2] = $602;
    $604 = $600 + $601 | 0;
    $605 = $604 + 4 | 0;
    HEAP32[$605 >> 2] = 40;
    $606 = HEAP32[6900 >> 2] | 0;
    HEAP32[6440 >> 2] = $606;
   } else {
    $$024370$i = 6860;
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
       $622 = HEAP32[6424 >> 2] | 0;
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
       HEAP32[6436 >> 2] = $630;
       HEAP32[6424 >> 2] = $632;
       $633 = $632 | 1;
       $634 = $630 + 4 | 0;
       HEAP32[$634 >> 2] = $633;
       $635 = $630 + $632 | 0;
       $636 = $635 + 4 | 0;
       HEAP32[$636 >> 2] = 40;
       $637 = HEAP32[6900 >> 2] | 0;
       HEAP32[6440 >> 2] = $637;
       break;
      }
     }
    }
    $638 = HEAP32[6428 >> 2] | 0;
    $639 = $$748$i >>> 0 < $638 >>> 0;
    if ($639) {
     HEAP32[6428 >> 2] = $$748$i;
    }
    $640 = $$748$i + $$723947$i | 0;
    $$124469$i = 6860;
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
        $677 = HEAP32[6424 >> 2] | 0;
        $678 = $677 + $673 | 0;
        HEAP32[6424 >> 2] = $678;
        HEAP32[6436 >> 2] = $672;
        $679 = $678 | 1;
        $680 = $672 + 4 | 0;
        HEAP32[$680 >> 2] = $679;
       } else {
        $681 = HEAP32[6432 >> 2] | 0;
        $682 = ($668 | 0) == ($681 | 0);
        if ($682) {
         $683 = HEAP32[6420 >> 2] | 0;
         $684 = $683 + $673 | 0;
         HEAP32[6420 >> 2] = $684;
         HEAP32[6432 >> 2] = $672;
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
            $702 = HEAP32[1603] | 0;
            $703 = $702 & $701;
            HEAP32[1603] = $703;
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
           $730 = 6716 + ($729 << 2) | 0;
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
             $735 = HEAP32[6416 >> 2] | 0;
             $736 = $735 & $734;
             HEAP32[6416 >> 2] = $736;
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
         $763 = 6452 + ($762 << 2) | 0;
         $764 = HEAP32[1603] | 0;
         $765 = 1 << $760;
         $766 = $764 & $765;
         $767 = ($766 | 0) == 0;
         if ($767) {
          $768 = $764 | $765;
          HEAP32[1603] = $768;
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
        $799 = 6716 + ($$0269$i$i << 2) | 0;
        $800 = $672 + 28 | 0;
        HEAP32[$800 >> 2] = $$0269$i$i;
        $801 = $672 + 16 | 0;
        $802 = $801 + 4 | 0;
        HEAP32[$802 >> 2] = 0;
        HEAP32[$801 >> 2] = 0;
        $803 = HEAP32[6416 >> 2] | 0;
        $804 = 1 << $$0269$i$i;
        $805 = $803 & $804;
        $806 = ($805 | 0) == 0;
        if ($806) {
         $807 = $803 | $804;
         HEAP32[6416 >> 2] = $807;
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
    $$0$i$i$i = 6860;
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
    HEAP32[6436 >> 2] = $865;
    HEAP32[6424 >> 2] = $866;
    $867 = $866 | 1;
    $868 = $865 + 4 | 0;
    HEAP32[$868 >> 2] = $867;
    $869 = $865 + $866 | 0;
    $870 = $869 + 4 | 0;
    HEAP32[$870 >> 2] = 40;
    $871 = HEAP32[6900 >> 2] | 0;
    HEAP32[6440 >> 2] = $871;
    $872 = $854 + 4 | 0;
    HEAP32[$872 >> 2] = 27;
    HEAP32[$855 >> 2] = HEAP32[6860 >> 2] | 0;
    HEAP32[$855 + 4 >> 2] = HEAP32[6860 + 4 >> 2] | 0;
    HEAP32[$855 + 8 >> 2] = HEAP32[6860 + 8 >> 2] | 0;
    HEAP32[$855 + 12 >> 2] = HEAP32[6860 + 12 >> 2] | 0;
    HEAP32[6860 >> 2] = $$748$i;
    HEAP32[6864 >> 2] = $$723947$i;
    HEAP32[6872 >> 2] = 0;
    HEAP32[6868 >> 2] = $855;
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
      $888 = 6452 + ($887 << 2) | 0;
      $889 = HEAP32[1603] | 0;
      $890 = 1 << $885;
      $891 = $889 & $890;
      $892 = ($891 | 0) == 0;
      if ($892) {
       $893 = $889 | $890;
       HEAP32[1603] = $893;
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
     $924 = 6716 + ($$0207$i$i << 2) | 0;
     $925 = $581 + 28 | 0;
     HEAP32[$925 >> 2] = $$0207$i$i;
     $926 = $581 + 20 | 0;
     HEAP32[$926 >> 2] = 0;
     HEAP32[$852 >> 2] = 0;
     $927 = HEAP32[6416 >> 2] | 0;
     $928 = 1 << $$0207$i$i;
     $929 = $927 & $928;
     $930 = ($929 | 0) == 0;
     if ($930) {
      $931 = $927 | $928;
      HEAP32[6416 >> 2] = $931;
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
  $960 = HEAP32[6424 >> 2] | 0;
  $961 = $960 >>> 0 > $$0192 >>> 0;
  if ($961) {
   $962 = $960 - $$0192 | 0;
   HEAP32[6424 >> 2] = $962;
   $963 = HEAP32[6436 >> 2] | 0;
   $964 = $963 + $$0192 | 0;
   HEAP32[6436 >> 2] = $964;
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
  case 94:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[(HEAP32[sp + (ly << 3) >> 2] | 0) + (HEAP32[sp + (lz << 3) >> 2] | 0) >> 2];
   break;
  case 97:
   HEAP32[(HEAP32[sp + (lx << 3) >> 2] | 0) + (HEAP32[sp + (ly << 3) >> 2] | 0) >> 2] = HEAP32[sp + (lz << 3) >> 2] | 0;
   break;
  case 102:
   HEAP32[sp + (lx << 3) >> 2] = HEAP8[(HEAP32[sp + (ly << 3) >> 2] | 0) + (inst >> 24) >> 0];
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
 $3 = HEAP32[6428 >> 2] | 0;
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
   $17 = HEAP32[6432 >> 2] | 0;
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
    HEAP32[6420 >> 2] = $15;
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
     $28 = HEAP32[1603] | 0;
     $29 = $28 & $27;
     HEAP32[1603] = $29;
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
    $56 = 6716 + ($55 << 2) | 0;
    $57 = HEAP32[$56 >> 2] | 0;
    $58 = ($14 | 0) == ($57 | 0);
    if ($58) {
     HEAP32[$56 >> 2] = $$3;
     $cond374 = ($$3 | 0) == (0 | 0);
     if ($cond374) {
      $59 = 1 << $55;
      $60 = $59 ^ -1;
      $61 = HEAP32[6416 >> 2] | 0;
      $62 = $61 & $60;
      HEAP32[6416 >> 2] = $62;
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
  $94 = HEAP32[6436 >> 2] | 0;
  $95 = ($7 | 0) == ($94 | 0);
  $96 = HEAP32[6432 >> 2] | 0;
  if ($95) {
   $97 = HEAP32[6424 >> 2] | 0;
   $98 = $97 + $$1347 | 0;
   HEAP32[6424 >> 2] = $98;
   HEAP32[6436 >> 2] = $$1;
   $99 = $98 | 1;
   $100 = $$1 + 4 | 0;
   HEAP32[$100 >> 2] = $99;
   $101 = ($$1 | 0) == ($96 | 0);
   if (!$101) {
    return;
   }
   HEAP32[6432 >> 2] = 0;
   HEAP32[6420 >> 2] = 0;
   return;
  }
  $102 = ($7 | 0) == ($96 | 0);
  if ($102) {
   $103 = HEAP32[6420 >> 2] | 0;
   $104 = $103 + $$1347 | 0;
   HEAP32[6420 >> 2] = $104;
   HEAP32[6432 >> 2] = $87;
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
     $119 = HEAP32[1603] | 0;
     $120 = $119 & $118;
     HEAP32[1603] = $120;
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
     $147 = 6716 + ($146 << 2) | 0;
     $148 = HEAP32[$147 >> 2] | 0;
     $149 = ($7 | 0) == ($148 | 0);
     if ($149) {
      HEAP32[$147 >> 2] = $$3365;
      $cond375 = ($$3365 | 0) == (0 | 0);
      if ($cond375) {
       $150 = 1 << $146;
       $151 = $150 ^ -1;
       $152 = HEAP32[6416 >> 2] | 0;
       $153 = $152 & $151;
       HEAP32[6416 >> 2] = $153;
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
  $172 = HEAP32[6432 >> 2] | 0;
  $173 = ($$1 | 0) == ($172 | 0);
  if ($173) {
   HEAP32[6420 >> 2] = $109;
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
  $181 = 6452 + ($180 << 2) | 0;
  $182 = HEAP32[1603] | 0;
  $183 = 1 << $178;
  $184 = $182 & $183;
  $185 = ($184 | 0) == 0;
  if ($185) {
   $186 = $182 | $183;
   HEAP32[1603] = $186;
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
 $217 = 6716 + ($$0361 << 2) | 0;
 $218 = $$1 + 28 | 0;
 HEAP32[$218 >> 2] = $$0361;
 $219 = $$1 + 16 | 0;
 $220 = $$1 + 20 | 0;
 HEAP32[$220 >> 2] = 0;
 HEAP32[$219 >> 2] = 0;
 $221 = HEAP32[6416 >> 2] | 0;
 $222 = 1 << $$0361;
 $223 = $221 & $222;
 $224 = ($223 | 0) == 0;
 do {
  if ($224) {
   $225 = $221 | $222;
   HEAP32[6416 >> 2] = $225;
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
 $253 = HEAP32[6444 >> 2] | 0;
 $254 = $253 + -1 | 0;
 HEAP32[6444 >> 2] = $254;
 $255 = ($254 | 0) == 0;
 if ($255) {
  $$0195$in$i = 6868;
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
 HEAP32[6444 >> 2] = -1;
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
 emterpret(eb + 70820 | 0);
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
 emterpret(eb + 72836 | 0);
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
 emterpret(eb + 72648 | 0);
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
 emterpret(eb + 72868 | 0);
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
 emterpret(eb + 64424 | 0);
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
 emterpret(eb + 43148 | 0);
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
 emterpret(eb + 63968 | 0);
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
 emterpret(eb + 68900 | 0);
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
 emterpret(eb + 73828 | 0);
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
 emterpret(eb + 73088 | 0);
}

function ___stpcpy($0, $1) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 44252 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function _sbrk(increment) {
 increment = increment | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = increment;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 67268 | 0);
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
 emterpret(eb + 68980 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function _llvm_bswap_i32(x) {
 x = x | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = x;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 73440 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function _fflush($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 46844 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function b0(p0) {
 p0 = p0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = p0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 73932 | 0);
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
 emterpret(eb + 73592 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function ___errno_location() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 72936 | 0);
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
 emterpret(eb + 73048 | 0);
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
 emterpret(eb + 42168 | 0);
}

function _match_gr() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 39256 | 0);
}

function _pr_init() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 70536 | 0);
}

function _gr_init() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 69220 | 0);
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




