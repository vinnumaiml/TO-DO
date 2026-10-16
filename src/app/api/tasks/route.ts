import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim().toUpperCase();
    const priority = searchParams.get("priority")?.trim().toUpperCase();
    const tag = searchParams.get("tag")?.trim();
    const sortBy = searchParams.get("sort") || "newest";

    let orderBy: { createdAt?: "asc" | "desc"; updatedAt?: "asc" | "desc" } = {
      createdAt: "desc",
    };

    if (sortBy === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sortBy === "updated") {
      orderBy = { updatedAt: "desc" };
    }

    // Query active (non-deleted) tasks
    const tasks = await db.task.findMany({
      where: {
        userId: session.id,
        isDeleted: false,
        status: status && status !== "ALL" ? status : undefined,
        priority: priority && priority !== "ALL" ? priority : undefined,
        tag: tag && tag !== "ALL" ? tag : undefined,
        search: search || undefined,
      },
      orderBy,
    });

    // If sorting by priority, sort HIGH -> MEDIUM -> LOW
    if (sortBy === "priority") {
      const priorityOrder: Record<string, number> = { HIGH: 1, MEDIUM: 2, LOW: 3 };
      tasks.sort((a, b) => {
        const orderA = priorityOrder[a.priority] || 4;
        const orderB = priorityOrder[b.priority] || 4;
        return orderA - orderB;
      });
    }

    // Counts for active tasks + recycle bin count
    const [total, pending, inProgress, completed, recycleBinCount, allTags] = await Promise.all([
      db.task.count({ where: { userId: session.id, isDeleted: false } }),
      db.task.count({ where: { userId: session.id, status: "PENDING", isDeleted: false } }),
      db.task.count({ where: { userId: session.id, status: "IN_PROGRESS", isDeleted: false } }),
      db.task.count({ where: { userId: session.id, status: "COMPLETED", isDeleted: false } }),
      db.task.count({ where: { userId: session.id, isDeleted: true } }),
      db.task.getAllTags(session.id),
    ]);

    return NextResponse.json({
      tasks,
      stats: {
        total,
        pending,
        inProgress,
        completed,
        recycleBin: recycleBinCount,
      },
      allTags,
    });
  } catch (error) {
    console.error("Fetch tasks error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, status, priority, tags } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    const validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED"];
    const validPriorities = ["LOW", "MEDIUM", "HIGH"];

    // Clean tags array
    const cleanTags = Array.isArray(tags)
      ? tags
          .filter((t: any) => typeof t === "string" && t.trim().length > 0)
          .map((t: string) => t.trim().replace(/^#/, ""))
      : [];

    const task = await db.task.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        status: validStatuses.includes(status) ? status : "PENDING",
        priority: validPriorities.includes(priority) ? priority : "MEDIUM",
        tags: cleanTags,
        userId: session.id,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
