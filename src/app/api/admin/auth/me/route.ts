import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin(req);

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({ admin }, { status: 200 });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { message: "Failed to verify session" },
      { status: 500 }
    );
  }
}
