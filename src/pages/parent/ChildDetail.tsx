// PAR-004 · 자녀 상세
// 한 자녀의 학습 현황 요약과 강점/다음 연습을 보여준다.
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
  { label: "전체 학습", value: "13개" },
  { label: "이번 주 학습", value: "8개" },
  { label: "연속 학습", value: "4일" },
];

export default function ChildDetail() {
  return (
    <ParentShell tag="PAR-004 · 자녀 상세" active="자녀">
      <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">
            🐱
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-indigo-900">토리</h1>
            <p className="mt-1 text-sm text-slate-500">생활지원 청소년 · 만 23세</p>
          </div>
        </div>
        <a
          href="/parent/report"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
        >
          주간 리포트
        </a>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5 text-center">
            <p className="text-2xl font-extrabold text-emerald-600">{s.value}</p>
            <p className="mt-1 text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 font-bold text-indigo-900">잘하는 부분</h3>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>· 그림 개수 세기</li>
            <li>· 색 세기</li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 font-bold text-indigo-900">다음 연습</h3>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>· 모양 맞추기</li>
            <li>· 카드 짝 맞추기 연습</li>
          </ul>
        </div>
      </div>
    </ParentShell>
  );
}
