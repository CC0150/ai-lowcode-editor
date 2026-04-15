import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIStore {
  leftOpen: boolean;
  rightOpen: boolean;
  toggleLeft: () => void;
  toggleRight: () => void;

  // 记录各个折叠面板(Accordion)的展开状态
  // key 是面板的唯一标识 (例如 'materials-basic', 'props-settings')，value 是布尔值
  expandedPanels: Record<string, boolean>;
  togglePanel: (panelId: string, defaultState?: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      leftOpen: true,
      rightOpen: true,
      toggleLeft: () => set((state) => ({ leftOpen: !state.leftOpen })),
      toggleRight: () => set((state) => ({ rightOpen: !state.rightOpen })),

      expandedPanels: {},
      togglePanel: (panelId, defaultState = true) =>
        set((state) => {
          // 如果之前没有记录过该面板，则基于默认状态取反
          const currentState = state.expandedPanels[panelId] ?? defaultState;
          return {
            expandedPanels: {
              ...state.expandedPanels,
              [panelId]: !currentState,
            },
          };
        }),
    }),
    {
      name: "editor-ui-state",
      partialize: (state) => ({
        leftOpen: state.leftOpen,
        rightOpen: state.rightOpen,
        expandedPanels: state.expandedPanels,
      }),
    },
  ),
);
