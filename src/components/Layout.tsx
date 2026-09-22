import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, ClipboardList, Wrench } from 'lucide-react';

const Layout = () => {
  const menus = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Ativos/Equipamentos', path: '/equipamentos', icon: <Stethoscope size={20} /> },
    { name: 'Cautelas', path: '/cautelas', icon: <ClipboardList size={20} /> },
    { name: 'Manutenções', path: '/manutencoes', icon: <Wrench size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold">
            E
          </div>
          <h1 className="text-xl font-bold text-slate-800">Health EAM</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menus.map((menu) => (
            <NavLink
              key={menu.name}
              to={menu.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-600 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {menu.icon}
              <span>{menu.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
