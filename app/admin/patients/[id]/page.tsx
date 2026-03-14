"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppointmentForm from "@/components/AppointmentForm";
import PrescriptionForm from "@/components/PrescriptionForm";

type Patient = {
  id: string;
  name: string;
  email: string;
  dob: string | null;
};

type Appointment = {
  id: string;
  provider_name: string;
  appointment_datetime?: string;
  repeat_schedule?: string;
  end_date?: string | null;
};

type Prescription = {
  id: string;
  medication_name: string;
  dosage: string;
  quantity: number;
  refill_date?: string | null;
  refill_schedule?: string | null;
};

export default function AdminPatientDetailPage() {
  const params = useParams<{ id: string }>();
  const patientId = params?.id || "";

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchPatient() {
    if (!patientId) {
      setError("Missing patient id");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to load patient details");
      }
      setPatient(payload.patient ?? null);
      setAppointments(payload.appointments ?? []);
      setPrescriptions(payload.prescriptions ?? []);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPatient();
  }, [patientId]);

  async function deleteAppointment(id: string) {
    const confirmed = window.confirm("Delete this appointment?");
    if (!confirmed) return;

    const response = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok) {
      alert(payload.error || "Failed to delete appointment");
      return;
    }
    await fetchPatient();
  }

  async function editAppointment(appointment: Appointment) {
    const providerName = window.prompt("Provider name", appointment.provider_name || "");
    if (providerName === null) return;

    const appointmentDatetime = window.prompt(
      "Appointment datetime (YYYY-MM-DDTHH:mm:ss)",
      appointment.appointment_datetime || "",
    );
    if (appointmentDatetime === null) return;

    const repeatSchedule = window.prompt("Repeat schedule", appointment.repeat_schedule || "");
    if (repeatSchedule === null) return;

    const endDate = window.prompt("End date (YYYY-MM-DD)", appointment.end_date || "");
    if (endDate === null) return;

    const response = await fetch(`/api/appointments/${appointment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider_name: providerName,
        appointment_datetime: appointmentDatetime,
        repeat_schedule: repeatSchedule || null,
        end_date: endDate || null,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      alert(payload.error || "Failed to update appointment");
      return;
    }
    await fetchPatient();
  }

  async function deletePrescription(id: string) {
    const confirmed = window.confirm("Delete this prescription?");
    if (!confirmed) return;

    const response = await fetch(`/api/prescriptions/${id}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok) {
      alert(payload.error || "Failed to delete prescription");
      return;
    }
    await fetchPatient();
  }

  async function editPrescription(prescription: Prescription) {
    const medicationName = window.prompt("Medication name", prescription.medication_name || "");
    if (medicationName === null) return;

    const dosage = window.prompt("Dosage", prescription.dosage || "");
    if (dosage === null) return;

    const quantityInput = window.prompt("Quantity", String(prescription.quantity ?? ""));
    if (quantityInput === null) return;

    const refillDate = window.prompt("Refill date (YYYY-MM-DD)", prescription.refill_date || "");
    if (refillDate === null) return;

    const refillSchedule = window.prompt("Refill schedule", prescription.refill_schedule || "");
    if (refillSchedule === null) return;

    const response = await fetch(`/api/prescriptions/${prescription.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medication_name: medicationName,
        dosage,
        quantity: Number(quantityInput),
        refill_date: refillDate || null,
        refill_schedule: refillSchedule || null,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      alert(payload.error || "Failed to update prescription");
      return;
    }
    await fetchPatient();
  }

  if (loading) return <p>Loading patient details...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!patient) return <p>No patient data found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Patient Details</h1>
        <Link href="/admin" className="text-sm text-blue-700 underline">
          Back to Admin
        </Link>
      </div>

      <section className="rounded border bg-white p-4 text-sm">
        <p>
          <span className="font-medium">Name:</span> {patient.name}
        </p>
        <p>
          <span className="font-medium">Email:</span> {patient.email}
        </p>
        <p>
          <span className="font-medium">DOB:</span> {patient.dob || "N/A"}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Appointments</h2>
        <div className="overflow-x-auto rounded border bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-3 py-2">Provider</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Repeat</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-slate-500" colSpan={4}>
                    No appointments
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b">
                    <td className="px-3 py-2">{appointment.provider_name || "N/A"}</td>
                    <td className="px-3 py-2">{appointment.appointment_datetime || "N/A"}</td>
                    <td className="px-3 py-2">{appointment.repeat_schedule || "N/A"}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editAppointment(appointment)}
                          className="rounded border px-2 py-1 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteAppointment(appointment.id)}
                          className="rounded border border-red-300 px-2 py-1 text-xs text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AppointmentForm patientId={patientId} onCreated={fetchPatient} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Prescriptions</h2>
        <div className="overflow-x-auto rounded border bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-3 py-2">Medication</th>
                <th className="px-3 py-2">Dosage</th>
                <th className="px-3 py-2">Quantity</th>
                <th className="px-3 py-2">Refill Date</th>
                <th className="px-3 py-2">Refill</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-slate-500" colSpan={6}>
                    No prescriptions
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
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editPrescription(prescription)}
                          className="rounded border px-2 py-1 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deletePrescription(prescription.id)}
                          className="rounded border border-red-300 px-2 py-1 text-xs text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <PrescriptionForm patientId={patientId} onCreated={fetchPatient} />
      </section>
    </div>
  );
}
