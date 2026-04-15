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

// 表单专用的组件类型
type FormItemType = "input" | "textarea" | "radio" | "select" | "button" | "date" | "checkbox";
interface OptionItem { label: string; value: string; }
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
    options?: OptionItem[]; 
    buttonText?: string; 
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

    try {
        const completion = await openai.chat.completions.create({
            model: "deepseek-chat", // DeepSeek V3 核心模型
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" }, // 强制返回 JSON 对象
        });

        const aiContent =
            completion.choices?.[0]?.message?.content || '{"components": []}';

        // 解析返回的 JSON
        const parsedData = JSON.parse(aiContent);

        res.json({ success: true, data: parsedData.components });
    } catch (error) {
        console.error("AI Generation Error:", error);
        res
            .status(500)
            .json({ success: false, error: "大模型生成失败，请查看后端控制台日志" });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`后端服务已启动: http://localhost:${PORT}`);
});
