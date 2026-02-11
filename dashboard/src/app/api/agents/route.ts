import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SessionStatus, AgentRole } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subRepo = searchParams.get("subRepo");
    const status = searchParams.get("status") as SessionStatus | null;
    const agentRole = searchParams.get("agentRole") as AgentRole | null;

    const where: Record<string, unknown> = {};
    if (subRepo) where.subRepo = subRepo;
    if (status) where.status = status;
    if (agentRole) where.agentRole = agentRole;

    const sessions = await prisma.agentSession.findMany({
      where,
      include: { auditEntries: true },
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Failed to list agent sessions:", error);
    return NextResponse.json(
      { error: "Failed to list agent sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      correlationId,
      subRepo,
      agentRole,
      jiraIssue,
      model,
      tokenUsage,
      description,
    } = body;

    if (!correlationId || !subRepo || !agentRole || !jiraIssue) {
      return NextResponse.json(
        { error: "Missing required fields: correlationId, subRepo, agentRole, jiraIssue" },
        { status: 400 }
      );
    }

    const session = await prisma.agentSession.create({
      data: {
        correlationId,
        subRepo,
        agentRole,
        jiraIssue,
        model,
        tokenUsage,
        description,
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Failed to create agent session:", error);
    return NextResponse.json(
      { error: "Failed to create agent session" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, endedAt, tokenUsage, description } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (endedAt) data.endedAt = new Date(endedAt);
    if (status === "COMPLETED" || status === "FAILED") {
      data.endedAt = data.endedAt ?? new Date();
    }
    if (tokenUsage) data.tokenUsage = tokenUsage;
    if (description !== undefined) data.description = description;

    const session = await prisma.agentSession.update({
      where: { id },
      data,
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("Failed to update agent session:", error);
    return NextResponse.json(
      { error: "Failed to update agent session" },
      { status: 500 }
    );
  }
}
