# Mini EMR + Patient Portal

A full-stack Mini EMR and Patient Portal built with Next.js App Router and Supabase (Postgres).

This project includes:
- A patient-facing portal (login, dashboard, appointments, prescriptions)
- An admin EMR interface (patient list, patient detail, create/update/delete operations)
- REST-style API routes under `app/api/*` backed by Supabase tables

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Supabase JavaScript Client (`@supabase/supabase-js`)
- Supabase Postgres

## Architecture

### Frontend

- App Router pages are in `app/*`.
- Pages are mostly client components (`"use client"`) that call backend APIs using `fetch()`.
- Shared UI form components are in `components/*`.

### Backend

- API routes are implemented with Next.js route handlers in `app/api/**/route.ts`.
- Each handler uses `NextResponse` and Supabase client calls.
- CRUD operations map directly to `patients`, `appointments`, and `prescriptions` tables.

### Database

- Supabase provides Postgres and query access through `lib/supabaseClient.js`.
- API handlers call `.from("<table>").select()`, `.insert()`, `.update()`, `.delete()`.

### Data Flow

1. User interacts with frontend page/form.
2. Frontend sends `fetch()` request to `/api/...`.
3. API route validates input and runs Supabase query.
4. API returns JSON (`{ data }` or `{ error }`).
5. Frontend updates state and UI.

## Features

### Patient Portal

- `/` Login page
  - Calls `POST /api/login`
  - Redirects to `/dashboard?patientId=<id>` on success
- `/dashboard`
  - Loads patient info via `/api/patients/[id]`
  - Loads upcoming records via `/api/dashboard/[patientId]`
  - Shows links to appointments/prescriptions pages
- `/appointments`
  - Uses `/api/patients/[id]` to render patient appointment schedule
- `/prescriptions`
  - Uses `/api/patients/[id]` to render patient prescriptions

### Admin EMR

- `/admin`
  - Patient table using `GET /api/patients`
- `/admin/new-patient`
  - Create patient form using `POST /api/patients`
- `/admin/patients/[id]`
  - Patient profile, appointment list, prescription list via `GET /api/patients/[id]`
  - Appointment create (form), update (prompt), delete
  - Prescription create (form), update (prompt), delete

## API Routes

### Patients

- `GET /api/patients`
  - Fetch all patients
- `POST /api/patients`
  - Create a patient
- `GET /api/patients/[id]`
  - Fetch patient details + related appointments + related prescriptions
- `PUT /api/patients/[id]`
  - Update patient fields (`name`, `email`, `password`, `dob`)

### Appointments

- `GET /api/appointments`
  - Fetch all appointments
- `POST /api/appointments`
  - Create appointment
- `PUT /api/appointments/[id]`
  - Update appointment fields (`provider_name`, `appointment_datetime`, `repeat_schedule`, `end_date`)
- `DELETE /api/appointments/[id]`
  - Delete appointment by id

### Prescriptions

- `GET /api/prescriptions`
  - Fetch all prescriptions
- `POST /api/prescriptions`
  - Create prescription
- `PUT /api/prescriptions/[id]`
  - Update prescription fields (`medication_name`, `dosage`, `quantity`, `refill_date`, `refill_schedule`)
- `DELETE /api/prescriptions/[id]`
  - Delete prescription by id

### Auth + Dashboard

- `POST /api/login`
  - Authenticate patient by email/password
- `GET /api/dashboard/[patientId]`
  - Return upcoming appointments/refills in the next 7 days

## Database Schema (Current Usage)

The code expects these tables and fields:

### `patients`

- `id` (primary key)
- `name`
- `email`
- `password`
- `dob`
- `created_at`

### `appointments`

- `id` (primary key)
- `patient_id` (foreign key -> `patients.id`)
- `provider_name`
- `appointment_datetime` (or alternate date columns in dashboard fallback)
- `repeat_schedule`
- `end_date`
- `created_at`

### `prescriptions`

- `id` (primary key)
- `patient_id` (foreign key -> `patients.id`)
- `medication_name`
- `dosage`
- `quantity`
- `refill_date` (or alternate date columns in dashboard fallback)
- `refill_schedule`
- `created_at`

## Project Structure

```text
app/
  api/
    appointments/
      [id]/route.ts
      route.ts
    dashboard/[patientId]/route.ts
    login/route.ts
    patients/
      [id]/route.ts
      route.ts
    prescriptions/
      [id]/route.ts
      route.ts
  admin/
    new-patient/page.tsx
    patients/[id]/page.tsx
    page.tsx
  appointments/page.tsx
  dashboard/page.tsx
  prescriptions/page.tsx
  layout.tsx
  page.tsx
components/
  AppointmentForm.tsx
  PrescriptionForm.tsx
lib/
  supabaseClient.js
```

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Add `.env.local` variables (see above).

3. Start development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)



