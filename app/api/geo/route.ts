import { NextRequest, NextResponse } from "next/server";

const REGION_KO: Record<string, string> = {
  "Seoul": "서울특별시",
  "Busan": "부산광역시",
  "Daegu": "대구광역시",
  "Incheon": "인천광역시",
  "Gwangju": "광주광역시",
  "Daejeon": "대전광역시",
  "Ulsan": "울산광역시",
  "Sejong": "세종특별자치시",
  "Gyeonggi-do": "경기도",
  "Gangwon-do": "강원특별자치도",
  "Gangwon": "강원특별자치도",
  "North Chungcheong Province": "충청북도",
  "South Chungcheong Province": "충청남도",
  "Chungcheongbuk-do": "충청북도",
  "Chungcheongnam-do": "충청남도",
  "North Jeolla Province": "전라북도",
  "South Jeolla Province": "전라남도",
  "Jeollabuk-do": "전라북도",
  "Jeollanam-do": "전라남도",
  "North Gyeongsang Province": "경상북도",
  "South Gyeongsang Province": "경상남도",
  "Gyeongsangbuk-do": "경상북도",
  "Gyeongsangnam-do": "경상남도",
  "Jeju": "제주특별자치도",
  "Jeju-do": "제주특별자치도",
};

const CITY_KO: Record<string, string> = {
  // 서울 구
  "Gangnam-gu": "강남구", "Seocho-gu": "서초구", "Songpa-gu": "송파구",
  "Mapo-gu": "마포구", "Yongsan-gu": "용산구", "Jongno-gu": "종로구",
  "Jung-gu": "중구", "Dongdaemun-gu": "동대문구", "Seongbuk-gu": "성북구",
  "Nowon-gu": "노원구", "Dobong-gu": "도봉구", "Jungnang-gu": "중랑구",
  "Seodaemun-gu": "서대문구", "Eunpyeong-gu": "은평구", "Gangbuk-gu": "강북구",
  "Gwangjin-gu": "광진구", "Gwanak-gu": "관악구", "Dongjak-gu": "동작구",
  "Yeongdeungpo-gu": "영등포구", "Guro-gu": "구로구", "Geumcheon-gu": "금천구",
  "Yangcheon-gu": "양천구", "Gangseo-gu": "강서구", "Seongdong-gu": "성동구",
  "Gangdong-gu": "강동구",
  // 경기도 주요 시
  "Suwon-si": "수원시", "Seongnam-si": "성남시", "Goyang-si": "고양시",
  "Yongin-si": "용인시", "Bucheon-si": "부천시", "Ansan-si": "안산시",
  "Anyang-si": "안양시", "Hwaseong-si": "화성시", "Namyangju-si": "남양주시",
  "Pyeongtaek-si": "평택시", "Siheung-si": "시흥시", "Uijeongbu-si": "의정부시",
  "Paju-si": "파주시", "Gimpo-si": "김포시", "Hanam-si": "하남시",
  "Gwangmyeong-si": "광명시", "Gunpo-si": "군포시", "Uiwang-si": "의왕시",
  "Yangju-si": "양주시", "Icheon-si": "이천시", "Gwangju-si": "광주시",
  "Pocheon-si": "포천시", "Dongducheon-si": "동두천시", "Yeoju-si": "여주시",
  "Osan-si": "오산시", "Gapyeong-gun": "가평군", "Yangpyeong-gun": "양평군",
  "Yeoncheon-gun": "연천군", "Gapyeong": "가평",
  // 인천
  "Bupyeong-gu": "부평구", "Namdong-gu": "남동구", "Seo-gu": "서구",
  "Michuhol-gu": "미추홀구", "Yeonsu-gu": "연수구", "Dong-gu": "동구",
  "Nam-gu": "남구", "Gyeyang-gu": "계양구", "Ganghwa-gun": "강화군",
  // 기타 광역시
  "Busan": "부산광역시", "Daegu": "대구광역시",
  "Daejeon": "대전광역시", "Gwangju": "광주광역시", "Ulsan": "울산광역시",
};

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("client-ip") ||
    request.headers.get("x-nf-client-connection-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "";

  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,regionName,city`,
      { cache: "no-store" }
    );
    const data = await res.json();

    if (data.status !== "success") {
      return NextResponse.json({ status: "fail" });
    }

    const region = REGION_KO[data.regionName] ?? data.regionName ?? null;
    const city = CITY_KO[data.city] ?? data.city ?? null;

    return NextResponse.json({ status: "success", regionName: region, city });
  } catch {
    return NextResponse.json({ status: "fail" });
  }
}
