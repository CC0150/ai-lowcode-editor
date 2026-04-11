import { useEditorStore } from '../store/useEditorStore';
import { Plus, Trash2, Settings2, GitBranch, ShieldCheck, BoxSelect } from 'lucide-react';

export const SetterPanel = () => {
  const { components, selectedId, updateComponent, updateProps } = useEditorStore();
  const selectedComponent = components.find((c) => c.id === selectedId);

  // === 统一的现代输入框样式 ===
  const inputBaseStyle = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 transition-all placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none shadow-sm";

  if (!selectedComponent) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-slate-400 bg-slate-50/50">
        <BoxSelect className="w-12 h-12 text-slate-200 mb-4 stroke-[1.5]" />
        <p className="text-sm font-medium">未选中任何组件</p>
        <p className="text-xs mt-1 text-slate-400 text-center">请在左侧画布中点击选中一个表单项</p>
      </div>
    );
  }

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

  const dependencyOptions = components.filter(c => c.id !== selectedComponent.id && c.type !== 'button');

  return (
    <div className="h-full flex flex-col bg-white">
      {/* ---------- 顶部吸顶 Header ---------- */}
      <header className="px-5 py-4 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-10 flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-slate-500" /> 
            属性面板
          </h3>
        </div>
        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-mono rounded border border-slate-200">
          {selectedComponent.type}
        </span>
      </header>

      <div className="p-5 flex flex-col gap-8 pb-24 overflow-y-auto">
        
        {/* ================= 1. 基础设置 ================= */}
        <section className="flex flex-col gap-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            基础设置
          </h4>
          
          {selectedComponent.type !== 'button' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-700">字段标题 (Label)</label>
              <input
                type="text"
                className={inputBaseStyle}
                value={selectedComponent.label || ''}
                onChange={(e) => updateComponent(selectedComponent.id, { label: e.target.value })}
              />
            </div>
          )}

          {selectedComponent.type !== 'button' && (
            <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">设为必填项</span>
                <span className="text-[10px] text-slate-500">提交时将校验此字段</span>
              </div>
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={selectedComponent.required || false}
                  onChange={(e) => updateComponent(selectedComponent.id, { required: e.target.checked })}
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
              </div>
            </label>
          )}
        </section>

        {/* ================= 2. 控件专属设置 ================= */}
        <section className="flex flex-col gap-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            控件选项
          </h4>
          
          {(selectedComponent.type === 'input' || selectedComponent.type === 'textarea') && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-700">占位提示文字 (Placeholder)</label>
              <input
                type="text"
                className={inputBaseStyle}
                value={selectedComponent.props.placeholder || ''}
                onChange={(e) => updateProps(selectedComponent.id, { placeholder: e.target.value })}
              />
            </div>
          )}

          {selectedComponent.type === 'button' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-700">按钮文字</label>
              <input 
                type="text" 
                className={inputBaseStyle} 
                value={selectedComponent.props.buttonText || ''} 
                onChange={(e) => updateProps(selectedComponent.id, { buttonText: e.target.value })} 
              />
            </div>
          )}

          {/* 选项列表（Radio, Select, Checkbox） */}
          {(selectedComponent.type === 'radio' || selectedComponent.type === 'select' || selectedComponent.type === 'checkbox') && (
            <div className="flex flex-col gap-3">
              <label className="text-xs font-medium text-slate-700">数据字典 (Options)</label>
              <div className="flex flex-col gap-3">
                {options.map((opt, index) => (
                  <div key={index} className="flex items-start gap-2 group">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <input 
                        type="text" 
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm transition-all focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none" 
                        placeholder="显示文本 (Label)" 
                        value={opt.label} 
                        onChange={(e) => handleOptionChange(index, 'label', e.target.value)} 
                      />
                      <input 
                        type="text" 
                        className="w-full px-2.5 py-1.5 bg-transparent border border-dashed border-slate-200 rounded-md text-[11px] font-mono text-slate-500 transition-all focus:bg-white focus:border-brand focus:border-solid outline-none" 
                        placeholder="提交值 (Value)" 
                        value={opt.value} 
                        onChange={(e) => handleOptionChange(index, 'value', e.target.value)} 
                      />
                    </div>
                    <button 
                      onClick={() => handleRemoveOption(index)} 
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-50 hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button 
                onClick={handleAddOption} 
                className="mt-1 flex items-center justify-center gap-1.5 w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 border-dashed text-slate-600 rounded-lg text-sm transition-colors font-medium"
              >
                <Plus className="w-4 h-4" /> 新增选项
              </button>
            </div>
          )}
        </section>

        {/* ================= 3. 数据校验 (Regex) ================= */}
        {(selectedComponent.type === 'input' || selectedComponent.type === 'textarea') && (
          <section className="flex flex-col gap-4">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> 数据校验
            </h4>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-700">正则表达式 (Regex)</label>
              <input
                type="text"
                placeholder="例如: ^1[3-9]\d{9}$"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-green-400 font-mono placeholder:text-slate-500 focus:ring-2 focus:ring-brand/50 outline-none shadow-inner"
                value={selectedComponent.validation?.regex || ''}
                onChange={(e) => updateComponent(selectedComponent.id, { validation: { regex: e.target.value, message: selectedComponent.validation?.message || '格式不正确' } })}
              />
            </div>
            {selectedComponent.validation?.regex && (
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-medium text-slate-700">错误提示语</label>
                <input
                  type="text"
                  placeholder="请输入正确的格式"
                  className="w-full px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800 placeholder:text-red-300 focus:border-red-300 focus:ring-2 focus:ring-red-200 outline-none"
                  value={selectedComponent.validation?.message || ''}
                  onChange={(e) => updateComponent(selectedComponent.id, { validation: { ...selectedComponent.validation!, message: e.target.value } })}
                />
              </div>
            )}
          </section>
        )}

        {/* ================= 4. 动态逻辑 (Show/Hide) ================= */}
        {selectedComponent.type !== 'button' && (
          <section className="flex flex-col gap-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <GitBranch className="w-4 h-4" /> 关联逻辑
            </h4>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">依赖字段</label>
                <select 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 shadow-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none appearance-none"
                  value={selectedComponent.visibleRule?.sourceId || ''}
                  onChange={(e) => updateComponent(selectedComponent.id, { 
                    visibleRule: e.target.value ? { sourceId: e.target.value, operator: '===', value: '' } : undefined 
                  })}
                >
                  <option value="">始终显示 (无关联条件)</option>
                  {dependencyOptions.map(c => (
                    <option key={c.id} value={c.id}>{c.label} (ID: {c.id.slice(0,4)})</option>
                  ))}
                </select>
              </div>

              {selectedComponent.visibleRule?.sourceId && (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    当选中值等于 (Value)
                  </label>
                  <input
                    type="text"
                    placeholder="输入期望的触发值..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 shadow-sm font-mono focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
                    value={selectedComponent.visibleRule?.value || ''}
                    onChange={(e) => updateComponent(selectedComponent.id, { 
                      visibleRule: { ...selectedComponent.visibleRule!, value: e.target.value } 
                    })}
                  />
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};