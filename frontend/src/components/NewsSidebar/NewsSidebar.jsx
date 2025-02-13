import { useState } from 'react';
import { ChevronRight, ChevronDown, Newspaper, Bookmark } from 'lucide-react';
import NewsFeed from '../NewsFeed/NewsFeed';
import SavedArticles from '../SavedArticles/SavedArticles';

export default function NewsSidebar() {
  const [activeTab, setActiveTab] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  const tabs = [
    {
      id: 'news',
      title: 'Music News',
      icon: Newspaper,
      component: NewsFeed
    },
    {
      id: 'saved',
      title: 'Saved Articles',
      icon: Bookmark,
      component: SavedArticles
    }
  ];

  const toggleTab = (tabId) => {
    setActiveTab(activeTab === tabId ? null : tabId);
  };

  return (
    <div className={`fixed right-0 top-16 bottom-0 w-96 bg-white/95 shadow-lg transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="absolute left-0 top-4 -translate-x-full bg-white/95 p-2 rounded-l-lg shadow-lg hover:bg-gray-50 transition-colors"
        aria-label={isVisible ? "Hide sidebar" : "Show sidebar"}
      >
        <ChevronRight
          size={20}
          className={`text-gray-600 transform transition-transform duration-300 ${isVisible ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        {tabs.map(({ id, title, icon: Icon, component: Component }) => (
          <div key={id} className="border-b border-gray-100">
            <button
              onClick={() => toggleTab(id)}
              className="w-full px-4 py-3 flex items-center justify-between text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon size={18} className="text-emerald-600" />
                <span className="font-medium">{title}</span>
              </div>
              {activeTab === id ? (
                <ChevronDown size={18} className="text-gray-400" />
              ) : (
                <ChevronRight size={18} className="text-gray-400" />
              )}
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out bg-gray-50/50
                ${activeTab === id ? 'max-h-[calc(100vh-8rem)]' : 'max-h-0'}`}
            >
              <div className="p-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
                <Component />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
