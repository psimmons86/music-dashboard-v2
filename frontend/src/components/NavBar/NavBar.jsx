import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Music, Disc, Newspaper, User, LogOut, BarChart2 } from 'lucide-react';

export default function NavBar({ user, setUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Blog', href: '/blog' },
    { name: 'Vinyl Vault', href: '/vinyl', icon: <Disc className="w-4 h-4" /> },
  ];

  const getIcon = (name) => {
    switch (name) {
      case 'Home':
        return <Music className="w-4 h-4" />;
      case 'Dashboard':
        return <BarChart2 className="w-4 h-4" />;
      case 'Blog':
        return <Newspaper className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <nav className="bg-gradient-to-r from-emerald-50 via-white to-sky-50 shadow-sm border-b border-emerald-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-sm">
                  <Music className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Melodex
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {links.map(link => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-500 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-md transition-colors"
                >
                  {link.icon || getIcon(link.name)}
                  <span className="ml-2">{link.name}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center px-2 py-1 text-sm font-medium text-gray-500 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-md transition-colors"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-2 py-1 text-sm font-medium text-gray-500 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-md transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-sm transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {links.map(link => (
              <Link
                key={link.name}
                to={link.href}
                className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  {link.icon || getIcon(link.name)}
                  <span className="ml-2">{link.name}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <div className="space-y-1">
                <Link
                  to="/profile"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </div>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  to="/login"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
