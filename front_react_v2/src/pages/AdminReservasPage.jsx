import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function AdminReservasPage() {
  const [stats, setStats] = useState({});
  const [reservas, setReservas] = useState([]);
  const [busca, setBusca] = useState('');
  const toast = useToast();

  function carregar() {
    api.getStats().then(setStats).catch(() => {});
    api.getEmprestimos().then(lista => {
      setReservas([...lista].sort((a, b) => (a.nomeAluno || '').localeCompare(b.nomeAluno || '')));
    }).catch(() => {});
  }

  useEffect(() => { carregar(); }, []);

  async function confirmarEntrega(id, titulo, aluno) {
    const resp = await api.confirmarEntrega(id);
    if (resp.ok) { toast(`✅ Livro '${titulo}' entregue para ${aluno}!`); carregar(); }
    else toast('⚠️ Erro ao confirmar entrega.');
  }

  async function confirmarDevolucao(id, titulo) {
    const resp = await api.confirmarDevolucao(id);
    if (resp.ok) { toast(`✅ '${titulo}' devolvido e disponível novamente!`); carregar(); }
    else toast('⚠️ Erro ao confirmar devolução.');
  }

  const filtradas = reservas.filter(r =>
    (r.nomeAluno || '').toLowerCase().includes(busca.toLowerCase()) ||
    (r.tituloLivro || '').toLowerCase().includes(busca.toLowerCase()) ||
    (r.poloRetirada || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      {/* DASHBOARD */}
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
          <div><h3>{stats.totalEmprestimos ?? '...'}</h3><p>Reservas Ativas</p></div>
        </div>
      </div>

      <div className="tabela-container">
        <div className="tabela-header">
          <h2>Gestão de Reservas</h2>
          <input className="input-busca" placeholder="🔍 Filtrar por aluno, livro ou polo..." value={busca} onChange={e => setBusca(e.target.value)} />
        </div>

        <table>
          <thead>
            <tr>
              <th>Estudante</th>
              <th>Livro</th>
              <th>Polo de Retirada</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Nenhuma reserva ativa.</td></tr>
            )}
            {filtradas.map(r => (
              <tr key={r.id}>
                <td><strong>{r.nomeAluno}</strong></td>
                <td>{r.tituloLivro}</td>
                <td><small>📍 {r.poloRetirada || 'Não informado'}</small></td>
                <td>
                  {r.status === 'RETIRADO'
                    ? <span className="status status-azul">🔵 Retirado</span>
                    : <span className="status status-verde">🟢 Reservado</span>
                  }
                </td>
                <td>
                  {r.status === 'RETIRADO'
                    ? <button className="btn-icone btn-devolver" onClick={() => confirmarDevolucao(r.id, r.tituloLivro)}>↩️ Devolvido</button>
                    : <button className="btn-icone btn-entregar" onClick={() => confirmarEntrega(r.id, r.tituloLivro, r.nomeAluno)}>✅ Entregar</button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
