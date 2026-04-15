import React from 'react';
import { Plus, Trash2, List } from 'lucide-react';
import { type OptionItem } from '../types/editor';

interface OptionsEditorProps {
    options: OptionItem[];
    onChange: (newOptions: OptionItem[]) => void;
}

export const OptionsEditor: React.FC<OptionsEditorProps> = ({ options, onChange }) => {

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
            <button
                onClick={handleAddOption}
                className="mt-2 flex items-center justify-center gap-1.5 w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 border-dashed text-brand rounded-lg text-sm transition-colors font-medium shadow-sm"
            >
                <Plus className="w-4 h-4" /> 新增选项
            </button>
        </div>
    );
};