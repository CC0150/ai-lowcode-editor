# AI低代码表单引擎

## 技术栈
- React 19 + TypeScript + Vite
- Zustand（状态管理）
- Tailwind CSS v4（样式）
- @dnd-kit（拖拽）

## 核心架构
- **状态层**：`src/store/useEditorStore.ts` - Zustand管理组件树，支持撤销/重做
- **类型层**：`src/types/editor.ts` - ComponentSchema定义所有组件结构
- **渲染层**：`src/components/FormPreview.tsx` - 表单渲染+验证+动态显隐
- **编辑层**：`src/components/SetterPanel.tsx` - 属性面板
- **生成层**：`src/components/ExportModal.tsx` - JSON/React代码导出

## 关键模式
- 所有UI由ComponentSchema描述：View = f(State)
- 组件支持visibleRule实现联动显隐
- 拖拽使用@dnd-kit，5px激活阈值防止误触
- 每次状态变更自动commit到历史栈实现撤销/重做

## 常用命令
| 命令 | 用途 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run lint` | 代码检查 |

## 开发注意事项
- 添加新组件类型需同步更新：types → store默认值 → 渲染逻辑 → 属性面板
- 使用 `crypto.randomUUID()` 生成组件ID
- 快捷键：Ctrl+Z撤销，Ctrl+Y/Shift+Ctrl+Z重做

## 语言偏好
请始终使用简体中文回复所有内容