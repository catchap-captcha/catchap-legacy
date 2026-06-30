import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Main from './pages/public/Main'
import About from './pages/public/About'
import OrgIntro from './pages/public/OrgIntro'
import Privacy from './pages/public/Privacy'
import Login from './pages/public/Login'
import ResetPassword from './pages/public/ResetPassword'
import StudentHome from './pages/student/Home'

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
      </Routes>
    </BrowserRouter>
  )
}

export default App
