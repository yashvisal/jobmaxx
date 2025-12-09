"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { Skeleton } from "@/components/ui/skeleton";

type Message = {
  id: number;
  role: "assistant" | "user" | "system";
  content: string;
  messageType?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

type Thread = {
  id: number;
  company: string;
  role: string;
  status: string;
};

export default function ThreadPage() {
  const params = useParams();
  const threadId = params.threadId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchThread = async () => {
      try {
        const response = await fetch(`/api/threads/${threadId}`);
        if (response.ok) {
          const data = await response.json();
          setThread(data.thread);
          setMessages(data.messages);
        }
      } catch (error) {
        console.error("Error fetching thread:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchThread();

    // Poll for new messages while analyzing
    const interval = setInterval(fetchThread, 2000);
    return () => clearInterval(interval);
  }, [threadId]);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="h-full p-4 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Thread Header */}
      {thread && (
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold">
            {thread.company || "Unknown Company"} - {thread.role || "Unknown Role"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Status: {thread.status === "analyzing" ? "🔄 Analyzing..." : "✅ Complete"}
          </p>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
    </div>
  );
}

