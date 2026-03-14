"use client";

import { FormEvent, useState } from "react";

type PrescriptionFormProps = {
  patientId: string;
  onCreated?: () => void;
};

export default function PrescriptionForm({ patientId, onCreated }: PrescriptionFormProps) {
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [refillDate, setRefillDate] = useState("");
  const [refillSchedule, setRefillSchedule] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          medication_name: medicationName,
          dosage,
          quantity: Number(quantity),
          refill_date: refillDate || null,
          refill_schedule: refillSchedule || null,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to create prescription");
      }

      setMedicationName("");
      setDosage("");
      setQuantity("1");
      setRefillDate("");
      setRefillSchedule("");
      onCreated?.();
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded border bg-white p-4">
      <h3 className="text-lg font-semibold">Add Prescription</h3>
      <input
        required
        value={medicationName}
        onChange={(event) => setMedicationName(event.target.value)}
        placeholder="Medication name"
        className="w-full rounded border px-3 py-2"
      />
      <input
        required
        value={dosage}
        onChange={(event) => setDosage(event.target.value)}
        placeholder="Dosage"
        className="w-full rounded border px-3 py-2"
      />
      <input
        required
        type="number"
        min={1}
        value={quantity}
        onChange={(event) => setQuantity(event.target.value)}
        placeholder="Quantity"
        className="w-full rounded border px-3 py-2"
      />
      <input
        type="date"
        value={refillDate}
        onChange={(event) => setRefillDate(event.target.value)}
        className="w-full rounded border px-3 py-2"
      />
      <input
        value={refillSchedule}
        onChange={(event) => setRefillSchedule(event.target.value)}
        placeholder="Refill schedule"
        className="w-full rounded border px-3 py-2"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={isSaving}
        className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Create Prescription"}
      </button>
    </form>
  );
}
