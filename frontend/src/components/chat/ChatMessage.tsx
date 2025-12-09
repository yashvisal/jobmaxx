"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MessageProps = {
  message: {
    id: number;
    role: "assistant" | "user" | "system";
    content: string;
    messageType?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
  };
};

export function ChatMessage({ message }: MessageProps) {
  const { role, content, messageType, metadata } = message;

  // Special rendering for different message types
  if (messageType === "job_info" && metadata) {
    return (
      <Card className="border-blue-500/50 bg-blue-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            📋 Job Details
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div>
            <span className="font-medium">Company:</span>{" "}
            {(metadata.company as string) || "Unknown"}
          </div>
          <div>
            <span className="font-medium">Role:</span>{" "}
            {(metadata.role as string) || "Unknown"}
          </div>
          {metadata.location && (
            <div>
              <span className="font-medium">Location:</span>{" "}
              {metadata.location as string}
            </div>
          )}
          {content && <p className="text-muted-foreground mt-2">{content}</p>}
        </CardContent>
      </Card>
    );
  }

  if (messageType === "ats_score" && metadata) {
    const score = (metadata.score as number) || 0;
    const scoreColor =
      score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-500";

    return (
      <Card className="border-purple-500/50 bg-purple-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            📊 ATS Match Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn("text-4xl font-bold", scoreColor)}>{score}%</div>
          <p className="text-sm text-muted-foreground mt-2">{content}</p>
          {metadata.matchedKeywords && (
            <div className="mt-3">
              <p className="text-xs font-medium mb-1">Matched Keywords:</p>
              <div className="flex flex-wrap gap-1">
                {(metadata.matchedKeywords as string[]).map((kw, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (messageType === "gaps" && metadata) {
    return (
      <Card className="border-orange-500/50 bg-orange-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            🔍 Gap Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="text-muted-foreground mb-3">{content}</p>
          {metadata.gaps && (
            <ul className="space-y-2">
              {(metadata.gaps as string[]).map((gap, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  {gap}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    );
  }

  if (messageType === "contacts" && metadata) {
    return (
      <Card className="border-green-500/50 bg-green-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            👥 Potential Connections
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="text-muted-foreground mb-3">{content}</p>
          {metadata.contacts && (
            <div className="space-y-3">
              {(metadata.contacts as Array<{ name: string; title: string; connection: string }>).map(
                (contact, i) => (
                  <div key={i} className="p-2 rounded bg-background">
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-xs text-muted-foreground">{contact.title}</div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {contact.connection}
                    </Badge>
                  </div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (messageType === "email" && metadata) {
    return (
      <Card className="border-cyan-500/50 bg-cyan-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            📧 Outreach Email Draft
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {metadata.to && (
            <div className="mb-2">
              <span className="font-medium">To:</span> {metadata.to as string}
            </div>
          )}
          {metadata.subject && (
            <div className="mb-2">
              <span className="font-medium">Subject:</span> {metadata.subject as string}
            </div>
          )}
          <div className="p-3 rounded bg-background whitespace-pre-wrap font-mono text-xs">
            {content}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (messageType === "resume_rewrite" && metadata) {
    return (
      <Card className="border-pink-500/50 bg-pink-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            ✍️ Resume Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="text-muted-foreground mb-3">{content}</p>
          {metadata.suggestions && (
            <div className="space-y-3">
              {(metadata.suggestions as Array<{ original: string; improved: string }>).map(
                (item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="text-xs text-red-400 line-through">{item.original}</div>
                    <div className="text-xs text-green-400">→ {item.improved}</div>
                  </div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default text message
  return (
    <div
      className={cn(
        "p-4 rounded-lg",
        role === "assistant"
          ? "bg-muted"
          : role === "user"
          ? "bg-primary text-primary-foreground ml-12"
          : "bg-muted/50 text-muted-foreground text-sm"
      )}
    >
      <p className="whitespace-pre-wrap">{content}</p>
    </div>
  );
}

