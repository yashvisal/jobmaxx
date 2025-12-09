import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function LandingPage() {
  const { userId } = await auth();
  
  // If user is logged in, redirect to chat
  if (userId) {
    redirect("/chat");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <h1 className="text-2xl font-bold">JobMaxx</h1>
          <div className="flex gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Your AI Job Application Copilot
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload your resume, paste a job link, and let AI analyze your fit, optimize your resume, 
            and generate personalized outreach to land more interviews.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8">
                Start Free →
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="p-6 rounded-xl border bg-card">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">ATS Score Analysis</h3>
            <p className="text-muted-foreground">
              Get instant keyword matching and semantic fit scores to see how well your resume aligns.
            </p>
          </div>
          <div className="p-6 rounded-xl border bg-card">
            <div className="text-3xl mb-4">✍️</div>
            <h3 className="text-xl font-semibold mb-2">Resume Optimization</h3>
            <p className="text-muted-foreground">
              AI-powered bullet rewrites tailored to each specific job posting and requirements.
            </p>
          </div>
          <div className="p-6 rounded-xl border bg-card">
            <div className="text-3xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-2">Smart Outreach</h3>
            <p className="text-muted-foreground">
              Find alumni connections and generate personalized outreach emails that get responses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
