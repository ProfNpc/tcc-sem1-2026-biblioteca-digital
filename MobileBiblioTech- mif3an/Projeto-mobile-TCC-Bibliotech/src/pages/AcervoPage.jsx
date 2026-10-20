import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { api } from '../services/api';
import { useTema } from '../theme';
import { useToast } from '../components/Toast';
import { Botao, Campo, Carregando, Vazio, Janela } from '../components/ui';
import CartaoLivro from '../components/CartaoLivro';
import { contem } from '../utils';

export default function AcervoPage({ usuario, unidade }) {
  const { cores } = useTema();
  const [livros, setLivros] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [modalLivro, setModalLivro] = useState(null);
  const [reservando, setReservando] = useState(false);
  const toast = useToast();

  function carregar() {
    // Filtra na API pela unidade do aluno logado: nunca mostra livro de outro polo.
    api.getLivros(unidade)
      .then(setLivros)
      .catch(() => toast('⚠️ Erro de conexão com o servidor.'))
      .finally(() => { setLoading(false); setAtualizando(false); });
  }

  useEffect(() => { setLoading(true); carregar(); }, [unidade]);

  const livrosFiltrados = livros.filter(l => contem(l.titulo, busca) || contem(l.autor, busca));

  async function confirmarReserva() {
    setReservando(true);
    try {
      const resp = await api.criarEmprestimo({ nomeAluno: usuario, tituloLivro: modalLivro.titulo });
      if (resp.ok) {
        toast(`✅ Reserva confirmada! Retire no polo ${modalLivro.unidade} dentro do prazo informado.`);
      } else {
        const msg = await resp.text().catch(() => '');
        toast(`⚠️ ${msg || 'Não foi possível reservar. Tente novamente.'}`);
      }
      setModalLivro(null);
      carregar();
    } catch {
      setModalLivro(null);
      toast('⚠️ Erro de conexão com o servidor.');
    }
    setReservando(false);
  }

  const topo = (
    <View>
      <Text style={[estilos.titulo, { color: cores.titulo }]}>Catálogo de Livros</Text>
      <Campo placeholder="🔍 Buscar por título ou autor..." value={busca} onChangeText={setBusca} />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={livrosFiltrados}
        keyExtractor={l => String(l.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        keyboardShouldPersistTaps="handled"
        refreshing={atualizando}
        onRefresh={() => { setAtualizando(true); carregar(); }}
        ListHeaderComponent={topo}
        ListEmptyComponent={loading ? <Carregando texto="Carregando acervo..." /> : <Vazio texto="Nenhum livro encontrado." />}
        renderItem={({ item }) => (
          <CartaoLivro livro={item}>
            <Text style={{ color: cores.suave, fontSize: 12 }}>
              {item.quantidadeDisponivel ?? 0} de {item.quantidadeTotal ?? 1} exemplares disponíveis
            </Text>
            <Botao
              titulo={item.disponivel ? '📌 Reservar' : 'Indisponível'}
              desabilitado={!item.disponivel}
              onPress={() => setModalLivro(item)}
              style={{ marginTop: 8 }}
            />
          </CartaoLivro>
        )}
      />

      <Janela visivel={!!modalLivro} aoFechar={() => setModalLivro(null)} titulo="📌 Confirmar Reserva">
        <Text style={{ color: cores.texto, marginBottom: 16 }}>
          Você está reservando: <Text style={{ fontWeight: '800' }}>{modalLivro?.titulo}</Text>
        </Text>
        <Text style={{ color: cores.suave, fontSize: 13, fontWeight: '600' }}>Polo de Retirada</Text>
        <Text style={{ color: cores.texto, fontWeight: '700', marginTop: 4 }}>📍 {modalLivro?.unidade}</Text>
        <Text style={{ color: cores.suave, fontSize: 12, marginTop: 4, marginBottom: 20 }}>
          A reserva ficará segurada por 1 dia. Depois da retirada, o empréstimo terá prazo próprio de devolução.
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Botao titulo="Cancelar" tipo="secundario" onPress={() => setModalLivro(null)} style={{ flex: 1 }} />
          <Botao titulo={reservando ? 'Reservando...' : 'Confirmar'} onPress={confirmarReserva} desabilitado={reservando} style={{ flex: 1 }} />
        </View>
      </Janela>
    </View>
  );
}

const estilos = StyleSheet.create({
  titulo: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
});
