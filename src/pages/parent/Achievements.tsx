// PAR-010 · 자녀 업적·보상
// 학습으로 모은 성취 배지와 꾸미기 아이템을 보여준다. 잠긴 항목은 흐리게 표시.
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
  { label: "모은 보상", value: "8개" },
  { label: "누적 학습", value: "23일" },
  { label: "연속 학습", value: "4일" },
];

const BADGES = [
  { icon: "➕", title: "수세기 세계", desc: "수 세기 50문제 달성", locked: false },
  { icon: "🔥", title: "꾸준한 풀이", desc: "3일 연속 학습", locked: false },
  { icon: "🧠", title: "생각 수집가", desc: "모양 맞추기 30회", locked: false },
  { icon: "🔒", title: "낱말 학자", desc: "낱말 학습 10회 달성 시 열려요", locked: true },
];

export default function Achievements() {
  return (
    <ParentShell tag="PAR-010 · 자녀 업적·보상" active="리포트">
      <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-3xl">
            🏅
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-indigo-900">업적·보상</h1>
            <p className="mt-1 text-sm text-slate-500">
              학습을 통해 모은 성취와 꾸미기 아이템을 확인합니다.
            </p>
          </div>
        </div>
        <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          꾸미기 상세
        </button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5 text-center">
            <p className="text-2xl font-extrabold text-emerald-600">{s.value}</p>
            <p className="mt-1 text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {BADGES.map((b) => (
          <div
            key={b.title}
            className={
              "rounded-xl border p-5 text-center " +
              (b.locked
                ? "border-slate-200 bg-slate-50 opacity-60"
                : "border-amber-100 bg-amber-50")
            }
          >
            <div className="text-3xl">{b.icon}</div>
            <p className="mt-2 font-bold text-indigo-900">{b.title}</p>
            <p className="mt-1 text-xs text-slate-500">{b.desc}</p>
          </div>
        ))}
      </div>
    </ParentShell>
  );
}
