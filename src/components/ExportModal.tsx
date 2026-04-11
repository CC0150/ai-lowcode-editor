import React, { useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { X, Copy, CheckCircle2, Code2, FileJson } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const ExportModal: React.FC<Props> = ({ onClose }) => {
  const { components } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'json' | 'react'>('json');
  const [copied, setCopied] = useState(false);

  // 1. 生成标准的 JSON Schema
  const jsonSchema = JSON.stringify(components, null, 2);

  // 2. （硬核亮点）AST 简易编译：将 JSON 转化为真实的 React 源码
  const generateReactCode = () => {
    return `import React, { useState } from 'react';

export default function GeneratedForm() {
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("提交的数据：", formData);
    // 这里可以接入真实的 API
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-6">动态生成表单</h2>
      <div className="flex flex-col gap-4">
        ${components.map(comp => {
          // 处理显示逻辑
          const condition = comp.visibleRule 
            ? `formData['${comp.visibleRule.sourceId}'] === '${comp.visibleRule.value}'`
            : 'true';

          let inputCode = '';
          if (comp.type === 'input') {
            inputCode = `<input className="border p-2 rounded w-full" placeholder="${comp.props.placeholder || ''}" required={${comp.required}} onChange={e => setFormData({...formData, '${comp.id}': e.target.value})} />`;
          } else if (comp.type === 'radio') {
            inputCode = comp.props.options?.map(opt => 
              `<label className="flex gap-2"><input type="radio" name="${comp.id}" value="${opt.value}" onChange={e => setFormData({...formData, '${comp.id}': e.target.value})} /> ${opt.label}</label>`
            ).join('\\n          ');
          } else if (comp.type === 'select') {
            inputCode = `<select className="border p-2 rounded w-full" onChange={e => setFormData({...formData, '${comp.id}': e.target.value})}>
            <option value="">请选择</option>
            ${comp.props.options?.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('\\n            ')}
          </select>`;
          } else if (comp.type === 'button') {
            inputCode = `<button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mt-4 w-full">${comp.props.buttonText || '提交'}</button>`;
          }

          if (comp.type === 'button') return inputCode;

          // 包装每个表单项（带逻辑判断）
          return `{${condition} && (
          <div className="flex flex-col gap-1">
            <label className="font-medium text-sm">${comp.label} ${comp.required ? '<span className="text-red-500">*</span>' : ''}</label>
            ${inputCode}
          </div>
        )}`;
        }).join('\n        ')}
      </div>
    </form>
  );
}
`;
  };

  const handleCopy = () => {
    const textToCopy = activeTab === 'json' ? jsonSchema : generateReactCode();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* 头部 */}
        <header className="px-6 py-4 border-b flex items-center justify-between bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-brand" /> 导出产物
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* 内容区 */}
        <div className="flex h-[600px]">
          {/* 左侧侧边栏切换 Tab */}
          <div className="w-48 border-r bg-gray-50 flex flex-col p-2 gap-1">
            <button 
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'json' ? 'bg-white text-brand shadow-sm border border-gray-200' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <FileJson className="w-4 h-4" /> JSON Schema
            </button>
            <button 
              onClick={() => setActiveTab('react')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'react' ? 'bg-white text-brand shadow-sm border border-gray-200' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Code2 className="w-4 h-4" /> React 源码
            </button>
          </div>

          {/* 右侧代码展示区 */}
          <div className="flex-1 flex flex-col relative bg-[#1E1E1E]">
            <button 
              onClick={handleCopy}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs transition-colors backdrop-blur-md"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? '已复制' : '复制代码'}
            </button>
            <pre className="p-6 overflow-auto text-[13px] font-mono text-gray-300 leading-relaxed h-full">
              <code>{activeTab === 'json' ? jsonSchema : generateReactCode()}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};