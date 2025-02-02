
import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function DashboardItem({ title, icon: Icon, children, className, headerActions }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="drag-handle select-none">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {Icon && <Icon size={20} />}
            <h2 className="font-sans text-xl font-semibold text-gray-800">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {headerActions && (
              <div onClick={e => e.stopPropagation()} className="z-10">
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
              className="p-1 hover:bg-black/5 rounded-full z-10"
            >
              {isCollapsed ? (
                <ChevronDown size={20} className="text-gray-600" />
              ) : (
                <ChevronUp size={20} className="text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>
      <div 
        className={`flex-1 min-h-0 overflow-auto transition-all duration-300 ease-in-out
          ${isCollapsed ? 'max-h-0' : 'max-h-full'}`}
      >
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}