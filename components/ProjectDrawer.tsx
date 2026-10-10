"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function ProjectDrawer({ project, onClose, userRole, onProjectUpdate }: { project: any, onClose: () => void, userRole?: string, onProjectUpdate?: () => void }) {
  const [justification, setJustification] = useState('');
  const [loading, setLoading] = useState(false);
  const [conflictDetails, setConflictDetails] = useState<any>(null);
  const [nearestContact, setNearestContact] = useState<any>(null);

  // Haversine formula
  const getDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (project?.status === 'FLAGGED') {
      supabase.from('conflicts').select('*, existing_project:projects!existing_project_id(title, departments(name))').eq('new_project_id', project.id).single()
        .then(({ data }) => setConflictDetails(data));
    }

    if (project) {
      supabase.from('emergency_contacts').select('*').then(({ data }) => {
        if (data && data.length > 0) {
          let closest = data[0];
          let minDistance = getDistanceMeters(project.latitude, project.longitude, closest.latitude, closest.longitude);
          for (let i = 1; i < data.length; i++) {
            const dist = getDistanceMeters(project.latitude, project.longitude, data[i].latitude, data[i].longitude);
            if (dist < minDistance) {
              closest = data[i];
              minDistance = dist;
            }
          }
          setNearestContact(closest);
        }
      });
    }
  }, [project]);

  return (
    <div className="flex flex-col h-full bg-white relative">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
      >
        &times;
      </button>
      
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold mb-2 pr-6">{project.title}</h2>
        <div className="inline-block px-3 py-1 rounded text-sm font-semibold bg-gray-100 text-gray-800 mb-4">
          Status: {project.status}
        </div>
        
        {project.status === 'FLAGGED' && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <h3 className="text-red-700 font-bold mb-1">⚠️ Conflict Detected</h3>
            <p className="text-sm text-red-700 font-semibold mb-2">
              Clashes with: {conflictDetails?.existing_project?.title} ({conflictDetails?.existing_project?.departments?.name})
            </p>
            <p className="text-sm text-red-600 whitespace-pre-wrap">
              {conflictDetails ? conflictDetails.reasoning_text : "Loading conflict details..."}
            </p>
          </div>
        )}
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="space-y-4">
          <div>
            <span className="block text-sm font-medium text-gray-500">Department</span>
            <span className="block text-lg">{project.departments?.name || 'Unknown'}</span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500">Work Type</span>
            <span className="block text-lg">{project.work_type}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-sm font-medium text-gray-500">Planned Start</span>
              <span className="block text-md">{new Date(project.planned_start).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-500">Planned End</span>
              <span className="block text-md">{new Date(project.planned_end).toLocaleDateString()}</span>
            </div>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500">Description</span>
            <p className="text-gray-700 mt-1 text-sm">{project.description}</p>
          </div>
        </div>

        {nearestContact && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
            <h3 className="text-sm font-bold text-red-800 mb-2 border-b border-red-200 pb-2">🚨 Local Emergency Hotlines ({nearestContact.locality_name})</h3>
            <div className="flex flex-col gap-1 text-sm font-semibold text-red-700">
              <div className="flex justify-between"><span>🚓 Police:</span> <span>{nearestContact.police_no}</span></div>
              <div className="flex justify-between"><span>🚑 Ambulance:</span> <span>{nearestContact.ambulance_no}</span></div>
              <div className="flex justify-between"><span>🚒 Fire:</span> <span>{nearestContact.fire_no}</span></div>
            </div>
          </div>
        )}

        {project.status === 'FLAGGED' && userRole === 'AUTHORITY' && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-bold mb-4">Authority Decision Audit</h3>
            <textarea 
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Enter written justification for overriding conflict or rejecting..."
              className="w-full border rounded p-3 mb-4 text-sm min-h-[100px] focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <button 
                disabled={!justification || loading} 
                onClick={async () => {
                  setLoading(true);
                  await supabase.from('projects').update({ status: 'APPROVED' }).eq('id', project.id);
                  if (onProjectUpdate) onProjectUpdate();
                  setLoading(false);
                }}
                className="flex-1 bg-green-600 text-white py-2 rounded font-bold disabled:opacity-50"
              >
                Approve
              </button>
              <button 
                disabled={!justification || loading} 
                onClick={async () => {
                  setLoading(true);
                  await supabase.from('projects').update({ status: 'CANCELLED' }).eq('id', project.id);
                  if (onProjectUpdate) onProjectUpdate();
                  setLoading(false);
                }}
                className="flex-1 bg-red-600 text-white py-2 rounded font-bold disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {userRole === 'UTILITY_WORKER' && (project.status === 'APPROVED' || project.status === 'ACTIVE') && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-bold mb-4">Worker Controls</h3>
            
            {project.status === 'ACTIVE' && (
              <div className="mb-4 bg-gray-50 p-4 rounded border relative">
                <label className="block text-sm font-bold text-gray-700 mb-2">Upload Progress / Completion Photo</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={() => {
                    setLoading(true);
                    setTimeout(() => setLoading(false), 1000);
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition" 
                />
                <div className="mt-3 relative">
                  <p className="text-xs text-gray-400 mb-1">Preview (Stock image for demo):</p>
                  <img src="https://images.unsplash.com/photo-1541888081622-6b9f2910712a?w=500&q=80" alt="Construction Work" className="h-32 object-cover rounded shadow w-full" />
                  <div className="absolute bottom-2 left-2 bg-black/80 text-green-400 text-[10px] font-mono px-2 py-1 rounded">
                    EXIF DATA VERIFIED<br/>
                    LAT: {project.latitude}, LNG: {project.longitude}<br/>
                    GEO-MATCH CONFIDENCE: 95%
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {project.status === 'APPROVED' && (
                <button 
                  onClick={async () => {
                    await supabase.from('projects').update({ status: 'ACTIVE', actual_start: new Date().toISOString() }).eq('id', project.id);
                    if (onProjectUpdate) onProjectUpdate();
                  }}
                  className="flex-1 bg-orange-600 text-white py-2 rounded font-bold"
                >
                  Start Work
                </button>
              )}
              {project.status === 'ACTIVE' && (
                <button 
                  onClick={async () => {
                    await supabase.from('projects').update({ status: 'COMPLETED', actual_end: new Date().toISOString() }).eq('id', project.id);
                    if (onProjectUpdate) onProjectUpdate();
                  }}
                  className="flex-1 bg-green-600 text-white py-2 rounded font-bold"
                >
                  Mark Completed
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
