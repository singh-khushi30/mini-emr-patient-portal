"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Prescription = {
  id: string;
  medication_name: string;
  dosage: string;
  quantity: number;
  refill_date?: string;
  refill_schedule?: string;
};

export default function PrescriptionsPage() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId") || "";

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      setError("Missing patientId in URL");
      return;
    }

    async function loadPrescriptions() {
      try {
        const response = await fetch(`/api/patients/${patientId}`);
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Failed to load prescriptions");
        }
        setPrescriptions(payload.prescriptions || []);
      } catch (loadError: unknown) {
        setError(loadError instanceof Error ? loadError.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    loadPrescriptions();
  }, [patientId]);

  if (loading) return <p>Loading prescriptions...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Prescriptions</h1>
        <Link href={`/dashboard?patientId=${patientId}`} className="text-sm text-blue-700 underline">
          Back to dashboard
        </Link>
      </div>
      <div className="overflow-x-auto rounded border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-3 py-2">Medication</th>
              <th className="px-3 py-2">Dosage</th>
              <th className="px-3 py-2">Quantity</th>
              <th className="px-3 py-2">Refill Date</th>
              <th className="px-3 py-2">Refill Schedule</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={5}>
                  No prescriptions found
                </td>
              </tr>
            ) : (
              prescriptions.map((prescription) => (
                <tr key={prescription.id} className="border-b">
                  <td className="px-3 py-2">{prescription.medication_name || "N/A"}</td>
                  <td className="px-3 py-2">{prescription.dosage || "N/A"}</td>
                  <td className="px-3 py-2">{prescription.quantity ?? "N/A"}</td>
                  <td className="px-3 py-2">{prescription.refill_date || "N/A"}</td>
                  <td className="px-3 py-2">{prescription.refill_schedule || "N/A"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
