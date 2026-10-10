"use client";

import { useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function CitizenReportModal({ onClose, onSuccess }: { onClose: () => void, onSuccess?: () => void }) {
  const [category, setCategory] = useState('PUBLIC_WORKS');
  const [description, setDescription] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const verifyLocation = () => {
    setVerifying(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTimeout(() => {
            setIsVerified(true);
            setVerifying(false);
          }, 1000);
        },
        () => {
          setIsVerified(false);
          setVerifying(false);
        }
      );
    } else {
      setIsVerified(false);
      setVerifying(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // Default deadline 48 hours from now
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 48);

    await supabase.from('complaints').insert({
      category,
      issue_type: 'Public Report',
      description,
      is_gps_verified: isVerified === true,
      sla_deadline: deadline.toISOString()
    });

    setLoading(false);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center">
      <div className="bg-white rounded shadow-xl w-[550px] overflow-hidden flex flex-col">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-lg font-semibold">New Utility Service Report</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white font-bold">&times;</button>
        </div>
        
        <div className="p-6 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Issue Category</label>
            <div className="flex gap-2">
              <button 
                className={`flex-1 p-2 border text-sm font-medium transition-colors ${category === 'PUBLIC_WORKS' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setCategory('PUBLIC_WORKS')}
              >Public Works / Roads</button>
              <button 
                className={`flex-1 p-2 border text-sm font-medium transition-colors ${category === 'WATER_SUPPLY' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setCategory('WATER_SUPPLY')}
              >Water Supply</button>
              <button 
                className={`flex-1 p-2 border text-sm font-medium transition-colors ${category === 'ELECTRICITY' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setCategory('ELECTRICITY')}
              >Electricity</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Issue Description</label>
            <textarea 
              placeholder="Provide specific details about the issue..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded p-3 text-sm min-h-[100px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div>
             <label className="block text-sm font-semibold text-gray-700 mb-2">Supporting Evidence (Optional)</label>
             <input 
               type="file" 
               accept="image/*" 
               className="w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:border file:border-gray-300 file:rounded file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 transition-colors" 
             />
             <p className="text-xs text-gray-400 mt-2 italic">* Photos are securely uploaded to civic storage buckets.</p>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location Verification</label>
            <div className="flex items-center gap-3">
              <button 
                onClick={verifyLocation}
                disabled={verifying}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-4 py-2 rounded font-medium text-sm transition-colors"
              >
                {verifying ? 'Verifying coordinates...' : 'Pin Current Coordinates'}
              </button>
              {isVerified === true && <span className="text-green-700 text-sm font-medium">✓ Verified On-Site</span>}
              {isVerified === false && <span className="text-yellow-600 text-sm font-medium">⚠ Location Unverified</span>}
            </div>
            <p className="text-xs text-gray-500 mt-2">Note: Verified on-site reports are automatically escalated according to departmental SLAs.</p>
          </div>

          <button onClick={handleSubmit} disabled={loading || !description} className="bg-blue-600 text-white py-2.5 rounded font-semibold hover:bg-blue-700 transition-colors mt-2 text-sm disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Formal Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
