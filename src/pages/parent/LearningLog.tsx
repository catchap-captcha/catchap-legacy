// PAR-006 · 학습 기록
// 기간/과목 필터와 함께 주차별 학습량 변화를 막대그래프로 보여준다.
import { useState } from "react";

const NAV = [
  { label: "홈", href: "/parent/home" },
  { label: "자녀", href: "/parent/children" },
  { label: "리포트", href: "/parent/report" },
  { label: "알림", href: "/parent/notifications" },
  { label: "설정", href: "/parent/settings" },
];

function ParentShell({
  tag,
  active,
  children,
}: {
  tag: string;
  active: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="border-b border-emerald-100 bg-emerald-50/70 px-6 py-2 text-sm font-semibold text-slate-600">
        {tag}
      </div>
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-extrabold text-indigo-900">캣챱</span>
          <span className="text-sm font-semibold text-emerald-600">Catchap</span>
        </div>
        <nav className="hidden gap-2 md:flex">
          {NAV.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className={
                active === n.label
                  ? "rounded-md bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700"
                  : "rounded-md px-3 py-1 text-sm font-medium text-slate-500 hover:text-slate-800"
              }
            >
              {n.label}
            </a>
          ))}
        </nav>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          학부모
        </span>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}

const STATS = [
  { label: "총 학습", value: "18회" },
  { label: "정답률 변화", value: "+6%", positive: true },
  { label: "평균 풀이 시간", value: "-1.3초", positive: true },
];

const BARS = [
  { week: "1주", value: 8 },
  { week: "2주", value: 12 },
  { week: "3주", value: 14 },
  { week: "4주", value: 18 },
];

export default function LearningLog() {
  const [period, setPeriod] = useState("최근 4주");
  const [subject, setSubject] = useState("전체 과목");
  const max = Math.max(...BARS.map((b) => b.value));

  return (
    <ParentShell tag="PAR-006 · 학습 기록" active="리포트">
      <h1 className="text-2xl font-extrabold text-indigo-900">학습 기록</h1>
      <p className="mt-1 text-sm text-slate-500">기간과 과목을 선택해 자녀의 변화를 확인합니다.</p>

      <div className="mt-4 flex gap-3">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
        >
          <option>최근 4주</option>
          <option>최근 8주</option>
          <option>최근 3개월</option>
        </select>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
        >
          <option>전체 과목</option>
          <option>수 세기</option>
          <option>모양 맞추기</option>
        </select>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p
              className={
                "mt-2 text-2xl font-extrabold " +
                (s.positive ? "text-emerald-600" : "text-indigo-900")
              }
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex h-48 items-end justify-around gap-4">
          {BARS.map((b) => (
            <div key={b.week} className="flex flex-1 flex-col items-center justify-end gap-2">
              <div
                className="w-full max-w-[64px] rounded-t-lg bg-gradient-to-t from-emerald-500 to-teal-300"
                style={{ height: `${(b.value / max) * 100}%` }}
                title={`${b.value}회`}
              />
              <span className="text-xs text-slate-400">{b.week}</span>
            </div>
          ))}
        </div>
      </div>
    </ParentShell>
  );
}
