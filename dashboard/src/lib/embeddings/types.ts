/**
 * Embedding Provider Interface
 *
 * Provider-agnostic interface for text embedding generation.
 * Implementations: Ollama (local), Voyage AI, OpenAI (API key + Azure).
 */

export interface EmbeddingProvider {
  /** Provider identifier (e.g., "ollama", "voyage", "openai") */
  readonly name: string;

  /** Embedding vector dimensions (must be 1024 to match pgvector schema) */
  readonly dimensions: number;

  /** Generate embedding for a single text */
  embed(text: string): Promise<number[]>;

  /** Generate embeddings for multiple texts (batched for efficiency) */
  embedBatch(texts: string[]): Promise<number[][]>;
}

export type ProviderName = "ollama" | "voyage" | "openai";

export class EmbeddingError extends Error {
  constructor(
    public readonly provider: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(`[${provider}] ${message}`);
    this.name = "EmbeddingError";
  }
}
