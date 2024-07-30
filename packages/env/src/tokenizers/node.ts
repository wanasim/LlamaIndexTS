// Note: This is using th WASM implementation of tiktoken which is 60x faster
import cl100k_base from "tiktoken/encoders/cl100k_base";
import { init, Tiktoken } from "tiktoken/lite/init";
import wasm from "tiktoken/lite/tiktoken_bg.wasm?module";
import type { Tokenizer } from "./types.js";
import { Tokenizers } from "./types.js";

declare const WebAssembly: any; // Add this line to declare the WebAssembly object

(async function () {
  await init((imports) => WebAssembly.instantiate(wasm, imports));
})();
class TokenizerSingleton {
  private defaultTokenizer: Tokenizer;

  constructor() {
    const encoding = new Tiktoken(
      cl100k_base.bpe_ranks,
      cl100k_base.special_tokens,
      cl100k_base.pat_str,
    );

    this.defaultTokenizer = {
      encode: (text: string) => {
        return encoding.encode(text);
      },
      decode: (tokens: Uint32Array) => {
        const text = encoding.decode(tokens);
        return new TextDecoder().decode(text);
      },
    };
  }

  tokenizer(encoding?: Tokenizers): Tokenizer {
    if (encoding && encoding !== Tokenizers.CL100K_BASE) {
      throw new Error(`Tokenizer encoding ${encoding} not yet supported`);
    }

    return this.defaultTokenizer;
  }
}

export const tokenizers: TokenizerSingleton = new TokenizerSingleton();
export { Tokenizers, type Tokenizer };
