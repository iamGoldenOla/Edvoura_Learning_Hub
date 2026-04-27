import Script from "next/script";

import SuperAdminAIControlClient from "@/components/dashboards/ai/SuperAdminAIControlClient";
import { requireSuperAdminAccess } from "@/app/dash/admin/_lib/role-guard";

export default async function SuperAdminAIPage() {
  await requireSuperAdminAccess();

  return (
    <>
      <Script src="https://js.puter.com/v2/" strategy="afterInteractive" />
      <SuperAdminAIControlClient />
    </>
  );
}
