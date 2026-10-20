// Funções pequenas usadas em mais de uma tela.

// "2026-09-28" ou "2026-09-28T10:00:00" -> "28/09/2026"
export function formatarData(dateStr) {
  if (!dateStr) return '-';
  return dateStr.split('T')[0].split('-').reverse().join('/');
}

// true se o texto contém a busca, ignorando maiúsculas e valores nulos
export function contem(texto, busca) {
  return (texto || '').toLowerCase().includes(busca.toLowerCase());
}

// Situação de uma reserva/empréstimo ATIVO (mesma regra das telas do React)
export function situacaoAtiva(r) {
  const hoje = new Date();
  const limiteReserva = r.dataLimiteReserva ? new Date(`${r.dataLimiteReserva}T23:59:59`) : null;
  const limiteDevolucao = r.dataDevolucao ? new Date(`${r.dataDevolucao}T23:59:59`) : null;

  if (r.status === 'RESERVADO') {
    return limiteReserva && hoje > limiteReserva
      ? { texto: '🔴 Reserva vencida', tom: 'vermelho' }
      : { texto: '🟢 Reservado', tom: 'verde' };
  }
  if (r.status === 'RETIRADO') {
    return limiteDevolucao && hoje > limiteDevolucao
      ? { texto: '🔴 Em atraso', tom: 'vermelho' }
      : { texto: '🔵 Retirado', tom: 'azul' };
  }
  return { texto: r.status, tom: 'cinza' };
}

// Situação de um registro do HISTÓRICO
export function situacaoHistorico(r) {
  if (r.status === 'DEVOLVIDO') return { texto: `🟢 Devolvido em ${formatarData(r.dataDevolucaoReal)}`, tom: 'verde' };
  if (r.status === 'EXPIRADO') return { texto: '🟠 Reserva expirada', tom: 'laranja' };
  return { texto: '🔴 Cancelado', tom: 'vermelho' };
}
