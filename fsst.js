// fsst-wrapper.js - Create a bridge between the Emscripten module and your code
(function () {
  // Create a wrapper around the FSST module
  const createFsstWrapper = () => {
    return {
      async init() {
        if (!this.module) {
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
        }
      },

      createEncoder(samples, zeroTerminated = false) {
        if (!this.module || !this.createEncoderFn) {
          throw new Error("FSST module not initialized. Call init() first.");
        }

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
        const encoderPtr = this.createEncoderFn(
          stringsPtr,
          lengthsPtr,
          samples.length,
          zeroTerminated ? 1 : 0,
        );

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
            // Allocate memory for the exported encoder (we need a fairly large buffer)
            const bufferSize = 4096; // Should be enough for any dictionary
            const bufferPtr = module._malloc(bufferSize);

            // Export the encoder
            const exportSize = exportEncoderFn(encoderPtr, bufferPtr);

            // Copy the result to a new buffer
            const result = new Uint8Array(exportSize);
            result.set(
              module.HEAPU8.subarray(bufferPtr, bufferPtr + exportSize),
            );

            // Free temporary memory
            module._free(bufferPtr);

            return result;
          },

          free() {
            freeEncoderFn(encoderPtr);
          },
        };
      },

      createDecoder(encoderData) {
        if (!this.module || !this.importDecoderFn) {
          throw new Error("FSST module not initialized. Call init() first.");
        }

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
          throw new Error(
            "Failed to create FSST decoder: invalid encoder data",
          );
        }

        const module = this.module;
        const decompressFn = this.decompressFn;

        return {
          decompress(data, maxOutputSize = 0) {
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
            module._free(decoderPtr);
          },
        };
      },
    };
  };

  // Expose to global scope
  window.createFsstWrapper = createFsstWrapper;

  // Also support ES modules if available
  if (typeof exports === "object" && typeof module === "object")
    module.exports = createFsstWrapper;
  else if (typeof define === "function" && define.amd)
    define([], () => createFsstWrapper);
  else if (typeof exports === "object")
    exports.createFsstWrapper = createFsstWrapper;
})();
