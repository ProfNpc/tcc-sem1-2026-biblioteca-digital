import { useEffect, useState } from 'react';
import { api, IMG_BASE } from '../services/api';
import { useToast } from '../components/Toast';

const POLOS = [
  'ITB Brasílio Flores de Azevedo',
  'ITB Prof. Munir José',
  'ITB Profª Maria Sylvia Chaluppe Mello',
  'ITB Profº Hércules Alves de Oliveira',
  'ITB Profº Moacyr Domingos Sávio Veronezi',
  'ITB Profª Maria Theodora',
];

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

export default function AcervoPage({ usuario }) {
  const [livros, setLivros] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalLivro, setModalLivro] = useState(null);
  const [poloSelecionado, setPoloSelecionado] = useState(POLOS[0]);
  const [reservando, setReservando] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.getLivros().then(setLivros).finally(() => setLoading(false));
  }, []);

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
        poloRetirada: poloSelecionado
      });
      if (resp.ok) {
        toast(`✅ Reserva confirmada! Retire em: ${poloSelecionado}`);
        setModalLivro(null);
        const dados = await api.getLivros();
        setLivros(dados);
      } else {
        toast('⚠️ Não foi possível reservar. Tente novamente.');
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
              <button
                className="btn-reservar"
                disabled={!livro.disponivel}
                onClick={() => { setModalLivro(livro); setPoloSelecionado(POLOS[0]); }}
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
              <select className="polo-select" value={poloSelecionado} onChange={e => setPoloSelecionado(e.target.value)}>
                {POLOS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
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
