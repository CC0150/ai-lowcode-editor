import { z } from "zod";
import { type ComponentSchema } from "../types/editor";

/**
 * 选项的 Zod Schema（支持递归，应对级联选择器）
 */
const optionItemSchema: z.ZodType<any> = z.lazy(() =>
    z.object({
        label: z.string().catch("未命名选项"),
        value: z.string().catch("undefined"),
        children: z.array(optionItemSchema).optional(),
    })
);

/**
 * 组件规范的 Zod Schema
 */
export const componentSchemaZod = z.object({
    id: z.string().optional(), // 流式加载中可能暂时没有 ID
    // 严格限制 type 只能是规定的这几种，AI 乱写的话自动 fallback 到 "input"
    type: z.enum([
        "input", "textarea", "radio", "select", "button",
        "date", "checkbox", "upload", "rate", "switch", "cascader"
    ]).catch("input"),
    label: z.string().catch("未命名组件"),
    required: z.boolean().catch(false),
    props: z.object({
        placeholder: z.string().optional(),
        options: z.array(optionItemSchema).optional(),
        buttonText: z.string().optional(),
        maxRate: z.number().optional(),
        accept: z.string().optional(),
        activeText: z.string().optional(),
        inactiveText: z.string().optional(),
    }).catch({}), // 如果 AI 传了乱七八糟的 props，直接清空为一个空对象
    visibleRule: z.object({
        sourceId: z.string(),
        operator: z.literal("==="),
        value: z.string()
    }).optional(),
    validation: z.object({
        regex: z.string(),
        message: z.string()
    }).optional()
});

/**
 * 校验并清洗 AI 生成的组件数组
 */
export const validateAndCleanComponents = (data: any): ComponentSchema[] => {
    if (!Array.isArray(data)) return [];

    return data.map(item => {
        // safeParse 不会抛出异常，而是返回带有 success 状态的对象
        const parsed = componentSchemaZod.safeParse(item);
        if (parsed.success) {
            return parsed.data as ComponentSchema;
        }
        // 如果单个组件错得太离谱（理论上因为加了 catch 不太会发生），控制台打印并丢弃
        console.warn("剔除不规范的 AI 组件:", parsed.error);
        return null;
    }).filter(Boolean) as ComponentSchema[]; // 过滤掉 null
};