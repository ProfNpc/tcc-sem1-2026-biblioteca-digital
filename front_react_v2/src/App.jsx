import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import CatalogoPage from './pages/CatalogoPage';
import AcervoPage from './pages/AcervoPage';
import ReservasPage from './pages/ReservasPage';
import AdminReservasPage from './pages/AdminReservasPage';
import AdminLivrosPage from './pages/AdminLivrosPage';
import AdminAlunosPage from './pages/AdminAlunosPage';
import { ToastContainer } from './components/Toast';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [pagina, setPagina] = useState('catalogo');
  const [showLogin, setShowLogin] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('dark') === '1');

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('dark', darkMode ? '1' : '0');
  }, [darkMode]);

  function handleLogin(nome, p) {
    setUsuario(nome);
    setPerfil(p);
    setShowLogin(false);
    setPagina(p === 'ADMIN' ? 'admin-reservas' : 'acervo');
  }

  function handleLogout() {
    setUsuario(null);
    setPerfil(null);
    setPagina('catalogo');
    setShowLogin(false);
  }

  if (showLogin) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <h1>BiblioTech</h1>
        <nav>
          {!usuario && (
            <>
              <button className={`nav-btn ${pagina === 'catalogo' ? 'ativo' : ''}`} onClick={() => setPagina('catalogo')}>
                Início
              </button>
              <button className="nav-btn" onClick={() => setShowLogin(true)}>
                🔐 Login
              </button>
            </>
          )}

          {usuario && perfil === 'ALUNO' && (
            <>
              <button className={`nav-btn ${pagina === 'acervo' ? 'ativo' : ''}`} onClick={() => setPagina('acervo')}>
                Catálogo
              </button>
              <button className={`nav-btn ${pagina === 'reservas' ? 'ativo' : ''}`} onClick={() => setPagina('reservas')}>
                Minhas Reservas
              </button>
            </>
          )}

          {usuario && perfil === 'ADMIN' && (
            <>
              <button className={`nav-btn ${pagina === 'admin-reservas' ? 'ativo' : ''}`} onClick={() => setPagina('admin-reservas')}>
                Reservas
              </button>
              <button className={`nav-btn ${pagina === 'admin-livros' ? 'ativo' : ''}`} onClick={() => setPagina('admin-livros')}>
                Acervo
              </button>
              <button className={`nav-btn ${pagina === 'admin-alunos' ? 'ativo' : ''}`} onClick={() => setPagina('admin-alunos')}>
                Alunos
              </button>
            </>
          )}

          {usuario && (
            <>
              <span className="nav-usuario">Olá, {usuario.split(' ')[0]}!</span>
              <button className="nav-btn sair" onClick={handleLogout}>Sair</button>
            </>
          )}

          {/* BOTÃO DARK MODE */}
          <button
            className="nav-btn dark-toggle"
            onClick={() => setDarkMode(d => !d)}
            title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </nav>
      </header>

      {/* PÁGINAS */}
      <main>
        {pagina === 'catalogo' && <CatalogoPage onIrParaLogin={() => setShowLogin(true)} />}
        {pagina === 'acervo' && <AcervoPage usuario={usuario} />}
        {pagina === 'reservas' && <ReservasPage usuario={usuario} />}
        {pagina === 'admin-reservas' && <AdminReservasPage />}
        {pagina === 'admin-livros' && <AdminLivrosPage />}
        {pagina === 'admin-alunos' && <AdminAlunosPage />}
      </main>

      <ToastContainer />
    </>
  );
}
