import { View, Text, StyleSheet } from 'react-native';
import { useTema } from '../theme';
import CapaLivro from './CapaLivro';
import { Selo } from './ui';

// Cartão de um livro: capa à esquerda, dados à direita.
// O que vier entre <CartaoLivro> ... </CartaoLivro> (children) aparece no fim do cartão:
// no catálogo público é o botão "Entrar para Reservar", no acervo é "Reservar".
export default function CartaoLivro({ livro, children }) {
  const { cores } = useTema();
  return (
    <View style={[estilos.cartao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
      <CapaLivro livro={livro} />
      <View style={estilos.info}>
        <Selo texto={livro.disponivel ? 'Disponível' : 'Emprestado'} tom={livro.disponivel ? 'verde' : 'vermelho'} />
        <Text style={[estilos.titulo, { color: cores.texto }]}>{livro.titulo}</Text>
        <Text style={{ color: cores.suave }}>Autor: {livro.autor}</Text>
        <Text style={{ color: cores.suave }}>Ano: {livro.anoPublicacao}</Text>
        {livro.unidade ? <Text style={{ color: cores.suave, fontSize: 12 }}>📍 {livro.unidade}</Text> : null}
        {children}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1 },
  info: { flex: 1, gap: 3 },
  titulo: { fontSize: 16, fontWeight: '800', marginTop: 4 },
});
