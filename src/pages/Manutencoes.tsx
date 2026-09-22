import React, { useEffect, useState } from 'react';
import { Plus, Search, CheckCircle, AlertTriangle, Wrench } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface Equipamento {
  id: string;
  nome: string;
  numero_serie: string;
}

interface Manutencao {
  id: string;
  equipamento_id: string;
  descricao: string;
  tipo: 'preventiva' | 'corretiva';
  data_abertura: string;
  status: 'aberta' | 'concluida';
  equipamentos: Equipamento; // JOIN
}

const Manutencoes = () => {
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<'preventiva' | 'corretiva'>('preventiva');

  useEffect(() => {
    fetchManutencoes();
    fetchEquipamentos();
  }, []);

  const fetchManutencoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('manutencoes')
        .select(`
          *,
          equipamentos (
            id,
            nome,
            numero_serie
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (data) setManutencoes(data as any);
    } catch (err) {
      console.error("Erro ao buscar manutenções:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipamentos = async () => {
    try {
      // Buscar todos os equipamentos que não estão em manutenção
      const { data, error } = await supabase
        .from('equipamentos')
        .select('id, nome, numero_serie')
        .neq('status', 'manutencao')
        .order('nome');
        
      if (error) throw error;
      if (data) setEquipamentos(data);
    } catch (err) {
      console.error("Erro ao buscar equipamentos:", err);
    }
  };

  const handleCreateManutencao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipamentoSelecionado) return alert("Selecione um equipamento");

    try {
      setIsSubmitting(true);
      
      // 1. Criar a Manutenção
      const { error: errorManutencao } = await supabase.from('manutencoes').insert([
        { 
          equipamento_id: equipamentoSelecionado,
          descricao,
          tipo,
          status: 'aberta'
        }
      ]);

      if (errorManutencao) throw errorManutencao;

      // 2. Atualizar o status do equipamento para "manutencao"
      const { error: errorEquipamento } = await supabase
        .from('equipamentos')
        .update({ status: 'manutencao' })
        .eq('id', equipamentoSelecionado);

      if (errorEquipamento) throw errorEquipamento;
      
      // Sucesso
      setEquipamentoSelecionado('');
      setDescricao('');
      setTipo('preventiva');
      setIsModalOpen(false);
      
      fetchManutencoes();
      fetchEquipamentos();
    } catch (err: any) {
      console.error("Erro ao abrir manutenção:", err);
      alert("Erro ao registrar manutenção: " + (err.message || JSON.stringify(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConcluir = async (manutencaoId: string, equipamentoId: string) => {
    if (!window.confirm("Deseja marcar esta manutenção como concluída?")) return;

    try {
      // 1. Atualizar status da manutenção
      const { error: errorManutencao } = await supabase
        .from('manutencoes')
        .update({ status: 'concluida' })
        .eq('id', manutencaoId);
      
      if (errorManutencao) throw errorManutencao;

      // 2. Atualizar status do equipamento de volta para disponível
      const { error: errorEquipamento } = await supabase
        .from('equipamentos')
        .update({ status: 'disponivel' })
        .eq('id', equipamentoId);

      if (errorEquipamento) throw errorEquipamento;

      fetchManutencoes();
      fetchEquipamentos();
    } catch (err: any) {
      alert("Erro ao concluir: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Manutenções</h2>
          <p className="text-slate-500 mt-1">Histórico e ordens de serviço (Preventivas e Corretivas)</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={20} />
          <span>Nova Manutenção</span>
        </button>
      </header>

      {/* Lista */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por descrição..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">Equipamento</th>
                <th className="p-4 font-medium">Descrição do Problema</th>
                <th className="p-4 font-medium">Tipo</th>
                <th className="p-4 font-medium">Abertura</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Carregando manutenções...
                  </td>
                </tr>
              ) : manutencoes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Nenhuma manutenção registrada.
                  </td>
                </tr>
              ) : (
                manutencoes.map((manutencao) => (
                  <tr key={manutencao.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{manutencao.equipamentos?.nome || 'Excluído'}</div>
                      <div className="text-xs text-slate-400">SN: {manutencao.equipamentos?.numero_serie}</div>
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs truncate" title={manutencao.descricao}>
                      {manutencao.descricao}
                    </td>
                    <td className="p-4">
                      {manutencao.tipo === 'preventiva' 
                        ? <span className="text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded">Preventiva</span>
                        : <span className="text-rose-600 font-medium bg-rose-50 px-2 py-1 rounded">Corretiva</span>
                      }
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(manutencao.data_abertura).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {manutencao.status === 'aberta' 
                        ? <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            <AlertTriangle size={14} /> <span>Aberta</span>
                          </span>
                        : <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <CheckCircle size={14} /> <span>Concluída</span>
                          </span>
                      }
                    </td>
                    <td className="p-4 text-center">
                      {manutencao.status === 'aberta' && (
                        <button 
                          onClick={() => handleConcluir(manutencao.id, manutencao.equipamento_id)}
                          className="text-teal-600 hover:text-teal-800 font-medium text-sm cursor-pointer"
                        >
                          Resolver
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Manutenção */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
                <Wrench size={20} className="text-slate-400" />
                <span>Abrir Ordem de Serviço</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateManutencao} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Equipamento</label>
                <select 
                  required
                  value={equipamentoSelecionado}
                  onChange={(e) => setEquipamentoSelecionado(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="" disabled>-- Selecione um equipamento --</option>
                  {equipamentos.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.nome} (SN: {eq.numero_serie})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Manutenção</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="tipo" 
                      value="preventiva" 
                      checked={tipo === 'preventiva'}
                      onChange={() => setTipo('preventiva')}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-slate-700">Preventiva</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="tipo" 
                      value="corretiva" 
                      checked={tipo === 'corretiva'}
                      onChange={() => setTipo('corretiva')}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-slate-700">Corretiva</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição do Problema / Serviço</label>
                <textarea 
                  required
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Descreva detalhadamente o motivo da manutenção..."
                />
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
                  disabled={isSubmitting || !equipamentoSelecionado}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Abrindo OS...' : 'Abrir Manutenção'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Manutencoes;
