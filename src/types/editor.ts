import React from 'react';

// 支持的组件类型
export type ComponentType = 'text' | 'button' | 'image' | 'container';

// 单个组件的数据结构 (JSON Schema)
export interface ComponentSchema {
  id: string;
  type: ComponentType;
  name: string; // 在面板上显示的名称
  props: Record<string, any>; // 业务属性，如 text, src
  style: React.CSSProperties; // 样式属性，如 color, fontSize
  children?: ComponentSchema[]; // 嵌套组件
}

// 状态管理器的类型定义
export interface EditorStore {
  components: ComponentSchema[];
  selectedId: string | null;
  addComponent: (type: ComponentType) => void;
  selectComponent: (id: string | null) => void;
  updateProps: (id: string, props: any) => void;
  updateStyle: (id: string, style: React.CSSProperties) => void;
  // 重新排序组件
   reorderComponents: (oldIndex: number, newIndex: number) => void;
}