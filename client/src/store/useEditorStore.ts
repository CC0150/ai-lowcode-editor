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

      return {
        components: [],
        selectedId: null,
        past: [],
        future: [],

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

          // 所有的状态变更都在 applyChange 的回调中以可变 (Mutable) 的方式写
          applyChange((draft) => {
            draft.push(newComponent);
          });
        },

        selectComponent: (id) => set({ selectedId: id }), // 选中组件不计入历史补丁

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

        /**
         * 重新排序组件
         * @param oldIndex - 组件当前的索引位置
         * @param newIndex - 组件要移动到的新索引位置
         */
        reorderComponents: (oldIndex, newIndex) => {
          applyChange((draft) => {
            // 使用 splice 模拟 arrayMove，immer 会将其转化为极其精简的 Patch
            const item = draft.splice(oldIndex, 1)[0];
            draft.splice(newIndex, 0, item);
          });
        },

        deleteComponent: (id) => {
          applyChange((draft) => {
            const index = draft.findIndex((c) => c.id === id);
            if (index !== -1) draft.splice(index, 1);
          });
          // 选中状态单独同步，不记录到 draft 历史中
          set((state) => ({
            selectedId: state.selectedId === id ? null : state.selectedId,
          }));
        },

        // 撤销：将 "反向补丁" 打在当前状态上
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

        // 重做：将 "正向补丁" 打在当前状态上
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

        /**
         * 应用 AI 生成的组件
         * @param newComponents - 从 AI 生成器获取的新组件数组
         */
        applyAIGenerated: (newComponents: ComponentSchema[]) => {
          applyChange((draft) => {
            // 清空当前数组并推入 AI 生成的新组件
            draft.splice(0, draft.length, ...newComponents);
          });
        },

        /**
         * 应用 AI 生成的表单结构补丁
         * @param patches - 从 AI 生成器获取的补丁数组
         */
        applyAIPatches: (patches) => {
          applyChange((draft) => {
            patches.forEach((patch) => {
              // 1. 删除操作
              if (patch.action === "remove" && patch.targetId) {
                const index = draft.findIndex((c) => c.id === patch.targetId);
                if (index !== -1) draft.splice(index, 1);
              }
              // 2. 更新操作
              else if (patch.action === "update" && patch.targetId && patch.updates) {
                const component = draft.find((c) => c.id === patch.targetId);
                if (component) {
                  // 深度合并（如果涉及深层 props 可以手写，或使用 lodash merge）
                  Object.assign(component, patch.updates);
                }
              }
              // 3. 新增操作
              else if (patch.action === "add" && patch.component) {
                // 为了安全，确保 AI 给的新组件带上唯一的 id
                const newComponent = { ...patch.component, id: patch.component.id || crypto.randomUUID() };

                if (patch.targetId) {
                  const index = draft.findIndex((c) => c.id === patch.targetId);
                  if (index !== -1) {
                    const insertIndex = patch.position === "before" ? index : index + 1;
                    draft.splice(insertIndex, 0, newComponent);
                  } else {
                    draft.push(newComponent); // 没找到 target 就放最后
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
        past: state.past,
        future: state.future,
      }),
    },
  ),
);
