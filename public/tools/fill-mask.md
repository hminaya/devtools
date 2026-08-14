# Fill-Mask Text Completion

> Complete sentences and predict missing words using AI

Live tool: https://www.developers.do/tools/fill-mask
Category: AI Tools

Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.

## Overview

Type a sentence with [MASK] where a word is missing, and a BERT-style language model predicts the most likely tokens to fill the blank, ranked with confidence scores. Three models run fully in your browser via Hugging Face Transformers.js: DistilBERT (~66 MB, the fast default), BERT Base (~110 MB, more accurate), and ALBERT (~45 MB, lightest). The model downloads once and is cached by the browser; your text never leaves the tab.

## How to use

1. Write a sentence containing a [MASK] token, such as “The [MASK] barks at the mail carrier.”
2. Pick a model — DistilBERT is the best starting point.
3. Wait for the one-time model download and initialization, then run the prediction.
4. Review the ranked completions with their probability scores.

## Important details

### What the model actually learned

BERT-style models are pretrained with masked language modeling: hide a share of tokens in billions of sentences and learn to predict each one from both left and right context. Unlike left-to-right autocomplete, fill-mask uses what follows the blank too — in “The capital of France is [MASK]”, the period and everything before it both inform the prediction of “paris”.

### One mask, one token

Each [MASK] predicts a single WordPiece token, not a whole phrase. Common words are one token (“dog”), but rarer words split into pieces (“unbelievable” becomes un + ##belie + ##vable). Multi-word completions need multiple masks, and the combinations multiply quickly.

### What “uncased” means

All three models are uncased: input is lowercased and accents are stripped before prediction, so they do not distinguish “Apple” from “apple”. They were trained mostly on English Wikipedia and BookCorpus, so they are strongest on general English text.

## Frequently asked questions

### Why is the first run slow?

The model weights — 45 to 110 MB depending on your choice — download on first use and the runtime initializes. After that the browser cache serves the model and predictions are fast.

### Why do unusual words get odd predictions?

Rare words are split into subword pieces, and a single [MASK] can only stand for one piece. Names, jargon, and coined terms are the hardest cases for these small models.

### Is my text sent to a server?

No. Inference runs locally in your browser with Transformers.js; no API call carries your text.

## References

- [BERT: Pre-training of Deep Bidirectional Transformers](https://arxiv.org/abs/1810.04805)
- [Hugging Face Transformers.js](https://huggingface.co/docs/transformers.js)


## Related tools

- [JS Tokenizers](https://www.developers.do/tools/js-tokenizer): Tokenize text using various AI tokenizers
- [RAG Chunker](https://www.developers.do/tools/rag-chunker): Split text into retrieval-friendly chunks with overlap and token counts
- [Sentiment Analysis](https://www.developers.do/tools/sentiment-analysis): Analyze emotional tone of text using AI
- [Zero-Shot Classification](https://www.developers.do/tools/zero-shot-classification): Classify text into custom categories without training using AI
- [Sentence Similarity](https://www.developers.do/tools/sentence-similarity): Generate embeddings and find semantic similarity between texts using AI
