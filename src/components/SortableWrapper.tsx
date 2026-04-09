import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type ComponentSchema } from "../types/editor";

interface Props {
  component: ComponentSchema;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

export const SortableWrapper: React.FC<Props> = ({
  component,
  isSelected,
  onClick,
  children,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // 提取拖拽状态
  } = useSortable({ id: component.id });

  const style = {
    ...component.style,
    transform: CSS.Translate.toString(transform), // 必须是 Translate
    transition, // 使用 dnd-kit 原生的 transition
    zIndex: isDragging ? 999 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`relative cursor-pointer transition-colors duration-200 ${
        isSelected
          ? "ring-2 ring-brand ring-inset bg-brand/5 shadow-sm"
          : "hover:ring-1 hover:ring-brand/50 hover:ring-inset"
      }`}
    >
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand" />
      )}
      {/* 这是一个包裹器，防止拖拽手势和内部的点击冲突 */}
      <div className="pointer-events-none">{children}</div>
    </div>
  );
};
