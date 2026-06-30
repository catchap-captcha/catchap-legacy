import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Main from './pages/public/Main'
import About from './pages/public/About'
import OrgIntro from './pages/public/OrgIntro'
import Privacy from './pages/public/Privacy'
import Login from './pages/public/Login'
import ResetPassword from './pages/public/ResetPassword'
import StudentHome from './pages/student/Home'
import ParentHome from './pages/parent/Home'
import ParentChildren from './pages/parent/Children'
import ParentChildDetail from './pages/parent/ChildDetail'
import ParentWeeklyReport from './pages/parent/WeeklyReport'
import ParentLearningLog from './pages/parent/LearningLog'
import ParentNotifications from './pages/parent/Notifications'
import ParentAchievements from './pages/parent/Achievements'
import ParentDataPrivacy from './pages/parent/DataPrivacy'

// 학부모 페이지는 풀스크린 대시보드라 #root(1126px 가운데정렬, text-align:center)
// 제약을 벗어나도록 뷰포트 전체 폭으로 펼치고 좌측 정렬로 되돌린다.
const fullBleed: React.CSSProperties = {
  textAlign: 'left',
  width: '100vw',
  position: 'relative',
  left: '50%',
  marginLeft: '-50vw',
}

function Parent({ children }: { children: React.ReactNode }) {
  return <div style={fullBleed}>{children}</div>
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

        {/* 학부모(PAR) 페이지 */}
        <Route path="/parent" element={<Navigate to="/parent/home" replace />} />
        <Route path="/parent/home" element={<Parent><ParentHome /></Parent>} />
        <Route path="/parent/children" element={<Parent><ParentChildren /></Parent>} />
        <Route path="/parent/child" element={<Parent><ParentChildDetail /></Parent>} />
        <Route path="/parent/report" element={<Parent><ParentWeeklyReport /></Parent>} />
        <Route path="/parent/learning" element={<Parent><ParentLearningLog /></Parent>} />
        <Route path="/parent/notifications" element={<Parent><ParentNotifications /></Parent>} />
        <Route path="/parent/achievements" element={<Parent><ParentAchievements /></Parent>} />
        <Route path="/parent/privacy" element={<Parent><ParentDataPrivacy /></Parent>} />
        {/* 설정 페이지는 아직 없어 개인정보·데이터 관리로 연결 */}
        <Route path="/parent/settings" element={<Parent><ParentDataPrivacy /></Parent>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
