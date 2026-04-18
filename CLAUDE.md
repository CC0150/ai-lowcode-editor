# AI低代码表单引擎 (AI Low-Code Form Engine)

## 🚀 技术栈
- **前端核心**: React 19 + TypeScript + Vite
- **状态管理**: Zustand + Immer (支持 JSON Patch 差异追踪与撤销/重做)
- **样式系统**: Tailwind CSS v4
- **拖拽引擎**: @dnd-kit (5px 激活阈值，防止点击与拖拽冲突)
- **后端服务**: Node.js + Express + OpenAI SDK (集成 DeepSeek 模型)

## 🏗️ 核心架构
- **数据协议**: `src/types/editor.ts` 定义 `ComponentSchema` (DSL)，遵循 `View = f(State)` 模式
- **状态中心**: `src/store/useEditorStore.ts`。通过 `produceWithPatches` 记录正向/反向补丁，实现轻量化历史记录
- **渲染层**: `src/components/FormPreview.tsx`。负责受控双向绑定、动态显隐规则 (`visibleRule`) 及正则校验
- **属性编辑**: `src/components/SetterPanel.tsx`。提供组件属性、选项、校验规则的配置界面

## 🤖 AI 增强接口
- **全量生成** (`/api/generate-form`): 基于 SSE 流式协议生成符合 Schema 的完整表单
- **局部补丁** (`/api/patch-form`): 分析需求并返回 `add/update/remove` 指令数组，由前端 `applyAIPatches` 执行
- **精准修改** (`/api/modify-component`): 针对选中组件的属性进行定向 AI 调整
- **正则生成** (`/api/generate-regex`): 根据自然语言描述生成 JavaScript 正则表达式及提示语

## 📦 组件物料库 (FormItemType)
- **基础组件**: `input`, `textarea`, `radio`, `select`, `checkbox`, `switch`
- **高级组件**: `date` (日期), `button` (提交), `upload` (文件), `rate` (评分), `cascader` (级联选择)

## 🛠️ 常用开发命令
| 命令 | 用途 |
|------|------|
| `npm run dev` | 启动前端 Vite 开发服务器 |
| `npm run server` | 启动 Node.js AI 后端服务 (默认端口 3001) |
| `npm run build` | 生产环境构建 |
| `npm run lint` | ESLint 代码检查 |

## ⚠️ 开发注意事项
- **唯一标识**: 新增组件必须使用 `crypto.randomUUID()`
- **状态修改**: 所有对 `components` 的修改必须包裹在 `applyChange` 中，以确保历史栈同步
- **AI 接口调用**: 前端调用后端接口必须使用 `import.meta.env.VITE_API_BASE_URL` 读取环境变量，严禁硬编码 `http://localhost:3001`。
- **环境配置**: 
  - 前端：在 `client/.env` 中配置 `VITE_API_BASE_URL`
  - 后端：在 `server/.env` 中配置 `AI_API_KEY` 和 `AI_BASE_URL`

## 🌐 语言偏好
- 始终使用 **简体中文** 回复所有内容