"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type ProfileData = {
  school: string;
  graduationYear: string;
  major: string;
  linkedinUrl: string;
  targetRoles: string;
  clubs: string;
  activities: string;
  extraInfo: string;
};

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ProfileData>({
    school: "",
    graduationYear: "",
    major: "",
    linkedinUrl: "",
    targetRoles: "",
    clubs: "",
    activities: "",
    extraInfo: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const profile = await response.json();
          setData({
            school: profile.school || "",
            graduationYear: profile.graduationYear?.toString() || "",
            major: profile.major || "",
            linkedinUrl: profile.linkedinUrl || "",
            targetRoles: profile.targetRoles?.join(", ") || "",
            clubs: profile.clubs?.join(", ") || "",
            activities: profile.activities?.join(", ") || "",
            extraInfo: profile.extraInfo || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateData = (field: keyof ProfileData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/chat");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your profile information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
            <CardDescription>Your academic background</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">School</label>
              <Input
                value={data.school}
                onChange={(e) => updateData("school", e.target.value)}
                placeholder="e.g., Duke University"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Graduation Year</label>
                <Input
                  value={data.graduationYear}
                  onChange={(e) => updateData("graduationYear", e.target.value)}
                  placeholder="e.g., 2025"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Major</label>
                <Input
                  value={data.major}
                  onChange={(e) => updateData("major", e.target.value)}
                  placeholder="e.g., Computer Science"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional</CardTitle>
            <CardDescription>Your career information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">LinkedIn URL</label>
              <Input
                value={data.linkedinUrl}
                onChange={(e) => updateData("linkedinUrl", e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Target Roles</label>
              <Input
                value={data.targetRoles}
                onChange={(e) => updateData("targetRoles", e.target.value)}
                placeholder="e.g., Software Engineer, Product Manager"
              />
              <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activities</CardTitle>
            <CardDescription>Clubs and extracurriculars</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Clubs</label>
              <Input
                value={data.clubs}
                onChange={(e) => updateData("clubs", e.target.value)}
                placeholder="e.g., CS Club, Entrepreneurship Club"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Activities</label>
              <Input
                value={data.activities}
                onChange={(e) => updateData("activities", e.target.value)}
                placeholder="e.g., Hackathons, Research Assistant"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Extra Info</label>
              <Textarea
                value={data.extraInfo}
                onChange={(e) => updateData("extraInfo", e.target.value)}
                placeholder="Anything else relevant..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.push("/chat")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

