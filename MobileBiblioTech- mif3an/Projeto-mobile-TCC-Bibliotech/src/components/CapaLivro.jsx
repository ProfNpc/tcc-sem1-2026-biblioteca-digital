import { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { IMG_BASE } from '../services/api';

// No React as capas genéricas eram 6 arquivos SVG. O React Native não desenha SVG
// sem biblioteca extra, então aqui cada "capa genérica" é uma combinação de 2 cores.
const CAPAS_GENERICAS = [
  { fundo: '#172554', destaque: '#c4b5fd' },
  { fundo: '#0f172a', destaque: '#22d3ee' },
  { fundo: '#4c0519', destaque: '#fbcfe8' },
  { fundo: '#422006', destaque: '#fffbeb' },
  { fundo: '#052e16', destaque: '#86efac' },
  { fundo: '#1e1b4b', destaque: '#fef3c7' },
];

// Mesma conta do React: título+autor viram um número, e o número escolhe a capa.
// Assim o mesmo livro sempre recebe a mesma cor.
export function getCapaGenerica(livro = {}) {
  const texto = `${livro.titulo || ''}${livro.autor || ''}`;
  let hash = 0;
  for (let i = 0; i < texto.length; i++) hash = (hash * 31 + texto.charCodeAt(i)) >>> 0;
  return CAPAS_GENERICAS[hash % CAPAS_GENERICAS.length];
}

export default function CapaLivro({ livro, style }) {
  const [falhou, setFalhou] = useState(false);

  // Tem imagem enviada pelo admin e ela carregou? Mostra a foto do servidor.
  if (livro?.imagemCapa && !falhou) {
    return (
      <Image
        source={{ uri: `${IMG_BASE}/${livro.imagemCapa}` }}
        style={[estilos.capa, style]}
        resizeMode="cover"
        onError={() => setFalhou(true)}
      />
    );
  }

  // Senão, desenha a capa genérica com a inicial do título.
  const capa = getCapaGenerica(livro);
  return (
    <View style={[estilos.capa, style, { backgroundColor: capa.fundo }]}>
      <Text style={{ color: capa.destaque, fontSize: 34, fontWeight: '800' }}>
        {(livro?.titulo || '?').charAt(0).toUpperCase()}
      </Text>
      <Text style={{ color: capa.destaque, fontSize: 8, letterSpacing: 1, marginTop: 4 }}>BIBLIOTECH</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  capa: { width: 90, height: 130, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
