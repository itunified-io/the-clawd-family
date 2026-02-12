/**
 * Voyage AI Embedding Provider
 *
 * Cloud embedding via Voyage AI voyage-3 (1024-dim).
 * Anthropic's recommended embedding partner.
 *
 * API: POST https://api.voyageai.com/v1/embeddings
 * Env: VOYAGE_API_KEY
 */

import { type EmbeddingProvider, EmbeddingError } from "../types";
import type { EmbeddingConfig } from "../config";

const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";
const MAX_BATCH_SIZE = 128;

interface VoyageEmbedResponse {
  data: Array<{ embedding: number[]; index: number }>;
  usage: { total_tokens: number };
}

export class VoyageProvider implements EmbeddingProvider {
  readonly name = "voyage" as const;
  readonly dimensions = 1024;
  private readonly apiKey: string;
  private readonly model: string;

  constructor(config: EmbeddingConfig["voyage"]) {
    if (!config.apiKey) {
      throw new EmbeddingError("voyage", "VOYAGE_API_KEY is required");
    }
    this.apiKey = config.apiKey;
    this.model = config.model;
  }

  async embed(text: string): Promise<number[]> {
    const result = await this.embedBatch([text]);
    return result[0];
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length <= MAX_BATCH_SIZE) {
      return this.callApi(texts);
    }

    // Split into batches for large inputs
    const results: number[][] = [];
    for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
      const batch = texts.slice(i, i + MAX_BATCH_SIZE);
      const batchResults = await this.callApi(batch);
      results.push(...batchResults);
    }
    return results;
  }

  private async callApi(texts: string[]): Promise<number[][]> {
    let response: Response;
    try {
      response = await fetch(VOYAGE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          input: texts,
          model: this.model,
          output_dimension: this.dimensions,
        }),
      });
    } catch (err) {
      throw new EmbeddingError(
        this.name,
        "Failed to connect to Voyage AI API",
        err
      );
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      if (response.status === 401) {
        throw new EmbeddingError(
          this.name,
          "Invalid VOYAGE_API_KEY. Check your API key at voyageai.com"
        );
      }
      if (response.status === 429) {
        throw new EmbeddingError(
          this.name,
          "Voyage AI rate limit exceeded. Retry after a short delay."
        );
      }
      throw new EmbeddingError(
        this.name,
        `Voyage AI returned ${response.status}: ${body}`
      );
    }

    const data = (await response.json()) as VoyageEmbedResponse;
    // Sort by index to preserve input order
    return data.data
      .sort((a, b) => a.index - b.index)
      .map((d) => d.embedding);
  }
}
