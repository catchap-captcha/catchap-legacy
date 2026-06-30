import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Main from './pages/public/Main'
import About from './pages/public/About'
import OrgIntro from './pages/public/OrgIntro'
import Privacy from './pages/public/Privacy'
import Login from './pages/public/Login'
import ResetPassword from './pages/public/ResetPassword'
import StudentHome from './pages/student/Home'
import * as Org from './pages/org'

// 기관(ORG) 화면 라우트 목록 — /org 인덱스 페이지와 각 경로에서 함께 사용
const ORG_ROUTES = [
  { path: 'home', code: 'ORG-001', label: '기관 홈(대시보드)', Comp: Org.Home },
  { path: 'members', code: 'ORG-002', label: '멤버·권한', Comp: Org.Members },
  { path: 'invite', code: 'ORG-003', label: '멤버 초대', Comp: Org.InviteMember },
  { path: 'classes', code: 'ORG-004', label: '학급·학생', Comp: Org.Classes },
  { path: 'class-detail', code: 'ORG-005', label: '학급 상세', Comp: Org.ClassDetail },
  { path: 'student-detail', code: 'ORG-006', label: '학생 상세', Comp: Org.StudentDetail },
  { path: 'class-analytics', code: 'ORG-007', label: '학급 분석', Comp: Org.ClassAnalytics },
  { path: 'content', code: 'ORG-008', label: '콘텐츠 관리', Comp: Org.ContentManage },
  { path: 'content-edit', code: 'ORG-009', label: '콘텐츠 편집', Comp: Org.ContentEdit },
  { path: 'image-review', code: 'ORG-010', label: '이미지 AI 검수', Comp: Org.ImageReview },
  { path: 'captcha-config', code: 'ORG-011', label: 'CAPTCHA 설정', Comp: Org.CaptchaConfig },
  { path: 'behavior-analytics', code: 'ORG-012', label: '행동·화면 분석', Comp: Org.BehaviorAnalytics },
  { path: 'security-analytics', code: 'ORG-013', label: '보안 분석', Comp: Org.SecurityAnalytics },
  { path: 'site-connect', code: 'ORG-014', label: '사이트 연동', Comp: Org.SiteConnect },
  { path: 'widget-guide', code: 'ORG-015', label: '위젯 설치 안내', Comp: Org.WidgetGuide },
  { path: 'report', code: 'ORG-016', label: '리포트', Comp: Org.Report },
  { path: 'settings', code: 'ORG-017', label: '기관 설정', Comp: Org.Settings },
  { path: 'audit-log', code: 'ORG-018', label: '감사 기록', Comp: Org.AuditLog },
  { path: 'api-config', code: 'ORG-019', label: 'API 설정', Comp: Org.ApiConfig },
  { path: 'api-usage', code: 'ORG-020', label: 'API 사용량', Comp: Org.ApiUsage },
  { path: 'ai-inference', code: 'ORG-021', label: 'AI 추론 운영', Comp: Org.AiInference },
  { path: 'widget-code', code: 'ORG-022', label: '위젯 설치 코드', Comp: Org.WidgetCode },
  { path: 'recommend-ai', code: 'ORG-023', label: '취약 문제 추천 AI', Comp: Org.RecommendAI },
]

// /org — 모든 기관 화면으로 이동하는 인덱스(미리보기) 페이지
function OrgIndex() {
  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: '#1e293b', padding: '32px' }}>
      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#1e3a5f', letterSpacing: '-0.5px' }}>기관 관리자 화면 (ORG)</h1>
      <p style={{ margin: '8px 0 24px', fontSize: 14, color: '#64748b' }}>23개 화면 미리보기 · 카드를 클릭하면 해당 화면으로 이동합니다.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
        {ORG_ROUTES.map((r) => (
          <Link
            key={r.path}
            to={`/org/${r.path}`}
            style={{ display: 'block', background: '#fff', border: '1px solid #e6e8ec', borderRadius: 14, padding: 18, textDecoration: 'none', color: '#1e293b', boxShadow: '0 1px 3px rgba(16,24,40,0.06)' }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#4a9b8e' }}>{r.code}</div>
            <div style={{ marginTop: 6, fontSize: 16, fontWeight: 700, color: '#1e3a5f' }}>{r.label}</div>
            <div style={{ marginTop: 10, fontSize: 12, color: '#64748b' }}>/org/{r.path} →</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/service" element={<About />} />
        <Route path="/schoolpage" element={<OrgIntro />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/studenthome" element={<StudentHome />} />
        <Route path="/org" element={<OrgIndex />} />
        {ORG_ROUTES.map((r) => (
          <Route key={r.path} path={`/org/${r.path}`} element={<r.Comp />} />
        ))}
      </Routes>
    </BrowserRouter>
  )
}

export default App
