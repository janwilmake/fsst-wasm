// FSST WebAssembly Implementation
// Based on the FSST library: https://github.com/cwida/fsst
// Adapted for WebAssembly

#include <cstdint>
#include <cstring>
#include <string>
#include <vector>
#include <algorithm>
#include <numeric>
#include <queue>
#include <unordered_map>
#include <unordered_set>
#include <memory>

// Type definitions for clarity
typedef uint8_t u8;
typedef uint16_t u16;
typedef uint32_t u32;
typedef uint64_t u64;

// Constants
#define FSST_VERSION 1
#define FSST_ENDIAN_MARKER 42
#define FSST_CODE_MASK 255
#define FSST_CODE_BASE 256
#define FSST_CODE_BITS 8
#define FSST_LEN_BITS 12
#define FSST_HASH_LOG2SIZE 16
#define FSST_HASH_PRIME 655521
#define FSST_HASH(x) ((u32) ((u32) (x) * FSST_HASH_PRIME) & ((1<<FSST_HASH_LOG2SIZE)-1))
#define FSST_ICL_FREE 32 // icl (8:code+8:len+8:len+8:icl), last field is initially 32, or garbage if occupied
#define FSST_SAMPLETARGET (1<<17)
#define FSST_SAMPLEMAXSZ ((size_t)2*FSST_SAMPLETARGET)
#define FSST_MAXHEADER (45+8*255)

// Unaligned load for 64-bit data
static inline u64 fsst_unaligned_load(const u8 *p) {
    u64 result;
    memcpy(&result, p, 8);
    return result;
}

// Symbol class - represents a sequence of 1-8 bytes that can be encoded as a single byte
class Symbol {
public:
    static const unsigned maxLength = 8;

    union val_t {
        u64 num;
        u8 str[maxLength];
    } val;

    u32 icl; // 8:code+8:len+8:len+8:icl

    Symbol() : icl(FSST_ICL_FREE) { val.num = 0; }

    // Get symbol length
    u8 length() const { return (icl>>8) & 255; }
    
    // Get symbol code
    u16 code() const { return (icl>>16) & 255; }
    
    // Set code and length
    void set_code_len(u16 code, u8 len) {
        icl = (icl & 255) | (len << 8) | (len << 16) | (code << 16);
    }
};

// QSymbol: Symbol with extra gain information for frequency calculations
struct QSymbol {
    Symbol symbol;
    u64 gain;
    
    bool operator==(const QSymbol& other) const {
        return symbol.val.num == other.symbol.val.num && symbol.length() == other.symbol.length();
    }
};

// Hash function for QSymbol
struct QSymbolHash {
    size_t operator()(const QSymbol& q) const {
        const uint64_t m = 0xc6a4a7935bd1e995;
        const int r = 47;
        uint64_t k = q.symbol.val.num;
        uint64_t h = 0x8445d61a4e774912 ^ (8*m);
        k *= m;
        k ^= k >> r;
        k *= m;
        h ^= k;
        h *= m;
        h ^= h >> r;
        h *= m;
        h ^= h >> r;
        return h;
    }
};

// Symbol concatenation
Symbol concat(Symbol a, Symbol b) {
    Symbol s;
    u32 length = a.length() + b.length();
    if (length > Symbol::maxLength) length = Symbol::maxLength; 
    s.set_code_len(FSST_CODE_MASK, length);
    s.val.num = (b.val.num << (8*a.length())) | a.val.num;
    return s;
}

// SymbolTable - stores map of symbols to codes and vice versa
class SymbolTable {
public:
    Symbol symbols[2*256]; // 0-255: normal symbols, 256-511: escape symbols
    u8 nSymbols;           // number of symbols
    u8 terminator;         // terminator character
    u8 suffixLim;          // limit for suffix optimization
    bool zeroTerminated;   // whether strings are zero terminated
    u8 lenHisto[8] = {0};  // histogram of symbol lengths
    u16 shortCodes[65536]; // quick lookup for 1-2 byte patterns
    Symbol hashTab[1<<FSST_HASH_LOG2SIZE]; // hash table for quick lookup
    u32 hashTabSize;       // size of hash table

