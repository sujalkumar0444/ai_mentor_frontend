'use client';

import { useEffect, useState } from 'react';
import pb from '@/lib/pb';
import { useAuth } from '@/stores/auth'

interface Freelancer {
  id: string;
  experience: number;
  projects_completed: number;
  advance: number;
  skills: string;
  contact: number;
}

export default function FreelancersPage() {
    const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
    const [openExplain, setOpenExplain] = useState<string | null>(null);
    const [explanation, setExplanation] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth() as { user: { record?: { id: string }} };
    console.log(user);
  
    useEffect(() => {
      const getFreelancers = async () => {
        try {
          const res = await pb.collection('freelancers').getFullList<Freelancer>();
          setFreelancers(res);
        } catch (err) {
          console.error('Error fetching freelancers:', err);
        }
      };
      getFreelancers();
    }, []);
  
    const handleProjectCreate = async (freelancerId: string) => {
      setLoading(true);
      try {
        await pb.collection('projects').create({
          freelancer_id: freelancerId,
          description: explanation,
          state: 'OPEN',
          amount: 0,
          user_id: user?.record?.id,
        });
        alert('Project created! Awaiting freelancer response.');
        setOpenExplain(null);
        setExplanation('');
      } catch (err) {
        console.error(err);
        alert('Failed to create project');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Available Freelancers</h1>
  
        {freelancers.length === 0 ? (
          <div className="text-gray-500 italic">No freelancers available at the moment.</div>
        ) : (
          freelancers.map((f) => (
            <div key={f.id} className="p-4 border rounded-xl shadow-md space-y-2">
              <div>
            <strong>Skills:</strong>{' '}
            {typeof f.skills === 'string'
                ? f.skills
                : Object.keys(f.skills).join(', ')}
            </div>
              <div><strong>Experience:</strong> {f.experience} years</div>
              <div><strong>Projects:</strong> {f.projects_completed}</div>
              <div><strong>Contact:</strong> {f.contact}</div>
  
              {openExplain === f.id ? (
                <div className="space-y-3">
                  <textarea
                    className="w-full p-2 border rounded-md"
                    rows={4}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Describe your project in detail..."
                  />
                  <button
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => handleProjectCreate(f.id)}
                  >
                    {loading ? 'Submitting...' : 'Submit Project'}
                  </button>
                  <button
                    className="text-sm text-red-500 ml-4"
                    onClick={() => setOpenExplain(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => setOpenExplain(f.id)}
                >
                  Explain Project
                </button>
              )}
            </div>
          ))
        )}
      </div>
    );
  }