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

    const tasks = await db.task.findMany({
      where: {
        userId: session.id,
        isDeleted: true,
      },
      orderBy: { deletedAt: "desc" },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Fetch recycle bin error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recycle bin" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deletedCount = await db.task.emptyRecycleBin(session.id);

    return NextResponse.json({
      message: `Recycle bin emptied (${deletedCount} tasks permanently removed)`,
      deletedCount,
    });
  } catch (error) {
    console.error("Empty recycle bin error:", error);
    return NextResponse.json(
      { error: "Failed to empty recycle bin" },
      { status: 500 }
    );
  }
}
