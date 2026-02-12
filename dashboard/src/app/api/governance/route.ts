import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { embedBatch, isConfigured, getProviderInfo } from "@/lib/embeddings";

// GET /api/governance — List governance sections or get version
// Kept for backward compatibility; prefer /api/governance/version and /api/governance/sections
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "version") {
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

    return NextResponse.json({
      version: latest.version,
      updatedAt: latest.updatedAt,
    });
  }

  // GET /api/governance?action=sections — List all sections
  const version = searchParams.get("version");

  const where = version ? { version } : {};
  const chunks = await prisma.governanceChunk.findMany({
    where,
    orderBy: { sectionIndex: "asc" },
    select: {
      id: true,
      section: true,
      headingLevel: true,
      sectionIndex: true,
      version: true,
      rolesAffected: true,
      gateType: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ sections: chunks, count: chunks.length });
}

// POST /api/governance — Ingest AGENT.md (chunk + embed + store)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { content, version } = body;

  if (!content || !version) {
    return NextResponse.json(
      { error: "content and version are required" },
      { status: 400 }
    );
  }

  // Split AGENT.md by headings into chunks (with sub-chunking for large sections)
  const chunks = chunkByHeadings(content, version);

  // Generate embeddings if a provider is configured
  const embeddingProvider = isConfigured();
  let embeddings: (number[] | null)[] = chunks.map(() => null);

  if (embeddingProvider) {
    try {
      const texts = chunks.map(
        (c) => `${c.section}\n\n${c.content}`
      );
      const vectors = await embedBatch(texts);
      embeddings = vectors;
    } catch (err) {
      // Log but don't fail ingest — chunks are stored without embeddings
      console.error("Embedding generation failed, storing without embeddings:", err);
    }
  }

  // Delete existing chunks for this version (upsert behavior)
  await prisma.$queryRaw`DELETE FROM governance_chunks WHERE version = ${version}`;

  // Insert chunks with embeddings using raw SQL (Prisma can't handle vector type)
  let insertedCount = 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = embeddings[i];
    const id = generateId();

    if (embedding) {
      const vectorLiteral = `[${embedding.join(",")}]`;
      await prisma.$queryRaw`
        INSERT INTO governance_chunks (
          id, section, content, version, heading_level, section_index,
          roles_affected, gate_type, embedding, created_at, updated_at
        ) VALUES (
          ${id}, ${chunk.section}, ${chunk.content}, ${version},
          ${chunk.headingLevel}, ${i}, ${chunk.rolesAffected},
          ${chunk.gateType}, ${vectorLiteral}::vector,
          NOW(), NOW()
        )
      `;
    } else {
      await prisma.$queryRaw`
        INSERT INTO governance_chunks (
          id, section, content, version, heading_level, section_index,
          roles_affected, gate_type, created_at, updated_at
        ) VALUES (
          ${id}, ${chunk.section}, ${chunk.content}, ${version},
          ${chunk.headingLevel}, ${i}, ${chunk.rolesAffected},
          ${chunk.gateType}, NOW(), NOW()
        )
      `;
    }
    insertedCount++;
  }

  const providerInfo = getProviderInfo();
  const embeddedCount = embeddings.filter((e) => e !== null).length;

  return NextResponse.json(
    {
      message: `Ingested ${insertedCount} governance chunks for v${version}`,
      count: insertedCount,
      version,
      embeddingsGenerated: embeddedCount,
      embeddingProvider: providerInfo.provider,
    },
    { status: 201 }
  );
}

// --- Helpers ---

function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 25; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

const MAX_SECTION_LINES = 150;

interface GovernanceChunkData {
  section: string;
  content: string;
  headingLevel: number;
  rolesAffected: string[];
  gateType: string | null;
}

function chunkByHeadings(
  markdown: string,
  _version: string
): GovernanceChunkData[] {
  const lines = markdown.split("\n");
  const rawChunks: GovernanceChunkData[] = [];
  let currentSection = "";
  let currentLevel = 0;
  let currentLines: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);

    if (headingMatch) {
      // Save previous chunk
      if (currentSection && currentLines.length > 0) {
        rawChunks.push({
          section: currentSection,
          content: currentLines.join("\n").trim(),
          headingLevel: currentLevel,
          rolesAffected: detectRoles(currentLines.join("\n")),
          gateType: detectGateType(currentSection),
        });
      }

      currentSection = headingMatch[2].trim();
      currentLevel = headingMatch[1].length;
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  // Don't forget the last chunk
  if (currentSection && currentLines.length > 0) {
    rawChunks.push({
      section: currentSection,
      content: currentLines.join("\n").trim(),
      headingLevel: currentLevel,
      rolesAffected: detectRoles(currentLines.join("\n")),
      gateType: detectGateType(currentSection),
    });
  }

  // Sub-chunk large ## sections by ### sub-headings
  const finalChunks: GovernanceChunkData[] = [];
  for (const chunk of rawChunks) {
    const lineCount = chunk.content.split("\n").length;

    if (chunk.headingLevel <= 2 && lineCount > MAX_SECTION_LINES) {
      const subChunks = splitBySubHeadings(chunk);
      finalChunks.push(...subChunks);
    } else {
      finalChunks.push(chunk);
    }
  }

  return finalChunks;
}

function splitBySubHeadings(parent: GovernanceChunkData): GovernanceChunkData[] {
  const lines = parent.content.split("\n");
  const subChunks: GovernanceChunkData[] = [];
  let currentSubSection = parent.section;
  let currentLines: string[] = [];

  for (const line of lines) {
    const subHeadingMatch = line.match(/^(###)\s+(.+)/);

    if (subHeadingMatch && currentLines.length > 0) {
      subChunks.push({
        section: currentSubSection,
        content: currentLines.join("\n").trim(),
        headingLevel: parent.headingLevel,
        rolesAffected: detectRoles(currentLines.join("\n")),
        gateType: detectGateType(currentSubSection),
      });
      currentSubSection = `${parent.section} > ${subHeadingMatch[2].trim()}`;
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  // Last sub-chunk
  if (currentLines.length > 0) {
    subChunks.push({
      section: currentSubSection,
      content: currentLines.join("\n").trim(),
      headingLevel: parent.headingLevel,
      rolesAffected: detectRoles(currentLines.join("\n")),
      gateType: detectGateType(currentSubSection),
    });
  }

  return subChunks;
}

const ROLE_KEYWORDS: Record<string, string> = {
  "Requirements": "REQUIREMENTS",
  "Architect": "ARCHITECTURE",
  "Planning": "PLANNING",
  "Frontend": "FRONTEND",
  "Backend": "BACKEND",
  "QA": "QA",
  "Security": "SECURITY",
  "Documentation": "DOCUMENTATION",
  "DevOps": "DEVOPS",
};

function detectRoles(content: string): string[] {
  const roles: string[] = [];
  for (const [keyword, role] of Object.entries(ROLE_KEYWORDS)) {
    if (content.includes(keyword)) {
      roles.push(role);
    }
  }
  return roles.length > 0 ? roles : ["ALL"];
}

function detectGateType(section: string): string | null {
  const lower = section.toLowerCase();
  if (lower.includes("qa")) return "qa";
  if (lower.includes("security")) return "security";
  if (lower.includes("documentation")) return "documentation";
  if (lower.includes("planning") || lower.includes("approval"))
    return "planning";
  if (lower.includes("release")) return "release";
  if (lower.includes("audit")) return "audit";
  return null;
}
