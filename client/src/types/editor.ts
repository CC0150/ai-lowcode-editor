import { type Patch } from "immer";

export type FormItemType =
  | "input"
  | "textarea"
  | "radio"
  | "select"
  | "date"
  | "checkbox"
  | "upload"
  | "rate"
  | "switch"
  | "cascader";

// AI 对表单结构的修改补丁指令
export interface FormPatchAction {
  action: "add" | "update" | "remove";
  targetId?: string; // 目标组件的 id（用于定位插入位置、修改或删除）
  position?: "before" | "after"; // 对于 'add' 操作，指定插入到目标的前面还是后面
  component?: ComponentSchema; // 对于 'add' 操作，提供新的组件结构
  updates?: Partial<ComponentSchema>; // 对于 'update' 操作，提供要修改的属性
}

// 选项接口（支持无限极嵌套，用于 Cascader）
export interface OptionItem {
  /** 选项标签 */
  label: string;
  /** 选项值 */
  value: string;
  /** 子选项 */
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
    direction?: "horizontal" | "vertical"; // 单选框和复选框的排列方向

    maxRate?: number; // 评分组件的最大星数 (默认5)
    accept?: string; // 上传组件的文件类型限制 (如 image/*)
    activeText?: string; // 开关打开时的文字
    inactiveText?: string; // 开关关闭时的文字
  };
  visibleRule?: VisibleRule;
  validation?: ValidationRule;
}

// 补丁历史记录接口
export interface HistoryPatch {
  forward: Patch[]; // 正向补丁（用于重做）
  inverse: Patch[]; // 反向补丁（用于撤销）
}

export interface EditorStore {
  past: HistoryPatch[];
  future: HistoryPatch[];
  components: ComponentSchema[];
  selectedId: string | null;
  canvasTitle: string;

  addComponent: (type: FormItemType) => void;
  selectComponent: (id: string | null) => void;
  updateComponent: (id: string, updates: Partial<ComponentSchema>) => void;
  updateProps: (id: string, props: any) => void;
  reorderComponents: (oldIndex: number, newIndex: number) => void;
  deleteComponent: (id: string) => void;
  clearCanvas: () => void;

  undo: () => void;
  redo: () => void;
  applyAIGenerated: (newComponents: ComponentSchema[], title?: string) => void;
  applyAIPatches: (patches: FormPatchAction[]) => void;
  updateTitle: (title: string) => void;
}
