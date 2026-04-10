import { create } from 'zustand';
import type { EditorStore, FormItemType } from '../types/editor';
import { arrayMove } from '@dnd-kit/sortable';

export const useEditorStore = create<EditorStore>((set) => ({
  components: [],
  selectedId: null,

  addComponent: (type: FormItemType) => set((state) => {
    const isOptionsType = type === 'radio' || type === 'select';
    const newComponent = {
      id: crypto.randomUUID(),
      type,
      label: `新建${type === 'input' ? '单行文本' : type === 'radio' ? '单项选择' : '表单项'}`,
      required: false,
      props: {
        placeholder: type === 'input' || type === 'textarea' ? '请输入内容' : undefined,
        buttonText: type === 'button' ? '提交表单' : undefined,
        // 如果是选择题，默认给两个选项
        options: isOptionsType ? [
          { label: '选项 1', value: '1' },
          { label: '选项 2', value: '2' }
        ] : undefined,
      },
    };
    return { components: [...state.components, newComponent] };
  }),

  selectComponent: (id) => set({ selectedId: id }),

  // 更新顶层属性 (如 label, required)
  updateComponent: (id, updates) => set((state) => ({
    components: state.components.map(c => 
      c.id === id ? { ...c, ...updates } : c
    )
  })),

  // 更新内部 props (如 placeholder, options)
  updateProps: (id, props) => set((state) => ({
    components: state.components.map(c => 
      c.id === id ? { ...c, props: { ...c.props, ...props } } : c
    )
  })),

  reorderComponents: (oldIndex, newIndex) => set((state) => ({
    components: arrayMove(state.components, oldIndex, newIndex),
  })),
}));