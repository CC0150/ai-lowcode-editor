import { useEditorStore } from "../store/useEditorStore";
import { Plus, Trash2, Sparkles } from "lucide-react";

export const SetterPanel = () => {
  // 从 Zustand 中获取所需状态和更新方法
  const { components, selectedId, updateComponent, updateProps, deleteComponent } =
    useEditorStore();

  // 查找当前选中的组件
  const selectedComponent = components.find((c) => c.id === selectedId);

  // 如果没有选中任何组件，显示占位提示
  if (!selectedComponent) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-gray-400 text-sm text-center bg-gray-50/50">
        请在画布中选中一个表单项以配置其属性
      </div>
    );
  }

  // --- 辅助方法：处理选项（Options）的动态更新 ---
  const options = selectedComponent.props.options || [];

  const handleOptionChange = (
    index: number,
    key: "label" | "value",
    val: string,
  ) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [key]: val };
    updateProps(selectedComponent.id, { options: newOptions });
  };

  const handleAddOption = () => {
    const newOptions = [
      ...options,
      { label: `新选项 ${options.length + 1}`, value: `val_${Date.now()}` },
    ];
    updateProps(selectedComponent.id, { options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    updateProps(selectedComponent.id, { options: newOptions });
  };

  // --- 获取可以作为逻辑依赖的其他题目（排除自己和按钮） ---
  const dependencyOptions = components.filter(
    (c) => c.id !== selectedComponent.id && c.type !== "button",
  );

  return (
    <div className="p-5 flex flex-col gap-6 pb-20">
      {/* 头部信息 */}
      <header className="border-b pb-4">
        <h3 className="font-bold text-lg text-gray-800">属性配置</h3>
        <p className="text-xs text-gray-400 mt-1 uppercase">
          组件类型:{" "}
          <span className="font-mono text-brand">{selectedComponent.type}</span>
        </p>
      </header>

      {/* ================= 基础属性区 ================= */}
      <section className="flex flex-col gap-4">
        <h4 className="text-sm font-semibold text-brand border-l-2 border-brand pl-2">
          基础设置
        </h4>

        {/* 标题设置 (除了按钮，其他表单项都有标题) */}
        {selectedComponent.type !== "button" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-600 font-medium">
              字段标题 (Label)
            </label>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
              value={selectedComponent.label || ""}
              onChange={(e) =>
                updateComponent(selectedComponent.id, { label: e.target.value })
              }
            />
          </div>
        )}

        {/* 必填开关 */}
        {selectedComponent.type !== "button" && (
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-100">
            <label
              className="text-sm text-gray-700 font-medium cursor-pointer"
              htmlFor="req-switch"
            >
              是否必填
            </label>
            <input
              id="req-switch"
              type="checkbox"
              className="w-4 h-4 text-brand rounded focus:ring-brand accent-brand cursor-pointer"
              checked={selectedComponent.required || false}
              onChange={(e) =>
                updateComponent(selectedComponent.id, {
                  required: e.target.checked,
                })
              }
            />
          </div>
        )}
      </section>

      {/* ================= 控件专属属性区 ================= */}
      <section className="flex flex-col gap-4 border-t pt-5">
        <h4 className="text-sm font-semibold text-brand border-l-2 border-brand pl-2">控件设置</h4>
        
        {/* === 支持 Input 和 Textarea 的占位符与正则 === */}
        {(selectedComponent.type === 'input' || selectedComponent.type === 'textarea') && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-600 font-medium">占位提示文字 (Placeholder)</label>
              <input
                type="text"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                value={selectedComponent.props.placeholder || ''}
                onChange={(e) => updateProps(selectedComponent.id, { placeholder: e.target.value })}
              />
            </div>
            
            <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-3 mt-1">
              <label className="text-xs text-brand font-bold flex items-center gap-1">正则表达式校验 (Regex)</label>
              <input
                type="text"
                placeholder="例如: ^1[3-9]\d{9}$"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm font-mono text-gray-700 bg-gray-50 focus:ring-2 focus:ring-brand/50"
                value={selectedComponent.validation?.regex || ''}
                onChange={(e) => updateComponent(selectedComponent.id, { validation: { regex: e.target.value, message: selectedComponent.validation?.message || '格式不正确' } })}
              />
            </div>
            {selectedComponent.validation?.regex && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 font-medium uppercase">自定义错误提示语</label>
                <input
                  type="text"
                  placeholder="例如: 请输入正确的手机号"
                  className="border border-red-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-400"
                  value={selectedComponent.validation?.message || ''}
                  onChange={(e) => updateComponent(selectedComponent.id, { validation: { ...selectedComponent.validation!, message: e.target.value } })}
                />
              </div>
            )}
          </>
        )}

        {/* 按钮：文字设置 */}
        {selectedComponent.type === 'button' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-600 font-medium">按钮文字</label>
            <input type="text" className="border border-gray-300 rounded-md px-3 py-2 text-sm" value={selectedComponent.props.buttonText || ''} onChange={(e) => updateProps(selectedComponent.id, { buttonText: e.target.value })} />
          </div>
        )}

        {/* === 单选、多选、下拉的选项管理器 === */}
        {(selectedComponent.type === 'radio' || selectedComponent.type === 'select' || selectedComponent.type === 'checkbox') && (
          <div className="flex flex-col gap-3">
            <label className="text-xs text-gray-600 font-medium">选项列表 (Options)</label>
            <div className="flex flex-col gap-2">
              {options.map((opt, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-md border border-gray-200">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <input type="text" className="w-full border-gray-300 border rounded px-2 py-1 text-xs outline-none focus:border-brand" placeholder="选项显示文本" value={opt.label} onChange={(e) => handleOptionChange(index, 'label', e.target.value)} />
                    <input type="text" className="w-full border-gray-300 border rounded px-2 py-1 text-[10px] text-gray-500 font-mono outline-none focus:border-brand" placeholder="提交值 (Value)" value={opt.value} onChange={(e) => handleOptionChange(index, 'value', e.target.value)} />
                  </div>
                  <button onClick={() => handleRemoveOption(index)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <button onClick={handleAddOption} className="mt-2 flex items-center justify-center gap-1 w-full py-2 border border-dashed border-brand text-brand rounded-md text-sm hover:bg-brand/5"><Plus className="w-4 h-4" /> 添加新选项</button>
          </div>
        )}
      </section>

      {/* ================= 核心高光：动态逻辑配置区 ================= */}
      {selectedComponent.type !== "button" && (
        <section className="flex flex-col gap-4 border-t pt-5">
          <h4 className="text-sm font-semibold text-purple-600 border-l-2 border-purple-600 pl-2 flex items-center gap-1">
            <Sparkles className="w-4 h-4" /> 动态显示逻辑
          </h4>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            设置此题目在满足特定条件时才显示（例如：上一题选了“其他”时）。
          </p>

          <div className="bg-purple-50 p-3 rounded-md border border-purple-100 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                依赖的题目
              </label>
              <select
                className="border border-purple-200 rounded px-2 py-1.5 text-sm bg-white outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all text-gray-700"
                value={selectedComponent.visibleRule?.sourceId || ""}
                onChange={(e) =>
                  updateComponent(selectedComponent.id, {
                    // 如果选择了题目，则初始化规则；如果选择了空，则清除规则
                    visibleRule: e.target.value
                      ? { sourceId: e.target.value, operator: "===", value: "" }
                      : undefined,
                  })
                }
              >
                <option value="">-- 无条件，始终显示 --</option>
                {dependencyOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} (ID: {c.id.slice(0, 4)})
                  </option>
                ))}
              </select>
            </div>

            {/* 如果选择了依赖题目，才显示期望值输入框 */}
            {selectedComponent.visibleRule?.sourceId && (
              <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-1">
                <label className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                  等于以下值才显示 (填写Value)
                </label>
                <input
                  type="text"
                  placeholder="例如: val_123"
                  className="border border-purple-200 rounded px-2 py-1.5 text-sm bg-white outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all font-mono text-purple-900"
                  value={selectedComponent.visibleRule?.value || ""}
                  onChange={(e) =>
                    updateComponent(selectedComponent.id, {
                      visibleRule: {
                        ...selectedComponent.visibleRule!,
                        value: e.target.value,
                      },
                    })
                  }
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ================= 危险操作区 ================= */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <button
          onClick={() => deleteComponent(selectedComponent.id)}
          className="w-full py-2.5 flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md font-medium text-sm transition-colors"
        >
          <Trash2 className="w-4 h-4" /> 彻底删除该组件
        </button>
      </div>
    </div>
  );
};
