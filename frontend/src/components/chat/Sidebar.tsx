"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Thread = {
  id: number;
  company: string;
  role: string;
  status: string;
  createdAt: string;
};

export function Sidebar() {
  const pathname = usePathname();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await fetch("/api/threads");
        if (response.ok) {
          const data = await response.json();
          setThreads(data.threads);
        }
      } catch (error) {
        console.error("Error fetching threads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, [pathname]); // Refetch when navigation changes

  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col">
      {/* New Chat Button */}
      <div className="p-4">
        <Link href="/chat">
          <Button className="w-full" variant="outline">
            + New Chat
          </Button>
        </Link>
      </div>

      <Separator />

      {/* Thread List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Loading...
            </p>
          ) : threads.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No applications yet
            </p>
          ) : (
            threads.map((thread) => {
              const isActive = pathname === `/chat/${thread.id}`;
              return (
                <Link key={thread.id} href={`/chat/${thread.id}`}>
                  <div
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    )}
                  >
                    <div className="font-medium truncate">
                      {thread.company || "Unknown"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {thread.role || "Unknown Role"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {thread.status === "analyzing" ? "🔄" : "✅"}{" "}
                      {new Date(thread.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Settings Link */}
      <Separator />
      <div className="p-4">
        <Link href="/settings">
          <Button variant="ghost" className="w-full justify-start">
            ⚙️ Settings
          </Button>
        </Link>
      </div>
    </div>
  );
}

