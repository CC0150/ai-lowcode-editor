import { useEffect, useState } from "react";
import { useEditorStore } from "./store/useEditorStore";
import { Box, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Undo2, Redo2 } from "lucide-react";
import { ExportModal } from "./components/ExportModal";
import { FormPreview } from "./components/FormPreview";
import { AIGenerator } from "./components/AIGenerator";
import { LeftSidebar } from "./components/LeftSideBar";
import { EditorCanvas } from "./components/EditorCanvas";
import { RightSidebar } from "./components/RightSideBar";

export default function App() {
  const { past, future, undo, redo } = useEditorStore();
  
  // 页面全局控制状态
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // 监听键盘快捷键 (撤销/重做)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.shiftKey ? redo() : undo();
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden font-sans text-slate-800">
      
      {/* ---------- 顶部导航 ---------- */}
      <header className="shrink-0 h-14 border-b border-gray-200 bg-white/90 backdrop-blur-md flex items-center px-4 justify-between z-20 shadow-sm relative">
        
        {/* 1. 左侧：Logo 和侧边栏开关 */}
        <div className="flex items-center gap-4 w-1/3">
          <button onClick={() => setLeftOpen(!leftOpen)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
            {leftOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand flex items-center justify-center shadow-sm">
              <Box className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-bold text-lg text-gray-800">表单引擎 Pro</h1>
          </div>
        </div>
        
        {/* 2. 中间：全局 AI 指挥中心入口 */}
        <div className="flex items-center justify-center w-1/3">
          <AIGenerator />
        </div>

        {/* 3. 右侧：操作区 */}
        <div className="flex items-center justify-end gap-4 w-1/3">
          <div className="flex items-center gap-1 border-r border-gray-200 pr-4 mr-1">
            <button onClick={undo} disabled={past.length === 0} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <Undo2 className="w-[18px] h-[18px]" />
            </button>
            <button onClick={redo} disabled={future.length === 0} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <Redo2 className="w-[18px] h-[18px]" />
            </button>
          </div>
          <button onClick={() => setIsExporting(true)} className="text-brand bg-brand/10 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-brand/20 transition-colors">导出代码</button>
          <button onClick={() => setIsPreview(true)} className="bg-brand text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-brand/90 transition-colors shadow-sm">预览表单</button>
          <button onClick={() => setRightOpen(!rightOpen)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
            {rightOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ---------- 主体区域 ---------- */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* 全局模态框 */}
        {isPreview && <FormPreview onBack={() => setIsPreview(false)} />}
        {isExporting && <ExportModal onClose={() => setIsExporting(false)} />}

        {/* 左、中、右三大组件组装 */}
        <LeftSidebar isOpen={leftOpen} />
        <EditorCanvas />
        <RightSidebar isOpen={rightOpen} />
      </main>
      
    </div>
  );
}