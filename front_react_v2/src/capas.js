import capa1 from './assets/capas/capa-1.svg';
import capa2 from './assets/capas/capa-2.svg';
import capa3 from './assets/capas/capa-3.svg';
import capa4 from './assets/capas/capa-4.svg';
import capa5 from './assets/capas/capa-5.svg';
import capa6 from './assets/capas/capa-6.svg';

const CAPAS_GENERICAS = [capa1, capa2, capa3, capa4, capa5, capa6];

export function getCapaGenerica(livro = {}) {
  const texto = `${livro.titulo || ''}${livro.autor || ''}`;
  let hash = 0;
  for (let i = 0; i < texto.length; i++) hash = (hash * 31 + texto.charCodeAt(i)) >>> 0;
  return CAPAS_GENERICAS[hash % CAPAS_GENERICAS.length];
}

export function getCapaUrl(livro, imgBase) {
  if (livro?.imagemCapa) return `${imgBase}/${livro.imagemCapa}`;
  return getCapaGenerica(livro);
}
