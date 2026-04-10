import { ReactNode } from 'react';
import { createClient } from '@/utils/supabase/server';
import DashboardClientShell from '@/components/dashboards/DashboardClientShell';

export default async function DashboardLayout(props: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role || 'student';
  const initialBand = user?.user_metadata?.learner_band || '7-12';

  return (
    <DashboardClientShell role={role} initialBand={initialBand}>
      {props.children}
    </DashboardClientShell>
  );
}
