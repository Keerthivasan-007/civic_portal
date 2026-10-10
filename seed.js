const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lpyktvtbvudhjqnbidjd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxweWt0dnRidnVkaGpxbmJpZGpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2Mjk1NjcsImV4cCI6MjEwNzIwNTU2N30.KVAFlVlVVVLQQ9TVAYDduS4VFzZm0GZsrD-djl5kwwc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  const newProjects = [
    {
      title: 'Tambaram Junction Flyover Maintenance',
      description: 'Routine structural maintenance and repaving of the flyover surface.',
      department_id: 1, // Corporation Road Dept
      work_type: 'Resurfacing',
      planned_start: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      planned_end: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PROPOSED',
      is_emergency: false,
      contractor_name: 'L&T Infrastructure',
      contractor_phone: '9876543210',
      latitude: 12.9249, 
      longitude: 80.1100
    },
    {
      title: 'Velachery Main Road Sewer Upgrade',
      description: 'Deep trenching to replace century-old sewage lines.',
      department_id: 2, // Metro Water
      work_type: 'Pipe Trenching',
      planned_start: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      planned_end: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      actual_start: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ACTIVE',
      is_emergency: false,
      contractor_name: 'Chennai Civic Works',
      contractor_phone: '9988776655',
      latitude: 12.9784,
      longitude: 80.2185
    },
    {
      title: 'OMR IT Corridor Power Grid Expansion',
      description: 'Laying high-voltage underground cables to support new IT parks.',
      department_id: 3, // TNEB
      work_type: 'Cable Laying',
      planned_start: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      planned_end: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      actual_start: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      actual_end: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'COMPLETED',
      is_emergency: false,
      contractor_name: 'PowerGrid Solutions',
      contractor_phone: '9123456789',
      latitude: 12.9010,
      longitude: 80.2279
    },
    {
      title: 'Emergency Sinkhole Repair at Guindy',
      description: 'Immediate road closure and filling of a sinkhole caused by water leak.',
      department_id: 1, 
      work_type: 'Resurfacing',
      planned_start: new Date().toISOString(),
      planned_end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      actual_start: new Date().toISOString(),
      status: 'ACTIVE',
      is_emergency: true,
      emergency_reason: 'Sinkhole threat to public safety',
      latitude: 13.0067,
      longitude: 80.2206
    }
  ];

  console.log('Inserting mock projects...');
  const { data, error } = await supabase.from('projects').insert(newProjects).select();
  
  if (error) {
    console.error('Error inserting data:', error);
  } else {
    console.log('Successfully inserted', data.length, 'projects!');
  }
}

seed();
