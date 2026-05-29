import { useEffect, useState } from 'react';
import { api } from '../services/api';

import poloBrasilio  from '../img/polo-brasilio.png';
import poloMunir     from '../img/polo-munir.png';
import poloSylvia    from '../img/polo-sylvia.png';
import poloHercules  from '../img/polo-hercules.png';
import poloMoacyr    from '../img/polo-moacyr.png';
import poloAlphaville from '../img/polo-alphaville.jpg';

const POLOS = [
  {
    nome: 'ITB Brasílio Flores de Azevedo',
    bairro: 'Jardim Belval',
    endereco: 'R. Interna Grupo Bandeirante, 138 - Jardim Belval, Barueri - SP, 06420-150',
    img: poloBrasilio,
  },
  {
    nome: 'ITB Prof. Munir José',
    bairro: 'Jardim Paulista',
    endereco: 'Estr. Velha de Itapevi, 2679 - Jardim Paulista, Barueri - SP, 06444-000',
    img: poloMunir,
  },
  {
    nome: 'ITB Profª Maria Sylvia Chaluppe Mello',
    bairro: 'Engenho Novo',
    endereco: 'Rua do ITB, 238 - Vila Engenho Novo, Barueri - SP, 06415-080',
    img: poloSylvia,
  },
  {
    nome: 'ITB Profº Hércules Alves de Oliveira',
    bairro: 'Jardim Mutinga',
    endereco: 'R. Abelardo Luz, 86 - Jardim Mutinga, Barueri - SP, 06463-260',
    img: poloHercules,
  },
  {
    nome: 'ITB Profº Moacyr Domingos Sávio Veronezi',
    bairro: 'Parque Imperial',
    endereco: 'R. Tomé de Souza, 259 - Parque Imperial, Barueri - SP, 06462-040',
    img: poloMoacyr,
  },
  {
    nome: 'ITB Profª Maria Theodora Guilherme de Moraes Leme',
    bairro: 'Alphaville',
    endereco: 'Av. Andrômeda, 500 - Alphaville Empresarial, Barueri - SP, 06473-005',
    img: poloAlphaville,
  },
];

function getCapaUrl(titulo) {
  const t = titulo.toLowerCase();
  if (t.includes('1984') || t.includes('casmurro') || t.includes('nárnia')) return 'https://images.unsplash.com/photo-1608178398319-48f814d0750c?auto=format&fit=crop&w=400&q=80';
  if (t.includes('harry')) return 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=400&q=80';
  if (t.includes('design') || t.includes('arte')) return 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=400&q=80';
  if (t.includes('código') || t.includes('algoritmo') || t.includes('engenharia')) return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80';
  return 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80';
}

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
            <div className="card-capa" style={{ backgroundImage: `url('${getCapaUrl(livro.titulo)}')` }}>
              <span className={`badge-disp ${livro.disponivel ? 'badge-ok' : 'badge-no'}`}>
                {livro.disponivel ? 'Disponível' : 'Emprestado'}
              </span>
            </div>
            <div className="card-body">
              <h3>{livro.titulo}</h3>
              <p>Autor: {livro.autor}</p>
              <p>Ano: {livro.anoPublicacao}</p>
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
