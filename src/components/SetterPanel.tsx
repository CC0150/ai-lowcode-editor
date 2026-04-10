import React from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { Plus, Trash2 } from 'lucide-react';

export const SetterPanel = () => {
  const { components, selectedId, updateComponent, updateProps } = useEditorStore();
  
  const selectedComponent = components.find((c) => c.id === selectedId);

  if (!selectedComponent) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-gray-400 text-sm text-center bg-gray-50/50">
        请在画布中选中一个表单项以配置其属性
      </div>
    );
  }

  // --- 辅助方法：处理选项（Options）的动态更新 ---
  const options = selectedComponent.props.options || [];

  const handleOptionChange = (index: number, key: 'label' | 'value', val: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [key]: val };
    updateProps(selectedComponent.id, { options: newOptions });
  };

  const handleAddOption = () => {
    const newOptions = [...options, { label: `新选项 ${options.length + 1}`, value: `val_${Date.now()}` }];
    updateProps(selectedComponent.id, { options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    updateProps(selectedComponent.id, { options: newOptions });
  };

  return (
    <div className="p-5 flex flex-col gap-6">
      <header className="border-b pb-4">
        <h3 className="font-bold text-lg text-gray-800">属性配置</h3>
        <p className="text-xs text-gray-400 mt-1 uppercase">类型: {selectedComponent.type}</p>
      </header>

      {/* ================= 基础属性区 ================= */}
      <section className="flex flex-col gap-4">
        <h4 className="text-sm font-semibold text-brand border-l-2 border-brand pl-2">基础设置</h4>
        
        {/* 标题设置 (除了按钮，其他表单项都有标题) */}
        {selectedComponent.type !== 'button' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-600 font-medium">字段标题 (Label)</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
              value={selectedComponent.label || ''}
              onChange={(e) => updateComponent(selectedComponent.id, { label: e.target.value })}
            />
          </div>
        )}

        {/* 必填开关 */}
        {selectedComponent.type !== 'button' && (
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-100">
            <label className="text-sm text-gray-700 font-medium cursor-pointer" htmlFor="req-switch">是否必填</label>
            <input
              id="req-switch"
              type="checkbox"
              className="w-4 h-4 text-brand rounded focus:ring-brand accent-brand cursor-pointer"
              checked={selectedComponent.required || false}
              onChange={(e) => updateComponent(selectedComponent.id, { required: e.target.checked })}
            />
          </div>
        )}
      </section>

      {/* ================= 控件专属属性区 ================= */}
      <section className="flex flex-col gap-4 border-t pt-5">
        <h4 className="text-sm font-semibold text-brand border-l-2 border-brand pl-2">控件设置</h4>
        
        {/* 输入框：占位符设置 */}
        {selectedComponent.type === 'input' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-600 font-medium">占位提示文字 (Placeholder)</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
              value={selectedComponent.props.placeholder || ''}
              onChange={(e) => updateProps(selectedComponent.id, { placeholder: e.target.value })}
            />
          </div>
        )}

        {/* 按钮：文字设置 */}
        {selectedComponent.type === 'button' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-600 font-medium">按钮文字</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
              value={selectedComponent.props.buttonText || ''}
              onChange={(e) => updateProps(selectedComponent.id, { buttonText: e.target.value })}
            />
          </div>
        )}

        {/* ================= 单选/下拉的选项管理器 ================= */}
        {(selectedComponent.type === 'radio' || selectedComponent.type === 'select') && (
          <div className="flex flex-col gap-3">
            <label className="text-xs text-gray-600 font-medium">选项列表 (Options)</label>
            
            <div className="flex flex-col gap-2">
              {options.map((opt, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-md border border-gray-200">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <input
                      type="text"
                      className="w-full border-gray-300 border rounded px-2 py-1 text-xs outline-none focus:border-brand"
                      placeholder="选项显示文本"
                      value={opt.label}
                      onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                    />
                    <input
                      type="text"
                      className="w-full border-gray-300 border rounded px-2 py-1 text-[10px] text-gray-500 font-mono outline-none focus:border-brand"
                      placeholder="提交值 (Value)"
                      value={opt.value}
                      onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={() => handleRemoveOption(index)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="删除选项"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={handleAddOption}
              className="mt-2 flex items-center justify-center gap-1 w-full py-2 border border-dashed border-brand text-brand rounded-md text-sm hover:bg-brand/5 transition-colors"
            >
              <Plus className="w-4 h-4" /> 添加新选项
            </button>
          </div>
        )}
      </section>
    </div>
  );
};