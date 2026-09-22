import React, { useEffect, useState } from 'react';
import { Plus, Search, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface Equipamento {
  id: string;
  nome: string;
  numero_serie: string;
}

interface Cautela {
  id: string;
  equipamento_id: string;
  funcionario_responsavel: string;
  data_retirada: string;
  data_devolucao_prevista: string | null;
  status: 'ativa' | 'devolvida';
  equipamentos: Equipamento; // JOIN
}

const Cautelas = () => {
  const [cautelas, setCautelas] = useState<Cautela[]>([]);
  const [equipamentosDisponiveis, setEquipamentosDisponiveis] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState('');
  const [funcionario, setFuncionario] = useState('');
  const [dataPrevista, setDataPrevista] = useState('');

  useEffect(() => {
    fetchCautelas();
    fetchEquipamentosDisponiveis();
  }, []);

  const fetchCautelas = async () => {
    try {
      setLoading(true);
      // Busca cautelas fazendo JOIN com a tabela equipamentos
      const { data, error } = await supabase
        .from('cautelas')
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
      if (data) setCautelas(data as any);
    } catch (err) {
      console.error("Erro ao buscar cautelas:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipamentosDisponiveis = async () => {
    try {
      const { data, error } = await supabase
        .from('equipamentos')
        .select('id, nome, numero_serie')
        .eq('status', 'disponivel')
        .order('nome');
        
      if (error) throw error;
      if (data) setEquipamentosDisponiveis(data);
    } catch (err) {
      console.error("Erro ao buscar equipamentos:", err);
    }
  };

  const handleCreateCautela = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipamentoSelecionado) return alert("Selecione um equipamento");

    try {
      setIsSubmitting(true);
      
      // 1. Criar a Cautela
      const { error: errorCautela } = await supabase.from('cautelas').insert([
        { 
          equipamento_id: equipamentoSelecionado,
          funcionario_responsavel: funcionario,
          data_devolucao_prevista: dataPrevista ? new Date(dataPrevista).toISOString() : null,
          status: 'ativa'
        }
      ]);

      if (errorCautela) throw errorCautela;

      // 2. Atualizar o status do equipamento para "em_cautela"
      const { error: errorEquipamento } = await supabase
        .from('equipamentos')
        .update({ status: 'em_cautela' })
        .eq('id', equipamentoSelecionado);

      if (errorEquipamento) throw errorEquipamento;
      
      // Sucesso!
      setEquipamentoSelecionado('');
      setFuncionario('');
      setDataPrevista('');
      setIsModalOpen(false);
      
      fetchCautelas();
      fetchEquipamentosDisponiveis();
    } catch (err: any) {
      console.error("Erro ao criar cautela:", err);
      alert("Erro ao registrar cautela: " + (err.message || JSON.stringify(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDevolucao = async (cautelaId: string, equipamentoId: string) => {
    if (!window.confirm("Confirmar a devolução deste equipamento?")) return;

    try {
      // 1. Atualizar status da cautela
      const { error: errorCautela } = await supabase
        .from('cautelas')
        .update({ status: 'devolvida' })
        .eq('id', cautelaId);
      
      if (errorCautela) throw errorCautela;

      // 2. Atualizar status do equipamento de volta para disponível
      const { error: errorEquipamento } = await supabase
        .from('equipamentos')
        .update({ status: 'disponivel' })
        .eq('id', equipamentoId);

      if (errorEquipamento) throw errorEquipamento;

      fetchCautelas();
      fetchEquipamentosDisponiveis();
    } catch (err: any) {
      alert("Erro na devolução: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Cautelas</h2>
          <p className="text-slate-500 mt-1">Controle de empréstimos e retiradas de equipamentos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={20} />
          <span>Nova Cautela</span>
        </button>
      </header>

      {/* Lista de Cautelas */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar responsável ou equipamento..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">Equipamento</th>
                <th className="p-4 font-medium">Responsável</th>
                <th className="p-4 font-medium">Data de Retirada</th>
                <th className="p-4 font-medium">Devolução Prevista</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Carregando cautelas...
                  </td>
                </tr>
              ) : cautelas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Nenhuma cautela registrada no sistema.
                  </td>
                </tr>
              ) : (
                cautelas.map((cautela) => (
                  <tr key={cautela.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{cautela.equipamentos?.nome || 'Equipamento Excluído'}</div>
                      <div className="text-xs text-slate-400">SN: {cautela.equipamentos?.numero_serie}</div>
                    </td>
                    <td className="p-4 font-medium text-slate-600">{cautela.funcionario_responsavel}</td>
                    <td className="p-4 text-slate-500">
                      {new Date(cautela.data_retirada).toLocaleString()}
                    </td>
                    <td className="p-4 text-slate-500">
                      {cautela.data_devolucao_prevista 
                        ? new Date(cautela.data_devolucao_prevista).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="p-4">
                      {cautela.status === 'ativa' 
                        ? <span className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                            <Clock size={14} /> <span>Ativa</span>
                          </span>
                        : <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <CheckCircle size={14} /> <span>Devolvida</span>
                          </span>
                      }
                    </td>
                    <td className="p-4 text-center">
                      {cautela.status === 'ativa' && (
                        <button 
                          onClick={() => handleDevolucao(cautela.id, cautela.equipamento_id)}
                          className="text-teal-600 hover:text-teal-800 font-medium text-sm cursor-pointer"
                        >
                          Dar Baixa
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

      {/* Modal Nova Cautela */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Registrar Cautela</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateCautela} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Selecione o Equipamento</label>
                <select 
                  required
                  value={equipamentoSelecionado}
                  onChange={(e) => setEquipamentoSelecionado(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="" disabled>-- Escolha um item disponível --</option>
                  {equipamentosDisponiveis.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.nome} (SN: {eq.numero_serie})</option>
                  ))}
                </select>
                {equipamentosDisponiveis.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">Nenhum equipamento disponível encontrado.</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Funcionário Responsável</label>
                <input 
                  type="text" 
                  required
                  value={funcionario}
                  onChange={(e) => setFuncionario(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Nome completo do colaborador"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Devolução Prevista <span className="text-slate-400 font-normal">(Opcional)</span></label>
                <input 
                  type="date" 
                  value={dataPrevista}
                  onChange={(e) => setDataPrevista(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Registrando...' : 'Confirmar Cautela'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cautelas;
