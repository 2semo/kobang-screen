"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

function buildCopyText(app: {
  name: string; phone: string; address: string;
  quoteType: string; quoteSummary: string; quoteTotal: number;
  preferredDate?: string; memo?: string;
}) {
  const lines = [
    `[코방 시공 신청]`,
    `━━━━━━━━━━━━━━━━`,
    `고객명: ${app.name}`,
    `연락처: ${app.phone}`,
    `주  소: ${app.address}`,
    app.preferredDate ? `희망날짜: ${app.preferredDate}` : null,
    app.memo ? `메  모: ${app.memo}` : null,
    `━━━━━━━━━━━━━━━━`,
    `[견적 내용]`,
    app.quoteSummary,
    `━━━━━━━━━━━━━━━━`,
    `합계: ${app.quoteTotal.toLocaleString()}원`,
  ].filter(Boolean);
  return lines.join("\n");
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:        { label: "신규",   color: "bg-blue-100 text-blue-700" },
  consulting: { label: "상담중", color: "bg-yellow-100 text-yellow-700" },
  confirmed:  { label: "확정",   color: "bg-purple-100 text-purple-700" },
  completed:  { label: "완료",   color: "bg-green-100 text-green-700" },
  cancelled:  { label: "취소",   color: "bg-red-100 text-red-700" },
};

const QUOTE_TYPE_LABELS: Record<string, string> = {
  safetyScreen:    "안전방충망",
  blackScreenMesh: "블랙스텐",
  mixed:           "혼합",
};

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function AdminPage() {
  const router = useRouter();
  const applications = useQuery(api.applications.listApplications) ?? [];
  const appStats = useQuery(api.applications.getApplicationStats);
  const quoteStats = useQuery(api.quotes.getQuoteStats);
  const regionStats = useQuery(api.quotes.getRegionStats) ?? [];
  const updateStatus = useMutation(api.applications.updateStatus);

  const [selected, setSelected] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, app: typeof applications[0]) => {
    e.stopPropagation();
    navigator.clipboard.writeText(buildCopyText(app));
    setCopied(app._id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleLogout = async () => {
    await fetch("/api/admin-login", { method: "DELETE" });
    router.push("/admin/login");
  };

  const selectedApp = applications.find((a) => a._id === selected);

  const filtered = statusFilter === "all"
    ? applications
    : applications.filter((a) => a.status === statusFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/kobang-logo.png" alt="Kobang" className="h-10" />
          <span className="font-bold text-lg">관리자</span>
        </div>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
          로그아웃
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="총 견적 조회" value={quoteStats?.total ?? "-"} sub={`오늘 ${quoteStats?.todayCount ?? 0}건`} color="blue" />
          <StatCard label="총 시공 신청" value={appStats?.total ?? "-"} sub={`오늘 ${appStats?.todayCount ?? 0}건`} color="green" />
          <StatCard label="신규 신청" value={appStats?.byStatus?.new ?? 0} sub="처리 대기" color="yellow" />
          <StatCard label="완료" value={appStats?.byStatus?.completed ?? 0} sub="시공 완료" color="purple" />
        </div>

        {/* 신청 목록 */}
        <div className="bg-white rounded-2xl shadow">
          <div className="p-4 border-b flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-bold text-lg">시공 신청 목록</h2>
            <div className="flex gap-2 flex-wrap">
              {["all", "new", "consulting", "confirmed", "completed", "cancelled"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s === "all" ? "전체" : STATUS_LABELS[s]?.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y">
            {filtered.length === 0 && (
              <p className="text-center text-gray-400 py-12 text-sm">신청 내역이 없습니다.</p>
            )}
            {filtered.map((app) => (
              <div
                key={app._id}
                onClick={() => setSelected(app._id === selected ? null : app._id)}
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold">{app.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_LABELS[app.status]?.color}`}>
                        {STATUS_LABELS[app.status]?.label}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {QUOTE_TYPE_LABELS[app.quoteType] ?? app.quoteType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{app.phone} · {app.address}</p>
                    <p className="text-sm font-medium text-blue-600 mt-0.5">{app.quoteTotal.toLocaleString()}원</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(app.createdAt)}</span>
                </div>

                {/* 상세 패널 */}
                {selected === app._id && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    {/* 복사 버튼 */}
                    <button
                      onClick={(e) => handleCopy(e, app)}
                      className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                        copied === app._id
                          ? "bg-green-500 text-white"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {copied === app._id ? "✓ 복사됨!" : "📋 설치팀에 전달할 내용 복사"}
                    </button>

                    <div className="text-sm space-y-1 text-gray-700">
                      {app.preferredDate && <p>📅 희망 날짜: {app.preferredDate}</p>}
                      {app.memo && <p>📝 메모: {app.memo}</p>}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">견적 내용</p>
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">{app.quoteSummary}</pre>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-2">상태 변경</p>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(STATUS_LABELS).map(([key, { label, color }]) => (
                          <button
                            key={key}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus({ id: app._id as Id<"applications">, status: key });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                              app.status === key
                                ? `${color} border-transparent`
                                : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 견적 조회 통계 */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="font-bold text-lg mb-3">견적 조회 상품별 현황</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "blackScreenMesh", label: "블랙스텐" },
              { key: "safetyScreen",    label: "안전방충망" },
              { key: "mixed",           label: "혼합 견적" },
            ].map(({ key, label }) => (
              <div key={key} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{quoteStats?.byType?.[key] ?? 0}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 지역별 현황 */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="font-bold text-lg mb-3">견적 조회 지역별 현황</h2>
          {regionStats.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">아직 지역 데이터가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {regionStats.map(({ region, count }) => {
                const max = regionStats[0]?.count ?? 1;
                const pct = Math.round((count / max) * 100);
                return (
                  <div key={region} className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 w-24 flex-shrink-0">{region}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-blue-600 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub: string; color: string }) {
  const colors: Record<string, string> = {
    blue:   "text-blue-600",
    green:  "text-green-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
  };
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${colors[color]}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
