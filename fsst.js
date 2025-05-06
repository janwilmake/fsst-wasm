// fsst_pre.js - Will be prepended to the compiled module
// This helps with module initialization and compatibility

console.log("FSST WebAssembly module loading with better error handling...");

// Additional error handling for wasm load failures
Module["onAbort"] = function (what) {
  console.error("FSST module initialization aborted:", what);
};
var FSST = (() => {
  var _scriptName = typeof document != 'undefined' ? document.currentScript?.src : undefined;
  return (
async function(moduleArg = {}) {
  var moduleRtn;

var Module=moduleArg;var readyPromiseResolve,readyPromiseReject;var readyPromise=new Promise((resolve,reject)=>{readyPromiseResolve=resolve;readyPromiseReject=reject});var ENVIRONMENT_IS_WEB=typeof window=="object";var ENVIRONMENT_IS_WORKER=typeof WorkerGlobalScope!="undefined";var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string"&&process.type!="renderer";var ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER;var arguments_=[];var thisProgram="./this.program";if(ENVIRONMENT_IS_WORKER){_scriptName=self.location.href}var scriptDirectory="";function locateFile(path){if(Module["locateFile"]){return Module["locateFile"](path,scriptDirectory)}return scriptDirectory+path}var readAsync,readBinary;if(ENVIRONMENT_IS_SHELL){if(typeof process=="object"&&typeof require==="function"||typeof window=="object"||typeof WorkerGlobalScope!="undefined")throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)")}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){try{scriptDirectory=new URL(".",_scriptName).href}catch{}if(!(typeof window=="object"||typeof WorkerGlobalScope!="undefined"))throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");{if(ENVIRONMENT_IS_WORKER){readBinary=url=>{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)}}readAsync=async url=>{assert(!isFileURI(url),"readAsync does not work with file:// URLs");var response=await fetch(url,{credentials:"same-origin"});if(response.ok){return response.arrayBuffer()}throw new Error(response.status+" : "+response.url)}}}else{throw new Error("environment detection error")}var out=console.log.bind(console);var err=console.error.bind(console);assert(!ENVIRONMENT_IS_NODE,"node environment detected but not enabled at build time.  Add `node` to `-sENVIRONMENT` to enable.");assert(!ENVIRONMENT_IS_SHELL,"shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.");var wasmBinary;if(typeof WebAssembly!="object"){err("no native wasm support detected")}var wasmMemory;var ABORT=false;function assert(condition,text){if(!condition){abort("Assertion failed"+(text?": "+text:""))}}var HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAP64,HEAPU64,HEAPF64;var runtimeInitialized=false;var isFileURI=filename=>filename.startsWith("file://");function writeStackCookie(){var max=_emscripten_stack_get_end();assert((max&3)==0);if(max==0){max+=4}HEAPU32[max>>2]=34821223;HEAPU32[max+4>>2]=2310721022;HEAPU32[0>>2]=1668509029}function checkStackCookie(){if(ABORT)return;var max=_emscripten_stack_get_end();if(max==0){max+=4}var cookie1=HEAPU32[max>>2];var cookie2=HEAPU32[max+4>>2];if(cookie1!=34821223||cookie2!=2310721022){abort(`Stack overflow! Stack cookie has been overwritten at ${ptrToString(max)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ptrToString(cookie2)} ${ptrToString(cookie1)}`)}if(HEAPU32[0>>2]!=1668509029){abort("Runtime error: The application has corrupted its heap memory area (address zero)!")}}class EmscriptenEH extends Error{}class EmscriptenSjLj extends EmscriptenEH{}class CppException extends EmscriptenEH{constructor(excPtr){super(excPtr);this.excPtr=excPtr;const excInfo=getExceptionMessage(excPtr);this.name=excInfo[0];this.message=excInfo[1]}}var runtimeDebug=true;(()=>{var h16=new Int16Array(1);var h8=new Int8Array(h16.buffer);h16[0]=25459;if(h8[0]!==115||h8[1]!==99)throw"Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)"})();function consumedModuleProp(prop){if(!Object.getOwnPropertyDescriptor(Module,prop)){Object.defineProperty(Module,prop,{configurable:true,set(){abort(`Attempt to set \`Module.${prop}\` after it has already been processed.  This can happen, for example, when code is injected via '--post-js' rather than '--pre-js'`)}})}}function ignoredModuleProp(prop){if(Object.getOwnPropertyDescriptor(Module,prop)){abort(`\`Module.${prop}\` was supplied but \`${prop}\` not included in INCOMING_MODULE_JS_API`)}}function isExportedByForceFilesystem(name){return name==="FS_createPath"||name==="FS_createDataFile"||name==="FS_createPreloadedFile"||name==="FS_unlink"||name==="addRunDependency"||name==="FS_createLazyFile"||name==="FS_createDevice"||name==="removeRunDependency"}function hookGlobalSymbolAccess(sym,func){}function missingGlobal(sym,msg){hookGlobalSymbolAccess(sym,()=>{warnOnce(`\`${sym}\` is not longer defined by emscripten. ${msg}`)})}missingGlobal("buffer","Please use HEAP8.buffer or wasmMemory.buffer");missingGlobal("asm","Please use wasmExports instead");function missingLibrarySymbol(sym){hookGlobalSymbolAccess(sym,()=>{var msg=`\`${sym}\` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line`;var librarySymbol=sym;if(!librarySymbol.startsWith("_")){librarySymbol="$"+sym}msg+=` (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='${librarySymbol}')`;if(isExportedByForceFilesystem(sym)){msg+=". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you"}warnOnce(msg)});unexportedRuntimeSymbol(sym)}function unexportedRuntimeSymbol(sym){if(!Object.getOwnPropertyDescriptor(Module,sym)){Object.defineProperty(Module,sym,{configurable:true,get(){var msg=`'${sym}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;if(isExportedByForceFilesystem(sym)){msg+=". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you"}abort(msg)}})}}function updateMemoryViews(){var b=wasmMemory.buffer;HEAP8=new Int8Array(b);HEAP16=new Int16Array(b);HEAPU8=new Uint8Array(b);HEAPU16=new Uint16Array(b);HEAP32=new Int32Array(b);HEAPU32=new Uint32Array(b);HEAPF32=new Float32Array(b);HEAPF64=new Float64Array(b);HEAP64=new BigInt64Array(b);HEAPU64=new BigUint64Array(b)}assert(typeof Int32Array!="undefined"&&typeof Float64Array!=="undefined"&&Int32Array.prototype.subarray!=undefined&&Int32Array.prototype.set!=undefined,"JS engine does not provide full typed array support");function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}consumedModuleProp("preRun");callRuntimeCallbacks(onPreRuns)}function initRuntime(){assert(!runtimeInitialized);runtimeInitialized=true;checkStackCookie();wasmExports["__wasm_call_ctors"]()}function postRun(){checkStackCookie();if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}consumedModuleProp("postRun");callRuntimeCallbacks(onPostRuns)}var runDependencies=0;var dependenciesFulfilled=null;var runDependencyTracking={};var runDependencyWatcher=null;function addRunDependency(id){runDependencies++;Module["monitorRunDependencies"]?.(runDependencies);if(id){assert(!runDependencyTracking[id]);runDependencyTracking[id]=1;if(runDependencyWatcher===null&&typeof setInterval!="undefined"){runDependencyWatcher=setInterval(()=>{if(ABORT){clearInterval(runDependencyWatcher);runDependencyWatcher=null;return}var shown=false;for(var dep in runDependencyTracking){if(!shown){shown=true;err("still waiting on run dependencies:")}err(`dependency: ${dep}`)}if(shown){err("(end of list)")}},1e4)}}else{err("warning: run dependency added without ID")}}function removeRunDependency(id){runDependencies--;Module["monitorRunDependencies"]?.(runDependencies);if(id){assert(runDependencyTracking[id]);delete runDependencyTracking[id]}else{err("warning: run dependency removed without ID")}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}function abort(what){Module["onAbort"]?.(what);what="Aborted("+what+")";err(what);ABORT=true;var e=new WebAssembly.RuntimeError(what);readyPromiseReject(e);throw e}var FS={error(){abort("Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM")},init(){FS.error()},createDataFile(){FS.error()},createPreloadedFile(){FS.error()},createLazyFile(){FS.error()},open(){FS.error()},mkdev(){FS.error()},registerDevice(){FS.error()},analyzePath(){FS.error()},ErrnoError(){FS.error()}};function createExportWrapper(name,nargs){return(...args)=>{assert(runtimeInitialized,`native function \`${name}\` called before runtime initialization`);var f=wasmExports[name];assert(f,`exported native function \`${name}\` not found`);assert(args.length<=nargs,`native function \`${name}\` called with ${args.length} args but expects ${nargs}`);return f(...args)}}var wasmBinaryFile;function findWasmBinary(){return locateFile("fsst.wasm")}function getBinarySync(file){if(file==wasmBinaryFile&&wasmBinary){return new Uint8Array(wasmBinary)}if(readBinary){return readBinary(file)}throw"both async and sync fetching of the wasm failed"}async function getWasmBinary(binaryFile){if(!wasmBinary){try{var response=await readAsync(binaryFile);return new Uint8Array(response)}catch{}}return getBinarySync(binaryFile)}async function instantiateArrayBuffer(binaryFile,imports){try{var binary=await getWasmBinary(binaryFile);var instance=await WebAssembly.instantiate(binary,imports);return instance}catch(reason){err(`failed to asynchronously prepare wasm: ${reason}`);if(isFileURI(wasmBinaryFile)){err(`warning: Loading from a file URI (${wasmBinaryFile}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`)}abort(reason)}}async function instantiateAsync(binary,binaryFile,imports){if(!binary&&typeof WebAssembly.instantiateStreaming=="function"){try{var response=fetch(binaryFile,{credentials:"same-origin"});var instantiationResult=await WebAssembly.instantiateStreaming(response,imports);return instantiationResult}catch(reason){err(`wasm streaming compile failed: ${reason}`);err("falling back to ArrayBuffer instantiation")}}return instantiateArrayBuffer(binaryFile,imports)}function getWasmImports(){return{env:wasmImports,wasi_snapshot_preview1:wasmImports}}async function createWasm(){function receiveInstance(instance,module){wasmExports=instance.exports;wasmMemory=wasmExports["memory"];assert(wasmMemory,"memory not found in wasm exports");updateMemoryViews();wasmTable=wasmExports["__indirect_function_table"];assert(wasmTable,"table not found in wasm exports");removeRunDependency("wasm-instantiate");return wasmExports}addRunDependency("wasm-instantiate");var trueModule=Module;function receiveInstantiationResult(result){assert(Module===trueModule,"the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");trueModule=null;return receiveInstance(result["instance"])}var info=getWasmImports();if(Module["instantiateWasm"]){return new Promise((resolve,reject)=>{try{Module["instantiateWasm"](info,(mod,inst)=>{resolve(receiveInstance(mod,inst))})}catch(e){err(`Module.instantiateWasm callback failed with error: ${e}`);reject(e)}})}wasmBinaryFile??=findWasmBinary();try{var result=await instantiateAsync(wasmBinary,wasmBinaryFile,info);var exports=receiveInstantiationResult(result);return exports}catch(e){readyPromiseReject(e);return Promise.reject(e)}}class ExitStatus{name="ExitStatus";constructor(status){this.message=`Program terminated with exit(${status})`;this.status=status}}var callRuntimeCallbacks=callbacks=>{while(callbacks.length>0){callbacks.shift()(Module)}};var onPostRuns=[];var addOnPostRun=cb=>onPostRuns.push(cb);var onPreRuns=[];var addOnPreRun=cb=>onPreRuns.push(cb);function getValue(ptr,type="i8"){if(type.endsWith("*"))type="*";switch(type){case"i1":return HEAP8[ptr];case"i8":return HEAP8[ptr];case"i16":return HEAP16[ptr>>1];case"i32":return HEAP32[ptr>>2];case"i64":return HEAP64[ptr>>3];case"float":return HEAPF32[ptr>>2];case"double":return HEAPF64[ptr>>3];case"*":return HEAPU32[ptr>>2];default:abort(`invalid type for getValue: ${type}`)}}var noExitRuntime=true;var ptrToString=ptr=>{assert(typeof ptr==="number");ptr>>>=0;return"0x"+ptr.toString(16).padStart(8,"0")};function setValue(ptr,value,type="i8"){if(type.endsWith("*"))type="*";switch(type){case"i1":HEAP8[ptr]=value;break;case"i8":HEAP8[ptr]=value;break;case"i16":HEAP16[ptr>>1]=value;break;case"i32":HEAP32[ptr>>2]=value;break;case"i64":HEAP64[ptr>>3]=BigInt(value);break;case"float":HEAPF32[ptr>>2]=value;break;case"double":HEAPF64[ptr>>3]=value;break;case"*":HEAPU32[ptr>>2]=value;break;default:abort(`invalid type for setValue: ${type}`)}}var stackRestore=val=>__emscripten_stack_restore(val);var stackSave=()=>_emscripten_stack_get_current();var warnOnce=text=>{warnOnce.shown||={};if(!warnOnce.shown[text]){warnOnce.shown[text]=1;err(text)}};var UTF8Decoder=typeof TextDecoder!="undefined"?new TextDecoder:undefined;var UTF8ArrayToString=(heapOrArray,idx=0,maxBytesToRead=NaN)=>{var endIdx=idx+maxBytesToRead;var endPtr=idx;while(heapOrArray[endPtr]&&!(endPtr>=endIdx))++endPtr;if(endPtr-idx>16&&heapOrArray.buffer&&UTF8Decoder){return UTF8Decoder.decode(heapOrArray.subarray(idx,endPtr))}var str="";while(idx<endPtr){var u0=heapOrArray[idx++];if(!(u0&128)){str+=String.fromCharCode(u0);continue}var u1=heapOrArray[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}var u2=heapOrArray[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{if((u0&248)!=240)warnOnce("Invalid UTF-8 leading byte "+ptrToString(u0)+" encountered when deserializing a UTF-8 string in wasm memory to a JS string!");u0=(u0&7)<<18|u1<<12|u2<<6|heapOrArray[idx++]&63}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}return str};var UTF8ToString=(ptr,maxBytesToRead)=>{assert(typeof ptr=="number",`UTF8ToString expects a number (got ${typeof ptr})`);return ptr?UTF8ArrayToString(HEAPU8,ptr,maxBytesToRead):""};var ___assert_fail=(condition,filename,line,func)=>abort(`Assertion failed: ${UTF8ToString(condition)}, at: `+[filename?UTF8ToString(filename):"unknown filename",line,func?UTF8ToString(func):"unknown function"]);var exceptionCaught=[];var uncaughtExceptionCount=0;var ___cxa_begin_catch=ptr=>{var info=new ExceptionInfo(ptr);if(!info.get_caught()){info.set_caught(true);uncaughtExceptionCount--}info.set_rethrown(false);exceptionCaught.push(info);___cxa_increment_exception_refcount(ptr);return ___cxa_get_exception_ptr(ptr)};var exceptionLast=0;class ExceptionInfo{constructor(excPtr){this.excPtr=excPtr;this.ptr=excPtr-24}set_type(type){HEAPU32[this.ptr+4>>2]=type}get_type(){return HEAPU32[this.ptr+4>>2]}set_destructor(destructor){HEAPU32[this.ptr+8>>2]=destructor}get_destructor(){return HEAPU32[this.ptr+8>>2]}set_caught(caught){caught=caught?1:0;HEAP8[this.ptr+12]=caught}get_caught(){return HEAP8[this.ptr+12]!=0}set_rethrown(rethrown){rethrown=rethrown?1:0;HEAP8[this.ptr+13]=rethrown}get_rethrown(){return HEAP8[this.ptr+13]!=0}init(type,destructor){this.set_adjusted_ptr(0);this.set_type(type);this.set_destructor(destructor)}set_adjusted_ptr(adjustedPtr){HEAPU32[this.ptr+16>>2]=adjustedPtr}get_adjusted_ptr(){return HEAPU32[this.ptr+16>>2]}}var setTempRet0=val=>__emscripten_tempret_set(val);var findMatchingCatch=args=>{var thrown=exceptionLast?.excPtr;if(!thrown){setTempRet0(0);return 0}var info=new ExceptionInfo(thrown);info.set_adjusted_ptr(thrown);var thrownType=info.get_type();if(!thrownType){setTempRet0(0);return thrown}for(var caughtType of args){if(caughtType===0||caughtType===thrownType){break}var adjusted_ptr_addr=info.ptr+16;if(___cxa_can_catch(caughtType,thrownType,adjusted_ptr_addr)){setTempRet0(caughtType);return thrown}}setTempRet0(thrownType);return thrown};var ___cxa_find_matching_catch_2=()=>findMatchingCatch([]);var ___cxa_find_matching_catch_3=arg0=>findMatchingCatch([arg0]);var ___cxa_throw=(ptr,type,destructor)=>{var info=new ExceptionInfo(ptr);info.init(type,destructor);exceptionLast=new CppException(ptr);uncaughtExceptionCount++;throw exceptionLast};var ___resumeException=ptr=>{if(!exceptionLast){exceptionLast=new CppException(ptr)}throw exceptionLast};var __abort_js=()=>abort("native code called abort()");var getHeapMax=()=>2147483648;var alignMemory=(size,alignment)=>{assert(alignment,"alignment argument is required");return Math.ceil(size/alignment)*alignment};var growMemory=size=>{var b=wasmMemory.buffer;var pages=(size-b.byteLength+65535)/65536|0;try{wasmMemory.grow(pages);updateMemoryViews();return 1}catch(e){err(`growMemory: Attempted to grow heap from ${b.byteLength} bytes to ${size} bytes, but got error: ${e}`)}};var _emscripten_resize_heap=requestedSize=>{var oldSize=HEAPU8.length;requestedSize>>>=0;assert(requestedSize>oldSize);var maxHeapSize=getHeapMax();if(requestedSize>maxHeapSize){err(`Cannot enlarge memory, requested ${requestedSize} bytes, but the limit is ${maxHeapSize} bytes!`);return false}for(var cutDown=1;cutDown<=4;cutDown*=2){var overGrownHeapSize=oldSize*(1+.2/cutDown);overGrownHeapSize=Math.min(overGrownHeapSize,requestedSize+100663296);var newSize=Math.min(maxHeapSize,alignMemory(Math.max(requestedSize,overGrownHeapSize),65536));var replacement=growMemory(newSize);if(replacement){return true}}err(`Failed to grow the heap from ${oldSize} bytes to ${newSize} bytes, not enough memory!`);return false};var _fd_close=fd=>{abort("fd_close called without SYSCALLS_REQUIRE_FILESYSTEM")};var INT53_MAX=9007199254740992;var INT53_MIN=-9007199254740992;var bigintToI53Checked=num=>num<INT53_MIN||num>INT53_MAX?NaN:Number(num);function _fd_seek(fd,offset,whence,newOffset){offset=bigintToI53Checked(offset);return 70}var printCharBuffers=[null,[],[]];var printChar=(stream,curr)=>{var buffer=printCharBuffers[stream];assert(buffer);if(curr===0||curr===10){(stream===1?out:err)(UTF8ArrayToString(buffer));buffer.length=0}else{buffer.push(curr)}};var flush_NO_FILESYSTEM=()=>{_fflush(0);if(printCharBuffers[1].length)printChar(1,10);if(printCharBuffers[2].length)printChar(2,10)};var _fd_write=(fd,iov,iovcnt,pnum)=>{var num=0;for(var i=0;i<iovcnt;i++){var ptr=HEAPU32[iov>>2];var len=HEAPU32[iov+4>>2];iov+=8;for(var j=0;j<len;j++){printChar(fd,HEAPU8[ptr+j])}num+=len}HEAPU32[pnum>>2]=num;return 0};var wasmTableMirror=[];var wasmTable;var getWasmTableEntry=funcPtr=>{var func=wasmTableMirror[funcPtr];if(!func){wasmTableMirror[funcPtr]=func=wasmTable.get(funcPtr)}assert(wasmTable.get(funcPtr)==func,"JavaScript-side Wasm function table mirror is out of date!");return func};var getCFunc=ident=>{var func=Module["_"+ident];assert(func,"Cannot call unknown function "+ident+", make sure it is exported");return func};var writeArrayToMemory=(array,buffer)=>{assert(array.length>=0,"writeArrayToMemory array must have a length (should be an array or typed array)");HEAP8.set(array,buffer)};var lengthBytesUTF8=str=>{var len=0;for(var i=0;i<str.length;++i){var c=str.charCodeAt(i);if(c<=127){len++}else if(c<=2047){len+=2}else if(c>=55296&&c<=57343){len+=4;++i}else{len+=3}}return len};var stringToUTF8Array=(str,heap,outIdx,maxBytesToWrite)=>{assert(typeof str==="string",`stringToUTF8Array expects a string (got ${typeof str})`);if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343){var u1=str.charCodeAt(++i);u=65536+((u&1023)<<10)|u1&1023}if(u<=127){if(outIdx>=endIdx)break;heap[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;heap[outIdx++]=192|u>>6;heap[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;heap[outIdx++]=224|u>>12;heap[outIdx++]=128|u>>6&63;heap[outIdx++]=128|u&63}else{if(outIdx+3>=endIdx)break;if(u>1114111)warnOnce("Invalid Unicode code point "+ptrToString(u)+" encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).");heap[outIdx++]=240|u>>18;heap[outIdx++]=128|u>>12&63;heap[outIdx++]=128|u>>6&63;heap[outIdx++]=128|u&63}}heap[outIdx]=0;return outIdx-startIdx};var stringToUTF8=(str,outPtr,maxBytesToWrite)=>{assert(typeof maxBytesToWrite=="number","stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");return stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite)};var stackAlloc=sz=>__emscripten_stack_alloc(sz);var stringToUTF8OnStack=str=>{var size=lengthBytesUTF8(str)+1;var ret=stackAlloc(size);stringToUTF8(str,ret,size);return ret};var ccall=(ident,returnType,argTypes,args,opts)=>{var toC={string:str=>{var ret=0;if(str!==null&&str!==undefined&&str!==0){ret=stringToUTF8OnStack(str)}return ret},array:arr=>{var ret=stackAlloc(arr.length);writeArrayToMemory(arr,ret);return ret}};function convertReturnValue(ret){if(returnType==="string"){return UTF8ToString(ret)}if(returnType==="boolean")return Boolean(ret);return ret}var func=getCFunc(ident);var cArgs=[];var stack=0;assert(returnType!=="array",'Return type should not be "array".');if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=stackSave();cArgs[i]=converter(args[i])}else{cArgs[i]=args[i]}}}var ret=func(...cArgs);function onDone(ret){if(stack!==0)stackRestore(stack);return convertReturnValue(ret)}ret=onDone(ret);return ret};var cwrap=(ident,returnType,argTypes,opts)=>(...args)=>ccall(ident,returnType,argTypes,args,opts);var incrementExceptionRefcount=ptr=>___cxa_increment_exception_refcount(ptr);var decrementExceptionRefcount=ptr=>___cxa_decrement_exception_refcount(ptr);var getExceptionMessageCommon=ptr=>{var sp=stackSave();var type_addr_addr=stackAlloc(4);var message_addr_addr=stackAlloc(4);___get_exception_message(ptr,type_addr_addr,message_addr_addr);var type_addr=HEAPU32[type_addr_addr>>2];var message_addr=HEAPU32[message_addr_addr>>2];var type=UTF8ToString(type_addr);_free(type_addr);var message;if(message_addr){message=UTF8ToString(message_addr);_free(message_addr)}stackRestore(sp);return[type,message]};var getExceptionMessage=ptr=>getExceptionMessageCommon(ptr);{if(Module["noExitRuntime"])noExitRuntime=Module["noExitRuntime"];if(Module["print"])out=Module["print"];if(Module["printErr"])err=Module["printErr"];if(Module["wasmBinary"])wasmBinary=Module["wasmBinary"];Module["FS_createDataFile"]=FS.createDataFile;Module["FS_createPreloadedFile"]=FS.createPreloadedFile;checkIncomingModuleAPI();if(Module["arguments"])arguments_=Module["arguments"];if(Module["thisProgram"])thisProgram=Module["thisProgram"];assert(typeof Module["memoryInitializerPrefixURL"]=="undefined","Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");assert(typeof Module["pthreadMainPrefixURL"]=="undefined","Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");assert(typeof Module["cdInitializerPrefixURL"]=="undefined","Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");assert(typeof Module["filePackagePrefixURL"]=="undefined","Module.filePackagePrefixURL option was removed, use Module.locateFile instead");assert(typeof Module["read"]=="undefined","Module.read option was removed");assert(typeof Module["readAsync"]=="undefined","Module.readAsync option was removed (modify readAsync in JS)");assert(typeof Module["readBinary"]=="undefined","Module.readBinary option was removed (modify readBinary in JS)");assert(typeof Module["setWindowTitle"]=="undefined","Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)");assert(typeof Module["TOTAL_MEMORY"]=="undefined","Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY");assert(typeof Module["ENVIRONMENT"]=="undefined","Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");assert(typeof Module["STACK_SIZE"]=="undefined","STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time");assert(typeof Module["wasmMemory"]=="undefined","Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally");assert(typeof Module["INITIAL_MEMORY"]=="undefined","Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically")}Module["cwrap"]=cwrap;Module["setValue"]=setValue;Module["getValue"]=getValue;Module["UTF8ToString"]=UTF8ToString;Module["writeArrayToMemory"]=writeArrayToMemory;var missingLibrarySymbols=["writeI53ToI64","writeI53ToI64Clamped","writeI53ToI64Signaling","writeI53ToU64Clamped","writeI53ToU64Signaling","readI53FromI64","readI53FromU64","convertI32PairToI53","convertI32PairToI53Checked","convertU32PairToI53","getTempRet0","zeroMemory","exitJS","strError","inetPton4","inetNtop4","inetPton6","inetNtop6","readSockaddr","writeSockaddr","emscriptenLog","readEmAsmArgs","jstoi_q","getExecutableName","listenOnce","autoResumeAudioContext","getDynCaller","dynCall","handleException","keepRuntimeAlive","runtimeKeepalivePush","runtimeKeepalivePop","callUserCallback","maybeExit","asmjsMangle","asyncLoad","mmapAlloc","HandleAllocator","getNativeTypeSize","addOnInit","addOnPostCtor","addOnPreMain","addOnExit","STACK_SIZE","STACK_ALIGN","POINTER_SIZE","ASSERTIONS","uleb128Encode","sigToWasmTypes","generateFuncType","convertJsFunctionToWasm","getEmptyTableSlot","updateTableMap","getFunctionAddress","addFunction","removeFunction","reallyNegative","unSign","strLen","reSign","formatString","intArrayFromString","intArrayToString","AsciiToString","stringToAscii","UTF16ToString","stringToUTF16","lengthBytesUTF16","UTF32ToString","stringToUTF32","lengthBytesUTF32","stringToNewUTF8","registerKeyEventCallback","maybeCStringToJsString","findEventTarget","getBoundingClientRect","fillMouseEventData","registerMouseEventCallback","registerWheelEventCallback","registerUiEventCallback","registerFocusEventCallback","fillDeviceOrientationEventData","registerDeviceOrientationEventCallback","fillDeviceMotionEventData","registerDeviceMotionEventCallback","screenOrientation","fillOrientationChangeEventData","registerOrientationChangeEventCallback","fillFullscreenChangeEventData","registerFullscreenChangeEventCallback","JSEvents_requestFullscreen","JSEvents_resizeCanvasForFullscreen","registerRestoreOldStyle","hideEverythingExceptGivenElement","restoreHiddenElements","setLetterbox","softFullscreenResizeWebGLRenderTarget","doRequestFullscreen","fillPointerlockChangeEventData","registerPointerlockChangeEventCallback","registerPointerlockErrorEventCallback","requestPointerLock","fillVisibilityChangeEventData","registerVisibilityChangeEventCallback","registerTouchEventCallback","fillGamepadEventData","registerGamepadEventCallback","registerBeforeUnloadEventCallback","fillBatteryEventData","battery","registerBatteryEventCallback","setCanvasElementSize","getCanvasElementSize","jsStackTrace","getCallstack","convertPCtoSourceLocation","getEnvStrings","checkWasiClock","wasiRightsToMuslOFlags","wasiOFlagsToMuslOFlags","initRandomFill","randomFill","safeSetTimeout","setImmediateWrapped","safeRequestAnimationFrame","clearImmediateWrapped","registerPostMainLoop","registerPreMainLoop","getPromise","makePromise","idsToPromises","makePromiseCallback","Browser_asyncPrepareDataCounter","isLeapYear","ydayFromDate","arraySum","addDays","getSocketFromFD","getSocketAddress","FS_createPreloadedFile","FS_modeStringToFlags","FS_getMode","FS_stdin_getChar","FS_mkdirTree","_setNetworkCallback","heapObjectForWebGLType","toTypedArrayIndex","webgl_enable_ANGLE_instanced_arrays","webgl_enable_OES_vertex_array_object","webgl_enable_WEBGL_draw_buffers","webgl_enable_WEBGL_multi_draw","webgl_enable_EXT_polygon_offset_clamp","webgl_enable_EXT_clip_control","webgl_enable_WEBGL_polygon_mode","emscriptenWebGLGet","computeUnpackAlignedImageSize","colorChannelsInGlTextureFormat","emscriptenWebGLGetTexPixelData","emscriptenWebGLGetUniform","webglGetUniformLocation","webglPrepareUniformLocationsBeforeFirstUse","webglGetLeftBracePos","emscriptenWebGLGetVertexAttrib","__glGetActiveAttribOrUniform","writeGLArray","registerWebGlEventCallback","runAndAbortIfError","ALLOC_NORMAL","ALLOC_STACK","allocate","writeStringToMemory","writeAsciiToMemory","demangle","stackTrace"];missingLibrarySymbols.forEach(missingLibrarySymbol);var unexportedSymbols=["run","addRunDependency","removeRunDependency","out","err","callMain","abort","wasmMemory","wasmExports","HEAPF32","HEAPF64","HEAP8","HEAPU8","HEAP16","HEAPU16","HEAP32","HEAPU32","HEAP64","HEAPU64","writeStackCookie","checkStackCookie","INT53_MAX","INT53_MIN","bigintToI53Checked","stackSave","stackRestore","stackAlloc","setTempRet0","ptrToString","getHeapMax","growMemory","ENV","ERRNO_CODES","DNS","Protocols","Sockets","timers","warnOnce","readEmAsmArgsArray","alignMemory","wasmTable","noExitRuntime","addOnPreRun","addOnPostRun","getCFunc","ccall","freeTableIndexes","functionsInTableMap","PATH","PATH_FS","UTF8Decoder","UTF8ArrayToString","stringToUTF8Array","stringToUTF8","lengthBytesUTF8","UTF16Decoder","stringToUTF8OnStack","JSEvents","specialHTMLTargets","findCanvasEventTarget","currentFullscreenStrategy","restoreOldWindowedStyle","UNWIND_CACHE","ExitStatus","flush_NO_FILESYSTEM","emSetImmediate","emClearImmediate_deps","emClearImmediate","promiseMap","uncaughtExceptionCount","exceptionLast","exceptionCaught","ExceptionInfo","findMatchingCatch","getExceptionMessageCommon","Browser","getPreloadedImageData__data","wget","MONTH_DAYS_REGULAR","MONTH_DAYS_LEAP","MONTH_DAYS_REGULAR_CUMULATIVE","MONTH_DAYS_LEAP_CUMULATIVE","SYSCALLS","preloadPlugins","FS_stdin_getChar_buffer","FS_unlink","FS_createPath","FS_createDevice","FS_readFile","FS","FS_root","FS_mounts","FS_devices","FS_streams","FS_nextInode","FS_nameTable","FS_currentPath","FS_initialized","FS_ignorePermissions","FS_filesystems","FS_syncFSRequests","FS_readFiles","FS_lookupPath","FS_getPath","FS_hashName","FS_hashAddNode","FS_hashRemoveNode","FS_lookupNode","FS_createNode","FS_destroyNode","FS_isRoot","FS_isMountpoint","FS_isFile","FS_isDir","FS_isLink","FS_isChrdev","FS_isBlkdev","FS_isFIFO","FS_isSocket","FS_flagsToPermissionString","FS_nodePermissions","FS_mayLookup","FS_mayCreate","FS_mayDelete","FS_mayOpen","FS_checkOpExists","FS_nextfd","FS_getStreamChecked","FS_getStream","FS_createStream","FS_closeStream","FS_dupStream","FS_doSetAttr","FS_chrdev_stream_ops","FS_major","FS_minor","FS_makedev","FS_registerDevice","FS_getDevice","FS_getMounts","FS_syncfs","FS_mount","FS_unmount","FS_lookup","FS_mknod","FS_statfs","FS_statfsStream","FS_statfsNode","FS_create","FS_mkdir","FS_mkdev","FS_symlink","FS_rename","FS_rmdir","FS_readdir","FS_readlink","FS_stat","FS_fstat","FS_lstat","FS_doChmod","FS_chmod","FS_lchmod","FS_fchmod","FS_doChown","FS_chown","FS_lchown","FS_fchown","FS_doTruncate","FS_truncate","FS_ftruncate","FS_utime","FS_open","FS_close","FS_isClosed","FS_llseek","FS_read","FS_write","FS_mmap","FS_msync","FS_ioctl","FS_writeFile","FS_cwd","FS_chdir","FS_createDefaultDirectories","FS_createDefaultDevices","FS_createSpecialDirectories","FS_createStandardStreams","FS_staticInit","FS_init","FS_quit","FS_findObject","FS_analyzePath","FS_createFile","FS_createDataFile","FS_forceLoadFile","FS_createLazyFile","FS_absolutePath","FS_createFolder","FS_createLink","FS_joinPath","FS_mmapAlloc","FS_standardizePath","MEMFS","TTY","PIPEFS","SOCKFS","tempFixedLengthArray","miniTempWebGLFloatBuffers","miniTempWebGLIntBuffers","GL","AL","GLUT","EGL","GLEW","IDBStore","SDL","SDL_gfx","allocateUTF8","allocateUTF8OnStack","print","printErr","jstoi_s"];unexportedSymbols.forEach(unexportedRuntimeSymbol);Module["incrementExceptionRefcount"]=incrementExceptionRefcount;Module["decrementExceptionRefcount"]=decrementExceptionRefcount;Module["getExceptionMessage"]=getExceptionMessage;function checkIncomingModuleAPI(){ignoredModuleProp("fetchSettings")}var wasmImports={__assert_fail:___assert_fail,__cxa_begin_catch:___cxa_begin_catch,__cxa_find_matching_catch_2:___cxa_find_matching_catch_2,__cxa_find_matching_catch_3:___cxa_find_matching_catch_3,__cxa_throw:___cxa_throw,__resumeException:___resumeException,_abort_js:__abort_js,emscripten_resize_heap:_emscripten_resize_heap,fd_close:_fd_close,fd_seek:_fd_seek,fd_write:_fd_write,invoke_ii,invoke_iii,invoke_v,invoke_vi,invoke_vii,invoke_viii,invoke_viiii};var wasmExports=await createWasm();var ___wasm_call_ctors=createExportWrapper("__wasm_call_ctors",0);var _fsst_create_encoder=Module["_fsst_create_encoder"]=createExportWrapper("fsst_create_encoder",4);var _fsst_free_encoder=Module["_fsst_free_encoder"]=createExportWrapper("fsst_free_encoder",1);var _fsst_export_encoder=Module["_fsst_export_encoder"]=createExportWrapper("fsst_export_encoder",2);var _fsst_import_decoder=Module["_fsst_import_decoder"]=createExportWrapper("fsst_import_decoder",2);var _fsst_compress=Module["_fsst_compress"]=createExportWrapper("fsst_compress",5);var _fsst_decompress=Module["_fsst_decompress"]=createExportWrapper("fsst_decompress",5);var _fsst_malloc=Module["_fsst_malloc"]=createExportWrapper("fsst_malloc",1);var _fsst_free=Module["_fsst_free"]=createExportWrapper("fsst_free",1);var ___cxa_free_exception=createExportWrapper("__cxa_free_exception",1);var _fflush=createExportWrapper("fflush",1);var _strerror=createExportWrapper("strerror",1);var _free=createExportWrapper("free",1);var _setThrew=createExportWrapper("setThrew",2);var __emscripten_tempret_set=createExportWrapper("_emscripten_tempret_set",1);var _emscripten_stack_init=wasmExports["emscripten_stack_init"];var _emscripten_stack_get_free=wasmExports["emscripten_stack_get_free"];var _emscripten_stack_get_base=wasmExports["emscripten_stack_get_base"];var _emscripten_stack_get_end=wasmExports["emscripten_stack_get_end"];var __emscripten_stack_restore=wasmExports["_emscripten_stack_restore"];var __emscripten_stack_alloc=wasmExports["_emscripten_stack_alloc"];var _emscripten_stack_get_current=wasmExports["emscripten_stack_get_current"];var ___cxa_increment_exception_refcount=createExportWrapper("__cxa_increment_exception_refcount",1);var ___cxa_decrement_exception_refcount=createExportWrapper("__cxa_decrement_exception_refcount",1);var ___get_exception_message=createExportWrapper("__get_exception_message",3);var ___cxa_can_catch=createExportWrapper("__cxa_can_catch",3);var ___cxa_get_exception_ptr=createExportWrapper("__cxa_get_exception_ptr",1);function invoke_ii(index,a1){var sp=stackSave();try{return getWasmTableEntry(index)(a1)}catch(e){stackRestore(sp);if(!(e instanceof EmscriptenEH))throw e;_setThrew(1,0)}}function invoke_vi(index,a1){var sp=stackSave();try{getWasmTableEntry(index)(a1)}catch(e){stackRestore(sp);if(!(e instanceof EmscriptenEH))throw e;_setThrew(1,0)}}function invoke_viiii(index,a1,a2,a3,a4){var sp=stackSave();try{getWasmTableEntry(index)(a1,a2,a3,a4)}catch(e){stackRestore(sp);if(!(e instanceof EmscriptenEH))throw e;_setThrew(1,0)}}function invoke_v(index){var sp=stackSave();try{getWasmTableEntry(index)()}catch(e){stackRestore(sp);if(!(e instanceof EmscriptenEH))throw e;_setThrew(1,0)}}function invoke_vii(index,a1,a2){var sp=stackSave();try{getWasmTableEntry(index)(a1,a2)}catch(e){stackRestore(sp);if(!(e instanceof EmscriptenEH))throw e;_setThrew(1,0)}}function invoke_iii(index,a1,a2){var sp=stackSave();try{return getWasmTableEntry(index)(a1,a2)}catch(e){stackRestore(sp);if(!(e instanceof EmscriptenEH))throw e;_setThrew(1,0)}}function invoke_viii(index,a1,a2,a3){var sp=stackSave();try{getWasmTableEntry(index)(a1,a2,a3)}catch(e){stackRestore(sp);if(!(e instanceof EmscriptenEH))throw e;_setThrew(1,0)}}var calledRun;function stackCheckInit(){_emscripten_stack_init();writeStackCookie()}function run(){if(runDependencies>0){dependenciesFulfilled=run;return}stackCheckInit();preRun();if(runDependencies>0){dependenciesFulfilled=run;return}function doRun(){assert(!calledRun);calledRun=true;Module["calledRun"]=true;if(ABORT)return;initRuntime();readyPromiseResolve(Module);Module["onRuntimeInitialized"]?.();consumedModuleProp("onRuntimeInitialized");assert(!Module["_main"],'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout(()=>{setTimeout(()=>Module["setStatus"](""),1);doRun()},1)}else{doRun()}checkStackCookie()}function preInit(){if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].shift()()}}consumedModuleProp("preInit")}preInit();run();moduleRtn=readyPromise;for(const prop of Object.keys(Module)){if(!(prop in moduleArg)){Object.defineProperty(moduleArg,prop,{configurable:true,get(){abort(`Access to module property ('${prop}') is no longer possible via the module constructor argument; Instead, use the result of the module constructor.`)}})}}


  return moduleRtn;
}
);
})();
if (typeof exports === 'object' && typeof module === 'object') {
  module.exports = FSST;
  // This default export looks redundant, but it allows TS to import this
  // commonjs style module.
  module.exports.default = FSST;
} else if (typeof define === 'function' && define['amd'])
  define([], () => FSST);
