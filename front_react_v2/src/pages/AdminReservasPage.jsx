import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function AdminReservasPage() {
  const [stats, setStats] = useState({});
  const [reservas, setReservas] = useState([]);
  const [busca, setBusca] = useState('');
  const [historico, setHistorico] = useState(false);
  const toast = useToast();

  function formatarData(dateStr) {
    if (!dateStr) return '-';
    return dateStr.split('T')[0].split('-').reverse().join('/');
  }

  function carregar() {
    // Primeiro carrega as reservas/empréstimos: essa consulta também expira
    // automaticamente reservas cujo prazo de retirada terminou. Depois disso,
    // as estatísticas refletem o estado atualizado do acervo.
    const chamada = historico ? api.getHistoricoEmprestimos() : api.getEmprestimos();
    chamada.then(lista => {
      setReservas([...lista].sort((a, b) => (a.nomeAluno || '').localeCompare(b.nomeAluno || '')));
    }).catch(() => {});
    chamada.then(() => api.getStats()).then(setStats).catch(() => {});
  }

  useEffect(() => { carregar(); }, [historico]);

  async function confirmarEntrega(id, titulo, aluno) {
    const resp = await api.confirmarEntrega(id);
    const texto = await resp.text().catch(() => '');
    if (resp.ok) {
      toast(`✅ Livro '${titulo}' entregue para ${aluno}! Prazo de devolução iniciado.`);
      carregar();
    } else {
      toast(`⚠️ ${texto || 'Erro ao confirmar retirada.'}`);
    }
  }

  async function confirmarDevolucao(id, titulo) {
    const resp = await api.confirmarDevolucao(id);
    const texto = await resp.text().catch(() => '');
    if (resp.ok) {
      toast(`✅ '${titulo}' devolvido e disponível novamente!`);
      carregar();
    } else {
      toast(`⚠️ ${texto || 'Erro ao confirmar devolução.'}`);
    }
  }

  const filtradas = reservas.filter(r =>
    (r.nomeAluno || '').toLowerCase().includes(busca.toLowerCase()) ||
    (r.tituloLivro || '').toLowerCase().includes(busca.toLowerCase()) ||
    (r.poloRetirada || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      <div className="dashboard-grid">
        <div className="dash-card">
          <span className="dash-icon">📚</span>
          <div><h3>{stats.totalLivros ?? '...'}</h3><p>Total no Acervo</p></div>
        </div>
        <div className="dash-card">
          <span className="dash-icon">✅</span>
          <div><h3>{stats.totalDisponiveis ?? '...'}</h3><p>Disponíveis Agora</p></div>
        </div>
        <div className="dash-card">
          <span className="dash-icon">👥</span>
          <div><h3>{stats.totalAlunos ?? '...'}</h3><p>Alunos na Base</p></div>
        </div>
        <div className="dash-card">
          <span className="dash-icon">📌</span>
          <div><h3>{stats.totalEmprestimos ?? '...'}</h3><p>Reservas e Empréstimos Ativos</p></div>
        </div>
      </div>

      <div className="tabela-container">
        <div className="tabela-header">
          <h2>{historico ? 'Histórico de Empréstimos' : 'Gestão de Reservas e Empréstimos'}</h2>
          <button className="btn-cancelar" onClick={() => setHistorico(h => !h)}>
            {historico ? '← Voltar às Reservas' : '📚 Ver Histórico'}
          </button>
          <input className="input-busca" placeholder="🔍 Filtrar por aluno, livro ou polo..." value={busca} onChange={e => setBusca(e.target.value)} />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Estudante</th>
                <th>Livro</th>
                <th>Polo</th>
                <th>Reserva</th>
                <th>Retirada</th>
                <th>Devolução prevista</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 && (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Nenhum registro encontrado.</td></tr>
              )}
              {filtradas.map(r => {
                const hoje = new Date();
                const limiteReserva = r.dataLimiteReserva ? new Date(`${r.dataLimiteReserva}T23:59:59`) : null;
                const limiteDevolucao = r.dataDevolucao ? new Date(`${r.dataDevolucao}T23:59:59`) : null;
                const reservaVencida = r.status === 'RESERVADO' && limiteReserva && hoje > limiteReserva;
                const emprestimoAtrasado = r.status === 'RETIRADO' && limiteDevolucao && hoje > limiteDevolucao;

                return (
                  <tr key={r.id}>
                    <td><strong>{r.nomeAluno}</strong></td>
                    <td>{r.tituloLivro}</td>
                    <td><small>📍 {r.poloRetirada || 'Não informado'}</small></td>
                    <td>{formatarData(r.dataReserva)}{r.status === 'RESERVADO' && <small style={{ display: 'block', color: '#64748b' }}>até {formatarData(r.dataLimiteReserva)}</small>}</td>
                    <td>{formatarData(r.dataRetirada)}</td>
                    <td>{formatarData(r.dataDevolucao)}</td>
                    <td>
                      {historico
                        ? (r.status === 'DEVOLVIDO'
                          ? <span className="status status-verde">🟢 Devolvido em {formatarData(r.dataDevolucaoReal)}</span>
                          : r.status === 'EXPIRADO'
                            ? <span className="status status-vermelho">🟠 Reserva expirada em {formatarData(r.dataDevolucaoReal)}</span>
                            : <span className="status status-vermelho">🔴 Cancelado</span>)
                        : (r.status === 'RETIRADO'
                          ? <span className={`status ${emprestimoAtrasado ? 'status-vermelho' : 'status-azul'}`}>{emprestimoAtrasado ? '🔴 Em atraso' : '🔵 Retirado'}</span>
                          : <span className={`status ${reservaVencida ? 'status-vermelho' : 'status-verde'}`}>{reservaVencida ? '🔴 Reserva vencida' : '🟢 Reservado'}</span>)}
                    </td>
                    <td>
                      {!historico && (r.status === 'RETIRADO'
                        ? <button className="btn-icone btn-devolver" onClick={() => confirmarDevolucao(r.id, r.tituloLivro)}>↩️ Devolvido</button>
                        : r.status === 'RESERVADO'
                          ? <button className="btn-icone btn-entregar" onClick={() => confirmarEntrega(r.id, r.tituloLivro, r.nomeAluno)}>✅ Entregar</button>
                          : null
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
