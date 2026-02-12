import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ChunkWithEmbedding {
  id: string;
  section: string;
  heading_level: number;
  section_index: number;
  version: string;
  roles_affected: string[];
  gate_type: string | null;
  updated_at: Date;
  has_embedding: boolean;
}

// GET /api/governance/sections — List all governance sections with embedding status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const version = searchParams.get("version");

  // Use tagged template (parameterized) to avoid SQL injection
  let chunks: ChunkWithEmbedding[];

  if (version) {
    chunks = await prisma.$queryRaw<ChunkWithEmbedding[]>`
      SELECT
        id, section, heading_level, section_index, version,
        roles_affected, gate_type, updated_at,
        (embedding IS NOT NULL) AS has_embedding
      FROM governance_chunks
      WHERE version = ${version}
      ORDER BY section_index ASC
    `;
  } else {
    chunks = await prisma.$queryRaw<ChunkWithEmbedding[]>`
      SELECT
        id, section, heading_level, section_index, version,
        roles_affected, gate_type, updated_at,
        (embedding IS NOT NULL) AS has_embedding
      FROM governance_chunks
      ORDER BY section_index ASC
    `;
  }

  const sections = chunks.map((chunk) => ({
    id: chunk.id,
    section: chunk.section,
    headingLevel: chunk.heading_level,
    sectionIndex: chunk.section_index,
    version: chunk.version,
    rolesAffected: chunk.roles_affected,
    gateType: chunk.gate_type,
    updatedAt: chunk.updated_at,
    hasEmbedding: chunk.has_embedding,
  }));

  return NextResponse.json({
    sections,
    count: sections.length,
    embeddedCount: sections.filter((s) => s.hasEmbedding).length,
  });
}
