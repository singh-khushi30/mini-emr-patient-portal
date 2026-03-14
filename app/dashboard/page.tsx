"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Patient = {
  id: string;
  name: string;
  email: string;
  dob: string | null;
};

type DashboardPayload = {
  upcomingAppointments: Array<Record<string, unknown>>;
  upcomingRefills: Array<Record<string, unknown>>;
};

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId") || "";

  const [patient, setPatient] = useState<Patient | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      setError("Missing patientId in URL");
      return;
    }

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [patientResponse, dashboardResponse] = await Promise.all([
          fetch(`/api/patients/${patientId}`),
          fetch(`/api/dashboard/${patientId}`),
        ]);

        const patientPayload = await patientResponse.json();
        const dashboardPayload = await dashboardResponse.json();

        if (!patientResponse.ok) {
          throw new Error(patientPayload.error || "Failed to load patient");
        }
        if (!dashboardResponse.ok) {
          throw new Error(dashboardPayload.error || "Failed to load dashboard");
        }

        setPatient(patientPayload.patient);
        setDashboardData(dashboardPayload);
      } catch (loadError: unknown) {
        setError(loadError instanceof Error ? loadError.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [patientId]);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="rounded border bg-white p-4">
        <h1 className="text-2xl font-semibold">Patient Dashboard</h1>
        {patient ? (
          <div className="mt-3 text-sm text-slate-700">
            <p>
              <span className="font-medium">Name:</span> {patient.name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {patient.email}
            </p>
            <p>
              <span className="font-medium">DOB:</span> {patient.dob || "N/A"}
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex gap-3">
        <Link
          href={`/appointments?patientId=${patientId}`}
          className="rounded border bg-white px-3 py-2 text-sm"
        >
          Appointments
        </Link>
        <Link
          href={`/prescriptions?patientId=${patientId}`}
          className="rounded border bg-white px-3 py-2 text-sm"
        >
          Prescriptions
        </Link>
      </div>

      <section className="rounded border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Upcoming Appointments (7 days)</h2>
        <ul className="space-y-2 text-sm">
          {(dashboardData?.upcomingAppointments || []).length === 0 ? (
            <li className="text-slate-500">No upcoming appointments</li>
          ) : (
            dashboardData?.upcomingAppointments.map((appointment) => (
              <li
                key={String(appointment.id)}
                className="rounded border border-slate-200 px-3 py-2"
              >
                Provider: {String(appointment.provider_name || "N/A")} | Date:{" "}
                {String(appointment.appointment_datetime || appointment.appointment_date || "N/A")}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Upcoming Refills (7 days)</h2>
        <ul className="space-y-2 text-sm">
          {(dashboardData?.upcomingRefills || []).length === 0 ? (
            <li className="text-slate-500">No upcoming refills</li>
          ) : (
            dashboardData?.upcomingRefills.map((refill) => (
              <li key={String(refill.id)} className="rounded border border-slate-200 px-3 py-2">
                Medication: {String(refill.medication_name || "N/A")} | Refill:{" "}
                {String(refill.refill_date || refill.refill_on || "N/A")}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
