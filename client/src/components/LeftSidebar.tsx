import React from "react";
import { useEditorStore } from "../store/useEditorStore";
import {
  Type,
  AlignLeft,
  CheckCircle2,
  CheckSquare,
  List,
  Calendar,
  UploadCloud,
  Star,
  ToggleLeft,
  ListTree,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { Popconfirm } from "antd";
import { useUIStore } from "../store/useUIStore";

// 内部封装：左侧物料区专用的折叠面板
const MaterialSection = ({
  panelId,
  title,
  children,
  defaultOpen = true,
}: {
  panelId: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const { expandedPanels, togglePanel } = useUIStore();

  // 如果 store 中没有该 panelId 的记录，则使用 defaultOpen 作为默认状态
  const isOpen = expandedPanels[panelId] ?? defaultOpen;

  return (
    <div className="mb-2">
      <button
        onClick={() => togglePanel(panelId, defaultOpen)}
        className="w-full flex items-center justify-between py-2 mb-1 group focus:outline-none"
      >
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-600 transition-colors">
          {title}
        </h2>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

interface LeftSidebarProps {
  isOpen: boolean;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ isOpen }) => {
  const { addComponent, components, clearCanvas } = useEditorStore();

  return (
    <aside
      className={`transition-all duration-300 ease-in-out border-r border-gray-200 bg-white flex flex-col overflow-hidden ${isOpen ? "w-64 opacity-100" : "w-0 border-r-0 opacity-0"}`}
    >
      {/* 修改点 1：移除 relative，添加 flex flex-col 让内部容器支持 flex 纵向布局 */}
      <div className="w-64 p-4 overflow-y-auto custom-scrollbar flex-1 flex flex-col">
        {/* 顶部物料组件区域 */}
        <div className="shrink-0">
          <MaterialSection
            panelId="material-basic"
            title="基础组件"
            defaultOpen={true}
          >
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: "input", icon: Type, label: "单行文本" },
                { type: "textarea", icon: AlignLeft, label: "多行文本" },
                { type: "radio", icon: CheckCircle2, label: "单项选择" },
                { type: "checkbox", icon: CheckSquare, label: "多项选择" },
                { type: "select", icon: List, label: "下拉选择" },
                { type: "date", icon: Calendar, label: "日期选择" },
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
          </MaterialSection>

          <MaterialSection
            panelId="material-advanced"
            title="高级组件"
            defaultOpen={true}
          >
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: "upload", icon: UploadCloud, label: "文件上传" },
                { type: "rate", icon: Star, label: "评分星级" },
                { type: "switch", icon: ToggleLeft, label: "开关" },
                { type: "cascader", icon: ListTree, label: "级联选择" },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => addComponent(item.type as any)}
                  className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:border-brand hover:text-brand bg-gray-50/30 hover:bg-white transition-all group shadow-sm"
                >
                  <item.icon className="w-5 h-5 mb-2 text-gray-500 group-hover:text-brand" />
                  <span className="text-xs font-medium text-gray-600 group-hover:text-brand">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </MaterialSection>
        </div>

        {/* 修改点 2：底部悬浮操作区 */}
        <div className="w-50 mx-auto mt-auto p-4 border-t border-gray-100 shrink-0">
          <Popconfirm
            title="清空画布"
            description="确定要清空所有组件吗？(可使用 Ctrl+Z 撤销)"
            onConfirm={() => clearCanvas()}
            okText="确认清空"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            placement="top"
          >
            <button
              disabled={components.length === 0}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              <Trash2 className="w-4 h-4" />
              清空画布
            </button>
          </Popconfirm>
        </div>
      </div>
    </aside>
  );
};
