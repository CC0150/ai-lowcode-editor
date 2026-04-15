import { useEditorStore } from '../store/useEditorStore';
import { Trash2, Settings2, GitBranch, ShieldCheck, BoxSelect, Upload, Star, ToggleLeft, MousePointer2, Sliders } from 'lucide-react';
import { PanelSection } from './PanelSection';
import { OptionsEditor } from './OptionsEditor';

export const SetterPanel = () => {
  const { components, selectedId, updateComponent, updateProps, deleteComponent } = useEditorStore();
  const selectedComponent = components.find((c) => c.id === selectedId);

  const inputBaseStyle = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 transition-all placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none shadow-sm";

  if (!selectedComponent) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-slate-400 bg-slate-50/30">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4">
          <BoxSelect className="w-8 h-8 text-slate-300 stroke-[1.5]" />
        </div>
        <p className="text-sm font-bold text-slate-600">未选中任何组件</p>
        <p className="text-xs mt-2 text-slate-400 text-center max-w-[200px] leading-relaxed">
          请在左侧画布中点击选中一个表单项，即可在此配置其属性
        </p>
      </div>
    );
  }

  const dependencyOptions = components.filter(c => c.id !== selectedComponent.id && c.type !== 'button');

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* ---------- 顶部固定 Header ---------- */}
      <header className="shrink-0 px-5 py-4 border-b border-slate-200 bg-white z-10 flex items-center justify-between shadow-sm">
        <div className="flex flex-col">
          <h3 className="font-bold text-slate-800">属性面板</h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-brand/10 text-brand text-[11px] font-mono font-bold rounded-md border border-brand/20">
            {selectedComponent.type}
          </span>
          <button
            onClick={() => deleteComponent(selectedComponent.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all shadow-sm border border-transparent hover:border-red-100 group"
            title="移除该组件"
          >
            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </header>

      {/* ---------- 可滚动配置区域 ---------- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">

        {/* ================= 1. 基础属性 ================= */}
        {selectedComponent.type !== 'button' && (
          <PanelSection title="基础属性" icon={Settings2}>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">字段标题 (Label)</label>
              <input type="text" className={inputBaseStyle} value={selectedComponent.label || ''} onChange={(e) => updateComponent(selectedComponent.id, { label: e.target.value })} />
            </div>

            {selectedComponent.type !== 'switch' && (
              <label className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-brand/50 hover:shadow-sm transition-all mt-2">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-700">设为必填项</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">提交时将校验此字段</span>
                </div>
                <div className="relative inline-flex items-center">
                  <input type="checkbox" className="sr-only peer" checked={selectedComponent.required || false} onChange={(e) => updateComponent(selectedComponent.id, { required: e.target.checked })} />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
                </div>
              </label>
            )}
          </PanelSection>
        )}

        {/* ================= 2. 控件高级属性 ================= */}
        <PanelSection title="控件高级属性" icon={Sliders}>

          {selectedComponent.type === 'button' && (
            <div className="flex flex-col gap-2 p-3 bg-brand/5 rounded-lg border border-brand/20">
              <label className="text-xs font-bold text-brand flex items-center gap-1">
                <MousePointer2 className="w-3 h-3" /> 按钮文字 (Text)
              </label>
              <input type="text" placeholder="例如: 提交表单" className={inputBaseStyle} value={selectedComponent.props.buttonText || ''} onChange={(e) => updateProps(selectedComponent.id, { buttonText: e.target.value })} />
            </div>
          )}

          {(selectedComponent.type === 'input' || selectedComponent.type === 'textarea') && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">占位文字 (Placeholder)</label>
              <input type="text" className={inputBaseStyle} value={selectedComponent.props.placeholder || ''} onChange={(e) => updateProps(selectedComponent.id, { placeholder: e.target.value })} />
            </div>
          )}

          {selectedComponent.type === 'upload' && (
            <div className="flex flex-col gap-2 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
              <label className="text-xs font-bold text-indigo-900 flex items-center gap-1"><Upload className="w-3 h-3" /> 限制文件类型 (Accept)</label>
              <input type="text" placeholder="例如: image/*, .pdf, .xls" className={inputBaseStyle} value={selectedComponent.props.accept || ''} onChange={(e) => updateProps(selectedComponent.id, { accept: e.target.value })} />
              <p className="text-[10px] text-indigo-400/80 leading-tight">支持标准 MIME 类型或后缀名，留空则允许所有文件</p>
            </div>
          )}

          {selectedComponent.type === 'rate' && (
            <div className="flex flex-col gap-2 p-3 bg-yellow-50/50 rounded-lg border border-yellow-100">
              <label className="text-xs font-bold text-yellow-900 flex items-center gap-1"><Star className="w-3 h-3" /> 最大星数 (Max Rate)</label>
              <input type="number" min={3} max={10} className={inputBaseStyle} value={selectedComponent.props.maxRate || 5} onChange={(e) => updateProps(selectedComponent.id, { maxRate: Number(e.target.value) })} />
            </div>
          )}

          {selectedComponent.type === 'switch' && (
            <div className="flex flex-col gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1"><ToggleLeft className="w-3 h-3" /> 状态展示文案</label>
              <div className="flex gap-2">
                <input type="text" placeholder="开启文案" className={inputBaseStyle} value={selectedComponent.props.activeText || ''} onChange={(e) => updateProps(selectedComponent.id, { activeText: e.target.value })} />
                <input type="text" placeholder="关闭文案" className={inputBaseStyle} value={selectedComponent.props.inactiveText || ''} onChange={(e) => updateProps(selectedComponent.id, { inactiveText: e.target.value })} />
              </div>
            </div>
          )}

          {/* === 引入独立的选项编辑器组件 === */}
          {(selectedComponent.type === 'radio' || selectedComponent.type === 'select' || selectedComponent.type === 'checkbox') && (
            <OptionsEditor
              options={selectedComponent.props.options || []}
              onChange={(newOpts) => updateProps(selectedComponent.id, { options: newOpts })}
            />
          )}

          {selectedComponent.type === 'cascader' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">树形数据结构 (JSON)</label>
              <div className="relative group">
                <textarea
                  className="w-full h-56 px-4 py-3 bg-slate-900 text-green-400 font-mono text-[12px] leading-relaxed rounded-xl focus:ring-2 focus:ring-brand outline-none shadow-inner custom-scrollbar"
                  defaultValue={JSON.stringify(selectedComponent.props.options || [], null, 2)}
                  onBlur={(e) => {
                    try {
                      const newOpts = JSON.parse(e.target.value);
                      updateProps(selectedComponent.id, { options: newOpts });
                    } catch (err) {
                      alert("JSON 格式错误，请检查括号和引号是否匹配！");
                    }
                  }}
                />
                <div className="absolute top-2 right-2 px-2 py-1 bg-slate-800 text-slate-400 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">失焦自动保存</div>
              </div>
            </div>
          )}
        </PanelSection>

        {/* ================= 3. 数据校验 ================= */}
        {(selectedComponent.type === 'input' || selectedComponent.type === 'textarea') && (
          <PanelSection title="数据校验" icon={ShieldCheck} defaultOpen={false}>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">正则表达式 (Regex)</label>
              <input type="text" placeholder="例如: ^1[3-9]\d{9}$" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-green-400 font-mono placeholder:text-slate-500 focus:ring-2 focus:ring-brand/50 outline-none shadow-inner" value={selectedComponent.validation?.regex || ''} onChange={(e) => updateComponent(selectedComponent.id, { validation: { regex: e.target.value, message: selectedComponent.validation?.message || '格式不正确' } })} />
            </div>

            {selectedComponent.validation?.regex && (
              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-600">校验失败提示语</label>
                <input type="text" placeholder="请输入正确的格式" className="w-full px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800 placeholder:text-red-300 focus:border-red-300 focus:ring-2 focus:ring-red-200 outline-none" value={selectedComponent.validation?.message || ''} onChange={(e) => updateComponent(selectedComponent.id, { validation: { ...selectedComponent.validation!, message: e.target.value } })} />
              </div>
            )}
          </PanelSection>
        )}

        {/* ================= 4. 动态逻辑 ================= */}
        {selectedComponent.type !== 'button' && (
          <PanelSection title="动态显示逻辑" icon={GitBranch} defaultOpen={false}>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">依赖字段 (Source)</label>
                <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 shadow-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none cursor-pointer" value={selectedComponent.visibleRule?.sourceId || ''} onChange={(e) => updateComponent(selectedComponent.id, { visibleRule: e.target.value ? { sourceId: e.target.value, operator: '===', value: '' } : undefined })}>
                  <option value="">始终显示 (无依赖条件)</option>
                  {dependencyOptions.map(c => <option key={c.id} value={c.id}>{c.label} (ID: {c.id.slice(0, 4)})</option>)}
                </select>
              </div>

              {selectedComponent.visibleRule?.sourceId && (
                <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-200 border-dashed">
                  <label className="text-[11px] font-bold text-brand uppercase tracking-wider">当触发值等于 (Value)</label>
                  <input type="text" placeholder="输入期望的值..." className="w-full px-3 py-2 bg-white border border-brand/30 rounded-lg text-sm text-slate-800 shadow-sm font-mono focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" value={selectedComponent.visibleRule?.value || ''} onChange={(e) => updateComponent(selectedComponent.id, { visibleRule: { ...selectedComponent.visibleRule!, value: e.target.value } })} />
                </div>
              )}
            </div>
          </PanelSection>
        )}
      </div>
    </div>
  );
};