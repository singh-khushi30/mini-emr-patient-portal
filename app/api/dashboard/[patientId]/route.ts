import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

type RouteContext = {
  params: Promise<{ patientId: string }>;
};

const APPOINTMENT_DATE_COLUMNS = [
  "appointment_date",
  "appointment_datetime",
  "scheduled_at",
  "date",
];
const REFILL_DATE_COLUMNS = ["refill_date", "refill_on", "next_refill_date", "due_date"];

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

function isMissingColumnError(message?: string): boolean {
  return typeof message === "string" && message.includes("does not exist");
}

async function queryUpcomingByDateColumns(
  table: "appointments" | "prescriptions",
  patientId: string,
  startIso: string,
  endIso: string,
  dateColumns: string[],
) {
  let lastErrorMessage = "";

  for (const dateColumn of dateColumns) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("patient_id", patientId)
      .gte(dateColumn, startIso)
      .lte(dateColumn, endIso)
      .order(dateColumn, { ascending: true });

    if (!error) {
      return { data: data ?? [], error: null };
    }

    lastErrorMessage = error.message;
    if (!isMissingColumnError(error.message)) {
      return { data: [], error: error.message };
    }
  }

  return {
    data: [],
    error:
      lastErrorMessage ||
      `No supported date column found for table "${table}". Update API date column mapping.`,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { patientId } = await context.params;

    if (!patientId) {
      return NextResponse.json({ error: "Patient id is required" }, { status: 400 });
    }

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const [appointmentsResult, refillsResult] = await Promise.all([
      queryUpcomingByDateColumns(
        "appointments",
        patientId,
        today.toISOString(),
        nextWeek.toISOString(),
        APPOINTMENT_DATE_COLUMNS,
      ),
      queryUpcomingByDateColumns(
        "prescriptions",
        patientId,
        today.toISOString(),
        nextWeek.toISOString(),
        REFILL_DATE_COLUMNS,
      ),
    ]);

    if (appointmentsResult.error || refillsResult.error) {
      return NextResponse.json(
        {
          error: "Failed to fetch dashboard data",
          details: appointmentsResult.error ?? refillsResult.error,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        upcomingAppointments: appointmentsResult.data,
        upcomingRefills: refillsResult.data,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Unexpected server error", details: getErrorMessage(error) },
      { status: 500 },
    );
  }
}