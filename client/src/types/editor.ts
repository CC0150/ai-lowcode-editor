// 表单专用的组件类型
export type FormItemType =
  | "input"
  | "textarea"
  | "radio"
  | "select"
  | "button"
  | "date"
  | "checkbox";

// 选项接口（用于单选、多选、下拉）
export interface OptionItem {
  label: string;
  value: string;
}

// 联动规则接口
export interface VisibleRule {
  sourceId: string; // 依赖的题目 ID
  operator: "==="; // 目前仅支持等于操作
  value: string; // 期望的值
}

// 正则校验规则接口
export interface ValidationRule {
  regex: string; // 正则表达式字符串，如 "^1[3-9]\\d{9}$"
  message: string; // 校验失败时的错误提示，如 "请输入正确的手机号"
}

// 表单组件 Schema
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
  // 逻辑联动表达式
  visibleRule?: VisibleRule;
  // 正则校验表达式
  validation?: ValidationRule;
}

export interface EditorStore {
  // 历史栈
  past: ComponentSchema[][];
  future: ComponentSchema[][];
  // 当前组件列表
  components: ComponentSchema[];
  // 选中的组件 ID
  selectedId: string | null;

  addComponent: (type: FormItemType) => void;
  selectComponent: (id: string | null) => void;
  updateComponent: (id: string, updates: Partial<ComponentSchema>) => void;
  updateProps: (id: string, props: any) => void;
  reorderComponents: (oldIndex: number, newIndex: number) => void;
  deleteComponent: (id: string) => void;

  // 历史记录方法
  undo: () => void;
  redo: () => void;

  // AI 生成组件
  applyAIGenerated: (newComponents: ComponentSchema[]) => void;
}
