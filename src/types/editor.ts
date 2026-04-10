// 表单专用的组件类型
export type FormItemType = 'input' | 'textarea' | 'radio' | 'select' | 'button';

// 选项接口（用于单选、多选、下拉）
export interface OptionItem {
  label: string;
  value: string;
}

// 核心：表单组件 Schema
export interface ComponentSchema {
  id: string;
  type: FormItemType;
  label: string; // 表单项的标题（如：“您的姓名”）
  required: boolean; // 是否必填
  props: {
    placeholder?: string;
    options?: OptionItem[]; // 给 radio 和 select 用的选项
    buttonText?: string; // 按钮文字
  };
  // 留给未来的高级功能：逻辑联动表达式
  visibleOn?: string; 
}

export interface EditorStore {
  components: ComponentSchema[];
  selectedId: string | null;
  addComponent: (type: FormItemType) => void;
  selectComponent: (id: string | null) => void;
  updateComponent: (id: string, updates: Partial<ComponentSchema>) => void;
  updateProps: (id: string, props: any) => void;
  reorderComponents: (oldIndex: number, newIndex: number) => void; 
}