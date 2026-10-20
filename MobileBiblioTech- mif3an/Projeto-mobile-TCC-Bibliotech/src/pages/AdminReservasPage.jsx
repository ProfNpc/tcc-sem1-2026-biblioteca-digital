import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { api } from '../services/api';
import { useTema } from '../theme';
import { useToast } from '../components/Toast';
import { Botao, Campo, Selo, Linha, Carregando, Vazio } from '../components/ui';
import { contem, formatarData, situacaoAtiva, situacaoHistorico } from '../utils';

export default function AdminReservasPage() {
  const { cores } = useTema();
  const [stats, setStats] = useState({});
  const [reservas, setReservas] = useState([]);
  const [busca, setBusca] = useState('');
  const [historico, setHistorico] = useState(false);
  const [loading, setLoading] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const toast = useToast();

  function carregar() {
    // Primeiro as reservas: essa consulta também expira, no servidor, as reservas
    // vencidas. Só depois pedimos as estatísticas, já refletindo o estado atualizado.
    const chamada = historico ? api.getHistoricoEmprestimos() : api.getEmprestimos();
    chamada
      .then(lista => setReservas([...lista].sort((a, b) => (a.nomeAluno || '').localeCompare(b.nomeAluno || ''))))
      .catch(() => toast('⚠️ Erro ao carregar as reservas.'))
      .finally(() => { setLoading(false); setAtualizando(false); });
    chamada.then(() => api.getStats()).then(setStats).catch(() => {});
  }

  useEffect(() => { setLoading(true); carregar(); }, [historico]);

  async function confirmarEntrega(r) {
    try {
      const resp = await api.confirmarEntrega(r.id);
      const texto = await resp.text().catch(() => '');
      if (resp.ok) {
        toast(`✅ Livro '${r.tituloLivro}' entregue para ${r.nomeAluno}! Prazo de devolução iniciado.`);
        carregar();
      } else {
        toast(`⚠️ ${texto || 'Erro ao confirmar retirada.'}`);
      }
    } catch { toast('⚠️ Erro de conexão com o servidor.'); }
  }

  async function confirmarDevolucao(r) {
    try {
      const resp = await api.confirmarDevolucao(r.id);
      const texto = await resp.text().catch(() => '');
      if (resp.ok) {
        toast(`✅ '${r.tituloLivro}' devolvido e disponível novamente!`);
        carregar();
      } else {
        toast(`⚠️ ${texto || 'Erro ao confirmar devolução.'}`);
      }
    } catch { toast('⚠️ Erro de conexão com o servidor.'); }
  }

  const filtradas = reservas.filter(r =>
    contem(r.nomeAluno, busca) || contem(r.tituloLivro, busca) || contem(r.poloRetirada, busca)
  );

  const cartoesStats = [
    { icone: '📚', valor: stats.totalLivros, rotulo: 'Total no Acervo' },
    { icone: '✅', valor: stats.totalDisponiveis, rotulo: 'Disponíveis Agora' },
    { icone: '👥', valor: stats.totalAlunos, rotulo: 'Alunos na Base' },
    { icone: '📌', valor: stats.totalEmprestimos, rotulo: 'Reservas e Empréstimos Ativos' },
  ];

  const topo = (
    <View>
      <View style={estilos.grade}>
        {cartoesStats.map(c => (
          <View key={c.rotulo} style={[estilos.dash, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
            <Text style={{ fontSize: 22 }}>{c.icone}</Text>
            <Text style={{ color: cores.titulo, fontSize: 24, fontWeight: '800' }}>{c.valor ?? '...'}</Text>
            <Text style={{ color: cores.suave, fontSize: 12 }}>{c.rotulo}</Text>
          </View>
        ))}
      </View>
      <Text style={[estilos.titulo, { color: cores.titulo }]}>
        {historico ? 'Histórico de Empréstimos' : 'Gestão de Reservas e Empréstimos'}
      </Text>
      <Botao titulo={historico ? '← Voltar às Reservas' : '📚 Ver Histórico'} tipo="secundario"
        onPress={() => setHistorico(h => !h)} style={{ marginBottom: 12 }} />
      <Campo placeholder="🔍 Filtrar por aluno, livro ou polo..." value={busca} onChangeText={setBusca} />
    </View>
  );

  return (
    <FlatList
      data={filtradas}
      keyExtractor={r => String(r.id)}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      keyboardShouldPersistTaps="handled"
      refreshing={atualizando}
      onRefresh={() => { setAtualizando(true); carregar(); }}
      ListHeaderComponent={topo}
      ListEmptyComponent={loading ? <Carregando /> : <Vazio texto="Nenhum registro encontrado." />}
      renderItem={({ item: r }) => {
        const situacao = historico ? situacaoHistorico(r) : situacaoAtiva(r);
        return (
          <View style={[estilos.cartao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
            <Text style={{ color: cores.texto, fontSize: 16, fontWeight: '800' }}>{r.nomeAluno}</Text>
            <Text style={{ color: cores.texto, marginBottom: 6 }}>{r.tituloLivro}</Text>
            <Selo texto={situacao.texto} tom={situacao.tom} />
            <View style={{ marginTop: 8 }}>
              <Linha rotulo="Polo" valor={r.poloRetirada || 'Não informado'} />
              <Linha rotulo="Reserva" valor={`${formatarData(r.dataReserva)}${r.status === 'RESERVADO' ? ` (até ${formatarData(r.dataLimiteReserva)})` : ''}`} />
              <Linha rotulo="Retirada" valor={formatarData(r.dataRetirada)} />
              <Linha rotulo="Devolução prevista" valor={formatarData(r.dataDevolucao)} />
            </View>
            {!historico && r.status === 'RESERVADO' && (
              <Botao titulo="✅ Entregar" tipo="sucesso" onPress={() => confirmarEntrega(r)} style={{ marginTop: 10 }} />
            )}
            {!historico && r.status === 'RETIRADO' && (
              <Botao titulo="↩️ Devolvido" onPress={() => confirmarDevolucao(r)} style={{ marginTop: 10 }} />
            )}
          </View>
        );
      }}
    />
  );
}

const estilos = StyleSheet.create({
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  dash: { width: '48%', padding: 12, borderRadius: 14, borderWidth: 1 },
  titulo: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
  cartao: { padding: 14, borderRadius: 14, borderWidth: 1 },
});
