/**
 * Ollama Embedding Provider
 *
 * Local embedding via Ollama using mxbai-embed-large (1024-dim).
 * Zero cost, fully private, no API key needed.
 *
 * API: POST http://{OLLAMA_URL}/api/embed
 * Env: OLLAMA_URL (default: http://localhost:11434)
 */

import { type EmbeddingProvider, EmbeddingError } from "../types";
import type { EmbeddingConfig } from "../config";

interface OllamaEmbedResponse {
  embeddings: number[][];
}

export class OllamaProvider implements EmbeddingProvider {
  readonly name = "ollama" as const;
  readonly dimensions = 1024;
  private readonly url: string;
  private readonly model: string;

  constructor(config: EmbeddingConfig["ollama"]) {
    this.url = config.url;
    this.model = config.model;
  }

  async embed(text: string): Promise<number[]> {
    const result = await this.embedBatch([text]);
    return result[0];
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const url = `${this.url}/api/embed`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          input: texts,
        }),
      });
    } catch (err) {
      throw new EmbeddingError(
        this.name,
        `Failed to connect to Ollama at ${this.url}. Is Ollama running?`,
        err
      );
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new EmbeddingError(
        this.name,
        `Ollama returned ${response.status}: ${body}`
      );
    }

    const data = (await response.json()) as OllamaEmbedResponse;

    if (!data.embeddings || data.embeddings.length !== texts.length) {
      throw new EmbeddingError(
        this.name,
        `Expected ${texts.length} embeddings, got ${data.embeddings?.length ?? 0}`
      );
    }

    return data.embeddings;
  }
}
