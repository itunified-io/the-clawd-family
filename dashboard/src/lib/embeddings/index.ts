/**
 * Embedding Service — Provider Factory
 *
 * Provides a unified API for generating text embeddings using
 * configurable backends: Ollama (local), Voyage AI, OpenAI (API key + Azure).
 *
 * Usage:
 *   import { embed, embedBatch, isConfigured, getProviderInfo } from "@/lib/embeddings";
 *
 *   if (isConfigured()) {
 *     const vector = await embed("What are the QA gates?");
 *     const vectors = await embedBatch(["text1", "text2"]);
 *   }
 */

import type { EmbeddingProvider, ProviderName } from "./types";
import { EmbeddingError } from "./types";
import { getEmbeddingConfig } from "./config";
import { OllamaProvider } from "./providers/ollama";
import { VoyageProvider } from "./providers/voyage";
import { OpenAIProvider } from "./providers/openai";

export type { EmbeddingProvider, ProviderName } from "./types";
export { EmbeddingError } from "./types";

let cachedProvider: EmbeddingProvider | null = null;
let cachedProviderName: ProviderName | null | undefined = undefined;

/**
 * Get the configured embedding provider instance.
 * Returns null if no provider is configured.
 */
export function getProvider(): EmbeddingProvider | null {
  const config = getEmbeddingConfig();

  // Return cached if provider hasn't changed
  if (cachedProviderName !== undefined && cachedProviderName === config.provider) {
    return cachedProvider;
  }

  cachedProviderName = config.provider;

  if (!config.provider) {
    cachedProvider = null;
    return null;
  }

  switch (config.provider) {
    case "ollama":
      cachedProvider = new OllamaProvider(config.ollama);
      break;
    case "voyage":
      cachedProvider = new VoyageProvider(config.voyage);
      break;
    case "openai":
      cachedProvider = new OpenAIProvider(config.openai);
      break;
    default:
      cachedProvider = null;
  }

  return cachedProvider;
}

/**
 * Check if an embedding provider is configured and available.
 */
export function isConfigured(): boolean {
  return getProvider() !== null;
}

/**
 * Get info about the active embedding provider.
 */
export function getProviderInfo(): {
  configured: boolean;
  provider: string | null;
  dimensions: number | null;
} {
  const provider = getProvider();
  return {
    configured: provider !== null,
    provider: provider?.name ?? null,
    dimensions: provider?.dimensions ?? null,
  };
}

/**
 * Generate embedding for a single text.
 * Throws EmbeddingError if no provider is configured.
 */
export async function embed(text: string): Promise<number[]> {
  const provider = getProvider();
  if (!provider) {
    throw new EmbeddingError("none", "No embedding provider configured");
  }
  return provider.embed(text);
}

/**
 * Generate embeddings for multiple texts (batched).
 * Throws EmbeddingError if no provider is configured.
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const provider = getProvider();
  if (!provider) {
    throw new EmbeddingError("none", "No embedding provider configured");
  }
  return provider.embedBatch(texts);
}

/**
 * Reset the cached provider (useful for testing or config changes).
 */
export function resetProvider(): void {
  cachedProvider = null;
  cachedProviderName = undefined;
}
