import { NextResponse } from "next/server";
import { revokeCurrentSession } from "@/lib/auth";

export async function GET(request) {
  await revokeCurrentSession();
  return NextResponse.redirect(new URL("/login", request.url));
}