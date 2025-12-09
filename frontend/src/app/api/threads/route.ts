import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, threads, messages } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ threads: [] });
    }

    // Get threads
    const userThreads = await db
      .select()
      .from(threads)
      .where(eq(threads.userId, user.id))
      .orderBy(desc(threads.createdAt));

    return NextResponse.json({ threads: userThreads });
  } catch (error) {
    console.error("Error fetching threads:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();
    
    if (!userId || !clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobUrl } = await request.json();

    if (!jobUrl) {
      return NextResponse.json({ error: "Job URL is required" }, { status: 400 });
    }

    // Get or create user
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user) {
      const [newUser] = await db
        .insert(users)
        .values({
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || null,
        })
        .returning();
      user = newUser;
    }

    // Create thread
    const [thread] = await db
      .insert(threads)
      .values({
        userId: user.id,
        jobUrl,
        status: "analyzing",
      })
      .returning();

    // Add initial message
    await db.insert(messages).values({
      threadId: thread.id,
      role: "assistant",
      content: "Starting analysis of your job application...",
      messageType: "text",
    });

    // Trigger backend analysis (fire and forget)
    fetch(`${BACKEND_URL}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        threadId: thread.id,
        jobUrl,
        userProfile: {
          school: user.school,
          graduationYear: user.graduationYear,
          major: user.major,
          resumeText: user.resumeText,
          linkedinUrl: user.linkedinUrl,
          targetRoles: user.targetRoles,
          clubs: user.clubs,
          activities: user.activities,
          extraInfo: user.extraInfo,
        },
      }),
    }).catch((err) => {
      console.error("Error triggering analysis:", err);
    });

    return NextResponse.json({ threadId: thread.id });
  } catch (error) {
    console.error("Error creating thread:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

