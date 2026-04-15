import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

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
type FormItemType = "input" | "textarea" | "radio" | "select" | "button" | "date" | "checkbox" | "upload" | "rate" | "switch" | "cascader";

// 选项接口（支持无限极嵌套，用于 Cascader）
interface OptionItem { 
  label: string; 
  value: string; 
  children?: OptionItem[]; 
}

interface VisibleRule { sourceId: string; operator: "==="; value: string; }
interface ValidationRule { regex: string; message: string; }

// 表单组件 Schema
interface ComponentSchema {
  id: string; // 必须是唯一的英文变量名，如 'username', 'phone'
  type: FormItemType;
  label: string; 
  required: boolean; 
  props: {
    placeholder?: string;
    options?: OptionItem[]; // 给 radio, select, checkbox, cascader 用的选项
    buttonText?: string; // 给 button 用的文字
    maxRate?: number; // 评分组件的最大星数 (默认5)
    accept?: string;  // 上传组件的文件类型限制 (如 image/*)
    activeText?: string; // 开关打开时的文字
    inactiveText?: string; // 开关关闭时的文字
  };
  visibleRule?: VisibleRule;
  validation?: ValidationRule;
}

请严格遵守上述接口类型。
必须输出一个 JSON 对象，包含一个名为 "components" 的数组，数组中包含生成的表单项。
例如：{ "components": [ { "id": "name", "type": "input", "label": "姓名", "required": true, "props": { "placeholder": "请输入姓名" } } ] }
不要输出任何解释性文字或 Markdown 标记。
`;

app.post("/api/generate-form", async (req, res) => {
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`后端服务已启动: http://localhost:${PORT}`);
});
