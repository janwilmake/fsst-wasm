// Combined FSST WebAssembly module and wrapper
// This file contains both the Emscripten module loader and the FSST wrapper

// Create the FSST factory function
var FSST = (function () {
  // Store the module instance
  var moduleInstance = null;

  // Create the module initialization function
  return async function () {
    // If we already have an instance, return it
    if (moduleInstance) {
      return moduleInstance;
    }

    // Create a Module object with necessary properties
    var Module = {
      // Print functions
      print: function (text) {
        console.log(text);
      },
      printErr: function (text) {
        console.error(text);
      },

      // When the module is initialized
      onRuntimeInitialized: function () {
        console.log("FSST WebAssembly module runtime initialized");
      },

      // Location of wasm file (same directory as this JS file)
      locateFile: function (path) {
        // Handle different environments for finding the .wasm file
        if (typeof window !== "undefined" && typeof document !== "undefined") {
          // Browser environment
          var scriptUrl = document.currentScript
            ? document.currentScript.src
            : "";
          if (scriptUrl) {
            return (
              scriptUrl.substring(0, scriptUrl.lastIndexOf("/") + 1) + path
            );
          }
        }
        return path;
      },
    };

    // Load the wasm module with fetch
    console.log("Loading FSST wasm module...");
    try {
      const response = await fetch("fsst.wasm");
      if (!response.ok) {
        throw new Error(
          `Failed to fetch wasm file: ${response.status} ${response.statusText}`,
        );
      }
      const wasmBinary = await response.arrayBuffer();
      console.log(`WASM binary loaded, size: ${wasmBinary.byteLength} bytes`);

      // Add the binary to the module
      Module.wasmBinary = wasmBinary;

      // Create memory for the wasm module
      Module.wasmMemory = new WebAssembly.Memory({
        initial: 256,
        maximum: 1024,
      });

      // Wait for the wasm module to be compiled and instantiated
      const { instance } = await WebAssembly.instantiate(wasmBinary, {
        env: {
          memory: Module.wasmMemory,
          // Add any additional imports the module needs
          // ...
        },
      });

      // Map the exports to the Module
      Object.keys(instance.exports).forEach((key) => {
        Module[key] = instance.exports[key];
      });

      // Add necessary Emscripten utility functions
      Module.cwrap = function (name, returnType, paramTypes) {
        const func = Module[`_${name}`];
        if (!func) {
          throw new Error(`Function ${name} not found in WebAssembly module`);
        }
        return function (...args) {
          return func(...args);
        };
      };

      Module.setValue = function (ptr, value, type) {
        if (
          type === "i8" ||
          type === "i16" ||
          type === "i32" ||
          type === "i64"
        ) {
          new Int32Array(Module.wasmMemory.buffer)[ptr / 4] = value;
        } else if (type === "float" || type === "double") {
          new Float32Array(Module.wasmMemory.buffer)[ptr / 4] = value;
        }
      };

      Module.getValue = function (ptr, type) {
        if (type === "i8") {
          return new Int8Array(Module.wasmMemory.buffer)[ptr];
        } else if (type === "i16") {
          return new Int16Array(Module.wasmMemory.buffer)[ptr / 2];
        } else if (type === "i32" || type === "i64") {
          return new Int32Array(Module.wasmMemory.buffer)[ptr / 4];
        } else if (type === "float" || type === "double") {
          return new Float32Array(Module.wasmMemory.buffer)[ptr / 4];
        }
        return 0;
      };

      Module.HEAPU8 = new Uint8Array(Module.wasmMemory.buffer);

      Module.writeArrayToMemory = function (array, ptr) {
        Module.HEAPU8.set(array, ptr);
      };

      Module.UTF8ToString = function (ptr) {
        let str = "";
        let i = 0;
        while (Module.HEAPU8[ptr + i] !== 0) {
          str += String.fromCharCode(Module.HEAPU8[ptr + i]);
          i++;
        }
        return str;
      };

      Module._malloc = function (size) {
        // This is a very simple memory allocator for testing
        // In a real implementation, you would use the actual malloc from the module
        const ptr = Module.memory.grow(Math.ceil(size / 65536)) * 65536;
        return ptr;
      };

      Module._free = function (ptr) {
        // In testing, we don't need to actually free memory
        // In a real implementation, you would use the actual free from the module
      };

      // Store the module instance
      moduleInstance = Module;
      return moduleInstance;
    } catch (error) {
      console.error("Failed to initialize FSST module:", error);
      throw error;
    }
  };
})();

// FSST Wrapper (similar to your original implementation)
function createFsstWrapper() {
  return {
    async init() {
      if (!this.module) {
        console.log("Initializing FSST module in wrapper...");
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
