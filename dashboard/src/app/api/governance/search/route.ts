import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { embed, isConfigured } from "@/lib/embeddings";

interface VectorResult {
  id: string;
  section: string;
  content: string;
  version: string;
  heading_level: number;
  roles_affected: string[];
  gate_type: string | null;
  similarity: number;
}

// POST /api/governance/search — Semantic search over governance chunks
// Uses cosine similarity when embeddings are available, keyword fallback otherwise.
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { query, role, limit = 5 } = body;

  if (!query) {
    return NextResponse.json(
      { error: "query is required" },
      { status: 400 }
    );
  }

  // Check if vector search is available (provider configured + embeddings exist)
  const providerReady = isConfigured();

  if (providerReady) {
    try {
      const hasEmbeddings = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM governance_chunks WHERE embedding IS NOT NULL
      `;

      if (Number(hasEmbeddings[0].count) > 0) {
        return await vectorSearch(query, role, limit);
      }
    } catch {
      // Fall through to keyword search
    }
  }

  return keywordSearch(query, role, limit);
}

async function vectorSearch(
  query: string,
  role: string | undefined,
  limit: number
): Promise<NextResponse> {
  const queryEmbedding = await embed(query);
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;

  let results: VectorResult[];

  if (role) {
    results = await prisma.$queryRaw<VectorResult[]>`
      SELECT
        id, section, content, version, heading_level,
        roles_affected, gate_type,
        1 - (embedding <=> ${vectorLiteral}::vector) AS similarity
      FROM governance_chunks
      WHERE embedding IS NOT NULL
        AND (${role} = ANY(roles_affected) OR 'ALL' = ANY(roles_affected))
      ORDER BY embedding <=> ${vectorLiteral}::vector
      LIMIT ${limit}
    `;
  } else {
    results = await prisma.$queryRaw<VectorResult[]>`
      SELECT
        id, section, content, version, heading_level,
        roles_affected, gate_type,
        1 - (embedding <=> ${vectorLiteral}::vector) AS similarity
      FROM governance_chunks
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> ${vectorLiteral}::vector
      LIMIT ${limit}
    `;
  }

  const mapped = results.map((r) => ({
    id: r.id,
    section: r.section,
    content: r.content,
    version: r.version,
    headingLevel: r.heading_level,
    rolesAffected: r.roles_affected,
    gateType: r.gate_type,
    similarity: Number(r.similarity),
  }));

  return NextResponse.json({
    results: mapped,
    query,
    role: role || null,
    count: mapped.length,
    searchMode: "vector",
  });
}

interface KeywordChunk {
  id: string;
  section: string;
  content: string;
  version: string;
  headingLevel: number;
  rolesAffected: string[];
  gateType: string | null;
}

async function keywordSearch(
  query: string,
  role: string | undefined,
  limit: number
): Promise<NextResponse> {
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w: string) => w.length > 2);

  const allChunks: KeywordChunk[] = await prisma.governanceChunk.findMany({
    orderBy: { sectionIndex: "asc" },
    select: {
      id: true,
      section: true,
      content: true,
      version: true,
      headingLevel: true,
      rolesAffected: true,
      gateType: true,
    },
  });

  const scored = allChunks
    .map((chunk: KeywordChunk) => {
      const text = `${chunk.section} ${chunk.content}`.toLowerCase();
      let score = 0;

      for (const keyword of keywords) {
        const matches = (text.match(new RegExp(keyword, "g")) || []).length;
        score += matches;
      }

      // Boost if role matches
      if (
        role &&
        chunk.rolesAffected.some((r: string) => r === role || r === "ALL")
      ) {
        score *= 1.5;
      }

      return { ...chunk, score, similarity: score > 0 ? score / 100 : 0 };
    })
    .filter((chunk: KeywordChunk & { score: number }) => chunk.score > 0)
    .sort((a: KeywordChunk & { score: number }, b: KeywordChunk & { score: number }) => b.score - a.score)
    .slice(0, limit);

  return NextResponse.json({
    results: scored,
    query,
    role: role || null,
    count: scored.length,
    searchMode: "keyword",
  });
}
