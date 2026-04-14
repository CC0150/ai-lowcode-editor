# 🚀 AI Low-Code Form Engine (智能可视化表单引擎)

![React](https://img.shields.io/badge/React-19.x-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.x-blue?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8.x-purple?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwind-css)
![Zustand](https://img.shields.io/badge/Zustand-State_Management-yellow?style=flat-square)

> 一个基于 **JSON Schema 驱动** 的企业级低代码表单构建平台。支持可视化拖拽编排、动态逻辑联动（Show/Hide）、以及一键编译导出 React 源码。

## ✨ 项目亮点 (Core Features)

本项目脱离了简单的“UI拼接”，深入探索了低代码领域的核心架构，具备以下极具含金量的特性：

- 🧱 **所见即所得的可视化搭建 (Visual Builder)**
  - 基于 `@dnd-kit/core` 构建的高性能拖拽引擎，支持虚拟列表与平滑过渡动画。
  - 通过 `PointerSensor` 精准拦截并处理点击与拖拽的事件冲突。
- 📝 **基于 JSON Schema 的协议驱动 (Schema-Driven)**
  - 核心状态完全由 `ComponentSchema` 协议描述，实现视图层与数据层的完美解耦 (`View = f(State)`)。
  - 基于 Zustand 实现轻量级、无渲染抖动的全局配置树更新。
- 🧠 **表单联动规则沙箱 (Dynamic Logic Engine)**
  - 实现组件级的关联逻辑（如：当问题 A 选中“其他”时，动态渲染问题 B）。
  - 利用 React 受控模型配合底层状态机，实现复杂的表单级联渲染与数据收集。
- ⚡ **微型 AST 源码生成器 (Code Generation)**
  - 内置简易编译器，可将画布中的 JSON 配置结构，“降维编译”为无依赖的标准化 React 函数式组件源码（含完整的 `useState` 绑定与条件渲染逻辑）。

## 🛠️ 技术栈 (Tech Stack)

- **框架:** React 19 (Functional Components + Hooks)
- **构建工具:** Vite
- **类型系统:** TypeScript
- **状态管理:** Zustand (比 Redux 更轻量，完美契合 JSON 树更新)
- **样式方案:** Tailwind CSS v4 (CSS-first 方案)
- **拖拽引擎:** @dnd-kit (现代化的 React 拖拽解决方案)
- **图标库:** Lucide React

## 📂 核心目录结构

```text
├── src/
│   ├── components/
│   │   ├── FormPreview.tsx     # 核心：受控表单渲染引擎（双向绑定+逻辑解析）
│   │   ├── SetterPanel.tsx     # 属性配置面板（表单项控制、动态选项增删）
│   │   ├── SortableWrapper.tsx # dnd-kit 拖拽包装器
│   │   └── ExportModal.tsx     # AST 代码编译器与 JSON 导出模块
│   ├── store/
│   │   └── useEditorStore.ts   # Zustand 全局 JSON Schema 状态中心
│   ├── types/
│   │   └── editor.ts           # 核心领域模型（DSL 协议定义）
│   └── App.tsx                 # 主页面（三栏布局、DndContext 上下文）