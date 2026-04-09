import { useEditorStore } from './store/useEditorStore';
import { SetterPanel } from './components/SetterPanel';
import { Type, MousePointer2, Image as ImageIcon, Box } from 'lucide-react';
import { SortableWrapper } from './components/SortableWrapper';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export default function App() {
  const { components, addComponent, selectedId, selectComponent, reorderComponents } = useEditorStore();
// 配置拖拽传感器，要求鼠标移动 5 像素才触发拖拽，避免和“点击选中”冲突
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // 处理拖拽结束事件
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = components.findIndex((c) => c.id === active.id);
      const newIndex = components.findIndex((c) => c.id === over.id);
      reorderComponents(oldIndex, newIndex);
    }
  };
  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden font-sans">
      {/* 顶部导航 */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center px-6 justify-between shadow-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-brand flex items-center justify-center">
            <Box className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-bold text-lg text-gray-800">AI Low-Code</h1>
        </div>
        <button className="bg-brand text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-opacity-90 transition-all">
          导出 JSON
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* 左侧：物料组件库 */}
        <aside className="w-64 border-r border-gray-200 bg-white p-4 flex flex-col gap-4 overflow-y-auto">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">基础组件</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { type: 'text', icon: Type, label: '文字' },
              { type: 'button', icon: MousePointer2, label: '按钮' },
              { type: 'image', icon: ImageIcon, label: '图片' },
              { type: 'container', icon: Box, label: '容器' },
            ].map((item) => (
              <button
                key={item.type}
                onClick={() => addComponent(item.type as any)}
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-brand hover:text-brand hover:shadow-sm transition-all group bg-gray-50 hover:bg-white"
              >
                <item.icon className="w-6 h-6 mb-2 text-gray-500 group-hover:text-brand" />
                <span className="text-xs font-medium text-gray-600 group-hover:text-brand">{item.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* 中间：画布区域 */}
        <section 
          className="flex-1 bg-gray-100 p-8 overflow-auto flex items-start justify-center"
          onClick={() => selectComponent(null)}
        >
          <div 
            className="w-[375px] min-h-[667px] bg-white shadow-xl rounded-md relative overflow-hidden transition-all duration-300 ring-1 ring-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {components.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                从左侧点击添加组件
              </div>
            )}
            
            {/* 核心：拖拽上下文包裹 */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              {/* 排序上下文，提取组件的 ID 数组 */}
              <SortableContext
                items={components.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {components.map((comp) => (
                  <SortableWrapper
                    key={comp.id}
                    component={comp}
                    isSelected={selectedId === comp.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectComponent(comp.id);
                    }}
                  >
                    {/* 根据组件类型渲染具体内容 */}
                    {comp.type === 'text' && <div>{comp.props.text}</div>}
                    {comp.type === 'button' && (
                      <button className="bg-brand text-white px-4 py-2 rounded shadow-sm w-full">
                        {comp.props.text}
                      </button>
                    )}
                    {comp.type === 'image' && <div className="bg-gray-200 h-32 flex items-center justify-center text-gray-500 text-sm w-full">图片占位</div>}
                    {comp.type === 'container' && <div className="min-h-[100px] border border-dashed border-gray-300 p-2 w-full">容器占位</div>}
                  </SortableWrapper>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </section>

        {/* 右侧：属性配置面板 */}
        <aside className="w-80 border-l border-gray-200 bg-white shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 overflow-y-auto">
           <SetterPanel />
        </aside>
      </main>
    </div>
  );
}