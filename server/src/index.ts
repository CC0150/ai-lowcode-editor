import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import type { Request, Response } from "express";
import crypto from 'crypto';

// 临时内存存储（后续可替换为 MySQL/Supabase）
const formStore = new Map<string, any>();

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 初始化 DeepSeek 客户端
const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL || "https://api.deepseek.com",
});

// 构建 System Prompt (把接口定义告诉大模型)
const SYSTEM_PROMPT = `
你是一个资深前端低代码引擎专家。
请根据用户的自然语言描述，生成符合下方 TypeScript 接口定义的 JSON 格式数据。

// 表单专用的组件类型 (已扩充高级组件)
type FormItemType = "input" | "textarea" | "radio" | "select" | "date" | "checkbox" | "upload" | "rate" | "switch" | "cascader";

// 选项接口（支持无限极嵌套，用于 Cascader）
interface OptionItem { 
  label: string; 
  value: string; 
  children?: OptionItem[]; 
}

interface VisibleRule { sourceId: string; operator: "==="; value: string; }
interface ValidationRule { regex: string; message: string; }

// 表单组件 Schema
export interface ComponentSchema {
  id: string;
  type: FormItemType;
  label: string;
  required: boolean;
  props: {
    placeholder?: string;
    options?: OptionItem[]; // 给 radio, select, checkbox, cascader 用的选项
    direction?: "horizontal" | "vertical"; // 单选框和复选框的排列方向

    maxRate?: number; // 评分组件的最大星数 (默认5)
    accept?: string; // 上传组件的文件类型限制 (如 image/*)
    activeText?: string; // 开关打开时的文字
    inactiveText?: string; // 开关关闭时的文字
  };
  visibleRule?: VisibleRule;
  validation?: ValidationRule;
}

请严格遵守上述接口类型。
必须输出一个 JSON 对象，包含：
1. "title": 字符串类型，根据表单用途生成的标题（如：员工入职登记表、产品反馈收集等）。
2. "components": 数组类型，包含生成的表单项。

例如：{ "title": "姓名收集", "components": [ ... ] }
不要输出任何解释性文字或 Markdown 标记。
`;

// 1. 发布表单（保存配置）
app.post("/api/forms", (req: Request, res: Response) => {
  try {
    const { title, components } = req.body;
    // 生成唯一短 ID，例如：f8a2b1c
    const formId = crypto.randomBytes(4).toString("hex");

    formStore.set(formId, { title, components, createdAt: new Date() });

    res.json({ success: true, data: { formId } });
  } catch (error) {
    res.status(500).json({ success: false, message: "发布失败" });
  }
});

// 2. 获取表单（用于 C 端渲染）
app.get("/api/forms/:formId", (req: Request, res: Response) => {
  const { formId } = req.params;
  const formData = formStore.get(formId as string);

  if (formData) {
    res.json({ success: true, data: formData });
  } else {
    res.status(404).json({ success: false, message: "表单不存在或已失效" });
  }
});

// 局部组件 AI 修改接口
app.post("/modify-component", async (req: Request, res: Response) => {
  const { component, prompt } = req.body;
  if (!component || !prompt) return res.status(400).json({ error: "参数缺失" });

  const MODIFY_PROMPT = `你是一个低代码前端专家。
现在有一个正在编辑的表单组件的 JSON 数据：
${JSON.stringify(component)}

用户的修改需求是："${prompt}"

请你根据需求，精准修改并更新这个 JSON 中的属性（例如 label, props.placeholder, props.options 等），不要修改它的 id。
如果用户要求修改选项(如改成四大名著、民族等)，请直接重写 props.options 数组。
请直接返回修改后的完整 JSON 对象，不要包含任何 markdown 或解释文字。`;

  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: MODIFY_PROMPT }],
      response_format: { type: "json_object" },
    });
    res.json({
      success: true,
      data: JSON.parse(completion?.choices?.[0]?.message?.content || "{}"),
    });
  } catch (error) {
    res.status(500).json({ error: "AI 修改失败" });
  }
});

// AI 智能正则校验接口
app.post("/generate-regex", async (req: Request, res: Response) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "参数缺失" });

  const REGEX_PROMPT = `你是一个正则表达式专家。
请根据用户的需求，生成对应的 JavaScript 正则表达式，以及校验失败时的中文提示语。
用户需求："${prompt}"
必须严格输出为一个 JSON 对象，包含 "regex" 和 "message" 两个字段。
例如：{"regex": "^[a-zA-Z0-9]+$", "message": "必须包含大小写字母和数字"}
注意：regex 字段的内容应该是一个合法的正则字符串，不需要前后的斜杠 /。
不要包含任何 markdown 或解释文字。`;

  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: REGEX_PROMPT }],
      response_format: { type: "json_object" },
    });
    res.json({
      success: true,
      data: JSON.parse(completion?.choices?.[0]?.message?.content || "{}"),
    });
  } catch (error) {
    res.status(500).json({ error: "AI 生成正则失败" });
  }
});

// AI 表单生成接口
app.post("/generate-form", async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ success: false, error: "请输入描述需求" });
  }

  // 1. 设置 Server-Sent Events (SSE) 必备的响应头
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    // 2. 开启大模型的 stream 模式
    const stream = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      stream: true,
    });

    // 3. 监听数据流，将其转换为标准的 SSE 格式推送给前端
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        // 必须以 data: 开头，\n\n 结尾
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // 4. 传输完成标识
    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.write(
      `data: ${JSON.stringify({ error: "大模型生成失败，请查看后端日志" })}\n\n`,
    );
    res.end();
  }
});

// AI 表单局部增删改 (Patch) 接口
app.post("/patch-form", async (req: Request, res: Response) => {
  const { prompt, currentComponents } = req.body;

  if (!prompt) return res.status(400).json({ error: "参数缺失" });

  const PATCH_PROMPT = `
你是一个低代码前端专家。
目前画布中已有的表单组件列表 (JSON) 如下：
${JSON.stringify(currentComponents)}

用户的修改需求是："${prompt}"

请你分析需求，生成一个对当前表单的修改补丁数组 (patches)。
支持的操作动作(action)包括：
1. 新增: { "action": "add", "targetId": "参考的组件id", "position": "before" 或 "after", "component": { 新组件的完整JSON } }
2. 更新: { "action": "update", "targetId": "要修改的组件id", "updates": { 需要更新的属性 } }
3. 删除: { "action": "remove", "targetId": "要删除的组件id" }

要求：
1. 必须输出一个 JSON 对象，包含 "patches" 数组。
2. targetId 必须是当前组件列表中存在的 id。如果是由于当前画布为空而新增，targetId 可省略。
3. 请不要包含任何 markdown，仅输出合法 JSON。
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: PATCH_PROMPT }],
      response_format: { type: "json_object" }, // 强制输出 JSON
    });

    res.json({
      success: true,
      data: JSON.parse(
        completion?.choices?.[0]?.message?.content || '{"patches":[]}',
      ),
    });
  } catch (error) {
    res.status(500).json({ error: "AI 生成补丁失败" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`后端服务已启动: http://localhost:${PORT}`);
});
