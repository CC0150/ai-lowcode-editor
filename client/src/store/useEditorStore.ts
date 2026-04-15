import { create } from "zustand";
import type {
  ComponentSchema,
  EditorStore,
  FormItemType,
} from "../types/editor";
import { arrayMove } from "@dnd-kit/sortable";

export const useEditorStore = create<EditorStore>((set, get) => {
  // 状态拦截器 (每次修改前，保存当前状态的快照)
  const commit = () => {
    const currentComponents = get().components;
    set((state) => ({
      past: [...state.past, currentComponents], // 将当前状态压入 past 栈
      future: [], // 一旦发生新操作，清空 future 栈
    }));
  };

  return {
    components: [],
    selectedId: null,
    past: [],
    future: [],

    addComponent: (type: FormItemType) => {
      commit(); // 修改前记录历史

      // 判断是否为一维数组选项的组件
      const isOptionsType =
        type === "radio" || type === "select" || type === "checkbox";

      // === 1. 扩充：智能生成默认标题 (加入高级组件) ===
      const labelMap: Record<FormItemType, string> = {
        input: "单行文本",
        textarea: "多行文本",
        radio: "单项选择",
        checkbox: "多项选择",
        select: "下拉选择",
        date: "日期选择",
        button: "提交按钮",
        upload: "文件上传",
        rate: "评分星级",
        switch: "开关选择",
        cascader: "级联选择",
      };

      // === 2. 扩充：为不同的组件分配专属的默认 Props ===
      const defaultProps: any = {};

      if (type === "input" || type === "textarea" || type === "date") {
        defaultProps.placeholder = "请输入";
      } else if (type === "button") {
        defaultProps.buttonText = "提交表单";
      } else if (isOptionsType) {
        defaultProps.options = [
          { label: "选项 1", value: "1" },
          { label: "选项 2", value: "2" },
        ];
      } else if (type === "cascader") {
        // 级联组件需要默认的树形结构数据
        defaultProps.options = [
          {
            label: "选项 1",
            value: "1",
            children: [
              { label: "子选项 1-1", value: "1-1" }
            ]
          }
        ];
      } else if (type === "rate") {
        defaultProps.maxRate = 5; // 默认 5 颗星
      } else if (type === "switch") {
        defaultProps.activeText = "开启";
        defaultProps.inactiveText = "关闭";
      }

      const newComponent: ComponentSchema = {
        id: crypto.randomUUID(),
        type,
        label: `新建${labelMap[type]}`,
        required: false,
        props: defaultProps,
      };

      set((state) => ({ components: [...state.components, newComponent] }));
    },

    selectComponent: (id) => set({ selectedId: id }),

    updateComponent: (id, updates) => {
      commit();
      set((state) => ({
        components: state.components.map((c) =>
          c.id === id ? { ...c, ...updates } : c,
        ),
      }));
    },

    updateProps: (id, props) => {
      commit();
      set((state) => ({
        components: state.components.map((c) =>
          c.id === id ? { ...c, props: { ...c.props, ...props } } : c,
        ),
      }));
    },

    reorderComponents: (oldIndex, newIndex) => {
      commit();
      set((state) => ({
        components: arrayMove(state.components, oldIndex, newIndex),
      }));
    },

    deleteComponent: (id) => {
      commit();
      set((state) => ({
        components: state.components.filter((c) => c.id !== id),
        selectedId: state.selectedId === id ? null : state.selectedId,
      }));
    },

    // 撤销 (Undo)
    undo: () =>
      set((state) => {
        if (state.past.length === 0) return state;

        const previous = state.past[state.past.length - 1];
        const newPast = state.past.slice(0, -1);

        return {
          past: newPast,
          future: [state.components, ...state.future],
          components: previous,
          selectedId: null,
        };
      }),

    // 重做 (Redo)
    redo: () =>
      set((state) => {
        if (state.future.length === 0) return state;

        const next = state.future[0];
        const newFuture = state.future.slice(1);

        return {
          past: [...state.past, state.components],
          future: newFuture,
          components: next,
          selectedId: null,
        };
      }),

    // AI 生成组件
    applyAIGenerated: (newComponents: ComponentSchema[]) => {
      set((state) => ({
        past: [...state.past, state.components],
        future: [],
        components: newComponents,
        selectedId: null,
      }));
    },
  };
});