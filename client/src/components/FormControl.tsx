import React from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import { type ComponentSchema } from "../types/editor";
import {
    Input,
    Select,
    Radio,
    Checkbox,
    Rate,
    Switch,
    Cascader,
    DatePicker
} from "antd";
import dayjs from "dayjs";

interface FormControlProps {
    schema: ComponentSchema; // 当前组件的配置信息
    value: any;              // 当前绑定的值
    hasError?: boolean;      // 是否有校验错误
    onChange: (val: any) => void; // 值改变时的回调
}

export const FormControl: React.FC<FormControlProps> = ({ schema, value, hasError, onChange }) => {
    // 统一的错误状态标识，传递给 AntD 组件的 status 属性
    const antStatus = hasError ? "error" : "";

    switch (schema.type) {
        case "input":
            return (
                <Input
                    placeholder={schema.props.placeholder}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    status={antStatus}
                    className="w-full"
                />
            );

        case "textarea":
            return (
                <Input.TextArea
                    placeholder={schema.props.placeholder}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    status={antStatus}
                    autoSize={{ minRows: 3, maxRows: 6 }} // 自动适应高度
                    className="w-full"
                />
            );

        case "date":
            return (
                <DatePicker
                    value={value ? dayjs(value) : null}
                    onChange={(date, dateString) => onChange(dateString)}
                    status={antStatus}
                    className="w-full"
                />
            );

        case "select":
            return (
                <Select
                    value={value || undefined}
                    onChange={(val) => onChange(val)}
                    options={schema.props.options}
                    placeholder="请选择..."
                    status={antStatus}
                    className="w-full"
                />
            );

        case "radio":
            return (
                <div className="mt-1">
                    <Radio.Group
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        options={schema.props.options}
                    />
                </div>
            );

        case "checkbox":
            return (
                <div className="mt-1">
                    <Checkbox.Group
                        value={value || []}
                        onChange={(checkedValues) => onChange(checkedValues)}
                        options={schema.props.options}
                    />
                </div>
            );

        case "rate":
            return (
                <div className="mt-1">
                    <Rate
                        value={value || 0}
                        onChange={(val) => onChange(val)}
                        count={schema.props.maxRate || 5}
                    />
                </div>
            );

        case "switch":
            return (
                <div className="mt-1">
                    <Switch
                        checked={!!value}
                        onChange={(checked) => onChange(checked)}
                        checkedChildren={schema.props.activeText || '开启'}
                        unCheckedChildren={schema.props.inactiveText || '关闭'}
                    />
                </div>
            );

        case "cascader":
            return (
                <Cascader
                    options={schema.props.options as any}
                    value={value || []}
                    onChange={(val) => onChange(val)}
                    placeholder="请选择级联项..."
                    status={antStatus}
                    className="w-full"
                />
            );

        case "upload":
            return (
                <div className="w-full mt-1">
                    <input type="file" id={`file_${schema.id}`} className="hidden" accept={schema.props.accept} onChange={(e) => { const file = e.target.files?.[0]; if (file) onChange(file.name); }} />
                    <label htmlFor={`file_${schema.id}`} className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${hasError ? "border-red-300 bg-red-50 hover:bg-red-100" : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-brand hover:shadow-sm"}`}>
                        {value ? (
                            <div className="flex items-center gap-2 text-brand">
                                <FileText className="w-6 h-6" />
                                <span className="text-sm font-medium">{value}</span>
                                <button type="button" onClick={(e) => { e.preventDefault(); onChange(""); }} className="ml-2 text-red-400 hover:text-red-600 bg-white p-1 rounded-full shadow-sm"><X className="w-3 h-3" /></button>
                            </div>
                        ) : (
                            <>
                                <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                                <span className="text-sm text-slate-600 font-medium">点击或拖拽文件上传</span>
                                <span className="text-xs text-slate-400 mt-1">支持 {schema.props.accept || "所有"} 格式文件</span>
                            </>
                        )}
                    </label>
                </div>
            );

        default:
            return null;
    }
};