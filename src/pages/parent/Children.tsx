// PAR-002 · 자녀 관리
// 연결된 자녀 목록을 보고, 상세로 이동하거나 새 자녀를 연결한다.
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
  {
    id: "tori",
    name: "토리",
    emoji: "🐱",
    desc: "생활지원 청소년 · 연결 완료",
    status: "connected" as const,
  },
  {
    id: "cloud",
    name: "구름토끼",
    emoji: "🐰",
    desc: "생활지원 청소년 · 승인 대기",
    status: "pending" as const,
  },
];

export default function Children() {
  return (
    <ParentShell tag="PAR-002 · 자녀 관리" active="자녀">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-indigo-900">자녀 관리</h1>
          <p className="mt-1 text-sm text-slate-500">
            연결된 자녀를 클릭하시거나 새로 연결할 수 있습니다.
          </p>
        </div>
        <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
          자녀 연결
        </button>
      </div>

      <ul className="space-y-3">
        {CHILDREN.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-2xl">
                {c.emoji}
              </div>
              <div>
                <p className="font-bold text-indigo-900">{c.name}</p>
                <p className="text-sm text-slate-500">{c.desc}</p>
              </div>
            </div>
            {c.status === "connected" ? (
              <a
                href="/parent/child"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
              >
                상세
              </a>
            ) : (
              <span className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-600">
                승인 대기
              </span>
            )}
          </li>
        ))}
      </ul>
    </ParentShell>
  );
}
