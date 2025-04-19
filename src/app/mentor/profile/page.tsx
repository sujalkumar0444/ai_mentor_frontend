"use client";

import { useEffect, useState } from "react";
import pb from "@/lib/pb";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/stores/auth";

type Mentor = {
  id: string;
  bio: string;
  domain: string;
  rating: number;
  sessions_took: number;
};

export default function MentorProfilePage() {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    bio: "",
    domain: "",
  });
  const { user } = useAuth() as { user: { mentor?: { id: string } } };

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const mentorId = (user as { record: { mentor: { id: string } } })?.record?.mentor?.id

        if (!mentorId) {
          toast.error("You must be logged in.");
          return;
        }

        const res = await pb.collection("mentors").getOne<Mentor>(mentorId
        );

        setMentor(res);
        setForm({
          bio: res.bio || "",
          domain: res.domain || "",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch mentor profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchMentor();
  }, []);

  const handleUpdate = async () => {
    if (!mentor) return;

    try {
      const updated = await pb.collection("mentors").update(mentor.id, {
        bio: form.bio,
        domain: form.domain,
      });

      setMentor({
        id: updated.id,
        bio: updated.bio,
        domain: updated.domain,
        rating: updated.rating,
        sessions_took: updated.sessions_took,
      });
      setEditing(false);
      toast.success("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile.");
    }
  };

  if (loading) return <div className="p-6">Loading profile...</div>;
  if (!mentor) return <div className="p-6 text-muted-foreground">Mentor profile not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 w-full">
      <h1 className="text-2xl font-bold mb-4">Mentor Profile</h1>

      <Card className="w-full shadow-md">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              disabled={!editing}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              disabled={!editing}
              value={form.domain}
              onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
            />
          </div>

          <div className="flex gap-4 items-center">
            <div>
              <Label>Rating:</Label> <span className="font-medium">{mentor.rating}</span>
            </div>
            <div>
              <Label>Sessions Took:</Label>{" "}
              <span className="font-medium">{mentor.sessions_took}</span>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            {editing ? (
              <>
                <Button onClick={handleUpdate}>Save</Button>
                <Button variant="secondary" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
