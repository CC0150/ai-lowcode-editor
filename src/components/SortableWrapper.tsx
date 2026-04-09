import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ComponentSchema } from '../types/editor';

interface Props {
  component: ComponentSchema;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

export const SortableWrapper: React.FC<Props> = ({ component, isSelected, onClick, children }) => {
  // 使用 dnd-kit 的 sortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: component.id });

  // 处理拖拽时的形变和过渡动画
  const style = {
    ...component.style,
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      // 这里必须绑定 attributes 和 listeners，这样组件才能被鼠标抓取
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`relative cursor-pointer transition-colors duration-200 ${
        isSelected 
          ? 'ring-2 ring-brand ring-inset bg-brand/5 z-10 shadow-sm' 
          : 'hover:ring-1 hover:ring-brand/50 hover:ring-inset'
      }`}
    >
      {/* 选中时左侧显示一个小提示条，增加低代码平台的专业感 */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand" />
      )}
      {children}
    </div>
  );
};