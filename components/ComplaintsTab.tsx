"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { ThumbsUp, AlertTriangle, Clock } from 'lucide-react';

export default function ComplaintsTab({ userRole, username }: { userRole: string, username: string }) {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [upvotedIds, setUpvotedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchComplaints();
    const saved = localStorage.getItem(`upvotes_${username}`);
    if (saved) {
      setUpvotedIds(new Set(JSON.parse(saved)));
    }
  }, [username]);

  const fetchComplaints = async () => {
    const { data } = await supabase.from('complaints').select('*').order('upvotes', { ascending: false });
    if (data) setComplaints(data);
  };

  const handleUpvote = async (id: number, currentUpvotes: number) => {
    if (upvotedIds.has(id)) return;

    const newUpvotes = currentUpvotes + 1;
    const status = newUpvotes >= 5 ? 'ESCALATED' : 'PENDING';
    
    await supabase.from('complaints').update({ upvotes: newUpvotes, status }).eq('id', id);
    
    const newUpvotedIds = new Set(upvotedIds).add(id);
    setUpvotedIds(newUpvotedIds);
    localStorage.setItem(`upvotes_${username}`, JSON.stringify(Array.from(newUpvotedIds)));
    
    fetchComplaints();
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Community Complaints</h1>
          <p className="text-gray-500 dark:text-gray-400">Issues with 5 or more upvotes are automatically escalated to the authority.</p>
        </div>

        <div className="grid gap-4">
          {complaints.map(complaint => (
            <div key={complaint.id} className={`bg-white dark:bg-gray-800 rounded-xl p-6 border-l-4 shadow-sm transition-all ${complaint.status === 'ESCALATED' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-blue-500'}`}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-gray-900 dark:text-white text-lg">{complaint.category}</span>
                    {complaint.is_gps_verified && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-bold">✓ GPS Verified</span>
                    )}
                    {complaint.status === 'ESCALATED' && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                        <AlertTriangle size={12} /> ESCALATED TO AUTHORITY
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{complaint.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={14} /> Reported {new Date(complaint.created_at).toLocaleDateString()}</span>
                    <span>Status: {complaint.status}</span>
                  </div>
                </div>

                {userRole === 'PUBLIC' && (
                  <button 
                    onClick={() => handleUpvote(complaint.id, complaint.upvotes)}
                    disabled={upvotedIds.has(complaint.id)}
                    className={`flex flex-col items-center justify-center border rounded-xl p-3 min-w-[80px] transition ${
                      upvotedIds.has(complaint.id) 
                        ? 'bg-blue-100 border-blue-300 text-blue-700 cursor-not-allowed' 
                        : 'bg-gray-100 hover:bg-blue-50 border-gray-200 text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    <ThumbsUp size={20} className={complaint.upvotes >= 5 ? 'text-red-500' : ''} />
                    <span className="font-black text-xl mt-1">{complaint.upvotes}</span>
                  </button>
                )}
                
                {userRole === 'AUTHORITY' && complaint.status === 'ESCALATED' && (
                  <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition h-fit">
                    Take Action
                  </button>
                )}
              </div>
            </div>
          ))}
          {complaints.length === 0 && (
            <div className="text-center p-12 text-gray-500">No complaints reported yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
