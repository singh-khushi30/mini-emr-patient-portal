import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Appointment id is required" },
        { status: 400 },
      );
    }

    const { data: existingAppointment, error: findError } = await supabase
      .from("appointments")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (findError) {
      return NextResponse.json(
        { error: "Failed to find appointment", details: findError.message },
        { status: 500 },
      );
    }

    if (!existingAppointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const { error: deleteError } = await supabase.from("appointments").delete().eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to delete appointment", details: deleteError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Appointment deleted" }, { status: 200 });
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
      return NextResponse.json(
        { error: "Appointment id is required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { provider_name, appointment_datetime, repeat_schedule, end_date } = body ?? {};

    const updates: {
      provider_name?: string;
      appointment_datetime?: string;
      repeat_schedule?: string | null;
      end_date?: string | null;
    } = {};

    if (provider_name !== undefined) updates.provider_name = provider_name;
    if (appointment_datetime !== undefined) updates.appointment_datetime = appointment_datetime;
    if (repeat_schedule !== undefined) updates.repeat_schedule = repeat_schedule;
    if (end_date !== undefined) updates.end_date = end_date;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "At least one field is required to update" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("appointments")
      .update(updates)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update appointment", details: error.message },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Unexpected server error", details: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
