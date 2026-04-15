import React from "react";
import { SetterPanel } from "./SetterPanel";

interface RightSidebarProps {
    isOpen: boolean;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ isOpen }) => {
    return (
        <aside className={`transition-all duration-300 ease-in-out border-l border-gray-200 bg-white shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 overflow-hidden ${isOpen ? "w-80 opacity-100" : "w-0 border-l-0 opacity-0"}`}>
            <div className="w-80 h-full overflow-y-auto custom-scrollbar">
                <SetterPanel />
            </div>
        </aside>
    );
};