import { createContext, useContext } from 'react';
import { Platform, StatusBar } from 'react-native';

// Paletas de cor. No React web isso era feito com CSS (classe "dark-mode");
// no mobile não existe CSS, então guardamos as cores em objetos JavaScript.
export const CLARO = {
  fundo: '#f1f5f9', cartao: '#ffffff', texto: '#1e293b', suave: '#64748b',
  primaria: '#2563eb', titulo: '#1e3a8a', borda: '#e2e8f0', input: '#ffffff',
  cabecalho: '#1e3a8a', perigo: '#ef4444', sucesso: '#16a34a',
  selo: {
    verde: { fundo: '#dcfce7', texto: '#166534' },
    vermelho: { fundo: '#fee2e2', texto: '#991b1b' },
    azul: { fundo: '#dbeafe', texto: '#1e40af' },
    laranja: { fundo: '#ffedd5', texto: '#9a3412' },
    cinza: { fundo: '#e2e8f0', texto: '#334155' },
  },
};

export const ESCURO = {
  fundo: '#0f172a', cartao: '#1e293b', texto: '#e2e8f0', suave: '#94a3b8',
  primaria: '#3b82f6', titulo: '#93c5fd', borda: '#334155', input: '#0f172a',
  cabecalho: '#172554', perigo: '#ef4444', sucesso: '#22c55e',
  selo: {
    verde: { fundo: '#14532d', texto: '#bbf7d0' },
    vermelho: { fundo: '#7f1d1d', texto: '#fecaca' },
    azul: { fundo: '#1e3a8a', texto: '#bfdbfe' },
    laranja: { fundo: '#7c2d12', texto: '#fed7aa' },
    cinza: { fundo: '#334155', texto: '#e2e8f0' },
  },
};

// Contexto: um "canal" para qualquer tela ler o tema atual sem receber por props.
export const TemaContext = createContext({ cores: CLARO, escuro: false, alternar: () => {} });
export function useTema() { return useContext(TemaContext); }

// Espaço para não ficar embaixo da barra de status (relógio/bateria) e da barra inferior.
export const TOPO_SEGURO = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 50;
export const BASE_SEGURA = Platform.OS === 'ios' ? 20 : 0;
