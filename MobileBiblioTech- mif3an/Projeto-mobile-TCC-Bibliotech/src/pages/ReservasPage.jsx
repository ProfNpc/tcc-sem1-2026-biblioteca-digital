import { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
import { api } from '../services/api';
import { useTema } from '../theme';
import { useToast } from '../components/Toast';
import { Botao, Selo, Linha, Carregando, Vazio } from '../components/ui';
import { formatarData, situacaoAtiva, situacaoHistorico } from '../utils';

export default function ReservasPage({ usuario }) {
  const { cores } = useTema();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [historico, setHistorico] = useState(false);
  const toast = useToast();

  function carregar() {
    const chamada = historico ? api.getHistoricoPorAluno(usuario) : api.getEmprestimosPorAluno(usuario);
    chamada
      .then(setReservas)
      .catch(() => { setReservas([]); toast('⚠️ Erro de conexão com o servidor.'); })
      .finally(() => { setLoading(false); setAtualizando(false); });
  }

  useEffect(() => { setLoading(true); carregar(); }, [usuario, historico]);

  // No React era um modal de confirmação; no celular usamos o alerta nativo.
  function pedirCancelamento(r) {
    Alert.alert('Confirmar Cancelamento', `Deseja cancelar a reserva de ${r.tituloLivro}?`, [
      { text: 'Voltar', style: 'cancel' },
      { text: 'Sim, Cancelar', style: 'destructive', onPress: () => cancelar(r.id) },
    ]);
  }

  async function cancelar(id) {
    try {
      const resp = await api.cancelarEmprestimo(id);
      const texto = await resp.text().catch(() => '');
      if (resp.ok) {
        toast('✅ Reserva cancelada com sucesso!');
        carregar();
      } else {
        toast(`⚠️ ${texto || 'Não foi possível cancelar esta reserva.'}`);
      }
    } catch {
      toast('⚠️ Erro de conexão com o servidor.');
    }
  }

  const topo = (
    <View style={{ marginBottom: 4 }}>
      <Text style={[estilos.titulo, { color: cores.titulo }]}>
        {historico ? '📚 Histórico de Empréstimos' : '📋 Minhas Reservas e Empréstimos'}
      </Text>
      <Botao titulo={historico ? '← Voltar às Reservas' : '📚 Ver Histórico'} tipo="secundario" onPress={() => setHistorico(h => !h)} />
    </View>
  );

  return (
    <FlatList
      data={reservas}
      keyExtractor={r => String(r.id)}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      refreshing={atualizando}
      onRefresh={() => { setAtualizando(true); carregar(); }}
      ListHeaderComponent={topo}
      ListEmptyComponent={loading ? <Carregando /> : <Vazio texto="Nenhum registro encontrado." />}
      renderItem={({ item: r }) => {
        const situacao = historico ? situacaoHistorico(r) : situacaoAtiva(r);
        return (
          <View style={[estilos.cartao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
            <Text style={{ color: cores.texto, fontSize: 16, fontWeight: '800', marginBottom: 6 }}>{r.tituloLivro}</Text>
            <Selo texto={situacao.texto} tom={situacao.tom} />
            <View style={{ marginTop: 8 }}>
              <Linha rotulo="Reserva" valor={`${formatarData(r.dataReserva)}${r.status === 'RESERVADO' && r.dataLimiteReserva ? ` (até ${formatarData(r.dataLimiteReserva)})` : ''}`} />
              <Linha rotulo="Retirada" valor={formatarData(r.dataRetirada)} />
              <Linha rotulo="Devolução prevista" valor={formatarData(r.dataDevolucao)} />
              <Linha rotulo="Polo" valor={r.poloRetirada || 'Não informado'} />
            </View>
            {!historico && r.status === 'RESERVADO' && (
              <Botao titulo="✕ Cancelar reserva" tipo="perigo" onPress={() => pedirCancelamento(r)} style={{ marginTop: 10 }} />
            )}
            {!historico && r.status === 'RETIRADO' && (
              <Text style={{ color: cores.suave, fontSize: 12, marginTop: 10 }}>Aguardando devolução</Text>
            )}
          </View>
        );
      }}
    />
  );
}

const estilos = StyleSheet.create({
  titulo: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  cartao: { padding: 14, borderRadius: 14, borderWidth: 1 },
});
