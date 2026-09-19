import { useState } from 'react';
import { IMG_BASE } from '../services/api';
import { getCapaGenerica } from '../capas';

export default function CapaLivro({ livro, className = '', style, alt = 'Capa do livro', ...props }) {
  const [falhou, setFalhou] = useState(false);
  const src = !falhou && livro?.imagemCapa
    ? `${IMG_BASE}/${livro.imagemCapa}`
    : getCapaGenerica(livro);

  return (
    <img
      {...props}
      className={className}
      src={src}
      alt={alt}
      style={style}
      onError={() => setFalhou(true)}
    />
  );
}
