import React, { useId, useState } from "react";
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
  DatePicker,
  Space,
} from "antd";
import dayjs from "dayjs";

interface FormControlProps {
  schema: ComponentSchema;
  value: any;
  hasError?: boolean;
  onChange: (val: any) => void;
}

/**
 * 表单控件组件
 */
export const FormControl: React.FC<FormControlProps> = ({
  schema,
  value,
  hasError,
  onChange,
}) => {
  const antStatus = hasError ? "error" : "";
  // 确保生成独一无二的DOM ID，解决流式生成过程中 schema.id 为空导致的文件无法点击问题
  const uniqueId = useId();
  // 记录是否正在拖拽文件经过当前区域
  const [isDragging, setIsDragging] = useState(false);

  // 防止流式加载时 props 为 undefined 导致崩溃
  const safeProps = schema.props || {};

  // 兼容性处理：AI 可能误把 options 生成为字符串数组 ["A", "B"] 而不是对象数组
  const normalizedOptions = Array.isArray(safeProps.options)
    ? safeProps.options.map((opt: any) =>
      typeof opt === "string" ? { label: opt, value: opt } : opt
    )
    : [];

  // 让弹出层挂载在当前 DOM 下，解决弹窗/侧边栏中下拉框被遮挡或滚动错位的问题
  const getPopupContainer = (triggerNode: HTMLElement) => triggerNode.parentNode as HTMLElement;

  switch (schema.type) {
    case "input":
      return (
        <Input
          placeholder={safeProps.placeholder}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          status={antStatus}
          className="w-full"
        />
      );

    case "textarea":
      return (
        <Input.TextArea
          placeholder={safeProps.placeholder}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          status={antStatus}
          autoSize={{ minRows: 3, maxRows: 6 }}
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
          getPopupContainer={getPopupContainer}
        />
      );

    case "select":
      return (
        <Select
          value={value || undefined}
          onChange={(val) => onChange(val)}
          options={normalizedOptions}
          placeholder="请选择..."
          status={antStatus}
          className="w-full"
          getPopupContainer={getPopupContainer}
        />
      );

    case "radio":
      return (
        <div className="mt-1">
          <Radio.Group
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            <Space direction={safeProps.direction === 'horizontal' ? 'horizontal' : 'vertical'}>
              {normalizedOptions.map((opt: any) => (
                <Radio key={opt.value} value={opt.value}>
                  {opt.label}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </div>
      );

    case "checkbox":
      return (
        <div className="mt-1">
          <Checkbox.Group
            value={value || []}
            onChange={(checkedValues) => onChange(checkedValues)}
          >
            <Space direction={safeProps.direction === 'horizontal' ? 'horizontal' : 'vertical'}>
              {normalizedOptions.map((opt: any) => (
                <Checkbox key={opt.value} value={opt.value}>
                  {opt.label}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </div>
      );

    case "rate":
      return (
        <div className="mt-1">
          <Rate
            value={value || 0}
            onChange={(val) => onChange(val)}
            count={safeProps.maxRate || 5}
          />
        </div>
      );

    case "switch":
      return (
        <div className="mt-1">
          <Switch
            checked={!!value}
            onChange={(checked) => onChange(checked)}
            checkedChildren={safeProps.activeText || "开启"}
            unCheckedChildren={safeProps.inactiveText || "关闭"}
          />
        </div>
      );

    case "cascader":
      return (
        <Cascader
          options={normalizedOptions as any}
          value={value || []}
          onChange={(val) => onChange(val)}
          placeholder="请选择级联项..."
          status={antStatus}
          className="w-full"
          getPopupContainer={getPopupContainer}
        />
      );

    case "upload":
      return (
        <div
          className="w-full mt-1 relative"
          onDragOver={(e) => {
            e.preventDefault(); // 必须阻止默认行为才能允许放置
            e.stopPropagation();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            // 获取拖拽进来的文件
            const file = e.dataTransfer.files?.[0];
            if (file) {
              onChange(file.name);
            }
          }}
        >
          <input
            type="file"
            id={`file_${uniqueId}`}
            className="hidden"
            accept={safeProps.accept}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onChange(file.name);
              }
              e.target.value = "";
            }}
          />
          <label
            htmlFor={`file_${uniqueId}`}
            className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${hasError
              ? "border-red-300 bg-red-50 hover:bg-red-100"
              : isDragging
                ? "border-brand bg-slate-100 shadow-sm scale-[1.02]" // 拖拽悬浮时的反馈效果
                : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-brand hover:shadow-sm"
              }`}
          >
            {value ? (
              <div className="flex items-center gap-2 text-brand">
                <FileText className="w-6 h-6" />
                <span className="text-sm font-medium">{value}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onChange("");
                  }}
                  className="ml-2 text-red-400 hover:text-red-600 bg-white p-1 rounded-full shadow-sm"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <UploadCloud className={`w-8 h-8 mb-2 transition-colors ${isDragging ? "text-brand" : "text-slate-400"}`} />
                <span className="text-sm text-slate-600 font-medium">
                  {isDragging ? "松开鼠标立即上传" : "点击或拖拽文件上传"}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  支持 {safeProps.accept || "所有"} 格式文件
                </span>
              </>
            )}
          </label>
        </div>
      );

    default:
      return null;
  }
};