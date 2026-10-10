import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // 1. Fetch user from Supabase
    const { data: user, error } = await supabase
      .from('system_users')
      .select('*')
      .eq('username', username)
      .eq('password', password) // In a real app, use hashed passwords (e.g. bcrypt)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Return the sanitized user object
    return NextResponse.json({
      success: true,
      user: {
        id: user.id.toString(),
        name: user.name,
        username: user.username,
        role: user.role,
        department_id: user.department_id
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
