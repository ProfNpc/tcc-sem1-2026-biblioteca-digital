import { useEffect, useState } from 'react';
import { api, IMG_BASE } from '../services/api';
import { useToast } from '../components/Toast';

const CAPA_PADRAO = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80';

function getCapaUrl(livro) {
  if (livro.imagemCapa) return `${IMG_BASE}/${livro.imagemCapa}`;
  const t = livro.titulo.toLowerCase();
  if (t.includes('1984') || t.includes('casmurro')) return 'https://images.unsplash.com/photo-1608178398319-48f814d0750c?auto=format&fit=crop&w=400&q=80';
  if (t.includes('harry')) return 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=400&q=80';
  if (t.includes('design') || t.includes('arte')) return 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=400&q=80';
  if (t.includes('código') || t.includes('algoritmo')) return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80';
  return CAPA_PADRAO;
}

export default function AcervoPage({ usuario, unidade }) {
  const [livros, setLivros] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalLivro, setModalLivro] = useState(null);
  const [reservando, setReservando] = useState(false);
  const toast = useToast();

  function carregar() {
    setLoading(true);
    // Filtra direto na API pelo campo unidade do aluno logado, pra nunca mostrar
    // um livro que não existe no polo dele.
    api.getLivros(unidade).then(setLivros).finally(() => setLoading(false));
  }

  useEffect(() => { carregar(); }, [unidade]);

  const livrosFiltrados = livros.filter(l =>
    l.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    l.autor.toLowerCase().includes(busca.toLowerCase())
  );

  async function confirmarReserva() {
    setReservando(true);
    try {
      const resp = await api.criarEmprestimo({
        nomeAluno: usuario,
        tituloLivro: modalLivro.titulo,
      });
      if (resp.ok) {
        toast(`✅ Reserva confirmada! Retire em: ${modalLivro.unidade}`);
        setModalLivro(null);
        carregar();
      } else {
        const msg = await resp.text().catch(() => '');
        toast(`⚠️ ${msg || 'Não foi possível reservar. Tente novamente.'}`);
      }
    } catch {
      toast('⚠️ Erro de conexão com o servidor.');
    }
    setReservando(false);
  }

  return (
    <div>
      <div style={{ padding: '30px 40px 0', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <h2 style={{ color: '#1e3a8a', fontSize: '2rem', fontWeight: '700' }}>Catálogo de Livros</h2>
        <input
          className="input-busca"
          placeholder="🔍 Buscar por título ou autor..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      {loading && <p className="loading">Carregando acervo...</p>}

      <div className="grid-livros">
        {livrosFiltrados.map(livro => (
          <div key={livro.id} className="card-livro">
            <div className="card-capa" style={{ backgroundImage: `url('${getCapaUrl(livro)}')` }}>
              <span className={`badge-disp ${livro.disponivel ? 'badge-ok' : 'badge-no'}`}>
                {livro.disponivel ? 'Disponível' : 'Emprestado'}
              </span>
            </div>
            <div className="card-body">
              <h3>{livro.titulo}</h3>
              <p>Autor: {livro.autor}</p>
              <p>Ano: {livro.anoPublicacao}</p>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                {livro.quantidadeDisponivel ?? 0} de {livro.quantidadeTotal ?? 1} exemplares disponíveis
              </p>
              <button
                className="btn-reservar"
                disabled={!livro.disponivel}
                onClick={() => setModalLivro(livro)}
              >
                {livro.disponivel ? '📌 Reservar' : 'Indisponível'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE RESERVA */}
      {modalLivro && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalLivro(null)}>
          <div className="modal-box">
            <h3>📌 Confirmar Reserva</h3>
            <p style={{ color: '#475569', marginBottom: '20px' }}>
              Você está reservando: <strong>{modalLivro.titulo}</strong>
            </p>
            <div className="campo">
              <label>Polo de Retirada</label>
              <p style={{ margin: 0, fontWeight: 600 }}>📍 {modalLivro.unidade}</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                A retirada é sempre na unidade onde o exemplar está.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setModalLivro(null)}>Cancelar</button>
              <button className="btn-primario" onClick={confirmarReserva} disabled={reservando}>
                {reservando ? 'Reservando...' : 'Confirmar Reserva'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
