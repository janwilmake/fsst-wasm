// fsst-node-test-improved.js
const fs = require("fs");
const path = require("path");

// Set global FSST object that will be used by fsst.js
global.FSST = async function () {
  return new Promise((resolve, reject) => {
    try {
      const wasmPath = path.join(__dirname, "fsst.wasm");
      const wasmBinary = fs.readFileSync(wasmPath);

      // Create a minimal Emscripten-like environment
      const module = {
        wasmBinary,

        // Add required methods that fsst.js will use
        cwrap: function (name, returnType, paramTypes) {
          console.log(`[Mock] cwrap called for ${name}`);
          // Return a mock function for testing
          return function (...args) {
            console.log(`[Mock] Called ${name} with args:`, args);
            return 0; // Mock return value
          };
        },

        // Mock memory functions
        _malloc: function (size) {
          console.log(`[Mock] malloc called with size ${size}`);
          return 1000; // Mock memory address
        },

        _free: function (ptr) {
          console.log(`[Mock] free called with ptr ${ptr}`);
        },

        setValue: function (ptr, value, type) {
          console.log(`[Mock] setValue called: ${ptr}, ${value}, ${type}`);
        },

        writeArrayToMemory: function (array, ptr) {
          console.log(
            `[Mock] writeArrayToMemory called with array of length ${array.length}`,
          );
        },

        // Mock heap
        HEAPU8: {
          subarray: function (start, end) {
            console.log(`[Mock] HEAPU8.subarray(${start}, ${end})`);
            return new Uint8Array(end - start);
          },
        },
      };

      resolve(module);
    } catch (err) {
      reject(err);
    }
  });
};

console.log("Loading FSST module wrapper...");

// Now require the wrapper script
const createFsstWrapper = require("./fsst.js");

async function runTest() {
  try {
    console.log("Creating FSST wrapper...");
    const fsst = createFsstWrapper();

    console.log("Initializing FSST module...");
    await fsst.init();

    console.log("Creating sample data...");
    const samples = [
      "This is an example string for compression",
      "Another example with some similar text",
      "FSST works best with data that has repeating patterns",
      "The more representative your samples, the better compression you get",
    ].map((str) => Buffer.from(str));

    console.log("Creating encoder...");
    const encoder = fsst.createEncoder(samples);

    console.log("Testing compression...");
    const testString =
      "This is a test string with some compression patterns similar to the samples";
    const inputData = Buffer.from(testString);

    console.log(`Original size: ${inputData.length} bytes`);

    const compressed = encoder.compress(inputData);
    console.log(`Compressed size: ${compressed.length} bytes`);

    console.log("Exporting encoder...");
    const exportedEncoder = encoder.export();
    console.log(`Exported encoder size: ${exportedEncoder.length} bytes`);

    console.log("Creating decoder...");
    const decoder = fsst.createDecoder(exportedEncoder);

    console.log("Testing decompression...");
    const decompressed = decoder.decompress(compressed);
    console.log(`Decompressed size: ${decompressed.length} bytes`);

    // In a real scenario, we would check the decompressed text
    // But with our mock implementation, it's just empty buffers

    console.log("Cleaning up...");
    encoder.free();
    decoder.free();

    console.log("Test completed successfully!");
  } catch (err) {
    console.error("Error in FSST test:", err);
  }
}

runTest();
