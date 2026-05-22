import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function ReservasPage({ usuario }) {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [confirmTitulo, setConfirmTitulo] = useState('');
  const toast = useToast();

  function carregar() {
    setLoading(true);
    api.getEmprestimosPorAluno(usuario)
      .then(setReservas)
      .finally(() => setLoading(false));
  }

  useEffect(() => { carregar(); }, [usuario]);

  async function cancelar() {
    const resp = await api.cancelarEmprestimo(confirmId);
    setConfirmId(null);
    if (resp.ok) { toast('✅ Reserva cancelada com sucesso!'); carregar(); }
    else toast('⚠️ Erro ao cancelar reserva.');
  }

  function formatarData(dateStr) {
    if (!dateStr) return '-';
    return dateStr.split('T')[0].split('-').reverse().join('/');
  }

  return (
    <div className="tabela-container">
      <div className="tabela-header">
        <h2>📋 Minhas Reservas</h2>
      </div>

      {loading && <p className="loading">Carregando reservas...</p>}

      {!loading && (
        <table>
          <thead>
            <tr>
              <th>Livro</th>
              <th>Data da Reserva</th>
              <th>Entrega Limite</th>
              <th>Polo de Retirada</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {reservas.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Nenhuma reserva encontrada.</td></tr>
            )}
            {reservas.map(r => {
              const vencido = r.dataDevolucao && new Date() > new Date(r.dataDevolucao);
              return (
                <tr key={r.id}>
                  <td><strong>{r.tituloLivro}</strong></td>
                  <td>{formatarData(r.dataReserva)}</td>
                  <td>{formatarData(r.dataDevolucao)}</td>
                  <td>{r.poloRetirada || 'Não informado'}</td>
                  <td>
                    <span className={`status ${vencido ? 'status-vermelho' : 'status-verde'}`}>
                      {r.status === 'RETIRADO' ? '🔵 Retirado' : vencido ? '🔴 Vencido' : '🟢 Em dia'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icone btn-deletar" onClick={() => { setConfirmId(r.id); setConfirmTitulo(r.tituloLivro); }}>
                      ✕ Cancelar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* MODAL DE CONFIRMAÇÃO */}
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
              <button className="btn-primario" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }} onClick={cancelar}>
                Sim, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
