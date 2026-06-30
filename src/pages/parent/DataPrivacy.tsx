// PAR-011 · 개인정보·데이터 관리
// 자녀별 수집 정보 확인, 데이터 내보내기/삭제/연결 해제 권한 요청.
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

const COLLECTED = [
  { key: "연결 기관", value: "○○ 청소년 복지 센터" },
  { key: "데이터 활용 범위", value: "풀이 시간·정답률 요약" },
  { key: "보관 기간", value: "연결 보관 후 자동 삭제" },
  { key: "학습 요약 12개월 · 원본 30일", value: "" },
];

const REQUESTS = [
  { title: "내 자녀 데이터 내보내기", action: "요청", danger: false },
  { title: "특정 기간 기록 삭제", action: "요청", danger: false },
  { title: "자녀 연결 해제", action: "해제", danger: true },
];

export default function DataPrivacy() {
  return (
    <ParentShell tag="PAR-011 · 개인정보·데이터 관리" active="설정">
      <h1 className="text-2xl font-extrabold text-indigo-900">개인정보·데이터 관리</h1>
      <p className="mt-1 text-sm text-slate-500">
        자녀에 대해 어떤 데이터가 어떻게 쓰이는지 확인하고 연결·보관을 직접 관리할 수 있습니다.
      </p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-bold text-indigo-900">자녀별 수집 정보</h3>
        <dl className="divide-y divide-slate-100">
          {COLLECTED.map((row) => (
            <div key={row.key} className="flex justify-between py-3 text-sm">
              <dt className="text-slate-500">{row.key}</dt>
              <dd className="font-medium text-slate-700">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-bold text-indigo-900">권한 요청</h3>
        <ul className="space-y-3">
          {REQUESTS.map((r) => (
            <li
              key={r.title}
              className={
                "flex items-center justify-between rounded-lg px-4 py-3 " +
                (r.danger ? "bg-rose-50" : "bg-slate-50")
              }
            >
              <span
                className={
                  "text-sm font-medium " + (r.danger ? "text-rose-600" : "text-slate-700")
                }
              >
                {r.title}
              </span>
              <button
                className={
                  "rounded-lg px-4 py-1.5 text-sm font-semibold " +
                  (r.danger
                    ? "border border-rose-200 bg-white text-rose-600 hover:bg-rose-100"
                    : "bg-emerald-600 text-white hover:bg-emerald-700")
                }
              >
                {r.action}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 rounded-lg bg-slate-100 p-4 text-xs leading-relaxed text-slate-500">
        삭제 요청 시 학습 요약을 제외한 원본 데이터가 30일 이내에 파기됩니다. 연결 해제 시
        기관은 더 이상 자녀의 학습 정보를 조회할 수 없으며, 보관 정책에 따라 데이터가 자동
        삭제됩니다.
      </p>
    </ParentShell>
  );
}
