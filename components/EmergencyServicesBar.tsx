"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

// Haversine formula
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function EmergencyServicesBar({ userLat, userLng }: { userLat: number, userLng: number }) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [nearest, setNearest] = useState<any>(null);

  const fetchContacts = async () => {
    const { data } = await supabase.from('emergency_contacts').select('*');
    if (data) setContacts(data);
  };

  useEffect(() => {
    fetchContacts();
    // Poll for updates in case admin adds one
    const interval = setInterval(fetchContacts, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (contacts.length === 0) return;
    
    let closest = contacts[0];
    let minDistance = getDistanceMeters(userLat, userLng, closest.latitude, closest.longitude);
    
    for (let i = 1; i < contacts.length; i++) {
      const dist = getDistanceMeters(userLat, userLng, contacts[i].latitude, contacts[i].longitude);
      if (dist < minDistance) {
        closest = contacts[i];
        minDistance = dist;
      }
    }
    setNearest(closest);
  }, [contacts, userLat, userLng]);

  if (!nearest) {
    return (
      <div className="flex gap-4 text-xs font-bold text-red-500 bg-red-100/10 px-4 py-2 rounded-full border border-red-900">
        <span>🚨 HOTLINES</span>
        <span className="text-gray-400">100 Police</span>
        <span className="text-gray-400">108 Ambulance</span>
        <span className="text-gray-400">101 Fire</span>
      </div>
    );
  }

  return (
    <div className="flex gap-4 text-xs font-bold text-red-500 bg-red-100/10 px-4 py-2 rounded-full border border-red-900 items-center">
      <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px]">🚨 {nearest.locality_name.toUpperCase()}</span>
      <span className="hover:text-red-400 cursor-pointer transition">🚓 {nearest.police_no}</span>
      <span className="hover:text-red-400 cursor-pointer transition">🚑 {nearest.ambulance_no}</span>
      <span className="hover:text-red-400 cursor-pointer transition">🚒 {nearest.fire_no}</span>
    </div>
  );
}
