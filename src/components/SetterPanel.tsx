import { useEditorStore } from '../store/useEditorStore';

export const SetterPanel = () => {
  const { components, selectedId, updateProps, updateStyle } = useEditorStore();
  
  // 查找当前选中的组件
  const selectedComponent = components.find((c) => c.id === selectedId);

  if (!selectedComponent) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 italic text-sm">
        请在画布中选择一个组件
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-6">
      <header className="border-b pb-4">
        <h3 className="font-bold text-lg text-gray-800">{selectedComponent.name}</h3>
        <p className="text-xs text-gray-400 mt-1 break-all">ID: {selectedComponent.id}</p>
      </header>

      {/* 内容配置区 */}
      <section className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold text-brand">内容配置</h4>
        
        {(selectedComponent.type === 'text' || selectedComponent.type === 'button') && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">显示文本</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
              value={selectedComponent.props.text || ''}
              onChange={(e) => updateProps(selectedComponent.id, { text: e.target.value })}
            />
          </div>
        )}
      </section>

      {/* 样式配置区 */}
      <section className="flex flex-col gap-3 border-t pt-4">
        <h4 className="text-sm font-semibold text-brand">外观样式</h4>
        
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">字体颜色</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="w-8 h-8 rounded cursor-pointer border-0 p-0"
              value={selectedComponent.style.color || '#000000'}
              onChange={(e) => updateStyle(selectedComponent.id, { color: e.target.value })}
            />
            <span className="text-xs text-gray-600 uppercase">{selectedComponent.style.color || '#000000'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">内边距 (Padding)</label>
          <input
            type="number"
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="例如: 10"
            onChange={(e) => updateStyle(selectedComponent.id, { padding: `${e.target.value}px` })}
          />
        </div>
      </section>
    </div>
  );
};