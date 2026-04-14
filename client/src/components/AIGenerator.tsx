import { useState } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { type ComponentSchema } from "../types/editor";
import { FormPreview } from "./FormPreview"; // 引入你已经写好的预览组件

export function AIGenerator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  // 用于存放 AI 返回的临时数据，如果不为 null，则代表 Modal 应该打开
  const [previewData, setPreviewData] = useState<ComponentSchema[] | null>(
    null,
  );

  const applyAIGenerated = useEditorStore((state) => state.applyAIGenerated);

  // 1. 发送给后端请求 AI 数据
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/generate-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        // 请求成功，存入 previewData 打开弹窗
        setPreviewData(result.data);
      } else {
        alert("AI 生成失败：" + result.error);
      }
    } catch (error) {
      console.error("请求后端异常:", error);
      alert("请求后端接口失败，请确认 server 是否启动");
    } finally {
      setLoading(false);
    }
  };

  // 2. 用户确认使用此表单
  const handleConfirm = () => {
    if (previewData) {
      applyAIGenerated(previewData); // 覆盖到真实画布
      setPreviewData(null); // 关闭 Modal
      setPrompt(""); // 清空输入框
    }
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-blue-50/50">
      <div className="text-sm font-bold text-blue-600 mb-2">✨ AI 智能生成</div>
      <textarea
        className="w-full text-sm p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        rows={3}
        placeholder="例如：创建一个用户注册表单，包含姓名、邮箱、密码..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium disabled:bg-blue-300 flex items-center justify-center transition-colors"
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            AI 正在生成中...
          </>
        ) : (
          "一键生成表单"
        )}
      </button>

      {/* AI 预览 Modal */}
      {previewData && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="font-bold text-lg text-gray-800">
                  ✨ AI 智能预览
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  你可以试填表单，确认联动逻辑无误后再应用
                </p>
              </div>
              <button
                onClick={() => setPreviewData(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            {/* 核心改变：复用 FormPreview，传入 overrideComponents，并且开启 isEmbedded 模式 */}
            <div className="overflow-y-auto flex-1 custom-scrollbar bg-gray-50/50 relative">
              <FormPreview overrideComponents={previewData} isEmbedded={true} />
            </div>

            <div className="p-5 border-t flex justify-end gap-3 bg-white">
              <button
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
                onClick={() => setPreviewData(null)}
              >
                重新输入
              </button>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-md shadow-blue-200 transition-all"
                onClick={handleConfirm}
              >
                确认使用，开始编辑
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
