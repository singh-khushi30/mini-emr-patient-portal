"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPatientPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          dob: dob || null,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to create patient");
      }

      const patientId = payload?.data?.id;
      if (patientId) {
        router.push(`/admin/patients/${patientId}`);
      } else {
        router.push("/admin");
      }
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl rounded border bg-white p-6">
      <h1 className="mb-4 text-2xl font-semibold">Create Patient</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name"
          className="w-full rounded border px-3 py-2"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="w-full rounded border px-3 py-2"
        />
        <input
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="w-full rounded border px-3 py-2"
        />
        <input
          type="date"
          value={dob}
          onChange={(event) => setDob(event.target.value)}
          className="w-full rounded border px-3 py-2"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={isSaving}
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Create Patient"}
        </button>
      </form>
    </div>
  );
}
