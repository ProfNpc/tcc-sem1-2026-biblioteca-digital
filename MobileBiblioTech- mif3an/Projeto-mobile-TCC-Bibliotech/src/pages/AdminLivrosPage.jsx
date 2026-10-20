import { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
import { api } from '../services/api';
import { useTema } from '../theme';
import { useToast } from '../components/Toast';
import { NOMES_UNIDADES } from '../constants/unidades';
import { Botao, Campo, Seletor, Selo, Carregando, Vazio, Janela } from '../components/ui';
import CapaLivro from '../components/CapaLivro';
import { contem } from '../utils';

const VAZIO = { titulo: '', autor: '', anoPublicacao: '', isbn: '', unidade: NOMES_UNIDADES[0], quantidadeTotal: '1' };

export default function AdminLivrosPage() {
  const { cores } = useTema();
  const [livros, setLivros] = useState([]);
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
    api.getLivros()
      .then(setLivros)
      .catch(() => toast('⚠️ Erro ao carregar o acervo.'))
      .finally(() => { setLoading(false); setAtualizando(false); });
  }
  useEffect(() => { carregar(); }, []);

  const campo = (nome) => (valor) => setForm(f => ({ ...f, [nome]: valor }));

  function abrirNovo() {
    setForm(VAZIO); setEditId(null); setErroForm(''); setModal(true);
  }

  function abrirEditar(livro) {
    setForm({
      titulo: livro.titulo || '',
      autor: livro.autor || '',
      anoPublicacao: String(livro.anoPublicacao ?? ''),
      isbn: livro.isbn || '',
      unidade: livro.unidade || NOMES_UNIDADES[0],
      quantidadeTotal: String(livro.quantidadeTotal ?? 1),
    });
    setEditId(livro.id); setErroForm(''); setModal(true);
  }

  async function salvar() {
    if (!form.titulo.trim() || !form.autor.trim() || !form.anoPublicacao.trim()) {
      setErroForm('Preencha título, autor e ano de publicação.');
      return;
    }
    setSalvando(true); setErroForm('');
    try {
      const dados = {
        ...form,
        anoPublicacao: Number(form.anoPublicacao),
        quantidadeTotal: Number(form.quantidadeTotal) || 1,
      };
      if (editId) {
        await api.editarLivro(editId, dados);
        toast('✅ Livro atualizado com sucesso!');
      } else {
        await api.criarLivro(dados);
        toast('✅ Livro cadastrado com sucesso!');
      }
      setModal(false);
      carregar();
    } catch (erro) {
      // O erro aparece DENTRO da janela: um toast ficaria escondido atrás dela.
      setErroForm(erro.message || 'Erro ao salvar livro.');
    }
    setSalvando(false);
  }

  function pedirExclusao(l) {
    Alert.alert('Confirmar Exclusão', `Deseja excluir o livro ${l.titulo}?`, [
      { text: 'Voltar', style: 'cancel' },
      { text: 'Sim, Excluir', style: 'destructive', onPress: () => excluir(l.id) },
    ]);
  }

  async function excluir(id) {
    try {
      const resp = await api.deletarLivro(id);
      if (resp.ok) { toast('🗑️ Livro excluído.'); carregar(); }
      else toast('⚠️ Erro ao excluir.');
    } catch { toast('⚠️ Erro de conexão com o servidor.'); }
  }

  const filtrados = livros.filter(l => contem(l.titulo, busca) || contem(l.autor, busca) || contem(l.isbn, busca));

  const topo = (
    <View>
      <Text style={[estilos.titulo, { color: cores.titulo }]}>Controle de Acervo</Text>
      <Botao titulo="+ Novo Livro" onPress={abrirNovo} style={{ marginBottom: 12 }} />
      <Campo placeholder="🔍 Filtrar por título, autor ou ISBN..." value={busca} onChangeText={setBusca} />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={filtrados}
        keyExtractor={l => String(l.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        keyboardShouldPersistTaps="handled"
        refreshing={atualizando}
        onRefresh={() => { setAtualizando(true); carregar(); }}
        ListHeaderComponent={topo}
        ListEmptyComponent={loading ? <Carregando /> : <Vazio texto="Nenhum livro encontrado." />}
        renderItem={({ item: l }) => (
          <View style={[estilos.cartao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
            <CapaLivro livro={l} style={{ width: 54, height: 76 }} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: cores.suave, fontSize: 12 }}>#{l.id}</Text>
              <Text style={{ color: cores.texto, fontWeight: '800', fontSize: 15 }}>{l.titulo}</Text>
              <Text style={{ color: cores.suave }}>{l.autor} • {l.anoPublicacao}</Text>
              <Text style={{ color: cores.suave, fontSize: 12 }}>📍 {l.unidade || 'Não definida'}</Text>
              <Selo texto={`Estoque: ${l.quantidadeDisponivel ?? 0} / ${l.quantidadeTotal ?? 1}`} tom={l.disponivel ? 'verde' : 'vermelho'} />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <Botao titulo="✏️ Editar" tipo="secundario" onPress={() => abrirEditar(l)} style={{ flex: 1, paddingVertical: 8 }} />
                <Botao titulo="🗑️ Excluir" tipo="perigo" onPress={() => pedirExclusao(l)} style={{ flex: 1, paddingVertical: 8 }} />
              </View>
            </View>
          </View>
        )}
      />

      <Janela visivel={modal} aoFechar={() => setModal(false)} titulo={editId ? '✏️ Editar Livro' : '➕ Novo Livro'}>
        <Campo rotulo="Título" value={form.titulo} onChangeText={campo('titulo')} />
        <Campo rotulo="Autor" value={form.autor} onChangeText={campo('autor')} />
        <Campo rotulo="Ano de Publicação" value={form.anoPublicacao} onChangeText={campo('anoPublicacao')} keyboardType="numeric" />
        <Campo rotulo="ISBN" value={form.isbn} onChangeText={campo('isbn')} />
        <Seletor rotulo="Unidade" valor={form.unidade} opcoes={NOMES_UNIDADES} onChange={campo('unidade')} />
        <Campo rotulo="Qtd. de Exemplares" value={form.quantidadeTotal} onChangeText={campo('quantidadeTotal')} keyboardType="numeric" />
        {erroForm ? <Text style={{ color: '#dc2626', marginBottom: 12 }}>⚠️ {erroForm}</Text> : null}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Botao titulo="Cancelar" tipo="secundario" onPress={() => setModal(false)} style={{ flex: 1 }} />
          <Botao titulo={salvando ? 'Salvando...' : 'Salvar Livro'} onPress={salvar} desabilitado={salvando} style={{ flex: 1 }} />
        </View>
      </Janela>
    </View>
  );
}

const estilos = StyleSheet.create({
  titulo: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  cartao: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1 },
});
