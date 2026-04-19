import { useEffect, useState } from "react";
import { useEditorStore } from "./store/useEditorStore";
import {
    PanelLeftClose,
    PanelLeftOpen,
    PanelRightClose,
    PanelRightOpen,
    Undo2,
    Redo2,
    Globe
} from "lucide-react";
import { ExportModal } from "./components/ExportModal";
import { FormPreview } from "./components/FormPreview";
import { AIGenerator } from "./components/AIGenerator";
import { LeftSidebar } from "./components/LeftSidebar";
import { EditorCanvas } from "./components/EditorCanvas";
import { RightSidebar } from "./components/RightSidebar";
import { useUIStore } from "./store/useUIStore";
import { Logo } from "./components/Logo";
import { PublishModal } from "./components/PublishModal";

export function EditorLayout() {
    const { past, future, undo, redo } = useEditorStore();
    const { leftOpen, rightOpen, toggleLeft, toggleRight } = useUIStore();

    // 页面全局控制状态
    const [isPreview, setIsPreview] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    // 监听键盘快捷键 (撤销/重做)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            )
                return;
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
            {/*  顶部导航  */}
            <header className="shrink-0 h-14 border-b border-gray-200 bg-white/90 backdrop-blur-md flex items-center px-4 justify-between z-20 shadow-sm relative">
                {/* 1. 左侧：Logo 和侧边栏开关 */}
                <div className="flex items-center gap-4 w-1/3">
                    <button
                        onClick={toggleLeft}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        {leftOpen ? (
                            <PanelLeftClose className="w-5 h-5" />
                        ) : (
                            <PanelLeftOpen className="w-5 h-5" />
                        )}
                    </button>
                    <div className="flex items-center gap-2">
                        <Logo className="w-9 h-9" />
                        <h1 className="font-bold text-lg text-gray-800 tracking-tight">
                            AI Form <span className="text-indigo-600">Pro</span>
                        </h1>
                    </div>
                </div>

                {/* 2. 中间：全局 AI 指挥中心入口 */}
                <div className="flex items-center justify-center w-1/3">
                    <AIGenerator />
                </div>

                {/* 3. 右侧：操作区 */}
                <div className="flex items-center justify-end gap-4 w-1/3">
                    <div className="flex items-center gap-1 border-r border-gray-200 pr-4 mr-1">
                        <button
                            onClick={undo}
                            disabled={past.length === 0}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Undo2 className="w-[18px] h-[18px]" />
                        </button>
                        <button
                            onClick={redo}
                            disabled={future.length === 0}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Redo2 className="w-[18px] h-[18px]" />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsExporting(true)}
                        className="text-brand bg-brand/10 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-brand/20 transition-colors"
                    >
                        导出
                    </button>
                    <button
                        onClick={() => setIsPreview(true)}
                        className="bg-brand text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-brand/90 transition-colors shadow-sm"
                    >
                        预览
                    </button>
                    <button
                        onClick={() => setIsPublishing(true)}
                        className="bg-indigo-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-600/90 transition-colors shadow-sm flex items-center gap-1.5"
                    >
                        <Globe className="w-4 h-4" /> 发布
                    </button>
                    <button
                        onClick={toggleRight}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        {rightOpen ? (
                            <PanelRightClose className="w-5 h-5" />
                        ) : (
                            <PanelRightOpen className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </header>

            {/*  主体区域  */}
            <main className="flex-1 flex overflow-hidden relative">
                {/* 全局模态框 */}
                {isPreview && <FormPreview onBack={() => setIsPreview(false)} />}
                {isExporting && <ExportModal onClose={() => setIsExporting(false)} />}
                {isPublishing && <PublishModal onClose={() => setIsPublishing(false)} />}

                <LeftSidebar isOpen={leftOpen} />
                <EditorCanvas />
                <RightSidebar isOpen={rightOpen} />
            </main>
        </div>
    );
}
