"use client";

import { useEffect, useState } from "react";
import pb from "@/lib/pb";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/stores/auth";
import { loadRazorpay, openRazorpay } from "@/utils/razorpay"; // NEW utility

interface Freelancer {
  experience: string;
  projects_completed: number;
  skills: string;
  contact: string;
  advance?: number;
}

interface Project {
  id: string;
  state: string;
  description: string;
  amount?: number;
  expand?: {
    freelancer_id?: Freelancer;
  };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth() as { user: { record?: { id: string } } };
  const userId = user?.record?.id;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await pb.collection("projects").getFullList({
          filter: `user_id="${userId}"`,
          expand: "freelancer_id",
        });

        setProjects(
          res.map((project) => ({
            id: project.id,
            state: project.state,
            description: project.description,
            amount: project.amount,
            expand: project.expand,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userId]);

  const handlePayAdvance = async (project: Project) => {
    const freelancer = project.expand?.freelancer_id;
    if (!freelancer || !freelancer.advance) {
      alert("Freelancer has not set an advance.");
      return;
    }

    await openRazorpay({
      amount: freelancer.advance,
      projectId: project.id,
      freelancer,
    });
  };

  if (loading) return <div className="p-4">Loading projects...</div>;
  if (!projects.length) return <div className="p-4">No projects found.</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Your Projects</h1>
      {projects.map((p) => {
        const freelancer = p.expand?.freelancer_id;

        return (
          <div key={p.id} className="p-4 border rounded-xl shadow space-y-2">
            <div>
              <strong>Status:</strong>{" "}
              <span className="capitalize">{p.state}</span>
            </div>

            <div>
              <strong>Description:</strong> {p.description}
            </div>

            <div>
              <strong>Freelancer:</strong>{" "}
              {freelancer ? (
                <>
                  <div>Experience: {freelancer.experience}</div>
                  <div>Projects: {freelancer.projects_completed}</div>
                  <div>Skills: {renderSkills(freelancer.skills)}</div>
                  <div>Contact: {freelancer.contact}</div>
                </>
              ) : (
                "N/A"
              )}
            </div>

            {p.state === "ACCEPTED" && (
              <>
                <div>
                  <strong>Total Amount:</strong> ₹{p.amount}
                </div>
                <Button
                  onClick={() => handlePayAdvance(p)}
                  className="mt-2 bg-green-600"
                >
                  Pay Advance ₹{freelancer?.advance}
                </Button>
              </>
            )}

            {p.state === "OPEN" && (
              <Button disabled className="mt-2">
                Requested
              </Button>
            )}

            {p.state === "COMPLETED" && (
              <span className="text-green-700 font-semibold">Completed ✅</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

const renderSkills = (skills: string | string[]): string => {
  try {
    const parsed = typeof skills === "string" ? JSON.parse(skills) : skills;
    return Array.isArray(parsed) ? parsed.join(", ") : JSON.stringify(parsed);
  } catch {
    return typeof skills === "string" ? skills : "Invalid format";
  }
};
