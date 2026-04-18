import React from "react";
import { ChevronDown } from "lucide-react";
import { useUIStore } from "../store/useUIStore";

interface PanelSectionProps {
  id: string;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const PanelSection: React.FC<PanelSectionProps> = ({
  id,
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}) => {
  const { expandedPanels, togglePanel } = useUIStore();
  const isOpen = expandedPanels[id] ?? defaultOpen;

  return (
    <div className="border-b border-slate-100 last:border-0 bg-white">
      <button
        onClick={() => togglePanel(id, defaultOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 tracking-wide">
          <Icon className="w-4 h-4 text-brand/70" />
          {title}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 flex flex-col gap-4">{children}</div>
        </div>
      </div>
    </div>
  );
};
