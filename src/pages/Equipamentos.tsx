import React, { useEffect, useState } from 'react';
import { Plus, Search, QrCode, MoreVertical, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface Equipamento {
  id: string;
  nome: string;
  numero_serie: string;
  categoria: string;
  status: 'disponivel' | 'em_cautela' | 'manutencao';
  data_proxima_calibracao: string | null;
}

const Equipamentos = () => {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [nome, setNome] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [categoria, setCategoria] = useState('');
  const [status, setStatus] = useState<'disponivel' | 'em_cautela' | 'manutencao'>('disponivel');

  useEffect(() => {
    fetchEquipamentos();
  }, []);

  const fetchEquipamentos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('equipamentos').select('*').order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setEquipamentos(data);
    } catch (err) {
      console.error("Erro ao buscar equipamentos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEquipamento = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const { error } = await supabase.from('equipamentos').insert([
        { 
          nome, 
          numero_serie: numeroSerie, 
          categoria, 
          status,
          data_proxima_calibracao: null // Para simplificar, deixamos null inicialmente
        }
      ]);

      if (error) throw error;
      
      // Limpar form e fechar modal
      setNome('');
      setNumeroSerie('');
      setCategoria('');
      setStatus('disponivel');
      setIsModalOpen(false);
      
      // Atualizar lista
      fetchEquipamentos();
    } catch (err: any) {
      console.error("Erro ao criar equipamento:", err);
      alert("Ocorreu um erro: " + (err.message || JSON.stringify(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disponivel': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Disponível</span>;
      case 'em_cautela': return <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">Em Cautela</span>;
      case 'manutencao': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Manutenção</span>;
      default: return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Equipamentos</h2>
          <p className="text-slate-500 mt-1">Gerencie os ativos da unidade de saúde</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={20} />
          <span>Novo Equipamento</span>
        </button>
      </header>

      {/* Tabela e Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar equipamento..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">Nome</th>
                <th className="p-4 font-medium">Nº Série</th>
                <th className="p-4 font-medium">Categoria</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Próx. Calibração</th>
                <th className="p-4 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Carregando equipamentos...
                  </td>
                </tr>
              ) : equipamentos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Nenhum equipamento cadastrado. Crie um novo para visualizar aqui!
                  </td>
                </tr>
              ) : (
                equipamentos.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 font-medium text-slate-800">{item.nome}</td>
                    <td className="p-4 text-slate-500">{item.numero_serie}</td>
                    <td className="p-4 text-slate-500">{item.categoria}</td>
                    <td className="p-4">{getStatusBadge(item.status)}</td>
                    <td className="p-4 text-slate-500">
                      {item.data_proxima_calibracao 
                        ? new Date(item.data_proxima_calibracao).toLocaleDateString() 
                        : '-'}
                    </td>
                    <td className="p-4 flex items-center justify-center space-x-3 text-slate-400">
                      <button className="hover:text-teal-600 transition-colors cursor-pointer" title="Gerar QR Code">
                        <QrCode size={18} />
                      </button>
                      <button className="hover:text-slate-700 transition-colors cursor-pointer" title="Mais Opções">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Novo Equipamento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Cadastrar Equipamento</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateEquipamento} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Equipamento</label>
                <input 
                  type="text" 
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Ex: Bomba de Infusão"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Número de Série</label>
                <input 
                  type="text" 
                  required
                  value={numeroSerie}
                  onChange={(e) => setNumeroSerie(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Ex: INF-00129"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <input 
                  type="text" 
                  required
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Ex: Suporte de Vida"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status Inicial</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                >
                  <option value="disponivel">Disponível</option>
                  <option value="em_cautela">Em Cautela (Em uso)</option>
                  <option value="manutencao">Em Manutenção</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Equipamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipamentos;
