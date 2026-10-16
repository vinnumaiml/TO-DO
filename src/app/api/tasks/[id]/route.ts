import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const task = await db.task.findUnique({
      where: { id },
    });

    if (!task || task.userId !== session.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Get task error:", error);
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const existingTask = await db.task.findUnique({
      where: { id },
    });

    if (!existingTask || existingTask.userId !== session.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, description, status, priority, tags } = body;

    const updateData: any = {};

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return NextResponse.json(
          { error: "Title cannot be empty" },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = typeof description === "string" ? description.trim() : null;
    }

    const validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED"];
    if (status !== undefined && validStatuses.includes(status)) {
      updateData.status = status;
    }

    const validPriorities = ["LOW", "MEDIUM", "HIGH"];
    if (priority !== undefined && validPriorities.includes(priority)) {
      updateData.priority = priority;
    }

    if (tags !== undefined && Array.isArray(tags)) {
      updateData.tags = tags
        .filter((t: any) => typeof t === "string" && t.trim().length > 0)
        .map((t: string) => t.trim().replace(/^#/, ""));
    }

    const updatedTask = await db.task.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const existingTask = await db.task.findUnique({
      where: { id },
    });

    if (!existingTask || existingTask.userId !== session.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent) {
      await db.task.permanentDelete(id, session.id);
      return NextResponse.json({ message: "Task permanently deleted" });
    } else {
      // Move to Recycle Bin (soft delete)
      await db.task.softDelete(id, session.id);
      return NextResponse.json({ message: "Task moved to Recycle Bin" });
    }
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
