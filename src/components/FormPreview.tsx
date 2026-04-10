import React, { useState } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

interface Props {
  onBack: () => void;
}

export const FormPreview: React.FC<Props> = ({ onBack }) => {
  const { components } = useEditorStore();

  // 核心：使用一个对象来统一管理所有表单项的输入值
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 处理输入值变化
  const handleInputChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // 模拟提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 校验必填项 (简单的非空校验)
    const missingRequired = components.find(
      (c) =>
        c.required &&
        c.type !== "button" &&
        (!formData[c.id] || formData[c.id].length === 0),
    );

    if (missingRequired) {
      alert(`请填写必填项: ${missingRequired.label}`);
      return;
    }

    // 这里在实际项目中是调用 axios.post() 提交给后端
    console.log("=== 提交的表单 JSON 数据 ===");
    console.log(JSON.stringify(formData, null, 2));

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 h-full">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">提交成功！</h2>
        <p className="text-gray-500 mt-2">
          请按 F12 打开控制台查看收集到的 JSON 数据。
        </p>
        <button
          onClick={onBack}
          className="mt-8 px-6 py-2 bg-brand text-white rounded-md hover:bg-brand/90 transition-colors"
        >
          返回编辑器
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-100 overflow-auto flex flex-col h-full w-full absolute inset-0 z-50">
      {/* 预览模式专属 Header */}
      <header className="h-14 bg-white border-b flex items-center px-6 sticky top-0 z-10 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> 退出预览
        </button>
        <div className="mx-auto flex gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold border border-green-200">
            🟢 真实答题模式
          </span>
        </div>
        <div className="w-20"></div> {/* 占位以居中中间的内容 */}
      </header>

      {/* 答题纸区域 */}
      <div className="flex-1 p-8 flex justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-10 h-fit"
        >
          <div className="border-b-2 border-gray-100 pb-4 mb-8">
            <h1 className="text-2xl font-bold text-center text-gray-800">
              用户调研问卷
            </h1>
          </div>

          <div className="flex flex-col gap-6">
            {components.map((comp, index) => {
              //  核心高光：执行显示逻辑
              // 判断该组件是否应该被显示
              const isVisible = () => {
                // 如果没有配置规则，默认显示
                if (!comp.visibleRule || !comp.visibleRule.sourceId)
                  return true;

                // 解析规则：找到依赖题目的当前填写值
                const dependencyValue = formData[comp.visibleRule.sourceId];
                // 判断当前值是否等于规则设定的期望值
                return dependencyValue === comp.visibleRule.value;
              };

              // 如果判断为假，直接跳过渲染该组件 (隐藏)
              if (!isVisible()) return null;

              // 按钮组件特殊处理（作为表单提交按钮）
              if (comp.type === "button") {
                return (
                  <button
                    key={comp.id}
                    type="submit"
                    className="w-full bg-brand text-white py-3 rounded-md font-bold mt-4 shadow-md hover:bg-brand/90 transition-colors"
                  >
                    {comp.props.buttonText || "提交表单"}
                  </button>
                );
              }

              return (
                <div key={comp.id} className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-800">
                    {index + 1}. {comp.label}{" "}
                    {comp.required && <span className="text-red-500">*</span>}
                  </label>

                  {/* 单行文本 */}
                  {comp.type === "input" && (
                    <input
                      type="text"
                      placeholder={comp.props.placeholder}
                      value={formData[comp.id] || ""}
                      onChange={(e) =>
                        handleInputChange(comp.id, e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    />
                  )}

                  {/* 单项选择 */}
                  {comp.type === "radio" && (
                    <div className="flex flex-col gap-3 mt-1">
                      {comp.props.options?.map((opt, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <input
                            type="radio"
                            name={`radio_${comp.id}`} // 同一组的 name 必须相同
                            value={opt.value}
                            checked={formData[comp.id] === opt.value}
                            onChange={(e) =>
                              handleInputChange(comp.id, e.target.value)
                            }
                            className="w-4 h-4 text-brand border-gray-300 focus:ring-brand accent-brand"
                          />
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                            {opt.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* 下拉选择 */}
                  {comp.type === "select" && (
                    <select
                      value={formData[comp.id] || ""}
                      onChange={(e) =>
                        handleInputChange(comp.id, e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand transition-all bg-white"
                    >
                      <option value="" disabled>
                        请选择...
                      </option>
                      {comp.props.options?.map((opt, i) => (
                        <option key={i} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}

            {/* 如果用户没有拖入按钮组件，提供一个兜底的提交按钮 */}
            {!components.some((c) => c.type === "button") &&
              components.length > 0 && (
                <button
                  type="submit"
                  className="w-full bg-brand text-white py-3 rounded-md font-bold mt-4 shadow-md hover:bg-brand/90 transition-colors"
                >
                  提交数据
                </button>
              )}
          </div>
        </form>
      </div>
    </div>
  );
};
