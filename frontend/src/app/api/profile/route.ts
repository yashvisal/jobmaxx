import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
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

    const formData = await request.formData();
    const dataString = formData.get("data") as string;
    const data = JSON.parse(dataString || "{}");

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (existingUser) {
      // Update existing user
      await db
        .update(users)
        .set({
          school: data.school || null,
          graduationYear: data.graduationYear ? parseInt(data.graduationYear) : null,
          major: data.major || null,
          linkedinUrl: data.linkedinUrl || null,
          targetRoles: data.targetRoles ? data.targetRoles.split(",").map((r: string) => r.trim()) : null,
          clubs: data.clubs ? data.clubs.split(",").map((c: string) => c.trim()) : null,
          activities: data.activities ? data.activities.split(",").map((a: string) => a.trim()) : null,
          extraInfo: data.extraInfo || null,
          onboardingComplete: true,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, userId));
    } else {
      // Create new user
      await db.insert(users).values({
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || null,
        school: data.school || null,
        graduationYear: data.graduationYear ? parseInt(data.graduationYear) : null,
        major: data.major || null,
        linkedinUrl: data.linkedinUrl || null,
        targetRoles: data.targetRoles ? data.targetRoles.split(",").map((r: string) => r.trim()) : null,
        clubs: data.clubs ? data.clubs.split(",").map((c: string) => c.trim()) : null,
        activities: data.activities ? data.activities.split(",").map((a: string) => a.trim()) : null,
        extraInfo: data.extraInfo || null,
        onboardingComplete: true,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    await db
      .update(users)
      .set({
        school: data.school || null,
        graduationYear: data.graduationYear ? parseInt(data.graduationYear) : null,
        major: data.major || null,
        linkedinUrl: data.linkedinUrl || null,
        targetRoles: data.targetRoles ? data.targetRoles.split(",").map((r: string) => r.trim()) : null,
        clubs: data.clubs ? data.clubs.split(",").map((c: string) => c.trim()) : null,
        activities: data.activities ? data.activities.split(",").map((a: string) => a.trim()) : null,
        extraInfo: data.extraInfo || null,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

