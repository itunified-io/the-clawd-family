import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  Provider,
  Environment,
  Lifecycle,
} from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subRepo = searchParams.get("subRepo");
    const provider = searchParams.get("provider") as Provider | null;
    const environment = searchParams.get("environment") as Environment | null;
    const lifecycle = searchParams.get("lifecycle") as Lifecycle | null;

    const where: Record<string, unknown> = {};
    if (subRepo) where.subRepo = subRepo;
    if (provider) where.provider = provider;
    if (environment) where.environment = environment;
    if (lifecycle) where.lifecycle = lifecycle;

    const resources = await prisma.infrastructureResource.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("Failed to list infrastructure resources:", error);
    return NextResponse.json(
      { error: "Failed to list infrastructure resources" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      subRepo,
      provider,
      resourceType,
      environment,
      lifecycle,
      name,
      config,
      ocTask,
      provisionedAt,
    } = body;

    if (!subRepo || !provider || !resourceType || !environment || !name || !config) {
      return NextResponse.json(
        { error: "Missing required fields: subRepo, provider, resourceType, environment, name, config" },
        { status: 400 }
      );
    }

    const resource = await prisma.infrastructureResource.create({
      data: {
        subRepo,
        provider,
        resourceType,
        environment,
        lifecycle,
        name,
        config,
        ocTask,
        provisionedAt: provisionedAt ? new Date(provisionedAt) : undefined,
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("Failed to create infrastructure resource:", error);
    return NextResponse.json(
      { error: "Failed to create infrastructure resource" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, lifecycle, lastVerified } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    if (!lifecycle && !lastVerified) {
      return NextResponse.json(
        { error: "At least one update field required: lifecycle, lastVerified" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (lifecycle) data.lifecycle = lifecycle;
    if (lastVerified) data.lastVerified = new Date(lastVerified);

    const resource = await prisma.infrastructureResource.update({
      where: { id },
      data,
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error("Failed to update infrastructure resource:", error);
    return NextResponse.json(
      { error: "Failed to update infrastructure resource" },
      { status: 500 }
    );
  }
}
