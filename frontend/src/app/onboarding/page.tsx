"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type OnboardingData = {
  school: string;
  graduationYear: string;
  major: string;
  linkedinUrl: string;
  targetRoles: string;
  clubs: string;
  activities: string;
  extraInfo: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [data, setData] = useState<OnboardingData>({
    school: "",
    graduationYear: "",
    major: "",
    linkedinUrl: "",
    targetRoles: "",
    clubs: "",
    activities: "",
    extraInfo: "",
  });

  const updateData = (field: keyof OnboardingData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }
      formData.append("data", JSON.stringify(data));

      const response = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        router.push("/chat");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Welcome to JobMaxx! 👋</CardTitle>
          <CardDescription>
            Let&apos;s set up your profile to personalize your job search experience.
            <br />
            Step {step} of {totalSteps}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Resume Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-medium">Upload Your Resume</h3>
              <p className="text-sm text-muted-foreground">
                We&apos;ll parse your resume to understand your background.
              </p>
              <Input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {resumeFile && (
                <p className="text-sm text-green-600">✓ {resumeFile.name}</p>
              )}
            </div>
          )}

          {/* Step 2: Education */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-medium">Education</h3>
              <div>
                <label className="text-sm text-muted-foreground">School</label>
                <Input
                  placeholder="e.g., Duke University"
                  value={data.school}
                  onChange={(e) => updateData("school", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Graduation Year</label>
                  <Input
                    placeholder="e.g., 2025"
                    value={data.graduationYear}
                    onChange={(e) => updateData("graduationYear", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Major</label>
                  <Input
                    placeholder="e.g., Computer Science"
                    value={data.major}
                    onChange={(e) => updateData("major", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">LinkedIn URL</label>
                <Input
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={data.linkedinUrl}
                  onChange={(e) => updateData("linkedinUrl", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 3: Career Goals */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-medium">Career Goals</h3>
              <div>
                <label className="text-sm text-muted-foreground">Target Roles</label>
                <Input
                  placeholder="e.g., Software Engineer, Product Manager"
                  value={data.targetRoles}
                  onChange={(e) => updateData("targetRoles", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Separate multiple roles with commas</p>
              </div>
            </div>
          )}

          {/* Step 4: Extra Info */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-medium">Clubs & Activities</h3>
              <div>
                <label className="text-sm text-muted-foreground">Clubs</label>
                <Input
                  placeholder="e.g., CS Club, Entrepreneurship Club"
                  value={data.clubs}
                  onChange={(e) => updateData("clubs", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Activities</label>
                <Input
                  placeholder="e.g., Hackathons, Research Assistant"
                  value={data.activities}
                  onChange={(e) => updateData("activities", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Anything else we should know?</label>
                <Textarea
                  placeholder="Any other relevant information..."
                  value={data.extraInfo}
                  onChange={(e) => updateData("extraInfo", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              Back
            </Button>
            {step < totalSteps ? (
              <Button onClick={() => setStep((s) => s + 1)}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving..." : "Complete Setup"}
              </Button>
            )}
          </div>

          {/* Skip option */}
          <div className="text-center mt-4">
            <button
              onClick={() => router.push("/chat")}
              className="text-sm text-muted-foreground hover:underline"
            >
              Skip for now
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

