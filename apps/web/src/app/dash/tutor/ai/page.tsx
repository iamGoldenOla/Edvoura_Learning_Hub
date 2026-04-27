import Script from "next/script";
import { redirect } from "next/navigation";

import TutorAIWorkspaceClient from "@/components/dashboards/ai/TutorAIWorkspaceClient";
import { requireAppViewer } from "@/lib/app-context";

export default async function TutorAIWorkspacePage() {
  const viewer = await requireAppViewer();
  const role = viewer.currentUser.primaryRole;

  if (role !== "tutor" && role !== "admin" && role !== "super_admin") {
    redirect("/dash/student");
  }

  return (
    <>
      <Script src="https://js.puter.com/v2/" strategy="afterInteractive" />
      <TutorAIWorkspaceClient />
    </>
  );
}
