"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Home,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Copy,
  Camera,
  Info,
  ArrowRight,
} from "lucide-react";
import {
  brands,
  meshTypes,
  installTypes,
  spaces,
  NUMBER_KEY_PRICE,
  getPrice,
  roundUpTo100,
  getGlassRailingPrice,
  glassRailingPurchaseOptions,
  glassRailingTypeOptions,
  glassRailingWindowCountOptions,
  glassRailingWindowSizeOptions,
  getSteelRoomAddPrice,
  steelRoomAddOptions,
  getWindowRoomAddPrice,
  windowRoomAddOptions,
  getHuperOptikPrice,
  huperOptikPurchaseOptions,
  huperOptikSizeOptions,
  huperOptikFilmOptions,
  huperOptikRoomPrices,
  HUPER_OPTIK_MIN_GENERAL_PRICE,
  blackScreenServiceOptions,
  getBlackScreenPrice,
  getRollScreenPrice,
  BLACK_SCREEN_MIN_PRICE,
  BLACK_SCREEN_FEATURES,
  type BrandType,
  type MeshType,
  type InstallType,
  type SpaceType,
  type GlassRailingPurchaseType,
  type GlassRailingType,
  type GlassRailingWindowCount,
  type GlassRailingWindowSize,
  type SteelRoomAddSize,
  type WindowRoomAddSize,
  type HuperOptikPurchaseType,
  type HuperOptikFilmType,
  type HuperOptikSizeType,
  type HuperOptikRoomId,
  type BlackScreenServiceType,
} from "@/lib/pricing-data";

interface SpaceItemDetail {
  id: string;
  width: number;
  height: number;
}

interface SpaceItem {
  id: string;
  spaceType: SpaceType;
  count: number;
  details: SpaceItemDetail[];
  showSizeInput?: boolean;
}

// 견적 유형: 안전방충망, 유리난간, 후퍼옵틱, 블랙스텐 방충망
type QuoteType = 'safetyScreen' | 'glassRailing' | 'huperOptik' | 'blackScreenMesh';

// 저장된 완료 견적
interface CompletedQuote {
  id: string;
  label: string;      // 합산요약 라벨 (e.g. "후퍼옵틱 (공동구매견적)")
  productName: string; // 상품명 (e.g. "후퍼옵틱 열차단필름")
  total: number;      // 해당 상품 금액
  sectionText: string; // 복사용 상품 상세 텍스트
  type: QuoteType;    // 상품 유형
  displayDetails: Array<{ label: string; value: string; indent?: boolean }>; // 선택내역 표시용
}

// 상품별 안내사항
const PRODUCT_NOTICES: Record<QuoteType, string[]> = {
  safetyScreen: [
    '최종 금액은 방문 실측 후 확정될 수 있습니다.',
    '특수 창호/사이즈는 별도 실측후 견적 가능(기본가격은 슬라이딩 도어)',
    '설치수량 2개 이하 / 지역에 따라서 추가 출장비 발생할수도 있습니다.',
    '모든 계산은 100mm(10cm) 단위 올림이 적용됩니다.',
  ],
  glassRailing: [
    '최종 금액은 방문 실측 후 확정될 수 있습니다.',
    '공동구매는 같은 아파트 단지 내 3세대 이상 함께 시공시 적용됩니다.',
    '입면분할창은 현장에 따라 금액 변동이 있을 수 있으며, 방추가 할인은 적용되지 않습니다.',
  ],
  huperOptik: [
    '최종 금액은 방문 실측 후 확정될 수 있습니다.',
    '공동구매는 같은 아파트 단지 내 3세대 이상 함께 시공시 적용됩니다.',
    '단, 주상복합이나 이면창이 있는경우 추가요금이 발생할 수 있습니다.',
    '전용 84초과 타입은 실측을 통한 견적이 가능합니다.',
  ],
  blackScreenMesh: [
    '최종 금액은 방문 실측 후 확정될 수 있습니다.',
    '서울·경기 지역만 시공 가능합니다.',
    '최소 시공가 20만원 이상만 가능합니다.',
    '특대창·특수창·실외기·방범창제거·설치난이도에 따라 별도 건적이 발생할 수 있습니다.',
    '이건창호는 제외됩니다.',
  ],
};

interface QuoteState {
  step: number;
  quoteType: QuoteType | null;
  completedQuotes: CompletedQuote[];
  // 안전방충망 관련
  brand: BrandType | null;
  installType: InstallType | null;
  meshType: MeshType | null;
  spaceItems: SpaceItem[];
  numberKeyCount: number;
  // 유리난간 관련
  glassRailingPurchaseType: GlassRailingPurchaseType | null;
  glassRailingType: GlassRailingType | null;
  glassRailingWindowCount: GlassRailingWindowCount | null;
  glassRailingWindowSize: GlassRailingWindowSize | null; // 입면분할 대창 사이즈
  glassRailingSteelRoomAddSize: SteelRoomAddSize | null; // 철제난간 방추가
  glassRailingWindowRoomAddSize: WindowRoomAddSize | null; // 입면분할 방추가
  // 후퍼옵틱 관련
  huperOptikPurchaseType: HuperOptikPurchaseType | null;
  huperOptikFilmType: HuperOptikFilmType | null;
  huperOptikSizeType: HuperOptikSizeType | null;
  huperOptikSelectedRooms: HuperOptikRoomId[];
  // 블랙스텐 방충망 관련
  blackScreenServiceType: BlackScreenServiceType | null;
  blackScreenLargeCount: number;
  blackScreenMediumCount: number;
  blackScreenRollCount: number;
}

const initialState: QuoteState = {
  step: 1,
  quoteType: null,
  completedQuotes: [],
  // 안전방충망 관련
  brand: null,
  installType: null,
  meshType: null,
  spaceItems: [],
  numberKeyCount: 0,
  // 유리난간 관련
  glassRailingPurchaseType: null,
  glassRailingType: null,
  glassRailingWindowCount: null,
  glassRailingWindowSize: null,
  glassRailingSteelRoomAddSize: null,
  glassRailingWindowRoomAddSize: null,
  // 후퍼옵틱 관련
  huperOptikPurchaseType: null,
  huperOptikFilmType: null,
  huperOptikSizeType: null,
  huperOptikSelectedRooms: [],
  // 블랙스텐 방충망 관련
  blackScreenServiceType: null,
  blackScreenLargeCount: 0,
  blackScreenMediumCount: 0,
  blackScreenRollCount: 0,
};

// 브랜드별, 설치유형별 사용 가능한 망타입
const availableMeshTypes: Record<BrandType, Record<InstallType, MeshType[]>> = {
  goguryeo: {
    highFloor: ['0.4mm-16mesh'],
    lowFloor: ['0.6mm'],
  },
  js: {
    highFloor: ['0.4mm-16mesh', '0.4mm-20mesh'],
    lowFloor: ['0.6mm', '0.7mm-14mesh'],
  },
};


