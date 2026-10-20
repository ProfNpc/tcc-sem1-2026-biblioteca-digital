import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Pressable, Platform, StyleSheet } from 'react-native';
import { api } from '../services/api';
import { NOMES_UNIDADES } from '../constants/unidades';
import { useTema, TOPO_SEGURO } from '../theme';
import { Botao, Campo, Seletor } from '../components/ui';

export default function LoginPage({ onLogin, onVoltar }) {
  const { cores } = useTema();
  const [tela, setTela] = useState('escolha'); // 'escolha' | 'login' | 'cadastro' | 'escolher-unidade'
  const [intencao, setIntencao] = useState('ALUNO');
  const [ra, setRa] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [cadEmail, setCadEmail] = useState('');
  const [cadRa, setCadRa] = useState('');
  const [cadSenha, setCadSenha] = useState('');
  const [cadUnidade, setCadUnidade] = useState(NOMES_UNIDADES[0]);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  // Aluno autenticado que ainda precisa escolher a unidade (conta antiga)
  const [alunoPendente, setAlunoPendente] = useState(null);
  const [unidadePendente, setUnidadePendente] = useState(NOMES_UNIDADES[0]);

  function escolherPortal(perfil) {
    setIntencao(perfil);
    setErro('');
    setRa(''); setSenha('');
    setTela('login');
  }

  async function fazerLogin() {
    if (!ra.trim() || !senha.trim()) { setErro('Preencha usuário e senha.'); return; }
    setErro(''); setLoading(true);
    try {
      const resp = await api.login(ra.trim(), senha.trim());
      if (!resp.ok) { setErro('RA ou Senha inválidos.'); setLoading(false); return; }
      const aluno = await resp.json();
      const perfil = (aluno.perfil || '').trim();
      if (intencao === 'ADMIN' && perfil !== 'ADMIN') {
        setErro('Acesso negado: você não é administrador.');
        setLoading(false); return;
      }

      // Aluno sem unidade definida: pede a unidade antes de liberar o acervo.
      if (perfil === 'ALUNO' && !aluno.unidade) {
        api.salvarSessao(aluno); // o token já é necessário para salvar a unidade em seguida
        setAlunoPendente(aluno);
        setTela('escolher-unidade');
        setLoading(false);
        return;
      }

      api.salvarSessao(aluno);
      onLogin(aluno);
    } catch {
      setErro('Erro de conexão. O servidor Java está ligado? O IP em src/config.jsx está certo?');
    }
    setLoading(false);
  }

  async function confirmarUnidadePendente() {
    setLoading(true);
    try {
      await api.editarAluno(alunoPendente.id, { unidade: unidadePendente });
      onLogin({ ...alunoPendente, unidade: unidadePendente });
    } catch {
      setErro('Não foi possível salvar sua unidade. Tente novamente.');
    }
    setLoading(false);
  }

  async function fazerCadastro() {
    const emailNormalizado = cadEmail.trim().toLowerCase();
    if (!nome.trim() || !emailNormalizado || !cadRa.trim() || !cadSenha.trim()) {
      setErro('Preencha todos os campos.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
      setErro('Digite um e-mail válido.');
      return;
    }
    setErro(''); setLoading(true);
    try {
      const aluno = await api.criarAluno({
        nome: nome.trim(),
        ra: cadRa.trim(),
        senha: cadSenha.trim(),
        email: emailNormalizado,
        perfil: 'ALUNO',
        unidade: cadUnidade,
      });
      api.salvarSessao(aluno);
      onLogin(aluno);
    } catch (e) {
      setErro(e.message || 'Erro ao cadastrar. Tente novamente.');
    }
    setLoading(false);
  }

  function trocarTela(nova) { setErro(''); setTela(nova); }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: cores.fundo }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[estilos.topo, { backgroundColor: cores.cabecalho }]}>
          <Text style={estilos.marca}>BiblioTech</Text>
          <Text style={estilos.slogan}>O conhecimento do mundo na palma da sua mão. Acesse o nosso acervo e evolua com a gente.</Text>
        </View>

        <View style={estilos.caixa}>
          {tela === 'escolha' && (
            <>
              <Text style={[estilos.titulo, { color: cores.titulo }]}>Onde você deseja entrar?</Text>
              <Botao titulo="📚 Portal do Aluno" onPress={() => escolherPortal('ALUNO')} style={{ marginBottom: 10 }} />
              <Botao titulo="⚙️ Painel Administrativo" onPress={() => escolherPortal('ADMIN')} tipo="secundario" />
              <Link cores={cores} texto="Não tem conta? Cadastre-se" onPress={() => trocarTela('cadastro')} />
              <Link cores={cores} texto="← Voltar ao catálogo" onPress={onVoltar} />
            </>
          )}

          {tela === 'login' && (
            <>
              <Text style={[estilos.titulo, { color: cores.titulo }]}>
                {intencao === 'ADMIN' ? '⚙️ Acesso Administrativo' : '📚 Portal do Aluno'}
              </Text>
              <Campo rotulo={intencao === 'ADMIN' ? 'Usuário Admin' : 'Usuário'} placeholder="Digite seu Usuário"
                value={ra} onChangeText={setRa} autoCapitalize="none" autoCorrect={false} />
              <Campo rotulo="Senha" placeholder="Sua senha" value={senha} onChangeText={setSenha} secureTextEntry />
              {erro ? <Text style={estilos.erro}>⚠️ {erro}</Text> : null}
              <Botao titulo={loading ? 'Entrando...' : 'Acessar'} onPress={fazerLogin} desabilitado={loading} />
              <Link cores={cores} texto="← Trocar Portal" onPress={() => trocarTela('escolha')} />
            </>
          )}

          {tela === 'cadastro' && (
            <>
              <Text style={[estilos.titulo, { color: cores.titulo }]}>Criar Nova Conta</Text>
              <Campo rotulo="Nome Completo" placeholder="Ex: João da Silva" value={nome} onChangeText={setNome} />
              <Campo rotulo="E-mail" placeholder="Ex: joao@email.com" value={cadEmail}
                onChangeText={setCadEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
              <Campo rotulo="Usuário" placeholder="Digite seu nome de usuário" value={cadRa}
                onChangeText={setCadRa} autoCapitalize="none" autoCorrect={false} />
              <Campo rotulo="Senha" placeholder="Crie uma senha" value={cadSenha} onChangeText={setCadSenha} secureTextEntry />
              <Seletor rotulo="Unidade em que estuda" valor={cadUnidade} opcoes={NOMES_UNIDADES} onChange={setCadUnidade} />
              {erro ? <Text style={estilos.erro}>⚠️ {erro}</Text> : null}
              <Botao titulo={loading ? 'Cadastrando...' : 'Registrar e Acessar'} onPress={fazerCadastro} desabilitado={loading} />
              <Link cores={cores} texto="Já tem conta? Entrar" onPress={() => trocarTela('escolha')} />
            </>
          )}

          {tela === 'escolher-unidade' && (
            <>
              <Text style={[estilos.titulo, { color: cores.titulo }]}>📍 Qual unidade você estuda?</Text>
              <Text style={{ color: cores.suave, marginBottom: 16 }}>
                Sua conta ainda não tem uma unidade definida. Isso garante que você só veja livros disponíveis no seu polo.
              </Text>
              <Seletor valor={unidadePendente} opcoes={NOMES_UNIDADES} onChange={setUnidadePendente} />
              {erro ? <Text style={estilos.erro}>⚠️ {erro}</Text> : null}
              <Botao titulo={loading ? 'Salvando...' : 'Confirmar e Entrar'} onPress={confirmarUnidadePendente} desabilitado={loading} />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Texto clicável simples (o "link-alternativo" do React)
function Link({ cores, texto, onPress }) {
  return (
    <Pressable onPress={onPress} style={{ paddingVertical: 12, alignItems: 'center' }}>
      <Text style={{ color: cores.primaria, fontWeight: '600' }}>{texto}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  topo: { paddingTop: TOPO_SEGURO + 24, paddingBottom: 32, paddingHorizontal: 24 },
  marca: { color: '#fff', fontSize: 34, fontWeight: '800' },
  slogan: { color: '#bfdbfe', marginTop: 8, fontSize: 15, lineHeight: 21 },
  caixa: { padding: 24 },
  titulo: { fontSize: 22, fontWeight: '800', marginBottom: 20 },
  erro: { color: '#dc2626', marginBottom: 12 },
});
