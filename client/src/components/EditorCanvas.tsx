import React from "react";
import { useEditorStore } from "../store/useEditorStore";
import { SortableWrapper } from "./SortableWrapper";
import { UploadCloud, Star, ListTree } from "lucide-react";
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

export const EditorCanvas: React.FC = () => {
  const {
    components,
    selectedId,
    selectComponent,
    reorderComponents,
    canvasTitle,
    updateTitle,
  } = useEditorStore();
  /** 组件拖动传感器 */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = components.findIndex((c) => c.id === active.id);
      const newIndex = components.findIndex((c) => c.id === over.id);
      reorderComponents(oldIndex, newIndex);
    }
  };

  return (
    <section
      className="flex-1 bg-gray-100 p-8 overflow-auto flex items-start justify-center transition-all duration-300 custom-scrollbar"
      onClick={() => selectComponent(null)}
    >
      <div
        className="w-full max-w-2xl bg-white shadow-xl rounded-xl min-h-[560px] p-10 ring-1 ring-gray-200/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b-2 border-gray-100 pb-4 mb-8">
          <input
            value={canvasTitle}
            onChange={(e) => updateTitle(e.target.value)}
            className="text-2xl font-bold text-center text-gray-800 w-full border-none focus:ring-0 bg-transparent hover:bg-gray-50 rounded transition-colors"
            placeholder="请输入表单标题"
          />
          <p className="text-gray-500 text-sm text-center mt-2">
            请如实填写以下信息
          </p>
        </div>

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
                <div className="flex flex-col gap-2 pointer-events-none">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    {index + 1}. {comp.label}{" "}
                    {comp.required && <span className="text-red-500">*</span>}
                  </label>

                  {/* 基础组件 */}
                  {comp.type === "input" && (
                    <input
                      type="text"
                      placeholder={comp.props.placeholder}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50"
                      readOnly
                    />
                  )}
                  {comp.type === "textarea" && (
                    <textarea
                      placeholder={comp.props.placeholder}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 resize-none h-20"
                      readOnly
                    />
                  )}
                  {comp.type === "date" && (
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-400"
                      readOnly
                    />
                  )}
                  {comp.type === "select" && (
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50"
                      disabled
                    >
                      <option>请选择...</option>
                    </select>
                  )}
                  {comp.type === "radio" && (
                    <div
                      className={`flex mt-1 gap-4 ${comp.props.direction === "horizontal" ? "flex-row flex-wrap" : "flex-col"}`}
                    >
                      {(comp.props.options?.length
                        ? comp.props.options
                        : [{ label: "选项一" }, { label: "选项二" }]
                      ).map((opt, i) => (
                        <label key={i} className="flex items-center gap-2">
                          <input type="radio" className="w-4 h-4" readOnly />
                          <span className="text-sm">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {comp.type === "checkbox" && (
                    <div
                      className={`flex mt-1 gap-4 ${comp.props.direction === "horizontal" ? "flex-row flex-wrap" : "flex-col"}`}
                    >
                      {(comp.props.options?.length
                        ? comp.props.options
                        : [{ label: "选项一" }, { label: "选项二" }]
                      ).map((opt, i) => (
                        <label key={i} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded"
                            readOnly
                          />
                          <span className="text-sm">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* 高级组件占位 */}
                  {comp.type === "upload" && (
                    <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                      <UploadCloud className="w-8 h-8 mb-2" />
                      <span className="text-sm">点击或拖拽文件上传</span>
                    </div>
                  )}
                  {comp.type === "rate" && (
                    <div className="flex gap-1">
                      {Array.from({ length: comp.props.maxRate || 5 }).map(
                        (_, i) => (
                          <Star
                            key={i}
                            className="w-6 h-6 text-gray-300 fill-gray-200"
                          />
                        ),
                      )}
                    </div>
                  )}
                  {comp.type === "switch" && (
                    <div className="w-11 h-6 bg-gray-200 rounded-full relative">
                      <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm"></div>
                    </div>
                  )}
                  {comp.type === "cascader" && (
                    <div className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 flex justify-between items-center text-gray-400">
                      <span>请选择级联层级...</span>
                      <ListTree className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </SortableWrapper>
            ))}
          </SortableContext>
        </DndContext>

        {components.length === 0 && (
          <div className="text-center text-gray-400 mt-10 border-2 border-dashed border-gray-200 py-16 rounded-xl bg-gray-50/50">
            点击左侧组件，开始搭建表单
          </div>
        )}
      </div>
    </section>
  );
};
