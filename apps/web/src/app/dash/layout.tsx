import { ReactNode } from 'react';
import DashboardClientShell from '@/components/dashboards/DashboardClientShell';
import { gradeBandCodeToUiBand, requireAppViewer, getBillingSummary } from '@/lib/app-context';

export default async function DashboardLayout(props: { children: ReactNode }) {
  const viewer = await requireAppViewer();
  const role = viewer.currentUser.primaryRole;
  const initialBand = gradeBandCodeToUiBand(viewer.currentUser.learnerProfile?.gradeBandCode ?? null);
  
  const billingSummary = await getBillingSummary(viewer.accessToken).catch(() => null);
  const hasAccess = billingSummary?.entitlement.hasAccess ?? true;
  const subscriptionStatus = billingSummary?.subscription?.status ?? null;

  return (
    <DashboardClientShell
      role={role}
      initialBand={initialBand}
      viewerName={viewer.currentUser.profile.fullName ?? viewer.currentUser.email}
      viewerSecondaryLabel={viewer.currentUser.learnerProfile?.gradeLevelName ?? role.replace('_', ' ')}
      viewerAvatarPath={viewer.currentUser.profile.avatarPath}
      subscriptionStatus={subscriptionStatus}
      hasAccess={hasAccess}
    >
      {props.children}
    </DashboardClientShell>
  );
}