// fsst_post.js - Will be appended to the compiled module
// This adds the wrapper code that makes the module easier to use

console.log("Adding FSST wrapper...");

// Create a wrapper around the FSST module
function createFsstWrapper() {
  return {
    async init() {
      if (!this.module) {
        console.log("Initializing FSST module in wrapper...");
        try {
          this.module = await FSST();

          // Create function wrappers
          this.createEncoderFn = this.module.cwrap(
            "fsst_create_encoder",
            "number",
            ["number", "number", "number", "number"],
          );
          this.freeEncoderFn = this.module.cwrap("fsst_free_encoder", "void", [
            "number",
          ]);
          this.exportEncoderFn = this.module.cwrap(
            "fsst_export_encoder",
            "number",
            ["number", "number"],
          );
          this.importDecoderFn = this.module.cwrap(
            "fsst_import_decoder",
            "number",
            ["number", "number"],
          );
          this.compressFn = this.module.cwrap("fsst_compress", "number", [
            "number",
            "number",
            "number",
            "number",
            "number",
          ]);
          this.decompressFn = this.module.cwrap("fsst_decompress", "number", [
            "number",
            "number",
            "number",
            "number",
            "number",
          ]);
          console.log("FSST module wrapper initialized successfully");
        } catch (err) {
          console.error("Failed to initialize FSST module:", err);
          throw err;
        }
      }
    },

    createEncoder(samples, zeroTerminated = false) {
      if (!this.module || !this.createEncoderFn) {
        throw new Error("FSST module not initialized. Call init() first.");
      }

      console.log(`Creating encoder with ${samples.length} samples...`);

      // Create and fill pointer arrays
      const stringsPtr = this.module._malloc(samples.length * 4);
      const lengthsPtr = this.module._malloc(samples.length * 4);

      const stringPtrs = [];

      // Allocate and copy each sample
      for (let i = 0; i < samples.length; i++) {
        const sample = samples[i];
        const samplePtr = this.module._malloc(sample.length);
        this.module.writeArrayToMemory(sample, samplePtr);
        stringPtrs.push(samplePtr);

        // Write string pointer and length to arrays
        this.module.setValue(stringsPtr + i * 4, samplePtr, "i32");
        this.module.setValue(lengthsPtr + i * 4, sample.length, "i32");
      }

      // Create the encoder
      console.log("Calling fsst_create_encoder...");
      const encoderPtr = this.createEncoderFn(
        stringsPtr,
        lengthsPtr,
        samples.length,
        zeroTerminated ? 1 : 0,
      );
      console.log(`Create encoder returned: ${encoderPtr}`);

      // Free temporary memory
      for (const ptr of stringPtrs) {
        this.module._free(ptr);
      }
      this.module._free(stringsPtr);
      this.module._free(lengthsPtr);

      if (encoderPtr === 0) {
        throw new Error("Failed to create FSST encoder");
      }

      const module = this.module;
      const compressFn = this.compressFn;
      const exportEncoderFn = this.exportEncoderFn;
      const freeEncoderFn = this.freeEncoderFn;

      return {
        compress(data) {
          console.log(`Compressing ${data.length} bytes of data...`);
          // Allocate memory for input
          const inputPtr = module._malloc(data.length);
          module.writeArrayToMemory(data, inputPtr);

          // Allocate memory for output (assume worst case: 2x input size)
          const outputMaxLength = data.length * 2;
          const outputPtr = module._malloc(outputMaxLength);

          // Compress the data
          const outputLength = compressFn(
            encoderPtr,
            inputPtr,
            data.length,
            outputPtr,
            outputMaxLength,
          );

          // Copy the result to a new buffer
          const result = new Uint8Array(outputLength);
          result.set(
            module.HEAPU8.subarray(outputPtr, outputPtr + outputLength),
          );

          // Free temporary memory
          module._free(inputPtr);
          module._free(outputPtr);

          return result;
        },

        export() {
          console.log("Exporting encoder...");
          // Allocate memory for the exported encoder (we need a fairly large buffer)
          const bufferSize = 4096; // Should be enough for any dictionary
          const bufferPtr = module._malloc(bufferSize);

          // Export the encoder
          const exportSize = exportEncoderFn(encoderPtr, bufferPtr);

          // Copy the result to a new buffer
          const result = new Uint8Array(exportSize);
          result.set(module.HEAPU8.subarray(bufferPtr, bufferPtr + exportSize));

          // Free temporary memory
          module._free(bufferPtr);

          return result;
        },

        free() {
          console.log("Freeing encoder resources...");
          freeEncoderFn(encoderPtr);
        },
      };
    },

    createDecoder(encoderData) {
      if (!this.module || !this.importDecoderFn) {
        throw new Error("FSST module not initialized. Call init() first.");
      }

      console.log(
        `Creating decoder from ${encoderData.length} bytes of encoder data...`,
      );

      // Allocate decoder structure and buffer for encoder data
      const decoderPtr = this.module._malloc(8 * 256 + 256); // 8 bytes per symbol + 1 byte per length
      const bufferPtr = this.module._malloc(encoderData.length);

      // Copy encoder data
      this.module.writeArrayToMemory(encoderData, bufferPtr);

      // Import the decoder
      const importSize = this.importDecoderFn(decoderPtr, bufferPtr);

      // Free temporary buffer
      this.module._free(bufferPtr);

      if (importSize === 0) {
        this.module._free(decoderPtr);
        throw new Error("Failed to create FSST decoder: invalid encoder data");
      }

      const module = this.module;
      const decompressFn = this.decompressFn;

      return {
        decompress(data, maxOutputSize = 0) {
          console.log(`Decompressing ${data.length} bytes of data...`);
          // If no max output size provided, use a heuristic (4x compressed size should be safe)
          if (maxOutputSize <= 0) {
            maxOutputSize = data.length * 4;
          }

          // Allocate memory for input and output
          const inputPtr = module._malloc(data.length);
          const outputPtr = module._malloc(maxOutputSize);

          // Copy input data
          module.writeArrayToMemory(data, inputPtr);

          // Decompress
          const outputLength = decompressFn(
            decoderPtr,
            inputPtr,
            data.length,
            outputPtr,
            maxOutputSize,
          );

          if (outputLength === 0) {
            module._free(inputPtr);
            module._free(outputPtr);
            throw new Error(
              "Decompression failed: buffer too small or invalid data",
            );
          }

          // Copy result
          const result = new Uint8Array(outputLength);
          result.set(
            module.HEAPU8.subarray(outputPtr, outputPtr + outputLength),
          );

          // Free temporary memory
          module._free(inputPtr);
          module._free(outputPtr);

          return result;
        },

        free() {
          console.log("Freeing decoder resources...");
          module._free(decoderPtr);
        },
      };
    },
  };
}

// Make createFsstWrapper globally available
if (typeof window !== "undefined") {
  window.createFsstWrapper = createFsstWrapper;
}

// Support CommonJS
if (typeof module !== "undefined" && module.exports) {
  module.exports = createFsstWrapper;
}

console.log("FSST module setup complete");
