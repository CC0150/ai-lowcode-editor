import React, { useState, useRef } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { type ComponentSchema } from "../types/editor";
import { FormControl } from "./FormControl"; // 引入刚才封装好的组件

interface Props {
  onBack?: () => void;
  overrideComponents?: ComponentSchema[];
  isEmbedded?: boolean;
}

export const FormPreview: React.FC<Props> = ({ onBack, overrideComponents, isEmbedded = false }) => {
  const { components: storeComponents } = useEditorStore();
  const components = overrideComponents || storeComponents;

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleInputChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }) as any);
    }
  };

  const checkIsVisible = (comp: ComponentSchema) => {
    if (!comp.visibleRule || !comp.visibleRule.sourceId) return true;
    return formData[comp.visibleRule.sourceId] === comp.visibleRule.value;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    let firstErrorId: string | null = null;

    components.forEach((comp) => {
      if (!checkIsVisible(comp)) return;

      const val = formData[comp.id];
      const isEmpty = val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);

      if (comp.required && comp.type !== "button" && comp.type !== "switch" && isEmpty) {
        newErrors[comp.id] = "此项为必填项";
        if (!firstErrorId) firstErrorId = comp.id;
      } else if (!isEmpty && typeof val === 'string' && comp.validation?.regex) {
        try {
          if (!new RegExp(comp.validation.regex).test(val)) {
            newErrors[comp.id] = comp.validation.message || "格式不正确";
            if (!firstErrorId) firstErrorId = comp.id;
          }
        } catch (err) { }
      }
    });

    if (firstErrorId) {
      setErrors(newErrors);
      fieldRefs.current[firstErrorId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    console.log("=== 提交的表单数据 ===", formData);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className={`${isEmbedded ? 'w-full h-full p-12' : 'flex-1 h-full absolute inset-0 z-50 bg-gray-50'} flex flex-col items-center justify-center`}>
        <div className="bg-white p-8 rounded-2xl shadow-sm flex flex-col items-center max-w-sm w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">提交成功</h2>
          <p className="text-gray-500 text-sm mt-2">{isEmbedded ? "校验通过，逻辑运行正常！" : "控制台已打印收集到的受控数据。"}</p>
          <button onClick={isEmbedded ? () => setIsSubmitted(false) : onBack} className="mt-8 px-8 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 transition-colors shadow-sm w-full">
            {isEmbedded ? "返回重新试填" : "返回编辑器"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={isEmbedded ? "w-full h-full relative" : "flex-1 bg-gray-100 overflow-auto flex flex-col h-full w-full absolute inset-0 z-50"}>
      {!isEmbedded && (
        <header className="shrink-0 h-14 bg-white flex items-center px-6 sticky top-0 z-20 shadow-sm">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors text-sm font-medium cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> 退出预览
          </button>
        </header>
      )}

      <div className={isEmbedded ? "p-6 flex justify-center pb-24" : "flex-1 p-8 flex justify-center pb-32"}>
        <form onSubmit={handleSubmit} className={isEmbedded ? "w-full max-w-2xl bg-white rounded-xl h-fit" : "w-full max-w-2xl bg-white shadow-xl shadow-gray-200/50 rounded-2xl p-10 h-fit border border-gray-100"}>

          {!isEmbedded && (
            <div className="border-b-2 border-gray-100 pb-5 mb-8">
              <h1 className="text-3xl font-extrabold text-center text-gray-800 tracking-tight">表单预览模式</h1>
              <p className="text-center text-gray-400 text-sm mt-2">真实校验环境，尝试触发错误或完成提交</p>
            </div>
          )}

          {components.length === 0 && isEmbedded && <div className="text-center text-gray-400 py-10">AI 未生成任何组件内容</div>}

          <div className="flex flex-col gap-7">
            {components.map((comp, index) => {
              if (!checkIsVisible(comp)) return null;

              if (comp.type === "button") {
                if (isEmbedded) return null;
                return (
                  <div key={comp.id} className="pt-4 mt-4 border-t border-gray-100">
                    <button type="submit" className="w-full bg-brand text-white py-3.5 rounded-xl font-bold text-[15px] shadow-lg shadow-brand/20 hover:bg-brand/90 hover:shadow-brand/30 transition-all active:scale-[0.99]">
                      {comp.props.buttonText || "提交表单"}
                    </button>
                  </div>
                );
              }

              const hasError = !!errors[comp.id];

              return (
                <div
                  key={comp.id}
                  ref={(el) => { (fieldRefs.current[comp.id] = el) }}
                  className={`flex flex-col gap-2 p-4 -mx-4 rounded-xl transition-all duration-300 ${hasError ? 'bg-red-50/50 ring-1 ring-red-100 animate-[shake_0.5s_ease-in-out]' : 'hover:bg-gray-50/50'}`}
                >
                  <label className={`text-[15px] font-semibold flex items-start gap-1 leading-snug ${hasError ? "text-red-600" : "text-gray-800"}`}>
                    <span className="text-gray-400 font-normal mr-1">{index + 1}.</span>
                    {comp.label}
                    {comp.required && <span className="text-red-500 font-bold ml-1">*</span>}
                  </label>

                  <div className="mt-1">
                    {/* === 调用独立的组件 === */}
                    <FormControl
                      schema={comp}
                      value={formData[comp.id]}
                      hasError={hasError}
                      onChange={(val) => handleInputChange(comp.id, val)}
                    />
                  </div>

                  {hasError && <p className="text-xs font-medium text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[comp.id]}</p>}
                </div>
              );
            })}
          </div>
        </form>
      </div>
    </div>
  );
};