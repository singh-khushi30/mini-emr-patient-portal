"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Patient = {
  id: string;
  name: string;
  email: string;
};

export default function AdminPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPatients() {
      try {
        const response = await fetch("/api/patients");
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Failed to load patients");
        }
        setPatients(payload.data || []);
      } catch (loadError: unknown) {
        setError(loadError instanceof Error ? loadError.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    loadPatients();
  }, []);

  if (loading) return <p>Loading patients...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin - Patients</h1>
        <Link href="/admin/new-patient" className="rounded bg-slate-900 px-3 py-2 text-sm text-white">
          New Patient
        </Link>
      </div>
      <div className="overflow-x-auto rounded border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={3}>
                  No patients found
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient.id} className="border-b">
                  <td className="px-3 py-2">{patient.name || "N/A"}</td>
                  <td className="px-3 py-2">{patient.email || "N/A"}</td>
                  <td className="px-3 py-2">
                    <Link href={`/admin/patients/${patient.id}`} className="text-blue-700 underline">
                      View Patient
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
