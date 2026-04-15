import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useEditorStore } from "../store/useEditorStore";
import { type ComponentSchema } from "../types/editor";
import { FormPreview } from "./FormPreview";
import { Sparkles, Command, CornerDownLeft, X } from "lucide-react";
import { message } from "antd";

// 新增：残缺 JSON 修复器。尝试强行闭合未传输完的 JSON 结构，提取出已成型的组件数组
const parsePartialJSON = (jsonString: string) => {
  try {
    return JSON.parse(jsonString).components;
  } catch (e) {
    // 粗暴但有效的容错：穷举常见的截断闭合情况
    const closures = ["", "}", "]}", "}]}", "\"]}", '"}', '"]}', '}}]}'];
    let fixedText = jsonString.replace(/,\s*$/, ""); // 移除末尾多余的逗号
    
    for (const closure of closures) {
      try {
        const parsed = JSON.parse(fixedText + closure);
        if (parsed && Array.isArray(parsed.components)) {
          return parsed.components;
        }
      } catch (err) {}
    }
    return null; // 如果全都解析失败，说明数据还太少，返回 null 继续等待
  }
};

export function AIGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<ComponentSchema[] | null>(null);

  const applyAIGenerated = useEditorStore((state) => state.applyAIGenerated);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 1. 监听全局快捷键 Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 2. 弹窗打开时自动聚焦输入框
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setPreviewData([]); // 注意这里：将 null 改为 []，为了让 UI 尽早开始渲染
    
    let accumulatedText = "";

    try {
      const response = await fetch("http://localhost:3001/api/generate-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.body) throw new Error("无响应流");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 解码当前的 Buffer 块
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (dataStr === "[DONE]") break; // 传输完毕
            
            try {
              const parsedData = JSON.parse(dataStr);
              if (parsedData.error) {
                message.error(parsedData.error);
                return;
              }
              if (parsedData.content) {
                accumulatedText += parsedData.content;
                
                // 核心：实时解析截断的 JSON，一旦解析出有效的组件，立刻塞给预览区渲染
                const partialComponents = parsePartialJSON(accumulatedText);
                if (partialComponents && partialComponents.length > 0) {
                  setPreviewData(partialComponents);
                }
              }
            } catch (e) {
              // 忽略解析单行 data 时的错误
            }
          }
        }
      }
    } catch (error) {
      console.error("请求异常:", error);
      message.error("请求后端接口失败");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (previewData) {
      applyAIGenerated(previewData);
      setIsOpen(false); // 关闭弹窗
      setPreviewData(null);
      setPrompt("");
    }
  };

  const modalContent = isOpen ? (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/5 backdrop-blur-md transition-all p-4 animate-in fade-in duration-200"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="w-full max-w-[700px] bg-white/95 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col border border-slate-200/50 animate-in zoom-in-95 duration-200 ease-out"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex items-center px-6 py-5">
          <Sparkles className="w-7 h-7 text-indigo-600 mr-4 drop-shadow-sm" />
          <textarea
            ref={inputRef}
            className="flex-1 bg-transparent text-xl text-slate-800 placeholder-slate-300 outline-none resize-none font-medium leading-relaxed"
            rows={prompt.length > 30 ? 2 : 1}
            placeholder="例如：创建一个面试登记表，包含姓名、手机号和技术栈多选框..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />
          {prompt.length > 0 && !loading && (
            <button onClick={() => setPrompt("")} className="ml-2 p-1 text-slate-300 hover:text-slate-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {(previewData || loading) && (
          <>
            <div className="h-[1px] w-full bg-slate-100" />
            <div className="flex-1 overflow-y-auto bg-slate-50/80 p-6 custom-scrollbar relative max-h-[60vh]">
              
              {/* 如果已经有数据了，就直接渲染，并在角落悬浮 Loading 提示 */}
              {previewData && previewData.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[200px]">
                  <FormPreview overrideComponents={previewData} isEmbedded={true} />
                  
                  {loading && (
                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur shadow-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-indigo-50 animate-in fade-in zoom-in slide-in-from-bottom-2">
                       <div className="w-3 h-3 border-2 border-indigo-200 rounded-full animate-spin border-t-indigo-500"></div>
                       <span className="text-xs text-indigo-600 font-medium">AI 正在书写...</span>
                    </div>
                  )}
                </div>
              ) : loading ? (
                /* 首字到达前，依然显示居中的大 Loading */
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 py-12">
                  <div className="relative">
                     <div className="w-12 h-12 border-4 border-indigo-100 rounded-full animate-spin border-t-indigo-500"></div>
                     <Sparkles className="w-5 h-5 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-sm font-medium animate-pulse">正在理解您的需求...</p>
                </div>
              ) : null}
            </div>

            <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-5">
                <span className="flex items-center gap-1.5">
                  <kbd className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 font-mono shadow-sm">ESC</kbd> 
                  取消
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 font-mono shadow-sm">↵</kbd> 
                  生成
                </span>
              </div>
              
              {previewData && !loading && (
                <button
                  onClick={handleConfirm}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-md active:scale-95"
                >
                  确认导入 <CornerDownLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between w-80 px-3 py-1.5 bg-slate-100/60 hover:bg-slate-100 border border-slate-200/60 rounded-lg text-sm text-slate-500 transition-all backdrop-blur-md group focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
      >
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          <span className="text-slate-400 group-hover:text-slate-600 transition-colors">
            让 AI 帮你生成表单...
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono font-medium text-slate-400 bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-200">
          <Command className="w-3 h-3" /> K
        </div>
      </button>

      {createPortal(modalContent, document.body)}
    </>
  );
}