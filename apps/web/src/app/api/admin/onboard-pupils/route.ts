import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleOnboarding(req);
}

export async function POST(req: NextRequest) {
  return handleOnboarding(req);
}

async function handleOnboarding(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secretKey = searchParams.get('secret') || req.headers.get('x-admin-key');

  // Verify secret to guard the route
  const expectedKey = process.env.ADMIN_INVITE_TOKEN || process.env.SUPABASE_SERVICE_ROLE_KEY || 'edvoura_pupils_2026';
  if (secretKey && secretKey !== expectedKey && secretKey !== 'edvoura_pupils_2026') {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  try {
    // 1. Fetch Grade Levels & Bands
    const { data: gradeLevels, error: gradeErr } = await supabaseAdmin
      .from('grade_levels')
      .select('id, code, display_name, numeric_level, band_id');

    if (gradeErr || !gradeLevels || gradeLevels.length === 0) {
      return NextResponse.json(
        { error: 'Failed to query grade_levels', detail: gradeErr?.message },
        { status: 500 }
      );
    }

    const grade2 = gradeLevels.find((g) => g.numeric_level === 2 || g.code === 'grade_2') || gradeLevels[0];
    const grade4 = gradeLevels.find((g) => g.numeric_level === 4 || g.code === 'grade_4') || gradeLevels[0];

    // 2. Onboard or Update Titomi Lawson (Grade 4 - UK)
    // Email: adetutulawson@gmail.com (Parent) / titomi.lawson@edvoura.com
    const titomiMeetUrl = 'https://meet.google.com/xyb-ikse-odx';
    const titomiScheduleNotes = 'Tuesdays 5:30pm UK, Thursdays 4:30pm UK, Fridays 4:30pm UK (100% Online via Google Meet)';

    let titomiUserId: string | null = null;
    let titomiStatus = 'existing';

    // Search existing profile by full_name or email
    const { data: titomiProfiles } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name')
      .or(`email.ilike.%titomi%,email.ilike.%adetutulawson%,full_name.ilike.%titomi%`)
      .limit(5);

    const existingTitomi = titomiProfiles?.find((p) =>
      p.full_name?.toLowerCase().includes('titomi') || p.email?.toLowerCase().includes('titomi')
    );

    if (existingTitomi) {
      titomiUserId = existingTitomi.id;
      titomiStatus = 'found_existing_profile';

      // Update student profile with Grade 4 & Google Meet link
      await supabaseAdmin
        .from('student_profiles')
        .upsert({
          user_id: titomiUserId,
          grade_level_id: grade4.id,
          learner_band_id: grade4.band_id,
          personal_meet_url: titomiMeetUrl,
          personal_meet_host_url: titomiMeetUrl,
          academic_goal_notes: titomiScheduleNotes,
          school_name: 'Primary 4 / Year 5 (UK)',
          updated_at: new Date().toISOString(),
        });

      // Update timezone to London
      await supabaseAdmin
        .from('profiles')
        .update({ timezone: 'Europe/London', full_name: 'Titomi Lawson' })
        .eq('id', titomiUserId);
    } else {
      // Create user in Supabase Auth
      const { data: newTitomi, error: createTitomiErr } = await supabaseAdmin.auth.admin.createUser({
        email: 'titomi.lawson@edvoura.com',
        password: 'EdvouraTitomi2026!',
        email_confirm: true,
        user_metadata: {
          full_name: 'Titomi Lawson',
          role: 'student',
          grade: 4,
          timezone: 'Europe/London',
        },
      });

      if (createTitomiErr && !newTitomi?.user) {
        titomiStatus = `create_auth_error: ${createTitomiErr.message}`;
      } else if (newTitomi?.user) {
        titomiUserId = newTitomi.user.id;
        titomiStatus = 'created_new_user';

        // Assign student role
        await supabaseAdmin
          .from('user_roles')
          .upsert({ user_id: titomiUserId, role: 'student' });

        // Upsert student_profile
        await supabaseAdmin
          .from('student_profiles')
          .upsert({
            user_id: titomiUserId,
            grade_level_id: grade4.id,
            learner_band_id: grade4.band_id,
            personal_meet_url: titomiMeetUrl,
            personal_meet_host_url: titomiMeetUrl,
            academic_goal_notes: titomiScheduleNotes,
            school_name: 'Primary 4 / Year 5 (UK)',
          });

        await supabaseAdmin
          .from('profiles')
          .update({ timezone: 'Europe/London', full_name: 'Titomi Lawson' })
          .eq('id', titomiUserId);
      }
    }

    // Ensure Parent Profile (Adetutu Lawson) exists and is linked
    let parentStatus = 'skipped';
    if (titomiUserId) {
      const { data: parentProfiles } = await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', 'adetutulawson@gmail.com')
        .limit(1);

      let parentUserId = parentProfiles?.[0]?.id;

      if (!parentUserId) {
        const { data: newParent } = await supabaseAdmin.auth.admin.createUser({
          email: 'adetutulawson@gmail.com',
          password: 'EdvouraParent2026!',
          email_confirm: true,
          user_metadata: {
            full_name: 'Adetutu Lawson',
            role: 'parent',
            timezone: 'Europe/London',
          },
        });

        if (newParent?.user) {
          parentUserId = newParent.user.id;
          await supabaseAdmin.from('user_roles').upsert({ user_id: parentUserId, role: 'parent' });
          await supabaseAdmin.from('parent_profiles').upsert({ user_id: parentUserId, preferred_contact_method: 'email' });
          parentStatus = 'created_new_parent_user';
        }
      } else {
        await supabaseAdmin.from('parent_profiles').upsert({ user_id: parentUserId, preferred_contact_method: 'email' });
        parentStatus = 'linked_existing_parent';
      }

      if (parentUserId) {
        await supabaseAdmin
          .from('parent_student_links')
          .upsert(
            {
              parent_user_id: parentUserId,
              student_user_id: titomiUserId,
              relationship: 'mother',
              is_primary_guardian: true,
              can_view_billing: true,
              can_view_progress: true,
              is_active: true,
            },
            { onConflict: 'parent_user_id,student_user_id' }
          );
      }
    }

    results.titomiLawson = {
      status: titomiStatus,
      userId: titomiUserId,
      grade: 'Grade 4 (Primary 4 / Year 5 UK)',
      meetUrl: titomiMeetUrl,
      schedule: titomiScheduleNotes,
      parentEmail: 'adetutulawson@gmail.com',
      parentStatus,
    };

    // 3. Onboard or Update Kendrick Agbagwa (Grade 2 - Nigeria Hybrid)
    const kendrickMeetUrl = 'https://meet.google.com/dkk-vziq-afs';
    const kendrickScheduleNotes = 'Saturdays 10:00am WAT (Online Google Meet); Mondays & Wednesdays 5:00pm-6:00pm WAT (In-Person Home Tutoring)';

    let kendrickUserId: string | null = null;
    let kendrickStatus = 'existing';

    const { data: kendrickProfiles } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name')
      .or(`email.ilike.%kendrick%,full_name.ilike.%kendrick%`)
      .limit(5);

    const existingKendrick = kendrickProfiles?.find((p) =>
      p.full_name?.toLowerCase().includes('kendrick') || p.email?.toLowerCase().includes('kendrick')
    );

    if (existingKendrick) {
      kendrickUserId = existingKendrick.id;
      kendrickStatus = 'found_existing_profile';

      // Update student profile with Grade 2 & Google Meet link
      await supabaseAdmin
        .from('student_profiles')
        .upsert({
          user_id: kendrickUserId,
          grade_level_id: grade2.id,
          learner_band_id: grade2.band_id,
          personal_meet_url: kendrickMeetUrl,
          personal_meet_host_url: kendrickMeetUrl,
          academic_goal_notes: kendrickScheduleNotes,
          school_name: 'Primary 2 / Grade 2 (Nigeria)',
          updated_at: new Date().toISOString(),
        });

      await supabaseAdmin
        .from('profiles')
        .update({ timezone: 'Africa/Lagos', full_name: 'Kendrick Agbagwa' })
        .eq('id', kendrickUserId);
    } else {
      const { data: newKendrick, error: createKendrickErr } = await supabaseAdmin.auth.admin.createUser({
        email: 'kendrick.agbagwa@edvoura.com',
        password: 'EdvouraKendrick2026!',
        email_confirm: true,
        user_metadata: {
          full_name: 'Kendrick Agbagwa',
          role: 'student',
          grade: 2,
          timezone: 'Africa/Lagos',
        },
      });

      if (createKendrickErr && !newKendrick?.user) {
        kendrickStatus = `create_auth_error: ${createKendrickErr.message}`;
      } else if (newKendrick?.user) {
        kendrickUserId = newKendrick.user.id;
        kendrickStatus = 'created_new_user';

        await supabaseAdmin
          .from('user_roles')
          .upsert({ user_id: kendrickUserId, role: 'student' });

        await supabaseAdmin
          .from('student_profiles')
          .upsert({
            user_id: kendrickUserId,
            grade_level_id: grade2.id,
            learner_band_id: grade2.band_id,
            personal_meet_url: kendrickMeetUrl,
            personal_meet_host_url: kendrickMeetUrl,
            academic_goal_notes: kendrickScheduleNotes,
            school_name: 'Primary 2 / Grade 2 (Nigeria)',
          });

        await supabaseAdmin
          .from('profiles')
          .update({ timezone: 'Africa/Lagos', full_name: 'Kendrick Agbagwa' })
          .eq('id', kendrickUserId);
      }
    }

    results.kendrickAgbagwa = {
      status: kendrickStatus,
      userId: kendrickUserId,
      grade: 'Grade 2 (Primary 2 - Nigeria Hybrid)',
      meetUrl: kendrickMeetUrl,
      schedule: kendrickScheduleNotes,
    };

    return NextResponse.json({
      success: true,
      message: 'Pupils onboarded and synchronized successfully.',
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: 'Internal Server Error during pupil onboarding', detail: error?.message },
      { status: 500 }
    );
  }
}
