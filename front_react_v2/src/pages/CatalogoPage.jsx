import { useEffect, useState } from 'react';
import { api, IMG_BASE } from '../services/api';
import { POLOS } from '../constants/unidades';
import CapaLivro from '../components/CapaLivro';

export default function CatalogoPage({ onIrParaLogin }) {
  const [livros, setLivros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapaEndereco, setMapaEndereco] = useState(null);

  useEffect(() => {
    api.getLivros()
      .then(setLivros)
      .catch(() => setLivros([]))
      .finally(() => setLoading(false));
  }, []);

  function fecharMapa(e) {
    if (e.target === e.currentTarget || e.target.classList.contains('close-map-btn')) {
      setMapaEndereco(null);
    }
  }

  return (
    <div>
      <div className="hero-section">
        <h2>Bem-vindo à BiblioTech</h2>
        <p>O acervo digital dos Institutos Técnicos de Barueri. Faça login para reservar.</p>
      </div>

      <h3 className="secao-titulo">📚 Destaques do Acervo</h3>

      {loading && <p className="loading">Carregando livros...</p>}

      <div className="grid-livros">
        {livros.map(livro => (
          <div key={livro.id} className="card-livro">
            <div className="card-capa">
              <CapaLivro livro={livro} alt={`Capa de ${livro.titulo}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <span className={`badge-disp ${livro.disponivel ? 'badge-ok' : 'badge-no'}`}>
                {livro.disponivel ? 'Disponível' : 'Emprestado'}
              </span>
            </div>
            <div className="card-body">
              <h3>{livro.titulo}</h3>
              <p>Autor: {livro.autor}</p>
              <p>Ano: {livro.anoPublicacao}</p>
              {livro.unidade && <p style={{ fontSize: '0.8rem', color: '#64748b' }}>📍 {livro.unidade}</p>}
              <button className="btn-reservar" onClick={onIrParaLogin}>
                🔐 Entrar para Reservar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SEÇÃO POLOS PARCEIROS */}
      <section className="polos-parceiros" id="polos">
        <h2>Nossos Polos Parceiros</h2>
        <div className="polos-grid">
          {POLOS.map(polo => (
            <div
              key={polo.nome}
              className="polo-card"
              onClick={() => setMapaEndereco(polo.endereco)}
              title="Ver como chegar no Google Maps!"
            >
              <img src={polo.img} alt={polo.nome} />
              <h3>{polo.nome}</h3>
              <p>📍 {polo.bairro} — <span style={{ color: '#2563eb', fontWeight: 600 }}>Ver como chegar →</span></p>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL DO MAPA */}
      {mapaEndereco && (
        <div className="map-modal-overlay active" onClick={fecharMapa}>
          <div className="map-modal-content">
            <button className="close-map-btn" onClick={() => setMapaEndereco(null)}>✕</button>
            <iframe
              className="map-iframe"
              src={`https://www.google.com/maps?q=${encodeURIComponent(mapaEndereco)}&output=embed`}
              loading="lazy"
              allowFullScreen
              title="Mapa do polo"
            />
          </div>
        </div>
      )}

      <footer>
        <p>© 2026 BiblioTech — Instituto Técnico de Barueri</p>
      </footer>
    </div>
  );
}
