import { useState } from 'react';
import { ChevronUp, ChevronDown, GripHorizontal } from 'lucide-react';

export default function DashboardItem({ title, icon: Icon, children, className, headerActions }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`group relative rounded-xl ${className}`} style={{ minHeight: isCollapsed ? '12px' : '32px' }}>
      {/* Floating label */}
      <div className="absolute -top-3 left-4 z-10 flex items-center gap-1.5 bg-white/95 px-3 py-1 rounded-md shadow-sm">
        {Icon && <Icon size={14} className="text-emerald-600" />}
        <h2 className="font-sans text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent leading-none">{title}</h2>
      </div>
      
      {/* Collapse button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsCollapsed(!isCollapsed);
        }}
        className="absolute -top-3 right-4 z-10 p-1 bg-white/95 hover:bg-white rounded-md shadow-sm transition-colors"
        aria-label={isCollapsed ? "Expand" : "Collapse"}
      >
        {isCollapsed ? (
          <ChevronDown size={14} className="text-gray-400" />
        ) : (
          <ChevronUp size={14} className="text-gray-400" />
        )}
      </button>
      
      
      {/* Content */}
      <div 
        className={`pt-4 transition-all duration-150 ease-in-out ${
          isCollapsed ? 'h-0 opacity-0 overflow-hidden' : 'opacity-100'
        }`}
      >
        <div className="px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}
