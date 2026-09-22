import React from 'react';
import { Activity, AlertTriangle, UserCheck } from 'lucide-react';

const Dashboard = () => {
  const indicators = [
    { title: 'Equipamentos Ativos', value: '142', icon: <Activity className="text-teal-500" size={24} />, bg: 'bg-teal-50' },
    { title: 'Calibrações Atrasadas', value: '18', icon: <AlertTriangle className="text-amber-500" size={24} />, bg: 'bg-amber-50' },
    { title: 'Itens em Cautela', value: '35', icon: <UserCheck className="text-indigo-500" size={24} />, bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500 mt-1">Visão geral do inventário e manutenções</p>
      </header>

      {/* Cards Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {indicators.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-full ${card.bg}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{card.title}</p>
              <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos ou listagens recentes viriam aqui */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-64 flex items-center justify-center">
        <p className="text-slate-400">Espaço para Gráficos de Ocupação/Disponibilidade</p>
      </div>
    </div>
  );
};

export default Dashboard;
