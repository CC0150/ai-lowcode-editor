import React, { useState } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { X, Copy, CheckCircle2, Code2, FileJson } from "lucide-react";

interface Props {
  onClose: () => void;
}

export const ExportModal: React.FC<Props> = ({ onClose }) => {
  const { components } = useEditorStore();
  const [activeTab, setActiveTab] = useState<"json" | "react">("json");
  const [copied, setCopied] = useState(false);

  // 1. 生成标准的 JSON Schema
  const jsonSchema = JSON.stringify(components, null, 2);

  // 2. 生成基于 Ant Design 的 React 源码
  const generateReactCode = () => {
    // 检查是否包含特定组件以按需引入
    const hasDate = components.some((c) => c.type === "date");
    const antComponents = Array.from(
      new Set([
        "Form",
        "Button",
        "Input",
        ...components.map((c) => {
          switch (c.type) {
            case "select":
              return "Select";
            case "radio":
              return "Radio";
            case "checkbox":
              return "Checkbox";
            case "rate":
              return "Rate";
            case "switch":
              return "Switch";
            case "date":
              return "DatePicker";
            case "cascader":
              return "Cascader";
            default:
              return "";
          }
        }),
      ]),
    )
      .filter(Boolean)
      .join(", ");

    return `import React, { useState } from 'react';
import { ${antComponents} } from 'antd';
${hasDate ? "import dayjs from 'dayjs';" : ""}

export default function GeneratedForm() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("提交的数据：", values);
    // 这里可以接入真实的 API
  };

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white rounded-xl shadow-lg mt-10">
      <div className="mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">预览表单</h2>
        <p className="text-gray-500 text-sm mt-1">此表单由 AI 低代码平台自动生成</p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{}}
        scrollToFirstError
      >
        ${components
          .map((comp) => {
            // 处理显示逻辑
            const condition = comp.visibleRule
              ? `form.getFieldValue('${comp.visibleRule.sourceId}') === '${comp.visibleRule.value}'`
              : "true";

            let inputNode = "";
            const commonProps = `placeholder="${comp.props.placeholder || ""}"`;

            switch (comp.type) {
              case "input":
                inputNode = `<Input ${commonProps} />`;
                break;
              case "textarea":
                inputNode = `<Input.TextArea ${commonProps} rows={4} />`;
                break;
              case "select":
                inputNode = `<Select ${commonProps} options={${JSON.stringify(comp.props.options)}} />`;
                break;
              case "radio":
                inputNode = `<Radio.Group options={${JSON.stringify(comp.props.options)}} />`;
                break;
              case "checkbox":
                inputNode = `<Checkbox.Group options={${JSON.stringify(comp.props.options)}} />`;
                break;
              case "rate":
                inputNode = `<Rate count={${comp.props.maxRate || 5}} />`;
                break;
              case "switch":
                inputNode = `<Switch checkedChildren="${comp.props.activeText || "开"}" unCheckedChildren="${comp.props.inactiveText || "关"}" />`;
                break;
              case "date":
                inputNode = `<DatePicker className="w-full" />`;
                break;
              case "cascader":
                inputNode = `<Cascader options={${JSON.stringify(comp.props.options)}} placeholder="请选择" className="w-full" />`;
                break;
              case "button":
                return `<Form.Item>
          <Button type="primary" htmlType="submit" size="large" block>
            ${comp.props.buttonText || "提交"}
          </Button>
        </Form.Item>`;
              default:
                return "";
            }

            // 包装 Form.Item
            return `<Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.${comp.visibleRule?.sourceId} !== currentValues.${comp.visibleRule?.sourceId}}
        >
          {() => (
            ${condition} ? (
              <Form.Item
                name="${comp.id}"
                label="${comp.label}"
                rules={[{ required: ${!!comp.required}, message: '请输入${comp.label}' }]}
              >
                ${inputNode}
              </Form.Item>
            ) : null
          )}
        </Form.Item>`;
          })
          .join("\n        ")}
      </Form>
    </div>
  );
}
`;
  };

  const handleCopy = () => {
    const textToCopy = activeTab === "json" ? jsonSchema : generateReactCode();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* 头部 */}
        <header className="px-6 py-4 border-b flex items-center justify-between bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-brand" /> 导出产物
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* 内容区 */}
        <div className="flex h-[650px]">
          {/* 左侧侧边栏切换 Tab */}
          <div className="w-52 border-r bg-gray-50 flex flex-col p-3 gap-2">
            <button
              onClick={() => setActiveTab("json")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "json" ? "bg-white text-brand shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-200"}`}
            >
              <FileJson className="w-4 h-4" /> JSON Schema
            </button>
            <button
              onClick={() => setActiveTab("react")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "react" ? "bg-white text-brand shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-200"}`}
            >
              <Code2 className="w-4 h-4" /> React 源码
            </button>
          </div>

          {/* 右侧代码展示区 */}
          <div className="flex-1 flex flex-col relative bg-[#1E1E1E] min-h-0 min-w-0">
            <div className="absolute top-4 right-6 flex items-center gap-3 z-10">
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                TSX / JSON
              </span>
              <button
                onClick={handleCopy}
                className="bg-brand text-white px-4 py-1.5 rounded-md flex items-center gap-2 text-xs font-bold hover:bg-brand/90 transition-all shadow-lg active:scale-95"
              >
                {copied ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? "已复制" : "复制代码"}
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 pt-16 w-full custom-scrollbar">
              <pre className="text-[13px] font-mono text-gray-300 leading-relaxed">
                <code>
                  {activeTab === "json" ? jsonSchema : generateReactCode()}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
