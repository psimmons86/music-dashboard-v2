import { useState } from 'react';
import { ChevronUp, ChevronDown, GripHorizontal } from 'lucide-react';

export default function DashboardItem({ title, icon: Icon, children, className, headerActions }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`group relative bg-white/80 rounded-lg shadow-sm ${className}`} style={{ minHeight: isCollapsed ? '12px' : '32px' }}>
      {/* Floating label */}
      <div className="absolute -top-1 left-1.5 z-10 flex items-center gap-0.5 bg-white/95 px-1 rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        {Icon && <Icon size={8} className="text-emerald-600" />}
        <h2 className="font-sans text-[7px] font-medium text-gray-600 leading-none tracking-tight uppercase">{title}</h2>
      </div>
      
      {/* Collapse button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsCollapsed(!isCollapsed);
        }}
        className="absolute -top-1 right-1.5 z-10 p-0.5 bg-white/95 hover:bg-white rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors"
        aria-label={isCollapsed ? "Expand" : "Collapse"}
      >
        {isCollapsed ? (
          <ChevronDown size={8} className="text-gray-400" />
        ) : (
          <ChevronUp size={8} className="text-gray-400" />
        )}
      </button>
      
      {/* Drag handle */}
      <div className="absolute top-0 left-0 right-0 h-3 cursor-move flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <GripHorizontal size={10} className="text-gray-300" />
      </div>
      
      {/* Content */}
      <div 
        className={`pt-3 transition-all duration-150 ease-in-out ${
          isCollapsed ? 'h-0 opacity-0 overflow-hidden' : 'opacity-100'
        }`}
      >
        <div className="px-1.5 pb-1.5">
          {children}
        </div>
      </div>
    </div>
  );
}
