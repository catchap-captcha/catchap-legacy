import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Main from './pages/public/Main'
import About from './pages/public/About'
import OrgIntro from './pages/public/OrgIntro'
import Privacy from './pages/public/Privacy'
import Login from './pages/public/Login'
import ResetPassword from './pages/public/ResetPassword'

import Home from './pages/student/Home'
import PickPlay from './pages/student/PickPlay'
import QuizCounting from './pages/student/QuizCounting'
import StageMap from './pages/student/StageMap'
import QuizSafety from './pages/student/QuizSafety'
import PlayStart from './pages/student/PlayStart'
import QuizShapeColor from './pages/student/QuizShapeColor'
import QuizHangul from './pages/student/QuizHangul'
import QuizDrag from './pages/student/QuizDrag'
import Result from './pages/student/Result'
import Retry from './pages/student/Retry'
import Hint from './pages/student/Hint'
import StageComplete from './pages/student/StageComplete'
import LevelUp from './pages/student/LevelUp'
import Stickers from './pages/student/Stickers'
import KinderLogin from './pages/student/KinderLogin'
import Profile from './pages/student/Profile'
import Settings from './pages/student/Settings'
import Notifications from './pages/student/Notifications'
import Recommend from './pages/student/Recommend'
import History from './pages/student/History'
import Subject from './pages/student/Subject'
import ClassRank from './pages/student/ClassRank'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/main" replace />} />
        
        <Route path="/main" element={<Main />} />
        <Route path="/about" element={<About />} />
        <Route path="/orgintro" element={<OrgIntro />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/resetpassword" element={<ResetPassword />} />

        <Route path="/student/home" element={<Home />} />
        <Route path="/student/pick-play" element={<PickPlay />} />
        <Route path="/student/quiz-counting" element={<QuizCounting />} />
        <Route path="/student/stage-map" element={<StageMap />} />
        <Route path="/student/quiz-safety" element={<QuizSafety />} />
        <Route path="/student/play-start" element={<PlayStart />} />
        <Route path="/student/quiz-shape-color" element={<QuizShapeColor />} />
        <Route path="/student/quiz-hangul" element={<QuizHangul />} />
        <Route path="/student/quiz-drag" element={<QuizDrag />} />
        <Route path="/student/result" element={<Result />} />
        <Route path="/student/retry" element={<Retry />} />
        <Route path="/student/hint" element={<Hint />} />
        <Route path="/student/stage-complete" element={<StageComplete />} />
        <Route path="/student/level-up" element={<LevelUp />} />
        <Route path="/student/stickers" element={<Stickers />} />
        <Route path="/student/kinder-login" element={<KinderLogin />} />
        <Route path="/student/profile" element={<Profile />} />
        <Route path="/student/settings" element={<Settings />} />
        <Route path="/student/notifications" element={<Notifications />} />
        <Route path="/student/recommend" element={<Recommend />} />
        <Route path="/student/history" element={<History />} />
        <Route path="/student/subject" element={<Subject />} />
        <Route path="/student/class-rank" element={<ClassRank />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
