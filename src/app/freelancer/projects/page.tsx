"use client";

import { useEffect, useState } from "react";
import pb from "@/lib/pb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/stores/auth";

export default function FreelancerDashboard() {
  const [projects, setProjects] = useState<{ id: string; description: string }[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth()
  const freelancerId = (user as { record: { freelancer: { id: string } } })?.record?.freelancer?.id

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await pb.collection("projects").getFullList({
          filter: `freelancer_id="${freelancerId}" && state="OPEN"`,
        });
        setProjects(res.map((project: any) => ({
          id: project.id,
          description: project.description,
        })));
      } catch (err) {
        console.error("Error fetching freelancer projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [freelancerId]);

  const handleApprove = async (projectId: string) => {
    const amount = parseFloat(amounts[projectId]);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      await pb.collection("projects").update(projectId, {
        state: "ACCEPTED",
        amount,
      });
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      console.error("Error approving project:", err);
    }
  };

  if (loading) return <div className="p-4">Loading projects...</div>;
  if (!projects.length) return <div className="p-4">No project requests available.</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Project Requests</h1>
      {projects.map((p) => (
        <div key={p.id} className="p-4 border rounded-lg shadow space-y-3">
          <div>
            <strong>Description:</strong> {p.description}
          </div>
          <div>
            <strong>Set Project Amount:</strong>
            <Input
              type="number"
              placeholder="₹ Enter total amount"
              value={amounts[p.id] || ""}
              onChange={(e) =>
                setAmounts({ ...amounts, [p.id]: e.target.value })
              }
              className="mt-1"
            />
          </div>
          <Button onClick={() => handleApprove(p.id)} className="bg-blue-600 mt-2">
            Approve Project
          </Button>
        </div>
      ))}
    </div>
  );
}
