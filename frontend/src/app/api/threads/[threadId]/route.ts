import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, threads, messages } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { threadId } = await params;
    const threadIdNum = parseInt(threadId);

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get thread (verify ownership)
    const [thread] = await db
      .select()
      .from(threads)
      .where(and(eq(threads.id, threadIdNum), eq(threads.userId, user.id)))
      .limit(1);

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // Get messages
    const threadMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.threadId, threadIdNum))
      .orderBy(asc(messages.createdAt));

    return NextResponse.json({
      thread,
      messages: threadMessages,
    });
  } catch (error) {
    console.error("Error fetching thread:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

