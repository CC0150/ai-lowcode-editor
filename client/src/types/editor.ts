// 表单专用的组件类型 (新增 upload, rate, switch, cascader)
export type FormItemType =
  | "input"
  | "textarea"
  | "radio"
  | "select"
  | "button"
  | "date"
  | "checkbox"
  | "upload"
  | "rate"
  | "switch"
  | "cascader";

// 选项接口（支持无限极嵌套，用于 Cascader）
export interface OptionItem {
  label: string;
  value: string;
  children?: OptionItem[]; // 用于级联选择器的子节点
}

// 联动规则接口
export interface VisibleRule {
  sourceId: string;
  operator: "===";
  value: string;
}

// 正则校验规则接口
export interface ValidationRule {
  regex: string;
  message: string;
}

// 表单组件 Schema
export interface ComponentSchema {
  id: string;
  type: FormItemType;
  label: string;
  required: boolean;
  props: {
    placeholder?: string;
    options?: OptionItem[]; // 给 radio, select, checkbox, cascader 用的选项
    buttonText?: string;
    // === 新增高级组件特有 Props ===
    maxRate?: number; // 评分组件的最大星数 (默认5)
    accept?: string;  // 上传组件的文件类型限制 (如 image/*)
    activeText?: string; // 开关打开时的文字
    inactiveText?: string; // 开关关闭时的文字
  };
  visibleRule?: VisibleRule;
  validation?: ValidationRule;
}

export interface EditorStore {
  past: ComponentSchema[][];
  future: ComponentSchema[][];
  components: ComponentSchema[];
  selectedId: string | null;

  addComponent: (type: FormItemType) => void;
  selectComponent: (id: string | null) => void;
  updateComponent: (id: string, updates: Partial<ComponentSchema>) => void;
  updateProps: (id: string, props: any) => void;
  reorderComponents: (oldIndex: number, newIndex: number) => void;
  deleteComponent: (id: string) => void;

  undo: () => void;
  redo: () => void;
  applyAIGenerated: (newComponents: ComponentSchema[]) => void;
}