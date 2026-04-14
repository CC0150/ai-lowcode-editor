import { create } from 'zustand';
import type { EditorStore, FormItemType } from '../types/editor';
import { arrayMove } from '@dnd-kit/sortable';

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
      // 判断是否需要选项数组
      const isOptionsType = type === 'radio' || type === 'select' || type === 'checkbox';
      
      // 智能生成默认标题
      const labelMap: Record<FormItemType, string> = {
        input: '单行文本', textarea: '多行文本', radio: '单项选择', 
        checkbox: '多项选择', select: '下拉选择', date: '日期选择', button: '提交按钮'
      };
      const newComponent = {
        id: crypto.randomUUID(),
        type,
        label: `新建${labelMap[type]}`,
        required: false,
        props: {
          placeholder: (type === 'input' || type === 'textarea' || type === 'date') ? '请输入' : undefined,
          buttonText: type === 'button' ? '提交表单' : undefined,
          options: isOptionsType ? [
            { label: '选项 1', value: '1' },
            { label: '选项 2', value: '2' }
          ] : undefined,
        },
      };
      set((state) => ({ components: [...state.components, newComponent] }));
    },

    // 选中组件不属于“数据修改”，不需要 commit
    selectComponent: (id) => set({ selectedId: id }),

    updateComponent: (id, updates) => {
      commit();
      set((state) => ({
        components: state.components.map(c => c.id === id ? { ...c, ...updates } : c)
      }));
    },

    updateProps: (id, props) => {
      commit();
      set((state) => ({
        components: state.components.map(c => c.id === id ? { ...c, props: { ...c.props, ...props } } : c)
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
        components: state.components.filter(c => c.id !== id),
        selectedId: state.selectedId === id ? null : state.selectedId // 如果删除了选中的组件，清空选中状态
      }));
    },

    // ⏪ 撤销 (Undo)
    undo: () => set((state) => {
      if (state.past.length === 0) return state; // 没有历史记录可撤销
      
      const previous = state.past[state.past.length - 1]; // 拿到上一步状态
      const newPast = state.past.slice(0, -1); // 从 past 中移除上一步
      
      return {
        past: newPast,
        future: [state.components, ...state.future], // 当前状态压入 future 栈
        components: previous, // 恢复组件状态
        selectedId: null, // 为防止幽灵选中，撤销时清空焦点
      };
    }),

    // ⏩ 重做 (Redo)
    redo: () => set((state) => {
      if (state.future.length === 0) return state; // 没有重做记录
      
      const next = state.future[0]; // 拿到下一步状态
      const newFuture = state.future.slice(1); // 从 future 中移除
      
      return {
        past: [...state.past, state.components], // 当前状态压回 past 栈
        future: newFuture,
        components: next,
        selectedId: null,
      };
    }),
  };
});