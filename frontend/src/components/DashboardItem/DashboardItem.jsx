import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function DashboardItem({ title, icon: Icon, children, className, headerActions }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`flex flex-col h-full bg-white/80 rounded-lg shadow-sm ${className}`}>
      <div className="drag-handle select-none flex-shrink-0 p-3 bg-white/90 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {Icon && <Icon size={20} className="text-emerald-600" />}
            <h2 className="font-sans text-lg font-medium text-gray-800">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {headerActions && (
              <div 
                onClick={e => e.stopPropagation()} 
                className="z-10 mr-2"
              >
                {headerActions}
              </div>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsCollapsed(!isCollapsed);
              }}
              className="p-1 hover:bg-black/5 rounded-full z-10 transition-colors"
              aria-label={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? (
                <ChevronDown size={18} className="text-gray-500" />
              ) : (
                <ChevronUp size={18} className="text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </div>
      <div 
        className={`flex-1 min-h-0 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'}`}
      >
        <div className="h-full overflow-y-auto">
          <div className="p-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
