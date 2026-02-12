/**
 * OpenAI Embedding Provider
 *
 * Cloud embedding via OpenAI text-embedding-3-small (1024-dim).
 * Supports both standard API key and Azure OpenAI subscription.
 *
 * Standard: Authorization: Bearer $OPENAI_API_KEY
 * Azure: api-key: $AZURE_OPENAI_KEY to $AZURE_OPENAI_ENDPOINT
 *
 * Env (standard): OPENAI_API_KEY
 * Env (Azure): AZURE_OPENAI_ENDPOINT + AZURE_OPENAI_KEY + AZURE_OPENAI_DEPLOYMENT
 */

import { type EmbeddingProvider, EmbeddingError } from "../types";
import type { EmbeddingConfig } from "../config";

const OPENAI_API_URL = "https://api.openai.com/v1/embeddings";
const AZURE_API_VERSION = "2024-02-01";
const MAX_BATCH_SIZE = 2048;

interface OpenAIEmbedResponse {
  data: Array<{ embedding: number[]; index: number }>;
  usage: { prompt_tokens: number; total_tokens: number };
}

type AuthMode = "api_key" | "azure";

export class OpenAIProvider implements EmbeddingProvider {
  readonly name = "openai" as const;
  readonly dimensions = 1024;
  private readonly authMode: AuthMode;
  private readonly model: string;
  private readonly config: EmbeddingConfig["openai"];

  constructor(config: EmbeddingConfig["openai"]) {
    this.config = config;
    this.model = config.model;

    // Determine auth mode: Azure takes precedence when all 3 vars are set
    if (config.azureEndpoint && config.azureKey && config.azureDeployment) {
      this.authMode = "azure";
    } else if (config.apiKey) {
      this.authMode = "api_key";
    } else {
      throw new EmbeddingError(
        "openai",
        "Either OPENAI_API_KEY or AZURE_OPENAI_ENDPOINT + AZURE_OPENAI_KEY + AZURE_OPENAI_DEPLOYMENT required"
      );
    }
  }

  async embed(text: string): Promise<number[]> {
    const result = await this.embedBatch([text]);
    return result[0];
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length <= MAX_BATCH_SIZE) {
      return this.callApi(texts);
    }

    const results: number[][] = [];
    for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
      const batch = texts.slice(i, i + MAX_BATCH_SIZE);
      const batchResults = await this.callApi(batch);
      results.push(...batchResults);
    }
    return results;
  }

  private getUrl(): string {
    if (this.authMode === "azure") {
      const endpoint = this.config.azureEndpoint!.replace(/\/+$/, "");
      const deployment = this.config.azureDeployment!;
      return `${endpoint}/openai/deployments/${deployment}/embeddings?api-version=${AZURE_API_VERSION}`;
    }
    return OPENAI_API_URL;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.authMode === "azure") {
      headers["api-key"] = this.config.azureKey!;
    } else {
      headers["Authorization"] = `Bearer ${this.config.apiKey!}`;
    }

    return headers;
  }

  private async callApi(texts: string[]): Promise<number[][]> {
    const url = this.getUrl();
    const body: Record<string, unknown> = {
      input: texts,
      dimensions: this.dimensions,
    };

    // Azure uses deployment, standard uses model in body
    if (this.authMode !== "azure") {
      body.model = this.model;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
    } catch (err) {
      const target =
        this.authMode === "azure" ? "Azure OpenAI" : "OpenAI API";
      throw new EmbeddingError(
        this.name,
        `Failed to connect to ${target}`,
        err
      );
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      if (response.status === 401) {
        const keyType =
          this.authMode === "azure" ? "AZURE_OPENAI_KEY" : "OPENAI_API_KEY";
        throw new EmbeddingError(
          this.name,
          `Invalid ${keyType}. Check your credentials.`
        );
      }
      if (response.status === 429) {
        throw new EmbeddingError(
          this.name,
          "Rate limit exceeded. Retry after a short delay."
        );
      }
      throw new EmbeddingError(
        this.name,
        `OpenAI returned ${response.status}: ${errorBody}`
      );
    }

    const data = (await response.json()) as OpenAIEmbedResponse;
    return data.data
      .sort((a, b) => a.index - b.index)
      .map((d) => d.embedding);
  }
}
