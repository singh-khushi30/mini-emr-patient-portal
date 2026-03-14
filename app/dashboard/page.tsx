"use client";
export const dynamic = "force-dynamic";
import { Suspense } from "react";
import DashboardContent from "./DashboardContent";

function PageContent() {
  return <DashboardContent />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <PageContent />
    </Suspense>
  );
}