    SymbolTable() : nSymbols(0), terminator(0), suffixLim(0), zeroTerminated(false), hashTabSize(1<<FSST_HASH_LOG2SIZE) {
        clear();
    }

    // Clear the symbol table
    void clear() {
        memset(symbols, 0, sizeof(symbols));
        memset(shortCodes, 0, sizeof(shortCodes));
        memset(hashTab, 0, sizeof(hashTab));
        memset(lenHisto, 0, sizeof(lenHisto));
        nSymbols = 0;
        suffixLim = 0;
    }

    // Add a symbol to the table
    void add(Symbol s) {
        if (nSymbols < 255) {
            u8 len = s.length();
            s.set_code_len(nSymbols, len);
            symbols[nSymbols] = s;
            lenHisto[len - 1]++;
            nSymbols++;
        }
    }

    // Finalize table, prepare lookup structures
    void finalize(bool zeroTerminated) {
        this->zeroTerminated = zeroTerminated;
        
        // Initialize escape codes (byte value => single-byte symbol mapping)
        for (u32 i = 0; i < 256; i++) {
            Symbol s;
            s.val.num = 0;
            s.val.str[0] = (u8)i;
            s.set_code_len(i + FSST_CODE_BASE, 1);
            symbols[i + FSST_CODE_BASE] = s;
        }

        // Determine suffix optimization limit
        suffixLim = 0;
        for (u8 code = 0; code < nSymbols; code++) {
            if (symbols[code].length() == 2)
                suffixLim++;
        }

        // Build shortCodes and hashTab
        for (u32 i = 0; i < 65536; i++)
            shortCodes[i] = (i & 255) + FSST_CODE_BASE;

        for (u32 code = 0; code < nSymbols; code++) {
            Symbol s = symbols[code];
            u8 len = s.length();
            if (len == 1) {
                shortCodes[s.val.str[0]] = (len << FSST_LEN_BITS) | code;
            } else if (len == 2) {
                u16 key = (s.val.str[0] << 8) | s.val.str[1];
                shortCodes[key] = (len << FSST_LEN_BITS) | code;
            }
            
            // Add to hash table
            u32 idx = FSST_HASH((u32) s.val.num & 0xFFFFFF) & (hashTabSize - 1);
            hashTab[idx] = s;
        }
    }

    // Find longest matching symbol for a given input
    u16 findLongestSymbol(const u8* cur, const u8* end) const {
        if (cur >= end) return 0;
        
        if (cur < end - 1) {
            // Try to match a 2-byte symbol
            u16 key = (cur[0] << 8) | cur[1];
            u16 code = shortCodes[key];
            if (!(code & FSST_CODE_BASE))
                return code;
        }
        
        // Try to match a longer symbol via hash table
        if (cur < end - 2) {
            u64 word = fsst_unaligned_load(cur);
            u32 idx = FSST_HASH((u32) word & 0xFFFFFF) & (hashTabSize - 1);
            Symbol s = hashTab[idx];
            word &= (0xFFFFFFFFFFFFFFFF >> (u8) s.icl);
            if ((s.icl < FSST_ICL_FREE) && (s.val.num == word))
                return s.code();
        }
        
        // Default to 1-byte code
        return shortCodes[*cur];
    }
};

// Counters - track symbol frequencies
class Counters {
private:
    u32 *count1;  // Frequency of individual symbols
    u32 *count2;  // Frequency of symbol pairs
    u32 nextPos1[FSST_CODE_BASE*2];
    u32 nextPos2[FSST_CODE_BASE*2][FSST_CODE_BASE*2];

public:
    Counters() {
        count1 = new u32[FSST_CODE_BASE*2]();
        count2 = new u32[FSST_CODE_BASE*2 * FSST_CODE_BASE*2]();
        
        for (u32 i = 0; i < FSST_CODE_BASE*2; i++) {
            nextPos1[i] = i;
            for (u32 j = 0; j < FSST_CODE_BASE*2; j++) {
                nextPos2[i][j] = j;
            }
        }
    }

    ~Counters() {
        delete[] count1;
        delete[] count2;
    }

    // Count individual symbol
    void count1Inc(u16 pos) { count1[pos]++; }
    
