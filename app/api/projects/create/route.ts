import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Haversine formula to calculate distance between two coordinates in meters
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radius of the earth in m
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in m
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}

export async function POST(req: Request) {
  try {
    const project = await req.json();

    // 1. Fetch all existing projects
    const { data: existingProjects, error } = await supabase.from('projects').select('*');
    if (error) throw error;

    let conflicts = [];

    // 2. Compute spatial distance and apply Conflict Decision Logic
    for (const ep of existingProjects) {
      const distance = getDistanceFromLatLonInM(project.latitude, project.longitude, ep.latitude, ep.longitude);
      
      if (distance <= 100) {
        const newStart = new Date(project.planned_start);
        const newEnd = new Date(project.planned_end);
        // Enhanced Conflict Detection Logic
        let reasons = [];
        let recommendations = [];
        let conflictType = null;
        
        // 1. Spatial-Schedule Overlap (overlapping dates)
        if (ep.status === 'ACTIVE' || ep.status === 'PROPOSED' || ep.status === 'APPROVED') {
          const epStart = new Date(ep.planned_start);
          const epEnd = new Date(ep.planned_end);
          if ((newStart <= epEnd && newStart >= epStart) || (newEnd >= epStart && newEnd <= epEnd)) {
            conflictType = 'SPATIAL_SCHEDULE_OVERLAP';
            reasons.push(`${project.work_type} and ${ep.work_type} have overlapping planned dates on this road segment.`);
            recommendations.push("Coordinate the agencies to stagger the work dates or agree on a shared site plan. A shared trenching plan can save up to 40% in contractor mobilization costs.");
          }
        }
        
        // 2. Repeat-Excavation Risk (resurfaced recently)
        const isRoadSurface = ep.work_type === 'Resurfacing' || ep.work_type === 'Road Repair';
        const isExcavation = project.work_type === 'Pipe Trenching' || project.work_type === 'Drainage' || project.work_type === 'Cable Laying';
        
        if (ep.status === 'COMPLETED' && isRoadSurface && isExcavation) {
          const epEnd = new Date(ep.actual_end || ep.planned_end);
          const diffTime = newStart.getTime() - epEnd.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          
          if (diffDays <= 90 && diffDays >= 0) {
            conflictType = 'REPEAT_EXCAVATION_RISK';
            reasons.push(`REPEAT EXCAVATION RISK: ${project.work_type} excavation follows planned ${ep.work_type} work within ${diffDays} days in the same road segment.`);
            recommendations.push("Warning: Breaking newly laid asphalt wastes taxpayer money. Coordinate sequence with road authority to lay pipes BEFORE resurfacing, saving estimated ₹2 Lakhs per 100 meters.");
          }
        }

        if (conflictType) {
          conflicts.push({ type: conflictType, existingProject: ep, reasoning_text: reasons.join(" "), recommendation: recommendations.join(" ") });
        }
      }
    }

    // 3. Insert project
    const status = conflicts.length > 0 ? 'FLAGGED' : 'PROPOSED';
    const { data: insertedProject, error: insertError } = await supabase
      .from('projects')
      .insert({ ...project, status })
      .select()
      .single();
    
    if (insertError) throw insertError;

    // 4. Record conflicts
    for (const conflict of conflicts) {
      await supabase.from('conflicts').insert({
        new_project_id: insertedProject.id,
        existing_project_id: conflict.existingProject.id,
        conflict_type: conflict.type,
        status: 'FLAGGED',
        reasoning_text: conflict.reasoning_text + "\n\nRecommendation: " + conflict.recommendation
      });
    }

    return NextResponse.json({ success: true, project: insertedProject, conflicts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
