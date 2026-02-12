/**
 * Embedding Provider Configuration
 *
 * Detects which embedding provider to use based on environment variables.
 * Priority: explicit EMBEDDING_PROVIDER > auto-detect from available env vars.
 */

import type { ProviderName } from "./types";

export interface EmbeddingConfig {
  provider: ProviderName | null;
  ollama: {
    url: string;
    model: string;
  };
  voyage: {
    apiKey: string | null;
    model: string;
  };
  openai: {
    apiKey: string | null;
    azureEndpoint: string | null;
    azureKey: string | null;
    azureDeployment: string | null;
    model: string;
    dimensions: number;
  };
}

export function getEmbeddingConfig(): EmbeddingConfig {
  const explicit = process.env.EMBEDDING_PROVIDER as ProviderName | undefined;

  return {
    provider: explicit ?? autoDetectProvider(),
    ollama: {
      url: process.env.OLLAMA_URL ?? "http://localhost:11434",
      model: process.env.OLLAMA_EMBED_MODEL ?? "mxbai-embed-large",
    },
    voyage: {
      apiKey: process.env.VOYAGE_API_KEY ?? null,
      model: process.env.VOYAGE_EMBED_MODEL ?? "voyage-3",
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY ?? null,
      azureEndpoint: process.env.AZURE_OPENAI_ENDPOINT ?? null,
      azureKey: process.env.AZURE_OPENAI_KEY ?? null,
      azureDeployment: process.env.AZURE_OPENAI_DEPLOYMENT ?? null,
      model: process.env.OPENAI_EMBED_MODEL ?? "text-embedding-3-small",
      dimensions: 1024,
    },
  };
}

/**
 * Auto-detect provider from available environment variables.
 * Priority: Ollama (local-first) > Voyage > OpenAI
 */
function autoDetectProvider(): ProviderName | null {
  if (process.env.OLLAMA_URL) return "ollama";
  if (process.env.VOYAGE_API_KEY) return "voyage";
  if (process.env.OPENAI_API_KEY || process.env.AZURE_OPENAI_ENDPOINT)
    return "openai";
  return null;
}
