import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/governance/search — Semantic search over governance chunks
// When pgvector embeddings are available, this uses cosine similarity.
// Until then, falls back to keyword-based text search.
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { query, role, repo, limit = 5 } = body;

  if (!query) {
    return NextResponse.json(
      { error: "query is required" },
      { status: 400 }
    );
  }

  // TODO: When Voyager embedding API is configured, embed the query
  // and use pgvector cosine similarity search:
  //
  // const embedding = await embed(query);
  // const results = await prisma.$queryRaw`
  //   SELECT id, section, content, version, roles_affected, gate_type,
  //          1 - (embedding <=> ${embedding}::vector) AS similarity
  //   FROM governance_chunks
  //   WHERE embedding IS NOT NULL
  //   ORDER BY embedding <=> ${embedding}::vector
  //   LIMIT ${limit}
  // `;

  // Keyword-based fallback: search section names and content
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w: string) => w.length > 2);

  const allChunks = await prisma.governanceChunk.findMany({
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

  // Score each chunk by keyword matches
  const scored = allChunks
    .map((chunk) => {
      const text = `${chunk.section} ${chunk.content}`.toLowerCase();
      let score = 0;

      for (const keyword of keywords) {
        const matches = (text.match(new RegExp(keyword, "g")) || []).length;
        score += matches;
      }

      // Boost if role matches
      if (
        role &&
        chunk.rolesAffected.some(
          (r) => r === role || r === "ALL"
        )
      ) {
        score *= 1.5;
      }

      return { ...chunk, score };
    })
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return NextResponse.json({
    results: scored,
    query,
    role: role || null,
    repo: repo || null,
    count: scored.length,
    searchMode: "keyword", // Will become "vector" when embeddings are configured
  });
}