    // Set count for individual symbol
    void count1Set(u16 pos, u32 val) { count1[pos] = val; }
    
    // Get count for individual symbol and advance to next
    u32 count1GetNext(u32 &pos) {
        u32 c = count1[pos];
        pos = nextPos1[pos];
        return c;
    }

    // Count symbol pair
    void count2Inc(u16 pos1, u16 pos2) { count2[pos1 * FSST_CODE_BASE*2 + pos2]++; }
    
    // Get count for symbol pair and advance to next
    u32 count2GetNext(u32 pos1, u32 &pos2) {
        u32 c = count2[pos1 * FSST_CODE_BASE*2 + pos2];
        pos2 = nextPos2[pos1][pos2];
        return c;
    }

    // Backup counter data
    void backup1(u8 *buf) {
        memcpy(buf, count1, FSST_CODE_BASE*2 * sizeof(u32));
    }

    // Restore counter data
    void restore1(u8 *buf) {
        memcpy(count1, buf, FSST_CODE_BASE*2 * sizeof(u32));
    }
};

// FSST Encoder
struct Encoder {
    std::shared_ptr<SymbolTable> symbolTable;
    Counters counters;
    u8 *simdbuf;

    Encoder() {
        simdbuf = new u8[2*(1<<20)]; // 2MB temporary buffer for SIMD operations
    }

    ~Encoder() {
        delete[] simdbuf;
    }
};

// FSST Decoder
struct Decoder {
    u64 symbol[256]; // Symbols used for decompression
    u8 len[256];     // Lengths of each symbol
    bool zeroTerminated;
};

