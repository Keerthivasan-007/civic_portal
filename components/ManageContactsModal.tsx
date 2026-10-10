"use client";

import { useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function ManageContactsModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    locality_name: '',
    latitude: 12.8398,
    longitude: 80.0452,
    police_no: '',
    ambulance_no: '',
    fire_no: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    await supabase.from('emergency_contacts').insert([formData]);
    
    setSuccess(true);
    setLoading(false);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[3000] flex items-center justify-center backdrop-blur-sm transition-all">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[500px] overflow-hidden flex flex-col border border-gray-100 dark:border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b dark:border-gray-700 pb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Local Emergency Contact</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {success ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center font-bold">
              ✅ Emergency Contact Saved!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Locality Name</label>
                <input required type="text" placeholder="e.g. Kancheepuram North" className="w-full border rounded-xl px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.locality_name} onChange={e => setFormData({...formData, locality_name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
                  <input required type="number" step="any" className="w-full border rounded-xl px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={formData.latitude} onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
                  <input required type="number" step="any" className="w-full border rounded-xl px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={formData.longitude} onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value)})} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">🚓 Police No</label>
                  <input required type="text" className="w-full border rounded-lg px-2 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                    value={formData.police_no} onChange={e => setFormData({...formData, police_no: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">🚑 Ambulance No</label>
                  <input required type="text" className="w-full border rounded-lg px-2 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                    value={formData.ambulance_no} onChange={e => setFormData({...formData, ambulance_no: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">🚒 Fire No</label>
                  <input required type="text" className="w-full border rounded-lg px-2 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                    value={formData.fire_no} onChange={e => setFormData({...formData, fire_no: e.target.value})} />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition mt-6 disabled:opacity-50 shadow-lg">
                {loading ? 'Saving...' : 'Add Contact to Database'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
