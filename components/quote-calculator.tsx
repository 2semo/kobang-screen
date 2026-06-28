"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Phone,
  MapPin,
  User,
  CalendarDays,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import {
  brands,
  meshTypes,
  installTypes,
  spaces,
  NUMBER_KEY_PRICE,
  getPrice,
  roundUpTo100,
  blackScreenServiceOptions,
  getBlackScreenPrice,
  getRollScreenPrice,
  BLACK_SCREEN_MIN_PRICE,
  BLACK_SCREEN_FEATURES,
  type BrandType,
  type MeshType,
  type InstallType,
  type SpaceType,
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

type QuoteType = "safetyScreen" | "blackScreenMesh" | "mixed";

interface ApplicationForm {
  name: string;
  phone: string;
  address: string;
  preferredDate: string;
  memo: string;
}

interface QuoteState {
  step: number;
  quoteType: QuoteType | null;
  // 안전방충망
  brand: BrandType | null;
  installType: InstallType | null;
  meshType: MeshType | null;
  spaceItems: SpaceItem[];
  numberKeyCount: number;
  // 블랙스텐 방충망
  blackScreenServiceType: BlackScreenServiceType | null;
  blackScreenLargeCount: number;
  blackScreenMediumCount: number;
  blackScreenRollCount: number;
}

const PRODUCT_NOTICES: Record<QuoteType, string[]> = {
  safetyScreen: [
    "최종 금액은 방문 실측 후 확정될 수 있습니다.",
    "서울·경기 지역만 시공 가능합니다.",
    "특수 창호/사이즈는 별도 실측후 견적 가능 (기본가격은 슬라이딩 도어)",
    "설치수량 2개 이하 / 지역에 따라서 추가 출장비 발생할 수 있습니다.",
    "모든 계산은 100mm(10cm) 단위 올림이 적용됩니다.",
  ],
  blackScreenMesh: [
    "최소 시공가 20만원 이상만 가능합니다.",
    "특대창·특수창·실외기·방범창제거·설치난이도에 따라 별도 견적이 발생할 수 있습니다.",
    "이건창호는 제외됩니다.",
  ],
  mixed: [
    "안전방충망의 최종 금액은 방문 실측 후 확정될 수 있습니다.",
    "안전방충망은 서울·경기 지역만 시공 가능합니다.",
    "블랙스텐 방충망 최소 시공가 20만원 이상만 가능합니다.",
    "안전방충망: 특수 창호/사이즈는 별도 실측후 견적 가능합니다.",
    "이건창호는 제외됩니다.",
  ],
};

const initialState: QuoteState = {
  step: 1,
  quoteType: null,
  brand: null,
  installType: null,
  meshType: null,
  spaceItems: [],
  numberKeyCount: 0,
  blackScreenServiceType: null,
  blackScreenLargeCount: 0,
  blackScreenMediumCount: 0,
  blackScreenRollCount: 0,
};

const availableMeshTypes: Record<BrandType, Record<InstallType, MeshType[]>> = {
  goguryeo: {
    highFloor: ["0.4mm-16mesh"],
    lowFloor: ["0.6mm"],
  },
  js: {
    highFloor: ["0.4mm-16mesh", "0.4mm-20mesh"],
    lowFloor: ["0.6mm", "0.7mm-14mesh"],
  },
};

// 스텝 흐름:
// blackScreenMesh: 1(선택) → 2(서비스+수량) → 3(결과) → 4(신청폼)
// safetyScreen:    1(선택) → 2(브랜드) → 3(설치환경) → 4(공간) → 5(옵션) → 6(결과) → 7(신청폼)
// mixed:           1(선택) → 2(블랙스텐설정) → 3(브랜드) → 4(설치환경) → 5(공간) → 6(옵션) → 7(통합결과) → 8(신청폼)

export default function QuoteCalculator() {
  const [state, setState] = useState<QuoteState>(initialState);
  const [copied, setCopied] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [showShareButtons, setShowShareButtons] = useState(false);
  const [appForm, setAppForm] = useState<ApplicationForm>({
    name: "",
    phone: "",
    address: "",
    preferredDate: "",
    memo: "",
  });
  const [appSubmitted, setAppSubmitted] = useState(false);
  const [appSubmitting, setAppSubmitting] = useState(false);
  const resultAreaRef = useRef<HTMLDivElement>(null);

  const saveQuoteMutation = useMutation(api.quotes.saveQuote);
  const saveApplicationMutation = useMutation(api.applications.saveApplication);
  const quoteSavedRef = useRef(false);

  const updateState = useCallback((updates: Partial<QuoteState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({ ...prev, step: prev.step + 1 }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({ ...prev, step: prev.step - 1 }));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      updateState({ step });
    },
    [updateState]
  );

  const resetAll = useCallback(() => {
    setState(initialState);
    setAppForm({ name: "", phone: "", address: "", preferredDate: "", memo: "" });
    setAppSubmitted(false);
    quoteSavedRef.current = false;
  }, []);

  // 결과 페이지 도달 시 견적 저장 (1회만)
  useEffect(() => {
    const isOnResultStep =
      (state.quoteType === "blackScreenMesh" && state.step === 3) ||
      (state.quoteType === "safetyScreen" && state.step === 6) ||
      (state.quoteType === "mixed" && state.step === 7);

    if (!isOnResultStep || quoteSavedRef.current) return;
    quoteSavedRef.current = true;

    const { text: quoteSummary, total } = getQuoteSummary();

    fetch("https://ip-api.com/json/?fields=regionName,city,status&lang=ko")
      .then((r) => r.json())
      .then((geo) => {
        void saveQuoteMutation({
          quoteType: state.quoteType ?? "",
          brand: state.brand ?? undefined,
          meshType: state.meshType ?? undefined,
          installType: state.installType ?? undefined,
          total,
          quoteSummary,
          region: geo.status === "success" ? geo.regionName : undefined,
          city: geo.status === "success" ? geo.city : undefined,
        }).catch(() => {});
      })
      .catch(() => {
        void saveQuoteMutation({
          quoteType: state.quoteType ?? "",
          brand: state.brand ?? undefined,
          meshType: state.meshType ?? undefined,
          installType: state.installType ?? undefined,
          total,
          quoteSummary,
        }).catch(() => {});
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step, state.quoteType]);

  const selectBrand = useCallback(
    (brand: BrandType) => {
      updateState({ brand, installType: null, meshType: null });
    },
    [updateState]
  );

  const selectInstallType = useCallback(
    (installType: InstallType) => {
      if (!state.brand) return;
      const available = availableMeshTypes[state.brand][installType];
      const autoMeshType = available.length === 1 ? available[0] : null;
      updateState({ installType, meshType: autoMeshType });
    },
    [state.brand, updateState]
  );

  const selectMeshType = useCallback(
    (meshType: MeshType) => {
      updateState({ meshType });
    },
    [updateState]
  );

  const updateSpaceItem = useCallback((spaceType: SpaceType, count: number) => {
    setState((prev) => {
      const idx = prev.spaceItems.findIndex((i) => i.spaceType === spaceType);
      const spaceInfo = spaces.find((s) => s.id === spaceType)!;

      if (count <= 0) {
        return { ...prev, spaceItems: prev.spaceItems.filter((i) => i.spaceType !== spaceType) };
      }

      if (idx >= 0) {
        const existing = prev.spaceItems[idx];
        let newDetails = [...existing.details];
        if (count > existing.count) {
          for (let i = existing.count; i < count; i++) {
            newDetails.push({ id: `${spaceType}-${Date.now()}-${i}`, width: spaceInfo.defaultWidth, height: spaceInfo.defaultHeight });
          }
        } else {
          newDetails = newDetails.slice(0, count);
        }
        const updated = [...prev.spaceItems];
        updated[idx] = { ...existing, count, details: newDetails };
        return { ...prev, spaceItems: updated };
      }

      const details: SpaceItemDetail[] = Array.from({ length: count }, (_, i) => ({
        id: `${spaceType}-${Date.now()}-${i}`,
        width: spaceInfo.defaultWidth,
        height: spaceInfo.defaultHeight,
      }));
      return { ...prev, spaceItems: [...prev.spaceItems, { id: `${spaceType}-${Date.now()}`, spaceType, count, details }] };
    });
  }, []);

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

  const updateNumberKeyCount = useCallback(
    (count: number) => {
      updateState({ numberKeyCount: Math.max(0, count) });
    },
    [updateState]
  );

  const toggleSizeInput = useCallback((spaceType: SpaceType) => {
    setState((prev) => ({
      ...prev,
      spaceItems: prev.spaceItems.map((item) => {
        if (item.spaceType !== spaceType) return item;
        return { ...item, showSizeInput: !item.showSizeInput };
      }),
    }));
  }, []);

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
        const price = getPrice(state.brand!, state.meshType!, detail.width, detail.height);
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
    return { items, productTotal, numberKeyTotal, total: productTotal + numberKeyTotal };
  }, [state.brand, state.meshType, state.spaceItems, state.numberKeyCount]);

  const getQuoteSummary = useCallback((): { text: string; total: number } => {
    if (state.quoteType === "blackScreenMesh") {
      const svcOption = blackScreenServiceOptions.find((o) => o.id === state.blackScreenServiceType);
      const isRoll = state.blackScreenServiceType === "rollScreen";
      const lines: string[] = [`서비스: ${svcOption?.name ?? ""}`];
      let total = 0;

      if (isRoll) {
        const info = getRollScreenPrice(state.blackScreenRollCount);
        total = info.total;
        lines.push(`롤방충망 ${state.blackScreenRollCount}장: ${total.toLocaleString()}원`);
      } else if (state.blackScreenServiceType === "meshOnly" || state.blackScreenServiceType === "frameAndMesh") {
        const info = getBlackScreenPrice(state.blackScreenServiceType, state.blackScreenLargeCount, state.blackScreenMediumCount);
        total = info.total;
        if (state.blackScreenLargeCount > 0) lines.push(`대형 ${state.blackScreenLargeCount}장 × ${info.largeUnitPrice.toLocaleString()}원`);
        if (state.blackScreenMediumCount > 0) lines.push(`중형 ${state.blackScreenMediumCount}장 × ${info.mediumUnitPrice.toLocaleString()}원`);
      }
      lines.push(`견적 합계: ${total.toLocaleString()}원`);
      return { text: `[블랙스텐 방충망]\n${lines.join("\n")}`, total };
    }

    if (state.quoteType === "safetyScreen") {
      const { items, total } = calculateTotal();
      const brandInfo = brands.find((b) => b.id === state.brand);
      const lines: string[] = [
        `브랜드: ${brandInfo?.name ?? ""}`,
        `설치유형: ${state.installType === "lowFloor" ? "저층/방범" : "고층/추락방지"} (${state.meshType})`,
        ...items.map((item) => `  ${item.spaceName} ${item.detailIndex} (${item.width}×${item.height}mm): ${item.unitPrice.toLocaleString()}원`),
        ...(state.numberKeyCount > 0 ? [`  번호키 ${state.numberKeyCount}개: ${(NUMBER_KEY_PRICE * state.numberKeyCount).toLocaleString()}원`] : []),
        `견적 합계: ${total.toLocaleString()}원`,
      ];
      return { text: `[안전방충망]\n${lines.join("\n")}`, total };
    }

    if (state.quoteType === "mixed") {
      const svcOption = blackScreenServiceOptions.find((o) => o.id === state.blackScreenServiceType);
      const isRoll = state.blackScreenServiceType === "rollScreen";
      const blackLines: string[] = [`서비스: ${svcOption?.name ?? ""}`];
      let blackTotal = 0;

      if (isRoll) {
        const info = getRollScreenPrice(state.blackScreenRollCount);
        blackTotal = info.total;
        blackLines.push(`롤방충망 ${state.blackScreenRollCount}장: ${blackTotal.toLocaleString()}원`);
      } else if (state.blackScreenServiceType === "meshOnly" || state.blackScreenServiceType === "frameAndMesh") {
        const info = getBlackScreenPrice(state.blackScreenServiceType, state.blackScreenLargeCount, state.blackScreenMediumCount);
        blackTotal = info.total;
        if (state.blackScreenLargeCount > 0) blackLines.push(`대형 ${state.blackScreenLargeCount}장 × ${info.largeUnitPrice.toLocaleString()}원`);
        if (state.blackScreenMediumCount > 0) blackLines.push(`중형 ${state.blackScreenMediumCount}장 × ${info.mediumUnitPrice.toLocaleString()}원`);
      }

      const { items, total: safetyTotal } = calculateTotal();
      const brandInfo = brands.find((b) => b.id === state.brand);
      const safetyLines: string[] = [
        `브랜드: ${brandInfo?.name ?? ""}`,
        `설치유형: ${state.installType === "lowFloor" ? "저층/방범" : "고층/추락방지"} (${state.meshType})`,
        ...items.map((item) => `  ${item.spaceName} ${item.detailIndex} (${item.width}×${item.height}mm): ${item.unitPrice.toLocaleString()}원`),
        ...(state.numberKeyCount > 0 ? [`  번호키 ${state.numberKeyCount}개: ${(NUMBER_KEY_PRICE * state.numberKeyCount).toLocaleString()}원`] : []),
      ];

      const combinedTotal = blackTotal + safetyTotal;
      const text = `[블랙스텐 방충망]\n${blackLines.join("\n")}\n소계: ${blackTotal.toLocaleString()}원\n\n[안전방충망]\n${safetyLines.join("\n")}\n소계: ${safetyTotal.toLocaleString()}원\n\n합계: ${combinedTotal.toLocaleString()}원`;
      return { text, total: combinedTotal };
    }

    return { text: "", total: 0 };
  }, [state, calculateTotal]);

  const copySafetyScreenQuote = useCallback(() => {
    const { items, total } = calculateTotal();
    const brandInfo = brands.find((b) => b.id === state.brand);
    const installInfo = installTypes.find((i) => i.id === state.installType);
    let text = `[안전방충망 견적서]\n\n[안전방충망]\n`;
    text += `브랜드: ${brandInfo?.name}\n`;
    text += `설치유형: ${installInfo?.name} (${state.meshType})\n\n[상세 내역]\n`;
    items.forEach((item) => {
      text += `- ${item.spaceName} ${item.detailIndex} (${item.width}×${item.height}mm): ${item.unitPrice.toLocaleString()}원\n`;
    });
    if (state.numberKeyCount > 0) {
      text += `- 번호키: ${NUMBER_KEY_PRICE.toLocaleString()}원 × ${state.numberKeyCount}개 = ${(NUMBER_KEY_PRICE * state.numberKeyCount).toLocaleString()}원\n`;
    }
    text += `\n*총 시공 견적: ${total.toLocaleString()}원\n\n[안내사항]\n`;
    PRODUCT_NOTICES["safetyScreen"].forEach((n) => { text += `• ${n}\n`; });
    text += `\n문자문의: Kobang 010-5638-3869`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [calculateTotal, state.brand, state.installType, state.meshType, state.numberKeyCount]);

  const captureQuote = useCallback(async () => {
    if (!resultAreaRef.current) return;
    setCapturing(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(resultAreaRef.current, {
        scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false,
      });
      const link = document.createElement("a");
      link.download = "Kobang_견적서.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("[captureQuote] 캡처 실패:", e);
      alert("캡처에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setCapturing(false);
    }
  }, []);

  const getSpaceCount = (spaceType: SpaceType) => state.spaceItems.find((i) => i.spaceType === spaceType)?.count || 0;
  const getSpaceDetails = (spaceType: SpaceType) => state.spaceItems.find((i) => i.spaceType === spaceType)?.details || [];
  const getShowSizeInput = (spaceType: SpaceType) => state.spaceItems.find((i) => i.spaceType === spaceType)?.showSizeInput || false;
  const getAvailableMeshTypes = () => (state.brand && state.installType ? availableMeshTypes[state.brand][state.installType] : []);
  const getMeshTypeInfo = (meshType: MeshType) => (state.brand ? meshTypes[state.brand].find((m) => m.id === meshType) : null);

  const canProceed = () => {
    if (state.quoteType === "safetyScreen") {
      if (state.step === 2) return state.brand !== null;
      if (state.step === 3) return state.installType !== null && state.meshType !== null;
      if (state.step === 4) return state.spaceItems.length > 0;
    }
    if (state.quoteType === "mixed") {
      if (state.step === 3) return state.brand !== null;
      if (state.step === 4) return state.installType !== null && state.meshType !== null;
      if (state.step === 5) return state.spaceItems.length > 0;
    }
    return true;
  };

  const formatPhone = (value: string) => {
    const nums = value.replace(/\D/g, "");
    if (nums.length <= 3) return nums;
    if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
    return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7, 11)}`;
  };

  const canSubmitApp =
    appForm.name.trim().length >= 1 &&
    appForm.phone.replace(/\D/g, "").length >= 10 &&
    appForm.address.trim().length >= 3;

  const submitApplication = useCallback(async () => {
    if (!canSubmitApp) return;
    setAppSubmitting(true);
    const { text: quoteSummary, total: quoteTotal } = getQuoteSummary();
    try {
      await Promise.all([
        fetch("/api/submit-application", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quoteType: state.quoteType, quoteSummary, quoteTotal, ...appForm }),
        }),
        saveApplicationMutation({
          name: appForm.name,
          phone: appForm.phone,
          address: appForm.address,
          preferredDate: appForm.preferredDate || undefined,
          memo: appForm.memo || undefined,
          quoteType: state.quoteType ?? "",
          quoteSummary,
          quoteTotal,
        }),
      ]);
    } catch {
      // 제출 실패해도 성공 화면 표시
    } finally {
      setAppSubmitting(false);
      setAppSubmitted(true);
    }
  }, [canSubmitApp, getQuoteSummary, appForm, state.quoteType, saveApplicationMutation]);

  const isApplyFormStep =
    (state.quoteType === "blackScreenMesh" && state.step === 4) ||
    (state.quoteType === "safetyScreen" && state.step === 7) ||
    (state.quoteType === "mixed" && state.step === 8);

  const applyStep = state.quoteType === "blackScreenMesh" ? 4 : state.quoteType === "mixed" ? 8 : 7;
  const resultStep = state.quoteType === "blackScreenMesh" ? 3 : state.quoteType === "mixed" ? 7 : 6;

  // ── 오늘 날짜 (min date for date picker) ──
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-0">
            <img src="/kobang-logo.png" alt="Kobang 로고" className="h-16 w-auto" />
            <span className="font-bold text-lg leading-tight -ml-1">Kobang</span>
          </div>
          <img src="/koggiri.png" alt="KOGGIRI 로고" className="h-[58px] w-auto" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* ── 신청 완료 화면 ── */}
        {appSubmitted && (
          <div className="space-y-6 py-8 text-center">
            <div className="flex justify-center">
              <CheckCircle2 className="w-20 h-20 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">신청이 완료되었습니다!</h2>
              <p className="text-muted-foreground leading-relaxed">
                빠른 시일 내에 연락드리겠습니다.<br />
                문의사항은 아래 번호로 문자 주세요.
              </p>
            </div>

            <Card className="bg-primary/5 border-primary/20 text-left">
              <CardContent className="p-4 space-y-3">
                <p className="font-bold text-sm text-primary">접수 내용</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{appForm.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{appForm.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span>{appForm.address}</span>
                  </div>
                  {appForm.preferredDate && (
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span>{appForm.preferredDate} 시공 희망</span>
                    </div>
                  )}
                  {appForm.memo && (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="whitespace-pre-wrap">{appForm.memo}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <a
              href="sms:010-5638-3869"
              className="flex items-center justify-center gap-2 w-full h-12 bg-primary text-primary-foreground rounded-lg font-bold text-base hover:bg-primary/90 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              010-5638-3869 문자문의
            </a>
            <Button variant="outline" onClick={resetAll} className="w-full">
              처음으로 돌아가기
            </Button>
          </div>
        )}

        {!appSubmitted && (
          <>
            {/* ── 진행 바: 안전방충망 (step 2~5) ── */}
            {state.quoteType === "safetyScreen" && state.step >= 2 && state.step <= 5 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">단계 {state.step - 1} / 4</span>
                  <span className="text-sm font-medium text-primary">{Math.round(((state.step - 1) / 5) * 100)}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((state.step - 1) / 5) * 100}%` }} />
                </div>
              </div>
            )}

            {/* ── 진행 바: 블랙스텐 (step 2) ── */}
            {state.quoteType === "blackScreenMesh" && state.step === 2 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">옵션 선택 중</span>
                  <span className="text-sm font-medium text-primary">50%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: "50%" }} />
                </div>
              </div>
            )}

            {/* ── 진행 바: 혼합 (step 2~6) ── */}
            {state.quoteType === "mixed" && state.step >= 2 && state.step <= 6 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {state.step === 2 ? "① 블랙스텐 설정" : `② 안전방충망 설정 (${state.step - 2}/4)`}
                  </span>
                  <span className="text-sm font-medium text-primary">{Math.round(((state.step - 1) / 7) * 100)}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((state.step - 1) / 7) * 100}%` }} />
                </div>
              </div>
            )}

            {/* ════════════════════════════════
                Step 1: 상품 선택 (인트로)
                ════════════════════════════════ */}
            {state.step === 1 && (
              <div className="space-y-6 py-4">
                {/* 히어로 영상 */}
                <div className="rounded-xl overflow-hidden -mx-4 sm:mx-0 aspect-[3/4]">
                  <video
                    src="/hero.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold">방충망 셀프 견적</h1>
                  <p className="text-muted-foreground leading-relaxed">
                    원하시는 방충망을 선택하면<br />
                    <strong className="text-foreground">3분 안에</strong> 예상 견적을 확인할 수 있어요.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* 블랙스텐 방충망 ─ 1순위 */}
                  <Card
                    className="border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                    onClick={() => { updateState({ quoteType: "blackScreenMesh" }); nextStep(); }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-lg text-primary">블랙스텐 방충망 교체</span>
                          <Badge className="text-xs bg-primary ml-2">인기</Badge>
                          <p className="text-sm text-muted-foreground mt-1">미세촘촘 · 탁월한 시야 · 내구성 우수</p>
                          <p className="text-sm text-muted-foreground">망교체 / 틀제작+망교체 / 롤방충망</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <img src="/blackscreen-mesh.png" alt="블랙스텐 방충망" className="w-20 h-20 object-cover rounded-lg" />
                          <ArrowRight className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 안전방충망 ─ 2순위 */}
                  <Card
                    className="border-2 hover:border-primary/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => { updateState({ quoteType: "safetyScreen" }); nextStep(); }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-lg">안전방충망 설치</span>
                          <p className="text-sm text-muted-foreground mt-1">추락방지 · 방범 겸용</p>
                          <p className="text-sm text-muted-foreground">고구려시스템 · JS안전방충망</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex gap-2">
                            <img src="/brand-goguryeo.png" alt="고구려시스템" className="w-[68px] h-20 object-cover rounded-lg border border-border" />
                            <img src="/brand-js.png" alt="JS안전방충망" className="w-[68px] h-20 object-cover rounded-lg border border-border" />
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 혼합 견적 ─ 3순위 */}
                  <Card
                    className="border-2 border-dashed hover:border-primary/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => { updateState({ quoteType: "mixed" }); nextStep(); }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-bold text-lg">혼합 견적</span>
                            <Badge variant="outline" className="text-xs">블랙스텐 + 안전방충망</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">공간별로 두 가지 방충망을 함께 견적</p>
                          <p className="text-sm text-muted-foreground">예) 거실·방1 안전방충망 / 방2·다용도실 블랙스텐</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="rounded-lg overflow-hidden border border-border">
                            <div className="flex">
                              <img src="/brand-goguryeo.png" alt="고구려시스템" className="w-[56px] h-[68px] object-cover" />
                              <div className="w-px bg-border" />
                              <img src="/brand-js.png" alt="JS안전방충망" className="w-[56px] h-[68px] object-cover" />
                            </div>
                            <div className="h-px bg-border" />
                            <img src="/blackscreen-mesh.png" alt="블랙스텐" className="w-full h-[36px] object-cover object-bottom" />
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-secondary/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        예상 견적은 대표 사이즈 기준으로 계산됩니다. 정확한 견적은 방문 실측 후 확정됩니다.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ════════════════════════════════
                Step 2: 안전방충망 ─ 브랜드 선택
                ════════════════════════════════ */}
            {((state.step === 2 && state.quoteType === "safetyScreen") || (state.step === 3 && state.quoteType === "mixed")) && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-2">브랜드 선택</h2>
                  <p className="text-muted-foreground">원하시는 브랜드를 선택해주세요</p>
                  {state.quoteType === "mixed" && (
                    <Badge className="mt-2 bg-primary/20 text-primary border-primary/30">혼합 견적 2단계: 안전방충망 선택</Badge>
                  )}
                </div>

                <div className="space-y-4">
                  {brands.map((brand) => {
                    const brandImage = brand.id === "goguryeo" ? "/brand-goguryeo.png" : "/brand-js.png";
                    return (
                    <Card
                      key={brand.id}
                      className={`cursor-pointer transition-all ${state.brand === brand.id ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"}`}
                      onClick={() => selectBrand(brand.id)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg">{brand.name}</h3>
                            <p className="text-sm text-muted-foreground">{brand.description}</p>
                          </div>
                          {state.brand === brand.id && (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <img
                          src={brandImage}
                          alt={`${brand.name} 상품 이미지`}
                          className="w-full rounded-lg mb-3 object-cover"
                        />
                        <div className="flex flex-wrap gap-2 mb-3">
                          {brand.features.slice(0, 4).map((f) => (
                            <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                          ))}
                        </div>
                        <p className="text-sm text-primary font-medium">{brand.highlight}</p>
                      </CardContent>
                    </Card>
                    );
                  })}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={prevStep} className="flex-1">
                    <ChevronLeft className="w-4 h-4 mr-1" />이전
                  </Button>
                  <Button onClick={nextStep} disabled={!canProceed()} className="flex-1">
                    다음<ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* ════════════════════════════════
                Step 2: 블랙스텐 ─ 서비스 + 수량
                ════════════════════════════════ */}
            {state.step === 2 && (state.quoteType === "blackScreenMesh" || state.quoteType === "mixed") && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-2">블랙스텐 미세촘촘 방충망</h2>
                  <p className="text-muted-foreground">서비스 종류를 선택하고 수량을 입력해주세요</p>
                </div>

                {/* 혼합 견적: 안전방충망 선택 박스 (상단) */}
                {state.quoteType === "mixed" && (
                  <Card className="border-2 border-blue-200 bg-blue-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">② 다음 단계</span>
                          </div>
                          <p className="font-bold text-blue-700">안전방충망 선택</p>
                          <p className="text-xs text-muted-foreground mt-0.5">브랜드 · 설치환경 · 공간/사이즈 선택</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-blue-300" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 서비스 타입 선택 */}
                <div className="space-y-3">
                  <h3 className="font-bold">{state.quoteType === "mixed" ? "① 블랙스텐망 교체 선택" : "서비스 종류"}</h3>
                  <div className="space-y-3">
                    {blackScreenServiceOptions.filter(o => state.quoteType === "mixed" ? o.id !== "rollScreen" : true).map((option) => (
                      <Card
                        key={option.id}
                        className={`cursor-pointer transition-all ${state.blackScreenServiceType === option.id ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"}`}
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
                          {option.id === "meshOnly" && (
                            <img
                              src="/blackscreen-mesh.png"
                              alt="블랙스텐망"
                              className="w-full rounded-lg mb-3"
                            />
                          )}
                          <div className="flex items-start justify-between">
                            <div className="flex-1 pr-2">
                              <h4 className="font-bold">{option.name}</h4>
                              <Badge variant="outline" className="mt-1 text-xs">{option.subtitle}</Badge>
                              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{option.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">A/S: {option.as}</p>
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

                {/* 수량 선택 ─ 망교체 / 틀제작+망교체 */}
                {(state.blackScreenServiceType === "meshOnly" || state.blackScreenServiceType === "frameAndMesh") &&
                  (() => {
                    const svc = state.blackScreenServiceType;
                    const priceInfo = getBlackScreenPrice(svc, state.blackScreenLargeCount, state.blackScreenMediumCount);
                    const totalCount = state.blackScreenLargeCount + state.blackScreenMediumCount;
                    const tierLabel = totalCount >= 6 ? "6장 이상 단가" : svc === "meshOnly" ? "3-5장 단가" : "1-5장 단가";
                    const belowMin = state.quoteType !== "mixed" && priceInfo.total > 0 && priceInfo.total < BLACK_SCREEN_MIN_PRICE;

                    return (
                      <div className="space-y-4 pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold">수량 선택</h3>
                          {totalCount > 0 && <Badge variant="secondary" className="text-xs">{tierLabel} 적용</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground -mt-2">
                          대형(높이 1600mm 이상)과 중형(높이 1600mm 미만) 혼합 선택 가능
                        </p>

                        {/* 대형/중형 구분 참고 이미지 */}
                        <div className="rounded-xl overflow-hidden border border-gray-200">
                          <img
                            src="/size-guide.png"
                            alt="대형(1600mm 이상) / 중형(1600mm 미만) 구분 기준"
                            className="w-full object-contain"
                          />
                        </div>

                        {/* 대형 카운터 */}
                        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                          <div>
                            <p className="font-bold text-sm">대형 <span className="font-normal text-muted-foreground">(높이 1600mm 이상)</span></p>
                            {totalCount > 0 && <p className="text-xs text-primary mt-0.5">{priceInfo.largeUnitPrice.toLocaleString()}원/장</p>}
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateState({ blackScreenLargeCount: Math.max(0, state.blackScreenLargeCount - 1) })}
                              disabled={state.blackScreenLargeCount === 0}
                              className="w-9 h-9 rounded-full border-2 border-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-40"
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
                            {totalCount > 0 && <p className="text-xs text-primary mt-0.5">{priceInfo.mediumUnitPrice.toLocaleString()}원/장</p>}
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateState({ blackScreenMediumCount: Math.max(0, state.blackScreenMediumCount - 1) })}
                              disabled={state.blackScreenMediumCount === 0}
                              className="w-9 h-9 rounded-full border-2 border-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-40"
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

                        {totalCount > 0 && (
                          <div className={`p-3 rounded-lg text-sm font-bold flex justify-between ${belowMin ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                            <span>예상 소계 (총 {totalCount}장)</span>
                            <span>{priceInfo.total.toLocaleString()}원{belowMin ? " ← 최소 20만원 미달" : ""}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                {/* 수량 선택 ─ 롤방충망 */}
                {state.blackScreenServiceType === "rollScreen" &&
                  (() => {
                    const rollInfo = getRollScreenPrice(state.blackScreenRollCount);
                    const tierLabel = state.blackScreenRollCount >= 6 ? "6장 이상 단가" : "1-5장 단가";
                    const belowMin = rollInfo.total > 0 && rollInfo.total < BLACK_SCREEN_MIN_PRICE;

                    return (
                      <div className="space-y-4 pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold">수량 선택</h3>
                          {state.blackScreenRollCount > 0 && <Badge variant="secondary" className="text-xs">{tierLabel} 적용</Badge>}
                        </div>

                        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                          <div>
                            <p className="font-bold text-sm">롤방충망</p>
                            {state.blackScreenRollCount > 0 && <p className="text-xs text-primary mt-0.5">{rollInfo.unitPrice.toLocaleString()}원/장</p>}
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateState({ blackScreenRollCount: Math.max(0, state.blackScreenRollCount - 1) })}
                              disabled={state.blackScreenRollCount === 0}
                              className="w-9 h-9 rounded-full border-2 border-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-40"
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
                          <div className={`p-3 rounded-lg text-sm font-bold flex justify-between ${belowMin ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                            <span>예상 소계 (총 {state.blackScreenRollCount}장)</span>
                            <span>{rollInfo.total.toLocaleString()}원{belowMin ? " ← 최소 20만원 미달" : ""}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={prevStep} className="flex-1">
                    <ChevronLeft className="w-4 h-4 mr-1" />이전
                  </Button>
                  <Button
                    onClick={() => nextStep()}
                    disabled={(() => {
                      if (!state.blackScreenServiceType) return true;
                      if (state.blackScreenServiceType === "rollScreen") {
                        return state.blackScreenRollCount === 0 || (state.quoteType !== "mixed" && getRollScreenPrice(state.blackScreenRollCount).total < BLACK_SCREEN_MIN_PRICE);
                      }
                      const info = getBlackScreenPrice(state.blackScreenServiceType, state.blackScreenLargeCount, state.blackScreenMediumCount);
                      return state.blackScreenLargeCount + state.blackScreenMediumCount === 0 || (state.quoteType !== "mixed" && info.total < BLACK_SCREEN_MIN_PRICE);
                    })()}
                    className="flex-1"
                  >
                    {state.quoteType === "mixed" ? <>안전방충망 선택<ChevronRight className="w-4 h-4 ml-1" /></> : <>견적 확인<ChevronRight className="w-4 h-4 ml-1" /></>}
                  </Button>
                </div>
              </div>
            )}

            {/* ════════════════════════════════
                Step 3: 안전방충망 ─ 설치환경 + 망타입
                ════════════════════════════════ */}
            {((state.step === 3 && state.quoteType === "safetyScreen") || (state.step === 4 && state.quoteType === "mixed")) && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-2">설치환경 선택</h2>
                  <p className="text-muted-foreground">설치 환경에 맞는 옵션을 선택해주세요</p>
                </div>

                <div className="space-y-4">
                  {installTypes.map((install) => (
                    <Card
                      key={install.id}
                      className={`cursor-pointer transition-all ${state.installType === install.id ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"}`}
                      onClick={() => selectInstallType(install.id)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {install.id === "lowFloor" ? <Home className="w-6 h-6 text-primary" /> : <Building2 className="w-6 h-6 text-primary" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-bold">{install.name}</h3>
                                <Badge variant="outline" className="mt-1">{install.subtitle}</Badge>
                              </div>
                              {state.installType === install.id && (
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="w-4 h-4 text-primary-foreground" />
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{install.description}</p>
                            <p className="text-sm text-primary font-medium mt-2">{install.recommendation}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 망타입 선택 (설치유형 선택 후) */}
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
                            className={`cursor-pointer transition-all ${state.meshType === meshType ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"}`}
                            onClick={() => selectMeshType(meshType)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{meshInfo.name}</h4>
                                  <p className="text-sm text-muted-foreground">{meshInfo.description}</p>
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

                {/* 망타입 자동선택 안내 */}
                {state.installType && getAvailableMeshTypes().length === 1 && (
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">망 타입 자동 선택</p>
                        <p className="text-sm text-muted-foreground">
                          {state.brand === "goguryeo" && state.installType === "lowFloor" && "0.6mm (16mesh)"}
                          {state.brand === "goguryeo" && state.installType === "highFloor" && "0.4mm (16mesh)"}
                          {" "}이(가) 자동으로 선택되었습니다.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={prevStep} className="flex-1">
                    <ChevronLeft className="w-4 h-4 mr-1" />이전
                  </Button>
                  <Button onClick={nextStep} disabled={!canProceed()} className="flex-1">
                    다음<ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* ════════════════════════════════
                Step 3: 블랙스텐 ─ 견적 결과
                ════════════════════════════════ */}
            {state.step === 3 && state.quoteType === "blackScreenMesh" && (
              <div className="space-y-6" ref={resultAreaRef}>
                <div>
                  <h2 className="text-xl font-bold mb-2">견적 결과</h2>
                  <p className="text-muted-foreground">블랙스텐 미세촘촘 방충망 견적</p>
                </div>

                {(() => {
                  const svcOption = blackScreenServiceOptions.find((o) => o.id === state.blackScreenServiceType);
                  const isRoll = state.blackScreenServiceType === "rollScreen";
                  const meshSvcType =
                    state.blackScreenServiceType === "meshOnly" || state.blackScreenServiceType === "frameAndMesh"
                      ? (state.blackScreenServiceType as "meshOnly" | "frameAndMesh")
                      : null;

                  const total = isRoll
                    ? getRollScreenPrice(state.blackScreenRollCount).total
                    : meshSvcType
                    ? getBlackScreenPrice(meshSvcType, state.blackScreenLargeCount, state.blackScreenMediumCount).total
                    : 0;

                  const meshPriceInfo = meshSvcType
                    ? getBlackScreenPrice(meshSvcType, state.blackScreenLargeCount, state.blackScreenMediumCount)
                    : null;
                  const rollPriceInfo = isRoll ? getRollScreenPrice(state.blackScreenRollCount) : null;
                  const totalCount = isRoll ? state.blackScreenRollCount : state.blackScreenLargeCount + state.blackScreenMediumCount;
                  const tierLabel =
                    totalCount >= 6 ? "6장 이상 단가" : state.blackScreenServiceType === "meshOnly" ? "3-5장 단가" : "1-5장 단가";

                  return (
                    <>
                      <Card>
                        <CardContent className="p-5 space-y-4">
                          <div className="text-center pb-4 border-b">
                            <p className="text-sm text-muted-foreground mb-1">예상 견적 결과</p>
                            <p className="text-xs text-muted-foreground">
                              정확한 최종 견적은 방문 실측 후 확정됩니다.
                            </p>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-bold text-sm">선택 내역</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">서비스</span>
                                <span className="font-medium">{svcOption?.name}</span>
                              </div>
                              {meshPriceInfo && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">적용 단가</span>
                                    <span className="font-medium">{tierLabel}</span>
                                  </div>
                                  {state.blackScreenLargeCount > 0 && (
                                    <div className="flex justify-between pl-2">
                                      <span className="text-muted-foreground">대형 {state.blackScreenLargeCount}장 × {meshPriceInfo.largeUnitPrice.toLocaleString()}원</span>
                                      <span className="font-medium">{(state.blackScreenLargeCount * meshPriceInfo.largeUnitPrice).toLocaleString()}원</span>
                                    </div>
                                  )}
                                  {state.blackScreenMediumCount > 0 && (
                                    <div className="flex justify-between pl-2">
                                      <span className="text-muted-foreground">중형 {state.blackScreenMediumCount}장 × {meshPriceInfo.mediumUnitPrice.toLocaleString()}원</span>
                                      <span className="font-medium">{(state.blackScreenMediumCount * meshPriceInfo.mediumUnitPrice).toLocaleString()}원</span>
                                    </div>
                                  )}
                                </>
                              )}
                              {rollPriceInfo && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">적용 단가</span>
                                    <span className="font-medium">{tierLabel}</span>
                                  </div>
                                  <div className="flex justify-between pl-2">
                                    <span className="text-muted-foreground">{state.blackScreenRollCount}장 × {rollPriceInfo.unitPrice.toLocaleString()}원</span>
                                    <span className="font-medium">{rollPriceInfo.total.toLocaleString()}원</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between pt-3 border-t">
                            <span className="font-bold">총 시공 견적</span>
                            <span className="font-bold text-xl text-primary">{total.toLocaleString()}원</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* 블랙스텐 특장점 */}
                      {state.blackScreenServiceType === "meshOnly" && (
                        <Card className="bg-primary/10 border-primary/30">
                          <CardContent className="p-4">
                            <h4 className="font-bold text-base mb-3 text-primary">블랙스텐망 특장점</h4>
                            <p className="text-xs text-muted-foreground mb-3">
                              한국메탈 블랙 0.18*24메쉬 · &ldquo;벌레는 더 막고, 시야는 더 좋고, 오래 쓰는 프리미엄 방충망&rdquo;
                            </p>
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

                      {/* 시공 신청 CTA */}
                      <Button
                        className="w-full h-14 text-lg font-bold"
                        onClick={() => goToStep(applyStep)}
                      >
                        이 견적으로 문의하기
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>

                      <button
                        onClick={() => setShowShareButtons(!showShareButtons)}
                        className="text-xs text-muted-foreground w-full text-center py-1"
                      >
                        {showShareButtons ? "견적 복사/캡처 숨기기 ▲" : "견적 복사/캡처 ▼"}
                      </button>
                      {showShareButtons && (
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              let text = `[블랙스텐 방충망 견적서]\n\n[블랙스텐 방충망 - ${svcOption?.name}]\n`;
                              if (meshPriceInfo) {
                                text += `적용단가: ${tierLabel}\n`;
                                if (state.blackScreenLargeCount > 0) text += `대형 ${state.blackScreenLargeCount}장 × ${meshPriceInfo.largeUnitPrice.toLocaleString()}원 = ${(state.blackScreenLargeCount * meshPriceInfo.largeUnitPrice).toLocaleString()}원\n`;
                                if (state.blackScreenMediumCount > 0) text += `중형 ${state.blackScreenMediumCount}장 × ${meshPriceInfo.mediumUnitPrice.toLocaleString()}원 = ${(state.blackScreenMediumCount * meshPriceInfo.mediumUnitPrice).toLocaleString()}원\n`;
                              }
                              if (rollPriceInfo) {
                                text += `${state.blackScreenRollCount}장 × ${rollPriceInfo.unitPrice.toLocaleString()}원\n`;
                              }
                              text += `\n*총 시공 견적: ${total.toLocaleString()}원\n\n[안내사항]\n`;
                              PRODUCT_NOTICES["blackScreenMesh"].forEach((n) => { text += `• ${n}\n`; });
                              text += `\n문자문의: Kobang 010-5638-3869`;
                              navigator.clipboard.writeText(text);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                          >
                            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                            {copied ? "복사됨" : "견적 복사"}
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={captureQuote} disabled={capturing}>
                            <Camera className="w-4 h-4 mr-2" />
                            {capturing ? "캡처 중..." : "견적 캡처"}
                          </Button>
                        </div>
                      )}

                      <Card className="bg-secondary/50">
                        <CardContent className="p-4">
                          <h4 className="font-bold text-sm mb-2">안내 사항</h4>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {PRODUCT_NOTICES["blackScreenMesh"].map((notice, i) => (
                              <li key={i}>• {notice}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <div className="flex gap-3">
                        <Button variant="outline" onClick={resetAll} className="flex-1">처음으로</Button>
                        <Button variant="outline" onClick={prevStep} className="flex-1">
                          <ChevronLeft className="w-4 h-4 mr-1" />수정하기
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* ════════════════════════════════
                Step 4: 안전방충망 ─ 공간/사이즈 선택
                ════════════════════════════════ */}
            {((state.step === 4 && state.quoteType === "safetyScreen") || (state.step === 5 && state.quoteType === "mixed")) && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-2">공간/사이즈 선택</h2>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{brands.find((b) => b.id === state.brand)?.name}</Badge>
                    <Badge variant="secondary">{installTypes.find((i) => i.id === state.installType)?.name}</Badge>
                    <Badge variant="secondary">{state.meshType}</Badge>
                  </div>
                  <p className="text-muted-foreground mt-2">공간별 개수를 선택하고, 실측값이 있으면 입력해주세요.</p>
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
                              <p className="text-sm text-muted-foreground">기본사이즈: {space.defaultWidth}×{space.defaultHeight}mm</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateSpaceItem(space.id, Math.max(0, count - 1))}>
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center font-bold">{count}</span>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateSpaceItem(space.id, count + 1)}>
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {count > 0 && (
                            <div className="space-y-4 pt-3 border-t">
                              <Button
                                variant={getShowSizeInput(space.id) ? "default" : "outline"}
                                size="sm"
                                className="w-full"
                                onClick={() => toggleSizeInput(space.id)}
                              >
                                {getShowSizeInput(space.id) ? (
                                  <><Check className="w-4 h-4 mr-2" />실측사이즈 입력 중</>
                                ) : (
                                  <><Plus className="w-4 h-4 mr-2" />실측사이즈 입력</>
                                )}
                              </Button>

                              {details.map((detail, index) => {
                                const price = state.brand && state.meshType
                                  ? getPrice(state.brand, state.meshType, detail.width, detail.height)
                                  : null;

                                return (
                                  <div key={detail.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-muted-foreground">{space.name} {index + 1}</span>
                                      {price && <span className="text-sm font-bold text-primary">{price.toLocaleString()}원</span>}
                                    </div>
                                    {getShowSizeInput(space.id) && (
                                      <>
                                        <div className="flex gap-3">
                                          <div className="flex-1">
                                            <label className="text-xs text-muted-foreground">가로 (mm)</label>
                                            <Input
                                              type="number"
                                              value={detail.width}
                                              onChange={(e) => updateSpaceDetailSize(space.id, index, e.target.value === "" ? 0 : parseInt(e.target.value), null)}
                                              onFocus={(e) => e.target.select()}
                                              onBlur={(e) => {
                                                if (e.target.value === "" || parseInt(e.target.value) === 0) updateSpaceDetailSize(space.id, index, space.defaultWidth, null);
                                              }}
                                              className="mt-1"
                                            />
                                          </div>
                                          <div className="flex-1">
                                            <label className="text-xs text-muted-foreground">세로 (mm)</label>
                                            <Input
                                              type="number"
                                              value={detail.height}
                                              onChange={(e) => updateSpaceDetailSize(space.id, index, null, e.target.value === "" ? 0 : parseInt(e.target.value))}
                                              onFocus={(e) => e.target.select()}
                                              onBlur={(e) => {
                                                if (e.target.value === "" || parseInt(e.target.value) === 0) updateSpaceDetailSize(space.id, index, null, space.defaultHeight);
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
                                    {!getShowSizeInput(space.id) && (
                                      <p className="text-xs text-muted-foreground">기본 사이즈: {detail.width}×{detail.height}mm</p>
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
                    <ChevronLeft className="w-4 h-4 mr-1" />이전
                  </Button>
                  <Button onClick={nextStep} disabled={!canProceed()} className="flex-1">
                    다음<ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* ════════════════════════════════
                Step 5: 안전방충망 ─ 옵션 (번호키)
                ════════════════════════════════ */}
            {((state.step === 5 && state.quoteType === "safetyScreen") || (state.step === 6 && state.quoteType === "mixed")) && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-2">옵션 선택</h2>
                </div>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold">번호키 추가</h3>
                        <p className="text-sm text-primary font-medium">+{NUMBER_KEY_PRICE.toLocaleString()}원/개</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateNumberKeyCount(state.numberKeyCount - 1)}>
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-bold">{state.numberKeyCount}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateNumberKeyCount(state.numberKeyCount + 1)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-lg">
                      <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm text-muted-foreground">크리세트(자동잠금장치) 기본포함, 번호키는 옵션 추가</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={prevStep} className="flex-1">
                    <ChevronLeft className="w-4 h-4 mr-1" />이전
                  </Button>
                  <Button onClick={nextStep} className="flex-1">
                    견적 확인<ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* ════════════════════════════════
                Step 6: 안전방충망 ─ 견적 결과
                ════════════════════════════════ */}
            {state.step === 6 && state.quoteType === "safetyScreen" && (
              <div className="space-y-6" ref={resultAreaRef}>
                <div>
                  <h2 className="text-xl font-bold mb-2">견적 결과</h2>
                  <p className="text-muted-foreground">안전방범·추락방지 방충망 견적</p>
                </div>

                {(() => {
                  const { items, productTotal, numberKeyTotal, total } = calculateTotal();
                  const brandInfo = brands.find((b) => b.id === state.brand);
                  const installInfo = installTypes.find((i) => i.id === state.installType);

                  return (
                    <>
                      <Card>
                        <CardContent className="p-5 space-y-4">
                          <div className="text-center pb-4 border-b">
                            <p className="text-sm text-muted-foreground mb-1">예상 견적 결과</p>
                            <p className="text-xs text-muted-foreground">
                              정확한 최종 견적은 방문 실측 후 확정됩니다.
                            </p>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-bold text-sm">선택 내역</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">브랜드</span>
                                <span className="font-medium">{brandInfo?.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">설치유형</span>
                                <span className="font-medium">
                                  {installInfo?.name} ({state.meshType})
                                </span>
                              </div>
                              <div className="pt-1 space-y-1">
                                {items.map((item, index) => (
                                  <div key={index} className="flex justify-between pl-2">
                                    <span className="text-muted-foreground">
                                      · {item.spaceName} {item.detailIndex} ({item.width}×{item.height}mm)
                                    </span>
                                    <span>{item.unitPrice.toLocaleString()}원</span>
                                  </div>
                                ))}
                                {state.numberKeyCount > 0 && (
                                  <div className="flex justify-between pl-2">
                                    <span className="text-muted-foreground">· 번호키 {state.numberKeyCount}개</span>
                                    <span>{(NUMBER_KEY_PRICE * state.numberKeyCount).toLocaleString()}원</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between pt-3 border-t">
                            <span className="font-bold">총 시공 견적</span>
                            <span className="font-bold text-xl text-primary">{total.toLocaleString()}원</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* 시공 신청 CTA */}
                      <Button
                        className="w-full h-14 text-lg font-bold"
                        onClick={() => goToStep(applyStep)}
                      >
                        이 견적으로 문의하기
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>

                      <button
                        onClick={() => setShowShareButtons(!showShareButtons)}
                        className="text-xs text-muted-foreground w-full text-center py-1"
                      >
                        {showShareButtons ? "견적 복사/캡처 숨기기 ▲" : "견적 복사/캡처 ▼"}
                      </button>
                      {showShareButtons && (
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1" onClick={copySafetyScreenQuote}>
                            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                            {copied ? "복사됨" : "견적 복사"}
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={captureQuote} disabled={capturing}>
                            <Camera className="w-4 h-4 mr-2" />
                            {capturing ? "캡처 중..." : "견적 캡처"}
                          </Button>
                        </div>
                      )}

                      <Card className="bg-secondary/50">
                        <CardContent className="p-4">
                          <h4 className="font-bold text-sm mb-2">안내 사항</h4>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {PRODUCT_NOTICES["safetyScreen"].map((notice, i) => (
                              <li key={i}>• {notice}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <div className="flex gap-3">
                        <Button variant="outline" onClick={resetAll} className="flex-1">처음으로</Button>
                        <Button variant="outline" onClick={prevStep} className="flex-1">
                          <ChevronLeft className="w-4 h-4 mr-1" />수정하기
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* ════════════════════════════════
                Step 7: 혼합 견적 ─ 통합 결과
                ════════════════════════════════ */}
            {state.step === 7 && state.quoteType === "mixed" && (
              <div className="space-y-6" ref={resultAreaRef}>
                <div>
                  <h2 className="text-xl font-bold mb-2">통합 견적 결과</h2>
                  <p className="text-muted-foreground">블랙스텐 + 안전방충망 혼합 견적</p>
                </div>

                {(() => {
                  const svcOption = blackScreenServiceOptions.find((o) => o.id === state.blackScreenServiceType);
                  const isRoll = state.blackScreenServiceType === "rollScreen";
                  const meshSvcType = (state.blackScreenServiceType === "meshOnly" || state.blackScreenServiceType === "frameAndMesh")
                    ? state.blackScreenServiceType as "meshOnly" | "frameAndMesh" : null;
                  const blackTotal = isRoll
                    ? getRollScreenPrice(state.blackScreenRollCount).total
                    : meshSvcType ? getBlackScreenPrice(meshSvcType, state.blackScreenLargeCount, state.blackScreenMediumCount).total : 0;
                  const meshPriceInfo = meshSvcType ? getBlackScreenPrice(meshSvcType, state.blackScreenLargeCount, state.blackScreenMediumCount) : null;
                  const rollPriceInfo = isRoll ? getRollScreenPrice(state.blackScreenRollCount) : null;
                  const blackCount = isRoll ? state.blackScreenRollCount : state.blackScreenLargeCount + state.blackScreenMediumCount;
                  const blackTierLabel = blackCount >= 6 ? "6장 이상 단가" : state.blackScreenServiceType === "meshOnly" ? "3-5장 단가" : "1-5장 단가";

                  const { items: safetyItems, productTotal: safetyProductTotal, numberKeyTotal, total: safetyTotal } = calculateTotal();
                  const brandInfo = brands.find((b) => b.id === state.brand);
                  const installInfo = installTypes.find((i) => i.id === state.installType);
                  const combinedTotal = blackTotal + safetyTotal;

                  return (
                    <>
                      <Card>
                        <CardContent className="p-5 space-y-5">
                          <div className="text-center pb-4 border-b">
                            <p className="text-sm text-muted-foreground mb-1">예상 견적 결과</p>
                            <p className="text-xs text-muted-foreground">정확한 최종 견적은 방문 실측 후 확정됩니다.</p>
                          </div>

                          {/* 블랙스텐 섹션 */}
                          <div className="space-y-2">
                            <h4 className="font-bold text-sm flex items-center gap-2">
                              <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                              블랙스텐 방충망
                            </h4>
                            <div className="space-y-1.5 text-sm pl-4">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">서비스</span>
                                <span className="font-medium">{svcOption?.name}</span>
                              </div>
                              {meshPriceInfo && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">적용 단가</span>
                                    <span className="font-medium">{blackTierLabel}</span>
                                  </div>
                                  {state.blackScreenLargeCount > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">대형 {state.blackScreenLargeCount}장 × {meshPriceInfo.largeUnitPrice.toLocaleString()}원</span>
                                      <span>{(state.blackScreenLargeCount * meshPriceInfo.largeUnitPrice).toLocaleString()}원</span>
                                    </div>
                                  )}
                                  {state.blackScreenMediumCount > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">중형 {state.blackScreenMediumCount}장 × {meshPriceInfo.mediumUnitPrice.toLocaleString()}원</span>
                                      <span>{(state.blackScreenMediumCount * meshPriceInfo.mediumUnitPrice).toLocaleString()}원</span>
                                    </div>
                                  )}
                                </>
                              )}
                              {rollPriceInfo && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">{state.blackScreenRollCount}장 × {rollPriceInfo.unitPrice.toLocaleString()}원</span>
                                  <span>{rollPriceInfo.total.toLocaleString()}원</span>
                                </div>
                              )}
                              <div className="flex justify-between font-bold text-primary pt-1 border-t">
                                <span>소계</span>
                                <span>{blackTotal.toLocaleString()}원</span>
                              </div>
                            </div>
                          </div>

                          {/* 안전방충망 섹션 */}
                          <div className="space-y-2 pt-3 border-t">
                            <h4 className="font-bold text-sm flex items-center gap-2">
                              <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                              안전방충망
                            </h4>
                            <div className="space-y-1.5 text-sm pl-4">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">브랜드</span>
                                <span className="font-medium">{brandInfo?.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">설치유형</span>
                                <span className="font-medium">{installInfo?.name} ({state.meshType})</span>
                              </div>
                              {safetyItems.map((item, index) => (
                                <div key={index} className="flex justify-between">
                                  <span className="text-muted-foreground">· {item.spaceName} {item.detailIndex} ({item.width}×{item.height}mm)</span>
                                  <span>{item.unitPrice.toLocaleString()}원</span>
                                </div>
                              ))}
                              {state.numberKeyCount > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">· 번호키 {state.numberKeyCount}개</span>
                                  <span>{(NUMBER_KEY_PRICE * state.numberKeyCount).toLocaleString()}원</span>
                                </div>
                              )}
                              <div className="flex justify-between font-bold text-blue-600 pt-1 border-t">
                                <span>소계</span>
                                <span>{safetyTotal.toLocaleString()}원</span>
                              </div>
                            </div>
                          </div>

                          {/* 합계 */}
                          <div className="flex justify-between pt-3 border-t-2">
                            <span className="font-bold text-base">총 시공 견적</span>
                            <span className="font-bold text-xl text-primary">{combinedTotal.toLocaleString()}원</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Button className="w-full h-14 text-lg font-bold" onClick={() => goToStep(applyStep)}>
                        이 견적으로 문의하기
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>

                      <button
                        onClick={() => setShowShareButtons(!showShareButtons)}
                        className="text-xs text-muted-foreground w-full text-center py-1"
                      >
                        {showShareButtons ? "견적 복사/캡처 숨기기 ▲" : "견적 복사/캡처 ▼"}
                      </button>
                      {showShareButtons && (
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1" onClick={() => {
                            const { text, total } = getQuoteSummary();
                            let copyText = `[블랙스텐 + 안전방충망 혼합 견적서]\n\n${text}\n\n[안내사항]\n`;
                            PRODUCT_NOTICES["mixed"].forEach((n) => { copyText += `• ${n}\n`; });
                            copyText += `\n문자문의: Kobang 010-5638-3869`;
                            navigator.clipboard.writeText(copyText);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}>
                            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                            {copied ? "복사됨" : "견적 복사"}
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={captureQuote} disabled={capturing}>
                            <Camera className="w-4 h-4 mr-2" />
                            {capturing ? "캡처 중..." : "견적 캡처"}
                          </Button>
                        </div>
                      )}

                      <Card className="bg-secondary/50">
                        <CardContent className="p-4">
                          <h4 className="font-bold text-sm mb-2">안내 사항</h4>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {PRODUCT_NOTICES["mixed"].map((notice, i) => (
                              <li key={i}>• {notice}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <div className="flex gap-3">
                        <Button variant="outline" onClick={resetAll} className="flex-1">처음으로</Button>
                        <Button variant="outline" onClick={prevStep} className="flex-1">
                          <ChevronLeft className="w-4 h-4 mr-1" />수정하기
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* ════════════════════════════════
                시공 신청 폼
                (blackScreenMesh: step 4 / safetyScreen: step 7 / mixed: step 8)
                ════════════════════════════════ */}
            {isApplyFormStep && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">시공 신청</h2>
                  <p className="text-muted-foreground text-sm">정보를 입력하시면 빠르게 연락드리겠습니다.</p>
                </div>

                {/* 견적 요약 */}
                {(() => {
                  const { text, total } = getQuoteSummary();
                  return (
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-4">
                        <p className="text-xs font-bold text-primary mb-2">신청 견적 내용</p>
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
                        <div className="mt-3 pt-3 border-t flex justify-between font-bold text-sm">
                          <span>예상 견적</span>
                          <span className="text-primary">{total.toLocaleString()}원</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* 신청 폼 */}
                <div className="space-y-4">
                  {/* 이름 */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      이름 <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="홍길동"
                      value={appForm.name}
                      onChange={(e) => setAppForm((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  {/* 연락처 */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold flex items-center gap-1.5">
                      <Phone className="w-4 h-4" />
                      연락처 <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="tel"
                      placeholder="010-0000-0000"
                      value={appForm.phone}
                      onChange={(e) => setAppForm((prev) => ({ ...prev, phone: formatPhone(e.target.value) }))}
                      maxLength={13}
                    />
                  </div>

                  {/* 주소 (시공장소) */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      주소 (시공장소) <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="예) 서울시 강남구 역삼동 OO아파트 101동 1001호"
                      value={appForm.address}
                      onChange={(e) => setAppForm((prev) => ({ ...prev, address: e.target.value }))}
                    />
                  </div>

                  {/* 희망 시공일 */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4" />
                      희망 시공일 <span className="text-xs font-normal text-muted-foreground">(선택)</span>
                    </label>
                    <Input
                      type="date"
                      min={today}
                      value={appForm.preferredDate}
                      onChange={(e) => setAppForm((prev) => ({ ...prev, preferredDate: e.target.value }))}
                    />
                  </div>

                  {/* 추가요청사항 */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      추가 요청사항 <span className="text-xs font-normal text-muted-foreground">(선택)</span>
                    </label>
                    <Textarea
                      placeholder="예) 오전 시공 희망, 주차 공간 있음, 창문 개수 추가 등"
                      value={appForm.memo}
                      onChange={(e) => setAppForm((prev) => ({ ...prev, memo: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  <span className="text-destructive">*</span> 표시는 필수 입력 항목입니다.
                </p>

                {/* 신청 버튼 */}
                <Button
                  className="w-full h-14 text-lg font-bold"
                  disabled={!canSubmitApp || appSubmitting}
                  onClick={submitApplication}
                >
                  {appSubmitting ? "신청 중..." : "시공 신청하기"}
                  {!appSubmitting && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>

                <Button variant="outline" className="w-full" onClick={() => goToStep(resultStep)}>
                  <ChevronLeft className="w-4 h-4 mr-1" />견적 다시 확인
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* 푸터 */}
      {!appSubmitted && (state.step === resultStep || isApplyFormStep) && (
        <footer className="border-t mt-12 py-6">
          <div className="max-w-lg mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/kobang-logo.png" alt="Kobang 로고" className="h-14 w-auto" />
                <span className="font-medium text-base">Kobang</span>
              </div>
              <a
                href="sms:010-5638-3869"
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                문자문의 010-5638-3869
              </a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
