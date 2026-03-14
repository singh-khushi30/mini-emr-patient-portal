"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Appointment = {
  id: string;
  provider_name: string;
  appointment_datetime?: string;
  appointment_date?: string;
  repeat_schedule?: string;
};

export default function AppointmentsPage() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId") || "";

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      setError("Missing patientId in URL");
      return;
    }

    async function loadAppointments() {
      try {
        const response = await fetch(`/api/patients/${patientId}`);
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Failed to load appointments");
        }
        setAppointments(payload.appointments || []);
      } catch (loadError: unknown) {
        setError(loadError instanceof Error ? loadError.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, [patientId]);

  if (loading) return <p>Loading appointments...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <Link href={`/dashboard?patientId=${patientId}`} className="text-sm text-blue-700 underline">
          Back to dashboard
        </Link>
      </div>
      <div className="overflow-x-auto rounded border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-3 py-2">Provider</th>
              <th className="px-3 py-2">Appointment Date</th>
              <th className="px-3 py-2">Repeat Schedule</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={3}>
                  No appointments found
                </td>
              </tr>
            ) : (
              appointments.map((appointment) => (
                <tr key={appointment.id} className="border-b">
                  <td className="px-3 py-2">{appointment.provider_name || "N/A"}</td>
                  <td className="px-3 py-2">
                    {appointment.appointment_datetime || appointment.appointment_date || "N/A"}
                  </td>
                  <td className="px-3 py-2">{appointment.repeat_schedule || "N/A"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
