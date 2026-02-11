import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GapType } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subRepo = searchParams.get("subRepo");
    const gapType = searchParams.get("gapType") as GapType | null;
    const resolved = searchParams.get("resolved");

    const where: Record<string, unknown> = {};
    if (subRepo) where.subRepo = subRepo;
    if (gapType) where.gapType = gapType;
    if (resolved !== null) where.resolved = resolved === "true";

    const gaps = await prisma.gapDetection.findMany({
      where,
      orderBy: { detectedAt: "desc" },
    });

    return NextResponse.json(gaps);
  } catch (error) {
    console.error("Failed to list gap detections:", error);
    return NextResponse.json(
      { error: "Failed to list gap detections" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      subRepo,
      gapType,
      provider,
      description,
      severity,
      ocTask,
    } = body;

    if (!subRepo || !gapType || !provider || !description || !severity) {
      return NextResponse.json(
        { error: "Missing required fields: subRepo, gapType, provider, description, severity" },
        { status: 400 }
      );
    }

    const gap = await prisma.gapDetection.create({
      data: {
        subRepo,
        gapType,
        provider,
        description,
        severity,
        ocTask,
      },
    });

    return NextResponse.json(gap, { status: 201 });
  } catch (error) {
    console.error("Failed to create gap detection:", error);
    return NextResponse.json(
      { error: "Failed to create gap detection" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, resolved, ocTask } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (resolved !== undefined) {
      data.resolved = resolved;
      if (resolved) {
        data.resolvedAt = new Date();
      }
    }
    if (ocTask !== undefined) data.ocTask = ocTask;

    const gap = await prisma.gapDetection.update({
      where: { id },
      data,
    });

    return NextResponse.json(gap);
  } catch (error) {
    console.error("Failed to update gap detection:", error);
    return NextResponse.json(
      { error: "Failed to update gap detection" },
      { status: 500 }
    );
  }
}
