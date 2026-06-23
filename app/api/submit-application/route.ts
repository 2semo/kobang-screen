import { NextRequest, NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    console.log("[시공 신청 접수]", {
      timestamp: new Date().toISOString(),
      name: data.name,
      phone: data.phone,
      address: data.address,
      quoteType: data.quoteType,
      quoteTotal: data.quoteTotal,
    });

    // Google Apps Script로 전송
    if (GOOGLE_SCRIPT_URL) {
      try {
        const res = await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          redirect: "follow",
        });
        if (res.ok) {
          console.log("[Google Sheets] 전송 성공");
        } else {
          console.error("[Google Sheets] 전송 실패:", res.status);
        }
      } catch (sheetError) {
        // 구글 시트 전송 실패해도 고객 신청은 성공으로 처리
        console.error("[Google Sheets] 연결 오류:", sheetError);
      }
    } else {
      console.warn("[Google Sheets] GOOGLE_SCRIPT_URL 환경변수가 설정되지 않았습니다.");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[시공 신청 오류]", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
