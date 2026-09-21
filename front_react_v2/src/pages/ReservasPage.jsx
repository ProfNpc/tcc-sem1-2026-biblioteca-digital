import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function ReservasPage({ usuario }) {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [confirmTitulo, setConfirmTitulo] = useState('');
  const [historico, setHistorico] = useState(false);
  const toast = useToast();

  function carregar() {
    setLoading(true);
    const chamada = historico ? api.getHistoricoPorAluno(usuario) : api.getEmprestimosPorAluno(usuario);
    chamada.then(setReservas).finally(() => setLoading(false));
  }

  useEffect(() => { carregar(); }, [usuario, historico]);

  async function cancelar() {
    try {
      const resp = await api.cancelarEmprestimo(confirmId);
      const texto = await resp.text().catch(() => '');
      setConfirmId(null);
      if (resp.ok) {
        toast('✅ Reserva cancelada com sucesso!');
        carregar();
      } else {
        toast(`⚠️ ${texto || 'Não foi possível cancelar esta reserva.'}`);
      }
    } catch {
      setConfirmId(null);
      toast('⚠️ Erro de conexão com o servidor.');
    }
  }

  function formatarData(dateStr) {
    if (!dateStr) return '-';
    return dateStr.split('T')[0].split('-').reverse().join('/');
  }

  return (
    <div className="tabela-container">
      <div className="tabela-header">
        <h2>{historico ? '📚 Histórico de Empréstimos' : '📋 Minhas Reservas e Empréstimos'}</h2>
        <button className="btn-cancelar" onClick={() => setHistorico(h => !h)}>
          {historico ? '← Voltar às Reservas' : '📚 Ver Histórico'}
        </button>
      </div>

      {loading && <p className="loading">Carregando...</p>}

      {!loading && (
        <table>
          <thead>
            <tr>
              <th>Livro</th>
              <th>Reserva</th>
              <th>Retirada</th>
              <th>Devolução prevista</th>
              <th>Polo</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {reservas.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Nenhum registro encontrado.</td></tr>
            )}
            {reservas.map(r => {
              const hoje = new Date();
              const limiteReserva = r.dataLimiteReserva ? new Date(`${r.dataLimiteReserva}T23:59:59`) : null;
              const limiteDevolucao = r.dataDevolucao ? new Date(`${r.dataDevolucao}T23:59:59`) : null;
              const reservaVencida = r.status === 'RESERVADO' && limiteReserva && hoje > limiteReserva;
              const emprestimoAtrasado = r.status === 'RETIRADO' && limiteDevolucao && hoje > limiteDevolucao;

              let situacao;
              if (r.status === 'RESERVADO') {
                situacao = reservaVencida
                  ? <span className="status status-vermelho">🔴 Reserva vencida</span>
                  : <span className="status status-verde">🟢 Reservado</span>;
              } else if (r.status === 'RETIRADO') {
                situacao = emprestimoAtrasado
                  ? <span className="status status-vermelho">🔴 Em atraso</span>
                  : <span className="status status-azul">🔵 Retirado</span>;
              } else {
                situacao = <span className="status">{r.status}</span>;
              }

              return (
                <tr key={r.id}>
                  <td><strong>{r.tituloLivro}</strong></td>
                  <td>
                    {formatarData(r.dataReserva)}
                    {r.status === 'RESERVADO' && r.dataLimiteReserva && (
                      <small style={{ display: 'block', color: '#64748b' }}>
                        até {formatarData(r.dataLimiteReserva)}
                      </small>
                    )}
                  </td>
                  <td>{formatarData(r.dataRetirada)}</td>
                  <td>{formatarData(r.dataDevolucao)}</td>
                  <td>{r.poloRetirada || 'Não informado'}</td>
                  <td>{historico ? (
                    r.status === 'DEVOLVIDO'
                      ? <span className="status status-verde">🟢 Devolvido em {formatarData(r.dataDevolucaoReal)}</span>
                      : r.status === 'EXPIRADO'
                        ? <span className="status status-vermelho">🟠 Reserva expirada</span>
                        : <span className="status status-vermelho">🔴 Cancelado</span>
                  ) : situacao}</td>
                  <td>
                    {!historico && r.status === 'RESERVADO' && (
                      <button className="btn-icone btn-deletar" onClick={() => { setConfirmId(r.id); setConfirmTitulo(r.tituloLivro); }}>
                        ✕ Cancelar
                      </button>
                    )}
                    {!historico && r.status === 'RETIRADO' && (
                      <span style={{ color: '#64748b', fontSize: '0.82rem' }}>Aguardando devolução</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {confirmId && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirmId(null)}>
          <div className="modal-box" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <h3>Confirmar Cancelamento</h3>
            <p style={{ color: '#475569', margin: '16px 0 24px' }}>
              Deseja cancelar a reserva de <strong>{confirmTitulo}</strong>?
            </p>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button className="btn-cancelar" onClick={() => setConfirmId(null)}>Voltar</button>
              <button className="btn-primario" style={{ background: 'linear-gradient(135deg, #ef4444, hsla(0, 72%, 51%, 1.00))' }} onClick={cancelar}>
                Sim, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
