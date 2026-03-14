import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Prescription id is required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { medication_name, dosage, quantity, refill_date, refill_schedule } = body ?? {};

    const updates: {
      medication_name?: string;
      dosage?: string;
      quantity?: number;
      refill_date?: string | null;
      refill_schedule?: string | null;
    } = {};

    if (medication_name !== undefined) updates.medication_name = medication_name;
    if (dosage !== undefined) updates.dosage = dosage;
    if (quantity !== undefined) updates.quantity = quantity;
    if (refill_date !== undefined) updates.refill_date = refill_date;
    if (refill_schedule !== undefined) updates.refill_schedule = refill_schedule;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "At least one field is required to update" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("prescriptions")
      .update(updates)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update prescription", details: error.message },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Unexpected server error", details: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Prescription id is required" },
        { status: 400 },
      );
    }

    const { data: existingPrescription, error: findError } = await supabase
      .from("prescriptions")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (findError) {
      return NextResponse.json(
        { error: "Failed to find prescription", details: findError.message },
        { status: 500 },
      );
    }

    if (!existingPrescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    const { error: deleteError } = await supabase.from("prescriptions").delete().eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to delete prescription", details: deleteError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Prescription deleted" }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Unexpected server error", details: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
