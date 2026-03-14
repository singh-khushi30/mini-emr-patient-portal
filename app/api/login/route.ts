import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const { data, error } = await supabase
      .from("patients")
      .select("id, name, email, password")
      .eq("email", email)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 401 }
      );
    }

    if (data.password !== password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "Login successful",
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to authenticate patient" },
      { status: 500 }
    );
  }
}