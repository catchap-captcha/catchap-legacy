// PAR-008 · 학부모 알림
// 자녀 연결 승인, 새 리포트 등 학부모에게 도착한 알림 목록.
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

const NOTIFICATIONS = [
  {
    icon: "🏫",
    title: "자녀 연결이 승인되었습니다.",
    body: "토리의 학습 정보를 확인할 수 있습니다.",
    time: "오늘",
    unread: true,
  },
  {
    icon: "📄",
    title: "새 주간 리포트가 준비되었습니다.",
    body: "이번 주 강점과 추천 학습을 확인해 보세요.",
    time: "오늘",
    unread: false,
  },
];

export default function Notifications() {
  return (
    <ParentShell tag="PAR-008 · 학부모 알림" active="알림">
      <h1 className="mb-6 text-2xl font-extrabold text-indigo-900">알림</h1>

      <ul className="space-y-3">
        {NOTIFICATIONS.map((n, i) => (
          <li
            key={i}
            className={
              "flex gap-3 rounded-xl border p-5 " +
              (n.unread ? "border-emerald-100 bg-emerald-50/40" : "border-slate-200 bg-white")
            }
          >
            <span className="text-2xl">{n.icon}</span>
            <div>
              <p className="font-bold text-indigo-900">{n.title}</p>
              <p className="mt-1 text-sm text-slate-500">{n.body}</p>
              <p className="mt-2 text-xs text-slate-400">{n.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </ParentShell>
  );
}
