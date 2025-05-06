#!/bin/bash
# Build script for FSST WebAssembly
# Requires Emscripten to be installed and activated in your environment
# https://emscripten.org/docs/getting_started/downloads.html

# Exit on error
set -e

echo "Building FSST WebAssembly module..."

# Compile the C++ code to WebAssembly
emcc fsst_wasm.cpp \
  -O3 \
  -s WASM=1 \
  -s EXPORTED_FUNCTIONS="['_fsst_create_encoder', '_fsst_free_encoder', '_fsst_export_encoder', '_fsst_import_decoder', '_fsst_compress', '_fsst_decompress', '_fsst_malloc', '_fsst_free']" \
  -s EXPORTED_RUNTIME_METHODS="['cwrap', 'setValue', 'getValue', 'writeArrayToMemory', 'UTF8ToString']" \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME="FSST" \
  -s ENVIRONMENT="web,worker" \
  -o fsst.js

echo "Build complete. Output files: fsst.js and fsst.wasm"