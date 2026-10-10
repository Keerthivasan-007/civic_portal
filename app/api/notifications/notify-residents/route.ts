import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import twilio from 'twilio';

function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * (Math.PI/180);
  const dLon = (lon2 - lon1) * (Math.PI/180); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))); 
}

export async function POST(req: Request) {
  try {
    const { projectId } = await req.json();

    const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single();
    if (!project) throw new Error("Project not found");

    if (project.status !== 'APPROVED' && project.status !== 'ACTIVE') {
      return NextResponse.json({ message: 'Project is not approved or active, no notifications sent.' });
    }

    const { data: subscriptions } = await supabase.from('subscriptions').select('*');
    
    let sentCount = 0;
    for (const sub of subscriptions || []) {
      const distance = getDistanceFromLatLonInM(project.latitude, project.longitude, sub.latitude, sub.longitude);
      
      // Notify within 1km (1000 meters)
      if (distance <= 1000) {
        const message = `🚨 Civic Alert: ${project.work_type} ('${project.title}') is scheduled near your registered location starting ${new Date(project.planned_start).toLocaleDateString()}. Expect temporary disruption.`;
        
        try {
          // Initialize Twilio client dynamically to avoid build-time errors when env vars are missing
          if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
            console.log('Mocking SMS:', message);
            sentCount++;
            continue;
          }
          
          const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

          if (sub.channel === 'WHATSAPP') {
            await client.messages.create({
              body: message,
              from: 'whatsapp:+14155238886', // Twilio Sandbox
              to: `whatsapp:${sub.phone_number}`
            });
          } else {
            await client.messages.create({
              body: message,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: sub.phone_number
            });
          }
          sentCount++;
        } catch (e) {
          console.error("Failed to send to", sub.phone_number, e);
        }
      }
    }

    return NextResponse.json({ success: true, sentCount });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
