import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("patients")
      .select("id, email, first_name, last_name, password")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "Failed to authenticate patient", details: error.message },
        { status: 500 },
      );
    }

    if (!data || data.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const { password: _password, ...patient } = data;

    return NextResponse.json(
      { message: "Login successful", data: patient },
      { status: 200 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Unexpected server error", details: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
