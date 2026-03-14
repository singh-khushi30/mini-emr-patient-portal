import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function GET() {
  try {
    const { data, error } = await supabase.from("prescriptions").select("*");

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch prescriptions", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Unexpected server error", details: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("prescriptions")
      .insert(body)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create prescription", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Unexpected server error", details: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
