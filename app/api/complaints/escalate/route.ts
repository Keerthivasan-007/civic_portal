import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST() {
  try {
    // Escalate complaints where SLA has expired
    const { data: expiredComplaints, error: fetchError } = await supabase
      .from('complaints')
      .select('*')
      .eq('status', 'PENDING')
      .lt('sla_deadline', new Date().toISOString());

    if (fetchError) throw fetchError;

    if (!expiredComplaints || expiredComplaints.length === 0) {
      return NextResponse.json({ message: 'No complaints to escalate.' });
    }

    const idsToEscalate = expiredComplaints.map(c => c.id);

    const { error: updateError } = await supabase
      .from('complaints')
      .update({ status: 'ESCALATED', escalation_level: 2 })
      .in('id', idsToEscalate);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, escalatedCount: idsToEscalate.length });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
