// example.ts
import FSST from "./fsst";
async function runFsstTest() {
    console.log("Initializing FSST module...");
    const fsst = await FSST();
    await fsst.init();
    console.log("Creating encoder with sample data...");
    // Sample data - In a real application, you'd use more representative samples
    const samples = [
        "This is an example string for compression",
        "Another example with some similar text",
        "FSST works best with data that has repeating patterns",
        "The more representative your samples, the better compression you get",
    ].map((str) => new TextEncoder().encode(str));
    // Create encoder using samples
    const encoder = fsst.createEncoder(samples);
    // Test compression
    const testString = "This is a test string with some compression patterns similar to the samples";
    const inputData = new TextEncoder().encode(testString);
    console.log(`Original size: ${inputData.length} bytes`);
    // Compress the data
    console.time("Compression");
    const compressed = encoder.compress(inputData);
    console.timeEnd("Compression");
    console.log(`Compressed size: ${compressed.length} bytes`);
    console.log(`Compression ratio: ${(inputData.length / compressed.length).toFixed(2)}x`);
    // Export encoder (so it can be used later without retraining)
    const exportedEncoder = encoder.export();
    console.log(`Exported encoder size: ${exportedEncoder.length} bytes`);
    // Create decoder from exported encoder
    const decoder = fsst.createDecoder(exportedEncoder);
    // Decompress the data
    console.time("Decompression");
    const decompressed = decoder.decompress(compressed);
    console.timeEnd("Decompression");
    // Check if decompression was successful
    const decompressedString = new TextDecoder().decode(decompressed);
    console.log("Decompression successful:", decompressedString === testString);
    console.log("Decompressed text:", decompressedString);
    // Clean up
    encoder.free();
    decoder.free();
}
// Run the test
runFsstTest().catch((err) => {
    console.error("Error running FSST test:", err);
});
