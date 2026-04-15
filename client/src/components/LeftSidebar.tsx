import React, { useState } from "react";
import { useEditorStore } from "../store/useEditorStore";
import {
  Type, AlignLeft, CheckCircle2, CheckSquare, List, Calendar,
  UploadCloud, Star, ToggleLeft, ListTree, MousePointer2, ChevronDown
} from "lucide-react";

// 内部封装：左侧物料区专用的折叠面板
const MaterialSection = ({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-2">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between py-2 mb-1 group focus:outline-none">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-600 transition-colors">
          {title}
        </h2>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden"><div className="pb-4">{children}</div></div>
      </div>
    </div>
  );
};

interface LeftSidebarProps {
  isOpen: boolean;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ isOpen }) => {
  const addComponent = useEditorStore(state => state.addComponent);

  return (
    <aside className={`transition-all duration-300 ease-in-out border-r border-gray-200 bg-white flex flex-col overflow-hidden ${isOpen ? "w-64 opacity-100" : "w-0 border-r-0 opacity-0"}`}>
      <div className="w-64 p-4 overflow-y-auto custom-scrollbar flex-1 pb-20">
        
        <MaterialSection title="基础组件" defaultOpen={true}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { type: "input", icon: Type, label: "单行文本" },
              { type: "textarea", icon: AlignLeft, label: "多行文本" },
              { type: "radio", icon: CheckCircle2, label: "单项选择" },
              { type: "checkbox", icon: CheckSquare, label: "多项选择" },
              { type: "select", icon: List, label: "下拉选择" },
              { type: "date", icon: Calendar, label: "日期选择" }
            ].map((item) => (
              <button key={item.type} onClick={() => addComponent(item.type as any)} className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:border-brand hover:text-brand bg-gray-50 hover:bg-white transition-all group shadow-sm">
                <item.icon className="w-5 h-5 mb-2 text-gray-500 group-hover:text-brand" />
                <span className="text-xs font-medium text-gray-600 group-hover:text-brand">{item.label}</span>
              </button>
            ))}
          </div>
        </MaterialSection>

        <MaterialSection title="高级组件" defaultOpen={true}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { type: "upload", icon: UploadCloud, label: "文件上传" },
              { type: "rate", icon: Star, label: "评分星级" },
              { type: "switch", icon: ToggleLeft, label: "开关" },
              { type: "cascader", icon: ListTree, label: "级联选择" },
            ].map((item) => (
              <button key={item.type} onClick={() => addComponent(item.type as any)} className="flex flex-col items-center justify-center p-3 border border-indigo-100 rounded-lg hover:border-indigo-500 hover:text-indigo-600 bg-indigo-50/30 hover:bg-indigo-50 transition-all group shadow-sm">
                <item.icon className="w-5 h-5 mb-2 text-indigo-400 group-hover:text-indigo-600" />
                <span className="text-xs font-medium text-slate-600 group-hover:text-indigo-600">{item.label}</span>
              </button>
            ))}
          </div>
        </MaterialSection>

        <MaterialSection title="系统组件" defaultOpen={true}>
          <div className="grid grid-cols-2 gap-3">
             <button onClick={() => addComponent("button")} className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:border-brand hover:text-brand bg-gray-50 hover:bg-white transition-all group shadow-sm">
                <MousePointer2 className="w-5 h-5 mb-2 text-gray-500 group-hover:text-brand" />
                <span className="text-xs font-medium text-gray-600 group-hover:text-brand">提交按钮</span>
              </button>
          </div>
        </MaterialSection>
        
      </div>
    </aside>
  );
};