import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, Modal, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useTema } from '../theme';

// BOTÃO. tipo: 'primario' | 'secundario' | 'perigo' | 'sucesso'
export function Botao({ titulo, onPress, tipo = 'primario', desabilitado = false, style }) {
  const { cores } = useTema();
  const fundo = { primario: cores.primaria, perigo: cores.perigo, sucesso: cores.sucesso, secundario: 'transparent' }[tipo];
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      style={[estilos.botao, { backgroundColor: fundo, borderColor: tipo === 'secundario' ? cores.borda : fundo, opacity: desabilitado ? 0.5 : 1 }, style]}
    >
      <Text style={[estilos.botaoTexto, { color: tipo === 'secundario' ? cores.texto : '#fff' }]}>{titulo}</Text>
    </Pressable>
  );
}

// CAMPO DE TEXTO com rótulo em cima (o <label> + <input> do HTML)
export function Campo({ rotulo, style, ...props }) {
  const { cores } = useTema();
  return (
    <View style={estilos.campo}>
      {rotulo ? <Text style={[estilos.rotulo, { color: cores.suave }]}>{rotulo}</Text> : null}
      <TextInput
        placeholderTextColor={cores.suave}
        {...props}
        style={[estilos.input, { backgroundColor: cores.input, color: cores.texto, borderColor: cores.borda }, style]}
      />
    </View>
  );
}

// SELETOR (o <select> do HTML). opcoes: lista de textos OU de { valor, rotulo }.
export function Seletor({ rotulo, valor, opcoes, onChange }) {
  const { cores } = useTema();
  const [aberto, setAberto] = useState(false);
  const lista = opcoes.map(o => (typeof o === 'string' ? { valor: o, rotulo: o } : o));
  const atual = lista.find(o => o.valor === valor);

  return (
    <View style={estilos.campo}>
      {rotulo ? <Text style={[estilos.rotulo, { color: cores.suave }]}>{rotulo}</Text> : null}
      <Pressable
        onPress={() => setAberto(a => !a)}
        style={[estilos.input, estilos.seletor, { backgroundColor: cores.input, borderColor: cores.borda }]}
      >
        <Text style={{ color: cores.texto, flex: 1 }}>{atual ? atual.rotulo : 'Selecione...'}</Text>
        <Text style={{ color: cores.suave }}>{aberto ? '▲' : '▼'}</Text>
      </Pressable>
      {aberto && (
        <View style={[estilos.opcoes, { borderColor: cores.borda, backgroundColor: cores.cartao }]}>
          {lista.map(o => (
            <Pressable
              key={o.valor}
              onPress={() => { onChange(o.valor); setAberto(false); }}
              style={[estilos.opcao, { borderBottomColor: cores.borda }]}
            >
              <Text style={{ color: o.valor === valor ? cores.primaria : cores.texto, fontWeight: o.valor === valor ? '700' : '400' }}>
                {o.rotulo}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// SELO colorido (as etiquetas "Disponível", "Reservado"...). tom: verde | vermelho | azul | laranja | cinza
export function Selo({ texto, tom = 'cinza' }) {
  const { cores } = useTema();
  const c = cores.selo[tom] || cores.selo.cinza;
  return (
    <View style={[estilos.selo, { backgroundColor: c.fundo }]}>
      <Text style={{ color: c.texto, fontSize: 12, fontWeight: '700' }}>{texto}</Text>
    </View>
  );
}

// Linha "Rótulo: valor" dos cartões de reserva
export function Linha({ rotulo, valor }) {
  const { cores } = useTema();
  return (
    <Text style={{ color: cores.suave, fontSize: 13, marginTop: 2 }}>
      {rotulo}: <Text style={{ color: cores.texto }}>{valor}</Text>
    </Text>
  );
}

export function Carregando({ texto = 'Carregando...' }) {
  const { cores } = useTema();
  return (
    <View style={{ padding: 30, alignItems: 'center', gap: 10 }}>
      <ActivityIndicator color={cores.primaria} />
      <Text style={{ color: cores.suave }}>{texto}</Text>
    </View>
  );
}

export function Vazio({ texto }) {
  const { cores } = useTema();
  return <Text style={{ color: cores.suave, textAlign: 'center', padding: 30 }}>{texto}</Text>;
}

// JANELA (o "modal" do React): caixa central sobre um fundo escuro.
export function Janela({ visivel, aoFechar, titulo, children }) {
  const { cores } = useTema();
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={aoFechar}>
      <KeyboardAvoidingView style={estilos.sombra} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable style={StyleSheet.absoluteFill} onPress={aoFechar} />
        <View style={[estilos.janela, { backgroundColor: cores.cartao }]}>
          <Text style={[estilos.janelaTitulo, { color: cores.titulo }]}>{titulo}</Text>
          <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  botao: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  botaoTexto: { fontWeight: '700', fontSize: 15 },
  campo: { marginBottom: 14 },
  rotulo: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  seletor: { flexDirection: 'row', alignItems: 'center' },
  opcoes: { borderWidth: 1, borderRadius: 10, marginTop: 6, overflow: 'hidden' },
  opcao: { padding: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  selo: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  sombra: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 20 },
  janela: { borderRadius: 16, padding: 20, maxHeight: '88%' },
  janelaTitulo: { fontSize: 20, fontWeight: '800', marginBottom: 16 },
});
