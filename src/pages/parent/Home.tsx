// PAR-001 · 학부모 홈
// 연결된 자녀의 이번 주 학습 변화를 한눈에 보여주는 대시보드.
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

const CHILDREN = [
  { id: "tori", name: "토리" },
  { id: "cloud", name: "구름토끼" },
];

const STATS = [
  { label: "이번 주 학습", value: "5회", sub: "지난주보다 +1회" },
  { label: "정답률", value: "84%", sub: "지난주보다 +6%p" },
  { label: "평균 풀이 시간", value: "9.2초", sub: "지난주보다 -1.3초" },
];

function Donut({ percent }: { percent: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - percent / 100);
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28">
      <g transform="rotate(-90 60 60)">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="14" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#10b981"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </g>
      <text
        x="60"
        y="60"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="24"
        fontWeight="700"
        fill="#0f766e"
      >
        {percent}%
      </text>
    </svg>
  );
}

export default function Home() {
  const [selected, setSelected] = useState(CHILDREN[0].id);

  return (
    <ParentShell tag="PAR-001 · 학부모 홈" active="홈">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold text-emerald-600">학부모 대시보드</p>
          <h1 className="text-2xl font-extrabold text-indigo-900">
            자녀의 이번 주 학습을 확인해요
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            연결된 자녀의 학습 변화를 한눈에 살펴볼 수 있습니다.
          </p>
        </div>
        <div className="flex gap-2">
          {CHILDREN.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={
                selected === c.id
                  ? "rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                  : "rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              }
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-2 text-2xl font-extrabold text-emerald-600">{s.value}</p>
            <p className="mt-1 text-xs text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-indigo-900">이번 주 한눈에 보기</h2>
          <p className="mt-1 text-sm text-slate-500">
            정답률과 학습량 분포를 자녀별로 바꿔 가며 확인하실 수 있습니다.
          </p>
          <div className="mt-4 flex gap-2">
            <a
              href="/parent/report"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              주간 리포트
            </a>
            <a
              href="/parent/achievements"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              업적·보상
            </a>
          </div>
        </div>
        <Donut percent={84} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-bold text-indigo-900">칭찬 부분</h3>
          <p className="mt-2 text-sm text-slate-500">그림 개수 세기 · 색 세기</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-bold text-indigo-900">도움이 필요한 부분</h3>
          <p className="mt-2 text-sm text-slate-500">모양 맞추기 · 카드 짝 맞추기</p>
        </div>
      </div>
    </ParentShell>
  );
}
