import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("client-ip") ||
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
    // 디버그: 감지된 IP와 결과 함께 반환 (확인 후 제거 예정)
    return NextResponse.json({ ...data, _ip: ip });
  } catch (e) {
    return NextResponse.json({ status: "fail", _ip: ip, _error: String(e) });
  }
}
