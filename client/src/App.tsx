import { useEffect, useState } from "react";
import { useEditorStore } from "./store/useEditorStore";
import { SetterPanel } from "./components/SetterPanel";
import { SortableWrapper } from "./components/SortableWrapper";
import {
  Type,
  CheckCircle2,
  List,
  MousePointer2,
  Box,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Undo2,
  Redo2,
  AlignLeft,
  CheckSquare,
  Calendar,
} from "lucide-react";
import { ExportModal } from "./components/ExportModal";
import { AIGenerator } from "./components/AIGenerator";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FormPreview } from "./components/FormPreview";

export default function App() {
  // 从全局 Zustand store 中获取状态和方法
  const {
    components,
    addComponent,
    selectedId,
    selectComponent,
    reorderComponents,
    past,
    future,
    undo,
    redo,
  } = useEditorStore();

  // 控制左右侧边栏的折叠状态
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  // 控制预览模式的打开状态
  const [isPreview, setIsPreview] = useState(false);

  // 控制导出模式的打开状态
  const [isExporting, setIsExporting] = useState(false);

  // 配置拖拽传感器：鼠标移动 5 像素才被认为是拖拽，防止和点击选中事件冲突
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // 处理拖拽排序结束事件
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = components.findIndex((c) => c.id === active.id);
      const newIndex = components.findIndex((c) => c.id === over.id);
      reorderComponents(oldIndex, newIndex);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 避免在输入框打字时触发撤销
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          redo(); // Ctrl+Shift+Z 重做
        } else {
          e.preventDefault();
          undo(); // Ctrl+Z 撤销
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo(); // Ctrl+Y 重做
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden font-sans text-slate-800">
      {/* ---------- 顶部导航 ---------- */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center px-4 justify-between z-20 shadow-sm relative">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLeftOpen(!leftOpen)}
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
          >
            {leftOpen ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelLeftOpen className="w-5 h-5" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand flex items-center justify-center">
              <Box className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-bold text-lg text-gray-800">表单引擎 Pro</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* === 新增：历史记录操作区 === */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-4 mr-1">
            <button
              onClick={undo}
              disabled={past.length === 0}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="撤销 (Ctrl+Z)"
            >
              <Undo2 className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={redo}
              disabled={future.length === 0}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="重做 (Ctrl+Y 或 Ctrl+Shift+Z)"
            >
              <Redo2 className="w-[18px] h-[18px]" />
            </button>
          </div>

          <button
            onClick={() => setIsExporting(true)}
            className="text-brand bg-brand/10 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-brand/20 transition-colors"
          >
            导出代码
          </button>
          <button
            onClick={() => setIsPreview(true)}
            className="bg-brand text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-brand/90 transition-colors shadow-sm"
          >
            预览表单
          </button>
          <button
            onClick={() => setRightOpen(!rightOpen)}
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

      {/* ---------- 主体区域 ---------- */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* 如果处于预览模式，直接渲染预览组件并覆盖整个区域 */}
        {isPreview && <FormPreview onBack={() => setIsPreview(false)} />}
        {isExporting && <ExportModal onClose={() => setIsExporting(false)} />}

        {/* === 左侧物料区 === */}
        <aside
          className={`transition-all duration-300 ease-in-out border-r border-gray-200 bg-white flex flex-col overflow-hidden ${leftOpen ? "w-64 opacity-100" : "w-0 border-r-0 opacity-0"}`}
        >
          <AIGenerator />
          <div className="w-64 p-4 overflow-y-auto">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              表单组件
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: "input", icon: Type, label: "单行文本" },
                { type: "textarea", icon: AlignLeft, label: "多行文本" },
                { type: "radio", icon: CheckCircle2, label: "单项选择" },
                { type: "checkbox", icon: CheckSquare, label: "多项选择" },
                { type: "select", icon: List, label: "下拉选择" },
                { type: "date", icon: Calendar, label: "日期选择" },
                { type: "button", icon: MousePointer2, label: "提交按钮" },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => addComponent(item.type as any)}
                  className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:border-brand hover:text-brand bg-gray-50 hover:bg-white transition-all group shadow-sm"
                >
                  <item.icon className="w-5 h-5 mb-2 text-gray-500 group-hover:text-brand" />
                  <span className="text-xs font-medium text-gray-600 group-hover:text-brand">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* === 中间画布区 === */}
        <section
          className="flex-1 bg-gray-100 p-8 overflow-auto flex items-start justify-center transition-all duration-300"
          onClick={() => selectComponent(null)} // 点击画布空白处取消选中
        >
          <div
            className="w-full max-w-2xl bg-white shadow-xl rounded-xl min-h-[600px] p-10 ring-1 ring-gray-200/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 表单静态页头 */}
            <div className="border-b-2 border-gray-100 pb-4 mb-8">
              <h1 className="text-2xl font-bold text-center text-gray-800">
                用户调研问卷
              </h1>
              <p className="text-gray-500 text-sm text-center mt-2">
                请如实填写以下信息
              </p>
            </div>

            {/* 拖拽排序上下文 */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={components.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {components.map((comp, index) => (
                  <SortableWrapper
                    key={comp.id}
                    id={comp.id}
                    isSelected={selectedId === comp.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectComponent(comp.id);
                    }}
                  >
                    {/* --- 表单引擎核心渲染器 --- */}
                    {/* pointer-events-none 的作用是防止内部的 input 抢夺鼠标的拖拽焦点 */}
                    <div className="flex flex-col gap-2 pointer-events-none">
                      {/* 统一渲染标题 (Label) 和必填星号 */}
                      {comp.type !== "button" && (
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          {index + 1}. {comp.label}
                          {comp.required && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                      )}

                      {/* 根据组件类型动态渲染控件 */}
                      {comp.type === "input" && (
                        <input
                          type="text"
                          placeholder={comp.props.placeholder}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50"
                          readOnly
                        />
                      )}

                      {comp.type === "radio" && (
                        <div className="flex flex-col gap-2 mt-1">
                          {comp.props.options?.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input
                                type="radio"
                                className="w-4 h-4 text-brand"
                                readOnly
                              />
                              <span className="text-sm text-gray-600">
                                {opt.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {comp.type === "select" && (
                        <select
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50"
                          disabled
                        >
                          <option>请选择...</option>
                          {comp.props.options?.map((opt, i) => (
                            <option key={i}>{opt.label}</option>
                          ))}
                        </select>
                      )}

                      {comp.type === "button" && (
                        <button className="w-full bg-brand text-white py-2.5 rounded-md font-medium mt-4 shadow-sm">
                          {comp.props.buttonText}
                        </button>
                      )}

                      {comp.type === "textarea" && (
                        <textarea
                          placeholder={comp.props.placeholder}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 resize-none h-20"
                          readOnly
                        />
                      )}

                      {comp.type === "checkbox" && (
                        <div className="flex flex-col gap-2 mt-1">
                          {comp.props.options?.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-brand rounded"
                                readOnly
                              />
                              <span className="text-sm text-gray-600">
                                {opt.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {comp.type === "date" && (
                        <input
                          type="date"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50"
                          readOnly
                        />
                      )}
                    </div>
                  </SortableWrapper>
                ))}
              </SortableContext>
            </DndContext>

            {/* 画布为空时的占位提示 */}
            {components.length === 0 && (
              <div className="text-center text-gray-400 mt-10 border-2 border-dashed border-gray-200 py-16 rounded-xl bg-gray-50/50">
                点击左侧组件，开始搭建表单
              </div>
            )}
          </div>
        </section>

        {/* === 右侧配置区 === */}
        <aside
          className={`transition-all duration-300 ease-in-out border-l border-gray-200 bg-white shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 overflow-hidden ${rightOpen ? "w-80 opacity-100" : "w-0 border-l-0 opacity-0"}`}
        >
          <div className="w-80 h-full overflow-y-auto">
            <SetterPanel />
          </div>
        </aside>
      </main>
    </div>
  );
}
