import { create } from "zustand";
import { persist } from "zustand/middleware";
import { enablePatches, produceWithPatches, applyPatches } from "immer";
import type {
  ComponentSchema,
  EditorStore,
  FormItemType,
} from "../types/editor";

// 开启 Immer 的 JSON Patch 补丁功能
enablePatches();

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => {
      // 核心拦截器：通过 immer 生成最小差异补丁，替代全量快照
      const applyChange = (recipe: (draft: ComponentSchema[]) => void) => {
        const currentComponents = get().components;

        // produceWithPatches 返回：[新状态, 正向补丁(用于重做), 反向补丁(用于撤销)]
        const [nextState, forwardPatches, inversePatches] = produceWithPatches(
          currentComponents,
          recipe,
        );

        // 如果没有发生实质性变化，不计入历史栈
        if (forwardPatches.length === 0) return;

        set((state) => ({
          components: nextState,
          past: [
            ...state.past,
            { forward: forwardPatches, inverse: inversePatches },
          ], // 仅保存差异
          future: [], // 发生新操作，清空重做栈
        }));
      };

      // 这里返回的对象必须严格匹配 EditorStore 接口
      return {
        components: [],
        canvasTitle: "自定义表单",
        selectedId: null,
        past: [],
        future: [],

        // 更新标题的方法
        updateTitle: (title: string) => set({ canvasTitle: title }),

        addComponent: (type: FormItemType) => {
          const isOptionsType =
            type === "radio" || type === "select" || type === "checkbox";
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

          const defaultProps: any = {};
          if (type === "input" || type === "textarea" || type === "date")
            defaultProps.placeholder = "请输入";
          else if (type === "button") defaultProps.buttonText = "提交表单";
          else if (isOptionsType) {
            defaultProps.options = [
              { label: "选项 1", value: "1" },
              { label: "选项 2", value: "2" },
            ];
            // 默认排列为竖向排列
            if (type === "radio" || type === "checkbox") {
              defaultProps.direction = "vertical";
            }
          }
          else if (type === "cascader")
            defaultProps.options = [
              {
                label: "选项 1",
                value: "1",
                children: [{ label: "子选项 1-1", value: "1-1" }],
              },
            ];
          else if (type === "rate") defaultProps.maxRate = 5;
          else if (type === "switch") {
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

          applyChange((draft) => {
            draft.push(newComponent);
          });
        },

        selectComponent: (id) => set({ selectedId: id }),

        updateComponent: (id, updates) => {
          applyChange((draft) => {
            const index = draft.findIndex((c) => c.id === id);
            if (index !== -1) Object.assign(draft[index], updates);
          });
        },

        updateProps: (id, props) => {
          applyChange((draft) => {
            const component = draft.find((c) => c.id === id);
            if (component) Object.assign(component.props, props);
          });
        },

        reorderComponents: (oldIndex, newIndex) => {
          applyChange((draft) => {
            const item = draft.splice(oldIndex, 1)[0];
            draft.splice(newIndex, 0, item);
          });
        },

        deleteComponent: (id) => {
          applyChange((draft) => {
            const index = draft.findIndex((c) => c.id === id);
            if (index !== -1) draft.splice(index, 1);
          });
          set((state) => ({
            selectedId: state.selectedId === id ? null : state.selectedId,
          }));
        },

        // 清空画布功能
        clearCanvas: () => {
          applyChange((draft) => {
            draft.splice(0, draft.length);
          });
          set({ selectedId: null });
        },

        undo: () =>
          set((state) => {
            if (state.past.length === 0) return state;
            const lastPatch = state.past[state.past.length - 1];
            return {
              past: state.past.slice(0, -1),
              future: [lastPatch, ...state.future],
              components: applyPatches(state.components, lastPatch.inverse),
              selectedId: null,
            };
          }),

        redo: () =>
          set((state) => {
            if (state.future.length === 0) return state;
            const nextPatch = state.future[0];
            return {
              past: [...state.past, nextPatch],
              future: state.future.slice(1),
              components: applyPatches(state.components, nextPatch.forward),
              selectedId: null,
            };
          }),

        // 接收 AI 生成的组件及可选的标题
        applyAIGenerated: (newComponents: ComponentSchema[], title?: string) => {
          applyChange((draft) => {
            draft.splice(0, draft.length, ...newComponents);
          });
          if (title) {
            set({ canvasTitle: title }); // 同步更新标题
          }
        },

        applyAIPatches: (patches) => {
          applyChange((draft) => {
            patches.forEach((patch) => {
              if (patch.action === "remove" && patch.targetId) {
                const index = draft.findIndex((c) => c.id === patch.targetId);
                if (index !== -1) draft.splice(index, 1);
              } else if (patch.action === "update" && patch.targetId && patch.updates) {
                const component = draft.find((c) => c.id === patch.targetId);
                if (component) {
                  Object.assign(component, patch.updates);
                }
              } else if (patch.action === "add" && patch.component) {
                const newComponent = { ...patch.component, id: patch.component.id || crypto.randomUUID() };
                if (patch.targetId) {
                  const index = draft.findIndex((c) => c.id === patch.targetId);
                  if (index !== -1) {
                    const insertIndex = patch.position === "before" ? index : index + 1;
                    draft.splice(insertIndex, 0, newComponent);
                  } else {
                    draft.push(newComponent);
                  }
                } else {
                  draft.push(newComponent);
                }
              }
            });
          });
        },
      };
    },
    {
      name: "editor-canvas-storage",
      partialize: (state) => ({
        components: state.components,
        canvasTitle: state.canvasTitle, // 别忘了把标题也持久化到 localStorage
        past: state.past,
        future: state.future,
      }),
    },
  ),
);