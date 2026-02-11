import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AgentRole } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const correlationId = searchParams.get("correlationId");
    const jiraIssue = searchParams.get("jiraIssue");
    const agentRole = searchParams.get("agentRole") as AgentRole | null;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where: Record<string, unknown> = {};
    if (correlationId) where.correlationId = correlationId;
    if (jiraIssue) where.jiraIssue = jiraIssue;
    if (agentRole) where.agentRole = agentRole;

    if (dateFrom || dateTo) {
      const timestampFilter: Record<string, Date> = {};
      if (dateFrom) timestampFilter.gte = new Date(dateFrom);
      if (dateTo) timestampFilter.lte = new Date(dateTo);
      where.timestamp = timestampFilter;
    }

    const entries = await prisma.auditEntry.findMany({
      where,
      include: { session: true },
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Failed to list audit entries:", error);
    return NextResponse.json(
      { error: "Failed to list audit entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      correlationId,
      jiraIssue,
      agentRole,
      actionType,
      resource,
      result,
      humanApproved,
      model,
      tokenUsage,
      sessionId,
    } = body;

    if (!correlationId || !jiraIssue || !agentRole || !actionType || !resource || !result) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: correlationId, jiraIssue, agentRole, actionType, resource, result",
        },
        { status: 400 }
      );
    }

    const entry = await prisma.auditEntry.create({
      data: {
        correlationId,
        jiraIssue,
        agentRole,
        actionType,
        resource,
        result,
        humanApproved: humanApproved ?? false,
        model,
        tokenUsage,
        sessionId,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Failed to create audit entry:", error);
    return NextResponse.json(
      { error: "Failed to create audit entry" },
      { status: 500 }
    );
  }
}
