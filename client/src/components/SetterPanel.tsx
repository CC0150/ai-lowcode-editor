import { useState, useEffect, useRef } from "react";
import { useEditorStore } from "../store/useEditorStore";
import {
  Trash2,
  Settings2,
  GitBranch,
  ShieldCheck,
  BoxSelect,
  Upload,
  Star,
  ToggleLeft,
  MousePointer2,
  Sliders,
  Sparkles,
  Wand2,
  Loader2,
} from "lucide-react";
import { PanelSection } from "./PanelSection";
import { OptionsEditor } from "./OptionsEditor";
import { message, Select } from "antd";
import { CascaderEditor } from "./CascaderEditor";

export const SetterPanel = () => {
  const {
    components,
    selectedId,
    updateComponent,
    updateProps,
    deleteComponent,
  } = useEditorStore();
  const selectedComponent = components.find((c) => c.id === selectedId);

  // --- AI Copilot 状态 ---
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotPrompt, setCopilotPrompt] = useState("");
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const copilotInputRef = useRef<HTMLInputElement>(null);

  // --- AI Regex 状态 ---
  const [isRegexAIOpen, setIsRegexAIOpen] = useState(false);
  const [regexPrompt, setRegexPrompt] = useState("");
  const [isRegexLoading, setIsRegexLoading] = useState(false);

  // --- AI 选项生成状态 ---
  const [isOptionsAILoading, setIsOptionsAILoading] = useState(false);

  // --- AI 选项生成处理函数 ---
  const handleGenerateOptions = async (prompt: string) => {
    if (!selectedComponent) return;
    setIsOptionsAILoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/modify-component", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          component: selectedComponent,
          prompt: `帮我批量生成选项，主题是："${prompt}"。请直接重写 props.options 数组，每个选项包含 label 和 value (value尽量使用英文或拼音缩写)。`,
        }),
      });
      const result = await res.json();
      if (result.success && result.data?.props?.options) {
        updateProps(selectedComponent.id, { options: result.data.props.options });
        message.success("AI 选项生成成功");
      } else {
        message.error("生成失败，请尝试换个描述");
      }
    } catch (e) {
      message.error("请求失败，请检查服务");
    } finally {
      setIsOptionsAILoading(false);
    }
  };

  // 快捷键监听：选中组件时，按 Ctrl+I 唤醒局部 AI
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "i" &&
        selectedId
      ) {
        e.preventDefault();
        setIsCopilotOpen(true);
        setTimeout(() => copilotInputRef.current?.focus(), 50);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId]);

  // 局部修改请求逻辑
  const handleModifyComponent = async () => {
    if (!copilotPrompt.trim() || !selectedComponent) return;
    setIsCopilotLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/modify-component", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          component: selectedComponent,
          prompt: copilotPrompt,
        }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        // 全量覆盖当前组件（保留原 ID 即可）
        updateComponent(selectedComponent.id, result.data);
        message.success("AI 修改成功");
        setCopilotPrompt("");
        setIsCopilotOpen(false);
      } else {
        message.error("AI 修改失败");
      }
    } catch (e) {
      message.error("请求失败，请检查服务");
    } finally {
      setIsCopilotLoading(false);
    }
  };

  /**
   * 触发正则生成
   */
  const handleGenerateRegex = async () => {
    if (!regexPrompt.trim() || !selectedComponent) return;
    setIsRegexLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/generate-regex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: regexPrompt }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        updateComponent(selectedComponent.id, {
          validation: {
            regex: result.data.regex,
            message: result.data.message,
          },
        });
        message.success("正则配置已应用");
        setRegexPrompt("");
        setIsRegexAIOpen(false);
      }
    } catch (e) {
      message.error("正则生成失败");
    } finally {
      setIsRegexLoading(false);
    }
  };

  const inputBaseStyle =
    "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 transition-all placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none shadow-sm";

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

  const dependencyOptions = components.filter(
    (c) => c.id !== selectedComponent.id && c.type !== "button",
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 relative">
      <header className="shrink-0 px-5 py-4 border-b border-slate-200 bg-white z-10 flex items-center justify-between shadow-sm">
        <div className="flex flex-col">
          <h3 className="font-bold text-slate-800">属性面板</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* AI Copilot 唤醒按钮 */}
          <button
            onClick={() => {
              setIsCopilotOpen(!isCopilotOpen);
              setTimeout(() => copilotInputRef.current?.focus(), 50);
            }}
            className={`p-1.5 rounded-md transition-all shadow-sm border text-xs flex items-center gap-1 font-medium ${isCopilotOpen ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "text-indigo-500 border-indigo-100 hover:bg-indigo-50 bg-white"}`}
            title="局部 AI 助手 (Ctrl+I)"
          >
            <Sparkles className="w-4 h-4" /> AI 助手
          </button>
          <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[11px] font-mono font-bold rounded-md border border-indigo-200 ml-1">
            {selectedComponent.type}
          </span>
          <button
            onClick={() => deleteComponent(selectedComponent.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* --- AI Copilot 浮层交互区 --- */}
      {isCopilotOpen && (
        <div className="shrink-0 p-4 bg-indigo-600/5 border-b border-indigo-100 shadow-inner animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-900">
              对该组件发指令...
            </span>
            <span className="ml-auto text-[10px] text-indigo-400 bg-white px-1.5 rounded border border-indigo-100 font-mono shadow-sm">
              Ctrl+I
            </span>
          </div>
          <div className="flex gap-2">
            <input
              ref={copilotInputRef}
              type="text"
              placeholder="例如：把选项改为四大名著..."
              className="flex-1 px-3 py-1.5 text-sm rounded border border-indigo-200 focus:ring-2 focus:ring-indigo-500/30 outline-none"
              value={copilotPrompt}
              onChange={(e) => setCopilotPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleModifyComponent()}
            />
            <button
              onClick={handleModifyComponent}
              disabled={isCopilotLoading || !copilotPrompt.trim()}
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center min-w-[60px]"
            >
              {isCopilotLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "修改"
              )}
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
        {/* 1. 基础属性  */}
        {selectedComponent.type !== "button" && (
          <PanelSection id="basic-props" title="基础属性" icon={Settings2}>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">
                字段标题 (Label)
              </label>
              <input
                type="text"
                className={inputBaseStyle}
                value={selectedComponent.label || ""}
                onChange={(e) =>
                  updateComponent(selectedComponent.id, {
                    label: e.target.value,
                  })
                }
              />
            </div>
            {selectedComponent.type !== "switch" && (
              <label className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-brand/50 transition-all mt-2">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-700">
                    设为必填项
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    提交时将校验此字段
                  </span>
                </div>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={selectedComponent.required || false}
                    onChange={(e) =>
                      updateComponent(selectedComponent.id, {
                        required: e.target.checked,
                      })
                    }
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
                </div>
              </label>
            )}
          </PanelSection>
        )}

        {/* 2. 控件高级属性  */}
        <PanelSection id="advanced-props" title="控件高级属性" icon={Sliders}>
          {selectedComponent.type === "button" && (
            <div className="flex flex-col gap-2 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
              <label className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                <MousePointer2 className="w-3 h-3" /> 按钮文字 (Text)
              </label>
              <input
                type="text"
                className={inputBaseStyle}
                value={selectedComponent.props.buttonText || ""}
                onChange={(e) =>
                  updateProps(selectedComponent.id, {
                    buttonText: e.target.value,
                  })
                }
              />
            </div>
          )}
          {(selectedComponent.type === "input" ||
            selectedComponent.type === "textarea") && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  占位文字 (Placeholder)
                </label>
                <input
                  type="text"
                  className={inputBaseStyle}
                  value={selectedComponent.props.placeholder || ""}
                  onChange={(e) =>
                    updateProps(selectedComponent.id, {
                      placeholder: e.target.value,
                    })
                  }
                />
              </div>
            )}
          {selectedComponent.type === "upload" && (
            <div className="flex flex-col gap-2 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
              <label className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                <Upload className="w-3 h-3" /> 限制文件类型
              </label>
              <input
                type="text"
                placeholder="例如: image/*"
                className={inputBaseStyle}
                value={selectedComponent.props.accept || ""}
                onChange={(e) =>
                  updateProps(selectedComponent.id, { accept: e.target.value })
                }
              />
            </div>
          )}
          {selectedComponent.type === "rate" && (
            <div className="flex flex-col gap-2 p-3 bg-yellow-50/50 rounded-lg border border-yellow-100">
              <label className="text-xs font-bold text-yellow-900 flex items-center gap-1">
                <Star className="w-3 h-3" /> 最大星数 (Max Rate)
              </label>
              <input
                type="number"
                min={3}
                max={10}
                className={inputBaseStyle}
                value={selectedComponent.props.maxRate || 5}
                onChange={(e) =>
                  updateProps(selectedComponent.id, {
                    maxRate: Number(e.target.value),
                  })
                }
              />
            </div>
          )}
          {selectedComponent.type === "switch" && (
            <div className="flex flex-col gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <ToggleLeft className="w-3 h-3" /> 状态文案
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="开启"
                  className={inputBaseStyle}
                  value={selectedComponent.props.activeText || ""}
                  onChange={(e) =>
                    updateProps(selectedComponent.id, {
                      activeText: e.target.value,
                    })
                  }
                />
                <input
                  type="text"
                  placeholder="关闭"
                  className={inputBaseStyle}
                  value={selectedComponent.props.inactiveText || ""}
                  onChange={(e) =>
                    updateProps(selectedComponent.id, {
                      inactiveText: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
          {(selectedComponent.type === "radio" ||
            selectedComponent.type === "select" ||
            selectedComponent.type === "checkbox") && (
              <OptionsEditor
                options={selectedComponent.props.options || []}
                onChange={(newOpts) =>
                  updateProps(selectedComponent.id, { options: newOpts })
                }
                onAIGenerate={handleGenerateOptions}
                isAILoading={isOptionsAILoading}
              />
            )}
          {selectedComponent.type === "cascader" && (
            <CascaderEditor
              options={selectedComponent.props.options || []}
              onChange={(newOpts) =>
                updateProps(selectedComponent.id, { options: newOpts })
              }
              onAIGenerate={handleGenerateOptions}
              isAILoading={isOptionsAILoading}
            />
          )}
        </PanelSection>

        {/* 3. 数据校验 (带 AI 正则生成)  */}
        {(selectedComponent.type === "input" ||
          selectedComponent.type === "textarea") && (
            <PanelSection id="validation-props" title="数据校验" icon={ShieldCheck} defaultOpen={true}>
              <div className="mb-4 flex flex-col bg-indigo-50/40 border border-indigo-100/80 rounded-xl overflow-hidden transition-all">
                <div
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-indigo-50/60 transition-colors"
                  onClick={() => setIsRegexAIOpen(!isRegexAIOpen)}
                >
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-indigo-500" /> AI 智能正则助手
                  </span>
                  <span className="text-[10px] text-indigo-400 font-medium bg-white px-2 py-0.5 rounded-full border border-indigo-100 shadow-sm">
                    {isRegexAIOpen ? "收起" : "试试看"}
                  </span>
                </div>

                {isRegexAIOpen && (
                  <div className="flex flex-col gap-2 px-3 pb-3 pt-1 border-t border-indigo-100/50 animate-in slide-in-from-top-1 fade-in duration-200">
                    <input
                      type="text"
                      placeholder="例如：大陆手机号、邮箱、必须包含数字..."
                      className={`${inputBaseStyle} !text-xs !py-1.5 focus:!border-indigo-300 focus:!ring-indigo-500/20`}
                      value={regexPrompt}
                      onChange={(e) => setRegexPrompt(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleGenerateRegex()
                      }
                    />
                    <button
                      onClick={handleGenerateRegex}
                      disabled={isRegexLoading || !regexPrompt.trim()}
                      className="w-full bg-white border border-indigo-200 text-indigo-600 text-xs py-1.5 rounded-lg font-semibold hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-50 disabled:bg-slate-50 disabled:border-slate-200 disabled:text-slate-400 flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      {isRegexLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" /> 生成并应用
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  正则表达式 (Regex)
                </label>
                <input
                  type="text"
                  placeholder="例如: ^1[3-9]\d{9}$"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-green-400 font-mono placeholder:text-slate-500 focus:ring-2 focus:ring-brand/50 outline-none shadow-inner"
                  value={selectedComponent.validation?.regex || ""}
                  onChange={(e) =>
                    updateComponent(selectedComponent.id, {
                      validation: {
                        regex: e.target.value,
                        message:
                          selectedComponent.validation?.message || "格式不正确",
                      },
                    })
                  }
                />
              </div>

              {selectedComponent.validation?.regex && (
                <div className="flex flex-col gap-1.5 pt-2">
                  <label className="text-xs font-semibold text-slate-600">
                    校验失败提示语
                  </label>
                  <input
                    type="text"
                    placeholder="请输入正确的格式"
                    className="w-full px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800 placeholder:text-red-300 focus:border-red-300 focus:ring-2 focus:ring-red-200 outline-none"
                    value={selectedComponent.validation?.message || ""}
                    onChange={(e) =>
                      updateComponent(selectedComponent.id, {
                        validation: {
                          ...selectedComponent.validation!,
                          message: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              )}
            </PanelSection>
          )}

        {/* 4. 动态逻辑  */}
        {selectedComponent.type !== "button" && (
          <PanelSection
            id="logic-props"
            title="动态显示逻辑"
            icon={GitBranch}
            defaultOpen={false}
          >
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  依赖字段 (Source)
                </label>
                <Select
                  className="w-full"
                  style={{ height: '38px' }}
                  placeholder="始终显示 (无依赖条件)"
                  allowClear
                  value={selectedComponent.visibleRule?.sourceId || undefined}
                  onChange={(value) =>
                    updateComponent(selectedComponent.id, {
                      visibleRule: value
                        ? {
                          sourceId: value,
                          operator: "===",
                          value: "",
                        }
                        : undefined,
                    })
                  }
                  options={[
                    { label: "始终显示 (无依赖条件)", value: "" },
                    ...dependencyOptions.map((c) => ({
                      label: `${c.label} (ID: ${c.id.slice(0, 4)})`,
                      value: c.id,
                    })),
                  ]}
                />
              </div>

              {selectedComponent.visibleRule?.sourceId && (
                <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-200 border-dashed">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    当触发值等于 (Value)
                  </label>
                  <input
                    type="text"
                    placeholder="输入期望的值..."
                    className="w-full px-3 py-2 bg-white border border-brand/30 rounded-lg text-sm text-slate-800 shadow-sm font-mono focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
                    value={selectedComponent.visibleRule?.value || ""}
                    onChange={(e) =>
                      // 修复visibleRule更新逻辑，确保operator字段被正确设置
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
          </PanelSection>
        )}
      </div>
    </div>
  );
};
