"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../utils/supabase';

// Dynamically import the map component with SSR disabled
const Map = dynamic(() => import('../components/MapComponent'), { ssr: false });
import EmergencyServicesBar from '../components/EmergencyServicesBar';
import ProjectDrawer from '../components/ProjectDrawer';
import CitizenReportModal from '../components/CitizenReportModal';

import { useAuth } from '../context/AuthContext';
import { LogOut, PlusCircle, Moon, Sun, Bell, PhoneCall, Map as MapIcon, Users as UsersIcon } from 'lucide-react';
import AddProjectModal from '../components/AddProjectModal';
import AlertSubscriptionModal from '../components/AlertSubscriptionModal';
import ManageContactsModal from '../components/ManageContactsModal';
import ComplaintsTab from '../components/ComplaintsTab';

export default function Home() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'MAP' | 'COMPLAINTS'>('MAP');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [showCitizenModal, setShowCitizenModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{lat: number, lng: number} | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 12.8398, lng: 80.0452 });

  useEffect(() => {
    if (activeTab === 'MAP') {
      fetchProjects();
    }
  }, [activeTab]);

  const fetchProjects = async () => {
    const { data, error } = await supabase.from('projects').select('*, departments(name)');
    if (error) {
      console.error("Error fetching projects:", error);
    } else {
      setProjects(data || []);
      setSelectedProject((prev: any) => prev ? (data?.find((p: any) => p.id === prev.id) || prev) : null);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (isSelectingLocation) {
      setSelectedCoords({ lat, lng });
      setIsSelectingLocation(false);
      setShowAddProjectModal(true);
    }
  };

  if (!user) return null; // Wait for redirect in AuthContext

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 transition-colors">
      <div className="bg-gray-900 text-white p-3 flex justify-between items-center z-[2001] px-6 border-b">
        <div className="flex items-center gap-4">
          <span className="font-black text-xl tracking-tight mr-4">CIVIC PORTAL</span>
          
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('MAP')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'MAP' ? 'bg-white text-gray-900 shadow' : 'text-gray-400 hover:text-white'}`}
            >
              <MapIcon size={16} /> Map View
            </button>
            <button 
              onClick={() => setActiveTab('COMPLAINTS')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'COMPLAINTS' ? 'bg-white text-gray-900 shadow' : 'text-gray-400 hover:text-white'}`}
            >
              <UsersIcon size={16} /> Complaints
            </button>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {user.role === 'AUTHORITY' && (
            <button onClick={() => setShowContactsModal(true)} className="flex items-center gap-2 hover:text-red-400 transition text-sm font-bold border border-gray-700 px-3 py-1 rounded-full">
              <PhoneCall size={14} /> Update Hotlines
            </button>
          )}
          <div className="text-sm border-l border-gray-700 pl-6">
            Logged in as <span className="font-bold text-blue-400">{user.name}</span> ({user.role})
          </div>
          <button onClick={logout} className="flex items-center gap-2 hover:text-red-400 transition text-sm font-bold">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
      
      {isSelectingLocation && activeTab === 'MAP' && (
        <div className="bg-purple-600 text-white text-center py-2 font-bold z-[1000] relative animate-pulse shadow-md">
          📍 Click anywhere on the map to set the project location
          <button onClick={() => setIsSelectingLocation(false)} className="ml-4 underline hover:text-purple-200">Cancel</button>
        </div>
      )}

      {activeTab === 'COMPLAINTS' ? (
        <ComplaintsTab userRole={user.role} username={user.username} />
      ) : (
        <div className="flex flex-1 overflow-hidden relative">
          <div className={`w-[70%] h-full relative ${isSelectingLocation ? 'cursor-crosshair' : ''}`}>
            <Map 
              projects={projects} 
              onProjectSelect={(project: any) => { if (!isSelectingLocation) setSelectedProject(project); }} 
              onMapClick={handleMapClick}
              onCenterChange={(lat, lng) => setMapCenter({lat, lng})}
            />
            
            {user.role === 'PUBLIC' && !isSelectingLocation && (
              <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-3">
                <button 
                  onClick={() => setShowAlertModal(true)}
                  className="bg-gray-900 dark:bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2"
                >
                  <Bell size={18} /> Get SMS Alerts
                </button>
                <button 
                  onClick={() => setShowCitizenModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg font-bold hover:bg-blue-700 transition"
                >
                  Report Utility Issue
                </button>
              </div>
            )}

            {user.role === 'AUTHORITY' && !isSelectingLocation && (
              <button 
                onClick={() => setIsSelectingLocation(true)}
                className="absolute bottom-6 right-6 z-[1000] bg-purple-600 text-white px-6 py-3 rounded-full shadow-lg font-bold hover:bg-purple-700 transition flex items-center gap-2"
              >
                <PlusCircle size={20} /> Propose Project
              </button>
            )}
          </div>
          
          <div className="w-[30%] h-full border-l bg-white shadow-xl overflow-y-auto z-[2000]">
            {selectedProject ? (
              <ProjectDrawer 
                 project={selectedProject} 
                 onClose={() => setSelectedProject(null)} 
                 userRole={user.role}
                 onProjectUpdate={fetchProjects}
              />
            ) : (
              <div className="p-8 text-gray-500 text-center flex items-center justify-center h-full">
                Select a project on the map to view details.
              </div>
            )}
          </div>
        </div>
      )}

      {showCitizenModal && (
        <CitizenReportModal onClose={() => setShowCitizenModal(false)} />
      )}

      {showAlertModal && (
        <AlertSubscriptionModal onClose={() => setShowAlertModal(false)} />
      )}

      {showContactsModal && (
        <ManageContactsModal onClose={() => setShowContactsModal(false)} />
      )}

      {showAddProjectModal && (
        <AddProjectModal 
          onClose={() => setShowAddProjectModal(false)} 
          onSuccess={() => {
            setShowAddProjectModal(false);
            fetchProjects();
          }}
          departmentId={user.department_id}
          initialCoords={selectedCoords}
        />
      )}
    </div>
  );
}
