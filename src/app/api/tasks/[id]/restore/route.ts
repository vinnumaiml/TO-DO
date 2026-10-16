import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Params {
  params: {
    id: string;
  };
}

export async function POST(req: NextRequest, { params }: Params) {
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

    const restoredTask = await db.task.restore(id, session.id);

    return NextResponse.json({
      message: "Task restored successfully",
      task: restoredTask,
    });
  } catch (error) {
    console.error("Restore task error:", error);
    return NextResponse.json(
      { error: "Failed to restore task" },
      { status: 500 }
    );
  }
}
