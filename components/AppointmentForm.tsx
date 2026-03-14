"use client";

import { FormEvent, useState } from "react";

type AppointmentFormProps = {
  patientId: string;
  onCreated?: () => void;
};

export default function AppointmentForm({ patientId, onCreated }: AppointmentFormProps) {
  const [providerName, setProviderName] = useState("");
  const [appointmentDatetime, setAppointmentDatetime] = useState("");
  const [repeatSchedule, setRepeatSchedule] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          provider_name: providerName,
          appointment_datetime: appointmentDatetime,
          repeat_schedule: repeatSchedule || null,
          end_date: endDate || null,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to create appointment");
      }

      setProviderName("");
      setAppointmentDatetime("");
      setRepeatSchedule("");
      setEndDate("");
      onCreated?.();
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded border bg-white p-4">
      <h3 className="text-lg font-semibold">Add Appointment</h3>
      <input
        required
        value={providerName}
        onChange={(event) => setProviderName(event.target.value)}
        placeholder="Provider name"
        className="w-full rounded border px-3 py-2"
      />
      <input
        required
        type="datetime-local"
        value={appointmentDatetime}
        onChange={(event) => setAppointmentDatetime(event.target.value)}
        className="w-full rounded border px-3 py-2"
      />
      <input
        value={repeatSchedule}
        onChange={(event) => setRepeatSchedule(event.target.value)}
        placeholder="Repeat schedule (weekly/monthly)"
        className="w-full rounded border px-3 py-2"
      />
      <input
        type="date"
        value={endDate}
        onChange={(event) => setEndDate(event.target.value)}
        className="w-full rounded border px-3 py-2"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={isSaving}
        className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Create Appointment"}
      </button>
    </form>
  );
}