export default function QuoteCalculator() {
  const [state, setState] = useState<QuoteState>(initialState);
  const [copied, setCopied] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountInputValue, setDiscountInputValue] = useState<string>('');
  const resultAreaRef = useRef<HTMLDivElement>(null);

  // 에누리: percent% 할인 후 만원 단위 반올림
  const applyDiscount = (total: number, percent: number): number => {
    return Math.round(total * (1 - percent / 100) / 10000) * 10000;
  };

  const resetDiscount = () => {
    setDiscountPercent(0);
    setShowDiscountInput(false);
    setDiscountInputValue('');
  };

  const updateState = useCallback((updates: Partial<QuoteState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const goToStep = useCallback((step: number) => {
    updateState({ step });
  }, [updateState]);

  const nextStep = useCallback(() => {
    updateState({ step: state.step + 1 });
  }, [state.step, updateState]);

  const prevStep = useCallback(() => {
    updateState({ step: state.step - 1 });
  }, [state.step, updateState]);

  // 현재 상품을 저장하고 추가 상품 선택으로 이동
  const addToCompletedQuotes = useCallback((quote: CompletedQuote) => {
    setState(prev => ({
      ...initialState,
      completedQuotes: [...prev.completedQuotes, quote],
    }));
  }, []);

  // 전체 초기화 (처음으로)
  const resetAll = useCallback(() => {
    setState(initialState);
  }, []);

  // 브랜드 선택
  const selectBrand = useCallback((brand: BrandType) => {
    updateState({ brand, installType: null, meshType: null });
  }, [updateState]);

  // 설치 유형 선택
  const selectInstallType = useCallback((installType: InstallType) => {
    if (!state.brand) return;
    const availableMeshes = availableMeshTypes[state.brand][installType];
    // 고구려시스템은 망타입이 1개이므로 자동 선택
    const autoMeshType = availableMeshes.length === 1 ? availableMeshes[0] : null;
    updateState({ installType, meshType: autoMeshType });
  }, [state.brand, updateState]);

  // 망타입 선택
  const selectMeshType = useCallback((meshType: MeshType) => {
    updateState({ meshType });
  }, [updateState]);

  // 공간 아이템 추가/수정
  const updateSpaceItem = useCallback((spaceType: SpaceType, count: number) => {
    setState((prev) => {
      const existingIndex = prev.spaceItems.findIndex(
        (item) => item.spaceType === spaceType
      );
      const spaceInfo = spaces.find((s) => s.id === spaceType)!;

      if (count <= 0) {
        return {
          ...prev,
          spaceItems: prev.spaceItems.filter(
            (item) => item.spaceType !== spaceType
          ),
        };
      }

      if (existingIndex >= 0) {
        const existingItem = prev.spaceItems[existingIndex];
        const currentCount = existingItem.count;
        
        let newDetails = [...existingItem.details];
        
        if (count > currentCount) {
          // 개수 증가 - 새 항목 추가
          for (let i = currentCount; i < count; i++) {
            newDetails.push({
              id: `${spaceType}-${Date.now()}-${i}`,
              width: spaceInfo.defaultWidth,
              height: spaceInfo.defaultHeight,
            });
          }
        } else if (count < currentCount) {
          // 개수 감소 - 뒤에서부터 제거
          newDetails = newDetails.slice(0, count);
        }

        const newItems = [...prev.spaceItems];
        newItems[existingIndex] = {
          ...existingItem,
          count,
          details: newDetails,
        };
        return { ...prev, spaceItems: newItems };
      }

      // 새 항목 추가
      const details: SpaceItemDetail[] = [];
      for (let i = 0; i < count; i++) {
        details.push({
          id: `${spaceType}-${Date.now()}-${i}`,
          width: spaceInfo.defaultWidth,
          height: spaceInfo.defaultHeight,
        });
      }

      return {
        ...prev,
        spaceItems: [
          ...prev.spaceItems,
          {
            id: `${spaceType}-${Date.now()}`,
            spaceType,
            count,
            details,
          },
        ],
      };
    });
  }, []);

  // 개별 사이즈 변경
  const updateSpaceDetailSize = useCallback(
    (spaceType: SpaceType, detailIndex: number, width: number | null, height: number | null) => {
      setState((prev) => ({
        ...prev,
        spaceItems: prev.spaceItems.map((item) => {
          if (item.spaceType !== spaceType) return item;
          
          const newDetails = [...item.details];
          if (newDetails[detailIndex]) {
            newDetails[detailIndex] = {
              ...newDetails[detailIndex],
              width: width ?? newDetails[detailIndex].width,
              height: height ?? newDetails[detailIndex].height,
            };
          }
          return { ...item, details: newDetails };
        }),
      }));
    },
    []
  );

  // 번호키 개수 변경
  const updateNumberKeyCount = useCallback((count: number) => {
    updateState({ numberKeyCount: Math.max(0, count) });
  }, [updateState]);

  // 가격 계산
  const calculateTotal = useCallback(() => {
    if (!state.brand || !state.meshType) return { items: [], total: 0, productTotal: 0, numberKeyTotal: 0 };

    const items: Array<{
      spaceType: SpaceType;
      spaceName: string;
      detailIndex: number;
      width: number;
      height: number;
      unitPrice: number;
    }> = [];

    state.spaceItems.forEach((item) => {
      const spaceInfo = spaces.find((s) => s.id === item.spaceType)!;
      item.details.forEach((detail, index) => {
        const price = getPrice(
          state.brand!,
          state.meshType!,
          detail.width,
          detail.height
        );
        items.push({
          spaceType: item.spaceType,
          spaceName: spaceInfo.name,
          detailIndex: index + 1,
          width: detail.width,
          height: detail.height,
          unitPrice: price || 0,
        });
      });
    });

    const productTotal = items.reduce((sum, item) => sum + item.unitPrice, 0);
    const numberKeyTotal = state.numberKeyCount * NUMBER_KEY_PRICE;
    const total = productTotal + numberKeyTotal;

    return { items, productTotal, numberKeyTotal, total };
  }, [state.brand, state.meshType, state.spaceItems, state.numberKeyCount]);

  // 견적 복사
  const copyQuote = useCallback(() => {
    const { items, total } = calculateTotal();
    const brandInfo = brands.find((b) => b.id === state.brand);
    const installInfo = installTypes.find((i) => i.id === state.installType);
    const completedTotal = state.completedQuotes.reduce((s, q) => s + q.total, 0);
    const grandTotal = completedTotal + total;

    let text = state.completedQuotes.length > 0 ? `[합산 견적서]\n\n` : `[안전방충망 견적서]\n\n`;
    text += `[안전방충망]\n`;
    text += `브랜드: ${brandInfo?.name}\n`;
    text += `설치유형: ${installInfo?.name} (${state.meshType})\n\n`;
    text += `[상세 내역]\n`;
    items.forEach((item) => {
      text += `- ${item.spaceName} ${item.detailIndex} (${item.width}×${item.height}mm): ${item.unitPrice.toLocaleString()}원\n`;
    });
    if (state.numberKeyCount > 0) {
      text += `- 번호키: ${NUMBER_KEY_PRICE.toLocaleString()}원 × ${state.numberKeyCount}개 = ${(NUMBER_KEY_PRICE * state.numberKeyCount).toLocaleString()}원\n`;
    }
    if (state.completedQuotes.length > 0) {
      text += `\n소계: ${total.toLocaleString()}원\n`;
      text += `\n`;
      state.completedQuotes.forEach(q => { text += q.sectionText + '\n\n'; });
      text += `\n[합산 견적 내역]\n`;
      const brandLabel = brandInfo?.name ?? '';
      text += `안전방충망 (${brandLabel}): ${total.toLocaleString()}원\n`;
      state.completedQuotes.forEach(q => { text += `${q.label}: ${q.total.toLocaleString()}원\n`; });
      text += `*합산 총액: ${grandTotal.toLocaleString()}원\n`;
    } else {
      text += `\n*총 시공 견적: ${total.toLocaleString()}원\n`;
    }
    const baseTotal = state.completedQuotes.length > 0 ? grandTotal : total;
    if (discountPercent > 0) {
      const discountedTotal = applyDiscount(baseTotal, discountPercent);
      text += `\n[에누리 ${discountPercent}% 적용]\n`;
      text += `에누리 적용가: ${discountedTotal.toLocaleString()}원\n`;
    }
    text += `\n[안내사항]\n`;
    text += `• 최종 금액은 방문 실측 후 확정될 수 있습니다.\n`;
    text += `• 특수 창호/사이즈는 별도 실측후 견적 가능(기본가격은 슬라이딩 도어)\n`;
    text += `• 설치수량 2개 이하 / 지역에 따라서 추가 출장비 발생할수도 있습니다.\n`;
    text += `• 모든 계산은 100mm(10cm) 단위 올림이 적용됩니다.\n`;
    text += `\n문의: 코끼리시스템 1555-0143`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [calculateTotal, state.brand, state.installType, state.meshType, state.numberKeyCount, state.completedQuotes, discountPercent, applyDiscount]);

  // 견적 캡처
  const captureQuote = useCallback(async () => {
    if (!resultAreaRef.current) return;
    setCapturing(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(resultAreaRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const link = document.createElement("a");
      link.download = "코끼리시스템_견적서.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      console.log("[captureQuote] 견적 이미지 저장 완료");
    } catch (e) {
      console.error("[captureQuote] 캡처 실패:", e);
      alert("캡처에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setCapturing(false);
    }
  }, []);

  // 공간별 개수 가져오기
  const getSpaceCount = (spaceType: SpaceType) => {
    const item = state.spaceItems.find((i) => i.spaceType === spaceType);
    return item?.count || 0;
  };

  // 공간별 상세 정보 가져오기
  const getSpaceDetails = (spaceType: SpaceType) => {
    const item = state.spaceItems.find((i) => i.spaceType === spaceType);
    return item?.details || [];
  };

  // 실측사이즈 입력 토글
  const toggleSizeInput = useCallback((spaceType: SpaceType) => {
    setState((prev) => ({
      ...prev,
      spaceItems: prev.spaceItems.map((item) => {
        if (item.spaceType !== spaceType) return item;
        return { ...item, showSizeInput: !item.showSizeInput };
      }),
    }));
  }, []);

  // 공간별 실측사이즈 입력 표시 여부
  const getShowSizeInput = (spaceType: SpaceType) => {
    const item = state.spaceItems.find((i) => i.spaceType === spaceType);
    return item?.showSizeInput || false;
  };

  // 다음 버튼 활성화 여부
  const canProceed = () => {
    switch (state.step) {
      case 1:
        return true;
      case 2:
        return state.brand !== null;
      case 3:
        return state.installType !== null && state.meshType !== null;
      case 4:
        return state.spaceItems.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  // 현재 브랜드와 설치유형에 따른 사용 가능한 망타입
  const getAvailableMeshTypes = () => {
    if (!state.brand || !state.installType) return [];
    return availableMeshTypes[state.brand][state.installType];
  };

  // 망타입 정보 가져오기
  const getMeshTypeInfo = (meshType: MeshType) => {
    if (!state.brand) return null;
    return meshTypes[state.brand].find((m) => m.id === meshType);
  };

  // 렌더링
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-0">
            <img
              src="/elephant-logo2.png"
              alt="코끼리시스템 로고"
              className="h-16 w-auto"
            />
            <span className="font-bold text-lg leading-tight -ml-1">코끼리시스템</span>
          </div>
          <a
            href="tel:1555-0143"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg text-base font-bold hover:bg-primary/90 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            1555-0143
          </a>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* 진행 상태 - 안전방충망 */}
        {state.step > 1 && state.step < 6 && state.quoteType === 'safetyScreen' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                단계 {state.step}/6
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round(((state.step - 1) / 5) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((state.step - 1) / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* 진행 상태 - 유리난간 */}
        {state.step === 2 && state.quoteType === 'glassRailing' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                단계 1/2
              </span>
              <span className="text-sm font-medium text-primary">
                50%
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: '50%' }}
              />
            </div>
          </div>
        )}

        {/* 진행 상태 - 후퍼옵틱 */}
        {state.step === 2 && state.quoteType === 'huperOptik' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                단계 1/2
              </span>
              <span className="text-sm font-medium text-primary">
                50%
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: '50%' }}
              />
            </div>
          </div>
        )}

        {/* 진행 상태 - 블랙스텐 방충망 */}
        {state.step === 2 && state.quoteType === 'blackScreenMesh' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">단계 1/2</span>
              <span className="text-sm font-medium text-primary">50%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: '50%' }} />
            </div>
          </div>
        )}

        {/* Step 1: 인트로 - 견적 유형 선택 */}
        {state.step === 1 && (
          <div className="space-y-6 py-4">
            {/* 메인 이미지 */}
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img
                src="https://assets.macaly-user-data.dev/cdn-cgi/image/format=webp,width=2000,height=2000,fit=scale-down,quality=90,anim=true/r4r4vwy5v410dggz3f492h5c/rmynog90h4yzrxhq943q6ddz/hkoW5ZD8N9a2Pqwhbhhzp.png"
                alt="후퍼옵틱 열차단필름 공동구매 - 코끼리시스템"
                className="w-full h-auto"
              />
            </div>

            <div className="text-center space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                창문 안전, 견적부터 간단히 계산해보세요.
                <br />
                대표 사이즈로 <strong className="text-foreground">3분 안에</strong> 빠르게 계산하고,
                <br />
                실측값을 입력하면 더 정확한 예상 견적을 볼 수 있어요.
              </p>
            </div>

            {/* 이미 추가된 상품 목록 */}
            {state.completedQuotes.length > 0 && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-bold text-sm text-primary">추가된 상품 ({state.completedQuotes.length}개)</h3>
                  {state.completedQuotes.map((q) => (
                    <div key={q.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{q.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-bold">{q.total.toLocaleString()}원</span>
                        <button
                          onClick={() => setState(prev => ({
                            ...prev,
                            completedQuotes: prev.completedQuotes.filter(c => c.id !== q.id),
                          }))}
                          className="w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between text-sm font-bold">
                    <span>합산 소계</span>
                    <span>{state.completedQuotes.reduce((s, q) => s + q.total, 0).toLocaleString()}원</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {state.completedQuotes.length > 0 && (
                <p className="text-sm text-center text-muted-foreground font-medium">추가할 상품을 선택하세요</p>
              )}
              <Button
                onClick={() => {
                  updateState({ quoteType: 'safetyScreen' });
                  nextStep();
                }}
                className="w-full h-14 text-lg font-semibold"
                size="lg"
              >
                안전방충망 견적받기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={() => {
                  updateState({ quoteType: 'glassRailing' });
                  nextStep();
                }}
                variant="outline"
                className="w-full h-14 text-lg font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                size="lg"
              >
                아파트유리난간 견적받기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={() => {
                  updateState({ quoteType: 'huperOptik' });
                  nextStep();
                }}
                variant="outline"
                className="w-full h-14 text-lg font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                size="lg"
              >
                후퍼옵틱 필름 견적받기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={() => {
                  updateState({ quoteType: 'blackScreenMesh' });
                  nextStep();
                }}
                variant="outline"
                className="w-full h-14 text-lg font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                size="lg"
              >
                블랙스텐 방충망 교체 견적받기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: 안전방충망 - 브랜드 선택 */}
        {state.step === 2 && state.quoteType === 'safetyScreen' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">브랜드 선택</h2>
              <p className="text-muted-foreground">
                원하시는 브랜드를 선택해주세요
              </p>
            </div>

            <div className="space-y-4">
              {brands.map((brand) => (
                <Card
                  key={brand.id}
                  className={`cursor-pointer transition-all ${
                    state.brand === brand.id
                      ? "ring-2 ring-primary border-primary"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => selectBrand(brand.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{brand.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {brand.description}
                        </p>
                      </div>
                      {state.brand === brand.id && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {brand.features.slice(0, 4).map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-primary font-medium">
                      {brand.highlight}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={prevStep} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" />
                이전
              </Button>
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex-1"
              >
                다음
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: 유리난간 - 옵션 선택 */}
        {state.step === 2 && state.quoteType === 'glassRailing' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">유리난간 옵션 선택</h2>
              <p className="text-muted-foreground">
                구매방식, 타입, 거실창수를 선택해주세요
              </p>
            </div>

            {/* 구매방식 선택 */}
            <div className="space-y-3">
              <h3 className="font-bold">구매방식</h3>
              <div className="space-y-3">
                {glassRailingPurchaseOptions.map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      state.glassRailingPurchaseType === option.id
                        ? "ring-2 ring-primary border-primary"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => updateState({ glassRailingPurchaseType: option.id })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">{option.name}</h4>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {option.subtitle}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {option.description}
                          </p>
                        </div>
                        {state.glassRailingPurchaseType === option.id && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 타입 선택 */}
            <div className="space-y-3">
              <h3 className="font-bold">타입 선택</h3>
              <div className="space-y-3">
                {glassRailingTypeOptions.map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      state.glassRailingType === option.id
                        ? "ring-2 ring-primary border-primary"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => updateState({ glassRailingType: option.id })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm">{option.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {option.description}
                          </p>
                        </div>
                        {state.glassRailingType === option.id && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 거실창수 선택 */}
            <div className="space-y-3">
              <h3 className="font-bold">거실창수 선택</h3>
              <div className="grid grid-cols-2 gap-3">
                {glassRailingWindowCountOptions.map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      state.glassRailingWindowCount === option.id
                        ? "ring-2 ring-primary border-primary"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => updateState({ glassRailingWindowCount: option.id })}
                  >
                    <CardContent className="p-4 text-center">
                      <h4 className="font-bold text-lg">{option.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                      {state.glassRailingWindowCount === option.id && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mx-auto mt-2">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 대창 사이즈 선택 (입면분할 전용) */}
            {state.glassRailingType === 'windowRemoval' && (
              <div className="space-y-3">
                <h3 className="font-bold">대창 사이즈 선택</h3>
                <div className="grid grid-cols-2 gap-3">
                  {glassRailingWindowSizeOptions.map((option) => (
                    <Card
                      key={option.id}
                      className={`cursor-pointer transition-all ${
                        state.glassRailingWindowSize === option.id
                          ? "ring-2 ring-primary border-primary"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => updateState({ glassRailingWindowSize: option.id })}
                    >
                      <CardContent className="p-4 text-center">
                        <h4 className="font-bold text-sm">{option.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {option.description}
                        </p>
                        {state.glassRailingWindowSize === option.id && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mx-auto mt-2">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 방추가 선택 (선택사항) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">방추가 시공 <span className="text-sm font-normal text-muted-foreground">(선택사항)</span></h3>
              </div>
              <div className="space-y-2">
                {(state.glassRailingType === 'steelRemoval' ? steelRoomAddOptions : windowRoomAddOptions).map((option) => {
                  const currentSize = state.glassRailingType === 'steelRemoval'
                    ? state.glassRailingSteelRoomAddSize
                    : state.glassRailingWindowRoomAddSize;
                  const isSelected = currentSize === option.id;
                  return (
                    <Card
                      key={option.id}
                      className={`cursor-pointer transition-all ${
                        isSelected ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          // 다시 누르면 선택 해제
                          updateState(
                            state.glassRailingType === 'steelRemoval'
                              ? { glassRailingSteelRoomAddSize: null }
                              : { glassRailingWindowRoomAddSize: null }
                          );
                        } else {
                          updateState(
                            state.glassRailingType === 'steelRemoval'
                              ? { glassRailingSteelRoomAddSize: option.id as SteelRoomAddSize }
                              : { glassRailingWindowRoomAddSize: option.id as WindowRoomAddSize }
                          );
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-sm">{option.name}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={prevStep} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" />
                이전
              </Button>
              <Button
                onClick={() => goToStep(3)}
                disabled={
                  !state.glassRailingPurchaseType ||
                  !state.glassRailingType ||
                  !state.glassRailingWindowCount ||
                  (state.glassRailingType === 'windowRemoval' && !state.glassRailingWindowSize)
                }
                className="flex-1"
              >
                견적 확인
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: 후퍼옵틱 - 옵션 선택 */}
        {state.step === 2 && state.quoteType === 'huperOptik' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">후퍼옵틱 열차단필름 옵션 선택</h2>
              <p className="text-muted-foreground">
                구매방식, 평형, 필름 타입을 선택해주세요
              </p>
            </div>

            {/* 구매방식 선택 */}
            <div className="space-y-3">
              <h3 className="font-bold">구매방식</h3>
              <div className="space-y-3">
                {huperOptikPurchaseOptions.map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      state.huperOptikPurchaseType === option.id
                        ? "ring-2 ring-primary border-primary"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => updateState({ huperOptikPurchaseType: option.id })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">{option.name}</h4>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {option.subtitle}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {option.description}
                          </p>
                        </div>
                        {state.huperOptikPurchaseType === option.id && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 평형 선택 */}
            <div className="space-y-3">
              <h3 className="font-bold">평형 선택</h3>
              <div className="grid grid-cols-3 gap-3">
                {huperOptikSizeOptions.map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      state.huperOptikSizeType === option.id
                        ? "ring-2 ring-primary border-primary"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => updateState({ huperOptikSizeType: option.id })}
                  >
                    <CardContent className="p-3 text-center">
                      <h4 className="font-bold text-sm">{option.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </p>
                      {state.huperOptikSizeType === option.id && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center mx-auto mt-2">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                단, 주상복합이나 이면창이 있는경우 추가요금이 발생할 수 있습니다.<br />
                전용 84초과 타입은 실측을 통한 견적이 가능합니다.
              </p>
            </div>

            {/* 필름 타입 선택 */}
            <div className="space-y-3">
              <h3 className="font-bold">후퍼옵틱 열차단필름 선택</h3>
              <div className="space-y-3">
                {huperOptikFilmOptions.map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      state.huperOptikFilmType === option.id
                        ? "ring-2 ring-primary border-primary"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => updateState({ huperOptikFilmType: option.id })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm">{option.name}</h4>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {option.subtitle}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            &lt;{option.description}&gt;
                          </p>
                        </div>
                        {state.huperOptikFilmType === option.id && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 일반견적 - 시공 위치 선택 */}
            {state.huperOptikPurchaseType === 'general' && state.huperOptikSizeType && state.huperOptikFilmType && (() => {
              const toggleRoom = (roomId: HuperOptikRoomId) => {
                const current = state.huperOptikSelectedRooms;
                const next = current.includes(roomId)
                  ? current.filter((r) => r !== roomId)
                  : [...current, roomId];
                updateState({ huperOptikSelectedRooms: next });
              };
              const roomTotal = huperOptikRoomPrices
                .filter((r) => state.huperOptikSelectedRooms.includes(r.id))
                .reduce((sum, r) => sum + r.prices[state.huperOptikSizeType!][state.huperOptikFilmType!], 0);
              const belowMin = roomTotal < HUPER_OPTIK_MIN_GENERAL_PRICE;
              return (
                <div className="space-y-3">
                  <h3 className="font-bold">시공 위치 선택</h3>
                  <p className="text-xs text-muted-foreground">시공할 공간을 선택해주세요. (최소 계약금액 100만원)</p>
                  <div className="space-y-2">
                    {huperOptikRoomPrices.map((room) => {
                      const price = room.prices[state.huperOptikSizeType!][state.huperOptikFilmType!];
                      const selected = state.huperOptikSelectedRooms.includes(room.id);
                      return (
                        <Card
                          key={room.id}
                          className={`cursor-pointer transition-all ${
                            selected ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                          }`}
                          onClick={() => toggleRoom(room.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                                  {selected && <Check className="w-3 h-3 text-primary-foreground" />}
                                </div>
                                <span className="font-medium text-sm">{room.name}</span>
                              </div>
                              <span className="text-sm font-bold">{price.toLocaleString()}원</span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  {state.huperOptikSelectedRooms.length > 0 && (
                    <div className={`p-3 rounded-lg text-sm font-bold flex justify-between ${belowMin ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                      <span>선택 합계</span>
                      <span>{roomTotal.toLocaleString()}원{belowMin ? ' (최소 100만원 미달)' : ''}</span>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={prevStep} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" />
                이전
              </Button>
              <Button
                onClick={() => goToStep(3)}
                disabled={
                  !state.huperOptikPurchaseType || !state.huperOptikSizeType || !state.huperOptikFilmType ||
                  (state.huperOptikPurchaseType === 'general' && (
                    state.huperOptikSelectedRooms.length === 0 ||
                    huperOptikRoomPrices
                      .filter((r) => state.huperOptikSelectedRooms.includes(r.id))
                      .reduce((sum, r) => sum + r.prices[state.huperOptikSizeType!][state.huperOptikFilmType!], 0) < HUPER_OPTIK_MIN_GENERAL_PRICE
                  ))
                }
                className="flex-1"
              >
                견적 확인
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: 블랙스텐 방충망 - 서비스 선택 + 수량 입력 */}
        {state.step === 2 && state.quoteType === 'blackScreenMesh' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">블랙스텐 미세촘촘 방충망 견적</h2>
              <p className="text-muted-foreground">서비스 종류를 선택하고 수량을 입력해주세요</p>
            </div>

            {/* 서비스 타입 선택 */}
            <div className="space-y-3">
              <h3 className="font-bold">서비스 종류</h3>
              <div className="space-y-3">
                {blackScreenServiceOptions.map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      state.blackScreenServiceType === option.id
                        ? 'ring-2 ring-primary border-primary'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() =>
                      updateState({
                        blackScreenServiceType: option.id,
                        blackScreenLargeCount: 0,
                        blackScreenMediumCount: 0,
                        blackScreenRollCount: 0,
                      })
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-2">
                          <h4 className="font-bold">{option.name}</h4>
                          <Badge variant="outline" className="mt-1 text-xs">{option.subtitle}</Badge>
                          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{option.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">AS: {option.as}</p>
                        </div>
                        {state.blackScreenServiceType === option.id && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 수량 입력 - 블랙스텐망 교체 / 틀제작+망 교체 */}
            {(state.blackScreenServiceType === 'meshOnly' || state.blackScreenServiceType === 'frameAndMesh') && (() => {
              const svc = state.blackScreenServiceType;
              const priceInfo = getBlackScreenPrice(svc, state.blackScreenLargeCount, state.blackScreenMediumCount);
              const totalCount = state.blackScreenLargeCount + state.blackScreenMediumCount;
              const tierLabel = totalCount >= 6 ? '6장 이상 단가' : (svc === 'meshOnly' ? '3-5장 단가' : '1-5장 단가');
              const belowMin = priceInfo.total > 0 && priceInfo.total < BLACK_SCREEN_MIN_PRICE;

              return (
                <div className="space-y-4 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">수량 선택</h3>
                    {totalCount > 0 && (
                      <Badge variant="secondary" className="text-xs">{tierLabel} 적용</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2">대형(높이 1600mm 이상)과 중형(높이 1600mm 미만)을 혼합 선택 가능</p>

                  {/* 대형 카운터 */}
                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                    <div>
                      <p className="font-bold text-sm">대형 <span className="font-normal text-muted-foreground">(높이 1600mm 이상)</span></p>
                      {totalCount > 0 && (
                        <p className="text-xs text-primary mt-0.5">{priceInfo.largeUnitPrice.toLocaleString()}원/장</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateState({ blackScreenLargeCount: Math.max(0, state.blackScreenLargeCount - 1) })}
                        className="w-9 h-9 rounded-full border-2 border-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-40"
                        disabled={state.blackScreenLargeCount === 0}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-lg">{state.blackScreenLargeCount}</span>
                      <button
                        onClick={() => updateState({ blackScreenLargeCount: state.blackScreenLargeCount + 1 })}
                        className="w-9 h-9 rounded-full border-2 border-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 중형 카운터 */}
                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                    <div>
                      <p className="font-bold text-sm">중형 <span className="font-normal text-muted-foreground">(높이 1600mm 미만)</span></p>
                      {totalCount > 0 && (
                        <p className="text-xs text-primary mt-0.5">{priceInfo.mediumUnitPrice.toLocaleString()}원/장</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateState({ blackScreenMediumCount: Math.max(0, state.blackScreenMediumCount - 1) })}
                        className="w-9 h-9 rounded-full border-2 border-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-40"
                        disabled={state.blackScreenMediumCount === 0}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-lg">{state.blackScreenMediumCount}</span>
                      <button
                        onClick={() => updateState({ blackScreenMediumCount: state.blackScreenMediumCount + 1 })}
                        className="w-9 h-9 rounded-full border-2 border-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 합계 미리보기 */}
                  {totalCount > 0 && (
                    <div className={`p-3 rounded-lg text-sm font-bold flex justify-between ${belowMin ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                      <span>예상 소계 (총 {totalCount}장)</span>
                      <span>{priceInfo.total.toLocaleString()}원{belowMin ? ' ← 최소 20만원 미달' : ''}</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 수량 입력 - 롤방충망 */}
            {state.blackScreenServiceType === 'rollScreen' && (() => {
              const rollInfo = getRollScreenPrice(state.blackScreenRollCount);
              const tierLabel = state.blackScreenRollCount >= 6 ? '6장 이상 단가' : '1-5장 단가';
              const belowMin = rollInfo.total > 0 && rollInfo.total < BLACK_SCREEN_MIN_PRICE;

              return (
                <div className="space-y-4 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">수량 선택</h3>
                    {state.blackScreenRollCount > 0 && (
                      <Badge variant="secondary" className="text-xs">{tierLabel} 적용</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                    <div>
                      <p className="font-bold text-sm">롤방충망</p>
                      {state.blackScreenRollCount > 0 && (
                        <p className="text-xs text-primary mt-0.5">{rollInfo.unitPrice.toLocaleString()}원/장</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateState({ blackScreenRollCount: Math.max(0, state.blackScreenRollCount - 1) })}
                        className="w-9 h-9 rounded-full border-2 border-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-40"
                        disabled={state.blackScreenRollCount === 0}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-lg">{state.blackScreenRollCount}</span>
                      <button
                        onClick={() => updateState({ blackScreenRollCount: state.blackScreenRollCount + 1 })}
                        className="w-9 h-9 rounded-full border-2 border-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {state.blackScreenRollCount > 0 && (
                    <div className={`p-3 rounded-lg text-sm font-bold flex justify-between ${belowMin ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                      <span>예상 소계 (총 {state.blackScreenRollCount}장)</span>
                      <span>{rollInfo.total.toLocaleString()}원{belowMin ? ' ← 최소 20만원 미달' : ''}</span>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={prevStep} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" />
                이전
              </Button>
              <Button
                onClick={() => goToStep(3)}
                disabled={(() => {
                  if (!state.blackScreenServiceType) return true;
                  if (state.blackScreenServiceType === 'rollScreen') {
                    const info = getRollScreenPrice(state.blackScreenRollCount);
                    return state.blackScreenRollCount === 0 || info.total < BLACK_SCREEN_MIN_PRICE;
                  }
                  const info = getBlackScreenPrice(
                    state.blackScreenServiceType,
                    state.blackScreenLargeCount,
                    state.blackScreenMediumCount
                  );
                  return (state.blackScreenLargeCount + state.blackScreenMediumCount) === 0 || info.total < BLACK_SCREEN_MIN_PRICE;
                })()}
                className="flex-1"
              >
                견적 확인
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: 유리난간 - 견적 결과 */}
        {state.step === 3 && state.quoteType === 'glassRailing' && (
          <div className="space-y-6" ref={resultAreaRef}>
            <div>
              <h2 className="text-xl font-bold mb-2">견적 결과</h2>
              {state.completedQuotes.length === 0 ? (
                <p className="text-muted-foreground">아파트 유리난간 견적</p>
              ) : (
                <ol className="text-muted-foreground space-y-0.5 text-sm list-none">
                  <li>1. 아파트 유리난간 견적</li>
                  {state.completedQuotes.map((q, i) => (
                    <li key={q.id}>{i + 2}. {q.productName} 견적</li>
                  ))}
                </ol>
              )}
            </div>

            {(() => {
              const basePrice = state.glassRailingPurchaseType && state.glassRailingType && state.glassRailingWindowCount
                ? getGlassRailingPrice(
                    state.glassRailingPurchaseType,
                    state.glassRailingType,
                    state.glassRailingWindowCount,
                    state.glassRailingWindowSize ?? undefined
                  )
                : 0;
              const roomAddPrice =
                state.glassRailingType === 'steelRemoval' && state.glassRailingSteelRoomAddSize
                  ? getSteelRoomAddPrice(state.glassRailingSteelRoomAddSize)
                  : state.glassRailingType === 'windowRemoval' && state.glassRailingWindowRoomAddSize
                  ? getWindowRoomAddPrice(state.glassRailingWindowRoomAddSize)
                  : 0;
              const total = basePrice + roomAddPrice;
              const completedTotal = state.completedQuotes.reduce((s, q) => s + q.total, 0);
              const grandTotal = completedTotal + total;

              const purchaseTypeInfo = glassRailingPurchaseOptions.find(o => o.id === state.glassRailingPurchaseType);
              const railingTypeInfo = glassRailingTypeOptions.find(o => o.id === state.glassRailingType);
              const windowCountInfo = glassRailingWindowCountOptions.find(o => o.id === state.glassRailingWindowCount);
              const windowSizeInfo = glassRailingWindowSizeOptions.find(o => o.id === state.glassRailingWindowSize);
              const steelRoomAddInfo = steelRoomAddOptions.find(o => o.id === state.glassRailingSteelRoomAddSize);
              const windowRoomAddInfo = windowRoomAddOptions.find(o => o.id === state.glassRailingWindowRoomAddSize);

              return (
                <>
                  <Card>
                    <CardContent className="p-5 space-y-4">
                      <div className="text-center pb-4 border-b">
                        <p className="text-sm text-muted-foreground mb-1">
                          예상 견적 결과
                        </p>
                        <p className="text-xs text-muted-foreground">
                          정확한 최종 견적은 방문 실측 후 확정됩니다. (예상 견적은 참고용)
                        </p>
                      </div>

                      {/* 선택 내역 1: 유리난간 (현재 상품) */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-sm">
                          {state.completedQuotes.length > 0 ? '선택 내역 1 : 아파트 유리난간' : '선택 내역'}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">구매방식</span>
                            <span className="font-medium">{purchaseTypeInfo?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">타입</span>
                            <span className="font-medium text-right">{railingTypeInfo?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">거실창수</span>
                            <span className="font-medium">{windowCountInfo?.name}</span>
                          </div>
                          {windowSizeInfo && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">대창 사이즈</span>
                              <span className="font-medium">{windowSizeInfo.name}</span>
                            </div>
                          )}
                          {(steelRoomAddInfo || windowRoomAddInfo) && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">거실 시공비</span>
                                <span className="font-medium">{basePrice.toLocaleString()}원</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">방추가 ({(steelRoomAddInfo ?? windowRoomAddInfo)?.name})</span>
                                <span className="font-medium">+{roomAddPrice.toLocaleString()}원</span>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex justify-between pt-2 border-t text-sm">
                          <span className="font-semibold">아파트 유리난간 소계</span>
                          <span className="font-semibold">{total.toLocaleString()}원</span>
                        </div>
                      </div>

                      {/* 선택 내역 2, 3, ...: 완료된 상품들 */}
                      {state.completedQuotes.map((q, i) => (
                        <div key={q.id} className="space-y-3 pt-3 border-t">
                          <h4 className="font-bold text-sm">선택 내역 {i + 2} : {q.productName}</h4>
                          <div className="space-y-2 text-sm">
                            {q.displayDetails.map((d, j) => (
                              <div key={j} className={`flex justify-between ${d.indent ? 'pl-3' : ''}`}>
                                <span className="text-muted-foreground">{d.label}</span>
                                <span className="font-medium text-right">{d.value}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between pt-2 border-t text-sm">
                            <span className="font-semibold">{q.productName} 소계</span>
                            <span className="font-semibold">{q.total.toLocaleString()}원</span>
                          </div>
                        </div>
                      ))}

                      {/* 합산 견적 내역 */}
                      {state.completedQuotes.length > 0 && (
                        <div className="p-3 bg-secondary/30 rounded-lg space-y-2 text-sm border-t pt-3">
                          <p className="text-xs font-bold text-muted-foreground">합산 견적 내역</p>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">아파트 유리난간 ({purchaseTypeInfo?.name})</span>
                            <span>{total.toLocaleString()}원</span>
                          </div>
                          {state.completedQuotes.map(q => (
                            <div key={q.id} className="flex justify-between">
                              <span className="text-muted-foreground">{q.label}</span>
                              <span>{q.total.toLocaleString()}원</span>
                            </div>
                          ))}
                          <div className="flex justify-between font-bold border-t pt-2">
                            <span>합산 총액</span>
                            <span>{grandTotal.toLocaleString()}원</span>
                          </div>
                        </div>
                      )}

                      {state.completedQuotes.length === 0 && (
                        <div className="flex justify-between pt-3 border-t">
                          <span className="font-bold">총 시공 견적</span>
                          <span className="font-bold text-lg">{total.toLocaleString()}원</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 에누리 */}
                  {(() => {
                    const baseTotal = state.completedQuotes.length > 0 ? grandTotal : total;
                    const discountedTotal = discountPercent > 0 ? applyDiscount(baseTotal, discountPercent) : null;
                    return (
                      <Card className="border-orange-200">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-orange-600">에누리</span>
                            <Button
                              size="sm"
                              variant={showDiscountInput ? "default" : "outline"}
                              className="h-8 px-3 text-sm border-orange-300 text-orange-600 hover:bg-orange-50"
                              onClick={() => {
                                if (showDiscountInput) {
                                  resetDiscount();
                                } else {
                                  setShowDiscountInput(true);
                                }
                              }}
                            >
                              {showDiscountInput ? '취소' : '에누리 적용'}
                            </Button>
                          </div>
                          {showDiscountInput && (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                placeholder="할인율 입력"
                                value={discountInputValue}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setDiscountInputValue(v);
                                  const n = parseFloat(v);
                                  setDiscountPercent(!isNaN(n) && n > 0 ? n : 0);
                                }}
                                className="h-9 w-32 text-center"
                              />
                              <span className="text-sm font-medium">%</span>
                            </div>
                          )}
                          {discountedTotal !== null && discountPercent > 0 && (
                            <div className="space-y-1 pt-1 border-t text-sm">
                              <div className="flex justify-between text-muted-foreground">
                                <span>원래 견적</span>
                                <span>{baseTotal.toLocaleString()}원</span>
                              </div>
                              <div className="flex justify-between text-red-500">
                                <span>에누리 ({discountPercent}%)</span>
                                <span>-{(baseTotal - discountedTotal).toLocaleString()}원</span>
                              </div>
                              <div className="flex justify-between font-bold text-lg pt-1 border-t text-orange-600">
                                <span>에누리 적용가</span>
                                <span>{discountedTotal.toLocaleString()}원</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })()}

                  {/* 다른 상품 추가 버튼 */}
                  <Button
                    className="w-full h-12 font-semibold"
                    variant="outline"
                    onClick={() => {
                      const roomAddInfo = steelRoomAddInfo ?? windowRoomAddInfo;
                      let sectionText =
                        `[고구려 파노라마 유리난간]\n` +
                        `구매방식: ${purchaseTypeInfo?.name}\n` +
                        `타입: ${railingTypeInfo?.name}\n` +
                        `거실창수: ${windowCountInfo?.name}\n`;
                      if (windowSizeInfo) sectionText += `대창 사이즈: ${windowSizeInfo.name}\n`;
                      if (roomAddInfo) sectionText += `방추가: ${roomAddInfo.name} (+${roomAddPrice.toLocaleString()}원)\n`;
                      sectionText += `소계: ${total.toLocaleString()}원`;
                      const displayDetails: { label: string; value: string }[] = [
                        { label: '구매방식', value: purchaseTypeInfo?.name ?? '' },
                        { label: '타입', value: railingTypeInfo?.name ?? '' },
                        { label: '거실창수', value: windowCountInfo?.name ?? '' },
                      ];
                      if (windowSizeInfo) displayDetails.push({ label: '대창 사이즈', value: windowSizeInfo.name });
                      if (roomAddInfo) displayDetails.push({ label: '방추가', value: `${roomAddInfo.name} (+${roomAddPrice.toLocaleString()}원)` });
                      addToCompletedQuotes({
                        id: Date.now().toString(),
                        label: `아파트 유리난간 (${purchaseTypeInfo?.name})`,
                        productName: '아파트 유리난간',
                        total,
                        sectionText,
                        type: 'glassRailing',
                        displayDetails,
                      });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    다른 상품 추가하기
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        const purchaseTypeInfo = glassRailingPurchaseOptions.find(o => o.id === state.glassRailingPurchaseType);
                        const railingTypeInfo = glassRailingTypeOptions.find(o => o.id === state.glassRailingType);
                        const windowCountInfo = glassRailingWindowCountOptions.find(o => o.id === state.glassRailingWindowCount);
                        const windowSizeInfoShare = glassRailingWindowSizeOptions.find(o => o.id === state.glassRailingWindowSize);
                        const roomAddInfoShare = steelRoomAddOptions.find(o => o.id === state.glassRailingSteelRoomAddSize)
                          ?? windowRoomAddOptions.find(o => o.id === state.glassRailingWindowRoomAddSize);

                        let text = state.completedQuotes.length > 0 ? `[합산 견적서]\n\n` : `[고구려 파노라마 유리난간 견적서]\n\n`;
                        text += `[고구려 파노라마 유리난간]\n`;
                        text += `구매방식: ${purchaseTypeInfo?.name}\n`;
                        text += `타입: ${railingTypeInfo?.name}\n`;
                        text += `거실창수: ${windowCountInfo?.name}\n`;
                        if (windowSizeInfoShare) text += `대창 사이즈: ${windowSizeInfoShare.name}\n`;
                        if (roomAddInfoShare) text += `방추가: ${roomAddInfoShare.name} (+${roomAddPrice.toLocaleString()}원)\n`;
                        if (state.completedQuotes.length > 0) {
                          text += `소계: ${total.toLocaleString()}원\n`;
                          text += `\n`;
                          state.completedQuotes.forEach(q => { text += q.sectionText + '\n\n'; });
                          text += `\n[합산 견적 내역]\n`;
                          text += `아파트 유리난간 (${purchaseTypeInfo?.name}): ${total.toLocaleString()}원\n`;
                          state.completedQuotes.forEach(q => { text += `${q.label}: ${q.total.toLocaleString()}원\n`; });
                          text += `*합산 총액: ${grandTotal.toLocaleString()}원\n`;
                        } else {
                          text += `\n*총 시공 견적: ${total.toLocaleString()}원\n`;
                        }
                        const baseTotal = state.completedQuotes.length > 0 ? grandTotal : total;
                        if (discountPercent > 0) {
                          const discountedTotal = applyDiscount(baseTotal, discountPercent);
                          text += `\n[에누리 ${discountPercent}% 적용]\n`;
                          text += `에누리 적용가: ${discountedTotal.toLocaleString()}원\n`;
                        }
                        text += `\n[안내사항]\n`;
                        text += `• 최종 금액은 방문 실측 후 확정될 수 있습니다.\n`;
                        text += `• 공동구매는 같은 아파트 단지 내 3세대 이상 함께 시공시 적용됩니다.\n`;
                        text += `• 입면분할창은 현장에 따라 금액 변동이 있을 수 있으며, 방추가 할인은 적용되지 않습니다.\n`;
                        text += `\n문의: 코끼리시스템 1555-0143`;

                        navigator.clipboard.writeText(text);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 mr-2" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {copied ? "복사됨" : "견적 복사"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={captureQuote}
                      disabled={capturing}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {capturing ? "캡처 중..." : "견적 캡처"}
                    </Button>
                  </div>

                  {/* 유리난간 견적 포함사항 */}
                  <Card className="bg-primary/10 border-primary/30">
                    <CardContent className="p-4">
                      <h4 className="font-bold text-base mb-3 text-primary">유리난간 견적 포함사항</h4>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="font-medium">고구려 안전방충망(0.4mm) 설치 포함 (거실)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>고구려 안전방충망, 행위허가 대행비용, 입주민동의서 대행비용, 부가세가 모두 포함된 금액입니다.</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-secondary/50">
                    <CardContent className="p-4">
                      <h4 className="font-bold text-sm mb-2">안내 사항</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {Array.from(new Set([
                          ...state.completedQuotes.flatMap(q => PRODUCT_NOTICES[q.type]),
                          ...PRODUCT_NOTICES['glassRailing'],
                        ])).map((notice, i) => (
                          <li key={i}>• {notice}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={resetAll}
                      className="flex-1"
                    >
                      처음으로
                    </Button>
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      수정하기
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Step 3: 후퍼옵틱 - 견적 결과 */}
        {state.step === 3 && state.quoteType === 'huperOptik' && (
          <div className="space-y-6" ref={resultAreaRef}>
            <div>
              <h2 className="text-xl font-bold mb-2">견적 결과</h2>
              {state.completedQuotes.length === 0 ? (
                <p className="text-muted-foreground">후퍼옵틱 열차단필름 견적</p>
              ) : (
                <ol className="text-muted-foreground space-y-0.5 text-sm list-none">
                  <li>1. 후퍼옵틱 열차단필름 견적</li>
                  {state.completedQuotes.map((q, i) => (
                    <li key={q.id}>{i + 2}. {q.productName} 견적</li>
                  ))}
                </ol>
              )}
            </div>

            {(() => {
              const isGeneral = state.huperOptikPurchaseType === 'general';
              const total = state.huperOptikPurchaseType && state.huperOptikFilmType && state.huperOptikSizeType
                ? isGeneral
                  ? huperOptikRoomPrices
                      .filter((r) => state.huperOptikSelectedRooms.includes(r.id))
                      .reduce((sum, r) => sum + r.prices[state.huperOptikSizeType!][state.huperOptikFilmType!], 0)
                  : getHuperOptikPrice(state.huperOptikPurchaseType, state.huperOptikFilmType, state.huperOptikSizeType)
                : 0;
              const completedTotal = state.completedQuotes.reduce((s, q) => s + q.total, 0);
              const grandTotal = completedTotal + total;

              const purchaseTypeInfo = huperOptikPurchaseOptions.find(o => o.id === state.huperOptikPurchaseType);
              const filmTypeInfo = huperOptikFilmOptions.find(o => o.id === state.huperOptikFilmType);
              const sizeTypeInfo = huperOptikSizeOptions.find(o => o.id === state.huperOptikSizeType);

              return (
                <>
                  <Card>
                    <CardContent className="p-5 space-y-4">
                      <div className="text-center pb-4 border-b">
                        <p className="text-sm text-muted-foreground mb-1">예상 견적 결과</p>
                        <p className="text-xs text-muted-foreground">
                          정확한 최종 견적은 방문 실측 후 확정됩니다. (예상 견적은 참고용)
                        </p>
                      </div>

                      {/* 선택 내역 1: 현재 상품 (후퍼옵틱) */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-sm">
                          {state.completedQuotes.length > 0 ? '선택 내역 1 : 후퍼옵틱 열차단필름' : '선택 내역'}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">구매방식</span>
                            <span className="font-medium">{purchaseTypeInfo?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">평형</span>
                            <span className="font-medium">{sizeTypeInfo?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">필름타입</span>
                            <span className="font-medium text-right">{filmTypeInfo?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">보증기간</span>
                            <span className="font-medium">{filmTypeInfo?.subtitle}</span>
                          </div>
                          {isGeneral && state.huperOptikSizeType && state.huperOptikFilmType && (
                            <div className="pt-2 border-t space-y-1">
                              <p className="text-xs text-muted-foreground font-semibold">시공 위치별 금액</p>
                              {huperOptikRoomPrices
                                .filter((r) => state.huperOptikSelectedRooms.includes(r.id))
                                .map((r) => (
                                  <div key={r.id} className="flex justify-between">
                                    <span className="text-muted-foreground">· {r.name}</span>
                                    <span>{r.prices[state.huperOptikSizeType!][state.huperOptikFilmType!].toLocaleString()}원</span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between pt-3 border-t">
                        <span className="font-bold">{state.completedQuotes.length > 0 ? '후퍼옵틱 소계' : '총 시공 견적'}</span>
                        <span className="font-bold text-lg">{total.toLocaleString()}원</span>
                      </div>

                      {/* 선택 내역 2, 3...: 완료된 상품들 */}
                      {state.completedQuotes.map((q, i) => (
                        <div key={q.id} className="space-y-3 pt-4 border-t">
                          <h4 className="font-bold text-sm">선택 내역 {i + 2} : {q.productName}</h4>
                          <div className="space-y-2 text-sm">
                            {q.displayDetails.map((d, j) => (
                              <div key={j} className={`flex justify-between ${d.indent ? 'pl-3' : ''}`}>
                                <span className="text-muted-foreground">{d.label}</span>
                                <span className="font-medium">{d.value}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between pt-2 border-t">
                            <span className="font-bold">{q.productName} 소계</span>
                            <span className="font-bold">{q.total.toLocaleString()}원</span>
                          </div>
                        </div>
                      ))}

                      {/* 합산 견적 내역 */}
                      {state.completedQuotes.length > 0 && (
                        <div className="mt-1 p-3 bg-secondary/30 rounded-lg space-y-2 text-sm border-t pt-4">
                          <p className="text-xs font-bold text-muted-foreground">합산 견적 내역</p>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">후퍼옵틱 ({purchaseTypeInfo?.name})</span>
                            <span>{total.toLocaleString()}원</span>
                          </div>
                          {state.completedQuotes.map(q => (
                            <div key={q.id} className="flex justify-between">
                              <span className="text-muted-foreground">{q.label}</span>
                              <span>{q.total.toLocaleString()}원</span>
                            </div>
                          ))}
                          <div className="flex justify-between font-bold border-t pt-2">
                            <span>합산 총액</span>
                            <span>{grandTotal.toLocaleString()}원</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 에누리 */}
                  {(() => {
                    const baseTotal = state.completedQuotes.length > 0 ? grandTotal : total;
                    const discountedTotal = discountPercent > 0 ? applyDiscount(baseTotal, discountPercent) : null;
                    return (
                      <Card className="border-orange-200">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-orange-600">에누리</span>
                            <Button
                              size="sm"
                              variant={showDiscountInput ? "default" : "outline"}
                              className="h-8 px-3 text-sm border-orange-300 text-orange-600 hover:bg-orange-50"
                              onClick={() => {
                                if (showDiscountInput) {
                                  resetDiscount();
                                } else {
                                  setShowDiscountInput(true);
                                }
                              }}
                            >
                              {showDiscountInput ? '취소' : '에누리 적용'}
                            </Button>
                          </div>
                          {showDiscountInput && (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                placeholder="할인율 입력"
                                value={discountInputValue}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setDiscountInputValue(v);
                                  const n = parseFloat(v);
                                  setDiscountPercent(!isNaN(n) && n > 0 ? n : 0);
                                }}
                                className="h-9 w-32 text-center"
                              />
                              <span className="text-sm font-medium">%</span>
                            </div>
                          )}
                          {discountedTotal !== null && discountPercent > 0 && (
                            <div className="space-y-1 pt-1 border-t text-sm">
                              <div className="flex justify-between text-muted-foreground">
                                <span>원래 견적</span>
                                <span>{baseTotal.toLocaleString()}원</span>
                              </div>
                              <div className="flex justify-between text-red-500">
                                <span>에누리 ({discountPercent}%)</span>
                                <span>-{(baseTotal - discountedTotal).toLocaleString()}원</span>
                              </div>
                              <div className="flex justify-between font-bold text-lg pt-1 border-t text-orange-600">
                                <span>에누리 적용가</span>
                                <span>{discountedTotal.toLocaleString()}원</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })()}

                  {/* 다른 상품 추가 버튼 */}
                  <Button
                    className="w-full h-12 font-semibold"
                    variant="outline"
                    onClick={() => {
                      let sectionText = `[후퍼옵틱 열차단필름]\n`;
                      sectionText += `구매방식: ${purchaseTypeInfo?.name}\n`;
                      sectionText += `평형: ${sizeTypeInfo?.name}\n`;
                      sectionText += `필름타입: ${filmTypeInfo?.name}\n`;
                      if (isGeneral && state.huperOptikSizeType && state.huperOptikFilmType) {
                        huperOptikRoomPrices
                          .filter((r) => state.huperOptikSelectedRooms.includes(r.id))
                          .forEach((r) => {
                            sectionText += `- ${r.name}: ${r.prices[state.huperOptikSizeType!][state.huperOptikFilmType!].toLocaleString()}원\n`;
                          });
                      }
                      sectionText += `소계: ${total.toLocaleString()}원`;
                      const displayDetails: CompletedQuote['displayDetails'] = [
                        { label: '구매방식', value: purchaseTypeInfo?.name ?? '' },
                        { label: '평형', value: sizeTypeInfo?.name ?? '' },
                        { label: '필름타입', value: filmTypeInfo?.name ?? '' },
                        { label: '보증기간', value: filmTypeInfo?.subtitle ?? '' },
                      ];
                      if (isGeneral && state.huperOptikSizeType && state.huperOptikFilmType) {
                        huperOptikRoomPrices
                          .filter((r) => state.huperOptikSelectedRooms.includes(r.id))
                          .forEach((r) => {
                            displayDetails.push({
                              label: `· ${r.name}`,
                              value: `${r.prices[state.huperOptikSizeType!][state.huperOptikFilmType!].toLocaleString()}원`,
                              indent: true,
                            });
                          });
                      }
                      addToCompletedQuotes({
                        id: Date.now().toString(),
                        label: `후퍼옵틱 (${purchaseTypeInfo?.name})`,
                        productName: '후퍼옵틱 열차단필름',
                        total,
                        sectionText,
                        type: 'huperOptik',
                        displayDetails,
                      });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    다른 상품 추가하기
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        let text = state.completedQuotes.length > 0 ? `[합산 견적서]\n\n` : `[후퍼옵틱 열차단필름 견적서]\n\n`;
                        text += `[후퍼옵틱 열차단필름]\n`;
                        text += `구매방식: ${purchaseTypeInfo?.name}\n`;
                        text += `평형: ${sizeTypeInfo?.name}\n`;
                        text += `필름타입: ${filmTypeInfo?.name}\n`;
                        text += `보증기간: ${filmTypeInfo?.subtitle}\n`;
                        if (isGeneral && state.huperOptikSizeType && state.huperOptikFilmType) {
                          text += `\n[시공 위치별 금액]\n`;
                          huperOptikRoomPrices
                            .filter((r) => state.huperOptikSelectedRooms.includes(r.id))
                            .forEach((r) => {
                              text += `- ${r.name}: ${r.prices[state.huperOptikSizeType!][state.huperOptikFilmType!].toLocaleString()}원\n`;
                            });
                        }
                        if (state.completedQuotes.length > 0) {
                          text += `소계: ${total.toLocaleString()}원\n`;
                          text += `\n`;
                          state.completedQuotes.forEach(q => { text += q.sectionText + '\n\n'; });
                          text += `\n[합산 견적 내역]\n`;
                          text += `후퍼옵틱 (${purchaseTypeInfo?.name}): ${total.toLocaleString()}원\n`;
                          state.completedQuotes.forEach(q => { text += `${q.label}: ${q.total.toLocaleString()}원\n`; });
                          text += `*합산 총액: ${grandTotal.toLocaleString()}원\n`;
                        } else {
                          text += `\n*총 시공 견적: ${total.toLocaleString()}원\n`;
                        }
                        const baseTotal = state.completedQuotes.length > 0 ? grandTotal : total;
                        if (discountPercent > 0) {
                          const discountedTotal = applyDiscount(baseTotal, discountPercent);
                          text += `\n[에누리 ${discountPercent}% 적용]\n`;
                          text += `에누리 적용가: ${discountedTotal.toLocaleString()}원\n`;
                        }
                        text += `\n[안내사항]\n`;
                        text += `• 최종 금액은 방문 실측 후 확정될 수 있습니다.\n`;
                        text += `• 공동구매는 같은 아파트 단지 내 3세대 이상 함께 시공시 적용됩니다.\n`;
                        text += `• 단, 주상복합이나 이면창이 있는경우 추가요금이 발생할 수 있습니다.\n`;
                        text += `• 전용 84초과 타입은 실측을 통한 견적이 가능합니다.\n`;
                        text += `\n문의: 코끼리시스템 1555-0143`;
                        
                        navigator.clipboard.writeText(text);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 mr-2" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {copied ? "복사됨" : "견적 복사"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={captureQuote}
                      disabled={capturing}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {capturing ? "캡처 중..." : "견적 캡처"}
                    </Button>
                  </div>

                  {state.completedQuotes.some(q => q.type === 'glassRailing') && (
                    <Card className="bg-primary/10 border-primary/30">
                      <CardContent className="p-4">
                        <h4 className="font-bold text-base mb-3 text-primary">유리난간 견적 포함사항</h4>
                        <ul className="text-sm space-y-2">
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="font-medium">고구려 안전방충망(0.4mm) 설치 포함 (거실)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>고구려 안전방충망, 행위허가 대행비용, 입주민동의서 대행비용, 부가세가 모두 포함된 금액입니다.</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-secondary/50">
                    <CardContent className="p-4">
                      <h4 className="font-bold text-sm mb-2">안내 사항</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {Array.from(new Set([
                          ...state.completedQuotes.flatMap(q => PRODUCT_NOTICES[q.type]),
                          ...PRODUCT_NOTICES['huperOptik'],
                        ])).map((notice, i) => (
                          <li key={i}>• {notice}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={resetAll}
                      className="flex-1"
                    >
                      처음으로
                    </Button>
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      수정하기
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Step 3: 블랙스텐 방충망 - 견적 결과 */}
        {state.step === 3 && state.quoteType === 'blackScreenMesh' && (
          <div className="space-y-6" ref={resultAreaRef}>
            <div>
              <h2 className="text-xl font-bold mb-2">견적 결과</h2>
              {state.completedQuotes.length === 0 ? (
                <p className="text-muted-foreground">블랙스텐 미세촘촘 방충망 견적</p>
              ) : (
                <ol className="text-muted-foreground space-y-0.5 text-sm list-none">
                  <li>1. 블랙스텐 미세촘촘 방충망 견적</li>
                  {state.completedQuotes.map((q, i) => (
                    <li key={q.id}>{i + 2}. {q.productName} 견적</li>
                  ))}
                </ol>
              )}
            </div>

            {(() => {
              const svcOption = blackScreenServiceOptions.find(o => o.id === state.blackScreenServiceType);
              const isRoll = state.blackScreenServiceType === 'rollScreen';
              const isMesh = state.blackScreenServiceType === 'meshOnly' || state.blackScreenServiceType === 'frameAndMesh';

              const meshSvcType = (state.blackScreenServiceType === 'meshOnly' || state.blackScreenServiceType === 'frameAndMesh')
                ? state.blackScreenServiceType as 'meshOnly' | 'frameAndMesh'
                : null;

              const total = (() => {
                if (isRoll) return getRollScreenPrice(state.blackScreenRollCount).total;
                if (meshSvcType) {
                  return getBlackScreenPrice(meshSvcType, state.blackScreenLargeCount, state.blackScreenMediumCount).total;
                }
                return 0;
              })();

              const meshPriceInfo = meshSvcType
                ? getBlackScreenPrice(meshSvcType, state.blackScreenLargeCount, state.blackScreenMediumCount)
                : null;
              const rollPriceInfo = isRoll ? getRollScreenPrice(state.blackScreenRollCount) : null;
              const totalCount = isRoll ? state.blackScreenRollCount : (state.blackScreenLargeCount + state.blackScreenMediumCount);
              const tierLabel = totalCount >= 6 ? '6장 이상 단가' : (state.blackScreenServiceType === 'meshOnly' ? '3-5장 단가' : '1-5장 단가');

              const completedTotal = state.completedQuotes.reduce((s, q) => s + q.total, 0);
              const grandTotal = completedTotal + total;

              return (
                <>
                  <Card>
                    <CardContent className="p-5 space-y-4">
                      <div className="text-center pb-4 border-b">
                        <p className="text-sm text-muted-foreground mb-1">예상 견적 결과</p>
                        <p className="text-xs text-muted-foreground">정확한 최종 견적은 방문 실측 후 확정됩니다. (예상 견적은 참고용)</p>
                      </div>

                      {/* 선택 내역 */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-sm">
                          {state.completedQuotes.length > 0 ? '선택 내역 1 : 블랙스텐 방충망' : '선택 내역'}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">서비스</span>
                            <span className="font-medium">{svcOption?.name}</span>
                          </div>
                          {isMesh && meshPriceInfo && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">적용 단가</span>
                                <span className="font-medium">{tierLabel}</span>
                              </div>
                              {state.blackScreenLargeCount > 0 && (
                                <div className="space-y-0.5">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">대형 {state.blackScreenLargeCount}장 × {meshPriceInfo.largeUnitPrice.toLocaleString()}원</span>
                                    <span className="font-medium">{(state.blackScreenLargeCount * meshPriceInfo.largeUnitPrice).toLocaleString()}원</span>
                                  </div>
                                  <div className="flex justify-end">
                                    <span className="text-xs text-muted-foreground/70 font-mono">상품코드: {meshPriceInfo.largeCode}</span>
                                  </div>
                                </div>
                              )}
                              {state.blackScreenMediumCount > 0 && (
                                <div className="space-y-0.5">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">중형 {state.blackScreenMediumCount}장 × {meshPriceInfo.mediumUnitPrice.toLocaleString()}원</span>
                                    <span className="font-medium">{(state.blackScreenMediumCount * meshPriceInfo.mediumUnitPrice).toLocaleString()}원</span>
                                  </div>
                                  <div className="flex justify-end">
                                    <span className="text-xs text-muted-foreground/70 font-mono">상품코드: {meshPriceInfo.mediumCode}</span>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          {isRoll && rollPriceInfo && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">적용 단가</span>
                                <span className="font-medium">{tierLabel}</span>
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">{state.blackScreenRollCount}장 × {rollPriceInfo.unitPrice.toLocaleString()}원</span>
                                  <span className="font-medium">{rollPriceInfo.total.toLocaleString()}원</span>
                                </div>
                                <div className="flex justify-end">
                                  <span className="text-xs text-muted-foreground/70 font-mono">상품코드: {rollPriceInfo.code}</span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex justify-between pt-2 border-t text-sm">
                          <span className="font-semibold">블랙스텐 방충망 소계</span>
                          <span className="font-semibold">{total.toLocaleString()}원</span>
                        </div>
                      </div>

                      {/* 완료된 상품들 */}
                      {state.completedQuotes.map((q, i) => (
                        <div key={q.id} className="space-y-3 pt-3 border-t">
                          <h4 className="font-bold text-sm">선택 내역 {i + 2} : {q.productName}</h4>
                          <div className="space-y-2 text-sm">
                            {q.displayDetails.map((d, j) => (
                              <div key={j} className={`flex justify-between ${d.indent ? 'pl-3' : ''}`}>
                                <span className="text-muted-foreground">{d.label}</span>
                                <span className="font-medium text-right">{d.value}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between pt-2 border-t text-sm">
                            <span className="font-semibold">{q.productName} 소계</span>
                            <span className="font-semibold">{q.total.toLocaleString()}원</span>
                          </div>
                        </div>
                      ))}

                      {/* 합산 */}
                      {state.completedQuotes.length > 0 && (
                        <div className="p-3 bg-secondary/30 rounded-lg space-y-2 text-sm border-t pt-3">
                          <p className="text-xs font-bold text-muted-foreground">합산 견적 내역</p>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">블랙스텐 방충망 ({svcOption?.name})</span>
                            <span>{total.toLocaleString()}원</span>
                          </div>
                          {state.completedQuotes.map(q => (
                            <div key={q.id} className="flex justify-between">
                              <span className="text-muted-foreground">{q.label}</span>
                              <span>{q.total.toLocaleString()}원</span>
                            </div>
                          ))}
                          <div className="flex justify-between font-bold border-t pt-2">
                            <span>합산 총액</span>
                            <span>{grandTotal.toLocaleString()}원</span>
                          </div>
                        </div>
                      )}

                      {state.completedQuotes.length === 0 && (
                        <div className="flex justify-between pt-3 border-t">
                          <span className="font-bold">총 시공 견적</span>
                          <span className="font-bold text-lg">{total.toLocaleString()}원</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 블랙스텐망 교체 특장점 */}
                  {state.blackScreenServiceType === 'meshOnly' && (
                    <Card className="bg-primary/10 border-primary/30">
                      <CardContent className="p-4">
                        <h4 className="font-bold text-base mb-3 text-primary">블랙스텐망 교체 특장점</h4>
                        <p className="text-xs text-muted-foreground mb-3">한국메탈 블랙 0.18*24메쉬 · {'"'}벌레는 더 막고, 시야는 더 좋고, 오래 쓰는 프리미엄 방충망{'"'}</p>
                        <ul className="space-y-3">
                          {BLACK_SCREEN_FEATURES.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span><span className="font-bold">{f.title}</span> → {f.description}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* 에누리 */}
                  {(() => {
                    const baseTotal = state.completedQuotes.length > 0 ? grandTotal : total;
                    const discountedTotal = discountPercent > 0 ? applyDiscount(baseTotal, discountPercent) : null;
                    return (
                      <Card className="border-orange-200">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-orange-600">에누리</span>
                            <Button
                              size="sm"
                              variant={showDiscountInput ? 'default' : 'outline'}
                              className="h-8 px-3 text-sm border-orange-300 text-orange-600 hover:bg-orange-50"
                              onClick={() => { if (showDiscountInput) { resetDiscount(); } else { setShowDiscountInput(true); } }}
                            >
                              {showDiscountInput ? '취소' : '에누리 적용'}
                            </Button>
                          </div>
                          {showDiscountInput && (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number" min={0} max={100} placeholder="할인율 입력"
                                value={discountInputValue}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setDiscountInputValue(v);
                                  const n = parseFloat(v);
                                  setDiscountPercent(!isNaN(n) && n > 0 ? n : 0);
                                }}
                                className="h-9 w-32 text-center"
                              />
                              <span className="text-sm font-medium">%</span>
                            </div>
                          )}
                          {discountedTotal !== null && discountPercent > 0 && (
                            <div className="space-y-1 pt-1 border-t text-sm">
                              <div className="flex justify-between text-muted-foreground">
                                <span>원래 견적</span>
                                <span>{baseTotal.toLocaleString()}원</span>
                              </div>
                              <div className="flex justify-between text-red-500">
                                <span>에누리 ({discountPercent}%)</span>
                                <span>-{(baseTotal - discountedTotal).toLocaleString()}원</span>
                              </div>
                              <div className="flex justify-between font-bold text-lg pt-1 border-t text-orange-600">
                                <span>에누리 적용가</span>
                                <span>{discountedTotal.toLocaleString()}원</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })()}

                  {/* 다른 상품 추가 */}
                  <Button
                    className="w-full h-12 font-semibold"
                    variant="outline"
                    onClick={() => {
                      let sectionText = `[블랙스텐 방충망 - ${svcOption?.name}]\n`;
                      if (isMesh && meshPriceInfo) {
                        sectionText += `적용단가: ${tierLabel}\n`;
                        if (state.blackScreenLargeCount > 0) sectionText += `대형 ${state.blackScreenLargeCount}장 × ${meshPriceInfo.largeUnitPrice.toLocaleString()}원 = ${(state.blackScreenLargeCount * meshPriceInfo.largeUnitPrice).toLocaleString()}원 [${meshPriceInfo.largeCode}]\n`;
                        if (state.blackScreenMediumCount > 0) sectionText += `중형 ${state.blackScreenMediumCount}장 × ${meshPriceInfo.mediumUnitPrice.toLocaleString()}원 = ${(state.blackScreenMediumCount * meshPriceInfo.mediumUnitPrice).toLocaleString()}원 [${meshPriceInfo.mediumCode}]\n`;
                      }
                      if (isRoll && rollPriceInfo) {
                        sectionText += `${state.blackScreenRollCount}장 × ${rollPriceInfo.unitPrice.toLocaleString()}원 [${rollPriceInfo.code}]\n`;
                      }
                      sectionText += `소계: ${total.toLocaleString()}원`;

                      const displayDetails: CompletedQuote['displayDetails'] = [
                        { label: '서비스', value: svcOption?.name ?? '' },
                      ];
                      if (isMesh && meshPriceInfo) {
                        displayDetails.push({ label: '적용단가', value: tierLabel });
                        if (state.blackScreenLargeCount > 0) {
                          displayDetails.push({ label: `대형 ${state.blackScreenLargeCount}장`, value: `${(state.blackScreenLargeCount * meshPriceInfo.largeUnitPrice).toLocaleString()}원` });
                          displayDetails.push({ label: '상품코드', value: meshPriceInfo.largeCode, indent: true });
                        }
                        if (state.blackScreenMediumCount > 0) {
                          displayDetails.push({ label: `중형 ${state.blackScreenMediumCount}장`, value: `${(state.blackScreenMediumCount * meshPriceInfo.mediumUnitPrice).toLocaleString()}원` });
                          displayDetails.push({ label: '상품코드', value: meshPriceInfo.mediumCode, indent: true });
                        }
                      }
                      if (isRoll && rollPriceInfo) {
                        displayDetails.push({ label: `${state.blackScreenRollCount}장`, value: `${rollPriceInfo.total.toLocaleString()}원` });
                        displayDetails.push({ label: '상품코드', value: rollPriceInfo.code, indent: true });
                      }

                      addToCompletedQuotes({
                        id: Date.now().toString(),
                        label: `블랙스텐 방충망 (${svcOption?.name})`,
                        productName: '블랙스텐 미세촘촘 방충망',
                        total,
                        sectionText,
                        type: 'blackScreenMesh',
                        displayDetails,
                      });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    다른 상품 추가하기
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        let text = state.completedQuotes.length > 0 ? `[합산 견적서]\n\n` : `[블랙스텐 미세촘촘 방충망 견적서]\n\n`;
                        text += `[블랙스텐 방충망 - ${svcOption?.name}]\n`;
                        if (isMesh && meshPriceInfo) {
                          text += `적용단가: ${tierLabel}\n`;
                          if (state.blackScreenLargeCount > 0) text += `대형 ${state.blackScreenLargeCount}장 × ${meshPriceInfo.largeUnitPrice.toLocaleString()}원 = ${(state.blackScreenLargeCount * meshPriceInfo.largeUnitPrice).toLocaleString()}원 [${meshPriceInfo.largeCode}]\n`;
                          if (state.blackScreenMediumCount > 0) text += `중형 ${state.blackScreenMediumCount}장 × ${meshPriceInfo.mediumUnitPrice.toLocaleString()}원 = ${(state.blackScreenMediumCount * meshPriceInfo.mediumUnitPrice).toLocaleString()}원 [${meshPriceInfo.mediumCode}]\n`;
                        }
                        if (isRoll && rollPriceInfo) {
                          text += `${state.blackScreenRollCount}장 × ${rollPriceInfo.unitPrice.toLocaleString()}원 [${rollPriceInfo.code}]\n`;
                        }
                        if (state.completedQuotes.length > 0) {
                          text += `소계: ${total.toLocaleString()}원\n\n`;
                          state.completedQuotes.forEach(q => { text += q.sectionText + '\n\n'; });
                          text += `\n[합산 견적 내역]\n`;
                          text += `블랙스텐 방충망 (${svcOption?.name}): ${total.toLocaleString()}원\n`;
                          state.completedQuotes.forEach(q => { text += `${q.label}: ${q.total.toLocaleString()}원\n`; });
                          text += `*합산 총액: ${grandTotal.toLocaleString()}원\n`;
                        } else {
                          text += `\n*총 시공 견적: ${total.toLocaleString()}원\n`;
                        }
                        const baseTotal = state.completedQuotes.length > 0 ? grandTotal : total;
                        if (discountPercent > 0) {
                          const discountedTotal = applyDiscount(baseTotal, discountPercent);
                          text += `\n[에누리 ${discountPercent}% 적용]\n에누리 적용가: ${discountedTotal.toLocaleString()}원\n`;
                        }
                        text += `\n[안내사항]\n`;
                        PRODUCT_NOTICES['blackScreenMesh'].forEach(n => { text += `• ${n}\n`; });
                        text += `\n문의: 코끼리시스템 1555-0143`;
                        navigator.clipboard.writeText(text);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                    >
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? '복사됨' : '견적 복사'}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={captureQuote} disabled={capturing}>
                      <Camera className="w-4 h-4 mr-2" />
                      {capturing ? '캡처 중...' : '견적 캡처'}
                    </Button>
                  </div>

                  {state.completedQuotes.some(q => q.type === 'glassRailing') && (
                    <Card className="bg-primary/10 border-primary/30">
                      <CardContent className="p-4">
                        <h4 className="font-bold text-base mb-3 text-primary">유리난간 견적 포함사항</h4>
                        <ul className="text-sm space-y-2">
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="font-medium">고구려 안전방충망(0.4mm) 설치 포함 (거실)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>고구려 안전방충망, 행위허가 대행비용, 입주민동의서 대행비용, 부가세가 모두 포함된 금액입니다.</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-secondary/50">
                    <CardContent className="p-4">
                      <h4 className="font-bold text-sm mb-2">안내 사항</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {Array.from(new Set([
                          ...state.completedQuotes.flatMap(q => PRODUCT_NOTICES[q.type]),
                          ...PRODUCT_NOTICES['blackScreenMesh'],
                        ])).map((notice, i) => (
                          <li key={i}>• {notice}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={resetAll} className="flex-1">처음으로</Button>
                    <Button variant="outline" onClick={prevStep} className="flex-1">
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      수정하기
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Step 3: 안전방충망 - 설치환경 및 망타입 선택 */}
        {state.step === 3 && state.quoteType === 'safetyScreen' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">설치환경 선택</h2>
              <p className="text-muted-foreground">
                설치 환경에 맞는 옵션을 선택해주세요
              </p>
            </div>

            <div className="space-y-4">
              {installTypes.map((install) => (
                <Card
                  key={install.id}
                  className={`cursor-pointer transition-all ${
                    state.installType === install.id
                      ? "ring-2 ring-primary border-primary"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => selectInstallType(install.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        {install.id === "lowFloor" ? (
                          <Home className="w-6 h-6 text-primary" />
                        ) : (
                          <Building2 className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold">{install.name}</h3>
                            <Badge variant="outline" className="mt-1">
                              {install.subtitle}
                            </Badge>
                          </div>
                          {state.installType === install.id && (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {install.description}
                        </p>
                        <p className="text-sm text-primary font-medium mt-2">
                          {install.recommendation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 망타입 선택 (설치유형 선택 후 표시) */}
            {state.installType && getAvailableMeshTypes().length > 1 && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <h3 className="font-bold mb-2">망 타입 선택</h3>
                  <p className="text-sm text-muted-foreground">
                    {brands.find((b) => b.id === state.brand)?.name}에서 선택 가능한 망 타입입니다
                  </p>
                </div>
                <div className="space-y-3">
                  {getAvailableMeshTypes().map((meshType) => {
                    const meshInfo = getMeshTypeInfo(meshType);
                    if (!meshInfo) return null;
                    return (
                      <Card
                        key={meshType}
                        className={`cursor-pointer transition-all ${
                          state.meshType === meshType
                            ? "ring-2 ring-primary border-primary"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => selectMeshType(meshType)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{meshInfo.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {meshInfo.description}
                              </p>
                            </div>
                            {state.meshType === meshType && (
                              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-4 h-4 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 고구려시스템 자동 선택 안내 */}
            {state.installType && getAvailableMeshTypes().length === 1 && (
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      망 타입 자동 선택
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {state.brand === 'goguryeo' && state.installType === 'lowFloor' && '0.6mm (16mesh)'}
                      {state.brand === 'goguryeo' && state.installType === 'highFloor' && '0.4mm (16mesh)'}
                      이(가) 자동으로 선택되었습니다.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={prevStep} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" />
                이전
              </Button>
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex-1"
              >
                다음
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: 공간/사이즈 선택 */}
        {state.step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">공간/사이즈 선택</h2>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">
                  {brands.find((b) => b.id === state.brand)?.name}
                </Badge>
                <Badge variant="secondary">
                  {installTypes.find((i) => i.id === state.installType)?.name}
                </Badge>
                <Badge variant="secondary">{state.meshType}</Badge>
              </div>
              <p className="text-muted-foreground mt-2">
                공간별 개수를 선택하고, 실측값이 있으면 입력해주세요.
              </p>
            </div>

            <div className="space-y-4">
              {spaces.map((space) => {
                const count = getSpaceCount(space.id);
                const details = getSpaceDetails(space.id);

                return (
                  <Card key={space.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-bold">{space.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            기본사이즈: {space.defaultWidth}×{space.defaultHeight}mm
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateSpaceItem(space.id, Math.max(0, count - 1))
                            }
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-bold">
                            {count}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateSpaceItem(space.id, count + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {count > 0 && (
                        <div className="space-y-4 pt-3 border-t">
                          {/* 실측사이즈 버튼 */}
                          <Button
                            variant={getShowSizeInput(space.id) ? "default" : "outline"}
                            size="sm"
                            className="w-full"
                            onClick={() => toggleSizeInput(space.id)}
                          >
                            {getShowSizeInput(space.id) ? (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                실측사이즈 입력 중
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-2" />
                                실측사이즈 입력
                              </>
                            )}
                          </Button>

                          {details.map((detail, index) => {
                            const price =
                              state.brand && state.meshType
                                ? getPrice(state.brand, state.meshType, detail.width, detail.height)
                                : null;

                            return (
                              <div key={detail.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-muted-foreground">
                                    {space.name} {index + 1}
                                  </span>
                                  {price && (
                                    <span className="text-sm font-bold text-primary">
                                      {price.toLocaleString()}원
                                    </span>
                                  )}
                                </div>
                                {/* 실측사이즈 입력 영역 - 버튼 클릭 시 표시 */}
                                {getShowSizeInput(space.id) && (
                                  <>
                                    <div className="flex gap-3">
                                      <div className="flex-1">
                                        <label className="text-xs text-muted-foreground">
                                          가로 (mm)
                                        </label>
                                        <Input
                                          type="number"
                                          value={detail.width}
                                          onChange={(e) => {
                                            const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                                            updateSpaceDetailSize(
                                              space.id,
                                              index,
                                              value,
                                              null
                                            );
                                          }}
                                          onFocus={(e) => e.target.select()}
                                          onBlur={(e) => {
                                            // 빈 값이거나 0이면 기본값으로 복원
                                            if (e.target.value === '' || parseInt(e.target.value) === 0) {
                                              updateSpaceDetailSize(
                                                space.id,
                                                index,
                                                space.defaultWidth,
                                                null
                                              );
                                            }
                                          }}
                                          className="mt-1"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <label className="text-xs text-muted-foreground">
                                          세로 (mm)
                                        </label>
                                        <Input
                                          type="number"
                                          value={detail.height}
                                          onChange={(e) => {
                                            const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                                            updateSpaceDetailSize(
                                              space.id,
                                              index,
                                              null,
                                              value
                                            );
                                          }}
                                          onFocus={(e) => e.target.select()}
                                          onBlur={(e) => {
                                            // 빈 값이거나 0이면 기본값으로 복원
                                            if (e.target.value === '' || parseInt(e.target.value) === 0) {
                                              updateSpaceDetailSize(
                                                space.id,
                                                index,
                                                null,
                                                space.defaultHeight
                                              );
                                            }
                                          }}
                                          className="mt-1"
                                        />
                                      </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      적용 사이즈: {roundUpTo100(detail.width)}×{roundUpTo100(detail.height)}mm (100mm 단위 올림)
                                    </p>
                                  </>
                                )}
                                {/* 실측사이즈 미입력 시 기본 사이즈 표시 */}
                                {!getShowSizeInput(space.id) && (
                                  <p className="text-xs text-muted-foreground">
                                    기본 사이즈: {detail.width}×{detail.height}mm
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={prevStep} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" />
                이전
              </Button>
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex-1"
              >
                다음
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: 옵션 선택 */}
        {state.step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">옵션 선택</h2>
            </div>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold">번호키 추가</h3>
                    <p className="text-sm text-primary font-medium">
                      +{NUMBER_KEY_PRICE.toLocaleString()}원/개
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateNumberKeyCount(state.numberKeyCount - 1)
                      }
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-bold">
                      {state.numberKeyCount}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateNumberKeyCount(state.numberKeyCount + 1)
                      }
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-lg">
                  <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    크리세트(자동잠금장치) 기본포함, 번호키는 옵션 추가
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={prevStep} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" />
                이전
              </Button>
              <Button onClick={nextStep} className="flex-1">
                견적 확인
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: 견적 결과 */}
        {state.step === 6 && (
          <div className="space-y-6" ref={resultAreaRef}>
            <div>
              <h2 className="text-xl font-bold mb-2">견적 결과</h2>
              {state.completedQuotes.length === 0 ? (
                <p className="text-muted-foreground">안전방범·추락방지 방충망 견적</p>
              ) : (
                <ol className="text-muted-foreground space-y-0.5 text-sm list-none">
                  <li>1. 안전방충망 견적</li>
                  {state.completedQuotes.map((q, i) => (
                    <li key={q.id}>{i + 2}. {q.productName} 견적</li>
                  ))}
                </ol>
              )}
            </div>

            {(() => {
              const { items, productTotal, numberKeyTotal, total } =
                calculateTotal();
              const brandInfo = brands.find((b) => b.id === state.brand);
              const installInfo = installTypes.find(
                (i) => i.id === state.installType
              );
              const completedTotal = state.completedQuotes.reduce((s, q) => s + q.total, 0);
              const grandTotal = completedTotal + total;

              return (
                <>
                  <Card>
                    <CardContent className="p-5 space-y-4">
                      <div className="text-center pb-4 border-b">
                        <p className="text-sm text-muted-foreground mb-1">예상 견적 결과</p>
                        <p className="text-xs text-muted-foreground">
                          정확한 최종 견적은 방문 실측 후 확정됩니다. (예상 견적은 참고용)
                        </p>
                      </div>

                      {/* 선택 내역 1: 현재 상품 (안전방충망) */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-sm">
                          {state.completedQuotes.length > 0 ? '선택 내역 1 : 안전방충망' : '선택 내역'}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">적용 브랜드</span>
                            <span className="font-medium">{brandInfo?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">설치유형</span>
                            <span className="font-medium">
                              {state.installType === 'lowFloor' ? '저층 / 방범 방충' : '고층 / 추락방지'} {state.meshType}
                            </span>
                          </div>
                          <div className="pt-1 space-y-1">
                            {items.map((item, index) => (
                              <div key={index} className="flex justify-between pl-2">
                                <span className="text-muted-foreground">· {item.spaceName} {item.detailIndex} ({item.width}×{item.height}mm)</span>
                                <span>{item.unitPrice.toLocaleString()}원</span>
                              </div>
                            ))}
                            {state.numberKeyCount > 0 && (
                              <div className="flex justify-between pl-2">
                                <span className="text-muted-foreground">· 번호키</span>
                                <span>{NUMBER_KEY_PRICE.toLocaleString()}원×{state.numberKeyCount}개</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between pt-3 border-t">
                        <span className="font-bold">{state.completedQuotes.length > 0 ? '안전방충망 소계' : '총 시공 견적'}</span>
                        <span className="font-bold text-lg">{total.toLocaleString()}원</span>
                      </div>

                      {/* 선택 내역 2, 3...: 완료된 상품들 */}
                      {state.completedQuotes.map((q, i) => (
                        <div key={q.id} className="space-y-3 pt-4 border-t">
                          <h4 className="font-bold text-sm">선택 내역 {i + 2} : {q.productName}</h4>
                          <div className="space-y-2 text-sm">
                            {q.displayDetails.map((d, j) => (
                              <div key={j} className={`flex justify-between ${d.indent ? 'pl-3' : ''}`}>
                                <span className="text-muted-foreground">{d.label}</span>
                                <span className="font-medium text-right">{d.value}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between pt-2 border-t">
                            <span className="font-bold">{q.productName} 소계</span>
                            <span className="font-bold">{q.total.toLocaleString()}원</span>
                          </div>
                        </div>
                      ))}

                      {/* 합산 견적 내역 */}
                      {state.completedQuotes.length > 0 && (
                        <div className="p-3 bg-secondary/30 rounded-lg space-y-2 text-sm border-t pt-4">
                          <p className="text-xs font-bold text-muted-foreground">합산 견적 내역</p>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">안전방충망 ({brandInfo?.name})</span>
                            <span>{total.toLocaleString()}원</span>
                          </div>
                          {state.completedQuotes.map(q => (
                            <div key={q.id} className="flex justify-between">
                              <span className="text-muted-foreground">{q.label}</span>
                              <span>{q.total.toLocaleString()}원</span>
                            </div>
                          ))}
                          <div className="flex justify-between font-bold border-t pt-2">
                            <span>합산 총액</span>
                            <span>{grandTotal.toLocaleString()}원</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 에누리 */}
                  {(() => {
                    const baseTotal = state.completedQuotes.length > 0 ? grandTotal : total;
                    const discountedTotal = discountPercent > 0 ? applyDiscount(baseTotal, discountPercent) : null;
                    return (
                      <Card className="border-orange-200">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-orange-600">에누리</span>
                            <Button
                              size="sm"
                              variant={showDiscountInput ? "default" : "outline"}
                              className="h-8 px-3 text-sm border-orange-300 text-orange-600 hover:bg-orange-50"
                              onClick={() => {
                                if (showDiscountInput) {
                                  resetDiscount();
                                } else {
                                  setShowDiscountInput(true);
                                }
                              }}
                            >
                              {showDiscountInput ? '취소' : '에누리 적용'}
                            </Button>
                          </div>
                          {showDiscountInput && (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                placeholder="할인율 입력"
                                value={discountInputValue}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setDiscountInputValue(v);
                                  const n = parseFloat(v);
                                  setDiscountPercent(!isNaN(n) && n > 0 ? n : 0);
                                }}
                                className="h-9 w-32 text-center"
                              />
                              <span className="text-sm font-medium">%</span>
                            </div>
                          )}
                          {discountedTotal !== null && discountPercent > 0 && (
                            <div className="space-y-1 pt-1 border-t text-sm">
                              <div className="flex justify-between text-muted-foreground">
                                <span>원래 견적</span>
                                <span>{baseTotal.toLocaleString()}원</span>
                              </div>
                              <div className="flex justify-between text-red-500">
                                <span>에누리 ({discountPercent}%)</span>
                                <span>-{(baseTotal - discountedTotal).toLocaleString()}원</span>
                              </div>
                              <div className="flex justify-between font-bold text-lg pt-1 border-t text-orange-600">
                                <span>에누리 적용가</span>
                                <span>{discountedTotal.toLocaleString()}원</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })()}

                  {/* 다른 상품 추가 버튼 */}
                  <Button
                    className="w-full h-12 font-semibold"
                    variant="outline"
                    onClick={() => {
                      const { items: addItems, total: t } = calculateTotal();
                      let sectionText = `[안전방충망]\n`;
                      sectionText += `브랜드: ${brandInfo?.name}\n`;
                      sectionText += `설치유형: ${installInfo?.name} (${state.meshType})\n`;
                      addItems.forEach((item) => {
                        sectionText += `- ${item.spaceName} ${item.detailIndex} (${item.width}×${item.height}mm): ${item.unitPrice.toLocaleString()}원\n`;
                      });
                      if (state.numberKeyCount > 0) {
                        sectionText += `- 번호키: ${NUMBER_KEY_PRICE.toLocaleString()}원 × ${state.numberKeyCount}개\n`;
                      }
                      sectionText += `소계: ${t.toLocaleString()}원`;
                      const ssDisplayDetails: CompletedQuote['displayDetails'] = [
                        { label: '적용 브랜드', value: brandInfo?.name ?? '' },
                        { label: '설치유형', value: `${state.installType === 'lowFloor' ? '저층 / 방범 방충' : '고층 / 추락방지'} ${state.meshType}` },
                        ...addItems.map(item => ({
                          label: `· ${item.spaceName} ${item.detailIndex}`,
                          value: `(${item.width}×${item.height}mm) ${item.unitPrice.toLocaleString()}원`,
                          indent: true,
                        })),
                        ...(state.numberKeyCount > 0 ? [{ label: '· 번호키', value: `${NUMBER_KEY_PRICE.toLocaleString()}원 × ${state.numberKeyCount}개`, indent: true }] : []),
                      ];
                      addToCompletedQuotes({
                        id: Date.now().toString(),
                        label: `안전방충망 (${brandInfo?.name})`,
                        productName: '안전방충망',
                        total: t,
                        sectionText,
                        type: 'safetyScreen',
                        displayDetails: ssDisplayDetails,
                      });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    다른 상품 추가하기
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={copyQuote}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 mr-2" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {copied ? "복사됨" : "견적 복사"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={captureQuote}
                      disabled={capturing}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {capturing ? "캡처 중..." : "견적 캡처"}
                    </Button>
                  </div>

                  {state.completedQuotes.some(q => q.type === 'glassRailing') && (
                    <Card className="bg-primary/10 border-primary/30">
                      <CardContent className="p-4">
                        <h4 className="font-bold text-base mb-3 text-primary">유리난간 견적 포함사항</h4>
                        <ul className="text-sm space-y-2">
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="font-medium">고구려 안전방충망(0.4mm) 설치 포함 (거실)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>고구려 안전방충망, 행위허가 대행비용, 입주민동의서 대행비용, 부가세가 모두 포함된 금액입니다.</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-secondary/50">
                    <CardContent className="p-4">
                      <h4 className="font-bold text-sm mb-2">안내 사항</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {Array.from(new Set([
                          ...state.completedQuotes.flatMap(q => PRODUCT_NOTICES[q.type]),
                          ...PRODUCT_NOTICES['safetyScreen'],
                        ])).map((notice, i) => (
                          <li key={i}>• {notice}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={resetAll}
                      className="flex-1"
                    >
                      처음으로
                    </Button>
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      수정하기
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </main>

      {/* 푸터 - 결과 페이지에서만 표시 */}
      {(state.step === 6 || (state.step === 3 && (state.quoteType === 'glassRailing' || state.quoteType === 'huperOptik' || state.quoteType === 'blackScreenMesh'))) && (
        <footer className="border-t mt-12 py-6">
          <div className="max-w-lg mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/elephant-logo2.png"
                  alt="코끼리시스템 로고"
                  className="h-14 w-auto"
                />
                <span className="font-medium text-base">코끼리시스템</span>
              </div>
              <a
                href="tel:1555-0143"
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                1555-0143
              </a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
