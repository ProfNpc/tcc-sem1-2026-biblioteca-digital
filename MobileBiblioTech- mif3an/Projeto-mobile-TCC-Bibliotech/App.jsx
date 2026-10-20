import { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CLARO, ESCURO, TemaContext, TOPO_SEGURO, BASE_SEGURA } from './src/theme';
import { api, definirAoSessaoExpirar } from './src/services/api';
import { ToastContainer, useToast } from './src/components/Toast';
import LoginPage from './src/pages/LoginPage';
import CatalogoPage from './src/pages/CatalogoPage';
import AcervoPage from './src/pages/AcervoPage';
import ReservasPage from './src/pages/ReservasPage';
import AdminReservasPage from './src/pages/AdminReservasPage';
import AdminLivrosPage from './src/pages/AdminLivrosPage';
import AdminAlunosPage from './src/pages/AdminAlunosPage';

export default function App() {
  const [aluno, setAluno] = useState(null); // objeto completo: {id, nome, ra, perfil, unidade}
  const [pagina, setPagina] = useState('catalogo');
  const [showLogin, setShowLogin] = useState(false);
  const [escuro, setEscuro] = useState(false);
  const toast = useToast();

  const usuario = aluno?.nome ?? null;
  const perfil = aluno?.perfil ?? null;
  const cores = escuro ? ESCURO : CLARO;
  const tema = useMemo(() => ({ cores, escuro, alternar: () => setEscuro(e => !e) }), [escuro]);

  // Se o servidor disser que a sessão é inválida (ex.: o back reiniciou), volta ao login.
  useEffect(() => {
    definirAoSessaoExpirar(() => {
      api.limparSessao();
      setAluno(null);
      setPagina('catalogo');
      setShowLogin(true);
      toast('⚠️ Sua sessão expirou. Entre novamente.');
    });
  }, []);

  function handleLogin(alunoLogado) {
    setAluno(alunoLogado);
    setShowLogin(false);
    setPagina(alunoLogado.perfil === 'ADMIN' ? 'admin-reservas' : 'acervo');
  }

  function handleLogout() {
    api.encerrarSessao();
    setAluno(null);
    setPagina('catalogo');
    setShowLogin(false);
  }

  // Abas da barra inferior, conforme quem está logado
  const abas = !usuario
    ? [{ id: 'catalogo', icone: '🏠', rotulo: 'Início' }, { id: 'login', icone: '🔐', rotulo: 'Login' }]
    : perfil === 'ADMIN'
      ? [
          { id: 'admin-reservas', icone: '📋', rotulo: 'Reservas' },
          { id: 'admin-livros', icone: '📚', rotulo: 'Acervo' },
          { id: 'admin-alunos', icone: '👥', rotulo: 'Alunos' },
        ]
      : [{ id: 'acervo', icone: '📚', rotulo: 'Catálogo' }, { id: 'reservas', icone: '📌', rotulo: 'Minhas Reservas' }];

  function aoTocarAba(id) {
    if (id === 'login') setShowLogin(true);
    else setPagina(id);
  }

  return (
    <TemaContext.Provider value={tema}>
      <View style={{ flex: 1, backgroundColor: cores.fundo }}>
        <StatusBar style="light" />

        {showLogin ? (
          <LoginPage onLogin={handleLogin} onVoltar={() => setShowLogin(false)} />
        ) : (
          <>
            {/* CABEÇALHO */}
            <View style={[estilos.cabecalho, { backgroundColor: cores.cabecalho }]}>
              <Text style={estilos.marca}>BiblioTech</Text>
              <View style={estilos.acoes}>
                {usuario && <Text style={estilos.ola}>Olá, {usuario.split(' ')[0]}!</Text>}
                <Pressable onPress={tema.alternar} style={estilos.botaoCab}>
                  <Text>{escuro ? '☀️' : '🌙'}</Text>
                </Pressable>
                {usuario && (
                  <Pressable onPress={handleLogout} style={estilos.botaoCab}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Sair</Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* PÁGINAS */}
            <View style={{ flex: 1 }}>
              {pagina === 'catalogo' && <CatalogoPage onIrParaLogin={() => setShowLogin(true)} />}
              {pagina === 'acervo' && <AcervoPage usuario={usuario} unidade={aluno?.unidade} />}
              {pagina === 'reservas' && <ReservasPage usuario={usuario} />}
              {pagina === 'admin-reservas' && <AdminReservasPage />}
              {pagina === 'admin-livros' && <AdminLivrosPage />}
              {pagina === 'admin-alunos' && <AdminAlunosPage />}
            </View>

            {/* BARRA DE ABAS */}
            <View style={[estilos.abas, { backgroundColor: cores.cartao, borderTopColor: cores.borda, paddingBottom: 8 + BASE_SEGURA }]}>
              {abas.map(a => {
                const ativa = a.id === pagina;
                return (
                  <Pressable key={a.id} onPress={() => aoTocarAba(a.id)} style={estilos.aba}>
                    <Text style={{ fontSize: 20 }}>{a.icone}</Text>
                    <Text style={{ fontSize: 11, color: ativa ? cores.primaria : cores.suave, fontWeight: ativa ? '800' : '500' }}>
                      {a.rotulo}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        <ToastContainer />
      </View>
    </TemaContext.Provider>
  );
}

const estilos = StyleSheet.create({
  cabecalho: { paddingTop: TOPO_SEGURO + 8, paddingBottom: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  marca: { color: '#fff', fontSize: 22, fontWeight: '800' },
  acoes: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ola: { color: '#bfdbfe', fontSize: 13 },
  botaoCab: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.15)' },
  abas: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 8 },
  aba: { flex: 1, alignItems: 'center', gap: 2 },
});