// C-compatible interfaces for WASM export
extern "C" {
    // Create an FSST encoder
    Encoder* fsst_create_encoder(const u8** strings, const size_t* lengths, size_t numStrings, bool zeroTerminated) {
        if (numStrings == 0) return nullptr;
        
        Encoder* encoder = new Encoder();
        
        // Build symbol table with sample data
        std::vector<const u8*> sample;
        std::vector<size_t> sampleLens;
        
        // Limit sample size
        size_t totalSize = 0;
        for (size_t i = 0; i < numStrings; i++) {
            sample.push_back(strings[i]);
            sampleLens.push_back(lengths[i]);
            totalSize += lengths[i];
            if (totalSize >= FSST_SAMPLETARGET) break;
        }
        
        // Build the symbol table
        SymbolTable* st = new SymbolTable();
        
        // Initialize with default terminator (implementation simplified)
        st->terminator = zeroTerminated ? 0 : 255;
        
        // Determine best symbols based on frequency
        std::unordered_set<QSymbol, QSymbolHash> candidates;
        
        // Add single-byte symbols (simplified approach)
        for (size_t i = 0; i < sample.size(); i++) {
            const u8* str = sample[i];
            size_t len = sampleLens[i];
            for (size_t j = 0; j < len; j++) {
                Symbol s;
                s.val.num = 0;
                s.val.str[0] = str[j];
                s.set_code_len(FSST_CODE_MASK, 1);
                
                QSymbol q;
                q.symbol = s;
                q.gain = 1;
                candidates.insert(q);
            }
        }
        
        // Create symbol table from candidates
        auto compareGain = [](const QSymbol& a, const QSymbol& b) { 
            return a.gain < b.gain || (a.gain == b.gain && a.symbol.val.num > b.symbol.val.num); 
        };
        std::priority_queue<QSymbol, std::vector<QSymbol>, decltype(compareGain)> pq(compareGain);
        
        for (const auto& q : candidates) {
            pq.push(q);
        }
        
        // Add best symbols
        while (st->nSymbols < 255 && !pq.empty()) {
            st->add(pq.top().symbol);
            pq.pop();
        }
        
        // Finalize the symbol table
        st->finalize(zeroTerminated);
        
        encoder->symbolTable = std::shared_ptr<SymbolTable>(st);
        return encoder;
    }

    // Free an encoder
    void fsst_free_encoder(Encoder* encoder) {
        delete encoder;
    }

    // Export encoder to buffer - returns size written
    size_t fsst_export_encoder(Encoder* encoder, u8* buffer) {
        SymbolTable* st = encoder->symbolTable.get();
        
        // Create version field with metadata
        u64 version = (FSST_VERSION << 32) | 
                     (((u64) st->suffixLim) << 24) | 
                     (((u64) st->terminator) << 16) | 
                     (((u64) st->nSymbols) << 8) | 
                     FSST_ENDIAN_MARKER;
        
        memcpy(buffer, &version, 8);
        buffer[8] = st->zeroTerminated;
        
        // Copy length histogram
        for (u32 i = 0; i < 8; i++) {
            buffer[9 + i] = st->lenHisto[i];
        }
        
        // Export symbols
        u32 pos = 17;
        for (u32 i = st->zeroTerminated; i < st->nSymbols; i++) {
            for (u32 j = 0; j < st->symbols[i].length(); j++) {
                buffer[pos++] = st->symbols[i].val.str[j];
            }
        }
        
        return pos;
    }

    // Create decoder from buffer - returns 0 on failure, buffer size on success
    size_t fsst_import_decoder(Decoder* decoder, const u8* buffer) {
        u64 version = 0;
        memcpy(&version, buffer, 8);
        
        if ((version >> 32) != FSST_VERSION) {
            return 0;
        }
        
        decoder->zeroTerminated = buffer[8] & 1;
        u8 lenHisto[8];
        memcpy(lenHisto, buffer + 9, 8);
        
        // Initialize symbol table
        decoder->len[0] = 1;
        decoder->symbol[0] = 0;
        
        u16 code = decoder->zeroTerminated;
        if (decoder->zeroTerminated) lenHisto[0]--;
        
        // Read symbols
        u32 pos = 17;
        for (u32 l = 1; l <= 8; l++) {
            for (u32 i = 0; i < lenHisto[(l & 7)]; i++, code++) {
                decoder->len[code] = (l & 7) + 1;
                decoder->symbol[code] = 0;
                for (u32 j = 0; j < decoder->len[code]; j++) {
                    ((u8*)&decoder->symbol[code])[j] = buffer[pos++];
                }
            }
        }
        
        // Fill unused symbols
        while (code < 255) {
            decoder->symbol[code] = 0;
            decoder->len[code++] = 8;
        }
        
        return pos;
    }
    
    // Compress data - returns bytes written
    size_t fsst_compress(Encoder* encoder, const u8* input, size_t inputLength, u8* output, size_t outputMaxLength) {
        if (!encoder || !input || !output || outputMaxLength < inputLength) {
            return 0;
        }
        
        const u8* cur = input;
        const u8* end = input + inputLength;
        u8* out = output;
        const u8* outEnd = output + outputMaxLength;
        
        SymbolTable* st = encoder->symbolTable.get();
        
        while (cur < end && out < outEnd - 2) { // leave space for potential escape
            u16 code = st->findLongestSymbol(cur, end);
            
            if (code >= FSST_CODE_BASE) {
                // Escape byte needed
                *out++ = 255;
                *out++ = *cur++;
            } else {
                *out++ = (u8)code;
                cur += st->symbols[code].length();
            }
        }
        
        return out - output;
    }
    
    // Decompress data - returns bytes written
    size_t fsst_decompress(Decoder* decoder, const u8* input, size_t inputLength, u8* output, size_t outputMaxLength) {
        if (!decoder || !input || !output) {
            return 0;
        }
        
        const u8* cur = input;
        const u8* end = input + inputLength;
        u8* out = output;
        const u8* outEnd = output + outputMaxLength;
        
        while (cur < end && out < outEnd) {
            u8 code = *cur++;
            
            if (code == 255) {
                // Escaped byte
                if (cur == end) break;
                if (out < outEnd) *out++ = *cur++;
            } else {
                // Symbol
                u8 len = decoder->len[code];
                if (out + len > outEnd) break;
                
                u64 symbol = decoder->symbol[code];
                for (u8 i = 0; i < len; i++) {
                    *out++ = ((u8*)&symbol)[i];
                }
            }
        }
        
        return out - output;
    }
    
    // Allocate memory (for JavaScript to allocate buffers)
    u8* fsst_malloc(size_t size) {
        return new u8[size];
    }
    
    // Free memory
    void fsst_free(u8* ptr) {
        delete[] ptr;
    }
}