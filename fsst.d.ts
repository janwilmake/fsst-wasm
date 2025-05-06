declare module "fsst-wasm" {
  export interface FsstModule {
    cwrap: (name: string, returnType: string, argTypes: string[]) => Function;
    HEAPU8: Uint8Array;
    _malloc: (size: number) => number;
    _free: (ptr: number) => void;
    writeArrayToMemory: (array: Uint8Array, ptr: number) => void;
  }

  export interface FsstEncoder {
    /**
     * Compresses data using FSST
     * @param data The data to compress
     * @returns The compressed data
     */
    compress(data: Uint8Array): Uint8Array;

    /**
     * Exports the encoder to a buffer for later use
     * @returns A buffer containing the encoder state
     */
    export(): Uint8Array;

    /**
     * Frees resources used by the encoder
     */
    free(): void;
  }

  export interface FsstDecoder {
    /**
     * Decompresses FSST-compressed data
     * @param data The compressed data
     * @param maxOutputSize Maximum expected output size (optional)
     * @returns The decompressed data
     */
    decompress(data: Uint8Array, maxOutputSize?: number): Uint8Array;

    /**
     * Frees resources used by the decoder
     */
    free(): void;
  }

  export interface FSST {
    /**
     * Initializes the FSST module
     * @returns A promise that resolves when the module is ready
     */
    init(): Promise<void>;

    /**
     * Creates an encoder from sample data
     * @param samples Array of sample strings to train the encoder
     * @param zeroTerminated Whether strings are zero-terminated
     * @returns An encoder instance
     */
    createEncoder(samples: Uint8Array[], zeroTerminated?: boolean): FsstEncoder;

    /**
     * Creates a decoder from an exported encoder
     * @param encoderData Exported encoder data from encoder.export()
     * @returns A decoder instance
     */
    createDecoder(encoderData: Uint8Array): FsstDecoder;
  }

  const Fsst: () => Promise<FSST>;
  export default Fsst;
}
