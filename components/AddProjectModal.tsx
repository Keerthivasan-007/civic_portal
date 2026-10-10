"use client";

import { useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function AddProjectModal({ onClose, onSuccess, departmentId, initialCoords }: { onClose: () => void, onSuccess: () => void, departmentId?: number, initialCoords?: {lat: number, lng: number} | null }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    work_type: 'Pipe Trenching',
    planned_start: '',
    planned_end: '',
    latitude: initialCoords?.lat || 12.8398,
    longitude: initialCoords?.lng || 80.0452,
    contractor_name: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, department_id: departmentId })
      });
      
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl w-[600px] overflow-hidden flex flex-col">
        <div className="bg-purple-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Propose New Project</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl font-bold">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>}
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Project Title</label>
            <input required type="text" className="w-full border rounded p-2" 
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Work Type</label>
            <select className="w-full border rounded p-2" 
              value={formData.work_type} onChange={e => setFormData({...formData, work_type: e.target.value})}>
              <option value="Resurfacing">Resurfacing</option>
              <option value="Road Repair">Road Repair</option>
              <option value="Pipe Trenching">Pipeline</option>
              <option value="Drainage">Drainage</option>
              <option value="Cable Laying">Cable</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Planned Start</label>
              <input required type="date" className="w-full border rounded p-2" 
                value={formData.planned_start} onChange={e => setFormData({...formData, planned_start: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Planned End</label>
              <input required type="date" className="w-full border rounded p-2" 
                value={formData.planned_end} onChange={e => setFormData({...formData, planned_end: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Latitude</label>
              <input required type="number" step="any" className="w-full border rounded p-2" 
                value={formData.latitude} onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Longitude</label>
              <input required type="number" step="any" className="w-full border rounded p-2" 
                value={formData.longitude} onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value)})} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Contractor Name</label>
            <input type="text" className="w-full border rounded p-2" 
              value={formData.contractor_name} onChange={e => setFormData({...formData, contractor_name: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea required className="w-full border rounded p-2 min-h-[80px]" 
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <button disabled={loading} type="submit" className="bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition mt-2 disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Proposal & Check Conflicts'}
          </button>
        </form>
      </div>
    </div>
  );
}
