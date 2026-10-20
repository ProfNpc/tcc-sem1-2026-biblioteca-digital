import { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
import { api } from '../services/api';
import { useTema } from '../theme';
import { useToast } from '../components/Toast';
import { NOMES_UNIDADES } from '../constants/unidades';
import { Botao, Campo, Seletor, Selo, Carregando, Vazio, Janela } from '../components/ui';
import { contem } from '../utils';

const VAZIO = { nome: '', ra: '', senha: '', email: '', perfil: 'ALUNO', unidade: NOMES_UNIDADES[0] };
const PERFIS = [{ valor: 'ALUNO', rotulo: 'Aluno' }, { valor: 'ADMIN', rotulo: 'Administrador' }];

export default function AdminAlunosPage() {
  const { cores } = useTema();
  const [alunos, setAlunos] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VAZIO);
  const [editId, setEditId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState('');
  const toast = useToast();

  function carregar() {
    api.getAlunos()
      .then(setAlunos)
      .catch(() => toast('⚠️ Erro ao carregar os alunos.'))
      .finally(() => { setLoading(false); setAtualizando(false); });
  }
  useEffect(() => { carregar(); }, []);

  const campo = (nome) => (valor) => setForm(f => ({ ...f, [nome]: valor }));

  function abrirNovo() {
    setForm(VAZIO); setEditId(null); setErroForm(''); setModal(true);
  }

  function abrirEditar(a) {
    setForm({
      nome: a.nome || '', ra: a.ra || '', senha: '', email: a.email || '',
      perfil: a.perfil || 'ALUNO', unidade: a.unidade || NOMES_UNIDADES[0],
    });
    setEditId(a.id); setErroForm(''); setModal(true);
  }

  async function salvar() {
    if (!form.nome.trim() || !form.ra.trim() || (!editId && !form.senha.trim())) {
      setErroForm('Preencha nome, usuário e senha (a senha só é opcional ao editar).');
      return;
    }
    setSalvando(true); setErroForm('');
    try {
      if (editId) {
        await api.editarAluno(editId, form);
        toast('✅ Aluno atualizado com sucesso!');
      } else {
        await api.criarAluno(form);
        toast('✅ Aluno cadastrado com sucesso!');
      }
      setModal(false);
      carregar();
    } catch (erro) {
      setErroForm(erro.message || 'Erro ao salvar aluno.');
    }
    setSalvando(false);
  }

  function pedirExclusao(a) {
    Alert.alert('Excluir aluno', `Excluir o aluno "${a.nome}"?`, [
      { text: 'Voltar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => excluir(a.id) },
    ]);
  }

  async function excluir(id) {
    try {
      const resp = await api.deletarAluno(id);
      if (resp.ok) { toast('🗑️ Aluno excluído.'); carregar(); }
      else toast('⚠️ Erro ao excluir.');
    } catch { toast('⚠️ Erro de conexão com o servidor.'); }
  }

  const filtrados = alunos.filter(a => contem(a.nome, busca) || contem(a.ra, busca) || contem(a.email, busca));

  const topo = (
    <View>
      <Text style={[estilos.titulo, { color: cores.titulo }]}>Gestão de Alunos</Text>
      <Botao titulo="+ Novo Aluno" onPress={abrirNovo} style={{ marginBottom: 12 }} />
      <Campo placeholder="🔍 Filtrar por nome, RA ou email..." value={busca} onChangeText={setBusca} />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={filtrados}
        keyExtractor={a => String(a.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        keyboardShouldPersistTaps="handled"
        refreshing={atualizando}
        onRefresh={() => { setAtualizando(true); carregar(); }}
        ListHeaderComponent={topo}
        ListEmptyComponent={loading ? <Carregando /> : <Vazio texto="Nenhum aluno encontrado." />}
        renderItem={({ item: a }) => (
          <View style={[estilos.cartao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
            <Text style={{ color: cores.suave, fontSize: 12 }}>#{a.id}</Text>
            <Text style={{ color: cores.texto, fontWeight: '800', fontSize: 16 }}>{a.nome}</Text>
            <Text style={{ color: cores.suave }}>Usuário: {a.ra}</Text>
            <Text style={{ color: cores.suave }}>E-mail: {a.email || '-'}</Text>
            <Text style={{ color: cores.suave, fontSize: 12, marginBottom: 6 }}>📍 {a.unidade || '-'}</Text>
            <Selo texto={a.perfil === 'ADMIN' ? '⚙️ Admin' : '📚 Aluno'} tom={a.perfil === 'ADMIN' ? 'azul' : 'verde'} />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <Botao titulo="✏️ Editar" tipo="secundario" onPress={() => abrirEditar(a)} style={{ flex: 1, paddingVertical: 8 }} />
              <Botao titulo="🗑️ Excluir" tipo="perigo" onPress={() => pedirExclusao(a)} style={{ flex: 1, paddingVertical: 8 }} />
            </View>
          </View>
        )}
      />

      <Janela visivel={modal} aoFechar={() => setModal(false)} titulo={editId ? '✏️ Editar Aluno' : '➕ Novo Aluno'}>
        <Campo rotulo="Nome Completo" value={form.nome} onChangeText={campo('nome')} />
        <Campo rotulo="Usuário" value={form.ra} onChangeText={campo('ra')} autoCapitalize="none" autoCorrect={false} />
        <Campo rotulo={editId ? 'Senha (deixe vazio para não alterar)' : 'Senha'} value={form.senha}
          onChangeText={campo('senha')} secureTextEntry />
        <Campo rotulo="Email" value={form.email} onChangeText={campo('email')} keyboardType="email-address" autoCapitalize="none" />
        <Seletor rotulo="Unidade" valor={form.unidade} opcoes={NOMES_UNIDADES} onChange={campo('unidade')} />
        <Seletor rotulo="Perfil" valor={form.perfil} opcoes={PERFIS} onChange={campo('perfil')} />
        {erroForm ? <Text style={{ color: '#dc2626', marginBottom: 12 }}>⚠️ {erroForm}</Text> : null}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Botao titulo="Cancelar" tipo="secundario" onPress={() => setModal(false)} style={{ flex: 1 }} />
          <Botao titulo={salvando ? 'Salvando...' : 'Salvar Aluno'} onPress={salvar} desabilitado={salvando} style={{ flex: 1 }} />
        </View>
      </Janela>
    </View>
  );
}

const estilos = StyleSheet.create({
  titulo: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  cartao: { padding: 14, borderRadius: 14, borderWidth: 1 },
});
