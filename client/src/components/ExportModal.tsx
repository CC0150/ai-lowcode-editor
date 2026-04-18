import React, { useState } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { X, Copy, CheckCircle2, Code2, FileJson } from "lucide-react";

interface Props {
  onClose: () => void;
}

export const ExportModal: React.FC<Props> = ({ onClose }) => {
  const { components, canvasTitle } = useEditorStore();
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
        "Button", // 确保引入 Button
        "Input",
        "message",
        ...(components
          .map((c) => {
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
              case "cascader":
                return "Cascader";
              case "date":
                return "DatePicker";
              case "upload":
                return "Upload";
              default:
                return null;
            }
          })
          .filter(Boolean) as string[]),
      ]),
    );

    const itemsJsx = components
      .map((comp) => {
        const commonProps = `label="${comp.label}" name="${comp.id}" ${comp.required ? "rules={[{ required: true, message: '请输入${comp.label}' }]}" : ""}`;

        switch (comp.type) {
          case "input":
            return `<Form.Item ${commonProps}>\n            <Input placeholder="${comp.props.placeholder || "请输入"}" />\n          </Form.Item>`;
          case "textarea":
            return `<Form.Item ${commonProps}>\n            <Input.TextArea placeholder="${comp.props.placeholder || "请输入"}" rows={4} />\n          </Form.Item>`;
          case "select":
            return `<Form.Item ${commonProps}>\n            <Select placeholder="请选择" options={${JSON.stringify(comp.props.options || [])}} />\n          </Form.Item>`;
          case "radio":
            return `<Form.Item ${commonProps}>\n            <Radio.Group options={${JSON.stringify(comp.props.options || [])}} />\n          </Form.Item>`;
          case "checkbox":
            return `<Form.Item ${commonProps}>\n            <Checkbox.Group options={${JSON.stringify(comp.props.options || [])}} />\n          </Form.Item>`;
          case "date":
            return `<Form.Item ${commonProps}>\n            <DatePicker style={{ width: '100%' }} />\n          </Form.Item>`;
          case "rate":
            return `<Form.Item ${commonProps}>\n            <Rate count={${comp.props.maxRate || 5}} />\n          </Form.Item>`;
          case "switch":
            return `<Form.Item ${commonProps} valuePropName="checked">\n            <Switch unCheckedChildren="${comp.props.inactiveText || "关闭"}" checkedChildren="${comp.props.activeText || "开启"}" />\n          </Form.Item>`;
          case "upload":
            return `<Form.Item ${commonProps} valuePropName="fileList" getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}>\n            <Upload.Dragger action="/upload" listType="picture">\n              <p className="ant-upload-text">点击或拖拽文件上传</p>\n            </Upload.Dragger>\n          </Form.Item>`;
          case "cascader":
            return `<Form.Item ${commonProps}>\n            <Cascader options={${JSON.stringify(comp.props.options || [])}} placeholder="请选择" />\n          </Form.Item>`;
          default:
            return null;
        }
      })
      .filter(Boolean)
      .join("\n\n          ");

    return `import React from 'react';
import { ${antComponents.join(", ")} } from 'antd';
${hasDate ? "import dayjs from 'dayjs';" : ""}

/**
 * AI 生成的表单组件 - ${canvasTitle}
 */
const App: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('表单提交数据:', values);
    message.success('提交成功！');
  };

  return (
    <div style={{ padding: '40px 20px', background: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 640, background: '#fff', padding: 40, borderRadius: 16, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>${canvasTitle}</h1>
          <p style={{ color: '#64748b', marginTop: 8 }}>请填写以下信息完成提交</p>
        </div>

        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onFinish}
          autoComplete="off"
        >
          ${itemsJsx}

          {/* 自动生成的提交按钮 */}
          <Form.Item style={{ marginTop: 40, marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large" style={{ height: 48, borderRadius: 8, fontWeight: 600, fontSize: 16 }}>
              提交表单
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default App;`;
  };

  const activeCode = activeTab === "json" ? jsonSchema : generateReactCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-300">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand/10 rounded-lg">
              <Code2 className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">导出代码</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* 左侧侧边栏切换 */}
          <div className="w-48 border-r border-gray-100 bg-gray-50/50 p-4 flex flex-col gap-2 shrink-0">
            <button
              onClick={() => setActiveTab("json")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "json" ? "bg-white text-brand shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-200"}`}
            >
              <FileJson className="w-4 h-4" /> JSON 配置
            </button>
            <button
              onClick={() => setActiveTab("react")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "react" ? "bg-white text-brand shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-200"}`}
            >
              <Code2 className="w-4 h-4" /> React 源码
            </button>
          </div>

          {/* 右侧代码展示区 */}
          <div className="flex-1 flex flex-col relative bg-[#1E1E1E] min-h-0 min-w-0">
            <div className="absolute top-4 right-6 flex items-center gap-3 z-10">
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                {activeTab.toUpperCase()}
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
              <pre className="text-sm font-mono text-gray-300 leading-relaxed whitespace-pre-wrap break-all">
                {activeCode}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
