import { create } from 'zustand';
import type { EditorStore, ComponentType } from '../types/editor';
import { arrayMove } from '@dnd-kit/sortable';

export const useEditorStore = create<EditorStore>((set) => ({
  components: [],
  selectedId: null,

  // 添加新组件到画布
  addComponent: (type: ComponentType) => set((state) => {
    const newComponent = {
      id: crypto.randomUUID(), // 使用原生 API 生成 UUID
      type,
      name: `新${type}组件`,
      props: type === 'text' ? { text: '点击编辑文本' } : 
             type === 'button' ? { text: '按钮' } : {},
      style: { padding: '8px', color: '#000000', backgroundColor: 'transparent' },
    };
    return { components: [...state.components, newComponent] };
  }),

  // 选中组件
  selectComponent: (id) => set({ selectedId: id }),

  // 更新组件业务属性
  updateProps: (id, props) => set((state) => ({
    components: state.components.map(c => 
      c.id === id ? { ...c, props: { ...c.props, ...props } } : c
    )
  })),

  // 更新组件样式属性
  updateStyle: (id, style) => set((state) => ({
    components: state.components.map(c => 
      c.id === id ? { ...c, style: { ...c.style, ...style } } : c
    )
  })),
  
  // 重新排序组件
  reorderComponents: (oldIndex, newIndex) => set((state) => ({
    components: arrayMove(state.components, oldIndex, newIndex),
  })),
}));