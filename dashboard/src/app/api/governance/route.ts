import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/governance — List governance sections or get version
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "version") {
    // GET /api/governance?action=version — Current governance version
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

// POST /api/governance — Ingest AGENT.md (chunk + store)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { content, version } = body;

  if (!content || !version) {
    return NextResponse.json(
      { error: "content and version are required" },
      { status: 400 }
    );
  }

  // Split AGENT.md by ## headings into chunks
  const chunks = chunkByHeadings(content, version);

  // Delete existing chunks for this version (upsert behavior)
  await prisma.governanceChunk.deleteMany({ where: { version } });

  // Insert new chunks
  const created = await prisma.governanceChunk.createMany({
    data: chunks.map((chunk, index) => ({
      section: chunk.section,
      content: chunk.content,
      version,
      headingLevel: chunk.headingLevel,
      sectionIndex: index,
      rolesAffected: chunk.rolesAffected,
      gateType: chunk.gateType,
    })),
  });

  return NextResponse.json(
    {
      message: `Ingested ${created.count} governance chunks for v${version}`,
      count: created.count,
      version,
    },
    { status: 201 }
  );
}

// --- Helpers ---

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
  const chunks: GovernanceChunkData[] = [];
  let currentSection = "";
  let currentLevel = 0;
  let currentLines: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);

    if (headingMatch) {
      // Save previous chunk
      if (currentSection && currentLines.length > 0) {
        chunks.push({
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
    chunks.push({
      section: currentSection,
      content: currentLines.join("\n").trim(),
      headingLevel: currentLevel,
      rolesAffected: detectRoles(currentLines.join("\n")),
      gateType: detectGateType(currentSection),
    });
  }

  return chunks;
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
