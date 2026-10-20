import { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, Pressable, Linking, StyleSheet } from 'react-native';
import { api } from '../services/api';
import { POLOS } from '../constants/unidades';
import { useTema } from '../theme';
import { Botao, Carregando, Vazio } from '../components/ui';
import CartaoLivro from '../components/CartaoLivro';

export default function CatalogoPage({ onIrParaLogin }) {
  const { cores } = useTema();
  const [livros, setLivros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [semConexao, setSemConexao] = useState(false);

  function carregar() {
    setSemConexao(false);
    api.getLivros()
      .then(setLivros)
      .catch(() => { setLivros([]); setSemConexao(true); })
      .finally(() => { setLoading(false); setAtualizando(false); });
  }

  useEffect(() => { carregar(); }, []);

  // No React abria um iframe do Google Maps. No celular, abrimos o app de mapas.
  function abrirMapa(endereco) {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`);
  }

  const topo = (
    <View>
      <View style={[estilos.hero, { backgroundColor: cores.cabecalho }]}>
        <Text style={estilos.heroTitulo}>Bem-vindo à BiblioTech</Text>
        <Text style={estilos.heroTexto}>O acervo digital dos Institutos Técnicos de Barueri. Faça login para reservar.</Text>
      </View>
      <Text style={[estilos.secao, { color: cores.titulo }]}>📚 Destaques do Acervo</Text>
    </View>
  );

  const rodape = (
    <View style={{ marginTop: 12 }}>
      <Text style={[estilos.secao, { color: cores.titulo }]}>Nossos Polos Parceiros</Text>
      {POLOS.map(polo => (
        <Pressable key={polo.nome} onPress={() => abrirMapa(polo.endereco)}
          style={[estilos.polo, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
          <Image source={polo.img} style={estilos.poloImg} resizeMode="cover" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: cores.texto, fontWeight: '800' }}>{polo.nome}</Text>
            <Text style={{ color: cores.suave, marginTop: 2 }}>📍 {polo.bairro}</Text>
            <Text style={{ color: cores.primaria, fontWeight: '600', marginTop: 2 }}>Ver como chegar →</Text>
          </View>
        </Pressable>
      ))}
      <Text style={{ color: cores.suave, textAlign: 'center', marginTop: 16, fontSize: 12 }}>
        © 2026 BiblioTech — Instituto Técnico de Barueri
      </Text>
    </View>
  );

  return (
    <FlatList
      data={livros}
      keyExtractor={l => String(l.id)}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      refreshing={atualizando}
      onRefresh={() => { setAtualizando(true); carregar(); }}
      ListHeaderComponent={topo}
      ListFooterComponent={rodape}
      ListEmptyComponent={
        loading ? <Carregando texto="Carregando livros..." />
          : semConexao ? <Vazio texto="⚠️ Não foi possível falar com o servidor. Confira se o back está ligado e o IP em src/config.jsx." />
          : <Vazio texto="Nenhum livro no acervo." />
      }
      renderItem={({ item }) => (
        <CartaoLivro livro={item}>
          <Botao titulo="🔐 Entrar para Reservar" onPress={onIrParaLogin} style={{ marginTop: 8 }} />
        </CartaoLivro>
      )}
    />
  );
}

const estilos = StyleSheet.create({
  hero: { borderRadius: 16, padding: 20, marginBottom: 16 },
  heroTitulo: { color: '#fff', fontSize: 24, fontWeight: '800' },
  heroTexto: { color: '#bfdbfe', marginTop: 6, lineHeight: 20 },
  secao: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  polo: { flexDirection: 'row', gap: 12, padding: 10, borderRadius: 14, borderWidth: 1, marginBottom: 10, alignItems: 'center' },
  poloImg: { width: 76, height: 76, borderRadius: 10 },
});
