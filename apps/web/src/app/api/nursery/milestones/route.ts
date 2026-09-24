import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');

  if (!studentId) {
    return NextResponse.json({ error: 'Missing studentId' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('nursery_milestones')
      .select('*')
      .eq('student_id', studentId);

    if (error) {
      console.error('Error fetching nursery milestones:', error);
      return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
    }

    // Group by area
    const grouped = data?.reduce((acc: any, curr: any) => {
      if (!acc[curr.area]) acc[curr.area] = [];
      acc[curr.area].push(curr);
      return acc;
    }, {});

    return NextResponse.json({ milestones: grouped || {} });
  } catch (err: any) {
    console.error('Unexpected error fetching milestones:', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, area, milestoneName, achieved, notes } = body;

    if (!studentId || !area || !milestoneName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if exists
    const { data: existing } = await supabaseAdmin
      .from('nursery_milestones')
      .select('id')
      .eq('student_id', studentId)
      .eq('area', area)
      .eq('milestone_name', milestoneName)
      .single();

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('nursery_milestones')
        .update({
          achieved: achieved,
          teacher_notes: notes || '',
          observed_at: achieved ? new Date().toISOString() : null
        })
        .eq('id', existing.id)
        .select()
        .single();
        
      if (error) throw error;
      return NextResponse.json({ data });
    } else {
       const { data, error } = await supabaseAdmin
        .from('nursery_milestones')
        .insert({
          student_id: studentId,
          area: area,
          milestone_name: milestoneName,
          achieved: achieved,
          teacher_notes: notes || '',
          observed_at: achieved ? new Date().toISOString() : null
        })
        .select()
        .single();
        
      if (error) throw error;
      return NextResponse.json({ data });
    }
  } catch (err: any) {
    console.error('Unexpected error saving milestone:', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
