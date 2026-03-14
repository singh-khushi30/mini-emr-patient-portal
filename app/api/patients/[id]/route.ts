import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ id: string }>;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Patient id is required" }, { status: 400 });
    }

    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (patientError) {
      return NextResponse.json(
        { error: "Failed to fetch patient", details: patientError.message },
        { status: 500 },
      );
    }

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const [
      { data: appointments, error: appointmentsError },
      { data: prescriptions, error: prescriptionsError },
    ] = await Promise.all([
      supabase.from("appointments").select("*").eq("patient_id", id),
      supabase.from("prescriptions").select("*").eq("patient_id", id),
    ]);

    if (appointmentsError || prescriptionsError) {
      return NextResponse.json(
        {
          error: "Failed to fetch related records",
          details: appointmentsError?.message ?? prescriptionsError?.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        patient,
        appointments: appointments ?? [],
        prescriptions: prescriptions ?? [],
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Unexpected server error", details: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Patient id is required" }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, password, dob } = body ?? {};

    const updates: {
      name?: string;
      email?: string;
      password?: string;
      dob?: string | null;
    } = {};

    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (password !== undefined) updates.password = password;
    if (dob !== undefined) updates.dob = dob;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "At least one field is required to update" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("patients")
      .update(updates)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update patient", details: error.message },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Unexpected server error", details: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
