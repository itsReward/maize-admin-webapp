import React, { useContext } from 'react';
import { 
  Home, Users, TreePine, Sprout, Cloud, Brain, BarChart3, Settings
} from 'lucide-react';
import { AppContext } from '../../App';

const Sidebar = () => {
  const { currentPage, setCurrentPage } = useContext(AppContext);
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'farmers', label: 'Farmers', icon: TreePine },
    { id: 'planting', label: 'Planting Sessions', icon: Sprout },
    { id: 'weather', label: 'Weather Data', icon: Cloud },
    { id: 'models', label: 'ML Models', icon: Brain },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg">Maize Admin</span>
        </div>
      </div>
      
      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-gray-800 transition-colors ${
                currentPage === item.id ? 'bg-green-600 border-r-4 border-green-400' : ''
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
