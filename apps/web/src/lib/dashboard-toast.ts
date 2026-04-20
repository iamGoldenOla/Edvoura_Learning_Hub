export type DashboardToastType = 'success' | 'error' | 'info';

export type DashboardToastPayload = {
  title: string;
  description?: string;
  type?: DashboardToastType;
};

export const DASHBOARD_TOAST_EVENT = 'edvoura:dashboard-toast';

export function emitDashboardToast(payload: DashboardToastPayload) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(DASHBOARD_TOAST_EVENT, { detail: payload }));
}

