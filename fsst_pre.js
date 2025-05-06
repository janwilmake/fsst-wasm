// fsst_pre.js - Will be prepended to the compiled module
// This helps with module initialization and compatibility

console.log("FSST WebAssembly module loading with better error handling...");

// Additional error handling for wasm load failures
Module["onAbort"] = function (what) {
  console.error("FSST module initialization aborted:", what);
};
