// src/App.tsx
import { HashRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ChapterPage from "./pages/ChapterPage";
import ApiCaptchaPage from "./pages/ApiCaptchaPage";
import PlayPage from "./game/PlayPage";
import { categories } from "./game/categories";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/api-captcha" element={<ApiCaptchaPage />} />
        {categories.map((category) => (
          <Route
            key={category.key}
            path={category.path}
            element={<ChapterPage category={category} />}
          />
        ))}
        {categories.map((category) => (
          <Route
            key={`${category.key}-stage`}
            path={`${category.path}/:stage`}
            element={<PlayPage category={category} />}
          />
        ))}
      </Routes>
    </HashRouter>
  );
}
