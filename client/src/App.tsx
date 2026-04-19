import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EditorLayout } from "./EditorLayout";
import { SharePage } from "./components/SharePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 编辑器主路由 */}
        <Route path="/" element={<EditorLayout />} />
        
        {/* 扫码填表独立路由 */}
        <Route path="/share/:formId" element={<SharePage />} />
      </Routes>
    </BrowserRouter>
  );
}