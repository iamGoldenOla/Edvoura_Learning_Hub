import { ReactNode } from 'react';
import DashboardClientShell from '@/components/dashboards/DashboardClientShell';
import { gradeBandCodeToUiBand, requireAppViewer } from '@/lib/app-context';

export default async function DashboardLayout(props: { children: ReactNode }) {
  const viewer = await requireAppViewer();
  const role = viewer.currentUser.primaryRole;
  const initialBand = gradeBandCodeToUiBand(viewer.currentUser.learnerProfile?.gradeBandCode ?? null);

  return (
    <DashboardClientShell
      role={role}
      initialBand={initialBand}
      viewerName={viewer.currentUser.profile.fullName ?? viewer.currentUser.email}
      viewerSecondaryLabel={viewer.currentUser.learnerProfile?.gradeLevelName ?? role.replace('_', ' ')}
      viewerAvatarPath={viewer.currentUser.profile.avatarPath}
    >
      {props.children}
    </DashboardClientShell>
  );
}
