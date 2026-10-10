"use client";

import { useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function AlertSubscriptionModal({ onClose }: { onClose: () => void }) {
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState('SMS');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        await supabase.from('subscriptions').insert({
          phone_number: phone,
          channel: channel,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setSuccess(true);
        setLoading(false);
        setTimeout(onClose, 2000);
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[3000] flex items-center justify-center backdrop-blur-sm transition-all">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[450px] overflow-hidden flex flex-col border border-gray-100 dark:border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Get Disruption Alerts</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Pin your home location and enter your number. We'll automatically notify you if an infrastructure project is approved within 1km of your house.
          </p>

          {success ? (
            <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-xl text-center font-bold border border-green-200 dark:border-green-800">
              ✅ Successfully Subscribed!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  placeholder="+91 98765 43210"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notification Channel</label>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    className={`flex-1 p-3 border-2 rounded-xl font-bold text-sm transition-all ${channel === 'SMS' ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300'}`}
                    onClick={() => setChannel('SMS')}
                  >💬 SMS</button>
                  <button 
                    type="button"
                    className={`flex-1 p-3 border-2 rounded-xl font-bold text-sm transition-all ${channel === 'WHATSAPP' ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300'}`}
                    onClick={() => setChannel('WHATSAPP')}
                  >📱 WhatsApp</button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-all mt-4 flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? 'Pinning Location...' : 'Subscribe via GPS 📍'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
