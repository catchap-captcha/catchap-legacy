// PAR-005 · 주간 리포트
// 한 주간의 요약, 강점, 연습할 부분, 조작 도움, 추천 학습을 카드로 보여준다.
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

const SECTIONS = [
  {
    title: "이번 주 요약",
    body: "총 42회 문제를 풀었고, 정답률은 84%입니다.",
  },
  {
    title: "강점",
    body: "그림 개수 세기는 빠르고 안정적으로 해결했습니다.",
  },
  {
    title: "연습할 부분",
    body: "모양 맞추기에서 시간이 오래 걸려 반복 연습이 필요합니다.",
  },
  {
    title: "조작 도움",
    body: "정답 비율이 높아도 경우가 있어 더 의지를 알맞게 연습해 봅니다.",
  },
  {
    title: "추천 학습",
    body: "모양 맞추기 복습과 더 다양한 연습 놀이를 추천합니다.",
  },
];

export default function WeeklyReport() {
  return (
    <ParentShell tag="PAR-005 · 주간 리포트" active="리포트">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="mb-1 text-sm text-slate-400">6월 3주차 · 6월 9일~6월 15일</p>
          <h1 className="text-2xl font-extrabold text-indigo-900">토리 주간 리포트</h1>
        </div>
        <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          리포트 보관함
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <div key={s.title} className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-2 font-bold text-indigo-900">{s.title}</h3>
            <p className="text-sm leading-relaxed text-slate-600">{s.body}</p>
          </div>
        ))}
      </div>
    </ParentShell>
  );
}
