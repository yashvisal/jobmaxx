"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChatPage() {
  const router = useRouter();
  const [jobUrl, setJobUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNewChat = async () => {
    if (!jobUrl.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobUrl }),
      });

      if (response.ok) {
        const { threadId } = await response.json();
        router.push(`/chat/${threadId}`);
      }
    } catch (error) {
      console.error("Error creating thread:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Start a New Application</CardTitle>
          <CardDescription>
            Paste a job posting URL and let AI analyze your fit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Paste job URL (e.g., linkedin.com/jobs/...)"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNewChat()}
              className="flex-1"
            />
            <Button onClick={handleNewChat} disabled={loading || !jobUrl.trim()}>
              {loading ? "Creating..." : "Analyze →"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Supports LinkedIn, Indeed, Greenhouse, Lever, and most job boards
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

