import React, { useState } from "react";
import { AlertCircle, UploadCloud, Star, FileText, X } from "lucide-react";
import { type ComponentSchema } from "../types/editor";
import { Cascader } from "antd";

interface FormControlProps {
    schema: ComponentSchema; // 当前组件的配置信息
    value: any;              // 当前绑定的值
    hasError?: boolean;      // 是否有校验错误
    onChange: (val: any) => void; // 值改变时的回调
}

export const FormControl: React.FC<FormControlProps> = ({ schema, value, hasError, onChange }) => {
    // 评分组件专属的局部状态 (完美解耦，不再污染父组件)
    const [hoverValue, setHoverValue] = useState(0);

    const baseInputStyle = `w-full border rounded-md px-3 py-2.5 text-sm outline-none transition-all ${hasError
            ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200 text-red-900"
            : "border-gray-300 focus:ring-2 focus:ring-brand bg-white"
        }`;

    switch (schema.type) {
        case "input":
            return (
                <div className="relative">
                    <input
                        type="text"
                        placeholder={schema.props.placeholder}
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        className={baseInputStyle}
                    />
                    {hasError && <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-3" />}
                </div>
            );
        case "textarea":
            return (
                <textarea
                    placeholder={schema.props.placeholder}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${baseInputStyle} resize-y min-h-[80px]`}
                />
            );
        case "date":
            return (
                <input
                    type="date"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className={baseInputStyle}
                />
            );
        case "select":
            return (
                <select value={value || ""} onChange={(e) => onChange(e.target.value)} className={baseInputStyle}>
                    <option value="" disabled>请选择...</option>
                    {schema.props.options?.map((opt, i) => <option key={i} value={opt.value}>{opt.label}</option>)}
                </select>
            );
        case "radio":
            return (
                <div className="flex flex-col gap-3 mt-1">
                    {schema.props.options?.map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 cursor-pointer group hover:bg-gray-50 p-1 -ml-1 rounded transition-colors">
                            <input type="radio" name={`radio_${schema.id}`} value={opt.value} checked={value === opt.value} onChange={(e) => onChange(e.target.value)} className="w-4 h-4 text-brand accent-brand cursor-pointer" />
                            <span className="text-sm text-gray-700">{opt.label}</span>
                        </label>
                    ))}
                </div>
            );
        case "checkbox":
            return (
                <div className="flex flex-col gap-3 mt-1">
                    {schema.props.options?.map((opt, i) => {
                        const currentArr = value || [];
                        const isChecked = currentArr.includes(opt.value);
                        return (
                            <label key={i} className="flex items-center gap-2 cursor-pointer group hover:bg-gray-50 p-1 -ml-1 rounded transition-colors">
                                <input type="checkbox" value={opt.value} checked={isChecked} onChange={(e) => {
                                    const newArr = e.target.checked ? [...currentArr, opt.value] : currentArr.filter((v: string) => v !== opt.value);
                                    onChange(newArr);
                                }} className="w-4 h-4 text-brand rounded accent-brand cursor-pointer" />
                                <span className="text-sm text-gray-700">{opt.label}</span>
                            </label>
                        );
                    })}
                </div>
            );
        case "upload":
            return (
                <div className="w-full">
                    <input type="file" id={`file_${schema.id}`} className="hidden" accept={schema.props.accept} onChange={(e) => { const file = e.target.files?.[0]; if (file) onChange(file.name); }} />
                    <label htmlFor={`file_${schema.id}`} className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${hasError ? "border-red-300 bg-red-50 hover:bg-red-100" : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-brand hover:shadow-sm"}`}>
                        {value ? (
                            <div className="flex items-center gap-2 text-brand">
                                <FileText className="w-6 h-6" />
                                <span className="text-sm font-medium">{value}</span>
                                <button type="button" onClick={(e) => { e.preventDefault(); onChange(""); }} className="ml-2 text-red-400 hover:text-red-600 bg-white p-1 rounded-full shadow-sm"><X className="w-3 h-3" /></button>
                            </div>
                        ) : (
                            <>
                                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-600 font-medium">点击或拖拽文件上传</span>
                                <span className="text-xs text-gray-400 mt-1">支持 {schema.props.accept || "所有"} 格式文件</span>
                            </>
                        )}
                    </label>
                </div>
            );
        case "rate":
            return (
                <div className="flex gap-1 items-center mt-1">
                    {Array.from({ length: schema.props.maxRate || 5 }).map((_, i) => {
                        const starValue = i + 1;
                        const currentVal = value || 0;
                        const isFilled = hoverValue ? starValue <= hoverValue : starValue <= currentVal;
                        return (
                            <Star key={i} className={`w-7 h-7 cursor-pointer transition-all hover:scale-110 ${isFilled ? "text-yellow-400 fill-yellow-400 drop-shadow-sm" : "text-gray-200 fill-gray-200"}`}
                                onMouseEnter={() => setHoverValue(starValue)}
                                onMouseLeave={() => setHoverValue(0)}
                                onClick={() => onChange(starValue)} />
                        )
                    })}
                    <span className="ml-3 text-sm text-yellow-600 font-bold bg-yellow-50 px-2 py-0.5 rounded">{value || 0}</span>
                </div>
            );
        case "switch":
            return (
                <div className="flex items-center gap-3 mt-1 cursor-pointer" onClick={() => onChange(!value)}>
                    <button type="button" role="switch" aria-checked={value || false} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${value ? "bg-brand shadow-inner" : "bg-gray-200"}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                    <span className={`text-sm font-medium ${value ? 'text-brand' : 'text-gray-500'}`}>{value ? (schema.props.activeText || '开启') : (schema.props.inactiveText || '关闭')}</span>
                </div>
            );
        case "cascader":
            return (
                <Cascader options={schema.props.options as any} value={value || []} onChange={(val) => onChange(val)} placeholder="请选择级联项..." status={hasError ? "error" : ""} className="w-full" style={{ height: '42px' }} />
            );
        default:
            return null;
    }
};