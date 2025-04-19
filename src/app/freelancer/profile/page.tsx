"use client";

import { useState, useEffect } from "react";
import pb from "@/lib/pb"; // Your PocketBase instance
import { useAuth } from "@/stores/auth"; // Auth store

interface Freelancer {
  id: string;
  experience: number;
  projects_completed: number;
  advance: number;
  skills: Record<string, any> | string; // Flexible to allow both during editing
  contact: number;
}

export default function FreelancerProfile() {
  const { user } = useAuth();
  const freelancerId = (user as { record: { freelancer: { id: string } } })?.record?.freelancer?.id;

  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState<Freelancer | null>(null);
  const [newSkillKey, setNewSkillKey] = useState<string>('');
  const [newSkillValue, setNewSkillValue] = useState<string>('');

  useEffect(() => {
    const fetchFreelancerData = async () => {
      try {
        const res = await pb.collection("freelancers").getOne(freelancerId);
        setFreelancer(res);
        setUpdatedData(res); // Initialize for editing
      } catch (err) {
        console.error("Error fetching freelancer data:", err);
      }
    };

    if (freelancerId) {
      fetchFreelancerData();
    }
  }, [freelancerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    setUpdatedData((prev) => ({
      ...prev!,
      [field]: e.target.value,
    }));
  };

  const handleAddSkill = () => {
    if (!newSkillKey || !newSkillValue) {
      alert("Please enter both a key and value.");
      return;
    }

    setUpdatedData((prev) => {
      let currentSkills: Record<string, any> = {};

      if (typeof prev!.skills === "string") {
        try {
          currentSkills = JSON.parse(prev!.skills);
        } catch {
          alert("Current skills are not valid JSON.");
          return prev!;
        }
      } else {
        currentSkills = { ...prev!.skills };
      }

      currentSkills[newSkillKey] = newSkillValue;

      return {
        ...prev!,
        skills: currentSkills,
      };
    });

    setNewSkillKey('');
    setNewSkillValue('');
  };

  const handleSave = async () => {
    try {
      if (updatedData) {
        let parsedSkills = updatedData.skills;

        if (typeof updatedData.skills === "string") {
          try {
            parsedSkills = JSON.parse(updatedData.skills);
          } catch (e) {
            alert("Invalid JSON format for skills");
            return;
          }
        }

        const payload = {
          ...updatedData,
          skills: parsedSkills,
        };

        await pb.collection("freelancers").update(freelancerId, payload);
        setFreelancer(payload);
        setIsEditing(false);
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Error updating freelancer profile:", err);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Freelancer Profile</h1>

      {freelancer ? (
        <div className="space-y-4">
          <div>
            <strong>Experience:</strong>{" "}
            {isEditing ? (
              <input
                type="number"
                value={updatedData.experience}
                onChange={(e) => handleChange(e, "experience")}
                className="p-2 border rounded"
              />
            ) : (
              freelancer.experience
            )}
          </div>

          <div>
            <strong>Projects Completed:</strong>{" "}
            {isEditing ? (
              <input
                type="number"
                value={updatedData.projects_completed}
                onChange={(e) => handleChange(e, "projects_completed")}
                className="p-2 border rounded"
              />
            ) : (
              freelancer.projects_completed
            )}
          </div>

          <div>
            <strong>Skills (JSON):</strong>{" "}
            {isEditing ? (
              <textarea
                className="w-full p-2 border rounded-md"
                value={
                  typeof updatedData.skills === "string"
                    ? updatedData.skills
                    : JSON.stringify(updatedData.skills, null, 2)
                }
                onChange={(e) => handleChange(e, "skills")}
                rows={6}
              />
            ) : (
              <pre>{JSON.stringify(freelancer.skills, null, 2)}</pre>
            )}
          </div>

          {isEditing && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillKey}
                  onChange={(e) => setNewSkillKey(e.target.value)}
                  placeholder="Skill Key"
                  className="p-2 border rounded w-1/2"
                />
                <input
                  type="text"
                  value={newSkillValue}
                  onChange={(e) => setNewSkillValue(e.target.value)}
                  placeholder="Skill Value"
                  className="p-2 border rounded w-1/2"
                />
              </div>
              <button
                onClick={handleAddSkill}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Skill
              </button>
            </div>
          )}

          <div>
            <strong>Contact:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                value={updatedData.contact}
                onChange={(e) => handleChange(e, "contact")}
                className="p-2 border rounded"
              />
            ) : (
              freelancer.contact
            )}
          </div>

          <div>
            <strong>Advance:</strong> ₹
            {isEditing ? (
              <input
                type="number"
                value={updatedData.advance}
                onChange={(e) => handleChange(e, "advance")}
                className="p-2 border rounded"
              />
            ) : (
              freelancer.advance
            )}
          </div>

          <div className="space-x-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
