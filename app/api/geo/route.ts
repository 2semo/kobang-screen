import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Netlify 실제 IP → x-forwarded-for 첫 번째 → x-real-ip 순서로 시도
  const ip =
    request.headers.get("x-nf-client-connection-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "";

  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,regionName,city&lang=ko`,
      { cache: "no-store" }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: "fail" });
  }
}
