import React, { useState, useEffect, useRef } from 'react';
import { Network, Sparkles, Loader2, CheckCircle2, AlertCircle, Code, LayoutList, Plus, Trash2, PlusCircle } from 'lucide-react';
import { type OptionItem } from '../types/editor';

interface CascaderEditorProps {
    options: OptionItem[];
    onChange: (newOptions: OptionItem[]) => void;
    onAIGenerate?: (prompt: string) => Promise<void>;
    isAILoading?: boolean;
}

export const CascaderEditor: React.FC<CascaderEditorProps> = ({
    options,
    onChange,
    onAIGenerate,
    isAILoading
}) => {
    // 模式切换：'visual' (可视化) | 'code' (JSON)
    const [mode, setMode] = useState<'visual' | 'code'>('visual');
    const [jsonText, setJsonText] = useState("");
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [showAI, setShowAI] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');

    // 行号同步滚动的 Ref
    const lineNumbersRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (mode === 'code') {
            setJsonText(JSON.stringify(options || [], null, 2));
        }
    }, [options, mode]);

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJsonText(e.target.value);
        try {
            const parsed = JSON.parse(e.target.value);
            if (!Array.isArray(parsed)) throw new Error("根节点必须是数组 []");
            setJsonError(null);
            onChange(parsed);
        } catch (err: any) {
            setJsonError(err.message || "JSON 格式有误");
        }
    };

    const handleAIGenerate = async () => {
        if (!aiPrompt.trim() || !onAIGenerate) return;
        await onAIGenerate(aiPrompt);
        setShowAI(false);
        setAiPrompt('');
    };

    // 可视化树形操作逻辑
    const getTargetArray = (currentOptions: OptionItem[], path: number[]) => {
        let current = currentOptions;
        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]].children) {
                current[path[i]].children = [];
            }
            current = current[path[i]].children!;
        }
        return current;
    };

    const handleUpdateNode = (path: number[], key: 'label' | 'value', val: string) => {
        const newOptions = structuredClone(options);
        const targetArray = getTargetArray(newOptions, path);
        targetArray[path[path.length - 1]][key] = val;
        onChange(newOptions);
    };

    const handleAddChild = (path: number[]) => {
        const newOptions = structuredClone(options);
        const targetArray = getTargetArray(newOptions, path);
        const targetNode = targetArray[path[path.length - 1]];
        if (!targetNode.children) targetNode.children = [];
        targetNode.children.push({ label: `新子选项`, value: `val_${Date.now()}` });
        onChange(newOptions);
    };

    const handleRemoveNode = (path: number[]) => {
        const newOptions = structuredClone(options);
        const targetArray = getTargetArray(newOptions, path);
        targetArray.splice(path[path.length - 1], 1);
        onChange(newOptions);
    };

    const handleAddRoot = () => {
        onChange([...options, { label: `新选项 ${options.length + 1}`, value: `val_${Date.now()}` }]);
    };

    const renderTreeNodes = (nodes: OptionItem[], parentPath: number[] = []) => {
        return nodes.map((node, index) => {
            const currentPath = [...parentPath, index];
            return (
                <div key={currentPath.join('-')} className="flex flex-col mt-2">
                    <div className="flex items-start gap-1.5 group">
                        {parentPath.length > 0 && (
                            <div className="w-4 h-4 border-b-2 border-l-2 border-slate-200 rounded-bl-md ml-1 mt-1 shrink-0 opacity-60"></div>
                        )}

                        <div className="flex-1 flex gap-2 bg-slate-50 p-1.5 rounded border border-slate-200 hover:border-slate-300 transition-colors">
                            <input
                                type="text"
                                className="w-1/2 px-2 py-1 text-xs bg-white border border-slate-200 rounded focus:border-brand outline-none"
                                placeholder="文本 (Label)"
                                value={node.label}
                                onChange={(e) => handleUpdateNode(currentPath, 'label', e.target.value)}
                            />
                            <input
                                type="text"
                                className="w-1/2 px-2 py-1 text-xs bg-transparent border-b border-dashed border-slate-300 font-mono text-slate-500 focus:border-brand outline-none"
                                placeholder="值 (Value)"
                                value={node.value}
                                onChange={(e) => handleUpdateNode(currentPath, 'value', e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                                onClick={() => handleAddChild(currentPath)}
                                className="p-1 text-slate-400 hover:text-brand hover:bg-indigo-50 rounded"
                                title="添加子节点"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => handleRemoveNode(currentPath)}
                                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                                title="删除节点"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {node.children && node.children.length > 0 && (
                        <div className="ml-2 pl-3 border-l-2 border-slate-100">
                            {renderTreeNodes(node.children, currentPath)}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="flex flex-col gap-3 mt-1">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Network className="w-3 h-3" /> 树形结构配置
                </label>

                <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                        onClick={() => setMode('visual')}
                        className={`px-2 py-1 text-[10px] font-bold rounded flex items-center gap-1 transition-all ${mode === 'visual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <LayoutList className="w-3 h-3" /> 视图
                    </button>
                    <button
                        onClick={() => setMode('code')}
                        className={`px-2 py-1 text-[10px] font-bold rounded flex items-center gap-1 transition-all ${mode === 'code' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Code className="w-3 h-3" /> 代码
                    </button>
                </div>
            </div>

            {onAIGenerate && (
                <div className="flex flex-col gap-2">
                    {!showAI && (
                        <button
                            onClick={() => setShowAI(true)}
                            className="w-full py-1.5 border border-indigo-200 border-dashed bg-indigo-50/50 hover:bg-indigo-50 text-indigo-500 text-xs rounded-lg flex items-center justify-center gap-1 transition-colors"
                        >
                            <Sparkles className="w-3.5 h-3.5" /> 唤起 AI 智能生成
                        </button>
                    )}
                    {showAI && (
                        <div className="flex flex-col gap-2 p-3 bg-indigo-50/80 border border-indigo-100 rounded-lg animate-in slide-in-from-top-1 fade-in duration-200">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="如：电商商品三级分类..."
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
            )}

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {mode === 'visual' ? (
                    <div className="p-3 max-h-[350px] overflow-y-auto custom-scrollbar bg-slate-50/30">
                        {options.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 text-xs">
                                暂无数据，请点击下方添加或使用 AI 生成
                            </div>
                        ) : (
                            renderTreeNodes(options)
                        )}
                        <button
                            onClick={handleAddRoot}
                            className="mt-4 flex items-center justify-center gap-1 w-full py-1.5 border border-dashed border-slate-300 text-slate-500 hover:text-brand hover:border-brand rounded-lg text-xs transition-colors"
                        >
                            <PlusCircle className="w-3.5 h-3.5" /> 添加根节点
                        </button>
                    </div>
                ) : (
                    // Flex 布局与行号渲染
                    <div className={`relative group flex h-[350px] bg-slate-900 transition-all ${jsonError ? 'border-b-2 border-red-500 bg-slate-900/95' : ''}`}>

                        {/* 左侧：行号显示区 */}
                        <div
                            ref={lineNumbersRef}
                            className="w-10 shrink-0 h-full bg-slate-950/50 text-slate-500 font-mono text-[12px] leading-relaxed text-right py-3 pb-16 pr-2.5 overflow-hidden select-none border-r border-slate-800"
                            aria-hidden="true"
                        >
                            {Array.from({ length: Math.max(1, jsonText.split('\n').length) }).map((_, i) => (
                                <div key={i + 1}>{i + 1}</div>
                            ))}
                        </div>

                        {/* 右侧：代码编辑区 */}
                        <textarea
                            className="flex-1 h-full px-3 py-3 pb-16 bg-transparent text-green-400 font-mono text-[12px] leading-relaxed focus:ring-0 outline-none custom-scrollbar resize-none whitespace-pre"
                            value={jsonText}
                            onChange={handleJsonChange}
                            onScroll={(e) => {
                                // 监听 Textarea 的滚动，同步映射到左侧的行号容器
                                if (lineNumbersRef.current) {
                                    lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
                                }
                            }}
                            wrap="off"
                            spellCheck={false}
                        />

                        {/* 实时校验状态提示 */}
                        <div className={`absolute bottom-3 right-3 flex items-start gap-1.5 px-3 py-2 rounded bg-slate-800/95 backdrop-blur-sm border ${jsonError ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-slate-700'} pointer-events-none transition-all duration-300 opacity-60 group-hover:opacity-100 max-w-[85%] z-10`}>
                            {jsonError ? (
                                <>
                                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                    <span className="text-[11px] text-red-400 font-medium break-all whitespace-pre-wrap leading-relaxed">
                                        {jsonError}
                                    </span>
                                </>
                            ) : (
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                                    <span className="text-[10px] text-green-400 font-medium">JSON 格式合法</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};