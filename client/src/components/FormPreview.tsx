import React, { useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const FormPreview: React.FC<Props> = ({ onBack }) => {
  const { components } = useEditorStore();
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  // === 新增：全局错误状态管理器 ===
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    // 当用户重新输入时，清除该字段的错误红框
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: undefined } as any));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: Record<string, string> = {};
    let hasError = false;

    // === 核心高光：校验管道 (Validation Pipeline) ===
    components.forEach(comp => {
      // 1. 如果组件被逻辑隐藏，则跳过校验
      if (comp.visibleRule && comp.visibleRule.sourceId) {
        if (formData[comp.visibleRule.sourceId] !== comp.visibleRule.value) return;
      }

      const val = formData[comp.id] || '';

      // 2. 必填校验
      if (comp.required && comp.type !== 'button' && (!val || val.length === 0)) {
        newErrors[comp.id] = '此项为必填项';
        hasError = true;
      } 
      // 3. 正则表达式校验 (仅当用户填了内容，且配置了正则时执行)
      else if (val && comp.validation?.regex) {
        try {
          const regex = new RegExp(comp.validation.regex);
          if (!regex.test(val)) {
            newErrors[comp.id] = comp.validation.message || '格式不正确';
            hasError = true;
          }
        } catch (err) {
          console.error(`Invalid regex for ${comp.label}:`, err);
        }
      }
    });

    if (hasError) {
      setErrors(newErrors);
      return; // 阻止提交
    }

    // 校验通过，提交数据
    console.log('=== 提交的表单 JSON 数据 ===');
    console.log(JSON.stringify(formData, null, 2));
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 h-full absolute inset-0 z-50">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">提交成功！</h2>
        <p className="text-gray-500 mt-2">控制台已打印收集到的受控数据。</p>
        <button onClick={onBack} className="mt-8 px-6 py-2 bg-brand text-white rounded-md hover:bg-brand/90 transition-colors">
          返回编辑器
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-100 overflow-auto flex flex-col h-full w-full absolute inset-0 z-50">
      <header className="h-14 bg-white border-b flex items-center px-6 sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> 退出预览
        </button>
        <div className="mx-auto flex gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold border border-green-200">
            🟢 真实答题模式 (带高阶校验)
          </span>
        </div>
        <div className="w-20"></div>
      </header>

      <div className="flex-1 p-8 flex justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-10 h-fit">
          <div className="border-b-2 border-gray-100 pb-4 mb-8">
            <h1 className="text-2xl font-bold text-center text-gray-800">用户调研问卷</h1>
          </div>

          <div className="flex flex-col gap-6">
            {components.map((comp, index) => {
              // 逻辑隐藏判断
              const isVisible = () => {
                if (!comp.visibleRule || !comp.visibleRule.sourceId) return true;
                return formData[comp.visibleRule.sourceId] === comp.visibleRule.value;
              };
              if (!isVisible()) return null;

              if (comp.type === 'button') {
                return (
                  <button key={comp.id} type="submit" className="w-full bg-brand text-white py-3 rounded-md font-bold mt-4 shadow-md hover:bg-brand/90">
                    {comp.props.buttonText || '提交表单'}
                  </button>
                );
              }

              // 判断当前项是否有错误
              const hasError = !!errors[comp.id];

              return (
                <div key={comp.id} className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className={`text-sm font-medium ${hasError ? 'text-red-500' : 'text-gray-800'}`}>
                    {index + 1}. {comp.label} {comp.required && <span className="text-red-500">*</span>}
                  </label>

                  {/* 渲染 input，带错误边框 */}
                  {comp.type === 'input' && (
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder={comp.props.placeholder}
                        value={formData[comp.id] || ''}
                        onChange={(e) => handleInputChange(comp.id, e.target.value)}
                        className={`w-full border rounded-md px-3 py-2.5 text-sm outline-none transition-all ${
                          hasError 
                            ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200 text-red-900' 
                            : 'border-gray-300 focus:ring-2 focus:ring-brand focus:border-transparent'
                        }`} 
                      />
                      {hasError && <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-3" />}
                    </div>
                  )}

                  {/* Radio 和 Select 保持不变 */}
                  {comp.type === 'radio' && (
                    <div className="flex flex-col gap-3 mt-1">
                      {comp.props.options?.map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="radio" name={`radio_${comp.id}`} value={opt.value}
                            checked={formData[comp.id] === opt.value}
                            onChange={(e) => handleInputChange(comp.id, e.target.value)}
                            className="w-4 h-4 text-brand border-gray-300 focus:ring-brand accent-brand" 
                          />
                          <span className="text-sm text-gray-600">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {comp.type === 'select' && (
                    <select 
                      value={formData[comp.id] || ''}
                      onChange={(e) => handleInputChange(comp.id, e.target.value)}
                      className={`w-full border rounded-md px-3 py-2.5 text-sm transition-all bg-white outline-none ${
                        hasError ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-brand'
                      }`}
                    >
                      <option value="" disabled>请选择...</option>
                      {comp.props.options?.map((opt, i) => <option key={i} value={opt.value}>{opt.label}</option>)}
                    </select>
                  )}

                  {/* Textarea */}
                  {comp.type === 'textarea' && (
                    <div className="relative">
                      <textarea 
                        placeholder={comp.props.placeholder}
                        value={formData[comp.id] || ''}
                        onChange={(e) => handleInputChange(comp.id, e.target.value)}
                        className={`w-full border rounded-md px-3 py-2.5 text-sm outline-none transition-all resize-y min-h-[80px] ${
                          hasError ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-brand'
                        }`} 
                      />
                    </div>
                  )}

                  {/* Checkbox (多选核心：更新数组) */}
                  {comp.type === 'checkbox' && (
                    <div className="flex flex-col gap-3 mt-1">
                      {comp.props.options?.map((opt, i) => {
                        const currentArr = formData[comp.id] || [];
                        const isChecked = currentArr.includes(opt.value);
                        return (
                          <label key={i} className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              value={opt.value}
                              checked={isChecked}
                              onChange={(e) => {
                                const newArr = e.target.checked 
                                  ? [...currentArr, opt.value] 
                                  : currentArr.filter((v: string) => v !== opt.value);
                                handleInputChange(comp.id, newArr);
                              }}
                              className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand accent-brand" 
                            />
                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Date */}
                  {comp.type === 'date' && (
                    <input 
                      type="date" 
                      value={formData[comp.id] || ''}
                      onChange={(e) => handleInputChange(comp.id, e.target.value)}
                      className={`w-full border rounded-md px-3 py-2.5 text-sm outline-none transition-all ${
                        hasError ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-brand'
                      }`} 
                    />
                  )}
                  {/* === 渲染红色的内联错误提示 === */}
                  {hasError && (
                    <p className="text-xs text-red-500 mt-0.5 animate-in slide-in-from-top-1">
                      {errors[comp.id]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </form>
      </div>
    </div>
  );
};