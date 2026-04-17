import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  id: string;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

export const SortableWrapper: React.FC<Props> = ({ id, isSelected, onClick, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`relative p-4 mb-3 bg-white border rounded-lg cursor-move transition-colors group ${
        isSelected 
          ? 'border-brand ring-1 ring-brand shadow-sm' 
          : 'border-transparent hover:border-dashed hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-l-lg" />
      )}
      {children}
    </div>
  );
};