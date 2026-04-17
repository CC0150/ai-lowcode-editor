import React, { useState } from 'react';
import { Plus, Trash2, List, Sparkles, Loader2 } from 'lucide-react';
import { type OptionItem } from '../types/editor';

interface OptionsEditorProps {
    options: OptionItem[];
    onChange: (newOptions: OptionItem[]) => void;
    onAIGenerate?: (prompt: string) => Promise<void>; // 增加 AI 回调接口
    isAILoading?: boolean; // 增加 Loading 状态
}

export const OptionsEditor: React.FC<OptionsEditorProps> = ({
    options,
    onChange,
    onAIGenerate,
    isAILoading
}) => {
    const [showAI, setShowAI] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');

    const handleOptionChange = (index: number, key: 'label' | 'value', val: string) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], [key]: val };
        onChange(newOptions);
    };

    const handleAddOption = () => {
        onChange([...options, { label: `新选项 ${options.length + 1}`, value: `val_${Date.now()}` }]);
    };

    const handleRemoveOption = (index: number) => {
        onChange(options.filter((_, i) => i !== index));
    };

    const handleAIGenerate = async () => {
        if (!aiPrompt.trim() || !onAIGenerate) return;
        await onAIGenerate(aiPrompt);
        setShowAI(false);
        setAiPrompt('');
    };

    return (
        <div className="flex flex-col gap-3 mt-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <List className="w-3 h-3" /> 数据字典配置
            </label>
            <div className="flex flex-col gap-2.5">
                {options.map((opt, index) => (
                    <div key={index} className="flex items-start gap-2 group bg-slate-50 p-2 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors">
                        <div className="flex-1 flex flex-col gap-2">
                            <input
                                type="text"
                                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-sm focus:border-brand outline-none"
                                placeholder="显示文本 (Label)"
                                value={opt.label}
                                onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                            />
                            <input
                                type="text"
                                className="w-full px-2 py-1 bg-transparent border-b border-dashed border-slate-300 text-[11px] font-mono text-slate-500 focus:border-brand outline-none"
                                placeholder="提交值 (Value)"
                                value={opt.value}
                                onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => handleRemoveOption(index)}
                            className="mt-1 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 mt-1">
                <button
                    onClick={handleAddOption}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 border-dashed text-indigo-500 rounded-lg text-sm transition-colors font-medium shadow-sm"
                >
                    <Plus className="w-4 h-4" /> 新增选项
                </button>
                {/* AI 唤醒按钮 */}
                {onAIGenerate && (
                    <button
                        onClick={() => setShowAI(!showAI)}
                        className={`px-3 py-2 border rounded-lg flex items-center justify-center transition-colors shadow-sm ${showAI
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                : 'bg-white border-slate-200 border-dashed text-indigo-500 hover:bg-indigo-50 hover:border-indigo-200'
                            }`}
                        title="AI 智能生成选项"
                    >
                        <Sparkles className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* AI 输入控制台 */}
            {showAI && (
                <div className="mt-1 flex flex-col gap-2 p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg animate-in slide-in-from-top-1 fade-in duration-200">
                    <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> AI 批量生成选项
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="如：中国新一线城市..."
                            className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-indigo-200 rounded focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none shadow-sm"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
                        />
                        <button
                            onClick={handleAIGenerate}
                            disabled={isAILoading || !aiPrompt.trim()}
                            className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center min-w-[50px] shadow-sm"
                        >
                            {isAILoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "生成"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};