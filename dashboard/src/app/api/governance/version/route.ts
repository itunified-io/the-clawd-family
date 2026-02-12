import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/governance/version — Current governance version
export async function GET() {
  const latest = await prisma.governanceChunk.findFirst({
    orderBy: { updatedAt: "desc" },
    select: { version: true, updatedAt: true },
  });

  if (!latest) {
    return NextResponse.json(
      { version: null, message: "No governance ingested yet" },
      { status: 404 }
    );
  }

  // Count chunks and embeddings for this version
  const [chunkCount, embeddingCount] = await Promise.all([
    prisma.governanceChunk.count({ where: { version: latest.version } }),
    prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM governance_chunks
      WHERE version = ${latest.version} AND embedding IS NOT NULL
    `.then((rows: [{ count: bigint }]) => Number(rows[0].count)),
  ]);

  return NextResponse.json({
    version: latest.version,
    updatedAt: latest.updatedAt,
    chunkCount,
    embeddingCount,
  });
}
